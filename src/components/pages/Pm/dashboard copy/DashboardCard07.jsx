import React, { useState, useEffect } from 'react';
import { Loader2, Users, Clock, TrendingUp, Calendar, Award } from "lucide-react";
import { StatCardHeader } from "../../../components/CardsDashboard";

function DashboardCard07() {
  const [teamData, setTeamData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const token = localStorage.getItem("userToken");

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('https://emp-staging.techarchsoftwares.com/api/api/team-wise-daily-working-hours', {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
        });
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
  }, [token]);

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

  const getUtilizationColor = (percentage) => {
    const num = parseFloat(percentage);
    if (num >= 90) return { bg: 'bg-gradient-to-r from-emerald-400 to-emerald-500', text: 'text-emerald-900', shadow: 'shadow-emerald-200' };
    if (num >= 75) return { bg: 'bg-gradient-to-r from-amber-400 to-amber-500', text: 'text-amber-900', shadow: 'shadow-amber-200' };
    return { bg: 'bg-gradient-to-r from-rose-400 to-rose-500', text: 'text-rose-900', shadow: 'shadow-rose-200' };
  };

  return (
    <div className="col-span-full xl:col-span-7 bg-gradient-to-br from-white via-blue-50/50 to-indigo-50 shadow-2xl rounded-2xl border border-white/50 backdrop-blur-sm overflow-hidden ring-1 ring-blue-100/50">
      {/* Animated Gradient Header */}
 
 <StatCardHeader icon={Award} title="Team Performance"/>

      {/* Cards Container */}
      <div className="max-h-[520px] overflow-y-auto custom-scrollbar p-6 space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mb-4 animate-pulse">
              <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
            </div>
            <div className="text-center">
              <h4 className="text-lg font-semibold text-gray-700 mb-1">Loading Teams</h4>
              <p className="text-sm text-gray-500">Fetching daily performance data...</p>
            </div>
          </div>
        ) : teamData.length > 0 ? (
          teamData.map((team, index) => {
            const utilization = getUtilization(team.expectedHours, team.totalHours);
            const colors = getUtilizationColor(utilization);

            return (
              <div 
                key={team.teamName || index}
                className="group relative bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:shadow-blue-500/10 
                          hover:-translate-y-2 hover:scale-[1.02] transition-all duration-500 ease-out 
                          hover:border-blue-200 overflow-hidden"
              >
                {/* Animated Background Shine */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                               -skew-x-12 transform -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                
                {/* Glass Effect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent pointer-events-none"></div>

                <div className="relative z-10">
                  {/* Header Row */}
<<<<<<< HEAD
                  <div className="flex items-start justify-between mb-5 pb-4 border-b border-gray-100">
=======
                  <div className="flex items-start flex-col sm:flex-row gap-2 justify-between mb-5 pb-4 border-b border-gray-100">
>>>>>>> origin/staging
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-xl drop-shadow-md">
                          {team.totalTeamMembers}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-xl text-gray-900 leading-tight group-hover:text-blue-700 transition-colors">
                          {team.teamName}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500 font-medium">{team.selectedDate}</span>
                        </div>
                      </div>
                    </div>

                    {/* Utilization Badge */}
                    <div className={`px-4 py-2 rounded-xl font-bold text-sm shadow-lg border-2 ${colors.bg} ${colors.text} ${colors.shadow} animate-pulse`}>
                      {utilization}
                      <TrendingUp className="w-4 h-4 inline ml-1" />
                    </div>
                  </div>

                  {/* Metrics Grid */}
<<<<<<< HEAD
                  <div className="grid grid-cols-3 gap-4 mb-6">
=======
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
>>>>>>> origin/staging
                    <div className="group/card p-4 rounded-xl bg-gradient-to-b from-gray-50 to-white border hover:border-blue-200 hover:bg-blue-50 transition-all duration-300 text-center">
                      <div className="text-2xl font-black text-gray-900 mb-1">{formatHours(team.totalHours)}</div>
                      <div className="flex items-center justify-center space-x-1 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <Clock className="w-3 h-3" />
                        <span>Actual</span>
                      </div>
                    </div>

                    <div className="group/card p-4 rounded-xl bg-gradient-to-b from-emerald-50 to-emerald-100 border hover:border-emerald-200 hover:shadow-md transition-all duration-300 text-center">
                      <div className="text-2xl font-black text-emerald-800 mb-1">{formatHours(team.expectedHours)}</div>
                      <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Expected</div>
                    </div>

                    <div className="group/card p-4 rounded-xl bg-gradient-to-b from-gray-50 to-white border hover:border-gray-300 hover:shadow-md transition-all duration-300 text-center">
                      <div className={`text-xl font-black ${team.totalTeamLeaves === 0 ? 'text-emerald-600' : 'text-orange-600'} mb-1`}>
                        {team.totalTeamLeaves}
                      </div>
                      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Leaves</div>
                    </div>
                  </div>

                  {/* Sparkling Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-gray-700 flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatHours(team.leaveHours)} on leave</span>
                      </span>
                      <span className="font-bold text-gray-900">{formatHours(team.expectedHours)} total</span>
                    </div>
                    
                    {/* Animated Progress Bar with Shine */}
                    <div className="relative">
                      <div className="w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded-full h-3 overflow-hidden shadow-inner">
                        <div 
                          className={`h-3 rounded-full shadow-lg relative overflow-hidden transition-all duration-1000 ease-out ${colors.bg}`}
                          style={{ width: `${parseFloat(utilization)}%` }}
                        >
                          {/* Shine Effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent transform -skew-x-12 -translate-x-[-100%] animate-shine"></div>
                        </div>
                      </div>
                      <div className="flex justify-between mt-1 text-xs text-gray-500">
                        <span>0%</span>
                        <span className="font-semibold text-gray-900">{utilization}</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <Users className="w-12 h-12 text-gray-400" />
            </div>
            <h4 className="text-xl font-bold text-gray-700 mb-2">No Team Data</h4>
            <p className="text-gray-500 max-w-md">Team performance data will appear here once available. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardCard07;
