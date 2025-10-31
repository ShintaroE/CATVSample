'use client'

import React from 'react'
import { AttachedFile } from '@/features/applications/types'
import FileItem from './FileItem'

interface FileListProps {
  files: AttachedFile[]
  canDelete: boolean
  onDelete?: (fileId: string) => void
  onDownload?: (file: AttachedFile) => void
}

export default function FileList({
  files,
  canDelete,
  onDelete,
  onDownload
}: FileListProps) {
  if (files.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        ファイルがありません
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {files.map((file) => (
        <FileItem
          key={file.id}
          file={file}
          canDelete={canDelete}
          onDelete={onDelete}
          onDownload={onDownload}
        />
      ))}
    </div>
  )
}
