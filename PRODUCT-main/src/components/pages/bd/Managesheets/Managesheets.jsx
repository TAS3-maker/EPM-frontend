import React, { useEffect, useState } from "react";
import { useBDProjectsAssigned } from "../../../context/BDProjectsassigned";
import { Loader2, Calendar, User, Briefcase, Clock, FileText, Target, BarChart, Search, CheckCircle, XCircle, Pencil, Ban } from "lucide-react";
import { exportToExcel } from "../../../components/excelUtils";
import { SectionHeader } from '../../../components/SectionHeader';
import { EditButton, SaveButton, CancelButton, DeleteButton, ExportButton, ImportButton, ClearButton, IconApproveButton, IconRejectButton, YesterdayButton, TodayButton, WeeklyButton, CustomButton, IconCancelTaskButton, IconSaveButton, IconDeleteButton, IconEditButton, IconViewButton } from "../../../AllButtons/AllButtons";
import { usePMContext } from "../../../context/PMContext";
// import { useBDProjectsAssigned } from "../../../context/BDProjectsassigned";
export const Managesheets = () => {
  const { performanceData, fetchPerformanceDetails, isLoading, approvePerformanceSheet, rejectPerformanceSheet } = useBDProjectsAssigned();
  const [searchTerm, setSearchTerm] = useState("");
  // const {fetchPerformanceDetails,performanceData} = usePMContext();
  const [filteredData, setFilteredData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [editMode, setEditMode] = useState({});
  // const {approvePerformanceSheet}
  const [showPopup, setShowPopup] = useState(false);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState("client_name"); // Default filter by name
const [userRole, setUserRole] = useState("");
// const isSuperAdmin = userRole === "superadmin";



  // const [startDate, setStartDate] = useState(() => {
  //   const yesterday = new Date();
  //   yesterday.setDate(yesterday.getDate() - 1);
  //   return yesterday.toISOString().split("T")[0];
  // });

  // const [endDate, setEndDate] = useState(() => {
  //   const yesterday = new Date();
  //   yesterday.setDate(yesterday.getDate() - 1);
  //   return yesterday.toISOString().split("T")[0];
  // });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  // console.log("performance data", performanceData);

  const getYesterday = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split("T")[0]; // Format: "YYYY-MM-DD"
  };

  const [startDate, setStartDate] = useState(getYesterday);
  const [endDate, setEndDate] = useState(getYesterday);
  

  useEffect(() => {
    const yesterday = getYesterday();
    setStartDate(yesterday);
    setEndDate(yesterday);
  }, []);



  const clearFilter = () => {
    setSearchQuery("");
    setFilterBy("name");
  };

useEffect(() => {
  const role = localStorage.getItem("user_name");
  setUserRole(role);
   fetchPerformanceDetails();
}, []);




  const toggleEditMode = (id) => {

    console.log("idddddd",id);
    setEditMode((prev) => ({ ...prev, [id]: !prev[id] }));
  };
useEffect(() => {
  const dataToUse = performanceData;
  const dataReady = Array.isArray(dataToUse) && dataToUse.length > 0;

  console.log("🔍 Role:", userRole);
  console.log("✅ Using data: performanceData");
  console.log("📦 Raw Data:", dataToUse);

  if (!dataReady) {
    console.log("❌ Data is not ready or empty");
    setFilteredData([]);
    return;
  }

  let filtered = dataToUse.flatMap((user) =>
    (user?.sheets || []).map((sheet, idx) => {
      console.log(`📄 Sheet ${idx} for ${user.user_name}:`, sheet);
      return {
        ...sheet,
        user_name: user.user_name,
        id: sheet?.id ?? `${user.user_name}_${sheet?.date ?? "nodate"}`,
      };
    })
  );

  console.log("🧪 After flattening:", filtered);

  // 🗓️ Date Filter
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const startStr = start.toISOString().split("T")[0];
    const endStr = end.toISOString().split("T")[0];

    filtered = filtered.filter((sheet) => {
      if (!sheet?.date) {
        console.log("⚠️ Skipping sheet without date:", sheet);
        return false;
      }
      const sheetDateStr = sheet.date.split("T")[0];
      const isInRange = sheetDateStr >= startStr && sheetDateStr <= endStr;
      if (!isInRange) {
        console.log("📅 Skipping out-of-range date:", sheetDateStr);
      }
      return isInRange;
    });
  }

  console.log("🔍 After date filtering:", filtered);

  // 🔍 Search Filter
  const trimmedSearchQuery = searchQuery?.trim().toLowerCase();
  if (trimmedSearchQuery) {
    filtered = filtered.filter((sheet) => {
      const value = (sheet?.[filterBy] || "").toLowerCase();
      const match = value.includes(trimmedSearchQuery);
      if (!match) {
        console.log(`🔎 No match for "${trimmedSearchQuery}" in`, value);
      }
      return match;
    });
  }

  console.log("✅ Final Filtered Data:", filtered);

  setFilteredData(filtered);
}, [
  searchQuery,
  filterBy,
  startDate,
  endDate,
  performanceData,
]);






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


