// apis/jikanApi.js
const BASE_URL = "https://api.jikan.moe/v4";

export async function getPopularAnimes(limit = 25) {
  try {
    const res = await fetch(`${BASE_URL}/top/anime?limit=${limit}`);
    
    if (!res.ok) {
      throw new Error(`Error en la respuesta: ${res.status}`);
    }
    
    const json = await res.json();
    return json.data.map((anime) => ({
      id: anime.mal_id,
      title: anime.title,
      image: anime.images?.jpg?.image_url,
      description: anime.synopsis || "Sin descripción disponible",
      tag: "Anime",
    }));
  } catch (error) {
    console.error("Error obteniendo animes populares:", error);
    return [];
  }
}