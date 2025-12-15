import React, { useState } from "react";
import { useDepartment } from "../../../../components/context/DepartmentContext";
import { X } from "lucide-react";
import { SubmitButton } from "../../../AllButtons/AllButtons";
import { usePermissions } from "../../../context/PermissionContext.jsx";

export const Department = () => {
    const {permissions}=usePermissions()
  
  const { addDepartment, isLoading, message } = useDepartment();
  const [roleName, setRoleName] = useState("");
  const [error, setError] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const employeePermission = permissions?.permissions?.[0]?.department;
  const canAddEmployee = employeePermission === "2"
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!roleName.trim()) {

      setError("Role name is required");
      return;
    }

    setError(""); 
    const response = await addDepartment(roleName); // returns backend message (optional improvement)


    if (response && response.errorMessage) {
      setError(response.errorMessage); 
    } else {
      setRoleName("");
      setShowMessage(true);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="bg-white">
      {canAddEmployee&&(
      <button
        onClick={() => {
          setIsModalOpen(true);
          setError("");
          setShowMessage(false);
        }}
        className="add-items-btn"
      >
        Add Department
      </button>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-semibold text-gray-800">Enter Department Details</h2>
            <p className="text-sm text-gray-500 mt-1">Add a new Department to the system</p>

            {showMessage && message && (
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
                <label htmlFor="role" className="block font-medium text-gray-700 text-sm">
                  Department Name
                </label>
                <input
                  id="role"
                  placeholder="Enter new Department name"
                  className={`w-full p-2 mt-1 border ${
                    error ? "border-red-500" : "border-gray-300"
                  } rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                />
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
              </div>
              <SubmitButton disabled={isLoading} />
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
