import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart, Search, Pencil } from "lucide-react";
import { API_URL } from "../../../utils/ApiConfig";
import { SectionHeader } from "../../../components/SectionHeader";
import { usePermissions } from "../../../context/PermissionContext";
import { useAuth } from "../../../context/AuthContext";
import Pagination from "../../../components/Pagination";
import { useOutsideClick  } from "../../../components/useOutsideClick";
import GlobalTable from "../../../components/GlobalTable";


const MENU_GROUPS = {
  Overview: ["Dashboard"],
  "User Management": ["Employee Management", "Roles", "Permission", "Department", "Team", "Teams"],
  Projects: ["Clients", "Projects", "Projects Assigned", "Project Management", "Activity Tags"],
  Masters: ["Project Sources", "Communication Types", "Accounts", "Notes Management"],
  Performance: ["Performance Sheets", "Performance Sheet", "Performance History","Offline-Hours"],
  Leaves: ["Manage Leaves", "Leaves", "Leave Management"],
  Reporting:["Team-Reporting","Leave-Reporting","Sheet-Reporting"]
};

const GROUP_LABELS = {
  Overview: "📊",
  "User Management": "👥",
  Projects: "📁",
  Masters: "⚙️",
  Performance: "📈",
  Users: "👤",
  Leaves: "📅",
  Reporting: "📊"
};

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


