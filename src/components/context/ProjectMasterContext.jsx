import React, { createContext, useContext, useState, useEffect } from "react";
import { API_URL } from "../utils/ApiConfig";
import { useNavigate } from "react-router-dom";
import { useAlert } from "./AlertContext";

const ProjectMasterContext = createContext();

export const ProjectMasterProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [projectMasters, setProjectMasters] = useState([]);
  const [projectMastersFrontDetails, setProjectMastersFrontDetails] = useState([]);
    const [projectMastersName, setProjectMastersName] = useState([]);
    const [message, setMessage] = useState("");
  const { showAlert } = useAlert();
  const token = localStorage.getItem("userToken");
  const navigate = useNavigate();
    const [projectdetails, setProjectdetails] = useState([]);
const [paginationMeta, setPaginationMeta] = useState({
  current_page: 1,
  last_page: 1,
  total: 0
});

const refreshCurrentPage = async () => {
  const currentParams = { page: paginationMeta.current_page, per_page: 10 };
  await fetchProjectMasterFrontDetails(currentParams.page, currentParams.per_page);
};

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



  const fetchProjectMasterName = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/get-projects-master-name-id
`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (handleUnauthorized(response)) return;
      const data = await response.json();
      if (response.ok) {
        setProjectMastersName(data.data || data || []);
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
  
const fetchProjectMasterFrontDetails = async (page = 1, perPage = 10, filters = {}) => {
  setIsLoading(true);
  try {
    // ✅ BUILD QUERY STRING
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      ...(filters.search && { search: filters.search }),
      ...(filters.search_by  && { search_by: filters.search_by  })
    });
    
    // ✅ USE QUERY PARAMS IN URL
    const url = `${API_URL}/api/get-projects-master-details?${params.toString()}`;
    console.log("🔗 API URL:", url); // Debug
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (handleUnauthorized(response)) return;
    const data = await response.json();
    
    if (response.ok && data.success) {
      setProjectMastersFrontDetails(data.data.data || []);
      setPaginationMeta({
        current_page: data.data.current_page,
        last_page: data.data.last_page,
        total: data.data.total
      });
      console.log("✅ Page loaded:", data.data.current_page, "Data:", data.data.data.length);
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
    
    
    if (!projectData.project_name?.trim() || !projectData.client_id || !projectData.sales_person_id) {
      showAlert({ variant: "warning", title: "Missing Fields", message: "Project name and client and SalesPerson ID are required." });
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
      offline_hours:projectData.offline_hours || "0",
      project_status: projectData.project_status || "In Progress",
      project_description: projectData.project_description || "",
      project_budget: projectData.project_budget || "0",
      project_hours: projectData.project_hours || "0",
       project_estimation_by: projectData.project_estimation_by ? parseInt(projectData.project_estimation_by) : null, 
       project_call_by: projectData.project_call_by ? parseInt(projectData.project_call_by) : null, 
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
        await refreshCurrentPage(); 
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
await refreshCurrentPage();
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
        await refreshCurrentPage();
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
        Authorization: `Bearer ${token}`,
      },
    });

    if (handleUnauthorized(response)) return;

    const res = await response.json();

    if (response.ok) {
      setProjectdetails({
        project: res.project || {},
        relation: res.relation || {},
      });
    } else {
      setMessage("Failed to fetch project.");
    }
  } catch (error) {
    setMessage("An error occurred while fetching project.");
  } finally {
    setIsLoading(false);
  }
};




  useEffect(() => {
    fetchProjectMasters();
 fetchProjectMasterFrontDetails(1, 10); 
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
    fetchProjectsbyId,
    fetchProjectMasterName,
    projectMastersName,
    setProjectMastersName,
    setProjectMastersFrontDetails,
    projectMastersFrontDetails,
    fetchProjectMasterFrontDetails,
    paginationMeta,
     totalPages: paginationMeta.last_page || 1 
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
