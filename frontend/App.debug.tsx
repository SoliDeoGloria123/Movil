import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function AppDebug() {
  const [screen, setScreen] = React.useState('login');
  
  console.log('AppDebug renderizando, screen:', screen);

  if (screen === 'login') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>🚀 Sistema Móvil - DEBUG</Text>
        <Text style={styles.subtitle}>Pantalla de Login</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => setScreen('home')}
        >
          <Text style={styles.buttonText}>Simular Login</Text>
        </TouchableOpacity>
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎉 Sistema Móvil - HOME</Text>
      <Text style={styles.subtitle}>Dashboard Principal</Text>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => setScreen('categories')}
      >
        <Text style={styles.buttonText}>Ver Categorías</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => setScreen('products')}
      >
        <Text style={styles.buttonText}>Ver Productos</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, styles.logoutButton]}
        onPress={() => setScreen('login')}
      >
        <Text style={styles.buttonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
      
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 8,
    minWidth: 200,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
