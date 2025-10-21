// apis/tmdbAPI.js
const API_KEY = 'de12d6368dcf16556776d1f02dc87442';
const BASE_URL = 'https://api.themoviedb.org/3';
const LANGUAGE = 'es-ES'; // Español

export async function getPopularMovies(limit = 20) {
  try {
    const response = await fetch(
      `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=${LANGUAGE}&page=1`
    );
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.results.slice(0, limit).map(movie => ({
      id: movie.id,
      title: movie.title,
      image: movie.poster_path 
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : 'https://via.placeholder.com/500x750/CCCCCC/666666?text=Sin+imagen',
      description: movie.overview || "Sin descripción disponible",
      rating: movie.vote_average ? Math.round(movie.vote_average * 10) / 10 : null,
      tag: "Películas",
    }));
    
  } catch (error) {
    console.error('❌ Error obteniendo películas:', error);
    return [];
  }
}

// Opcional: Función para buscar películas
export async function searchMovies(query, limit = 20) {
  try {
    const response = await fetch(
      `${BASE_URL}/search/movie?api_key=${API_KEY}&language=${LANGUAGE}&query=${encodeURIComponent(query)}&page=1`
    );
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.results.slice(0, limit).map(movie => ({
      id: movie.id,
      title: movie.title,
      image: movie.poster_path 
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : 'https://via.placeholder.com/500x750/CCCCCC/666666?text=Sin+imagen',
      description: movie.overview || "Sin descripción disponible",
      rating: movie.vote_average ? Math.round(movie.vote_average * 10) / 10 : null,
      tag: "Películas",
    }));
    
  } catch (error) {
    console.error('❌ Error buscando películas:', error);
    return [];
  }
}