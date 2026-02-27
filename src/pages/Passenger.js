import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { doc, getDoc, addDoc, collection } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

function Passenger() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [flight, setFlight] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  // 🔹 รอ Auth โหลดก่อน
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // 🔹 โหลดข้อมูลเที่ยวบิน
  useEffect(() => {
    const fetchFlight = async () => {
      try {
        const docRef = doc(db, "flights", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setFlight(docSnap.data());
        } else {
          alert("ไม่พบเที่ยวบินนี้");
          navigate("/");
        }
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    };

    fetchFlight();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("กรุณา Login ก่อนจอง");
      return;
    }

    try {
      await addDoc(collection(db, "bookings"), {
        flightId: id,
        userId: user.uid,
        firstName,
        lastName,
        email: user.email,
        phone,
        createdAt: new Date()
      });

      alert("จองตั๋วสำเร็จ!");
      navigate("/mybookings");

    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาด");
    }
  };

  if (loading) return <p style={{ padding: "20px" }}>กำลังโหลด...</p>;
  if (!flight) return null;

  const departureDate = flight.departDate?.seconds
    ? new Date(flight.departDate.seconds * 1000)
    : new Date(flight.departDate);

  return (
    <div className="passenger-page">
      <div className="passenger-card">

        <button
          onClick={() => navigate(-1)}
          className="back-btn"
        >
          ← กลับ
        </button>

        <h2 className="passenger-title">🧾 Passenger Information</h2>

        <div className="flight-info">
          <p><strong>Tour Code:</strong> {flight.code}</p>
          <p><strong>Country:</strong> {flight.country}</p>
          <p><strong>Departure:</strong> {departureDate.toLocaleDateString()}</p>
          <p><strong>Price:</strong> {flight.price} บาท</p>
        </div>

        <form onSubmit={handleSubmit} className="passenger-form">

          <label>First Name</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />

          <label>Last Name</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />

          <label>Email</label>
          <input
            type="email"
            value={user?.email || ""}
            disabled
          />

          <label>Phone</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />

          <button type="submit" className="submit-btn">
            ✈ ยืนยันการจอง
          </button>

        </form>
      </div>
    </div>
  );
}

export default Passenger;