# 🧬 FrikiDex — Tu Pokédex Friki en React Native  

Aplicación móvil desarrollada en **React Native + Firebase**, diseñada para explorar personajes, crear equipos, guardar favoritos y gestionar usuarios con autenticación en tiempo real.

---

## 🚀 Características principales

### 🔐 Autenticación con Firebase
- Registro de usuarios  
- Inicio de sesión  
- Cierre de sesión  
- Persistencia automática del usuario  
- Actualización de perfil (displayName)  

---

### ⭐ Sistema de Favoritos
- Agrega personajes a favoritos  
- Persistencia del estado  
- Pantalla dedicada para gestionarlos  

---

### 🫂 Gestor de Equipos
- Crear equipos personalizados  
- Añadir o eliminar personajes  
- Equipos guardados por usuario vía Firebase  

---

### 🔍 Exploración de Personajes
- Lista completa de personajes  
- Detalle individual  
- Uso de API externa (PokéAPI o similar)

---

### 👤 Pantalla de Perfil
- Ver información del usuario  
- Cambiar nombre del perfil  
- Cerrar sesión  

---

## 🏗️ Arquitectura del Proyecto

```bash
/
├── App.js
├── firebase.js
├── context/
│   ├── AuthContext.js
│   ├── FavoritesContext.js
│   └── TeamsContext.js
├── screens/
│   ├── HomeScreen.js
│   ├── DetailScreen.js
│   ├── FavoritesScreen.js
│   ├── TeamsScreen.js
│   ├── LoginScreen.js
│   ├── RegisterScreen.js
│   └── ProfileScreen.js
└── components/
---

## 🛠️ Tecnologías Utilizadas

### **Frontend**
- React Native (Expo)
- React Navigation
- Context API
- React Hooks

### **Backend**
- Firebase Authentication  
- Firebase Realtime Database

### **UI**
- Expo Vector Icons (Ionicons)

---

## 📦 Instalación y Uso

### **1️⃣ Clonar repositorio**
```bash
git clone https://github.com/tuUsuario/frikidex.git
cd frikidex

### **2️⃣ Instalar dependencias**
```bash
npm install

### **3️⃣ Instalar paquetes importantes**

```bash
npm install firebase
npm install @react-navigation/native
npm install @react-navigation/native-stack
npm install @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
npm install @expo/vector-icons

### **3️⃣ Instalar paquetes importantes**

```bash
npm install firebase
npm install @react-navigation/native
npm install @react-navigation/native-stack
npm install @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
npm install @expo/vector-icons

###5️⃣ Ejecutar la app

```bash
npm start
