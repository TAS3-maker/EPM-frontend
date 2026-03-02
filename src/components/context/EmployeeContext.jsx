import { createContext, useContext, useEffect, useState } from "react";
import { API_URL } from "../utils/ApiConfig";
import Alert from "../components/Alerts";
import { useAlert } from "./AlertContext";
import axios from "axios";

const EmployeeContext = createContext(undefined);

export const EmployeeProvider = ({ children }) => {
    const [tl, setTl] = useState([]); // <-- this must be in the same component
  const [employees, setEmployees] = useState([]);
  const [employees1, setEmployees1] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 
  const [paginationMeta,setPaginationMeta]=useState({
    current_page:1,
    last_page:1,
    total:0
  })
  const { showAlert } = useAlert();


const refreshCurrentPage = async () => {
  const currentParams = { page: paginationMeta.current_page, per_page: 10 };
  await fetchEmployees(currentParams.page, currentParams.per_page);
};

  

 const fetchAllEmployees = async () => {
  console.log("Fetching ALL employees without pagination...");
  try {
    const token = localStorage.getItem("userToken");
    if (!token) {
      setError("Unauthorized: No token found.");
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

    
    const allEmployees = data.data || [];

    
    const activeEmployees = allEmployees.filter(
      (emp) => emp.is_active === 1
    );

    setEmployees1(activeEmployees);

  } catch (err) {
    console.error("Error fetching ALL employees:", err);
    showAlert({
      variant: "error",
      title: "Error",
      message: err.message,
    });
  }
};



    


 const fetchEmployees = async (page = 1, perPage = 10, filters = {}) => {
  console.log("Fetching employees...");
  try {
    const token = localStorage.getItem("userToken");
    if (!token) {
      setError("Unauthorized: No token found.");
      setLoading(false);
      return;
    }

    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
     ...(filters.search && { search: filters.search }),
      ...(filters.search_by  && { search_by: filters.search_by  })  ,
       ...(filters.status && { status: filters.status })
    
    });

    const response = await fetch(`${API_URL}/api/users?${params}`, {
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
    
    
    setEmployees(data.data.data || []);
    setPaginationMeta({
      current_page: data.data.meta?.current_page || 1,   
      last_page: data.data.meta?.last_page || 1,           
      total: data.data.meta?.total || 0                    
    });
    
 

  } catch (err) {
    console.error("Error fetching employees:", err);
    setError(err.message); 
    showAlert({ variant: "error", title: "Error", message: err.message }); 
  } finally {
    setLoading(false);
  }
};


useEffect(() => {
    fetchEmployees(1, 10);  
  }, []);
  const fetchEmployees1 = async () => {
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
      setEmployees1(data.data || []);

    } catch (err) {
      console.error("Error fetching employees:", err);
      setError(err.message); 
      showAlert({ variant: "error", title: "Error", message: err.message }); 
    } finally {
      setLoading(false);
    }
  };
useEffect(() => {
    fetchEmployees1(1);  
  }, []);


const fetchTl = async (team_id) => {
  console.log("Fetching TL data for team_id:", team_id);

  const token = localStorage.getItem("userToken");

try {
  const response = await axios.get(`${API_URL}/api/getalltl`, {
    params: { team_id },
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  console.log("Full response:", response);
  console.log("TL data:", response.data.data);
  setTl(response.data.data || []);
} catch (error) {
  console.error("Error fetching TL:", error.response?.data || error);
  setTl([]);
}
};







const addEmployee = async (employeeData) => {

  console.log(employeeData);
  
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
    formData.append("reporting_manager_id", employeeData.reporting_manager_id || "");
        formData.append("department_id", employeeData.department_id || "");
        formData.append("employment_status", employeeData.employment_status || "");
formData.append("joining_date", employeeData.joining_date || "");

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
        formData.append("tl_id", updatedData.tl_id || "");
        formData.append("reporting_manager_id", updatedData.reporting_manager_id || "");
        formData.append("pm_id", updatedData.pm_id || "");
        formData.append("department_id", updatedData.department_id != null ? updatedData.department_id : "");
        formData.append("is_active", updatedData.is_active != null ? updatedData.is_active : "");
        formData.append("employee_id", updatedData.employee_id != null ? updatedData.employee_id : "");
        
        // 🔥 NEW: Add inactive_date
        formData.append("inactive_date", updatedData.inactive_date || "");
        
        formData.append('_method', 'PUT');

        if (updatedData.profile_pic instanceof File) {
            formData.append("profile_pic", updatedData.profile_pic);
        } else if (updatedData.profile_pic === null) {
            formData.append("profile_pic", "");
        }

        const response = await fetch(`${API_URL}/api/users/${id}`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
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

            return false;
        }

        const newEmployee = await response.json();
        // ✅ Fix: Update existing employee, don't add new one
        setEmployees((prev) => 
            prev.map(emp => emp.id === id ? newEmployee.data : emp)
        );

        showAlert({
            variant: "success",
            title: "Success",
            message: "Employee updated successfully",
        });

        return true;

    } catch (err) {
        console.error("Error updating employee:", err);
        setError(err.message);
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
    <EmployeeContext.Provider value={{ employees,tl,setEmployees1,employees1,fetchTl,setTl ,loading, error, fetchEmployees, fetchAllEmployees, addEmployee, updateEmployee, deleteEmployee,paginationMeta,totalPages:paginationMeta.last_page||1, currentPage: paginationMeta.current_page || 1,  }}>
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
