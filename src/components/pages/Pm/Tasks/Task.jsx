import { useState, useEffect,useRef } from "react";
import { useParams } from "react-router-dom";
import { Overview } from "../../../components/RichTextEditor";
import { useTask } from "../../../context/TaskContext"; 
import { Edit, Save, Trash2, BriefcaseBusiness, Loader2, Trash } from "lucide-react";
import { SectionHeader } from '../../../components/SectionHeader';
import { SaveButton, CancelButton,todo } from "../../../AllButtons/AllButtons";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Include Quill stylesc
import DOMPurify from 'dompurify';
import { Edit2, X,Eye } from "lucide-react";
import { ChevronDown, ChevronUp } from "lucide-react";
// import { useProject } from "../../../context/ProjectContext";
import { useProjectMaster } from "../../../context/ProjectMasterContext";
import { Plus } from "lucide-react";
import { useBDProjectsAssigned } from "../../../context/BDProjectsassigned";
import { usePMContext } from "../../../context/PMContext";
import { useTLContext } from "../../../context/TLContext";
import { API_URL } from "../../../utils/ApiConfig";
import React from "react";
import { usePermissions } from "../../../context/PermissionContext";
export default function TaskList( {show}) {
  const { permissions } = usePermissions();
  const { tasks, fetchTasks, addTask, approveTask, editTask, deleteTask,fetchTaskComments,taskComments,addTaskComment,setTaskComments ,getProjectActivitiesAndComments,attachments,setAttachments,loadingAttachments,setLoadingAttachments,refreshAttachments,deleteAttachment,activities,setActivities,refreshActivity} = useTask();
  const {fetchProjectsbyId,editProject ,projectdetails,updateProjectDetail}=useProjectMaster();
    const { projects, projectManagers, isLoading, assignProject, message,fetchAssigned ,removeProjectManagers} = useBDProjectsAssigned();
    const { assignProjectToTl, isAssigning, assignedProjects, teamleaders, isLoading: isProjectsLoading, loading, fetchEmployeeProjects, employeeProjects, deleteTeamLeader } = usePMContext();
    const { assignProjectToEmployees,fetchEmployees, employees, deleteEmployee } = useTLContext();
  const [showAllComms, setShowAllComms] = useState("");
  const [openTask, setOpenTask] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [taskDetails, setTaskDetails] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [status, setStatus] = useState("To do");
  const [hours, setHours] = useState("");
  const [deadline, setDeadline] = useState("");
  const [start_date, setStartDate] = useState("");
  const [statusDropdown, setStatusDropdown] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTaskId, setEditTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editProjectName, setEditProjectName] = useState(tasks.data?.project_name || "");
  const [editDeadline, setEditDeadline] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editHours, setEditHours] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
const [previewItem, setPreviewItem] = useState(null);
const [copiedLinkId, setCopiedLinkId] = useState(null);
const [isViewAssigneesOpen, setIsViewAssigneesOpen] = useState(false);
const [isAddAssigneesOpen, setIsAddAssigneesOpen] = useState(false);
const [activeRoleTitle, setActiveRoleTitle] = useState(null);
const [activeRoleUsers, setActiveRoleUsers] = useState([]);
const [assigneesToAdd, setAssigneesToAdd] = useState([]);

  const { project_id } = useParams();
  // console.log("project_id izz", project_id);
  const [commentText, setCommentText] = useState("");
const [selectedTask, setSelectedTask] = useState(null);
const [activeTab, setActiveTab] = useState("details"); 
const [chat, setChat] = useState("activity"); 
const [linkInput, setLinkInput] = useState("");
const [links, setLinks] = useState([]); // [{ name, url }]
const [isExpanded, setIsExpanded] = useState(false);
const [isEditingDesc, setIsEditingDesc] = useState(false);
const [description, setDescription] = useState("");const [showDescPopup, setShowDescPopup] = useState(false);
// const [expandedMessages, setExpandedMessages] = useState({});
const fileInputRef = useRef(null);
const [selectedFile, setSelectedFile] = useState(null);
const [uploading, setUploading] = useState(false);


const [tempDescription, setTempDescription] = useState(description);
const lastMessageRef = useRef(null);
const [expandedMessages, setExpandedMessages] = useState({});
const messageRefs = useRef({});
const [overflowingMessages, setOverflowingMessages] = useState({});
const [showUsersModal, setShowUsersModal] = useState(false);
const [showAddModal, setShowAddModal] = useState(false);
const [selectedRole, setSelectedRole] = useState("");
const [selectedUsers, setSelectedUsers] = useState([]);

const [showDescriptionPopup, setShowDescriptionPopup] = useState(false);
// const [taskComments, setTaskComments] = useState([]);
const [activeRole, setActiveRole] = useState(null);
const STORAGE_BASE_URL = `${API_URL}/storage/public/`;

const getAttachmentUrl = (attachment) => {
  if (!attachment) return "";

  // already a full link
  if (attachment.startsWith("http")) return attachment;

  // file path → make full URL
  return `${STORAGE_BASE_URL}${attachment}`;
};
// const [activities, setActivities] = useState([]);
const [loadingActivity, setLoadingActivity] = useState(false);
const [showActivityDrawer, setShowActivityDrawer] = useState(false);

  const employeePermission = permissions?.permissions?.[0]?.projects;
  const canAddEmployee = employeePermission === "2";

const MessageCard = ({
  item,
  index,
  isLast,
  showDateHeader,
  dateLabel,
}) => {
  const expanded = expandedMessages[index];
  const isOverflowing = overflowingMessages[index];

  return (
    <>

      {showDateHeader && (
        <div className="flex justify-center ">
          <span className="
            px-4 py-1
            text-xs font-medium
            text-gray-600
            bg-gray-100
            rounded-full
            shadow-sm
          ">
            {dateLabel}
          </span>
        </div>
      )}

      <div
        ref={isLast ? lastMessageRef : null}
        className={`
          rounded-2xl p-4
          ${
            item.type === "Activity"
              ? "bg-indigo-50 border border-indigo-100"
              : "bg-sky-50 border border-sky-100"
          }
          shadow-[0_6px_16px_rgba(0,0,0,0.08)]
        `}
      >
        <p className="text-sm font-medium text-gray-900">
          {item.user_name || "System"}
        </p>

        <div
          ref={(el) => (messageRefs.current[index] = el)}
          className={`
            text-sm text-gray-700 mt-1
            break-words whitespace-pre-wrap
            ${expanded ? "" : "line-clamp-3"}
          `}
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(item.description || ""),
          }}
        />

        {isOverflowing && (
          <button
            onClick={() =>
              setExpandedMessages((prev) => ({
                ...prev,
                [index]: !prev[index],
              }))
            }
            className="text-xs text-sky-600 mt-1 font-medium hover:underline"
          >
            {expanded ? "Read less" : "Read more"}
          </button>
        )}

        {/* ⏰ TIME ONLY */}
        <p className="text-xs text-gray-400 mt-1">
          {new Date(item.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </>
  );
};



const isLink = (attachment) => attachment?.startsWith("http");

