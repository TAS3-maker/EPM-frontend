import React, { useState, useEffect,useRef } from "react";
import { useEmployees } from "../../../context/EmployeeContext";
import { useTeam } from "../../../context/TeamContext";
import { useRole } from "../../../context/RoleContext";
import { useAlert } from "../../../context/AlertContext";
import { FaFileCsv, FaGoogle } from "react-icons/fa";
import user_profile from "../../../aasests/profile-img.jpg";
import user_profile_bg_2 from "../../../aasests/user-profile-bg-2.jpg";
import { BarChart, Search ,Eye, EyeOff } from "lucide-react";
import { Loader } from "lucide-react";
import { useImport } from "../../../context/Importfiles.";
import { SectionHeader } from '../../../components/SectionHeader';
import { exportToExcel, importFromExcel, useImportEmployees, fetchGoogleSheetData } from "../../../components/excelUtils";
import { CancelButton, ExportButton, SaveChangeButton, ImportButton, ClearButton, IconDeleteButton, IconEditButton, IconViewButton } from "../../../AllButtons/AllButtons";
import { useNavigate } from 'react-router-dom';
import { useDepartment } from "../../../context/DepartmentContext";
// import { useTLContext } from "../../../context/TLContext";
import Pagination from "../../../components/Pagination";
import { usePermissions } from "../../../context/PermissionContext.jsx";
import { useOutsideClick } from "../../../components/useOutsideClick";
import GlobalTable from '../../../components/GlobalTable';
import { API_URL } from "../../../utils/ApiConfig";

const EmployeeManagement = () => {
  const navigate = useNavigate();
  const {permissions}=usePermissions()
  const { employees, loading,fetchTl,fetchEmployees ,tl, addEmployee, deleteEmployee, updateEmployee, error: contextError ,setTl} = useEmployees(); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [importType, setImportType] = useState(null);
    const [userrole, setUserrole] = useState("");
      const [selectedEmpType, setSelectedEmpType] = useState("Active");
    
  const [showImportOptions, setShowImportOptions] = useState(false);
  const [filterBy, setFilterBy] = useState("name");
  const [googleSheetUrl, setGoogleSheetUrl] = useState("");
const { importEmployees , loading1 } = useImportEmployees();
const [selectedFile, setSelectedFile] = useState(null);
  const { fetchDepartment, department } = useDepartment();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isopen, setIsopen] = useState(false);
    const [teamSearchQuery, setTeamSearchQuery] = useState("");
    const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState("");
    const [selectedTeam, setSelectedTeam] = useState([]);
    const [departmentSearchQuery, setDepartmentSearchQuery] = useState("");

   const [roleSearchQuery, setRoleSearchQuery] = useState("");
    const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState("");
    const [selectedRole, setSelectedRole] = useState([]);
const Role =localStorage.getItem("user_name");
console.log("rolless",Role);
  const [editTeamSearchQuery, setEditTeamSearchQuery] = useState("");
const [isEditTeamDropdownOpen, setIsEditTeamDropdownOpen] = useState(false);
const [selectedEditTeam, setSelectedEditTeam] = useState([]);


const [editRoleSearchQuery, setEditRoleSearchQuery] = useState("");
const [isEditRoleDropdownOpen, setIsEditRoleDropdownOpen] = useState(false);
const [selectedEditRole, setSelectedEditRole] = useState([]);
    
const [isDepartmentDropdownOpen, setIsDepartmentDropdownOpen] = useState(false);
const [selectedDepartment, setSelectedDepartment] = useState([]);
 const {
    importClientData,
    importProjectData,
    importEmployeeData,
    importLoading,
  } = useImport();
  const [departmentId, setDepartmentId] = useState("");
  const [departmentError, setDepartmentError] = useState("");
  const [teamError, setTeamError] = useState("");
  

const [reportingManagers, setReportingManagers] = useState([]);
const [loadingRM, setLoadingRM] = useState(false);


  useEffect(() => { 
fetchDepartment();
  }, []);


  const [validationErrors, setValidationErrors] = useState({});


const getStatusLabel = (status) => (status === 0 ? "Inactive" : "Active");
// console.log('employees:', employees);
// console.log('employees type:', typeof employees);
// console.log('isArray(employees):', Array.isArray(employees));
// console.log('isArray(employees.data):', Array.isArray(employees?.data));
const filteredEmployees = employees.filter((employee) => {
  const isActive = employee.is_active == 1 || employee.is_active === "1" || employee.is_active === 1;
  if (selectedEmpType === "Active" && !isActive) return false;
  if (selectedEmpType === "Inactive" && isActive) return false;

  if (filterBy === "is_active") {
    const statusLabel = getStatusLabel(employee.is_active).toLowerCase().trim();
    const query = searchQuery.toLowerCase().trim();

    // Allow exact or partial matching but exclude dangling partials like "active" in "inactive"
    if (query === "active") {
      return statusLabel === "active";
    }
    if (query === "inactive") {
      return statusLabel === "inactive";
    }
    // Allow substring matching for other queries
    return statusLabel.includes(query);
  }

  const fieldValue = employee[filterBy];
  const value = (fieldValue !== undefined && fieldValue !== null ? String(fieldValue) : "").toLowerCase().trim();

  return value.includes(searchQuery.toLowerCase().trim());
});

