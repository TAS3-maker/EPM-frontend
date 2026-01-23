import React, { createContext, useContext, useEffect, useState } from "react";
import { API_URL } from "../utils/ApiConfig";

const MasterReportingContext = createContext();

export const MasterReportingProvider = ({ children }) => {
  const [masterData, setMasterData] = useState(null);
  const [loading, setLoading] = useState(false);

const fetchMasterData = async (filters = {}) => {
  setLoading(true);
  const token = localStorage.getItem("userToken");

  try {
    const params = new URLSearchParams();

    const appendArray = (key, arr) => {
      if (Array.isArray(arr) && arr.length > 0) {
        params.append(key, arr.join(","));
      }
    };

    // Existing filters
    appendArray("user_id", filters.employee);
    appendArray("project_id", filters.project);
    appendArray("client_id", filters.client);
    appendArray("team_id", filters.team);
    appendArray("department_id", filters.department);

    // ✅ ADD THESE TWO
    appendArray("activity_tag", filters.activity);
    appendArray("status", filters.status);

    const url = `${API_URL}/api/get-all-data-master-reporting${
      params.toString() ? `?${params.toString()}` : ""
    }`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const json = await res.json();
    setMasterData(json?.data || {});
  } catch (e) {
    console.error("Master reporting fetch failed", e);
    setMasterData({});
  } finally {
    setLoading(false);
  }
};


  return (
    <MasterReportingContext.Provider
      value={{ masterData, loading, fetchMasterData }}
    >
      {children}
    </MasterReportingContext.Provider>
  );
};

export const useMasterReporting = () =>
  useContext(MasterReportingContext);
