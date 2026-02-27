import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  runTransaction,
  getDoc, // ✅ ต้องเพิ่มตัวนี้
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ ฟังก์ชันโหลดข้อมูลใหม่ (ใช้ซ้ำได้)
  const fetchBookings = async (user) => {
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
          flight: flightSnap.data(),
        });
      }
    }

    setBookings(bookingData);
    setLoading(false);
  };

  // ✅ ยกเลิกการจอง + คืนที่นั่ง
  const cancelBooking = async (booking) => {
    const flightRef = doc(db, "flights", booking.flightId);
    const bookingRef = doc(db, "bookings", booking.id);

    try {
      await runTransaction(db, async (transaction) => {
        const flightDoc = await transaction.get(flightRef);

        if (!flightDoc.exists()) {
          throw "Flight not found!";
        }

        const currentSeats = flightDoc.data().seatsAvailable;

        transaction.update(flightRef, {
          seatsAvailable: currentSeats + booking.passengerCount,
        });
      });

      await deleteDoc(bookingRef);

      alert("Cancelled successfully!");

      // ✅ รีโหลดหน้าใหม่หลังยกเลิก
      await fetchBookings(auth.currentUser);

    } catch (e) {
      alert(e);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      await fetchBookings(user);
    });

    return () => unsubscribe();
  }, []);

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
                  <p><strong>Seats Left Now:</strong> {flight.seatsAvailable}</p>
                </div>

                <div className="passenger-section">
                  <p><strong>Name:</strong> {booking.firstName} {booking.lastName}</p>
                  <p><strong>Email:</strong> {booking.email}</p>
                  <p><strong>Phone:</strong> {booking.phone}</p>
                  <p><strong>Passengers:</strong> {booking.passengerCount}</p>

                  <button
                    className="cancel-btn"
                    onClick={() => cancelBooking(booking)}
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