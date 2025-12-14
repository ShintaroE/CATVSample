import { useState, useEffect, useMemo } from 'react'
import { OrderData, ConstructionCategory } from '@/app/orders/types'
import { orderStorage } from '@/app/orders/lib/orderStorage'

export interface OrderSearchFilters {
  orderNumber: string
  customerName: string  // 顧客名・顧客名カナの統合検索
  customerCode: string
  phoneNumber: string
  address: string
  constructionCategory: '' | ConstructionCategory
  workType: string
  collectiveHousingName: string  // 集合住宅名・集合住宅名カナの統合検索
}

const initialFilters: OrderSearchFilters = {
  orderNumber: '',
  customerName: '',
  customerCode: '',
  phoneNumber: '',
  address: '',
  constructionCategory: '',
  workType: '',
  collectiveHousingName: '',
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
      // 顧客名（顧客名 OR 顧客名カナで部分一致）
      if (filters.customerName) {
        const lowerQuery = filters.customerName.toLowerCase()
        const customerName = (order.customerName || '').toLowerCase()
        const customerNameKana = (order.customerNameKana || '').toLowerCase()
        if (!customerName.includes(lowerQuery) && !customerNameKana.includes(lowerQuery)) {
          return false
        }
      }
      // 顧客コード
      if (filters.customerCode && !order.customerCode.includes(filters.customerCode)) {
        return false
      }
      // 電話番号（ハイフン無視）
      if (filters.phoneNumber) {
        const normalizePhone = (phone: string) => phone.replace(/[-\s]/g, '')
        const normalizedQuery = normalizePhone(filters.phoneNumber.trim())
        if (!order.phoneNumber) {
          return false
        }
        const normalizedOrderPhone = normalizePhone(order.phoneNumber)
        if (!normalizedOrderPhone.includes(normalizedQuery)) {
          return false
        }
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
      // 集合住宅名（集合住宅名 OR 集合住宅名カナで部分一致）
      if (filters.collectiveHousingName && order.collectiveHousingName) {
        const lowerQuery = filters.collectiveHousingName.toLowerCase()
        const housingName = (order.collectiveHousingName || '').toLowerCase()
        const housingNameKana = (order.collectiveHousingNameKana || '').toLowerCase()
        if (!housingName.includes(lowerQuery) && !housingNameKana.includes(lowerQuery)) {
          return false
        }
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
