import { SectionHeader } from "../../../components/SectionHeader";
import React, { useState, useEffect } from 'react';
import { Loader2, X, User, Clock, CheckCircle, XCircle, Calendar, BarChart, Eye } from "lucide-react";
import { API_URL } from "../../../utils/ApiConfig";
import { ClearButton, TodayButton, YesterdayButton, WeeklyButton, IconViewButton, CustomButton, CancelButton } from "../../../AllButtons/AllButtons";
import { useNavigate } from "react-router-dom";
import GlobalTable from "../../../components/GlobalTable";

const SheetReporting = () => {
  const [allTeamData, setAllTeamData] = useState([]);
  const [filteredTeamData, setFilteredTeamData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState(null); 
  const [metricModalData, setMetricModalData] = useState([]); 
  const token = localStorage.getItem("userToken");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCustomMode, setIsCustomMode] = useState(false);
  
  const userRole = localStorage.getItem("user_name"); 
  const navigate = useNavigate();

useEffect(() => {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - 6); 
  
  const startDateStr = startOfWeek.toISOString().split('T')[0];
  const endDateStr = today.toISOString().split('T')[0];
  
  setStartDate(startDateStr);
  setEndDate(endDateStr);
}, []);

  useEffect(() => {
    const fetchTeamData = async () => {
      if (!startDate || !endDate) return;
      
      try {
        setIsLoading(true);
        const url = `${API_URL}/api/team-wise-daily-working-hours-by-performa?start_date=${startDate}&end_date=${endDate}`;
        
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

  // Handle metric card click
  const handleMetricClick = (metric) => {
    setSelectedMetric(metric);
    const metricData = filteredTeamData
      .map(team => ({
        teamName: team.teamName,
        value: getMetricValue(team, metric),
        formattedValue: formatMetricValue(getMetricValue(team, metric), metric),
        count: getMetricCount(team, metric),
        leaveCount: team.leaveCount || 0,
        pendingBackdatedCount: team.pendingBackdatedCount || 0,
        unfilledCount: team.unfilledCount || 0
      }))
      .filter(item => parseFloat(item.value.replace(':', '')) > 0)
      .sort((a, b) => parseFloat(b.value.replace(':', '')) - parseFloat(a.value.replace(':', '')));
    
    setMetricModalData(metricData);
    setShowModal(true);
  };

  // Get metric value from team data
  const getMetricValue = (team, metric) => {
    switch(metric) {
      case 'expected': return team.expectedHours || '00:00';
      case 'billable': return team.billableHours || '00:00';
      case 'inhouse': return team.inhouseHours || '00:00';
      case 'noWork': return team.noWorkHours || '00:00';
      case 'pending': return team.pendingBackdatedHours || '00:00';
      case 'leave': return team.leaveHours || '00:00';
      case 'unfilled': return team.unfilledHours || '00:00';
      default: return '00:00';
    }
  };

  // Get metric count from team data
  const getMetricCount = (team, metric) => {
    switch(metric) {
      case 'leave': return team.leaveCount || 0;
      case 'pending': return team.pendingBackdatedCount || 0;
      case 'unfilled': return team.unfilledCount || 0;
      default: return null;
    }
  };

  // Format metric value for display
  const formatMetricValue = (value, metric) => {
    if (['pendingCount'].includes(metric)) return value;
    return formatHours(value);
  };

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

  const formatHours = (hoursStr) => {
    if (!hoursStr || hoursStr === "00:00") return "0h 0m";
    const [hours, minutes] = hoursStr.split(':').map(Number);
    return `${hours}h ${minutes}m`;
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

  const handleTeamClick = (team) => {
    setSelectedTeam(team);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTeam(null);
    setSelectedMetric(null);
    setMetricModalData([]);
  };

  const handleViewClick = (team) => {
    const teamName = team.teamName;
    navigate(`/${userRole}/Sheet-reporting/team-data/${teamName}?start_date=${startDate}&end_date=${endDate}`);
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
    let billableMinutes = 0;
    let inhouseMinutes = 0;
    let noWorkMinutes = 0;
    let pendingMinutes = 0;
    let leaveMinutes = 0;
    let unfilledMinutes = 0;
    let leaveCount = 0;
    let pendingCount = 0;
    let unfilledCount = 0;

    filteredTeamData.forEach(team => {
      expectedMinutes += timeToMinutes(team.expectedHours);
      billableMinutes += timeToMinutes(team.billableHours);
      inhouseMinutes += timeToMinutes(team.inhouseHours);
      noWorkMinutes += timeToMinutes(team.noWorkHours);
      pendingMinutes += timeToMinutes(team.pendingBackdatedHours);
      leaveMinutes += timeToMinutes(team.leaveHours);
      unfilledMinutes += timeToMinutes(team.unfilledHours);
      
      leaveCount += team.leaveCount || 0;
      pendingCount += team.pendingBackdatedCount || 0;
      unfilledCount += team.unfilledCount || 0;
    });

    const productiveMinutes = billableMinutes + inhouseMinutes;
    const totalMinutes = productiveMinutes + noWorkMinutes;
    const utilization = totalMinutes > 0 
      ? ((productiveMinutes / totalMinutes) * 100).toFixed(1)
      : "0.0";

    return {
      expected: minutesToHHMM(expectedMinutes),
      billable: minutesToHHMM(billableMinutes),
      inhouse: minutesToHHMM(inhouseMinutes),
      noWork: minutesToHHMM(noWorkMinutes),
      pending: `${minutesToHHMM(pendingMinutes)} (${pendingCount})`,
      leave: `${minutesToHHMM(leaveMinutes)} (${leaveCount})`,
      unfilled: `${minutesToHHMM(unfilledMinutes)} (${unfilledCount})`,
      utilization: utilization,
    };
  }, [filteredTeamData]);


  // ✅ GlobalTable Columns Definition
  const tableColumns = [
    {
      key: 'teamName',
      label: 'Team Name',
      width: '256px',
      headerClassName: 'p-4 whitespace-nowrap text-left w-64 text-white font-semibold uppercase text-xs sticky top-0 z-10',
      render: (team) => (
        <div>
          <HoverCell text={team.teamName} maxLength={25} />
          <div className="text-xs text-gray-500 mt-1">{startDate} to {endDate}</div>
        </div>
      )
    },
    {
      key: 'totalTeamMembers',
      label: 'Members',
      width: '120px',
      headerClassName: 'p-4 whitespace-nowrap text-center w-32 text-white font-semibold uppercase text-xs sticky top-0 z-10',
      render: (team) => (
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
          {team.totalTeamMembers || team.teamMembers?.length || 0}
        </span>
      )
    },
    {
      key: 'expectedHours',
      label: 'Expected Hours',
      width: '140px',
      headerClassName: 'p-4 whitespace-nowrap text-center w-40 text-white font-semibold font-semibold uppercase text-xs sticky top-0 z-10',
      render: (team) => <HoverCell text={team.expectedHours} />
    },
    {
      key: 'billableHours',
      label: 'Billable',
      width: '140px',
      headerClassName: 'p-4 whitespace-nowrap text-center w-40 text-white font-semibold uppercase text-xs sticky top-0 z-10',
      render: (team) => (
        <>
          <HoverCell text={team.billableHours} />
          <div className="text-xs text-gray-500 mt-1">{formatHours(team.billableHours)}</div>
        </>
      )
    },
    {
      key: 'inhouseHours',
      label: 'Inhouse',
      width: '140px',
      headerClassName: 'p-4 whitespace-nowrap text-center w-40 text-white font-semibold uppercase text-xs sticky top-0 z-10',
      render: (team) => (
        <>
          <HoverCell text={team.inhouseHours} />
          <div className="text-xs text-gray-500 mt-1">{formatHours(team.inhouseHours)}</div>
        </>
      )
    },
    {
      key: 'noWorkHours',
      label: 'No Work',
      width: '140px',
      headerClassName: 'p-4 whitespace-nowrap text-center w-40 text-white font-semibold uppercase text-xs sticky top-0 z-10',
      render: (team) => (
        <>
          <HoverCell text={team.noWorkHours} />
          <div className="text-xs text-gray-500 mt-1">{formatHours(team.noWorkHours)}</div>
        </>
      )
    },
    {
      key: 'pendingBackdatedHours',
      label: 'Pending Hours',
      width: '140px',
      headerClassName: 'p-4 whitespace-nowrap text-center w-40 text-white font-semibold uppercase text-xs sticky top-0 z-10',
      render: (team) => (
        <>
          <HoverCell text={team.pendingBackdatedHours} />
          <div className="text-xs text-gray-500 mt-1">{formatHours(team.pendingBackdatedHours)}</div>
        </>
      )
    },
    {
      key: 'leaveHours',
      label: 'Leave Hours',
      width: '140px',
      headerClassName: 'p-4 whitespace-nowrap text-center w-40 text-white font-semibold uppercase text-xs sticky top-0 z-10',
      render: (team) => (
        <>
          <HoverCell text={team.leaveHours} />
          <div className="text-xs text-gray-500 mt-1">{formatHours(team.leaveHours)}</div>
        </>
      )
    },
    {
      key: 'unfilledHours',
      label: 'Unfilled Hours',
      width: '140px',
      headerClassName: 'p-4 whitespace-nowrap text-center w-40 text-white font-semibold uppercase text-xs sticky top-0 z-10',
      render: (team) => (
        <>
          <HoverCell text={team.unfilledHours} />
          <div className="text-xs text-gray-500 mt-1">{formatHours(team.unfilledHours)}</div>
        </>
      )
    },
    {
      key: 'offlineHours',
      label: 'Offline Hours',
      width: '140px',
      headerClassName: 'p-4 whitespace-nowrap text-center w-40 text-white font-semibold uppercase text-xs sticky top-0 z-10',
      render: (team) => (
        <>
          <HoverCell text={team.offlineHours} />
          <div className="text-xs text-gray-500 mt-1">{formatHours(team.offlineHours)}</div>
        </>
      )
    },
    {
      key: 'utilization',
      label: 'Utilization',
      width: '112px',
      headerClassName: 'p-4 whitespace-nowrap text-center w-32 text-white font-semibold uppercase text-xs sticky top-0 z-10',
      render: (team) => {
        const utilization = getUtilization(team.billableHours, team.inhouseHours, team.noWorkHours);
        const utilNum = parseFloat(utilization);
        const utilColor = utilNum >= 90 ? 'text-green-600' : 
                          utilNum >= 70 ? 'text-yellow-600' : 'text-red-600';
        return (
          <span className={`font-bold text-lg ${utilColor}`}>
            {utilization}
          </span>
        );
      }
    }
  ];

  // ✅ Actions Component for View Button
  const actionsComponent = {
    right: (team) => (
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleViewClick(team);
        }}
        className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-all duration-200 flex items-center justify-center"
        title="View Team Details"
      >
        <IconViewButton className="h-4 w-4" />
      </button>
    )
  };




  
  return (
    <div className="w-full space-y-6 p-6">
      <SectionHeader
        icon={BarChart}
        title="Team Reporting"
        subtitle="High No-Work = Low Utilization (Teams needing attention)"
      />
      
      {/* Header with Date Range + Search */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white shadow-md p-6 rounded-xl border">
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
               className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
               value={startDate}
               onChange={(e) => setStartDate(e.target.value)}
               max={endDate || undefined}
             />
             <input
               type="date"
               className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        <div className="flex-1 max-w-md">
         <div className="flex items-center border border-gray-300 px-3 py-2 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
           <input
             type="text"
             className="w-full outline-none bg-transparent"
             placeholder="Search teams or members..."
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
           />
         </div>
        </div>

        <div className="text-sm text-gray-600 font-medium">
         {filteredTeamData.length} team{filteredTeamData.length !== 1 ? 's' : ''}
         {startDate && endDate && ` (${startDate} to ${endDate})`}
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Expected Hours Card */}
        <div 
          className="rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-100 border border-indigo-200 p-5 shadow-sm cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all duration-200 group"
          onClick={() => handleMetricClick('expected')}
        >
          <p className="text-xs uppercase tracking-wide text-indigo-600 group-hover:text-indigo-700">Total Expected Hours</p>
          <p className="text-3xl font-bold text-indigo-800 mt-1 group-hover:text-indigo-900">{teamSummary.expected}</p>
          <Eye className="h-4 w-4 text-indigo-500 ml-auto mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <div 
          className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200 p-5 shadow-sm cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all duration-200 group"
          onClick={() => handleMetricClick('billable')}
        >
          <p className="text-xs uppercase tracking-wide text-green-600 group-hover:text-green-700">Total Approved Billable</p>
          <p className="text-3xl font-bold text-green-800 mt-1 group-hover:text-green-900">{teamSummary.billable}</p>
          <Eye className="h-4 w-4 text-green-500 ml-auto mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <div 
          className="rounded-2xl bg-gradient-to-br from-purple-50 to-violet-100 border border-purple-200 p-5 shadow-sm cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all duration-200 group"
          onClick={() => handleMetricClick('inhouse')}
        >
          <p className="text-xs uppercase tracking-wide text-purple-600 group-hover:text-purple-700">Total Approved Inhouse</p>
          <p className="text-3xl font-bold text-purple-800 mt-1 group-hover:text-purple-900">{teamSummary.inhouse}</p>
          <Eye className="h-4 w-4 text-purple-500 ml-auto mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <div 
          className="rounded-2xl bg-gradient-to-br from-orange-50 to-red-100 border border-orange-200 p-5 shadow-sm cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all duration-200 group"
          onClick={() => handleMetricClick('noWork')}
        >
          <p className="text-xs uppercase tracking-wide text-orange-600 font-semibold group-hover:text-orange-700">Total Approved No Work</p>
          <p className="text-3xl font-bold text-orange-800 mt-1 group-hover:text-orange-900">{teamSummary.noWork}</p>
          <Eye className="h-4 w-4 text-orange-500 ml-auto mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <div 
          className="rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 p-5 shadow-sm cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all duration-200 group"
          onClick={() => handleMetricClick('pending')}
        >
          <p className="text-xs uppercase tracking-wide text-gray-600 group-hover:text-gray-700">Sheets pending for approval</p>
          <p className="text-3xl font-bold text-gray-800 mt-1 group-hover:text-gray-900">{teamSummary.pending}</p>
          <Eye className="h-4 w-4 text-gray-500 ml-auto mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <div 
          className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 p-5 shadow-sm cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all duration-200 group"
          onClick={() => handleMetricClick('leave')}
        >
          <p className="text-xs uppercase tracking-wide text-blue-600 group-hover:text-blue-700">Total Approved Leaves</p>
          <p className="text-3xl font-bold text-blue-800 mt-1 group-hover:text-blue-900">{teamSummary.leave}</p>
          <Eye className="h-4 w-4 text-blue-500 ml-auto mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <div 
          className="rounded-2xl bg-gradient-to-br from-yellow-50 to-amber-100 border border-yellow-200 p-5 shadow-sm cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all duration-200 group"
          onClick={() => handleMetricClick('unfilled')}
        >
          <p className="text-xs uppercase tracking-wide text-yellow-600 group-hover:text-yellow-700">Total Unfilled Sheets</p>
          <p className="text-3xl font-bold text-yellow-800 mt-1 group-hover:text-yellow-900">{teamSummary.unfilled}</p>
          <Eye className="h-4 w-4 text-yellow-500 ml-auto mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
              <div
        className={`rounded-2xl p-5 shadow-sm border ${
          parseFloat(teamSummary.utilization) >= 90 ? "bg-green-50 border-green-200" :
          parseFloat(teamSummary.utilization) >= 70 ? "bg-yellow-50 border-yellow-200" :
          "bg-red-50 border-red-200"
        }`}
      >
        <p className="text-xs uppercase tracking-wide text-gray-600 ">Overall Utilization</p>
        <p className={`text-4xl font-bold mt-1  ${
          parseFloat(teamSummary.utilization) >= 90 ? 'text-green-700' :
          parseFloat(teamSummary.utilization) >= 70 ? 'text-yellow-700' : 'text-red-700'
        }`}>
          {teamSummary.utilization}%
        </p>
      </div>      

      </div>

      {/* UTILIZATION CARD */}


      {/* UPDATED METRIC MODAL with Team-wise Counts */}
     {/* UPDATED METRIC MODAL with Conditional Team-wise Counts */}
{showModal && selectedMetric && (
  <div className="fixed inset-0 bg-black/50 z-[99999] flex items-center justify-center p-1 sm:p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[95vw] sm:max-w-md md:max-w-2xl lg:max-w-4xl max-h-[90vh] flex flex-col overflow-hidden ml-0 sm:ml-0">
      {/* Fixed Header - Always visible */}
      <div className="p-3 sm:p-4 md:p-6 border-b border-gray-200 flex-shrink-0 min-h-[60px]">
        <div className="flex items-center justify-between w-full">
          <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 truncate pr-8 sm:pr-0">
            {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Hours
          </h2>
          <button 
            onClick={closeModal} 
            className="p-1 sm:p-1.5 md:p-2 hover:bg-gray-100 rounded-lg flex-shrink-0 -mr-1 sm:-mr-2 z-[99999]"
            aria-label="Close modal"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 hover:text-gray-900" />
          </button>
        </div>
        <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate max-w-full">
          {startDate} to {endDate}
        </p>
      </div>
      
      {/* Scrollable Content Area */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-6 pb-4 sm:pb-6">
          
          {/* Count Summary Cards - Perfectly responsive */}
          {selectedMetric === 'pending' && (
            <div className="mb-3 sm:mb-4 md:mb-6 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-sm">
              <div className="text-center">
                <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 tracking-tight">
                  Total Pending Sheet Count
                </p>
                <div className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-1">
                  {metricModalData.reduce((sum, team) => sum + (team.pendingBackdatedCount || 0), 0)}
                </div>
                <p className="text-xs text-gray-500">across {metricModalData.length} teams</p>
              </div>
            </div>
          )}

          {selectedMetric === 'leave' && (
            <div className="mb-3 sm:mb-4 md:mb-6 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200 shadow-sm">
              <div className="text-center">
                <p className="text-xs sm:text-sm font-semibold text-blue-700 mb-2 tracking-tight">
                  Total Leave Count
                </p>
                <div className="text-2xl sm:text-3xl md:text-4xl font-black text-blue-900 mb-1">
                  {metricModalData.reduce((sum, team) => sum + (team.leaveCount || 0), 0)}
                </div>
                <p className="text-xs text-blue-600">across {metricModalData.length} teams</p>
              </div>
            </div>
          )}

          {selectedMetric === 'unfilled' && (
            <div className="mb-3 sm:mb-4 md:mb-6 p-3 sm:p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200 shadow-sm">
              <div className="text-center">
                <p className="text-xs sm:text-sm font-semibold text-yellow-800 mb-2 tracking-tight">
                  Total Unfilled Sheet Count
                </p>
                <div className="text-2xl sm:text-3xl md:text-4xl font-black text-yellow-900 mb-1">
                  {metricModalData.reduce((sum, team) => sum + (team.unfilledCount || 0), 0)}
                </div>
                <p className="text-xs text-yellow-700">across {metricModalData.length} teams</p>
              </div>
            </div>
          )}

          {/* Bulletproof Responsive Table */}
          <div className="w-full overflow-x-auto overflow-y-visible -mx-3 sm:-mx-4 md:mx-0">
            <div className="min-w-[280px] inline-block">
              <table className="w-full table-fixed border-collapse">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-2 sm:px-3 md:px-6 py-2.5 text-left text-xs font-bold text-gray-800 uppercase tracking-wider align-top w-[55%] sm:w-[60%] md:w-[50%]">
                      Team Name
                    </th>
                    <th className="px-2 sm:px-3 md:px-6 py-2.5 text-right text-xs font-bold text-gray-800 uppercase tracking-wider align-top w-[30%] sm:w-[25%] md:w-[30%] border-l border-gray-200">
                      Hours
                    </th>
                    {['pending', 'leave', 'unfilled'].includes(selectedMetric) && (
                      <th className="px-2 sm:px-3 md:px-6 py-2.5 text-right text-xs font-bold text-gray-800 uppercase tracking-wider align-top w-[15%] hidden xs:table-cell md:table-cell border-l border-gray-200">
                        Count
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {metricModalData.map((team, index) => (
                    <tr key={index} className="hover:bg-blue-50/50 transition-all duration-150 group">
                      <td className="px-2 sm:px-3 md:px-6 py-3 max-w-[0] sm:max-w-[220px]">
                        <div className="font-semibold text-sm text-gray-900 truncate group-hover:underline">
                          {team.teamName}
                        </div>
                      </td>
                      <td className="px-2 sm:px-3 md:px-6 py-3 text-right border-l border-gray-200">
                        <div className="text-sm sm:text-base md:text-lg font-bold text-gray-900 whitespace-nowrap">
                          {team.formattedValue}
                        </div>
                      </td>
                      {['pending', 'leave', 'unfilled'].includes(selectedMetric) && (
                        <td className="px-2 sm:px-3 md:px-6 py-3 text-right border-l border-gray-200 hidden xs:table-cell md:table-cell">
                          <span className="inline-flex px-2 py-1 bg-blue-100 text-blue-800 text-xs sm:text-sm font-semibold rounded-full whitespace-nowrap min-w-[2.5rem] justify-center">
                            {team.count || 0}
                          </span>
                        </td>
                      )}
                    </tr>
                  ))}
                  
                  {/* Empty State */}
                  {metricModalData.length === 0 && (
                    <tr>
                      <td colSpan="3" className="px-6 py-12 text-center">
                        <div className="text-gray-500 text-sm font-medium">No {selectedMetric} data available</div>
                        <div className="text-gray-400 text-xs mt-1">for selected date range</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Total Summary - Only on small screens */}
          {['pending', 'leave', 'unfilled'].includes(selectedMetric) && metricModalData.length > 0 && (
            <div className="mt-4 sm:hidden p-3 bg-gray-50 rounded-lg border">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">TOTAL COUNT:</span>
                <span className="text-xl font-black text-gray-900">
                  {metricModalData.reduce((sum, team) => sum + (team.count || 0), 0)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
)}



      {/* TABLE */}
      <div className="w-full bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
       <GlobalTable
          data={filteredTeamData}
          columns={tableColumns}
          isLoading={isLoading}
          stickyHeader={true}
          enablePagination={false}
          hideActions={false} // ✅ Shows Actions column
          actionsComponent={actionsComponent} // ✅ View button
          emptyStateTitle={startDate && endDate ? `No teams for ${startDate} to ${endDate}` : 'Select date range'}
          emptyStateMessage="Please select a date range above to view team data"
          onRowClick={handleViewClick} // ✅ Row click navigates
          className="w-full table-auto"
        />
      </div>
    </div>
  );
};

export default SheetReporting;
