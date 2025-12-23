import React, { useState, useRef, useEffect, useMemo } from "react";
import { 
  Loader2, Calendar, Clock, Users, BriefcaseBusiness, Briefcase, 
  CheckCircle2, ChevronLeft, ChevronRight, Search, XCircle, X, User 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBDProjectsAssigned } from "../../../context/BDProjectsassigned";  // ✅ WORKING CONTEXT
import { usePMContext } from "../../../context/PMContext";                 // ✅ WORKING CONTEXT  
import { useTLContext } from "../../../context/TLContext";                 // ✅ WORKING CONTEXT
import { SectionHeader } from '../../../components/SectionHeader';
import { ClearButton, AssignButton } from "../../../AllButtons/AllButtons";
import { usePermissions } from "../../../context/PermissionContext";
import { Assigned } from "./Assigned";  // ✅ YOUR WORKING ASSIGN MODAL

import { useAlert } from "../../../context/AlertContext";

const PaginationControls = ({ totalPages, currentPage, handlePrevPage, handleNextPage, totalItems, itemsPerPage, setItemsPerPage }) => {
    const showPaginationButtons = totalItems > 0 && itemsPerPage !== 'all';
    const showItemsPerPageDropdown = totalItems > 0;

    if (totalItems === 0 && itemsPerPage === 'all') return null;

    return (
        <div className="flex justify-between items-center flex-col sm:flex-row gap-2 px-1 sm:px-4 py-4 border-t border-gray-200 bg-white sticky bottom-0 z-2 mt-4 rounded-b-xl">
            {showItemsPerPageDropdown && (
                <div className="flex items-center text-sm text-gray-700">
                    Projects per page:
                    <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(e.target.value); }} className="ml-2 px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value={6}>6</option>
                        <option value={9}>9</option>
                        <option value={12}>12</option>
                        <option value="all">All</option>
                    </select>
                </div>
            )}
            {showPaginationButtons && (
                <div className="flex items-center space-x-2">
                    <button onClick={handlePrevPage} disabled={currentPage === 1}
                        className={`px-1 sm:px-2 py-2 text-sm sm:text-base rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'} transition-colors duration-150 flex items-center`}>
                        <ChevronLeft className="h-4 sm:h-5 w-4 sm:w-5 mr-1" /> Previous
                    </button>
                    <span className="text-sm font-medium text-gray-700">Page {currentPage} of {totalPages}</span>
                    <button onClick={handleNextPage} disabled={currentPage === totalPages}
                        className={`p-2 rounded-md ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'} transition-colors duration-150 flex items-center`}>
                        Next <ChevronRight className="h-4 sm:h-5 w-4 sm:w-5 ml-1" />
                    </button>
                </div>
            )}
        </div>
    );
};

