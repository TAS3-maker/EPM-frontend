import React, { useState, useEffect } from 'react';
import { SectionHeader } from "../../../components/SectionHeader";
import { Loader2, CheckCircle, XCircle, BarChart, Calendar } from "lucide-react";
import { API_URL } from "../../../utils/ApiConfig";
import { useParams, useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { ClearButton, TodayButton, YesterdayButton, WeeklyButton, IconViewButton, CustomButton, CancelButton } from "../../../AllButtons/AllButtons";

const SheetTeamData = () => {
  const { teamName } = useParams();
  const [teamData, setTeamData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const token = localStorage.getItem("userToken");
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const userRole = localStorage.getItem("user_name");
  const [isCustomMode, setIsCustomMode] = useState(false);

  const [startDate, setStartDate] = useState(
    searchParams.get("start_date") || new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    searchParams.get("end_date") || new Date().toISOString().split("T")[0]
  );

  // HoverCell Component
  const HoverCell = ({ text, maxLength = 25 }) => (
    <div className="relative group max-w-full overflow-visible">
      <span className="block overflow-hidden text-ellipsis whitespace-nowrap">
        {text?.length > maxLength ? `${text.substring(0, maxLength)}...` : text || '-'}
      </span>
      <div className="absolute z-[9999] hidden group-hover:block bg-white shadow-lg 
                      p-2 rounded whitespace-pre-wrap text-black border top-full mt-1 
                      left-0 max-w-[300px] text-xs">
        {text || '-'}
      </div>
    </div>
  );

  // Format hours helper
  const formatHours = (hoursStr) => {
    if (!hoursStr || hoursStr === "00:00") return "0h 0m";
    const [hours, minutes] = hoursStr.split(':').map(Number);
    return `${hours}h ${minutes}m`;
  };

  // 🔥 NEW UTILIZATION: (Billable + Inhouse) / (Billable + Inhouse + No Work)
  const timeToMinutes = (time) => {
    if (!time || time === "00:00") return 0;
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  const getUtilization = (billable, inhouse, noWork) => {
    const billableMinutes = timeToMinutes(billable);
    const inhouseMinutes = timeToMinutes(inhouse);
    const noWorkMinutes = timeToMinutes(noWork);
    
    const productiveMinutes = billableMinutes + inhouseMinutes;
    const totalMinutes = productiveMinutes + noWorkMinutes;
    
    if (totalMinutes === 0) return "0%";
    const utilization = ((productiveMinutes / totalMinutes) * 100).toFixed(1);
    return `${utilization}%`;
  };

  useEffect(() => {
    const fetchTeamData = async () => {
      if (!teamName || !startDate || !endDate) return;
      
      try {
        setIsLoading(true);
        
        // 🔥 SAME NEW API ENDPOINT as parent
        const hoursUrl = `${API_URL}/api/team-wise-daily-working-hours-by-performa?team_name=${encodeURIComponent(teamName)}&start_date=${startDate}&end_date=${endDate}`;
        console.log('📊 Team Data API:', hoursUrl);
        
        const response = await fetch(hoursUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
        });
        
        const result = await response.json();
        console.log('✅ API DATA:', result);
        
        if (result.success && result.data?.length > 0) {
          const matchedTeam = result.data.find(team => 
            (team?.teamName || team?.name || '').trim() === teamName.trim()
          );
          
          if (matchedTeam) {
            setTeamData({
              ...matchedTeam,
              teamName: matchedTeam.teamName || matchedTeam.name || teamName,
              totalTeamMembers: matchedTeam.totalTeamMembers || matchedTeam.teamMembers?.length || 0,
              billableHours: matchedTeam.billableHours || '00:00',
              inhouseHours: matchedTeam.inhouseHours || '00:00',
              noWorkHours: matchedTeam.noWorkHours || '00:00',
              teamMembers: matchedTeam.teamMembers || []
            });
            console.log('✅ LOADED:', matchedTeam.teamName, matchedTeam.teamMembers.length, 'members');
            return;
          }
        }
        
        console.error('❌ No matching team found');
        setTeamData(null);
      } catch (error) {
        console.error('Error:', error);
        setTeamData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamData();
  }, [teamName, startDate, endDate, token]);

  useEffect(() => {
    if (!startDate || !endDate) return;
    setSearchParams({
      start_date: startDate,
      end_date: endDate,
    });
  }, [startDate, endDate, setSearchParams]);

  const setTodayFilter = () => {
    const today = new Date().toISOString().split("T")[0];
    setStartDate(today);
    setEndDate(today);
  };

  const setYesterdayFilter = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const y = d.toISOString().split("T")[0];
    setStartDate(y);
    setEndDate(y);
  };

  const setWeeklyFilter = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 6);
    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
  };

  const clearFilters = () => {
    setIsCustomMode(false);
    const today = new Date().toISOString().split("T")[0];
    setStartDate(today);
    setEndDate(today);
  };

  const handleViewClick = (userId) => {
    navigate(`/${userRole}/user-sheets/${userId}?start_date=${startDate}&end_date=${endDate}`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
        <span className="text-lg text-gray-600">Loading {teamName} data...</span>
      </div>
    );
  }

  if (!teamData) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-2xl mb-4">No data available</div>
        <div className="text-lg mb-4">for team: <strong>"{teamName}"</strong></div>
      </div>
    );
  }

  return (
    <>
      <SectionHeader
        icon={BarChart}
        title={`${teamData.teamName} Details`}
        subtitle={`${startDate} to ${endDate} | ${teamData.totalTeamMembers} members`}
      />
      
      {/* Unified Header */}
      <div className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 
                      border border-gray-200 rounded-b-2xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-blue-600 text-white shadow">
              <BarChart className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                {teamData.teamName}
              </h1>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full 
                          bg-blue-100 text-blue-800 text-sm font-semibold">
            <Calendar className="h-4 w-4" />
            {startDate} → {endDate}
          </div>
        </div>

        <div className="my-4 border-t border-gray-200" />

        <div className="flex flex-wrap items-center gap-2">
          <TodayButton onClick={setTodayFilter} />
          <YesterdayButton onClick={setYesterdayFilter} />
          <WeeklyButton onClick={setWeeklyFilter} />

          {!isCustomMode ? (
            <CustomButton onClick={() => setIsCustomMode(true)} />
          ) : (
            <div className="flex flex-wrap items-center gap-2 ml-2">
              <input
                type="date"
                value={startDate}
                max={endDate || undefined}
                onChange={(e) => setStartDate(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm bg-white 
                           focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm bg-white 
                           focus:ring-2 focus:ring-blue-500"
              />
              <ClearButton onClick={clearFilters} />
              <CancelButton onClick={() => setIsCustomMode(false)} />
            </div>
          )}
        </div>
      </div>

      {/* 🔥 UPDATED SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 bg-gray-50 rounded-2xl">
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="text-xl font-bold text-blue-600">{teamData.totalTeamMembers}</div>
          <div className="text-gray-600 mt-1">Total Members</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="text-xl font-bold text-green-600">{formatHours(teamData.billableHours)}</div>
          <div className="text-xs text-gray-600 uppercase tracking-wider mt-1">Billable Hours</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="text-xl font-bold text-purple-600">{formatHours(teamData.inhouseHours)}</div>
          <div className="text-xs text-gray-600 uppercase tracking-wider mt-1">Inhouse Hours</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="text-xl font-bold text-orange-600">
            {getUtilization(teamData.billableHours, teamData.inhouseHours, teamData.noWorkHours)}
          </div>
          <div className="text-xs text-gray-600 uppercase tracking-wider mt-1">Utilization</div>
        </div>
      </div>

      {/* 🔥 UPDATED TABLE - Billable | Inhouse | No Work */}
      <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
          <table className="table-auto w-full min-w-[900px]">
            <thead className="text-xs font-semibold uppercase text-white sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-blue-800">
              <tr>
                <th className="px-6 py-4 text-left w-64">Member Name</th>
                <th className="px-4 py-4 text-center w-32">Billable</th>
                <th className="px-4 py-4 text-center w-32">Inhouse</th>
                <th className="px-4 py-4 text-center w-32">No Work</th>
                <th className="px-4 py-4 text-center w-28">Utilization</th>
                <th className="px-4 py-4 text-center w-28">Leave Hours</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium divide-y divide-gray-200">
              {teamData.teamMembers?.length > 0 ? (
                teamData.teamMembers.map((member, index) => {
                  const utilization = getUtilization(member.billable, member.inhouse, member.no_work);
                  const utilNum = parseFloat(utilization);
                  const utilColor = utilNum >= 90 ? 'text-green-600' : 
                                    utilNum >= 70 ? 'text-yellow-600' : 'text-red-600';
                  
                  return (
                    <tr key={member.user_id} className={`hover:bg-blue-50/50 transition-colors cursor-pointer ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`} onClick={() => handleViewClick(member.user_id)}>
                      <td className="px-6 py-4 font-medium">
                        <HoverCell text={member.name} maxLength={30} />
                      </td>
                      <td className="px-4 py-4 text-center text-sm font-semibold text-green-600">
                        {formatHours(member.billable)}
                      </td>
                      <td className="px-4 py-4 text-center text-sm font-semibold text-purple-600">
                        {formatHours(member.inhouse)}
                      </td>
                      <td className="px-4 py-4 text-center text-sm font-semibold text-orange-600">
                        {formatHours(member.no_work)}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`font-bold text-lg ${utilColor}`}>
                          {utilization}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center text-sm text-gray-700">
                        {formatHours(member.leave)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-gray-500">
                    No team members data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default SheetTeamData;