// Column definitions for GlobalTable
  const columns = [
    {
      key: 'created_at',
      label: 'Created Date',
      render: (user) => formatDate(user.permissions?.created_at) || "-"
    },
    {
      key: 'updated_at',
      label: 'Updated Date',
      render: (user) => formatDate(user.permissions?.updated_at) || "-"
    },
    {
      key: 'user_email',
      label: 'Email',
      render: (user) => user.user_email || "-"
    },
    {
      key: 'user_name',
      label: 'User',
      render: (user) => (
        <div>
          <div className="font-semibold">{user.user_name}</div>
          <div className="text-[10px] text-gray-400">TAS ID: {user.user_employee_id}</div>
        </div>
      )
    }
  ];

  // Actions renderer
  const renderActions = (user) => (
    <button
      onClick={() => setSelectedUser(user)}
      className="p-2 rounded-lg hover:bg-blue-50 text-blue-600"
    >
      <Pencil className="w-4 h-4" />
    </button>
  );



  
  return (
    <div className="mx-auto">
      <SectionHeader
        icon={BarChart}
        title="Role Management"
        subtitle="View, Edit and manage user roles"
      />

      {/* SEARCH */}
      <div className="flex flex-wrap md:flex-nowrap items-center gap-3 border p-2 rounded-lg shadow-md bg-white mb-2">

        {/* Search Input */}
        <div className="flex items-center w-full border border-gray-300 px-2 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
          <Search className="h-5 w-5 text-gray-400 mr-[5px]" />
          <input
            type="text"
            className="w-full rounded-lg focus:outline-none py-1.5 text-sm"
            placeholder={`Search by ${filterBy === "all" ? "Department, Name, Email, TAS ID" : filterBy}`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Dropdown */}
        <select
          value={filterBy}
          onChange={(e) => setFilterBy(e.target.value)}
          className="px-3 py-1.5 border rounded-md bg-white cursor-pointer focus:outline-none"
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
          className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium"
        >
          Clear
        </button>

      </div>

      {/* TABLE */}

        <div className="bg-white rounded-2xl shadow border overflow-hidden">
        <GlobalTable
          data={users}
          columns={columns}
          isLoading={loading}
          paginatedData={pagedUsers}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          actionsComponent={{ right: renderActions }}
          emptyStateTitle={!loading && filteredUsers.length === 0 ? "No users found" : "No users available"}
          emptyStateMessage="No users match your search criteria."
        />
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
  const [showInfoPopup, setShowInfoPopup] = useState(null);

  

  const modalRef = useOutsideClick(true, onClose);

  const handleChange = (key, value) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  
const PERMISSION_INFO = {
    dashboard: "Access to project dashboard with overview statistics and charts.",
    employee_management: "Full CRUD operations for employee records including add, edit, delete.",
    roles: "Manage user roles and assign permissions to different user groups.",
    permission: "Control granular permissions for each user role and feature.",
    department: "Create, update, and manage employee departments and hierarchies.",
    team: "Assign employees to teams and manage team memberships.",
    teams: "View team members, team performance, and team assignments.",
    clients: "Manage client master data including contact details and project history.",
    projects: "Full access to all projects - create, view, edit, delete.",
    projects_assigned: "View and manage project assignments to team members.",
    activity_tags: "Create and manage activity tags for project tracking.",
    project_source: "Manage project source types (leads, referrals, etc.).",
    communication_type: "Define communication channels and types for projects.",
    account_master: "Manage client accounts and billing information.",
    notes_management: "Create, edit, and organize project notes and documentation.",
    performance_sheets: "Access and manage all performance tracking sheets.",
    standup_sheet: "Daily standup sheets for team progress tracking.",
    performance_sheet: "Individual performance sheets with time tracking.",
    performance_history: "View historical performance data and reports.",
    offline_hours: "Track and manage offline working hours.",
    leaves: "Apply for leaves and view leave balances.",
    leave_management: "Approve/reject leave requests and manage leave policies.",
    team_reporting: "Generate team performance and productivity reports.",
    leave_reporting: "Leave analytics and reporting dashboard.",
    sheet_reporting: "Generate reports based on performance sheets and timesheets."
  };




  const PERMISSION_MAPPING = {
    // Overview
    "dashboard": "Overview",
    
    // User Management
    "employee_management": "User Management",
    "roles": "User Management",
    "permission": "User Management",
    "department": "User Management",
    "team": "User Management",
    "teams": "User Management",

    // Projects
    "clients": "Projects",
   
    "projects_assigned": "Projects",
    "activity_tags": "Projects",

    // Masters
    "project_source": "Masters",
    "communication_type": "Masters",
    "account_master": "Masters",
    "notes_management": "Masters",

    // Performance
    "performance_sheets": "Performance",
    "standup_sheet": "Performance",
    "pending_sheets_inside_performance_sheets": "Performance",
    "previous_sheets": "Performance",
    "manage_sheets_inside_performance_sheets": "Performance",
    "unfilled_sheets_inside_performance_sheets": "Performance",
    // "performance_sheet": "Performance",
    // "performance_history": "Performance",
    "offline_hours": "Performance",

    //Users
    "performance_sheet": "Users",
    "performance_history": "Users",
    "leaves": "Users",
     "projects": "Users",

    // Leaves
    
    "leave_management": "Leaves",

    // Reporting
    "team_reporting": "Reporting",
    "leave_reporting": "Reporting",
    "sheet_reporting": "Reporting"
  };

   const DISPLAY_NAMES = {
    "team": "Manage Teams",
    "roles": "User Roles",
    "teams": "View Team Members", 
    "permission": "User Permission",
    "leaves": "Apply Leave",
    "clients": "Client Master",
    "projects": "All Projects",
  };


  const getGroup = (key) => {
    return PERMISSION_MAPPING[key] || "Others";
  };

 
  const groupedPermissions = Object.keys(permissions).reduce((acc, key) => {
  
    if (key === "created_at" || key === "updated_at") return acc;
    
    const group = getGroup(key);
    if (!acc[group]) acc[group] = [];
    acc[group].push(key);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">
      <div ref={modalRef} className="w-full max-w-4xl rounded-3xl bg-white/70 backdrop-blur-xl border border-white/30 shadow-2xl p-6 md:p-8">

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

        
        <div className="grid grid-cols-1  gap-4 max-h-[60vh] overflow-y-auto pr-2">
          {Object.entries(groupedPermissions).map(([groupName, keys]) => (
            <div key={groupName} className="">
              
              {keys.length > 0 && (
                <div className="mb-3 p-2 border-b border-gray-400 rounded-lg">
                  <div className="text-sm font-semibold text-gray-700 flex items-center">
                    {GROUP_LABELS[groupName] || "📋"} 
                    <span className="ml-1 capitalize">{groupName}</span>
                    <span className="ml-auto text-sm text-gray-600">({keys.length})</span>
                  </div>
                </div>
              )}

             
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {keys.map((key) => (
                <div
                  key={key}
                  className="relative z-10 rounded-2xl border border-gray-200 bg-white/60 backdrop-blur-md p-4 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <p className="mb-3 text-sm font-semibold text-gray-700 capitalize">
                    {DISPLAY_NAMES[key] || key.replace(/_/g, " ")}
                    </p>
                     <div className="relative group">
                        <button className="p-1 hover:bg-gray-200 rounded-full transition-all">
                          <svg
                            className="w-4 h-4 text-gray-500 hover:text-blue-500 transition-colors"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </button>

                        {/* TOOLTIP */}
                        <div
                          className="
                            fixed
                            z-[9999]
                            left-1/2 top-1/2
                            -translate-x-1/2 -translate-y-1/2
                            w-64
                            rounded-xl
                            bg-white
                            border border-blue-200
                            shadow-2xl
                            p-4
                            text-xs
                            text-gray-800
                            opacity-0
                            invisible
                            group-hover:opacity-100
                            group-hover:visible
                            transition-all
                            duration-200
                          "
                        >
                          <div className="font-semibold text-blue-700 mb-1">
                            {DISPLAY_NAMES[key] || key.replace(/_/g, " ")}
                          </div>
                          <p>
                            {PERMISSION_INFO[key] || "Permission details not available."}
                          </p>
                        </div>
                      </div>
                  </div>

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

export default PermissionsManagement;





















// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { BarChart, Search, Pencil } from "lucide-react";
// import { API_URL } from "../../../utils/ApiConfig";
// import { SectionHeader } from "../../../components/SectionHeader";
// import { usePermissions } from "../../../context/PermissionContext";
// import { useAuth } from "../../../context/AuthContext";
// import Pagination from "../../../components/Pagination";
// const PermissionsManagement = () => {
//   const navigate = useNavigate();
//   const { updatePermissions } = usePermissions();
//   const { logout } = useAuth();
//  const itemsPerPage = 10;

//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [searchQuery, setSearchQuery] = useState("");
// const [filterBy, setFilterBy] = useState("all");

//   const [currentPage, setCurrentPage] = useState(1);
//   const getToken = () => localStorage.getItem("userToken");

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const fetchUsers = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch(`${API_URL}/api/get-permissions-allusers`, {
//         headers: {
//           Authorization: `Bearer ${getToken()}`,
//         },
//       });
//       const data = await res.json();
//       if (data.success) {
//         setUsers(data.permissions_of_users || []);
//       }
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };
//  const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     });
//   };
 
// const filteredUsers = users.filter((user) => {
//   const query = searchQuery.toLowerCase();

//   if (!query) return true;

//   switch (filterBy) {
//     case "department":
//       return user.department_name?.toLowerCase().includes(query);

//     case "name":
//       return user.user_name?.toLowerCase().includes(query);

//     case "email":
//       return user.email?.toLowerCase().includes(query);

//     case "tas_id":
//       return user.tas_id?.toString().includes(query);

//     default:
//       return (
//         user.department_name?.toLowerCase().includes(query) ||
//         user.user_name?.toLowerCase().includes(query) ||
//         user.email?.toLowerCase().includes(query) ||
//         user.tas_id?.toString().includes(query)
//       );
//   }
// });


//   const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
//   const pagedUsers = filteredUsers.slice(
//     (currentPage - 1) * itemsPerPage,
//     currentPage * itemsPerPage
//   );

//   return (
//     <div className="mx-auto">
//       <SectionHeader
//         icon={BarChart}
//         title="Role Management"
//         subtitle="View, Edit and manage user roles"
//       />

//       {/* SEARCH */}
//    <div className="flex flex-wrap md:flex-nowrap items-center gap-3 border p-2 rounded-lg shadow-md bg-white mb-4">

//   {/* Search Input */}
//   <div className="flex items-center w-full border border-gray-300 px-2 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
//     <Search className="h-5 w-5 text-gray-400 mr-[5px]" />
//     <input
//       type="text"
//       className="w-full rounded-lg focus:outline-none py-2"
//       placeholder={`Search by ${filterBy === "all" ? "Department, Name, Email, TAS ID" : filterBy}`}
//       value={searchQuery}
//       onChange={(e) => setSearchQuery(e.target.value)}
//     />
//   </div>

//   {/* Filter Dropdown */}
//   <select
//     value={filterBy}
//     onChange={(e) => setFilterBy(e.target.value)}
//     className="px-3 py-2 border rounded-md bg-white cursor-pointer focus:outline-none"
//   >
//     <option value="all">All</option>
//     <option value="user_email">Email</option>
//     <option value="name">Name</option>
//     <option value="user_employee_id">TAS ID</option>
//   </select>

//   {/* Clear Button */}
//   <button
//     onClick={() => {
//       setSearchQuery("");
//       setFilterBy("all");
//     }}
//     className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium"
//   >
//     Clear
//   </button>

// </div>


//       {/* TABLE */}
//       <div className="bg-white rounded-2xl shadow border overflow-x-auto">
//         <table className="w-full sm:table-fixed">
//           <thead>
//             <tr className="table-bg-heading table-th-tr-row whitespace-nowrap sm:whitespace-normal">
//               <th className="px-4 py-2 font-medium text-center text-sm">Created Date</th>
//               <th className="px-4 py-2 font-medium text-center text-sm">Updated Date</th>
//               <th className="px-4 py-2 font-medium text-center text-sm">Email</th>
//               <th className="px-4 py-2 font-medium text-center text-sm">User</th>
//               <th className="px-4 py-2 font-medium text-center text-sm">Actions</th>
//             </tr>
//           </thead>

//           <tbody>
//             {pagedUsers.map((user) => (
//               <tr key={user.user_id} className="border-b hover:bg-gray-50">
//                 <td className="px-4 py-3 text-center text-xs">
//                   {formatDate(user.permissions.created_at) || "-"}
//                 </td>
//                 <td className="px-4 py-3 text-center text-xs">
//                   {formatDate(user.permissions.updated_at || "-")}
//                 </td>
//                 <td className="px-4 py-3 text-center text-xs">
//                   {user.user_email || "-"}
//                 </td>
//                 <td className="px-4 py-3 text-center text-xs">
//                   <div className="font-semibold">{user.user_name}</div>
//                   {/* <div className="text-xs text-gray-500">{user.email}</div> */}
//                   <div className="text-xs text-gray-400">TAS ID: {user.user_employee_id}</div>
//                 </td>
//                 <td className="px-4 py-3 text-center">
//                   <button
//                     onClick={() => setSelectedUser(user)}
//                     className="p-2 rounded-lg hover:bg-blue-50 text-blue-600"
//                   >
//                     <Pencil className="w-4 h-4" />
//                   </button>
//                 </td>
//               </tr>
//             ))}

//             {!pagedUsers.length && (
//               <tr>
//                 <td colSpan="5" className="text-center py-6 text-gray-500">
//                   No users found
//                 </td>
//               </tr>
//             )}
//           </tbody>
          
//         </table>
//            <div className="p-4">
//                       <Pagination
//                         currentPage={currentPage}
//                         totalPages={totalPages}
//                         onPageChange={setCurrentPage}
//                       />
//                     </div>
//       </div>

//       {selectedUser && (
//         <EditPermissionsModal
//           user={selectedUser}
//           onClose={() => setSelectedUser(null)}
//           onSave={async (permissions) => {
//             await updatePermissions(selectedUser.user_id, permissions);
//             setSelectedUser(null);
//             fetchUsers();
//           }}
//         />
//       )}
//     </div>
//   );
// };

// const EditPermissionsModal = ({ user, onClose, onSave }) => {
//   const [permissions, setPermissions] = useState({ ...user.permissions });

//   const handleChange = (key, value) => {
//     setPermissions((prev) => ({
//       ...prev,
//       [key]: value,
//     }));
//   };

//   return (
//   <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">
//   <div className="w-full max-w-4xl rounded-3xl bg-white/70 backdrop-blur-xl border border-white/30 shadow-2xl p-6 md:p-8">

//     {/* Header */}
//     <div className="mb-6 flex items-center justify-between">
//       <h3 className="text-2xl font-bold text-gray-900">
//         Edit Permissions
//         <span className="block text-sm font-normal text-gray-500">
//           {user.user_name}
//         </span>
//       </h3>

//       <button
//         onClick={onClose}
//         className="text-gray-500 hover:text-gray-800 transition"
//       >
//         ✕
//       </button>
//     </div>

//     {/* Permission Grid */}
//     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-2">
//       {Object.keys(permissions).map((key) => (
//         <div
//           key={key}
//           className="rounded-2xl border border-gray-200 bg-white/60 backdrop-blur-md p-4 hover:shadow-lg transition-all"
//         >
//           <p className="mb-3 text-sm font-semibold text-gray-700 capitalize">
//             {key.replace(/_/g, " ")}
//           </p>

//           <div className="flex gap-2">
//             {/* Hidden */}
//             <label className={`flex-1 cursor-pointer`}>
//               <input
//                 type="radio"
//                 name={key}
//                 value="0"
//                 checked={permissions[key] === "0"}
//                 onChange={() => handleChange(key, "0")}
//                 className="hidden"
//               />
//               <div
//                 className={`text-center px-3 py-2 rounded-xl text-xs font-semibold transition-all
//                   ${
//                     permissions[key] === "0"
//                       ? "bg-gray-500 text-white shadow"
//                       : "bg-gray-100 text-gray-500 hover:bg-gray-200"
//                   }`}
//               >
//                 Hidden
//               </div>
//             </label>

//             {/* View */}
//             <label className="flex-1 cursor-pointer">
//               <input
//                 type="radio"
//                 name={key}
//                 value="1"
//                 checked={permissions[key] === "1"}
//                 onChange={() => handleChange(key, "1")}
//                 className="hidden"
//               />
//               <div
//                 className={`text-center px-3 py-2 rounded-xl text-xs font-semibold transition-all
//                   ${
//                     permissions[key] === "1"
//                       ? "bg-blue-500 text-white shadow"
//                       : "bg-blue-50 text-blue-600 hover:bg-blue-100"
//                   }`}
//               >
//                 View
//               </div>
//             </label>

//             {/* Edit */}
//             <label className="flex-1 cursor-pointer">
//               <input
//                 type="radio"
//                 name={key}
//                 value="2"
//                 checked={permissions[key] === "2"}
//                 onChange={() => handleChange(key, "2")}
//                 className="hidden"
//               />
//               <div
//                 className={`text-center px-3 py-2 rounded-xl text-xs font-semibold transition-all
//                   ${
//                     permissions[key] === "2"
//                       ? "bg-indigo-600 text-white shadow"
//                       : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
//                   }`}
//               >
//                 Edit
//               </div>
//             </label>
//           </div>
//         </div>
//       ))}
//     </div>

//     {/* Footer */}
//     <div className="mt-8 flex justify-end gap-3">
//       <button
//         onClick={onClose}
//         className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition"
//       >
//         Cancel
//       </button>
//       <button
//         onClick={() => onSave(permissions)}
//         className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg hover:scale-[1.02] transition-transform"
//       >
//         Save Changes
//       </button>
//     </div>
//   </div>
// </div>

//   );
// };

// export default PermissionsManagement;
