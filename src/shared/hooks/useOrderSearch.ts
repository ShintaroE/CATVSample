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
  const [inputFilters, setInputFilters] = useState<OrderSearchFilters>(initialFilters)
  const [searchFilters, setSearchFilters] = useState<OrderSearchFilters>(initialFilters)
  const [isSearching, setIsSearching] = useState(false)

  // localStorageから全受注データを取得
  useEffect(() => {
    const allOrders = orderStorage.getAll()
    setOrders(allOrders)
  }, [])

  // フィルタリング済みデータ（useMemo使用 - 配列フィルタリング O(n)）
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // 受注番号
      if (searchFilters.orderNumber && !order.orderNumber.includes(searchFilters.orderNumber)) {
        return false
      }
      // 顧客名（顧客名 OR 顧客名カナで部分一致）
      if (searchFilters.customerName) {
        const lowerQuery = searchFilters.customerName.toLowerCase()
        const customerName = (order.customerName || '').toLowerCase()
        const customerNameKana = (order.customerNameKana || '').toLowerCase()
        if (!customerName.includes(lowerQuery) && !customerNameKana.includes(lowerQuery)) {
          return false
        }
      }
      // 顧客コード
      if (searchFilters.customerCode && !order.customerCode.includes(searchFilters.customerCode)) {
        return false
      }
      // 電話番号（ハイフン無視）
      if (searchFilters.phoneNumber) {
        const normalizePhone = (phone: string) => phone.replace(/[-\s]/g, '')
        const normalizedQuery = normalizePhone(searchFilters.phoneNumber.trim())
        if (!order.phoneNumber) {
          return false
        }
        const normalizedOrderPhone = normalizePhone(order.phoneNumber)
        if (!normalizedOrderPhone.includes(normalizedQuery)) {
          return false
        }
      }
      // 住所
      if (searchFilters.address && order.address && !order.address.includes(searchFilters.address)) {
        return false
      }
      // 工事区分
      if (searchFilters.constructionCategory && order.constructionCategory !== searchFilters.constructionCategory) {
        return false
      }
      // 工事種別
      if (searchFilters.workType && order.workType !== searchFilters.workType) {
        return false
      }
      // 集合住宅名（集合住宅名 OR 集合住宅名カナで部分一致）
      if (searchFilters.collectiveHousingName && order.collectiveHousingName) {
        const lowerQuery = searchFilters.collectiveHousingName.toLowerCase()
        const housingName = (order.collectiveHousingName || '').toLowerCase()
        const housingNameKana = (order.collectiveHousingNameKana || '').toLowerCase()
        if (!housingName.includes(lowerQuery) && !housingNameKana.includes(lowerQuery)) {
          return false
        }
      }
      return true
    })
  }, [orders, searchFilters])

  // 検索実行
  const executeSearch = () => {
    setIsSearching(true)
    setSearchFilters({ ...inputFilters })
    setTimeout(() => setIsSearching(false), 300)
  }

  // クリア（入力フォームのみクリア）
  const clearInputFilters = () => {
    setInputFilters(initialFilters)
  }

  return {
    orders,
    inputFilters,
    searchFilters,
    setInputFilters,
    executeSearch,
    clearInputFilters,
    isSearching,
    filteredOrders,
    totalCount: orders.length,
    filteredCount: filteredOrders.length,
  }
}
