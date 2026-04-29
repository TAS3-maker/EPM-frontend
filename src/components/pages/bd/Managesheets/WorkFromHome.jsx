import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { SectionHeader } from "../../../components/SectionHeader";
import { API_URL } from "../../../utils/ApiConfig";
import { Loader2, Calendar, User ,Pencil, InfoIcon, Info} from "lucide-react";
import { usePermissions } from "../../../context/PermissionContext";
import { useAlert } from "../../../context/AlertContext";
import {
  ExportButton,
  IconApproveButton,
  IconRejectButton,
  ClearButton,
  YesterdayButton,
  TodayButton,
  WeeklyButton,
  CustomButton,
  CancelButton,
  IconCancelTaskButton,
   IconEditButton,
} from "../../../AllButtons/AllButtons";

import { exportToExcel } from "../../../components/excelUtils";
import Pagination from "../../../components/Pagination";
import { Try } from "@mui/icons-material";

function WorkFromHome() {
  const token = localStorage.getItem("userToken");
const [searchQuery, setSearchQuery] = useState("");
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
const [editMode, setEditMode] = useState({});
  // pagination
    const { permissions } = usePermissions()
  const { showAlert } = useAlert(); 
  const [selectedReason, setSelectedReason] = useState("");
const [showReasonModal, setShowReasonModal] = useState(false);
  const [activeTab,setActiveTab]=useState("Pending")
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
  });
const [showWFHModal, setShowWFHModal] = useState(false);
const [wfhData, setWfhData] = useState({
  start_date: "",
  end_date: "",
  mode: "",
  reason: "",
  start_time: "",
  end_time: "",
  start_period: "",
  end_period: "",
  half_day: "",
});
  // filters
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateFilterActive, setDateFilterActive] = useState(false);
  const employeePermission = permissions?.permissions?.[0]?.aprovel_performa_request;
  const canAddEmployee = employeePermission === "2";
  const getYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split("T")[0];
  };

  // ---------------- FETCH ----------------
const fetchApplications = useCallback(
  async (page = 1, start = "", end = "", search = "",activeTab="Pending") => {
   

    try {
      const params = new URLSearchParams({
        page,
        per_page: 10,
      });

      if (dateFilterActive) {
        if (start) params.append("start_date", start);
        if (end) params.append("end_date", end);
      }

      if (search?.trim()) {
        params.append("search", search.trim());
        params.append("search_by", "user_name");
      }
      if(activeTab){
        params.append("status",activeTab)
      }

 const res = await axios.get(
  `${API_URL}/api/work-from-home-request?${params}`,
  {
    headers: { Authorization: `Bearer ${token}` },
  }
);

      setApplications(res.data?.data?.data || []);

setPaginationMeta({
  current_page: res.data?.data?.current_page || 1,
  last_page: res.data?.data?.last_page || 1,
  total: res.data?.data?.total || 0,
  per_page: res.data?.data?.per_page || 10,
});

    } catch (err) {
      console.log(err?.response);
      
     showAlert({
      variant: "error",
      title: "Error",
      message:err.response?.data?.message||"Error"
    });
    } finally {
      setLoading(false);
    }
  },
  [token, dateFilterActive]
);

useEffect(() => {
  const start = dateFilterActive ? startDate : "";
  const end = dateFilterActive ? endDate : "";

  fetchApplications(currentPage, start, end, searchQuery,activeTab);
}, [currentPage, startDate,activeTab, endDate, dateFilterActive,searchQuery]);
useEffect(() => {
  setCurrentPage(1);
}, [searchQuery]);
  // ---------------- ACTIONS ----------------
