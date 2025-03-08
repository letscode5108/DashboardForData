// src/app/context/auth.context.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@/app/types/auth.types'
import { loginUser, logoutUser, refreshToken } from '@/app/services/auth.service'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string | undefined, username: string | undefined, password: string) => Promise<boolean>
  logout: () => Promise<boolean>
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user')
      const accessToken = localStorage.getItem('accessToken')
      
      if (storedUser && accessToken) {
        try {
          setUser(JSON.parse(storedUser))
        } catch (err) {
          localStorage.removeItem('user')
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
        }
      }
      
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string | undefined, username: string | undefined, password: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const credentials = { email, username, password }
      const response = await loginUser(credentials)
      
      if (response.success && response.data?.user) {
        setUser(response.data.user)
        
        // Store tokens and user data
        if (response.data.accessToken) {
          localStorage.setItem('accessToken', response.data.accessToken)
        }
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken)
        }
        localStorage.setItem('user', JSON.stringify(response.data.user))
        
        return true
      } else {
        setError(response.message)
        return false
      }
    } catch (err) {
      setError('An error occurred during login')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const accessToken = localStorage.getItem('accessToken')
      if (!accessToken) {
        throw new Error('No access token found')
      }
      
      const response = await logoutUser(accessToken)
      
      // Regardless of server response, clear local storage
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      setUser(null)
      
      return response.success
    } catch (err) {
      setError('An error occurred during logout')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
















































































































