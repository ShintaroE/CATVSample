import React, { useMemo, useState } from 'react'
import {
  FunnelIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline'
import { AttachmentRequest, AttachmentStatus, AttachmentNeeded } from '@/features/applications/types'
import { Contractor } from '@/features/contractor/types'
import { getTeamsByContractorId } from '@/features/contractor/lib/contractorStorage'
import { Badge, BadgeVariant } from '@/shared/components/ui'

interface AttachmentTabProps {
  data: AttachmentRequest[]
  contractors: Contractor[]
  onEdit: (item: AttachmentRequest) => void
}

export default function AttachmentTab({ data, contractors, onEdit }: AttachmentTabProps) {
  const [orderNumberFilter, setOrderNumberFilter] = useState('')
  const [customerNameFilter, setCustomerNameFilter] = useState('')
  const [contractorIdFilter, setContractorIdFilter] = useState('')
  const [teamIdFilter, setTeamIdFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<'' | AttachmentStatus>('')

  // 依頼先選択時に利用可能な班を取得
  const availableTeams = useMemo(() => {
    if (!contractorIdFilter) return []
    return getTeamsByContractorId(contractorIdFilter)
  }, [contractorIdFilter])

  // 依頼先変更時に班フィルタをリセット
  const handleContractorChange = (contractorId: string) => {
    setContractorIdFilter(contractorId)
    setTeamIdFilter('')
  }

  // フィルタクリア
  const handleClearFilters = () => {
    setOrderNumberFilter('')
    setCustomerNameFilter('')
    setContractorIdFilter('')
    setTeamIdFilter('')
    setStatusFilter('')
  }

  const filtered = useMemo(() => {
    return data.filter((r) => {
      // 受注番号
      if (orderNumberFilter && !(r.orderNumber || '').includes(orderNumberFilter)) {
        return false
      }

      // 顧客名
      if (customerNameFilter && !(r.customerName || '').includes(customerNameFilter)) {
        return false
      }

      // 依頼先
      if (contractorIdFilter && r.contractorId !== contractorIdFilter) {
        return false
      }

      // 班
      if (contractorIdFilter && teamIdFilter && r.teamId !== teamIdFilter) {
        return false
      }

      // 状態
      if (statusFilter && r.status !== statusFilter) {
        return false
      }

      return true
    })
  }, [data, orderNumberFilter, customerNameFilter, contractorIdFilter, teamIdFilter, statusFilter])

  const getStatusBadge = (status: AttachmentStatus): BadgeVariant => {
    const variantMap: Record<AttachmentStatus, BadgeVariant> = {
      受付: 'info',
      調査済み: 'warning',
      完了: 'success',
    }
    return variantMap[status]
  }

  const getApplicationNeededBadge = (needed: AttachmentNeeded): BadgeVariant => {
    const variantMap: Record<AttachmentNeeded, BadgeVariant> = {
      必要: 'danger',
      不要: 'success',
      未確認: 'default',
    }
    return variantMap[needed]
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
      {/* 絞り込みパネル */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
          <FunnelIcon className="w-4 h-4 mr-1.5" />
          絞り込み条件
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 受注番号 */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              受注番号
            </label>
            <input
              type="text"
              value={orderNumberFilter}
              onChange={(e) => setOrderNumberFilter(e.target.value)}
              placeholder="2024031500001"
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 text-sm placeholder:text-gray-400"
            />
          </div>

          {/* 顧客名 */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              顧客名
            </label>
            <input
              type="text"
              value={customerNameFilter}
              onChange={(e) => setCustomerNameFilter(e.target.value)}
              placeholder="山田太郎"
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 text-sm placeholder:text-gray-400"
            />
          </div>

          {/* 依頼先 */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              依頼先
            </label>
            <select
              value={contractorIdFilter}
              onChange={(e) => handleContractorChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 text-sm"
            >
              <option value="">全て</option>
              {contractors.filter(c => c.isActive).map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* 班 */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              班
            </label>
            <select
              value={teamIdFilter}
              onChange={(e) => setTeamIdFilter(e.target.value)}
              disabled={!contractorIdFilter}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 text-sm disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              <option value="">全て</option>
              {availableTeams.filter(t => t.isActive).map(t => (
                <option key={t.id} value={t.id}>{t.teamName}</option>
              ))}
            </select>
          </div>

          {/* 状態 */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              状態
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as '' | AttachmentStatus)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 text-sm"
            >
              <option value="">全て</option>
              <option value="受付">受付</option>
              <option value="提出済">提出済</option>
              <option value="許可">許可</option>
              <option value="取下げ">取下げ</option>
            </select>
          </div>
        </div>

        {/* クリアボタン */}
        <div className="flex justify-end mt-4">
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            クリア
          </button>
        </div>
      </div>

      {/* テーブル */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                整理番号
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                受注番号
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                顧客名
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                依頼先
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                提出日
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                許可日
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状態
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                申請有無
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                取下げ
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-sm text-gray-500">
                  条件に一致するデータがありません
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap tabular-nums">
                    {r.serialNumber}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap font-medium">
                    {r.orderNumber || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                    {r.customerName || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                    {r.assigneeType === 'internal' ? (
                      <span className="text-blue-600 font-medium">自社 - {r.teamName}</span>
                    ) : (
                      <span className="text-gray-900">{r.contractorName} - {r.teamName}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                    {r.submittedAt || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                    {r.approvedAt || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    <Badge variant={getStatusBadge(r.status)} size="sm">
                      {r.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    {r.applicationReport ? (
                      <div className="flex flex-col gap-1">
                        <Badge variant={getApplicationNeededBadge(r.applicationReport.applicationNeeded)} size="sm">
                          {r.applicationReport.applicationNeeded}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatDateTime(r.applicationReport.reportedAt)}
                        </span>
                      </div>
                    ) : (
                      <Badge variant="default" size="sm">未確認</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    {r.withdrawNeeded ? (
                      <span className="text-red-600 text-xs font-semibold">要</span>
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    <button
                      className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={() => onEdit(r)}
                    >
                      <PencilSquareIcon className="h-4 w-4 mr-1" />
                      編集
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2 text-xs text-gray-500 bg-white rounded-b-lg">
        表示件数: {filtered.length} / 総件数: {data.length}
      </div>
    </div>
  )
}
