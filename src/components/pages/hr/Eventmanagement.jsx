import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Loader2, BarChart, Search, CheckCircle, XCircle,
  Clock, Calendar, User, Type, FileText, X, Edit
} from "lucide-react";
import { useEvent } from "../../context/EventContext";
import { SectionHeader } from '../../components/SectionHeader';

import {
    IconDeleteButton,
    IconEditButton,
  IconApproveButton,
  IconRejectButton,
  IconCancelTaskButton,
  ClearButton,
  CustomButton
} from "../../../components/AllButtons/AllButtons";
import Pagination from "../../../components/components/Pagination";
import { API_URL } from '../../utils/ApiConfig';
import { usePermissions } from "../../context/PermissionContext"
import { useAlert } from "../../context/AlertContext";
import { useEmployees } from "../../context/EmployeeContext";

/* ---------------- Leave Details Modal ---------------- */
const LeaveDetailsModal = ({ isOpen, onClose, leaveDetails }) => {
  if (!isOpen || !leaveDetails) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>

        <h2 className="text-lg font-bold mb-4 border-b pb-2">
          Leave Details
        </h2>

        <div className="space-y-3 text-[12px]">
          <p><strong>Employee:</strong> {leaveDetails.user_name || "N/A"}</p>
          <p>
            <strong>Date:</strong> {leaveDetails.start_date}
            {leaveDetails.end_date &&
              leaveDetails.start_date !== leaveDetails.end_date &&
              ` - ${leaveDetails.end_date}`}
          </p>
          <p><strong>Type:</strong> {leaveDetails.type}</p>

          {leaveDetails.type === "Half Holiday" && (
            <p><strong>Half:</strong> {leaveDetails.halfday_period}</p>
          )}

          {leaveDetails.type === "Short Holiday" && (
            <p><strong>Time:</strong> {leaveDetails.start_time} - {leaveDetails.end_time}</p>
          )}

          <p><strong>Status:</strong> {leaveDetails.status}</p>
        </div>
      </div>
    </div>
  );
};

