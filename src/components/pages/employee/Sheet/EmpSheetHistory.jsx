import React, { useState, useEffect,useMemo } from "react";
import { useUserContext } from "../../../context/UserContext";
import {
  Loader2,
  Calendar,
  User,
  Briefcase,
  Clock,
  FileText,
  Target,
  CheckCircle,
  BarChart,
  Search,
  Save,
  XCircle,
  Pencil,
  Trash2,
  Edit,
  Info,
} from "lucide-react";
import { SectionHeader } from "../../../components/SectionHeader";
import { useAlert } from "../../../context/AlertContext";
import { EditButton, SaveButton, CancelButton, DeleteButton, ExportButton, ImportButton, ClearButton, IconApproveButton, IconRejectButton, YesterdayButton, TodayButton, WeeklyButton, CustomButton, IconCancelTaskButton, IconSaveButton, IconDeleteButton, IconEditButton, IconViewButton } from "../../../AllButtons/AllButtons";
import { exportToExcel } from "../../../components/excelUtils";
import SheetHistory from "./SheetHistory";
import Pagination from "../../../components/Pagination";
import GlobalTable from "../../../components/GlobalTable";

export const EmpSheetHistory = () => {
  const { userProjects, error, editPerformanceSheet, performanceSheets, loading, fetchPerformanceSheets,deletesheet } = useUserContext();
  console.log("Performance Sheets:", performanceSheets); // Debugging: Check the structure

 const today = new Date().toISOString().split("T")[0];
const [startDate, setStartDate] = useState(today);
const [endDate, setEndDate] = useState(today);
  const sheets = performanceSheets?.data?.sheets || [];
  const [editingRow, setEditingRow] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterBy, setFilterBy] = useState("project_name");
      const [isCustomMode, setIsCustomMode] = useState(false);
      const [selectedRows, setSelectedRows] = useState([]);
      const [filteredData, setFilteredData] = useState([]);
      const [searchTerm, setSearchTerm] = useState("");
      const [modalOpen, setModalOpen] = useState(false);
        const [showSheetHistory, setShowSheetHistory] = useState(false);

      const [modalText, setModalText] = useState("");
      const openModal = (text) => {
        setModalText(text);
        setModalOpen(true);
      };
      
      const closeModal = () => {
        setModalOpen(false);
        setModalText("");
      };
      
     
  const [tags, setTags] = useState([]);
  const { showAlert } = useAlert();
  const recordsPerPage = 11;


    const clearFilter = () => {
    setSearchQuery("");
    setFilterBy("project_name");
    setIsCustomMode(false);
    setStartDate("");
    setEndDate("");
  };
  const clearFilter2 = () => {
   
    setFilterBy("project_name");
    setIsCustomMode(false);
    setStartDate("");
    setEndDate("");
  };


  // Effect to set initial tags when userProjects are loaded, or when entering edit mode
  useEffect(() => {
    if (editingRow !== null && sheets[editingRow] && userProjects?.data) {
      const currentSheet = sheets[editingRow];
      const selectedProject = userProjects.data.find(
        (project) => project.id === parseInt(currentSheet.project_id)
      );
      if (selectedProject) {
        setTags(selectedProject.tags_activitys);
      } else {
        setTags([]); // Clear tags if project not found
      }
    }
  }, [editingRow, sheets, userProjects]);
