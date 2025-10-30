/**
 * 認証関連の型定義
 */

export interface User {
  id: string
  name: string
  contractor: string
  contractorId: string
  role: 'admin' | 'contractor'
}

export interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => boolean
  logout: () => void
  isAuthenticated: boolean
}
