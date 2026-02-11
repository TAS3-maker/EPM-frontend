import React, { createContext, useContext, useState, useEffect, useCallback ,useRef} from 'react';
import axios from 'axios';
import { API_URL } from '../utils/ApiConfig';
import { useAlert } from './AlertContext';

const EventContext = createContext();

export const EventProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("userToken"));
  const [leaves, setLeaves] = useState([]);
  const [hrLeave, setHRLeave] = useState([]);
  const [userSpecificLeaves, setUserSpecificLeaves] = useState([]);
  const [loadingStates, setLoadingStates] = useState({
    leavesLoading: false,
    addLeaveLoading: false,
    hrLoading: false,
  });
  const [error, setError] = useState(null);
  const { showAlert } = useAlert();

  // Watch token changes
  useEffect(() => {
    const storedToken = localStorage.getItem("userToken");
    if (storedToken !== token) setToken(storedToken);
  }, []);

  // Fetch all leaves
  const fetchLeaves = useCallback(async () => {
    if (!token) return;
    setLoadingStates(prev => ({ ...prev, leavesLoading: true }));
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/event-holidays`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`Failed to fetch leaves: ${res.status}`);
      const data = await res.json();
      setLeaves(data.data || []);
      setHRLeave(data.data || []); // reuse for HR view
    } catch (err) {
      setError(err.message);
      showAlert({ variant: "error", title: "Error", message: err.message });
    } finally {
      setLoadingStates(prev => ({ ...prev, leavesLoading: false }));
    }
  }, [token]);

  // Fetch user-specific leaves
  const fetchLeavesByUserId = useCallback(async (id) => {
    if (!id) return setError("User ID is required");
    setLoadingStates(prev => ({ ...prev, leavesLoading: true }));
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/event-holidays?${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`Failed to fetch user leaves: ${res.status}`);
      const data = await res.json();
      setUserSpecificLeaves(data.data || []);
    } catch (err) {
      setError(err.message);
      setUserSpecificLeaves([]);
      showAlert({ variant: "error", title: "Error", message: err.message });
    } finally {
      setLoadingStates(prev => ({ ...prev, leavesLoading: false }));
    }
  }, [token, showAlert]);

  // Add new leave
  const addLeave = useCallback(async (formData) => {
    if (!token) return showAlert({ variant: "error", title: "Error", message: "User not authenticated" });
    setLoadingStates(prev => ({ ...prev, addLeaveLoading: true }));
    setError(null);
    try {
      await axios.post(`${API_URL}/api/event-holidays`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      showAlert({ variant: "success", title: "Success", message: "Event uploaded successfully" });
      await fetchLeaves(); // refresh UI instantly
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to add leave";
      setError(msg);
      showAlert({ variant: "error", title: "Error", message: msg });
    } finally {
      setLoadingStates(prev => ({ ...prev, addLeaveLoading: false }));
    }
  }, [token, fetchLeaves, showAlert]);

const updateLeave = useCallback(async (id, payload) => {
  if (!token) return;

  await axios.put(`${API_URL}/api/event-holidays/${id}`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json', // raw JSON in body
    },
  });
}, [token]);



  // Delete leave
  const deleteLeave = useCallback(async (id) => {
    if (!token) return showAlert({ variant: "error", title: "Error", message: "User not authenticated" });
    setLoadingStates(prev => ({ ...prev, addLeaveLoading: true }));
    setError(null);
    try {
      await axios.delete(`${API_URL}/api/event-holidays/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showAlert({ variant: "success", title: "Success", message: "Event deleted successfully" });
      await fetchLeaves(); // refresh UI instantly
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to delete leave";
      setError(msg);
      showAlert({ variant: "error", title: "Error", message: msg });
    } finally {
      setLoadingStates(prev => ({ ...prev, addLeaveLoading: false }));
    }
  }, [token, fetchLeaves, showAlert]);

const didFetch = useRef(false);

useEffect(() => {
  if (token && !didFetch.current) {
    fetchLeaves();
    didFetch.current = true;
  }
}, [token, fetchLeaves]);


  const loading = loadingStates.leavesLoading || loadingStates.addLeaveLoading || loadingStates.hrLoading;

  const value = {
    leaves,
    hrLeave,
    userSpecificLeaves,
    addLeave,
    updateLeave,
    deleteLeave,
    fetchLeaves,
    fetchLeavesByUserId,
    loading,
    error
  };

  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvent = () => {
  const context = useContext(EventContext);
  if (!context) throw new Error('useEvent must be used within an EventProvider');
  return context;
};
