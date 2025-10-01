import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const RedirectToDashboard = () => {
  const [redirect, setRedirect] = useState(null);
  const token = localStorage.getItem("userToken");
  const userRole = localStorage.getItem("user_name");
  const userData = localStorage.getItem("userData");

  useEffect(() => {
    console.log("RedirectToDashboard useEffect called",token);
    const validateToken = async () => {
     
      if (!token || !userData || !userRole) {
        setRedirect("/login");
        return;
      }

      try {
        const response = await fetch("http://13.60.180.240/api/api/check-token", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {

          setRedirect(`/${userRole}/dashboard`);
        } else {
 
          setRedirect("/login");
        }
      } catch (error) {
        console.error("Token validation failed:", error);
        setRedirect("/login");
      }
    };

    validateToken();
  }, [token, userData, userRole]);


  if (redirect === null) return null;

  return <Navigate to={redirect} replace />;
};

export default RedirectToDashboard;
