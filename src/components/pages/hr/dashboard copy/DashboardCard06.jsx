import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { API_URL } from "../../../utils/ApiConfig";
import { StatCardHeader } from "../../../components/CardsDashboard";
import { Briefcase, Loader2 } from "lucide-react"; // Ensured Loader2 is imported

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
  const [loading, setLoading] = useState(true); // Added loading state for consistency
  const token = localStorage.getItem("userToken");

  useEffect(() => {
    const fetchDepartmentProjects = async () => {
      setLoading(true); // Set loading to true before fetch
      setErrorMsg('');   // Clear any previous errors

      if (!token) {
        setErrorMsg('User token not found in localStorage.');
        setLoading(false);
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

          // Check if there's any data greater than 0 to display
          const hasActualData = data.some(val => val > 0);

          if (hasActualData) {
            setChartData({
              labels,
              datasets: [
                {
                  label: 'Projects per Department',
                  data,
                  backgroundColor: [
                    '#3b82f6', // blue-500
                    '#10b981', // emerald-500
                    '#f59e0b', // amber-500
                    '#ec4899', // pink-500
                    '#8b5cf6', // violet-500
                    '#ef4444', // red-500
                  ],
                  borderWidth: 1,
                },
              ],
            });
          } else {
            setChartData(null); // Explicitly set to null if no meaningful data
          }
        } else {
          setErrorMsg("API returned success: false or missing data.");
        }
      } catch (error) {
        console.error('Error fetching department project data:', error);
        setErrorMsg(error.message);
      } finally {
        setLoading(false); // Set loading to false after fetch completes
      }
    };

    fetchDepartmentProjects();
  }, [token]);

  const projectOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom', // Chart legend position is already 'bottom'
      },
    },
  };

  return (
    <div className="col-span-full xl:col-span-5 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 ease-in-out hover:shadow-2xl hover:border-blue-200">
      {/* Tooltip position prop added here */}
      <StatCardHeader icon={Briefcase} title="Total Projects in Department"  tooltipPosition="bottom" />
      
      {/* Content area for chart or messages */}
      <div className="flex flex-grow items-center justify-center p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center space-y-4 text-gray-600 py-8">
            <Loader2 className="h-14 w-14 animate-spin text-gray-500" />
            <span className="text-xl font-semibold">Loading project data...</span>
            <span className="text-base text-gray-500">Fetching department project distribution.</span>
          </div>
        ) : errorMsg ? (
          <div className="flex flex-col items-center justify-center space-y-3 text-red-700 py-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xl font-semibold">Oops! Error loading chart.</span>
            <span className="text-base text-red-600">Details: {errorMsg}</span>
            <span className="text-sm text-gray-500">Please try again later.</span>
          </div>
        ) : chartData ? (
          <Pie data={chartData} options={projectOptions} width={389} height={260} /> 
        ) : (
          <div className="flex flex-col items-center justify-center space-y-3 text-gray-500 py-8">
            <Briefcase className="h-14 w-14 text-gray-400 opacity-70" />
            <span className="text-xl">No project data available.</span>
            <span className="text-base text-gray-600">It looks like there are no projects to display per department.</span>
            <span className="text-sm text-gray-500">Start assigning projects to departments to see the breakdown!</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardCard06;