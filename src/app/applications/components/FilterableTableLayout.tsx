import React, { ReactNode } from 'react'
import { FunnelIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import { Badge } from '@/shared/components/ui'

interface FilterableTableLayoutProps {
    totalCount: number
    filteredCount: number
    onClearFilters: () => void
    filters: ReactNode
    children: ReactNode
}

export default function FilterableTableLayout({
    totalCount,
    filteredCount,
    onClearFilters,
    filters,
    children,
}: FilterableTableLayoutProps) {
    return (
        <div className="w-full max-w-full overflow-x-hidden">
            {/* 絞り込みパネル */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 w-full max-w-full">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3 w-full">
                    <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                        <FunnelIcon className="w-4 h-4 mr-1.5" />
                        絞り込み条件
                    </h3>
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
                            <Badge variant="default" size="sm" className="font-normal">
                                全: {totalCount}件
                            </Badge>
                        </div>
                    </div>
                </div>

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

            {/* テーブル */}
            <div className="w-full overflow-x-auto bg-white rounded-lg shadow">
                {children}
            </div>
        </div>
    )
}