useEffect(() => {
  fetchPerformanceSheets().then(data => {
    console.log("Fetched data:", data);
  });
}, []);

  const handleEditClick = (index, sheet) => {
    setEditingRow(index);
    // When entering edit mode, set editedData.activity_type to the ID
    // so the <select> element can correctly display the current activity type.
    const currentActivityTag = tags.find(
      (tag) => tag.name === sheet.activity_type
    );
    setEditedData({
      ...sheet,
      activity_type: currentActivityTag ? currentActivityTag.id : sheet.activity_type,
    });

    // Also set tags relevant to the current project being edited
    if (userProjects?.data) {
      const selectedProject = userProjects.data.find(
        (project) => project.id === parseInt(sheet.project_id)
      );
      if (selectedProject) {
        setTags(selectedProject.tags_activitys);
      } else {
        setTags([]);
      }
    }
  };

  const handleChange = (e, field) => {
    let value = e.target.value;

    // For time field, clean up any AM/PM if mistakenly entered
    if (field === "time") {
      value = value.replace(/(AM|PM|am|pm)/gi, "").trim();
    }

    console.log(`Updating ${field}:`, value);

    // If the field is "project_id", update the tags state based on the selected project
    if (field === "project_id") {
      const selectedProject = userProjects.data.find(
        (project) => project.id === parseInt(value)
      );
      if (selectedProject) {
        setTags(selectedProject.tags_activitys);
      } else {
        setTags([]); // Clear tags if no project selected or found
      }
      setEditedData((prev) => ({
        ...prev,
        project_id: value,
        task_id: ""
      }));

    return; 
    }

    setEditedData((prevData) => ({ ...prevData, [field]: value }));
  };

  const ActivityTypeStatus = (ActivityType) => {
     const activitytype = (ActivityType || "").toLowerCase();
    switch(activitytype){
      case "billable" :
        return "bg-green-50 text-green-700 ring-1 ring-green-600/20 px-2 py-1 rounded-full text-xs font-medium ";
      case "non billable":
        return "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-600/20 px-2 py-1 rounded-full text-xs font-medium";
      default:
        return "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20 px-2 py-1 rounded-full text-xs font-medium"
    }
  }
  const getPendingTime = () => {
  const minutes = filteredSheets.reduce((total, sheet) => {
    if ((sheet.status || "").toLowerCase() === "pending") {
      return total + getMinutes(sheet.time);
    }
    return total;
  }, 0);
  return formatTime(minutes);
};

  const getYesterday = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split("T")[0]; 
  };
