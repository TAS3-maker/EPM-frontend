import { SectionHeader } from "../../../components/SectionHeader";
import React, { useState, useEffect } from 'react';
import { Loader2, X, User, Clock, CheckCircle, XCircle, Calendar, BarChart } from "lucide-react";
import { API_URL } from "../../../utils/ApiConfig";
import { ClearButton, TodayButton, YesterdayButton, WeeklyButton,IconViewButton, CustomButton, CancelButton } from "../../../AllButtons/AllButtons";
import { useNavigate } from "react-router-dom";
import { Today } from "@mui/icons-material";
import GlobalTable from "../../../components/GlobalTable"; 

const ReportingManagement = () => {
  const [allTeamData, setAllTeamData] = useState([]);
  const [filteredTeamData, setFilteredTeamData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const token = localStorage.getItem("userToken");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCustomMode, setIsCustomMode] = useState(false);
  
  const userRole = localStorage.getItem("user_name");
  const navigate = useNavigate();
useEffect(() => {
  // Set today's date on first mount
  const today = new Date().toISOString().split('T')[0];
  setStartDate(today);
  setEndDate(today);
}, []);
  // ✅ NO API call on first mount - only when dates selected
  useEffect(() => {
    const fetchTeamData = async () => {
      if (!startDate || !endDate) return;
      
      try {
        setIsLoading(true);
        const url = `${API_URL}/api/team-wise-daily-working-hours?start_date=${startDate}&end_date=${endDate}`;
        
        console.log('📅 Fetching range:', url);
        
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
        });
        
        const result = await response.json();
        console.log('📊 API Response:', result);
        
        if (result.success) {
          const dataWithDates = result.data.map(team => ({
            ...team,
            dateRange: `${startDate} to ${endDate}`
          }));
          
          setAllTeamData(dataWithDates);
          setFilteredTeamData(dataWithDates);
        }
      } catch (error) {
        console.error('Error fetching team data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamData();
  }, [startDate, endDate, token]);

  // ✅ Filter by search only
  useEffect(() => {
    let filtered = [...allTeamData];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(team => 
        team.teamName.toLowerCase().includes(query) ||
        team.teamMembers.some(member => 
          member.name.toLowerCase().includes(query)
        )
      );
    }

    setFilteredTeamData(filtered);
  }, [searchQuery, allTeamData]);

  // ✅ Quick filter buttons
  const setTodayFilter = () => {
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
  };

  const setYesterdayFilter = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    setStartDate(yesterdayStr);
    setEndDate(yesterdayStr);
  };

  const setWeeklyFilter = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 6);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

