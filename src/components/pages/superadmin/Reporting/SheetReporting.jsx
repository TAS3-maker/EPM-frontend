import { SectionHeader } from "../../../components/SectionHeader";
import React, { useState, useEffect } from 'react';
import { Loader2, X, User, Clock, CheckCircle, XCircle, Calendar, BarChart } from "lucide-react";
import { API_URL } from "../../../utils/ApiConfig";
import { ClearButton, TodayButton, YesterdayButton, WeeklyButton, IconViewButton, CustomButton, CancelButton } from "../../../AllButtons/AllButtons";
import { useNavigate } from "react-router-dom";

const SheetReporting = () => {
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
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);  
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  setStartDate(yesterdayStr);
  setEndDate(yesterdayStr);
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

  // 🔥 NEW UTILIZATION: Less No-Work = Higher Utilization
  // Formula: Productive / (Productive + No Work) * 100
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

  // 🔥 TEAM SUMMARY - Shows No-Work impact clearly
  const teamSummary = React.useMemo(() => {
    let billableMinutes = 0;
    let inhouseMinutes = 0;
    let noWorkMinutes = 0;

    filteredTeamData.forEach(team => {
      billableMinutes += timeToMinutes(team.billableHours);
      inhouseMinutes += timeToMinutes(team.inhouseHours);
      noWorkMinutes += timeToMinutes(team.noWorkHours);
    });

    const productiveMinutes = billableMinutes + inhouseMinutes;
    const totalMinutes = productiveMinutes + noWorkMinutes;
    const utilization = totalMinutes > 0 
      ? ((productiveMinutes / totalMinutes) * 100).toFixed(1)
      : "0.0";

    return {
      billable: minutesToHHMM(billableMinutes),
      inhouse: minutesToHHMM(inhouseMinutes),
      noWork: minutesToHHMM(noWorkMinutes),
      utilization: utilization,
    };
  }, [filteredTeamData]);

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

      {/* 🔥 SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-green-600">Total Billable</p>
          <p className="text-3xl font-bold text-green-800 mt-1">{teamSummary.billable}</p>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-violet-100 border border-purple-200 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-purple-600">Total Inhouse</p>
          <p className="text-3xl font-bold text-purple-800 mt-1">{teamSummary.inhouse}</p>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-red-100 border border-orange-200 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-orange-600 font-semibold">Total No Work ⚠️</p>
          <p className="text-3xl font-bold text-orange-800 mt-1">{teamSummary.noWork}</p>
        </div>

        <div
          className={`rounded-2xl p-5 shadow-sm border ${
            parseFloat(teamSummary.utilization) >= 90 ? "bg-green-50 border-green-200" :
            parseFloat(teamSummary.utilization) >= 70 ? "bg-yellow-50 border-yellow-200" :
            "bg-red-50 border-red-200"
          }`}
        >
          <p className="text-xs uppercase tracking-wide text-gray-600">Utilization</p>
          <p className={`text-3xl font-bold mt-1 ${
            parseFloat(teamSummary.utilization) >= 90 ? 'text-green-700' :
            parseFloat(teamSummary.utilization) >= 70 ? 'text-yellow-700' : 'text-red-700'
          }`}>
            {teamSummary.utilization}%
          </p>
        </div>
      </div>

      {/* 🔥 TABLE */}
      <div className="w-full bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
        <div className="w-full overflow-x-auto max-h-[70vh]">
          <table className="w-full table-auto min-w-[1100px]">
            <thead className="text-xs font-semibold uppercase text-white sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-blue-800">
              <tr>
                <th className="p-4 whitespace-nowrap text-left w-64">Team Name</th>
                <th className="p-4 whitespace-nowrap text-center w-32">Members</th>
                <th className="p-4 whitespace-nowrap text-center w-40">Billable</th>
                <th className="p-4 whitespace-nowrap text-center w-40">Inhouse</th>
                <th className="p-4 whitespace-nowrap text-center w-40">No Work</th>
                <th className="p-4 whitespace-nowrap text-center w-32">Utilization</th>
                <th className="p-4 whitespace-nowrap text-center w-40">Leaves</th>
                <th className="p-4 whitespace-nowrap text-center w-40">Leave Hours</th>
                <th className="p-4 whitespace-nowrap text-center w-40">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="9" className="p-12">
                    <div className="flex flex-col items-center justify-center space-y-4 py-8">
                      <Loader2 className="h-14 w-14 animate-spin text-blue-500" />
                      <span className="text-xl font-semibold text-gray-600">
                        Loading team data for {startDate} to {endDate}...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filteredTeamData.length > 0 ? (
                filteredTeamData.map((team, index) => {
                  const utilization = getUtilization(team.billableHours, team.inhouseHours, team.noWorkHours);
                  const utilNum = parseFloat(utilization);
                  const utilColor = utilNum >= 90 ? 'text-green-600' : 
                                    utilNum >= 70 ? 'text-yellow-600' : 'text-red-600';
                  
                  return (
                    <tr
                      key={`${team.teamName}-${startDate}-${endDate}`}
                      className={`
                        ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                        hover:bg-blue-50 transition duration-200 ease-in-out cursor-pointer
                        group/team
                      `}
                      onClick={() => handleViewClick(team)}
                    >
                      <td className="py-4 px-4 font-semibold text-gray-900 group-hover/team:text-blue-700 transition-colors duration-200">
                        <HoverCell text={team.teamName} maxLength={25} />
                        <div className="text-xs text-gray-500 mt-1">{startDate} to {endDate}</div>
                      </td>
                      <td className="py-4 px-4 text-center text-gray-700 font-medium">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {team.totalTeamMembers || team.teamMembers?.length || 0}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center text-green-700 font-semibold">
                        <HoverCell text={team.billableHours} />
                        <div className="text-xs text-gray-500 mt-1">{formatHours(team.billableHours)}</div>
                      </td>
                      <td className="py-4 px-4 text-center text-purple-700 font-semibold">
                        <HoverCell text={team.inhouseHours} />
                        <div className="text-xs text-gray-500 mt-1">{formatHours(team.inhouseHours)}</div>
                      </td>
                      <td className="py-4 px-4 text-center text-orange-700 font-semibold">
                        <HoverCell text={team.noWorkHours} />
                        <div className="text-xs text-gray-500 mt-1">{formatHours(team.noWorkHours)}</div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`font-bold text-lg ${utilColor}`}>
                          {utilization}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center text-gray-700 font-medium">
                        {team.totalTeamLeaves || 0}
                      </td>
                      <td className="py-4 px-4 text-center text-gray-700">
                        <HoverCell text={team.leaveHours} />
                        <div className="text-xs text-gray-500 mt-1">{formatHours(team.leaveHours)}</div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewClick(team);
                          }}
                          className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-all duration-200"
                        >
                          <IconViewButton className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="p-12 text-center">
                    <div className="text-gray-500 italic text-lg">
                      {startDate && endDate 
                        ? `No team data available for ${startDate} to ${endDate}`
                        : 'Please select a date range to view team data'
                      }
                    </div>
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

export default SheetReporting;
