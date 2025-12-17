'use client'

import React, { useState, useEffect } from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'
import Layout from '@/shared/components/layout/Layout'
import { OrderData, AdditionalCosts, AdditionalNotes, CollectiveConstructionInfo } from './types'
import {
  SurveyRequest,
  AttachmentRequest,
  ConstructionRequest,
} from '@/features/applications/types'
import { useOrders } from './hooks/useOrders'
import { useOrderFilters } from './hooks/useOrderFilters'
import { orderStorage } from './lib/orderStorage'
import {
  getSurveyRequests,
  getAttachmentRequests,
  getConstructionRequests,
} from '@/features/applications/lib/applicationStorage'
import { Button } from '@/shared/components/ui'
import ExcelUploadZone from './components/ExcelUploadZone'
import OrdersTable from './components/OrdersTable'
import AppointmentHistoryModal from './components/AppointmentHistoryModal'
import OrderDetailModal from './components/OrderDetailModal'
import NewOrderModal from './components/NewOrderModal'
import EditOrderModal from './components/EditOrderModal'
import FilterPanel from './components/FilterPanel'
import CsvExportButton from './components/CsvExportButton'

export default function OrdersPage() {
  const {
    orders,
    addOrders,
    uploadMapPdf,
    downloadMapPdf,
    createOrder,
    replaceOrder,
    updateAdditionalCosts,
    updateAdditionalNotes,
    updateCollectiveConstructionInfo,
    addAppointment,
    removeAppointment
  } = useOrders()

  // 申請管理データを取得
  const [surveys, setSurveys] = useState<SurveyRequest[]>([])
  const [attachments, setAttachments] = useState<AttachmentRequest[]>([])
  const [constructions, setConstructions] = useState<ConstructionRequest[]>([])

  useEffect(() => {
    // 初回マウント時に申請データを読み込み
    setSurveys(getSurveyRequests())
    setAttachments(getAttachmentRequests())
    setConstructions(getConstructionRequests())
  }, [])

  // フィルター機能（検索ボタンパターン）
  const {
    inputFilters,
    searchFilters,
    filteredOrders,
    updateInputFilter,
    executeSearch,
    clearInputFilters,
    isSearching,
    activeFilterCount,
    filteredCount,
    totalCount
  } = useOrderFilters(orders)

  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)
  const [appointmentOrder, setAppointmentOrder] = useState<OrderData | null>(null)
  const [showNewOrderModal, setShowNewOrderModal] = useState(false)
  const [editingOrder, setEditingOrder] = useState<OrderData | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  const handleUpload = (newOrders: OrderData[]) => {
    // ExcelUploadZoneから渡される新しい注文を追加
    addOrders(newOrders)
  }

  const handleViewDetails = (order: OrderData) => {
    setSelectedOrder(order)
    setShowDetailModal(true)
  }

  const handleCloseDetails = () => {
    setShowDetailModal(false)
    setSelectedOrder(null)
  }

  const handleMapUpload = async (order: OrderData, file: File) => {
    try {
      await uploadMapPdf(order.orderNumber, file)

      // selectedOrderも更新
      if (selectedOrder && selectedOrder.orderNumber === order.orderNumber) {
        const updated = orderStorage.getByOrderNumber(order.orderNumber)
        if (updated) {
          setSelectedOrder(updated)
        }
      }
      alert('地図PDFがアップロードされました')
    } catch (error) {
      console.error('PDF upload failed:', error)
      alert('地図PDFのアップロードに失敗しました')
    }
  }

  const handleViewMap = (order: OrderData) => {
    if (order.mapPdfId) {
      downloadMapPdf(order.orderNumber)
    }
  }

  const handleAdditionalCostsChange = (
    orderNumber: string,
    additionalCosts: AdditionalCosts
  ) => {
    updateAdditionalCosts(orderNumber, additionalCosts)
    // selectedOrderも更新
    if (selectedOrder && selectedOrder.orderNumber === orderNumber) {
      setSelectedOrder(prev => prev ? { ...prev, additionalCosts } : null)
    }
  }

  const handleAdditionalNotesChange = (
    orderNumber: string,
    additionalNotes: AdditionalNotes
  ) => {
    updateAdditionalNotes(orderNumber, additionalNotes)
    // selectedOrderも更新
    if (selectedOrder && selectedOrder.orderNumber === orderNumber) {
      setSelectedOrder(prev => prev ? { ...prev, additionalNotes } : null)
    }
  }

  const handleCollectiveConstructionInfoChange = (
    orderNumber: string,
    collectiveConstructionInfo: CollectiveConstructionInfo
  ) => {
    updateCollectiveConstructionInfo(orderNumber, collectiveConstructionInfo)
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
    createOrder(newOrder)
  }

  const handleEditOrder = (order: OrderData) => {
    setEditingOrder(order)
    setShowEditModal(true)
  }

  const handleUpdateOrder = (updatedOrder: OrderData) => {
    replaceOrder(updatedOrder)
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
          {/* ボタングループ */}
          <div className="flex items-center gap-3">
            {/* CSVエクスポートボタン */}
            <CsvExportButton
              orders={filteredOrders}
              surveys={surveys}
              attachments={attachments}
              constructions={constructions}
              className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            />

            {/* 新規工事依頼ボタン */}
            <Button
              variant="primary"
              onClick={() => setShowNewOrderModal(true)}
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              新規工事依頼を作成
            </Button>
          </div>
        </div>

        {/* Excel アップロード */}
        <ExcelUploadZone currentOrderCount={orders.length} onUpload={handleUpload} />

        {/* フィルターパネル */}
        <FilterPanel
          filters={inputFilters}
          onUpdateFilter={updateInputFilter}
          onSearch={executeSearch}
          onClear={clearInputFilters}
          isSearching={isSearching}
          activeFilterCount={activeFilterCount}
          filteredCount={filteredCount}
          totalCount={totalCount}
        />

        {/* テーブル */}
        <OrdersTable
          orders={filteredOrders}
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
            onUpdateAppointment={addAppointment}
            onDeleteAppointment={removeAppointment}
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
