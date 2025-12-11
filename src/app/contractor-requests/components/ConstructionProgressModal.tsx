'use client'

import React, { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { ConstructionRequest, RequestType, AttachedFile, ConstructionStatus, FileAttachments as FileAttachmentsType } from '@/features/applications/types'
import { Textarea } from '@/shared/components/ui'
import FileAttachments from '@/app/applications/components/common/FileAttachments'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { deleteFileFromRequest, downloadFile } from '@/features/applications/lib/applicationStorage'
import RequestNotes from '@/app/applications/components/common/RequestNotes'

interface ConstructionProgressModalProps {
  request: ConstructionRequest
  onClose: () => void
  onSave: (type: RequestType, id: string, status: string, comment: string, attachments?: FileAttachmentsType) => void
}

export default function ConstructionProgressModal({
  request,
  onClose,
  onSave,
}: ConstructionProgressModalProps) {
  // 協力会社用のステータス: 完了なら「完了」、それ以外は「未完了」
  const [displayStatus, setDisplayStatus] = useState(request.status === '完了' ? '完了' : '未完了')
  const [comment, setComment] = useState('')
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [formData, setFormData] = useState<ConstructionRequest>(request)
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
    deleteFileFromRequest('construction', formData.id, fileId, 'contractor')
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
    let newStatus: ConstructionStatus

    if (displayStatus === '完了') {
      // 「完了」を選択した場合
      newStatus = '完了'
    } else {
      // 「未完了」を選択した場合の処理
      // 終了状態（工事返却、工事キャンセル）は協力会社の進捗更新で変更できない
      // これらの状態の場合は「依頼済み」にマッピングする
      const terminalStates: ConstructionStatus[] = ['工事返却', '工事キャンセル']

      if (terminalStates.includes(request.status)) {
        // 終了状態からは「依頼済み」に戻す
        newStatus = '依頼済み'
      } else if (request.status === '未着手') {
        // 「未着手」の場合は「依頼済み」に進める
        newStatus = '依頼済み'
      } else {
        // それ以外（「依頼済み」「工事日決定」）の場合は現在のステータスを保持
        newStatus = request.status
      }
    }

    // アップロードされたファイルを含めて保存
    onSave('construction', request.id, newStatus, comment, formData.attachments)
  }

  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-4xl w-full bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              進捗更新 - 工事依頼
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
                value={displayStatus}
                onChange={(e) => setDisplayStatus(e.target.value as '未完了' | '完了')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
              >
                <option value="未完了">未完了</option>
                <option value="完了">完了</option>
              </select>
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
