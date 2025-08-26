// Contexto global de autenticación

// Importa dependencias
import React, { createContext, useContext, useEffect, useState } from 'react';

import { authService } from '../services/auth';
import { User, LoginCredentials, LoginResponse } from '../types';
import { set } from 'mongoose';

// Interfaz de contexto
interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    // Funciones de autenticación
    login: (credentials: LoginCredentials) => Promise<LoginResponse>;
    logout: () => Promise<void>;
    refresh: () => Promise<void>;

    // Verificar permisos
    canDelete: () => boolean;
    canEdit: () => boolean;
    hasRole: (role: 'admin' | 'coordinador') => boolean;

}
//
const AuthContext = createContext<AuthContextType | undefined>(undefined);
interface AuthProviderProps {
  children: React.ReactNode;
}

// Exportar el proveedor de autenticación
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    checkAuthStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const isAAuth = await authService.isAuthenticated();

      if (isAAuth) {
        const isValideToken = await authService.validateToken();

        if (isValideToken) {
          const userData = await authService.getUser();
          setUser(userData);
        } else {
          await authService.clearAuthData();
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('ERROR: Verificando estado de autenticación', error);
      await authService.clearAuthData();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Proceso de iniciar sesión DEL login
    const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
        try {
        setIsLoading(true);
        const response = await authService.login(credentials);
        if (response.success && response.data) {
            setUser(response.data.user);
        }
        return response;
        } catch (error: any) {
        throw error;
        } finally {
        setIsLoading(false);
        }
    };
  // Cierre de sesión de usuario
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('ERROR: Cerrando sesión', error);
    } finally {
      setIsLoading(false);
    }
  };
};