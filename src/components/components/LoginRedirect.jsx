import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Login from "../pages/Login";

const LoginRedirect = () => {
  const [checking, setChecking] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    // console.log("LoginRedirect useEffect called");
    const token = localStorage.getItem("userToken");
    const userData = localStorage.getItem("userData");
    const role = localStorage.getItem("user_name");

    // If any of the expected items are missing, consider user unauthenticated
    if (!token || !userData || !role) {
      setIsLoggedIn(false);
      setChecking(false);
      return;
    }

    // Validate token with backend
    const validateToken = async () => {
      try {
        const response = await fetch("http://13.60.180.240/api/api/check-token", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          setIsLoggedIn(true);
          setUserRole(role);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Token validation failed:", error);
        setIsLoggedIn(false);
      } finally {
        setChecking(false);
      }
    };

    validateToken();
  }, []);


  if (checking) return null;

  if (isLoggedIn) {
    return <Navigate to={`/${userRole}/dashboard`} replace />;
  }

  return <Login />;
};

export default LoginRedirect;
