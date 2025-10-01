import React, { useContext, useEffect, useState } from 'react';
import { StatCardHeader } from "../../../components/CardsDashboard";
import { CheckCircle, XCircle, Pencil, Ban, Save, Edit, CalendarDays, Trash2, Eye, UserPlus, FolderSync, Briefcase } from "lucide-react";
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

            // Extract months and project counts
            const labels = projectStats.map(item => {
                const startDate = new Date(item.start_date);
                return `${startDate.getMonth() + 1}-${startDate.getDate()}-${startDate.getFullYear()}`; // Format: MM-DD-YYYY
            }).reverse(); // Reverse to match correct order

            const data = projectStats.map(item => item.total_projects).reverse(); // Reverse to match labels

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
        <div className="col-span-12 xl:col-span-6 bg-white/70 backdrop-blur-md shadow-xl rounded-2xl flex flex-col border border-gray-200">
            <StatCardHeader icon={Briefcase} title="Projects Over Last 6 Months"  />
            <div className="mt-10">
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
