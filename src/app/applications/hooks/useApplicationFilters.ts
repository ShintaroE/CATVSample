import { useState, useMemo } from 'react'
import {
  filterByOrderNumber,
  filterByPropertyType,
  filterByCustomerCode,
  filterByCollectiveCode,
  filterByCustomerName,
  filterByCollectiveHousingName,
  filterByContractor,
  filterByTeam,
  filterByPhoneNumber
} from '../lib/filterUtils'

/**
 * 申請管理画面共通フィルター定義
 *
 * 3つのタブ（Survey、Attachment、Construction）で共有される
 * 基本的なフィルター項目を定義
 */
export interface BaseApplicationFilters {
  orderNumber: string
  phoneNumber: string
  propertyType: '' | '個別' | '集合'
  customerCode: string
  customerName: string  // 顧客名・顧客名カナの統合検索
  collectiveCode: string
  collectiveHousingName: string  // 集合住宅名・集合住宅名カナの統合検索
  contractorId: string
  teamId: string
}

/**
 * フィルター可能な申請データの最小インターフェース
 */
export interface FilterableApplicationData {
  orderNumber?: string
  phoneNumber?: string
  propertyType?: '個別' | '集合'
  customerCode?: string
  customerName?: string
  customerNameKana?: string
  collectiveCode?: string
  collectiveHousingName?: string
  collectiveHousingNameKana?: string
  contractorId?: string
  teamId?: string
}

/**
 * デフォルトフィルター値
 */
const defaultBaseFilters: BaseApplicationFilters = {
  orderNumber: '',
  phoneNumber: '',
  propertyType: '',
  customerCode: '',
  customerName: '',
  collectiveCode: '',
  collectiveHousingName: '',
  contractorId: '',
  teamId: ''
}

/**
 * 申請管理画面共通フィルターフック
 *
 * 3つのタブで共通のフィルタリングロジックを提供します。
 * 各タブは、このフックから返される baseFilteredData に対して
 * タブ固有のフィルターを追加で適用できます。
 *
 * @example
 * // Surveyタブでの使用例
 * const {
 *   filters,
 *   baseFilteredData,
 *   updateFilter,
 *   clearFilters,
 *   activeFilterCount
 * } = useApplicationFilters(surveyData)
 *
 * // タブ固有のフィルターを追加適用
 * const finalFiltered = useMemo(() => {
 *   return baseFilteredData.filter(item => {
 *     // Survey固有のフィルター条件
 *     return true
 *   })
 * }, [baseFilteredData])
 */
export function useApplicationFilters<T extends FilterableApplicationData>(
  data: T[]
) {
  const [filters, setFilters] = useState<BaseApplicationFilters>(defaultBaseFilters)

  /**
   * 基本フィルター適用後のデータ
   *
   * 統一仕様:
   * - 受注番号: 部分一致、大文字小文字区別なし
   * - 電話番号: 部分一致、ハイフン無視
   * - 顧客コード: 個別物件のみチェック、集合物件は除外しない
   * - 顧客名: 個別物件のみ、顧客名 OR 顧客名カナで部分一致
   * - 集合コード: 集合物件のみチェック、個別物件は除外しない
   * - 集合住宅名: 集合物件のみ、集合住宅名 OR 集合住宅名カナで部分一致
   * - 班フィルター: 依頼先フィルター不要（独立して動作）
   */
  const baseFilteredData = useMemo(() => {
    let result = data

    // 受注番号フィルター
    result = filterByOrderNumber(result, filters.orderNumber)

    // 電話番号フィルター
    result = filterByPhoneNumber(result, filters.phoneNumber)

    // 物件種別フィルター
    result = filterByPropertyType(result, filters.propertyType)

    // 顧客コードフィルター（個別物件のみ）
    result = filterByCustomerCode(result, filters.customerCode)

    // 顧客名フィルター（個別物件のみ、顧客名 OR 顧客名カナ）
    result = filterByCustomerName(result, filters.customerName)

    // 集合コードフィルター（集合物件のみ）
    result = filterByCollectiveCode(result, filters.collectiveCode)

    // 集合住宅名フィルター（集合物件のみ、集合住宅名 OR 集合住宅名カナ）
    result = filterByCollectiveHousingName(result, filters.collectiveHousingName)

    // 依頼先フィルター
    result = filterByContractor(result, filters.contractorId)

    // 班フィルター（独立動作）
    result = filterByTeam(result, filters.teamId)

    return result
  }, [data, filters])

  /**
   * フィルター更新
   */
  const updateFilter = <K extends keyof BaseApplicationFilters>(
    key: K,
    value: BaseApplicationFilters[K]
  ) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value }

      // 物件種別が変更された場合、関連フィルターをリセット
      if (key === 'propertyType') {
        // 個別 → 集合 に変更された場合、顧客コード・顧客名をクリア
        if (value === '集合' && prev.propertyType === '個別') {
          newFilters.customerCode = ''
          newFilters.customerName = ''
        }
        // 集合 → 個別 に変更された場合、集合コード・集合住宅名をクリア
        if (value === '個別' && prev.propertyType === '集合') {
          newFilters.collectiveCode = ''
          newFilters.collectiveHousingName = ''
        }
      }

      // 依頼先が変更された場合、班をリセット（班は独立動作だが、UX向上のため）
      if (key === 'contractorId') {
        newFilters.teamId = ''
      }

      return newFilters
    })
  }

  /**
   * フィルタークリア
   */
  const clearFilters = () => {
    setFilters(defaultBaseFilters)
  }

  /**
   * アクティブフィルター数
   */
  let activeFilterCount = 0
  if (filters.orderNumber) activeFilterCount++
  if (filters.phoneNumber) activeFilterCount++
  if (filters.propertyType) activeFilterCount++
  if (filters.customerCode) activeFilterCount++
  if (filters.customerName) activeFilterCount++
  if (filters.collectiveCode) activeFilterCount++
  if (filters.collectiveHousingName) activeFilterCount++
  if (filters.contractorId) activeFilterCount++
  if (filters.teamId) activeFilterCount++

  /**
   * フィルター適用状態の判定
   */
  const hasActiveFilters = activeFilterCount > 0

  return {
    filters,
    baseFilteredData,
    updateFilter,
    clearFilters,
    activeFilterCount,
    hasActiveFilters,
    totalCount: data.length,
    baseFilteredCount: baseFilteredData.length
  }
}
