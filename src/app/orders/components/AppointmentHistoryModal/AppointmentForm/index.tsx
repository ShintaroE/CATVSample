'use client'

import React from 'react'
import { useAppointments } from '../../../hooks/useAppointments'
import { Button, Textarea } from '@/shared/components/ui'

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
              const newStatus = e.target.value as '工事決定' | '調査日決定' | '保留' | '不通' | '留守電'
              const currentAppointment = appointmentHooks.editingAppointment
              if (!currentAppointment) return

              appointmentHooks.setEditingAppointment({
                id: currentAppointment.id || '',
                date: currentAppointment.date || '',
                endTime: currentAppointment.endTime,
                status: newStatus,
                content: currentAppointment.content || '',
                scheduleInfo: currentAppointment.scheduleInfo
              })
              // 工事決定・調査日決定以外ではスケジュール情報をクリア
              if (newStatus !== '工事決定' && newStatus !== '調査日決定') {
                appointmentHooks.setSelectedTeams([])
              }
            }}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white"
          >
            <option value="不通">不通</option>
            <option value="保留">保留</option>
            <option value="留守電">留守電</option>
            <option value="調査日決定">調査日決定</option>
            <option value="工事決定">工事決定</option>
          </select>
        </div>
        {(appointmentHooks.editingAppointment.status === '工事決定' ||
          appointmentHooks.editingAppointment.status === '調査日決定') && (
          <div className="bg-green-50 p-3 rounded-md border border-green-200">
            <h5 className="text-sm font-medium text-green-900 mb-2">
              📅 スケジュール登録情報（{appointmentHooks.editingAppointment.status === '工事決定' ? '工事' : '現地調査'}）
            </h5>

            {/* 選択済み班リスト */}
            {appointmentHooks.selectedTeams.length > 0 && (
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">選択済み担当班</label>
                <div className="space-y-2">
                  {appointmentHooks.selectedTeams.map(team => (
                    <div key={team.teamId} className="flex items-center justify-between p-2 bg-white rounded border">
                      <span className="text-sm">{team.contractorName} - {team.teamName}</span>
                      <button
                        onClick={() => appointmentHooks.handleRemoveTeam(team.teamId)}
                        className="text-red-600 hover:text-red-800 text-sm"
                        type="button"
                      >
                        削除
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 班追加ドロップダウン */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">班を追加</label>
              <select
                onChange={(e) => appointmentHooks.handleAddTeam(e.target.value)}
                value=""
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900"
              >
                <option value="">班を選択してください</option>
                {appointmentHooks.allTeams.map(team => (
                  <option
                    key={team.id}
                    value={team.id}
                    disabled={appointmentHooks.selectedTeams.some(t => t.teamId === team.id)}
                  >
                    {team.contractorName} - {team.teamName}
                  </option>
                ))}
              </select>
            </div>

            {/* 作業時間 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {appointmentHooks.editingAppointment.status === '工事決定' ? '工事' : '調査'}開始時刻 *
                </label>
                <input
                  type="time"
                  value={appointmentHooks.workStartTime}
                  onChange={(e) => appointmentHooks.setWorkStartTime(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {appointmentHooks.editingAppointment.status === '工事決定' ? '工事' : '調査'}終了時刻 *
                </label>
                <input
                  type="time"
                  value={appointmentHooks.workEndTime}
                  onChange={(e) => appointmentHooks.setWorkEndTime(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900"
                />
              </div>
            </div>
            <p className="text-xs text-green-700 mt-2">
              ※ 協力会社・班・時間を入力すると、{appointmentHooks.editingAppointment.status === '工事決定' ? '工事' : '現地調査'}スケジュールに自動登録されます
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

