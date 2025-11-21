import { useState, useCallback } from 'react'
import { Team } from '@/features/contractor/types'
import {
    getTeams,
    addTeam as addTeamToStorage,
    updateTeam as updateTeamInStorage,
    deleteTeam as deleteTeamFromStorage,
} from '@/features/contractor/lib/contractorStorage'

export const useTeamManagement = () => {
    const [teams, setTeams] = useState<Team[]>([])
    const [showAddModal, setShowAddModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)

    const [editingTeam, setEditingTeam] = useState<Team | null>(null)
    const [selectedContractorId, setSelectedContractorId] = useState<string>('')

    const loadTeams = useCallback(() => {
        setTeams(getTeams())
    }, [])

    const getContractorTeams = useCallback((contractorId: string) => {
        return teams.filter(t => t.contractorId === contractorId && t.isActive)
    }, [teams])

    const addTeam = useCallback((contractorId: string, teamName: string): boolean => {
        if (!teamName.trim() || !contractorId) {
            alert('班名を入力してください')
            return false
        }

        const newTeam: Team = {
            id: `team-${Date.now()}`,
            contractorId,
            teamName,
            createdAt: new Date().toISOString(),
            isActive: true,
        }

        addTeamToStorage(newTeam)
        loadTeams()
        setShowAddModal(false)
        return true
    }, [loadTeams])

    const updateTeam = useCallback((id: string, teamName: string) => {
        if (!teamName.trim()) {
            alert('班名を入力してください')
            return
        }

        updateTeamInStorage(id, { teamName })
        loadTeams()
        setShowEditModal(false)
        setEditingTeam(null)
    }, [loadTeams])

    const deleteTeam = useCallback((team: Team) => {
        if (confirm(`「${team.teamName}」を削除してもよろしいですか？`)) {
            deleteTeamFromStorage(team.id)
            loadTeams()
        }
    }, [loadTeams])

    const openAddModal = useCallback((contractorId: string) => {
        setSelectedContractorId(contractorId)
        setShowAddModal(true)
    }, [])

    const openEditModal = useCallback((team: Team) => {
        setEditingTeam(team)
        setShowEditModal(true)
    }, [])

    return {
        teams,
        showAddModal,
        setShowAddModal,
        showEditModal,
        setShowEditModal,
        editingTeam,
        selectedContractorId,
        loadTeams,
        getContractorTeams,
        addTeam,
        updateTeam,
        deleteTeam,
        openAddModal,
        openEditModal
    }
}
