import React, { useState, useEffect, useRef } from "react";
import { useProjectMaster } from '../../../context/ProjectMasterContext';
import { useMasterClient } from "../../../context/MasterClientContext";
import { useProjectSource } from "../../../context/ProjectSourceContext";
import { useCommunicationType } from "../../../context/CommunicationTypeContext";
import { useAccount } from "../../../context/AccountContext";
import { useAlert } from "../../../context/AlertContext";
import { SubmitButton } from "../../../AllButtons/AllButtons";
import { useBDProjectsAssigned } from "../../../context/BDProjectsassigned";
import { usePMContext } from "../../../context/PMContext";
import { useTLContext } from "../../../context/TLContext";
import ReactQuill from 'react-quill';
import { usePermissions } from "../../../context/PermissionContext";
import 'react-quill/dist/quill.snow.css';
import { useOutsideClick } from "../../../components/useOutsideClick";
import { useEmployees } from "../../../context/EmployeeContext";

export const ProjectsMaster = ({

  isEditMode = false,
  editProject = null,
  onSaveSuccess,
  onCancel
}) => {
  const { addProjectMaster, editProjectMaster, isLoading, message } = useProjectMaster();
  const { masterClients, fetchMasterClients } = useMasterClient();
  const { projectSources, fetchProjectSources } = useProjectSource();
  const { communicationTypes, fetchCommunicationTypes } = useCommunicationType();
  const { accounts, fetchAccounts } = useAccount();
  const { showAlert } = useAlert();
  const { projectManagers } = useBDProjectsAssigned();
  const { teamleaders } = usePMContext();
  const { employees, fetchEmployees } = useTLContext();
  const { permissions } = usePermissions()
  const { employees1, fetchTl, fetchEmployees1, tl, addEmployee, deleteEmployee, updateEmployee, error: contextError, setTl } = useEmployees();

  const [showModal, setShowModal] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");

  const [formData, setFormData] = useState({
    project_name: "",
    client_id: "",
    source_id: "",
    account_id: "",
    communication_id: [],
    assignees: [],
    sales_person_id: "",
    project_tracking: "1",
    project_status: "In Progress",
    project_description: "",
    project_budget: "",
    project_hours: "",
    project_used_hours: "",
    offline_hours: "1",
    project_used_budget: "",
    project_tag_activity: 1,
    is_tracking_enabled: true,
    use_same_source: true,
    tracking_source_id: "",
    tracking_account_id: "",
  });

  // Client search states
  const [clientSearch, setClientSearch] = useState("");
  const [filteredClients, setFilteredClients] = useState([]);
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);

  // Sales search states
  const [salesPersonSearch, setSalesPersonSearch] = useState("");
  const [filteredSalesPerson, setFilteredSalesPerson] = useState([]);
  const [isSalesPersonDropdownOpen, setIsSalesPersonDropdownOpen] = useState(false);

  // Project Source states
  const [sourceSearch, setSourceSearch] = useState("");
  const [filteredSources, setFilteredSources] = useState([]);
  const [isSourceDropdownOpen, setIsSourceDropdownOpen] = useState(false);

  // Source accounts
  const [sourceAccounts, setSourceAccounts] = useState([]);
  const [isSourceSubDropdownOpen, setIsSourceSubDropdownOpen] = useState(false);

  //  TRACKING SOURCE states
  const [trackingSourceSearch, setTrackingSourceSearch] = useState("");
  const [filteredTrackingSources, setFilteredTrackingSources] = useState([]);
  const [isTrackingSourceDropdownOpen, setIsTrackingSourceDropdownOpen] = useState(false);
  const [trackingSourceAccounts, setTrackingSourceAccounts] = useState([]);
  const [isTrackingSourceSubDropdownOpen, setIsTrackingSourceSubDropdownOpen] = useState(false);

  // Communication MULTI-SELECT states
  const [selectedCommunications, setSelectedCommunications] = useState([]);
  const [communicationSearch, setCommunicationSearch] = useState("");
  const [filteredCommunications, setFilteredCommunications] = useState([]);
  const [isCommunicationDropdownOpen, setIsCommunicationDropdownOpen] = useState(false);

  //  ASSIGNEE MULTI-SELECT states (Real data from contexts)
  const [selectedManagers, setSelectedManagers] = useState([]);
  const [selectedTeamLeaders, setSelectedTeamLeaders] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [assigneeSearch, setAssigneeSearch] = useState("");
  const [isAssigneeDropdownOpen, setIsAssigneeDropdownOpen] = useState(false);

  // Dropdown refs
  // ✅ ALL DROPDOWN REFS
  const clientRef = useRef(null);
  const sourceRef = useRef(null);
  const sourceSubRef = useRef(null);
  const communicationRef = useRef(null);
  const trackingSourceRef = useRef(null);
  const trackingSourceSubRef = useRef(null);
  const assigneeRef = useRef(null);



  const clientInputRef = useRef(null);
  const clientDropdownRef = useRef(null);



  //  NEW: EDIT MODE - Prefill form data
  useEffect(() => {
    if (isEditMode && editProject) {
      console.log("🔧 Prefilling EDIT form:", editProject);
      populateEditData(editProject);
    }
  }, [isEditMode, editProject]);


  //  NEW: Populate form with existing project data
  const populateEditData = (projectData) => {
    const project = projectData.project || projectData;
    const relation = projectData.relation || projectData;
    /* ---------------- BASIC FORM ---------------- */
    setFormData({
      project_name: project.project_name || "",
      client_id: relation.client_id || "",
      source_id: relation.source_id || "",
      account_id: relation.account_id || "",
      communication_id: relation.communication_id || [],
      assignees: relation.assignees_id || [],
      sales_person_id: relation.sales_person_id || "",
      project_tracking: project.project_tracking || "1",
      project_status: project.project_status || "In Progress",
      project_description: project.project_description || "",
      project_budget: project.project_budget || "",
      project_hours: project.project_hours || "",
      project_used_hours: project.project_used_hours || "",
      project_used_budget: project.project_used_budget || "",
      project_tag_activity: project.project_tag_activity || 1,
      offline_hours: project.offline_hours ? "1" : "0", is_tracking_enabled: project.is_tracking_enabled !== false,
      use_same_source: relation.use_same_source !== false,
      tracking_source_id: relation.tracking_source_id || "",
      tracking_account_id: relation.tracking_account_id || "",
    });


     // ✅ SALES PERSON EDIT PREFILL
  const salesPersonId = relation.sales_person_id;
  if (salesPersonId && employees1) {
    const salesPerson = employees1.find(emp => emp.id == salesPersonId);
    if (salesPerson) {
      setSalesPersonSearch(salesPerson.employee_name || salesPerson.name);
      setSelectedEmployeeId(salesPersonId.toString());
    }
  }



    setSourceSearch(relation.source)
    setClientSearch(relation.client_name || "");
    setSelectedCommunications(relation.communication_id || []);
    setSelectedEmployeeId(relation.sales_person_id?.toString() || "");

    /* ---------------- ASSIGNEES (ROLE-WISE) ---------------- */
    const assignees = relation.assignees || [];
    // :large_blue_square: Project Managers
    const managers = assignees
      .filter(a => a.role_names?.includes("Project Manager"))
      .map(a => ({
        id: a.id,
        name: a.name,
      }));
    const teamLeads = assignees
      .filter(a => a.role_names?.includes("TL"))
      .map(a => ({
        id: a.id,
        name: a.name,
      }));

    const emps = assignees
      .filter(a => a.role_names?.includes("Team"))
      .map(a => ({
        id: a.id,
        name: a.name,
      }));

    setSelectedManagers(managers);
    setSelectedTeamLeaders(teamLeads);
    setSelectedEmployees(emps);
  };




  // Filter clients
  useEffect(() => {
    if (!clientSearch.trim()) {
      setFilteredClients(masterClients || []);
      return;
    }
    const filtered = masterClients?.filter((client) =>
      client.client_name?.toLowerCase().includes(clientSearch.toLowerCase().trim()) ||
      client.client_email?.toLowerCase().includes(clientSearch.toLowerCase().trim())
    ) || [];
    setFilteredClients(filtered);
  }, [clientSearch, masterClients]);


// Filter clients
  // ✅ FIXED Sales Person Filter useEffect (replace existing wala)
