import React, { useMemo, useState } from 'react'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline'
import { ConstructionRequest, ConstructionStatus } from '@/features/applications/types'
import { Contractor, Team } from '@/features/contractor/types'
import { getTeamsByContractorId } from '@/features/contractor/lib/contractorStorage'
import { Badge, BadgeVariant } from '@/shared/components/ui'

interface ConstructionTabProps {
  data: ConstructionRequest[]
  contractors: Contractor[]
  teams: Team[]
  onEdit: (item: ConstructionRequest) => void
}

export default function ConstructionTab({ data, contractors, teams, onEdit }: ConstructionTabProps) {
  const [orderNumberFilter, setOrderNumberFilter] = useState('')
  const [customerNameFilter, setCustomerNameFilter] = useState('')
  const [constructionTypeFilter, setConstructionTypeFilter] = useState('')
  const [contractorIdFilter, setContractorIdFilter] = useState('')
  const [teamIdFilter, setTeamIdFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<'' | ConstructionStatus>('')

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
    setConstructionTypeFilter('')
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

      // 工事種別
      if (constructionTypeFilter && r.constructionType !== constructionTypeFilter) {
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
  }, [data, orderNumberFilter, customerNameFilter, constructionTypeFilter, contractorIdFilter, teamIdFilter, statusFilter])

  const getStatusBadge = (status: ConstructionStatus): BadgeVariant => {
    const variantMap: Record<ConstructionStatus, BadgeVariant> = {
      未着手: 'default',
      施工中: 'info',
      完了: 'success',
      一部完了: 'warning',
      中止: 'danger',
      延期: 'warning',
      保留: 'default',
    }
    return variantMap[status]
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

          {/* 工事種別 */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              工事種別
            </label>
            <select
              value={constructionTypeFilter}
              onChange={(e) => setConstructionTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 text-sm"
            >
              <option value="">全て</option>
              <option value="宅内引込">宅内引込</option>
              <option value="撤去">撤去</option>
              <option value="移設">移設</option>
              <option value="その他">その他</option>
            </select>
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
              onChange={(e) => setStatusFilter(e.target.value as '' | ConstructionStatus)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 text-sm"
            >
              <option value="">全て</option>
              <option value="未着手">未着手</option>
              <option value="施工中">施工中</option>
              <option value="完了">完了</option>
              <option value="一部完了">一部完了</option>
              <option value="中止">中止</option>
              <option value="延期">延期</option>
              <option value="保留">保留</option>
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
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100 text-left text-xs text-gray-600">
                <th className="px-3 py-2 font-medium whitespace-nowrap">整理番号</th>
                <th className="px-3 py-2 font-medium whitespace-nowrap">受注番号</th>
                <th className="px-3 py-2 font-medium whitespace-nowrap">顧客名</th>
                <th className="px-3 py-2 font-medium whitespace-nowrap">住所</th>
                <th className="px-3 py-2 font-medium whitespace-nowrap">工事種別</th>
                <th className="px-3 py-2 font-medium whitespace-nowrap">依頼先</th>
                <th className="px-3 py-2 font-medium whitespace-nowrap">状態</th>
                <th className="px-3 py-2 font-medium whitespace-nowrap">工事予定日</th>
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
                  <td className="px-3 py-2 text-gray-900">{r.constructionType || '-'}</td>
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
                  <td className="px-3 py-2 text-gray-900">{r.constructionDate || '-'}</td>
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
                  <td colSpan={9} className="px-3 py-10 text-center text-sm text-gray-500">
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
