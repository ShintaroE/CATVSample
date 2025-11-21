import React, { useState, useEffect } from 'react'
import { Button, Input, Modal } from '@/shared/components/ui'

interface AddTeamModalProps {
    isOpen: boolean
    onClose: () => void
    onAdd: (contractorId: string, teamName: string) => void
    contractorId: string
}

export const AddTeamModal: React.FC<AddTeamModalProps> = ({ isOpen, onClose, onAdd, contractorId }) => {
    const [teamName, setTeamName] = useState('')

    useEffect(() => {
        if (isOpen) {
            setTeamName('')
        }
    }, [isOpen])

    const handleSubmit = () => {
        onAdd(contractorId, teamName)
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="班を追加">
            <div className="space-y-4">
                <Input
                    label="班名"
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="例：A班、1班、第1班"
                />
            </div>
            <div className="mt-6 flex justify-end space-x-2">
                <Button onClick={onClose} variant="secondary">
                    キャンセル
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="primary"
                    className="bg-green-600 hover:bg-green-700"
                >
                    追加
                </Button>
            </div>
        </Modal>
    )
}
