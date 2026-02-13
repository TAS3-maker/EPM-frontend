import React, { useEffect, useState ,useRef,useCallback } from "react";
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

export const Managesheets = () => {
    // const { userProjects, error, editPerformanceSheet, performanceSheets, loading, fetchPerformanceSheets,deletesheet } = useUserContext();
  const isHistoryView = true;
const role=localStorage.getItem("user_name")

  const { pendingPerformanceData,performanceData,fetchPerformanceDetailsmanage,performanceData1,fetchPerformanceDetails, fetchPendingPerformanceDetails, isLoading, approvePerformanceSheet, rejectPerformanceSheet,currentUserId,setCurrentUserId,selectedUserStack ,setSelectedUserStack,searchfilter,userTree,setUserTree,fetchPendingPerformance,pendingPerformance,myproject1,filtermyproject,filtermyproject1,filterbyproject,filterProjects} = useBDProjectsAssigned();
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
const [activeTab, setActiveTab] = useState(() => {
  return sessionStorage.getItem("pendingSheetsActiveTab") || "team";
});
const [isProjectOpen, setIsProjectOpen] = useState(false);
const [projectSearch, setProjectSearch] = useState("");
const [selectedProject, setSelectedProject] = useState(null);
const projectRef = useRef(null);
  const [editMode, setEditMode] = useState({});

const [sheetStatus, setSheetStatus] = useState(""); 
const [viewMode, setViewMode] = useState("all");
const [isReviewOpen, setIsReviewOpen] = useState(false);
const [userSearch, setUserSearch] = useState("");

  const itemsPerPage = 10;
const [expandedRow, setExpandedRow] = useState(null);
const [dateRange, setDateRange] = useState({
  start: "",
  end: "",
});
const projectsInitRef = useRef(false);


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

const clearSelectedProject = () => {
  setSelectedProject(null);
  setProjectSearch("");
  setIsProjectOpen(false);

  // If you want to reload “all projects” when no project is selected:
  filtermyproject1({});
};

  const closeDayDetails = () => {
    setDayDetailModalOpen(false);
    setSelectedDayDetails(null);
    setSelectedRows([]);
     setEditMode({}); 
  };

 const toggleEditMode = (dayKey) => {
  const day = filteredData.find(
    d => `${d.date}_${d.user_name}` === dayKey
  );
  if (!day) return;

  const allApproved = day.sheets.every(s => s.status === "approved");

  if (!allApproved) {
    setEditMode(prev => ({ ...prev, [dayKey]: false }));
    return;
  }

  setEditMode(prev => ({ ...prev, [dayKey]: !prev[dayKey] }));
};


 
const normalizeTeamUsers = (performanceData1) => {
  if (!performanceData1) return [];

  if (Array.isArray(performanceData1)) {
    return performanceData1;
  }

  if (Array.isArray(performanceData1.data)) {
    return performanceData1.data;
  }

  if (performanceData1.sheets) {
    return [{
      user_name: performanceData1.user_name || "Me",
      sheets: performanceData1.sheets,
    }];
  }

  return [];
};



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
    
//   useEffect(() => {
//   if (activeTab === "managers") {
//     searchfilter();
//     fetchPerformanceDetails(startDate,endDate)
//   }
// }, [activeTab,startDate,endDate]);



// useEffect(() => {
//   if (activeTab !== "managers") return;
//   if (!selectedUserStack.length) return;

//   fetchPerformanceDetails(
//     currentUserId,
//     startDate,
//     endDate
//   );
// }, [

//   currentUserId,
//   startDate,
//   endDate,
//   selectedUserStack.length,
// ]);

useEffect(() => {
  if (activeTab === "managers") {
    searchfilter();
  }
}, [activeTab]);

useEffect(() => {
  if (activeTab !== "managers") return;

  fetchPerformanceDetails(
    currentUserId ?? null,
    startDate,
    endDate
  );

}, [activeTab, currentUserId, startDate, endDate]);


useEffect(() => {
  // Clear date filters when tab changes
  setStartDate("");
  setEndDate("");
  setDateRange({ start: "", end: "" });

  // Optional: also clear search / viewMode if you want
  setSearchQuery("");
  setViewMode("all");
  setSheetStatus("");

  // Reset selections and pagination
  setSelectedRows([]);
  setSelectedInnerRows([]);
  setExpandedRow(null);
  setCurrentPage(1);

  // If you have project‑specific state:
  if (activeTab !== "projects") {
    setSelectedProject(null);
    setProjectSearch("");
  }
}, [activeTab]);



const flattenUsersFromTree = (node) => {
  if (!node) return [];

  let users = [];

  if (node.sheets?.length) {
    users.push({
      user_name: node.user_name,
      sheets: node.sheets,
    });
  }

  if (node.children?.length) {
    node.children.forEach(child => {
      users = users.concat(flattenUsersFromTree(child));
    });
  }

  return users;
};

useEffect(() => {
  sessionStorage.setItem("pendingSheetsActiveTab", activeTab);
}, [activeTab]);

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
          project_name: new Set(),
          activity_types: new Set(),
          submit_date: null,
        };
      }

      grouped[fullKey].sheets.push(sheet);
      grouped[fullKey].total_hours += getMinutes(sheet.time);

      // ✅ GUARDS (this is what you were missing)
      if (sheet.project_name) {
        grouped[fullKey].project_name.add(sheet.project_name);
      }

      if (sheet.activity_type) {
        grouped[fullKey].activity_types.add(sheet.activity_type);
      }

      // ✅ latest submit date
      if (
        sheet.created_at &&
        (!grouped[fullKey].submit_date ||
          sheet.created_at > grouped[fullKey].submit_date)
      ) {
        grouped[fullKey].submit_date = sheet.created_at;
      }
    });
  });

