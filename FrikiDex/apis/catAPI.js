// apis/catsApi.js
import axios from "axios";

export async function getCats() {
  try {
    const [breedsResponse, imagesResponse] = await Promise.all([
      axios.get("https://api.thecatapi.com/v1/breeds?limit=15"),
      axios.get("https://api.thecatapi.com/v1/images/search?limit=15")
    ]);
    
    console.log("Breeds data:", breedsResponse.data);  // Log para depurar
    console.log("Images data:", imagesResponse.data);  // Log para depurar
    
    return breedsResponse.data.map((breed, i) => {
      // Construye la descripción de forma segura, evitando "undefined"
      const origin = breed.origin ? `originaria de ${breed.origin}` : '';
      const temperament = breed.temperament ? `Temperamento: ${breed.temperament}.` : '';
      const lifeSpan = breed.life_span ? `Expectativa de vida: ${breed.life_span} años.` : '';
      const weight = breed.weight?.metric ? `Peso: ${breed.weight.metric} kg.` : '';
      
      const description = `${breed.name} es una raza de gato ${origin}. ${temperament} ${lifeSpan} ${weight}`.trim();
      
      return {
        id: `cat-${i}`,
        title: breed.name,
        image: imagesResponse.data[i]?.url || `https://picsum.photos/seed/cat${i}/400/300`,
        description: description || "Descripción no disponible para esta raza.",  // Fallback si todo falla
        tag: "Gatos",
      };
    });
  } catch (error) {
    console.log("Error fetching cats:", error);
    // Fallback: intenta obtener imágenes y usa descripción genérica
    try {
      const response = await axios.get("https://api.thecatapi.com/v1/images/search?limit=8");
      console.log("Fallback images:", response.data);  // Log para depurar
      return response.data.map((d, i) => ({
        id: `cat-${i}`,
        title: "Gato #" + (i + 1),
        image: d.url,
        description: "Un adorable felino compañero. Los gatos son mascotas independientes y cariñosas.",
        tag: "Gatos",
      }));
    } catch (fallbackError) {
      console.log("Fallback error:", fallbackError);
      return [];  // Devuelve array vacío si todo falla
    }
  }
}
