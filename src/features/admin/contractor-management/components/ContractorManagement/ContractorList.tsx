import React from 'react'
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon, KeyIcon } from '@heroicons/react/24/outline'
import { Button } from '@/shared/components/ui'
import { Contractor, Team } from '@/features/contractor/types'
import { TeamList } from '../TeamManagement/TeamList'

interface ContractorListProps {
    contractors: Contractor[]
    expandedContractors: Set<string>
    visiblePasswords: Set<string>
    onAddClick: () => void
    onEditClick: (contractor: Contractor) => void
    onDeleteClick: (contractor: Contractor) => void
    onToggleExpand: (contractorId: string) => void
    onTogglePasswordVisibility: (contractorId: string) => void
    onRegeneratePassword: (contractor: Contractor) => void

    // Team related props
    getContractorTeams: (contractorId: string) => Team[]
    onAddTeamClick: (contractorId: string) => void
    onEditTeamClick: (team: Team) => void
    onDeleteTeamClick: (team: Team) => void
}

export const ContractorList: React.FC<ContractorListProps> = ({
    contractors,
    expandedContractors,
    visiblePasswords,
    onAddClick,
    onEditClick,
    onDeleteClick,
    onToggleExpand,
    onTogglePasswordVisibility,
    onRegeneratePassword,
    getContractorTeams,
    onAddTeamClick,
    onEditTeamClick,
    onDeleteTeamClick
}) => {
    return (
        <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        協力会社一覧
                    </h3>
                    <Button onClick={onAddClick} variant="primary">
                        <PlusIcon className="h-5 w-5 mr-2" />
                        新規協力会社を追加
                    </Button>
                </div>

                <div className="space-y-4">
                    {contractors.map((contractor) => {
                        const contractorTeams = getContractorTeams(contractor.id)
                        const isExpanded = expandedContractors.has(contractor.id)

                        return (
                            <div key={contractor.id} className="border rounded-lg">
                                <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
                                    <div className="flex items-center space-x-4">
                                        <Button
                                            onClick={() => onToggleExpand(contractor.id)}
                                            variant="ghost"
                                            size="sm"
                                        >
                                            <span className="text-xl">{isExpanded ? '▼' : '▶'}</span>
                                        </Button>
                                        <h4 className="text-lg font-medium text-gray-900">
                                            {contractor.name}
                                        </h4>
                                        {contractor.isActive ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                ● アクティブ
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                ○ 非アクティブ
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex space-x-2">
                                        <Button
                                            onClick={() => onEditClick(contractor)}
                                            variant="secondary"
                                            size="sm"
                                        >
                                            <PencilIcon className="h-4 w-4 mr-1" />
                                            編集
                                        </Button>
                                        <Button
                                            onClick={() => onDeleteClick(contractor)}
                                            variant="danger"
                                            size="sm"
                                        >
                                            <TrashIcon className="h-4 w-4 mr-1" />
                                            削除
                                        </Button>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="px-4 py-4 space-y-4">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="font-medium text-gray-700">ユーザー名:</span>
                                                <span className="ml-2 text-gray-900">{contractor.username}</span>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">登録日:</span>
                                                <span className="ml-2 text-gray-900">
                                                    {new Date(contractor.createdAt).toLocaleDateString('ja-JP')}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="font-medium text-gray-700">パスワード:</span>
                                                <span className="ml-2 text-gray-900 font-mono">
                                                    {visiblePasswords.has(contractor.id) ? contractor.password : '••••••••'}
                                                </span>
                                                <Button
                                                    onClick={() => onTogglePasswordVisibility(contractor.id)}
                                                    variant="ghost"
                                                    size="sm"
                                                >
                                                    {visiblePasswords.has(contractor.id) ? (
                                                        <EyeSlashIcon className="h-4 w-4" />
                                                    ) : (
                                                        <EyeIcon className="h-4 w-4" />
                                                    )}
                                                </Button>
                                                <Button
                                                    onClick={() => onRegeneratePassword(contractor)}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-blue-700 bg-blue-50 hover:bg-blue-100"
                                                >
                                                    <KeyIcon className="h-3 w-3 mr-1" />
                                                    再発行
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="border-t pt-4">
                                            <div className="flex justify-between items-center mb-3">
                                                <h5 className="text-md font-medium text-gray-900">班一覧</h5>
                                                <Button
                                                    onClick={() => onAddTeamClick(contractor.id)}
                                                    variant="primary"
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700"
                                                >
                                                    <PlusIcon className="h-4 w-4 mr-1" />
                                                    班を追加
                                                </Button>
                                            </div>

                                            <div className="bg-gray-50 rounded-md p-4">
                                                <TeamList
                                                    teams={contractorTeams}
                                                    onEditClick={onEditTeamClick}
                                                    onDeleteClick={onDeleteTeamClick}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}

                    {contractors.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-gray-500">協力会社が登録されていません</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