return Object.values(grouped).map(item => {
  const row = {
    date: item.date,
    user_name: item.user_name,
    total_hours: item.total_hours,
    sheets: item.sheets,

    // 👇 FORCE plain strings
 project_names:
  item.project_name.size
    ? Array.from(item.project_name).join(", ")
    : "—",


    activity_types:
      item.activity_types.size
        ? Array.from(item.activity_types).join(", ")
        : "—",

    submit_date:
      item.submit_date
        ? new Date(item.submit_date).toLocaleString()
        : "—",
  };

  return row;
});

};






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
      fetchPerformanceDetails();
      setSelectedRows([]);
      setShowBulkActions(false);
    } catch (error) {
      console.error("Bulk update error:", error);
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
  { label: "Project(s)", key: "project_names" },
  { label: "Activity Type(s)", key: "activity_types" },
  { label: "Submited At", key: "submit_date" },
  { label: "Total Hours", key: "total_hours" },
  
];





const modalTableColumns = [
  { label: "Project", key: "project_name" },
  { label: "Work Type", key: "work_type" },
  { label: "Activity", key: "activity_type" },
  { label: "Time", key: "time" },
  { label: "Submitted on", key: "created_at" },
  { label: "Status", key: "status" }
];


const getCurrentLevelOptions = (tree, stack) => {
  if (!tree) return [];

  // ROOT → show Sonu’s children (Amit)
  if (stack.length === 0) {
    return (tree.children || []).map(c => ({
      label: c.user_name,
      value: c.user_id,
      children: c.children || [],
    }));
  }

  let current = tree;
  for (const sel of stack) {
    const next = current.children?.find(c => c.user_id === sel.user_id);
    if (!next) return [];
    current = next;
  }

  return (current.children || []).map(c => ({
    label: c.user_name,
    value: c.user_id,
    children: c.children || [],
  }));
};


const shouldShowSheet = (sheet) => {
  const status = sheet.status?.toLowerCase();

  if (viewMode === "approved") {
    return status === "approved";
  }
  if (viewMode === "rejected") {
    return status === "rejected";
  }

  // viewMode === "all": show approved + rejected + backdated
  if (status !== "approved" && status !== "rejected") return false;

  // Optional: still respect "Backdated" toggle
  if (sheetStatus === "backdated" && !sheet.is_backdated) return false;

  return true;
};





