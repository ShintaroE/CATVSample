import React, { ReactNode, useState } from 'react'
import { ChartBarIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'
import { Badge } from '@/shared/components/ui'

interface FilterableTableLayoutProps {
    totalCount: number
    filteredCount: number
    activeFilterCount?: number
    onClearFilters: () => void
    filters: ReactNode
    children: ReactNode
}

export default function FilterableTableLayout({
    totalCount,
    filteredCount,
    activeFilterCount = 0,
    onClearFilters,
    filters,
    children,
}: FilterableTableLayoutProps) {
    const [isOpen, setIsOpen] = useState(true)

    return (
        <div className="w-full max-w-full overflow-x-hidden">
            {/* 絞り込みパネル */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg mb-4 w-full max-w-full">
                {/* アコーディオンヘッダー */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-100 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        {isOpen ? (
                            <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                        ) : (
                            <ChevronUpIcon className="w-5 h-5 text-gray-500" />
                        )}
                        <h3 className="text-sm font-semibold text-gray-700">絞り込み条件</h3>
                        {activeFilterCount > 0 && (
                            <Badge variant="info" size="sm">
                                {activeFilterCount}件のフィルター適用中
                            </Badge>
                        )}
                    </div>
                    {/* 表示件数 */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="flex items-center gap-1.5">
                            <ChartBarIcon className="w-4 h-4 text-gray-500" />
                            <Badge
                                variant={filteredCount !== totalCount ? 'info' : 'default'}
                                size="sm"
                                className="font-semibold"
                            >
                                表示: {filteredCount}件
                            </Badge>
                        </div>
                    </div>
                </button>

                {/* アコーディオンコンテンツ */}
                <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                >
                    <div className="p-4 pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                            {filters}
                        </div>

                        {/* クリアボタン */}
                        <div className="flex justify-end mt-4 w-full">
                            <button
                                onClick={onClearFilters}
                                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex-shrink-0"
                            >
                                クリア
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* テーブル */}
            <div className="w-full overflow-x-auto bg-white rounded-lg shadow">
                {children}
            </div>
        </div>
    )
}
