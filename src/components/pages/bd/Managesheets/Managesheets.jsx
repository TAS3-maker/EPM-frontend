import React, { useEffect, useState, useCallback } from "react";
import { useBDProjectsAssigned } from "../../../context/BDProjectsassigned";
import { Loader2, Calendar, User, Briefcase, Clock, FileText, Target, BarChart, Search, Info, Pencil } from "lucide-react";
import { exportToExcel } from "../../../components/excelUtils";
import { SectionHeader } from '../../../components/SectionHeader';
import { ClearButton, IconApproveButton, IconRejectButton, YesterdayButton, TodayButton, WeeklyButton, CustomButton, CancelButton, ExportButton, IconCancelTaskButton } from "../../../AllButtons/AllButtons";
import Pagination from "../../../components/Pagination";
import { usePermissions } from "../../../context/PermissionContext";
import { useLocation } from "react-router-dom";
import { Fragment } from "react";
import { ChevronDown } from "lucide-react";
import GlobalTable02 from "../../../components/GlobalTable02";

export const Managesheets = () => {
  const { permissions } = usePermissions();
  const { performanceData, fetchPerformanceDetails, isLoading, approvePerformanceSheet, rejectPerformanceSheet } = useBDProjectsAssigned();
  const location = useLocation();
  const role = localStorage.getItem("user_name");
  const currentPath = location.pathname.toLowerCase();
  const isPendingPage = currentPath === `/${role}/pending-sheets`;
const [expandedRow, setExpandedRow] = useState(null);

  const [filteredData, setFilteredData] = useState([]);
  const [selectedMainRows, setSelectedMainRows] = useState([]);
  const [selectedModalRows, setSelectedModalRows] = useState([]);
  const [editMode, setEditMode] = useState({});
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState("client_name");
  const [selectedStatus, setSelectedStatus] = useState(""); 
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDayDetails, setSelectedDayDetails] = useState(null);
  const [dayDetailModalOpen, setDayDetailModalOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [localPerformanceData, setLocalPerformanceData] = useState([]); // ✅ LOCAL STATE FOR INSTANT UPDATES
  const itemsPerPage = 10;

  const employeePermission = permissions?.permissions?.[0]?.manage_sheets_inside_performance_sheets;
  const canAddEmployee = employeePermission === "2";

  // Modal handlers
  const openModal = (data) => { setModalData(data); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setModalData(null); };
  const openDayDetails = (dayData) => { 
    setSelectedDayDetails(dayData); 
    setDayDetailModalOpen(true); 
    setSelectedModalRows([]); 
  };
  const closeDayDetails = () => { 
    setDayDetailModalOpen(false); 
    setSelectedDayDetails(null); 
    setSelectedMainRows([]); 
    setSelectedModalRows([]); 
    setEditMode({}); 
  };

  const toggleEditMode = (dayKey) => {
    setEditMode(prev => ({ ...prev, [dayKey]: !prev[dayKey] }));
  };

useEffect(() => {
  const today = new Date();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(today.getDate() - 6); 
  
  const formattedStart = oneWeekAgo.toISOString().split('T')[0];
  const formattedEnd = today.toISOString().split('T')[0];
  
  setStartDate(formattedStart);
  setEndDate(formattedEnd);
}, []); 


  useEffect(() => {
    fetchPerformanceDetails();
  }, [location.pathname]);

  // ✅ SYNC API DATA WITH LOCAL STATE
  useEffect(() => {
    setLocalPerformanceData(performanceData || []);
  }, [performanceData]);

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

  // ✅ GROUP ONLY APPROVED + REJECTED SHEETS (NO PENDING)
  const groupDataByUserDate = (dataToUse, statusFilter = "") => {
    const grouped = {};
    
    dataToUse.forEach((user) => {
      user?.sheets?.forEach((sheet) => {
        const status = sheet.status?.toLowerCase();
        if (status !== "approved" && status !== "rejected") return;
        
        if (!sheet?.date) return;
        
        const dateKey = sheet.date.split("T")[0];
        const userKey = user.user_name;
        const fullKey = `${userKey}_${dateKey}`;
        
        if (statusFilter && status !== statusFilter) return;
        
        if (!grouped[fullKey]) {
          grouped[fullKey] = {
            user_name: userKey,
            date: dateKey,
            total_hours: 0,
            total_sheets: 0,
            approved_sheets: 0,
            rejected_sheets: 0,
            client_names: new Set(),
            work_types: new Set(),
            sheets: []
          };
        }
        
        grouped[fullKey].sheets.push(sheet);
        grouped[fullKey].total_hours += getMinutes(sheet.time);
        grouped[fullKey].total_sheets += 1;
        if (status === "approved") {
          grouped[fullKey].approved_sheets += 1;
        } else if (status === "rejected") {
          grouped[fullKey].rejected_sheets += 1;
        }
        grouped[fullKey].client_names.add(sheet.client_name);
        grouped[fullKey].work_types.add(sheet.work_type);
      });
    });
    
    return Object.values(grouped);
  };

  // Filter and group data
  useEffect(() => {
    const dataToUse = localPerformanceData;
    const dataReady = Array.isArray(dataToUse) && dataToUse.length > 0;

    if (!dataReady) {
      setFilteredData([]);
      return;
    }

    let groupedData = groupDataByUserDate(dataToUse, selectedStatus);

    if (startDate && endDate) {
      groupedData = groupedData.filter((day) => 
        day.date >= startDate && day.date <= endDate
      );
    }

    const trimmedSearchQuery = searchQuery?.trim().toLowerCase();
    if (trimmedSearchQuery) {
      groupedData = groupedData.filter((day) => {
        const clientNames = Array.from(day.client_names).join(" ").toLowerCase();
        const userName = day.user_name.toLowerCase();
        
        const workTypes = Array.from(day.work_types || [])
      .join(" ")
      .toLowerCase();
        
        const sheetLevelText = (day.sheets || [])
         .map(sheet =>
        [
          sheet.project_name,
          sheet.activity_type,
          sheet.work_type,
          sheet.status
        ]
          .filter(Boolean)
          .join(" ")
      )
      .join(" ")
      .toLowerCase();
        
        return (
          userName.includes(trimmedSearchQuery) ||
          clientNames.includes(trimmedSearchQuery) ||
          sheetLevelText.includes(trimmedSearchQuery) ||
          workTypes.includes(trimmedSearchQuery) ||
          day.date.includes(trimmedSearchQuery)
        );
      });
    }

    setFilteredData(groupedData);
  }, [searchQuery, filterBy, startDate, endDate, selectedStatus, localPerformanceData]);

  // ✅ OPTIMIZED STATUS CHANGE WITH LOCAL UPDATE
// ✅ FIXED - Update BOTH local data AND modal data
const handleStatusChange = useCallback(async (sheetId, newStatus) => {
  try {
    // Update API
    if (newStatus === "approved") {
      await approvePerformanceSheet(sheetId);
    } else if (newStatus === "rejected") {
      await rejectPerformanceSheet(sheetId);
    }

    // ✅ UPDATE LOCAL DATA
    setLocalPerformanceData(prevData => {
      return prevData.map(user => ({
        ...user,
        sheets: user.sheets.map(sheet => 
          sheet.id === sheetId 
            ? { ...sheet, status: newStatus}
            : sheet
        )
      }));
    });

    // 🎯 NEW: UPDATE MODAL DATA INSTANTLY
    if (selectedDayDetails && dayDetailModalOpen) {
      setSelectedDayDetails(prev => ({
        ...prev,
        sheets: prev.sheets.map(sheet =>
          sheet.id === sheetId
            ? { ...sheet, status: newStatus}
            : sheet
        )
      }));
    }

    

  } catch (error) {
    console.error("Error Updating Sheet Status:", error);
    // fetchPerformanceDetails();
  }
}, [approvePerformanceSheet, rejectPerformanceSheet, fetchPerformanceDetails, selectedDayDetails, dayDetailModalOpen]);


  const refreshData = () => {
    fetchPerformanceDetails();
  };

  const paginatedData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const renderStatusToggle = () => {
    const buttons = [
      { label: "All", value: "" },
      { label: "Approved", value: "approved" },
      { label: "Rejected", value: "rejected" },
    ];

    return (
      <div className="flex flex-wrap items-center gap-3 px-3 mt-3">
        <label className="text-sm font-medium text-gray-700 text-nowrap">Filter by:</label>
        {buttons.map((btn) => {
          const isActive = selectedStatus === btn.value;
          return (
            <button
              key={btn.value}
              onClick={() => setSelectedStatus(btn.value)}
              className={`px-4 py-2 rounded-md text-sm sm:text-base ${
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {btn.label}
            </button>
          );
        })}
      </div>
    );
  };

  // Bulk actions (simplified)
  const handleSelectAllMainDays = () => {
    const currentPageDays = paginatedData();
    const allDayKeys = currentPageDays.map(
      day => `${day.date}_${day.user_name}`
    );
    if (selectedMainRows.length === allDayKeys.length) {
      setSelectedMainRows([]);
    } else {
      setSelectedMainRows(allDayKeys);
    }
  };

  const handleMainDaySelect = (dayKey) => {
    setSelectedMainRows(prev => 
      prev.includes(dayKey) ? prev.filter(key => key !== dayKey) : [...prev, dayKey]
    );
  };

  // Modal sheet selection handlers (from Pendingsheets)
  const handleSelectAllDay = () => {
    if (!selectedDayDetails) return;
    const allSheetIds = selectedDayDetails.sheets.map(sheet => sheet.id);

    if (selectedModalRows.length === allSheetIds.length) {
      setSelectedModalRows([]);
    } else {
      setSelectedModalRows(allSheetIds);
    }
  };

  const handleDayRowSelect = (sheetId) => {
    setSelectedModalRows((prev) =>
      prev.includes(sheetId)
        ? prev.filter((id) => id !== sheetId)
        : [...prev, sheetId]
    );
  };

  // ✅ BULK ACTION WITH LOCAL UPDATE
// ✅ FIXED BULK ACTION
const handleBulkAction = useCallback(async (action) => {
  if (selectedModalRows.length === 0) return;

  try {
    const promises = selectedModalRows.map(id => 
      action === "approved" 
        ? approvePerformanceSheet(id) 
        : rejectPerformanceSheet(id)
    );
    
    await Promise.all(promises);

    const newStatus = action.charAt(0).toUpperCase() + action.slice(1);

    setLocalPerformanceData(prevData => {
      return prevData.map(user => ({
        ...user,
        sheets: user.sheets.map(sheet => 
          selectedModalRows.includes(sheet.id)
            ? { ...sheet, status: newStatus }
            : sheet
        )
      }));
    });


    if (selectedDayDetails && dayDetailModalOpen) {
      setSelectedDayDetails(prev => ({
        ...prev,
        sheets: prev.sheets.map(sheet =>
          selectedModalRows.includes(sheet.id)
            ? { ...sheet, status: newStatus }
            : sheet
        )
      }));
    }

    setSelectedModalRows([]);
    closeDayDetails();
  } catch (error) {
    console.error("Bulk action error:", error);
    fetchPerformanceDetails();
  }
}, [selectedModalRows, approvePerformanceSheet, rejectPerformanceSheet, fetchPerformanceDetails, selectedDayDetails, dayDetailModalOpen]);



const toggleRow = (id) => {
  setExpandedRow(prev => (prev === id ? null : id));
};

const isCurrentPageFullySelected = (() => {
  const currentPageDays = paginatedData();
  if (currentPageDays.length === 0) return false;

  const keys = currentPageDays.map(
    day => `${day.date}_${day.user_name}`
  );

  return keys.every(key => selectedMainRows.includes(key));
})();




const mainColumns = [
  { label: "Date", key: "date", width: "w-[120px]" },
  { label: "Employee", key: "user_name", width: "w-[160px]" },
  { label: "Work Types", key: "work_types" },
  { label: "Clients", key: "client_names" },
  { label: "Total Hours", key: "total_hours" },
  { label: "Sheets", key: "total_sheets" }
];

const modalColumns = [
  { label: "Project", key: "project_name" },
  { label: "Work Type", key: "work_type" },
  { label: "Activity", key: "activity_type" },
  { label: "Time", key: "time" },
  { label: "Submitted on", key: "created_at" },
  { label: "Status", key: "status" }
];


  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-md max-h-screen overflow-y-auto">
      <SectionHeader icon={BarChart} title="Manage Performance Sheet" subtitle="Approved & Rejected sheets only" />
      
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 top-0 bg-white z-10 shadow-md p-4 rounded-md">
        <div className="flex flex-wrap items-center flex-col sm:flex-row gap-2 w-full sm:w-fit">
          <div className="flex items-center border border-gray-300 px-2 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 w-full sm:w-[220px]">
            <Search className="h-5 w-5 text-gray-400 mr-2" />
            <input
              type="text"
              className="w-full rounded-lg focus:outline-none py-2"
              placeholder="Search by employee, client, or date"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {renderStatusToggle()}

        <div className="flex flex-wrap items-center gap-2 w-full justify-end">
          {!isCustomMode ? (
            <>
              <TodayButton onClick={() => {
                const today = new Date().toISOString().split("T")[0];
                setStartDate(today); setEndDate(today);
              }} />
              <YesterdayButton onClick={() => {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const formatted = yesterday.toISOString().split("T")[0];
                setStartDate(formatted); setEndDate(formatted);
              }} />
              <WeeklyButton onClick={() => {
                const end = new Date();
                const start = new Date(); start.setDate(start.getDate() - 6);
                setStartDate(start.toISOString().split("T")[0]);
                setEndDate(end.toISOString().split("T")[0]);
              }}/>
              <CustomButton onClick={() => setIsCustomMode(true)}/>
            </>
          ) : (
            <>
              <input type="date" className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={startDate} onChange={(e) => setStartDate(e.target.value)} max={endDate || undefined} />
              <input type="date" className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate || undefined} />
              <ClearButton onClick={() => {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split("T")[0];
                setStartDate(""); setEndDate(""); setSearchQuery(""); 
              }} />
              <CancelButton onClick={() => {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split("T")[0];
                setIsCustomMode(false); setStartDate(yesterdayStr); setEndDate(yesterdayStr);
              }} />
            </>
          )}
              <ExportButton
            onClick={() => {
              const exportData = [];
          
              filteredData.forEach(user => {
                user?.sheets?.forEach(sheet => {
                  const sheetDate = sheet.date?.split("T")[0];
          
                  // date filter
                  if (startDate && endDate) {
                    if (sheetDate < startDate || sheetDate > endDate) return;
                  }
          
                  // search filter
                  if (searchQuery) {
                    const q = searchQuery.toLowerCase();
                    if (
                      !user.user_name?.toLowerCase().includes(q) &&
                      !sheet.client_name?.toLowerCase().includes(q) &&
                      !sheetDate?.includes(q)
                    ) {
                      return;
                    }
                  }
          
                  exportData.push({
                    date: sheetDate,
                    employee: user.user_name,
                    project: sheet.project_name,
                    client: sheet.client_name,
                    work_type: sheet.work_type,
                    activity: sheet.activity_type,
                    time: sheet.time,
                    status: sheet.status,
                    description: sheet.narration,
                              submitted_on: sheet.created_at,
                  });
                });
              });
          
              exportToExcel(exportData, "approved_rejected_sheets.xlsx");
            }}
          />
        </div>
      </div>

      <GlobalTable02
  tableType="main"
  columns={mainColumns}
  data={filteredData}
  paginatedData={paginatedData()}
  isLoading={isLoading}
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}

  selectedRows={selectedMainRows}
  onSelectAll={handleSelectAllMainDays}
  onRowSelect={handleMainDaySelect}

  onRowClick={(day) => openDayDetails(day)}

  canEdit={canAddEmployee}
  editMode={editMode}
  onEditToggle={toggleEditMode}


 enableHeaderBulkActions={true} 
  isAllSelected={isCurrentPageFullySelected}
  onHeaderSelectAll={handleSelectAllMainDays}


  onBulkAction={async (action, sheets) => {
  try {
    const promises = sheets.map(s =>
      action === "approved"
        ? approvePerformanceSheet(s.id)
        : rejectPerformanceSheet(s.id)
    );

    await Promise.all(promises); 
    // refreshData();
    setLocalPerformanceData(prev =>
  prev.map(user => ({
    ...user,
    sheets: user.sheets.map(sheet =>
      sheets.some(s => s.id === sheet.id)
        ? { ...sheet, status: action === "approved" ? "Approved" : "Rejected" }
        : sheet
    )
  }))
);

  } catch (err) {
    console.error("Bulk action failed", err);
  }
}}


onHeaderBulkApprove={async () => {
    const selectedDays = paginatedData().filter(day =>
      selectedMainRows.includes(`${day.date}_${day.user_name}`)
    );

    const allSheets = selectedDays.flatMap(day => day.sheets);

    await Promise.all(
      allSheets.map(sheet => approvePerformanceSheet(sheet.id))
    );

    setLocalPerformanceData(prev =>
      prev.map(user => ({
        ...user,
        sheets: user.sheets.map(sheet =>
          allSheets.some(s => s.id === sheet.id)
            ? { ...sheet, status: "Approved" }
            : sheet
        )
      }))
    );

    setSelectedMainRows([]);
  }}

  onHeaderBulkReject={async () => {
    const selectedDays = paginatedData().filter(day =>
      selectedMainRows.includes(`${day.date}_${day.user_name}`)
    );

    const allSheets = selectedDays.flatMap(day => day.sheets);

    await Promise.all(
      allSheets.map(sheet => rejectPerformanceSheet(sheet.id))
    );

    setLocalPerformanceData(prev =>
      prev.map(user => ({
        ...user,
        sheets: user.sheets.map(sheet =>
          allSheets.some(s => s.id === sheet.id)
            ? { ...sheet, status: "Rejected" }
            : sheet
        )
      }))
    );

    setSelectedMainRows([]);
  }}        


  showTotalHoursArrow
/>


      {/* FULL DAY DETAILS MODAL */}
{dayDetailModalOpen && selectedDayDetails && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    {/* BACKDROP */}
    <div
      className="absolute inset-0 bg-black/40 backdrop-blur-md"
      onClick={closeDayDetails}
    />

    {/* MODAL */}
    <div className="
      relative w-full max-w-7xl max-h-[90vh]
      rounded-3xl overflow-hidden
      bg-white/70 backdrop-blur-xl
      border border-white/30
      shadow-[0_30px_90px_rgba(0,0,0,0.35)]
      flex flex-col
    ">
      {/* HEADER */}
      <div className="p-6 border-b border-white/30 bg-gradient-to-r from-sky-200/40 to-indigo-200/40">
        <div className="flex justify-between">
    <div className="space-y-2">
  <h2 className="text-2xl font-semibold text-gray-900 leading-tight">
    "{selectedDayDetails.user_name}" submitted performance sheets for 
    <span className="text-indigo-600 font-semibold"> {selectedDayDetails.date}</span>
  </h2>
  <p className="text-indigo-700 font-medium flex items-center gap-2">
    <Clock className="w-4 h-4" />
    Total Hours: <span className="font-black text-lg">{formatTime(selectedDayDetails.total_hours)}</span>
  </p>
</div>

          <button
            onClick={closeDayDetails}
            className="p-2 rounded-xl hover:bg-white/40"
          >
            ✕
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-auto p-6 space-y-4">

        {/* ✅ BULK ACTION BAR */}
        {selectedModalRows.length > 0 && canAddEmployee && (
          <div className="
            sticky top-0 z-30
            flex justify-between items-center
            rounded-2xl
            bg-white/80 backdrop-blur-xl
            border border-white/40
            shadow-lg
            px-5 py-4
          ">
            <p className="text-sm font-semibold text-gray-700">
              {selectedModalRows.length} selected
            </p>
            <div className="flex gap-3">
              <ApproveButton onClick={() => handleBulkAction("approved")} />
              <RejectButton onClick={() => handleBulkAction("rejected")} />
            </div>
          </div>
        )}

        {/* TABLE */}
               <GlobalTable02
  tableType="modal"
  columns={modalColumns}
  modalData={selectedDayDetails}

  selectedModalRows={selectedModalRows}
  onSelectAllModal={handleSelectAllDay}
  onRowSelectModal={handleDayRowSelect}

  expandedRow={expandedRow}
  onToggleRow={toggleRow}

  onStatusChange={handleStatusChange}

  hideActions={false}
  canEdit={canAddEmployee}
/>

      </div>
    </div>
  </div>
)}
      




      {/* Narration Modal */}
      {modalOpen && modalData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-6 relative max-h-[80vh] overflow-y-auto">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-2xl font-bold hover:text-gray-700 text-gray-500"
            >
              ×
            </button>
            <div className="whitespace-pre-wrap text-gray-900 text-sm leading-relaxed">{modalData}</div>
          </div>
        </div>
      )}
    </div>
  );
};
