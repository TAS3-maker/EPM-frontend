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

export function Sidebar({ isSidebarOpen, setIsSidebarOpen }) {
  const [openMenus, setOpenMenus] = useState({});
  const [rolePrefix, setRolePrefix] = useState("admin");
  const { logout } = useAuth();
  const { permissions: fullApiResponse } = usePermissions();
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
    try {
      const storedUserData = localStorage.getItem("userData");
      if (!storedUserData) return;

      const parsed = JSON.parse(storedUserData);
      const pic = parsed?.profile_pic;
      if (!pic) return;

      const imageUrl = pic.startsWith("http")
        ? pic
        : `https://emp-staging.techarchsoftwares.com/api/storage/profile_pics/${pic}`;

      setUserimage(imageUrl);
    } catch (err) {
      console.error("Failed to load profile image from userData:", err);
    }
  }, []);

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
    setOpenMenus(prev => ({ ...prev, [path]: !prev[path] }));
  }, []);

  const safeNavigate = useCallback((path) => {
    navigate(path, { replace: true });
  }, [navigate]);

  const handleClearCache = async () => {
    try {
      const token = localStorage.getItem("userToken");
      const response = await fetch(
        "https://emp-staging.techarchsoftwares.com/api/api/clearCache?key=mySuperSecretKey123",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      if (response.ok) {
        alert("Cache cleared successfully!");
        localStorage.clear();
        window.location.reload();
      } else {
        alert("Failed to clear cache.");
      }
    } catch (error) {
      console.error("Cache clear error:", error);
      alert("An error occurred while clearing cache.");
    }
  };

  return (
    <aside
      className={`bg-gradient-to-b from-white via-blue-50/30 to-indigo-50/20 shadow-2xl fixed left-0 top-0 h-full z-[100] overflow-hidden border-r border-white/30 backdrop-blur-sm flex flex-col my-2.5 mx-1.5 rounded-xl ring-1 ring-blue-100/40 transition-all duration-700 hover:shadow-blue-500/10 ${
        isSidebarOpen ? "w-72 md:translate-x-0 translate-x-0" : "hidden md:!block md:w-20 md:translate-x-0 -translate-x-full w-20"
      }`}
    >
      {/* Header / Profile */}
      <div className="relative p-6 border-b border-white/30 backdrop-blur-sm sticky top-0 z-10">
        <button
          onClick={() => safeNavigate(`/${rolePrefix}/profile`)}
          className="group flex items-center gap-4 w-full p-3 rounded-2xl hover:bg-white/50 hover:backdrop-blur-sm transition-all duration-300"
        >
          <div className="relative">
            <img
              className="rounded-3xl h-14 w-14 shadow-xl ring-2 ring-white/50 group-hover:ring-blue-200/70 transition-all duration-300"
              src={userimage}
              alt="Profile"
              onError={e => {
                e.target.src = defaultpic;
              }}
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 border-3 border-white rounded-full shadow-lg animate-pulse" />
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
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="absolute right-2 top-4 p-2 rounded-xl bg-white/80 hover:bg-blue-100 hover:scale-105 shadow-lg transition-all duration-200 xl:hidden"
        >
          <XMarkIcon className="h-5 w-5 text-gray-700" />
        </button>
      </div>

      {/* Menu */}
      <div className="flex-1 overflow-y-auto mt-4 px-3 space-y-2 relative scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-transparent">
        <ul className="flex flex-col gap-1">
          {!fullApiResponse?.permissions ? (
            // Skeleton loading
            Array(8)
              .fill(0)
              .map((_, i) => (
                <li key={`skeleton-${i}`}>
                  <div className="h-12 bg-gradient-to-r from-gray-200/50 to-gray-300/50 rounded-xl animate-pulse shadow-sm" />
                </li>
              ))
          ) : menuItems.length > 0 ? (
            // Real menu items
            menuItems.map(({ name, path, icon, children }) => (
              <li key={path}>
                {children && children.length > 0 ? (
                  <>
                    <button
                      onClick={() => toggleMenu(path)}
                      className={`flex items-center justify-between w-full rounded-xl transition-all duration-300 font-medium text-left text-gray-700 hover:bg-gray-100 hover:shadow-md hover:scale-[1.02] ${
                        isSidebarOpen ? "px-4 py-3" : "px-3 py-4 justify-center"
                      } ${openMenus[path] ? "bg-blue-100 border border-blue-200 shadow-inner" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-blue-100/50 hover:bg-blue-200/50 transition-all">
                          {React.cloneElement(icon, { size: 20, className: "text-blue-600" })}
                        </div>
                        {isSidebarOpen && <span className="text-sm font-semibold">{name}</span>}
                      </div>
                      {isSidebarOpen && (
                        <ChevronDownIcon
                          className={`h-5 w-5 text-gray-500 transition-transform duration-300 ${
                            openMenus[path] ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </button>

                    {isSidebarOpen && openMenus[path] && (
                      <div className="ml-6 mt-2 px-4 py-3 bg-gradient-to-b from-blue-50/80 to-indigo-50/50 backdrop-blur-sm rounded-xl border border-blue-200/30 shadow-sm transition-all duration-300">
                        {children.map(({ name: childName, path: childPath }) => (
                          <NavLink
                            key={childPath}
                            to={childPath}
                            onClick={() => safeNavigate(childPath)}
                            className={({ isActive }) =>
                              `block w-full px-4 py-2.5 my-1 text-sm font-medium rounded-xl transition-all duration-300 capitalize text-left ${
                                isActive
                                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105"
                                  : "text-gray-700 hover:bg-white/60 hover:shadow-md hover:scale-[1.02] hover:text-blue-700"
                              }`
                            }
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
                      `flex items-center ${
                        isSidebarOpen ? "px-4 py-3 gap-3" : "px-3 py-4 justify-center"
                      } rounded-xl transition-all duration-400 font-semibold text-sm tracking-wide text-gray-700 ${
                        isActive
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl scale-105 shadow-blue-500/25"
                          : "hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-lg hover:scale-[1.02] hover:text-blue-700"
                      }`
                    }
                    title={!isSidebarOpen ? name : ""}
                  >
                    <div
                      className={`p-2.5 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md ${
                        path === `/${rolePrefix}/dashboard`
                          ? "bg-blue-100/50"
                          : "bg-gray-100/50 hover:bg-blue-100/50"
                      }`}
                    >
                      {React.cloneElement(icon, { size: 20, className: "transition-all group-hover:scale-110" })}
                    </div>
                    {isSidebarOpen && <span>{name}</span>}
                  </NavLink>
                )}
              </li>
            ))
          ) : (
            // No permissions empty state
            <li className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
              <Lock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm font-medium">No permissions assigned</p>
              <p className="text-xs mt-1">Contact admin to enable features</p>
            </li>
          )}
        </ul>
      </div>

      {/* Footer with logout ALWAYS visible */}
      <div className={`p-4 border-t border-white/30 backdrop-blur-sm space-y-2 ${isSidebarOpen ? "px-2" : ""}`}>
        {rolePrefix === Roles.SUPER_ADMIN && isSidebarOpen && (
          <div className="mx-1 mb-2">
            <button
              onClick={handleClearCache}
              className="w-full flex items-center gap-2.5 px-3 py-3 text-sm rounded-xl transition-all duration-300 font-semibold text-orange-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 hover:shadow-md hover:scale-[1.02] border border-orange-200/50"
            >
              🧹 Clear Cache
            </button>
          </div>
        )}
        <div className="mx-1">
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-3 rounded-xl transition-all duration-300 font-semibold text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 hover:shadow-md hover:scale-[1.02] border border-red-200/50 group"
          >
            <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
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
