'use client'

import React from 'react'
import { EyeIcon, ClockIcon, PencilSquareIcon } from '@heroicons/react/24/outline'
import { OrderData } from '../../types'

interface OrderRowProps {
  order: OrderData
  onEditOrder: (order: OrderData) => void
  onViewDetails: (order: OrderData) => void
  onViewAppointmentHistory: (order: OrderData) => void
}

export default function OrderRow({
  order,
  onEditOrder,
  onViewDetails,
  onViewAppointmentHistory,
}: OrderRowProps) {
  return (
    <tr key={order.orderNumber} className="hover:bg-gray-50">
      {/* 受注番号 */}
      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
        {order.orderNumber}
      </td>
      {/* 受注先 */}
      <td className="hidden lg:table-cell px-4 py-3 whitespace-nowrap text-sm text-gray-500">
        {order.orderSource}
      </td>
      {/* 個別/集合 */}
      <td className="hidden md:table-cell px-4 py-3 whitespace-nowrap text-sm text-gray-500">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          order.constructionCategory === '個別'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-green-100 text-green-800'
        }`}>
          {order.constructionCategory}
        </span>
      </td>
      {/* 工事種別 */}
      <td className="hidden md:table-cell px-4 py-3 whitespace-nowrap text-sm text-gray-500">
        {order.workType}
      </td>
      {/* クロージャ番号 */}
      <td className="hidden xl:table-cell px-4 py-3 whitespace-nowrap text-sm text-gray-500">
        {order.closureNumber || '—'}
      </td>
      {/* 顧客コード */}
      <td className="hidden xl:table-cell px-4 py-3 whitespace-nowrap text-sm text-gray-500">
        {order.customerCode}
      </td>
      {/* 顧客名 */}
      <td className="px-4 py-3 text-sm text-gray-500">
        <div className="whitespace-nowrap truncate" title={order.customerName}>
          {order.customerName}
        </div>
      </td>
      {/* 顧客名カナ */}
      <td className="hidden lg:table-cell px-4 py-3 text-sm text-gray-400">
        <div className="whitespace-nowrap truncate" title={order.customerNameKana}>
          {order.customerNameKana}
        </div>
      </td>
      {/* 集合住宅コード */}
      <td className="hidden xl:table-cell px-4 py-3 whitespace-nowrap text-sm text-gray-500">
        {order.collectiveCode || '—'}
      </td>
      {/* 集合住宅名 */}
      <td className="hidden xl:table-cell px-4 py-3 text-sm text-gray-500">
        <div className="whitespace-nowrap truncate" title={order.collectiveHousingName || '—'}>
          {order.collectiveHousingName || '—'}
        </div>
      </td>
      {/* 集合住宅名カナ */}
      <td className="hidden xl:table-cell px-4 py-3 text-sm text-gray-400">
        <div className="whitespace-nowrap truncate" title={order.collectiveHousingNameKana || '—'}>
          {order.collectiveHousingNameKana || '—'}
        </div>
      </td>
      {/* 新規/既存 */}
      <td className="hidden lg:table-cell px-4 py-3 whitespace-nowrap text-sm text-gray-500">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          order.customerType === '新規'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {order.customerType}
        </span>
      </td>
      {/* ステータス */}
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          order.orderStatus === 'キャンセル'
            ? 'bg-red-100 text-red-800'
            : 'bg-green-100 text-green-800'
        }`}>
          {order.orderStatus || 'アクティブ'}
        </span>
      </td>
      {/* 詳細 */}
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
        <button
          onClick={() => onViewDetails(order)}
          className="inline-flex items-center text-blue-600 hover:text-blue-900"
        >
          <EyeIcon className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">詳細</span>
        </button>
      </td>
      {/* アポイント履歴 */}
      <td className="hidden lg:table-cell px-4 py-3 whitespace-nowrap text-sm text-gray-500">
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
      {/* 編集 */}
      <td className="hidden md:table-cell px-4 py-3 whitespace-nowrap text-sm text-gray-500">
        <button
          onClick={() => onEditOrder(order)}
          className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          title="編集"
        >
          <PencilSquareIcon className="h-4 w-4 mr-1" />
          編集
        </button>
      </td>
    </tr>
  )
}
