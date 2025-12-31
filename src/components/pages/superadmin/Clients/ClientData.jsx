import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Loader2, Users, Briefcase, DollarSign, Clock, TrendingUp, Mail, Phone, 
  ChevronLeft, Activity 
} from "lucide-react";
import { API_URL } from "../../../utils/ApiConfig";
import { SectionHeader } from "../../../components/SectionHeader";
import Pagination from "../../../components/Pagination";

const ClientData = () => {
  const { client_id } = useParams();
  const navigate = useNavigate();
  const [clientData, setClientData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userRole = localStorage.getItem("user_name");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;


  const STATUS_COLUMNS = [
  { key: "new", label: "New" },
  { key: "in progress", label: "In Progress" },
  { key: "ongoing", label: "Ongoing" },
  { key: "completed", label: "Completed" },
  { key: "closed", label: "Closed" },
];

const groupedProjects = useMemo(() => {
  const groups = {};
  STATUS_COLUMNS.forEach(col => (groups[col.key] = []));

  projects.forEach(project => {
    const status = project.project_status?.toLowerCase() || "new";
    if (!groups[status]) groups[status] = [];
    groups[status].push(project);
  });

  return groups;
}, [projects]);

  // ✅ FIXED: Memoized pagination
  const totalPages = useMemo(() => Math.ceil(projects.length / itemsPerPage), [projects]);
  
  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return projects.slice(startIndex, startIndex + itemsPerPage);
  }, [projects, currentPage, itemsPerPage]);

  // ✅ FIXED: Reset page when projects change
  useEffect(() => {
    setCurrentPage(1);
  }, [projects]);

  useEffect(() => {
    if (client_id) {
      fetchClientData();
    }
  }, [client_id]);

  const fetchClientData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("userToken");
      const response = await fetch(
        `${API_URL}/api/get-project-by-clientid?client_id=${client_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      const result = await response.json();
      console.log("API Response:", result);
      
      if (result.success && result.client) {
        setClientData(result.client);
        setProjects(Array.isArray(result.projects) ? result.projects : []);
      } else {
        setError("No client data found");
      }
    } catch (err) {
      setError("Failed to fetch client data");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewClick = (project_id) => {
    if (project_id && project_id !== 'N/A') {
      navigate(`/${userRole}/projects/tasks/${project_id}`);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'in progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6">
        <div className="w-full max-w-7xl mx-auto">
          <SectionHeader 
            icon={Users} 
            title="Client Details" 
            subtitle="Loading..." 
          />
          <div className="flex justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !clientData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 p-4 sm:p-6">
        <div className="w-full max-w-7xl mx-auto">
          <SectionHeader 
            icon={Users} 
            title="Client Details" 
            subtitle="Error loading data" 
          />
          <div className="text-center py-20">
            <div className="bg-red-100 text-red-800 p-8 rounded-2xl mb-6">
              {error || "Client not found"}
            </div>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700"
            >
              ← Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }




  return (
<div className="rounded-2xl border border-gray-200 bg-white shadow-md max-h-screen overflow-y-auto">

  <SectionHeader
    icon={Users}
    title="Client Details"
    subtitle={`${clientData.client_name} - ${projects.length} Project${projects.length !== 1 ? "s" : ""}`}
  />

  {/* Client Info Card */}
  <div className="sm:sticky top-0 z-10">
    <div className="w-full bg-white/80 backdrop-blur-xl rounded-xl border border-white/50 shadow-md p-5">
      <div className="flex flex-col lg:flex-row lg:items-start lg:gap-8">

        <div className="flex flex-col gap-1 flex-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-sm flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold text-gray-900">
              {clientData.client_name}
            </h1>
          </div>

          <div className="flex flex-col md:flex-row gap-2 text-xs mt-2">
            <div className="flex items-center gap-1 px-2 py-2 bg-blue-50 rounded-xl max-w-fit">
              <Mail className="w-3 h-3 text-blue-600" />
              {clientData.client_email}
            </div>
            <div className="flex items-center gap-1 px-2 py-2 bg-green-50 rounded-xl max-w-fit">
              <Phone className="w-3 h-3 text-green-600" />
              {clientData.client_number}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-3 py-2 text-xs bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <button
            onClick={fetchClientData}
            className="px-4 py-2 bg-blue-600 text-xs text-white rounded-xl"
          >
            Refresh
          </button>
        </div>

      </div>
    </div>
  </div>

  {/* Projects Kanban */}
  <div className="p-5">
    <div className="flex items-center gap-3 mb-4">
      <Briefcase className="w-4 h-4 text-indigo-600" />
      <h2 className="text-base font-bold text-gray-900">
        Projects ({projects.length})
      </h2>
    </div>

    {projects.length === 0 ? (
      <div className="text-center py-20">
        <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No projects found</p>
      </div>
    ) : (
      <div className="flex gap-4 overflow-x-auto pb-6">

        {STATUS_COLUMNS.map(column => (
          <div
            key={column.key}
            className="min-w-[280px] bg-white/70 backdrop-blur rounded-xl border border-gray-200"
          >
            {/* Column Header */}
            <div className="px-4 py-3 border-b bg-white/90 rounded-t-xl flex justify-between items-center">
              <span className="text-sm font-bold">{column.label}</span>
              <span className="text-xs bg-gray-100 px-2 rounded-full">
                {groupedProjects[column.key]?.length || 0}
              </span>
            </div>

            {/* Cards */}
            <div className="p-3 space-y-3 max-h-[70vh] overflow-y-auto">
              {groupedProjects[column.key]?.length === 0 ? (
                <div className="text-xs text-gray-400 text-center py-6">
                  No projects
                </div>
              ) : (
                groupedProjects[column.key].map(project => (
                  <div
                    key={project.id}
                    onClick={() => handleViewClick(project.id)}
                    className="cursor-pointer bg-white rounded-lg border shadow-sm hover:shadow-md"
                  >
                    <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-t-lg" />

                    <div className="p-3">
                      <h4 className="text-sm font-semibold text-gray-900 line-clamp-2">
                        {project.project_name}
                      </h4>

                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {project.project_used_hours}h
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          {project.project_used_budget}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-gray-600 mt-2">
                        <Activity className="w-3 h-3" />
                        {project.project_tracking === "1" ? "Tracking On" : "Tracking Off"}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}

      </div>
    )}
  </div>
</div>

  );
};

export default ClientData;