const openModal = (role) => setActiveRole(role);
const closeModal = () => setActiveRole(null);

const clearTaskComments = () => {
  setTaskComments([]);
};
  // console.log("tasks", tasks);

  const updateStatus = async (taskId, newStatus) => {
    console.log("this is ud", taskId);
    console.log("this is new status", newStatus);
    try {
      await approveTask(taskId, newStatus);
      console.log(`✅ Task ${taskId} updated to ${newStatus}`);
      setStatusDropdown(null);
    } catch (error) {
      console.error("Failed to update task status:", error);
    }
  };
function convertTimeToDecimal(timeStr) {
  if (!timeStr) return 0;
  if (!timeStr.includes(":")) return Number(timeStr) || 0;
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours + (minutes / 60);
}
  
  const handleAddTask = async () => {
const newTask = {
  title: taskTitle,
  description: taskDetails,
  status,
  project_id: Number(project_id),
  hours: convertTimeToDecimal(hours),  // Convert string HH:MM to decimal hours for backend
  deadline,
  start_date,
};

    try {
      await addTask(newTask);
      fetchTasks(project_id);
      setShowForm(false);
      setTaskTitle("");
      setTaskDetails("");
      setHours("");
      setStartDate("");
      setDeadline("");
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };


  const withRefresh = (fn, project_id) => {
  return async (...args) => {
    const res = await fn(...args);
    await fetchProjectsbyId(project_id);
    return res;
  };
};

const ASSIGNMENT_CONFIG = {
  "Project Managers": {
    role_name: "Project Manager",
    list: projectManagers,
    assign: withRefresh(assignProject, project_id),
    remove: withRefresh(removeProjectManagers, project_id),
  },

  "Team Leads": {
    role_name: "TL",
    list: teamleaders,
    assign: withRefresh(assignProjectToTl, project_id),
    remove: withRefresh(deleteTeamLeader, project_id),
  },

  "Employees": {
    role_name: "Team",
    list: employees,
    assign: withRefresh(assignProjectToEmployees, project_id),
    remove: withRefresh(deleteEmployee, project_id),
  },
};






const getShortText = (text, limit) => {
  const words = text.split(" ");
  if (words.length <= limit) return text;
  return words.slice(0, limit).join(" ");
};

const addLinkAttachment = async ({ project_id,url }) => {
  await addTaskComment({
    project_id,
    // task_id,
    type: "attachment",
    attachments: url, 
  });
};

  useEffect(() => {
    if (project_id) {
      fetchTasks(project_id);
    }
  }, [project_id]);

  const toggleTask = (taskId) => {
    if (editTaskId) return;
    setOpenTask(openTask === taskId ? null : taskId);
  };


const formatTime = (date) =>
  new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });


  const toggleStatusDropdown = (id) => {
    setStatusDropdown(statusDropdown === id ? null : id);
  };


  const handleDelete = async (taskId) => {
    console.log("Deleting task:", taskId);
    try {
      await deleteTask(taskId,project_id);
      // Optionally: show success toast or refresh task list
    } catch (error) {
      console.error("Failed to delete task:", error);
      // Optionally: show error toast
    }
  };
  const handleEditClick = (task) => {
  if (openTask !== task.id) {
    toggleTask(task.id); // Open if closed
  }
  startEditing(task); // Start editing regardless
};

useEffect(() => {
  console.log("tasks data updated:", tasks.data);
}, [tasks.data]);

  const startEditing = (task) => {
    setEditTaskId(task.id);
    setEditTitle(task.title);
    setEditDeadline(task.deadline);
    setEditStartDate(task.start_date);
setEditHours(formatHoursToHHMM(task.hours)); 
    setEditDescription(task.description);
    setEditStatus(task.status);
  };

  const saveEdit = async (taskId) => {

    // console.log("Saving task with editHours:", newStatus); 
    const originalTask = tasks.data.tasks.find(t => t.id === taskId);

    const statusChanged = originalTask && originalTask.status !== editStatus;

    if (statusChanged) {
        console.log("Status has changed, updating status...");
        await approveTask(taskId, editStatus);
    }

   const updatedTask = {
  title: editTitle,
  description: editDescription,
  deadline: editDeadline,
  start_date: editStartDate,
  hours: convertTimeToDecimal(editHours),
};

    const result = await editTask(taskId, updatedTask,project_id);
    if (result) {
      setEditTaskId(null); // Exit edit mode
    }

    setEditTaskId(null);
    setEditTitle("");
    setEditDeadline("");
    setEditStartDate("");
    setEditHours("");
    setEditDescription("");
    setEditStatus("");
    fetchTasks();
  };

  const cancelEdit = () => {
    setEditTaskId(null);
    setEditTitle("");
    setEditDeadline("");
    setEditStartDate("");
    setEditHours("");
    setEditDescription("");
  };
  function formatHoursToHHMM(value) {
  // Convert to float to support fractional hours (e.g., 1.5)
  const numeric = parseFloat(value);
  if (isNaN(numeric) || numeric < 0) return '';

  const totalMinutes = Math.floor(numeric * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;

  // Pad single digits with leading zeros
  const hh = h.toString().padStart(2, '0');
  const mm = m.toString().padStart(2, '0');

  return `${hh}:${mm}`;
}


useEffect(() => {
  setExpandedMessages({});
  setOverflowingMessages({});
  clearTaskComments?.();

  if (!selectedTask?.id) return;

  if (chat === "comments") {
    fetchTaskComments(selectedTask.id);
  }
}, [selectedTask?.id, chat]);



useEffect(() => {
  if (!project_id) return;

  const fetchData = async () => {
    setLoadingAttachments(true);

    const data = await getProjectActivitiesAndComments(
      project_id,
      "attachment"
    );

    setAttachments(data);
    setLoadingAttachments(false);

    console.log("attachments izz", data);
  };

  fetchData();
}, [project_id]);


useEffect(() => {
  if (!project_id) return;

  const fetchData = async () => {
    setLoadingAttachments(true);

    const data = await getProjectActivitiesAndComments(
      project_id,
      "activity"
    );

     setActivities(data);

    console.log("attachments izz", data);
  };

  fetchData();
}, [project_id]);










useEffect(() => {
  if (lastMessageRef.current) {
    lastMessageRef.current.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }
}, [taskComments, chat, selectedTask]);

const WORD_LIMIT = 25;
const truncateText = (text, limit) => {
  if (!text) return "";
  const words = text.trim().split(/\s+/);
  return words.length > limit
    ? words.slice(0, limit).join(" ")
    : text;
};

useEffect(() => {
  const newOverflow = {};

  taskComments.forEach((_, index) => {
    const el = messageRefs.current[index];
    if (el) {
      newOverflow[index] = el.scrollHeight > el.clientHeight;
    }
  });

  setOverflowingMessages(newOverflow);
}, [taskComments, chat]);



useEffect(() => {
fetchProjectsbyId(project_id);
}, [])

useEffect(() => {
  refreshAttachments(project_id);
}, [project_id]);

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
      });
    } catch {
      return "—";
    }
  };
