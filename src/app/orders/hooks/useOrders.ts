import { useState, useCallback, useEffect } from 'react'
import { OrderData, IndividualWorkType, CollectiveWorkType, AdditionalCosts, AdditionalNotes, CollectiveConstructionInfo, AppointmentHistory } from '../types'
import { orderStorage } from '../lib/orderStorage'
import { orderFileStorage } from '../lib/orderFileStorage'

export function useOrders() {
  const [orders, setOrders] = useState<OrderData[]>([])

  // 初回読み込み時にlocalStorageからデータを取得
  useEffect(() => {
    const storedOrders = orderStorage.getAll()
    setOrders(storedOrders)
  }, [])

  const updateOrder = useCallback((orderNumber: string, updates: Partial<OrderData>) => {
    orderStorage.update(orderNumber, updates)
    setOrders(orderStorage.getAll())
  }, [])

  const addOrders = useCallback((newOrders: OrderData[]) => {
    newOrders.forEach(order => orderStorage.add(order))
    setOrders(orderStorage.getAll())
  }, [])

  const updateWorkType = useCallback((orderNumber: string, newWorkType: IndividualWorkType | CollectiveWorkType) => {
    updateOrder(orderNumber, { workType: newWorkType })
  }, [updateOrder])

  const updateStatus = useCallback((
    orderNumber: string,
    statusType: 'surveyStatus' | 'permissionStatus' | 'constructionStatus',
    newStatus: 'pending' | 'in_progress' | 'completed' | 'canceled'
  ) => {
    updateOrder(orderNumber, { [statusType]: newStatus })
  }, [updateOrder])

  const uploadMapPdf = useCallback(async (orderNumber: string, file: File): Promise<void> => {
    try {
      const fileId = await orderFileStorage.uploadFile(orderNumber, file)
      orderStorage.update(orderNumber, { mapPdfId: fileId })
      setOrders(orderStorage.getAll())
    } catch (error) {
      console.error('Failed to upload PDF:', error)
      throw error
    }
  }, [])

  const deleteMapPdf = useCallback((orderNumber: string) => {
    const order = orderStorage.getByOrderNumber(orderNumber)
    if (order?.mapPdfId) {
      orderFileStorage.delete(order.mapPdfId)
      orderStorage.update(orderNumber, { mapPdfId: undefined })
      setOrders(orderStorage.getAll())
    }
  }, [])

  const downloadMapPdf = useCallback((orderNumber: string) => {
    const order = orderStorage.getByOrderNumber(orderNumber)
    if (order?.mapPdfId) {
      orderFileStorage.downloadFile(order.mapPdfId)
    }
  }, [])

  const getMapPdf = useCallback((orderNumber: string) => {
    const order = orderStorage.getByOrderNumber(orderNumber)
    if (order?.mapPdfId) {
      return orderFileStorage.getById(order.mapPdfId)
    }
    return undefined
  }, [])

  /**
   * 単一の注文を新規作成してlocalStorageに保存
   * @param newOrder - 作成する注文データ
   */
  const createOrder = useCallback((newOrder: OrderData): void => {
    orderStorage.add(newOrder)
    setOrders(orderStorage.getAll())
  }, [])

  /**
   * 注文データを完全に置き換えてlocalStorageに保存
   * @param updatedOrder - 更新後の注文データ
   */
  const replaceOrder = useCallback((updatedOrder: OrderData): void => {
    orderStorage.update(updatedOrder.orderNumber, updatedOrder)
    setOrders(orderStorage.getAll())
  }, [])

  /**
   * 追加費用情報を更新してlocalStorageに保存
   * @param orderNumber - 注文番号
   * @param additionalCosts - 追加費用データ
   */
  const updateAdditionalCosts = useCallback((orderNumber: string, additionalCosts: AdditionalCosts): void => {
    updateOrder(orderNumber, { additionalCosts })
  }, [updateOrder])

  /**
   * 追加メモを更新してlocalStorageに保存
   * @param orderNumber - 注文番号
   * @param additionalNotes - 追加メモデータ
   */
  const updateAdditionalNotes = useCallback((orderNumber: string, additionalNotes: AdditionalNotes): void => {
    updateOrder(orderNumber, { additionalNotes })
  }, [updateOrder])

  /**
   * 集合工事情報を更新してlocalStorageに保存
   * @param orderNumber - 注文番号
   * @param collectiveConstructionInfo - 集合工事情報データ
   */
  const updateCollectiveConstructionInfo = useCallback((orderNumber: string, collectiveConstructionInfo: CollectiveConstructionInfo): void => {
    updateOrder(orderNumber, { collectiveConstructionInfo })
  }, [updateOrder])

  /**
   * アポイント履歴を更新してlocalStorageに保存
   * @param orderNumber - 注文番号
   * @param appointmentHistory - アポイント履歴配列
   */
  const updateAppointmentHistory = useCallback((orderNumber: string, appointmentHistory: AppointmentHistory[]): void => {
    updateOrder(orderNumber, { appointmentHistory })
  }, [updateOrder])

  /**
   * アポイント履歴に新しいエントリを追加、または既存エントリを更新してlocalStorageに保存
   * IDが既に存在する場合は更新、存在しない場合は新規追加
   * @param orderNumber - 注文番号
   * @param appointment - 追加/更新するアポイントデータ
   */
  const addAppointment = useCallback((orderNumber: string, appointment: AppointmentHistory): void => {
    const order = orderStorage.getByOrderNumber(orderNumber)
    if (!order) return
    const history = order.appointmentHistory || []

    // IDが既に存在するかチェック
    const existingIndex = history.findIndex(h => h.id === appointment.id)

    if (existingIndex >= 0) {
      // 既存のアポイントを更新
      const updatedHistory = [...history]
      updatedHistory[existingIndex] = appointment
      updateOrder(orderNumber, { appointmentHistory: updatedHistory })
    } else {
      // 新しいアポイントを追加
      updateOrder(orderNumber, { appointmentHistory: [...history, appointment] })
    }
  }, [updateOrder])

  /**
   * アポイント履歴から指定されたエントリを削除してlocalStorageに保存
   * @param orderNumber - 注文番号
   * @param appointmentId - 削除するアポイントのID
   */
  const removeAppointment = useCallback((orderNumber: string, appointmentId: string): void => {
    const order = orderStorage.getByOrderNumber(orderNumber)
    if (!order) return
    const history = (order.appointmentHistory || []).filter(h => h.id !== appointmentId)
    updateOrder(orderNumber, { appointmentHistory: history })
  }, [updateOrder])

  return {
    orders,
    setOrders,    // 下位互換性のため残す（非推奨）
    updateOrder,
    addOrders,
    updateWorkType,
    updateStatus,
    uploadMapPdf,
    deleteMapPdf,
    downloadMapPdf,
    getMapPdf,
    // 新規メソッド
    createOrder,
    replaceOrder,
    updateAdditionalCosts,
    updateAdditionalNotes,
    updateCollectiveConstructionInfo,
    updateAppointmentHistory,
    addAppointment,
    removeAppointment,
  }
}
