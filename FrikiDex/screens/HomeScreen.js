// screens/HomeScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import CategoryChip from "../components/CategoryChip";
import ItemCard from "../components/ItemCard";

// Importa todas las funciones de tus APIs
import {
  getPokemon,
  getStarWars,
  getDogs,
  getCats,
  getMarvel,
  getPopularAnimes,
  getGames,
  getPopularMovies,
} from "../apis";

// Categorías
const categories = [
  "Todos",
  "Pokémon",
  "Star Wars",
  "Marvel",
  "Anime",
  "Juegos",
  "Películas",
  "Perros",
  "Gatos",
];

export default function HomeScreen() {
  const [active, setActive] = useState("Todos");
  const [data, setData] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [characterOfDay, setCharacterOfDay] = useState(null);
  const [showCharacterModal, setShowCharacterModal] = useState(false);

  const navigation = useNavigation();

  useEffect(() => {
    fetchData(active);
  }, [active]);

  async function fetchData(category) {
    setLoading(true);
    try {
      let result = [];

      switch (category) {
        case "Pokémon":
          result = await getPokemon();
          break;
        case "Star Wars":
          result = await getStarWars();
          break;
        case "Marvel":
          result = await getMarvel();
          break;
        case "Anime":
          result = await getPopularAnimes();
          break;
        case "Juegos":
          result = await getGames();
          break;
        case "Películas":
          result = await getPopularMovies();
          break;
        case "Perros":
          result = await getDogs();
          break;
        case "Gatos":
          result = await getCats();
          break;
        default:
          const [p, s, a, d, c, m, g, movies] = await Promise.all([
            getPokemon(),
            getStarWars(),
            getPopularAnimes(),
            getDogs(),
            getCats(),
            getMarvel(),
            getGames(),
            getPopularMovies(15),
          ]);
          result = [...p, ...s, ...a, ...d, ...c, ...m, ...g, ...movies];
          result.sort(() => Math.random() - 0.5);
          break;
      }

      setData(result);

      // Seleccionar personaje aleatorio como "Personaje del Día"
      if (result.length > 0) {
        const randomIndex = Math.floor(Math.random() * result.length);
        setCharacterOfDay(result[randomIndex]);
      }
    } catch (e) {
      console.log("Error cargando datos:", e);
    } finally {
      setLoading(false);
    }
  }

  const handlePressFavorite = (item) => {
    console.log("Agregando a favoritos:", item);
    navigation.navigate("Favoritos");
  };

  const filtered = data.filter((item) =>
    (item.title || "").toLowerCase().includes(query.toLowerCase())
  );

  const handleShowCharacterOfDay = () => {
    if (characterOfDay) setShowCharacterModal(true);
  };

  return (
    <View style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Frikidex</Text>
      </View>

      {/* Buscador */}
      <TextInput
        placeholder="Buscar..."
        style={styles.search}
        value={query}
        onChangeText={setQuery}
      />

      {/* Botón "Conoce el Personaje del Día" */}
      {characterOfDay && (
        <TouchableOpacity
          style={styles.dailyButton}
          onPress={handleShowCharacterOfDay}
        >
          <Ionicons name="sparkles" size={22} color="#fff" />
          <Text style={styles.dailyButtonText}>Conoce el Personaje del Día</Text>
        </TouchableOpacity>
      )}

      {/* Categorías */}
      <View style={styles.categories}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <CategoryChip
              label={item}
              active={active === item}
              onPress={() => setActive(item)}
            />
          )}
        />
      </View>

      {/* Lista principal */}
      {loading ? (
        <ActivityIndicator size="large" color="#FCB495" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item, index) => {
            const category = item.tag || item.category || "unknown";
            return `${category}-${item.id}-${index}`;
          }}
          renderItem={({ item }) => (
            <ItemCard item={item} onPressFavorite={handlePressFavorite} />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          style={styles.itemsList}
        />
      )}

      {/* Modal: Personaje del Día */}
      <Modal visible={showCharacterModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🌟 Personaje del Día 🌟</Text>
            {characterOfDay?.image && (
              <Image
                source={{ uri: characterOfDay.image }}
                style={styles.characterImage}
              />
            )}
            <Text style={styles.characterName}>
              {characterOfDay?.title || "Desconocido"}
            </Text>
            <Text style={styles.characterDescription}>
              {characterOfDay?.description
                ? characterOfDay.description
                : "No hay descripción disponible para este personaje."}
            </Text>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCharacterModal(false)}
            >
              <Text style={styles.closeText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// 🧾 ESTILOS
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingTop: 40 },

  header: { alignItems: "center", marginBottom: 10 },
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FCB495",
    textTransform: "uppercase",
  },

  search: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FCB495",
    margin: 16,
    padding: 10,
  },

  dailyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FCB495",
    marginHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    marginBottom: 10,
  },
  dailyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },

  categories: { paddingHorizontal: 10, marginBottom: 10 },
  itemsList: { flex: 1 },

  // Modal estilos
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    width: "80%",
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  characterImage: { width: 120, height: 120, borderRadius: 60, marginBottom: 10 },
  characterName: { fontSize: 18, fontWeight: "600", marginBottom: 6 },
  characterDescription: { textAlign: "center", color: "#555", marginBottom: 12 },
  closeButton: {
    backgroundColor: "#FCB495",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  closeText: { color: "#fff", fontWeight: "600" },
});
