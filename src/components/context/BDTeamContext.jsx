import { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../utils/ApiConfig";
const TeamContext = createContext();
export const BDTeamProvider = ({ children }) => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    
        const fetchTeams = async () => {
            try {
                const token = localStorage.getItem("userToken");
                if (!token) {
                    throw new Error("No token found");
                }
                const response = await fetch(`${API_URL}/api/teams`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });
                // console.log("Response status:", response);   
                if (response.status === 401) {
                    localStorage.removeItem("userToken");
                    navigate("/");
                    return;
                }
                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }
                const data = await response.json();
                setTeams(data.data);
            } catch (error) {
                console.error("Failed to fetch teams:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
     useEffect(() => {   
        fetchTeams();
    }, [navigate]);
const updateTeamLead = async ({ tl_id, user_ids }) => {
    try {
        const token = localStorage.getItem("userToken");
        if (!token) {
            throw new Error("No token found");
        }

        const response = await fetch(`${API_URL}/api/team/update-team-lead`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                tl_id,
                user_ids
            })
        });

        if (response.status === 401) {
            localStorage.removeItem("userToken");
            navigate("/");
            return;
        }

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Failed to update team lead:", error);
        throw error;
    }
};


const updateUsersRM = async ({ new_rm_id, users }) => {
  try {
    const token = localStorage.getItem("userToken");

    const response = await fetch(`${API_URL}/api/update-Users-Rm`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        new_rm_id,
        users
      })
    });

    console.log("📡 RM API STATUS:", response.status);

    const data = await response.json();
    console.log("📦 RM API RESPONSE:", data);

    if (!response.ok) {
      throw new Error(data.message || "RM update failed");
    }

    return { success: true, data };

  } catch (error) {
    console.error("❌ RM UPDATE ERROR:", error);
    return { success: false, message: error.message };
  }
};

    
    
    // console.log(teams);
    return (
        <TeamContext.Provider value={{ teams,setTeams, loading, error,updateTeamLead, fetchTeams, updateUsersRM }}>
            {children}
        </TeamContext.Provider>
    );
};
export const useTeams = () => {
    return useContext(TeamContext);
};
