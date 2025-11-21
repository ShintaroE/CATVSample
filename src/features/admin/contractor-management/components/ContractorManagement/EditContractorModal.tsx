import React, { useState, useEffect } from 'react'
import { Button, Input, Modal } from '@/shared/components/ui'
import { Contractor } from '@/features/contractor/types'

interface EditContractorModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (id: string, updates: Partial<Contractor>) => void
    contractor: Contractor | null
}

export const EditContractorModal: React.FC<EditContractorModalProps> = ({ isOpen, onClose, onSave, contractor }) => {
    const [name, setName] = useState('')
    const [username, setUsername] = useState('')

    useEffect(() => {
        if (contractor) {
            setName(contractor.name)
            setUsername(contractor.username)
        }
    }, [contractor])

    const handleSubmit = () => {
        if (contractor) {
            onSave(contractor.id, { name, username })
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="協力会社を編集">
            <div className="space-y-4">
                <Input
                    label="協力会社名"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <Input
                    label="ユーザー名"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
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
