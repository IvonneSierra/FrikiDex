import axios from "axios";

export async function getStarWars() {
  const url = "https://swapi.dev/api/people/";
  const res = await axios.get(url);
  return res.data.results.slice(0, 100).map((p, i) => ({
    id: `sw-${i}`,
    title: p.name,
    subtitle: `Altura: ${p.height} cm`,
    image: `https://picsum.photos/seed/sw${i}/400/300`,
    tag: "Star Wars",
  }));
}
