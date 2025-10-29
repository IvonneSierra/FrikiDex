import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoritesContext";
import { useTeams } from "../context/TeamsContext";

export default function ProfileScreen() {
  const { user, logout, updateUserProfile } = useAuth();
  const { favorites, clearAllFavorites } = useFavorites();
  const { teams, removeTeam } = useTeams();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.displayName) {
      setUsername(user.displayName);
    } else if (user?.email) {
      setUsername(user.email.split('@')[0]);
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!username.trim()) {
      Alert.alert("Error", "El nombre de usuario no puede estar vacío");
      return;
    }

    setLoading(true);
    try {
      await updateUserProfile(username.trim());
      setShowEditModal(false);
      Alert.alert("✅ Perfil actualizado", "Tu nombre de usuario ha sido actualizado correctamente");
    } catch (error) {
      Alert.alert("❌ Error", "No se pudo actualizar el perfil: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro de que quieres cerrar sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Cerrar Sesión", 
          style: "destructive",
          onPress: () => logout()
        }
      ]
    );
  };

  const handleClearFavorites = () => {
    Alert.alert(
      "Limpiar Favoritos",
      "¿Estás seguro de que quieres eliminar todos tus favoritos? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar Todos", 
          style: "destructive",
          onPress: () => {
            clearAllFavorites();
            setShowDeleteModal(false);
            Alert.alert("✅ Favoritos eliminados", "Todos tus favoritos han sido eliminados");
          }
        }
      ]
    );
  };

  const handleDeleteTeam = (teamId, teamName) => {
    Alert.alert(
      "Eliminar Equipo",
      `¿Estás seguro de que quieres eliminar el equipo "${teamName}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive",
          onPress: () => removeTeam(teamId)
        }
      ]
    );
  };

  // Estadísticas
  const stats = {
    totalFavorites: favorites.length,
    totalTeams: teams.length,
    totalMembers: teams.reduce((total, team) => {
      return total + (team.items ? Object.keys(team.items).length : 0);
    }, 0),
    favoriteCategory: getFavoriteCategory(),
    memberSince: user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : "Reciente"
  };

  function getFavoriteCategory() {
    const categories = {};
    favorites.forEach(fav => {
      categories[fav.tag] = (categories[fav.tag] || 0) + 1;
    });
    
    const mostPopular = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
    return mostPopular ? `${mostPopular[0]} (${mostPopular[1]})` : "Sin favoritos";
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header con información del usuario */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image 
            source={{ 
              uri: user?.photoURL || `https://ui-avatars.com/api/?name=${username}&background=FCB495&color=fff&size=128`
            }}
            style={styles.avatar}
          />
          <TouchableOpacity 
            style={styles.editAvatarButton}
            onPress={() => setShowEditModal(true)}
          >
            <Ionicons name="camera" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.username}>
          {user?.displayName || username || "Usuario"}
        </Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.memberSince}>Miembro desde: {stats.memberSince}</Text>
      </View>

      {/* Tarjetas de estadísticas */}
      <View style={styles.statsGrid}>
        <TouchableOpacity 
          style={styles.statCard}
          onPress={() => setShowStatsModal(true)}
        >
          <Ionicons name="stats-chart" size={24} color="#3F3D56" />
          <Text style={styles.statNumber}>{stats.totalFavorites}</Text>
          <Text style={styles.statLabel}>Favoritos</Text>
        </TouchableOpacity>

        <View style={styles.statCard}>
          <Ionicons name="people" size={24} color="#3F3D56" />
          <Text style={styles.statNumber}>{stats.totalTeams}</Text>
          <Text style={styles.statLabel}>Equipos</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="person" size={24} color="#3F3D56" />
          <Text style={styles.statNumber}>{stats.totalMembers}</Text>
          <Text style={styles.statLabel}>Miembros</Text>
        </View>
      </View>

      {/* Sección de acciones rápidas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
        
        <TouchableOpacity style={styles.actionButton} onPress={() => setShowStatsModal(true)}>
          <Ionicons name="analytics" size={20} color="#3F3D56" />
          <Text style={styles.actionText}>Ver Estadísticas Detalladas</Text>
          <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => setShowEditModal(true)}>
          <Ionicons name="person" size={20} color="#3F3D56" />
          <Text style={styles.actionText}>Editar Perfil</Text>
          <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => setShowDeleteModal(true)}>
          <Ionicons name="trash" size={20} color="#FF6B6B" />
          <Text style={[styles.actionText, { color: "#FF6B6B" }]}>Gestionar Datos</Text>
          <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </TouchableOpacity>
      </View>

      {/* Sección de equipos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mis Equipos ({teams.length})</Text>
        
        {teams.length === 0 ? (
          <Text style={styles.emptyText}>No tienes equipos creados</Text>
        ) : (
          teams.slice(0, 3).map((team) => (
            <View key={team.id} style={styles.teamItem}>
              <View style={styles.teamInfo}>
                <Text style={styles.teamName}>{team.name}</Text>
                <Text style={styles.teamCategory}>{team.category}</Text>
                <Text style={styles.teamMembers}>
                  {team.items ? Object.keys(team.items).length : 0} miembros
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.deleteTeamButton}
                onPress={() => handleDeleteTeam(team.id, team.name)}
              >
                <Ionicons name="trash" size={16} color="#FF6B6B" />
              </TouchableOpacity>
            </View>
          ))
        )}
        
        {teams.length > 3 && (
          <Text style={styles.moreText}>+{teams.length - 3} equipos más...</Text>
        )}
      </View>

      {/* Botón de cerrar sesión */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out" size={20} color="#fff" />
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>

      {/* Modal de editar perfil */}
      <Modal visible={showEditModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Perfil</Text>
            
            <Text style={styles.modalLabel}>Nombre de usuario:</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Tu nombre de usuario"
              value={username}
              onChangeText={setUsername}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowEditModal(false)}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleUpdateProfile}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de estadísticas */}
      <Modal visible={showStatsModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Estadísticas Detalladas</Text>
            
            <View style={styles.statsList}>
              <View style={styles.statItem}>
                <Text style={styles.statItemLabel}>Total de Favoritos:</Text>
                <Text style={styles.statItemValue}>{stats.totalFavorites}</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statItemLabel}>Total de Equipos:</Text>
                <Text style={styles.statItemValue}>{stats.totalTeams}</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statItemLabel}>Total de Miembros:</Text>
                <Text style={styles.statItemValue}>{stats.totalMembers}</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statItemLabel}>Categoría Favorita:</Text>
                <Text style={styles.statItemValue}>{stats.favoriteCategory}</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statItemLabel}>Miembro desde:</Text>
                <Text style={styles.statItemValue}>{stats.memberSince}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowStatsModal(false)}
            >
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de gestión de datos */}
      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Gestionar Datos</Text>
            
            <Text style={styles.modalWarning}>
              ⚠️ Estas acciones no se pueden deshacer
            </Text>

            <TouchableOpacity 
              style={[styles.actionButton, styles.dangerButton]}
              onPress={handleClearFavorites}
            >
              <Ionicons name="heart-dislike" size={20} color="#FF6B6B" />
              <Text style={[styles.actionText, { color: "#FF6B6B" }]}>
                Eliminar Todos los Favoritos ({favorites.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.dangerButton]}
              onPress={() => {
                setShowDeleteModal(false);
                Alert.alert("Próximamente", "Esta función estará disponible pronto");
              }}
            >
              <Ionicons name="trash" size={20} color="#FF6B6B" />
              <Text style={[styles.actionText, { color: "#FF6B6B" }]}>
                Eliminar Todos los Equipos ({teams.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowDeleteModal(false)}
            >
              <Text style={styles.closeButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    alignItems: "center",
    padding: 30,
    backgroundColor: "#f8f9fa",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#FCB495",
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "#FCB495",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: "#666",
    marginBottom: 5,
  },
  memberSince: {
    fontSize: 14,
    color: "#888",
    fontStyle: "italic",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
  },
  statCard: {
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 5,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#3F3D56",
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    marginBottom: 10,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    marginLeft: 10,
  },
  dangerButton: {
    backgroundColor: "#FFF5F5",
    borderWidth: 1,
    borderColor: "#FFE0E0",
  },
  teamItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    marginBottom: 8,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  teamCategory: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  teamMembers: {
    fontSize: 11,
    color: "#888",
    marginTop: 2,
  },
  deleteTeamButton: {
    padding: 8,
  },
  emptyText: {
    textAlign: "center",
    color: "#888",
    fontStyle: "italic",
    marginVertical: 10,
  },
  moreText: {
    textAlign: "center",
    color: "#FCB495",
    fontWeight: "600",
    marginTop: 5,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF6B6B",
    margin: 20,
    padding: 15,
    borderRadius: 12,
    elevation: 3,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
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
    fontSize: 20,
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
  modalInput: {
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
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
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  saveButton: {
    backgroundColor: "#FCB495",
  },
  cancelButtonText: {
    color: "#666",
    fontWeight: "600",
    fontSize: 16,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  statsList: {
    marginBottom: 20,
  },
  statItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  statItemLabel: {
    fontSize: 16,
    color: "#666",
  },
  statItemValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  modalWarning: {
    textAlign: "center",
    color: "#FF6B6B",
    fontWeight: "600",
    marginBottom: 20,
    fontSize: 14,
  },
  closeButton: {
    padding: 12,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  closeButtonText: {
    color: "#FCB495",
    fontWeight: "600",
    fontSize: 16,
  },
});