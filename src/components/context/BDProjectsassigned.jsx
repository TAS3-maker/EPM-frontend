import { createContext, useContext, useEffect, useState,useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../utils/ApiConfig";
import axios from "axios";
import { useAlert } from "./AlertContext";
const BDProjectsAssignedContext = createContext();
export const BDProjectsAssignedProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [projects, setProjects] = useState([]);
  const [searchdata, setSearchdata] = useState(null);
  const [projectManagers, setProjectManagers] = useState([]);
  const [assignedData, setAssignedData] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [performanceData1, setPerformanceData1] = useState([]);
  const [pendingPerformanceData, pendingsetPerformanceData] = useState(null);
  const [filterProjects, setFilterProjects] = useState(null);
  const [myproject, setMyproject] = useState(null);
  const [myproject1, setMyproject1] = useState(null);
  const [pendingPerformance, setPendingPerformance] = useState(null);
  const [draftPerformanceData, setDraftPerformanceData] = useState([]);
  const [standupPerformanceData, setStandupPerformanceData] = useState([]);
  const [savedEntries, setSavedEntries] = useState([]);
const [loadingDrafts, setLoadingDrafts] = useState(false);
const [selectedUserStack, setSelectedUserStack] = useState([]); 

// const userid = Number(localStorage.getItem("user_id"));

const [currentUserId, setCurrentUserId] = useState(null);
const [userTree, setUserTree] = useState(null);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("userToken");
    const { showAlert } = useAlert(); 
  const navigate = useNavigate();
const [paginationMeta,setPaginationMeta]=useState({
last_page:1,
  current_page:1,
  total:0
  
})
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


const searchfilter = async () => {
  setIsLoading(true);
  try {
    const response = await fetch(`${API_URL}/api/get-rm-hierarchy`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    const result = await response.json();

    if (response.ok) {
      setUserTree(result.data);
      setSelectedUserStack([]);
      setCurrentUserId(result.data.user_id ?? null);
    }
  } finally {
    setIsLoading(false);
  }
};



const fetchPendingPerformance = async ({
  startDate = "",
  endDate = "",
  page = 1,
  per_page = 10,
  status 
} = {}) => {
  setIsLoading(true);
  try {
    const response = await axios.get(
      `${API_URL}/api/get-all-pending-performa-sheets`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        params: {
          start_date: startDate || undefined,
          end_date: endDate || undefined,
          page,
          per_page,
          status
        },
      }
    );

    console.log("✅ API Response:", response.data);

    setPendingPerformance(response.data.data);
    
    // ✅ FIXED PAGINATION
    setPaginationMeta({
      current_page: response?.data?.pagination?.current_page,
      last_page: response?.data?.pagination?.last_page,    // 👈 total_pages!
      total: response?.data?.pagination?.total_packets ,
      per_page: response?.data?.pagination?.per_page 
    });

  } catch (error) {
    console.error("❌ Error:", error);
    setPaginationMeta({ current_page: 1, last_page: 1, total: 0, per_page: 10 });
  } finally {
    setIsLoading(false);
  }
};


const fetchPerformanceDetailsmanage = async ( start_date = "", end_date = "",page=1,
      per_page=10,status, search = "", search_by = "name" ) => {
  setIsLoading(true);
  try {
    const params = {
     
      ...(start_date ? { start_date } : {}),
      ...(end_date ? { end_date } : {}),
      page,
      per_page,
       ...(status && status !=="all" ? {status}:{} ),
        search, 
        search_by  // ✅ Send search_by param
    };

    const response = await axios.get(`${API_URL}/api/get-all-performa-sheets`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      params,
    });
    setPerformanceData1(response.data);
    setPaginationMeta({
      current_page: response?.data?.pagination?.current_page || 1,
      last_page: response?.data?.pagination?.last_page || 1,
      total: response?.data?.pagination?.total_packets || 0,
      per_page: response?.data?.pagination?.per_page || 10
    });

  } catch (error) {
    console.error("Error fetching performance details:", error);
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
const fetchPerformanceDetails = async (
  current_user_id = null,
  start_date,
  end_date,
  page,
  per_page,
  status,
    searchQuery,
          searchBy
) => {
  setIsLoading(true);
  try {
    const params = {
      ...(current_user_id ? { current_user_id } : {}),
      ...(start_date ? { start_date } : {}),
      ...(end_date ? { end_date } : {}),
     
      page,
      per_page,
      ...(status && status !=="all" ? {status}:{} ),
      search:searchQuery,
          search_by:searchBy
    };

    console.log("📡 API params:", params);

    const response = await axios.get(
      `${API_URL}/api/get-sheets-for-reporting-manager`,
      {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    setPerformanceData(response.data);
  } catch (error) {
    console.error("Error fetching performance details:", error);
  } finally {
    setIsLoading(false);
  }
};

const fetchPendingPerformanceDetails = async (
  current_user_id = null,
  start_date = null,
  end_date = null,
  page = 1,   
  per_page = 10 ,
  status ,
  searchQuery,
    searchBy
) => {
  setIsLoading(true);
  try {
    const params = {
      ...(current_user_id ? { current_user_id } : {}),
      ...(start_date ? { start_date } : {}),
      ...(end_date ? { end_date } : {}),
      page,           
      per_page   ,
      status   ,   
        searchQuery,
    searchBy
    };

    const response = await axios.get(
      `${API_URL}/api/get-pending-sheets-for-reporting-manager`,
      { params, headers: { Authorization: `Bearer ${token}` } }
    );

    pendingsetPerformanceData(response.data.data);
    
    // ✅ ADD PAGINATION
    setPaginationMeta({
      current_page: response?.data?.pagination?.current_page || 1,
      last_page: response?.data?.pagination?.last_page || 1,
      total: response?.data?.pagination?.total_packets || 0,
      per_page: response?.data?.pagination?.per_page || 10
    });
  } catch (error) {
    console.error("Error:", error);
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
  
  const filterbyproject = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/get-assigned-projects-master-of-user`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (handleUnauthorized(response)) return;
      const data = await response.json();
      if (response.ok) {
        setFilterProjects(data.data || []);
      } else {
        setMessage("Failed to fetch projects.");
      }
    } catch (error) {
      setMessage("An error occurred while fetching projects.");
    } finally {
      setIsLoading(false);
    }
  };


const filtermyproject = async ({
  project_id = null,
  current_user_id = null,
  start_date,
  end_date,
  page = 1,        // ✅ ADD
  per_page = 10  ,  // ✅ ADD
   status 
}) => {
  setIsLoading(true);
  try {
    const params = {
      ...(project_id ? { project_id } : {}),
      ...(current_user_id ? { current_user_id } : {}),
      ...(start_date ? { start_date } : {}),
      ...(end_date ? { end_date } : {}),
      page,           // ✅ ADD
      per_page   ,     // ✅ ADD
      status
    };

    const response = await axios.get(
      `${API_URL}/api/get-pending-performa-sheets-by-project-master-id`,
      { params, headers: { Authorization: `Bearer ${token}` } }
    );

    setMyproject(response.data.data);
    
    // ✅ ADD PAGINATION
    setPaginationMeta({
      current_page: response?.data?.pagination?.current_page || 1,
      last_page: response?.data?.pagination?.last_page || 1,
      total: response?.data?.pagination?.total_packets || 0,
      per_page: response?.data?.pagination?.per_page || 10
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    setIsLoading(false);
  }
};

const filtermyproject1 = async ({
  project_id = null,
  current_user_id = null,
  start_date,
  end_date,
  page,
  per_page,
  status,
  searchQuery="",
  search_by

}) => {
  setIsLoading(true);
  try {
    const params = {
      ...(project_id ? { project_id } : {}),
      ...(current_user_id ? { current_user_id } : {}),
      ...(start_date ? { start_date } : {}),
      ...(end_date ? { end_date } : {}),
      page,
      per_page,
      ...(status && status !=="all" ? {status}:{} ),
      search:searchQuery,
  search_by
    };

    console.log("📡 API params:", params);

    const response = await axios.get(
      `${API_URL}/api/get-performa-sheets-by-project-master-id`,
      {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setMyproject1(response.data);
  } catch (error) {
    console.error("Error fetching project sheets:", error);
  } finally {
    setIsLoading(false);
  }
};



const fetchDraftPerformanceDetails = async ({
  status,
  is_fillable,
} = {}) => {
  setLoadingDrafts(true);  

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
        tracking_id: sheet.tracking_id ?? "",
not_tracked_reason: sheet.not_tracked_reason ?? "", 
       is_fillable: sheet.is_fillable ?? 1,    
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
              ids: Array.isArray(id) ? id : [id],
              status: "approved"
          })
      });

      // console.log("Status:", response.status);
      // console.log("Content-Type:", response.headers.get("Content-Type"));

      // Only attempt to parse JSON if it's valid JSON (i.e., not HTML)
      let responseData = null;
      try {
          responseData = await response.json();
      } catch (parseErr) {
          // Log if response cannot be parsed as JSON (likely an HTML error page)
          const fallbackText = await response.text();
          console.error("Failed to parse JSON. Response was:", fallbackText);
          showAlert({
              variant: "error",
              title: "Error",
              message: "Error parsing response. Check console for details."
          });
          return; // Exit early if there's a parse error
      }

      // Check if the request was successful
      if (response.ok) {
          setPerformanceSheets(prevSheets =>
              prevSheets.map(sheet =>
                  sheet.id === id ? { ...sheet, status: "approved" } : sheet
              )
          );
          showAlert({ variant: "success", title: "Success", message: "Performance sheet approved" });
                    

      } else {
          console.error("Approve failed with response:", responseData);
          showAlert({
              variant: "error",
              title: "Error",
              message: responseData?.message || "Failed to approve. See console for details."
          });
      }
  } catch (err) {
      console.error("Network or JS error:", err);
      showAlert({
          variant: "error",
          title: "Error",
          message: err?.message || "Something went wrong"
      });
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
         ids: Array.isArray(id) ? id : [id],
              status: "rejected"
          })
      });





      // console.log("Status:", response.status);
      // console.log("Content-Type:", response.headers.get("Content-Type"));

      let responseData = null;
      try {
          responseData = await response.json();
           fetchAssigned();
      } catch (parseErr) {
          const fallbackText = await response.text();
          console.error("Failed to parse JSON. Response was:", fallbackText);
          showAlert({
              variant: "error",
              title: "Error",
              message: "Error parsing response. Check console for details."
          });
          return; // Exit early if there's a parse error
      }

      if (response.ok) {
          setPerformanceSheets(prevSheets =>
              prevSheets.map(sheet =>
                  sheet.id === id ? { ...sheet, status: "rejected" } : sheet
              )
          );
          showAlert({ variant: "success", title: "Success", message: "Performance sheet Rejected" });
                      fetchPerformanceDetailsmanage();

      } else {
          console.error("Reject failed with response:", responseData);
          showAlert({
              variant: "error",
              title: "Error",
              message: responseData?.message || "Failed to reject. See console for details."
          });
      }
  } catch (error) {
      console.error("Network or JS error:", error);
      showAlert({
          variant: "error",
          title: "Error",
          message: error?.message || "Something went wrong"
      });
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
    // fetchPerformanceDetails();
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
      pendingPerformance,
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
      performanceData1,
      savedEntries,
      setSavedEntries,
            fetchStandupPerformanceDetails,
            fetchPerformanceDetailsmanage,
            paginationMeta,
      standupPerformanceData,
      setStandupPerformanceData,
      searchfilter,
      searchdata,
      setSavedEntries,
      setSelectedUserStack,
      selectedUserStack,
      setCurrentUserId,
      currentUserId,
      setUserTree,
      userTree,
      fetchPendingPerformance,
      pendingPerformance,
      filterbyproject,
      filterProjects,
      filtermyproject,
      setMyproject,
      setMyproject1,
      myproject,
      myproject1,
      filtermyproject1
    }}>
      {children}
    </BDProjectsAssignedContext.Provider>
  );
};
export const useBDProjectsAssigned = () => {
  return useContext(BDProjectsAssignedContext);
};
