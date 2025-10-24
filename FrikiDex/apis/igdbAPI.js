// apis/igdbAPI.js
import axios from 'axios';

const CLIENT_ID = 'zg7kw5476r10ou11h7ccr7hos1p574';
const CLIENT_SECRET = 'a9j2rzlv3hhio5m63je7hgo67pzbp0';
let accessToken = null;
let tokenExpiry = null;

// Función para obtener/renovar el access token
async function getAccessToken() {
  // Si ya tenemos un token válido, lo usamos
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }

  try {
    const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
      params: {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'client_credentials'
      }
    });

    accessToken = response.data.access_token;
    // El token expira en response.data.expires_in segundos (normalmente 2 meses)
    tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000; // Restamos 1 minuto como margen
    
    console.log('✅ Token de Twitch obtenido exitosamente');
    return accessToken;
  } catch (error) {
    console.error('❌ Error obteniendo token de Twitch:', error.response?.data || error.message);
    throw error;
  }
}

// Función principal para obtener juegos
export async function getGames(limit = 100) {
  try {
    const token = await getAccessToken();
    
    const response = await axios.post(
      `https://corsproxy.io/?${encodeURIComponent('https://api.igdb.com/v4/games')}`,
      // Agregando más campos de la API
      `fields 
        name,
        cover.url,
        summary,
        rating,
        rating_count,
        release_dates.date,
        release_dates.platform.name,
        genres.name,
        platforms.name,
        involved_companies.company.name,
        involved_companies.developer,
        involved_companies.publisher,
        aggregated_rating,
        aggregated_rating_count,
        screenshots.url,
        videos.video_id,
        game_modes.name,
        player_perspectives.name,
        themes.name,
        first_release_date,
        storyline,
        url;
      limit ${limit}; 
      where rating > 70; 
      sort rating desc;`,
      {
        headers: {
          'Client-ID': CLIENT_ID,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'text/plain',
        }
      }
    );

    return response.data.map(game => ({
      id: game.id,
      title: game.name,
      image: game.cover?.url 
        ? `https:${game.cover.url.replace('t_thumb', 't_cover_big')}`
        : 'https://images.igdb.com/igdb/image/upload/t_cover_big/nocover.png',
      description: game.summary || "Sin descripción disponible",
      storyline: game.storyline || null,
      rating: game.rating ? Math.round(game.rating) : null,
      ratingCount: game.rating_count || 0,
      aggregatedRating: game.aggregated_rating ? Math.round(game.aggregated_rating) : null,
      aggregatedRatingCount: game.aggregated_rating_count || 0,
      releaseDate: game.first_release_date 
        ? new Date(game.first_release_date * 1000).toLocaleDateString('es-ES')
        : null,
      genres: game.genres?.map(g => g.name) || [],
      platforms: game.platforms?.map(p => p.name) || [],
      developers: game.involved_companies
        ?.filter(ic => ic.developer)
        .map(ic => ic.company.name) || [],
      publishers: game.involved_companies
        ?.filter(ic => ic.publisher)
        .map(ic => ic.company.name) || [],
      gameModes: game.game_modes?.map(gm => gm.name) || [],
      perspectives: game.player_perspectives?.map(pp => pp.name) || [],
      themes: game.themes?.map(t => t.name) || [],
      screenshots: game.screenshots?.map(s => 
        `https:${s.url.replace('t_thumb', 't_screenshot_big')}`
      ) || [],
      videos: game.videos?.map(v => `https://www.youtube.com/watch?v=${v.video_id}`) || [],
      officialUrl: game.url || null,
      tag: "Juegos",
    }));
  } catch (error) {
    console.error('❌ Error al obtener los juegos:', error);
    return [];
  }
}