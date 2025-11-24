'use client'

import React from 'react'
import { AttachedFile } from '@/features/applications/types'
import { Button } from '@/shared/components/ui'
import {
  DocumentIcon,
  PhotoIcon,
  DocumentTextIcon,
  TableCellsIcon,
  TrashIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'

interface FileItemProps {
  file: AttachedFile
  canDelete: boolean
  onDelete?: (fileId: string) => void
  onDownload?: (file: AttachedFile) => void
}

// ファイルタイプに応じたアイコンを取得
const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) {
    return <PhotoIcon className="h-5 w-5 text-blue-500" />
  }
  if (fileType === 'application/pdf') {
    return <DocumentIcon className="h-5 w-5 text-red-500" />
  }
  if (fileType.includes('spreadsheet') || fileType.includes('excel')) {
    return <TableCellsIcon className="h-5 w-5 text-green-500" />
  }
  return <DocumentTextIcon className="h-5 w-5 text-gray-500" />
}

// ファイルサイズをフォーマット
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function FileItem({
  file,
  canDelete,
  onDelete,
  onDownload
}: FileItemProps) {
  const uploadDate = new Date(file.uploadedAt).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <div className="flex-shrink-0">
          {getFileIcon(file.fileType)}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {file.fileName}
          </p>
          <p className="text-xs text-gray-500">
            {file.uploadedByName} · {uploadDate} · {formatFileSize(file.fileSize)}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2 ml-4">
        {onDownload && (
          <Button
            onClick={() => onDownload(file)}
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
            DL
          </Button>
        )}

        {canDelete && onDelete && (
          <Button
            onClick={() => onDelete(file.id)}
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700"
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
