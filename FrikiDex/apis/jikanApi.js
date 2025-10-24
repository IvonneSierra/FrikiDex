// apis/jikanApi.js
import axios from "axios";

const BASE_URL = "https://api.jikan.moe/v4";

// Placeholder para imágenes faltantes
const DEFAULT_IMAGE = "https://via.placeholder.com/400x600?text=No+Image";

// Función para limitar el texto y agregar puntos suspensivos
const truncateText = (text, maxLength = 200) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

// Función para limpiar texto de formatos extraños
const cleanText = (text) => {
  if (!text) return '';
  return text
    .replace(/\n/g, ' ') // Reemplazar saltos de línea
    .replace(/\s+/g, ' ') // Múltiples espacios por uno solo
    .replace(/\[[^\]]*\]/g, '') // Remover texto entre corchetes
    .trim();
};

export async function getPopularAnimes(limit = 25, page = 1) {
  try {
    const response = await axios.get(`${BASE_URL}/top/anime?limit=${limit}&page=${page}`);
    
    console.log("Animes data from API:", response.data.data);  // Log para depurar datos exitosos
    
    return response.data.data.map((anime) => {
      // Construye la descripción de forma segura
      const type = anime.type ? `${anime.type}` : '';
      const aired = anime.aired?.string ? `emitido ${anime.aired.string}` : '';
      const score = (typeof anime.score === 'number' && anime.score > 0) ? `Rating: ${anime.score}/10` : '';
      const episodes = anime.episodes ? `Episodios: ${anime.episodes}` : '';
      const status = anime.status ? `Estado: ${anime.status}` : '';
      
      // Limpiar y truncar la sinopsis si existe
      let description = cleanText(anime.synopsis);
      
      if (description) {
        // Si hay sinopsis, la truncamos
        description = truncateText(description, 10000);
      } else {
        // Si no hay sinopsis, construimos una descripción alternativa más completa
        const parts = [
          `${anime.title} es un anime ${type}`,
          aired,
          score,
          episodes,
          status
        ].filter(Boolean); // Remover elementos vacíos
        
        description = parts.join('. ') + '.';
        
        // Si sigue vacío, usar descripción genérica
        if (description === '.') {
          description = `Anime ${anime.title} de gran popularidad entre los fans.`;
        }
      }
      
      return {
        id: `anime-${anime.mal_id}`,
        title: anime.title,
        image: anime.images?.jpg?.image_url ?? DEFAULT_IMAGE,
        description,
        rating: anime.score ?? null,
        tag: "Anime",
        // Información adicional para usar en detalles
        _rawData: {
          type: anime.type,
          episodes: anime.episodes,
          status: anime.status,
          aired: anime.aired?.string,
          score: anime.score,
          synopsis: anime.synopsis // Guardamos la sinopsis completa para la pantalla de detalles
        }
      };
    });
  } catch (error) {
    console.error("Error obteniendo animes populares:", error);
    console.log("Devolviendo array vacío debido a error en la API.");
    return [];
  }
}

// Función para obtener detalles completos de un anime (para la pantalla de detalles)
export async function getAnimeDetails(animeId) {
  try {
    const response = await axios.get(`${BASE_URL}/anime/${animeId}/full`);
    const anime = response.data.data;
    
    return {
      id: `anime-${anime.mal_id}`,
      title: anime.title,
      image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || DEFAULT_IMAGE,
      description: cleanText(anime.synopsis) || "Descripción no disponible.",
      rating: anime.score,
      tag: "Anime",
      details: {
        type: anime.type,
        episodes: anime.episodes,
        status: anime.status,
        aired: anime.aired?.string,
        genres: anime.genres?.map(g => g.name) || [],
        studios: anime.studios?.map(s => s.name) || [],
        duration: anime.duration,
        rating: anime.rating
      }
    };
  } catch (error) {
    console.error("Error obteniendo detalles del anime:", error);
    return null;
  }
}