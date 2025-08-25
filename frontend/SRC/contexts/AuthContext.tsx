// Contexto global de autenticación

// Importa dependencias
//import React, { createContext, useContext, useEffect, useState } from 'react';

//import { authService } from '../services/auth';
//import { User, LoginCredentials, LoginResponse } from '../types';

// Interfaz de contexto
//interface AuthContextType {
//  user: User | null;
//  isAuthenticated: boolean;
//  isLoading: boolean;
//
//  // Funciones de autenticación
//    login: (credentials: LoginCredentials) => Promise<LoginResponse>;
//    logout: () => Promise<void>;
//    refresh: () => Promise<void>;
//
//    // Verificar permisos
//    canDelete: () => boolean;
//    canEdit: () => boolean;
//    hasRole: (role: 'admin' | 'coordinador') => boolean;
//
//}
//
//const AuthContext = createContext<AuthContextType | undefined>(undefined);
//interface AuthProviderProps {
//  children: React.ReactNode;
//}
//
//export const AuthProvider : React.FC<AuthProviderProps> = ({ children }) => {
//  const [user, setUser] = useState<User | null>(null);
//  const [isLoading, setIsLoading] = useState<boolean>(true);
//  
//  useEffect(() => {
//    checkAuthStatus();
//  }, []);
//};
