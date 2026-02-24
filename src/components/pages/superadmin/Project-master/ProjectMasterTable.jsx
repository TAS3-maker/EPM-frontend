import React, { useEffect, useState } from "react";
import { useProjectMaster } from "../../../context/ProjectMasterContext";
import { Search, BarChart, Trash2 } from "lucide-react";
import { ProjectsMaster } from "./ProjectsMaster";
import { SectionHeader } from '../../../components/SectionHeader';
import { exportToExcel } from "../../../components/excelUtils";
import { ClearButton, IconViewButton, IconEditButton,IconDeleteButton, ImportButton, ExportButton } from "../../../AllButtons/AllButtons";
import { useActivity } from "../../../context/ActivityContext";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "../../../context/PermissionContext";
import { useImport } from "../../../context/Importfiles.";
import { useOutsideClick } from "../../../components/useOutsideClick";
import GlobalTable from "../../../components/GlobalTable";
import { API_URL } from "../../../utils/ApiConfig"; // Ensure you have API_URL and token
import { LayoutGrid, List } from "lucide-react";
import { ProjectGridView } from "../../../components/ProjectGridView.jsx";

export const ProjectMasterTable = () => {
  const {
    fetchProjectMasterFrontDetails,
    editProjectMaster,
    deleteProjectMaster,
    isLoading,
    projectMastersFrontDetails,
      paginationMeta,      // ✅ ADD THIS
       totalPages           // ✅ ADD THIS
  } = useProjectMaster();
const token=localStorage.getItem("userToken")
  const { permissions } = usePermissions();
  const { getActivityTags } = useActivity();
  const navigate = useNavigate();
  const userRole = localStorage.getItem("user_name");
  const { importClientData } = useImport();
const [viewType, setViewType] = useState(() => {
  return localStorage.getItem("projectViewType") || "list";
});

  // States
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterBy, setFilterBy] = useState("project_name");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteProjectId, setDeleteProjectId] = useState(null);
  const [selectedEmpType, setSelectedEmpType] = useState("All");
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [showImportOptions, setShowImportOptions] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const employeePermission = permissions?.permissions?.[0]?.projects;
  const canEdit = employeePermission === "2";

useEffect(() => {
  fetchProjectMasterFrontDetails(1, 10);  
}, []);



 

 const formatDate = dateString => {
  if (!dateString) return "—";

  try {
    // Expecting "22-09-25" as "YY-MM-DD"
    const parts = dateString.split("-");
    if (parts.length !== 3) return "—";

    let [dd,mm,yy] = parts;
    // Convert to full year
    yy = parseInt(yy, 10);
    yy += yy < 100 ? 2000 : 0; // '22' => 2022

    const date = new Date(yy, parseInt(mm, 10) - 1, parseInt(dd, 10));
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return "—";
  }
};
const handlePageChange = (page) => {
  setCurrentPage(page);
  fetchProjectMasterFrontDetails(page, 10);  // Fetch new page from API
};

