'use client'

import React from 'react'
import { useAppointments } from '../../../hooks/useAppointments'
import { Button, Textarea } from '@/shared/components/ui'
import { getContractors } from '@/features/contractor/lib/contractorStorage'

interface AppointmentFormProps {
  appointmentHooks: ReturnType<typeof useAppointments>
  onSave: () => void
  onCancel: () => void
}

export default function AppointmentForm({
  appointmentHooks,
  onSave,
  onCancel,
}: AppointmentFormProps) {
  if (!appointmentHooks.editingAppointment) return null

  return (
    <div className="border rounded-lg p-4 bg-blue-50">
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">日付</label>
            <input
              type="date"
              value={appointmentHooks.appointmentDate}
              onChange={(e) => appointmentHooks.setAppointmentDate(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">開始時刻</label>
            <input
              type="time"
              value={appointmentHooks.appointmentTime}
              onChange={(e) => appointmentHooks.setAppointmentTime(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">終了時刻</label>
            <input
              type="time"
              value={appointmentHooks.appointmentEndTime}
              onChange={(e) => appointmentHooks.setAppointmentEndTime(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">ステータス</label>
          <select
            value={appointmentHooks.editingAppointment.status}
            onChange={(e) => {
              const newStatus = e.target.value as '工事決定' | '保留' | '不通' | '留守電'
              appointmentHooks.setEditingAppointment({
                ...appointmentHooks.editingAppointment,
                status: newStatus
              })
              if (newStatus !== '工事決定') {
                appointmentHooks.handleContractorChange('')
              }
            }}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white"
          >
            <option value="工事決定">工事決定</option>
            <option value="保留">保留</option>
            <option value="不通">不通</option>
            <option value="留守電">留守電</option>
          </select>
        </div>
        {appointmentHooks.editingAppointment.status === '工事決定' && (
          <div className="bg-green-50 p-3 rounded-md border border-green-200">
            <h5 className="text-sm font-medium text-green-900 mb-2">📅 スケジュール登録情報</h5>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">工事会社 *</label>
                <select
                  value={appointmentHooks.selectedContractorId}
                  onChange={(e) => appointmentHooks.handleContractorChange(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900"
                >
                  <option value="">選択してください</option>
                  {getContractors().filter(c => c.isActive).map(contractor => (
                    <option key={contractor.id} value={contractor.id}>
                      {contractor.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">班 *</label>
                <select
                  value={appointmentHooks.selectedTeamId}
                  onChange={(e) => appointmentHooks.setSelectedTeamId(e.target.value)}
                  disabled={!appointmentHooks.selectedContractorId}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">選択してください</option>
                  {appointmentHooks.availableTeams.map(team => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">工事開始時刻 *</label>
                <input
                  type="time"
                  value={appointmentHooks.workStartTime}
                  onChange={(e) => appointmentHooks.setWorkStartTime(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">工事終了時刻 *</label>
                <input
                  type="time"
                  value={appointmentHooks.workEndTime}
                  onChange={(e) => appointmentHooks.setWorkEndTime(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900"
                />
              </div>
            </div>
            <p className="text-xs text-green-700 mt-2">
              ※ 工事会社・班・時間を入力すると、スケジュールに自動登録されます
            </p>
          </div>
        )}
        <Textarea
          label="会話内容"
          value={appointmentHooks.editingAppointment.content}
          onChange={(e) => appointmentHooks.setEditingAppointment({
            ...appointmentHooks.editingAppointment!,
            content: e.target.value
          })}
          rows={3}
          placeholder="アポイント内容を入力してください"
          fullWidth
        />
        <div className="flex space-x-2">
          <Button
            onClick={onSave}
            variant="primary"
            size="sm"
          >
            {appointmentHooks.isAddingAppointment ? '追加' : '保存'}
          </Button>
          <Button
            onClick={onCancel}
            variant="secondary"
            size="sm"
          >
            キャンセル
          </Button>
        </div>
      </div>
    </div>
  )
}

