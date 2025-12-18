import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart, Search, Pencil } from "lucide-react";
import { API_URL } from "../../../utils/ApiConfig";
import { SectionHeader } from "../../../components/SectionHeader";
import { usePermissions } from "../../../context/PermissionContext";
import { useAuth } from "../../../context/AuthContext";
import Pagination from "../../../components/Pagination";
const PermissionsManagement = () => {
  const navigate = useNavigate();
  const { updatePermissions } = usePermissions();
  const { logout } = useAuth();
 const itemsPerPage = 10;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
const [filterBy, setFilterBy] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const getToken = () => localStorage.getItem("userToken");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/get-permissions-allusers`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.permissions_of_users || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
 const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
 
const filteredUsers = users.filter((user) => {
  const query = searchQuery.toLowerCase();

  if (!query) return true;

  switch (filterBy) {
    case "department":
      return user.department_name?.toLowerCase().includes(query);

    case "name":
      return user.user_name?.toLowerCase().includes(query);

    case "email":
      return user.email?.toLowerCase().includes(query);

    case "tas_id":
      return user.tas_id?.toString().includes(query);

    default:
      return (
        user.department_name?.toLowerCase().includes(query) ||
        user.user_name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.tas_id?.toString().includes(query)
      );
  }
});


  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const pagedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="mx-auto">
      <SectionHeader
        icon={BarChart}
        title="Role Management"
        subtitle="View, Edit and manage user roles"
      />

      {/* SEARCH */}
   <div className="flex flex-wrap md:flex-nowrap items-center gap-3 border p-2 rounded-lg shadow-md bg-white mb-4">

  {/* Search Input */}
  <div className="flex items-center w-full border border-gray-300 px-2 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
    <Search className="h-5 w-5 text-gray-400 mr-[5px]" />
    <input
      type="text"
      className="w-full rounded-lg focus:outline-none py-2"
      placeholder={`Search by ${filterBy === "all" ? "Department, Name, Email, TAS ID" : filterBy}`}
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
  </div>

  {/* Filter Dropdown */}
  <select
    value={filterBy}
    onChange={(e) => setFilterBy(e.target.value)}
    className="px-3 py-2 border rounded-md bg-white cursor-pointer focus:outline-none"
  >
    <option value="all">All</option>
    <option value="user_email">Email</option>
    <option value="name">Name</option>
    <option value="user_employee_id">TAS ID</option>
  </select>

  {/* Clear Button */}
  <button
    onClick={() => {
      setSearchQuery("");
      setFilterBy("all");
    }}
    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium"
  >
    Clear
  </button>

</div>


      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow border overflow-x-auto">
        <table className="w-full sm:table-fixed">
          <thead>
            <tr className="table-bg-heading table-th-tr-row whitespace-nowrap sm:whitespace-normal">
              <th className="px-4 py-2 font-medium text-center text-sm">Created Date</th>
              <th className="px-4 py-2 font-medium text-center text-sm">Updated Date</th>
              <th className="px-4 py-2 font-medium text-center text-sm">Email</th>
              <th className="px-4 py-2 font-medium text-center text-sm">User</th>
              <th className="px-4 py-2 font-medium text-center text-sm">Actions</th>
            </tr>
          </thead>

          <tbody>
            {pagedUsers.map((user) => (
              <tr key={user.user_id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 text-center text-xs">
                  {formatDate(user.permissions.created_at) || "-"}
                </td>
                <td className="px-4 py-3 text-center text-xs">
                  {formatDate(user.permissions.updated_at || "-")}
                </td>
                <td className="px-4 py-3 text-center text-xs">
                  {user.user_email || "-"}
                </td>
                <td className="px-4 py-3 text-center text-xs">
                  <div className="font-semibold">{user.user_name}</div>
                  {/* <div className="text-xs text-gray-500">{user.email}</div> */}
                  <div className="text-xs text-gray-400">TAS ID: {user.user_employee_id}</div>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => setSelectedUser(user)}
                    className="p-2 rounded-lg hover:bg-blue-50 text-blue-600"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}

            {!pagedUsers.length && (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
          
        </table>
           <div className="p-4">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                      />
                    </div>
      </div>

      {selectedUser && (
        <EditPermissionsModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSave={async (permissions) => {
            await updatePermissions(selectedUser.user_id, permissions);
            setSelectedUser(null);
            fetchUsers();
          }}
        />
      )}
    </div>
  );
};

const EditPermissionsModal = ({ user, onClose, onSave }) => {
  const [permissions, setPermissions] = useState({ ...user.permissions });

  const handleChange = (key, value) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">
  <div className="w-full max-w-4xl rounded-3xl bg-white/70 backdrop-blur-xl border border-white/30 shadow-2xl p-6 md:p-8">

    {/* Header */}
    <div className="mb-6 flex items-center justify-between">
      <h3 className="text-2xl font-bold text-gray-900">
        Edit Permissions
        <span className="block text-sm font-normal text-gray-500">
          {user.user_name}
        </span>
      </h3>

      <button
        onClick={onClose}
        className="text-gray-500 hover:text-gray-800 transition"
      >
        ✕
      </button>
    </div>

    {/* Permission Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-2">
      {Object.keys(permissions).map((key) => (
        <div
          key={key}
          className="rounded-2xl border border-gray-200 bg-white/60 backdrop-blur-md p-4 hover:shadow-lg transition-all"
        >
          <p className="mb-3 text-sm font-semibold text-gray-700 capitalize">
            {key.replace(/_/g, " ")}
          </p>

          <div className="flex gap-2">
            {/* Hidden */}
            <label className={`flex-1 cursor-pointer`}>
              <input
                type="radio"
                name={key}
                value="0"
                checked={permissions[key] === "0"}
                onChange={() => handleChange(key, "0")}
                className="hidden"
              />
              <div
                className={`text-center px-3 py-2 rounded-xl text-xs font-semibold transition-all
                  ${
                    permissions[key] === "0"
                      ? "bg-gray-500 text-white shadow"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
              >
                Hidden
              </div>
            </label>

            {/* View */}
            <label className="flex-1 cursor-pointer">
              <input
                type="radio"
                name={key}
                value="1"
                checked={permissions[key] === "1"}
                onChange={() => handleChange(key, "1")}
                className="hidden"
              />
              <div
                className={`text-center px-3 py-2 rounded-xl text-xs font-semibold transition-all
                  ${
                    permissions[key] === "1"
                      ? "bg-blue-500 text-white shadow"
                      : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                  }`}
              >
                View
              </div>
            </label>

            {/* Edit */}
            <label className="flex-1 cursor-pointer">
              <input
                type="radio"
                name={key}
                value="2"
                checked={permissions[key] === "2"}
                onChange={() => handleChange(key, "2")}
                className="hidden"
              />
              <div
                className={`text-center px-3 py-2 rounded-xl text-xs font-semibold transition-all
                  ${
                    permissions[key] === "2"
                      ? "bg-indigo-600 text-white shadow"
                      : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                  }`}
              >
                Edit
              </div>
            </label>
          </div>
        </div>
      ))}
    </div>

    {/* Footer */}
    <div className="mt-8 flex justify-end gap-3">
      <button
        onClick={onClose}
        className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition"
      >
        Cancel
      </button>
      <button
        onClick={() => onSave(permissions)}
        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg hover:scale-[1.02] transition-transform"
      >
        Save Changes
      </button>
    </div>
  </div>
</div>

  );
};

<<<<<<< HEAD
export default PermissionsManagement;
=======
export default PermissionsManagement;
>>>>>>> 2c7ec3c3d8dfe71aee8521cd9d2e108dbc1ae8ae
