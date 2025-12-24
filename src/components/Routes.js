import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import { useEffect ,useState  } from "react";
import { Menu } from "lucide-react"; 
import { Pendingsheets } from "./pages/bd/Managesheets/Pendingsheets";
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
import ProjectManagerDashboard from "./pages/Pm/ProjectManagerDashboard";
import TeamleaderDashboard from "./pages/Tl/TeamleaderDashboard";
import {Accessoryelements} from "./pages/hr/Accessories/Accessoryelements";
import {AssignAccessoryelements} from "./pages/hr/AssignAccessory/AssignAccessoryelements";
// import AddAccessories from "./pages/hr/Accessories/AddAccessories";
// import {Accessorytable} from "./pages/hr/Accessories/Accessorytable";
// import {Category} from "./pages/hr/Categories/Category";
import { CategoryProvider } from "./context/CategoryContext";
import { AccessoryProvider } from "./context/AccessoryContext";
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
import {TLassign} from "./pages/Tl/TLmanagement/TLassign";
import {TLunassigned} from "./pages/Tl/TLmanagement/TLunassigned";
import {PMunassigned} from "./pages/Pm/PMmanagement/PMunassigned";
import {PMassign} from "./pages/Pm/PMmanagement/PMassign";
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
// import { BDProjectsAssignedProvider } from "./context/BDProjectsassigned";
// import { DepartmentProvider } from "./context/DepartmentContext";
// import { PMProvider } from "./context/PMContext";
// import EmployeeDetailHrEmployeeDetail from "./pages/hr/Employee/HrEmployeeDetail";
const RoleBasedRoute = ({ element, allowedRoles }) => {
  // const { user } = useAuth();
  const user = localStorage.getItem("userData");
    // console.log("userdata",user);
  // console.log("routes", user);
  if (!user) return <Navigate to="/" />;

  // console.log("Logged-in User:", user);

  const userRole = localStorage.getItem("user_name");
  // console.log("Extracted Role:", userRole);

  const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase().replace(/\s+/g, ""));

  return normalizedAllowedRoles.includes(userRole) ? element : <Navigate to="/" />;
};






const AppRoutes = () => {
  const [role, setRole] = useState(localStorage.getItem("user_name") || "");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation(); // Get current route
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

// const hideSidebarRoutes = ["/"]; // Add more public routes if needed
// const shouldShowSidebar = !hideSidebarRoutes.includes(location.pathname);
 
    // console.log("role 1212121221",role);
const hideSidebarRoutes = ["/"]; // Add more public routes if needed
const hasRole = !!localStorage.getItem("user_name"); // Check if any role is present
const shouldShowSidebar = !hideSidebarRoutes.includes(location.pathname) && hasRole;





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
    <div
      className=""
      onClick={() => setIsSidebarOpen(false)}
    />
  )}

  {/* 👇 Main content */}
<div
  className={`overflow-hidden flex-1 ${
    shouldShowSidebar && isSidebarOpen ? "ml-72" : "ml-0 sm:ml-24"
  } py-2.5 px-4`}
