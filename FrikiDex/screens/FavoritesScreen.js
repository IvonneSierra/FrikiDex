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
  const { teams, addItemToTeam, removeItemFromTeam, toggleTeamMember } = useTeams();

  const [selectedItem, setSelectedItem] = useState(null);
  const [showTeamsModal, setShowTeamsModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  const categories = ["Todos", ...new Set(favorites.map((f) => f.tag))];

  const handleTeamAction = (item) => {
    const normalizedTag = item.tag?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const allowedTags = ["pokemon", "marvel", "star wars"];

    if (!allowedTags.includes(normalizedTag)) {
      Alert.alert("❌ No disponible", "Solo los Pokémon, personajes de Marvel y Star Wars pueden gestionarse en equipos.", [{ text: "Entendido" }]);
      return;
    }

    const itemInTeams = getTeamsWithItem(item);
    console.log("DEBUG handleTeamAction - item:", item.title, "itemInTeams.length:", itemInTeams.length, "tag:", normalizedTag);

    if (itemInTeams.length > 0) {
      // Remover: abrir modal
      setSelectedItem(item);
      setShowTeamsModal(true);
    } else {
      // Agregar: verificar equipos compatibles
      handleAddToTeam(item);
    }
  };


  const getTeamsWithItem = (item) => {
    if (!item || !item.id) return [];

    const itemId = item.id.toString();  // Sin replace para evitar mismatches

    console.log("DEBUG getTeamsWithItem - itemId:", itemId, "item.tag:", item.tag);

    return teams.filter(team => {
      if (!team || !team.items) {
        console.log("DEBUG - team sin items:", team?.name);
        return false;
      }

      // Si es objeto (como se asume)
      if (typeof team.items === 'object' && !Array.isArray(team.items)) {
        const exists = team.items[itemId] !== undefined;
        console.log("DEBUG - team:", team.name, "items keys:", Object.keys(team.items), "exists:", exists);
        return exists;
      }

      // Si es array (por si acaso)
      if (Array.isArray(team.items)) {
        const exists = team.items.some(teamItem => teamItem.id?.toString() === itemId);
        console.log("DEBUG - team (array):", team.name, "exists:", exists);
        return exists;
      }

      return false;
    });
  };

  // 🔥 MODIFICADO: Verificar si un item está en algún equipo
  const isItemInAnyTeam = (item) => {
    if (!item || !item.id) return false;

    const itemId = item.id.toString();  // Sin replace

    return teams.some(team => {
      if (!team || !team.items) return false;

      if (typeof team.items === 'object' && !Array.isArray(team.items)) {
        return team.items[itemId] !== undefined;
      }

      if (Array.isArray(team.items)) {
        return team.items.some(teamItem => teamItem.id?.toString() === itemId);
      }

      return false;
    });
  };

  const handleAddToTeam = (item) => {
    // Filtrar equipos que coincidan con la categoría del personaje
    const normalizedTag = item.tag?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const compatibleTeams = teams.filter(team => {
      const normalizedTeamCategory = team.category?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
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

  // 🔥 NUEVA: Función para agregar a equipo específico
  const handleAddToSpecificTeam = async (teamId) => {
    try {
      await addItemToTeam(teamId, {
        id: selectedItem.id.toString().replace(/[.#$\/\[\]]/g, '_'),
        title: selectedItem.title || selectedItem.name || "Sin nombre",
        image: selectedItem.image || "",
        description: selectedItem.description || "Sin descripción",
        rating: selectedItem.rating || null,
        tag: selectedItem.tag || "Sin categoría",
        itemType: "character",
        apiSource: selectedItem.apiSource || getApiSourceFromTag(selectedItem.tag),
        category: selectedItem.tag
      });

      setShowTeamsModal(false);
      Alert.alert("✅ Agregado", `${selectedItem.title || selectedItem.name} fue agregado al equipo.`);
    } catch (error) {
      Alert.alert("❌ Error", "No se pudo agregar al equipo: " + error.message);
    }
  };

  // 🔥 NUEVA: Función para remover de equipo específico
  const handleRemoveFromTeam = async (teamId) => {
    try {
      await removeItemFromTeam(teamId, selectedItem.id);
      setShowTeamsModal(false);
      Alert.alert("✅ Removido", `${selectedItem.title || selectedItem.name} fue removido del equipo.`);
    } catch (error) {
      Alert.alert("❌ Error", "No se pudo remover del equipo: " + error.message);
    }
  };

  // 🔥 NUEVA: Función para toggle (agregar/remover) en equipo
  const handleToggleTeam = async (team) => {
    try {
      const result = await toggleTeamMember(team.id, selectedItem);

      if (result.action === "added") {
        Alert.alert("✅ Agregado", `${selectedItem.title || selectedItem.name} fue agregado al equipo ${team.name}.`);
      } else {
        Alert.alert("✅ Removido", `${selectedItem.title || selectedItem.name} fue removido del equipo.`);
      }

      setShowTeamsModal(false);
    } catch (error) {
      Alert.alert("❌ Error", "No se pudo actualizar el equipo: " + error.message);
    }
  };

  // Función auxiliar para determinar el apiSource basado en el tag
  const getApiSourceFromTag = (tag) => {
    const tagMap = {
      "Pokémon": "pokemon",
      "Marvel": "marvel",
      "Star Wars": "starWars",
      "Videojuegos": "igdb",
      "Anime": "jikan",
      "Películas": "tmdb"
    };
    return tagMap[tag] || "unknown";
  };

  const filteredFavorites =
    selectedCategory === "Todos"
      ? favorites
      : favorites.filter((f) => f.tag === selectedCategory);

  // 🔥 NUEVA: Obtener equipos compatibles para el modal
  const getCompatibleTeams = () => {
    if (!selectedItem) return [];

    const normalizedTag = selectedItem.tag?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return teams.filter(team => {
      const normalizedTeamCategory = team.category?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return normalizedTeamCategory === normalizedTag;
    });
  };

  // 🔥 NUEVA: Verificar si el item está en un equipo específico
  const isItemInTeam = (team) => {
    if (!selectedItem || !selectedItem.id || !team || !team.items) return false;

    const safeItemId = selectedItem.id.toString().replace(/[.#$\/\[\]]/g, '_');

    if (typeof team.items === 'object' && !Array.isArray(team.items)) {
      return team.items[safeItemId] !== undefined;
    }

    return false;
  };

  const compatibleTeams = getCompatibleTeams();
  const itemInTeams = selectedItem ? getTeamsWithItem(selectedItem) : [];
  const isCurrentlyInTeams = selectedItem ? isItemInAnyTeam(selectedItem) : false;

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

      {/* Contador de favoritos */}
      <Text style={styles.favoritesCount}>
        {filteredFavorites.length} {filteredFavorites.length === 1 ? 'favorito' : 'favoritos'}
        {selectedCategory !== "Todos" && ` en ${selectedCategory}`}
      </Text>

      {/* Lista de favoritos */}
      {filteredFavorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-dislike-outline" size={60} color="#CCC" />
          <Text style={styles.empty}>No hay elementos en esta categoría.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredFavorites}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            const normalizedTag = item.tag?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const allowedTags = ["pokemon", "marvel", "star wars"];
            const canManageTeams = allowedTags.includes(normalizedTag);
            const inTeams = isItemInAnyTeam(item);
            const teamsWithItem = getTeamsWithItem(item);

            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() =>
                  navigation.navigate("Detail", { item: item })
                }
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: item.image }}
                  style={styles.image}
                  onError={() => console.log("Error loading image:", item.image)}
                />
                <View style={styles.cardContent}>
                  <Text style={styles.name}>{item.title || item.name}</Text>
                  <Text style={styles.itemTag}>{item.tag}</Text>

                  {/* 🔥 NUEVO: Mostrar en qué equipos está */}
                  {inTeams && teamsWithItem.length > 0 && (
                    <View style={styles.teamsInfo}>
                      <Ionicons name="people" size={12} color="#4CAF50" />
                      <Text style={styles.teamsText}>
                        En {teamsWithItem.length} equipo{teamsWithItem.length > 1 ? 's' : ''}
                      </Text>
                    </View>
                  )}

                  {item.rating && (
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={16} color="#FFD700" />
                      <Text style={styles.rating}>{Math.round(item.rating)}</Text>
                    </View>
                  )}

                  <View style={styles.buttonsRow}>
                    {/* Botón eliminar de favoritos */}
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => {
                        Alert.alert(
                          "Eliminar favorito",
                          `¿Estás seguro de que quieres eliminar ${item.title || item.name} de favoritos?`,
                          [
                            { text: "Cancelar", style: "cancel" },
                            {
                              text: "Eliminar",
                              style: "destructive",
                              onPress: () => removeFavorite(item.id)
                            }
                          ]
                        );
                      }}
                    >
                      <Ionicons name="heart-dislike" size={26} color="#FF6B6B" />
                    </TouchableOpacity>

                    {/* 🔥 MEJORADO: Botón gestionar equipos */}
                    {canManageTeams ? (
                      <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => handleTeamAction(item)}
                      >
                        <Ionicons
                          name={inTeams ? "people" : "people-outline"}
                          size={26}
                          color={inTeams ? "#4CAF50" : "#4ECDC4"}
                        />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={[styles.iconButton, { opacity: 0.3 }]}
                        onPress={() =>
                          Alert.alert(
                            "ℹ️ Información",
                            "Solo Pokémon, Marvel y Star Wars pueden gestionarse en equipos.",
                            [{ text: "Entendido" }]
                          )
                        }
                      >
                        <Ionicons name="people-outline" size={26} color="#CCC" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      )}

      {/* 🔥 MEJORADO: Modal para gestionar equipos */}
      <Modal visible={showTeamsModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isCurrentlyInTeams ? "Gestionar en equipos" : "Agregar a equipo"}
            </Text>
            <Text style={styles.modalSubtitle}>
              {selectedItem?.title || selectedItem?.name}
            </Text>

            {compatibleTeams.length > 0 ? (
              <FlatList
                data={compatibleTeams}
                keyExtractor={(team) => team.id?.toString() || Math.random().toString()}
                style={styles.teamsList}
                renderItem={({ item: team }) => {
                  const isInThisTeam = isItemInTeam(team);

                  return (
                    <View style={styles.teamItem}>
                      <View style={styles.teamInfo}>
                        <Text style={styles.teamName}>{team.name}</Text>
                        <Text style={styles.teamCategory}>{team.category}</Text>
                        <Text style={styles.teamMembers}>
                          {team.items ? Object.keys(team.items).length : 0} miembros
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={[
                          styles.teamActionButton,
                          isInThisTeam ? styles.removeButton : styles.addButton
                        ]}
                        onPress={() => handleToggleTeam(team)}
                      >
                        <Ionicons
                          name={isInThisTeam ? "remove-circle" : "add-circle"}
                          size={20}
                          color="#fff"
                        />
                        <Text style={styles.teamActionText}>
                          {isInThisTeam ? "Remover" : "Agregar"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                }}
              />
            ) : (
              <Text style={styles.noTeamsText}>
                No hay equipos de {selectedItem?.tag} disponibles.
              </Text>
            )}

            <TouchableOpacity
              onPress={() => setShowTeamsModal(false)}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelText}>Cerrar</Text>
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
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#222",
    textAlign: "center"
  },
  favoritesCount: {
    textAlign: "center",
    color: "#666",
    marginBottom: 16,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
  },
  empty: {
    textAlign: "center",
    color: "#777",
    marginTop: 16,
    fontSize: 16,
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f2f2f2",
  },
  filterButtonActive: {
    backgroundColor: "#3F3D56",
    borderColor: "#3F3D56",
  },
  filterText: {
    color: "#555",
    fontWeight: "600",
    fontSize: 12,
  },
  filterTextActive: {
    color: "#fff",
  },

  // 🔹 Cards
  card: {
    flexDirection: "row",
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
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  itemTag: {
    fontSize: 12,
    color: "#666",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  // 🔥 NUEVO: Estilos para info de equipos
  teamsInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  teamsText: {
    fontSize: 11,
    color: "#4CAF50",
    marginLeft: 4,
    fontWeight: "500",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  rating: {
    marginLeft: 4,
    color: "#666",
    fontWeight: "600",
  },
  buttonsRow: {
    flexDirection: "row",
    gap: 20,
  },
  iconButton: {
    padding: 8,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
  },

  // 🔥 MEJORADO: Modal styles
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
    width: "90%",
    maxHeight: "80%",
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  teamsList: {
    width: "100%",
    marginBottom: 10,
  },
  // 🔥 NUEVO: Estilos para items de equipo
  teamItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 10,
    marginVertical: 5,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    color: "#333",
    fontWeight: "bold",
    fontSize: 16,
  },
  teamCategory: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  teamMembers: {
    fontSize: 10,
    color: "#888",
    marginTop: 2,
  },
  teamActionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 10,
  },
  addButton: {
    backgroundColor: "#4ECDC4",
  },
  removeButton: {
    backgroundColor: "#FF6B6B",
  },
  teamActionText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
    marginLeft: 4,
  },
  noTeamsText: {
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
    marginVertical: 20,
    padding: 16,
  },
  cancelButton: {
    marginTop: 15,
    padding: 12,
    width: "100%",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  cancelText: {
    color: "#FF6B6B",
    fontWeight: "bold",
    fontSize: 16,
  },
});