
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
// import { Overview } from "../../../components/RichTextEditor";
import { useTask } from "../../../context/TaskContext";
import {BarChart} from 'lucide-react';
import { SectionHeader } from '../../../components/SectionHeader';

import DOMPurify from 'dompurify';

export default function Emptask() {
  const [openTask, setOpenTask] = useState(null);
  const [statusDropdown, setStatusDropdown] = useState(null);

  const { project_id } = useParams();
  // console.log("project_id izzs", project_id);

  const { empTasks, fetchEmpTasks } = useTask();

  // console.log("tasks", empTasks);

  useEffect(() => {
    if (project_id) {
      fetchEmpTasks(project_id);
    }
  }, [project_id]);




  const toggleTask = (id) => {
    setOpenTask(openTask === id ? null : id);
  };

  const toggleStatusDropdown = (id) => {
    setStatusDropdown(statusDropdown === id ? null : id);
  };

  return (
    <div>
      <SectionHeader icon={BarChart} title="Project details" subtitle="Track and manage your projects details efficiently with our intuitive dashboard." />
      <div className="flex items-center justify-center relative">
      <div className="w-full bg-white shadow-md rounded-3xl p-4">
      {empTasks.project && (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {empTasks.project.name || "No Task Assigned"}
        </h2>
        <div className="text-gray-700 space-y-1">
          <p><strong>Deadline:</strong> {empTasks.project.deadline || "—"}</p>
          <p><strong>Total Hours:</strong> {empTasks.project.total_hours || 0}</p>
          <p><strong>Assigned By:</strong> {empTasks.project_manager.name || "—"}</p>
        </div>
      </div>
    )}

        <h2 className="text-2xl font-bold text-blue-800 mb-6">Project Tasks</h2>
        <div className="relative border-l-4 border-blue-500 ml-9 space-y-4">
          {empTasks?.data?.length > 0 ? (
            empTasks.data.map((task) => (
              <div key={task.id} className="relative px-5 py-1 border-b border-[#e1e1e1] pb-5">
                <div className="absolute w-5 h-5 bg-blue-600 rounded-full -left-[0.7rem] top-3"></div>
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="w-full text-left text-base font-bold text-gray-900 hover:text-blue-700 focus:outline-none transition-all"
                  >
                    {task.title}
                  </button>
                  <div className="relative flex items-center gap-2">
                    <p
                      className="px-4 py-2 bg-gray-200 rounded-lg shadow-md hover:bg-gray-300 transition-all whitespace-nowrap"
                    >
                      {task.status}
                    </p>
                  </div>
                </div>


                {openTask === task.id && (
                  <div className="mt-5 p-6 bg-blue-50 rounded-2xl shadow-lg border border-blue-300">

                    <p className="text-lg text-gray-800 font-semibold">
                      <strong>Deadline:</strong>
                      <span className="ml-2">{task.deadline}</span>
                    </p>

                    <p className="text-lg text-gray-800 font-semibold">
                      <strong>Hours:</strong>
                      <span className="ml-2">{task.hours}</span>
                    </p>

                    <p className="text-lg text-gray-800 font-semibold">
                      <strong>Assigned By:</strong> {empTasks.project_manager.name}
                    </p>

                     <div
                          className="prose max-w-none text-gray-900"
                          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(task.description) }}
                        />
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

    
  );
} 
