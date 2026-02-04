import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../utils/ApiConfig";
import axios from "axios";
import { useAlert } from "./AlertContext";
const BDProjectsAssignedContext = createContext();
export const BDProjectsAssignedProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [projects, setProjects] = useState([]);
  const [projectManagers, setProjectManagers] = useState([]);
  const [assignedData, setAssignedData] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [pendingPerformanceData, pendingsetPerformanceData] = useState([]);
  const [draftPerformanceData, setDraftPerformanceData] = useState([]);
  const [standupPerformanceData, setStandupPerformanceData] = useState([]);
  const [savedEntries, setSavedEntries] = useState([]);
const [loadingDrafts, setLoadingDrafts] = useState(false);

  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("userToken");
    const { showAlert } = useAlert(); 
  const navigate = useNavigate();
  
  const [performanceSheets, setPerformanceSheets] = useState([]);
  const handleUnauthorized = (response) => {
    if (response.status === 401) {
      localStorage.removeItem("userToken");
      navigate("/");
      return true;
    }
    return false;
  };
  const fetchAssigned = async () => {
    setIsLoading(true);
    try {
        const response = await axios.get(`${API_URL}/api/assigned-all-projects`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        // console.log("Assigned Projects Response:", response.data);
        setAssignedData(response.data.data);
    } catch (error) {
        console.error("Error fetching assigned projects:", error);
    } finally {
        setIsLoading(false);
    }
};

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/projects`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` },
      });
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

  const fetchProjectManagers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/projectManager`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (handleUnauthorized(response)) return;
      const data = await response.json();
      if (response.ok) {
        setProjectManagers(data.data || []);
      } else {
        setMessage("Failed to fetch project managers.");
      }
    } catch (error) {
      setMessage("An error occurred while fetching project managers.");
    }
  };

  const assignProject = async (projectId, managerIds,) => {
    setIsLoading(true);
    setMessage("");
    // console.log("Assigning project:", projectId, "to managers:", managerIds);
    try {
        const response = await fetch(`${API_URL}/api/assign-project-manager`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({
                project_id: projectId,
                project_manager_ids: managerIds

            }),
        });
        // console.log("Response Status:", response.status);
        const data = await response.json();
        fetchAssigned();
        // console.log("Response Data:", data);
        if (handleUnauthorized(response)) return;
        if (response.ok) {
            showAlert({ variant: "success", title: "Success", message: "Project assigned successfully!" });
        } else {
            showAlert({ variant: "error", title: "Error", message: "Something went wrong!" });
        }
    } catch (error) {

        showAlert({ variant: "error", title: "Error", message: "Failed to assign project. Please try again." });
    } finally {
        setIsLoading(false);
    }
};
const fetchPerformanceDetails = async (status = null) => {
  setIsLoading(true);
  try {
    const response = await axios.get(`${API_URL}/api/get-all-performa-sheets`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      params: status ? { status } : {},
    });
    setPerformanceData(response.data.data);
  } catch (error) {
    console.error("Error fetching performance details:", error);
  } finally {
    setIsLoading(false);
  }
};
const fetchStandupPerformanceDetails = async ({
  date,
  start_date,
  end_date,
} = {}) => {
  setIsLoading(true);

  try {
    let params = {};

    if (date) {
      params = { date };
    }

    else if (start_date && end_date) {
      params = { start_date, end_date };
    }

    const response = await axios.get(
      `${API_URL}/api/get-all-standup-performa-sheets-admin`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params,
      }
    );

    setStandupPerformanceData(response.data?.data || []);
  } catch (error) {
    console.error("Error fetching performance details:", error);
  } finally {
    setIsLoading(false);
  }
};
  
const fetchPendingPerformanceDetails = async (current_user_id = null) => {
    setIsLoading(true);

    try {
        const params = current_user_id ? { current_user_id } : {};

        const response = await axios.get(
            `${API_URL}/api/get-pending-sheets-for-reporting-manager`,
            {
                params,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        pendingsetPerformanceData(response);
    } catch (error) {
        console.error("Error fetching performance details:", error);
    } finally {
        setIsLoading(false);
    }
};


const fetchDraftPerformanceDetails = async ({
  status,
  is_fillable,
} = {}) => {
  setLoadingDrafts(true);   // ✅ replaced

  try {
    const response = await axios.get(
      `${API_URL}/api/get-all-draft-performa-sheets`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        params: {
          ...(status !== undefined && { status }),
          ...(is_fillable !== undefined && { is_fillable }),
        },
      }
    );

console.log("Draft Performance Response:", response.data.data);
const users = Array.isArray(response.data?.data)
  ? response.data.data
  : [];

const flatDrafts = users.flatMap(user =>
  Array.isArray(user.sheets)
    ? user.sheets.map(sheet => ({
        id: sheet.id,
        date: sheet.date,
        projectId: sheet.project_id,
        taskId: sheet.task_id,
        hoursSpent: sheet.time,
        notes: sheet.narration,
        status: sheet.work_type,
        is_tracking: sheet.is_tracking ?? "no",
        tracking_mode: sheet.tracking_mode ?? "all",
        tracked_hours: sheet.tracked_hours ?? "",
      }))
    : []
);
console.log("Flattened Draft Sheets:", flatDrafts);
setSavedEntries(flatDrafts);


    setDraftPerformanceData(response.data.data);
  } catch (error) {
    console.error("Error fetching performance details:", error);
  } finally {
    setLoadingDrafts(false);   // ✅ replaced
  }
};



const approvePerformanceSheet = async (id) => {
  try {
    const response = await fetch(`${API_URL}/api/get-approval-performa-sheets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        ids: [id],
        status: "approved"
      })
    });

    let responseData = null;

    try {
      responseData = await response.json();
    } catch {
      // ignore empty body
    }

    if (!response.ok) {
      showAlert({
        variant: "error",
        title: "Error",
        message: responseData?.message || "Failed to approve"
      });

      return { success: false };   // ⭐⭐⭐ CRITICAL FIX
    }

    setPerformanceSheets(prev =>
      prev.map(sheet =>
        sheet.id === id ? { ...sheet, status: "approved" } : sheet
      )
    );

    showAlert({
      variant: "success",
      title: "Success",
      message: "Performance sheet approved"
    });

    return { success: true };   // ⭐⭐⭐ CRITICAL FIX

  } catch (err) {
    console.error("Approve error:", err);

    showAlert({
      variant: "error",
      title: "Error",
      message: err?.message || "Something went wrong"
    });

    return { success: false };   // ⭐⭐⭐ CRITICAL FIX
  }
};

