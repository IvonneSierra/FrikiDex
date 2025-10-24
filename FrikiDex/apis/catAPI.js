import axios from "axios";

const CAT_API_KEY = "live_tu_api_key_aqui"; // Opcional pero recomendado para más requests

export async function getCats(limit = 15) {
  try {
    const breedsResponse = await axios.get(
      `https://api.thecatapi.com/v1/breeds?limit=${limit}`,
      {
        headers: CAT_API_KEY ? { 'x-api-key': CAT_API_KEY } : {}
      }
    );
    
    // Obtener imágenes específicas de cada raza
    const catsWithImages = await Promise.all(
      breedsResponse.data.map(async (breed, i) => {
        let imageUrl = `https://picsum.photos/seed/cat${i}/400/300`;
        
        // Intentar obtener imagen real de la raza
        try {
          if (breed.reference_image_id) {
            const imgRes = await axios.get(
              `https://api.thecatapi.com/v1/images/${breed.reference_image_id}`
            );
            imageUrl = imgRes.data.url;
          }
        } catch (error) {
          console.log(`No se pudo obtener imagen para ${breed.name}`);
        }
        
        // Construir descripción detallada
        const origin = breed.origin || "Desconocido";
        const description = breed.description || 
          `${breed.name} es una raza de gato originaria de ${origin}.`;
        
        // Temperamento formateado
        const temperaments = breed.temperament 
          ? breed.temperament.split(", ") 
          : [];
        
        // Subtitle con info clave
        const subtitle = `${origin} • ${breed.life_span || "Vida desconocida"}`;
        
        return {
          id: breed.id || `cat-${i}`,
          title: breed.name,
          subtitle: subtitle,
          image: imageUrl,
          description: description,
          tag: "Gatos",
          
          // Información de origen
          origin: origin,
          countryCode: breed.country_code || null,
          countryCodes: breed.country_codes || null,
          
          // Características físicas
          weight: breed.weight?.metric || "Desconocido",
          weightImperial: breed.weight?.imperial || null,
          lifeSpan: breed.life_span || "Desconocido",
          
          // Temperamento y personalidad
          temperament: breed.temperament || "No especificado",
          temperaments: temperaments,
          
          // Niveles de características (0-5)
          adaptability: breed.adaptability || 0,
          affectionLevel: breed.affection_level || 0,
          childFriendly: breed.child_friendly || 0,
          dogFriendly: breed.dog_friendly || 0,
          energyLevel: breed.energy_level || 0,
          grooming: breed.grooming || 0,
          healthIssues: breed.health_issues || 0,
          intelligence: breed.intelligence || 0,
          sheddingLevel: breed.shedding_level || 0,
          socialNeeds: breed.social_needs || 0,
          strangerFriendly: breed.stranger_friendly || 0,
          vocalisation: breed.vocalisation || 0,
          
          // Características especiales
          experimental: breed.experimental === 1,
          hairless: breed.hairless === 1,
          natural: breed.natural === 1,
          rare: breed.rare === 1,
          rex: breed.rex === 1,
          suppressedTail: breed.suppressed_tail === 1,
          shortLegs: breed.short_legs === 1,
          hypoallergenic: breed.hypoallergenic === 1,
          
          // Nombres alternativos
          altNames: breed.alt_names || null,
          
          // Links externos
          wikipediaUrl: breed.wikipedia_url || null,
          cfaUrl: breed.cfa_url || null,
          vetstreetUrl: breed.vetstreet_url || null,
          vcahospitalsUrl: breed.vcahospitals_url || null,
          
          // Imagen de referencia
          referenceImageId: breed.reference_image_id || null,
        };
      })
    );
    
    return catsWithImages;
  } catch (error) {
    console.log("Error fetching cats:", error);
    return [];
  }
}