import React, { useState, useEffect } from 'react';
import { Clock, Briefcase, ClipboardList, Home, FileText, Save, Trash2, Edit,Calendar } from 'lucide-react';
import { useUserContext } from "../../../context/UserContext";
import { SectionHeader } from '../../../components/SectionHeader';
import { useAlert } from "../../../context/AlertContext";
import RedirectToDashboard from '../../../components/RedirectToDashboard';
import { Info } from "lucide-react";
const Addsheet = () => {
  const { submitEntriesForApproval } = useUserContext();
  const [submitting, setSubmitting] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  // const [view, setView] = useState('dashboard');
  const [localWeeklySheet, setLocalWeeklySheet] = useState({});

  // const [rows, setRows] = useState([]);
  // const [projects, setProjects] = useState([]);
  // const [standups, setStandups] = useState([]);
  // const [users, setUsers] = useState([]);
  // const [profileName, setProfileName] = useState('');
  const { userProjects, loading, error,weeksheet,fetchweeksheet } = useUserContext();
  // const [selectedProject, setSelectedProject] = useState("");
  const [tags, setTags] = useState([]);
  const { showAlert } = useAlert();

  // console.log("projects mounted", userProjects);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    // date: "",
    projectId: "",
    taskId:"",
    hoursSpent: "",
    billingStatus: "",
    status: "WFO",
    notes: "",
    project_type: "",
    project_type_status: "",
  });
  const [error1, setError1] = React.useState("");

  const [showPopup, setShowPopup] = useState(false);
const [confirmShortLeave, setConfirmShortLeave] = useState(false);
// const [submitting, setSubmitting] = useState(false); // already present


  const [savedEntries, setSavedEntries] = useState([]);

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


  useEffect(() => {
 fetchweeksheet();
  }, [])
  

const handleEdit = (index, field, value) => {
  const updatedEntries = [...savedEntries];

  // 🎯 Handle project change
  if (field === "projectId") {
    const selectedProject = userProjects.data.find(
      (project) => project.id === parseInt(value)
    );
    if (selectedProject) {
      updatedEntries[index] = {
        ...updatedEntries[index],
        [field]: value,
        tags_activitys: selectedProject.tags_activitys,
      };
    }
  } 
// Add this INSIDE handleEdit function, after projectId logic:
if (field === "taskId") {
  const selectedProject = userProjects?.data?.find(p => p.id === parseInt(updatedEntries[index].projectId));
  const selectedTask = selectedProject?.assigned_tasks?.find(t => t.id === parseInt(value));
  
  if (selectedTask) {
    updatedEntries[index] = {
      ...updatedEntries[index],
      [field]: value,
      hoursSpent: selectedTask.hours ? `${selectedTask.hours}:00` : updatedEntries[index].hoursSpent
    };
  } else {
    updatedEntries[index] = {
      ...updatedEntries[index],
      [field]: value,
    };
  }
  setSavedEntries(updatedEntries);
  localStorage.setItem("savedTimesheetEntries", JSON.stringify(updatedEntries));
  return;
}


  // 🎯 Handle billing status change
  else if (field === "billingStatus") {
    const selectedTag = tags.find((tag) => tag.id.toString() === value);
    if (selectedTag) {
      value = selectedTag.name;
    }
    updatedEntries[index] = {
      ...updatedEntries[index],
      [field]: value,
    };
  } 
  // 🎯 Special handling for hoursSpent
  else if (field === "hoursSpent") {
    let rawInput = value || "";
    rawInput = rawInput.replace(/[^0-9:]/g, ""); // allow only digits & colon

    // Auto-insert colon after two digits (e.g., 930 → 09:30)
    if (/^\d{3,4}$/.test(rawInput)) {
      rawInput = rawInput.slice(0, 2) + ":" + rawInput.slice(2, 4);
    }

    // Update UI for smoother typing
    updatedEntries[index] = { ...updatedEntries[index], hoursSpent: rawInput };
    setSavedEntries(updatedEntries);

    // Wait for valid format before validation
    if (!/^\d{1,2}:\d{2}$/.test(rawInput)) return;

    // Format time consistently
    const [newH, newM] = rawInput.split(":").map(Number);
    const formatted = `${newH.toString().padStart(2, "0")}:${newM
      .toString()
      .padStart(2, "0")}`;

    const entry = updatedEntries[index];
    const date = entry.date;

    // ✅ Get total from merged sheet (API + local)
    const existing = mergedWeeklySheet[date]?.totalHours || "00:00";

    // Convert existing total to minutes
    const [exH, exM] = existing.split(":").map(Number);
    let totalMinutes = exH * 60 + exM;

    // Subtract the old version of this entry’s hours
    const [oldH, oldM] = (savedEntries[index]?.hoursSpent || "00:00")
      .split(":")
      .map(Number);
    totalMinutes -= oldH * 60 + oldM;

    // Add the new version of this entry’s hours
    totalMinutes += newH * 60 + newM;

    // ✅ Allow up to exactly 600 minutes (10:00)
    if (totalMinutes > 600) {
      const totalH = Math.floor(totalMinutes / 60)
        .toString()
        .padStart(2, "0");
      const totalM = (totalMinutes % 60).toString().padStart(2, "0");

      showAlert({
        variant: "warning",
        title: "Limit Exceeded",
        message: `Total hours for ${date} exceed 10:00 (${totalH}:${totalM}). Change not saved.`,
      });

      // ❌ Revert to previous valid value
      updatedEntries[index].hoursSpent = savedEntries[index].hoursSpent || "00:00";
      setSavedEntries([...updatedEntries]);
      return;
    }

    // ✅ Safe to update hours
    updatedEntries[index].hoursSpent = formatted;
  } 
  // 🎯 Other field updates
  else {
    updatedEntries[index] = {
      ...updatedEntries[index],
      [field]: value,
    };
  }

  // ✅ Save final valid entries
  setSavedEntries(updatedEntries);
  localStorage.setItem("savedTimesheetEntries", JSON.stringify(updatedEntries));
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




const handleDelete = (index) => {
  const deletedEntry = savedEntries[index];
  const updatedEntries = savedEntries.filter((_, i) => i !== index);
  setSavedEntries(updatedEntries);
  localStorage.setItem("savedTimesheetEntries", JSON.stringify(updatedEntries));

  if (deletedEntry?.date) {
    const dateToDelete = deletedEntry.date;

    setLocalWeeklySheet((prev) => {
      const updatedSheet = { ...prev };

      if (updatedSheet[dateToDelete]) {
        delete updatedSheet[dateToDelete];
      }

      // Save updated sheet back to localStorage
      localStorage.setItem("localWeeklySheet", JSON.stringify(updatedSheet));

      return updatedSheet;
    });
  }

  console.log("Deleted entry and removed date from local weekly sheet:", deletedEntry?.date);
};


const handleTimeChange = (e) => {
  let value = e.target.value;

  // Allow only numbers and colon
  value = value.replace(/[^0-9:]/g, "");

  // Prevent extra colons
  const parts = value.split(":");
  if (parts.length > 2) value = parts[0] + ":" + parts[1];

  // Limit total length (HH:MM)
  if (value.length > 5) value = value.slice(0, 5);

  setFormData((prev) => ({ ...prev, hoursSpent: value }));
};

const handleTimeBlur = (e) => {
  let value = e.target.value.trim();

  if (/^\d{1}$/.test(value)) {

    value = `0${value}:00`;
  } else if (/^\d{2}$/.test(value)) {

    value = `${value}:00`;
  } else if (/^\d{1,2}:$/.test(value)) {
    // "8:" → "08:30"
    const [h] = value.split(":");
    value = `${h.padStart(2, "0")}:30`;
  } else if (/^\d{1,2}:\d$/.test(value)) {
    // "9:5" → "09:50"
    const [h, m] = value.split(":");
    value = `${h.padStart(2, "0")}:${m.padEnd(2, "0")}`;
  }

  // Validate upper limit (10:30)
  const [hStr, mStr] = value.split(":");
  const h = parseInt(hStr || "0", 10);
  const m = parseInt(mStr || "0", 10);
  if (h > 10 || (h === 10 && m > 30)) {
    setError1("Time cannot be more than 10:30");
  } else {
    setError1("");
  }

  setFormData((prev) => ({ ...prev, hoursSpent: value }));
};




const handleEditClick = (index) => {
  setEditIndex(index);

  const entry = savedEntries[index];
  if (!entry) return; // Prevents crash if index is invalid

  const selectedProjectId = entry.projectId;

  const selectedProject = userProjects?.data?.find(
    (project) => project.id === parseInt(selectedProjectId)
  );

  if (selectedProject) {
    setTags(selectedProject.tags_activitys || []);
  }

  console.log("these are saved entries", savedEntries);
};


const handleSaveClick = () => {
  const previousEntries = [...savedEntries];

  const updatedEntries = savedEntries.map((entry) => {
    const selectedTag = tags.find(
      (tag) => tag.id.toString() === entry.billingStatus.toString()
    );
    return {
      ...entry,
      billingStatus: selectedTag ? selectedTag.name : entry.billingStatus,
    };
  });

  let isInvalid = false;
  const newLocalWeekly = { ...localWeeklySheet }; // clone to recalc

  for (let i = 0; i < updatedEntries.length; i++) {
    const entry = updatedEntries[i];
    const date = entry.date;
    let addedHours = (entry.hoursSpent || "").trim();

    // ⏱ Normalize shorthand inputs (e.g. 5 -> 05:00)
    if (/^\d+$/.test(addedHours)) {
      addedHours = addedHours.padStart(2, "0") + ":00";
    } else if (/^\d+(\.\d+)?$/.test(addedHours)) {
      const num = parseFloat(addedHours);
      const h = Math.floor(num);
      const m = Math.round((num - h) * 60);
      addedHours = `${h.toString().padStart(2, "0")}:${m
        .toString()
        .padStart(2, "0")}`;
    } else if (/^\d{1,2}:\d{1,2}$/.test(addedHours)) {
      const [h, m] = addedHours.split(":").map((v) => Number(v) || 0);
      addedHours = `${h.toString().padStart(2, "0")}:${m
        .toString()
        .padStart(2, "0")}`;
    }

    if (!/^\d{2}:[0-5][0-9]$/.test(addedHours)) {
      showAlert({
        variant: "warning",
        title: "Invalid Time Format",
        message: `Invalid time "${addedHours}" for ${date}. Use HH:MM format.`,
      });
      isInvalid = true;
      break;
    }

    // 🧮 Recalculate the total hours for that date using updated entries
   const totalMinutesForDate = updatedEntries.reduce((sum, e) => {
  if (e.date !== date) return sum;
  const [h, m] = (e.hoursSpent || "00:00").split(":").map(Number);
  return sum + h * 60 + m;
}, 0);


    if (totalMinutesForDate > 600) {
      const totalH = Math.floor(totalMinutesForDate / 60)
        .toString()
        .padStart(2, "0");
      const totalM = (totalMinutesForDate % 60).toString().padStart(2, "0");

      showAlert({
        variant: "warning",
        title: "Limit Exceeded",
        message: `Total hours for ${date} exceed 10:00 (${totalH}:${totalM}). Edit not saved.`,
      });

      isInvalid = true;
      break;
    }

    // ✅ Update localWeeklySheet live
    const newH = Math.floor(totalMinutesForDate / 60)
      .toString()
      .padStart(2, "0");
    const newM = (totalMinutesForDate % 60).toString().padStart(2, "0");
    newLocalWeekly[date] = {
      ...(weeksheet[date] || {}),
      totalHours: `${newH}:${newM}`,
    };
  }

  if (isInvalid) {
    setSavedEntries(previousEntries);
    return;
  }

  // ✅ Save changes to local storage and merged sheet
  // setLocalWeeklySheet(newLocalWeekly);
  localStorage.setItem("localWeeklySheet", JSON.stringify(newLocalWeekly));

  localStorage.setItem("savedTimesheetEntries", JSON.stringify(updatedEntries));
  setSavedEntries(updatedEntries);
  setEditIndex(null);

  console.log("✅ Updated entries and synced localWeeklySheet:", updatedEntries);
};







const handleSave = () => {
  if (
    !formData.date ||
    !formData.projectId ||
    !formData.hoursSpent ||
    !formData.billingStatus ||
    !formData.status ||
    !formData.notes ||
    !formData.project_type ||
    !formData.project_type_status
  ) {
    showAlert({
      variant: "warning",
      title: "Warning",
      message: "Please fill all required fields before saving.",
    });
    return;
  }

  // Validate hoursSpent <= 10:30
  const [hoursStr, minutesStr] = (formData.hoursSpent || "").split(":");
  const hours = parseInt(hoursStr, 10) || 0;
  const minutes = parseInt(minutesStr, 10) || 0;

  if (hours > 10 || (hours === 10 && minutes > 30)) {
    showAlert({
      variant: "warning",
      title: "Warning",
      message: "Time spent cannot be more than 10:30.",
    });
    return;
  }

  // ✅ Check total hours for that date after adding this entry
  const existing =
    localWeeklySheet[formData.date]?.totalHours ||
    weeksheet[formData.date]?.totalHours ||
    "00:00";

  const [exH, exM] = existing.split(":").map(Number);
  const [addH, addM] = (formData.hoursSpent || "00:00").split(":").map(Number);
  const totalMinutes = exH * 60 + exM + addH * 60 + addM;

  if (totalMinutes > 600) {
    showAlert({
      variant: "warning",
      title: "Warning",
      message: `Total hours for ${formData.date} exceed 10. Entry not saved.`,
    });
    return; // ❌ Stop here — don’t update anything
  }

  // ✅ Continue only if within 10:00
  const selectedTag = tags.find(
    (tag) => tag.id.toString() === formData.billingStatus.toString()
  );
  if (!selectedTag) {
    showAlert({
      variant: "warning",
      title: "Missing Tag",
      message: "Please select a valid Action after choosing the Project.",
    });
    return;
  }

  const tagName = selectedTag.name;
  const newEntry = {
    ...formData,
    billingStatus: tagName,
  };

  const updated = [...savedEntries, newEntry];
  setSavedEntries(updated);


  localStorage.setItem("savedTimesheetEntries", JSON.stringify(updated));


  setFormData({
    date: new Date().toISOString().split("T")[0],
    projectId: "",
    hoursSpent: "",
    billingStatus: "",
    status: "",
    notes: "",
    project_type: "",
    project_type_status: "",
  });
};



useEffect(() => {
  console.group("🧮 Recalculating Weekly Totals (API + Local)");

  const newWeekly = {};

  // 1️⃣ Start with API weekly data (baseline)
  Object.entries(weeksheet || {}).forEach(([date, info]) => {
    newWeekly[date] = {
      dayname: info?.dayname || "",
      totalHours: info?.totalHours || "00:00",
      totalBillableHours: info?.totalBillableHours || "00:00",
      totalNonBillableHours: info?.totalNonBillableHours || "00:00",
    };
    console.log(`API [${date}]`, newWeekly[date]);
  });

  // Helper to safely format minutes to HH:MM
  const formatTime = (mins) => {
    const hh = Math.floor(mins / 60).toString().padStart(2, "0");
    const mm = (mins % 60).toString().padStart(2, "0");
    return `${hh}:${mm}`;
  };

  // Helper to safely normalize billing status
  const normalizeBilling = (val) => {
    if (!val) return "";
    if (typeof val === "number") return String(val);
    if (typeof val === "object") return val.name || "";
    return String(val);
  };

  // 2️⃣ Add or update hours from local savedEntries
  savedEntries.forEach((entry) => {
    if (!entry.date || !entry.hoursSpent) return;

    const date = entry.date;
    const [h, m] = (entry.hoursSpent || "00:00").split(":").map(Number);
    const addedMinutes = (h || 0) * 60 + (m || 0);

    // Initialize from API or blank
    const existing = newWeekly[date] || {
      dayname: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
      totalHours: "00:00",
      totalBillableHours: "00:00",
      totalNonBillableHours: "00:00",
    };

    // Parse existing totals
    const [exH, exM] = (existing.totalHours || "00:00").split(":").map(Number);
    const [exBH, exBM] = (existing.totalBillableHours || "00:00").split(":").map(Number);
    const [exNBH, exNBM] = (existing.totalNonBillableHours || "00:00").split(":").map(Number);

    let totalMinutes = exH * 60 + exM + addedMinutes;
    let totalBillableMinutes = exBH * 60 + exBM;
    let totalNonBillableMinutes = exNBH * 60 + exNBM;

    // ✅ Safe billing check
    const billingStr = normalizeBilling(entry.billingStatus).toLowerCase();
    const isBillable = billingStr.includes("billable") || billingStr === "in-house";

    if (isBillable) totalBillableMinutes += addedMinutes;
    else totalNonBillableMinutes += addedMinutes;

    // Store updated totals
    newWeekly[date] = {
      dayname: existing.dayname,
      totalHours: formatTime(totalMinutes),
      totalBillableHours: formatTime(totalBillableMinutes),
      totalNonBillableHours: formatTime(totalNonBillableMinutes),
    };
  });

  console.log("✅ Final Combined Weekly Totals:", newWeekly);
  console.groupEnd();

  // 3️⃣ Save to state and localStorage
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
  //   if (!savedEntries.length) return;

  //    if (totalHours > 12) {
  //      showAlert({
  //     variant: "warning",
  //     title: "Warning",
  //     message: "Total hours cannot exceed 12."
  //   });
  //   return;
  // }

const toMinutes = (timeStr = "00:00") => {
    const [h, m] = (timeStr || "00:00").split(":").map(Number);
    return h * 60 + m;
  };

  const totalWeeklyMinutes = Object.entries({
    ...weeksheet,
    ...localWeeklySheet,
  }).reduce((sum, [_, info]) => {
    const total = toMinutes(info.totalHours);
    return sum + total;
  }, 0);

  const totalWeeklyHours = `${Math.floor(totalWeeklyMinutes / 60)
    .toString()
    .padStart(2, "0")}:${(totalWeeklyMinutes % 60)
    .toString()
    .padStart(2, "0")}`;

  console.log(`🧮 Total Weekly: ${totalWeeklyHours} (${totalWeeklyMinutes} mins)`);
  if (totalWeeklyMinutes < 270 && !confirmShortLeave) {
    showAlert({
      variant: "info",
      title: "Short Week",
      message: `Your total weekly hours (${totalWeeklyHours}) are below 4:30. Please confirm short leave.`,
    });
    setShowPopup(true);
    return;
  }

    const formattedEntries = {
      data: savedEntries.map((entry) => ({
        project_id: entry.projectId,
        task_id: entry.taskId,
        date: entry.date,
        time: entry.hoursSpent, 
        work_type: entry.status,
        activity_type: entry.billingStatus,
        narration: entry.notes,
        project_type: entry.project_type,
        project_type_status: entry.project_type_status,
      })),
    };

    console.log("Final data before submission:", formattedEntries); 

    setSubmitting(true);
try {
  await submitEntriesForApproval(formattedEntries); 
  showAlert({ variant: "success", title: "Success", message: "Entries submitted for approval successfully!" });
  setSavedEntries([]);
  localStorage.removeItem("savedTimesheetEntries");
  setLocalWeeklySheet({});
localStorage.removeItem("localWeeklySheet");

setFormData({
  date: new Date().toISOString().split("T")[0],
  projectId: "",
  taskId:"",
  hoursSpent: "",
  billingStatus: "",
  status: "WFO",
  notes: "",
  project_type: "",
  project_type_status: "",
});
} catch (error) {
  let errorMessage = "Failed to submit entries for approval.";
  
  if (error.response && error.response.data && error.response.data.message) {
    errorMessage = error.response.data.message;
  } else if (error.message) {
    errorMessage = error.message;
  }
  
  showAlert({ variant: "error", title: "Error", message: errorMessage });
} finally {
  setSubmitting(false);
}

  };

  console.log("Saved entries before submission:", savedEntries);


useEffect(() => {
  const saved = localStorage.getItem("savedTimesheetEntries");
  if (saved) {
    console.log("Loading saved entries from localStorage:", saved);
    setSavedEntries(JSON.parse(saved));
  } else {
    console.log("No entries found in localStorage");
  }
}, []);

const parseHours = (timeStr) => {
  const [hh, mm] = timeStr.split(':').map(Number);
  return hh + mm / 60;
};


const totalHours = savedEntries.reduce((sum, entry) => {
  if (!entry.hoursSpent) return sum;
  return sum + parseHours(entry.hoursSpent);
}, 0);





useEffect(() => {
  // Load locally saved sheet if available
  const storedLocalSheet = localStorage.getItem("localWeeklySheet");
  if (storedLocalSheet) {
    setLocalWeeklySheet(JSON.parse(storedLocalSheet));
  }
}, []);

const updateLocalWeeklySheet = (date, addedHours) => {
  setLocalWeeklySheet((prev) => {
    const existing = prev[date]?.totalHours || weeksheet[date]?.totalHours || "00:00";

    const [exH, exM] = existing.split(":").map(Number);
    const [adH, adM] = addedHours.split(":").map(Number);
    const totalMinutes = exH * 60 + exM + adH * 60 + adM;

    // ✅ Hard limit: 10:00 (600 minutes)
    if (totalMinutes > 600) {
      showAlert({
        variant: "warning",
        title: "Warning",
        message: `Total hours for ${date} exceed 10:00. Not saved.`,
      });
      return prev; // ❌ Don't update or save to localStorage
    }

    const newH = Math.floor(totalMinutes / 60).toString().padStart(2, "0");
    const newM = (totalMinutes % 60).toString().padStart(2, "0");

    const updated = {
      ...prev,
      [date]: {
        ...(weeksheet[date] || {}),
        totalHours: `${newH}:${newM}`,
      },
    };

    // ✅ Only save when within valid limit
    localStorage.setItem("localWeeklySheet", JSON.stringify(updated));
    return updated;
  });
};


const subtractFromLocalWeeklySheet = (date, removedHours) => {
  setLocalWeeklySheet((prev) => {
    const existing = prev[date]?.totalHours || weeksheet[date]?.totalHours || "00:00";

    const [exH, exM] = existing.split(":").map(Number);
    const [rmH, rmM] = removedHours.split(":").map(Number);
    const totalMinutes = exH * 60 + exM - (rmH * 60 + rmM);

    const safeMinutes = Math.max(totalMinutes, 0); // avoid negative values
    const newH = Math.floor(safeMinutes / 60).toString().padStart(2, "0");
    const newM = (safeMinutes % 60).toString().padStart(2, "0");

    const updated = {
      ...prev,
      [date]: {
        ...(weeksheet[date] || {}),
        totalHours: `${newH}:${newM}`,
      },
    };

    localStorage.setItem("localWeeklySheet", JSON.stringify(updated));
    return updated;
  });
};



const mergedWeeklySheet = { ...weeksheet, ...localWeeklySheet };
const weekEntries = Object.entries(mergedWeeklySheet || {});





  return (
    <>
      <div className=" min-h-screen min-w-full overflow-hidden">
        {/* Date Section */}
        <SectionHeader icon={ClipboardList} title="Daily Timesheet" subtitle="Employee Daily Timesheet" />
        {/* <div className="flex items-start justify-between">
          <div><h2 className="text-4xl font-bold text-gray-800">Daily Timesheet</h2></div>
          
        </div> */}
        {/* Timesheet Form */}
        <div className='flex flex-col sm:flex-row justify-around gap-3 testing'>
<div className="add-sheet-form mt-10 p-6 sm:p-8 border rounded-lg shadow-xl bg-white mb-5 lg:mb-0 w-full max-w-1/2">
          {/* <div className="flex items-center justify-center mb-6">
            <ClipboardList className="w-8 h-8 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-800">Daily Timesheet</h2>
          </div> */}

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
  setFormData({ ...formData, date: newDate });
  fetchweeksheet(newDate); 
}}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-700 focus:outline-none"
           
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
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out appearance-none bg-white"
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
  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out appearance-none bg-white"
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
  className="w-full text-left px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
  placeholder="HH:MM"
  maxLength={5}
  inputMode="numeric"
/>

{error1 && <p className="text-red-500 mt-1">{error1}</p>}
</div>


              <div className="relative">
                <label htmlFor="billingStatus" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <ClipboardList className="w-4 h-4 mr-2 text-gray-400" />
                  Action <span className="text-red-500">*</span>
                </label>
                <select
                  id="billingStatus"
                  name="billingStatus"
                  value={formData.billingStatus}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out appearance-none bg-white"
                >

                  <option value="">--Select--</option>
                  {tags.length > 0 ? (
                    tags.map((tag, index) => (
                      <option key={index} value={tag.id}>{tag.name}</option> // Display tag name from the tags_activitys array
                    ))
                  ) : (
                    <option disabled>No tags available</option>
                  )}
                </select>
              </div>
             </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out appearance-none bg-white"
                >
                  <option value="">--Select--</option>
                  <option value="WFO">Work From Office</option>
                  <option value="WFH">Work from Home</option>
                </select>
              </div>
              <div className="relative">
                <label htmlFor="project_type" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <ClipboardList className="w-4 h-4 mr-2 text-gray-400" />
                  Project Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="project_type"
                  name="project_type"
                  value={formData.project_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out appearance-none bg-white"
                >
                  <option value="">--Select--</option>
                  <option value="Hourly">Hourly</option>
                  <option value="Fixed">Fixed</option>
                  <option value="No Work">No Work</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative col-span-2">
                <label htmlFor="project_type_status" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Home className="w-4 h-4 mr-2 text-gray-400" />
                  Project Type Status <span className="text-red-500">*</span>
                </label>
                <select
                  id="project_type_status"
                  name="project_type_status"
                  value={formData.project_type_status}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out appearance-none bg-white"
                >
                  <option value="">--Select--</option>
                  <option value="Offline">Offline</option>
                  {formData.project_type === "Hourly" && <option value="Tracker">Tracker</option>}
                </select>

              </div>
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
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out resize-none"
                placeholder="Enter your notes here"
              ></textarea>
            </div>


            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <button
                type="button"
                onClick={handleSave}
                className="submit-btn"
              >
                <Save className="w-5 h-5 mr-2" />
                Save Timesheet
              </button>
            </div>
          </form>
        </div>
     <div className='weekly-summary-table flex flex-col justify-between w-full max-w-1/2'>
<div className="mt-10 overflow-hidden bg-white rounded-t-lg">
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
              <th className="px-4 py-3 text-left text-[11px] font-semibold border">Avlb/OT</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold border">Bill Hrs</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold border">Non Hrs</th>
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
    const billable = info.totalBillableHours || "00:00";
    const nonBillable = info.totalNonBillableHours || "00:00";


    const today = new Date();
    const rowDate = new Date(date);
    const isFuture = rowDate > today;

    let remaining = "00:00";

    if (!isFuture) {
      const [tH, tM] = total.split(":").map(Number);
      const totalMinutes = tH * 60 + tM;
      const targetMinutes = 8 * 60 + 30; // 8h 30m
      const remainingMinutes = Math.max(targetMinutes - totalMinutes, 0);

      const remH = Math.floor(remainingMinutes / 60)
        .toString()
        .padStart(2, "0");
      const remM = (remainingMinutes % 60).toString().padStart(2, "0");
      remaining = `${remH}:${remM}`;
    }

    return (
      <tr
        key={index}
        className="text-gray-700 text-[11px] even:bg-gray-50 hover:bg-gray-100 transition whitespace-nowrap sm:whitespace-normal"
      >
        <td className="px-4 py-3 border">{formattedDate}</td>
        <td className="px-4 py-3 border">{info.dayname}</td>

        {/* Total Hours */}
        <td className="px-4 py-3 border text-red-500 font-semibold">
          {total}
        </td>

        {/* Remaining Hours */}
        <td className="px-4 py-3 border text-blue-600 font-semibold">
          {remaining}
        </td>

        {/* Billable Hours */}
        <td className="px-4 py-3 border text-green-600 font-semibold">
          {billable}
        </td>

        {/* Non-Billable Hours */}
        <td className="px-4 py-3 border text-yellow-600 font-semibold">
          {nonBillable}
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
  <h2 className="text-[16px] text-red-500 font-bold mb-4">Note:-</h2>
  <ul className="list-disc pl-6 text-[14px]">
    <li className="mb-4">
      <b>If total working hours are less than 8:30 hours</b>, the remaining hours will be counted as <b>short leave</b>.
    </li>
    <li className="mb-4">
      <b>If you have taken Work From Home</b>, you must complete <b>10:00 hours</b>. Any hours less than 10:00 will be considered as <b>short leave</b>.
    </li>
    <li className="mb-2">
      <b>If you attend any event or function during working hours</b>, mention the <b>event/function hours under “No Work” with a proper reason</b>.
    </li>
    <li className="mb-2">
      <b>If the project you are working on is not listed in the Projects section</b>, please inform your Team Lead to assign the project to you.
    </li>
  </ul>
</div>
     </div>


        </div>

        {/* Timesheet Table */}
        <div className="min-w-screen ml-0 lg:mb-32 rounded">
          <div className="overflow-x-auto">
            {/* Display Saved Entries */}
        {savedEntries.length > 0 && userProjects?.data && (

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
                        <th className="px-1 py-3 text-center text-[8px] font-medium tracking-wider">Action</th>
                        <th className="px-1 py-3 text-center text-[8px] font-medium tracking-wider">Work Type</th>
                        <th className="px-1 py-3 text-center text-[8px] font-medium tracking-wider">Narration</th>
                        <th className="px-1 py-3 text-center text-[8px] font-medium tracking-wider">Project Type</th>
                        <th className="px-1 py-3 text-center text-[8px] font-medium tracking-wider">Project Type Status</th>
                        <th className="px-1 py-3 text-center text-[8px] font-medium tracking-wider">Modify</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {savedEntries.map((entry, index) => (
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

                          <td className="px-1 py-3 whitespace-nowrap text-center text-[10px] text-gray-900">
                            {
                              <span className={`px-2 py-1 rounded-full text-[10px] font-medium ${entry.billingStatus === 'Billable' ? 'bg-green-100 text-green-800' :
                                entry.billingStatus === 'Non Billable' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                {entry.billingStatus}
                              </span>
                            }
                          </td>
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
                          <td className="px-1 py-3 whitespace-nowrap text-center text-[10px] text-gray-900">
                              {
                                entry.project_type
                              }
                            </td>

                            <td className="px-1 py-3 whitespace-nowrap text-center text-[10px] text-gray-900">
                              {
                                entry.project_type_status
                              }
                            </td>

                          <td className="px-1 py-3 whitespace-nowrap text-center text-[10px] text-gray-900">
                            <div className="flex space-x-2 justify-center">
                              {
                                <button
                                  onClick={() => handleEditClick(index)}
                                  className="edit-btn text-[14px] py-1"
                                ><Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </button>
                              }
                              <button
                                onClick={() => handleDelete(index)}
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
                    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
                      <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-6 relative"> 
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



  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-auto">
      <h2 className="text-lg font-semibold mb-4">Edit Entry</h2>

      <div className="grid grid-cols-2 gap-4 text-sm">
        {/* Project */}
      <div className="relative">
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
<div className="relative">
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
                  value={savedEntries[editIndex].date}
                  onChange={(e) => handleEdit(editIndex, "date", e.target.value)} // Corrected line({ ...formData, date: e.target.value })} // Corrected line
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-700 focus:outline-none"
                  // readOnly
                />
        </div>

  
        <div>
          <label className="block mb-1">Hours Spent</label>
<input
  type="text"
  value={savedEntries[editIndex].hoursSpent || ""}
  onChange={(e) => {
    let value = e.target.value;

    value = value.replace(/[^0-9:]/g, "");

    // Prevent more than one colon
    const parts = value.split(":");
    if (parts.length > 2) value = parts[0] + ":" + parts[1];

    // Limit to 5 chars total (HH:MM)
    if (value.length > 5) value = value.slice(0, 5);

    // Just update state — no formatting yet
    handleEdit(editIndex, "hoursSpent", value);
  }}
  onBlur={(e) => {
    let value = e.target.value.trim();

    // Format only when focus is lost
    if (/^\d{1}$/.test(value)) {
      // "1" → "01:00"
      value = `0${value}:00`;
    } else if (/^\d{2}$/.test(value)) {
      // "10" → "10:00"
      value = `${value}:00`;
    } else if (/^\d{1,2}:$/.test(value)) {
      // "8:" → "08:30"
      const [h] = value.split(":");
      value = `${h.padStart(2, "0")}:30`;
    } else if (/^\d{1,2}:\d$/.test(value)) {
      // "9:5" → "09:50"
      const [h, m] = value.split(":");
      value = `${h.padStart(2, "0")}:${m.padEnd(2, "0")}`;
    }

    // Validate max 10:30
    const [hoursStr, minutesStr] = value.split(":");
    const hours = parseInt(hoursStr || "0", 10);
    const minutes = parseInt(minutesStr || "0", 10);

    if (hours > 10 || (hours === 10 && minutes > 30)) {
      showAlert({
        variant: "warning",
        title: "Warning",
        message: "Time cannot be more than 10:30.",
      });
      return; // stop update if invalid
    }

    handleEdit(editIndex, "hoursSpent", value);
  }}
  className="w-full border rounded px-2 py-1"
  placeholder="HH:MM"
  maxLength={5}
  inputMode="numeric"
/>








        </div>


        {/* Billing Status */}
      <div>
  <label className="block mb-1">Billing Status</label>
  <select
    value={savedEntries[editIndex]?.billingStatus || ""}
    onChange={(e) => handleEdit(editIndex, "billingStatus", e.target.value)}
    className="w-full px-3 py-2 border rounded-md"
  >
    <option value="">Select Billing Status</option>
    {tags.length > 0 ? (
      tags.map((tag, i) => (
        <option key={i} value={tag.id}>
          {tag.name}
        </option>
      ))
    ) : (
      <option disabled>No tags available</option>
    )}
  </select>
</div>


        {/* Status */}
        <div>
          <label className="block mb-1">Status</label>
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

        {/* Project Type */}
        <div>
          <label className="block mb-1">Project Type</label>
          <select
            value={savedEntries[editIndex].project_type}
            onChange={e => handleEdit(editIndex, "project_type", e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">--Select--</option>
            <option value="Fixed">Fixed</option>
            <option value="Hourly">Hourly</option>
            <option value="No Work">No Work</option>
          </select>
        </div>

        {/* Project Type Status */}
        <div>
          <label className="block mb-1">Project Type Status</label>
          <select
            value={savedEntries[editIndex].project_type_status}
            onChange={e => handleEdit(editIndex, "project_type_status", e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">--Select--</option>
            {savedEntries[editIndex].project_type === "Fixed" ? (
              <option value="Offline">Offline</option>
            ) : (
              <>
                <option value="Tracker">Tracker</option>
                <option value="Offline">Offline</option>
                <option value="No Work">No Work</option>
              </>
            )}
          </select>
        </div>

        {/* Notes */}
        <div className="col-span-2">
          <label className="block mb-1">Notes</label>
          <input
            type="text"
            value={savedEntries[editIndex].notes}
            onChange={e => handleEdit(editIndex, "notes", e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        <button
          onClick={handleSaveClick}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <Save className="h-4 w-4 mr-1 inline" />
          Save
        </button>
        <button
          onClick={() => handleEditClick(null)}
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
            {savedEntries.length > 0 && (
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
            {showPopup && (
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
)}

          </div>
        </div>
      </div>
    </>
  );
};

export default Addsheet;