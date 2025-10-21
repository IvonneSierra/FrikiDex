import axios from "axios";
import md5 from "md5"; // npm install md5

const PUBLIC_KEY = "1f62b3987d0e5e9ae289a543ca4cf48c";
const PRIVATE_KEY = "633913d575b8b996055526decc8a28e2e9ae9480";

export async function getMarvel() {
  const ts = new Date().getTime();
  const hash = md5(ts + PRIVATE_KEY + PUBLIC_KEY);
  const url = `https://gateway.marvel.com/v1/public/characters?ts=${ts}&apikey=${PUBLIC_KEY}&hash=${hash}&limit=100`;

  const res = await axios.get(url);
  return res.data.data.results.map((hero) => ({
    id: hero.id.toString(),
    title: hero.name,
    image: `${hero.thumbnail.path}.${hero.thumbnail.extension}`,
    tag: "Marvel",
  }));
}
