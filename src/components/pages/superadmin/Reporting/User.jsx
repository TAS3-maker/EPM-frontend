import React, { useState, useEffect } from 'react';
import { SectionHeader } from "../../../components/SectionHeader";
import { Loader2, CheckCircle, XCircle, BarChart,Calendar } from "lucide-react";
import { API_URL } from "../../../utils/ApiConfig";
import { useParams, useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { ClearButton, TodayButton, YesterdayButton, WeeklyButton,IconViewButton, CustomButton, CancelButton } from "../../../AllButtons/AllButtons";
import GlobalTable from "../../../components/GlobalTable";


const TeamData = () => {
  const { teamName } = useParams();
  const [teamData, setTeamData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  // const [searchParams] = useSearchParams();
  const token = localStorage.getItem("userToken");
 const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const userRole = localStorage.getItem("user_name");



  const [isCustomMode, setIsCustomMode] = useState(false);

  const [startDate, setStartDate] = useState(
    searchParams.get("start_date") ||
      new Date().toISOString().split("T")[0]
  );

  const [endDate, setEndDate] = useState(
    searchParams.get("end_date") ||
      new Date().toISOString().split("T")[0]
  );
  // const startDate = searchParams.get('start_date') || '';
  // const endDate = searchParams.get('end_date') || '';

  // HoverCell Component
  const HoverCell = ({ text, maxLength = 25 }) => (
    <div className="relative group font-semibold max-w-full overflow-visible">
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

  // Format hours helper - EXACTLY from API
  const formatHours = (hoursStr) => {
    if (!hoursStr || hoursStr === "00:00") return "0h 0m";
    const [hours, minutes] = hoursStr.split(':').map(Number);
    return `${hours}h ${minutes}m`;
  };

  // Utilization - calculated from API data
  const getUtilization = (expected, actual) => {
    if (!expected || expected === "00:00") return "0%";
    const [expH, expM] = expected.split(':').map(Number);
    const [actH, actM] = actual.split(':').map(Number);
    const expectedTotal = expH * 60 + expM;
    const actualTotal = actH * 60 + actM;
    const percentage = ((actualTotal / expectedTotal) * 100).toFixed(1);
    return `${percentage}%`;
  };

  useEffect(() => {
    const fetchTeamData = async () => {
      if (!teamName || !startDate || !endDate) return;
      
      try {
        setIsLoading(true);
        
        // 🚀 DIRECT API CALL - NO FALLBACK NEEDED
        const hoursUrl = `${API_URL}/api/team-wise-daily-working-hours?team_name=${encodeURIComponent(teamName)}&start_date=${startDate}&end_date=${endDate}`;
        console.log('📊 Hours API:', hoursUrl);
        
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
          // ✅ EXACT MATCH - NO TRANSFORMATION NEEDED
          const matchedTeam = result.data.find(team => 
            (team?.teamName || team?.name || '').trim() === teamName.trim()
          );
          
          if (matchedTeam) {
            // ✅ USE API DATA DIRECTLY - PERFECT STRUCTURE!
            setTeamData({
              ...matchedTeam,
              teamName: matchedTeam.teamName || matchedTeam.name || teamName,
              totalTeamMembers: matchedTeam.totalTeamMembers || matchedTeam.teamMembers?.length || 0,
              totalHours: matchedTeam.totalHours || '00:00',
              expectedHours: matchedTeam.expectedHours || '34:00',
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

 // const handleViewClick = (userId) => {
 //    navigate(`/${userRole}/users/${userId}`);
 //  };
const handleViewClick = (member) => {
  const userId = member.user_id || member.id;
  console.log('User ID:', userId); 
  navigate(`/${userRole}/users/${userId}`);
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


// GlobalTable Columns - EXACT same design
  const tableColumns = [
    {
      key: 'name',
      label: 'Member Name',
      width: '256px',
      headerClassName: 'px-6 py-4 text-left w-64 text-white font-semibold uppercase text-xs sticky top-0 z-10',
      render: (member) => (
        <div className=" font-medium text-left">
          <HoverCell text={member.name} maxLength={30} />
        </div>
      )
    },
    {
      key: 'expected_hours',
      label: 'Expected',
      width: '128px',
      headerClassName: 'px-4 py-4 text-center w-32 text-white font-semibold uppercase text-xs sticky top-0 z-10 ',
      render: (member) => (
        <td className="block text-center text-sm font-medium text-gray-900">
          {formatHours(member.expected_hours)}
        </td>
      )
    },
    {
      key: 'actual_hours',
      label: 'Actual',
      width: '128px',
      headerClassName: 'px-4 py-4 text-center w-32 text-white font-semibold uppercase text-xs sticky top-0 z-10',
      render: (member) => (
        <div className="text-center text-sm font-semibold text-blue-600">
          {formatHours(member.actual_hours)}
        </div>
      )
    },
    {
      key: 'utilization',
      label: 'Utilization',
      width: '112px',
      headerClassName: 'px-4 py-4 text-center w-28 text-white font-semibold uppercase text-xs sticky top-0 z-10',
      render: (member) => {
        const utilization = getUtilization(member.expected_hours, member.actual_hours);
        const utilColor = parseFloat(utilization) >= 90 ? 'text-green-600' : 
                          parseFloat(utilization) >= 75 ? 'text-yellow-600' : 'text-red-600';
        return (
          <div className=" text-center">
            <span className={`font-bold text-lg ${utilColor}`}>
              {utilization}
            </span>
          </div>
        );
      }
    },
    {
      key: 'leave_hours',
      label: 'Leave Hours',
      width: '112px',
      headerClassName: 'px-4 py-4 text-center w-28 text-white font-semibold uppercase text-xs sticky top-0 z-10 ',
      render: (member) => (
        <div className=" text-center font-semibold text-sm text-gray-700">
          {formatHours(member.leave_hours)}
        </div>
      )
    }
  ];



  
  return (
    <>
      <SectionHeader
        icon={BarChart}
        title={`${teamData.teamName} Details`}
        subtitle={`${startDate} to ${endDate} | ${teamData.totalTeamMembers} members`}
      />
{/* 🔹 Unified Header */}
<div className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 
                border border-gray-200 rounded-b-2xl shadow-sm p-6 ">

  {/* Top Row: Title */}
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div className="flex items-start gap-4">
      <div className="p-3 rounded-xl bg-blue-600 text-white shadow">
        <BarChart className="h-4 w-4" />
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900 leading-tight">
          {teamData.teamName}
        </h1>
        {/* <p className="text-sm text-gray-600 mt-1">
          {teamData.totalTeamMembers} members · {startDate} → {endDate}
        </p> */}
      </div>
    </div>

    {/* Active Range Badge */}
    <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full 
                    bg-blue-100 text-blue-800 text-sm font-semibold">
      <Calendar className="h-4 w-4" />
      {startDate} → {endDate}
    </div>
  </div>

  {/* Divider */}
  <div className="my-4 border-t border-gray-200" />

  {/* Bottom Row: Filters */}
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



      {/* ✅ API DATA DIRECTLY */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6  p-6 bg-gray-50 rounded-2xl">
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="text-xl font-bold text-blue-600">{teamData.totalTeamMembers}</div>
          <div className="text-gray-600 mt-1">Total Members</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="text-xl font-bold text-green-600">{formatHours(teamData.totalHours)}</div>
          <div className="text-xs text-gray-600 uppercase tracking-wider mt-1">Actual Hours</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="text-xl font-bold text-blue-600">{formatHours(teamData.expectedHours)}</div>
          <div className="text-xs text-gray-600 uppercase tracking-wider mt-1">Expected Hours</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="text-xl font-bold text-yellow-600">
            {getUtilization(teamData.expectedHours, teamData.totalHours)}
          </div>
          <div className="text-xs text-gray-600 uppercase tracking-wider mt-1">Utilization</div>
        </div>
      </div>

      {/* ✅ TABLE SHOWS EXACT API DATA */}
      <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
       <div className="[&_.table]:table-auto [&_.table]:min-w-[1200px]">
          <GlobalTable
            data={teamData.teamMembers || []}
            columns={tableColumns}
            isLoading={isLoading}
            stickyHeader={true}
            enablePagination={false}
            hideActions={true}
            onRowClick={handleViewClick}
            emptyStateTitle="No team members data available"
            emptyStateMessage="Please check the date range or team selection."
            className="!max-h-[70vh] text-left overflow-y-auto [&_thead]:sticky top-0  [&_thead_th]:z-20 [&_thead_th]:text-white [&_thead_th]:shadow-sm"
          />
        </div>
      </div>
    </>
  );
};

export default TeamData;
