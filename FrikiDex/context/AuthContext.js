// context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from "react";
import { Alert } from "react-native";
import { auth } from "../firebase"; // 👈 Usa el SDK web que ya configuraste
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Verifica si el usuario está autenticado al iniciar la app
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user || null);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // 🔹 Registrar usuario
  const register = async (email, password) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert("Registro exitoso", "Tu cuenta ha sido creada correctamente.");
    } catch (error) {
      console.error("Error al registrar:", error.message);
      Alert.alert("Error", error.message);
    }
  };

  // 🔹 Iniciar sesión
  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Error al iniciar sesión:", error.message);
      Alert.alert("Error", error.message);
    }
  };

  // 🔹 Cerrar sesión
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión:", error.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto fácilmente
export const useAuth = () => useContext(AuthContext);
