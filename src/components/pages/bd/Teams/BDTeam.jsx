import React, { useState, useEffect } from "react";
import { useTeams } from "../../../context/BDTeamContext";
import { Loader2, Users, Mail, Phone, Building2, BarChart, Search } from "lucide-react";
import { SectionHeader } from '../../../components/SectionHeader';
import GlobalTable from '../../../components/GlobalTable';




const TeamSection = ({ team, filteredUsers }) => {

// Column definitions for Team Users Table (NO Actions column)
  const columns = [
    {
      key: 'name',
      label: 'User Name',
      headerClassName: 'text-left',
      render: (user) => {
        const isPM = user.roles?.includes('Project Manager');
        const isTL = user.roles?.includes('TL') || user.roles?.includes('tl');
        
        if (isPM || isTL) {
          return (
            <div className={`font-semibold text-xs flex items-center ${
              isPM ? 'text-blue-700' : 'text-green-700'
            }`}>
              <Users className="w-3 h-3 mr-3 text-gray-400" />
              <span className="ml-1">{isPM ? '👨‍💼 PM' : '👨‍💼 TL'}</span>
              {user.name}
            </div>
          );
        }
        
        return (
          <div className="font-medium text-gray-900 text-xs flex items-center">
            <Users className="w-3 h-3 mr-3 text-gray-400" />
            {user.name}
          </div>
        );
      }
    },
    {
      key: 'email',
      label: 'User Email',
      headerClassName: 'text-left',
      render: (user) => (
        <div className="text-gray-600 text-xs flex items-center">
          <Mail className="w-3 h-3 mr-3 text-gray-400" />
          <a href={`mailto:${user.email}`} className="hover:text-blue-600">{user.email}</a>
        </div>
      )
    },
    {
      key: 'phone',
      label: 'Phone Number',
      headerClassName: 'text-left',
      render: (user) => (
        <div className="text-gray-600 text-xs flex items-center">
          <Phone className="w-3 h-3 mr-3 text-gray-400" />
          <a href={`tel:${user.phone || "N/A"}`} className="hover:text-blue-600">
            {user.phone || "N/A"}
          </a>
        </div>
      )
    }
  ];

  
  return (
    <div className="mt-5 bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200/80">
      <div className="px-8 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200/80"> 
        <h3 className="text-sm sm:text-base font-semibold text-gray-800 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
          <div className="flex items-center">
            <Building2 className="w-5 h-5 mr-3 text-blue-600" />
            {team.name}
          </div>
          
          {/* ✅ FIXED: Check roles array properly */}
          {filteredUsers.find(user => user.roles?.includes('TL') || user.roles?.includes('tl')) && (
            <span className="text-sm sm:text-base font-medium text-gray-600">
              (TL: {filteredUsers.find(user => user.roles?.includes('TL') || user.roles?.includes('tl'))?.name})
            </span>
          )}
          
          {filteredUsers.find(user => user.roles?.includes('Project Manager')) && (
            <span className="text-sm sm:text-base font-medium text-gray-600">
              (PM: {filteredUsers.find(user => user.roles?.includes('Project Manager'))?.name})
            </span>
          )}
        </h3>
      </div>

      {/* GlobalTable - NO Actions column */}
      <div className="overflow-x-auto bg-gray-50/50">
        <GlobalTable
          data={filteredUsers}
          columns={columns}
          paginatedData={filteredUsers}
          isLoading={false}
          enablePagination={false}
          emptyStateTitle="No users found matching your search."
          emptyStateMessage=""
          className="border-none bg-transparent divide-y divide-gray-100"
          hideActions={true}
          headerClass="text-left"
        />
      </div>
    </div>
  );
};

export const BDTeam = () => {
  const { teams, loading } = useTeams();
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);

  // Set first team as default
  useEffect(() => {
    if (teams.length > 0 && !selectedTeam) {
      setSelectedTeam(teams[0]);
    }
  }, [teams, selectedTeam]);

  // ✅ FIXED: Filter users using roles array
  useEffect(() => {
    if (selectedTeam) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const users = selectedTeam.users.filter(user =>
        user.name.toLowerCase().includes(lowerCaseQuery) ||
        user.email.toLowerCase().includes(lowerCaseQuery) ||
        (user.phone && user.phone.toString().includes(lowerCaseQuery))
      );
      setFilteredUsers(users); // ✅ ALL users pass through (PM, TL, Team)
    } else {
      setFilteredUsers([]);
    }
  }, [selectedTeam, searchQuery]);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
      <SectionHeader icon={BarChart} title="Team Management" subtitle="Overview of Teams and Their Members" />
      <div className="p-5 sm:p-8">
        {/* Team Selection */}
        <div className="flex flex-wrap gap-1 sm:gap-3 mb-4">
          {teams.map((team) => (
            <button
              key={team.id}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                selectedTeam?.id === team.id
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-800"
              }`}
              onClick={() => {
                setSelectedTeam(team);
                setSearchQuery("");
              }}
            >
              {team.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <div className="flex items-center justify-center space-x-3 bg-white rounded-xl shadow-sm py-6 px-8 inline-block">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="text-gray-700 font-medium">Loading teams...</span>
            </div>
          </div>
        ) : selectedTeam ? (
          <>
            {/* Search Input */}
            <div className="flex items-center w-full max-w-md border border-gray-300 px-2 py-0 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 mb-4">
              <Search className="h-5 w-5 text-gray-400 mr-[5px]" />
              <input
                type="text"
                className="w-full rounded-lg focus:outline-none py-2 text-sm"
                placeholder={`Search users in ${selectedTeam.name}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <TeamSection team={selectedTeam} filteredUsers={filteredUsers} />
          </>
        ) : (
          <div className="py-16 text-center">
            <p className="text-gray-600 font-medium">Select a team to view details</p>
            {teams.length === 0 && !loading && (
              <p className="mt-2 text-sm text-gray-500">No teams available to display.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BDTeam;
