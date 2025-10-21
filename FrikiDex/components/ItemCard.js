// components/ItemCard.js
import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFavorites } from "../context/FavoritesContext";

export default function ItemCard({ item }) {
  const { isFavorite, toggleFavorite } = useFavorites();

  const isItemFavorite = isFavorite(item.id, item.tag);

  const handleHeartPress = () => {
    toggleFavorite(item);
  };

  return (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
      <View style={styles.content}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{item.title}</Text>
          {item.subtitle ? <Text style={styles.subtitle}>{item.subtitle}</Text> : null}
        </View>
        <View style={styles.right}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.tag}</Text>
          </View>
          <TouchableOpacity onPress={handleHeartPress} style={styles.heart}>
            <Ionicons 
              name={isItemFavorite ? "heart" : "heart-outline"} 
              size={20} 
              color={isItemFavorite ? "#FF6B6B" : "#FCB495"} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
  image: {
    width: "100%",
    height: 160,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
  },
  subtitle: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  right: {
    alignItems: "flex-end",
    marginLeft: 8,
  },
  badge: {
    backgroundColor: "#FCB495",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 6,
  },
  badgeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
  heart: {
    padding: 6,
  },
});