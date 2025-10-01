import React, { createContext, useContext, useState, useMemo } from "react";
import { API_URL } from "../utils/ApiConfig";
import { useNavigate } from "react-router-dom";
import { useAlert } from "./AlertContext";
const RoleContext = createContext(null);
export function RoleProvider({ children }) {
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const token = localStorage.getItem("userToken");
  const { showAlert } = useAlert();
  console.log(token);
  const navigate = useNavigate();
    const handleUnauthorized = (response) => {
      if (response.status === 401) {
        localStorage.removeItem("userToken");
        navigate("/");
        return true;
      }
      return false;
    };
  const addRole = async (name) => {
  setIsLoading(true);
  setMessage(null);
  const token = localStorage.getItem("userToken");
  try {
    const response = await fetch(`${API_URL}/api/roles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    });

    if (handleUnauthorized(response)) return;
    const data = await response.json();

    if (response.ok) {
      showAlert({ variant: "success", title: "Success", message: "Role added successfully" });
      fetchRoles();
      return { success: true };
    } else {
      // handle backend validation errors
      const errorMessage = data?.errors.name || "Failed to add role";
      // showAlert({ variant: "error", title: "Error", message: errorMessage });
      return { success: false, errorMessage };
    }
  } catch (error) {
    console.error("Error:", error);
    const fallbackMessage = "Something went wrong!";
    showAlert({ variant: "error", title: "Error", message: fallbackMessage });
    return { success: false, errorMessage: fallbackMessage };
  } finally {
    setIsLoading(false);
  }
};

  const fetchRoles = async () => {
    setIsLoading(true);
    setMessage(null);
    const token = localStorage.getItem("userToken");
    try {
      const response = await fetch(`${API_URL}/api/roles`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (handleUnauthorized(response)) return;
      const data = await response.json();
      // console.log("Fetched Roles:", data);
      if (response.ok) {
        setRoles(Array.isArray(data.data) ? data.data : []);
      } else {
        setMessage(data.message || "Failed to fetch roles :x:");
        setRoles([]);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Something went wrong! :x:");
      setRoles([]);
    } finally {
      setIsLoading(false);
    }
  };
  const deleteRole = async (roleId) => {
    setIsLoading(true);
    const token = localStorage.getItem("userToken");
    try {
      const response = await fetch(`${API_URL}/api/roles/${roleId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (handleUnauthorized(response)) return;
      const data = await response.json();
      // console.log("Delete Response:", data);
      if (response.ok) {
        showAlert({ variant: "success", title: "Success", message: "Role Deleted successfully" });
        setRoles((prevRoles) => prevRoles.filter((role) => role.id !== roleId));
      } else {

        showAlert({ variant: "error", title: "Error", message: "Failed to delete role :x:" });
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Something went wrong while deleting role! :x:");
      showAlert({ variant: "error", title: "Error", message: "Failed to delete role :x:" });
    } finally {
      setIsLoading(false);
    }
  };
  const updateRole = async (roleId, newName) => {
  setIsLoading(true);
  const token = localStorage.getItem("userToken");

  try {
    const response = await fetch(`${API_URL}/api/roles/${roleId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: newName }),
    });

    if (handleUnauthorized(response)) return;

    const data = await response.json();
    // console.log("Update Response:", data);

    if (response.ok) {
      showAlert({
        variant: "success",
        title: "Success",
        message: "Role updated successfully",
      });

      setRoles((prevRoles) =>
        prevRoles.map((role) =>
          role.id === roleId ? { ...role, name: newName } : role
        )
      );

      return { success: true };
    } else {
      const errorMessage = data.errors.name || "Failed to update role";
      return { success: false, errorMessage };
    }
  } catch (error) {
    console.error("Error:", error);
    const fallbackMessage = "Something went wrong while updating role!";
    showAlert({
      variant: "error",
      title: "Error",
      message: fallbackMessage,
    });

    return { success: false, errorMessage: fallbackMessage };
  } finally {
    setIsLoading(false);
  }
};

  return (
    <RoleContext.Provider value={{ addRole, deleteRole, fetchRoles, updateRole, roles, isLoading, message }}>
      {children}
    </RoleContext.Provider>
  );
}
export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return useMemo(() => context, [context]);
};