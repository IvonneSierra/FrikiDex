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
  const { teams, addPokemonToTeam } = useTeams();

  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [showTeamsModal, setShowTeamsModal] = useState(false);

  const handleAddToTeam = (pokemon) => {
    if (teams.length === 0) {
      Alert.alert("No tienes equipos", "Primero crea un equipo en la pestaña de Equipos.");
      return;
    }
    setSelectedPokemon(pokemon);
    setShowTeamsModal(true);
  };

  const handleSelectTeam = (teamId) => {
    addPokemonToTeam(teamId, selectedPokemon);
    setShowTeamsModal(false);
    Alert.alert("✅ Agregado", `${selectedPokemon.name} fue agregado al equipo.`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pokémon Favoritos</Text>

      {favorites.length === 0 ? (
        <Text style={styles.empty}>No tienes Pokémon favoritos aún.</Text>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate("PokemonDetail", { pokemon: item })}
              activeOpacity={0.8}
            >
              <Image source={{ uri: item.image }} style={styles.image} />
              <Text style={styles.name}>{item.name}</Text>
              <View style={styles.buttonsRow}>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => removeFavorite(item.id)}
                >
                  <Ionicons name="heart-dislike" size={26} color="#FF6B6B" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => handleAddToTeam(item)}
                >
                  <Ionicons name="people" size={26} color="#FCB495" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      )}

      {/* Modal para elegir equipo */}
      <Modal visible={showTeamsModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecciona un equipo</Text>
            {teams.map((team) => (
              <TouchableOpacity
                key={team.id}
                style={styles.teamOption}
                onPress={() => handleSelectTeam(team.id)}
              >
                <Text style={styles.teamName}>{team.name}</Text>
              </TouchableOpacity>
            ))}
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
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 16, color: "#222" },
  empty: { textAlign: "center", color: "#777", marginTop: 30 },
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
  image: { width: 100, height: 100, marginBottom: 10 },
  name: { fontSize: 18, fontWeight: "600", color: "#333", textTransform: "capitalize" },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 30,
    marginTop: 10,
  },
  iconButton: { padding: 6 },
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
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 16, color: "#333" },
  teamOption: {
    padding: 10,
    backgroundColor: "#FCB495",
    borderRadius: 10,
    marginVertical: 6,
    width: "100%",
  },
  teamName: { color: "#fff", fontWeight: "600", textAlign: "center" },
  cancelButton: { marginTop: 10 },
  cancelText: { color: "#FF6B6B", fontWeight: "bold" },
});
