import React, { useState, useRef, useEffect, useMemo } from "react";
import { 
  Loader2, Calendar, Clock, Users, BriefcaseBusiness, Briefcase, 
  CheckCircle2, ChevronLeft, ChevronRight, Search, XCircle, X, User 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTLContext } from "../../../context/TLContext";
import { SectionHeader } from '../../../components/SectionHeader';
import { ClearButton } from "../../../AllButtons/AllButtons";
import { usePermissions } from "../../../context/PermissionContext";
// PaginationControls (unchanged)
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

// ✅ FIXED ProjectCard - NEVER show unassigned projects
const ProjectCard = ({ project, expandedProjects, setExpandedProjects, openDeleteModal, navigate }) => {
    const maxVisible = 2;
    const employees = project.assigned_employees || [];
    const isExpanded = expandedProjects?.[project.id] || false;
    const hasMore = employees.length > maxVisible;

    // ✅ SAFETY: Never show projects without employees
    if (employees.length === 0) return null;

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
                                    onClick={() => navigate(`/tl/tasks/${project.id}`)}>
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

                    {/* ALL ORIGINAL INFO BOXES */}
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
                        <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors duration-300 flex flex-col items-center">
                            <div className="flex items-center mb-1">
                                <Briefcase className="w-4 sm:w-5 h-4 sm:h-5 text-blue-500" />
                                <span className="text-xs font-medium text-gray-600 ml-2">Non-Billable Hours</span>
                            </div>
                            <span className="text-sm font-bold text-gray-900">
                                {typeof project.total_working_hours === "number" && typeof project.total_hours === "number"
                                    ? Math.max(project.total_working_hours - project.total_hours, 0)
                                    : "0"}
                            </span>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors duration-300 flex flex-col items-center">
                            <div className="flex items-center mb-1">
                                <Briefcase className="w-4 sm:w-5 h-4 sm:h-5 text-blue-500" />
                                <span className="text-xs font-medium text-gray-600 ml-2">Project Status</span>
                            </div>
                            <span className={`text-sm font-bold ${project.project_status === 'online' ? 'text-green-600' : 'text-red-600'}`}>
                                {project.project_status ? project.project_status.charAt(0).toUpperCase() + project.project_status.slice(1) : "N/A"}
                            </span>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors duration-300 flex flex-col items-center">
                            <div className="flex items-center mb-1">
                                <Briefcase className="w-4 sm:w-5 h-4 sm:h-5 text-blue-500" />
                                <span className="text-xs font-medium text-gray-600 ml-2">Project Type</span>
                            </div>
                            <span className="text-sm font-bold text-gray-900">{project.project_type || "N/A"}</span>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors duration-300 flex flex-col items-center">
                            <div className="flex items-center mb-1">
                                <Briefcase className="w-4 sm:w-5 h-4 sm:h-5 text-blue-500" />
                                <span className="text-xs font-medium text-gray-600 ml-2">Hiring ID</span>
                            </div>
                            <span className="text-sm font-bold text-gray-900 break-words max-w-full">
                                {project.client?.hire_on_id ?? "N/A"}
                            </span>
                        </div>
                    </div>

                    {/* ✅ REMOVED "No Employees Assigned" - Only shows employee badges */}
                    <div className="pt-4 border-t border-gray-100">
                        <p className="font-semibold text-sm text-gray-800 mb-2 flex items-center">
                            <User className="w-4 h-4 mr-2 text-gray-500" />
                            Assigned Employees ({employees.length})
                        </p>
                        <div className="flex flex-wrap gap-2 min-h-6">
                            {(isExpanded ? employees : employees.slice(0, maxVisible)).map((employee) => (
                                <span key={employee.id} className="inline-flex items-center bg-gray-100 rounded-full px-3 py-1 text-xs font-medium text-gray-700 shadow-sm">
                                    {employee.name}
                                    <button className="ml-2 text-red-500 hover:text-red-700 focus:outline-none"
                                        onClick={() => openDeleteModal(project.id, employee.id, employee.name, project.project_name)}
                                        title={`Remove ${employee.name}`}>
                                        <XCircle className="h-4 w-4" />
                                    </button>
                                </span>
                            ))}
                        </div>
                        {hasMore && (
                            <button type="button"
                                onClick={() => setExpandedProjects((prev) => ({ ...prev, [project.id]: !prev[project.id] }))}
                                className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium focus:outline-none">
                                {isExpanded ? "Show Less" : `View All (${employees.length})`}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const TLassign = () => {
    const {permissions}=usePermissions()
    const { 
        assignedProjects, 
        isLoading, 
        fetchAssignedProjects, 
        deleteEmployee,
        employeeProjects, 
        assignProjectToEmployees, 
        employees, 
        isAssigning, 
        fetchEmployeeProjects 
    } = useTLContext();
    
    const navigate = useNavigate();

    // ✅ ULTRA-STRICT: ONLY projects WITH assigned_employees.length > 0
    const projectsData = useMemo(() => {
        if (!Array.isArray(employeeProjects?.data?.projects)) return [];
        
        return employeeProjects.data.projects
            .filter(project => project.assigned_employees && project.assigned_employees.length > 0)  // ✅ ONLY employee-assigned
            .map(projectWithEmployees => {
                const assignedProject = assignedProjects.find(p => p.id === projectWithEmployees.id);
                return {
                    ...assignedProject,
                    ...projectWithEmployees,
                    assigned_employees: projectWithEmployees.assigned_employees
                };
            });
    }, [assignedProjects, employeeProjects]);
    const employeePermission=permissions?.permissions?.[0]?.assigned_projects_inside_project_management
    const canAddEmployee=employeePermission==="2"

    // States (unchanged)
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(6);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterBy, setFilterBy] = useState("project_name");
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [selectedProject, setSelectedProject] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [projectSearchQuery, setProjectSearchQuery] = useState("");
    const [employeeSearchQuery, setEmployeeSearchQuery] = useState("");
    const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
    const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);
    const [expandedProjects, setExpandedProjects] = useState({});
    const [modalData, setModalData] = useState(null);

    const projectDropdownRef = useRef(null);
    const employeeDropdownRef = useRef(null);

    useEffect(() => {
        fetchAssignedProjects();
        fetchEmployeeProjects("assigned");
    }, []);

    // ✅ Reset pagination when data changes
    useEffect(() => {
        if (projectsData.length > 0) {
            setCurrentPage(1);
        }
    }, [projectsData.length]);

    const filteredProjects = useMemo(() => {
        if (!Array.isArray(projectsData)) return [];
        if (!searchQuery.trim()) return projectsData;
        const lowerCaseQuery = searchQuery.toLowerCase();
        return projectsData.filter((project) => {
            switch (filterBy) {
                case "client_name": return project.client?.name?.toLowerCase().includes(lowerCaseQuery);
                case "assigned_employees": return project.assigned_employees?.some((emp) => emp?.name?.toLowerCase().includes(lowerCaseQuery));
                case "project_name": return project.project_name?.toLowerCase().includes(lowerCaseQuery);
                default: return false;
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

    useEffect(() => { setCurrentPage(1); }, [itemsPerPage, searchQuery]);

    const handleEmployeeSelectionChange = (employeeId) => {
        setSelectedEmployees((prevSelected) =>
            prevSelected.includes(employeeId)
                ? prevSelected.filter((id) => id !== employeeId)
                : [...prevSelected, employeeId]
        );
    };

    // ✅ FIXED: Refresh after assign
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedProject || selectedEmployees.length === 0) return;
        
        await assignProjectToEmployees(selectedProject, selectedEmployees);
        
        await Promise.all([
            fetchAssignedProjects(),
            fetchEmployeeProjects("assigned")
        ]);
        
        setSelectedProject(""); 
        setSelectedEmployees([]); 
        setProjectSearchQuery(""); 
        setEmployeeSearchQuery(""); 
        setIsModalOpen(false);
        setCurrentPage(1);
    };

    const openDeleteModal = (projectId, employeeId, employeeName, projectName) => {
        setModalData({ projectId, employeeId, employeeName, projectName });
        setIsModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsModalOpen(false);
        setModalData(null);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (projectDropdownRef.current && !projectDropdownRef.current.contains(event.target)) {
                setIsProjectDropdownOpen(false);
            }
            if (employeeDropdownRef.current && !employeeDropdownRef.current.contains(event.target)) {
                setIsEmployeeDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredAssignProjects = useMemo(() => 
        assignedProjects.filter(project => project.project_name?.toLowerCase().includes(projectSearchQuery.toLowerCase())),
        [assignedProjects, projectSearchQuery]
    );
    
    const filteredAssignEmployees = useMemo(() => 
        employees.filter(employee => employee.name?.toLowerCase().includes(employeeSearchQuery.toLowerCase())),
        [employees, employeeSearchQuery]
    );

    const clearFilter = () => { setSearchQuery(""); setFilterBy("project_name"); };
    const handlePrevPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
    const handleNextPage = () => setCurrentPage(prev => Math.min(totalPages, prev + 1));
    const handleClearSearch = () => { setSearchQuery(""); setCurrentPage(1); };

    return (
        <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
            <SectionHeader icon={BriefcaseBusiness} title="Projects Assigned" subtitle="Manage and track your assigned projects" />
            
            <div className="max-w-full mx-auto p-2 sm:p-4">
                <div className="flex flex-wrap md:flex-nowrap items-center gap-3 border p-4 rounded-xl shadow-md bg-white mb-4 sm:mb-8">
                    <div className="relative flex items-center w-full flex-grow border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 shadow-sm">
                        <Search className="h-5 w-5 text-gray-400 absolute left-3" />
                        <input type="text" className="w-full pl-10 pr-10 py-2 rounded-lg focus:outline-none"
                            placeholder={`Search by ${filterBy.replace('_', ' ')}...`} value={searchQuery} 
                            onChange={(e) => setSearchQuery(e.target.value)} />
                        {searchQuery && (
                            <button onClick={handleClearSearch}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 rounded-full hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <XCircle className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                    <select value={filterBy} onChange={(e) => setFilterBy(e.target.value)}
                        className="px-3 py-2 border rounded-md bg-white cursor-pointer focus:outline-none h-[42px]">
                        <option value="project_name">Project Name</option>
                        <option value="client_name">Client Name</option>
                        <option value="assigned_employees">Employee Name</option>
                    </select>
                    <ClearButton onClick={clearFilter} />
                    {canAddEmployee&&(
                    <button onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm flex items-center gap-1"
                        disabled={isAssigning}>
                        <User className="h-5 w-5" /> Assign Employees
                    </button>
                    )}
                </div>

                <div className="bg-white rounded-xl shadow-2xl p-3 sm:p-6">
                    {isLoading || !employeeProjects?.data?.projects ? (
                        <div className="flex items-center justify-center min-h-[400px]">
                            <div className="flex items-center space-x-3 bg-white px-8 py-6 rounded-xl shadow-lg">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                                <span className="text-lg text-gray-600">Loading projects with Employees...</span>
                            </div>
                        </div>
                    ) : paginatedProjects.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-6">
                                {paginatedProjects.map((project) => (
                                    <ProjectCard key={project.id} project={project}
                                        expandedProjects={expandedProjects} setExpandedProjects={setExpandedProjects}
                                        openDeleteModal={openDeleteModal} navigate={navigate} />
                                ))}
                            </div>
                            <PaginationControls totalPages={totalPages} currentPage={currentPage}
                                handlePrevPage={handlePrevPage} handleNextPage={handleNextPage}
                                totalItems={filteredProjects?.length || 0} itemsPerPage={itemsPerPage}
                                setItemsPerPage={setItemsPerPage} />
                        </>
                    ) : (
                        <div className="flex items-center justify-center min-h-[400px]">
                            <div className="text-center bg-white p-8 rounded-xl shadow-lg">
                                <p className="text-xl font-semibold text-gray-700 mb-2">No projects with assigned Employees</p>
                                <p className="text-gray-500">Assign Employees using the button above</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Assign Modal (unchanged) */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
                    <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-lg relative transform transition-all duration-300">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 focus:outline-none">
                            <X className="h-6 w-6" />
                        </button>
                        <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Assign Project to Employees</h3>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="relative" ref={projectDropdownRef}>
                                <label className="block font-semibold text-gray-700 mb-2">Project Name</label>
                                <input type="text" placeholder="Search and select a project..." 
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    value={projectSearchQuery}
                                    onChange={(e) => { setProjectSearchQuery(e.target.value); setIsProjectDropdownOpen(true); }}
                                    onFocus={() => setIsProjectDropdownOpen(true)} />
                                {isProjectDropdownOpen && projectSearchQuery && (
                                    <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                                        {filteredAssignProjects.map((project) => (
                                            <div key={project.id} className="cursor-pointer px-4 py-3 hover:bg-blue-50 transition-colors duration-150"
                                                onClick={() => { setSelectedProject(project.id); setProjectSearchQuery(project.project_name); setIsProjectDropdownOpen(false); }}>
                                                {project.project_name}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {selectedProject && (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <span className="flex items-center bg-blue-100 text-blue-800 text-sm font-medium px-4 py-2 rounded-full shadow-sm">
                                            {assignedProjects.find(p => p.id === selectedProject)?.project_name}
                                            <button type="button" onClick={() => { setSelectedProject(""); setProjectSearchQuery(""); }}
                                                className="ml-2 text-blue-600 hover:text-red-600 text-lg leading-none focus:outline-none">×</button>
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="relative w-full" ref={employeeDropdownRef}>
                                <label className="block font-semibold text-gray-700 mb-2">Employee Name(s)</label>
                                <input type="text" placeholder="Search and select employees..." 
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    value={employeeSearchQuery}
                                    onChange={(e) => { setEmployeeSearchQuery(e.target.value); setIsEmployeeDropdownOpen(true); }}
                                    onFocus={() => setIsEmployeeDropdownOpen(true)} />
                                {isEmployeeDropdownOpen && employeeSearchQuery && (
                                    <div className="absolute w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto z-10">
                                        {filteredAssignEmployees.map((employee) => (
                                            <div key={employee.id} className={`cursor-pointer px-4 py-3 hover:bg-blue-50 transition-colors duration-150 flex items-center ${
                                                selectedEmployees.includes(employee.id) ? "bg-blue-100 text-blue-800" : "text-gray-800"
                                            }`}
                                                onClick={() => { handleEmployeeSelectionChange(employee.id); setEmployeeSearchQuery(""); }}>
                                                {employee.name}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {selectedEmployees.length > 0 && (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {selectedEmployees.map((id) => {
                                            const emp = employees.find((e) => e.id === id);
                                            return (
                                                <span key={id} className="flex items-center bg-green-100 text-green-800 text-sm font-medium px-4 py-2 rounded-full shadow-sm">
                                                    {emp?.name}
                                                    <button type="button" onClick={() => handleEmployeeSelectionChange(id)}
                                                        className="ml-2 text-green-600 hover:text-red-600 text-lg leading-none focus:outline-none">×</button>
                                                </span>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <button type="submit" disabled={isAssigning || !selectedProject || selectedEmployees.length === 0}
                                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200 flex items-center justify-center gap-2">
                                {isAssigning ? (<><Loader2 className="h-4 w-4 animate-spin" /> Assigning...</>) : "Assign Project"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal - FIXED with refresh */}
            {modalData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
                    <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-auto">
                        <button onClick={closeDeleteModal} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 focus:outline-none">
                            <X className="w-5 h-5" />
                        </button>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Confirm Removal</h3>
                        <p className="text-gray-700 mb-6">
                            Are you sure you want to remove "<span className="font-medium text-blue-600">{modalData.employeeName}</span>" 
                            from project "<span className="font-medium text-blue-600">{modalData.projectName}</span>"? 
                            This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button onClick={closeDeleteModal} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
                                No, keep it
                            </button>
                            <button onClick={async () => {
                                await deleteEmployee(modalData.projectId, modalData.employeeId);
                                await Promise.all([
                                    fetchAssignedProjects(),
                                    fetchEmployeeProjects("assigned")
                                ]);
                                closeDeleteModal();
                                setCurrentPage(1);
                            }} className="px-4 py-2 text-white rounded-md bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                disabled={isAssigning}>
                                Yes, remove
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TLassign;
