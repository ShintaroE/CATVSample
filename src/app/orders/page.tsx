'use client'

import React, { useState } from 'react'
import { DocumentArrowUpIcon, EyeIcon, MapIcon, ClockIcon, PlusIcon, CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import Layout from '@/components/Layout'
import CalendarPicker from '@/components/CalendarPicker'

interface AppointmentHistory {
  id: string
  date: string
  endTime?: string
  status: '工事決定' | '保留' | '不通'
  content: string
}

interface ExclusionEntry {
  id: string
  date: string
  reason: string
  contractor: string
  contractorId: string
  teamId: string
  teamName: string
  timeType: 'all_day' | 'am' | 'pm' | 'custom'
  startTime?: string
  endTime?: string
}

interface OrderData {
  orderNumber: string
  orderSource: string
  workContent: string
  customerCode: string
  customerType: '新規' | '既存'
  customerName: string
  constructionDate?: string
  closureNumber?: string
  address?: string
  phoneNumber?: string
  surveyStatus?: 'pending' | 'in_progress' | 'completed'
  permissionStatus?: 'pending' | 'in_progress' | 'completed'
  constructionStatus?: 'pending' | 'in_progress' | 'completed'
  mapPdfPath?: string
  appointmentHistory?: AppointmentHistory[]
}

const workContentOptions = [
  '個別対応',
  'HCNAー技術人工事',
  'G・6ch追加人工事',
  '放送波人工事'
]

// サンプル除外日データ
const sampleExclusions: ExclusionEntry[] = [
  {
    id: 'e1',
    date: '2025-09-30',
    reason: '社員研修',
    contractor: '栄光電気',
    contractorId: 'contractor-2',
    teamId: 'team-3',
    teamName: '1班',
    timeType: 'all_day',
  },
  {
    id: 'e2',
    date: '2025-10-01',
    reason: '定期メンテナンス',
    contractor: 'スライヴ',
    contractorId: 'contractor-3',
    teamId: 'team-4',
    teamName: '第1班',
    timeType: 'am',
  },
  {
    id: 'e3',
    date: '2025-10-02',
    reason: '車両点検',
    contractor: '直営班',
    contractorId: 'contractor-1',
    teamId: 'team-1',
    teamName: 'A班',
    timeType: 'custom',
    startTime: '13:00',
    endTime: '17:00',
  },
]

// サンプルスケジュールデータ（実際にはAPIから取得）
const sampleSchedules = [
  {
    assignedDate: '2025-09-29',
    timeSlot: '09:00-12:00',
    contractor: '直営班',
    contractorId: 'contractor-1',
    teamId: 'team-1',
    teamName: 'A班',
    status: '予定',
    customerCode: '2025091000001',
    customerName: '田中太郎',
    address: '倉敷市水島青葉町1-1-1',
    workType: '個別対応'
  },
  {
    assignedDate: '2025-09-29',
    timeSlot: '13:00-17:00',
    contractor: '栄光電気',
    contractorId: 'contractor-2',
    teamId: 'team-3',
    teamName: '1班',
    status: '作業中',
    customerCode: '2025091000002',
    customerName: '山田花子',
    address: '倉敷市中央2-5-8',
    workType: 'HCNA技術人工事'
  },
  {
    assignedDate: '2025-09-30',
    timeSlot: '09:00-12:00',
    contractor: 'スライヴ',
    contractorId: 'contractor-3',
    teamId: 'team-4',
    teamName: '第1班',
    status: '予定',
    customerCode: '2025091000003',
    customerName: '佐藤花子',
    address: '倉敷市児島駅前2-2-2',
    workType: 'HCNA技術人工事'
  },
  {
    assignedDate: '2025-10-01',
    timeSlot: '10:00-15:00',
    contractor: '直営班',
    contractorId: 'contractor-1',
    teamId: 'team-2',
    teamName: 'B班',
    status: '予定',
    customerCode: '2025091000004',
    customerName: '山田次郎',
    address: '倉敷市玉島中央町3-3-3',
    workType: 'G・6ch追加人工事'
  },
  {
    assignedDate: '2025-10-02',
    timeSlot: '09:00-11:00',
    contractor: '栄光電気',
    status: '予定',
    customerCode: '2025091000005',
    customerName: '鈴木一郎',
    address: '倉敷市連島町1-4-7',
    workType: '放送波人工事'
  },
  {
    assignedDate: '2025-10-02',
    timeSlot: '14:00-16:00',
    contractor: 'スライヴ',
    status: '予定',
    customerCode: '2025091000006',
    customerName: '高橋美咲',
    address: '倉敷市老松町2-8-15',
    workType: '個別対応'
  },
  {
    assignedDate: '2025-10-03',
    timeSlot: '終日',
    contractor: '直営班',
    status: '作業中',
    customerCode: '2025091000007',
    customerName: '渡辺健一',
    address: '倉敷市水島工業地帯',
    workType: '大規模回線工事'
  }
]

const sampleOrders: OrderData[] = [
  {
    orderNumber: '2025092900001',
    orderSource: 'KCT本社',
    workContent: '個別対応',
    customerCode: '123456789',
    customerType: '新規',
    customerName: '田中太郎',
    constructionDate: '2025-09-29',
    closureNumber: 'CL-001-A',
    address: '倉敷市水島青葉町1-1-1',
    phoneNumber: '086-123-4567',
    surveyStatus: 'completed',
    permissionStatus: 'in_progress',
    constructionStatus: 'pending',
    appointmentHistory: [
      {
        id: '1',
        date: '2025-09-25T10:00',
        endTime: '11:00',
        status: '保留',
        content: '詳細検討したい、後日連絡との事'
      },
      {
        id: '2',
        date: '2025-09-27T14:30',
        endTime: '15:30',
        status: '工事決定',
        content: '工事内容に合意、9月29日で調整'
      }
    ]
  },
  {
    orderNumber: '2025093000002',
    orderSource: 'KCT水島',
    workContent: 'HCNAー技術人工事',
    customerCode: '234567890',
    customerType: '既存',
    customerName: '佐藤花子',
    constructionDate: '2025-09-30',
    closureNumber: 'CL-002-B',
    address: '倉敷市児島駅前2-2-2',
    phoneNumber: '086-234-5678',
    surveyStatus: 'completed',
    permissionStatus: 'completed',
    constructionStatus: 'in_progress',
    appointmentHistory: [
      {
        id: '3',
        date: '2025-09-28T09:00',
        endTime: '10:00',
        status: '工事決定',
        content: '工事日程確定、立会い可能'
      }
    ]
  },
  {
    orderNumber: '2025100100003',
    orderSource: 'KCT玉島',
    workContent: 'G・6ch追加人工事',
    customerCode: '345678901',
    customerType: '新規',
    customerName: '山田次郎',
    constructionDate: '2025-10-01',
    closureNumber: 'CL-003-C',
    address: '倉敷市玉島中央町3-3-3',
    phoneNumber: '086-345-6789',
    surveyStatus: 'in_progress',
    permissionStatus: 'pending',
    constructionStatus: 'pending',
    appointmentHistory: [
      {
        id: '4',
        date: '2025-09-26T16:00',
        endTime: '16:30',
        status: '不通',
        content: '電話に出ず、後日再連絡'
      }
    ]
  }
]

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
    const dateStr = date.toISOString().slice(0, 10)
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
                        <button
                          onClick={() => handleViewMap(selectedOrder)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <MapIcon className="h-4 w-4 mr-2" />
                          地図を表示
                        </button>
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
              <button
                onClick={handleCloseDetails}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                閉じる
              </button>
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
                <button
                  onClick={() => navigateScheduleMonth('prev')}
                  className="p-2 hover:bg-gray-100 rounded-md"
                >
                  <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
                </button>
                <h4 className="text-lg font-semibold text-gray-900">
                  {scheduleCalendarDate.getFullYear()}年{scheduleCalendarDate.getMonth() + 1}月
                </h4>
                <button
                  onClick={() => navigateScheduleMonth('next')}
                  className="p-2 hover:bg-gray-100 rounded-md"
                >
                  <ChevronRightIcon className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              {/* カレンダー表示 */}
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
                      const daySchedules = sampleSchedules.filter(schedule => schedule.assignedDate === dateStr)
                      const dayExclusions = sampleExclusions.filter(exclusion => exclusion.date === dateStr)
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

              {/* 選択日の詳細スケジュール表示 */}
              {selectedScheduleDate && (
                <div className="border-t pt-3">
                  <h5 className="text-sm font-medium text-gray-900 mb-2">
                    📅 {selectedScheduleDate} の詳細スケジュール
                  </h5>
                  <div className="space-y-2">
                    {sampleSchedules
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
                    {sampleExclusions
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

                    {sampleSchedules.filter(schedule => schedule.assignedDate === selectedScheduleDate).length === 0 &&
                     sampleExclusions.filter(exclusion => exclusion.date === selectedScheduleDate).length === 0 && (
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
                <button
                  onClick={handleAddAppointment}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  新規追加
                </button>
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
                        <div>
                          <label className="block text-sm font-medium text-gray-700">会話内容</label>
                          <textarea
                            value={editingAppointment.content}
                            onChange={(e) => setEditingAppointment({...editingAppointment, content: e.target.value})}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900"
                            rows={3}
                          />
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={handleSaveAppointment}
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                          >
                            保存
                          </button>
                          <button
                            onClick={() => setEditingAppointment(null)}
                            className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                          >
                            キャンセル
                          </button>
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
                      <div>
                        <label className="block text-sm font-medium text-gray-700">会話内容</label>
                        <textarea
                          value={editingAppointment.content}
                          onChange={(e) => setEditingAppointment({...editingAppointment, content: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white"
                          rows={3}
                          placeholder="アポイント内容を入力してください"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSaveAppointment}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                        >
                          追加
                        </button>
                        <button
                          onClick={() => {
                            setEditingAppointment(null)
                            setIsAddingAppointment(false)
                          }}
                          className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                        >
                          キャンセル
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleCloseAppointmentModal}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                閉じる
              </button>
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