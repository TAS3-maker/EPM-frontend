import React, { useEffect, useMemo, useState ,useRef} from "react";
import { BarChart } from "lucide-react";
import GlobalTable from "../../../components/GlobalTable";
import { SectionHeader } from "../../../components/SectionHeader";
import { useClient } from "../../../context/ClientContext";
import { useProjectMaster } from "../../../context/ProjectMasterContext";
import { useEmployees } from "../../../context/EmployeeContext";
import { useActivity } from "../../../context/ActivityContext";
import SearchableSelect from "../../../components/SearchableSelect";
import DateRangePicker from "../../../components/DateRangePicker";
import { API_URL } from "../../../utils/ApiConfig";
import { useTeam } from "../../../context/TeamContext";
import MetricsGrid from "../../../components/MetricsGrid";
import Pagination from "../../../components/Pagination";
import { useDepartment } from "../../../context/DepartmentContext";
import { useMasterReporting } from "../../../context/MasterReportingContext";
import { Check, X, Pencil } from "lucide-react";
import { useBDProjectsAssigned } from "../../../context/BDProjectsassigned";
import { useAlert } from "../../../context/AlertContext";
import GlobalTable02 from "../../../components/GlobalTable02";
import { usePermissions } from "../../../context/PermissionContext";
import { ExportButton } from "../../../../components/AllButtons/AllButtons";
import { exportToExcel } from "../../../components/excelUtils";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const MasterReporting = () => {
//   const { fetchClients, clients, isLoading: isClientLoading } = useClient();
//   const { fetchProjectMasterName, projectMastersName, isLoading: isProjectLoading } =
//     useProjectMaster();
//   const { fetchEmployees, employees, isLoading: isEmployeeLoading } = useEmployees();
//   const { getActivityTags, activityTags } = useActivity();
//     const { fetchTeams, teams } = useTeam();
 const { masterData, loading:isMasterLoading , fetchMasterData } = useMasterReporting();
 const  {approvePerformanceSheet, rejectPerformanceSheet } = useBDProjectsAssigned();

    const { showAlert } = useAlert(); 

        // const { fetchDepartment, department } = useDepartment();

const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 10;
const [activeView, setActiveView] = useState("sheets"); 
const [selectedSheet, setSelectedSheet] = useState(null);
const [isSheetModalOpen, setIsSheetModalOpen] = useState(false);
const [selectedProject, setSelectedProject] = useState(null);
const [selectedUser, setSelectedUser] = useState(null);
const [showOtherProjects, setShowOtherProjects] = useState(false);
const [projectSearch, setProjectSearch] = useState("");
const [userSearch, setUserSearch] = useState("");
const [actionLoadingId, setActionLoadingId] = useState(null);
// const [editingRow, setEditingRow] = useState(null);
const otherProjectsRef = useRef(null);
const filtersAreaRef = useRef(null);
const [tempDate, setTempDate] = useState({
  start: "",
  end: "",
});
const [activeFilters, setActiveFilters] = useState(() => {
  const saved = localStorage.getItem("master-report-active-filters");
  return saved ? JSON.parse(saved) : [];
});
const [rawSheets, setRawSheets] = useState([]);

 const { permissions } = usePermissions()
const sheetsTableRef = useRef(null);
const [apiSummary, setApiSummary] = useState(null);
const [showUnfilledModal, setShowUnfilledModal] = useState(false);
const [selectedUnfilledUser, setSelectedUnfilledUser] = useState(null);
// const [activeFilters, setActiveFilters] = useState([]);
const [isAddOpen, setIsAddOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [reportData, setReportData] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const addFilterRef = useRef(null);
  const [globalSearch, setGlobalSearch] = useState("");
const [metricFilter, setMetricFilter] = useState(null);
const [editingRow, setEditingRow] = useState(null);
const [expandedRow, setExpandedRow] = useState(null);
  const employeePermission = permissions?.permissions?.[0]?.pending_sheets_inside_performance_sheets;
const [selectedRows, setSelectedRows] = useState([]);
const [editMode, setEditMode] = useState({});
  const canAddEmployee = employeePermission === "2";

const toggleRow = (id) => {
  setExpandedRow(prev => (prev === id ? null : id));
};

const defaultFilters = {
  employee: [],
  project: [],
  client: [],
  activity: [],
  team: [],
  department: [],
  status: [],
  startDate: "",
  endDate: "",
};

const [filters, setFilters] = useState(() => {
  const saved = localStorage.getItem("master-report-filters");
  return saved ? JSON.parse(saved) : defaultFilters;
});

const [notFilledData, setNotFilledData] = useState({
  count: 0,
  users: [],
});

const isLoadingFinal = isLoading || isMasterLoading;

const employees = useMemo(
  () => masterData?.employees || [],
  [masterData]
);

const teams = useMemo(
  () => masterData?.teams || [],
  [masterData]
);

const clients = useMemo(
  () =>
    (masterData?.clients || []).map(c => ({
      id: c.id,
      name: c.client_name,
    })),
  [masterData]
);

const projects = useMemo(
  () =>
    (masterData?.projects || []).map(p => ({
      id: p.id,
      project_name: p.project_name,
    })),
  [masterData]
);

const departments = useMemo(
  () => masterData?.departments || [],
  [masterData]
);

const activityTags = useMemo(
  () => masterData?.activity_tags || [],
  [masterData]
);


// const status = useMemo(
//   () => masterData?.status || [],
//   [masterData]
// );



const timeToDecimal = (time = 0) => {

  if (typeof time === "number") {
    return Number((time / 60).toFixed(1));
  }

  const [h = 0, m = 0] = time.split(":").map(Number);
  return Number((h + m / 60).toFixed(1));
};


const timeToHours = (time = 0) => {

  // ✅ If already minutes (number)
  if (typeof time === "number") {
    return time / 60;
  }

  // ✅ If string "HH:mm"
  if (typeof time === "string") {
    const [h = 0, m = 0] = time.split(":").map(Number);
    return h + m / 60;
  }

  return 0;
};


const teamSummaryFromSheets = useMemo(() => {
  let pending = 0;
  let rejected = 0;
  // let backdated = 0;

  reportData.forEach((row) => {
    const hours = timeToHours(row.time);

    if (row.status === "pending") pending += hours;
    if (row.status === "rejected") rejected += hours;
    // if (row.status === "backdated") backdated += hours;
  });

  return {
    pending: Number(pending.toFixed(1)),
    rejected: Number(rejected.toFixed(1)),
    // backdated: Number(backdated.toFixed(1)),
  };
}, [reportData]);


const calculatedSummary = useMemo(() => {
  let billable = 0;
  let inhouse = 0;
  let noWork = 0;
  let pending = 0;
  let rejected = 0;
  // let backdated = 0;

  reportData.forEach(row => {
    const hours = timeToHours(row.time);
    const activity = row.activity_type?.toLowerCase();
    const status = row.status;

    if (status === "approved") {
      if (activity === "billable") billable += hours;
      if (activity === "in-house") inhouse += hours;
      if (activity === "no work") noWork += hours;
    }

    if (status === "pending") pending += hours;
    if (status === "rejected") rejected += hours;
    // if (status === "backdated") backdated += hours;
  });

  return {
    billable: +billable.toFixed(1),
    inhouse: +inhouse.toFixed(1),
    noWork: +noWork.toFixed(1),
    pending: +pending.toFixed(1),
    rejected: +rejected.toFixed(1),
    // backdated: +backdated.toFixed(1),
  };
}, [reportData]);

const teamSummary = useMemo(() => {
  const totalApproved =
    calculatedSummary.billable +
    calculatedSummary.inhouse +
    calculatedSummary.noWork;

  const utilization =
    totalApproved === 0
      ? 0
      : Math.round(
          ((calculatedSummary.billable + calculatedSummary.inhouse) /
            totalApproved) *
            100
        );

  return {
    ...calculatedSummary,
    utilization,
  };
}, [calculatedSummary]);


const notFilledUsers = notFilledData.users || [];




//   /* ---------------- INITIAL LOAD ---------------- */
//   useEffect(() => {
    // fetchClients();
    // fetchProjectMasterName();
    // fetchEmployees();
    // getActivityTags();
    //   fetchTeams(); 
    //   fetchDepartment();
//   }, []);

  /* ---------------- API INTEGRATION ---------------- */
useEffect(() => {
  fetchReportData();
}, [
  refreshKey,   // ⭐ ADD THIS
  filters.employee,
  filters.project,
  filters.client,
  filters.activity,
  filters.team,
  filters.department,
  filters.startDate,
  filters.endDate,
  filters.status,
]);


const fetchReportData = async () => {

  setIsLoading(true);
  const token = localStorage.getItem("userToken");

  try {

    const params = new URLSearchParams();
    const appendArray = (key, arr) => {
      if (Array.isArray(arr) && arr.length) {
        params.append(key, arr.join(","));
      }
    };

    appendArray("user_id", filters.employee);
    appendArray("client_id", filters.client);
    appendArray("activity_tag", filters.activity);
    appendArray("project_id", filters.project);
    appendArray("team_id", filters.team);
    appendArray("department_id", filters.department);
    appendArray("status", filters.status);

    if (filters.startDate) params.append("start_date", filters.startDate);
    if (filters.endDate) params.append("end_date", filters.endDate);

    const response = await fetch(
      `${API_URL}/api/users-all-sheets-data-reporting?${params.toString()}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const result = await response.json();

    setApiSummary(result?.data?.summary || null);
    setNotFilledData(result?.data?.not_filled || { count: 0, users: [] });

    const users = result?.data?.users || [];


    const normalized = users.flatMap((user) =>
  (user.sheets || []).map((sheet, i) => ({
    id: sheet.id || `${user.user_id}_${i}`,


    ...sheet,

    user_name: user.user_name,
    employee_name: user.user_name,

    employee_id: user.user_id,

    team_name: Array.isArray(user.team_names)
      ? user.team_names.join(", ")
      : "—",

    project_name: sheet.project_name || "—",
    client_name: sheet.client_name || "—",
    activity_type: sheet.activity_type || "—",


    time: sheet.time,   

    status: sheet.status?.toLowerCase()?.trim(),

    sheets: [sheet], 
  }))
);


    setRawSheets(normalized);

    // OPTIONAL if still grouping
    const grouped = groupSheetsByDayEmployee(users);
    setReportData(grouped);

  } catch (error) {
    console.error("Reporting API error:", error);
    setReportData([]);
  } finally {
    setIsLoading(false);
  }
};


const formatDateTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);
  if (isNaN(date)) return "—";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};


useEffect(() => {
  setCurrentPage(1);
}, [searchText, filters]);



const noWorkMap = useMemo(() => {
  const map = {};

  reportData.forEach((row) => {
    if (row.status !== "approved") return;

    const key = `${row.employee_id}_${row.date}`;
    const hours = timeToHours(row.time);

    map[key] = (map[key] || 0) + hours;
  });

  return map; 
}, [reportData]);


const isSearching = globalSearch.trim().length > 0;


const filteredData = useMemo(() => {

let data = reportData;




  if (metricFilter) {
    data = data.filter((row) => {
      const activity = (row.activity_type || "").toLowerCase();
      const status = row.status;

      switch (metricFilter) {
        case "approved_billable":
          return status === "approved" && activity.includes("billable");

        case "approved_inhouse":
          return status === "approved" && activity.includes("in-house");

        case "no_work":
          return status === "approved" && activity.includes("no work");

        case "pending":
          return status === "pending";

        case "rejected":
          return status === "rejected";

        default:
          return true;
      }
    });
  }

  return data;

}, [reportData, rawSheets, globalSearch, metricFilter]);

const hasActionableSheets = (row) => {
  if (!Array.isArray(row.sheets)) return false;

  return row.sheets.some(s => {
    const status = s.status?.toLowerCase()?.trim();
    return status !== "rejected";
  });
};



const searchedData = useMemo(() => {
  const q = globalSearch.trim().toLowerCase();
  if (!q) return filteredData;

  return filteredData
    .map((row) => {

      // ✅ keep only matching sheets
      const matchedSheets = row.sheets?.filter(sheet =>
        [
          sheet.project_name,
          sheet.client_name,
          sheet.activity_type,
          sheet.status,
          sheet.time,
          sheet.date,
        ]
          .filter(Boolean)
          .some(val =>
            String(val).toLowerCase().includes(q)
          )
      );

      // allow employee/team search
      const rowMatch =
        row.employee_name?.toLowerCase().includes(q) ||
        row.team_name?.toLowerCase().includes(q);

      if (rowMatch) return row;

      if (!matchedSheets?.length) return null;

      // ✅ rebuild packet from matched sheets
      const projectNames = new Set();
      const clientNames = new Set();
      const activityTypes = new Set();

      let totalMinutes = 0;

      matchedSheets.forEach(s => {
        projectNames.add(s.project_name);
        clientNames.add(s.client_name);
        activityTypes.add(s.activity_type);

        const [h, m] = s.time.split(":").map(Number);
        totalMinutes += h * 60 + m;
      });

      return {
        ...row,
        sheets: matchedSheets,
        project_name: [...projectNames].join(", "),
        client_name: [...clientNames].join(", "),
        activity_type: [...activityTypes].join(", "),
        time: totalMinutes,
      };
    })
    .filter(Boolean);

}, [filteredData, globalSearch]);


const totalPages = Math.ceil(searchedData.length / itemsPerPage);

const paginatedData = useMemo(() => {
  const start = (currentPage - 1) * itemsPerPage;
  const end = currentPage * itemsPerPage;
  return searchedData.slice(start, end);
}, [searchedData, currentPage]);


const handleCancelEdit = (e) => {
  e.stopPropagation();
  setEditingRow(null);
};

const handleRowSelect = (dayKey) => {
  setSelectedRows(prev =>
    prev.includes(dayKey)
      ? prev.filter(id => id !== dayKey)
      : [...prev, dayKey]
  );
};

const handleSelectAll = () => {

const selectableKeys = searchedData
  .filter(hasActionableSheets)
  .map(d => `${d.date}_${d.user_name}`);


  setSelectedRows(prev =>
    prev.length === selectableKeys.length
      ? []
      : selectableKeys
  );
};


const selectableRows = paginatedData.filter(hasActionableSheets);

const isAllSelected =
  selectableRows.length > 0 &&
  selectableRows.every(d =>
    selectedRows.includes(`${d.date}_${d.user_name}`)
  );



const columns = [
  { key: "user_name", label: "Employee", width: "160px" },
  { key: "team_name", label: "Team", width: "140px" },

  { key: "project_name", label: "Project", width: "220px" },
  { key: "client_name", label: "Client", width: "180px" },
  { key: "activity_type", label: "Activity", width: "180px" },

  { key: "time", label: "Hours", width: "90px" },
  { key: "date", label: "Date", width: "120px" },
  { key: "status", label: "Sheet Status", width: "140px" },
];

const handleEditToggle = (dayKey) => {
  setEditMode(prev => ({
    ...prev,
    [dayKey]: !prev[dayKey]
  }));
};



const handleHeaderBulkApprove = async () => {

const rowsToUpdate = searchedData.filter(d => {
  const dayKey = `${d.date}_${d.user_name}`;

  return (
    selectedRows.includes(dayKey) ||
    selectedRows.includes(d.id)
  );
});


  const sheets = getActionableSheets(rowsToUpdate);

  if (!sheets.length) return;

  await handleBulkAction("approved", sheets);
};



const handleHeaderBulkReject = async () => {

const rowsToUpdate = searchedData.filter(d => {
  const dayKey = `${d.date}_${d.user_name}`;

  return (
    selectedRows.includes(dayKey) ||
    selectedRows.includes(d.id)
  );
});


  const sheets = getActionableSheets(rowsToUpdate);

  if (!sheets.length) return;

  await handleBulkAction("rejected", sheets);
};




// {
//   key: "actions",
//   label: "Action",
//   render: (row) => {
//     const isEditing = editingRow === row.id;
//     const status = row.status?.toLowerCase();

//     /* ================= PENDING ================= */
//     if (status === "pending") {
//       return (
//         <div className="flex items-center gap-2">
//           <button
//             disabled={actionLoadingId === row.id}
//             onClick={(e) => {
//               e.stopPropagation();
//               handleApprove(row);
//             }}
//             className="p-1 rounded-lg bg-green-100 hover:bg-green-200 disabled:opacity-50"
//           >
//             <Check size={16} className="text-green-700" />
//           </button>

//           <button
//             disabled={actionLoadingId === row.id}
//             onClick={(e) => {
//               e.stopPropagation();
//               handleReject(row);
//             }}
//             className="p-1 rounded-lg bg-red-100 hover:bg-red-200 disabled:opacity-50"
//           >
//             <X size={16} className="text-red-700" />
//           </button>
//         </div>
//       );
//     }

//     /* ================= EDIT MODE ================= */
//     if (isEditing) {
//       return (
//         <div className="flex items-center gap-2">
//           <button
//             disabled={actionLoadingId === row.id}
//             onClick={(e) => {
//               e.stopPropagation();
//               handleApprove(row);
//             }}
//             className="p-1 rounded-lg bg-green-100 hover:bg-green-200"
//           >
//             <Check size={16} className="text-green-700" />
//           </button>

//           <button
//             disabled={actionLoadingId === row.id}
//             onClick={(e) => {
//               e.stopPropagation();
//               handleReject(row);
//             }}
//             className="p-1 rounded-lg bg-red-100 hover:bg-red-200"
//           >
//             <X size={16} className="text-red-700" />
//           </button>

//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               setEditingRow(null);
//             }}
//             className="px-2 py-1 text-xs rounded-lg bg-gray-200 hover:bg-gray-300"
//           >
//             Cancel
//           </button>
//         </div>
//       );
//     }

//     /* ================= APPROVED / REJECTED ================= */
//     return (
//       <div className="flex items-center gap-2">
//         <span
//           className={`text-xs font-semibold ${
//             status === "approved" ? "text-green-600" : "text-red-600"
//           }`}
//         >
//           {status}
//         </span>

//         <button
//           onClick={(e) => {
//             e.stopPropagation();
//             setEditingRow(row.id);
//           }}
//           className="p-1 rounded-lg bg-blue-100 hover:bg-blue-200"
//         >
//           <Pencil size={14} className="text-blue-700" />
//         </button>
//       </div>
//     );
//   },
// }


useEffect(() => {
  localStorage.setItem(
    "master-report-filters",
    JSON.stringify(filters)
  );
}, [filters]);

const resetFilters = () => {
  localStorage.removeItem("master-report-filters");

  setSearchText("");

  setFilters(defaultFilters);

  setMetricFilter(null);
  setSelectedProject(null);
  setSelectedUser(null);
  setShowOtherProjects(false);
  setProjectSearch("");
  setUserSearch("");
};


const metricToFilters = {
  approved_billable: {
    status: ["approved"],
    activityName: "Billable",
  },
  approved_inhouse: {
    status: ["approved"],
    activityName: "In-House",
  },
  no_work: {
    status: ["approved"],
    activityName: "No Work",
  },
  pending: {
    status: ["pending"],
  },
  rejected: {
    status: ["rejected"],
  },
  // backdated: {
  //   status: ["backdated"],
  // },
};



const metricsConfig = [
    {
    key: "expected",
    label: "Expected Hours",
    value: timeToHours(apiSummary?.expected || "00:00"),
    tone: "indigo"
  },
 {
    key: "approved_billable",
    label: "Approved Billable",
    value: timeToHours(apiSummary?.billable || "00:00"),
    tone: "green"
  },
  {
    key: "approved_inhouse",
    label: "Approved Inhouse",
    value: timeToHours(apiSummary?.inhouse || "00:00"),
    tone: "violet"
  },
  {
    key: "no_work",
    label: "Approved No Work",
    value: timeToHours(apiSummary?.no_work || "00:00"),
    tone: "rose"
  },
{
  key: "pending",
  label: "Pending Hours",
  value: timeToHours(apiSummary?.pending || "00:00"),
  tone: "amber"
},

    // { key: "backdated", label: "Backdated Hours", value: teamSummary.backdated, tone: "orange" },
{
  key: "rejected",
  label: "Rejected Hours",
  value: timeToHours(apiSummary?.rejected || "00:00"),
  tone: "gray"
},
    {
    key: "unfilled",
    label: "Unfilled Sheets",
    value: notFilledUsers.length,
    tone: "red",
    type: "count"
  },

  { key: "utilization", type: "utilization", value: teamSummary.utilization }
];

useEffect(() => {
  if (selectedProject && selectedUser && sheetsTableRef.current) {
    setTimeout(() => {
      sheetsTableRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };
  setAnalyticsPage(1);
}, [selectedProject, selectedUser]);


const [analyticsPage, setAnalyticsPage] = useState(1);
const analyticsItemsPerPage = 8;

const analyticsTableData = useMemo(() => {
  if (!selectedProject || !selectedUser) return [];

  return rawSheets.filter(sheet =>
    selectedProject.name === sheet.project_name &&
    sheet.employee_name === selectedUser
  );

}, [rawSheets, selectedProject, selectedUser]);


const analyticsTotalPages = Math.ceil(
  analyticsTableData.length / analyticsItemsPerPage
);

const analyticsPaginatedData = useMemo(() => {
  const start = (analyticsPage - 1) * analyticsItemsPerPage;
  const end = start + analyticsItemsPerPage;
  return analyticsTableData.slice(start, end);
}, [analyticsTableData, analyticsPage]);



  
useEffect(() => {
  fetchMasterData(filters);
}, [
    refreshKey,
  filters.employee,
  filters.project,
  filters.client,
  filters.team,
  filters.department,
  filters.activity,
  filters.status
]);



const utilizationData = useMemo(() => {
  const map = {};

  reportData.forEach((row) => {
    map[row.employee_name] =
      (map[row.employee_name] || 0) + timeToHours(row.time);
  });

  return Object.entries(map).map(([name, value]) => ({
    name,
    value,
  }));
}, [reportData]);


const COLORS = [
  "#0ea5e9",
  "#22c55e",
  "#a855f7",
  "#f97316",
  "#64748b",
  "#eab308",
];

const projectUtilizationData = useMemo(() => {
  const projectMap = {};

  rawSheets.forEach(sheet => {

    const projectName = sheet.project_name;
    const userName = sheet.employee_name;
    const hours = timeToHours(sheet.time);

    if (!projectMap[projectName]) {
      projectMap[projectName] = {
        name: projectName,
        value: 0,
        users: {}
      };
    }

    projectMap[projectName].value += hours;

    if (!projectMap[projectName].users[userName]) {
      projectMap[projectName].users[userName] = 0;
    }

    projectMap[projectName].users[userName] += hours;
  });

  return Object.values(projectMap).map(project => ({
    name: project.name,
    value: Number(project.value.toFixed(1)),
    users: Object.entries(project.users).map(([name, hours]) => ({
      name,
      hours: Number(hours.toFixed(1))
    }))
  }));

}, [rawSheets]);

const handleRowClick = (row) => {
  setSelectedSheet(row);
  setIsSheetModalOpen(true);
};

const Detail = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-500">{label}</p>
    <p className="font-medium text-gray-800 break-words">
      {value || "—"}
    </p>
  </div>
);

useEffect(() => {
  if (activeView !== "analytics") return;

  setSelectedProject(null);
  setSelectedUser(null);
  setShowOtherProjects(false);
  setProjectSearch("");
  setUserSearch("");
}, [activeView]);


const MAX_PROJECTS = 10;

const normalizedProjects = useMemo(() => {
  const sorted = [...projectUtilizationData].sort(
    (a, b) => b.value - a.value
  );

  if (sorted.length <= MAX_PROJECTS) return sorted;

  const top = sorted.slice(0, MAX_PROJECTS);
  const others = sorted
    .slice(MAX_PROJECTS)
    .reduce((sum, p) => sum + p.value, 0);

  return [
    ...top,
    { name: "Others", value: others, users: [] }
  ];
}, [projectUtilizationData]);

const projectTitle = useMemo(() => {
  const count = projectUtilizationData.length;

  if (count > 10) return "Projects (Top 10)";
  if (count > 1) return "Projects";
  if (count === 1) return `Project — ${projectUtilizationData[0]?.name || ""}`;

  return "Projects";
}, [projectUtilizationData]);



const ALL_FILTERS = [
  { key: "department", label: "Department" },
  { key: "team", label: "Team" },
  { key: "employee", label: "Employee" },
  { key: "client", label: "Client" },
  { key: "project", label: "Project" },
  { key: "activity", label: "Activity" },
  { key: "status", label: "Status" },
  { key: "date", label: "Date Range" },
];


const addFilter = (key) => {
  setActiveFilters((prev) =>
    prev.includes(key) ? prev : [key, ...prev] 
  );
};


const removeFilter = (key) => {
  setActiveFilters((prev) => prev.filter((f) => f !== key));

  setFilters((prev) => ({
    ...prev,
    [key === "date" ? "startDate" : key]: [],
    ...(key === "date" ? { endDate: "" } : {}),
  }));
};

const handleExport = () => {

  // flatten grouped rows -> sheets
  const flattened = searchedData.flatMap(row =>
    row.sheets.map(sheet => ({
      Date: sheet.date,
      Employee: row.employee_name,
      Team: row.team_name,
      Project: sheet.project_name,
      Client: sheet.client_name,
      Activity: sheet.activity_type,
Hours: timeToHours(sheet.time),
      Status: sheet.status,
        "Approved / Rejected By":
      sheet.approve_rejected_by_name || "—",
      Narration: sheet.narration || ""
    }))
  );

  exportToExcel(flattened, "timesheets.xlsx");
};



useEffect(() => {
  setCurrentPage(1);
}, [globalSearch]);

useEffect(() => {
  if (!tempDate.start || !tempDate.end) return;

  setFilters((prev) => ({
    ...prev,
    startDate: tempDate.start,
    endDate: tempDate.end,
  }));
}, [tempDate.start, tempDate.end]);



const FilterWrap = ({ children, onRemove }) => (
  <div className="relative w-[220px]">
    {children}
    <button
      type="button"
      onClick={onRemove}
      className="absolute -top-2 -right-2 h-5 w-5 rounded-full
                 bg-gray-200 text-xs flex items-center justify-center
                 hover:bg-gray-300"
    >
      ✕
    </button>
  </div>
);
useEffect(() => {
  localStorage.setItem(
    "master-report-active-filters",
    JSON.stringify(activeFilters)
  );
}, [activeFilters]);

const renderFilter = (key) => {
  switch (key) {
    case "department":
      return (
        <FilterWrap onRemove={() => removeFilter("department")}>
          <SearchableSelect
            placeholder="Department"
            options={departments}
            labelKey="name"
            valueKey="id"
            value={filters.department}
            onChange={(v) =>
              setFilters((p) => ({ ...p, department: v }))
            }
          />
        </FilterWrap>
      );

    case "team":
      return (
        <FilterWrap onRemove={() => removeFilter("team")}>
          <SearchableSelect
            placeholder="Team"
            options={teams}
            labelKey="name"
            valueKey="id"
            value={filters.team}
            onChange={(v) =>
              setFilters((p) => ({ ...p, team: v }))
            }
          />
        </FilterWrap>
      );

    case "employee":
      return (
        <FilterWrap onRemove={() => removeFilter("employee")}>
          <SearchableSelect
            placeholder="Employee"
            options={employees}
            value={filters.employee}
            onChange={(v) =>
              setFilters((p) => ({ ...p, employee: v }))
            }
          />
        </FilterWrap>
      );

    case "client":
      return (
        <FilterWrap onRemove={() => removeFilter("client")}>
          <SearchableSelect
            placeholder="Client"
            options={clients}
            value={filters.client}
            onChange={(v) =>
              setFilters((p) => ({ ...p, client: v }))
            }
          />
        </FilterWrap>
      );

    case "project":
      return (
        <FilterWrap onRemove={() => removeFilter("project")}>
          <SearchableSelect
            placeholder="Project"
            options={projects}
            labelKey="project_name"
            valueKey="id"
            value={filters.project}
            onChange={(v) =>
              setFilters((p) => ({ ...p, project: v }))
            }
          />
        </FilterWrap>
      );

    case "activity":
      return (
        <FilterWrap onRemove={() => removeFilter("activity")}>
          <SearchableSelect
            placeholder="Activity"
            options={activityTags || []}
            labelKey="name"
            valueKey="id"
            value={filters.activity}
            onChange={(v) =>
              setFilters((p) => ({ ...p, activity: v }))
            }
          />
        </FilterWrap>
      );

    case "status":
      return (
        <FilterWrap onRemove={() => removeFilter("status")}>
          <SearchableSelect
            placeholder="Status"
            options={[
              { id: "approved", name: "Approved" },
              { id: "pending", name: "Pending" },
              { id: "rejected", name: "Rejected" },
              // { id: "backdated", name: "Backdated" },
            ]}
            valueKey="id"
            labelKey="name"
            value={filters.status}
            onChange={(v) =>
              setFilters((p) => ({ ...p, status: v }))
            }
          />
        </FilterWrap>
      );

//     case "date":
//       return (
// <FilterWrap onRemove={() => removeFilter("date")}>
//   <DateRangePicker
//     compact
//     value={tempDate}
//     onChange={(range) => {
//       setTempDate(range); 
//     }}
//   />
// </FilterWrap>


      // );

    default:
      return null;
  }
};
const isRejected = (s) =>
  s.status?.toLowerCase()?.trim() === "rejected";

const getActionableSheets = (rows) =>
  rows
    .flatMap(r => r.sheets)
    .filter(s => !isRejected(s)); 

const handlePointerDown = React.useCallback((event) => {
  const target = event.target;

  if (addFilterRef.current?.contains(target)) return;
  if (target.closest("[data-datepicker]")) return;
  if (target.tagName === "INPUT" && target.type === "date") return;

  setIsAddOpen(false);
}, []);

useEffect(() => {
  if (!isAddOpen) return;

  document.addEventListener("mousedown", handlePointerDown);

  return () => {
    document.removeEventListener("mousedown", handlePointerDown);
  };
}, [isAddOpen, handlePointerDown]);

const handleApprove = async (row) => {
  try {
    setActionLoadingId(row.id);

    const res = await approvePerformanceSheet(row.id);

    // ✅ only refresh if success
    if (res?.success || res?.status === 200) {
// setRefreshKey(prev => prev + 1);
    } else {
      // throw new Error("Approve failed");
            // showAlert({ variant: "error", title: "Error", message: "Approve failed" });

    }
    await fetchReportData();
await fetchMasterData(filters);


  } catch (err) {
    console.error("Approve failed:", err);

    // optional toast
    // alert("Failed to approve sheet");
                showAlert({ variant: "error", title: "Error", message: "Failed to approve sheet" });

  } finally {
    setActionLoadingId(null);
    setEditingRow(null);
  }
};



const handleReject = async (row) => {
  try {
    setActionLoadingId(row.id);

    const res = await rejectPerformanceSheet(row.id);

    if (res?.success || res?.status === 200) {
      // await fetchReportData();
      // setRefreshKey(prev => prev + 1);

    } else {
      // throw new Error("Reject failed");
                  // showAlert({ variant: "error", title: "Error", message: "Reject failed" });

    }
    await fetchReportData();
await fetchMasterData(filters);


  } catch (err) {
    console.error("Reject failed:", err);
    // alert("Failed to reject sheet");
                    showAlert({ variant: "error", title: "Error", message: "Failed to reject sheet" });

  } finally {
    setActionLoadingId(null);
    setEditingRow(null);
  }
};

const limitText = (arr, limit = 2) => {
  const list = [...arr];

  if (list.length <= limit) return list.join(", ");

  return list.slice(0, limit).join(", ") + " ...";
};


const groupSheetsByDayEmployee = (users) => {
  const grouped = {};

  users.forEach((user) => {
    user.sheets?.forEach((sheet) => {
      const key = `${user.user_id}_${sheet.date}`;

      if (!grouped[key]) {
        grouped[key] = {
          id: key,
          date: sheet.date,

          // 👇 KEEP COLUMN NAMES YOU WANT
          employee_name: user.user_name,
          team_name: Array.isArray(user.team_names)
            ? user.team_names.join(", ")
            : "—",

       project_names: new Set(),
client_names: new Set(),
activity_types: new Set(),


          time: 0, // minutes
          status: "approved", // derived
          sheets: [],
        };
      }

      const [h, m] = sheet.time.split(":").map(Number);
      grouped[key].time += h * 60 + m;

grouped[key].project_names.add(sheet.project_name);
grouped[key].client_names.add(sheet.client_name);
grouped[key].activity_types.add(sheet.activity_type);


      if (sheet.status !== "approved") {
        grouped[key].status = sheet.status;
      }

      grouped[key].sheets.push(sheet);
    });
  });

return Object.values(grouped).map((g) => {

const statuses = g.sheets.map(s =>
  s.status?.toString().trim().toLowerCase()
);

  let finalStatus = "approved";

  if (statuses.includes("rejected")) finalStatus = "rejected";
  else if (statuses.includes("pending")) finalStatus = "pending";
  // else if (statuses.includes("backdated")) finalStatus = "backdated";

  return {
    ...g,
    status: finalStatus,
    user_name: g.employee_name,
    total_hours: g.time,
project_name: limitText([...g.project_names], 2),
client_name: limitText([...g.client_names], 2),
activity_type: limitText([...g.activity_types], 2),

project_names_full: [...g.project_names],
client_names_full: [...g.client_names],
activity_types_full: [...g.activity_types],

    time: g.time,
  };
});


};

const handleBulkAction = async (status, sheets) => {

  const safeSheets = sheets.filter(s => {
    const st = s.status?.toLowerCase()?.trim();

    // 🚨 HARD RULE:
    // rejected can NEVER change
    if (st === "rejected") return false;

    // Everything else is allowed
    return true;
  });

  if (!safeSheets.length) return;

  try {
    const promises = safeSheets.map(sheet =>
      status === "approved"
        ? approvePerformanceSheet(sheet.id)
        : rejectPerformanceSheet(sheet.id)
    );

    await Promise.all(promises);

    await fetchReportData();
    await fetchMasterData(filters);

    setEditMode({});
    setSelectedRows([]);

  } catch (err) {
    console.error("Bulk update failed:", err);
  }
};






const handleStatusChange = async (sheetId, status) => {
  try {
    if (status === "approved") {
      await approvePerformanceSheet(sheetId);
    } else {
      await rejectPerformanceSheet(sheetId);
    }

    await fetchReportData();
    await fetchMasterData(filters);

  } catch (err) {
    console.error("Status update failed:", err);

    showAlert({
      variant: "error",
      title: "Error",
      message: "Status update failed"
    });
  }
};





  return (
   <div className={`space-y-2 ${isLoadingFinal ? "pointer-events-none select-none" : ""}`}>

      <SectionHeader
        icon={BarChart}
        title="Manage Timesheets"
        subtitle="Search by name, project, client, activity or date"
        showViewToggle
        activeView={activeView}
        onViewChange={setActiveView}
      />
<div
 
  className="flex flex-wrap items-center gap-2"
>

<div
  ref={filtersAreaRef}
  className="flex flex-wrap items-center gap-2"
>
  <div className="relative h-[35px] w-[220px] rounded-lg border bg-white">
    <input
      type="text"
      value={globalSearch}
      onChange={(e) => setGlobalSearch(e.target.value)}
      placeholder="Search anything…"
      className="h-full w-full bg-transparent pl-3 pr-8 text-sm focus:outline-none"
    />
    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
      🔍
    </span>
  </div>

  {/* ADD FILTER (separate ref) */}
  <div ref={addFilterRef} className="relative">
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        setIsAddOpen((v) => !v);
      }}
      className="h-[35px] px-4 rounded-lg border bg-white text-sm hover:bg-slate-50 whitespace-nowrap"
    >
      + Filter
    </button>

    {isAddOpen && (
      <div
        className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50"
        onClick={(e) => e.stopPropagation()}
      >
        {ALL_FILTERS
          .filter((f) => !activeFilters.includes(f.key))
          .map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => {
                addFilter(f.key);
                setIsAddOpen(false);
              }}
              className="w-full text-left px-4 py-1.5 hover:bg-slate-100 text-sm"
            >
              {f.label}
            </button>
          ))}
      </div>
    )}
  </div>

  {/* ACTIVE FILTERS */}
  {activeFilters.map((key) => (
    <React.Fragment key={key}>{renderFilter(key)}</React.Fragment>
  ))}

  {/* RESET */}
  {/* {activeFilters.length > 0 && ( */}
    {/* <button
      type="button"
      onClick={resetFilters}
      className="h-[35px] px-4 rounded-lg bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 transition"
    >
      Reset
    </button> */}
  {/* )} */}
</div>

  <DateRangePicker
      compact
      value={{ start: filters.startDate, end: filters.endDate }}
      onChange={(range) =>
        setFilters({
          ...filters,
          startDate: range.start,
          endDate: range.end,
        })
      }
    />
      <button
      type="button"
      onClick={resetFilters}
      className="h-[35px] px-4 rounded-xl bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 transition"
    >
      Reset
    </button>
 <ExportButton onClick={handleExport} />
</div>













{/* ================= VIEW TOGGLE ================= */}
{/* <div className="flex gap-2 bg-sky-50 p-1 rounded-xl w-fit border border-sky-200">
  <button
    onClick={() => setActiveView("sheets")}
    className={`px-4 py-2 rounded-lg text-sm font-medium transition
      ${
        activeView === "sheets"
          ? "bg-sky-500 text-white"
          : "text-sky-600 hover:bg-sky-100"
      }`}
  >
    Sheets
  </button>

  <button
    onClick={() => setActiveView("analytics")}
    className={`px-4 py-2 rounded-lg text-sm font-medium transition
      ${
        activeView === "analytics"
          ? "bg-sky-500 text-white"
          : "text-sky-600 hover:bg-sky-100"
      }`}
  >
    Analytics
  </button>
</div> */}

<MetricsGrid
  metrics={metricsConfig}
  activeKey={metricFilter}
  onMetricClick={(key) => {
    if (key === "unfilled") {
      setShowUnfilledModal(true);
      return;
    }

    if (key === "utilization") {
      setMetricFilter(null);
      return;
    }

    // 🔁 TOGGLE OFF
    if (metricFilter === key) {
      setMetricFilter(null);
      setFilters(prev => ({
        ...prev,
        status: [],
        activity: [],
      }));
      return;
    }

    // 🔁 TOGGLE ON
    const config = metricToFilters[key];
    if (!config) return;

    const activityId =
      config.activityName
        ? activityTags.find(
            a => a.name.toLowerCase() === config.activityName.toLowerCase()
          )?.id
        : null;

    setFilters(prev => ({
      ...prev,
      status: config.status || [],
      activity: activityId ? [activityId] : [],
    }));

    setMetricFilter(key);

    // ❌ DO NOT touch activeView here
  }}
/>
{/* ================= CONTENT ================= */}

{activeView === "sheets" && (
  <div className="glass-card rounded-2xl border border-sky-200 bg-white/60 flex flex-col h-[75vh]">
    {/* <GlobalTable
      data={filteredData}
      paginatedData={paginatedData}
      columns={columns}
      isLoading={isLoadingFinal}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setCurrentPage}
      enablePagination={true}
      onRowClick={handleRowClick} 
      className="cursor-pointer"
      stickyHeader={true}
 maxHeight="60vh"
      hideActions={true}
      emptyStateTitle="No results found"
      emptyStateMessage="Try changing search or filters"
    /> */}
<div className="flex-1 overflow-y-auto">

<GlobalTable02
  data={filteredData}
  paginatedData={paginatedData}
  columns={columns}
  isLoading={isLoadingFinal}
  currentPage={currentPage}
  editMode={editMode}
  onEditToggle={handleEditToggle}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
onHeaderBulkApprove={handleHeaderBulkApprove}
onHeaderBulkReject={handleHeaderBulkReject}

  onBulkAction={handleBulkAction}
  onStatusChange={handleStatusChange}
 mainTableBulkActionsOnly={true}
  enablePagination
  onRowClick={handleRowClick}
  className="cursor-pointer"
  stickyHeader
  tableType="main"
  enableHeaderBulkActions={true}
  emptyStateTitle="No results found"
  emptyStateMessage="Try changing search or filters"
  canEdit={canAddEmployee}
  expandedRow={expandedRow}
  onToggleRow={toggleRow}
  selectedRows={selectedRows}
  onRowSelect={handleRowSelect}
  isAllSelected={isAllSelected}
  onHeaderSelectAll={handleSelectAll}
/>


</div>

  </div>
)}

{isSheetModalOpen && selectedSheet && (
  <div
    className="fixed inset-0 z-50 !mt-0 flex items-center justify-center bg-black/70 backdrop-blur-sm"
    onClick={() => setIsSheetModalOpen(false)}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="w-full max-w-5xl h-[520px]
                 rounded-3xl border border-white/30
                 bg-white/90 backdrop-blur-xl shadow-2xl
                 p-6 animate-scaleIn flex gap-6"
    >
      {/* ================= LEFT : DETAILS ================= */}
      <div className="w-2/3 overflow-y-auto pr-2">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Sheet Details
          </h3>
          <button
            onClick={() => setIsSheetModalOpen(false)}
            className="text-gray-500 hover:text-gray-800"
          >
            ✕
          </button>
        </div>

        {/* DETAILS GRID */}
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
          <Detail label="Employee" value={selectedSheet.employee_name} />
          <Detail label="Team" value={selectedSheet.team_name} />
          <Detail label="Project" value={selectedSheet.project_name} />
          <Detail label="Client" value={selectedSheet.client_name} />
          <Detail label="Activity" value={selectedSheet.activity_type} />
          <Detail label="Work Type" value={selectedSheet.work_type} />
          <Detail label="Project Type" value={selectedSheet.project_type} />
          <Detail label="Project Status" value={selectedSheet.project_type_status} />
          <Detail label="Date" value={selectedSheet.date} />
          <Detail label="Hours" value={selectedSheet.time} />
          <Detail label="Tracked Hours" value={selectedSheet.tracked_hours} />
          <Detail label="Offline Hours" value={selectedSheet.offline_hours} />
          <Detail label="Deadline" value={selectedSheet.deadline} />
          <Detail label="Status" value={selectedSheet.status} />
<Detail
  label="Created At"
  value={formatDateTime(selectedSheet.created_at)}
/>

<Detail
  label="Updated At"
  value={formatDateTime(selectedSheet.updated_at)}
/>

        </div>
      </div>

      {/* ================= RIGHT : NARRATION ================= */}
      <div className="w-1/3 flex flex-col border-l border-white/40 pl-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">
          Narration
        </h4>

        <div className="flex-1 overflow-y-auto rounded-2xl bg-white/60
                        border border-white/40 p-4 space-y-3">
          {/* Message bubble style */}
          <div className="max-w-full bg-sky-100/80 text-gray-800
                          rounded-2xl px-4 py-3 text-sm shadow-sm">
            {selectedSheet.narration || "No narration provided"}
          </div>
        </div>
      </div>
    </div>
  </div>
)}

{activeView === "analytics" && (
  <div className="glass-card rounded-2xl border border-sky-200 bg-white/70 backdrop-blur-xl p-6 space-y-6">

    <h2 className="text-lg font-semibold text-gray-800">
      Project → User → Sheets
    </h2>

<div className="grid grid-cols-1 xl:grid-cols-12 gap-4">


      {/* ================= LEFT : PROJECTS ================= */}
<div className="xl:col-span-4 space-y-4 h-full">

        {/* PIE */}
   <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-sky-200 shadow-sm p-5 space-y-3">

  {/* ================= HEADER ================= */}
  <div className="flex items-start gap-2 justify-between">
    <div>
      <p className="text-xs uppercase tracking-wide text-gray-500">
        {projectTitle}
      </p>
      <p className="text-[11px] text-gray-400 w-full max-w-[150px]">
        Click a project to drill down into users & sheets
      </p>
    </div>

    <div className="text-right">
      <p className="text-xs text-gray-400">Total Hours</p>
      <p className="text-lg font-semibold text-gray-800">
        {normalizedProjects
          .reduce((sum, p) => sum + p.value, 0)
          .toFixed(1)}
        <span className="text-xs text-gray-400 ml-1">hrs</span>
      </p>
    </div>
  </div>

  {/* ================= PIE ================= */}
  <div className="h-[260px] relative">
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={normalizedProjects}
          dataKey="value"
          nameKey="name"
          innerRadius={68}
          outerRadius={100}
          paddingAngle={2}
          stroke="white"
          strokeWidth={2}
          onClick={(entry) => {
            if (entry.payload.name === "Others") {
              setShowOtherProjects(true);
              setSelectedProject(null);
              setSelectedUser(null);

              setTimeout(() => {
                otherProjectsRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }, 100);
              return;
            }

            setShowOtherProjects(false);
            setSelectedProject(entry.payload);
            setSelectedUser(null);
          }}
        >
          {normalizedProjects.map((_, i) => (
            <Cell
              key={i}
              fill={COLORS[i % COLORS.length]}
              className="cursor-pointer hover:opacity-90"
            />
          ))}
        </Pie>

        <Tooltip
          formatter={(v, _, p) => [`${v} hrs`, p?.payload?.name]}
          contentStyle={{
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            fontSize: "12px",
          }}
        />
      </PieChart>
    </ResponsiveContainer>

    {/* CENTER LABEL */}
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
      <p className="text-xs text-gray-400">Projects</p>
      <p className="text-xl font-semibold text-gray-800">
        {normalizedProjects.length}
      </p>
    </div>
  </div>

  {/* ================= FOOTER ================= */}
  <div className="flex items-center justify-between text-[11px] text-gray-400">
    <span>Others = combined smaller projects</span>
    <span className="italic">Click segments to explore</span>
  </div>
</div>


        {/* ================= OTHER PROJECTS PANEL ================= */}
     {showOtherProjects && (
  <div
    ref={otherProjectsRef}
    className="mt-6 bg-white/60 backdrop-blur-xl
               rounded-3xl border border-sky-200
               shadow-lg p-4"
  >
    <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
      Other Projects
    </p>

    <input
      type="text"
      placeholder="Search project..."
      value={projectSearch}
      onChange={(e) => setProjectSearch(e.target.value)}
      className="mb-3 w-full rounded-xl border border-sky-200
                 bg-white/80 px-3 py-2 text-sm
                 focus:ring-2 focus:ring-sky-400 outline-none"
    />

    <div className="max-h-[240px] overflow-y-auto space-y-2 pr-1">
      {projectUtilizationData
        .filter(
          p =>
            !normalizedProjects.some(np => np.name === p.name) &&
            p.name.toLowerCase().includes(projectSearch.toLowerCase())
        )
        .map((project) => (
          <button
            key={project.name}
            onClick={() => {
              setSelectedProject(project);
              setShowOtherProjects(false);
              setSelectedUser(null);
            }}
            className="w-full text-left rounded-2xl p-3
                       bg-white/70 backdrop-blur-md
                       border border-sky-100
                       hover:bg-sky-100/60 transition"
          >
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium truncate">
                {project.name}
              </span>
              <span className="text-xs text-gray-500">
                {project.value} hrs
              </span>
            </div>
          </button>
        ))}
    </div>
  </div>
)}

      </div>

      {/* ================= RIGHT : USERS ================= */}
<div
  className="
    xl:col-span-8
    bg-white/60 backdrop-blur-xl
    rounded-3xl border border-sky-200
    shadow-lg p-4
  "
>



  <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
    Users
  </p>

  {selectedProject ? (
    <>
      {/* PROJECT NAME */}
      <p className="text-sm font-semibold text-gray-800 mb-2 truncate">
        {selectedProject.name}
      </p>

      {/* USER SEARCH */}
      <input
        type="text"
        placeholder="Search user..."
        value={userSearch}
        onChange={(e) => setUserSearch(e.target.value)}
        className="mb-3 w-full rounded-xl border border-sky-200
                   bg-white/80 px-3 py-2 text-sm
                   focus:ring-2 focus:ring-sky-400 outline-none"
      />

      {/* USER LIST */}
      <div className="h-[260px] overflow-y-auto space-y-2 pr-2">
        {(selectedProject.users || [])
          .filter(u =>
            u.name.toLowerCase().includes(userSearch.toLowerCase())
          )
          .map((u) => (
            <button
              key={u.name}
              onClick={() => setSelectedUser(u.name)}
              className={`w-full rounded-2xl p-3 text-left
                backdrop-blur-md border transition
                ${
                  selectedUser === u.name
                    ? "bg-sky-500/90 text-white shadow-lg"
                    : "bg-white/70 border-sky-100 hover:bg-sky-100/70"
                }`}
            >
              <div className="flex justify-between items-center">
             <p className="text-sm font-semibold truncate max-w-[200px]">
  {u.name}
</p>

                <span className="text-xs opacity-80">{u.hours} hrs</span>
              </div>
            </button>
          ))}
      </div>
    </>
  ) : (
    /* EMPTY STATE */
    <div className="h-[300px] flex items-center justify-center text-sm text-gray-400">
      Select a project to view users
    </div>
  )}
</div>

  
    </div>

    {/* ================= SHEETS ================= */}
{selectedProject && selectedUser && (
  <div
    className="rounded-2xl border border-sky-200
               bg-white/60 backdrop-blur-xl
               shadow-sm overflow-hidden"
                   ref={sheetsTableRef}
  >
    {/* ================= STICKY HEADER ================= */}
    <div
      className="sticky top-0 z-20
                 bg-white/80 backdrop-blur-xl
                 border-b border-sky-100
                 px-5 py-3"
    >
      <p className="text-sm font-semibold text-gray-800 truncate">
        {selectedUser}
        <span className="text-gray-400 font-normal"> — Sheets</span>
      </p>
      <p className="text-xs text-gray-500 truncate">
        {selectedProject.name}
      </p>
    </div>

    {/* ================= SCROLL AREA ================= */}
    <div className="">
    <GlobalTable
  data={analyticsTableData}
  paginatedData={analyticsPaginatedData}
  columns={columns}
   enablePagination={true}
  currentPage={analyticsPage}
  totalPages={analyticsTotalPages}
  onPageChange={setAnalyticsPage}
  className="cursor-pointer"
  stickyHeader={true}
  maxHeight="500px"
  hideActions={true}
  emptyStateTitle="No sheets"
  rowClassName="sheet-glass-row"
 onRowClick={handleRowClick}
 />

    </div>
  </div>
)}

  </div>
)}

{isLoadingFinal && (
  <div className="fixed !mt-0 inset-0 z-[9999] flex items-center justify-center bg-white/60 backdrop-blur-sm">
    <div className="flex items-center gap-3 rounded-2xl bg-white px-6 py-4 shadow-lg border">
      <svg
        className="h-6 w-6 animate-spin text-sky-500"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>

      <span className="text-sm font-medium text-gray-700">
        Fetching reports…
      </span>
    </div>
  </div>
)}


{showUnfilledModal && (
  <div
    className="fixed inset-0 z-50 flex items-center !mt-0 justify-center bg-black/30 backdrop-blur-sm"
    onClick={() => setShowUnfilledModal(false)}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="w-full max-w-lg rounded-3xl bg-white/80 backdrop-blur-xl
                 border border-white/30 shadow-2xl p-6 animate-scaleIn"
    >
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Users with Unfilled Sheets
        </h3>
        <button
          onClick={() => setShowUnfilledModal(false)}
          className="text-gray-500 hover:text-gray-800"
        >
          ✕
        </button>
      </div>

      {/* USER LIST */}
      <div className="max-h-[360px] overflow-y-auto space-y-2 pr-1">
        {notFilledUsers.map((u) => (
          <button
            key={u.user_id}
            onClick={() => setSelectedUnfilledUser(u)}
            className="w-full rounded-2xl border border-rose-100
                       bg-white/70 hover:bg-rose-50
                       p-3 text-left transition"
          >
            <p className="text-sm font-semibold text-gray-800">
              {u.user_name}
            </p>

            <p className="text-xs text-gray-600 mt-1">
              Missing days: {u.missing_days} • Missing hrs:{" "}
              {(u.missing_minutes / 60).toFixed(1)}
            </p>
          </button>
        ))}
      </div>
    </div>
  </div>
)}
{selectedUnfilledUser && (
  <div
    className="fixed inset-0 !mt-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm"
    onClick={() => setSelectedUnfilledUser(null)}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="w-full max-w-md rounded-3xl bg-white/90
                 shadow-2xl border border-white/40 p-6"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Unfilled Sheet Details
        </h3>
        <button
          onClick={() => setSelectedUnfilledUser(null)}
          className="text-gray-500 hover:text-gray-800"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3 text-sm">
        <Detail label="Employee" value={selectedUnfilledUser.user_name} />
        <Detail label="Missing Days" value={selectedUnfilledUser.missing_days} />
        <Detail
          label="Missing Hours"
          value={`${(selectedUnfilledUser.missing_minutes / 60).toFixed(1)} hrs`}
        />

        <div>
          <p className="text-xs text-gray-500 mb-1">Missing Dates</p>
          <div className="flex flex-wrap gap-2">
            {selectedUnfilledUser.missing_dates.map((d) => (
              <span
                key={d}
                className="rounded-full bg-rose-100 px-3 py-1 text-xs text-rose-700"
              >
                {d}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
)}



    </div>
  );
};

export default MasterReporting;
