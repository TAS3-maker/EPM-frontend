import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/context/AuthContext";
import { AlertProvider } from "./components/context/AlertContext";
import UpdatePassword from "./components/pages/UpdatePassword";
import AppRoutes from "./components/Routes";
import RedirectToDashboard from "./components/components/RedirectToDashboard";
import LoginRedirect from "./components/components/LoginRedirect";
import ProtectedRoute from "../src/components/components/ProtectedRoute";
import { PermissionProvider } from "./components/context/PermissionContext";
import { RoleProvider } from "./components/context/RoleContext";
function App() {
  return (
<Router>
  <AlertProvider>
    <PermissionProvider>
      <AuthProvider>
        <RoleProvider>
        <Routes>
          <Route path="/" element={<RedirectToDashboard />} />
          <Route path="/login" element={<LoginRedirect />} />
          <Route path="/updatepassword" element={<UpdatePassword />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppRoutes />
              </ProtectedRoute>
            }
          />
        </Routes>
        </RoleProvider>
      </AuthProvider>
    </PermissionProvider>
  </AlertProvider>
</Router>
  );
}
// l

export default App;
