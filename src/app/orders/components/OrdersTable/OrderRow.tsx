'use client'

import React from 'react'
import { EyeIcon, ClockIcon } from '@heroicons/react/24/outline'
import { OrderData, workContentOptions } from '../../types'

interface OrderRowProps {
  order: OrderData
  onWorkContentChange: (orderNumber: string, newContent: string) => void
  onViewDetails: (order: OrderData) => void
  onViewAppointmentHistory: (order: OrderData) => void
}

export default function OrderRow({
  order,
  onWorkContentChange,
  onViewDetails,
  onViewAppointmentHistory,
}: OrderRowProps) {
  return (
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
          onChange={(e) => onWorkContentChange(order.orderNumber, e.target.value)}
          className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
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
          onClick={() => onViewDetails(order)}
          className="inline-flex items-center text-blue-600 hover:text-blue-900"
        >
          <EyeIcon className="h-4 w-4 mr-1" />
          詳細表示
        </button>
      </td>
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

