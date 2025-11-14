import PropTypes from "prop-types";
import { Link, NavLink } from "react-router-dom";
import { useState ,useEffect } from "react";
import { XMarkIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";
import { Roles } from "../utils/roles";
import defaultpic from "../aasests/default.png"
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

export function Sidebar({ isSidebarOpen, setIsSidebarOpen }) {
    const [openMenus, setOpenMenus] = useState({});
  const { logout } = useAuth();
  const userRole = localStorage.getItem("user_name");
const [userimage, setUserimage] = useState(defaultpic);
  const username = localStorage.getItem("name");
useEffect(() => {
  const storedImage = localStorage.getItem("profile_image_base64");
  console.log("Stored profile image in localStorage:", storedImage);

  if (storedImage && storedImage !== "null" && storedImage !== "undefined") {
    // If it's a valid URL (starts with http or https)
    if (storedImage.startsWith("http")) {
      setUserimage(storedImage);
    }
    // If it's Base64 without prefix
    else if (storedImage.startsWith("data:image")) {
      setUserimage(storedImage);
    } else {
      setUserimage(`data:image/png;base64,${storedImage}`);
    }
  } else {
    setUserimage(defaultpic);
  }
}, []);


const handleClearCache = async () => {
  try {
    const token = localStorage.getItem('userToken'); 

    const response = await fetch('https://epm.techarchsoftwares.com/api/api/clearCache?key=mySuperSecretKey123', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      alert('Cache cleared successfully!');
      window.location.reload();
    } else {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      alert('Failed to clear cache.');
    }
  } catch (error) {
    console.error('Error clearing cache:', error);
    alert('An error occurred while clearing cache.');
  }
};







  // const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const menuItems = {
    [Roles.ADMIN]: [
      { name: "Dashboard", path: "/admin/dashboard" },
      { name: "employee Management", path: "/admin/users" },
    ],
    [Roles.SUPER_ADMIN]: [
      { name: "Dashboard", path: "/superadmin/dashboard", icon: <House /> },
      { name: "Roles", path: "/superadmin/roles", icon: <UserCog /> },
      { name: "department", path: "/superadmin/department", icon: <UserCog /> },
      { name: "Team", path: "/superadmin/team", icon: <Users /> },
      { name: "Employee Management", path: "/superadmin/users", icon: <User /> },
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
             { name: "Teams", path: "/projectmanager/teams", icon: <Users /> },

      { name: "Projects Assigned", path: "/projectmanager/assigned", icon: <FileSpreadsheet /> },
      { name: "Project Management", path: "/projectmanager/assign", icon: <FolderGit2 /> },
      { name: "Performance Sheets", path: "/projectmanager/performance-sheets", icon: <FileChartLine /> },
      { name: "Manage Leaves", path: "/projectmanager/manage-leaves", icon: <CalendarCog /> },
      { name: "Leaves", path: "/projectmanager/leaves",icon: <CalendarHeart />  },

    ],
     [Roles.TL]: [
      { name: "Dashboard", path: "/tl/dashboard", icon: <House /> },
       { name: "Teams", path: "/tl/teams", icon: <Users /> },
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
<aside
  className={`bg-white shadow-lg fixed left-0 top-0  h-full z-[10] overflow-hidden border border-gray-200 flex flex-col my-2.5 mx-1.5 rounded-xl ${
    isSidebarOpen ? "w-72" : "w-20"
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
    >
      <img
        className="rounded-3xl h-12 w-12"
        src={userimage}
        alt=""
        onError={(e) => {
          e.target.src = defaultpic;
        }}
      />
      {isSidebarOpen && (
        <h2 className="text-sm font-semibold text-gray-700 capitalize whitespace-nowrap">
          Welcome, {username}
        </h2>
      )}
    </Link>

    <button
      onClick={() => setIsSidebarOpen(false)}
      className="absolute right-2 top-4 p-2 rounded focus:outline-none xl:hidden"
    >
      <XMarkIcon className="h-5 w-5 text-gray-700" />
    </button>
  </div>

  {/* Scrollable Menu */}
  <div className="flex-1 overflow-y-auto mt-2">
    <ul className="flex flex-col gap-1">
      {menuItems[userRole]?.map(({ name, path, icon, children }) => (
        <li key={path}>
          {children ? (
            <button
              onClick={() => toggleMenu(path)}
              className={`flex items-center justify-between w-full rounded-lg transition-colors font-medium text-left text-gray-700 hover:bg-gray-100 ${
                isSidebarOpen ? "px-4 py-2" : "px-2 py-3 justify-center"
              }`}
            >
              <div className="flex items-center gap-2">
                {icon}
                {isSidebarOpen && <span>{name}</span>}
              </div>
              {isSidebarOpen && (
                <ChevronDownIcon
                  className={`h-5 w-5 text-gray-500 transition-transform ${
                    openMenus[path] ? "rotate-180" : ""
                  }`}
                />
              )}
            </button>
          ) : (
            <NavLink
              to={path}
              className={({ isActive }) =>
                `flex items-center ${
                  isSidebarOpen ? "px-4 py-2 gap-2" : "px-2 py-3 justify-center"
                } rounded-lg transition-colors text-gray-600 font-medium ${
                  isActive ? "bg-blue-600 text-white" : "hover:bg-gray-100"
                }`
              }
              title={!isSidebarOpen ? name : ""}
            >
              {icon}
              {isSidebarOpen && <span>{name}</span>}
            </NavLink>
          )}

          {/* Submenu */}
          {children && isSidebarOpen && (
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

  {/* Footer */}
  {isSidebarOpen ? (
    <>
      {userRole === "superadmin" && (
        <div className="mx-2 mb-2">
          <button
            onClick={handleClearCache}
            className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg transition-colors font-medium capitalize text-gray-700 hover:bg-gray-100"
          >
            🧹 Clear Cache
          </button>
        </div>
      )}

      <div className="mx-2 my-4">
        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg transition-colors font-medium capitalize text-gray-700 hover:bg-gray-100"
        >
          <LogOut />
          LogOut
        </button>
      </div>
    </>
  ) : (
    <div className="flex flex-col items-center py-4 gap-4">
      {userRole === "superadmin" && (
        <button
          onClick={handleClearCache}
          className="p-2 rounded-lg hover:bg-gray-100"
          title="Clear Cache"
        >
          🧹
        </button>
      )}
      <button
        onClick={logout}
        className="p-2 rounded-lg hover:bg-gray-100"
        title="Logout"
      >
        <LogOut />
      </button>
    </div>
  )}
</aside>


  );
}
Sidebar.propTypes = {
  user: PropTypes.object,
  isSidebarOpen: PropTypes.bool.isRequired,
  setIsSidebarOpen: PropTypes.func.isRequired,
};

export default Sidebar;
