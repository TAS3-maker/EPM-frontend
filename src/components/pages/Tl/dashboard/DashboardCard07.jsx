import React from 'react';
import { useProject } from "../../../context/ProjectContext";
import { useClient } from "../../../context/ClientContext";
import { Loader2 } from "lucide-react";

function DashboardCard07() {
  const { projects, isLoading } = useProject();
  const { clients } = useClient();

  // console.log("dash projects", projects);

  const latestProjects = projects
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 7);

  const HoverCell = ({ text }) => (
    <div className="relative group max-w-full overflow-visible">
      <span className="block overflow-hidden text-ellipsis whitespace-nowrap">
        {text}
      </span>
  
      <div
        className="absolute z-[9999] hidden group-hover:block bg-white shadow-lg 
                   p-2 rounded whitespace-nowrap text-black border top-full mt-1 
                   left-0 max-w-[300px]"
        style={{ whiteSpace: "normal" }}
      >
        {text}
      </div>
    </div>
  );


  
  return (
    <div className="col-span-full xl:col-span-7 bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-scroll sm:overflow-x-hidden min-h-96 max-h-[600px] overflow-y-auto">
        <table className="table-auto w-full sm:table-fixed">
          <thead className="text-xs font-semibold uppercase text-white sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-blue-800 whitespace-nowrap sm:whitespace-normal">
            <tr>
              <th className="p-4 whitespace-nowrap text-left">
                <div className="font-semibold tracking-wider">Client Name</div>
              </th>
              <th className="p-4 whitespace-nowrap text-center">
                <div className="font-semibold tracking-wider">Project Name</div>
              </th>
              <th className="p-4 whitespace-nowrap text-center">
                <div className="font-semibold tracking-wider">Created Date</div>
              </th>
            </tr>
          </thead>
          <tbody className="text-sm font-medium divide-y divide-gray-200 whitespace-nowrap sm:whitespace-normal">
            {isLoading ? (
              <tr>
                <td colSpan="3">
                  <div className="flex flex-col items-center justify-center space-y-4 py-8">
                    <Loader2 className="h-14 w-14 animate-spin text-gray-500" />
                    <span className="text-xl font-semibold text-gray-600">Loading projects...</span>
                    <span className="text-base text-gray-500">Fetching recent projects data.</span>
                  </div>
                </td>
              </tr>
            ) : latestProjects.length > 0 ? (
              latestProjects.map((project, index) => (
                <tr
                  key={project.id}
                  className={`
                    ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                    hover:bg-blue-50 transition duration-200 ease-in-out
                  `}
                >
                  <td className="py-4 px-2 text-xs sm:px-3 font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-200">
                    
                    <span className="break-words">
                        {project.client?.name
                          ? project.client.name.length > 20
                          ? project.client.name.substring(0, 20) + "..."
                          : project.client.name
                          : "Unknown Client"}
                    </span>
                  </td>
                  <td className="py-4 px-2 text-xs sm:px-3 text-center text-gray-700">
                    
                    <span className="break-words">
                        {project.project_name
                          ? project.project_name.length > 15
                          ? project.project_name.substring(0, 15) + "..."
                          : project.project_name
                          : ""}
                    </span>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <div className="text-center text-gray-700">
                      {new Date(project.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="p-4 text-center text-gray-500 italic">No recent projects found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DashboardCard07;