const handleSave = async (editId) => {
  if (!editId) {
    console.error("No ID provided for the sheet being edited.");
    return;
  }

  const toMinutes = (t = "") => {
    if (!/^\d{1,2}:\d{2}$/.test(t)) return 0;
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  const time = (editedData.time || "").trim();

  // ⛔ time format validation
  if (!/^\d{1,2}:\d{2}$/.test(time)) {
    showAlert({
      variant: "warning",
      title: "Invalid Time",
      message: "Please enter time in HH:MM format.",
    });
    return;
  }

  const spentMin = toMinutes(time);

  if (spentMin <= 0) {
    showAlert({
      variant: "warning",
      title: "Invalid Time",
      message: "Time must be greater than 0.",
    });
    return;
  }

  const workType = editedData.work_type; 

  const MAX_WFO_MIN = 8 * 60 + 30; // 08:30
  const MAX_WFH_MIN = 10 * 60;     // 10:00

  if (workType === "WFO" && spentMin > MAX_WFO_MIN) {
    showAlert({
      variant: "warning",
      title: "Time Limit Exceeded",
      message: "For WFO, time cannot exceed 8:30 hours.",
    });
    return;
  }

  if (workType === "WFH" && spentMin > MAX_WFH_MIN) {
    showAlert({
      variant: "warning",
      title: "Time Limit Exceeded",
      message: "For WFH, time cannot exceed 10:00 hours.",
    });
    return;
  }

  // 🧭 TRACKING LOGIC
  let tracking_mode = editedData.tracking_mode;
  let tracked_hours = editedData.tracked_hours;

  if (editedData.is_tracking === "yes") {
    if (tracking_mode === "partial") {
      if (!/^\d{1,2}:\d{2}$/.test(tracked_hours || "")) {
        showAlert({
          variant: "warning",
          title: "Tracked Time Missing",
          message: "Please enter tracked time for partial tracking.",
        });
        return;
      }

      const trackedMin = toMinutes(tracked_hours);

      if (trackedMin <= 0 || trackedMin > spentMin) {
        showAlert({
          variant: "warning",
          title: "Invalid Tracked Time",
          message:
            "Tracked time must be greater than 0 and not exceed total time.",
        });
        return;
      }
    } else {
      // all tracking
      tracked_hours = time;
    }
  } else {
    tracking_mode = "all";
    tracked_hours = "";
  }

  // 🔎 resolve activity type name
  const selectedTag = tags.find(
    (tag) => tag.id.toString() === editedData.activity_type?.toString()
  );
  const activityTypeName = selectedTag
    ? selectedTag.name
    : editedData.activity_type;

  const requestData = {
    id: editId,
    data: {
      project_id: editedData.project_id,
      task_id: editedData.task_id,
      date: editedData.date,
      time,
      work_type: editedData.work_type,

is_tracking: editedData.is_tracking ?? "no",
      tracking_mode,
      tracked_hours,

      activity_type: activityTypeName,
      narration: editedData.narration,
      project_type: editedData.project_type,
      project_type_status: editedData.project_type_status,
    },
  };

  try {
    const response = await editPerformanceSheet(requestData);
    if (response) {
      setEditingRow(null);
    }
  } catch (error) {
    console.error("Error saving performance sheet:", error);
  }
};



  // --- Start of fix for toLowerCase error ---
  const getStatusStyles = (status) => {
    // Ensure status is always a string, defaulting to an empty string if null/undefined
    const safeStatus = (status || "").toLowerCase();

    switch (safeStatus) {
      case "rejected":
        return "bg-red-50 text-red-700 ring-1 ring-red-600/20 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1";
      case "pending":
        return "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-600/20 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1";
      case "approved":
      case "completed":
        return "bg-green-50 text-green-700 ring-1 ring-green-600/20 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1";
      case "backdated":
       return "bg-purple-50 text-purple-700 ring-1 ring-purple-600/30 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1";

      default:
        // return "bg-gray-50 text-gray-700 ring-1 ring-gray-700/20 hover:bg-gray-100 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1";
        return "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-600/20 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1";
      }
  };

  const getStatusIcon = (status) => {
    // Ensure status is always a string, defaulting to an empty string if null/undefined
    const safeStatus = (status || "").toLowerCase();

    switch (safeStatus) {
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "approved":
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };
  // --- End of fix for toLowerCase error ---

const filteredSheets = sheets.filter((sheet) => {
  
  const sheetDate = new Date(sheet.date);
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;
 if ((sheet.status || "").toLowerCase() === "standup") {
    return false;
  }

  const matchesDate =
    (!start || sheetDate >= start) && (!end || sheetDate <= end);

const matchesSearch = () => {
  const value = searchQuery.toLowerCase().trim();
  if (!value) return true; 
 if (filterBy === "billable_approved") {
      return (
        (sheet.activity_type || "").toLowerCase() === "billable" &&
        (sheet.status || "").toLowerCase() === "approved"
      );
    }
  if (filterBy === "inhouse_approved") {
      return (
        (sheet.activity_type || "").toLowerCase() === "inhouse" &&
        (sheet.status || "").toLowerCase() === "approved"
      );
    }
  if (filterBy === "nowork_approved") {
      return (
        (sheet.activity_type || "").toLowerCase() === "no work" &&
        (sheet.status || "").toLowerCase() === "approved"
      );
    }
  if (filterBy === "project_name") {
    return sheet.project_name?.toLowerCase().includes(value);
  } else if (filterBy === "client_name") {
    return sheet.client_name?.toLowerCase().includes(value);
  } else if (filterBy === "date") {
    return sheet.date?.includes(value);
  } else if (filterBy === "activity_type" || filterBy === "status") {
    return (sheet[filterBy] || "").toLowerCase().trim() === value;
  }

  return true;
};


  return matchesDate && matchesSearch();
});

const isBackdated = (sheet) =>
  (sheet.status || "").toLowerCase() === "backdated";

const backdatedSheets = filteredSheets.filter(isBackdated);
const normalSheets = filteredSheets.filter(
  (sheet) => !isBackdated(sheet)
);


 const totalPages = Math.ceil(filteredSheets.length / recordsPerPage);

  const currentRecords = filteredSheets.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

// const getCategoryCount = (category) => {
//   const keyword = category.toLowerCase();
//   return filteredSheets.filter(sheet =>
//     (sheet.activity_type || "").toLowerCase() === keyword
//   ).length;
// };

// const getNoWorkCount = () => {
//   return filteredSheets.filter(sheet => !sheet.activity_type).length;
// };
// Normalize helper
const normalize = (text) =>
  (text || "").toLowerCase().trim().replace(/[^a-z]/g, "");

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

const getCategoryTime = (category) => {
  const keyword = normalize(category);
  const minutes = approvedData.reduce((total, sheet) => {
    if (normalize(sheet.activity_type) === keyword) {
      return total + getMinutes(sheet.time);
    }
    return total;
  }, 0);
  return formatTime(minutes);
};


const getNoWorkActivityTime = () => {
  const minutes = approvedData.reduce((total, sheet) => {
    // Match activity_type exactly "No Work" (case insensitive)
    if ((sheet.activity_type || "").trim().toLowerCase() === "no work") {
      return total + getMinutes(sheet.time);
    }
    return total;
  }, 0);
  return formatTime(minutes);
};



const getTotalTime = () => {
  const minutes = filteredSheets.reduce((total, sheet) => {
    return total + getMinutes(sheet.time);
  }, 0);
  return formatTime(minutes);
};


const approvedData = filteredSheets.filter(
  (sheet) => normalize(sheet.status) === "approved"
);
const handleCategoryClick = (category) => {
  const cat = category.toLowerCase();
  switch (cat) {
    case "billable":
   setFilterBy("billable_approved");
      
      setSearchQuery("billable");
      break;
    case "pending":
      setFilterBy("status");
      setSearchQuery("pending");
      break;
    case "in house":
      setFilterBy("inhouse_approved");
      setSearchQuery("in house");
      break;
    case "no work":
      setFilterBy("nowork_approved");
      setSearchQuery("no work");
      break;
    default:
      setFilterBy("project_name");
      setSearchQuery("");
      break;
  }
};

const handleTimeBlur = (e, field) => {
  let value = (e.target.value || "").trim();

  if (!value) return;

  if (/^\d{1,2}$/.test(value)) {
    value = value.padStart(2, "0") + ":00";
  } else if (/^\d{1,2}:\d$/.test(value)) {
    const [h, m] = value.split(":");
    value = `${h.padStart(2, "0")}:${m.padEnd(2, "0")}`;
  }

  handleChange({ target: { value } }, field);
};


const selectedProject = useMemo(() => {
  if (!editedData?.project_id || !Array.isArray(userProjects?.data)) return null;

  return userProjects.data.find(
    (p) => String(p.id) === String(editedData.project_id)
  );
}, [editedData?.project_id, userProjects]);

const projectTasks = selectedProject?.assigned_tasks || [];
     
const projectAllowsTracking = selectedProject?.project_tracking === "1";

const showPartial =
  !!selectedProject &&
  selectedProject.offline_hours !== null &&
  selectedProject.offline_hours !== "0" &&
  selectedProject.offline_hours !== 0;

useEffect(() => {
  if (!projectAllowsTracking) {
    setEditedData(prev => ({
      ...prev,
      is_tracking: "no",
      tracking_mode: "all",
      tracked_hours: "",
    }));
  }
}, [projectAllowsTracking]);


useEffect(() => {
  if (editedData.is_tracking === "yes" && !showPartial) {
    setEditedData(prev => ({
      ...prev,
      tracking_mode: "all",
      tracked_hours: "",
    }));
  }
}, [showPartial]);


const columns = useMemo(() => [
  {
    key: "date",
    label: "Date",
    render: (sheet) => (
      <span className="text-[10px] sm:text-[12px] font-medium">
        {sheet.date}
      </span>
    ),
  },
  {
    key: "project_name",
    label: "Project Name",
    render: (sheet) => (
      <span className="text-[10px] sm:text-[12px]">
        {sheet.project_name}
      </span>
    ),
  },
  {
    key: "time",
    label: "Time",
    render: (sheet) => (
      <span className="text-[10px] sm:text-[12px]">
        {sheet.time}
      </span>
    ),
  },
  {
    key: "narration",
    label: "Narration",
    render: (sheet) => (
      <div className="flex items-center justify-center gap-1 max-w-[220px]">
        <span
          className="truncate max-w-[160px]"
          title={sheet.narration}
        >
          {sheet.narration
            ? sheet.narration.replace(/[,.\n]/g, " ")
                .split(/\s+/)
                .slice(0, 1)
                .join(" ") + "..."
            : ""}
        </span>

        {sheet.narration && (
          <button
            onClick={() => openModal(sheet.narration)}
            type="button"
          >
            <Info className="h-4 w-4 text-blue-500" />
          </button>
        )}
      </div>
    ),
  },
  {
  key: "status",
  label: "Status",
  render: (sheet) => {
    const status = (sheet.status || "").toLowerCase();

    return (
      <div className="flex flex-row justify-center items-center gap-2">

        {/* STATUS BADGE */}
        <span className={getStatusStyles(sheet.status)}>
          {getStatusIcon(sheet.status)}
          {sheet.status}
        </span>

        {/* EDIT / DELETE — SAME COLUMN */}
        {(status === "rejected" || status === "standup") && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                handleEditClick(
                  sheets.findIndex(s => s.id === sheet.id),
                  sheet
                )
              }
              className="edit-btn inline-flex items-center px-3 py-1 rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-150"
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </button>

            <button
              type="button"
              onClick={() => deletesheet(sheet.id)}
              className="delete-btn inline-flex items-center px-3 py-1 rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-150"
            > 
              <Trash2 className="h-3 w-3 mr-1" />
              Delete
            </button>
          </div>
        )}
      </div>
    );
  },
},

], [openModal]);

