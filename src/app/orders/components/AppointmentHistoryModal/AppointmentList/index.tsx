'use client'

import React from 'react'
import { OrderData } from '../../../types'
import { useAppointments } from '../../../hooks/useAppointments'
import AppointmentForm from '../AppointmentForm'

interface AppointmentListProps {
  order: OrderData
  appointmentHooks: ReturnType<typeof useAppointments>
  onDelete: (orderNumber: string, appointmentId: string) => void
  onSave: () => void
}

export default function AppointmentList({
  order,
  appointmentHooks,
  onDelete,
  onSave,
}: AppointmentListProps) {
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case '工事決定':
        return 'bg-green-100 text-green-800'
      case '保留':
        return 'bg-yellow-100 text-yellow-800'
      case '不通':
        return 'bg-red-100 text-red-800'
      case '留守電':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-3">
      {(order.appointmentHistory || []).map((appointment) => (
        <div key={appointment.id} className="border rounded-lg p-4 bg-white">
          {appointmentHooks.editingAppointment?.id === appointment.id ? (
            <AppointmentForm
              appointmentHooks={appointmentHooks}
              onSave={onSave}
              onCancel={() => appointmentHooks.resetAppointmentForm()}
            />
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
                    onClick={() => appointmentHooks.handleEditAppointment(appointment)}
                    className="text-blue-600 hover:text-blue-900 text-sm"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => appointmentHooks.deleteAppointment(order, appointment.id, onDelete)}
                    className="text-red-600 hover:text-red-900 text-sm"
                  >
                    削除
                  </button>
                </div>
              </div>
              {appointment.scheduleInfo && appointment.scheduleInfo.assignedTeams.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2 text-xs">
                  {appointment.scheduleInfo.assignedTeams.map((team, idx) => (
                    <span key={idx} className="inline-flex items-center px-2 py-1 rounded-md bg-green-100 text-green-800 font-medium">
                      📅 {team.contractorName} - {team.teamName}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-sm text-gray-700">{appointment.content}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

