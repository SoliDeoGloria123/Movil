// Servicio general para llamadas a la API
import { authService } from './auth';
import { ApiResponse } from '../types';

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = 'http://localhost:5000/api';
  }

  // Método GET
  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await authService.authenticatedFetch(endpoint, {
        method: 'GET'
      });

      return await response.json();
    } catch (error) {
      console.error('Error en GET:', error);
      throw error;
    }
  }

  // Método POST
  async post<T = any>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    try {
      const response = await authService.authenticatedFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(data)
      });

      return await response.json();
    } catch (error) {
      console.error('Error en POST:', error);
      throw error;
    }
  }
  // Método PUT
  async put<T = any>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    try {
      const response = await authService.authenticatedFetch(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data)
      });

      return await response.json();
    } catch (error) {
      console.error('Error en PUT:', error);
      throw error;
    }
  }

  // Método PATCH
  async patch<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await authService.authenticatedFetch(endpoint, {
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined
      });

      return await response.json();
    } catch (error) {
      console.error('Error en PATCH:', error);
      throw error;
    }
  }

  // Método DELETE
  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await authService.authenticatedFetch(endpoint, {
        method: 'DELETE'
      });

      return await response.json();
    } catch (error) {
      console.error('Error en DELETE:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
