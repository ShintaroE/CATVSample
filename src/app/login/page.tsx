'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ComputerDesktopIcon } from '@heroicons/react/24/outline'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const { login } = useAuth()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!username || !password) {
      setError('ユーザー名とパスワードを入力してください')
      return
    }

    const success = login(username, password)
    if (success) {
      router.push('/')
    } else {
      setError('ユーザー名またはパスワードが正しくありません')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* ロゴ・タイトル */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-600 rounded-lg shadow-lg">
              <ComputerDesktopIcon className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            CATV管理システム
          </h1>
          <p className="text-gray-600">倉敷ケーブルテレビ工事管理</p>
        </div>

        {/* ログインフォーム */}
        <div className="bg-white shadow-xl rounded-lg p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">ログイン</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                ユーザー名
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                placeholder="ユーザー名を入力"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                パスワード
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                placeholder="パスワードを入力"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
            >
              ログイン
            </button>
          </form>

          {/* デモアカウント情報 */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-600 mb-2 font-medium">デモアカウント:</p>
            <div className="space-y-1 text-xs text-gray-500">
              <div className="flex justify-between">
                <span>管理者:</span>
                <span className="font-mono">admin / admin</span>
              </div>
              <div className="flex justify-between">
                <span>直営班:</span>
                <span className="font-mono">chokueihan / password</span>
              </div>
              <div className="flex justify-between">
                <span>栄光電気通信:</span>
                <span className="font-mono">eiko / password</span>
              </div>
              <div className="flex justify-between">
                <span>スライヴ:</span>
                <span className="font-mono">thrive / password</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
