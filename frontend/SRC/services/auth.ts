// Servicio de autenticación
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, LoginCredentials, LoginResponse, ApiResponse } from '../types';

const API_BASE_URL = 'http://localhost:5000/api'; // URL del backend
const TOKEN_KEY = 'authToken';
const USER_KEY = 'userData';

class AuthService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }
  // Realizar login
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      console.log('AuthService: Enviando credenciales al backend:', { username: credentials.username });
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      console.log('AuthService: Respuesta del backend:', data);

      // Adaptar la respuesta del backend al formato esperado por el frontend
      if (data.success && data.token && data.user) {
        // El backend devuelve token y user directamente
        const adaptedData: LoginResponse = {
          success: true,
          message: data.message,
          data: {
            token: data.token,
            user: data.user
          }
        };
        
        await this.storeAuthData(data.token, data.user);
        console.log('AuthService: Datos almacenados exitosamente');
        return adaptedData;
      } else if (data.success && data.data) {
        // El formato ya es el esperado
        await this.storeAuthData(data.data.token, data.data.user);
        return data;
      } else {
        // Error en login
        return {
          success: false,
          message: data.message || 'Error en el login'
        };
      }
    } catch (error) {
      console.error('AuthService: Error en login:', error);
      throw new Error('Error de conexión con el servidor');
    }
  }

  // Cerrar sesión
  async logout(): Promise<void> {
    try {
      await this.clearAuthData();
    } catch (error) {
      console.error('Error en logout:', error);
    }
  }
  // Verificar si está autenticado
  async isAuthenticated(): Promise<boolean> {
    try {
      console.log('Verificando si está autenticado...');
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      console.log('Token encontrado:', !!token);
      return !!token;
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      return false;
    }
  }  // Validar token
  async validateToken(): Promise<boolean> {
    try {
      console.log('Validando token...');
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (!token) {
        console.log('No hay token para validar');
        return false;
      }

      const response = await fetch(`${this.baseURL}/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Respuesta de validación:', response.ok);
      return response.ok;
    } catch (error) {
      console.error('Error validando token:', error);
      return false;
    }
  }

  // Obtener datos del usuario
  async getUser(): Promise<User> {
    try {
      const userData = await AsyncStorage.getItem(USER_KEY);
      if (!userData) {
        throw new Error('No hay datos de usuario');
      }
      return JSON.parse(userData) as User;
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      throw error;
    }
  }

  // Obtener token
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error obteniendo token:', error);
      return null;
    }
  }

  // Almacenar datos de autenticación
  private async storeAuthData(token: string, user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error almacenando datos de auth:', error);
      throw error;
    }
  }

  // Limpiar datos de autenticación
  async clearAuthData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    } catch (error) {
      console.error('Error limpiando datos de auth:', error);
    }
  }

  // Realizar petición autenticada
  async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const token = await this.getToken();
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    return fetch(`${this.baseURL}${url}`, {
      ...options,
      headers,
    });
  }
}

export const authService = new AuthService();
