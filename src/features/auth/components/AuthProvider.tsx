'use client'

import React, { createContext, useState, useEffect } from 'react'
import { User, AuthContextType } from '../types'
import { authStorage } from '../lib/authStorage'
import { getContractorByUsername, getAdminByUsername, initializeDefaultData } from '@/features/contractor/lib/contractorStorage'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 初期データのセットアップ
    initializeDefaultData()

    // ローカルストレージからユーザー情報を復元
    const savedUser = authStorage.getUser()
    if (savedUser) {
      setUser(savedUser)
    }
    setIsLoading(false)
  }, [])

  const login = (username: string, password: string): boolean => {
    // 管理者アカウントをチェック
    const admin = getAdminByUsername(username)
    if (admin) {
      if (admin.password !== password) {
        return false
      }
      if (!admin.isActive) {
        return false
      }

      const adminUser: User = {
        id: admin.id,
        name: admin.name,
        contractor: admin.name,
        contractorId: admin.id,
        role: 'admin',
      }
      setUser(adminUser)
      authStorage.saveUser(adminUser)
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
    authStorage.saveUser(contractorUser)
    return true
  }

  const logout = () => {
    setUser(null)
    authStorage.removeUser()
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

export { AuthContext }
