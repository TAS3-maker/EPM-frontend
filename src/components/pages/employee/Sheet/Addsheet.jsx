import React, { useState, useEffect,useMemo } from 'react';
import { Clock, Briefcase, ClipboardList, Home, FileText, Save, Loader2, Trash2, Edit,Calendar } from 'lucide-react';
import { useUserContext } from "../../../context/UserContext";
import { SectionHeader } from '../../../components/SectionHeader';
import { useAlert } from "../../../context/AlertContext";
import { useBDProjectsAssigned } from "../../../context/BDProjectsassigned";
import { Info } from "lucide-react";
import DOMPurify from 'dompurify';
const Addsheet = () => {
  const {fetchDraftPerformanceDetails,draftPerformanceData,savedEntries,setSavedEntries}=useBDProjectsAssigned();
  const { submitEntriesForApproval,submitEntriesForPending ,deletesheet,editPerformanceSheet} = useUserContext();
  const [submitting, setSubmitting] = useState(false);
  const [editIndex, setEditIndex] = useState(null);


  const [localWeeklySheet, setLocalWeeklySheet] = useState({});
const [pendingDraftEntries, setPendingDraftEntries] = useState([]);
const [backupEntry, setBackupEntry] = useState(null);

const getInitialDate = () => {
  return (
    localStorage.getItem("lastSelectedDate") ||
    new Date().toISOString().split("T")[0]
  );
};

  const { userProjects,setApprovalReason,approvalReason, loading, error,weeksheet,fetchweeksheet, notes, noteLoading, fetchNotes, isDateAllowed,setShowApprovalPopup,handleApplyForApproval, showApplyPopup ,datePermissionMap,blockedDate,setShowApplyPopup,setBlockedDate,setIsDateAllowed,weekLoading,showApprovalPopup} = useUserContext();
  const [tags, setTags] = useState([]);
  const { showAlert } = useAlert();

const [formData, setFormData] = useState({
  date: getInitialDate(),
  projectId: "",
  taskId: "",
  hoursSpent: "",
  status: "WFO",
  notes: "",
  is_tracking: "yes",     
  tracking_mode: "all",  
  tracked_hours: "",   
  tracking_id: "",         
  not_tracked_reason: "",      
});
  
// 🔹 Fetch weekly sheet when date changes
useEffect(() => {
  if (!formData.date) return;

  fetchweeksheet(formData.date);
  localStorage.setItem("lastSelectedDate", formData.date);
}, [formData.date]);

// 🔹 Fetch notes only once
useEffect(() => {
  fetchNotes();
}, []);



const isTracking = formData.is_tracking === "yes";

  const [error1, setError1] = React.useState("");
  const [error2, setError2] = React.useState("");

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

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "hoursSpent") {
      value = formatTime(value);
    }

    if (name === "projectId") {
      const selectedProject = userProjects.data.find(project => project.id === parseInt(value));

      if (selectedProject) {
        setTags(selectedProject.tags_activitys);
      }
    }

    if (name === "billingStatus") {
      const selectedTag = tags.find(tag => tag.name.toString() === value);
      if (selectedTag) {
        value = selectedTag.name;
      }
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const safeNotes = Array.isArray(notes)
    ? notes
    : notes?.data?.tasks || notes?.data || notes?.notes || [];




const isValidTime = (v) => /^\d{1,2}:\d{2}$/.test(v);

const handleEdit = (index, field, value) => {
  setSavedEntries(prev => {
    const updated = [...prev];
    const entry = { ...updated[index] };

    /* ---------- HOURS SPENT ---------- */
    if (field === "hoursSpent") {
      // ✅ ONLY update hoursSpent while typing
      entry.hoursSpent = value;
    }

    /* ---------- TRACKED HOURS ---------- */
    else if (field === "tracked_hours") {
      // allow empty & partial typing
      entry.tracked_hours = value;

      // ✅ clamp only when both are valid
      if (
        isValidTime(value) &&
        isValidTime(entry.hoursSpent) &&
        timeToMinutes(value) > timeToMinutes(entry.hoursSpent)
      ) {
        entry.tracked_hours = entry.hoursSpent;
      }
    }

    /* ---------- TRACKING MODE ---------- */
    else if (field === "tracking_mode") {
      entry.tracking_mode = value;

      // initialize tracked hours only once
      if (
        value === "partial" &&
        entry.is_tracking === "yes" &&
        !entry.tracked_hours &&
        isValidTime(entry.hoursSpent)
      ) {
        entry.tracked_hours = entry.hoursSpent;
      }
    }

    /* ---------- DEFAULT ---------- */
    else {
      entry[field] = value;
    }

    updated[index] = entry;

    // localStorage.setItem(
    //   "savedTimesheetEntries",
    //   JSON.stringify(updated)
    // );

    return updated;
  });
};












useEffect(() => {
  if (formData.projectId) {
    const selectedProject = userProjects?.data?.find(
      (project) => project.id === parseInt(formData.projectId)
    );
    if (selectedProject) {
      setTags(selectedProject.tags_activitys || []);
    }
  }
}, [formData.projectId, userProjects]);







const handleTimeChange = (e) => {
  let value = e.target.value;

  value = value.replace(/[^0-9:]/g, "");

  const parts = value.split(":");
  if (parts.length > 2) value = parts[0] + ":" + parts[1];

  if (value.length > 5) value = value.slice(0, 5);

  setFormData((prev) => ({ ...prev, hoursSpent: value }));
};



const normalizeTime = (rawValue, maxH = 10, maxM = 30) => {
  let value = (rawValue || "").trim();

  // 4 → 04:00
  if (/^\d{1}$/.test(value)) {
    value = `0${value}:00`;
  }

  // 04 → 04:00
  else if (/^\d{2}$/.test(value)) {
    value = `${value}:00`;
  }

  // 4: → 04:30
  else if (/^\d{1,2}:$/.test(value)) {
    const [h] = value.split(":");
    value = `${h.padStart(2, "0")}:30`;
  }

  // 4:3 → 04:30
  else if (/^\d{1,2}:\d$/.test(value)) {
    const [h, m] = value.split(":");
    value = `${h.padStart(2, "0")}:${m.padEnd(2, "0")}`;
  }

  // ✅ NEW FIX: 4:30 → 04:30
  else if (/^\d{1,2}:\d{2}$/.test(value)) {
    const [h, m] = value.split(":");
    value = `${h.padStart(2, "0")}:${m}`;
  }

  // ⛔ Final validation
  if (!/^\d{2}:[0-5][0-9]$/.test(value)) {
    return { value, error: "Invalid time format" };
  }

  const [hStr, mStr] = value.split(":");
  const h = Number(hStr);
  const m = Number(mStr);

  // ⛔ Max limit
  if (h > maxH || (h === maxH && m > maxM)) {
    return {
      value,
      error: `Time cannot be more than ${maxH}:${String(maxM).padStart(2, "0")}`,
    };
  }

  return { value, error: "" };
};



const handleTimeBlur = () => {
  const { value, error } = normalizeTime(formData.hoursSpent);

  setError1(error);

  setFormData((prev) => ({
    ...prev,
    hoursSpent: value,
  }));
};


const handleTrackingBlur = (e) => {
  const rawValue = e.target.value.trim();

  if (!rawValue) {
    setError2("");
    return;
  }

  const { value, error } = normalizeTime(rawValue, 10, 30);

  if (error) {
    setError2(error);
    // keep raw value so user can fix it
    setFormData((prev) => ({ ...prev, tracked_hours: rawValue }));
    return;
  }

  // ✅ normalized value (e.g. 4:30 → 04:30)
  setError2("");
  setFormData((prev) => ({ ...prev, tracked_hours: value }));
};






const handleEntryTimeBlur = (index, field) => {
  setSavedEntries(prev => {
    const updated = [...prev];
    const entry = { ...updated[index] };

    const rawValue = (entry[field] || "").trim();
    if (!rawValue) return updated;

    const { value, error } = normalizeTime(rawValue);

    // ⛔ If invalid, keep value as-is (or you can show error)
    if (error) {
      entry[field] = rawValue;
    } else {
      entry[field] = value; // ✅ normalized (04:30)
    }

    updated[index] = entry;
    return updated;
  });
};







const handleEditClick = (index) => {
  if (index === null) {
    setEditIndex(null);
    setBackupEntry(null);
    return;
  }

  // 🔑 BACKUP FIRST
  setBackupEntry({ ...savedEntries[index] });

  setEditIndex(index);

  // ⚠️ KEEP your normalization logic (but now it's safe)
  setSavedEntries((prev) =>
    prev.map((entry, i) => {
      if (i !== index) return entry;

      return {
        ...entry,
        is_tracking: entry.is_tracking ?? "no",
        tracking_mode:
          entry.is_tracking === "yes"
            ? entry.tracking_mode ?? "all"
            : "all",
        tracked_hours:
          entry.is_tracking === "yes" &&
          entry.tracking_mode === "partial"
            ? entry.tracked_hours ?? ""
            : "",
      };
    })
  );

  const entry = savedEntries[index];
  if (!entry) return;

  const selectedProject = userProjects?.data?.find(
    (p) => p.id === parseInt(entry.projectId)
  );

  if (selectedProject) {
    setTags(selectedProject.tags_activitys || []);
  }
};




const handleSaveClick = async () => {
  const entryBeingEdited = savedEntries[editIndex];

const project = userProjects?.data?.find(
  p => p.id === Number(entryBeingEdited.projectId)
);

const projectAllowsTracking = project?.project_tracking === "1";


  if (!entryBeingEdited) return;

  const date = entryBeingEdited.date;

  const workType = (entryBeingEdited.status || "").toUpperCase().trim();
  const isWFH = workType === "WFH" || workType === "WORK FROM HOME";

  const dayEntries = savedEntries.filter(e => e.date === date);

  const otherEntriesTotal = dayEntries
    .filter(e => e.id !== entryBeingEdited.id)
    .reduce((sum, e) => sum + timeToMinutes(e.hoursSpent || "00:00"), 0);

  const newMinutes = timeToMinutes(entryBeingEdited.hoursSpent);
  const finalTotalMinutes = otherEntriesTotal + newMinutes;

  console.log("🧮 Other entries:", otherEntriesTotal);
  console.log("➕ New:", newMinutes);
  console.log("🧮 Final:", finalTotalMinutes);
  console.log("🏠 Is WFH:", isWFH);





// 🧠 Run tracking validation ONLY if project allows tracking
if (projectAllowsTracking) {

  if (entryBeingEdited.is_tracking === "no") {
    if (!entryBeingEdited.not_tracked_reason?.trim()) {
      showAlert({
        variant: "warning",
        title: "Reason Required",
        message: "Please enter reason for not tracking.",
      });
      return;
    }
  }

  if (
    entryBeingEdited.is_tracking === "yes" &&
    entryBeingEdited.tracking_mode === "partial"
  ) {
    if (!entryBeingEdited.not_tracked_reason?.trim()) {
      showAlert({
        variant: "warning",
        title: "Reason Required",
        message: "Please enter reason for untracked time.",
      });
      return;
    }
  }

}





// if (entryBeingEdited.is_tracking === "no") {
//   if (!entryBeingEdited.not_tracked_reason?.trim()) {
//     showAlert({
//       variant: "warning",
//       title: "Reason Required",
//       message: "Please enter reason for not tracking.",
//     });
//     return;
//   }
// }

// if (
//   entryBeingEdited.is_tracking === "yes" &&
//   entryBeingEdited.tracking_mode === "partial"
// ) {
//   if (!entryBeingEdited.not_tracked_reason?.trim()) {
//     showAlert({
//       variant: "warning",
//       title: "Reason Required",
//       message: "Please enter reason for untracked time.",
//     });
//     return;
//   }
// }






  if (newMinutes <= 0) {
    showAlert({
      variant: "warning",
      title: "Invalid Time",
      message: "Hours spent must be greater than 0.",
    });
    return;
  }

  const MAX_MINUTES = isWFH ? 10 * 60 : 8 * 60 + 30;

  // ⛔ Block ONLY when exceeding
  if (finalTotalMinutes > MAX_MINUTES) {
    showAlert({
      variant: "warning",
      title: "Limit Exceeded",
      message: isWFH
        ? `WFH hours for ${date} cannot exceed 10:00`
        : `Office hours for ${date} cannot exceed 8:30`,
    });
    return;
  }

  localStorage.setItem(
    "savedTimesheetEntries",
    JSON.stringify(savedEntries)
  );

  if (!entryBeingEdited.id) {
    showAlert({
      variant: "error",
      title: "Error",
      message: "Missing performance sheet ID.",
    });
    return;
  }
    if (entryBeingEdited.notes.trim().replace(/\s+/g, ' ').length < 50) {
    showAlert({
      variant: "warning",
      title: "Warning",
      message: "Narration must be at least 50 characters long.",
    });
    return;
  }

  const isTracking = entryBeingEdited.is_tracking === "yes";
const isPartial = isTracking && entryBeingEdited.tracking_mode === "partial";
const isNotTracking = entryBeingEdited.is_tracking === "no";

const requestData = {
  id: entryBeingEdited.id,
  data: 
    {
      project_id: Number(entryBeingEdited.projectId) || "",
      task_id: Number(entryBeingEdited.taskId) || "",
      date,
      time: entryBeingEdited.hoursSpent,
      work_type: workType,
      status: entryBeingEdited.status || "",

      is_tracking: entryBeingEdited.is_tracking,
      tracking_mode: isTracking
        ? entryBeingEdited.tracking_mode || "all"
        : "",

      tracked_hours: isPartial
        ? entryBeingEdited.tracked_hours || "00:00"
        : "",

      tracking_id:
        isTracking && entryBeingEdited.tracking_id !== "" && entryBeingEdited.tracking_id !== null
          ? Number(entryBeingEdited.tracking_id)
          : null,

      not_tracked_reason:
      projectAllowsTracking &&
      (isNotTracking || isPartial)
        ? entryBeingEdited.not_tracked_reason?.trim() || ""
        : "",

      narration: entryBeingEdited.notes || "",
      is_fillable: entryBeingEdited.is_fillable,
    },
  
};
const response = await editPerformanceSheet(requestData);

if (!response) {
  return;
}
entryBeingEdited.originalHoursSpent = entryBeingEdited.hoursSpent;

setEditIndex(null);

await fetchDraftPerformanceDetails({
  is_fillable: 1,
});

fetchweeksheet();

console.log("✅ Entries saved safely");
};
const timeToMinutes = (time = "") => {
  if (!/^\d{1,2}:\d{2}$/.test(time)) return 0;
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};
const minutesToTime = (mins = 0) => {
  const h = Math.floor(mins / 60).toString().padStart(2, "0");
  const m = (mins % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
};




const toMinutes = (timeStr = "00:00") => {
    const [h, m] = (timeStr || "00:00").split(":").map(Number);
    return h * 60 + m;
  };



const handleSave = async () => {

  if (
    !formData.date ||
    !formData.projectId ||
    !formData.hoursSpent ||
    !formData.status ||
    !formData.notes
  ) {
    showAlert({
      variant: "warning",
      title: "Warning",
      message: "Please fill all required fields before saving.",
    });
    return;
  }

  if (!/^\d{1,2}:\d{2}$/.test(formData.hoursSpent)) {
    showAlert({
      variant: "warning",
      title: "Warning",
      message: "Hours spent must be in HH:MM format.",
    });
    return;
  }
if (formData.notes.trim().replace(/\s+/g, ' ').length < 50) {
  showAlert({
    variant: "warning",
    title: "Warning",
    message: "Narration must be at least 50 characters long (spaces don't count).",
  });
  return;
}

  const [hoursStr, minutesStr] = formData.hoursSpent.split(":");
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);
  const totalMinutesSpent = hours * 60 + minutes;

  if (totalMinutesSpent <= 0) {
    showAlert({
      variant: "warning",
      title: "Warning",
      message: "Hours spent must be greater than 0.",
    });
    return;
  }


  let tracking_mode = formData.tracking_mode;
  let tracked_hours = formData.tracked_hours;


  if (formData.is_tracking === 'no' && projectAllowsTracking ) {
  if (!formData.not_tracked_reason?.trim()) {
    showAlert({ variant: 'warning', title: 'Reason Required', message: 'Please enter reason for not tracking.' });
    return;
  }
}


  if (formData.is_tracking === "yes") {

  //    if (!formData.tracking_id) {
  //   showAlert({
  //     variant: "warning",
  //     title: "Tracking Account Required",
  //     message: "Please select tracking account.",
  //   });
  //   return;
  // }

    if (tracking_mode === "partial") {

      if (!formData.not_tracked_reason.trim()) {
  showAlert({
    variant: "warning",
    title: "Reason Required",
    message: "Please enter reason for untracked time.",
  });
  return;
}


      if (!tracked_hours) {
        showAlert({
          variant: "warning",
          title: "Warning",
          message: "Please enter tracked time for partial tracking.",
        });
        return;
      }

      const trackedMin = toMinutes(tracked_hours);
      const spentMin = toMinutes(formData.hoursSpent);

      if (trackedMin > spentMin) {
        showAlert({
          variant: "warning",
          title: "Warning",
          message: "Tracked time cannot exceed time spent.",
        });
        return;
      }
    }

    if (tracking_mode === "all") {
      tracked_hours = formData.hoursSpent;
    }
  } else {
    tracking_mode = "all";
    tracked_hours = "";
  }

  const existing =
    localWeeklySheet[formData.date]?.totalHours ||
    weeksheet[formData.date]?.totalHours ||
    "00:00";

  const [exH, exM] = existing.split(":").map(Number);
  const existingMinutes = exH * 60 + exM;

  const finalTotalMinutes = existingMinutes + totalMinutesSpent;

  const MAX_MINUTES =
    formData.status === "WFH" ? 10 * 60 : 8 * 60 + 30;

  if (finalTotalMinutes > MAX_MINUTES) {
    showAlert({
      variant: "warning",
      title: "Warning",
      message:
        formData.status === "WFH"
          ? `WFH hours for ${formData.date} cannot exceed 10:00`
          : `Office hours for ${formData.date} cannot exceed 8:30`,
    });
    return;
  }


if (weekLoading) {
  showAlert({
    variant: "warning",
    title: "Please wait",
    message: "Checking date permission. Try again.",
  });
  return;
}

console.log("🔍 Date Permission isDateAllowed:", isDateAllowed);
const isSameDay = (d1, d2) =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate();

const today = new Date();

const yesterday = new Date();
yesterday.setDate(today.getDate() - 1);

const dayBeforeYesterday = new Date();
dayBeforeYesterday.setDate(today.getDate() - 2);

const formDateObj = new Date(formData.date);

const isRestrictedDate =
  isSameDay(formDateObj, today) ||
  isSameDay(formDateObj, yesterday) ||
  isSameDay(formDateObj, dayBeforeYesterday);

if ( isDateAllowed === false) {
  try {
    const draftEntry = {
   data: [
    {
      project_id: formData.projectId,
      task_id: formData.taskId,
      date: formData.date,
      time: formData.hoursSpent,
      work_type: formData.status,

      is_tracking: formData.is_tracking,
      tracking_mode:
        formData.is_tracking === "yes"
          ? formData.tracking_mode
          : "all",
      tracked_hours:
        formData.is_tracking === "yes" &&
        formData.tracking_mode === "partial"
          ? formData.tracked_hours
          : "",

      tracking_id:
        formData.is_tracking === "yes"
          ? parseInt(formData.tracking_id)
          : null,

     not_tracked_reason:
        (
          (formData.is_tracking === "yes" &&
           formData.tracking_mode === "partial") ||
          formData.is_tracking === "no"
        )
          ? formData.not_tracked_reason?.trim() || ""
          : "", 

      narration: formData.notes,
      // status: "draft",
      is_fillable:0,
    },
  ],
  };

 const result = await submitEntriesForApproval(draftEntry);
 if (!result?.success) 

await fetchDraftPerformanceDetails({ is_fillable: 1 });


setFormData({
  date: getInitialDate(),
  projectId: "",
  taskId: "",
  hoursSpent: "",
  status: "WFO",
  notes: "",
  is_tracking: "no",
  tracking_mode: "all",
  tracked_hours: "",
});



  } catch (error) {
  showAlert({ variant: "error", title: "Error", message: error?.response?.data?.message||"failed" });
 
  }
  

 
}
else{
  console.log("Submitting entries for approval:");
const formattedEntries = {
  data: [
    {
      project_id: formData.projectId,
      task_id: formData.taskId,
      date: formData.date,
      time: formData.hoursSpent,
      work_type: formData.status,

      is_tracking: formData.is_tracking,
      tracking_mode:
        formData.is_tracking === "yes"
          ? formData.tracking_mode
          : "all",
      tracked_hours:
        formData.is_tracking === "yes" &&
        formData.tracking_mode === "partial"
          ? formData.tracked_hours
          : "",

      tracking_id:
        formData.is_tracking === "yes"
          ? parseInt(formData.tracking_id)
          : null,

     not_tracked_reason:
        (
          (formData.is_tracking === "yes" &&
           formData.tracking_mode === "partial") ||
          formData.is_tracking === "no"
        )
          ? formData.not_tracked_reason?.trim() || ""
          : "", 

      narration: formData.notes,
      // status: "draft",
      is_fillable:1,
    },
  ],
};

const result = await submitEntriesForApproval(formattedEntries);
if (!result?.success) return;

await fetchDraftPerformanceDetails({ is_fillable: 1 });


setFormData({
  date: getInitialDate(),
  projectId: "",
  taskId: "",
  hoursSpent: "",
  status: "WFO",
  notes: "",
  is_tracking: "no",
  tracking_mode: "all",
  tracked_hours: "",
});


return;



}
console.log("✅ Date is allowed:", formData);



 const newEntry = {
  ...formData,
  tracking_mode,
  tracked_hours,
};

console.log("🆕 New Entry:", newEntry);

const updated = [...savedEntries, newEntry];

console.log("📦 Updated Entries Array:", updated);

setSavedEntries(updated);

console.log(
  "💾 Saved to localStorage:",
  JSON.stringify(updated)
);



};




useEffect(() => {
  const newWeekly = { ...(weeksheet || {}) };

  if (!Array.isArray(savedEntries)) {
    setLocalWeeklySheet(newWeekly);
    return;
  }

  // 👉 GROUP entries by date FIRST
  const entriesByDate = savedEntries.reduce((acc, entry) => {
    if (!entry.date || !entry.hoursSpent) return acc;

    if (!acc[entry.date]) acc[entry.date] = [];
    acc[entry.date].push(entry);

    return acc;
  }, {});

  // 👉 RECALCULATE each day from scratch
  Object.entries(entriesByDate).forEach(([date, entries]) => {
    const existing = newWeekly[date] ?? {
      dayname: new Date(date).toLocaleDateString("en-US", {
        weekday: "short",
      }),
      leave_hours: "00:00",
      available_hours: "08:30",
    };

    let totalMinutes = 0;

    entries.forEach((entry) => {
      totalMinutes += timeToMinutes(entry.hoursSpent);
    });

    newWeekly[date] = {
      ...existing, // keeps leave + available from API
      totalHours: minutesToTime(totalMinutes),
    };
  });

  setLocalWeeklySheet(newWeekly);
  localStorage.setItem("localWeeklySheet", JSON.stringify(newWeekly));

}, [savedEntries, weeksheet]);


const handleProjectChangeInEdit = (index, projectId) => {
  const updatedEntries = [...savedEntries];
  const selectedProject = userProjects?.data?.find(
    (project) => project.id === parseInt(projectId)
  );

  if (selectedProject) {
    const projectTags = selectedProject.tags_activitys || [];

    // ✅ Auto-select first tag if available
    const firstTag = projectTags.length > 0 ? projectTags[0] : null;

    updatedEntries[index] = {
      ...updatedEntries[index],
      projectId,
       taskId: "",
      billingStatus: firstTag ? firstTag.id : "", // store tag id
      tags_activitys: projectTags,
    };

    setTags(projectTags);
  } else {
    updatedEntries[index] = {
      ...updatedEntries[index],
      projectId: "",
       taskId: "",
      billingStatus: "",
      tags_activitys: [],
    };
    setTags([]);
  }

  setSavedEntries(updatedEntries);
  localStorage.setItem("savedTimesheetEntries", JSON.stringify(updatedEntries));
};


  const formatTime = (time) => {
    if (!time || typeof time !== "string") return "00:00";
    time = time.replace(/[^0-9:]/g, "");
    const parts = time.split(":");

    if (parts.length === 2) {
      const [hh, mm] = parts;
      const hours = hh.padStart(2, "0").slice(0, 2);
      const minutes = mm.padStart(2, "0").slice(0, 2);
      return `${hours}:${minutes}`;
    }
    const numeric = time.replace(/:/g, "");
    if (numeric.length === 4) {
      const hours = numeric.slice(0, 2);
      const minutes = numeric.slice(2);
      return `${hours}:${minutes}`;
    }
    return time;
  };



const handleSubmit = async () => {
  const toMinutes = (timeStr = "") => {
    if (!/^\d{1,2}:\d{2}$/.test(timeStr)) return 0;
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };
  const hasMissingTask = savedEntries.some(e => !e.taskId);

if (hasMissingTask) {
  showAlert({
    variant: "warning",
    title: "Task missing",
    message: "One or more entries do not have a task selected. Please edit and select a task.",
  });
  return;
}

  for (const entry of savedEntries) {
    const spent = (entry.hoursSpent || "").trim();

    // ⛔ invalid or empty hours
    if (!/^\d{1,2}:\d{2}$/.test(spent)) {
      showAlert({
        variant: "warning",
        title: "Invalid Time",
        message: "Hours spent must be entered in HH:MM format.",
      });
      return;
    }

    const spentMin = toMinutes(spent);

    if (spentMin <= 0) {
      showAlert({
        variant: "warning",
        title: "Invalid Time",
        message: "Hours spent must be greater than 0.",
      });
      return;
    }

    // 🧭 TRACKING RULES
    if (entry.is_tracking === "yes") {
      if (entry.tracking_mode === "partial") {
        const tracked = (entry.tracked_hours || "").trim();

        if (!/^\d{1,2}:\d{2}$/.test(tracked)) {
          showAlert({
            variant: "warning",
            title: "Tracked Time Missing",
            message: "Please enter tracked time for partial tracking.",
          });
          return;
        }

        const trackedMin = toMinutes(tracked);

        if (trackedMin <= 0 || trackedMin > spentMin) {
          showAlert({
            variant: "warning",
            title: "Invalid Tracked Time",
            message: "Tracked time must be greater than 0 and not exceed hours spent.",
          });
          return;
        }
      }
    }
  }
console.log("saveeddddd sheets",savedEntries)
  /* ---------------- DAILY LIMIT ---------------- */
  const dates = [...new Set(savedEntries.map(e => e.date))];

  for (const date of dates) {
    const dailyMinutes = savedEntries.reduce((sum, e) => {
      if (e.date !== date) return sum;
      return sum + toMinutes(e.hoursSpent);
    }, 0);

    if (dailyMinutes > 600) {
      showAlert({
        variant: "warning",
        title: "Limit Exceeded",
        message: `Total hours for ${date} exceed 10:00.`,
      });
      return;
    }
  }

  /* ---------------- WEEKLY TOTAL ---------------- */
  const totalWeeklyMinutes = Object.entries({
    ...weeksheet,
    ...localWeeklySheet,
  }).reduce((sum, [_, info]) => {
    return sum + toMinutes(info.totalHours);
  }, 0);

  const totalWeeklyHours = `${Math.floor(totalWeeklyMinutes / 60)
    .toString()
    .padStart(2, "0")}:${(totalWeeklyMinutes % 60)
    .toString()
    .padStart(2, "0")}`;

  console.log(
    `🧮 Total Weekly: ${totalWeeklyHours} (${totalWeeklyMinutes} mins)`
  );



  const formattedEntries = {
    data: savedEntries.map(entry => {
      const isTracking = entry.is_tracking === "yes";

      return {
        project_id: entry.projectId,
        task_id: entry.taskId,
        date: entry.date,
        time: entry.hoursSpent,
        work_type: entry.status,
        is_tracking: entry.is_tracking,
        tracking_mode: isTracking ? entry.tracking_mode : "all",
        tracked_hours:
          isTracking && entry.tracking_mode === "partial"
            ? entry.tracked_hours
            : "",

        tracking_id:
        entry.is_tracking === "yes"
          ? parseInt(entry.tracking_id)
          : null,

         not_tracked_reason:
        (
          (entry.is_tracking === "yes" &&
           entry.tracking_mode === "partial") ||
          entry.is_tracking === "no"
        )
          ? entry.not_tracked_reason?.trim() || ""
          : "",

        narration: entry.notes,
      };
    }),
  };

  console.log("Final data before submission:", formattedEntries);

 const today = new Date().toISOString().split("T")[0];


  const submitPayload = {
    data: savedEntries.map(entry => ({
      id: entry.id,      
      date: today,      
    })),
  };

  console.log("🚀 Submit payload:", submitPayload);

  setSubmitting(true);
  try {
    await submitEntriesForPending(submitPayload);

    showAlert({
      variant: "success",
      title: "Success",
      message: "Entries submitted for approval successfully!",
    });

    setSavedEntries([]);
    localStorage.removeItem("savedTimesheetEntries");

    setLocalWeeklySheet({});
    localStorage.removeItem("localWeeklySheet");

    setFormData({
      date: new Date().toISOString().split("T")[0],
      projectId: "",
      taskId: "",
      hoursSpent: "",
      status: "WFO",
      // status_sheet:"",
      notes: "",
      is_tracking: "no",
      tracking_mode: "all",
      tracked_hours: "",
    });
  } catch (error) {
    let errorMessage = "Failed to submit entries for approval.";

    if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error?.message) {
      errorMessage = error.message;
    }

    showAlert({
      variant: "error",
      title: "Error",
      message: errorMessage,
    });
  } finally {
    setSubmitting(false);
  }
};






