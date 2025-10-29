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
  const { teams, addTeam, removeTeam, renameTeam, removeItemFromTeam } = useTeams();
  const [newTeamName, setNewTeamName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Pokémon");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  
  // 🔥 NUEVO: Estados para el modal de renombrar
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [teamToRename, setTeamToRename] = useState(null);
  const [newTeamNameInput, setNewTeamNameInput] = useState("");

  const handleAddTeam = () => {
    if (newTeamName.trim() !== "") {
      addTeam(newTeamName.trim(), selectedCategory);
      setNewTeamName("");
      setShowCategoryModal(false);
    } else {
      Alert.alert("Error", "El nombre del equipo no puede estar vacío");
    }
  };

  // 🔥 CORREGIDO: Función para abrir modal de renombrar
  const handleRenameTeam = (teamId, currentName) => {
    setTeamToRename({ id: teamId, currentName });
    setNewTeamNameInput(currentName);
    setShowRenameModal(true);
  };

  // 🔥 NUEVO: Función para confirmar renombrar
  const handleConfirmRename = () => {
    if (newTeamNameInput.trim() !== "" && teamToRename) {
      renameTeam(teamToRename.id, newTeamNameInput.trim());
      setShowRenameModal(false);
      setTeamToRename(null);
      setNewTeamNameInput("");
    } else {
      Alert.alert("Error", "El nombre del equipo no puede estar vacío");
    }
  };

  // 🔥 NUEVO: Función para cancelar renombrar
  const handleCancelRename = () => {
    setShowRenameModal(false);
    setTeamToRename(null);
    setNewTeamNameInput("");
  };

  // 🔥 CORRECCIÓN: Obtener items/miembros del equipo con validaciones
  const getTeamItems = (team) => {
    if (!team || !team.items) return [];
    
    // Si items es un objeto (como viene de Firebase), convertirlo a array
    if (typeof team.items === 'object' && !Array.isArray(team.items)) {
      return Object.values(team.items).filter(item => item != null);
    }
    
    // Si ya es un array, devolverlo directamente con filtro
    return (team.items || []).filter(item => item != null);
  };

  // 🔥 MODIFICACIÓN: Convertir teams a array si es un objeto, luego agrupar por categoría
  const teamsArray = Array.isArray(teams) ? teams : Object.values(teams || {});
  const teamsByCategory = TEAM_CATEGORIES.map(category => ({
    category,
    teams: teamsArray.filter(team => team && team.category === category)
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
            categoryTeams.map((team) => {
              if (!team) return null;
              
              const teamItems = getTeamItems(team);
              
              return (
                <View key={team.id} style={styles.teamCard}>
                  <View style={styles.teamHeader}>
                    <View>
                      <Text style={styles.teamName}>{team.name}</Text>
                      <Text style={styles.teamCategory}>{team.category}</Text>
                      <Text style={styles.teamCount}>
                        {teamItems.length} {teamItems.length === 1 ? 'miembro' : 'miembros'}
                      </Text>
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

                  {teamItems.length === 0 ? (
                    <Text style={styles.noMembers}>No hay miembros en este equipo.</Text>
                  ) : (
                    <FlatList
                      horizontal
                      data={teamItems}
                      keyExtractor={(item, index) => {
                        if (!item) return `empty-${index}`;
                        return item.id?.toString() || `item-${index}-${Date.now()}`;
                      }}
                      showsHorizontalScrollIndicator={false}
                      renderItem={({ item }) => {
                        if (!item) return null;
                        
                        return (
                          <View style={styles.memberCard}>
                            <Image
                              source={{ uri: item.image || "https://via.placeholder.com/60" }}
                              style={styles.memberImage}
                              onError={() => console.log("Error loading image for:", item.title)}
                            />
                            <Text style={styles.memberName} numberOfLines={2}>
                              {item.title || item.name || "Sin nombre"}
                            </Text>
                            <TouchableOpacity
                              style={styles.removeButton}
                              onPress={() => {
                                if (item.id) {
                                  removeItemFromTeam(team.id, item.id);
                                }
                              }}
                            >
                              <Ionicons name="close" size={16} color="#fff" />
                            </TouchableOpacity>
                          </View>
                        );
                      }}
                    />
                  )}
                </View>
              );
            })
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

      {/* 🔥 NUEVO: Modal para renombrar equipo */}
      <Modal visible={showRenameModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Renombrar Equipo</Text>
            
            <Text style={styles.modalLabel}>Nuevo nombre para el equipo:</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ingresa el nuevo nombre"
              value={newTeamNameInput}
              onChangeText={setNewTeamNameInput}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCancelRename}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={handleConfirmRename}
              >
                <Text style={styles.createButtonText}>Renombrar</Text>
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
  title: { 
    fontSize: 28, 
    fontWeight: "bold", 
    marginBottom: 20, 
    color: "#222",
    textAlign: "center"
  },
  
  createTeamButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3F3D56",
    padding: 15,
    borderRadius: 12,
    marginBottom: 25,
    elevation: 3,
  },
  createTeamText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 10,
  },

  categorySection: {
    marginBottom: 30,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    paddingBottom: 8,
    borderBottomWidth: 3,
    borderBottomColor: "#FCB495",
  },

  teamCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  teamHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  teamName: { 
    fontSize: 20, 
    fontWeight: "bold", 
    color: "#333",
    marginBottom: 4,
  },
  teamCategory: { 
    fontSize: 14, 
    color: "#666", 
    backgroundColor: "#e0e0e0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  teamCount: {
    fontSize: 12,
    color: "#888",
    fontStyle: "italic",
  },
  actions: { 
    flexDirection: "row", 
    gap: 15,
    marginTop: 4,
  },
  empty: { 
    textAlign: "center", 
    color: "#777", 
    marginVertical: 20,
    fontSize: 16,
    fontStyle: "italic",
  },
  noMembers: { 
    color: "#888", 
    fontStyle: "italic", 
    textAlign: "center",
    marginVertical: 15,
    fontSize: 14,
  },

  memberCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    marginRight: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    position: "relative",
    width: 100,
    height: 120,
  },
  memberImage: { 
    width: 60, 
    height: 60, 
    borderRadius: 30,
    marginBottom: 8,
  },
  memberName: { 
    fontWeight: "500", 
    color: "#333",
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 14,
  },
  removeButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "#FF6B6B",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
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
    padding: 24,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
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
    marginBottom: 20,
    gap: 8,
  },
  categoryButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  categoryButtonActive: {
    backgroundColor: "#FCB495",
    borderColor: "#FCB495",
  },
  categoryButtonText: {
    color: "#666",
    fontWeight: "600",
    fontSize: 14,
  },
  categoryButtonTextActive: {
    color: "#fff",
  },
  modalInput: {
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 25,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    elevation: 2,
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
    fontSize: 16,
  },
  createButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});