import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  deleteDoc
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      console.log("Current user:", user.uid); // debug

      const q = query(
        collection(db, "bookings"),
        where("userId", "==", user.uid)
      );

      const snapshot = await getDocs(q);

      let bookingData = [];

      for (const bookingDoc of snapshot.docs) {
        const booking = bookingDoc.data();

        const flightRef = doc(db, "flights", booking.flightId);
        const flightSnap = await getDoc(flightRef);

        if (flightSnap.exists()) {
          bookingData.push({
            id: bookingDoc.id,
            ...booking,
            flight: flightSnap.data()
          });
        }
      }

      setBookings(bookingData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const cancelBooking = async (bookingId) => {
    const confirmCancel = window.confirm("คุณต้องการยกเลิกการจองใช่หรือไม่?");
    if (!confirmCancel) return;

    await deleteDoc(doc(db, "bookings", bookingId));
    setBookings(prev => prev.filter(b => b.id !== bookingId));
  };

  if (loading) return <p style={{ padding: "20px" }}>กำลังโหลด...</p>;

  return (
  <div className="mybookings-page">
    <div className="mybookings-container">

      <h2 className="mybookings-title">✈ My Bookings</h2>

      {bookings.length === 0 ? (
        <div className="empty-state">
          <h3>ยังไม่มีการจอง</h3>
          <p>คุณยังไม่ได้ทำการจองทัวร์ใด ๆ</p>
        </div>
      ) : (
        bookings.map((booking) => {
          const flight = booking.flight;

          const departureDate = flight.departDate?.seconds
            ? new Date(flight.departDate.seconds * 1000)
            : new Date(flight.departDate);

          return (
            <div key={booking.id} className="booking-card">

              <div className="flight-section">
                <p><strong>Tour Code:</strong> {flight.code}</p>
                <p><strong>Country:</strong> {flight.country}</p>
                <p><strong>Departure:</strong> {departureDate.toLocaleDateString()}</p>
                <p><strong>Price:</strong> {flight.price} บาท</p>
              </div>

              <div className="passenger-section">
                <p><strong>Name:</strong> {booking.firstName} {booking.lastName}</p>
                <p><strong>Email:</strong> {booking.email}</p>
                <p><strong>Phone:</strong> {booking.phone}</p>

                <button
                  onClick={() => cancelBooking(booking.id)}
                  className="cancel-btn"
                >
                  ❌ ยกเลิกการจอง
                </button>
              </div>

            </div>
          );
        })
      )}

    </div>
  </div>
);
}

export default MyBookings;