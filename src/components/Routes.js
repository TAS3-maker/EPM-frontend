import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { Pendingsheets } from "./pages/bd/Managesheets/Pendingsheets";
import OfflineHours from "./pages/bd/Managesheets/OfflineHours";
import { AlertProvider } from "./context/AlertContext";
import { useLocation } from "react-router-dom";
import AdminDashboard from "./pages/admin/AdminDashboard";
// import ManageAdmins from "./pages/superadmin/ManageAdmins";
import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";
import HrDashboard from "./pages/hr/HrDashboard";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import UserManagement from "./pages/admin/UserManagement";
import { LeaveManagement } from "./pages/hr/LeaveManagement";
// import Profile from "./pages/employee/Profile";
import { Roleelements } from "./pages/superadmin/Roles/Roleelements";
import PermissionsManagement from "./pages/superadmin/Permission/Permissions.jsx";
import ReportingManagement from "./pages/superadmin/Reporting/Reporting.jsx";
import SheetReporting from "./pages/superadmin/Reporting/SheetReporting";
import SheetTeamData from "./pages/superadmin/Reporting/UserSheetReporting";
import LeaveReporting from "./pages/superadmin/Reporting/LeaveReporting";
import TeamData from "./pages/superadmin/Reporting/User.jsx";
import { Departmentelements } from "./pages/superadmin/department/Departmentelements";
import { Teamelement } from "./pages/superadmin/Teams/Teamelement";
import { Clientelements } from "./pages/superadmin/Clients/Clientelements";
import { Employeelayout } from "./pages/superadmin/employee/Employeelayout";
import { Projectelements } from "./pages/superadmin/Projects/Projectelements";
import { ProjectDetail } from "./pages/superadmin/Projects/ProjectDetail";
import { Projectelementsbd } from "./pages/bd/Projects/Projectelementsbd";
import { Clientelementsbd } from "./pages/bd/Clients/Clientelementsbd";
import { AuthProvider } from "./context/AuthContext";
import BDDashboard from "./pages/bd/BDDashboard";
import { BDTeamelement } from "./pages/bd/Teams/BDTeamelement";
import { Assignedelement } from "./pages/bd/Projects_assigned/Assignedelement";
import { PMassignedelement } from "./pages/Pm/Projectmanagement/PMassignedelement";
import { TLassignedelement } from "./pages/Tl/Projectmanagement/TLassignedelement";
import { AssignelementPM } from "./pages/Pm/PMmanagement/AssignelementPM";
import { AssignelementTL } from "./pages/Tl/TLmanagement/AssignelementTL";
import Addsheet from "./pages/employee/Sheet/Addsheet";
import LeaveForm from "./pages/employee/Leaves/LeaveForm";
import { UserProvider } from "./context/UserContext";
import { EmpSheetHistory } from "./pages/employee/Sheet/EmpSheetHistory";
import { Managesheets } from "./pages/bd/Managesheets/Managesheets";
import { BDProjectsAssignedProvider } from "./context/BDProjectsassigned";
import { Sheet } from "./pages/Pm/PMsheet/Sheet.jsx";
import { PMProvider } from "./context/PMContext";
import Empprojects from "./pages/employee/Empprojects/Empprojects";
import { LeaveProvider } from "./context/LeaveContext";
import { PMleaves } from "./pages/Pm/PMleaves/PMleaves";
import Task from "./pages/Pm/Tasks/Task";
import { TaskProvider } from "./context/TaskContext";
import Emptask from "./pages/employee/Emptask/Emptask";
import { Activityelement } from "./pages/superadmin/Activitytask/Activityelement";
import EmployeeDetail from "./pages/superadmin/employee/EmployeeDetail";
import EmployeeDetailMain from "./pages/superadmin/employeedetail/EmployeeDetailMain";
import ProjectManagerDashboard from "./pages/Pm/ProjectManagerDashboard";
import TeamleaderDashboard from "./pages/Tl/TeamleaderDashboard";
import { Accessoryelements } from "./pages/hr/Accessories/Accessoryelements";
import { AssignAccessoryelements } from "./pages/hr/AssignAccessory/AssignAccessoryelements";
// import AddAccessories from "./pages/hr/Accessories/AddAccessories";
// import {Accessorytable} from "./pages/hr/Accessories/Accessorytable";
// import {Category} from "./pages/hr/Categories/Category";
import { CategoryProvider } from "./context/CategoryContext";
import { AccessoryProvider } from "./context/AccessoryContext";
import { PreviousHistory } from "./pages/bd/Managesheets/PreviousHistory";
import { ProfileProvider } from "./context/ProfileContext";
import { EmployeeProvider } from "./context/EmployeeContext";
import { AssignAccessoryProvider } from "./context/AssignAccessoryContext";
import { Categoryelements } from "./pages/hr/Categories/Categoryelements";
import Accessory from "./pages/employee/Accessory/Accessory";
import Profile from "./pages/superadmin/Profile";
import { useNavigate } from "react-router-dom";
import NotFound from "./components/NotFound";
import { Performahistory } from "./pages/bd/Managesheets/Performahistory";
import ColorPalettePage from "./ui/widgets/layout/ColorPalettePage";
import { ImportProvider } from "./context/Importfiles.";
import { TLassign } from "./pages/Tl/TLmanagement/TLassign";
import { TLunassigned } from "./pages/Tl/TLmanagement/TLunassigned";
import { PMunassigned } from "./pages/Pm/PMmanagement/PMunassigned";
import { PMassign } from "./pages/Pm/PMmanagement/PMassign";
import RedirectToDashboard from "./components/RedirectToDashboard";
import Assignedtable from "./pages/bd/Projects_assigned/Assignedtable";
import NotAssignedTable from "./pages/bd/Projects_assigned/NotAssignedTable";
import { ClientMasterElement } from "./pages/superadmin/Clients/ClientMasterElement";
import { ProjectSourceMasterElement } from "./pages/superadmin/Projects/ProjectSourceMasterElement";
import { CommunicationMasterElement } from "./pages/superadmin/communication-type/CommunicationMasterElement";
import { AccountMasterElement } from "./pages/superadmin/account/AccountMasterElement";
import { ProjectsMasterElements } from "./pages/superadmin/Project-master/ProjestsMasterElements";
import { NotesManagementElement } from "./pages/superadmin/note-management/NotesManagementElement";
import { ProjectMasterProvider } from "./context/ProjectMasterContext";
import { BDTeamProvider } from "./context/BDTeamContext";
import { TLProvider } from "./context/TLContext";
import RoleSwitchModal from "./components/RoleSwitchModal";
import { usePermissions } from "./context/PermissionContext";
import ClientData from "./pages/superadmin/Clients/ClientData";
// import { BDProjectsAssignedProvider } from "./context/BDProjectsassigned";
// import { DepartmentProvider } from "./context/DepartmentContext";
// import { PMProvider } from "./context/PMContext";
// import EmployeeDetailHrEmployeeDetail from "./pages/hr/Employee/HrEmployeeDetail";
import { useRef } from "react";
import Standup from "./pages/bd/Managesheets/Standup";
import UserSheetReportingSub from "./pages/superadmin/Reporting/UserSheetReportingSub";
import { useRole } from "./context/RoleContext";
// import { Navigate } from "react-router-dom";

const RoleBasedRoute = ({ element, allowedRoles, requiredPermission }) => {
  const { permissions, isLoading, hasPermission } = usePermissions();

  const accessGrantedRef = useRef(false);

  const raw = localStorage.getItem("userData");
  if (!raw) {
    return <Navigate to="/" replace />;
  }

  const userRole = (localStorage.getItem("user_name") || "")
    .toLowerCase()
    .replace(/\s+/g, "");

  const allowed = allowedRoles.map((r) => r.toLowerCase().replace(/\s+/g, ""));

  const roleOk = allowed.includes(userRole);
  const permOk =
    !requiredPermission || hasPermission(permissions, requiredPermission);

  // ✅ FIRST TIME ACCESS CHECK
  if (!accessGrantedRef.current) {
    if (isLoading) {
      return element; // ⛔ never block during loading
    }

    if (!roleOk) {
      return <Navigate to="/unauthorized" replace />;
    }

    if (!permOk) {
      return <Navigate to="/" replace />;
    }

    // 🔒 Lock access forever for this route instance
    accessGrantedRef.current = true;
  }

  // ✅ Once granted → NEVER redirect again
  return element;
};

