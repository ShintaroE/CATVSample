'use client'

import React from 'react'
import { OrderData } from '../../types'
import { IndividualWorkType, CollectiveWorkType } from '../../types'
import OrderRow from './OrderRow'

interface OrdersTableProps {
  orders: OrderData[]
  onWorkTypeChange: (orderNumber: string, newWorkType: IndividualWorkType | CollectiveWorkType) => void
  onViewDetails: (order: OrderData) => void
  onViewAppointmentHistory: (order: OrderData) => void
}

export default function OrdersTable({
  orders,
  onWorkTypeChange,
  onViewDetails,
  onViewAppointmentHistory,
}: OrdersTableProps) {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          工事依頼一覧（小川オーダー表）
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1400px] xl:min-w-[1500px] divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 lg:px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  受注番号
                </th>
                <th className="hidden lg:table-cell px-3 lg:px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  受注先
                </th>
                <th className="px-3 lg:px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  個別/集合
                </th>
                <th className="px-3 lg:px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  工事種別
                </th>
                <th className="px-3 lg:px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  顧客コード
                </th>
                <th className="px-3 lg:px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  顧客名
                </th>
                <th className="hidden lg:table-cell px-3 lg:px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  集合住宅コード
                </th>
                <th className="hidden lg:table-cell px-3 lg:px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  集合住宅名
                </th>
                <th className="px-3 lg:px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  新規/既存
                </th>
                <th className="px-3 lg:px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  アクション
                </th>
                <th className="px-3 lg:px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  アポイント履歴
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <OrderRow
                  key={order.orderNumber}
                  order={order}
                  onWorkTypeChange={onWorkTypeChange}
                  onViewDetails={onViewDetails}
                  onViewAppointmentHistory={onViewAppointmentHistory}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

