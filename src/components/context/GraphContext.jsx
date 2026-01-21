import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../utils/ApiConfig";

export const GraphContext = createContext();

export const GraphProvider = ({ children }) => {
  const [workingHours, setWorkingHours] = useState(null);
  const [empweekhours, setEmpWeekHours] = useState([]);
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [weeklyWorkingHours, setWeeklyWorkingHours] = useState(null);
  const [empHours, setEmpHours] = useState(null);
  const [projectStats, setProjectStats] = useState([]);
  const [DepartmentProjectStats, setDepartmentProjectStats] = useState([]);
  const token = localStorage.getItem("userToken");

  const fetchGraphData = async (startDate, endDate) => {
    setLoading(true);
    setError(null);
    // console.log("this is start date", startDate);
    // console.log("this is end date", endDate);

    // Convert to UTC ISO format
    const startDateUtc = new Date(startDate).toISOString();
    const endDateUtc = new Date(endDate).toISOString();

    // console.log("Start Date in UTC:", startDateUtc);
    // console.log("End Date in UTC:", endDateUtc);

    
    // console.log("Graph token:", token);

    try {
      const response = await axios.post(
        `${API_URL}/api/graph-total-workinghour`,
        { start_date: startDateUtc, end_date: endDateUtc },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      // console.log("API Response:", response.data);
      setGraphData(response.data);
    } catch (err) {
      console.error("Error fetching graph data:", err);
      setError(err.response?.data || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };


  const fetchWorkingHours = async (projectId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/get-workinghour-byproject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ project_id: projectId }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to fetch working hours");

      setWorkingHours(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeeklyWorkingHours = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_URL}/api/get-weekly-workinghour-byproject`, 
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch weekly working hours');
      }

      const data = await response.json();
      setWeeklyWorkingHours(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  const fetchEmpHours = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/gettotal-workinghour-byemploye`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setEmpHours(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  const fetchempweekhours = async () => {
    setLoading(true);
    setError(null);
    try {

        const response = await fetch(`${API_URL}/api/gettotal-weekly-workinghour-byemploye`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch data");
        }

        const data = await response.json();
        setEmpWeekHours(data);
    } catch (error) {
        setError(error.message);
    } finally {
        setLoading(false);
    }
  };

  const fetchProjectStats = async () => {
    setLoading(true);
    setError(null);

    try {
        const response = await fetch(`${API_URL}/api/get-lastsixmonths-projectcount`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch project stats");
        }

        const data = await response.json();
        setProjectStats(data);
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <GraphContext.Provider value={{ graphData, loading, error, fetchGraphData, fetchWorkingHours, workingHours, fetchWeeklyWorkingHours, weeklyWorkingHours, fetchEmpHours, empHours, fetchempweekhours, empweekhours, fetchProjectStats, projectStats }}>
      {children}
    </GraphContext.Provider>
  );
};
