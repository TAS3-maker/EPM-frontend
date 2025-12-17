import PropTypes from "prop-types";
import { Link, NavLink } from "react-router-dom";
import React,{ useState ,useEffect } from "react";
import { XMarkIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";
import { Roles } from "../utils/roles";
import defaultpic from "../aasests/default.png";
import { API_URL } from "../utils/ApiConfig";
import { usePermissions } from "../context/PermissionContext";
import {
  House, Users, User, UserCog, Handshake, FolderOpenDot, LogOut,
  CalendarHeart, CalendarCheck, FileSpreadsheet, FileChartLine,
  CalendarCog, FileClock, FolderGit2, FileClock as FileClockAlt, Lock,Folders
} from "lucide-react";
// import userimage from "../aasests/profile-img.jpg";
// import {
//   House,
//   Users,
//   User,
//   UserCog,
//   Handshake,
//   FolderOpenDot,
//   LogOut,
//   CalendarHeart,
//   CalendarCheck,
//   FileSpreadsheet,
//   FileChartLine,
//   CalendarCog,
//   FileClock,
//   FolderGit2,
//   ContactRound,
//   FolderKey,
//   Folders
// } from "lucide-react";

export function Sidebar({ isSidebarOpen, setIsSidebarOpen }) {
    const [openMenus, setOpenMenus] = useState({});
  const { logout } = useAuth();
  const userRole = localStorage.getItem("user_name");
const [userimage, setUserimage] = useState(defaultpic);
  const username = localStorage.getItem("name");
const { permissions, hasPermission, isLoading } = usePermissions();

// useEffect(() => {
//   const storedImage = localStorage.getItem("profile_image_base64");
//   console.log("Stored profile image in localStorage:", storedImage);

//   if (storedImage && storedImage !== "null" && storedImage !== "undefined") {
//     // If it's a valid URL (starts with http or https)
//     if (storedImage.startsWith("http")) {
//       setUserimage(storedImage);
//     }
//     // If it's Base64 without prefix
//     else if (storedImage.startsWith("data:image")) {
//       setUserimage(storedImage);
//     } else {
//       setUserimage(`data:image/png;base64,${storedImage}`);
//     }
//   } else {
//     setUserimage(defaultpic);
//   }
// }, []);



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


const isPermissionsLoaded =
  permissions && Array.isArray(permissions.permissions);



const handleLinkClick = () => {
    if (window.innerWidth < 1024) {   // mobile + tablet
      setIsSidebarOpen(false);
    }
  };
 useEffect(() => {
  setOpenMenus({});
}, [userRole]);








  // const [isSidebarOpen, setIsSidebarOpen] = useState(true);
//   const menuItems = {
//     [Roles.ADMIN]: [
//       { name: "Dashboard", path: "/admin/dashboard" },
//       { name: "employee Management", path: "/admin/users" },
//     ],
//     [Roles.SUPER_ADMIN]: [
//       { name: "Dashboard", path: "/superadmin/dashboard", icon: <House /> },
//       { name: "Roles", path: "/superadmin/roles", icon: <UserCog /> },
//       { name: "Department", path: "/superadmin/department", icon: <UserCog /> },
//       { name: "Team", path: "/superadmin/team", icon: <Users /> },
//       { name: "Employee Management", path: "/superadmin/users", icon: <User /> },
//       { name: "Clients", path: "/superadmin/clients", icon: <Handshake /> },
//       { name: "Projects", path: "/superadmin/projects", icon: <FolderOpenDot />, },
//       { name: "Projects Assigned", path: "/superadmin/assigned-projects", icon: <FileSpreadsheet />,
//         children:[
//           {name:"Assigned Projects",path:"/superadmin/assigned-projects", icon: <FileSpreadsheet />},
//           {name:"Unassigned Projects",path:"/superadmin/not-assigned-projects", icon: <FileSpreadsheet />},
       
//         ]
//        },
// {
//   name: "Performance Sheets",
//   path: "/superadmin/Manage-sheets",
//   icon: <FileChartLine />,
//   children: [
//         { name: "Pending Sheets", path: "/superadmin/Pending-sheets", icon: <FileChartLine /> },

//         { name: "Manage Sheets", path: "/superadmin/Manage-sheets", icon: <FileChartLine /> },
//     { name: "Unfilled Sheets", path: "/superadmin/Manage-sheets-history", icon: <FileChartLine /> },
//   ],
// },

//       { name: "Manage Leaves", path: "/superadmin/manage-leaves", icon: <CalendarCog /> },
//       { name: "Activity Tags", path: "/superadmin/activity-tags", icon: <FileChartLine /> },
//       // { name: "Theme", path: "/superadmin/theme", icon: <FileChartLine /> },
//     ],
//     [Roles.BD]: [
//       { name: "Dashboard", path: "/billingmanager/dashboard", icon: <House /> },
//       { name: "Clients", path: "/billingmanager/clients", icon: <Handshake /> },
//       { name: "Projects", path: "/billingmanager/projects", icon: <Folders/> },
//       { name: "Teams", path: "/billingmanager/teams", icon: <Users /> },
//       { name: "Employee Management", path: "/billingmanager/users", icon: <User /> },

//   { name: "Projects Assigned", path: "/billingmanager/assigned-projects", icon: <FileSpreadsheet />,
//         children:[
//           {name:"Assigned Projects",path:"/billingmanager/assigned-projects", icon: <FileSpreadsheet />},
//           {name:"Unassigned Projects",path:"/billingmanager/not-assigned-projects", icon: <FileSpreadsheet />}
//         ]
//        },      // { name: "Manage Sheets", path: "/billingmanager/Manage-sheets", icon: <FileChartLine />},
//       {
//   name: "Performance Sheets",
//   path: "/billingmanager/Manage-sheets",
//   icon: <FileChartLine />,
//   children: [
//         { name: "Pending Sheets", path: "/billingmanager/Pending-sheets", icon: <FileChartLine /> },

//         { name: "Manage Sheets", path: "/billingmanager/Manage-sheets", icon: <FileChartLine /> },
//     { name: "Unfilled Sheets", path: "/billingmanager/Manage-sheets-history", icon: <FileChartLine /> },
//   ],
// },
//       { name: "Leaves", path: "/billingmanager/leaves",icon: <CalendarHeart />  },

//     ],
//     [Roles.HR]: [
//       { name: "Dashboard", path: "/hr/dashboard", icon: <House /> },
//       { name: "Employee Management", path: "/hr/employees", icon: <ContactRound /> },
//       { name: "Leave Management", path: "/hr/leaves",icon: <CalendarCheck /> },
//       { name: "Teams", path: "/hr/teams", icon: <Users /> },
      
//       // { name: "Accessory category", path: "/hr/accessory/category",icon: <CalendarCheck /> },
//       // { name: "Accessories assign", path: "/hr/accessories/assign",icon: <CalendarCheck /> },
//     ],
//     [Roles.PM]: [
//       { name: "Dashboard", path: "/projectmanager/dashboard", icon: <House /> },
//              { name: "Teams", path: "/projectmanager/teams", icon: <Users /> },

//       { name: "Projects Assigned", path: "/projectmanager/assigned", icon: <FileSpreadsheet /> },
//       // { name: "Performance Sheets", path: "/projectmanager/performance-sheets", icon: <FileChartLine /> },
//             {
//   name: "Performance Sheets",
//   path: "/projectmanager/Manage-sheets",
//   icon: <FileChartLine />,
//   children: [
//         { name: "Pending Sheets", path: "/projectmanager/Pending-sheets",  icon: <FileChartLine /> },

//         { name: "Manage Sheets", path: "/projectmanager/Manage-sheets",  icon: <FileChartLine /> },
//     { name: "Unfilled Sheets", path: "/projectmanager/Manage-sheets-history",  icon: <FileChartLine /> },
//   ],
// },
//       { name: "Project Management", path: "/projectmanager", icon: <FolderGit2 />,
//           children: [
//     { name: "Assigned Projects", path: "/projectmanager/assign",  icon: <FolderGit2 /> },
//     { name: "Unassigned Projects", path: "/projectmanager/unassigned",  icon: <FolderGit2 /> },
//   ],
//        },
//       // { name: "Performance Sheets", path: "/projectmanager/performance-sheets", icon: <FileChartLine /> },
//       { name: "Manage Leaves", path: "/projectmanager/manage-leaves", icon: <CalendarCog /> },
//       { name: "Leaves", path: "/projectmanager/leaves",icon: <CalendarHeart />  },

//     ],
//      [Roles.TL]: [
//       { name: "Dashboard", path: "/tl/dashboard", icon: <House /> },
//        { name: "Teams", path: "/tl/teams", icon: <Users /> },
//       { name: "Projects Assigned", path: "/tl/assigned", icon: <FileSpreadsheet /> },
//       // { name: "Performance Sheets", path: "/tl/performance-sheets", icon: <FileChartLine /> },





      
//     {
//   name: "Project Management",
//   path: "/tl",  
//   icon: <FolderGit2 />,
//   children: [
//     { name: "Assigned Projects", path: "/tl/assign", icon: <FolderGit2 /> },
//     { name: "Unassigned Projects", path: "/tl/unassigned", icon: <FolderGit2 /> },
//   ],
// },
//       // { name: "Performance Sheets", path: "/tl/performance-sheets", icon: <FileChartLine /> },
//       { name: "Manage Leaves", path: "/tl/manage-leaves", icon: <CalendarCog /> },
//             { name: "Leaves", path: "/tl/leaves",icon: <CalendarHeart />  },
//                         {
//   name: "Performance Sheets",
//   path: "/tl/Manage-sheets",
//   icon: <FileChartLine />,
//   children: [
//         { name: "Pending Sheets", path: "/tl/Pending-sheets", icon: <FileChartLine /> },

//         { name: "Manage Sheets", path: "/tl/performance-sheets", icon: <FileChartLine /> },
//     { name: "Unfilled Sheets", path: "/tl/Manage-sheets-history", icon: <FileChartLine /> },
//   ],
// },

//     ],
//     [Roles.TEAM]: [
//       { name: "Dashboard", path: "/team/dashboard", icon: <House /> },
//       { name: "Projects Assigned", path: "/team/projects-assigned", icon: <FileSpreadsheet /> },
//       { name: "Performance Sheet", path: "/team/performance-sheet", icon: <FileChartLine /> },
//       { name: "Performance History", path: "/team/performance-sheet-History", icon: <FileClock /> },
//       // { name: "Accessory", path: "/team/accessory",icon: <CalendarHeart />  },
//       { name: "Leaves", path: "/team/leaves",icon: <CalendarHeart />  },
//     ],
//   };

const ALL_MENUS = [
  // ================= DASHBOARD =================
  {
    name: "Dashboard",
    icon: <House />,
    permissionKey: "dashboard",
    pathMap: {
      superadmin: "/superadmin/dashboard",
      admin: "/admin/dashboard",
      hr: "/hr/dashboard",
      billingmanager: "/billingmanager/dashboard",
      projectmanager: "/projectmanager/dashboard",
      tl: "/tl/dashboard",
      team: "/team/dashboard",
    },
  },

  // ================= EMPLOYEE / ROLES =================
  {
    name: "Employee Management",
    icon: <User />,
    permissionKey: "employee_management",
    pathMap: {
      superadmin: "/superadmin/users",
      admin: "/admin/users",
      hr: "/hr/users",
      billingmanager: "/billingmanager/users",
       projectmanager: "/projectmanager/users",
      tl: "/tl/users",
      team: "/team/users",
      
    },
  },
  {
    name: "Roles",
    icon: <UserCog />,
    permissionKey: "roles",
    pathMap: {
      superadmin: "/superadmin/roles",
       admin: "/admin/roles",
      hr: "/hr/roles",
      billingmanager: "/billingmanager/roles",
       projectmanager: "/projectmanager/roles",
      tl: "/tl/roles",
      team: "/team/roles",
    },
  },
  {
    name: "Permission",
    icon: <UserCog />,
    permissionKey: "permission",
    pathMap: {
      superadmin: "/superadmin/permission",
       admin: "/admin/permission",
      hr: "/hr/permission",
      billingmanager: "/billingmanager/permission",
       projectmanager: "/projectmanager/permission",
      tl: "/tl/permission",
      team: "/team/permission",
    },
  },
  {
    name: "Department",
    icon: <UserCog />,
    permissionKey: "department",
    pathMap: {
      superadmin: "/superadmin/department",
       admin: "/admin/department",
      hr: "/hr/department",
      billingmanager: "/billingmanager/department",
       projectmanager: "/projectmanager/department",
      tl: "/tl/department",
      team: "/team/department",
    },
  },
  {
    name: "Team",
    icon: <UserCog />,
    permissionKey: "team",
    pathMap: {
      superadmin: "/superadmin/team",
        admin: "/admin/team",
      hr: "/hr/team",
      billingmanager: "/billingmanager/team",
       projectmanager: "/projectmanager/team",
      tl: "/tl/team",
      team: "/team/team",
      
    },
  },
  {
    name: "Teams",
    icon: <Users />,
    permissionKey: "teams",
    pathMap: {
        superadmin: "/superadmin/teams",
      billingmanager: "/billingmanager/teams",
      hr: "/hr/teams",
      projectmanager: "/projectmanager/teams",
      tl: "/tl/teams",
            team: "/team/teams",

    },
  },

  // ================= CLIENTS / PROJECTS =================
  {
    name: "Clients",
    icon: <Handshake />,
    permissionKey: "clients",
    pathMap: {
      superadmin: "/superadmin/clients",
      billingmanager: "/billingmanager/clients",
       hr: "/hr/clients",
      projectmanager: "/projectmanager/clients",
      tl: "/tl/clients",
            team: "/team/clients",
    },
  },
  {
    name: "Projects",
    icon: <Folders />,
    permissionKey: "projects",
    pathMap: {
      superadmin: "/superadmin/projects",
      billingmanager: "/billingmanager/projects",
       hr: "/hr/projects",
      projectmanager: "/projectmanager/projects",
      tl: "/tl/projects",
            team: "/team/projects",
    },
  },

  // ================= PROJECTS ASSIGNED =================
  {
    name: "Projects Assigned",
    icon: <FileSpreadsheet />,
    permissionKey: "projects_assigned",
    children: [
      {
        name: "Assigned Projects",
        permissionKey: "assigned_projects_inside_projects_assigned",
        pathMap: {
          superadmin: "/superadmin/assigned-projects",
          billingmanager: "/billingmanager/assigned-projects",
          projectmanager: "/projectmanager/assigned-projects",
          tl: "/tl/assigned-projects",
            hr: "/hr/assigned-projects",
          team: "/team/assigned-projects",
        },
      },
      {
        name: "Unassigned Projects",
        permissionKey: "unassigned_projects_inside_projects_assigned",
        pathMap: {
          superadmin: "/superadmin/not-assigned-projects",
          billingmanager: "/billingmanager/not-assigned-projects",
           hr: "/hr/not-assigned-projects",
          projectmanager: "/projectmanager/not-assigned-projects",
          tl: "/tl/not-assigned-projects",
            team: "/team/not-assigned-projects",
        },
      },
    ],
  },

  // ================= PERFORMANCE SHEETS =================
  {
    name: "Performance Sheets",
    icon: <FileChartLine />,
    permissionKey: "performance_sheets",
    children: [
      {
        name: "Pending Sheets",
        permissionKey: "pending_sheets_inside_performance_sheets",
        pathMap: {
          superadmin: "/superadmin/pending-sheets",
          billingmanager: "/billingmanager/pending-sheets",
          projectmanager: "/projectmanager/pending-sheets",
          tl: "/tl/pending-sheets",
            team: "/team/pending-sheets",
             hr: "/hr/pending-sheets",
        },
      },
      {
        name: "Manage Sheets",
        permissionKey: "manage_sheets_inside_performance_sheets",
        pathMap: {
          superadmin: "/superadmin/manage-sheets",
          billingmanager: "/billingmanager/manage-sheets",
          projectmanager: "/projectmanager/manage-sheets",
          tl: "/tl/manage-sheets",
           team: "/team/manage-sheets",
             hr: "/hr/manage-sheets",
        },
      },
      {
        name: "Unfilled Sheets",
        permissionKey: "unfilled_sheets_inside_performance_sheets",
        pathMap: {
          superadmin: "/superadmin/manage-sheets-history",
          billingmanager: "/billingmanager/manage-sheets-history",
          projectmanager: "/projectmanager/manage-sheets-history",
          tl: "/tl/manage-sheets-history",
            team: "/team/manage-sheets-history",
             hr: "/hr/manage-sheets-history",
        },
      },
    ],
  },

  // ================= PROJECT MANAGEMENT =================
  {
    name: "Project Management",
    icon: <FolderGit2 />,
    permissionKey: "project_management",
    children: [
      {
        name: "Assigned Projects",
        permissionKey: "assigned_projects_inside_project_management",
        pathMap: {
            superadmin: "/superadmin/assign",
          projectmanager: "/projectmanager/assign",
          tl: "/tl/assign",
          team: "/team/assign",
          billingmanager: "/billingmanager/assign",

             hr: "/hr/assign",
        },
      },
      {
        name: "Unassigned Projects",
        permissionKey: "unassigned_projects_inside_project_management",
        pathMap: {
                      superadmin: "/superadmin/unassigned",

          projectmanager: "/projectmanager/unassigned",
          tl: "/tl/unassigned",
           team: "/team/unassigned",
          billingmanager: "/billingmanager/unassigned",

             hr: "/hr/unassigned",
        },
      },
    ],
  },

  // ================= LEAVES =================
  {
    name: "Manage Leaves",
    icon: <CalendarCog />,
    permissionKey: "manage_leaves",
    pathMap: {
      superadmin: "/superadmin/manage-leaves",
      projectmanager: "/projectmanager/manage-leaves",
      tl: "/tl/manage-leaves",
      team: "/team/manage-leaves",
          billingmanager: "/billingmanager/manage-leaves",

             hr: "/hr/manage-leaves",
    },
  },
  {
    name: "Leaves",
    icon: <CalendarHeart />,
    permissionKey: "leaves",
    pathMap: {
        superadmin: "/superadmin/leave",
      team: "/team/leave",
      billingmanager: "/billingmanager/leave",
      projectmanager: "/projectmanager/leave",
      tl: "/tl/leave",
      hr: "/hr/leave",
    },
  },
  {
    name: "Leave Management",
    icon: <CalendarCheck />,
    permissionKey: "leave_management",
    pathMap: {
       superadmin: "/superadmin/leaves",
      hr: "/hr/leaves",
       team: "/team/leaves",
      billingmanager: "/billingmanager/leaves",
      projectmanager: "/projectmanager/leaves",
      tl: "/tl/leaves",
    },
  },

  // ================= TEAM PERFORMANCE =================
  {
    name: "Performance Sheet",
    icon: <FileChartLine />,
    permissionKey: "performance_sheet",
    pathMap: {
      team: "/team/performance-sheet",
        billingmanager: "/billingmanager/performance-sheet",
      projectmanager: "/projectmanager/performance-sheet",
      tl: "/tl/performance-sheet",
       hr: "/hr/performance-sheet",
       superadmin: "/superadmin/performance-sheet",
    },
  },
  {
    name: "Performance History",
    icon: <FileClock />,
    permissionKey: "performance_history",
    pathMap: {
      team: "/team/performance-sheet-history",
        billingmanager: "/billingmanager/performance-sheet-history",
      projectmanager: "/projectmanager/performance-sheet-history",
      tl: "/tl/performance-sheet-history",
       hr: "/hr/performance-sheet-history",
       superadmin: "/superadmin/performance-sheet-history",
    },
  },
];

const visibleMenus = isPermissionsLoaded
  ? ALL_MENUS.filter(menu => {
      // ✅ Always allow dashboard
      if (menu.permissionKey === "dashboard") return true;

      if (!hasPermission(permissions, menu.permissionKey)) return false;

      if (menu.children) {
        return menu.children.some(child =>
          hasPermission(permissions, child.permissionKey)
        );
      }

      return true;
    })
  : [];





  const toggleMenu = (path) => {
    setOpenMenus((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };
  return (
<aside
  className={`sidebar bg-white shadow-lg fixed left-0 top-0 h-full z-[10] overflow-hidden border border-gray-200 flex flex-col my-2.5 mx-1.5 rounded-xl ${


    isSidebarOpen 
      ? "w-72 md:translate-x-0 translate-x-0" 
      : "hidden md:!block md:w-20 md:translate-x-0 -translate-x-full w-20"
  }`}
>


  {/* Header */}
  <div className="relative flex items-center py-4 px-4 border-b border-gray-200">
    <Link
      to={
        userRole === "superadmin"
          ? "/superadmin/profile"
          : userRole === "team"
          ? "/team/profile"
          : userRole === "admin"
          ? "/admin/profile"
          : userRole === "hr"
          ? "/hr/profile"
          : userRole === "billingmanager"
          ? "/billingmanager/profile"
          : userRole === "projectmanager"
          ? "/projectmanager/profile"
          : userRole === "tl"
          ? "/tl/profile"
          : "/profile"
      }
      className="flex items-center gap-3"
      onClick={handleLinkClick} 
    >
       <img
  className="rounded-3xl h-12 w-12"
  src={userimage}
  alt="Profile"
  onError={(e) => {
    console.error("❌ IMAGE FAILED:", e.target.src); // ADD THIS
    e.target.src = defaultpic;
  }}
/>
      {isSidebarOpen && (
      <h2 className="text-sm font-semibold text-gray-700 capitalize  lg:break-words">
  Welcome, {username}
</h2>
      )}
    </Link>

    {/* <button
      onClick={() => setIsSidebarOpen(false)}
      className="absolute right-2 top-4 p-2 rounded focus:outline-none xl:hidden"
    >
      <XMarkIcon className="close h-5 w-5 text-gray-700" />
    </button> */}
  </div>

  {/* Scrollable Menu */}
  <div className="flex-1 overflow-x-hidden overflow-y-auto  mt-2">
    <ul className="flex flex-col gap-1">
{isLoading && (
    <li className="px-4 py-3 text-sm text-gray-500">
      Loading menu...
    </li>
)}

{/* No permissions */}
{!isLoading && isPermissionsLoaded && visibleMenus.length === 0 && (
  <li className="px-4 py-6 text-center text-sm text-gray-500">
      <Lock className="mx-auto mb-2" />
      You don’t have access to any modules.
    </li>
)}

{/* Menus */}
{!isLoading && visibleMenus.map(menu => {
  const path = menu.pathMap?.[userRole];
  if (!path && !menu.children) return null;
    return (
<li key={menu.name} className="w-full">
  {menu.children ? (
    <>
      {/* Parent menu */}
      <button
        onClick={() => toggleMenu(menu.name)}
        className={`flex items-center w-full rounded-xl transition-all duration-300 font-medium text-gray-700
          hover:bg-gray-100 hover:shadow-md hover:scale-[1.02] group p-3
          ${openMenus[menu.name] ? "bg-blue-100 border border-blue-200 shadow-inner" : ""}
        `}
        title={menu.name}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Icon */}
          <div className="p-2 rounded-xl bg-blue-100/60 group-hover:bg-blue-200/60 transition-all flex-shrink-0">
            {menu.icon &&
              React.cloneElement(menu.icon, {
                size: 20,
                className: "text-blue-600",
              })}
          </div>

          {/* Text */}
          {isSidebarOpen && (
            <span className="text-sm font-semibold truncate">
              {menu.name}
            </span>
          )}
        </div>

        {/* Arrow */}
        {isSidebarOpen && (
          <ChevronDownIcon
            className={`h-4 w-4 text-gray-500 transition-transform duration-300
              ${openMenus[menu.name] ? "rotate-180" : ""}
            `}
          />
        )}
      </button>

      {/* Children */}
      {openMenus[menu.name] && (
<ul
  className={`mt-1 flex flex-col gap-1 ${
    isSidebarOpen ? "ml-12" : "ml-0 items-center w-full"
  }`}
>
          {menu.children
            .filter(child =>
              hasPermission(permissions, child.permissionKey)
            )
            .map(child => {
              const childPath = child.pathMap?.[userRole];
              if (!childPath) return null;

              return (
                <li key={child.name}>
               <NavLink
  to={childPath}
  className={({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all
     ${
       isActive
         ? "bg-blue-100 text-blue-700 shadow-sm"
         : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
     }`
  }
  title={child.name}
>
  {/* ICON ONLY WHEN SIDEBAR CLOSED */}
  {!isSidebarOpen && (
<div className="p-2 rounded-md bg-blue-100 flex items-center justify-center w-10">
      {menu.icon &&
        React.cloneElement(menu.icon, {
          size: 16,
          className: "text-blue-600",
        })}
    </div>
  )}

  {/* TEXT ONLY WHEN SIDEBAR OPEN */}
  {isSidebarOpen && <span>{child.name}</span>}
</NavLink>

                </li>
              );
            })}
        </ul>
      )}
    </>
  ) : (
    /* Single menu */
    <NavLink
      to={path}
      className={({ isActive }) =>
        `flex items-center w-full rounded-xl transition-all duration-300 font-medium p-3 group
         ${
           isActive
             ? "bg-blue-100 border border-blue-200 shadow-inner text-blue-700"
             : "text-gray-700 hover:bg-gray-100 hover:shadow-md hover:scale-[1.02]"
         }`
      }
      title={menu.name}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="p-2 rounded-xl bg-blue-100/60 group-hover:bg-blue-200/60 transition-all flex-shrink-0">
          {menu.icon &&
            React.cloneElement(menu.icon, {
              size: 20,
              className: "text-blue-600",
            })}
        </div>

        {isSidebarOpen && (
          <span className="text-sm font-semibold truncate">
            {menu.name}
          </span>
        )}
      </div>
    </NavLink>
  )}
</li>

    );
  })}

    </ul>
  </div>

  {/* Footer */}
 

      <div className="mx-2 my-4">
        <button
          onClick={logout}
          className="w-full flex items-center text-sm gap-2.5 px-2 py-2 rounded-lg transition-colors font-medium capitalize text-gray-700 hover:bg-gray-100"
        >
          <LogOut />
          Log Out
        </button>
      </div>
   
  
</aside>


  );
}
Sidebar.propTypes = {
  user: PropTypes.object,
  isSidebarOpen: PropTypes.bool.isRequired,
  setIsSidebarOpen: PropTypes.func.isRequired,
};

export default Sidebar;
