import React, { createContext, useState, useContext } from "react";

const TeamsContext = createContext();

export const useTeams = () => {
  const context = useContext(TeamsContext);
  if (!context) throw new Error("useTeams debe usarse dentro de TeamsProvider");
  return context;
};

export const TeamsProvider = ({ children }) => {
  const [teams, setTeams] = useState([]);

  const addTeam = (name) => {
    const newTeam = { id: Date.now().toString(), name, pokemons: [] };
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

  const addPokemonToTeam = (teamId, pokemon) => {
    setTeams((prev) =>
      prev.map((team) => {
        if (team.id === teamId) {
          if (team.pokemons.length >= 6) return team; // máximo 6
          if (team.pokemons.some((p) => p.id === pokemon.id)) return team; // evitar duplicados
          return { ...team, pokemons: [...team.pokemons, pokemon] };
        }
        return team;
      })
    );
  };

  const removePokemonFromTeam = (teamId, pokemonId) => {
    setTeams((prev) =>
      prev.map((team) =>
        team.id === teamId
          ? { ...team, pokemons: team.pokemons.filter((p) => p.id !== pokemonId) }
          : team
      )
    );
  };

  return (
    <TeamsContext.Provider
      value={{
        teams,
        addTeam,
        renameTeam,
        removeTeam,
        addPokemonToTeam,
        removePokemonFromTeam,
      }}
    >
      {children}
    </TeamsContext.Provider>
  );
};
