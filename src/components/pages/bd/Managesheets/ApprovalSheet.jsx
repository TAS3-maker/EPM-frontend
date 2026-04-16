import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { SectionHeader } from "../../../components/SectionHeader";
import { API_URL } from "../../../utils/ApiConfig";
import { Loader2, Calendar, User } from "lucide-react";

import {
  ExportButton,
  IconApproveButton,
  IconRejectButton,
  ClearButton,
  YesterdayButton,
  TodayButton,
  WeeklyButton,
  CustomButton,
  CancelButton,
} from "../../../AllButtons/AllButtons";

import { exportToExcel } from "../../../components/excelUtils";
import Pagination from "../../../components/Pagination";

function ApprovalSheet() {
  const token = localStorage.getItem("userToken");
const [searchQuery, setSearchQuery] = useState("");
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
  });

  // filters
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateFilterActive, setDateFilterActive] = useState(false);

  const getYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split("T")[0];
  };

  // ---------------- FETCH ----------------
const fetchApplications = useCallback(
  async (page = 1, start = "", end = "", search = "") => {
   

    try {
      const params = new URLSearchParams({
        page,
        per_page: 10,
      });

      if (dateFilterActive) {
        if (start) params.append("start_date", start);
        if (end) params.append("end_date", end);
      }

      if (search?.trim()) {
        params.append("search", search.trim());
        params.append("search_by", "user_name");
      }

      const res = await axios.get(
        `${API_URL}/api/get-applications-performa?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setApplications(res.data?.data?.data || []);

setPaginationMeta({
  current_page: res.data?.data?.current_page || 1,
  last_page: res.data?.data?.last_page || 1,
  total: res.data?.data?.total || 0,
  per_page: res.data?.data?.per_page || 10,
});

    } catch (err) {
      console.log(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  },
  [token, dateFilterActive]
);

useEffect(() => {
  const start = dateFilterActive ? startDate : "";
  const end = dateFilterActive ? endDate : "";

  fetchApplications(currentPage, start, end, searchQuery);
}, [currentPage, startDate, endDate, dateFilterActive,searchQuery]);
useEffect(() => {
  setCurrentPage(1);
}, [searchQuery]);
  // ---------------- ACTIONS ----------------
  const handleApprove = async (id) => {
    await axios.post(
      `${API_URL}/api/approve-application/${id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchApplications(currentPage, startDate, endDate);
  };

  const handleReject = async (id) => {
    await axios.post(
      `${API_URL}/api/reject-application/${id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchApplications(currentPage, startDate, endDate);
  };

  // ---------------- DATE FILTERS ----------------
  const handleToday = () => {
    const today = new Date().toISOString().split("T")[0];
    setStartDate(today);
    setEndDate(today);
    setDateFilterActive(true);
    setCurrentPage(1);
  };

  const handleYesterday = () => {
    const y = getYesterday();
    setStartDate(y);
    setEndDate(y);
    setDateFilterActive(true);
    setCurrentPage(1);
  };

  const handleWeekly = () => {
    const today = new Date();
    const end = today.toISOString().split("T")[0];

    const startDateObj = new Date();
    startDateObj.setDate(today.getDate() - 6);

    const start = startDateObj.toISOString().split("T")[0];

    setStartDate(start);
    setEndDate(end);
    setDateFilterActive(true);
    setCurrentPage(1);
  };

  const handleCustomDateChange = (s, e) => {
    setStartDate(s);
    setEndDate(e);
    setDateFilterActive(true);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setStartDate("");
    setEndDate("");
    setDateFilterActive(false);
    setCurrentPage(1);
  };

  // ---------------- EXPORT ----------------
  const handleExport = () => {
    exportToExcel(applications, "Performa_Applications");
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // ---------------- LOADING ----------------
  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex items-center space-x-3 bg-white rounded-xl shadow-sm py-6 px-8">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-700 font-medium">
            Loading applications...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* HEADER */}
      <SectionHeader
        icon={Calendar}
        title="Timesheet Approval Requests"
        subtitle={`Total ${paginationMeta.total} records`}
      />

      {/* FILTER BAR (UI MATCHED) */}
      <div className="flex flex-wrap items-center gap-2 bg-white px-4 py-2 shadow-md rounded-md">
{/* SEARCH BAR */}
<div className="flex items-center border border-gray-300 px-2 rounded-lg w-full sm:w-[260px] bg-white">
  <input
    type="text"
    placeholder="Search by user name..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="w-full px-2 py-1 text-sm focus:outline-none"
  />
</div>
        {!isCustomMode ? (
          <>
            <TodayButton onClick={handleToday} />
            <YesterdayButton onClick={handleYesterday} />
            <WeeklyButton onClick={handleWeekly} />
            <CustomButton onClick={() => setIsCustomMode(true)} />
          </>
        ) : (
          <>
            <input
              type="date"
              className="border border-gray-300 rounded-lg px-4 py-2"
              value={startDate}
              onChange={(e) =>
                handleCustomDateChange(e.target.value, endDate)
              }
            />
            <input
              type="date"
              className="border border-gray-300 rounded-lg px-4 py-2"
              value={endDate}
              onChange={(e) =>
                handleCustomDateChange(startDate, e.target.value)
              }
            />
            <ClearButton onClick={handleClearFilters} />
            <CancelButton
              onClick={() => {
                setIsCustomMode(false);
                handleClearFilters();
              }}
            />
          </>
        )}

        <ExportButton onClick={handleExport} />

  

        <div className="bg-gray-100 border border-gray-300 px-3 py-1.5 rounded shadow text-sm">
          <span className="font-semibold text-gray-700">Total: </span>
          <span className="font-bold text-blue-600">
            {paginationMeta.total}
          </span>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mt-4">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold">
                  Applied Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold">
                  Employee
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold">
                  Approved By
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold">
                  Approval Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {applications.length === 0 ? (
                <tr>
                  <td className="p-6 text-center text-gray-500" colSpan={6}>
                    No applications found
                  </td>
                </tr>
              ) : (
                applications.map((item) => (
                  <tr key={item.id} className="border-t hover:bg-gray-50">
                    <td className="px-6 py-4 text-[12px]">
                      {item.apply_date}
                    </td>

                    <td className="px-6 py-4 flex items-center gap-2 text-[12px]">
                      <User className="w-4 h-4 text-blue-500" />
                      {item.user?.name || "-"}
                    </td>

                    <td className="px-6 py-4 text-[12px]">
                      <span className="px-2 py-1 rounded-full text-xs bg-gray-100">
                        {item.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-[12px]">
                      {item.approved_rejected_by?.name || "-"}
                    </td>

                    <td className="px-6 py-4 text-[12px]">
                      {item.approval_date
                        ? new Date(item.approval_date).toLocaleString()
                        : "-"}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <IconApproveButton
                          onClick={() => handleApprove(item.id)}
                          disabled={item.status === "approved"}
                        />
                        <IconRejectButton
                          onClick={() => handleReject(item.id)}
                          disabled={item.status === "rejected"}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION */}
      {paginationMeta.last_page > 1 && (
        <Pagination
          currentPage={paginationMeta.current_page}
          totalPages={paginationMeta.last_page}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

export default ApprovalSheet;