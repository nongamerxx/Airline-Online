import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setRole(docSnap.data().role);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <div className="navbar">
      <div className="navbar-container">
        <div className="logo" onClick={() => navigate("/")}>
          ✈ SkyJourney
        </div>

        <div className="nav-links">
          {user ? (
            <>
              {role !== "admin" && (
                <span onClick={() => navigate("/mybookings")}>
                  My Bookings
                </span>
              )}

              {role === "admin" && (
                <span onClick={() => navigate("/admin")}>
                  Admin
                </span>
              )}

              <span className="logout-btn" onClick={logout}>
                Logout
              </span>
            </>
          ) : (
            <>
              <span onClick={() => navigate("/login")}>Login</span>
              <span onClick={() => navigate("/register")}>
                Register
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar;