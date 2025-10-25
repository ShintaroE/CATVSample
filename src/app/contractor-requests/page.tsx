'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import { useAuth } from '@/contexts/AuthContext'
import {
  RequestType,
  SurveyRequest,
  AttachmentRequest,
  ConstructionRequest,
  ApplicationRequest,
  SurveyStatus,
  AttachmentStatus,
  ConstructionStatus,
} from '@/types/application'
import {
  getApplications,
  updateApplication,
  addProgressEntry,
} from '@/lib/applications'
import { getTeamsByContractorId } from '@/lib/contractors'
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline'

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
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {TAB_LABELS[tab]}
              </button>
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
                      <button
                        onClick={() => handleOpenProgress(request)}
                        className="inline-flex items-center px-2 py-1 rounded border text-blue-600 hover:bg-blue-50 text-xs"
                      >
                        進捗更新
                      </button>
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
  const [status, setStatus] = useState<string>(request.status)
  const [comment, setComment] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(request.type, request.id, status, comment)
  }

  const getStatusOptions = () => {
    if (request.type === 'survey') {
      return ['未着手', '調査中', '完了', 'キャンセル']
    } else if (request.type === 'attachment') {
      return ['受付', '提出済', '許可', '取下げ']
    } else {
      return ['未着手', '施工中', '完了', '保留']
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
            <div>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                進捗コメント
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-white text-gray-900 min-h-[100px]"
                placeholder="作業内容や気づいた点を入力してください"
                required
              />
            </div>
          </div>

          <div className="px-5 py-4 border-t flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-md border bg-white text-gray-700 hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              更新
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
