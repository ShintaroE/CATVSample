/**
 * 認証情報のlocalStorage操作
 */

import { User } from '../types'
import { STORAGE_KEYS } from '@/lib/constants'

export const authStorage = {
  /**
   * ユーザー情報を取得
   */
  getUser: (): User | null => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEYS.USER)
      if (savedUser) {
        return JSON.parse(savedUser)
      }
      return null
    } catch (error) {
      console.error('Failed to load user from localStorage:', error)
      return null
    }
  },

  /**
   * ユーザー情報を保存
   */
  saveUser: (user: User): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
    } catch (error) {
      console.error('Failed to save user to localStorage:', error)
    }
  },

  /**
   * ユーザー情報を削除
   */
  removeUser: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEYS.USER)
    } catch (error) {
      console.error('Failed to remove user from localStorage:', error)
    }
  },
}
