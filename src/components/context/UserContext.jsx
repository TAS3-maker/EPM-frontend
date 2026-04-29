import { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";
import { API_URL } from "../utils/ApiConfig";
import { useAlert } from "./AlertContext";
import { useNavigate } from "react-router-dom";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userProjects, setUserProjects] = useState([]);
  const [weeksheet, setWeeksheet] = useState([]);
  const [userassignedProjects, setUserassignedProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [performanceSheets, setPerformanceSheets] = useState([]);
  const [dateRangePerformaSheets, setDateRangePerformaSheets] = useState([]);
  const [datePermissionMap, setDatePermissionMap] = useState({});
const [isDateAllowed, setIsDateAllowed] = useState(true);
const [showApplyPopup, setShowApplyPopup] = useState(false);
const [blockedDate, setBlockedDate] = useState(null);
const [weekLoading, setWeekLoading] = useState(false);
const [showApprovalPopup,setShowApprovalPopup]=useState(false)
// const [isDateAllowed, setIsDateAllowed] = useState(null); 
  // const [datePermissionMap, setDatePermissionMap] = useState({});
const [showLockPopup, setShowLockPopup] = useState(false);
const [lockedDate, setLockedDate] = useState(null);
const navigate = useNavigate();
const [approvalReason, setApprovalReason] = useState("");
  const [notes, setNotes] = useState([]);
  const [noteLoading, setNoteLoading] = useState(false);
  
  const token = localStorage.getItem("userToken");
  const { showAlert } = useAlert();

  
  const fetchNotes = useCallback(async () => {
    console.log("🔄 Fetching notes...");
    setNoteLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/notes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log("📥 RAW API Response:", response.data);
      
     
      let notesArray = [];
      if (Array.isArray(response.data)) {
        notesArray = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        notesArray = response.data.data;
      } else if (response.data?.notes && Array.isArray(response.data.notes)) {
        notesArray = response.data.notes;
      } else if (response.data && typeof response.data === 'object') {
        notesArray = Object.values(response.data);
      }
      
      console.log("✅ FINAL Notes Array:", notesArray);
      setNotes(notesArray);
    } catch (err) {
      console.error("❌ Fetch notes ERROR:", err.response?.data || err.message);
      setNotes([]);
      if (err.response?.data?.message) {
        showAlert({ variant: "error", title: "Error", message: err.response.data.message });
      }
    } finally {
      setNoteLoading(false);
    }
  }, [token, showAlert]);

  const getNote = useCallback(async (id) => {
    setNoteLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/notes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (err) {
      console.error("❌ Get note ERROR:", err.response?.data || err.message);
      if (err.response?.data?.message) {
        showAlert({ variant: "error", title: "Error", message: err.response.data.message });
      }
      throw err;
    } finally {
      setNoteLoading(false);
    }
  }, [token, showAlert]);

  const createNote = useCallback(async (noteText) => {
    setNoteLoading(true);
    try {
      await axios.post(`${API_URL}/api/notes`, { notes: noteText }, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      await fetchNotes();
      showAlert({ variant: "success", title: "Success", message: "Note created successfully" });
    } catch (err) {
      console.error("❌ Create note ERROR:", err.response?.data || err.message);
      if (err.response?.data?.message) {
        showAlert({ variant: "error", title: "Error", message: err.response.data.message });
      }
      throw err;
    } finally {
      setNoteLoading(false);
    }
  }, [token, fetchNotes, showAlert]);

  const updateNote = useCallback(async (id, noteText) => {
    setNoteLoading(true);
    try {
      await axios.put(`${API_URL}/api/notes/${id}`, { notes: noteText }, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      await fetchNotes();
      showAlert({ variant: "success", title: "Success", message: "Note updated successfully" });
    } catch (err) {
      console.error("❌ Update note ERROR:", err.response?.data || err.message);
      if (err.response?.data?.message) {
        showAlert({ variant: "error", title: "Error", message: err.response.data.message });
      }
      throw err;
    } finally {
      setNoteLoading(false);
    }
  }, [token, fetchNotes, showAlert]);

  const deleteNote = useCallback(async (id) => {
    setNoteLoading(true);
    try {
      await axios.delete(`${API_URL}/api/notes/${id}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      await fetchNotes();
      showAlert({ variant: "success", title: "Success", message: "Note deleted successfully" });
    } catch (err) {
      console.error("❌ Delete note ERROR:", err.response?.data || err.message);
      if (err.response?.data?.message) {
        showAlert({ variant: "error", title: "Error", message: err.response.data.message });
      }
      throw err;
    } finally {
      setNoteLoading(false);
    }
  }, [token, fetchNotes, showAlert]);

  // 👈 SAB ORIGINAL FUNCTIONS BILKUL SAME (no change)
  const fetchUserProjects = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/user-projects-master`, {
        headers: {
         Authorization: `Bearer ${token}`,
        },
      });
      setUserProjects(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

const fetchweeksheet = async (date) => {
  setWeekLoading(true);
  

  try {
    const response = await axios.get(
      `${API_URL}/api/get-weekly-performa-sheet`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { date },
      }
    );

    const weekData = response.data?.data || {};
    setWeeksheet(weekData);

    const permissionMap = {};

    Object.entries(weekData).forEach(([day, info]) => {
      // ✅ default to true if undefined / null
      permissionMap[day] =
    
        info?.is_fillable === undefined || info?.is_fillable === null
          ? true
          : [1, 2].includes(Number(info.is_fillable))

         

          
    });

    setDatePermissionMap(permissionMap);
// console.log('====================================');
// console.log(datePermissionMap);
// console.log('====================================');
    // ✅ fallback to true if date not found
    const selectedDateAllowed = permissionMap[date] ?? true;
setIsDateAllowed(selectedDateAllowed);

    const selectedDayInfo = weekData[date];
const isApplied = Number(selectedDayInfo?.is_applied);
console.log('====================================');
console.log("selectedDateAllowed:", selectedDateAllowed);
console.log('====================================');
if (!selectedDateAllowed && isApplied === 0) {
  setBlockedDate(date);
  setShowApprovalPopup(true);
}

  } catch (err) {
    if (err.response?.status === 401) {
      console.warn("Unauthorized → redirecting to login");
      navigate("/login");
      return;
    }

    setError(err.message);
  

  } finally {
    setWeekLoading(false);
  }
};


const handleApplyForApproval = async (date,reason) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/apply-performa`,
      {reason}, // body
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        params: {
          apply_date: date,
        },
      }
    );

    setShowApprovalPopup(false);
    setApprovalReason("")
                 showAlert({
      variant: "success",
      title: "Success",
      message: response?.data?.message
    });

  } catch (error) {

            showAlert({ variant: "error", title: "Error", message: error?.response?.data?.message });

    console.log(error?.response?.data?.message);
  }
};




  const fetchUserassignedProjects = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/user-projects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data && Array.isArray(response.data.data)) {
        setUserassignedProjects(response.data.data); 
      } else {
        setUserassignedProjects([]); 
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time) => {
    if (!time || typeof time !== "string") return "00:00";
    const match = time.match(/^(\d{1,2}):?(\d{0,2})$/);
    if (!match) return "00:00";
    let [_, hours, minutes] = match;
    hours = hours.padStart(2, "0");
    minutes = minutes ? minutes.padStart(2, "0") : "00"; 
    return `${hours}:${minutes}`;
  };

  const formatDate = (date) => {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate) ? parsedDate.toISOString().split("T")[0] : "1970-01-01";
  };

const submitEntriesForApproval = async (payload) => {
  try {
    console.log("Raw submit payload:", payload);

    const entriesArray = Array.isArray(payload?.data)
      ? payload.data
      : [];

    if (!entriesArray.length) {
      throw new Error("No entries to submit.");
    }

    const isValidTime = (t) => /^\d{1,2}:\d{2}$/.test(t);

    const formattedData = {
      data: entriesArray.map(entry => {
        const time = entry.time || entry.hoursSpent || "";

        const shouldSendReason =
          entry.tracking_mode === "partial" ||
          entry.is_tracking === "no";

        if (!isValidTime(time)) {
          throw new Error(`Invalid time detected: ${time}`);
        }

        return {
          project_id: Number(entry.project_id) || "",
          task_id: Number(entry.task_id) || "",
          date: formatDate(entry.date),
          time: formatTime(time), // HH:MM → backend format
          work_type: String(entry.work_type || ""),
          status: entry.status || "",

          // 🔹 Tracking (NEW – IMPORTANT)
          is_tracking: entry.is_tracking === "yes" ? "yes" : "no",
          tracking_mode:
            entry.is_tracking === "yes"
              ? entry.tracking_mode
              : "",
          tracked_hours:
            entry.is_tracking === "yes" &&
            entry.tracking_mode === "partial" &&
            isValidTime(entry.tracked_hours)
              ? formatTime(entry.tracked_hours)
              : "",

           tracking_id:
      entry.is_tracking === "yes" &&
      entry.tracking_id
        ? Number(entry.tracking_id)
        : null,

    // ✅ ADD THIS
   not_tracked_reason:
  shouldSendReason && entry.not_tracked_reason?.trim()
    ? entry.not_tracked_reason.trim()
    : "",

          narration: String(entry.narration || ""),
          is_fillable:entry.is_fillable,
        };
      }),
    };

    console.log(
      "Submitting formattedData:",
      JSON.stringify(formattedData, null, 2)
    );

    const response = await axios.post(
      `${API_URL}/api/add-performa-sheets`,
      formattedData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Response from server:", response.data);


    fetchweeksheet();

    return response.data;
} 
catch (err) {
  const res = err?.response?.data || err;

  const errorMessage =
    Object.values(res?.errors || {})?.[0]?.[0] ||
    res?.message ||
    err?.message ||
    "Something went wrong";

  showAlert({
    variant: "error",
    title: "Error",
    message: errorMessage
  });
}
}


const submitEntriesForPending = async (payload) => {
  try {
    if (!payload?.data?.length) {
      throw new Error("No entries to submit.");
    }

    console.log(
      "📤 Submitting approval payload:",
      JSON.stringify(payload, null, 2)
    );

    const response = await axios.post(
      `${API_URL}/api/submit-performa-sheets`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    fetchweeksheet();
    return response.data;
  } catch (error) {
    console.error("❌ Submit error:", error);
    throw error;
  }
};


const fetchPerformanceSheets = async (start_date = null, end_date = null) => {
  setLoading(true);

  try {
    const response = await axios.get(
      `${API_URL}/api/get-performa-sheet`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: start_date && end_date ? { start_date, end_date } : {},
      }
    );

    setPerformanceSheets(response.data);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
// const editPerformanceSheet = async (payload) => {
//   setLoading(true);
//   try {
//     if (!payload?.id || !payload?.data) {
//       showAlert({
//         variant: "warning",
//         title: "Warning",
//         message: "Missing required data for updating the performance sheet.",
//       });
//       return;
//     }

//     console.log(
//       "🟢 Updating performance sheet:",
//       JSON.stringify(payload, null, 2)
//     );

//     const response = await fetch(
//       `${API_URL}/api/edit-performa-sheets`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(payload),
//       }
//     );

//     const result = await response.json();

//   if (!response.ok) {
//   let serverMessage = result.message || "Failed to update performance sheet";

//   if (result?.errors && typeof result.errors === "object") {
//     serverMessage = Object.entries(result.errors)
//       .map(([field, messages]) => {
//         const cleanField = field.replace(/^data\./, ""); // removes "data."
//         return `${cleanField}: ${messages.join(", ")}`;
//       })
//       .join(" | ");
//   }

//   showAlert({
//     variant: "error",
//     title: "Validation Error",
//     message: serverMessage,
//   });

//   return null;
// }


//     showAlert({
//       variant: "success",
//       title: "Success",
//       message: "Sheet updated successfully",
//     });

//     fetchPerformanceSheets();
//     return result;
//   } catch (error) {
//     showAlert({
//       variant: "error",
//       title: "Error",
//       message: error.message || "Unexpected error occurred",
//     });
//     return null;
//   } finally {
//     setLoading(false);
//   }
// };



const editPerformanceSheet = async (payload) => {
  setLoading(true);
  console.log("🔄 Edit performance sheet with payload:", payload.data) ;

  try {
    if (!payload?.id || !payload?.data) {
      showAlert({
        variant: "warning",
        title: "Warning",
        message: "Missing required data for updating the performance sheet.",
      });
      return null;
    }

    const isValidTime = (t) => /^\d{1,2}:\d{2}$/.test(t);

    const entry = payload.data; 

    const formattedPayload = {
  id: payload.id,
  data: {
    project_id: Number(entry.project_id) || null,
    task_id: Number(entry.task_id) || null,
    date: formatDate(entry.date),
    time: formatTime(entry.time),
    work_type: String(entry.work_type || ""),
    status: entry.status || "",

    is_tracking: entry.is_tracking === "yes" ? "yes" : "no",

    tracking_mode:
      entry.is_tracking === "yes"
        ? entry.tracking_mode || "all"
        : null,

    tracked_hours:
      entry.is_tracking === "yes" &&
      entry.tracking_mode === "partial"
        ? formatTime(entry.tracked_hours)
        : null,

    tracking_id:
      entry.is_tracking === "yes" && entry.tracking_id
        ? Number(entry.tracking_id)
        : null,

    not_tracked_reason:
      (entry.tracking_mode === "partial" ||
        entry.is_tracking === "no") &&
      entry.not_tracked_reason?.trim()
        ? entry.not_tracked_reason.trim()
        : null,

    narration: String(entry.narration || ""),
   is_fillable: isDateAllowed === false ? 0 : 1,
  },
};

    console.log("🟢 EDIT FORMATTED PAYLOAD:", formattedPayload);

    const response = await axios.post(
      `${API_URL}/api/edit-performa-sheets`,
      formattedPayload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    showAlert({
      variant: "success",
      title: "Success",
      message: "Sheet updated successfully",
    });

  
    fetchweeksheet();

    return response.data;

  } catch (error) {
    console.error("❌ Edit error:", error);

    showAlert({
  variant: "error",
  title: "Error",
  message:
    error.response?.data?.errors
      ? Object.values(error.response.data.errors)[0][0]
      : error.response?.data?.message ||
        error.message ||
        "Update failed",
});

    return null;

  } finally {
    setLoading(false);
  }
};




  


  const deletesheet = async (id) => {
    console.log("Deleting sheet with ID:", id);
    try {
      const token = localStorage.getItem("userToken");
      const response = await fetch(`${API_URL}/api/delete-performa-sheets`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ sheet_id: id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete employee");
      }

      fetchPerformanceSheets();
      fetchweeksheet();
      showAlert({ variant: "success", title: "Success", message: "Performance Deleted Successfully" });
      setError(null);
    } catch (err) {
      console.error("Error deleting employee:", err);
      setError(err.message);
      showAlert({ variant: "error", title: "Error", message: err.message });
    }
  };

  const fetchPerformaSheetsByDateRange = async (start_date = null, end_date = null) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${API_URL}/api/get-performa-sheet-daterange`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: start_date && end_date ? { start_date, end_date } : {},
        }
      );

      console.log("Date range performa sheets:", response.data);
      setDateRangePerformaSheets(response.data?.data || response.data || []);
      return response.data;
    } catch (err) {
      console.error("Error fetching date range performa sheets:", err);
      setError(err.message);
      showAlert({
        variant: "error",
        title: "Error",
        message: err.message || "Failed to fetch performa sheets",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };


const requestDateApproval = async (date) => {
  try {
    await axios.post(
      `${API_URL}/api/timesheet/apply-approval`,
      { date },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Optional success feedback
    showAlert({
      variant: "success",
      title: "Request Sent",
      message: "Approval request submitted successfully.",
    });
  } catch (error) {
    console.error("Approval request failed:", error);
    showAlert({
      variant: "error",
      title: "Error",
      message: "Failed to apply for approval.",
    });
  }
};



  // 👈 ORIGINAL useEffect + notes fetch
  useEffect(() => {
    fetchUserProjects();
   
    fetchUserassignedProjects();
    fetchNotes(); // 👈 NEW
  }, []);

  return (
    <UserContext.Provider value={{ 
      editPerformanceSheet, 
      fetchUserassignedProjects, 
      fetchweeksheet,
      userassignedProjects, 
      userProjects, 
      performanceSheets, 
      loading, 
      error, 
      fetchUserProjects, 
      submitEntriesForApproval, 
      fetchPerformanceSheets,
      deletesheet,
      weeksheet,
      fetchPerformaSheetsByDateRange,
      dateRangePerformaSheets,
      
      // 👈 NEW NOTES (end mein)
      notes,
      noteLoading,
      fetchNotes,
      getNote,
      createNote,
      updateNote,
      deleteNote,
      setWeeksheet,
      requestDateApproval,
      datePermissionMap,
      isDateAllowed,
      showApplyPopup,
      blockedDate,
      setShowApplyPopup,
      setBlockedDate,
      setIsDateAllowed,
      weekLoading,
      setWeekLoading,
      submitEntriesForPending,
setShowApprovalPopup,
    showApprovalPopup,
    handleApplyForApproval,
    setApprovalReason,
    approvalReason

    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);
