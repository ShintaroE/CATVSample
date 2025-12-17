import { useState, useMemo } from 'react'
import { OrderData, ConstructionCategory, IndividualWorkType, CollectiveWorkType, OrderStatus } from '../types'
import { hiraganaToKatakana } from '@/shared/utils/formatters'

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
  customerName: string  // 顧客名・顧客名カナの統合検索
  collectiveCode: string
  collectiveHousingName: string  // 集合住宅名・集合住宅名カナの統合検索
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
  customerName: '',
  collectiveCode: '',
  collectiveHousingName: '',
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
  // 入力用フィルター（フォームにバインド）
  const [inputFilters, setInputFilters] = useState<OrderFilters>(defaultFilters)

  // 検索実行後のフィルター（データ絞り込みに使用）
  const [searchFilters, setSearchFilters] = useState<OrderFilters>(defaultFilters)

  // 検索中フラグ
  const [isSearching, setIsSearching] = useState(false)

  // フィルター適用後の注文リスト（searchFiltersを使用）
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // 受注番号フィルター（部分一致、大文字小文字区別なし）
      if (searchFilters.orderNumber &&
        !order.orderNumber.toLowerCase().includes(searchFilters.orderNumber.toLowerCase())) {
        return false
      }

      // 電話番号フィルター（部分一致、ハイフン無視）
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

      // 個別/集合フィルター
      if (searchFilters.constructionCategory !== 'all' && order.constructionCategory !== searchFilters.constructionCategory) {
        return false
      }

      // 工事種別フィルター
      if (searchFilters.workType !== 'all' && order.workType !== searchFilters.workType) {
        return false
      }

      // 顧客コードフィルター（部分一致）
      if (searchFilters.customerCode &&
        !order.customerCode.includes(searchFilters.customerCode)) {
        return false
      }

      // 顧客名フィルター（顧客名 OR 顧客名カナで部分一致、ひらがな対応）
      if (searchFilters.customerName) {
        const normalizedQuery = hiraganaToKatakana(searchFilters.customerName.toLowerCase())
        const customerName = hiraganaToKatakana((order.customerName || '').toLowerCase())
        const customerNameKana = hiraganaToKatakana((order.customerNameKana || '').toLowerCase())
        if (!customerName.includes(normalizedQuery) && !customerNameKana.includes(normalizedQuery)) {
          return false
        }
      }

      // 集合コードフィルター（部分一致、collectiveCodeが存在する場合のみ）
      if (searchFilters.collectiveCode && order.collectiveCode &&
        !order.collectiveCode.includes(searchFilters.collectiveCode)) {
        return false
      }

      // 集合住宅名フィルター（集合住宅名 OR 集合住宅名カナで部分一致、ひらがな対応）
      if (searchFilters.collectiveHousingName && order.collectiveHousingName) {
        const normalizedQuery = hiraganaToKatakana(searchFilters.collectiveHousingName.toLowerCase())
        const housingName = hiraganaToKatakana((order.collectiveHousingName || '').toLowerCase())
        const housingNameKana = hiraganaToKatakana((order.collectiveHousingNameKana || '').toLowerCase())
        if (!housingName.includes(normalizedQuery) && !housingNameKana.includes(normalizedQuery)) {
          return false
        }
      }

      // 受注ステータスフィルター
      const currentOrderStatus = order.orderStatus || 'アクティブ'
      if (searchFilters.orderStatus !== 'all' && currentOrderStatus !== searchFilters.orderStatus) {
        return false
      }

      // 顧客タイプフィルター
      if (searchFilters.customerType !== 'all' && order.customerType !== searchFilters.customerType) {
        return false
      }

      // 追加費用フィルター（OR条件：いずれかにチェックが入っている項目が必須の注文を表示）
      if (searchFilters.additionalCosts.enabled) {
        const additionalCosts = order.additionalCosts
        if (!additionalCosts) {
          return false
        }

        const matchesAny = (
          (searchFilters.additionalCosts.closureExpansion && additionalCosts.closureExpansion.required === 'required') ||
          (searchFilters.additionalCosts.roadApplication && additionalCosts.roadApplication.required === 'required') ||
          (searchFilters.additionalCosts.otherCompanyRepair && additionalCosts.otherCompanyRepair.required === 'required') ||
          (searchFilters.additionalCosts.nwEquipment && additionalCosts.nwEquipment.required === 'required') ||
          (searchFilters.additionalCosts.serviceLineApplication && additionalCosts.serviceLineApplication.required === 'required')
        )

        if (!matchesAny) {
          return false
        }
      }

      return true
    })
  }, [orders, searchFilters])

  /**
   * 検索実行
   */
  const executeSearch = () => {
    setIsSearching(true)
    setSearchFilters(inputFilters)
    setTimeout(() => setIsSearching(false), 0)
  }

  /**
   * フィルター更新関数（入力フォーム用）
   */
  const updateInputFilter = <K extends keyof OrderFilters>(key: K, value: OrderFilters[K]) => {
    setInputFilters(prev => {
      const newFilters = { ...prev, [key]: value }

      // 個別/集合が変更された場合、工事種別をリセット
      if (key === 'constructionCategory') {
        newFilters.workType = 'all'
      }

      return newFilters
    })
  }

  /**
   * フィルタークリア（入力フォームのみクリア）
   */
  const clearInputFilters = () => {
    setInputFilters(defaultFilters)
  }

  // フィルター適用状態の判定（searchFiltersを使用）
  const hasActiveFilters = Object.entries(searchFilters).some(([key, value]) => {
    if (key === 'orderNumber' || key === 'customerCode' || key === 'collectiveCode') {
      return value !== ''
    }
    if (key === 'additionalCosts') {
      return (value as AdditionalCostsFilter).enabled
    }
    return value !== 'all'
  })

  // 適用中のフィルター数をカウント（searchFiltersを使用）
  let activeFilterCount = 0
  Object.entries(searchFilters).forEach(([key, value]) => {
    if (key === 'orderNumber' || key === 'phoneNumber' || key === 'customerCode' || key === 'customerName' || key === 'collectiveCode' || key === 'collectiveHousingName') {
      if (value !== '') activeFilterCount++
    } else if (key === 'additionalCosts') {
      if ((value as AdditionalCostsFilter).enabled) activeFilterCount++
    } else {
      if (value !== 'all') activeFilterCount++
    }
  })

  return {
    inputFilters,
    searchFilters,
    filteredOrders,
    updateInputFilter,
    executeSearch,
    clearInputFilters,
    isSearching,
    hasActiveFilters,
    activeFilterCount,
    totalCount: orders.length,
    filteredCount: filteredOrders.length
  }
}
