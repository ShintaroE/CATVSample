'use client'

import React, { useState } from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'
import Layout from '@/shared/components/layout/Layout'
import { OrderData } from './types'
import { sampleOrders } from './data/sampleData'
import { useOrders } from './hooks/useOrders'
import { Button } from '@/shared/components/ui'
import ExcelUploadZone from './components/ExcelUploadZone'
import OrdersTable from './components/OrdersTable'
import OrderDetailModal from './components/OrderDetailModal'
import AppointmentHistoryModal from './components/AppointmentHistoryModal'
import NewOrderModal from './components/NewOrderModal'

export default function OrdersPage() {
  const { orders, setOrders, updateWorkType, updateStatus, updateMapPdfPath } = useOrders(sampleOrders)
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null)
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)
  const [appointmentOrder, setAppointmentOrder] = useState<OrderData | null>(null)
  const [showNewOrderModal, setShowNewOrderModal] = useState(false)

  const handleUpload = (newOrders: OrderData[]) => {
    // ExcelUploadZoneから渡される新しい注文を追加
    setOrders([...orders, ...newOrders])
  }

  const handleViewDetails = (order: OrderData) => {
    setSelectedOrder(order)
  }

  const handleCloseDetails = () => {
    setSelectedOrder(null)
  }

  const handleStatusChange = (
    orderNumber: string,
    statusType: 'surveyStatus' | 'permissionStatus' | 'constructionStatus',
    newStatus: 'pending' | 'in_progress' | 'completed'
  ) => {
    updateStatus(orderNumber, statusType, newStatus)
    // selectedOrderも更新
    if (selectedOrder && selectedOrder.orderNumber === orderNumber) {
      setSelectedOrder(prev => prev ? { ...prev, [statusType]: newStatus } : null)
    }
  }

  const handleMapUpload = (order: OrderData) => {
    // 実際の実装では、ファイルをサーバーにアップロードして URL を取得
    // ここではサンプルとして地図.pdfのパスを設定
    const mapPath = '/地図.pdf'
    updateMapPdfPath(order.orderNumber, mapPath)
    // selectedOrderも更新
    if (selectedOrder && selectedOrder.orderNumber === order.orderNumber) {
      setSelectedOrder(prev => prev ? { ...prev, mapPdfPath: mapPath } : null)
    }
    alert('地図PDFがアップロードされました')
  }

  const handleViewMap = (order: OrderData) => {
    if (order.mapPdfPath) {
      window.open(order.mapPdfPath, '_blank')
    }
  }

  const handleViewAppointmentHistory = (order: OrderData) => {
    setAppointmentOrder(order)
    setShowAppointmentModal(true)
  }

  const handleCloseAppointmentModal = () => {
    setShowAppointmentModal(false)
    setAppointmentOrder(null)
  }
  const handleCreateOrder = (newOrder: OrderData) => {
    setOrders([...orders, newOrder])
  }


  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
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

        <main className="max-w-full mx-auto py-6 px-4 sm:px-6 lg:px-8 xl:px-12">
          <ExcelUploadZone currentOrderCount={orders.length} onUpload={handleUpload} />
          <div className="mb-6 flex justify-end">
            <Button
              variant="primary"
              onClick={() => setShowNewOrderModal(true)}
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              新規工事依頼を作成
            </Button>
          </div>
          <OrdersTable
            orders={orders}
            onWorkTypeChange={updateWorkType}
            onViewDetails={handleViewDetails}
            onViewAppointmentHistory={handleViewAppointmentHistory}
          />
        </main>

        {selectedOrder && (
          <OrderDetailModal
            order={selectedOrder}
            onClose={handleCloseDetails}
            onStatusChange={handleStatusChange}
            onMapUpload={handleMapUpload}
            onViewMap={handleViewMap}
          />
        )}

        {showAppointmentModal && appointmentOrder && (
          <AppointmentHistoryModal
            order={appointmentOrder}
            orders={orders}
            setOrders={setOrders}
            onClose={handleCloseAppointmentModal}
          />
        )}
        {showNewOrderModal && (
          <NewOrderModal
            onClose={() => setShowNewOrderModal(false)}
            onCreate={handleCreateOrder}
          />
        )}

      </div>
    </Layout>
  )
}
