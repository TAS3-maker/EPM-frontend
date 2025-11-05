import React from 'react';
import { useProject } from "../../../context/ProjectContext";
import { useClient } from "../../../context/ClientContext"; // Ensure this context is providing client data as expected
import { StatCardHeader } from "../../../components/CardsDashboard";
import { Briefcase, Loader2 } from "lucide-react"; // Added Loader2 icon for loading state
import { CalendarDays } from "lucide-react"; // Ensure CalendarDays is imported for the header icon

function DashboardCard07() {
  const { projects, isLoading } = useProject();
  const { clients } = useClient(); // Assuming you have client data

//   console.log("dash projects", projects);

  // Helper function to get client name by ID (This logic is fine as is)
  // const getClientName = (clientId) => {
  //   const client = clients?.find(c => c.id === clientId);
  //   return client ? client.name : "Unknown Client";
  // };

  const latestProjects = projects
    .slice() // Create a copy to avoid mutating original array
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) // Sort by latest date
    .slice(0, 7);

  return (
    <div className="col-span-full md:col-span-6 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 ease-in-out hover:shadow-2xl hover:border-blue-200">
      {/* <StatCardHeader icon={Briefcase} title="Recent Projects" tooltip="Displaying your most recently added projects." /> */}
      
      {/* Main content area: No horizontal padding here. All padding controlled within table cells. */}
      <div className="pt-0 pb-6 sm:pb-8 md:pb-10">
          {/* Scrollable Table Container - Only vertical scroll allowed, no horizontal overflow visible */}
          <div className="overflow-x-hidden min-h-96 max-h-[600px] overflow-y-auto custom-scrollbar">
              {/* Table - full width, fixed layout for precise column widths */}
              <table className="table-fixed w-full text-base text-gray-800">
                  {/* Table header */}
                  <thead className="text-xs font-bold tracking-wide uppercase bg-gradient-to-r from-blue-600 to-indigo-700 text-white sticky top-0 z-30 shadow-md">
                      <tr>
                          {/* Adjusted widths to ensure no cutting (sum to 100%) */}
                          <th scope="col" className="w-[35%] py-4 px-2 sm:px-3 text-left rounded-tl-2xl">
                              <div className="flex items-center gap-1.5">
                                  <Briefcase size={14} className="text-blue-200" />
                                  <span>Client Name</span>
                              </div>
                          </th>
                          <th scope="col" className="w-[35%] py-4 px-2 sm:px-3 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                  <Briefcase size={14} className="text-blue-200" /> {/* Using briefcase for project name too, or find a different icon */}
                                  <span>Project Name</span>
                              </div>
                          </th>
                          <th scope="col" className="w-[30%] py-4 px-2 sm:px-3 text-center rounded-tr-2xl">
                              <div className="flex items-center justify-center gap-1.5">
                                  <CalendarDays size={14} className="text-blue-200" />
                                  <span>Created Date</span>
                              </div>
                          </th>
                      </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                      {isLoading ? (
                          <tr>
                              <td colSpan="3" className="py-16 text-center bg-gray-50 text-gray-600">
                                  <div className="flex flex-col items-center justify-center space-y-4">
                                      <Loader2 className="h-14 w-14 animate-spin text-gray-500" />
                                      <span className="text-2xl font-semibold">Loading projects...</span>
                                      <span className="text-lg text-gray-500">Please wait, this might take a moment.</span>
                                  </div>
                              </td>
                          </tr>
                      ) : (
                        // No direct error state from useProject, assuming it's handled upstream or not needed for this component.
                        latestProjects.length > 0 ? (
                          latestProjects.map((project, index) => (
                              <tr key={project.id} className={`group ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition duration-200 ease-in-out cursor-pointer`}>
                                  <td className="py-4 px-2 sm:px-3 font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-200">
                                      <span className="break-words">{project.client?.name || "Unknown Client"}</span>
                                  </td>
                                  <td className="py-4 px-2 sm:px-3 text-center text-gray-700">
                                      <span className="break-words">{project.project_name}</span>
                                  </td>
                                  <td className="py-4 px-2 sm:px-3 text-center text-gray-700 font-mono text-sm">
                                      {new Date(project.created_at).toLocaleDateString('en-US', {
                                          day: 'numeric',
                                          month: 'short', // Changed to short month for compactness
                                          year: 'numeric'
                                      })}
                                  </td>
                              </tr>
                          ))
                      ) : (
                          <tr>
                              <td colSpan="3" className="py-16 text-center text-gray-500 bg-gray-50 font-medium border-t border-gray-200">
                                  <div className="flex flex-col items-center justify-center space-y-3">
                                      <Briefcase className="h-14 w-14 text-gray-400 opacity-70" />
                                      <span className="text-xl">No recent projects found!</span>
                                      <span className="text-base text-gray-600">It looks like you haven't added any projects yet.</span>
                                      <span className="text-sm text-gray-500">Get started by creating your first project.</span>
                                  </div>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </div>
      {/* Custom scrollbar styles */}
      <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
              width: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
              background: #f8fafc; /* bg-gray-50 equivalent for track */
              border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
              background: #cbd5e1; /* Gray-300 for thumb */
              border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: #94a3b8; /* Gray-400 on hover */
          }
      `}</style>
    </div>
  );
}

export default DashboardCard07;