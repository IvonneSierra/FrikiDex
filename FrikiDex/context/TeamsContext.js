import React, { createContext, useState, useContext, useEffect } from "react";
import { db } from "../firebase";
import { ref, set, onValue, remove, update } from "firebase/database";
import { useAuth } from "./AuthContext";

const TeamsContext = createContext();

export const useTeams = () => useContext(TeamsContext);

export const TeamsProvider = ({ children }) => {
const { user } = useAuth();
const userId = user ? user.uid : "guest";

  const [teams, setTeams] = useState([]);

  // 🔹 Cargar equipos del usuario logueado
  useEffect(() => {
    if (!user) return; // Espera al login
    const teamsRef = ref(db, `teams/${user.uid}`);
    const unsubscribe = onValue(teamsRef, (snapshot) => {
      const data = snapshot.val();
      setTeams(data ? Object.values(data) : []);
    });
    return () => unsubscribe();
  }, [user]);

  // 🔹 Agregar equipo
  const addTeam = (name, category) => {
    if (!user) return;
    const newTeam = { id: Date.now().toString(), name, category, members: [] };
    const teamRef = ref(db, `teams/${user.uid}/${newTeam.id}`);
    set(teamRef, newTeam);
  };

  // 🔹 Renombrar equipo
  const renameTeam = (id, newName) => {
    if (!user) return;
    update(ref(db, `teams/${user.uid}/${id}`), { name: newName });
  };

  // 🔹 Eliminar equipo
  const removeTeam = (id) => {
    if (!user) return;
    remove(ref(db, `teams/${user.uid}/${id}`));
  };

  // 🔹 Agregar miembro
  const addMemberToTeam = (teamId, member) => {
    if (!user) return;
    setTeams((prev) =>
      prev.map((team) => {
        if (team.id === teamId) {
          const updated = { ...team, members: [...team.members, member] };
          set(ref(db, `teams/${user.uid}/${team.id}`), updated);
          return updated;
        }
        return team;
      })
    );
  };

  // 🔹 Eliminar miembro
  const removeMemberFromTeam = (teamId, memberId) => {
    if (!user) return;
    setTeams((prev) => {
      const updated = prev.map((team) =>
        team.id === teamId
          ? { ...team, members: team.members.filter((p) => p.id !== memberId) }
          : team
      );
      const updatedTeam = updated.find((t) => t.id === teamId);
      if (updatedTeam) set(ref(db, `teams/${user.uid}/${teamId}`), updatedTeam);
      return updated;
    });
  };

  return (
    <TeamsContext.Provider
      value={{
        teams,
        addTeam,
        renameTeam,
        removeTeam,
        addMemberToTeam,
        removeMemberFromTeam,
      }}
    >
      {children}
    </TeamsContext.Provider>
  );
};
