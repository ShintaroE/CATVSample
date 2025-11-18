import { useState, useCallback, useEffect } from 'react'
import { OrderData, IndividualWorkType, CollectiveWorkType } from '../types'
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

  return {
    orders,
    setOrders,    // ← これが既にあるので問題なし
    updateOrder,
    addOrders,
    updateWorkType,
    updateStatus,
    uploadMapPdf,
    deleteMapPdf,
    downloadMapPdf,
    getMapPdf,
  }
}
