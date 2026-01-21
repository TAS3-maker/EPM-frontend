import { Navigate } from "react-router-dom";
import {useAuth} from "../context/AuthContext"

const RoleBasedRoute = ({ element, allowedRoles }) => {
  const { user } = useAuth();

  return allowedRoles.includes(user.role) ? element : <Navigate to="/" />;
};

export default RoleBasedRoute;
