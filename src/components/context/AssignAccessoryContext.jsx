import { createContext, useContext, useEffect, useState } from "react";
import { useAlert } from "./AlertContext";
import { API_URL } from "../utils/ApiConfig";

const AssignAccessoryContext = createContext();

export const AssignAccessoryProvider = ({ children }) => {
  const [accessoryAssign, setAccessoryAssign] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showAlert } = useAlert();

  useEffect(() => {
    fetchAccessoryAssign();
  }, []);

  // 📦 Fetch all accessory assignments
  const fetchAccessoryAssign = async () => {
    try {
      const token = localStorage.getItem("userToken");
      if (!token) {
        setError("Unauthorized");
        return;
      }

      const response = await fetch(`${API_URL}/api/getaccessoryassign`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch accessories");

      const data = await response.json();
      setAccessoryAssign(data.data || []);
    } catch (err) {
      setError(err.message);
      showAlert({ variant: "error", title: "Error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  // ➕ Add new accessory assignment
  const addAccessoryAssign = async (accessoryData) => {
    try {
      const token = localStorage.getItem("userToken");
      const formData = new FormData();

      Object.entries(accessoryData).forEach(([key, value]) =>
        formData.append(key, value)
      );

      const response = await fetch(`${API_URL}/api/addaccessoryassign`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        const message = errorResponse?.message || "Failed to add accessory";
        showAlert({ variant: "error", title: "Error", message });
        return;
      }

      const result = await response.json();
      setAccessoryAssign((prev) => [...prev, result.data]);
      fetchAccessoryAssign();
      showAlert({
        variant: "success",
        title: "Success",
        message: "Accessory assigned successfully",
      });
    } catch (err) {
      showAlert({ variant: "error", title: "Error", message: err.message });
    }
  };

  // ✏️ Update an existing assignment
  const updateAccessoryAssign = async (id, updatedData) => {
    try {
      const token = localStorage.getItem("userToken");

      const response = await fetch(
        `${API_URL}/api/updateaccessoryassign/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        }
      );

      if (!response.ok) throw new Error("Failed to update accessory");

      const result = await response.json();
      setAccessoryAssign((prev) =>
        prev.map((item) => (item.id === id ? result.data : item))
      );
      fetchAccessoryAssign();

      showAlert({
        variant: "success",
        title: "Updated",
        message: "Accessory updated successfully",
      });
    } catch (err) {
      showAlert({ variant: "error", title: "Error", message: err.message });
    }
  };

  // ❌ Delete an assignment
  const deleteAccessoryAssign = async (id) => {
    try {
      const token = localStorage.getItem("userToken");

      const response = await fetch(
        `${API_URL}/api/deleteaccessoryassign/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to delete accessory");

      setAccessoryAssign((prev) => prev.filter((item) => item.id !== id));

      showAlert({
        variant: "success",
        title: "Deleted",
        message: "Accessory deleted successfully",
      });
    } catch (err) {
      showAlert({ variant: "error", title: "Error", message: err.message });
    }
  };

  return (
    <AssignAccessoryContext.Provider
      value={{
        accessoryAssign,
        loading,
        error,
        fetchAccessoryAssign,
        addAccessoryAssign,
        updateAccessoryAssign,
        deleteAccessoryAssign,
      }}
    >
      {children}
    </AssignAccessoryContext.Provider>
  );
};

// Hook for using context
export const useAssignAccessory = () => {
  const context = useContext(AssignAccessoryContext);
  if (!context) {
    throw new Error("useAssignAccessory must be used within AccessoryProvider");
  }
  return context;
};
