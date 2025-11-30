'use client'

import React, { useState } from 'react'
import { ScheduleItem, AssignedTeam, ScheduleType } from '@/features/calendar/types'
import { Button, Input, Textarea } from '@/shared/components/ui'
import { getContractors, getTeams } from '@/features/contractor/lib/contractorStorage'
import OrderSearchModal from '@/shared/components/order/OrderSearchModal'
import { OrderData } from '@/app/orders/types'

interface AddScheduleModalProps {
  selectedDate: string
  onSave: (schedule: ScheduleItem) => void
  onClose: () => void
}

export default function AddScheduleModal({
  selectedDate,
  onSave,
  onClose,
}: AddScheduleModalProps) {
  const [scheduleType, setScheduleType] = useState<ScheduleType>('construction')
  const [orderNumber, setOrderNumber] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [collectiveHousingName, setCollectiveHousingName] = useState('')
  const [address, setAddress] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [assignedDate, setAssignedDate] = useState(selectedDate)
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('12:00')
  const [memo, setMemo] = useState('')
  const [selectedTeams, setSelectedTeams] = useState<AssignedTeam[]>([])
  const [showOrderSearchModal, setShowOrderSearchModal] = useState(false)

  const handleAddTeam = (teamId: string) => {
    const team = getTeams().find(t => t.id === teamId)
    const contractor = getContractors().find(c => c.id === team?.contractorId)
    if (team && contractor && !selectedTeams.some(t => t.teamId === teamId)) {
      setSelectedTeams(prev => [...prev, {
        contractorId: contractor.id,
        contractorName: contractor.name,
        teamId: team.id,
        teamName: team.teamName
      }])
    }
  }

  const handleRemoveTeam = (teamId: string) => {
    setSelectedTeams(prev => prev.filter(t => t.teamId !== teamId))
  }

  const handleOrderSelect = (order: OrderData) => {
    // 受注番号（必須）
    setOrderNumber(order.orderNumber)

    // 物件種別によって分岐
    if (order.constructionCategory === '個別') {
      setCustomerName(order.customerName)
      setCollectiveHousingName('')
    } else {
      setCustomerName('')
      setCollectiveHousingName(order.collectiveHousingName || '')
    }

    // 共通項目
    setAddress(order.address || '')
    setPhoneNumber(order.phoneNumber || '')

    setShowOrderSearchModal(false)
  }

  const handleSave = () => {
    const timeSlot = `${startTime}-${endTime}`

    onSave({
      id: String(Date.now()),
      scheduleType,
      orderNumber,
      customerName,
      collectiveHousingName: collectiveHousingName || undefined,
      address,
      phoneNumber: phoneNumber || undefined,
      assignedDate,
      timeSlot,
      memo: memo || undefined,
      assignedTeams: selectedTeams,
      contractorId: selectedTeams[0]?.contractorId || '',
      contractor: selectedTeams[0]?.contractorName as '直営班' | '栄光電気' | 'スライヴ' || '直営班',
      teamId: selectedTeams[0]?.teamId,
      teamName: selectedTeams[0]?.teamName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">新規スケジュール登録</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="space-y-4">
          {/* 種別選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">種別</label>
            <div className="flex gap-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="scheduleType"
                  value="construction"
                  checked={scheduleType === 'construction'}
                  onChange={(e) => setScheduleType(e.target.value as ScheduleType)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 flex items-center gap-1">
                  🔧 工事
                </span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="scheduleType"
                  value="survey"
                  checked={scheduleType === 'survey'}
                  onChange={(e) => setScheduleType(e.target.value as ScheduleType)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 flex items-center gap-1">
                  📋 現地調査
                </span>
              </label>
            </div>
          </div>

          {/* 受注番号 */}
          <Input
            label="受注番号"
            type="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            required
            placeholder="例: 2024031500001"
            endAdornment={
              <Button
                variant="secondary"
                onClick={() => setShowOrderSearchModal(true)}
                type="button"
              >
                🔍 検索
              </Button>
            }
          />

          {/* 顧客名・集合住宅名 */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="顧客名"
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
            <Input
              label="集合住宅名"
              type="text"
              value={collectiveHousingName}
              onChange={(e) => setCollectiveHousingName(e.target.value)}
            />
          </div>

          {/* 住所・電話番号 */}
          <Input
            label="住所"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
          <Input
            label="電話番号"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />

          {/* 日付 */}
          <Input
            label="日付"
            type="date"
            value={assignedDate}
            onChange={(e) => setAssignedDate(e.target.value)}
            required
          />

          {/* 時間帯（時刻ピッカー） */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">時間帯</label>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="開始時刻"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
              <Input
                label="終了時刻"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">担当班</label>
            {selectedTeams.length > 0 ? (
              <div className="space-y-2 mb-2">
                {selectedTeams.map(team => (
                  <div key={team.teamId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">{team.contractorName} - {team.teamName}</span>
                    <button
                      onClick={() => handleRemoveTeam(team.teamId)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      削除
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 mb-3">班が選択されていません</div>
            )}
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleAddTeam(e.target.value)
                  e.target.value = ''
                }
              }}
              className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900"
            >
              <option value="">班を追加...</option>
              {getContractors().map(contractor => {
                const teams = getTeams().filter(t => t.contractorId === contractor.id && t.isActive)
                return (
                  <optgroup key={contractor.id} label={contractor.name}>
                    {teams.map(team => (
                      <option
                        key={team.id}
                        value={team.id}
                        disabled={selectedTeams.some(t => t.teamId === team.id)}
                      >
                        {team.teamName}
                      </option>
                    ))}
                  </optgroup>
                )
              })}
            </select>
          </div>

          {/* 備考 */}
          <Textarea
            label="備考"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={3}
          />
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <Button onClick={onClose} variant="secondary">キャンセル</Button>
          <Button onClick={handleSave} variant="primary">登録</Button>
        </div>
      </div>

      {/* 受注情報検索モーダル */}
      <OrderSearchModal
        isOpen={showOrderSearchModal}
        onClose={() => setShowOrderSearchModal(false)}
        onSelect={handleOrderSelect}
      />
    </div>
  )
}

