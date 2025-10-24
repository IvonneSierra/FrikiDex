import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFavorites } from "../context/FavoritesContext";

export default function DetailScreen({ route, navigation }) {
  const { item } = route.params;
  const { isFavorite, toggleFavorite } = useFavorites();
  const isItemFavorite = isFavorite(item.id, item.tag);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // Log para depurar
  console.log("Item data in DetailScreen:", item);

  const handleHeartPress = () => {
    toggleFavorite(item);
  };

  // Función para manejar descripciones largas con opción de expandir
  const renderDescription = () => {
    if (!item.description) {
      return (
        <Text style={styles.description}>
          No hay descripción disponible para este elemento.
        </Text>
      );
    }

    const shouldTruncate = item.description.length > 200 && !isDescriptionExpanded;
    const displayText = shouldTruncate
      ? item.description.substring(0, 200) + '...'
      : item.description;

    return (
      <View>
        <Text style={styles.description}>
          {displayText}
        </Text>
        {item.description.length > 200 && (
          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
          >
            <Text style={styles.expandButtonText}>
              {isDescriptionExpanded ? 'Ver menos' : 'Ver más'}
            </Text>
            <Ionicons
              name={isDescriptionExpanded ? "chevron-up" : "chevron-down"}
              size={16}
              color="#FCB495"
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Renderizar géneros si están disponibles
  const renderGenres = () => {
    if (!item.genres || item.genres.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Géneros</Text>
        <View style={styles.row}>
          {item.genres.map((genre, index) => (
            <Text key={index} style={[styles.chip, styles.genreChip]}>
              {genre}
            </Text>
          ))}
        </View>
      </View>
    );
  };

  // Renderizar plataformas (para juegos)
  const renderPlatforms = () => {
    if (!item.platforms || item.platforms.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Plataformas</Text>
        <View style={styles.row}>
          {item.platforms.map((platform, index) => (
            <Text key={index} style={[styles.chip, styles.platformChip]}>
              {platform}
            </Text>
          ))}
        </View>
      </View>
    );
  };

  // Renderizar estudios (para anime)
  const renderStudios = () => {
    if (!item.studios || item.studios.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estudios</Text>
        <View style={styles.row}>
          {item.studios.map((studio, index) => (
            <Text key={index} style={[styles.chip, styles.studioChip]}>
              {studio}
            </Text>
          ))}
        </View>
      </View>
    );
  };

  // Renderizar tipos (para Pokémon)
  const renderTypes = () => {
    if (!item.types || item.tag !== "Pokémon") return null;

    const typesArray = item.types.split(", ");
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tipos</Text>
        <View style={styles.row}>
          {typesArray.map((type, index) => (
            <Text key={index} style={[styles.chip, styles.typeChip]}>
              {type}
            </Text>
          ))}
        </View>
      </View>
    );
  };

  // Renderizar películas de Star Wars
  const renderFilms = () => {
    if (item.tag !== "Star Wars" || !item.films || item.films.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Apariciones en Películas</Text>
        <View style={styles.row}>
          {item.films.map((film, index) => (
            <Text key={index} style={[styles.chip, styles.filmChip]}>
              {film}
            </Text>
          ))}
        </View>
      </View>
    );
  };

  // Renderizar cómics de Marvel
  const renderComics = () => {
    if (item.tag !== "Marvel" || !item.comics || item.comics.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cómics Destacados</Text>
        <View style={styles.comicsList}>
          {item.comics.map((comic, index) => (
            <View key={index} style={styles.comicItem}>
              <Ionicons name="book-outline" size={16} color="#FCB495" />
              <Text style={styles.comicText}>{comic}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  // Renderizar series de Marvel
  const renderSeries = () => {
    if (item.tag !== "Marvel" || !item.series || item.series.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Series Destacadas</Text>
        <View style={styles.comicsList}>
          {item.series.map((series, index) => (
            <View key={index} style={styles.comicItem}>
              <Ionicons name="tv-outline" size={16} color="#FCB495" />
              <Text style={styles.comicText}>{series}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  // Información adicional específica para cada categoría
  const renderAdditionalInfo = () => {
    const infoItems = [];

    // Información para Películas
    if (item.tag === "Películas" && item.releaseDate) {
      infoItems.push(
        <View key="release" style={styles.infoItem}>
          <Text style={styles.infoLabel}>Estreno:</Text>
          <Text style={styles.infoValue}>
            {new Date(item.releaseDate).getFullYear()}
          </Text>
        </View>
      );
    }

    // Información para Juegos
    if (item.tag === "Juegos") {
      if (item.releaseDate) {
        infoItems.push(
          <View key="release" style={styles.infoItem}>
            <Text style={styles.infoLabel}>Lanzamiento:</Text>
            <Text style={styles.infoValue}>{item.releaseDate}</Text>
          </View>
        );
      }

      if (item.developers && item.developers.length > 0) {
        infoItems.push(
          <View key="developers" style={styles.infoItem}>
            <Text style={styles.infoLabel}>Desarrollador:</Text>
            <Text style={styles.infoValue}>{item.developers[0]}</Text>
          </View>
        );
      }

      if (item.publishers && item.publishers.length > 0) {
        infoItems.push(
          <View key="publishers" style={styles.infoItem}>
            <Text style={styles.infoLabel}>Publisher:</Text>
            <Text style={styles.infoValue}>{item.publishers[0]}</Text>
          </View>
        );
      }
    }

    // Información para Anime
    if (item.tag === "Anime" && item._rawData) {
      const details = item._rawData;

      if (details.type) {
        infoItems.push(
          <View key="type" style={styles.infoItem}>
            <Text style={styles.infoLabel}>Tipo:</Text>
            <Text style={styles.infoValue}>{details.type}</Text>
          </View>
        );
      }

      if (details.episodes) {
        infoItems.push(
          <View key="episodes" style={styles.infoItem}>
            <Text style={styles.infoLabel}>Episodios:</Text>
            <Text style={styles.infoValue}>{details.episodes}</Text>
          </View>
        );
      }

      if (details.status) {
        infoItems.push(
          <View key="status" style={styles.infoItem}>
            <Text style={styles.infoLabel}>Estado:</Text>
            <Text style={styles.infoValue}>{details.status}</Text>
          </View>
        );
      }

      if (details.aired) {
        infoItems.push(
          <View key="aired" style={styles.infoItem}>
            <Text style={styles.infoLabel}>Emitido:</Text>
            <Text style={styles.infoValue}>{details.aired}</Text>
          </View>
        );
      }
    }

    // Información para Pokémon
    if (item.tag === "Pokémon") {
      if (item.height) {
        infoItems.push(
          <View key="height" style={styles.infoItem}>
            <Text style={styles.infoLabel}>Altura:</Text>
            <Text style={styles.infoValue}>{item.height}</Text>
          </View>
        );
      }

      if (item.weight) {
        infoItems.push(
          <View key="weight" style={styles.infoItem}>
            <Text style={styles.infoLabel}>Peso:</Text>
            <Text style={styles.infoValue}>{item.weight}</Text>
          </View>
        );
      }

      if (item.abilities) {
        infoItems.push(
          <View key="abilities" style={styles.infoItem}>
            <Text style={styles.infoLabel}>Habilidades:</Text>
            <Text style={styles.infoValue}>{item.abilities}</Text>
          </View>
        );
      }

      if (item.base_experience) {
        infoItems.push(
          <View key="exp" style={styles.infoItem}>
            <Text style={styles.infoLabel}>Exp. Base:</Text>
            <Text style={styles.infoValue}>{item.base_experience}</Text>
          </View>
        );
      }
    }

    // Información para Star Wars
    if (item.tag === "Star Wars") {
      if (item.species) {
        infoItems.push(
          <View key="species" style={styles.infoItem}>
            <Text style={styles.infoLabel}>Especie:</Text>
            <Text style={styles.infoValue}>{item.species}</Text>
          </View>
        );
      }

      if (item.homeworld) {
        infoItems.push(
          <View key="homeworld" style={styles.infoItem}>
            <Text style={styles.infoLabel}>Planeta:</Text>
            <Text style={styles.infoValue}>{item.homeworld}</Text>
          </View>
        );
      }

      if (item.height) {
        infoItems.push(
          <View key="height" style={styles.infoItem}>
            <Text style={styles.infoLabel}>Altura:</Text>
            <Text style={styles.infoValue}>{item.height}</Text>
          </View>
        );
      }

      if (item.mass) {
        infoItems.push(
          <View key="mass" style={styles.infoItem}>
            <Text style={styles.infoLabel}>Peso:</Text>
            <Text style={styles.infoValue}>{item.mass}</Text>
          </View>
        );
      }

      if (item.gender) {
        infoItems.push(
          <View key="gender" style={styles.infoItem}>
            <Text style={styles.infoLabel}>Género:</Text>
            <Text style={styles.infoValue}>{item.gender}</Text>
          </View>
        );
      }

      if (item.birthYear) {
        infoItems.push(
          <View key="birth" style={styles.infoItem}>
            <Text style={styles.infoLabel}>Nacimiento:</Text>
            <Text style={styles.infoValue}>{item.birthYear}</Text>
          </View>
        );
      }

      if (item.eyeColor) {
        infoItems.push(
          <View key="eyes" style={styles.infoItem}>
            <Text style={styles.infoLabel}>Ojos:</Text>
            <Text style={styles.infoValue}>{item.eyeColor}</Text>
          </View>
        );
      }

      if (item.hairColor) {
        infoItems.push(
          <View key="hair" style={styles.infoItem}>
            <Text style={styles.infoLabel}>Cabello:</Text>
            <Text style={styles.infoValue}>{item.hairColor}</Text>
          </View>
        );
      }

      if (item.vehiclesCount > 0) {
        infoItems.push(
          <View key="vehicles" style={styles.infoItem}>
            <Text style={styles.infoLabel}>Vehículos:</Text>
            <Text style={styles.infoValue}>{item.vehiclesCount}</Text>
          </View>
        );
      }

      if (item.starshipsCount > 0) {
        infoItems.push(
          <View key="starships" style={styles.infoItem}>
            <Text style={styles.infoLabel}>Naves:</Text>
            <Text style={styles.infoValue}>{item.starshipsCount}</Text>
          </View>
        );
      }
    }

    // Información para Marvel
    if (item.tag === "Marvel") {
      if (item.comicsCount > 0) {
        infoItems.push(
          <View key="comics" style={styles.infoItem}>
            <Text style={styles.infoLabel}>Cómics:</Text>
            <Text style={styles.infoValue}>{item.comicsCount}</Text>
          </View>
        );
      }

      if (item.seriesCount > 0) {
        infoItems.push(
          <View key="series" style={styles.infoItem}>
            <Text style={styles.infoLabel}>Series:</Text>
            <Text style={styles.infoValue}>{item.seriesCount}</Text>
          </View>
        );
      }

      if (item.storiesCount > 0) {
        infoItems.push(
          <View key="stories" style={styles.infoItem}>
            <Text style={styles.infoLabel}>Historias:</Text>
            <Text style={styles.infoValue}>{item.storiesCount}</Text>
          </View>
        );
      }

      if (item.eventsCount > 0) {
        infoItems.push(
          <View key="events" style={styles.infoItem}>
            <Text style={styles.infoLabel}>Eventos:</Text>
            <Text style={styles.infoValue}>{item.eventsCount}</Text>
          </View>
        );
      }

      if (item.modifiedDate) {
        infoItems.push(
          <View key="modified" style={styles.infoItem}>
            <Text style={styles.infoLabel}>Actualizado:</Text>
            <Text style={styles.infoValue}>{item.modifiedDate}</Text>
          </View>
        );
      }
    }

    // Rating para todos los elementos que lo tengan
    if (item.rating) {
      let ratingMax = 10;

      if (item.tag === "Juegos") {
        ratingMax = 100;
      }

      infoItems.push(
        <View key="rating" style={styles.infoItem}>
          <Text style={styles.infoLabel}>Rating:</Text>
          <Text style={styles.infoValue}>{item.rating}/{ratingMax}</Text>
        </View>
      );
    }

    if (infoItems.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="information-circle" size={20} color="#FCB495" /> Información
        </Text>
        <View style={styles.infoGridNew}>
          {infoItems}
        </View>
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />

      <View style={styles.content}>
        {/* Título y botón de favorito */}
        <View style={styles.header}>
          <Text style={styles.title}>{item.title}</Text>
          <TouchableOpacity onPress={handleHeartPress}>
            <Ionicons
              name={isItemFavorite ? "heart" : "heart-outline"}
              size={28}
              color={isItemFavorite ? "#FF6B6B" : "#FCB495"}
            />
          </TouchableOpacity>
        </View>

        {/* Etiqueta de categoría y rating */}
        <View style={styles.tagContainer}>
          <Text style={styles.tag}>{item.tag}</Text>
          {item.rating && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.rating}>{item.rating}</Text>
            </View>
          )}
        </View>

        {/* Subtítulo si existe */}
        {item.subtitle && (
          <Text style={styles.subtitle}>{item.subtitle}</Text>
        )}

        {/* Descripción con opción de expandir */}
        {renderDescription()}

        {/* Géneros */}
        {renderGenres()}

        {/* Plataformas (para juegos) */}
        {renderPlatforms()}

        {/* Estudios (para anime) */}
        {renderStudios()}

        {/* Tipos (para Pokémon) */}
        {renderTypes()}

        {/* Películas (para Star Wars) */}
        {renderFilms()}

        {/* Cómics (para Marvel) */}
        {renderComics()}

        {/* Series (para Marvel) */}
        {renderSeries()}

        {/* Información adicional específica */}
        {renderAdditionalInfo()}

        {/* Botón de volver */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color="#fff" />
          <Text style={styles.backText}>Volver</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// 🎨 Estilos
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    paddingBottom: 40,
  },
  image: {
    width: "100%",
    height: 300,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#222",
    flex: 1,
    marginRight: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    fontStyle: "italic",
  },
  tagContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  tag: {
    backgroundColor: "#FCB495",
    color: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    fontWeight: "bold",
    fontSize: 14,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9C4",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  rating: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F57C00",
    marginLeft: 4,
  },
  description: {
    fontSize: 16,
    color: "#444",
    lineHeight: 22,
    marginBottom: 10,
  },
  expandButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: 5,
    paddingHorizontal: 0,
  },
  expandButtonText: {
    color: "#FCB495",
    fontWeight: "600",
    fontSize: 14,
    marginRight: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 10,
    color: "#333",
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 12,
  },
  genreChip: {
    backgroundColor: "#666",
  },
  platformChip: {
    backgroundColor: "#2196F3",
  },
  studioChip: {
    backgroundColor: "#9C27B0",
  },
  typeChip: {
    backgroundColor: "#4CAF50",
  },
  filmChip: {
    backgroundColor: "#FF9800",
  },
  comicsList: {
    gap: 8,
  },
  comicItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: 10,
    borderRadius: 8,
    gap: 8,
  },
  comicText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 15,
    marginTop: 5,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: "45%",
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginRight: 5,
  },
  infoValue: {
    fontSize: 14,
    color: "#333",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FCB495",
    marginTop: 24,
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  backText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 6,
    fontSize: 16,
  },
    container: {
    backgroundColor: "#fff",
    paddingBottom: 40,
  },
  image: {
    width: "100%",
    height: 300,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#222",
    flex: 1,
    marginRight: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    fontStyle: "italic",
  },
  tagContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  tag: {
    backgroundColor: "#FCB495",
    color: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    fontWeight: "bold",
    fontSize: 14,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9C4",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  rating: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F57C00",
    marginLeft: 4,
  },
  description: {
    fontSize: 16,
    color: "#444",
    lineHeight: 22,
    marginBottom: 10,
  },
  expandButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: 5,
    paddingHorizontal: 0,
  },
  expandButtonText: {
    color: "#FCB495",
    fontWeight: "600",
    fontSize: 14,
    marginRight: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 12,
    color: "#333",
    flexDirection: "row",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 12,
  },
  genreChip: {
    backgroundColor: "#666",
  },
  platformChip: {
    backgroundColor: "#2196F3",
  },
  studioChip: {
    backgroundColor: "#9C27B0",
  },
  typeChip: {
    backgroundColor: "#4CAF50",
  },
  filmChip: {
    backgroundColor: "#FF9800",
  },
  comicsList: {
    gap: 8,
  },
  comicItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: 10,
    borderRadius: 8,
    gap: 8,
  },
  comicText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  // Nuevo diseño para la grid de información
  infoGridNew: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  infoItem: {
    backgroundColor: "#F8F9FA",
    borderLeftWidth: 3,
    borderLeftColor: "#FCB495",
    borderRadius: 8,
    padding: 12,
    minWidth: "47%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FCB495",
    marginTop: 24,
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: "#FCB495",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  backText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 6,
    fontSize: 16,
  },
});