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
  const [showMessage, setShowMessage] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const { showAlert } = useAlert();
  const [projectType, setProjectType] = useState("");
  const [project1Status, setProject1Status] = useState("");
  const [errors, setErrors] = useState({});
  const [projectStatus, setProjectStatus] = useState("");
const [searchQuery, setSearchQuery] = useState("");
const [filteredClients, setFilteredClients] = useState([]);
const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);

// Filter clients on searchQuery change
useEffect(() => {
  if (!searchQuery.trim()) {
    // Show all clients if search input is empty
    setFilteredClients(clients?.data || []);
    return;
  }
  const filtered = clients?.data?.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  ) || [];
  setFilteredClients(filtered);
}, [searchQuery, clients]);



  useEffect(() => {
  if (activityTags && activityTags.length > 0) {
    const billableTag = activityTags.find((tag) => tag.name === "Billable");
    if (billableTag && !selectedTags.includes(billableTag.id)) {
      setSelectedTags([billableTag.id]); 
    }
  }
}, [activityTags]);

   useEffect(() => {
      // Fetch activity tags on component mount
      getActivityTags();
    }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Adding project with data:", { clientId, projectName, selectedTags, projectType,project1Status,projectStatus });

    if (!clientId || !projectName || selectedTags.length === 0 || !projectType || !projectStatus || !project1Status) {
      showAlert({ variant: "warning", title: "warning", message: "Please fill in all required fields and select at least one activity tag." });
      // setShowMessage(true);
      return;
    }

    if (
      clientId &&
      projectName

    ) {
      await addProject(clientId, projectName, selectedTags ,projectType ,projectStatus,project1Status);
      setClientId("");
      setProjectName("");
      setProjectType("");
      setSelectedTags([]);
      setShowMessage(true);
      setProjectStatus("");
      setProject1Status("");

      setShowModal(false);
    }
    console.log("sending selecting tags", selectedTags);
  };

  const handleTagChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions);
    const selectedValues = selectedOptions.map((option) => parseInt(option.value));
    setSelectedTags(selectedValues);
  };
  

    const getErrorMessage = (field) => {
    if (errors[field] && Array.isArray(errors[field])) {
      return errors[field][0]; // Laravel often sends an array of messages
    }
    return errors[field]; // For simple string errors or frontend errors
  };

  const handleClientSelect = (selectedId) => {
    setClientId(selectedId);
    const selectedClient = clients?.data?.find(client => client.id === selectedId);
    if (selectedClient) {
      setSearchQuery(selectedClient.name);
    }
    setFilteredClients([]);
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
            <div className="flex justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Enter Project Details</h2>
                  <p className="text-sm text-gray-500 mt-1">Add a new Project to the system</p>
                </div>
              <button className="font-bold" onClick={() => setShowModal(false)}>X</button>
            </div>

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
  <div className="relative">
  <label htmlFor="clientSearch" className="block font-medium text-gray-700 text-sm">
    Client Name
  </label>
  <input
    id="clientSearch"
    type="text"
    className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
    placeholder="Search client by name"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    autoComplete="off"
    onFocus={() => setIsClientDropdownOpen(true)}
  />
  {isClientDropdownOpen && filteredClients.length > 0 && (
    <ul className="absolute z-50 w-full mt-1 max-h-40 overflow-auto border border-gray-300 rounded-md bg-white">
      {filteredClients.map((client) => (
        <li
          key={client.id}
          onClick={() => {
            handleClientSelect(client.id);
            setIsClientDropdownOpen(false);
          }}
          className="cursor-pointer px-3 py-2 hover:bg-blue-100"
        >
          {client.name}
        </li>
      ))}
    </ul>
  )}
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

     <div>
                <label
                  htmlFor="directProjectType"
                  className="block font-medium text-gray-700 text-sm"
                >
                  Project Type
                </label>
                <select
                  id="directProjectType"
                  value={projectType}
                  onChange={(e) => {
                    setProjectType(e.target.value);
                    setErrors({ ...errors, project_type: null });
                  }}
                  className={`w-full p-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                    getErrorMessage('project_type') ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select Project Type</option>
                  <option value="fixed">Fixed</option>
                  <option value="hourly">Hourly</option>
                </select>
                {getErrorMessage('project_type') && (
                  <p className="text-red-500 text-xs mt-1">
                    {getErrorMessage('project_type')}
                  </p>
                )}
              </div>
              <div>
  <label
    htmlFor="projectStatus"
    className="block font-medium text-gray-700 text-sm"
  >
    Project Status
  </label>
  <select
    id="projectStatus"
    value={projectStatus}
      onChange={(e) => {
        console.log("Selected project status:", e.target.value);
                    setProjectStatus(e.target.value);
                    setErrors({ ...errors, project_type: null });
                  }}
    className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
  >
    <option value="">Select Project status</option>
    <option value="online">Online</option>
    <option value="offline">Offline</option>
  </select>
</div>
              <div>
  <label
    htmlFor="project1Status"
    className="block font-medium text-gray-700 text-sm"
  >
  Status
  </label>
  <select
    id="project1Status"
    value={project1Status}
     onChange={(e) => {
        console.log("Selected project status:", e.target.value);
                    setProject1Status(e.target.value);
                    setErrors({ ...errors, project_type: null });
                  }}
    className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
  >
       <option value="">Select Status Type</option>
    <option value="Active">Active</option>
    <option value="Inactive">Inactive</option>
    <option value="Cancelled">Cancelled</option>
  </select>
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
              {/* <CloseButton /> */}

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