useEffect(() => {
  if (activeTab !== "managers") return;
  if (isLoading) return;
  if (!performanceData?.data) return;

  const root = performanceData?.data;
  if (!root) {
    setFilteredData([]);
    return;
  }

  const users = flattenUsersFromTree(root);

  const filteredUsers = users
    .map(user => ({
      user_name: user.user_name,
      sheets: user.sheets.filter(sheet => {
        if (!shouldShowSheet(sheet)) return false;

        if (!isWithinDateRange(sheet.date, startDate, endDate)) return false;

        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          return (
          user.user_name.toLowerCase().includes(q) ||
    sheet.client_name?.toLowerCase().includes(q) ||
    sheet.project_name?.toLowerCase().includes(q) ||     // ✅ ADDED
    sheet.activity_type?.toLowerCase().includes(q) ||    // ✅ ADDED  
    sheet.date.includes(q)
          );
        }

        return true;
      }),
    }))
    .filter(u => u.sheets.length > 0);

  setFilteredData(groupDataByDay(filteredUsers));
}, [
  activeTab,
  performanceData,
  viewMode,
  sheetStatus,
  startDate,
  endDate,
  searchQuery,
]);



useEffect(() => {
  const close = () => setIsReviewOpen(false);
  window.addEventListener("click", close);
  return () => window.removeEventListener("click", close);
}, []);


const fullPath = [
  {
    user_id: userTree?.user_id ?? null,
    user_name: userTree?.user_name || "My Team",
  },
  ...selectedUserStack,
];


const handleBack = () => {
  setSelectedUserStack(prev => {
    const next = prev.slice(0, -1);
    const newId = next.length ? next[next.length - 1].user_id : null;
    setCurrentUserId(newId);
    
    // ✅ REFETCH - Shows fresh data instantly (ManageSheets specific)
    fetchPerformanceDetails(newId, startDate, endDate);
    
    return next;
  });
};


const hasNextLevelUsers =
  activeTab === "managers" &&
  userTree &&
  getCurrentLevelOptions(userTree, selectedUserStack).length > 0;


const formatDate = (date) => {
  return date.toISOString().split("T")[0];
};

const applyDateRange = (start, end) => {
  setDateRange({ start, end });
  setStartDate(start);
  setEndDate(end);
  if (activeTab === "managers") {
    fetchPerformanceDetails(currentUserId, start, end);
  }

  if (activeTab === "projects" ) {
    filtermyproject1({
       project_id: selectedProject?.id ?? null,
       start_date: start,
      end_date: end,
    });
  }
};



const handleToday = () => {
  const today = formatDate(new Date());
  applyDateRange(today, today);
};

const handleYesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const y = formatDate(d);
  applyDateRange(y, y);
};

const handleWeekly = () => {
  const today = new Date();
  const start = new Date();
  start.setDate(today.getDate() - 6);
  applyDateRange(formatDate(start), formatDate(today));
};


const handleClearFilters = () => {
  setSearchQuery("");
  setSheetStatus("");

  setStartDate("");
  setEndDate("");

  setDateRange({ start: "", end: "" });

  setIsCustomMode(false);
  setCurrentPage(1);
  setSelectedRows([]);
  setSelectedInnerRows([]);
  setExpandedRow(null);

  if (activeTab === "managers") {
    fetchPerformanceDetails(currentUserId, "", "");
  }
};
const isWithinDateRange = (sheetDate, start, end) => {
  const d = new Date(sheetDate);
  d.setHours(0,0,0,0);

  if (start) {
    const s = new Date(start);
    s.setHours(0,0,0,0);
    if (d < s) return false;
  }

  if (end) {
    const e = new Date(end);
    e.setHours(0,0,0,0);
    if (d > e) return false;
  }

  return true;
};


