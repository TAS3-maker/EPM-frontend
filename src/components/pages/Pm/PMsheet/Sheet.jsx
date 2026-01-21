import React, { useEffect, useState } from "react";
import { usePMContext } from "../../../context/PMContext"; // Importing the context
import { Loader2, Calendar, User, Briefcase, Clock, FileText, Target, BarChart, Search } from "lucide-react";
import { SectionHeader } from '../../../components/SectionHeader';

export const Sheet = () => {
    const { performanceData, loading, getPerformanceDetails } = usePMContext(); // Removed `error`
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredData, setFilteredData] = useState([]);
    console.log("this is performace data", performanceData);
    useEffect(() => {
        getPerformanceDetails();
    }, []);

    useEffect(() => {
        console.log("Performance Data:", performanceData);

        if (performanceData?.data) {
            const filtered = performanceData.data.filter((data) =>
                (data.user_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
                (data.project_name?.toLowerCase() || "").includes(searchQuery.toLowerCase())
            );
            setFilteredData(filtered);
        }
    }, [searchQuery, performanceData]); // ✅ Removed `error` from dependencies

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md shadow-black/25">
            <SectionHeader icon={BarChart} title="Manage Performance Sheet22" subtitle="Track and manage performance sheets over time" />

            <div className="p-4 flex items-center gap-3">
                <div className="relative w-full max-w-md">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Search by Employee Name or Project Name..."
                    />
                    <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
            </div>

            <div className="max-w-full overflow-x-auto">
                <div className="min-w-[1102px]">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="table-bg-heading table-th-tr-row">
                                {[
                                    { label: "Date", icon: Calendar },
                                    { label: "Employee Name", icon: User },
                                    { label: "Client Name", icon: User },
                                    { label: "Project Name", icon: Briefcase },
                                    { label: "Work Type", icon: Target },
                                    { label: "Activity", icon: Clock },
                                    { label: "Time", icon: Clock },
                                    { label: "Narration", icon: FileText },
                                    { label: "Status" }
                                ].map(({ label, icon: Icon }, index) => (
                                    <th key={index} className="px-4 py-2 text-center font-semibold">
                                        <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                                            {Icon && <Icon className="h-4 w-4 text-white" />}
                                            {label}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="10" className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center gap-4">
                                            <div className="relative">
                                                <div className="h-16 w-16 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin"></div>
                                                <Loader2 className="h-8 w-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                                            </div>
                                            <span className="text-gray-600 text-lg font-medium">Loading your performance data...</span>
                                            <p className="text-gray-400">Please wait while we fetch your records</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredData.length > 0 ? (
                                filteredData.map((data, index) => (
                                    <tr key={index} className="hover:bg-blue-50/50 transition-all duration-200 ease-in-out">
                                        <td className="px-4 py-4 text-center text-gray-700 whitespace-nowrap">{data.date}</td>
                                        <td className="px-4 py-4 text-center text-gray-700 whitespace-nowrap">{data.user_name}</td>
                                        <td className="px-4 py-4 text-center text-gray-700 whitespace-nowrap">{data.client_name}</td>
                                        <td className="px-4 py-4 text-center text-gray-700 whitespace-nowrap">{data.project_name}</td>
                                        <td className="px-4 py-4 text-center text-gray-700 whitespace-nowrap">{data.work_type}</td>
                                        <td className="px-4 py-4 text-center text-gray-700 whitespace-nowrap">{data.activity_type}</td>
                                        <td className="px-4 py-4 text-center text-gray-700 whitespace-nowrap">{data.time}</td>
                                        <td className="px-4 py-4 text-center text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px] relative group"
                                            title={data.narration ?? ""}
                                            >
                                            {data.narration ? (data.narration.length > 9 ? `${data.narration.slice(0, 9)}...` : data.narration) : "--"}
                                        </td>

                                        <td className="px-4 py-4 text-center text-gray-700 whitespace-nowrap">
                                            <span
                                                className={`inline-block px-3 py-1 text-sm font-semibold rounded-full 
                                                ${data.status === "pending" ? "bg-yellow-100 text-yellow-800" : ""}
                                                ${data.status === "approved" ? "bg-green-100 text-green-800" : ""}
                                                ${data.status === "rejected" ? "bg-red-100 text-red-800" : ""}
                                                `}>{data.status}</span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="10" className="px-6 py-16 text-center text-gray-500">
                                        No performance records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
