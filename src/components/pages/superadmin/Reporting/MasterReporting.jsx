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
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const MasterReporting = () => {
  const { fetchClients, clients, isLoading: isClientLoading } = useClient();
  const { fetchProjectMasterName, projectMastersName, isLoading: isProjectLoading } =
    useProjectMaster();
  const { fetchEmployees, employees, isLoading: isEmployeeLoading } = useEmployees();
  const { getActivityTags, activityTags } = useActivity();
    const { fetchTeams, teams } = useTeam();
        const { fetchDepartment, department } = useDepartment();

const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 8;
const [activeView, setActiveView] = useState("sheets"); 
const [selectedSheet, setSelectedSheet] = useState(null);
const [isSheetModalOpen, setIsSheetModalOpen] = useState(false);
const [selectedProject, setSelectedProject] = useState(null);
const [selectedUser, setSelectedUser] = useState(null);
const [showOtherProjects, setShowOtherProjects] = useState(false);
const [projectSearch, setProjectSearch] = useState("");
const [userSearch, setUserSearch] = useState("");
const otherProjectsRef = useRef(null);
const sheetsTableRef = useRef(null);
const [apiSummary, setApiSummary] = useState(null);




  const [searchText, setSearchText] = useState("");
  const [reportData, setReportData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
const [metricFilter, setMetricFilter] = useState(null);
  const [filters, setFilters] = useState({
    employee: "",
    project: "",
    client: "",
    activity: "",
    startDate: "",
    endDate: "",
    team:"",
      department: "", 
    status: "",
  });
const timeToDecimal = (time = "00:00") => {
  const [h = 0, m = 0] = time.split(":").map(Number);
  return Number((h + m / 60).toFixed(1));
};

const timeToHours = (time = "00:00") => {
  const [h = 0, m = 0] = time.split(":").map(Number);
  return h + m / 60;
};

  const teamSummaryFromSheets = useMemo(() => {
  let pending = 0;
  let rejected = 0;

  reportData.forEach((row) => {
    const hours = timeToHours(row.time);
    if (row.status === "pending") pending += hours;
    if (row.status === "rejected") rejected += hours;
  });

  return {
    pending: Number(pending.toFixed(1)),
    rejected: Number(rejected.toFixed(1)),
  };
}, [reportData]);



const teamSummary = useMemo(() => {
  if (!apiSummary) {
    return {
      billable: 0,
      inhouse: 0,
      noWork: 0,
      pending: 0,
      rejected: 0,
      utilization: 0,
    };
  }

  return {
    billable: timeToDecimal(apiSummary.billable),
    inhouse: timeToDecimal(apiSummary.inhouse),
    noWork: timeToDecimal(apiSummary.no_work),
    pending: Number(teamSummaryFromSheets.pending || 0),
    rejected: Number(teamSummaryFromSheets.rejected || 0),
    utilization: Math.round(
      ((timeToDecimal(apiSummary.billable) +
        timeToDecimal(apiSummary.inhouse)) /
        (timeToDecimal(apiSummary.billable) +
          timeToDecimal(apiSummary.inhouse) +
          timeToDecimal(apiSummary.no_work))) *
        100
    ),
  };
}, [apiSummary]);






useEffect(() => {
  if (
    filters.status ||
    filters.activity ||
    filters.employee ||
    filters.project ||
    filters.client ||
    filters.team
  ) {
    setMetricFilter(null);
  }
}, [
  filters.status,
  filters.activity,
  filters.employee,
  filters.project,
  filters.client,
  filters.team
]);


  /* ---------------- INITIAL LOAD ---------------- */
  useEffect(() => {
    fetchClients();
    fetchProjectMasterName();
    fetchEmployees();
    getActivityTags();
      fetchTeams(); 
      fetchDepartment();
  }, []);

  /* ---------------- API INTEGRATION ---------------- */
  useEffect(() => {
    fetchReportData();
  }, [
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

const fetchReportData = React.useCallback(async () => {
  setIsLoading(true);
  const token = localStorage.getItem("userToken");

  try {

    const params = new URLSearchParams();

    if (filters.employee) params.append("user_id", filters.employee);
    if (filters.client) params.append("client_id", filters.client);
    if (filters.activity) params.append("activity_tag", filters.activity);
    if (filters.project) params.append("project_id", filters.project);
    if (filters.startDate) params.append("start_date", filters.startDate);
    if (filters.endDate) params.append("end_date", filters.endDate);
    if (filters.team) params.append("team_id", filters.team);
    if (filters.department) params.append("department_id", filters.department);
    if (filters.status) params.append("status", filters.status);

    const response = await fetch(
      `${API_URL}/api/users-all-sheets-data-reporting?${params.toString()}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );



   


const result = await response.json();

setApiSummary(result?.data?.summary || null);

const users = result?.data?.users || [];
const normalized = users.flatMap((user) =>
  (user.sheets || []).map((sheet) => ({
    ...sheet,
    employee_id: user.user_id,
    employee_name: user.user_name,
    team_name: user.team_name,
  }))
);

setReportData(normalized);






    setReportData(normalized);
  } catch (error) {
    console.error("Reporting API error:", error);
    setReportData([]);
  } finally {
    setIsLoading(false);
  }
}, [filters]);

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
          return status === "approved" && activity.includes("in");

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

  if (searchText) {
    data = data.filter((row) =>
      Object.values(row).some((val) =>
        String(val).toLowerCase().includes(searchText.toLowerCase())
      )
    );
  }

  return data;
}, [reportData, searchText, metricFilter]);


const totalPages = Math.ceil(filteredData.length / itemsPerPage);

const paginatedData = useMemo(() => {
  const start = (currentPage - 1) * itemsPerPage;
  const end = currentPage * itemsPerPage;
  return filteredData.slice(start, end);
}, [filteredData, currentPage]);




const columns = [
  { key: "employee_name", label: "Employee" },
     { key: "team_name", label: "Team" },
  { key: "project_name", label: "Project" },
  { key: "client_name", label: "Client" },
  { key: "activity_type", label: "Activity" },
  { key: "time", label: "Hours" },
  { key: "date", label: "Date" },
  { key: "status", label: "Sheet Status" },

];


  const resetFilters = () => {
    setSearchText("");
    setFilters({
      employee: "",
      project: "",
      client: "",
      activity: "",
      startDate: "",
      endDate: "",
      status: "",
    });
  };


const metricsConfig = [
//   { key: "expected", label: "Expected Hours", value: teamSummary.expected, tone: "indigo" },
  { key: "approved_billable", label: "Approved Billable", value: teamSummary.billable, tone: "green" },
  { key: "approved_inhouse", label: "Approved Inhouse", value: teamSummary.inhouse, tone: "violet" },
  { key: "no_work", label: "Approved No Work", value: teamSummary.noWork, tone: "rose" },
  { key: "pending", label: "Pending Hours", value: teamSummary.pending, tone: "amber" },
  { key: "rejected", label: "Rejected Hours", value: teamSummary.rejected, tone: "gray" },
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

  return filteredData.filter(
    r =>
      r.project_name === selectedProject.name &&
      r.employee_name === selectedUser
  );
}, [filteredData, selectedProject, selectedUser]);


const analyticsTotalPages = Math.ceil(
  analyticsTableData.length / analyticsItemsPerPage
);

const analyticsPaginatedData = useMemo(() => {
  const start = (analyticsPage - 1) * analyticsItemsPerPage;
  const end = start + analyticsItemsPerPage;
  return analyticsTableData.slice(start, end);
}, [analyticsTableData, analyticsPage]);





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

  reportData.forEach((row) => {
    const projectName = row.project_name || "No Project";
    const userName = row.employee_name;
    const hours = timeToHours(row.time);

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

  return Object.values(projectMap).map((project) => ({
    name: project.name,
    value: Number(project.value.toFixed(1)),
    users: Object.entries(project.users).map(([name, hours]) => ({
      name,
      hours: Number(hours.toFixed(1))
    }))
  }));
}, [reportData]);


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
  if (activeView !== "analytics") {
    setSelectedProject(null);
    setSelectedUser(null);
  }
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

useEffect(() => {
  if (activeView !== "analytics") return;

  setSelectedProject(null);
  setSelectedUser(null);
  setShowOtherProjects(false);
  setProjectSearch("");
  setUserSearch("");
}, [
  activeView,
  filters.employee,
  filters.project,
  filters.client,
  filters.activity,
  filters.team,
  filters.startDate,
  filters.endDate,
  filters.status
]);


  return (
   <div className={`space-y-6 ${isLoading ? "pointer-events-none select-none" : ""}`}>

      <SectionHeader
        icon={BarChart}
        title="Master Reporting"
        subtitle="Search by name, project, client, activity or date"
      />

      {/* FILTER BAR */}
      <div className="glass-card sticky top-0 z-20 rounded-2xl bg-white/60 border border-sky-200 shadow-md">
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-8 gap-4 items-center">

          <SearchableSelect
            placeholder="Employee"
            isLoading={isEmployeeLoading}
            options={employees || []}
            value={filters.employee}
            onChange={(v) => setFilters({ ...filters, employee: v })}
          />
          {/* <SearchableSelect
  placeholder="Department"
  options={department || []}
  labelKey="name"
  valueKey="id"
  value={filters.department}
  onChange={(v) =>
    setFilters({ ...filters, department: v })
  }
/> */}

          <SearchableSelect
  placeholder="Team"
  options={teams || []}
  labelKey="name"
  valueKey="id"
  value={filters.team}
  onChange={(v) => setFilters({ ...filters, team: v })}
/>


          <SearchableSelect
            placeholder="Client"
            isLoading={isClientLoading}
            options={clients?.data || []}
            labelKey="name"
            valueKey="id"
            value={filters.client}
            onChange={(v) => setFilters({ ...filters, client: v })}
          />

          <SearchableSelect
            placeholder="Project"
            isLoading={isProjectLoading}
            options={projectMastersName || []}
            labelKey="project_name"
            valueKey="id"
            value={filters.project}
            onChange={(v) => setFilters({ ...filters, project: v })}
          />

          <select
            className="filter-select"
            value={filters.activity}
            onChange={(e) =>
              setFilters({ ...filters, activity: e.target.value })
            }
          >
            <option value="">Activity</option>
            {activityTags?.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>

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

          <select
            className="filter-select"
            value={filters.status}
            onChange={(e) =>
              setFilters({ ...filters, status: e.target.value })
            }
          >
            <option value="">Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            {/* <option value="rejected">Rejected</option> */}
          </select>

          <button
            onClick={resetFilters}
            className="h-[40px] rounded-xl px-4 bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 transition"
          >
            Reset
          </button>
        </div>
      </div>


<MetricsGrid
  metrics={metricsConfig}
  activeKey={metricFilter}
  onMetricClick={(key) => {
    if (key === "expected" || key === "utilization") {
      setMetricFilter(null);
      return;
    }

    setMetricFilter((prev) => (prev === key ? null : key));
    setActiveView("sheets");
  }}
/>



{/* ================= VIEW TOGGLE ================= */}
<div className="flex gap-2 bg-sky-50 p-1 rounded-xl w-fit border border-sky-200">
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
</div>
{/* ================= CONTENT ================= */}

{activeView === "sheets" && (
  <div className="glass-card rounded-2xl border border-sky-200 bg-white/60 p-6">
    <GlobalTable
      data={filteredData}
      paginatedData={paginatedData}
      columns={columns}
      isLoading={isLoading}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setCurrentPage}
      enablePagination={true}
        onRowClick={handleRowClick} 
      className="cursor-pointer"
       stickyHeader={true}
  maxHeight="500px"
        hideActions={true}
      emptyStateTitle="No results found"
      emptyStateMessage="Try changing search or filters"
    />
  </div>
)}

{isSheetModalOpen && selectedSheet && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm !mt-0"
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
          <Detail label="Created At" value={selectedSheet.created_at} />
          <Detail label="Updated At" value={selectedSheet.updated_at} />
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
  // paginatedData={paginatedData}
  // currentPage={currentPage}
  // totalPages={totalPages}
  // onPageChange={setCurrentPage}
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

{isLoading && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm !mt-0">
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





    </div>
  );
};

export default MasterReporting;
