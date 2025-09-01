// Tipos principales de la aplicación

export interface User {
  _id?: string;
  id?: string;
  username: string;
  email: string;
  role: 'admin' | 'coordinador' | 'user';
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subcategory {
  _id: string;
  name: string;
  description?: string;
  category: string | Category;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  category: string | Category;
  subcategory?: string | Subcategory;
  createdBy: string | User;
  createdAt: string;
  updatedAt: string;
}
