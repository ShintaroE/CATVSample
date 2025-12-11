'use client'

import React, { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { AttachmentRequest, RequestType, AttachedFile, FileAttachments as FileAttachmentsType } from '@/features/applications/types'
import { Textarea } from '@/shared/components/ui'
import FileAttachments from '@/app/applications/components/common/FileAttachments'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { deleteFileFromRequest, downloadFile } from '@/features/applications/lib/applicationStorage'
import RequestNotes from '@/app/applications/components/common/RequestNotes'

interface AttachmentProgressModalProps {
  request: AttachmentRequest
  onClose: () => void
  onSave: (type: RequestType, id: string, status: string, comment: string, attachments?: FileAttachmentsType, scheduledDate?: string, surveyCompletedAt?: string, surveyStatusByContractor?: 'not_surveyed' | 'surveyed') => void
}

export default function AttachmentProgressModal({
  request,
  onClose,
  onSave,
}: AttachmentProgressModalProps) {
  const [surveyStatus, setSurveyStatus] = useState<'not_surveyed' | 'surveyed'>(
    request.surveyStatusByContractor || 'not_surveyed'
  )
  const [progressStatus, setProgressStatus] = useState('未完了')
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
    // 協力会社のステータス選択を実際のステータスに変換
    let actualStatus: string

    if (surveyStatus === 'surveyed') {
      // 調査状況が「調査済み」の場合
      if (progressStatus === '完了') {
        actualStatus = '依頼完了'
      } else {
        actualStatus = '調査済み'
      }
    } else {
      // 調査状況が「未調査」の場合 → 依頼済み
      actualStatus = '依頼済み'
    }

    // 完了時は調査完了日を自動設定
    const surveyCompletedAt = progressStatus === '完了'
      ? new Date().toISOString().split('T')[0]
      : undefined

    // アップロードされたファイルと調査状況を含めて保存
    onSave('attachment', request.id, actualStatus, comment, formData.attachments, undefined, surveyCompletedAt, surveyStatus)
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

            {/* 調査状況 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                調査状況<span className="text-red-500">*</span>
              </label>
              <select
                value={surveyStatus}
                onChange={(e) => setSurveyStatus(e.target.value as 'not_surveyed' | 'surveyed')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
              >
                <option value="not_surveyed">未調査</option>
                <option value="surveyed">調査済み</option>
              </select>
            </div>

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
                <option value="完了" disabled={surveyStatus === 'not_surveyed'}>完了</option>
              </select>
              {surveyStatus === 'not_surveyed' && (
                <p className="text-xs text-gray-500 mt-1">
                  ※ 調査状況を「調査済み」にしてからステータスを「完了」にできます
                </p>
              )}
            </div>

            {/* 進捗コメント */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                進捗コメント
              </label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="進捗状況の詳細を入力してください"
                rows={4}
                className="bg-white text-gray-900"
                fullWidth
              />
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