>



        <Routes>
  
          <Route
            path="/admin/dashboard"
            element={<RoleBasedRoute element={<AdminDashboard />} allowedRoles={["admin"]} />}
          />

          <Route
            path="/superadmin/dashboard"
            element={<RoleBasedRoute element={<SuperAdminDashboard />} allowedRoles={["superadmin"]} />}
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
            path="/superadmin/roles"
            element={<RoleBasedRoute element={<Roleelements />} allowedRoles={["superadmin"]} />}
          />
         <Route path="/superadmin/permission"
          element={<RoleBasedRoute element={<PermissionsManagement />} allowedRoles={["superadmin"]} />}
        />
              <Route
            path="/superadmin/department"
            element={<RoleBasedRoute element={<Departmentelements />} allowedRoles={["superadmin"]} />}
          />
          <Route
            path="/superadmin/activity-tags"
            element={<RoleBasedRoute element={<Activityelement />} allowedRoles={["superadmin"]} />}
          />
           <Route
            path="/superadmin/users"
            element={<RoleBasedRoute element={<Employeelayout />} allowedRoles={["superadmin"]} />}
          />
      <Route
            path="/superadmin/performance-sheet"
            element={
              <UserProvider>
                <RoleBasedRoute element={<Addsheet />} allowedRoles={["superadmin"]} />
              </UserProvider>
            }
          />


          <Route
             path="/superadmin/manage-leaves"
            element={
              <LeaveProvider>
                <RoleBasedRoute element={<PMleaves/>} allowedRoles={["superadmin"]} />
                </LeaveProvider>
            }
          />
          



          <Route
            path="/superadmin/Manage-sheets"
            element={
                    <PMProvider>
              <BDProjectsAssignedProvider>
                <RoleBasedRoute element={<Managesheets/>} allowedRoles={["superadmin"]} />
                </BDProjectsAssignedProvider>
                </PMProvider>
            }
          />
              <Route
            path="/superadmin/Manage-sheets-History"
            element={
                    <PMProvider>
              <BDProjectsAssignedProvider>
                <RoleBasedRoute element={<Performahistory/>} allowedRoles={["superadmin"]} />
                </BDProjectsAssignedProvider>
                </PMProvider>
            }
          />

        <Route
            path="/superadmin/Pending-sheets"
            element={
                    <PMProvider>
              <BDProjectsAssignedProvider>
                <RoleBasedRoute element={<Pendingsheets/>} allowedRoles={["superadmin"]} />
                </BDProjectsAssignedProvider>
                </PMProvider>
            }
          />

          
  <Route
            path="/superadmin/theme"
            element={<RoleBasedRoute element={<ColorPalettePage />} allowedRoles={["superadmin"]} />}
          />



          <Route
            path="/superadmin/team"
            element={<RoleBasedRoute element={<Teamelement />} allowedRoles={["superadmin"]} />}
          />

          <Route
             path="/superadmin/clients"
             element={<RoleBasedRoute element={<ClientMasterElement />} allowedRoles={["superadmin"]} />}
           />



       <Route
            path="/superadmin/projects"
            element={<RoleBasedRoute element={<ProjectsMasterElements />} allowedRoles={["superadmin"]} />}
          />
              <Route
            path="/superadmin/source-master"
            element={<RoleBasedRoute element={<ProjectSourceMasterElement />} allowedRoles={["superadmin"]} />}
          />
           
           <Route
            path="/superadmin/communication-type-master"
            element={<RoleBasedRoute element={<CommunicationMasterElement />} allowedRoles={["superadmin"]} />}
          />

          <Route
            path="/superadmin/account-master"
            element={<RoleBasedRoute element={<AccountMasterElement />} allowedRoles={["superadmin"]} />}
          />
              <Route
            path="/superadmin/notes-management"
            element={<RoleBasedRoute element={<NotesManagementElement />} allowedRoles={["superadmin"]} />}
          />

          <Route
            path="/superadmin/projects/projects-detail/:project_id"
            element={
                 <TaskProvider> 
                  <ProjectMasterProvider>
            <RoleBasedRoute element={<ProjectDetail />} allowedRoles={["superadmin"]} />
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
                    <RoleBasedRoute element={<Task />} allowedRoles={["superadmin"]} />
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
                <RoleBasedRoute element={<Empprojects/>} allowedRoles={["superadmin"]} />
              </UserProvider>
            }
          />
          <Route
            path="/superadmin/performance-sheet-History"
            element={
              <UserProvider>
                <RoleBasedRoute element={<EmpSheetHistory/>} allowedRoles={["superadmin"]} />
              </UserProvider>
            }
          />
          <Route
            path="/superadmin/leave"
            element={
              <LeaveProvider>
                <RoleBasedRoute element={<LeaveForm/>} allowedRoles={["superadmin"]} />
                </LeaveProvider>
            }
          />


                 <Route
            path="/superadmin/leaves"
            element={
              <LeaveProvider>
                <RoleBasedRoute element={<LeaveManagement/>} allowedRoles={["superadmin"]} />
                </LeaveProvider>
            }
          />
              <Route
            path="/superadmin/users/:id"
            element={<RoleBasedRoute element={<EmployeeDetail />} allowedRoles={["superadmin"]} />}
          />
              <Route
            path="/tl/users/:id"
            element={<RoleBasedRoute element={<EmployeeDetail />} allowedRoles={["tl"]} />}
          />
              <Route
            path="/projectmanager/users/:id"
            element={<RoleBasedRoute element={<EmployeeDetail />} allowedRoles={["projectmanager"]} />}
          />
              <Route
            path="/team/users/:id"
            element={<RoleBasedRoute element={<EmployeeDetail />} allowedRoles={["team"]} />}
          />
              <Route
            path="/billingmanager/users/:id"
            element={<RoleBasedRoute element={<EmployeeDetail />} allowedRoles={["billingmanager"]} />}
          />
           <Route
            path="/superadmin/teams"
            element={<RoleBasedRoute element={<BDTeamelement />} allowedRoles={["superadmin"]} />}
          />

          <Route
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
</Route>
 <Route
            path="/superadmin"
            element={<RoleBasedRoute element={[<Assignedelement />]} allowedRoles={["superadmin"]} />}
          >
          <Route
    path="assigned-projects"
    element={<RoleBasedRoute element={<Assignedtable />} allowedRoles={["superadmin"]} />}
  />
  <Route
    path="not-assigned-projects"
    element={<RoleBasedRoute element={<NotAssignedTable />} allowedRoles={["superadmin"]} />}
  />
   
