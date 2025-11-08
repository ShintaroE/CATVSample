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
import AppointmentHistoryModal from './components/AppointmentHistoryModal'
import NewOrderModal from './components/NewOrderModal'
import EditOrderModal from './components/EditOrderModal'

export default function OrdersPage() {
  const { orders, setOrders } = useOrders(sampleOrders)
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
    // 詳細表示機能は未実装（将来的に実装予定）
    console.log('View details for order:', order.orderNumber)
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
