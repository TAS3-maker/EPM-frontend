import React, { useState, useEffect, useContext } from 'react'; 
import { GraphContext } from '../../../context/GraphContext';
import BarChart from '../../../charts/BarChart01';

// Import utilities
import { getCssVariable } from '../Dashutils/Utils';

function DashboardCard04() {
  const { loading, fetchWeeklyWorkingHours, weeklyWorkingHours } = useContext(GraphContext);

  // Function to convert time (HH:MM) to decimal hours
  const timeToDecimal = (time) => {
    if (!time) return 0;
    const [hours, minutes] = time.split(':').map(Number);
    return hours + minutes / 60;
  };

  useEffect(() => {
    fetchWeeklyWorkingHours(); // Fetch data when component mounts
  }, []);

  // Log to verify if data is being fetched correctly
  // console.log("weekly hours", weeklyWorkingHours);

  // Prepare chart data if weeklyWorkingHours data is available
  const chartData = {
    labels: (weeklyWorkingHours && weeklyWorkingHours.length > 0) 
      ? weeklyWorkingHours.map(item => item.date) 
      : [],
    datasets: [
      {
        label: 'Billable Hours',
        data: (weeklyWorkingHours && weeklyWorkingHours.length > 0) 
          ? weeklyWorkingHours.map(item => timeToDecimal(item.total_billable)) 
          : [],
        backgroundColor: getCssVariable('--color-sky-500'),
        hoverBackgroundColor: getCssVariable('--color-sky-600'),
        barPercentage: 0.7,
        categoryPercentage: 0.7,
        borderRadius: 4,
      },
      {
        label: 'Non-Billable Hours',
        data: (weeklyWorkingHours && weeklyWorkingHours.length > 0) 
          ? weeklyWorkingHours.map(item => timeToDecimal(item.total_non_billable)) 
          : [],
        backgroundColor: getCssVariable('--color-violet-500'),
        hoverBackgroundColor: getCssVariable('--color-violet-600'),
        barPercentage: 0.7,
        categoryPercentage: 0.7,
        borderRadius: 4,
      },
      {
        label: 'In-House Hours',
        data: (weeklyWorkingHours && weeklyWorkingHours.length > 0)
          ? weeklyWorkingHours.map(item => timeToDecimal(item.total_inhouse))
          : [],
        backgroundColor: getCssVariable('--color-green-500'),
        hoverBackgroundColor: getCssVariable('--color-green-600'),
        barPercentage: 0.7,
        categoryPercentage: 0.7,
        borderRadius: 4,
      },
    ],
  };

  return (
    <div className="flex rounded-lg shadow-lg flex-col col-span-full sm:col-span-6 xl:col-span-5 bg-white shadow-xs rounded-xl">
      <header className="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-2xl">
    <h2 className="text-lg sm:text-xl font-semibold text-white">
      Billable / non-billable
    </h2>
    {/* <div className="text-sm text-blue-100 font-medium">
      📊
    </div> */}
  </header>
      
      {/* Check if data is available */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        // Ensure chart data is not empty before passing to BarChart
        chartData.labels.length > 0 ? (
          <BarChart data={chartData} width={595} height={248} />
        ) : (
          <p>No data available for the selected week</p>
        )
      )}
    </div>
  );
}

export default DashboardCard04;
