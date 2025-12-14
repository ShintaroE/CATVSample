'use client'

import React from 'react'
import { OrderData } from '../../types'
import OrderRow from './OrderRow'

interface OrdersTableProps {
  orders: OrderData[]
  onEditOrder: (order: OrderData) => void
  onViewDetails: (order: OrderData) => void
  onViewAppointmentHistory: (order: OrderData) => void
}

export default function OrdersTable({
  orders,
  onEditOrder,
  onViewDetails,
  onViewAppointmentHistory,
}: OrdersTableProps) {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                受注番号
              </th>
              <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                受注先
              </th>
              <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                個別/集合
              </th>
              <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                工事種別
              </th>
              <th className="hidden xl:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                クロージャ番号
              </th>
              <th className="hidden xl:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                顧客コード
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                顧客名
              </th>
              <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                顧客名（カナ）
              </th>
              <th className="hidden xl:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                集合住宅コード
              </th>
              <th className="hidden xl:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                集合住宅名
              </th>
              <th className="hidden xl:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                集合住宅名（カナ）
              </th>
              <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                新規/既存
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ステータス
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                詳細
              </th>
              <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                アポイント履歴
              </th>
              <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                編集
              </th>
            </tr>
          </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <OrderRow
                  key={order.orderNumber}
                  order={order}
                  onEditOrder={onEditOrder}
                  onViewDetails={onViewDetails}
                  onViewAppointmentHistory={onViewAppointmentHistory}
                />
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
