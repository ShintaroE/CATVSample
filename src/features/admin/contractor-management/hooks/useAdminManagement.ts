import { useState, useCallback } from 'react'
import { Admin } from '@/features/contractor/types'
import {
    getAdmins,
    addAdmin as addAdminToStorage,
    updateAdmin as updateAdminInStorage,
    deleteAdmin as deleteAdminFromStorage,
} from '@/features/contractor/lib/contractorStorage'
import { generateSimplePassword } from '@/shared/utils/password'

export const useAdminManagement = () => {
    const [admins, setAdmins] = useState<Admin[]>([])
    const [showAddModal, setShowAddModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showPasswordModal, setShowPasswordModal] = useState(false)

    const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null)
    const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set())
    const [currentGeneratedPassword, setCurrentGeneratedPassword] = useState<string>('')

    const loadAdmins = useCallback(() => {
        setAdmins(getAdmins())
    }, [])

    const addAdmin = useCallback((name: string, username: string, password: string): boolean => {
        if (!name.trim() || !username.trim() || !password.trim()) {
            alert('すべての項目を入力してください')
            return false
        }

        const newAdmin: Admin = {
            id: `admin-${Date.now()}`,
            name,
            username,
            password,
            createdAt: new Date().toISOString(),
            isActive: true,
        }

        addAdminToStorage(newAdmin)
        loadAdmins()
        setShowAddModal(false)
        return true
    }, [loadAdmins])

    const updateAdmin = useCallback((id: string, updates: Partial<Admin>) => {
        updateAdminInStorage(id, updates)
        loadAdmins()
        if (showEditModal) {
            setShowEditModal(false)
            setEditingAdmin(null)
        }
    }, [loadAdmins, showEditModal])

    const deleteAdmin = useCallback((admin: Admin) => {
        if (confirm(`管理者「${admin.name}」を削除してもよろしいですか？`)) {
            deleteAdminFromStorage(admin.id)
            loadAdmins()
        }
    }, [loadAdmins])

    const togglePasswordVisibility = useCallback((adminId: string) => {
        setVisiblePasswords(prev => {
            const newSet = new Set(prev)
            if (newSet.has(adminId)) {
                newSet.delete(adminId)
            } else {
                newSet.add(adminId)
            }
            return newSet
        })
    }, [])

    const regeneratePassword = useCallback((admin: Admin) => {
        const newPassword = generateSimplePassword(10)
        setCurrentGeneratedPassword(newPassword)
        setShowPasswordModal(true)
        updateAdminInStorage(admin.id, { password: newPassword })
        loadAdmins()
    }, [loadAdmins])

    const openEditModal = useCallback((admin: Admin) => {
        setEditingAdmin(admin)
        setShowEditModal(true)
    }, [])

    return {
        admins,
        showAddModal,
        setShowAddModal,
        showEditModal,
        setShowEditModal,
        showPasswordModal,
        setShowPasswordModal,
        editingAdmin,
        visiblePasswords,
        currentGeneratedPassword,
        loadAdmins,
        addAdmin,
        updateAdmin,
        deleteAdmin,
        togglePasswordVisibility,
        regeneratePassword,
        openEditModal
    }
}
