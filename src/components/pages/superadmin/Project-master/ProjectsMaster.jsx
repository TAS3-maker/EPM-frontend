import React, { useState, useEffect, useRef,useMemo } from "react";
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
import { useActivity } from "../../../context/ActivityContext";
import { Loader2 } from "lucide-react";

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

  const { getActivityTags, activityTags, loading: activityLoading } = useActivity();

  const [formData, setFormData] = useState({
    project_name: "",
    client_id: "",
    source_id: "",
    account_id: "",
    communication_id: [],
    assignees: [],
    sales_person_id: "",
    project_estimation_by:"",
    project_call_by:"",
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
    tracking_id: [],
  });
  

  // Client search states
  const [clientSearch, setClientSearch] = useState("");
  const [filteredClients, setFilteredClients] = useState([]);
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
  const [filteredSalesPerson, setFilteredSalesPerson] = useState([]);
  const [isSalesPersonDropdownOpen, setIsSalesPersonDropdownOpen] = useState(false);
// ✅ PERFECT - Only these 4 states needed:
const [estimationSearch, setEstimationSearch] = useState("");           // Search input
const [filteredEstimationEmployees, setFilteredEstimationEmployees] = useState([]);  // Dropdown list
const [selectedEstimationEmployeeId, setSelectedEstimationEmployeeId] = useState(""); // Selected ID
const [estimationPersonDropdown, setEstimationPersonDropdown] = useState(false);     // Dropdown open/close
const [callSearch, setCallSearch] = useState("");           // Search input
const [filteredCallEmployees, setFilteredCallEmployees] = useState([]);  // Dropdown list
const [selectedCallEmployeeId, setSelectedCallEmployeeId] = useState(""); // Selected ID
const [estimationCallDropdown, setEstimationCallDropdown] = useState(false);     // Dropdown open/close
const [trackingAccountDisplay, setTrackingAccountDisplay] = useState("");
  // Sales search states
  const [salesPersonSearch, setSalesPersonSearch] = useState("");

const [useSameForEstimation, setUseSameForEstimation] = useState(true);
const [useSameForCall, setUseSameForCall] = useState(true);
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



  useEffect(() => {
    if (isEditMode && editProject) {
      console.log("🔧 Prefilling EDIT form:", editProject);
      populateEditData(editProject);
    }
  }, [isEditMode, editProject]);

const toggleSameForEstimation = () => {
  setUseSameForEstimation(prev => {
    if (!prev && formData.sales_person_id) { 
      setSelectedEstimationEmployeeId(formData.sales_person_id);
      setEstimationSearch(salesPersonSearch);
      setFormData(p => ({ ...p, project_estimation_by: formData.sales_person_id }));
    } else if (prev) { 
      setSelectedEstimationEmployeeId("");
      setEstimationSearch("");
      setFormData(p => ({ ...p, project_estimation_by: "" }));
    }
    return !prev;
  });
};

const toggleSameForCall = () => {
  setUseSameForCall(prev => {
    if (!prev && formData.sales_person_id) { // ✅ Turning ON: Copy sales person
      setSelectedCallEmployeeId(formData.sales_person_id);
      setCallSearch(salesPersonSearch);
      setFormData(p => ({ ...p, project_call_by: formData.sales_person_id }));
    } else if (prev) { // ✅ Turning OFF: CLEAR fields
      setSelectedCallEmployeeId("");
      setCallSearch("");
      setFormData(p => ({ ...p, project_call_by: "" }));
    }
    return !prev;
  });
};
const canEditEstimation = useMemo(() => {
  const salesId = formData.sales_person_id?.toString() || "";
  const estimationId = formData.project_estimation_by?.toString() || "";
  return salesId === estimationId;
}, [formData.sales_person_id, formData.project_estimation_by]);

const canEditCall = useMemo(() => {
  const salesId = formData.sales_person_id?.toString() || "";
  const callId = formData.project_call_by?.toString() || "";
  return salesId === callId;
}, [formData.sales_person_id, formData.project_call_by]);

  //  NEW: Populate form with existing project data