</Route>
 <Route
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
   
</Route>
 <Route
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
   
</Route>
 <Route
            path="/tl"
            element={<RoleBasedRoute element={[<Assignedelement />]} allowedRoles={["tl"]} />}
          >
          <Route
    path="assigned-projects"
    element={<RoleBasedRoute element={<Assignedtable />} allowedRoles={["tl"]} />}
  />
  <Route
    path="not-assigned-projects"
    element={<RoleBasedRoute element={<NotAssignedTable />} allowedRoles={["tl"]} />}
  />
   
</Route>
 <Route
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
   
</Route>




         <Route
            path="/billingmanager/Manage-sheets-History"
            element={
                    <PMProvider>
              <BDProjectsAssignedProvider>
                <RoleBasedRoute element={<Performahistory/>} allowedRoles={["billingmanager"]} />
                </BDProjectsAssignedProvider>
                </PMProvider>
            }
          />

        <Route
            path="/billingmanager/Pending-sheets"
            element={
                    <PMProvider>
              <BDProjectsAssignedProvider>
                <RoleBasedRoute element={<Managesheets/>} allowedRoles={["billingmanager"]} />
                </BDProjectsAssignedProvider>
                </PMProvider>
            }
          />

   <Route
            path="/billingmanager/roles"
            element={<RoleBasedRoute element={<Roleelements />} allowedRoles={["billingmanager"]} />}
          />
   <Route
            path="/billingmanager/department"
            element={<RoleBasedRoute element={<Departmentelements />} allowedRoles={["billingmanager"]} />}
          />



               <Route
             path="/billingmanager/manage-leaves"
            element={
              <LeaveProvider>
                <RoleBasedRoute element={<PMleaves/>} allowedRoles={["billingmanager"]} />
                </LeaveProvider>
            }
          />

          <Route
            path="/billingmanager/leave"
            element={
              <LeaveProvider>
                <RoleBasedRoute element={<LeaveForm/>} allowedRoles={["billingmanager"]} />
                </LeaveProvider>
            }
          />

                <Route
            path="/billingmanager/projects-assigned"
            element={
              <UserProvider>
                <RoleBasedRoute element={<Empprojects/>} allowedRoles={["billingmanager"]} />
              </UserProvider>
            }
          />

                <Route
            path="/billingmanager/performance-sheet"
            element={
              <UserProvider>
                <RoleBasedRoute element={<Addsheet />} allowedRoles={["billingmanager"]} />
              </UserProvider>
            }
          />

                <Route
            path="/billingmanager/performance-sheet-History"
            element={
              <UserProvider>
                <RoleBasedRoute element={<EmpSheetHistory/>} allowedRoles={["billingmanager"]} />
              </UserProvider>
            }
          />
          <Route
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
</Route>

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
                    <RoleBasedRoute element={<Task />} allowedRoles={["billingmanager"]} />
                  </ProjectMasterProvider>
                  </PMProvider>
                  </TLProvider>
                  
                </BDProjectsAssignedProvider>
              </TaskProvider>
            }
          />

   <Route
            path="/billingmanager"
            element={<RoleBasedRoute element={<Assignedelement />} allowedRoles={["billingmanager"]} />}
          >

          <Route
            path="/billingmanager/dashboard"
            element={<RoleBasedRoute element={<BDDashboard />} allowedRoles={["billingmanager"]} />}
          />
      


 <Route
            path="/billingmanager/users/:id"
            element={<RoleBasedRoute element={<EmployeeDetail />} allowedRoles={["billingmanager"]} />}
          />

   <Route
            path="/billingmanager/users"
            element={<RoleBasedRoute element={<Employeelayout />} allowedRoles={["billingmanager"]} />}
          />
          
          <Route

            path="/billingmanager/projects/projects-detail/:project_id"
            element={
             <TaskProvider>
              <ProjectMasterProvider>
            <RoleBasedRoute element={<ProjectDetail />} allowedRoles={["billingmanager"]} />
           </ProjectMasterProvider>
            </TaskProvider>
          }
          />
             
          <Route
            path="/billingmanager/activity-tags"
            element={<RoleBasedRoute element={<Activityelement />} allowedRoles={["billingmanager"]} />}
          />

          <Route
            path="/billingmanager/projects"
            element={<RoleBasedRoute element={<ProjectsMasterElements />} allowedRoles={["billingmanager"]} />}
          />
          
          <Route
            path="/billingmanager/clients"
            element={<RoleBasedRoute element={<Clientelementsbd />} allowedRoles={["billingmanager"]} />}
          />

          <Route
            path="/billingmanager/teams"
            element={<RoleBasedRoute element={<BDTeamelement />} allowedRoles={["billingmanager"]} />}
          />
              <Route
            path="/billingmanager/team"
            element={<RoleBasedRoute element={<Teamelement />} allowedRoles={["billingmanager"]} />}
          />


             <Route
            path="/billingmanager/manage-sheets"
            element={
              <BDProjectsAssignedProvider>
                <PMProvider>
                <RoleBasedRoute element={<Managesheets/>} allowedRoles={["billingmanager"]} />
                </PMProvider>
                </BDProjectsAssignedProvider>
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







</Route>





         

          <Route
            path="/projectmanager/dashboard"
            element={<RoleBasedRoute element={<ProjectManagerDashboard />} allowedRoles={["projectmanager"]} />}
          />

   
           <Route
  path="/projectmanager"
  element={<AssignelementPM />}
>
  <Route
    path="assign"
    element={<RoleBasedRoute element={<PMassign />} allowedRoles={["projectmanager"]} />}
  />
  <Route
    path="unassigned"
    element={<RoleBasedRoute element={<PMunassigned />} allowedRoles={["projectmanager"]} />}
  />
</Route>
               <Route
            path="/projectmanager/department"
            element={<RoleBasedRoute element={<Departmentelements />} allowedRoles={["projectmanager"]} />}
          />
  <Route
            path="/projectmanager/team"
            element={<RoleBasedRoute element={<Teamelement />} allowedRoles={["projectmanager"]} />}
          />
       <Route
            path="/projectmanager/teams"
            element={<RoleBasedRoute element={<BDTeamelement />} allowedRoles={["projectmanager"]} />}
          />
   <Route
            path="/projectmanager/users"
            element={<RoleBasedRoute element={<Employeelayout />} allowedRoles={["projectmanager"]} />}
          />
                 <Route
            path="/projectmanager/roles"
            element={<RoleBasedRoute element={<Roleelements />} allowedRoles={["projectmanager"]} />}
          />
                  <Route
            path="/projectmanager/leave"
            element={
              <LeaveProvider>
                <RoleBasedRoute element={<LeaveForm/>} allowedRoles={["projectmanager"]} />
                </LeaveProvider>
            }
          />
                 <Route
            path="/projectmanager/activity-tags"
            element={<RoleBasedRoute element={<Activityelement />} allowedRoles={["projectmanager"]} />}
          />


                 <Route
            path="/projectmanager/leaves"
            element={
              <LeaveProvider>
                <RoleBasedRoute element={<LeaveManagement/>} allowedRoles={["projectmanager"]} />
                </LeaveProvider>
            }
          />


           <Route
            path="/projectmanager/clients"
            element={<RoleBasedRoute element={<Clientelements />} allowedRoles={["projectmanager"]} />}
          />

          <Route
            path="/projectmanager/projects"
            element={<RoleBasedRoute element={<ProjectsMasterElements />} allowedRoles={["projectmanager"]} />}
          />
                <Route
            path="/projectmanager/performance-sheet"
            element={
              <UserProvider>
                <RoleBasedRoute element={<Addsheet />} allowedRoles={["projectmanager"]} />
              </UserProvider>
            }
          />

          <Route
            path="/projectmanager/projects/projects-detail/:project_id"
            element={
                 <TaskProvider> 
                  <ProjectMasterProvider>
            <RoleBasedRoute element={<ProjectDetail />} allowedRoles={["projectmanager"]} />
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
                    <RoleBasedRoute element={<Task />} allowedRoles={["projectmanager"]} />
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
                <RoleBasedRoute element={<EmpSheetHistory/>} allowedRoles={["projectmanager"]} />
              </UserProvider>
            }
          />

          <Route
            path="/projectmanager/tasks/:project_id"
            element={
              <TaskProvider> 
                <ProjectMasterProvider>
                <RoleBasedRoute element={<Task />} allowedRoles={["projectmanager"]} />
                </ProjectMasterProvider>
              </TaskProvider>
            }
          />

          <Route
            path="/projectmanager/manage-leaves"
            element={
              <LeaveProvider>
                <RoleBasedRoute element={<PMleaves/>} allowedRoles={["projectmanager"]} />
                </LeaveProvider>
            }
          />

             <Route
            path="/projectmanager/Manage-sheets"
            element={
                    <PMProvider>
              <BDProjectsAssignedProvider>
                <RoleBasedRoute element={<Managesheets/>} allowedRoles={["projectmanager"]} />
                </BDProjectsAssignedProvider>
                </PMProvider>
            }
          />

          
              <Route
            path="/projectmanager/Manage-sheets-History"
            element={
                    <PMProvider>
              <BDProjectsAssignedProvider>
                <RoleBasedRoute element={<Performahistory/>} allowedRoles={["projectmanager"]} />
                </BDProjectsAssignedProvider>
                </PMProvider>
            }
          />

        <Route
            path="/projectmanager/Pending-sheets"
            element={
                    <PMProvider>
              <BDProjectsAssignedProvider>
                <RoleBasedRoute element={<Pendingsheets/>} allowedRoles={["projectmanager"]} />
                </BDProjectsAssignedProvider>
                </PMProvider>
            }
          />
              <Route
            path="/tl/manage-sheets"
            element={
              <BDProjectsAssignedProvider>
                <PMProvider>
                <RoleBasedRoute element={<Managesheets/>} allowedRoles={["tl"]} />
                </PMProvider>
                </BDProjectsAssignedProvider>
            }
          />


   <Route
            path="/tl/Manage-sheets-History"
            element={
                    <PMProvider>
              <BDProjectsAssignedProvider>
                <RoleBasedRoute element={<Performahistory/>} allowedRoles={["tl"]} />
                </BDProjectsAssignedProvider>
                </PMProvider>
            }
          />

        <Route
            path="/tl/Pending-sheets"
            element={
                    <PMProvider>
              <BDProjectsAssignedProvider>
                <RoleBasedRoute element={<Pendingsheets/>} allowedRoles={["tl"]} />
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
            element={<RoleBasedRoute element={<TeamleaderDashboard />} allowedRoles={["tl"]} />}
          />

          {/* <Route
            path="/tl/projects-assigned"
            element={<RoleBasedRoute element={<TLassignedelement />} allowedRoles={["tl"]} />}
          /> */}
   <Route
  path="/tl"
  element={<AssignelementTL />}
>
  <Route
    path="assign"
    element={<RoleBasedRoute element={<TLassign />} allowedRoles={["tl"]} />}
  />
  <Route
    path="unassigned"
    element={<RoleBasedRoute element={<TLunassigned />} allowedRoles={["tl"]} />}
  />
</Route>
   <Route
  path="/team"
  element={<AssignelementTL />}
>
  <Route
    path="assign"
    element={<RoleBasedRoute element={<TLassign />} allowedRoles={["team"]} />}
  />
  <Route
    path="unassigned"
    element={<RoleBasedRoute element={<TLunassigned />} allowedRoles={["team"]} />}
  />
</Route>
          <Route
            path="/tl/tasks/:project_id"
            element={
              <TaskProvider> 
                <ProjectMasterProvider>
                <RoleBasedRoute element={<Task />} allowedRoles={["tl"]} />
                </ProjectMasterProvider>
              </TaskProvider>
            }
          />

          <Route
            path="/tl/manage-leaves"
            element={
              <LeaveProvider>
                <RoleBasedRoute element={<PMleaves/>} allowedRoles={["tl"]} />
                </LeaveProvider>
            }
          />
    <Route
            path="/tl/Manage-sheets-History"
            element={
                    <PMProvider>
              <BDProjectsAssignedProvider>
                <RoleBasedRoute element={<Performahistory/>} allowedRoles={["tl"]} />
                </BDProjectsAssignedProvider>
                </PMProvider>
            }
          />

        <Route
            path="/tl/Pending-sheets"
            element={
                    <PMProvider>
              <BDProjectsAssignedProvider>
                <RoleBasedRoute element={<Managesheets/>} allowedRoles={["tl"]} />
                </BDProjectsAssignedProvider>
                </PMProvider>
            }
          />

          {/*  */}

   <Route
            path="/billingmanager/leaves"
            element={
              <LeaveProvider>
                <RoleBasedRoute element={<LeaveManagement/>} allowedRoles={["billingmanager"]} />
                </LeaveProvider>
            }
          />


  <Route
            path="/tl/department"
            element={<RoleBasedRoute element={<Departmentelements />} allowedRoles={["tl"]} />}
          />
  <Route
            path="/tl/team"
            element={<RoleBasedRoute element={<Teamelement />} allowedRoles={["tl"]} />}
          />
       <Route
            path="/tl/teams"
            element={<RoleBasedRoute element={<BDTeamelement />} allowedRoles={["tl"]} />}
          />
   <Route
            path="/tl/users"
            element={<RoleBasedRoute element={<Employeelayout />} allowedRoles={["tl"]} />}
          />
                 <Route
            path="/tl/roles"
            element={<RoleBasedRoute element={<Roleelements />} allowedRoles={["tl"]} />}
          />
                  <Route
            path="/tl/leave"
            element={
              <LeaveProvider>
                <RoleBasedRoute element={<LeaveForm/>} allowedRoles={["tl"]} />
                </LeaveProvider>
            }
          />
                 <Route
            path="/tl/activity-tags"
            element={<RoleBasedRoute element={<Activityelement />} allowedRoles={["tl"]} />}
          />


                 <Route
            path="/tl/leaves"
            element={
              <LeaveProvider>
                <RoleBasedRoute element={<LeaveManagement/>} allowedRoles={["tl"]} />
                </LeaveProvider>
            }
          />


           <Route
            path="/tl/clients"
            element={<RoleBasedRoute element={<Clientelements />} allowedRoles={["tl"]} />}
          />

          <Route
            path="/tl/projects"
            element={<RoleBasedRoute element={<ProjectsMasterElements />} allowedRoles={["tl"]} />}
          />
                <Route
            path="/tl/performance-sheet"
            element={
              <UserProvider>
                <RoleBasedRoute element={<Addsheet />} allowedRoles={["tl"]} />
              </UserProvider>
            }
          />

          <Route
            path="/tl/projects/projects-detail/:project_id"
            element={
                 <TaskProvider>
                  <ProjectMasterProvider> 
            <RoleBasedRoute element={<ProjectDetail />} allowedRoles={["tl"]} />
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
                    <RoleBasedRoute element={<Task />} allowedRoles={["tl"]} />
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
                    <RoleBasedRoute element={<Task />} allowedRoles={["team"]} />
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
                <RoleBasedRoute element={<EmpSheetHistory/>} allowedRoles={["tl"]} />
              </UserProvider>
            }
          />
          <Route
            path="/tl/performance-sheets"
            element={
              <BDProjectsAssignedProvider>
                <PMProvider>
                  <RoleBasedRoute element={<Managesheets />} allowedRoles={["tl"]} />
                </PMProvider>
              </BDProjectsAssignedProvider>
            }
          />
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
            element={<RoleBasedRoute element={<HrDashboard />} allowedRoles={["hr"]} />}
          />
          <Route
            path="/hr/accessories/assign"
            element={
              <AssignAccessoryProvider>
                <RoleBasedRoute element={<AssignAccessoryelements />} allowedRoles={["hr"]} />
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
                    <RoleBasedRoute element={<Accessoryelements />} allowedRoles={["hr"]} />
                  </AssignAccessoryProvider>
                </AccessoryProvider>
              }
            />
      <Route
            path="/hr/activity-tags"
            element={<RoleBasedRoute element={<Activityelement />} allowedRoles={["hr"]} />}
          />
            
 <Route
            path="/hr/users/:id"
            element={<RoleBasedRoute element={<EmployeeDetail />} allowedRoles={["hr"]} />}
          />
          <Route
            path="/hr/accessory/category"
            element={
              <CategoryProvider>
                <RoleBasedRoute element={<Categoryelements />} allowedRoles={["hr"]}/>
              </CategoryProvider>
            }
          />
  <Route
            path="/hr/clients"
            element={<RoleBasedRoute element={<Clientelements />} allowedRoles={["hr"]} />}
          />

          <Route
            path="/hr/projects"
            element={<RoleBasedRoute element={<ProjectsMasterElements />} allowedRoles={["hr"]} />}
          />


   <Route
            path="/hr/users"
            element={<RoleBasedRoute element={<Employeelayout />} allowedRoles={["hr"]} />}
          />
            <Route
            path="/hr/teams"
            element={<RoleBasedRoute element={<BDTeamelement />} allowedRoles={["hr"]} />}
          />
     <Route
            path="/hr/roles"
            element={<RoleBasedRoute element={<Roleelements />} allowedRoles={["hr"]} />}
          />

  <Route
            path="/hr/department"
            element={<RoleBasedRoute element={<Departmentelements />} allowedRoles={["hr"]} />}
          />
  <Route
            path="/hr/team"
            element={<RoleBasedRoute element={<Teamelement />} allowedRoles={["hr"]} />}
          />

          <Route
            path="/team/dashboard"
            element={<RoleBasedRoute element={<EmployeeDashboard />} allowedRoles={["team"]} />}
          />
          <Route
            path="/team/department"
            element={<RoleBasedRoute element={<Departmentelements />} allowedRoles={["team"]} />}
          />
  <Route
            path="/team/team"
            element={<RoleBasedRoute element={<Teamelement />} allowedRoles={["team"]} />}
          />
       <Route
            path="/team/teams"
            element={<RoleBasedRoute element={<BDTeamelement />} allowedRoles={["team"]} />}
          />
   <Route
            path="/team/users"
            element={<RoleBasedRoute element={<Employeelayout />} allowedRoles={["team"]} />}
          />
                 <Route
            path="/team/roles"
            element={<RoleBasedRoute element={<Roleelements />} allowedRoles={["team"]} />}
          />
             <Route
            path="/team/clients"
            element={<RoleBasedRoute element={<Clientelements />} allowedRoles={["team"]} />}
          />
     <Route
            path="/team/activity-tags"
            element={<RoleBasedRoute element={<Activityelement />} allowedRoles={["team"]} />}
          />
          <Route
            path="/team/projects"
            element={<RoleBasedRoute element={<ProjectsMasterElements />} allowedRoles={["team"]} />}
          />
          <Route
            path="/team/leave"
            element={
              <LeaveProvider>
                <RoleBasedRoute element={<LeaveForm/>} allowedRoles={["team"]} />
                </LeaveProvider>
            }
          />
        <Route
            path="/team/leaves"
            element={
              <LeaveProvider>
                <RoleBasedRoute element={<LeaveManagement/>} allowedRoles={["team"]} />
                </LeaveProvider>
            }
          />

                 <Route
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
          />
   
          <Route
            path="/team/performance-sheet"
            element={
              <UserProvider>
                <RoleBasedRoute element={<Addsheet />} allowedRoles={["team"]} />
              </UserProvider>
            }
          />

            <Route
            path="/team/Manage-sheets"
            element={
                    <PMProvider>
              <BDProjectsAssignedProvider>
                <RoleBasedRoute element={<Managesheets/>} allowedRoles={["team"]} />
                </BDProjectsAssignedProvider>
                </PMProvider>
            }
          />
              <Route
            path="/team/Manage-sheets-History"
            element={
                    <PMProvider>
              <BDProjectsAssignedProvider>
                <RoleBasedRoute element={<Performahistory/>} allowedRoles={["team"]} />
                </BDProjectsAssignedProvider>
                </PMProvider>
            }
          />

        <Route
            path="/team/Pending-sheets"
            element={
                    <PMProvider>
              <BDProjectsAssignedProvider>
                <RoleBasedRoute element={<Pendingsheets/>} allowedRoles={["team"]} />
                </BDProjectsAssignedProvider>
                </PMProvider>
            }
          />
          <Route
            path="/team/performance-sheet-History"
            element={
              <UserProvider>
                <RoleBasedRoute element={<EmpSheetHistory/>} allowedRoles={["team"]} />
              </UserProvider>
            }
          />
  
          <Route
            path="/team/accessory"
            element={
                <RoleBasedRoute element={<Accessory/>} allowedRoles={["team"]} />
            }
          />
          {/* <Route
            path="/team/leaves"
            element={
              <LeaveProvider>
                <RoleBasedRoute element={<LeaveForm/>} allowedRoles={["team"]} />
                </LeaveProvider>
            }
          /> */}

          <Route
            path="/team/tasks/:project_id"
            element={
                 <TaskProvider>
                <BDProjectsAssignedProvider>
                  <TLProvider>
                    <PMProvider>
                  <ProjectMasterProvider>
                    <RoleBasedRoute element={<Task />} allowedRoles={["team"]} />
                  </ProjectMasterProvider>
                  </PMProvider>
                  </TLProvider>
                  
                </BDProjectsAssignedProvider>
              </TaskProvider>
            }
          />
          <Route
            path="/admin/users"
            element={<RoleBasedRoute element={<UserManagement />} allowedRoles={["admin"]} />}
          />
          <Route
            path="/hr/employees"
            element={<RoleBasedRoute element={<Employeelayout/>} allowedRoles={["hr"]} />}
          />
          <Route
            path="/hr/users/:id"
            element={<RoleBasedRoute element={<EmployeeDetail />} allowedRoles={["hr"]} />}

            
            
          />
          <Route
            path="/hr/leaves"
            element={
              <LeaveProvider>
                <RoleBasedRoute element={<LeaveManagement/>} allowedRoles={["hr"]} />
                </LeaveProvider>
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
  <Route path="*" element={<NotFound />} />

          </Routes>
      </div>
    </div>
    </ImportProvider>
    </AuthProvider>
    // </AlertProvider>

  );
};
export default AppRoutes;
