import React, { useEffect, useState, useCallback } from "react";
import { Loader2, BarChart, Search, CheckCircle, XCircle, Clock, Calendar, User, FileText, X, Edit } from "lucide-react";
import { useLeave } from "../../context/LeaveContext";
import { SectionHeader } from '../../components/SectionHeader';
import { IconApproveButton, IconRejectButton ,IconCancelTaskButton} from "../../../components/AllButtons/AllButtons";
import Pagination from "../../../components/components/Pagination";

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
                        {leaveDetails.end_date && leaveDetails.start_date !== leaveDetails.end_date && ` - ${leaveDetails.end_date}`}
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

export const LeaveManagement = () => {
    const { hrLeaveDetails, hrLeave, postStatuses, loading, error } = useLeave();
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");
    const [filteredData, setFilteredData] = useState([]);
    const [editMode, setEditMode] = useState({});
    console.log("hr leaves", hrLeave);
    const [currentPage, setCurrentPage] = useState(1);
    const [leavesPerPage, setLeavesPerPage] = useState(10); // State for "Leaves per page" dropdown

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLeave, setSelectedLeave] = useState(null);

    const MAX_REASON_LENGTH = 30;

    useEffect(() => {
        hrLeaveDetails();
    }, []);

    const applyFilters = useCallback(() => {
        let currentFilteredData = hrLeave;

        if (searchTerm) {
            currentFilteredData = currentFilteredData.filter(leave =>
                leave.user_name && leave.user_name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filterStatus !== "All") {
            currentFilteredData = currentFilteredData.filter(leave =>
                leave.status === filterStatus
            );
        }

        setFilteredData(currentFilteredData);
        setCurrentPage(1); 
    }, [searchTerm, filterStatus, hrLeave]);

    useEffect(() => {
        applyFilters();
    }, [applyFilters]);

    const handleStatusChange = async (id, newStatus) => {
        const updatedStatus = { id, status: newStatus };
        await postStatuses(updatedStatus);
        setEditMode((prev) => ({ ...prev, [id]: false }));
    };

    const toggleEditMode = (id) => {
        setEditMode((prev) => ({ ...prev, [id]: !prev[id] }));
    };


    const totalPages = leavesPerPage === 'all' ? 1 : Math.ceil(filteredData.length / leavesPerPage);

    const paginatedLeaveRequests = leavesPerPage === 'all'
        ? filteredData
        : filteredData.slice(
            (currentPage - 1) * leavesPerPage,
            currentPage * leavesPerPage
        );

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const openLeaveDetailsModal = (leave) => {
        setSelectedLeave(leave);
        setIsModalOpen(true);
    };

    const closeLeaveDetailsModal = () => {
        setIsModalOpen(false);
        setSelectedLeave(null);
    };

    return (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-lg max-h-screen overflow-y-auto">
            <SectionHeader icon={BarChart} title="Leave Management" subtitle="View and manage employee leave requests" />

            <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-4 sticky top-0 bg-white z-10 shadow-md">
                <div className="relative w-full md:w-auto flex-grow max-w-md">
                    <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Search by Employee Name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>

                <div className="flex flex-wrap justify-center gap-2 mt-3 md:mt-0">
                    <button
                        className={`px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium ${
                            filterStatus === "All"
                                ? "bg-blue-600 text-white shadow-sm"
                                : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                        onClick={() => setFilterStatus("All")}
                    >
                        All
                    </button>
                    <button
                        className={`px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium ${
                            filterStatus === "Pending"
                                ? "bg-blue-600 text-white shadow-sm"
                                : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                        onClick={() => setFilterStatus("Pending")}
                    >
                        Pending
                    </button>
                    <button
                        className={`px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium ${
                            filterStatus === "Approved"
                                ? "bg-blue-600 text-white shadow-sm"
                                : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                        onClick={() => setFilterStatus("Approved")}
                    >
                        Approved
                    </button>
                    <button
                        className={`px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium ${
                            filterStatus === "Rejected"
                                ? "bg-blue-600 text-white shadow-sm"
                                : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                        onClick={() => setFilterStatus("Rejected")}
                    >
                        Rejected
                    </button>
                </div>
            </div>

            <div className="p-4">
                {loading ? (
                    <div className="py-8 text-center text-gray-500">
                        <div className="flex items-center justify-center space-x-3">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                            <span>Loading leave requests...</span>
                        </div>
                    </div>
                ) : error ? (
                    <div className="py-8 text-center text-red-500">
                        Error: {error}
                    </div>
                ) : paginatedLeaveRequests.length === 0 ? (
                    <div className="py-8 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center">
                            <div className="rounded-full bg-gray-100 p-3">
                                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No leave requests found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {searchTerm || filterStatus !== "All"
                                    ? "No matching leave requests found for your search/filter."
                                    : "No leave requests have been submitted yet."}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {paginatedLeaveRequests.map((leave) => {
                            const fullReason = leave.reason || "N/A";
                            const isReasonLong = fullReason.length > MAX_REASON_LENGTH;
                            const displayedReason = isReasonLong
                                ? `${fullReason.substring(0, MAX_REASON_LENGTH)}...`
                                : fullReason;

                            return (
                                <div
                                    key={leave.id}
                                    className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex flex-col space-y-3 hover:shadow-md transition-shadow duration-200 ease-in-out"
                                >
                                    <div className="flex items-center gap-2 text-gray-800">
                                        <User className="h-5 w-5 text-gray-600" />
                                        <span className="font-semibold text-lg">{leave.user_name || "N/A"}</span>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-gray-700 text-sm">
                                            <Calendar className="h-4 w-4 text-gray-500" />
                                            <span className="font-medium">Date:</span>{" "}
                                            {formatDate(leave.start_date)}
                                            {leave.end_date && leave.start_date !== leave.end_date && ` - ${formatDate(leave.end_date)}`}
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

                                    {/* Status & Action Buttons at the bottom of the card */}
                                    <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between w-full">
                                        {editMode[leave.id] ? (
                                            <div className="flex items-center gap-4">
                                                <div className="relative group">
                                                    <IconApproveButton onClick={() => handleStatusChange(leave.id, "Approved")} />
                                                    <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2
                                                        whitespace-nowrap bg-white text-black text-sm px-2 py-1 rounded
                                                        opacity-0 group-hover:opacity-100 transition pointer-events-none shadow">
                                                            Approve
                                                    </span>
                                                </div>

                                                <div className="relative group">
                                                    <IconRejectButton onClick={() => handleStatusChange(leave.id, "Rejected")} />
                                                    <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2
                                                        whitespace-nowrap bg-white text-black text-sm px-2 py-1 rounded
                                                        opacity-0 group-hover:opacity-100 transition pointer-events-none shadow">
                                                            Reject
                                                    </span>
                                                </div>
                                                 <div className="relative group">
                                                    <IconCancelTaskButton onClick={() => setEditMode("")} />
                                                    <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2
                                                        whitespace-nowrap bg-white text-black text-sm px-2 py-1 rounded
                                                        opacity-0 group-hover:opacity-100 transition pointer-events-none shadow">
                                                            Cancel
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                {/* Status Display as a Badge */}
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                    (leave.status || '').toLowerCase() === "approved" ? "bg-green-100 text-green-700" :
                                                    (leave.status || '').toLowerCase() === "rejected" ? "bg-red-100 text-red-700" :
                                                    "bg-yellow-100 text-yellow-700"
                                                }`}>
                                                    {leave.status || 'Pending'}
                                                </span>

                                                {/* Edit button */}
                                                <div className="relative group">
                                                    <button
                                                        onClick={() => toggleEditMode(leave.id)}
                                                        className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                                                    >
                                                        <Edit className="h-5 w-5" />
                                                    </button>
                                                    <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2
                                                        whitespace-nowrap bg-white text-black text-sm px-2 py-1 rounded
                                                        opacity-0 group-hover:opacity-100 transition pointer-events-none shadow">
                                                            Edit
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* --- */}
            {/* Pagination Controls and "Leaves per page" dropdown - UPDATED */}
            <div className="flex justify-between items-center p-4 border-t border-gray-200 bg-white sticky bottom-0 z-2">
                {/* "Leaves per page" dropdown */}
                {filteredData.length > 0 && ( 
                    <div className="flex items-center text-sm text-gray-700">
                        Leaves per page:
                        <select
                            value={leavesPerPage}
                            onChange={(e) => {
                                setLeavesPerPage(e.target.value === 'all' ? 'all' : Number(e.target.value)); // Ensure number conversion
                                setCurrentPage(1); // Reset to first page when changing leaves per page
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
                {leavesPerPage !== 'all' && filteredData.length > 0 && ( 
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                )}
            </div>

            <LeaveDetailsModal
                isOpen={isModalOpen}
                onClose={closeLeaveDetailsModal}
                leaveDetails={selectedLeave}
            />
        </div>
    );
};
