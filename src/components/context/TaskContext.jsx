import { createContext, useContext, useEffect, useState } from "react";
import { API_URL } from "../utils/ApiConfig";
import axios from "axios";
import { useAlert } from "./AlertContext";
const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
    const [tasks, setTasks] = useState([]);
    const token = localStorage.getItem("userToken");
    const [empTasks, setEmpTasks] = useState([]);
    const [prevTasks, setPrevTasks] = useState([]);
    const [approvalResponse, setApprovalResponse] = useState(null);
    const { showAlert } = useAlert();
    const fetchTasks = async (project_id) => {
      // console.log("Fetching tasks for project ID:", project_id);
        try {
            const response = await fetch(
                `${API_URL}/api/getalltaskofprojectbyid/${project_id}`,
                {
                    method: "PUT",
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

    return (
        <TaskContext.Provider value={{ tasks, fetchTasks, addTask, empTasks, fetchEmpTasks, approveTask, editTask, deleteTask }}>
            {children}
        </TaskContext.Provider>
    );

};

export const useTask = () => {
    return useContext(TaskContext);
};
