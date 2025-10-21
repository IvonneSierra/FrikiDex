import axios from "axios";

export async function getDogs() {
  const res = await axios.get("https://api.thedogapi.com/v1/images/search?limit=8");
  return res.data.map((d, i) => ({
    id: `dog-${i}`,
    title: "Dog #" + (i + 1),
    image: d.url,
    tag: "Perros",
  }));
}
