
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { signIn, signUp, verifyToken, refreshToken } from '@/services/authService';
import { jwtDecode } from 'jwt-decode';
import { User, Profile } from '@/types/database';
// import * as jwt from 'jsonwebtoken'; // Comentado ya que estamos usando jwt-decode

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
    
    // Configurar intervalo para verificar y refrescar el token
    const interval = setInterval(() => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const decoded = jwtDecode<{ exp: number, isAdmin: boolean }>(token);
          console.log('Decoded token:', decoded);
          if (decoded && typeof decoded === 'object' && 'exp' in decoded) {
            const expirationTime = decoded.exp * 1000;
            const currentTime = Date.now();
            const timeUntilExpiration = expirationTime - currentTime;
            
            // Si el token está a punto de expirar (menos de 15 minutos)
            if (timeUntilExpiration < 15 * 60 * 1000) {
              refreshToken(token).then(({ token: newToken }) => {
                localStorage.setItem('auth_token', newToken);
                console.log('Token refrescado automáticamente');
              }).catch(error => {
                console.error('Error refrescando token:', error);
                handleSignOut();
              });
            }
          }
        } catch (error) {
          console.error('Error decodificando token:', error);
        }
      }
    }, 5 * 60 * 1000); // Verificar cada 5 minutos
    
    return () => clearInterval(interval);
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      console.log('Token from localStorage:', token);
      if (token) {
        console.log('Verifying token...');
        const { user, profile } = await verifyToken(token);
        console.log('Verified user:', user);
        console.log('Verified profile:', profile);
        setUser(user);
        setProfile(profile);
      } else {
        console.log('No token found in localStorage');
      }
    } catch (error) {
      console.error('Error verificando autenticación:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
      localStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    try {
      const { user, profile, token } = await signIn(email, password);
      console.log('SignIn successful, storing token:', token);
      localStorage.setItem('auth_token', token);
      console.log('Token stored in localStorage:', localStorage.getItem('auth_token'));
      setUser(user);
      setProfile(profile);
      console.log('User and profile set:', { user, profile });
    } catch (error) {
      console.error('SignIn error:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
      throw error;
    }
  };

  const handleSignUp = async (email: string, password: string, fullName?: string) => {
    try {
      const { user, profile, token } = await signUp(email, password, fullName);
      localStorage.setItem('auth_token', token);
      setUser(user);
      setProfile(profile);
    } catch (error) {
      throw error;
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    setProfile(null);
  };

  const value = {
    user,
    profile,
    loading,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
