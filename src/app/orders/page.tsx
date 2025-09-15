'use client'

import React, { useState } from 'react'
import { DocumentArrowUpIcon, EyeIcon } from '@heroicons/react/24/outline'
import Layout from '@/components/Layout'

interface OrderData {
  orderNumber: string
  orderSource: string
  workContent: string
  customerCode: string
  customerType: '新規' | '既存'
  customerName: string
  constructionDate?: string
  closureNumber?: string
  address?: string
  surveyStatus?: 'pending' | 'in_progress' | 'completed'
  permissionStatus?: 'pending' | 'in_progress' | 'completed'
  constructionStatus?: 'pending' | 'in_progress' | 'completed'
}

const workContentOptions = [
  '個別対応',
  'HCNAー技術人工事',
  'G・6ch追加人工事',
  '放送波人工事'
]

const sampleOrders: OrderData[] = [
  {
    orderNumber: '2024031500001',
    orderSource: 'KCT本社',
    workContent: '個別対応',
    customerCode: '123456789',
    customerType: '新規',
    customerName: '田中太郎',
    constructionDate: '2024-03-15',
    closureNumber: 'CL-001-A',
    address: '倉敷市水島青葉町1-1-1',
    surveyStatus: 'completed',
    permissionStatus: 'in_progress',
    constructionStatus: 'pending'
  },
  {
    orderNumber: '2024031600002',
    orderSource: 'KCT水島',
    workContent: 'HCNAー技術人工事',
    customerCode: '234567890',
    customerType: '既存',
    customerName: '佐藤花子',
    constructionDate: '2024-03-16',
    closureNumber: 'CL-002-B',
    address: '倉敷市児島駅前2-2-2',
    surveyStatus: 'completed',
    permissionStatus: 'completed',
    constructionStatus: 'in_progress'
  },
  {
    orderNumber: '2024031700003',
    orderSource: 'KCT玉島',
    workContent: 'G・6ch追加人工事',
    customerCode: '345678901',
    customerType: '新規',
    customerName: '山田次郎',
    constructionDate: '2024-03-17',
    closureNumber: 'CL-003-C',
    address: '倉敷市玉島中央町3-3-3',
    surveyStatus: 'in_progress',
    permissionStatus: 'pending',
    constructionStatus: 'pending'
  }
]

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderData[]>(sampleOrders)
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const processFiles = (files: FileList) => {
    const excelFiles = Array.from(files).filter(file =>
      file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
    )

    if (excelFiles.length > 0) {
      // サンプルとして新しい工事依頼を追加
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      const sequence = String(orders.length + 1).padStart(5, '0')

      const newOrder: OrderData = {
        orderNumber: `${year}${month}${day}${sequence}`,
        orderSource: 'KCT本社',
        workContent: '個別対応',
        customerCode: `${Math.floor(Math.random() * 900000000) + 100000000}`,
        customerType: '新規',
        customerName: '新規顧客',
        constructionDate: new Date().toISOString().split('T')[0],
        closureNumber: `CL-${String(orders.length + 1).padStart(3, '0')}-A`,
        address: '倉敷市新規住所',
        surveyStatus: 'pending',
        permissionStatus: 'pending',
        constructionStatus: 'pending'
      }

      setOrders(prev => [...prev, newOrder])

      // 成功メッセージ（実際はトーストなど）
      alert(`${excelFiles[0].name} を読み込みました。\n受注番号: ${newOrder.orderNumber}`)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    processFiles(e.dataTransfer.files)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files)
    }
  }

  const handleClickUpload = () => {
    fileInputRef.current?.click()
  }

  const handleViewDetails = (order: OrderData) => {
    setSelectedOrder(order)
  }

  const handleCloseDetails = () => {
    setSelectedOrder(null)
  }

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


  const handleWorkContentChange = (orderNumber: string, newContent: string) => {
    setOrders(prev => prev.map(order =>
      order.orderNumber === orderNumber
        ? { ...order, workContent: newContent }
        : order
    ))
  }

  const handleStatusChange = (orderNumber: string, statusType: 'surveyStatus' | 'permissionStatus' | 'constructionStatus', newStatus: 'pending' | 'in_progress' | 'completed') => {
    setOrders(prev => prev.map(order =>
      order.orderNumber === orderNumber
        ? { ...order, [statusType]: newStatus }
        : order
    ))

    // selectedOrderも更新
    if (selectedOrder && selectedOrder.orderNumber === orderNumber) {
      setSelectedOrder(prev => prev ? { ...prev, [statusType]: newStatus } : null)
    }
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <h1 className="text-3xl font-bold text-gray-900">
                工事依頼管理
              </h1>
              <div className="text-sm text-gray-600">
                小川オーダー表形式
              </div>
            </div>
          </div>
        </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* EXCELアップロード領域 */}
        <div className="mb-8">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              isDragOver
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClickUpload}
          >
            <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              工事依頼のEXCELファイルをドラッグ&ドロップ
            </p>
            <p className="text-xs text-gray-500 mt-1">
              または<span className="text-blue-600 font-medium">クリックしてファイルを選択</span>
            </p>
            <p className="text-xs text-gray-500">
              (.xlsx, .xls形式に対応)
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileInputChange}
            className="hidden"
            multiple
          />
        </div>

        {/* 工事依頼一覧 */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              工事依頼一覧（小川オーダー表）
            </h3>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      受注番号
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      受注先
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      工事内容
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      顧客コード
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      新規/既存
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      顧客名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      アクション
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.orderNumber} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.orderNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.orderSource}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <select
                          value={order.workContent}
                          onChange={(e) => handleWorkContentChange(order.orderNumber, e.target.value)}
                          className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {workContentOptions.map(option => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.customerCode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.customerType === '新規'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {order.customerType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.customerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="inline-flex items-center text-blue-600 hover:text-blue-900"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          詳細表示
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* 詳細モーダル（宅内引込進捗表） */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                宅内引込進捗表 - {selectedOrder.orderNumber}
              </h3>
              <button
                onClick={handleCloseDetails}
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
                  <p className="mt-1 text-sm text-gray-900">{selectedOrder.constructionDate}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">顧客コード</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedOrder.customerCode}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">クロージャ番号</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedOrder.closureNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">加入者名</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedOrder.customerName}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">住所</label>
                <p className="mt-1 text-sm text-gray-900">{selectedOrder.address}</p>
              </div>

              {/* 進捗表の追加情報 */}
              <div className="border-t pt-4">
                <h4 className="text-md font-medium text-gray-900 mb-2">工事進捗</h4>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="grid grid-cols-1 gap-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">調査状況:</span>
                      <select
                        value={selectedOrder.surveyStatus || 'pending'}
                        onChange={(e) => handleStatusChange(selectedOrder.orderNumber, 'surveyStatus', e.target.value as 'pending' | 'in_progress' | 'completed')}
                        className={`rounded-md px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${getSelectColor(selectedOrder.surveyStatus || 'pending')}`}
                      >
                        <option value="pending" className="text-gray-600">未着手</option>
                        <option value="in_progress" className="text-blue-600">調査中</option>
                        <option value="completed" className="text-green-600">完了</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">共架OR添架許可申請:</span>
                      <select
                        value={selectedOrder.permissionStatus || 'pending'}
                        onChange={(e) => handleStatusChange(selectedOrder.orderNumber, 'permissionStatus', e.target.value as 'pending' | 'in_progress' | 'completed')}
                        className={`rounded-md px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${getSelectColor(selectedOrder.permissionStatus || 'pending')}`}
                      >
                        <option value="pending" className="text-gray-600">未申請</option>
                        <option value="in_progress" className="text-blue-600">申請中</option>
                        <option value="completed" className="text-green-600">許可済</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">工事状況:</span>
                      <select
                        value={selectedOrder.constructionStatus || 'pending'}
                        onChange={(e) => handleStatusChange(selectedOrder.orderNumber, 'constructionStatus', e.target.value as 'pending' | 'in_progress' | 'completed')}
                        className={`rounded-md px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${getSelectColor(selectedOrder.constructionStatus || 'pending')}`}
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
              <button
                onClick={handleCloseDetails}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </Layout>
  );
}