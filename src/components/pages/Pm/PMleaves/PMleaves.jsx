import React, { useEffect, useState, useMemo } from "react";
import { Loader2, Calendar, User, Clock, FileText, BarChart, Search, X } from "lucide-react"; // Import X icon for modal close
import { useLeave } from "../../../context/LeaveContext";
import { SectionHeader } from '../../../components/SectionHeader';
import Pagination from "../../../components/Pagination"; // Import your Pagination component here

// Define a simple Modal component internally for displaying full leave details
const LeaveDetailsModal = ({ isOpen, onClose, leaveDetails }) => {
    if (!isOpen || !leaveDetails) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1"
                    aria-label="Close"
                >
                    <X className="h-6 w-6" />
                </button>
                <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">Leave Details</h2>
                <div className="space-y-3 text-gray-700">
                    <p>
                        <span className="font-semibold">Employee Name:</span> {leaveDetails.user_name || "N/A"}
                    </p>
                    <p>
                        <span className="font-semibold">Date:</span> {leaveDetails.start_date || "N/A"}
                    </p>
                    <p>
  <span className="font-semibold">Leave Type:</span> {leaveDetails.leave_type || "N/A"}
</p>

{leaveDetails.leave_type === "Multiple Days Leave" && (
  <p>
    <span className="font-semibold">From:</span> {leaveDetails.start_date || "N/A"}{" "}
    <span className="font-semibold ml-4">To:</span> {leaveDetails.end_date || "N/A"}
  </p>
)}

{leaveDetails.leave_type === "Short Leave" && (
  <p>
    <span className="font-semibold">Duration:</span>{" "}
    {leaveDetails.hours ? `${leaveDetails.hours} Hours` : (leaveDetails.hours === 0 ? "0 Hours" : "Full Day")}
  </p>
)}

                    <div>
                        <span className="font-semibold block mb-1">Reason:</span>
                        <p className="bg-gray-50 p-3 rounded-md border border-gray-200 whitespace-pre-wrap break-words max-h-60 overflow-y-auto">
                            {leaveDetails.reason || "N/A"}
                        </p>
                    </div>
                    <p>
                        <span className="font-semibold">Current Status:</span>{" "}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            (leaveDetails.status || '').toLowerCase() === "approved" ? "bg-green-100 text-green-700" :
                            (leaveDetails.status || '').toLowerCase() === "rejected" ? "bg-red-100 text-red-700" :
                            "bg-yellow-100 text-yellow-700"
                        }`}>
                            {leaveDetails.status || 'Pending'}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};


export const PMleaves = () => {
    const { pmleaves, pmLeavesfnc, postStatuses, loading, error } = useLeave();
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const [currentPage, setCurrentPage] = useState(1);
    const [leavesPerPage, setLeavesPerPage] = useState(10); // Keep this state for the dropdown

    // State for the modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLeave, setSelectedLeave] = useState(null);

    // Define a maximum length for the reason to trigger "View More"
    const MAX_REASON_LENGTH = 30; // You can adjust this value

    useEffect(() => {
        pmLeavesfnc();
    }, []);

    const filteredAndSortedLeaves = useMemo(() => {
        if (!pmleaves) return [];

        const lowercasedSearchTerm = searchTerm.toLowerCase();

        let filtered = pmleaves.filter(leave => {
            const employeeName = leave.user_name ?? '';
            const startDate = leave.start_date ?? '';
            const leaveType = leave.leave_type ?? '';
            const duration = leave.hours ? `${leave.hours} hours` : (leave.hours === 0 ? "0 hours" : "full day");
            const reason = leave.reason ?? '';
            const status = leave.status ?? '';

            const matchesSearchTerm = (
                employeeName.toLowerCase().includes(lowercasedSearchTerm) ||
                startDate.toLowerCase().includes(lowercasedSearchTerm) ||
                leaveType.toLowerCase().includes(lowercasedSearchTerm) ||
                duration.toLowerCase().includes(lowercasedSearchTerm) ||
                reason.toLowerCase().includes(lowercasedSearchTerm) ||
                status.toLowerCase().includes(lowercasedSearchTerm)
            );

            const matchesStatusFilter =
                statusFilter === "all" ||
                (status.toLowerCase() === statusFilter);

            return matchesSearchTerm && matchesStatusFilter;
        });

        return filtered;
    }, [searchTerm, statusFilter, pmleaves]);

    // Calculate total pages based on filtered leaves and selected leavesPerPage
    const totalPages = useMemo(() => {
        if (leavesPerPage === 'all') {
            return 1; // If "all" is selected, there's only one "page"
        }
        return Math.ceil(filteredAndSortedLeaves.length / (Number(leavesPerPage) || 1));
    }, [filteredAndSortedLeaves.length, leavesPerPage]);


    const currentLeaves = useMemo(() => {
        if (leavesPerPage === 'all') {
            return filteredAndSortedLeaves;
        }
        const indexOfLastLeave = currentPage * Number(leavesPerPage);
        const indexOfFirstLeave = indexOfLastLeave - Number(leavesPerPage);
        return filteredAndSortedLeaves.slice(indexOfFirstLeave, indexOfLastLeave);
    }, [filteredAndSortedLeaves, currentPage, leavesPerPage]);

    // Reset currentPage to 1 whenever search, leavesPerPage, or status filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, leavesPerPage, statusFilter]);

    const handleStatusChange = async (id, newStatus) => {
        const updatedStatus = [{ id, status: newStatus }];
        await postStatuses(updatedStatus);
        pmLeavesfnc(); // Re-fetch leaves to update the table
    };

    // Function to open the modal with specific leave details
    const openLeaveDetailsModal = (leave) => {
        setSelectedLeave(leave);
        setIsModalOpen(true);
    };

    // Function to close the modal
    const closeLeaveDetailsModal = () => {
        setIsModalOpen(false);
        setSelectedLeave(null);
    };

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md shadow-black/25">
            <SectionHeader icon={BarChart} title="Manage Leaves" subtitle="Track and manage leave requests" />
            <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="relative w-full md:w-auto flex-grow max-w-md">
                    <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Search all columns..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>

                <div className="flex flex-wrap justify-center gap-2 mt-3 md:mt-0">
                    <button
                        onClick={() => setStatusFilter("all")}
                        className={`px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium ${
                            statusFilter === "all"
                                ? "bg-blue-600 text-white shadow-sm"
                                : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setStatusFilter("pending")}
                        className={`px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium ${
                            statusFilter === "pending"
                                ? "bg-blue-600 text-white shadow-sm"
                                : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                        Pending
                    </button>
                    <button
                        onClick={() => setStatusFilter("approved")}
                        className={`px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium ${
                            statusFilter === "approved"
                                ? "bg-blue-600 text-white shadow-sm"
                                : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                        Approved
                    </button>
                    <button
                        onClick={() => setStatusFilter("rejected")}
                        className={`px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium ${
                            statusFilter === "rejected"
                                ? "bg-blue-600 text-white shadow-sm"
                                : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                        Rejected
                    </button>
                </div>
            </div>

            {/* Main content area for cards */}
            <div className="p-4">
                {loading ? (
                    <div className="py-8 text-center text-gray-500">
                        <div className="flex items-center justify-center space-x-3">
                            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                            <span>Loading leave requests...</span>
                        </div>
                    </div>
                ) : error ? (
                    <div className="py-8 text-center text-red-500">
                        Error loading data: {error.message || "Unknown error"}
                    </div>
                ) : currentLeaves.length > 0 ? (
                    // Grid for displaying leave cards: Now showing 3 per row on lg screens
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"> {/* Changed xl:grid-cols-4 to lg:grid-cols-3 */}
                        {currentLeaves.map((leave) => {
                            const fullReason = leave.reason || "N/A";
                            const isReasonLong = fullReason.length > MAX_REASON_LENGTH;
                            const displayedReason = isReasonLong
                                ? `${fullReason.substring(0, MAX_REASON_LENGTH)}...`
                                : fullReason;

                            return (
                                <div
                                    key={leave.id || `${leave.user_name}-${leave.start_date}`}
                                    className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex flex-col space-y-3 hover:shadow-md transition-shadow duration-200 ease-in-out"
                                >
                                    <div className="flex items-center gap-2 text-gray-800">
                                        <User className="h-5 w-5 text-gray-600" />
                                        <span className="font-semibold text-lg">{leave.user_name || "N/A"}</span>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-gray-700 text-sm">
                                            <Calendar className="h-4 w-4 text-gray-500" />
                                            <span className="font-medium">Date:</span> {leave.start_date || "N/A"}
                                        </div>
                                       <div className="flex items-center gap-2 text-gray-700 text-sm">
  <FileText className="h-4 w-4 text-gray-500" />
  <span className="font-medium">Type:</span> {leave.leave_type || "N/A"}
</div>

{leave.leave_type === "Multiple Days Leave" && (
  <div className="flex items-center gap-2 text-gray-700 text-sm">
    <Calendar className="h-4 w-4 text-gray-500" />
    <span className="font-medium">From:</span> {leave.start_date || "N/A"}
    <span className="font-medium ml-4">To:</span> {leave.end_date || "N/A"}
  </div>
)}

{leave.leave_type === "Short Leave" && (
  <div className="flex items-center gap-2 text-gray-700 text-sm">
    <Clock className="h-4 w-4 text-gray-500" />
    <span className="font-medium">Duration:</span>{" "}
    {leave.hours ? `${leave.hours} Hours` : (leave.hours === 0 ? "0 Hours" : "Full Day")}
  </div>
)}

                                        <div className="flex items-start gap-2 text-gray-700 text-sm">
                                            <span className="font-medium min-w-[50px]">Reason:</span>{" "}
                                            <p className="flex-1">
                                                {displayedReason}{" "}
                                                {isReasonLong && (
                                                    <button
                                                        onClick={() => openLeaveDetailsModal(leave)}
                                                        className="text-blue-600 hover:underline font-medium ml-1 focus:outline-none"
                                                    >
                                                        View More
                                                    </button>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    {/* Status dropdown at the bottom of the card */}
                             
<div className="mt-auto pt-3 border-t border-gray-100">
    <label htmlFor={`status-${leave.id}`} className="sr-only">Change status for {leave.user_name}</label>
    <select
        id={`status-${leave.id}`}
        className={`w-full px-3 py-2 border rounded-lg cursor-pointer text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            (leave.status || '').toLowerCase() === "approved" ? "bg-green-100 text-green-700 border-green-300" :
            (leave.status || '').toLowerCase() === "rejected" ? "bg-red-100 text-red-700 border-red-300" :
            "bg-yellow-100 text-yellow-700 border-yellow-300"
        }`}
        value={leave.status || 'Pending'}
        onChange={(e) => handleStatusChange(leave.id, e.target.value)}
    >
        <option value="Pending">Pending</option>
        <option value="Approved">Approved</option>
        <option value="Rejected">Rejected</option>
    </select>
</div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-8 text-center text-gray-500">
                        {(searchTerm || statusFilter !== 'all') && pmleaves && pmleaves.length > 0 ? (
                            "No matching leave requests found with current filters."
                        ) : (
                            "No leave requests to display."
                        )}
                    </div>
                )}
            </div>

            {/* Pagination Controls and "Leaves per page" dropdown */}
            <div className="flex justify-between items-center p-4 border-t border-gray-200 bg-white sticky bottom-0 z-2">
                {/* "Leaves per page" dropdown */}
                {filteredAndSortedLeaves.length > 0 && (
                    <div className="flex items-center text-sm text-gray-700">
                        Leaves per page:
                        <select
                            value={leavesPerPage}
                            onChange={(e) => {
                                setLeavesPerPage(e.target.value);
                            }}
                            className="ml-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value="all">All</option>
                        </select>
                    </div>
                )}

                {/* Your shared Pagination component */}
                {leavesPerPage !== 'all' && filteredAndSortedLeaves.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                )}
            </div>

            {/* Leave Details Modal */}
            <LeaveDetailsModal
                isOpen={isModalOpen}
                onClose={closeLeaveDetailsModal}
                leaveDetails={selectedLeave}
            />
        </div>
    );
};

export default PMleaves;