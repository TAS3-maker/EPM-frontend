import React, { useEffect, useState } from 'react';
import { API_URL } from '../../../utils/ApiConfig';
import { StatCardHeader } from "../../../components/CardsDashboard";
import { CalendarDays, Loader2 } from "lucide-react"; // ✅ add Loader2

const DashboardCard02 = () => {
  const [leaves, setLeaves] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaves = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("userToken");

        const response = await fetch(`${API_URL}/api/getall-leave-forhr`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const json = await response.json();
        if (json.success && json.data) {
          const sortedLeaves = json.data
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 5);
          setLeaves(sortedLeaves);
        }
      } catch (error) {
        console.error('Error fetching leave data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaves();
  }, []);

  return (
    <div className="col-span-full xl:col-span-6 bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
      {/* <StatCardHeader icon={CalendarDays} title="Recent Leaves" tooltip="Recently applied leaves by employees." /> */}

      <div>
        <div className="overflow-y-auto max-h-[55vh] custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-600">
              <Loader2 className="h-14 w-14 animate-spin text-gray-500" />
              <span className="text-xl font-semibold mt-4">Loading leave data...</span>
              <span className="text-base text-gray-500">Fetching recent leave applications.</span>
            </div>
          ) : (
            <table className="table-auto w-full">
              <thead className="text-xs font-semibold uppercase text-white sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-blue-800">
                <tr>
                  <th className="p-3 whitespace-nowrap text-left">
                    <div className="font-semibold tracking-wider">Employee Name</div>
                  </th>
                  <th className="p-3 whitespace-nowrap text-center">
                    <div className="font-semibold tracking-wider">Leave Type</div>
                  </th>
                  <th className="p-3 whitespace-nowrap text-center">
                    <div className="font-semibold tracking-wider">Duration</div>
                  </th>
                  <th className="p-3 whitespace-nowrap text-center">
                    <div className="font-semibold tracking-wider">Status</div>
                  </th>
                  <th className="p-3 whitespace-nowrap text-center">
                    <div className="font-semibold tracking-wider">Created Date</div>
                  </th>
                </tr>
              </thead>
              <tbody className="text-xs font-medium divide-y divide-gray-200">
                {leaves.length > 0 ? (
                  leaves.map((leave, index) => (
                    <tr
                      key={leave.id}
                      className={`
                        ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                        hover:bg-blue-50 transition duration-200 ease-in-out
                      `}
                    >
                      <td className="p-3 whitespace-nowrap">
                        <div className="text-gray-800 font-medium">{leave.user_name}</div>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <div className="text-center text-gray-700">{leave.leave_type}</div>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <div className="text-center text-gray-700">
                          {leave.leave_type === "Short Leave"
                            ? `${leave.hours} hours`
                            : `${new Date(leave.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(leave.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                        </div>
                      </td>
                      <td className="p-3 whitespace-nowrap text-center">
                        {leave.status === "Approved" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-400">
                            {leave.status}
                          </span>
                        ) : leave.status === "Pending" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-400">
                            {leave.status}
                          </span>
                        ) : leave.status === "Rejected" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-400">
                            {leave.status}
                          </span>
                        ) : null}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <div className="text-center text-gray-700">
                          {new Date(leave.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-3 text-center text-gray-500 italic">
                      No recent leaves found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardCard02;
