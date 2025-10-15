'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { User } from '@/types/contractor'
import { getContractorByUsername } from '@/lib/contractors'

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => boolean
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 初期データのセットアップ
    import('@/lib/contractors').then(({ initializeDefaultData }) => {
      initializeDefaultData()
    })

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
    // 管理者アカウント
    if (username === 'admin' && password === 'admin') {
      const adminUser: User = {
        id: 'admin',
        name: 'KCT管理者',
        contractor: 'KCT管理者',
        contractorId: 'admin',
        role: 'admin',
      }
      setUser(adminUser)
      localStorage.setItem('user', JSON.stringify(adminUser))
      return true
    }

    // 協力会社アカウント
    const contractor = getContractorByUsername(username)
    if (!contractor || contractor.password !== password) {
      return false
    }

    if (!contractor.isActive) {
      return false
    }

    // 協力会社としてログイン（班選択はログイン後に除外日登録時に行う）
    const contractorUser: User = {
      id: contractor.id,
      name: contractor.name,
      contractor: contractor.name,
      contractorId: contractor.id,
      role: 'contractor',
    }
    setUser(contractorUser)
    localStorage.setItem('user', JSON.stringify(contractorUser))
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
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
      {isLoading ? null : children}
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
