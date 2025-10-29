// context/FavoritesContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import { ref, set, onValue, remove, update } from "firebase/database";
import { db } from "../firebase";
import { useAuth } from "./AuthContext";

const FavoritesContext = createContext();

export const useFavorites = () => useContext(FavoritesContext);

export const FavoritesProvider = ({ children }) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Cargar favoritos desde Firebase
  useEffect(() => {
    if (!user) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    const favoritesRef = ref(db, `users/${user.uid}/favorites`);
    const unsubscribe = onValue(favoritesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Convertir objeto a array
        const favoritesArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setFavorites(favoritesArray);
      } else {
        setFavorites([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // 🔹 Función para limpiar datos antes de enviar a Firebase
  const cleanDataForFirebase = (data) => {
    const cleaned = {};
    Object.keys(data).forEach(key => {
      const value = data[key];
      // Eliminar propiedades undefined, null, o vacías que Firebase no acepta
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'object' && !Array.isArray(value)) {
          // Recursivamente limpiar objetos anidados
          const cleanedNested = cleanDataForFirebase(value);
          if (Object.keys(cleanedNested).length > 0) {
            cleaned[key] = cleanedNested;
          }
        } else {
          cleaned[key] = value;
        }
      }
    });
    return cleaned;
  };

  // 🔹 Agregar a favoritos en Firebase
  const addFavorite = async (item) => {
    if (!user) throw new Error("Usuario no autenticado");

    try {
      // Crear un ID seguro para el favorito
      const favoriteId = (item.id?.toString() || Date.now().toString()).replace(/[.#$\/\[\]]/g, '_');

      // Limpiar los datos antes de enviar a Firebase
      const favoriteData = cleanDataForFirebase({
        id: favoriteId,
        title: item.title || item.name || "Sin nombre",
        image: item.image || "",
        description: item.description || "Sin descripción",
        rating: item.rating || null,
        tag: item.tag || "Sin categoría",
        itemType: item.itemType || "character",
        apiSource: item.apiSource || "unknown",
        addedAt: new Date().toISOString(),
        userId: user.uid
      });

      await set(ref(db, `users/${user.uid}/favorites/${favoriteId}`), favoriteData);
      return favoriteId;
    } catch (error) {
      console.error("Error agregando favorito:", error);
      throw error;
    }
  };

  // 🔹 Eliminar de favoritos en Firebase
  const removeFavorite = async (favoriteId) => {
    if (!user) throw new Error("Usuario no autenticado");

    try {
      // Asegurar que el favoriteId sea seguro
      const safeFavoriteId = favoriteId.toString().replace(/[.#$\/\[\]]/g, '_');
      await remove(ref(db, `users/${user.uid}/favorites/${safeFavoriteId}`));
    } catch (error) {
      console.error("Error eliminando favorito:", error);
      throw error;
    }
  };

  // 🔹 Toggle favorito (agregar/eliminar)
  const toggleFavorite = async (item) => {
    if (!user) throw new Error("Usuario no autenticado");

    try {
      const safeItemId = (item.id?.toString() || '').replace(/[.#$\/\[\]]/g, '_');

      // Verificar si ya es favorito
      const isCurrentlyFavorite = favorites.some(fav =>
        fav.id === safeItemId || fav.id === item.id
      );

      if (isCurrentlyFavorite) {
        // Si ya es favorito, eliminarlo
        await removeFavorite(safeItemId);
        return { action: "removed", item };
      } else {
        // Si no es favorito, agregarlo
        const favoriteId = await addFavorite(item);
        return { action: "added", item: { ...item, id: favoriteId } };
      }
    } catch (error) {
      console.error("Error en toggleFavorite:", error);
      throw error;
    }
  };

  // 🔹 Verificar si un item está en favoritos
  const isFavorite = (itemId, itemTag = null) => {
    const safeItemId = (itemId?.toString() || '').replace(/[.#$\/\[\]]/g, '_');

    if (itemTag) {
      return favorites.some(fav =>
        (fav.id === safeItemId || fav.id === itemId) && fav.tag === itemTag
      );
    }

    return favorites.some(fav =>
      fav.id === safeItemId || fav.id === itemId
    );
  };

  // 🔹 Obtener favoritos por categoría
  const getFavoritesByCategory = (category) => {
    return favorites.filter(fav => fav.tag === category);
  };

  // 🔹 Obtener favoritos por tipo
  const getFavoritesByType = (itemType) => {
    return favorites.filter(fav => fav.itemType === itemType);
  };

  const clearAllFavorites = async () => {
    if (!user) throw new Error("Usuario no autenticado");

    try {
      await remove(ref(db, `users/${user.uid}/favorites`));
      // El useEffect se encargará de actualizar el estado automáticamente
    } catch (error) {
      console.error("Error eliminando todos los favoritos:", error);
      throw error;
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        loading,
        addFavorite,
        removeFavorite,
        toggleFavorite,
        isFavorite,
        getFavoritesByCategory,
        getFavoritesByType,
        clearAllFavorites // ✅ Agregar esta función al value
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};