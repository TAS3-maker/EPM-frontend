import React, { useState, useEffect } from "react";
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
    return yesterday.toISOString().split("T")[0]; // Format: "YYYY-MM-DD"
  };

  const handleSave = async (editId) => {
    if (!editId) {
      console.error("No ID provided for the sheet being edited.");
      return;
    }

    // Find the name of the activity type based on its ID before sending
    const selectedTag = tags.find(
      (tag) => tag.id.toString() === editedData.activity_type.toString()
    );
    const activityTypeName = selectedTag ? selectedTag.name : editedData.activity_type;

    const requestData = {
      id: editId,
      data: {
        project_id: editedData.project_id,
        date: editedData.date,
        time: editedData.time,
        work_type: editedData.work_type,
        activity_type: activityTypeName, // Send the name, not the ID
        narration: editedData.narration,
        project_type: editedData.project_type,
        project_type_status: editedData.project_type_status,
      },
    };

    try {
      const response = await editPerformanceSheet(requestData);
      if (response) {
        setEditingRow(null); // Exit edit mode on success
        // Assuming editPerformanceSheet in context either updates local state
        // or triggers a re-fetch of performance sheets.
        // If not, you might need to manually update the 'sheets' state here
        // or trigger a refetch from the UserContext.
      }
    } catch (error) {
      console.error("Error saving performance sheet:", error);
      // Optionally, show an error message to the user
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


  const totalPages = Math.ceil(filteredSheets.length / recordsPerPage);

  // Get current records for the current page
  const currentRecords = filteredSheets.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  // Handle pagination click
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

  return (
     <div className="manage-performance-sheet rounded-2xl border border-gray-200 bg-white shadow-md max-h-screen">
       <SectionHeader icon={BarChart} title="Manage Performance Sheet" subtitle="Track and manage performance sheets over time" />
       <div className="flex flex-wrap items-center justify-between gap-4  top-0 bg-white z-10 shadow-md p-4 rounded-md">
 
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
  <div className="tas flex flex-wrap md:flex-nowrap items-center gap-3 border p-2 rounded-lg shadow-md bg-white w-fit">
   
 
        
                  <div className="flex  items-center  border border-gray-300 px-2 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
                    <Search className="h-5 w-5 text-gray-400 mr-[5px]" />
                    <input
                      type="text"
                      className="w-full rounded-lg focus:outline-none py-2"
                      placeholder={filterBy==="project_name" ? "Search by project name": filterBy==="client_name" ? "Search by client name": filterBy==="user_name" ? "Search by user name" :`Search by ${filterBy}`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
 
 
         </div>
 
 
 
 
 
         {/* Buttons */}
         <div className="flex flex-wrap xl:flex-nowrap items-center gap-2">
         <select
   value={filterBy}
   onChange={(e) => setFilterBy(e.target.value)}
   className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
 
 >
   <option value="client_name">Client Name</option>
   <option value="project_name">Project Name </option>
   {/* <option value="user_name">Employee Name</option> */}
 </select>
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
                   setSearchTerm("");
                   setStartDate("");
                   setEndDate("");
                     clearFilter("");
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
           {/* <ImportButton onClick={() => alert("Handle import logic here")} /> */}
           {/* <ImportButton /> */}
 
 
         </div>
</div>
    <div className="w-full  grid grid-cols-2 md:grid-cols-5 gap-4 ">  
 <div className="bg-green-50 border border-green-200 px-2 py-1 rounded shadow cursor-pointer transform transition-transform duration-300 hover:scale-105" onClick={()=> handleCategoryClick("Billable")}>
   <div className="text-sm font-semibold text-green-800">{getCategoryTime("billable")}</div>
   <div className="text-xs text-green-600">Billable</div>
 </div>
 
    <div className="bg-yellow-50 border border-yellow-200 px-2 py-1 rounded shadow cursor-pointer transform transition-transform duration-300 hover:scale-105" onClick={()=> handleCategoryClick("pending")}>
  <div className="text-sm font-semibold text-yellow-800">{getPendingTime()}</div>
  <div className="text-xs text-yellow-600">Pending</div>
</div>


 
 
 <div className="bg-blue-50 border border-blue-200 px-2 py-1 rounded shadow cursor-pointer transform transition-transform duration-300 hover:scale-105" onClick={()=>handleCategoryClick("in house")}>
   <div className="text-sm font-semibold text-blue-800">{getCategoryTime("in house")}</div>
   <div className="text-xs text-blue-600">In-House</div>
 </div>
 
<div className="bg-gray-100 border border-gray-300 px-2 py-1 rounded shadow cursor-pointer transform transition-transform duration-300 hover:scale-105" onClick={()=>handleCategoryClick("no work")}>
  <div className="text-sm font-semibold text-gray-700">{getNoWorkActivityTime()}</div>
  <div className="text-xs text-gray-600">No Work</div>
</div>
 
 <div className="bg-indigo-50 border border-indigo-200 px-2 py-1 rounded shadow col-span-2 md:col-span-1 cursor-pointer transform transition-transform duration-300 hover:scale-105" onClick={()=> handleCategoryClick("")}>
   <div className="text-sm font-semibold text-indigo-800">{getTotalTime()}</div>
   <div className="text-xs text-indigo-600">Total Hours</div>
 </div>
 </div>   
 </div> 





 
  


     

      <div className="max-w-full overflow-x-auto ">
        <div className="relative z-10">
          <table className="w-full border-collapse">
            <thead>
              <tr className="table-bg-heading">
                {[
                  { label: "Date", icon: Calendar },
                  { label: "Client Name", icon: User },
                  { label: "Project Name", icon: Briefcase },
                  // { label: "Work Type", icon: Target },
                  { label: "Activity", icon: Clock },
                  { label: "Time", icon: Clock },
                  { label: "Project Type", icon: Clock },
                  // { label: "Project Type Status", icon: Clock },
                  { label: "Narration", icon: FileText },
                  { label: "Status", icon: CheckCircle },
                ].map(({ label, icon: Icon }, index) => (
                  <th key={index} className="text-center px-2 text-[10px] sm:text-[12px] table-th-tr-row">
                    <div className="flex items-center justify-center gap-2">
                      <Icon className="h-3 w-3 text-white" />
                      <span className="text-gray-900 text-nowrap text-white">
                        {label}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-6 py-20 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
                    Loading...
                  </td>
                </tr>
              ) : currentRecords.length > 0 ? (
                currentRecords.map((sheet, index) => (
                  <tr
                    key={index}
                    className="hover:bg-blue-50/50 transition-all duration-200 ease-in-out group"
                  >
                    <td className="px-2 text-[10px] sm:text-[12px] py-4 text-gray-700 font-medium text-nowrap text-center">
                      {sheet.date}
                    </td>
                    <td className="px-2 text-[10px] sm:text-[12px] py-4 text-nowrap text-center">
                      {sheet.client_name}
                    </td>
                    <td className="px-2 text-[10px] sm:text-[12px] py-4 text-nowrap text-center">
                      {sheet.project_name}
                    </td>

                    {/* <td className="px-6 py-4 text-nowrap text-center">
                      {sheet.work_type}
                    </td> */}

                    <td className="px-2 text-[10px] sm:text-[12px] py-4 text-nowrap text-center">
                       <span className={ActivityTypeStatus(sheet.activity_type)}>{sheet.activity_type}</span>
                    </td>

                    <td className="px-2 text-[10px] sm:text-[12px] py-4 text-nowrap text-center">
                      {sheet.time}
                    </td>

                    <td className="px-2 text-[10px] sm:text-[12px] py-4 text-nowrap text-center">
                      {sheet.project_type === "Hourly" ? <span className="bg-yellow-50 text-yellow-700 ring-1 ring-yellow-600/20 px-2 py-1 rounded-full text-xs font-medium">{sheet.project_type}</span> : <span className="bg-blue-50 text-blue-700 ring-1 ring-blue-600/20 px-2 py-1 rounded-full text-xs font-medium">{sheet.project_type}</span>}
                    </td>

                    {/* <td className="px-6 py-4 text-nowrap text-center">
                      {sheet.project_type_status}
                    </td> */}

                                <td className="px-2 text-[10px] sm:text-[12px] py-4 text-center  hover:bg-white hover:text-black max-w-[220px] whitespace-nowrap">
                  <span className="overflow-hidden text-ellipsis whitespace-nowrap max-w-[160px] inline-block align-middle" title={sheet.narration}>
                    {sheet.narration
                      ? sheet.narration.replace(/[,.\n]/g, " ").split(/\s+/).slice(0, 1).join(" ") + "..."
                      : ""}
                  </span>
                  {sheet.narration && (
                    <button
                      onClick={() => openModal(sheet.narration)}
                      className="inline-block align-middle ml-1 p-1 rounded hover:bg-gray-200"
                      aria-label="Show full narration"
                      type="button"
                    >
                      <Info className="h-4 w-4 text-blue-500" />
                    </button>
                  )}
                </td>

                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        {/* {sheet.status && sheet.status.length > 7 && (
                            <span className={`${getStatusStyles(sheet.status)}`}>
                              {getStatusIcon(sheet.status)}
                              {sheet.status}
                            </span>
                          )} */}
                        <span className={`${getStatusStyles(sheet.status)}`}>
                          {getStatusIcon(sheet.status)}
                          {sheet.status}
                        </span>

                        {
                          sheet.status && sheet.status.toLowerCase() === "rejected" && (
                            <>
                            <button
                              onClick={() => handleEditClick(index, sheet)}
                              className="edit-btn inline-flex items-center px-3 py-1.5 rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-150"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </button>
                             <button
                              onClick={() => deletesheet(sheet.id)}
                              className="delete-btn inline-flex items-center px-3 py-1.5 rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-150"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                            </button>
                            </>
                          )
                        }
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="10" // Increased colspan to match the number of columns
                    className="px-6 py-20 text-center text-nowrap"
                  >
                    No performance sheets found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
                    {modalOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
<div className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-6 relative">          <button
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

        <div>
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
        </div>

        <div>
          <label className="block mb-1">Time (HH:MM)</label>
          <input
            type="text"
            value={editedData.time || ""}
            onChange={(e) => handleChange(e, "time")}
            className="w-full border rounded px-2 py-1"
            placeholder="HH:MM"
            maxLength={5}
            inputMode="numeric"
            onKeyDown={(e) => {
              const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];
              const isNumber = /^[0-9]$/.test(e.key);
              const isColon = e.key === ":";

              if (!isNumber && !isColon && !allowedKeys.includes(e.key)) {
                e.preventDefault();
              }

              if (
                e.target.value.length === 2 &&
                isNumber &&
                e.key !== "Backspace" &&
                !e.target.value.includes(":")
              ) {
                e.target.value += ":";
              }
            }}
          />



          
        </div>

        <div>
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
        </div>

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

      <div className="flex justify-center items-center gap-4 py-4">
        <button
          className={`px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-150 ${
            currentPage === 1
              ? "bg-gray-200 disabled:opacity-50 cursor-not-allowed"
              : "bg-blue-100 hover:bg-blue-200 ring-2 ring-blue-400 shadow-md font-semibold"
          }`}
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            className={`px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-150 ${
              currentPage === page
                ? "bg-blue-600 text-white font-semibold ring-2 ring-blue-400 shadow-md"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </button>
        ))}

        <button
          className={`px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-150 ${
            currentPage === totalPages
              ? "bg-gray-200 disabled:opacity-50 cursor-not-allowed"
              : "bg-blue-100 hover:bg-blue-200 ring-2 ring-blue-400 shadow-md font-semibold"
          }`}
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default EmpSheetHistory;
