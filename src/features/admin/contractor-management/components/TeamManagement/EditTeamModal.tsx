import React, { useState, useEffect } from 'react'
import { Button, Input, Modal } from '@/shared/components/ui'
import { Team } from '@/features/contractor/types'

interface EditTeamModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (id: string, teamName: string) => void
    team: Team | null
}

export const EditTeamModal: React.FC<EditTeamModalProps> = ({ isOpen, onClose, onSave, team }) => {
    const [teamName, setTeamName] = useState('')

    useEffect(() => {
        if (team) {
            setTeamName(team.teamName)
        }
    }, [team])

    const handleSubmit = () => {
        if (team) {
            onSave(team.id, teamName)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="班を編集">
            <div className="space-y-4">
                <Input
                    label="班名"
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                />
            </div>
            <div className="mt-6 flex justify-end space-x-2">
                <Button onClick={onClose} variant="secondary">
                    キャンセル
                </Button>
                <Button onClick={handleSubmit} variant="primary">
                    保存
                </Button>
            </div>
        </Modal>
    )
}
