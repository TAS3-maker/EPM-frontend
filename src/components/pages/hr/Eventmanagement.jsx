import React, { useEffect, useState } from "react";
import { useEvent } from "../../context/EventContext";
import { useAlert } from "../../context/AlertContext";
import { BarChart, X, Edit, Calendar, Search } from "lucide-react";
import { SectionHeader } from "../../components/SectionHeader";
import DateRangePicker from "../../components/DateRangePicker";
import Pagination from "../../components/Pagination";
import { usePermissions } from "../../context/PermissionContext.jsx";
import { Calendar as CalendarIcon } from "lucide-react"; // Add to imports
import { API_URL } from "../../../components/utils/ApiConfig";
import { useRole } from "../../context/RoleContext";

export const Eventmanagement = () => {
  const { hrLeave, fetchLeaves, addLeave, deleteLeave, updateLeave } = useEvent();
  const { showAlert } = useAlert();
  const {permissions}=usePermissions()
  const [editingLeaveId, setEditingLeaveId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
const [showCalendarModal, setShowCalendarModal] = useState(false);
const [calendarData, setCalendarData] = useState([]);
const [calendarMonth, setCalendarMonth] = useState({year:new Date().getFullYear(),month:new Date().getMonth()+1 });
const [showStatusModal, setShowStatusModal] = useState(false);
const [selectedDay, setSelectedDay] = useState(null);
const [dayStatus, setDayStatus] = useState('working'); // 'working' | 'non-working'
const [dayReason, setDayReason] = useState('');

  // Filters state
  const [dateFilter, setDateFilter] = useState({ start: "", end: "" });
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const { activeRole } = useRole();

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
const fetchCalendarMonth = async (year, month) => {
  try {
    const token = localStorage.getItem("userToken");
    const res = await fetch(`${API_URL}/api/calendar/month?year=${year}&month=${month}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    const currentYear=data.year
    const currentMonth=data.month

    // ✅ NEW: Extract days array from API response
    setCalendarData(data.days || []);
    
  } catch (err) {
    console.error("Calendar fetch error:", err);
  }
};


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

const date=new Date()
const month=date.getMonth()
const year=date.getFullYear()

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
// ✅ Calendar Helpers - EXACT COPY
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const YEARS = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - 5 + i);
const today = new Date();
const currentMonth = today.getMonth();
const currentYear = today.getFullYear();
  // ✅ Add this BEFORE return statement (line ~500)
const getCalendarDate = (monthObj) => {
  return new Date(monthObj.year, monthObj.month - 1, 1);
};
const formatLocalDate = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const generateCalendarDays = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push({ empty: true, key: `e-${i}` });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dt = new Date(year, month, d);
    days.push({
      day: d,
      date: formatLocalDate(dt),
      weekday: dt.getDay(),
    });
  }


  return days;
};
const handleCalendarMonthChange = (month, year) => {
  setCalendarMonth({ year, month });  // ✅ Object format (NOT Date)
  fetchCalendarMonth(year, month);
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
<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-100 justify-between lg:justify-between">
  
  {/* 1️⃣ DATE RANGE - SAME AS BEFORE */}
  <div className="flex-1">
    <label className="block text-xs font-medium text-gray-500 mb-2">
      Date Range
    </label>
    <DateRangePicker
      value={dateFilter}
      onChange={setDateFilter}
    />
  </div>

  {/* 2️⃣ SEARCH EVENTS - SAME STYLE */}
  <div className="flex-1 ">
    <label className="block text-xs font-medium text-gray-500 mb-2">
      Search Events
    </label>
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <input
        type="text"
        placeholder="Search events by date, type..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full pl-10 pr-4 h-[35px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
      />
    </div>
  </div>

  <div className="flex-1 ">
    <label className="block text-xs font-medium text-gray-500 mb-2">
      Working Days 
    </label>
    <button
      onClick={() => {
        setShowCalendarModal(true);
        fetchCalendarMonth(calendarMonth.year, calendarMonth.month);
      }}
      className="w-full flex items-center justify-center gap-2 h-11 px-4 h-[35px] border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm text-sm font-medium text-gray-700 transition-all"
    >
      <CalendarIcon className="h-4 w-4 text-blue-600" />
      Manage Calendar
    </button>
  </div>

</div>


  {/* Filter Status - SAME */}
  {(dateFilter.start || dateFilter.end || searchQuery) && (
    <div className="mt-4 flex flex-wrap gap-2">
      {dateFilter.start && (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
          {dateFilter.start} → {dateFilter.end || "Today"}
        </span>
      )}
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

                           {(activeRole === "superadmin" || activeRole === "hr") && (
                          <button
                            onClick={() => handleDelete(leave.id)}
                            className="p-2 rounded-lg hover:bg-gray-100"
                          >
                            <X size={16} />
                          </button>
                           )}
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

{/* ✅ SATURDAY STATUS MODAL */}
{showStatusModal&&canAddEmployee && selectedDay && (
  <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50" onClick={() => setShowStatusModal(false)}>
    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900">
          {new Date(selectedDay).toLocaleDateString('en-IN', { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
          })}
        </h3>
        <button onClick={() => setShowStatusModal(false)} className="text-gray-500 hover:text-black">
          ✕
        </button>
      </div>

      {/* Status Toggle */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">Status</label>
        <div className="flex gap-3">
          <button
            onClick={() => setDayStatus('working')}
            className={`flex-1 p-3 rounded-xl font-semibold transition-all shadow-sm ${
              dayStatus === 'working'
                ? 'bg-green-500 text-white shadow-lg scale-105'
                : 'bg-green-50 text-green-700 hover:bg-green-100 border-2 border-green-200'
            }`}
          >
            🟢 Working
          </button>
          <button
            onClick={() => setDayStatus('non-working')}
            className={`flex-1 p-3 rounded-xl font-semibold transition-all shadow-sm ${
              dayStatus === 'non-working'
                ? 'bg-red-500 text-white shadow-lg scale-105'
                : 'bg-red-50 text-red-700 hover:bg-red-100 border-2 border-red-200'
            }`}
          >
            🔴 Non-Working
          </button>
        </div>
      </div>

      {/* Reason Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Reason (Optional)</label>
        <textarea
          value={dayReason}
          onChange={(e) => setDayReason(e.target.value)}
          placeholder="Enter reason for non-working day..."
          className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={3}
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={() => setShowStatusModal(false)}
          className="flex-1 py-3 px-4 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition"
        >
          Cancel
        </button>
        <button
          onClick={async () => {
            const token = localStorage.getItem("userToken");
            await fetch(`${API_URL}/api/calender/set-date`, {
              method: "POST",
              headers: { 
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                date: selectedDay,
                is_working: dayStatus === 'working',
                reason: dayReason
              })
            });
            
            // Refresh calendar data
            fetchCalendarMonth(calendarMonth.year, calendarMonth.month);
            setShowStatusModal(false);
          }}
          className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-lg transition"
        >
          Save Changes
        </button>
      </div>
    </div>
  </div>
)}







{showCalendarModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowCalendarModal(false)}>
    <div className="relative w-full max-w-3xl rounded-3xl bg-white/70 backdrop-blur-xl border shadow-xl p-6" onClick={(e) => e.stopPropagation()}>
      
      {/* Close */}
      <button onClick={() => setShowCalendarModal(false)} className="absolute top-4 right-4 text-gray-600 hover:text-black">
        ✕
      </button>

      <h2 className="text-xl font-bold text-center mb-4">Working Days Calendar</h2>

      {/* Month / Year - EXACT SAME */}
      <div className="flex justify-center gap-3 mb-5">
      <select
  value={calendarMonth.month - 1}  // ✅ FIXED: 3→2 (March)
  onChange={(e) => handleCalendarMonthChange(Number(e.target.value) + 1, calendarMonth.year)}
          className="px-4 py-2 rounded-xl border"
        >
          {MONTHS.map((m, idx) => (
            <option key={m} value={idx}>{m}</option>
          ))}
        </select>

        <select
          value={calendarMonth.year}
onChange={(e) => handleCalendarMonthChange(calendarMonth.month, Number(e.target.value))}          className="px-4 py-2 rounded-xl border"
        >
          {YEARS.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Weekdays - EXACT SAME */}
      <div className="grid grid-cols-7 gap-2 text-center mb-2">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
          <div key={d} className="text-xs font-semibold text-gray-500">{d}</div>
        ))}
      </div>

      {/* Calendar - EXACT SAME LOGIC + SATURDAY CLICK */}
      <div className="grid grid-cols-7 gap-2 mb-6">
   {generateCalendarDays(getCalendarDate(calendarMonth)).map((day)=> {
  if (day.empty) return <div key={day.key} />;
const dayData = calendarData.find(d => d.date === day.date);
const isNonWorking = dayData?.is_non_working;

let bg = "bg-gray-200 text-gray-700";

if (isNonWorking) {
  bg = "bg-red-500 text-white";        // 🔴 ANY Non-Working day
} else {
  bg = "bg-green-500 text-white";      // 🟢 ANY Working day
}


  return (
    <div
      key={day.date}
      className={`relative group h-12 rounded-xl flex flex-col items-center justify-center text-xs font-medium shadow-sm cursor-pointer hover:scale-105 transition-all ${bg}`}
 onClick={() => {
  // ✅ ANY DAY clickable
  setSelectedDay(day.date);
  const dayData = calendarData.find(d => d.date === day.date);
  setDayStatus(dayData?.is_non_working ? 'non-working' : 'working');
  setDayReason(dayData?.reason || '');
  setShowStatusModal(true);
}}



    >
      <span>{day.day}</span>
      
      {/* Hover Tooltip */}
 {true && (
  <div className="absolute bottom-14 left-1/2 -translate-x-1/2 hidden group-hover:block w-52 rounded-lg bg-black text-white text-[10px] px-2 py-1.5 shadow-lg z-50 whitespace-pre-wrap">
    <p><b>Date:</b> {day.date}</p>
    <p><b>Status:</b> {dayData?.is_non_working ? 'OFF' : 'Working'}</p>  {/* ✅ FIXED */}
    {dayData?.reason && <p><b>Reason:</b> {dayData.reason}</p>}
  </div>
)}

    </div>
  );
})}

      </div>

      {/* Selected Count + Submit */}
     {/* ✅ Clean Footer */}
     {canAddEmployee&&(
<div className="flex justify-center pt-6 border-t">
  <p className="text-sm text-gray-500">
💡 Click any day to change Working/Non-Working status  </p>
</div>
     )}

    </div>
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

