import axios from "axios";

export async function getDogs() {
  try {
    // Primero obtener lista de razas
    const breedsRes = await axios.get("https://dog.ceo/api/breeds/list/all");
    const breeds = Object.keys(breedsRes.data.message).slice(0, 15);
    
    const dogsWithDetails = await Promise.all(
      breeds.map(async (breed, i) => {
        try {
          // Obtener imagen de la raza específica
          const imageRes = await axios.get(`https://dog.ceo/api/breed/${breed}/images/random`);
          
          return {
            id: `dog-${i}`,
            title: breed.charAt(0).toUpperCase() + breed.slice(1),
            image: imageRes.data.message,
            description: `El ${breed} es una raza de perro conocida por su lealtad y carácter. ` +
              `Perfecto compañero para familias y amantes de los animales.`,
            tag: "Perros",
          };
        } catch (error) {
          return {
            id: `dog-${i}`,
            title: breed.charAt(0).toUpperCase() + breed.slice(1),
            image: `https://picsum.photos/seed/dog${i}/400/300`,
            description: `El ${breed} es una raza de perro leal y cariñoso.`,
            tag: "Perros",
          };
        }
      })
    );
    
    return dogsWithDetails;
  } catch (error) {
    console.log("Error fetching dogs:", error);
    // Fallback simple
    const res = await axios.get("https://dog.ceo/api/breeds/image/random/8");
    return res.data.message.map((url, i) => ({
      id: `dog-${i}`,
      title: "Perro #" + (i + 1),
      image: url,
      description: "Los mejores amigos del hombre, directamente desde Dog API. 🐕",
      tag: "Perros"
    }));
  }
}