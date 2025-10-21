// screens/FavoritesScreen.js
import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../context/FavoritesContext';
import ItemCard from '../components/ItemCard';

export default function FavoritesScreen() {
  const { favorites, removeFavorite } = useFavorites();

  const handleRemoveFavorite = (item) => {
    removeFavorite(item.id, item.tag);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tus Favoritos</Text>
      <Text style={styles.subtitle}>
        {favorites.length} {favorites.length === 1 ? 'item' : 'items'} guardados
      </Text>

      {favorites.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="heart-outline" size={64} color="#DDD" />
          <Text style={styles.emptyText}>No tienes favoritos aún</Text>
          <Text style={styles.emptySubtext}>
            Toca el corazón en cualquier item para agregarlo a favoritos
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item, index) => `${item.tag}-${item.id}-${index}`}
          renderItem={({ item }) => (
            <View style={styles.favoriteItem}>
              <ItemCard item={item} />
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={() => handleRemoveFavorite(item)}
              >
                <Ionicons name="trash-outline" size={16} color="#FF6B6B" />
                <Text style={styles.removeText}>Quitar</Text>
              </TouchableOpacity>
            </View>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  favoriteItem: {
    position: 'relative',
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    marginBottom: 16,
    overflow: 'hidden',
  },
  removeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  removeText: {
    fontSize: 12,
    color: '#FF6B6B',
    marginLeft: 4,
    fontWeight: '500',
  },
});