const AppRoutes = () => {
  const [role, setRole] = useState(localStorage.getItem("user_name") || "");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation(); // Get current route
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { permissions, hasP } = usePermissions();
     const { showRoleModal } = useRole();
  // const hideSidebarRoutes = ["/"]; // Add more public routes if needed
  // const shouldShowSidebar = !hideSidebarRoutes.includes(location.pathname);

  // console.log("role 1212121221",role);
  const hideSidebarRoutes = ["/"]; // Add more public routes if needed
  const hasRole = !!localStorage.getItem("user_name"); // Check if any role is present
  const shouldShowSidebar =
    !hideSidebarRoutes.includes(location.pathname) && hasRole;

  return (
    // <AlertProvider>
    <AuthProvider>
      <ImportProvider>
        <div className="relative flex">
          {/* 👇 Always on top of everything */}
          {/* 👇 Sidebar Toggle Button (Top Left) */}
          {shouldShowSidebar && (
            <button
              type="button"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`fixed top-4 left-0 z-[10] bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-500 border border-gray-300 shadow-md rounded-r-lg p-2  transition-all duration-300 ${
                isSidebarOpen ? "ml-72" : "ml-0 sm:ml-20"
              }`}
            >
              {isSidebarOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="white"
                  className="w-6 h-6 text-white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 19.5L8.25 12l7.5-7.5"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="white"
                  className="w-6 h-6 text-white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                  />
                </svg>
              )}
            </button>
          )}

          {/* 👇 Sidebar */}
          {shouldShowSidebar && (
            <Sidebar
              isSidebarOpen={isSidebarOpen}
              setIsSidebarOpen={setIsSidebarOpen}
            />
          )}

          {/* 👇 Overlay (click to close on mobile) */}
          {isSidebarOpen && (
            <div className="" onClick={() => setIsSidebarOpen(false)} />
          )}

          {/* 👇 Main content */}
          <div
            className={`overflow-hidden flex-1 ${
              shouldShowSidebar && isSidebarOpen ? "ml-72" : "ml-0 sm:ml-24"
            } py-2.5 px-4`}
          >
            <Routes>
              <Route
                path="/superadmin/dashboard"
                element={
                  <RoleBasedRoute
                    element={<SuperAdminDashboard />}
                    allowedRoles={["superadmin"]}
                  />
                }
              />

              <Route
                path="/superadmin/profile"
                element={
                  <RoleBasedRoute
                    allowedRoles={["superadmin"]}
                    element={
                      <EmployeeProvider>
                        <ProfileProvider>
                          <Profile />
                        </ProfileProvider>
                      </EmployeeProvider>
                    }
                  />
                }
              />

              <Route
                path="/salesperson/profile"
                element={
                  <RoleBasedRoute
                    allowedRoles={["salesperson"]}
                    element={
                      <EmployeeProvider>
                        <ProfileProvider>
                          <Profile />
                        </ProfileProvider>
                      </EmployeeProvider>
                    }
                  />
                }
              />

              <Route
                path="/admin/profile"
                element={
                  <RoleBasedRoute
                    allowedRoles={["admin"]}
                    element={
                      <EmployeeProvider>
                        <ProfileProvider>
                          <Profile />
                        </ProfileProvider>
                      </EmployeeProvider>
                    }
                  />
                }
              />
              <Route
                path="/admin/permission"
                element={
                  <RoleBasedRoute
                    element={<PermissionsManagement />}
                    allowedRoles={["admin"]}
                    requiredPermission="permission"
                  />
                }
              />
              <Route
                path="/hr/permission"
                element={
                  <RoleBasedRoute
                    element={<PermissionsManagement />}
                    allowedRoles={["hr"]}
                    requiredPermission="permission"
                  />
                }
              />
              <Route
                path="/billingmanager/permission"
                element={
                  <RoleBasedRoute
                    element={<PermissionsManagement />}
                    allowedRoles={["billingmanager"]}
                    requiredPermission="permission"
                  />
                }
              />
              <Route
                path="/projectmanager/permission"
                element={
                  <RoleBasedRoute
                    element={<PermissionsManagement />}
                    allowedRoles={["projectmanager"]}
                    requiredPermission="permission"
                  />
                }
              />
              <Route
                path="/tl/permission"
                element={
                  <RoleBasedRoute
                    element={<PermissionsManagement />}
                    allowedRoles={["tl"]}
                    requiredPermission="permission"
                  />
                }
              />
              <Route
                path="/salesperson/permission"
                element={
                  <RoleBasedRoute
                    element={<PermissionsManagement />}
                    allowedRoles={["salesperson"]}
                    requiredPermission="permission"
                  />
                }
              />
              <Route
                path="/team/permission"
                element={
                  <RoleBasedRoute
                    element={<PermissionsManagement />}
                    allowedRoles={["team"]}
                    requiredPermission="permission"
                  />
                }
              />

              <Route
                path="/superadmin/roles"
                element={
                  <RoleBasedRoute
                    element={<Roleelements />}
                    allowedRoles={["superadmin"]}
                    requiredPermission="roles"
                  />
                }
              />
              <Route
                path="/superadmin/permission"
                element={
                  <RoleBasedRoute
                    element={<PermissionsManagement />}
                    allowedRoles={["superadmin"]}
                    requiredPermission="permission"
                  />
                }
              />
              <Route
                path="/superadmin/reporting"
                element={
                  <RoleBasedRoute
                    element={<ReportingManagement />}
                    allowedRoles={["superadmin"]}
                  />
                }
              />

              <Route
                path="/superadmin/reporting/team-data/:teamName"
                element={
                  <RoleBasedRoute
                    element={<TeamData />}
                    allowedRoles={["superadmin"]}
                  />
                }
              />

              <Route
                path="/superadmin/Sheet-reporting"
                element={
                  <RoleBasedRoute
                    element={<SheetReporting />}
                    allowedRoles={["superadmin"]}
                  />
                }
              />

              <Route
                path="/superadmin/Sheet-reporting/team-data/:teamName"
                element={
                  <RoleBasedRoute
                    element={<SheetTeamData />}
                    allowedRoles={["superadmin"]}
                  />
                }
              />
               <Route
                path="/superadmin/user-sheets/:id"
                element={
                  <RoleBasedRoute
                    element={<UserSheetReportingSub />}
                    allowedRoles={["superadmin"]}
                
                  />
                }
              />
              <Route
                path="/admin/Sheet-reporting"
                element={
                  <RoleBasedRoute
                    element={<SheetReporting />}
                    allowedRoles={["admin"]}
                  />
                }
              />

              <Route
                path="/admin/Sheet-reporting/team-data/:teamName"
                element={
                  <RoleBasedRoute
                    element={<SheetTeamData />}
                    allowedRoles={["admin"]}
                  />
                }
              />
               <Route
                path="/admin/user-sheets/:id"
                element={
                  <RoleBasedRoute
                    element={<UserSheetReportingSub />}
                    allowedRoles={["admin"]}
                
                  />
                }
              />
              <Route
                path="/tl/Sheet-reporting"
                element={
                  <RoleBasedRoute
                    element={<SheetReporting />}
                    allowedRoles={["tl"]}
                  />
                }
              />

              <Route
                path="/tl/Sheet-reporting/team-data/:teamName"
                element={
                  <RoleBasedRoute
                    element={<SheetTeamData />}
                    allowedRoles={["tl"]}
                  />
                }
              />
               <Route
                path="/tl/user-sheets/:id"
                element={
                  <RoleBasedRoute
                    element={<UserSheetReportingSub />}
                    allowedRoles={["tl"]}
                
                  />
                }
              />
              <Route
                path="/projectmanager/Sheet-reporting"
                element={
                  <RoleBasedRoute
                    element={<SheetReporting />}
                    allowedRoles={["projectmanager"]}
                  />
                }
              />

              <Route
                path="/projectmanager/Sheet-reporting/team-data/:teamName"
                element={
                  <RoleBasedRoute
                    element={<SheetTeamData />}
                    allowedRoles={["projectmanager"]}
                  />
                }
              />
               <Route
                path="/projectmanager/user-sheets/:id"
                element={
                  <RoleBasedRoute
                    element={<UserSheetReportingSub />}
                    allowedRoles={["projectmanager"]}
                
                  />
                }
              />
              <Route
                path="/billingmanager/Sheet-reporting"
                element={
                  <RoleBasedRoute
                    element={<SheetReporting />}
                    allowedRoles={["billingmanager"]}
                  />
                }
              />

              <Route
                path="/billingmanager/Sheet-reporting/team-data/:teamName"
                element={
                  <RoleBasedRoute
                    element={<SheetTeamData />}
                    allowedRoles={["billingmanager"]}
                  />
                }
              />
               <Route
                path="/billingmanager/user-sheets/:id"
                element={
                  <RoleBasedRoute
                    element={<UserSheetReportingSub />}
                    allowedRoles={["billingmanager"]}
                
                  />
                }
              />
              <Route
                path="/team/Sheet-reporting"
                element={
                  <RoleBasedRoute
                    element={<SheetReporting />}
                    allowedRoles={["team"]}
                  />
                }
              />

              <Route
                path="/team/Sheet-reporting/team-data/:teamName"
                element={
                  <RoleBasedRoute
                    element={<SheetTeamData />}
                    allowedRoles={["team"]}
                  />
                }
              />
               <Route
                path="/team/user-sheets/:id"
                element={
                  <RoleBasedRoute
                    element={<UserSheetReportingSub />}
                    allowedRoles={["team"]}
                
                  />
                }
              />

              <Route
                path="/superadmin/leave-reporting"
                element={
                  <LeaveProvider>
                    <RoleBasedRoute
                      element={<LeaveReporting />}
                      allowedRoles={["superadmin"]}
                    />
                  </LeaveProvider>
                }
              />

              <Route
                path="/projectmanager/leave-reporting"
                element={
                  <LeaveProvider>
                    <RoleBasedRoute
                      element={<LeaveReporting />}
                      allowedRoles={["projectmanager"]}
                    />
                  </LeaveProvider>
                }
              />
              <Route
                path="/billingmanager/leave-reporting"
                element={
                  <LeaveProvider>
                    <RoleBasedRoute
                      element={<LeaveReporting />}
                      allowedRoles={["billingmanager"]}
                    />
                  </LeaveProvider>
                }
              />

              <Route
                path="/salesperson/leave-reporting"
                element={
                  <LeaveProvider>
                    <RoleBasedRoute
                      element={<LeaveReporting />}
                      allowedRoles={["salesperson"]}
                    />
                  </LeaveProvider>
                }
              />

              <Route
                path="/tl/leave-reporting"
                element={
                  <LeaveProvider>
                    <RoleBasedRoute
                      element={<LeaveReporting />}
                      allowedRoles={["tl"]}
                    />
                  </LeaveProvider>
                }
              />
              <Route
                path="/team/leave-reporting"
                element={
                  <LeaveProvider>
                    <RoleBasedRoute
                      element={<LeaveReporting />}
                      allowedRoles={["team"]}
                    />
                  </LeaveProvider>
                }
              />

              <Route
                path="/admin/reporting/team-data/:teamName"
                element={
                  <RoleBasedRoute
                    element={<TeamData />}
                    allowedRoles={["admin"]}
                  />
                }
              />
              <Route
                path="/hr/reporting/team-data/:teamName"
                element={
                  <RoleBasedRoute
                    element={<TeamData />}
                    allowedRoles={["hr"]}
                  />
                }
              />
              <Route
                path="/billingmanager/reporting/team-data/:teamName"
                element={
                  <RoleBasedRoute
                    element={<TeamData />}
                    allowedRoles={["billingmanager"]}
                  />
                }
              />
              <Route
                path="/projectmanager/reporting/team-data/:teamName"
                element={
                  <RoleBasedRoute
                    element={<TeamData />}
                    allowedRoles={["projectmanager"]}
                  />
                }
              />
              <Route
                path="/tl/reporting/team-data/:teamName"
                element={
                  <RoleBasedRoute
                    element={<TeamData />}
                    allowedRoles={["tl"]}
                  />
                }
              />

              <Route
                path="/team/reporting/team-data/:teamName"
                element={
                  <RoleBasedRoute
                    element={<TeamData />}
                    allowedRoles={["team"]}
                  />
                }
              />

              <Route
                path="/salesperson/reporting/team-data/:teamName"
                element={
                  <RoleBasedRoute
                    element={<TeamData />}
                    allowedRoles={["salesperson"]}
                  />
                }
              />

              <Route
                path="/superadmin/department"
                element={
                  <RoleBasedRoute
                    element={<Departmentelements />}
                    allowedRoles={["superadmin"]}
                    requiredPermission="department"
                  />
                }
              />
              <Route
                path="/superadmin/activity-tags"
                element={
                  <RoleBasedRoute
                    element={<Activityelement />}
                    allowedRoles={["superadmin"]}
                    requiredPermission="activity_tags"
                  />
                }
              />
              <Route
                path="/superadmin/users"
                element={
                  <RoleBasedRoute
                    element={<Employeelayout />}
                    allowedRoles={["superadmin"]}
                    requiredPermission="employee_management"
                  />
                }
              />
              <Route
                path="/superadmin/performance-sheet"
                element={
                  <UserProvider>
                    <BDProjectsAssignedProvider>
                      <RoleBasedRoute
                        element={<Addsheet />}
                        allowedRoles={["superadmin"]}
                      />
                    </BDProjectsAssignedProvider>
                  </UserProvider>
                }
              />

              {/* <Route
             path="/superadmin/manage-leaves"
            element={
              <LeaveProvider>
                <RoleBasedRoute element={<PMleaves/>} allowedRoles={["superadmin"]} />
                </LeaveProvider>
            }
          /> */}

              <Route
                path="/superadmin/Manage-sheets"
                element={
                  <PMProvider>
                    <BDProjectsAssignedProvider>
                      <RoleBasedRoute
                        element={<Managesheets />}
                        allowedRoles={["superadmin"]}
                        requiredPermission="manage_sheets_inside_performance_sheets"
                      />
                    </BDProjectsAssignedProvider>
                  </PMProvider>
                }
              />
              <Route
                path="/superadmin/previous-sheets"
                element={
                  <PMProvider>
                    <BDProjectsAssignedProvider>
                      <RoleBasedRoute
                        element={<PreviousHistory />}
                        allowedRoles={["superadmin"]}
                        requiredPermission="previous_sheets"
                      />
                    </BDProjectsAssignedProvider>
                  </PMProvider>
                }
              />
              <Route
                path="/superadmin/Manage-sheets-History"
                element={
                  <PMProvider>
                    <BDProjectsAssignedProvider>
                      <RoleBasedRoute
                        element={<Performahistory />}
                        allowedRoles={["superadmin"]}
                        requiredPermission="unfilled_sheets_inside_performance_sheets"
                      />
                    </BDProjectsAssignedProvider>
                  </PMProvider>
                }
              />

              <Route
                path="/superadmin/Pending-sheets"
                element={
                  <PMProvider>
                    <BDProjectsAssignedProvider>
                      <RoleBasedRoute
                        element={<Pendingsheets />}
                        allowedRoles={["superadmin"]}
                        requiredPermission="pending_sheets_inside_performance_sheets"
                      />
                    </BDProjectsAssignedProvider>
                  </PMProvider>
                }
              />
              <Route
                path="/superadmin/previous-sheet"
                element={
                  <PMProvider>
                    <BDProjectsAssignedProvider>
                      <RoleBasedRoute
                        element={<PreviousHistory />}
                        allowedRoles={["superadmin"]}
                        requiredPermission="pending_sheets_inside_performance_sheets"
                      />
                    </BDProjectsAssignedProvider>
                  </PMProvider>
                }
              />

              <Route
                path="/superadmin/theme"
                element={
                  <RoleBasedRoute
                    element={<ColorPalettePage />}
                    allowedRoles={["superadmin"]}
                  />
                }
              />

              <Route
                path="/superadmin/team"
                element={
                  <RoleBasedRoute
                    element={<Teamelement />}
                    allowedRoles={["superadmin"]}
                    requiredPermission="team"
                  />
                }
              />

              <Route
                path="/superadmin/clients"
                element={
                  <RoleBasedRoute
                    element={<ClientMasterElement />}
                    allowedRoles={["superadmin"]}
                    requiredPermission="clients"
                  />
                }
              />
              <Route
                path="/projectmanager/clients/client-data/:client_id"
                element={
                  <RoleBasedRoute
                    element={<ClientData />}
                    allowedRoles={["projectmanager"]}
                    requiredPermission="clients"
                  />
                }
              />
              <Route
                path="/salesperson/clients/client-data/:client_id"
                element={
                  <RoleBasedRoute
                    element={<ClientData />}
                    allowedRoles={["salesperson"]}
                    requiredPermission="clients"
                  />
                }
              />

              <Route
                path="/superadmin/clients/client-data/:client_id"
                element={
                  <RoleBasedRoute
                    element={<ClientData />}
                    allowedRoles={["superadmin"]}
                    requiredPermission="clients"
                  />
                }
              />
              <Route
                path="/team/clients/client-data/:client_id"
                element={
                  <RoleBasedRoute
                    element={<ClientData />}
                    allowedRoles={["team"]}
                    requiredPermission="clients"
                  />
                }
              />
              <Route
                path="/tl/clients/client-data/:client_id"
                element={
                  <RoleBasedRoute
                    element={<ClientData />}
                    allowedRoles={["tl"]}
                    requiredPermission="clients"
                  />
                }
              />
              <Route
                path="/billingmanager/clients/client-data/:client_id"
                element={
                  <RoleBasedRoute
                    element={<ClientData />}
                    allowedRoles={["billingmanager"]}
                    requiredPermission="clients"
                  />
                }
              />

              <Route
                path="/superadmin/projects"
                element={
                  <RoleBasedRoute
                    element={<ProjectsMasterElements />}
                    allowedRoles={["superadmin"]}
                    requiredPermission="projects"
                  />
                }
              />
              <Route
                path="/superadmin/source-master"
                element={
                  <RoleBasedRoute
                    element={<ProjectSourceMasterElement />}
                    allowedRoles={["superadmin"]}
                    requiredPermission="project_source"
                  />
                }
              />

              <Route
                path="/superadmin/communication-type-master"
                element={
                  <RoleBasedRoute
                    element={<CommunicationMasterElement />}
                    allowedRoles={["superadmin"]}
                    requiredPermission="communication_type"
                  />
                }
              />

              <Route
                path="/superadmin/account-master"
                element={
                  <RoleBasedRoute
                    element={<AccountMasterElement />}
                    allowedRoles={["superadmin"]}
                    requiredPermission="account_master"
                  />
                }
              />

              <Route
                path="/salesperson/account-master"
                element={
                  <RoleBasedRoute
                    element={<AccountMasterElement />}
                    allowedRoles={["salesperson"]}
                    requiredPermission="account_master"
                  />
                }
              />
              <Route
                path="/salesperson/offline-hours"
                element={
                  <RoleBasedRoute
                    element={<OfflineHours />}
                    allowedRoles={["salesperson"]}
                    requiredPermission="communication_type"
                  />
                }
              />

              <Route
                path="/superadmin/offline-hours"
                element={
                  <RoleBasedRoute
                    element={<OfflineHours />}
                    allowedRoles={["superadmin"]}
                    requiredPermission="communication_type"
                  />
                }
              />
              <Route
                path="/projectmanager/offline-hours"
                element={
                  <RoleBasedRoute
                    element={<OfflineHours />}
                    allowedRoles={["projectmanager"]}
                    requiredPermission="communication_type"
                  />
                }
              />

              <Route
                path="/admin/dashboard"
                element={
                  <RoleBasedRoute
                    element={<SuperAdminDashboard />}
                    allowedRoles={["admin"]}
                  />
                }
              />

              <Route
                path="/admin/users"
                element={
                  <RoleBasedRoute
                    element={<Employeelayout />}
                    allowedRoles={["admin"]}
                    requiredPermission="employee_management"
                  />
                }
              />

              <Route
                path="/admin/roles"
                element={
                  <RoleBasedRoute
                    element={<Roleelements />}
                    allowedRoles={["admin"]}
                    requiredPermission="roles"
                  />
                }
              />

              <Route
                path="/admin/team"
                element={
                  <RoleBasedRoute
                    element={<Teamelement />}
                    allowedRoles={["admin"]}
                    requiredPermission="team"
                  />
                }
              />

              <Route
                path="/admin/teams"
                element={
                  <RoleBasedRoute
                    element={<BDTeamelement />}
                    allowedRoles={["admin"]}
                    requiredPermission="teams"
                  />
                }
              />

              <Route
                path="/admin/clients"
                element={
                  <RoleBasedRoute
                    element={<ClientMasterElement />}
                    allowedRoles={["admin"]}
                    requiredPermission="clients"
                  />
                }
              />
              <Route
                path="/admin/projects"
                element={
                  <RoleBasedRoute
                    element={<ProjectsMasterElements />}
                    allowedRoles={["admin"]}
                    requiredPermission="projects"
                  />
                }
              />
              <Route
                path="/admin/clients/client-data/:client_id"
                element={
                  <RoleBasedRoute
                    element={<ClientData />}
                    allowedRoles={["admin"]}
                    requiredPermission="clients"
                  />
                }
              />

              <Route
                path="/admin/activity-tags"
                element={
                  <RoleBasedRoute
                    element={<Activityelement />}
                    allowedRoles={["admin"]}
                    requiredPermission="activity_tags"
                  />
                }
              />

              <Route
                path="/admin/projects/tasks/:project_id"
                element={
                  <TaskProvider>
                    <BDProjectsAssignedProvider>
                      <TLProvider>
                        <PMProvider>
                          <ProjectMasterProvider>
                            <RoleBasedRoute
                              element={<Task />}
                              allowedRoles={["admin"]}
                              requiredPermission="projects"
                            />
                          </ProjectMasterProvider>
                        </PMProvider>
                      </TLProvider>
                    </BDProjectsAssignedProvider>
                  </TaskProvider>
                }
              />
              <Route
                path="/admin/source-master"
                element={
                  <RoleBasedRoute
                    element={<ProjectSourceMasterElement />}
                    allowedRoles={["admin"]}
                    requiredPermission="project_source"
                  />
                }
              />
              <Route
                path="/admin/communication-type-master"
                element={
                  <RoleBasedRoute
                    element={<CommunicationMasterElement />}
                    allowedRoles={["admin"]}
                    requiredPermission="communication_type"
                  />
                }
              />

              <Route
                path="/admin/account-master"
                element={
                  <RoleBasedRoute
                    element={<AccountMasterElement />}
                    allowedRoles={["admin"]}
                    requiredPermission="account_master"
                  />
                }
              />
              <Route
                path="/admin/notes-management"
                element={
                  <RoleBasedRoute
                    element={<NotesManagementElement />}
                    allowedRoles={["admin"]}
                    requiredPermission="notes_management"
                  />
                }
              />

              <Route
                path="/admin/Manage-sheets"
                element={
                  <PMProvider>
                    <BDProjectsAssignedProvider>
                      <RoleBasedRoute
                        element={<Managesheets />}
                        allowedRoles={["admin"]}
                        requiredPermission="manage_sheets_inside_performance_sheets"
                      />
                    </BDProjectsAssignedProvider>
                  </PMProvider>
                }
              />

              <Route
                path="/admin/previous-sheets"
                element={
                  <PMProvider>
                    <BDProjectsAssignedProvider>
                      <RoleBasedRoute
                        element={<PreviousHistory />}
                        allowedRoles={["admin"]}
                        requiredPermission="previous_sheets"
                      />
                    </BDProjectsAssignedProvider>
                  </PMProvider>
                }
              />

              <Route
                path="/admin/Manage-sheets-History"
                element={
                  <PMProvider>
                    <BDProjectsAssignedProvider>
                      <RoleBasedRoute
                        element={<Performahistory />}
                        allowedRoles={["admin"]}
                        requiredPermission="unfilled_sheets_inside_performance_sheets"
                      />
                    </BDProjectsAssignedProvider>
                  </PMProvider>
                }
              />

              <Route
                path="/admin/Pending-sheets"
                element={
                  <PMProvider>
                    <BDProjectsAssignedProvider>
                      <RoleBasedRoute
                        element={<Pendingsheets />}
                        allowedRoles={["admin"]}
                        requiredPermission="pending_sheets_inside_performance_sheets"
                      />
                    </BDProjectsAssignedProvider>
                  </PMProvider>
                }
              />

              <Route
                path="/admin/offline-hours"
                element={
                  <RoleBasedRoute
                    element={<OfflineHours />}
                    allowedRoles={["admin"]}
                    requiredPermission="communication_type"
                  />
                }
              />

              <Route
                path="/admin/leaves"
                element={
                  <EmployeeProvider>
                    <LeaveProvider>
                      <RoleBasedRoute
                        element={<LeaveManagement />}
                        allowedRoles={["admin"]}
                        requiredPermission="leave_management"
                      />
                    </LeaveProvider>
                  </EmployeeProvider>
                }
              />
              <Route
                path="/admin/reporting"
                element={
                  <RoleBasedRoute
                    element={<ReportingManagement />}
                    allowedRoles={["admin"]}
                  />
                }
              />

              <Route
                path="/admin/leave-reporting"
                element={
                  <LeaveProvider>
                    <RoleBasedRoute
                      element={<LeaveReporting />}
                      allowedRoles={["admin"]}
                    />
                  </LeaveProvider>
                }
              />
              <Route
                path="/admin/reporting/team-data/:teamName"
                element={
                  <RoleBasedRoute
                    element={<TeamData />}
                    allowedRoles={["admin"]}
                  />
                }
              />

              <Route
                path="/admin/users/:id"
                element={
                  <RoleBasedRoute
                    element={<EmployeeDetailMain />}
                    allowedRoles={["admin"]}
                    requiredPermission="employee_management"
                  />
                }
              />

              <Route
                path="/tl/offline-hours"
                element={
                  <RoleBasedRoute
                    element={<OfflineHours />}
                    allowedRoles={["tl"]}
                    requiredPermission="communication_type"
                  />
                }
              />
              <Route
                path="/team/offline-hours"
                element={
                  <RoleBasedRoute
                    element={<OfflineHours />}
                    allowedRoles={["team"]}
                    requiredPermission="communication_type"
                  />
                }
              />
              <Route
                path="/billingmanager/offline-hours"
                element={
                  <RoleBasedRoute
                    element={<OfflineHours />}
                    allowedRoles={["billingmanager"]}
                    requiredPermission="communication_type"
                  />
                }
              />
              <Route
                path="/hr/offline-hours"
                element={
                  <RoleBasedRoute
                    element={<OfflineHours />}
                    allowedRoles={["hr"]}
                    requiredPermission="communication_type"
                  />
                }
              />
              <Route
                path="/superadmin/notes-management"
                element={
                  <RoleBasedRoute
                    element={<NotesManagementElement />}
                    allowedRoles={["superadmin"]}
                    requiredPermission="notes_management"
                  />
                }
              />

              <Route
                path="/superadmin/standup-sheets"
                element={
                  <BDProjectsAssignedProvider>
                    <PMProvider>
                      <RoleBasedRoute
                        element={<Standup />}
                        allowedRoles={["superadmin"]}
                        requiredPermission="manage_sheets_inside_performance_sheets"
                      />
                    </PMProvider>
                  </BDProjectsAssignedProvider>
                }
              />

              <Route
                path="/billingmanager/standup-sheets"
                element={
                  <BDProjectsAssignedProvider>
                    <PMProvider>
                      <RoleBasedRoute
                        element={<Standup />}
                        allowedRoles={["billingmanager"]}
                        requiredPermission="manage_sheets_inside_performance_sheets"
                      />
                    </PMProvider>
                  </BDProjectsAssignedProvider>
                }
              />
              <Route
                path="/projectmanager/standup-sheets"
                element={
                  <BDProjectsAssignedProvider>
                    <PMProvider>
                      <RoleBasedRoute
                        element={<Standup />}
                        allowedRoles={["projectmanager"]}
                        requiredPermission="manage_sheets_inside_performance_sheets"
                      />
                    </PMProvider>
                  </BDProjectsAssignedProvider>
                }
              />
              <Route
                path="/tl/standup-sheets"
                element={
                  <BDProjectsAssignedProvider>
                    <PMProvider>
                      <RoleBasedRoute
                        element={<Standup />}
                        allowedRoles={["tl"]}
                        requiredPermission="manage_sheets_inside_performance_sheets"
                      />
                    </PMProvider>
                  </BDProjectsAssignedProvider>
                }
              />
              <Route
                path="/team/standup-sheets"
                element={
                  <BDProjectsAssignedProvider>
                    <PMProvider>
                      <RoleBasedRoute
                        element={<Standup />}
                        allowedRoles={["team"]}
                        requiredPermission="manage_sheets_inside_performance_sheets"
                      />
                    </PMProvider>
                  </BDProjectsAssignedProvider>
                }
              />
              <Route
                path="/hr/standup-sheets"
                element={
                  <BDProjectsAssignedProvider>
                    <PMProvider>
                      <RoleBasedRoute
                        element={<Standup />}
                        allowedRoles={["hr"]}
                        requiredPermission="manage_sheets_inside_performance_sheets"
                      />
                    </PMProvider>
                  </BDProjectsAssignedProvider>
                }
              />

              <Route
                path="/superadmin/projects/projects-detail/:project_id"
                element={
                  <TaskProvider>
                    <ProjectMasterProvider>
                      <RoleBasedRoute
                        element={<ProjectDetail />}
                        allowedRoles={["superadmin"]}
                        requiredPermission="projects"
                      />
                    </ProjectMasterProvider>
                  </TaskProvider>
                }
              />
              <Route
                path="/superadmin/projects/tasks/:project_id"
                element={
                  <TaskProvider>
                    <BDProjectsAssignedProvider>
                      <PMProvider>
                        <TLProvider>
                          <ProjectMasterProvider>
                            <RoleBasedRoute
                              element={<Task />}
                              allowedRoles={["superadmin"]}
                              requiredPermission="projects"
                            />
                          </ProjectMasterProvider>
                        </TLProvider>
                      </PMProvider>
                    </BDProjectsAssignedProvider>
                  </TaskProvider>
                }
              />

              <Route
                path="/superadmin/projects-assigned"
                element={
                  <UserProvider>
                    <RoleBasedRoute
                      element={<Empprojects />}
                      allowedRoles={["superadmin"]}
                    />
                  </UserProvider>
                }
              />
              <Route
                path="/superadmin/performance-sheet-History"
                element={
                  <UserProvider>
                    <RoleBasedRoute
                      element={<EmpSheetHistory />}
                      allowedRoles={["superadmin"]}
                      requiredPermission="performance_history"
                    />
                  </UserProvider>
                }
              />
              <Route
                path="/superadmin/leave"
                element={
                  <LeaveProvider>
                    <RoleBasedRoute
                      element={<LeaveForm />}
                      allowedRoles={["superadmin"]}
                      requiredPermission="leaves"
                    />
                  </LeaveProvider>
                }
              />

              <Route
                path="/salesperson/leave"
                element={
                  <LeaveProvider>
                    <RoleBasedRoute
                      element={<LeaveForm />}
                      allowedRoles={["salesperson"]}
                      requiredPermission="leaves"
                    />
                  </LeaveProvider>
                }
              />

              <Route
                path="/superadmin/leaves"
                element={
                  <EmployeeProvider>
                    <LeaveProvider>
                      <RoleBasedRoute
                        element={<LeaveManagement />}
                        allowedRoles={["superadmin"]}
                        requiredPermission="leave_management"
                      />
                    </LeaveProvider>
                  </EmployeeProvider>
                }
              />

              <Route
                path="/salesperson/users/:id"
                element={
                  <RoleBasedRoute
                    element={<EmployeeDetailMain />}
                    allowedRoles={["salesperson"]}
                    requiredPermission="employee_management"
                  />
                }
              />

              <Route
                path="/superadmin/users/:id"
                element={
                  <RoleBasedRoute
                    element={<EmployeeDetailMain />}
                    allowedRoles={["superadmin"]}
                    requiredPermission="employee_management"
                  />
                }
              />
      
              <Route
                path="/hr/users/:id"
                element={
                  <RoleBasedRoute
                    element={<EmployeeDetailMain />}
                    allowedRoles={["hr"]}
                    requiredPermission="employee_management"
                  />
                }
              />
              <Route
                path="/tl/users/:id"
                element={
                  <RoleBasedRoute
                    element={<EmployeeDetailMain />}
                    allowedRoles={["tl"]}
                    requiredPermission="employee_management"
                  />
                }
              />
              <Route
                path="/projectmanager/users/:id"
                element={
                  <RoleBasedRoute
                    element={<EmployeeDetailMain />}
                    allowedRoles={["projectmanager"]}
                    requiredPermission="employee_management"
                  />
                }
              />
              <Route
                path="/team/users/:id"
                element={
                  <RoleBasedRoute
                    element={<EmployeeDetailMain />}
                    allowedRoles={["team"]}
                  />
                }
              />
              <Route
                path="/billingmanager/users/:id"
                element={
                  <RoleBasedRoute
                    element={<EmployeeDetail />}
                    allowedRoles={["billingmanager"]}
                    requiredPermission="employee_management"
                  />
                }
              />
              <Route
                path="/superadmin/teams"
                element={
                  <RoleBasedRoute
                    element={<BDTeamelement />}
                    allowedRoles={["superadmin"]}
                  />
                }
              />

              {/* <Route
  path="/superadmin"
  element={<AssignelementPM />}
>
  <Route
    path="assign"
    element={<RoleBasedRoute element={<PMassign />} allowedRoles={["superadmin"]} />}
  />
  <Route
    path="unassigned"
    element={<RoleBasedRoute element={<PMunassigned />} allowedRoles={["superadmin"]} />}
  />
</Route> */}
              <Route
                path="/superadmin"
                element={
                  <RoleBasedRoute
                    element={[<Assignedelement />]}
                    allowedRoles={["superadmin"]}
                  />
                }
              >
                <Route
                  path="assigned-projects"
                  element={
                    <RoleBasedRoute
                      element={<Assignedtable />}
                      allowedRoles={["superadmin"]}
                    />
                  }
                />
                <Route
                  path="not-assigned-projects"
                  element={
                    <RoleBasedRoute
                      element={<NotAssignedTable />}
                      allowedRoles={["superadmin"]}
                    />
                  }
                />
              </Route>
              {/* <Route
            path="/billingmanager"
            element={<RoleBasedRoute element={[<Assignedelement />]} allowedRoles={["billingmanager"]} />}
          >
          <Route
    path="assigned-projects"
    element={<RoleBasedRoute element={<Assignedtable />} allowedRoles={["billingmanager"]} />}
  />
  <Route
    path="not-assigned-projects"
    element={<RoleBasedRoute element={<NotAssignedTable />} allowedRoles={["billingmanager"]} />}
  />
   
</Route> */}
              {/* <Route
            path="/projectmanager"
            element={<RoleBasedRoute element={[<Assignedelement />]} allowedRoles={["projectmanager"]} />}
          >
          <Route
    path="assigned-projects"
    element={<RoleBasedRoute element={<Assignedtable />} allowedRoles={["projectmanager"]} />}
  />
  <Route
    path="not-assigned-projects"
    element={<RoleBasedRoute element={<NotAssignedTable />} allowedRoles={["projectmanager"]} />}
  />
   
</Route> */}
              <Route
                path="/tl"
                element={
                  <RoleBasedRoute
                    element={[<Assignedelement />]}
                    allowedRoles={["tl"]}
                  />
                }
              >
                <Route
                  path="assigned-projects"
                  element={
                    <RoleBasedRoute
                      element={<Assignedtable />}
                      allowedRoles={["tl"]}
                    />
                  }
                />
                <Route
                  path="not-assigned-projects"
                  element={
                    <RoleBasedRoute
                      element={<NotAssignedTable />}
                      allowedRoles={["tl"]}
                    />
                  }
                />
              </Route>
              {/* <Route
            path="/team"
            element={<RoleBasedRoute element={[<Assignedelement />]} allowedRoles={["team"]} />}
          >
          <Route
    path="assigned-projects"
    element={<RoleBasedRoute element={<Assignedtable />} allowedRoles={["team"]} />}
  />
  <Route
    path="not-assigned-projects"
    element={<RoleBasedRoute element={<NotAssignedTable />} allowedRoles={["team"]} />}
  />
   
</Route> */}

              <Route
                path="/billingmanager/Manage-sheets-History"
                element={
                  <PMProvider>
                    <BDProjectsAssignedProvider>
                      <RoleBasedRoute
                        element={<Performahistory />}
                        allowedRoles={["billingmanager"]}
                        requiredPermission="unfilled_sheets_inside_performance_sheets"
                      />
                    </BDProjectsAssignedProvider>
                  </PMProvider>
                }
              />
              <Route
                path="/billingmanager/manage-sheets"
                element={
                  <BDProjectsAssignedProvider>
                    <PMProvider>
                      <RoleBasedRoute
                        element={<Managesheets />}
                        allowedRoles={["billingmanager"]}
                        requiredPermission="manage_sheets_inside_performance_sheets"
                      />
                    </PMProvider>
                  </BDProjectsAssignedProvider>
                }
              />

              <Route
                path="/billingmanager/previous-sheets"
                element={
                  <BDProjectsAssignedProvider>
                    <PMProvider>
                      <RoleBasedRoute
                        element={<PreviousHistory />}
                        allowedRoles={["billingmanager"]}
                        requiredPermission="previous_sheets"
                      />
                    </PMProvider>
                  </BDProjectsAssignedProvider>
                }
              />

              <Route
                path="/salesperson/previous-sheets"
                element={
                  <BDProjectsAssignedProvider>
                    <PMProvider>
                      <RoleBasedRoute
                        element={<PreviousHistory />}
                        allowedRoles={["salesperson"]}
                        requiredPermission="previous_sheets"
                      />
                    </PMProvider>
                  </BDProjectsAssignedProvider>
                }
              />

              <Route
                path="/billingmanager/Pending-sheets"
                element={
                  <PMProvider>
                    <BDProjectsAssignedProvider>
                      <RoleBasedRoute
                        element={<Pendingsheets />}
                        allowedRoles={["billingmanager"]}
                        requiredPermission="pending_sheets_inside_performance_sheets"
                      />
                    </BDProjectsAssignedProvider>
                  </PMProvider>
                }
              />
              <Route
                path="/salesperson/Pending-sheets"
                element={
                  <PMProvider>
                    <BDProjectsAssignedProvider>
                      <RoleBasedRoute
                        element={<Pendingsheets />}
                        allowedRoles={["salesperson"]}
                        requiredPermission="pending_sheets_inside_performance_sheets"
                      />
                    </BDProjectsAssignedProvider>
                  </PMProvider>
                }
              />

              <Route
                path="/billingmanager/roles"
                element={
                  <RoleBasedRoute
                    element={<Roleelements />}
                    allowedRoles={["billingmanager"]}
                    requiredPermission="roles"
                  />
                }
              />
              <Route
                path="/billingmanager/department"
                element={
                  <RoleBasedRoute
                    element={<Departmentelements />}
                    allowedRoles={["billingmanager"]}
                    requiredPermission="department"
                  />
                }
              />

              {/* <Route
             path="/billingmanager/manage-leaves"
            element={
              <LeaveProvider>
                <RoleBasedRoute element={<PMleaves/>} allowedRoles={["billingmanager"]} />
                </LeaveProvider>
            }
          /> */}

              <Route
                path="/billingmanager/leave"
                element={
                  <LeaveProvider>
                    <RoleBasedRoute
                      element={<LeaveForm />}
                      allowedRoles={["billingmanager"]}
                      requiredPermission="leaves"
                    />
                  </LeaveProvider>
                }
              />

              {/* <Route
            path="/billingmanager/projects-assigned"
            element={
              <UserProvider>
                <RoleBasedRoute element={<Empprojects/>} allowedRoles={["billingmanager"]} />
              </UserProvider>
            }
          /> */}

              <Route
                path="/billingmanager/performance-sheet"
                element={
                  <UserProvider>
                    <BDProjectsAssignedProvider>
                      <RoleBasedRoute
                        element={<Addsheet />}
                        allowedRoles={["billingmanager"]}
                      />
                    </BDProjectsAssignedProvider>
                  </UserProvider>
                }
              />

              <Route
                path="/billingmanager/performance-sheet-History"
                element={
                  <UserProvider>
                    <RoleBasedRoute
                      element={<EmpSheetHistory />}
                      allowedRoles={["billingmanager"]}
                      requiredPermission="performance_history"
                    />
                  </UserProvider>
                }
              />
              {/* <Route
  path="/billingmanager"
  element={<AssignelementPM />}
>
  <Route
    path="assign"
    element={<RoleBasedRoute element={<PMassign />} allowedRoles={["billingmanager"]} />}
  />
  <Route
    path="unassigned"
    element={<RoleBasedRoute element={<PMunassigned />} allowedRoles={["billingmanager"]} />}
  />
</Route> */}

              {/* <Route
            path="/superadmin/assigned-projects"
            element={<RoleBasedRoute element={<Assignedelement />} allowedRoles={["superadmin"]} />}
          /> */}

              <Route
                path="/billingmanager/projects/tasks/:project_id"
                element={
                  <TaskProvider>
                    <BDProjectsAssignedProvider>
                      <TLProvider>
                        <PMProvider>
                          <ProjectMasterProvider>
                            <RoleBasedRoute
                              element={<Task />}
                              allowedRoles={["billingmanager"]}
                              requiredPermission="projects"
                            />
                          </ProjectMasterProvider>
                        </PMProvider>
                      </TLProvider>
                    </BDProjectsAssignedProvider>
                  </TaskProvider>
                }
              />

              <Route
                path="/salesperson/projects/tasks/:project_id"
                element={
                  <TaskProvider>
                    <BDProjectsAssignedProvider>
                      <TLProvider>
                        <PMProvider>
                          <ProjectMasterProvider>
                            <RoleBasedRoute
                              element={<Task />}
                              allowedRoles={["salesperson"]}
                              requiredPermission="projects"
                            />
                          </ProjectMasterProvider>
                        </PMProvider>
                      </TLProvider>
                    </BDProjectsAssignedProvider>
                  </TaskProvider>
                }
              />
              {/* 
   <Route
            path="/billingmanager"
            element={<RoleBasedRoute element={<Assignedelement />} allowedRoles={["billingmanager"]} />}
          > */}

              <Route
                path="/billingmanager/dashboard"
                element={
                  <RoleBasedRoute
                    element={<SuperAdminDashboard />}
                    allowedRoles={["billingmanager"]}
                  />
                }
              />

              <Route
                path="/billingmanager/users/:id"
                element={
                  <RoleBasedRoute
                    element={<EmployeeDetail />}
                    allowedRoles={["billingmanager"]}
                    requiredPermission="employee_management"
                  />
                }
              />

              <Route
                path="/billingmanager/users"
                element={
                  <RoleBasedRoute
                    element={<Employeelayout />}
                    allowedRoles={["billingmanager"]}
                    requiredPermission="employee_management"
                  />
                }
              />

              <Route
                path="/billingmanager/projects/projects-detail/:project_id"
                element={
                  <TaskProvider>
                    <ProjectMasterProvider>
                      <RoleBasedRoute
                        element={<ProjectDetail />}
                        allowedRoles={["billingmanager"]}
                        requiredPermission="projects"
                      />
                    </ProjectMasterProvider>
                  </TaskProvider>
                }
              />

              <Route
                path="/billingmanager/activity-tags"
                element={
                  <RoleBasedRoute
                    element={<Activityelement />}
                    allowedRoles={["billingmanager"]}
                    requiredPermission="activity_tags"
                  />
                }
              />

              <Route
                path="/billingmanager/projects"
                element={
                  <RoleBasedRoute
                    element={<ProjectsMasterElements />}
                    allowedRoles={["billingmanager"]}
                    requiredPermission="projects"
                  />
                }
              />
              <Route
                path="/billingmanager/source-master"
                element={
                  <RoleBasedRoute
                    element={<ProjectSourceMasterElement />}
                    allowedRoles={["billingmanager"]}
                    requiredPermission="project_source"
                  />
                }
              />

              <Route
                path="/billingmanager/communication-type-master"
                element={
                  <RoleBasedRoute
                    element={<CommunicationMasterElement />}
                    allowedRoles={["billingmanager"]}
                    requiredPermission="communication_type"
                  />
                }
              />

              <Route
                path="/billingmanager/account-master"
                element={
                  <RoleBasedRoute
                    element={<AccountMasterElement />}
                    allowedRoles={["billingmanager"]}
                    requiredPermission="account_master"
                  />
                }
              />
              <Route
                path="/billingmanager/notes-management"
                element={
                  <RoleBasedRoute
                    element={<NotesManagementElement />}
                    allowedRoles={["billingmanager"]}
                    requiredPermission="notes_management"
                  />
                }
              />
              <Route
                path="/billingmanager/reporting"
                element={
                  <RoleBasedRoute
                    element={<ReportingManagement />}
                    allowedRoles={["billingmanager"]}
                  />
                }
              />

              <Route
                path="/salesperson/reporting"
                element={
                  <RoleBasedRoute
                    element={<ReportingManagement />}
                    allowedRoles={["salesperson"]}
                  />
                }
              />
              <Route
                path="/billingmanager/clients"
                element={
                  <RoleBasedRoute
                    element={<ClientMasterElement />}
                    allowedRoles={["billingmanager"]}
                    requiredPermission="clients"
                  />
                }
              />

              <Route
                path="/billingmanager/teams"
                element={
                  <RoleBasedRoute
                    element={<BDTeamelement />}
                    allowedRoles={["billingmanager"]}
                    requiredPermission="teams"
                  />
                }
              />
              <Route
                path="/billingmanager/team"
                element={
                  <RoleBasedRoute
                    element={<Teamelement />}
                    allowedRoles={["billingmanager"]}
                    requiredPermission="team"
                  />
                }
              />

              <Route
                path="/billingmanager/profile"
                element={
                  <RoleBasedRoute
                    allowedRoles={["billingmanager"]}
                    element={
                      <EmployeeProvider>
                        <ProfileProvider>
                          <Profile />
                        </ProfileProvider>
                      </EmployeeProvider>
                    }
                  />
                }
              />

              <Route
                path="/projectmanager/dashboard"
                element={
                  <RoleBasedRoute
                    element={<ProjectManagerDashboard />}
                    allowedRoles={["projectmanager"]}
                  />
                }
              />

              <Route path="/projectmanager" element={<AssignelementPM />}>
                <Route
                  path="assign"
                  element={
                    <RoleBasedRoute
                      element={<PMassign />}
                      allowedRoles={["projectmanager"]}
                    />
                  }
                />
                <Route
                  path="unassigned"
                  element={
                    <RoleBasedRoute
                      element={<PMunassigned />}
                      allowedRoles={["projectmanager"]}
                    />
                  }
                />
              </Route>
              <Route
                path="/projectmanager/department"
                element={
                  <RoleBasedRoute
                    element={<Departmentelements />}
                    allowedRoles={["projectmanager"]}
                    requiredPermission="department"
                  />
                }
              />
              <Route
                path="/projectmanager/team"
                element={
                  <RoleBasedRoute
                    element={<Teamelement />}
                    allowedRoles={["projectmanager"]}
                    requiredPermission="team"
                  />
                }
              />
              <Route
                path="/projectmanager/teams"
                element={
                  <RoleBasedRoute
                    element={<BDTeamelement />}
                    allowedRoles={["projectmanager"]}
                    requiredPermission="teams"
                  />
                }
              />
              <Route
                path="/projectmanager/users"
                element={
                  <RoleBasedRoute
                    element={<Employeelayout />}
                    allowedRoles={["projectmanager"]}
                    requiredPermission="employee_management"
                  />
                }
              />
              <Route
                path="/projectmanager/roles"
                element={
                  <RoleBasedRoute
                    element={<Roleelements />}
                    allowedRoles={["projectmanager"]}
                    requiredPermission="roles"
                  />
                }
              />
              <Route
                path="/projectmanager/source-master"
                element={
                  <RoleBasedRoute
                    element={<ProjectSourceMasterElement />}
                    allowedRoles={["projectmanager"]}
                    requiredPermission="project_source"
                  />
                }
              />

              <Route
                path="/projectmanager/communication-type-master"
                element={
                  <RoleBasedRoute
                    element={<CommunicationMasterElement />}
                    allowedRoles={["projectmanager"]}
                    requiredPermission="communication_type"
                  />
                }
              />

              <Route
                path="/projectmanager/account-master"
                element={
                  <RoleBasedRoute
                    element={<AccountMasterElement />}
                    allowedRoles={["projectmanager"]}
                    requiredPermission="account_master"
                  />
                }
              />
              <Route
                path="/projectmanager/notes-management"
                element={
                  <RoleBasedRoute
                    element={<NotesManagementElement />}
                    allowedRoles={["projectmanager"]}
                    requiredPermission="notes_management"
                  />
                }
              />
              <Route
                path="/projectmanager/reporting"
                element={
                  <RoleBasedRoute
                    element={<ReportingManagement />}
                    allowedRoles={["projectmanager"]}
                  />
                }
              />
              <Route
                path="/projectmanager/leave"
                element={
                  <LeaveProvider>
                    <RoleBasedRoute
                      element={<LeaveForm />}
                      allowedRoles={["projectmanager"]}
                      requiredPermission="leaves"
                    />
                  </LeaveProvider>
                }
              />
              <Route
                path="/projectmanager/activity-tags"
                element={
                  <RoleBasedRoute
                    element={<Activityelement />}
                    allowedRoles={["projectmanager"]}
                    requiredPermission="activity_tags"
                  />
                }
              />

              <Route
                path="/projectmanager/leaves"
                element={
                  <EmployeeProvider>
                    <LeaveProvider>
                      <RoleBasedRoute
                        element={<LeaveManagement />}
                        allowedRoles={["projectmanager"]}
                        requiredPermission="leave_management"
                      />
                    </LeaveProvider>
                  </EmployeeProvider>
                }
              />

              <Route
                path="/projectmanager/clients"
                element={
                  <RoleBasedRoute
                    element={<ClientMasterElement />}
                    allowedRoles={["projectmanager"]}
                    requiredPermission="clients"
                  />
                }
              />
              <Route
                path="/salesperson/clients"
                element={
                  <RoleBasedRoute
                    element={<ClientMasterElement />}
                    allowedRoles={["salesperson"]}
                    requiredPermission="clients"
                  />
                }
              />

              <Route
                path="/projectmanager/projects"
                element={
                  <RoleBasedRoute
                    element={<ProjectsMasterElements />}
                    allowedRoles={["projectmanager"]}
                    requiredPermission="projects"
                  />
                }
              />
              <Route
                path="/projectmanager/performance-sheet"
                element={
                  <UserProvider>
                    <BDProjectsAssignedProvider>
                      <RoleBasedRoute
                        element={<Addsheet />}
                        allowedRoles={["projectmanager"]}
                      />
                    </BDProjectsAssignedProvider>
                  </UserProvider>
                }
              />

              <Route
                path="/projectmanager/projects/projects-detail/:project_id"
                element={
                  <TaskProvider>
                    <ProjectMasterProvider>
                      <RoleBasedRoute
                        element={<ProjectDetail />}
                        allowedRoles={["projectmanager"]}
                        requiredPermission="projects"
                      />
                    </ProjectMasterProvider>
                  </TaskProvider>
                }
              />
              <Route
                path="/projectmanager/projects/tasks/:project_id"
                element={
                  <TaskProvider>
                    <BDProjectsAssignedProvider>
                      <TLProvider>
                        <PMProvider>
                          <ProjectMasterProvider>
                            <RoleBasedRoute
                              element={<Task />}
                              allowedRoles={["projectmanager"]}
                              requiredPermission="projects"
                            />
                          </ProjectMasterProvider>
                        </PMProvider>
                      </TLProvider>
                    </BDProjectsAssignedProvider>
                  </TaskProvider>
                }
              />
              {/* <Route
            path="/projectmanager/projects-assigned"
            element={
              <UserProvider>
                <RoleBasedRoute element={<PMassignedelement/>} allowedRoles={["projectmanager"]} />
              </UserProvider>
            }
          /> */}
              <Route
                path="/projectmanager/performance-sheet-History"
                element={
                  <UserProvider>
                    <RoleBasedRoute
                      element={<EmpSheetHistory />}
                      allowedRoles={["projectmanager"]}
                      requiredPermission="performance_history"
                    />
                  </UserProvider>
                }
              />

              <Route
                path="/projectmanager/tasks/:project_id"
                element={
                  <TaskProvider>
                    <ProjectMasterProvider>
                      <RoleBasedRoute
                        element={<Task />}
                        allowedRoles={["projectmanager"]}
                        requiredPermission="projects"
                      />
                    </ProjectMasterProvider>
                  </TaskProvider>
                }
              />

              {/* <Route
            path="/projectmanager/manage-leaves"
            element={
              <LeaveProvider>
                <RoleBasedRoute element={<PMleaves/>} allowedRoles={["projectmanager"]} />
                </LeaveProvider>
            }
          /> */}

              <Route
                path="/projectmanager/Manage-sheets"
                element={
                  <PMProvider>
                    <BDProjectsAssignedProvider>
                      <RoleBasedRoute
                        element={<Managesheets />}
                        allowedRoles={["projectmanager"]}
                        requiredPermission="manage_sheets_inside_performance_sheets"
                      />
                    </BDProjectsAssignedProvider>
                  </PMProvider>
                }
              />

              <Route
                path="/projectmanager/previous-sheets"
                element={
                  <PMProvider>
                    <BDProjectsAssignedProvider>
                      <RoleBasedRoute
                        element={<PreviousHistory />}
                        allowedRoles={["projectmanager"]}
                        requiredPermission="previous_sheets"
                      />
                    </BDProjectsAssignedProvider>
                  </PMProvider>
                }
              />

              <Route
                path="/projectmanager/Manage-sheets-History"
                element={
                  <PMProvider>
                    <BDProjectsAssignedProvider>
                      <RoleBasedRoute
                        element={<Performahistory />}
                        allowedRoles={["projectmanager"]}
                        requiredPermission="unfilled_sheets_inside_performance_sheets"
                      />
                    </BDProjectsAssignedProvider>
                  </PMProvider>
                }
              />

              <Route
                path="/projectmanager/Pending-sheets"
                element={
                  <PMProvider>
                    <BDProjectsAssignedProvider>
                      <RoleBasedRoute
                        element={<Pendingsheets />}
                        allowedRoles={["projectmanager"]}
                        requiredPermission="pending_sheets_inside_performance_sheets"
                      />
                    </BDProjectsAssignedProvider>
                  </PMProvider>
                }
              />
              <Route
                path="/tl/manage-sheets"
                element={
                  <BDProjectsAssignedProvider>
                    <PMProvider>
                      <RoleBasedRoute
                        element={<Managesheets />}
                        allowedRoles={["tl"]}
                        requiredPermission="manage_sheets_inside_performance_sheets"
                      />
                    </PMProvider>
                  </BDProjectsAssignedProvider>
                }
              />

              <Route
                path="/tl/previous-sheets"
                element={
                  <BDProjectsAssignedProvider>
                    <PMProvider>
                      <RoleBasedRoute
                        element={<PreviousHistory />}
                        allowedRoles={["tl"]}
                        requiredPermission="previous_sheets"
                      />
                    </PMProvider>
                  </BDProjectsAssignedProvider>
                }
              />

              <Route
                path="/tl/Manage-sheets-History"
                element={
                  <PMProvider>
                    <BDProjectsAssignedProvider>
                      <RoleBasedRoute
                        element={<Performahistory />}
                        allowedRoles={["tl"]}
                        requiredPermission="unfilled_sheets_inside_performance_sheets"
                      />
                    </BDProjectsAssignedProvider>
                  </PMProvider>
                }
              />

              <Route
                path="/tl/Pending-sheets"
                element={
                  <PMProvider>
                    <BDProjectsAssignedProvider>
                      <RoleBasedRoute
                        element={<Pendingsheets />}
                        allowedRoles={["tl"]}
                        requiredPermission="pending_sheets_inside_performance_sheets"
                      />
                    </BDProjectsAssignedProvider>
                  </PMProvider>
                }
              />

              <Route
                path="/projectmanager/profile"
                element={
                  <RoleBasedRoute
                    allowedRoles={["projectmanager"]}
                    element={
                      <EmployeeProvider>
                        <ProfileProvider>
                          <Profile />
                        </ProfileProvider>
                      </EmployeeProvider>
                    }
                  />
                }
              />

              <Route
                path="/tl/dashboard"
                element={
                  <RoleBasedRoute
                    element={<TeamleaderDashboard />}
                    allowedRoles={["tl"]}
                  />
                }
              />

              {/* <Route
            path="/tl/projects-assigned"
            element={<RoleBasedRoute element={<TLassignedelement />} allowedRoles={["tl"]} />}
          /> */}
              <Route path="/tl" element={<AssignelementTL />}>
                <Route
                  path="assign"
                  element={
                    <RoleBasedRoute
                      element={<TLassign />}
                      allowedRoles={["tl"]}
                    />
                  }
                />
                <Route
                  path="unassigned"
                  element={
                    <RoleBasedRoute
                      element={<TLunassigned />}
                      allowedRoles={["tl"]}
                    />
                  }
                />
              </Route>
              <Route path="/team" element={<AssignelementTL />}>
                <Route
                  path="assign"
                  element={
                    <RoleBasedRoute
                      element={<TLassign />}
                      allowedRoles={["team"]}
                    />
                  }
                />
                <Route
                  path="unassigned"
                  element={
                    <RoleBasedRoute
                      element={<TLunassigned />}
                      allowedRoles={["team"]}
                    />
                  }
                />
              </Route>
              <Route
                path="/tl/tasks/:project_id"
                element={
                  <TaskProvider>
                    <ProjectMasterProvider>
                      <RoleBasedRoute
                        element={<Task />}
                        allowedRoles={["tl"]}
                      />
                    </ProjectMasterProvider>
                  </TaskProvider>
                }
              />

              <Route
                path="/tl/manage-leaves"
                element={
                  <LeaveProvider>
                    <RoleBasedRoute
                      element={<PMleaves />}
                      allowedRoles={["tl"]}
                    />
                  </LeaveProvider>
                }
              />
              <Route
                path="/tl/Manage-sheets-History"
                element={
                  <PMProvider>
                    <BDProjectsAssignedProvider>
                      <RoleBasedRoute
                        element={<Performahistory />}
                        allowedRoles={["tl"]}
                      />
                    </BDProjectsAssignedProvider>
                  </PMProvider>
                }
              />

              {/* <Route
            path="/tl/Pending-sheets"
            element={
                    <PMProvider>
              <BDProjectsAssignedProvider>
                <RoleBasedRoute element={<Managesheets/>} allowedRoles={["tl"]} />
                </BDProjectsAssignedProvider>
                </PMProvider>
            }
          /> */}

              {/*  */}

              <Route
                path="/billingmanager/leaves"
                element={
                  <EmployeeProvider>
                    <LeaveProvider>
                      <RoleBasedRoute
                        element={<LeaveManagement />}
                        allowedRoles={["billingmanager"]}
                      />
                    </LeaveProvider>
                  </EmployeeProvider>
                }
              />

              <Route
                path="/tl/department"
                element={
                  <RoleBasedRoute
                    element={<Departmentelements />}
                    allowedRoles={["tl"]}
                    requiredPermission="department"
                  />
                }
              />
              <Route
                path="/tl/team"
                element={
                  <RoleBasedRoute
                    element={<Teamelement />}
                    allowedRoles={["tl"]}
                    requiredPermission="team"
                  />
                }
              />
              <Route
                path="/tl/teams"
                element={
                  <RoleBasedRoute
                    element={<BDTeamelement />}
                    allowedRoles={["tl"]}
                    requiredPermission="teams"
                  />
                }
              />
              <Route
                path="/tl/salesperson"
                element={
                  <RoleBasedRoute
                    element={<BDTeamelement />}
                    allowedRoles={["tl"]}
                    requiredPermission="salesperson"
                  />
                }
              />

              <Route
                path="/tl/users"
                element={
                  <RoleBasedRoute
                    element={<Employeelayout />}
                    allowedRoles={["tl"]}
                    requiredPermission="employee_management"
                  />
                }
              />
              <Route
                path="/tl/roles"
                element={
                  <RoleBasedRoute
                    element={<Roleelements />}
                    allowedRoles={["tl"]}
                    requiredPermission="roles"
                  />
                }
              />
              <Route
                path="/tl/leave"
                element={
                  <LeaveProvider>
                    <RoleBasedRoute
                      element={<LeaveForm />}
                      allowedRoles={["tl"]}
                      requiredPermission="leaves"
                    />
                  </LeaveProvider>
                }
              />
              <Route
                path="/tl/source-master"
                element={
                  <RoleBasedRoute
                    element={<ProjectSourceMasterElement />}
                    allowedRoles={["tl"]}
                    requiredPermission="project_source"
                  />
                }
              />

              <Route
                path="/tl/communication-type-master"
                element={
                  <RoleBasedRoute
                    element={<CommunicationMasterElement />}
                    allowedRoles={["tl"]}
                    requiredPermission="communication_type"
                  />
                }
              />

              <Route
                path="/tl/account-master"
                element={
                  <RoleBasedRoute
                    element={<AccountMasterElement />}
                    allowedRoles={["tl"]}
                    requiredPermission="account_master"
                  />
                }
              />
              <Route
                path="/tl/notes-management"
                element={
                  <RoleBasedRoute
                    element={<NotesManagementElement />}
                    allowedRoles={["tl"]}
                    requiredPermission="notes_management"
                  />
                }
              />
              <Route
                path="/tl/reporting"
                element={
                  <RoleBasedRoute
                    element={<ReportingManagement />}
                    allowedRoles={["tl"]}
                  />
                }
              />
              <Route
                path="/tl/activity-tags"
                element={
                  <RoleBasedRoute
                    element={<Activityelement />}
                    allowedRoles={["tl"]}
                    requiredPermission="activity_tags"
                  />
                }
              />

              <Route
                path="/tl/leaves"
                element={
                  <EmployeeProvider>
                    <LeaveProvider>
                      <RoleBasedRoute
                        element={<LeaveManagement />}
                        allowedRoles={["tl"]}
                        requiredPermission="leave_management"
                      />
                    </LeaveProvider>
                  </EmployeeProvider>
                }
              />

              <Route
                path="/tl/clients"
                element={
                  <RoleBasedRoute
                    element={<ClientMasterElement />}
                    allowedRoles={["tl"]}
                    requiredPermission="clients"
                  />
                }
              />

              <Route
                path="/tl/projects"
                element={
                  <RoleBasedRoute
                    element={<ProjectsMasterElements />}
                    allowedRoles={["tl"]}
                    requiredPermission="projects"
                  />
                }
              />
              <Route
                path="/tl/performance-sheet"
                element={
                  <UserProvider>
                    <BDProjectsAssignedProvider>
                      <RoleBasedRoute
                        element={<Addsheet />}
                        allowedRoles={["tl"]}
                      />
                    </BDProjectsAssignedProvider>
                  </UserProvider>
                }
              />

              <Route
                path="/tl/projects/projects-detail/:project_id"
                element={
                  <TaskProvider>
                    <ProjectMasterProvider>
                      <RoleBasedRoute
                        element={<ProjectDetail />}
                        allowedRoles={["tl"]}
                        requiredPermission="projects"
                      />
                    </ProjectMasterProvider>
                  </TaskProvider>
                }
              />
              <Route
                path="/tl/projects/tasks/:project_id"
                element={
                  <TaskProvider>
                    <BDProjectsAssignedProvider>
                      <TLProvider>
                        <PMProvider>
                          <ProjectMasterProvider>
                            <RoleBasedRoute
                              element={<Task />}
                              allowedRoles={["tl"]}
                              requiredPermission="projects"
                            />
                          </ProjectMasterProvider>
                        </PMProvider>
                      </TLProvider>
                    </BDProjectsAssignedProvider>
                  </TaskProvider>
                }
              />
              <Route
                path="/team/projects/tasks/:project_id"
                element={
                  <TaskProvider>
                    <BDProjectsAssignedProvider>
                      <TLProvider>
                        <PMProvider>
                          <ProjectMasterProvider>
                            <RoleBasedRoute
                              element={<Task />}
                              allowedRoles={["team"]}
                              requiredPermission="projects"
                            />
                          </ProjectMasterProvider>
                        </PMProvider>
                      </TLProvider>
                    </BDProjectsAssignedProvider>
                  </TaskProvider>
                }
              />
              {/* <Route
            path="/tl/projects-assigned"
            element={
              <UserProvider>
                <RoleBasedRoute element={<Empprojects/>} allowedRoles={["tl"]} />
              </UserProvider>
            }
          /> */}
              <Route
                path="/tl/performance-sheet-History"
                element={
                  <UserProvider>
                    <RoleBasedRoute
                      element={<EmpSheetHistory />}
                      allowedRoles={["tl"]}
                      requiredPermission="performance_history"
                    />
                  </UserProvider>
                }
              />
              {/* <Route
            path="/tl/performance-sheets"
            element={
              <BDProjectsAssignedProvider>
                <PMProvider>
                  <RoleBasedRoute element={<Managesheets />} allowedRoles={["tl"]} />
                </PMProvider>
              </BDProjectsAssignedProvider>
            }
          /> */}
              <Route
                path="/tl/profile"
                element={
                  <RoleBasedRoute
                    allowedRoles={["tl"]}
                    element={
                      <EmployeeProvider>
                        <ProfileProvider>
                          <Profile />
                        </ProfileProvider>
                      </EmployeeProvider>
                    }
                  />
                }
              />

              <Route
                path="/hr/dashboard"
                element={
                  <RoleBasedRoute
                    element={<SuperAdminDashboard />}
                    allowedRoles={["hr"]}
                  />
                }
              />
              <Route
                path="/hr/accessories/assign"
                element={
                  <AssignAccessoryProvider>
                    <RoleBasedRoute
                      element={<AssignAccessoryelements />}
                      allowedRoles={["hr"]}
                    />
                  </AssignAccessoryProvider>
                }
              />
              {/* <Route
            path="/hr/accessory/manage/:id"
            element={<RoleBasedRoute element={<AddAccessories />} allowedRoles={["hr"]} />}
          /> */}
              <Route
                path="/hr/accessory/manage/:id"
                element={
                  <AccessoryProvider>
                    <AssignAccessoryProvider>
                      <RoleBasedRoute
                        element={<Accessoryelements />}
                        allowedRoles={["hr"]}
                      />
                    </AssignAccessoryProvider>
                  </AccessoryProvider>
                }
              />
              <Route
                path="/hr/activity-tags"
                element={
                  <RoleBasedRoute
                    element={<Activityelement />}
                    allowedRoles={["hr"]}
                    requiredPermission="activity_tags"
                  />
                }
              />

              <Route
                path="/hr/users/:id"
                element={
                  <RoleBasedRoute
                    element={<EmployeeDetail />}
                    allowedRoles={["hr"]}
                    requiredPermission="employee_management"
                  />
                }
              />
              <Route
                path="/hr/accessory/category"
                element={
                  <CategoryProvider>
                    <RoleBasedRoute
                      element={<Categoryelements />}
                      allowedRoles={["hr"]}
                    />
                  </CategoryProvider>
                }
              />
              <Route
                path="/hr/clients"
                element={
                  <RoleBasedRoute
                    element={<ClientMasterElement />}
                    allowedRoles={["hr"]}
                    requiredPermission="clients"
                  />
                }
              />

              <Route
                path="/hr/source-master"
                element={
                  <RoleBasedRoute
                    element={<ProjectSourceMasterElement />}
                    allowedRoles={["hr"]}
                    requiredPermission="project_source"
                  />
                }
              />

              <Route
                path="/hr/communication-type-master"
                element={
                  <RoleBasedRoute
                    element={<CommunicationMasterElement />}
                    allowedRoles={["hr"]}
                    requiredPermission="communication_type"
                  />
                }
              />

              <Route
                path="/hr/account-master"
                element={
                  <RoleBasedRoute
                    element={<AccountMasterElement />}
                    allowedRoles={["hr"]}
                    requiredPermission="account_master"
                  />
                }
              />
              <Route
                path="/hr/notes-management"
                element={
                  <RoleBasedRoute
                    element={<NotesManagementElement />}
                    allowedRoles={["hr"]}
                    requiredPermission="notes_management"
                  />
                }
              />
              <Route
                path="/hr/reporting"
                element={
                  <RoleBasedRoute
                    element={<ReportingManagement />}
                    allowedRoles={["hr"]}
                  />
                }
              />

              <Route
                path="/hr/projects"
                element={
                  <RoleBasedRoute
                    element={<ProjectsMasterElements />}
                    allowedRoles={["hr"]}
                    requiredPermission="projects"
                  />
                }
              />

              <Route
                path="/hr/users"
                element={
                  <RoleBasedRoute
                    element={<Employeelayout />}
                    allowedRoles={["hr"]}
                    requiredPermission="employee_management"
                  />
                }
              />
              <Route
                path="/hr/teams"
                element={
                  <RoleBasedRoute
                    element={<BDTeamelement />}
                    allowedRoles={["hr"]}
                    requiredPermission="teams"
                  />
                }
              />

              <Route
                path="/salesperson/teams"
                element={
                  <RoleBasedRoute
                    element={<BDTeamelement />}
                    allowedRoles={["salesperson"]}
                    requiredPermission="teams"
                  />
                }
              />

              <Route
                path="/hr/roles"
                element={
                  <RoleBasedRoute
                    element={<Roleelements />}
                    allowedRoles={["hr"]}
                    requiredPermission="roles"
                  />
                }
              />
              <Route
                path="/hr/leave"
                element={
                  <LeaveProvider>
                    <RoleBasedRoute
                      element={<LeaveForm />}
                      allowedRoles={["hr"]}
                      requiredPermission="leaves"
                    />
                  </LeaveProvider>
                }
              />
              <Route
                path="/hr/department"
                element={
                  <RoleBasedRoute
                    element={<Departmentelements />}
                    allowedRoles={["hr"]}
                    requiredPermission="department"
                  />
                }
              />

              <Route
                path="/salesperson/department"
                element={
                  <RoleBasedRoute
                    element={<Departmentelements />}
                    allowedRoles={["salesperson"]}
                    requiredPermission="department"
                  />
                }
              />

              <Route
                path="/hr/team"
                element={
                  <RoleBasedRoute
                    element={<Teamelement />}
                    allowedRoles={["hr"]}
                    requiredPermission="team"
                  />
                }
              />

              <Route
                path="/team/dashboard"
                element={
                  <RoleBasedRoute
                    element={<EmployeeDashboard />}
                    allowedRoles={["team"]}
                  />
                }
              />
              <Route
                path="/salesperson/dashboard"
                element={
                  <RoleBasedRoute
                    element={<SuperAdminDashboard />}
                    allowedRoles={["salesperson"]}
                  />
                }
              />

              <Route
                path="/team/department"
                element={
                  <RoleBasedRoute
                    element={<Departmentelements />}
                    allowedRoles={["team"]}
                    requiredPermission="department"
                  />
                }
              />
              <Route
                path="/team/team"
                element={
                  <RoleBasedRoute
                    element={<Teamelement />}
                    allowedRoles={["team"]}
                    requiredPermission="team"
                  />
                }
              />
              <Route
                path="/team/teams"
                element={
                  <RoleBasedRoute
                    element={<BDTeamelement />}
                    allowedRoles={["team"]}
                    requiredPermission="teams"
                  />
                }
              />
              <Route
                path="/team/users"
                element={
                  <RoleBasedRoute
                    element={<Employeelayout />}
                    allowedRoles={["team"]}
                    requiredPermission="employee_management"
                  />
                }
              />
              <Route
                path="/team/roles"
                element={
                  <RoleBasedRoute
                    element={<Roleelements />}
                    allowedRoles={["team"]}
                    requiredPermission="roles"
                  />
                }
              />
              <Route
                path="/team/clients"
                element={
                  <RoleBasedRoute
                    element={<ClientMasterElement />}
                    allowedRoles={["team"]}
                    requiredPermission="clients"
                  />
                }
              />
              <Route
                path="/team/activity-tags"
                element={
                  <RoleBasedRoute
                    element={<Activityelement />}
                    allowedRoles={["team"]}
                    requiredPermission="activity_tags"
                  />
                }
              />
              <Route
                path="/team/projects"
                element={
                  <RoleBasedRoute
                    element={<ProjectsMasterElements />}
                    allowedRoles={["team"]}
                    requiredPermission="projects"
                  />
                }
              />
              <Route
                path="/salesperson/projects"
                element={
                  <RoleBasedRoute
                    element={<ProjectsMasterElements />}
                    allowedRoles={["salesperson"]}
                    requiredPermission="projects"
                  />
                }
              />

              <Route
                path="/team/leave"
                element={
                  <LeaveProvider>
                    <RoleBasedRoute
                      element={<LeaveForm />}
                      allowedRoles={["team"]}
                      requiredPermission="leaves"
                    />
                  </LeaveProvider>
                }
              />
              <Route
                path="/team/leaves"
                element={
                  <EmployeeProvider>
                    <LeaveProvider>
                      <RoleBasedRoute
                        element={<LeaveManagement />}
                        allowedRoles={["team"]}
                        requiredPermission="leave_management"
                      />
                    </LeaveProvider>
                  </EmployeeProvider>
                }
              />
              <Route
                path="/salesperson/source-master"
                element={
                  <RoleBasedRoute
                    element={<ProjectSourceMasterElement />}
                    allowedRoles={["salesperson"]}
                    requiredPermission="project_source"
                  />
                }
              />

              <Route
                path="/team/source-master"
                element={
                  <RoleBasedRoute
                    element={<ProjectSourceMasterElement />}
                    allowedRoles={["team"]}
                    requiredPermission="project_source"
                  />
                }
              />

              <Route
                path="/team/communication-type-master"
                element={
                  <RoleBasedRoute
                    element={<CommunicationMasterElement />}
                    allowedRoles={["team"]}
                    requiredPermission="communication_type"
                  />
                }
              />

              <Route
                path="/salesperson/communication-type-master"
                element={
                  <RoleBasedRoute
                    element={<CommunicationMasterElement />}
                    allowedRoles={["salesperson"]}
                    requiredPermission="communication_type"
                  />
                }
              />

              <Route
                path="/team/account-master"
                element={
                  <RoleBasedRoute
                    element={<AccountMasterElement />}
                    allowedRoles={["team"]}
                    requiredPermission="account_master"
                  />
                }
              />
              <Route
                path="/team/notes-management"
                element={
                  <RoleBasedRoute
                    element={<NotesManagementElement />}
                    allowedRoles={["team"]}
                    requiredPermission="notes_management"
                  />
                }
              />

              {/* <Route
            path="/team/manage-leaves"
            element={
              <LeaveProvider>
                <RoleBasedRoute element={<PMleaves/>} allowedRoles={["team"]} />
                </LeaveProvider>
            }
          />
          <Route
            path="/team/projects-assigned"
            element={
              <UserProvider>
                <RoleBasedRoute element={<Empprojects/>} allowedRoles={["team"]} />
              </UserProvider>
            }
          /> */}

              <Route
                path="/team/performance-sheet"
                element={
                  <UserProvider>
                    <BDProjectsAssignedProvider>
                      <RoleBasedRoute
                        element={<Addsheet />}
                        allowedRoles={["team"]}
                      />
                    </BDProjectsAssignedProvider>
                  </UserProvider>
                }
              />
              <Route
                path="/team/projects/tasks/:project_id"
                element={
                  <TaskProvider>
                    <BDProjectsAssignedProvider>
                      <TLProvider>
                        <PMProvider>
                          <ProjectMasterProvider>
                            <RoleBasedRoute
                              element={<Task />}
                              allowedRoles={["team"]}
                              requiredPermission="projects"
                            />
                          </ProjectMasterProvider>
                        </PMProvider>
                      </TLProvider>
                    </BDProjectsAssignedProvider>
                  </TaskProvider>
                }
              />
              {/* <Route
            path="/team/tasks/:project_id"
            element={
                 <TaskProvider>
                <BDProjectsAssignedProvider>
                  <TLProvider>
                    <PMProvider>
                  <ProjectMasterProvider>
                    <RoleBasedRoute element={<Task />} allowedRoles={["team"]}  />
                  </ProjectMasterProvider>
                  </PMProvider>
                  </TLProvider>
                  
                </BDProjectsAssignedProvider>
              </TaskProvider>
            }
          /> */}
              <Route
                path="/team/reporting"
                element={
                  <RoleBasedRoute
                    element={<ReportingManagement />}
                    allowedRoles={["team"]}
                  />
                }
              />
              <Route
                path="/team/Manage-sheets"
                element={
                  <PMProvider>
                    <BDProjectsAssignedProvider>
                      <RoleBasedRoute
                        element={<Managesheets />}
                        allowedRoles={["team"]}
                        requiredPermission="manage_sheets_inside_performance_sheets"
                      />
                    </BDProjectsAssignedProvider>
                  </PMProvider>
                }
              />

              <Route
                path="/team/previous-sheets"
                element={
                  <PMProvider>
                    <BDProjectsAssignedProvider>
                      <RoleBasedRoute
                        element={<PreviousHistory />}
                        allowedRoles={["team"]}
                        requiredPermission="previous_sheets"
                      />
                    </BDProjectsAssignedProvider>
                  </PMProvider>
                }
              />

              <Route
                path="/team/Manage-sheets-History"
                element={
                  <PMProvider>
                    <BDProjectsAssignedProvider>
                      <RoleBasedRoute
                        element={<Performahistory />}
                        allowedRoles={["team"]}
                        requiredPermission="unfilled_sheets_inside_performance_sheets"
                      />
                    </BDProjectsAssignedProvider>
                  </PMProvider>
                }
              />

              <Route
                path="/team/Pending-sheets"
                element={
                  <PMProvider>
                    <BDProjectsAssignedProvider>
                      <RoleBasedRoute
                        element={<Pendingsheets />}
                        allowedRoles={["team"]}
                        requiredPermission="pending_sheets_inside_performance_sheets"
                      />
                    </BDProjectsAssignedProvider>
                  </PMProvider>
                }
              />
              <Route
                path="/team/performance-sheet-History"
                element={
                  <UserProvider>
                    <RoleBasedRoute
                      element={<EmpSheetHistory />}
                      allowedRoles={["team"]}
                      requiredPermission="performance_history"
                    />
                  </UserProvider>
                }
              />

              {/* <Route
            path="/team/accessory"
            element={
                <RoleBasedRoute element={<Accessory/>} allowedRoles={["team"]} />
            }
          /> */}
              {/* <Route
            path="/team/leaves"
            element={
              <LeaveProvider>
                <RoleBasedRoute element={<LeaveForm/>} allowedRoles={["team"]} />
                </LeaveProvider>
            }
          /> */}

              <Route
                path="/admin/users"
                element={
                  <RoleBasedRoute
                    element={<UserManagement />}
                    allowedRoles={["admin"]}
                  />
                }
              />
              <Route
                path="/hr/employees"
                element={
                  <RoleBasedRoute
                    element={<Employeelayout />}
                    allowedRoles={["hr"]}
                  />
                }
              />
              <Route
                path="/hr/users/:id"
                element={
                  <RoleBasedRoute
                    element={<EmployeeDetail />}
                    allowedRoles={["hr"]}
                  />
                }
              />
              <Route
                path="/hr/leaves"
                element={
                  <EmployeeProvider>
                    <LeaveProvider>
                      <RoleBasedRoute
                        element={<LeaveManagement />}
                        allowedRoles={["hr"]}
                      />
                    </LeaveProvider>
                  </EmployeeProvider>
                }
              />

              <Route
                path="/hr/profile"
                element={
                  <RoleBasedRoute
                    allowedRoles={["hr"]}
                    element={
                      <EmployeeProvider>
                        <ProfileProvider>
                          <Profile />
                        </ProfileProvider>
                      </EmployeeProvider>
                    }
                  />
                }
              />
              <Route
                path="/team/profile"
                element={
                  <RoleBasedRoute
                    allowedRoles={["team"]}
                    element={
                      <EmployeeProvider>
                        <ProfileProvider>
                          <Profile />
                        </ProfileProvider>
                      </EmployeeProvider>
                    }
                  />
                }
              />

               <Route
                path="/operation/profile"
                element={
                  <RoleBasedRoute
                    allowedRoles={["operation"]}
                    element={
                      <EmployeeProvider>  
                        <ProfileProvider>
                          <Profile />
                        </ProfileProvider>
                      </EmployeeProvider>
                    }
                  />
                }
              />
                   <Route
                path="/operation/leave"
                element={
                  <LeaveProvider>
                    <RoleBasedRoute
                      element={<LeaveForm />}
                      allowedRoles={["operation"]}
                      requiredPermission="leaves"
                    />
                  </LeaveProvider>
                }
              />
              <Route
                path="/operation/permission"
                element={
                  <RoleBasedRoute
                    element={<PermissionsManagement />}
                    allowedRoles={["operation"]}
                    requiredPermission="permission"
                  />
                }
              />

                 <Route
                path="/operation/Sheet-reporting"
                element={
                  <RoleBasedRoute
                    element={<SheetReporting />}
                    allowedRoles={["operation"]}
                  />
                }
              />

              <Route
                path="/operation/Sheet-reporting/team-data/:teamName"
                element={
                  <RoleBasedRoute
                    element={<SheetTeamData />}
                    allowedRoles={["operation"]}
                  />
                }
              />
               <Route
                path="/operation/user-sheets/:id"
                element={
                  <RoleBasedRoute
                    element={<UserSheetReportingSub />}
                    allowedRoles={["operation"]}
                
                  />
                }
              />
                      <Route
                path="/operation/reporting/team-data/:teamName"
                element={
                  <RoleBasedRoute
                    element={<TeamData />}
                    allowedRoles={["operation"]}
                  />
                }
              />
               <Route
                path="/operation/dashboard"
                element={
                  <RoleBasedRoute
                    element={<SuperAdminDashboard />}
                    allowedRoles={["operation"]}
                  />
                }
              />

              <Route
                path="/operation/users"
                element={
                  <RoleBasedRoute
                    element={<Employeelayout />}
                    allowedRoles={["operation"]}
                    requiredPermission="employee_management"
                  />
                }
              />

              <Route
                path="/operation/roles"
                element={
                  <RoleBasedRoute
                    element={<Roleelements />}
                    allowedRoles={["operation"]}
                    requiredPermission="roles"
                  />
                }
              />

              <Route
                path="/operation/team"
                element={
                  <RoleBasedRoute
                    element={<Teamelement />}
                    allowedRoles={["operation"]}
                    requiredPermission="team"
                  />
                }
              />

              <Route
                path="/operation/teams"
                element={
                  <RoleBasedRoute
                    element={<BDTeamelement />}
                    allowedRoles={["operation"]}
                    requiredPermission="teams"
                  />
                }
              />

              <Route
                path="/operation/clients"
                element={
                  <RoleBasedRoute
                    element={<ClientMasterElement />}
                    allowedRoles={["operation"]}
                    requiredPermission="clients"
                  />
                }
              />
              <Route
                path="/operation/projects"
                element={
                  <RoleBasedRoute
                    element={<ProjectsMasterElements />}
                    allowedRoles={["operation"]}
                    requiredPermission="projects"
                  />
                }
              />
              <Route
                path="/operation/clients/client-data/:client_id"
                element={
                  <RoleBasedRoute
                    element={<ClientData />}
                    allowedRoles={["operation"]}
                    requiredPermission="clients"
                  />
                }
              />
                   <Route
                path="/operation/department"
                element={
                  <RoleBasedRoute
                    element={<Departmentelements />}
                    allowedRoles={["operation"]}
                    requiredPermission="department"
                  />
                }
              />

              <Route
                path="/operation/activity-tags"
                element={
                  <RoleBasedRoute
                    element={<Activityelement />}
                    allowedRoles={["operation"]}
                    requiredPermission="activity_tags"
                  />
                }
              />

              <Route
                path="/operation/projects/tasks/:project_id"
                element={
                  <TaskProvider>
                    <BDProjectsAssignedProvider>
                      <TLProvider>
                        <PMProvider>
                          <ProjectMasterProvider>
                            <RoleBasedRoute
                              element={<Task />}
                              allowedRoles={["operation"]}
                              requiredPermission="projects"
                            />
                          </ProjectMasterProvider>
                        </PMProvider>
                      </TLProvider>
                    </BDProjectsAssignedProvider>
                  </TaskProvider>
                }
              />
              <Route
                path="/operation/source-master"
                element={
                  <RoleBasedRoute
                    element={<ProjectSourceMasterElement />}
                    allowedRoles={["operation"]}
                    requiredPermission="project_source"
                  />
                }
              />
              <Route
                path="/operation/communication-type-master"
                element={
                  <RoleBasedRoute
                    element={<CommunicationMasterElement />}
                    allowedRoles={["operation"]}
                    requiredPermission="communication_type"
                  />
                }
              />

              <Route
                path="/operation/account-master"
                element={
                  <RoleBasedRoute
                    element={<AccountMasterElement />}
                    allowedRoles={["operation"]}
                    requiredPermission="account_master"
                  />
                }
              />
              <Route
                path="/operation/notes-management"
                element={
                  <RoleBasedRoute
                    element={<NotesManagementElement />}
                    allowedRoles={["operation"]}
                    requiredPermission="notes_management"
                  />
                }
              />

              <Route
                path="/operation/Manage-sheets"
                element={
                  <PMProvider>
                    <BDProjectsAssignedProvider>
                      <RoleBasedRoute
                        element={<Managesheets />}
                        allowedRoles={["operation"]}
                        requiredPermission="manage_sheets_inside_performance_sheets"
                      />
                    </BDProjectsAssignedProvider>
                  </PMProvider>
                }
              />

              <Route
                path="/operation/previous-sheets"
                element={
                  <PMProvider>
                    <BDProjectsAssignedProvider>
                      <RoleBasedRoute
                        element={<PreviousHistory />}
                        allowedRoles={["operation"]}
                        requiredPermission="previous_sheets"
                      />
                    </BDProjectsAssignedProvider>
                  </PMProvider>
                }
              />

              <Route
                path="/operation/Manage-sheets-History"
                element={
                  <PMProvider>
                    <BDProjectsAssignedProvider>
                      <RoleBasedRoute
                        element={<Performahistory />}
                        allowedRoles={["operation"]}
                        requiredPermission="unfilled_sheets_inside_performance_sheets"
                      />
                    </BDProjectsAssignedProvider>
                  </PMProvider>
                }
              />

              <Route
                path="/operation/Pending-sheets"
                element={
                  <PMProvider>
                    <BDProjectsAssignedProvider>
                      <RoleBasedRoute
                        element={<Pendingsheets />}
                        allowedRoles={["operation"]}
                        requiredPermission="pending_sheets_inside_performance_sheets"
                      />
                    </BDProjectsAssignedProvider>
                  </PMProvider>
                }
              />

              <Route
                path="/operation/offline-hours"
                element={
                  <RoleBasedRoute
                    element={<OfflineHours />}
                    allowedRoles={["operation"]}
                    requiredPermission="communication_type"
                  />
                }
              />

              <Route
                path="/operation/leaves"
                element={
                  <EmployeeProvider>
                    <LeaveProvider>
                      <RoleBasedRoute
                        element={<LeaveManagement />}
                        allowedRoles={["operation"]}
                        requiredPermission="leave_management"
                      />
                    </LeaveProvider>
                  </EmployeeProvider>
                }
              />
              <Route
                path="/operation/reporting"
                element={
                  <RoleBasedRoute
                    element={<ReportingManagement />}
                    allowedRoles={["operation"]}
                  />
                }
              />

              <Route
                path="/operation/leave-reporting"
                element={
                  <LeaveProvider>
                    <RoleBasedRoute
                      element={<LeaveReporting />}
                      allowedRoles={["operation"]}
                    />
                  </LeaveProvider>
                }
              />
              <Route
                path="/operation/reporting/team-data/:teamName"
                element={
                  <RoleBasedRoute
                    element={<TeamData />}
                    allowedRoles={["operation"]}
                  />
                }
              />

              <Route
                path="/operation/users/:id"
                element={
                  <RoleBasedRoute
                    element={<EmployeeDetailMain />}
                    allowedRoles={["operation"]}
                    requiredPermission="employee_management"
                  />
                }
              />
                    <Route
                path="/operation/users"
                element={
                  <RoleBasedRoute
                    element={<UserManagement />}
                    allowedRoles={["operation"]}
                  />
                }
              />



              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
                        {showRoleModal && <RoleSwitchModal />}
        </div>
      </ImportProvider>
    </AuthProvider>
  );
};
export default AppRoutes;
