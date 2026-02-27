import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { db } from "../firebase";
import {
    collection,
    getDocs,
    deleteDoc,
    doc,
    updateDoc,
    addDoc,
    query,
    where,
    getDoc
} from "firebase/firestore";

function AdminDashboard() {
    const navigate = useNavigate();

    const [flights, setFlights] = useState([]);
    const [users, setUsers] = useState([]);
    const [bookings, setBookings] = useState([]);

    const [newFlight, setNewFlight] = useState({
        code: "",
        country: "",
        price: "",
        seatsAvailable: ""
    });

    // 🔐 Protect Route
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                navigate("/");
                return;
            }

            const q = query(
                collection(db, "users"),
                where("email", "==", user.email)
            );

            const snapshot = await getDocs(q);

            if (snapshot.empty || snapshot.docs[0].data().role !== "admin") {
                alert("ไม่มีสิทธิ์เข้าใช้งาน");
                navigate("/home");
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    // 📥 Fetch Data
    useEffect(() => {
        fetchFlights();
        fetchUsers();
        fetchBookings();
    }, []);

    const fetchFlights = async () => {
        const snapshot = await getDocs(collection(db, "flights"));
        setFlights(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    const fetchUsers = async () => {
        const snapshot = await getDocs(collection(db, "users"));
        setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    const fetchBookings = async () => {
        const snapshot = await getDocs(collection(db, "bookings"));
        setBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    // ➕ Add Flight
    const handleAddFlight = async () => {
        if (!newFlight.code || !newFlight.country) {
            alert("กรอกข้อมูลให้ครบ");
            return;
        }

        await addDoc(collection(db, "flights"), {
            code: newFlight.code,
            country: newFlight.country,
            countryLower: newFlight.country.toLowerCase(),
            departDate: new Date(),
            price: Number(newFlight.price),
            seatsAvailable: Number(newFlight.seatsAvailable)
        });

        setNewFlight({ code: "", country: "", price: "", seatsAvailable: "" });
        fetchFlights();
    };

    // ❌ Delete Flight
    const handleDeleteFlight = async (id) => {
        await deleteDoc(doc(db, "flights", id));
        fetchFlights();
    };

    // ❌ Cancel Booking
    const handleCancelBooking = async (booking) => {
        const flightRef = doc(db, "flights", booking.flightId);
        const flightSnap = await getDoc(flightRef);

        if (flightSnap.exists()) {
            const flightData = flightSnap.data();
            await updateDoc(flightRef, {
                seatsAvailable: flightData.seatsAvailable + 1
            });
        }

        await deleteDoc(doc(db, "bookings", booking.id));
        fetchFlights();
        fetchBookings();
    };

    // 🚪 Logout
    const handleLogout = async () => {
        await signOut(auth);
        navigate("/");
    };

    return (
        <div className="admin-page">

            <div className="admin-container">

                <div className="admin-header">
                    <h1>🛠 Admin Dashboard</h1>
                    <button className="logout-btn" onClick={handleLogout}>
                        🔓 Logout
                    </button>
                </div>

                {/* ================= ADD FLIGHT ================= */}
                <div className="admin-section">
                    <h2>🛫 เพิ่มเที่ยวบิน</h2>

                    <div className="form-row">
                        <input
                            placeholder="Code"
                            value={newFlight.code}
                            onChange={(e) =>
                                setNewFlight({ ...newFlight, code: e.target.value })
                            }
                        />

                        <input
                            placeholder="Country"
                            value={newFlight.country}
                            onChange={(e) =>
                                setNewFlight({ ...newFlight, country: e.target.value })
                            }
                        />

                        <input
                            type="number"
                            placeholder="Price"
                            value={newFlight.price}
                            onChange={(e) =>
                                setNewFlight({ ...newFlight, price: e.target.value })
                            }
                        />

                        <input
                            type="number"
                            placeholder="Seats"
                            value={newFlight.seatsAvailable}
                            onChange={(e) =>
                                setNewFlight({ ...newFlight, seatsAvailable: e.target.value })
                            }
                        />

                        <button className="primary-btn" onClick={handleAddFlight}>
                            เพิ่มเที่ยวบิน
                        </button>
                    </div>
                </div>

                {/* ================= FLIGHTS ================= */}
                <div className="admin-section">
                    <h2>✈ รายการเที่ยวบิน</h2>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Country</th>
                                <th>Price</th>
                                <th>Seats</th>
                                <th>Delete</th>
                            </tr>
                        </thead>
                        <tbody>
                            {flights.map((f) => (
                                <tr key={f.id}>
                                    <td>{f.code}</td>
                                    <td>{f.country}</td>
                                    <td>${f.price}</td>
                                    <td>{f.seatsAvailable}</td>
                                    <td>
                                        <button
                                            className="danger-btn"
                                            onClick={() => handleDeleteFlight(f.id)}
                                        >
                                            ลบ
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* ================= BOOKINGS ================= */}
                <div className="admin-section">
                    <h2>📊 รายการจองทั้งหมด</h2>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Tour Code</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Cancel</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map((b) => {
                                const flight = flights.find(f => f.id === b.flightId);
                                return (
                                    <tr key={b.id}>
                                        <td>{flight?.code}</td>
                                        <td>{b.name}</td>
                                        <td>{b.email}</td>
                                        <td>{b.phone}</td>
                                        <td>
                                            <button
                                                className="danger-btn"
                                                onClick={() => handleCancelBooking(b)}
                                            >
                                                ❌ ยกเลิก
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* ================= USERS ================= */}
                <div className="admin-section">
                    <h2>👥 รายชื่อผู้ใช้</h2>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u.id}>
                                    <td>{u.name}</td>
                                    <td>{u.email}</td>
                                    <td>{u.phone}</td>
                                    <td>{u.role}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
}

export default AdminDashboard;