import { useState } from 'react'
import { ExclusionEntry } from '@/features/calendar/types'
import { Team } from '@/features/contractor/types'
import { Button } from '@/shared/components/ui/Button'

interface ExclusionItemEditorProps {
  exclusion: ExclusionEntry
  teams: Team[]
  onSave: (updates: Partial<ExclusionEntry>) => void
  onCancel: () => void
  onDelete: () => void
}

/**
 * 除外日アイテムのインライン編集コンポーネント
 */
export default function ExclusionItemEditor({
  exclusion,
  teams,
  onSave,
  onCancel,
  onDelete
}: ExclusionItemEditorProps) {
  const [teamId, setTeamId] = useState(exclusion.teamId)
  const [timeType, setTimeType] = useState<'all_day' | 'am' | 'pm' | 'custom'>(exclusion.timeType)
  const [startTime, setStartTime] = useState(exclusion.startTime || '09:00')
  const [endTime, setEndTime] = useState(exclusion.endTime || '18:00')
  const [reason, setReason] = useState(exclusion.reason)
  const [errors, setErrors] = useState<string[]>([])

  const activeTeams = teams.filter(t => t.isActive)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: string[] = []

    // バリデーション
    if (!teamId) {
      newErrors.push('班を選択してください')
    }

    if (timeType === 'custom') {
      if (!startTime || !endTime) {
        newErrors.push('開始時刻と終了時刻を入力してください')
      } else if (startTime >= endTime) {
        newErrors.push('終了時刻は開始時刻より後にしてください')
      }
    }

    if (newErrors.length > 0) {
      setErrors(newErrors)
      return
    }

    const selectedTeam = activeTeams.find(t => t.id === teamId)
    if (!selectedTeam) {
      setErrors(['選択された班が見つかりません'])
      return
    }

    const updates: Partial<ExclusionEntry> = {
      reason: reason.trim(),
      teamId,
      teamName: selectedTeam.teamName,
      timeType,
      ...(timeType === 'custom' && { startTime, endTime }),
      ...(timeType !== 'custom' && { startTime: undefined, endTime: undefined })
    }

    onSave(updates)
  }

  return (
    <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* エラー表示 */}
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <ul className="text-sm text-red-700 space-y-1">
              {errors.map((error, idx) => (
                <li key={idx}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 班選択 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            班 <span className="text-red-500">*</span>
          </label>
          <select
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">選択してください</option>
            {activeTeams.map(team => (
              <option key={team.id} value={team.id}>
                {team.teamName}
              </option>
            ))}
          </select>
        </div>

        {/* 時間帯選択 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            時間帯 <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="all_day"
                checked={timeType === 'all_day'}
                onChange={(e) => setTimeType(e.target.value as 'all_day' | 'am' | 'pm' | 'custom')}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm">終日 (9:00-18:00)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="am"
                checked={timeType === 'am'}
                onChange={(e) => setTimeType(e.target.value as 'all_day' | 'am' | 'pm' | 'custom')}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm">午前 (9:00-12:00)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="pm"
                checked={timeType === 'pm'}
                onChange={(e) => setTimeType(e.target.value as 'all_day' | 'am' | 'pm' | 'custom')}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm">午後 (12:00-18:00)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="custom"
                checked={timeType === 'custom'}
                onChange={(e) => setTimeType(e.target.value as 'all_day' | 'am' | 'pm' | 'custom')}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm">カスタム</span>
            </label>
          </div>

          {/* カスタム時間入力 */}
          {timeType === 'custom' && (
            <div className="mt-3 flex items-center gap-2">
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="text-sm text-gray-600">〜</span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}
        </div>

        {/* 理由入力 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            理由
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="除外日の理由を入力してください"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* ボタン */}
        <div className="flex gap-2">
          <Button type="submit" variant="primary" size="sm">
            保存
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
            キャンセル
          </Button>
          <Button type="button" variant="danger" size="sm" onClick={onDelete}>
            削除
          </Button>
        </div>
      </form>
    </div>
  )
}

