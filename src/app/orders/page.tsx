'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { DocumentArrowUpIcon, EyeIcon, MapIcon, ClockIcon, PlusIcon, CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon, FunnelIcon } from '@heroicons/react/24/outline'
import Layout from '@/shared/components/layout/Layout'
import CalendarPicker from '@/features/calendar/components/CalendarPicker'
import { getContractors, getTeams } from '@/features/contractor/lib/contractorStorage'
import {
  AppointmentHistory,
  ExclusionEntry,
  WeekViewColumn,
  TeamGroup,
  TeamFilter,
  CalendarViewMode,
  ScheduleData,
  OrderData,
  workContentOptions,
} from './types'
import { sampleExclusions, sampleSchedules, sampleOrders } from './data/sampleData'
import { Button, Textarea } from '@/shared/components/ui'

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderData[]>(sampleOrders)
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)
  const [appointmentOrder, setAppointmentOrder] = useState<OrderData | null>(null)
  const [editingAppointment, setEditingAppointment] = useState<AppointmentHistory | null>(null)
  const [isAddingAppointment, setIsAddingAppointment] = useState(false)
  const [showCalendarPicker, setShowCalendarPicker] = useState(false)
  const [appointmentDate, setAppointmentDate] = useState<string>('')
  const [appointmentTime, setAppointmentTime] = useState<string>('')
  const [appointmentEndTime, setAppointmentEndTime] = useState<string>('')
  const [selectedScheduleDate, setSelectedScheduleDate] = useState<string | null>(null)
  const [scheduleCalendarDate, setScheduleCalendarDate] = useState<Date>(new Date())

  // 週表示とフィルター用の状態
  const [calendarViewMode, setCalendarViewMode] = useState<CalendarViewMode>('month')
  const [teamFilters, setTeamFilters] = useState<TeamFilter[]>([])
  const [showFilterPanel, setShowFilterPanel] = useState(false)

  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const mapFileInputRef = React.useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const processFiles = (files: FileList) => {
    const excelFiles = Array.from(files).filter(file =>
      file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
    )

    if (excelFiles.length > 0) {
      // サンプルとして新しい工事依頼を追加
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      const sequence = String(orders.length + 1).padStart(5, '0')

      const newOrder: OrderData = {
        orderNumber: `${year}${month}${day}${sequence}`,
        orderSource: 'KCT本社',
        workContent: '個別対応',
        customerCode: `${Math.floor(Math.random() * 900000000) + 100000000}`,
        customerType: '新規',
        customerName: '新規顧客',
        constructionDate: new Date().toISOString().split('T')[0],
        closureNumber: `CL-${String(orders.length + 1).padStart(3, '0')}-A`,
        address: '倉敷市新規住所',
        surveyStatus: 'pending',
        permissionStatus: 'pending',
        constructionStatus: 'pending'
      }

      setOrders(prev => [...prev, newOrder])

      // 成功メッセージ（実際はトーストなど）
      alert(`${excelFiles[0].name} を読み込みました。\n受注番号: ${newOrder.orderNumber}`)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    processFiles(e.dataTransfer.files)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files)
    }
  }

  const handleClickUpload = () => {
    fileInputRef.current?.click()
  }

  const handleViewDetails = (order: OrderData) => {
    setSelectedOrder(order)
  }

  const handleCloseDetails = () => {
    setSelectedOrder(null)
  }

  const getSelectColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-gray-600 border-gray-300 bg-gray-50'
      case 'in_progress':
        return 'text-blue-600 border-blue-300 bg-blue-50'
      case 'completed':
        return 'text-green-600 border-green-300 bg-green-50'
      default:
        return 'text-gray-600 border-gray-300 bg-gray-50'
    }
  }


  const handleWorkContentChange = (orderNumber: string, newContent: string) => {
    setOrders(prev => prev.map(order =>
      order.orderNumber === orderNumber
        ? { ...order, workContent: newContent }
        : order
    ))
  }

  const handleStatusChange = (orderNumber: string, statusType: 'surveyStatus' | 'permissionStatus' | 'constructionStatus', newStatus: 'pending' | 'in_progress' | 'completed') => {
    setOrders(prev => prev.map(order =>
      order.orderNumber === orderNumber
        ? { ...order, [statusType]: newStatus }
        : order
    ))

    // selectedOrderも更新
    if (selectedOrder && selectedOrder.orderNumber === orderNumber) {
      setSelectedOrder(prev => prev ? { ...prev, [statusType]: newStatus } : null)
    }
  }

  const handleMapUpload = () => {
    mapFileInputRef.current?.click()
  }

  const handleMapFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && selectedOrder) {
      const file = e.target.files[0]

      if (file.type === 'application/pdf') {
        // 実際の実装では、ファイルをサーバーにアップロードして URL を取得
        // ここではサンプルとして地図.pdfのパスを設定
        const mapPath = '/地図.pdf'

        // 注文データを更新
        setOrders(prev => prev.map(order =>
          order.orderNumber === selectedOrder.orderNumber
            ? { ...order, mapPdfPath: mapPath }
            : order
        ))

        // selectedOrderも更新
        setSelectedOrder(prev => prev ? { ...prev, mapPdfPath: mapPath } : null)

        alert('地図PDFがアップロードされました')
      } else {
        alert('PDFファイルを選択してください')
      }
    }
  }

  const handleViewMap = (order: OrderData) => {
    if (order.mapPdfPath) {
      // PDFを新しいタブで開く（スマホ・PC両対応）
      window.open(order.mapPdfPath, '_blank')
    }
  }

  const handleViewAppointmentHistory = (order: OrderData) => {
    setAppointmentOrder(order)
    setShowAppointmentModal(true)
  }

  const handleCloseAppointmentModal = () => {
    setShowAppointmentModal(false)
    setAppointmentOrder(null)
    setEditingAppointment(null)
    setIsAddingAppointment(false)
    setSelectedScheduleDate(null)
  }

  const handleAddAppointment = () => {
    setIsAddingAppointment(true)
    const today = new Date()
    setAppointmentDate(today.toISOString().slice(0, 10))
    setAppointmentTime('10:00')
    setAppointmentEndTime('11:00')
    setEditingAppointment({
      id: '',
      date: `${today.toISOString().slice(0, 10)}T10:00`,
      endTime: '11:00',
      status: '保留',
      content: ''
    })
  }

  const handleEditAppointment = (appointment: AppointmentHistory) => {
    setEditingAppointment(appointment)
    setIsAddingAppointment(false)
    // 既存の日時を分離
    const appointmentDateTime = new Date(appointment.date)
    setAppointmentDate(appointmentDateTime.toISOString().slice(0, 10))
    setAppointmentTime(appointmentDateTime.toISOString().slice(11, 16))
    setAppointmentEndTime(appointment.endTime || '11:00')
  }

  const handleSaveAppointment = () => {
    if (!appointmentOrder || !editingAppointment) return

    // 日付と時刻を結合
    const combinedDateTime = `${appointmentDate}T${appointmentTime}`
    const updatedAppointment = { ...editingAppointment, date: combinedDateTime, endTime: appointmentEndTime }

    const updatedOrders = orders.map(order => {
      if (order.orderNumber === appointmentOrder.orderNumber) {
        const history = order.appointmentHistory || []
        if (isAddingAppointment) {
          const newId = String(Date.now())
          const newAppointment = { ...updatedAppointment, id: newId }
          return { ...order, appointmentHistory: [...history, newAppointment] }
        } else {
          return {
            ...order,
            appointmentHistory: history.map(h =>
              h.id === editingAppointment.id ? updatedAppointment : h
            )
          }
        }
      }
      return order
    })

    setOrders(updatedOrders)
    setAppointmentOrder(prev => {
      if (!prev) return null
      const updated = updatedOrders.find(o => o.orderNumber === prev.orderNumber)
      return updated || null
    })
    setEditingAppointment(null)
    setIsAddingAppointment(false)
  }

  const handleDeleteAppointment = (appointmentId: string) => {
    if (!appointmentOrder) return

    const updatedOrders = orders.map(order => {
      if (order.orderNumber === appointmentOrder.orderNumber) {
        return {
          ...order,
          appointmentHistory: (order.appointmentHistory || []).filter(h => h.id !== appointmentId)
        }
      }
      return order
    })

    setOrders(updatedOrders)
    setAppointmentOrder(prev => {
      if (!prev) return null
      const updated = updatedOrders.find(o => o.orderNumber === prev.orderNumber)
      return updated || null
    })
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case '工事決定':
        return 'bg-green-100 text-green-800'
      case '保留':
        return 'bg-yellow-100 text-yellow-800'
      case '不通':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // カレンダーから日付を選択
  const handleDateSelectFromCalendar = (selectedDate: string) => {
    setAppointmentDate(selectedDate)
    if (editingAppointment) {
      const combinedDateTime = `${selectedDate}T${appointmentTime}`
      setEditingAppointment({
        ...editingAppointment,
        date: combinedDateTime
      })
    }
    setShowCalendarPicker(false)
  }

  // カレンダーピッカーを閉じる
  const handleCloseCalendarPicker = () => {
    setShowCalendarPicker(false)
  }

  // スケジュール日付選択
  const handleScheduleDateClick = (date: Date) => {
    const dateStr = formatDateString(date)
    setSelectedScheduleDate(dateStr)
  }

  // 開始時刻を変更
  const handleStartTimeChange = (newTime: string) => {
    setAppointmentTime(newTime)
    if (editingAppointment) {
      const combinedDateTime = `${appointmentDate}T${newTime}`
      setEditingAppointment({
        ...editingAppointment,
        date: combinedDateTime
      })
    }
  }

  // 終了時刻を変更
  const handleEndTimeChange = (newTime: string) => {
    setAppointmentEndTime(newTime)
    if (editingAppointment) {
      setEditingAppointment({
        ...editingAppointment,
        endTime: newTime
      })
    }
  }

  // スケジュールカレンダーの月移動
  const navigateScheduleMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(scheduleCalendarDate)
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
    setScheduleCalendarDate(newDate)
  }

  // スケジュールカレンダーの週移動
  const navigateScheduleWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(scheduleCalendarDate)
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
    setScheduleCalendarDate(newDate)
  }

  // 除外日の時間タイプを表示用テキストに変換
  const getExclusionTimeText = (exclusion: ExclusionEntry) => {
    switch (exclusion.timeType) {
      case 'all_day':
        return '終日'
      case 'am':
        return '午前'
      case 'pm':
        return '午後'
      case 'custom':
        return `${exclusion.startTime}-${exclusion.endTime}`
      default:
        return ''
    }
  }

  // フィルター初期化
  useEffect(() => {
    const contractors = getContractors()
    const teams = getTeams()
    const colorMap: Record<string, string> = {
      'contractor-1': 'blue',
      'contractor-2': 'green',
      'contractor-3': 'purple'
    }

    const filters: TeamFilter[] = teams.map(team => {
      const contractor = contractors.find(c => c.id === team.contractorId)
      return {
        contractorId: team.contractorId,
        contractorName: contractor?.name || '',
        teamId: team.id,
        teamName: team.teamName,
        isVisible: true,
        color: colorMap[team.contractorId] || 'gray'
      }
    })

    setTeamFilters(filters)
  }, [])

  // 日付フォーマット関数
  const formatDateString = (date: Date) => {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const formatDate = (date: Date) => {
    const month = date.getMonth() + 1
    const day = date.getDate()
    const weekDays = ['日', '月', '火', '水', '木', '金', '土']
    const weekDay = weekDays[date.getDay()]
    return `${month}/${day}(${weekDay})`
  }

  // 週の日付を取得
  const getWeekDays = () => {
    const startOfWeek = new Date(scheduleCalendarDate)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1)
    startOfWeek.setDate(diff)

    const days: Date[] = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      days.push(date)
    }
    return days
  }

  // 週範囲表示用のラベルを取得
  const getWeekRangeLabel = (): string => {
    const weekDays = getWeekDays()
    const startDate = weekDays[0]
    const endDate = weekDays[6]

    const startMonth = startDate.getMonth() + 1
    const startDay = startDate.getDate()
    const endMonth = endDate.getMonth() + 1
    const endDay = endDate.getDate()
    const year = startDate.getFullYear()

    // 同じ月の場合
    if (startMonth === endMonth) {
      return `${year}年${startMonth}月${startDay}日 - ${endDay}日`
    }
    // 異なる月の場合
    return `${year}年${startMonth}月${startDay}日 - ${endMonth}月${endDay}日`
  }

  // 週表示用: 班グループを取得
  const getTeamGroups = (): TeamGroup[] => {
    return teamFilters
      .filter(f => f.isVisible)
      .map(f => ({
        teamId: f.teamId,
        teamName: f.teamName,
        contractorName: f.contractorName,
        color: f.color,
        displayName: `${f.contractorName}-${f.teamName}`,
        columnCount: 7
      }))
  }

  // 週表示用: 列を取得
  const getWeekViewColumns = (): WeekViewColumn[] => {
    const columns: WeekViewColumn[] = []
    const visibleTeams = teamFilters.filter(f => f.isVisible)
    const weekDays = getWeekDays()

    visibleTeams.forEach(team => {
      weekDays.forEach(date => {
        columns.push({
          teamId: team.teamId,
          teamName: team.teamName,
          contractorId: team.contractorId,
          contractorName: team.contractorName,
          color: team.color,
          date,
          dateStr: formatDateString(date),
          displayName: formatDate(date),
          teamDisplayName: `${team.contractorName}-${team.teamName}`
        })
      })
    })

    return columns
  }

  // 週表示用: 列幅を計算
  const getColumnWidth = (visibleTeamCount: number): string => {
    if (visibleTeamCount === 1) return '150px'
    if (visibleTeamCount === 2) return '120px'
    if (visibleTeamCount === 3) return '100px'
    return '90px'
  }

  // 時間スロット取得
  const getHourlyTimeSlots = () => {
    const slots: string[] = []
    for (let hour = 9; hour <= 18; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`)
    }
    return slots
  }

  // 除外日の時間スロットを取得
  const getExclusionTimeSlot = (exclusion: ExclusionEntry): string => {
    switch (exclusion.timeType) {
      case 'all_day':
        return '09:00-18:00'
      case 'am':
        return '09:00-12:00'
      case 'pm':
        return '12:00-18:00'
      case 'custom':
        return `${exclusion.startTime}-${exclusion.endTime}`
      default:
        return '09:00-18:00'
    }
  }

  // 時間位置計算
  const calculateTopPosition = (timeSlot: string): string => {
    if (timeSlot === '終日') return '0rem'

    const [startTime] = timeSlot.split('-')
    const [hour, minute] = startTime.split(':').map(Number)
    const minutesFromStart = (hour - 9) * 60 + minute
    return `${(minutesFromStart / 60) * 4}rem`
  }

  const calculateHeight = (timeSlot: string): string => {
    if (timeSlot === '終日') return '36rem'

    const [startTime, endTime] = timeSlot.split('-')
    const [startHour, startMinute] = startTime.split(':').map(Number)
    const [endHour, endMinute] = endTime.split(':').map(Number)

    const startMinutes = startHour * 60 + startMinute
    const endMinutes = endHour * 60 + endMinute
    const durationMinutes = endMinutes - startMinutes

    return `${Math.max((durationMinutes / 60) * 4, 2)}rem`
  }

  // 左右分離レイアウト計算
  const calculateSeparatedLayout = (schedules: ScheduleData[], exclusions: ExclusionEntry[], teamId: string, dateStr: string) => {
    const daySchedules = schedules.filter(s =>
      s.assignedDate === dateStr &&
      s.assignedTeams?.some((t) => t.teamId === teamId)
    )
    const dayExclusions = exclusions.filter(e =>
      e.date === dateStr && e.teamId === teamId
    )

    if (dayExclusions.length > 0 && daySchedules.length > 0) {
      return {
        exclusions: dayExclusions.map(e => ({
          data: e,
          width: '50%',
          left: '0%'
        })),
        schedules: daySchedules.map(s => ({
          data: s,
          width: '50%',
          left: '50%'
        }))
      }
    }

    return {
      exclusions: dayExclusions.map(e => ({
        data: e,
        width: '100%',
        left: '0%'
      })),
      schedules: daySchedules.map(s => ({
        data: s,
        width: '100%',
        left: '0%'
      }))
    }
  }

  // フィルター関連の関数
  const getContractorCheckState = (contractorId: string): 'all' | 'some' | 'none' => {
    const contractorTeams = teamFilters.filter(f => f.contractorId === contractorId)
    const visibleCount = contractorTeams.filter(f => f.isVisible).length

    if (visibleCount === 0) return 'none'
    if (visibleCount === contractorTeams.length) return 'all'
    return 'some'
  }

  const handleToggleAll = (checked: boolean) => {
    setTeamFilters(prev => prev.map(f => ({ ...f, isVisible: checked })))
  }

  const handleToggleContractor = (contractorId: string, checked: boolean) => {
    setTeamFilters(prev =>
      prev.map(f => f.contractorId === contractorId ? { ...f, isVisible: checked } : f)
    )
  }

  const handleToggleTeam = (teamId: string, checked: boolean) => {
    setTeamFilters(prev =>
      prev.map(f => f.teamId === teamId ? { ...f, isVisible: checked } : f)
    )
  }

  // フィルタリング済みデータ
  const filteredSchedules = useMemo(() => {
    return sampleSchedules.filter(schedule => {
      if (teamFilters.length === 0) return true
      return schedule.assignedTeams?.some(assignedTeam =>
        teamFilters.some(f => f.teamId === assignedTeam.teamId && f.isVisible)
      )
    })
  }, [teamFilters])

  const filteredExclusions = useMemo(() => {
    return sampleExclusions.filter(exclusion => {
      if (teamFilters.length === 0) return true
      return teamFilters.some(f => f.teamId === exclusion.teamId && f.isVisible)
    })
  }, [teamFilters])

  const visibleFilterCount = teamFilters.filter(f => f.isVisible).length
  const totalFilterCount = teamFilters.length


  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <h1 className="text-3xl font-bold text-gray-900">
                工事依頼管理
              </h1>
              <div className="text-sm text-gray-600">
                小川オーダー表形式
              </div>
            </div>
          </div>
        </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* EXCELアップロード領域 */}
        <div className="mb-8">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              isDragOver
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClickUpload}
          >
            <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              工事依頼のEXCELファイルをドラッグ&ドロップ
            </p>
            <p className="text-xs text-gray-500 mt-1">
              または<span className="text-blue-600 font-medium">クリックしてファイルを選択</span>
            </p>
            <p className="text-xs text-gray-500">
              (.xlsx, .xls形式に対応)
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileInputChange}
            className="hidden"
            multiple
          />
          <input
            ref={mapFileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleMapFileChange}
            className="hidden"
          />
        </div>

        {/* 工事依頼一覧 */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              工事依頼一覧（小川オーダー表）
            </h3>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      受注番号
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      受注先
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      工事内容
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      顧客コード
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      新規/既存
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      顧客名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      アクション
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      アポイント履歴
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.orderNumber} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.orderNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.orderSource}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <select
                          value={order.workContent}
                          onChange={(e) => handleWorkContentChange(order.orderNumber, e.target.value)}
                          className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                        >
                          {workContentOptions.map(option => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.customerCode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.customerType === '新規'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {order.customerType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.customerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="inline-flex items-center text-blue-600 hover:text-blue-900"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          詳細表示
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewAppointmentHistory(order)}
                            className="inline-flex items-center text-blue-600 hover:text-blue-900"
                          >
                            <ClockIcon className="h-4 w-4 mr-1" />
                            履歴表示
                          </button>
                          <span className="text-xs text-gray-400">
                            ({order.appointmentHistory?.length || 0}件)
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* 詳細モーダル（宅内引込進捗表） */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                宅内引込進捗表 - {selectedOrder.orderNumber}
              </h3>
              <button
                onClick={handleCloseDetails}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">閉じる</span>
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">依頼日</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedOrder.constructionDate}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">顧客コード</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedOrder.customerCode}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">クロージャ番号</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedOrder.closureNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">加入者名</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedOrder.customerName}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">住所</label>
                <p className="mt-1 text-sm text-gray-900">{selectedOrder.address}</p>
              </div>

              {/* 地図アップロード */}
              <div className="border-t pt-4">
                <h4 className="text-md font-medium text-gray-900 mb-2">工事場所地図</h4>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleMapUpload}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <DocumentArrowUpIcon className="h-4 w-4 mr-2" />
                        地図PDFをアップロード
                      </button>
                      {selectedOrder.mapPdfPath && (
                        <Button
                          onClick={() => handleViewMap(selectedOrder)}
                          variant="primary"
                        >
                          <MapIcon className="h-4 w-4 mr-2" />
                          地図を表示
                        </Button>
                      )}
                    </div>
                    {selectedOrder.mapPdfPath && (
                      <span className="text-sm text-green-600 font-medium">
                        ✓ 地図PDF添付済み
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 進捗表の追加情報 */}
              <div className="border-t pt-4">
                <h4 className="text-md font-medium text-gray-900 mb-2">工事進捗</h4>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="grid grid-cols-1 gap-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">調査状況:</span>
                      <select
                        value={selectedOrder.surveyStatus || 'pending'}
                        onChange={(e) => handleStatusChange(selectedOrder.orderNumber, 'surveyStatus', e.target.value as 'pending' | 'in_progress' | 'completed')}
                        className={`rounded-md px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${getSelectColor(selectedOrder.surveyStatus || 'pending')}`}
                      >
                        <option value="pending" className="text-gray-600">未着手</option>
                        <option value="in_progress" className="text-blue-600">調査中</option>
                        <option value="completed" className="text-green-600">完了</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">共架OR添架許可申請:</span>
                      <select
                        value={selectedOrder.permissionStatus || 'pending'}
                        onChange={(e) => handleStatusChange(selectedOrder.orderNumber, 'permissionStatus', e.target.value as 'pending' | 'in_progress' | 'completed')}
                        className={`rounded-md px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${getSelectColor(selectedOrder.permissionStatus || 'pending')}`}
                      >
                        <option value="pending" className="text-gray-600">未申請</option>
                        <option value="in_progress" className="text-blue-600">申請中</option>
                        <option value="completed" className="text-green-600">許可済</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">工事状況:</span>
                      <select
                        value={selectedOrder.constructionStatus || 'pending'}
                        onChange={(e) => handleStatusChange(selectedOrder.orderNumber, 'constructionStatus', e.target.value as 'pending' | 'in_progress' | 'completed')}
                        className={`rounded-md px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${getSelectColor(selectedOrder.constructionStatus || 'pending')}`}
                      >
                        <option value="pending" className="text-gray-600">未着手</option>
                        <option value="in_progress" className="text-blue-600">工事中</option>
                        <option value="completed" className="text-green-600">完了</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleCloseDetails}
                variant="secondary"
              >
                閉じる
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* アポイント履歴モーダル */}
      {showAppointmentModal && appointmentOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                アポイント履歴 - {appointmentOrder.customerName}
              </h3>
              <button
                onClick={handleCloseAppointmentModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">閉じる</span>
                ✕
              </button>
            </div>

            {/* スケジュール確認エリア */}
            <div className="mb-6 bg-white border rounded-lg p-4">
              <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                <CalendarDaysIcon className="h-5 w-5 mr-2" />
                スケジュール確認
              </h4>

              {/* カレンダーナビゲーション */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => calendarViewMode === 'month' ? navigateScheduleMonth('prev') : navigateScheduleWeek('prev')}
                    className="p-2 hover:bg-gray-100 rounded-md"
                  >
                    <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
                  </button>
                  <h4 className="text-lg font-semibold text-gray-900">
                    {calendarViewMode === 'month'
                      ? `${scheduleCalendarDate.getFullYear()}年${scheduleCalendarDate.getMonth() + 1}月`
                      : getWeekRangeLabel()
                    }
                  </h4>
                  <button
                    onClick={() => calendarViewMode === 'month' ? navigateScheduleMonth('next') : navigateScheduleWeek('next')}
                    className="p-2 hover:bg-gray-100 rounded-md"
                  >
                    <ChevronRightIcon className="h-5 w-5 text-gray-600" />
                  </button>
                </div>

                <div className="flex items-center space-x-3">
                  {/* 表示モード切り替え */}
                  <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-md">
                    <button
                      onClick={() => setCalendarViewMode('month')}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        calendarViewMode === 'month'
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      📅 月
                    </button>
                    <button
                      onClick={() => setCalendarViewMode('week')}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        calendarViewMode === 'week'
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      📊 週
                    </button>
                  </div>

                  {/* フィルターボタン */}
                  <div className="relative">
                    <button
                      onClick={() => setShowFilterPanel(!showFilterPanel)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <FunnelIcon className="h-4 w-4 mr-2" />
                      フィルター
                      {visibleFilterCount < totalFilterCount && (
                        <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                          {visibleFilterCount}/{totalFilterCount}
                        </span>
                      )}
                    </button>

                    {/* フィルターパネル */}
                    {showFilterPanel && (
                      <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-96 overflow-y-auto">
                        <div className="p-3 space-y-2">
                          {/* すべて選択 */}
                          <div className="flex items-center pb-2 border-b border-gray-200">
                            <input
                              type="checkbox"
                              checked={visibleFilterCount === totalFilterCount}
                              onChange={(e) => handleToggleAll(e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 text-sm font-medium text-gray-900">
                              すべて選択
                              <span className="ml-2 text-xs text-gray-500">
                                ({visibleFilterCount}/{totalFilterCount})
                              </span>
                            </label>
                          </div>

                          {/* 協力会社ごとのフィルター */}
                          {Array.from(new Set(teamFilters.map(f => f.contractorId))).map(contractorId => {
                            const contractorTeams = teamFilters.filter(f => f.contractorId === contractorId)
                            const checkState = getContractorCheckState(contractorId)
                            const colorClass = contractorTeams[0]?.color === 'blue' ? 'text-blue-600' :
                                             contractorTeams[0]?.color === 'green' ? 'text-green-600' :
                                             contractorTeams[0]?.color === 'purple' ? 'text-purple-600' : 'text-gray-600'

                            return (
                              <div key={contractorId} className="space-y-1">
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={checkState !== 'none'}
                                    ref={el => {
                                      if (el) el.indeterminate = checkState === 'some'
                                    }}
                                    onChange={(e) => handleToggleContractor(contractorId, e.target.checked)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  />
                                  <label className="ml-2 text-sm font-medium text-gray-900 flex items-center">
                                    <span className={`mr-2 ${colorClass}`}>●</span>
                                    {contractorTeams[0]?.contractorName}
                                    <span className="ml-2 text-xs text-gray-500">
                                      ({contractorTeams.filter(t => t.isVisible).length}/{contractorTeams.length})
                                    </span>
                                  </label>
                                </div>

                                {/* 班フィルター */}
                                <div className="ml-6 space-y-1">
                                  {contractorTeams.map(team => (
                                    <div key={team.teamId} className="flex items-center">
                                      <input
                                        type="checkbox"
                                        checked={team.isVisible}
                                        onChange={(e) => handleToggleTeam(team.teamId, e.target.checked)}
                                        className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                      />
                                      <label className="ml-2 text-sm text-gray-700">
                                        {team.teamName}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 月表示 */}
              {calendarViewMode === 'month' && (
              <>
              <div className="bg-white border rounded-lg overflow-hidden mb-3">
                <div className="grid grid-cols-7 gap-0 border-b border-gray-200">
                  {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
                    <div key={day} className={`p-2 text-center text-xs font-medium ${
                      index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : 'text-gray-700'
                    } bg-gray-50 border-r border-gray-200 last:border-r-0`}>
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-0">
                  {(() => {
                    const today = new Date()
                    const firstDay = new Date(scheduleCalendarDate.getFullYear(), scheduleCalendarDate.getMonth(), 1)
                    const startDate = new Date(firstDay)
                    startDate.setDate(startDate.getDate() - firstDay.getDay())

                    const days = []
                    for (let i = 0; i < 42; i++) {
                      const date = new Date(startDate)
                      date.setDate(startDate.getDate() + i)
                      days.push(date)
                    }

                    return days.map((date, index) => {
                      const dateStr = date.toISOString().slice(0, 10)
                      const daySchedules = filteredSchedules.filter(schedule => schedule.assignedDate === dateStr)
                      const dayExclusions = filteredExclusions.filter(exclusion => exclusion.date === dateStr)
                      const isCurrentMonth = date.getMonth() === scheduleCalendarDate.getMonth()
                      const isToday = date.toDateString() === today.toDateString()

                      return (
                        <div
                          key={index}
                          className={`min-h-20 p-1 border-r border-b border-gray-200 last:border-r-0 cursor-pointer hover:bg-blue-50 ${
                            !isCurrentMonth ? 'bg-gray-50' : 'bg-white'
                          } ${selectedScheduleDate === dateStr ? 'bg-blue-100 border-blue-300' : ''} ${
                            isToday ? 'ring-2 ring-blue-500' : ''
                          }`}
                          onClick={() => handleScheduleDateClick(date)}
                        >
                          <div className={`text-xs font-medium mb-1 ${
                            !isCurrentMonth ? 'text-gray-400' :
                            isToday ? 'text-blue-600' : 'text-gray-900'
                          }`}>
                            {date.getDate()}
                          </div>

                          {/* スケジュール詳細表示 */}
                          <div className="space-y-0.5">
                            {daySchedules.slice(0, 2).map((schedule, idx) => (
                              <div
                                key={idx}
                                className={`text-[10px] p-0.5 rounded truncate ${
                                  schedule.contractor === '直営班' ? 'bg-blue-100 text-blue-800' :
                                  schedule.contractor === '栄光電気' ? 'bg-green-100 text-green-800' :
                                  'bg-purple-100 text-purple-800'
                                }`}
                              >
                                <div className="truncate">{schedule.contractor}{schedule.teamName ? ` - ${schedule.teamName}` : ''}</div>
                              </div>
                            ))}

                            {/* 除外日表示 */}
                            {dayExclusions.slice(0, 2 - Math.min(daySchedules.length, 2)).map((exclusion, idx) => (
                              <div
                                key={`exclusion-${idx}`}
                                className="text-[10px] p-0.5 rounded truncate bg-red-50 border border-red-200"
                              >
                                <div className="truncate text-red-700 font-medium">🚫 {exclusion.contractor} - {exclusion.teamName}</div>
                              </div>
                            ))}

                            {(daySchedules.length + dayExclusions.length) > 2 && (
                              <div className="text-[10px] text-gray-500 text-center">
                                +{(daySchedules.length + dayExclusions.length) - 2}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })
                  })()}
                </div>
              </div>

              {/* 説明文 */}
              <div className="p-2 bg-blue-50 rounded-md mb-3">
                <div className="text-xs text-blue-800">
                  <p>📅 日付をクリックして詳細スケジュールを確認できます</p>
                </div>
              </div>
            </>
            )}

              {/* 週表示 */}
              {calendarViewMode === 'week' && (() => {
                const teamGroups = getTeamGroups()
                const weekColumns = getWeekViewColumns()
                const columnWidth = getColumnWidth(teamGroups.length)
                const totalColumns = weekColumns.length

                if (teamGroups.length === 0) {
                  return (
                    <div className="text-center py-8 text-gray-500">
                      フィルターで班を選択してください
                    </div>
                  )
                }

                return (
                  <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      {/* 2段ヘッダー */}
                      <div className="grid border-b-2 border-gray-300" style={{gridTemplateColumns: `60px repeat(${totalColumns}, ${columnWidth})`}}>
                        {/* 第1行: 左上の空白 + 班名（7列span） */}
                        <div className="bg-gray-100 border-r border-gray-300" /> {/* 時刻列ヘッダー */}
                        {teamGroups.map((group) => (
                          <div
                            key={group.teamId}
                            className={`text-center font-semibold text-sm py-2 border-r border-gray-300 ${
                              group.color === 'blue' ? 'bg-blue-100 text-blue-900' :
                              group.color === 'green' ? 'bg-green-100 text-green-900' :
                              group.color === 'purple' ? 'bg-purple-100 text-purple-900' : 'bg-gray-100'
                            }`}
                            style={{gridColumn: `span ${group.columnCount}`}}
                          >
                            {group.displayName}
                          </div>
                        ))}
                      </div>

                      {/* 第2行: 時刻列ヘッダー + 日付（各1列） */}
                      <div className="grid border-b border-gray-300" style={{gridTemplateColumns: `60px repeat(${totalColumns}, ${columnWidth})`}}>
                        <div className="bg-gray-50 text-center text-xs font-medium text-gray-600 py-2 border-r border-gray-300">
                          時刻
                        </div>
                        {weekColumns.map((col) => (
                          <div
                            key={`${col.teamId}-${col.dateStr}`}
                            className="bg-gray-50 text-center text-xs font-medium text-gray-700 py-2 border-r border-gray-300"
                          >
                            {col.displayName}
                          </div>
                        ))}
                      </div>

                      {/* タイムグリッド */}
                      <div className="relative">
                        {/* 背景: 時間行 */}
                        {getHourlyTimeSlots().map((hour) => (
                          <div
                            key={hour}
                            className="grid border-b border-gray-100"
                            style={{gridTemplateColumns: `60px repeat(${totalColumns}, ${columnWidth})`, height: '4rem'}}
                          >
                            {/* 時刻セル */}
                            <div className="bg-gray-50 text-center text-xs text-gray-600 py-1 border-r-2 border-gray-300 flex items-start justify-center">
                              {hour}
                            </div>
                            {/* 空の列セル */}
                            {weekColumns.map((col) => (
                              <div
                                key={`${col.teamId}-${col.dateStr}-${hour}`}
                                className="border-r border-gray-200"
                              />
                            ))}
                          </div>
                        ))}

                        {/* 前景: スケジュールと除外日の絶対配置レイヤー */}
                        <div
                          className="absolute inset-0 pointer-events-none grid"
                          style={{gridTemplateColumns: `60px repeat(${totalColumns}, ${columnWidth})`}}
                        >
                          <div /> {/* 時刻列のスペーサー */}
                          {weekColumns.map((col) => {
                            const layout = calculateSeparatedLayout(filteredSchedules, filteredExclusions, col.teamId, col.dateStr)

                            return (
                              <div key={`${col.teamId}-${col.dateStr}-overlay`} className="relative border-r border-gray-200">
                                {/* 除外日 */}
                                {layout.exclusions.map((item, idx) => {
                                  const timeSlot = getExclusionTimeSlot(item.data)
                                  return (
                                    <div
                                      key={`exclusion-${item.data.id}-${idx}`}
                                      className="absolute border-2 border-dashed border-red-500 bg-red-50 rounded p-1 overflow-hidden pointer-events-auto cursor-pointer hover:opacity-90"
                                      style={{
                                        top: calculateTopPosition(timeSlot),
                                        height: calculateHeight(timeSlot),
                                        width: item.width,
                                        left: item.left,
                                        zIndex: 10
                                      }}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleScheduleDateClick(col.date)
                                      }}
                                    >
                                      <div className="text-[10px] text-red-700 font-medium italic truncate">
                                        🚫 {getExclusionTimeText(item.data)}
                                      </div>
                                      <div className="text-[9px] text-red-600 italic truncate">
                                        {item.data.reason}
                                      </div>
                                    </div>
                                  )
                                })}

                                {/* スケジュール */}
                                {layout.schedules.map((item, idx) => {
                                  const bgColorClass = col.color === 'blue' ? 'bg-blue-500' :
                                                      col.color === 'green' ? 'bg-green-500' :
                                                      col.color === 'purple' ? 'bg-purple-500' : 'bg-gray-500'

                                  return (
                                    <div
                                      key={`schedule-${item.data.customerCode}-${idx}`}
                                      className={`absolute ${bgColorClass} text-white rounded p-1 overflow-hidden pointer-events-auto cursor-pointer hover:opacity-90`}
                                      style={{
                                        top: calculateTopPosition(item.data.timeSlot),
                                        height: calculateHeight(item.data.timeSlot),
                                        width: item.width,
                                        left: item.left,
                                        zIndex: 5
                                      }}
                                      title={`${item.data.customerName} - ${item.data.address}`}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleScheduleDateClick(col.date)
                                      }}
                                    >
                                      <div className="text-[10px] font-semibold truncate">
                                        {item.data.timeSlot}
                                      </div>
                                      <div className="text-[9px] truncate">
                                        {item.data.customerName}
                                      </div>
                                      {item.data.workType && (
                                        <div className="text-[8px] truncate opacity-90">
                                          {item.data.workType}
                                        </div>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })()}

              {/* 共通: 選択日の詳細スケジュール表示 */}
              {selectedScheduleDate && (
                <div className="border-t pt-3 mt-3">
                  <h5 className="text-sm font-medium text-gray-900 mb-2">
                    📅 {selectedScheduleDate} の詳細スケジュール
                  </h5>
                  <div className="space-y-2">
                    {filteredSchedules
                      .filter(schedule => schedule.assignedDate === selectedScheduleDate)
                      .map((schedule, index) => (
                        <div key={index} className={`p-3 rounded-lg border ${
                          schedule.contractor === '直営班' ? 'bg-blue-50 border-blue-200' :
                          schedule.contractor === '栄光電気' ? 'bg-green-50 border-green-200' :
                          'bg-purple-50 border-purple-200'
                        }`}>
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-xs">{schedule.timeSlot}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                              schedule.contractor === '直営班' ? 'bg-blue-100 text-blue-800' :
                              schedule.contractor === '栄光電気' ? 'bg-green-100 text-green-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {schedule.contractor}{schedule.teamName ? ` - ${schedule.teamName}` : ''}
                            </span>
                          </div>
                          <div className="space-y-1">
                            {schedule.customerCode && (
                              <div className="text-[10px] text-gray-700">
                                <span className="font-medium">顧客コード:</span> {schedule.customerCode}
                              </div>
                            )}
                            {schedule.customerName && (
                              <div className="text-[10px] text-gray-700">
                                <span className="font-medium">名前:</span> {schedule.customerName}
                              </div>
                            )}
                            {schedule.address && (
                              <div className="text-[10px] text-gray-600">
                                <span className="font-medium">場所:</span> {schedule.address}
                              </div>
                            )}
                            {schedule.workType && (
                              <div className="text-[10px] text-gray-600">
                                <span className="font-medium">工事内容:</span> {schedule.workType}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                    {/* 除外日の詳細表示 */}
                    {filteredExclusions
                      .filter(exclusion => exclusion.date === selectedScheduleDate)
                      .map((exclusion, index) => (
                        <div key={`exclusion-detail-${index}`} className="p-3 rounded-lg border-2 border-dashed border-red-300 bg-red-50">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-xs text-red-700">🚫 {getExclusionTimeText(exclusion)}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                              {exclusion.contractor} - {exclusion.teamName}
                            </span>
                          </div>
                          <div className="text-[10px] text-red-600 italic">
                            除外理由: {exclusion.reason}
                          </div>
                        </div>
                      ))}

                    {filteredSchedules.filter(schedule => schedule.assignedDate === selectedScheduleDate).length === 0 &&
                     filteredExclusions.filter(exclusion => exclusion.date === selectedScheduleDate).length === 0 && (
                      <div className="text-center py-3">
                        <p className="text-xs text-gray-500">✅ この日は予定がありません</p>
                        <p className="text-[10px] text-gray-400 mt-1">アポイント設定に最適です</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 顧客情報 */}
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">顧客名</label>
                  <p className="mt-1 text-sm text-gray-900">{appointmentOrder.customerName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">住所</label>
                  <p className="mt-1 text-sm text-gray-900">{appointmentOrder.address}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">電話番号</label>
                  <p className="mt-1 text-sm text-gray-900">{appointmentOrder.phoneNumber}</p>
                </div>
              </div>
            </div>

            {/* アポイント履歴 */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-md font-medium text-gray-900">アポイント履歴</h4>
                <Button
                  onClick={handleAddAppointment}
                  variant="primary"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  新規追加
                </Button>
              </div>

              <div className="space-y-3">
                {(appointmentOrder.appointmentHistory || []).map((appointment) => (
                  <div key={appointment.id} className="border rounded-lg p-4 bg-white">
                    {editingAppointment?.id === appointment.id ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">日付</label>
                            <input
                              type="date"
                              value={appointmentDate}
                              onChange={(e) => setAppointmentDate(e.target.value)}
                              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">開始時刻</label>
                            <input
                              type="time"
                              value={appointmentTime}
                              onChange={(e) => handleStartTimeChange(e.target.value)}
                              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">終了時刻</label>
                            <input
                              type="time"
                              value={appointmentEndTime}
                              onChange={(e) => handleEndTimeChange(e.target.value)}
                              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">ステータス</label>
                          <select
                            value={editingAppointment.status}
                            onChange={(e) => setEditingAppointment({...editingAppointment, status: e.target.value as '工事決定' | '保留' | '不通'})}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900"
                          >
                            <option value="工事決定">工事決定</option>
                            <option value="保留">保留</option>
                            <option value="不通">不通</option>
                          </select>
                        </div>
                        <Textarea
                          label="会話内容"
                          value={editingAppointment.content}
                          onChange={(e) => setEditingAppointment({...editingAppointment, content: e.target.value})}
                          rows={3}
                        />
                        <div className="flex space-x-2">
                          <Button
                            onClick={handleSaveAppointment}
                            variant="primary"
                            size="sm"
                          >
                            保存
                          </Button>
                          <Button
                            onClick={() => setEditingAppointment(null)}
                            variant="secondary"
                            size="sm"
                          >
                            キャンセル
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-gray-900">
                              {new Date(appointment.date).toLocaleDateString('ja-JP')}
                            </span>
                            <span className="text-sm text-blue-600 font-medium">
                              {new Date(appointment.date).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                              {appointment.endTime && ` - ${appointment.endTime}`}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(appointment.status)}`}>
                              {appointment.status}
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditAppointment(appointment)}
                              className="text-blue-600 hover:text-blue-900 text-sm"
                            >
                              編集
                            </button>
                            <button
                              onClick={() => handleDeleteAppointment(appointment.id)}
                              className="text-red-600 hover:text-red-900 text-sm"
                            >
                              削除
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700">{appointment.content}</p>
                      </div>
                    )}
                  </div>
                ))}

                {/* 新規追加フォーム */}
                {isAddingAppointment && editingAppointment && (
                  <div className="border rounded-lg p-4 bg-blue-50">
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">日付</label>
                          <input
                            type="date"
                            value={appointmentDate}
                            onChange={(e) => setAppointmentDate(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">開始時刻</label>
                          <input
                            type="time"
                            value={appointmentTime}
                            onChange={(e) => handleStartTimeChange(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">終了時刻</label>
                          <input
                            type="time"
                            value={appointmentEndTime}
                            onChange={(e) => handleEndTimeChange(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">ステータス</label>
                        <select
                          value={editingAppointment.status}
                          onChange={(e) => setEditingAppointment({...editingAppointment, status: e.target.value as '工事決定' | '保留' | '不通'})}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white"
                        >
                          <option value="工事決定">工事決定</option>
                          <option value="保留">保留</option>
                          <option value="不通">不通</option>
                        </select>
                      </div>
                      <Textarea
                        label="会話内容"
                        value={editingAppointment.content}
                        onChange={(e) => setEditingAppointment({...editingAppointment, content: e.target.value})}
                        rows={3}
                        placeholder="アポイント内容を入力してください"
                      />
                      <div className="flex space-x-2">
                        <Button
                          onClick={handleSaveAppointment}
                          variant="primary"
                          size="sm"
                        >
                          追加
                        </Button>
                        <Button
                          onClick={() => {
                            setEditingAppointment(null)
                            setIsAddingAppointment(false)
                          }}
                          variant="secondary"
                          size="sm"
                        >
                          キャンセル
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleCloseAppointmentModal}
                variant="secondary"
              >
                閉じる
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* カレンダーピッカーモーダル */}
      {showCalendarPicker && (
        <CalendarPicker
          selectedDate={appointmentDate}
          onDateSelect={handleDateSelectFromCalendar}
          onClose={handleCloseCalendarPicker}
          existingSchedules={sampleSchedules}
          exclusions={sampleExclusions}
        />
      )}

      </div>
    </Layout>
  );
}