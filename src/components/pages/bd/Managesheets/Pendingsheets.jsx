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
import { useUserContext } from "../../../context/UserContext";

export const Pendingsheets = () => {
    const { userProjects, error, editPerformanceSheet, performanceSheets, loading, fetchPerformanceSheets,deletesheet } = useUserContext();
  
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
const [currentUserId, setCurrentUserId] = useState(null);
const [dropdownHierarchy, setDropdownHierarchy] = useState([]); // [{ label, value }, ...]
const [selectedUserStack, setSelectedUserStack] = useState([]); // [{ user_id, user_name }, ...]
const [dropdownLevels, setDropdownLevels] = useState([]); // [ { label, value, children: [...] }, ... ]
const [userTree, setUserTree] = useState(null);

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
  if (activeTab === "projects") {
    fetchPendingPerformanceDetails(currentUserId);
  }
}, [activeTab, currentUserId]);

      const sheets =
        performanceSheets?.sheets ||
        performanceSheets?.data?.sheets ||
        [];
  useEffect(() => {
    fetchPerformanceSheets();
    console.log('====================================');
    console.log(sheets);
    console.log('====================================');
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
  const getSelectedUserNode = (node, targetId) => {
    if (!node) return null;
    if (node.user_id === targetId) return node;

    if (Array.isArray(node.children)) {
      for (const child of node.children) {
        const found = getSelectedUserNode(child, targetId);
        if (found) return found;
      }
    }
    return null;
  };

  let dataToUse = [];
  if (activeTab === "team") {
    const sheets =
      performanceSheets?.sheets ||
      performanceSheets?.data?.sheets ||
      [];
    dataToUse = sheets;
  } else {
    if (activeTab === "projects") {
      let node = pendingPerformanceData?.data;
      if (currentUserId) {
        node = getSelectedUserNode(pendingPerformanceData?.data, currentUserId);
      }

      if (node?.sheets) {
        dataToUse = [{ ...node, sheets: node.sheets }];
      } else if (node?.children) {
        dataToUse = node.children.map((child) => ({
          user_name: child.user_name,
          sheets: child.sheets || [],
        }));
      } else {
        dataToUse = [];
      }
    } else {
      dataToUse = pendingPerformanceData;
    }
  }

  if (!dataToUse || dataToUse.length === 0) {
    setFilteredData([]);
    return;
  }

  const trimmedSearchQuery = searchQuery?.trim().toLowerCase();

  const users =
    activeTab === "team"
      ? [
          {
            user_name: performanceSheets?.data?.user_name || "Unknown",
            sheets: dataToUse,
          },
        ]
      : Array.isArray(dataToUse)
      ? dataToUse
      : [];

  if (!Array.isArray(users)) {
    setFilteredData([]);
    return;
  }




  let filteredUsers = users.map((user) => {
    let sheets = user.sheets || [];

    
    sheets = sheets.filter((sheet) => {
      if (sheetStatus === "pending") {
        return sheet.status === "pending" && !sheet.is_backdated;
      }
      if (sheetStatus === "backdated") {
        return sheet.is_backdated === true;
      }
      return true;
    });

 
    if (activeTab === "projects") {
      sheets = sheets.filter((sheet) => sheet.project_id);
    }
    if (activeTab === "managers") {
      sheets = sheets.filter((sheet) => sheet.reporting_manager_id);
    }

 
    if (startDate && endDate) {
      sheets = sheets.filter((sheet) => {
        const sheetDate = sheet.date?.split("T")[0];
        return sheetDate >= startDate && sheetDate <= endDate;
      });
    }

    if (trimmedSearchQuery) {
      sheets = sheets.filter((sheet) =>
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
    (user) => user.sheets && user.sheets.length > 0
  );

  const groupedData = groupDataByDay(filteredUsers);
  setFilteredData(groupedData);
}, [
  activeTab,
  performanceSheets,
  pendingPerformanceData,
  searchQuery,
  startDate,
  endDate,
  sheetStatus,
  currentUserId,
]);
// node: the tree root
// level: depth we want options for (0 = top level)
const getOptionsForLevel = (node, level) => {
  if (!node) return [];

  let current = node;
  for (let i = 0; i < level; i++) {
    const sel = selectedUserStack[i];
    if (!sel) return [];
    const next = (current.children || []).find(c => c.user_id === sel.user_id);
    if (!next) return [];
    current = next;
  }

  return (current.children || []).map(c => ({
    label: c.user_name,
    value: c.user_id,
    children: c.children || [],
  }));
};





useEffect(() => {
  if (activeTab === "projects" && pendingPerformanceData?.data) {
    setUserTree(pendingPerformanceData.data);
  }
}, [activeTab, pendingPerformanceData]);



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

// Navigate the tree using selectedUserStack
// Navigate the tree using selectedUserStack
const getNodeAtStack = (tree, stack) => {
  let current = tree;
  for (const sel of stack) {
    if (!current?.children) return null;
    current = current.children.find(c => c.user_id === sel.user_id);
    if (!current) return null;
  }
  return current;
};

const dropdownOptions = React.useMemo(() => {
  if (!userTree) return [];

  const options = [];

  // Generate options for one level beyond the current stack
  const maxLevels = selectedUserStack.length + 1;

  for (let level = 0; level < maxLevels; level++) {
    const path = selectedUserStack.slice(0, level);
    const node = getNodeAtStack(userTree, path);

    if (node?.children) {
      options.push(
        node.children.map(child => ({
          label: child.user_name,
          value: child.user_id,
          children: child.children || [],
        }))
      );
    } else {
      options.push([]);
    }
  }

  return options;
}, [userTree, selectedUserStack]);

useEffect(() => {
  if (activeTab !== "projects" || !pendingPerformanceData?.data) return;

  let node = getNodeAtStack(pendingPerformanceData.data, selectedUserStack);

  let dataToUse = [];

  if (!node) {
    // No selection yet, show top-level children
    dataToUse = pendingPerformanceData.data.children?.map(c => ({
      user_name: c.user_name,
      sheets: c.sheets || [],
    })) || [];
  } else if (node.sheets?.length) {
    // Selected node has sheets
    dataToUse = [{ ...node, sheets: node.sheets }];
  } else if (node.children?.length) {
    // Show children of selected node
    dataToUse = node.children.map(c => ({
      user_name: c.user_name,
      sheets: c.sheets || [],
    }));
  }

  // Apply pending/backdated filter
  dataToUse = dataToUse.map(user => ({
    ...user,
    sheets: user.sheets.filter(sheet => {
      if (sheetStatus === "pending") return sheet.status === "pending" && !sheet.is_backdated;
      if (sheetStatus === "backdated") return sheet.is_backdated === true;
      return true;
    })
  })).filter(user => user.sheets.length > 0);

  // Group by day as before
  const groupedData = groupDataByDay(dataToUse);
  setFilteredData(groupedData);

}, [activeTab, pendingPerformanceData, selectedUserStack, sheetStatus, startDate, endDate, searchQuery]);

// node: the tree root
// level: depth we want options for (0 = top level)
const getCurrentLevelOptions = (tree, stack) => {
  if (!tree) return [];

  let current = tree;

  for (let i = 0; i < stack.length; i++) {
    const sel = stack[i];

    // 🔑 Skip matching root (Nitish case)
    if (i === 0 && current.user_id === sel.user_id) {
      continue;
    }

    if (!current.children) return [];

    current = current.children.find(c => c.user_id === sel.user_id);
    if (!current) return [];
  }

  return (current.children || []).map(c => ({
    label: c.user_name,
    value: c.user_id,
    children: c.children || [],
  }));
};


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
{activeTab === "projects" && userTree && (
  <div className="flex flex-col gap-2 p-2 bg-white/70 rounded-xl border border-gray-200/60">

    {/* 🔹 Breadcrumb / Path */}
 {/* 🟦 Review Context */}
<div className="flex flex-col gap-2 p-3 rounded-xl bg-indigo-50/60 border border-indigo-100">

  <div className="text-xs uppercase tracking-wide text-indigo-600 font-semibold">
    Reviewing sheets for
  </div>

  <div className="flex items-center justify-between gap-3">
    <div className="text-base font-semibold text-indigo-900">
      {selectedUserStack.length === 0
        ? pendingPerformanceData?.data?.user_name || "My Team"
        : selectedUserStack[selectedUserStack.length - 1].user_name}
    </div>

    {selectedUserStack.length > 1 && (
      <button
        onClick={() => {
          setSelectedUserStack(prev => prev.slice(0, -1));
          setCurrentUserId(prev =>
            selectedUserStack.length > 1
              ? selectedUserStack[selectedUserStack.length - 2].user_id
              : null
          );
        }}
        className="text-sm text-indigo-600 hover:underline"
      >
        Go up one level
      </button>
    )}
  </div>
</div>


    {/* 🔹 Current Level Options */}
    <div className="flex flex-wrap gap-2 mt-2">
      {(getCurrentLevelOptions(userTree, selectedUserStack) || []).map((opt) => (
        <button
          key={opt.value}
          className={`
            px-4 py-2 rounded-xl border
            ${
              selectedUserStack[selectedUserStack.length - 1]?.user_id === opt.value
                ? "bg-indigo-100 border-indigo-500 text-indigo-700" // selected highlight
                : "bg-white border-gray-200 text-gray-700"
            }
            hover:bg-indigo-50 transition
          `}
          onClick={() => {
            setSelectedUserStack([...selectedUserStack, { user_id: opt.value, user_name: opt.label }]);
            setCurrentUserId(opt.value);
          }}
        >
          {opt.label}
        </button>
      ))}

      {/* 🔹 Optional: No children message */}
      {getCurrentLevelOptions(userTree, selectedUserStack).length === 0 && (
        <p className="text-gray-400 text-sm">No more users under this level</p>
      )}
    </div>
  </div>
)}






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