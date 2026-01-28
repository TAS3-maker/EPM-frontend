import React, { useEffect, useState } from "react";
import { useBDProjectsAssigned } from "../../../context/BDProjectsassigned";
import { Loader2, Calendar, User, Briefcase, Clock, FileText, Target, BarChart, Search, Info, ChevronDown } from "lucide-react";
import { exportToExcel } from "../../../components/excelUtils";
import { SectionHeader } from '../../../components/SectionHeader';
import { ClearButton, IconApproveButton, IconRejectButton, YesterdayButton, TodayButton, WeeklyButton, CustomButton, CancelButton, ExportButton } from "../../../AllButtons/AllButtons";
import Pagination from "../../../components/Pagination";
import { usePermissions } from "../../../context/PermissionContext";
import { Fragment } from "react";
import GlobalTable02 from "../../../components/GlobalTable02";
import DateRangePicker from "../../../components/DateRangePicker";

export const Pendingsheets = () => {
  const { pendingPerformanceData, fetchPendingPerformanceDetails, isLoading, approvePerformanceSheet, rejectPerformanceSheet } = useBDProjectsAssigned();
  const { permissions } = usePermissions()
  const [filteredData, setFilteredData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedInnerRows, setSelectedInnerRows] = useState([]);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDayDetails, setSelectedDayDetails] = useState(null);
  const [dayDetailModalOpen, setDayDetailModalOpen] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false); 
  const [activeTab, setActiveTab] = useState("team"); 
const [sheetStatus, setSheetStatus] = useState("pending"); 

  const itemsPerPage = 10;
const [expandedRow, setExpandedRow] = useState(null);
const [dateRange, setDateRange] = useState({
  start: "",
  end: "",
});

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const employeePermission = permissions?.permissions?.[0]?.pending_sheets_inside_performance_sheets;
  const canAddEmployee = employeePermission === "2";

  const openModal = (text) => {
    setModalText(text);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalText("");
  };

  const openDayDetails = (dayData) => {
    setSelectedDayDetails(dayData);
    setDayDetailModalOpen(true);
  };

  const closeDayDetails = () => {
    setDayDetailModalOpen(false);
    setSelectedDayDetails(null);
    setSelectedRows([]);
  };
  useEffect(() => {
  setStartDate(dateRange.start);
  setEndDate(dateRange.end);
}, [dateRange]);


  useEffect(() => {
    fetchPendingPerformanceDetails();
  }, []);
