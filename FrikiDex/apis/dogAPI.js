import axios from "axios";

export async function getDogs(limit = 15) {
  try {
    // Obtener todas las razas con sub-razas
    const breedsRes = await axios.get("https://dog.ceo/api/breeds/list/all");
    const breedsData = breedsRes.data.message;

    // Crear array de razas incluyendo sub-razas
    const allBreeds = [];
    Object.keys(breedsData).forEach(breed => {
      if (breedsData[breed].length === 0) {
        // Raza sin sub-razas
        allBreeds.push({ breed, subBreed: null });
      } else {
        // Raza con sub-razas
        breedsData[breed].forEach(subBreed => {
          allBreeds.push({ breed, subBreed });
        });
      }
    });

    // Tomar una muestra aleatoria
    const selectedBreeds = allBreeds
      .sort(() => Math.random() - 0.5)
      .slice(0, limit);

    const dogsWithDetails = await Promise.all(
      selectedBreeds.map(async ({ breed, subBreed }, i) => {
        try {
          // Construir el nombre de la raza
          const breedName = subBreed
            ? `${subBreed.charAt(0).toUpperCase() + subBreed.slice(1)} ${breed.charAt(0).toUpperCase() + breed.slice(1)}`
            : breed.charAt(0).toUpperCase() + breed.slice(1);

          // Obtener múltiples imágenes de la raza
          const endpoint = subBreed
            ? `https://dog.ceo/api/breed/${breed}/${subBreed}/images/random/3`
            : `https://dog.ceo/api/breed/${breed}/images/random/3`;

          const imageRes = await axios.get(endpoint);
          const images = imageRes.data.message;

          // Información descriptiva basada en el nombre
          const sizeGuess = getSizeCategory(breed);
          const originGuess = getOriginInfo(breed);
          const characteristics = getCharacteristics(breed);

          const description = `El ${breedName} es una raza de perro ${sizeGuess}. ` +
            `${originGuess} Conocido por ${characteristics}. ` +
            `Son compañeros leales y ${getTemperament(breed)}.`;

          const subtitle = `Raza ${sizeGuess} • ${originGuess.split('.')[0]}`;

          return {
            id: `dog-${i}`,
            title: breedName,
            subtitle: subtitle,
            image: images[0],
            description: description,
            tag: "Perros",

            // Información de la raza
            breed: breed,
            subBreed: subBreed,
            breedGroup: getBreedGroup(breed),

            // Galería de imágenes
            images: images,
            imageCount: images.length,

            // Características estimadas (ya que la API no provee esto)
            size: sizeGuess,
            origin: getOrigin(breed),
            temperament: getTemperament(breed),

            // Características de cuidado (estimadas)
            groomingNeeds: getGroomingNeeds(breed),
            exerciseNeeds: getExerciseNeeds(breed),
            trainability: getTrainability(breed),

            // Aptitudes
            goodWithChildren: isGoodWithChildren(breed),
            goodWithPets: isGoodWithPets(breed),
            adaptability: getAdaptability(breed),

            // URL para más imágenes
            imageApiUrl: endpoint,
          };
        } catch (error) {
          console.log(`Error fetching ${breed}:`, error);
          return {
            id: `dog-${i}`,
            title: breed.charAt(0).toUpperCase() + breed.slice(1),
            image: `https://picsum.photos/seed/dog${i}/400/300`,
            description: `El ${breed} es una raza de perro leal y cariñoso.`,
            tag: "Perros",
            breed: breed,
            subBreed: subBreed,
          };
        }
      })
    );

    return dogsWithDetails;
  } catch (error) {
    console.log("Error fetching dogs:", error);
    return [];
  }
}

// Funciones helper para estimar características
function getSizeCategory(breed) {
  const smallBreeds = ['chihuahua', 'pomeranian', 'pug', 'shiba', 'terrier'];
  const largeBreeds = ['mastiff', 'dane', 'bernard', 'newfoundland', 'shepherd'];

  const breedLower = breed.toLowerCase();
  if (smallBreeds.some(b => breedLower.includes(b))) return "pequeño";
  if (largeBreeds.some(b => breedLower.includes(b))) return "grande";
  return "mediano";
}

