import PropTypes from "prop-types";
import { NavLink, Link } from "react-router-dom";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";
import { usePermissions } from "../context/PermissionContext";
import defaultpic from "../aasests/default.png";
import { API_URL } from "../utils/ApiConfig";
import { useRole } from "../context/RoleContext";

import {
  House, User, UserCog, Handshake, Folders, Users,
  CalendarHeart, CalendarCog, CalendarCheck, FileSpreadsheet,
  FileChartLine, FileClock, FolderGit2, LogOut,
  
  Building2, ShieldCheck, ShieldAlert, Users2, FileCheck, FileText,
  FolderOpen, FolderKanban, Clock, History, Briefcase, ClipboardList,
  ClipboardCheck, CheckCircle2, SquareCheck,

  UserSquare, Link2 , Tag, MessageCircle, WifiOff,
  TrendingUp, BarChart3, Activity, FileBarChart, Pause,X
} from "lucide-react";




const ALL_MENUS = [
  {
    name: "Dashboard",
    icon: <House size={20} />,
    permissionKey: "dashboard",
    pathMap: {
      superadmin: "/superadmin/dashboard",
      admin: "/admin/dashboard",
      hr: "/hr/dashboard",
      billingmanager: "/billingmanager/dashboard",
      projectmanager: "/projectmanager/dashboard",
      tl: "/tl/dashboard",
      team: "/team/dashboard",
      salesperson:"/salesperson/dashboard"
    },
  },

  // ================= EMPLOYEE / ROLES =================
  {
    name: "Employee Management",
    icon: <Users size={20} />,
    permissionKey: "employee_management",
    pathMap: {
      superadmin: "/superadmin/users",
      admin: "/admin/users",
      hr: "/hr/users",
      billingmanager: "/billingmanager/users",
      projectmanager: "/projectmanager/users",
      tl: "/tl/users",
      team: "/team/users",
      salesperson:"/salesperson/users"
    },
  },
  {
    name: "Roles",
    icon: <ShieldCheck size={20} />,
    permissionKey: "roles",
    pathMap: {
      superadmin: "/superadmin/roles",
      admin: "/admin/roles",
      hr: "/hr/roles",
      billingmanager: "/billingmanager/roles",
      projectmanager: "/projectmanager/roles",
      tl: "/tl/roles",
      team: "/team/roles",
            salesperson:"/salesperson/roles"
    },
  },
  {
    name: "Permission",
    icon: <ShieldAlert size={20} />,
    permissionKey: "permission",
    pathMap: {
      superadmin: "/superadmin/permission",
      admin: "/admin/permission",
      hr: "/hr/permission",
      billingmanager: "/billingmanager/permission",
      projectmanager: "/projectmanager/permission",
      tl: "/tl/permission",
      team: "/team/permission",
          salesperson:"/salesperson/permission"
    },
  },
  {
    name: "Department",
    icon: <Building2 size={20} />,
    permissionKey: "department",
    pathMap: {
      superadmin: "/superadmin/department",
      admin: "/admin/department",
      hr: "/hr/department",
      billingmanager: "/billingmanager/department",
      projectmanager: "/projectmanager/department",
      tl: "/tl/department",
      team: "/team/department",
      salesperson:"/salesperson/department"
    },
  },
  {
    name: "Team",
    icon: <Users2 size={20} />,
    permissionKey: "team",
    pathMap: {
      superadmin: "/superadmin/team",
      admin: "/admin/team",
      hr: "/hr/team",
      billingmanager: "/billingmanager/team",
      projectmanager: "/projectmanager/team",
      tl: "/tl/team",
      team: "/team/team",
       salesperson:"/salesperson/team"
    },
  },
  {
    name: "Teams",
    icon: <UserSquare size={20} />,
    permissionKey: "teams",
    pathMap: {
      superadmin: "/superadmin/teams",
      admin: "/admin/teams",
      billingmanager: "/billingmanager/teams",
      hr: "/hr/teams",
      projectmanager: "/projectmanager/teams",
      tl: "/tl/teams",
      team: "/team/teams",
       salesperson:"/salesperson/teams"
    },
  },

  {
    name: "Clients",
    icon: <Handshake size={20} />,
    permissionKey: "clients",
    pathMap: {
      superadmin: "/superadmin/clients",
      admin: "/admin/clients",
      billingmanager: "/billingmanager/clients",
      hr: "/hr/clients",
      projectmanager: "/projectmanager/clients",
      tl: "/tl/clients",
      team: "/team/clients",
         salesperson:"/salesperson/clients"
    },
  },

  {
    name: "Project Assigned",
    icon: <Link2  size={20} />,
    permissionKey: "projects_assigned",
    pathMap: {
      superadmin: "/superadmin/Projects-assigned",
      billingmanager: "/billingmanager/Projects-assigned",
      hr: "/hr/Projects-assigned",
      projectmanager: "/projectmanager/Projects-assigned",
      tl: "/tl/Projects-assigned",
      team: "/team/projects-assigned",
           salesperson:"/salesperson/projects-assigned"
    },
  },
  {
    name: "Projects",
    icon: <Folders size={20} />,
    permissionKey: "projects",
    pathMap: {
      superadmin: "/superadmin/projects",
      admin: "/admin/projects",
      billingmanager: "/billingmanager/projects",
      hr: "/hr/projects",
      projectmanager: "/projectmanager/projects",
      tl: "/tl/projects",
      team: "/team/projects",
            salesperson:"/salesperson/projects"
    },
  },

{
  name: "Activity Tags",
  icon: <Tag size={20} />,
  permissionKey: "activity_tags",
  pathMap: {
    superadmin: "/superadmin/activity-tags",
    admin: "/admin/activity-tags",
    projectmanager: "/projectmanager/activity-tags",
    tl: "/tl/activity-tags",
    billingmanager: "/billingmanager/activity-tags",
    team:"team/activity-tags",
      salesperson:"/salesperson/activity-tags"
   },
  },

// ================= Master Routes =================


  {
  name: "Onboarding Source",
  icon: <FolderOpen size={20} />,
  permissionKey: "project_source",
  pathMap: {
    superadmin: "/superadmin/source-master",
    admin: "/admin/source-master",
    team:"/team/source-master",
    tl:"/tl/source-master",
     projectmanager: "/projectmanager/source-master",
      billingmanager: "/billingmanager/source-master",
        salesperson:"/salesperson/source-master"

   },
  },

 {
  name: "Onboarding Account",
  icon: <Briefcase size={20} />,
  permissionKey: "account_master",
  pathMap: {
    superadmin: "/superadmin/account-master",
      team:"/team/account-master",
        admin: "/admin/account-master",
      tl:"/tl/account-master",
      projectmanager: "/projectmanager/account-master",
              billingmanager: "/billingmanager/account-master",
              salesperson:"/salesperson/account-master"

    },
  },

  
  {
  name: "Communication Types",
  icon: <MessageCircle size={20} />,
  permissionKey: "communication_type",
  pathMap: {
    superadmin: "/superadmin/communication-type-master",
        admin: "/admin/communication-type-master",
        team:"/team/communication-type-master",
        tl:"/tl/communication-type-master",
        projectmanager: "/projectmanager/communication-type-master",
              billingmanager: "/billingmanager/communication-type-master",
                      salesperson:"/salesperson/communication-type-master"



   },
  },


  

  
 
  {
  name: "Notes Management",
  icon: <FileText size={20} />,
  permissionKey: "notes_management",
  pathMap: {
    superadmin: "/superadmin/notes-management",
           admin: "/admin/notes-management",
          team:"team/notes-management",
          tl:"/tl/notes-management",
                projectmanager: "/projectmanager/notes-management",
                              billingmanager: "/billingmanager/notes-management",
                                        salesperson:"/salesperson/notes-management"
                              



   },
  },



  // ================= PERFORMANCE SHEETS =================

      {
        name: "Pending for Approval",
        icon: <Pause size={18} strokeWidth={2} />,
        permissionKey: "pending_sheets_inside_performance_sheets",
        pathMap: {
         superadmin: "/superadmin/pending-sheets",
              admin: "/admin/pending-sheets",
         billingmanager: "/billingmanager/pending-sheets",
         projectmanager: "/projectmanager/pending-sheets",
         tl: "/tl/pending-sheets",
         team: "/team/pending-sheets",
         hr: "/hr/pending-sheets",
                   salesperson:"/salesperson/pending-sheets"
        },
       },
      {
    name: "Time Sheets",
    icon: <Activity size={20} />,
    permissionKey: "master_reporting",
    pathMap: {
        hr: "/hr/manage-timesheet",
      superadmin: "/superadmin/manage-timesheet",
       admin: "/admin/manage-timesheet",
      tl: "/tl/manage-timesheet",
      projectmanager: "/projectmanager/manage-timesheet",
      billingmanager: "/billingmanager/manage-timesheet",
      team:"/team/manage-timesheet",
        salesperson:"/salesperson/manage-timesheet"
    },
  },
      //   {
      //   name: "Old Sheet to Approve",
      //   icon: <History size={18} />,
      //   permissionKey: "previous_sheets",
      //   pathMap: {
      //    superadmin: "/superadmin/previous-sheets",
      //          admin: "/admin/previous-sheets",
      //    billingmanager: "/billingmanager/previous-sheets",
      //    projectmanager: "/projectmanager/previous-sheets",
      //    tl: "/tl/previous-sheets",
      //    team: "/team/previous-sheets",
      //    hr: "/hr/previous-sheets",
      //      salesperson:"/salesperson/previous-sheets"
      //   },
      // },
      {
        name: "Time Sheets",
        icon: <ClipboardList size={18} />,
        permissionKey: "manage_sheets_inside_performance_sheets",
        pathMap: {
         // superadmin: "/superadmin/manage-sheets",
         //      admin: "/admin/manage-sheets",
         billingmanager: "/billingmanager/manage-sheets",
         projectmanager: "/projectmanager/manage-sheets",
         tl: "/tl/manage-sheets",
         team: "/team/manage-sheets",
         hr: "/hr/manage-sheets",
          salesperson:"/salesperson/manage-sheets"
        },
      },
      {
        name: "Unfilled Sheets",
        icon: <ClipboardCheck size={18} />,
        permissionKey: "unfilled_sheets_inside_performance_sheets",
        pathMap: {
         superadmin: "/superadmin/manage-sheets-history",
           admin: "/admin/manage-sheets-history",
         billingmanager: "/billingmanager/manage-sheets-history",
         projectmanager: "/projectmanager/manage-sheets-history",
         tl: "/tl/manage-sheets-history",
         team: "/team/manage-sheets-history",
         hr: "/hr/manage-sheets-history",
               salesperson:"/salesperson/manage-sheets-history"
        },
      },
        {
  name: "Offline Hours",
  icon: <WifiOff  size={20} />,
  permissionKey: "communication_type",
  pathMap: {
    superadmin: "/superadmin/offline-hours",
               admin: "/admin/offline-hours",
        team:"/team/offline-hoursr",
        tl:"/tl/offline-hours",
        projectmanager: "/projectmanager/offline-hours",
              billingmanager: "/billingmanager/offline-hours",
                   salesperson:"/salesperson/offline-hours"


   },
  },

    
  

 
  {
    name: "Leave Management",
    icon: <CalendarCheck size={20} />,
    permissionKey: "leave_management",
    pathMap: {
      superadmin: "/superadmin/leaves",
       admin: "/admin/leaves",
      hr: "/hr/leaves",
      team: "/team/leaves",
      billingmanager: "/billingmanager/leaves",
      projectmanager: "/projectmanager/leaves",
      tl: "/tl/leaves",
        salesperson:"/salesperson/leaves"
    },
  },
  {
    name: "Event Management",
    icon: <CalendarCheck size={20} />,
    permissionKey: "leave_management",
    pathMap: {
      superadmin: "/superadmin/event",
       admin: "/admin/event",
      hr: "/hr/event",
      team: "/team/event",
      billingmanager: "/billingmanager/event",
      projectmanager: "/projectmanager/event",
      tl: "/tl/event",
        salesperson:"/salesperson/event"
    },
  },
  {
    name: "Leave Credit Management",
    icon: <CalendarCheck size={20} />,
    permissionKey: "leave_management",
    pathMap: {
       superadmin: "/superadmin/leave-credits",
      team: "/team/leave-credits",
   
    },
  },

  // ================= TEAM PERFORMANCE =================
  {
    name: "Performance Sheet",
    icon: <TrendingUp  size={20} />,
    permissionKey: "performance_sheet",
    pathMap: {
      team: "/team/performance-sheet",
      billingmanager: "/billingmanager/performance-sheet",
      projectmanager: "/projectmanager/performance-sheet",
      tl: "/tl/performance-sheet",
      hr: "/hr/performance-sheet",
      superadmin: "/superadmin/performance-sheet",
             admin: "/admin/performance-sheet",
        salesperson:"/salesperson/performance-sheet"
    },
  },
  {
    name: "Performance History",
    icon: <BarChart3 size={20} />,
    permissionKey: "performance_history",
    pathMap: {
      team: "/team/performance-sheet-history",
      billingmanager: "/billingmanager/performance-sheet-history",
      projectmanager: "/projectmanager/performance-sheet-history",
      tl: "/tl/performance-sheet-history",
      hr: "/hr/performance-sheet-history",
       admin: "/admin/performance-sheet-history",
      superadmin: "/superadmin/performance-sheet-history",
        salesperson:"/salesperson/performance-sheet-history"
    },
  },


 {
    name: "Leaves",
    icon: <CalendarHeart size={20} />,
    permissionKey: "leaves",
    pathMap: {
      superadmin: "/superadmin/leave",
          admin: "/admin/leave",
      team: "/team/leave",
      billingmanager: "/billingmanager/leave",
      projectmanager: "/projectmanager/leave",
      tl: "/tl/leave",
      hr: "/hr/leave",
                         salesperson:"/salesperson/leave"

    },
  },
  
  {
    name: "Team-Reporting",
    icon: <Activity size={20} />,
    permissionKey: "team_reporting",
    pathMap: {
        hr: "/hr/reporting",
      superadmin: "/superadmin/reporting",
       admin: "/admin/reporting",
      tl: "/tl/reporting",
      projectmanager: "/projectmanager/reporting",
      billingmanager: "/billingmanager/reporting",
      team:"/team/reporting",
        salesperson:"/salesperson/reporting"
    },
  },
  {
    name: "Leave-Reporting",
    icon: <FileBarChart size={20} />,
    permissionKey: "leave_reporting",
    pathMap: {
        hr: "/hr/leave-reporting",
      superadmin: "/superadmin/leave-reporting",
          admin: "/admin/leave-reporting",
      tl: "/tl/leave-reporting",
      projectmanager: "/projectmanager/leave-reporting",
      billingmanager: "/billingmanager/leave-reporting",
      team:"/team/leave-reporting",
         salesperson:"/salesperson/leave-reporting"
    },
  },
    {
    name: "Sheet-Reporting",
    icon: <Activity size={20} />,
    permissionKey: "team_reporting",
    pathMap: {
        hr: "/hr/Sheet-reporting",
      superadmin: "/superadmin/Sheet-reporting",
       admin: "/admin/Sheet-reporting",
      tl: "/tl/Sheet-reporting",
      projectmanager: "/projectmanager/Sheet-reporting",
      billingmanager: "/billingmanager/Sheet-reporting",
      team:"/team/Sheet-reporting",
        salesperson:"/salesperson/Sheet-reporting"
    },
  },
     
];


