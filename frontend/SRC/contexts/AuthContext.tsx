// Contexto global de autenticación

// Importa dependencias
import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/auth';
import { User, LoginCredentials, LoginResponse } from '../types/index';

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
      console.log('Verificando estado de autenticación...');
      setIsLoading(true);
      const isAAuth = await authService.isAuthenticated();
      console.log('¿Usuario autenticado?:', isAAuth);

      if (isAAuth) {
        const isValideToken = await authService.validateToken();
        console.log('¿Token válido?:', isValideToken);

        if (isValideToken) {
          const userData = await authService.getUser();
          console.log('Datos del usuario:', userData);
          setUser(userData);
        } else {
          await authService.clearAuthData();
          setUser(null);
        }
      } else {
        console.log('Usuario no autenticado');
        setUser(null);
      }
    } catch (error) {
      console.error('ERROR: Verificando estado de autenticación', error);
      await authService.clearAuthData();
      setUser(null);
    } finally {
      console.log('Finalizando verificación de autenticación');
      setIsLoading(false);
    }
  };
  // Proceso de iniciar sesión DEL login
    const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
        try {
        console.log('AuthContext: Iniciando proceso de login');
        setIsLoading(true);
        const response = await authService.login(credentials);
        console.log('AuthContext: Respuesta del servicio de login:', response);
        
        if (response.success && response.data) {
            console.log('AuthContext: Login exitoso, estableciendo usuario:', response.data.user);
            setUser(response.data.user);
        } else {
            console.log('AuthContext: Login falló:', response.message);
        }
        return response;
        } catch (error: any) {
        console.error('AuthContext: Error en login:', error);
        throw error;
        } finally {
        console.log('AuthContext: Finalizando proceso de login, setIsLoading(false)');
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
// Refresca los datos de usuario actual sin haccer login de nuevo
 const refreshUser = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const userData = await authService.getUser();
      setUser(userData);
    } catch (error) {
      console.warn('ERROR: Refrescando datos de usuario', error);
      await logout();
    }
  };
// Permisos de eliminar solo admin
    const canDelete = (): boolean => {
        return user?.role === 'admin';
    };
// Permisos de editar admin y coordinador
    const canEdit = (): boolean => {
        return user?.role === 'admin' || user?.role === 'coordinador';
    }
// Verifica si el usuario tiene un rol específico
    const hasRole = (role: 'admin' | 'coordinador'): boolean => {
        return user?.role === role;
    };

    const isAuthenticated = !!user;

    // Datos de las funciones que estaran disponibles en la app
    const value: AuthContextType = {
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        refresh: refreshUser,
        canDelete,
        canEdit,
        hasRole,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};


