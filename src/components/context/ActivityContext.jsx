import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom"; // Don't forget this import
import { API_URL } from '../utils/ApiConfig';
import { useAlert } from "./AlertContext";

const ActivityContext = createContext();

export const useActivity = () => {
  return useContext(ActivityContext);
};

export const ActivityProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState({}); // Crucial for inline errors
  const [activityTags, setActivityTags] = useState([]);
  const token = localStorage.getItem("userToken");
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  // Helper for unauthorized response handling (adjusted for axios error structure)
  const handleUnauthorized = (errorResponse) => {
    if (errorResponse && errorResponse.status === 401) {
      localStorage.removeItem("userToken");
      showAlert({ variant: "error", title: "Session Expired", message: "Your session has expired. Please log in again." });
      navigate("/"); // Navigate to login page
      return true;
    }
    return false;
  };

  /**
   * Adds a new activity tag.
   * Handles API call, success/error alerts, and backend validation errors.
   * @param {string} name The name of the activity tag to add.
   */
  const addActivity = async (name) => {
    setLoading(true);
    setMessage(""); // Clear general message
    setValidationErrors({}); // Clear previous validation errors on new attempt

    try {
      const response = await axios.post(
        `${API_URL}/api/addtagsactivity`,
        { name },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // If unauthorized happens here, it means the token was valid for the request but expired upon response
      // This is less common but can happen. Axios will usually throw an error for 401.
      if (response.status === 201 || response.status === 200) {
        showAlert({ variant: "success", title: "Success", message: "Tag added successfully!" });
        // Return success status for the component to decide whether to close modal
        return { success: true };
      }
    } catch (error) {
      let generalErrorMessage = null;
      console.error("Backend Error Response (addActivity):", error.response?.data || error.message);

      if (error.response) {
        // Check for unauthorized specifically here for axios error response
        if (handleUnauthorized(error.response)) return { success: false }; // Return early if unauthorized

        if (error.response.status === 422) {
          // This is a validation error. DO NOT use showAlert here.
          // Store errors for display next to input fields.
          // Check for 'errors' key first (Laravel default for validation errors)
          if (error.response.data.errors) {
              setValidationErrors(error.response.data.errors);
          }
          // Fallback to 'data' key if 'errors' not present (if your ApiResponse uses 'data')
          else if (error.response.data.data) {
              // Ensure data.data is an object containing field-specific errors
              if (typeof error.response.data.data === 'object' && error.response.data.data !== null) {
                  setValidationErrors(error.response.data.data);
              } else {
                  console.warn("422 response data.data is not an object as expected for validation:", error.response.data.data);
                  generalErrorMessage = error.response.data.message || "Validation failed with unexpected data format.";
              }
          } else {
              // General 422 error without specific field errors
              generalErrorMessage = error.response.data.message || "Validation failed.";
          }
        } else if (error.response.data && error.response.data.message) {
          // Other types of backend errors (e.g., 500, other client errors)
          generalErrorMessage = error.response.data.message;
        }
      } else if (error.request) {
        generalErrorMessage = "No response from server. Please check your internet connection.";
      } else {
        generalErrorMessage = error.message; // Client-side error
      }

      // Only show alert for non-validation errors (or general 422 fallback)
      if (generalErrorMessage) {
        showAlert({ variant: "error", title: "Error", message: generalErrorMessage });
      }
      return { success: false }; // Indicate failure
    } finally {
      setLoading(false);
      getActivityTags(); // Re-fetch tags regardless of success/failure for list update
    }
  };

  /**
   * Fetches all activity tags.
   */
  const getActivityTags = async () => {
    setLoading(true);
    // console.log("Fetching activity tags..."); // Debugging fetch start

    try {
      const response = await axios.get(
        `${API_URL}/api/getactivity-tag`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        // console.log("API getactivity-tag response:", response.data);
        // FIX: Ensure response.data.data is an array.
        // Your ApiResponse helper likely wraps the array in a 'data' key.
        const tagsData = response.data.data;
        if (Array.isArray(tagsData)) {
            // console.log("Setting activityTags to array:", tagsData);
            setActivityTags(tagsData);
        } else {
            console.error("API response for activity tags is NOT an array. Raw response.data:", response.data);
            console.error("Expected 'response.data.data' to be an array, but got:", tagsData, "Type:", typeof tagsData);
            setActivityTags([]); // Fallback to an empty array to prevent .map() error
            showAlert({ variant: "error", title: "Data Error", message: "Received unexpected tag data format from server. Please check console." });
        }
      }
    } catch (error) {
      console.error("Error fetching activity tags:", error);
      if (handleUnauthorized(error.response)) return; // Handle unauthorized for fetch calls

      let errorMessage = "Failed to fetch activity tags. Please try again.";
      if (error.response && error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
      }
      showAlert({ variant: "error", title: "Error", message: errorMessage });
      setActivityTags([]); // Ensure state is an array even on fetch error
    } finally {
      setLoading(false);
      console.log("Finished fetching activity tags. Loading state set to false.");
    }
  };

  /**
   * Updates an existing activity tag.
   * @param {number} id The ID of the tag to update.
   * @param {string} name The new name for the tag.
   */
  const updateActivityTag = async (id, name) => {
    setLoading(true);
    setValidationErrors({}); // Clear previous validation errors

    try {
      const response = await axios.put(
        `${API_URL}/api/updatetagsactivity/${id}`,
        { name },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
        showAlert({ variant: "success", title: "Success", message: response.data.message || "Tag updated successfully" });
    } catch (error) {
        console.error("Error:", error);
        const fallbackMessage = "Something went wrong while updating tag!";
        showAlert({
          variant: "error",
          title: "Error",
          message: fallbackMessage,
        });

        return { success: false, errorMessage: fallbackMessage };
    } finally {
      setLoading(false);
      getActivityTags(); // Re-fetch tags to update the list
    }
  };

  /**
   * Deletes an activity tag.
   * @param {number} id The ID of the tag to delete.
   */
  const deleteTagActivity = async (id) => {
    setLoading(true);
    try {
      const response = await axios.delete(`${API_URL}/api/deletetagsactivitys/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
        showAlert({ variant: "success", title: "Success", message: response.data.message || "Tag deleted successfully." });
        return response.data;
    } catch (error) {
      console.error('Error deleting tag activity:', error);
      if (handleUnauthorized(error.response)) return; // Handle unauthorized

      let errorMessage = "Failed to delete tag activity.";
      if (error.response && error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
      }
      showAlert({ variant: "error", title: "Error", message: errorMessage });
      throw error;
    } finally {
      setLoading(false);
      getActivityTags(); // Refresh list after delete attempt
    }
  };

  /**
   * Clears all validation errors. Useful when closing a form or modal.
   */
  const clearActivityValidationErrors = () => {
    setValidationErrors({});
    setMessage(""); // Also clear general message if it was set by validation
  };


  return (
    <ActivityContext.Provider value={{
      addActivity,
      getActivityTags,
      updateActivityTag,
      deleteTagActivity,
      clearActivityValidationErrors, // Provide the clear function
      activityTags,
      loading,
      message, // This `message` state is less relevant for validation now
      validationErrors,
      setValidationErrors, // Expose setValidationErrors to context consumers
    }}>
      {children}
    </ActivityContext.Provider>
  );
};