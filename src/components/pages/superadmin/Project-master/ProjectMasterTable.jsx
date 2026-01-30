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

export const ProjectMasterTable = () => {
  const {
    fetchProjectMasterFrontDetails,
    editProjectMaster,
    deleteProjectMaster,
    isLoading,
    projectMastersFrontDetails
  } = useProjectMaster();
const token=localStorage.getItem("userToken")
  const { permissions } = usePermissions();
  const { getActivityTags } = useActivity();
  const navigate = useNavigate();
  const userRole = localStorage.getItem("user_name");
  const { importClientData } = useImport();

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

  const itemsPerPage = 10;
  const employeePermission = permissions?.permissions?.[0]?.projects;
  const canEdit = employeePermission === "2";

  // Load initial data
  useEffect(() => {
    fetchProjectMasterFrontDetails();
  }, []);

  // Filter & mapping logic
  useEffect(() => {
    if (!projectMastersFrontDetails?.length) {
      setFilteredProjects([]);
      return;
    }

    const mapped = projectMastersFrontDetails.map(item => ({
      id: item.id,
      project_name: item.project_name || "—",
      project_type: item.project_type || "-",
      status: item.project_status || "Active",
      client_id: item.client_id || "",
      client_name: item.client_name || "—",
      tags_activities: item.project_tag_activity ? [{ name: item.project_tag_activity }] : [],
      created_at: item.created_at,
      fullData: item,
      assignees: []
    }));

    const filtered = mapped.filter(project => {
      let value = "";
      switch (filterBy) {
        case "client_name":
          value = (project.client_name || "").toLowerCase().trim();
          break;
        case "project_name":
          value = (project.project_name || "").toLowerCase().trim();
          break;
        case "project_status":
          value = (project.status || "").toLowerCase().trim();
          break;
        case "project_tags":
          value = project.tags_activities?.map(tag => tag.name).join(" ").toLowerCase().trim() || "";
          break;
        default:
          value = (project[filterBy] || "").toLowerCase().trim();
      }

      const search = searchQuery.toLowerCase().trim();
      if (search && !value.includes(search)) return false;

      return true;
    });

    setFilteredProjects(filtered);
  }, [projectMastersFrontDetails, searchQuery, filterBy, selectedEmpType]);

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => setCurrentPage(1), [searchQuery, filterBy]);

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

  const clearFilter = () => {
    setSearchQuery("");
    setFilterBy("project_name");
  };

  // ===== EDIT FLOW =====
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
      alert(err.message || "Could not load project"); // Or your showAlert
    }
  };

  const handleEditSave = async () => {
    if (!editProject) return;

    try {
      await editProjectMaster(editProject.id, editProject);
      await fetchProjectMasterFrontDetails();
    } catch (err) {
      console.error("Edit failed:", err);
    } finally {
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
      await fetchProjectMasterFrontDetails();
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

  // ===== TABLE =====
  const tableColumns = [
    { key: "client_name", label: "Client", render: p => <span title={p.client_name}>{p.client_name?.slice(0,8)}...</span> },
    { key: "project_name", label: "Project Name", render: p => <span title={p.project_name}>{p.project_name?.slice(0,8)}...</span> },
    { key: "project_type", label: "Type", render: p => <span>{p.fullData?.project_tracking === "0" ? "Fixed" : "Hourly"}</span> },
    { key: "status", label: "Status", render: p => <span>{p.status}</span> },
    { key: "tags_activities", label: "Tags", render: p => (
        p.tags_activities?.length > 0 ? p.tags_activities.map((t,i) => <span key={i}>{t.name}</span>) : "—"
      )
    },
    { key: "created_at", label: "Created", render: p => formatDate(p.created_at) }
  ];

  const actionsComponent = {
    right: project => (
      <div className="flex items-center gap-1 justify-center">
        <button
          onClick={e => { e.stopPropagation(); navigate(`/${userRole}/projects/tasks/${project.id}`); }}
          title="View Project"
        >
          <IconViewButton />
        </button>
        {canEdit && (
          <>
            <IconEditButton
              onClick={e => { e.stopPropagation(); handleEditClick(project); }}
              title="Edit Project"
            />
            <IconDeleteButton
              onClick={e => { e.stopPropagation(); handleDeleteClick(project.id); }}
              title="Delete Project"
            >
              <Trash2 />
            </IconDeleteButton>
          </>
        )}
      </div>
    )
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-md max-h-screen overflow-y-auto">
      <SectionHeader icon={BarChart} title="Projects Management" subtitle="View, edit and manage Projects" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 sm:sticky top-0 bg-white border-b z-10 shadow-md">
        <ProjectsMaster />
        <div className="flex flex-wrap md:flex-nowrap items-center gap-2 border px-2 py-1.5 rounded-lg shadow-md bg-white min-w-[300px]">
          <div className="flex items-center flex-1 border border-gray-300 px-3 py-1.5 rounded-lg">
            <Search />
            <input
              type="text"
              placeholder={`Search by ${filterBy.replace('_',' ')}`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <select value={filterBy} onChange={e => setFilterBy(e.target.value)}>
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
      <GlobalTable
        data={filteredProjects}
        paginatedData={paginatedProjects}
        columns={tableColumns}
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        enablePagination={true}
        hideActions={false}
        actionsComponent={actionsComponent}
        emptyStateTitle="No projects found"
        emptyStateMessage="Try adjusting your search or filter criteria."
      />

      {/* Edit Modal */}
      {showEditModal && editProject && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
          
              <ProjectsMaster
                isEditMode={true}
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
