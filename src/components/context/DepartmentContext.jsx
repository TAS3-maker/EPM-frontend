import React, { createContext, useContext, useState, useMemo } from "react";
import { API_URL } from "../utils/ApiConfig";
import { useNavigate } from "react-router-dom";
import { useAlert } from "./AlertContext";
const DepartmentContext = createContext(null);
export function DepartmentProvider({ children }) {
  const [department, setDepartment] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
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
  const addDepartment = async (name) => {
  setIsLoading(true);
  setMessage(null);
  const token = localStorage.getItem("userToken");
  try {
    const response = await fetch(`${API_URL}/api/departments`, {
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
      fetchDepartment();
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

const fetchDepartment = async () => {
  setIsLoading(true);
  setMessage(null);
  const token = localStorage.getItem("userToken");

  try {
    const response = await fetch(`${API_URL}/api/departments`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (handleUnauthorized(response)) return;

    const data = await response.json();

    if (response.ok) {
      const sortedRoles = Array.isArray(data)
        ? data.sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          )
        : Array.isArray(data.data)
        ? data.data.sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          )
        : [];

      setDepartment(sortedRoles);
    } else {
      setMessage(data.message || "Failed to fetch Departments ❌");
      setDepartment([]);
    }
  } catch (error) {
    console.error("Error:", error);
    setMessage("Something went wrong! ❌");
    setDepartment([]);
  } finally {
    setIsLoading(false);
  }
};

  const deleteDepartment = async (roleId) => {
    setIsLoading(true);
    const token = localStorage.getItem("userToken");
    try {
      const response = await fetch(`${API_URL}/api/departments/${roleId}`, {
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
        setDepartment((prevRoles) => prevRoles.filter((role) => role.id !== roleId));
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
  const updateDepartment = async (roleId, newName) => {
  setIsLoading(true);
  const token = localStorage.getItem("userToken");

  try {
    const response = await fetch(`${API_URL}/api/departments/${roleId}`, {
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

      setDepartment((prevRoles) =>
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
    <DepartmentContext.Provider value={{ addDepartment, deleteDepartment, fetchDepartment, updateDepartment, department, isLoading, message }}>
      {children}
    </DepartmentContext.Provider>
  );
}
export const useDepartment = () => {
  const context = useContext(DepartmentContext);
  if (!context) {
    throw new Error("useDepartment must be used within a DepartmentProvider");
  }
  return useMemo(() => context, [context]);
};
