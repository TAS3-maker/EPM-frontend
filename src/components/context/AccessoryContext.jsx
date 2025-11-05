import { createContext, useContext, useState } from "react";
import { useAlert } from "./AlertContext";
import { API_URL } from "../utils/ApiConfig";

const AccessoryContext = createContext();

export const AccessoryProvider = ({ children }) => {
  const [accessories, setAccessories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentCategoryId, setCurrentCategoryId] = useState(null);
  const { showAlert } = useAlert();

  const fetchAccessories = async (id) => {
    if (!id) {
      setError("Missing category ID");
      return;
    }

    setLoading(true);
    setCurrentCategoryId(id);

    try {
      const token = localStorage.getItem("userToken");
      if (!token) {
        setError("Unauthorized");
        return;
      }

      const response = await fetch(`${API_URL}/api/getaccessory/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch accessories");
      }

      const data = await response.json();
      if (data && data.data) {
        setAccessories(data.data);
        setError(null);
      } else {
        setError("No accessories data found");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching accessories:", err);
    } finally {
      setLoading(false);
    }
  };

  const addAccessory = async (accessoryData) => {
    try {
      const token = localStorage.getItem("userToken");
      const formData = new FormData();

      Object.entries(accessoryData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((file) => formData.append(`${key}[]`, file));
        } else {
          formData.append(key, value);
        }
      });

      const response = await fetch(`${API_URL}/api/addaccessory`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        showAlert({ variant: "error", title: "Error", message: result.message || "Failed to add." });
        return;
      }

      setAccessories((prev) => [...prev, result.data]);
      fetchAccessories(accessoryData.category_id);
      showAlert({ variant: "success", title: "Success", message: "Accessory added!" });
    } catch (err) {
      showAlert({ variant: "error", title: "Error", message: err.message });
    }
  };

  const updateAccessory = async (id, editFormData, currentCategoryId) => {
    try {
      const token = localStorage.getItem("userToken");

      const response = await fetch(`${API_URL}/api/updateaccessory/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editFormData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update accessory");
      }

      setAccessories((prev) =>
        prev.map((item) => (item.id === id ? result.data : item))
      );

      await fetchAccessories(currentCategoryId);

      showAlert({
        variant: "success",
        title: "Success",
        message: "Accessory updated successfully",
      });
    } catch (err) {
      showAlert({ variant: "error", title: "Error", message: err.message });
    }
  };

  const deleteAccessory = async (id) => {
    try {
      const token = localStorage.getItem("userToken");

      const response = await fetch(`${API_URL}/api/deleteaccessory/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to delete accessory");

      setAccessories((prev) => prev.filter((item) => item.id !== id));
      await fetchAccessories(currentCategoryId);

      showAlert({
        variant: "success",
        title: "Success",
        message: "Accessory deleted successfully",
      });
    } catch (err) {
      showAlert({ variant: "error", title: "Error", message: err.message });
    }
  };

  return (
    <AccessoryContext.Provider
      value={{
        accessories,
        loading,
        error,
        fetchAccessories,
        addAccessory,
        updateAccessory,
        deleteAccessory,
      }}
    >
      {children}
    </AccessoryContext.Provider>
  );
};

export const useAccessory = () => {
  const context = useContext(AccessoryContext);
  if (!context) {
    throw new Error("useAccessory must be used within an AccessoryProvider");
  }
  return context;
};
