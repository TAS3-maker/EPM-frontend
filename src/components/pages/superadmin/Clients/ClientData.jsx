import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Loader2,
  Users,
  Briefcase,
  DollarSign,
  Clock,
  Mail,
  Phone,
  ChevronLeft,
  Activity,
} from "lucide-react";
import { API_URL } from "../../../utils/ApiConfig";
import { SectionHeader } from "../../../components/SectionHeader";

const ClientData = () => {
  const { client_id } = useParams();
  const navigate = useNavigate();

  const [clientData, setClientData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userRole = localStorage.getItem("user_name");

  /* ================= HELPERS ================= */

  const normalizeStatus = (status = "") =>
    status.toLowerCase().trim();

  /* ================= DYNAMIC COLUMNS ================= */

  const statusColumns = useMemo(() => {
    const map = new Map();

    projects.forEach(project => {
      const rawStatus = project.project_status || "New";
      const key = normalizeStatus(rawStatus);

      if (!map.has(key)) {
        map.set(key, {
          key,
          label: rawStatus,
          projects: [],
        });
      }

      map.get(key).projects.push(project);
    });

    return Array.from(map.values());
  }, [projects]);

  /* ================= API ================= */

  useEffect(() => {
    if (client_id) fetchClientData();
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

      if (result.success && result.client) {
        setClientData(result.client);
        setProjects(Array.isArray(result.projects) ? result.projects : []);
      } else {
        setError("No client data found");
      }
    } catch (err) {
      setError("Failed to fetch client data");
    } finally {
      setLoading(false);
    }
  };

  const handleViewClick = (project_id) => {
    if (project_id) {
      navigate(`/${userRole}/projects/tasks/${project_id}`);
    }
  };

  /* ================= UI STATES ================= */

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !clientData) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600">{error || "Client not found"}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  /* ================= RENDER ================= */

  return (
    <div className="rounded-2xl border bg-white shadow-md max-h-screen overflow-y-auto">

      <SectionHeader
        icon={Users}
        title="Client Details"
        subtitle={`${clientData.client_name} - ${projects.length} Projects`}
        showBack={true}
        showRefresh={true}
        onRefresh={fetchClientData}
      />

      {/* Client Info */}
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

      </div>
    </div>
  </div>

      {/* DYNAMIC KANBAN */}
      <div className="p-5">
        {projects.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            No projects found
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-6">

            {statusColumns.map(column => (
              <div
                key={column.key}
                className="min-w-[280px] bg-white rounded-xl border"
              >
                {/* Column Header */}
                <div className="px-4 py-3 border-b flex justify-between items-center">
                  <span className="text-sm font-bold capitalize">
                    {column.label}
                  </span>
                  <span className="text-xs bg-gray-100 px-2 rounded-full">
                    {column.projects.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="p-3 space-y-3 max-h-[70vh] overflow-y-auto">
                  {column.projects.map(project => (
                    <div
                      key={project.id}
                      onClick={() => handleViewClick(project.id)}
                      className="cursor-pointer bg-white border rounded-lg shadow-sm hover:shadow-md"
                    >
                      <div className="h-1 bg-blue-500 rounded-t" />

                      <div className="p-3">
                        <h4 className="text-sm font-semibold line-clamp-2">
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

                        <div className="flex items-center gap-1 text-[11px] mt-2 text-gray-600">
                          <Activity className="w-3 h-3" />
                          {project.project_tracking === "1"
                            ? "Tracking On"
                            : "Tracking Off"}
                        </div>
                      </div>
                    </div>
                  ))}
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