// ✅ UPDATED ProjectCard - Shows PM/TL/Employee + Assign Button
const ProjectCard = ({ project, expandedProjects, setExpandedProjects,handleDelete, navigate }) => {
    const maxVisible = 2;
    const employees = project.assigned_users || [];      // ✅ BDProjectsAssigned field
    const teamLeaders = project.tls || [];               // ✅ BDProjectsAssigned field
    const projectManagers = project.project_managers || []; // ✅ BDProjectsAssigned field
    const isExpanded = expandedProjects?.[project.id] || false;
    const hasMoreEmployees = employees.length > maxVisible;
    const hasMoreTLs = teamLeaders.length > maxVisible;

    // ✅ Show ALL projects with ANY assignments (PM/TL/Employee)
    if (employees.length === 0 && teamLeaders.length === 0 && projectManagers.length === 0) return null;

    return (
        <div className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
            <div className="relative">
                <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                <div className="py-4 px-3">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-full">
                            <div className="flex items-start justify-between">
                                <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 mb-2">
                                    {project.project_name || "N/A"}
                                </h3>
                                <div className="flex items-center px-3 py-1.5 bg-green-50 text-green-600 rounded-full cursor-pointer hover:bg-green-100 transition-colors duration-200"
                                    onClick={() => navigate(`/superadmin/tasks/${project.id}`)}>
                                    <CheckCircle2 className="w-4 h-4 mr-1" />
                                    <span className="text-[12px] font-medium">Tasks</span>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Users className="w-4 h-4 text-gray-400" />
                                <p className="text-xs text-gray-600">{project.client?.name || "N/A"}</p>
                            </div>
                        </div>
                    </div>

                    {/* ✅ ALL INFO BOXES (unchanged) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 w-full">
                        <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors duration-300 flex flex-col items-center">
                            <div className="flex items-center mb-1">
                                <Calendar className="w-4 sm:w-5 h-4 sm:h-5 text-blue-500" />
                                <span className="text-xs font-medium text-gray-600 ml-2">Start Date</span>
                            </div>
                            <span className="text-sm font-bold text-gray-900">{project.start_date || "N/A"}</span>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors duration-300 flex flex-col items-center">
                            <div className="flex items-center mb-1">
                                <Clock className="w-4 sm:w-5 h-4 sm:h-5 text-blue-500" />
                                <span className="text-xs font-medium text-gray-600 ml-2">Total Hours</span>
                            </div>
                            <span className="text-sm font-bold text-gray-900">{project.total_hours || "N/A"}</span>
                        </div>
                        {/* ... other info boxes unchanged ... */}
                    </div>

                    {/* ✅ PM/TL/EMPLOYEE SECTIONS + ASSIGN BUTTON */}
                    <div className="space-y-3">
                        {/* Project Managers */}
                        {projectManagers.length > 0 && (
                            <div className="pt-4 border-t border-gray-100">
                                <p className="font-semibold text-sm text-gray-800 mb-2 flex items-center">
                                    <User className="w-4 h-4 mr-2 text-blue-500" />
                                    Project Managers ({projectManagers.length})
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {projectManagers.slice(0, maxVisible).map((pm) => (
                                        <span key={pm.id} className="inline-flex items-center bg-blue-100 rounded-full px-3 py-1 text-xs font-medium text-blue-700">
                                            {pm.name}
                                               <button className="ml-2 text-red-500 hover:text-red-700"
 onClick={async () => {
            await handleDelete(project.id, pm.id, pm.name, 'PM');  // ✅ AWAIT!
          }}                                                title={`Remove ${pm.name}`}>
                                                <XCircle className="h-4 w-4" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Team Leaders */}
                        {teamLeaders.length > 0 && (
                            <div className="pt-4 border-t border-gray-100">
                                <p className="font-semibold text-sm text-gray-800 mb-2 flex items-center">
                                    <User className="w-4 h-4 mr-2 text-green-500" />
                                    Team Leaders ({teamLeaders.length})
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {(isExpanded ? teamLeaders : teamLeaders.slice(0, maxVisible)).map((tl) => (
                                        <span key={tl.id} className="inline-flex items-center bg-green-100 rounded-full px-3 py-1 text-xs font-medium text-green-700 shadow-sm">
                                            {tl.name}
                                            <button className="ml-2 text-red-500 hover:text-red-700"
 onClick={async () => {
            await handleDelete(project.id, tl.id, tl.name, 'TL');  // ✅ AWAIT!
          }}                                                title={`Remove ${tl.name}`}>
                                                <XCircle className="h-4 w-4" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                {hasMoreTLs && (
                                    <button onClick={() => setExpandedProjects((prev) => ({ ...prev, [project.id]: !prev[project.id] }))}>
                                        {isExpanded ? "Show Less" : `View All (${teamLeaders.length})`}
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Employees */}
                        {employees.length > 0 && (
                            <div className="pt-4 border-t border-gray-100">
                                <p className="font-semibold text-sm text-gray-800 mb-2 flex items-center">
                                    <User className="w-4 h-4 mr-2 text-purple-500" />
                                    Assigned Employees ({employees.length})
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {(isExpanded ? employees : employees.slice(0, maxVisible)).map((employee) => (
                                        <span key={employee.id} className="inline-flex items-center bg-purple-100 rounded-full px-3 py-1 text-xs font-medium text-purple-700 shadow-sm">
                                            {employee.name}
                                            <button className="ml-2 text-red-500 hover:text-red-700"
onClick={async () => {
            await handleDelete(project.id, employee.id, employee.name, 'Employee');  // ✅ AWAIT!
          }}                                                title={`Remove ${employee.name}`}>
                                                <XCircle className="h-4 w-4" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>


                    <div className="mt-4 pt-4 border-t border-gray-100">
                     
                        <Assigned selectedProjectId={project.id} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export const TLassign = () => {
    const { permissions } = usePermissions();
    // ✅ EXACT SAME CONTEXTS AS WORKING Assignedtable + Assigned modal
    const { assignedData, fetchAssigned, isLoading, } = useBDProjectsAssigned();  // ✅ MAIN DATA
    const { deleteTeamLeader } = usePMContext();                                // ✅ TL DELETE
    const { deleteEmployee } = useTLContext();                                  // ✅ EMPLOYEE DELETE
const { showAlert } = useAlert();

    const navigate = useNavigate();
    const employeePermission = permissions?.permissions?.[0]?.assigned_projects_inside_project_management;
    const canAddEmployee = employeePermission === "2";

    // ✅ USE assignedData (same as Assignedtable) - NO 404s!
    const projectsData = useMemo(() => {
        return assignedData?.filter(project => 
            (project.assigned_users?.length > 0 || 
             project.tls?.length > 0 || 
             project.project_managers?.length > 0)
        ) || [];
    }, [assignedData]);

    // States (simplified - no complex filtering needed)
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(6);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterBy, setFilterBy] = useState("project_name");
    const [expandedProjects, setExpandedProjects] = useState({});

    // ✅ SINGLE WORKING CALL - NO 404s!
    useEffect(() => {
        fetchAssigned();  // ✅ Same as Assignedtable
    }, []);

    // ✅ Pagination logic (unchanged)
    const filteredProjects = useMemo(() => {
        if (!searchQuery.trim()) return projectsData;
        const lowerCaseQuery = searchQuery.toLowerCase();
        return projectsData.filter((project) => {
            switch (filterBy) {
                case "client_name": return project.client?.name?.toLowerCase().includes(lowerCaseQuery);
                case "project_name": return project.project_name?.toLowerCase().includes(lowerCaseQuery);
                default: return true;
            }
        });
    }, [projectsData, searchQuery, filterBy]);

    const paginatedProjects = useMemo(() => {
        if (itemsPerPage === 'all') return filteredProjects;
        const indexOfLastItem = currentPage * Number(itemsPerPage);
        const indexOfFirstItem = indexOfLastItem - Number(itemsPerPage);
        return filteredProjects.slice(indexOfFirstItem, indexOfLastItem);
    }, [filteredProjects, currentPage, itemsPerPage]);

    const totalPages = itemsPerPage === 'all' ? 1 : Math.ceil((filteredProjects?.length || 0) / (Number(itemsPerPage) || 1));

    const handlePrevPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
    const handleNextPage = () => setCurrentPage(prev => Math.min(totalPages, prev + 1));
    const clearFilter = () => { setSearchQuery(""); setFilterBy("project_name"); };


  const handleDelete = async (projectId, userId, userName, userType) => {
    try {
      if (userType === 'Employee') {
        await deleteEmployee(projectId, userId);  // ✅ Context shows alert
      } else {
        await deleteTeamLeader(projectId, [userId]);  // ✅ Context shows alert
      }
      await fetchAssigned();
    } catch (error) {
      showAlert({ variant: "error", message: "Remove failed!" });
    }
  };

    return (
        <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
            <SectionHeader icon={BriefcaseBusiness} title="Projects Assigned" subtitle="Manage PM/TL/Employee assignments" />
            
            <div className="max-w-full mx-auto p-2 sm:p-4">
                {/* ✅ Search/Filter (unchanged) */}
                <div className="flex flex-wrap md:flex-nowrap items-center gap-3 border p-4 rounded-xl shadow-md bg-white mb-4 sm:mb-8">
                    {/* Search input unchanged */}
                    <div className="relative flex items-center w-full flex-grow border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 shadow-sm">
                        <Search className="h-5 w-5 text-gray-400 absolute left-3" />
                        <input type="text" className="w-full pl-10 pr-10 py-2 rounded-lg focus:outline-none"
                            placeholder={`Search by ${filterBy.replace('_', ' ')}...`} value={searchQuery} 
                            onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                    <select value={filterBy} onChange={(e) => setFilterBy(e.target.value)}
                        className="px-3 py-2 border rounded-md bg-white cursor-pointer focus:outline-none h-[42px]">
                        <option value="project_name">Project Name</option>
                        <option value="client_name">Client Name</option>
                    </select>
                    <ClearButton onClick={clearFilter} />
                </div>

                <div className="bg-white rounded-xl shadow-2xl p-3 sm:p-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center min-h-[400px]">
                            <div className="flex items-center space-x-3 bg-white px-8 py-6 rounded-xl shadow-lg">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                                <span className="text-lg text-gray-600">Loading assigned projects...</span>
                            </div>
                        </div>
                    ) : paginatedProjects.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-6">
                                {paginatedProjects.map((project) => (
                                    <ProjectCard key={project.id} 
                                        project={project}
                                        expandedProjects={expandedProjects} 
                                        setExpandedProjects={setExpandedProjects}
                                          handleDelete={handleDelete} 
                                        navigate={navigate} />
                                ))}
                            </div>
                            <PaginationControls 
                                totalPages={totalPages} 
                                currentPage={currentPage}
                                handlePrevPage={handlePrevPage} 
                                handleNextPage={handleNextPage}
                                totalItems={filteredProjects?.length || 0} 
                                itemsPerPage={itemsPerPage}
                                setItemsPerPage={setItemsPerPage} />
                        </>
                    ) : (
                        <div className="flex items-center justify-center min-h-[400px]">
                            <div className="text-center bg-white p-8 rounded-xl shadow-lg">
                                <p className="text-xl font-semibold text-gray-700 mb-2">No assigned projects found</p>
                                <p className="text-gray-500">Assign team members using Assign button</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TLassign;