useEffect(() => {
  if (activeTab !== "team") return;
  if (!performanceData1) return;

  const users = normalizeTeamUsers(performanceData1)
    .map(user => ({
      user_name: user.user_name,
      sheets: user.sheets.filter(sheet => {
        if (!shouldShowSheet(sheet)) return false;

        if (!isWithinDateRange(sheet.date, startDate, endDate)) return false;

        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          return (
           user.user_name.toLowerCase().includes(q) ||
    sheet.client_name?.toLowerCase().includes(q) ||
    sheet.project_name?.toLowerCase().includes(q) ||     // ✅ ADDED
    sheet.activity_type?.toLowerCase().includes(q) ||    // ✅ ADDED
    sheet.date.includes(q)
          );
        }

        return true;
      }),
    }))
    .filter(u => u.sheets.length > 0);

  setFilteredData(groupDataByDay(users));
}, [
  activeTab,
  performanceData1,
  viewMode,
  sheetStatus,
  startDate,
  endDate,
  searchQuery,
]);


useEffect(() => {
  if (activeTab !== "projects") return;

filterbyproject();
filtermyproject1({});
}, [activeTab]);


useEffect(() => {
  if (activeTab !== "team") return;

  fetchPerformanceDetailsmanage(startDate, endDate);
}, [activeTab, startDate, endDate]);





const handleBulkAction = useCallback(
  async (status, sheets) => {
    const promises = sheets.map(sheet => {
      if (status === "approved") {
        return approvePerformanceSheet(sheet.id);
      } else {
        return rejectPerformanceSheet(sheet.id);
      }
    });
    await Promise.all(promises);
    fetchPerformanceDetails();
  },
  [approvePerformanceSheet, rejectPerformanceSheet, fetchPerformanceDetails]
);


const handleStatusChange = useCallback(async (sheetId, newStatus) => {
  try {
    if (newStatus === "approved") {
      await approvePerformanceSheet(sheetId);
    } else if (newStatus === "rejected") {
      await rejectPerformanceSheet(sheetId);
    }

    if (activeTab === "team") {
      fetchPerformanceDetailsmanage(); // ← reload team data
    } else if (activeTab === "managers") {
      fetchPerformanceDetails(currentUserId, startDate, endDate);
    }
  } catch (error) {
    console.error("Error Updating Sheet Status:", error);
  }
}, [
  approvePerformanceSheet,
  rejectPerformanceSheet,
  fetchPerformanceDetailsmanage,
  fetchPerformanceDetails,
  activeTab,
  currentUserId,
  startDate,
  endDate
]);





useEffect(() => {
  const close = () => setIsProjectOpen(false);
  window.addEventListener("click", close);
  return () => window.removeEventListener("click", close);
}, []);

useEffect(() => {
  if (activeTab !== "projects") return;
  if (!myproject1?.data) {
    setFilteredData([]);
    return;
  }

  const users = normalizeProjectData(myproject1);

  const filteredUsers = users
    .map(user => ({
      user_name: user.user_name,
      sheets: user.sheets.filter(sheet => {
        if (!shouldShowSheet(sheet)) return false;

        if (!isWithinDateRange(sheet.date, startDate, endDate)) return false;

        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          return (
         user.user_name.toLowerCase().includes(q) ||
    sheet.client_name?.toLowerCase().includes(q) ||
    sheet.project_name?.toLowerCase().includes(q) ||     // ✅ FIXED (was only project_name)
    sheet.activity_type?.toLowerCase().includes(q) ||    // ✅ ADDED
    sheet.date.includes(q)
          );
        }

        return true;
      }),
    }))
    .filter(u => u.sheets.length > 0);

  setFilteredData(groupDataByDay(filteredUsers));
}, [
  activeTab,
  myproject1,
  viewMode,
  sheetStatus,
  startDate,
  endDate,
  searchQuery,
]);


