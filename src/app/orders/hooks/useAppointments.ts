import { useState, useCallback } from 'react'
import { AppointmentHistory, OrderData } from '../types'
import { getContractors, getTeams } from '@/features/contractor/lib/contractorStorage'

export function useAppointments() {
  const [editingAppointment, setEditingAppointment] = useState<AppointmentHistory | null>(null)
  const [isAddingAppointment, setIsAddingAppointment] = useState(false)
  const [appointmentDate, setAppointmentDate] = useState<string>('')
  const [appointmentTime, setAppointmentTime] = useState<string>('')
  const [appointmentEndTime, setAppointmentEndTime] = useState<string>('')
  const [selectedContractorId, setSelectedContractorId] = useState<string>('')
  const [selectedTeamId, setSelectedTeamId] = useState<string>('')
  const [availableTeams, setAvailableTeams] = useState<Array<{ id: string, name: string }>>([])
  const [workStartTime, setWorkStartTime] = useState<string>('09:00')
  const [workEndTime, setWorkEndTime] = useState<string>('12:00')

  const handleAddAppointment = useCallback(() => {
    setIsAddingAppointment(true)
    const today = new Date()
    setAppointmentDate(today.toISOString().slice(0, 10))
    setAppointmentTime('10:00')
    setAppointmentEndTime('11:00')
    setWorkStartTime('09:00')
    setWorkEndTime('12:00')
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

    if (appointment.scheduleInfo) {
      const { contractorId, teamId, workStartTime, workEndTime } = appointment.scheduleInfo
      setSelectedContractorId(contractorId)
      const teams = getTeams().filter(t => t.contractorId === contractorId && t.isActive)
      setAvailableTeams(teams.map(t => ({ id: t.id, name: t.teamName })))
      setSelectedTeamId(teamId)
      setWorkStartTime(workStartTime)
      setWorkEndTime(workEndTime)
    } else {
      setWorkStartTime('09:00')
      setWorkEndTime('12:00')
    }
  }, [])

  const handleContractorChange = useCallback((contractorId: string) => {
    setSelectedContractorId(contractorId)
    setSelectedTeamId('')

    if (contractorId) {
      const teams = getTeams().filter(t => t.contractorId === contractorId && t.isActive)
      setAvailableTeams(teams.map(t => ({ id: t.id, name: t.teamName })))
    } else {
      setAvailableTeams([])
    }
  }, [])

  const resetAppointmentForm = useCallback(() => {
    setEditingAppointment(null)
    setIsAddingAppointment(false)
    setSelectedContractorId('')
    setSelectedTeamId('')
    setAvailableTeams([])
    setWorkStartTime('09:00')
    setWorkEndTime('12:00')
  }, [])

  const saveAppointment = useCallback((
    order: OrderData,
    orders: OrderData[],
    setOrders: (orders: OrderData[]) => void
  ) => {
    if (!editingAppointment) return

    if (editingAppointment.status === '工事決定') {
      if (!selectedContractorId || !selectedTeamId) {
        alert('工事決定の場合、工事会社と班を選択してください')
        return
      }
    }

    const combinedDateTime = `${appointmentDate}T${appointmentTime}`

    let scheduleInfo = undefined
    if (editingAppointment.status === '工事決定' && selectedContractorId && selectedTeamId) {
      const contractor = getContractors().find(c => c.id === selectedContractorId)
      const team = getTeams().find(t => t.id === selectedTeamId)
      if (contractor && team) {
        scheduleInfo = {
          contractorId: contractor.id,
          contractorName: contractor.name,
          teamId: team.id,
          teamName: team.teamName,
          workStartTime,
          workEndTime
        }
      }
    }

    const updatedAppointment = {
      ...editingAppointment,
      date: combinedDateTime,
      endTime: appointmentEndTime,
      scheduleInfo
    }

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

    if (editingAppointment.status === '工事決定' && scheduleInfo) {
      alert(`アポイントを保存し、スケジュールを登録しました\n担当: ${scheduleInfo.contractorName} - ${scheduleInfo.teamName}\n工事時間: ${scheduleInfo.workStartTime} - ${scheduleInfo.workEndTime}`)
    }

    resetAppointmentForm()
  }, [
    editingAppointment,
    appointmentDate,
    appointmentTime,
    appointmentEndTime,
    selectedContractorId,
    selectedTeamId,
    workStartTime,
    workEndTime,
    isAddingAppointment,
    resetAppointmentForm
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
    selectedContractorId,
    selectedTeamId,
    availableTeams,
    workStartTime,
    workEndTime,
    setAppointmentDate,
    setAppointmentTime,
    setAppointmentEndTime,
    setSelectedTeamId,
    setWorkStartTime,
    setWorkEndTime,
    setEditingAppointment,
    handleAddAppointment,
    handleEditAppointment,
    handleContractorChange,
    resetAppointmentForm,
    saveAppointment,
    deleteAppointment,
  }
}

