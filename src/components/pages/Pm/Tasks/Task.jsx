import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Overview } from "../../../components/RichTextEditor";
import { useTask } from "../../../context/TaskContext"; 
import { Edit, Save, Trash2, BriefcaseBusiness, Loader2, Trash } from "lucide-react";
import { SectionHeader } from '../../../components/SectionHeader';
import { SaveButton, CancelButton,todo } from "../../../AllButtons/AllButtons";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Include Quill styles
import DOMPurify from 'dompurify';
import { Edit2, X,Eye } from "lucide-react";
import { ChevronDown, ChevronUp } from "lucide-react";



export default function TaskList( {show}) {
  const { tasks, fetchTasks, addTask, approveTask, editTask, deleteTask } = useTask();
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
  const { project_id } = useParams();
  // console.log("project_id izz", project_id);
const [selectedTask, setSelectedTask] = useState(null);
const [activeTab, setActiveTab] = useState("details"); 
const [chat, setChat] = useState("comments"); 
const [linkInput, setLinkInput] = useState("");
const [links, setLinks] = useState([]); // [{ name, url }]
const [isExpanded, setIsExpanded] = useState(false);
const [isEditingDesc, setIsEditingDesc] = useState(false);
const [description, setDescription] = useState(
  tasks.data?.description || ""
);const [showDescPopup, setShowDescPopup] = useState(false);

const [tempDescription, setTempDescription] = useState(description);

const [showDescriptionPopup, setShowDescriptionPopup] = useState(false);

  // console.log("tasks", tasks);

  const updateStatus = async (taskId, newStatus) => {
    console.log("this is ud", taskId);
    console.log("this is new status", newStatus);
    try {
      await approveTask(taskId, newStatus);
      console.log(`✅ Task ${taskId} updated to ${newStatus}`);
      setStatusDropdown(null);
    } catch (error) {
      console.error("❌ Failed to update task status:", error);
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



  useEffect(() => {
    if (project_id) {
      fetchTasks(project_id);
    }
  }, [project_id]);

  const toggleTask = (taskId) => {
    if (editTaskId) return;
    setOpenTask(openTask === taskId ? null : taskId);
  };



  const toggleStatusDropdown = (id) => {
    setStatusDropdown(statusDropdown === id ? null : id);
  };


  const handleDelete = async (taskId) => {
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


  return (
<div className="h-screen flex flex-col overflow-hidden">
              <SectionHeader icon={BriefcaseBusiness} title="Project Details" subtitle="Project Details" />


<div className="flex h-[calc(100vh-80px)] gap-2 relative overflow-hidden">
  {/* ================= LEFT SIDE ================= */}
{/* TASKS */}
{/* ================= LEFT SIDE ================= */}
<div className="flex-1 h-full flex flex-col px-4 py-4 space-y-4 overflow-hidden">
  {/* HEADER */}
  <div className="flex justify-end items-center">
   

    <button
      onClick={() => setShowForm(true)}
      className="
        px-4 py-2 rounded-full text-sm font-medium
        bg-gradient-to-r from-sky-600 to-indigo-600
        text-white shadow-lg hover:scale-[1.02] transition
      "
    >
      + Add Task
    </button>
  </div>
{/* PROJECT META DETAILS */}
<div className="flex gap-2 bg-white/60 backdrop-blur-lg border border-gray-200 rounded-full p-1 w-fit">
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
  
</div>
<div
  className={`
    rounded-2xl overflow-hidden
    bg-white/70 backdrop-blur-xl
    shadow-sm
    transition
    ${activeTab === "attachments" ? "border-none" : "border border-gray-200"}
  `}
>

  {/* TOGGLES */}


{/* TOGGLE CONTENT */}
<div className="rounded-2xl overflow-hidden bg-white/70 backdrop-blur-xl  shadow-sm">

  {/* PROJECT DETAILS */}
  {activeTab === "details" && (
    <div className="divide-y">
      {[
        { label: "Project Name", value: tasks.data?.project_name },
        { label: "Created At", value: tasks.data?.created_at },
        {
          label: "Start Date",
          value:
            tasks.data?.tasks && tasks.data.tasks.length > 0
              ? tasks.data.tasks[0]?.start_date || "NA"
              : "NA",
        },
        { label: "Project Status", value: tasks.data?.project_status || "NA" },
        { label: "Project Type", value: tasks.data?.project_type || "NA" },
        { label: "Total Hours", value: tasks.data?.total_hours || "NA" },
        { label: "Used Hours", value: tasks.data?.used_hours || "NA" },
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
    </div>
  )}


{activeTab === "Description" && (
  <div className="h-[420px] flex flex-col gap-6 max-w-[80%] mx-auto">

    {/* DESCRIPTION PREVIEW */}
    <div className="
      rounded-xl p-4
      bg-white/70 backdrop-blur-md
      border border-white/40
      text-sm text-gray-700
      line-clamp-3
    ">
      {description || (
        <span className="text-gray-400 italic">
          No description added
        </span>
      )}
    </div>

    {/* CENTER SEE MORE BUTTON */}
    <div className="relative z-50 top-[100px] flex justify-center">
      <button
        onClick={() => {
          setShowDescPopup(true);
          setIsEditingDesc(false);
        }}
        className="
          inline-flex items-center
          text-xs px-6 py-2 rounded-full
          bg-gradient-to-r from-sky-500 to-indigo-500
          text-white shadow-lg
          hover:scale-[1.03]
          transition-all
        "
      >
        See more
      </button>
    </div>
  </div>
)}




  {/* ATTACHMENTS */}
 {/* ATTACHMENTS */}
{activeTab === "attachments" && (
  <div className="h-[420px] flex flex-col gap-6 max-w-[80%] mx-auto">


    <div className="flex gap-3 shrink-0">
      <label className="flex-1">
        <input type="file" className="hidden" />
        <div className="
          cursor-pointer p-4 rounded-xl
          border border-dashed border-gray-300
          text-center text-gray-500
          hover:border-sky-500 hover:text-sky-600 transition
        ">
          + Upload Document
        </div>
      </label>

      <button
        onClick={() => setLinkInput("")}
        className="
          px-4 py-2 rounded-xl text-sm
          border border-gray-300 bg-white
          hover:border-sky-500 hover:text-sky-600 transition
        "
      >
        + Add Link
      </button>
    </div>

    {/* ADD LINK INPUT (fixed) */}
    {linkInput !== null && (
      <div className="flex gap-2 shrink-0">
        <input
          type="url"
          placeholder="Paste link here..."
          value={linkInput}
          onChange={(e) => setLinkInput(e.target.value)}
          className="
            flex-1 p-3 rounded-xl text-sm
            border border-gray-300
            focus:ring-2 focus:ring-sky-500 outline-none
          "
        />
        <button
          onClick={() => {
            if (!linkInput) return;
            setLinks((prev) => [
              ...prev,
              {
                name: linkInput.replace(/^https?:\/\//, "").slice(0, 30),
                url: linkInput,
              },
            ]);
            setLinkInput("");
          }}
          className="
            px-4 rounded-xl text-sm
            bg-gradient-to-r from-sky-600 to-indigo-600
            text-white shadow
          "
        >
          Add
        </button>
      </div>
    )}

    {/* ATTACHMENTS LIST (scrollable) */}
    <div className="
      flex-1 space-y-3
      overflow-y-auto pr-1
      scrollbar-thin scrollbar-thumb-gray-300
    ">
      {links.map((link, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-3 rounded-xl bg-white/80 border"
        >
          <span className="text-sm truncate">🔗 {link.name}</span>
          <a
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-sky-600"
          >
            Open
          </a>
        </div>
      ))}

      {tasks.data?.attachments?.map((file, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-3 rounded-xl bg-white/80 border"
        >
          <span className="text-sm truncate">📄 {file.name}</span>
          <a
            href={file.url}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-sky-600"
          >
            View
          </a>
        </div>
      ))}

      {!tasks.data?.attachments?.length && links.length === 0 && (
        <p className="text-sm text-gray-400 text-center mt-6">
          No attachments or links added
        </p>
      )}
    </div>

  </div>
)}




</div>


</div>
 <h2 className="text-xl font-semibold text-gray-900">
      Project Tasks
    </h2>
  {/* TASK LIST */}
<div className="
  h-full overflow-y-auto space-y-4 pr-2
  border border-gray-200 rounded-2xl
  bg-white/40 backdrop-blur-md
">
    {tasks.data?.tasks?.length > 0 ? (
      tasks.data.tasks.map((task) => {
        const isActive = selectedTask?.id === task.id;

        return (
<div
  key={task.id}
  onClick={() => setSelectedTask(task)}
  className={`
    relative cursor-pointer rounded-2xl p-4
    backdrop-blur-[22px]
    transition-all
    ${
      isActive
        ? `
          bg-gradient-to-br
            from-sky-100/70
            via-blue-100/60
            to-indigo-100/50
          border border-white/50
        `
        : `
          bg-white/65
          border border-white/40
          hover:bg-white/80
        `
    }
  `}
>
  {/* EDIT / DELETE ICONS */}
  <div
    className="absolute top-3 right-3 flex gap-2"
    onClick={(e) => e.stopPropagation()}
  >
    <button
      onClick={() => handleEditClick(task)}
      className="p-1.5 rounded-full hover:bg-sky-100 text-sky-600"
    >
      <Edit2 size={14} />
    </button>

    <button
      onClick={() => handleDelete(task.id)}
      className="p-1.5 rounded-full hover:bg-red-100 text-red-500"
    >
      <Trash2 size={14} />
    </button>
  </div>

  {/* TITLE + STATUS */}
  <div className="flex justify-between items-start gap-4 pr-14">
    <div>
      <h3 className="font-semibold text-gray-900 text-sm leading-snug">
        {task.title}
      </h3>
      <p className="text-xs text-gray-500 mt-1">
        Start: {task.start_date || "NA"} • {task.hours || 0} hrs
      </p>
    </div>

    <span
      className={`
        text-xs px-3 py-1 rounded-full font-medium
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
     
  </div>
</div>




        );
      })
    ) : (
      <p className="text-gray-600 text-sm text-center">
        No tasks available
      </p>
    )}
  </div>
</div>


  {/* ================= RIGHT SIDE ================= */}
<div
  className="
    w-[30%] h-full relative
    rounded-3xl overflow-hidden
    bg-white
    border border-gray-200
    shadow-[0_12px_32px_rgba(0,0,0,0.12)]
  "
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

<div
  className="
    sticky top-0 z-30 px-5 py-4
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
        rounded-2xl p-4
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
      <div className="flex justify-between items-start gap-3"             onClick={() => setIsExpanded(!isExpanded)}
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
            {selectedTask.project_manager.name}
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
          flex-1 overflow-y-auto px-5 py-5 space-y-4
          bg-white
          shadow-[inset_0_1px_0_rgba(0,0,0,0.04)]
        "
      >
        {/* COMMENTS TAB */}
        {chat === "comments" && (
          <>
            {/* Message */}
            <div className="
              rounded-2xl p-4
              bg-sky-50
              border border-sky-100
              shadow-[0_6px_16px_rgba(0,0,0,0.12)]
              hover:shadow-[0_8px_22px_rgba(0,0,0,0.18)]
              transition-all
            ">
              <p className="text-sm font-medium text-gray-900">Sonu</p>
              <p className="text-sm text-gray-700 mt-1">
                Reviewed current functionality and verified workflows.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Sep 16 · 6:56 PM
              </p>
            </div>

            {/* Message */}
            <div className="
              rounded-2xl p-4
              bg-blue-50
              border border-blue-100
              shadow-[0_6px_16px_rgba(0,0,0,0.12)]
              hover:shadow-[0_8px_22px_rgba(0,0,0,0.18)]
              transition-all
            ">
              <p className="text-sm font-medium text-gray-900">Etsy</p>
              <p className="text-sm text-gray-700 mt-1">
                Kindly start the work, payment received.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Oct 13 · 10:38 AM
              </p>
            </div>
             <div className="
              rounded-2xl p-4
              bg-blue-50
              border border-blue-100
              shadow-[0_6px_16px_rgba(0,0,0,0.12)]
              hover:shadow-[0_8px_22px_rgba(0,0,0,0.18)]
              transition-all
            ">
              <p className="text-sm font-medium text-gray-900">Etsy</p>
              <p className="text-sm text-gray-700 mt-1">
                Kindly start the work, payment received.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Oct 13 · 10:38 AM
              </p>
            </div>
             <div className="
              rounded-2xl p-4
              bg-blue-50
              border border-blue-100
              shadow-[0_6px_16px_rgba(0,0,0,0.12)]
              hover:shadow-[0_8px_22px_rgba(0,0,0,0.18)]
              transition-all
            ">
              <p className="text-sm font-medium text-gray-900">Etsy</p>
              <p className="text-sm text-gray-700 mt-1">
                Kindly start the work, payment received.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Oct 13 · 10:38 AM
              </p>
            </div>
             <div className="
              rounded-2xl p-4
              bg-blue-50
              border border-blue-100
              shadow-[0_6px_16px_rgba(0,0,0,0.12)]
              hover:shadow-[0_8px_22px_rgba(0,0,0,0.18)]
              transition-all
            ">
              <p className="text-sm font-medium text-gray-900">Etsy</p>
              <p className="text-sm text-gray-700 mt-1">
                Kindly start the work, payment received.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Oct 13 · 10:38 AM
              </p>
            </div>
             <div className="
              rounded-2xl p-4
              bg-blue-50
              border border-blue-100
              shadow-[0_6px_16px_rgba(0,0,0,0.12)]
              hover:shadow-[0_8px_22px_rgba(0,0,0,0.18)]
              transition-all
            ">
              <p className="text-sm font-medium text-gray-900">Etsy</p>
              <p className="text-sm text-gray-700 mt-1">
                Kindly start the work, payment received.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Oct 13 · 10:38 AM
              </p>
            </div>
             <div className="
              rounded-2xl p-4
              bg-blue-50
              border border-blue-100
              shadow-[0_6px_16px_rgba(0,0,0,0.12)]
              hover:shadow-[0_8px_22px_rgba(0,0,0,0.18)]
              transition-all
            ">
              <p className="text-sm font-medium text-gray-900">Etsy</p>
              <p className="text-sm text-gray-700 mt-1">
                Kindly start the work, payment received.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Oct 13 · 10:38 AM
              </p>
            </div>
             <div className="
              rounded-2xl p-4
              bg-blue-50
              border border-blue-100
              shadow-[0_6px_16px_rgba(0,0,0,0.12)]
              hover:shadow-[0_8px_22px_rgba(0,0,0,0.18)]
              transition-all
            ">
              <p className="text-sm font-medium text-gray-900">Etsy</p>
              <p className="text-sm text-gray-700 mt-1">
                Kindly start the work, payment received.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Oct 13 · 10:38 AM
              </p>
            </div>
          </>
        )}

        {/* ACTIVITY TAB */}
        {chat === "activity" && (
          <div className="space-y-3 text-sm text-gray-700">
            <div className="p-3 rounded-xl bg-gray-50 border">
              🔄 Task status changed to <b>In Progress</b>
              <div className="text-xs text-gray-400 mt-1">
                Oct 14 · 9:20 AM
              </div>
            </div>
  <div className="p-3 rounded-xl bg-gray-50 border">
              📎 File uploaded: <b>requirements.pdf</b>
              <div className="text-xs text-gray-400 mt-1">
                Oct 13 · 4:45 PM
              </div>
            </div>
              <div className="p-3 rounded-xl bg-gray-50 border">
              📎 File uploaded: <b>requirements.pdf</b>
              <div className="text-xs text-gray-400 mt-1">
                Oct 13 · 4:45 PM
              </div>
            </div>
              <div className="p-3 rounded-xl bg-gray-50 border">
              📎 File uploaded: <b>requirements.pdf</b>
              <div className="text-xs text-gray-400 mt-1">
                Oct 13 · 4:45 PM
              </div>
            </div>
              <div className="p-3 rounded-xl bg-gray-50 border">
              📎 File uploaded: <b>requirements.pdf</b>
              <div className="text-xs text-gray-400 mt-1">
                Oct 13 · 4:45 PM
              </div>
            </div>
              <div className="p-3 rounded-xl bg-gray-50 border">
              📎 File uploaded: <b>requirements.pdf</b>
              <div className="text-xs text-gray-400 mt-1">
                Oct 13 · 4:45 PM
              </div>
            </div>
              <div className="p-3 rounded-xl bg-gray-50 border">
              📎 File uploaded: <b>requirements.pdf</b>
              <div className="text-xs text-gray-400 mt-1">
                Oct 13 · 4:45 PM
              </div>
            </div>
              <div className="p-3 rounded-xl bg-gray-50 border">
              📎 File uploaded: <b>requirements.pdf</b>
              <div className="text-xs text-gray-400 mt-1">
                Oct 13 · 4:45 PM
              </div>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 border">
              📎 File uploaded: <b>requirements.pdf</b>
              <div className="text-xs text-gray-400 mt-1">
                Oct 13 · 4:45 PM
              </div>
            </div>
          </div>
        )}
      </div>
    </div>



    {/* ================= INPUT ================= */}
    {selectedTask && chat === "comments" && (
      <div className="
        px-4 py-3
        bg-white/35 backdrop-blur-[24px]
        border-t border-white/40
      ">
        <div className="
          flex gap-2 items-center
          bg-white/55 backdrop-blur-[18px]
          border border-white/50
          rounded-2xl px-3 py-2
          shadow-inner
        ">
          <input
            type="text"
            placeholder="Write a comment..."
            className="
              flex-1 bg-transparent text-sm
              outline-none placeholder-gray-600
            "
          />
          <button className="
            px-4 py-2 text-sm font-semibold rounded-xl
            bg-gradient-to-r from-sky-600 to-indigo-600
            text-white shadow-xl
            hover:scale-[1.06] active:scale-[0.96]
            transition
          ">
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
  <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm
    flex items-center justify-center px-4">

    <div className="
      w-full max-w-3xl
      bg-white rounded-2xl
      shadow-2xl
      overflow-hidden
    ">

      {/* HEADER */}
      <div className="
        flex justify-between items-center
        px-6 py-4
        border-b
        bg-white/80 backdrop-blur
      ">
        <h3 className="text-sm font-semibold text-gray-800">
          Project Description
        </h3>

        <div className="flex gap-2">
          {!isEditingDesc ? (
            <button
              onClick={() => {
                setTempDescription(description);
                setIsEditingDesc(true);
              }}
              className="
                text-xs px-3 py-1.5 rounded-full
                bg-sky-100 text-sky-700
                hover:bg-sky-200
              "
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
                  // 🔔 API call here
                }}
                className="
                  text-xs px-3 py-1.5 rounded-full
                  bg-emerald-500 text-white
                  hover:bg-emerald-600
                "
              >
                Save
              </button>

              <button
                onClick={() => {
                  setTempDescription(description);
                  setIsEditingDesc(false);
                }}
                className="
                  text-xs px-3 py-1.5 rounded-full
                  bg-gray-100 text-gray-600
                  hover:bg-gray-200
                "
              >
                Cancel
              </button>
            </>
          )}

          <button
            onClick={() => {
              setShowDescPopup(false);
              setIsEditingDesc(false);
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      </div>

      {/* BODY (SCROLLABLE) */}
      <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
        {!isEditingDesc ? (
          <div className="text-sm text-gray-700 whitespace-pre-wrap">
            {description || (
              <span className="text-gray-400 italic">
                No description available
              </span>
            )}
          </div>
        ) : (
          <textarea
            value={tempDescription}
            onChange={(e) => setTempDescription(e.target.value)}
            rows={10}
            className="
              w-full rounded-xl p-4
              border border-gray-200
              text-sm text-gray-800
              focus:outline-none focus:ring-2 focus:ring-sky-400
              resize-none
            "
            placeholder="Edit description..."
          />
        )}
      </div>
    </div>
  </div>
)}



    </div>
  );
} 