const REMOVE_HANDLER_BY_ROLE = {
  "Project Managers": async (userId) =>
    removeProjectManagers(projectdetails.project.id, [userId]),

  "Team Leads": async (userId) =>
    deleteTeamLeader(projectdetails.project.id, userId),

  "Employees": async (userId) =>
    deleteEmployee(projectdetails.project.id, userId),
};


const handleSaveDescription = async () => {
  if (!projectdetails?.project?.id) return;

  const payload = {
    project_description: tempDescription,
  };

  const result = await updateProjectDetail(
    projectdetails.project.id,
    payload
  );
fetchProjectsbyId(projectdetails.project.id);
  if (result?.success) {
    
    setDescription(tempDescription);
    setIsEditingDesc(false);
  }
};


  return (
<div className="h-screen flex flex-col">
              <SectionHeader icon={BriefcaseBusiness} title="Project Details" subtitle="Project Details" />


<div className="flex flex-1 gap-2 relative min-h-0">
  {/* ================= LEFT SIDE ================= */}
{/* TASKS */}
{/* ================= LEFT SIDE ================= */}
<div className="flex-1 min-w-0 flex flex-col px-4 py-4 gap-6">
  {/* HEADER */}

{/* PROJECT META DETAILS */}
<div className="flex flex-wrap gap-2 bg-white/60 backdrop-blur-lg md:border md:border-gray-200 rounded-full p-1 w-fit ">
  <button
    onClick={() => setActiveTab("details")}
    className={`
      px-4 py-2 text-sm rounded-full transition
      ${
        activeTab === "details"
          ? "bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow"
          : "text-gray-700 hover:bg-white"
      }
    `}
  >
    Project Details
  </button>
    <button
    onClick={() => setActiveTab("Description")}
    className={`
      px-4 py-2 text-sm rounded-full transition
      ${
        activeTab === "Description"
          ? "bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow"
          : "text-gray-700 hover:bg-white"
      }
    `}
  >
    Description
  </button>
  <button
    onClick={() => setActiveTab("attachments")}
    className={`
      px-4 py-2 text-sm rounded-full transition
      ${
        activeTab === "attachments"
          ? "bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow"
          : "text-gray-700 hover:bg-white"
      }
    `}
  >
    Attachments
  </button>
    <button
    onClick={() => setActiveTab("Tasks")}
    className={`
      px-4 py-2 text-sm rounded-full transition
      ${
        activeTab === "Tasks"
          ? "bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow"
          : "text-gray-700 hover:bg-white"
      }
    `}
  >
      Tasks
  </button>
  <button
  onClick={() => setShowActivityDrawer(true)}
  className={`
      md:hidden px-4 py-2 text-sm rounded-full transition
      ${
        activeTab === "Activity/Comments"
          ? "bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow"
          : "text-gray-700 hover:bg-white"
      }
    `}
>
  Activity/Comments
</button>
  
</div>
<div
  className={`
    flex flex-col flex-1 min-h-0
    rounded-2xl
    bg-white/70 backdrop-blur-xl
    shadow-sm
    transition overflow-y-auto
    ${activeTab === "attachments" ? "border-none" : "border border-gray-200"}
  `}
>




{activeTab === "details" && projectdetails?.project && (
  <div className="divide-y">
{[
  { label: "Client", value: projectdetails.relation?.client },

  { label: "Project Name", value: projectdetails.project?.project_name },

  {
    label: "Project Tracking",
    value:
      Number(projectdetails.project?.project_tracking) === 1
        ? "Yes"
        : Number(projectdetails.project?.project_tracking) === 0
        ? "No"
        : "—",
  },

  { label: "Total Hours", value: projectdetails.project?.project_hours },
  { label: "Used Hours", value: projectdetails.project?.project_used_hours },

  // ✅ FIXED (these are inside relation)
  // { label: "Project Source", value: projectdetails.relation?.source },
  // { label: "Account", value: projectdetails.relation?.account },

  {
    label: "Created At",
    value: formatDate(projectdetails.project?.created_at),
  },
].map((item, index) => (
  <div key={index} className="grid grid-cols-2 items-center px-6 py-4">
    <div className="text-sm font-medium text-gray-800">
      {item.label}
    </div>
    <div className="text-sm text-gray-600">
      {item.value ?? "—"}
    </div>
  </div>
))}


<div className="px-6 py-4 border-t">
  <div className="flex items-start gap-6">
    <span className="text-sm font-medium text-gray-800 shrink-0">
      Project Source
    </span>

    {projectdetails?.relation?.source ? (
      <div
        className="
          flex items-center gap-2
          px-3 py-1.5
          text-xs
          bg-gray-100
          border
          rounded-full
          text-gray-700
        "
      >
        <span className="capitalize font-medium">
          {projectdetails.relation.source}
        </span>
        <span className="text-gray-400">•</span>
        <span className="truncate max-w-[220px]">
          {projectdetails.relation.account || "—"}
        </span>
      </div>
    ) : (
      <span className="text-sm text-gray-400">—</span>
    )}
  </div>
</div>

{/* COMMUNICATIONS */}
<div className="px-6 py-4 border-t">
  <div className="flex items-start gap-6">
    <span className="text-sm font-medium text-gray-800 shrink-0">
      Communications
    </span>

    {projectdetails?.relation?.communications?.length > 0 ? (
      <div className="flex flex-wrap gap-2">
        {(showAllComms
          ? projectdetails.relation.communications
          : projectdetails.relation.communications.slice(0, 2)
        ).map((comm) => (
          <div
            key={comm.id}
            className="
              flex items-center gap-2
              px-3 py-1.5
              text-xs
              bg-gray-100
              border
              rounded-full
              text-gray-700
            "
          >
            <span className="capitalize font-medium">
              {comm.medium}
            </span>
            <span className="text-gray-400">•</span>
            <span className="max-w-[220px] truncate">
              {comm.medium_details}
            </span>
          </div>
        ))}

        {projectdetails.relation.communications.length > 2 && (
          <button
            onClick={() => setShowAllComms(!showAllComms)}
            className="
              px-3 py-1.5
              text-xs
              rounded-full
              border
              bg-white
              text-indigo-600
              hover:bg-indigo-50
              transition
            "
          >
            {showAllComms
              ? "Show less"
              : `+${projectdetails.relation.communications.length - 2} more`}
          </button>
        )}
      </div>
    ) : (
      <span className="text-sm text-gray-400">—</span>
    )}
  </div>
  
</div>






    {/* TEAM SECTION */}
    {(() => {
      const assignees = projectdetails?.relation?.assignees || [];

      const roles = [
        {
          title: "Project Managers",
          key: "Project Manager",
          users: assignees.filter(u => u.role_name === "Project Manager"),
        },
        {
          title: "Team Leads",
          key: "TL",
          users: assignees.filter(u => u.role_name === "TL"),
        },
        {
          title: "Employees",
          key: "Team",
          users: assignees.filter(u => u.role_name === "Team"),
        },
      ];

      return (
        <div className="px-6 py-6 bg-gradient-to-br from-gray-50 to-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {roles.map((role, idx) => (
              <div
                key={idx}
                className="rounded-2xl border bg-white shadow-sm hover:shadow-md transition"
              >
                {/* HEADER */}
                <div className="flex justify-between items-center px-4 py-3 border-b">
                  <span className="text-sm font-semibold text-gray-800">
                    {role.title}
                  </span>
{canAddEmployee&&(
                <button
  onClick={(e) => {
    e.stopPropagation();
    setActiveRoleTitle(role.title);
    setIsAddAssigneesOpen(true);
  }}
  className="p-1.5 rounded-full hover:bg-indigo-100 text-indigo-600"
>
  +
</button>
)}

                </div>

                {/* BODY */}
                <div
                  onClick={() => {
                    setSelectedUsers(role.users);
                    setSelectedRole(role.title);
                    setShowUsersModal(true);
                  }}
                  className="p-4 cursor-pointer hover:bg-gray-50 transition"
                >
                  {role.users.length ? (
                    <div className="flex items-center">
                      {role.users.slice(0, 3).map((u, i) => (
                        <img
                          key={i}
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                            u.name
                          )}&background=6366f1&color=fff`}
                          title={u.name}
                          className="w-10 h-10 rounded-full border-2 border-white -ml-2 first:ml-0"
                        />
                      ))}

                      {role.users.length > 3 && (
                        <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-700 text-xs flex items-center justify-center -ml-2 border-2 border-white">
                          +{role.users.length - 3}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No users assigned</p>
                  )}
                </div>
              </div>
            ))}

          </div>
        </div>
      );
    })()}
  </div>
)}





{activeTab === "Description" && (
  <div className="flex-1 min-h-0 flex flex-col px-6 py-5 mb-5">
   <div className="flex items-center justify-between mb-5">
  {/* TITLE */}
  <h2 className="text-sm font-semibold text-gray-800 tracking-wide">
    Description
  </h2>

{canAddEmployee&&(
  <div className="flex items-center gap-2">
    {!isEditingDesc ? (
      <button
        onClick={() => {
          setTempDescription(
            projectdetails.project.project_description || ""
          );
          setIsEditingDesc(true);
        }}
        className="
          px-4 py-1.5
          text-xs font-medium
          rounded-full
          bg-sky-100 text-sky-700
          hover:bg-sky-200
          transition
        "
      >
        Edit
      </button>
    ) : (
      <>
      <button
  onClick={handleSaveDescription}
  className="
    px-4 py-1.5
    text-xs font-medium
    rounded-full
    bg-emerald-500 text-white
    hover:bg-emerald-600
    shadow-sm
    transition
  "
>
  Save
</button>


        <button
          onClick={() => {
            setIsEditingDesc(false);
          }}
          className="
            px-4 py-1.5
            text-xs font-medium
            rounded-full
            bg-gray-100 text-gray-600
            hover:bg-gray-200
            transition
          "
        >
          Cancel
        </button>
      </>
    )}
  </div>
)}
</div>


    {/* SCROLLABLE DESCRIPTION */}
    <div className="flex-1 min-h-0 overflow-y-auto pr-2">
      <div className="prose prose-sm max-w-none text-gray-700">


          {!isEditingDesc ? (
          <div
            className="prose prose-sm max-w-none text-gray-700"
            dangerouslySetInnerHTML={{
              __html:
                projectdetails.project.project_description ||
                "<span class='italic text-gray-400'>No description available</span>",
            }}
          />
        ) : (
          <div className="flex flex-col h-full min-h-[250px]">
            <ReactQuill
              value={tempDescription}
              onChange={setTempDescription}
              placeholder="Project Description"
              className="flex-1"
              modules={{
                toolbar: [
                  [{ header: [1, 2, false] }],
                  ["bold", "italic", "underline"],
                  [{ list: "ordered" }, { list: "bullet" }],
                  ["link", "code-block"],
                  ["clean"],
                ],
              }}
              formats={[
                "header",
                "bold",
                "italic",
                "underline",
                "list",
                "bullet",
                "link",
                "code-block",
              ]}
            />
          </div>
        )}
      </div>
    </div>
  </div>
)}












{activeTab === "attachments" && (
  <div className="flex-1 flex flex-col px-4 py-4 gap-6 overflow-hidden">

    {/* ADD ATTACHMENT */}
    {canAddEmployee && (
    <div className="bg-white rounded-2xl border shadow-sm p-5 space-y-4">
      <h3 className="text-sm font-semibold text-gray-800">
        Add attachments
      </h3>

      <div className="flex flex-col md:flex-row gap-3">

        {/* FILE UPLOAD */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="
            flex items-center justify-center gap-2
            px-4 py-3 rounded-xl border border-dashed
            text-sm font-medium text-gray-700
            hover:border-sky-500 hover:text-sky-600
            transition
          "
        >
          Upload File
        </button>

        {/* LINK INPUT */}
        <input
          type="url"
          placeholder="Paste link (https://...)"
          value={linkInput}
          onChange={(e) => setLinkInput(e.target.value)}
          className="
            flex-1 px-4 py-3 rounded-xl border
            text-sm outline-none
            focus:ring-2 focus:ring-sky-500
          "
        />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setSelectedFile(file);
        }}
      />

      {/* SELECTED FILE */}
      {selectedFile && (
        <div className="flex items-center justify-between bg-gray-50 border rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 text-sm truncate">
            <span className="truncate">{selectedFile.name}</span>
          </div>

          <button
            disabled={uploading}
            onClick={async () => {
              if (!project_id) return;
              setUploading(true);

              await addTaskComment({
                project_id: Number(project_id),
                type: "attachment",
                attachments: selectedFile,
              });

              setSelectedFile(null);
              fileInputRef.current.value = "";
              setUploading(false);
            }}
            className="text-sm font-medium text-sky-600 hover:underline disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      )}

      {/* ADD LINK */}
      {linkInput && (
        <div className="flex justify-end">
          <button
            disabled={uploading}
            onClick={async () => {
              if (!project_id) return;
              setUploading(true);

              await addTaskComment({
                project_id: Number(project_id),
                type: "attachment",
                attachments: linkInput,
              });

              setLinkInput("");
              setUploading(false);
            }}
            className="
              px-5 py-2 rounded-xl
              bg-sky-600 text-white text-sm
              hover:bg-sky-700
              disabled:opacity-50
            "
          >
            Add Link
          </button>
        </div>
      )}
    </div>
    )}

    {/* ATTACHMENTS DISPLAY */}
    <div className="flex-1 overflow-y-auto space-y-6 pr-1">

      {/* FILES */}
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">
          Files
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
{attachments
  .filter((i) => i.attachments && !isLink(i.attachments))
  .map((item) => {
    const fileUrl = getAttachmentUrl(item.attachments);
    const fileName = item.attachments.split("/").pop();

    return (
      <div
        key={item.id}
        className="bg-white border rounded-xl p-4 hover:shadow-md transition flex flex-col gap-4"
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium truncate">{fileName}</p>

          {/* DELETE */}
          {canAddEmployee&&(
          <button
            onClick={() => deleteAttachment(item.id, project_id)}
            className="text-red-500 text-xs hover:underline"
          >
            Delete
          </button>
          )}
        </div>
          
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPreviewItem(fileUrl)}
            className="flex-1 text-xs font-medium px-3 py-2 rounded-lg border hover:bg-gray-50"
          >
            Preview
          </button>

          <a
            href={fileUrl}
            download
            target="_blank"
            rel="noreferrer"
            className="flex-1 text-xs font-medium text-center px-3 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700"
          >
            Download
          </a>
        </div>
      </div>
    );
  })}



        </div>
      </div>

      {/* LINKS */}
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">
          Links
        </h4>

        <div className="space-y-2">
{attachments
  .filter((i) => isLink(i.attachments))
  .map((item) => (
    <div
      key={item.id}
      className="flex items-center justify-between gap-3 bg-white border rounded-xl px-4 py-3 hover:shadow-sm transition"
    >
      <div className="flex items-center gap-2 truncate text-sm min-w-0">
        🔗
        <span className="truncate">{item.attachments}</span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={async () => {
            await navigator.clipboard.writeText(item.attachments);
            setCopiedLinkId(item.id);
            setTimeout(() => setCopiedLinkId(null), 1500);
          }}
          className="px-3 py-1.5 rounded-lg text-xs border text-gray-600 hover:bg-gray-100"
        >
          {copiedLinkId === item.id ? "Copied!" : "Copy"}
        </button>

        <a
          href={item.attachments}
          target="_blank"
          rel="noreferrer"
          className="px-3 py-1.5 rounded-lg text-xs bg-sky-600 text-white hover:bg-sky-700"
        >
          Open
        </a>

        {/* DELETE */}
        {canAddEmployee && (
        <button
          onClick={() => deleteAttachment(item.id, project_id)}
          className="px-3 py-1.5 rounded-lg text-xs text-red-500 border hover:bg-red-50"
        >
          Delete
        </button>
        )}
      </div>
    </div>
  ))}



        </div>
      </div>

      {!attachments.length && !loadingAttachments && (
        <p className="text-sm text-gray-400 text-center">
          No attachments added yet
        </p>
      )}

      {loadingAttachments && (
        <p className="text-sm text-gray-400 text-center">
          Loading attachments...
        </p>
      )}
    </div>
  </div>
)}







{activeTab === "Tasks" && (
  <div className="flex-1 min-h-0 flex flex-col gap-4 px-4 py-4">

    {/* HEADER */}
    <div className="flex items-center justify-between">
      <h2 className="text-sm font-semibold text-gray-800">
        Project Tasks
      </h2>
{canAddEmployee&&(
      <button
        onClick={() => setShowForm(true)}
        className="
          px-4 py-2 rounded-full text-sm font-medium
          bg-gradient-to-r from-sky-600 to-indigo-600
          text-white shadow hover:shadow-lg
          transition
        "
      >
        + Add Task
      </button>
)}
    </div>

    {/* TASK LIST */}
    <div className="flex-1 overflow-y-auto space-y-2 pr-1">
      {tasks.data?.tasks?.length > 0 ? (
        tasks.data.tasks.map((task) => {
          const isActive = selectedTask?.id === task.id;

          const statusColor =
            task.status === "TO DO"
              ? "bg-sky-500"
              : task.status === "IN PROGRESS"
              ? "bg-blue-500"
              : "bg-indigo-500";

          return (
            <div
              key={task.id}
              onClick={() => {
                setChat("comments");
                setSelectedTask(task)}}
              className={`
                group relative cursor-pointer
                rounded-xl border
                transition-all
                ${
                  isActive
                    ? "bg-sky-50 border-sky-300 shadow-sm"
                    : "bg-white border-gray-200 hover:shadow-md"
                }
              `}
            >
              {/* LEFT STATUS BAR */}
              <span
                className={`absolute left-0 top-0 h-full w-1 rounded-l-xl ${statusColor}`}
              />

              <div className="flex items-center gap-4 px-4 py-3 pl-6">

              
            

                {/* MAIN CONTENT */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">
                    {task.title}
                  </h3>

                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span>Start: {task.start_date || "NA"}</span>
                    <span>•</span>
                    <span>{task.hours || 0} hrs</span>
                  </div>
                </div>

                {/* STATUS BADGE */}
                <span
                  className={`
                    text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap
                    ${
                      task.status === "TO DO"
                        ? "bg-sky-100 text-sky-700"
                        : task.status === "IN PROGRESS"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-indigo-100 text-indigo-700"
                    }
                  `}
                >
                  {task.status}
                </span>

           {canAddEmployee&&(
                <div
                  className="
                    flex gap-1 opacity-0
                    group-hover:opacity-100
                    transition
                  "
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => handleEditClick(task)}
                    className="p-2 rounded-lg hover:bg-sky-100 text-sky-600"
                  >
                    <Edit2 size={14} />
                  </button>

                  <button
                    onClick={() => handleDelete(task.id)}
                    className="p-2 rounded-lg hover:bg-red-100 text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
           )}
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-center text-sm text-gray-500 py-10">
          No tasks available
        </div>
      )}
    </div>
  </div>
)}








</div>

  {/* TASK LIST */}
{/* */}
</div>


  {/* ================= RIGHT SIDE ================= */}
<div
 className={`
    fixed md:static
    top-5 right-0
    h-full md:h-[95%]
    w-full sm:w-[80%] md:w-[30%]
    z-50 md:z-auto
    rounded-3xl overflow-hidden
    transform transition-transform duration-300 ease-in-out
    bg-white
    border border-gray-200
    shadow-[0_12px_32px_rgba(0,0,0,0.12)]

    ${
      showActivityDrawer
        ? "translate-x-0"
        : "translate-x-full md:translate-x-0"
    }
  `}
>


  {/* Strong blue ambient glow */}
  <div className="absolute inset-0 
  bg-gradient-to-r from-sky-600 to-indigo-600
  " />

  {/* Glass shell */}
  <div className="relative h-full flex flex-col
    bg-white/25 backdrop-blur-[28px]
    border border-white/40
  ">
    <button
  onClick={() => setShowActivityDrawer(false)}
  className="md:hidden p-2 rounded-full hover:bg-gray-200 bg-[#bebef5] absolute left-1 top-2 z-40"
>
  <X size={16} />
</button>

<div
  className="
    sticky top-0 z-30 px-4 py-3
    bg-white/35 backdrop-blur-[22px]
    border-b border-white/40
  "
>
  {!selectedTask ? (
    <p className="text-sm text-gray-600 text-center">
      Select a task to view activity
    </p>
  ) : (
    <div
      className="
        rounded-2xl px-3 py-2
        bg-gradient-to-br
          from-violet-50/70
          via-sky-50/60
          to-indigo-50/50
        backdrop-blur-[26px]
        border border-white/40
        transition-all
      "
    >
      {/* HEADER */}
      <div className="flex justify-between items-center gap-3"             onClick={() => setIsExpanded(!isExpanded)}
>
        <h3 className="font-semibold text-gray-900 text-sm leading-snug">
          {selectedTask.title}
        </h3>

        <div className="flex items-center gap-2">
          {/* EXPAND / COLLAPSE */}
          {/* <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-full hover:bg-gray-200 text-gray-700"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button> */}

          {/* VIEW DESCRIPTION */}
          <button
            onClick={() => setShowDescriptionPopup(true)}
            className="p-1.5 rounded-full hover:bg-sky-100 text-sky-600"
            title="View full description"
          >
            <Eye size={16} />
          </button>

          <span
                                              onClick={() => toggleStatusDropdown(selectedTask.id)}

          className="
            text-xs px-3 py-1 rounded-full
            bg-gradient-to-r from-sky-600 to-indigo-600
            text-white
          "
          
          >
            {selectedTask.status}
          </span>
        </div>
        {statusDropdown === selectedTask.id && (
                              <div className="absolute top-[50px] z-30 right-0 mt-2 w-36 bg-white border border-gray-300 rounded-lg shadow-lg">
                                <button
                                  onClick={() =>{ setEditStatus("To do");
                                  setStatusDropdown(null);
                                  
                                  }}
                                  className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                                >
                                  To-Do
                                </button>
                                <button
                                  onClick={() =>{ setEditStatus("In Progress")
                                  setStatusDropdown(null);
                                  }}
                                  className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                                >
                                  In Progress
                                </button>
                                <button
                                  onClick={() =>{ setEditStatus("Completed")
                                  setStatusDropdown(null);
                                  }}
                                  className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                                >
                                  Completed
                                </button>
                                <button
                                  onClick={() =>{ setEditStatus("Cancel")
                                  setStatusDropdown(null);
                                  }}
                                  className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                                >
                                  Cancel
                                </button>
                              </div>
                            )}
      </div>

      {/* EXPANDABLE CONTENT */}
      <div
        className={`
          overflow-hidden transition-all duration-300
          ${isExpanded ? "max-h-40 mt-3 opacity-100" : "max-h-0 opacity-0"}
        `}
      >
        <div className="text-xs text-gray-700 space-y-1">
          <p><strong>Hours:</strong> {selectedTask.hours}</p>
          <p><strong>Start:</strong> {selectedTask.start_date}</p>
          <p className="text-gray-500">
{selectedTask?.project_manager?.name || "No Project Manager"}
          </p>
        </div>
      </div>
    </div>
  )}
</div>



    {/* ================= ACTIVITY LIST ================= */}
<div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden">

      {/* TOGGLE HEADER */}
      <div className="
        sticky top-0 z-10
        flex items-center gap-2 p-3
        bg-white border-b border-gray-200
      ">
  {!selectedTask ? (      
    ""
  ):(
        <button
          onClick={() => setChat("comments")}
          className={`
            flex-1 text-sm font-medium py-2 rounded-xl transition
            ${
              chat === "comments"
                ? "bg-sky-600 text-white shadow"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }
          `}
        >
          Comments
        </button>
      )}

        <button
          onClick={() => setChat("activity")}
          className={`
            flex-1 text-sm font-medium py-2 rounded-xl transition
            ${
              chat === "activity"
                ? "bg-indigo-600 text-white shadow"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }
          `}
        >
          Activity
        </button>
      </div>

      {/* CONTENT */}
      <div
        className="
          flex-1 overflow-y-auto px-4 py-4 space-y-4
          bg-white
          shadow-[inset_0_1px_0_rgba(0,0,0,0.04)]
        "
      >
        {/* COMMENTS TAB */}
     {chat === "comments" && (
  <div className="flex-1 overflow-y-auto space-y-2 ">
    {!selectedTask && (
      <p className="text-sm text-gray-400 text-center">
        Select a task to view comments
      </p>
    )}

    {selectedTask && taskComments.length === 0 && (
      <p className="text-sm text-gray-400 text-center">
        No comments or narrations yet
      </p>
    )}

{taskComments.map((item, index) => {
  const isLast = index === taskComments.length - 1;
  const expanded = expandedMessages[index];
  const isOverflowing = overflowingMessages[index];

  const currentDate = formatDate(item.created_at);
  const prevDate =
    index > 0 ? formatDate(taskComments[index - 1].created_at) : null;

  const showDateHeader = currentDate !== prevDate;

  return (
    <React.Fragment key={index}>
      {/* 📅 DATE HEADER */}
      {showDateHeader && (
        <div className="flex justify-center ">
          <span className="
            px-4 py-1 text-xs font-medium
            text-gray-600
            bg-gray-100 rounded-full
            shadow-sm
          ">
            {currentDate}
          </span>
        </div>
      )}

      {/* 💬 MESSAGE */}
      <div
        ref={isLast ? lastMessageRef : null}
        className={`
          rounded-2xl p-3
          ${
            item.type === "Activity"
              ? "bg-sky-50 border border-sky-100"
              : "bg-blue-50 border border-blue-100"
          }
          shadow-[0_6px_16px_rgba(0,0,0,0.12)]
        `}
      >
        <p className="text-sm font-medium text-gray-900">
          {item.user || "User"}
        </p>

        <div
          ref={(el) => (messageRefs.current[index] = el)}
          className={`
            text-sm text-gray-700 mt-1
            break-words whitespace-pre-wrap
            transition-all
            ${expanded ? "" : "line-clamp-3"}
          `}
        dangerouslySetInnerHTML={{
  __html: DOMPurify.sanitize(item.description || item.message || ""),
}}

        />


        {isOverflowing && (
          <button
            type="button"
            onClick={() =>
              setExpandedMessages((prev) => ({
                ...prev,
                [index]: !prev[index],
              }))
            }
            className="text-xs text-sky-600 mt-1 font-medium hover:underline"
          >
            {expanded ? "Read less" : "Read more"}
          </button>
        )}

        {/* ⏰ TIME ONLY */}
        <p className="text-xs text-gray-400 mt-1">
          {formatTime(item.created_at)}
        </p>
      </div>
    </React.Fragment>
  );
})}







  </div>
)}


        {/* ACTIVITY TAB */}
{chat === "activity" && (
  <div className="space-y-4 pr-2">
    {loadingActivity && (
      <p className="text-sm text-gray-400 text-center">
        Loading activity...
      </p>
    )}

    {!loadingActivity && activities.length === 0 && (
      <p className="text-sm text-gray-400 text-center">
        No activity yet
      </p>
    )}

    {activities.map((item, index) => {
      const currentDate = formatDate(item.created_at);
      const prevDate =
        index > 0
          ? formatDate(activities[index - 1].created_at)
          : null;

      const showDateHeader = currentDate !== prevDate;

      return (
        <React.Fragment key={item.id || index}>
          {/* 📅 DATE HEADER */}
          {showDateHeader && (
            <div className="flex justify-center ">
              <span className="
                px-4 py-1 text-xs font-medium
                text-gray-600
                bg-gray-100 rounded-full
                shadow-sm
              ">
                {currentDate}
              </span>
            </div>
          )}

          {/* 💬 ACTIVITY MESSAGE */}
          <MessageCard
            item={{ ...item, type: "Activity" }}
            index={index}
            isLast={index === activities.length - 1}
          />
        </React.Fragment>
      );
    })}
  </div>
)}

      </div>
    </div>



    {/* ================= INPUT ================= */}
    {selectedTask && chat === "comments" && canAddEmployee && (
      <div className="
        px-3 py-3
        bg-white/35 backdrop-blur-[24px]
        border-t border-white/40
      ">
        <div className="
          flex
          bg-white/55 backdrop-blur-[18px]
          border border-white/50
          rounded-2xl px-3 py-2
          shadow-inner w-full
        ">
         <input
  type="text"
  placeholder="Write a comment..."
  value={commentText}
  onChange={(e) => setCommentText(e.target.value)}
  className="
    flex-1 bg-transparent text-sm
    outline-none placeholder-gray-600
  "
/>

     <button
  onClick={async () => {
    if (!commentText.trim() || !selectedTask) return;

    await addTaskComment({
      project_id: project_id,
      task_id: selectedTask.id,
      type: "comment",
      description: commentText,
      // project_id:project_id
    });
refreshActivity(project_id);
    setCommentText(""); 
  }}
  className="
    px-4 py-2 text-sm font-semibold rounded-xl
    bg-gradient-to-r from-sky-600 to-indigo-600
    text-white shadow-xl
    hover:scale-[1.06] active:scale-[0.96]
    transition
  "
>
  Send
</button>

        </div>
      </div>
    )}

  </div>
</div>






</div>
{showForm && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
    <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-2xl">
      <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">Add New Task</h2>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Task Name"
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />



<input
  type="text"
  placeholder="HH:MM"
  value={hours}
  onChange={(e) => {
    let val = e.target.value;

    // Allow only digits and colon
    val = val.replace(/[^0-9:]/g, '');

    // If user typed colon, split on colon, else treat entire as hours
    if (val.includes(':')) {
      const [hhRaw, mmRaw] = val.split(':');

      // Hours can be unlimited digits
      const hh = hhRaw;

      // Take only first 2 chars of minutes
      let mm = mmRaw ? mmRaw.slice(0, 2) : '';

      // If minutes > 30, reject input by not updating state
      if (mm && Number(mm) > 30) {
        return;
      }

      // Set final value with colon only once
      setHours(`${hh}:${mm}`);
    } else {
      // No colon yet, so just allow hours digits
      setHours(val);
    }
  }}
  inputMode="numeric"
  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
/>


        <input
          type="date"
          value={start_date}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Fix: Wrap ReactQuill properly */}
        <div className="w-full border border-gray-300 rounded-md overflow-hidden">
          <ReactQuill
            value={taskDetails}
            onChange={setTaskDetails}
            placeholder="Task Details"
            className="mb-2"
            style={{ height: '200px' }}
            modules={{
              toolbar: [
                [{ header: [1, 2, false] }],
                ['bold', 'italic', 'underline'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['link', 'code-block'],
                ['clean']
              ]
            }}
            formats={[
              'header',
              'bold', 'italic', 'underline',
              'list', 'bullet',
              'link', 'code-block'
            ]}
          />
        </div>

        <Overview />
      </div>

      {/* Make sure this is outside the text editor */}
      <div className="flex justify-center mt-6 space-x-4">
        <CancelButton onClick={() => setShowForm(false)} />
        <SaveButton onClick={handleAddTask} />
      </div>
    </div>
  </div>
)}

{editTaskId && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
    <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-2xl">
      
      {/* HEADER */}
      <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">
        Edit Task
      </h2>

      <div className="space-y-4">

        {/* TASK TITLE */}
        <input
          type="text"
          placeholder="Task Name"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* HOURS (HH:MM) */}
        <input
          type="text"
          placeholder="HH:MM"
          value={editHours}
          onChange={(e) => {
            let val = e.target.value.replace(/[^0-9:]/g, "");

            if (val.includes(":")) {
              const [hh, mmRaw] = val.split(":");
              const mm = mmRaw ? mmRaw.slice(0, 2) : "";
              if (mm && Number(mm) > 30) return;
              setEditHours(`${hh}:${mm}`);
            } else {
              setEditHours(val);
            }
          }}
          inputMode="numeric"
          className="w-full p-3 border border-gray-300 rounded-md
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* START DATE */}
        <input
          type="date"
          value={editStartDate}
          onChange={(e) => setEditStartDate(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* DESCRIPTION */}
        <div className="w-full border border-gray-300 rounded-md overflow-hidden">
          <ReactQuill
            value={editDescription}
            onChange={setEditDescription}
            style={{ height: "200px" }}
            modules={{
              toolbar: [
                [{ header: [1, 2, false] }],
                ["bold", "italic", "underline"],
                [{ list: "ordered" }, { list: "bullet" }],
                ["link", "code-block"],
                ["clean"],
              ],
            }}
            formats={[
              "header",
              "bold",
              "italic",
              "underline",
              "list",
              "bullet",
              "link",
              "code-block",
            ]}
          />
        </div>

      </div>

      {/* ACTION BUTTONS */}
      <div className="flex justify-center mt-6 space-x-4">
        <CancelButton onClick={cancelEdit} />
        <SaveButton onClick={() => saveEdit(editTaskId)} />
      </div>

    </div>
  </div>
)}
{showDescriptionPopup && selectedTask && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">

      {/* HEADER */}
      <div className="flex justify-between items-center px-5 py-4 border-b">
        <h3 className="font-semibold text-gray-900">
          {selectedTask.title}
        </h3>
        <button
          onClick={() => setShowDescriptionPopup(false)}
          className="p-1.5 rounded-full hover:bg-gray-100"
        >
          <X size={18} />
        </button>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="p-5 max-h-[60vh] overflow-y-auto text-sm text-gray-700">
        <div
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(
              selectedTask.description || "<p>No description available</p>"
            ),
          }}
        />
      </div>

    </div>
  </div>
)}
{showDescPopup && (
  <div className="
    fixed inset-0 z-50
    bg-black/40 backdrop-blur-sm
    flex items-end sm:items-center
    justify-center
  ">
    <div className="
      w-full sm:max-w-3xl
      bg-white rounded-t-2xl sm:rounded-2xl
      shadow-2xl
      flex flex-col
      max-h-[90vh]
    ">

      {/* HEADER */}
      <div className="
        flex justify-between items-center
        px-4 sm:px-6 py-4
        border-b bg-white/80 backdrop-blur
        shrink-0
      ">
        <h3 className="text-sm font-semibold text-gray-800">
          Project Description
        </h3>

        <div className="flex gap-2">
          {!isEditingDesc ? (
            <button
              onClick={() => {
                setTempDescription(
                  projectdetails.project.project_description || ""
                );
                setIsEditingDesc(true);
              }}
              className="text-xs px-3 py-1.5 rounded-full bg-sky-100 text-sky-700"
            >
              Edit
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  setDescription(tempDescription);
                  setIsEditingDesc(false);
                  setShowDescPopup(false);
                }}
                className="text-xs px-3 py-1.5 rounded-full bg-emerald-500 text-white"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditingDesc(false);
                }}
                className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-600"
              >
                Cancel
              </button>
            </>
          )}

          <button
            onClick={() => setShowDescPopup(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-4">
        {!isEditingDesc ? (
          <div
            className="prose prose-sm max-w-none text-gray-700"
            dangerouslySetInnerHTML={{
              __html:
                projectdetails.project.project_description ||
                "<span class='italic text-gray-400'>No description available</span>",
            }}
          />
        ) : (
          <div className="flex flex-col h-full min-h-[250px]">
            <ReactQuill
              value={tempDescription}
              onChange={setTempDescription}
              placeholder="Project Description"
              className="flex-1"
              modules={{
                toolbar: [
                  [{ header: [1, 2, false] }],
                  ["bold", "italic", "underline"],
                  [{ list: "ordered" }, { list: "bullet" }],
                  ["link", "code-block"],
                  ["clean"],
                ],
              }}
              formats={[
                "header",
                "bold",
                "italic",
                "underline",
                "list",
                "bullet",
                "link",
                "code-block",
              ]}
            />
          </div>
        )}
      </div>
    </div>
  </div>
)}

{showUsersModal && (
  <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden">

      {/* HEADER */}
      <div className="px-5 py-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
        <h3 className="font-semibold text-gray-900">
          {selectedRole} ({selectedUsers.length})
        </h3>
        <button
          onClick={() => setShowUsersModal(false)}
          className="text-gray-500 hover:text-gray-800 text-lg"
        >
          ✕
        </button>
      </div>

      {/* SEARCH */}
      <div className="px-5 py-3 border-b bg-white sticky top-[64px] z-10">
        <input
          type="text"
          placeholder="Search by name or email..."
          className="w-full px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* BODY (SCROLLABLE) */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-300">

        {selectedUsers
          .filter(
            (u) =>
              u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              u.email.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((u, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border"
            >
              <div className="flex items-center gap-3">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                    u.name
                  )}&background=6366f1&color=fff`}
                  className="w-10 h-10 rounded-full"
                />

                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {u.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {u.email}
                  </p>
                </div>
              </div>


{canAddEmployee&&(

              <button
              onClick={async () => {
  try {
    const removeFn = REMOVE_HANDLER_BY_ROLE[selectedRole];

    if (!removeFn) {
      console.error("No remove handler for role:", selectedRole);
      return;
    }

    await removeFn(u.id);

     fetchProjectsbyId(project_id);
    fetchAssigned();
    fetchEmployeeProjects?.();

    // 🧹 Update modal state instantly (UX improvement)
    setSelectedUsers(prev =>
      prev.filter(user => user.id !== u.id)
    );
  } catch (err) {
    console.error("Failed to remove user:", err);
  }
}}

                className="text-red-500 hover:bg-red-50 p-2 rounded-full"
                title="Remove from project"
              >
                🗑️
              </button>
)}
            </div>
          ))}

        {selectedUsers.length === 0 && (
          <p className="text-sm text-gray-400 text-center">
            No users found
          </p>
        )}
      </div>

    </div>
  </div>
)}


{previewItem && (
  <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">

      {/* HEADER */}
      <div className="flex justify-between items-center px-6 py-4 border-b">
        <h3 className="text-sm font-semibold truncate">
          Preview
        </h3>
        <button
          onClick={() => setPreviewItem(null)}
          className="text-gray-400 hover:text-gray-600 text-lg"
        >
          ✕
        </button>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-auto p-4 bg-gray-50">
        {previewItem.endsWith(".pdf") ? (
          <iframe
            src={previewItem}
            className="w-full h-full rounded-xl border"
            title="PDF Preview"
          />
        ) : previewItem.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
          <img
            src={previewItem}
            alt="Preview"
            className="max-w-full max-h-[70vh] mx-auto rounded-xl shadow"
          />
        ) : (
          <div className="text-sm text-gray-500 text-center mt-10">
            Preview not available for this file type
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="px-6 py-3 border-t flex justify-end gap-3">
        <a
          href={previewItem}
          download
          className="
            px-4 py-2 rounded-xl text-sm
            bg-sky-600 text-white hover:bg-sky-700
          "
        >
          Download
        </a>
      </div>
    </div>
  </div>
)}
{isAddAssigneesOpen && (
  <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden">

      {/* HEADER */}
      <div className="px-5 py-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
        <h3 className="font-semibold text-gray-900">
          Add {activeRoleTitle}
        </h3>
        <button
          onClick={() => setIsAddAssigneesOpen(false)}
          className="text-gray-500 hover:text-gray-800 text-lg"
        >
          ✕
        </button>
      </div>

      {/* SEARCH */}
      <div className="px-5 py-3 border-b bg-white sticky top-[64px] z-10">
        <input
          type="text"
          placeholder="Search by name or email..."
          className="w-full px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* BODY (SCROLLABLE) */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2 scrollbar-thin scrollbar-thumb-gray-300">

        {ASSIGNMENT_CONFIG[activeRoleTitle].list
          .filter(
            (u) =>
              u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              u.email?.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((user) => {
            const alreadyAssigned = projectdetails.relation.assignees.some(
              (a) => a.id === user.id
            );

            return (
              <label
                key={user.id}
                className={`flex items-center gap-3 p-3 rounded-xl border hover:bg-gray-50 transition ${
                  alreadyAssigned ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                }`}
              >
                <input
                  type="checkbox"
                  disabled={alreadyAssigned}
                  onChange={(e) => {
                    setAssigneesToAdd((prev) =>
                      e.target.checked
                        ? [...prev, user.id]
                        : prev.filter((id) => id !== user.id)
                    );
                  }}
                />

                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user.name
                  )}&background=6366f1&color=fff`}
                  className="w-9 h-9 rounded-full"
                />

                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">
                    {user.name}
                  </p>
                  {user.email && (
                    <p className="text-xs text-gray-500">
                      {user.email}
                    </p>
                  )}
                </div>

                {alreadyAssigned && (
                  <span className="text-xs text-gray-400">
                    Assigned
                  </span>
                )}
              </label>
            );
          })}

        {ASSIGNMENT_CONFIG[activeRoleTitle].list.length === 0 && (
          <p className="text-sm text-gray-400 text-center">
            No users available
          </p>
        )}
      </div>

      {/* FOOTER */}
      <div className="px-5 py-4 border-t bg-white sticky bottom-0">
        <button
          disabled={!assigneesToAdd.length}
          onClick={async () => {
            const cfg = ASSIGNMENT_CONFIG[activeRoleTitle];
            await cfg.assign(projectdetails.project.id, assigneesToAdd);
            fetchAssigned();
            setAssigneesToAdd([]);
            setIsAddAssigneesOpen(false);
          }}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white py-3 rounded-lg font-semibold transition"
        >
          Add Selected ({assigneesToAdd.length})
        </button>
      </div>

    </div>
  </div>
)}




    </div>
  );
} 
