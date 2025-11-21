import { useState, useCallback } from 'react'
import { Contractor } from '@/features/contractor/types'
import {
    getContractors,
    addContractor as addContractorToStorage,
    updateContractor as updateContractorInStorage,
    deleteContractor as deleteContractorFromStorage,
} from '@/features/contractor/lib/contractorStorage'
import { generateSimplePassword } from '@/shared/utils/password'

export const useContractorManagement = () => {
    const [contractors, setContractors] = useState<Contractor[]>([])
    const [showAddModal, setShowAddModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showPasswordModal, setShowPasswordModal] = useState(false)

    const [editingContractor, setEditingContractor] = useState<Contractor | null>(null)
    const [expandedContractors, setExpandedContractors] = useState<Set<string>>(new Set())
    const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set())
    const [currentGeneratedPassword, setCurrentGeneratedPassword] = useState<string>('')

    const loadContractors = useCallback(() => {
        setContractors(getContractors())
    }, [])

    const addContractor = useCallback((name: string, username: string, password: string): boolean => {
        if (!name.trim() || !username.trim() || !password.trim()) {
            alert('すべての項目を入力してください')
            return false
        }

        const newContractor: Contractor = {
            id: `contractor-${Date.now()}`,
            name,
            username,
            password,
            createdAt: new Date().toISOString(),
            isActive: true,
        }

        addContractorToStorage(newContractor)
        loadContractors()
        setShowAddModal(false)
        return true
    }, [loadContractors])

    const updateContractor = useCallback((id: string, updates: Partial<Contractor>) => {
        updateContractorInStorage(id, updates)
        loadContractors()
        if (showEditModal) {
            setShowEditModal(false)
            setEditingContractor(null)
        }
    }, [loadContractors, showEditModal])

    const deleteContractor = useCallback((contractor: Contractor) => {
        if (confirm(`「${contractor.name}」を削除してもよろしいですか？\n関連する班データも削除されます。`)) {
            deleteContractorFromStorage(contractor.id)
            loadContractors()
        }
    }, [loadContractors])

    const toggleContractorExpand = useCallback((contractorId: string) => {
        setExpandedContractors(prev => {
            const newSet = new Set(prev)
            if (newSet.has(contractorId)) {
                newSet.delete(contractorId)
            } else {
                newSet.add(contractorId)
            }
            return newSet
        })
    }, [])

    const togglePasswordVisibility = useCallback((contractorId: string) => {
        setVisiblePasswords(prev => {
            const newSet = new Set(prev)
            if (newSet.has(contractorId)) {
                newSet.delete(contractorId)
            } else {
                newSet.add(contractorId)
            }
            return newSet
        })
    }, [])

    const regeneratePassword = useCallback((contractor: Contractor) => {
        const newPassword = generateSimplePassword(10)
        setCurrentGeneratedPassword(newPassword)
        setShowPasswordModal(true)
        updateContractorInStorage(contractor.id, { password: newPassword })
        loadContractors()
    }, [loadContractors])

    const openEditModal = useCallback((contractor: Contractor) => {
        setEditingContractor(contractor)
        setShowEditModal(true)
    }, [])

    return {
        contractors,
        showAddModal,
        setShowAddModal,
        showEditModal,
        setShowEditModal,
        showPasswordModal,
        setShowPasswordModal,
        editingContractor,
        expandedContractors,
        visiblePasswords,
        currentGeneratedPassword,
        loadContractors,
        addContractor,
        updateContractor,
        deleteContractor,
        toggleContractorExpand,
        togglePasswordVisibility,
        regeneratePassword,
        openEditModal
    }
}
