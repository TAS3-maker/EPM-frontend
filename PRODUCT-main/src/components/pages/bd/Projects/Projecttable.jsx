import React, { useEffect, useState } from "react";
import { useProject } from "../../../context/ProjectContext";
import { useClient } from "../../../context/ClientContext";
import { Edit, Save, Trash2, Loader2, Calendar, User, Briefcase, Clock, FileText, Target, BarChart, Search, CheckCircle, XCircle, Pencil, Ban } from "lucide-react";
import { Projects } from './Projects';
import { SectionHeader } from '../../../components/SectionHeader';
import { exportToExcel, importFromExcel, useImportEmployees, fetchGoogleSheetData } from "../../../components/excelUtils";
import { EditButton, SaveButton, CancelButton, DeleteButton, ExportButton, ImportButton, ClearButton, IconApproveButton, IconRejectButton, IconCancelTaskButton, IconSaveButton, IconDeleteButton, IconEditButton, IconViewButton } from "../../../AllButtons/AllButtons";
import { useActivity } from "../../../context/ActivityContext";

export const Projecttable = () => {
  const { projects, fetchProjects, editProject, deleteProject, isLoading } = useProject();
  const { clients } = useClient(); // Getting clients data
  const [editProjectId, setEditProjectId] = useState(null);
  const [editClientId, setEditClientId] = useState('');
  const [editProjectName, setEditProjectName] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteclient, setDeleteclient] = useState("");
  const [editid, setEditid] = useState(null);
  const [filterBy, setFilterBy] = useState("name"); // Default filter by name
  const [showImportOptions, setShowImportOptions] = useState(false); // FIX: Define state
  const [editTags, setEditTags] = useState([]);

   const { getActivityTags, activityTags, loading, message } = useActivity();
  
    useEffect(() => {
      // Fetch activity tags on component mount
      getActivityTags();
    }, []);
  

  useEffect(() => {
    fetchProjects();
  }, []);


  console.log("projects in the house", projects);


  const filteredProjects = projects.filter((project) => {
    let value = "";

    if (filterBy === "client_name") {
      value = project.client?.name?.toLowerCase() || "";
    } else {
      value = project[filterBy]?.toLowerCase() || "";
    }

    return value.includes(searchQuery.toLowerCase());
  });


  const clearFilter = () => {
    setSearchQuery("");
    setFilterBy("name");
  };


  const handleEditClick = (project) => {
    setEditProjectId(project.id);
    setEditClientId(project.client?.id || "");
    setEditProjectName(project.project_name);
    setEditTags(project.tags_activities?.map(tag => tag.id) || []);
  };


  const handleSaveClick = async () => {
    if (!editProjectName.trim()) return;

    const updatedData = {
      client_id: editClientId,
      project_name: editProjectName,
      tags_activitys: editTags,

    };

    setIsUpdating(true);
    await editProject(editProjectId, updatedData);
    setIsUpdating(false);
    setEditProjectId(null);
  };


  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-md max-h-screen overflow-y-auto">
      <SectionHeader icon={BarChart} title="Projects Management" subtitle="View, edit and manage Projects" />
      {/* <div className="flex justify-between items-center p-4">
        <div className="my-2">
          <h2 className="text-xl font-semibold text-gray-800">Projects Management</h2>
          <p className="text-sm text-gray-500 mt-1">View, edit and manage Projects</p>
        </div>
        <Projects />
      </div> */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 sticky top-0 bg-white p-4 z-10 shadow-md">
        <Projects />

        <div className="flex flex-wrap md:flex-nowrap items-center gap-3 border p-2 rounded-lg shadow-md bg-white">
          {/* <input
            type="text"
            placeholder={`Search by ${filterBy}`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-2 border rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          /> */}

          <div className="flex items-center w-full border border-gray-300 px-2 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
            <Search className="h-5 w-5 text-gray-400 mr-[5px]" />
            <input
              type="text"
              className="w-full rounded-lg focus:outline-none py-2"
              placeholder={`Search by ${filterBy}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="px-3 py-2 border rounded-md bg-white cursor-pointer focus:outline-none"
          >
            <option value="client_name">Client Name</option>
            <option value="project_name">Project Name</option>
          </select>

          {/* <button
            onClick={() => clearFilter()}
            className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
          >
            Clear
          </button> */}
          {/* <button
            onClick={() => setShowImportOptions(!showImportOptions)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Import
          </button> */}
          {/* <button
            onClick={() => exportToExcel(clients.data || [], "clients.xlsx")}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
          >
            Export to Excel
          </button> */}
          <ClearButton onClick={() => clearFilter()} />
          <ImportButton onClick={() => setShowImportOptions(!showImportOptions)} />
          <ExportButton onClick={() => exportToExcel(clients.data || [], "clients.xlsx")} />

        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          <table className="w-full">
            <thead className="border-b border-gray-800 bg-black text-white">
              <tr className="table-th-tr-row table-bg-heading">
                <th className="px-4 py-2 font-medium items-center text-sm">Client Name</th>
                <th className="px-4 py-2 font-medium items-center text-sm">Project Name</th>
                <th className="px-4 py-2 font-medium items-center text-sm">Tags</th>
                <th className="px-4 py-2 font-medium items-center text-sm">Created Date</th>
                <th className="px-4 py-2 font-medium items-center text-sm">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-500 mr-2" />
                      <span className="text-gray-500">Loading projects...</span>
                    </div>
                  </td>
                </tr>
              ) : projects?.length > 0 ? (
                filteredProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 items-center text-center text-gray-800 font-medium text-sm">
                      {editProjectId === project.id ? (
                        <select
                          value={editClientId}
                          onChange={(e) => setEditClientId(e.target.value)}
                          className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 w-full"
                        >
                          {clients?.data?.map((client) => (
                            <option key={client.id} value={client.id}>{client.name}</option>
                          ))}
                        </select>
                      ) : (
                        project.client ? project.client.name : "No Client"
                      )}
                    </td>
                    <td className="px-6 py-4 items-center text-center text-gray-800 font-medium text-sm">
                      {editProjectId === project.id ? (
                        <input
                          type="text"
                          value={editProjectName}
                          onChange={(e) => setEditProjectName(e.target.value)}
                          className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 w-full"
                          autoFocus
                        />
                      ) : (
                        project.project_name
                      )}
                    </td>

                    <td className="px-6 py-4 items-center text-center text-gray-700 text-sm">
  {editProjectId === project.id ? (
    <div className="flex flex-wrap gap-2 justify-center">
      {activityTags?.map((tag) => (
        <label key={tag.id} className="flex items-center space-x-1">
          <input
            type="checkbox"
            value={tag.id}
            checked={editTags.includes(tag.id)}
            onChange={(e) => {
              if (e.target.checked) {
                setEditTags([...editTags, tag.id]);
              } else {
                setEditTags(editTags.filter((id) => id !== tag.id));
              }
            }}
            className="form-checkbox h-4 w-4 text-blue-600"
          />
          <span className="text-gray-700 text-sm">{tag.name}</span>
        </label>
      ))}
    </div>
  ) : project.tags_activities?.length > 0 ? (
    project.tags_activities.map(tag => tag.name).join(", ")
  ) : (
    "—"
  )}
</td>



                    <td className="px-6 py-4 items-center text-center text-gray-600 text-sm">
                      {project.created_at}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        {editProjectId === project.id ? (
                          <>
                            {/* <button onClick={handleSaveClick} disabled={isUpdating} className="flex items-center px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-md transition disabled:opacity-50">
                              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />} Save
                            </button> */}
                            <IconSaveButton onClick={handleSaveClick} disabled={isUpdating} />
                            {/* <button
                              onClick={() => setEditProjectId(null)}
                              className="flex items-center justify-center px-3 py-1.5 border border-gray-500 text-gray-500 hover:bg-gray-50 rounded-md transition"
                            >
                              Cancel
                            </button> */}
                            <IconCancelTaskButton onClick={() => setEditProjectId(null)} />
                          </>
                        ) : (
                          <>
                            {/* <button onClick={() => handleEditClick(project)} className="flex items-center px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-md transition">
                              <Edit className="h-4 w-4 mr-1" /> Edit
                            </button> */}
                            <IconEditButton onClick={() => handleEditClick(project)} />
                            {/* <button onClick={() => {
                              setEditid(project.id);
                              setDeleteclient(true);
                            }} className={`flex items-center px-3 py-1.5 rounded-md transition ${deleteConfirm === project.id ? "bg-red-500 hover:bg-red-600 text-white" : "border border-red-500 text-red-500 hover:bg-red-50"}`}>
                              <Trash2 className="h-4 w-4 mr-1" /> {deleteConfirm === project.id ? "Confirm" : "Delete"}
                            </button> */}
                            <IconDeleteButton onClick={() => { setEditid(project.id); setDeleteclient(true); }} />
                          </>
                        )}

                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center">No Projects found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {deleteclient && (
        <div
          className="fixed inset-0 bg-gray-800 bg-opacity-70 flex items-center justify-center z-50"
          role="dialog"
          aria-labelledby="deleteModalLabel"
          aria-describedby="deleteModalDescription"
        >
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full m-2">
            <div className="flex justify-between items-center mb-4">
              <h2 id="deleteModalLabel" className="text-lg font-semibold">
                Are you sure you want to delete this folder?
              </h2>
            </div>
            <div
              id="deleteModalDescription"
              className="text-sm text-gray-600 mb-4"
            >
              This action cannot be undone. Please confirm if you'd like to
              proceed.
            </div>            <div className="flex justify-end gap-2 my-2">
              <button
                onClick={() => setDeleteclient(false)}
                className="border-2 border-blue-500 text-gray-700 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </button>              <button
                onClick={() => {
                  deleteProject(editid);
                  setDeleteclient(false);
                }}
                className="bg-blue-500 text-white px-6 py-2 rounded flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
