'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/shared/components/layout/Layout'
import { useAuth } from '@/features/auth/hooks/useAuth'
import {
  RequestType,
  SurveyRequest,
  AttachmentRequest,
  ConstructionRequest,
  ApplicationRequest,
  SurveyStatus,
  AttachmentStatus,
  ConstructionStatus,
  SurveyFeasibility,
  AttachmentNeeded,
} from '@/features/applications/types'
import {
  getApplications,
  updateApplication,
  addProgressEntry,
  updateSurveyFeasibility,
  updateAttachmentApplication,
} from '@/features/applications/lib/applicationStorage'
import { getTeamsByContractorId } from '@/features/contractor/lib/contractorStorage'
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline'
import { Button, Textarea } from '@/shared/components/ui'
import FileAttachmentsComponent from '@/app/applications/components/FileAttachments'
import RequestNotesComponent from '@/app/applications/components/RequestNotes'
import { AttachedFile } from '@/features/applications/types'
import { downloadFile } from '@/features/applications/lib/applicationStorage'

type TabType = 'survey' | 'attachment' | 'construction'

const TAB_LABELS: Record<TabType, string> = {
  survey: '現地調査',
  attachment: '共架・添架',
  construction: '工事',
}

export default function ContractorRequestsPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('survey')
  const [selectedTeamId, setSelectedTeamId] = useState<string>('')
  const [surveyData, setSurveyData] = useState<SurveyRequest[]>([])
  const [attachmentData, setAttachmentData] = useState<AttachmentRequest[]>([])
  const [constructionData, setConstructionData] = useState<ConstructionRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<ApplicationRequest | null>(null)

  // 協力会社ユーザーでない場合はリダイレクト
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'contractor') {
      router.push('/')
    }
  }, [isAuthenticated, user, router])

  // 利用可能な班を取得
  const availableTeams = useMemo(() => {
    if (!user?.contractorId) return []
    return getTeamsByContractorId(user.contractorId)
  }, [user])

  // 初回読み込み時に最初の班を選択
  useEffect(() => {
    if (availableTeams.length > 0 && !selectedTeamId) {
      setSelectedTeamId(availableTeams[0].id)
    }
  }, [availableTeams, selectedTeamId])

  // データ読み込み
  useEffect(() => {
    if (!user?.contractorId || !selectedTeamId) return

    const allSurvey = getApplications<SurveyRequest>('survey')
    const allAttachment = getApplications<AttachmentRequest>('attachment')
    const allConstruction = getApplications<ConstructionRequest>('construction')

    // 選択した班に割り当てられた依頼のみフィルタ
    setSurveyData(
      allSurvey.filter(
        (r) => r.contractorId === user.contractorId && r.teamId === selectedTeamId
      )
    )
    setAttachmentData(
      allAttachment.filter(
        (r) => r.contractorId === user.contractorId && r.teamId === selectedTeamId
      )
    )
    setConstructionData(
      allConstruction.filter(
        (r) => r.contractorId === user.contractorId && r.teamId === selectedTeamId
      )
    )
  }, [user, selectedTeamId])

  // 進捗更新を開く
  const handleOpenProgress = (request: ApplicationRequest) => {
    setSelectedRequest(request)
  }

  // 進捗更新を保存
  const handleSaveProgress = (
    type: RequestType,
    id: string,
    status: string,
    comment: string
  ) => {
    // ステータス更新
    updateApplication(type, id, {
      status: status as SurveyStatus | AttachmentStatus | ConstructionStatus
    })

    // 進捗履歴追加
    addProgressEntry(type, id, {
      timestamp: new Date().toISOString(),
      updatedBy: user?.contractorId || '',
      updatedByName: user?.contractor || '',
      updatedByTeam: availableTeams.find((t) => t.id === selectedTeamId)?.teamName,
      status,
      comment,
    })

    // データ再読み込み
    setSelectedRequest(null)
    window.location.reload()
  }

  if (!user || user.role !== 'contractor') {
    return null
  }

  const currentData =
    activeTab === 'survey'
      ? surveyData
      : activeTab === 'attachment'
      ? attachmentData
      : constructionData

  return (
    <Layout>
      <div className="px-6 py-6">
        {/* ヘッダー */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
              <ClipboardDocumentListIcon className="w-7 h-7 mr-2 text-blue-600" />
              依頼一覧
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {user.contractor} に割り当てられた依頼を確認・更新できます
            </p>
          </div>
          {availableTeams.length > 1 && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">班:</label>
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="px-3 py-2 border rounded-md bg-white text-gray-900"
              >
                {availableTeams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.teamName}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* タブ */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {(Object.keys(TAB_LABELS) as TabType[]).map((tab) => (
              <Button
                key={tab}
                onClick={() => setActiveTab(tab)}
                variant="ghost"
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm rounded-none
                  ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {TAB_LABELS[tab]}
              </Button>
            ))}
          </nav>
        </div>

        {/* テーブル */}
        <div className="mt-4 bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100 text-left text-xs text-gray-600">
                  <th className="px-3 py-2 font-medium">整理番号</th>
                  <th className="px-3 py-2 font-medium">受注番号</th>
                  <th className="px-3 py-2 font-medium">顧客名</th>
                  <th className="px-3 py-2 font-medium">住所</th>
                  <th className="px-3 py-2 font-medium">予定日</th>
                  <th className="px-3 py-2 font-medium">状態</th>
                  <th className="px-3 py-2 font-medium">最終更新</th>
                  <th className="px-3 py-2 font-medium text-right">操作</th>
                </tr>
              </thead>
              <tbody className="text-gray-900">
                {currentData.map((request) => (
                  <tr key={request.id} className="border-t text-sm odd:bg-white even:bg-gray-50">
                    <td className="px-3 py-2">{request.serialNumber}</td>
                    <td className="px-3 py-2">{request.orderNumber || '-'}</td>
                    <td className="px-3 py-2">{request.customerName || '-'}</td>
                    <td className="px-3 py-2 max-w-[12rem] truncate" title={request.address}>
                      {request.address || '-'}
                    </td>
                    <td className="px-3 py-2">{request.scheduledDate || '-'}</td>
                    <td className="px-3 py-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {request.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-500">
                      {request.lastUpdatedByName || '-'}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Button
                        onClick={() => handleOpenProgress(request)}
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:bg-blue-50 border"
                      >
                        進捗更新
                      </Button>
                    </td>
                  </tr>
                ))}
                {currentData.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-3 py-10 text-center text-sm text-gray-500">
                      依頼はありません
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 進捗更新モーダル（簡易版） */}
        {selectedRequest && (
          <ProgressUpdateModal
            request={selectedRequest}
            onClose={() => setSelectedRequest(null)}
            onSave={handleSaveProgress}
          />
        )}
      </div>
    </Layout>
  )
}

// 簡易版の進捗更新モーダル
function ProgressUpdateModal({
  request,
  onClose,
  onSave,
}: {
  request: ApplicationRequest
  onClose: () => void
  onSave: (type: RequestType, id: string, status: string, comment: string) => void
}) {
  const { user } = useAuth()
  const [status, setStatus] = useState<string>(request.status)
  const [comment, setComment] = useState('')
  const [formData, setFormData] = useState<ApplicationRequest>(request)
  const [uploadingFiles, setUploadingFiles] = useState(false)

  // 新規報告用のstate
  const [surveyFeasibility, setSurveyFeasibility] = useState<SurveyFeasibility>(
    (request as SurveyRequest).feasibilityResult?.feasibility || '未判定'
  )
  const [attachmentNeeded, setAttachmentNeeded] = useState<AttachmentNeeded>(
    (request as AttachmentRequest).applicationReport?.applicationNeeded || '未確認'
  )

  const handleFileUpload = async (files: File[]) => {
    if (!user) return
    setUploadingFiles(true)
    try {
      const newFiles = await Promise.all(
        files.map(async (file) => {
          const reader = new FileReader()
          return new Promise<{ name: string; size: number; type: string; data: string }>((resolve) => {
            reader.onload = () => resolve({ name: file.name, size: file.size, type: file.type, data: reader.result as string })
            reader.readAsDataURL(file)
          })
        })
      )
      const existingAttachments = formData.attachments || { fromAdmin: [], fromContractor: [] }
      setFormData((prev) => ({
        ...prev,
        attachments: {
          ...existingAttachments,
          fromContractor: [
            ...existingAttachments.fromContractor,
            ...newFiles.map((f, i) => ({
              id: `temp-${Date.now()}-${i}`,
              fileName: f.name,
              fileSize: f.size,
              fileType: f.type,
              fileData: f.data,
              uploadedBy: user.id,
              uploadedByName: user.name,
              uploadedByRole: 'contractor' as const,
              uploadedAt: new Date().toISOString(),
            })),
          ],
        },
      }))
    } catch (error) {
      console.error('File upload failed:', error)
    } finally {
      setUploadingFiles(false)
    }
  }

  const handleFileDelete = (fileId: string) => {
    const existingAttachments = formData.attachments || { fromAdmin: [], fromContractor: [] }
    setFormData((prev) => ({
      ...prev,
      attachments: {
        ...existingAttachments,
        fromContractor: existingAttachments.fromContractor.filter((f) => f.id !== fileId),
      },
    }))
  }

  const handleFileDownload = (file: AttachedFile) => { downloadFile(file) }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.contractorId || !user?.contractor || !formData.teamName) return

    // タイプ別の報告を保存
    if (request.type === 'survey') {
      updateSurveyFeasibility(
        request.id,
        surveyFeasibility,
        user.contractorId,
        user.contractor,
        formData.teamName
      )
    } else if (request.type === 'attachment') {
      updateAttachmentApplication(
        request.id,
        attachmentNeeded,
        user.contractorId,
        user.contractor,
        formData.teamName
      )
    }

    // ファイル添付も含めて更新
    updateApplication(request.type, request.id, {
      attachments: formData.attachments,
    })

    // 進捗履歴を追加（従来通り）
    onSave(request.type, request.id, status, comment)
  }

  const getStatusOptions = () => {
    if (request.type === 'survey') {
      return ['未着手', '調査中', '完了', 'キャンセル']
    } else if (request.type === 'attachment') {
      return ['受付', '調査済み', '完了']
    } else {
      return ['未着手', '施工中', '完了', '一部完了', '中止', '延期', '保留']
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white w-[min(600px,92vw)] max-h-[90vh] overflow-auto rounded-lg shadow-xl">
        <div className="px-5 py-4 border-b">
          <h2 className="text-lg font-semibold">進捗更新</h2>
          <p className="text-sm text-gray-500 mt-1">
            整理番号: {request.serialNumber} / {request.customerName}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-5 py-4 space-y-4">
            {/* 管理者からの指示事項 */}
            <RequestNotesComponent
              userRole="contractor"
              notes={request.requestNotes}
              isEditing={false}
            />

            {/* タイプ別の報告フォーム */}
            {request.type === 'survey' && (
              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">工事可否判定</label>
                <div className="space-y-2">
                  {(['可能', '条件付き可能', '要確認', '不可'] as SurveyFeasibility[]).map((option) => (
                    <label key={option} className="flex items-center">
                      <input
                        type="radio"
                        value={option}
                        checked={surveyFeasibility === option}
                        onChange={(e) => setSurveyFeasibility(e.target.value as SurveyFeasibility)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">詳細はファイルにて提出してください</p>
              </div>
            )}

            {request.type === 'attachment' && (
              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">申請有無</label>
                <div className="space-y-2">
                  {(['必要', '不要'] as AttachmentNeeded[]).map((option) => (
                    <label key={option} className="flex items-center">
                      <input
                        type="radio"
                        value={option}
                        checked={attachmentNeeded === option}
                        onChange={(e) => setAttachmentNeeded(e.target.value as AttachmentNeeded)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">詳細はファイルにて提出してください</p>
              </div>
            )}

            {request.type === 'construction' && (
              <div className="border-t pt-4">
                <p className="text-sm text-gray-700 mb-2">
                  工事予定日: <span className="font-medium">{(request as ConstructionRequest).constructionDate || '未設定'}</span>
                </p>
                <p className="text-xs text-gray-500">作業詳細はファイルにて提出してください</p>
              </div>
            )}

            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
                required
              >
                {getStatusOptions().map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <Textarea
              label="進捗コメント"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="作業内容や気づいた点を入力してください"
              required
              className="min-h-[100px]"
            />

            {/* ファイル添付 */}
            <div className="border-t pt-4">
              <FileAttachmentsComponent
                userRole="contractor"
                attachments={formData.attachments || { fromAdmin: [], fromContractor: [] }}
                isEditing={true}
                onFileUpload={handleFileUpload}
                onFileDelete={handleFileDelete}
                onFileDownload={handleFileDownload}
                uploadingFiles={uploadingFiles}
              />
            </div>
          </div>

          <div className="px-5 py-4 border-t flex items-center justify-end gap-2">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              variant="primary"
            >
              更新
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
