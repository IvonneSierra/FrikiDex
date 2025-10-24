import axios from "axios";

export async function getStarWars() {
  try {
    const url = "https://swapi.dev/api/people/";
    const res = await axios.get(url);
    
    const charactersWithDetails = await Promise.all(
      res.data.results.slice(0, 100).map(async (person, i) => {
        let speciesName = "Humano";
        let homeworldName = "Desconocido";
        let films = [];
        
        try {
          // Obtener especie
          if (person.species.length > 0) {
            const speciesRes = await axios.get(person.species[0]);
            speciesName = speciesRes.data.name;
          }
          
          // Obtener planeta natal
          if (person.homeworld) {
            const homeworldRes = await axios.get(person.homeworld);
            homeworldName = homeworldRes.data.name;
          }

          // Obtener películas
          if (person.films.length > 0) {
            const filmsData = await Promise.all(
              person.films.slice(0, 3).map(url => axios.get(url))
            );
            films = filmsData.map(f => f.data.title);
          }
          
        } catch (error) {
          console.log("Error fetching character details:", error);
        }

        // Formatear datos
        const height = person.height !== "unknown" ? `${person.height} cm` : "Desconocida";
        const mass = person.mass !== "unknown" ? `${person.mass} kg` : "Desconocido";
        
        const genderMap = {
          "male": "Masculino",
          "female": "Femenino",
          "n/a": "No aplica"
        };
        const gender = genderMap[person.gender] || person.gender;

        const eyeColorMap = {
          "blue": "azules",
          "yellow": "amarillos",
          "brown": "marrones",
          "black": "negros",
          "red": "rojos",
          "unknown": "desconocidos"
        };
        const eyeColor = eyeColorMap[person.eye_color] || person.eye_color;
        
        return {
          id: `sw-${i}`,
          title: person.name,
          subtitle: `${speciesName} • ${homeworldName}`,
          image: `https://picsum.photos/seed/sw${i}/400/300`,
          description: `${person.name} es un${speciesName === "Humano" ? "" : "a"} ${speciesName} del planeta ${homeworldName}. ` +
            `Altura: ${height}, Peso: ${mass}, Género: ${gender}, Ojos: ${eyeColor}. ` +
            `Año de nacimiento: ${person.birth_year !== "unknown" ? person.birth_year : "Desconocido"}.`,
          tag: "Star Wars",
          species: speciesName,
          homeworld: homeworldName,
          height: height,
          mass: mass,
          gender: gender,
          eyeColor: person.eye_color,
          hairColor: person.hair_color,
          skinColor: person.skin_color,
          birthYear: person.birth_year,
          films: films,
          vehiclesCount: person.vehicles.length,
          starshipsCount: person.starships.length,
        };
      })
    );
    
    return charactersWithDetails;
  } catch (error) {
    console.log("Error fetching Star Wars:", error);
    return [];
  }
}