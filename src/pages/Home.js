import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import "../styles/theme.css";

function Home() {
  const navigate = useNavigate();

  const [country, setCountry] = useState("");
  const [departDate, setDepartDate] = useState("");
  const [userName, setUserName] = useState("");

  // ✅ ดึงชื่อผู้ใช้ที่ login อยู่
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/");
        return;
      }

      setUserName(user.displayName || "User");
    });

    return () => unsubscribe();
  }, [navigate]);

  const countries = [
    { name: "Japan", image: "https://flagcdn.com/w320/jp.png" },
    { name: "Korea", image: "https://flagcdn.com/w320/kr.png" },
    { name: "China", image: "https://flagcdn.com/w320/cn.png" },
  ];

  const searchTour = (e) => {
    e.preventDefault();
    if (!country || !departDate) {
      alert("Please select country and departure date");
      return;
    }
    navigate(`/results?country=${country}&date=${departDate}`);
  };

  return (
    <div>

      {/* ================= NAVBAR ================= */}
      <div className="navbar">
        <div className="nav-left">
          ✈ SkyJourney
        </div>

        <div className="nav-right">
          <span className="welcome-text">
            👋 {userName}
          </span>

          <button
            onClick={() => {
              auth.signOut();
              navigate("/");
            }}
            className="btn-primary"
          >
            Logout
          </button>
        </div>
      </div>

      {/* ================= HERO SECTION ================= */}
      <div className="hero">
        <div className="hero-overlay">
          <h1 style={{ fontSize: "48px", color: "white" }}>
            Fly Beyond Your Dreams ✈
          </h1>

          <p style={{ fontSize: "18px", color: "white" }}>
            Book flights to your favorite destinations
          </p>

          <form
            onSubmit={searchTour}
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "10px",
              display: "flex",
              gap: "15px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              style={{ padding: "10px", borderRadius: "6px" }}
            >
              <option value="">Select Country</option>
              <option value="Japan">Japan</option>
              <option value="Korea">Korea</option>
              <option value="China">China</option>
            </select>

            <input
              type="date"
              value={departDate}
              onChange={(e) => setDepartDate(e.target.value)}
              style={{ padding: "10px", borderRadius: "6px" }}
            />

            <button className="btn-primary" type="submit">
              🔍 Search Flights
            </button>
          </form>
        </div>
      </div>

      {/* ================= POPULAR DESTINATIONS ================= */}
      <h2 style={{ marginTop: "50px", textAlign: "center" }}>
        🌍 Popular Destinations
      </h2>

      <div
        style={{
          display: "flex",
          gap: "40px",
          justifyContent: "center",
          flexWrap: "wrap",
          marginTop: "30px",
        }}
      >
        {countries.map((item, index) => (
          <div
            key={index}
            className="card"
            style={{ textAlign: "center", cursor: "pointer" }}
            onClick={() =>
              navigate(`/results?country=${item.name}`)
            }
          >
            <img
              src={item.image}
              alt={item.name}
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
            <h3 style={{ marginTop: "15px" }}>{item.name}</h3>
          </div>
        ))}
      </div>

    </div>
  );
}

export default Home;