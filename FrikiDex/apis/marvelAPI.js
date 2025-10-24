import axios from "axios";
import md5 from "md5"; // npm install md5

const PUBLIC_KEY = "1f62b3987d0e5e9ae289a543ca4cf48c";
const PRIVATE_KEY = "633913d575b8b996055526decc8a28e2e9ae9480";

export async function getMarvel(limit = 100) {
  try {
    const ts = new Date().getTime();
    const hash = md5(ts + PRIVATE_KEY + PUBLIC_KEY);
    const url = `https://gateway.marvel.com/v1/public/characters?ts=${ts}&apikey=${PUBLIC_KEY}&hash=${hash}&limit=${limit}`;

    const res = await axios.get(url);
    
    return res.data.data.results.map((hero) => {
      // Obtener listas completas (no solo las primeras 3)
      const comicsList = hero.comics.items.map(comic => comic.name);
      const seriesList = hero.series.items.map(series => series.name);
      const storiesList = hero.stories.items.map(story => story.name);
      const eventsList = hero.events.items.map(event => event.name);
      
      // Obtener todas las URLs disponibles
      const urls = {};
      hero.urls.forEach(urlObj => {
        urls[urlObj.type] = urlObj.url;
      });

      // Construir descripción
      let description = hero.description || `${hero.name} es un personaje del Universo Marvel.`;
      
      // Construir subtítulo
      const appearances = [];
      if (hero.comics.available > 0) appearances.push(`${hero.comics.available} cómics`);
      if (hero.series.available > 0) appearances.push(`${hero.series.available} series`);
      const subtitle = appearances.length > 0 ? appearances.join(" • ") : "Personaje Marvel";
      
      return {
        id: hero.id.toString(),
        title: hero.name,
        subtitle: subtitle,
        image: `${hero.thumbnail.path}.${hero.thumbnail.extension}`,
        description: description,
        tag: "Marvel",
        
        // Contadores totales
        comicsCount: hero.comics.available,
        comicsReturned: hero.comics.returned,
        seriesCount: hero.series.available,
        seriesReturned: hero.series.returned,
        storiesCount: hero.stories.available,
        storiesReturned: hero.stories.returned,
        eventsCount: hero.events.available,
        eventsReturned: hero.events.returned,
        
        // Listas completas de apariciones
        comics: comicsList,
        series: seriesList,
        stories: storiesList,
        events: eventsList,
        
        // URIs de colecciones
        comicsCollectionURI: hero.comics.collectionURI,
        seriesCollectionURI: hero.series.collectionURI,
        storiesCollectionURI: hero.stories.collectionURI,
        eventsCollectionURI: hero.events.collectionURI,
        
        // URLs del personaje
        detailUrl: urls.detail || null,
        wikiUrl: urls.wiki || null,
        comicUrl: urls.comiclink || null,
        allUrls: hero.urls,
        
        // Metadata
        modified: hero.modified,
        modifiedDate: hero.modified ? new Date(hero.modified).toLocaleDateString('es-ES') : null,
        resourceURI: hero.resourceURI,
        
        // Thumbnail original
        thumbnailPath: hero.thumbnail.path,
        thumbnailExtension: hero.thumbnail.extension,
      };
    });
  } catch (error) {
    console.log("Error fetching Marvel:", error);
    return [];
  }
}