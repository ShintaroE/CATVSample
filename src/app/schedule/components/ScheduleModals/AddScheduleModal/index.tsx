'use client'

import React, { useState } from 'react'
import { ScheduleItem, AssignedTeam, STATUSES } from '../../../types'
import { Button, Input, Textarea } from '@/shared/components/ui'
import { getContractors, getTeams } from '@/features/contractor/lib/contractorStorage'

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
  const [newSchedule, setNewSchedule] = useState<Partial<ScheduleItem>>({
    orderNumber: '',
    customerName: '',
    address: '',
    workType: '',
    contractor: '直営班',
    assignedDate: selectedDate,
    timeSlot: '09:00-12:00',
    status: '予定',
    memo: '',
    assignedTeams: []
  })
  const [selectedTeams, setSelectedTeams] = useState<AssignedTeam[]>([])

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

  const handleSave = () => {
    onSave({
      ...newSchedule,
      id: String(Date.now()),
      assignedTeams: selectedTeams,
      contractorId: selectedTeams[0]?.contractorId || '',
      contractor: selectedTeams[0]?.contractorName || '直営班',
    } as ScheduleItem)
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">新規スケジュール登録</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="受注番号"
              type="text"
              value={newSchedule.orderNumber || ''}
              onChange={(e) => setNewSchedule({ ...newSchedule, orderNumber: e.target.value })}
            />
            <Input
              label="顧客名"
              type="text"
              value={newSchedule.customerName || ''}
              onChange={(e) => setNewSchedule({ ...newSchedule, customerName: e.target.value })}
            />
          </div>
          <Input
            label="住所"
            type="text"
            value={newSchedule.address || ''}
            onChange={(e) => setNewSchedule({ ...newSchedule, address: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="工事日"
              type="date"
              value={newSchedule.assignedDate || selectedDate}
              onChange={(e) => setNewSchedule({ ...newSchedule, assignedDate: e.target.value })}
            />
            <Input
              label="時間帯"
              type="text"
              value={newSchedule.timeSlot || ''}
              onChange={(e) => setNewSchedule({ ...newSchedule, timeSlot: e.target.value })}
              placeholder="09:00-12:00"
            />
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
          <div>
            <label className="block text-sm font-medium text-gray-700">ステータス</label>
            <select
              value={newSchedule.status || '予定'}
              onChange={(e) => setNewSchedule({ ...newSchedule, status: e.target.value as typeof STATUSES[number] })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900"
            >
              {STATUSES.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <Textarea
            label="備考"
            value={newSchedule.memo || ''}
            onChange={(e) => setNewSchedule({ ...newSchedule, memo: e.target.value })}
            rows={3}
          />
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <Button onClick={onClose} variant="secondary">キャンセル</Button>
          <Button onClick={handleSave} variant="primary">登録</Button>
        </div>
      </div>
    </div>
  )
}

