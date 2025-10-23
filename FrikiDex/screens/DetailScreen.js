import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFavorites } from "../context/FavoritesContext";

export default function DetailScreen({ route, navigation }) {
  const { item } = route.params;
  const { isFavorite, toggleFavorite } = useFavorites();
  const isItemFavorite = isFavorite(item.id, item.tag);

  const handleHeartPress = () => {
    toggleFavorite(item);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />

      <View style={styles.content}>
        {/* Título y botón de favorito */}
        <View style={styles.header}>
          <Text style={styles.title}>{item.title}</Text>
          <TouchableOpacity onPress={handleHeartPress}>
            <Ionicons
              name={isItemFavorite ? "heart" : "heart-outline"}
              size={28}
              color={isItemFavorite ? "#FF6B6B" : "#FCB495"}
            />
          </TouchableOpacity>
        </View>

        {/* Etiqueta de categoría */}
        <View style={styles.tagContainer}>
          <Text style={styles.tag}>{item.tag}</Text>
        </View>

        {/* Descripción */}
        <Text style={styles.description}>
          {item.description
            ? item.description
            : "No hay descripción disponible para este elemento."}
        </Text>

        {/* SOLO mostrar estas secciones si el tag es "Pokémon" */}
        {item.tag === "Pokémon" && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Modos de Juego</Text>
              <View style={styles.row}>
                <Text style={[styles.chip, styles.typeAction]}>Campaña</Text>
                <Text style={[styles.chip, styles.typeAdventure]}>Multijugador</Text>
                <Text style={[styles.chip, styles.typeStrategy]}>Cooperativo</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Dificultades</Text>
              <View style={styles.row}>
                <Text style={[styles.chip, styles.diffEasy]}>Fácil</Text>
                <Text style={[styles.chip, styles.diffNormal]}>Normal</Text>
                <Text style={[styles.chip, styles.diffHard]}>Difícil</Text>
              </View>
            </View>
          </>
        )}

        {/* Botón de volver */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color="#fff" />
          <Text style={styles.backText}>Volver</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// 🎨 Estilos
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    paddingBottom: 40,
  },
  image: {
    width: "100%",
    height: 300,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#222",
  },
  tagContainer: {
    marginVertical: 10,
  },
  tag: {
    backgroundColor: "#FCB495",
    color: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignSelf: "flex-start",
    fontWeight: "bold",
  },
  description: {
    fontSize: 16,
    color: "#444",
    lineHeight: 22,
    marginBottom: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  // Modos
  typeAction: { backgroundColor: "#4CAF50" },
  typeAdventure: { backgroundColor: "#9C27B0" },
  typeStrategy: { backgroundColor: "#03A9F4" },
  // Dificultades
  diffEasy: { backgroundColor: "#8BC34A" },
  diffNormal: { backgroundColor: "#FFC107" },
  diffHard: { backgroundColor: "#F44336" },
  // Botón de volver
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FCB495",
    marginTop: 24,
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  backText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 6,
  },
});
