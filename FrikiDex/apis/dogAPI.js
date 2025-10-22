import axios from "axios";

export async function getDogs() {
  const res = await axios.get("https://dog.ceo/api/breeds/image/random/8");
  return res.data.message.map((url, i) => ({
    id: `dog-${i}`,
    title: "Perro #" + (i + 1),
    image: url,
    tag: "Perros",
    description: "Los mejores amigos del hombre, directamente desde Dog API. 🐕"
  }));
}
