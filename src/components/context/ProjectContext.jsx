import React, { createContext, useContext, useState, useEffect } from "react";
import { API_URL } from "../utils/ApiConfig";
import { useNavigate } from "react-router-dom";
import { useAlert } from "./AlertContext";
const ProjectContext = createContext();
export const ProjectProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [projects, setProjects] = useState([]);
    const { showAlert } = useAlert();
  const token = localStorage.getItem("userToken");
  const userId = localStorage.getItem("user_id");
  // console.log(token);
  const navigate = useNavigate();
  const handleUnauthorized = (response) => {
    if (response.status === 401) {
      localStorage.removeItem("userToken");
      navigate("/");
      return true;
    }
    return false;
  };
  const addProject = async (clientId, projectName, tags_activitys,projectType) => {
    console.log("Adding project with data:", { clientId, projectName, tags_activitys, projectType });
    if (!clientId || !projectName || !tags_activitys || !projectType) {
      showAlert({ variant: "warning", title: "Missing Fields", message: "Please fill in all required fields." });
      return;
    }
    setIsLoading(true);
    setMessage("");
    const requestBody = {
      sales_team_id: "2",
      client_id: parseInt(clientId),
      project_name: projectName,
      tags_activitys: tags_activitys,
      project_type: projectType.trim(),
    };

    try {
      const response = await fetch(`${API_URL}/api/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });
      if (handleUnauthorized(response)) return;
      const text = await response.text(); // Get raw response text
      // console.log("Raw API Response:", text);
      const data = JSON.parse(text); // Try parsing it as JSON
      if (response.ok) {
        // setMessage("Project added successfully!");
        showAlert({ variant: "success", title: "Success", message: "Project added successfully!" });
        fetchProjects();
      } else {
        // console.log( "Failed to add project.")
        // setMessage(data.message || "Failed to add project.");
        showAlert({ variant: "error", title: "Error", message: "Failed to add project." });
      }
    } catch (error) {
      console.error("API Error:", error);
      setMessage("An error occurred. Please try again.");
      showAlert({ variant: "error", title: "Error", message: error?.message || String(error) });

    } finally {
      setIsLoading(false);
    }
  };
  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/projects`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      // console.log("Fetching projects...",response);
      if (handleUnauthorized(response)) return;
      const data = await response.json();
      if (response.ok) {
        setProjects(data.data || []);
      } else {
        setMessage("Failed to fetch projects.");
      }
    } catch (error) {
      setMessage("An error occurred while fetching projects.");
    } finally {
      setIsLoading(false);
    }
  };
  const editProject = async (id, updatedData) => {
    setIsLoading(true);
    setMessage("");
    try {
      const response = await fetch(`${API_URL}/api/projects/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });
      if (handleUnauthorized(response)) return;
      const data = await response.json();
      if (response.ok) {
        showAlert({ variant: "success", title: "Success", message: "Project updated successfully!" });
        // setMessage("Project updated successfully!");
        fetchProjects();
      } else {
        // setMessage(data.message);
        showAlert({ variant: "error", title: "Error", message: data.message || "Failed to update project." });
      }
    } catch (error) {
      // setMessage("An error occurred while updating the project.");
      showAlert({ variant: "error", title: "Error", message: "An error occurred while updating the project." });
    } finally {
      setIsLoading(false);
    }
  };
  const deleteProject = async (id) => {
    setIsLoading(true);
    setMessage("");
    try {
      const response = await fetch(`${API_URL}/api/projects/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (handleUnauthorized(response)) return;
      if (response.ok) {
        // setMessage("Project deleted successfully!");
        showAlert({ variant: "success", title: "Success", message: "Project deleted successfully!" });
        setProjects((prevProjects) => prevProjects.filter((project) => project.id !== id));
      } else {
        // setMessage("Failed to delete project.");
        showAlert({ variant: "error", title: "Error", message: "Failed to delete project." });
      }
    } catch (error) {
      // setMessage("An error occurred while deleting the project.");
      showAlert({ variant: "error", title: "Error", message: "An error occurred while deleting the project." });
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchProjects();
  }, []);
  return (
    <ProjectContext.Provider value={{ addProject, fetchProjects, editProject, deleteProject, projects, isLoading, message }}>
      {children}
    </ProjectContext.Provider>
  );
};
export const useProject = () => useContext(ProjectContext);