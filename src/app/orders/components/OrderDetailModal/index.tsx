'use client'

import React, { useRef } from 'react'
import { DocumentArrowUpIcon, MapIcon } from '@heroicons/react/24/outline'
import { OrderData, AdditionalCosts, AdditionalNotes, CollectiveConstructionInfo, OrderSurveyStatus, OrderPermissionStatus } from '../../types'
import { ConstructionStatus } from '@/features/applications/types'
import { Button, Badge, BadgeVariant } from '@/shared/components/ui'
import AdditionalCostsSection from './AdditionalCostsSection'
import AdditionalNotesSection from './AdditionalNotesSection'
import CollectiveConstructionSection from './CollectiveConstructionSection'

interface OrderDetailModalProps {
  order: OrderData
  onClose: () => void
  onStatusChange: (
    orderNumber: string,
    statusType: 'surveyStatus' | 'permissionStatus' | 'constructionStatus',
    newStatus: ConstructionStatus
  ) => void
  onMapUpload: (order: OrderData, file: File) => void
  onViewMap: (order: OrderData) => void
  onAdditionalCostsChange: (orderNumber: string, additionalCosts: AdditionalCosts) => void
  onAdditionalNotesChange: (orderNumber: string, additionalNotes: AdditionalNotes) => void
  onCollectiveConstructionInfoChange: (orderNumber: string, collectiveConstructionInfo: CollectiveConstructionInfo) => void
}

