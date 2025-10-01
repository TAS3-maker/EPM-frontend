import React, { useState, useEffect } from "react"; // Import useEffect
import { useTeams } from "../../../context/BDTeamContext";
import { Loader2, Users, Mail, Phone, Building2, BarChart, Search } from "lucide-react"; // Import Search icon
import { SectionHeader } from '../../../components/SectionHeader';

// TeamSection component remains largely the same, but it will now receive
// filteredUsers instead of directly using team.users
const TeamSection = ({ team, filteredUsers }) => { // Accept filteredUsers prop
  return (
    <div className="mt-8 bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200/80">
      <div className="px-8 py-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200/80">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Building2 className="w-5 h-5 mr-3 text-blue-600" />
          {team.name}
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/80">
              <th className="px-8 py-5 font-semibold text-gray-700 text-left text-sm tracking-wide uppercase">
                User Name
              </th>
              <th className="px-8 py-5 font-semibold text-gray-700 text-left text-sm tracking-wide uppercase">
                User Email
              </th>
              <th className="px-8 py-5 font-semibold text-gray-700 text-left text-sm tracking-wide uppercase">
                Phone Number
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {/* Use filteredUsers here */}
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="3" className="px-8 py-5 text-center text-gray-500">
                  No users found matching your search.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-blue-50/50 transition-colors duration-200 group"
                >
                  <td className="px-8 py-5">
                    <div className="font-medium text-gray-900 text-sm group-hover:text-blue-600 transition-colors flex items-center">
                      <Users className="w-4 h-4 mr-3 text-gray-400 group-hover:text-blue-500" />
                      {user.name}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="text-gray-600 text-sm flex items-center">
                      <Mail className="w-4 h-4 mr-3 text-gray-400 group-hover:text-blue-500" />
                      <a href={`mailto:${user.email}`}>{user.email}</a>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="text-gray-600 text-sm flex items-center">
                      <Phone className="w-4 h-4 mr-3 text-gray-400 group-hover:text-blue-500" />
                      <a href={`tel:${user.phone || "N/A"}`}>{user.phone || "N/A"}</a>
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
    }
  }, [teams, selectedTeam]);

  // Filter users whenever selectedTeam or searchQuery changes
  useEffect(() => {
    if (selectedTeam) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const users = selectedTeam.users.filter(user =>
        user.name.toLowerCase().includes(lowerCaseQuery) ||
        user.email.toLowerCase().includes(lowerCaseQuery) ||
        (user.phone && user.phone.includes(lowerCaseQuery)) // Check phone number if available
      );
      setFilteredUsers(users);
    } else {
      setFilteredUsers([]); // Clear filtered users if no team is selected
    }
  }, [selectedTeam, searchQuery]); // Dependencies for this effect


  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
      <SectionHeader icon={BarChart} title="Team Management" subtitle="Overview of Teams and Their Members" />
      <div className="p-8">
        {/* Team Selection Buttons */}
        <div className="flex flex-wrap gap-3 mb-6"> {/* Use flex-wrap for responsiveness */}
          {teams.map((team) => (
            <button
              key={team.id}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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
            <div className="flex items-center w-full max-w-md border border-gray-300 px-2 py-1 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 mb-6">
              <Search className="h-5 w-5 text-gray-400 mr-[5px]" />
              <input
                type="text"
                className="w-full rounded-lg focus:outline-none py-2"
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