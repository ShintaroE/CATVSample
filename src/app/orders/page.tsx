'use client'

import { useState } from 'react'
import { ArrowLeftIcon, DocumentArrowUpIcon, EyeIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

interface OrderData {
  orderNumber: string
  orderSource: string
  workContent: string
  customerCode: string
  constructionDate?: string
  closureNumber?: string
  customerName?: string
  address?: string
}

const sampleOrders: OrderData[] = [
  {
    orderNumber: '2024031500001',
    orderSource: 'KCT本社',
    workContent: '共架工事',
    customerCode: '123456789',
    constructionDate: '2024-03-15',
    closureNumber: 'CL-001-A',
    customerName: '田中太郎',
    address: '倉敷市水島青葉町1-1-1'
  },
  {
    orderNumber: '2024031600002',
    orderSource: 'KCT水島',
    workContent: '宅内引込工事',
    customerCode: '234567890',
    constructionDate: '2024-03-16',
    closureNumber: 'CL-002-B',
    customerName: '佐藤花子',
    address: '倉敷市児島駅前2-2-2'
  },
  {
    orderNumber: '2024031700003',
    orderSource: 'KCT玉島',
    workContent: '撤去工事',
    customerCode: '345678901',
    constructionDate: '2024-03-17',
    closureNumber: 'CL-003-C',
    customerName: '山田次郎',
    address: '倉敷市玉島中央町3-3-3'
  }
]

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderData[]>(sampleOrders)
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    const excelFiles = files.filter(file =>
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
        workContent: '共架工事',
        customerCode: `${Math.floor(Math.random() * 900000000) + 100000000}`,
        constructionDate: new Date().toISOString().split('T')[0],
        closureNumber: `CL-${String(orders.length + 1).padStart(3, '0')}-A`,
        customerName: '新規顧客',
        address: '倉敷市新規住所'
      }

      setOrders(prev => [...prev, newOrder])

      // 成功メッセージ（実際はトーストなど）
      alert(`${excelFiles[0].name} を読み込みました。\n受注番号: ${newOrder.orderNumber}`)
    }
  }

  const handleViewDetails = (order: OrderData) => {
    setSelectedOrder(order)
  }

  const handleCloseDetails = () => {
    setSelectedOrder(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/" className="mr-4">
                <ArrowLeftIcon className="h-6 w-6 text-gray-600 hover:text-gray-900" />
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">
                工事依頼管理
              </h1>
            </div>
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
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              工事依頼のEXCELファイルをドラッグ&ドロップしてください
            </p>
            <p className="text-xs text-gray-500 mt-1">
              (.xlsx, .xls形式に対応)
            </p>
          </div>
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
                        {order.workContent}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.customerCode}
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
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">調査完了:</span>
                      <span className="ml-2 text-green-600">完了</span>
                    </div>
                    <div>
                      <span className="font-medium">許可申請:</span>
                      <span className="ml-2 text-yellow-600">申請中</span>
                    </div>
                    <div>
                      <span className="font-medium">工事完了:</span>
                      <span className="ml-2 text-gray-400">未完了</span>
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
  )
}