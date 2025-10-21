// App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { FavoritesProvider } from './context/FavoritesContext'; // ← Importa desde la nueva carpeta

// Importar Pantallas 
import HomeScreen from "./screens/HomeScreen";
import FavoritesScreen from "./screens/FavoritesScreen";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <FavoritesProvider> {/* ← ENVUELVE TODO CON ESTE PROVIDER */}
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarActiveTintColor: "#FCB495",
            tabBarInactiveTintColor: "#999",
            tabBarStyle: { backgroundColor: "#fff" },
            tabBarIcon: ({ color, size }) => {
              let iconName;
              switch (route.name) {
                case "Inicio":
                  iconName = "home";
                  break;
                case "Favoritos":
                  iconName = "heart";
                  break;
              }
              return <Ionicons name={iconName} size={size} color={color} />;
            },
          })}
        >
          <Tab.Screen name="Inicio" component={HomeScreen} />
          <Tab.Screen name="Favoritos" component={FavoritesScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </FavoritesProvider> /* ← ENVUELVE TODO CON ESTE PROVIDER */
  );
}