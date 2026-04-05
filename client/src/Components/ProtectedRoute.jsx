import React from "react";
import { Navigate } from "react-router-dom";
import { getToken, decodeToken } from "../utils/auth";

const ProtectedRoute = ({ children }) => {
  const token = getToken();
  const user = decodeToken();

  if (!token) {
    // Redirect to login if no token is found
    return <Navigate to="/" replace />;
  }

  // 🚩 Check if the user is authorized (Admin or Super Admin)
  if (user?.role !== "admin" && user?.role !== "super admin") {
    console.warn("🚫 Access denied: Unauthorized role.");
    localStorage.removeItem("token"); // Clear invalid/unauthorized token
    return <Navigate to="/signin" replace />;
  }

  return children;
};

export default ProtectedRoute;
