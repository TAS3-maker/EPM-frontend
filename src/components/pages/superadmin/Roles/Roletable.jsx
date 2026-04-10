import React, { useContext, useEffect, useMemo, useState } from "react";
import { useRole } from "../../../context/RoleContext";
import { Loader2, BarChart, Search } from "lucide-react";
import { Role } from './Role';
import { SectionHeader } from '../../../components/SectionHeader';
import {
  CancelButton,
  YesButton,
  IconSaveButton,
  IconDeleteButton,
  IconEditButton,
  IconCancelTaskButton,
  ExportButton,
  ImportButton,
  ClearButton,
} from "../../../AllButtons/AllButtons";
import Pagination from "../../../components/Pagination";
import { exportToExcel } from "../../../components/excelUtils";
import { usePermissions } from "../../../context/PermissionContext.jsx";
import GlobalTable from '../../../components/GlobalTable';

export const Roletable = () => {
  const {permissions}=usePermissions()
  const { roles, fetchRoles, deleteRole, updateRole, isLoading } = useRole();
  const [editRoleId, setEditRoleId] = useState(null);
  const [editRoleName, setEditRoleName] = useState("");
  const [editRouteName, setEditRouteName] = useState("");
  const [editError, setEditError] = useState("");
  const [deleteclient, setDeleteclient] = useState(null);
  const [editid, setEditid] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [showImportOptions, setShowImportOptions] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleClearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
  };

  const filteredRoles = useMemo(() => {
    return roles.filter((role) =>
      role.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [roles, searchQuery]);
  
  const employeePermission=permissions?.permissions?.[0].roles;
  const canAddEmployee=employeePermission==="2"

  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);
  const pageroles = filteredRoles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleEditClick = (role) => {
    setEditRoleId(role.id);
    setEditRoleName(role.name);
    setEditRouteName(role.role_label || "");
    setEditError("");
  };
  const handleSaveClick = async () => {
    if (!editRoleName.trim()) {
      setEditError("Role name cannot be empty.");
      return;
    }

    if (!editRouteName.trim()) {
      setEditError("Route name cannot be empty.");
      return;
    }

    setIsUpdating(true);
    setEditError("");
    
    try {
      const payload = { name: editRoleName.trim(), role_label: editRouteName.trim() };
      console.log("🔄 Sending payload:", JSON.stringify(payload, null, 2));
      
      const result = await updateRole(editRoleId, payload);
      console.log("✅ Update result:", result);
      
      if (result?.success || !result?.errorMessage) {
        setEditError("");
        setEditRoleId(null);
        setEditRoleName("");
        setEditRouteName("");
        fetchRoles(); 
      } else {
        setEditError(result?.errorMessage || "Update failed");
      }
    } catch (error) {
      console.error("❌ Update error:", error);
      setEditError("Failed to update role. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditRoleId(null);
    setEditRoleName("");
    setEditRouteName("");
    setEditError("");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };



const columns = [
    {
      key: 'created_at',
      label: 'Created Date',
      render: (role) => (
        <span className="flex items-center justify-center">
          {formatDate(role.created_at)}
        </span>
      )
    },
    {
      key: 'updated_at',
      label: 'Updated Date',
      render: (role) => formatDate(role.updated_at)
    },
    {
      key: 'name',
      label: 'Role Name',
      render: (role) => renderRouteName(role)
    },
    {
      key: 'route',
      label: 'Route Name',
     render: (role) => renderRoleName(role)
    }
  ];

  const renderRoleName = (role) => {
    if (editRoleId === role.id) {
      return (
        <div>
          <input
            type="text"
            value={editRoleName}
            onChange={(e) => {
              setEditRoleName(e.target.value);
              setEditError("");
            }}
            className={`border rounded-md px-3 py-2 w-full max-w-xs focus:outline-none focus:ring-2 text-center ${
              editError ? "border-red-500 ring-red-500" : "border-gray-300 focus:ring-blue-500"
            }`}
            placeholder="Enter role name"
            autoFocus
            disabled={isUpdating}
          />
          {editError && <p className="text-red-500 text-sm mt-1 text-center">{editError}</p>}
        </div>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-800">
        {role.name}
      </span>
    );
  };

  const renderRouteName = (role) => {
    if (editRoleId === role.id) {
      return (
        <input
          type="text"
          value={editRouteName}
          onChange={(e) => {
            setEditRouteName(e.target.value);
            setEditError("");
          }}
          className={`border rounded-md px-3 py-2 w-full max-w-xs focus:outline-none focus:ring-2 text-center ${
            editError ? "border-red-500 ring-red-500" : "border-gray-300 focus:ring-blue-500"
          }`}
          placeholder="Enter route name"
          disabled={isUpdating}
        />
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-800">
        {role.role_label || ""}
      </span>
    );
  };

  const renderActions = (role) => {
    if (!canAddEmployee) return null;

    if (editRoleId === role.id) {
      return (
        <div className="flex items-center justify-center space-x-2">
          <div className="relative group">
            <IconSaveButton onClick={handleSaveClick} disabled={isUpdating} />
            <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white text-black text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none shadow">
              Save
            </span>
          </div>
          <div className="relative group">
            <IconCancelTaskButton onClick={handleCancelEdit} disabled={isUpdating} />
            <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white text-black text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none shadow">
              Cancel
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center space-x-2">
        <div className="relative group">
          <IconEditButton onClick={() => handleEditClick(role)} />
          <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white text-black text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none shadow">
            Edit
          </span>
        </div>
        <div className="relative group">
          <IconDeleteButton 
            onClick={() => {
              setEditid(role.id);
              setDeleteclient(true);
            }}
          />
          <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white text-black text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none shadow">
            Delete
          </span>
        </div>
      </div>
    );
  };

  const handleDeleteConfirm = () => {
    if (editid) {
      deleteRole(editid);
    }
    setDeleteclient(false);
    setEditid(null);
  };




  

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-lg h-[calc(100vh-20px)] flex flex-col overflow-y-auto">
      <SectionHeader icon={BarChart} title="Role Management" subtitle="View, Edit and manage user roles" />

      <div className="flex flex-wrap items-center justify-between gap-4 p-2 sm:sticky top-0 bg-white z-10 shadow-md">
        <Role />
        <div className="flex flex-wrap md:flex-nowrap items-center gap-3 border p-2 rounded-lg shadow-md bg-white">
          <div className="flex items-center w-full border border-gray-300 px-1.5 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
            <Search className="h-5 w-5 text-gray-400 mr-[5px]" />
            <input
              type="text"
              className="w-full rounded-lg focus:outline-none py-1.5 text-sm"
              placeholder={`Search by Role name`}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <ClearButton onClick={handleClearSearch} />
          <ExportButton onClick={() => { exportToExcel(filteredRoles, "roles.xlsx"); }} />
        </div>
      </div>

       {/* Pure Global Table */}
      <GlobalTable
        data={roles}
        columns={columns}
        isLoading={isLoading}
        paginatedData={pageroles}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        actionsComponent={{ right: renderActions }}
        emptyStateTitle="No roles found"
        emptyStateMessage="No roles have been created yet."
      />

      {deleteclient && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full m-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Are you sure you want to delete this role?</h2>
            </div>
            <div className="text-sm text-gray-600 mb-4">
              This action cannot be undone. Please confirm if you'd like to proceed.
            </div>
            <div className="flex justify-end gap-2 my-2">
              <CancelButton onClick={() => setDeleteclient(false)} />
              <YesButton onClick={() => {
                deleteRole(editid);
                setDeleteclient(false);
              }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



















// import React, { useContext, useEffect, useMemo, useState } from "react";
// import { useRole } from "../../../context/RoleContext";
// import { Loader2, BarChart, Search } from "lucide-react";
// import { Role } from './Role';
// import { SectionHeader } from '../../../components/SectionHeader';
// import {
//   CancelButton,
//   YesButton,
//   IconSaveButton,
//   IconDeleteButton,
//   IconEditButton,
//   IconCancelTaskButton,
//   ExportButton,
//   ImportButton,
//   ClearButton,
// } from "../../../AllButtons/AllButtons";
// import Pagination from "../../../components/Pagination";
// import { exportToExcel } from "../../../components/excelUtils";
// import { usePermissions } from "../../../context/PermissionContext.jsx";

// export const Roletable = () => {
//   const {permissions}=usePermissions()
//   const { roles, fetchRoles, deleteRole, updateRole, isLoading } = useRole();
//   const [editRoleId, setEditRoleId] = useState(null);
//   const [editRoleName, setEditRoleName] = useState("");
//   const [editError, setEditError] = useState("");
//   const [deleteclient, setDeleteclient] = useState(null);
//   const [editid, setEditid] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [showImportOptions, setShowImportOptions] = useState(false);
//   const [isUpdating, setIsUpdating] = useState(false);
//   const itemsPerPage = 10;

//   useEffect(() => {
//     fetchRoles();
//   }, []);

//   const handleClearSearch = () => {
//     setSearchQuery("");
//     setCurrentPage(1);
//   };

//   const filteredRoles = useMemo(() => {
//     return roles.filter((role) =>
//       role.name.toLowerCase().includes(searchQuery.toLowerCase())
//     );
//   }, [roles, searchQuery]);
  
//   const employeePermission=permissions?.permissions?.[0].roles;
//   const canAddEmployee=employeePermission==="2"

//   const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);
//   const pageroles = filteredRoles.slice(
//     (currentPage - 1) * itemsPerPage,
//     currentPage * itemsPerPage
//   );

//   const handleEditClick = (role) => {
//     setEditRoleId(role.id);
//     setEditRoleName(role.name);
//     setEditError("");
//   };

//   // ✅ FIXED: Send CORRECT payload structure { name: "RoleName" }
//   const handleSaveClick = async () => {
//     if (!editRoleName.trim()) {
//       setEditError("Role name cannot be empty.");
//       return;
//     }

//     setIsUpdating(true);
//     setEditError("");
    
//     try {
//       // ✅ CORRECT PAYLOAD: { name: "RoleName" }
//       const payload = { name: editRoleName.trim() };
//       console.log("🔄 Sending payload:", JSON.stringify(payload, null, 2));
      
//       const result = await updateRole(editRoleId, payload);
//       console.log("✅ Update result:", result);
      
//       if (result?.success || !result?.errorMessage) {
//         setEditError("");
//         setEditRoleId(null);
//         setEditRoleName("");
//         fetchRoles(); // Refresh list
//       } else {
//         setEditError(result?.errorMessage || "Update failed");
//       }
//     } catch (error) {
//       console.error("❌ Update error:", error);
//       setEditError("Failed to update role. Please try again.");
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   const handleCancelEdit = () => {
//     setEditRoleId(null);
//     setEditRoleName("");
//     setEditError("");
//   };

//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     });
//   };

//   return (
//     <div className="rounded-2xl border border-gray-200 bg-white shadow-lg max-h-screen overflow-y-auto ">
//       <SectionHeader icon={BarChart} title="Role Management" subtitle="View, Edit and manage user roles" />

//       <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:sticky top-0 bg-white z-10 shadow-md">
//         <Role />
//         <div className="flex flex-wrap md:flex-nowrap items-center gap-3 border p-2 rounded-lg shadow-md bg-white">
//           <div className="flex items-center w-full border border-gray-300 px-2 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
//             <Search className="h-5 w-5 text-gray-400 mr-[5px]" />
//             <input
//               type="text"
//               className="w-full rounded-lg focus:outline-none py-2"
//               placeholder={`Search by Role name`}
//               value={searchQuery}
//               onChange={(e) => {
//                 setSearchQuery(e.target.value);
//                 setCurrentPage(1);
//               }}
//             />
//           </div>
//           <ClearButton onClick={handleClearSearch} />
//           <ExportButton onClick={() => { exportToExcel(filteredRoles, "roles.xlsx"); }} />
//         </div>
//       </div>

//       <div className="max-w-full overflow-x-auto">
//         <div className="">
//           <table className="w-full">
//             <thead>
//               <tr className="table-bg-heading table-th-tr-row whitespace-nowrap sm:whitespace-normal">
//                 <th className="px-4 py-2 font-medium text-center text-sm">Created Date</th>
//                 <th className="px-4 py-2 font-medium text-center text-sm">Updated Date</th>
//                 <th className="px-4 py-2 font-medium text-center text-sm">Role Name</th>
//                 <th className="px-4 py-2 font-medium text-center text-sm">Actions</th>
//               </tr>
//             </thead>

//             <tbody className="divide-y divide-gray-100">
//               {isLoading ? (
//                 <tr>
//                   <td colSpan="4" className="px-6 py-8 text-center">
//                     <div className="flex items-center justify-center">
//                       <Loader2 className="h-6 w-6 animate-spin text-blue-500 mr-2" />
//                       <span className="text-gray-500">Loading roles...</span>
//                     </div>
//                   </td>
//                 </tr>
//               ) : pageroles.length > 0 ? (
//                 pageroles.map((role) => (
//                   <tr key={role.id} className="hover:bg-gray-50 transition-colors duration-150">
//                     <td className="px-6 py-4 text-center text-gray-600 text-xs">
//                       <span className="flex items-center justify-center">
//                         {formatDate(role.created_at)}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 text-center text-gray-600 text-xs">
//                       {formatDate(role.updated_at)}
//                     </td>
//                     <td className="px-6 py-4 text-center text-gray-800 font-medium text-xs">
//                       {editRoleId === role.id ? (
//                         <div>
//                           <input
//                             type="text"
//                             value={editRoleName}
//                             onChange={(e) => {
//                               setEditRoleName(e.target.value);
//                               setEditError("");
//                             }}
//                             className={`border rounded-md px-3 py-2 w-full max-w-xs focus:outline-none focus:ring-2 ${
//                               editError ? "border-red-500 ring-red-500" : "border-gray-300 focus:ring-blue-500"
//                             }`}
//                             placeholder="Enter role name"
//                             autoFocus
//                             disabled={isUpdating}
//                           />
//                           {editError && (
//                             <p className="text-red-500 text-sm mt-1">{editError}</p>
//                           )}
//                         </div>
//                       ) : (
//                         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-800">
//                           {role.name}
//                         </span>
//                       )}
//                     </td>
//                     <td className="px-6 py-4">
//                       {canAddEmployee && (
//                         <div className="flex items-center justify-center space-x-2">
//                           {editRoleId === role.id ? (
//                             <>
//                               <div className="relative group">
//                                 <IconSaveButton 
//                                   onClick={handleSaveClick} 
//                                   disabled={isUpdating} 
//                                 />
//                                 <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 
//                                   whitespace-nowrap bg-white text-black text-sm px-2 py-1 rounded 
//                                   opacity-0 group-hover:opacity-100 transition pointer-events-none shadow">
//                                   Save
//                                 </span>
//                               </div>
//                               <div className="relative group">
//                                 <IconCancelTaskButton 
//                                   onClick={handleCancelEdit}
//                                   disabled={isUpdating}
//                                 />
//                                 <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 
//                                   whitespace-nowrap bg-white text-black text-sm px-2 py-1 rounded 
//                                   opacity-0 group-hover:opacity-100 transition pointer-events-none shadow">
//                                   Cancel
//                                 </span>
//                               </div>
//                             </>
//                           ) : (
//                             <>
//                               <div className="relative group">
//                                 <IconEditButton onClick={() => handleEditClick(role)} />
//                                 <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 
//                                   whitespace-nowrap bg-white text-black text-sm px-2 py-1 rounded 
//                                   opacity-0 group-hover:opacity-100 transition pointer-events-none shadow">
//                                   Edit
//                                 </span>
//                               </div>
//                               <div className="relative group">
//                                 <IconDeleteButton 
//                                   onClick={() => {
//                                     setEditid(role.id);
//                                     setDeleteclient(true);
//                                   }}
//                                 />
//                                 <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 
//                                   whitespace-nowrap bg-white text-black text-sm px-2 py-1 rounded 
//                                   opacity-0 group-hover:opacity-100 transition pointer-events-none shadow">
//                                   Delete
//                                 </span>
//                               </div>
//                             </>
//                           )}
//                         </div>
//                       )}
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="4" className="px-6 py-8 text-center">
//                     <div className="flex flex-col items-center justify-center">
//                       <div className="rounded-full bg-gray-100 p-3">
//                         <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                         </svg>
//                       </div>
//                       <h3 className="mt-2 text-sm font-medium text-gray-900">No roles found</h3>
//                       <p className="mt-1 text-sm text-gray-500">No roles have been created yet.</p>
//                     </div>
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//           <div className="p-4">
//             <Pagination
//               currentPage={currentPage}
//               totalPages={totalPages}
//               onPageChange={setCurrentPage}
//             />
//           </div>
//         </div>
//       </div>

//       {deleteclient && (
//         <div className="fixed inset-0 bg-gray-800 bg-opacity-70 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full m-2">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-lg font-semibold">Are you sure you want to delete this role?</h2>
//             </div>
//             <div className="text-sm text-gray-600 mb-4">
//               This action cannot be undone. Please confirm if you'd like to proceed.
//             </div>
//             <div className="flex justify-end gap-2 my-2">
//               <CancelButton onClick={() => setDeleteclient(false)} />
//               <YesButton onClick={() => {
//                 deleteRole(editid);
//                 setDeleteclient(false);
//               }} />
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };
