'use client'

import React, { useState } from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'
import Layout from '@/shared/components/layout/Layout'
import { OrderData, AdditionalCosts } from './types'
import { sampleOrders } from './data/sampleData'
import { useOrders } from './hooks/useOrders'
import { Button } from '@/shared/components/ui'
import ExcelUploadZone from './components/ExcelUploadZone'
import OrdersTable from './components/OrdersTable'
import AppointmentHistoryModal from './components/AppointmentHistoryModal'
import OrderDetailModal from './components/OrderDetailModal'
import NewOrderModal from './components/NewOrderModal'
import EditOrderModal from './components/EditOrderModal'

export default function OrdersPage() {
  const { orders, setOrders } = useOrders(sampleOrders)
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)
  const [appointmentOrder, setAppointmentOrder] = useState<OrderData | null>(null)
  const [showNewOrderModal, setShowNewOrderModal] = useState(false)
  const [editingOrder, setEditingOrder] = useState<OrderData | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  const handleUpload = (newOrders: OrderData[]) => {
    // ExcelUploadZoneから渡される新しい注文を追加
    setOrders([...orders, ...newOrders])
  }

  const handleViewDetails = (order: OrderData) => {
    setSelectedOrder(order)
    setShowDetailModal(true)
  }

  const handleCloseDetails = () => {
    setShowDetailModal(false)
    setSelectedOrder(null)
  }

  const handleStatusChange = (
    orderNumber: string,
    statusType: 'surveyStatus' | 'permissionStatus' | 'constructionStatus',
    newStatus: 'pending' | 'in_progress' | 'completed' | 'canceled'
  ) => {
    setOrders(orders.map(o =>
      o.orderNumber === orderNumber
        ? { ...o, [statusType]: newStatus }
        : o
    ))
    // selectedOrderも更新
    if (selectedOrder && selectedOrder.orderNumber === orderNumber) {
      setSelectedOrder(prev => prev ? { ...prev, [statusType]: newStatus } : null)
    }
  }

  const handleMapUpload = (order: OrderData, _file: File) => {
    // ファイルをサーバーにアップロード（実装は将来）
    // ここではサンプルとしてダミーパスを設定
    const mapPath = `/maps/${order.orderNumber}.pdf`
    setOrders(orders.map(o =>
      o.orderNumber === order.orderNumber
        ? { ...o, mapPdfPath: mapPath }
        : o
    ))
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

  const handleAdditionalCostsChange = (
    orderNumber: string,
    additionalCosts: AdditionalCosts
  ) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.orderNumber === orderNumber
          ? { ...order, additionalCosts }
          : order
      )
    )
    // selectedOrderも更新
    if (selectedOrder && selectedOrder.orderNumber === orderNumber) {
      setSelectedOrder(prev => prev ? { ...prev, additionalCosts } : null)
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

  const handleEditOrder = (order: OrderData) => {
    setEditingOrder(order)
    setShowEditModal(true)
  }

  const handleUpdateOrder = (updatedOrder: OrderData) => {
    setOrders(orders.map(o => o.orderNumber === updatedOrder.orderNumber ? updatedOrder : o))
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
            onEditOrder={handleEditOrder}
            onViewDetails={handleViewDetails}
            onViewAppointmentHistory={handleViewAppointmentHistory}
          />
        </main>

        {showDetailModal && selectedOrder && (
          <OrderDetailModal
            order={selectedOrder}
            onClose={handleCloseDetails}
            onStatusChange={handleStatusChange}
            onMapUpload={handleMapUpload}
            onViewMap={handleViewMap}
            onAdditionalCostsChange={handleAdditionalCostsChange}
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

        {showEditModal && editingOrder && (
          <EditOrderModal
            order={editingOrder}
            onClose={() => setShowEditModal(false)}
            onUpdate={handleUpdateOrder}
          />
        )}

      </div>
    </Layout>
  )
}
