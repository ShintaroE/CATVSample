'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type Contractor = '直営班' | '栄光電気通信' | 'スライヴ' | 'KCT管理者'

interface User {
  id: string
  name: string
  contractor: Contractor
  role: 'admin' | 'contractor'
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => boolean
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// サンプルユーザーデータ
const users: { username: string; password: string; user: User }[] = [
  {
    username: 'admin',
    password: 'admin',
    user: {
      id: '1',
      name: 'KCT管理者',
      contractor: 'KCT管理者',
      role: 'admin',
    },
  },
  {
    username: 'chokueihan',
    password: 'password',
    user: {
      id: '2',
      name: '直営班',
      contractor: '直営班',
      role: 'contractor',
    },
  },
  {
    username: 'eiko',
    password: 'password',
    user: {
      id: '3',
      name: '栄光電気通信',
      contractor: '栄光電気通信',
      role: 'contractor',
    },
  },
  {
    username: 'thrive',
    password: 'password',
    user: {
      id: '4',
      name: 'スライヴ',
      contractor: 'スライヴ',
      role: 'contractor',
    },
  },
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // ローカルストレージからユーザー情報を復元
    try {
      const savedUser = localStorage.getItem('user')
      if (savedUser) {
        setUser(JSON.parse(savedUser))
      }
    } catch (error) {
      console.error('Failed to load user from localStorage:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = (username: string, password: string): boolean => {
    const foundUser = users.find(
      (u) => u.username === username && u.password === password
    )

    if (foundUser) {
      setUser(foundUser.user)
      localStorage.setItem('user', JSON.stringify(foundUser.user))
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  // ローディング中は何も表示しない
  if (isLoading) {
    return null
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
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
