import { useState, useMemo } from 'react'
import { OrderData, ConstructionCategory, IndividualWorkType, CollectiveWorkType, OrderStatus } from '../types'

export interface AdditionalCostsFilter {
  enabled: boolean
  closureExpansion: boolean
  roadApplication: boolean
  otherCompanyRepair: boolean
  nwEquipment: boolean
  serviceLineApplication: boolean
}

export interface OrderFilters {
  orderNumber: string
  phoneNumber: string
  constructionCategory: ConstructionCategory | 'all'
  workType: IndividualWorkType | CollectiveWorkType | 'all'
  customerCode: string
  collectiveCode: string
  orderStatus: OrderStatus | 'all'
  customerType: '新規' | '既存' | 'all'
  additionalCosts: AdditionalCostsFilter
}

const defaultFilters: OrderFilters = {
  orderNumber: '',
  phoneNumber: '',
  constructionCategory: 'all',
  workType: 'all',
  customerCode: '',
  collectiveCode: '',
  orderStatus: 'all',
  customerType: 'all',
  additionalCosts: {
    enabled: false,
    closureExpansion: false,
    roadApplication: false,
    otherCompanyRepair: false,
    nwEquipment: false,
    serviceLineApplication: false
  }
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

      // 電話番号フィルター（部分一致、ハイフン無視）
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

      // 集合コードフィルター（部分一致、collectiveCodeが存在する場合のみ）
      if (filters.collectiveCode && order.collectiveCode &&
        !order.collectiveCode.includes(filters.collectiveCode)) {
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

      // 追加費用フィルター（OR条件：いずれかにチェックが入っている項目が必須の注文を表示）
      if (filters.additionalCosts.enabled) {
        const additionalCosts = order.additionalCosts
        if (!additionalCosts) {
          return false
        }

        const matchesAny = (
          (filters.additionalCosts.closureExpansion && additionalCosts.closureExpansion.required === 'required') ||
          (filters.additionalCosts.roadApplication && additionalCosts.roadApplication.required === 'required') ||
          (filters.additionalCosts.otherCompanyRepair && additionalCosts.otherCompanyRepair.required === 'required') ||
          (filters.additionalCosts.nwEquipment && additionalCosts.nwEquipment.required === 'required') ||
          (filters.additionalCosts.serviceLineApplication && additionalCosts.serviceLineApplication.required === 'required')
        )

        if (!matchesAny) {
          return false
        }
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
  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'orderNumber' || key === 'customerCode' || key === 'collectiveCode') {
      return value !== ''
    }
    if (key === 'additionalCosts') {
      return (value as AdditionalCostsFilter).enabled
    }
    return value !== 'all'
  })

  // 適用中のフィルター数をカウント
  let activeFilterCount = 0
  Object.entries(filters).forEach(([key, value]) => {
    if (key === 'orderNumber' || key === 'phoneNumber' || key === 'customerCode' || key === 'collectiveCode') {
      if (value !== '') activeFilterCount++
    } else if (key === 'additionalCosts') {
      if ((value as AdditionalCostsFilter).enabled) activeFilterCount++
    } else {
      if (value !== 'all') activeFilterCount++
    }
  })

  return {
    filters,
    filteredOrders,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    activeFilterCount,
    totalCount: orders.length,
    filteredCount: filteredOrders.length
  }
}
