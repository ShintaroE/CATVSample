'use client'

import React, { useState, useEffect } from 'react'
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon, KeyIcon, UserGroupIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import Layout from '@/shared/components/layout/Layout'
import { Admin, Contractor, Team } from '@/features/contractor/types'
import {
  getAdmins,
  addAdmin,
  updateAdmin,
  deleteAdmin,
  getContractors,
  getTeams,
  addContractor,
  updateContractor,
  deleteContractor,
  addTeam,
  updateTeam,
  deleteTeam,
  initializeDefaultData
} from '@/features/contractor/lib/contractorStorage'
import { generateSimplePassword } from '@/lib/password-generator'
import { Button, Input } from '@/shared/components/ui'

export default function ContractorManagementPage() {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [contractors, setContractors] = useState<Contractor[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [expandedContractors, setExpandedContractors] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<'admins' | 'contractors'>('admins')

  // モーダル状態
  const [showAddAdminModal, setShowAddAdminModal] = useState(false)
  const [showEditAdminModal, setShowEditAdminModal] = useState(false)
  const [showAddContractorModal, setShowAddContractorModal] = useState(false)
  const [showEditContractorModal, setShowEditContractorModal] = useState(false)
  const [showAddTeamModal, setShowAddTeamModal] = useState(false)
  const [showEditTeamModal, setShowEditTeamModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  // 管理者フォーム状態
  const [newAdminName, setNewAdminName] = useState('')
  const [newAdminUsername, setNewAdminUsername] = useState('')
  const [newAdminPassword, setNewAdminPassword] = useState('')
  const [isAutoGenerateAdminPassword, setIsAutoGenerateAdminPassword] = useState(true)
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null)
  const [editAdminName, setEditAdminName] = useState('')
  const [editAdminUsername, setEditAdminUsername] = useState('')
  const [visibleAdminPasswords, setVisibleAdminPasswords] = useState<Set<string>>(new Set())

  // 協力会社フォーム状態
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
    setAdmins(getAdmins())
    setContractors(getContractors())
    setTeams(getTeams())
  }

  // ========== 管理者関連の操作 ==========

  const handleOpenAddAdminModal = () => {
    setNewAdminName('')
    setNewAdminUsername('')
    setIsAutoGenerateAdminPassword(true)
    const password = generateSimplePassword(10)
    setNewAdminPassword(password)
    setShowAddAdminModal(true)
  }

  const handleToggleAdminPasswordMode = () => {
    setIsAutoGenerateAdminPassword(!isAutoGenerateAdminPassword)
    if (!isAutoGenerateAdminPassword) {
      // 自動生成モードに切り替える場合、新しいパスワードを生成
      const password = generateSimplePassword(10)
      setNewAdminPassword(password)
    } else {
      // 手動入力モードに切り替える場合、パスワードをクリア
      setNewAdminPassword('')
    }
  }

  const handleGenerateAdminPassword = () => {
    const password = generateSimplePassword(10)
    setNewAdminPassword(password)
  }

  const handleAddAdmin = () => {
    if (!newAdminName.trim() || !newAdminUsername.trim() || !newAdminPassword.trim()) {
      alert('すべての項目を入力してください')
      return
    }

    const newAdmin: Admin = {
      id: `admin-${Date.now()}`,
      name: newAdminName,
      username: newAdminUsername,
      password: newAdminPassword,
      createdAt: new Date().toISOString(),
      isActive: true,
    }

    addAdmin(newAdmin)
    loadData()

    setNewAdminName('')
    setNewAdminUsername('')
    setNewAdminPassword('')
    setShowAddAdminModal(false)
  }

  const handleEditAdmin = (admin: Admin) => {
    setEditingAdmin(admin)
    setEditAdminName(admin.name)
    setEditAdminUsername(admin.username)
    setShowEditAdminModal(true)
  }

  const handleSaveEditAdmin = () => {
    if (!editingAdmin || !editAdminName.trim() || !editAdminUsername.trim()) {
      alert('すべての項目を入力してください')
      return
    }

    updateAdmin(editingAdmin.id, {
      name: editAdminName,
      username: editAdminUsername,
    })
    loadData()
    setShowEditAdminModal(false)
    setEditingAdmin(null)
  }

  const handleDeleteAdmin = (admin: Admin) => {
    if (confirm(`管理者「${admin.name}」を削除してもよろしいですか？`)) {
      deleteAdmin(admin.id)
      loadData()
    }
  }

  const toggleAdminPasswordVisibility = (adminId: string) => {
    const newVisible = new Set(visibleAdminPasswords)
    if (newVisible.has(adminId)) {
      newVisible.delete(adminId)
    } else {
      newVisible.add(adminId)
    }
    setVisibleAdminPasswords(newVisible)
  }

  const handleRegenerateAdminPassword = (admin: Admin) => {
    const newPassword = generateSimplePassword(10)
    setCurrentPassword(newPassword)
    setShowPasswordModal(true)

    updateAdmin(admin.id, { password: newPassword })
    loadData()
  }

  const handleToggleAdminActive = (admin: Admin) => {
    updateAdmin(admin.id, { isActive: !admin.isActive })
    loadData()
  }

  // ========== 協力会社関連の操作 ==========

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
                アカウント管理
              </h1>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* タブナビゲーション */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <Button
                  onClick={() => setActiveTab('admins')}
                  variant="ghost"
                  className={`${
                    activeTab === 'admins'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <ShieldCheckIcon className="h-5 w-5 mr-2" />
                  管理者アカウント
                </Button>
                <Button
                  onClick={() => setActiveTab('contractors')}
                  variant="ghost"
                  className={`${
                    activeTab === 'contractors'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <UserGroupIcon className="h-5 w-5 mr-2" />
                  協力会社・班管理
                </Button>
              </nav>
            </div>
          </div>

          {/* 管理者タブ */}
          {activeTab === 'admins' && (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    管理者一覧
                  </h3>
                  <Button
                    onClick={handleOpenAddAdminModal}
                    variant="primary"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    新規管理者を追加
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          名前
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ユーザー名
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          パスワード
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          作成日
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ステータス
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {admins.map((admin) => (
                        <tr key={admin.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {admin.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {admin.username}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono">
                                {visibleAdminPasswords.has(admin.id) ? admin.password : '••••••••••'}
                              </span>
                              <Button
                                onClick={() => toggleAdminPasswordVisibility(admin.id)}
                                variant="ghost"
                                size="sm"
                              >
                                {visibleAdminPasswords.has(admin.id) ? (
                                  <EyeSlashIcon className="h-4 w-4" />
                                ) : (
                                  <EyeIcon className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                onClick={() => handleRegenerateAdminPassword(admin)}
                                variant="ghost"
                                size="sm"
                                title="パスワード再生成"
                              >
                                <KeyIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(admin.createdAt).toLocaleDateString('ja-JP')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Button
                              onClick={() => handleToggleAdminActive(admin)}
                              variant="ghost"
                              size="sm"
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                admin.isActive
                                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                  : 'bg-red-100 text-red-800 hover:bg-red-200'
                              }`}
                            >
                              {admin.isActive ? '● アクティブ' : '● 無効'}
                            </Button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <Button
                              onClick={() => handleEditAdmin(admin)}
                              variant="ghost"
                              size="sm"
                            >
                              <PencilIcon className="h-4 w-4 inline" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteAdmin(admin)}
                              variant="ghost"
                              size="sm"
                            >
                              <TrashIcon className="h-4 w-4 inline" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {admins.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      管理者アカウントがありません
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 協力会社タブ */}
          {activeTab === 'contractors' && (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    協力会社一覧
                  </h3>
                  <Button
                    onClick={() => setShowAddContractorModal(true)}
                    variant="primary"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    新規協力会社を追加
                  </Button>
                </div>

              <div className="space-y-4">
                {contractors.map((contractor) => {
                  const contractorTeams = getContractorTeams(contractor.id)
                  const isExpanded = expandedContractors.has(contractor.id)

                  return (
                    <div key={contractor.id} className="border rounded-lg">
                      <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <Button
                            onClick={() => toggleContractor(contractor.id)}
                            variant="ghost"
                            size="sm"
                          >
                            <span className="text-xl">{isExpanded ? '▼' : '▶'}</span>
                          </Button>
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
                          <Button
                            onClick={() => handleEditContractor(contractor)}
                            variant="secondary"
                            size="sm"
                          >
                            <PencilIcon className="h-4 w-4 mr-1" />
                            編集
                          </Button>
                          <Button
                            onClick={() => handleDeleteContractor(contractor)}
                            variant="danger"
                            size="sm"
                          >
                            <TrashIcon className="h-4 w-4 mr-1" />
                            削除
                          </Button>
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
                              <Button
                                onClick={() => togglePasswordVisibility(contractor.id)}
                                variant="ghost"
                                size="sm"
                              >
                                {visiblePasswords.has(contractor.id) ? (
                                  <EyeSlashIcon className="h-4 w-4" />
                                ) : (
                                  <EyeIcon className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                onClick={() => handleRegeneratePassword(contractor)}
                                variant="ghost"
                                size="sm"
                                className="text-blue-700 bg-blue-50 hover:bg-blue-100"
                              >
                                <KeyIcon className="h-3 w-3 mr-1" />
                                再発行
                              </Button>
                            </div>
                          </div>

                          <div className="border-t pt-4">
                            <div className="flex justify-between items-center mb-3">
                              <h5 className="text-md font-medium text-gray-900">班一覧</h5>
                              <Button
                                onClick={() => handleAddTeam(contractor.id)}
                                variant="primary"
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <PlusIcon className="h-4 w-4 mr-1" />
                                班を追加
                              </Button>
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
                                        <Button
                                          onClick={() => handleEditTeam(team)}
                                          variant="ghost"
                                          size="sm"
                                          className="text-blue-600 hover:text-blue-900"
                                        >
                                          編集
                                        </Button>
                                        <Button
                                          onClick={() => handleDeleteTeam(team)}
                                          variant="ghost"
                                          size="sm"
                                          className="text-red-600 hover:text-red-900"
                                        >
                                          削除
                                        </Button>
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
          )}
        </main>

        {/* 管理者追加モーダル */}
        {showAddAdminModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900">新規管理者を追加</h3>
              </div>
              <div className="space-y-4">
                <Input
                  label="管理者名"
                  type="text"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  placeholder="例：田中太郎"
                />
                <Input
                  label="ユーザー名"
                  type="text"
                  value={newAdminUsername}
                  onChange={(e) => setNewAdminUsername(e.target.value)}
                  placeholder="例：tanaka"
                />
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">パスワード</label>
                    <label className="flex items-center text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={isAutoGenerateAdminPassword}
                        onChange={handleToggleAdminPasswordMode}
                        className="mr-2"
                      />
                      自動生成
                    </label>
                  </div>
                  {isAutoGenerateAdminPassword ? (
                    <div>
                      <div className="flex space-x-2">
                        <Input
                          type="text"
                          value={newAdminPassword}
                          readOnly
                          className="bg-gray-50 font-mono"
                        />
                        <Button
                          onClick={handleGenerateAdminPassword}
                          variant="secondary"
                          size="sm"
                          className="mt-1 whitespace-nowrap"
                        >
                          再生成
                        </Button>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        ※このパスワードを管理者に共有してください
                      </p>
                    </div>
                  ) : (
                    <Input
                      type="text"
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      placeholder="パスワードを入力してください"
                    />
                  )}
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-2">
                <Button
                  onClick={() => setShowAddAdminModal(false)}
                  variant="secondary"
                >
                  キャンセル
                </Button>
                <Button
                  onClick={handleAddAdmin}
                  variant="primary"
                >
                  追加
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 管理者編集モーダル */}
        {showEditAdminModal && editingAdmin && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900">管理者を編集</h3>
              </div>
              <div className="space-y-4">
                <Input
                  label="管理者名"
                  type="text"
                  value={editAdminName}
                  onChange={(e) => setEditAdminName(e.target.value)}
                />
                <Input
                  label="ユーザー名"
                  type="text"
                  value={editAdminUsername}
                  onChange={(e) => setEditAdminUsername(e.target.value)}
                />
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <p className="text-xs text-yellow-800">
                    パスワードを変更する場合は、パスワード再生成ボタンを使用してください
                  </p>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-2">
                <Button
                  onClick={() => setShowEditAdminModal(false)}
                  variant="secondary"
                >
                  キャンセル
                </Button>
                <Button
                  onClick={handleSaveEditAdmin}
                  variant="primary"
                >
                  保存
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 新規協力会社追加モーダル */}
        {showAddContractorModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900">新規協力会社を追加</h3>
              </div>
              <div className="space-y-4">
                <Input
                  label="協力会社名"
                  type="text"
                  value={newContractorName}
                  onChange={(e) => setNewContractorName(e.target.value)}
                  placeholder="例：○○建設"
                />
                <Input
                  label="ユーザー名"
                  type="text"
                  value={newContractorUsername}
                  onChange={(e) => setNewContractorUsername(e.target.value)}
                  placeholder="例：username"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">パスワード</label>
                  <div className="flex space-x-2">
                    <Input
                      type="text"
                      value={newContractorPassword}
                      onChange={(e) => setNewContractorPassword(e.target.value)}
                      placeholder="パスワード"
                      className="font-mono"
                    />
                    <Button
                      onClick={handleGeneratePassword}
                      variant="secondary"
                      size="sm"
                      className="whitespace-nowrap"
                    >
                      生成
                    </Button>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-2">
                <Button
                  onClick={() => setShowAddContractorModal(false)}
                  variant="secondary"
                >
                  キャンセル
                </Button>
                <Button
                  onClick={handleAddContractor}
                  variant="primary"
                >
                  追加
                </Button>
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
                <Input
                  label="協力会社名"
                  type="text"
                  value={editContractorName}
                  onChange={(e) => setEditContractorName(e.target.value)}
                />
                <Input
                  label="ユーザー名"
                  type="text"
                  value={editContractorUsername}
                  onChange={(e) => setEditContractorUsername(e.target.value)}
                />
              </div>
              <div className="mt-6 flex justify-end space-x-2">
                <Button
                  onClick={() => setShowEditContractorModal(false)}
                  variant="secondary"
                >
                  キャンセル
                </Button>
                <Button
                  onClick={handleSaveEditContractor}
                  variant="primary"
                >
                  保存
                </Button>
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
                <Input
                  label="班名"
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="例：A班、1班、第1班"
                />
              </div>
              <div className="mt-6 flex justify-end space-x-2">
                <Button
                  onClick={() => setShowAddTeamModal(false)}
                  variant="secondary"
                >
                  キャンセル
                </Button>
                <Button
                  onClick={handleSaveTeam}
                  variant="primary"
                  className="bg-green-600 hover:bg-green-700"
                >
                  追加
                </Button>
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
                <Input
                  label="班名"
                  type="text"
                  value={editTeamName}
                  onChange={(e) => setEditTeamName(e.target.value)}
                />
              </div>
              <div className="mt-6 flex justify-end space-x-2">
                <Button
                  onClick={() => setShowEditTeamModal(false)}
                  variant="secondary"
                >
                  キャンセル
                </Button>
                <Button
                  onClick={handleSaveEditTeam}
                  variant="primary"
                >
                  保存
                </Button>
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
                <Button
                  onClick={() => setShowPasswordModal(false)}
                  variant="primary"
                >
                  閉じる
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
