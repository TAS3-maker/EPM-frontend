import React, { useContext, useEffect, useState } from 'react';
import Tooltip from '../Dashutils/Tooltip';
import BarChart from '../../../charts/BarChart02';
import { GraphContext } from '../../../context/GraphContext';
import { getCssVariable } from '../Dashutils/Utils';

function DashboardCard09() {
    const { fetchProjectStats, projectStats, loading, error } = useContext(GraphContext);
    // console.log("project stats", projectStats);
    const [chartData, setChartData] = useState({
      labels: [],
      datasets: [
          {
              label: 'Projects Count',
              data: [],
              backgroundColor: getCssVariable('--color-violet-500'),
              hoverBackgroundColor: getCssVariable('--color-violet-600'),
              barPercentage: 0.7,
              categoryPercentage: 0.7,
              borderRadius: 4,
          },
      ],
  });

  useEffect(() => {
      fetchProjectStats();
  }, []);

  useEffect(() => {
      if (projectStats && projectStats.length > 0) {
        //   console.log("Project Stats API Response:", projectStats); // Debugging

          // Extract months and project counts
          const labels = projectStats.map(item => {
              const startDate = new Date(item.start_date);
              return `${startDate.getMonth() + 1}-${startDate.getDate()}-${startDate.getFullYear()}`; // Format: MM-DD-YYYY
          }).reverse(); // Reverse to match correct order

          const data = projectStats.map(item => item.total_projects).reverse(); // Reverse to match labels

        //   console.log("Chart Labels:", labels); // Debugging
        //   console.log("Chart Data:", data); // Debugging

          setChartData({
              labels,
              datasets: [
                  {
                      label: 'Projects Count',
                      data,
                      backgroundColor: getCssVariable('--color-violet-500'),
                      hoverBackgroundColor: getCssVariable('--color-violet-600'),
                      barPercentage: 0.7,
                      categoryPercentage: 0.7,
                      borderRadius: 4,
                  },
              ],
          });
      }
  }, [projectStats]);

  return (
      <div className="flex flex-col rounded-lg shadow-lg col-span-full sm:col-span-6 bg-white shadow-xs rounded-xl">
          <header className="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-2xl">
            <h2 className="text-lg sm:text-xl font-semibold text-white">
            Projects Over Last 6 Months
            </h2>
            <Tooltip className="ml-2" size="lg">
                  <div className="text-sm">Monthly project count from the last six months.</div>
              </Tooltip>
        </header>
          <div className="px-5 py-3">
              <div className="flex items-start">
                  <div className="text-3xl font-bold text-gray-800 mr-2">Projects</div>
              </div>
          </div>
          {/* Chart built with Chart.js 3 */}
          <div className="grow">
              {loading ? (
                  <p>Loading...</p>
              ) : error ? (
                  <p>Error: {error}</p>
              ) : chartData.labels.length > 0 && chartData.datasets[0].data.length > 0 ? (
                  <BarChart data={chartData} width={595} height={248} />
              ) : (
                  <p>No data available</p>
              )}
          </div>
      </div>
  );
}
export default DashboardCard09;
