import { useState, useMemo } from 'react'
import { OrderData, ConstructionCategory, IndividualWorkType, CollectiveWorkType, OrderStatus } from '../types'

export interface OrderFilters {
  orderNumber: string
  constructionCategory: ConstructionCategory | 'all'
  workType: IndividualWorkType | CollectiveWorkType | 'all'
  customerCode: string
  apartmentCode: string
  orderStatus: OrderStatus | 'all'
  customerType: '新規' | '既存' | 'all'
}

const defaultFilters: OrderFilters = {
  orderNumber: '',
  constructionCategory: 'all',
  workType: 'all',
  customerCode: '',
  apartmentCode: '',
  orderStatus: 'all',
  customerType: 'all'
}

export function useOrderFilters(orders: OrderData[]) {
  const [filters, setFilters] = useState<OrderFilters>(defaultFilters)

  // フィルター適用後の注文リスト
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // 受注番号フィルター（部分一致、大文字小文字区別なし）
      if (filters.orderNumber &&
        !order.orderNumber.toLowerCase().includes(filters.orderNumber.toLowerCase())) {
        return false
      }

      // 個別/集合フィルター
      if (filters.constructionCategory !== 'all' && order.constructionCategory !== filters.constructionCategory) {
        return false
      }

      // 工事種別フィルター
      if (filters.workType !== 'all' && order.workType !== filters.workType) {
        return false
      }

      // 顧客コードフィルター（部分一致）
      if (filters.customerCode &&
        !order.customerCode.includes(filters.customerCode)) {
        return false
      }

      // 集合コードフィルター（部分一致、apartmentCodeが存在する場合のみ）
      if (filters.apartmentCode && order.apartmentCode &&
        !order.apartmentCode.includes(filters.apartmentCode)) {
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

      // 個別/集合が変更された場合、工事種別をリセット
      if (key === 'constructionCategory') {
        newFilters.workType = 'all'
      }

      return newFilters
    })
  }

  // フィルタークリア
  const clearFilters = () => {
    setFilters(defaultFilters)
  }

  // フィルター適用状態の判定
  const hasActiveFilters = useMemo(() => {
    return Object.entries(filters).some(([key, value]) => {
      if (key === 'orderNumber' || key === 'customerCode' || key === 'apartmentCode') {
        return value !== ''
      }
      return value !== 'all'
    })
  }, [filters])

  return {
    filters,
    filteredOrders,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    totalCount: orders.length,
    filteredCount: filteredOrders.length
  }
}