useEffect(() => {
  if (!Array.isArray(draftPerformanceData)) return;

  const flatDrafts = draftPerformanceData.flatMap(user => {
    if (!Array.isArray(user.sheets)) return [];

    return user.sheets.map(sheet => ({
      id: sheet.id,
      date: sheet.date,
      projectId: sheet.project_id,
      taskId: sheet.task_id,
      hoursSpent: sheet.time,
      status: sheet.work_type,
      notes: sheet.narration,

      is_tracking: sheet.is_tracking ?? "no",
      tracking_mode: sheet.tracking_mode ?? "all",
      tracked_hours: sheet.tracked_hours ?? "",
tracking_id: sheet.tracking_id ?? "",
not_tracked_reason: sheet.not_tracked_reason ?? "",
            originalHoursSpent: sheet.time,

    }));
  });

  console.log("✅ FINAL savedEntries:", flatDrafts);
  setSavedEntries(flatDrafts);
}, [draftPerformanceData]);


  // console.log("Saved entries before submission:", savedEntries);

const buildDraftPayload = (entries) => {
  return {
    data: entries.map(entry => ({
      ...entry,
      status: "draft", 
    })),
  };
};

// useEffect(() => {
//   const saved = localStorage.getItem("savedTimesheetEntries");
//   if (saved) {
//     console.log("Loading saved entries from localStorage:", saved);
//     setSavedEntries(JSON.parse(saved));
//   } else {
//     console.log("No entries found in localStorage");
//   }
// }, []);

