'use client'

import React, { useRef } from 'react'
import { DocumentArrowUpIcon, MapIcon } from '@heroicons/react/24/outline'
import { OrderData } from '../../types'
import { Button } from '@/shared/components/ui'

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
}

export default function OrderDetailModal({
  order,
  onClose,
  onStatusChange,
  onMapUpload,
  onViewMap,
}: OrderDetailModalProps) {
  const mapFileInputRef = useRef<HTMLInputElement>(null)

  const getSelectColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-gray-600 border-gray-300 bg-gray-50'
      case 'in_progress':
        return 'text-blue-600 border-blue-300 bg-blue-50'
      case 'completed':
        return 'text-green-600 border-green-300 bg-green-50'
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

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">依頼日</label>
              <p className="mt-1 text-sm text-gray-900">{order.constructionDate}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">顧客コード</label>
              <p className="mt-1 text-sm text-gray-900">{order.customerCode}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">クロージャ番号</label>
              <p className="mt-1 text-sm text-gray-900">{order.closureNumber}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">加入者名</label>
              <p className="mt-1 text-sm text-gray-900">{order.customerName}</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">住所</label>
            <p className="mt-1 text-sm text-gray-900">{order.address}</p>
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
              <div className="grid grid-cols-1 gap-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">調査状況:</span>
                  <select
                    value={order.surveyStatus || 'pending'}
                    onChange={(e) => onStatusChange(order.orderNumber, 'surveyStatus', e.target.value as 'pending' | 'in_progress' | 'completed')}
                    className={`rounded-md px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${getSelectColor(order.surveyStatus || 'pending')}`}
                  >
                    <option value="pending" className="text-gray-600">未着手</option>
                    <option value="in_progress" className="text-blue-600">調査中</option>
                    <option value="completed" className="text-green-600">完了</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">共架OR添架許可申請:</span>
                  <select
                    value={order.permissionStatus || 'pending'}
                    onChange={(e) => onStatusChange(order.orderNumber, 'permissionStatus', e.target.value as 'pending' | 'in_progress' | 'completed')}
                    className={`rounded-md px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${getSelectColor(order.permissionStatus || 'pending')}`}
                  >
                    <option value="pending" className="text-gray-600">未申請</option>
                    <option value="in_progress" className="text-blue-600">申請中</option>
                    <option value="completed" className="text-green-600">許可済</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">工事状況:</span>
                  <select
                    value={order.constructionStatus || 'pending'}
                    onChange={(e) => onStatusChange(order.orderNumber, 'constructionStatus', e.target.value as 'pending' | 'in_progress' | 'completed')}
                    className={`rounded-md px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${getSelectColor(order.constructionStatus || 'pending')}`}
                  >
                    <option value="pending" className="text-gray-600">未着手</option>
                    <option value="in_progress" className="text-blue-600">工事中</option>
                    <option value="completed" className="text-green-600">完了</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

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

