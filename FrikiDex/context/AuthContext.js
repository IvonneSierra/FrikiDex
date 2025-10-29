// context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from "react";
import { Alert } from "react-native";
import { auth } from "../firebase";
import { updateProfile } from "firebase/auth";

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
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // 🔹 Registrar usuario
  const register = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert("✅ Registro exitoso", "Tu cuenta ha sido creada correctamente.");
      return userCredential.user;
    } catch (error) {
      console.error("Error al registrar:", error.message);
      let errorMessage = "Error al crear la cuenta";

      // Mensajes de error más amigables
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = "Este correo electrónico ya está en uso";
          break;
        case 'auth/invalid-email':
          errorMessage = "El correo electrónico no es válido";
          break;
        case 'auth/weak-password':
          errorMessage = "La contraseña es demasiado débil";
          break;
        default:
          errorMessage = error.message;
      }

      Alert.alert("❌ Error", errorMessage);
      throw error;
    }
  };

  // 🔹 Iniciar sesión
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error("Error al iniciar sesión:", error.message);
      let errorMessage = "Error al iniciar sesión";

      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = "No existe una cuenta con este correo";
          break;
        case 'auth/wrong-password':
          errorMessage = "Contraseña incorrecta";
          break;
        case 'auth/invalid-email':
          errorMessage = "El correo electrónico no es válido";
          break;
        default:
          errorMessage = error.message;
      }

      Alert.alert("❌ Error", errorMessage);
      throw error;
    }
  };

  // 🔹 Cerrar sesión
  const logout = async () => {
    try {
      await signOut(auth);
      Alert.alert("👋 Sesión cerrada", "Has cerrado sesión correctamente");
    } catch (error) {
      console.error("Error al cerrar sesión:", error.message);
      Alert.alert("❌ Error", "No se pudo cerrar sesión");
      throw error;
    }
  };

  // 🔹 Actualizar perfil de usuario
  const updateUserProfile = async (displayName) => {
    if (!user) throw new Error("Usuario no autenticado");
    
    try {
      await updateProfile(user, {
        displayName: displayName
      });
      // Actualizar el estado local
      setUser({ ...user, displayName });
    } catch (error) {
      console.error("Error actualizando perfil:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      register,
      login,
      logout,
      updateUserProfile // 🔥 Agregar esta función
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto fácilmente
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};