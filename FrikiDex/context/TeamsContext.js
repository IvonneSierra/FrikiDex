import React, { createContext, useState, useContext, useEffect } from "react";
import { ref, set, onValue, remove, update, push } from "firebase/database";
import { db } from "../firebase";
import { useAuth } from "./AuthContext";

const TeamsContext = createContext();
export const useTeams = () => useContext(TeamsContext);

export const TeamsProvider = ({ children }) => {
  const { user } = useAuth();

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  // 🔹 Forzar actualización
  const refreshTeams = () => setUpdateTrigger((prev) => prev + 1);

  // 🔹 Cargar equipos del usuario
  useEffect(() => {
    if (!user) {
      setTeams([]);
      setLoading(false);
      return;
    }

    const teamsRef = ref(db, `users/${user.uid}/teams`);
    const unsubscribe = onValue(teamsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const teamsArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setTeams(teamsArray);
      } else {
        setTeams([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, updateTrigger]);

  // 🔹 Generar ID seguro
  const getSafeId = (id) => String(id).replace(/[.#$/[\$]/g, "_");

  // 🔥 MODIFICADO: Crear un nuevo equipo con categoría
  const addTeam = async (teamName, category) => {
    if (!user) throw new Error("Usuario no autenticado");
    const teamRef = push(ref(db, `users/${user.uid}/teams`));
    await set(teamRef, { name: teamName, category: category, items: {} });
    refreshTeams();
  };

  // 🔹 Renombrar un equipo
  const renameTeam = async (teamId, newName) => {
    if (!user) throw new Error("Usuario no autenticado");
    await update(ref(db, `users/${user.uid}/teams/${teamId}`), { name: newName });
    refreshTeams();
  };

  // 🔹 Eliminar un equipo
  const removeTeam = async (teamId) => {
    if (!user) throw new Error("Usuario no autenticado");
    await remove(ref(db, `users/${user.uid}/teams/${teamId}`));
    refreshTeams();
  };

  // 🔹 Agregar un item (por ejemplo un personaje o elemento)
  const addItemToTeam = async (teamId, item) => {
    if (!user) throw new Error("Usuario no autenticado");
    const safeItemId = getSafeId(item.id || Date.now());
    await set(ref(db, `users/${user.uid}/teams/${teamId}/items/${safeItemId}`), item);
    refreshTeams();
    return safeItemId;
  };

  // 🔹 Remover item del equipo
  const removeItemFromTeam = async (teamId, itemId) => {
    if (!user) throw new Error("Usuario no autenticado");
    const safeItemId = getSafeId(itemId);
    await remove(ref(db, `users/${user.uid}/teams/${teamId}/items/${safeItemId}`));
    refreshTeams();
  };

  // 🔹 Verificar si un item ya está en un equipo
  const isItemInTeam = (teamId, itemId) => {
    const team = teams.find((t) => t.id === teamId);
    if (!team || !team.items) return false;
    const safeItemId = getSafeId(itemId);
    return !!team.items[safeItemId];
  };

  // 🔹 Alternar un item en un equipo (agregar o quitar)
  const toggleTeamMember = async (teamId, item) => {
    if (!user) throw new Error("Usuario no autenticado");
    try {
      const safeItemId = getSafeId(item.id || Date.now());
      const team = teams.find((t) => t.id === teamId);
      const isInTeam = team?.items?.[safeItemId];

      if (isInTeam) {
        await removeItemFromTeam(teamId, safeItemId);
        refreshTeams();
        return { action: "removed", item };
      } else {
        const newItemId = await addItemToTeam(teamId, item);
        refreshTeams();
        return { action: "added", item: { ...item, id: newItemId } };
      }
    } catch (error) {
      console.error("Error en toggleTeamMember:", error);
      throw error;
    }
  };

  // 🔹 Miembros del equipo (puedes dejar vacías si no las usas)
  const addMemberToTeam = async () => {};
  const removeMemberFromTeam = async () => {};

  return (
    <TeamsContext.Provider
      value={{
        teams,
        loading,
        addTeam,
        renameTeam,
        removeTeam,
        addMemberToTeam,
        removeMemberFromTeam,
        addItemToTeam,
        removeItemFromTeam,
        toggleTeamMember,
        isItemInTeam,
        refreshTeams,
      }}
    >
      {children}
    </TeamsContext.Provider>
  );
};