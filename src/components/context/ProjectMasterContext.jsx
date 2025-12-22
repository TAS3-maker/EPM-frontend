import React, { createContext, useContext, useState, useEffect } from "react";
import { API_URL } from "../utils/ApiConfig";
import { useNavigate } from "react-router-dom";
import { useAlert } from "./AlertContext";

const ProjectMasterContext = createContext();

export const ProjectMasterProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [projectMasters, setProjectMasters] = useState([]);
    const [message, setMessage] = useState("");
  const { showAlert } = useAlert();
  const token = localStorage.getItem("userToken");
  const navigate = useNavigate();
    const [projectdetails, setProjectdetails] = useState([]);


  const handleUnauthorized = (response) => {
    if (response.status === 401) {
      localStorage.removeItem("userToken");
      navigate("/");
      return true;
    }
    return false;
  };

  const fetchProjectMasters = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/projects-master`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (handleUnauthorized(response)) return;
      const data = await response.json();
      if (response.ok) {
        setProjectMasters(data.data || data || []);
      } else {
        showAlert({ variant: "error", title: "Error", message: "Failed to fetch projects." });
      }
    } catch (error) {
      console.error("Fetch project masters error:", error);
      showAlert({ variant: "error", title: "Error", message: "An error occurred while fetching projects." });
    } finally {
      setIsLoading(false);
    }
  };

  const addProjectMaster = async (projectData) => {
    console.log("Adding project master:", projectData);
    
    
    if (!projectData.project_name?.trim() || !projectData.client_id) {
      showAlert({ variant: "warning", title: "Missing Fields", message: "Project name and client are required." });
      return;
    }

    setIsLoading(true);
    const requestBody = {
      project_name: projectData.project_name.trim(),
      client_id: parseInt(projectData.client_id),
      communication_id: projectData.communication_id || "",
      assignees: projectData.assignees || "",
      source_id: projectData.source_id ? parseInt(projectData.source_id) : null,
      account_id: projectData.account_id ? parseInt(projectData.account_id) : null,
      sales_person_id: projectData.sales_person_id ? parseInt(projectData.sales_person_id) : null,
      project_tracking: projectData.project_tracking || "1",
      project_status: projectData.project_status || "In Progress",
      project_description: projectData.project_description || "",
      project_budget: projectData.project_budget || "0",
      project_hours: projectData.project_hours || "0",
      project_tag_activity: projectData.project_tag_activity ? parseInt(projectData.project_tag_activity) : 1,
      project_used_hours: projectData.project_used_hours || "0",
      project_used_budget: projectData.project_used_budget || "0",
    };

    try {
      const response = await fetch(`${API_URL}/api/projects-master`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (handleUnauthorized(response)) return;

      const data = await response.json();

      if (response.ok) {
        showAlert({ variant: "success", title: "Success", message: "Project created successfully!" });
        fetchProjectMasters();
        return { success: true, data };
      } else {
        showAlert({ variant: "error", title: "Error", message: data.message || "Failed to create project." });
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.error("Add project master error:", error);
      showAlert({ variant: "error", title: "Error", message: error?.message || "An error occurred while creating project." });
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const editProjectMaster = async (id, updatedData) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/projects-master/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      if (handleUnauthorized(response)) return { success: false };

      const data = await response.json();

      if (response.ok) {
        showAlert({ variant: "success", title: "Success", message: "Project updated successfully!" });
        fetchProjectMasters();
        return { success: true };
      } else {
        showAlert({ variant: "error", title: "Error", message: data.message || "Failed to update project." });
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.error("Edit project master error:", error);
      showAlert({ variant: "error", title: "Error", message: "An error occurred while updating project." });
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const updateProjectDetail = async (id, updateData) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/update-projects-master/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (handleUnauthorized(response)) return { success: false };

      const data = await response.json();

      if (response.ok) {
        showAlert({ variant: "success", title: "Success", message: "Project detail updated successfully!" });
        fetchProjectMasters();
        return { success: true };
      } else {
        showAlert({ variant: "error", title: "Error", message: data.message || "Failed to update project detail." });
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.error("Update project detail error:", error);
      showAlert({ variant: "error", title: "Error", message: "An error occurred while updating project detail." });
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProjectMaster = async (id) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/projects-master/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (handleUnauthorized(response)) return { success: false };

      if (response.ok) {
        showAlert({ variant: "success", title: "Success", message: "Project deleted successfully!" });
        setProjectMasters((prev) => prev.filter((project) => project.id !== id));
        return { success: true };
      } else {
        showAlert({ variant: "error", title: "Error", message: "Failed to delete project." });
        return { success: false };
      }
    } catch (error) {
      console.error("Delete project master error:", error);
      showAlert({ variant: "error", title: "Error", message: "An error occurred while deleting project." });
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };


   const fetchProjectsbyId = async (id) => {
  setIsLoading(true);
  try {
    const response = await fetch(`${API_URL}/api/projects-master/${id}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
    if (handleUnauthorized(response)) return;
    const data = await response.json();
    if (response.ok) {
      setProjectdetails(data.data || []);
    } else {
      setMessage("Failed to fetch projects.");
    }
  } catch (error) {
    setMessage("An error occurred while fetching projects.");
  } finally {
    setIsLoading(false);
  }
};

  useEffect(() => {
    fetchProjectMasters();
  }, []);

  const value = {
    projectMasters,
    isLoading,
    addProjectMaster,
    fetchProjectMasters,
    editProjectMaster,
    updateProjectDetail,
    deleteProjectMaster,
    projectdetails,
    fetchProjectsbyId
  };

  return (
    <ProjectMasterContext.Provider value={value}>
      {children}
    </ProjectMasterContext.Provider>
  );
};

export const useProjectMaster = () => {
  const context = useContext(ProjectMasterContext);
  if (!context) {
    throw new Error("useProjectMaster must be used within ProjectMasterProvider");
  }
  return context;
};
