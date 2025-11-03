'use client'

import React, { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { AttachmentRequest, RequestType, AttachedFile } from '@/features/applications/types'
import { Textarea } from '@/shared/components/ui'
import FileAttachments from '@/app/applications/components/FileAttachments'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { uploadFileToRequest, deleteFileFromRequest, downloadFile } from '@/features/applications/lib/applicationStorage'
import RequestNotes from '@/app/applications/components/RequestNotes'

interface AttachmentProgressModalProps {
  request: AttachmentRequest
  onClose: () => void
  onSave: (type: RequestType, id: string, status: string, comment: string) => void
}

export default function AttachmentProgressModal({
  request,
  onClose,
  onSave,
}: AttachmentProgressModalProps) {
  const [status, setStatus] = useState(request.status)
  const [comment, setComment] = useState('')
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [formData, setFormData] = useState<AttachmentRequest>(request)
  const { user } = useAuth()

  const handleFileUpload = async (files: File[]) => {
    if (!user) return

    setUploadingFiles(true)
    try {
      // Create AttachedFile objects
      const newFiles: AttachedFile[] = await Promise.all(
        files.map(async (file) => {
          return new Promise<AttachedFile>((resolve) => {
            const reader = new FileReader()
            reader.onload = () => {
              resolve({
                id: `file-${Date.now()}-${Math.random()}`,
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                fileData: reader.result as string,
                uploadedBy: user.contractorId,
                uploadedByName: user.name,
                uploadedByRole: 'contractor',
                uploadedAt: new Date().toISOString(),
              })
            }
            reader.readAsDataURL(file)
          })
        })
      )

      // Update formData with new files
      const currentAttachments = formData.attachments || { fromAdmin: [], fromContractor: [] }
      setFormData({
        ...formData,
        attachments: {
          fromAdmin: currentAttachments.fromAdmin,
          fromContractor: [...currentAttachments.fromContractor, ...newFiles],
        },
      })
    } catch (error) {
      console.error('File upload failed:', error)
      alert('ファイルのアップロードに失敗しました')
    } finally {
      setUploadingFiles(false)
    }
  }

  const handleFileDelete = (fileId: string) => {
    deleteFileFromRequest('attachment', formData.id, fileId, 'contractor')
    const currentAttachments = formData.attachments || { fromAdmin: [], fromContractor: [] }
    setFormData({
      ...formData,
      attachments: {
        ...currentAttachments,
        fromContractor: currentAttachments.fromContractor.filter(f => f.id !== fileId),
      },
    })
  }

  const handleFileDownload = (file: AttachedFile) => {
    downloadFile(file)
  }

  const handleSave = () => {
    if (!comment.trim()) {
      alert('進捗コメントを入力してください')
      return
    }

    onSave('attachment', request.id, status, comment)
  }

  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-4xl w-full bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              進捗更新 - 共架・添架依頼
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="px-6 py-4 space-y-6">
            {/* 依頼情報（読み取り専用） */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <h3 className="font-medium text-gray-900 mb-3">依頼情報</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">申請番号:</span>
                  <span className="ml-2 text-gray-900">{request.serialNumber}</span>
                </div>
                <div>
                  <span className="text-gray-600">受注番号:</span>
                  <span className="ml-2 text-gray-900">{request.orderNumber}</span>
                </div>
                <div>
                  <span className="text-gray-600">顧客名:</span>
                  <span className="ml-2 text-gray-900">{request.customerName}</span>
                </div>
                <div>
                  <span className="text-gray-600">住所:</span>
                  <span className="ml-2 text-gray-900">{request.address}</span>
                </div>
              </div>
            </div>

            {/* KCT管理者からの指示事項 */}
            <RequestNotes
              userRole="contractor"
              notes={request.requestNotes}
              isEditing={false}
            />

            {/* ファイル添付 */}
            <FileAttachments
              userRole="contractor"
              attachments={formData.attachments}
              onFileUpload={handleFileUpload}
              onFileDelete={handleFileDelete}
              onFileDownload={handleFileDownload}
              uploadingFiles={uploadingFiles}
            />

            {/* ステータス更新 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                ステータス
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AttachmentRequest['status'])}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
              >
                <option value="受付">受付</option>
                <option value="提出済">提出済</option>
                <option value="許可">許可</option>
                <option value="取下げ">取下げ</option>
              </select>
            </div>

            {/* 進捗コメント */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                進捗コメント <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="進捗状況の詳細を入力してください"
                rows={4}
                className="bg-white text-gray-900"
                fullWidth
              />
              <p className="text-xs text-gray-500">
                ※ 進捗コメントは必須です
              </p>
            </div>
          </div>

          <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              保存
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