const parseHours = (timeStr) => {
  const [hh, mm] = timeStr.split(':').map(Number);
  return hh + mm / 60;
};


const totalHours = Array.isArray(savedEntries)
  ? savedEntries.reduce((sum) => sum + 1, 0)
  : 0;











const mergedWeeklySheet = { ...weeksheet };

const weekEntries = Object.entries(mergedWeeklySheet || {});


useEffect(() => {
  fetchDraftPerformanceDetails({
    is_fillable: 1, 
  });
}, []);




const selectedProject = useMemo(() => {
  if (!formData.projectId || !Array.isArray(userProjects?.data)) return null;

  return userProjects.data.find(
    (p) => String(p.id) === String(formData.projectId)
  );
}, [formData.projectId, userProjects]);

const projectAllowsTracking = selectedProject?.project_tracking === "1";

const projectTrackingAccounts = selectedProject?.relation?.tracking_accounts || [];

const showPartial =
  selectedProject &&
  selectedProject.offline_hours !== null &&
  selectedProject.offline_hours !== "0" &&
  selectedProject.offline_hours !== 0;


useEffect(() => {
  if (!projectAllowsTracking) {
    setFormData(prev => ({
      ...prev,
      is_tracking: "no",
      tracking_mode: "all",
      tracked_hours: "",
    }));
  }
}, [projectAllowsTracking]);



