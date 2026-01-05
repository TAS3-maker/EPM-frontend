import React, { useEffect, useState,useRef, useCallback } from "react";
import { Loader2, BarChart, Search, CheckCircle, XCircle, Clock, Calendar, User,Type, FileText, X, Edit } from "lucide-react";
import { useLeave } from "../../context/LeaveContext";
import { SectionHeader } from '../../components/SectionHeader';
import { IconApproveButton, IconRejectButton ,IconCancelTaskButton,ClearButton,CustomButton} from "../../../components/AllButtons/AllButtons";
import Pagination from "../../../components/components/Pagination";
import { API_URL } from '../../utils/ApiConfig';
import { usePermissions } from "../../context/PermissionContext"
import { useAlert } from "../../context/AlertContext";
import { useEmployees } from "../../context/EmployeeContext";

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
      const { employees,fetchTl,fetchEmployees ,tl, addEmployee, deleteEmployee, updateEmployee, error: contextError ,setTl} = useEmployees(); 
    const [selectedEmployeeId, setSelectedEmployeeId] = useState("");

    const { hrLeaveDetails, hrLeave, postStatuses, loading, error,fetchLeaves,addLeave } = useLeave();
    const {permissions}=usePermissions()
     const { showAlert } = useAlert();
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");
    const [filteredData, setFilteredData] = useState([]);
    const [editMode, setEditMode] = useState({});
    console.log("hr leaves", hrLeave);
    const [currentPage, setCurrentPage] = useState(1);
    const [leavesPerPage, setLeavesPerPage] = useState(10); // State for "Leaves per page" dropdown
    const [leaveType, setLeaveType] = useState('');
    const [showHours, setShowHours] = useState(false);
    const [showEndDate, setShowEndDate] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalOpen1, setIsModalOpen1] = useState(false);
    const [selectedLeave, setSelectedLeave] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [halfDayPeriod, setHalfDayPeriod] = useState(''); // '' | 'morning' | 'afternoon'
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const handleFileChange = (event) => {
    setUploadedFiles(Array.from(event.target.files));
  };
    const MAX_REASON_LENGTH = 30;
          const textareaRef = useRef(null);
  

 const [formData, setFormData] = useState({
        start_date: '',
        end_date: '',
        leave_type: '',
         start_time: '',  
          end_time: '', 
            start_period: '',   // "AM"
  end_period: '',     // "PM"
        hours: '',
        reason: '',
        status: 'Pending',
        halfDayPeriod: ''
    });

