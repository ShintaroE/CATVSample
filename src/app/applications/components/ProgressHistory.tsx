import React from 'react'
import { ProgressEntry } from '@/types/application'
import { ClockIcon } from '@heroicons/react/24/outline'

interface ProgressHistoryProps {
  history: ProgressEntry[]
}

export default function ProgressHistory({ history }: ProgressHistoryProps) {
  if (!history || history.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-gray-500">
        進捗履歴がありません
      </div>
    )
  }

  // 新しい順にソート
  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString)
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const hour = date.getHours().toString().padStart(2, '0')
    const minute = date.getMinutes().toString().padStart(2, '0')
    return `${year}/${month}/${day} ${hour}:${minute}`
  }

  return (
    <div className="space-y-4">
      {sortedHistory.map((entry) => (
        <div
          key={entry.id}
          className="border-l-4 border-blue-400 pl-4 py-2 bg-gray-50 rounded-r"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <ClockIcon className="w-4 h-4" />
                <span>{formatDateTime(entry.timestamp)}</span>
                <span className="text-gray-400">|</span>
                <span className="font-medium text-gray-900">
                  {entry.updatedByName}
                  {entry.updatedByTeam && ` - ${entry.updatedByTeam}`}
                </span>
              </div>
              <div className="mb-2">
                <span className="text-xs text-gray-500">ステータス: </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  {entry.status}
                </span>
              </div>
              {entry.comment && (
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {entry.comment}
                </p>
              )}
              {entry.photos && entry.photos.length > 0 && (
                <div className="mt-2 flex gap-2">
                  {entry.photos.map((photo, idx) => (
                    <div
                      key={idx}
                      className="w-16 h-16 border rounded overflow-hidden bg-gray-100"
                    >
                      <img
                        src={photo}
                        alt={`photo-${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
