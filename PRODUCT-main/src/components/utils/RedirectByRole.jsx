import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const RedirectByRole = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedRole = localStorage.getItem("user_name");
    const currentPath = location.pathname;

    // Determine the target path based on the stored role
    const targetPath = storedRole ? `/${storedRole}/dashboard` : "/";

    // Only navigate if the current path is different from the target path
    if (currentPath !== targetPath) {
      navigate(targetPath, { replace: true });
    }
  }, [navigate, location]);

  return null;
};

export default RedirectByRole;