const handleApprove = async (id) => {
  try {
    await axios.post(
      `${API_URL}/api/work-from-home-request-approve/${id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    fetchApplications(currentPage, startDate, endDate, searchQuery, activeTab);
  } catch (error) {
    showAlert({
      variant: "error",
      title: "Error",
      message: error.response?.data?.message || "Error",
    });
  }
};

const handleReject = async (id) => {
  try {
    await axios.post(
      `${API_URL}/api/work-from-home-request-reject/${id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    fetchApplications(currentPage, startDate, endDate, searchQuery, activeTab);
  } catch (error) {
    showAlert({
      variant: "error",
      title: "Error",
      message: error.response?.data?.message || "Error",
    });
  }
};
const handleCreateWFH = async () => {
  try {
    // 🔹 BASIC VALIDATION
    if (!wfhData.start_date || !wfhData.mode || !wfhData.reason) {
      showAlert({
        variant: "warning",
        message: "Please fill all required fields",
      });
      return;
    }

    const payload = {
      start_date: wfhData.start_date,
      mode: wfhData.mode,
      reason: wfhData.reason,
    };

    // 🔹 MULTI DAY
    if (wfhData.mode === "MULTI DAY") {
      if (!wfhData.end_date) {
        showAlert({ variant: "warning", message: "End date required" });
        return;
      }

      if (wfhData.end_date < wfhData.start_date) {
        showAlert({
          variant: "error",
          message: "End date cannot be before start date",
        });
        return;
      }

      payload.end_date = wfhData.end_date;
    }

    // 🔹 FULL DAY (no extra fields needed)
    if (wfhData.mode === "FULL DAY") {
      // nothing extra
    }

    // 🔹 HALF DAY
    if (wfhData.mode === "HALF DAY") {
      if (!wfhData.half_day) {
        showAlert({
          variant: "warning",
          message: "Please select First Half or Second Half",
        });
        return;
      }

      // must be EXACT values expected by backend
      if (
        wfhData.half_day !== "FIRST_HALF" &&
        wfhData.half_day !== "SECOND_HALF"
      ) {
        showAlert({
          variant: "error",
          message: "Invalid half day selection",
        });
        return;
      }

      payload.half_day = wfhData.half_day;
    }

    // 🔹 HOURLY
    if (wfhData.mode === "HOURLY") {
      if (
        !wfhData.start_time ||
        !wfhData.start_period ||
        !wfhData.end_time ||
        !wfhData.end_period
      ) {
        showAlert({
          variant: "warning",
          message: "Please select complete time range",
        });
        return;
      }

      const duration = getDurationDisplay(
        wfhData.start_time,
        wfhData.start_period,
        wfhData.end_time,
        wfhData.end_period
      );

      if (duration === "Invalid time" || duration === "Invalid range") {
        showAlert({ variant: "error", message: duration });
        return;
      }

      payload.start_time = `${wfhData.start_time} ${wfhData.start_period}`;
      payload.end_time = `${wfhData.end_time} ${wfhData.end_period}`;
      payload.hours = duration;
    }

    // 🔹 API CALL
    await axios.post(
      `${API_URL}/api/work-from-home-request`,
      payload,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    // 🔹 SUCCESS
    showAlert({
      variant: "success",
      title: "Success",
      message: "WFH request submitted",
    });

    // 🔹 RESET FORM
    setShowWFHModal(false);
    setWfhData({
      start_date: "",
      end_date: "",
      mode: "",
      reason: "",
      start_time: "",
      end_time: "",
      start_period: "",
      end_period: "",
      half_day: "",
    });

    fetchApplications(currentPage, startDate, endDate, searchQuery, activeTab);

  } catch (err) {
    showAlert({
      variant: "error",
      title: "Error",
      message: err.response?.data?.message || "Something went wrong",
    });
  }
};

// ✅ TIME OPTIONS
const generateTimeOptions = () => {
  const times = [];
  for (let hour = 1; hour <= 12; hour++) {   // fixed (no 00)
    for (let minute of ['00', '15', '30', '45']) {
      const hourStr = hour.toString().padStart(2, '0');
      times.push(`${hourStr}:${minute}`);
    }
  }
  return times;
};

// ✅ CONVERT TIME
const convert12hrTo24hr = (time12, period) => {
  const [hour, minute] = time12.split(':').map(Number);
  if (isNaN(hour) || isNaN(minute)) return null;

  let hour24 = hour;
  if (period === 'PM' && hour !== 12) hour24 += 12;
  if (period === 'AM' && hour === 12) hour24 = 0;

  return `${hour24.toString().padStart(2, '0')}:${minute
    .toString()
    .padStart(2, '0')}`;
};

// ✅ DURATION
const getDurationDisplay = (startTime, startPeriod, endTime, endPeriod) => {
  const start24 = convert12hrTo24hr(startTime, startPeriod);
  const end24 = convert12hrTo24hr(endTime, endPeriod);

  if (!start24 || !end24) return 'Invalid time';

  const start = new Date(`2000-01-01T${start24}`);
  const end = new Date(`2000-01-01T${end24}`);

  if (end <= start) return 'Invalid range';

  const diffMs = end - start;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`;
};

  // ---------------- DATE FILTERS ----------------
  const handleToday = () => {
    const today = new Date().toISOString().split("T")[0];
    setStartDate(today);
    setEndDate(today);
    setDateFilterActive(true);
    setCurrentPage(1);
  };

  const handleYesterday = () => {
    const y = getYesterday();
    setStartDate(y);
    setEndDate(y);
    setDateFilterActive(true);
    setCurrentPage(1);
  };

  const handleWeekly = () => {
    const today = new Date();
    const end = today.toISOString().split("T")[0];

    const startDateObj = new Date();
    startDateObj.setDate(today.getDate() - 6);

    const start = startDateObj.toISOString().split("T")[0];

    setStartDate(start);
    setEndDate(end);
    setDateFilterActive(true);
    setCurrentPage(1);
  };

  const handleCustomDateChange = (s, e) => {
    setStartDate(s);
    setEndDate(e);
    setDateFilterActive(true);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setStartDate("");
    setEndDate("");
    setDateFilterActive(false);
    setCurrentPage(1);
  };

  // ---------------- EXPORT ----------------
  const handleExport = () => {
    exportToExcel(applications, "Performa_Applications");
  };
const hasApproved = applications.some(
  (item) => item.status?.toLowerCase() === "approved"
);
const hasRejected = applications.some(
  (item) => item.status?.toLowerCase() === "rejected"
);
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  
  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex items-center space-x-3 bg-white rounded-xl shadow-sm py-6 px-8">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-700 font-medium">
            Loading applications...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* HEADER */}
      <SectionHeader
        icon={Calendar}
        title="Work From Home"
        subtitle={`Total ${paginationMeta.total} records`}
      />

      {/* FILTER BAR (UI MATCHED) */}
     <div className="flex flex-wrap items-center justify-between gap-2 bg-white px-4 py-2 shadow-md rounded-md">

  {/* LEFT SIDE: SEARCH + FILTER */}
  <div className="flex flex-wrap items-center gap-2">
<button
  onClick={() => setShowWFHModal(true)}
  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
>
  + Request WFH
</button>
    {/* SEARCH */}
    <div className="border border-gray-300 px-2 rounded-lg w-full sm:w-[260px] bg-white">
      <input
        type="text"
        placeholder="Search by user name..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-2 py-1 text-sm focus:outline-none"
      />
    </div>

    {/* FILTER BUTTONS */}
    <div className="flex flex-wrap items-center gap-2">
      <label className="text-[12px] font-medium text-gray-700">
        Filter by:
      </label>

      <button
        onClick={() => {
          setActiveTab("Pending");
          setStartDate("");
          setEndDate("");
          setCurrentPage(1);
        }}
        className={`px-4 py-1.5 rounded-md ${
          activeTab === "Pending"
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-700"
        }`}
      >
        Pending
      </button>

      <button
        onClick={() => {
          setActiveTab("approved");
          setStartDate("");
          setEndDate("");
          setCurrentPage(1);
        }}
        className={`px-4 py-1.5 rounded-md ${
          activeTab === "approved"
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-700"
        }`}
      >
        Approved
      </button>
      <button
        onClick={() => {
          setActiveTab("rejected");
          setStartDate("");
          setEndDate("");
          setCurrentPage(1);
        }}
        className={`px-4 py-1.5 rounded-md ${
          activeTab === "rejected"
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-700"
        }`}
      >
        Rejected
      </button>
    </div>
  </div>

  {/* RIGHT SIDE: DATE + ACTIONS */}
  <div className="flex flex-wrap items-center gap-2 ml-auto">

    {!isCustomMode ? (
      <>
        <TodayButton onClick={handleToday} />
        <YesterdayButton onClick={handleYesterday} />
        <WeeklyButton onClick={handleWeekly} />
        <CustomButton onClick={() => setIsCustomMode(true)} />
      </>
    ) : (
      <>
        <input
          type="date"
          className="border border-gray-300 rounded-lg px-3 py-1"
          value={startDate}
          onChange={(e) =>
            handleCustomDateChange(e.target.value, endDate)
          }
        />

        <input
          type="date"
          className="border border-gray-300 rounded-lg px-3 py-1"
          value={endDate}
          onChange={(e) =>
            handleCustomDateChange(startDate, e.target.value)
          }
        />

        <ClearButton onClick={handleClearFilters} />
        <CancelButton
          onClick={() => {
            setIsCustomMode(false);
            handleClearFilters();
          }}
        />
      </>
    )}

    <ExportButton onClick={handleExport} />

    <div className="bg-gray-100 border border-gray-300 px-3 py-1.5 rounded shadow text-sm">
      <span className="font-semibold text-gray-700">Total: </span>
      <span className="font-bold text-blue-600">
        {paginationMeta.total}
      </span>
    </div>
  </div>

</div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mt-4">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold">
                  Applied Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold">
                  Employee
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold">
                  Reason
                </th>
                {(hasApproved || hasRejected) && (
  <>
    <th className="px-6 py-4 text-left text-xs font-semibold">
      {hasApproved ? "Approved By" : "Rejected By"}
    </th>
    <th className="px-6 py-4 text-left text-xs font-semibold">
    {hasApproved ? "Approval Date" : "Rejected Date"}
    </th>
  </>
)}

             
                <th className="px-6 py-4 text-left text-xs font-semibold">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {applications.length === 0 ? (
                <tr>
                  <td className="p-6 text-center text-gray-500" colSpan={6}>
                    No applications found
                  </td>
                </tr>
              ) : (
                applications.map((item) => (
                  <tr key={item.id} className="border-t hover:bg-gray-50">
                    <td className="px-6 py-4 text-[12px]">
                      {item.apply_date}
                    </td>

                    <td className="px-6 py-4 flex items-center gap-2 text-[12px]">
                      <User className="w-4 h-4 text-blue-500" />
                      {item.user?.name || "-"}
                    </td>

                    <td className="px-6 py-4 text-[12px]">
                      <span className="px-2 py-1 rounded-full text-xs ">
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1).toLowerCase()
                        
                        }
                      </span>
                    </td>
                 <td className="px-6 py-4 text-[12px]">
  <div className="flex items-center ">
    
    {/* short preview */}
    <span className=" py-1 rounded-full text-xs">
      {item.reason?.length > 25
        ? item.reason.slice(0, 25) + "..."
        : item.reason || "-"}
    </span>

    {/* info button */}
    {item.reason?.length > 25 && (
      <button
        onClick={() => {
          setSelectedReason(item.reason);
          setShowReasonModal(true);
        }}
        className="text-blue-500 hover:text-blue-700"
      >
       <Info className="w-5 h-4 " />
      </button>
    )}
  </div>
</td>


    {["approved", "rejected"].includes(item.status) && (
  <>
    <td className="px-6 py-4 text-[12px]">
      {item.approved_rejected_by?.name || "-"}
    </td>

    <td className="px-6 py-4 text-[12px]">
      {item.approval_date
        ? new Date(item.approval_date).toLocaleDateString()
        : "-"}
    </td>
  </>
)}

                    <td className="px-6 py-4">
                      {canAddEmployee?
                        <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                         {item.status === 'rejected' ? (
                           // 🔒 Rejected: LOCKED only
                           <div className="text-gray-400 text-xs font-medium">LOCKED</div>
                         ) : item.status === 'approved' && !item.isEditing ? (
                           <IconEditButton
                             size="sm"
                             onClick={() => {
                               // ONLY toggle isEditing - NO status change!
                               setApplications(prev => prev.map(sheet => 
                                 sheet.id === item.id 
                                   ? { ...sheet, isEditing: true }
                                   : sheet
                               ));
                             }}
                             title="Edit actions"
                           />
                         ) : item.status === 'approved' && item.isEditing ? (
                           // ✏️ Edit mode: Reject + Cancel (status still "approved")
                           <>
                             <IconRejectButton
                               size="sm"
                               onClick={() => {
                                 handleReject(item.id);  // API call → status changes via refresh
                               }}
                               title="Reject this sheet"
                             />
                             <IconCancelTaskButton
                               className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-all"
                               onClick={() => {
                                 // Cancel: remove isEditing only - status stays "approved"
                                 setApplications(prev => prev.map(sheet => 
                                   sheet.id === item.id 
                                     ? { ...sheet, isEditing: false }
                                     : sheet
                                 ));
                               }}
                               title="Cancel"
                             >
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                               </svg>
                             </IconCancelTaskButton>
                           </>
                         ) : (
                           // ⏳ Pending: Approve + Reject
                           <>
                             <IconApproveButton
                               size="sm"
                               onClick={() => handleApprove(item.id)}
                               title="Approve this sheet"
                             />
                             <IconRejectButton
                               size="sm"
                               onClick={() => handleReject(item.id)}
                               title="Reject this sheet"
                             />
                           </>
                         )}
                       </div>

                       :
                       <div className="text-xs text-gray-500 font-semibold">No Permission</div>
                    }
                   
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
      {showReasonModal && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
    onClick={() => setShowReasonModal(false)}
  >
    <div
      className="bg-white rounded-lg w-full max-w-lg p-6 relative shadow-xl"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Close */}
      <button
        onClick={() => setShowReasonModal(false)}
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
      >
        ✕
      </button>

      <h2 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">
        Reason Details
      </h2>

      <p className="text-[12px] text-gray-700 whitespace-pre-wrap break-words max-h-60 overflow-y-auto">
        {selectedReason || "N/A"}
      </p>
    </div>
  </div>
)}
        </div>
      </div>

      {/* PAGINATION */}
      {paginationMeta.last_page > 1 && (
        <Pagination
          currentPage={paginationMeta.current_page}
          totalPages={paginationMeta.last_page}
          onPageChange={handlePageChange}
        />
      )}
     {showWFHModal && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
    onClick={() => setShowWFHModal(false)}
  >
    <div
      className="bg-white rounded-lg w-full max-w-lg p-6 relative shadow-xl"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Close */}
      <button
        onClick={() => setShowWFHModal(false)}
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
      >
        ✕
      </button>

      <h2 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">
        Work From Home Request
      </h2>

      {/* Start Date */}
      <input
        type="date"
        value={wfhData.start_date}
        onChange={(e) =>
          setWfhData({ ...wfhData, start_date: e.target.value })
        }
        className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3"
      />

      {/* End Date (ONLY MULTI DAY) */}
      {wfhData.mode === "MULTI DAY" && (
        <input
          type="date"
          value={wfhData.end_date}
          onChange={(e) =>
            setWfhData({ ...wfhData, end_date: e.target.value })
          }
          className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3"
        />
      )}

      {/* Mode */}
      <select
        value={wfhData.mode}
        onChange={(e) =>
          setWfhData({ ...wfhData, mode: e.target.value })
        }
        className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3"
      >
        <option value="">Select Mode</option>
        <option value="FULL DAY">Full Day</option>
        <option value="MULTI DAY">Multiple Days</option>
        <option value="HALF DAY">Half Day</option>
        <option value="HOURLY">Hourly</option>
      </select>

      {/* HALF DAY SELECTION */}
      {wfhData.mode === "HALF DAY" && (
        <div className="mb-3">
          <label className="text-sm font-medium text-gray-700">
            Select Half
          </label>

          <div className="flex gap-4 mt-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="FIRST_HALF"
                checked={wfhData.half_day === "FIRST_HALF"}
                onChange={(e) =>
                  setWfhData({ ...wfhData, half_day: e.target.value })
                }
              />
              First Half
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="SECOND_HALF"
                checked={wfhData.half_day === "SECOND_HALF"}
                onChange={(e) =>
                  setWfhData({ ...wfhData, half_day: e.target.value })
                }
              />
              Second Half
            </label>
          </div>
        </div>
      )}

      {/* HOURLY TIME RANGE */}
      {wfhData.mode === "HOURLY" && (
        <div className="space-y-3 mb-4">
          <label className="text-sm font-medium text-gray-700">
            Select Time Range
          </label>

          {/* FROM */}
          <div className="flex gap-2">
            <select
              value={wfhData.start_time || ""}
              onChange={(e) =>
                setWfhData({ ...wfhData, start_time: e.target.value })
              }
              className="w-1/2 border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">HH:MM</option>
              {generateTimeOptions().map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <select
              value={wfhData.start_period || ""}
              onChange={(e) =>
                setWfhData({ ...wfhData, start_period: e.target.value })
              }
              className="w-1/2 border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">AM/PM</option>
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>

          {/* TO */}
          <div className="flex gap-2">
            <select
              value={wfhData.end_time || ""}
              onChange={(e) =>
                setWfhData({ ...wfhData, end_time: e.target.value })
              }
              className="w-1/2 border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">HH:MM</option>
              {generateTimeOptions().map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <select
              value={wfhData.end_period || ""}
              onChange={(e) =>
                setWfhData({ ...wfhData, end_period: e.target.value })
              }
              className="w-1/2 border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">AM/PM</option>
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>

          {/* DURATION */}
          {wfhData.start_time &&
            wfhData.start_period &&
            wfhData.end_time &&
            wfhData.end_period && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-sm">
                ⏱️{" "}
                {getDurationDisplay(
                  wfhData.start_time,
                  wfhData.start_period,
                  wfhData.end_time,
                  wfhData.end_period
                )}
              </div>
            )}
        </div>
      )}

      {/* Reason */}
      <textarea
        placeholder="Enter reason..."
        value={wfhData.reason}
        onChange={(e) =>
          setWfhData({ ...wfhData, reason: e.target.value })
        }
        className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4"
      />

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <button
          onClick={() => setShowWFHModal(false)}
          className="px-4 py-2 bg-gray-200 rounded-md"
        >
          Cancel
        </button>

        <button
          onClick={handleCreateWFH}
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Submit
        </button>
      </div>
    </div>
  </div>
)}
    </div>
    
  );
}

export default WorkFromHome;