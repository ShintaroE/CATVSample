'use client'

import React from 'react'
import { EyeIcon, ClockIcon } from '@heroicons/react/24/outline'
import { OrderData, IndividualWorkType, CollectiveWorkType, getWorkTypeOptions } from '../../types'

interface OrderRowProps {
  order: OrderData
  onWorkTypeChange: (orderNumber: string, newWorkType: IndividualWorkType | CollectiveWorkType) => void
  onViewDetails: (order: OrderData) => void
  onViewAppointmentHistory: (order: OrderData) => void
}

export default function OrderRow({
  order,
  onWorkTypeChange,
  onViewDetails,
  onViewAppointmentHistory,
}: OrderRowProps) {
  const workTypeOptions = getWorkTypeOptions(order.constructionCategory)

  return (
    <tr key={order.orderNumber} className="hover:bg-gray-50">
      {/* 受注番号 */}
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {order.orderNumber}
      </td>
      {/* 受注先 */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {order.orderSource}
      </td>
      {/* 個別/集合 */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          order.constructionCategory === '個別'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-green-100 text-green-800'
        }`}>
          {order.constructionCategory}
        </span>
      </td>
      {/* 工事種別 */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <select
          value={order.workType}
          onChange={(e) => onWorkTypeChange(order.orderNumber, e.target.value as IndividualWorkType | CollectiveWorkType)}
          className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
        >
          {workTypeOptions.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </td>
      {/* 顧客コード */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {order.customerCode}
      </td>
      {/* 顧客名 */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {order.customerName}
      </td>
      {/* 集合住宅コード */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {order.apartmentCode || '—'}
      </td>
      {/* 集合住宅名 */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {order.apartmentName || '—'}
      </td>
      {/* 新規/既存 */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          order.customerType === '新規'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {order.customerType}
        </span>
      </td>
      {/* アクション */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <button
          onClick={() => onViewDetails(order)}
          className="inline-flex items-center text-blue-600 hover:text-blue-900"
        >
          <EyeIcon className="h-4 w-4 mr-1" />
          詳細表示
        </button>
      </td>
      {/* アポイント履歴 */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onViewAppointmentHistory(order)}
            className="inline-flex items-center text-blue-600 hover:text-blue-900"
          >
            <ClockIcon className="h-4 w-4 mr-1" />
            履歴表示
          </button>
          <span className="text-xs text-gray-400">
            ({order.appointmentHistory?.length || 0}件)
          </span>
        </div>
      </td>
    </tr>
  )
}
