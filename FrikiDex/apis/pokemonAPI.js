import axios from "axios";

export async function getPokemon() {
  try {
    const res = await axios.get("https://pokeapi.co/api/v2/pokemon?limit=50");
    
    const results = await Promise.all(
      res.data.results.map(async (p) => {
        const details = await axios.get(p.url);

        const name = details.data.name.charAt(0).toUpperCase() + details.data.name.slice(1);
        const types = details.data.types.map(t => t.type.name).join(", ");
        const height = details.data.height / 10; // metros
        const weight = details.data.weight / 10; // kg
        const abilities = details.data.abilities.map(a => a.ability.name).join(", ");
        const sprite = details.data.sprites.other["official-artwork"].front_default;

        // Texto tipo Pokédex
        const description = `Tras nacer, ${name.toLowerCase()} se alimenta de los nutrientes de su entorno. 
        Es un Pokémon de tipo ${types}. Tiene una altura de ${height} m y un peso de ${weight} kg.
        Sus habilidades principales incluyen ${abilities}.`;

        return {
          id: details.data.id,
          title: name,
          image: sprite,
          tag: "Pokémon",
          description,
          height: `${height} m`,
          weight: `${weight} kg`,
          abilities,
          types,
          base_experience: details.data.base_experience,
        };
      })
    );

    return results;
  } catch (error) {
    console.error("Error al obtener Pokémon:", error);
    return [];
  }
}
