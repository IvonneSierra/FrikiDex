import React, { useState } from "react";
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
  const { teams, addMemberToTeam, removeMemberFromTeam } = useTeams();
  const navigation = useNavigation();

  const [modalVisible, setModalVisible] = useState(false);

  const isItemFavorite = isFavorite(item.id, item.tag);
  
  // CORRECCIÓN: Usar team.members en lugar de team.pokemons
  const isItemInAnyTeam = teams.some((team) =>
    team.members.some((p) => p.id === item.id)
  );

  const handleHeartPress = () => {
    toggleFavorite(item);
  };

  const handleTeamPress = () => {
    // ✅ Permitir Pokémon, Marvel y Star Wars
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
    const compatibleTeams = teams.filter(team => {
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

  const handleSelectTeam = (team) => {
    // Verificar que el equipo sea compatible con el item
    const normalizedTag = item.tag?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const normalizedTeamCategory = team.category.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    if (normalizedTag !== normalizedTeamCategory) {
      Alert.alert(
        "❌ Error",
        `No puedes agregar ${item.tag} a un equipo de ${team.category}.`
      );
      return;
    }

    if (isItemInAnyTeam) {
      // Encontrar en qué equipo está y removerlo
      const teamWithItem = teams.find(t => 
        t.members.some(m => m.id === item.id)
      );
      if (teamWithItem) {
        removeMemberFromTeam(teamWithItem.id, item.id);
        Alert.alert("✅ Removido", `${item.title || item.name} fue removido del equipo.`);
      }
    } else {
      addMemberToTeam(team.id, item);
      Alert.alert("✅ Agregado", `${item.title || item.name} fue agregado al equipo ${team.name}.`);
    }
    setModalVisible(false);
  };

  const handlePress = () => {
    navigation.navigate("Details", { item });
  };

  // Obtener equipos compatibles para el modal
  const compatibleTeams = teams.filter(team => {
    const normalizedTag = item.tag?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const normalizedTeamCategory = team.category.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return normalizedTag === normalizedTeamCategory;
  });

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
                onPress={handleTeamPress}
                style={styles.iconButton}
              >
                <Ionicons
                  name={isItemInAnyTeam ? "people" : "people-outline"}
                  size={20}
                  color={isItemInAnyTeam ? "#4CAF50" : "#B0B0B0"}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* 🔹 Modal para elegir equipo */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isItemInAnyTeam ? "Remover de equipo" : "Agregar a equipo"}
            </Text>
            <Text style={styles.modalSubtitle}>{item.title || item.name}</Text>

            {compatibleTeams.length > 0 ? (
              <FlatList
                data={compatibleTeams}
                keyExtractor={(team) => team.id.toString()}
                style={styles.teamsList}
                renderItem={({ item: team }) => {
                  const isInThisTeam = team.members.some(m => m.id === item.id);
                  return (
                    <TouchableOpacity
                      style={[
                        styles.teamButton,
                        isInThisTeam && styles.teamButtonRemove
                      ]}
                      onPress={() => handleSelectTeam(team)}
                    >
                      <Text style={styles.teamText}>{team.name}</Text>
                      <Text style={styles.teamCategory}>{team.category}</Text>
                      <Text style={styles.teamAction}>
                        {isInThisTeam ? "❌ Remover" : "✅ Agregar"}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />
            ) : (
              <Text style={styles.noTeamsText}>
                No hay equipos de {item.tag} disponibles.
              </Text>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cancelar</Text>
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
  iconRow: { flexDirection: "row" },
  iconButton: { padding: 6 },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
    textAlign: "center",
  },
  teamsList: {
    width: "100%",
    marginBottom: 10,
  },
  teamButton: {
    backgroundColor: "#FCB495",
    padding: 12,
    borderRadius: 10,
    marginVertical: 5,
    width: "100%",
    alignItems: "center",
  },
  teamButtonRemove: {
    backgroundColor: "#FF6B6B",
  },
  teamText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  teamCategory: {
    color: "#fff",
    opacity: 0.8,
    fontSize: 12,
    marginTop: 2,
  },
  teamAction: {
    color: "#fff",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "600",
  },
  noTeamsText: {
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
    marginVertical: 20,
  },
  closeButton: {
    marginTop: 10,
    padding: 10,
  },
  closeButtonText: {
    color: "#FCB495",
    fontWeight: "bold",
    fontSize: 16,
  },
});