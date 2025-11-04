import { useState, useCallback } from 'react'
import { OrderData } from '../types'

export function useOrders(initialOrders: OrderData[] = []) {
  const [orders, setOrders] = useState<OrderData[]>(initialOrders)

  const updateOrder = useCallback((orderNumber: string, updates: Partial<OrderData>) => {
    setOrders(prev => prev.map(order =>
      order.orderNumber === orderNumber ? { ...order, ...updates } : order
    ))
  }, [])

  const addOrders = useCallback((newOrders: OrderData[]) => {
    setOrders(prev => [...prev, ...newOrders])
  }, [])

  const updateWorkContent = useCallback((orderNumber: string, newContent: string) => {
    updateOrder(orderNumber, { workContent: newContent })
  }, [updateOrder])

  const updateStatus = useCallback((
    orderNumber: string,
    statusType: 'surveyStatus' | 'permissionStatus' | 'constructionStatus',
    newStatus: 'pending' | 'in_progress' | 'completed'
  ) => {
    updateOrder(orderNumber, { [statusType]: newStatus })
  }, [updateOrder])

  const updateMapPdfPath = useCallback((orderNumber: string, mapPdfPath: string) => {
    updateOrder(orderNumber, { mapPdfPath })
  }, [updateOrder])

  return {
    orders,
    setOrders,
    updateOrder,
    addOrders,
    updateWorkContent,
    updateStatus,
    updateMapPdfPath,
  }
}

