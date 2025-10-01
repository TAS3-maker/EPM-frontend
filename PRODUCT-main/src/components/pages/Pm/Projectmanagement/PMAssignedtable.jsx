import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { usePMContext } from "../../../context/PMContext";
import { Loader2, Calendar, Clock, Users, BriefcaseBusiness, Briefcase, CheckCircle2, ChevronLeft, ChevronRight, Search, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SectionHeader } from '../../../components/SectionHeader';
import {
    ClearButton,
} from "../../../AllButtons/AllButtons";


const PaginationControls = ({ totalPages, currentPage, handlePrevPage, handleNextPage, totalItems, itemsPerPage, setItemsPerPage }) => {
    const showPaginationButtons = totalItems > 0 && itemsPerPage !== 'all';
    const showItemsPerPageDropdown = totalItems > 0;

    if (totalItems === 0 && itemsPerPage === 'all') return null;

    return (
        <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-gray-200 bg-white sticky bottom-0 z-2 mt-4 rounded-b-xl">
            {showItemsPerPageDropdown && (
                <div className="flex items-center text-sm text-gray-700 mb-2 sm:mb-0">
                    Projects per page:
                    <select
                        value={itemsPerPage}
                        onChange={(e) => {
                            setItemsPerPage(e.target.value);
                        }}
                        className="ml-2 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                        <option value={6}>6</option>
                        <option value={9}>9</option>
                        <option value={12}>12</option>
                        <option value="all">All</option>
                    </select>
                </div>
            )}

            {showPaginationButtons && (
                <div className="flex items-center space-x-2">
                    <button
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        className={`p-2 rounded-md ${currentPage === 1 ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'} transition-colors duration-150 flex items-center`}
                    >
                        <ChevronLeft className="h-5 w-5 mr-1" /> Previous
                    </button>
                    <span className="text-sm font-medium text-gray-700">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className={`p-2 rounded-md ${currentPage === totalPages ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'} transition-colors duration-150 flex items-center`}
                    >
                        Next <ChevronRight className="h-5 w-5 ml-1" />
                    </button>
                </div>
            )}
        </div>
    );
};

