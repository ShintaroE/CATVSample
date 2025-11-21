import React, { useState, useEffect } from 'react'
import { Button, Input, Modal } from '@/shared/components/ui'
import { Admin } from '@/features/contractor/types'

interface EditAdminModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (id: string, updates: Partial<Admin>) => void
    admin: Admin | null
}

export const EditAdminModal: React.FC<EditAdminModalProps> = ({ isOpen, onClose, onSave, admin }) => {
    const [name, setName] = useState('')
    const [username, setUsername] = useState('')

    useEffect(() => {
        if (admin) {
            setName(admin.name)
            setUsername(admin.username)
        }
    }, [admin])

    const handleSubmit = () => {
        if (admin) {
            onSave(admin.id, { name, username })
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="管理者を編集">
            <div className="space-y-4">
                <Input
                    label="管理者名"
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
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                    <p className="text-xs text-yellow-800">
                        パスワードを変更する場合は、一覧画面のパスワード再生成ボタンを使用してください
                    </p>
                </div>
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
