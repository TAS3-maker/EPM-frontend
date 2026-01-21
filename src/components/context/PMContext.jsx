import { createContext, useContext, useEffect, useState } from "react";
import { API_URL } from "../utils/ApiConfig";
import axios from "axios";
import { useAlert } from "./AlertContext";
const PMContext = createContext();
export const PMProvider = ({ children }) => {
  const { showAlert } = useAlert();
  const [assignedProjects, setAssignedProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("userToken");
  const [isAssigning, setIsAssigning] = useState(false);
  const [pmperformanceData, setPmPerformanceData] = useState(null);
  const [teamleaders, setTeamleaders] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [employeeProjects, setEmployeeProjects] = useState([]);
// console.log("assigned", assignedProjects);
  const fetchEmployeeProjects = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/get-projectof-employee-assignby-projectmanager`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEmployeeProjects(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const getPerformanceDetails = async () => {
    // console.log("hello i am comming getPerformanceDetails pm ")
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/api/get-performa-manager-emp`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setPmPerformanceData(response.data.data);
                    // console.log("2 response",response.data.data);

    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  const assignProjectToTl = async (projectId, tlIds) => {
    // console.log("Assigning project to team leaders:", { projectId, tlIds });
    setIsAssigning(true);
    setError(null);
    const requestBody = { project_id: Number(projectId), tl_id: tlIds.map(id => Number(id)) };
    // console.log("Request Payload:", requestBody);
    try {
        const response = await fetch(`${API_URL}/api/assign-project-to-tl`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(requestBody),
        });
        const textResponse = await response.text();
        // console.log("Raw Response:", textResponse);
        const data = JSON.parse(textResponse);
        if (!response.ok) {

            showAlert({ variant: "error", title: "Error", message: data.message || "Failed to assign employees" });
        }
        showAlert({ variant: "success", title: "Success", message: "Project assigned successfully" });
        fetchAssignedProjects();
        fetchtls();
        fetchEmployeeProjects();
        return data;
    } catch (err) {
        showAlert({ variant: "error", title: "Error", message: err.message || "Failed to assign employees" });
        console.error("Assignment Error:", err);
    } finally {
        setIsAssigning(false);
    }
};
  const fetchtls = async () => {
    setIsLoading(true);
    setError(null);
    try {
        const response = await fetch(`${API_URL}/api/get-projectmanager-tl`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`, 
            },
        });
        if (!response.ok) {
            throw new Error("Failed to fetch employees");
        }
        const data = await response.json();
        // console.log("teams assigned to pm",data);
        setTeamleaders(data.employees || []); 
    } catch (err) {
        setError(err.message);
    } finally {
        setIsLoading(false);
    }
};

  const fetchAssignedProjects = async () => {
    setIsLoading(true);
    setMessage("");
    try {
      const response = await fetch(`${API_URL}/api/assigned-projects`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      // console.log("Fetching assigned projects...");
      if (response.status === 401) {
        localStorage.removeItem("userToken");
        window.location.href = "/";
        return;
      }
      const data = await response.json();
      if (response.ok) {
        setAssignedProjects(data.data || []);
      } else {
        setMessage(data.message || "Failed to fetch assigned projects.");
      }
    } catch (error) {
      console.error("Error fetching assigned projects:", error);
      setMessage("An error occurred while fetching assigned projects.");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTeamLeader = async (projectId, teamLeaderId) => {
        setLoading(true); // Or a separate loading state for this operation if desired
        setError(null);
        try {
            // Replace with your actual API endpoint for deleting a team leader from a project
            // Example: DELETE /api/projects/:projectId/team-leaders/:teamLeaderId
            const response = await fetch(`${API_URL}/api/remove-project-tl/${projectId}/${teamLeaderId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                // If your API expects the IDs in the body for DELETE, uncomment below:
                // body: JSON.stringify({ projectId, teamLeaderId })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to delete team leader: ${response.statusText}`);
            }

            // After successful deletion, re-fetch the projects to update the UI
            await fetchEmployeeProjects();
            // console.log(`Team leader ${teamLeaderId} deleted from project ${projectId}`);
            return true; // Indicate success
        } catch (err) {
            setError(err.message);
            console.error("Error deleting team leader:", err);
            alert(`Error: ${err.message}`); // Provide user feedback
            return false; // Indicate failure
        } finally {
            setLoading(false); // Reset loading state
        }
    };
  useEffect(() => {
    fetchAssignedProjects();
    fetchtls();
    fetchEmployeeProjects();
  }, []);
  return (
    <PMContext.Provider value={{ employeeProjects, fetchEmployeeProjects, pmperformanceData, loading, error, getPerformanceDetails, assignProjectToTl, isAssigning, teamleaders, fetchtls, assignedProjects, isLoading, message, fetchAssignedProjects,deleteTeamLeader }}>
      {children}
    </PMContext.Provider>
  );
};
export const usePMContext = () => {
  return useContext(PMContext);
};
