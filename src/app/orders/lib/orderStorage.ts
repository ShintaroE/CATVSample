import { OrderData, AppointmentHistory, AdditionalCosts, AdditionalNotes, CollectiveConstructionInfo, ConstructionCategory } from '../types'
import { STORAGE_KEYS } from '@/lib/constants'
import { orderFileStorage } from './orderFileStorage'
import { sampleOrders } from '@/shared/data'

const STORAGE_KEY = STORAGE_KEYS.ORDERS

/**
 * 工事依頼データのlocalStorage操作
 */
export const orderStorage = {
  /**
   * すべての工事依頼を取得
   */
  getAll(): OrderData[] {
    if (typeof window === 'undefined') return []
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Failed to load orders:', error)
      return []
    }
  },

  /**
   * 工事依頼を保存
   */
  saveAll(orders: OrderData[]): void {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
    } catch (error) {
      console.error('Failed to save orders:', error)
      throw new Error('工事依頼の保存に失敗しました')
    }
  },

  /**
   * 工事依頼を追加
   */
  add(order: OrderData): void {
    const orders = this.getAll()
    orders.push(order)
    this.saveAll(orders)
  },

  /**
   * 工事依頼を更新
   */
  update(orderNumber: string, updates: Partial<OrderData>): void {
    const orders = this.getAll()
    const index = orders.findIndex(o => o.orderNumber === orderNumber)
    if (index !== -1) {
      orders[index] = { ...orders[index], ...updates }
      this.saveAll(orders)
    }
  },

  /**
   * 工事依頼を削除（関連ファイルも削除）
   */
  delete(orderNumber: string): void {
    // 関連ファイルを削除
    orderFileStorage.deleteByOrderNumber(orderNumber)

    // 工事依頼を削除
    const orders = this.getAll().filter(o => o.orderNumber !== orderNumber)
    this.saveAll(orders)
  },

  /**
   * 注文番号で工事依頼を取得
   */
  getByOrderNumber(orderNumber: string): OrderData | undefined {
    return this.getAll().find(o => o.orderNumber === orderNumber)
  },

  /**
   * 顧客コードで工事依頼を取得
   */
  getByCustomerCode(customerCode: string): OrderData[] {
    return this.getAll().filter(o => o.customerCode === customerCode)
  },

  /**
   * 工事区分で工事依頼を取得
   */
  getByConstructionCategory(category: ConstructionCategory): OrderData[] {
    return this.getAll().filter(o => o.constructionCategory === category)
  },

  /**
   * ステータスで工事依頼を取得
   */
  getByStatus(statusType: 'surveyStatus' | 'permissionStatus' | 'constructionStatus', status: string): OrderData[] {
    return this.getAll().filter(o => o[statusType] === status)
  },

  /**
   * アポイント履歴を追加
   */
  addAppointmentHistory(orderNumber: string, appointment: AppointmentHistory): void {
    const orders = this.getAll()
    const index = orders.findIndex(o => o.orderNumber === orderNumber)
    if (index !== -1) {
      if (!orders[index].appointmentHistory) {
        orders[index].appointmentHistory = []
      }
      orders[index].appointmentHistory!.push(appointment)
      this.saveAll(orders)
    }
  },

  /**
   * アポイント履歴を更新
   */
  updateAppointmentHistory(
    orderNumber: string,
    appointmentId: string,
    updates: Partial<AppointmentHistory>
  ): void {
    const orders = this.getAll()
    const orderIndex = orders.findIndex(o => o.orderNumber === orderNumber)
    if (orderIndex !== -1 && orders[orderIndex].appointmentHistory) {
      const appointmentIndex = orders[orderIndex].appointmentHistory!.findIndex(
        a => a.id === appointmentId
      )
      if (appointmentIndex !== -1) {
        orders[orderIndex].appointmentHistory![appointmentIndex] = {
          ...orders[orderIndex].appointmentHistory![appointmentIndex],
          ...updates,
        }
        this.saveAll(orders)
      }
    }
  },

  /**
   * アポイント履歴を削除
   */
  deleteAppointmentHistory(orderNumber: string, appointmentId: string): void {
    const orders = this.getAll()
    const orderIndex = orders.findIndex(o => o.orderNumber === orderNumber)
    if (orderIndex !== -1 && orders[orderIndex].appointmentHistory) {
      orders[orderIndex].appointmentHistory = orders[orderIndex].appointmentHistory!.filter(
        a => a.id !== appointmentId
      )
      this.saveAll(orders)
    }
  },

  /**
   * 追加費用を更新
   */
  updateAdditionalCosts(orderNumber: string, costs: Partial<AdditionalCosts>): void {
    const orders = this.getAll()
    const index = orders.findIndex(o => o.orderNumber === orderNumber)
    if (index !== -1) {
      orders[index].additionalCosts = {
        ...orders[index].additionalCosts,
        ...costs,
      } as AdditionalCosts
      this.saveAll(orders)
    }
  },

  /**
   * 追加メモを更新
   */
  updateAdditionalNotes(orderNumber: string, notes: Partial<AdditionalNotes>): void {
    const orders = this.getAll()
    const index = orders.findIndex(o => o.orderNumber === orderNumber)
    if (index !== -1) {
      orders[index].additionalNotes = {
        ...orders[index].additionalNotes,
        ...notes,
      }
      this.saveAll(orders)
    }
  },

  /**
   * 集合工事情報を更新
   */
  updateCollectiveConstructionInfo(
    orderNumber: string,
    info: Partial<CollectiveConstructionInfo>
  ): void {
    const orders = this.getAll()
    const index = orders.findIndex(o => o.orderNumber === orderNumber)
    if (index !== -1) {
      orders[index].collectiveConstructionInfo = {
        ...orders[index].collectiveConstructionInfo,
        ...info,
      }as CollectiveConstructionInfo
      this.saveAll(orders)
    }
  },

  /**
   * 初期データ設定（開発用）
   */
  initializeSampleData(sampleData: OrderData[]): void {
    if (this.getAll().length === 0) {
      this.saveAll(sampleData)
    }
  },

  /**
   * データをクリア（開発用）
   */
  clear(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEY)
  }
}

/**
 * 初期化関数（AuthProviderから呼び出される）
 */
export function initializeOrderData(): void {
  if (orderStorage.getAll().length === 0) {
    orderStorage.saveAll(sampleOrders)
  }
}
