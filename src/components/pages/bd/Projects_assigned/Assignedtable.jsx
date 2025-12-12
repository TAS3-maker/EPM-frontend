import React, { useEffect, useState } from "react";
import { useBDProjectsAssigned } from "../../../context/BDProjectsassigned";
import {
  Loader2,
  Users,
  Building2,
  Search,
  BarChart,
  Eye,
  X,
} from "lucide-react";
import { Assigned } from "./Assigned";
import { SectionHeader } from "../../../components/SectionHeader";
import { ModifyButton } from "../../../AllButtons/AllButtons";
import { useAlert } from "../../../context/AlertContext";
import Pagination from "../../../components/Pagination";
import { useTLContext } from "../../../context/TLContext";
import { usePMContext } from "../../../context/PMContext";

function ProjectCard({
  project,
  editProjectId,
  editProjectName,
  setEditProjectName,
}) {
  const { removeProjectManagers, fetchAssigned, loading: pmLoading } =
    useBDProjectsAssigned();
  const { deleteEmployee } = useTLContext();
  const { deleteTeamLeader } = usePMContext();
  const { showAlert } = useAlert();

  // unified removal state
  const [removeState, setRemoveState] = useState({
    open: false,
    type: null, // 'pm' | 'tl' | 'employee'
    selected: [],
  });

  const [isViewUsersOpen, setIsViewUsersOpen] = useState(false);

  const openRemoveModal = (type) => {
    setRemoveState({ open: true, type, selected: [] });
  };

  const closeRemoveModal = () => {
    setRemoveState({ open: false, type: null, selected: [] });
  };

  const toggleSelect = (id) => {
    setRemoveState((prev) => ({
      ...prev,
      selected: prev.selected.includes(id)
        ? prev.selected.filter((item) => item !== id)
        : [...prev.selected, id],
    }));
  };

  const handleRemovePMs = async () => {
    if (!removeState.selected.length) {
      showAlert({
        variant: "warning",
        title: "Warning",
        message: "Select at least one manager.",
      });
      return;
    }

    const result = await removeProjectManagers(project.id, removeState.selected);

    if (result?.success) {
      showAlert({
        variant: "success",
        title: "Success",
        message: "Manager(s) removed successfully",
      });
      await fetchAssigned();
      closeRemoveModal();
    } else {
      showAlert({
        variant: "error",
        title: "Error",
        message: "Failed to remove managers.",
      });
    }
  };

  const handleRemoveEmployees = async () => {
    if (!removeState.selected.length) {
      showAlert({
        variant: "warning",
        title: "Warning",
        message: "Select at least one employee.",
      });
      return;
    }

    const result = await deleteEmployee(project.id, removeState.selected);

    if (result?.success !== false) {
      showAlert({
        variant: "success",
        title: "Success",
        message: "Employee(s) removed successfully",
      });
      await fetchAssigned();
      closeRemoveModal();
    } else {
      showAlert({
        variant: "error",
        title: "Error",
        message: "Failed to remove employees.",
      });
    }
  };

  const handleRemoveTLs = async () => {
    if (!removeState.selected.length) {
      showAlert({
        variant: "warning",
        title: "Warning",
        message: "Select at least one team leader.",
      });
      return;
    }

    const results = await Promise.all(
      removeState.selected.map((tlId) => deleteTeamLeader(project.id, [tlId]))
    );

    const success = results.some((r) => r?.success !== false);
    if (success) {
      showAlert({
        variant: "success",
        title: "Success",
        message: "Team Leader(s) removed successfully",
      });
      await fetchAssigned();
      closeRemoveModal();
    } else {
      showAlert({
        variant: "error",
        title: "Error",
        message: "Failed to remove TL(s).",
      });
    }
  };

  const getRemovalList = () => {
    if (removeState.type === "pm") return project.project_managers || [];
    if (removeState.type === "tl") return project.tls || [];
    if (removeState.type === "employee") return project.assigned_users || [];
    return [];
  };

  const handleConfirmRemoval = async () => {
    if (removeState.type === "pm") return handleRemovePMs();
    if (removeState.type === "tl") return handleRemoveTLs();
    if (removeState.type === "employee") return handleRemoveEmployees();
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-4 border-b border-gray-100">
        <div className="flex justify-between items-end">
          <div className="flex-1">
            {editProjectId === project.id ? (
              <input
                type="text"
                value={editProjectName}
                onChange={(e) => setEditProjectName(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 w-full text-xs sm:text-sm"
                autoFocus
              />
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-3 py-[6px] sm:py-2 rounded-full text-xs font-semibold bg-blue-500 text-white shadow-sm inline-block">
                    {project.project_name}
                  </span>
                </div>
                <Assigned selectedProjectId={project.id} />
                <div className="flex items-center mt-2 text-gray-700">
                  <Building2 className="h-3 sm:h-4 w-3 sm:w-4 text-blue-600" />
                  <h3 className="text-xs sm:text-sm ml-1 sm:ml-2 font-medium">
                    {project.client_name}
                  </h3>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 py-2 space-y-3">
        {/* Project Managers */}
        <div>
          <div className="flex items-center text-xs sm:text-sm font-medium text-gray-700 mb-1">
            <Users className="h-3 sm:h-4 w-3 sm:w-4 text-blue-600" />
            <span className="ml-1 sm:ml-2 mt-1">Project Managers</span>
          </div>
          <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
            <div>
              {Array.isArray(project.project_managers) &&
              project.project_managers.length > 0
                ? project.project_managers.map((pm) => (
                    <div key={pm.id} className="text-gray-700">
                      {pm.name}
                    </div>
                  ))
                : "N/A"}
            </div>
            {Array.isArray(project.project_managers) &&
              project.project_managers.some((pm) => pm.id !== null) && (
                <ModifyButton onClick={() => openRemoveModal("pm")} />
              )}
          </div>
        </div>

        {/* Assigned Users */}
        <div>
          <div className="flex items-center text-xs sm:text-sm font-medium text-gray-700">
            <Users className="h-3 sm:h-4 w-3 sm:w-4 text-blue-600" />
            <span className="ml-1 sm:ml-2 mt-1 sm:mt-2">Assigned Users</span>
          </div>
          {Array.isArray(project.assigned_users) &&
          project.assigned_users.length > 0 ? (
            <div className="grid gap-2 mt-1">
              <div className="flex flex-row justify-between items-center text-xs sm:text-sm bg-gray-50 rounded-lg p-2">
                <button onClick={() => setIsViewUsersOpen(true)}>
                  <Eye className="w-4 sm:w-5 h-4 sm:h-5 text-gray-600 hover:text-black" />
                </button>
                {project.assigned_users.some((user) => user.id !== null) && (
                  <ModifyButton onClick={() => openRemoveModal("employee")} />
                )}
              </div>
            </div>
          ) : (
            <div className="text-xs sm:text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
              No assigned users
            </div>
          )}
        </div>

        {/* Team Leaders */}
        <div>
          <div className="flex items-center text-xs sm:text-sm font-medium text-gray-700">
            <Users className="h-3 sm:h-4 w-3 sm:w-4 text-blue-600" />
            <span className="ml-1 sm:ml-2 mt-1">Team Leader</span>
          </div>
          <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
            <div>
              {Array.isArray(project.tls) && project.tls.length > 0
                ? project.tls.map((tl) => (
                    <span
                      key={tl.id}
                      className="inline-flex items-center bg-gray-100 rounded-full px-3 py-1 text-xs sm:text-sm font-medium text-gray-700 shadow-sm mr-2 mb-1"
                    >
                      {tl.name}
                    </span>
                  ))
                : "N/A"}
            </div>
            {Array.isArray(project.tls) &&
              project.tls.length > 0 &&
              project.tls.some((tl) => tl.id !== null) && (
                <ModifyButton onClick={() => openRemoveModal("tl")} />
              )}
          </div>
        </div>

        {/* Type and Status */}
        <div>
          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center text-xs sm:text-sm font-medium mt-2">
              <Building2 className="mr-1 sm:mr-2 w-4 sm:w-5 h-4 sm:h-5" />
              <span>Type:</span>
            </div>
            <div className="bg-green-500 text-white text-sm sm:text-base w-[63px] text-center rounded capitalize py-[1px]">
              {project.project_type || "N/A"}
            </div>
          </div>

          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center text-xs sm:text-sm font-medium mt-2">
              <Building2 className="mr-1 sm:mr-2 w-4 sm:w-5 h-4 sm:h-5" />
              <span>Status:</span>
            </div>
            <div>
              <span
                className={`px-2 text-sm sm:text-base w-[63px] block py-[2px] rounded ${
                  project.project_status === "online"
                    ? "bg-green-500"
                    : "bg-red-600"
                } text-white`}
              >
                {project.project_status
                  ? project.project_status.charAt(0).toUpperCase() +
                    project.project_status.slice(1)
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Unified removal modal */}
      {removeState.open && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md max-h-[80vh] rounded-xl p-5 relative overflow-hidden shadow-lg">
            <button
              onClick={closeRemoveModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Remove{" "}
              {removeState.type === "pm"
                ? "Project Managers"
                : removeState.type === "tl"
                ? "Team Leaders"
                : "Employees"}
            </h2>

            <div className="overflow-y-auto max-h-[50vh] space-y-3 pr-2">
              {getRemovalList().map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                >
                  <input
                    type="checkbox"
                    checked={removeState.selected.includes(item.id)}
                    onChange={() => toggleSelect(item.id)}
                  />
                  <div>
                    <div className="text-gray-800 text-sm font-medium">
                      {item.name}
                    </div>
                    {item.email && (
                      <div className="text-gray-500 text-xs">{item.email}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={handleConfirmRemoval}
                disabled={!removeState.selected.length || pmLoading}
                className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg text-xs font-medium shadow hover:bg-blue-600 transition disabled:opacity-50"
              >
                {pmLoading ? "Removing..." : "Confirm Remove"}
              </button>
              <button
                onClick={closeRemoveModal}
                className="flex-1 bg-gray-400 text-white px-3 py-2 rounded-lg text-xs font-medium shadow hover:bg-gray-500 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View users modal */}
      {isViewUsersOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md max-h-[80vh] rounded-xl p-5 relative overflow-hidden shadow-lg">
            <button
              onClick={() => setIsViewUsersOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              User List
            </h2>

            <div className="overflow-y-auto max-h-[60vh] space-y-3 pr-2">
              {project.assigned_users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center text-sm bg-gray-50 rounded-lg p-3"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-medium mr-3">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">
                      {user.name}
                    </div>
                    <div className="text-gray-500 text-xs">{user.email}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const Assignedtable = () => {
  const { assignedData, fetchAssigned, isLoading } = useBDProjectsAssigned();
  const [editProjectId, setEditProjectId] = useState(null);
  const [editProjectName, setEditProjectName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOption, setFilterOption] = useState("project_name");
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 9;

  useEffect(() => {
    fetchAssigned();
  }, []);

  const filteredProjects = assignedData?.filter((project) => {
    if (!searchTerm) return true;
    switch (filterOption) {
      case "project_name":
        return project.project_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());
      case "project_manager":
        return project.project_managers?.some((pm) =>
          pm.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      default:
        return true;
    }
  }) || [];

  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * projectsPerPage,
    currentPage * projectsPerPage
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-lg max-h-screen overflow-y-auto">
      <SectionHeader
        icon={BarChart}
        title="Assigned Projects"
        subtitle="View, edit, and manage your team's assigned projects"
      />
      <div className="sticky top-0 bg-white px-4 py-2 sm:py-4 z-10 shadow-md">
        <div className="flex justify-end gap-2 sm:gap-4 flex-wrap md:flex-nowrap items-center border p-2 rounded-lg shadow-md bg-white">
          <div className="flex items-center w-full border border-gray-300 px-2 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
            <Search className="h-5 w-5 text-gray-400 mr-[5px]" />
            <input
              type="text"
              className="w-full rounded-lg focus:outline-none text-sm sm:text-base py-1 sm:py-2"
              placeholder={`Search by ${filterOption.replace("_", " ")}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={filterOption}
            onChange={(e) => setFilterOption(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1 sm:py-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-500"
          >
            <option value="project_name">Project Name</option>
            <option value="project_manager">Project Manager</option>
          </select>
        </div>
      </div>

      <div className="p-4 sm:p-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="bg-white rounded-lg shadow-md px-6 py-4 flex items-center">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500 mr-3 mt-1" />
              <span className="text-gray-600 font-medium">
                Loading assigned projects...
              </span>
            </div>
          </div>
        ) : paginatedProjects.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  editProjectId={editProjectId}
                  editProjectName={editProjectName}
                  setEditProjectName={setEditProjectName}
                />
              ))}
            </div>

            <div className="flex justify-center mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No matching projects found
            </h3>
            <p className="text-gray-500 text-center max-w-md">
              Try adjusting the filter or search criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Assignedtable;
