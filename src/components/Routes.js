import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import { useEffect ,useState  } from "react";
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
import ColorPalettePage from "./ui/widgets/layout/ColorPalettePage";
import { ImportProvider } from "./context/Importfiles.";
import RedirectToDashboard from "./components/RedirectToDashboard";
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
    <div className="flex">

    {shouldShowSidebar && <Sidebar />}
 
<div className={`flex-1 w-full ${shouldShowSidebar ? "ml-72" : ""} py-2.5 px-4 overflow-hidden`}>

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
          <Route
            path="/superadmin/activity-tags"
            element={<RoleBasedRoute element={<Activityelement />} allowedRoles={["superadmin"]} />}
          />
           <Route
            path="/superadmin/users"
            element={<RoleBasedRoute element={<Employeelayout />} allowedRoles={["superadmin"]} />}
          />


          <Route
             path="/superadmin/manage-leaves"
            element={
              <LeaveProvider>
                <RoleBasedRoute element={<LeaveManagement/>} allowedRoles={["superadmin"]} />
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
            path="/superadmin/theme"
            element={<RoleBasedRoute element={<ColorPalettePage />} allowedRoles={["superadmin"]} />}
          />



          <Route
            path="/superadmin/team"
            element={<RoleBasedRoute element={<Teamelement />} allowedRoles={["superadmin"]} />}
          />

          <Route
            path="/superadmin/clients"
            element={<RoleBasedRoute element={<Clientelements />} allowedRoles={["superadmin"]} />}
          />

          <Route
            path="/superadmin/projects"
            element={<RoleBasedRoute element={<Projectelements />} allowedRoles={["superadmin"]} />}
          />

          <Route
            path="/superadmin/projects/projects-detail/:project_id"
            element={
                 <TaskProvider> 
            <RoleBasedRoute element={<ProjectDetail />} allowedRoles={["superadmin"]} />
                 </TaskProvider> 
                  }
          />

          <Route
            path="/superadmin/assigned-projects"
            element={<RoleBasedRoute element={<Assignedelement />} allowedRoles={["superadmin"]} />}
          />

          <Route
            path="/billingmanager/projects/tasks/:project_id"
            element={
              <TaskProvider>
                <RoleBasedRoute element={<Task />} allowedRoles={["billingmanager"]} />
              </TaskProvider>
            }
          />

 <Route
            path="/superadmin/projects/tasks/:project_id"
            element={
              <TaskProvider>
                <RoleBasedRoute element={<Task />} allowedRoles={["superadmin"]} />
              </TaskProvider>
            }
          />

          <Route
            path="/billingmanager/dashboard"
            element={<RoleBasedRoute element={<BDDashboard />} allowedRoles={["billingmanager"]} />}
          />
          <Route
            path="/superadmin/users/:id"
            element={<RoleBasedRoute element={<EmployeeDetail />} allowedRoles={["superadmin"]} />}
          />
          

 <Route
            path="/hr/users/:id"
            element={<RoleBasedRoute element={<EmployeeDetail />} allowedRoles={["hr"]} />}
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
            <RoleBasedRoute element={<ProjectDetail />} allowedRoles={["billingmanager"]} />
           </TaskProvider>
          }
          />
             
          <Route
            path="/billingmanager/activity-tags"
            element={<RoleBasedRoute element={<Activityelement />} allowedRoles={["billingmanager"]} />}
          />

          <Route
            path="/billingmanager/projects"
            element={<RoleBasedRoute element={<Projectelements />} allowedRoles={["billingmanager"]} />}
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
            path="/billingmanager/projects-assigned"
            element={<RoleBasedRoute element={<Assignedelement />} allowedRoles={["billingmanager"]} />}
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

          <Route
            path="/projectmanager/dashboard"
            element={<RoleBasedRoute element={<ProjectManagerDashboard />} allowedRoles={["projectmanager"]} />}
          />

          <Route
            path="/projectmanager/assigned"
            element={<RoleBasedRoute element={<PMassignedelement />} allowedRoles={["projectmanager"]} />}
          />
          <Route
            path="/projectmanager/assign"
            element={<RoleBasedRoute element={<AssignelementPM />} allowedRoles={["projectmanager"]} />}
          />
          <Route
            path="/projectmanager/tasks/:project_id"
            element={
              <TaskProvider> 
                <RoleBasedRoute element={<Task />} allowedRoles={["projectmanager"]} />
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
            path="/projectmanager/performance-sheets"
            element={
              <BDProjectsAssignedProvider>
                <PMProvider>
                  <RoleBasedRoute element={<Managesheets />} allowedRoles={["projectmanager"]} />
                </PMProvider>
              </BDProjectsAssignedProvider>
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

          <Route
            path="/tl/assigned"
            element={<RoleBasedRoute element={<TLassignedelement />} allowedRoles={["tl"]} />}
          />
          <Route
            path="/tl/assign"
            element={<RoleBasedRoute element={<AssignelementTL />} allowedRoles={["tl"]} />}
          />
          <Route
            path="/tl/tasks/:project_id"
            element={
              <TaskProvider> 
                <RoleBasedRoute element={<Task />} allowedRoles={["tl"]} />
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


          {/*  */}

   <Route
            path="/billingmanager/leaves"
            element={
              <LeaveProvider>
                <RoleBasedRoute element={<LeaveForm/>} allowedRoles={["billingmanager"]} />
                </LeaveProvider>
            }
          />

     <Route
            path="/projectmanager/leaves"
            element={
              <LeaveProvider>
                <RoleBasedRoute element={<LeaveForm/>} allowedRoles={["projectmanager"]} />
                </LeaveProvider>
            }
          />
       <Route
            path="/tl/leaves"
            element={
              <LeaveProvider>
                <RoleBasedRoute element={<LeaveForm/>} allowedRoles={["tl"]} />
                </LeaveProvider>
            }
          />

          {/*  */}

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
            path="/hr/accessory/category"
            element={
              <CategoryProvider>
                <RoleBasedRoute element={<Categoryelements />} allowedRoles={["hr"]}/>
              </CategoryProvider>
            }
          />

            <Route
            path="/hr/teams"
            element={<RoleBasedRoute element={<BDTeamelement />} allowedRoles={["hr"]} />}
          />

          <Route
            path="/team/dashboard"
            element={<RoleBasedRoute element={<EmployeeDashboard />} allowedRoles={["team"]} />}
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
          <Route
            path="/team/leaves"
            element={
              <LeaveProvider>
                <RoleBasedRoute element={<LeaveForm/>} allowedRoles={["team"]} />
                </LeaveProvider>
            }
          />
          <Route
            path="/team/tasks/:project_id"
            element={
              <TaskProvider> 
                <RoleBasedRoute element={<Emptask />} allowedRoles={["team"]} />
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
