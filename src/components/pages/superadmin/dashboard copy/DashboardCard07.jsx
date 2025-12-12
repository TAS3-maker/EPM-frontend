import React, { useState, useEffect } from 'react';
import { Loader2 } from "lucide-react";

function DashboardCard07() {
  const [teamData, setTeamData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const token = localStorage.getItem("userToken");
  // Fetch team-wise weekly working hours data
  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('https://emp-staging.techarchsoftwares.com/api/api/team-wise-daily-working-hours', {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },})
        const result = await response.json();
        if (result.success) {
          setTeamData(result.data);
        }
      } catch (error) {
        console.error('Error fetching team data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamData();
  }, []);

  const HoverCell = ({ text, maxLength = 20 }) => (
    <div className="relative group max-w-full overflow-visible">
      <span className="block overflow-hidden text-ellipsis whitespace-nowrap">
        {text?.length > maxLength ? `${text.substring(0, maxLength)}...` : text || '-'}
      </span>
      <div
        className="absolute z-[9999] hidden group-hover:block bg-white shadow-lg 
                   p-2 rounded whitespace-pre-wrap text-black border top-full mt-1 
                   left-0 max-w-[300px] text-xs"
      >
        {text || '-'}
      </div>
    </div>
  );

  // Format hours (e.g., "416:30" → "416h 30m")
  const formatHours = (hoursStr) => {
    if (!hoursStr || hoursStr === "00:00") return "0h 0m";
    const [hours, minutes] = hoursStr.split(':').map(Number);
    return `${hours}h ${minutes}m`;
  };

  // Calculate utilization percentage
  const getUtilization = (expected, actual) => {
    if (!expected || expected === "00:00") return "0%";
    const [expH, expM] = expected.split(':').map(Number);
    const [actH, actM] = actual.split(':').map(Number);
    const expectedTotal = expH * 60 + expM;
    const actualTotal = actH * 60 + actM;
    const percentage = ((actualTotal / expectedTotal) * 100).toFixed(1);
    return `${percentage}%`;
  }

  return (
    <div className="col-span-full  bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto min-h-96 max-h-[600px] overflow-y-auto custom-scrollbar">
        <table className="table-auto w-full min-w-[800px]">
          <thead className="text-xs font-semibold uppercase text-white sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-blue-800">
            <tr>
              <th className="p-4 whitespace-nowrap text-left w-48">
                <div className="font-semibold tracking-wider">Team Name</div>
              </th>
              <th className="p-4 whitespace-nowrap text-center w-24">
                <div className="font-semibold tracking-wider">Members</div>
              </th>
              <th className="p-4 whitespace-nowrap text-center w-32">
                <div className="font-semibold tracking-wider">Expected</div>
              </th>
              <th className="p-4 whitespace-nowrap text-center w-32">
                <div className="font-semibold tracking-wider">Actual</div>
              </th>
              <th className="p-4 whitespace-nowrap text-center w-24">
                <div className="font-semibold tracking-wider">Utilization</div>
              </th>
              <th className="p-4 whitespace-nowrap text-center w-24">
                <div className="font-semibold tracking-wider">Leaves</div>
              </th>
              <th className="p-4 whitespace-nowrap text-center w-28">
                <div className="font-semibold tracking-wider">Leave Hours</div>
              </th>
            </tr>
          </thead>
          <tbody className="text-sm font-medium divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan="7" className="p-12">
                  <div className="flex flex-col items-center justify-center space-y-4 py-8">
                    <Loader2 className="h-14 w-14 animate-spin text-blue-500" />
                    <span className="text-xl font-semibold text-gray-600">Loading team data...</span>
                    <span className="text-base text-gray-500">Fetching weekly working hours overview.</span>
                  </div>
                </td>
              </tr>
            ) : teamData.length > 0 ? (
              teamData.map((team, index) => {
                const utilization = getUtilization(team.expectedHours, team.totalHours);
                const utilColor = parseFloat(utilization) >= 90 ? 'text-green-600' : 
                                parseFloat(utilization) >= 75 ? 'text-yellow-600' : 'text-red-600';
                
                return (
                  <tr
                    key={team.teamName}
                    className={`
                      ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                      hover:bg-blue-50 transition duration-200 ease-in-out cursor-pointer
                      group/team
                    `}
                  >
                    <td className="py-4 px-3 font-semibold text-gray-900 group-hover/team:text-blue-700 transition-colors duration-200">
                      <HoverCell text={team.teamName} maxLength={25} />
                    </td>
                    <td className="py-4 px-2 text-center text-gray-700 font-medium">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {team.totalTeamMembers || 0}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-center text-gray-700 font-medium">
                      <HoverCell text={team.expectedHours} />
                      <div className="text-xs text-gray-500 mt-1">{formatHours(team.expectedHours)}</div>
                    </td>
                    <td className="py-4 px-2 text-center text-gray-700 font-semibold">
                      <HoverCell text={team.totalHours} />
                      <div className="text-xs text-gray-500 mt-1">{formatHours(team.totalHours)}</div>
                    </td>
                    <td className="py-4 px-2 text-center">
                      <span className={`font-bold text-lg ${utilColor}`}>
                        {utilization}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-center text-gray-700 font-medium">
                      {team.totalTeamLeaves || 0}
                    </td>
                    <td className="py-4 px-2 text-center text-gray-700">
                      <HoverCell text={team.leaveHours} />
                      <div className="text-xs text-gray-500 mt-1">{formatHours(team.leaveHours)}</div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="p-12 text-center">
                  <div className="text-gray-500 italic">
                    No team data available for this week.
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DashboardCard07;
