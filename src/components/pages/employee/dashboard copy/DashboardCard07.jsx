import React from 'react';
import { useUserContext } from "../../../context/UserContext";
import { StatCardHeader } from "../../../components/CardsDashboard";
import { Briefcase, Loader2, CalendarDays, UserRound, Clock, Tag } from "lucide-react"; // All necessary icons

function DashboardCard07() {
    const { performanceSheets, loading, error } = useUserContext();

    console.log("Performance Sheets Data:", performanceSheets);
    // Sort the data by date and get the latest 7 records
    const sortedSheets = performanceSheets?.data?.sheets
        ? performanceSheets.data.sheets
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 7)
        : [];

    return (
        <div className="col-span-full xl:col-span-6 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 ease-in-out hover:shadow-2xl hover:border-blue-200">
            {/* <StatCardHeader icon={Briefcase} title="Recent Performance Sheets" tooltip="Displaying your latest activity records." /> */}
            
            {/* Main content area: No horizontal padding here. All padding controlled within table cells. */}
            <div className="pt-0 pb-6 sm:pb-8 md:pb-10">
                {/* Scrollable Table Container - Only vertical scroll allowed, no horizontal overflow visible */}
                <div className="overflow-x-hidden min-h-96 max-h-[600px] overflow-y-auto custom-scrollbar">
                    {/* Table - full width, fixed layout for precise column widths */}
                    <table className="table-fixed w-full text-base text-gray-800">
                        {/* Table header */}
                        <thead className="text-xs font-bold tracking-wide uppercase bg-gradient-to-r from-blue-600 to-indigo-700 text-white sticky top-0 z-30 shadow-md"> {/* Blue gradient header, slightly smaller text */}
                            <tr>
                                {/* Adjusted widths to ensure no cutting (sum to 100%) */}
                                <th scope="col" className="w-[28%] py-4 px-2 sm:px-3 text-left rounded-tl-2xl"> {/* More space for project name */}
                                    <div className="flex items-center gap-1.5"> {/* Reduced gap slightly more */}
                                        <Briefcase size={14} className="text-blue-200" /> {/* Smaller icon */}
                                        <span>Project Name</span>
                                    </div>
                                </th>
                                <th scope="col" className="w-[20%] py-4 px-2 sm:px-3 text-center">
                                    <div className="flex items-center justify-center gap-1.5">
                                        <UserRound size={14} className="text-blue-200" />
                                        <span>Client Name</span>
                                    </div>
                                </th>
                                <th scope="col" className="w-[18%] py-4 px-2 sm:px-3 text-center">
                                    <div className="flex items-center justify-center gap-1.5">
                                        <Clock size={14} className="text-blue-200" />
                                        <span>Time Spent</span>
                                    </div>
                                </th>
                                <th scope="col" className="w-[17%] py-4 px-2 sm:px-3 text-center">
                                    <div className="flex items-center justify-center gap-1.5">
                                        <Tag size={14} className="text-blue-200" />
                                        <span>Work Type</span>
                                    </div>
                                </th>
                                <th scope="col" className="w-[17%] py-4 px-2 sm:px-3 text-center rounded-tr-2xl">
                                    <div className="flex items-center justify-center gap-1.5">
                                        <CalendarDays size={14} className="text-blue-200" />
                                        <span>Status</span>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        {/* Table body */}
                        <tbody className="bg-white divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-16 text-center bg-gray-50 text-gray-600">
                                        <div className="flex flex-col items-center justify-center space-y-4">
                                            <Loader2 className="h-14 w-14 animate-spin text-gray-500" />
                                            <span className="text-2xl font-semibold">Loading performance data...</span>
                                            <span className="text-lg text-gray-500">Please wait, this might take a moment.</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="5" className="py-16 text-center bg-red-50 text-red-700 font-semibold border-t border-red-200">
                                        <div className="flex flex-col items-center justify-center space-y-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-xl">Oops! Error fetching data.</span>
                                            <span className="text-base text-red-600">Details: {error.message || "Unknown error occurred."}</span>
                                            <span className="text-sm text-gray-500">Please check your connection or try again later.</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : sortedSheets.length > 0 ? (
                                sortedSheets.map((sheet, index) => (
                                    <tr key={sheet.id} className={`group ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition duration-200 ease-in-out cursor-pointer`}>
                                        <td className="py-4 px-2 sm:px-3 font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-200">
                                            {/* Ensure text wraps if too long */}
                                            <span className="break-words">{sheet.project_name}</span>
                                        </td>
                                        <td className="py-4 px-2 sm:px-3 text-center text-gray-700">{sheet.client_name}</td>
                                        <td className="py-4 px-2 sm:px-3 text-center text-gray-700 font-mono text-sm">{sheet.time}</td>
                                        <td className="py-4 px-2 sm:px-3 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full border border-opacity-50 ${sheet.work_type === 'WFO' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-blue-100 text-blue-800 border-blue-300'}`}>
                                                {sheet.work_type}
                                            </span>
                                        </td>
                                        <td className="py-4 px-2 sm:px-3 text-center">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full border border-opacity-50 ${
                                                    sheet.status === 'approved'
                                                        ? 'bg-green-100 text-green-800 border-green-300'
                                                        : sheet.status === 'rejected'
                                                            ? 'bg-red-100 text-red-800 border-red-300'
                                                            : sheet.status === 'Pending'
                                                                ? 'bg-yellow-100 text-yellow-800 border-yellow-300' // Using yellow, not amber, for Pending
                                                                : sheet.status === 'show'
                                                                    ? 'bg-purple-100 text-purple-800 border-purple-300'
                                                                    : 'bg-gray-100 text-gray-800 border-gray-300'
                                                }`}
                                            >
                                                {sheet.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-16 text-center text-gray-500 bg-gray-50 font-medium border-t border-gray-200">
                                        <div className="flex flex-col items-center justify-center space-y-3">
                                            <Briefcase className="h-14 w-14 text-gray-400 opacity-70" />
                                            <span className="text-xl">No performance sheets found!</span>
                                            <span className="text-base text-gray-600">It looks like you haven't added any activities yet.</span>
                                            <span className="text-sm text-gray-500">Get started by creating your first performance sheet.</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Custom scrollbar styles */}
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f8fafc; /* bg-gray-50 equivalent for track */
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1; /* Gray-300 for thumb */
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8; /* Gray-400 on hover */
                }
            `}</style>
        </div>
    );
}

export default DashboardCard07;