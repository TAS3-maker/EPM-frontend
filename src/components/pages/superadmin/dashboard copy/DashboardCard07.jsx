import React, { useState, useEffect } from 'react';
import { Loader2, X, User, Clock, CheckCircle, XCircle, Calendar } from "lucide-react";
import { API_URL } from "../../../utils/ApiConfig";
import { useNavigate } from 'react-router-dom';

function DashboardCard07() {
  const [teamData, setTeamData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const token = localStorage.getItem("userToken");

  const navigate = useNavigate();
  const userRole = localStorage.getItem("user_name");

  // Fetch team-wise weekly working hours data
  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/api/team-wise-daily-working-hours`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
      })
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

  const handleTeamClick = (team) => {
    setSelectedTeam(team);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTeam(null);
  };

  const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split("T")[0]; // YYYY-MM-DD
};

const handleViewClick = (team) => {
  const teamName = encodeURIComponent(team.teamName);

  const today = getTodayDate();

  navigate(
    `/${userRole}/reporting/team-data/${teamName}?start_date=${today}&end_date=${today}`
  );
};

const handleTeamViewClick = (userId) => {
    
    navigate(`/${userRole}/users/${userId}`);
  };



  return (
    <>
      <div className="col-span-full bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
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
                      onClick={() => handleTeamClick(team)}
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

      {/* Team Members Modal */}
      {showModal && selectedTeam && (
        <div className=" testing fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl max-h-[90vh] w-full overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <User className="h-7 w-7 text-blue-600" />
                    {selectedTeam.teamName} Team Members
                  </h2>
                  <p className="text-gray-600 mt-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {selectedTeam.selectedDate} | {selectedTeam.totalTeamMembers} members
                  </p>
                </div>
                <div className='flex items-center gap-2'>
                  <button 
                    className='shadow-sm border border-blue-200 bg-blue-100 text-blue-800 transition-shadow hover:shadow-lg duration-300 rounded-lg px-2 py-2 transition-all duration-200 group text-xs font-medium' 
                    onClick={() => handleViewClick(selectedTeam)}

                  >
                    View more
                 </button>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-gray-200 transition-all duration-200"
                >
                  <X className="h-6 w-6" />
                </button>
                </div>
              </div>
            </div>

            {/* Team Summary */}
            <div className="p-6 bg-gray-50 border-b">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-white p-4 rounded-xl shadow-sm border">
                  <div className="text-2xl font-bold text-blue-600">{selectedTeam.totalTeamMembers}</div>
                  <div className="text-gray-600">Total Members</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border">
                  <div className="text-lg font-semibold text-green-600">{formatHours(selectedTeam.totalHours)}</div>
                  <div className="text-xs text-gray-600 uppercase tracking-wider">Actual Hours</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border">
                  <div className="text-lg font-semibold text-blue-600">{formatHours(selectedTeam.expectedHours)}</div>
                  <div className="text-xs text-gray-600 uppercase tracking-wider">Expected Hours</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border">
                  <div className="text-xl font-bold text-yellow-600">
                    {getUtilization(selectedTeam.expectedHours, selectedTeam.totalHours)}
                  </div>
                  <div className="text-xs text-gray-600 uppercase tracking-wider">Utilization</div>
                </div>
              </div>
            </div>

            {/* Members Table */}
            <div className="flex-1 overflow-auto p-6">
              <div className="w-full overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Member Name
                      </th>
                      <th className="px-4 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Expected
                      </th>
                      <th className="px-4 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Actual
                      </th>
                      <th className="px-4 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Utilization
                      </th>
                      <th className="px-4 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Leave Hours
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedTeam.teamMembers.map((member, index) => {
                      const utilization = getUtilization(member.expected_hours, member.actual_hours);
                      const utilColor = parseFloat(utilization) >= 90 ? 'text-green-600' : 
                                      parseFloat(utilization) >= 75 ? 'text-yellow-600' : 'text-red-600';
                      
                      return (
                        <tr key={member.user_id} className={`hover:bg-blue-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`} onClick={() => handleTeamViewClick(member.user_id)} >
                          <td className="px-6 py-4">
                            <HoverCell text={member.name} maxLength={25} />
                          </td>
                          <td className="px-4 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {member.availability === "Available" ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                member.availability === "Available" 
                                  ? "bg-green-100 text-green-800" 
                                  : "bg-red-100 text-red-800"
                              }`}>
                                {member.availability}
                              </span>
                              {member.leave_type && (
                                <div className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                                  {member.leave_type}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center text-sm font-medium text-gray-900">
                            {formatHours(member.expected_hours)}
                          </td>
                          <td className="px-4 py-4 text-center text-sm font-semibold text-blue-600">
                            {formatHours(member.actual_hours)}
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className={`font-bold text-lg ${utilColor}`}>
                              {utilization}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center text-sm text-gray-700">
                            {formatHours(member.leave_hours)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {selectedTeam.teamMembers.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No team members data available
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DashboardCard07;