useEffect(() => {
  const handleClickOutside = (e) => {
    if (projectRef.current && !projectRef.current.contains(e.target)) {
      setIsProjectOpen(false);
    }
  };
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);



const normalizeProjectData = (projectResponse) => {
  if (!projectResponse?.data?.sheets) return [];

  const projectName = projectResponse.data.project_name;

  const userMap = {};

  projectResponse.data.sheets.forEach(sheet => {
    const userName = sheet.user?.name || "Unknown";

    if (!userMap[userName]) {
      userMap[userName] = {
        user_name: userName,
        sheets: [],
      };
    }

    userMap[userName].sheets.push({
      id: sheet.id,
      date: sheet.data?.date,
      time: sheet.data?.time,
      activity_type: sheet.data?.activity_type,
      project_name: sheet.project_name,
      created_at: sheet.created_at,
      status: sheet.status,
      narration: sheet.data?.narration || "",
    });
  });

  return Object.values(userMap);
};

const tabs = [
  { key: "team", label: "My Team" },
  { key: "projects", label: "My Projects" },
  { key: "managers", label: "Managers" },
];

const visibleTabs = role === "team"
  ? tabs.filter(t => t.key === "Managers")   
  : tabs;                                 




  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-lg h-[calc(100vh-20px)] flex flex-col overflow-y-auto">
      <SectionHeader icon={BarChart} title="Manage Performance Sheet" subtitle="Approved & Rejected sheets only" />
      
<div className="sticky top-0 z-20 backdrop-blur-xl bg-white/70 border-b border-white/20 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">

  {/* 🔹 ROW 1 */}
  <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-2 p-2 items-start">

    <div className="flex flex-wrap items-start gap-3">


      <div className="flex items-center gap-2 px-3 py-2 rounded-xl w-full sm:w-[250px]
        bg-white/60 backdrop-blur border border-gray-200/60
        focus-within:ring-2 focus-within:ring-indigo-500 transition">
        <Search className="h-5 w-5 text-gray-400" />
        <input
          type="text"
          className="w-full bg-transparent outline-none text-sm placeholder-gray-400"
placeholder="Search employee, project, activity, client or date"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>


    </div>

    {/* RIGHT: Filters */}
    <div className="flex flex-wrap items-center gap-2 justify-start lg:justify-end">
  <TodayButton
  onClick={handleToday}
  className="rounded-xl bg-white/70 backdrop-blur border border-gray-200/60"
/>

<YesterdayButton
  onClick={handleYesterday}
  className="rounded-xl bg-white/70 backdrop-blur border border-gray-200/60"
/>

<WeeklyButton
  onClick={handleWeekly}
  className="rounded-xl bg-white/70 backdrop-blur border border-gray-200/60"
/>


      <DateRangePicker
        value={dateRange}
        onChange={(range) => {
          setDateRange(range);
          setIsCustomMode(false);
          applyDateRange(range.start, range.end);
        }}
      />

<ClearButton
  onClick={handleClearFilters}
  className="rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition"
/>
      <ExportButton className="rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition" />
    </div>
  </div>

  {/* 🔹 ROW 2 */}
  <div className="flex items-center justify-between gap-4 px-2 flex-wrap">

    {/* Tabs */}
    <div className="flex gap-1 bg-white/60 backdrop-blur p-1 rounded-xl border border-gray-200/60">
      {visibleTabs.map(tab=> (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition
            ${activeTab === tab.key
              ? "bg-indigo-600 text-white shadow"
              : "text-gray-600 hover:bg-white"
            }`}
        >
          {tab.label}
        </button>
      ))}
    </div>

{activeTab === "managers" && userTree && (
  <div className="relative flex items-center gap-3 px-4 ">

    {/* ⬅ Back button */}
    {selectedUserStack.length > 0 && (
      <button
        onClick={handleBack}
        className="px-2 py-1 rounded-lg text-indigo-600
          hover:bg-indigo-50 transition"
        title="Go back"
      >
        ←
      </button>
    )}

    {/* Breadcrumb */}
    <div className="flex items-center gap-1 text-sm font-medium text-gray-700 overflow-x-auto">
      {fullPath.map((item, idx) => (
        <span key={item.user_id ?? idx} className="flex items-center">
          <span
            className={
              idx === fullPath.length - 1
                ? "font-semibold text-gray-900"
                : "text-gray-500"
            }
          >
            {item.user_name}
          </span>
          {idx < fullPath.length - 1 && (
            <span className="mx-1 text-gray-400">{">"}</span>
          )}
        </span>
      ))}
    </div>

{hasNextLevelUsers && (
  <div className="relative ml-3 w-[220px]">
    {/* Trigger */}
    <button
      onClick={(e) => {
        e.stopPropagation();
        setIsReviewOpen((p) => !p);
      }}
      className="
        w-full flex items-center justify-between
        px-3 py-1.5
        rounded-xl
        border border-gray-300
        bg-white
        text-sm text-gray-700
        hover:border-indigo-400
        focus:ring-2 focus:ring-indigo-500
        transition
      "
    >
      <span className="truncate text-gray-600">
        Select team member
      </span>
      <ChevronDown
        className={`w-4 h-4 transition-transform ${
          isReviewOpen ? "rotate-180" : ""
        }`}
      />
    </button>

    {/* Dropdown */}
    {isReviewOpen && (
      <div
        className="
          absolute left-0 top-full mt-2
          z-40 w-full
          rounded-t-2xl
          bg-white
          border border-gray-200
          shadow-xl
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search */}
        <div className="p-2 border-b">
          <input
            type="text"
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            placeholder="Search user..."
            className="
              w-full px-3 py-1.5
              text-sm
              rounded-lg
              border border-gray-300
              focus:outline-none
              focus:ring-2 focus:ring-indigo-500
            "
          />
        </div>

        {/* Options */}
        <div className="max-h-[220px] overflow-y-auto">
          {getCurrentLevelOptions(userTree, selectedUserStack)
            .filter(opt =>
              opt.label.toLowerCase().includes(userSearch.toLowerCase())
            )
            .map(opt => (
              <button
                key={opt.value}
                onClick={() => {
                  setSelectedUserStack(prev => [
                    ...prev,
                    { user_id: opt.value, user_name: opt.label },
                  ]);
                  setCurrentUserId(opt.value);
                  setUserSearch("");
                  setIsReviewOpen(false);
                }}
                className="
                  w-full flex items-center justify-between
                  px-4 py-1.5
                  text-sm text-gray-700
                  hover:bg-indigo-50
                  transition
                "
              >
                <span className="truncate">{opt.label}</span>
                <span className="text-gray-400">›</span>
              </button>
            ))}

          {getCurrentLevelOptions(userTree, selectedUserStack).length === 0 && (
            <p className="px-4 py-3 text-xs text-gray-400 text-center">
              No users found
            </p>
          )}
        </div>
      </div>
    )}
  </div>
)}



  </div>
)}
{activeTab === "projects" && (
  <div ref={projectRef} className="relative w-[240px]">

    <button
  onClick={(e) => {
    e.stopPropagation();        
    setIsProjectOpen(p => !p);
  }}      className="
        w-full flex items-center justify-between
        px-3 py-1.5 rounded-xl
        border border-gray-300
        bg-white text-sm text-gray-700
        hover:border-indigo-400
        focus:ring-2 focus:ring-indigo-500
      "
    >
      <span className="truncate">
        {selectedProject?.project_name || "Select project"}
      </span>
      <ChevronDown
        className={`w-4 h-4 transition-transform ${
          isProjectOpen ? "rotate-180" : ""
        }`}
      />
    </button>

    {/* Dropdown */}
    {isProjectOpen && (
      <div
        className="
          absolute left-0 top-full mt-2 z-40 w-full
          rounded-t-2xl bg-white
          border border-gray-200 shadow-xl
        "
            onClick={(e) => e.stopPropagation()}   

      >
        {/* Search */}
        <div className="p-2 border-b">
          <input
            type="text"
            value={projectSearch}
              onClick={(e) => e.stopPropagation()}  
            onChange={(e) => setProjectSearch(e.target.value)}
            placeholder="Search project..."
            className="
              w-full px-3 py-2 text-sm
              rounded-lg border border-gray-300
              focus:ring-2 focus:ring-indigo-500
            "
          />
        </div>

        {/* Options */}
        <div className="max-h-[220px] overflow-y-auto">
          {filterProjects
            ?.filter(p =>
              p.project_name
                .toLowerCase()
                .includes(projectSearch.toLowerCase())
            )
            .map(project => (
             <button
  key={project.id}
  onClick={() => {
    setSelectedProject(project);
    setIsProjectOpen(false);
    setProjectSearch("");

    filtermyproject1({
      project_id: project.id,
      start_date: startDate,
      end_date: endDate,
    });
  }}
  className="w-full px-4 py-2 text-sm text-left hover:bg-indigo-50"
>
  {project.project_name}
</button>

            ))}

          {filterProjects?.length === 0 && (
            <p className="px-4 py-3 text-xs text-gray-400 text-center">
              No projects found
            </p>
          )}
        </div>
      </div>
    )}
     {selectedProject && (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          clearSelectedProject();
        }}
         className="absolute right-8 top-1/2 -translate-y-1/2
      w-8 h-8 flex items-center justify-center
      text-red-600 hover:text-gray-600
      rounded-full hover:bg-gray-100
      text-lg font-bold"
    title="Clear selected project"
  >
        ×
      </button>
    )}
  </div>
)}

<div className="flex bg-white/60 backdrop-blur p-1 rounded-xl border border-gray-200/60">
  {["all", "approved", "rejected"].map(mode => (
    <button
      key={mode}
      onClick={() => {
        setViewMode(mode);
        // Optional: also reset sheetStatus if you still use it
        setSheetStatus(mode === "all" ? "" : mode);
      }}
      className={`px-4 py-2 rounded-lg text-sm font-semibold transition
        ${viewMode === mode
          ? "bg-white shadow text-indigo-600"
          : "text-gray-500 hover:text-gray-700"
        }`}
    >
      {mode === "all" ? "All" : mode.charAt(0).toUpperCase() + mode.slice(1)}
    </button>
  ))}
</div>


    {/* Pending / Backdated */}
   
  </div>

  {/* 🔹 ROW 3 */}
  <div className="px-2 py-2 grid grid-cols-1 md:grid-cols-3 gap-2">
    <div className="relative overflow-hidden rounded-md p-2
      bg-gradient-to-br from-yellow-50 to-yellow-100/70
      border border-yellow-200/60 shadow-sm">
      <div className="text-lg font-bold text-yellow-800">
        {getPendingTime()}
      </div>
      <div className="text-xs text-yellow-700">
        Total Hours
      </div>
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
  onRowClick={undefined}
  canEdit={canAddEmployee && activeTab==="team"|| activeTab==="manager"}
  editMode={editMode}
  onEditToggle={toggleEditMode}

  enableHeaderBulkActions={true}
  isAllSelected={isCurrentPageFullySelected}
    /* onStatusChange={async (sheetId, status) => {
    if (status === "approved") {
      await approvePerformanceSheet(sheetId);
    } else {
      await rejectPerformanceSheet(sheetId);
    }
    fetchPerformanceDetails();
  }} */
  onStatusChange={handleStatusChange}

  onHeaderSelectAll={handleSelectAllDays}
  onHeaderBulkApprove={() => handleBulkStatusChange("approved")}
  onHeaderBulkReject={() => handleBulkStatusChange("rejected")}

  showTotalHoursArrow={true}
  mainTableBulkActionsOnly={true}
 
onBulkAction={async (action, sheets) => {
  try {
    const promises = sheets.map(s =>
      action === "approved"
        ? approvePerformanceSheet(s.id)
        : rejectPerformanceSheet(s.id)
    );
    await Promise.all(promises);

    if (activeTab === "team") {
      fetchPerformanceDetailsmanage();
    } else if (activeTab === "managers") {
      fetchPerformanceDetails(currentUserId, startDate, endDate);
    }
  } catch (err) {
    console.error("Bulk action failed", err);
  }
}}


  emptyStateTitle="No pending sheets"
  emptyStateMessage="No pending sheets found"
/>


 {/* <GlobalTable02
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
/> */}

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
