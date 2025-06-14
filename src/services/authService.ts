// @ts-nocheck

// Servicio de autenticación simplificado para frontend
import { User, Profile } from '@/types/database';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api';

export interface AuthResponse {
  user: User;
  profile: Profile;
  token: string;
}

export const signUp = async (email: string, password: string, fullName?: string): Promise<AuthResponse> => {
  const url = `${API_BASE_URL}/auth/signup`;
  console.log('Signup URL:', url);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, fullName }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error en el registro');
  }

  return response.json();
};

export const signIn = async (email: string, password: string): Promise<AuthResponse> => {
  const url = `${API_BASE_URL}/auth/signin`;
  console.log('Signin URL:', url);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Credenciales inválidas');
  }

  return response.json();
};

export const refreshToken = async (token: string): Promise<{ token: string }> => {
  const url = `${API_BASE_URL}/auth/refresh`;
  console.log('Refresh token URL:', url);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al refrescar el token');
  }

  return response.json();
};

export const verifyToken = async (token: string): Promise<{ user: User; profile: Profile }> => {
  const url = `${API_BASE_URL}/auth/verify`;
  console.log('Verify URL:', url);
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Verify token failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(errorData.message || 'Token inválido');
    }

    const data = await response.json();
    console.log('Verify token response:', data);
    return data;
  } catch (error) {
    console.error('Verify token error:', {
      message: error.message,
      stack: error.stack,
      url: url
    });
    throw error;
  }
};

