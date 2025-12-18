import React from 'react'
import { Dialog } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { OrderData } from '@/app/orders/types'
import { useOrderSearch } from '@/shared/hooks/useOrderSearch'
import OrderSearchFilters from './OrderSearchFilters'
import OrderSearchTable from './OrderSearchTable'
import { Badge, Button } from '@/shared/components/ui'

interface OrderSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (order: OrderData) => void
}

export default function OrderSearchModal({ isOpen, onClose, onSelect }: OrderSearchModalProps) {
  const {
    inputFilters,
    setInputFilters,
    executeSearch,
    clearInputFilters,
    isSearching,
    filteredOrders,
    totalCount,
    filteredCount,
  } = useOrderSearch()

  const handleSelect = (order: OrderData) => {
    onSelect(order)
    onClose()
  }

  const handleSearch = () => {
    executeSearch()
  }

  const handleClear = () => {
    clearInputFilters()
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* オーバーレイ */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* モーダル */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-5xl w-full bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          {/* ヘッダー */}
          <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-gray-200 z-10">
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
              filters={inputFilters}
              onFilterChange={setInputFilters}
            />

            {/* 検索ボタンエリア */}
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
              <Button
                onClick={handleSearch}
                variant="primary"
                size="md"
                disabled={isSearching}
              >
                {isSearching ? '検索中...' : '検索'}
              </Button>
              <Button
                onClick={handleClear}
                variant="secondary"
                size="md"
              >
                クリア
              </Button>
            </div>

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
          <div className="sticky bottom-0 bg-white flex justify-end px-6 py-4 border-t border-gray-200 z-10">
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
