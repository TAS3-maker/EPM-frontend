import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "../../../context/PermissionContext.jsx";
import { useAuth } from "../../../context/AuthContext.js";
import { ChevronLeft, Trash2 } from "lucide-react";
import { API_URL } from "../../../utils/ApiConfig.js";
import { SectionHeader } from '../../../components/SectionHeader';
import { Loader2, BarChart, Search } from "lucide-react";


const PermissionsManagement = () => {
  const navigate = useNavigate();
  const { updatePermissions, deletePermissions } = usePermissions();
  const { logout } = useAuth();
  const [showResetModal, setShowResetModal] = useState(false);
  const [allPermissionsData, setAllPermissionsData] = useState(null);
  const [localPermissions, setLocalPermissions] = useState({});
  const [loading, setLoading] = useState(false);
const [searchTerm, setSearchTerm] = useState("");

  const getToken = () => localStorage.getItem("userToken");

  const allPermissions = [
    "dashboard", "employee_management", "roles", "department", "team", "clients",
    "projects", "assigned_projects_inside_projects_assigned", 
    "unassigned_projects_inside_projects_assigned", "performance_sheets",
    "pending_sheets_inside_performance_sheets", "manage_sheets_inside_performance_sheets",
    "unfilled_sheets_inside_performance_sheets", "manage_leaves", "activity_tags",
    "leaves", "teams", "leave_management", "project_management",
    "assigned_projects_inside_project_management", "unassigned_projects_inside_project_management",
    "performance_sheet", "performance_history", "projects_assigned"
  ];

  // Fetch superadmin permissions
  const fetchAllPermissions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/get-permissions`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success && data.permissions_of_users) {
        setAllPermissionsData(data);

        // Initialize localPermissions
        const initialLocal = {};
        data.permissions_of_users.forEach(user => {
          initialLocal[user.user_id] = { ...user.permissions };
        });
        setLocalPermissions(initialLocal);
      }
    } catch (err) {
      console.error("Failed to fetch permissions:", err);
    } finally {
      setLoading(false);
    }
  };
const filteredUsers = allPermissionsData?.permissions_of_users?.filter(user =>
  user.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  user.user_id.toString().includes(searchTerm)
) || [];

  // Update a permission
const handlePermissionChange = (userId, permissionKey, value) => {
  setLocalPermissions(prev => ({
    ...prev,
    [userId]: {
      ...prev[userId],
      [permissionKey]: value.toString()
    }
  }));
};
const handleSaveUserPermissions = async (userId) => {
  const updatedPermissions = localPermissions[userId];
  const success = await updatePermissions(userId, updatedPermissions);

  if (success) {
    await fetchAllPermissions();
    alert(`Permissions updated successfully for User #${userId}`);
  }
};

  // Reset permissions
  const resetPermissions = (userId) => setShowResetModal(userId);

  const confirmReset = async () => {
    const userId = showResetModal;
    setShowResetModal(false);
    await deletePermissions(userId);
    await fetchAllPermissions(); // Refresh table
  };



  useEffect(() => {
    fetchAllPermissions();
  }, []);

  if (loading) return <LoadingPlaceholder navigate={navigate} />;

  return (
    <div className="z-200 mx-auto">
          {/* <SectionHeader icon={BarChart} title="Permission Management" subtitle="View, Edit and manage user permission" 
          /> */}


      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-x-auto">
    <div className="p-4 flex items-center gap-4">
  <Search className="w-5 h-5 text-gray-400" />
  <input
    type="text"
    placeholder="Search by employee name or ID..."
    value={searchTerm}
    onChange={e => setSearchTerm(e.target.value)}
    className="border border-gray-300 rounded-xl p-2 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
</div>


        <div className="overflow-x-auto">
          <table className="w-full table-auto min-w-[2000px]">
            <thead>
              <tr className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                <th className="px-6  text-left font-semibold">User Name / ID     ({allPermissionsData?.permissions_of_users?.length || 0} users)</th>
                {allPermissions.map(p => (
                  <th key={p} className="px-2  text-left font-semibold text-xs uppercase tracking-wider" style={{ minWidth: '120px' }}>
                    {p.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </th>
                ))}
                <th className="px-6 py-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map(user => {
                const userPerms = localPermissions[user.user_id] || {};
                return (
                  <tr key={user.user_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900 border-r border-gray-100">
                      <div>
                        <div className="font-bold text-lg">User #{user.user_id}</div>
                        <div className="text-sm text-gray-500">{user.user_name || 'N/A'}</div>
                      </div>
                    </td>

                    {allPermissions.map(p => (
                      <td key={p} className="px-2 py-4">
                        <PermissionCell
                          value={userPerms[p] || "0"}
                          onChange={val => handlePermissionChange(user.user_id, p, val)}
                        />
                      </td>
                    ))}

                    <td className="px-6 py-4 flex gap-3">
                        <button
    onClick={() => handleSaveUserPermissions(user.user_id)}
    className="flex items-center gap-2 bg-green-50 border-2 border-green-100 text-green-700 px-4 py-2 rounded-xl hover:bg-green-100 transition-all text-sm font-semibold"
  >
    Save
  </button>
                      <button
                        onClick={() => resetPermissions(user.user_id)}
                        className="flex items-center gap-2 bg-red-50 border-2 border-red-100 text-red-700 px-4 py-2 rounded-xl hover:bg-red-100 transition-all text-sm font-semibold"
                      >
                        <Trash2 className="w-4 h-4" />
                        Reset
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showResetModal && (
        <ResetModal userId={showResetModal} onCancel={() => setShowResetModal(false)} onConfirm={confirmReset} />
      )}
    </div>
  );
};

// Permission Cell
const PermissionCell = ({ value, onChange }) => {
  const level = parseInt(value || 0);
  return (
    <div className="flex items-center space-x-1">
      <button
        type="button"
        onClick={() => onChange(0)}
        className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition-all p-1 ${
          level === 0
            ? "bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg shadow-gray-300/50 scale-105 hover:scale-110"
            : "bg-gray-200 text-gray-500 hover:bg-gray-300 hover:scale-105 hover:shadow-md"
        }`}
        title="Hide (0) - Remove from sidebar"
      >0</button>

      {[1,2].map(n => (
        <button
          key={n} type="button"
          onClick={() => onChange(n)}
          className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition-all p-1 ${
            level === n 
              ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-300/50 scale-105 hover:scale-110"
              : "bg-gray-200 text-gray-500 hover:bg-gray-300 hover:scale-105 hover:shadow-md"
          }`}
          title={n===1?"View":n===2?"Edit":"Full Access"}
        >{n}</button>
      ))}

      <div className="text-xs text-gray-500 min-w-[60px] font-medium">
        {level===0?"Hidden":level===1?"View":level===2?"Edit":"Full"}
      </div>
    </div>
  );
};

