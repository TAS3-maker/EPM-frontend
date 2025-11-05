import { createContext, useContext, useState, useEffect } from "react";
import { API_URL } from "../utils/ApiConfig";
import { useNavigate,Navigate } from "react-router-dom";
import { useAlert } from "./AlertContext";
const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("userData");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [authMessage, setAuthMessage] = useState(null);
  const { showAlert } = useAlert();

  const navigate = useNavigate();
  useEffect(() => {
    const savedUser = localStorage.getItem("userData");
    const token = localStorage.getItem("userToken");
    // console.log(token);
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);
  const login = async (email, password) => {
    setIsLoading(true);
    setAuthMessage(null);
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) throw new Error("Login failed , Please check your email or password");
      const data = await response.json();
      // console.log("login response",data)
      if (data.success) {
        const user = data.data.user;
        // console.log("this is logged in user", user);
        const token = data.data.token;
        const formattedRole = user?.role?.name?.trim().toLowerCase().replace(/\s+/g, "") || "norole";
                  const fullProfilePicUrl = user.profile_pic
        ? `http://13.60.180.240/api/storage/profile_pics/${user.profile_pic}`
        : 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
        localStorage.setItem("userToken", token);
        localStorage.setItem("user_id", user.id);
        localStorage.setItem("user_name", formattedRole);
                localStorage.setItem("name", user.name);
        localStorage.setItem("userData", JSON.stringify(user));
                      localStorage.setItem("profile_image_base64", fullProfilePicUrl); // <-- this line

        setUser(user);
        // console.log(user);
        // console.log("roles", formattedRole);
        // console.log(localStorage.getItem("user_name"));
        // setAuthMessage("Login successful! ✅");
        showAlert({ variant: "success", title: "Success", message: "Login successful!" });

        // console.log("this is user_id",user.id);
        const userRole = user.roles?.[0]?.name?.trim()?.toLowerCase()?.replace(/\s+/g, "");
        // console.log("this is user_id",userRole);
        navigate(`/${formattedRole}/dashboard`);
     
      } else {
        throw new Error("Login failed, Please check your email or password");
      }
    } catch (error) {
      // showAlert({ variant: "error", title: "Error", "Login failed, Please check your email or password"}); // Show an alert for fetch errors
      showAlert({ variant: "error", title: "Error", message: "Login failed, Please check your email or password" });

      // setAuthMessage("Login failed, Please check your email or password");
    } finally {
      setIsLoading(false);
    }
  };
  const [userRoleContext, setUserRoleContext] = useState(() => {
    return localStorage.getItem("user_name");
  });
  useEffect(() => {
    const handleStorageChange = () => {
      const userData = localStorage.getItem('userData');
      const roleData = localStorage.getItem('user_name');
      setUser(userData ? JSON.parse(userData) : null);
      setUserRoleContext(roleData);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  
  const logout = () => {
    // console.log("1");
    try {
      localStorage.removeItem("userToken");
      localStorage.removeItem("userData");


 localStorage.removeItem("user_id");
      localStorage.removeItem("user_name");
       localStorage.removeItem("name");
      localStorage.removeItem("profile_image_base64");


      setUser(null);
      navigate("/login");
    } catch (error) {
        //  console.log("2");
      console.error("Logout error:", error);
    }
  };


  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, authMessage }}>
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => useContext(AuthContext);