useEffect(() => {
  console.log("🔍 Filtering sales persons... search:", salesPersonSearch, "employees1:", employees1?.length);
  
  if (!salesPersonSearch.trim()) {
    console.log("No search term, showing all");
    setFilteredSalesPerson(employees1 || []);
    return;
  }
  
  const filtered = employees1?.filter((employee) => {
    // Multiple fields check karo with null safety
    const name = (employee.employee_name || employee.name || '').toLowerCase();
    const id = (employee.employee_id || employee.id || '').toString().toLowerCase();
    const searchTerm = salesPersonSearch.toLowerCase().trim();
    
    console.log(`Checking employee: ${name} | ID: ${id} | Search: ${searchTerm}`);
    
    return name.includes(searchTerm) || id.includes(searchTerm);
  }) || [];
  
  console.log("Filtered result:", filtered.length);
  setFilteredSalesPerson(filtered);
}, [salesPersonSearch, employees1]); // ✅ Dependencies perfect




  // Filter sources
  useEffect(() => {
    if (!sourceSearch.trim()) {
      setFilteredSources(projectSources || []);
      return;
    }
    const filtered = projectSources?.filter((source) =>
      source.source_name?.toLowerCase().includes(sourceSearch.toLowerCase().trim())
    ) || [];
    setFilteredSources(filtered);
  }, [sourceSearch, projectSources]);

  // ✅ Filter tracking sources
  useEffect(() => {
    if (!trackingSourceSearch.trim()) {
      setFilteredTrackingSources(projectSources || []);
      return;
    }
    const filtered = projectSources?.filter((source) =>
      source.source_name?.toLowerCase().includes(trackingSourceSearch.toLowerCase().trim())
    ) || [];
    setFilteredTrackingSources(filtered);
  }, [trackingSourceSearch, projectSources]);

  // Filter source accounts
  useEffect(() => {
    if (formData.source_id && accounts.length > 0) {
      const filteredAccounts = accounts.filter(account =>
        String(account.source.id) === String(formData.source_id)
      );
      setSourceAccounts(filteredAccounts);
    } else {
      setSourceAccounts([]);
    }
  }, [formData.source_id, accounts]);

  // ✅ Filter tracking source accounts
  useEffect(() => {
    if (formData.tracking_source_id && accounts.length > 0) {
      const filteredAccounts = accounts.filter(account =>
        String(account.source.id) === String(formData.tracking_source_id)
      );
      setTrackingSourceAccounts(filteredAccounts);
    } else {
      setTrackingSourceAccounts([]);
    }
  }, [formData.tracking_source_id, accounts]);

  // Filter COMMUNICATION
  useEffect(() => {
    if (!communicationSearch.trim()) {
      setFilteredCommunications(communicationTypes || []);
      return;
    }
    const filtered = communicationTypes?.filter((comm) =>
      comm.medium?.toLowerCase().includes(communicationSearch.toLowerCase().trim()) ||
      comm.medium_details?.toLowerCase().includes(communicationSearch.toLowerCase().trim())
    ) || [];
    setFilteredCommunications(filtered);
  }, [communicationSearch, communicationTypes]);

  // Sync formData with selectedCommunications
  useEffect(() => {
    setFormData(prev => ({ ...prev, communication_id: selectedCommunications }));
  }, [selectedCommunications]);

  // ✅ Sync all assignees to formData
  useEffect(() => {
    const allAssigneeIds = [
      ...selectedManagers.map(m => m.id),
      ...selectedTeamLeaders.map(tl => tl.id),
      ...selectedEmployees.map(e => e.id)
    ];
    setFormData(prev => ({ ...prev, assignees: allAssigneeIds }));
  }, [selectedManagers, selectedTeamLeaders, selectedEmployees]);

  // ✅ Sync tracking source with main source
  useEffect(() => {
    if (formData.use_same_source && formData.source_id) {
      setFormData(prev => ({
        ...prev,
        tracking_source_id: formData.source_id,
        tracking_account_id: formData.account_id
      }));
      setTrackingSourceSearch(sourceSearch);
    }
  }, [formData.use_same_source, formData.source_id, formData.account_id, sourceSearch]);

  // OUTSIDE CLICK HANDLER FOR DROPDOWNS
  useEffect(() => {
    const handleClickOutside = (event) => {

      setIsClientDropdownOpen(false);
      setIsSourceDropdownOpen(false);
      setIsCommunicationDropdownOpen(false);
      setIsAssigneeDropdownOpen(false);
      setIsTrackingSourceDropdownOpen(false);
      setIsSourceSubDropdownOpen(false);
      setIsTrackingSourceSubDropdownOpen(false);
      setIsSalesPersonDropdownOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Load data on mount
  useEffect(() => {
    fetchMasterClients();
    fetchProjectSources();
    fetchCommunicationTypes();
    fetchAccounts();
    fetchEmployees();
    // fetchEmployees1();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
    }));
  };
  const toggleOfflineHours = () => {
    setFormData(prev => ({
      ...prev,
      offline_hours: prev.offline_hours === "1" ? "0" : "1"
    }));
  };


  useEffect(() => {
    console.log('🔍 TRACKING DEBUG:');
    console.log('Tracking enabled?', formData.is_tracking_enabled);
    console.log('Offline hours?', formData.offline_hours);
    console.log('------------------------');
  }, [formData.is_tracking_enabled, formData.offline_hours]);
  // Client select
  const handleClientSelect = (selectedId) => {
    setFormData((prev) => ({ ...prev, client_id: selectedId }));
    const selectedClient = masterClients?.find(client => client.id === selectedId);
    if (selectedClient) {
      setClientSearch(selectedClient.client_name);
    }
    setIsClientDropdownOpen(false);
  };



const handleSalesPersonSelect = (selectedId) => {
  setFormData((prev) => ({ ...prev, sales_person_id: selectedId }));
  const selectedSalesPerson = employees1?.find(employee => employee.id === selectedId);
  if (selectedSalesPerson) {
    setSalesPersonSearch(selectedSalesPerson.employee_name || selectedSalesPerson.name);
    setSelectedEmployeeId(selectedId);  // ✅ Sync state
  }
  setIsSalesPersonDropdownOpen(false);
};




//  const handleSalesPersonSelect = (selectedId) => {
//     setFormData((prev) => ({ ...prev, employee_id: selectedId }));
//     const selectedSalesPerson = employees1?.find(employee => employee.id === selectedId);
//     if (selectedSalesPerson) {
//       setSalesPersonSearch(selectedSalesPerson.employee_name);
//     }
//     setIsSalesPersonDropdownOpen(false);
//   };



  const handleSourceSelect = (selectedId) => {
    setFormData((prev) => ({
      ...prev,
      source_id: selectedId,
      account_id: prev.account_id
    }));
    const selectedSource = projectSources?.find(source => source.id === selectedId);
    if (selectedSource) {
      setSourceSearch(selectedSource.source_name);
    }
    setIsSourceDropdownOpen(false);
    setIsSourceSubDropdownOpen(false);
    setSourceAccounts([]);
  };

  // ✅ Tracking source select
  const handleTrackingSourceSelect = (selectedId) => {
    setFormData((prev) => ({
      ...prev,
      tracking_source_id: selectedId,
      tracking_account_id: ""
    }));
    const selectedSource = projectSources?.find(source => source.id === selectedId);
    if (selectedSource) {
      setTrackingSourceSearch(selectedSource.source_name);
    }
    setIsTrackingSourceDropdownOpen(false);
    setIsTrackingSourceSubDropdownOpen(false);
    setTrackingSourceAccounts([]);
  };

  // Communication MULTI-SELECT handler

  const handleCommunicationSelect = (selectedId) => {
  setSelectedCommunications(prev => {
    if (prev.includes(selectedId)) {
      const newSelected = prev.filter(id => id !== selectedId);
      return newSelected;
    } else {
      const newSelected = [...prev, selectedId];
      return newSelected;
    }
  });
  
  setTimeout(() => {
    setIsCommunicationDropdownOpen(false);
    setCommunicationSearch(""); 
  }, 0);
};




  
  // const handleCommunicationSelect = (selectedId) => {
  //   setSelectedCommunications(prev => {
  //     if (prev.includes(selectedId)) {
  //       return prev.filter(id => id !== selectedId);
  //     } else {
  //       return [...prev, selectedId];
  //     }
  //   });
  // };

  // ✅ MANAGER SELECT
  const handleManagerSelect = (e) => {
    const id = Number(e.target.value);
    if (!id) return;
    const manager = projectManagers.find(m => m.id === id);
    if (manager && !selectedManagers.some(m => m.id === id)) {
      setSelectedManagers(prev => [...prev, manager]);
    }
    e.target.value = "";
  };

  // ✅ TEAM LEADER SELECT
  const handleTeamLeaderSelect = (e) => {
    const id = Number(e.target.value);
    if (!id) return;
    const tl = teamleaders.find(t => t.id === id);
    if (tl && !selectedTeamLeaders.some(t => t.id === id)) {
      setSelectedTeamLeaders(prev => [...prev, tl]);
    }
    e.target.value = "";
  };

  // ✅ EMPLOYEE SELECT
  const handleEmployeeSelect = (e) => {
    const id = Number(e.target.value);
    if (!id) return;
    const emp = employees.find(em => em.id === id);
    if (emp && !selectedEmployees.some(em => em.id === id)) {
      setSelectedEmployees(prev => [...prev, emp]);
    }
    e.target.value = "";
  };

  // Remove functions
  const removeManager = (id) => {
    setSelectedManagers((prev) => prev.filter((manager) => manager.id !== id));
  };

  const removeTeamLeader = (id) => {
    setSelectedTeamLeaders((prev) => prev.filter((tl) => tl.id !== id));
  };

  const removeEmployee = (id) => {
    setSelectedEmployees((prev) => prev.filter((emp) => emp.id !== id));
  };

  const getAccountDisplayNumber = (account) => {
    if (!account) return "No Account Selected";

    if (account.account_name && account.account_name.length > 0) {
      return account.account_name;
    }


    return account.account_number ||
      account.phone_number ||
      account.reference_id ||
      account.external_id ||
      account.id?.toString() ||
      "Unknown Account";
  };
  // ✅ UPDATED - Account object pass karo, displayNumber nahi
  const handleSourceSubSelect = (account) => {
    setFormData((prev) => ({
      ...prev,
      account_id: account.id  // ✅ Actual account ID set hoga
    }));
    setIsSourceSubDropdownOpen(false);
  };

  // ✅ UPDATED - Account object pass karo
  const handleTrackingSourceSubSelect = (account) => {
    setFormData((prev) => ({
      ...prev,
      tracking_account_id: account.id  // ✅ Actual account ID set hoga
    }));
    setIsTrackingSourceSubDropdownOpen(false);
  };

  const toggleTracking = () => {
    setFormData(prev => ({
      ...prev,
      is_tracking_enabled: !prev.is_tracking_enabled,
      ...(prev.is_tracking_enabled ? { tracking_source_id: "", tracking_account_id: "" } : {})
    }));
  };

  const toggleSameSource = () => {
    setFormData(prev => ({
      ...prev,
      use_same_source: !prev.use_same_source,
      ...(prev.use_same_source ? { tracking_source_id: "", tracking_account_id: "" } : {})
    }));
  };

  // OLD handleSubmit ko YE se replace karo:
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.client_id || !formData.project_name) {
      showAlert({ variant: "warning", title: "Warning", message: "Please fill client and project name." });
      return;
    }

    if (!formData.source_id || !formData.account_id) {
      showAlert({ variant: "warning", title: "Warning", message: "Please select source and account ID." });
      return;
    }

    const totalAssignees = selectedManagers.length + selectedTeamLeaders.length + selectedEmployees.length;
    if (totalAssignees === 0) {
      showAlert({ variant: "warning", title: "Warning", message: "Please select at least one assignee (Manager/Team Leader/Employee)." });
      return;
    }

    if (formData.is_tracking_enabled) {
      if (!formData.tracking_source_id || !formData.tracking_account_id) {
        showAlert({ variant: "warning", title: "Warning", message: "Please select tracking source and account ID." });
        return;
      }
    }
    const finalAssignees = [
      ...new Set([
        ...selectedManagers.map(m => Number(m.id)),
        ...selectedTeamLeaders.map(tl => Number(tl.id)),
        ...selectedEmployees.map(e => Number(e.id)),
      ])
    ];

    const submitData = {
      project_name: formData.project_name,
      client_id: formData.client_id,
      source_id: formData.source_id,
      account_id: formData.account_id,
      communication_id: formData.communication_id.join(','),
      assignees: formData.assignees.join(','),
      sales_person_id: formData.sales_person_id,
      project_tracking: formData.project_tracking,
      project_status: formData.is_tracking_enabled ? "In Progress" : "Fixed",
      project_description: formData.project_description,
      project_budget: formData.project_budget,
      project_hours: formData.project_hours,
      project_used_hours: formData.project_used_hours,
      project_used_budget: formData.project_used_budget,
      project_tag_activity: formData.project_tag_activity,
      ...(formData.is_tracking_enabled && {
        is_tracking_enabled: formData.is_tracking_enabled,
        offline_hours: formData.offline_hours,
        tracking_source_id: formData.tracking_source_id,
        tracking_account_id: formData.tracking_account_id,
        use_same_source: formData.use_same_source
      })
    };

    try {
      let result;
      if (isEditMode && editProject) {
        // EDIT MODE
        const projectId = editProject.project?.id || editProject.id;
        result = await editProjectMaster(projectId, submitData);
        console.log("✏️ Edit success:", result);
      } else {
        // ADD MODE
        result = await addProjectMaster(submitData);
      }

      if (result?.success || message) {
        if (onSaveSuccess) onSaveSuccess();
        if (!isEditMode) {
          setShowModal(false);
          resetForm();
          setShowMessage(true);
          setTimeout(() => setShowMessage(false), 3000);
        }
      }
    } catch (error) {
      console.error("Submit error:", error);
      showAlert({ variant: "error", title: "Error", message: "Failed to save project." });
    }
  };


  const resetForm = () => {
    setFormData({
      project_name: "",
      client_id: "",
      source_id: "",
      account_id: "",
      communication_id: [],
      assignees: [],
      sales_person_id: "",
      project_tracking: "1",
      project_status: "In Progress",
      project_description: "",
      project_budget: "",
      project_hours: "",
      project_used_hours: "",
      project_used_budget: "",
      project_tag_activity: 1,
      offline_hours: "0",
      is_tracking_enabled: true,
      use_same_source: true,
      tracking_source_id: "",
      tracking_account_id: "",
    });
    setSelectedCommunications([]);
    setSelectedManagers([]);
    setSelectedTeamLeaders([]);
    setSelectedEmployees([]);
    setClientSearch("");
    setSourceSearch("");
    setTrackingSourceSearch("");
    setCommunicationSearch("");
    setAssigneeSearch("");
    setSourceAccounts([]);
    setTrackingSourceAccounts([]);
  };

  const employeePermission = permissions?.permissions?.[0]?.projects;
  const canAddEmployee = employeePermission === "2"
  const handleCloseAddModal = () => {
    setShowModal(false);

  };
  const addModalRef = useOutsideClick(showModal, handleCloseAddModal);






  return (
    <div className="bg-white">

      {!isEditMode && canAddEmployee && (
        <button
          onClick={() => {
            setShowModal(true);
            resetForm();
          }}
          className="add-items-btn"
        >
          Add Project
        </button>
      )}

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto" ref={addModalRef}>
            <div className="flex justify-between mb-4">
              <div >
                <h2 className="text-xl font-semibold text-gray-800">Enter Project Master Details</h2>
                <p className="text-sm text-gray-500 mt-1">Add a new Project Master to the system</p>
              </div>
              <button className="font-bold text-xl" onClick={() => setShowModal(false)}>×</button>
            </div>

            {showMessage && message && (
              <div className={`mt-4 p-3 rounded-md text-sm font-medium text-center ${message.includes("successfully") || message.includes("created")
                  ? "bg-green-50 text-green-800 border border-green-300"
                  : "bg-red-50 text-red-800 border border-red-300"
                }`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {/* CLIENT SEARCH */}
              <div className="relative">
                <label
                  htmlFor="clientSearch"
                  onMouseDown={() => setIsClientDropdownOpen(false)}
                  className="block font-medium text-gray-700 text-sm" >
                  Client Name *
                </label>
                <input
                  ref={clientInputRef}
                  id="clientSearch"
                  type="text"
                  className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Search client by name"
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  autoComplete="off"
                  // onFocus={() => setIsClientDropdownOpen(true)}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setIsClientDropdownOpen(prev => !prev);
                  }}
                />
                {isClientDropdownOpen && filteredClients.length > 0 && (
                  <ul
                    ref={clientDropdownRef}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="absolute z-50 w-full mt-1 max-h-40 overflow-auto border border-gray-300 rounded-md bg-white shadow-lg">
                    {filteredClients.map((client) => (
                      <li
                        key={client.id}
                        onClick={() => handleClientSelect(client.id)}
                        className="cursor-pointer px-3 py-2 hover:bg-blue-100 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium">{client.client_name}</div>
                        <div className="text-xs text-gray-500">{client.client_email}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* PROJECT NAME */}
              <div>
                <label htmlFor="projectName" className="block font-medium text-gray-700 text-sm">
                  Project Name *
                </label>
                <input
                  id="projectName"
                  name="project_name"
                  value={formData.project_name}
                  onChange={handleInputChange}
                  placeholder="Enter Project Name"
                  className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* PROJECT DESCRIPTION */}
              <div>
                <label htmlFor="projectDescription" className="block font-medium text-gray-700 text-sm">
                  Project Description
                </label>
                <div className="border border-gray-300 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                  <ReactQuill
                    theme="snow"
                    value={formData.project_description}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        project_description: value,
                      }))
                    }
                    placeholder="Enter project description"
                    modules={{
                      toolbar: [
                        [{ header: [1, 2, false] }],
                        ["bold", "italic", "underline"],
                        [{ list: "ordered" }, { list: "bullet" }],
                        ["link"],
                        ["clean"],
                      ],
                    }}
                    formats={[
                      "header",
                      "bold",
                      "italic",
                      "underline",
                      "list",
                      "bullet",
                      "link",
                    ]}
                    className="bg-white"
                    style={{ minHeight: "120px" }}
                  />
                </div>
              </div>

              {/* PROJECT SOURCE */}
              <div className="relative" ref={sourceRef}>
                <label htmlFor="sourceSearch" className="block font-medium text-gray-700 text-sm">
                  Project Source *
                </label>
                <input
                  id="sourceSearch"
                  type="text"
                  className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Search source by name"
                  value={sourceSearch}
                  onChange={(e) => setSourceSearch(e.target.value)}
                  autoComplete="off"
                  // onFocus={() => setIsSourceDropdownOpen(true)}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setIsSourceDropdownOpen(prev => !prev);
                  }}
                />
                {isSourceDropdownOpen && filteredSources.length > 0 && (
                  <ul
                    onMouseDown={(e) => e.stopPropagation()}
                    className="absolute z-50 w-full mt-1 max-h-40 overflow-auto border border-gray-300 rounded-md bg-white shadow-lg">
                    {filteredSources
                      .filter(source => {
                        // 🎯 SHOW ONLY SOURCES WITH ≥1 ACCOUNT
                        const sourceAccountCount = accounts.filter(acc => String(acc.source.id) === String(source.id)).length;
                        return sourceAccountCount > 0;
                      })
                      .map((source) => {
                        const sourceAccountCount = accounts.filter(acc => String(acc.source.id) === String(source.id)).length;
                        return (
                          <li
                            key={source.id}
                            // onClick={() => handleSourceSelect(source.id)}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              handleSourceSelect(source.id);
                            }}
                            className="cursor-pointer px-3 py-2 hover:bg-blue-100 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium">{source.source_name}</div>
                            <div className="text-xs text-gray-500">{sourceAccountCount} accounts</div>
                          </li>
                        );
                      })}
                  </ul>
                )}

              </div>

              {/* ✅ UPDATED SOURCE ACCOUNT ID - Account object pass */}
              {formData.source_id && sourceAccounts.length > 0 && (
                <div className="relative" ref={sourceSubRef}>
                  <label className="block font-medium text-gray-700 text-sm">Source Account ID *</label>
                  <div
                    className="w-full p-2 mt-1 border border-gray-300 rounded-md bg-gray-50 cursor-pointer hover:bg-gray-100 flex justify-between items-center"
                    // onClick={() => setIsSourceSubDropdownOpen(!isSourceSubDropdownOpen)}
                    onMouseDown={(e) => {
                      e.stopPropagation();  // ✅ Ye add karo
                      setIsSourceSubDropdownOpen(!isSourceSubDropdownOpen);
                    }}

                  >
                    <span className="font-normal text-sm">
                      {formData.account_id
                        ? `ID: ${formData.account_id} (${getAccountDisplayNumber(sourceAccounts.find(acc => acc.id == formData.account_id))})`
                        : `${sourceAccounts.length} accounts available`}
                    </span>
                    <span>▼</span>
                  </div>
                  {isSourceSubDropdownOpen && (
                    <ul 
                    onMouseDown={(e) => e.stopPropagation()}
                    className="absolute z-50 w-full mt-1 max-h-40 overflow-auto border border-gray-300 rounded-md bg-white shadow-lg">
                      {sourceAccounts.map((account) => (
                        <li
                          key={account.id}
                          onMouseDown={(e) => {  
                            e.stopPropagation();
                            handleSourceSubSelect(account);
                          }}

                          // onClick={() => handleSourceSubSelect(account)} 
                          className="cursor-pointer px-3 py-2 hover:bg-blue-100 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-normal text-sm text-gray-900 break-all">
                            {getAccountDisplayNumber(account)}  {/* Display same */}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">ID: {account.id}</div>  {/* ✅ ID bhi dikhao */}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}



              {/* ✅ SALES PERSON - CLIENT SEARCH PATTERN SAME */}
<div className="relative">
  <label 
    htmlFor="salesPersonSearch"
    className="block font-medium text-gray-700 text-sm mb-2"
  >
    Sales Person
  </label>
  <input
    id="salesPersonSearch"
    type="text"
    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
    placeholder="Search sales person by name..."
    value={salesPersonSearch}
    onChange={(e) => setSalesPersonSearch(e.target.value)}
    autoComplete="off"
    onMouseDown={(e) => {
      e.stopPropagation();
      setIsSalesPersonDropdownOpen(prev => !prev);
    }}
  />
  {isSalesPersonDropdownOpen && filteredSalesPerson.length > 0 && (
    <ul
      onMouseDown={(e) => e.stopPropagation()}
      className="absolute z-50 w-full mt-1 max-h-40 overflow-auto border border-gray-300 rounded-md bg-white shadow-lg"
    >
      {filteredSalesPerson.map((employee) => (
        <li
          key={employee.id}
          onMouseDown={(e) => {
            e.stopPropagation();
            handleSalesPersonSelect(employee.id);
          }}
          className="cursor-pointer px-3 py-2 hover:bg-blue-100 border-b border-gray-100 last:border-b-0"
        >
          <div className="font-medium">{employee.employee_name || employee.name}</div>
          <div className="text-xs text-gray-500">ID: {employee.id}</div>
        </li>
      ))}
    </ul>
  )}
</div>


              {/* COMMUNICATION MULTI-SELECT */}
              <div className="relative" ref={communicationRef}>
                <label className="block font-medium text-gray-700 text-sm mb-2">
                  Communication Types (Multi-Select)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none pr-10"
                    placeholder="Search communications"
                    value={communicationSearch}
                    onChange={(e) => setCommunicationSearch(e.target.value)}
                    // onFocus={() => setIsCommunicationDropdownOpen(true)}
                    autoComplete="off"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setIsCommunicationDropdownOpen(prev => !prev);
                    }}
                  />
                </div>
                {selectedCommunications.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedCommunications.map((commId) => {
                      const selectedComm = communicationTypes?.find(comm => comm.id === commId);
                      return selectedComm ? (
                        <div key={commId} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs flex items-center">
                          {selectedComm.medium}
                          <button
                            type="button"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              handleCommunicationSelect(commId);
                            }}
                            className="ml-2 text-blue-600 hover:text-blue-800 font-bold text-sm -mr-1"
                          >
                            ×
                          </button>
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
                {isCommunicationDropdownOpen && filteredCommunications.length > 0 && (
                  <ul
                    onMouseDown={(e) => e.stopPropagation()}
                    className="absolute z-50 w-full mt-1 max-h-48 overflow-auto border border-gray-300 rounded-md bg-white shadow-lg">
                    {filteredCommunications.map((comm) => (
                      <li
                        key={comm.id}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          handleCommunicationSelect(comm.id);
                        }}
                        className={`cursor-pointer px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-blue-50 transition-colors ${selectedCommunications.includes(comm.id)
                            ? 'bg-blue-100 border-r-4 border-blue-500'
                            : ''
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm">{comm.medium}</div>
                            <div className="text-xs text-gray-500 mt-1">{comm.medium_details}</div>
                          </div>
                          {selectedCommunications.includes(comm.id) && (
                            <span className="text-green-600 font-bold text-sm">✓</span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* ✅ ASSIGN PROJECT SECTION */}
              <div ref={assigneeRef}>
                <label className="block font-medium text-gray-700 text-sm mb-2">Assign Project * (Multi-Select)</label>

                {/* Project Managers */}
                <div className="mb-3">
                  <label className="block font-medium text-blue-700 text-sm mb-1">Project Managers</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900"
                    onChange={handleManagerSelect}
                  >
                    <option value="">Select Project Manager</option>
                    {projectManagers.map((manager) => (
                      <option key={manager.id} value={manager.id}>{manager.name}</option>
                    ))}
                  </select>
                </div>
                {selectedManagers.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 mb-3">
                    {selectedManagers.map((manager) => (
                      <div key={manager.id} className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-sm">
                        {manager.name}
                        <button type="button" onClick={() => removeManager(manager.id)}>
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Team Leaders */}
                <div className="mb-3">
                  <label className="block font-medium text-green-700 text-sm mb-1">Team Leaders</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 text-gray-900"
                    onChange={handleTeamLeaderSelect}
                  >
                    <option value="">Select Team Leader</option>
                    {teamleaders.map((tl) => (
                      <option key={tl.id} value={tl.id}>{tl.name}</option>
                    ))}
                  </select>
                </div>
                {selectedTeamLeaders.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 mb-3">
                    {selectedTeamLeaders.map((tl) => (
                      <div key={tl.id} className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-md text-sm">
                        {tl.name}
                        <button type="button" onClick={() => removeTeamLeader(tl.id)}>
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}


                {/* Employees */}
                <div className="mb-3">
                  <label className="block font-medium text-yellow-700 text-sm mb-1">Employees</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 text-gray-900"
                    onChange={handleEmployeeSelect}
                  >
                    <option value="">Select Employee</option>
                    {employees.map((em) => (
                      <option key={em.id} value={em.id}>{em.name}</option>
                    ))}
                  </select>
                </div>

                {/* Selected Managers */}

                {/* Selected Team Leaders */}

                {/* Selected Employees */}
                {selectedEmployees.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedEmployees.map((em) => (
                      <div key={em.id} className="flex items-center gap-2 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-md text-sm">
                        {em.name}
                        <button type="button" onClick={() => removeEmployee(em.id)}>
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Activity Tags */}
              <div>
                <label className="block font-medium text-gray-700 text-sm mb-1">Activity Tag *</label>
                <div className="grid grid-cols-3 gap-3 p-2 border border-gray-300 rounded-md">
                  <label className="flex items-center p-2 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="project_tag_activity" value="1" checked={formData.project_tag_activity == "1"}
                      onChange={handleInputChange} className="mr-2" />
                    <span className="text-sm">No Work</span>
                  </label>
                  <label className="flex items-center p-2 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="project_tag_activity" value="2" checked={formData.project_tag_activity == "2"}
                      onChange={handleInputChange} className="mr-2" />
                    <span className="text-sm">In House</span>
                  </label>
                  <label className="flex items-center p-2 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="project_tag_activity" value="3" checked={formData.project_tag_activity == "3"}
                      onChange={handleInputChange} className="mr-2" />
                    <span className="text-sm">Billable</span>
                  </label>
                </div>
              </div>

              {/* TRACKING TOGGLE */}
              <div>
                <label className="block font-medium text-gray-700 text-sm mb-3">Tracking? *</label>
                <div className="flex items-center space-x-4 p-3 border border-gray-300 rounded-lg bg-gray-50">
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={formData.is_tracking_enabled}
                      readOnly
                    />
                    <div
                      className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 peer-checked:ring-2 peer-checked:ring-green-200"
                      onClick={toggleTracking}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 ml-2">
                    {formData.is_tracking_enabled ? "YES" : "NO"}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    ({formData.is_tracking_enabled ? "Tracking Enabled" : "Fixed Project"})
                  </span>
                </div>
              </div>

              {/* TRACKING FIELDS */}
              {formData.is_tracking_enabled && (
                <>
                  <div>
                    <div className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg bg-gray-100 mt-4">
                      <div className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={formData.offline_hours === "1"}
                          readOnly
                        />
                        <div
                          className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600 peer-checked:ring-2 peer-checked:ring-purple-200"
                          onClick={toggleOfflineHours}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        Offline Hours? {formData.offline_hours === "1" ? "YES" : "NO"}
                      </span>
                    </div>

                    <label className="block font-medium text-gray-700 text-sm mb-3">Same Source ID?</label>
                    <div className="flex items-center space-x-4 p-3 border border-gray-300 rounded-lg bg-gray-50">
                      <div className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={formData.use_same_source} readOnly />
                        <div
                          className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 peer-checked:ring-2 peer-checked:ring-green-200"
                          onClick={toggleSameSource}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 ml-2">{formData.use_same_source ? "YES" : "NO"}</span>
                      <span className="text-xs text-gray-500 ml-2">({formData.use_same_source ? "Use Above Source" : "Select New Source"})</span>
                    </div>
                  </div>

                  {!formData.use_same_source && (
                    <div className="relative" ref={trackingSourceRef}>
                      <label htmlFor="trackingSourceSearch" className="block font-medium text-gray-700 text-sm">
                        Tracking Source *
                      </label>
                      <input
                        id="trackingSourceSearch"
                        type="text"
                        className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Search tracking source by name"
                        value={trackingSourceSearch}
                        onChange={(e) => setTrackingSourceSearch(e.target.value)}
                        autoComplete="off"
                        // onFocus={() => setIsTrackingSourceDropdownOpen(true)}
                        onMouseDown={(e) => {  // ✅ onMouseDown + stopPropagation
                          e.stopPropagation();
                          setIsTrackingSourceDropdownOpen(prev => !prev);
                        }}
                      />
                      {isTrackingSourceDropdownOpen && filteredTrackingSources.length > 0 && (
                        <ul 
                        onMouseDown={(e) => e.stopPropagation()}
                        className="absolute z-50 w-full mt-1 max-h-40 overflow-auto border border-gray-300 rounded-md bg-white shadow-lg">
                          {filteredTrackingSources.map((source) => {
                            const sourceAccountCount = accounts.filter(acc => String(acc.source.id) === String(source.id)).length;
                            return (
                              <li
                                key={source.id}
                                // onClick={() => handleTrackingSourceSelect(source.id)}
                                onMouseDown={(e) => {  // ✅ onMouseDown
                                  e.stopPropagation();
                                  handleTrackingSourceSelect(source.id);
                                }}
                                className="cursor-pointer px-3 py-2 hover:bg-blue-100 border-b border-gray-100 last:border-b-0"
                              >
                                <div className="font-medium">{source.source_name}</div>
                                <div className="text-xs text-gray-500">{sourceAccountCount} accounts</div>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  )}

                  {/* ✅ UPDATED TRACKING ACCOUNT ID */}
                  {formData.tracking_source_id && trackingSourceAccounts.length > 0 && (
                    <div className="relative" ref={trackingSourceSubRef}>
                      <label className="block font-medium text-gray-700 text-sm">Tracking Account ID *</label>
                      <div
                        className="w-full p-2 mt-1 border border-gray-300 rounded-md bg-gray-50 cursor-pointer hover:bg-gray-100 flex justify-between items-center"
                       onMouseDown={(e) => {  // ✅ onMouseDown + stopPropagation
                          e.stopPropagation();
                          setIsTrackingSourceSubDropdownOpen(!isTrackingSourceSubDropdownOpen);
                        }}
                        // onClick={() => setIsTrackingSourceSubDropdownOpen(!isTrackingSourceSubDropdownOpen)}
                      >
                        <span className="font-normal text-sm">
                          {formData.tracking_account_id
                            ? ` ${getAccountDisplayNumber(trackingSourceAccounts.find(acc => acc.id == formData.tracking_account_id))}`
                            : `${trackingSourceAccounts.length} accounts available`}
                        </span>
                        <span>▼</span>
                      </div>
                      {isTrackingSourceSubDropdownOpen && (
                        <ul
                         onMouseDown={(e) => e.stopPropagation()} 
                        className="absolute z-50 w-full mt-1 max-h-40 overflow-auto border border-gray-300 rounded-md bg-white shadow-lg">
                          {trackingSourceAccounts.map((account) => (
                            <li
                              key={account.id} 
                              // onClick={() => handleTrackingSourceSubSelect(account)} 
                               onMouseDown={(e) => {  // ✅ onMouseDown
                                e.stopPropagation();
                                handleTrackingSourceSubSelect(account);
                              }}
                              className="cursor-pointer px-3 py-2 hover:bg-blue-100 border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-normal text-sm text-gray-900 break-all">
                                {getAccountDisplayNumber(account)}
                              </div>
                              {/* <div className="text-xs text-gray-500 mt-1">ID: {account.id}</div>  ✅ ID show */}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Hours & Budget Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="projectHours" className="block font-medium text-gray-700 text-sm">Total Hours</label>
                  <input id="projectHours" type="number" name="project_hours" className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" value={formData.project_hours} onChange={handleInputChange} placeholder="0" />
                </div>
                <div>
                  <label htmlFor="projectUsedHours" className="block font-medium text-gray-700 text-sm">Used Hours</label>
                  <input id="projectUsedHours" type="number" name="project_used_hours" className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" value={formData.project_used_hours} onChange={handleInputChange} placeholder="0" />
                </div>
                <div>
                  <label htmlFor="projectBudget" className="block font-medium text-gray-700 text-sm">Total Budget</label>
                  <input id="projectBudget" type="number" name="project_budget" className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" value={formData.project_budget} onChange={handleInputChange} placeholder="0" />
                </div>
                <div>
                  <label htmlFor="projectUsedBudget" className="block font-medium text-gray-700 text-sm">Used Budget</label>
                  <input id="projectUsedBudget" type="number" name="project_used_budget" className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" value={formData.project_used_budget} onChange={handleInputChange} placeholder="0" />
                </div>
              </div>

              <SubmitButton
                type="submit"
                disabled={isLoading}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700"


              >
                {isLoading ? "Creating..." : "Create Project Master"}
              </SubmitButton>
            </form>
          </div>
        </div>
      )}

      {isEditMode && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto" ref={addModalRef}>
            <div className="flex justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Edit Project Master Details</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Update existing project details
                  <span className="ml-2 font-mono bg-blue-100 px-2 py-1 rounded text-xs">
                    ID: {editProject?.project?.id || editProject?.id || 'N/A'}
                  </span>
                </p>
              </div>
              <button className="font-bold text-xl" onClick={onCancel}>×</button>
            </div>

            {showMessage && message && (
              <div className={`mt-4 p-3 rounded-md text-sm font-medium text-center ${message.includes("updated") || message.includes("success")
                  ? "bg-green-50 text-green-800 border border-green-300"
                  : "bg-red-50 text-red-800 border border-red-300"
                }`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {/* CLIENT SEARCH */}
              <div className="relative" ref={clientRef}>
                <label htmlFor="clientSearch" className="block font-medium text-gray-700 text-sm">
                  Client Name *
                </label>
                <input
                  id="clientSearch"
                  type="text"
                  className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Search client by name"
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  autoComplete="off"
                  // onFocus={() => setIsClientDropdownOpen(true)}
                  onMouseDown={(e) => {  // ✅ FIXED
                    e.stopPropagation();
                    setIsClientDropdownOpen(prev => !prev);
                  }}
                />
                {isClientDropdownOpen && filteredClients.length > 0 && (
                  <ul 
                  onMouseDown={(e) => e.stopPropagation()}

                  className="absolute z-50 w-full mt-1 max-h-40 overflow-auto border border-gray-300 rounded-md bg-white shadow-lg">
                    {filteredClients.map((client) => (
                      <li
                        key={client.id}
                        // onClick={() => handleClientSelect(client.id)}
                         onMouseDown={(e) => {  // ✅ FIXED
                          e.stopPropagation();
                          handleClientSelect(client.id);
                        }}
                        className="cursor-pointer px-3 py-2 hover:bg-blue-100 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium">{client.client_name}</div>
                        <div className="text-xs text-gray-500">{client.client_email}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* PROJECT NAME */}
              <div>
                <label htmlFor="projectName" className="block font-medium text-gray-700 text-sm">
                  Project Name *
                </label>
                <input
                  id="projectName"
                  name="project_name"
                  value={formData.project_name}
                  onChange={handleInputChange}
                  placeholder="Enter Project Name"
                  className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* PROJECT DESCRIPTION */}
              <div>
                <label htmlFor="projectDescription" className="block font-medium text-gray-700 text-sm">
                  Project Description
                </label>
                <div className="border border-gray-300 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                  <ReactQuill
                    theme="snow"
                    value={formData.project_description}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        project_description: value,
                      }))
                    }
                    placeholder="Enter project description"
                    modules={{
                      toolbar: [
                        [{ header: [1, 2, false] }],
                        ["bold", "italic", "underline"],
                        [{ list: "ordered" }, { list: "bullet" }],
                        ["link"],
                        ["clean"],
                      ],
                      clipboard: {
                        matchVisual: false,
                      },
                    }}
                    formats={[
                      "header",
                      "bold",
                      "italic",
                      "underline",
                      "list",
                      "bullet",
                      "link",
                    ]}
                    className="bg-white"
                    style={{
                      minHeight: "100px",
                      maxHeight: "140px",  // 🎯 4-5 LINES MAX
                      overflowY: "auto"    // 🎯 SCROLLBAR
                    }}
                    bounds={'.ql-editor'}
                  />
                </div>
              </div>


              {/* PROJECT SOURCE */}
              <div className="relative" ref={sourceRef} >
                <label htmlFor="sourceSearch" className="block font-medium text-gray-700 text-sm">
                  Project Source *
                </label>
                <input
                  id="sourceSearch"
                  type="text"
                  className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Search source by name"
                  value={sourceSearch}
                  onChange={(e) => setSourceSearch(e.target.value)}
                  autoComplete="off"
                  // onFocus={() => setIsSourceDropdownOpen(true)}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setIsSourceDropdownOpen(prev => !prev);
                  }}
                />
                {isSourceDropdownOpen && filteredSources.length > 0 && (
                  <ul 
                  onMouseDown={(e) => e.stopPropagation()}
                  className="absolute z-50 w-full mt-1 max-h-40 overflow-auto border border-gray-300 rounded-md bg-white shadow-lg">
                    {filteredSources
                      .filter(source => {
                        // 🎯 SHOW ONLY SOURCES WITH ≥1 ACCOUNT
                        const sourceAccountCount = accounts.filter(acc => String(acc.source.id) === String(source.id)).length;
                        return sourceAccountCount > 0;
                      })
                      .map((source) => {
                        const sourceAccountCount = accounts.filter(acc => String(acc.source.id) === String(source.id)).length;
                        return (
                          <li
                            key={source.id}
                            // onClick={() => handleSourceSelect(source.id)}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              handleSourceSelect(source.id);
                            }}
                            className="cursor-pointer px-3 py-2 hover:bg-blue-100 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium">{source.source_name}</div>
                            <div className="text-xs text-gray-500">{sourceAccountCount} accounts</div>
                          </li>
                        );
                      })}
                  </ul>
                )}
              </div>

              {/* SALES PERSON - ADD THIS AFTER PROJECT SOURCE SECTION */}


              <div className="relative">
          <label htmlFor="salesPersonSearch" className="block font-medium text-gray-700 text-sm mb-2">
            Sales Person *
          </label>
          <input
            id="salesPersonSearch"
            type="text"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none"
            placeholder="Search sales person by name or ID..."
            value={salesPersonSearch}
            onChange={(e) => setSalesPersonSearch(e.target.value)}
            autoComplete="off"
            onMouseDown={(e) => {
              e.stopPropagation();
              setIsSalesPersonDropdownOpen(prev => !prev);
            }}
          />
          {isSalesPersonDropdownOpen && filteredSalesPerson.length > 0 && (
            <ul
              onMouseDown={(e) => e.stopPropagation()}
              className="absolute z-50 w-full mt-1 max-h-40 overflow-auto border border-gray-300 rounded-md bg-white shadow-lg"
            >
              {filteredSalesPerson.map((employee) => (
                <li
                  key={employee.id}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handleSalesPersonSelect(employee.id);
                  }}
                  className="cursor-pointer px-3 py-2 hover:bg-purple-100 border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium">{employee.employee_name || employee.name}</div>
                  <div className="text-xs text-gray-500">ID: {employee.id}</div>
                </li>
              ))}
            </ul>
          )}
          {isSalesPersonDropdownOpen && filteredSalesPerson.length === 0 && (
            <div className="absolute z-50 w-full mt-1 p-2 border border-gray-300 rounded-md bg-white shadow-lg">
              <div className="text-xs text-gray-500">No sales persons found</div>
            </div>
          )}
          {/* ✅ SELECTED SALES PERSON DISPLAY */}
          {formData.sales_person_id && salesPersonSearch && (
            <div className="mt-2 flex items-center gap-2 bg-purple-100 text-purple-800 px-3 py-2 rounded-md text-sm border">
              <span className="font-medium">{salesPersonSearch}</span>
              <span className="text-xs bg-purple-200 px-2 py-1 rounded-full">
                ID: {formData.sales_person_id}
              </span>
            </div>
          )}
        </div>









              {/* <div className="relative">
                <label className="block font-medium text-gray-700 text-sm mb-2">
                  Sales Person *
                </label>
                <div className="relative">
                  <select
                    value={selectedEmployeeId || formData.sales_person_id || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSelectedEmployeeId(value);
                      setFormData(prev => ({ ...prev, sales_person_id: value }));
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none bg-gray-50 cursor-pointer hover:bg-gray-100 flex justify-between items-center"
                  >
                    <option value="">Select Sales Person</option>
                    {employees1.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.employee_id})
                      </option>
                    ))}
                  </select> */}

                  {/* ✅ SHOW SELECTED PERSON NAME (like assignees chips) */}
                  {/* {formData.sales_person_id && !selectedEmployeeId && (
                    <div className="mt-2 flex items-center gap-2 bg-purple-100 text-purple-800 px-3 py-2 rounded-md text-sm border">
                      <span className="font-medium">
                        {editProject?.relation?.sales_person_data?.[0]?.name ||
                          employees1.find(emp => emp.id == formData.sales_person_id)?.name ||
                          "Loading..."}
                      </span>
                      <span className="text-xs bg-purple-200 px-2 py-1 rounded-full">
                        ID: {formData.sales_person_id}
                      </span>
                    </div>
                  )}
                </div>
              </div> */}


              {/* SOURCE ACCOUNT ID */}
              {formData.source_id && sourceAccounts.length > 0 && (
                <div className="relative" ref={sourceSubRef}>
                  <label className="block font-medium text-gray-700 text-sm">Source Account ID *</label>
                  <div
                    className="w-full p-2 mt-1 border border-gray-300 rounded-md bg-gray-50 cursor-pointer hover:bg-gray-100 flex justify-between items-center"
                    // onClick={() => setIsSourceSubDropdownOpen(!isSourceSubDropdownOpen)}
                    onMouseDown={(e) => {
                    e.stopPropagation();
                    setIsSourceSubDropdownOpen(!isSourceSubDropdownOpen);
                  }}
                  >
                    <span className="font-normal text-sm">
                      {formData.account_id
                        ? `ID: ${formData.account_id} (${getAccountDisplayNumber(sourceAccounts.find(acc => acc.id == formData.account_id))})`
                        : `${sourceAccounts.length} accounts available`}
                    </span>
                    <span>▼</span>
                  </div>
                  {isSourceSubDropdownOpen && (
                    <ul 
                     onMouseDown={(e) => e.stopPropagation()}
                    className="absolute z-50 w-full mt-1 max-h-40 overflow-auto border border-gray-300 rounded-md bg-white shadow-lg">
                      {sourceAccounts.map((account) => (
                        <li
                          key={account.id}
                          // onClick={() => handleSourceSubSelect(account)}
                           onMouseDown={(e) => {
                            e.stopPropagation();
                            handleSourceSubSelect(account);
                          }}
                          className="cursor-pointer px-3 py-2 hover:bg-blue-100 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-normal text-sm text-gray-900 break-all">
                            {getAccountDisplayNumber(account)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">ID: {account.id}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* COMMUNICATION MULTI-SELECT */}
              <div className="relative" ref={communicationRef}>
                <label className="block font-medium text-gray-700 text-sm mb-2">
                  Communication Types (Multi-Select)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none pr-10"
                    placeholder="Search communications"
                    value={communicationSearch}
                    onChange={(e) => setCommunicationSearch(e.target.value)}
                    // onFocus={() => setIsCommunicationDropdownOpen(true)}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setIsCommunicationDropdownOpen(prev => !prev);
                    }}
                    autoComplete="off"
                  />
                </div>
                {selectedCommunications.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedCommunications.map((commId) => {
                      const selectedComm = communicationTypes?.find(comm => comm.id === commId);
                      return selectedComm ? (
                        <div key={commId} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs flex items-center">
                          {selectedComm.medium}
                          <button
                            type="button"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              handleCommunicationSelect(commId);
                            }}
                            className="ml-2 text-blue-600 hover:text-blue-800 font-bold text-sm -mr-1"
                          >
                            ×
                          </button>
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
                {isCommunicationDropdownOpen && filteredCommunications.length > 0 && (
                  <ul
                  onMouseDown={(e) => e.stopPropagation()}

                  className="absolute z-50 w-full mt-1 max-h-48 overflow-auto border border-gray-300 rounded-md bg-white shadow-lg">
                    {filteredCommunications.map((comm) => (
                      <li
                        key={comm.id}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          handleCommunicationSelect(comm.id);
                        }}
                        className={`cursor-pointer px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-blue-50 transition-colors ${selectedCommunications.includes(comm.id)
                            ? 'bg-blue-100 border-r-4 border-blue-500'
                            : ''
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm">{comm.medium}</div>
                            <div className="text-xs text-gray-500 mt-1">{comm.medium_details}</div>
                          </div>
                          {selectedCommunications.includes(comm.id) && (
                            <span className="text-green-600 font-bold text-sm">✓</span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* ASSIGN PROJECT SECTION */}
              <div ref={assigneeRef}>
                <label className="block font-medium text-gray-700 text-sm mb-2">Assign Project * (Multi-Select)</label>

                {/* Project Managers */}
                <div className="mb-3">
                  <label className="block font-medium text-blue-700 text-sm mb-1">Project Managers</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900"
                    onChange={handleManagerSelect}
                  >
                    <option value="">Select Project Manager</option>
                    {projectManagers.map((manager) => (
                      <option key={manager.id} value={manager.id}>{manager.name}</option>
                    ))}
                  </select>
                </div>
                {selectedManagers.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 mb-3">
                    {selectedManagers.map((manager) => (
                      <div key={manager.id} className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-sm">
                        {manager.name}
                        <button type="button" onClick={() => removeManager(manager.id)}>
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {/* Team Leaders */}
                <div className="mb-3">
                  <label className="block font-medium text-green-700 text-sm mb-1">Team Leaders</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 text-gray-900"
                    onChange={handleTeamLeaderSelect}
                  >
                    <option value="">Select Team Leader</option>
                    {teamleaders.map((tl) => (
                      <option key={tl.id} value={tl.id}>{tl.name}</option>
                    ))}
                  </select>
                </div>
                {selectedTeamLeaders.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 mb-3">
                    {selectedTeamLeaders.map((tl) => (
                      <div key={tl.id} className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-md text-sm">
                        {tl.name}
                        <button type="button" onClick={() => removeTeamLeader(tl.id)}>
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Employees */}
                <div className="mb-3">
                  <label className="block font-medium text-yellow-700 text-sm mb-1">Employees</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 text-gray-900"
                    onChange={handleEmployeeSelect}
                  >
                    <option value="">Select Employee</option>
                    {employees.map((em) => (
                      <option key={em.id} value={em.id}>{em.name}</option>
                    ))}
                  </select>
                </div>

                {/* Selected Managers */}


                {/* Selected Team Leaders */}


                {/* Selected Employees */}
                {selectedEmployees.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedEmployees.map((em) => (
                      <div key={em.id} className="flex items-center gap-2 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-md text-sm">
                        {em.name}
                        <button type="button" onClick={() => removeEmployee(em.id)}>
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Activity Tags */}
              <div>
                <label className="block font-medium text-gray-700 text-sm mb-1">Activity Tag *</label>
                <div className="grid grid-cols-3 gap-3 p-2 border border-gray-300 rounded-md">
                  <label className="flex items-center p-2 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="project_tag_activity" value="1" checked={formData.project_tag_activity == "1"}
                      onChange={handleInputChange} className="mr-2" />
                    <span className="text-sm">No Work</span>
                  </label>
                  <label className="flex items-center p-2 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="project_tag_activity" value="2" checked={formData.project_tag_activity == "2"}
                      onChange={handleInputChange} className="mr-2" />
                    <span className="text-sm">In House</span>
                  </label>
                  <label className="flex items-center p-2 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="project_tag_activity" value="3" checked={formData.project_tag_activity == "3"}
                      onChange={handleInputChange} className="mr-2" />
                    <span className="text-sm">Billable</span>
                  </label>
                </div>
              </div>

              {/* TRACKING TOGGLE */}
              <div>
                <label className="block font-medium text-gray-700 text-sm mb-3">Tracking? *</label>
                <div className="flex items-center space-x-4 p-3 border border-gray-300 rounded-lg bg-gray-50">
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={formData.is_tracking_enabled}
                      readOnly
                    />
                    <div
                      className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 peer-checked:ring-2 peer-checked:ring-green-200"
                      onClick={toggleTracking}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 ml-2">
                    {formData.is_tracking_enabled ? "YES" : "NO"}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    ({formData.is_tracking_enabled ? "Tracking Enabled" : "Fixed Project"})
                  </span>
                </div>
              </div>

              {/* TRACKING FIELDS */}
              {formData.is_tracking_enabled && (
                <>
                  <div>
                    <label className="block font-medium text-gray-700 text-sm mb-3">Same Source ID?</label>
                    <div className="flex items-center space-x-4 p-3 border border-gray-300 rounded-lg bg-gray-50">
                      <div className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={formData.use_same_source} readOnly />
                        <div
                          className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 peer-checked:ring-2 peer-checked:ring-green-200"
                          onClick={toggleSameSource}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 ml-2">{formData.use_same_source ? "YES" : "NO"}</span>
                      <span className="text-xs text-gray-500 ml-2">({formData.use_same_source ? "Use Above Source" : "Select New Source"})</span>
                    </div>
                  </div>

                  {!formData.use_same_source && (
                    <div className="relative" ref={trackingSourceRef}>
                      <label htmlFor="trackingSourceSearch" className="block font-medium text-gray-700 text-sm">
                        Tracking Source *
                      </label>
                      <input
                        id="trackingSourceSearch"
                        type="text"
                        className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Search tracking source by name"
                        value={trackingSourceSearch}
                        onChange={(e) => setTrackingSourceSearch(e.target.value)}
                        autoComplete="off"
                        // onFocus={() => setIsTrackingSourceDropdownOpen(true)}
                        onMouseDown={(e) => {  // ✅ onMouseDown + stopPropagation
                          e.stopPropagation();
                          setIsTrackingSourceDropdownOpen(prev => !prev);
                        }}
                      />
                      {isTrackingSourceDropdownOpen && filteredTrackingSources.length > 0 && (
                        <ul 
                         onMouseDown={(e) => e.stopPropagation()}
                        className="absolute z-50 w-full mt-1 max-h-40 overflow-auto border border-gray-300 rounded-md bg-white shadow-lg">
                          {filteredTrackingSources.map((source) => {
                            const sourceAccountCount = accounts.filter(acc => String(acc.source.id) === String(source.id)).length;
                            return (
                              <li
                                key={source.id}
                                // onClick={() => handleTrackingSourceSelect(source.id)}
                                onMouseDown={(e) => {  // ✅ onMouseDown
                                  e.stopPropagation();
                                  handleTrackingSourceSelect(source.id);
                                }}
                                className="cursor-pointer px-3 py-2 hover:bg-blue-100 border-b border-gray-100 last:border-b-0"
                              >
                                <div className="font-medium">{source.source_name}</div>
                                <div className="text-xs text-gray-500">{sourceAccountCount} accounts</div>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  )}

                  {/* TRACKING ACCOUNT ID */}
                  {formData.tracking_source_id && trackingSourceAccounts.length > 0 && (
                    <div className="relative" ref={trackingSourceSubRef}>
                      <label className="block font-medium text-gray-700 text-sm">Tracking Account ID *</label>
                      <div
                        className="w-full p-2 mt-1 border border-gray-300 rounded-md bg-gray-50 cursor-pointer hover:bg-gray-100 flex justify-between items-center"
                        // onClick={() => setIsTrackingSourceSubDropdownOpen(!isTrackingSourceSubDropdownOpen)}
                        onMouseDown={(e) => {  
                          e.stopPropagation();
                          setIsTrackingSourceSubDropdownOpen(!isTrackingSourceSubDropdownOpen);
                        }}
                      >
                        <span className="font-normal text-sm">
                          {formData.tracking_account_id
                            ? `ID: ${formData.tracking_account_id} (${getAccountDisplayNumber(trackingSourceAccounts.find(acc => acc.id == formData.tracking_account_id))})`
                            : `${trackingSourceAccounts.length} accounts available`}
                        </span>
                        <span>▼</span>
                      </div>
                      {isTrackingSourceSubDropdownOpen && (
                        <ul
                        onMouseDown={(e) => e.stopPropagation()} 
                        className="absolute z-50 w-full mt-1 max-h-40 overflow-auto border border-gray-300 rounded-md bg-white shadow-lg">
                          {trackingSourceAccounts.map((account) => (
                            <li
                              key={account.id}
                              // onClick={() => handleTrackingSourceSubSelect(account)}
                              onMouseDown={(e) => {  
                                e.stopPropagation();
                                handleTrackingSourceSubSelect(account);
                              }}
                              className="cursor-pointer px-3 py-2 hover:bg-blue-100 border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-normal text-sm text-gray-900 break-all">
                                {getAccountDisplayNumber(account)}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">ID: {account.id}</div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                  <div className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg bg-gray-100 mt-4">
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={formData.offline_hours === "1"}
                        readOnly
                      />
                      <div
                        className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600 peer-checked:ring-2 peer-checked:ring-purple-200"
                        onClick={toggleOfflineHours}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      Offline Hours? {formData.offline_hours === "1" ? "YES" : "NO"}
                    </span>
                  </div>



                </>
              )}

              {/* Hours & Budget Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="projectHours" className="block font-medium text-gray-700 text-sm">Total Hours</label>
                  <input
                    id="projectHours"
                    type="number"
                    name="project_hours"
                    className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={formData.project_hours}
                    onChange={handleInputChange}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label htmlFor="projectUsedHours" className="block font-medium text-gray-700 text-sm">Used Hours</label>
                  <input
                    id="projectUsedHours"
                    type="number"
                    name="project_used_hours"
                    className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={formData.project_used_hours}
                    onChange={handleInputChange}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label htmlFor="projectBudget" className="block font-medium text-gray-700 text-sm">Total Budget</label>
                  <input
                    id="projectBudget"
                    type="number"
                    name="project_budget"
                    className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={formData.project_budget}
                    onChange={handleInputChange}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label htmlFor="projectUsedBudget" className="block font-medium text-gray-700 text-sm">Used Budget</label>
                  <input
                    id="projectUsedBudget"
                    type="number"
                    name="project_used_budget"
                    className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={formData.project_used_budget}
                    onChange={handleInputChange}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* SUBMIT BUTTONS */}
              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <SubmitButton
                  type="submit"
                  disabled={isLoading}

                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold shadow-md transition-all"
                >
                  {isLoading ? "Updating..." : "Update Project Master"}
                </SubmitButton>
              </div>
            </form>
          </div>
        </div>
      )}



    </div>
  );
};














// import React, { useState, useEffect, useRef } from "react";
// import { useProjectMaster } from '../../../context/ProjectMasterContext';
// import { useMasterClient } from "../../../context/MasterClientContext";
// import { useProjectSource } from "../../../context/ProjectSourceContext";
// import { useCommunicationType } from "../../../context/CommunicationTypeContext";
// import { useAccount } from "../../../context/AccountContext";
// import { useAlert } from "../../../context/AlertContext";
// import { SubmitButton } from "../../../AllButtons/AllButtons";
// import { useBDProjectsAssigned } from "../../../context/BDProjectsassigned";
// import { usePMContext } from "../../../context/PMContext";
// import { useTLContext } from "../../../context/TLContext";
// import ReactQuill from 'react-quill'; 
// import { usePermissions } from "../../../context/PermissionContext";
// import 'react-quill/dist/quill.snow.css';
// import { useOutsideClick } from "../../../components/useOutsideClick";
// import { useEmployees } from "../../../context/EmployeeContext";

// export const ProjectsMaster = ({
  
//   isEditMode = false, 
//   editProject = null,
//   onSaveSuccess,
//   onCancel 
// }) => {
//   const { addProjectMaster, editProjectMaster, isLoading, message } = useProjectMaster();
//   const { masterClients, fetchMasterClients } = useMasterClient();
//   const { projectSources, fetchProjectSources } = useProjectSource();
//   const { communicationTypes, fetchCommunicationTypes } = useCommunicationType();
//   const { accounts, fetchAccounts } = useAccount();
//   const { showAlert } = useAlert();
//   const { projectManagers } = useBDProjectsAssigned(); 
//   const { teamleaders } = usePMContext(); 
//   const { employees, fetchEmployees } = useTLContext(); 
// const {permissions}=usePermissions()
//   const { employees1,fetchTl,fetchEmployees1 ,tl, addEmployee, deleteEmployee, updateEmployee, error: contextError ,setTl} = useEmployees(); 
 
//   const [showModal, setShowModal] = useState(false);
//   const [showMessage, setShowMessage] = useState(false);

//       const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  
//   const [formData, setFormData] = useState({
//     project_name: "",
//     client_id: "",
//     source_id: "",
//     account_id: "", 
//     communication_id: [],
//     assignees: [], 
//     sales_person_id: "",
//     project_tracking: "1",
//     project_status: "In Progress",
//     project_description: "",
//     project_budget: "",
//     project_hours: "",
//     project_used_hours: "",
//      offline_hours: "1",
//     project_used_budget: "",
//     project_tag_activity: 1,
//     is_tracking_enabled: true,
//     use_same_source: true,
//     tracking_source_id: "",
//     tracking_account_id: "", 
//   });

//   // Client search states
//   const [clientSearch, setClientSearch] = useState("");
//   const [filteredClients, setFilteredClients] = useState([]);
//   const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);

//   // Project Source states
//   const [sourceSearch, setSourceSearch] = useState("");
//   const [filteredSources, setFilteredSources] = useState([]);
//   const [isSourceDropdownOpen, setIsSourceDropdownOpen] = useState(false);
  
//   // Source accounts
//   const [sourceAccounts, setSourceAccounts] = useState([]);
//   const [isSourceSubDropdownOpen, setIsSourceSubDropdownOpen] = useState(false);

//   //  TRACKING SOURCE states
//   const [trackingSourceSearch, setTrackingSourceSearch] = useState("");
//   const [filteredTrackingSources, setFilteredTrackingSources] = useState([]);
//   const [isTrackingSourceDropdownOpen, setIsTrackingSourceDropdownOpen] = useState(false);
//   const [trackingSourceAccounts, setTrackingSourceAccounts] = useState([]);
//   const [isTrackingSourceSubDropdownOpen, setIsTrackingSourceSubDropdownOpen] = useState(false);

//   // Communication MULTI-SELECT states
//   const [selectedCommunications, setSelectedCommunications] = useState([]);
//   const [communicationSearch, setCommunicationSearch] = useState("");
//   const [filteredCommunications, setFilteredCommunications] = useState([]);
//   const [isCommunicationDropdownOpen, setIsCommunicationDropdownOpen] = useState(false);

//   //  ASSIGNEE MULTI-SELECT states (Real data from contexts)
//   const [selectedManagers, setSelectedManagers] = useState([]);
//   const [selectedTeamLeaders, setSelectedTeamLeaders] = useState([]);
//   const [selectedEmployees, setSelectedEmployees] = useState([]);
//   const [assigneeSearch, setAssigneeSearch] = useState("");
//   const [isAssigneeDropdownOpen, setIsAssigneeDropdownOpen] = useState(false);

//   // Dropdown refs
//  // ✅ ALL DROPDOWN REFS
// const clientRef = useRef(null);
// const sourceRef = useRef(null);
// const sourceSubRef = useRef(null);
// const communicationRef = useRef(null); 
// const trackingSourceRef = useRef(null);
// const trackingSourceSubRef = useRef(null);
// const assigneeRef = useRef(null); 



// //  NEW: EDIT MODE - Prefill form data
// useEffect(() => {
//   if (isEditMode && editProject) {
//     console.log("🔧 Prefilling EDIT form:", editProject);
//     populateEditData(editProject);
//   }
// }, [isEditMode, editProject]);


// //  NEW: Populate form with existing project data
// const populateEditData = (projectData) => {
//   const project = projectData.project || projectData;
//   const relation = projectData.relation || projectData;
//   /* ---------------- BASIC FORM ---------------- */
//   setFormData({
//     project_name: project.project_name || "",
//     client_id: relation.client_id || "",
//     source_id: relation.source_id || "",
//     account_id: relation.account_id || "",
//     communication_id: relation.communication_id || [],
//     assignees: relation.assignees_id || [],
//     sales_person_id: relation.sales_person_id || "", 
//      project_tracking: project.project_tracking || "1",
//     project_status: project.project_status || "In Progress",
//     project_description: project.project_description || "",
//     project_budget: project.project_budget || "",
//     project_hours: project.project_hours || "",
//     project_used_hours: project.project_used_hours || "",
//     project_used_budget: project.project_used_budget || "",
//     project_tag_activity: project.project_tag_activity || 1,
// offline_hours: project.offline_hours ? "1" : "0",      is_tracking_enabled: project.is_tracking_enabled !== false,
//     use_same_source: relation.use_same_source !== false,
//     tracking_source_id: relation.tracking_source_id || "",
//     tracking_account_id: relation.tracking_account_id || "",
//   });
//   setSourceSearch(relation.source)
//   setClientSearch(relation.client_name || "");
//   setSelectedCommunications(relation.communication_id || []);
//     setSelectedEmployeeId(relation.sales_person_id?.toString() || "");

//   /* ---------------- ASSIGNEES (ROLE-WISE) ---------------- */
//   const assignees = relation.assignees || [];
//   // :large_blue_square: Project Managers
// const managers = assignees
//   .filter(a => a.role_names?.includes("Project Manager"))
//   .map(a => ({
//     id: a.id,
//     name: a.name,
//   }));
// const teamLeads = assignees
//   .filter(a => a.role_names?.includes("TL"))
//   .map(a => ({
//     id: a.id,
//     name: a.name,
//   }));

// const emps = assignees
//   .filter(a => a.role_names?.includes("Team"))
//   .map(a => ({
//     id: a.id,
//     name: a.name,
//   }));

// setSelectedManagers(managers);
// setSelectedTeamLeaders(teamLeads);
// setSelectedEmployees(emps);
// };




//   // Filter clients
//   useEffect(() => {
//     if (!clientSearch.trim()) {
//       setFilteredClients(masterClients || []);
//       return;
//     }
//     const filtered = masterClients?.filter((client) =>
//       client.client_name?.toLowerCase().includes(clientSearch.toLowerCase().trim()) ||
//       client.client_email?.toLowerCase().includes(clientSearch.toLowerCase().trim())
//     ) || [];
//     setFilteredClients(filtered);
//   }, [clientSearch, masterClients]);

//   // Filter sources
//   useEffect(() => {
//     if (!sourceSearch.trim()) {
//       setFilteredSources(projectSources || []);
//       return;
//     }
//     const filtered = projectSources?.filter((source) =>
//       source.source_name?.toLowerCase().includes(sourceSearch.toLowerCase().trim())
//     ) || [];
//     setFilteredSources(filtered);
//   }, [sourceSearch, projectSources]);

//   // ✅ Filter tracking sources
//   useEffect(() => {
//     if (!trackingSourceSearch.trim()) {
//       setFilteredTrackingSources(projectSources || []);
//       return;
//     }
//     const filtered = projectSources?.filter((source) =>
//       source.source_name?.toLowerCase().includes(trackingSourceSearch.toLowerCase().trim())
//     ) || [];
//     setFilteredTrackingSources(filtered);
//   }, [trackingSourceSearch, projectSources]);

//   // Filter source accounts
//   useEffect(() => {
//     if (formData.source_id && accounts.length > 0) {
//       const filteredAccounts = accounts.filter(account => 
//         String(account.source.id) === String(formData.source_id)
//       );
//       setSourceAccounts(filteredAccounts);
//     } else {
//       setSourceAccounts([]);
//     }
//   }, [formData.source_id, accounts]);

//   // ✅ Filter tracking source accounts
//   useEffect(() => {
//     if (formData.tracking_source_id && accounts.length > 0) {
//       const filteredAccounts = accounts.filter(account => 
//         String(account.source.id) === String(formData.tracking_source_id)
//       );
//       setTrackingSourceAccounts(filteredAccounts);
//     } else {
//       setTrackingSourceAccounts([]);
//     }
//   }, [formData.tracking_source_id, accounts]);

//   // Filter COMMUNICATION
//   useEffect(() => {
//     if (!communicationSearch.trim()) {
//       setFilteredCommunications(communicationTypes || []);
//       return;
//     }
//     const filtered = communicationTypes?.filter((comm) =>
//       comm.medium?.toLowerCase().includes(communicationSearch.toLowerCase().trim()) ||
//       comm.medium_details?.toLowerCase().includes(communicationSearch.toLowerCase().trim())
//     ) || [];
//     setFilteredCommunications(filtered);
//   }, [communicationSearch, communicationTypes]);

//   // Sync formData with selectedCommunications
//   useEffect(() => {
//     setFormData(prev => ({ ...prev, communication_id: selectedCommunications }));
//   }, [selectedCommunications]);

//   // ✅ Sync all assignees to formData
//   useEffect(() => {
//     const allAssigneeIds = [
//       ...selectedManagers.map(m => m.id),
//       ...selectedTeamLeaders.map(tl => tl.id),
//       ...selectedEmployees.map(e => e.id)
//     ];
//     setFormData(prev => ({ ...prev, assignees: allAssigneeIds }));
//   }, [selectedManagers, selectedTeamLeaders, selectedEmployees]);

//   // ✅ Sync tracking source with main source
//   useEffect(() => {
//     if (formData.use_same_source && formData.source_id) {
//       setFormData(prev => ({
//         ...prev,
//         tracking_source_id: formData.source_id,
//         tracking_account_id: formData.account_id
//       }));
//       setTrackingSourceSearch(sourceSearch);
//     }
//   }, [formData.use_same_source, formData.source_id, formData.account_id, sourceSearch]);

//   // OUTSIDE CLICK HANDLER FOR DROPDOWNS
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (communicationRef.current && !communicationRef.current.contains(event.target)) {
//         setIsCommunicationDropdownOpen(false);
//       }
//       if (assigneeRef.current && !assigneeRef.current.contains(event.target)) {
//         setIsAssigneeDropdownOpen(false);
//       }
//       if (clientRef.current && !clientRef.current.contains(event.target)) {
//         setIsClientDropdownOpen(false);
//       }
//       if (sourceRef.current && !sourceRef.current.contains(event.target)) {
//         setIsSourceDropdownOpen(false);
//       }
//       if (sourceSubRef.current && !sourceSubRef.current.contains(event.target)) {
//         setIsSourceSubDropdownOpen(false);
//       }
//       if (trackingSourceRef.current && !trackingSourceRef.current.contains(event.target)) {
//         setIsTrackingSourceDropdownOpen(false);
//       }
//       if (trackingSourceSubRef.current && !trackingSourceSubRef.current.contains(event.target)) {
//         setIsTrackingSourceSubDropdownOpen(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   // Load data on mount
//   useEffect(() => {
//     fetchMasterClients();
//     fetchProjectSources();
//     fetchCommunicationTypes();
//     fetchAccounts();
//     fetchEmployees();
//   }, []);

//   const handleInputChange = (e) => {
//   const { name, value, type, checked } = e.target;
//   setFormData((prev) => ({ 
//     ...prev, 
//     [name]: type === 'checkbox' ? (checked ? 1 : 0) : value 
//   }));
// };
// const toggleOfflineHours = () => {
//   setFormData(prev => ({
//     ...prev,
//     offline_hours: prev.offline_hours === "1" ? "0" : "1"
//   }));
// };


// useEffect(() => {
//   console.log('🔍 TRACKING DEBUG:');
//   console.log('Tracking enabled?', formData.is_tracking_enabled);
//   console.log('Offline hours?', formData.offline_hours);
//   console.log('------------------------');
// }, [formData.is_tracking_enabled, formData.offline_hours]);
//   // Client select
//   const handleClientSelect = (selectedId) => {
//     setFormData((prev) => ({ ...prev, client_id: selectedId }));
//     const selectedClient = masterClients?.find(client => client.id === selectedId);
//     if (selectedClient) {
//       setClientSearch(selectedClient.client_name);
//     }
//     setIsClientDropdownOpen(false);
//   };


//   const handleSourceSelect = (selectedId) => {
//     setFormData((prev) => ({ 
//       ...prev, 
//       source_id: selectedId,
// account_id: prev.account_id 
//     }));
//     const selectedSource = projectSources?.find(source => source.id === selectedId);
//     if (selectedSource) {
//       setSourceSearch(selectedSource.source_name);
//     }
//     setIsSourceDropdownOpen(false);
//     setIsSourceSubDropdownOpen(false);
//     setSourceAccounts([]);
//   };

//   // ✅ Tracking source select
//   const handleTrackingSourceSelect = (selectedId) => {
//     setFormData((prev) => ({ 
//       ...prev, 
//       tracking_source_id: selectedId,
//       tracking_account_id: ""
//     }));
//     const selectedSource = projectSources?.find(source => source.id === selectedId);
//     if (selectedSource) {
//       setTrackingSourceSearch(selectedSource.source_name);
//     }
//     setIsTrackingSourceDropdownOpen(false);
//     setIsTrackingSourceSubDropdownOpen(false);
//     setTrackingSourceAccounts([]);
//   };

//   // Communication MULTI-SELECT handler
//   const handleCommunicationSelect = (selectedId) => {
//     setSelectedCommunications(prev => {
//       if (prev.includes(selectedId)) {
//         return prev.filter(id => id !== selectedId);
//       } else {
//         return [...prev, selectedId];
//       }
//     });
//   };

//   // ✅ MANAGER SELECT
//   const handleManagerSelect = (e) => {
//     const id = Number(e.target.value);
//     if (!id) return;
//     const manager = projectManagers.find(m => m.id === id);
//     if (manager && !selectedManagers.some(m => m.id === id)) {
//       setSelectedManagers(prev => [...prev, manager]);
//     }
//     e.target.value = "";
//   };

//   // ✅ TEAM LEADER SELECT
//   const handleTeamLeaderSelect = (e) => {
//     const id = Number(e.target.value);
//     if (!id) return;
//     const tl = teamleaders.find(t => t.id === id);
//     if (tl && !selectedTeamLeaders.some(t => t.id === id)) {
//       setSelectedTeamLeaders(prev => [...prev, tl]);
//     }
//     e.target.value = "";
//   };

//   // ✅ EMPLOYEE SELECT
//   const handleEmployeeSelect = (e) => {
//     const id = Number(e.target.value);
//     if (!id) return;
//     const emp = employees.find(em => em.id === id);
//     if (emp && !selectedEmployees.some(em => em.id === id)) {
//       setSelectedEmployees(prev => [...prev, emp]);
//     }
//     e.target.value = "";
//   };

//   // Remove functions
//   const removeManager = (id) => {
//     setSelectedManagers((prev) => prev.filter((manager) => manager.id !== id));
//   };

//   const removeTeamLeader = (id) => {
//     setSelectedTeamLeaders((prev) => prev.filter((tl) => tl.id !== id));
//   };

//   const removeEmployee = (id) => {
//     setSelectedEmployees((prev) => prev.filter((emp) => emp.id !== id));
//   };

// const getAccountDisplayNumber = (account) => {
//   if (!account) return "No Account Selected";
  
//   if (account.account_name && account.account_name.length > 0) {
//     return account.account_name;
//   }
  
 
//   return account.account_number || 
//          account.phone_number || 
//          account.reference_id || 
//          account.external_id || 
//          account.id?.toString() || 
//          "Unknown Account";
// };
//   // ✅ UPDATED - Account object pass karo, displayNumber nahi
//   const handleSourceSubSelect = (account) => {
//     setFormData((prev) => ({ 
//       ...prev, 
//       account_id: account.id  // ✅ Actual account ID set hoga
//     }));
//     setIsSourceSubDropdownOpen(false);
//   };

//   // ✅ UPDATED - Account object pass karo
//   const handleTrackingSourceSubSelect = (account) => {
//     setFormData((prev) => ({ 
//       ...prev, 
//       tracking_account_id: account.id  // ✅ Actual account ID set hoga
//     }));
//     setIsTrackingSourceSubDropdownOpen(false);
//   };

//   const toggleTracking = () => {
//     setFormData(prev => ({
//       ...prev,
//       is_tracking_enabled: !prev.is_tracking_enabled,
//       ...(prev.is_tracking_enabled ? { tracking_source_id: "", tracking_account_id: "" } : {})
//     }));
//   };

//   const toggleSameSource = () => {
//     setFormData(prev => ({
//       ...prev,
//       use_same_source: !prev.use_same_source,
//       ...(prev.use_same_source ? { tracking_source_id: "", tracking_account_id: "" } : {})
//     }));
//   };

//   // OLD handleSubmit ko YE se replace karo:
// const handleSubmit = async (e) => {
//   e.preventDefault();

//   if (!formData.client_id || !formData.project_name) {
//     showAlert({ variant: "warning", title: "Warning", message: "Please fill client and project name." });
//     return;
//   }

//   if (!formData.source_id || !formData.account_id) {
//     showAlert({ variant: "warning", title: "Warning", message: "Please select source and account ID." });
//     return;
//   }

//   const totalAssignees = selectedManagers.length + selectedTeamLeaders.length + selectedEmployees.length;
//   if (totalAssignees === 0) {
//     showAlert({ variant: "warning", title: "Warning", message: "Please select at least one assignee (Manager/Team Leader/Employee)." });
//     return;
//   }

//   if (formData.is_tracking_enabled) {
//     if (!formData.tracking_source_id || !formData.tracking_account_id) {
//       showAlert({ variant: "warning", title: "Warning", message: "Please select tracking source and account ID." });
//       return;
//     }
//   }
// const finalAssignees = [
//   ...new Set([
//     ...selectedManagers.map(m => Number(m.id)),
//     ...selectedTeamLeaders.map(tl => Number(tl.id)),
//     ...selectedEmployees.map(e => Number(e.id)),
//   ])
// ];

//   const submitData = {
//     project_name: formData.project_name,
//     client_id: formData.client_id,
//     source_id: formData.source_id,
//     account_id: formData.account_id,
//     communication_id: formData.communication_id.join(','),
//     assignees: formData.assignees.join(','),
// sales_person_id: formData.sales_person_id, 
//     project_tracking: formData.project_tracking,
//     project_status: formData.is_tracking_enabled ? "In Progress" : "Fixed",
//     project_description: formData.project_description,
//     project_budget: formData.project_budget,
//     project_hours: formData.project_hours,
//     project_used_hours: formData.project_used_hours,
//     project_used_budget: formData.project_used_budget,
//     project_tag_activity: formData.project_tag_activity,
//     ...(formData.is_tracking_enabled && {
//       is_tracking_enabled: formData.is_tracking_enabled,
//        offline_hours:formData.offline_hours,
//       tracking_source_id: formData.tracking_source_id,
//       tracking_account_id: formData.tracking_account_id,
//       use_same_source: formData.use_same_source
//     })
//   };

//   try {
//     let result;
//     if (isEditMode && editProject) {
//       // EDIT MODE
//       const projectId = editProject.project?.id || editProject.id;
//       result = await editProjectMaster(projectId, submitData);
//       console.log("✏️ Edit success:", result);
//     } else {
//       // ADD MODE
//       result = await addProjectMaster(submitData);
//     }

//     if (result?.success || message) {
//       if (onSaveSuccess) onSaveSuccess();
//       if (!isEditMode) {
//         setShowModal(false);
//         resetForm();
//         setShowMessage(true);
//         setTimeout(() => setShowMessage(false), 3000);
//       }
//     }
//   } catch (error) {
//     console.error("Submit error:", error);
//     showAlert({ variant: "error", title: "Error", message: "Failed to save project." });
//   }
// };


//   const resetForm = () => {
//     setFormData({
//       project_name: "",
//       client_id: "",
//       source_id: "",
//       account_id: "",
//       communication_id: [],
//       assignees: [],
//       sales_person_id: "",
//       project_tracking: "1",
//       project_status: "In Progress",
//       project_description: "",
//       project_budget: "",
//       project_hours: "",
//       project_used_hours: "",
//       project_used_budget: "",
//       project_tag_activity: 1,
//       offline_hours: "0",
//       is_tracking_enabled: true,
//       use_same_source: true,
//       tracking_source_id: "",
//       tracking_account_id: "",
//     });
//     setSelectedCommunications([]);
//     setSelectedManagers([]);
//     setSelectedTeamLeaders([]);
//     setSelectedEmployees([]);
//     setClientSearch("");
//     setSourceSearch("");
//     setTrackingSourceSearch("");
//     setCommunicationSearch("");
//     setAssigneeSearch("");
//     setSourceAccounts([]);
//     setTrackingSourceAccounts([]);
//   };

//   const employeePermission=permissions?.permissions?.[0]?.projects;
//   const canAddEmployee=employeePermission==="2"
//     const handleCloseAddModal = () => {
//   setShowModal(false);

// };
// const addModalRef = useOutsideClick(showModal, handleCloseAddModal);






//   return (
//     <div className="bg-white">
      
//       {!isEditMode && canAddEmployee &&(
//   <button
//     onClick={() => {
//       setShowModal(true);
//       resetForm();
//     }}
//     className="add-items-btn"
//   >
//     Add Project
//   </button>
// )}

//       {showModal && (
//         <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
//           <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto" ref={addModalRef}>
//             <div className="flex justify-between mb-4">
//               <div >
//                 <h2 className="text-xl font-semibold text-gray-800">Enter Project Master Details</h2>
//                 <p className="text-sm text-gray-500 mt-1">Add a new Project Master to the system</p>
//               </div>
//               <button className="font-bold text-xl" onClick={() => setShowModal(false)}>×</button>
//             </div>

//             {showMessage && message && (
//               <div className={`mt-4 p-3 rounded-md text-sm font-medium text-center ${
//                 message.includes("successfully") || message.includes("created")
//                   ? "bg-green-50 text-green-800 border border-green-300"
//                   : "bg-red-50 text-red-800 border border-red-300"
//               }`}>
//                 {message}
//               </div>
//             )}

//             <form onSubmit={handleSubmit} ref={clientRef} className="mt-6 space-y-4">
//               {/* CLIENT SEARCH */}
//               <div className="relative">
//                 <label htmlFor="clientSearch" className="block font-medium text-gray-700 text-sm">
//                   Client Name *
//                 </label>
//                 <input
//                   id="clientSearch"
//                   type="text"
//                   className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                   placeholder="Search client by name"
//                   value={clientSearch}
//                   onChange={(e) => setClientSearch(e.target.value)}
//                   autoComplete="off"
//                   onFocus={() => setIsClientDropdownOpen(true)}
//                 />
//                 {isClientDropdownOpen && filteredClients.length > 0 && (
//                   <ul className="absolute z-50 w-full mt-1 max-h-40 overflow-auto border border-gray-300 rounded-md bg-white shadow-lg">
//                     {filteredClients.map((client) => (
//                       <li
//                         key={client.id}
//                         onClick={() => handleClientSelect(client.id)}
//                         className="cursor-pointer px-3 py-2 hover:bg-blue-100 border-b border-gray-100 last:border-b-0"
//                       >
//                         <div className="font-medium">{client.client_name}</div>
//                         <div className="text-xs text-gray-500">{client.client_email}</div>
//                       </li>
//                     ))}
//                   </ul>
//                 )}
//               </div>

//               {/* PROJECT NAME */}
//               <div>
//                 <label htmlFor="projectName" className="block font-medium text-gray-700 text-sm">
//                   Project Name *
//                 </label>
//                 <input
//                   id="projectName"
//                   name="project_name"
//                   value={formData.project_name}
//                   onChange={handleInputChange}
//                   placeholder="Enter Project Name"
//                   className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                 />
//               </div>

//               {/* PROJECT DESCRIPTION */}
//               <div>
//                 <label htmlFor="projectDescription" className="block font-medium text-gray-700 text-sm">
//                   Project Description
//                 </label>
//                 <div className="border border-gray-300 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
//     <ReactQuill
//       theme="snow"
//       value={formData.project_description}
//       onChange={(value) =>
//         setFormData((prev) => ({
//           ...prev,
//           project_description: value,
//         }))
//       }
//       placeholder="Enter project description"
//       modules={{
//         toolbar: [
//           [{ header: [1, 2, false] }],
//           ["bold", "italic", "underline"],
//           [{ list: "ordered" }, { list: "bullet" }],
//           ["link"],
//           ["clean"],
//         ],
//       }}
//       formats={[
//         "header",
//         "bold",
//         "italic",
//         "underline",
//         "list",
//         "bullet",
//         "link",
//       ]}
//       className="bg-white"
//       style={{ minHeight: "120px" }}
//     />
//   </div>
//               </div>

//               {/* PROJECT SOURCE */}
//               <div className="relative" ref={sourceRef}>
//                 <label htmlFor="sourceSearch" className="block font-medium text-gray-700 text-sm">
//                   Project Source *
//                 </label>
//                 <input
//                   id="sourceSearch"
//                   type="text"
//                   className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                   placeholder="Search source by name"
//                   value={sourceSearch}
//                   onChange={(e) => setSourceSearch(e.target.value)}
//                   autoComplete="off"
//                   onFocus={() => setIsSourceDropdownOpen(true)}
//                 />
//     {isSourceDropdownOpen && filteredSources.length > 0 && (
//   <ul className="absolute z-50 w-full mt-1 max-h-40 overflow-auto border border-gray-300 rounded-md bg-white shadow-lg">
//     {filteredSources
//       .filter(source => {
//         // 🎯 SHOW ONLY SOURCES WITH ≥1 ACCOUNT
//         const sourceAccountCount = accounts.filter(acc => String(acc.source.id) === String(source.id)).length;
//         return sourceAccountCount > 0;
//       })
//       .map((source) => {
//         const sourceAccountCount = accounts.filter(acc => String(acc.source.id) === String(source.id)).length;
//         return (
//           <li
//             key={source.id}
//             onClick={() => handleSourceSelect(source.id)}
//             className="cursor-pointer px-3 py-2 hover:bg-blue-100 border-b border-gray-100 last:border-b-0"
//           >
//             <div className="font-medium">{source.source_name}</div>
//             <div className="text-xs text-gray-500">{sourceAccountCount} accounts</div>
//           </li>
//         );
//       })}
//   </ul>
// )}

//               </div>

//               {/* ✅ UPDATED SOURCE ACCOUNT ID - Account object pass */}
//               {formData.source_id && sourceAccounts.length > 0 && (
//                 <div className="relative" ref={sourceSubRef}>
//                   <label className="block font-medium text-gray-700 text-sm">Source Account ID *</label>
//                   <div 
//                     className="w-full p-2 mt-1 border border-gray-300 rounded-md bg-gray-50 cursor-pointer hover:bg-gray-100 flex justify-between items-center"
//                     onClick={() => setIsSourceSubDropdownOpen(!isSourceSubDropdownOpen)}
//                   >
//                     <span className="font-normal text-sm">
//                       {formData.account_id 
//                         ? `ID: ${formData.account_id} (${getAccountDisplayNumber(sourceAccounts.find(acc => acc.id == formData.account_id))})`
//                         : `${sourceAccounts.length} accounts available`}
//                     </span>
//                     <span>▼</span>
//                   </div>
//                   {isSourceSubDropdownOpen && (
//                     <ul className="absolute z-50 w-full mt-1 max-h-40 overflow-auto border border-gray-300 rounded-md bg-white shadow-lg">
//                       {sourceAccounts.map((account) => (
//                         <li
//                           key={account.id}
//                           onClick={() => handleSourceSubSelect(account)}  // ✅ Account object pass
//                           className="cursor-pointer px-3 py-2 hover:bg-blue-100 border-b border-gray-100 last:border-b-0"
//                         >
//                           <div className="font-normal text-sm text-gray-900 break-all">
//                             {getAccountDisplayNumber(account)}  {/* Display same */}
//                           </div>
//                           <div className="text-xs text-gray-500 mt-1">ID: {account.id}</div>  {/* ✅ ID bhi dikhao */}
//                         </li>
//                       ))}
//                     </ul>
//                   )}
//                 </div>
//               )}



//               <div className="relative">
//        <label className="block font-medium text-gray-700 text-sm mb-2">
//                   Sales Person 
//                 </label>
// <div className="relative">
//   <select
//     value={selectedEmployeeId}
// onChange={(e) => {
//   const value = e.target.value;
//   setSelectedEmployeeId(value);
//   setFormData(prev => ({ ...prev, sales_person_id: value }));  // ✅ Sync here
// }}
//     className="block w-full px-4 py-3 border-2 border-gray-200 rounded-lg shadow-sm
//                focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//     required
//   >
//     <option value="">Select Employee</option>
//     {employees1.map((emp) => (
//       <option key={emp.id} value={emp.id}>
//         {emp.name}
//       </option>
//     ))}
//   </select>


// </div>


//               </div>

//               {/* COMMUNICATION MULTI-SELECT */}
//               <div className="relative" ref={communicationRef}>
//                 <label className="block font-medium text-gray-700 text-sm mb-2">
//                   Communication Types (Multi-Select)
//                 </label>
//                 <div className="relative">
//                   <input
//                     type="text"
//                     className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none pr-10"
//                     placeholder="Search communications"
//                     value={communicationSearch}
//                     onChange={(e) => setCommunicationSearch(e.target.value)}
//                     onFocus={() => setIsCommunicationDropdownOpen(true)}
//                     autoComplete="off"
//                   />
//                 </div>
//                 {selectedCommunications.length > 0 && (
//                   <div className="mt-2 flex flex-wrap gap-2">
//                     {selectedCommunications.map((commId) => {
//                       const selectedComm = communicationTypes?.find(comm => comm.id === commId);
//                       return selectedComm ? (
//                         <div key={commId} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs flex items-center">
//                           {selectedComm.medium}
//                           <button
//                             type="button"
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               handleCommunicationSelect(commId);
//                             }}
//                             className="ml-2 text-blue-600 hover:text-blue-800 font-bold text-sm -mr-1"
//                           >
//                             ×
//                           </button>
//                         </div>
//                       ) : null;
//                     })}
//                   </div>
//                 )}
//                 {isCommunicationDropdownOpen && filteredCommunications.length > 0 && (
//                   <ul className="absolute z-50 w-full mt-1 max-h-48 overflow-auto border border-gray-300 rounded-md bg-white shadow-lg">
//                     {filteredCommunications.map((comm) => (
//                       <li
//                         key={comm.id}
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           handleCommunicationSelect(comm.id);
//                         }}
//                         className={`cursor-pointer px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-blue-50 transition-colors ${
//                           selectedCommunications.includes(comm.id) 
//                             ? 'bg-blue-100 border-r-4 border-blue-500' 
//                             : ''
//                         }`}
//                       >
//                         <div className="flex items-center justify-between">
//                           <div>
//                             <div className="font-medium text-sm">{comm.medium}</div>
//                             <div className="text-xs text-gray-500 mt-1">{comm.medium_details}</div>
//                           </div>
//                           {selectedCommunications.includes(comm.id) && (
//                             <span className="text-green-600 font-bold text-sm">✓</span>
//                           )}
//                         </div>
//                       </li>
//                     ))}
//                   </ul>
//                 )}
//               </div>

//               {/* ✅ ASSIGN PROJECT SECTION */}
//               <div ref={assigneeRef}>
//                 <label className="block font-medium text-gray-700 text-sm mb-2">Assign Project * (Multi-Select)</label>
                
//                 {/* Project Managers */}
//                 <div className="mb-3">
//                   <label className="block font-medium text-blue-700 text-sm mb-1">Project Managers</label>
//                   <select
//                     className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900"
//                     onChange={handleManagerSelect}
//                   >
//                     <option value="">Select Project Manager</option>
//                     {projectManagers.map((manager) => (
//                       <option key={manager.id} value={manager.id}>{manager.name}</option>
//                     ))}
//                   </select>
//                 </div>
//                      {selectedManagers.length > 0 && (
//                   <div className="flex flex-wrap gap-2 mt-2 mb-3">
//                     {selectedManagers.map((manager) => (
//                       <div key={manager.id} className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-sm">
//                         {manager.name}
//                         <button type="button" onClick={() => removeManager(manager.id)}>
//                           ×
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 )}

//                 {/* Team Leaders */}
//                 <div className="mb-3">
//                   <label className="block font-medium text-green-700 text-sm mb-1">Team Leaders</label>
//                   <select
//                     className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 text-gray-900"
//                     onChange={handleTeamLeaderSelect}
//                   >
//                     <option value="">Select Team Leader</option>
//                     {teamleaders.map((tl) => (
//                       <option key={tl.id} value={tl.id}>{tl.name}</option>
//                     ))}
//                   </select>
//                 </div>
//                           {selectedTeamLeaders.length > 0 && (
//                   <div className="flex flex-wrap gap-2 mt-2 mb-3">
//                     {selectedTeamLeaders.map((tl) => (
//                       <div key={tl.id} className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-md text-sm">
//                         {tl.name}
//                         <button type="button" onClick={() => removeTeamLeader(tl.id)}>
//                           ×
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 )}


//                 {/* Employees */}
//                 <div className="mb-3">
//                   <label className="block font-medium text-yellow-700 text-sm mb-1">Employees</label>
//                   <select
//                     className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 text-gray-900"
//                     onChange={handleEmployeeSelect}
//                   >
//                     <option value="">Select Employee</option>
//                     {employees.map((em) => (
//                       <option key={em.id} value={em.id}>{em.name}</option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* Selected Managers */}
       
//                 {/* Selected Team Leaders */}
      
//                 {/* Selected Employees */}
//                 {selectedEmployees.length > 0 && (
//                   <div className="flex flex-wrap gap-2 mt-2">
//                     {selectedEmployees.map((em) => (
//                       <div key={em.id} className="flex items-center gap-2 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-md text-sm">
//                         {em.name}
//                         <button type="button" onClick={() => removeEmployee(em.id)}>
//                           ×
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               {/* Activity Tags */}
//               <div>
//                 <label className="block font-medium text-gray-700 text-sm mb-1">Activity Tag *</label>
//                 <div className="grid grid-cols-3 gap-3 p-2 border border-gray-300 rounded-md">
//                   <label className="flex items-center p-2 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
//                     <input type="radio" name="project_tag_activity" value="1" checked={formData.project_tag_activity == "1"}
//                            onChange={handleInputChange} className="mr-2" />
//                     <span className="text-sm">No Work</span>
//                   </label>
//                   <label className="flex items-center p-2 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
//                     <input type="radio" name="project_tag_activity" value="2" checked={formData.project_tag_activity == "2"}
//                            onChange={handleInputChange} className="mr-2" />
//                     <span className="text-sm">In House</span>
//                   </label>
//                   <label className="flex items-center p-2 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
//                     <input type="radio" name="project_tag_activity" value="3" checked={formData.project_tag_activity == "3"}
//                            onChange={handleInputChange} className="mr-2" />
//                     <span className="text-sm">Billable</span>
//                   </label>
//                 </div>
//               </div>

//               {/* TRACKING TOGGLE */}
//               <div>
//                 <label className="block font-medium text-gray-700 text-sm mb-3">Tracking? *</label>
//                 <div className="flex items-center space-x-4 p-3 border border-gray-300 rounded-lg bg-gray-50">
//                   <div className="relative inline-flex items-center cursor-pointer">
//                     <input
//                       type="checkbox"
//                       className="sr-only peer"
//                       checked={formData.is_tracking_enabled}
//                       readOnly
//                     />
//                     <div 
//                       className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 peer-checked:ring-2 peer-checked:ring-green-200"
//                       onClick={toggleTracking}
//                     />
//                   </div>
//                   <span className="text-sm font-medium text-gray-900 ml-2">
//                     {formData.is_tracking_enabled ? "YES" : "NO"}
//                   </span>
//                   <span className="text-xs text-gray-500 ml-2">
//                     ({formData.is_tracking_enabled ? "Tracking Enabled" : "Fixed Project"})
//                   </span>
//                 </div>
//               </div>

//               {/* TRACKING FIELDS */}
//               {formData.is_tracking_enabled && (
//                 <>
//                   <div>
//                <div className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg bg-gray-100 mt-4">
//   <div className="relative inline-flex items-center cursor-pointer">
//     <input 
//       type="checkbox" 
//       className="sr-only peer" 
//       checked={formData.offline_hours === "1"}
//       readOnly 
//     />
//     <div 
//       className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600 peer-checked:ring-2 peer-checked:ring-purple-200"
//       onClick={toggleOfflineHours}
//     />
//   </div>
//   <span className="text-sm font-medium text-gray-900">
//     Offline Hours? {formData.offline_hours === "1" ? "YES" : "NO"}  
//   </span>
// </div>

//                     <label className="block font-medium text-gray-700 text-sm mb-3">Same Source ID?</label>
//                     <div className="flex items-center space-x-4 p-3 border border-gray-300 rounded-lg bg-gray-50">
//                       <div className="relative inline-flex items-center cursor-pointer">
//                         <input type="checkbox" className="sr-only peer" checked={formData.use_same_source} readOnly />
//                         <div 
//                           className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 peer-checked:ring-2 peer-checked:ring-green-200"
//                           onClick={toggleSameSource}
//                         />
//                       </div>
//                       <span className="text-sm font-medium text-gray-900 ml-2">{formData.use_same_source ? "YES" : "NO"}</span>
//                       <span className="text-xs text-gray-500 ml-2">({formData.use_same_source ? "Use Above Source" : "Select New Source"})</span>
//                     </div>
//                   </div>

//                   {!formData.use_same_source && (
//                     <div className="relative" ref={trackingSourceRef}>
//                       <label htmlFor="trackingSourceSearch" className="block font-medium text-gray-700 text-sm">
//                         Tracking Source *
//                       </label>
//                       <input
//                         id="trackingSourceSearch"
//                         type="text"
//                         className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                         placeholder="Search tracking source by name"
//                         value={trackingSourceSearch}
//                         onChange={(e) => setTrackingSourceSearch(e.target.value)}
//                         autoComplete="off"
//                         onFocus={() => setIsTrackingSourceDropdownOpen(true)}
//                       />
//                       {isTrackingSourceDropdownOpen && filteredTrackingSources.length > 0 && (
//                         <ul className="absolute z-50 w-full mt-1 max-h-40 overflow-auto border border-gray-300 rounded-md bg-white shadow-lg">
//                           {filteredTrackingSources.map((source) => {
//                             const sourceAccountCount = accounts.filter(acc => String(acc.source.id) === String(source.id)).length;
//                             return (
//                               <li
//                                 key={source.id}
//                                 onClick={() => handleTrackingSourceSelect(source.id)}
//                                 className="cursor-pointer px-3 py-2 hover:bg-blue-100 border-b border-gray-100 last:border-b-0"
//                               >
//                                 <div className="font-medium">{source.source_name}</div>
//                                 <div className="text-xs text-gray-500">{sourceAccountCount} accounts</div>
//                               </li>
//                             );
//                           })}
//                         </ul>
//                       )}
//                     </div>
//                   )}

//                   {/* ✅ UPDATED TRACKING ACCOUNT ID */}
//                   {formData.tracking_source_id && trackingSourceAccounts.length > 0 && (
//                     <div className="relative" ref={trackingSourceSubRef}>
//                       <label className="block font-medium text-gray-700 text-sm">Tracking Account ID *</label>
//                       <div 
//                         className="w-full p-2 mt-1 border border-gray-300 rounded-md bg-gray-50 cursor-pointer hover:bg-gray-100 flex justify-between items-center"
//                         onClick={() => setIsTrackingSourceSubDropdownOpen(!isTrackingSourceSubDropdownOpen)}
//                       >
//                         <span className="font-normal text-sm">
//                           {formData.tracking_account_id 
//                             ? ` ${getAccountDisplayNumber(trackingSourceAccounts.find(acc => acc.id == formData.tracking_account_id))}`
//                             : `${trackingSourceAccounts.length} accounts available`}
//                         </span>
//                         <span>▼</span>
//                       </div>
//                       {isTrackingSourceSubDropdownOpen && (
//                         <ul className="absolute z-50 w-full mt-1 max-h-40 overflow-auto border border-gray-300 rounded-md bg-white shadow-lg">
//                           {trackingSourceAccounts.map((account) => (
//                             <li
//                               key={account.id}
//                               onClick={() => handleTrackingSourceSubSelect(account)}  // ✅ Account object pass
//                               className="cursor-pointer px-3 py-2 hover:bg-blue-100 border-b border-gray-100 last:border-b-0"
//                             >
//                               <div className="font-normal text-sm text-gray-900 break-all">
//                                 {getAccountDisplayNumber(account)}
//                               </div>
//                               {/* <div className="text-xs text-gray-500 mt-1">ID: {account.id}</div>  ✅ ID show */}
//                             </li>
//                           ))}
//                         </ul>
//                       )}
//                     </div>
//                   )}
//                 </>
//               )}

// {/* Hours & Budget Fields */}
//              <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label htmlFor="projectHours" className="block font-medium text-gray-700 text-sm">Total Hours</label>
//                   <input id="projectHours" type="number" name="project_hours" className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" value={formData.project_hours} onChange={handleInputChange} placeholder="0" />
//                  </div>
//                 <div>
//                    <label htmlFor="projectUsedHours" className="block font-medium text-gray-700 text-sm">Used Hours</label>
//                   <input id="projectUsedHours" type="number" name="project_used_hours" className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" value={formData.project_used_hours} onChange={handleInputChange} placeholder="0" />
//                 </div>
//                 <div>
//                    <label htmlFor="projectBudget" className="block font-medium text-gray-700 text-sm">Total Budget</label>
//                    <input id="projectBudget" type="number" name="project_budget" className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" value={formData.project_budget} onChange={handleInputChange} placeholder="0" />
//                  </div>
//                 <div>
//                    <label htmlFor="projectUsedBudget" className="block font-medium text-gray-700 text-sm">Used Budget</label>
//                   <input id="projectUsedBudget" type="number" name="project_used_budget" className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" value={formData.project_used_budget} onChange={handleInputChange} placeholder="0" />
//                 </div>
//                </div>

//               <SubmitButton 
//                 type="submit" 
//                 disabled={isLoading}
//                 className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
             

//               >
//                 {isLoading ? "Creating..." : "Create Project Master"}
//               </SubmitButton>
//             </form>
//           </div>
//         </div>
//       )}

// {isEditMode && (
//   <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
//     <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
//       <div className="flex justify-between mb-4">
//         <div>
//           <h2 className="text-xl font-semibold text-gray-800">Edit Project Master Details</h2>
//           <p className="text-sm text-gray-500 mt-1">
//             Update existing project details
//             <span className="ml-2 font-mono bg-blue-100 px-2 py-1 rounded text-xs">
//               ID: {editProject?.project?.id || editProject?.id || 'N/A'}
//             </span>
//           </p>
//         </div>
//         <button className="font-bold text-xl" onClick={onCancel}>×</button>
//       </div>

//       {showMessage && message && (
//         <div className={`mt-4 p-3 rounded-md text-sm font-medium text-center ${
//           message.includes("updated") || message.includes("success")
//             ? "bg-green-50 text-green-800 border border-green-300"
//             : "bg-red-50 text-red-800 border border-red-300"
//         }`}>
//           {message}
//         </div>
//       )}

//       <form onSubmit={handleSubmit} className="mt-6 space-y-4">
//         {/* CLIENT SEARCH */}
//         <div className="relative" ref={clientRef}>
//           <label htmlFor="clientSearch" className="block font-medium text-gray-700 text-sm">
//             Client Name *
//           </label>
//           <input
//             id="clientSearch"
//             type="text"
//             className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
//             placeholder="Search client by name"
//             value={clientSearch}
//             onChange={(e) => setClientSearch(e.target.value)}
//             autoComplete="off"
//             onFocus={() => setIsClientDropdownOpen(true)}
//           />
//           {isClientDropdownOpen && filteredClients.length > 0 && (
//             <ul className="absolute z-50 w-full mt-1 max-h-40 overflow-auto border border-gray-300 rounded-md bg-white shadow-lg">
//               {filteredClients.map((client) => (
//                 <li
//                   key={client.id}
//                   onClick={() => handleClientSelect(client.id)}
//                   className="cursor-pointer px-3 py-2 hover:bg-blue-100 border-b border-gray-100 last:border-b-0"
//                 >
//                   <div className="font-medium">{client.client_name}</div>
//                   <div className="text-xs text-gray-500">{client.client_email}</div>
//                 </li>
//               ))}
//             </ul>
//           )}
//         </div>

//         {/* PROJECT NAME */}
//         <div>
//           <label htmlFor="projectName" className="block font-medium text-gray-700 text-sm">
//             Project Name *
//           </label>
//           <input
//             id="projectName"
//             name="project_name"
//             value={formData.project_name}
//             onChange={handleInputChange}
//             placeholder="Enter Project Name"
//             className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
//           />
//         </div>

//         {/* PROJECT DESCRIPTION */}
//    <div>
//   <label htmlFor="projectDescription" className="block font-medium text-gray-700 text-sm">
//     Project Description
//   </label>
//   <div className="border border-gray-300 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
//     <ReactQuill
//       theme="snow"
//       value={formData.project_description}
//       onChange={(value) =>
//         setFormData((prev) => ({
//           ...prev,
//           project_description: value,
//         }))
//       }
//       placeholder="Enter project description"
//       modules={{
//         toolbar: [
//           [{ header: [1, 2, false] }],
//           ["bold", "italic", "underline"],
//           [{ list: "ordered" }, { list: "bullet" }],
//           ["link"],
//           ["clean"],
//         ],
//         clipboard: {
//           matchVisual: false,
//         },
//       }}
//       formats={[
//         "header",
//         "bold",
//         "italic",
//         "underline",
//         "list",
//         "bullet",
//         "link",
//       ]}
//       className="bg-white"
//       style={{ 
//         minHeight: "100px",
//         maxHeight: "140px",  // 🎯 4-5 LINES MAX
//         overflowY: "auto"    // 🎯 SCROLLBAR
//       }}
//       bounds={'.ql-editor'}
//     />
//   </div>
// </div>


//         {/* PROJECT SOURCE */}
//         <div className="relative" ref={sourceRef} >
//           <label htmlFor="sourceSearch" className="block font-medium text-gray-700 text-sm">
//             Project Source *
//           </label>
//           <input
//             id="sourceSearch"
//             type="text"
//             className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
//             placeholder="Search source by name"
//             value={sourceSearch}
//             onChange={(e) => setSourceSearch(e.target.value)}
//             autoComplete="off"
//             onFocus={() => setIsSourceDropdownOpen(true)}
//           />
//       {isSourceDropdownOpen && filteredSources.length > 0 && (
//   <ul className="absolute z-50 w-full mt-1 max-h-40 overflow-auto border border-gray-300 rounded-md bg-white shadow-lg">
//     {filteredSources
//       .filter(source => {
//         // 🎯 SHOW ONLY SOURCES WITH ≥1 ACCOUNT
//         const sourceAccountCount = accounts.filter(acc => String(acc.source.id) === String(source.id)).length;
//         return sourceAccountCount > 0;
//       })
//       .map((source) => {
//         const sourceAccountCount = accounts.filter(acc => String(acc.source.id) === String(source.id)).length;
//         return (
//           <li
//             key={source.id}
//             onClick={() => handleSourceSelect(source.id)}
//             className="cursor-pointer px-3 py-2 hover:bg-blue-100 border-b border-gray-100 last:border-b-0"
//           >
//             <div className="font-medium">{source.source_name}</div>
//             <div className="text-xs text-gray-500">{sourceAccountCount} accounts</div>
//           </li>
//         );
//       })}
//   </ul>
// )}
//         </div>

//         {/* SALES PERSON - ADD THIS AFTER PROJECT SOURCE SECTION */}
// <div className="relative">
//   <label className="block font-medium text-gray-700 text-sm mb-2">
//     Sales Person *
//   </label>
//   <div className="relative">
//     <select
//       value={selectedEmployeeId || formData.sales_person_id || ""}
//       onChange={(e) => {
//         const value = e.target.value;
//         setSelectedEmployeeId(value);
//         setFormData(prev => ({ ...prev, sales_person_id: value }));
//       }}
//       className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none bg-gray-50 cursor-pointer hover:bg-gray-100 flex justify-between items-center"
//     >
//       <option value="">Select Sales Person</option>
//       {employees1.map((emp) => (
//         <option key={emp.id} value={emp.id}>
//           {emp.name} ({emp.employee_id})
//         </option>
//       ))}
//     </select>
    
//     {/* ✅ SHOW SELECTED PERSON NAME (like assignees chips) */}
//     {formData.sales_person_id && !selectedEmployeeId && (
//       <div className="mt-2 flex items-center gap-2 bg-purple-100 text-purple-800 px-3 py-2 rounded-md text-sm border">
//         <span className="font-medium">
//           {editProject?.relation?.sales_person_data?.[0]?.name || 
//            employees1.find(emp => emp.id == formData.sales_person_id)?.name || 
//            "Loading..."}
//         </span>
//         <span className="text-xs bg-purple-200 px-2 py-1 rounded-full">
//           ID: {formData.sales_person_id}
//         </span>
//       </div>
//     )}
//   </div>
// </div>


//         {/* SOURCE ACCOUNT ID */}
//         {formData.source_id && sourceAccounts.length > 0 && (
//           <div className="relative"  ref={sourceSubRef}>
//             <label className="block font-medium text-gray-700 text-sm">Source Account ID *</label>
//             <div 
//               className="w-full p-2 mt-1 border border-gray-300 rounded-md bg-gray-50 cursor-pointer hover:bg-gray-100 flex justify-between items-center"
//               onClick={() => setIsSourceSubDropdownOpen(!isSourceSubDropdownOpen)}
//             >
//               <span className="font-normal text-sm">
//                 {formData.account_id 
//                   ? `ID: ${formData.account_id} (${getAccountDisplayNumber(sourceAccounts.find(acc => acc.id == formData.account_id))})`
//                   : `${sourceAccounts.length} accounts available`}
//               </span>
//               <span>▼</span>
//             </div>
//             {isSourceSubDropdownOpen && (
//               <ul className="absolute z-50 w-full mt-1 max-h-40 overflow-auto border border-gray-300 rounded-md bg-white shadow-lg">
//                 {sourceAccounts.map((account) => (
//                   <li
//                     key={account.id}
//                     onClick={() => handleSourceSubSelect(account)}
//                     className="cursor-pointer px-3 py-2 hover:bg-blue-100 border-b border-gray-100 last:border-b-0"
//                   >
//                     <div className="font-normal text-sm text-gray-900 break-all">
//                       {getAccountDisplayNumber(account)}
//                     </div>
//                     <div className="text-xs text-gray-500 mt-1">ID: {account.id}</div>
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </div>
//         )}

//         {/* COMMUNICATION MULTI-SELECT */}
//         <div className="relative" ref={communicationRef}>
//           <label className="block font-medium text-gray-700 text-sm mb-2">
//             Communication Types (Multi-Select)
//           </label>
//           <div className="relative">
//             <input
//               type="text"
//               className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none pr-10"
//               placeholder="Search communications"
//               value={communicationSearch}
//               onChange={(e) => setCommunicationSearch(e.target.value)}
//               onFocus={() => setIsCommunicationDropdownOpen(true)}
//               autoComplete="off"
//             />
//           </div>
//           {selectedCommunications.length > 0 && (
//             <div className="mt-2 flex flex-wrap gap-2">
//               {selectedCommunications.map((commId) => {
//                 const selectedComm = communicationTypes?.find(comm => comm.id === commId);
//                 return selectedComm ? (
//                   <div key={commId} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs flex items-center">
//                     {selectedComm.medium}
//                     <button
//                       type="button"
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         handleCommunicationSelect(commId);
//                       }}
//                       className="ml-2 text-blue-600 hover:text-blue-800 font-bold text-sm -mr-1"
//                     >
//                       ×
//                     </button>
//                   </div>
//                 ) : null;
//               })}
//             </div>
//           )}
//           {isCommunicationDropdownOpen && filteredCommunications.length > 0 && (
//             <ul className="absolute z-50 w-full mt-1 max-h-48 overflow-auto border border-gray-300 rounded-md bg-white shadow-lg">
//               {filteredCommunications.map((comm) => (
//                 <li
//                   key={comm.id}
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     handleCommunicationSelect(comm.id);
//                   }}
//                   className={`cursor-pointer px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-blue-50 transition-colors ${
//                     selectedCommunications.includes(comm.id) 
//                       ? 'bg-blue-100 border-r-4 border-blue-500' 
//                       : ''
//                   }`}
//                 >
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <div className="font-medium text-sm">{comm.medium}</div>
//                       <div className="text-xs text-gray-500 mt-1">{comm.medium_details}</div>
//                     </div>
//                     {selectedCommunications.includes(comm.id) && (
//                       <span className="text-green-600 font-bold text-sm">✓</span>
//                     )}
//                   </div>
//                 </li>
//               ))}
//             </ul>
//           )}
//         </div>

//         {/* ASSIGN PROJECT SECTION */}
//         <div ref={assigneeRef}>
//           <label className="block font-medium text-gray-700 text-sm mb-2">Assign Project * (Multi-Select)</label>
          
//           {/* Project Managers */}
//           <div className="mb-3">
//             <label className="block font-medium text-blue-700 text-sm mb-1">Project Managers</label>
//             <select
//               className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900"
//               onChange={handleManagerSelect}
//             >
//               <option value="">Select Project Manager</option>
//               {projectManagers.map((manager) => (
//                 <option key={manager.id} value={manager.id}>{manager.name}</option>
//               ))}
//             </select>
//           </div>
//        {selectedManagers.length > 0 && (
//             <div className="flex flex-wrap gap-2 mt-2 mb-3">
//               {selectedManagers.map((manager) => (
//                 <div key={manager.id} className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-sm">
//                   {manager.name}
//                   <button type="button" onClick={() => removeManager(manager.id)}>
//                     ×
//                   </button>
//                 </div>
//               ))}
//             </div>
//           )}
//           {/* Team Leaders */}
//           <div className="mb-3">
//             <label className="block font-medium text-green-700 text-sm mb-1">Team Leaders</label>
//             <select
//               className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 text-gray-900"
//               onChange={handleTeamLeaderSelect}
//             >
//               <option value="">Select Team Leader</option>
//               {teamleaders.map((tl) => (
//                 <option key={tl.id} value={tl.id}>{tl.name}</option>
//               ))}
//             </select>
//           </div>        
//             {selectedTeamLeaders.length > 0 && (
//             <div className="flex flex-wrap gap-2 mt-2 mb-3">
//               {selectedTeamLeaders.map((tl) => (
//                 <div key={tl.id} className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-md text-sm">
//                   {tl.name}
//                   <button type="button" onClick={() => removeTeamLeader(tl.id)}>
//                     ×
//                   </button>
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* Employees */}
//           <div className="mb-3">
//             <label className="block font-medium text-yellow-700 text-sm mb-1">Employees</label>
//             <select
//               className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 text-gray-900"
//               onChange={handleEmployeeSelect}
//             >
//               <option value="">Select Employee</option>
//               {employees.map((em) => (
//                 <option key={em.id} value={em.id}>{em.name}</option>
//               ))}
//             </select>
//           </div>

//           {/* Selected Managers */}
   

//           {/* Selected Team Leaders */}


//           {/* Selected Employees */}
//           {selectedEmployees.length > 0 && (
//             <div className="flex flex-wrap gap-2 mt-2">
//               {selectedEmployees.map((em) => (
//                 <div key={em.id} className="flex items-center gap-2 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-md text-sm">
//                   {em.name}
//                   <button type="button" onClick={() => removeEmployee(em.id)}>
//                     ×
//                   </button>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Activity Tags */}
//         <div>
//           <label className="block font-medium text-gray-700 text-sm mb-1">Activity Tag *</label>
//           <div className="grid grid-cols-3 gap-3 p-2 border border-gray-300 rounded-md">
//             <label className="flex items-center p-2 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
//               <input type="radio" name="project_tag_activity" value="1" checked={formData.project_tag_activity == "1"}
//                      onChange={handleInputChange} className="mr-2" />
//               <span className="text-sm">No Work</span>
//             </label>
//             <label className="flex items-center p-2 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
//               <input type="radio" name="project_tag_activity" value="2" checked={formData.project_tag_activity == "2"}
//                      onChange={handleInputChange} className="mr-2" />
//               <span className="text-sm">In House</span>
//             </label>
//             <label className="flex items-center p-2 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
//               <input type="radio" name="project_tag_activity" value="3" checked={formData.project_tag_activity == "3"}
//                      onChange={handleInputChange} className="mr-2" />
//               <span className="text-sm">Billable</span>
//             </label>
//           </div>
//         </div>

//         {/* TRACKING TOGGLE */}
//         <div>
//           <label className="block font-medium text-gray-700 text-sm mb-3">Tracking? *</label>
//           <div className="flex items-center space-x-4 p-3 border border-gray-300 rounded-lg bg-gray-50">
//             <div className="relative inline-flex items-center cursor-pointer">
//               <input
//                 type="checkbox"
//                 className="sr-only peer"
//                 checked={formData.is_tracking_enabled}
//                 readOnly
//               />
//               <div 
//                 className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 peer-checked:ring-2 peer-checked:ring-green-200"
//                 onClick={toggleTracking}
//               />
//             </div>
//             <span className="text-sm font-medium text-gray-900 ml-2">
//               {formData.is_tracking_enabled ? "YES" : "NO"}
//             </span>
//             <span className="text-xs text-gray-500 ml-2">
//               ({formData.is_tracking_enabled ? "Tracking Enabled" : "Fixed Project"})
//             </span>
//           </div>
//         </div>

//         {/* TRACKING FIELDS */}
//         {formData.is_tracking_enabled && (
//           <>
//             <div>
//               <label className="block font-medium text-gray-700 text-sm mb-3">Same Source ID?</label>
//               <div className="flex items-center space-x-4 p-3 border border-gray-300 rounded-lg bg-gray-50">
//                 <div className="relative inline-flex items-center cursor-pointer">
//                   <input type="checkbox" className="sr-only peer" checked={formData.use_same_source} readOnly />
//                   <div 
//                     className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 peer-checked:ring-2 peer-checked:ring-green-200"
//                     onClick={toggleSameSource}
//                   />
//                 </div>
//                 <span className="text-sm font-medium text-gray-900 ml-2">{formData.use_same_source ? "YES" : "NO"}</span>
//                 <span className="text-xs text-gray-500 ml-2">({formData.use_same_source ? "Use Above Source" : "Select New Source"})</span>
//               </div>
//             </div>

//             {!formData.use_same_source && (
//               <div className="relative" ref={trackingSourceRef}>
//                 <label htmlFor="trackingSourceSearch" className="block font-medium text-gray-700 text-sm">
//                   Tracking Source *
//                 </label>
//                 <input
//                   id="trackingSourceSearch"
//                   type="text"
//                   className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                   placeholder="Search tracking source by name"
//                   value={trackingSourceSearch}
//                   onChange={(e) => setTrackingSourceSearch(e.target.value)}
//                   autoComplete="off"
//                   onFocus={() => setIsTrackingSourceDropdownOpen(true)}
//                 />
//                 {isTrackingSourceDropdownOpen && filteredTrackingSources.length > 0 && (
//                   <ul className="absolute z-50 w-full mt-1 max-h-40 overflow-auto border border-gray-300 rounded-md bg-white shadow-lg">
//                     {filteredTrackingSources.map((source) => {
//                       const sourceAccountCount = accounts.filter(acc => String(acc.source.id) === String(source.id)).length;
//                       return (
//                         <li
//                           key={source.id}
//                           onClick={() => handleTrackingSourceSelect(source.id)}
//                           className="cursor-pointer px-3 py-2 hover:bg-blue-100 border-b border-gray-100 last:border-b-0"
//                         >
//                           <div className="font-medium">{source.source_name}</div>
//                           <div className="text-xs text-gray-500">{sourceAccountCount} accounts</div>
//                         </li>
//                       );
//                     })}
//                   </ul>
//                 )}
//               </div>
//             )}

//             {/* TRACKING ACCOUNT ID */}
//             {formData.tracking_source_id && trackingSourceAccounts.length > 0 && (
//               <div className="relative">
//                 <label className="block font-medium text-gray-700 text-sm">Tracking Account ID *</label>
//                 <div 
//                   className="w-full p-2 mt-1 border border-gray-300 rounded-md bg-gray-50 cursor-pointer hover:bg-gray-100 flex justify-between items-center"
//                   onClick={() => setIsTrackingSourceSubDropdownOpen(!isTrackingSourceSubDropdownOpen)}
//                 >
//                   <span className="font-normal text-sm">
//                     {formData.tracking_account_id 
//                       ? `ID: ${formData.tracking_account_id} (${getAccountDisplayNumber(trackingSourceAccounts.find(acc => acc.id == formData.tracking_account_id))})`
//                       : `${trackingSourceAccounts.length} accounts available`}
//                   </span>
//                   <span>▼</span>
//                 </div>
//                 {isTrackingSourceSubDropdownOpen && (
//                   <ul className="absolute z-50 w-full mt-1 max-h-40 overflow-auto border border-gray-300 rounded-md bg-white shadow-lg">
//                     {trackingSourceAccounts.map((account) => (
//                       <li
//                         key={account.id}
//                         onClick={() => handleTrackingSourceSubSelect(account)}
//                         className="cursor-pointer px-3 py-2 hover:bg-blue-100 border-b border-gray-100 last:border-b-0"
//                       >
//                         <div className="font-normal text-sm text-gray-900 break-all">
//                           {getAccountDisplayNumber(account)}
//                         </div>
//                         <div className="text-xs text-gray-500 mt-1">ID: {account.id}</div>
//                       </li>
//                     ))}
//                   </ul>
//                 )}
//               </div>
//             )}
//      <div className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg bg-gray-100 mt-4">
//   <div className="relative inline-flex items-center cursor-pointer">
//     <input 
//       type="checkbox" 
//       className="sr-only peer" 
//       checked={formData.offline_hours === "1"} 
//       readOnly 
//     />
//     <div 
//       className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600 peer-checked:ring-2 peer-checked:ring-purple-200"
//       onClick={toggleOfflineHours}
//     />
//   </div>
//   <span className="text-sm font-medium text-gray-900">
//     Offline Hours? {formData.offline_hours === "1" ? "YES" : "NO"}  
//   </span>
// </div>


      
//           </>
//         )}

//         {/* Hours & Budget Fields */}
//         <div className="grid grid-cols-2 gap-4">
//           <div>
//             <label htmlFor="projectHours" className="block font-medium text-gray-700 text-sm">Total Hours</label>
//             <input 
//               id="projectHours" 
//               type="number" 
//               name="project_hours" 
//               className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" 
//               value={formData.project_hours} 
//               onChange={handleInputChange} 
//               placeholder="0" 
//             />
//           </div>
//           <div>
//             <label htmlFor="projectUsedHours" className="block font-medium text-gray-700 text-sm">Used Hours</label>
//             <input 
//               id="projectUsedHours" 
//               type="number" 
//               name="project_used_hours" 
//               className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" 
//               value={formData.project_used_hours} 
//               onChange={handleInputChange} 
//               placeholder="0" 
//             />
//           </div>
//           <div>
//             <label htmlFor="projectBudget" className="block font-medium text-gray-700 text-sm">Total Budget</label>
//             <input 
//               id="projectBudget" 
//               type="number" 
//               name="project_budget" 
//               className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" 
//               value={formData.project_budget} 
//               onChange={handleInputChange} 
//               placeholder="0" 
//             />
//           </div>
//           <div>
//             <label htmlFor="projectUsedBudget" className="block font-medium text-gray-700 text-sm">Used Budget</label>
//             <input 
//               id="projectUsedBudget" 
//               type="number" 
//               name="project_used_budget" 
//               className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" 
//               value={formData.project_used_budget} 
//               onChange={handleInputChange} 
//               placeholder="0" 
//             />
//           </div>
//         </div>

//         {/* SUBMIT BUTTONS */}
//         <div className="flex gap-3 pt-6">
//           <button
//             type="button"
//             onClick={onCancel}
//             className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
//             disabled={isLoading}
//           >
//             Cancel
//           </button>
//           <SubmitButton 
//             type="submit" 
//             disabled={isLoading}
            
//             className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold shadow-md transition-all"
//           >
//             {isLoading ? "Updating..." : "Update Project Master"}
//           </SubmitButton>
//         </div>
//       </form>
//     </div>
//   </div>
// )}

      

//     </div>
//   );
// };

