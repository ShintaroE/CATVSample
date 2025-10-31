'use client'

import React from 'react'
import { FileAttachments as FileAttachmentsType, AttachedFile, RequestType } from '@/features/applications/types'
import FileList from './FileList'
import FileUploadZone from './FileUploadZone'

interface FileAttachmentsProps {
  requestId?: string
  requestType?: RequestType
  userRole: 'admin' | 'contractor'
  attachments: FileAttachmentsType | undefined
  isEditing?: boolean
  uploadingFiles?: boolean
  onFileUpload: (files: File[]) => Promise<void>
  onFileDelete: (fileId: string, source?: 'admin' | 'contractor') => void
  onFileDownload: (file: AttachedFile) => void
}

export default function FileAttachments({
  userRole,
  attachments,
  isEditing = true,
  uploadingFiles = false,
  onFileUpload,
  onFileDelete,
  onFileDownload
}: FileAttachmentsProps) {
  const fromAdmin = attachments?.fromAdmin || []
  const fromContractor = attachments?.fromContractor || []

  // 受信ファイル: 管理者は協力会社から、協力会社は管理者から
  const receivedFiles = userRole === 'admin' ? fromContractor : fromAdmin
  // 送信ファイル: 管理者は自分がアップロード、協力会社も自分がアップロード
  const sentFiles = userRole === 'admin' ? fromAdmin : fromContractor

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">添付ファイル</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 左側: 受信ファイル */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <span className="mr-2">📩</span>
            {userRole === 'admin' ? '協力会社からの提出ファイル' : '受け取ったファイル'}
          </h4>
          <FileList
            files={receivedFiles}
            canDelete={false}
            onDownload={onFileDownload}
          />
        </div>

        {/* 右側: 送信ファイル */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <span className="mr-2">📤</span>
            {userRole === 'admin' ? '協力会社に送付するファイル' : '提出したファイル'}
          </h4>
          <FileList
            files={sentFiles}
            canDelete={isEditing}
            onDelete={onFileDelete}
            onDownload={onFileDownload}
          />
          {isEditing && <FileUploadZone onUpload={onFileUpload} loading={uploadingFiles} />}
        </div>
      </div>

      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
        <p className="flex items-center">
          <span className="mr-2">💡</span>
          ヒント: ファイルは双方向でやり取りできます。必要な資料や写真をアップロードしてください。
        </p>
      </div>
    </div>
  )
}
