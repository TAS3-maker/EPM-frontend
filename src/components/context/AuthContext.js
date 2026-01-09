import { createContext, useContext, useState, useEffect } from "react";
import { API_URL } from "../utils/ApiConfig";
import { useNavigate,Navigate } from "react-router-dom";
import { useAlert } from "./AlertContext";
import { usePermissions } from "./PermissionContext";
const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("userData");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [authMessage, setAuthMessage] = useState(null);
  const { showAlert } = useAlert();
  const [pendingRoles, setPendingRoles] = useState(null);
const {fetchPermissions}=usePermissions()
  const navigate = useNavigate();


const proceedWithRole = (role) => {
  const token = localStorage.getItem("userToken");
  if (!token) return; 

  const formattedRole = role.name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");

  localStorage.setItem("user_name", formattedRole);
  localStorage.setItem("role_id", role.id);
  localStorage.setItem("permissions", JSON.stringify(role.roles_permissions));

  setPendingRoles(null); 

  navigate(`/${formattedRole}/dashboard`);
};




  useEffect(() => {
    const savedUser = localStorage.getItem("userData");
    const token = localStorage.getItem("userToken");
    // console.log(token);
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
  if (user && localStorage.getItem("userToken")) {
    fetchPermissions();
  }
}, [user]);

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

      if (data.success) {
    
   const user = data.data.user;
const token = data.data.token;


// const primaryRole =
//   user?.roles?.length > 0
//     ? user.roles[0].name
//     : "norole";

// const formattedRole = primaryRole
//   .trim()
//   .toLowerCase()
//   .replace(/\s+/g, "");

// profile pic (unchanged)
const fullProfilePicUrl = user.profile_pic
  ? `http://13.60.180.240/api/storage/profile_pics/${user.profile_pic}`
  : "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";

// storage
localStorage.setItem("userToken", token);
localStorage.setItem("user_id", user.id);
// localStorage.setItem("user_name", formattedRole); // role

if (user.roles.length === 1) {
  proceedWithRole(user.roles[0]); 
} else {
  setPendingRoles(user.roles); 
}



localStorage.setItem("name", user.name);
localStorage.setItem("userData", JSON.stringify(user));
localStorage.setItem("profile_image_base64", fullProfilePicUrl);

setUser(user);

// navigation
// navigate(`/${formattedRole}/dashboard`);

     
      } else {
        throw new Error("Login failed, Please check your email or password");
      }
    } catch (error) {
      showAlert({ variant: "error", title: "Error", message: "Login failed, Please check your email or password" });

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
  try {
    // clear storage
    localStorage.removeItem("userToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_name");
    localStorage.removeItem("name");
    localStorage.removeItem("profile_image_base64");
    localStorage.removeItem("permissions");

    // 🔥 RESET CONTEXT STATE
    setUser(null);
    setPendingRoles(null);      // ✅ CLOSE ROLE POPUP
    setAuthMessage(null);

    navigate("/login", { replace: true });
  } catch (error) {
    console.error("Logout error:", error);
  }
};



  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, authMessage,proceedWithRole,pendingRoles,setPendingRoles }}>
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => useContext(AuthContext);




