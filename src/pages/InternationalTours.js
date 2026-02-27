import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

function InternationalTours() {
  const [countries, setCountries] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    const snapshot = await getDocs(collection(db, "flights"));

    // ดึงชื่อประเทศไม่ซ้ำ
    const countryList = [
      ...new Set(snapshot.docs.map(doc => doc.data().country))
    ];

    setCountries(countryList);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>ทัวร์ต่างประเทศ</h2>

      <div style={{ marginTop: "20px" }}>
        {countries.map((country, index) => (
          <button
            key={index}
            onClick={() => navigate(`/international/${country}`)} style={{
              margin: "10px",
              padding: "10px 20px",
              cursor: "pointer"
            }}
          >
            {country}
          </button>
        ))}
      </div>
    </div>
  );
}

export default InternationalTours;