import PropTypes from "prop-types";
import { NavLink, useNavigate } from "react-router-dom";
import React, { useState, useEffect, useCallback } from "react";
import { XMarkIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";
import { usePermissions } from "../context/PermissionContext";
import { Roles } from "../utils/roles";
import defaultpic from "../aasests/default.png";
import {
  House, Users, User, UserCog, Handshake, FolderOpenDot, LogOut,
  CalendarHeart, CalendarCheck, FileSpreadsheet, FileChartLine,
  CalendarCog, FileClock, FolderGit2, FileClock as FileClockAlt, Lock
} from "lucide-react";
import { API_URL } from "../utils/ApiConfig";

export function Sidebar({ isSidebarOpen, setIsSidebarOpen }) {
  const [openMenus, setOpenMenus] = useState({});
  const [rolePrefix, setRolePrefix] = useState("admin");
  const { logout } = useAuth();
  const { permissions: fullApiResponse, fetchPermissions } = usePermissions();
  const navigate = useNavigate();

  const [userimage, setUserimage] = useState(defaultpic);
  const username = localStorage.getItem("name") || "User";

  const getRolePrefix = useCallback(() => {
    const userNameRole = localStorage.getItem("user_name")?.toLowerCase();

    const roleMap = {
      [Roles.ADMIN]: Roles.ADMIN,
      [Roles.SUPER_ADMIN]: Roles.SUPER_ADMIN,
      [Roles.HR]: Roles.HR,
      [Roles.TEAM]: Roles.TEAM,
      [Roles.BD]: Roles.BD,
      [Roles.PM]: Roles.PM,
      [Roles.TL]: Roles.TL
    };

    for (const [roleKey, roleValue] of Object.entries(roleMap)) {
      if (userNameRole === roleKey || userNameRole === roleValue) {
        return roleValue;
      }
    }

    return Roles.ADMIN;
  }, []);

  useEffect(() => {
    const prefix = getRolePrefix();
    setRolePrefix(prefix);
  }, [getRolePrefix]);

  // Profile image from userData.profile_pic
  useEffect(() => {
    const loadImage = () => {
      const userData = JSON.parse(localStorage.getItem("userData"));

      if (userData?.profile_pic?.startsWith("data:image")) {
        setUserimage(userData.profile_pic);
        return;
      }

      if (userData?.profile_pic) {
        setUserimage(`${API_URL}/storage/profile_pics/${userData.profile_pic}`);
        return;
      }

      setUserimage(defaultpic);
    };

    loadImage();
    window.addEventListener("profile-updated", loadImage);
    window.addEventListener("storage", loadImage);
    return () => window.removeEventListener("storage", loadImage);
  }, []);

  useEffect(() => {
    const myUserId = parseInt(localStorage.getItem("user_id") || "0");
    console.log("🎯 Sidebar MOUNTED for user:", myUserId);
    
    const handlePermissionsUpdate = (event) => {
      const targetUserId = event.detail?.userId;
      console.log(`🎯 Sidebar EVENT: target=${targetUserId}, myID=${myUserId}`);
      
      if (!targetUserId || targetUserId === myUserId) {
        console.log(`🎯 Sidebar REFRESHING user ${myUserId}`);
        fetchPermissions();
      }
    };

    window.addEventListener("permissions-updated", handlePermissionsUpdate);
    return () => {
      console.log("🧹 Sidebar UNMOUNTED");
      window.removeEventListener("permissions-updated", handlePermissionsUpdate);
    };
  }, [fetchPermissions]);

  const menuItems = React.useMemo(() => {
    const perms = fullApiResponse?.permissions?.[0];
    if (!perms) return [];

    const items = [
      { name: "Dashboard", path: `/${rolePrefix}/dashboard`, icon: <House />, priority: 1 }
    ];

    if (parseInt(perms.employee_management || "0") >= 1)
      items.push({ name: "Employee Management", path: `/${rolePrefix}/users`, icon: <User />, priority: 2 });
    if (parseInt(perms.roles || "0") >= 1)
      items.push({ name: "Roles", path: `/${rolePrefix}/roles`, icon: <UserCog />, priority: 3 });
    if (parseInt(perms.permission || "0") >= 1)
      items.push({ name: "Permission", path: `/${rolePrefix}/permission`, icon: <UserCog />, priority: 3 });
    if (parseInt(perms.department || "0") >= 1)
      items.push({ name: "Department", path: `/${rolePrefix}/department`, icon: <UserCog />, priority: 4 });
    if (parseInt(perms.team || "0") >= 1)
      items.push({ name: "Team", path: `/${rolePrefix}/team`, icon: <UserCog />, priority: 5 });
    if (parseInt(perms.teams || "0") >= 1)
      items.push({ name: "Teams", path: `/${rolePrefix}/teams`, icon: <Users />, priority: 6 });
    if (parseInt(perms.clients || "0") >= 1)
      items.push({ name: "Clients", path: `/${rolePrefix}/clients`, icon: <Handshake />, priority: 7 });
    if (parseInt(perms.projects || "0") >= 1)
      items.push({ name: "Projects", path: `/${rolePrefix}/projects`, icon: <FolderOpenDot />, priority: 8 });
    if (parseInt(perms.manage_leaves || "0") >= 1)
      items.push({ name: "Manage Leaves", path: `/${rolePrefix}/manage-leaves`, icon: <CalendarCog />, priority: 9 });
    if (parseInt(perms.leaves || "0") >= 1)
      items.push({ name: "Leaves", path: `/${rolePrefix}/leave`, icon: <CalendarHeart />, priority: 10 });
    if (parseInt(perms.leave_management || "0") >= 1)
      items.push({ name: "Leave Management", path: `/${rolePrefix}/leaves`, icon: <CalendarCheck />, priority: 11 });
    if (parseInt(perms.activity_tags || "0") >= 1)
      items.push({ name: "Activity Tags", path: `/${rolePrefix}/activity-tags`, icon: <FileChartLine />, priority: 12 });
    if (parseInt(perms.projects_assigned || "0") >= 1)
      items.push({ name: "Projects Assigned", path: `/${rolePrefix}/projects-assigned`, icon: <FileChartLine />, priority: 13 });
    if (parseInt(perms.performance_sheet || "0") >= 1)
      items.push({ name: "Performance Sheet", path: `/${rolePrefix}/performance-sheet`, icon: <FileChartLine />, priority: 14 });
    if (parseInt(perms.performance_history || "0") >= 1)
      items.push({ name: "Performance History", path: `/${rolePrefix}/performance-sheet-History`, icon: <FileClockAlt />, priority: 15 });

    // Projects Assigned nested
    if (parseInt(perms.projects_assigned || "0") >= 1) {
      const children = [];
      if (parseInt(perms.assigned_projects_inside_projects_assigned || "0") >= 1)
        children.push({ name: "Assigned Projects", path: `/${rolePrefix}/assigned-projects` });
      if (parseInt(perms.unassigned_projects_inside_projects_assigned || "0") >= 1)
        children.push({ name: "Unassigned Projects", path: `/${rolePrefix}/not-assigned-projects` });

      if (children.length > 0) {
        items.push({
          name: "Projects Assigned",
          path: `/${rolePrefix}/assigned-projects`,
          icon: <FileSpreadsheet />,
          children,
          priority: 16
        });
      }
    }

    // Performance Sheets nested
    if (parseInt(perms.performance_sheets || "0") >= 1) {
      const children = [];
      if (parseInt(perms.pending_sheets_inside_performance_sheets || "0") >= 1)
        children.push({ name: "Pending Sheets", path: `/${rolePrefix}/Pending-sheets` });
      if (parseInt(perms.manage_sheets_inside_performance_sheets || "0") >= 1)
        children.push({ name: "Manage Sheets", path: `/${rolePrefix}/Manage-sheets` });
      if (parseInt(perms.unfilled_sheets_inside_performance_sheets || "0") >= 1)
        children.push({ name: "Unfilled Sheets", path: `/${rolePrefix}/Manage-sheets-history` });

      if (children.length > 0) {
        items.push({
          name: "Performance Sheets",
          path: `/${rolePrefix}/Manage-sheets`,
          icon: <FileChartLine />,
          children,
          priority: 17
        });
      }
    }

    // Project Management nested
    if (parseInt(perms.project_management || "0") >= 1) {
      const children = [];
      if (parseInt(perms.assigned_projects_inside_project_management || "0") >= 1)
        children.push({ name: "Assigned Projects", path: `/${rolePrefix}/assign` });
      if (parseInt(perms.unassigned_projects_inside_project_management || "0") >= 1)
        children.push({ name: "Unassigned Projects", path: `/${rolePrefix}/unassigned` });

      if (children.length > 0) {
        items.push({
          name: "Project Management",
          path: `/${rolePrefix}`,
          icon: <FolderGit2 />,
          children,
          priority: 18
        });
      }
    }

    return items.sort((a, b) => (a.priority || 999) - (b.priority || 999));
  }, [rolePrefix, fullApiResponse]);

  const toggleMenu = useCallback((path) => {
    setOpenMenus(prev => ({ 
      ...prev, 
      [path]: !prev[path] 
    }));
  }, []);

  const safeNavigate = useCallback((path) => {
    navigate(path, { replace: true });
  }, [navigate]);



  return (
    <aside className={`bg-gradient-to-b from-white via-blue-50/30 to-indigo-50/20 shadow-2xl fixed left-0 top-0 h-[calc(100vh-1rem)] no-scrollbar z-[100] border-r border-white/30 backdrop-blur-sm flex flex-col my-2 mx-1.5 rounded-xl ring-1 ring-blue-100/40 transition-all duration-700 hover:shadow-blue-500/10 overflow-auto ${
      isSidebarOpen 
        ? "w-72 md:translate-x-0 translate-x-0" 
        : "hidden md:!block md:w-20 md:translate-x-0 -translate-x-full w-20"
    }`}>
      
      {/* Header / Profile */}
      <div className={`relative border-b border-white/30 backdrop-blur-sm sticky top-0 z-10 shrink-0 p-6 ${!isSidebarOpen && 'pt-8 pb-4 px-3'}`}>
        <button
          onClick={() => safeNavigate(`/${rolePrefix}/profile`)}
          className="group flex items-center justify-center md:justify-start gap-4 w-full p-3 rounded-2xl hover:bg-white/50 hover:backdrop-blur-sm transition-all duration-300"
        >
          <div className="relative flex-none flex items-center justify-center">
            <img
              className={`rounded-3xl shadow-xl ring-2 ring-white/50 group-hover:ring-blue-200/70 transition-all duration-300 object-cover object-center flex-shrink-0 ${
                isSidebarOpen ? "w-14 h-14" : "w-12 h-12"
              }`}
              src={userimage}
              alt="Profile"
              onError={e => {
                e.target.src = defaultpic;
              }}
            />
            <div className={`absolute ${isSidebarOpen ? "-bottom-1 -right-1" : "-bottom-1 -right-1"} w-4 h-4 bg-green-400 border-2 border-white rounded-full shadow-lg animate-pulse`} />
          </div>
          {isSidebarOpen && (
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-black text-gray-900 capitalize truncate group-hover:text-blue-700 transition-colors">
                Welcome, {username}
              </h2>
              <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider">
                {rolePrefix}
              </p>
            </div>
          )}
        </button>
        {/* <button
          onClick={() => setIsSidebarOpen(false)}
          className="absolute -right-2 -top-2 p-2 rounded-xl bg-white/80 hover:bg-blue-100 hover:scale-105 shadow-lg transition-all duration-200 xl:hidden"
        >
          <XMarkIcon className="h-5 w-5 text-gray-700" />
        </button> */}
      </div>

      {/* Menu - ✅ SCROLLABLE WHEN CLOSED + NESTED WORKS */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto px-2 py-4 space-y-2 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-transparent scrollbar-thumb-rounded scrollbar-track-rounded">
          <ul className="flex flex-col gap-1 min-h-full">
            {!fullApiResponse?.permissions ? (
              Array(8)
                .fill(0)
                .map((_, i) => (
                  <li key={`skeleton-${i}`}>
                    <div className="h-12 bg-gradient-to-r from-gray-200/50 to-gray-300/50 rounded-xl animate-pulse shadow-sm" />
                  </li>
                ))
            ) : menuItems.length > 0 ? (
              menuItems.map(({ name, path, icon, children }) => (
                <li key={path} className="w-full">
                  {children && children.length > 0 ? (
                    <>
                      {/* Parent button - clickable even when closed */}
                      <button
                        onClick={() => toggleMenu(path)}
                        className={`flex items-center w-full rounded-xl transition-all duration-300 font-medium text-gray-700 hover:bg-gray-100 hover:shadow-md hover:scale-[1.02] group p-3 ${
                          openMenus[path] ? "bg-blue-100 border border-blue-200 shadow-inner" : ""
                        }`}
                        title={name}
                      >
                        <div className="flex items-center justify-center gap-3 flex-1 min-w-0">
                          <div className="p-2 rounded-xl bg-blue-100/50 hover:bg-blue-200/50 transition-all flex-shrink-0">
                            {React.cloneElement(icon, { size: 20, className: "text-blue-600" })}
                          </div>
                          {isSidebarOpen && (
                            <span className="text-sm font-semibold truncate">{name}</span>
                          )}
                        </div>
                        {isSidebarOpen && (
                          <ChevronDownIcon
                            className={`h-4 w-4 text-gray-500 transition-transform duration-300 flex-shrink-0 ${
                              openMenus[path] ? "rotate-180" : ""
                            }`}
                          />
                        )}
                      </button>

                      {/* Nested children - show tooltip style when closed */}
                      {openMenus[path] && (
                        <div className={`transition-all duration-300 overflow-hidden ${
                          isSidebarOpen 
                            ? "ml-6 mt-2 px-3 py-2 bg-gradient-to-b from-blue-50/80 to-indigo-50/50 backdrop-blur-sm rounded-xl border border-blue-200/30 shadow-sm max-h-48 overflow-y-auto"
                            : "mt-1 px-2 py-1 bg-blue-50/90 backdrop-blur-sm rounded-lg border border-blue-200/50 shadow-sm max-h-32 overflow-y-auto"
                        }`}>
                          {children.map(({ name: childName, path: childPath }) => (
                            <NavLink
                              key={childPath}
                              to={childPath}
                              onClick={() => safeNavigate(childPath)}
                              className={({ isActive }) =>
                                `block w-full px-3 py-2 text-xs font-medium rounded-lg transition-all duration-300 capitalize text-left truncate ${
                                  isActive
                                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                                    : "text-gray-700 hover:bg-white/70 hover:shadow-md hover:text-blue-700"
                                }`
                              }
                              title={childName}
                            >
                              {childName}
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <NavLink
                      to={path}
                      onClick={() => safeNavigate(path)}
                      className={({ isActive }) =>
                        `flex items-center justify-center ${
                          isSidebarOpen ? "px-4 py-3 gap-3" : "p-3"
                        } rounded-xl transition-all duration-400 font-semibold text-sm tracking-wide text-gray-700 ${
                          isActive
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl scale-105 shadow-blue-500/25"
                            : "hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-lg hover:scale-[1.02] hover:text-blue-700"
                        }`
                      }
                      title={!isSidebarOpen ? name : ""}
                    >
                      <div
                        className={`p-2 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md flex-shrink-0 ${
                          path === `/${rolePrefix}/dashboard`
                            ? "bg-blue-100/50"
                            : "bg-gray-100/50 hover:bg-blue-100/50"
                        }`}
                      >
                        {React.cloneElement(icon, { size: 20, className: "transition-all group-hover:scale-110" })}
                      </div>
                      {isSidebarOpen && <span className="flex-1 min-w-0 truncate">{name}</span>}
                    </NavLink>
                  )}
                </li>
              ))
            ) : (
              <li className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
                <Lock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm font-medium">No permissions assigned</p>
                <p className="text-xs mt-1">Contact admin to enable features</p>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div className={`p-4 border-t border-white/30 backdrop-blur-sm space-y-2 shrink-0 ${isSidebarOpen ? "px-3" : "px-2"}`}>
        <div className="mx-1">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl transition-all duration-300 font-semibold text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 hover:shadow-md hover:scale-[1.02] border border-red-200/50 group"
          >
            <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300 flex-shrink-0" />
            {isSidebarOpen ? "LogOut" : ""}
          </button>
        </div>
      </div>
    </aside>
  );
}

Sidebar.propTypes = {
  isSidebarOpen: PropTypes.bool.isRequired,
  setIsSidebarOpen: PropTypes.func.isRequired
};

export default Sidebar;
