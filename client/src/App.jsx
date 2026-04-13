// App.jsx
import { ThemeProvider } from "./context/ThemeContext";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Signup from "./pages/Signup";
import SignIn from "./pages/Signin";
import Home from "./pages/Home";
import ProtectedRoute from "./Components/ProtectedRoute";
import EventDetails from "./pages/EventDetails";
import EditEvent from "./pages/EditEvent";
import Events from "./pages/Events";
import ParticipantDetails from "./pages/ParticipantDetails";
import AboutUs from "./pages/AboutUs";
import SuperAdmin from "./pages/SuperAdmin";
import { getToken, decodeToken } from "./utils/auth";
import { Toaster } from "react-hot-toast";
import { SpeedInsights } from "@vercel/speed-insights/react";

function App() {
  const token = getToken();

  return (
    <ThemeProvider>
      <Router>
        <Toaster position="top-center" reverseOrder={false} />
        <SpeedInsights />
        <Routes>
          {/* Redirect if already logged in AND is admin */}
          <Route
            path="/"
            element={
              getToken() && (decodeToken()?.role === "admin" || decodeToken()?.role === "super admin") ? (
                <Navigate to="/home" replace />
              ) : (
                <Signup />
              )
            }
          />
          <Route
            path="/signin"
            element={
              getToken() && (decodeToken()?.role === "admin" || decodeToken()?.role === "super admin") ? (
                <Navigate to="/home" replace />
              ) : (
                <SignIn />
              )
            }
          />

          {/* Protected Routes */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <Events />
              </ProtectedRoute>
            }
          />

          <Route
            path="/schedule/event/:id"
            element={
              <ProtectedRoute>
                <EventDetails />
              </ProtectedRoute>
            }
          />


          <Route
            path="/schedule/edit/:id"
            element={
              <ProtectedRoute>
                <EditEvent />
              </ProtectedRoute>
            }
          />

          <Route
            path="/participant/:id"
            element={
              <ProtectedRoute>
                <ParticipantDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/super-admin"
            element={
              <ProtectedRoute>
                <SuperAdmin />
              </ProtectedRoute>
            }
          />

          <Route path="/about" element={<AboutUs />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;