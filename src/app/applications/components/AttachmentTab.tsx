import React, { useMemo, useState } from 'react'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline'
import { AttachmentRequest, AttachmentStatus, AssigneeType } from '@/types/application'

interface AttachmentTabProps {
  data: AttachmentRequest[]
  onEdit: (item: AttachmentRequest) => void
}

export default function AttachmentTab({ data, onEdit }: AttachmentTabProps) {
  const [orderFilter, setOrderFilter] = useState('')
  const [customerFilter, setCustomerFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<'全て' | AttachmentStatus>('全て')
  const [assigneeFilter, setAssigneeFilter] = useState<'全て' | AssigneeType>('全て')

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

  const getStatusBadge = (status: AttachmentStatus) => {
    const colors = {
      受付: 'bg-blue-100 text-blue-800',
      提出済: 'bg-yellow-100 text-yellow-800',
      許可: 'bg-green-100 text-green-800',
      取下げ: 'bg-gray-200 text-gray-800',
    }
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[status]}`}
      >
        {status}
      </span>
    )
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
              onChange={(e) =>
                setStatusFilter(e.target.value as '全て' | AttachmentStatus)
              }
              className="w-full px-2 py-2 rounded-md border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="全て">全て</option>
              <option value="受付">受付</option>
              <option value="提出済">提出済</option>
              <option value="許可">許可</option>
              <option value="取下げ">取下げ</option>
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
                <th className="px-3 py-2 font-medium whitespace-nowrap">契約No.</th>
                <th className="px-3 py-2 font-medium whitespace-nowrap">顧客名</th>
                <th className="px-3 py-2 font-medium whitespace-nowrap">依頼先</th>
                <th className="px-3 py-2 font-medium whitespace-nowrap">提出日</th>
                <th className="px-3 py-2 font-medium whitespace-nowrap">許可日</th>
                <th className="px-3 py-2 font-medium whitespace-nowrap">状態</th>
                <th className="px-3 py-2 font-medium whitespace-nowrap">取下げ</th>
                <th className="px-3 py-2 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody className="text-gray-900">
              {filtered.map((r) => (
                <tr key={r.id} className="border-t text-sm odd:bg-white even:bg-gray-50">
                  <td className="px-3 py-2 tabular-nums text-gray-900">{r.serialNumber}</td>
                  <td className="px-3 py-2 font-medium text-gray-900">{r.orderNumber || '-'}</td>
                  <td className="px-3 py-2 text-gray-900">{r.contractNo || '-'}</td>
                  <td className="px-3 py-2 text-gray-900">{r.customerName || '-'}</td>
                  <td className="px-3 py-2 text-gray-900">
                    {r.assigneeType === 'internal' ? (
                      <span className="text-blue-600 font-medium">自社 - {r.teamName}</span>
                    ) : (
                      <span className="text-gray-900">{r.contractorName} - {r.teamName}</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-gray-900">{r.submittedAt || '-'}</td>
                  <td className="px-3 py-2 text-gray-900">{r.approvedAt || '-'}</td>
                  <td className="px-3 py-2">{getStatusBadge(r.status)}</td>
                  <td className="px-3 py-2">
                    {r.withdrawNeeded ? (
                      <span className="text-red-600 text-xs font-semibold">要</span>
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </td>
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
                  <td colSpan={10} className="px-3 py-10 text-center text-sm text-gray-500">
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
