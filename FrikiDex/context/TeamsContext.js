import React, { createContext, useState, useContext } from "react";

const TeamsContext = createContext();

export const useTeams = () => {
  const context = useContext(TeamsContext);
  if (!context) throw new Error("useTeams debe usarse dentro de TeamsProvider");
  return context;
};

export const TeamsProvider = ({ children }) => {
  const [teams, setTeams] = useState([]);

  const addTeam = (name, category) => {
    const newTeam = { 
      id: Date.now().toString(), 
      name, 
      category,
      members: [] 
    };
    setTeams((prev) => [...prev, newTeam]);
  };

  const renameTeam = (id, newName) => {
    setTeams((prev) =>
      prev.map((team) => (team.id === id ? { ...team, name: newName } : team))
    );
  };

  const removeTeam = (id) => {
    setTeams((prev) => prev.filter((team) => team.id !== id));
  };

  const addMemberToTeam = (teamId, member) => {
    setTeams((prev) =>
      prev.map((team) => {
        if (team.id === teamId) {
          // Verificar que el miembro pertenezca a la categoría del equipo
          const normalizedMemberTag = member.tag?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          const normalizedTeamCategory = team.category.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          
          if (normalizedMemberTag !== normalizedTeamCategory) {
            console.log("No se puede agregar: categoría incorrecta");
            return team;
          }

          if (team.members.length >= 6) return team; // máximo 6
          if (team.members.some((p) => p.id === member.id)) return team; // evitar duplicados
          return { ...team, members: [...team.members, member] };
        }
        return team;
      })
    );
  };

  const removeMemberFromTeam = (teamId, memberId) => {
    setTeams((prev) =>
      prev.map((team) =>
        team.id === teamId
          ? { ...team, members: team.members.filter((p) => p.id !== memberId) }
          : team
      )
    );
  };

  // Obtener equipos por categoría
  const getTeamsByCategory = (category) => {
    return teams.filter(team => team.category === category);
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
        getTeamsByCategory
      }}
    >
      {children}
    </TeamsContext.Provider>
  );
};