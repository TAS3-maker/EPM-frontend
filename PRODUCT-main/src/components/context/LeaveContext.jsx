import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../utils/ApiConfig';
import { useAlert } from './AlertContext';

const LeaveContext = createContext();

export const LeaveProvider = ({ children }) => {
  const token = localStorage.getItem("userToken");
  const [leaves, setLeaves] = useState([]);
  const [hrLeave, setHRLeave] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pmleaves, setPmLeaves] = useState([]);
  const [response, setResponse] = useState(null); // This state isn't used in the component for rendering, but kept as is.
  const [error, setError] = useState(null); // This will now consistently store a string or null
  const { showAlert } = useAlert();

  const postStatuses = async (statusData) => {
    setLoading(true);
    setError(null);
    // console.log(statusData);

    try {
      // console.log("this is token", token);
      const response = await fetch(`${API_URL}/api/approve-leave`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(statusData)
      });

      const contentType = response.headers.get("content-type");
      const rawResponse = await response.text();

      // console.log("Response Status:", response.status);
      // console.log("Raw Response:", rawResponse);

      if (!response.ok) {
        let errorMessage = "Failed to post statuses";
        if (contentType && contentType.includes("application/json")) {
          try {
            const errorData = JSON.parse(rawResponse);
            errorMessage = errorData.message || errorMessage;
            // showAlert({ variant: "error", title: "Error", message: rawResponse }); // This might be too raw, better to use parsed message
          } catch (jsonError) {
            // If rawResponse is not valid JSON but response.ok is false, use rawResponse
            errorMessage = rawResponse;
          }
        } else {
          errorMessage = `Unexpected response: ${rawResponse}`;
        }
        showAlert({ variant: "error", title: "Error", message: errorMessage });
        throw new Error(errorMessage); // Throw a string message
      }
      hrLeaveDetails();
      pmLeavesfnc();
      showAlert({ variant: "success", title: "Success", message: "Leave updated successfully" });
    } catch (error) {
      // Ensure error.message is always a string
      setError(error.message || "An unknown error occurred while updating status.");
      showAlert({ variant: "error", title: "Error", message: error.message || "An unknown error occurred while updating status." });
    } finally {
      setLoading(false);
    }
  };

  const addLeave = async (leaveData) => {
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      console.log("Sending Leave Data to API:", leaveData);
      const response = await axios.post(
        `${API_URL}/api/add-leave`,
        leaveData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log("API Response:", response.data);
      showAlert({ variant: "success", title: "Success", message: "Leave uploaded successfully" });
      return response.data;
    } catch (err) {
      // Determine the error message to display
      let errorMessage = "Failed to submit leave request.";
      if (err.response && err.response.data) {
        if (typeof err.response.data === 'object' && err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else {
          errorMessage = JSON.stringify(err.response.data); // Fallback to stringifying if it's an object without a 'message'
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage); // Set the error state with a string
      showAlert({ variant: "error", title: "Error", message: errorMessage });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaves = async () => {
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      const response = await fetch(`${API_URL}/api/getleaves-byemploye`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Failed to fetch leaves: ${response.status}`;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      setLeaves(result.data || []);
    } catch (error) {
      // Ensure error.message is always a string
      setError(error.message || "An unknown error occurred while fetching leaves.");
    } finally {
      setLoading(false);
    }
  };

  const hrLeaveDetails = async () => {
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      const response = await fetch(`${API_URL}/api/getall-leave-forhr`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Failed to fetch HR leave details: ${response.status}`;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      setHRLeave(result.data || []);
    } catch (error) {
      // Ensure error.message is always a string
      setError(error.message || "An unknown error occurred while fetching HR leave details.");
    } finally {
      setLoading(false);
    }
  };

  const pmLeavesfnc = async () => {
    setError(null); // Clear previous errors
    try {
      const response = await axios.get(`${API_URL}/api/showmanager-leavesfor-teamemploye`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        setPmLeaves(response.data.data);
      } else {
        // Handle cases where API returns success: false but with a message
        setError(response.data.message || "Failed to fetch PM leaves.");
      }
    } catch (error) {
      // Axios errors have a response.data property for server errors
      let errorMessage = "Error fetching PM leaves.";
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      setError(errorMessage); // Ensure error.message is always a string
      console.error("Error fetching PM leaves:", error);
    }
  };

  useEffect(() => {
    fetchLeaves();
    hrLeaveDetails();
    pmLeavesfnc();
  }, [token]); // Added token to dependencies to re-fetch if token changes (e.g., on login/logout)

  return (
    <LeaveContext.Provider value={{ postStatuses, response, pmleaves, pmLeavesfnc, leaves, addLeave, loading, error, fetchLeaves, hrLeaveDetails, hrLeave }}>
      {children}
    </LeaveContext.Provider>
  );
};

export const useLeave = () => {
  return useContext(LeaveContext);
};