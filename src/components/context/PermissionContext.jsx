import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import { API_URL } from "../utils/ApiConfig";
import { useNavigate } from "react-router-dom";
import { useAlert } from "./AlertContext";

const PermissionContext = createContext(null);

export function PermissionProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const [permissions, setPermissions] = useState(null);
  const [message, setMessage] = useState(null);

  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const token = localStorage.getItem("userToken");

  const fetchPermissions = async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/get-permissions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        window.dispatchEvent(new Event("auth-logout"));
        return;
      }

      const data = await response.json();
      if (data?.success) {
        setPermissions(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ RESET on logout
  useEffect(() => {
    const onLogout = () => {
      setPermissions(null);
      setIsLoading(false);
    };

    window.addEventListener("auth-logout", onLogout);
    return () => window.removeEventListener("auth-logout", onLogout);
  }, []);

  // ✅ FETCH when token changes (LOGIN / SWITCH USER)
  useEffect(() => {
    if (!token) {
      setPermissions(null);
      return;
    }

    fetchPermissions();
  }, [token]);

  // ✅ REFRESH when permissions updated or tab focused
  useEffect(() => {
    const refetch = () => fetchPermissions();

    window.addEventListener("permissions-updated", refetch);
    window.addEventListener("focus", refetch);

    return () => {
      window.removeEventListener("permissions-updated", refetch);
      window.removeEventListener("focus", refetch);
    };
  }, [token]);

  const hasPermission = (permissions, key) => {
  // 🚫 permissions API failed or not found
  if (!permissions || permissions.success === false) return false;

  return Number(permissions?.permissions?.[0]?.[key] || 0) > 0;
};

const updatePermissions = async (userId, updatedPermissions) => {
  setIsLoading(true);
  setMessage(null);
  try {
    const response = await fetch(`${API_URL}/api/update-permissions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      
      // ✅ FIXED: Flat object structure
      body: JSON.stringify({ 
        user_id: userId, 
        ...updatedPermissions  // Spread to make flat: {"user_id": "2", "employee_management": "3"}
      }),
    });
    // if (handleUnauthorized(response)) return false;

    const data = await response.json();
    if (response.ok) {
      showAlert({ variant: "success", title: "Success", message: "Permissions updated successfully" });
      await fetchPermissions(); 
      return true;
    } else {
      showAlert({ variant: "error", title: "Error", message: data.message || "Failed to update permissions" });
      return false;
    }
  } catch (error) {
    console.error("Error:", error);
    showAlert({ variant: "error", title: "Error", message: "Something went wrong while updating permissions" });
    return false;
  } finally {
    setIsLoading(false);
  }
};
  
  return (
    <PermissionContext.Provider
      value={{
        permissions,
        isLoading,
        fetchPermissions,
        hasPermission,
        updatePermissions
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
}


export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error("usePermissions must be used within a PermissionProvider");
  }
  return useMemo(() => context, [context]);
};