const MENU_GROUPS = {
  Overview: ["Dashboard"],
  Performance: ["Pending for Approval","Time Sheets","Unfilled Sheets","Offline-Hours"],
    Reporting:["Team-Reporting","Leave-Reporting","Sheet-Reporting","manage-timesheet"],
  Leaves: ["Manage Leaves", "Leave Management","Event Management","Leave Credit Management"],
  User_Specific_Options: ["Performance Sheet", "Leaves", "Performance History"],

  Projects: ["Clients", "Projects", "Projects Assigned", "Project Management", "Activity Tags"],
  Masters: ["Onboarding Source", "Communication Types", "Onboarding Account", "Notes Management"],

    "User Management": ["Employee Management", "Roles", "Permission", "Department", "Team", "Teams"],
};

const GROUP_LABELS = {
  Overview: "📊 Overview",

  Projects: "📁 Projects",
  Masters: "⚙️ Project Masters",
  Performance: "📈 Performance",
  User_Specific_Options: "👤 User Specific Options",
  Leaves: "📅 Leaves",
  Reporting:"📈 Reporting",
    "User Management": "👥 Users & Teams",
};

export function Sidebar({ isSidebarOpen, setIsSidebarOpen }) {
  const { roles, openRoleModal } = useRole();
  const { logout } = useAuth();
  const { permissions, hasPermission } = usePermissions();
  const userRole = localStorage.getItem("user_name");
  const username = localStorage.getItem("name");

  const [userimage, setUserimage] = useState(defaultpic);
  const [openMenus, setOpenMenus] = useState({});
  const scrollContainerRef = useRef(null);

  // 🔥 NEW: Login detection - Mobile pe sidebar close karo
  useEffect(() => {
    const checkLoginStatus = () => {
      const userData = localStorage.getItem("userData");
      const isMobile = window.innerWidth < 1024;
      
      // Login hua hai aur mobile hai to sidebar close kar do
      if (userData && isMobile) {
        setIsSidebarOpen(false);
      }
    };

    // Initial check
    checkLoginStatus();
    
    // Storage change listener
    const handleStorageChange = (e) => {
      if (e.key === 'userData' || e.key === 'user_name') {
        checkLoginStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [setIsSidebarOpen]);

  // 🔥 NEW: Resize handler for mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024 && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen, setIsSidebarOpen]);

  useEffect(() => {
   const loadImage = () => {
     const userData = JSON.parse(localStorage.getItem("userData"));

     // 1) If base64 exists, use it
     if (userData?.profile_pic?.startsWith("data:image")) {
       setUserimage(userData.profile_pic);
       return;
     }

     // 2) If server image exists, use API image
     if (userData?.profile_pic) {
       setUserimage(`${API_URL}/storage/profile_pics/${userData.profile_pic}`);
       return;
     }

     // 3) fallback
     setUserimage(defaultpic);
   };

   loadImage();

   // 👇 This re-runs automatically when localStorage changes (after profile update)
  window.addEventListener("profile-updated", loadImage);
  window.addEventListener("storage", loadImage);

   return () => window.removeEventListener("storage", loadImage);
  }, []);

  useEffect(() => {
    if (!isSidebarOpen && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [isSidebarOpen]);

  const visibleMenus = useMemo(() => {
    if (!permissions?.permissions?.[0]) return [];
    const perms = permissions.permissions[0];

    return ALL_MENUS.filter(menu => {
      if (menu.permissionKey === "dashboard") return true;
      if (perms[menu.permissionKey] >= "1") return true;
      if (menu.children) {
        return menu.children.some(c => perms[c.permissionKey] >= "1");
      }
      return false;
    });
  }, [permissions]);

  const groupedMenus = useMemo(() => {
    const g = {};
    Object.entries(MENU_GROUPS).forEach(([group, names]) => {
      const items = visibleMenus.filter(m => names.includes(m.name));
      if (items.length) g[group] = items;
    });
    return g;
  }, [visibleMenus]);

  const handleChildLinkClick = (menuName) => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
      setOpenMenus(prev => ({ ...prev, [menuName]: true }));
    }
  };

  const toggleMenu = (name) => {
    setOpenMenus(prev => ({ 
      ...prev, 
      [name]: !prev[name] 
    }));
  };

  useEffect(() => {
    setOpenMenus({});
  }, [userRole]);


  return (
    <>
      {/* 🔥 NEW: Mobile overlay - click outside to close */}
      {isSidebarOpen && window.innerWidth < 1024 && (
        <div 
          className="fixed inset-0 z-[9]  md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <aside
        className={`bg-gradient-to-b from-white via-blue-50/30 to-indigo-50/20 shadow-2xl fixed left-0 top-0 h-full z-[10] overflow-hidden border-r border-white/30 backdrop-blur-sm flex flex-col my-2.5 mx-1.5 rounded-xl ring-1 ring-blue-100/40 hover:shadow-blue-500/10 ${
          isSidebarOpen 
            ? "w-72 md:translate-x-0 translate-x-0" 
            : "w-20 md:translate-x-0 -translate-x-full md:w-20"
        }`}
      >
   <div className="relative p-0 border-b border-white/30 backdrop-blur-sm sticky top-0 z-10">
  <div className="group flex items-center gap-4 w-full p-3 rounded-2xl
                  hover:bg-white/50 transition-all duration-300">

    <Link
      to={
              userRole === "superadmin" ? "/superadmin/profile"
              : userRole === "team" ? "/team/profile"
              : userRole === "admin" ? "/admin/profile"
              : userRole === "hr" ? "/hr/profile"
              : userRole === "billingmanager" ? "/billingmanager/profile"
              : userRole === "projectmanager" ? "/projectmanager/profile"
              : userRole === "tl" ? "/tl/profile"
              : userRole === "salesperson" ? "/salesperson/profile"
              : "/profile"
            }      className="relative"
      onClick={() => {
        if (window.innerWidth < 1024) setIsSidebarOpen(false);
      }}
    >
      <img
        className="rounded-3xl h-14 w-14 shadow-xl ring-2 ring-white/50
                   hover:ring-blue-200/70 transition-all"
        src={userimage}
        alt="Profile"
        onError={(e) => (e.target.src = defaultpic)}
      />
      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400
                      border-3 border-white rounded-full shadow-lg animate-pulse" />
    </Link>

    {isSidebarOpen && (
      <div className="flex items-center gap-2 min-w-0 flex-1">

        <Link
  to={
              userRole === "superadmin" ? "/superadmin/profile"
              : userRole === "team" ? "/team/profile"
              : userRole === "admin" ? "/admin/profile"
              : userRole === "hr" ? "/hr/profile"
              : userRole === "billingmanager" ? "/billingmanager/profile"
              : userRole === "projectmanager" ? "/projectmanager/profile"
              : userRole === "tl" ? "/tl/profile"
              : userRole === "salesperson" ? "/salesperson/profile"
              : "/profile"
            }  
          className="flex flex-col min-w-0"
          onClick={() => {
            if (window.innerWidth < 1024) setIsSidebarOpen(false);
          }}
        >
          <h2 className="text-base font-black text-gray-900 truncate">
            Welcome, {username}
          </h2>
          <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider">
            {userRole}
          </p>
        </Link>

        {roles.length > 1 && (
          <button
            type="button"
            onClick={openRoleModal}
            className="p-1 rounded-full
                       text-gray-400 hover:text-blue-600
                       hover:bg-blue-50 transition"
            title="Switch role"
          >
            🔄
          </button>
        )}
      </div>
    )}
  </div>
</div>

       
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto mt-4 px-2 space-y-3 relative scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-transparent"
        >
          <ul className="flex flex-col gap-3">
            {Object.entries(groupedMenus).map(([groupName, menus]) => (
              <li key={groupName}>
                <div className="bg-white/80 backdrop-blur-sm border border-blue-100/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                  {isSidebarOpen && (
                    <div className="px-4 py-3 border-b border-blue-100/50 bg-gradient-to-r from-blue-50/80 to-indigo-50/80">
                      <p className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                        {GROUP_LABELS[groupName] || groupName}
                      </p>
                    </div>
                  )}

                  <div className="space-y-1">
                    {menus.map(menu => {
                      const path = menu.pathMap?.[userRole];

                      
                      if (menu.children) {
                        return (
                          <React.Fragment key={menu.name}>
                            
                            <button
                              onClick={() => toggleMenu(menu.name)}
                              className={`flex items-center ${isSidebarOpen ? 'justify-between' : 'justify-center'} w-full rounded-xl transition-all duration-300 font-medium text-left text-gray-700 hover:bg-gray-100 hover:shadow-md hover:scale-[1.02] p-3 ${
                                openMenus[menu.name]
                                  ? "bg-blue-100 border border-blue-200 shadow-inner"
                                  : ""
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="p-1 rounded-xl bg-blue-100/50 hover:bg-blue-200/50 transition-all">
                                  {React.cloneElement(menu.icon, {
                                    size: 16,
                                    className: "text-blue-600",
                                  })}
                                </div>
                                {isSidebarOpen && (
                                  <span className="text-sm font-semibold">{menu.name}</span>
                                )}
                              </div>
                              {isSidebarOpen && (
                                <ChevronDownIcon
                                  className={`h-5 w-5 text-gray-500 transition-transform duration-300 ${
                                    openMenus[menu.name] ? "rotate-180" : ""
                                  }`}
                                />
                              )}
                            </button>

                            
                            {openMenus[menu.name] && (
                              <div
                                className={`mt-1 py-2 rounded-xl border border-blue-200/30 shadow-sm transition-all duration-300 ${
                                  isSidebarOpen
                                    ? "ml-2 px-3 bg-gradient-to-b from-blue-50/80 to-indigo-50/50 backdrop-blur-sm"
                                    : "ml-0 px-0 bg-white"
                                }`}
                              >
                                {menu.children.map(c => {
                                  const p = c.pathMap?.[userRole];
                                  if (!p || !hasPermission(permissions, c.permissionKey)) return null;

                                  return (
                                    <NavLink
                                      key={c.name}
                                      to={p}
                                      onClick={() => handleChildLinkClick(menu.name)}
                                      className={({ isActive }) =>
                                        `flex items-center gap-2 w-full py-1.5 text-xs font-medium rounded-lg transition-all duration-300 capitalize text-left truncate ${
                                          isSidebarOpen
                                            ? "px-3 text-sm"
                                            : "px-2 text-xs max-w-[60px] truncate"
                                        } ${
                                          isActive
                                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                                            : "text-gray-700 hover:bg-blue-50 hover:shadow-md hover:text-blue-700"
                                        }`
                                      }
                                    >
                                      <div className="p-0.5 rounded bg-blue-100/50 flex-shrink-0 w-5 h-5 flex items-center justify-center">
                                        {React.cloneElement(c.icon, {
                                          size: 12,
                                          className: "text-blue-600"
                                        })}
                                      </div>
                                       <span>{c.name}</span>
                                    </NavLink>
                                  );
                                })}
                              </div>
                            )}
                          </React.Fragment>
                        );
                      }

                     
                      return (
                        <NavLink
                          key={menu.name}
                          to={path}
                          onClick={() => {
                            if (window.innerWidth < 1024) setIsSidebarOpen(false);
                          }}
                          className={({ isActive }) =>
                            `flex items-center ${
                              isSidebarOpen
                                ? "px-3 py-2.5 gap-3"
                                : "px-3 py-3 justify-center"
                            } rounded-xl transition-all duration-400 font-semibold text-sm tracking-wide text-gray-700 ${
                              isActive
                                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl scale-105 shadow-blue-500/25"
                                : "hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-lg hover:scale-[1.02] hover:text-blue-700"
                            }`
                          }
                          title={!isSidebarOpen ? menu.name : ""}
                        >
                          <div className="p-1 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md bg-blue-100/50">
                            {React.cloneElement(menu.icon, { size: 16 })}
                          </div>
                          {isSidebarOpen && <span>{menu.name}</span>}
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>       
        <div className={`p-4 border-t border-white/30 backdrop-blur-sm space-y-2 ${isSidebarOpen ? "px-2" : ""}`}>
          <div className="mx-1">
           <button
             onClick={logout}
             className="w-full flex items-center gap-2.5 px-3 py-3 rounded-xl transition-all duration-300 font-semibold text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 hover:shadow-md hover:scale-[1.02] border border-red-200/50 group"
           >
             <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
             {isSidebarOpen && "Logout"}
           </button>
          </div>
        </div>

      </aside>
    </>
  );
}

Sidebar.propTypes = {
  isSidebarOpen: PropTypes.bool.isRequired,
};

export default Sidebar;
