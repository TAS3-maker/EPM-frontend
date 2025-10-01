import { createContext, useContext, useEffect, useState } from "react";
import { API_URL } from "../utils/ApiConfig";
import Alert from "../components/Alerts";
import { useAlert } from "./AlertContext";
import axios from "axios";

const EmployeeContext = createContext(undefined);

export const EmployeeProvider = ({ children }) => {
    const [tl, setTl] = useState([]); // <-- this must be in the same component
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 
  const { showAlert } = useAlert();

// const setTl;
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
console.log("Adding employee with data:", employeeData);
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
    } else {
      if (employeeData.team_id != null) {
        formData.append("team_id", employeeData.team_id);
      } else {
        formData.append("team", employeeData.team);
      }
    }

if (employeeData.profile_pic instanceof File) {
  formData.append("profile_pic", employeeData.profile_pic);
}


console.log("FormData entries before submission:",formData);
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

      return false; // ⚠️ Needed so import count works
    }

    showAlert({
      variant: "success",
      title: "Success",
      message: "Employee added successfully",
    });

    return true; // ✅ Needed
  } catch (err) {
    console.error("Error adding employee:", err);

    return false; 
  }finally{
    fetchEmployees();
  }
};




  
  

  const updateEmployee = async (id, updatedData) => {
    try {
      const token = localStorage.getItem("userToken");
      const formData = new FormData();

      // Append all fields, even if empty, as the backend validation expects them
      formData.append("name", updatedData.name);
      formData.append("email", updatedData.email);
      formData.append("phone_num", updatedData.phone_num || "");
      formData.append("emergency_phone_num", updatedData.emergency_phone_num || "");
      formData.append("address", updatedData.address || "");
      formData.append("team_id", updatedData.team_id || ""); 
      formData.append("role_id", updatedData.role_id || ""); 
      formData.append("pm_id", updatedData.pm_id || ""); 
      formData.append('_method', 'PUT');

      if (updatedData.profile_pic instanceof File) {
        formData.append("profile_pic", updatedData.profile_pic);
      } else if (updatedData.profile_pic === null) {
        // If profile_pic is explicitly set to null (e.g., user cleared it), send a specific signal
        formData.append("profile_pic", ""); // Or 'null', depends on backend's handling of empty file upload
      }
      // If profile_pic is a URL string and not changed, don't append it to formData
      // The backend should retain the existing one if no new file is provided.
// console.log("Updating employee with ID:", updatedData.profile_pic);
      const response = await fetch(`${API_URL}/api/users/${id}`, {
        method: "POST", // Method remains POST because of _method=PUT workaround for FormData
        headers: {
          Authorization: `Bearer ${token}`,
          // "Content-Type" is automatically set to multipart/form-data when using FormData, DO NOT SET IT MANUALLY
        },
        body: formData,
      });

 if (!response.ok) {
  const errorResponse = await response.json();
  const firstError = errorResponse?.errors
    ? Object.values(errorResponse.errors)[0][0]
    : errorResponse?.message || "Something went wrong";

  showAlert({
    variant: "error",
    title: "Failed",
    message: firstError,
  });

  return false; // ✅ This is correct
}

const newEmployee = await response.json();
setEmployees((prev) => [...prev, newEmployee.data]);

showAlert({
  variant: "success",
  title: "Success",
  message: "Employee added successfully",
});

return true;


      fetchEmployees(); // Re-fetch all employees to ensure UI is up-to-date
      showAlert({ variant: "success", title: "Success", message: "Employee updated successfully" });
      setError(null); // Clear any previous errors on success
    } catch (err) {
      console.error("Error updating employee:", err);
      setError(err.message); // Set the error state in context
      // Re-throw the error so the component's catch block can handle it
      throw err;
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
      showAlert({ variant: "success", title: "Success", message: "Deleted Successfully" });
      setError(null); // Clear any previous errors on success
    } catch (err) {
      console.error("Error deleting employee:", err);
      setError(err.message);
      showAlert({ variant: "error", title: "Error", message: err.message });
    }
  };






  
  return (
    <EmployeeContext.Provider value={{ employees,tl,fetchTl,setTl ,loading, error, fetchEmployees, addEmployee, updateEmployee, deleteEmployee }}>
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
