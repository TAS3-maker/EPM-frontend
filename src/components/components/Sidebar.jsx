import PropTypes from "prop-types";
import { Link, NavLink } from "react-router-dom";
import { useState ,useEffect } from "react";
import { XMarkIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";
import { Roles } from "../utils/roles";
// import userimage from "../aasests/profile-img.jpg";
import {
  House,
  Users,
  User,
  UserCog,
  Handshake,
  FolderOpenDot,
  LogOut,
  CalendarHeart,
  CalendarCheck,
  FileSpreadsheet,
  FileChartLine,
  CalendarCog,
  FileClock,
  FolderGit2,
  ContactRound,
  FolderKey,
  Folders
} from "lucide-react";

export function Sidebar() {
  const [openMenus, setOpenMenus] = useState({});
  const { logout } = useAuth();
  const userRole = localStorage.getItem("user_name");
  const [userimage, setUserimage] = useState(
  localStorage.getItem("profile_image_base64") || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'
);
  const username = localStorage.getItem("name");

useEffect(() => {
  const storedImage = localStorage.getItem("profile_image_base64");
  if (storedImage) {
    setUserimage(storedImage);
    // console.log("helooo i am wigth pic",storedImage);
  }
}, []);



  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const menuItems = {
    [Roles.ADMIN]: [
      { name: "Dashboard", path: "/admin/dashboard" },
      { name: "employee Management", path: "/admin/users" },
    ],
    [Roles.SUPER_ADMIN]: [
      { name: "Dashboard", path: "/superadmin/dashboard", icon: <House /> },
      { name: "Roles", path: "/superadmin/roles", icon: <UserCog /> },
      { name: "Team", path: "/superadmin/team", icon: <Users /> },
      { name: "employee Management", path: "/superadmin/users", icon: <User /> },
      { name: "Clients", path: "/superadmin/clients", icon: <Handshake /> },
      { name: "Projects", path: "/superadmin/projects", icon: <FolderOpenDot />, },
      { name: "Projects Assigned", path: "/superadmin/assigned-projects", icon: <FileSpreadsheet />, },
      { name: "Manage Sheets", path: "/superadmin/Manage-sheets", icon: <FileChartLine /> },
      { name: "Manage Leaves", path: "/superadmin/manage-leaves", icon: <CalendarCog /> },
      { name: "Activity Tags", path: "/superadmin/activity-tags", icon: <FileChartLine /> },
      // { name: "Theme", path: "/superadmin/theme", icon: <FileChartLine /> },
    ],
    [Roles.BD]: [
      { name: "Dashboard", path: "/billingmanager/dashboard", icon: <House /> },
      { name: "Clients", path: "/billingmanager/clients", icon: <Handshake /> },
      { name: "Projects", path: "/billingmanager/projects", icon: <Folders/> },
      { name: "Teams", path: "/billingmanager/teams", icon: <Users /> },
      { name: "employee Management", path: "/billingmanager/users", icon: <User /> },

      { name: "Project Assigned", path: "/billingmanager/projects-assigned", icon: <FileSpreadsheet />  },
      { name: "Manage Sheets", path: "/billingmanager/Manage-sheets", icon: <FileChartLine />},
      { name: "Leaves", path: "/billingmanager/leaves",icon: <CalendarHeart />  },

    ],
    [Roles.HR]: [
      { name: "Dashboard", path: "/hr/dashboard", icon: <House /> },
      { name: "Employee Management", path: "/hr/employees", icon: <ContactRound /> },
      { name: "Leave Management", path: "/hr/leaves",icon: <CalendarCheck /> },
      { name: "Teams", path: "/hr/teams", icon: <Users /> },
      
      // { name: "Accessory category", path: "/hr/accessory/category",icon: <CalendarCheck /> },
      // { name: "Accessories assign", path: "/hr/accessories/assign",icon: <CalendarCheck /> },
    ],
    [Roles.PM]: [
      { name: "Dashboard", path: "/projectmanager/dashboard", icon: <House /> },
      { name: "Projects Assigned", path: "/projectmanager/assigned", icon: <FileSpreadsheet /> },
      { name: "Project Management", path: "/projectmanager/assign", icon: <FolderGit2 /> },
      { name: "Performance Sheets", path: "/projectmanager/performance-sheets", icon: <FileChartLine /> },
      { name: "Manage Leaves", path: "/projectmanager/manage-leaves", icon: <CalendarCog /> },
                  { name: "Leaves", path: "/projectmanager/leaves",icon: <CalendarHeart />  },

    ],
     [Roles.TL]: [
      { name: "Dashboard", path: "/tl/dashboard", icon: <House /> },
      { name: "Projects Assigned", path: "/tl/assigned", icon: <FileSpreadsheet /> },
      { name: "Project Management", path: "/tl/assign", icon: <FolderGit2 /> },
      { name: "Performance Sheets", path: "/tl/performance-sheets", icon: <FileChartLine /> },
      { name: "Manage Leaves", path: "/tl/manage-leaves", icon: <CalendarCog /> },
            { name: "Leaves", path: "/tl/leaves",icon: <CalendarHeart />  },

    ],
    [Roles.TEAM]: [
      { name: "Dashboard", path: "/team/dashboard", icon: <House /> },
      { name: "Projects Assigned", path: "/team/projects-assigned", icon: <FileSpreadsheet /> },
      { name: "Performance Sheet", path: "/team/performance-sheet", icon: <FileChartLine /> },
      { name: "Performance History", path: "/team/performance-sheet-History", icon: <FileClock /> },
      // { name: "Accessory", path: "/team/accessory",icon: <CalendarHeart />  },
      { name: "Leaves", path: "/team/leaves",icon: <CalendarHeart />  },
    ],
  };
  const toggleMenu = (path) => {
    setOpenMenus((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };
  return (
<aside className={`bg-white shadow-lg fixed left-0 top-0 h-full w-72 z-10 rounded-xl transition-transform duration-300 border border-gray-200 flex flex-col my-2.5 mx-1.5
    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} xl:translate-x-0`}>
  {/* Header */}
  <div className="relative flex items-center py-4 px-4 text-center border-b border-gray-200">
    <Link to={
      userRole === 'superadmin' ? '/superadmin/profile' :
      userRole === 'team' ? '/team/profile' :
      userRole === 'admin' ? '/admin/profile' :
      userRole === 'hr' ? '/hr/profile' :
      userRole === 'billingmanager' ? '/billingmanager/profile' :
      userRole === 'projectmanager' ? '/projectmanager/profile' :
      userRole === 'tl' ? '/tl/profile' :
      '/profile'
    }>
      <img className="rounded-3xl h-14 w-14 mx-2.5" src={userimage} alt="" />
    </Link>

    <h2 className="text-sm font-semibold text-gray-700 capitalize">
      Welcome, {username}
    </h2>
    <button
      onClick={() => setIsSidebarOpen(false)}
      className="absolute right-2 top-4 p-2 rounded focus:outline-none xl:hidden"
    >
      <XMarkIcon className="h-5 w-5 text-gray-700" />
    </button>

    
  </div>

  {/* Scrollable Menu */}
  <div className="flex-1 overflow-y-auto m-2">
    <ul className="flex flex-col gap-2">
      {menuItems[userRole]?.map(({ name, path, icon, children }) => (
        <li key={path}>
          {children ? (
            <button
              onClick={() => toggleMenu(path)}
              className="flex items-center justify-between w-full px-4 py-2 rounded-lg transition-colors font-medium capitalize text-left text-gray-700 hover:bg-gray-100"
            >
              <span>{name}</span>
              <ChevronDownIcon
                className={`h-5 w-5 text-gray-500 transition-transform ${
                  openMenus[path] ? "rotate-180" : ""
                }`}
              />
            </button>
          ) : (
            <NavLink
              to={path}
              className={({ isActive }) =>
                `block px-4 py-2 rounded-lg transition-colors text-gray-600 font-medium capitalize gap-2 flex flex-row ${
                  isActive ? "bg-blue-600 text-white" : "hover:bg-gray-100"
                }`
              }
            >
              {icon}
              {name}
            </NavLink>
          )}
          {children && (
            <ul
              className={`ml-4 mt-1 bg-gray-50 rounded-lg shadow-inner border-l border-gray-300 pl-4 transition-all duration-300 overflow-hidden ${
                openMenus[path]
                  ? "max-h-screen opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              {children.map(({ name, path }) => (
                <li key={path}>
                  <NavLink
                    to={path}
                    className={({ isActive }) =>
                      `block px-4 py-2 rounded-lg transition-colors text-gray-600 font-medium capitalize ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : "hover:bg-gray-100"
                      }`
                    }
                  >
                    {name}
                  </NavLink>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  </div>

  {/* Logout button (sticky bottom) */}
  <div className="mx-2 my-4">
    <button
      onClick={logout}
      className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg transition-colors font-medium capitalize text-gray-700 hover:bg-gray-100"
    >
      <LogOut />
      LogOut
    </button>
  </div>
</aside>

  );
}
Sidebar.propTypes = {
  user: PropTypes.object,
};
export default Sidebar;