import { useState, useCallback, useEffect } from 'react'
import { AppointmentHistory, OrderData } from '../types'
import { getContractors, getTeams } from '@/features/contractor/lib/contractorStorage'
import { AssignedTeam } from '@/app/schedule/types'
import { scheduleStorage } from '@/app/schedule/lib/scheduleStorage'
import { ScheduleItem } from '@/app/schedule/types'

export function useAppointments() {
  const [editingAppointment, setEditingAppointment] = useState<AppointmentHistory | null>(null)
  const [isAddingAppointment, setIsAddingAppointment] = useState(false)
  const [appointmentDate, setAppointmentDate] = useState<string>('')
  const [appointmentTime, setAppointmentTime] = useState<string>('')
  const [appointmentEndTime, setAppointmentEndTime] = useState<string>('')
  const [selectedTeams, setSelectedTeams] = useState<AssignedTeam[]>([])
  const [allTeams, setAllTeams] = useState<Array<{
    id: string
    teamName: string
    contractorId: string
    contractorName: string
  }>>([])
  const [workStartTime, setWorkStartTime] = useState<string>('09:00')
  const [workEndTime, setWorkEndTime] = useState<string>('12:00')

  // 全協力会社の全班を取得
  useEffect(() => {
    const contractors = getContractors().filter(c => c.isActive)
    const teams = getTeams().filter(t => t.isActive)

    const teamList = teams.map(team => {
      const contractor = contractors.find(c => c.id === team.contractorId)
      return {
        id: team.id,
        teamName: team.teamName,
        contractorId: team.contractorId,
        contractorName: contractor?.name || ''
      }
    })

    setAllTeams(teamList)
  }, [])

  const handleAddAppointment = useCallback(() => {
    setIsAddingAppointment(true)
    const today = new Date()
    setAppointmentDate(today.toISOString().slice(0, 10))
    setAppointmentTime('10:00')
    setAppointmentEndTime('11:00')
    setWorkStartTime('09:00')
    setWorkEndTime('12:00')
    setSelectedTeams([])
    setEditingAppointment({
      id: '',
      date: `${today.toISOString().slice(0, 10)}T10:00`,
      endTime: '11:00',
      status: '保留',
      content: ''
    })
  }, [])

  const handleEditAppointment = useCallback((appointment: AppointmentHistory) => {
    setEditingAppointment(appointment)
    setIsAddingAppointment(false)
    const appointmentDateTime = new Date(appointment.date)
    setAppointmentDate(appointmentDateTime.toISOString().slice(0, 10))
    setAppointmentTime(appointmentDateTime.toISOString().slice(11, 16))
    setAppointmentEndTime(appointment.endTime || '11:00')

    // scheduleInfo から assignedTeams を復元
    if (appointment.scheduleInfo) {
      const { assignedTeams, workStartTime, workEndTime } = appointment.scheduleInfo
      setSelectedTeams(assignedTeams)
      setWorkStartTime(workStartTime)
      setWorkEndTime(workEndTime)
    } else {
      setSelectedTeams([])
      setWorkStartTime('09:00')
      setWorkEndTime('12:00')
    }
  }, [])

  // 班を追加
  const handleAddTeam = useCallback((teamId: string) => {
    if (!teamId) return

    const team = allTeams.find(t => t.id === teamId)
    if (!team) return

    // 重複チェック
    if (selectedTeams.some(t => t.teamId === teamId)) return

    setSelectedTeams(prev => [...prev, {
      contractorId: team.contractorId,
      contractorName: team.contractorName,
      teamId: team.id,
      teamName: team.teamName
    }])
  }, [allTeams, selectedTeams])

  // 班を削除
  const handleRemoveTeam = useCallback((teamId: string) => {
    setSelectedTeams(prev => prev.filter(t => t.teamId !== teamId))
  }, [])

  const resetAppointmentForm = useCallback(() => {
    setEditingAppointment(null)
    setIsAddingAppointment(false)
    setSelectedTeams([])
    setWorkStartTime('09:00')
    setWorkEndTime('12:00')
  }, [])

  // スケジュール登録処理
  const registerToSchedule = useCallback((
    order: OrderData,
    status: '工事決定' | '調査日決定',
    scheduleInfo: {
      assignedTeams: AssignedTeam[]
      workStartTime: string
      workEndTime: string
    }
  ) => {
    const scheduleType = status === '工事決定' ? 'construction' : 'survey'
    const timeSlot = `${scheduleInfo.workStartTime}-${scheduleInfo.workEndTime}`

    const newSchedule: ScheduleItem = {
      id: `appointment-${Date.now()}`,
      scheduleType,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      collectiveHousingName: order.apartmentName,
      address: order.address || '',
      phoneNumber: order.phoneNumber,
      assignedDate: appointmentDate,
      timeSlot,
      assignedTeams: scheduleInfo.assignedTeams,
      // 後方互換性のため、最初の班を代表として設定
      contractorId: scheduleInfo.assignedTeams[0].contractorId,
      contractor: scheduleInfo.assignedTeams[0].contractorName as '直営班' | '栄光電気' | 'スライヴ',
      teamId: scheduleInfo.assignedTeams[0].teamId,
      teamName: scheduleInfo.assignedTeams[0].teamName,
      memo: `アポイント履歴から登録（${status}）`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    scheduleStorage.add(newSchedule)
  }, [appointmentDate])

  const saveAppointment = useCallback((
    order: OrderData,
    orders: OrderData[],
    setOrders: (orders: OrderData[]) => void
  ) => {
    if (!editingAppointment) return

    // バリデーション: 工事決定・調査日決定の場合、班選択必須
    if (editingAppointment.status === '工事決定' || editingAppointment.status === '調査日決定') {
      if (selectedTeams.length === 0) {
        alert('担当班を最低1つ選択してください')
        return
      }
    }

    const combinedDateTime = `${appointmentDate}T${appointmentTime}`

    // scheduleInfo 生成
    let scheduleInfo = undefined
    if ((editingAppointment.status === '工事決定' || editingAppointment.status === '調査日決定')
        && selectedTeams.length > 0) {
      scheduleInfo = {
        assignedTeams: selectedTeams,
        workStartTime,
        workEndTime
      }
    }

    const updatedAppointment = {
      ...editingAppointment,
      date: combinedDateTime,
      endTime: appointmentEndTime,
      scheduleInfo
    }

    // アポイント履歴を更新
    const updatedOrders = orders.map(o => {
      if (o.orderNumber === order.orderNumber) {
        const history = o.appointmentHistory || []
        if (isAddingAppointment) {
          const newId = String(Date.now())
          const newAppointment = { ...updatedAppointment, id: newId }
          return { ...o, appointmentHistory: [...history, newAppointment] }
        } else {
          return {
            ...o,
            appointmentHistory: history.map(h =>
              h.id === editingAppointment.id ? updatedAppointment : h
            )
          }
        }
      }
      return o
    })

    setOrders(updatedOrders)

    // スケジュール画面にも登録
    if (scheduleInfo && (editingAppointment.status === '工事決定' || editingAppointment.status === '調査日決定')) {
      registerToSchedule(order, editingAppointment.status, scheduleInfo)
    }

    resetAppointmentForm()
  }, [
    editingAppointment,
    appointmentDate,
    appointmentTime,
    appointmentEndTime,
    selectedTeams,
    workStartTime,
    workEndTime,
    isAddingAppointment,
    resetAppointmentForm,
    registerToSchedule
  ])

  const deleteAppointment = useCallback((
    order: OrderData,
    appointmentId: string,
    orders: OrderData[],
    setOrders: (orders: OrderData[]) => void
  ) => {
    const updatedOrders = orders.map(o => {
      if (o.orderNumber === order.orderNumber) {
        return {
          ...o,
          appointmentHistory: (o.appointmentHistory || []).filter(h => h.id !== appointmentId)
        }
      }
      return o
    })
    setOrders(updatedOrders)
  }, [])

  return {
    editingAppointment,
    isAddingAppointment,
    appointmentDate,
    appointmentTime,
    appointmentEndTime,
    selectedTeams,
    allTeams,
    workStartTime,
    workEndTime,
    setAppointmentDate,
    setAppointmentTime,
    setAppointmentEndTime,
    setWorkStartTime,
    setWorkEndTime,
    setEditingAppointment,
    setSelectedTeams,
    handleAddTeam,
    handleRemoveTeam,
    handleAddAppointment,
    handleEditAppointment,
    resetAppointmentForm,
    saveAppointment,
    deleteAppointment,
  }
}

