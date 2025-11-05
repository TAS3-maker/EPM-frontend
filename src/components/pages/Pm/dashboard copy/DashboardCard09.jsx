import React, { useContext, useEffect, useState } from 'react';
import { StatCardHeader } from "../../../components/CardsDashboard";
import { Briefcase, Loader2 } from "lucide-react";
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
            // console.log("Project Stats API Response:", projectStats); // Debugging

            const labels = projectStats.map(item => {
                const startDate = new Date(item.start_date);
                return `${startDate.getMonth() + 1}-${startDate.getDate()}-${startDate.getFullYear()}`;
            }).reverse();

            const data = projectStats.map(item => item.total_projects).reverse();

            // console.log("Chart Labels:", labels); // Debugging
            // console.log("Chart Data:", data); // Debugging

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
            <StatCardHeader icon={Briefcase} title="Projects Over Last 6 Months"  />
            <div className="mt-10 flex items-center justify-center h-96">
                {loading ? (
                    <div className="flex flex-col items-center justify-center space-y-4 text-gray-600 py-8">
                        <Loader2 className="h-14 w-14 animate-spin text-gray-500" />
                        <span className="text-xl font-semibold">Loading project stats...</span>
                        <span className="text-base text-gray-500">Fetching monthly project count.</span>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center space-y-3 text-red-700 py-8">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xl font-semibold">Oops! Error loading chart.</span>
                        <span className="text-base text-red-600">Details: {error.message || "An unknown error occurred."}</span>
                        <span className="text-sm text-gray-500">Please try again later.</span>
                    </div>
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
