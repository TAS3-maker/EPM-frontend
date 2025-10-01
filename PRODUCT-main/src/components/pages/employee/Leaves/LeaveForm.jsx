import React, { useState, useEffect, useCallback } from 'react';
import { useLeave } from '../../../context/LeaveContext';
import { Calendar, Clock, FileText, Type, CheckCircle, XCircle, Clock3, Search, Loader2, Info } from 'lucide-react';
import { SectionHeader } from '../../../components/SectionHeader';
import { useAlert } from "../../../context/AlertContext";
import Pagination from "../../../components/Pagination"; // Assuming this path is correct

// New LeaveCard Component
const LeaveCard = ({ leave, formatDate, getStatusBadge, calculateTotalDays, onViewDetails }) => {
    const MAX_REASON_LENGTH = 100; // Define max length for truncated reason
    const isReasonLong = (leave.reason || '').length > MAX_REASON_LENGTH;
    const displayedReason = isReasonLong
        ? (leave.reason || '').substring(0, MAX_REASON_LENGTH) + '...'
        : (leave.reason || 'N/A');

    return (
        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-200">
            <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                        <Type className="w-5 h-5 text-blue-500 mr-2" />
                        {leave.leave_type || "N/A"}
                    </h3>
                    {getStatusBadge(leave.status)}
                </div>

                <div className="space-y-3 mb-4">
                    <div className="flex items-center text-gray-700">
                        <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                        <span className="font-medium">Start Date:</span>
                        <span className="ml-2">{formatDate(leave.start_date)}</span>
                    </div>
                    {leave.leave_type === 'Multiple Days Leave' && leave.end_date && (
                        <div className="flex items-center text-gray-700">
                            <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                            <span className="font-medium">End Date:</span>
                            <span className="ml-2">{formatDate(leave.end_date)}</span>
                        </div>
                    )}
                    {leave.leave_type === 'Short Leave' && (leave.hours !== null && leave.hours !== undefined) && (
                        <div className="flex items-center text-gray-700">
                            <Clock className="w-4 h-4 text-gray-500 mr-2" />
                            <span className="font-medium">Hours:</span>
                            <span className="ml-2">{leave.hours}</span>
                        </div>
                    )}
                    {leave.leave_type === 'Multiple Days Leave' && leave.start_date && leave.end_date && (
                        <div className="flex items-center text-gray-700">
                            <Clock className="w-4 h-4 text-gray-500 mr-2" />
                            <span className="font-medium">Total Days:</span>
                            <span className="ml-2">{calculateTotalDays(leave.start_date, leave.end_date)}</span>
                        </div>
                    )}
                </div>

                <div className="text-sm text-gray-600 border-t border-gray-100 pt-4">
                    <div className="flex items-start">
                        <FileText className="w-4 h-4 text-gray-500 mr-2 mt-1" />
                        <div>
                            <span className="font-medium">Reason:</span>
                            <p className="mt-1">{displayedReason}</p>
                            {isReasonLong && (
                                <button
                                    onClick={() => onViewDetails(leave)}
                                    className="mt-2 text-blue-600 hover:text-blue-800 text-xs font-semibold flex items-center"
                                >
                                    View Details <Info className="w-3 h-3 ml-1" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


function LeaveForm() {
    const [leaveType, setLeaveType] = useState('');
    const [showHours, setShowHours] = useState(false);
    const [showEndDate, setShowEndDate] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility for Add Leave form
    const [searchTerm, setSearchTerm] = useState(''); // State for table search
    const [filterStatus, setFilterStatus] = useState("All"); // State for filtering by status: "All", "Pending", "Approved", "Rejected"
    const [filteredLeaves, setFilteredLeaves] = useState([]); // State for filtered table data

    // New states for detail modal
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedLeave, setSelectedLeave] = useState(null);


    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6; // Adjusted for better card display, You can adjust this number

    const { showAlert } = useAlert();

    const [formData, setFormData] = useState({
        start_date: '',
        end_date: '',
        leave_type: '',
        hours: '',
        reason: '',
        status: 'Pending',
    });

    const { leaves, addLeave, loading, error, fetchLeaves } = useLeave();

    // Effect to fetch leaves when the component mounts
    useEffect(() => {
        fetchLeaves();
    }, []);

    // Memoize the filter function for performance
    const applyFilters = useCallback(() => {
        let currentFilteredData = leaves || [];

        // Apply search term filter
        if (searchTerm) {
            const lowercasedSearchTerm = searchTerm.toLowerCase();
            currentFilteredData = currentFilteredData.filter(leave => {
                const startDate = leave.start_date ?? '';
                const endDate = leave.end_date ?? '';
                const leaveTypeVal = leave.leave_type ?? '';
                const reason = leave.reason ?? '';
                const hours = (leave.hours !== null && leave.hours !== undefined) ? String(leave.hours) : '';
                const status = leave.status ?? '';

                return (
                    startDate.toLowerCase().includes(lowercasedSearchTerm) ||
                    endDate.toLowerCase().includes(lowercasedSearchTerm) ||
                    leaveTypeVal.toLowerCase().includes(lowercasedSearchTerm) ||
                    reason.toLowerCase().includes(lowercasedSearchTerm) ||
                    hours.includes(lowercasedSearchTerm) ||
                    status.toLowerCase().includes(lowercasedSearchTerm)
                );
            });
        }

        // Apply status filter
        if (filterStatus !== "All") {
            currentFilteredData = currentFilteredData.filter(leave =>
                (leave.status || '').toLowerCase() === filterStatus.toLowerCase()
            );
        }

        setFilteredLeaves(currentFilteredData);
        setCurrentPage(1); // Reset to first page whenever filters change
    }, [searchTerm, filterStatus, leaves]); // Dependencies updated to include filterStatus

    // Run filter function whenever searchTerm, filterStatus, or leaves changes
    useEffect(() => {
        applyFilters();
    }, [applyFilters]);

    // Effect to manage form fields visibility based on selected leave type
    useEffect(() => {
        if (leaveType === 'Short Leave') {
            setShowHours(true);
            setShowEndDate(false);
            setFormData(prev => ({ ...prev, end_date: '' }));
        } else if (leaveType === 'Multiple Days Leave') {
            setShowHours(false);
            setShowEndDate(true);
            setFormData(prev => ({ ...prev, hours: '' }));
        } else {
            setShowHours(false);
            setShowEndDate(false);
            setFormData(prev => ({ ...prev, end_date: '', hours: '' }));
        }
        setFormData(prev => ({ ...prev, leave_type: leaveType }));
    }, [leaveType]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('userToken');

        if (!token) {
            showAlert({ variant: "error", title: "Error", message: "User not authenticated" });
            return;
        }

        const leaveDataToSubmit = {
            start_date: formData.start_date,
            leave_type: formData.leave_type,
            reason: formData.reason,
        };

        if (formData.leave_type === 'Multiple Days Leave') {
            leaveDataToSubmit.end_date = formData.end_date;
        }
        if (formData.leave_type === 'Short Leave') {
            leaveDataToSubmit.hours = formData.hours;
        }

        // Basic client-side validation
        if (!leaveDataToSubmit.start_date || !leaveDataToSubmit.leave_type || !leaveDataToSubmit.reason) {
            showAlert({ variant: "warning", title: "Warning", message: "Please fill in all required fields (Start Date, Leave Type, Reason)." });
            return;
        }
        if (leaveDataToSubmit.leave_type === 'Multiple Days Leave' && !leaveDataToSubmit.end_date) {
            showAlert({ variant: "warning", title: "Warning", message: "Please select an End Date for Multiple Days Leave." });
            return;
        }
        if (leaveDataToSubmit.leave_type === 'Short Leave' && !leaveDataToSubmit.hours) {
            showAlert({ variant: "warning", title: "Warning", message: "Please specify the Number of Hours for Short Leave." });
            return;
        }

        // console.log('Submitting Leave Data:', leaveDataToSubmit);

        try {
            const response = await addLeave(leaveDataToSubmit, token);
            // console.log('API Response:', response);

            if (response) {
                showAlert({ variant: "success", title: "Success", message: "Leave request submitted successfully" });
                // setFormData({
                //     start_date: '',
                //     end_date: '',
                //     leave_type: '',
                //     hours: '',
                //     reason: '',
                //     status: 'Pending',
                // });
                setLeaveType('');
                setIsModalOpen(false); // Close the modal
                fetchLeaves(); // Re-fetch leaves to update the table
            }
        } catch (err) {
            console.error('Error submitting leave request:', err);

            let errorMessage = "Failed to submit leave request due to an unexpected error.";

            if (err.response && err.response.data) {
                // If err.response.data is an object, try to extract message or stringify
                if (typeof err.response.data === 'object' && err.response.data !== null) {
                    // Prioritize a 'message' property
                    if (err.response.data.message) {
                        errorMessage = err.response.data.message;
                    }
                    // Append specific validation errors if present
                    if (err.response.data.errors && Array.isArray(err.response.data.errors)) {
                        const detailErrors = err.response.data.errors.map(e => e.msg || e.message || String(e)).join('; ');
                        errorMessage += (errorMessage ? "\nDetails: " : "Details: ") + detailErrors;
                    } else if (!errorMessage) {
                        // If no specific message and no errors array, stringify the whole object
                        errorMessage = JSON.stringify(err.response.data);
                    }
                } else if (typeof err.response.data === 'string') {
                    // If err.response.data is a string, use it directly
                    errorMessage = err.response.data;
                }
            } else if (err.message) {
                // Fallback to the generic error message from the error object itself
                errorMessage = err.message;
            }

            showAlert({ variant: "error", title: "Error", message: errorMessage });
        }
    };

    const getStatusBadge = (status) => {
        const lowerStatus = (status || '').toLowerCase();

        switch (lowerStatus) {
            case 'approved':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Approved
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircle className="w-3 h-3 mr-1" />
                        Rejected
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Clock3 className="w-3 h-3 mr-1" />
                        Pending
                    </span>
                );
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Function to calculate total days excluding weekends
    const calculateTotalDays = (startDate, endDate) => {
        if (!startDate || !endDate) return "N/A";

        let start = new Date(startDate);
        let end = new Date(endDate);
        let totalDays = 0;

        // Loop through each day from start to end date
        while (start <= end) {
            const dayOfWeek = start.getDay(); // 0 = Sunday, 6 = Saturday
            if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Exclude Sunday and Saturday
                totalDays++;
            }
            start.setDate(start.getDate() + 1); // Move to the next day
        }
        return totalDays;
    };

    // Handle opening the detail modal
    const handleViewDetails = (leave) => {
        setSelectedLeave(leave);
        setShowDetailModal(true);
    };

    // Calculate total pages based on filtered data
    const totalPages = Math.ceil(filteredLeaves.length / itemsPerPage);

    // Apply pagination to filtered data
    const paginatedLeaveRequests = filteredLeaves.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );


    return (
        <>
            <SectionHeader icon={Calendar} title="Leave Request" subtitle="Employee Leave Request" />

            {/* Action bar with Add Leave button, Status Filters, and Search */}
            <div className='flex flex-col md:flex-row justify-between items-center px-4 py-3 gap-3'>
                <button
                    className='bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition-colors duration-200 w-full md:w-auto'
                    onClick={() => setIsModalOpen(true)}
                >
                    Add Leave
                </button>

                {/* Search Input */}
                <div className="relative w-full md:w-auto flex-1 max-w-md">
                    <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                        placeholder="Search by Date, Type, Reason, or Hours..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                {/* Filter Buttons */}
                <div className="flex gap-2 flex-wrap justify-center md:justify-start">
                    <button
                        className={`p-2 border rounded-lg ${
                            filterStatus === "All" ? "bg-blue-600 text-white" : "border-gray-300 text-gray-700 hover:bg-gray-100"
                        } transition-colors duration-200`}
                        onClick={() => setFilterStatus("All")}
                    >
                        All
                    </button>
                    <button
                        className={`p-2 border rounded-lg ${
                            filterStatus === "Pending" ? "bg-yellow-500 text-white" : "border-gray-300 text-gray-700 hover:bg-gray-100"
                        } transition-colors duration-200`}
                        onClick={() => setFilterStatus("Pending")}
                    >
                        Pending
                    </button>
                    <button
                        className={`p-2 border rounded-lg ${
                            filterStatus === "Approved" ? "bg-green-600 text-white" : "border-gray-300 text-gray-700 hover:bg-gray-100"
                        } transition-colors duration-200`}
                        onClick={() => setFilterStatus("Approved")}
                    >
                        Approved
                    </button>
                    <button
                        className={`p-2 border rounded-lg ${
                            filterStatus === "Rejected" ? "bg-red-600 text-white" : "border-gray-300 text-gray-700 hover:bg-gray-100"
                        } transition-colors duration-200`}
                        onClick={() => setFilterStatus("Rejected")}
                    >
                        Rejected
                    </button>
                </div>
            </div>

            {/* Add Leave Modal */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none"
                    aria-labelledby="modal-title"
                    role="dialog"
                    aria-modal="true"
                >
                    {/* Overlay */}
                    <div
                        className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity"
                        onClick={() => setIsModalOpen(false)} // Close modal when clicking on the overlay
                    ></div>

                    {/* Modal Content */}
                    <div className="relative bg-white rounded-xl shadow-xl p-6 m-4 max-w-lg w-full z-50 transform transition-all sm:my-8 sm:align-middle">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                            <h3 className="text-2xl font-semibold text-gray-800" id="modal-title">
                                Apply for Leave
                            </h3>
                            <button
                                type="button"
                                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                onClick={() => setIsModalOpen(false)}
                                aria-label="Close"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body - Leave Form */}
                        <div className="py-6">
                            <form className="space-y-6" onSubmit={handleSubmit}>
                                {/* Start Date & End Date */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className={`relative ${showEndDate ? 'sm:w-6/12' : 'sm:w-full'} w-full`}>
                                        <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                            Start Date
                                        </label>
                                        <input
                                            type="date"
                                            id="start-date"
                                            name="start_date"
                                            value={formData.start_date}
                                            onChange={handleChange}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="block w-full px-4 py-3 border-2 border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
                                        />
                                    </div>

                                    {showEndDate && (
                                        <div className="relative w-full sm:w-6/12">
                                            <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                                End Date
                                            </label>
                                            <input
                                                type="date"
                                                id="end-date"
                                                name="end_date"
                                                value={formData.end_date}
                                                onChange={handleChange}
                                                className="block w-full px-4 py-3 border-2 border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Leave Type & Hours */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className={`relative ${showHours ? 'sm:w-6/12' : 'sm:w-full'} w-full`}>
                                        <label htmlFor="leave-type" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                            <Type className="w-4 h-4 mr-2 text-gray-400" />
                                            Leave Type
                                        </label>
                                        <div className="relative">
                                            <select
                                                id="leave-type"
                                                name="leave_type"
                                                value={leaveType}
                                                onChange={(e) => setLeaveType(e.target.value)}
                                                className="block w-full px-4 py-3 border-2 border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out appearance-none bg-white"
                                            >
                                                <option value="">Select Leave Type</option>
                                                <option value="Half Day">Half Day</option>
                                                <option value="Full Leave">Full Day</option>
                                                <option value="Short Leave">Short Leave</option>
                                                <option value="Multiple Days Leave">Multiple Days Leave</option>
                                            </select>
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    {showHours && (
                                        <div className="relative w-full sm:w-6/12">
                                            <label htmlFor="hours" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                                Number of Hours
                                            </label>
                                            <input
                                                type="text"
                                                id="hours"
                                                name="hours"
                                                value={formData.hours}
                                                onChange={handleChange}
                                                placeholder='e.g., 3pm to 6pm or 4'
                                                className="block w-full px-4 py-3 border-2 border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Leave Reason */}
                                <div className="relative">
                                    <label htmlFor="leave-reason" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                        <FileText className="w-4 h-4 mr-2 text-gray-400" />
                                        Leave Reason
                                    </label>
                                    <textarea
                                        id="leave-reason"
                                        name="reason"
                                        rows="4"
                                        value={formData.reason}
                                        onChange={handleChange}
                                        className="block w-full px-4 py-3 border-2 border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out resize-none"
                                        placeholder="Please provide a detailed reason for your leave request..."
                                    ></textarea>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center">
                                            <Loader2 className="animate-spin h-5 w-5 mr-3" /> Submitting...
                                        </span>
                                    ) : (
                                        'Submit Leave Request'
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Leave Records Display (Cards) */}
            <div className="mt-6 w-full max-w-full mx-auto px-4">
                {loading && (
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="flex items-center space-x-3 bg-white px-8 py-6 rounded-xl shadow-lg">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                            <span className="text-lg text-gray-600">Loading leave records...</span>
                        </div>
                    </div>
                )}
                {/* Corrected Error Display for 'error' state from useLeave */}

                {!loading && !error && paginatedLeaveRequests.length === 0 ? (
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
                            <p className="text-xl font-semibold text-gray-700 mb-2">No matching leave records found</p>
                            {searchTerm || filterStatus !== "All" ? (
                                <p className="text-gray-500">No leave requests match your current search or filter.</p>
                            ) : (
                                <p className="text-gray-500">You haven't submitted any leave requests yet.</p>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {paginatedLeaveRequests.map((leave) => (
                            <LeaveCard
                                key={leave.id || `${leave.start_date}-${leave.leave_type}-${leave.reason}`}
                                leave={leave}
                                formatDate={formatDate}
                                getStatusBadge={getStatusBadge}
                                calculateTotalDays={calculateTotalDays}
                                onViewDetails={handleViewDetails} // Pass the handler
                            />
                        ))}
                    </div>
                )}

                {/* Pagination Component */}
                {!loading && !error && filteredLeaves.length > 0 && (
                    <div className="p-4 flex justify-center mt-6">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>

            {/* Detail Popup Modal */}
            {showDetailModal && selectedLeave && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none"
                    aria-labelledby="detail-modal-title"
                    role="dialog"
                    aria-modal="true"
                >
                    {/* Overlay */}
                    <div
                        className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity"
                        onClick={() => setShowDetailModal(false)}
                    ></div>

                    {/* Modal Content */}
                    <div className="relative bg-white rounded-xl shadow-xl p-6 m-4 max-w-md w-full z-50 transform transition-all sm:my-8 sm:align-middle">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                            <h3 className="text-2xl font-semibold text-gray-800" id="detail-modal-title">
                                Leave Details
                            </h3>
                            <button
                                type="button"
                                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                onClick={() => setShowDetailModal(false)}
                                aria-label="Close"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body - Details */}
                        <div className="py-6 space-y-4">
                            <p className="text-gray-700 flex items-center">
                                <Type className="w-5 h-5 text-blue-500 mr-2" />
                                <span className="font-semibold">Leave Type:</span> <span className="ml-2">{selectedLeave.leave_type || "N/A"}</span>
                            </p>
                            <p className="text-gray-700 flex items-center">
                                <Calendar className="w-5 h-5 text-gray-500 mr-2" />
                                <span className="font-semibold">Start Date:</span> <span className="ml-2">{formatDate(selectedLeave.start_date)}</span>
                            </p>
                            {selectedLeave.leave_type === 'Multiple Days Leave' && selectedLeave.end_date && (
                                <p className="text-gray-700 flex items-center">
                                    <Calendar className="w-5 h-5 text-gray-500 mr-2" />
                                    <span className="font-semibold">End Date:</span> <span className="ml-2">{formatDate(selectedLeave.end_date)}</span>
                                </p>
                            )}
                            {selectedLeave.leave_type === 'Short Leave' && (selectedLeave.hours !== null && selectedLeave.hours !== undefined) && (
                                <p className="text-gray-700 flex items-center">
                                    <Clock className="w-5 h-5 text-gray-500 mr-2" />
                                    <span className="font-semibold">Hours:</span> <span className="ml-2">{selectedLeave.hours}</span>
                                </p>
                            )}
                            {selectedLeave.leave_type === 'Multiple Days Leave' && selectedLeave.start_date && selectedLeave.end_date && (
                                <p className="text-gray-700 flex items-center">
                                    <Clock className="w-5 h-5 text-gray-500 mr-2" />
                                    <span className="font-semibold">Total Days (Weekdays):</span> <span className="ml-2">{calculateTotalDays(selectedLeave.start_date, selectedLeave.end_date)}</span>
                                </p>
                            )}
                            <p className="text-gray-700 flex items-start">
                                <FileText className="w-5 h-5 text-gray-500 mr-2 mt-1" />
                                <span className="font-semibold">Reason:</span> <span className="ml-2 whitespace-pre-wrap">{selectedLeave.reason || "N/A"}</span>
                            </p>
                            <div className="flex items-center">
                                <span className="font-semibold text-gray-700 mr-2">Status:</span>
                                {getStatusBadge(selectedLeave.status)}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="pt-4 border-t border-gray-200 flex justify-end">
                            <button
                                type="button"
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg shadow transition-colors duration-200"
                                onClick={() => setShowDetailModal(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default LeaveForm;