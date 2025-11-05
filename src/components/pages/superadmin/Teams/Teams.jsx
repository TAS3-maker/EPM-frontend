import React, { useState, useEffect } from "react";
import { useTeam } from "../../../context/TeamContext";
import { X } from "lucide-react";
import { SubmitButton } from "../../../AllButtons/AllButtons";
import { useDepartment } from "../../../context/DepartmentContext";

export const Teams = () => {
  const { addTeam, fetchTeams, isLoading } = useTeam();
  const { fetchDepartment, department } = useDepartment();

  const [teamName, setTeamName] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [validationError, setValidationError] = useState("");
  const [departmentError, setDepartmentError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchTeams();
    fetchDepartment();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!teamName.trim()) {
      setValidationError("Team name is required.");
      return;
    }

    if (!departmentId) {
      setDepartmentError("Please select a department.");
      return;
    }
console.log("Submitting:", { teamName, departmentId });
    const result = await addTeam({
      name: teamName,
      department_id: departmentId, 
    });

    if (result.success) {
      setTeamName("");
      setDepartmentId("");
      setValidationError("");
      setDepartmentError("");
      setIsModalOpen(false);
    } else {
      setValidationError(result.errorMessage || "Failed to add team.");
    }
  };

  return (
    <div className="bg-white">
      <button onClick={() => setIsModalOpen(true)} className="add-items-btn">
        Add Team
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-semibold text-gray-800">Enter Team Details</h2>
            <p className="text-sm text-gray-500 mt-1">
              Add a new team to the system
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        
              <div>
                <label
                  htmlFor="team"
                  className="block font-medium text-gray-700 text-sm"
                >
                  Team Name
                </label>
                <input
                  id="team"
                  placeholder="Enter new team"
                  className={`w-full p-2 mt-1 border rounded-md focus:outline-none focus:ring-2 ${
                    validationError
                      ? "border-red-500 ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                  value={teamName}
                  onChange={(e) => {
                    setTeamName(e.target.value);
                    setValidationError("");
                  }}
                />
                {validationError && (
                  <p className="text-red-500 text-sm mt-1">{validationError}</p>
                )}
              </div>

          
              <div>
                <label
                  htmlFor="department"
                  className="block font-medium text-gray-700 text-sm mt-3 mb-2"
                >
                  Department
                </label>
                <select
                  id="department"
                  className={`w-full p-2 mt-1 border rounded-md focus:outline-none focus:ring-2 ${
                    departmentError
                      ? "border-red-500 ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                  value={departmentId}
                  onChange={(e) => {
                    setDepartmentId(e.target.value);
                    setDepartmentError("");
                  }}
                >
                  <option value="">Select Department</option>
                  {Array.isArray(department) && department.length > 0 ? (
                    department.map((dep) => (
                      <option key={dep.id} value={dep.id}>
                        {dep.name}
                      </option>
                    ))
                  ) : (
                    <option disabled>No departments found</option>
                  )}
                </select>
                {departmentError && (
                  <p className="text-red-500 text-sm mt-1">{departmentError}</p>
                )}
              </div>

              <div className="mt-6">
                <SubmitButton disabled={isLoading} />
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