const editEntry = savedEntries[editIndex];

const editProjectAllowsTracking = useMemo(() => {
  if (!editEntry?.projectId) return false;

  const project = userProjects?.data?.find(
    p => p.id === Number(editEntry.projectId)
  );

return project?.project_tracking === "1";
}, [editEntry?.projectId, userProjects]);

const editShowPartial = useMemo(() => {
  if (!editEntry?.projectId) return false;

  const project = userProjects?.data?.find(
    p => String(p.id) === String(editEntry.projectId)
  );

  return (
    project &&
    project.offline_hours !== null &&
    project.offline_hours !== "0" &&
    project.offline_hours !== 0
  );
}, [editEntry?.projectId, userProjects]);


useEffect(() => {
  if (editIndex === null) return;

  if (!editProjectAllowsTracking) {
    handleEdit(editIndex, "is_tracking", "no");
    handleEdit(editIndex, "tracking_mode", "all");
    handleEdit(editIndex, "tracked_hours", "");
  }
}, [editProjectAllowsTracking, editIndex]);


useEffect(() => {
  if (formData.is_tracking !== "yes") return;

  if (!selectedProject) return;

  const accounts =
    selectedProject?.relation?.tracking_accounts || [];

  if (accounts.length === 1) {
    setFormData(prev => ({
      ...prev,
      tracking_id: accounts[0].id,
    }));
  } else if (accounts.length === 0) {
    setFormData(prev => ({
      ...prev,
      tracking_id: "",
    }));
  }
}, [selectedProject, formData.is_tracking]);