function getOriginInfo(breed) {
  const origins = {
    'akita': 'Originario de Japón',
    'bulldog': 'Originario de Inglaterra',
    'husky': 'Originario de Siberia',
    'chihuahua': 'Originario de México',
    'poodle': 'Originario de Alemania y Francia',
    'shepherd': 'Originario de Alemania',
    'retriever': 'Originario de Escocia',
    'corgi': 'Originario de Gales',
    'shiba': 'Originario de Japón',
    'dane': 'Originario de Alemania',
  };

  for (let [key, value] of Object.entries(origins)) {
    if (breed.toLowerCase().includes(key)) return value + '.';
  }
  return 'De origen diverso.';
}

function getOrigin(breed) {
  const origins = {
    'akita': 'Japón',
    'bulldog': 'Inglaterra',
    'husky': 'Siberia',
    'chihuahua': 'México',
    'poodle': 'Francia/Alemania',
    'shepherd': 'Alemania',
    'retriever': 'Escocia',
    'corgi': 'Gales',
    'shiba': 'Japón',
  };

  for (let [key, value] of Object.entries(origins)) {
    if (breed.toLowerCase().includes(key)) return value;
  }
  return 'Desconocido';
}

function getCharacteristics(breed) {
  const traits = {
    'retriever': 'su naturaleza amigable y juguetona',
    'shepherd': 'su inteligencia y lealtad',
    'bulldog': 'su naturaleza tranquila y cariñosa',
    'husky': 'su energía y resistencia',
    'poodle': 'su inteligencia y elegancia',
    'terrier': 'su valentía y energía',
    'corgi': 'su personalidad alegre',
  };

  for (let [key, value] of Object.entries(traits)) {
    if (breed.toLowerCase().includes(key)) return value;
  }
  return 'su lealtad y compañía';
}

function getTemperament(breed) {
  const temperaments = {
    'retriever': 'amigables y juguetones',
    'shepherd': 'protectores e inteligentes',
    'bulldog': 'tranquilos y cariñosos',
    'husky': 'enérgicos y sociables',
    'poodle': 'elegantes e inteligentes',
    'terrier': 'valientes y activos',
  };

  for (let [key, value] of Object.entries(temperaments)) {
    if (breed.toLowerCase().includes(key)) return value;
  }
  return 'cariñosos';
}

function getBreedGroup(breed) {
  const groups = {
    'retriever': 'Deportivo',
    'shepherd': 'Pastor',
    'bulldog': 'No deportivo',
    'terrier': 'Terrier',
    'hound': 'Sabueso',
    'husky': 'Trabajo',
    'poodle': 'No deportivo',
  };

  for (let [key, value] of Object.entries(groups)) {
    if (breed.toLowerCase().includes(key)) return value;
  }
  return 'Compañía';
}

function getGroomingNeeds(breed) {
  if (breed.includes('poodle') || breed.includes('afghan')) return "Alto";
  if (breed.includes('husky') || breed.includes('retriever')) return "Medio";
  return "Bajo";
}

function getExerciseNeeds(breed) {
  if (breed.includes('husky') || breed.includes('retriever') || breed.includes('shepherd')) return "Alto";
  if (breed.includes('bulldog') || breed.includes('pug')) return "Bajo";
  return "Medio";
}

function getTrainability(breed) {
  if (breed.includes('poodle') || breed.includes('shepherd') || breed.includes('retriever')) return "Alta";
  if (breed.includes('bulldog') || breed.includes('husky')) return "Media";
  return "Media-Alta";
}

function isGoodWithChildren(breed) {
  const goodBreeds = ['retriever', 'beagle', 'bulldog', 'poodle', 'collie'];
  return goodBreeds.some(b => breed.toLowerCase().includes(b));
}

function isGoodWithPets(breed) {
  const goodBreeds = ['retriever', 'beagle', 'poodle', 'spaniel'];
  return goodBreeds.some(b => breed.toLowerCase().includes(b));
}

function getAdaptability(breed) {
  if (breed.includes('poodle') || breed.includes('bulldog')) return "Alta";
  if (breed.includes('husky') || breed.includes('malamute')) return "Baja";
  return "Media";
}