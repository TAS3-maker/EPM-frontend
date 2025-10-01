import React, { useState, useRef, useEffect, useMemo } from "react";
import { Loader2, BriefcaseBusiness, Search, User, XCircle, X, Calendar } from "lucide-react";
import { useBDProjectsAssigned } from "../../../context/BDProjectsassigned";
import { useTLContext } from "../../../context/TLContext";
import { SectionHeader } from '../../../components/SectionHeader';
import { SubmitButton } from "../../../AllButtons/AllButtons";
import Pagination from "../../../components/Pagination";
import { ClearButton,AssignButton } from "../../../AllButtons/AllButtons";

export const TLassign = () => {
    // Destructuring relevant states and functions from contexts
    const { assignProject, message } = useBDProjectsAssigned();
    const { assignProjectToEmployees, isAssigning, assignedProjects, employees, isLoading: isProjectsLoading, loading, fetchEmployeeProjects, employeeProjects, deleteEmployee } = useTLContext();

    // State variables for component logic
    const [filterBy, setFilterBy] = useState("project_name"); // Default filter by project name for consistency with assigned projects table
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [selectedProject, setSelectedProject] = useState("");
    const [showMessage, setShowMessage] = useState(false);
    const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [modalData, setModalData] = useState(null);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(6); // Changed to 6 for consistency with previous example

    // New state variables for search queries in modal dropdowns
    const [projectSearchQuery, setProjectSearchQuery] = useState("");
    const [employeeSearchQuery, setEmployeeSearchQuery] = useState("");
    const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);

    useEffect(() => {
        fetchEmployeeProjects();
    }, []);

    // Filter projects for the table based on search query and filterBy
    const filteredTableProjects = useMemo(() => {
        if (!Array.isArray(employeeProjects?.data?.projects)) return [];

        const query = searchQuery.trim().toLowerCase();

        return employeeProjects.data.projects.filter((project) => {
            if (filterBy === "project_name") {
                return project.project_name?.toLowerCase().includes(query);
            }
            if (filterBy === "client_name") {
                return project.client?.name?.toLowerCase().includes(query);
            }
            if (filterBy === "team_leads") { // This should ideally be "assigned_employees" as per your data structure
                return project.assigned_employees?.some((emp) =>
                    emp.name?.toLowerCase().includes(query)
                );
            }
            return false;
        });
    }, [searchQuery, filterBy, employeeProjects]);

    // Memoize the paginated table projects
    const paginatedTableProjects = useMemo(() => {
        if (itemsPerPage === 'all') {
            return filteredTableProjects;
        }
        const indexOfLastItem = currentPage * Number(itemsPerPage);
        const indexOfFirstItem = indexOfLastItem - Number(itemsPerPage);
        return filteredTableProjects.slice(indexOfFirstItem, indexOfLastItem);
    }, [filteredTableProjects, currentPage, itemsPerPage]);

    // Calculate total pages for the table
    const totalTablePages = itemsPerPage === 'all' ? 1 : Math.ceil((filteredTableProjects?.length || 0) / (Number(itemsPerPage) || 1));

    // Reset current page when filter/search changes for the table
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filterBy, itemsPerPage]);

    // Function to open the delete confirmation modal
    const openDeleteModal = (projectId, employeeId, employeeName, projectName) => {
        setModalData({ projectId, employeeId, employeeName, projectName });
        setIsModalOpen(true); // Open the correct modal
    };

    // Function to close the delete confirmation modal
    const closeDeleteModal = () => {
        setIsModalOpen(false);
        setModalData(null);
    };

    // Handler for confirming deletion from the modal
    const handleConfirmDelete = async () => {
        if (modalData) {
            const { projectId, employeeId, employeeName, projectName } = modalData;
            const success = await deleteEmployee(projectId, employeeId);
            if (success) {
                console.log(`Employee ${employeeName} successfully removed from project ${projectName}!`);
                closeDeleteModal();
            }
        }
    };

    const clearFilter = () => {
        setSearchQuery("");
        setFilterBy("project_name"); // Reset to project name
    };

    // Refs for managing click outside dropdowns
    const employeeDropdownRef = useRef(null);
    const projectDropdownRef = useRef(null); // Ref for the project dropdown

    // Handler for selecting/deselecting employees in the assign modal
    const handleEmployeeSelectionChange = (employeeId) => {
        setSelectedEmployees((prevSelected) =>
            prevSelected.includes(employeeId)
                ? prevSelected.filter((id) => id !== employeeId)
                : [...prevSelected, employeeId]
        );
    };

    // Effect hook to handle clicks outside the employee dropdown in the assign modal
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (employeeDropdownRef.current && !employeeDropdownRef.current.contains(event.target)) {
                setIsEmployeeDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Effect hook to handle clicks outside the project dropdown in the assign modal
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (projectDropdownRef.current && !projectDropdownRef.current.contains(event.target)) {
                setIsProjectDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Handler for form submission for assigning projects
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedProject || selectedEmployees.length === 0) {
            setShowMessage(true);
            return;
        }

        await assignProjectToEmployees(selectedProject, selectedEmployees);
        setSelectedProject("");
        setSelectedEmployees([]);
        setProjectSearchQuery(""); // Clear search query after submission
        setEmployeeSearchQuery(""); // Clear search query after submission
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 3000);
        setIsModalOpen(false);
    };

    // Filtered projects for the assign modal dropdown
    const filteredAssignProjects = assignedProjects.filter(project =>
        project.project_name.toLowerCase().includes(projectSearchQuery.toLowerCase())
    );

    // Filtered employees for the assign modal dropdown
    const filteredAssignEmployees = employees.filter(employee =>
        employee.name.toLowerCase().includes(employeeSearchQuery.toLowerCase())
    );

    return (
        <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
            <SectionHeader icon={BriefcaseBusiness} title="Assign Projects to Employees" subtitle="Allocate projects to your team members" />

            <div className="max-w-full mx-auto p-4">
                {/* Search and Filter Controls */}
                <div className="flex flex-wrap md:flex-nowrap items-center gap-3 border p-4 rounded-xl shadow-md bg-white mb-8">
                    <div className="relative flex items-center w-full flex-grow border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 shadow-sm">
                        <Search className="h-5 w-5 text-gray-400 absolute left-3" />
                        <input
                            type="text"
                            className="w-full pl-10 pr-10 py-2 rounded-lg focus:outline-none"
                            placeholder={`Search by ${filterBy.replace('_', ' ')}...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")} // Clear search button
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 rounded-full hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <XCircle className="h-5 w-5" />
                            </button>
                        )}
                    </div>

                    <select
                        value={filterBy}
                        onChange={(e) => setFilterBy(e.target.value)}
                        className="px-3 py-2 border rounded-md bg-white cursor-pointer focus:outline-none h-[42px]"
                    >
                        <option value="project_name">Project Name</option>
                        <option value="client_name">Client Name</option>
                        <option value="team_leads">Employee Name</option>
                    </select>

                    <ClearButton onClick={() => clearFilter()} />

                    <button
                        onClick={() => { setIsModalOpen(true); setShowMessage(false); }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm flex items-center gap-1"
                    >
                        <BriefcaseBusiness className="h-5 w-5" /> Assign
                    </button>
                </div>

                {/* Assign Project Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
                        <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-lg relative transform transition-all duration-300 scale-100 opacity-100">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                                aria-label="Close modal"
                            >
                                <X className="h-6 w-6" />
                            </button>

                            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Assign Project to Employees</h3>

                            <form onSubmit={handleSubmit} className="space-y-6">

                                {/* Project Selector */}
                                <div className="relative" ref={projectDropdownRef}>
                                    <label htmlFor="project-select" className="block font-semibold text-gray-700 mb-2">Project Name</label>
                                    <input
                                        id="project-select"
                                        type="text"
                                        placeholder="Search and select a project..."
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-150 ease-in-out text-gray-700"
                                        value={projectSearchQuery}
                                        onChange={(e) => {
                                            setProjectSearchQuery(e.target.value);
                                            setIsProjectDropdownOpen(true);
                                        }}
                                        onFocus={() => setIsProjectDropdownOpen(true)}
                                    />

                                    {isProjectDropdownOpen && projectSearchQuery && (
                                        <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                            {isProjectsLoading ? (
                                                <p className="p-4 text-gray-500 flex items-center">
                                                    <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading projects...
                                                </p>
                                            ) : filteredAssignProjects.length > 0 ? (
                                                filteredAssignProjects.map((project) => (
                                                    <div
                                                        key={project.id}
                                                        className="cursor-pointer px-4 py-3 hover:bg-blue-50 transition-colors duration-150 text-gray-800"
                                                        onClick={() => {
                                                            setSelectedProject(project.id);
                                                            setProjectSearchQuery(project.project_name); // Keep selected project name in input
                                                            setIsProjectDropdownOpen(false);
                                                        }}
                                                    >
                                                        {project.project_name}
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="p-4 text-gray-500">No projects found</p>
                                            )}
                                        </div>
                                    )}

                                    {selectedProject && (
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            <span className="flex items-center bg-blue-100 text-blue-800 text-sm font-medium px-4 py-2 rounded-full shadow-sm">
                                                {assignedProjects.find(p => p.id === selectedProject)?.project_name}
                                                <button
                                                    type="button"
                                                    onClick={() => { setSelectedProject(""); setProjectSearchQuery(""); }}
                                                    className="ml-2 text-blue-600 hover:text-red-600 text-lg leading-none focus:outline-none"
                                                    aria-label="Remove selected project"
                                                >
                                                    &times;
                                                </button>
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Employee Selector */}
                                <div className="relative w-full" ref={employeeDropdownRef}>
                                    <label htmlFor="employee-select" className="block font-semibold text-gray-700 mb-2">Employee Name(s)</label>
                                    <input
                                        id="employee-select"
                                        type="text"
                                        placeholder="Search and select employees..."
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-150 ease-in-out text-gray-700"
                                        value={employeeSearchQuery}
                                        onChange={(e) => {
                                            setEmployeeSearchQuery(e.target.value);
                                            setIsEmployeeDropdownOpen(true);
                                        }}
                                        onFocus={() => setIsEmployeeDropdownOpen(true)}
                                    />

                                    {isEmployeeDropdownOpen && employeeSearchQuery && (
                                        <div className="absolute w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto z-10 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                            {isProjectsLoading ? (
                                                <p className="p-4 text-gray-500 flex items-center">
                                                    <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading employees...
                                                </p>
                                            ) : filteredAssignEmployees.length > 0 ? (
                                                filteredAssignEmployees.map((employee) => (
                                                    <div
                                                        key={employee.id}
                                                        className={`cursor-pointer px-4 py-3 hover:bg-blue-50 transition-colors duration-150 flex items-center ${
                                                            selectedEmployees.includes(employee.id) ? "bg-blue-100 text-blue-800" : "text-gray-800"
                                                        }`}
                                                        onClick={() => {
                                                            handleEmployeeSelectionChange(employee.id);
                                                            // Optionally clear search or keep it to allow selecting more
                                                            setEmployeeSearchQuery("");
                                                            // Keep dropdown open if multiple selections are desired, close if single
                                                            // setIsEmployeeDropdownOpen(false);
                                                        }}
                                                    >
                                                        {/* <input
                                                            type="checkbox"
                                                            className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                            checked={selectedEmployees.includes(employee.id)}
                                                            readOnly
                                                        /> */}
                                                        {employee.name}
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="p-4 text-gray-500">No employees found</p>
                                            )}
                                        </div>
                                    )}

                                    {selectedEmployees.length > 0 && (
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {selectedEmployees.map((id) => {
                                                const emp = employees.find((e) => e.id === id);
                                                return (
                                                    <span
                                                        key={id}
                                                        className="flex items-center bg-green-100 text-green-800 text-sm font-medium px-4 py-2 rounded-full shadow-sm"
                                                    >
                                                        {emp?.name}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleEmployeeSelectionChange(id)}
                                                            className="ml-2 text-green-600 hover:text-red-600 text-lg leading-none focus:outline-none"
                                                            aria-label={`Remove ${emp?.name}`}
                                                        >
                                                            &times;
                                                        </button>
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Success/Error Message */}
                                {showMessage && (
                                    <div className={`p-3 rounded-lg text-sm font-medium text-center ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-300' : 'bg-red-50 text-red-800 border border-red-300'}`}>
                                        {message.text || "Project assigned successfully!"}
                                    </div>
                                )}

                                <SubmitButton type="submit" isSubmitting={isAssigning} buttonText="Assign Project" submittingText="Assigning..." />
                            </form>
                        </div>
                    </div>
                )}

                {/* Assigned Projects Table/Cards */}
                <div className="bg-white rounded-xl shadow-2xl p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center min-h-[400px] col-span-full">
                            <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                            <p className="text-gray-600 text-lg font-medium mt-4">Loading assigned projects...</p>
                            <p className="text-gray-400">Please wait while we fetch the data</p>
                        </div>
                    ) : paginatedTableProjects.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {paginatedTableProjects.map((project) => (
                                    <div key={project.id} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-lg transition-all duration-300">
                                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg text-sm">
                                                {project.project_name}
                                            </span>
                                        </h3>
                                        <p className="text-gray-700 flex items-center gap-2 mb-2">
                                            <User className="h-4 w-4 text-gray-500" />
                                            <span className="font-semibold">Client:</span> {project.client?.name || "N/A"}
                                        </p>
                                        <p className="text-gray-700 flex items-center gap-2 mb-3">
                                            <Calendar className="h-4 w-4 text-gray-500" />
                                            <span className="font-semibold">Deadline:</span> {project.deadline ? project.deadline : "NA"}
                                        </p>
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <p className="font-semibold text-gray-800 mb-2">Assigned Employees:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {project.assigned_employees && project.assigned_employees.length > 0 ? (
                                                    project.assigned_employees.map((employee) => (
                                                        <span key={employee.id} className="inline-flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm font-medium text-gray-700 shadow-sm">
                                                            {employee.name}
                                                            <button
                                                                className="ml-2 text-red-500 hover:text-red-700 focus:outline-none"
                                                                onClick={() => openDeleteModal(project.id, employee.id, employee.name, project.project_name)}
                                                                title={`Remove ${employee.name}`}
                                                            >
                                                                <XCircle className="h-4 w-4" />
                                                            </button>
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-gray-500 text-sm">No Employees Assigned</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalTablePages}
                                onPageChange={setCurrentPage}
                                totalItems={filteredTableProjects?.length || 0}
                                itemsPerPage={itemsPerPage}
                                setItemsPerPage={setItemsPerPage}
                            />
                        </>
                    ) : (
                        <div className="flex items-center justify-center min-h-[400px]">
                            <div className="text-center bg-white p-8 rounded-xl shadow-lg">
                                <p className="text-xl font-semibold text-gray-700 mb-2">No assigned projects found</p>
                                {searchQuery && (
                                    <p className="text-gray-500">No projects match your search for "{searchQuery}"</p>
                                )}
                                {!searchQuery && (
                                    <p className="text-gray-500">Assign projects to employees using the "Assign Project" button above.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Confirmation Modal - Rendered directly within TLassign */}
            {modalData && isModalOpen && ( // Ensure modalData exists and isModalOpen is true
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
                    <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-auto transform transition-all duration-300 ease-out scale-100 opacity-100">
                        <button
                            onClick={closeDeleteModal}
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                            aria-label="Close modal"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Confirm Removal</h3>
                        <p className="text-gray-700 mb-6">
                            Are you sure you want to remove "<span className="font-medium text-blue-600">{modalData.employeeName}</span>" from project "<span className="font-medium text-blue-600">{modalData.projectName}</span>"? This action cannot be undone.
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={closeDeleteModal}
                                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors duration-150"
                            >
                                No, keep it
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className={`px-4 py-2 text-white rounded-md bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-150 ${isAssigning ? 'opacity-70 cursor-not-allowed' : ''}`}
                                disabled={isAssigning}
                            >
                                {isAssigning ? (
                                    <span className="flex items-center">
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Removing...
                                    </span>
                                ) : (
                                    'Yes, remove'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TLassign;