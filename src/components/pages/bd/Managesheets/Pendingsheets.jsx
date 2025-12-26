import React, { useEffect, useState } from "react";
import { useBDProjectsAssigned } from "../../../context/BDProjectsassigned";
import { Loader2, Calendar, User, Briefcase, Clock, FileText, Target, BarChart, Search, Info, ChevronDown } from "lucide-react";
import { exportToExcel } from "../../../components/excelUtils";
import { SectionHeader } from '../../../components/SectionHeader';
import { ClearButton, IconApproveButton, IconRejectButton, YesterdayButton, TodayButton, WeeklyButton, CustomButton, CancelButton, ExportButton } from "../../../AllButtons/AllButtons";
import Pagination from "../../../components/Pagination";
import { usePermissions } from "../../../context/PermissionContext";
import { Fragment } from "react";

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
  const [showBulkActions, setShowBulkActions] = useState(false); // ✅ NEW: Toggle bulk actions dropdown
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
    fetchPendingPerformanceDetails();
  }, []);

useEffect(() => {
  if (pendingPerformanceData.length > 0 && !startDate && !endDate) {
    console.log("Showing ALL pending sheets:", pendingPerformanceData.length, "users");
  }
}, [pendingPerformanceData]);

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
    const dataToUse = pendingPerformanceData;
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
  }, [searchQuery, startDate, endDate, pendingPerformanceData]);

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

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-md max-h-screen overflow-y-auto">
      <SectionHeader icon={BarChart} title="Pending Performance Sheets" subtitle="Review and approve pending sheets" />
      
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
              <TodayButton 
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
              }}/>
              <CustomButton onClick={() => setIsCustomMode(true)}/>
            </>
          ) : (
            <>
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
                  setIsCustomMode(false);
                }}
              />
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
            <div className="text-xs text-yellow-600">Total Pending Hours</div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-max border-collapse ">
            <thead className="border-b border-gray-800 bg-black text-white">
              <tr className="table-th-tr-row table-bg-heading whitespace-nowrap sm:whitespace-normal">
                {/* ✅ UPDATED: Checkbox column with bulk actions dropdown */}
                <th className="px-4 py-2 text-center w-[80px] relative">
                  <div className="flex items-center justify-center gap-1">
                    <input
                      type="checkbox"
                      checked={isCurrentPageFullySelected}
                      onChange={handleSelectAllDays}
                      className="mr-1"
                    />
                    {/* ✅ NEW: Bulk actions button/dropdown */}
                    {selectedRows.length > 0 && canAddEmployee && (
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowBulkActions(!showBulkActions);
                          }}
                          className="w-6 h-6 flex items-center justify-center text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-all"
                          title="Bulk actions"
                        >
                          ⋮⋮
                        </button>
                        {showBulkActions && (
                          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 min-w-[120px]">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBulkStatusChange("approved");
                              }}
                              className="block w-full text-left px-3 py-2 text-sm text-green-700 hover:bg-green-50 border-b border-gray-100"
                            >
                              Approve All ({selectedRows.length})
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBulkStatusChange("rejected");
                              }}
                              className="block w-full text-left px-3 py-2 text-sm text-red-700 hover:bg-red-50"
                            >
                              Reject All ({selectedRows.length})
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </th>
                {[
                  { label: "Date", icon: Calendar },
                  { label: "Employee", icon: User },
                  { label: "Work Types", icon: Target },
                  { label: "Clients", icon: Briefcase },
                  { label: "Total Hours", icon: Clock },
                  { label: "Action", icon: Briefcase }
                ].map(({ label, icon: Icon }, index) => (
                  <th key={index} className="px-3 py-2 font-medium items-center text-xs whitespace-nowrap">
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
                <tr>
                  <td colSpan="8" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                      <span className="text-gray-600 text-lg font-medium">Loading pending sheets...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-16 text-center text-gray-500">
                    No pending sheets found
                  </td>
                </tr>
              ) : (
                paginatedData().map((day) => {
                  const dayKey = `${day.date}_${day.user_name}`;
                  return (
                    <tr 
                      key={dayKey}
                      className={`hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer ${
                        selectedRows.includes(dayKey) ? 'bg-blue-100 border-l-4 border-blue-500' : ''
                      }`}
                      onClick={() => openDayDetails(day)}
                    >
                      <td className="px-4 py-4 text-center w-[80px]">
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(dayKey)}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleDaySelect(dayKey);
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td className="px-4 py-4 items-center text-center text-xs text-gray-600 font-normal">{day.date}</td>
                      <td className="px-4 py-4 items-center text-center text-xs text-gray-600 font-normal">{day.user_name}</td>
                      <td className="px-4 py-4 items-center text-center text-xs text-gray-600 font-normal">
                        <span className="truncate block" title={Array.from(day.work_types).join(", ")}>
                          {Array.from(day.work_types).join(", ").slice(0, 25)}{Array.from(day.work_types).join(", ").length > 25 ? "..." : ""}
                        </span>
                      </td>
                      <td className="px-4 py-4 items-center text-center text-xs text-gray-600 font-normal">
                        <span className="truncate block" title={Array.from(day.client_names).join(", ")}>
                          {Array.from(day.client_names).join(", ").slice(0, 25)}{Array.from(day.client_names).join(", ").length > 25 ? "..." : ""}
                        </span>
                      </td>
                      <td className="px-4 py-4 items-center text-center text-xs font-normal text-blue-600">
                        {formatTime(day.total_hours)} <ChevronDown className="h-4 w-4 inline ml-1" />
                      </td>
                      <td className="px-4 py-4 text-center">
                        {canAddEmployee ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="relative group">
                              <IconApproveButton
                                onClick={async (e) => {
                                  e.stopPropagation(); 
                                  try {
                                    const promises = day.sheets.map(sheet => approvePerformanceSheet(sheet.id));
                                    await Promise.all(promises);
                                    fetchPendingPerformanceDetails();
                                  } catch (error) {
                                    console.error("Approve all error:", error);
                                  }
                                }}
                              />
                              <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white text-black text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                                Approve ALL ({day.sheets.length} sheets)
                              </span>
                            </div>
                            <div className="relative group">
                              <IconRejectButton
                                onClick={async (e) => {
                                  e.stopPropagation(); 
                                  try {
                                    const promises = day.sheets.map(sheet => rejectPerformanceSheet(sheet.id));
                                    await Promise.all(promises);
                                    fetchPendingPerformanceDetails();
                                  } catch (error) {
                                    console.error("Reject all error:", error);
                                  }
                                }}
                              />
                              <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white text-black text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                                Reject ALL ({day.sheets.length} sheets)
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm">No access</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

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
        <div className="w-full overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-white/60 backdrop-blur">
                <th className="px-4 py-3 w-12">
                  <input
                    type="checkbox"
                    checked={
                      selectedInnerRows.length === selectedDayDetails.sheets.length &&
                      selectedDayDetails.sheets.length > 0
                    }
                    onChange={handleSelectAllDay}
                  />
                </th>
                {[
                  "Project",
                  "Work Type",
                  "Activity",
                  "Time",
                  "Submitted",
          
                  "Status",
                  "Actions",
                ].map(h => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-700"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-white/30">
              {selectedDayDetails.sheets.map(sheet => {
                const isSelected = selectedInnerRows.includes(sheet.id);
 const isOpen = expandedRow === sheet.id;
                return (
                  <Fragment key={sheet.id}>
                  <tr
                  onClick={() => toggleRow(sheet.id)}

                    key={sheet.id}
                    className={`
                      transition
                      hover:bg-white/50
                      ${isSelected ? "bg-indigo-50/60 ring-1 ring-indigo-200" : ""}
                    `}
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleDayRowSelect(sheet.id)}
                      />
                    </td>

                    <td className="px-4 py-4 font-medium truncate max-w-xs">
                      {sheet.project_name}
                    </td>

                    <td className="px-4 py-4">{sheet.work_type}</td>
                    <td className="px-4 py-4">{sheet.activity_type}</td>

                    <td className="px-4 py-4 font-mono text-sm">
                      {sheet.time}
                    </td>

                    <td className="px-4 py-4 text-xs text-gray-500">
                      {sheet.created_at
                        ? new Date(sheet.created_at).toLocaleDateString()
                        : "N/A"}
                    </td>

                  

                    <td className="px-4 py-4">
                      <span
                        className={`
                          px-3 py-1 rounded-full text-xs font-semibold
                          ${
                            sheet.status === "approved"
                              ? "bg-green-200/70 text-green-900"
                              : sheet.status === "rejected"
                              ? "bg-red-200/70 text-red-900"
                              : "bg-yellow-200/70 text-yellow-900"
                          }
                        `}
                      >
                        {sheet.status}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-4 py-4 flex gap-2">
                      <ApproveButton
                        onClick={() => {
                          handleStatusChange(sheet, "approved");
                          closeDayDetails();
                        }}
                      />
                      <RejectButton
                        onClick={() => {
                          handleStatusChange(sheet, "rejected");
                          closeDayDetails();
                        }}
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
                          {isOpen && (
                    <tr >
                      <td colSpan={10} className="px-6 py-4 bg-white/40">
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