const filteredDepartments = department.filter(dep => dep.name.toLowerCase().includes(departmentSearchQuery.toLowerCase()));


  const employeePermission = permissions?.permissions?.[0]?.employee_management;
  const canAddEmployee = employeePermission === "2"

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    importFromExcel(file, (data) => {
      console.log("Imported Data (Before adding to system):", data);
      importEmployees(data);
    });
  };

  const clearFilter = () => {
    setSearchQuery("");
    setFilterBy("name");
  };

  const handleGoogleSheetImport = () => {
    if (!googleSheetUrl) {
      showAlert({ variant: "warning", title: "Missing Link", message: "Please enter a Google Sheets link." });
      return;
    }
    fetchGoogleSheetData(googleSheetUrl, importEmployees);
  };

  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    password: "",
    phone_num: "",
    emergency_phone_num: "",
    address: "",
    team_id: [],
    role_id:[],
    department_id: "",
    profile_pic: null,
    tl_id: "", 
    reporting_manager_id: "",
    employee_id: "",
  });

  const { showAlert } = useAlert();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const indexOfLastEmployee = currentPage * itemsPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - itemsPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstEmployee, indexOfLastEmployee);
  
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  

 const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee);
    
    const getTodayDate = () => new Date().toISOString().split('T')[0];
    
    setEditingEmployee({
        ...employee,
        
        team_id: Array.isArray(employee.team_id)
            ? employee.team_id
            : employee.team_id
            ? [employee.team_id]
            : [],
        
        role_id: Array.isArray(employee.role_id)
            ? employee.role_id
            : employee.role_id
            ? [employee.role_id]
            : [],
        
        reporting_manager_id: employee.reporting_manager_id || "", 
        name: employee.name || null,
        email: employee.email || null,
        phone_num: employee.phone_num || null,
        emergency_phone_num: employee.emergency_phone_num || null,
        address: employee.address || null,
        pm_id: employee.pm_id || null,
        department_id: employee.department_id || null,
        employee_id: employee.employee || null,
        profile_pic: employee.profile_pic || null,
        tl_id: employee.tl_id || null,
        is_active: employee.is_active != null ? employee.is_active : 1,
        
        // 🔥 NEW: Handle inactive_date
        inactive_date: employee.is_active === 0 
            ? (employee.inactive_date || getTodayDate())
            : null
    });

    setValidationErrors({});
};

 
  const handleUpdateEmployee = async () => {
    console.log("before sending", editingEmployee);
    if (!editingEmployee) return;
fetchEmployees()
   
    setValidationErrors({});

    try {
      await updateEmployee(editingEmployee.id, { 
        ...editingEmployee,
        team_id: editingEmployee.team_id,
        role_id: editingEmployee.role_id, 
        tl_id: editingEmployee.tl_id ? Number(editingEmployee.tl_id) : null,
        reporting_manager_id: editingEmployee.reporting_manager_id ? Number(editingEmployee.reporting_manager_id) : null
         });
      setEditingEmployee(null);
      setSelectedEmployee(null);
      // Success alert is handled in context
    } catch (err) {
      console.error("❌ Error updating employee:", err);
      let generalErrorMessage = "Something went wrong while updating the employee.";
      let backendErrors = {};

      if (err.message) {
        try {
          const parsedError = JSON.parse(err.message);
          if (parsedError.errors) {
            backendErrors = parsedError.errors; // Capture all field-specific errors
            // Try to find a relevant message for the general alert
            if (parsedError.errors.email && parsedError.errors.email[0]) {
              generalErrorMessage = parsedError.errors.email[0];
            } else if (Object.values(parsedError.errors).length > 0) {
              // Get the first error message from any field
              generalErrorMessage = Object.values(parsedError.errors)[0][0];
            } else {
              generalErrorMessage = parsedError.message || "Validation failed during update.";
            }
          } else if (parsedError.message) {
            generalErrorMessage = parsedError.message; // General message if no 'errors' object
          }
        } catch (parseError) {
          // If err.message is not valid JSON, use it as-is
          generalErrorMessage = err.message;
        }
      }

      setValidationErrors(backendErrors); // Set the detailed errors for input fields
      showAlert({ variant: "error", title: "Failed", message: generalErrorMessage }); // Show general alert
    }
  };
  // --- END MODIFIED handleUpdateEmployee ---

  const handleDeleteEmployee = async (id) => {
    try {
      await deleteEmployee(id);
    } catch (error) {
      showAlert({ variant: "error", title: "Failed", message: error.message });
    }
  };

  // --- MODIFIED handleAddEmployee ---
  const handleAddEmployee = async () => {
    // Clear previous validation errors
    setValidationErrors({});

    // Client-side basic validation (optional, as backend validates more robustly)
    if (
      !newEmployee.name ||
      !newEmployee.email ||
      !newEmployee.password ||
      !newEmployee.phone_num ||
  !Array.isArray(newEmployee.role_id) ||
    newEmployee.role_id.length === 0    ) {
      showAlert({ variant: "warning", title: "Required fields", message: "Name, Email, Password, Phone Number, and Role are required." });
      console.log("❌ Missing required fields for client-side validation");
      // Populate validationErrors for required fields if you want to show on client-side *before* backend call
      setValidationErrors(prev => ({
        ...prev,
        name: !newEmployee.name ? ["The name field is required."] : prev.name,
        email: !newEmployee.email ? ["Email  is required."] : prev.email,
        password: !newEmployee.password ? ["The password field is required."] : prev.password,
        phone_num: !newEmployee.phone_num ? ["The phone number field is required."] : prev.phone_num,
        role_id: !newEmployee.role_id ? ["The role field is required."] : prev.role_id,

   tl_id: !newEmployee.tl_id ? ["Please select the Department."] : prev.tl_id,
        team_id: !newEmployee.team_id ? ["Please select the Department."] : prev.team_id,
        emergency_phone_num: !newEmployee.emergency_phone_num ? ["Emergency phone nmumber is required."] : prev.emergency_phone_num,
         employee_id: !newEmployee.employee_id ? ["Employee ID is required."] : prev.employee_id,
        // role_id: !newEmployee.role_id ? ["The role field is required."] : prev.role_id,
      }));
      return;
    }

    console.log("✅ New Employee Data:", newEmployee);

   try {
  const success = await addEmployee(newEmployee); 

  if (!success) return; 

  setNewEmployee({
    name: "",
    email: "",
    password: "",
    phone_num: "",
    emergency_phone_num: "",
    address: "",
    team_id: [],
    role_id: [],
    profile_pic: null,
    tl_id: "",
    reporting_manager_id: "",
    department_id: "",
    employee_id: "",
    is_active: "active",
  });

  setValidationErrors({});
  closeModal(); 
} catch (err) {
  console.error("❌ Error in handleAddEmployee:", err);
}
  };
 


  const openModal = () => {
    setIsModalOpen(true);
    setValidationErrors({}); 
    setNewEmployee({ 
      name: "",
      email: "",
      password: "",
      phone_num: "",
      emergency_phone_num: "",
      address: "",
      team_id: [],
      role_id: [],
      profile_pic: null,
      tl_id: "",
      reporting_manager_id: "",
      department_id: "",
      employee_id:"",
      is_active: "active",
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setValidationErrors({}); // Clear errors when closing modal
  };

  const { teams, fetchTeams } = useTeam();
  const { roles, fetchRoles } = useRole();

  useEffect(() => {
    fetchEmployees()
    fetchTeams();
    fetchRoles();
  }, [selectedTeam,selectedEmployee]); // Depend on nothing for initial fetch

  useEffect(() => {
      const userRole = localStorage.getItem("user_name");
setUserrole(userRole);
    console.log("Updated Roles:", userRole);
  }, [roles]);

  const employeeList = Array.isArray(employees) ? employees : [];

  const handleInputChange = (e) => {
    setNewEmployee({ ...newEmployee, [e.target.name]: e.target.value });
  };

  const handleViewEmployee = (employee) => {
    setSelectedEmployee(employee);
  };

  const handleViewEmployeeDetail = (employee) => {
    navigate(`/${userrole}/users/${employee.id}`, { state: { employee } });
  };

const handleSubmit = async () => {
    if (!selectedFile) return;
    try {
      await importEmployeeData(selectedFile); // change to appropriate import function
      setImportType(""); // close modal on success
    } catch (error) {
      // error handled by context's showAlert already
    }
  };


const rolesWithoutTeamLead = [
  "Super Admin",
  "Admin",
  "HR",
  "Billing Manager",
  "Project Manager",
  "TL",
  "VP Digital Marketing"
];

const showTeamLeadDropdown = !rolesWithoutTeamLead.includes(newEmployee.role_name);
 const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

   const teamDropdownRef = useRef(null);
  const roleDropdownRef = useRef(null);

  const editRoleDropdownRef = useRef(null);  
  const editTeamDropdownRef = useRef(null);  

  const handleToggle = () => setIsOpen((prev) => !prev);
  const handleToggle1 = () => setIsopen((prev) => !prev);

  const handleSelect = (team) => {
  const selectedTeams = newEmployee.team_id || [];
  const exists = selectedTeams.includes(team.id);

  let updatedTeams;
  if (exists) {
    updatedTeams = selectedTeams.filter((id) => id !== team.id);
  } else {
    updatedTeams = [...selectedTeams, team.id];
  }

  // newEmployee UPDATE
  setNewEmployee({
    ...newEmployee,
    team_id: updatedTeams,
  });

  // selectedTeam UPDATE (MULTI SELECT)
  setSelectedTeam(prev => {
    if (exists) {
      return prev.filter(t => t.id !== team.id);
    }
    return [...prev, team];
  });

  //  CLOSE DROPDOWN
  setTeamSearchQuery("");
  setIsTeamDropdownOpen(false);
  
  if (!exists) fetchTl(team.id);
};

  const BLOCKED_ROLE_IDS = [1, 2, 3, 4];

const handleRoleSelect = (role) => {
  setSelectedRole(prev => {
    const exists = prev.some(r => r.id === role.id);

    const updated = exists
      ? prev.filter(r => r.id !== role.id)
      : [...prev, role];

    //  Sync role_id array
    setNewEmployee(emp => ({
      ...emp,
      role_id: updated.map(r => r.id),
    }));

    return updated;
  });

  setRoleSearchQuery("");
  setIsRoleDropdownOpen(false);
};



  // Close dropdown when clicking outside
  useEffect(() => {
  const handleClickOutside = (event) => {
    if (teamDropdownRef.current && !teamDropdownRef.current.contains(event.target)) {
      setIsTeamDropdownOpen(false);
    }
        // Role dropdown
    if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target)) {
      setIsRoleDropdownOpen(false);
    }


    // EDIT Modal dropdowns ✅ NEW
    if (editRoleDropdownRef.current && !editRoleDropdownRef.current.contains(event.target)) {
      setIsEditRoleDropdownOpen(false);
    }
    if (editTeamDropdownRef.current && !editTeamDropdownRef.current.contains(event.target)) {
      setIsEditTeamDropdownOpen(false);
    }

  };
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);

  
useEffect(() => {
  setCurrentPage(1);
}, [searchQuery, filterBy, selectedEmpType]);

  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(teamSearchQuery.toLowerCase())
  );

   const filteredRoles = roles.filter((role) =>
    role.name.toLowerCase().includes(roleSearchQuery.toLowerCase())
  );



const handleEditTeamSelect = (team) => {
  setSelectedEditTeam((prev) => {
    const exists = prev.some((t) => t.id === team.id);
    if (exists) {
      return prev.filter((t) => t.id !== team.id);
    }
    return [...prev, team];
  });

  setEditingEmployee((prev) => {
    const exists = prev.team_id?.includes(team.id);
    return {
      ...prev,
      team_id: exists
        ? prev.team_id.filter((id) => id !== team.id)
        : [...(prev.team_id || []), team.id],
    };
  });
};