const clearFilter = () => {
  setSearchQuery("");
  setFilterBy("project_name");
  setCurrentPage(1);
  fetchProjectMasterFrontDetails(1, 10,{});  // Clear → page 1
};
const handleEditClick = async (project) => {
  try {
    const response = await fetch(`${API_URL}/api/projects-master/${project.id}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to fetch project details");

    setEditProject(data);      
    setShowEditModal(true);
  } catch (err) {
    console.error("Failed to fetch project for edit:", err);
    alert(err.message || "Could not load project");
  }
};
const handleEditSave = async (updatedProjectData) => {
  if (!editProject?.id) {
    console.error("❌ No project ID for edit!");
    setShowEditModal(false);
    setEditProject(null);
    return;
  }

  try {
    console.log("💾 Saving project ID:", editProject.id);
    const result = await editProjectMaster(editProject.id, updatedProjectData);
    console.log("✅ Edit result:", result);
  } catch (err) {
    console.error("Edit failed:", err);
  } finally {
    // 🔥 Close modal AFTER API call completes
    setShowEditModal(false);
    setEditProject(null);
  }
};
  // ===== DELETE FLOW =====
  const handleDeleteClick = projectId => {
    setDeleteProjectId(projectId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteProjectId) return;
    try {
      await deleteProjectMaster(deleteProjectId);
    } catch (err) {
      console.error(err);
    } finally {
      setShowDeleteModal(false);
      setDeleteProjectId(null);
    }
  };

  // ===== IMPORT FLOW =====
  const handleImportSubmit = async () => {
    if (!selectedFile) return;
    await importClientData(selectedFile);
    setSelectedFile(null);
    await fetchProjectMasterFrontDetails();
    setCurrentPage(1);
  };

  const handleCloseImportOptions = () => {
    setShowImportOptions(false);
    setSelectedFile(null);
  };
  const importOptionsRef = useOutsideClick(showImportOptions, handleCloseImportOptions);
useEffect(() => {
  localStorage.setItem("projectViewType", viewType);
}, [viewType]);

  // ===== TABLE =====
  const tableColumns = [
    { key: "client_name", label: "Client", width: "150px", render: p => <span title={p.client_name}>{p.client_name?.slice(0,25)}...</span> },
    { key: "project_name", label: "Project Name", width: "150px", render: p => <span title={p.project_name}>{p.project_name?.slice(0,25)}...</span> },
    { key: "project_type", label: "Type", width: "120px", render: p => <span>{p.project_tracking === "0" ? "Fixed" : "Hourly"}</span> },
    { key: "status", label: "Status", width: "100px", render: p => <span>{p.project_status}</span> },
    { key: "tags_activities", label: "Tags", width: "120px", render: p => <span>{p.project_tag_activity}</span>
    },
    { key: "created_at", label: "Created", width: "120px", render: p => formatDate(p.created_at) }
  ];
const actionsComponent = React.useMemo(() => ({
  right: (project) => (
    <div className="flex items-center gap-1 justify-center">
      <button
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/${userRole}/projects/tasks/${project.id}`);
        }}
        title="View Project"
      >
        <IconViewButton />
      </button>

      {canEdit && (
        <>
          <IconEditButton
            onClick={(e) => {
              e.stopPropagation();
              handleEditClick(project);
            }}
            title="Edit Project"
          />

          <IconDeleteButton
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(project.id);
            }}
            title="Delete Project"
          >
            <Trash2 />
          </IconDeleteButton>
        </>
      )}
    </div>
  ),
}), [canEdit, userRole]);


  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-md max-h-screen overflow-y-auto">
      <SectionHeader icon={BarChart} title="Projects Management" subtitle="View, edit and manage Projects" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 sm:sticky top-0 bg-white border-b z-10 shadow-md">
        <ProjectsMaster />
        <div className="flex flex-wrap md:flex-nowrap items-center gap-2 border px-2 py-1.5 rounded-lg shadow-md bg-white min-w-[300px]">
          <div className="flex items-center gap-1 border rounded-lg p-1">
  <button
    onClick={() => setViewType("list")}
    className={`p-1 rounded ${viewType === "list" ? "bg-gray-200" : ""}`}
  >
    <List size={18} />
  </button>

  <button
    onClick={() => setViewType("grid")}
    className={`p-1 rounded ${viewType === "grid" ? "bg-gray-200" : ""}`}
  >
    <LayoutGrid size={18} />
  </button>
</div>

          <div className="flex items-center flex-1 border border-gray-300 px-3 py-1.5 rounded-lg">
            <Search className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder={`Search by ${filterBy.replace('_',' ')}`}
              value={searchQuery}
           onChange={e => {
  setSearchQuery(e.target.value);
  setCurrentPage(1);  // Reset to page 1
  fetchProjectMasterFrontDetails(1, 10, { search: e.target.value ,
     search_by: filterBy 
  });  // Send to API
}}
            />
          </div>

    <select 
  value={filterBy} 
  onChange={e => {
    setFilterBy(e.target.value);
    setCurrentPage(1);
    // ✅ Trigger search with new filter field
    if (searchQuery) {
      fetchProjectMasterFrontDetails(1, 10, {
        search: searchQuery,
        search_by: e.target.value
      });
    }
  }}
>
  <option value="project_name">Project Name</option>
  <option value="client_name">Client Name</option>
  <option value="project_status">Project Status</option>
  <option value="project_tags">Tags</option>
</select>


          <ClearButton onClick={clearFilter} />
          <ImportButton onClick={() => setShowImportOptions(true)} />
          <ExportButton onClick={() => {
            const exportData = (projectMastersFrontDetails || []).map(item => ({
              "Client Name": item.client_name || "—",
              "Project Name": item.project_name || "—",
              "Project Status": item.project_status || "Active",
              "Tags": item.project_tag_activity || "—",
              "Created At": item.created_at || "—"
            }));
            exportToExcel(exportData, "projects_master.xlsx");
          }} />
        </div>
      </div>

      {/* Table */}
      {viewType === "list" ? (
      <GlobalTable
        data={projectMastersFrontDetails}
        columns={tableColumns}
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages || 1}  
       onPageChange={handlePageChange} 
        enablePagination={true}
        hideActions={false}
         actionHeaderClassName="w-[130px]"
        actionsComponent={actionsComponent}
        emptyStateTitle="No projects found"
        emptyStateMessage="Try adjusting your search or filter criteria."
         onRowClick={(project) =>
          navigate(`/${userRole}/projects/tasks/${project.id}`)
        }
      />
      ) : (
  <ProjectGridView
    projects={projectMastersFrontDetails}
    isLoading={isLoading}
    actionsComponent={actionsComponent}
  />
)}

      {/* Edit Modal */}
      {showEditModal && editProject && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
          
              <ProjectsMaster
                isEditMode={true}
                projectId={editProject.id} 
                editProject={editProject}
                onSaveSuccess={handleEditSave}
                onCancel={() => { setShowEditModal(false); setEditProject(null); }}
              />
      
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <Trash2 className="mx-auto h-12 w-12 text-red-600" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Delete Project?</h3>
              <p className="mt-2 text-sm text-gray-500">This action cannot be undone.</p>
            </div>
            <div className="flex gap-3 pt-4">
              <button onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button onClick={handleDeleteConfirm}>Delete Project</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
