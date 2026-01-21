import React, { useEffect, useState } from "react";
import { useTLContext } from "../../../context/TLContext";
import { Loader2, Calendar, User, Search, XCircle, X } from "lucide-react";

export const Tableassigned = () => {
    // Assuming useTLContext provides employeeProjects, loading, fetchEmployeeProjects, deleteTeamLeader
    const { employeeProjects, loading, fetchEmployeeProjects, deleteEmployee } = useTLContext();
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredData, setFilteredData] = useState([]);

    // State for the confirmation modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState(null); // To store project and employee info for the modal

    useEffect(() => {
        fetchEmployeeProjects();
    }, []);

    // console.log("these are raw employee projects from context (API response):", employeeProjects);

    useEffect(() => {
        // Now, employeeProjects.data.projects is the correct path for the array
        if (Array.isArray(employeeProjects?.data?.projects)) {
            const filtered = employeeProjects.data.projects.filter((project) =>
                project.project_name?.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredData(filtered);
        } else {
            setFilteredData([]); // Handle cases where data is null, undefined, or not an array
        }
    }, [searchQuery, employeeProjects]);

    // Function to open the modal (renamed parameters for clarity if deleting employees)
    // If deleteTeamLeader is actually deleteEmployee, consider renaming it in context too.
    const openDeleteModal = (projectId, employeeId, employeeName, projectName) => {
        setModalData({ projectId, employeeId, employeeName, projectName }); // Using employee details
        setIsModalOpen(true);
    };

    // Function to close the modal
    const closeDeleteModal = () => {
        setIsModalOpen(false);
        setModalData(null); // Clear modal data when closed
    };

    // Handler for confirming deletion from the modal
    const handleConfirmDelete = async () => {
        if (modalData) {
            const { projectId, employeeId, employeeName, projectName } = modalData;
            // Assuming deleteTeamLeader actually removes an employee
            const success = await deleteEmployee(projectId, employeeId);
            if (success) {
                console.log(`Employee ${employeeName} successfully removed from project ${projectName}!`);
                closeDeleteModal();
            }
            // closeDeleteModal();
        }
    };

    return (
        <div className="overflow-hidden rounded-b-2xl border border-gray-200 bg-white shadow-2xl">
            {/* Search Input */}
            <div className="p-4 flex items-center gap-3">
                <div className="relative w-full max-w-md">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Search by Project Name..."
                    />
                    <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center col-span-full">
                        <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                        <p className="text-gray-600 text-lg font-medium mt-4">Loading assigned projects...</p>
                        <p className="text-gray-400">Please wait while we fetch the data</p>
                    </div>
                ) : filteredData.length > 0 ? (
                    filteredData.map((project) => (
                        <div key={project.id} className="bg-white rounded-lg shadow-lg p-5 border border-gray-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
                            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <h2>Project name :</h2>
                                <button className="bg-blue-600 text-white px-2 py-1 rounded-lg text-sm">{project.project_name}</button>
                            </h3>
                            <p className="text-gray-600 flex items-center gap-2 mt-2">
                                <User className="h-5 w-5 text-blue-600" />
                                <span className="font-bold text-sm">Client: </span> {project.client?.name || "N/A"}
                            </p>
                            <p className="text-gray-600 flex flex-wrap items-center gap-2 mt-2">
                                <User className="h-5 w-5 text-blue-600" />
                                <span className="font-bold">Employee name:</span>
                                {project.assigned_employees && project.assigned_employees.length > 0 ? (
                                    project.assigned_employees.map((employee) => (
                                        <span key={employee.id} className="inline-flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm font-medium text-gray-700 mr-2 mb-2">
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
                                    "No Employee Assigned" // Changed from "No Team leader Assigned"
                                )}
                            </p>
                            <p className="text-gray-600 flex items-center gap-2 mt-2">
                                <Calendar className="h-5 w-5 text-blue-600" />
                                <span className="font-bold">Deadline:</span> {project.deadline ? project.deadline : "NA"}
                            </p>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center text-gray-500">No assigned projects found.</div>
                )}
            </div>

            {/* Confirmation Modal - Rendered directly within Tableassigned */}
            {isModalOpen && modalData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4 sm:mx-0 transform transition-all duration-300 ease-out scale-100 opacity-100">
                        <button
                            onClick={closeDeleteModal}
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                            aria-label="Close modal"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Confirm Removal</h3>
                        <p className="text-gray-700 mb-6">
                            Are you sure you want to remove "{modalData.employeeName}" from project "{modalData.projectName}"? This action cannot be undone.
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={closeDeleteModal}
                                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                            >
                                No, keep it
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className={`px-4 py-2 text-white rounded-md bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
                            >
                                Yes, remove
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};