import React from 'react'
import { Button } from '@/shared/components/ui'
import { Team } from '@/features/contractor/types'

interface TeamListProps {
    teams: Team[]
    onEditClick: (team: Team) => void
    onDeleteClick: (team: Team) => void
}

export const TeamList: React.FC<TeamListProps> = ({ teams, onEditClick, onDeleteClick }) => {
    if (teams.length === 0) {
        return (
            <p className="text-sm text-gray-500 text-center py-2">
                班が登録されていません
            </p>
        )
    }

    return (
        <div className="space-y-2">
            {teams.map((team) => (
                <div
                    key={team.id}
                    className="flex justify-between items-center bg-white px-3 py-2 rounded border"
                >
                    <span className="font-medium text-gray-900">{team.teamName}</span>
                    <div className="flex space-x-2">
                        <Button
                            onClick={() => onEditClick(team)}
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-900"
                        >
                            編集
                        </Button>
                        <Button
                            onClick={() => onDeleteClick(team)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-900"
                        >
                            削除
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    )
}
