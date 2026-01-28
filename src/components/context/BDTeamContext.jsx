import { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../utils/ApiConfig";
const TeamContext = createContext();
export const BDTeamProvider = ({ children }) => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    useEffect(() => {
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

    
    // console.log(teams);
    return (
        <TeamContext.Provider value={{ teams, loading, error,updateTeamLead }}>
            {children}
        </TeamContext.Provider>
    );
};
export const useTeams = () => {
    return useContext(TeamContext);
};
