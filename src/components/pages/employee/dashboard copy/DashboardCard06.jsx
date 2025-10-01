import React, { useState, useEffect, useContext } from 'react';
import DoughnutChart from '../../../charts/DoughnutChart';
import { GraphContext } from '../../../context/GraphContext';
import { StatCardHeader } from "../../../components/CardsDashboard";
import { Briefcase, Loader2 } from "lucide-react"; // Added Loader2 icon

import { getCssVariable } from '../Dashutils/Utils';

function DashboardCard06() {
  const { loading, error, fetchEmpHours, empHours } = useContext(GraphContext);
  console.log("Graph Data Received:", empHours);

  useEffect(() => {
    fetchEmpHours();
  }, []);

  const timeToDecimal = (time) => {
    if (!time) return 0;
    const [hours, minutes] = time.split(':').map(Number);
    return hours + minutes / 60;
  };

  const safeGetCssVariable = (variable, fallback) => getCssVariable(variable) || fallback;

  const filteredChartData = empHours
    ? {
        labels: ['Billable Hours', 'Non-billable Hours', 'In-house Hours'],
        datasets: [
          {
            label: 'Working Hours',
            data: [
              timeToDecimal(empHours.total_billable),
              timeToDecimal(empHours.total_non_billable),
              timeToDecimal(empHours.total_inhouse),
            ],
            backgroundColor: [
              safeGetCssVariable('--color-violet-500', '#8b5cf6'),
              safeGetCssVariable('--color-sky-500', '#0ea5e9'),
              safeGetCssVariable('--color-violet-800', '#6d28d9'),
            ],
            hoverBackgroundColor: [
              safeGetCssVariable('--color-violet-600', '#7c3aed'),
              safeGetCssVariable('--color-sky-600', '#0284c7'),
              safeGetCssVariable('--color-violet-900', '#4c1d95'),
            ],
            borderWidth: 1,
          },
        ],
      }
    : null;

  console.log("Filtered Chart Data:", filteredChartData);

  return (
    <div className="flex flex-col col-span-full sm:col-span-6 xl:col-span-5 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 ease-in-out hover:shadow-2xl hover:border-blue-200">
      <StatCardHeader icon={Briefcase} title="Working hours" tooltip="Displaying your overall working hour distribution." />
      
      {/* Content area for chart or messages */}
      <div className="flex flex-grow items-center justify-center p-4"> {/* Added padding and flex for centering */}
        {loading ? (
          <div className="flex flex-col items-center justify-center space-y-4 text-gray-600 py-8">
            <Loader2 className="h-14 w-14 animate-spin text-gray-500" />
            <span className="text-xl font-semibold">Loading chart data...</span>
            <span className="text-base text-gray-500">Fetching your working hour breakdown.</span>
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
        ) : filteredChartData && (filteredChartData.datasets[0].data.some(val => val > 0)) ? ( // Check if there's actual data to display
          <DoughnutChart data={filteredChartData} width={389} height={260} />
        ) : (
          <div className="flex flex-col items-center justify-center space-y-3 text-gray-500 py-8">
            <Briefcase className="h-14 w-14 text-gray-400 opacity-70" />
            <span className="text-xl">No working hour data available.</span>
            <span className="text-base text-gray-600">It looks like there's no activity to display for this period.</span>
            <span className="text-sm text-gray-500">Start logging your hours to see the breakdown!</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardCard06;