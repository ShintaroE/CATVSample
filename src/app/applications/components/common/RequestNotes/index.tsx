'use client'

import React from 'react'
import { RequestNotes as RequestNotesType } from '@/features/applications/types'
import { Textarea } from '@/shared/components/ui'

interface RequestNotesProps {
  userRole: 'admin' | 'contractor'
  notes: RequestNotesType | undefined
  isEditing: boolean
  onChange?: (notes: string) => void
}

export default function RequestNotes({
  userRole,
  notes,
  isEditing,
  onChange
}: RequestNotesProps) {
  if (userRole === 'admin') {
    // 管理者: 編集可能
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          <span className="mr-2">📋</span>
          依頼時の備考
        </label>
        <Textarea
          value={notes?.adminNotes || ''}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder="協力会社への指示事項を入力してください（例: クロージャ番号CL-123付近を重点的に確認してください）"
          rows={4}
          disabled={!isEditing}
          className="bg-white text-gray-900"
          fullWidth
        />
        <p className="text-xs text-gray-500">
          この備考は協力会社側で確認できます
        </p>
      </div>
    )
  } else {
    // 協力会社: 読み取り専用
    if (!notes?.adminNotes) {
      return null
    }

    return (
      <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
          <span className="mr-2">📋</span>
          KCT管理者からの指示事項
        </h4>
        <div className="text-sm text-gray-700 whitespace-pre-wrap">
          {notes.adminNotes}
        </div>
      </div>
    )
  }
}
