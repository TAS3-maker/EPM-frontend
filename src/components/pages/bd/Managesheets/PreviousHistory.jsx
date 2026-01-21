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

export const PreviousHistory = () => {
  const { draftPerformanceData, fetchDraftPerformanceDetails, isLoading, approvePerformanceSheet, rejectPerformanceSheet } = useBDProjectsAssigned();
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
  const itemsPerPage = 10;
const [expandedRow, setExpandedRow] = useState(null);

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
  fetchDraftPerformanceDetails({is_fillable: 0});}, []);


useEffect(() => {
  if (draftPerformanceData.length > 0 && !startDate && !endDate) {
    console.log("Showing ALL pending sheets:", draftPerformanceData.length, "users");
  }
}, [draftPerformanceData]);

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
    const dataToUse = draftPerformanceData;
    const dataReady = Array.isArray(dataToUse) && dataToUse.length > 0;

    if (!dataReady) {
      setFilteredData([]);
      return;
    }

    let groupedData = groupDataByDay(dataToUse);

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
        return (
          userName.includes(trimmedSearchQuery) ||
          clientNames.includes(trimmedSearchQuery) ||
          day.date.includes(trimmedSearchQuery)
        );
      });
    }

    setFilteredData(groupedData);
  }, [searchQuery, startDate, endDate, draftPerformanceData]);

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
        fetchDraftPerformanceDetails({is_fillable: 0});
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
      
        fetchDraftPerformanceDetails({is_fillable: 0});
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
      <SectionHeader icon={BarChart} title="Previous Performance Sheets" subtitle="Review and approve Previous sheets" />
      
      <div className="flex flex-wrap items-center justify-between gap-4 top-0 bg-white z-10 shadow-md p-4 rounded-md">
        <div className="flex flex-wrap md:flex-nowrap items-center gap-3 border p-2 rounded-lg shadow-md bg-white">
          <div className="flex items-center border border-gray-300 px-2 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
            <Search className="h-5 w-5 text-gray-400 mr-[5px]" />
            <input
              type="text"
              className="w-full rounded-lg focus:outline-none py-2"
              placeholder="Search by employee, client, or date"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!isCustomMode ? (
            <>
              {/* <TodayButton 
                onClick={() => {
                  const today = new Date().toISOString().split("T")[0];
                  setStartDate(today);
                  setEndDate(today);
                }} 
              />
              <YesterdayButton 
                onClick={() => {
                  const d = new Date();
                  d.setDate(d.getDate() - 1);
                  const yesterday = d.toISOString().split("T")[0];
                  setStartDate(yesterday);
                  setEndDate(yesterday);
                }} 
              />
              <WeeklyButton onClick={() => {
                const end = new Date();
                const start = new Date();
                start.setDate(start.getDate() - 6);
                const formattedStart = start.toISOString().split("T")[0];
                const formattedEnd = end.toISOString().split("T")[0];
                setStartDate(formattedStart);
                setEndDate(formattedEnd);
              }}/> */}
              {/* <CustomButton onClick={() => setIsCustomMode(true)}/>
               */}
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
              <ClearButton
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setSearchQuery("");
           
                }}
              />
            </>
          ) : (
            <>
             
              <CancelButton onClick={() => {
                setIsCustomMode(false);
                setStartDate("");
                setEndDate("");
              }} />
            </>
          )}

          <ExportButton
            onClick={() => {
              const exportData = filteredData.map(day => ({
                date: day.date,
                employee: day.user_name,
                total_hours: formatTime(day.total_hours),
                clients: Array.from(day.client_names).join(", "),
                work_types: Array.from(day.work_types).join(", ")
              }));
              exportToExcel(exportData, "pending_daily_summary.xlsx");
            }}
          />
        </div>

        <div className="w-full grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-yellow-50 border border-yellow-200 px-2 py-1 rounded shadow cursor-pointer transform transition-transform duration-300 hover:scale-105 col-span-2 md:col-span-1">
            <div className="text-sm font-semibold text-yellow-800">{getPendingTime()}</div>
            <div className="text-xs text-yellow-600">Total Previous Hours</div>
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


  selectedRows={selectedRows}
  onSelectAll={handleSelectAllDays}
  onRowSelect={handleDaySelect}

  
 
  
  isAllSelected={isCurrentPageFullySelected}
  enableHeaderBulkActions={canAddEmployee}
  onHeaderSelectAll={handleSelectAllDays}

  onHeaderBulkApprove={() => handleBulkStatusChange("approved")}
  onHeaderBulkReject={() => handleBulkStatusChange("rejected")}

 
  onRowClick={openDayDetails}

  canEdit={canAddEmployee}
  showTotalHoursArrow={true}

 
  mainTableBulkActionsOnly={true}

  onBulkAction={async (status, sheets) => {
    const promises = sheets.map(sheet =>
      status === "approved"
        ? approvePerformanceSheet(sheet.id)
        : rejectPerformanceSheet(sheet.id)
    );

    await Promise.all(promises);
    fetchDraftPerformanceDetails({ is_fillable: 0 });
  }}

  emptyStateTitle="No Previous sheets"
  emptyStateMessage="No Previous sheets found"
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
            <h2 className="text-2xl font-semibold text-gray-900">
              {selectedDayDetails.date} · {selectedDayDetails.user_name}
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
                    fetchDraftPerformanceDetails({is_fillable: 0});
                  setSelectedInnerRows([]);
                  closeDayDetails();
                }}
              />

              <RejectButton
                onClick={async () => {
                  await Promise.all(
                    selectedInnerRows.map(id => rejectPerformanceSheet(id))
                  );
                    fetchDraftPerformanceDetails({is_fillable: 0});
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

    fetchDraftPerformanceDetails({ is_fillable: 0 });
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
