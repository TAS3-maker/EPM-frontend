import React, { useEffect, useState } from "react";
import { useProjectMaster } from "../../../context/ProjectMasterContext";
import { useMasterClient } from "../../../context/MasterClientContext";
import { Search, Loader2, Info, BarChart,Loader } from "lucide-react";
import { ProjectsMaster } from "./ProjectsMaster";
import { SectionHeader } from '../../../components/SectionHeader';
import { exportToExcel } from "../../../components/excelUtils";
import { ClearButton, IconViewButton, IconEditButton, IconDeleteButton, CancelButton, ImportButton, ExportButton } from "../../../AllButtons/AllButtons";
import { useActivity } from "../../../context/ActivityContext";
import { useNavigate } from "react-router-dom";
import Pagination from "../../../components/Pagination";
import { usePermissions } from "../../../context/PermissionContext";
import { Trash2, X } from "lucide-react";
import { useImport } from "../../../context/Importfiles.";
import { FaFileCsv } from "react-icons/fa";

export const ProjectMasterTable = () => {
  // Contexts
  const { projectMasters, fetchProjectMasters, editProjectMaster, deleteProjectMaster, isLoading } = useProjectMaster();
  const { permissions } = usePermissions();
  const { getActivityTags } = useActivity();
  const navigate = useNavigate();
const userRole = localStorage.getItem("user_name");

const { importClientData, importLoading } = useImport();
  // States
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterBy, setFilterBy] = useState("client_name");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteProjectId, setDeleteProjectId] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const [showImportOptions, setShowImportOptions] = useState(false);
    const [importType, setImportType] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
 const [selectedEmpType, setSelectedEmpType] = useState("Assigned");
const [filteredProjects, setFilteredProjects] = useState([]);
  const itemsPerPage = 10;

  // Load data
  useEffect(() => {
    fetchProjectMasters();
    getActivityTags();
  }, []);

  const employeePermission = permissions?.permissions?.[0]?.projects;
  const canEdit = employeePermission === "2";

  // ✅ FIXED TAGS: Complete mapping with proper tag handling
  const mappedProjects = (projectMasters || []).map(item => {
    // 🔥 TAGS LOGIC - Priority based fallback
    let tags_activities = [];
    
    // Priority 1: Check project.project_tag_activity (1,2,3)
    if (item.project?.project_tag_activity) {
      const tagMap = {
        '1': 'No Work',
        '2': 'In House', 
        '3': 'Billable'
      };
      tags_activities = [{ name: tagMap[item.project.project_tag_activity] || 'Unknown' }];
    }
    // Priority 2: Check relation.project_tag_activity_data array
    else if (item.relation?.project_tag_activity_data?.length > 0) {
      tags_activities = item.relation.project_tag_activity_data.map(tag => ({ 
        name: tag.name || tag.activity_name || tag 
      }));
    }
    // Priority 3: Check any tags_activities array
    else if (item.tags_activities?.length > 0) {
      tags_activities = item.tags_activities.map(tag => ({ 
        name: tag.name || tag.activity_name || tag 
      }));
    }
    // Fallback
    else {
      tags_activities = [{ name: '—' }];
    }


 
    return {
      id: item.project?.id || item.id,
      project_name: item.project?.project_name || "—",
      project_type: item.project_type || item.project?.project_type || "Hourly",
      status: item.status || item.project?.project_status || "Active",
      project_status: item.project_status || "online",
      client_id: item.relation?.client_id || item.client_id,
      client_name: item.relation?.client?.client_name || item.relation?.client || item.client || "No Client",
      tags_activities: tags_activities,
      created_at: item.project?.created_at || item.created_at,
      fullData: item,
      assignees: item.relation?.assignees || []
    };
  });

  // ✅ FIXED: Search with proper nested data access
useEffect(() => {
  // ✅ Use your inline filter logic directly
  const filtered = mappedProjects.filter((project) => {
    let value = "";
    switch(filterBy) {
      case "client_name":
        value = (project.client_name || "").toLowerCase().trim();
        break;
      case "project_name":
        value = (project.project_name || "").toLowerCase().trim();
        break;
      default:
        value = (project[filterBy] || "").toLowerCase().trim();
    }
    
    const search = searchQuery.toLowerCase().trim();
    if (!value.includes(search)) return false;
    
    const hasAssignees = project.assignees && project.assignees.length > 0;
if(selectedEmpType==="All"){
  return true;
}else if(selectedEmpType==="Assigned"){
  return hasAssignees;
}else{
  return !hasAssignees;
}
  });
  setFilteredProjects(filtered);
}, [mappedProjects, searchQuery, filterBy, selectedEmpType]);

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
      });
    } catch {
      return "—";
    }
  };


  const clearFilter = () => {
    setSearchQuery("");
    setFilterBy("client_name");
  };

  // ✅ VIEW
 const handleViewClick = (projectId) => {
    navigate(`/${userRole}/projects/tasks/${projectId}`);
  };

  // ✅ EDIT - Fixed!
  const handleEditClick = (project) => {
    console.log("🔧 Editing project:", project);
    setEditProject(project.fullData);
    setShowEditModal(true);
  };

  // ✅ DELETE
  const handleDeleteClick = (projectId) => {
    setDeleteProjectId(projectId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteProjectId) {
      try {
        await deleteProjectMaster(deleteProjectId);
        await fetchProjectMasters();
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
    setShowDeleteModal(false);
    setDeleteProjectId(null);
  };

  // Pagination
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterBy]);