const editProjectTrackingAccounts = useMemo(() => {
  if (!editEntry?.projectId) return [];

  const project = userProjects?.data?.find(
    p => String(p.id) === String(editEntry.projectId)
  );

  return project?.relation?.tracking_accounts || [];
}, [editEntry?.projectId, userProjects]);



useEffect(() => {
  if (editIndex === null) return;

  const entry = savedEntries[editIndex];
  if (!entry) return;

  if (entry.is_tracking !== "yes") return;

  const accounts = editProjectTrackingAccounts;

  if (accounts.length === 1) {
    handleEdit(editIndex, "tracking_id", accounts[0].id);
  }
}, [editProjectTrackingAccounts, editIndex]);




  return (
    <>
      <div className=" min-h-screen min-w-full overflow-hidden">
        <SectionHeader icon={ClipboardList} title="Daily Timesheet" subtitle="Employee Daily Timesheet" />
      
        <div className='flex flex-col sm:flex-row justify-around gap-3 testing'>
<div className="add-sheet-form mt-4 p-6 sm:p-8 border rounded-lg shadow-xl bg-white mb-5 lg:mb-0 w-full max-w-1/2">
         
{weekLoading ? (
  <div className="flex justify-center items-center py-10">
    <p className="text-gray-600 text-sm">
      Loading weekly timesheet…
    </p>
  </div>
) : (
<form className="space-y-6">

            {/* Project and Time Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  Date  <span className="text-red-500">*</span>
                </label>
             <input
  type="date"
  id="date"
  max={new Date().toISOString().split("T")[0]}
  name="date"
  value={formData.date}
  onChange={(e) => {
    const newDate = e.target.value;

    localStorage.setItem("lastSelectedDate", newDate);

    setFormData(prev => ({
      ...prev,
      date: newDate,
    }));

    fetchweeksheet(newDate);
  }}
  className="w-full px-4 py-2 text-sm border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-700 focus:outline-none"
/>

              </div>
              <div className="relative">
                <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
                  Project Name <span className="text-red-500">*</span>
                </label>
                <select
                  id="projectId"
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out appearance-none bg-white"
                >
                  <option value="">Select Project</option>
                  {loading && <option disabled>Loading...</option>}
                  {error && <option disabled>Error loading projects</option>}
                  {Array.isArray(userProjects?.data) && userProjects.data.length > 0 ? (
                    userProjects.data.map((project) => (
                      <option key={project.id} value={project.id}>{project.project_name}</option>
                    ))
                  ) : (
                    !loading && !error && <option disabled>No projects found</option>
                  )}
                </select>
              </div>
           
            </div>


            <div className='grid grid-cols-2 sm:grid-cols-2 gap-4'>
   <div className="relative col-span-2">
                <label htmlFor="taskId" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
                  Task Name <span className="text-red-500">*</span>
                </label>
        <select
  id="taskId"
  name="taskId"
  value={formData.taskId}
  onChange={handleChange}
  className="w-full px-4 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out appearance-none bg-white"
  disabled={!formData.projectId}
>
  <option value="">Select Task</option>
  {formData.projectId && (
    userProjects?.data
      ?.find(project => project.id === parseInt(formData.projectId))
      ?.assigned_tasks?.map(task => (
        <option key={task.id} value={task.id}>
          {task.title} ({task.hours}h)
        </option>
      ))
  )}
  {!formData.projectId && <option disabled>Select Project First</option>}
</select>

              </div>


            </div>






             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
           <div className="relative">
  <label
    htmlFor="hoursSpent"
    className="block text-sm font-medium text-gray-700 mb-2 flex items-center"
  >
    <Clock className="w-4 h-4 mr-2 text-gray-400" />
    Time Spent <span className="text-red-500">*</span>
  </label>

<input
  type="text"
  id="hoursSpent"
  name="hoursSpent"
  value={formData.hoursSpent || ""}
  onChange={handleTimeChange}
  onBlur={handleTimeBlur}
  className="w-full text-left px-4 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
  placeholder="HH:MM"
  maxLength={5}
  inputMode="numeric"
/>

{error1 && <p className="text-red-500 mt-1">{error1}</p>}
</div>

                <div className="relative">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Home className="w-4 h-4 mr-2 text-gray-400" />
                  Work Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out appearance-none bg-white"
                >
                  <option value="">--Select--</option>
                  <option value="WFO">Work From Office</option>
                  <option value="WFH">Work from Home</option>
                </select>
              </div>
             </div>


       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

{projectAllowsTracking && (

  <div className="relative">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Tracking? <span className="text-red-500">*</span>
    </label>

 <div className="flex items-center justify-between
                w-full px-4 py-2 text-sm
                border-2 border-gray-200 rounded-lg
                bg-white">

  <span className="text-sm text-gray-600">
    {isTracking ? "Enabled" : "Disabled"}
  </span>






  <button
    type="button"
   onClick={() => {
  setFormData(prev => {
    const newTracking = prev.is_tracking === "yes" ? "no" : "yes";

    return {
      ...prev,
      is_tracking: newTracking,
      tracking_mode: "all",
      tracked_hours: "",
      not_tracked_reason: "",
      tracking_id: newTracking === "no" ? "" : prev.tracking_id,
    };
  });
}}
    className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors
      ${isTracking ? "bg-sky-600" : "bg-gray-300"}`}
  >
    <span
      className={`inline-block h-4 w-4 rounded-full bg-white shadow
        transition-transform duration-200
        ${isTracking ? "translate-x-5" : "translate-x-1"}`}
    />
  </button>
</div>


{projectAllowsTracking && formData.is_tracking === "yes" && (
  <div className="relative">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Tracking Account <span className="text-red-500">*</span>
    </label>

    {projectTrackingAccounts.length === 1 ? (
      <input
        type="text"
        value={projectTrackingAccounts[0].account_name}
        readOnly
        className="w-full px-4 py-2 text-sm border-2 border-gray-200 rounded-lg bg-gray-100"
      />
    ) : (
      <select
  value={formData.tracking_id || ""}
  onChange={(e) =>
    setFormData(prev => ({
      ...prev,
      tracking_id: Number(e.target.value),
    }))
  }
  className="w-full px-4 py-2 text-sm border-2 border-gray-200 rounded-lg"
>
         
        <option value="">Select Tracking Account</option>

        {projectTrackingAccounts.map(account => (
          <option key={account.id} value={account.id}>
            {account.account_name}
          </option>
        ))}
      </select>
    )}
  </div>
)}

{formData.is_tracking === "yes" && (
  <div className="mt-2 flex rounded-lg bg-gray-100 p-1">
    <button
      type="button"
      onClick={() =>
        setFormData(prev => ({ ...prev, tracking_mode: "all", tracked_hours: "" }))
      }
      className={`flex-1 py-1.5 text-xs font-medium rounded-md
        ${formData.tracking_mode === "all"
          ? "bg-white shadow"
          : "text-gray-500"}`}
    >
      All
    </button>
{showPartial && (
    <button
      type="button"
      onClick={() =>
        setFormData(prev => ({ ...prev, tracking_mode: "partial" }))
      }
      className={`flex-1 py-1.5 text-xs font-medium rounded-md
        ${formData.tracking_mode === "partial"
          ? "bg-white shadow"
          : "text-gray-500"}`}
    >
      Partial
    </button>
)}
  </div>
)}

  </div>
)}

<div className="relative">
  {formData.is_tracking === "yes" &&
   formData.tracking_mode === "partial" && (
    <>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Tracked Time <span className="text-red-500">*</span>
      </label>

      <input
        type="text"
        value={formData.tracked_hours}
        onChange={(e) =>
          setFormData(prev => ({
            ...prev,
            tracked_hours: e.target.value
              .replace(/[^0-9:]/g, "")
              .slice(0, 5),
          }))
        }
        onBlur={handleTrackingBlur}
        className="w-full px-4 py-2 text-sm
                   border-2 border-gray-200 rounded-lg
                   focus:ring-2 focus:ring-sky-500"
        placeholder="HH:MM"
        maxLength={5}
        inputMode="numeric"
      />

      {error2 && (
        <p className="text-red-500 text-xs mt-1">{error2}</p>
      )}

      <p className="text-xs text-gray-400 mt-1">
        Remaining time will be marked offline
      </p>
    </>
  )}
</div>

{projectAllowsTracking &&
 (
   (formData.is_tracking === "yes" &&
    formData.tracking_mode === "partial") ||
   formData.is_tracking === "no"
 ) && (
  <div className="relative col-span-2">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Reason for offline tracking <span className="text-red-500">*</span>
    </label>

   

 <div className="space-y-3">

    {[
      "Tracker not available",
      "BM manage already",
      "I will track it later",
    ].map((reason) => (
      <label
        key={reason}
        className="flex items-center space-x-3 cursor-pointer"
      >
        <input
          type="radio"
          name="not_tracked_reason"
          value={reason}
          checked={formData.not_tracked_reason === reason}
          onChange={handleChange}
          className="h-4 w-4 text-sky-600 border-gray-300 focus:ring-sky-500"
        />
        <span className="text-sm text-gray-700">
          {reason}
        </span>
      </label>
    ))}

  </div>



        
  </div>
)}


</div>


          

            <div className="relative">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <FileText className="w-4 h-4 mr-2 text-gray-400" />
                Narration <span className="text-red-500 ">*</span>
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out resize-none"
                placeholder="Enter your notes here"
              ></textarea>
            </div>


            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <button
                type="button"
                onClick={handleSave}
                className="submit-btn text-sm"
              >
                <Save className="w-5 h-5 mr-2" />
                Save Timesheet
              </button>
            </div>
          </form>
)}
        </div>
     <div className='weekly-summary-table flex flex-col justify-between w-full max-w-1/2'>
<div className="mt-4 overflow-hidden bg-white rounded-t-lg">
  <div className="bg-gray-600 text-white px-4 py-2 text-[16px] font-semibold">
    Weekly Summary
  </div>

<div className="overflow-x-auto">
      {loading ? (
        <p className="text-gray-600 text-sm">Loading...</p>
      ) : error ? (
        <p className="text-red-600 text-sm">{error}</p>
      ) : weekEntries.length === 0 ? (
        <p className="text-gray-600 text-sm">No weekly data found.</p>
      ) : (
        <table className="min-w-full border-collapse">
          <thead className='whitespace-nowrap sm:whitespace-normal'>
            <tr className="bg-gray-200 text-gray-800 whitespace-nowrap sm:whitespace-normal">
              <th className="px-4 py-3 text-left text-[11px] font-semibold border">Date</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold border">Day</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold border">Day Total</th>
                 <th className="px-4 py-3 text-left text-[11px] font-semibold border">Leave Hrs</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold border">Holiday</th>
    <th className="px-4 py-3 text-left text-[11px] font-semibold border">Remaining</th>
              {/* <th className="px-4 py-3 text-left text-[11px] font-semibold border">Avlb/OT</th> */}
              {/* <th className="px-4 py-3 text-left text-[11px] font-semibold border">Bill Hrs</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold border">Non Hrs</th> */}
            </tr>
          </thead>

<tbody>
  {weekEntries.map(([date, info], index) => {
    const formattedDate = new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

const total = info.totalHours || "00:00";

const leave =
  info.leave_hours !== undefined && info.leave_hours !== null
    ? info.leave_hours
    : "00:00";

  const holiday =
  info.holiday_hours !== undefined && info.holiday_hours !== null
    ? info.holiday_hours
    : "00:00";   

// ✅ USE FIXED TARGET — NOT available_hours
const TARGET_MINUTES = info.is_wfh ? 600 : 510; // 10h or 8h30

    const available = info.available_hours || "08:30";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const rowDate = new Date(date);
    rowDate.setHours(0, 0, 0, 0);

    const isFuture = rowDate > today;

 let remaining = "--";

if (!isFuture) {
  remaining = available || "00:00";
}


    return (
      <tr
        key={index}
        className="text-gray-700 text-[11px] even:bg-gray-50 hover:bg-gray-100 transition"
      >
        <td className="px-4 py-3 border">{formattedDate}</td>
        <td className="px-4 py-3 border">{info.dayname}</td>

        {/* Total Worked */}
        <td className="px-4 py-3 border text-red-600 font-semibold">
          {total}
        </td>

        {/* Leave Hours */}
        <td className="px-4 py-3 border text-purple-600 font-semibold">
          {leave}
        </td>

        <td className="px-4 py-3 border text-green-600 font-semibold">
          {holiday}
        </td>

        {/* Remaining */}
        <td className="px-4 py-3 border text-blue-600 font-semibold">
          {remaining}
        </td>
      </tr>
    );
  })}
</tbody>




        </table>
      )}
    </div>
</div>
  <div className="bg-white p-6 rounded-lg shadow-xl">
  <h2 className="text-lg font-bold mt-2 mb-4">Notes</h2>

  {Array.isArray(safeNotes) && safeNotes.length > 0 ? (
    <ul className="space-y-2 ml-4">
      {safeNotes.map((note, index) => (
        <li key={note.id || index} className="note text-[12px] text-gray-700 list-disc">
          <span 
            className="inline-block ml-2 align-top"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(
                note.notes || note.content || "No content"
              ),
            }}
          />
        </li>
      ))}
    </ul>
  ) : noteLoading ? (
    <div className="flex items-center justify-center py-10">
      <Loader2 className="w-6 h-6 animate-spin mr-2" />
      <span>Loading...</span>
    </div>
  ) : (
    <p className="text-gray-500 text-center">No notes found</p>
  )}