export default function OrderDetailModal({
  order,
  onClose,
  onStatusChange,
  onMapUpload,
  onViewMap,
  onAdditionalCostsChange,
  onAdditionalNotesChange,
  onCollectiveConstructionInfoChange,
}: OrderDetailModalProps) {
  const mapFileInputRef = useRef<HTMLInputElement>(null)

  // 調査状況のステータスバッジを取得
  const getSurveyStatusBadge = (status?: OrderSurveyStatus) => {
    const currentStatus = status || '未依頼'
    const config: Record<OrderSurveyStatus, { variant: BadgeVariant; label: string }> = {
      不要: { variant: 'default', label: '不要' },
      未依頼: { variant: 'default', label: '未依頼' },
      依頼済み: { variant: 'info', label: '依頼済み' },
      調査日決定: { variant: 'warning', label: '調査日決定' },
      完了: { variant: 'success', label: '完了' },
      キャンセル: { variant: 'danger', label: 'キャンセル' },
    }
    return config[currentStatus]
  }

  // 共架OR添架許可申請のステータスバッジを取得
  const getPermissionStatusBadge = (status?: OrderPermissionStatus) => {
    const currentStatus = status || '未依頼'
    const config: Record<OrderPermissionStatus, { variant: BadgeVariant; label: string }> = {
      不要: { variant: 'default', label: '不要' },
      未依頼: { variant: 'default', label: '未依頼' },
      依頼済み: { variant: 'info', label: '依頼済み' },
      調査済み: { variant: 'info', label: '調査済み' },
      申請中: { variant: 'warning', label: '申請中' },
      申請許可: { variant: 'success', label: '申請許可' },
      申請不許可: { variant: 'danger', label: '申請不許可' },
      キャンセル: { variant: 'danger', label: 'キャンセル' },
    }
    return config[currentStatus]
  }

  // 工事状況のステータスバッジを取得
  const getConstructionStatusBadge = (status?: ConstructionStatus) => {
    const currentStatus = status || '未着手'
    const config: Record<ConstructionStatus, { variant: BadgeVariant; label: string}> = {
      未着手: { variant: 'default', label: '未着手' },
      依頼済み: { variant: 'info', label: '依頼済み' },
      工事日決定: { variant: 'warning', label: '工事日決定' },
      完了: { variant: 'success', label: '完了' },
      工事返却: { variant: 'danger', label: '工事返却' },
      工事キャンセル: { variant: 'danger', label: '工事キャンセル' },
    }
    return config[currentStatus]
  }

  // デフォルト値を設定（order.additionalCostsがない場合のみ）
  const getAdditionalCosts = (): AdditionalCosts => {
    if (order.additionalCosts) {
      return order.additionalCosts
    }
    return {
      closureExpansion: {
        required: 'not_required',
        scheduledDate: undefined,
      },
      roadApplication: {
        required: 'not_required',
        applicationDate: undefined,
        responseDate: undefined,
        completionReport: 'incomplete',
      },
      otherCompanyRepair: {
        required: 'not_required',
        applicationDate: undefined,
        responseDate: undefined,
      },
      nwEquipment: {
        required: 'not_required',
        quotationCreatedDate: undefined,
        quotationSubmittedDate: undefined,
      },
      serviceLineApplication: {
        required: 'not_required',
        billingDate: undefined,
      },
    }
  }

  // デフォルト値を設定（order.additionalNotesがない場合のみ）
  const getAdditionalNotes = (): AdditionalNotes => {
    if (order.additionalNotes) {
      return order.additionalNotes
    }
    return {
      surveyRequestNotes: undefined,
      attachmentRequestNotes: undefined,
      constructionRequestNotes: undefined,
    }
  }

  // デフォルト値を設定（order.collectiveConstructionInfoがない場合のみ）
  const getCollectiveConstructionInfo = (): CollectiveConstructionInfo => {
    if (order.collectiveConstructionInfo) {
      return order.collectiveConstructionInfo
    }
    return {
      floors: undefined,
      units: undefined,
      advanceMaterialPrinting: 'not_required',
      boosterType: undefined,
      distributorReplacement: undefined,
      dropAdvance: undefined,
    }
  }

  const handleMapUploadClick = () => {
    mapFileInputRef.current?.click()
  }

  const handleMapFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.type === 'application/pdf') {
        onMapUpload(order, file)
      } else {
        alert('PDFファイルを選択してください')
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            宅内引込進捗表 - {order.orderNumber}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <span className="sr-only">閉じる</span>
            ✕
          </button>
        </div>


          {/* 地図アップロード */}
          <div className="border-t pt-4">
            <h4 className="text-md font-medium text-gray-900 mb-2">工事場所地図</h4>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleMapUploadClick}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <DocumentArrowUpIcon className="h-4 w-4 mr-2" />
                    地図PDFをアップロード
                  </button>
                  {order.mapPdfPath && (
                    <Button
                      onClick={() => onViewMap(order)}
                      variant="primary"
                    >
                      <MapIcon className="h-4 w-4 mr-2" />
                      地図を表示
                    </Button>
                  )}
                </div>
                {order.mapPdfPath && (
                  <span className="text-sm text-green-600 font-medium">
                    ✓ 地図PDF添付済み
                  </span>
                )}
              </div>
            </div>
            <input
              ref={mapFileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleMapFileChange}
              className="hidden"
            />
          </div>

          {/* 進捗表の追加情報 */}
          <div className="border-t pt-4">
            <h4 className="text-md font-medium text-gray-900 mb-2">各進捗状況</h4>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="grid grid-cols-[auto_auto] gap-x-4 gap-y-4 text-sm items-center justify-between">
                <div className="relative group">
                  <span className="font-medium text-gray-900">
                    調査状況:
                    <span className="ml-1 text-gray-400 cursor-help">ℹ️</span>
                  </span>
                  {/* ツールチップ */}
                  <div className="absolute invisible group-hover:visible z-50 bg-gray-800 text-white text-xs rounded p-3 w-72 left-0 top-full mt-1 shadow-lg">
                    <p className="mb-1"><strong>不要:</strong> 現地調査が不要な案件</p>
                    <p className="mb-1"><strong>未依頼:</strong> まだ協力会社に依頼していない</p>
                    <p className="mb-1"><strong>依頼済み:</strong> 協力会社に依頼済み(調査日未定)</p>
                    <p className="mb-1"><strong>調査日決定:</strong> 調査日が確定</p>
                    <p className="mb-1"><strong>完了:</strong> 現地調査が完了</p>
                    <p><strong>キャンセル:</strong> 調査がキャンセルされた</p>
                  </div>
                </div>
                <Badge
                  variant={getSurveyStatusBadge(order.surveyStatus).variant}
                  size="md"
                >
                  {getSurveyStatusBadge(order.surveyStatus).label}
                </Badge>

                <div className="relative group">
                  <span className="font-medium text-gray-900">
                    共架OR添架許可申請:
                    <span className="ml-1 text-gray-400 cursor-help">ℹ️</span>
                  </span>
                  {/* ツールチップ */}
                  <div className="absolute invisible group-hover:visible z-50 bg-gray-800 text-white text-xs rounded p-3 w-72 left-0 top-full mt-1 shadow-lg">
                    <p className="mb-1"><strong>不要:</strong> 共架・添架申請が不要な案件</p>
                    <p className="mb-1"><strong>未依頼:</strong> まだ協力会社に依頼していない</p>
                    <p className="mb-1"><strong>依頼済み:</strong> 協力会社に依頼済み</p>
                    <p className="mb-1"><strong>調査済み:</strong> 現地調査が完了</p>
                    <p className="mb-1"><strong>申請中:</strong> 申請書を提出済み</p>
                    <p className="mb-1"><strong>申請許可:</strong> 申請が許可された</p>
                    <p className="mb-1"><strong>申請不許可:</strong> 申請が不許可となった</p>
                    <p><strong>キャンセル:</strong> 申請がキャンセルされた</p>
                  </div>
                </div>
                <Badge
                  variant={getPermissionStatusBadge(order.permissionStatus).variant}
                  size="md"
                >
                  {getPermissionStatusBadge(order.permissionStatus).label}
                </Badge>

                <div className="relative group">
                  <span className="font-medium text-gray-900">
                    工事状況:
                    <span className="ml-1 text-gray-400 cursor-help">ℹ️</span>
                  </span>
                  {/* ツールチップ */}
                  <div className="absolute invisible group-hover:visible z-50 bg-gray-800 text-white text-xs rounded p-3 w-72 left-0 top-full mt-1 shadow-lg">
                    <p className="mb-1"><strong>未着手:</strong> 工事依頼がまだ開始されていません</p>
                    <p className="mb-1"><strong>依頼済み:</strong> 協力会社へ工事を依頼しました</p>
                    <p className="mb-1"><strong>工事日決定:</strong> 工事実施日が決定しました</p>
                    <p className="mb-1"><strong>完了:</strong> 工事が完了しました</p>
                    <p className="mb-1"><strong>工事返却:</strong> 工事が返却されました</p>
                    <p><strong>工事キャンセル:</strong> 工事がキャンセルされました</p>
                  </div>
                </div>
                <Badge
                  variant={getConstructionStatusBadge(order.constructionStatus).variant}
                  size="md"
                >
                  {getConstructionStatusBadge(order.constructionStatus).label}
                </Badge>
              </div>
            </div>
          </div>

          {/* 集合工事情報 - 集合の場合のみ表示 */}
          {order.constructionCategory === '集合' && (
            <CollectiveConstructionSection
              data={getCollectiveConstructionInfo()}
              onChange={(data) => onCollectiveConstructionInfoChange(order.orderNumber, data)}
            />
          )}

          {/* 各種追加費用 */}
          <AdditionalCostsSection
            data={getAdditionalCosts()}
            onChange={(data) => onAdditionalCostsChange(order.orderNumber, data)}
          />

          {/* 各追加情報 */}
          <AdditionalNotesSection
            data={getAdditionalNotes()}
            onChange={(data) => onAdditionalNotesChange(order.orderNumber, data)}
          />

        <div className="mt-6 flex justify-end">
          <Button
            onClick={onClose}
            variant="secondary"
          >
            閉じる
          </Button>
        </div>
      </div>
    </div>
  )
}

