import React, { useEffect, useState } from "react";
import { useBDProjectsAssigned } from "../../../context/BDProjectsassigned";
import { Loader2, Users, Building2, Clock, Search, BarChart ,Eye, X} from "lucide-react";
import { Assigned } from "./Assigned";
import { SectionHeader } from '../../../components/SectionHeader';
import {ModifyButton, SyncButton,} from "../../../AllButtons/AllButtons";
import { useAlert } from "../../../context/AlertContext";


function ProjectCard({ project, editProjectId, editProjectName, setEditProjectName, handleEditClick }) {
  const [showRemoveList, setShowRemoveList] = useState(false);
  const [selectedManagers, setSelectedManagers] = useState([]);
  const { removeProjectManagers, loading } = useBDProjectsAssigned();
  const { showAlert } = useAlert();
  const [isOpen, setIsOpen] = useState(false);

  const toggleRemoveList = () => {
    setShowRemoveList(!showRemoveList);
  };

  const handleCheckboxChange = (managerId) => {
    setSelectedManagers((prev) =>
      prev.includes(managerId) ? prev.filter((id) => id !== managerId) : [...prev, managerId]
    );
  };

  const handleRemoveManagers = async () => {
    if (selectedManagers.length === 0) return showAlert({ variant: "warning", title: "Warning", message: "Select at least one manager." });;

    const result = await removeProjectManagers(project.id, selectedManagers);

    if (result.success) {
      showAlert({ variant: "success", title: "Success", message: "manager removed successfully" });
      setShowRemoveList(false);
      setSelectedManagers([]);

    } else {
      showAlert({ variant: "error", title: "Error", message: "Failed to remove managers."});
    }
  };


  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
        <div className="flex justify-between items-end">
          <div className="flex-1">
            {editProjectId === project.id ? (
              <input
                type="text"
                value={editProjectName}
                onChange={(e) => setEditProjectName(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 w-full text-sm"
                autoFocus
              />
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-2 rounded-full text-xs font-semibold bg-blue-500 text-white shadow-sm inline-block">
                    {project.project_name}
                  </span>
                  {/* <SyncButton 
                  /> */}
                </div>
                {/* <div className="flex items-center justify-between"> */}
                <Assigned selectedProjectId={project.id} />
                <div className="flex items-center mt-3 text-gray-700">
                  <Building2 className="h-4 w-4 text-blue-600" />
                  <h3 className="text-base ml-2 font-medium">{project.client_name}</h3>
                </div>
                {/* </div> */}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-2">
        <div className="flex items-center text-sm font-medium text-gray-700">
          <Users className="h-4 w-4 text-blue-600 mr-3 mt-1" />
          <span className="font-medium text-gray-700 block mb-1 mt-2">Project Managers</span>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
          <div className="flex items-center">
            <div>
              {Array.isArray(project.project_managers) && project.project_managers.length > 0 ? (
                project.project_managers.map((pm) => (
                  <div key={pm.id} className="text-gray-700">{pm.name}</div>
                ))
              ) : (
                "N/A"
              )}
            </div>
          </div>

          {Array.isArray(project.project_managers) &&
            project.project_managers.some((pm) => pm.id !== null) && (
              <ModifyButton onClick={toggleRemoveList} />
            )}
        </div>

        {showRemoveList && (
          <div className="mt-3 p-3 bg-gray-100 rounded-lg">
            {Array.isArray(project.project_managers) && project.project_managers.length > 0 ? (
              project.project_managers.map((pm) => (
                <div key={pm.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`pm-${pm.id}`}
                    checked={selectedManagers.includes(pm.id)}
                    onChange={() => handleCheckboxChange(pm.id)}
                  />
                  <label htmlFor={`pm-${pm.id}`} className="text-gray-700">
                    {pm.name}
                  </label>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No managers assigned.</p>
            )}
            <div className="flex gap-3" >
            <button
              onClick={handleRemoveManagers}
              className="mt-3 bg-blue-500 text-white px-3 py-1 rounded-lg text-xs font-medium shadow hover:bg-blue-600 transition"
              disabled={loading}
            >
              {loading ? "Removing..." : "Confirm Remove"}
            </button>
                <button
              onClick={() => setShowRemoveList(false)}
              className="mt-3 bg-blue-500 text-white px-3 py-1 rounded-lg text-xs font-medium shadow hover:bg-blue-600 transition"
              disabled={loading}
            >
    cancel
            </button>
          </div>
          </div>
        )}
        {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md max-h-[80vh] rounded-xl p-5 relative overflow-hidden shadow-lg">
            {/* Close Icon */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-semibold mb-4 text-gray-800">User List</h2>

            {/* Scrollable List */}
            <div className="overflow-y-auto max-h-[60vh] space-y-3 pr-2">
         {project.assigned_users.map((user) => (                <div
                  key={user.id}
                  className="flex items-center text-sm bg-gray-50 rounded-lg p-3"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-medium mr-3">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">{user.name}</div>
                    <div className="text-gray-500 text-xs">{user.email}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
        <div className="space-y-3">
          <div className="flex items-center text-sm font-medium text-gray-700">
            <Users className="h-4 w-4 text-blue-600 mr-2 mt-1" />
            <span className="font-medium text-gray-700 block mb-1 mt-2">Assigned Users</span>
          </div>
          {Array.isArray(project.assigned_users) && project.assigned_users.length > 0 ? (
            <div className="grid gap-2">
              {/* {project.assigned_users.map((user) => ( */}
                <div  className="flex items-center text-sm bg-gray-50 rounded-lg p-3">
                  {/* <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-medium mr-3">
                    {/* {user.name.charAt(0)} */}
                  {/* </div> */} 
                  {/* <div>
                    <div className="font-medium text-gray-700">{user.name}</div>
                    <div className="text-gray-500 text-xs">{user.email}</div>
                  </div> */}
                         <button onClick={() => setIsOpen(true)}>
        <Eye className="w-5 h-5 text-gray-600 hover:text-black" />
      </button>
                </div>
              {/* // ))} */}
            </div>
          ) : (
            <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">No assigned users</div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center text-sm font-medium text-gray-700">
            <Clock className="h-4 w-4 text-blue-600 mr-3 mt-1" />
            <span className="font-medium text-gray-700 block mb-1 mt-2">Deadline</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
            <div>
              {project.deadline || "N/A"}
            </div>
          </div>
        </div>
      </div>
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
        return project.project_name.toLowerCase().includes(searchTerm.toLowerCase());
      case "project_manager":
        return project.project_managers?.some((pm) =>
          pm.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      case "deadline":
        return project.deadline === searchTerm;
      default:
        return true;
    }
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * projectsPerPage,
    currentPage * projectsPerPage
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-lg max-h-screen overflow-y-auto">
      <SectionHeader icon={BarChart} title="Assigned Projects" subtitle="View, edit, and manage your team's assigned projects" />
      <div className="sticky top-0 bg-white p-4 z-10 shadow-md">
        <div className="flex justify-end gap-4 flex-wrap md:flex-nowrap items-center gap-3 border p-2 rounded-lg shadow-md bg-white">
          {filterOption === "deadline" ? (
            <input
              type="date"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <div className="flex items-center w-full border border-gray-300 px-2 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
              <Search className="h-5 w-5 text-gray-400 mr-[5px]" />
              <input
                type="text"
                className="w-full rounded-lg focus:outline-none py-2"
                placeholder={`Search by ${filterOption.replace("_", " ")}`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}
          <select
            value={filterOption}
            onChange={(e) => setFilterOption(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="project_name">Project Name</option>
            <option value="project_manager">Project Manager</option>
            <option value="deadline">Deadline</option>
          </select>
        </div>
      </div>

      <div className="p-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="bg-white rounded-lg shadow-md px-6 py-4 flex items-center">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500 mr-3 mt-1" />
              <span className="text-gray-600 font-medium">Loading assigned projects...</span>
            </div>
          </div>
        ) : paginatedProjects.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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

            {/* Pagination */}
            <div className="flex justify-center mt-8">
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`px-4 py-2 mx-1 rounded-lg ${currentPage === index + 1
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700"
                    }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No matching projects found</h3>
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