const populateEditData = (projectData) => {
  const project = projectData.project;
  const relation = projectData.relation;
const trackingIds = Array.isArray(relation.tracking_account) 
  ? relation.tracking_account.map(acc => acc.id)
  : relation.tracking_id ? [relation.tracking_id] : [];

const isSameSource = (() => {
  // Case 1: Single tracking_id matches account_id
  if (trackingIds.length === 1 && trackingIds[0] === relation.account_id) {
    return true;
  }
  // Case 2: tracking_source_id matches source_id AND tracking_id matches account_id
  if (relation.tracking_source_id === relation.source_id && 
      trackingIds.length === 1 && 
      trackingIds[0] === relation.account_id) {
    return true;
  }
  return false;
})();
  
  console.log('🔍 API TRACKING DEBUG:', {
    account_id: relation.account_id,        // 24
    tracking_id: relation.tracking_id,      // 22
    tracking_source_id: relation.tracking_source_id, // 3
    isSameSource                           // false
  });
  
  // STEP 1: Form data - Populate ALL fields EXACTLY matching your formData
  setFormData({
    project_name: project.project_name || "",                    // "testing testing"
    client_id: relation.client_id || "",
    source_id: relation.source_id || "",                         // 3
    account_id: relation.account_id || "",                       // 24
    communication_id: relation.communication_id || [],
    assignees: relation.assignees_id || [],
    sales_person_id: relation.sales_person_id || "",
    project_estimation_by: relation.project_estimation_by || "",
    project_call_by: relation.project_call_by || "",
    project_tracking: project.project_tracking || "1",           // "1"
    project_status: project.project_status || "In Progress",
    project_description: project.project_description || "",       // "<p>sdfsdfdsfsadf<\\/p>"
    project_budget: project.project_budget || "",
    project_hours: project.project_hours || "",
    project_used_hours: project.project_used_hours || "",
    project_used_budget: project.project_used_budget || "",
    project_tag_activity: project.project_tag_activity || 1,     // 8 ✅ "In-House"
    offline_hours: project.offline_hours === "0" ? "0" : "1",   // "0"
    
    // ✅ TRACKING FIELDS - MAIN FIXES
    is_tracking_enabled: project.project_tracking === "1",       // true ✅ Shows tracking section
    use_same_source: isSameSource,                              // false ✅ Toggle OFF
    tracking_source_id: relation.tracking_source_id || "",       // "3" ✅ Upwork selected
    tracking_id: trackingIds                     // "22" ✅ techarchmohan selected
  });
setTrackingAccountDisplay(
  relation.tracking_account?.[0]?.account_name || ""
);
  // STEP 2: Search/Display states for UI
  setClientSearch(relation.client_name || "");
  setSourceSearch(relation.source || "");
  setTrackingSourceSearch(relation.tracking_source_name || "");
  setSelectedCommunications(relation.communication_id || [4]);

  // STEP 3: Sales Person
  const salesPersonId = relation.sales_person_id?.toString() || "";
  if (salesPersonId && employees1.length > 0) {
    const salesPerson = employees1.find(emp => emp.id == salesPersonId);
    setSalesPersonSearch(salesPerson?.employee_name || salesPerson?.name );
  }

  // STEP 4: Estimation Person + Toggle
  const estimationId = relation.project_estimation_by?.toString() || "";
  if (estimationId && employees1.length > 0) {
    const estimationPerson = employees1.find(emp => emp.id == estimationId);
    setEstimationSearch(estimationPerson?.employee_name || estimationPerson?.name || "");
    setSelectedEstimationEmployeeId(estimationId);
  }
  const salesId = relation.sales_person_id?.toString() || "";
  setUseSameForEstimation(salesId === estimationId);  // Auto-set toggle

  // STEP 5: Call Person + Toggle
  const callId = relation.project_call_by?.toString() || "183";
  if (callId && employees1.length > 0) {
    const callPerson = employees1.find(emp => emp.id == callId);
    setCallSearch(callPerson?.employee_name || callPerson?.name || "");
    setSelectedCallEmployeeId(callId);
  }
  setUseSameForCall(salesId === callId);  // Auto-set toggle

  // STEP 6: Assignees (FIXED - TL WILL SHOW)
const assignees = relation.assignees || [];

// ✅ PRIORITY PROCESSING (No duplicates)
const usedIds = new Set();
const managers = [];
const teamLeads = [];
const emps = [];

assignees.forEach(a => {
  if (usedIds.has(a.id)) return;
  
  const roles = a.role_names || []; // ARRAY ["TL"] or ["Project Manager", "TL"]
  
  // PRIORITY 1: Project Manager (takes precedence)
  if (roles.includes("Project Manager")) {
    managers.push({ id: a.id, name: a.name });
    usedIds.add(a.id);
    return;
  }
  
  // PRIORITY 2: TL
  if (roles.includes("TL")) {  // ✅ FIXED: includes() for ARRAY
    teamLeads.push({ id: a.id, name: a.name });
    usedIds.add(a.id);
    return;
  }
  
  // PRIORITY 3: Team
  if (roles.includes("Team")) {
    emps.push({ id: a.id, name: a.name });
    usedIds.add(a.id);
  }
});

setSelectedManagers(managers);     // 110, 190
setSelectedTeamLeaders(teamLeads); // 2 ✅ Sumeet Kumar (TL)
setSelectedEmployees(emps);        // 15, 16

console.log('✅ ASSIGNEES:', { managers, teamLeads, emps });


  
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

 useEffect(() => {
  console.log("🔍 Filtering sales persons... Total employees:", employees1?.length);

  if (!salesPersonSearch.trim()) {
    
    const allSalesPersons = employees1?.filter((employee) => {
      const role = (employee.roles || 
                   employee.role_name || 
                   employee.employee_role || 
                   employee.designation || 
                   employee.position || 
                   '').toString().toLowerCase();
      
     
      const salesKeywords = ['sales', 'sale', 'salesperson', 'sales person', 'salespersonnel'];
      const isSalesPerson = salesKeywords.some(keyword => role.includes(keyword));
      
      return isSalesPerson;
    }) || [];
    
    console.log("✅ Sales Persons found:", allSalesPersons.length, allSalesPersons);
    setFilteredSalesPerson(allSalesPersons);
    return;
  }

  const filtered = employees1?.filter((employee) => {
    
    const role = (employee.role || employee.role_name || employee.employee_role || employee.designation || '').toString().toLowerCase();
    const salesKeywords = ['sales', 'sale', 'salesperson', 'sales person'];
    const isSalesPerson = salesKeywords.some(keyword => role.includes(keyword));
    
    if (!isSalesPerson) return false;

   
    const name = (employee.employee_name || employee.name || '').toLowerCase();
    const id = (employee.employee_id || employee.id || '').toString().toLowerCase();
    const searchTerm = salesPersonSearch.toLowerCase().trim();

    return name.includes(searchTerm) || id.includes(searchTerm);
  }) || [];

  console.log("✅ Filtered sales persons:", filtered.length);
  setFilteredSalesPerson(filtered);
}, [salesPersonSearch, employees1]);


useEffect(() => {
  console.log("🔍 Filtering estimation employees...", employees1?.length);
  
  if (!estimationSearch.trim()) {
    setFilteredEstimationEmployees(employees1 || []);
    return;
  }
  
  const filtered = employees1?.filter(emp => 
    (emp.employee_name || emp.name || '').toLowerCase().includes(estimationSearch.toLowerCase().trim())
  ) || [];
  
  setFilteredEstimationEmployees(filtered);
}, [estimationSearch, employees1]);


useEffect(() => {
  console.log("🔍 Filtering estimation employees...", employees1?.length);
  
  if (!callSearch.trim()) {
    setFilteredCallEmployees(employees1 || []);
    return;
  }
  
  const filtered = employees1?.filter(emp => 
    (emp.employee_name || emp.name || '').toLowerCase().includes(callSearch.toLowerCase().trim())
  ) || [];
  
  setFilteredCallEmployees(filtered);
}, [callSearch, employees1]);


  
  
// useEffect(() => {
//   console.log("🔍 Filtering sales persons... search:", salesPersonSearch, "employees1:", employees1?.length);
  
//   if (!salesPersonSearch.trim()) {
//     console.log("No search term, showing all");
//     setFilteredSalesPerson(employees1 || []);
//     return;
//   }
  
//   const filtered = employees1?.filter((employee) => {
    
//     const name = (employee.employee_name || employee.name || '').toLowerCase();
//     const id = (employee.employee_id || employee.id || '').toString().toLowerCase();
//     const searchTerm = salesPersonSearch.toLowerCase().trim();
    
//     console.log(`Checking employee: ${name} | ID: ${id} | Search: ${searchTerm}`);
    
//     return name.includes(searchTerm) || id.includes(searchTerm);
//   }) || [];
  
//   console.log("Filtered result:", filtered.length);
//   setFilteredSalesPerson(filtered);
// }, [salesPersonSearch, employees1]);




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

  
 // ✅ FIXED: Deduplicate assignees
useEffect(() => {
  const allAssigneeIds = Array.from(new Set([
    ...selectedManagers.map(m => m.id),
    ...selectedTeamLeaders.map(tl => tl.id),
    ...selectedEmployees.map(e => e.id)
  ]));
  setFormData(prev => ({ ...prev, assignees: allAssigneeIds }));
}, [selectedManagers, selectedTeamLeaders, selectedEmployees]);


// ✅ SINGLE SOURCE OF TRUTH: Only sync when toggle ON
useEffect(() => {
  if (formData.use_same_source && formData.source_id && formData.account_id) {
    setFormData(prev => ({
      ...prev,
      tracking_source_id: formData.source_id,
      tracking_id: [formData.account_id]  // ✅ Always SINGLE array item
    }));
    setTrackingSourceSearch(sourceSearch);
  }
}, [formData.use_same_source, formData.source_id, formData.account_id]);


 
  useEffect(() => {
    const handleClickOutside = (event) => {
      setIsSalesPersonDropdownOpen(false)
      setEstimationCallDropdown(false)
      setEstimationPersonDropdown(false)

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
     fetchAccounts(1,100000);
    fetchEmployees();
    // fetchEmployees1();
     getActivityTags();
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
  setFormData(prev => ({ ...prev, sales_person_id: selectedId }));

  const selectedSalesPerson = employees1?.find(emp => emp.id === selectedId);
  if (selectedSalesPerson) {
    setSalesPersonSearch(selectedSalesPerson.employee_name || selectedSalesPerson.name);
  }

  // // Reset estimation toggle & values when sales person changes
  // setUseSameForEstimation(false);
  // setSelectedEstimationEmployeeId("");
  // setEstimationSearch("");

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
  setFormData(prev => ({
    ...prev,
    source_id: selectedId
    // ✅ NO account_id change - let user keep their selection
  }));
  
  const selectedSource = projectSources?.find(source => source.id === selectedId);
  if (selectedSource) {
    setSourceSearch(selectedSource.source_name);
  }
  
  setIsSourceDropdownOpen(false);
  // ✅ REMOVED: Don't clear account dropdown/accounts list
  // Let useEffect handle sourceAccounts filtering
};

  // ✅ Tracking source select
  const handleTrackingSourceSelect = (selectedId) => {
    setFormData((prev) => ({
      ...prev,
      tracking_source_id: selectedId,
      tracking_id: []
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
  setFormData(prev => {
    const currentIds = prev.tracking_id || [];
    const accountId = account.id;
    
    if (currentIds.includes(accountId)) {
      // Remove
      return {
        ...prev,
        tracking_id: currentIds.filter(id => id !== accountId)
      };
    } else {
      // Add
      return {
        ...prev,
        tracking_id: [...currentIds, accountId]
      };
    }
  });
  setIsTrackingSourceSubDropdownOpen(false);
};


const toggleTracking = () => {
  setFormData(prev => ({
    ...prev,
    is_tracking_enabled: !prev.is_tracking_enabled,
    project_tracking: prev.is_tracking_enabled ? "0" : "1",
    // ✅ DON'T CLEAR tracking_source_id when turning OFF
    ...(prev.is_tracking_enabled ? { 
      tracking_source_id: "", 
      tracking_id: []  // Array!
    } : {})
  }));
};


const toggleSameSource = () => {
  setFormData(prev => {
    const newSameSource = !prev.use_same_source;
    if (newSameSource) {
      // ✅ ON: Copy current source/account
      return {
        ...prev,
        use_same_source: true,
        tracking_source_id: prev.source_id || "",
        tracking_id: prev.account_id ? [prev.account_id] : []
      };
    } else {
      // ✅ OFF: Clear tracking fields
      return {
        ...prev,
        use_same_source: false,
        tracking_source_id: "",
        tracking_id: []
      };
    }
  });
};


const handleEstimationSelect = (selectedId) => {
  setSelectedEstimationEmployeeId(selectedId);
  setFormData(prev => ({ ...prev, project_estimation_by: selectedId }));
  
  const selectedEmp = employees1?.find(emp => emp.id === selectedId);
  if (selectedEmp) {
    setEstimationSearch(selectedEmp.employee_name || selectedEmp.name);
  }
  setEstimationPersonDropdown(false);
  
  // ✅ Let handleSubmit logic handle everything - cleaner!
};


  const handleCallSelect = (selectedId) => {
  setSelectedCallEmployeeId(selectedId);
  setFormData(prev => ({ ...prev, project_call_by: selectedId }));
  
  const selectedEmp = employees1?.find(emp => emp.id === selectedId);
  if (selectedEmp) {
    setCallSearch(selectedEmp.employee_name || selectedEmp.name);
  }
  
  setEstimationCallDropdown(false);
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
  if (!formData.tracking_source_id || !formData.tracking_id) {  // ✅ tracking_id
    showAlert({ variant: "warning", message: "Please select tracking source and account ID." });
    return;
  }
}
 const finalEstimationId = useSameForEstimation ? formData.sales_person_id : formData.project_estimation_by;
    
  const finalCallId = useSameForCall ? formData.sales_person_id : formData.project_call_by;
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
      assignees: finalAssignees,
      sales_person_id: formData.sales_person_id,
      project_tracking: formData.project_tracking,
      project_status: formData.is_tracking_enabled ? "In Progress" : "Fixed",
      project_description: formData.project_description,
      project_budget: formData.project_budget,
      project_hours: formData.project_hours,
      project_used_hours: formData.project_used_hours,
      project_used_budget: formData.project_used_budget,
      project_tag_activity: formData.project_tag_activity,
  project_estimation_by: finalEstimationId, 
    
    project_call_by:finalCallId,
      ...(formData.is_tracking_enabled && {
        is_tracking_enabled: formData.is_tracking_enabled,
        offline_hours: formData.offline_hours,
        tracking_source_id: formData.tracking_source_id,
        tracking_id: formData.tracking_id,
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
      project_estimation_by:"",
      project_call_by:"",
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
      tracking_id: [],
    });
    setSalesPersonSearch("")
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

const estimationRef = useRef(null);

useEffect(() => {
  const handleClickOutside = (event) => {
    if (estimationRef.current && !estimationRef.current.contains(event.target)) {
      setEstimationPersonDropdown(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);


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




              {/* Sales Person */}

              <div className="relative">
                <label htmlFor="salesPersonSearch" className="block font-medium text-gray-700 text-sm mb-2">
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
                    {filteredSalesPerson.map((employee) => {
                      const role = employee.roles || employee.role_name || employee.employee_role;
                      return (
                        <li
                          key={employee.id}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            handleSalesPersonSelect(employee.id);
                          }}
                          className="cursor-pointer px-3 py-2 hover:bg-blue-100 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium">{employee.employee_name || employee.name}</div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>ID: {employee.id}</span>
                            {role && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                {role}
                              </span>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
                
                {isSalesPersonDropdownOpen && filteredSalesPerson.length === 0 && (
                  <div className="absolute z-50 w-full mt-1 p-2 border border-gray-300 rounded-md bg-white shadow-lg">
                    <div className="text-xs text-gray-500 text-center">No sales persons found</div>
                  </div>
                  
                )}
                     {formData.sales_person_id && (
    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md text-sm">
      Selected: {salesPersonSearch} (ID: {formData.sales_person_id})
    </div>
  )}
          {formData.sales_person_id && (
  <>
    <label className="block font-medium text-gray-700 text-sm mb-3 mt-4">
      Estimation taken by same person?
    </label>

    <div className="flex items-center space-x-4 p-3 border border-gray-300 rounded-lg bg-gray-50">
      <div className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={useSameForEstimation}
          readOnly
        />
        <div
          onClick={toggleSameForEstimation}
          className="w-11 h-6 bg-gray-200 rounded-full
                     after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                     after:h-5 after:w-5 after:bg-white after:rounded-full after:transition-all
                     peer-checked:bg-green-600 peer-checked:after:translate-x-full"
        />
      </div>

      <span className="text-sm font-medium">
        {useSameForEstimation ? "YES" : "NO"}
      </span>
    </div>
  </>
)}
{formData.sales_person_id && !useSameForEstimation && (
  <div className="relative"  ref={estimationRef}>
    <label className="block font-medium text-gray-700 text-sm mb-2">
      Estimation taken by *
    </label>

    <input
      type="text"
      className="w-full p-2 border border-gray-300 rounded-md"
      placeholder="Search estimation person..."
      value={estimationSearch}
  onChange={(e) => {
    setEstimationSearch(e.target.value);
    // setEstimationPersonDropdown(true); // open dropdown on typing
  }}
  onFocus={() => setEstimationPersonDropdown(true)}   
   />

    {estimationPersonDropdown && filteredEstimationEmployees.length > 0 && (
      <ul className="absolute z-50 w-full mt-1 max-h-40 overflow-auto bg-white border rounded-md"   onMouseDown={(e) => e.stopPropagation()}>
        {filteredEstimationEmployees.map(emp => (
          <li
            key={emp.id}
  onMouseDown={(e) => {
        e.stopPropagation(); // ✅ stop bubbling
        handleEstimationSelect(emp.id);
      }}            className="cursor-pointer px-3 py-2 hover:bg-blue-100 border-b border-gray-100 last:border-b-0"
          >
 <div className="font-medium">{emp.employee_name || emp.name}</div>
          <div className="text-xs text-gray-500">ID: {emp.id}</div>          </li>
 
        ))}
      </ul>
    )}
      {selectedEstimationEmployeeId && (
    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md text-sm">
      Selected: {estimationSearch} (ID: {selectedEstimationEmployeeId})
    </div>
  )}
  </div>
)}
          {formData.sales_person_id && (
  <>
    <label className="block font-medium text-gray-700 text-sm mb-3 mt-4">
      Call taken by same person?
    </label>

    <div className="flex items-center space-x-4 p-3 border border-gray-300 rounded-lg bg-gray-50">
      <div className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={useSameForCall}
          readOnly
        />
        <div
          onClick={toggleSameForCall}
          className="w-11 h-6 bg-gray-200 rounded-full
                     after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                     after:h-5 after:w-5 after:bg-white after:rounded-full after:transition-all
                     peer-checked:bg-green-600 peer-checked:after:translate-x-full"
        />
      </div>

      <span className="text-sm font-medium">
        {useSameForCall ? "YES" : "NO"}
      </span>
    </div>
  </>
)}

              </div>
              {!isEditMode && (
              <>
  

              {formData.sales_person_id &&!useSameForCall && (
  <div className="relative">
  <label className="block font-medium text-gray-700 text-sm mb-2">
    Call taken by *
  </label>
  <input
    type="text"
    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
    placeholder="Search estimation person by name..."
    value={callSearch}
    onChange={(e) => setCallSearch(e.target.value)}
    onMouseDown={(e) => {
      e.stopPropagation();
      setEstimationCallDropdown(prev => !prev);
    }}
  />
  
  {estimationCallDropdown && filteredCallEmployees.length > 0 && (
    <ul className="absolute z-50 w-full mt-1 max-h-40 overflow-auto border border-gray-300 rounded-md bg-white shadow-lg"
        onMouseDown={(e) => e.stopPropagation()}>
      {filteredCallEmployees.map((employee) => (
        <li
          key={employee.id}
          onMouseDown={(e) => {
            e.stopPropagation();
            handleCallSelect(employee.id);
          }}
          className="cursor-pointer px-3 py-2 hover:bg-blue-100 border-b border-gray-100 last:border-b-0"
        >
          <div className="font-medium">{employee.employee_name || employee.name}</div>
          <div className="text-xs text-gray-500">ID: {employee.id}</div>
        </li>
      ))}
    </ul>
  )}
  
  {selectedCallEmployeeId && (
    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md text-sm">
      Selected: {callSearch} (ID: {selectedCallEmployeeId})
    </div>
  )}
</div>
              )}

</> 

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
                <label className="block font-medium text-gray-700 text-sm mb-1">
                  Activity Tag <span className="text-red-500">*</span>
                </label>

                {activityLoading ? (
                  <div className="p-4 text-center text-gray-500">Loading activity tags...</div>
                ) : activityTags.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 border border-gray-300 rounded-md">
                    No activity tags available
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-2 border border-gray-300 rounded-md max-h-48 overflow-y-auto">
                    {activityTags.map((activityTag) => (
                      <label
                        key={activityTag.id}
                        className="flex items-center p-2 border border-gray-200 rounded cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="radio"
                          name="project_tag_activity"
                          value={activityTag.id.toString()}
                          checked={formData.project_tag_activity == activityTag.id}
                          onChange={handleInputChange}
                          className="mr-2 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium">{activityTag.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
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
  {formData.tracking_id && formData.tracking_id.length > 0
    ? formData.tracking_id.length === 1
      ? `ID: ${formData.tracking_id[0]} (${getAccountDisplayNumber(
          trackingSourceAccounts.find(acc => acc.id === formData.tracking_id[0])
        )})`
      : `${formData.tracking_id.length} accounts selected`
    : `${trackingSourceAccounts.length || 0} accounts available`
  }
</span>

                        <span>▼</span>
                      </div>
                      {isTrackingSourceSubDropdownOpen && (
                        <ul
                         onMouseDown={(e) => e.stopPropagation()} 
                        className="absolute z-50 w-full mt-1 max-h-40 overflow-auto border border-gray-300 rounded-md bg-white shadow-lg">
                  {trackingSourceAccounts.map((account) => {
  const isSelected = formData.tracking_id?.includes(account.id) || false;
  return (
    <li key={account.id}
        className={`cursor-pointer px-3 py-2 hover:bg-blue-100 border-b border-gray-100 last:border-b-0 
          ${isSelected ? 'bg-green-100 border-l-4 border-green-400' : ''}`}
        onMouseDown={(e) => {
          e.stopPropagation();
          handleTrackingSourceSubSelect(account);
        }}
    >
      <div>{getAccountDisplayNumber(account)}</div>
      <div className={`text-xs mt-1 ${isSelected ? 'text-green-700 font-medium' : 'text-gray-500'}`}>
        ID: {account.id} {isSelected ? '✅' : ''}
      </div>
    </li>
  );
})}

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
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50"
          onClick={onCancel}
          >
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            ref={addModalRef}>
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

                <div className="relative">
                <label htmlFor="salesPersonSearch" className="block font-medium text-gray-700 text-sm mb-2">
                  Sales Person *
                </label>
                <input
                  id="salesPersonSearch"
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                    {filteredSalesPerson.map((employee) => {
                      
                      const role = employee.roles || employee.role_name || employee.employee_role;
                      return (
                        <li
                          key={employee.id}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            handleSalesPersonSelect(employee.id);
                          }}
                          className="cursor-pointer px-3 py-2 hover:bg-purple-100 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium">{employee.employee_name || employee.name}</div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>ID: {employee.id}</span>
                            {role && (
                              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                                {role}
                              </span>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
                
                {isSalesPersonDropdownOpen && filteredSalesPerson.length === 0 && (
                  <div className="absolute z-50 w-full mt-1 p-2 border border-gray-300 rounded-md bg-white shadow-lg">
                    <div className="text-xs text-gray-500">No sales persons found</div>
                  </div>
                )}
                
                {/*  SELECTED SALES PERSON DISPLAY - Same as before */}
                {formData.sales_person_id && salesPersonSearch && (
                  <div className="mt-2 flex items-center gap-2 bg-purple-100 text-purple-800 px-3 py-2 rounded-md text-sm border">
                    <span className="font-medium">{salesPersonSearch}</span>
                    <span className="text-xs bg-purple-200 px-2 py-1 rounded-full">
                      ID: {formData.sales_person_id}
                    </span>
                  </div>
                )}
   
    {formData.sales_person_id && (
  <>
    <label className="block font-medium text-gray-700 text-sm mb-3 mt-4">
      Estimation taken by same person?
    </label>

    <div className="flex items-center space-x-4 p-3 border border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all">
      <div className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={useSameForEstimation}
          readOnly
        />
        <div
          onClick={toggleSameForEstimation}  // ✅ Always clickable
          className={`w-11 h-6 bg-gray-200 rounded-full peer-focus:ring-4 peer-focus:ring-blue-300
                     after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                     after:h-5 after:w-5 after:bg-white after:rounded-full after:transition-all
                     peer-checked:bg-green-600 peer-checked:after:translate-x-full`}
        />
      </div>
      <span className="text-sm font-medium">{useSameForEstimation ? "YES" : "NO"}</span>
    </div>
  </>
)}




{formData.sales_person_id && !useSameForEstimation && (
  <div className="relative" ref={estimationRef}>
    <label className="block font-medium text-gray-700 text-sm mb-2">
      Estimation taken by *
    </label>

    <input
      type="text"
      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
      placeholder="Search estimation person..."
      value={estimationSearch}
      onChange={(e) => setEstimationSearch(e.target.value)}
      onFocus={() => setEstimationPersonDropdown(true)}
    />

    {estimationPersonDropdown && filteredEstimationEmployees.length > 0 && (
      <ul 
        className="absolute z-50 w-full mt-1 max-h-40 overflow-auto bg-white border rounded-md shadow-lg"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {filteredEstimationEmployees.map(emp => (
          <li
            key={emp.id}
            onMouseDown={(e) => {
              e.stopPropagation();
              handleEstimationSelect(emp.id);
            }}
            className="cursor-pointer px-3 py-2 hover:bg-blue-100 border-b border-gray-100 last:border-b-0"
          >
            <div className="font-medium">{emp.employee_name || emp.name}</div>
            <div className="text-xs text-gray-500">ID: {emp.id}</div>
          </li>
        ))}
      </ul>
    )}

    {selectedEstimationEmployeeId && (
      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md text-sm">
        Selected: {estimationSearch} (ID: {selectedEstimationEmployeeId})
      </div>
    )}
  </div>
)}


        {formData.sales_person_id && (
  <>
    <label className="block font-medium text-gray-700 text-sm mb-3 mt-4">
      Call taken by same person?
    </label>

    <div className="flex items-center space-x-4 p-3 border border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all">
      <div className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={useSameForCall}
          readOnly
        />
        <div
          onClick={toggleSameForCall}  // ✅ Always clickable
          className={`w-11 h-6 bg-gray-200 rounded-full peer-focus:ring-4 peer-focus:ring-blue-300
                     after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                     after:h-5 after:w-5 after:bg-white after:rounded-full after:transition-all
                     peer-checked:bg-green-600 peer-checked:after:translate-x-full`}
        />
      </div>
      <span className="text-sm font-medium">{useSameForCall ? "YES" : "NO"}</span>
    </div>
  </>
)}


           </div>
{formData.sales_person_id && !useSameForCall && (
  <div className="relative">
    <label className="block font-medium text-gray-700 text-sm mb-2">
      Call taken by *
    </label>

    <input
      type="text"
      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
      placeholder="Search call person by name..."
      value={callSearch}
      onChange={(e) => setCallSearch(e.target.value)}
      onMouseDown={(e) => {
        e.stopPropagation();
        setEstimationCallDropdown(prev => !prev);
      }}
    />

    {estimationCallDropdown && filteredCallEmployees.length > 0 && (
      <ul 
        className="absolute z-50 w-full mt-1 max-h-40 overflow-auto border border-gray-300 rounded-md bg-white shadow-lg"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {filteredCallEmployees.map((employee) => (
          <li
            key={employee.id}
            onMouseDown={(e) => {
              e.stopPropagation();
              handleCallSelect(employee.id);
            }}
            className="cursor-pointer px-3 py-2 hover:bg-blue-100 border-b border-gray-100 last:border-b-0"
          >
            <div className="font-medium">{employee.employee_name || employee.name}</div>
            <div className="text-xs text-gray-500">ID: {employee.id}</div>
          </li>
        ))}
      </ul>
    )}

    {selectedCallEmployeeId && (
      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md text-sm">
        Selected: {callSearch} (ID: {selectedCallEmployeeId})
      </div>
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
                <label className="block font-medium text-gray-700 text-sm mb-1">
                  Activity Tag <span className="text-red-500">*</span>
                </label>
                
                {activityLoading ? (
                  <div className="flex items-center justify-center p-4 text-gray-500 bg-gray-50 border border-gray-300 rounded-md">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Loading activity tags...
                  </div>
                ) : activityTags.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 border border-gray-300 rounded-md bg-gray-50">
                    No activity tags available
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 p-3 border border-gray-300 rounded-md max-h-52 overflow-y-auto">
                    {activityTags.map((activityTag) => (
                      <label 
                        key={activityTag.id}
                        className="flex items-center p-2.5 border border-gray-200 rounded-md cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-all group"
                      >
                        <input 
                          type="radio" 
                          name="project_tag_activity" 
                          value={activityTag.id}
                          checked={formData.project_tag_activity == activityTag.id}
                          onChange={handleInputChange}
                          className="mr-3 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2 shrink-0"
                        />
                        <span className="text-sm font-medium text-gray-800 group-hover:text-blue-800">
                          {activityTag.name}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              





              
              {/* <div>
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
              </div> */}

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
  {formData.tracking_id && formData.tracking_id.length > 0
    ? formData.tracking_id.length === 1
      ? `ID: ${formData.tracking_id[0]} (${getAccountDisplayNumber(
          trackingSourceAccounts.find(acc => acc.id === formData.tracking_id[0])
        )})`
      : `${formData.tracking_id.length} accounts selected`
    : `${trackingSourceAccounts.length || 0} accounts available`
  }
</span>

                        <span>▼</span>
                      </div>
                      {isTrackingSourceSubDropdownOpen && (
                        <ul
                        onMouseDown={(e) => e.stopPropagation()} 
                        className="absolute z-50 w-full mt-1 max-h-40 overflow-auto border border-gray-300 rounded-md bg-white shadow-lg">
                      {trackingSourceAccounts.map((account) => {
  const isSelected = formData.tracking_id?.includes(account.id) || false;
  return (
    <li key={account.id}
        className={`cursor-pointer px-3 py-2 hover:bg-blue-100 border-b border-gray-100 last:border-b-0 
          ${isSelected ? 'bg-green-100 border-l-4 border-green-400' : ''}`}
        onMouseDown={(e) => {
          e.stopPropagation();
          handleTrackingSourceSubSelect(account);
        }}
    >
      <div>{getAccountDisplayNumber(account)}</div>
      <div className={`text-xs mt-1 ${isSelected ? 'text-green-700 font-medium' : 'text-gray-500'}`}>
        ID: {account.id} {isSelected ? '✅' : ''}
      </div>
    </li>
  );
})}

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






