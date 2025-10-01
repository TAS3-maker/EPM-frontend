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

  return (
    <div className="col-span-full xl:col-span-7 bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-y-auto max-h-[40vh] custom-scrollbar">
        <table className="table-auto w-full">
          <thead className="text-xs font-semibold uppercase text-white sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-blue-800">
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
          <tbody className="text-sm font-medium divide-y divide-gray-200">
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
                  <td className="p-4 whitespace-nowrap">
                    <div className="text-gray-800 font-medium">{project.client?.name || "Unknown Client"}</div>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <div className="text-center text-gray-700">{project.project_name}</div>
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
