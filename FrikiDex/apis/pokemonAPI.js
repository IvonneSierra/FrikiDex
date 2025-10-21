import axios from "axios";

export async function getPokemon() {
  const url = "https://pokeapi.co/api/v2/pokemon?limit=100";
  const res = await axios.get(url);
  const list = await Promise.all(
    res.data.results.map(async (p) => {
      const d = await axios.get(p.url);
      return {
        id: d.data.id.toString(),
        title: d.data.name,
        subtitle: d.data.types[0]?.type?.name,
        image: d.data.sprites.other["official-artwork"].front_default,
        tag: "Pokémon",
      };
    })
  );
  return list;
}
