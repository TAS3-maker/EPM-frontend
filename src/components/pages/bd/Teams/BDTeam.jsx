import React, { useState, useEffect } from "react"; 
import { useTeams } from "../../../context/BDTeamContext";
import { Loader2, Users, Mail, Phone, Building2, BarChart, Search } from "lucide-react"; 
import { SectionHeader } from '../../../components/SectionHeader';


import { useDepartment } from "../../../context/DepartmentContext";
import { useTeam } from "../../../context/TeamContext"; 
import {Teams} from "../../superadmin/Teams/Teams";
import { ExportButton, ClearButton, IconEditButton, IconDeleteButton, IconSaveButton, IconCancelTaskButton } from "../../../AllButtons/AllButtons";
import { exportToExcel } from "../../../components/excelUtils";
import { usePMContext } from "../../../context/PMContext";
import { useEmployees } from "../../../context/EmployeeContext";
import { API_URL } from "../../../utils/ApiConfig";
import { useAlert } from "../../../context/AlertContext";

 
const TeamSection = ({
  team,
  filteredUsers,
  editingTeamId,
  setEditingTeamId,
  newName,
  setNewName,
  handleUpdate,
  setDeleteConfirmTeamId,
  setEditDepartmentId,
  setOldTL,
  setOldTLId,
  setSelectedTL,
  setShowRMModal
}) => {
  const getProjectManagers = (team) => {
    if (!team?.tls) return [];
    
    const pms = [];
    team.tls.forEach(tl => {
      tl.employees?.forEach(emp => {
        const roles = emp.roles || emp.role || [];
        const rolesArray = Array.isArray(roles) ? roles : [roles];
        
        if (rolesArray.some(role => 
          role.toLowerCase().includes('project manager') || 
          role.toLowerCase() === 'pm'
        )) {
          if (!pms.some(pm => pm.id === emp.id)) {
            pms.push({
              id: emp.id,
              name: emp.name
            });
          }
        }
      });
    });
    return pms;
  };

  const projectManagers = getProjectManagers(team);
  const currentTLId = team.employees?.[0]?.tl_id;
  
  return (
    <div className="mt-3 bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200/80">
      <div className="px-6 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200/80">
        <div className="flex items-center justify-between flex-wrap gap-2">
  
  {/* LEFT SIDE (Team + TL + PM) */}
  <h3 className="text-sm font-semibold text-gray-800 flex flex-wrap gap-3 items-center">
    <Building2 className="w-4 h-4 text-blue-600" />
    {team.name}

{team.tls?.map(tl => {
  const isActiveTL = Number(tl.id) === Number(currentTLId);

  return (
    <span
      key={tl.id}
      className={`text-[11px] sm:text-[12px] font-medium px-2 py-0.5 sm:py-1 rounded-full transition-all ${
        isActiveTL
          ? "bg-blue-100 text-blue-700 border border-blue-300 font-semibold shadow-sm"
          : "bg-gray-50 text-gray-500 border border-gray-200"
      }`}
    >
      TL: {tl.name}
    </span>
  );
})}

    {projectManagers.map(pm => (
      <span
        key={pm.id}
        className="text-[11px] sm:text-[12px] font-medium text-emerald-700 bg-[#d1fae5c2] px-2 py-0.5 sm:py-1 rounded-full"
      >
        PM: {pm.name}
      </span>
    ))}
  </h3>

  {/* RIGHT SIDE ACTIONS 🔥 */}
  <div className="flex items-center gap-2">


<button
  onClick={() => setShowRMModal(true)}
  className="px-3 py-1 text-xs bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
>
  Change RM
</button>




    {editingTeamId === team.id ? (
      <>
        <IconSaveButton onClick={() => handleUpdate(team.id)} />
        
        <IconCancelTaskButton
          onClick={() => {
            setEditingTeamId(null);
            setNewName("");
            setEditDepartmentId("");
          }}
        />
      </>
    ) : (
      <>
        <IconEditButton onClick={() => {
          setEditingTeamId(team.id);
          setNewName(team.name);
          setEditDepartmentId(team.department_id || "");
          const firstEmp = team.employees?.[0];

setOldTL(firstEmp?.tl_name || "");
setOldTLId(firstEmp?.tl_id || "");
setSelectedTL(firstEmp?.tl_id || "");
        }} />

        <IconDeleteButton onClick={() => setDeleteConfirmTeamId(team.id)} />
      </>
    )}

  </div>
</div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/80 whitespace-nowrap">
              <th className="px-8 py-4 text-[11px] font-semibold uppercase">User Name</th>
              <th className="px-8 py-4 text-[11px] font-semibold uppercase">Email</th>
              <th className="px-8 py-4 text-[11px] font-semibold uppercase">Phone</th>
              <th className="px-8 py-4 text-[11px] font-semibold uppercase">Team Lead</th>
              <th className="px-8 py-4 text-[11px] font-semibold uppercase">Reporting Manager</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 whitespace-nowrap">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-8 py-5 text-center text-gray-500 text-sm">
                  No users found matching your search.
                </td>
              </tr>
            ) : (
              filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-blue-50/50">
                  <td className="px-8 py-4 text-[10px] font-medium">
                    <div className="flex items-center justify-center">
                      <Users className="w-3 h-3 mr-2 text-gray-400" />
                      {user.name}
                    </div>
                  </td>
                  <td className="px-8 py-4 text-[10px]">
                    <div className="flex items-center justify-center">
                      <Mail className="w-3 h-3 inline mr-2 text-gray-400" />
                      <a href={`mailto:${user.email}`}>{user.email}</a>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-[10px]">
                    <div className="flex items-center justify-center">
                      <Phone className="w-3 h-3 inline mr-2 text-gray-400" />
                      {user.phone_num || "N/A"}
                    </div>
                  </td>
                  <td className="px-8 py-4 text-[10px] text-gray-600">
                    <div className="flex items-center justify-center">
                      {user.tlName}
                    </div>
                  </td>
                  <td className="px-8 py-4 text-[10px] text-gray-600">
                    <div className="flex items-center justify-center">
                      {user.reporting_manager_name}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};



export const BDTeam = () => {
  const { teams,setTeams, loading, fetchTeams: fetchBDTeams, updateUsersRM } = useTeams();
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);

  const { teams: crudTeams, fetchTeams, deleteTeam, updateTeam } = useTeam();

const [editingTeamId, setEditingTeamId] = useState(null);
const [newName, setNewName] = useState("");
const [deleteConfirmTeamId, setDeleteConfirmTeamId] = useState(null);

const [teamSearch, setTeamSearch] = useState("");
const [userSearch, setUserSearch] = useState("");

const [editDepartmentId, setEditDepartmentId] = useState("");

const { department, fetchDepartment } = useDepartment();

const { teamleaders } = usePMContext();

const [selectedTL, setSelectedTL] = useState("");
const [oldTL, setOldTL] = useState("");
const [oldTLId, setOldTLId] = useState("");


const { fetchAllEmployees, employees1 } = useEmployees();

const [showRMModal, setShowRMModal] = useState(false);
const [rmSearch, setRmSearch] = useState("");
const [selectedRM, setSelectedRM] = useState(null);

const [userMultiSearch, setUserMultiSearch] = useState("");
const [selectedUsers, setSelectedUsers] = useState([]);

const [showDropdown, setShowDropdown] = useState(false);

const { showAlert } = useAlert();




useEffect(() => {
  fetchDepartment();
}, []);
  useEffect(() => {
    if (teams.length > 0 && !selectedTeam) {
      setSelectedTeam(teams[0]);
      console.log(teams);
    }
  }, [teams, selectedTeam]);

useEffect(() => {
  if (!selectedTeam) {
    setFilteredUsers([]);
    return;
  }

  const allEmployees = getAllEmployees(selectedTeam);
  const q = userSearch.toLowerCase();

  const filtered = allEmployees.filter(user =>
    user.name.toLowerCase().includes(q) ||
    user.email.toLowerCase().includes(q) ||
    (user.phone_num && user.phone_num.includes(q))
  );

  setFilteredUsers(filtered);
}, [selectedTeam, userSearch]);


const getAllEmployees = (team) => {
  if (!team?.employees) return [];

  const leadershipRoles = [
    'project manager',
    'tl',
    'team lead',
    'teamlead',
    'pm'
  ];

  return team.employees
    .filter(emp => {
      const roles = emp.roles || emp.role || [];
      const rolesArray = Array.isArray(roles) ? roles : [roles];

     
      const isLeadership = rolesArray.some(role =>
        leadershipRoles.includes(role.toLowerCase().trim())
      );

      return !isLeadership;
    })
    .map(emp => ({
      ...emp,
      tlName: emp.tl_name,  
      tlId: emp.tl_id,
    }));
};


const handleUpdate = async (teamId) => {
  if (!newName.trim()) return;

  let payload = {
    name: newName,
    department_id: Number(editDepartmentId),
  };

 
  if (selectedTL && Number(selectedTL) !== Number(oldTLId)) {
    payload.old_tl_id = Number(oldTLId);
    payload.new_tl_id = Number(selectedTL);
  }

  console.log("FINAL PAYLOAD 🚀", payload);

  const res = await updateTeam(teamId, payload);

  if (res?.success) {
    await fetchTeams();
    await fetchBDTeams();

    setSelectedTeam(prev => {
      if (!prev) return null;

  
      if (payload.new_tl_id) {
        const selectedTLData = teamleaders.find(
          tl => tl.id === Number(selectedTL)
        );

        return {
          ...prev,
          name: newName,
          department_id: editDepartmentId,
          employees: prev.employees.map(emp => ({
            ...emp,
            tl_id: Number(selectedTL),
            tl_name: selectedTLData?.name || emp.tl_name
          }))
        };
      }

      return {
        ...prev,
        name: newName,
        department_id: editDepartmentId
      };
    });
  }

  // reset
  setEditingTeamId(null);
  setNewName("");
  setEditDepartmentId("");
  setSelectedTL("");
  setOldTL("");
  setOldTLId("");
};



useEffect(() => {
  if (teams.length === 0) {
    setSelectedTeam(null);
    return;
  }

  setSelectedTeam(prev => {
    const exists = teams.find(t => t.id === prev?.id);
    return exists || teams[0];
  });
}, [teams]);



const handleUpdateRM = async () => {
  if (!selectedRM || selectedUsers.length === 0) {
    showAlert({
      variant: "error",
      title: "Error",
      message: "Please select RM and users",
    });
    return;
  }

  const payload = {
    new_rm_id: selectedRM.id,
    users: selectedUsers.map(u => u.id).join(",")
  };


  const res = await updateUsersRM(payload);

  if (!res.success) {
     showAlert({
      variant: "error",
      title: "Error",
      message: res.message || "Something went wrong ❌",
    });
    return;
  }

  showAlert({
    variant: "success",
    title: "Success",
    message: "RM Updated Successfully",
  });

  setShowRMModal(false);
  setSelectedUsers([]);
  setSelectedRM(null);

  fetchBDTeams();
};



const filteredRM = employees1.filter(emp =>
  emp.name.toLowerCase().includes(rmSearch.toLowerCase())
);

const teamUsers = getAllEmployees(selectedTeam);

const filteredTeamUsers = teamUsers.filter(emp =>
  emp.name.toLowerCase().includes(userMultiSearch.toLowerCase())
);

const toggleUserSelect = (user) => {
  setSelectedUsers(prev => {
    const exists = prev.find(u => u.id === user.id);
    if (exists) {
      return prev.filter(u => u.id !== user.id);
    } else {
      return [...prev, user];
    }
  });
};

useEffect(() => {
  if (showRMModal) {
    fetchAllEmployees();
    setSelectedRM(null);
    setSelectedUsers([]);
    setRmSearch("");
  }
}, [showRMModal]);


const handleCloseRMModal = () => {
  setShowRMModal(false);
  setSelectedRM(null);
  setSelectedUsers([]);
  setRmSearch("");
};

const handleCloseDropdown = () => {
  if (!selectedRM) {
    setRmSearch("");
  } else {
    setRmSearch(selectedRM.name);
  }
};

useEffect(() => {
  const handleClickOutside = (e) => {
    if (!e.target.closest(".rm-dropdown")) {
      setShowDropdown(false);
    }
  };

  document.addEventListener("click", handleClickOutside);

  return () => {
    document.removeEventListener("click", handleClickOutside);
  };
}, []);


  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-lg h-[calc(100vh-20px)] flex flex-col overflow-y-auto">
      <SectionHeader icon={BarChart} title="Team Management" subtitle="Overview of Teams and Their Members" />



<div className="flex flex-wrap items-center justify-between gap-4 p-2 bg-white shadow-md">

  {/* ADD TEAM BUTTON */}
  <Teams />

  {/* SEARCH + ACTIONS */}
  <div className="flex items-center gap-3 border p-2 rounded-lg shadow-md bg-white">
    
    <div className="flex items-center border border-gray-300 px-2 rounded-lg">
      <Search className="h-5 w-5 text-gray-400 mr-1" />
      <input
        type="text"
        className="w-full focus:outline-none py-1.5 text-sm"
        placeholder="Search team..."
        value={teamSearch}
        onChange={(e) => setTeamSearch(e.target.value)}
      />
    </div>

    <ClearButton onClick={() => setTeamSearch("")} />

    <ExportButton
      onClick={() => {
        const cleanedData = teams.map(({ users, ...rest }) => rest);
        exportToExcel(cleanedData, "teams.xlsx");
      }}
    />
  </div>
</div>





      <div className="p-2 sm:p-5">
        {/* Team Selection Buttons */}
        <div className="flex flex-wrap gap-2 mb-3">
  {teams
    .filter(t => t.name.toLowerCase().includes(teamSearch.toLowerCase()))
    .map((team) => (
      <div key={team.id} className="flex items-center gap-1">

        {/* TEAM BUTTON */}
        <button
          className={`px-4 py-2 rounded-lg text-xs font-medium ${
            selectedTeam?.id === team.id
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => {
            setSelectedTeam(team);
            setUserSearch("");
          }}
        >
           {team.name} 
        </button>
      </div>
  ))}
</div>

        {loading ? (
          <div className="py-16 text-center">
            <div className="flex items-center justify-center space-x-3 bg-white rounded-xl shadow-sm py-6 px-8 inline-block">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="text-gray-700 font-medium">Loading teams...</span>
            </div>
          </div>
        ) : selectedTeam ? (
          <>
            {/* Search Input Field for Users within the Selected Team */}
            <div className="flex items-center w-full max-w-md border border-gray-300 px-2 py-0 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 mb-3">
              <Search className="h-5 w-5 text-gray-400 mr-[5px]" />
              <input
                type="text"
                className="w-full rounded-lg focus:outline-none py-1.5 text-sm"
                placeholder={`Search users in ${selectedTeam.name}...`}
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>
            <TeamSection 
              team={selectedTeam} 
              filteredUsers={filteredUsers}
              editingTeamId={editingTeamId}
              setEditingTeamId={setEditingTeamId}
              newName={newName}
              setNewName={setNewName}
              handleUpdate={handleUpdate}
              setDeleteConfirmTeamId={setDeleteConfirmTeamId}
              setEditDepartmentId={setEditDepartmentId}

               setOldTL={setOldTL}
                setOldTLId={setOldTLId}
                setSelectedTL={setSelectedTL}
                setShowRMModal={setShowRMModal}
            /> {/* Pass filteredUsers */}
          </>
        ) : (
          <div className="py-16 text-center">
            <p className="text-gray-600 font-medium">Select a team to view details</p>
            {teams.length === 0 && !loading && ( // Message if no teams are loaded at all
                <p className="mt-2 text-sm text-gray-500">No teams available to display.</p>
            )}
          </div>
        )}
      </div>


{showRMModal && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"  onClick={handleCloseRMModal} >
    <div className="bg-white p-6 rounded-xl w-[400px]"
       onClick={(e) => {
          e.stopPropagation();
          handleCloseDropdown();
        }}
     >

      <h2 className="text-lg font-semibold mb-3">Change Reporting Manager</h2>

      {/* RM SEARCH INPUT */}
      <div className="mb-3 relative rm-dropdown">
       <input
          type="text"
          placeholder="Select Reporting Manager..."
          value={rmSearch}
          onChange={(e) => setRmSearch(e.target.value)}
          onClick={() => setShowDropdown(prev => !prev)} // toggle open/close
          className="w-full border px-3 py-2 rounded"
        />

       {showDropdown && (
          <div className="absolute w-full bg-white border rounded mt-1 max-h-40 overflow-y-auto z-10">
            {filteredRM.map(emp => (
              <div
                key={emp.id}
                onClick={() => {
                  setSelectedRM(emp);
                  setRmSearch(emp.name);
                  setShowDropdown(false); // close after select
                }}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
              >
                {emp.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SELECTED RM */}
      {selectedRM && (
        <div className="mb-3 text-sm text-green-600">
          Selected RM: {selectedRM.name}
        </div>
      )}

    

      {/* TEAM USERS LIST */}
      <div className="max-h-40 overflow-y-auto border rounded mb-3">
        {teamUsers.map(user => (
          <div
            key={user.id}
            onClick={() => toggleUserSelect(user)}
            className={`px-3 py-2 cursor-pointer flex justify-between ${
              selectedUsers.some(u => u.id === user.id)
                ? "bg-green-100"
                : "hover:bg-gray-100"
            }`}
          >
           {/* LEFT SIDE (Name + RM) */}
           <div className="flex justify-between w-full">
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user.name}</span>

              <span className="text-[10px] text-gray-500">
                RM: {user.reporting_manager_name || "N/A"}
              </span>
            </div>

            {/* RIGHT SIDE (Check) */}
            {selectedUsers.some(u => u.id === user.id) && (
              <span className="text-green-600 font-bold">✔</span>
            )}
            </div>
          </div>
        ))}
      </div>

      {/* BUTTONS */}
      <div className="flex justify-end gap-2">
        <button
          onClick={handleCloseRMModal}
          className="px-3 py-1 bg-gray-200 rounded"
        >
          Cancel
        </button>

        <button
          onClick={handleUpdateRM}
          className="px-3 py-1 bg-blue-600 text-white rounded"
        >
          Update RM
        </button>
      </div>

    </div>
  </div>
)}





{editingTeamId && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => {
    setEditingTeamId(null);
    setNewName("");
  }} >
    <div className="bg-white p-6 rounded-xl w-[320px]" onClick={(e) => e.stopPropagation()}>

      <h2 className="text-lg font-semibold mb-3">Edit Team</h2>

      <input
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
        className="w-full border px-3 py-2 rounded mb-3"
      />

      <select
  value={editDepartmentId}
  onChange={(e) => setEditDepartmentId(e.target.value)}
  className="w-full border px-3 py-2 rounded mb-3"
>
  <option value="">Select Department</option>
  {department?.map((dep) => (
    <option key={dep.id} value={dep.id}>
      {dep.name}
    </option>
  ))}
</select>

{/* OLD TL */}
<div className="mb-3">
  <label className="block text-sm font-medium mb-1">Old TL</label>
  <input
    value={oldTL}
    disabled
    className="w-full border px-3 py-2 rounded bg-gray-100"
  />
</div>

{/* NEW TL DROPDOWN */}
<div className="mb-3">
  <label className="block text-sm font-medium mb-1">Set New TL</label>
  <select
    value={selectedTL}
    onChange={(e) => setSelectedTL(e.target.value)}
    className="w-full border px-3 py-2 rounded"
  >
    <option value="">Select TL</option>
    {selectedTeam?.tls?.map((tl) => (
      <option key={tl.id} value={tl.id}>
        {tl.name}
      </option>
    ))}
  </select>
</div>



      <div className="flex justify-end gap-2">
        <button
          onClick={() => {
            setEditingTeamId(null);
            setNewName("");
          }}
          className="px-3 py-1 bg-gray-200 rounded"
        >
          Cancel
        </button>

        <button
  onClick={() => handleUpdate(editingTeamId)}
  className="px-3 py-1 bg-blue-600 text-white rounded"
>
  Save
</button>
      </div>
    </div>
  </div>
)}


{deleteConfirmTeamId && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setDeleteConfirmTeamId(null)}>
    <div className="bg-white p-6 rounded-xl shadow-lg" onClick={(e) => e.stopPropagation()} >
      <p className="mb-4">Are you sure you want to delete this team?</p>

      <div className="flex gap-2 justify-end">
        <button
          onClick={() => setDeleteConfirmTeamId(null)}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Cancel
        </button>

        <button
          onClick={async () => {
            await deleteTeam(deleteConfirmTeamId);
            setDeleteConfirmTeamId(null);
            await fetchTeams();
            await fetchBDTeams();

            // 🔥 THIS IS THE MAIN FIX
            setSelectedTeam(prev => {
              const remainingTeams = teams.filter(t => t.id !== deleteConfirmTeamId);
              return remainingTeams.length > 0 ? remainingTeams[0] : null;
            });
          }}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}



    </div>
  );
};

export default BDTeam;
