import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFavorites } from "../context/FavoritesContext";
import { useTeams } from "../context/TeamsContext";

export default function FavoritesScreen({ navigation }) {
  const { favorites, removeFavorite } = useFavorites();
  const { teams, addMemberToTeam } = useTeams();

  const [selectedItem, setSelectedItem] = useState(null);
  const [showTeamsModal, setShowTeamsModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  const categories = ["Todos", ...new Set(favorites.map((f) => f.tag))];

  const handleAddToTeam = (item) => {
    // Permitir Pokémon, Marvel y Star Wars
    const normalizedTag = item.tag?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const allowedTags = ["pokemon", "marvel", "star wars"];
    
    if (!allowedTags.includes(normalizedTag)) {
      Alert.alert(
        "❌ No disponible", 
        "Solo los Pokémon, personajes de Marvel y Star Wars pueden agregarse a equipos.",
        [{ text: "Entendido" }]
      );
      return;
    }

    // Filtrar equipos que coincidan con la categoría del personaje
    const compatibleTeams = teams.filter(team => {
      const normalizedTeamCategory = team.category.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return normalizedTeamCategory === normalizedTag;
    });

    if (compatibleTeams.length === 0) {
      Alert.alert(
        "📝 Crea un equipo primero", 
        `No tienes equipos de ${item.tag}. Ve a la pestaña 'Equipos' para crear uno.`,
        [{ text: "OK" }]
      );
      return;
    }

    setSelectedItem(item);
    setShowTeamsModal(true);
  };

  const handleSelectTeam = (teamId) => {
    addMemberToTeam(teamId, selectedItem);
    setShowTeamsModal(false);
    Alert.alert("✅ Agregado", `${selectedItem.title || selectedItem.name} fue agregado al equipo.`);
  };

  const filteredFavorites =
    selectedCategory === "Todos"
      ? favorites
      : favorites.filter((f) => f.tag === selectedCategory);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Favoritos</Text>

      {/* Filtros por categoría */}
      <View style={styles.filterContainer}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.filterButton,
              selectedCategory === category && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.filterText,
                selectedCategory === category && styles.filterTextActive,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista de favoritos */}
      {filteredFavorites.length === 0 ? (
        <Text style={styles.empty}>No hay elementos en esta categoría.</Text>
      ) : (
        <FlatList
          data={filteredFavorites}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            const normalizedTag = item.tag?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const allowedTags = ["pokemon", "marvel", "star wars"];
            const canAddToTeam = allowedTags.includes(normalizedTag);

            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() =>
                  navigation.navigate("Detail", { item: item })
                }
                activeOpacity={0.8}
              >
                <Image source={{ uri: item.image }} style={styles.image} />
                <Text style={styles.name}>{item.title || item.name}</Text>
                <Text style={styles.itemTag}>{item.tag}</Text>

                <View style={styles.buttonsRow}>
                  {/* Botón eliminar de favoritos */}
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => removeFavorite(item.id)}
                  >
                    <Ionicons name="heart-dislike" size={26} color="#FF6B6B" />
                  </TouchableOpacity>

                  {/* Botón agregar a equipo (solo para categorías permitidas) */}
                  {canAddToTeam ? (
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => handleAddToTeam(item)}
                    >
                      <Ionicons name="people" size={26} color="#FCB495" />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.iconButton, { opacity: 0.3 }]}
                      onPress={() => 
                        Alert.alert(
                          "ℹ️ Información",
                          "Solo Pokémon, Marvel y Star Wars pueden agregarse a equipos.",
                          [{ text: "Entendido" }]
                        )
                      }
                    >
                      <Ionicons name="people" size={26} color="#CCC" />
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      )}

      {/* Modal para seleccionar equipo */}
      <Modal visible={showTeamsModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecciona un equipo</Text>
            
            {/* Filtrar equipos por categoría del personaje */}
            {selectedItem && teams
              .filter(team => {
                const normalizedTeamCategory = team.category.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                const normalizedMemberTag = selectedItem.tag?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                return normalizedTeamCategory === normalizedMemberTag;
              })
              .map((team) => (
                <TouchableOpacity
                  key={team.id}
                  style={styles.teamOption}
                  onPress={() => handleSelectTeam(team.id)}
                >
                  <Text style={styles.teamName}>{team.name}</Text>
                  <Text style={styles.teamCategory}>{team.category}</Text>
                </TouchableOpacity>
              ))
            }
            
            {selectedItem && teams.filter(team => {
              const normalizedTeamCategory = team.category.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
              const normalizedMemberTag = selectedItem.tag?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
              return normalizedTeamCategory === normalizedMemberTag;
            }).length === 0 && (
              <Text style={styles.noTeamsText}>
                No tienes equipos de {selectedItem?.tag}. Crea uno primero.
              </Text>
            )}
            
            <TouchableOpacity
              onPress={() => setShowTeamsModal(false)}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff", 
    padding: 20 
  },
  title: { 
    fontSize: 22, 
    fontWeight: "bold", 
    marginBottom: 16, 
    color: "#222" 
  },
  empty: { 
    textAlign: "center", 
    color: "#777", 
    marginTop: 30 
  },

  // 🔹 Estilos de filtros
  filterContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#f2f2f2",
  },
  filterButtonActive: {
    backgroundColor: "#FCB495",
    borderColor: "#FCB495",
  },
  filterText: {
    color: "#555",
    fontWeight: "600",
  },
  filterTextActive: {
    color: "#fff",
  },

  // 🔹 Cards
  card: {
    alignItems: "center",
    backgroundColor: "#fdfdfd",
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  image: { 
    width: 100, 
    height: 100, 
    marginBottom: 10,
    borderRadius: 8 
  },
  name: { 
    fontSize: 18, 
    fontWeight: "600", 
    color: "#333", 
    textAlign: "center",
    marginBottom: 5 
  },
  itemTag: {
    fontSize: 14,
    color: "#666",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginBottom: 10,
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 30,
    marginTop: 10,
  },
  iconButton: { 
    padding: 6 
  },

  // 🔹 Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 16,
    width: "80%",
    alignItems: "center",
    elevation: 5,
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: "bold", 
    marginBottom: 16, 
    color: "#333" 
  },
  teamOption: {
    padding: 12,
    backgroundColor: "#FCB495",
    borderRadius: 10,
    marginVertical: 6,
    width: "100%",
    alignItems: "center",
  },
  teamName: { 
    color: "#fff", 
    fontWeight: "600", 
    textAlign: "center",
    fontSize: 16,
  },
  teamCategory: {
    fontSize: 12,
    color: "#fff",
    opacity: 0.8,
    marginTop: 2,
  },
  noTeamsText: {
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
    marginVertical: 10,
  },
  cancelButton: { 
    marginTop: 15,
    padding: 10,
  },
  cancelText: { 
    color: "#FF6B6B", 
    fontWeight: "bold",
    fontSize: 16,
  },
});