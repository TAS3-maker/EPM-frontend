import React, { useState, useEffect } from 'react';
import { SectionHeader } from '../../../components/SectionHeader';
import { Loader2, User, Clock, Search, BarChart } from 'lucide-react';
import { ClearButton } from '../../../AllButtons/AllButtons';
import { API_URL } from '../../../utils/ApiConfig';

const OfflineHours = () => {
  const [offlineHours, setOfflineHours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  const fetchOfflineHours = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('userToken');
      
      const response = await fetch(`${API_URL}/api/get-users-offline-hours`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const result = await response.json();
      setOfflineHours(result.data || []);
    } catch (error) {
      console.error('Error fetching offline hours:', error);
      setOfflineHours([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfflineHours();
  }, []);

  useEffect(() => {
    if (searchQuery === '') {
      setFilteredData(offlineHours);
    } else {
      const filtered = offlineHours.filter(user =>
        user.user_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredData(filtered);
    }
  }, [offlineHours, searchQuery]);

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex items-center space-x-3 bg-white rounded-xl shadow-sm py-6 px-8">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-700 font-medium">Loading offline hours...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={BarChart}
        title="Offline-Hours"
        subtitle="List of all users offline hours"
      />

      {/* Search Bar */}
      <div className="flex items-center gap-3 max-w-md">
        <div className="flex items-center w-full border border-gray-300 px-3 py-2 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
          <Search className="h-4 w-4 text-gray-400 mr-2" />
          <input
            type="text"
            className="w-full outline-none text-sm"
            placeholder="Search by user name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <ClearButton onClick={handleClearSearch} />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Total Offline Hours
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Projects Breakdown
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                    {searchQuery ? 'No users found matching your search.' : 'No offline hours data available.'}
                  </td>
                </tr>
              ) : (
                filteredData.map((user) => (
                  <tr key={user.user_id} className="hover:bg-gray-50 transition-colors">
                    {/* User Column */}
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{user.user_name}</div>
                          <div className="text-xs text-gray-500">ID: {user.user_id}</div>
                        </div>
                      </div>
                    </td>

                    {/* Total Hours Column */}
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-orange-500" />
                        <span className="font-semibold text-lg text-gray-900">{user.total_offline_hours}</span>
                      </div>
                    </td>

                    {/* Projects Column */}
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        {user.projects && user.projects.length > 0 ? (
                          user.projects.map((project, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                                <span className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                                  {project.project_name}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="font-semibold text-sm text-gray-900">
                                  {project.total_offline_hours}
                                </span>
                                {project.traking_id && (
                                  <div className="text-xs text-gray-500 mt-0.5">#{project.traking_id}</div>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">No projects</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OfflineHours;
