import React, { useEffect, useMemo, useState } from "react";
import { useTeam } from "../../../context/TeamContext";
import { Loader2, BarChart, Search } from "lucide-react";
import { exportToExcel } from "../../../components/excelUtils";
import { Teams } from "./Teams";
import { ExportButton, CancelButton, YesButton, IconSaveButton, IconDeleteButton, IconEditButton, IconCancelTaskButton, ImportButton, ClearButton } from "../../../AllButtons/AllButtons";
import { SectionHeader } from "../../../components/SectionHeader";
import Pagination from "../../../components/Pagination";
import { usePermissions } from "../../../context/PermissionContext"
import GlobalTable from '../../../components/GlobalTable';

export const Teamtable = () => {
  const {permissions}=usePermissions()
  const { teams, fetchTeams, deleteTeam, updateTeam, isLoading } = useTeam();
  const [editingTeamId, setEditingTeamId] = useState(null); // Renamed for clarity: stores the ID of the team being edited
  const [newName, setNewName] = useState("");
    const [newdep, setNewdep] = useState("");
  const [editError, setEditError] = useState(""); // For inline error during edit
  const [deleteConfirmTeamId, setDeleteConfirmTeamId] = useState(null); // Stores the ID of the team to confirm deletion
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchQuery, setSearchQuery] = useState("");
  const [showImportOptions, setShowImportOptions] = useState(false); // State for import options visibility

  useEffect(() => {
    fetchTeams();
  }, []);


  const filteredTeams = useMemo(() => {
    return teams.filter((team) =>
      team.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [teams, searchQuery]);

  const employeePermission=permissions?.permissions?.[0].team;
  const canAddEmployee=employeePermission==="2"

  // Calculate total pages based on filtered teams
  const totalPages = Math.ceil(filteredTeams.length / itemsPerPage);

  // Apply pagination to filtered teams
  const paginatedTeams = filteredTeams.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleClearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1); // Reset to the first page when search is cleared
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleEdit = (team) => {
    setEditingTeamId(team.id);
    setNewName(team.name);
    setEditError("");
  };

  const handleUpdate = async (teamId) => {
    if (!newName.trim()) {
      setEditError("Team name is required.");
      return;
    }

    const result = await updateTeam(teamId, newName);

    if (result.success) {
      setEditingTeamId(null); // Exit edit mode
      setNewName(""); // Clear new name
      setEditError("");
    } else {
      setEditError(result.errorMessage || "Failed to update team.");
    }
  };

  const handleDeleteConfirmation = (teamId) => {
    setDeleteConfirmTeamId(teamId); // Set the ID of the team to be deleted
  };

  const handleDelete = async () => {
    await deleteTeam(deleteConfirmTeamId);
    setDeleteConfirmTeamId(null); // Close the confirmation modal
    setEditingTeamId(null); // Ensure no team is in editing mode after deletion
  };



 // Column definitions for Teams Table
const columns = [
  {
    key: 'created_at',
    label: 'Created Date',
    render: (team) => formatDate(team.created_at || "-")
  },
  {
    key: 'updated_at',
    label: 'Updated Date',
    render: (team) => formatDate(team.updated_at || "-")
  },
  {
    key: 'name',
    label: 'Team Name',
    render: (team) => renderTeamName(team)
  }
];

// Render Team Name cell (with inline editing)
const renderTeamName = (team) => {
  if (editingTeamId === team.id) {
    return (
      <div className="flex flex-col items-center">
        <input
          type="text"
          value={newName}
          onChange={(e) => {
            setNewName(e.target.value);
            setEditError("");
          }}
          className={`border p-1 rounded-md focus:outline-none focus:ring-2 w-full text-center ${
            editError ? "border-red-500 ring-red-400" : "border-gray-300 focus:ring-blue-500"
          }`}
        />
        {editError && (
          <span className="text-red-500 text-xs mt-1">{editError}</span>
        )}
      </div>
    );
  }
  return team.name;
};

// Actions renderer
const renderActions = (team) => {
  if (!canAddEmployee) return null;

  return (
    <div className="flex items-center justify-center space-x-2">
      {editingTeamId === team.id ? (
        <>
          <div className="relative group">
            <IconSaveButton onClick={() => handleUpdate(team.id)} />
            <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 
              whitespace-nowrap bg-white text-black text-sm px-2 py-1 rounded 
              opacity-0 group-hover:opacity-100 transition pointer-events-none shadow">
              Save
            </span>
          </div>

          <div className="relative group">
            <IconCancelTaskButton
              onClick={() => {
                setEditingTeamId(null);
                setNewName("");
                setEditError("");
              }}
            />
            <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 
              whitespace-nowrap bg-white text-black text-sm px-2 py-1 rounded 
              opacity-0 group-hover:opacity-100 transition pointer-events-none shadow">
              Cancel
            </span>
          </div>
        </>
      ) : (
        <>
          <div className="relative group">
            <IconEditButton onClick={() => handleEdit(team)} />
            <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 
              whitespace-nowrap bg-white text-black text-sm px-2 py-1 rounded 
              opacity-0 group-hover:opacity-100 transition pointer-events-none shadow">
              Edit
            </span>
          </div>
          
          <div className="relative group">
            <IconDeleteButton onClick={() => handleDeleteConfirmation(team.id)} />
            <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 
              whitespace-nowrap bg-white text-black text-sm px-2 py-1 rounded 
              opacity-0 group-hover:opacity-100 transition pointer-events-none shadow">
              Delete
            </span>
          </div>
        </>
      )}
    </div>
  );
};


  

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-md max-h-screen overflow-y-auto">
      <SectionHeader icon={BarChart} title="Team Management" subtitle="Manage teams and update details" />

      <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:sticky top-0 bg-white z-10 shadow-md">
        <Teams /> {/* Assuming this component handles adding new teams */}
        <div className="flex flex-wrap md:flex-nowrap items-center gap-3 border p-2 rounded-lg shadow-md bg-white">
          <div className="flex items-center w-full border border-gray-300 px-2 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
            <Search className="h-5 w-5 text-gray-400 mr-[5px]" />
            <input
              type="text"
              className="w-full rounded-lg focus:outline-none py-2"
              placeholder={`Search by Team name`}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to the first page on search
              }}
            />
          </div>
          <ClearButton onClick={handleClearSearch} />
          {/* <ImportButton onClick={() => setShowImportOptions(!showImportOptions)} /> */}
          {/* <ExportButton onClick={() => exportToExcel(filteredTeams, "teams.xlsx")} /> */}
          <ExportButton
              onClick={() => {
                const cleanedData = filteredTeams.map(({ users, ...rest }) => rest);
                exportToExcel(cleanedData, "teams.xlsx");
              }}
            />
        </div>
      </div>

     <div className="mt-4 bg-white rounded-2xl shadow border overflow-hidden">
      <GlobalTable
        data={filteredTeams}
        columns={columns}
        isLoading={isLoading}
        paginatedData={paginatedTeams}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        actionsComponent={{ right: renderActions }}
        emptyStateTitle="No teams found"
        emptyStateMessage="No teams match your search criteria."
      />
     </div>

      {deleteConfirmTeamId && ( // Show modal if deleteConfirmTeamId is set
        <div
          className="fixed inset-0 bg-gray-800 bg-opacity-70 flex items-center justify-center z-50"
          role="dialog"
          aria-labelledby="deleteModalLabel"
          aria-describedby="deleteModalDescription"
        >
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full m-2">
            <h2 id="deleteModalLabel" className="text-lg font-semibold mb-4">
              Are you sure you want to delete this team?
            </h2>
            <p id="deleteModalDescription" className="text-sm text-gray-600 mb-4">
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <CancelButton onClick={() => setDeleteConfirmTeamId(null)} />
              <YesButton onClick={handleDelete} /> 
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