</div>
     </div>


        </div>

        {/* Timesheet Table */}
        <div className="min-w-screen ml-0 lg:mb-32 rounded">
          <div className="overflow-x-auto">
            {/* Display Saved Entries */}
{Array.isArray(savedEntries) && savedEntries.length > 0 && userProjects?.data && (

              <div className="mt-4 bg-white rounded-xl shadow-lg animate-fadeIn border border-[#d3d3d3]">
                <h3 className="text-lg font-semibold p-4 text-gray-800 mb-4 border-b pb-2">Time Entries</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr className="table-bg-heading table-th-tr-row whitespace-nowrap sm:whitespace-normal">
                        <th className="px-1 py-3 text-center text-[8px] font-medium tracking-wider">Date</th>
                        <th className="px-1 py-3 text-center text-[8px] font-medium tracking-wider">Project</th>
                        <th className="px-1 py-3 text-center text-[8px] font-medium tracking-wider">Task</th>
                        <th className="px-1 py-3 text-center text-[8px] font-medium tracking-wider">Time Spent</th>
                        {/* <th className="px-1 py-3 text-center text-[8px] font-medium tracking-wider">Action</th> */}
                        <th className="px-1 py-3 text-center text-[8px] font-medium tracking-wider">Work Type</th>
                        <th className="px-1 py-3 text-center text-[8px] font-medium tracking-wider">Narration</th>
                        {/* <th className="px-1 py-3 text-center text-[8px] font-medium tracking-wider">Project Type</th> */}
                        {/* <th className="px-1 py-3 text-center text-[8px] font-medium tracking-wider">Project Type Status</th> */}
                        <th className="px-1 py-3 text-center text-[8px] font-medium tracking-wider">Modify</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
{Array.isArray(savedEntries) &&
  savedEntries.map((entry, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-1 py-3 whitespace-nowrap text-center text-[10px] text-gray-900">{entry.date}</td>
                          <td className="px-1 py-3 whitespace-nowrap text-[8px] text-gray-900">
                            {
                               userProjects?.data?.find((p) => p.id === parseInt(entry.projectId))?.project_name || "Unknown Project"
                            }
                          </td>
                      <td className="px-1 py-3 whitespace-nowrap text-[8px] text-gray-900">
  {(() => {
    // 1️⃣ Find project by entry.projectId
    const project = userProjects?.data?.find(p => p.id === parseInt(entry.projectId));
    // 2️⃣ Find task by entry.taskId within that project's assigned_tasks
    const task = project?.assigned_tasks?.find(t => t.id === parseInt(entry.taskId));
    // 3️⃣ Return task title or fallback
    return task?.title || `Task ${entry.taskId}` || "Unknown Task";
  })()}
</td>

                          <td className="px-1 py-3 whitespace-nowrap text-center text-[10px] text-gray-900 border">
                            {
                              <span>
                                {entry.hoursSpent}
                              </span>
                            }
                          </td>

                          {/* <td className="px-1 py-3 whitespace-nowrap text-center text-[10px] text-gray-900">
                            {
                              <span className={`px-2 py-1 rounded-full text-[10px] font-medium ${entry.billingStatus === 'Billable' ? 'bg-green-100 text-green-800' :
                                entry.billingStatus === 'Non Billable' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                {entry.billingStatus}
                              </span>
                            }
                          </td> */}
                          <td className="px-1 py-3 whitespace-nowrap text-center text-[10px] text-gray-900">
                            {
                              <span className={`px-2 py-1 rounded-full text-[10px] font-medium ${entry.status === 'WFO' ? 'bg-purple-100 text-purple-800' : 'bg-indigo-100 text-indigo-800'
                                }`}>
                                {entry.status}
                              </span>
                            }
                          </td>
                          <td className="px-1 py-3 whitespace-nowrap text-center text-[10px] text-gray-900">


                            <span className="overflow-hidden text-ellipsis whitespace-nowrap max-w-[70px] inline-block align-middle" title={entry.notes}>
                            { entry.notes
                              ?  entry.notes.replace(/[,.\n]/g, " ").split(/\s+/).slice(0, 1).join(" ") + "..."
                              : ""}
                          </span>
                          { entry.notes && (
                            <button
                              onClick={() => openModal( entry.notes)}
                              className="inline-block align-middle ml-1 p-1 rounded hover:bg-gray-200"
                              aria-label="Show full narration"
                              type="button"
                            >
                              <Info className="h-4 w-4 text-blue-500" />
                            </button>
                          )}
                            
                          </td>
                          {/* <td className="px-1 py-3 whitespace-nowrap text-center text-[10px] text-gray-900">
                              {
                                entry.project_type
                              }
                            </td>

                            <td className="px-1 py-3 whitespace-nowrap text-center text-[10px] text-gray-900">
                              {
                                entry.project_type_status
                              }
                            </td> */}

                          <td className="px-1 py-3 whitespace-nowrap text-center text-[10px] text-gray-900">
                            <div className="flex space-x-2 justify-center">
                              {
                           <button
  onClick={() => {
    // setPerformanceSheetId(entry.sheet_id); 
    handleEditClick(index);          
  }}
  className="edit-btn text-[14px] py-1"
>
  <Edit className="h-4 w-4 mr-1" />
  Edit
</button>

                              }
                              <button
onClick={async () => {
  await deletesheet(entry.id);
  fetchDraftPerformanceDetails({ is_fillable: 1 });
}}


                                className="delete-btn text-[14px] py-1"
                              ><Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {modalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50" onClick={closeModal} >
                      <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-6 relative" onClick={(e) => e.stopPropagation()} > 
                        <button
                          onClick={closeModal}
                          aria-label="Close modal"
                          className="absolute top-2 right-2 text-2xl font-bold"
                        >
                          &times;
                        </button>
                         <div className="whitespace-normal text-gray-900 break-words">{modalText}</div>
                      </div>
                    </div>
                  )}

                  
                  {editIndex !== null && (




<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
  onClick={() => {
    setSavedEntries((prev) => {
      const updated = [...prev];
      updated[editIndex] = backupEntry;
      return updated;
    });
    setEditIndex(null);
    setBackupEntry(null);
  }}
  >
  <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
    onClick={(e) => e.stopPropagation()}
    >
    <h2 className="text-lg font-semibold mb-6">Edit Entry</h2>

    {/* ================= BASIC INFO ================= */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">

      {/* Project */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
          <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
          Project <span className="text-red-500">*</span>
        </label>
        <select
          value={savedEntries[editIndex]?.projectId || ""}
          onChange={(e) => handleProjectChangeInEdit(editIndex, e.target.value)}
          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out appearance-none"
        >
          <option value="">Select Project</option>
          {loading && <option disabled>Loading...</option>}
          {error && <option disabled>Error loading projects</option>}
          {Array.isArray(userProjects?.data) && userProjects.data.length > 0 ? (
            userProjects.data.map((project) => (
              <option key={project.id} value={project.id}>
                {project.project_name}
              </option>
            ))
          ) : (
            !loading && !error && <option disabled>No projects found</option>
          )}
        </select>
      </div>

      {/* Task */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
          <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
          Task <span className="text-red-500">*</span>
        </label>
       <select
          value={savedEntries[editIndex]?.taskId || ""}
          onChange={(e) => handleEdit(editIndex, "taskId", e.target.value)}
          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out appearance-none"
          disabled={!savedEntries[editIndex]?.projectId}
        >
          <option value="">Select Task</option>
          {savedEntries[editIndex]?.projectId && (
            userProjects?.data
              ?.find(project => project.id === parseInt(savedEntries[editIndex].projectId))
              ?.assigned_tasks?.map(task => (
                <option key={task.id} value={task.id}>
                  {task.title} ({task.hours}h)
                </option>
              ))
          )}
          {!savedEntries[editIndex]?.projectId && <option disabled>Select Project First</option>}
        </select>

      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
          Date
        </label>
        <input
                  type="date"
                  id="date"
                  max={new Date().toISOString().split("T")[0]}
                  name="date"
                  value={savedEntries[editIndex].date}
                  onChange={(e) =>{




                  
                    
                    handleEdit(editIndex, "date", e.target.value)
                    fetchweeksheet(e.target.value)
                  
                  }
                    
                  }
                    // Corrected line({ ...formData, date: e.target.value })} // Corrected line
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-700 focus:outline-none"
                  // readOnly
                />
      </div>

      {/* Hours */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Hours Spent
        </label>
       <input
          type="text"
          value={savedEntries[editIndex]?.hoursSpent || ""}
          onChange={(e) =>
            handleEdit(
              editIndex,
              "hoursSpent",
              e.target.value.replace(/[^0-9:]/g, "").slice(0, 5)
            )
          }
          onBlur={() => handleEntryTimeBlur(editIndex, "hoursSpent")}
          placeholder="HH:MM"
          maxLength={5}
          inputMode="numeric"
          className="w-full rounded-lg px-2 py-2.5 border-2 border-gray-200"
        />
      </div>

      {/* Status FULL WIDTH */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Status
        </label>
        <select
            value={savedEntries[editIndex].status}
            onChange={e => handleEdit(editIndex, "status", e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">--Select--</option>
            <option value="WFO">Work From Office</option>
            <option value="WFH">Work from Home</option>
           
          </select>
      </div>
    </div>

    {/* ================= TRACKING SECTION ================= */}
    {editProjectAllowsTracking && (
      <div className="mt-8 space-y-5">

        {/* Toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tracking <span className="text-red-500">*</span>
          </label>

          <div className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg flex items-center justify-between bg-white">
            <span className="text-sm text-gray-600">
              {savedEntries[editIndex]?.is_tracking === "yes"
                ? "Enabled"
                : "Disabled"}
            </span>

            <button
              type="button"
              onClick={() => {
              const enabled =
                savedEntries[editIndex]?.is_tracking === "yes";

              const newValue = enabled ? "no" : "yes";

              handleEdit(editIndex, "is_tracking", newValue);

              // Reset fields when toggled
              handleEdit(editIndex, "tracking_mode", "all");
              handleEdit(editIndex, "tracked_hours", "");
              handleEdit(editIndex, "not_tracked_reason", "");

              // if (newValue === "no") {
              //   handleEdit(editIndex, "tracking_id", "");
              // }
              if (newValue === "no") {
                handleEdit(editIndex, "tracking_id", null);
              }
            }}
              className={`relative inline-flex h-5 w-10 items-center rounded-full transition
                ${
                  savedEntries[editIndex]?.is_tracking === "yes"
                    ? "bg-sky-600"
                    : "bg-gray-300"
                }`}
            >

              <span
                className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform 
                  ${
                    savedEntries[editIndex]?.is_tracking === "yes"
                      ? "translate-x-5"
                      : "translate-x-1"
                  }`}
              />
            </button>
          </div>
        </div>

        {/* Tracking Mode + Account + Partial */}
        {savedEntries[editIndex]?.is_tracking === "yes" && (
          <div className="space-y-5">

            {/* Mode */}
            <div className="flex rounded-lg bg-gray-100 p-1">
              <button
                type="button"
                onClick={() =>
                  handleEdit(editIndex, "tracking_mode", "all")
                }
                className={`flex-1 py-1.5 text-xs font-medium rounded-md 
                  ${
                    savedEntries[editIndex]?.tracking_mode === "all"
                      ? "bg-white shadow text-gray-900"
                      : "text-gray-500"
                  }`}
              >
                All
              </button>

              {editShowPartial && (
                <button
                  type="button"
                  onClick={() =>
                    handleEdit( editIndex, "tracking_mode", "partial")
                  }
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md 
                    ${
                      savedEntries[editIndex]?.tracking_mode === "partial"
                        ? "bg-white shadow text-gray-900"
                        : "text-gray-500"
                    }`}
                >
                  Partial
                </button>
              )}
            </div>

            {/* Account */}
            {editProjectAllowsTracking &&
              savedEntries[editIndex]?.is_tracking === "yes" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tracking Account <span className="text-red-500">*</span>
              </label>

              {editProjectTrackingAccounts.length === 1 ? (
                <input
                  type="text"
                  readOnly
                  value={ editProjectTrackingAccounts[0].account_name }
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-100"
                />
              ) : (
                <select
                  value={Number(savedEntries[editIndex]?.tracking_id ) || ""}
                  onChange={(e) =>
                    handleEdit(
                      editIndex,
                      "tracking_id",
                      Number(e.target.value)
                    )
                  }
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg"
                >
                  <option value="">Select Tracking Account</option>
                  {editProjectTrackingAccounts.map(account => (
                    <option key={account.id} value={account.id}>
                      {account.account_name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            )}

            {/* Partial Hours */}
            {editIndex !== null &&
              savedEntries[editIndex]?.is_tracking === "yes" &&
              savedEntries[editIndex]?.tracking_mode === "partial" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tracked Time
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={ savedEntries[editIndex]?.tracked_hours || ""}
                  onChange={(e) =>
                    handleEdit(
                      editIndex,
                      "tracked_hours",
                      e.target.value.replace(/[^0-9:]/g, "").slice(0, 5)
                    )
                  }
                  onBlur={() => handleEntryTimeBlur(editIndex, "tracked_hours")}
                  placeholder="HH:MM"
                  maxLength={5}
                  inputMode="numeric"
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Remaining time will be marked offline
                </p>
              </div>
            )}
          </div>
        )}

        {/* Reason */}
        {editProjectAllowsTracking &&
            (
              (savedEntries[editIndex]?.is_tracking === "yes" &&
                savedEntries[editIndex]?.tracking_mode === "partial") ||
              savedEntries[editIndex]?.is_tracking === "no"
            ) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for offline tracking{" "}
              <span className="text-red-500">*</span>
            </label>
           

            <div className="space-y-3">
              {[
                "Tracker not available",
                "BM manage already",
                "I will track it later",
              ].map((reason) => (
                <label
                  key={reason}
                  className="flex items-center space-x-3 cursor-pointer"
                >
                  <input
                    type="radio"
                    name={`not_tracked_reason_${editIndex}`}
                    value={reason}
                    checked={
                      savedEntries[editIndex]?.not_tracked_reason === reason
                    }
                    onChange={() =>
                      handleEdit(editIndex, "not_tracked_reason", reason)
                    }
                    className="h-4 w-4 text-sky-600 border-gray-300 focus:ring-sky-500"
                  />
                  <span className="text-sm text-gray-700">
                    {reason}
                  </span>
                </label>
              ))}
            </div>



                 
          </div>
        )}
      </div>
    )}

    {/* ================= NOTES ================= */}
    <div className="mt-8">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Notes
      </label>
      <textarea
        rows={3}
        value={savedEntries[editIndex].notes}
        onChange={(e) =>
          handleEdit(editIndex, "notes", e.target.value)
        }
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500"
      />
    </div>

    {/* ================= BUTTONS ================= */}
    <div className="mt-8 flex justify-end space-x-3">
      <button
        onClick={handleSaveClick}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        <Save className="h-4 w-4 mr-1 inline" />
        Save
      </button>

      <button
        onClick={() => {
          setSavedEntries((prev) => {
            const updated = [...prev];
            updated[editIndex] = backupEntry;
            return updated;
          });
          setEditIndex(null);
          setBackupEntry(null);
        }}
        className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
      >
        Cancel
      </button>
    </div>
  </div>
</div>






)}

                </div>
              </div>
            )}
{Array.isArray(savedEntries) && savedEntries.length > 0 && (
              <div className="flex justify-center mt-6">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="submit-btn"
                  disabled={submitting}
                >
                  {submitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    "Submit for Approval"
                  )}
                </button>
              </div>
            )}
            {/* {showPopup && (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
    <div className="bg-white p-6 rounded shadow-md max-w-md w-full">
      <h2 className="text-lg font-bold mb-4">Short Leave Confirmation</h2>
      <p className="mb-4">
        Your total hours are less than 8:30. The remaining hours will be considered as short leave.
      </p>
      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          id="confirmShortLeave"
          checked={confirmShortLeave}
          onChange={() => setConfirmShortLeave(!confirmShortLeave)}
          className="mr-2"
        />
        <label htmlFor="confirmShortLeave" className="text-sm">
          I understand and agree to submit with short leave
        </label>
      </div>
      <div className="flex justify-end space-x-3">
        <button
          onClick={() => setShowPopup(false)}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            if (!confirmShortLeave) return;
            setShowPopup(false);
            handleSubmit(); // Re-run submission now that checkbox is checked
          }}
          className={`px-4 py-2 rounded ${
            confirmShortLeave ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          disabled={!confirmShortLeave}
        >
          Submit Anyway
        </button>
      </div>
    </div>
  </div>
)} */}



{showApprovalPopup && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">

      <h3 className="text-lg font-semibold mb-3 text-gray-800">
        Timesheet Locked
      </h3>

      <p className="text-sm text-gray-600 mb-3">
        You need to apply Approval for this date.
        After approval, you can fill the performance sheet for{" "}
        <span className="font-semibold">{blockedDate}</span>.
      </p>

      {/* ✅ REASON INPUT */}
      <textarea
        className="w-full border border-gray-300 rounded p-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Write reason (why you forgot to fill timesheet)"
        value={approvalReason}
        onChange={(e) => setApprovalReason(e.target.value)}
        rows={3}
      />

      <div className="flex justify-end gap-3">
        <button
          onClick={() => {
            setShowApprovalPopup(false);
            setBlockedDate("");
            setIsDateAllowed(false);
            setApprovalReason(""); // reset
          }}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Cancel
        </button>

        <button
          disabled={!approvalReason.trim()}
          onClick={() => handleApplyForApproval(blockedDate, approvalReason)}
          className={`px-4 py-2 rounded text-white ${
            approvalReason.trim()
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-blue-300 cursor-not-allowed"
          }`}
        >
          Apply for Approval
        </button>
      </div>
    </div>
  </div>
)}
          </div>
        </div>
      </div>
    </>
  );
};

export default Addsheet;