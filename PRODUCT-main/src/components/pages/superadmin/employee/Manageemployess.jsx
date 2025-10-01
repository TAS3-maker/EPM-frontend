import React, { useState, useEffect } from "react";
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
// import { useTLContext } from "../../../context/TLContext";
import Pagination from "../../../components/Pagination";
const EmployeeManagement = () => {
  const navigate = useNavigate();
  const { employees, loading,fetchTl ,tl, addEmployee, deleteEmployee, updateEmployee, error: contextError ,setTl} = useEmployees(); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [importType, setImportType] = useState(null);
    const [userrole, setUserrole] = useState("");
  const [showImportOptions, setShowImportOptions] = useState(false);
  const [filterBy, setFilterBy] = useState("name");
  const [googleSheetUrl, setGoogleSheetUrl] = useState("");
const { importEmployees , loading1 } = useImportEmployees();
const [selectedFile, setSelectedFile] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
 const {
    importClientData,
    importProjectData,
    importEmployeeData,
    importLoading,
  } = useImport();


//   useEffect(() => { 
// fetchTl();
//   }, []);


  const [validationErrors, setValidationErrors] = useState({});


  const filteredEmployees = employees.filter((employee) => {
    const value = (employee[filterBy]?.toLowerCase() || "").trim();
    return value.includes(searchQuery.toLowerCase().trim());
  });
  

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
    team_id: "",
    role_id: "",
    profile_pic: null,
    tl_id: "", 
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
    
    setEditingEmployee({
      ...employee,
      team_id: employee.team_id || null, 
      role_id: employee.role_id || null,
      tl_id: employee.tl_id || null, 
    });

    setValidationErrors({});
  };

 
  const handleUpdateEmployee = async () => {
    console.log("before sending", editingEmployee);
    if (!editingEmployee) return;

   
    setValidationErrors({});

    try {
      await updateEmployee(editingEmployee.id, { ...editingEmployee });
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
      !newEmployee.role_id 
    ) {
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
        emergency_phone_num: !newEmployee.role_id ? ["Emergency phone nmumber is required."] : prev.emergency_phone_num,
         employee_id: !newEmployee.employee_id ? ["Employee ID is required."] : prev.employee_id,
        // role_id: !newEmployee.role_id ? ["The role field is required."] : prev.role_id,
      }));
      return;
    }

    console.log("✅ New Employee Data:", newEmployee);

    try {
      await addEmployee(newEmployee);
      setNewEmployee({
        name: "",
        email: "",
        password: "",
        phone_num: "",
        emergency_phone_num: "",
        address: "",
        team_id: "",
        role_id: "",
        profile_pic: null,
        tl_id: "", 
        employee_id: "",
      });
      setValidationErrors({}); // Clear errors on successful submission
      closeModal();
    } catch (err) {
      console.error("❌ Error in handleAddEmployee (component):", err);
      let generalErrorMessage = "Something went wrong while adding the employee.";
      let backendErrors = {};

      if (err.message) { 
        try {
          const parsedError = JSON.parse(err.message);
          if (parsedError.errors) {
            backendErrors = parsedError.errors; // This captures ALL field-specific errors
            // Prioritize specific messages for the general alert
            if (parsedError.errors.email && parsedError.errors.email[0]) {
              generalErrorMessage = parsedError.errors.email[0];
            } else if (Object.values(parsedError.errors).length > 0) {
              // Get the first error message from any field
              generalErrorMessage = Object.values(parsedError.errors)[0][0];
            } else {
              generalErrorMessage = parsedError.message || "Validation failed.";
            }
          } else if (parsedError.message) {
            generalErrorMessage = parsedError.message; // General message if no 'errors' object
          }
        } catch (parseError) {
          // If err.message is not valid JSON (e.g., network error or other unexpected error)
          generalErrorMessage = err.message;
        }
      }

      setValidationErrors(backendErrors); // Set the detailed errors for input fields
      showAlert({ variant: "error", title: "Failed", message: generalErrorMessage }); // Show general alert
    }
  };
  // --- END MODIFIED handleAddEmployee ---


  const openModal = () => {
    setIsModalOpen(true);
    setValidationErrors({}); // Clear errors when opening add modal
    setNewEmployee({ // Reset form when opening add modal
      name: "",
      email: "",
      password: "",
      phone_num: "",
      emergency_phone_num: "",
      address: "",
      team_id: "",
      role_id: "",
      profile_pic: null,
      tl_id: "",
      employee_id:"",
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setValidationErrors({}); // Clear errors when closing modal
  };

  const { teams, fetchTeams } = useTeam();
  const { roles, fetchRoles } = useRole();

  useEffect(() => {
    fetchTeams();
    fetchRoles();
  }, []); // Depend on nothing for initial fetch

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
  "TL"
];

const showTeamLeadDropdown = !rolesWithoutTeamLead.includes(newEmployee.role_name);


  return (
    <div className="rounded-2xl border border-gray-200 bg-white !shadow-md max-h-screen overflow-y-auto">
      <SectionHeader icon={BarChart} title="Employee Management" subtitle="Manage employees and update details" />
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 sticky top-0 bg-white z-10 shadow-md">
{userrole !== "billingmanager" && (

        <button onClick={openModal} className="add-items-btn">
          Add Employee
        </button>
  )}
        {/* Search & Filter */}
        <div className="flex flex-wrap md:flex-nowrap items-center gap-3 border p-2 rounded-lg shadow-md bg-white">
          <div className="flex items-center w-full border border-gray-300 px-2 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
            <Search className="h-5 w-5 text-gray-400 mr-[5px]" />
            <input
              type="text"
              className="w-full rounded-lg focus:outline-none py-2"
              placeholder={filterBy==="employee_id" ? "Search by Employee ID" : `Search by ${filterBy}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="px-3 py-2 border rounded-md bg-white cursor-pointer focus:outline-none"
          >
            <option value="name">Name</option>
            <option value="email">Email</option>
            <option value="team">Department</option>
            <option value="phone_num">Phone</option>
            <option value="employee_id">Employee ID</option>
            <option value="roles">Role</option>
          </select>

          <ClearButton onClick={() => setSearchQuery("")} />
          <div className="flex items-center gap-3 bg-white relative">
            <ImportButton onClick={() => setShowImportOptions(!showImportOptions)} />
            <div className="relative">
              <ExportButton onClick={() => exportToExcel(employees, "employees.xlsx")} />
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

      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="table-th-tr-row table-bg-heading">
              <th className="px-4 py-2 text-center"></th>
               <th className="px-4 py-2 text-center">Emp ID</th>
              <th className="px-4 py-2 text-center">Name</th>
              <th className="px-4 py-2 text-center">Email</th>
              <th className="px-4 py-2 text-center">Phone</th>
              <th className="px-4 py-2 text-center">Department</th>
              <th className="px-4 py-2 text-center">Role</th>
              <th className="px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="px-4 py-3 text-center text-gray-500">Loading employees...</td>
              </tr>
            ) : employeeList.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-3 text-center text-gray-500">No employees found</td>
              </tr>
            ) : (
              currentEmployees.filter(employee => employee.roles !== 'Super Admin')
              .map((employee) => (
                <tr key={employee.id} className="border-b border-gray-300 hover:bg-gray-100">
                  <td className="px-4 py-3 text-gray-900">
                    <img
                      className="border-2 shadow-[5px_8px_10px_-7px_rgba(128,128,128,1)] rounded-full w-12 h-12 object-cover"
                      src={employee.profile_pic ? employee.profile_pic : user_profile}
                      alt={employee.name}
                    />
                  </td>
                  <td className="px-4 py-3 text-gray-900 text-center">{employee.employee_id}</td>
                  <td className="px-4 py-3 text-gray-900 text-center">{employee.name}</td>
                  <td className="px-4 py-3 text-gray-900 text-center">{employee.email}</td>
                  <td className="px-4 py-3 text-gray-900 text-center">{employee.phone_num || ""}</td>
                  <td className="px-4 py-3 text-gray-900 text-center">{employee.team || ""}</td>
                  <td className="px-4 py-3 text-gray-900 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-800">{employee.roles || "N/A"}</span>
                  </td>
                  <td className="px-4 py-3 flex gap-2 items-center justify-center">
                     <div className="relative group">
                        <IconViewButton onClick={() => { handleViewEmployeeDetail(employee);}} />
                        <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 
                                        whitespace-nowrap bg-white text-black text-sm px-2 py-1 rounded 
                                        opacity-0 group-hover:opacity-100 transition pointer-events-none shadow">
                          View
                        </span>
                      </div>
{userrole !== "billingmanager" && (


                      <div className="relative group">
                            <IconEditButton onClick={() => handleEditEmployee(employee)} />
                            <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 
                              whitespace-nowrap bg-white text-black text-sm px-2 py-1 rounded 
                              opacity-0 group-hover:opacity-100 transition pointer-events-none shadow">
                                  Edit
                          </span>
                      </div>
  )}
                    {/* <IconDeleteButton onClick={() => handleDeleteEmployee(employee.id)} /> */}
                 {userrole !== "billingmanager" && (
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
                </tr>
              ))
            )}
          </tbody>
          
        </table>
        <div className="p-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
        </div>
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
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto p-8 bg-white bg-opacity-95 rounded-3xl shadow-2xl transform scale-95 animate-slideUp border border-gray-200 backdrop-filter backdrop-blur-lg">
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
                    <div>
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
                    </div>
                
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
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 bg-white bg-opacity-95 rounded-3xl shadow-2xl transform scale-95 animate-slideUp border border-gray-200 backdrop-filter backdrop-blur-lg">
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
                         <div>
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
                    {/* Ensure `roles` is an array of objects with `id` and `name` */}
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
              </div>

              {/* Team and Role - Half-half layout on larger screens */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
       
                {!["1", "2", "3", "4"].includes(newEmployee.role_id) && (
              
  <div>
    <label
      htmlFor="team_id"
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      Select Department
    </label>
    <select
      id="team_id"
      name="team_id"
      value={newEmployee.team_id ?? ""}
     onChange={(e) => {
      const selectedTeamId = e.target.value === "" ? null : e.target.value;
      setNewEmployee({
        ...newEmployee,
        team_id: selectedTeamId,
      });

      if (selectedTeamId) {
        console.log("Fetching TL for team_id:", selectedTeamId);
        fetchTl(selectedTeamId); 
      }
    }}
      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm appearance-none pr-8 transition-all duration-200 ease-in-out"
    >
      <option value="">-- Select Department --</option>
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
  </div>
)}


          {!["1", "2", "3", "4","5","6"].includes(newEmployee.role_id) && (

  <div>
    <label
      htmlFor="team_id"
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      Select Team Lead
<select
  id="tl_id"
  name="tl_id"
  value={newEmployee.tl_id ?? ""}
  onChange={(e) => {
    const selectedTeamId = e.target.value || null;

    setNewEmployee({
      ...newEmployee,
      tl_id: selectedTeamId,
    });

    if (!selectedTeamId) {

      setTl([]);
    } else {
      console.log("Fetching TL for tl_id:", selectedTeamId);
      fetchTl(selectedTeamId);
    }
  }}
  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm appearance-none pr-8 transition-all duration-200 ease-in-out"
>
  <option value="">-- Select Team Lead --</option>
  {tl.length > 0 ? (
    tl.map((team) => (
      <option key={team.id} value={team.id}>
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