const handleEditRoleSelect = (role) => {
  setSelectedEditRole((prev) => {
    const exists = prev.some((r) => r.id === role.id);
    if (exists) {
      return prev.filter((r) => r.id !== role.id);
    }
    return [...prev, role];
  });

  setEditingEmployee((prev) => {
    const exists = prev.role_id?.includes(role.id);
    return {
      ...prev,
      role_id: exists
        ? prev.role_id.filter((id) => id !== role.id)
        : [...(prev.role_id || []), role.id],
    };
  });
};



useEffect(() => {
  if (editingEmployee?.team_id?.length && teams.length) {
    const matchedTeams = teams.filter(team =>
      editingEmployee.team_id.includes(team.id)
    );
    setSelectedEditTeam(matchedTeams);
  } else {
    setSelectedEditTeam([]);
  }

  if (editingEmployee?.role_id?.length && roles.length) {
    const matchedRoles = roles.filter(role =>
      editingEmployee.role_id.includes(role.id)
    );
    setSelectedEditRole(matchedRoles);
  } else {
    setSelectedEditRole([]);
  }

 if (editingEmployee?.team_id?.length > 0) {
    fetchTl(editingEmployee.team_id[0]);
  }
  
}, [editingEmployee, teams, roles, editingEmployee?.team_id]);


  

//   useEffect(() => {
//   if (editingEmployee?.team_id && teams.length > 0) {
//     const matchedTeam = teams.find(
//       (t) => String(t.id) === String(editingEmployee.team_id)
//     );

//     if (matchedTeam) {
//       setSelectedEditTeam([matchedTeam]);
//     }
//   };

// if (editingEmployee?.role_id && roles.length > 0) {
//     const matchedRole = roles.find(
//       (t) => String(t.id) === String(editingEmployee.role_id)
//     );

//     if (matchedRole) {
//       setSelectedEditRole([matchedRole]);
//     }
//   }


// }, [editingEmployee, teams, roles]);


const handleCloseAddModal = () => {
  setIsModalOpen(false);
  setValidationErrors({});
  setNewEmployee({
    name: "",
    email: "",
    password: "",
    phone_num: "",
    emergency_phone_num: "",
    address: "",
    team_id: [],
    role_id: [],
    profile_pic: null,
    tl_id: "",
    department_id: "",
    employee_id: "",
    is_active: "active",
  });
};

const handleCloseEditModal = () => {
  setSelectedEmployee(null);
  setEditingEmployee(null);
  setValidationErrors({});
};


const addModalRef = useOutsideClick(isModalOpen, handleCloseAddModal);
const editModalRef = useOutsideClick(selectedEmployee !== null, handleCloseEditModal);

  const getRolesArray = (roles) => {
  if (Array.isArray(roles)) return roles;

  if (typeof roles === "string") {
    
    return roles.match(/[A-Z][a-z]*/g) || [roles];
  }

  return [];
};
  
  
  const selectedNames = teams
    .filter((t) => newEmployee.team_id?.includes(t.id))
    .map((t) => t.name)
    .join(", ");




const fetchReportingManagers = async (teamId, roleIds) => {
  if (!teamId || !roleIds?.length) return;

  try {
    setLoadingRM(true);

    
    const roleId = Array.isArray(roleIds) ? roleIds[0] : roleIds;

    const res = await fetch(
      `${API_URL}/api/get-team-user-by-role?team_id=${teamId}&role_id=${roleId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      }
    );

    const data = await res.json();

    if (data.success) {
      setReportingManagers(data.data || []);
    } else {
      setReportingManagers([]);
    }
  } catch (err) {
    console.error("RM API Error:", err);
    setReportingManagers([]);
  } finally {
    setLoadingRM(false);
  }
};









useEffect(() => {
  if (newEmployee.team_id?.length && newEmployee.role_id?.length) {
    fetchReportingManagers(
      newEmployee.team_id[0],
      newEmployee.role_id
    );
  } else {
    setReportingManagers([]);
    setNewEmployee(prev => ({
      ...prev,
      reporting_manager_id: "",
    }));
  }
}, [newEmployee.team_id, newEmployee.role_id]);


useEffect(() => {
  if (
    editingEmployee?.team_id?.length &&
    editingEmployee?.role_id?.length
  ) {
    fetchReportingManagers(
      editingEmployee.team_id[0],
      editingEmployee.role_id
    );
  } else {
    setReportingManagers([]);
    setEditingEmployee(prev => ({
      ...prev,
      reporting_manager_id: "",
    }));
  }
}, [editingEmployee?.team_id, editingEmployee?.role_id]);



useEffect(() => {
  if (!newEmployee.team_id || newEmployee.team_id.length === 0) {
    setTl([]);
    setNewEmployee(prev => ({
      ...prev,
      tl_id: "",
    }));
  };

  if (!editingEmployee?.team_id || editingEmployee.team_id.length === 0) {
    setTl([]); 
    setEditingEmployee(prev => ({
      ...prev,
      tl_id: "", 
    }));
  }

}, [newEmployee.team_id, editingEmployee?.team_id]);

// useEffect(() => {
//   if (!editingEmployee?.team_id || editingEmployee.team_id.length === 0) {
//     setTl([]); // 🔥 TL list empty
//     setEditingEmployee(prev => ({
//       ...prev,
//       tl_id: "", // 🔥 selected TL reset
//     }));
//   }
// }, [editingEmployee?.team_id]);



const TEAM_LEAD_ALLOWED_ROLE_IDS = [7, 12];
const shouldShowTeamLead =
  Array.isArray(newEmployee.role_id) &&
  newEmployee.role_id.some(roleId =>
    TEAM_LEAD_ALLOWED_ROLE_IDS.includes(Number(roleId))
  );


// Column definitions for Employee Table
const columns = [
 {
    key: 'profile_pic',
    label: '',
    width: '80px',
    headerClassName: 'w-[80px] text-center',
    render: (employee) => (
      <div className="flex items-center justify-center h-14 w-full min-h-[56px]">
        <div className="w-10 h-10 rounded-full border-2 border-gray-200 shadow-[5px_8px_10px_-7px_rgba(128,128,128,1)] overflow-hidden flex items-center justify-center bg-gray-100">
          <img
            className="w-full h-full object-contain max-w-[44px] max-h-[44px] rounded-full"
            src={employee.profile_pic ? employee.profile_pic : user_profile}
            alt={employee.name}
            onError={(e) => {
              e.target.src = user_profile;
            }}
          />
        </div>
      </div>
    )
  },
  {
    key: 'employee_id',
    label: 'Emp ID',
    width: '140px',
    headerClassName: 'w-[140px] text-center',
    render: (employee) => (
      <div className="truncate max-w-[140px]" title={employee.employee_id}>
        {employee.employee_id}
      </div>
    )
  },
  {
    key: 'name',
    label: 'Name',
    width: '140px',
    headerClassName: 'w-[140px] text-center',
    render: (employee) => (
      <div className="truncate max-w-[130px]" title={employee.name}>
        {employee.name}
      </div>
    )
  },
  {
    key: 'email',
    label: 'Email',
    width: '120px',
    headerClassName: 'w-[120px] text-center',
    render: (employee) => (
      <div className="truncate max-w-[120px] " title={employee.email}>
        {employee.email}
      </div>
    )
  },
  {
    key: 'phone_num',
    label: 'Phone',
    width: '120px',
    headerClassName: 'w-[120px] text-center',
    render: (employee) => (
      <div className="truncate max-w-[110px]" title={employee.phone_num || ""}>
        {employee.phone_num || "N/A"}
      </div>
    )
  },
  {
    key: 'teams',
    label: 'Team',
    width: '120px',
    headerClassName: 'w-[120px] text-center',
    render: (employee) => {
      const teamText = Array.isArray(employee.teams) && employee.teams.length
        ? employee.teams.join(", ")
        : "N/A";
      return (
        <div className="truncate max-w-[110px]" title={teamText}>
          {teamText}
        </div>
      );
    }
  },
  {
    key: 'roles',
    label: 'Role',
    width: '140px',
    headerClassName: 'w-[140px] text-center',
    render: (employee) => {
      if (!Array.isArray(employee.roles) || !employee.roles.length) {
        return <span className="text-gray-400 truncate">N/A</span>;
      }
      return (
        <div className="flex flex-wrap gap-1 max-w-[140px] justify-center truncate" title={employee.roles.join(", ")}>
          {employee.roles.slice(0, 2).map((role, idx) => (
            <span
              key={idx}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-800 truncate max-w-[140px]"
              title={role}
            >
              {role}
            </span>
          ))}
          {employee.roles.length > 2 && (
            <span className="text-[10px] text-gray-500">+{employee.roles.length - 2}</span>
          )}
        </div>
      );
    }
  },
  {
    key: 'status',
    label: 'Status',
    width: '100px',
    headerClassName: 'w-[100px] text-center',
    render: (employee) => (
      <div className="flex items-center justify-center">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-medium ${
            employee.is_active === 0 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
          }`}
        >
          {employee.is_active === 0 ? "Inactive" : "Active"}
        </span>
      </div>
    )
  }
];



