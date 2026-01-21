import React, { createContext, useContext, useState, useEffect } from "react";
import { API_URL } from "../utils/ApiConfig";
import { useNavigate } from "react-router-dom";
import { useAlert } from "./AlertContext";

const ProjectSourceContext = createContext();

export const ProjectSourceProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [projectSources, setProjectSources] = useState([]);
  
  const { showAlert } = useAlert();
  const token = localStorage.getItem("userToken");
  const navigate = useNavigate();

  const handleUnauthorized = (response) => {
    if (response.status === 401) {
      localStorage.removeItem("userToken");
      navigate("/");
      return true;
    }
    return false;
  };

  const addProjectSource = async (sourceName) => {
    if (!sourceName || sourceName.trim() === "") {
      showAlert({ variant: "warning", title: "Missing Field", message: "Please enter source name." });
      return;
    }

    setIsLoading(true);
    
    const requestBody = {
      source_name: sourceName.trim()
    };

    try {
      const response = await fetch(`${API_URL}/api/project-sources`, {
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
        showAlert({ variant: "success", title: "Success", message: "Project source added successfully!" });
        fetchProjectSources();
      } else {
        showAlert({ variant: "error", title: "Error", message: data.message || "Failed to add project source." });
      }
    } catch (error) {
      console.error("Add project source error:", error);
      showAlert({ variant: "error", title: "Error", message: error?.message || "An error occurred while adding project source." });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProjectSources = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/project-sources`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (handleUnauthorized(response)) return;

      const data = await response.json();

      if (response.ok) {
        setProjectSources(data.data || []);
      } else {
        showAlert({ variant: "error", title: "Error", message: "Failed to fetch project sources." });
      }
    } catch (error) {
      console.error("Fetch project sources error:", error);
      showAlert({ variant: "error", title: "Error", message: "An error occurred while fetching project sources." });
    } finally {
      setIsLoading(false);
    }
  };

  const editProjectSource = async (id, sourceName) => {
    if (!sourceName || sourceName.trim() === "") {
      showAlert({ variant: "warning", title: "Missing Field", message: "Please enter source name." });
      return;
    }

    setIsLoading(true);

    const requestBody = {
      source_name: sourceName.trim()
    };

    try {
      const response = await fetch(`${API_URL}/api/project-sources/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (handleUnauthorized(response)) return;

      const data = await response.json();

      if (response.ok) {
        showAlert({ variant: "success", title: "Success", message: "Project source updated successfully!" });
        fetchProjectSources();
      } else {
        showAlert({ variant: "error", title: "Error", message: data.message || "Failed to update project source." });
      }
    } catch (error) {
      console.error("Edit project source error:", error);
      showAlert({ variant: "error", title: "Error", message: "An error occurred while updating project source." });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProjectSource = async (id) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/project-sources/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (handleUnauthorized(response)) return;

      if (response.ok) {
        showAlert({ variant: "success", title: "Success", message: "Project source deleted successfully!" });
        setProjectSources((prevSources) => prevSources.filter((source) => source.id !== id));
      } else {
        showAlert({ variant: "error", title: "Error", message: "Failed to delete project source." });
      }
    } catch (error) {
      console.error("Delete project source error:", error);
      showAlert({ variant: "error", title: "Error", message: "An error occurred while deleting project source." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectSources();
  }, []);

  const value = {
    addProjectSource,
    fetchProjectSources,
    editProjectSource,
    deleteProjectSource,
    projectSources,
    isLoading
  };

  return (
    <ProjectSourceContext.Provider value={value}>
      {children}
    </ProjectSourceContext.Provider>
  );
};

export const useProjectSource = () => useContext(ProjectSourceContext);
