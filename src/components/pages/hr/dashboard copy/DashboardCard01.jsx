import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { StatCardHeader } from "../../../components/CardsDashboard";
import { Briefcase, Loader2 } from "lucide-react"; // Added Loader2 icon for loading state
import { API_URL } from "../../../utils/ApiConfig";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const DashboardCard01 = () => {
  const [data, setData] = useState([]);
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true); // Added loading state
  const [error, setError] = useState(null);     // Added error state
  const token = localStorage.getItem("userToken");

  useEffect(() => {
    const fetchDepartmentUsers = async () => {
      setLoading(true); // Set loading to true before fetch
      setError(null);   // Clear any previous errors
      try {
        const response = await fetch(`${API_URL}/api/getuser-Byteam`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        const json = await response.json();

        if (json.success && json.data) {
          setLabels(Object.keys(json.data).map(key => key.replace(' Users', '')));
          setData(Object.values(json.data));
        } else {
          setError(new Error(json.message || "Failed to fetch department data."));
        }
      } catch (err) { // Changed 'error' to 'err' to avoid conflict with state variable
        console.error('Error fetching department user data:', err);
        setError(err);
      } finally {
        setLoading(false); // Set loading to false after fetch completes
      }
    };

    fetchDepartmentUsers();
  }, [token]);

  // Dynamically calculate suggestedMax
  const highest = Math.max(...data, 0); // fallback to 0 if empty
  const suggestedMax = highest > 50 ? highest + 10 : 50;

  // Check if there's actual data to render the chart (at least one label and one non-zero data point)
  const hasChartData = labels.length > 0 && data.some(val => val > 0);

  return (
    <div className="md:col-span-12 xl:col-span-7 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 ease-in-out hover:shadow-2xl hover:border-blue-200 flex flex-col">
      <StatCardHeader icon={Briefcase} title="Total employees in department" />
      
      <div className="flex flex-grow items-center justify-center p-4"> {/* Adjusted padding and added flex properties */}
        {loading ? (
          <div className="flex flex-col items-center justify-center space-y-4 text-gray-600 py-8">
            <Loader2 className="h-14 w-14 animate-spin text-gray-500" />
            <span className="text-xl font-semibold">Loading employee data...</span>
            <span className="text-base text-gray-500">Fetching department-wise employee counts.</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center space-y-3 text-red-700 py-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xl font-semibold">Oops! Error loading chart.</span>
            <span className="text-base text-red-600">Details: {error.message || "Unknown error occurred."}</span>
            <span className="text-sm text-gray-500">Please try again later.</span>
          </div>
        ) : hasChartData ? (
          <div className="w-full h-96"> {/* Keep h-96 for consistent chart height */}
            <Bar
              data={{
                labels,
                datasets: [
                  {
                    label: 'Employees',
                    data,
                    backgroundColor: [
                      '#2563eb', // Indigo 600 - was blue, now more aligned
                      '#10b981', // Emerald 500
                      '#f59e0b', // Amber 500
                      '#ec4899', // Pink 500
                      '#8b5cf6', // Violet 500
                    ],
                    borderRadius: 8,
                    barPercentage: 0.55,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                      color: '#6b7280', // text-gray-500 for better contrast on white background
                      font: {
                        size: 12,
                        weight: '600',
                      },
                    },
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) =>
                        `${context.label}: ${Math.round(context.raw)} employees`,
                    },
                  },
                },
                scales: {
                  x: {
                    ticks: {
                      color: '#6b7280', // text-gray-500
                      font: {
                        size: 12,
                      },
                    },
                    grid: {
                      color: 'rgba(229, 231, 235, 0.5)', // Gray-200 with opacity for lighter grid lines
                      borderColor: '#f3f4f6' // Gray-100 for axis border
                    },
                  },
                  y: {
                    suggestedMax,
                    ticks: {
                      color: '#6b7280', // text-gray-500
                      font: {
                        size: 12,
                      },
                      callback: function (value) {
                        return Number.isInteger(value) ? value : '';
                      },
                    },
                    grid: {
                      color: 'rgba(229, 231, 235, 0.5)', // Gray-200 with opacity
                      borderColor: '#f3f4f6' // Gray-100 for axis border
                    },
                  },
                },
              }}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-3 text-gray-500 py-8">
            <Briefcase className="h-14 w-14 text-gray-400 opacity-70" />
            <span className="text-xl">No employee data found!</span>
            <span className="text-base text-gray-600">It looks like there are no employee records to display.</span>
            <span className="text-sm text-gray-500">Ensure employees are assigned to departments.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardCard01;