import React, { useEffect, useState } from "react";
import { useAssignAccessory } from "../../../context/AssignAccessoryContext";
import { useAccessory } from "../../../context/AccessoryContext";
import { useEmployees } from "../../../context/EmployeeContext";
import { Loader2, BarChart, UserPlus, Search } from "lucide-react";
import {
  IconEditButton,
  IconDeleteButton,
  IconSaveButton,
  IconCancelTaskButton,
  ClearButton,
} from "../../../AllButtons/AllButtons";
import { SectionHeader } from "../../../components/SectionHeader";
import { AssignAccessories } from "./AssignAccessories";
import Select from "react-select";
import { useParams } from "react-router-dom";

export const AssignAccessoryTable = () => {
  const { accessoryAssign, loading, deleteAccessoryAssign, updateAccessoryAssign } = useAssignAccessory();
  const { fetchAccessories } = useAccessory();
  const { employees, fetchEmployees } = useEmployees();
  const [accessories, setAccessories] = useState([]);
  const [editAssignmentId, setEditAssignmentId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const { id } = useParams();

  useEffect(() => {
    if (id) fetchAccessories(id).then(setAccessories);
  }, [id]);

  useEffect(() => {
    if (editAssignmentId) {
      const assignment = accessoryAssign.find((item) => item.id === editAssignmentId);
      setEditFormData({ ...assignment });
      fetchEmployees();
    }
  }, [editAssignmentId, accessoryAssign]);

  const handleSaveClick = async () => {
    if (!editFormData.user_id || !editFormData.accessory_id || !editFormData.assigned_at) return;
    await updateAccessoryAssign(editAssignmentId, editFormData);
    setEditAssignmentId(null);
  };

  const filteredAssignments = accessoryAssign.filter((assignment) => {
    const query = searchQuery.toLowerCase();
    return (
      assignment?.user?.name?.toLowerCase().includes(query) ||
      assignment?.accessory_no?.toLowerCase().includes(query) ||
      assignment?.accessory?.category?.name?.toLowerCase().includes(query) ||
      assignment?.accessory?.brand_name?.toLowerCase().includes(query) ||
      assignment?.assigned_at?.toLowerCase().includes(query) ||
      assignment?.status?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="relative rounded-2xl border border-gray-200 bg-white shadow-lg h-screen overflow-y-auto">
      <SectionHeader icon={BarChart} title="Accessory assign" subtitle="Accessory assign and update details" />
      <div className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 sticky top-0 bg-white z-10 shadow-md">
          <AssignAccessories />
          <div className="flex flex-wrap md:flex-nowrap items-center gap-3 border p-2 rounded-lg shadow-md bg-white">
            <div className="flex items-center w-full border border-gray-300 px-2 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
              <Search className="h-5 w-8 text-gray-400 mr-[5px]" />
              <input
                type="text"
                className="min-w-[300px] rounded-lg focus:outline-none py-2"
                onChange={(e) => setSearchQuery(e.target.value)}
                value={searchQuery}
                placeholder="Search"
              />
            </div>
            <ClearButton onClick={() => setSearchQuery("")} />
            <button className="add-items-btn">
              <UserPlus /> Assign
            </button>
          </div>
        </div>

        <table className="w-full mt-4">
          <thead>
            <tr className="table-bg-heading table-th-tr-row">
              <th className="px-4 py-2 text-center">User</th>
              <th className="px-4 py-2 text-center">Accessory no</th>
              <th className="px-4 py-2 text-center">Accessory type</th>
              <th className="px-4 py-2 text-center">Brand name</th>
              <th className="px-4 py-2 text-center">Assigned At</th>
              <th className="px-4 py-2 text-center">Return date</th>
              <th className="px-4 py-2 text-center">Status</th>
              <th className="px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="px-6 py-8 text-center">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-500 mr-2" />
                    <span className="text-gray-500">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : filteredAssignments.length > 0 ? (
              filteredAssignments.map((assignment) => (
                <tr key={assignment.id} className="border">
                  <td className="px-6 py-4 text-center">
                    {editAssignmentId === assignment.id ? (
                      <Select
                        value={employees.find((e) => e.id === parseInt(editFormData.user_id))}
                        onChange={(selected) =>
                          setEditFormData({ ...editFormData, user_id: selected?.id.toString() })
                        }
                        options={employees}
                        getOptionLabel={(e) => e.name}
                        getOptionValue={(e) => e.id.toString()}
                        placeholder="Select User"
                        isClearable
                      />
                    ) : (
                      assignment.user.name
                    )}
                  </td>

                  <td className="px-6 py-4 text-center">
                    {editAssignmentId === assignment.id ? (
                      <input
                        type="text"
                        value={editFormData.accessory_no}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, accessory_no: e.target.value })
                        }
                        className="border border-gray-300 rounded-md p-2"
                      />
                    ) : (
                      assignment.accessory_no
                    )}
                  </td>

                  <td className="px-6 py-4 text-center">
                    {assignment.accessory.category.name}
                  </td>

                  <td className="px-6 py-4 text-center">
                    {editAssignmentId === assignment.id ? (
                      <Select
                        value={accessories.find((a) => a.id === parseInt(editFormData.accessory_id))}
                        onChange={(selected) =>
                          setEditFormData({ ...editFormData, accessory_id: selected?.id.toString() })
                        }
                        options={accessories}
                        getOptionLabel={(e) => e.model}
                        getOptionValue={(e) => e.id.toString()}
                        placeholder="Select Accessory"
                        isClearable
                      />
                    ) : (
                      assignment.accessory.brand_name
                    )}
                  </td>

                  <td className="px-6 py-4 text-center">
                    {editAssignmentId === assignment.id ? (
                      <input
                        type="date"
                        value={editFormData.assigned_at}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, assigned_at: e.target.value })
                        }
                        className="border border-gray-300 rounded-md p-2"
                      />
                    ) : (
                      assignment.assigned_at
                    )}
                  </td>

                  <td className="px-6 py-4 text-center">
                    {editAssignmentId === assignment.id ? (
                      <input
                        type="date"
                        value={editFormData.return_date || ""}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, return_date: e.target.value })
                        }
                        className="border border-gray-300 rounded-md p-2"
                      />
                    ) : (
                      assignment.return_date || "NA"
                    )}
                  </td>

                  <td className="px-6 py-4 text-center">
                    {editAssignmentId === assignment.id ? (
                      <select
                        value={editFormData.status}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, status: e.target.value })
                        }
                        className="border border-gray-300 rounded-md p-2"
                      >
                        <option value="assigned">Assigned</option>
                        <option value="vacant">Vacant</option>
                        <option value="in-repair">In-Repair</option>
                        <option value="lost">Lost</option>
                      </select>
                    ) : (
                      <span
                        className={`text-sm font-medium me-2 px-2.5 py-0.5 rounded-full ${
                          assignment.status === "assigned"
                            ? "bg-green-100 text-green-800"
                            : assignment.status === "returned"
                            ? "bg-gray-100 text-gray-800"
                            : assignment.status === "in_repair"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center space-x-2">
                      {editAssignmentId === assignment.id ? (
                        <>
                          <IconSaveButton onClick={handleSaveClick} />
                          <IconCancelTaskButton onClick={() => setEditAssignmentId(null)} />
                        </>
                      ) : (
                        <>
                          <IconEditButton onClick={() => setEditAssignmentId(assignment.id)} />
                          <IconDeleteButton onClick={() => deleteAccessoryAssign(assignment.id)} />
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="px-6 py-8 text-center">
                  No matching results found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
