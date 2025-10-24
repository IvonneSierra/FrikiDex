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
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTeams } from "../context/TeamsContext";

const TEAM_CATEGORIES = ["Pokémon", "Marvel", "Star Wars"];

export default function TeamsScreen() {
  const { teams, addTeam, removeTeam, renameTeam, removeMemberFromTeam } = useTeams();
  const [newTeamName, setNewTeamName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Pokémon");
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const handleAddTeam = () => {
    if (newTeamName.trim() !== "") {
      addTeam(newTeamName.trim(), selectedCategory);
      setNewTeamName("");
      setShowCategoryModal(false);
    } else {
      Alert.alert("Error", "El nombre del equipo no puede estar vacío");
    }
  };

  const handleRenameTeam = (teamId, currentName) => {
    Alert.prompt(
      "Renombrar equipo",
      "Ingresa el nuevo nombre:",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "OK", 
          onPress: (newName) => {
            if (newName && newName.trim() !== "") {
              renameTeam(teamId, newName.trim());
            }
          }
        }
      ],
      'plain-text',
      currentName
    );
  };

  // Agrupar equipos por categoría
  const teamsByCategory = TEAM_CATEGORIES.map(category => ({
    category,
    teams: teams.filter(team => team.category === category)
  }));

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Mis Equipos</Text>

      {/* Botón para crear nuevo equipo */}
      <TouchableOpacity 
        style={styles.createTeamButton}
        onPress={() => setShowCategoryModal(true)}
      >
        <Ionicons name="add-circle" size={24} color="#fff" />
        <Text style={styles.createTeamText}>Crear Nuevo Equipo</Text>
      </TouchableOpacity>

      {/* Lista de equipos por categoría */}
      {teamsByCategory.map(({ category, teams: categoryTeams }) => (
        <View key={category} style={styles.categorySection}>
          <Text style={styles.categoryTitle}>{category}</Text>
          
          {categoryTeams.length === 0 ? (
            <Text style={styles.empty}>No tienes equipos de {category}.</Text>
          ) : (
            categoryTeams.map((team) => (
              <View key={team.id} style={styles.teamCard}>
                <View style={styles.teamHeader}>
                  <View>
                    <Text style={styles.teamName}>{team.name}</Text>
                    <Text style={styles.teamCategory}>{team.category}</Text>
                  </View>
                  <View style={styles.actions}>
                    <TouchableOpacity
                      onPress={() => handleRenameTeam(team.id, team.name)}
                    >
                      <Ionicons name="pencil" size={20} color="#FCB495" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removeTeam(team.id)}>
                      <Ionicons name="trash" size={20} color="#FF6B6B" />
                    </TouchableOpacity>
                  </View>
                </View>

                {team.members.length === 0 ? (
                  <Text style={styles.noMembers}>No hay miembros en este equipo.</Text>
                ) : (
                  <FlatList
                    horizontal
                    data={team.members}
                    keyExtractor={(p) => p.id.toString()}
                    renderItem={({ item }) => (
                      <View style={styles.memberCard}>
                        <Image
                          source={{ uri: item.image }}
                          style={styles.memberImage}
                        />
                        <Text style={styles.memberName}>{item.title || item.name}</Text>
                        <TouchableOpacity
                          style={styles.removeButton}
                          onPress={() => removeMemberFromTeam(team.id, item.id)}
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
        </View>
      ))}

      {/* Modal para crear nuevo equipo */}
      <Modal visible={showCategoryModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Crear Nuevo Equipo</Text>
            
            <Text style={styles.modalLabel}>Categoría:</Text>
            <View style={styles.categoryButtons}>
              {TEAM_CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category && styles.categoryButtonActive
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text style={[
                    styles.categoryButtonText,
                    selectedCategory === category && styles.categoryButtonTextActive
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>Nombre del equipo:</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ej: Mi equipo épico"
              value={newTeamName}
              onChangeText={setNewTeamName}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCategoryModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={handleAddTeam}
              >
                <Text style={styles.createButtonText}>Crear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 16, color: "#222" },
  
  createTeamButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FCB495",
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  createTeamText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },

  categorySection: {
    marginBottom: 25,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    paddingBottom: 5,
    borderBottomWidth: 2,
    borderBottomColor: "#FCB495",
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
  teamCategory: { 
    fontSize: 12, 
    color: "#666", 
    backgroundColor: "#e0e0e0",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  actions: { flexDirection: "row", gap: 12 },
  empty: { textAlign: "center", color: "#777", marginVertical: 10 },
  noMembers: { color: "#888", fontStyle: "italic", marginLeft: 10 },

  memberCard: {
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
    width: 100,
  },
  memberImage: { width: 60, height: 60, borderRadius: 30 },
  memberName: { 
    marginTop: 6, 
    fontWeight: "500", 
    color: "#333",
    fontSize: 12,
    textAlign: 'center'
  },
  removeButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "#FF6B6B",
    borderRadius: 10,
    padding: 2,
  },

  // Modal styles
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
    width: "85%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  categoryButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  categoryButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
  },
  categoryButtonActive: {
    backgroundColor: "#FCB495",
  },
  categoryButtonText: {
    color: "#666",
    fontWeight: "600",
  },
  categoryButtonTextActive: {
    color: "#fff",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  createButton: {
    backgroundColor: "#FCB495",
  },
  cancelButtonText: {
    color: "#666",
    fontWeight: "600",
  },
  createButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});