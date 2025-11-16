'use client'

import React, { useState } from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'
import Layout from '@/shared/components/layout/Layout'
import { OrderData, AdditionalCosts, AdditionalNotes, CollectiveConstructionInfo } from './types'
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

  const handleAdditionalNotesChange = (
    orderNumber: string,
    additionalNotes: AdditionalNotes
  ) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.orderNumber === orderNumber
          ? { ...order, additionalNotes }
          : order
      )
    )
    // selectedOrderも更新
    if (selectedOrder && selectedOrder.orderNumber === orderNumber) {
      setSelectedOrder(prev => prev ? { ...prev, additionalNotes } : null)
    }
  }

  const handleCollectiveConstructionInfoChange = (
    orderNumber: string,
    collectiveConstructionInfo: CollectiveConstructionInfo
  ) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.orderNumber === orderNumber
          ? { ...order, collectiveConstructionInfo }
          : order
      )
    )
    // selectedOrderも更新
    if (selectedOrder && selectedOrder.orderNumber === orderNumber) {
      setSelectedOrder(prev => prev ? { ...prev, collectiveConstructionInfo } : null)
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
      <div className="px-6 py-6">
        {/* ヘッダー */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">工事依頼管理</h1>
            <p className="text-sm text-gray-500 mt-1">小川オーダー表形式</p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowNewOrderModal(true)}
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            新規工事依頼を作成
          </Button>
        </div>

        {/* Excel アップロード */}
        <ExcelUploadZone currentOrderCount={orders.length} onUpload={handleUpload} />

        {/* テーブル */}
        <OrdersTable
          orders={orders}
          onEditOrder={handleEditOrder}
          onViewDetails={handleViewDetails}
          onViewAppointmentHistory={handleViewAppointmentHistory}
        />
      </div>

      {/* モーダル */}
      {showDetailModal && selectedOrder && (
          <OrderDetailModal
            order={selectedOrder}
            onClose={handleCloseDetails}
            onStatusChange={handleStatusChange}
            onMapUpload={handleMapUpload}
            onViewMap={handleViewMap}
            onAdditionalCostsChange={handleAdditionalCostsChange}
            onAdditionalNotesChange={handleAdditionalNotesChange}
            onCollectiveConstructionInfoChange={handleCollectiveConstructionInfoChange}
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
    </Layout>
  )
}
