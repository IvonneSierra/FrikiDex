// screens/HomeScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
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
  "Todos", "Pokémon", "Star Wars", "Marvel", "Anime", 
  "Juegos", "Películas", "Perros", "Gatos"
];

export default function HomeScreen() {
  const [active, setActive] = useState("Todos");
  const [data, setData] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
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
      console.log("Datos obtenidos:", result);
      setData(result);

    } catch (e) {
      console.log("Error cargando datos:", e);
    } finally {
      setLoading(false);
    }
  }

  // Función para manejar favoritos
  const handlePressFavorite = (item) => {
    console.log("Agregando a favoritos:", item);
    // Navegar a la pantalla de Favoritos
    navigation.navigate("Favoritos");
  };

  const filtered = data.filter((item) =>
    (item.title || "").toLowerCase().includes(query.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Buscar..."
        style={styles.search}
        value={query}
        onChangeText={setQuery}
      />

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

      {loading ? (
        <ActivityIndicator size="large" color="#FCB495" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item, index) => {
            const category = item.tag || item.category || 'unknown';
            return `${category}-${item.id}-${index}`;
          }}
          renderItem={({ item }) => (
            <ItemCard 
              item={item} 
              onPressFavorite={handlePressFavorite}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          style={styles.itemsList}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff", 
    paddingTop: 40 
  },
  search: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FCB495",
    margin: 16,
    padding: 10,
  },
  categories: { 
    paddingHorizontal: 10, 
    marginBottom: 10 
  },
  itemsList: {
    flex: 1,
  },
});