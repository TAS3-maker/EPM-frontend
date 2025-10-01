import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Pie, Bar } from 'react-chartjs-2';
import { API_URL } from "../../../utils/ApiConfig";
import { SectionHeader } from '../../../components/SectionHeader';
import { BarChart } from "lucide-react";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

export const ProjectDetail = () => {
  const { project_id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const groupByDepartment = (arr) => {
    const grouped = {};
    arr?.forEach(item => {
      if (!grouped[item.department]) grouped[item.department] = [];
      grouped[item.department].push(item);
    });
    return grouped;
  };

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const token = localStorage.getItem('userToken');
        const res = await fetch(`${API_URL}/api/getfull-projectmananger-data`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.success) {
          const proj = data.data.find(p => String(p.project_id) === String(project_id));
          setProject(proj || null);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjectData();
  }, [project_id]);

  if (loading) return <div className="text-center p-10 text-lg">Loading...</div>;
  if (!project) return <div className="text-center text-red-600 p-10 text-lg">Project not found</div>;

  const goToTask = () => {
    const role = localStorage.getItem("user_name");
    navigate(role === "billingmanager"
      ? `/billingmanager/projects/tasks/${project.project_id}`
      : `/superadmin/projects/tasks/${project.project_id}`
    );
  };

  const pieData = {
    labels: ['Total Hours', 'Worked Hours', 'Remaining Hours'],
    datasets: [{
      data: [project.total_hours, project.worked_hours, project.remaining_hours],
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
    }]
  };

  const groupedManagers = groupByDepartment(project.managers || []);
  const groupedTLs = groupByDepartment(project.tls || []);
  const groupedEmployees = groupByDepartment(project.employees || []);

  const SectionBlock = ({ title, groups, color }) => {
    return Object.entries(groups).map(([dept, people]) => (
      <div key={dept} className="bg-white rounded-lg shadow p-4 space-y-3">
        <h3 className={`text-lg font-bold ${color}`}>{title} - {dept}</h3>
        {people.length === 0 ? (
          <p className="text-gray-500">No data available</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {people.map(p => (
              <div key={p.id} className={`border-l-4 pl-3 rounded shadow-sm bg-gray-50 p-3 border-${color.split('-')[1]}-400`}>
                <p><strong>Name:</strong> {p.name}</p>
                <p><strong>Email:</strong> <a className="underline" href={`mailto:${p.email}`}>{p.email}</a></p>
                {p.worked_hours !== undefined && (
                  <>
                    <p><strong>Worked:</strong> {p.worked_hours}</p>
                    <p><strong>Remaining:</strong> {Math.max((project.total_hours || 0) - p.worked_hours, 0)}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    ));
  };

  return (
    <>
      <SectionHeader icon={BarChart} title="Project Detail" subtitle="Detailed view of selected project" />

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 bg-gray-100 min-h-screen">
        {/* Project Summary */}
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Project: {project.project_name}</h2>
            <button onClick={goToTask} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold">
              View Tasks
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div className="space-y-2">
              <p><strong>Total Hours:</strong> {project.total_hours}</p>
              <p><strong>Worked Hours:</strong> {project.worked_hours}</p>
              <p><strong>Remaining Hours:</strong> {project.remaining_hours}</p>
            </div>
            <div className="h-64">
              <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        </div>

        {/* Sections */}
        <SectionBlock title="Managers" groups={groupedManagers} color="text-blue-600" />
        <SectionBlock title="Team Leads" groups={groupedTLs} color="text-green-600" />
        <SectionBlock title="Employees" groups={groupedEmployees} color="text-purple-600" />

        {/* Employee Bar Chart */}
        {project.employees && project.employees.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-purple-700 mb-4">Employee Worked Hours</h3>
            <div className="h-72">
              <Bar
                data={{
                  labels: project.employees.map(e => e.name),
                  datasets: [{
                    label: 'Worked Hours',
                    data: project.employees.map(e => e.worked_hours),
                    backgroundColor: '#8b5cf6',
                  }]
                }}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};