const rejectPerformanceSheet = async (id) => {
  try {
    const response = await fetch(`${API_URL}/api/get-approval-performa-sheets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        ids: [id],
        status: "rejected"
      })
    });

    let responseData = null;

    try {
      responseData = await response.json();
      fetchAssigned();
    } catch {}

    if (!response.ok) {
      showAlert({
        variant: "error",
        title: "Error",
        message: responseData?.message || "Failed to reject"
      });

      return { success: false };  // ⭐⭐⭐ FIX
    }

    setPerformanceSheets(prev =>
      prev.map(sheet =>
        sheet.id === id ? { ...sheet, status: "rejected" } : sheet
      )
    );

    showAlert({
      variant: "success",
      title: "Success",
      message: "Performance sheet rejected"
    });

    return { success: true };   // ⭐⭐⭐ FIX

  } catch (error) {
    console.error("Reject error:", error);

    showAlert({
      variant: "error",
      title: "Error",
      message: error?.message || "Something went wrong"
    });

    return { success: false };   // ⭐⭐⭐ FIX
  }
};


const removeProjectManagers = async (project_id, manager_ids) => {
  try {
    setLoading(true);
    const response = await fetch(`${API_URL}/api/remove-project-managers`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Pass the Bearer token
      },
      body: JSON.stringify({ project_id, manager_ids }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to remove managers");
    fetchAssigned();
    return data;
  } catch (error) {
    console.error("Error removing project managers:", error);
    return { success: false, message: error.message };
  } finally {
    setLoading(false);
  }
};
  useEffect(() => {
    fetchProjects();
    fetchProjectManagers();
    fetchPerformanceDetails();
  }, []);

 

  return (     
    <BDProjectsAssignedContext.Provider value={{ 
      projects, 
      projectManagers, 
      isLoading, 
      assignedData,
      performanceData,
      assignProject,
      fetchAssigned, 
      pendingPerformanceData,
      pendingsetPerformanceData,
      fetchPerformanceDetails,
      performanceSheets, 
      fetchPendingPerformanceDetails,
      approvePerformanceSheet, 
      rejectPerformanceSheet,
      removeProjectManagers,
      fetchDraftPerformanceDetails,
      message,
      draftPerformanceData,
      setLoadingDrafts,
      savedEntries,
      setSavedEntries,
            fetchStandupPerformanceDetails,
      standupPerformanceData,
      setStandupPerformanceData
    }}>
      {children}
    </BDProjectsAssignedContext.Provider>
  );
};
export const useBDProjectsAssigned = () => {
  return useContext(BDProjectsAssignedContext);
};
