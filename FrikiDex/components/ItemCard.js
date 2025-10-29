// components/ItemCard.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFavorites } from "../context/FavoritesContext";
import { useTeams } from "../context/TeamsContext";
import { useNavigation } from "@react-navigation/native";

export default function ItemCard({ item }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { teams, toggleTeamMember } = useTeams();
  const navigation = useNavigation();

  const [modalVisible, setModalVisible] = useState(false);
  const [currentTeams, setCurrentTeams] = useState(teams); // 🔥 NUEVO: Estado local
  const [isInAnyTeam, setIsInAnyTeam] = useState(false); // 🔥 NUEVO: Estado local
  const [teamsWithItem, setTeamsWithItem] = useState([]); // 🔥 NUEVO: Estado local

  const isItemFavorite = isFavorite(item.id, item.tag);

  // useEffect para sincronizar con teams actualizado
  useEffect(() => {
    setCurrentTeams(teams);
    updateTeamStatus(teams);
  }, [teams, item.id]); // Escuchar cambios en teams y item.id

  // Función para actualizar el estado de equipos
     const updateTeamStatus = (teamsData) => {
       const itemInTeams = getTeamsWithItem(teamsData, item);
       console.log("DEBUG ItemCard - item:", item.title, "item.id:", item.id, "safeItemId:", item.id.toString(), "tag:", item.tag);
       console.log("DEBUG ItemCard - teamsData:", teamsData.map(t => ({ name: t.name, category: t.category, itemsKeys: t.items ? Object.keys(t.items) : [] })));
       setIsInAnyTeam(itemInTeams.length > 0);
       setTeamsWithItem(itemInTeams);
     };
     

  // Convertir item.id a string antes de usar .replace()
  const getSafeItemId = (item) => {
    const itemId = item?.id?.toString() || '';
    //return itemId.replace(/[.#$\/\[\]]/g, '_');
  };

  //Recibir teams como parámetro
  const isItemInAnyTeam = (teamsData, item) => {
    if (!item || !item.id) return false;

    const safeItemId = item.id.toString();

    return teamsData.some(team => {
      if (!team || !team.items) return false;

      if (typeof team.items === 'object' && !Array.isArray(team.items)) {
        return team.items[safeItemId] !== undefined;
      }

      return false;
    });
  };

  // 🔥 ACTUALIZADO: Recibir teams como parámetro
  const getTeamsWithItem = (teamsData, item) => {
    if (!item || !item.id) return [];

    const safeItemId = item.id.toString();

    return teamsData.filter(team => {
      if (!team || !team.items) return false;

      if (typeof team.items === 'object' && !Array.isArray(team.items)) {
        return team.items[safeItemId] !== undefined;
      }

      return false;
    });
  };

  const handleHeartPress = async () => {
    try {
      const result = await toggleFavorite(item);

      if (result.action === "added") {
        console.log("✅ Agregado a favoritos:", item.title || item.name);
      } else {
        console.log("❌ Removido de favoritos:", item.title || item.name);
      }
    } catch (error) {
      Alert.alert("❌ Error", "No se pudo actualizar favoritos: " + error.message);
    }
  };

  const handleTeamAction = () => {
    // Permitir Pokémon, Marvel y Star Wars
    const normalizedTag = item.tag?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const allowedTags = ["pokemon", "marvel", "star wars"];

    if (!allowedTags.includes(normalizedTag)) {
      Alert.alert(
        "🚫 No permitido",
        "Solo puedes agregar Pokémon, Marvel y Star Wars a los equipos."
      );
      return;
    }

    // Filtrar equipos compatibles con la categoría del item
    const compatibleTeams = currentTeams.filter(team => {
      if (!team || !team.category) return false;
      const normalizedTeamCategory = team.category.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return normalizedTeamCategory === normalizedTag;
    });

    if (compatibleTeams.length === 0) {
      Alert.alert(
        "⚠️ No hay equipos",
        `No tienes equipos de ${item.tag}. Primero debes crear un equipo en la pestaña de Equipos.`
      );
      return;
    }

    // Mostrar modal con lista de equipos compatibles
    setModalVisible(true);
  };

  const handleToggleTeam = async (team) => {
    // Verificar que el equipo sea compatible con el item
    const normalizedTag = item.tag?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const normalizedTeamCategory = team.category?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    if (normalizedTag !== normalizedTeamCategory) {
      Alert.alert(
        "❌ Error",
        `No puedes agregar ${item.tag} a un equipo de ${team.category}.`
      );
      return;
    }

    try {
      const result = await toggleTeamMember(team.id, item);

      if (result.action === "added") {
        Alert.alert("✅ Agregado", `${item.title || item.name} fue agregado al equipo ${team.name}.`);
      } else {
        Alert.alert("✅ Removido", `${item.title || item.name} fue removido del equipo.`);
      }

      setModalVisible(false);
      // NO llamar updateTeamStatus aquí, se hará automáticamente con el useEffect
    } catch (error) {
      Alert.alert("❌ Error", "No se pudo actualizar el equipo: " + error.message);
    }
  };

  const handlePress = () => {
    navigation.navigate("Detail", { item });
  };

  // Usar currentTeams en lugar de teams
  const getCompatibleTeams = () => {
    const normalizedTag = item.tag?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return currentTeams.filter(team => {
      if (!team || !team.category) return false;
      const normalizedTeamCategory = team.category.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return normalizedTeamCategory === normalizedTag;
    });
  };

  // Usar currentTeams en lugar de teams
  const isItemInTeam = (team) => {
    if (!item || !item.id || !team || !team.items) return false;

    const safeItemId = item.id.toString();

    if (typeof team.items === 'object' && !Array.isArray(team.items)) {
      return team.items[safeItemId] !== undefined;
    }

    return false;
  };

  const compatibleTeams = getCompatibleTeams();

  return (
    <>
      <TouchableOpacity
        style={styles.card}
        onPress={handlePress}
        activeOpacity={0.85}
      >
        <Image
          source={{ uri: item.image }}
          style={styles.image}
          resizeMode="cover"
          onError={() => console.log("Error loading image for:", item.title)}
        />
        <View style={styles.content}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{item.title || item.name}</Text>
            {item.subtitle ? (
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            ) : null}
          </View>

          <View style={styles.right}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.tag}</Text>
            </View>

            {/*Usar estados locales */}
            {isInAnyTeam && teamsWithItem.length > 0 && (
              <View style={styles.teamsInfo}>
                <Ionicons name="people" size={10} color="#4CAF50" />
                <Text style={styles.teamsText}>
                  En {teamsWithItem.length} equipo{teamsWithItem.length > 1 ? 's' : ''}
                </Text>
              </View>
            )}

            <View style={styles.iconRow}>
              {/* ❤️ Favoritos */}
              <TouchableOpacity
                onPress={handleHeartPress}
                style={styles.iconButton}
              >
                <Ionicons
                  name={isItemFavorite ? "heart" : "heart-outline"}
                  size={20}
                  color={isItemFavorite ? "#FF6B6B" : "#FCB495"}
                />
              </TouchableOpacity>

              {/* 👥 Equipos (solo mostrar para categorías permitidas) */}
              <TouchableOpacity
                onPress={handleTeamAction}
                style={styles.iconButton}
              >
                <Ionicons
                  name={isInAnyTeam ? "people" : "people-outline"}
                  size={20}
                  color={isInAnyTeam ? "#4CAF50" : "#4ECDC4"}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isInAnyTeam ? "Gestionar en equipos" : "Agregar a equipo"}
            </Text>
            <Text style={styles.modalSubtitle}>
              {item?.title || item?.name}
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
                No hay equipos de {item?.tag} disponibles.
              </Text>
            )}

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    marginVertical: 10,
    overflow: "hidden",
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  image: { width: "100%", height: 160 },
  content: { flexDirection: "row", alignItems: "center", padding: 12 },
  title: { fontSize: 16, fontWeight: "700", color: "#222" },
  subtitle: { fontSize: 12, color: "#666", marginTop: 4 },
  right: { alignItems: "flex-end", marginLeft: 8 },
  badge: {
    backgroundColor: "#FCB495",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 6,
  },
  badgeText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  // 🔥 NUEVO: Estilos para info de equipos
  teamsInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  teamsText: {
    fontSize: 10,
    color: "#4CAF50",
    marginLeft: 4,
    fontWeight: "500",
  },
  iconRow: { flexDirection: "row" },
  iconButton: { padding: 6 },

  // 🔥 ACTUALIZADO: Modal styles igual que FavoritesScreen
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