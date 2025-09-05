import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { checkAuthStatus, clearAuthStorage } from '@/utils/authDebug';
import { API_CONFIG } from '@/config/api';

interface User {
  id: string
  username: string
  email: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (token: string, userData: User) => void
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Validate token with backend
  const validateToken = async (tokenToValidate: string) => {
    try {
      const response = await fetch(API_CONFIG.ENDPOINTS.AUTH.VERIFY, {
        headers: {
          'Authorization': `Bearer ${tokenToValidate}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.valid && data.user) {
          return data.user;
        }
      }
      return null;
    } catch (error) {
      console.error('Token validation error:', error);
      return null;
    }
  };

  useEffect(() => {
    // Check for existing token on app load and validate it
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (storedToken && storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        
        // Validate token with backend
        validateToken(storedToken).then(validUser => {
          if (validUser) {
            setToken(storedToken)
            setUser(validUser)
          } else {
            // Token is invalid, clear storage silently
            localStorage.removeItem('token')
            localStorage.removeItem('user')
          }
          setIsLoading(false)
        }).catch(() => {
          // Clear invalid stored data silently on validation error
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setIsLoading(false)
        });
      } catch (error) {
        // Clear invalid stored data silently
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setIsLoading(false)
      }
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = (newToken: string, userData: User) => {
    setToken(newToken)
    setUser(userData)
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token && !!user,
    isLoading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
