import React, { useState, useEffect } from 'react'
import { Button, Input, Modal } from '@/shared/components/ui'
import { generateSimplePassword } from '@/shared/utils/password'

interface AddContractorModalProps {
    isOpen: boolean
    onClose: () => void
    onAdd: (name: string, username: string, password: string) => void
}

export const AddContractorModal: React.FC<AddContractorModalProps> = ({ isOpen, onClose, onAdd }) => {
    const [name, setName] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    useEffect(() => {
        if (isOpen) {
            setName('')
            setUsername('')
            setPassword('')
        }
    }, [isOpen])

    const handleGeneratePassword = () => {
        setPassword(generateSimplePassword(10))
    }

    const handleSubmit = () => {
        onAdd(name, username, password)
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="新規協力会社を追加">
            <div className="space-y-4">
                <Input
                    label="協力会社名"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="例：○○建設"
                />
                <Input
                    label="ユーザー名"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="例：username"
                />
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">パスワード</label>
                    <div className="flex space-x-2">
                        <Input
                            type="text"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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
                <Button onClick={onClose} variant="secondary">
                    キャンセル
                </Button>
                <Button onClick={handleSubmit} variant="primary">
                    追加
                </Button>
            </div>
        </Modal>
    )
}
