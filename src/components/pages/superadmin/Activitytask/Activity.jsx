import React, { useState } from "react";
import { useActivity } from "../../../context/ActivityContext";
import { Loader2, X } from "lucide-react";
import { SubmitButton } from "../../../AllButtons/AllButtons";

export const Activity = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tagName, setTagName] = useState("");
  // const [error, setError] = useState("");
  
  // Destructure validationErrors, setValidationErrors, and clearActivityValidationErrors
  const { 
    addActivity, 
    loading, 
    message, // General message from context
    validationErrors, // Backend validation errors
    setValidationErrors, // To set client-side or clear specific errors
    clearActivityValidationErrors // To clear all errors on modal close
  } = useActivity();

  /**
   * Handles the submission of the add activity tag form.
   * @param {Event} e The form submission event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({}); // Clear errors on new submission attempt

    if (!tagName.trim()) {
      // Client-side validation: set error directly into validationErrors state
      setValidationErrors(prev => ({ ...prev, name: ["Activity tag name is required."] }));
      return;
    }

    const result = await addActivity(tagName);
    if (result && result.success) {
      setIsModalOpen(false);
      setTagName(""); 
      clearActivityValidationErrors(); 
    }
   
  };

  return (
    <div className="bg-white">
      <button onClick={() => setIsModalOpen(true)} className="add-items-btn">
        Add Activity Tag
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96 relative">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setTagName(""); // Clear input when closing modal manually
                clearActivityValidationErrors(); // Clear any existing validation errors when modal is closed
              }}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-semibold text-gray-800">Enter Tag Details</h2>
            <p className="text-sm text-gray-500 mt-1">Add a new Tag to the system</p>

            {/* General message display from context (for non-validation errors or success alerts) */}
            {message && !validationErrors.name && ( // Only show general message if no specific validation error for 'name'
                <div
                    className={`mt-4 p-3 rounded-md text-sm font-medium text-center ${
                        message.includes("successfully")
                            ? "bg-green-50 text-green-800 border border-green-300"
                            : "bg-red-50 text-red-800 border border-red-300"
                    }`}
                >
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="activityName" className="block font-medium text-gray-700 text-sm">
                  Activity Name
                </label>
                <input
                  id="activityName" // Changed from 'role' for semantic correctness
                  placeholder="Enter new activity Tag"
                  value={tagName}
                  onChange={(e) => {
                    setTagName(e.target.value);
                    // Clear validation error for 'name' as user types
                    setValidationErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.name; // Remove the 'name' error if it exists
                        return newErrors;
                    });
                  }}
                  // Conditional styling for red border based on validationErrors.name
                  className={`w-full p-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none
                    ${validationErrors.name ? 'border-red-500 focus:border-red-500' : 'border-gray-300'}`
                  }
                />
                {/* Display backend validation error message for the 'name' field */}
                {validationErrors.name && (
                  <p className="text-red-500 text-xs mt-1">
                    {validationErrors.name[0]} {/* Display the first error message */}
                  </p>
                )}
              </div>

              <SubmitButton disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Adding Tag...
                  </>
                ) : (
                  "Submit"
                )}
              </SubmitButton>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};