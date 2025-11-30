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
  FileAttachments,
} from '@/features/applications/types'
import {
  getApplications,
  updateApplication,
  addProgressEntry,
} from '@/features/applications/lib/applicationStorage'
import { getTeamsByContractorId } from '@/features/contractor/lib/contractorStorage'
import { ClipboardDocumentListIcon, FunnelIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import { Button, Badge } from '@/shared/components/ui'
import SurveyProgressModal from './components/SurveyProgressModal'
import AttachmentProgressModal from './components/AttachmentProgressModal'
import ConstructionProgressModal from './components/ConstructionProgressModal'

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
  const [selectedTeamId, setSelectedTeamId] = useState<string>('all')
  const [surveyData, setSurveyData] = useState<SurveyRequest[]>([])
  const [attachmentData, setAttachmentData] = useState<AttachmentRequest[]>([])
  const [constructionData, setConstructionData] = useState<ConstructionRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<ApplicationRequest | null>(null)

  // 絞り込みフィルタ
  const [orderNumberFilter, setOrderNumberFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')

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

  // 初回読み込み時に「全て」を選択（既に選択されている場合は何もしない）
  // デフォルトで「全て」が選択されているため、このuseEffectは不要

  // データ読み込み
  useEffect(() => {
    if (!user?.contractorId) return

    const allSurvey = getApplications<SurveyRequest>('survey')
    const allAttachment = getApplications<AttachmentRequest>('attachment')
    const allConstruction = getApplications<ConstructionRequest>('construction')

    // 協力会社に割り当てられた依頼をフィルタ
    const contractorSurvey = allSurvey.filter(
      (r) => r.contractorId === user.contractorId
    )
    const contractorAttachment = allAttachment.filter(
      (r) => r.contractorId === user.contractorId
    )
    const contractorConstruction = allConstruction.filter(
      (r) => r.contractorId === user.contractorId
    )

    // 「全て」が選択されている場合は全ての班のデータを表示、それ以外は選択した班のみ
    if (selectedTeamId === 'all') {
      setSurveyData(contractorSurvey)
      setAttachmentData(contractorAttachment)
      setConstructionData(contractorConstruction)
    } else {
      setSurveyData(
        contractorSurvey.filter((r) => r.teamId === selectedTeamId)
      )
      setAttachmentData(
        contractorAttachment.filter((r) => r.teamId === selectedTeamId)
      )
      setConstructionData(
        contractorConstruction.filter((r) => r.teamId === selectedTeamId)
      )
    }
  }, [user, selectedTeamId])

  // 進捗更新を開く
  const handleOpenProgress = (request: ApplicationRequest) => {
    setSelectedRequest(request)
  }

  // フィルタクリア
  const handleClearFilters = () => {
    setOrderNumberFilter('')
    setStatusFilter('')
  }

  // 現在のタブデータ
  const currentData =
    activeTab === 'survey'
      ? surveyData
      : activeTab === 'attachment'
        ? attachmentData
        : constructionData

  // フィルタリング適用
  const filteredData = useMemo(() => {
    return currentData.filter((request: ApplicationRequest) => {
      // 受注番号
      if (orderNumberFilter && !(request.orderNumber || '').includes(orderNumberFilter)) {
        return false
      }

      // 状態
      if (statusFilter && request.status !== statusFilter) {
        return false
      }

      return true
    })
  }, [currentData, orderNumberFilter, statusFilter])

  // 進捗更新を保存
  const handleSaveProgress = (
    type: RequestType,
    id: string,
    status: string,
    comment: string,
    attachments?: FileAttachments,
    scheduledDate?: string,
    surveyCompletedAt?: string
  ) => {
    // 型に応じて適切な更新オブジェクトを作成
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: any = {
      status: status as SurveyStatus | AttachmentStatus | ConstructionStatus,
      completedAt: (status === '完了' || status === '調査済み')
        ? new Date().toISOString().split('T')[0]
        : undefined,
      // 調査予定日が指定されている場合のみ更新（現地調査用）
      ...(scheduledDate !== undefined && { scheduledDate }),
      // 調査完了日が指定されている場合のみ更新（共架・添架用）
      ...(surveyCompletedAt !== undefined && { surveyCompletedAt }),
      // アップロードされたファイルがある場合は更新
      ...(attachments !== undefined && { attachments }),
    }

    updateApplication(type, id, updates)

    // 進捗履歴追加
    const updatedByTeam = selectedTeamId === 'all'
      ? undefined
      : availableTeams.find((t) => t.id === selectedTeamId)?.teamName
    addProgressEntry(type, id, {
      timestamp: new Date().toISOString(),
      updatedBy: user?.contractorId || '',
      updatedByName: user?.contractor || '',
      updatedByTeam,
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

            {availableTeams.length === 0 ? (
              // 班がない場合
              <p className="text-sm text-gray-500 mt-1">
                班が割り当てられていません
              </p>
            ) : (
              // 班がある場合: セレクトボックス表示（「全て」オプション含む）
              <div className="flex items-center gap-2 mt-2">
                <label className="text-sm font-medium text-gray-700">
                  表示する班:
                </label>
                <select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="px-3 py-1.5 border rounded-md bg-white text-gray-900 text-sm"
                >
                  <option value="all">全て</option>
                  {availableTeams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.teamName}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
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
                  ${activeTab === tab
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

        {/* 絞り込みパネル */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center">
              <FunnelIcon className="w-4 h-4 mr-1.5" />
              絞り込み条件
            </h3>
            {/* 表示件数 */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <ChartBarIcon className="w-4 h-4 text-gray-500" />
                <Badge
                  variant={filteredData.length !== currentData.length ? 'info' : 'default'}
                  size="sm"
                  className="font-semibold"
                >
                  表示: {filteredData.length}件
                </Badge>
                <Badge variant="default" size="sm" className="font-normal">
                  全: {currentData.length}件
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 受注番号 */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                受注番号
              </label>
              <input
                type="text"
                value={orderNumberFilter}
                onChange={(e) => setOrderNumberFilter(e.target.value)}
                placeholder="2024031500001"
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 text-sm placeholder:text-gray-400"
              />
            </div>

            {/* 状態 */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                状態
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 text-sm"
              >
                <option value="">全て</option>
                {activeTab === 'survey' && (
                  <>
                    <option value="依頼済み">依頼済み</option>
                    <option value="調査日決定">調査日決定</option>
                    <option value="完了">完了</option>
                    <option value="キャンセル">キャンセル</option>
                  </>
                )}
                {activeTab === 'attachment' && (
                  <>
                    <option value="依頼済み">依頼済み</option>
                    <option value="調査済み">調査済み</option>
                    <option value="申請中">申請中</option>
                    <option value="申請許可">申請許可</option>
                    <option value="申請不許可">申請不許可</option>
                    <option value="キャンセル">キャンセル</option>
                  </>
                )}
                {activeTab === 'construction' && (
                  <>
                    <option value="未着手">未着手</option>
                    <option value="依頼済み">依頼済み</option>
                    <option value="工事日決定">工事日決定</option>
                    <option value="完了">完了</option>
                    <option value="工事返却">工事返却</option>
                    <option value="工事キャンセル">工事キャンセル</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* クリアボタン */}
          <div className="flex justify-end mt-4">
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              クリア
            </button>
          </div>
        </div>

        {/* テーブル */}
        <div className="mt-4 bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100 text-left text-xs text-gray-600">
                  <th className="px-3 py-2 font-medium">整理番号</th>
                  <th className="px-3 py-2 font-medium">受注番号</th>
                  {activeTab === 'survey' && (
                    <>
                      <th className="px-3 py-2 font-medium whitespace-nowrap">個別/集合</th>
                      <th className="px-3 py-2 font-medium whitespace-nowrap">顧客コード</th>
                      <th className="px-3 py-2 font-medium whitespace-nowrap">顧客名</th>
                      <th className="px-3 py-2 font-medium whitespace-nowrap">集合コード</th>
                      <th className="px-3 py-2 font-medium whitespace-nowrap">集合住宅名</th>
                      <th className="px-3 py-2 font-medium whitespace-nowrap">住所</th>
                      <th className="px-3 py-2 font-medium whitespace-nowrap">状態</th>
                      <th className="px-3 py-2 font-medium whitespace-nowrap">依頼日</th>
                      <th className="px-3 py-2 font-medium whitespace-nowrap">調査予定日</th>
                      <th className="px-3 py-2 font-medium whitespace-nowrap">調査完了日</th>
                      <th className="px-3 py-2 font-medium text-right whitespace-nowrap">操作</th>
                    </>
                  )}
                  {activeTab === 'attachment' && (
                    <>
                      <th className="px-3 py-2 font-medium whitespace-nowrap">個別/集合</th>
                      <th className="px-3 py-2 font-medium whitespace-nowrap">顧客コード</th>
                      <th className="px-3 py-2 font-medium whitespace-nowrap">顧客名</th>
                      <th className="px-3 py-2 font-medium whitespace-nowrap">集合住宅コード</th>
                      <th className="px-3 py-2 font-medium whitespace-nowrap">集合住宅名</th>
                      <th className="px-3 py-2 font-medium whitespace-nowrap">住所</th>
                      <th className="px-3 py-2 font-medium whitespace-nowrap">状態</th>
                      <th className="px-3 py-2 font-medium whitespace-nowrap">依頼日</th>
                      <th className="px-3 py-2 font-medium whitespace-nowrap">申請提出日</th>
                      <th className="px-3 py-2 font-medium whitespace-nowrap">申請許可日</th>
                      <th className="px-3 py-2 font-medium text-right whitespace-nowrap">操作</th>
                    </>
                  )}
                  {activeTab === 'construction' && (
                    <>
                      <th className="px-3 py-2 font-medium">個別/集合</th>
                      <th className="px-3 py-2 font-medium">顧客コード</th>
                      <th className="px-3 py-2 font-medium">顧客名</th>
                      <th className="px-3 py-2 font-medium">集合コード</th>
                      <th className="px-3 py-2 font-medium">集合住宅名</th>
                      <th className="px-3 py-2 font-medium">住所</th>
                      <th className="px-3 py-2 font-medium">状態</th>
                      <th className="px-3 py-2 font-medium">工事依頼日</th>
                      <th className="px-3 py-2 font-medium">工事予定日</th>
                      <th className="px-3 py-2 font-medium">工事完了日</th>
                      <th className="px-3 py-2 font-medium text-right">操作</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="text-gray-900 divide-y divide-gray-200">
                {filteredData.map((request) => (
                  <tr key={request.id} className="text-sm odd:bg-white even:bg-gray-50">
                    <td className="px-3 py-2">{request.serialNumber}</td>
                    <td className="px-3 py-2">{request.orderNumber || '-'}</td>
                    {activeTab === 'survey' && (
                      <>
                        <td className="px-3 py-2">
                          {(request as SurveyRequest).propertyType ? (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${(request as SurveyRequest).propertyType === '個別'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-purple-100 text-purple-800'
                              }`}>
                              {(request as SurveyRequest).propertyType}
                            </span>
                          ) : '-'}
                        </td>
                        <td className="px-3 py-2">
                          {(request as SurveyRequest).propertyType === '個別'
                            ? ((request as SurveyRequest).customerCode || '-')
                            : '-'}
                        </td>
                        <td className="px-3 py-2">
                          {(request as SurveyRequest).propertyType === '個別'
                            ? ((request as SurveyRequest).customerName || '-')
                            : (request as SurveyRequest).customerName || '-'}
                        </td>
                        <td className="px-3 py-2">
                          {(request as SurveyRequest).propertyType === '集合'
                            ? ((request as SurveyRequest).collectiveCode || '-')
                            : '-'}
                        </td>
                        <td className="px-3 py-2">
                          {(request as SurveyRequest).propertyType === '集合'
                            ? ((request as SurveyRequest).collectiveHousingName || '-')
                            : '-'}
                        </td>
                        <td className="px-3 py-2 max-w-[12rem] truncate" title={request.address}>
                          {request.address || '-'}
                        </td>
                        <td className="px-3 py-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {request.status}
                          </span>
                        </td>
                        <td className="px-3 py-2">{request.requestedAt || '-'}</td>
                        <td className="px-3 py-2">{request.scheduledDate || '-'}</td>
                        <td className="px-3 py-2">{request.completedAt || '-'}</td>
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
                      </>
                    )}
                    {activeTab === 'attachment' && (
                      <>
                        <td className="px-3 py-2">
                          {(request as AttachmentRequest).propertyType ? (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${(request as AttachmentRequest).propertyType === '個別'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-purple-100 text-purple-800'
                              }`}>
                              {(request as AttachmentRequest).propertyType}
                            </span>
                          ) : '-'}
                        </td>
                        <td className="px-3 py-2">
                          {(request as AttachmentRequest).propertyType === '個別'
                            ? ((request as AttachmentRequest).customerCode || '-')
                            : '-'}
                        </td>
                        <td className="px-3 py-2">{request.customerName || '-'}</td>
                        <td className="px-3 py-2">
                          {(request as AttachmentRequest).propertyType === '集合'
                            ? ((request as AttachmentRequest).collectiveCode || '-')
                            : '-'}
                        </td>
                        <td className="px-3 py-2">
                          {(request as AttachmentRequest).propertyType === '集合'
                            ? ((request as AttachmentRequest).collectiveHousingName || '-')
                            : '-'}
                        </td>
                        <td className="px-3 py-2 max-w-[12rem] truncate" title={request.address}>
                          {request.address || '-'}
                        </td>
                        <td className="px-3 py-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {request.status}
                          </span>
                        </td>
                        <td className="px-3 py-2">{request.requestedAt || '-'}</td>
                        <td className="px-3 py-2">{(request as AttachmentRequest).submittedAt || '-'}</td>
                        <td className="px-3 py-2">{(request as AttachmentRequest).approvedAt || '-'}</td>
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
                      </>
                    )}
                    {activeTab === 'construction' && (
                      <>
                        <td className="px-3 py-2">
                          {(request as ConstructionRequest).propertyType ? (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${(request as ConstructionRequest).propertyType === '個別'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-purple-100 text-purple-800'
                              }`}>
                              {(request as ConstructionRequest).propertyType}
                            </span>
                          ) : '-'}
                        </td>
                        <td className="px-3 py-2">
                          {(request as ConstructionRequest).propertyType === '個別'
                            ? ((request as ConstructionRequest).customerCode || '-')
                            : '-'}
                        </td>
                        <td className="px-3 py-2">
                          {(request as ConstructionRequest).customerName || '-'}
                        </td>
                        <td className="px-3 py-2">
                          {(request as ConstructionRequest).propertyType === '集合'
                            ? ((request as ConstructionRequest).collectiveCode || '-')
                            : '-'}
                        </td>
                        <td className="px-3 py-2">
                          {(request as ConstructionRequest).propertyType === '集合'
                            ? ((request as ConstructionRequest).collectiveHousingName || '-')
                            : '-'}
                        </td>
                        <td className="px-3 py-2 max-w-[12rem] truncate" title={request.address}>
                          {request.address || '-'}
                        </td>
                        <td className="px-3 py-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {request.status}
                          </span>
                        </td>
                        <td className="px-3 py-2">{(request as ConstructionRequest).constructionRequestedDate || '-'}</td>
                        <td className="px-3 py-2">{(request as ConstructionRequest).constructionDate || '-'}</td>
                        <td className="px-3 py-2">{(request as ConstructionRequest).constructionCompletedDate || '-'}</td>
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
                      </>
                    )}
                  </tr>
                ))}
                {currentData.length === 0 && (
                  <tr>
                    <td
                      colSpan={
                        activeTab === 'survey' ? 13 :
                          activeTab === 'attachment' ? 16 :
                            14
                      }
                      className="px-3 py-10 text-center text-sm text-gray-500"
                    >
                      依頼はありません
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 進捗更新モーダル */}
        {selectedRequest && selectedRequest.type === 'survey' && (
          <SurveyProgressModal
            request={selectedRequest as SurveyRequest}
            onClose={() => setSelectedRequest(null)}
            onSave={handleSaveProgress}
          />
        )}
        {selectedRequest && selectedRequest.type === 'attachment' && (
          <AttachmentProgressModal
            request={selectedRequest as AttachmentRequest}
            onClose={() => setSelectedRequest(null)}
            onSave={handleSaveProgress}
          />
        )}
        {selectedRequest && selectedRequest.type === 'construction' && (
          <ConstructionProgressModal
            request={selectedRequest as ConstructionRequest}
            onClose={() => setSelectedRequest(null)}
            onSave={handleSaveProgress}
          />
        )}
      </div>
    </Layout>
  )
}