/* ---------------- Main Component ---------------- */
export const Eventmanagement = () => {
  const {  hrLeave, loading, error, fetchLeaves, addLeave,deleteLeave,updateLeave } = useEvent();
  const { permissions } = usePermissions();
  const { showAlert } = useAlert();
const [editingLeaveId, setEditingLeaveId] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen1, setIsModalOpen1] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [leavesPerPage] = useState(10);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  /* ---------------- FORM STATE ---------------- */
  const [halfDayPeriod, setHalfDayPeriod] = useState("");

  const [formData, setFormData] = useState({
    start_date: "",
    end_date: "",
    type: "",
    description: "",
    start_time: "",
    end_time: "",
    halfday_period: ""
  });

  /* ---------------- DERIVED FLAGS ---------------- */
  const isFullHoliday = formData.type === "Full Holiday";
  const isHalfHoliday = formData.type === "Half Holiday";
  const isShortHoliday = formData.type === "Short Holiday";
  const isMultipleHoliday = formData.type === "Multiple Holiday";

  /* ✅ FIX: these were missing before */
  const showHours = isShortHoliday;
  const showEndDate = isFullHoliday || isMultipleHoliday;

  /* ---------------- HANDLERS ---------------- */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleHalfDayPeriodChange = (value) => {
    setHalfDayPeriod(value);
    setFormData(prev => ({ ...prev, halfday_period: value }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  // Validate required fields
  if (!formData.start_date || !formData.type || !formData.description) {
    showAlert({
      variant: "warning",
      title: "Warning",
      message: "Start Date, Type and Description are required"
    });
    return;
  }

  if (formData.type === "Half Holiday" && !formData.halfday_period) {
    showAlert({
      variant: "warning",
      title: "Warning",
      message: "Please select Morning or Afternoon"
    });
    return;
  }

  if (formData.type === "Short Holiday" && (!formData.start_time || !formData.end_time)) {
    showAlert({
      variant: "warning",
      title: "Warning",
      message: "Start Time and End Time are required"
    });
    return;
  }

  const payload = {
    start_date: formData.start_date,
    end_date: formData.end_date || formData.start_date,
    type: formData.type,
    description: formData.description,
    ...(formData.type === "Half Holiday" && { halfday_period: formData.halfday_period }),
    ...(formData.type === "Short Holiday" && { start_time: formData.start_time, end_time: formData.end_time })
  };

  try {
    const token = localStorage.getItem("userToken");

    if (editingLeaveId) {
      await updateLeave(editingLeaveId, payload);
      setEditingLeaveId(null); // reset after editing
    } else {
      // POST API for new event
      await addLeave(payload);
    }

    showAlert({
      variant: "success",
      title: "Success",
      message: editingLeaveId ? "Event updated successfully" : "Holiday added successfully"
    });

    setIsModalOpen1(false);
    fetchLeaves();
  } catch (err) {
    showAlert({
      variant: "error",
      title: "Error",
      message: err.message || "Failed to save event"
    });
  }
};


  /* ---------------- FILTER LOGIC ---------------- */
  const applyFilters = useCallback(() => {
    let data = [...(hrLeave || [])];
    setFilteredData(data);
    setCurrentPage(1);
  }, [hrLeave]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

useEffect(() => {
  fetchLeaves();
}, [fetchLeaves]);
  /* ---------------- PAGINATION + HELPERS ---------------- */

  const paginatedLeaveRequests =
    leavesPerPage === "all"
      ? filteredData
      : filteredData.slice(
          (currentPage - 1) * leavesPerPage,
          currentPage * leavesPerPage
        );

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
// Add delete and edit handlers
const handleEdit = (leave) => {
  setEditingLeaveId(leave.id); // <-- track which leave is being edited
  setFormData({
    start_date: leave.start_date,
    end_date: leave.end_date,
    type: leave.type,
    description: leave.description,
    start_time: leave.start_time || "",
    end_time: leave.end_time || "",
    halfday_period: leave.halfday_period || "",
  });
  setIsModalOpen1(true);
};


const handleDelete = async (leaveId) => {
  if (!window.confirm("Are you sure you want to delete this event?")) return;

  try {
    const token = localStorage.getItem("userToken");
    await deleteLeave(leaveId, token); // make sure deleteLeave exists in your context

    showAlert({
      variant: "success",
      title: "Deleted",
      message: "Event deleted successfully",
    });
    fetchLeaves(); // refresh data
  } catch (err) {
    showAlert({
      variant: "error",
      title: "Error",
      message: "Failed to delete event",
    });
  }
};

  return (
    <div className="rounded-2xl border bg-white shadow-lg">
      <SectionHeader
        icon={BarChart}
        title="Event Management"
        subtitle="View and manage Events"
      />
<div className="flex justify-end px-4 pt-4">
  <button
    onClick={() => setIsModalOpen1(true)}
    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
  >
    Add Holiday
  </button>
</div>

      {isModalOpen1 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsModalOpen1(false)}
          />
          <div className="relative bg-white rounded-xl p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">Apply for Holiday</h3>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value,
                    end_date: "",
                    start_time: "",
                    end_time: "",
                    halfday_period: ""
                  })
                }
                className="w-full border p-2 rounded"
              >
                <option value="">Select Holiday Type</option>
                <option value="Full Holiday">Full Holiday</option>
                <option value="Half Holiday">Half Holiday</option>
                <option value="Short Holiday">Short Holiday</option>
                <option value="Multiple Holiday">Multiple Holiday</option>
              </select>

              {isHalfHoliday && (
                <div className="flex gap-4">
                  <label>
                    <input
                      type="radio"
                      value="morning"
                      checked={formData.halfday_period === "morning"}
                      onChange={(e) => handleHalfDayPeriodChange(e.target.value)}
                    /> Morning
                  </label>
                  <label>
                    <input
                      type="radio"
                      value="afternoon"
                      checked={formData.halfday_period === "afternoon"}
                      onChange={(e) => handleHalfDayPeriodChange(e.target.value)}
                    /> Afternoon
                  </label>
                </div>
              )}

              {isShortHoliday && (
                <>
                  <input
                    type="time"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleChange}
                  />
                  <input
                    type="time"
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleChange}
                  />
                </>
              )}

              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
              />

              {showEndDate && (
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                />
              )}

              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Holiday description"
                className="w-full border rounded p-2"
              />

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded"
              >
                Submit
              </button>
            </form>
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
           {paginatedLeaveRequests.map((leave) => (
  <div
    key={leave.id}
    className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex flex-col space-y-3 hover:shadow-md transition"
  >
    {/* Title */}
    <div className="flex items-center gap-2 text-gray-800">
      <FileText className="h-5 w-5 text-gray-600" />
      <span className="font-semibold text-base">
        {leave.description || "Holiday"}
      </span>
    </div>

    {/* Date */}
    <div className="flex items-center gap-2 text-gray-700 text-[12px]">
      <Calendar className="h-4 w-4 text-gray-500" />
      <span className="font-medium">Date:</span>
      {formatDate(leave.start_date)}
      {leave.end_date && leave.start_date !== leave.end_date && (
        <> – {formatDate(leave.end_date)}</>
      )}
    </div>

    {/* Type */}
    <div className="flex items-center gap-2 text-gray-700 text-[12px]">
      <Type className="h-4 w-4 text-gray-500" />
      <span className="font-medium">Type:</span> {leave.type}
    </div>

    {/* Half Holiday */}
    {leave.type === "Half Holiday" && leave.halfday_period && (
      <div className="flex items-center gap-2 text-gray-700 text-[12px]">
        <Clock className="h-4 w-4 text-gray-500" />
        <span className="font-medium">Half Day:</span>
        {leave.halfday_period === "morning" ? "Morning" : "Afternoon"}
      </div>
    )}

    {/* Short Holiday */}
    {leave.type === "Short Holiday" && (
      <div className="flex items-center gap-2 text-gray-700 text-[12px]">
        <Clock className="h-4 w-4 text-gray-500" />
        <span className="font-medium">Time:</span>
        {leave.start_time} – {leave.end_time}
      </div>
    )}

    {/* Multiple Holiday */}
    {leave.type === "Multiple Holiday" && (
      <div className="flex items-center gap-2 text-gray-700 text-[12px]">
        <Calendar className="h-4 w-4 text-gray-500" />
        <span className="font-medium">Duration:</span>
        {formatDate(leave.start_date)} → {formatDate(leave.end_date)}
      </div>
    )}

    {/* Applied Date */}
    <div className="flex items-center gap-2 text-gray-700 text-[12px]">
      <span className="font-medium">Applied On:</span>
      {leave.created_at
        ? new Date(leave.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "—"}
    </div>
    <div className="flex gap-3 mt-2">
  {/* Edit Button */}
  <button
    onClick={() => handleEdit(leave)}
    className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white font-medium px-4 py-1 rounded-lg shadow-sm hover:shadow-md transition transform hover:-translate-y-0.5"
  >
    <IconEditButton className="h-4 w-4" />
    Edit
  </button>

  {/* Delete Button */}
  <button
    onClick={() => handleDelete(leave.id)}
    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-1 rounded-lg shadow-sm hover:shadow-md transition transform hover:-translate-y-0.5"
  >
    <IconDeleteButton className="h-4 w-4" />
    Delete
  </button>
</div>


  </div>
))}

          </div>
        )}
      </div>

      <LeaveDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        leaveDetails={selectedLeave}
      />
    </div>
  );
};
