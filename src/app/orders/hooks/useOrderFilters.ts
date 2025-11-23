import { useState, useMemo } from 'react'
import { OrderData, ConstructionCategory, IndividualWorkType, CollectiveWorkType, OrderStatus } from '../types'

export interface OrderFilters {
  constructionCategory: ConstructionCategory | 'all'
  workType: IndividualWorkType | CollectiveWorkType | 'all'
  orderStatus: OrderStatus | 'all'
  customerType: '新規' | '既存' | 'all'
}

const defaultFilters: OrderFilters = {
  constructionCategory: 'all',
  workType: 'all',
  orderStatus: 'all',
  customerType: 'all'
}

export function useOrderFilters(orders: OrderData[]) {
  const [filters, setFilters] = useState<OrderFilters>(defaultFilters)

  // フィルター適用後の注文リスト
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // 工事カテゴリフィルター
      if (filters.constructionCategory !== 'all' && order.constructionCategory !== filters.constructionCategory) {
        return false
      }

      // 工事種別フィルター
      if (filters.workType !== 'all' && order.workType !== filters.workType) {
        return false
      }

      // 受注ステータスフィルター
      const currentOrderStatus = order.orderStatus || 'アクティブ'
      if (filters.orderStatus !== 'all' && currentOrderStatus !== filters.orderStatus) {
        return false
      }

      // 顧客タイプフィルター
      if (filters.customerType !== 'all' && order.customerType !== filters.customerType) {
        return false
      }

      return true
    })
  }, [orders, filters])

  // フィルター更新関数
  const updateFilter = <K extends keyof OrderFilters>(key: K, value: OrderFilters[K]) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value }

      // 工事カテゴリが変更された場合、工事種別をリセット
      if (key === 'constructionCategory') {
        newFilters.workType = 'all'
      }

      return newFilters
    })
  }

  // フィルターリセット
  const resetFilters = () => {
    setFilters(defaultFilters)
  }

  // フィルター適用状態の判定
  const hasActiveFilters = useMemo(() => {
    return Object.entries(filters).some(([, value]) => value !== 'all')
  }, [filters])

  return {
    filters,
    filteredOrders,
    updateFilter,
    resetFilters,
    hasActiveFilters,
    totalCount: orders.length,
    filteredCount: filteredOrders.length
  }
}