const useDraggableTextarea = () => {
  return useCallback((textarea, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    let startY = e.clientY;
    let startHeight = textarea.clientHeight;
    
    const onMouseMove = (moveEvent) => {
      const newHeight = Math.max(80, Math.min(400, startHeight + (moveEvent.clientY - startY)));
      textarea.style.height = `${newHeight}px`;
      textarea.style.minHeight = `${newHeight}px`;
    };
    
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, []);
};
  const resizeTextarea = useDraggableTextarea();
    useEffect(() => {
        hrLeaveDetails();
    }, []);
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
const getDurationDisplay = (startTime, startPeriod, endTime, endPeriod) => {
  const start24 = convert12hrTo24hr(startTime, startPeriod);
  const end24 = convert12hrTo24hr(endTime, endPeriod);
  
  if (!start24 || !end24) return 'Invalid time';
  
  const start = new Date(`2000-01-01T${start24}`);
  const end = new Date(`2000-01-01T${end24}`);
  
  if (end <= start) return 'Invalid range';
  
  const diffMs = end.getTime() - start.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return diffMins === 0 ? `${diffHours}h` : `${diffHours}h ${diffMins}m`;
};

const convert12hrTo24hr = (time12, period) => {
  const [hour, minute] = time12.split(':').map(Number);
  if (isNaN(hour) || isNaN(minute) || hour > 12 || minute > 59) return null;
  
  let hour24 = hour;
  if (period === 'PM' && hour !== 12) hour24 += 12;
  if (period === 'AM' && hour === 12) hour24 = 0;
  
  return `${hour24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
};



   const handleHalfDayPeriodChange = (value) => {
    setHalfDayPeriod(value);
    setFormData(prev => ({ ...prev, halfDayPeriod: value }));
  };
 const handleSubmit = async (e) => {
  e.preventDefault();

  if (formData.leave_type === 'Half Day' && !formData.halfDayPeriod) {
    showAlert({ variant: "warning", title: "Warning", message: "Please select whether the Half Day leave is for the Morning or Afternoon." });
    return;
  }

  const token = localStorage.getItem('userToken');

  if (!token) {
    showAlert({ variant: "error", title: "Error", message: "User not authenticated" });
    return;
  }

  // Create FormData instead of plain object
  const formDataToSend = new FormData();
  formDataToSend.append("user_id", selectedEmployeeId);

  formDataToSend.append('start_date', formData.start_date);
  formDataToSend.append('leave_type', formData.leave_type);
  formDataToSend.append('reason', formData.reason);
  if (formData.leave_type === 'Half Day') {
    formDataToSend.append('halfday_period', formData.halfDayPeriod);
  }
  if (formData.leave_type === 'Multiple Days Leave') {
    formDataToSend.append('end_date', formData.end_date);
  }
if (formData.leave_type === 'Short Leave') {
  const startTimeStr = `${formData.start_time} ${formData.start_period}`;  // "09:30 AM"
  const endTimeStr = `${formData.end_time} ${formData.end_period}`;        // "11:45 PM"
  const duration = getDurationDisplay(formData.start_time, formData.start_period, formData.end_time, formData.end_period);
  
  if (duration === 'Invalid time' || duration === 'Invalid range') {
    showAlert({ variant: "error", message: duration });
    return;
  }
  
  formDataToSend.append('start_time', startTimeStr);
  formDataToSend.append('end_time', endTimeStr);
  formDataToSend.append('hours', duration);
}



  // Append uploaded files, assuming uploadedFiles contains selected File objects
  if (uploadedFiles && uploadedFiles.length > 0) {
    uploadedFiles.forEach((file) => {
      formDataToSend.append('documents', file);
    });
  }

  // Client-side validation for required fields
  if (!formData.start_date || !formData.leave_type || !formData.reason) {
    showAlert({ variant: "warning", title: "Warning", message: "Please fill in all required fields (Start Date, Leave Type, Reason)." });
    return;
  }
  if (formData.leave_type === 'Multiple Days Leave' && !formData.end_date) {
    showAlert({ variant: "warning", title: "Warning", message: "Please select an End Date for Multiple Days Leave." });
    return;
  }
  if (formData.leave_type === 'Short Leave' && (!formData.start_time || !formData.end_time)) {
    showAlert({ 
      variant: "warning", 
      title: "Warning", 
      message: "Please select both Start and End time for Short Leave." 
    });
    if (!selectedEmployeeId) {
  showAlert({
    variant: "warning",
    title: "Warning",
    message: "Please select an employee"
  });
  return;
}

    return;
  }

  try {
    const response = await addLeave(formDataToSend, token, {
      headers: { 'Content-Type': 'multipart/form-data' } // Ensure proper headers for FormData
    });

    if (response) {
      showAlert({ variant: "success", title: "Success", message: "Leave request submitted successfully" });
      setLeaveType('');
      setIsModalOpen1(false);
      fetchLeaves();
    }
  } catch (err) {
    console.error('Error submitting leave request:', err);

    let errorMessage = "Failed to submit leave request due to an unexpected error.";
    if (err.response && err.response.data) {
      if (typeof err.response.data === 'object' && err.response.data !== null) {
        if (err.response.data.message) {
          errorMessage = err.response.data.message;
        }
        if (err.response.data.errors && Array.isArray(err.response.data.errors)) {
          const detailErrors = err.response.data.errors.map(e => e.msg || e.message || String(e)).join('; ');
          errorMessage += (errorMessage ? "\nDetails: " : "Details: ") + detailErrors;
        } else if (!errorMessage) {
          errorMessage = JSON.stringify(err.response.data);
        }
      } else if (typeof err.response.data === 'string') {
        errorMessage = err.response.data;
      }
    } else if (err.message) {
      errorMessage = err.message;
    }
    showAlert({ variant: "error", title: "Error", message: errorMessage });
  }
};





    const employeePermission=permissions?.permissions?.[0]?.leave_management
    const canAddEmployee=employeePermission==="2"

    const applyFilters = useCallback(() => {
        let currentFilteredData = hrLeave;
          if (startDate && endDate) {
    currentFilteredData = currentFilteredData.filter(leave => {
      const leaveStart = leave.start_date?.split('T')[0];
      const leaveEnd = leave.end_date?.split('T')[0] || leaveStart;
      
      return leaveStart >= startDate && leaveEnd <= endDate;
    });
  }

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
    }, [searchTerm, filterStatus, hrLeave,startDate,endDate]);

 useEffect(() => {
    applyFilters();
}, [searchTerm, filterStatus, startDate, endDate, hrLeave]);

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
                {canAddEmployee && (
                 <button
                    className='bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition-colors duration-200 w-full md:w-auto'
                    onClick={() => setIsModalOpen1(true)}
                >
                    Add Leave
                </button>
                    )}
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

                      <div>
                         <input
                type="date"
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={endDate || undefined}
              />
              <input
                type="date"
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || undefined}
              />





                      </div>

                          <ClearButton
                                      onClick={() => {
                                        setStartDate("");
                                        setEndDate("");
                                        setSearchTerm("")
                                      }}
                                    />


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
  {isModalOpen1 && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none"
                    aria-labelledby="modal-title"
                    role="dialog"
                    aria-modal="true"
                >
                    {/* Overlay */}
                    <div
                        className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity"
                        onClick={() => setIsModalOpen1(false)} // Close modal when clicking on the overlay
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
                                onClick={() => setIsModalOpen1(false)}
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

                                   <div className="flex flex-col items-start sm:items-center justify-between gap-4">
                                    {/* Employee Select */}
<div className="w-full">
  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
    <User className="w-4 h-4 mr-2 text-gray-400" />
    Employee
  </label>

  <select
    value={selectedEmployeeId}
    onChange={(e) => setSelectedEmployeeId(e.target.value)}
    className="block w-full px-4 py-3 border-2 border-gray-200 rounded-lg shadow-sm
               focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    required
  >
    <option value="">Select Employee</option>
    {employees.map((emp) => (
      <option key={emp.id} value={emp.id}>
        {emp.name}
      </option>
    ))}
  </select>
</div>

                                    <div className={`relative ${showHours ? 'sm:w-12/12' : 'sm:w-full'} w-full`}>
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
                                                className="block  w-full px-4 py-3 border-2 border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out appearance-none bg-white"
                                            >
                                                <option value="">Select Leave Type</option>
                                                <option value="Half Day">Half Day</option>
                                

                                                <option value="Full Leave">Full Day</option>
                                                <option value="Short Leave">Short Leave</option>
                                                <option value="Multiple Days Leave">Multiple Days Leave</option>
                                            </select>
                                                     {leaveType === 'Half Day' && (
  <div className="mt-4">
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      Select Half Day Period:
    </label>
    <div className="flex gap-6">  {/* Adds horizontal gap between radio items */}
      <label className="inline-flex items-center">
        <input
          type="radio"
          name="halfDayPeriod"
          value="morning"
          checked={halfDayPeriod === 'morning'}
          onChange={(e) => handleHalfDayPeriodChange(e.target.value)}
          className="form-radio text-blue-600"
        />
        <span className="ml-2 text-gray-900 font-medium">Morning</span>
      </label>
      <label className="inline-flex items-center">
        <input
          type="radio"
          name="halfDayPeriod"
          value="afternoon"
          checked={halfDayPeriod === 'afternoon'}
          onChange={(e) => handleHalfDayPeriodChange(e.target.value)}
          className="form-radio text-blue-600"
        />
        <span className="ml-2 text-gray-900 font-medium">Afternoon</span>
      </label>
    </div>
  </div>
)}




                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

{showHours && (
  <div className="w-full sm:w-12/12 space-y-3">
    <label className="block text-sm font-medium text-gray-700 flex items-center">
      <Clock className="w-4 h-4 mr-2 text-gray-400" />
      Select Time Range
    </label>
    
    {/* 🎯 START TIME */}
    <div className="grid grid-cols-2 gap-3 items-end">
      <div className="space-y-1">
        <label className="block text-xs font-medium text-gray-500">From (HH:MM)</label>
        <input
          type="text"
          name="start_time"
          value={formData.start_time || ''}
          onChange={handleChange}
          placeholder="09:30"
          pattern="([01]?[0-9]|2[0-3]):[0-5][0-9]"
          maxLength="5"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-mono tracking-wider h-11"
        />
      </div>
      
      <select
        name="start_period"
        value={formData.start_period || ''}
        onChange={handleChange}
        className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm h-11"
        aria-placeholder='AM/PM'
      >
       
        <option value="PM">PM</option>
        <option value="AM">AM</option>
      </select>
    </div>

    {/* 🎯 END TIME */}
    <div className="grid grid-cols-2 gap-3 items-end">
      <div className="space-y-1">
        <label className="block text-xs font-medium text-gray-500">To (HH:MM)</label>
        <input
          type="text"
          name="end_time"
          value={formData.end_time || ''}
          onChange={handleChange}
          placeholder="11:45"
          pattern="([01]?[0-9]|2[0-3]):[0-5][0-9]"
          maxLength="5"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-mono tracking-wider h-11"
        />
      </div>
      
      <select
        name="end_period"
        value={formData.end_period || ''}
        onChange={handleChange}
        className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm h-11"
      >
        <option value="PM">PM</option>
        <option value="AM">AM</option>
      </select>
    </div>

    {/* ✅ DURATION PREVIEW */}
    {formData.start_time && formData.start_period && formData.end_time && formData.end_period && (
      <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl shadow-sm">
        <div className="flex flex-col gap-1 text-xs">
          <span>🕐 {formData.start_time} {formData.start_period}</span>
          <span>🕔 {formData.end_time} {formData.end_period}</span>
          <span className="font-semibold text-green-800">
            ⏱️ {getDurationDisplay(formData.start_time, formData.start_period, formData.end_time, formData.end_period)}
          </span>
        </div>
      </div>
    )}
  </div>
)}




                                </div>



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

                             

                                {/* Leave Reason */}
                   <div className="relative group">
  <label htmlFor="leave-reason" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
    <FileText className="w-4 h-4 mr-2 text-gray-400" />
    Leave Reason <span className="ml-1 text-xs text-gray-500">(Drag corner)</span>
  </label>
  
  <div className="relative">
    <textarea 
      id="leave-reason"
      name="reason"
      ref={(el) => {
        textareaRef.current = el;
      }}
      rows="4"
      value={formData.reason}
      onChange={handleChange}
      placeholder="Please provide a detailed reason for your leave request."
      className="block w-full px-4 py-3 border-2 border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none min-h-[100px] max-h-[400px] hover:shadow-md group-hover:shadow-lg"
      style={{ height: 'auto' }}
    />
    
    {/* 🎯 DRAG HANDLE */}
    <button
      type="button"
      className="absolute bottom-1 right-1 w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-lg cursor-se-resize flex items-center justify-center opacity-0 group-hover:opacity-100 hover:opacity-100 transition-all duration-200 hover:scale-110 hover:shadow-xl z-10"
      onMouseDown={(e) => resizeTextarea(textareaRef.current, e)}
      title="Drag to resize"
    >
      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    </button>
  </div>
</div>
                          <div className='relative'>
  <label htmlFor="leave-documents" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
    <FileText className="w-4 h-4 mr-2 text-gray-400" />
    Upload your documents
  </label>
  <input
    type="file"
    id="leave-documents"
    name="documents"
    onChange={handleFileChange}
    className="block w-full text-sm text-gray-500
               file:mr-4 file:py-2 file:px-4
               file:rounded-full file:border-0
               file:text-sm file:font-semibold
               file:bg-blue-50 file:text-blue-700
               hover:file:bg-blue-100"
    multiple
  />
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
                                 const documentURL = leave.documents ? `${API_URL}/storage/leaves/${leave.documents}`
                                  : null;

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
   {leave.leave_type === 'Half Day' && leave.halfday_period && (
    
<div className="flex items-center gap-2 text-gray-700 text-sm">
      <Type className="h-4 w-4 text-gray-500" />

    <span className="font-medium">Half Day Period:</span> {leave.halfday_period === 'morning' ? 'Morning' : 'Afternoon'}
  </div>
)}




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
    {leave.hours ? `${leave.hours} ` : (leave.hours === 0 ? "0 Hours" : "Full Day")}
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
                                <div className="flex items-start gap-2 text-gray-700 text-sm">
  <span className="font-medium min-w-[50px]">Applied Date:</span>{" "}
  <p className="flex-1">
    {leave.created_at ? new Date(leave.created_at).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }) : '—'}
  </p>
</div>


                                         {documentURL && (
  <div className="mt-3 flex items-center gap-4">
    <div className="font-medium min-w-[50px]">Documents</div>
    <a
      href={documentURL}
      download={leave.documents}
      className="text-blue-600 hover:text-blue-800 underline text-sm"
      target="_blank"
      rel="noopener noreferrer"
    >
      Download
    </a>

    {leave.documents.toLowerCase() && (
      <a
        href={documentURL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-green-600 hover:text-green-800 underline text-sm"
      >
        Preview
      </a>
    )}
  </div>
)}





                                    </div>

                                    {/* Status & Action Buttons at the bottom of the card */}
                                    {canAddEmployee&&(
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
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* --- */}
            {/* Pagination Controls and "Leaves per page" dropdown - UPDATED */}
            <div className="flex justify-center items-center p-4 border-t border-gray-200 bg-white sticky bottom-0 z-2">
                

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
