import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Results from "./pages/Results";
import Passenger from "./pages/Passenger";
import MyBookings from "./pages/MyBookings";
import ProtectedRoute from "./ProtectedRoute";
import InternationalTours from "./pages/InternationalTours";
import CountryFlights from "./pages/CountryFlights";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRoute from "./components/AdminRoute";
import Navbar from "./components/Navbar";
import "./App.css";

function App() {
  return (
    <div className="app">
      <Navbar />

      <div className="page-wrapper">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/results" element={<Results />} />
          <Route path="/international" element={<InternationalTours />} />
          <Route path="/international/:country" element={<CountryFlights />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/passenger/:id"
            element={
              <ProtectedRoute>
                <Passenger />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mybookings"
            element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;