export const PMAssignedtable = () => {
    const { assignedProjects, isLoading, fetchAssignedProjects } = usePMContext();
    const navigate = useNavigate();

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(6);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterBy, setFilterBy] = useState("project_name");

    useEffect(() => {
        fetchAssignedProjects();
    }, []);

    // Filter projects based on search query and filterBy
    const filteredProjects = useMemo(() => {
        if (!Array.isArray(assignedProjects)) return [];

        if (!searchQuery.trim()) return assignedProjects;

        const lowerCaseQuery = searchQuery.toLowerCase();

        return assignedProjects.filter((project) => {
            switch (filterBy) {
                case "client_name":
                    return project.client?.name?.toLowerCase().includes(lowerCaseQuery);
                case "team_leads":
                    // This case was commented out in the original code, but if needed, enable it.
                    // return project.team_leads?.some((tl) =>
                    //   tl?.name?.toLowerCase().includes(lowerCaseQuery)
                    // );
                    return false; // Returning false if 'team_leads' is not an active filter or if it was intentionally commented out
                case "project_name":
                    return project.project_name?.toLowerCase().includes(lowerCaseQuery);
                default:
                    return false;
            }
        });
    }, [assignedProjects, searchQuery, filterBy]);

    const clearFilter = () => {
        setSearchQuery("");
        setFilterBy("project_name"); // Reset to project_name as default
    };

    // Memoize the paginated projects after filtering
    const paginatedProjects = useMemo(() => {
        if (itemsPerPage === 'all') {
            return filteredProjects;
        }

        const indexOfLastItem = currentPage * Number(itemsPerPage);
        const indexOfFirstItem = indexOfLastItem - Number(itemsPerPage);
        return filteredProjects.slice(indexOfFirstItem, indexOfLastItem);
    }, [filteredProjects, currentPage, itemsPerPage]);

    // Calculate total pages based on filtered projects
    const totalPages = itemsPerPage === 'all' ? 1 : Math.ceil((filteredProjects?.length || 0) / (Number(itemsPerPage) || 1));

    // Reset current page to 1 when itemsPerPage or searchQuery changes
    useEffect(() => {
        setCurrentPage(1);
    }, [itemsPerPage, searchQuery, filterBy]); // Added filterBy to dependencies

    // Pagination handlers
    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(1, prev - 1));
    };

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(totalPages, prev + 1));
    };

    const ProjectCard = ({ project }) => (
        <div className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
            <div className="relative">
                {/* Decorative gradient header */}
                <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                <div className="p-6">

                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 mb-2">
                                {project.project_name || "N/A"}
                            </h3>
                            <div className="flex items-center space-x-2">
                                <Users className="w-4 h-4 text-gray-400" />
                                <p className="text-sm text-gray-600">
                                    {project.client?.name || "N/A"}
                                </p>
                            </div>
                        </div>
                        <div
                            className="flex items-center px-3 py-1.5 bg-green-50 text-green-600 rounded-full cursor-pointer hover:bg-green-100 transition-colors duration-200"
                            onClick={() => navigate(`/projectmanager/tasks/${project.id}`)}>
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            <span className="text-sm font-medium">Tasks</span>
                        </div>
                    </div>

                    {/* Project Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6"> {/* Adjusted for better alignment on small screens */}
                        <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors duration-300 flex items-center justify-between">
                            <div className="flex items-center">
                                <Calendar className="w-5 h-5 text-blue-500" />
                                <p className="text-sm font-medium text-gray-600 ml-2">Deadline</p>
                            </div>
                            <p className="text-base font-bold text-gray-900">{project.deadline || "N/A"}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors duration-300 flex items-center justify-between">
                            <div className="flex items-center">
                                <Clock className="w-5 h-5 text-blue-500" />
                                <p className="text-sm font-medium text-gray-600 ml-2">Total Hours</p>
                            </div>
                            <p className="text-base font-bold text-gray-900">{project.total_hours || "N/A"}</p>
                        </div>
                                               <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors duration-300">
                            <div className="flex items-center mb-2">
                                <Briefcase className="w-5 h-5 text-blue-500" />
                                <p className="text-sm font-medium text-gray-600 ml-2">Non-Billable Hours</p>
                            </div>
                            <p className="text-lg font-bold text-gray-900">
                                {project.total_working_hours - project.total_hours > 0
                                    ? project.total_working_hours - project.total_hours
                                    : "0"}
                            </p>
                        </div>
                    </div>

                    {/* Requirements */}
                    {/* <div className="mb-6 p-4 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors duration-300">
                        <p className="text-sm font-medium text-gray-600 mb-2">Requirements</p>
                        <p className="text-sm text-gray-700 line-clamp-2">{project.requirements || "N/A"}</p>
                    </div> */}

                    {/* Assignment Date */}
                    <div className="flex items-center justify-end pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                            Assigned: {project.assigned_by?.updated_at
                                ? new Date(project.assigned_by.updated_at).toLocaleString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                })
                                : "N/A"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
            <SectionHeader icon={BriefcaseBusiness} title="Projects Assigned" subtitle="Manage and track your assigned projects" />
            <div className="max-w-full mx-auto p-4">
                <div className="flex flex-wrap md:flex-nowrap items-center gap-3 border p-4 rounded-xl shadow-md bg-white mb-8"> {/* Adjusted padding and alignment */}
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
                                onClick={clearFilter} // Use clearFilter to reset both query and filterBy
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
                        {/* <option value="team_leads">TL Name</option> */} {/* This was commented out in your original code */}
                    </select>

                    <ClearButton onClick={() => clearFilter()} />
                </div>

                {/* Main Content Area */}
                <div className="bg-white rounded-xl shadow-2xl p-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center min-h-[400px]">
                            <div className="flex items-center space-x-3 bg-white px-8 py-6 rounded-xl shadow-lg">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                                <span className="text-lg text-gray-600">Loading projects...</span>
                            </div>
                        </div>
                    ) : paginatedProjects.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-6">
                                {paginatedProjects.map((project) => (
                                    <ProjectCard key={project.id} project={project} />
                                ))}
                            </div>
                            {/* Pagination Controls */}
                            <PaginationControls
                                totalPages={totalPages}
                                currentPage={currentPage}
                                handlePrevPage={handlePrevPage}
                                handleNextPage={handleNextPage}
                                totalItems={filteredProjects?.length || 0}
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
                                    <p className="text-gray-500">New projects will appear here when assigned</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PMAssignedtable;