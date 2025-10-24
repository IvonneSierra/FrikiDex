// apis/tmdbAPI.js
import axios from "axios"; // ✅ Agregar esta línea

const API_KEY = 'de12d6368dcf16556776d1f02dc87442';
const BASE_URL = 'https://api.themoviedb.org/3';
const LANGUAGE = 'es-ES'; // Español

// Cache de géneros para no hacer la petición cada vez
let genresCache = null;

async function getGenres() {
  if (genresCache) return genresCache;
  
  try {
    const response = await axios.get(
      `${BASE_URL}/genre/movie/list`,
      {
        params: {
          api_key: API_KEY,
          language: LANGUAGE
        }
      }
    );
    genresCache = response.data.genres;
    return genresCache;
  } catch (error) {
    console.error('Error obteniendo géneros:', error);
    return [];
  }
}

export async function getPopularMovies(limit = 20) {
  try {
    const [genres, moviesResponse] = await Promise.all([
      getGenres(),
      axios.get(
        `${BASE_URL}/movie/popular`,
        {
          params: {
            api_key: API_KEY,
            language: LANGUAGE,
            page: 1
          }
        }
      )
    ]);
    
    return moviesResponse.data.results.slice(0, limit).map(movie => {
      const movieGenres = movie.genre_ids.map(id => 
        genres.find(genre => genre.id === id)?.name
      ).filter(Boolean);
      
      return {
        id: `movie-${movie.id}`,
        title: movie.title,
        image: movie.poster_path 
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : 'https://via.placeholder.com/500x750/CCCCCC/666666?text=Sin+imagen',
        description: movie.overview || 
          `${movie.title} es una película ${movie.release_date ? `estrenada en ${new Date(movie.release_date).getFullYear()}` : 'popular'} ` +
          `con rating de ${movie.vote_average?.toFixed(1) || 'N/A'}/10.`,
        rating: movie.vote_average ? Math.round(movie.vote_average * 10) / 10 : null,
        tag: "Películas",
        genres: movieGenres,
        release_date: movie.release_date,
        _rawData: {
          original_title: movie.original_title,
          popularity: movie.popularity,
          vote_count: movie.vote_count
        }
      };
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo películas:', error);
    return [];
  }
}