const getNoWorkTime = () => {
  const minutes = approvedData.reduce((total, sheet) => {
    if (!normalize(sheet.activity_type)) {
      return total + getMinutes(sheet.time);
    }
    return total;
  }, 0);
  return formatTime(minutes);
};


const getTotalTime = () => {
  const minutes = approvedData.reduce((total, sheet) => {
    return total + getMinutes(sheet.time);
  }, 0);
  return formatTime(minutes);
};







  const handleStatusChange = async (sheet, newStatus) => {
    try {
      if (newStatus === "approved") {
        await approvePerformanceSheet(sheet.id);
      } else if (newStatus === "rejected") {
        await rejectPerformanceSheet(sheet.id);
      }
      fetchPerformanceDetails();
    } catch (error) {
      console.error("Error Updating Sheet Status:", error);
    }
  };

// Helper to get the right sheets depending on search and user role
const getActiveSheets = () => {
  if (searchTerm) {
    return filteredData;
  }

  return performanceData.flatMap(user => user.sheets || []);
};


// Select All toggle logic
const handleSelectAll = () => {
  const allSheets = getActiveSheets();

  if (selectedRows.length === allSheets.length) {
    setSelectedRows([]); // Deselect all
  } else {
    const allSelectedIds = allSheets.map(sheet => sheet.id);
    setSelectedRows(allSelectedIds); // Select all
  }
};

// Individual row select toggle
const handleRowSelect = (id) => {
  setSelectedRows((prevSelected) =>
    prevSelected.includes(id)
      ? prevSelected.filter((rowId) => rowId !== id)
      : [...prevSelected, id]
  );
};

  const allSheets = searchTerm ? filteredData : performanceData.flatMap(user => user.sheets);
  const isDateFiltered = filteredData.length > 0;

const paginatedData = () => {
  const isFilterApplied = searchTerm || startDate || endDate;

  const dataToDisplay = isFilterApplied
    ? filteredData
    : performanceData.flatMap((user) =>
        (user?.sheets || []).map((sheet) => ({
          ...sheet,
          user_name: user.user_name,
        }))
      );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return dataToDisplay.slice(startIndex, endIndex);
};

const isFilterApplied = searchTerm || startDate || endDate;

const totalPages = Math.ceil(
  (isFilterApplied
    ? filteredData.length
    : performanceData.reduce((acc, user) => acc + (user.sheets?.length || 0), 0)
  ) / itemsPerPage
);

const approvedData = filteredData.filter(
  (sheet) => normalize(sheet.status) === "approved"
);


  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-md max-h-screen overflow-y-auto">
      <SectionHeader icon={BarChart} title="Manage Performance Sheet" subtitle="Track and manage performance sheets over time" />
      <div className="flex flex-wrap items-center justify-between gap-4 sticky top-0 bg-white z-10 shadow-md p-4 rounded-md">

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


 <div className="flex flex-wrap md:flex-nowrap items-center gap-3 border p-2 rounded-lg shadow-md bg-white ">
  

       
                 <div className="flex  items-center  border border-gray-300 px-2 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
                   <Search className="h-5 w-5 text-gray-400 mr-[5px]" />
                   <input
                     type="text"
                     className="w-full rounded-lg focus:outline-none py-2"
                     placeholder={`Search by ${filterBy}`}
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                   />
                 </div>


        </div>






        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-2">
        <select
  value={filterBy}
  onChange={(e) => setFilterBy(e.target.value)}
  className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"

