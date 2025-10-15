'use client'

import React, { useState, useEffect } from 'react'
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon, KeyIcon } from '@heroicons/react/24/outline'
import Layout from '@/components/Layout'
import { Contractor, Team } from '@/types/contractor'
import {
  getContractors,
  getTeams,
  addContractor,
  updateContractor,
  deleteContractor,
  addTeam,
  updateTeam,
  deleteTeam,
  getTeamsByContractorId,
  initializeDefaultData
} from '@/lib/contractors'
import { generateSimplePassword } from '@/lib/password-generator'

export default function ContractorManagementPage() {
  const [contractors, setContractors] = useState<Contractor[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [expandedContractors, setExpandedContractors] = useState<Set<string>>(new Set())

  // モーダル状態
  const [showAddContractorModal, setShowAddContractorModal] = useState(false)
  const [showEditContractorModal, setShowEditContractorModal] = useState(false)
  const [showAddTeamModal, setShowAddTeamModal] = useState(false)
  const [showEditTeamModal, setShowEditTeamModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  // フォーム状態
  const [newContractorName, setNewContractorName] = useState('')
  const [newContractorUsername, setNewContractorUsername] = useState('')
  const [newContractorPassword, setNewContractorPassword] = useState('')

  const [editingContractor, setEditingContractor] = useState<Contractor | null>(null)
  const [editContractorName, setEditContractorName] = useState('')
  const [editContractorUsername, setEditContractorUsername] = useState('')

  const [selectedContractorForTeam, setSelectedContractorForTeam] = useState<string>('')
  const [newTeamName, setNewTeamName] = useState('')

  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [editTeamName, setEditTeamName] = useState('')

  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set())
  const [currentPassword, setCurrentPassword] = useState<string>('')

  useEffect(() => {
    // 初期データのセットアップ
    initializeDefaultData()

    // データの読み込み
    loadData()
  }, [])

  const loadData = () => {
    setContractors(getContractors())
    setTeams(getTeams())
  }

  const toggleContractor = (contractorId: string) => {
    const newExpanded = new Set(expandedContractors)
    if (newExpanded.has(contractorId)) {
      newExpanded.delete(contractorId)
    } else {
      newExpanded.add(contractorId)
    }
    setExpandedContractors(newExpanded)
  }

  const handleAddContractor = () => {
    if (!newContractorName.trim() || !newContractorUsername.trim() || !newContractorPassword.trim()) {
      alert('すべての項目を入力してください')
      return
    }

    const newContractor: Contractor = {
      id: `contractor-${Date.now()}`,
      name: newContractorName,
      username: newContractorUsername,
      password: newContractorPassword,
      createdAt: new Date().toISOString(),
      isActive: true,
    }

    addContractor(newContractor)
    loadData()

    // フォームをリセット
    setNewContractorName('')
    setNewContractorUsername('')
    setNewContractorPassword('')
    setShowAddContractorModal(false)
  }

  const handleGeneratePassword = () => {
    const password = generateSimplePassword(10)
    setNewContractorPassword(password)
  }

  const handleEditContractor = (contractor: Contractor) => {
    setEditingContractor(contractor)
    setEditContractorName(contractor.name)
    setEditContractorUsername(contractor.username)
    setShowEditContractorModal(true)
  }

  const handleSaveEditContractor = () => {
    if (!editingContractor || !editContractorName.trim() || !editContractorUsername.trim()) {
      alert('すべての項目を入力してください')
      return
    }

    updateContractor(editingContractor.id, {
      name: editContractorName,
      username: editContractorUsername,
    })
    loadData()
    setShowEditContractorModal(false)
    setEditingContractor(null)
  }

  const handleDeleteContractor = (contractor: Contractor) => {
    if (confirm(`「${contractor.name}」を削除してもよろしいですか？\n関連する班データも削除されます。`)) {
      deleteContractor(contractor.id)
      loadData()
    }
  }

  const togglePasswordVisibility = (contractorId: string) => {
    const newVisible = new Set(visiblePasswords)
    if (newVisible.has(contractorId)) {
      newVisible.delete(contractorId)
    } else {
      newVisible.add(contractorId)
    }
    setVisiblePasswords(newVisible)
  }

  const handleRegeneratePassword = (contractor: Contractor) => {
    const newPassword = generateSimplePassword(10)
    setCurrentPassword(newPassword)
    setShowPasswordModal(true)

    updateContractor(contractor.id, { password: newPassword })
    loadData()
  }

  const handleAddTeam = (contractorId: string) => {
    setSelectedContractorForTeam(contractorId)
    setNewTeamName('')
    setShowAddTeamModal(true)
  }

  const handleSaveTeam = () => {
    if (!newTeamName.trim() || !selectedContractorForTeam) {
      alert('班名を入力してください')
      return
    }

    const newTeam: Team = {
      id: `team-${Date.now()}`,
      contractorId: selectedContractorForTeam,
      teamName: newTeamName,
      createdAt: new Date().toISOString(),
      isActive: true,
    }

    addTeam(newTeam)
    loadData()
    setShowAddTeamModal(false)
    setNewTeamName('')
    setSelectedContractorForTeam('')
  }

  const handleEditTeam = (team: Team) => {
    setEditingTeam(team)
    setEditTeamName(team.teamName)
    setShowEditTeamModal(true)
  }

  const handleSaveEditTeam = () => {
    if (!editingTeam || !editTeamName.trim()) {
      alert('班名を入力してください')
      return
    }

    updateTeam(editingTeam.id, { teamName: editTeamName })
    loadData()
    setShowEditTeamModal(false)
    setEditingTeam(null)
  }

  const handleDeleteTeam = (team: Team) => {
    if (confirm(`「${team.teamName}」を削除してもよろしいですか？`)) {
      deleteTeam(team.id)
      loadData()
    }
  }

  const getContractorTeams = (contractorId: string) => {
    return teams.filter(t => t.contractorId === contractorId && t.isActive)
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <h1 className="text-3xl font-bold text-gray-900">
                協力会社・班管理
              </h1>
              <button
                onClick={() => setShowAddContractorModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                新規協力会社を追加
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                協力会社一覧
              </h3>

              <div className="space-y-4">
                {contractors.map((contractor) => {
                  const contractorTeams = getContractorTeams(contractor.id)
                  const isExpanded = expandedContractors.has(contractor.id)

                  return (
                    <div key={contractor.id} className="border rounded-lg">
                      <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => toggleContractor(contractor.id)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <span className="text-xl">{isExpanded ? '▼' : '▶'}</span>
                          </button>
                          <h4 className="text-lg font-medium text-gray-900">
                            {contractor.name}
                          </h4>
                          {contractor.isActive ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ● アクティブ
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              ○ 非アクティブ
                            </span>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditContractor(contractor)}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <PencilIcon className="h-4 w-4 mr-1" />
                            編集
                          </button>
                          <button
                            onClick={() => handleDeleteContractor(contractor)}
                            className="inline-flex items-center px-3 py-1 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                          >
                            <TrashIcon className="h-4 w-4 mr-1" />
                            削除
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-4 py-4 space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">ユーザー名:</span>
                              <span className="ml-2 text-gray-900">{contractor.username}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">登録日:</span>
                              <span className="ml-2 text-gray-900">
                                {new Date(contractor.createdAt).toLocaleDateString('ja-JP')}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-700">パスワード:</span>
                              <span className="ml-2 text-gray-900 font-mono">
                                {visiblePasswords.has(contractor.id) ? contractor.password : '••••••••'}
                              </span>
                              <button
                                onClick={() => togglePasswordVisibility(contractor.id)}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                {visiblePasswords.has(contractor.id) ? (
                                  <EyeSlashIcon className="h-4 w-4" />
                                ) : (
                                  <EyeIcon className="h-4 w-4" />
                                )}
                              </button>
                              <button
                                onClick={() => handleRegeneratePassword(contractor)}
                                className="inline-flex items-center px-2 py-1 text-xs font-medium rounded text-blue-700 bg-blue-50 hover:bg-blue-100"
                              >
                                <KeyIcon className="h-3 w-3 mr-1" />
                                再発行
                              </button>
                            </div>
                          </div>

                          <div className="border-t pt-4">
                            <div className="flex justify-between items-center mb-3">
                              <h5 className="text-md font-medium text-gray-900">班一覧</h5>
                              <button
                                onClick={() => handleAddTeam(contractor.id)}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                              >
                                <PlusIcon className="h-4 w-4 mr-1" />
                                班を追加
                              </button>
                            </div>

                            <div className="bg-gray-50 rounded-md p-4">
                              {contractorTeams.length > 0 ? (
                                <div className="space-y-2">
                                  {contractorTeams.map((team) => (
                                    <div
                                      key={team.id}
                                      className="flex justify-between items-center bg-white px-3 py-2 rounded border"
                                    >
                                      <span className="font-medium text-gray-900">{team.teamName}</span>
                                      <div className="flex space-x-2">
                                        <button
                                          onClick={() => handleEditTeam(team)}
                                          className="text-blue-600 hover:text-blue-900 text-sm"
                                        >
                                          編集
                                        </button>
                                        <button
                                          onClick={() => handleDeleteTeam(team)}
                                          className="text-red-600 hover:text-red-900 text-sm"
                                        >
                                          削除
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500 text-center py-2">
                                  班が登録されていません
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}

                {contractors.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">協力会社が登録されていません</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* 新規協力会社追加モーダル */}
        {showAddContractorModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900">新規協力会社を追加</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">協力会社名</label>
                  <input
                    type="text"
                    value={newContractorName}
                    onChange={(e) => setNewContractorName(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900"
                    placeholder="例：○○建設"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">ユーザー名</label>
                  <input
                    type="text"
                    value={newContractorUsername}
                    onChange={(e) => setNewContractorUsername(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900"
                    placeholder="例：username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">パスワード</label>
                  <div className="mt-1 flex space-x-2">
                    <input
                      type="text"
                      value={newContractorPassword}
                      onChange={(e) => setNewContractorPassword(e.target.value)}
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono bg-white text-gray-900"
                      placeholder="パスワード"
                    />
                    <button
                      onClick={handleGeneratePassword}
                      className="px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      生成
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-2">
                <button
                  onClick={() => setShowAddContractorModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleAddContractor}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  追加
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 協力会社編集モーダル */}
        {showEditContractorModal && editingContractor && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900">協力会社を編集</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">協力会社名</label>
                  <input
                    type="text"
                    value={editContractorName}
                    onChange={(e) => setEditContractorName(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">ユーザー名</label>
                  <input
                    type="text"
                    value={editContractorUsername}
                    onChange={(e) => setEditContractorUsername(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-2">
                <button
                  onClick={() => setShowEditContractorModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSaveEditContractor}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 班追加モーダル */}
        {showAddTeamModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900">班を追加</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">班名</label>
                  <input
                    type="text"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900"
                    placeholder="例：A班、1班、第1班"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-2">
                <button
                  onClick={() => setShowAddTeamModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSaveTeam}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  追加
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 班編集モーダル */}
        {showEditTeamModal && editingTeam && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900">班を編集</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">班名</label>
                  <input
                    type="text"
                    value={editTeamName}
                    onChange={(e) => setEditTeamName(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-2">
                <button
                  onClick={() => setShowEditTeamModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSaveEditTeam}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        )}

        {/* パスワード再発行確認モーダル */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900">新しいパスワード</h3>
              </div>
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <p className="text-sm text-gray-700 mb-2">新しいパスワードが生成されました：</p>
                <p className="text-lg font-mono font-bold text-blue-600 text-center py-2">
                  {currentPassword}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  ※ このパスワードをコピーして、協力会社に伝えてください
                </p>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