// Loading Placeholder
const LoadingPlaceholder = ({ navigate }) => (
  <div className="p-8 max-w-7xl mx-auto">
    <div className="flex items-center gap-4 mb-8">
      <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-screen">
      <div className="bg-white rounded-2xl p-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-8"></div>
        {Array(10).fill(0).map((_, i) => (
          <div key={i} className="h-14 bg-gray-100 rounded-xl mb-3"></div>
        ))}
      </div>
      <div className="lg:col-span-2 bg-white rounded-2xl p-12 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-600">Loading permissions...</p>
        </div>
      </div>
    </div>
  </div>
);

// Reset Modal
const ResetModal = ({ userId, onCancel, onConfirm }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
      <div className="text-center mb-6">
        <Trash2 className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Reset Permissions?</h3>
        <p className="text-gray-600">
          This will remove <strong>all permissions</strong> for User #{userId}.
          <br />This action cannot be undone.
        </p>
      </div>
      <div className="flex gap-3 justify-end">
        <button onClick={onCancel} className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all">Cancel</button>
        <button onClick={onConfirm} className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold shadow-lg flex items-center gap-2">
          <Trash2 className="w-4 h-4" /> Reset Permissions
        </button>
      </div>
    </div>
  </div>
);

export default PermissionsManagement;
