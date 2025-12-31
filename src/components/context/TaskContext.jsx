import { createContext, useContext, useEffect, useState } from "react";
import { API_URL } from "../utils/ApiConfig";
import axios from "axios";
import { useAlert } from "./AlertContext";
const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
    const [tasks, setTasks] = useState([]);
    const token = localStorage.getItem("userToken");
    const [empTasks, setEmpTasks] = useState([]);
        const [fulldetails, setFulldetails] = useState([]);
    const [prevTasks, setPrevTasks] = useState([]);
    const [approvalResponse, setApprovalResponse] = useState(null);
    const { showAlert } = useAlert();
    const [taskComments, setTaskComments] = useState([]);
const [attachments, setAttachments] = useState([]);
const [loadingAttachments, setLoadingAttachments] = useState(false);
    const [taknarration, setTaknarration] = useState([]);
const [activities, setActivities] = useState([]);


    const fetchTasks = async (project_id) => {
      // console.log("Fetching tasks for project ID:", project_id);  setTaknarration
        try {
            const response = await fetch(
                `${API_URL}/api/get-project-master-tasks/${project_id}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch tasks");
            }

            const data = await response.json();
            setTasks(data);
        } catch (error) {
            console.error("Error fetching tasks:", error.message);
        }
    };



 const fetchfulldetails = async (project_id) => {
      // console.log("Fetching tasks for project ID:", project_id);  setTaknarration
        try {
            const response = await fetch(
                `${API_URL}/api/get-full-details-of-project-by-id/${project_id}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch tasks");
            }

            const data = await response.json();
            setFulldetails(data);
        } catch (error) {
            console.error("Error fetching tasks:", error.message);
        }
    };



    const addTask = async (taskData) => {
        try {
          const response = await fetch(`${API_URL}/api/add-task`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(taskData),
          });
          const data = await response.json();
          fetchTasks()
          if (response.ok) {
            showAlert({ variant: "success", title: "Success", message: "Task added successfully" });

            fetchTasks(taskData.project_id); 
          } else {
            console.error("Error adding task:", data);
            // showAlert({ variant: "success", title: "Success", message: "Task added successfully" });
            showAlert({ variant: "error", title: "Error", message: data.message || "Failed to add task" });
          }
        } catch (error) {
          console.error("Add task error:", error);
        }
      };
    
      const fetchEmpTasks = async (project_id) => {
        try {
          const response = await axios.post(
            `${API_URL}/api/get-emp-tasksby-project`,
            { project_id },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
    
          setEmpTasks(response.data);
          fetchTasks()
          // console.log("✅ Employee Tasks:", response.data);
        } catch (error) {
          console.error("❌ Error fetching employee tasks:", error);
        }
      };


      const approveTask = async (taskId, status) => {
        try {
          const response = await axios.post(
            `${API_URL}/api/approve-task-ofproject`,
            { id: taskId, status },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
    
          setApprovalResponse(response.data);
          fetchTasks();
          return response.data;
        } catch (error) {
          console.error("❌ Error approving task:", error);
          throw error;
        }
      };


      const editTask = async (taskId, updatedTask,ID) => {
        // console.log("Payload to update:", updatedTask);

        try {
            const response = await axios.put(
                `${API_URL}/api/edit-task/${taskId}`,
                updatedTask,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 200) {
                // console.log("✅ Task updated successfully:", response.data);
                showAlert({ variant: "success", title: "Success", message: "Task updated successfully" });
                // return response.data;
                fetchTasks(ID);
            } else {
                // console.error("❌ Failed to edit task:", response.data);
                showAlert({ variant: "error", title: "Error", message: response.data.message || "Failed to update task" });
                return null;
            }
        } catch (error) {
            // console.error("❌ Error updating task:", error);
            showAlert({ variant: "error", title: "Error", message: error.message || "Failed to update task" });
            return null;
        }
    };


      // Delete Task Function (DELETE Method)
const deleteTask = async (taskId,projectid) => {
  // console.log("Deleting task with ID:", taskId, "for project ID:", projectid);
  try {
      const response = await axios.delete(
          `${API_URL}/api/delete-task/${taskId}`,
          {
              headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
              },
          }
      );

      if (response.status === 200) {
          // console.log("✅ Task deleted successfully",projectid);
          fetchTasks(projectid);
          showAlert({ variant: "success", title: "Success", message: "Task deleted successfully" });
          return true;
      } else {
          console.error("❌ Failed to delete task", response.data);
          return false;
      }
  } catch (error) {
      console.error("❌ Error deleting task:", error);
      return false;
  }
};

 useEffect(() => {
   fetchTasks()
  }, []);

const fetchTaskComments = async (task_id) => {
  console.log("Fetching comments for task ID:", task_id);

  try {
    const response = await axios.get(
      `${API_URL}/api/get-all-comments`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { task_id },
      }
    );

    const comments = Array.isArray(response.data?.data)
      ? response.data.data
      : [];

    // 🔽 oldest → newest (latest at end)
    comments.sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at)
    );

    setTaskComments(comments);
  } catch (error) {
    console.error("❌ Error fetching task comments:", error);
    setTaskComments([]);
  }
};