useEffect(() => {
    const today = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 6);
    
    const formattedStart = oneWeekAgo.toISOString().split('T')[0];
    const formattedEnd = today.toISOString().split('T')[0];
    
    setStartDate(formattedStart);
    setEndDate(formattedEnd);
}, []);


  const getMinutes = (time) => {
    if (!time || typeof time !== "string" || !time.includes(":")) return 0;
    const [h, m] = time.split(":").map((n) => parseInt(n, 10) || 0);
    return h * 60 + m;
  };

  const formatTime = (minutes) => {
    if (!minutes || isNaN(minutes)) return "00:00";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  const groupDataByDay = (dataToUse) => {
    const grouped = {};
    
    dataToUse.forEach((user) => {
      user?.sheets?.forEach((sheet) => {
        if (!sheet?.date) return;
        const dateKey = sheet.date.split("T")[0];
        const employeeKey = user.user_name;
        const fullKey = `${dateKey}_${employeeKey}`;
        
        if (!grouped[fullKey]) {
          grouped[fullKey] = {
            date: dateKey,
            user_name: employeeKey,
            total_hours: 0,
            sheets: [],
            client_names: new Set(),
            work_types: new Set()
          };
        }
        
        grouped[fullKey].sheets.push(sheet);
        grouped[fullKey].total_hours += getMinutes(sheet.time);
        grouped[fullKey].client_names.add(sheet.client_name);
        grouped[fullKey].work_types.add(sheet.work_type);
      });
    });
    
    return Object.values(grouped);
  };

useEffect(() => {
  const dataReady =
    Array.isArray(pendingPerformanceData) &&
    pendingPerformanceData.length > 0;

  if (!dataReady) {
    setFilteredData([]);
    return;
  }

  const trimmedSearchQuery = searchQuery?.trim().toLowerCase();

  let filteredUsers = pendingPerformanceData.map(user => {
    let sheets = user.sheets || [];

    /* =========================
       1️⃣ STATUS FILTER
       ========================= */
    sheets = sheets.filter(sheet => {
      if (sheetStatus === "pending") {
        return sheet.status === "pending" && !sheet.is_backdated;
      }

      if (sheetStatus === "backdated") {
        return sheet.is_backdated === true;
      }

      return true;
    });

    /* =========================
       2️⃣ TAB FILTER
       ========================= */
    if (activeTab === "projects") {
      sheets = sheets.filter(sheet => sheet.project_id);
    }

    if (activeTab === "managers") {
      sheets = sheets.filter(sheet => sheet.reporting_manager_id);
    }
    // activeTab === "team" → no extra filter

    /* =========================
       3️⃣ DATE FILTER
       ========================= */
    if (startDate && endDate) {
      sheets = sheets.filter(sheet => {
        const sheetDate = sheet.date?.split("T")[0];
        return sheetDate >= startDate && sheetDate <= endDate;
      });
    }

    /* =========================
       4️⃣ SEARCH FILTER
       ========================= */
    if (trimmedSearchQuery) {
      sheets = sheets.filter(sheet =>
        sheet.project_name?.toLowerCase().includes(trimmedSearchQuery) ||
        sheet.client_name?.toLowerCase().includes(trimmedSearchQuery) ||
        sheet.work_type?.toLowerCase().includes(trimmedSearchQuery) ||
        user.user_name?.toLowerCase().includes(trimmedSearchQuery) ||
        sheet.date?.includes(trimmedSearchQuery)
      );
    }

    return { ...user, sheets };
  });

  filteredUsers = filteredUsers.filter(
    user => user.sheets && user.sheets.length > 0
  );

  const groupedData = groupDataByDay(filteredUsers);
  setFilteredData(groupedData);

}, [
  pendingPerformanceData,
  searchQuery,
  startDate,
  endDate,
  activeTab,       // ✅ IMPORTANT
  sheetStatus      // ✅ IMPORTANT
]);


  const getPendingTime = () => {
    const minutes = filteredData.reduce((total, day) => total + day.total_hours, 0);
    return formatTime(minutes);
  };

  const handleSelectAllDays = () => {
    const currentPageDays = paginatedData();
    const allDayKeys = currentPageDays.map(day => `${day.date}_${day.user_name}`);
    
    if (selectedRows.length === allDayKeys.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(allDayKeys);
    }
  };

  const handleDaySelect = (dayKey) => {
    setSelectedRows(prev => 
      prev.includes(dayKey)
        ? prev.filter(key => key !== dayKey)
        : [...prev, dayKey]
    );
  };

  // ✅ Bulk action for selected days
  const handleBulkStatusChange = async (status) => {
    if (selectedRows.length === 0) return;
    
    try {
      const promises = [];
      
      filteredData.forEach(day => {
        const dayKey = `${day.date}_${day.user_name}`;
        if (selectedRows.includes(dayKey)) {
          day.sheets.forEach(sheet => {
            if (status === "approved") {
              promises.push(approvePerformanceSheet(sheet.id));
            } else {
              promises.push(rejectPerformanceSheet(sheet.id));
            }
          });
        }
      });
      
      await Promise.all(promises);
      fetchPendingPerformanceDetails();
      setSelectedRows([]);
      setShowBulkActions(false);
    } catch (error) {
      console.error("Bulk update error:", error);
    }
  };

  const handleStatusChange = async (sheet, newStatus) => {
    try {
      if (newStatus === "approved") {
        await approvePerformanceSheet(sheet.id);
      } else if (newStatus === "rejected") {
        await rejectPerformanceSheet(sheet.id);
      }
      
      fetchPendingPerformanceDetails();
    } catch (error) {
      console.error("Error Updating Sheet Status:", error);
    }
  };

const handleSelectAllDay = () => {
  if (!selectedDayDetails) return;
  const allSheetIds = selectedDayDetails.sheets.map(sheet => sheet.id);

  if (selectedInnerRows.length === allSheetIds.length) {
    setSelectedInnerRows([]);
  } else {
    setSelectedInnerRows(allSheetIds);
  }
};


  const handleDayRowSelect = (sheetId) => {
  setSelectedInnerRows((prev) =>
    prev.includes(sheetId)
      ? prev.filter((id) => id !== sheetId)
      : [...prev, sheetId]
  );
};


  const paginatedData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const isCurrentPageFullySelected = paginatedData().length > 0 && 
    paginatedData().every(day => selectedRows.includes(`${day.date}_${day.user_name}`));

const ApproveButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="
      flex items-center gap-2
      px-4 py-2
      rounded-xl
      bg-green-600 hover:bg-green-700
      text-white text-sm font-semibold
      shadow-lg shadow-green-600/30
      transition-all
    "
  >
    ✓ Approve
  </button>
);

const RejectButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="
      flex items-center gap-2
      px-4 py-2
      rounded-xl
      bg-red-600 hover:bg-red-700
      text-white text-sm font-semibold
      shadow-lg shadow-red-600/30
      transition-all
    "
  >
    ✕ Reject
  </button>
);

    const toggleRow = (id) => {
  setExpandedRow(prev => (prev === id ? null : id));
};


const mainTableColumns = [
  { label: "Date", key: "date" },
  { label: "Employee", key: "user_name" },
  { label: "Work Types", key: "work_types" },
  { label: "Clients", key: "client_names" },
  { label: "Total Hours", key: "total_hours" }
];


const modalTableColumns = [
  { label: "Project", key: "project_name" },
  { label: "Work Type", key: "work_type" },
  { label: "Activity", key: "activity_type" },
  { label: "Time", key: "time" },
  { label: "Submitted on", key: "created_at" },
  { label: "Status", key: "status" }
];


  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-md max-h-screen overflow-y-auto">
      <SectionHeader icon={BarChart} title="Pending Performance Sheets" subtitle="Review and approve pending sheets" />
      
<div className="sticky top-0 z-20 backdrop-blur-xl bg-white/70 border-b border-white/20 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">

  {/* 🔹 ROW 1 */}
  <div className="flex flex-wrap items-center justify-between gap-4 p-4">

    {/* Search */}
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl w-full md:w-[300px]
      bg-white/60 backdrop-blur border border-gray-200/60
      focus-within:ring-2 focus-within:ring-indigo-500 transition">
      <Search className="h-5 w-5 text-gray-400" />
      <input
        type="text"
        className="w-full bg-transparent outline-none text-sm placeholder-gray-400"
        placeholder="Search employee, client or date"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>

    {/* Filters */}
    <div className="flex flex-wrap items-center gap-2">
      {[TodayButton, YesterdayButton, WeeklyButton].map((Btn, i) => (
        <Btn
          key={i}
          className="rounded-xl bg-white/70 backdrop-blur border border-gray-200/60
            hover:bg-white transition shadow-sm"
        />
      ))}

      <DateRangePicker
        value={dateRange}
        onChange={(range) => {
          setDateRange(range);
          setIsCustomMode(false);
        }}
      />

      <ClearButton className="rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition" />

      <ExportButton className="rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition" />
    </div>
  </div>

  {/* 🔹 ROW 2 */}
  <div className="flex flex-wrap items-center justify-between gap-4 px-4 pb-3">

    {/* Tabs */}
    <div className="flex gap-1 bg-white/60 backdrop-blur p-1 rounded-xl border border-gray-200/60">
      {[
        { key: "team", label: "My Team" },
        { key: "projects", label: "My Projects" },
        { key: "managers", label: "Managers" }
      ].map(tab => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition
            ${
              activeTab === tab.key
                ? "bg-indigo-600 text-white shadow"
                : "text-gray-600 hover:bg-white"
            }`}
        >
          {tab.label}
        </button>
      ))}
    </div>

    {/* Pending / Backdated */}
    <div className="flex bg-white/60 backdrop-blur p-1 rounded-xl border border-gray-200/60">
      {["pending", "backdated"].map(status => (
        <button
          key={status}
          onClick={() => setSheetStatus(status)}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition
            ${
              sheetStatus === status
                ? "bg-white shadow text-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
        >
          {status === "pending" ? "Pending" : "Backdated"}
        </button>
      ))}
    </div>
  </div>

  {/* 🔹 ROW 3: Stats */}
  <div className="px-4 pb-4 grid grid-cols-2 md:grid-cols-3 gap-4">

    <div className="relative overflow-hidden rounded-2xl p-4
      bg-gradient-to-br from-yellow-50 to-yellow-100/70
      border border-yellow-200/60 shadow-sm">
      <div className="text-lg font-bold text-yellow-800">
        {getPendingTime()}
      </div>
      <div className="text-xs text-yellow-700">
        Total Pending Hours
      </div>

      {/* subtle glow */}
      <div className="absolute -top-6 -right-6 w-24 h-24 bg-yellow-200/40 rounded-full blur-2xl" />
    </div>

  </div>
</div>



       <GlobalTable02
  tableType="main"
  data={filteredData}
  paginatedData={paginatedData()}
  columns={mainTableColumns}
  isLoading={isLoading}
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
  expandedRow={expandedRow}     
  onToggleRow={toggleRow}   
  
  selectedRows={selectedRows}
  onSelectAll={handleSelectAllDays}
  onRowSelect={handleDaySelect}

onRowClick={(row) =>
  toggleRow(`${row.date}_${row.user_name}`)
}

 
  canEdit={canAddEmployee}
  editMode={{}} 
  onEditToggle={() => {}}

  enableHeaderBulkActions={true}
  isAllSelected={isCurrentPageFullySelected}
    onStatusChange={async (sheetId, status) => {
    if (status === "approved") {
      await approvePerformanceSheet(sheetId);
    } else {
      await rejectPerformanceSheet(sheetId);
    }
    fetchPendingPerformanceDetails();
  }}

  onHeaderSelectAll={handleSelectAllDays}
  onHeaderBulkApprove={() => handleBulkStatusChange("approved")}
  onHeaderBulkReject={() => handleBulkStatusChange("rejected")}

  showTotalHoursArrow={true}
  mainTableBulkActionsOnly={true}
 
  onBulkAction={async (status, sheets) => {
    const promises = sheets.map(sheet =>
      status === "approved"
        ? approvePerformanceSheet(sheet.id)
        : rejectPerformanceSheet(sheet.id)
    );

    await Promise.all(promises);
    fetchPendingPerformanceDetails();
  }}

  emptyStateTitle="No pending sheets"
  emptyStateMessage="No pending sheets found"
/>


{dayDetailModalOpen && selectedDayDetails && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    {/* BACKDROP */}
    <div
      className="absolute inset-0 bg-black/40 backdrop-blur-md"
      onClick={closeDayDetails}
    />

    {/* MODAL */}
    <div
      className="
        relative w-full max-w-7xl max-h-[90vh]
        rounded-3xl overflow-hidden
        bg-white/80 backdrop-blur-xl
        border border-white/40
        shadow-[0_30px_90px_rgba(0,0,0,0.35)]
        flex flex-col
      "
    >
      {/* HEADER */}
      <div className="p-6 border-b border-white/30 bg-gradient-to-r from-sky-200/40 to-indigo-200/40">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 leading-tight">
    "{selectedDayDetails.user_name}" submitted timesheet for 
    <span className="text-indigo-600 font-semibold"> {selectedDayDetails.date}</span>
  </h2>
            <p className="text-indigo-700 font-medium mt-1">
              Total Hours: {formatTime(selectedDayDetails.total_hours)}
            </p>
          </div>

          <button
            onClick={closeDayDetails}
            className="p-2 rounded-xl hover:bg-white/40 transition"
          >
            ✕
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-auto p-6 space-y-4">

        {/* ✅ BULK ACTION BAR */}
        {selectedInnerRows.length > 0 && canAddEmployee && (
          <div
            className="
              sticky top-0 z-30
              flex justify-between items-center
              rounded-2xl
              bg-white/90 backdrop-blur-xl
              border border-white/40
              shadow-lg
              px-5 py-4
            "
          >
            <p className="text-sm font-semibold text-gray-700">
              {selectedInnerRows.length} selected
            </p>

            <div className="flex gap-3">
              <ApproveButton
                onClick={async () => {
                  await Promise.all(
                    selectedInnerRows.map(id => approvePerformanceSheet(id))
                  );
                  fetchPendingPerformanceDetails();
                  setSelectedInnerRows([]);
                  closeDayDetails();
                }}
              />

              <RejectButton
                onClick={async () => {
                  await Promise.all(
                    selectedInnerRows.map(id => rejectPerformanceSheet(id))
                  );
                  fetchPendingPerformanceDetails();
                  setSelectedInnerRows([]);
                  closeDayDetails();
                }}
              />
            </div>
          </div>
        )}

        {/* TABLE */}
        <GlobalTable02
  tableType="modal"
  columns={modalTableColumns}
  modalData={selectedDayDetails}

 
  selectedModalRows={selectedInnerRows}
  onSelectAllModal={handleSelectAllDay}
  onRowSelectModal={handleDayRowSelect}


  expandedRow={expandedRow}
  onToggleRow={toggleRow}

  
  onStatusChange={async (sheetId, status) => {
    if (status === "approved") {
      await approvePerformanceSheet(sheetId);
    } else {
      await rejectPerformanceSheet(sheetId);
    }

    fetchPendingPerformanceDetails();
    closeDayDetails(); 
  }}
/>
      </div>
    </div>
  </div>
)}


      {/* Narration Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-6 relative max-h-[80vh] overflow-y-auto">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-2xl font-bold hover:text-gray-700 text-gray-500"
            >
              &times;
            </button>
            <div className="whitespace-pre-wrap text-gray-900 text-sm leading-relaxed">{modalText}</div>
          </div>
        </div>
      )}
    </div>
  );
};
