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
  setSelectedTL
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
  
  return (
    <div className="mt-3 bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200/80">
      <div className="px-6 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200/80">
        <div className="flex items-center justify-between flex-wrap gap-2">
  
  {/* LEFT SIDE (Team + TL + PM) */}
  <h3 className="text-sm font-semibold text-gray-800 flex flex-wrap gap-3 items-center">
    <Building2 className="w-4 h-4 text-blue-600" />
    {team.name}

    {team.tls?.map(tl => (
      <span
        key={tl.id}
        className="text-[12px] font-medium text-gray-600 bg-blue-100 px-2 py-1 rounded-full"
      >
        TL: {tl.name}
      </span>
    ))}

    {projectManagers.map(pm => (
      <span
        key={pm.id}
        className="text-[12px] font-medium text-emerald-700 bg-[#d1fae5c2] px-2 py-1 rounded-full"
      >
        PM: {pm.name}
      </span>
    ))}
  </h3>

  {/* RIGHT SIDE ACTIONS 🔥 */}
  <div className="flex items-center gap-2">

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

          // const firstTL = team.tls?.[0]; 
          // setOldTL(firstTL?.name || "");
          // setOldTLId(firstTL?.id || ""); 
          // setSelectedTL(firstTL?.id || "");
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
            <tr className="bg-gray-50/80">
              <th className="px-8 py-4 text-xs font-semibold uppercase">User Name</th>
              <th className="px-8 py-4 text-xs font-semibold uppercase">Email</th>
              <th className="px-8 py-4 text-xs font-semibold uppercase">Phone</th>
              <th className="px-8 py-4 text-xs font-semibold uppercase">Team Lead</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-8 py-5 text-center text-gray-500 text-sm">
                  No users found matching your search.
                </td>
              </tr>
            ) : (
              filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-blue-50/50">
                  <td className="px-8 py-4 text-xs font-medium">
                    <div className="flex items-center justify-center">
                      <Users className="w-3 h-3 mr-2 text-gray-400" />
                      {user.name}
                    </div>
                  </td>
                  <td className="px-8 py-4 text-xs">
                    <div className="flex items-center justify-center">
                      <Mail className="w-3 h-3 inline mr-2 text-gray-400" />
                      <a href={`mailto:${user.email}`}>{user.email}</a>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-xs">
                    <div className="flex items-center justify-center">
                      <Phone className="w-3 h-3 inline mr-2 text-gray-400" />
                      {user.phone_num || "N/A"}
                    </div>
                  </td>
                  <td className="px-8 py-4 text-xs text-gray-600">
                    <div className="flex items-center justify-center">
                      {user.tlName}
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
  const { teams,setTeams, loading, fetchTeams: fetchBDTeams } = useTeams();
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


//   const getAllEmployees = (team) => {
//   if (!team?.tls) return [];

//   return team.tls.flatMap(tl =>
//     tl.employees.map(emp => ({
//       ...emp,
//       tlName: tl.name,
//       tlId: tl.id,
//     }))
//   );
// };






// const getAllEmployees = (team) => {
//   if (!team?.tls) return [];

//   const tlNames = team.tls.map(tl => tl.name.toLowerCase());

//   const leadershipRoles = [
//     'Project Manager',
//     'project manager',
//     'TL', 
//     'team lead', 
//     'teamlead',
//     'pm'
//   ];

//   return team.tls.flatMap(tl =>
//     tl.employees
//       .filter(emp => {
//         const isTL = tlNames.includes(emp.name.toLowerCase());
        
//         const roles = emp.roles || emp.role || [];
//         const rolesArray = Array.isArray(roles) ? roles : [roles];
        
//         const hasLeadershipRole = rolesArray.some(role => 
//           leadershipRoles.includes(role.toLowerCase().trim())
//         );
        
//         return !isTL && !hasLeadershipRole;
//       })
//       .map(emp => ({
//         ...emp,
//         tlName: tl.name,
//         tlId: tl.id,
//       }))
//   );
// };



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






// const handleUpdate = async (teamId) => {
//   if (!newName.trim()) return;

  
//   const res = await updateTeam(teamId, newName, editDepartmentId);

//   if (res?.success) {
    
//     await fetchTeams();     
//     await fetchBDTeams();   

//     setSelectedTeam(prev => {
//       if (!prev) return null;
//       return {
//         ...prev,
//         name: newName,
//         department_id: editDepartmentId
//       };
//     });
//   }


//   setEditingTeamId(null);
//   setNewName("");
//   setEditDepartmentId("");
// };



const handleUpdate = async (teamId) => {
  if (!newName.trim()) return;

  const payload = {
    old_tl_id: Number(oldTLId),     // 👈 OLD TL
    new_tl_id: Number(selectedTL),  // 👈 NEW TL
    name: newName,
    department_id: Number(editDepartmentId),
  };

  console.log("PAYLOAD 🔥", payload);

  const res = await updateTeam(teamId, payload);

  // if (res?.success) {
  //   await fetchTeams();
  //   await fetchBDTeams();

  //   setSelectedTeam(prev => {
  //     if (!prev) return null;
  //     return {
  //       ...prev,
  //       name: newName,
  //       department_id: editDepartmentId
  //     };
  //   });
  // }

if (res?.success) {
  await fetchTeams();
  await fetchBDTeams();

  setSelectedTeam(prev => {
    if (!prev) return null;

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



// const handleUpdate = async (teamId) => {
//   if (!newName.trim()) return;

//   await updateTeam(teamId, newName, editDepartmentId);

//   await fetchTeams();     
//   await fetchBDTeams();    

//   setEditingTeamId(null);
//   setNewName("");
//   setEditDepartmentId("");
// };





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





      <div className="p-5">
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
    {teamleaders.map((tl) => (
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
