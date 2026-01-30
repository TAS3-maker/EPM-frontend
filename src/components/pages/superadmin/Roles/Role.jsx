import React, { useState, useMemo } from "react";
import { useRole } from "../../../context/RoleContext";
import { X, Pencil } from "lucide-react";
import { SubmitButton } from "../../../AllButtons/AllButtons";
import { usePermissions } from "../../../context/PermissionContext.jsx";
import { useOutsideClick } from "../../../components/useOutsideClick";

export const Role = () => {
  const { addRole, roles, fetchRoles, isLoading, message, updateRole } = useRole();
  const { permissions } = usePermissions();

  const [roleName, setRoleName] = useState("");
  const [routeName, setRouteName ] = useState("");
  const [error, setError] = useState("");
  const [showMessage, setShowMessage] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const [selectedRole, setSelectedRole] = useState("");
  const [roleToEdit, setRoleToEdit] = useState(null);
  const [showEditPermissions, setShowEditPermissions] = useState(false);
  const [saving, setSaving] = useState(false);

  const employeePermission = permissions?.permissions?.[0]?.roles;
  const canAddEmployee = employeePermission === "2";

  /* ---------- FILTER ROLES ---------- */
  const filteredRoles = useMemo(() => {
    return roles.filter((role) =>
      role.name.toLowerCase().includes("")
    );
  }, [roles]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!roleName) {
      setError("Role name is required");
      return;
    }

    if (!routeName.trim()) {
      setError("Route name is required");
      return;
    }
const name = roleName.toString();


    setError("");
    // const response = await addRole(roleName);
    const response = await addRole({ name: name, role_label: routeName.trim() });

    if (response?.errorMessage) {
      setError(response.errorMessage);
    } else {
      setRoleName("");
      setRouteName("");
      setShowMessage(true);
      setIsModalOpen(false);
      setIsAssignModalOpen(false);
      fetchRoles();
    }
  };

  const openPermissionsEditor = () => {
    const role = roles.find((r) => r.name === selectedRole);
    if (!role) return;

    setRoleToEdit(role);
    setShowEditPermissions(true);
  };

  const handleSavePermissions = async (updatedPermissions) => {
    if (!roleToEdit?.id) return;

    setSaving(true);
    try {
      const payload = {
        name: roleToEdit.name,
         role_label: roleToEdit.role_label,
        roles_permissions: updatedPermissions
      };

      console.log("🔄 Sending payload:", JSON.stringify(payload, null, 2));

      const response = await updateRole(roleToEdit.id, payload);

      if (response?.success || !response?.errorMessage) {
        console.log(" Role permissions updated successfully");
        fetchRoles();
        onClose();
        setIsAssignModalOpen(false)
      } else {
        console.error("Update failed:", response?.errorMessage);
        alert("Failed to update permissions: " + (response?.errorMessage || "Unknown error"));
      }
    } catch (error) {
      console.error("API Error:", error);
      alert("Failed to update permissions. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const onClose = () => {
    setShowEditPermissions(false);
    setRoleToEdit(null);
  };

  const handleCloseAddModal = () => {
    setIsModalOpen(false);
    setRoleName("");
    setRouteName("");
    setError("");
    setShowMessage(false);
  };

  const handleCloseAssignModal = () => {
    setIsAssignModalOpen(false);
    setSelectedRole("");
    setError("");
  };

  // Refs for outside click
  const addModalRef = useOutsideClick(isModalOpen, handleCloseAddModal);
  const assignModalRef = useOutsideClick(isAssignModalOpen, handleCloseAssignModal);

  return (
    <div className="bg-white">
      <div className="flex gap-2 flex-row">
        {canAddEmployee && (
          <button
            onClick={() => {
              setIsModalOpen(true);
              setError("");
              setShowMessage(false);
            }}
            className="add-items-btn text-sm"
          >
            Add Role
          </button>
        )}

        <button
          onClick={() => {
            setIsAssignModalOpen(true);
            setSelectedRole("");
            setError("");
          }}
          className="add-items-btn text-sm"
        >
          Assign Permission
        </button>
      </div>

      {/* ASSIGN PERMISSION MODAL */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div ref={assignModalRef} className="bg-white rounded-lg shadow-lg p-6 w-96 relative">
            <button
              onClick={() => setIsAssignModalOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-semibold">Select Role</h2>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                Role Name
              </label>

              <div className="flex gap-2 mt-1">
                <select
                  className="flex-1 p-2 border rounded-md"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  <option value="">Select a role...</option>
                  {filteredRoles.map((role) => (
                    <option key={role.id || role.name} value={role.name}>
                      {role.name}
                    </option>
                  ))}
                </select>

                {selectedRole && (
                  <button
                    type="button"
                    onClick={openPermissionsEditor}
                    className="p-2 border rounded-md hover:bg-gray-100"
                  >
                    <Pencil className="w-4 h-4 text-gray-600" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD ROLE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div ref={addModalRef} className="bg-white rounded-lg shadow-lg p-6 w-96 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-semibold">Enter Role Details</h2>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role Name <span className="text-red-500">*</span>
                </label>
              <input
                placeholder="Role name"
                className="w-full p-2 border rounded-md"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
              />
               </div>
         
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Route Name <span className="text-red-500">*</span>
                </label>
                <input
                  placeholder="Enter route name (e.g., /admin, /manager)"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={routeName}
                  onChange={(e) => setRouteName(e.target.value)}
                  required
                />
              </div>



              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}

              <SubmitButton disabled={isLoading} />
            </form>
          </div>
        </div>
      )}

      {/* EDIT PERMISSIONS MODAL */}
      {showEditPermissions && roleToEdit && (
        <EditPermissionsModal
          role={roleToEdit}
          onClose={onClose}
          onSave={handleSavePermissions}
          saving={saving}
        />
      )}
    </div>
  );
};

/* ========================================================= */
/* ================ EDIT PERMISSIONS MODAL ================= */
/* ========================================================= */

const EditPermissionsModal = ({ role, onClose, onSave, saving }) => {
  const [permissions, setPermissions] = useState({ ...role.roles_permissions });

  const handleChange = (key, value) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Same grouping logic as first code
  const MENU_GROUPS = {
    Overview: ["Dashboard"],
    "User Management": ["Employee Management", "Roles", "Permission", "Department", "Team", "Teams"],
    Projects: ["Clients", "Projects", "Projects Assigned", "Project Management", "Activity Tags"],
    Masters: ["Project Sources", "Communication Types", "Accounts", "Notes Management"],
    Performance: ["Performance Sheets", "Performance Sheet", "Performance History","Offline-Hours"],
    Leaves: ["Manage Leaves", "Leaves", "Leave Management"],
    Reporting:["Team-Reporting","Leave-Reporting"]
  };

  const GROUP_LABELS = {
    Overview: "📊",
    "User Management": "👥",
    Projects: "📁",
    Masters: "⚙️",
    Performance: "📈",
    Leaves: "📅",
    Reporting: "📊"
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
    "projects": "Projects",
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
    "performance_sheet": "Performance",
    "performance_history": "Performance",
    "offline_hours": "Performance",

    // Leaves
    "leaves": "Leaves",
    "leave_management": "Leaves",

    // Reporting
    "team_reporting": "Reporting",
    "leave_reporting": "Reporting"
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
      <div className="w-full max-w-4xl rounded-3xl bg-white/70 backdrop-blur-xl border border-white/30 shadow-2xl p-6 md:p-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-2xl font-bold text-gray-900">
            Edit Permissions
            <span className="block text-sm font-normal text-gray-500">
              {role.name}
            </span>
          </h3>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 transition"
            disabled={saving}
          >
            ✕
          </button>
        </div>

        {/* Grouped Permission Grid - Same as first code */}
        <div className="grid grid-cols-1 gap-4 max-h-[60vh] overflow-y-auto pr-2">
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
                    className="rounded-2xl border border-gray-200 bg-white/60 backdrop-blur-md p-4 hover:shadow-lg transition-all"
                  >
                    <p className="mb-3 text-sm font-semibold text-gray-700 capitalize">
                     {DISPLAY_NAMES[key] || key.replace(/_/g, " ")}
                    </p>

                    <div className="flex gap-2">
                      {/* Hidden */}
                      <label className={`flex-1 cursor-pointer ${saving ? 'pointer-events-none opacity-50' : ''}`}>
                        <input
                          type="radio"
                          name={key}
                          value="0"
                          checked={permissions[key] === "0"}
                          onChange={() => handleChange(key, "0")}
                          className="hidden"
                          disabled={saving}
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
                      <label className={`flex-1 cursor-pointer ${saving ? 'pointer-events-none opacity-50' : ''}`}>
                        <input
                          type="radio"
                          name={key}
                          value="1"
                          checked={permissions[key] === "1"}
                          onChange={() => handleChange(key, "1")}
                          className="hidden"
                          disabled={saving}
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
                      <label className={`flex-1 cursor-pointer ${saving ? 'pointer-events-none opacity-50' : ''}`}>
                        <input
                          type="radio"
                          name={key}
                          value="2"
                          checked={permissions[key] === "2"}
                          onChange={() => handleChange(key, "2")}
                          className="hidden"
                          disabled={saving}
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
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              console.log("🔄 Modal sending permissions:", permissions);
              onSave(permissions);
            }}
            disabled={saving}
            className={`px-6 py-2.5 rounded-xl font-semibold shadow-lg transition-transform ${
              saving
                ? "bg-gray-400 cursor-not-allowed text-white opacity-70"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:scale-[1.02]"
            }`}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};














// import React, { useState, useMemo } from "react";
// import { useRole } from "../../../context/RoleContext";
// import { X, Pencil } from "lucide-react";
// import { SubmitButton } from "../../../AllButtons/AllButtons";
// import { usePermissions } from "../../../context/PermissionContext.jsx";
// import { useOutsideClick } from "../../../components/useOutsideClick";

// export const Role = () => {
//   const { addRole, roles, fetchRoles, isLoading, message, updateRole } = useRole(); // ✅ Changed to updateRole
//   const { permissions } = usePermissions();

//   const [roleName, setRoleName] = useState("");
//   const [error, setError] = useState("");
//   const [showMessage, setShowMessage] = useState(false);

//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

//   const [selectedRole, setSelectedRole] = useState("");
//   const [roleToEdit, setRoleToEdit] = useState(null);
//   const [showEditPermissions, setShowEditPermissions] = useState(false);
//   const [saving, setSaving] = useState(false);

//   const employeePermission = permissions?.permissions?.[0]?.roles;
//   const canAddEmployee = employeePermission === "2";

//   /* ---------- FILTER ROLES ---------- */
//   const filteredRoles = useMemo(() => {
//     return roles.filter((role) =>
//       role.name.toLowerCase().includes("")
//     );
//   }, [roles]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    

//     if (!roleName.trim()) {
//       setError("Role name is required");
//       return;
//     }

//     setError("");
//     const response = await addRole(roleName);

//     if (response?.errorMessage) {
//       setError(response.errorMessage);
//     } else {
//       setRoleName("");
//       setShowMessage(true);
//       setIsModalOpen(false);
//       setIsAssignModalOpen(false);
//       fetchRoles();
//     }
//   };

//   const openPermissionsEditor = () => {
//     const role = roles.find((r) => r.name === selectedRole);
//     if (!role) return;

//     setRoleToEdit(role);
//     setShowEditPermissions(true);
//   };

//   const handleSavePermissions = async (updatedPermissions) => {
//     if (!roleToEdit?.id) return;

//     setSaving(true);
//     try {

//       const payload = {
//         name: roleToEdit.name,
//         roles_permissions: updatedPermissions
//       };

//       console.log("🔄 Sending payload:", JSON.stringify(payload, null, 2));

//       const response = await updateRole(roleToEdit.id, payload);

//       if (response?.success || !response?.errorMessage) {
//         console.log(" Role permissions updated successfully");
//         fetchRoles();
//         onClose();
//         setIsAssignModalOpen(false)
//       } else {
//         console.error("Update failed:", response?.errorMessage);
//         alert("Failed to update permissions: " + (response?.errorMessage || "Unknown error"));
//       }
//     } catch (error) {
//       console.error("API Error:", error);
//       alert("Failed to update permissions. Please try again.");
//     } finally {
//       setSaving(false);
//     }
//   };

//  const onClose = () => {
//     setShowEditPermissions(false);
//     setRoleToEdit(null);
//   };


// const handleCloseAddModal = () => {
//     setIsModalOpen(false);
//     setRoleName("");
//     setError("");
//     setShowMessage(false);
//   };

//   const handleCloseAssignModal = () => {
//     setIsAssignModalOpen(false);
//     setSelectedRole("");
//     setError("");
//   };

//   // Refs for outside click
//   const addModalRef = useOutsideClick(isModalOpen, handleCloseAddModal);
//   const assignModalRef = useOutsideClick(isAssignModalOpen, handleCloseAssignModal);


  
//   return (
//     <div className="bg-white">
//       <div className="flex gap-2 flex-row">
//         {canAddEmployee && (
//           <button
//             onClick={() => {
//               setIsModalOpen(true);
//               setError("");
//               setShowMessage(false);
//             }}
//             className="add-items-btn"
//           >
//             Add Role
//           </button>
//         )}

//         <button
//           onClick={() => {
//             setIsAssignModalOpen(true);
//             setSelectedRole("");
//             setError("");
//           }}
//           className="add-items-btn"
//         >
//           Assign Permission
//         </button>
//       </div>

//       {/* ASSIGN PERMISSION MODAL */}
//       {isAssignModalOpen && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
//           <div ref={assignModalRef} className="bg-white rounded-lg shadow-lg p-6 w-96 relative">
//             <button
//               onClick={() => setIsAssignModalOpen(false)}
//               className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
//             >
//               <X className="w-5 h-5" />
//             </button>

//             <h2 className="text-xl font-semibold">Select Role</h2>

//             <div className="mt-4">
//               <label className="block text-sm font-medium text-gray-700">
//                 Role Name
//               </label>

//               <div className="flex gap-2 mt-1">
//                 <select
//                   className="flex-1 p-2 border rounded-md"
//                   value={selectedRole}
//                   onChange={(e) => setSelectedRole(e.target.value)}
//                 >
//                   <option value="">Select a role...</option>
//                   {filteredRoles.map((role) => (
//                     <option key={role.id || role.name} value={role.name}>
//                       {role.name}
//                     </option>
//                   ))}
//                 </select>

//                 {selectedRole && (
//                   <button
//                     type="button"
//                     onClick={openPermissionsEditor}
//                     className="p-2 border rounded-md hover:bg-gray-100"
//                   >
//                     <Pencil className="w-4 h-4 text-gray-600" />
//                   </button>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ADD ROLE MODAL */}
//       {isModalOpen && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
//           <div ref={addModalRef} className="bg-white rounded-lg shadow-lg p-6 w-96 relative">
//             <button
//               onClick={() => setIsModalOpen(false)}
//               className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
//             >
//               <X className="w-5 h-5" />
//             </button>

//             <h2 className="text-xl font-semibold">Enter Role Details</h2>

//             <form onSubmit={handleSubmit} className="mt-4 space-y-4">
//               <input
//                 placeholder="Role name"
//                 className="w-full p-2 border rounded-md"
//                 value={roleName}
//                 onChange={(e) => setRoleName(e.target.value)}
//               />

//               {error && (
//                 <p className="text-red-500 text-sm">{error}</p>
//               )}

//               <SubmitButton disabled={isLoading} />
//             </form>
//           </div>
//         </div>
//       )}

//       {/* EDIT PERMISSIONS MODAL */}
//       {showEditPermissions && roleToEdit && (
//         <EditPermissionsModal
//           role={roleToEdit}
//           onClose={onClose}
//           onSave={handleSavePermissions}
//           saving={saving}
//         />
//       )}
//     </div>
//   );
// };

// /* ========================================================= */
// /* ================ EDIT PERMISSIONS MODAL ================= */
// /* ========================================================= */

// const EditPermissionsModal = ({ role, onClose, onSave, saving }) => {
//   const [permissions, setPermissions] = useState({ ...role.roles_permissions });

//   const handleChange = (key, value) => {
//     setPermissions((prev) => ({
//       ...prev,
//       [key]: value,
//     }));
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">
//       <div className="w-full max-w-4xl rounded-3xl bg-white/70 backdrop-blur-xl border border-white/30 shadow-2xl p-6 md:p-8">
//         {/* Header */}
//         <div className="mb-6 flex items-center justify-between">
//           <h3 className="text-2xl font-bold text-gray-900">
//             Edit Permissions
//             <span className="block text-sm font-normal text-gray-500">
//               {role.name}
//             </span>
//           </h3>

//           <button
//             onClick={onClose}
//             className="text-gray-500 hover:text-gray-800 transition"
//             disabled={saving}
//           >
//             ✕
//           </button>
//         </div>

//         {/* Permission Grid */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-2">
//           {Object.keys(permissions).map((key) => (
//             <div
//               key={key}
//               className="rounded-2xl border border-gray-200 bg-white/60 backdrop-blur-md p-4 hover:shadow-lg transition-all"
//             >
//               <p className="mb-3 text-sm font-semibold text-gray-700 capitalize">
//                 {key.replace(/_/g, " ")}
//               </p>

//               <div className="flex gap-2">
//                 {/* Hidden */}
//                 <label className={`flex-1 cursor-pointer ${saving ? 'pointer-events-none opacity-50' : ''}`}>
//                   <input
//                     type="radio"
//                     name={key}
//                     value="0"
//                     checked={permissions[key] === "0"}
//                     onChange={() => handleChange(key, "0")}
//                     className="hidden"
//                     disabled={saving}
//                   />
//                   <div
//                     className={`text-center px-3 py-2 rounded-xl text-xs font-semibold transition-all
//                       ${
//                         permissions[key] === "0"
//                           ? "bg-gray-500 text-white shadow"
//                           : "bg-gray-100 text-gray-500 hover:bg-gray-200"
//                       }`}
//                   >
//                     Hidden
//                   </div>
//                 </label>

//                 {/* View */}
//                 <label className={`flex-1 cursor-pointer ${saving ? 'pointer-events-none opacity-50' : ''}`}>
//                   <input
//                     type="radio"
//                     name={key}
//                     value="1"
//                     checked={permissions[key] === "1"}
//                     onChange={() => handleChange(key, "1")}
//                     className="hidden"
//                     disabled={saving}
//                   />
//                   <div
//                     className={`text-center px-3 py-2 rounded-xl text-xs font-semibold transition-all
//                       ${
//                         permissions[key] === "1"
//                           ? "bg-blue-500 text-white shadow"
//                           : "bg-blue-50 text-blue-600 hover:bg-blue-100"
//                       }`}
//                   >
//                     View
//                   </div>
//                 </label>

//                 {/* Edit */}
//                 <label className={`flex-1 cursor-pointer ${saving ? 'pointer-events-none opacity-50' : ''}`}>
//                   <input
//                     type="radio"
//                     name={key}
//                     value="2"
//                     checked={permissions[key] === "2"}
//                     onChange={() => handleChange(key, "2")}
//                     className="hidden"
//                     disabled={saving}
//                   />
//                   <div
//                     className={`text-center px-3 py-2 rounded-xl text-xs font-semibold transition-all
//                       ${
//                         permissions[key] === "2"
//                           ? "bg-indigo-600 text-white shadow"
//                           : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
//                       }`}
//                   >
//                     Edit
//                   </div>
//                 </label>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Footer */}
//         <div className="mt-8 flex justify-end gap-3">
//           <button
//             onClick={onClose}
//             className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition"
//             disabled={saving}
//           >
//             Cancel
//           </button>
//           <button
//             onClick={() => {
//               console.log("🔄 Modal sending permissions:", permissions);
//               onSave(permissions);
//             }}
//             disabled={saving}
//             className={`px-6 py-2.5 rounded-xl font-semibold shadow-lg transition-transform ${
//               saving
//                 ? "bg-gray-400 cursor-not-allowed text-white opacity-70"
//                 : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:scale-[1.02]"
//             }`}
//           >
//             {saving ? "Saving..." : "Save Changes"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };
