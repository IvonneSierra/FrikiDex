import axios from "axios";

export async function getCats() {
  const res = await axios.get("https://api.thecatapi.com/v1/images/search?limit=8");
  return res.data.map((d, i) => ({
    id: `cat-${i}`,
    title: "Cat #" + (i + 1),
    image: d.url,
    tag: "Gatos",
  }));
}
