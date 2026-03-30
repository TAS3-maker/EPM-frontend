import React, { useMemo, useState, useEffect } from "react";
import { SectionHeader } from "../../../components/SectionHeader";
import { BarChart } from "lucide-react";
import SearchableSelect from "../../../components/SearchableSelect";
import { useEmployees } from "../../../context/EmployeeContext";
import axios from "axios";
import { API_URL } from "../../../utils/ApiConfig";
import { useAlert } from "../../../context/AlertContext";
import Pagination from "../../../components/Pagination";

const PMProjectReplacement = () => {
  const { employees1 } = useEmployees();
  const token = localStorage.getItem("userToken");

  const [fromEmployee, setFromEmployee] = useState(null);
  const [toEmployees, setToEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { showAlert } = useAlert();

  const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 15;

  const filteredToEmployees = useMemo(() => {
  if (!fromEmployee) return employees1;

  const fromId = fromEmployee?.id || fromEmployee;

  return employees1.filter((emp) => emp.id !== fromId);
}, [employees1, fromEmployee]);

  const getProjectId = (project) => project.id || project.project_id;

  const handleFromEmployeeChange = async (val) => {
    const selected = val?.[0] || null;
    setFromEmployee(selected);

    setSelectedProjects([]);
    setSelectAll(false);
    setProjects([]);
    setToEmployees([]);
    setCurrentPage(1);

    if (!selected) return;

    try {
      const res = await axios.get(
        `${API_URL}/api/getfull_proileemployee/${selected}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setProjects(res.data.data.project_user || []);
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  const handleProjectSelect = (projectId) => {
    setSelectedProjects((prev) => {
      if (prev.includes(projectId)) {
        return prev.filter((id) => id !== projectId);
      } else {
        return [...prev, projectId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedProjects([]);
    } else {
      const allIds = projects.map((p) => getProjectId(p));
      setSelectedProjects(allIds);
    }
  };
  useEffect(() => {
    if (projects.length === 0) {
      setSelectAll(false);
      return;
    }

    const allIds = projects.map((p) => getProjectId(p));
    const isAllSelected = allIds.every((id) =>
      selectedProjects.includes(id)
    );

    setSelectAll(isAllSelected);
  }, [selectedProjects, projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) =>
      (p.project_name || p.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [projects, searchTerm]);

const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);

const paginatedProjects = useMemo(() => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  return filteredProjects.slice(startIndex, startIndex + itemsPerPage);
}, [filteredProjects, currentPage]);

  const handleSubmit = async () => {
    if (!fromEmployee || toEmployees.length === 0 || selectedProjects.length === 0) {
      showAlert({
        variant: "error",
        title: "Validation Error",
        message: "Please select all required fields",
        });
      return;
    }

    const payload = {
    old_user_id: fromEmployee?.id || fromEmployee, 
    new_user_id: toEmployees.map(emp => emp.id || emp).join(","), 
    project_ids: selectedProjects.join(","), 
    };

    console.log("Payload:", payload);

    try {
      await axios.put(`${API_URL}/api/bulk-update-project-assigness`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      showAlert({
        variant: "success",
        title: "Success",
        message: "Project updated successfully",
        });

       setFromEmployee(null);
        setToEmployees([]);
        setProjects([]);
        setSelectedProjects([]);
        setSelectAll(false);
        setSearchTerm("");

    } catch (err) {
      console.error("Error updating:", err);
      showAlert({
        variant: "error",
        title: "Error",
        message: "Failed to update project",
        });
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-md h-[calc(100vh-20px)] flex flex-col">

      <SectionHeader
        icon={BarChart}
        title="Project Replacement"
        subtitle="Replace project managers"
      />

      <div className="flex flex-wrap gap-4 p-4">

        <div className="w-[250px] relative z-50">
          <SearchableSelect
            placeholder="From Employee"
            options={employees1 || []}
            labelKey="name"
            valueKey="id"
            value={fromEmployee ? [fromEmployee] : []}
            onChange={handleFromEmployeeChange}
            isMulti={false}
          />
        </div>

        <div className="w-[250px] relative z-50">
          <SearchableSelect
            placeholder="To Employees"
            options={filteredToEmployees || []}
            labelKey="name"
            valueKey="id"
            value={toEmployees}
            onChange={(val) => setToEmployees(val)}
            isMulti={true}
          />
        </div>

        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-4 py-1.5 rounded-lg"
        >
          Update
        </button>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">

        {projects.length > 0 && (
          <>
            <input
              type="text"
              placeholder="Search project..."
              className="mb-3 p-2 border rounded w-full"
              value={searchTerm}
            //   onChange={(e) => setSearchTerm(e.target.value)}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
                }}
            />

            <table className="w-full border rounded-lg overflow-hidden">
              <thead className="border-b border-gray-800 bg-black text-white text-xs font-semibold uppercase bg-gradient-to-r from-blue-600 to-blue-800">
                <tr className="table-th-tr-row table-bg-heading whitespace-nowrap sm:whitespace-normal">
                  <th className=" border px-4 py-2 font-medium text-sm w-[80px] text-center">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className=" border px-4 py-2 font-medium text-sm text-left">Project Name</th>
                </tr>
              </thead>

              <tbody>
                {paginatedProjects.map((project) => {
                  const projectId = getProjectId(project);

                  return (
                    <tr key={projectId} className="hover:bg-gray-50">
                      <td className="p-2 border text-center">
                        <input
                          type="checkbox"
                          checked={selectedProjects.includes(projectId)}
                          onChange={() => handleProjectSelect(projectId)}
                        />
                      </td>

                      <td className="border px-4 py-2 text-[12px]">
                        {project.project_name || project.name}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {totalPages > 1 && (
                <div className="sticky bottom-[-18px] bg-white py-2 border-t">
                    <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => setCurrentPage(page)}
                    />
                </div>
                )}
          </>
        )}

        {projects.length === 0 && (
          <div className="text-gray-500 text-center mt-4">
            No projects found
          </div>
        )}

      </div>
    </div>
  );
};

export default PMProjectReplacement;
