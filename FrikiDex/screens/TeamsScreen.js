import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTeams } from "../context/TeamsContext";

export default function TeamsScreen() {
  const { teams, addTeam, removeTeam, renameTeam, removePokemonFromTeam } = useTeams();
  const [newTeamName, setNewTeamName] = useState("");

  const handleAddTeam = () => {
    if (newTeamName.trim() !== "") {
      addTeam(newTeamName.trim());
      setNewTeamName("");
    } else {
      Alert.alert("Error", "El nombre del equipo no puede estar vacío");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Mis Equipos Pokémon</Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Nombre del equipo"
          value={newTeamName}
          onChangeText={setNewTeamName}
        />
        <TouchableOpacity onPress={handleAddTeam} style={styles.addButton}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {teams.length === 0 ? (
        <Text style={styles.empty}>No tienes equipos aún.</Text>
      ) : (
        teams.map((team) => (
          <View key={team.id} style={styles.teamCard}>
            <View style={styles.teamHeader}>
              <Text style={styles.teamName}>{team.name}</Text>
              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={() => {
                    const newName = prompt("Nuevo nombre:");
                    if (newName) renameTeam(team.id, newName);
                  }}
                >
                  <Ionicons name="pencil" size={20} color="#FCB495" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeTeam(team.id)}>
                  <Ionicons name="trash" size={20} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            </View>

            {team.pokemons.length === 0 ? (
              <Text style={styles.noPokemons}>No hay Pokémon en este equipo.</Text>
            ) : (
              <FlatList
                horizontal
                data={team.pokemons}
                keyExtractor={(p) => p.id.toString()}
                renderItem={({ item }) => (
                  <View style={styles.pokemonCard}>
                    <Image
                      source={{ uri: item.image }}
                      style={styles.pokemonImage}
                    />
                    <Text style={styles.pokemonName}>{item.name}</Text>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removePokemonFromTeam(team.id, item.id)}
                    >
                      <Ionicons name="close" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                )}
              />
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 16, color: "#222" },
  inputRow: { flexDirection: "row", marginBottom: 20 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
  },
  addButton: {
    backgroundColor: "#FCB495",
    borderRadius: 10,
    marginLeft: 10,
    padding: 8,
    justifyContent: "center",
  },
  teamCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    elevation: 2,
  },
  teamHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  teamName: { fontSize: 18, fontWeight: "600", color: "#333" },
  actions: { flexDirection: "row", gap: 12 },
  empty: { textAlign: "center", color: "#777", marginTop: 30 },
  noPokemons: { color: "#888", fontStyle: "italic", marginLeft: 10 },
  pokemonCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    marginRight: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    position: "relative",
  },
  pokemonImage: { width: 80, height: 80 },
  pokemonName: { marginTop: 6, fontWeight: "500", color: "#333" },
  removeButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "#FF6B6B",
    borderRadius: 10,
    padding: 2,
  },
});
