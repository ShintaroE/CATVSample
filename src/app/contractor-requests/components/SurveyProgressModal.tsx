'use client'

import React, { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { SurveyRequest, RequestType, AttachedFile } from '@/features/applications/types'
import { Textarea } from '@/shared/components/ui'
import FileAttachments from '@/app/applications/components/FileAttachments'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { deleteFileFromRequest, downloadFile } from '@/features/applications/lib/applicationStorage'
import RequestNotes from '@/app/applications/components/RequestNotes'

interface SurveyProgressModalProps {
  request: SurveyRequest
  onClose: () => void
  onSave: (type: RequestType, id: string, status: string, comment: string, scheduledDate?: string) => void
}

export default function SurveyProgressModal({
  request,
  onClose,
  onSave,
}: SurveyProgressModalProps) {
  const [progressStatus, setProgressStatus] = useState('未完了')
  const [scheduledDate, setScheduledDate] = useState(request.scheduledDate || '')
  const [comment, setComment] = useState('')
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [formData, setFormData] = useState<SurveyRequest>(request)
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
    deleteFileFromRequest('survey', formData.id, fileId, 'contractor')
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

    // 協力会社のステータス選択を実際のステータスに変換
    const actualStatus = progressStatus === '完了' ? '完了' : '依頼済み'
    onSave('survey', request.id, actualStatus, comment, scheduledDate || undefined)
  }

  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-4xl w-full bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              進捗更新 - 現地調査依頼
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="px-6 py-4 space-y-6">
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
                ステータス<span className="text-red-500">*</span>
              </label>
              <select
                value={progressStatus}
                onChange={(e) => setProgressStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
              >
                <option value="未完了">未完了</option>
                <option value="完了">完了</option>
              </select>
            </div>

            {/* 調査予定日 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                調査予定日(任意)
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
              />
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
