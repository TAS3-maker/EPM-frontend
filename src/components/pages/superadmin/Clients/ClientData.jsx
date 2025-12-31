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
      {/* FULL WIDTH CONTAINER */}
      
        {/* Section Header - FULL WIDTH */}
        
          <SectionHeader
            icon={Users}
            title="Client Details"
            subtitle={`${clientData.client_name} - ${projects.length} Project${projects.length !== 1 ? 's' : ''}`}
          />
       

        {/* Client Info Card - FULL WIDTH */}
        <div className=" sm:sticky top-0 z-10">
          <div className="w-full bg-white/80 backdrop-blur-xl rounded-xl border border-white/50 shadow-md p-5">
            <div className="flex flex-col lg:flex-row lg:items-start lg:gap-8">
              {/* Client Avatar & Basic Info */}
              <div className="flex flex-col md:flex-row items-center gap-2 mb-8 lg:mb-0 flex-1 w-full">
               <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-sm flex items-center justify-center shadow-xl flex-shrink-0">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-lg font-bold text-gray-900">
                    {clientData.client_name}
                  </h1>
                </div>
                <div className="flex-1 min-w-0 w-full">
                  {/* <h1 className="text-lg font-bold text-gray-900 mb-2">
                    {clientData.client_name}
                  </h1> */}
                  <div className="flex flex-col md:flex-row gap-2 text-xs w-full">
                    <div className="flex items-center gap-1 px-2 py-1.5 bg-blue-50 rounded-xl w-full max-w-fit">
                      <Mail className="w-3 h-3 text-blue-600" />
                      <span className="font-medium text-gray-900">{clientData.client_email}</span>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1.5 bg-green-50 rounded-xl w-full max-w-fit">
                      <Phone className="w-3 h-3 text-green-600" />
                      <span className="font-medium text-gray-900">{clientData.client_number}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 w-auto">
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 px-3 py-2 text-xs bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold rounded-2xl hover:shadow-xl transition-all w-auto"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back to Clients
                </button>
                <button
                  onClick={fetchClientData}
                  className="px-4 py-2 bg-blue-600 text-xs text-start text-white font-semibold rounded-2xl hover:bg-blue-700 transition-all w-auto"
                >
                  Refresh Data
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Section - FULL WIDTH */}
        <div className="flex-1 overflow-hidden">
          <div className="w-full min-h-screen overflow-y-auto bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <Briefcase className="w-4 h-4 text-indigo-600" />
              <h2 className="text-base font-bold text-gray-900">
                Projects ({projects.length})
              </h2>
            </div>

            {projects.length === 0 ? (
              <div className="text-center py-20 w-full">
                <div className="w-32 h-32 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Briefcase className="w-16 h-16 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">No Projects</h3>
                <p className="text-gray-600 text-lg mb-8">This client has no projects yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-6 gap-2 mb-6">
                {paginatedProjects.map((project) => (  // ✅ Use paginatedProjects
                  <div
                    key={project.id}
                    onClick={() => handleViewClick(project.id)}
                    className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"  // ✅ Smaller cards
                  >
                   <div className="relative cursor-pointer">
                    <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                    <div className="py-4 px-3">
                    {/* Project Header */}
                    {/* <div className="flex items-start justify-between pb-1 border-b border-gray-100">
                      <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                        <TrendingUp className="w-4 h-4 text-white" />
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getStatusColor(project.project_status)}`}>
                        {project.project_status}
                      </span>
                    </div> */}

                    {/* Project Name */}
                    <h3 className="text-base font-bold text-gray-900 line-clamp-2 group-hover:text-indigo-700 transition-colors text-sm">
                      {project.project_name}
                    </h3>

                    {/* Project Stats Grid */}
                    {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3 w-full">
                      <div className="flex items-start gap-2 p-2 bg-gray-50 group-hover:bg-blue-50 transition-colors duration-300 backdrop-blur-sm rounded-lg border border-gray-100/50 w-full">
                        <DollarSign className="w-3 h-3 text-green-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Budget</p>
                          <p className="font-bold text-sm">${project.project_budget}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 p-2 bg-gray-50 group-hover:bg-blue-50 transition-colors duration-300 backdrop-blur-sm rounded-lg border border-gray-100/50 w-full">
                        <DollarSign className="w-3 h-3 text-red-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Used Budget</p>
                          <p className="font-bold text-sm">${project.project_used_budget}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 p-2 bg-gray-50 group-hover:bg-blue-50 transition-colors duration-300 backdrop-blur-sm rounded-lg border border-gray-100/50 w-full">
                        <Clock className="w-3 h-3 text-blue-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Total Hours</p>
                          <p className="font-bold text-sm">{project.project_hours}h</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 p-2 bg-gray-50 group-hover:bg-blue-50 transition-colors duration-300 backdrop-blur-sm rounded-lg border border-gray-100/50 w-full">
                        <Clock className="w-3 h-3 text-orange-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Used Hours</p>
                          <p className="font-bold text-sm">{project.project_used_hours}h</p>
                        </div>
                      </div>
                    </div> */}

                    {/* Project Footer */}
                    {/* <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs w-full">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Activity className="w-3 h-3" />
                        <span>Tracking: {project.project_tracking === "1" ? "Active" : "Inactive"}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600 font-semibold">
                        <TrendingUp className="w-3 h-3" />
                        <span>Activity: {project.project_tag_activity}</span>
                      </div>
                    </div> */}
                   </div>
                   </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ✅ FIXED: Pagination with proper condition */}
          {totalPages > 1 && (
            <div className="px-4 sm:px-6 lg:px-8 pt-8 pb-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      
    </div>
  );
};

export default ClientData;





// import React, { useState, useEffect, useMemo } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { 
//   Loader2, Users, Briefcase, DollarSign, Clock, TrendingUp, Mail, Phone, 
//   ChevronLeft, Activity 
// } from "lucide-react";
// import { API_URL } from "../../../utils/ApiConfig";
// import { SectionHeader } from "../../../components/SectionHeader";
// import Pagination from "../../../components/Pagination";

// const ClientData = () => {
//   const { client_id } = useParams();
//   const navigate = useNavigate();
//   const [clientData, setClientData] = useState(null);
//   const [projects, setProjects] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const userRole = localStorage.getItem("user_name");
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 8;

//   // ✅ FIXED: Memoized pagination
//   const totalPages = useMemo(() => Math.ceil(projects.length / itemsPerPage), [projects]);
  
//   const paginatedProjects = useMemo(() => {
//     const startIndex = (currentPage - 1) * itemsPerPage;
//     return projects.slice(startIndex, startIndex + itemsPerPage);
//   }, [projects, currentPage, itemsPerPage]);

//   // ✅ FIXED: Reset page when projects change
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [projects]);

//   useEffect(() => {
//     if (client_id) {
//       fetchClientData();
//     }
//   }, [client_id]);

//   const fetchClientData = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const token = localStorage.getItem("userToken");
//       const response = await fetch(
//         `${API_URL}/api/get-project-by-clientid?client_id=${client_id}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
      
//       const result = await response.json();
//       console.log("API Response:", result);
      
//       if (result.success && result.client) {
//         setClientData(result.client);
//         setProjects(Array.isArray(result.projects) ? result.projects : []);
//       } else {
//         setError("No client data found");
//       }
//     } catch (err) {
//       setError("Failed to fetch client data");
//       console.error("Fetch error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleViewClick = (project_id) => {
//     if (project_id && project_id !== 'N/A') {
//       navigate(`/${userRole}/projects/tasks/${project_id}`);
//     }
//   };

//   const getStatusColor = (status) => {
//     switch (status?.toLowerCase()) {
//       case 'in progress': return 'bg-yellow-100 text-yellow-800';
//       case 'completed': return 'bg-green-100 text-green-800';
//       case 'cancelled': return 'bg-red-100 text-red-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6">
//         <div className="w-full max-w-7xl mx-auto">
//           <SectionHeader 
//             icon={Users} 
//             title="Client Details" 
//             subtitle="Loading..." 
//           />
//           <div className="flex justify-center py-20">
//             <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error || !clientData) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 p-4 sm:p-6">
//         <div className="w-full max-w-7xl mx-auto">
//           <SectionHeader 
//             icon={Users} 
//             title="Client Details" 
//             subtitle="Error loading data" 
//           />
//           <div className="text-center py-20">
//             <div className="bg-red-100 text-red-800 p-8 rounded-2xl mb-6">
//               {error || "Client not found"}
//             </div>
//             <button
//               onClick={() => navigate(-1)}
//               className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700"
//             >
//               ← Go Back
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-0 sm:p-4">
//       {/* FULL WIDTH CONTAINER */}
//       <div className="w-full">
//         {/* Section Header - FULL WIDTH */}
//         <div className="px-4 sm:px-6 lg:px-8">
//           <SectionHeader
//             icon={Users}
//             title="Client Details"
//             subtitle={`${clientData.client_name} - ${projects.length} Project${projects.length !== 1 ? 's' : ''}`}
//           />
//         </div>

//         {/* Client Info Card - FULL WIDTH */}
//         <div className="px-4 sm:px-6 lg:px-8 mb-8">
//           <div className="w-full bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl p-8">
//             <div className="flex flex-col lg:flex-row lg:items-start lg:gap-8">
//               {/* Client Avatar & Basic Info */}
//               <div className="flex flex-col lg:flex-row lg:items-center gap-6 mb-8 lg:mb-0 flex-1 w-full">
//                 <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0">
//                   <Users className="w-12 h-12 text-white" />
//                 </div>
//                 <div className="flex-1 min-w-0 w-full">
//                   <h1 className="text-4xl font-bold text-gray-900 mb-2">
//                     {clientData.client_name}
//                   </h1>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm w-full">
//                     <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl w-full">
//                       <Mail className="w-5 h-5 text-blue-600" />
//                       <span className="font-medium text-gray-900">{clientData.client_email}</span>
//                     </div>
//                     <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl w-full">
//                       <Phone className="w-5 h-5 text-green-600" />
//                       <span className="font-medium text-gray-900">{clientData.client_number}</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Action Buttons */}
//               <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
//                 <button
//                   onClick={() => navigate(-1)}
//                   className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold rounded-2xl hover:shadow-xl transition-all w-full lg:w-auto"
//                 >
//                   <ChevronLeft className="w-5 h-5" />
//                   Back to Clients
//                 </button>
//                 <button
//                   onClick={fetchClientData}
//                   className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-2xl hover:bg-blue-700 transition-all w-full lg:w-auto"
//                 >
//                   Refresh Data
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Projects Section - FULL WIDTH */}
//         <div className="px-4 sm:px-6 lg:px-8">
//           <div className="w-full bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl p-8">
//             <div className="flex items-center gap-3 mb-8">
//               <Briefcase className="w-10 h-10 text-indigo-600" />
//               <h2 className="text-3xl font-bold text-gray-900">
//                 Projects ({projects.length})
//               </h2>
//             </div>

//             {projects.length === 0 ? (
//               <div className="text-center py-20 w-full">
//                 <div className="w-32 h-32 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
//                   <Briefcase className="w-16 h-16 text-gray-400" />
//                 </div>
//                 <h3 className="text-2xl font-bold text-gray-800 mb-3">No Projects</h3>
//                 <p className="text-gray-600 text-lg mb-8">This client has no projects yet.</p>
//               </div>
//             ) : (
//               <div className="w-full grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
//                 {paginatedProjects.map((project) => (  // ✅ Use paginatedProjects
//                   <div
//                     key={project.id}
//                     onClick={() => handleViewClick(project.id)}
//                     className="group w-full bg-gradient-to-br from-white to-blue-50/50 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 hover:border-blue-200 cursor-pointer"  // ✅ Smaller cards
//                   >
//                     {/* Project Header */}
//                     <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-100">
//                       <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg">
//                         <TrendingUp className="w-5 h-5 text-white" />
//                       </div>
//                       <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getStatusColor(project.project_status)}`}>
//                         {project.project_status}
//                       </span>
//                     </div>

//                     {/* Project Name */}
//                     <h3 className="text-xl font-bold text-gray-900 mb-4 line-clamp-2 group-hover:text-indigo-700 transition-colors text-sm">
//                       {project.project_name}
//                     </h3>

//                     {/* Project Stats Grid */}
//                     <div className="grid grid-cols-2 gap-3 mb-6 w-full">
//                       <div className="flex items-center gap-2 p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-100/50 w-full">
//                         <DollarSign className="w-5 h-5 text-green-600 flex-shrink-0" />
//                         <div className="min-w-0">
//                           <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Budget</p>
//                           <p className="font-bold text-lg">${project.project_budget}</p>
//                         </div>
//                       </div>

//                       <div className="flex items-center gap-2 p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-100/50 w-full">
//                         <DollarSign className="w-5 h-5 text-red-600 flex-shrink-0" />
//                         <div className="min-w-0">
//                           <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Used Budget</p>
//                           <p className="font-bold text-lg">${project.project_used_budget}</p>
//                         </div>
//                       </div>

//                       <div className="flex items-center gap-2 p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-100/50 w-full">
//                         <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
//                         <div className="min-w-0">
//                           <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Total Hours</p>
//                           <p className="font-bold text-lg">{project.project_hours}h</p>
//                         </div>
//                       </div>

//                       <div className="flex items-center gap-2 p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-100/50 w-full">
//                         <Clock className="w-5 h-5 text-orange-600 flex-shrink-0" />
//                         <div className="min-w-0">
//                           <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Used Hours</p>
//                           <p className="font-bold text-lg">{project.project_used_hours}h</p>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Project Footer */}
//                     <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-xs w-full">
//                       <div className="flex items-center gap-1 text-gray-600">
//                         <Activity className="w-3 h-3" />
//                         <span>Tracking: {project.project_tracking === "1" ? "Active" : "Inactive"}</span>
//                       </div>
//                       <div className="flex items-center gap-1 text-gray-600 font-semibold">
//                         <TrendingUp className="w-3 h-3" />
//                         <span>Activity: {project.project_tag_activity}</span>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* ✅ FIXED: Pagination with proper condition */}
//           {totalPages > 1 && (
//             <div className="px-4 sm:px-6 lg:px-8 pt-8 pb-8">
//               <Pagination
//                 currentPage={currentPage}
//                 totalPages={totalPages}
//                 onPageChange={setCurrentPage}
//               />
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ClientData;
