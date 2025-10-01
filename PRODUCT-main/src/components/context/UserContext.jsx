import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../utils/ApiConfig";
import { useAlert } from "./AlertContext";
const UserContext = createContext();
export const UserProvider = ({ children }) => {
  const [userProjects, setUserProjects] = useState([]);
  const [userassignedProjects, setUserassignedProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("userToken");
    const { showAlert } = useAlert();
  const [performanceSheets, setPerformanceSheets] = useState([]);
  console.log(token);
  const fetchUserProjects = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/user-projects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUserProjects(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const fetchUserassignedProjects = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/user-projects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Fetched projects:", response.data); 
      if (response.data && Array.isArray(response.data.data)) {
        setUserassignedProjects(response.data.data); 
      } else {
        setUserassignedProjects([]); 
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const formatTime = (time) => {
    if (!time || typeof time !== "string") return "00:00";
    const match = time.match(/^(\d{1,2}):?(\d{0,2})$/);
    if (!match) return "00:00";
    let [_, hours, minutes] = match;
    hours = hours.padStart(2, "0");
    minutes = minutes ? minutes.padStart(2, "0") : "00"; 
    return `${hours}:${minutes}`;
  };
  const formatDate = (date) => {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate) ? parsedDate.toISOString().split("T")[0] : "1970-01-01";
  };
  const submitEntriesForApproval = async (savedEntries) => {
    try {
      console.log("Raw savedEntries:", savedEntries);
      const entriesArray = Array.isArray(savedEntries.data) ? savedEntries.data : savedEntries;
      if (!entriesArray.length) {
        console.error("Error: entriesArray is empty!", savedEntries);
        return;
      }
      console.log("Formatted entriesArray before mapping:", entriesArray);
      const formattedData = {
        data: entriesArray.map(entry => ({
          project_id: parseInt(entry.project_id, 10) || 0,
          date: formatDate(entry.date),
          time: formatTime(entry.hoursSpent || entry.time), 
          work_type: String(entry.work_type || ""),
          activity_type: String(entry.activity_type || ""),
          narration: String(entry.narration || ""),
          project_type: String(entry.project_type || ""),
          project_type_status: String(entry.project_type_status || ""),
        }))
      };
      console.log("Submitting formattedData:", JSON.stringify(formattedData, null, 2));
      const response = await axios.post(`${API_URL}/api/add-performa-sheets`, formattedData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      console.log("Response from server:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error submitting entries for approval:", error);
      if (error.response) {
        console.error("Server Response Error:", error.response.data);
      }
      throw error;
    }
  };
  const fetchPerformanceSheets = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/get-performa-sheet`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPerformanceSheets(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const editPerformanceSheet = async (id) => {
    setLoading(true);
    try {
      console.log(":mag: Checking values before sending API request...");
      console.log(":pushpin: ID:", id);
      if (!id || !id.id || !id.data) {
        showAlert({ variant: "warning", title: "warning", message: "Missing required data for updating the performance sheet." });
        return;
      }
      const payload = id; 
      console.log(":white_check_mark: Final Payload:", JSON.stringify(payload, null, 2));
      const response = await fetch(`${API_URL}/api/edit-performa-sheets`,{
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) {
        console.error(":rotating_light: API Error:", result);
        showAlert({ variant: "error", title: "Error", message: result.message || "Failed to update performance sheet" });
      }
      showAlert({ variant: "success", title: "Success", message: "Sheet updated successfully" });
      fetchPerformanceSheets();
      return result;
    } catch (error) {

      showAlert({ variant: "error", title: "Error", message: error });
      return null;
    } finally {
      setLoading(false);
    }
  };


const deletesheet = async (id) => {
  console.log("Deleting sheet with ID:", id);
  try {
    const token = localStorage.getItem("userToken");
    const response = await fetch(`${API_URL}/api/delete-performa-sheets`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ sheet_id: id }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete employee");
    }

    fetchPerformanceSheets();
    showAlert({ variant: "success", title: "Success", message: "Performance Deleted Successfully" });
    setError(null);
  } catch (err) {
    console.error("Error deleting employee:", err);
    setError(err.message);
    showAlert({ variant: "error", title: "Error", message: err.message });
  }
};





  useEffect(() => {
    fetchUserProjects();
    fetchPerformanceSheets();
    fetchUserassignedProjects();
  }, []);
  return (
    <UserContext.Provider value={{ editPerformanceSheet, fetchUserassignedProjects, userassignedProjects, userProjects, performanceSheets, loading, error, fetchUserProjects, submitEntriesForApproval, fetchPerformanceSheets,deletesheet }}>
      {children}
    </UserContext.Provider>
  );
};
export const useUserContext = () => useContext(UserContext);