import React, { useState, useEffect } from "react"; // Import useEffect
import { useTeams } from "../../../context/BDTeamContext";
import { Loader2, Users, Mail, Phone, Building2, BarChart, Search } from "lucide-react"; // Import Search icon
import { SectionHeader } from '../../../components/SectionHeader';

// TeamSection component remains largely the same, but it will now receive
// filteredUsers instead of directly using team.users
const TeamSection = ({ team, filteredUsers }) => {
  return (
    <div className="mt-3 bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200/80">
      <div className="px-6 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200/80">
        <h3 className="text-sm font-semibold text-gray-800 flex flex-wrap gap-3 items-center">
          <Building2 className="w-4 h-4 text-blue-600" />
          {team.name}

          {team.tls?.map(tl => (
            <span
              key={tl.id}
              className="text-[12px] font-medium text-gray-600 bg-blue-100 px-2 py-1 rounded-full"
            >
              TL: {tl.name}
            </span>
          ))}
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/80">
              <th className="px-8 py-4 text-xs font-semibold uppercase">User Name</th>
              <th className="px-8 py-4 text-xs font-semibold uppercase">Email</th>
              <th className="px-8 py-4 text-xs font-semibold uppercase">Phone</th>
              <th className="px-8 py-4 text-xs font-semibold uppercase">Team Lead</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-8 py-5 text-center text-gray-500 text-sm">
                  No users found matching your search.
                </td>
              </tr>
            ) : (
              filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-blue-50/50">
                  <td className="px-8 py-4 text-xs font-medium ">
                    <div className="flex items-center justify-center">
                    <Users className="w-3 h-3 mr-2 text-gray-400" />
                    {user.name}
                    </div>
                  </td>

                  <td className="px-8 py-4 text-xs">
                    <div className="flex items-center justify-center">
                    <Mail className="w-3 h-3 inline mr-2 text-gray-400" />
                    <a href={`mailto:${user.email}`}>{user.email}</a>
                    </div>
                  </td>

                  <td className="px-8 py-4 text-xs">
                    <div className="flex items-center justify-center">
                    <Phone className="w-3 h-3 inline mr-2 text-gray-400" />
                    {user.phone_num || "N/A"}
                    </div>
                  </td>

                  <td className="px-8 py-4 text-xs text-gray-600">
                     <div className="flex items-center justify-center">
                    {user.tlName}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const BDTeam = () => {
  const { teams, loading } = useTeams();
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]); // New state for filtered users

  // Set the first team as selected by default once teams are loaded
  useEffect(() => {
    if (teams.length > 0 && !selectedTeam) {
      setSelectedTeam(teams[0]);
      console.log(teams);
    }
  }, [teams, selectedTeam]);

  // Filter users whenever selectedTeam or searchQuery changes
useEffect(() => {
  if (!selectedTeam) {
    setFilteredUsers([]);
    return;
  }

  const allEmployees = getAllEmployees(selectedTeam);
  const q = searchQuery.toLowerCase();

  const filtered = allEmployees.filter(user =>
    user.name.toLowerCase().includes(q) ||
    user.email.toLowerCase().includes(q) ||
    (user.phone_num && user.phone_num.includes(q))
  );

  setFilteredUsers(filtered);
}, [selectedTeam, searchQuery]);


  const getAllEmployees = (team) => {
  if (!team?.tls) return [];

  return team.tls.flatMap(tl =>
    tl.employees.map(emp => ({
      ...emp,
      tlName: tl.name,
      tlId: tl.id,
    }))
  );
};


  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
      <SectionHeader icon={BarChart} title="Team Management" subtitle="Overview of Teams and Their Members" />
      <div className="p-5">
        {/* Team Selection Buttons */}
        <div className="flex flex-wrap gap-1 sm:gap-2 mb-3"> {/* Use flex-wrap for responsiveness */}
          {teams.map((team) => (
            <button
              key={team.id}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                selectedTeam?.id === team.id
                  ? "bg-blue-600 text-white shadow-md" // Added shadow for active button
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-800"
              }`}
              onClick={() => {
                setSelectedTeam(team);
                setSearchQuery(""); // Clear search query when a new team is selected
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
            {/* Search Input Field for Users within the Selected Team */}
            <div className="flex items-center w-full max-w-md border border-gray-300 px-2 py-0 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 mb-3">
              <Search className="h-5 w-5 text-gray-400 mr-[5px]" />
              <input
                type="text"
                className="w-full rounded-lg focus:outline-none py-1.5 text-sm"
                placeholder={`Search users in ${selectedTeam.name}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <TeamSection team={selectedTeam} filteredUsers={filteredUsers} /> {/* Pass filteredUsers */}
          </>
        ) : (
          <div className="py-16 text-center">
            <p className="text-gray-600 font-medium">Select a team to view details</p>
            {teams.length === 0 && !loading && ( // Message if no teams are loaded at all
                <p className="mt-2 text-sm text-gray-500">No teams available to display.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BDTeam;