const getTodayDate = () => new Date().toISOString().split('T')[0];


// Actions renderer
const renderActions = (employee) => {
  // Filter Super Admin
  if (Array.isArray(employee.roles) && employee.roles.includes("Super Admin")) {
    return null;
  }

  return (
    <td className=" flex gap-2 items-center justify-center text-[10px]"
      onClick={(e) => e.stopPropagation()}
      >
      {Array.isArray(employee.roles) && employee.roles.includes("Team") && (
        <div className="relative group">
          <IconViewButton onClick={() => handleViewEmployeeDetail(employee)} />
          <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 
            whitespace-nowrap bg-white text-black text-sm px-2 py-1 rounded 
            opacity-0 group-hover:opacity-100 transition pointer-events-none shadow">
            View
          </span>
        </div>
      )}

      {userrole !== "billingmanager" && canAddEmployee && (
        <div className="relative group">
          <IconEditButton onClick={() => handleEditEmployee(employee)} />
          <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 
            whitespace-nowrap bg-white text-black text-sm px-2 py-1 rounded 
            opacity-0 group-hover:opacity-100 transition pointer-events-none shadow">
            Edit
          </span>
        </div>
      )}

      {userrole !== "billingmanager" && canAddEmployee && (
        <div className="relative group">
          <IconDeleteButton
            onClick={() => {
              setEmployeeToDelete(employee.id);
              setShowDeleteModal(true);
            }}
          />
          <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 
            whitespace-nowrap bg-white text-black text-sm px-2 py-1 rounded 
            opacity-0 group-hover:opacity-100 transition pointer-events-none shadow">
            Delete
          </span>
        </div>
      )}
    </td>
  );
};





  
  return (
    <div className="rounded-2xl border border-gray-200 bg-white !shadow-md max-h-screen overflow-y-auto">
      <SectionHeader icon={BarChart} title="Employee " subtitle="Manage employees and update " />
      <div className="flex flex-wrap items-center justify-between gap-2 px-2 py-2 sm:sticky top-0 bg-white z-10 shadow-md">
{userrole !== "billingmanager" && canAddEmployee && (

        <button onClick={openModal} className="add-items-btn text-sm">
          Add Employee
        </button>
  )} 
           
  
        {/* Search & Filter */}
        <div className="flex flex-wrap md:flex-nowrap items-center gap-3 border p-2 rounded-lg shadow-md bg-white">
           <div className="flex items-center gap-3 px-3">
            <label className="text-[12px] font-medium text-gray-700 text-nowrap">Filter by:</label>
            <button
              onClick={() => setSelectedEmpType("Active")}
              className={`px-4 py-1.5 rounded-md ${selectedEmpType === "Active" ? "w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-md font-semibold text-sm hover:shadow-lg hover:scale-105 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 ease-in-out hover:shadow-lg hover:-translate-y-0.5" : "bg-gray-200 text-gray-700"}`}
            >
              Active
            </button>
            <button
              onClick={() => setSelectedEmpType("Inactive")}
              className={`px-4 py-1.5 rounded-md ${selectedEmpType === "Inactive" ? "w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-md font-semibold text-sm hover:shadow-lg hover:scale-105 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 ease-in-out hover:shadow-lg hover:-translate-y-0.5" : "bg-gray-200 text-gray-700"}`}
            >
            Inactive
            </button>
          </div>
          <div className="flex items-center w-full border border-gray-300 px-2 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
               
            <Search className="h-5 w-5 text-gray-400 mr-[5px]" />
            <input
              type="text"
              className="w-full rounded-lg focus:outline-none py-1.5"
              placeholder={filterBy==="employee_id" ? "Search by employee id":filterBy==="phone_num"? "Search by phone number" : `Search by ${filterBy}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="px-3 py-1.5 border rounded-md bg-white cursor-pointer focus:outline-none"
          >
            <option value="name">Name</option>
            <option value="email">Email</option>
            <option value="teams">Department</option>
            <option value="phone_num">Phone</option>
            <option value="employee_id">Employee ID</option>
            <option value="roles">Role</option>
            <option value="is_active">Status</option>
          </select>

          <ClearButton onClick={() => setSearchQuery("")} className="text-sm"/>
          <div className="flex items-center gap-3 bg-white relative">
            <ImportButton onClick={() => setShowImportOptions(!showImportOptions)} className="text-sm" />
            <div className="relative">
              <ExportButton onClick={() => exportToExcel(employees, "employees.xlsx")} className="text-sm"/>
              {showImportOptions && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-30">
                  <div className="bg-white rounded-lg shadow-lg p-6 w-96 flex flex-col gap-4 animate-fadeIn">
                    <h3 className="text-lg font-semibold text-gray-800 text-center">Select Import Type</h3>

                    <button
                      onClick={() => {
                        setImportType("excel");
                        setShowImportOptions(false);
                      }}
                      className="flex items-center justify-center gap-3 w-full px-4 py-3 text-gray-700 border rounded-md hover:bg-gray-100 transition"
                    >
                      <FaFileCsv className="text-green-600 text-xl" />
              <span>Import Csv File</span>
                    </button>

                    {/* <button
                      onClick={() => {
                        setImportType("googleSheet");
                        setShowImportOptions(false);
                      }}
                      className="flex items-center justify-center gap-3 w-full px-4 py-3 text-gray-700 border rounded-md hover:bg-gray-100 transition"
                    >
                      <FaGoogle className="text-blue-500 text-xl" />
                      <span>Import Google Sheet</span>
                    </button> */}

                    <CancelButton onClick={() => setShowImportOptions(false)} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Import Section */}
      {importType === "excel" && (
       <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
        {!importLoading ? (
          <div className="mt-3 p-4 border rounded-lg bg-white shadow-md flex flex-col gap-3 w-96">
            <p className="text-gray-700 font-medium">Upload an Csv File:</p>
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="px-3 py-2 border rounded-md cursor-pointer"
            />

            <button
              onClick={handleSubmit}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              disabled={!selectedFile}
            >
              Upload
            </button>

            <CancelButton onClick={() => setImportType("")} />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Loader className="animate-spin text-white w-10 h-10" />
            <p className="text-white text-lg font-medium">Importing Employees...</p>
          </div>
        )}
      </div>
      )}


        {importType === "googleSheet" && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
            <div className="mt-3 p-4 border rounded-lg bg-white shadow-md flex flex-col gap-3">
              <p className="text-gray-700 font-medium">Paste Google Sheet Link:</p>
              <input
                type="text"
                placeholder="Enter Google Sheet link"
                value={googleSheetUrl}
                onChange={(e) => setGoogleSheetUrl(e.target.value)}
                className="px-3 py-2 border rounded-md w-72 focus:outline-none"
              />
              <button
                onClick={handleGoogleSheetImport}
                className="assign-btn items-center justify-center"
              >
                Import from Google Sheets
              </button>
              <CancelButton onClick={() => setImportType("")} />
            </div>
          </div>
        )}
      </div>

      <div className="mt-2 bg-white rounded-2xl shadow border overflow-hidden">
        <GlobalTable
          data={currentEmployees}
          columns={columns}
          isLoading={loading}
          paginatedData={currentEmployees.filter(employee =>
            !Array.isArray(employee.roles) || !employee.roles.includes("Super Admin")
          )}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          actionsComponent={{ right: renderActions }}
          onRowClick={(employee) => handleViewEmployeeDetail(employee)}
          emptyStateTitle={loading ? "" : "No employees found"}
          emptyStateMessage="No employees available."
          className="table-fixed"
        />
      </div>

      {showDeleteModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full">
              <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
              <p className="mb-6">Are you sure you want to delete this employee?</p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleDeleteEmployee(employeeToDelete);
                    setShowDeleteModal(false);
                  }}
                  className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}


      {/* Edit/View Employee Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md z-50 animate-fadeIn">
          <div ref={editModalRef}  className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto p-8 bg-white bg-opacity-95 rounded-3xl shadow-2xl transform scale-95 animate-slideUp border border-gray-200 backdrop-filter backdrop-blur-lg">
            <button
              onClick={() => {
                setSelectedEmployee(null);
                setEditingEmployee(null);
                setValidationErrors({});
              }}
              className="absolute top-5 right-5 text-gray-600 hover:text-red-500 text-3xl font-semibold transition-all duration-200 ease-in-out"
              aria-label="Close"
            >
              &times;
            </button>

            <h2 className="text-2xl font-extrabold text-center text-gray-900 mb-8 mt-4">
              Employee Details
            </h2>

            {editingEmployee ? (
              <>

                <div className="flex flex-col items-center mb-6">
  <label
                    htmlFor="edit_profile_pic"
                    className="cursor-pointer bg-yellow-50 text-black-700 px-4 py-2 rounded-full text-sm font-semibold hover:bg-blue-100 transition-colors duration-200 mb-5"
                  >
                  {editingEmployee.employee_id}
                  </label>
                  <img
                    className="border-2 border-[#d7d7d7] outline outline-[5px] outline-white p-[3px] shadow-[5px_12px_15px_-6px_rgba(128,128,128,1)] rounded-full w-32 h-32 object-cover mb-4"
                    src={
                      editingEmployee?.profile_pic instanceof File
                        ? URL.createObjectURL(editingEmployee.profile_pic)
                        : editingEmployee?.profile_pic || user_profile
                    }
                    alt={editingEmployee?.name || "Employee Profile"}
                  />
                  <label
                    htmlFor="edit_profile_pic"
                    className="cursor-pointer bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold hover:bg-blue-100 transition-colors duration-200"
                  >
                    Change Profile Picture
                    <input
                      id="edit_profile_pic"
                      type="file"
                      className="hidden"
                      onChange={(e) =>
                        setEditingEmployee({
                          ...editingEmployee,
                          profile_pic:
                            e.target.files && e.target.files.length > 0
                              ? e.target.files[0]
                              : null,
                        })
                      }
                    />
                  </label>
                  {validationErrors.profile_pic && (
                    <p className="text-red-500 text-xs mt-2">
                      {validationErrors.profile_pic[0]}
                    </p>
                  )}
                </div>

                <div className="space-y-5">
                  {/* Name and Email - Half-half layout on larger screens */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label
                        htmlFor="edit_name"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Full Name
                      </label>
                      <input
                        id="edit_name"
                        type="text"
                        name="name"
                        value={editingEmployee.name}
                        onChange={(e) =>
                          setEditingEmployee({ ...editingEmployee, name: e.target.value })
                        }
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200 ease-in-out"
                        placeholder="Employee Name"
                      />
                      {validationErrors.name && (
                        <p className="text-red-500 text-xs mt-1">
                          {validationErrors.name[0]}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="edit_email"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Email Address
                      </label>
                      <input
                        id="edit_email"
                        type="email"
                        name="email"
                        value={editingEmployee.email}
                        onChange={(e) =>
                          setEditingEmployee({ ...editingEmployee, email: e.target.value })
                        }
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200 ease-in-out"
                        placeholder="Email Address"
                      />
                      {validationErrors.email && (
                        <p className="text-red-500 text-xs mt-1">
                          {validationErrors.email[0]}
                        </p>
                      )}
                    </div>
                  
                  </div>

                  {/* Phone Number and Emergency Phone - Half-half layout on larger screens */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                           {/* <div>
                      <label
                        htmlFor="edit_email"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        EMP ID
                      </label>
                      <input
                        id="edit_email"
                        type="text"
                        name="employee_id"
                        value={editingEmployee.employee_id}
                        // onChange={(e) =>
                        //   setEditingEmployee({ ...editingEmployee, employee_id: e.target.value })
                        // }
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200 ease-in-out"
                        placeholder="Email Address"
                      />
                      {validationErrors.employee_id && (
                        <p className="text-red-500 text-xs mt-1">
                          {validationErrors.employee_id[0]}
                        </p>
                      )}
                    </div> */}
                    <div>
                      <label
                        htmlFor="edit_phone_num"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Phone Number
                      </label>
                      <div className="flex items-center border border-gray-300 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-blue-500 transition-all duration-200 ease-in-out">
                        <span className="pl-3 pr-2 text-gray-500 border-r border-gray-200 h-full flex items-center bg-gray-50 rounded-l-xl">
                          +91
                        </span>
                        <input
                          id="edit_phone_num"
                          type="text"
                          name="phone_num"
                          value={editingEmployee.phone_num || ""}
                          onChange={(e) => {
                            const inputVal = e.target.value.replace(/\D/g, ""); // Remove non-numeric
                            if (inputVal.length <= 10) {
                              setEditingEmployee({
                                ...editingEmployee,
                                phone_num: inputVal,
                              });
                            }
                          }}
                          className="w-full p-3 outline-none rounded-r-xl"
                          placeholder="Phone Number"
                        />
                      </div>
                      {validationErrors.phone_num && (
                        <p className="text-red-500 text-xs mt-1">
                          {validationErrors.phone_num[0]}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="edit_emergency_phone_num"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Emergency Phone Number
                      </label>
                      <div className="flex items-center border border-gray-300 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-blue-500 transition-all duration-200 ease-in-out">
                        <span className="pl-3 pr-2 text-gray-500 border-r border-gray-200 h-full flex items-center bg-gray-50 rounded-l-xl">
                          +91
                        </span>
                        <input
                          id="edit_emergency_phone_num"
                          type="text"
                          name="emergency_phone_num"
                          value={editingEmployee.emergency_phone_num || ""}
                          onChange={(e) => {
                            const inputVal = e.target.value.replace(/\D/g, ""); // Remove non-numeric
                            if (inputVal.length <= 10) {
                              setEditingEmployee({
                                ...editingEmployee,
                                emergency_phone_num: inputVal,
                              });
                            }
                          }}
                          className="w-full p-3 outline-none rounded-r-xl"
                          placeholder="Emergency Phone Number"
                        />
                      </div>
                      {validationErrors.emergency_phone_num && (
                        <p className="text-red-500 text-xs mt-1">
                          {validationErrors.emergency_phone_num[0]}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label
                      htmlFor="edit_address"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Address
                    </label>
                    <input
                      id="edit_address"
                      type="text"
                      name="address"
                      value={editingEmployee.address || ""}
                      onChange={(e) =>
                        setEditingEmployee({ ...editingEmployee, address: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200 ease-in-out"
                      placeholder="Full Address"
                    />
                    {validationErrors.address && (
                      <p className="text-red-500 text-xs mt-1">
                        {validationErrors.address[0]}
                      </p>
                    )}
                  </div>

                  {/* Role and Team - Half-half layout on larger screens */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                 {!["1", "2", "3", "4"].includes(editingEmployee?.role_id?.toString()) && (
  <div className="relative" ref={editRoleDropdownRef}>
    <label className="block font-medium text-gray-700 text-sm mb-2 cursor-pointer">
      Roles
    </label>
    <div className="relative">
      <input
        type="text"
        placeholder="Search and select a role..."
        className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none pr-10"
        value={editRoleSearchQuery}
        onChange={(e) => setEditRoleSearchQuery(e.target.value)}
        autoComplete="off"
        onMouseDown={(e) => {
          e.stopPropagation();
          setIsEditRoleDropdownOpen(prev => !prev);  // ✅ TOGGLE
        }}
      />
    </div>
    
    {selectedEditRole.length > 0 && (
      <div className="mt-2 flex flex-wrap gap-2">
        {selectedEditRole.map(role => (
          <div key={role.id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs flex items-center">
            {role.name}
            <button
              type="button"
              onMouseDown={(e) => {
                e.stopPropagation();
                handleEditRoleSelect(role);
              }}
              className="ml-2 text-blue-600 hover:text-blue-800 font-bold text-sm -mr-1"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    )}
    
    {isEditRoleDropdownOpen && (editRoleSearchQuery ? filteredRoles : roles).length > 0 && (
      <ul
        onMouseDown={(e) => e.stopPropagation()}
        className="absolute z-50 w-full mt-1 max-h-48 overflow-auto border border-gray-300 rounded-md bg-white shadow-lg"
      >
        {(editRoleSearchQuery ? filteredRoles : roles).map(role => (
          <li
            key={role.id}
            onMouseDown={(e) => {
              e.stopPropagation();
              handleEditRoleSelect(role);
              setEditRoleSearchQuery("");  
              setIsEditRoleDropdownOpen(false);

            }}
            className={`cursor-pointer px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-blue-50 transition-colors ${
              selectedEditRole.some(r => r.id === role.id)
                ? 'bg-blue-100 border-r-4 border-blue-500'
                : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="font-medium text-sm">{role.name}</div>
              {selectedEditRole.some(r => r.id === role.id) && (
                <span className="text-green-600 font-bold text-sm">✓</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    )}
  </div>
)}



                   {!["1", "2", "3", "4"].includes(editingEmployee?.role_id?.toString()) && (
  <div className="relative" ref={editTeamDropdownRef}>
    <label className="block font-medium text-gray-700 text-sm mb-2 cursor-pointer">
      Teams
    </label>
    <div className="relative">
      <input
        type="text"
        placeholder="Search and select a Team..."
        className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none pr-10"
        value={editTeamSearchQuery}
        onChange={(e) => setEditTeamSearchQuery(e.target.value)}
        autoComplete="off"
        onMouseDown={(e) => {
          e.stopPropagation();
          setIsEditTeamDropdownOpen(prev => !prev);  // ✅ TOGGLE
        }}
      />
    </div>
    
    {selectedEditTeam.length > 0 && (
      <div className="mt-2 flex flex-wrap gap-2">
        {selectedEditTeam.map(team => (
          <div key={team.id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs flex items-center">
            {team.name}
            <button
              type="button"
              onMouseDown={(e) => {
                e.stopPropagation();
                handleEditTeamSelect(team);
                
              }}
              className="ml-2 text-blue-600 hover:text-blue-800 font-bold text-sm -mr-1"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    )}
    
    {isEditTeamDropdownOpen && (editTeamSearchQuery ? filteredTeams : teams).length > 0 && (
      <ul
        onMouseDown={(e) => e.stopPropagation()}
        className="absolute z-50 w-full mt-1 max-h-48 overflow-auto border border-gray-300 rounded-md bg-white shadow-lg"
      >
        {(editTeamSearchQuery ? filteredTeams : teams).map(team => (
          <li
            key={team.id}
            onMouseDown={(e) => {
              e.stopPropagation();
              handleEditTeamSelect(team);
              setEditTeamSearchQuery("");
              setIsEditTeamDropdownOpen(false);
            }}
            className={`cursor-pointer px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-blue-50 transition-colors ${
              selectedEditTeam.some(t => t.id === team.id)
                ? 'bg-blue-100 border-r-4 border-blue-500'
                : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="font-medium text-sm">{team.name}</div>
              {selectedEditTeam.some(t => t.id === team.id) && (
                <span className="text-green-600 font-bold text-sm">✓</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    )}
  </div>
)}
                    
                 
                    
                    {/* <div>
                      <label
                        htmlFor="edit_role_id"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Role
                      </label>
                      <select
                        id="edit_role_id"
                        name="role_id"
                        value={editingEmployee.role_id || ""}
                        onChange={(e) =>
                          setEditingEmployee({ ...editingEmployee, role_id: e.target.value })
                        }
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm appearance-none pr-8 transition-all duration-200 ease-in-out"
                      >
                        <option value="">Select Role</option>
                        {roles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                      {validationErrors.role_id && (
                        <p className="text-red-500 text-xs mt-1">
                          {validationErrors.role_id[0]}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="edit_team_id"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Team
                      </label>
                      <select
                        id="edit_team_id"
                        name="team_id"
                        value={editingEmployee.team_id || ""}
                        onChange={(e) =>
                          setEditingEmployee({ ...editingEmployee, team_id: e.target.value })
                        }
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm appearance-none pr-8 transition-all duration-200 ease-in-out"
                      >
                        <option value="">Select Team</option>
                        {teams.map((team) => (
                          <option key={team.id} value={team.id}>
                            {team.name}
                          </option>
                        ))}
                      </select>
                      {validationErrors.team_id && (
                        <p className="text-red-500 text-xs mt-1">
                          {validationErrors.team_id[0]}
                        </p>
                      )}
                    </div> */}
                {/* REPLACE the Status select section with this: */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Status
  </label>
  <div className="flex items-center space-x-3 mb-2">
    <select
      id="edit_status"
      name="edit_status"
      value={editingEmployee.is_active}
      onChange={(e) => {
        const newStatus = Number(e.target.value);
        setEditingEmployee({ 
          ...editingEmployee, 
          is_active: newStatus,
          inactive_date: newStatus === 0 ? editingEmployee.inactive_date || getTodayDate() : null
        });
      }}
      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm appearance-none pr-8 transition-all duration-200 ease-in-out"
    >
      <option value={1}>Active</option>
      <option value={0}>Inactive</option>
    </select>
    
    {/* 🔥 INACTIVE DATE PICKER - Shows only when Inactive */}
    {editingEmployee.is_active === 0 && (
      <div className="min-w-[140px]">
        <label className="block text-xs text-gray-500 mb-1">Inactive From</label>
        <input
          type="date"
          value={editingEmployee.inactive_date || getTodayDate()}
          min={editingEmployee.created_at?.split('T')[0] || '2000-01-01'}
          onChange={(e) =>
            setEditingEmployee({ 
              ...editingEmployee, 
              inactive_date: e.target.value 
            })
          }
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div>
    )}
  </div>
  
  {validationErrors.is_active && (
    <p className="text-red-500 text-xs mt-1">{validationErrors.is_active}</p>
  )}
  {editingEmployee.is_active === 0 && validationErrors.inactive_date && (
    <p className="text-red-500 text-xs mt-1">{validationErrors.inactive_date}</p>
  )}
</div>



{!["1", "2", "3", "4","5","6","8","9","10"].includes(editingEmployee?.role_id?.toString()) && ( 
  <div> 
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Select Team Lead
    </label>

    <select
      id="edit_tl_id"
      name="tl_id"
      value={editingEmployee.tl_id ? String(editingEmployee.tl_id) : ""}
      onChange={(e) => {
        const value = e.target.value;

        setEditingEmployee(prev => ({
          ...prev,
          tl_id: value ? Number(value) : null   // NUMBER
        }));
        
      }}
      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm appearance-none pr-8 transition-all duration-200 ease-in-out"
    >
      <option value="">-- Select Team Lead --</option>

      {tl.length > 0 ? (
        tl.map((teamLead) => (
          <option key={teamLead.id} value={String(teamLead.id)}>
            {teamLead.name}
          </option>
        ))
      ) : (
        <option disabled>No TL available</option>
      )}
    </select>

    {validationErrors.tl_id && (
      <p className="text-red-500 text-xs mt-1">
        {validationErrors.tl_id[0]}
      </p>
    )}
  </div>
)}




{reportingManagers.length > 0 && (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Reporting Manager
    </label>

    <select
      value={editingEmployee.reporting_manager_id || ""}
      onChange={(e) =>
        setEditingEmployee(prev => ({
          ...prev,
          reporting_manager_id: e.target.value
            ? Number(e.target.value)
            : ""
        }))
      }
      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
    >
      <option value="">-- Select Reporting Manager --</option>

      {reportingManagers.map(rm => (
        <option key={rm.id} value={rm.id}>
          {rm.name}
        </option>
      ))}
    </select>

    {validationErrors.reporting_manager_id && (
      <p className="text-red-500 text-xs mt-1">
        {validationErrors.reporting_manager_id[0]}
      </p>
    )}
  </div>
)}



                    
                        {/* <div>
                <label
                  htmlFor="department"
                  className="block font-medium text-gray-700 text-sm mt-3 mb-2"
                >
                  Department
                </label>
              <select
  id="department_id"
  name="department_id"
  value={newEmployee.department_id}
  onChange={handleInputChange}
  className={`w-full p-2 mt-1 border rounded-md focus:outline-none focus:ring-2 ${
    departmentError
      ? "border-red-500 ring-red-500"
      : "border-gray-300 focus:ring-blue-500"
  }`}
>
  <option value="">Select Department</option>
  {Array.isArray(department) && department.length > 0 ? (
    department.map((dep) => (
      <option key={dep.id} value={dep.id}>
        {dep.name}
      </option>
    ))
  ) : (
    <option disabled>No departments found</option>
  )}
</select>

                {departmentError && (
                  <p className="text-red-500 text-sm mt-1">{departmentError}</p>
                )}
              </div> */}
                
                  </div>

                  {/* Save Button */}
                  <div className="pt-4">
                    <SaveChangeButton onClick={handleUpdateEmployee} />
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* View Mode */}
                <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-200">
                  <div
                    className="bg-cover bg-center flex flex-col justify-center items-center p-8 rounded-t-3xl text-white relative"
                    style={{ backgroundImage: `url(${user_profile_bg_2})` }}
                  >
                    <img
                      className="border-4 border-white outline outline-[6px] outline-blue-100 p-[3px] shadow-xl rounded-full w-40 h-40 object-cover mb-4"
                      src={selectedEmployee?.profile_pic || user_profile}
                      alt={selectedEmployee?.name || "Employee Profile"}
                    />
                    <p className="text-3xl font-bold text-gray-900">
                      {selectedEmployee.name}
                    </p>
                  </div>
                  <div className="m-6 space-y-4 text-gray-800">
                    <p className="flex items-center">
                      <strong className="w-32 flex-shrink-0 text-gray-600">Email:</strong>
                      <span className="break-all">{selectedEmployee.email}</span>
                    </p>
                    <p className="flex items-center">
                      <strong className="w-32 flex-shrink-0 text-gray-600">Phone:</strong>
                      <span>{selectedEmployee.phone_num || "N/A"}</span>
                    </p>
                    <p className="flex items-center">
                      <strong className="w-32 flex-shrink-0 text-gray-600">
                        Emergency Phone:
                      </strong>
                      <span>{selectedEmployee.emergency_phone_num || "N/A"}</span>
                    </p>
                    <p className="flex items-center">
                      <strong className="w-32 flex-shrink-0 text-gray-600">Role:</strong>
                      {/* Assuming selectedEmployee.roles already holds the role name, otherwise map it */}
                      <span>{selectedEmployee.roles || "N/A"}</span>
                    </p>
                    <p className="flex items-center">
                      <strong className="w-32 flex-shrink-0 text-gray-600">Team:</strong>
                      <span>
                        {/* Find the team name based on team_id from the 'teams' array */}
                        {teams.find((team) => team.id === selectedEmployee.team_id)?.name || "N/A"}
                      </span>
                    </p>
                    <p className="flex items-start">
                      <strong className="w-32 flex-shrink-0 text-gray-600">Address:</strong>
                      <span className="flex-grow">{selectedEmployee.address || "N/A"}</span>
                    </p>
                  </div>
                  <div className="p-6 pt-0">
                    <button
                      onClick={() => handleEditEmployee(selectedEmployee)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-300 shadow-lg transform transition-all duration-300 ease-in-out active:scale-95 text-lg"
                    >
                      Edit Employee Details
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
     {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md z-50 animate-fadeIn">
          <div ref={addModalRef} className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 bg-white bg-opacity-95 rounded-3xl shadow-2xl transform scale-95 animate-slideUp border border-gray-200 backdrop-filter backdrop-blur-lg">
            <button
              onClick={closeModal}
              className="absolute top-5 right-5 text-gray-600 hover:text-red-500 text-3xl font-semibold transition-all duration-200 ease-in-out"
              aria-label="Close"
            >
              &times;
            </button>

            <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-8 mt-4">
              Add New Employee
            </h2>

            <form
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                handleAddEmployee();
              }}
            >
              {/* Name and Email - Half-half layout on larger screens */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="e.g., Jane Doe"
                    name="name"
                    value={newEmployee.name}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200 ease-in-out"
                  />
                  {validationErrors.name && (
                    <p className="text-red-500 text-xs mt-1">
                      {validationErrors.name[0]}
                    </p>
                  )}
                </div>
                 <div>
  <label
    htmlFor="employee_id"
    className="block text-sm font-medium text-gray-700 mb-1"
  >
    Employee ID <span className="text-red-500">*</span>
  </label>

  <div className="flex">

    <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-300 bg-gray-100 text-gray-600 text-sm">
      TAS-
    </span>


    <input
      id="employee_id"
      type="text"
      placeholder="123"
      name="employee_id"
      value={newEmployee.employee_id.replace(/^TAS-/, "")} // strip TAS- for editing
      onChange={(e) =>
        handleInputChange({
          target: {
            name: "employee_id",
            value: "TAS-" + e.target.value.replace(/\D/g, ""), // always add TAS-
          },
        })
      }
      className="w-full p-3 border border-gray-300 rounded-r-xl focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200 ease-in-out"
    />
  </div>

  {validationErrors.employee_id && (
    <p className="text-red-500 text-xs mt-1">
      {validationErrors.employee_id[0]}
    </p>
  )}
</div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="e.g., jane.doe@example.com"
                    name="email"
                    value={newEmployee.email}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200 ease-in-out"
                    autoComplete="username"
                  />
                  {validationErrors.email && (
                    <p className="text-red-500 text-xs mt-1">
                      {validationErrors.email[0]}
                    </p>
                  )}
                </div>
                          <div className="relative">
      <label
        htmlFor="password"
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        Password <span className="text-red-500">*</span>
      </label>
      <input
        id="password"
        type={showPassword ? "text" : "password"}
        placeholder="Create a strong password"
        name="password"
        value={newEmployee.password}
        onChange={handleInputChange}
        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200 ease-in-out pr-10"
        autoComplete="new-password"
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute top-10 right-3 transform -translate-y-2/2 text-gray-400 hover:text-gray-700"
        tabIndex={-1}
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
      {validationErrors.password && (
        <p className="text-red-500 text-xs mt-1">
          {validationErrors.password[0]}
        </p>
      )}
    </div>
              </div>

              {/* Password and Phone Number - Half-half layout on larger screens */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
    
                <div>
                  <label
                    htmlFor="phone_num"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-blue-500 transition-all duration-200 ease-in-out">
                    <span className="pl-3 pr-2 text-gray-500 border-r border-gray-200 h-full flex items-center bg-gray-50 rounded-l-xl">
                      +91
                    </span>
                    <input
                      id="phone_num"
                      type="text"
                      placeholder="e.g., 9876543210"
                      name="phone_num"
                      value={newEmployee.phone_num}
                      onChange={(e) => {
                        const inputVal = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
                        if (inputVal.length <= 10) {
                          setNewEmployee({ ...newEmployee, phone_num: inputVal });
                        }
                      }}
                      className="w-full p-3 outline-none rounded-r-xl"
                    />
                  </div>
                  {validationErrors.phone_num && (
                    <p className="text-red-500 text-xs mt-1">
                      {validationErrors.phone_num[0]}
                    </p>
                  )}
                </div>
                 <div>
                  <label
                    htmlFor="emergency_phone_num"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Emergency Contact <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-blue-500 transition-all duration-200 ease-in-out">
                    <span className="pl-3 pr-2 text-gray-500 border-r border-gray-200 h-full flex items-center bg-gray-50 rounded-l-xl">
                      +91
                    </span>
                    <input
                      id="emergency_phone_num"
                      type="text"
                      placeholder="e.g., 9876512345"
                      name="emergency_phone_num"
                      value={newEmployee.emergency_phone_num}
                      onChange={(e) => {
                        const inputVal = e.target.value.replace(/\D/g, "");
                        if (inputVal.length <= 10) {
                          setNewEmployee({
                            ...newEmployee,
                            emergency_phone_num: inputVal,
                          });
                        }
                      }}
                      className="w-full p-3 outline-none rounded-r-xl"
                    />
                    
                  </div>
                  {validationErrors.emergency_phone_num && (
                    <p className="text-red-500 text-xs mt-1">
                      {validationErrors.emergency_phone_num[0]}
                    </p>
                  )}
                </div>
              </div>

              {/* Emergency Contact and Address - Half-half layout on larger screens */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
               
                <div>
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Home Address
                  </label>
                  <input
                    id="address"
                    type="text"
                    placeholder="e.g., 123 Main St, Anytown"
                    name="address"
                    value={newEmployee.address}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200 ease-in-out"
                  />
                  {validationErrors.address && (
                    <p className="text-red-500 text-xs mt-1">
                      {validationErrors.address[0]}
                    </p>
                  )}
                </div>
                         {/* <div>
                  <label
                    htmlFor="role_id"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Select Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="role_id"
                    name="role_id"
                    value={newEmployee.role_id}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm appearance-none pr-8 transition-all duration-200 ease-in-out"
                  >
                    <option value="">-- Select Role --</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                  {validationErrors.role_id && (
                    <p className="text-red-500 text-xs mt-1">
                      {validationErrors.role_id[0]}
                    </p>
                  )}
                </div> */}


  <div className="relative" ref={roleDropdownRef}>
  <label className="block font-medium text-gray-700 text-sm mb-2 cursor-pointer">
    Select Role <span className="text-red-500">*</span>
  </label>
  <div className="relative">
    <input
      type="text"
      placeholder="Search and select a role..."
      className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none pr-10"
      value={roleSearchQuery}
      onChange={(e) => setRoleSearchQuery(e.target.value)}
      autoComplete="off"
      onMouseDown={(e) => {
        e.stopPropagation();
        setIsRoleDropdownOpen(prev => !prev);  // ✅ TOGGLE
      }}
    />
  </div>
  
  {selectedRole.length > 0 && (
    <div className="mt-2 flex flex-wrap gap-2">
      {selectedRole.map((role) => (
        <div key={role.id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs flex items-center">
          {role.name}
          <button
            type="button"
            onMouseDown={(e) => {
              e.stopPropagation();
              handleRoleSelect(role);  // ✅ REMOVE
            }}
            className="ml-2 text-blue-600 hover:text-blue-800 font-bold text-sm -mr-1"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )}
  
  {isRoleDropdownOpen && filteredRoles.length > 0 && (
    <ul
      onMouseDown={(e) => e.stopPropagation()}
      className="absolute z-50 w-full mt-1 max-h-48 overflow-auto border border-gray-300 rounded-md bg-white shadow-lg"
    >
      {filteredRoles.map((role) => (
        <li
          key={role.id}
          onMouseDown={(e) => {
            e.stopPropagation();
            handleRoleSelect(role);
          }}
          className={`cursor-pointer px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-blue-50 transition-colors ${
            selectedRole.some(r => r.id === role.id)
              ? 'bg-blue-100 border-r-4 border-blue-500'
              : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="font-medium text-sm">{role.name}</div>
            {selectedRole.some(r => r.id === role.id) && (
              <span className="text-green-600 font-bold text-sm">✓</span>
            )}
          </div>
        </li>
      ))}
    </ul>
  )}
</div>





                
   
              </div>
            {/* <div className="relative" onClick={handleToggle1} ref={dropdownRef}>
    <label htmlFor="department-select" className="block font-semibold text-gray-700 mb-2">
      Department
    </label>
    <input
      id="department-select"
      type="text"
      placeholder="Search and select a department..."
      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-150 ease-in-out text-gray-700"
      value={departmentSearchQuery}
      onChange={(e) => {
        setDepartmentSearchQuery(e.target.value);
        setIsDepartmentDropdownOpen(true);
      }}
     onFocus={() => {
  setIsDepartmentDropdownOpen(true);
  setDepartmentSearchQuery("");  
}}
    />
{isDepartmentDropdownOpen && (
  <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
    {(departmentSearchQuery 
       ? filteredDepartments 
       : department  
    ).length > 0 ? (
      (departmentSearchQuery ? filteredDepartments : department).map(dep => (
        <div
          key={dep.id}
          className="cursor-pointer px-4 py-3 hover:bg-blue-50 transition-colors duration-150 text-gray-800"
      onClick={() => {
  setSelectedDepartment(prev => {
    if (prev.some(d => d.id === dep.id)) {
      return prev;
    }
    return [...prev, dep];
  });
  setDepartmentSearchQuery(""); 
  setIsDepartmentDropdownOpen(false);
}}
        >
          {dep.name}
        </div>
      ))
    ) : (
      <p className="p-4 text-gray-500">No departments found</p>
    )}
  </div>
)}
{selectedDepartment.length > 0 && (
  <div className="mt-4 flex flex-wrap gap-2">
    {selectedDepartment.map(dep => (
      <span key={dep.id} className="flex items-center bg-blue-100 text-blue-800 text-sm font-medium px-4 py-2 rounded-full shadow-sm">
        {dep.name}
        <button
          type="button"
          onClick={() => {
            setSelectedDepartment(selectedDepartment.filter(d => d.id !== dep.id));
          }}
          className="ml-2 text-blue-600 hover:text-red-600 text-lg leading-none focus:outline-none"
          aria-label={`Remove ${dep.name}`}
        >
          &times;
        </button>
      </span>
    ))}
  </div>
)}

  </div> */}


              {/* Team and Role - Half-half layout on larger screens */}



                
              
       
                 {!["1", "2", "3", "4"].includes(newEmployee.role_id?.toString()) && (
  <div className="relative" ref={teamDropdownRef}>
    <label className="block font-medium text-gray-700 text-sm mb-2 cursor-pointer">
      Teams 
    </label>
    <div className="relative">
      <input
        type="text"
        className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none pr-10"
        placeholder="Search and select a Team..."
        value={teamSearchQuery}
        onChange={(e) => setTeamSearchQuery(e.target.value)}
        autoComplete="off"
        onMouseDown={(e) => {
          e.stopPropagation();
          setIsTeamDropdownOpen(prev => !prev);  // ✅ TOGGLE
        }}
      />
    </div>
    
    {selectedTeam.length > 0 && (
      <div className="mt-2 flex flex-wrap gap-2">
        {selectedTeam.map((team) => (
          <div key={team.id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs flex items-center">
            {team.name}
            <button
              type="button"
              onMouseDown={(e) => {
                e.stopPropagation();
                handleSelect(team);  // ✅ REMOVE
              }}
              className="ml-2 text-blue-600 hover:text-blue-800 font-bold text-sm -mr-1"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    )}
    
    {isTeamDropdownOpen && filteredTeams.length > 0 && (
      <ul
        onMouseDown={(e) => e.stopPropagation()}
        className="absolute z-50 w-full mt-1 max-h-48 overflow-auto border border-gray-300 rounded-md bg-white shadow-lg"
      >
        {filteredTeams.map((team) => (
          <li
            key={team.id}
            onMouseDown={(e) => {
              e.stopPropagation();
              handleSelect(team);
            }}
            className={`cursor-pointer px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-blue-50 transition-colors ${
              selectedTeam.some(t => t.id === team.id)
                ? 'bg-blue-100 border-r-4 border-blue-500'
                : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="font-medium text-sm">{team.name}</div>
              {selectedTeam.some(t => t.id === team.id) && (
                <span className="text-green-600 font-bold text-sm">✓</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    )}
  </div>
)}



          {!["1", "2", "3", "4","5","6","8","9","10"].includes(newEmployee.role_id?.toString()) && (

  <div>
    <label
      htmlFor="team_id"
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      Select Team Lead
<select
  id="tl_id"
  name="tl_id"
 value={newEmployee.tl_id != null ? String(newEmployee.tl_id) : ""}
onChange={(e) => {
  const selectedTeamId = e.target.value !== "" ? e.target.value : "";
  setNewEmployee({
    ...newEmployee,
    tl_id: selectedTeamId,
  });

  if (!selectedTeamId) {
    setTl([]);
  } else {
    // fetchTl(selectedTeamId);
  }
}}

  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm appearance-none pr-8 transition-all duration-200 ease-in-out"
>
  <option value="">-- Select Team Lead --</option>
  {tl.length > 0 ? (
    tl.map((team) => (
      <option key={team.id} value={String(team.id)}>
        {team.name}
      </option>
    ))
  ) : (
    <option disabled>No TL available</option>
  )}
</select>
</label>

</div>
          )}

  
  <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Reporting Manager
  </label>

  <select
    value={newEmployee.reporting_manager_id}
    onChange={(e) =>
      setNewEmployee({
        ...newEmployee,
        reporting_manager_id: e.target.value,
      })
    }
    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
  >
    <option value="">-- Select Reporting Manager --</option>

    {loadingRM && <option disabled>Loading...</option>}

    {!loadingRM && reportingManagers.length === 0 && (
      <option disabled>No Reporting Manager found</option>
    )}

    {!loadingRM &&
      reportingManagers.map((rm) => (
        <option key={rm.id} value={rm.id}>
          {rm.name}
        </option>
      ))}
  </select>

  {validationErrors.reporting_manager_id && (
    <p className="text-red-500 text-xs mt-1">
      {validationErrors.reporting_manager_id[0]}
    </p>
  )}
</div>



             

              {/* Profile Picture */}
              <div>
                <label
                  htmlFor="profile_pic"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Profile Picture
                </label>
                <input
  id="profile_pic"
  type="file"
  name="profile_pic"
  accept="image/*"
  onChange={(e) => {
    const fileInput = e.target;
    const file = fileInput.files?.[0];

    if (file) {
      const maxSizeInBytes = 1 * 1024 * 1024; // 1MB

      if (file.size > maxSizeInBytes) {
        showAlert({
          variant: "error",
          title: "Upload Error",
          message: "Image size must be 1MB or less.",
        });

        // ❗ Reset the file input so it clears the selected file
        fileInput.value = "";
        return;
      }

      setNewEmployee((prev) => ({
        ...prev,
        profile_pic: file,
      }));
    }
  }}
  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all duration-200 ease-in-out"
/>


                {validationErrors.profile_pic && (
                  <p className="text-red-500 text-xs mt-1">
                    {validationErrors.profile_pic[0]}
                  </p>
                )}
              </div>

              {/* General error message */}
              {/* {contextError && (
                <p className="text-red-500 text-sm mt-4 text-center">
                  {contextError}
                </p>
              )} */}



              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-lg transform transition-all duration-300 ease-in-out active:scale-95 text-lg"
              >
                Add Employee
              </button>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;
