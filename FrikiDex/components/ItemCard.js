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
  const { teams, addPokemonToTeam, removePokemonFromTeam } = useTeams();
  const navigation = useNavigation();

  const [modalVisible, setModalVisible] = useState(false);

  const isItemFavorite = isFavorite(item.id, item.tag);
  const isItemInAnyTeam = teams.some((team) =>
    team.pokemons.some((p) => p.id === item.id)
  );

  const handleHeartPress = () => {
    toggleFavorite(item);
  };

  const handleTeamPress = () => {
    // ⚠️ Verificar si el ítem es un Pokémon
    if (item.tag.toLowerCase() !== "pokémon" && item.tag.toLowerCase() !== "pokemon") {
      Alert.alert(
        "🚫 No permitido",
        "Solo puedes agregar Pokémon a los equipos."
      );
      return;
    }

    if (teams.length === 0) {
      Alert.alert("⚠️ No hay equipos", "Primero debes crear un equipo.");
      return;
    }

    // Mostrar modal con lista de equipos Pokémon
    setModalVisible(true);
  };

  const handleSelectTeam = (team) => {
    if (isItemInAnyTeam) {
      removePokemonFromTeam(team.id, item.id);
    } else {
      addPokemonToTeam(team.id, item);
    }
    setModalVisible(false);
  };

  const handlePress = () => {
    navigation.navigate("Details", { item });
  };

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
            <Text style={styles.title}>{item.title}</Text>
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

              {/* 👥 Equipos */}
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
            <Text style={styles.modalTitle}>Agregar a equipo</Text>

            <FlatList
              data={teams}
              keyExtractor={(team) => team.id.toString()}
              renderItem={({ item: team }) => (
                <TouchableOpacity
                  style={styles.teamButton}
                  onPress={() => handleSelectTeam(team)}
                >
                  <Text style={styles.teamText}>{team.name}</Text>
                </TouchableOpacity>
              )}
            />

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
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  teamButton: {
    backgroundColor: "#FCB495",
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    width: "100%",
    alignItems: "center",
  },
  teamText: {
    color: "#fff",
    fontWeight: "bold",
  },
  closeButton: {
    marginTop: 10,
  },
  closeButtonText: {
    color: "#FCB495",
    fontWeight: "bold",
  },
});