const getProjectActivitiesAndComments = async (
  projectId,
  type
) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/project-activity-comment`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        params: {
          project_id: projectId,
          task_id: null,
          type: type,
        },
      }
    );

    return response.data?.data || [];
  } catch (error) {
    console.error(
      "❌ Error fetching project activities/comments:",
      error.response?.data || error
    );
    return [];
  }
};


const deleteAttachment = async (commentId, projectId) => {
  try {
    await axios.delete(
      `${API_URL}/api/project-activity-comment/${commentId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // refresh attachments list
    refreshAttachments(projectId);
  } catch (error) {
    console.error(
      "❌ Error deleting attachment:",
      error.response?.data || error
    );
  }
};






// const addTaskComment = async ({
//   project_id,
//   task_id,
//   type = "comment", // comment | attachment
//   description = "",
//   attachments = null,
// }) => {
//   try {
//     const payload = {
//       project_id,
//       task_id,
//       type,
//       description,
//       attachments,
//     };

//     const response = await axios.post(
//       `${API_URL}/api/project-activity-comment`,
//       payload,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     if (response.status === 200 || response.status === 201) {
//       // showAlert({
//       //   variant: "success",
//       //   title: "Success",
//       //   message: "Added successfully",
//       // });

//       fetchTaskComments(task_id); // refresh timeline
//       return response.data;
//     }
//   } catch (error) {
//     console.error("❌ Error adding activity:", error);
//     showAlert({
//       variant: "error",
//       title: "Error",
//       message: "Failed to add",
//     });
//   }
// };


// const addTaskComment = async ({
//   project_id,
//   task_id,
//   type = "comment", 
//   description = "",
//   attachments = null, 
// }) => {
//   try {
//     const formData = new FormData();
//     formData.append("project_id", project_id);
//     formData.append("task_id", task_id || "");
//     formData.append("type", type);
//     formData.append("description", description);
// console.log("Attachments type:", attachments);
// console.log("project_id value:", project_id);
// console.log("type value:", type);
//  if (attachments instanceof File) {
//       // backend expects array
//       formData.append("attachments[]", attachments);
//     }

//     if (typeof attachments === "string") {
//       formData.append("attachments", attachments);
//     }

//     const response = await axios.post(
//       `${API_URL}/api/project-activity-comment`,
//       formData,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
  
//         },
//       }
//     );

//     if (response.status === 200 || response.status === 201) {
//       fetchTaskComments(task_id);
//       getProjectActivitiesAndComments(project_id, "attachment");
//       return response.data;
//     }
//   } catch (error) {
//     console.error("❌ Error adding attachment:", error);
//     showAlert({
//       variant: "error",
//       title: "Error",
//       message: "Failed to add attachment",
//     });
//   }
// };


const addTaskComment = async ({
  project_id,
  task_id = null,
  type = "comment",
  description = "",
  attachments = null,
}) => {
  try {
    const formData = new FormData();

    formData.append("project_id", project_id);
    if (task_id !== null) formData.append("task_id", task_id);
    formData.append("type", type);
    formData.append("description", description);

    if (attachments instanceof File) {
      formData.append("attachments", attachments);
    }

    if (typeof attachments === "string") {
      formData.append("attachments", attachments);
    }

    const response = await axios.post(
      `${API_URL}/api/project-activity-comment`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
//  await refreshAttachments(project_id);
    // ✅ THIS WAS MISSING
    if (task_id) {
      await fetchTaskComments(task_id);
    }

    await refreshActivity(project_id);

    return response.data;
  } catch (error) {
    console.error("❌ Error adding comment:", error.response?.data || error);
    throw error;
  }
};



const refreshAttachments = async (project_id) => {
  if (!project_id) return;

  setLoadingAttachments(true);
  const data = await getProjectActivitiesAndComments(
    project_id,
    "attachment"
  );
  setAttachments(data);
  setLoadingAttachments(false);
};



const refreshActivity = async (project_id) => {
  if (!project_id) return;

  const data = await getProjectActivitiesAndComments(
    project_id,
    "activity"
  );

  setActivities(data); 
};





    return (
        <TaskContext.Provider value={{ tasks, fetchTasks, addTask, empTasks, fetchEmpTasks, approveTask, editTask, deleteTask, fetchTaskComments ,taskComments,addTaskComment,setTaskComments,getProjectActivitiesAndComments,setAttachments,attachments,loadingAttachments,setLoadingAttachments,refreshAttachments,deleteAttachment,activities,setActivities,refreshActivity,fetchfulldetails,fulldetails,setFulldetails}}>
            {children}
        </TaskContext.Provider>
    );

};

export const useTask = () => {
    return useContext(TaskContext);
};
