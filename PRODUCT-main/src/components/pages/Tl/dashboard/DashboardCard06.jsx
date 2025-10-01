import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { API_URL } from "../../../utils/ApiConfig";
import { StatCardHeader } from "../../../components/CardsDashboard";
import { Loader2, Briefcase } from "lucide-react";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const DashboardCard06 = () => {
  const [chartData, setChartData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(true); // ✅ Added loading state
  const token = localStorage.getItem("userToken");

  useEffect(() => {
    const fetchDepartmentProjects = async () => {
      if (!token) {
        setErrorMsg('User token not found in localStorage.');
        setLoading(false); // ✅ Stop loading if no token
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/total-departmentproject`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const json = await response.json();
        // console.log("API response:", json);

        if (json.success && json.data) {
          const labels = Object.keys(json.data);
          const data = Object.values(json.data);

          setChartData({
            labels,
            datasets: [
              {
                label: 'Projects per Department',
                data,
                backgroundColor: [
                  '#3b82f6',
                  '#10b981',
                  '#f59e0b',
                  '#ec4899',
                  '#8b5cf6',
                  '#ef4444',
                ],
                borderWidth: 1,
              },
            ],
          });
        } else {
          setErrorMsg("API returned success: false or missing data.");
        }
      } catch (error) {
        console.error('Error fetching department project data:', error);
        setErrorMsg(error.message);
      } finally {
        setLoading(false); // ✅ Always stop loading
      }
    };

    fetchDepartmentProjects();
  }, [token]);

  const projectOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  return (
    <div className="flex flex-col sm:col-span-6 xl:col-span-5 rounded-lg shadow-lg bg-white">
      <StatCardHeader icon={Briefcase} title="Total Projects in Department" />
      <div className="p-6 h-96 flex justify-center items-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center space-y-4 text-gray-600 py-8">
            <Loader2 className="h-14 w-14 animate-spin text-gray-500" />
            <span className="text-xl font-semibold">Loading department data...</span>
            <span className="text-base text-gray-500">Fetching projects by department.</span>
          </div>
        ) : errorMsg ? (
          <p className="text-red-500">{errorMsg}</p>
        ) : chartData ? (
          <Pie data={chartData} options={projectOptions} />
        ) : (
          <p className="text-gray-400">No chart data available.</p>
        )}
      </div>
    </div>
  );
};

export default DashboardCard06;
