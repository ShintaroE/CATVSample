import React from 'react'
import { OrderData } from '@/app/orders/types'
import { Button } from '@/shared/components/ui'

interface OrderSearchTableProps {
  orders: OrderData[]
  onSelect: (order: OrderData) => void
}

export default function OrderSearchTable({ orders, onSelect }: OrderSearchTableProps) {
  // 住所を省略表示する関数
  const truncateAddress = (address?: string, maxLength = 30) => {
    if (!address) return '-'
    if (address.length <= maxLength) return address
    return address.substring(0, maxLength) + '...'
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-sm">該当する受注情報が見つかりません</p>
        <p className="text-xs mt-1">検索条件を変更してください</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <div className="max-h-96 overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                受注番号
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                顧客名
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                顧客名（カナ）
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                住所
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                工事区分
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                工事種別
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                集合住宅名
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                集合住宅名（カナ）
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                選択
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr
                key={order.orderNumber}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onSelect(order)}
              >
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                  {order.orderNumber}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                  {order.customerName}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-400">
                  {order.customerNameKana || '-'}
                </td>
                <td className="px-3 py-2 text-sm text-gray-900" title={order.address}>
                  {truncateAddress(order.address)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                  {order.constructionCategory}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                  {order.workType}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                  {order.collectiveHousingName || '-'}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-400">
                  {order.collectiveHousingNameKana || '-'}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelect(order)
                    }}
                  >
                    選択
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
