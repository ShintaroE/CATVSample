import { useState } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { Team } from '@/features/contractor/types'

interface TeamFilterProps {
  teams: Team[]
  selectedTeamIds: string[]
  onSelectionChange: (teamIds: string[]) => void
}

/**
 * 班フィルターコンポーネント
 * チェックボックスで複数の班を選択可能
 */
export default function TeamFilter({
  teams,
  selectedTeamIds,
  onSelectionChange
}: TeamFilterProps) {
  const [isOpen, setIsOpen] = useState(false)

  const activeTeams = teams.filter(t => t.isActive)
  const allSelected = selectedTeamIds.length === activeTeams.length

  const handleToggleAll = () => {
    if (allSelected) {
      onSelectionChange([])
    } else {
      onSelectionChange(activeTeams.map(t => t.id))
    }
  }

  const handleToggleTeam = (teamId: string) => {
    if (selectedTeamIds.includes(teamId)) {
      onSelectionChange(selectedTeamIds.filter(id => id !== teamId))
    } else {
      onSelectionChange([...selectedTeamIds, teamId])
    }
  }

  return (
    <div className="relative inline-block">
      {/* フィルターボタン */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-medium">
          班フィルター ({selectedTeamIds.length}/{activeTeams.length})
        </span>
        <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* ドロップダウンパネル */}
      {isOpen && (
        <>
          {/* オーバーレイ */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* パネル */}
          <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            <div className="p-2 max-h-80 overflow-y-auto">
              {/* 全て選択/解除 */}
              <label className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleToggleAll}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-semibold">全て</span>
              </label>

              <div className="border-t border-gray-200 my-1" />

              {/* 各班のチェックボックス */}
              {activeTeams.map(team => (
                <label
                  key={team.id}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedTeamIds.includes(team.id)}
                    onChange={() => handleToggleTeam(team.id)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm">{team.teamName}</span>
                </label>
              ))}

              {activeTeams.length === 0 && (
                <div className="px-3 py-4 text-sm text-gray-500 text-center">
                  利用可能な班がありません
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
