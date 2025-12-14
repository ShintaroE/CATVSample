/**
 * 申請管理画面共通フィルターユーティリティ
 *
 * 3つのタブ（Survey、Attachment、Construction）で使用される
 * 共通のフィルタリングロジックを提供します。
 */

import { hiraganaToKatakana } from '@/shared/utils/formatters'

/**
 * 受注番号フィルター（部分一致、大文字小文字区別なし）
 *
 * 統一仕様: すべてのタブで大文字小文字を区別しない
 */
export function filterByOrderNumber<T extends { orderNumber?: string }>(
  items: T[],
  orderNumber: string
): T[] {
  if (!orderNumber) return items
  const lowerQuery = orderNumber.toLowerCase()
  return items.filter(item =>
    (item.orderNumber || '').toLowerCase().includes(lowerQuery)
  )
}

/**
 * 物件種別フィルター
 */
export function filterByPropertyType<T extends { propertyType?: '個別' | '集合' }>(
  items: T[],
  propertyType: '' | '個別' | '集合'
): T[] {
  if (!propertyType) return items
  return items.filter(item => item.propertyType === propertyType)
}

/**
 * 顧客コードフィルター（個別物件のみ、部分一致）
 *
 * 統一仕様: 個別物件のみチェック、それ以外は無視（除外しない）
 * - 個別物件: 顧客コードで部分一致チェック
 * - 集合物件: フィルター無視（結果に含める）
 */
export function filterByCustomerCode<T extends {
  propertyType?: '個別' | '集合'
  customerCode?: string
}>(
  items: T[],
  customerCode: string
): T[] {
  if (!customerCode) return items
  const lowerQuery = customerCode.toLowerCase()

  return items.filter(item => {
    // 個別物件の場合のみチェック
    if (item.propertyType === '個別') {
      return (item.customerCode || '').toLowerCase().includes(lowerQuery)
    }
    // 集合物件は無視（除外しない）
    return true
  })
}

/**
 * 集合コードフィルター（集合物件のみ、部分一致）
 *
 * 統一仕様: 集合物件のみチェック、それ以外は無視（除外しない）
 * - 集合物件: 集合コードで部分一致チェック
 * - 個別物件: フィルター無視（結果に含める）
 */
export function filterByCollectiveCode<T extends {
  propertyType?: '個別' | '集合'
  collectiveCode?: string
}>(
  items: T[],
  collectiveCode: string
): T[] {
  if (!collectiveCode) return items
  const lowerQuery = collectiveCode.toLowerCase()

  return items.filter(item => {
    // 集合物件の場合のみチェック
    if (item.propertyType === '集合') {
      return (item.collectiveCode || '').toLowerCase().includes(lowerQuery)
    }
    // 個別物件は無視（除外しない）
    return true
  })
}

/**
 * 依頼先フィルター
 */
export function filterByContractor<T extends { contractorId?: string }>(
  items: T[],
  contractorId: string
): T[] {
  if (!contractorId) return items
  return items.filter(item => item.contractorId === contractorId)
}

/**
 * 班フィルター
 *
 * 統一仕様: 独立して動作（依頼先フィルター不要）
 */
export function filterByTeam<T extends { teamId?: string }>(
  items: T[],
  teamId: string
): T[] {
  if (!teamId) return items
  return items.filter(item => item.teamId === teamId)
}

/**
 * 電話番号を正規化（ハイフンと空白を除去）
 */
export function normalizePhoneNumber(phone: string): string {
  return phone.replace(/[-\s]/g, '')
}

/**
 * 電話番号フィルター（部分一致、ハイフン無視）
 *
 * ハイフンと空白を除去した状態で部分一致検索を行います。
 * 例: "086-123-4567" と "0861234567" は同じ番号として扱われます。
 */
export function filterByPhoneNumber<T extends { phoneNumber?: string }>(
  items: T[],
  phoneNumber: string
): T[] {
  if (!phoneNumber) return items
  const normalizedQuery = normalizePhoneNumber(phoneNumber.trim())

  return items.filter(item => {
    if (!item.phoneNumber) return false
    const normalizedPhone = normalizePhoneNumber(item.phoneNumber)
    return normalizedPhone.includes(normalizedQuery)
  })
}

/**
 * 顧客名・顧客名カナフィルター（個別物件のみ、部分一致）
 *
 * 統一仕様: 1つの検索欄で顧客名と顧客名カナの両方を検索
 * - 個別物件: 顧客名 OR 顧客名カナで部分一致チェック
 * - 集合物件: フィルター無視（結果に含める）
 * - ひらがな入力対応: 検索クエリをカタカナに変換して検索
 */
export function filterByCustomerName<T extends {
  propertyType?: '個別' | '集合'
  customerName?: string
  customerNameKana?: string
}>(
  items: T[],
  searchQuery: string
): T[] {
  if (!searchQuery) return items

  // ひらがなをカタカナに変換（カタカナはそのまま）
  const normalizedQuery = hiraganaToKatakana(searchQuery.toLowerCase())

  return items.filter(item => {
    // 個別物件の場合のみチェック
    if (item.propertyType === '個別') {
      const customerName = hiraganaToKatakana((item.customerName || '').toLowerCase())
      const customerNameKana = hiraganaToKatakana((item.customerNameKana || '').toLowerCase())
      return customerName.includes(normalizedQuery) || customerNameKana.includes(normalizedQuery)
    }
    // 集合物件は無視（除外しない）
    return true
  })
}

/**
 * 集合住宅名・集合住宅名カナフィルター（集合物件のみ、部分一致）
 *
 * 統一仕様: 1つの検索欄で集合住宅名と集合住宅名カナの両方を検索
 * - 集合物件: 集合住宅名 OR 集合住宅名カナで部分一致チェック
 * - 個別物件: フィルター無視（結果に含める）
 * - ひらがな入力対応: 検索クエリをカタカナに変換して検索
 */
export function filterByCollectiveHousingName<T extends {
  propertyType?: '個別' | '集合'
  collectiveHousingName?: string
  collectiveHousingNameKana?: string
}>(
  items: T[],
  searchQuery: string
): T[] {
  if (!searchQuery) return items

  // ひらがなをカタカナに変換（カタカナはそのまま）
  const normalizedQuery = hiraganaToKatakana(searchQuery.toLowerCase())

  return items.filter(item => {
    // 集合物件の場合のみチェック
    if (item.propertyType === '集合') {
      const housingName = hiraganaToKatakana((item.collectiveHousingName || '').toLowerCase())
      const housingNameKana = hiraganaToKatakana((item.collectiveHousingNameKana || '').toLowerCase())
      return housingName.includes(normalizedQuery) || housingNameKana.includes(normalizedQuery)
    }
    // 個別物件は無視（除外しない）
    return true
  })
}

/**
 * アクティブフィルター数をカウント
 *
 * 文字列フィルターは空文字列でないことをチェック
 * ブーリアンフィルターはtrueであることをチェック
 */
export function countActiveFilters(filters: Record<string, string | boolean>): number {
  return Object.entries(filters).reduce((count, [, value]) => {
    if (typeof value === 'string' && value !== '' && value !== 'all') {
      return count + 1
    }
    if (typeof value === 'boolean' && value) {
      return count + 1
    }
    return count
  }, 0)
}
