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
        return (
          userName.includes(trimmedSearchQuery) ||
          clientNames.includes(trimmedSearchQuery) ||
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
            ? { ...sheet, status: newStatus.charAt(0).toUpperCase() + newStatus.slice(1) }
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
            ? { ...sheet, status: newStatus.charAt(0).toUpperCase() + newStatus.slice(1) }
            : sheet
        )
      }));
    }

    

  } catch (error) {
    console.error("Error Updating Sheet Status:", error);
    fetchPerformanceDetails();
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
    const allDayKeys = currentPageDays.map(day => `${day.user_name}_${day.date}`);
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
          <ExportButton onClick={() => {
            const exportData = filteredData.map(day => ({
              date: day.date, employee: day.user_name, total_hours: formatTime(day.total_hours),
              total_sheets: day.total_sheets, status: selectedStatus || "All"
            }));
            exportToExcel(exportData, "approved_rejected_sheets.xlsx");
          }} />
        </div>
      </div>

      <div className="p-4">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-max border-collapse">
            <thead className="border-b border-gray-800 bg-black text-white">
              <tr className="table-th-tr-row table-bg-heading whitespace-nowrap sm:whitespace-normal">
                <th className="px-4 py-2 text-center w-[80px]">
                  <input type="checkbox" checked={false} onChange={handleSelectAllMainDays} className="mr-1" />
                </th>
                {[
                  { label: "Date", icon: Calendar },
                  { label: "Employee", icon: User },
                  { label: "Work Types", icon: Target },
                  { label: "Clients", icon: Briefcase },
                  { label: "Total Hours", icon: Clock },
                  { label: "Sheets", icon: FileText },
                  { label: "Action" }
                ].map(({ label, icon: Icon }, index) => (
                  <th key={index} className="px-3 py-2 font-medium items-center text-xs">
                    <div className="flex items-center justify-center gap-2">
                      {Icon && <Icon className="h-4 w-4 text-white" />}
                      {label}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan="8" className="px-6 py-16 text-center">
                  <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto" />
                  <span className="text-gray-600 text-lg font-medium block mt-2">Loading approved & rejected sheets...</span>
                </td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan="8" className="px-6 py-16 text-center text-gray-500">No {selectedStatus || "data"} found</td></tr>
              ) : (
                paginatedData().map((day) => {
                  const dayKey = `${day.user_name}_${day.date}`;
                  return (
                    <tr key={dayKey} className="hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer" onClick={() => openDayDetails(day)}>
                      <td className="px-4 py-4 text-center">
                        <input type="checkbox" checked={selectedMainRows.includes(dayKey)} 
                          onChange={(e) => { e.stopPropagation(); handleMainDaySelect(dayKey); }} />
                      </td>
                      <td className="px-4 py-4 items-center text-center text-xs text-gray-600 font-normal">{day.date}</td>
                      <td className="px-4 py-4 items-center text-center text-xs text-gray-600 font-normal">{day.user_name}</td>
                      <td className="px-4 py-4 items-center text-center text-xs text-gray-600 font-normal">
                        <span className="truncate block" title={Array.from(day.work_types).join(", ")}>
                          {Array.from(day.work_types).join(", ").slice(0, 25)}...
                        </span>
                      </td>
                      <td className="px-4 py-4 items-center text-center text-xs text-gray-600 font-normal">
                        <span className="truncate block" title={Array.from(day.client_names).join(", ")}>
                          {Array.from(day.client_names).join(", ").slice(0, 25)}...
                        </span>
                      </td>
                      <td className="px-4 py-4 items-center text-center text-xs font-normal text-blue-600">{formatTime(day.total_hours)}</td>
                      <td className="px-4 py-4 items-center text-center text-xs text-gray-600 font-normal">
                        <span>{day.total_sheets}</span>
                        {day.rejected_sheets > 0 && <span className="text-red-500 text-xs ml-1">({day.rejected_sheets}R)</span>}
                        {day.approved_sheets > 0 && <span className="text-green-500 text-xs ml-1">({day.approved_sheets}A)</span>}
                      </td>
                      <td className="px-4 py-4 items-center text-center text-xs text-gray-600 font-normal">
                        {canAddEmployee ? (
                          editMode[dayKey] ? (
                            <div className="flex gap-2 justify-center">
                              <IconApproveButton onClick={async (e) => {
                                e.stopPropagation();
                                const promises = day.sheets.map(sheet => approvePerformanceSheet(sheet.id));
                                await Promise.all(promises);
                                refreshData(); 
                                toggleEditMode(dayKey);
                              }} />
                              <IconRejectButton onClick={async (e) => {
                                e.stopPropagation();
                                const promises = day.sheets.map(sheet => rejectPerformanceSheet(sheet.id));
                                await Promise.all(promises);
                                refreshData(); 
                                toggleEditMode(dayKey);
                              }} />
                              <IconCancelTaskButton onClick={(e) => { e.stopPropagation(); toggleEditMode(dayKey); }} />
                            </div>
                          ) : (
                            <div className="flex gap-2 justify-center">
                              <IconApproveButton />
                              <Pencil className="text-blue-600 h-4 w-4 cursor-pointer hover:scale-110" 
                                onClick={(e) => { e.stopPropagation(); toggleEditMode(dayKey); }} />
                            </div>
                          )
                        ) : "No access"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

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
                <div className="w-full overflow-x-auto">

        <table className="min-w-full">
          <thead>
            <tr className="bg-white/50">
              <th className="px-4 py-3 w-12">
                <input
                  type="checkbox"
                  checked={
                    selectedModalRows.length === selectedDayDetails.sheets.length &&
                    selectedDayDetails.sheets.length > 0
                  }
                  onChange={handleSelectAllDay}
                />
              </th>
              {["Project", "Work Type", "Activity", "Time", "Submitted", "Status", "Actions", ""].map(h => (
                <th key={h} className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-white/30">
            {selectedDayDetails.sheets.map(sheet => {
              const isOpen = expandedRow === sheet.id;
              const isSelected = selectedModalRows.includes(sheet.id);

              return (
                <Fragment key={sheet.id}>
                  {/* ROW */}
                  <tr
                    onClick={() => toggleRow(sheet.id)}
                    className={`
                      cursor-pointer
                      hover:bg-white/50
                      transition
                      ${isSelected ? "bg-indigo-50/60 ring-1 ring-indigo-200" : ""}
                    `}
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => handleDayRowSelect(sheet.id)}
                      />
                    </td>

                    <td className="px-4 py-4 font-medium truncate">
                      {sheet.project_name}
                    </td>
                    <td className="px-4 py-4">{sheet.work_type}</td>
                    <td className="px-4 py-4">{sheet.activity_type}</td>
                    <td className="px-4 py-4 font-mono">{sheet.time}</td>

                    <td className="px-4 py-4 text-xs text-gray-500">
                      {sheet.created_at
                        ? new Date(sheet.created_at).toLocaleDateString()
                        : "N/A"}
                    </td>

                    <td className="px-4 py-4">
                      <span className={`
                        px-3 py-1 rounded-full text-xs font-semibold
                        ${
                          sheet.status === "approved"
                            ? "bg-green-200/70 text-green-900"
                            : sheet.status === "rejected"
                            ? "bg-red-200/70 text-red-900"
                            : "bg-yellow-200/70 text-yellow-900"
                        }
                      `}>
                        {sheet.status}
                      </span>
                    </td>

                    {/* ✅ BIG ACTION BUTTONS */}
                    <td
                      className="px-4 py-4 flex gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ApproveButton
                        onClick={() => handleStatusChange(sheet.id, "approved")}
                      />
                      <RejectButton
                        onClick={() => handleStatusChange(sheet.id, "rejected")}
                      />
                    </td>

                    <td className="px-4 py-4 text-right">
                      <ChevronDown
                        className={`w-5 h-5 transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </td>
                  </tr>

                  {/* EXPANDED NARRATION */}
                  {isOpen && (
                    <tr>
                      <td colSpan={9} className="px-6 py-4 bg-white/40">
                        <div className="
                          rounded-2xl
                          bg-white/80 backdrop-blur-lg
                          border border-white/40
                          p-5
                        ">
                          <p className="text-sm font-semibold text-gray-700 mb-2">
                            Narration
                          </p>
                          <p className="text-sm text-gray-800 leading-relaxed">
                            {sheet.narration || "No narration provided."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
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
