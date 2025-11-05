import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTask } from "../../../context/TaskContext";
import { BarChart } from 'lucide-react';
import { SectionHeader } from '../../../components/SectionHeader';
import DOMPurify from 'dompurify';

export default function Emptask() {
  const [openTask, setOpenTask] = useState(null);
  const { project_id } = useParams();
  const { empTasks, fetchEmpTasks } = useTask();

  useEffect(() => {
    if (project_id) {
      fetchEmpTasks(project_id);
    }
  }, [project_id]);

  const toggleTask = (id) => {
    setOpenTask(openTask === id ? null : id);
  };

  return (
    <div>
      <SectionHeader
        icon={BarChart}
        
        title="Project Details"
        subtitle="Track and manage your projects details efficiently with our intuitive dashboard."
      />

      <div className="flex items-center mt-1 justify-center relative">
        <div className="w-full bg-white shadow-md rounded-3xl">
          
          {empTasks.project && (
<div className="flex flex-wrap md:flex-nowrap items-stretch justify-around  border p-4 rounded-lg  bg-white mb-6 w-full">
              <div className="flex flex-col flex-wrap md:flex-nowrap items-center gap-1 border p-2 rounded-lg shadow-md bg-white">
                <strong>Project Name:</strong>
                <p className="text-lg text-gray-700">
                  {empTasks.project.name || "No Task Assigned"}
                </p>
              </div>
              <div className="flex flex-col flex-wrap md:flex-nowrap items-center gap-1 border p-2 rounded-lg shadow-md bg-white">
                <strong>Deadline:</strong>
                <p className="text-lg text-gray-700">
                  {empTasks.project.deadline || "—"}
                </p>
              </div>
              <div className="flex flex-col flex-wrap md:flex-nowrap items-center gap-1 border p-2 rounded-lg shadow-md bg-white">
                <strong>Total Hours:</strong>
                <p className="text-lg text-gray-700">
                  {empTasks.project.total_hours || 0}
                </p>
              </div>
              <div className="flex flex-col flex-wrap md:flex-nowrap items-center gap-1 border p-2 rounded-lg shadow-md bg-white">
                <strong>Project Status:</strong>
                <p className="text-lg text-gray-700">
                  {empTasks.project.project_status || "—"}
                </p>
              </div>
              <div className="flex flex-col flex-wrap md:flex-nowrap items-center gap-1 border p-2 rounded-lg shadow-md bg-white">
                <strong>Project Type:</strong>
                <p className="text-lg text-gray-700">
                  {empTasks.project.project_type || "—"}
                </p>
              </div>
              <div className="flex flex-col flex-wrap md:flex-nowrap items-center gap-1 border p-2 rounded-lg shadow-md bg-white">
                <strong>Assigned By:</strong>
                <p className="text-lg text-gray-700">
                  {empTasks.project_manager?.name || "—"}
                </p>
              </div>
            </div>
          )}

          <div className="p-4 min-h-[100vh]">
            <h2 className="text-2xl font-bold text-blue-800 mb-6">Project Tasks</h2>

            <div className="relative border-l-4 border-blue-500 ml-9 space-y-4">
              {empTasks?.data?.length > 0 ? (
                empTasks.data.map((task) => (
                  <div key={task.id} className="relative px-5 py-1 border-b border-[#e1e1e1] pb-5">
                    {/* Blue dot */}
                    <div className="absolute w-5 h-5 bg-blue-600 rounded-full -left-[0.7rem] top-3"></div>

                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => toggleTask(task.id)}
                        className="w-full text-left text-base font-bold text-gray-900 hover:text-blue-700 focus:outline-none transition-all"
                      >
                        {task.title}
                      </button>

                      <div className="relative flex items-center gap-2">
                        <span className="px-4 py-2 bg-gray-200 rounded-lg shadow-md hover:bg-gray-300 transition-all whitespace-nowrap">
                          {task.status}
                        </span>
                      </div>
                    </div>

                    {/* Expanded Task Details */}
                    {openTask === task.id && (
                      <div className="mt-5 p-6 bg-blue-50 rounded-2xl shadow-lg border border-blue-300 space-y-4">
                        <div className="text-lg text-gray-800 font-semibold">
                          <strong>Deadline:</strong>
                          <span className="ml-2">{task.deadline}</span>
                        </div>

                        <div className="text-lg text-gray-800 font-semibold">
                          <strong>Hours:</strong>
                          <span className="ml-2">{task.hours}</span>
                        </div>

                        <div className="text-lg text-gray-800 font-semibold">
                          <strong>Assigned By:</strong>
                          <span className="ml-2">{empTasks.project_manager?.name}</span>
                        </div>

                        <div className="mt-4 pt-4 border-t">
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">Description:</h3>
                          <div
                            className="prose max-w-none text-gray-900"
                            dangerouslySetInnerHTML={{
                              __html: DOMPurify.sanitize(task.description),
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-lg text-gray-800 font-semibold">
                  No tasks available for this project.
                </p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
