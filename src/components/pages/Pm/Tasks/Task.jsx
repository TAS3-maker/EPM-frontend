import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Overview } from "../../../components/RichTextEditor";
import { useTask } from "../../../context/TaskContext"; // ✅ Import useTask from TaskContext
import { Edit, Save, Trash2, BriefcaseBusiness, Loader2, Trash } from "lucide-react";
import { SectionHeader } from '../../../components/SectionHeader';
import { SaveButton, CancelButton,todo } from "../../../AllButtons/AllButtons";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Include Quill styles
import DOMPurify from 'dompurify';



export default function TaskList( {show}) {
  const { tasks, fetchTasks, addTask, approveTask, editTask, deleteTask } = useTask();
  const [openTask, setOpenTask] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [taskDetails, setTaskDetails] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [status, setStatus] = useState("To do");
  const [hours, setHours] = useState("");
  const [deadline, setDeadline] = useState("");
  const [statusDropdown, setStatusDropdown] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTaskId, setEditTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editProjectName, setEditProjectName] = useState(tasks.data?.project_name || "");
  const [editDeadline, setEditDeadline] = useState("");
  const [editHours, setEditHours] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const { project_id } = useParams();
  // console.log("project_id izz", project_id);


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

  const handleAddTask = async () => {
    const newTask = {
      title: taskTitle,
      description: taskDetails,
      status,
      project_id: Number(project_id),
      hours: Number(hours),
      deadline,
    };

    try {
      await addTask(newTask);
      fetchTasks(project_id);
      setShowForm(false);
      setTaskTitle("");
      setTaskDetails("");
      setHours("");
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
  


  const startEditing = (task) => {
    setEditTaskId(task.id);
    setEditTitle(task.title);
    setEditDeadline(task.deadline);
    setEditHours(task.hours);
    setEditDescription(task.description);
    setEditStatus(task.status);
  };

  const saveEdit = async (taskId) => {
    console.log("Saving task with editTitle:", editTitle);
    console.log("Saving task with editDescription:", editDescription);
    console.log("Saving task with editDeadline:", editDeadline);
    console.log("Saving task with editHours:", editHours);  //newStatus
    console.log("Project ID:",taskId);
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
      hours: editHours,
    };

    const result = await editTask(taskId, updatedTask,project_id);
    if (result) {
      setEditTaskId(null); // Exit edit mode
    }

    setEditTaskId(null);
    setEditTitle("");
    setEditDeadline("");
    setEditHours("");
    setEditDescription("");
    setEditStatus("");
    fetchTasks();
  };

  const cancelEdit = () => {
    setEditTaskId(null);
    setEditTitle("");
    setEditDeadline("");
    setEditHours("");
    setEditDescription("");
  };

  return (
    <div className="flex items-center justify-center relative ">
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
          placeholder="Status"
          value="To do"
          readOnly
          className="w-full p-3 border border-gray-200 bg-gray-100 rounded-md cursor-not-allowed"
        />

        <input
          type="number"
          placeholder="Hours"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
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




      <div className="w-full bg-white shadow-md rounded-3xl ">
        {!show && (
        <SectionHeader icon={BriefcaseBusiness} title="Project Details" subtitle="Project Details" />
        )}
        <div className="p-4 flex items-center justify-between gap-3 border border-b">
          {localStorage.user_name !== "projectmanager" ? (
            <button onClick={() => setShowForm(true)} className="add-items-btn">
              + Add Task
            </button>
          ) : null}
          {tasks.data && (
            <div className="flex flex-wrap md:flex-nowrap items-center gap-3 border p-2 rounded-lg shadow-md bg-white bg-gradient-to-br from-blue-500 from-25% via-blue-800 via-50% to-blue-500 to-100%">
              <div className="flex flex-wrap md:flex-nowrap items-center gap-3 border p-2 rounded-lg shadow-md bg-white">
                {isEditing ? (
                  <input
                    type="text"
                    value={editProjectName}
                    onChange={(e) => setEditProjectName(e.target.value)}
                    className="text-2xl font-bold text-gray-900 border p-2 w-full"
                  />
                ) : (
                  <div className="flex flex-col flex-wrap md:flex-nowrap items-center gap-1">
                    <strong>Project Name:</strong>
                    <p className="text-lg text-gray-700">
                      {tasks.data.project_name}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex flex-col flex-wrap md:flex-nowrap items-center gap-1 border p-2 rounded-lg shadow-md bg-white">
                <strong>Created At:</strong>
                <p className="text-lg text-gray-700 ">
                  {tasks.data.created_at}
                </p>
              </div>
              <div className="flex flex-col flex-wrap md:flex-nowrap items-center gap-1 border p-2 rounded-lg shadow-md bg-white">
                <strong>Deadline:</strong>
                <p className="text-lg text-gray-700">
                  {tasks.data.deadline ? tasks.data.deadline : "NA"}
                </p>
              </div>
              <div className="flex flex-col flex-wrap md:flex-nowrap items-center gap-1 border p-2 rounded-lg shadow-md bg-white">
                <strong>Total Hours:</strong>
                <p className="text-lg text-gray-700">
                  {tasks.data.total_hours}
                </p>
              </div>
              {/* <div className="flex flex-col flex-wrap md:flex-nowrap items-center gap-1 border p-2 rounded-lg shadow-md bg-white">
                <strong>Assigned By:</strong>
                <p className="text-lg text-gray-700">
                  {tasks.data.project_managers[0]}
                </p>
              </div> */}
            </div>
          )}
        </div>

        <div className="p-4 min-h-[100vh]">
          <h2 className="text-2xl font-bold text-blue-800 mb-6">Project Tasks</h2>
          <div className="relative border-l-4 border-blue-500 ml-9 space-y-4">
            {tasks.data?.tasks.length > 0 ? (
              tasks.data.tasks.map((task) => (
                <div key={task.id} className="relative px-5 py-1 border-b border-[#e1e1e1] pb-5">
                  <div className="absolute w-5 h-5 bg-blue-600 rounded-full -left-[0.7rem] top-3"></div>
                  <div className="flex justify-between items-center">

                    {/* Editable Title Field */}
                    {editTaskId === task.id ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="text-base font-bold text-gray-900 border p-2 w-full rounded-md mr-3"
                      />
                    ) : (
                      <button
                        onClick={() => toggleTask(task.id)}
                        className="w-full text-left text-base font-bold text-gray-900 hover:text-blue-700 focus:outline-none transition-all"
                      >
                        {task.title}
                      </button>
                    )}

                    {/* Status Dropdown & Edit Buttons */}
                      <div className="relative flex items-center gap-2">
                        {/* Show status button only in edit mode */}
                        {editTaskId === task.id ? (
                          <>
                            {/* Clickable status button that toggles the dropdown */}
                            <button
                              onClick={() => toggleStatusDropdown(task.id)}
                              className="px-4 py-2 bg-gray-200 rounded-lg shadow-md hover:bg-gray-300 transition-all whitespace-nowrap"
                            >
                              {editStatus}
                            </button>

                            {/* Dropdown for selecting status */}
                            {statusDropdown === task.id && (
                              <div className="absolute top-[50px] z-30 right-0 mt-2 w-36 bg-white border border-gray-300 rounded-lg shadow-lg">
                                <button
                                  onClick={() => setEditStatus("To do")}
                                  className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                                >
                                  To-Do
                                </button>
                                <button
                                  onClick={() => setEditStatus("In Progress")}
                                  className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                                >
                                  In Progress
                                </button>
                                <button
                                  onClick={() => setEditStatus("Completed")}
                                  className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                                >
                                  Completed
                                </button>
                                <button
                                  onClick={() => setEditStatus("Cancel")}
                                  className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                                >
                                  Cancel
                                </button>
                              </div>
                            )}

                            {/* Save and Cancel buttons */}
                            <div className="flex space-x-2">
                              <button
                                onClick={() => saveEdit(task.id)}
                                className="save-btn"
                              >
                                <Save className="h-4 w-4 mr-1" />
                                Save
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="cancel-btn"
                              >
                                Cancel
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* Show current status when not editing */}
                            {/* <button
                              className="px-4 py-2 bg-gray-200 rounded-lg shadow-md cursor-default"
                            >
                              {task.status}
                            </button> */}

                               <button
                                // onClick={cancelEdit}
                                className="todo-btn"
                              >
                                {task.status}
                              </button>

                            {/* Edit and Delete buttons */}
                             {localStorage.user_name !== "projectmanager" ? (
                                // Render these buttons if the user is NOT a "projectmanager"
                                <>
                                    <button
                                        onClick={() => startEditing(task)}
                                        className="edit-btn"
                                    >
                                        <Edit className="h-4 w-4 mr-1" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(task.id,project_id)}
                                        
                                        className="delete-btn"
                                    >
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        Delete
                                    </button>
                                </>
                            ) : (
                                // Optionally, render something else if the user IS a "projectmanager"
                                // Or just render nothing: null
                                null
                            )}
                            
                          </>
                        )}
                      </div>
                  </div>

                  {/* Task Details (Expands when clicked) */}
                  {openTask === task.id && (
  <div className="mt-5 p-6 bg-blue-50 rounded-2xl shadow-lg border border-blue-300 space-y-4">

    {/* Editable Deadline Field */}
    <div className="text-lg text-gray-800 font-semibold">
      <strong>Deadline:</strong>
      {editTaskId === task.id ? (
        <input
          type="date"
          value={editDeadline}
          onChange={(e) => setEditDeadline(e.target.value)}
          className="border p-2 ml-2 rounded"
        />
      ) : (
        <span className="ml-2">{task.deadline}</span>
      )}
    </div>

    {/* Editable Hours Field */}
    <div className="text-lg text-gray-800 font-semibold">
      <strong>Hours:</strong>
      {editTaskId === task.id ? (
        <input
          type="number"
          value={editHours}
          onChange={(e) => setEditHours(e.target.value)}
          className="border p-2 ml-2 w-24 rounded"
        />
      ) : (
        <span className="ml-2">{task.hours}</span>
      )}
    </div>

    {/* Assigned By */}
    <div className="text-lg text-gray-800 font-semibold">
      <strong>Assigned By:</strong> {task.project_manager.name}
    </div>

    {/* Task Description */}
    <div className="mt-4 pt-4 border-t">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Description:</h3>
      {editTaskId === task.id ? (
        <div className="bg-white border rounded-md pb-10">
          <ReactQuill
            value={editDescription}
            onChange={setEditDescription}
            className="w-full"
            style={{ height: '200px' }}
            modules={{
              toolbar: [
                [{ header: [1, 2, false] }],
                ['bold', 'italic', 'underline'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['link'],
                ['clean'],
              ],
            }}
            formats={[
              'header', 'bold', 'italic', 'underline',
              'list', 'bullet', 'link',
            ]}
          />
        </div>
      ) : (
        <div
          className="prose max-w-none text-gray-900"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(task.description) }}
        />
      )}
    </div>

  </div>
)}

                </div>
              ))
            ) : (
              <p className="text-lg text-gray-800 font-semibold">
                No tasks available for this project.
              </p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
} 
