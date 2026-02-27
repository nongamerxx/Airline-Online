import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";

function CountryFlights() {
  const { country } = useParams();
  const [flights, setFlights] = useState([]);

  useEffect(() => {
    const fetchFlights = async () => {
      const q = query(
        collection(db, "flights"),
        where("country", "==", country)
      );

      const snapshot = await getDocs(q);

      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setFlights(data);
    };

    fetchFlights();
  }, [country]);

  return (
    <div>
      <h2 style={{ color: "red" }}>
        CountryFlights Page - {country}
      </h2>

      {flights.length === 0 ? (
        <p>ไม่มีเที่ยวบิน</p>
      ) : (
        flights.map(flight => (
          <div key={flight.id} style={{
            border: "1px solid black",
            padding: "10px",
            marginBottom: "10px"
          }}>
            <p>รหัสทัวร์: {flight.code}</p>
            <p>ประเทศ: {flight.country}</p>
            <p>ราคา: {flight.price} บาท</p>
          </div>
        ))
      )}
    </div>
  );
}

export default CountryFlights;