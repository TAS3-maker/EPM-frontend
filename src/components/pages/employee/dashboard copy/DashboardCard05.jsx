import React, { useEffect, useState } from 'react';
import { API_URL } from '../../../utils/ApiConfig';
import { StatCardHeader } from "../../../components/CardsDashboard";
import { CalendarDays, UserRound, Tag, Clock, Briefcase, Loader2 } from "lucide-react"; // Added necessary icons

const DashboardCard02 = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true); // Added loading state for consistency
  const [error, setError] = useState(null);   // Added error state for consistency

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        setLoading(true); // Set loading to true before fetch
        setError(null);   // Clear any previous errors
        const token = localStorage.getItem("userToken");

        const response = await fetch(`${API_URL}/api/getleaves-byemploye`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const json = await response.json();
        if (json.success && json.data) {
          // Sort by created_at in descending order and take the latest 5
          const sortedLeaves = json.data
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 5);
          setLeaves(sortedLeaves);
        } else {
          setError(new Error(json.message || "Failed to fetch leaves."));
        }
      } catch (error) {
        console.error('Error fetching leave data:', error);
        setError(error);
      } finally {
        setLoading(false); // Set loading to false after fetch completes
      }
    };

    fetchLeaves();
  }, []);

  return (
    <div className="col-span-full xl:col-span-6 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 ease-in-out hover:shadow-2xl hover:border-blue-200">
      {/* <StatCardHeader icon={CalendarDays} title="Recent Leaves" tooltip="Displaying your latest leave applications." /> */}
      
      {/* Main content area: No horizontal padding here. All padding controlled within table cells. */}
      <div className="pt-0 pb-6 sm:pb-8 md:pb-10">
          {/* Scrollable Table Container - Only vertical scroll allowed, no horizontal overflow visible */}
          <div className="overflow-x-hidden min-h-96 max-h-[600px] overflow-y-auto custom-scrollbar">
              {/* Table - full width, fixed layout for precise column widths */}
              <table className="table-fixed w-full text-base text-gray-800">
                  {/* Table header */}
                  <thead className="text-xs font-bold tracking-wide uppercase bg-gradient-to-r from-blue-600 to-indigo-700 text-white sticky top-0 z-30 shadow-md">
                      <tr>
                          {/* Adjusted widths to ensure no cutting (sum to 100%) */}
                          <th scope="col" className="w-[28%] py-4 px-2 sm:px-3 text-left rounded-tl-2xl">
                              <div className="flex items-center gap-1.5">
                                  <UserRound size={14} className="text-blue-200" /> {/* Changed icon to UserRound */}
                                  <span>Employee Name</span>
                              </div>
                          </th>
                          <th scope="col" className="w-[20%] py-4 px-2 sm:px-3 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                  <Tag size={14} className="text-blue-200" /> {/* Added Tag icon */}
                                  <span>Leave Type</span>
                              </div>
                          </th>
                          <th scope="col" className="w-[22%] py-4 px-2 sm:px-3 text-center"> {/* Increased duration width slightly */}
                              <div className="flex items-center justify-center gap-1.5">
                                  <Clock size={14} className="text-blue-200" /> {/* Added Clock icon */}
                                  <span>Duration</span>
                              </div>
                          </th>
                          <th scope="col" className="w-[15%] py-4 px-2 sm:px-3 text-center">
                              {/* No icon for status, as it's a badge */}
                              <span>Status</span>
                          </th>
                          <th scope="col" className="w-[15%] py-4 px-2 sm:px-3 text-center rounded-tr-2xl">
                              <div className="flex items-center justify-center gap-1.5">
                                  <CalendarDays size={14} className="text-blue-200" />
                                  <span>Created Date</span>
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
                                      <span className="text-2xl font-semibold">Loading leave data...</span>
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
                      ) : leaves.length > 0 ? (
                          leaves.map((leave) => (
                              <tr key={leave.id} className={`group ${leaves.indexOf(leave) % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition duration-200 ease-in-out cursor-pointer`}>
                                  <td className="py-4 px-2 sm:px-3 font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-200">
                                      <span className="break-words">{leave.user.name}</span>
                                  </td>
                                  <td className="py-4 px-2 sm:px-3 text-center text-gray-700">{leave.leave_type}</td>
                                  <td className="py-4 px-2 sm:px-3 text-center text-gray-700 font-mono text-sm">
                                      {leave.leave_type === "Short Leave"
                                          ? `${leave.hours} hours`
                                          : `${new Date(leave.start_date).toLocaleDateString()} to ${new Date(leave.end_date).toLocaleDateString()}`}
                                  </td>
                                  <td className="py-4 px-2 sm:px-3 text-center">
                                      <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full border border-opacity-50 ${
                                          leave.status === "Approved"
                                              ? 'bg-green-100 text-green-800 border-green-300'
                                              : leave.status === "Pending"
                                                  ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                                                  : leave.status === "Rejected"
                                                      ? 'bg-red-100 text-red-800 border-red-300'
                                                      : 'bg-gray-100 text-gray-800 border-gray-300' // Default if status is unexpected
                                      }`}>
                                          {leave.status}
                                      </span>
                                  </td>
                                  <td className="py-4 px-2 sm:px-3 text-center text-gray-700 font-mono text-sm">
                                      {new Date(leave.created_at).toLocaleDateString()}
                                  </td>
                              </tr>
                          ))
                      ) : (
                          <tr>
                              <td colSpan="5" className="py-16 text-center text-gray-500 bg-gray-50 font-medium border-t border-gray-200">
                                  <div className="flex flex-col items-center justify-center space-y-3">
                                      <Briefcase className="h-14 w-14 text-gray-400 opacity-70" /> {/* Used Briefcase for general empty state icon */}
                                      <span className="text-xl">No recent leaves found!</span>
                                      <span className="text-base text-gray-600">It looks like there are no new leave applications.</span>
                                      <span className="text-sm text-gray-500">Check back later or apply for a new leave.</span>
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
};

export default DashboardCard02;