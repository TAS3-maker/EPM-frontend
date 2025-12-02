import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import { API_URL } from "../utils/ApiConfig";
import { useNavigate } from "react-router-dom";
import { useAlert } from "./AlertContext";

const PermissionContext = createContext(null);

export function PermissionProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [permissions, setPermissions] = useState(null);
  const token = localStorage.getItem("userToken");
  const { showAlert } = useAlert();
  const navigate = useNavigate();

  const handleUnauthorized = (response) => {
    if (response.status === 401) {
      localStorage.removeItem("userToken");
      navigate("/");
      return true;
    }
    return false;
  };

  const fetchPermissions = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const response = await fetch(`${API_URL}/api/get-permissions`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (handleUnauthorized(response)) return;

      const data = await response.json();
      if (response.ok && data.success) {
        setPermissions(data.data);
      } else {
        setMessage(data.message || "Failed to fetch permissions");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Something went wrong while fetching permissions");
    } finally {
      setIsLoading(false);
    }
  };

  const updatePermissions = async (userId, updatedPermissions) => {
    setIsLoading(true);
    setMessage(null);
    try {
      const response = await fetch(`${API_URL}/api/update-permissions`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user_id: userId, permissions: updatedPermissions }),
      });
      if (handleUnauthorized(response)) return false;

      const data = await response.json();
      if (response.ok) {
        showAlert({ variant: "success", title: "Success", message: "Permissions updated successfully" });
        await fetchPermissions();  // Refresh permissions after update
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

  const deletePermissions = async (userId) => {
    setIsLoading(true);
    setMessage(null);
    try {
      const response = await fetch(`${API_URL}/api/delete-all-permissions/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (handleUnauthorized(response)) return false;

      const data = await response.json();
      if (response.ok) {
        showAlert({ variant: "success", title: "Success", message: "Permissions deleted successfully" });
        setPermissions(null);
        return true;
      } else {
        showAlert({ variant: "error", title: "Error", message: data.message || "Failed to delete permissions" });
        return false;
      }
    } catch (error) {
      console.error("Error:", error);
      showAlert({ variant: "error", title: "Error", message: "Something went wrong while deleting permissions" });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Optionally auto-fetch permissions on mount
  useEffect(() => {
    if (token) {
      fetchPermissions();
    }
  }, []);

  return (
    <PermissionContext.Provider
      value={{
        isLoading,
        message,
        permissions,
        fetchPermissions,
        updatePermissions,
        deletePermissions,
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
