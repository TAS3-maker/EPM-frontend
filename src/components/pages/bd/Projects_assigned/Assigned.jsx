import React, { useState, useEffect } from "react";
import { Loader2, X } from "lucide-react";
import { useBDProjectsAssigned } from "../../../context/BDProjectsassigned";
import { EditButton, SaveButton, CancelButton, YesButton, DeleteButton, AssignButton, ExportButton, ImportButton, ClearButton, CloseButton, SubmitButton, IconApproveButton, IconRejectButton, IconCancelTaskButton, IconSaveButton, IconDeleteButton, IconEditButton, IconViewButton, } from "../../../AllButtons/AllButtons";
import { useAlert } from "../../../context/AlertContext";

export const Assigned = ({ selectedProjectId }) => {
  const { projects, projectManagers, isLoading, assignProject, message } = useBDProjectsAssigned();
  const [showModal, setShowModal] = useState(false);
  const [selectedManagers, setSelectedManagers] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const { showAlert } = useAlert();
  useEffect(() => {
    console.log("Project Managers List:", projectManagers);
  }, [projectManagers]);

  useEffect(() => {
    if (selectedProjectId) {
      setSelectedProject(selectedProjectId);
    }
  }, [selectedProjectId]);

  const handleManagerSelect = (e) => {
    const selectedId = Number(e.target.value);
    if (!selectedId) return;


    const selectedManager = projectManagers.find((manager) => manager.id === selectedId);
    if (!selectedManager) return;

    setSelectedManagers((prev) => {
      const isAlreadySelected = prev.some((m) => m.id === selectedManager.id);
      if (!isAlreadySelected) {
        const updatedManagers = [...prev, selectedManager];
        console.log("Updated Selected Managers:", updatedManagers.map(m => m.id));
        return updatedManagers;
      }
      return prev;
    });

    e.target.value = "";
  };


  useEffect(() => {
    console.log("Selected Managers:", selectedManagers);
  }, [selectedManagers]);

  const removeManager = (id) => {
    setSelectedManagers((prev) => prev.filter((manager) => manager.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedProject || selectedManagers.length === 0) {
      showAlert({ variant: "warning", title: "Warning", message: "Please select a project and at least one manager!"});
      return;
    }

    console.log("Submitting Data: ", { selectedProject, managers: selectedManagers });

    await assignProject(selectedProject, selectedManagers.map((m) => m.id));


    setSelectedProject("");
    setSelectedManagers([]);
    setShowModal(false);
  };

  return (
    <div className="">
      {/* <button
        onClick={() => setShowModal(true)}
        className="text-white px-4 py-2 rounded-md hover:bg-blue-600"
      >
        Assign Projects
      </button> */}
      <AssignButton onClick={() => setShowModal(true)} />

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold text-gray-800">Assign Projects</h2>
            <p className="text-sm text-gray-500 mt-1">Assign a project to managers.</p>

            {message && (
              <div className={`mt-4 p-3 rounded-md text-sm font-medium text-center ${message.includes("successfully") ? "bg-green-50 text-green-800 border border-green-300" : "bg-red-50 text-red-800 border border-red-300"}`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block font-medium text-blue-700 text-sm">Project Managers</label>
                <select
                  className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900"
                  onChange={handleManagerSelect}
                >
                  <option value="">Select Project Manager</option>
                  {projectManagers.map((manager) => (
                    <option key={manager.id} value={manager.id} className="text-gray-900">{manager.name}</option>
                  ))}
                </select>

                {selectedManagers.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedManagers.map((manager) => (
                      <div key={manager.id} className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-md">
                        {manager.name}
                        <button type="button" onClick={() => removeManager(manager.id)}>
                          <X className="h-4 w-4 text-red-500 hover:text-red-700" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium p-2 rounded-md transition"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Submit"}
              </button>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-full mt-2 bg-red-500 hover:bg-red-600 text-white font-medium p-2 rounded-md"
              >
                Close
              </button> */}

              <SubmitButton disabled={isLoading} />
              <CloseButton onClick={() => setShowModal(false)} />
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
