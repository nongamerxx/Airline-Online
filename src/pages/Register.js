import { useState } from "react";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { updateProfile } from "firebase/auth";
import "../styles/theme.css";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) return alert("รหัสผ่านไม่ตรงกัน");
    if (password.length < 6) return alert("รหัสผ่านอย่างน้อย 6 ตัว");

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, {
      displayName: name
    });
    await setDoc(doc(db, "users", user.uid), {
      name,
      email,
      phone,
      role: "user",
      createdAt: new Date()
    });

    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>✈ SkyJourney</h1>
        <h2>Register</h2>

        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="primary-btn" onClick={handleRegister}>
          Register
        </button>

        <p className="auth-link">
          มีบัญชีอยู่แล้ว?{" "}
          <span onClick={() => navigate("/")}>
            กลับหน้าหลัก
          </span>
        </p>
      </div>
    </div>
  );
}

export default Register;