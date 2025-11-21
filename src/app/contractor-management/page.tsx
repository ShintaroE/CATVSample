'use client'

import React, { useState, useEffect } from 'react'
import { ShieldCheckIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import Layout from '@/shared/components/layout/Layout'
import { Button } from '@/shared/components/ui'
import { initializeDefaultData } from '@/features/contractor/lib/contractorStorage'

// Hooks
import { useAdminManagement } from '@/features/admin/contractor-management/hooks/useAdminManagement'
import { useContractorManagement } from '@/features/admin/contractor-management/hooks/useContractorManagement'
import { useTeamManagement } from '@/features/admin/contractor-management/hooks/useTeamManagement'

// Components
import { AdminList } from '@/features/admin/contractor-management/components/AdminManagement/AdminList'
import { AddAdminModal } from '@/features/admin/contractor-management/components/AdminManagement/AddAdminModal'
import { EditAdminModal } from '@/features/admin/contractor-management/components/AdminManagement/EditAdminModal'
import { ContractorList } from '@/features/admin/contractor-management/components/ContractorManagement/ContractorList'
import { AddContractorModal } from '@/features/admin/contractor-management/components/ContractorManagement/AddContractorModal'
import { EditContractorModal } from '@/features/admin/contractor-management/components/ContractorManagement/EditContractorModal'
import { AddTeamModal } from '@/features/admin/contractor-management/components/TeamManagement/AddTeamModal'
import { EditTeamModal } from '@/features/admin/contractor-management/components/TeamManagement/EditTeamModal'
import { PasswordModal } from '@/features/admin/contractor-management/components/PasswordModal'

export default function ContractorManagementPage() {
  const [activeTab, setActiveTab] = useState<'admins' | 'contractors'>('admins')

  // Hooks
  const adminMgmt = useAdminManagement()
  const contractorMgmt = useContractorManagement()
  const teamMgmt = useTeamManagement()

  const { loadAdmins } = adminMgmt
  const { loadContractors } = contractorMgmt
  const { loadTeams } = teamMgmt

  useEffect(() => {
    // 初期データのセットアップ
    initializeDefaultData()

    // データの読み込み
    loadAdmins()
    loadContractors()
    loadTeams()
  }, [loadAdmins, loadContractors, loadTeams])

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
                  className={`${activeTab === 'admins'
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
                  className={`${activeTab === 'contractors'
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
            <>
              <AdminList
                admins={adminMgmt.admins}
                visiblePasswords={adminMgmt.visiblePasswords}
                onAddClick={() => adminMgmt.setShowAddModal(true)}
                onEditClick={adminMgmt.openEditModal}
                onDeleteClick={adminMgmt.deleteAdmin}
                onToggleActive={(admin) => adminMgmt.updateAdmin(admin.id, { isActive: !admin.isActive })}
                onTogglePasswordVisibility={adminMgmt.togglePasswordVisibility}
                onRegeneratePassword={adminMgmt.regeneratePassword}
              />

              <AddAdminModal
                isOpen={adminMgmt.showAddModal}
                onClose={() => adminMgmt.setShowAddModal(false)}
                onAdd={adminMgmt.addAdmin}
              />

              <EditAdminModal
                isOpen={adminMgmt.showEditModal}
                onClose={() => adminMgmt.setShowEditModal(false)}
                onSave={adminMgmt.updateAdmin}
                admin={adminMgmt.editingAdmin}
              />

              <PasswordModal
                isOpen={adminMgmt.showPasswordModal}
                onClose={() => adminMgmt.setShowPasswordModal(false)}
                password={adminMgmt.currentGeneratedPassword}
              />
            </>
          )}

          {/* 協力会社タブ */}
          {activeTab === 'contractors' && (
            <>
              <ContractorList
                contractors={contractorMgmt.contractors}
                expandedContractors={contractorMgmt.expandedContractors}
                visiblePasswords={contractorMgmt.visiblePasswords}
                onAddClick={() => contractorMgmt.setShowAddModal(true)}
                onEditClick={contractorMgmt.openEditModal}
                onDeleteClick={contractorMgmt.deleteContractor}
                onToggleExpand={contractorMgmt.toggleContractorExpand}
                onTogglePasswordVisibility={contractorMgmt.togglePasswordVisibility}
                onRegeneratePassword={contractorMgmt.regeneratePassword}

                // Team props
                getContractorTeams={teamMgmt.getContractorTeams}
                onAddTeamClick={teamMgmt.openAddModal}
                onEditTeamClick={teamMgmt.openEditModal}
                onDeleteTeamClick={teamMgmt.deleteTeam}
              />

              <AddContractorModal
                isOpen={contractorMgmt.showAddModal}
                onClose={() => contractorMgmt.setShowAddModal(false)}
                onAdd={contractorMgmt.addContractor}
              />

              <EditContractorModal
                isOpen={contractorMgmt.showEditModal}
                onClose={() => contractorMgmt.setShowEditModal(false)}
                onSave={contractorMgmt.updateContractor}
                contractor={contractorMgmt.editingContractor}
              />

              <AddTeamModal
                isOpen={teamMgmt.showAddModal}
                onClose={() => teamMgmt.setShowAddModal(false)}
                onAdd={teamMgmt.addTeam}
                contractorId={teamMgmt.selectedContractorId}
              />

              <EditTeamModal
                isOpen={teamMgmt.showEditModal}
                onClose={() => teamMgmt.setShowEditModal(false)}
                onSave={teamMgmt.updateTeam}
                team={teamMgmt.editingTeam}
              />

              <PasswordModal
                isOpen={contractorMgmt.showPasswordModal}
                onClose={() => contractorMgmt.setShowPasswordModal(false)}
                password={contractorMgmt.currentGeneratedPassword}
              />
            </>
          )}
        </main>
      </div>
    </Layout>
  )
}
