'use client'

import React from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'
import { OrderData, AppointmentHistory } from '../../types'
import { Button } from '@/shared/components/ui'
import ScheduleViewer from './ScheduleViewer'
import AppointmentList from './AppointmentList'
import AppointmentForm from './AppointmentForm'
import { useAppointments } from '../../hooks/useAppointments'

interface AppointmentHistoryModalProps {
  order: OrderData
  onUpdateAppointment: (orderNumber: string, appointment: AppointmentHistory) => void
  onDeleteAppointment: (orderNumber: string, appointmentId: string) => void
  onClose: () => void
}

export default function AppointmentHistoryModal({
  order,
  onUpdateAppointment,
  onDeleteAppointment,
  onClose,
}: AppointmentHistoryModalProps) {
  const appointmentHooks = useAppointments()

  const handleClose = () => {
    appointmentHooks.resetAppointmentForm()
    onClose()
  }

  const handleSaveAppointment = () => {
    appointmentHooks.saveAppointment(order, onUpdateAppointment)
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            アポイント履歴 - {order.customerName}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <span className="sr-only">閉じる</span>
            ✕
          </button>
        </div>

        {/* スケジュール確認エリア */}
        <ScheduleViewer />

        {/* 顧客情報 */}
        <div className="bg-gray-50 p-4 rounded-md mb-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">顧客名</label>
              <p className="mt-1 text-sm text-gray-900">{order.customerName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">住所</label>
              <p className="mt-1 text-sm text-gray-900">{order.address}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">電話番号</label>
              <p className="mt-1 text-sm text-gray-900">{order.phoneNumber}</p>
            </div>
          </div>
        </div>

        {/* アポイント履歴 */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-md font-medium text-gray-900">アポイント履歴</h4>
            <Button
              onClick={appointmentHooks.handleAddAppointment}
              variant="primary"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              新規追加
            </Button>
          </div>

          <AppointmentList
            order={order}
            appointmentHooks={appointmentHooks}
            onDelete={onDeleteAppointment}
            onSave={handleSaveAppointment}
          />

          {/* 新規追加フォーム */}
          {appointmentHooks.isAddingAppointment && appointmentHooks.editingAppointment && (
            <AppointmentForm
              appointmentHooks={appointmentHooks}
              onSave={handleSaveAppointment}
              onCancel={() => appointmentHooks.resetAppointmentForm()}
            />
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleClose}
            variant="secondary"
          >
            閉じる
          </Button>
        </div>
      </div>
    </div>
  )
}

