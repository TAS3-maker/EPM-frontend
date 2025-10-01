import React, { useState, useEffect } from 'react';
import { Clock, Briefcase, ClipboardList, Home, FileText, Save, Trash2, Edit,Calendar } from 'lucide-react';
import { useUserContext } from "../../../context/UserContext";
import { SectionHeader } from '../../../components/SectionHeader';
import { useAlert } from "../../../context/AlertContext";
const Addsheet = () => {

  const { submitEntriesForApproval } = useUserContext();
  const [submitting, setSubmitting] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  // const [view, setView] = useState('dashboard');
  // const [rows, setRows] = useState([]);
  // const [projects, setProjects] = useState([]);
  // const [standups, setStandups] = useState([]);
  // const [users, setUsers] = useState([]);
  // const [profileName, setProfileName] = useState('');
  const { userProjects, loading, error } = useUserContext();
  // const [selectedProject, setSelectedProject] = useState("");
  const [tags, setTags] = useState([]);
  const { showAlert } = useAlert();

  // console.log("projects mounted", userProjects);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    // date: "",
    projectId: "",
    hoursSpent: "",
    billingStatus: "",
    status: "WFO",
    notes: "",
    project_type: "",
    project_type_status: "",
  });
  

  const [showPopup, setShowPopup] = useState(false);
const [confirmShortLeave, setConfirmShortLeave] = useState(false);
// const [submitting, setSubmitting] = useState(false); // already present


  const [savedEntries, setSavedEntries] = useState([]);

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "hoursSpent") {
      value = formatTime(value);
    }

    if (name === "projectId") {
      const selectedProject = userProjects.data.find(project => project.id === parseInt(value));

      if (selectedProject) {
        setTags(selectedProject.tags_activitys);
      }
    }

    if (name === "billingStatus") {
      const selectedTag = tags.find(tag => tag.name.toString() === value);
      if (selectedTag) {
        value = selectedTag.name;
      }
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };


const handleEdit = (index, field, value) => {
  const updatedEntries = [...savedEntries];

  if (field === "projectId") {
    const selectedProject = userProjects.data.find(
      (project) => project.id === parseInt(value)
    );
    if (selectedProject) {
      updatedEntries[index] = {
        ...updatedEntries[index],
        [field]: value,
        tags_activitys: selectedProject.tags_activitys,
      };
    }
  } else {
    if (field === "billingStatus") {
  const selectedTag = tags.find(tag => tag.id.toString() === value);
  if (selectedTag) {
    value = selectedTag.name;
  }
}


    // ❌ Don't reformat hoursSpent again
    updatedEntries[index] = {
      ...updatedEntries[index],
      [field]: value,
    };
  }

  setSavedEntries(updatedEntries);
  console.log("Updated savedEntries:", updatedEntries);
};



useEffect(() => {
  if (formData.projectId) {
    const selectedProject = userProjects?.data?.find(
      (project) => project.id === parseInt(formData.projectId)
    );
    if (selectedProject) {
      setTags(selectedProject.tags_activitys || []);
    }
  }
}, [formData.projectId, userProjects]);




  const handleDelete = (index) => {
  const updatedEntries = savedEntries.filter((_, i) => i !== index);
  setSavedEntries(updatedEntries);
  localStorage.setItem("savedTimesheetEntries", JSON.stringify(updatedEntries));
};


const handleEditClick = (index) => {
  setEditIndex(index);

  const entry = savedEntries[index];
  if (!entry) return; // Prevents crash if index is invalid

  const selectedProjectId = entry.projectId;

  const selectedProject = userProjects?.data?.find(
    (project) => project.id === parseInt(selectedProjectId)
  );

  if (selectedProject) {
    setTags(selectedProject.tags_activitys || []);
  }

  console.log("these are saved entries", savedEntries);
};


  const handleSaveClick = () => {
    // Convert the billingStatus ID to name in savedEntries
   const updatedEntries = savedEntries.map((entry) => {
  const selectedTag = tags.find(tag => tag.id.toString() === entry.billingStatus.toString());
  return {
    ...entry,
    billingStatus: selectedTag ? selectedTag.name : entry.billingStatus,
  };
});


    // Now set the updated entries with the tag name for billingStatus
    setSavedEntries(updatedEntries);

    setEditIndex(null);
    console.log("These are saved entries with tag names:", updatedEntries);
  };


