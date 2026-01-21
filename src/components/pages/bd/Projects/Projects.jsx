import React, { useState, useEffect } from "react";
import { useProject } from "../../../context/ProjectContext";
import { useClient } from "../../../context/ClientContext";
import { Loader2, Tags } from "lucide-react";
import { EditButton, SaveButton, CancelButton, YesButton, DeleteButton, ExportButton, ImportButton, ClearButton, CloseButton, SubmitButton, IconApproveButton, IconRejectButton, IconCancelTaskButton, IconSaveButton, IconDeleteButton, IconEditButton, IconViewButton, } from "../../../AllButtons/AllButtons";
import { useActivity } from "../../../context/ActivityContext";
import { useAlert } from "../../../context/AlertContext";
export const Projects = () => {
  const { addProject, isLoading, message } = useProject();
  const [clientId, setClientId] = useState("");
  const { clients } = useClient();
  const [projectName, setProjectName] = useState("");
  const { activityTags, getActivityTags } = useActivity();
  console.log("project adding tags", activityTags);
  const [showMessage, setShowMessage] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const { showAlert } = useAlert();

   useEffect(() => {
      // Fetch activity tags on component mount
      getActivityTags();
    }, []);

  const handleSubmit = async (e) => {

    e.preventDefault();


    if (!clientId || !projectName || selectedTags.length === 0) {
      showAlert({ variant: "warning", title: "warning", message: "Please fill in all required fields and select at least one activity tag." });
      // setShowMessage(true);
      return;
    }

    if (
      clientId.trim() &&
      projectName.trim()

    ) {
      await addProject(clientId, projectName, selectedTags );
      setClientId("");
      setProjectName("");
      setSelectedTags([]);
      setShowMessage(true);
      setShowModal(false);
    }
    console.log("sending selecting tags", selectedTags);
  };

  const handleTagChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions);
    const selectedValues = selectedOptions.map((option) => parseInt(option.value));
    setSelectedTags(selectedValues);
  };
  

  return (
    <div className="bg-white">
      {/* <h2 className="text-xl font-semibold text-gray-800">Enter Project Details</h2>
      <p className="text-sm text-gray-500 mt-1">Add a new Project to the system</p> */}

      <button
        onClick={() => setShowModal(true)}
        className="add-items-btn"
      >
        Add Projects
      </button>

    {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold text-gray-800">Enter Project Details</h2>
            <p className="text-sm text-gray-500 mt-1">Add a new Project to the system</p>

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
                <label htmlFor="clientName" className="block font-medium text-gray-700 text-sm">
                  Client Name
                </label>
                <select
                  id="clientName"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Select Client</option>
                  {clients?.data?.map((client) => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="projectName" className="block font-medium text-gray-700 text-sm">
                  Project Name
                </label>
                <input
                  id="projectName"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Enter Project Name"
                  className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
  <label className="block font-medium text-gray-700 text-sm mb-1">
    Add Activity Tags
  </label>
  <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
    {activityTags?.map((tag) => (
      <div key={tag.id} className="flex items-center mb-1">
        <input
          type="checkbox"
          id={`tag-${tag.id}`}
          value={tag.id}
          checked={selectedTags.includes(tag.id)}
          onChange={(e) => {
            const tagId = parseInt(e.target.value);
            if (e.target.checked) {
              setSelectedTags((prev) => [...prev, tagId]);
            } else {
              setSelectedTags((prev) => prev.filter((id) => id !== tagId));
            }
          }}
          className="mr-2"
        />
        <label htmlFor={`tag-${tag.id}`} className="text-sm text-gray-700">
          {tag.name}
        </label>
      </div>
    ))}
  </div>

  {selectedTags.length > 0 && (
    <div className="mt-2 flex flex-wrap gap-2">
      {selectedTags.map((tagId) => {
        const tag = activityTags.find((t) => t.id === tagId);
        return (
          <span
            key={tagId}
            className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded"
          >
            {tag?.name}
          </span>
        );
      })}
    </div>
  )}
</div>



              {/* <button
                type="submit"
                className="w-full flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white font-medium p-2 rounded-md transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Adding Project...
                  </>
                ) : (
                  "Submit"
                )}
              </button> */}

              <SubmitButton disabled={isLoading}/>
              <CloseButton onClick={() => setShowModal(false)}/>

              {/* Close Button */}
              {/* <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-full mt-2 bg-red-500 hover:bg-red-600 text-white font-medium p-2 rounded-md transition-colors duration-150"
              >
                Close
              </button> */}
            </form>
          </div>
        </div>
      )}
    </div> 
  );
};
