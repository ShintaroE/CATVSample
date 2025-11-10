import { useState } from 'react'
import { XMarkIcon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { ScheduleItem, ExclusionEntry } from '@/app/schedule/types'
import { Team } from '@/features/contractor/types'
import ExclusionForm from '../ExclusionForm'
import Button from '@/shared/components/ui/Button'

interface DayDetailPanelProps {
  date: string
  schedules: ScheduleItem[]
  exclusions: ExclusionEntry[]
  teams: Team[]
  contractorId: string
  contractorName: string
  onExclusionAdd: (exclusion: ExclusionEntry) => void
  onExclusionUpdate: (id: string, updates: Partial<ExclusionEntry>) => void
  onExclusionDelete: (id: string) => void
  onClose: () => void
}

/**
 * 除外日の時間帯表示を取得
 */
function getTimeDisplay(exclusion: ExclusionEntry): string {
  switch (exclusion.timeType) {
    case 'all_day':
      return '終日 (9:00-18:00)'
    case 'am':
      return '午前 (9:00-12:00)'
    case 'pm':
      return '午後 (12:00-18:00)'
    case 'custom':
      return `${exclusion.startTime}-${exclusion.endTime}`
    default:
      return ''
  }
}

/**
 * 日付を日本語形式で表示
 */
function formatJapaneseDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  const weekDays = ['日', '月', '火', '水', '木', '金', '土']
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekDay = weekDays[date.getDay()]
  return `${year}年${month}月${day}日（${weekDay}）`
}

/**
 * 選択された日付の詳細表示サイドパネル
 */
export default function DayDetailPanel({
  date,
  schedules,
  exclusions,
  teams,
  contractorId,
  contractorName,
  onExclusionAdd,
  onExclusionUpdate,
  onExclusionDelete,
  onClose
}: DayDetailPanelProps) {
  const [expandedSections, setExpandedSections] = useState({
    schedules: true,
    exclusions: true,
    form: true
  })
  const [editingExclusionId, setEditingExclusionId] = useState<string | null>(null)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleAddExclusion = (data: Omit<ExclusionEntry, 'id'>) => {
    const newExclusion: ExclusionEntry = {
      ...data,
      id: `exclusion-${Date.now()}`
    }
    onExclusionAdd(newExclusion)
    setFormMode('create')
    setEditingExclusionId(null)
  }

  const handleUpdateExclusion = (data: Omit<ExclusionEntry, 'id'>) => {
    if (editingExclusionId) {
      onExclusionUpdate(editingExclusionId, data)
      setFormMode('create')
      setEditingExclusionId(null)
    }
  }

  const handleEditClick = (exclusion: ExclusionEntry) => {
    setFormMode('edit')
    setEditingExclusionId(exclusion.id)
    setExpandedSections(prev => ({ ...prev, form: true }))
  }

  const handleCancelEdit = () => {
    setFormMode('create')
    setEditingExclusionId(null)
  }

  const editingExclusion = exclusions.find(e => e.id === editingExclusionId)

  return (
    <div className="h-full bg-white rounded-lg shadow-lg flex flex-col">
      {/* ヘッダー */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900">
          {formatJapaneseDate(date)}
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-200 rounded transition-colors"
          aria-label="閉じる"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      {/* スクロール可能なコンテンツエリア */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 工事予定セクション */}
        <div>
          <button
            onClick={() => toggleSection('schedules')}
            className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded transition-colors"
          >
            <div className="flex items-center gap-2">
              {expandedSections.schedules ? (
                <ChevronDownIcon className="w-4 h-4" />
              ) : (
                <ChevronRightIcon className="w-4 h-4" />
              )}
              <h4 className="font-semibold text-gray-900">工事予定</h4>
              <span className="text-sm text-gray-600">({schedules.length}件)</span>
            </div>
          </button>

          {expandedSections.schedules && (
            <div className="mt-2 space-y-2">
              {schedules.length === 0 ? (
                <div className="text-sm text-gray-500 text-center py-4">
                  この日の工事予定はありません
                </div>
              ) : (
                schedules.map(schedule => (
                  <div
                    key={schedule.id}
                    className="bg-blue-50 border border-blue-200 rounded-lg p-3"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🔧</span>
                      <span className="font-medium text-blue-700">{schedule.timeSlot}</span>
                    </div>
                    <div className="text-sm space-y-1">
                      <div className="text-gray-700">
                        <span className="font-medium">{schedule.contractor} - {schedule.teamName}</span>
                      </div>
                      <div className="text-gray-900">{schedule.customerName}様</div>
                      <div className="text-gray-600">{schedule.address}</div>
                      <div className="text-gray-600">{schedule.workType}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* 除外日セクション */}
        <div>
          <button
            onClick={() => toggleSection('exclusions')}
            className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded transition-colors"
          >
            <div className="flex items-center gap-2">
              {expandedSections.exclusions ? (
                <ChevronDownIcon className="w-4 h-4" />
              ) : (
                <ChevronRightIcon className="w-4 h-4" />
              )}
              <h4 className="font-semibold text-gray-900">除外日</h4>
              <span className="text-sm text-gray-600">({exclusions.length}件)</span>
            </div>
          </button>

          {expandedSections.exclusions && (
            <div className="mt-2 space-y-2">
              {exclusions.length === 0 ? (
                <div className="text-sm text-gray-500 text-center py-4">
                  この日の除外日はありません
                </div>
              ) : (
                exclusions.map(exclusion => (
                  <div
                    key={exclusion.id}
                    className="bg-red-50 border border-red-200 rounded-lg p-3"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🚫</span>
                      <span className="font-medium text-red-700">
                        {getTimeDisplay(exclusion)}
                      </span>
                    </div>
                    <div className="text-sm space-y-1 mb-3">
                      <div className="text-gray-700">
                        <span className="font-medium">{exclusion.teamName}</span>
                      </div>
                      <div className="text-gray-900">{exclusion.reason}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEditClick(exclusion)}
                      >
                        編集
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => onExclusionDelete(exclusion.id)}
                      >
                        削除
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* 除外日登録フォームセクション */}
        <div>
          <button
            onClick={() => toggleSection('form')}
            className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded transition-colors"
          >
            <div className="flex items-center gap-2">
              {expandedSections.form ? (
                <ChevronDownIcon className="w-4 h-4" />
              ) : (
                <ChevronRightIcon className="w-4 h-4" />
              )}
              <h4 className="font-semibold text-gray-900">
                {formMode === 'create' ? '除外日を登録' : '除外日を編集'}
              </h4>
            </div>
          </button>

          {expandedSections.form && (
            <div className="mt-2 bg-gray-50 border border-gray-200 rounded-lg p-4">
              <ExclusionForm
                mode={formMode}
                date={date}
                teams={teams}
                contractorId={contractorId}
                contractorName={contractorName}
                initialData={editingExclusion}
                onSubmit={formMode === 'create' ? handleAddExclusion : handleUpdateExclusion}
                onCancel={handleCancelEdit}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
