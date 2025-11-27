import { useState, useEffect, useMemo } from 'react'
import { OrderData, ConstructionCategory } from '@/app/orders/types'
import { orderStorage } from '@/app/orders/lib/orderStorage'

export interface OrderSearchFilters {
  orderNumber: string
  customerName: string
  customerCode: string
  address: string
  constructionCategory: '' | ConstructionCategory
  workType: string
  apartmentName: string
}

const initialFilters: OrderSearchFilters = {
  orderNumber: '',
  customerName: '',
  customerCode: '',
  address: '',
  constructionCategory: '',
  workType: '',
  apartmentName: '',
}

export function useOrderSearch() {
  const [orders, setOrders] = useState<OrderData[]>([])
  const [filters, setFilters] = useState<OrderSearchFilters>(initialFilters)

  // localStorageから全受注データを取得
  useEffect(() => {
    const allOrders = orderStorage.getAll()
    setOrders(allOrders)
  }, [])

  // フィルタリング済みデータ（useMemo使用 - 配列フィルタリング O(n)）
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // 受注番号
      if (filters.orderNumber && !order.orderNumber.includes(filters.orderNumber)) {
        return false
      }
      // 顧客名
      if (filters.customerName && !order.customerName.includes(filters.customerName)) {
        return false
      }
      // 顧客コード
      if (filters.customerCode && !order.customerCode.includes(filters.customerCode)) {
        return false
      }
      // 住所
      if (filters.address && order.address && !order.address.includes(filters.address)) {
        return false
      }
      // 工事区分
      if (filters.constructionCategory && order.constructionCategory !== filters.constructionCategory) {
        return false
      }
      // 工事種別
      if (filters.workType && order.workType !== filters.workType) {
        return false
      }
      // 集合住宅名
      if (filters.apartmentName && order.apartmentName && !order.apartmentName.includes(filters.apartmentName)) {
        return false
      }
      return true
    })
  }, [orders, filters])

  const clearFilters = () => {
    setFilters(initialFilters)
  }

  return {
    orders,
    filters,
    setFilters,
    clearFilters,
    filteredOrders,
    totalCount: orders.length,
    filteredCount: filteredOrders.length,
  }
}
