import React, { useEffect, useState, useContext } from "react";
import { Loader2, Calendar, User, Clock, FileText, BarChart, Search } from "lucide-react";
import { useLeave } from "../../../context/LeaveContext";
import { SectionHeader } from '../../../components/SectionHeader';

export const PMleaves = () => {
    const { pmleaves, pmLeavesfnc, postStatuses, loading, error } = useLeave();
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredData, setFilteredData] = useState([]);

    // console.log("PM leaves", pmleaves); // Keep for debugging if needed

    useEffect(() => {
        pmLeavesfnc();
    }, []);

    useEffect(() => {
        // Only filter if pmleaves data is available
        if (pmleaves && pmleaves.length > 0) {
            const lowercasedSearchTerm = searchTerm.toLowerCase();

            const filtered = pmleaves.filter(leave => {
                // Safely access properties using optional chaining (?.) and nullish coalescing (?? '')
                // This ensures .toLowerCase() is never called on undefined.

                // Check employee name (assuming it's 'user_name' based on your table render)
                const employeeName = leave.user_name ?? ''; // Use user_name from your table render
                // If it's truly employee_name as per API, then change this back to leave.employee_name ?? ''

                const startDate = leave.start_date ?? '';
                const leaveType = leave.leave_type ?? '';
                // For duration, construct the string as it's displayed in the table
                const duration = leave.hours ? `${leave.hours} hours` : "full day";
                const reason = leave.reason ?? '';
                const status = leave.status ?? '';

                return (
                    employeeName.toLowerCase().includes(lowercasedSearchTerm) ||
                    startDate.toLowerCase().includes(lowercasedSearchTerm) ||
                    leaveType.toLowerCase().includes(lowercasedSearchTerm) ||
                    duration.toLowerCase().includes(lowercasedSearchTerm) ||
                    reason.toLowerCase().includes(lowercasedSearchTerm) ||
                    status.toLowerCase().includes(lowercasedSearchTerm)
                );
            });
            setFilteredData(filtered);
        } else {
            // If pmleaves is empty or null, or no search term, set filteredData to the original pmleaves (which might be empty)
            // This ensures that when search is cleared, the full list (even if empty) is shown.
            setFilteredData(pmleaves || []); // Ensure it's an array, even if pmleaves is null/undefined
        }
    }, [searchTerm, pmleaves]); // Depend on searchTerm and pmleaves

    const handleStatusChange = async (id, newStatus) => {
        // Optimistically update the UI
        setFilteredData(prevData =>
            prevData.map(leave =>
                leave.id === id ? { ...leave, status: newStatus } : leave
            )
        );

        const updatedStatus = [{ id, status: newStatus }];
        await postStatuses(updatedStatus);
        // It's highly recommended to re-fetch or ensure the context state is updated
        // after a successful status change to keep data consistent across the app.
        // pmLeavesfnc(); // Uncomment this if postStatuses doesn't update context state
    };

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md shadow-black/25">
            <SectionHeader icon={BarChart} title="Employee Management" subtitle="Track and manage leave requests" />
            <div className="p-4 flex items-center gap-3">
                <div className="relative w-full max-w-md">
                    <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Search all columns..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
            </div>

            <div className="max-w-full overflow-x-auto">
                <div className="min-w-[800px]">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="table-bg-heading table-th-tr-row">
                                {[
                                    { label: "Date", icon: Calendar },
                                    { label: "Employee Name", icon: User },
                                    { label: "Leave Type" },
                                    { label: "Duration", icon: Clock },
                                    { label: "Reason", icon: FileText },
                                    { label: "Status" }
                                ].map(({ label, icon: Icon }, index) => (
                                    <th key={index} className="px-4 py-2 text-center font-semibold">
                                        <div className="flex items-center justify-center gap-2">
                                            {Icon && <Icon className="h-4 w-4 text-white" />}
                                            {label}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {/* Render based on filteredData state */}
                            {filteredData.length > 0 ? (
                                filteredData.map((leave) => ( // Removed index as key if 'id' is available
                                    <tr key={leave.id || leave.user_name + leave.start_date} // More robust key using id or a combination
                                        className="hover:bg-blue-50/50 transition-all duration-200 ease-in-out">
                                        <td className="px-4 py-4 text-center text-gray-700">{leave.start_date || "N/A"}</td>
                                        <td className="px-4 py-4 text-center text-gray-700">{leave.user_name || "N/A"}</td>
                                        <td className="px-4 py-4 text-center text-gray-700">{leave.leave_type || "N/A"}</td>
                                        <td className="px-4 py-4 text-center text-gray-700">
                                            {leave.hours ? `${leave.hours} Hours` : (leave.hours === 0 ? "0 Hours" : "Full Day")} {/* Handle 0 hours explicitly */}
                                        </td>
                                        <td className="px-4 py-4 text-center text-gray-700">{leave.reason || "N/A"}</td>
                                        <td className="px-6 py-4 flex items-center justify-center">
                                            <select
                                                className={`px-3 py-2 border rounded-lg cursor-pointer ${
                                                    (leave.status || '').toLowerCase() === "approved" ? "bg-green-100 text-green-700" :
                                                    (leave.status || '').toLowerCase() === "rejected" ? "bg-red-100 text-red-700" :
                                                    "bg-yellow-100 text-yellow-700"
                                                }`}
                                                value={leave.status || 'Pending'} // Default to 'Pending' if status is undefined
                                                onChange={(e) => handleStatusChange(leave.id, e.target.value)}
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Approved">Approved</option>
                                                <option value="Rejected">Rejected</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                                        {loading ? (
                                            <div className="flex items-center justify-center space-x-3">
                                                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                                                <span>Loading leave requests...</span>
                                            </div>
                                        ) : searchTerm && pmleaves.length > 0 ? (
                                            "No matching leave requests found."
                                        ) : error ? (
                                            `Error loading data: ${error}`
                                        ) : (
                                            "No leave requests to display."
                                        )}
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