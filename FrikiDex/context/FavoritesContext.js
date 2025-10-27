import React, { createContext, useState, useContext, useEffect } from "react";
import { ref, set, onValue, remove } from "firebase/database";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext"; // 👈 lo usaremos luego con el login

const FavoritesContext = createContext();

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites debe usarse dentro de FavoritesProvider");
  }
  return context;
};

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
const { user } = useAuth();
const userId = user ? user.uid : "guest";


  // 🔹 Cargar favoritos al iniciar o cuando cambie el usuario
  useEffect(() => {
    if (!userId) return;

    const favRef = ref(db, `favorites/${userId}`);
    const unsubscribe = onValue(favRef, (snapshot) => {
      const data = snapshot.val();
      setFavorites(data ? Object.values(data) : []);
    });

    return () => unsubscribe();
  }, [userId]);

  // 🔹 Guardar favoritos cada vez que cambien
  useEffect(() => {
    if (userId) {
      const favRef = ref(db, `favorites/${userId}`);
      set(favRef, favorites);
    }
  }, [favorites, userId]);

  // --- 🔹 Funciones ---
  const addFavorite = (item) => {
    setFavorites((prev) => {
      const exists = prev.some((fav) => fav.id === item.id && fav.tag === item.tag);
      if (!exists) {
        return [...prev, item];
      }
      return prev;
    });
  };

  const removeFavorite = (itemId, itemTag) => {
    setFavorites((prev) => prev.filter((fav) => !(fav.id === itemId && fav.tag === itemTag)));
  };

  const isFavorite = (itemId, itemTag) => {
    return favorites.some((fav) => fav.id === itemId && fav.tag === itemTag);
  };

  const toggleFavorite = (item) => {
    if (isFavorite(item.id, item.tag)) {
      removeFavorite(item.id, item.tag);
    } else {
      addFavorite(item);
    }
  };

  const clearFavorites = () => {
    const favRef = ref(db, `favorites/${userId}`);
    remove(favRef);
    setFavorites([]);
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addFavorite,
        removeFavorite,
        toggleFavorite,
        isFavorite,
        clearFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};
