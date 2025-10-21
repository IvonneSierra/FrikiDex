// context/FavoritesContext.js
import React, { createContext, useState, useContext } from 'react';

const FavoritesContext = createContext();

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites debe usarse dentro de FavoritesProvider');
  }
  return context;
};

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);

  const addFavorite = (item) => {
    setFavorites(prev => {
      // Evitar duplicados usando ID + tag como identificador único
      const itemKey = `${item.id}-${item.tag}`;
      const exists = prev.some(fav => `${fav.id}-${fav.tag}` === itemKey);
      
      if (!exists) {
        console.log('✅ Agregando a favoritos:', item.title);
        return [...prev, item];
      }
      console.log('⚠️ Item ya está en favoritos:', item.title);
      return prev;
    });
  };

  const removeFavorite = (itemId, itemTag) => {
    setFavorites(prev => prev.filter(fav => 
      !(fav.id === itemId && fav.tag === itemTag)
    ));
  };

  const isFavorite = (itemId, itemTag) => {
    return favorites.some(fav => 
      fav.id === itemId && fav.tag === itemTag
    );
  };

  const toggleFavorite = (item) => {
    if (isFavorite(item.id, item.tag)) {
      removeFavorite(item.id, item.tag);
    } else {
      addFavorite(item);
    }
  };

  return (
    <FavoritesContext.Provider value={{
      favorites,
      addFavorite,
      removeFavorite,
      isFavorite,
      toggleFavorite,
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};