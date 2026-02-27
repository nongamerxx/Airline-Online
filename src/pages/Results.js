import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { useLocation, useNavigate } from "react-router-dom";

function Results() {
  const [flights, setFlights] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const selectedCountry = queryParams.get("country");
  const selectedDate = queryParams.get("date");

  useEffect(() => {
    const fetchFlights = async () => {
      const snapshot = await getDocs(collection(db, "flights"));

      let data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const today = new Date();

      data = data.filter(flight => {
        if (!flight.country || !flight.departDate) return false;

        let flightDate;
        if (flight.departDate.seconds) {
          flightDate = new Date(flight.departDate.seconds * 1000);
        } else {
          flightDate = new Date(flight.departDate);
        }

        return (
          flight.country === selectedCountry &&
          flightDate >= new Date(selectedDate) &&
          flightDate >= today
        );
      });

      setFlights(data);
    };

    fetchFlights();
  }, [selectedCountry, selectedDate]);

  return (
    <div className="results-container">
      <h1>Available Flights</h1>

      {flights.length === 0 ? (
        <p>ไม่พบเที่ยวบิน</p>
      ) : (
        flights.map(flight => {
          const date = flight.departDate.seconds
            ? new Date(flight.departDate.seconds * 1000)
            : new Date(flight.departDate);

          return (
            <div key={flight.id} className="flight-card">
              <p><strong>Country:</strong> {flight.country}</p>
              <p><strong>Tour Code:</strong> {flight.code}</p>
              <p><strong>Departure:</strong> {date.toLocaleDateString()}</p>
              <p className="price">{flight.price} บาท</p>

              <div className="button-group">
                <button onClick={() => navigate(`/passenger/${flight.id}`)}>
                  จองตั๋ว
                </button>
                <button onClick={() => navigate("/")}>
                  กลับหน้า Home
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default Results;