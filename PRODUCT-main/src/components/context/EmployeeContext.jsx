import { createContext, useContext, useEffect, useState } from "react";
import { API_URL } from "../utils/ApiConfig";
import { useAlert } from "./AlertContext";
import axios from "axios";
import imageCompression from "browser-image-compression"; 
const EmployeeContext = createContext(undefined);

export const EmployeeProvider = ({ children }) => {
  const [tl, setTl] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showAlert } = useAlert();

  const fetchEmployees = async () => {
    console.log("Fetching employees...");
    try {
      const token = localStorage.getItem("userToken");
      if (!token) {
        setError("Unauthorized: No token found.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/users`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch employees");
      }

      const data = await response.json();
      setEmployees(data.data || []);
    } catch (err) {
      console.error("Error fetching employees:", err);
      setError(err.message);
      showAlert({ variant: "error", title: "Error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchTl = async (team_id) => {
    console.log("Fetching TL data for team_id:", team_id);
    const token = localStorage.getItem("userToken");

    try {
      const response = await axios.get(`${API_URL}/api/getalltl`, {
        params: { team_id },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("TL fetch response:", response.data.data);
      setTl(response.data.data);
    } catch (error) {
      console.error("Error fetching TL data:", error.response?.data || error);
      setTl([]);
    }
  };

  const addEmployee = async (employeeData) => {
    try {
      const token = localStorage.getItem("userToken");
      const formData = new FormData();

      formData.append("name", employeeData.name || "");
      formData.append("employee_id", employeeData.employee_id || "");
      formData.append("email", employeeData.email || "");
      formData.append("password", employeeData.password || "");
      formData.append("address", employeeData.address || "");
      formData.append("phone_num", employeeData.phone_num || "");
      formData.append("emergency_phone_num", employeeData.emergency_phone_num || "");
      formData.append("tl_id", employeeData.tl_id || "");

      if (employeeData.role_id) {
        formData.append("role_id", employeeData.role_id);
      } else {
        formData.append("roles", employeeData.roles);
      }

      if ([1, 2, 3, 4].includes(Number(employeeData.role_id))) {
        formData.append("team_id", "");
      } else if (employeeData.team_id != null) {
        formData.append("team_id", employeeData.team_id);
      } else {
        formData.append("team", employeeData.team);
      }

      if (employeeData.profile_pic instanceof File) {
        formData.append("profile_pic", employeeData.profile_pic);
      }

      const response = await fetch(`${API_URL}/api/users`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        const firstError = data?.errors
          ? Object.values(data.errors)[0][0]
          : data?.message || "Something went wrong";

        showAlert({
          variant: "error",
          title: "Failed to Add",
          message: firstError,
        });

        return false;
      }

      showAlert({
        variant: "success",
        title: "Success",
        message: "Employee added successfully",
      });

      return true;
    } catch (err) {
      console.error("Error adding employee:", err);
      return false;
    } finally {
      fetchEmployees();
    }
  };

  const updateEmployee = async (id, updatedData) => {
  try {
    const token = localStorage.getItem("userToken");

    if (!token) {
      throw new Error("No auth token found in localStorage.");
    }

    const formData = new FormData();
    formData.append("name", updatedData.name);
    formData.append("email", updatedData.email);
    formData.append("phone_num", updatedData.phone_num || "");
    formData.append("emergency_phone_num", updatedData.emergency_phone_num || "");
    formData.append("address", updatedData.address || "");
    formData.append("team_id", updatedData.team_id || "");
    formData.append("role_id", updatedData.role_id || "");
    formData.append("pm_id", updatedData.pm_id || "");
    formData.append("_method", "PUT");

if (updatedData.profile_pic instanceof File) {
  try {
    const compressedFile = await imageCompression(updatedData.profile_pic, {
      maxSizeMB: 1, // Keep under 1MB
      maxWidthOrHeight: 1024, // Resize to max 1024px width/height
      useWebWorker: true,
    });
    formData.append("profile_pic", compressedFile);
  } catch (compressionError) {
    console.error("Image compression failed:", compressionError);
    // Fallback to original if compression fails
    formData.append("profile_pic", updatedData.profile_pic);
  }
} else if (updatedData.profile_pic === null) {
  formData.append("profile_pic", "");
}

    
    else if (updatedData.profile_pic === null) {
      formData.append("profile_pic", "");
    }

    console.log("Submitting updateEmployee formData for ID:", id);
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    const response = await fetch(`${API_URL}/api/users/${id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      const firstError = result?.errors
        ? Object.values(result.errors)[0][0]
        : result?.message || "Something went wrong";

      showAlert({
        variant: "error",
        title: "Failed to Update",
        message: firstError,
      });

      return false;
    }

    setEmployees((prev) =>
      prev.map((emp) => (emp.id === id ? result.data : emp))
    );

    showAlert({
      variant: "success",
      title: "Success",
      message: "Employee updated successfully",
    });

    setError(null);
    return true;
  } catch (err) {
    console.error("❌ Error updating employee:", err);
    setError(err.message);
    showAlert({ variant: "error", title: "Error", message: err.message });
    return false;
  }
};

  const deleteEmployee = async (id) => {
    try {
      const token = localStorage.getItem("userToken");
      const response = await fetch(`${API_URL}/api/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete employee");
      }

      setEmployees((prev) => prev.filter((emp) => emp.id !== id));
      showAlert({
        variant: "success",
        title: "Success",
        message: "Deleted Successfully",
      });

      setError(null);
    } catch (err) {
      console.error("Error deleting employee:", err);
      setError(err.message);
      showAlert({ variant: "error", title: "Error", message: err.message });
    }
  };

  return (
    <EmployeeContext.Provider
      value={{
        employees,
        tl,
        fetchTl,
        setTl,
        loading,
        error,
        fetchEmployees,
        addEmployee,
        updateEmployee,
        deleteEmployee,
      }}
    >
      {children}
    </EmployeeContext.Provider>
  );
};

export const useEmployees = () => {
  const context = useContext(EmployeeContext);
  if (!context) {
    throw new Error("useEmployees must be used within an EmployeeProvider");
  }
  return context;
};