>
  <option value="client_name">Client Name</option>
  <option value="project_name">Project Name</option>
  <option value="user_name">Employee Name</option>
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
  // setIsCustomMode(false);
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
    const exportData = filteredData.map(sheet => ({
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
<div className="bg-green-50 border border-green-200 px-2 py-1 rounded shadow">
  <div className="text-sm font-semibold text-green-800">{getCategoryTime("billable")}</div>
  <div className="text-xs text-green-600">Billable</div>
</div>

<div className="bg-yellow-50 border border-yellow-200 px-2 py-1 rounded shadow">
  <div className="text-sm font-semibold text-yellow-800">{getCategoryTime("non billable")}</div>
  <div className="text-xs text-yellow-600">Non-Billable</div>
</div>

<div className="bg-blue-50 border border-blue-200 px-2 py-1 rounded shadow">
  <div className="text-sm font-semibold text-blue-800">{getCategoryTime("in house")}</div>
  <div className="text-xs text-blue-600">In-House</div>
</div>

<div className="bg-gray-100 border border-gray-300 px-2 py-1 rounded shadow">
  <div className="text-sm font-semibold text-gray-700">{getNoWorkTime()}</div>
  <div className="text-xs text-gray-600">No Work</div>
</div>

<div className="bg-indigo-50 border border-indigo-200 px-2 py-1 rounded shadow col-span-2 md:col-span-1">
  <div className="text-sm font-semibold text-indigo-800">{getTotalTime()}</div>
  <div className="text-xs text-indigo-600">Total Hours</div>
</div>

</div>   
  


      {selectedRows.length > 0 && (
        <select
          className="px-3 py-2 border rounded-lg cursor-pointer bg-gray-100 text-gray-700"
          onChange={(e) => {
            const newStatus = e.target.value;
            allSheets.forEach(sheet => {
              if (selectedRows.includes(sheet.id)) {
                handleStatusChange(sheet, newStatus);
              }
            });
          }}
        >
          <option value="">Change Status</option>
          {/* <option value="pending">Pending</option> */}
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      )}




      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="table-bg-heading table-th-tr-row">
                <th className="px-4 py-2 text-center">

                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedRows.length === paginatedData.length && paginatedData.length > 0}
                  />
                </th>
                {[
                  { label: "Date", icon: Calendar },
                  { label: "Employee Name", icon: User },
                  { label: "Client Name", icon: User },
                  { label: "Project Name", icon: Briefcase },
                  { label: "Work Type", icon: Target },
                  { label: "Activity", icon: Clock },
                  { label: "Time", icon: Clock },
                  { label: "Narration", icon: FileText },
                  { label: "Status" }
                ].map(({ label, icon: Icon }, index) => (
                  <th key={index} className="px-4 py-2 text-center font-semibold whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      {Icon && <Icon className="h-4 w-4 text-white" />}
                      {label}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan="10" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div className="relative">
                        <div className="h-16 w-16 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin"></div>
                        <Loader2 className="h-8 w-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                      </div>
                      <span className="text-gray-600 text-lg font-medium">Loading your performance data...</span>
                      <p className="text-gray-400">Please wait while we fetch your records</p>
                    </div>F
                  </td>
                </tr>
              ) : (
                paginatedData().map((sheet, index) => (

                  <tr key={index} className="hover:bg-blue-50/50 transition-all duration-200 ease-in-out">
                          <td className="px-4 py-4 text-center">
    {sheet.status?.toLowerCase() !== "rejected" ? (
        <input
            type="checkbox"
            checked={selectedRows.includes(sheet.id)}
            onChange={() => handleRowSelect(sheet.id)}
        />
    ) : (
        // Render an empty cell if the status is "rejected"
        // This keeps the table column structure correct
        <span></span>
    )}
</td>
                    <td className="px-4 py-4 text-center text-gray-700 whitespace-nowrap">{sheet.date}</td>
                    <td className="px-4 py-4 text-center text-gray-700 whitespace-nowrap">{sheet.user_name}</td>
                    <td className="px-4 py-4 text-center text-gray-700 whitespace-nowrap">{sheet.client_name}</td>
                    <td className="px-4 py-4 text-center text-gray-700 whitespace-nowrap">{sheet.project_name}</td>
                    <td className="px-4 py-4 text-center text-gray-700 whitespace-nowrap">{sheet.work_type}</td>
                    <td className="px-4 py-4 text-center text-gray-700 whitespace-nowrap">{sheet.activity_type}</td>
                    <td className="px-4 py-4 text-center text-gray-700 whitespace-nowrap">{sheet.time}
                    </td>
                    <td className="px-4 py-4 text-center text-gray-700 whitespace-nowrap hover:bg-white hover:text-black">
                      <div 
                        title={sheet.narration} 
                        className="overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px]"
                      >
                        {sheet.narration
                          ? sheet.narration
                              .replace(/[,.\n]/g, " ")
                              .split(/\s+/)
                              .slice(0, 1)
                              .join(" ") + "..."
                          : ""}
                      </div>
                    </td>


                    <td className="px-6 py-4 flex items-center justify-center">
                      {editMode[sheet.id] ? (
                        <div className="flex items-center gap-4">
  {/* Approve Button with tooltip */}
  <div className="relative group">
    <IconApproveButton
      onClick={() => {
        handleStatusChange(sheet, "approved");
        toggleEditMode(sheet.id);
      }}
    />
    <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 
                     whitespace-nowrap bg-white text-black text-sm px-2 py-1 rounded 
                     opacity-0 group-hover:opacity-100 transition pointer-events-none shadow">
      Approve
    </span>
  </div>


  {/* Reject Button with tooltip */}
  <div className="relative group">
    <IconRejectButton
      onClick={() => {
        handleStatusChange(sheet, "rejected");
        toggleEditMode(sheet.id);
      }}
    />
    <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 
                     whitespace-nowrap bg-white text-black text-sm px-2 py-1 rounded 
                     opacity-0 group-hover:opacity-100 transition pointer-events-none shadow">
      Reject
    </span>
  </div>

  {/* Cancel Button with tooltip */}
  <div className="relative group">
    <IconCancelTaskButton
      onClick={() => {
        setEditMode((prev) => ({ ...prev, [sheet.id]: false }));
      }}
    />
    <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 
                     whitespace-nowrap bg-white text-black text-sm px-2 py-1 rounded 
                     opacity-0 group-hover:opacity-100 transition pointer-events-none shadow">
      Cancel
    </span>
  </div>
</div>

                      ) : sheet.status?.toLowerCase() === "approved" ? (
                        <div className="flex items-center gap-3">
                          <div className="relative group">
  <IconApproveButton />
  <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 
                   whitespace-nowrap bg-white text-black text-sm px-2 py-1 rounded 
                   opacity-0 group-hover:opacity-100 transition pointer-events-none shadow">
    Approved
  </span>
</div>
                          <button
                            onClick={() => {
                             
                              toggleEditMode(sheet.id)}}
                            className="relative group hover:scale-110 transition"
                          >
                            <Pencil className="text-blue-600 h-6 w-6 hover:text-blue-700" />

                            <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 
                                            whitespace-nowrap bg-white text-black text-sm px-2 py-1 rounded 
                                            opacity-0 group-hover:opacity-100 transition pointer-events-none shadow">
                              Edit
                            </span>
                          </button>

                        </div>
                      ) : sheet.status?.toLowerCase() === "rejected" ? (
                        <div className="flex items-center gap-3">
                          <div className="relative group">
  <IconRejectButton />
  <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 
                   whitespace-nowrap bg-white text-black text-sm px-2 py-1 rounded 
                   opacity-0 group-hover:opacity-100 transition pointer-events-none shadow">
    Rejected
  </span>
</div>
                          
                        </div>
                      ) : (
                        <div className="flex items-center gap-4">
  {/* Approve Button with tooltip */}
  <div className="relative group">
    <IconApproveButton
      onClick={() => handleStatusChange(sheet, "approved")}
    />
    <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 
                     whitespace-nowrap bg-white text-black text-sm px-2 py-1 rounded 
                     opacity-0 group-hover:opacity-100 transition pointer-events-none shadow">
      Approve
    </span>
  </div>


  {/* Reject Button with tooltip */}
  <div className="relative group">
    <IconRejectButton
      onClick={() => handleStatusChange(sheet, "rejected")}
    />
    <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 
                     whitespace-nowrap bg-white text-black text-sm px-2 py-1 rounded 
                     opacity-0 group-hover:opacity-100 transition pointer-events-none shadow">
      Reject
    </span>
  </div>
</div>

                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>




          </table>
          {totalPages > 1 && (
            // <div className="flex justify-center items-center gap-4 py-4">
            //   <button
            //     className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            //     onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            //     disabled={currentPage === 1}
            //   >
            //     Previous
            //   </button>

            //   {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            //     <button
            //       key={page}
            //       className={`px-3 py-1 rounded ${currentPage === page
            //         ? "bg-blue-500 text-white"
            //         : "bg-gray-200 hover:bg-gray-300"
            //         }`}
            //       onClick={() => setCurrentPage(page)}
            //     >
            //       {page}
            //     </button>
            //   ))}

            //   <button
            //     className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            //     onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            //     disabled={currentPage === totalPages}
            //   >
            //     Next
            //   </button>
            // </div>
            <div className="flex justify-center items-center gap-4 py-4">
              <button
                className={`px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-150 ${currentPage === 1
                  ? "bg-gray-200 disabled:opacity-50"
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
                  className={`px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-150 ${currentPage === page
                    ? "bg-blue-600 text-white font-semibold ring-2 ring-blue-400 shadow-md"
                    : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}

              <button
                className={`px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-150 ${currentPage === totalPages
                  ? "bg-gray-200 disabled:opacity-50"
                  : "bg-blue-100 hover:bg-blue-200 ring-2 ring-blue-400 shadow-md font-semibold"
                  }`}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

