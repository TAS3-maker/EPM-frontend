import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import {Loader} from "lucide-react";
import { API_URL } from "../utils/ApiConfig";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("userToken");
  const userRole = localStorage.getItem("user_name");
  const userData = localStorage.getItem("userData");

  const [isValid, setIsValid] = useState(null); // null = loading, true/false = result

  useEffect(() => {
    console.log("🔒 ProtectedRoute useEffect called");
    console.log("📦 token:", token);
    console.log("📦 userRole:", userRole);
    console.log("📦 userData:", userData);

    const validateToken = async () => {
      if (!token || !userData || !userRole) {
        console.warn("⚠️ Missing token, userData, or userRole");
        setIsValid(false);
        return;
      }

      try {
        console.log("🚀 Validating token via API...");

        const res = await fetch(`${API_URL}/api/check-token`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("📬 API response status:", res.status);

        if (res.ok) {
          console.log("✅ Token is valid.");
          setIsValid(true);
        } else {
          console.warn("❌ Token is invalid or expired.");
          setIsValid(false);
        }
      } catch (err) {
        console.error("🔥 Token validation failed with error:", err);
        setIsValid(false);
      }
    };

    validateToken();
  }, [token, userData, userRole]);

  if (isValid === null) {
    // console.log("⏳ Token validation in progress...");
    return  <div className="flex justify-center items-center gap-3  ">
                <Loader className="animate-spin text-black w-10 h-10" />
                <p className="text-black text-lg font-medium">loading...</p>
              </div>; 
  }

if (!isValid) {
  // console.log("🔁 Redirecting to /login due to invalid token.");
  localStorage.clear(); 
  return <Navigate to="/login" replace />;
}


  // console.log("🔓 Access granted. Rendering protected content.");
  return children;
};

export default ProtectedRoute;
