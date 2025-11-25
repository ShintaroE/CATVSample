import { useState, useMemo } from 'react'
import {
  filterByOrderNumber,
  filterByPropertyType,
  filterByCustomerCode,
  filterByCollectiveCode,
  filterByContractor,
  filterByTeam
} from '../lib/filterUtils'

/**
 * 申請管理画面共通フィルター定義
 *
 * 3つのタブ（Survey、Attachment、Construction）で共有される
 * 基本的なフィルター項目を定義
 */
export interface BaseApplicationFilters {
  orderNumber: string
  propertyType: '' | '個別' | '集合'
  customerCode: string
  collectiveCode: string
  contractorId: string
  teamId: string
}

/**
 * フィルター可能な申請データの最小インターフェース
 */
export interface FilterableApplicationData {
  orderNumber?: string
  propertyType?: '個別' | '集合'
  customerCode?: string
  collectiveCode?: string
  contractorId?: string
  teamId?: string
}

/**
 * デフォルトフィルター値
 */
const defaultBaseFilters: BaseApplicationFilters = {
  orderNumber: '',
  propertyType: '',
  customerCode: '',
  collectiveCode: '',
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
   * - 顧客コード: 個別物件のみチェック、集合物件は除外しない
   * - 集合コード: 集合物件のみチェック、個別物件は除外しない
   * - 班フィルター: 依頼先フィルター不要（独立して動作）
   */
  const baseFilteredData = useMemo(() => {
    let result = data

    // 受注番号フィルター
    result = filterByOrderNumber(result, filters.orderNumber)

    // 物件種別フィルター
    result = filterByPropertyType(result, filters.propertyType)

    // 顧客コードフィルター（個別物件のみ）
    result = filterByCustomerCode(result, filters.customerCode)

    // 集合コードフィルター（集合物件のみ）
    result = filterByCollectiveCode(result, filters.collectiveCode)

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
        // 個別 → 集合 に変更された場合、顧客コードをクリア
        if (value === '集合' && prev.propertyType === '個別') {
          newFilters.customerCode = ''
        }
        // 集合 → 個別 に変更された場合、集合コードをクリア
        if (value === '個別' && prev.propertyType === '集合') {
          newFilters.collectiveCode = ''
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
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.orderNumber) count++
    if (filters.propertyType) count++
    if (filters.customerCode) count++
    if (filters.collectiveCode) count++
    if (filters.contractorId) count++
    if (filters.teamId) count++
    return count
  }, [filters])

  /**
   * フィルター適用状態の判定
   */
  const hasActiveFilters = useMemo(() => {
    return activeFilterCount > 0
  }, [activeFilterCount])

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