const handleSave = () => {
  if (!formData.date || !formData.projectId || !formData.hoursSpent || !formData.billingStatus) {
    showAlert({
      variant: "warning",
      title: "Warning",
      message: "Please fill all required fields before saving."
    });
    return;
  }

  // Tags may not have loaded properly
 const selectedTag = tags.find(tag => tag.id.toString() === formData.billingStatus.toString());
if (!selectedTag) {
  showAlert({
    variant: "warning",
    title: "Missing Tag",
    message: "Please select a valid Action after choosing the Project."
  });
  return;
}


 const tagName = selectedTag.name;

const newEntry = {
  ...formData,
  billingStatus: tagName, // ✅ Store name instead of ID
};

console.log("neww enteries",newEntry);
  const updated = [...savedEntries, newEntry];
  setSavedEntries(updated);
  localStorage.setItem("savedTimesheetEntries", JSON.stringify(updated));
  console.log("After saving - savedEntries:", updated);

  // Reset form
  setFormData({
    date: new Date().toISOString().split("T")[0],
    projectId: "",
    hoursSpent: "",
    billingStatus: "",
    status: "",
    notes: "",
    project_type: "",
    project_type_status: "",
  });
};





  const formatTime = (time) => {
    if (!time || typeof time !== "string") return "00:00";
    time = time.replace(/[^0-9:]/g, "");
    const parts = time.split(":");

    if (parts.length === 2) {
      const [hh, mm] = parts;
      const hours = hh.padStart(2, "0").slice(0, 2);
      const minutes = mm.padStart(2, "0").slice(0, 2);
      return `${hours}:${minutes}`;
    }
    const numeric = time.replace(/:/g, "");
    if (numeric.length === 4) {
      const hours = numeric.slice(0, 2);
      const minutes = numeric.slice(2);
      return `${hours}:${minutes}`;
    }
    return time;
  };



  const handleSubmit = async () => {
    if (!savedEntries.length) return;

     if (totalHours > 12) {
    // alert("Total hours cannot exceed 12.");
       showAlert({
      variant: "warning",
      title: "Warning",
      message: "Total hours cannot exceed 12."
    });
    return;
  }

  if (totalHours < 8.5 && !confirmShortLeave) {
    setShowPopup(true);
    return;
  }

    const formattedEntries = {
      data: savedEntries.map((entry) => ({
        project_id: entry.projectId,
        date: entry.date,
        time: entry.hoursSpent, // Ensure correct value is stored
        work_type: entry.status,
        activity_type: entry.billingStatus,
        narration: entry.notes,
        project_type: entry.project_type,
        project_type_status: entry.project_type_status,
      })),
    };

    console.log("Final data before submission:", formattedEntries); // Check if it's correct

    setSubmitting(true);
    try {
      await submitEntriesForApproval(formattedEntries);
      // alert("Entries submitted for approval successfully!");
      showAlert({ variant: "success", title: "Success", message: "Entries submitted for approval successfully!" });
      setSavedEntries([]);
localStorage.removeItem("savedTimesheetEntries");

    } catch (error) {
      // alert("Failed to submit entries for approval.");
      showAlert({ variant: "error", title: "Error", message: "Failed to submit entries for approval." });
    } finally {
      setSubmitting(false);
    }
  };

  console.log("Saved entries before submission:", savedEntries);


useEffect(() => {
  const saved = localStorage.getItem("savedTimesheetEntries");
  if (saved) {
    console.log("Loading saved entries from localStorage:", saved);
    setSavedEntries(JSON.parse(saved));
  } else {
    console.log("No entries found in localStorage");
  }
}, []);

const parseHours = (timeStr) => {
  const [hh, mm] = timeStr.split(':').map(Number);
  return hh + mm / 60;
};


