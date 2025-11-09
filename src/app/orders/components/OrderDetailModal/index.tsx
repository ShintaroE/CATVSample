'use client'

import React, { useRef } from 'react'
import { DocumentArrowUpIcon, MapIcon } from '@heroicons/react/24/outline'
import { OrderData, AdditionalCosts, AdditionalNotes, CollectiveConstructionInfo } from '../../types'
import { Button } from '@/shared/components/ui'
import AdditionalCostsSection from './AdditionalCostsSection'
import AdditionalNotesSection from './AdditionalNotesSection'
import CollectiveConstructionSection from './CollectiveConstructionSection'

interface OrderDetailModalProps {
  order: OrderData
  onClose: () => void
  onStatusChange: (
    orderNumber: string,
    statusType: 'surveyStatus' | 'permissionStatus' | 'constructionStatus',
    newStatus: 'pending' | 'in_progress' | 'completed'
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

  const getSelectColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-gray-600 border-gray-300 bg-gray-50'
      case 'in_progress':
        return 'text-blue-600 border-blue-300 bg-blue-50'
      case 'completed':
        return 'text-green-600 border-green-300 bg-green-50'
      case 'canceled':
        return 'text-purple-600 border-purple-300 bg-purple-50'
      default:
        return 'text-gray-600 border-gray-300 bg-gray-50'
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
            <h4 className="text-md font-medium text-gray-900 mb-2">工事進捗</h4>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="grid grid-cols-[auto_auto] gap-x-4 gap-y-4 text-sm items-center justify-between">
                <span className="font-medium text-gray-900">調査状況:</span>
                <select
                  value={order.surveyStatus || 'pending'}
                  onChange={(e) => onStatusChange(order.orderNumber, 'surveyStatus', e.target.value as 'pending' | 'in_progress' | 'completed')}
                  className={`w-36 rounded-md px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${getSelectColor(order.surveyStatus || 'pending')}`}
                >
                  <option value="pending" className="text-gray-600">未着手</option>
                  <option value="in_progress" className="text-blue-600">調査日決定</option>
                  <option value="completed" className="text-green-600">完了</option>
                </select>

                <span className="font-medium text-gray-900">共架OR添架許可申請:</span>
                <select
                  value={order.permissionStatus || 'pending'}
                  onChange={(e) => onStatusChange(order.orderNumber, 'permissionStatus', e.target.value as 'pending' | 'in_progress' | 'completed')}
                  className={`w-36 rounded-md px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${getSelectColor(order.permissionStatus || 'pending')}`}
                >
                  <option value="pending" className="text-gray-600">未申請</option>
                  <option value="in_progress" className="text-blue-600">申請中</option>
                  <option value="completed" className="text-green-600">許可済</option>
                </select>

                <span className="font-medium text-gray-900">工事状況:</span>
                <select
                  value={order.constructionStatus || 'pending'}
                  onChange={(e) => onStatusChange(order.orderNumber, 'constructionStatus', e.target.value as 'pending' | 'in_progress' | 'completed')}
                  className={`w-36 rounded-md px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${getSelectColor(order.constructionStatus || 'pending')}`}
                >
                  <option value="pending" className="text-gray-600">未着手</option>
                  <option value="in_progress" className="text-blue-600">工事日決定</option>
                  <option value="completed" className="text-green-600">完了</option>
                  <option value="canceled" className="text-purple-600">工事返却</option>
                </select>
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

