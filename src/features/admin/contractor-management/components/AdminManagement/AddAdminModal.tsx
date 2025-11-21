import React, { useState, useEffect } from 'react'
import { Button, Input, Modal } from '@/shared/components/ui'
import { generateSimplePassword } from '@/shared/utils/password'

interface AddAdminModalProps {
    isOpen: boolean
    onClose: () => void
    onAdd: (name: string, username: string, password: string) => void
}

export const AddAdminModal: React.FC<AddAdminModalProps> = ({ isOpen, onClose, onAdd }) => {
    const [name, setName] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [isAutoGenerate, setIsAutoGenerate] = useState(true)

    useEffect(() => {
        if (isOpen) {
            setName('')
            setUsername('')
            setIsAutoGenerate(true)
            setPassword(generateSimplePassword(10))
        }
    }, [isOpen])

    const handleTogglePasswordMode = () => {
        setIsAutoGenerate(!isAutoGenerate)
        if (!isAutoGenerate) {
            setPassword(generateSimplePassword(10))
        } else {
            setPassword('')
        }
    }

    const handleGeneratePassword = () => {
        setPassword(generateSimplePassword(10))
    }

    const handleSubmit = () => {
        onAdd(name, username, password)
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="新規管理者を追加">
            <div className="space-y-4">
                <Input
                    label="管理者名"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="例：田中太郎"
                />
                <Input
                    label="ユーザー名"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="例：tanaka"
                />
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">パスワード</label>
                        <label className="flex items-center text-sm text-gray-600">
                            <input
                                type="checkbox"
                                checked={isAutoGenerate}
                                onChange={handleTogglePasswordMode}
                                className="mr-2"
                            />
                            自動生成
                        </label>
                    </div>
                    {isAutoGenerate ? (
                        <div>
                            <div className="flex space-x-2">
                                <Input
                                    type="text"
                                    value={password}
                                    readOnly
                                    className="bg-gray-50 font-mono"
                                />
                                <Button
                                    onClick={handleGeneratePassword}
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
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="パスワードを入力してください"
                        />
                    )}
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