const totalHours = savedEntries.reduce((sum, entry) => {
  if (!entry.hoursSpent) return sum;
  return sum + parseHours(entry.hoursSpent);
}, 0);






  return (
    <>
      <div className=" min-h-screen min-w-full overflow-hidden">
        {/* Date Section */}
        <SectionHeader icon={ClipboardList} title="Daily Timesheet" subtitle="Employee Daily Timesheet" />
        {/* <div className="flex items-start justify-between">
          <div><h2 className="text-4xl font-bold text-gray-800">Daily Timesheet</h2></div>
          
        </div> */}
        {/* Timesheet Form */}
        <div className="p-10 ml-0 border min-w-full sm:min-w-[600px] rounded-lg shadow-xl mb-5 lg:mb-0">
          {/* <div className="flex items-center justify-center mb-6">
            <ClipboardList className="w-8 h-8 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-800">Daily Timesheet</h2>
          </div> */}

          <form className="space-y-6">
            {/* Project and Time Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })} // Corrected line
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-700 focus:outline-none"
                  // readOnly
                />
              </div>
              <div className="relative">
                <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
                  Project Name
                </label>
                <select
                  id="projectId"
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out appearance-none bg-white"
                >
                  <option value="">Select Project</option>
                  {loading && <option disabled>Loading...</option>}
                  {error && <option disabled>Error loading projects</option>}
                  {Array.isArray(userProjects?.data) && userProjects.data.length > 0 ? (
                    userProjects.data.map((project) => (
                      <option key={project.id} value={project.id}>{project.project_name}</option>
                    ))
                  ) : (
                    !loading && !error && <option disabled>No projects found</option>
                  )}
                </select>
              </div>
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <label htmlFor="hoursSpent" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-gray-400" />
                  Time Spent
                </label>
                <input
                  type="text"
                  id="hoursSpent"
                  name="hoursSpent"
                  value={formData.hoursSpent}
                  onChange={(e) => {
                    let value = e.target.value.replace(/[^0-9:]/g, "");

                    if (value.length === 2 && !value.includes(":")) {
                      value = value + ":";
                    }

                    if (value.length > 5) {
                      return;
                    }

                    setFormData((prev) => ({ ...prev, hoursSpent: value }));
                  }}
                  className="w-full !text-left px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out text-center"
                  placeholder="HH:MM"
                  maxLength={5}
                  inputMode="numeric"
                  onKeyDown={(e) => {
                    const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight"];
                    const isNumber = /^[0-9]$/.test(e.key);
                    const isColon = e.key === ":";

                    if (!isNumber && !isColon && !allowedKeys.includes(e.key)) {
                      e.preventDefault();
                    }

                    if (e.target.value.length === 2 && e.key !== "Backspace" && !e.target.value.includes(":")) {
                      e.target.value += ":";
                    }
                  }}
                />
              </div>
              <div className="relative">
                <label htmlFor="billingStatus" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <ClipboardList className="w-4 h-4 mr-2 text-gray-400" />
                  Action
                </label>
                <select
                  id="billingStatus"
                  name="billingStatus"
                  value={formData.billingStatus}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out appearance-none bg-white"
                >

                  <option value="">--Select--</option>
                  {tags.length > 0 ? (
                    tags.map((tag, index) => (
                      <option key={index} value={tag.id}>{tag.name}</option> // Display tag name from the tags_activitys array
                    ))
                  ) : (
                    <option disabled>No tags available</option>
                  )}
                </select>
              </div>
             </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Home className="w-4 h-4 mr-2 text-gray-400" />
                  Work Type
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out appearance-none bg-white"
                >
                  <option value="">--Select--</option>
                  <option value="WFO">Work From Office</option>
                  <option value="WFH">Work from Home</option>
                </select>
              </div>
              <div className="relative">
                <label htmlFor="project_type" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <ClipboardList className="w-4 h-4 mr-2 text-gray-400" />
                  Project Type
                </label>
                <select
                  id="project_type"
                  name="project_type"
                  value={formData.project_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out appearance-none bg-white"
                >
                  <option value="">--Select--</option>
                  <option value="Hourly">Hourly</option>
                  <option value="Fixed">Fixed</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative col-span-2">
                <label htmlFor="project_type_status" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Home className="w-4 h-4 mr-2 text-gray-400" />
                  Project Type Status
                </label>
                <select
                  id="project_type_status"
                  name="project_type_status"
                  value={formData.project_type_status}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out appearance-none bg-white"
                >
                  <option value="">--Select--</option>
                  <option value="Offline">Offline</option>
                  {formData.project_type === "Hourly" && <option value="Tracker">Tracker</option>}
                </select>

              </div>
            </div>

            <div className="relative">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <FileText className="w-4 h-4 mr-2 text-gray-400" />
                Narration
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out resize-none"
                placeholder="Enter your notes here"
              ></textarea>
            </div>


            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <button
                type="button"
                onClick={handleSave}
                className="submit-btn"
              >
                <Save className="w-5 h-5 mr-2" />
                Save Timesheet
              </button>
            </div>
          </form>
        </div>
        {/* Timesheet Table */}
        <div className="min-w-screen ml-0 lg:mb-32 rounded">
          <div className="overflow-x-auto">
            {/* Display Saved Entries */}
        {savedEntries.length > 0 && userProjects?.data && (

              <div className="mt-4 bg-white rounded-xl shadow-lg animate-fadeIn border border-[#d3d3d3]">
                <h3 className="text-lg font-semibold p-4 text-gray-800 mb-4 border-b pb-2">Time Entries</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr className="table-bg-heading table-th-tr-row">
                        <th className="px-4 py-3 text-center text-xs font-medium tracking-wider">Date</th>
                        <th className="px-4 py-3 text-center text-xs font-medium tracking-wider">Project</th>
                        <th className="px-4 py-3 text-center text-xs font-medium tracking-wider">Time Spent</th>
                        <th className="px-4 py-3 text-center text-xs font-medium tracking-wider">Action</th>
                        <th className="px-4 py-3 text-center text-xs font-medium tracking-wider">Work Type</th>
                        <th className="px-4 py-3 text-center text-xs font-medium tracking-wider">Narration</th>
                        <th className="px-4 py-3 text-center text-xs font-medium tracking-wider">Project Type</th>
                        <th className="px-4 py-3 text-center text-xs font-medium tracking-wider">Project Type Status</th>
                        <th className="px-4 py-3 text-center text-xs font-medium tracking-wider">Modify</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {savedEntries.map((entry, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{entry.date}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {
                               userProjects?.data?.find((p) => p.id === parseInt(entry.projectId))?.project_name || "Unknown Project"
                            }
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 border">
                            {
                              <span>
                                {entry.hoursSpent}
                              </span>
                            }
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${entry.billingStatus === 'Billable' ? 'bg-green-100 text-green-800' :
                                entry.billingStatus === 'Non Billable' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                {entry.billingStatus}
                              </span>
                            }
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${entry.status === 'WFO' ? 'bg-purple-100 text-purple-800' : 'bg-indigo-100 text-indigo-800'
                                }`}>
                                {entry.status}
                              </span>
                            }
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {
                              entry.notes
                            }
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              {
                                entry.project_type
                              }
                            </td>

                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              {
                                entry.project_type_status
                              }
                            </td>

                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex space-x-2">
                              {
                                <button
                                  onClick={() => handleEditClick(index)}
                                  className="edit-btn"
                                ><Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </button>
                              }
                              <button
                                onClick={() => handleDelete(index)}
                                className="delete-btn"
                              ><Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {editIndex !== null && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-auto">
      <h2 className="text-lg font-semibold mb-4">Edit Entry</h2>

      <div className="grid grid-cols-2 gap-4 text-sm">
        {/* Project */}
        <div>
          <label className="block mb-1">Project</label>
          <select
            value={savedEntries[editIndex].projectId}
            onChange={e => handleEdit(editIndex, "projectId", e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">Select Project</option>
            {loading && <option disabled>Loading...</option>}
            {error && <option disabled>Error loading projects</option>}
            {userProjects?.data?.map(project => (
              <option key={project.id} value={project.id}>
                {project.project_name}
              </option>
            ))}
          </select>
        </div>

  
        <div>
          <label className="block mb-1">Hours Spent</label>
          <input
  type="text"
  value={savedEntries[editIndex].hoursSpent || ""}
  onChange={(e) => {
    let value = e.target.value;

    // Remove any non-digit characters (except colon)
    value = value.replace(/[^0-9]/g, '');

    // Auto-insert colon after 2 digits
    if (value.length > 2) {
      value = value.slice(0, 2) + ':' + value.slice(2, 4);
    }

    // Limit to max 5 characters (HH:MM)
    if (value.length > 5) {
      value = value.slice(0, 5);
    }

    handleEdit(editIndex, "hoursSpent", value);
  }}
  className="w-full border rounded px-2 py-1"
  placeholder="HH:MM"
  maxLength={5}
  inputMode="numeric"
/>






        </div>


        {/* Billing Status */}
        <div>
          <label className="block mb-1">Billing Status</label>
          <select
            value={savedEntries[editIndex].billingStatus}
            onChange={e => handleEdit(editIndex, "billingStatus", e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          >
            {tags.length > 0 ? tags.map((tag,i) => (
              <option key={i} value={tag.id}>{tag.name}</option>
            )) : <option disabled>No tags available</option>}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block mb-1">Status</label>
          <select
            value={savedEntries[editIndex].status}
            onChange={e => handleEdit(editIndex, "status", e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">--Select--</option>
            <option value="WFO">Work From Office</option>
            <option value="WFH">Work from Home</option>
          </select>
        </div>

        {/* Project Type */}
        <div>
          <label className="block mb-1">Project Type</label>
          <select
            value={savedEntries[editIndex].project_type}
            onChange={e => handleEdit(editIndex, "project_type", e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">--Select--</option>
            <option value="Fixed">Fixed</option>
            <option value="Hourly">Hourly</option>
          </select>
        </div>

        {/* Project Type Status */}
        <div>
          <label className="block mb-1">Project Type Status</label>
          <select
            value={savedEntries[editIndex].project_type_status}
            onChange={e => handleEdit(editIndex, "project_type_status", e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">--Select--</option>
            {savedEntries[editIndex].project_type === "Fixed" ? (
              <option value="Offline">Offline</option>
            ) : (
              <>
                <option value="Tracker">Tracker</option>
                <option value="Offline">Offline</option>
              </>
            )}
          </select>
        </div>

        {/* Notes */}
        <div className="col-span-2">
          <label className="block mb-1">Notes</label>
          <input
            type="text"
            value={savedEntries[editIndex].notes}
            onChange={e => handleEdit(editIndex, "notes", e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        <button
          onClick={handleSaveClick}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <Save className="h-4 w-4 mr-1 inline" />
          Save
        </button>
        <button
          onClick={() => handleEditClick(null)}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

                </div>
              </div>
            )}
            
            {savedEntries.length > 0 && (
              <div className="flex justify-center mt-6">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="submit-btn"
                  disabled={submitting}
                >
                  {submitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    "Submit for Approval"
                  )}
                </button>
              </div>
            )}
            {showPopup && (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
    <div className="bg-white p-6 rounded shadow-md max-w-md w-full">
      <h2 className="text-lg font-bold mb-4">Short Leave Confirmation</h2>
      <p className="mb-4">
        Your total hours are less than 8:30. The remaining hours will be considered as short leave.
      </p>
      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          id="confirmShortLeave"
          checked={confirmShortLeave}
          onChange={() => setConfirmShortLeave(!confirmShortLeave)}
          className="mr-2"
        />
        <label htmlFor="confirmShortLeave" className="text-sm">
          I understand and agree to submit with short leave
        </label>
      </div>
      <div className="flex justify-end space-x-3">
        <button
          onClick={() => setShowPopup(false)}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            if (!confirmShortLeave) return;
            setShowPopup(false);
            handleSubmit(); // Re-run submission now that checkbox is checked
          }}
          className={`px-4 py-2 rounded ${
            confirmShortLeave ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          disabled={!confirmShortLeave}
        >
          Submit Anyway
        </button>
      </div>
    </div>
  </div>
)}

          </div>
        </div>
      </div>
    </>
  );
};

export default Addsheet;