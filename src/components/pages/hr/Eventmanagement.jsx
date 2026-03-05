import React, { useEffect, useState } from "react";
import { useEvent } from "../../context/EventContext";
import { useAlert } from "../../context/AlertContext";
import { BarChart, X, Edit, Calendar, Search } from "lucide-react";
import { SectionHeader } from "../../components/SectionHeader";
import DateRangePicker from "../../components/DateRangePicker";
import Pagination from "../../components/Pagination";
import { usePermissions } from "../../context/PermissionContext.jsx";

export const Eventmanagement = () => {
  const { hrLeave, fetchLeaves, addLeave, deleteLeave, updateLeave } = useEvent();
  const { showAlert } = useAlert();
  const {permissions}=usePermissions()
  const [editingLeaveId, setEditingLeaveId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Filters state
  const [dateFilter, setDateFilter] = useState({ start: "", end: "" });
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [formData, setFormData] = useState({
    start_date: "",
    end_date: "",
    type: "",
    description: "",
    halfday_period: "",
    start_time: "",
    end_time: "",
    timezone: "Asia/Kolkata",
  });
  const employeePermission = permissions?.permissions?.[0]?.event_management;
  const canAddEmployee = employeePermission === "2"
  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [dateFilter, searchQuery, hrLeave]);

  /* ---------------- HANDLERS ---------------- */

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const resetForm = () => {
    setEditingLeaveId(null);
    setFormData({
      start_date: "",
      end_date: "",
      type: "",
      description: "",
      halfday_period: "",
      start_time: "",
      end_time: "",
      timezone: "Asia/Kolkata",
    });
  };

  // Filter events by date range - TIMELINE SPECIFIC
  const filterEventsByDate = (events) => {
    if (!dateFilter.start && !dateFilter.end) return events;

    return events.filter((event) => {
      const eventDate = new Date(event.start_date);
      
      if (dateFilter.start && !dateFilter.end) {
        return eventDate >= new Date(dateFilter.start);
      }
      
      if (!dateFilter.start && dateFilter.end) {
        return eventDate <= new Date(dateFilter.end);
      }
      
      return eventDate >= new Date(dateFilter.start) && 
             eventDate <= new Date(dateFilter.end);
    });
  };

  // Search events - TIMELINE SPECIFIC (sirf events data pe)
  const filterEventsBySearch = (events) => {
    if (!searchQuery.trim()) return events;

    const query = searchQuery.toLowerCase();
    return events.filter((event) => {
      const checkDateMatch = (dateStr) => {
        if (!dateStr) return false;
        return (
          dateStr.includes(query) ||
          new Date(dateStr)?.toLocaleDateString('en-IN').toLowerCase().includes(query) ||
          new Date(dateStr)?.toLocaleDateString('en-IN', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
          }).toLowerCase().includes(query)
        );
      };

      return (
        (event.description || '').toLowerCase().includes(query) ||
        (event.type || '').toLowerCase().includes(query) ||
        (event.halfday_period || '').toLowerCase().includes(query) ||
        checkDateMatch(event.start_date) ||
        checkDateMatch(event.end_date) ||
        (event.start_time || '').toLowerCase().includes(query) ||
        (event.end_time || '').toLowerCase().includes(query)
      );
    });
  };

  // PERFECT FLOW: Filter → Sort → Paginate → Group
  const allEvents = hrLeave || [];
  const dateFilteredEvents = filterEventsByDate(allEvents);
  const searchFilteredEvents = filterEventsBySearch(dateFilteredEvents);
  const sortedEvents = searchFilteredEvents.slice().sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
  
  // Pagination
  const indexOfLastEvent = currentPage * itemsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - itemsPerPage;
  const currentEvents = sortedEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(sortedEvents.length / itemsPerPage);

  // Group current page events only
  const groupedEvents = currentEvents.reduce((acc, event) => {
    const month = new Date(event.start_date).toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    });

    if (!acc[month]) acc[month] = [];
    acc[month].push(event);
    return acc;
  }, {});

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.start_date || !formData.type || !formData.description) {
      showAlert({
        variant: "warning",
        title: "Warning",
        message: "Start Date, Type and Description required",
      });
      return;
    }

    const payload = {
      start_date: formData.start_date,
      end_date: formData.end_date || formData.start_date,
      type: formData.type,
      description: formData.description,
    };

    if (formData.type === "Half Holiday")
      payload.halfday_period = formData.halfday_period;

    if (formData.type === "Short Holiday") {
      payload.start_time = formData.start_time;
      payload.end_time = formData.end_time;
      payload.timezone = formData.timezone;
    }

    try {
      if (editingLeaveId) await updateLeave(editingLeaveId, payload);
      else await addLeave(payload);

      showAlert({
        variant: "success",
        title: "Success",
        message: editingLeaveId ? "Event updated" : "Event added",
      });

      resetForm();
      setIsModalOpen(false);
      fetchLeaves();
    } catch {
      showAlert({
        variant: "error",
        title: "Error",
        message: "Failed to save event",
      });
    }
  };

  const handleEdit = (leave) => {
    setEditingLeaveId(leave.id);
    setFormData({
      start_date: leave.start_date,
      end_date: leave.end_date,
      type: leave.type,
      description: leave.description,
      halfday_period: leave.halfday_period || "",
      start_time: leave.start_time || "",
      end_time: leave.end_time || "",
      timezone: leave.timezone || "Asia/Kolkata",
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setDeletingId(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingId) {
      try {
        await deleteLeave(deletingId);
        showAlert({
          variant: "success",
          title: "Success",
          message: "Event deleted successfully",
        });
        fetchLeaves();
      } catch {
        showAlert({
          variant: "error",
          title: "Error",
          message: "Failed to delete event",
        });
      }
    }
    setDeleteConfirmOpen(false);
    setDeletingId(null);
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setDeletingId(null);
  };

  const formatDay = (date) =>
    new Date(date).toLocaleDateString("en-IN", { day: "numeric" });

  const formatMonthShort = (date) =>
    new Date(date).toLocaleDateString("en-IN", { month: "short" });

  const getEventColor = (type) => {
    if (type === "Full Holiday") return "bg-blue-500";
    if (type === "Half Holiday") return "bg-amber-500";
    if (type === "Short Holiday") return "bg-emerald-500";
    return "bg-gray-500";
  };

  return (
    <div className="min-h-screen relative text-gray-900">
      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-slate-100" />

      <SectionHeader
        icon={BarChart}
        title="Event Management"
        subtitle="View and manage events"
      />

      {/* Filters Section - Date + Search (TIMELINE SPECIFIC) */}
      <div className="px-6 pb-6 pt-6">
        <div className="flex flex-col lg:flex-row gap-4 max-w-4xl">
          {/* Date Filter */}
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-2">
              Date Range
            </label>
            <DateRangePicker
              value={dateFilter}
              onChange={setDateFilter}
            />
          </div>

          {/* Search Filter - TIMELINE EVENTS ONLY */}
          <div className="flex-1 lg:w-80">
            <label className="block text-xs font-medium text-gray-500 mb-2">
              Search Events
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search events by date, type, description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-[35px] pl-10 pr-4 py-2 rounded-lg bg-white/90 border border-gray-300 text-sm text-gray-700 shadow-sm hover:bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>
          </div>
        </div>

        {/* Filter Status */}
        {(dateFilter.start || dateFilter.end || searchQuery) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {dateFilter.start && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
                {dateFilter.start} → {dateFilter.end || "Today"}
              </span>
            )}
            {/* {searchQuery && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-gray-100 text-gray-800">
                "{searchQuery}"
              </span>
            )} */}
            <button
              onClick={() => {
                setDateFilter({ start: "", end: "" });
                setSearchQuery("");
              }}
              className="ml-auto flex items-center justify-center rounded-lg py-1.5 px-2 text-sm text-white shadow-lg hover:scale-105 transition"
              style={{ backgroundColor: "#2762eb" }}
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Timeline Container */}
      <div className="px-6 pb-6">
        {currentEvents.length === 0 ? (
          <div className="text-center text-gray-500 py-20">
            {sortedEvents.length === 0 
              ? (dateFilter.start || dateFilter.end || searchQuery
                  ? "No events found matching your filters"
                  : "No events available")
              : `Page ${currentPage} of ${totalPages} - No events on this page`
            }
          </div>
        ) : (
          Object.entries(groupedEvents).map(([month, events]) => (
            <div key={month} className="mb-2">
              <h2 className="text-xl font-semibold mb-6 text-gray-800">
                {month} ({events.length})
              </h2>

              <div className="space-y-3 mb-2">
                {events.map((leave) => (
                  <div
                    key={leave.id}
                    className="flex gap-5 items-start bg-white rounded-xl p-4 shadow-sm border hover:shadow-md transition"
                  >
                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-slate-100">
                      <div className="text-lg font-bold">
                        {formatDay(leave.start_date)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatMonthShort(leave.start_date)}
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-2.5 h-2.5 rounded-full ${getEventColor(
                                leave.type
                              )}`}
                            />
                            <h3 className="font-semibold text-gray-900">
                              {leave.type}
                            </h3>
                          </div>

                          <p className="text-sm text-gray-600 mt-1">
                            {leave.description}
                          </p>

                          {leave.halfday_period && (
                            <p className="text-xs text-gray-500 mt-1">
                              {leave.halfday_period}
                            </p>
                          )}

                          {leave.start_time && (
                            <p className="text-xs text-gray-500 mt-1">
                              {leave.start_time} → {leave.end_time}
                            </p>
                          )}
                        </div>
{canAddEmployee&&(
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(leave)}
                            className="p-2 rounded-lg hover:bg-gray-100"
                          >
                            <Edit size={16} />
                          </button>

                          <button
                            onClick={() => handleDelete(leave.id)}
                            className="p-2 rounded-lg hover:bg-gray-100"
                          >
                            <X size={16} />
                          </button>
                        </div>
)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 pb-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
        
      )}

      {/* Floating Add Button */}
      {canAddEmployee&&(
      <button
        onClick={() => {
          resetForm();
          setIsModalOpen(true);
        }}
        className="fixed bottom-8 right-8 w-14 h-14 flex items-center justify-center rounded-full text-2xl text-white shadow-lg hover:scale-105 transition"
        style={{ backgroundColor: "#2762eb" }}
      >
        +
      </button>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative w-full max-w-md p-6 rounded-2xl bg-white">
            <div className="flex justify-between mb-5">
              <h3 className="text-lg font-semibold">
                {editingLeaveId ? "Edit Event" : "Add Event"}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X />
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border"
              >
                <option value="">Select Type</option>
                <option value="Full Holiday">Full Holiday</option>
                <option value="Half Holiday">Half Holiday</option>
                <option value="Short Holiday">Short Holiday</option>
              </select>

              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border"
              />

              {formData.type === "Half Holiday" && (
                <div className="flex gap-3">
                  {["morning", "afternoon"].map((p) => (
                    <button
                      type="button"
                      key={p}
                      onClick={() =>
                        setFormData({ ...formData, halfday_period: p })
                      }
                      className={`flex-1 p-2 rounded-lg border ${
                        formData.halfday_period === p
                          ? "bg-[#2762eb] text-white"
                          : ""
                      }`}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
              )}

              {formData.type === "Short Holiday" && (
                <>
                  <input
                    type="time"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg border"
                  />
                  <input
                    type="time"
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg border"
                  />
                </>
              )}

              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e =>
                  setFormData({ ...formData, description: e.target.value })
                )}
                className="w-full p-3 rounded-lg border"
              />

              <button
                type="submit"
                className="w-full py-3 rounded-lg text-white font-semibold"
                style={{ backgroundColor: "#2762eb" }}
              >
                {editingLeaveId ? "Update Event" : "Add Event"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={cancelDelete}
          />
          <div className="relative w-full max-w-sm p-6 rounded-2xl bg-white shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete Event?
                </h3>
                <p className="text-sm text-gray-600">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={cancelDelete}
                className="flex-1 py-2.5 px-4 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 px-4 rounded-lg text-white font-semibold hover:opacity-90 transition"
                style={{ backgroundColor: "#ef4444" }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

