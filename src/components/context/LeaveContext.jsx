import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../utils/ApiConfig';
import { useAlert } from './AlertContext';

const LeaveContext = createContext();

export const LeaveProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("userToken"));
  const [leaves, setLeaves] = useState([]);
  const [hrLeave, setHRLeave] = useState([]);
  const [pmleaves, setPmLeaves] = useState([]);
  const [userLeaves, setUserLeaves] = useState([]);
  
  // ✅ SEPARATE loading states
  const [leavesLoading, setLeavesLoading] = useState(false);
  const [addLeaveLoading, setAddLeaveLoading] = useState(false);
  const [hrLoading, setHrLoading] = useState(false);
  const [pmLoading, setPmLoading] = useState(false);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  
  const [error, setError] = useState(null);
  const { showAlert } = useAlert();

  // ✅ Watch token changes
  useEffect(() => {
    const storedToken = localStorage.getItem("userToken");
    if (storedToken !== token) {
      setToken(storedToken);
    }
  }, []);

  // ✅ Fetch leaves on token change
  const fetchLeaves = useCallback(async () => {
    if (!token) return;
    
    setLeavesLoading(true);
    setError(null);
    
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
      const errorMessage = error.message || "Failed to fetch leaves";
      setError(errorMessage);
      showAlert({ variant: "error", title: "Error", message: errorMessage });
    } finally {
      setLeavesLoading(false);
    }
  }, [token, showAlert]);

  // ✅ FIXED: FormData support + separate loading
  const addLeave = useCallback(async (formData, tokenOverride) => {
    const currentToken = tokenOverride || token;
    if (!currentToken) {
      showAlert({ variant: "error", title: "Error", message: "User not authenticated" });
      return null;
    }

    setAddLeaveLoading(true);
    setError(null);

    try {
      console.log("Sending Leave Data to API:", formData);
      
      const response = await axios.post(
        `${API_URL}/api/add-leave`,
        formData, // FormData
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
            'Content-Type': 'multipart/form-data', // ✅ CRITICAL for files!
          },
          timeout: 30000 // 30s timeout for file uploads
        }
      );
      
      showAlert({ variant: "success", title: "Success", message: "Leave uploaded successfully" });
      await fetchLeaves(); // Refresh list
      return response.data;
    } catch (err) {
      let errorMessage = "Failed to submit leave request.";
      if (err.response?.data) {
        if (typeof err.response.data === 'object' && err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else {
          errorMessage = JSON.stringify(err.response.data);
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      showAlert({ variant: "error", title: "Error", message: errorMessage });
      return null;
    } finally {
      setAddLeaveLoading(false);
    }
  }, [token, showAlert, fetchLeaves]);

  // ✅ HR Leave details
  const hrLeaveDetails = useCallback(async () => {
    if (!token) return;
    
    setHrLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/api/getall-leaves-by-user`, {
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
      const errorMessage = error.message || "Failed to fetch HR leave details";
      setError(errorMessage);
      showAlert({ variant: "error", title: "Error", message: errorMessage });
    } finally {
      setHrLoading(false);
    }
  }, [token, showAlert]);

  // ✅ FIXED: Attendance with separate loading
  const attendenceOfAllUsers = useCallback(async (startDate = null, endDate = null) => {
    if (!token) return;
    
    setAttendanceLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      
      const url = `${API_URL}/api/get-users-attendance${params.toString() ? `?${params.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Failed to fetch attendance: ${response.status}`;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      setUserLeaves(result.data || []);
    } catch (error) {
      const errorMessage = error.message || "Failed to fetch attendance data";
      setError(errorMessage);
      showAlert({ variant: "error", title: "Error", message: errorMessage });
    } finally {
      setAttendanceLoading(false);
    }
  }, [token, showAlert]);

  // ✅ PM Leaves
  const pmLeavesfnc = useCallback(async () => {
    if (!token) return;
    
    setPmLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_URL}/api/showmanager-leavesfor-teamemploye`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.data.success) {
        setPmLeaves(response.data.data);
      } else {
        setError(response.data.message || "Failed to fetch PM leaves");
      }
    } catch (error) {
      let errorMessage = "Error fetching PM leaves.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      setError(errorMessage);
      showAlert({ variant: "error", title: "Error", message: errorMessage });
    } finally {
      setPmLoading(false);
    }
  }, [token, showAlert]);

  // ✅ Status update
  const postStatuses = useCallback(async (statusData) => {
    if (!token) return;
    
    setLeavesLoading(true);
    setError(null);
    
    try {
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

      if (!response.ok) {
        let errorMessage = "Failed to post statuses";
        if (contentType && contentType.includes("application/json")) {
          try {
            const errorData = JSON.parse(rawResponse);
            errorMessage = errorData.message || errorMessage;
          } catch (jsonError) {
            errorMessage = rawResponse;
          }
        } else {
          errorMessage = `Unexpected response: ${rawResponse}`;
        }
        showAlert({ variant: "error", title: "Error", message: errorMessage });
        throw new Error(errorMessage);
      }
      
      await Promise.all([hrLeaveDetails(), pmLeavesfnc()]);
      showAlert({ variant: "success", title: "Success", message: "Leave updated successfully" });
    } catch (error) {
      const errorMessage = error.message || "Failed to update status";
      setError(errorMessage);
      showAlert({ variant: "error", title: "Error", message: errorMessage });
    } finally {
      setLeavesLoading(false);
    }
  }, [token, showAlert, hrLeaveDetails, pmLeavesfnc]);

  // ✅ Initial load
  useEffect(() => {
    if (token) {
      fetchLeaves();
      hrLeaveDetails();
      pmLeavesfnc();
    }
  }, [token, fetchLeaves, hrLeaveDetails, pmLeavesfnc]);

  // ✅ Unified loading state for components that need single loading
  const loading = leavesLoading || addLeaveLoading || hrLoading || pmLoading || attendanceLoading;

  const value = {
    // Data
    leaves,
    hrLeave,
    pmleaves,
    userLeaves,
    setUserLeaves,
    
    // Functions
    addLeave,
    fetchLeaves,
    hrLeaveDetails,
    attendenceOfAllUsers,
    postStatuses,
    pmLeavesfnc,
    
    // Loading states
    loading,
    leavesLoading,
    addLeaveLoading,
    attendanceLoading,
    hrLoading,
    pmLoading,
    
    // Error
    error
  };

  return (
    <LeaveContext.Provider value={value}>
      {children}
    </LeaveContext.Provider>
  );
};

export const useLeave = () => {
  const context = useContext(LeaveContext);
  if (!context) {
    throw new Error('useLeave must be used within a LeaveProvider');
  }
  return context;
};
