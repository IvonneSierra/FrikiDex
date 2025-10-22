// App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { FavoritesProvider } from "./context/FavoritesContext";
import { TeamsProvider } from "./context/TeamsContext";

// 🔹 Importar Pantallas
import HomeScreen from "./screens/HomeScreen";
import FavoritesScreen from "./screens/FavoritesScreen";
import DetailScreen from "./screens/DetailScreen";
import TeamsScreen from "./screens/TeamsScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// 🔹 Tabs principales
function TabNavigator() {
  return (
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
            case "Equipos":
              iconName = "people";
              break;
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Inicio" component={HomeScreen} />
      <Tab.Screen name="Favoritos" component={FavoritesScreen} />
      <Tab.Screen name="Equipos" component={TeamsScreen} />
    </Tab.Navigator>
  );
}

// 🔹 Stack global (permite abrir Details desde cualquier tab)
export default function App() {
  return (
    <FavoritesProvider>
      <TeamsProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {/* Tabs principales */}
            <Stack.Screen name="Tabs" component={TabNavigator} />
            {/* Pantalla de detalles accesible desde cualquier tab */}
            <Stack.Screen
              name="Details"
              component={DetailScreen}
              options={{ headerShown: true, title: "Detalles" }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </TeamsProvider>
    </FavoritesProvider>
  );
}
