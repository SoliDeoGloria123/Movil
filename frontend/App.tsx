import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet } from 'react-native';
import { AuthProvider } from './SRC/contexts/AuthContext';
import AppNavigator from './SRC/navigation/AppNavigator';

// Importar versión debug
import AppDebug from './App.debug';

// Componente de fallback en caso de error
const ErrorFallback: React.FC<{ error: string }> = ({ error }) => (
  <View style={styles.errorContainer}>
    <Text style={styles.errorTitle}>⚠️ Error de Carga</Text>
    <Text style={styles.errorText}>{error}</Text>
    <Text style={styles.debugText}>Versión: 1.0.1 - {new Date().toLocaleTimeString()}</Text>
  </View>
);

export default function App() {
  const [useDebugMode, setUseDebugMode] = React.useState(false); // Cambiar a false
  
  console.log('App iniciando, useDebugMode:', useDebugMode);
  
  // Modo debug para probar la funcionalidad básica
  if (useDebugMode) {
    return <AppDebug />;
  }

  try {
    return (
      <AuthProvider>
        <AppNavigator />
        <StatusBar style="auto" />
      </AuthProvider>
    );
  } catch (error) {
    console.error('Error en App:', error);
    return <ErrorFallback error={String(error)} />;
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#DC3545',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
    lineHeight: 24,
  },
  debugText: {
    fontSize: 12,
    color: '#ADB5BD',
    marginTop: 16,
    textAlign: 'center',
  },
});