const actionsComponent = {
  right: (sheet, index) => (
    <div className="flex justify-center gap-2">
      {(sheet.status?.toLowerCase() === "rejected" ||
        sheet.status?.toLowerCase() === "standup") && (
        <>
          <button
            onClick={() => handleEditClick(index, sheet)}
            className="inline-flex items-center px-3 py-1.5 rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </button>

          <button
            onClick={() => deletesheet(sheet.id)}
            className="inline-flex items-center px-3 py-1.5 rounded-md text-white bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </button>
        </>
      )}
    </div>
  ),
};



  

  return (
     <div className="manage-performance-sheet rounded-2xl border border-gray-200 bg-white shadow-md pb-3">
       <SectionHeader icon={BarChart} title="Manage Performance Sheet" subtitle="Track and manage performance sheets over " />
       <div className="flex flex-wrap items-center justify-between gap-2  top-0 bg-white z-10 shadow-md p-2 rounded-md">
 
         {/* <div className="flex items-center w-full md:w-auto flex-1 border border-gray-300 px-2 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
           <Search className="h-5 w-5 text-gray-400 mr-2" />
           <input
             type="text"
             className="w-full rounded-lg focus:outline-none py-2"
             placeholder="Search by Project Name..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
         </div> */}
 
 <div className="flex flex-col md:flex-row justify-between gap-4 w-full">
  <div className="tas flex flex-wrap md:flex-nowrap items-center gap-3 border p-1.5 rounded-lg shadow-md bg-white w-fit">
   
 
        
                  <div className="flex  items-center  border border-gray-300 px-2 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
                    <Search className="h-5 w-5 text-gray-400 mr-[5px]" />
                    <input
                      type="text"
                      className="w-full rounded-lg focus:outline-none py-1.5 text-sm"
                      placeholder={filterBy==="project_name" ? "Search by project name": filterBy==="client_name" ? "Search by client name": filterBy==="user_name" ? "Search by user name" :`Search by ${filterBy}`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />



                    
                  </div>
                          <select
   value={filterBy}
   onChange={(e) => setFilterBy(e.target.value)}
   className="border border-gray-300 rounded-lg px-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
 
 >
   {/* <option value="client_name">Client Name</option> */}
   <option value="project_name">Project Name </option>
   {/* <option value="user_name">Employee Name</option> */}
 </select>
 
 
         </div>
 
 
 
 
 
         {/* Buttons */}
         <div className="flex flex-wrap xl:flex-nowrap items-center gap-2">
 
           {!isCustomMode ? (
             <>
               <TodayButton onClick={() => {
                 const today = new Date().toISOString().split("T")[0];
                 setStartDate(today);
                 setEndDate(today);
               }} />
               <YesterdayButton onClick={() => {
                 const yesterday = new Date();
                 yesterday.setDate(yesterday.getDate() - 1);
                 const formatted = yesterday.toISOString().split("T")[0];
                 setStartDate(formatted);
                 setEndDate(formatted);
               }} />
 
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
                 className="border border-gray-300 rounded-lg px-4 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                 value={startDate}
                 onChange={(e) => setStartDate(e.target.value)}
                 max={endDate || undefined} 
               />
               <input
                 type="date"
                 className="border border-gray-300 rounded-lg px-4 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                 value={endDate}
                 onChange={(e) => setEndDate(e.target.value)}
                 min={startDate || undefined}  
               />
 
               
               <ClearButton
                 onClick={() => {
                  //  setSearchTerm("");
                  //  setStartDate("");
                  //  setEndDate("");
                  //    clearFilter("");
                    const yesterday = getYesterday();
 //  setIsCustomMode(false);
    setSearchTerm("");
   setStartDate(yesterday);
   setEndDate(yesterday);
                 }}
               />
 
       <CancelButton onClick={() => {
   const yesterday = getYesterday();
   setIsCustomMode(false);
   setSearchTerm("");
   setStartDate(yesterday);
   setEndDate(yesterday);
 }} />
 
             </>
           )}
 
 <ExportButton
   onClick={() => {
     const exportData = filteredSheets.map(sheet => ({
       date: sheet.date,
       user_name: sheet.user_name,
       client_name: sheet.client_name,
       project_name: sheet.project_name,
       work_type: sheet.work_type,
       activity_type: sheet.activity_type,
       time: sheet.time,
       narration: sheet.narration,
       status: sheet.status
     }));
     exportToExcel(exportData, "sheet.xlsx");
   }}
 />
 {!isCustomMode && (
            <button
  onClick={() => setShowSheetHistory(true)}
  className="flex items-center px-4 py-1.5 text-sm bg-blue-600 text-white whitespace-nowrap font-medium rounded-lg hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 transform transition-all duration-200 ease-in-out hover:shadow-lg hover:-translate-y-0.5"
>
  History
</button>
 )}
           {/* <ImportButton onClick={() => alert("Handle import logic here")} /> */}
           {/* <ImportButton /> */}
 
 
         </div>
</div>
    <div className="w-full  grid grid-cols-2 md:grid-cols-5 gap-4 ">  
 <div className="bg-green-50 border border-green-200 px-2 py-1 rounded shadow cursor-pointer transform transition-transform duration-300 hover:scale-105" >
   <div className="text-sm font-semibold text-green-800">{getCategoryTime("billable")}</div>
   <div className="text-xs text-green-600">Billable</div>
 </div>
 
    <div className="bg-yellow-50 border border-yellow-200 px-2 py-1 rounded shadow cursor-pointer transform transition-transform duration-300 hover:scale-105" >
  <div className="text-sm font-semibold text-yellow-800">{getPendingTime()}</div>
  <div className="text-xs text-yellow-600">Pending</div>
</div>


 
 
 <div className="bg-blue-50 border border-blue-200 px-2 py-1 rounded shadow cursor-pointer transform transition-transform duration-300 hover:scale-105" >
   <div className="text-sm font-semibold text-blue-800">{getCategoryTime("in house")}</div>
   <div className="text-xs text-blue-600">In-House</div>
 </div>
 
<div className="bg-gray-100 border border-gray-300 px-2 py-1 rounded shadow cursor-pointer transform transition-transform duration-300 hover:scale-105" >
  <div className="text-sm font-semibold text-gray-700">{getNoWorkActivityTime()}</div>
  <div className="text-xs text-gray-600">No Work</div>
</div>
 
 <div className="bg-indigo-50 border border-indigo-200 px-2 py-1 rounded shadow col-span-2 md:col-span-1 cursor-pointer transform transition-transform duration-300 hover:scale-105" >
   <div className="text-sm font-semibold text-indigo-800">{getTotalTime()}</div>
   <div className="text-xs text-indigo-600">Total Hours</div>
 </div>
 </div>   
 </div> 





 
  


     

      <div className="max-w-full overflow-x-auto ">
        <div className="relative z-10">
          <GlobalTable
  columns={columns}
  data={currentRecords}
  isLoading={loading}
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={handlePageChange}
  hideActions={true} 
  stickyHeader
  emptyStateTitle="No performance sheets found"
  emptyStateMessage="No data available for selected filters"
/>
                    {modalOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50" onClick={closeModal} >
<div className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-6 relative"  onClick={(e) => e.stopPropagation()} >         
  <button
            onClick={closeModal}
            aria-label="Close modal"
            className="absolute top-2 right-2 text-2xl font-bold"
          >
            &times;
          </button>
          <div className="whitespace-pre-wrap text-gray-900">{modalText}</div>
        </div>
      </div>
    )}



          {editingRow !== null && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 overflow-auto max-h-[90vh] relative">
      <h2 className="text-lg font-semibold mb-4">Edit Timesheet Entry</h2>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <label className="block mb-1">Project</label>
          <select
            id="projectId"
            name="projectId"
            value={editedData.project_id || ""}
            onChange={(e) => handleChange(e, "project_id")}
            className="w-full h-9 p-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-xs"
          >
            <option value="">Select Project</option>
            {userProjects?.data?.map((project) => (
              <option key={project.id} value={project.id}>
                {project.project_name}
              </option>
            ))}
          </select>
        </div>

<div>
  <label className="block mb-1">Task</label>
  <select
    value={editedData.task_id || ""}
    onChange={(e) => handleChange(e, "task_id")}
    disabled={!editedData.project_id}
    className="w-full h-9 p-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-xs"
  >
    <option value="">Select Task</option>

    {projectTasks.map((task) => (
      <option key={task.id} value={task.id}>
        {task.title}
      </option>
    ))}

    {!editedData.project_id && (
      <option disabled>Select Project First</option>
    )}
  </select>
</div>


        
                <div>
                   <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          Date
                        </label>
                        <input
                          type="date"
                          id="date"
                          max={new Date().toISOString().split("T")[0]}
                          name="date"
                          value={editedData.date}
                          onChange={(e) => handleChange(e, "date", e.target.value)} // Corrected line({ ...formData, date: e.target.value })} // Corrected line
                          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-700 focus:outline-none"
                          // readOnly
                        />
                </div>

        <div>
          <label className="block mb-1">Work Type</label>
          <select
            id="workType"
            name="workType"
            value={editedData.work_type || ""}
            onChange={(e) => handleChange(e, "work_type")}
            className="w-full h-9 p-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-xs"
          >
            <option value="">Select Work Type</option>
            <option value="WFO">Work From Office</option>
            <option value="WFH">Work From Home</option>
          </select>
        </div>

        {/* <div>
          <label className="block mb-1">Activity Type</label>
          <select
            id="activityType"
            name="activityType"
            value={editedData.activity_type || ""}
            onChange={(e) => handleChange(e, "activity_type")}
            className="w-full h-9 p-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-xs"
          >
            <option value="">Select Activity</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>
        </div> */}

      {/* HOURS SPENT */}
<div>
  <label className="block mb-1">Hours Spent (HH:MM)</label>
  <input
    type="text"
    value={editedData.time || ""}
    onChange={(e) => handleChange(e, "time")}
    onBlur={(e) => handleTimeBlur(e, "time")}
    className="w-full border rounded px-2 py-1"
    placeholder="HH:MM"
    maxLength={5}
    inputMode="numeric"
  />
</div>

{/* TRACKING TOGGLE */}
{projectAllowsTracking && (
<div>
  <label className="block mb-1">Tracking</label>

  <button
    type="button"
 onClick={() => {
  const enabled = editedData.is_tracking === "yes";

  setEditedData(prev => ({
    ...prev,
    is_tracking: enabled ? "no" : "yes",
    tracking_mode: enabled ? "all" : prev.tracking_mode ?? "all",
    tracked_hours: enabled ? "" : prev.tracked_hours ?? "",
  }));
}}

    className={`relative inline-flex h-5 w-10 items-center rounded-full transition
      ${editedData.is_tracking === "yes" ? "bg-sky-600" : "bg-gray-300"}`}
  >
    <span
      className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform
        ${editedData.is_tracking === "yes" ? "translate-x-5" : "translate-x-1"}`}
    />
  </button>

  <span className="ml-2 text-xs text-gray-600">
    {editedData.is_tracking === "yes" ? "Enabled" : "Disabled"}
  </span>
</div>
)}

{projectAllowsTracking && editedData.is_tracking === "yes" && (
  <div className="col-span-2 flex rounded-lg bg-gray-100 p-1">
    <button
      type="button"
      onClick={() =>
        handleChange({ target: { value: "all" } }, "tracking_mode")
      }
      className={`flex-1 py-1.5 text-xs font-medium rounded-md
        ${editedData.tracking_mode === "all"
          ? "bg-white shadow text-gray-900"
          : "text-gray-500"}`}
    >
      All
    </button>
{projectAllowsTracking && showPartial && (
    <button
      type="button"
      onClick={() => {
        handleChange({ target: { value: "partial" } }, "tracking_mode");

        // initialize tracked time if empty
        if (!editedData.tracked_hours && editedData.time) {
          handleChange(
            { target: { value: editedData.time } },
            "tracked_hours"
          );
        }
      }}
      className={`flex-1 py-1.5 text-xs font-medium rounded-md
        ${editedData.tracking_mode === "partial"
          ? "bg-white shadow text-gray-900"
          : "text-gray-500"}`}
    >
      Partial
    </button>
)}
  </div>
)}


{projectAllowsTracking &&
 editedData.is_tracking === "yes" &&
 editedData.tracking_mode === "partial" && (

    <div className="col-span-2">
      <label className="block mb-1">Tracked Time (HH:MM)</label>
      <input
        type="text"
        value={editedData.tracked_hours || ""}
        onChange={(e) => handleChange(e, "tracked_hours")}
        onBlur={(e) => handleTimeBlur(e, "tracked_hours")}
        className="w-full border rounded px-2 py-1"
        placeholder="HH:MM"
        maxLength={5}
        inputMode="numeric"
      />
      <p className="text-xs text-gray-400 mt-1">
        Remaining time will be marked offline
      </p>
    </div>
)}


        {/* <div>
          <label className="block mb-1">Project Type</label>
          <select
            id="project_type"
            name="project_type"
            value={editedData.project_type || ""}
            onChange={(e) => handleChange(e, "project_type")}
            className="w-full h-9 p-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-xs"
          >
            <option value="">Select Project Type</option>
            <option value="Fixed">Fixed</option>
            <option value="Hourly">Hourly</option>
            <option value="No Work">No Work</option>
          </select>
        </div>

        <div>
          <label className="block mb-1">Project Type Status</label>
          <select
            id="project_type_status"
            name="project_type_status"
            value={editedData.project_type_status || ""}
            onChange={(e) => handleChange(e, "project_type_status")}
            className="w-full h-9 p-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-xs"
          >
            <option value="">Select Status</option>
            {editedData.project_type === "Fixed" ? (
              <option value="Offline">Offline</option>
            ) : (
              <>
                <option value="Tracker">Tracker</option>
                <option value="Offline">Offline</option>
              </>
            )}
          </select>
        </div> */}

        <div className="col-span-2">
          <label className="block mb-1">Narration</label>
          <textarea
            value={editedData.narration || ""}
            onChange={(e) => handleChange(e, "narration")}
            className="w-full border rounded px-2 py-1 min-h-[60px] max-h-[200px] overflow-auto"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        <button
          onClick={() => handleSave(editedData.id)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Save
        </button>
        <button
          onClick={() => setEditingRow(null)}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

        </div>
      </div>


             {showSheetHistory && (
  <SheetHistory onClose={() => setShowSheetHistory(false)} />
)}
    </div>
  );
};

export default EmpSheetHistory;
