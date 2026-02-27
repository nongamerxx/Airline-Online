import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  runTransaction,
  addDoc,
} from "firebase/firestore";
import { useLocation, useNavigate } from "react-router-dom";

function Results() {
  const [flights, setFlights] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const selectedCountry = queryParams.get("country");
  const selectedDate = queryParams.get("date");

  // ✅ โหลดเที่ยวบิน
  const fetchFlights = async () => {
    const snapshot = await getDocs(collection(db, "flights"));

    let data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const today = new Date();

    data = data.filter((flight) => {
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

  // ✅ จองตั๋ว (ลดที่นั่ง)
  const handleBook = async (flight) => {
    if (!auth.currentUser) {
      alert("กรุณาเข้าสู่ระบบก่อนจอง");
      return;
    }

    const passengerCount = 1;
    const flightRef = doc(db, "flights", flight.id);

    try {
      await runTransaction(db, async (transaction) => {
        const flightDoc = await transaction.get(flightRef);

        if (!flightDoc.exists()) {
          throw "Flight not found!";
        }

        const currentSeats = flightDoc.data().seatsAvailable;

        if (currentSeats < passengerCount) {
          throw "Not enough seats!";
        }

        transaction.update(flightRef, {
          seatsAvailable: currentSeats - passengerCount,
        });
      });

      await addDoc(collection(db, "bookings"), {
        userId: auth.currentUser.uid,
        flightId: flight.id,
        passengerCount: passengerCount,
        price: flight.price,
        createdAt: new Date(),
      });

      alert("Booking successful!");

      // ✅ รีโหลดข้อมูลใหม่ให้ที่นั่งอัปเดต
      fetchFlights();

    } catch (e) {
      alert(e);
    }
  };

  useEffect(() => {
    fetchFlights();
  }, [selectedCountry, selectedDate]);

  return (
    <div className="results-container">
      <h1>Available Flights</h1>

      {flights.length === 0 ? (
        <p>ไม่พบเที่ยวบิน</p>
      ) : (
        flights.map((flight) => {
          const date = flight.departDate?.seconds
            ? new Date(flight.departDate.seconds * 1000)
            : new Date(flight.departDate);

          return (
            <div key={flight.id} className="flight-card">
              <p><strong>Country:</strong> {flight.country}</p>
              <p><strong>Tour Code:</strong> {flight.code}</p>
              <p><strong>Departure:</strong> {date.toLocaleDateString()}</p>
              <p className="price">{flight.price} บาท</p>

              {/* ✅ แสดงที่นั่ง */}
              <p>
                <strong>Seats Left:</strong>{" "}
                {flight.seatsAvailable}
              </p>

              <div className="button-group">
                {flight.seatsAvailable > 0 ? (
                  <button onClick={() => handleBook(flight)}>
                    จองตั๋ว
                  </button>
                ) : (
                  <button disabled style={{ background: "gray" }}>
                    Sold Out
                  </button>
                )}

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