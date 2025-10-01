import { createContext, useContext, useState, useMemo } from "react";
import { API_URL } from "../utils/ApiConfig";
import { useNavigate } from "react-router-dom";
import { useAlert } from "./AlertContext";
const TeamContext = createContext(null);
export function TeamProvider({ children }) {
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const { showAlert } = useAlert();
    const navigate = useNavigate();
      const handleUnauthorized = (response) => {
        if (response.status === 401) {
          localStorage.removeItem("userToken");
          navigate("/");
          return true;
        }
        return false;
      };
 const addTeam = async (name) => {
  setIsLoading(true);
  setMessage(null);
  const token = localStorage.getItem("userToken");

  try {
    const response = await fetch(`${API_URL}/api/teams`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    });

    if (handleUnauthorized(response)) return { success: false };

    const data = await response.json();
    // console.log("API Response:", data);

    if (response.ok) {
      showAlert({ variant: "success", title: "Success", message: "Team added successfully" });
      fetchTeams();
      return { success: true };
    } else {
      const backendError = data?.errors?.name || "Failed to add team.";
      // showAlert({ variant: "error", title: "Error", message: backendError });
      return { success: false, errorMessage: backendError };
    }
  } catch (error) {
    console.error("Error:", error);
    const fallbackMessage = "Something went wrong!";
    showAlert({ variant: "error", title: "Error", message: fallbackMessage });
    return { success: false, errorMessage: fallbackMessage };
  } finally {
    setIsLoading(false);
  }
};

  const fetchTeams = async () => {
    setIsLoading(true);
    setMessage(null);
    const token = localStorage.getItem("userToken");
    try {
      const response = await fetch(`${API_URL}/api/teams`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (handleUnauthorized(response)) return;
      const data = await response.json();
      // console.log("Fetched Teams:", data);
      if (response.ok) {
        // setTeams(Array.isArray(data.data) ? data.data : []);
        setTeams(
          Array.isArray(data.data)
            ? data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            : []
        );
        
      } else {
        setMessage(data.message || "Failed to fetch teams :x:");
        setTeams([]);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Something went wrong! :x:");
      setTeams([]);
    } finally {
      setIsLoading(false);
    }
  };
  const deleteTeam = async (teamId) => {
    setIsLoading(true);
    const token = localStorage.getItem("userToken");
    try {
      const response = await fetch(`${API_URL}/api/teams/${teamId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (handleUnauthorized(response)) return;
      const data = await response.json();
      // console.log("Delete Response:", data);
      if (response.ok) {
        showAlert({ variant: "success", title: "Success", message: "Team Deleted successfully" });
        setTeams((prevTeams) => prevTeams.filter((team) => team.id !== teamId));
      } else {
        showAlert({ variant: "error", title: "Error", message: data.message || "Failed to delete team :x:"});
      }
    } catch (error) {
      console.error("Error:", error);
      showAlert({ variant: "error", title: "Error", message: "Something went wrong while deleting team!,try after some time"});
    } finally {
      setIsLoading(false);
    }
  };
  const updateTeam = async (teamId, newName) => {
  setIsLoading(true);
  const token = localStorage.getItem("userToken");

  try {
    const response = await fetch(`${API_URL}/api/teams/${teamId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: newName }),
    });

    if (handleUnauthorized(response)) return { success: false };

    const data = await response.json();

    if (response.ok) {
      showAlert({
        variant: "success",
        title: "Success",
        message: "Team updated successfully",
      });

      setTeams((prev) =>
        prev.map((team) =>
          team.id === teamId ? { ...team, name: newName } : team
        )
      );

      return { success: true };
    } else {
      const errorMsg = data?.errors?.name || "Update failed";
      // showAlert({ variant: "error", title: "Error", message: errorMsg });
      return { success: false, errorMessage: errorMsg };
    }
  } catch (error) {
    console.error("Update error:", error);
    return {
      success: false,
      errorMessage: error?.message || "Something went wrong",
    };
  } finally {
    setIsLoading(false);
  }
};

  return (
    <TeamContext.Provider value={{ addTeam, deleteTeam, fetchTeams, updateTeam, teams, isLoading, message }}>
      {children}
    </TeamContext.Provider>
  );
}
export const useTeam = () => {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error("useTeam must be used within a TeamProvider");
  }
  return useMemo(() => context, [context]);
};