import React, { useMemo, useState } from 'react'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline'
import { SurveyRequest, SurveyStatus, AssigneeType, SurveyFeasibility } from '@/features/applications/types'
import { Badge, BadgeVariant } from '@/shared/components/ui'

interface SurveyTabProps {
  data: SurveyRequest[]
  onEdit: (item: SurveyRequest) => void
}

export default function SurveyTab({ data, onEdit }: SurveyTabProps) {
  const [orderFilter, setOrderFilter] = useState('')
  const [customerFilter, setCustomerFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<'全て' | SurveyStatus>('全て')
  const [assigneeFilter, setAssigneeFilter] = useState<'全て' | AssigneeType | 'internal'>('全て')

  const filtered = useMemo(() => {
    return data.filter((r) => {
      const orderOk = orderFilter ? (r.orderNumber || '').includes(orderFilter) : true
      const customerOk = customerFilter
        ? (r.customerCode || '').includes(customerFilter) ||
          (r.customerName || '').includes(customerFilter)
        : true
      const statusOk = statusFilter === '全て' || r.status === statusFilter
      const assigneeOk =
        assigneeFilter === '全て' || r.assigneeType === assigneeFilter
      return orderOk && customerOk && statusOk && assigneeOk
    })
  }, [data, orderFilter, customerFilter, statusFilter, assigneeFilter])

  const getStatusBadge = (status: SurveyStatus): BadgeVariant => {
    const variantMap: Record<SurveyStatus, BadgeVariant> = {
      未着手: 'default',
      調査中: 'warning',
      完了: 'success',
      キャンセル: 'danger',
    }
    return variantMap[status]
  }

  const getFeasibilityBadge = (feasibility: SurveyFeasibility): BadgeVariant => {
    const variantMap: Record<SurveyFeasibility, BadgeVariant> = {
      可能: 'success',
      条件付き可能: 'warning',
      要確認: 'info',
      不可: 'danger',
      未判定: 'default',
    }
    return variantMap[feasibility]
  }

  const formatDateTime = (isoString?: string): string => {
    if (!isoString) return '-'
    const date = new Date(isoString)
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const hour = date.getHours().toString().padStart(2, '0')
    const minute = date.getMinutes().toString().padStart(2, '0')
    return `${year}-${month}-${day} ${hour}:${minute}`
  }

  return (
    <div>
      {/* フィルタ */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
        <div className="relative">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={orderFilter}
            onChange={(e) => setOrderFilter(e.target.value)}
            placeholder="受注番号で絞り込み"
            className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="relative">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
            placeholder="顧客名・コードで絞り込み"
            className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as '全て' | SurveyStatus)}
              className="w-full px-2 py-2 rounded-md border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="全て">全て</option>
              <option value="未着手">未着手</option>
              <option value="調査中">調査中</option>
              <option value="完了">完了</option>
              <option value="キャンセル">キャンセル</option>
            </select>
          </div>
        </div>
        <div>
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value as '全て' | AssigneeType)}
            className="w-full px-2 py-2 rounded-md border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="全て">全て</option>
            <option value="internal">自社</option>
            <option value="contractor">協力会社</option>
          </select>
        </div>
      </div>

      {/* テーブル */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100 text-left text-xs text-gray-600">
                <th className="px-3 py-2 font-medium whitespace-nowrap">整理番号</th>
                <th className="px-3 py-2 font-medium whitespace-nowrap">受注番号</th>
                <th className="px-3 py-2 font-medium whitespace-nowrap">顧客名</th>
                <th className="px-3 py-2 font-medium whitespace-nowrap">住所</th>
                <th className="px-3 py-2 font-medium whitespace-nowrap">依頼先</th>
                <th className="px-3 py-2 font-medium whitespace-nowrap">状態</th>
                <th className="px-3 py-2 font-medium whitespace-nowrap">工事可否</th>
                <th className="px-3 py-2 font-medium whitespace-nowrap">依頼日</th>
                <th className="px-3 py-2 font-medium whitespace-nowrap">予定日</th>
                <th className="px-3 py-2 font-medium whitespace-nowrap">完了日</th>
                <th className="px-3 py-2 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody className="text-gray-900">
              {filtered.map((r) => (
                <tr key={r.id} className="border-t text-sm odd:bg-white even:bg-gray-50">
                  <td className="px-3 py-2 tabular-nums text-gray-900">{r.serialNumber}</td>
                  <td className="px-3 py-2 font-medium text-gray-900">{r.orderNumber || '-'}</td>
                  <td className="px-3 py-2 text-gray-900">{r.customerName || '-'}</td>
                  <td className="px-3 py-2 text-gray-900 max-w-[12rem] truncate" title={r.address}>
                    {r.address || '-'}
                  </td>
                  <td className="px-3 py-2 text-gray-900">
                    {r.assigneeType === 'internal' ? (
                      <span className="text-blue-600 font-medium">自社 - {r.teamName}</span>
                    ) : (
                      <span className="text-gray-900">{r.contractorName} - {r.teamName}</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <Badge variant={getStatusBadge(r.status)} size="sm">
                      {r.status}
                    </Badge>
                  </td>
                  <td className="px-3 py-2">
                    {r.feasibilityResult ? (
                      <div className="flex flex-col gap-1">
                        <Badge variant={getFeasibilityBadge(r.feasibilityResult.feasibility)} size="sm">
                          {r.feasibilityResult.feasibility}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatDateTime(r.feasibilityResult.reportedAt)}
                        </span>
                      </div>
                    ) : (
                      <Badge variant="default" size="sm">未判定</Badge>
                    )}
                  </td>
                  <td className="px-3 py-2 text-gray-900">{r.requestedAt || '-'}</td>
                  <td className="px-3 py-2 text-gray-900">{r.scheduledDate || '-'}</td>
                  <td className="px-3 py-2 text-gray-900">{r.completedAt || '-'}</td>
                  <td className="px-3 py-2 text-right">
                    <button
                      className="inline-flex items-center px-2 py-1 rounded border text-gray-700 hover:bg-gray-50 text-xs"
                      onClick={() => onEdit(r)}
                    >
                      <PencilSquareIcon className="w-4 h-4 mr-1" /> 編集
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr className="bg-white">
                  <td colSpan={11} className="px-3 py-10 text-center text-sm text-gray-500">
                    条件に一致するデータがありません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-3 py-2 text-xs text-gray-500 border-t">
          表示件数: {filtered.length} / 総件数: {data.length}
        </div>
      </div>
    </div>
  )
}
