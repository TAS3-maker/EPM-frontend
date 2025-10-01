// ProfileContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_URL } from "../utils/ApiConfig";

const ProfileContext = createContext();
export const useProfile = () => useContext(ProfileContext);

export const ProfileProvider = ({ children }) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const token = localStorage.getItem("userToken");
    const userId = localStorage.getItem("user_id");

    const fetchProfile = async () => {
        try {
            if (!token || !userId) return;
            setLoading(true);
            const response = await axios.get(`${API_URL}/api/getmyprofile/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setProfile(response.data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

 const updateProfile = async (updatedData) => {
  try {
    if (!token || !userId) throw new Error("Missing token or userId");

    const formData = new FormData();
    Object.entries(updatedData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    await axios.post(`${API_URL}/api/updateEmployee/${userId}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    await fetchProfile();
  } catch (err) {
    console.error("Error updating profile:", err);
    
    // 👉 Detailed Axios error logging
    if (err.response) {
      console.error("Server responded with:", err.response.data);
      console.error("Status code:", err.response.status);
    } else if (err.request) {
      console.error("No response received. Request was:", err.request);
    } else {
      console.error("Axios config error:", err.message);
    }

    throw err;
  }
};


    useEffect(() => {
        fetchProfile();
    }, []);

    return (
        <ProfileContext.Provider value={{ profile, loading, error, fetchProfile, updateProfile }}>
            {children}
        </ProfileContext.Provider>
    );
};
