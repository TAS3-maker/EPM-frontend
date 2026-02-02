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
    // const { userProjects, error, editPerformanceSheet, performanceSheets, loading, fetchPerformanceSheets,deletesheet } = useUserContext();
  
  const { pendingPerformanceData, fetchPendingPerformanceDetails, isLoading, approvePerformanceSheet, rejectPerformanceSheet,currentUserId,setCurrentUserId,selectedUserStack ,setSelectedUserStack,searchfilter,userTree,setUserTree,fetchPendingPerformance,pendingPerformance,myproject,filtermyproject,filterbyproject,filterProjects} = useBDProjectsAssigned();
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

const [sheetStatus, setSheetStatus] = useState("pending"); 

const [isReviewOpen, setIsReviewOpen] = useState(false);
const [userSearch, setUserSearch] = useState("");

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



  const closeDayDetails = () => {
    setDayDetailModalOpen(false);
    setSelectedDayDetails(null);
    setSelectedRows([]);
  };


useEffect(() => {
  if (activeTab === "projects") {
    fetchPendingPerformanceDetails(currentUserId);
  }
}, [activeTab, currentUserId]);

 
const normalizeTeamUsers = (pendingPerformance) => {
  if (!pendingPerformance) return [];

  if (Array.isArray(pendingPerformance)) {
    return pendingPerformance;
  }

  if (Array.isArray(pendingPerformance.data)) {
    return pendingPerformance.data;
  }

  if (pendingPerformance.sheets) {
    return [{
      user_name: pendingPerformance.user_name || "Me",
      sheets: pendingPerformance.sheets,
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

  useEffect(() => {
  if (activeTab === "managers") {
    searchfilter();
  }
}, [activeTab]);
useEffect(() => {
  if (activeTab !== "managers") return;

  fetchPendingPerformanceDetails(
    currentUserId,
    startDate,
    endDate
  );
}, [
  activeTab,
  currentUserId,
  startDate,
  endDate,
]);



useEffect(() => {
  setFilteredData([]);
  setSelectedRows([]);
  setSelectedInnerRows([]);
  setExpandedRow(null);
  setCurrentPage(1);
  if (activeTab !== "managers") {
    setSelectedUserStack([]);
    setCurrentUserId(null);
    setIsReviewOpen(false);
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
useEffect(() => {
 if (activeTab !== "managers") return;
  if (isLoading) return;
  if (!pendingPerformanceData?.data) return;

  const root = pendingPerformanceData?.data;
  if (!root) {
    setFilteredData([]);
    return;
  }

  const users = flattenUsersFromTree(root);

  const filteredUsers = users
    .map(user => ({
      user_name: user.user_name,
sheets: user.sheets.filter(sheet => {
  if (sheetStatus === "pending") {
    if (sheet.status !== "pending" || sheet.is_backdated) return false;
  }

  if (sheetStatus === "backdated") {
    if (!sheet.is_backdated) return false;
  }

  if (!isWithinDateRange(sheet.date, startDate, endDate)) return false;

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    return (
      user.user_name.toLowerCase().includes(q) ||
      sheet.client_name?.toLowerCase().includes(q) ||
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
  pendingPerformanceData,
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
    setCurrentUserId(next.length ? next[next.length - 1].user_id : null);
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

  setStartDate(prev => (prev === start ? `${start}` : start));
  setEndDate(prev => (prev === end ? `${end}` : end));

if (activeTab === "managers") {
  fetchPendingPerformanceDetails(currentUserId, start, end);
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
  setSheetStatus("pending");

  setStartDate("");
  setEndDate("");

  setDateRange({ start: "", end: "" });

  setIsCustomMode(false);
  setCurrentPage(1);
  setSelectedRows([]);
  setSelectedInnerRows([]);
  setExpandedRow(null);

  if (activeTab === "managers") {
    fetchPendingPerformanceDetails(currentUserId, "", "");
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
  if (!pendingPerformance) return;

  const users = normalizeTeamUsers(pendingPerformance)
    .map(user => ({
      user_name: user.user_name,
      sheets: user.sheets.filter(sheet => {
        if (sheetStatus === "pending" && sheet.status !== "pending") return false;
        if (sheetStatus === "backdated" && !sheet.is_backdated) return false;
        if (!isWithinDateRange(sheet.date, startDate, endDate)) return false;

        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          return (
            user.user_name.toLowerCase().includes(q) ||
            sheet.client_name?.toLowerCase().includes(q) ||
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
  pendingPerformance,
  sheetStatus,
  startDate,
  endDate,
  searchQuery,
]);


useEffect(() => {
  if (activeTab !== "projects") return;

filterbyproject();
}, [activeTab]);


useEffect(() => {
  if (activeTab !== "team") return;

  fetchPendingPerformance({
    startDate,
    endDate,
  });
}, [activeTab, startDate, endDate]);




useEffect(() => {
  if (activeTab !== "team") return;

  const users = normalizeTeamUsers(pendingPerformance);
  if (!users.length) return;

  const allDates = users.flatMap(user =>
    user.sheets.map(sheet => new Date(sheet.date))
  );

  if (!allDates.length) return;

  const minDate = new Date(Math.min(...allDates));
  const maxDate = new Date(Math.max(...allDates));

  applyDateRange(
    minDate.toISOString().split("T")[0],
    maxDate.toISOString().split("T")[0]
  );
}, [pendingPerformance, activeTab]);


useEffect(() => {
  const close = () => setIsProjectOpen(false);
  window.addEventListener("click", close);
  return () => window.removeEventListener("click", close);
}, []);

useEffect(() => {
  if (activeTab !== "projects") return;
  if (!myproject?.data) {
    setFilteredData([]);
    return;
  }

  const users = normalizeProjectData(myproject);

  console.log("✅ Normalized project users:", users);

  setFilteredData(groupDataByDay(users));
}, [activeTab, myproject]);

useEffect(() => {
  const handleClickOutside = (e) => {
    if (projectRef.current && !projectRef.current.contains(e.target)) {
      setIsProjectOpen(false);
    }
  };
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);

useEffect(() => {
  if (activeTab !== "projects") return;
  if (!selectedProject) return;

  console.log("📅 Project date change:", startDate, endDate);

  filtermyproject({
    project_id: selectedProject.id,
    start_date: startDate,
    end_date: endDate,
  });
}, [activeTab, selectedProject, startDate, endDate]);

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
      project_name: projectName,
      created_at: sheet.created_at,
      status: sheet.status,
    });
  });

  return Object.values(userMap);
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
          applyDateRange(range.start, range.end);
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

{activeTab === "managers" && userTree && (
  <div className="relative flex items-center gap-3 px-4 pb-3">

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
        px-3 py-2
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
          rounded-2xl
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
              w-full px-3 py-2
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
                  px-4 py-2
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
        px-3 py-2 rounded-xl
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
          rounded-2xl bg-white
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

    filtermyproject({
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
  </div>
)}

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
}
}