const handleImportSubmit = async () => {
    if (!selectedFile) return;

    await importClientData(selectedFile);
    setImportType("");
    setSelectedFile(null);
    fetchProjectMasters();
    setCurrentPage(1);
  };


  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-md max-h-screen overflow-y-auto">
      <SectionHeader icon={BarChart} title="Projects Management" subtitle="View, edit and manage Projects" />
      
      {/* Header with search */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:sticky top-0 bg-white border-b z-10 shadow-md">
        <ProjectsMaster />
       
        <div className="flex flex-wrap md:flex-nowrap items-center gap-3 border p-2 rounded-lg shadow-md bg-white min-w-[300px]">
          <div className="flex items-center flex-1 border border-gray-300 px-3 py-2 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
            <Search className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              className="flex-1 outline-none bg-transparent text-sm"
              placeholder={`Search by ${filterBy.replace('_', ' ')}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm cursor-pointer focus:outline-none min-w-[120px]"
          >
            <option value="client_name">Client Name</option>
            <option value="project_name">Project Name</option>
          </select>
          
          <ClearButton onClick={clearFilter} className="px-3 py-2 text-xs" />
          <ImportButton onClick={() => setShowImportOptions(true)}/>
          <ExportButton
            onClick={() =>
              exportToExcel(mappedProjects || [], "master-projects.xlsx")
            }
          />
        </div>
       {userRole!="team" && (
            <div className="flex items-center gap-3 px-3">
            <label className="text-sm font-medium text-gray-700 text-nowrap">Filter by:</label>
            <button
              onClick={() => setSelectedEmpType("All")}
              className={`px-4 py-2 rounded-md ${selectedEmpType === "All" ? "w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl font-semibold text-md hover:shadow-lg hover:scale-105 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 ease-in-out hover:shadow-lg hover:-translate-y-0.5" : "bg-gray-200 text-gray-700"}`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedEmpType("Assigned")}
              className={`px-4 py-2 rounded-md ${selectedEmpType === "Assigned" ? "w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl font-semibold text-md hover:shadow-lg hover:scale-105 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 ease-in-out hover:shadow-lg hover:-translate-y-0.5" : "bg-gray-200 text-gray-700"}`}
            >
              Assigned
            </button>
            <button
              onClick={() => setSelectedEmpType("Unassigned")}
              className={`px-4 py-2 rounded-md ${selectedEmpType === "Unassigned" ? "w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl font-semibold text-md hover:shadow-lg hover:scale-105 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 ease-in-out hover:shadow-lg hover:-translate-y-0.5" : "bg-gray-200 text-gray-700"}`}
            >
            Unassigned
            </button>
          </div>
      )}
      </div>

      {/* Table */}   
      <div className="overflow-x-auto">
        <table className="w-full sm:table-fixed" >
          <thead className="border-b border-gray-800 bg-black text-white">
            <tr className="table-th-tr-row table-bg-heading whitespace-nowrap sm:whitespace-normal">
              <th className="px-3 py-2 font-medium items-center text-xs">Client</th>
              <th className="px-3 py-2 font-medium items-center text-xs">Project Name</th>
              <th className="px-3 py-2 font-medium items-center text-xs">Type</th>
              <th className="px-3 py-2 font-medium items-center text-xs">Status</th>
              <th className="px-3 py-2 font-medium items-center text-xs">Proj Status</th>
              <th className="px-3 py-2 font-medium items-center text-xs">Tags</th>
              <th className="px-3 py-2 font-medium items-center text-xs">Created</th>
              <th className="px-3 py-2 font-medium items-center text-xs">Actions</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan="8" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center space-y-2">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <span className="text-sm text-gray-500">Loading projects...</span>
                  </div>
                </td>
              </tr>
            ) : mappedProjects.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                  No projects found
                </td>
              </tr>
            ) : (
              paginatedProjects.map((project, index) => (
                <tr key={project.id} className="hover:bg-gray-50 transition-colors whitespace-nowrap">
                  {/* Client Name */}
                  <td className="px-4 py-4 items-center text-center text-xs text-gray-600 font-normal">
                   
                      <span className="truncate" title={project.client_name}>
                        {project.client_name?.slice(0, 8)}...
                      </span>
                   
                  </td>

                  {/* Project Name */}
                  <td className="px-4 py-4 items-center text-center text-xs text-gray-600 font-normal">
                    <span className="truncate" title={project.project_name}>
                      {project.project_name?.slice(0, 8)}...
                    </span>
                  </td>

                  {/* Project Type */}
                  <td className="px-4 py-4 items-center text-center text-xs text-gray-600 font-normal">
                    <span className="px-2 leading-5 rounded-full bg-blue-100 text-blue-800">
                      {project.project_type}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4 items-center text-center text-xs text-gray-600 font-normal">
                    <span className={`px-2 inline-flex leading-5 rounded-full ${
                      project.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status}
                    </span>
                  </td>

                  {/* Project Status */}
                  <td className="px-4 py-4 items-center text-center text-xs text-gray-600 font-normal">
                    <span className={`px-2 inline-flex leading-5 rounded-full ${
                      project.project_status === 'online'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {project.project_status?.toUpperCase() || '—'}
                    </span>
                  </td>

                  {/* Tags - ✅ FIXED DISPLAY */}
                  <td className="px-4 py-4 items-center text-center text-xs text-gray-600 font-normal">
                    {project.tags_activities?.length > 0 && project.tags_activities[0]?.name !== '—' ? (
                      <div className="">
                        {project.tags_activities.slice(0, 2).map((tag, idx) => (
                          <span key={idx} className="px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded">
                            {tag.name}
                          </span>
                        ))}
                        {project.tags_activities.length > 2 && (
                          <span className="text-xs text-gray-500">+{project.tags_activities.length - 2}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">—</span>
                    )}
                  </td>

                  {/* Created Date */}
                  <td className="px-4 py-4 items-center text-center text-xs text-gray-600 font-normal">
                    {formatDate(project.created_at)}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                
                      <div className="flex items-center gap-1">
                        <button
                        onClick={() => handleViewClick(project.id)}
                            className="p-1.5  bg-white text-black rounded transition-colors"
                          title="View Project"
                        >
                          <IconViewButton className="h-4 w-4" />
                        </button>
                        {canEdit && (
                          <>
                        <IconEditButton 
                          onClick={() => handleEditClick(project)}
                          title="Edit Project"
                          className="text-green-600 hover:text-green-900"
                        />
                        <button
                          onClick={() => handleDeleteClick(project.id)}
                          className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                          title="Delete Project"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        </>
                        )}
                      </div>
                
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-200 bg-white">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

{showImportOptions && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="font-semibold mb-4 text-center">
              Select Import Type
            </h3>

            <button
              onClick={() => {
                setImportType("excel");
                setShowImportOptions(false);
              }}
              className="flex items-center justify-center gap-3 border p-3 rounded w-full"
            >
              <FaFileCsv className="text-green-600 text-xl" />
              Import CSV / Excel
            </button>

            <div className="mt-4 text-center">
              <CancelButton onClick={() => setShowImportOptions(false)} />
            </div>
          </div>
        </div>
      )}


      {importType === "excel" && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          {!importLoading ? (
            <div className="bg-white p-6 rounded-lg w-96">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="border p-2 w-full mb-4"
              />

              <button
                onClick={handleImportSubmit}
                disabled={!selectedFile}
                className="bg-blue-600 text-white w-full py-2 rounded"
              >
                Upload
              </button>

              <div className="mt-3 text-center">
                <CancelButton onClick={() => setImportType("")} />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Loader className="animate-spin text-white w-10 h-10" />
              <p className="text-white">Importing...</p>
            </div>
          )}
        </div>
      )}


      {/* ✅ EDIT MODAL */}
      {showEditModal && editProject && (
        <div className="">
         
            {/* Header */}
            {/* <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Edit Project</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Project ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">{editProject.project?.id}</span>
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditProject(null);
                  }}
                  className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div> */}

            {/* Form */}
            <div className="flex-1 overflow-y-auto p-6">
              <ProjectsMaster 
                isEditMode={true}
                editProject={editProject}
                onSaveSuccess={() => {
                  setShowEditModal(false);
                  setEditProject(null);
                  fetchProjectMasters();
                }}
                onCancel={() => {
                  setShowEditModal(false);
                  setEditProject(null);
                }}
              />
            </div>
         
        </div>
      )}

      {/* ✅ DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Delete Project?</h3>
              <p className="mt-2 text-sm text-gray-500">
                This action cannot be undone. This will permanently delete the project and all related data.
              </p>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


