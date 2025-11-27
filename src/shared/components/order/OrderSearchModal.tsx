import React from 'react'
import { Dialog } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { OrderData } from '@/app/orders/types'
import { useOrderSearch } from '@/shared/hooks/useOrderSearch'
import OrderSearchFilters from './OrderSearchFilters'
import OrderSearchTable from './OrderSearchTable'
import { Badge } from '@/shared/components/ui'

interface OrderSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (order: OrderData) => void
}

export default function OrderSearchModal({ isOpen, onClose, onSelect }: OrderSearchModalProps) {
  const {
    filters,
    setFilters,
    clearFilters,
    filteredOrders,
    totalCount,
    filteredCount,
  } = useOrderSearch()

  const handleSelect = (order: OrderData) => {
    onSelect(order)
    onClose()
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* オーバーレイ */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* モーダル */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-5xl w-full bg-white rounded-lg shadow-xl">
          {/* ヘッダー */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              受注情報検索
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* コンテンツ */}
          <div className="px-6 py-4 space-y-4">
            {/* フィルター */}
            <OrderSearchFilters
              filters={filters}
              onFilterChange={setFilters}
              onClearFilters={clearFilters}
            />

            {/* 検索結果ヘッダー */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">検索結果</h3>
              <div className="flex gap-2">
                <Badge variant={filteredCount !== totalCount ? 'info' : 'default'} size="sm">
                  表示: {filteredCount}件
                </Badge>
                <Badge variant="default" size="sm">
                  全: {totalCount}件
                </Badge>
              </div>
            </div>

            {/* テーブル */}
            <OrderSearchTable
              orders={filteredOrders}
              onSelect={handleSelect}
            />
          </div>

          {/* フッター */}
          <div className="flex justify-end px-6 py-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              キャンセル
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