const clearFilters = () => {
  const today = new Date().toISOString().split('T')[0];
  setStartDate(today);
  setEndDate(today);
  setSearchQuery("");
};


  const HoverCell = ({ text, maxLength = 20 }) => (
    <div className="relative group font-semibold max-w-full overflow-visible text-left">
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

  const formatHours = (hoursStr) => {
    if (!hoursStr || hoursStr === "00:00") return "0h 0m";
    const [hours, minutes] = hoursStr.split(':').map(Number);
    return `${hours}h ${minutes}m`;
  };

  const getUtilization = (expected, actual) => {
    if (!expected || expected === "00:00") return "0%";
    const [expH, expM] = expected.split(':').map(Number);
    const [actH, actM] = actual.split(':').map(Number);
    const expectedTotal = expH * 60 + expM;
    const actualTotal = actH * 60 + actM;
    const percentage = ((actualTotal / expectedTotal) * 100).toFixed(1);
    return `${percentage}%`;
  };

  const handleTeamClick = (team) => {
    setSelectedTeam(team);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTeam(null);
  };

  const handleViewClick = (team) => {
    const teamName = team.teamName;
    navigate(`/${userRole}/reporting/team-data/${teamName}?start_date=${startDate}&end_date=${endDate}`);
  };


  const timeToMinutes = (time) => {
  if (!time || time === "00:00") return 0;
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const minutesToHHMM = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

const teamSummary = React.useMemo(() => {
  let expectedMinutes = 0;
  let actualMinutes = 0;

  filteredTeamData.forEach(team => {
    expectedMinutes += timeToMinutes(team.expectedHours);
    actualMinutes += timeToMinutes(team.totalHours);
  });

  const utilization =
    expectedMinutes > 0
      ? ((actualMinutes / expectedMinutes) * 100).toFixed(1)
      : "0.0";

  return {
    expected: minutesToHHMM(expectedMinutes),
    actual: minutesToHHMM(actualMinutes),
    utilization: utilization,
  };
}, [filteredTeamData]);


const tableColumns = [
    {
      key: 'teamName',
      label: 'Team Name',
      width: '256px', 
      cellCustomClassName: 'justify-start',
      headerClassName: 'p-4 whitespace-nowrap text-left w-64 text-white font-semibold uppercase text-xs cursor-pointer',
      render: (team) => (
        <div className=" font-semibold text-gray-900 hover:text-blue-700 transition-colors duration-200 cursor-pointer">
          <HoverCell text={team.teamName} maxLength={25} />
          <div className="text-gray-500 mt-1">{startDate} to {endDate}</div>
        </div>
      )
    },
    {
      key: 'totalTeamMembers',
      label: 'Members',
      width: '128px',
      headerClassName: 'p-4 whitespace-nowrap text-center w-32 text-white font-semibold uppercase text-xs cursor-pointer',
      render: (team) => (
        <div className=" text-center text-gray-700 font-medium cursor-pointer">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
            {team.totalTeamMembers || 0}
          </span>
        </div>
      )
    },
    {
      key: 'expectedHours',
      label: 'Expected',
      width: '160px',
      headerClassName: 'p-4 whitespace-nowrap text-center w-40 text-white font-semibold uppercase text-xs cursor-pointer',
      render: (team) => (
        <div className=" text-center text-gray-700 font-medium cursor-pointer">
          <div className="text-gray-500 mt-1">{formatHours(team.expectedHours)}</div>
        </div>
      )
    },
    {
      key: 'totalHours',
      label: 'Actual',
      width: '160px',
      headerClassName: 'p-4 whitespace-nowrap text-center w-40 text-white font-semibold uppercase text-xs cursor-pointer',
      render: (team) => (
        <div className=" text-center text-gray-700 font-semibold cursor-pointer">
          <div className="text-gray-500 mt-1">{formatHours(team.totalHours)}</div>
        </div>
      )
    },
    {
      key: 'utilization',
      label: 'Utilization',
      width: '128px',
      headerClassName: 'p-4 whitespace-nowrap text-center w-32 text-white font-semibold uppercase text-xs cursor-pointer',
      render: (team) => {
        const utilization = getUtilization(team.expectedHours, team.totalHours);
        const utilColor = parseFloat(utilization) >= 90 ? 'text-green-600' : 
                          parseFloat(utilization) >= 75 ? 'text-yellow-600' : 'text-red-600';
        return (
          <div className=" text-center cursor-pointer">
            <span className={`font-bold text-base ${utilColor}`}>{utilization}</span>
          </div>
        );
      }
    },
    {
      key: 'totalTeamLeaves',
      label: 'Leaves',
      width: '128px',
      headerClassName: 'p-4 whitespace-nowrap text-center w-32 text-white font-semibold uppercase text-xs cursor-pointer',
      render: (team) => (
        <div className=" text-center text-gray-700 font-medium cursor-pointer">
          {team.totalTeamLeaves || 0}
        </div>
      )
    },
    {
      key: 'leaveHours',
      label: 'Leave Hours',
      width: '160px',
      headerClassName: 'p-4 whitespace-nowrap text-center w-40 text-white font-semibold uppercase text-xs cursor-pointer',
      render: (team) => (
        <div className=" text-center text-gray-700 cursor-pointer">
          <div className="text-gray-500 mt-1">{formatHours(team.leaveHours)}</div>
        </div>
      )
    }
  ];

  const actionsComponent = {
    right: (team) => (
      <div className="text-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleViewClick(team);
          }}
          className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md transition-all duration-200 flex items-center justify-center mx-auto"
        >
          <IconViewButton className="h-4 w-4" />
        </button>
      </div>
    )
  };


  
  return (
    <div className="w-full space-y-2">
      <SectionHeader
        icon={BarChart}
        title="Team Reporting"
        subtitle="View team working hours and utilization"
      />
      
      {/* Header with Date Range + Search */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white shadow-md p-2 rounded-md border">
        {/* Quick Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <TodayButton onClick={setTodayFilter} />
          <YesterdayButton onClick={setYesterdayFilter} />
          <WeeklyButton onClick={setWeeklyFilter} />
             {!isCustomMode ? (
            <CustomButton onClick={() => setIsCustomMode(true)}/>
          ) : (
            <>
              <input
                type="date"
                className="border border-gray-300 rounded-lg px-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={endDate || undefined}
              />
              <input
                type="date"
                className="border border-gray-300 rounded-lg px-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || undefined}
              />
              <ClearButton onClick={clearFilters} />
              <CancelButton onClick={() => {
                setIsCustomMode(false);
                setStartDate("");
                setEndDate("");
              }} />
            </>
          )}
        </div>

        {/* Date Range Inputs */}
   

        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="flex items-center border border-gray-300 px-3 py-1.5 text-sm rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
            <input
              type="text"
              className="w-full outline-none bg-transparent"
              placeholder="Search teams or members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Results Count */}
        <div className="text-[12px] text-gray-600 font-medium">
          {filteredTeamData.length} team{filteredTeamData.length !== 1 ? 's' : ''}
          {startDate && endDate && ` (${startDate} to ${endDate})`}
        </div>
      </div>
{/* 🔹 Team Summary */}
<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
  <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-4 shadow-sm">
    <p className="text-xs uppercase tracking-wide text-blue-600">
      Expected Hours
    </p>
    <p className="text-xl font-bold text-blue-800 mt-1">
      {teamSummary.expected}
    </p>
  </div>

  <div className="rounded-xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200 p-4 shadow-sm">
    <p className="text-xs uppercase tracking-wide text-green-600">
      Actual Hours
    </p>
    <p className="text-xl font-bold text-green-800 mt-1">
      {teamSummary.actual}
    </p>
  </div>

  <div
    className={`rounded-xl p-4 shadow-sm border ${
      teamSummary.utilization >= 90
        ? "bg-green-50 border-green-200"
        : teamSummary.utilization >= 75
        ? "bg-yellow-50 border-yellow-200"
        : "bg-red-50 border-red-200"
    }`}
  >
    <p className="text-xs uppercase tracking-wide text-gray-600">
      Utilization
    </p>
    <p className="text-xl font-bold mt-1">
      {teamSummary.utilization}%
    </p>
  </div>
</div>

      {/* ✅ FULL WIDTH TABLE */}
      <div className="w-full bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
        <div className="[&_.table]:table-auto [&_.table]:min-w-[1200px]">
          <GlobalTable
            data={filteredTeamData}
            columns={tableColumns}
            isLoading={isLoading}
            stickyHeader={true}   
            enablePagination={false}
            hideActions={false}
            actionsComponent={actionsComponent}
            onRowClick={handleViewClick}
            emptyStateTitle={
              startDate && endDate 
                ? `No team data available for ${startDate} to ${endDate}`
                : 'Please select a date range to view team data'
            }
            emptyStateMessage="No records match your current filters."
            className="!max-h-[70vh] overflow-y-auto [&_thead]:sticky top-0  [&_thead_th]:z-20 [&_thead_th]:text-white [&_thead_th]:shadow-sm"
          />
        </div>
      </div>

      {/* Team Members Modal */}
    
    </div>
  );
};

export default ReportingManagement;
