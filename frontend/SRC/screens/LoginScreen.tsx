import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { LoginCredentials } from '../types';
import { colors, spacing, typography } from '../styles';

const LoginScreen: React.FC = () => {
  const { login, isLoading } = useAuth();
  
  // Estado del formulario usando la interfaz del profesor
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: '',
  });

  // Estado de visibilidad de contraseña
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  // Función para manejar cambios en los campos
  const handleInputChange = (field: keyof LoginCredentials, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value.trim(),
    }));
  };

  // Función para validar formulario
  const validateForm = (): boolean => {
    if (!credentials.username) {
      Alert.alert('Error', 'Por favor ingresa tu usuario o email');
      return false;
    }
    
    // Validar que la contraseña no esté vacía 
    if (!credentials.password) {
      Alert.alert('Error', 'Por favor ingresa tu contraseña');
      return false;
    }

    // Validar permitir email o username
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmail = emailRegex.test(credentials.username) && credentials.username.includes('@');
    const isUsername = credentials.username.length >= 3;
    
    if (!isEmail && !isUsername) {
      Alert.alert('Error', 'Por favor ingresa un email válido o username (mínimo 3 caracteres)');
      return false;
    }
    
    return true;  
  };
  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      console.log('Iniciando login con credenciales:', { username: credentials.username });
      const response = await login(credentials);
      console.log('Respuesta del login:', response);
      
      if (!response.success) {
        Alert.alert('Error', response.message || 'Error al iniciar sesión');
      } else {
        // El éxito se maneja automáticamente por el contexto
        console.log('Login exitoso, navegación será manejada por AuthContext');
      }
    } catch (error: any) {
      console.error('Error en login:', error);
      Alert.alert('Error de conexión', error.message || 'No se pudo conectar con el servidor');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Text style={styles.title}>Bienvenido</Text>
          <Text style={styles.subtitle}>Iniciar Sesión</Text>          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Usuario o Email"
                value={credentials.username}
                onChangeText={(value) => handleInputChange('username', value)}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
                keyboardType="email-address"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Contraseña"
                value={credentials.password}
                onChangeText={(value) => handleInputChange('password', value)}
                secureTextEntry={!isPasswordVisible}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              >
                <Ionicons 
                  name={isPasswordVisible ? 'eye-off' : 'eye'} 
                  size={20} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.surface} />
              ) : (
                <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
              )}
            </TouchableOpacity>
          </View>          <View style={styles.testCredentials}>
            <Text style={styles.testTitle}>Credenciales de prueba:</Text>
            <Text style={styles.testText}>Admin: admin@ejemplo.com / admin123</Text>
            <Text style={styles.testText}>Coordinador: coordinador@test.com / coord123</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },  form: {
    width: '100%',
    maxWidth: 300,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  passwordInput: {
    paddingRight: 40, // Espacio para el ícono
  },
  passwordToggle: {
    position: 'absolute',
    right: spacing.sm,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  loginButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  loginButtonDisabled: {
    backgroundColor: colors.textSecondary,
  },
  loginButtonText: {
    color: colors.surface,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  testCredentials: {
    marginTop: spacing.xl,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderColor: colors.border,
    borderWidth: 1,
  },
  testTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  testText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
});

export default LoginScreen;
