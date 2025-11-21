import React from 'react'
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon, KeyIcon } from '@heroicons/react/24/outline'
import { Button } from '@/shared/components/ui'
import { Admin } from '@/features/contractor/types'

interface AdminListProps {
    admins: Admin[]
    visiblePasswords: Set<string>
    onAddClick: () => void
    onEditClick: (admin: Admin) => void
    onDeleteClick: (admin: Admin) => void
    onToggleActive: (admin: Admin) => void
    onTogglePasswordVisibility: (adminId: string) => void
    onRegeneratePassword: (admin: Admin) => void
}

export const AdminList: React.FC<AdminListProps> = ({
    admins,
    visiblePasswords,
    onAddClick,
    onEditClick,
    onDeleteClick,
    onToggleActive,
    onTogglePasswordVisibility,
    onRegeneratePassword
}) => {
    return (
        <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        管理者一覧
                    </h3>
                    <Button onClick={onAddClick} variant="primary">
                        <PlusIcon className="h-5 w-5 mr-2" />
                        新規管理者を追加
                    </Button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    名前
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ユーザー名
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    パスワード
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    作成日
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ステータス
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    操作
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {admins.map((admin) => (
                                <tr key={admin.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {admin.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {admin.username}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex items-center space-x-2">
                                            <span className="font-mono">
                                                {visiblePasswords.has(admin.id) ? admin.password : '••••••••••'}
                                            </span>
                                            <Button
                                                onClick={() => onTogglePasswordVisibility(admin.id)}
                                                variant="ghost"
                                                size="sm"
                                            >
                                                {visiblePasswords.has(admin.id) ? (
                                                    <EyeSlashIcon className="h-4 w-4" />
                                                ) : (
                                                    <EyeIcon className="h-4 w-4" />
                                                )}
                                            </Button>
                                            <Button
                                                onClick={() => onRegeneratePassword(admin)}
                                                variant="ghost"
                                                size="sm"
                                                title="パスワード再生成"
                                            >
                                                <KeyIcon className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(admin.createdAt).toLocaleDateString('ja-JP')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Button
                                            onClick={() => onToggleActive(admin)}
                                            variant="ghost"
                                            size="sm"
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${admin.isActive
                                                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                }`}
                                        >
                                            {admin.isActive ? '● アクティブ' : '● 無効'}
                                        </Button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <Button onClick={() => onEditClick(admin)} variant="ghost" size="sm">
                                            <PencilIcon className="h-4 w-4 inline" />
                                        </Button>
                                        <Button onClick={() => onDeleteClick(admin)} variant="ghost" size="sm">
                                            <TrashIcon className="h-4 w-4 inline" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {admins.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            管理者アカウントがありません
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
