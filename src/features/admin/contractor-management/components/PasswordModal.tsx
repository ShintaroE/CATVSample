import React from 'react'
import { Button, Modal } from '@/shared/components/ui'

interface PasswordModalProps {
    isOpen: boolean
    onClose: () => void
    password: string
}

export const PasswordModal: React.FC<PasswordModalProps> = ({ isOpen, onClose, password }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="新しいパスワード">
            <div className="bg-gray-50 p-4 rounded-md mb-4">
                <p className="text-sm text-gray-700 mb-2">新しいパスワードが生成されました：</p>
                <p className="text-lg font-mono font-bold text-blue-600 text-center py-2">
                    {password}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                    ※ このパスワードをコピーして、対象者に伝えてください
                </p>
            </div>
            <div className="flex justify-end">
                <Button onClick={onClose} variant="primary">
                    閉じる
                </Button>
            </div>
        </Modal>
    )
}
