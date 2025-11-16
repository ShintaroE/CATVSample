import React, { useMemo, useState } from 'react'
import {
  FunnelIcon,
  PencilSquareIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'
import { AttachmentRequest, AttachmentStatus } from '@/features/applications/types'
import { Contractor } from '@/features/contractor/types'
import { getTeamsByContractorId } from '@/features/contractor/lib/contractorStorage'
import { Badge, BadgeVariant } from '@/shared/components/ui'

interface AttachmentTabProps {
  data: AttachmentRequest[]
  contractors: Contractor[]
  onEdit: (item: AttachmentRequest) => void
}

export default function AttachmentTab({ data, contractors, onEdit }: AttachmentTabProps) {
  // フィルター状態
  const [orderNumberFilter, setOrderNumberFilter] = useState('')
  const [applicationTypeFilter, setApplicationTypeFilter] = useState<'' | '個別' | '集合'>('')
  const [customerCodeFilter, setCustomerCodeFilter] = useState('')
  const [apartmentCodeFilter, setApartmentCodeFilter] = useState('')
  const [contractorIdFilter, setContractorIdFilter] = useState('')
  const [teamIdFilter, setTeamIdFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<'' | AttachmentStatus>('')
  const [postConstructionReportFilter, setPostConstructionReportFilter] = useState<'' | 'completed' | 'notCompleted' | 'notRequired'>('')

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
    setApplicationTypeFilter('')
    setCustomerCodeFilter('')
    setApartmentCodeFilter('')
    setContractorIdFilter('')
    setTeamIdFilter('')
    setStatusFilter('')
    setPostConstructionReportFilter('')
  }

  // データフィルタリング
  const filtered = useMemo(() => {
    return data.filter((r) => {
      // 受注番号 (部分一致)
      if (orderNumberFilter && !(r.orderNumber || '').includes(orderNumberFilter)) {
        return false
      }

      // 個別/集合
      if (applicationTypeFilter && r.propertyType !== applicationTypeFilter) {
        return false
      }

      // 顧客コード (部分一致)
      if (customerCodeFilter && !(r.customerCode || '').includes(customerCodeFilter)) {
        return false
      }

      // 集合コード (部分一致) - 集合の場合のみチェック
      if (apartmentCodeFilter) {
        if (r.propertyType === '集合') {
          if (!(r.collectiveCode || '').includes(apartmentCodeFilter)) {
            return false
          }
        } else {
          // 個別の場合は集合コードでフィルタリングできない
          return false
        }
      }

      // 依頼先
      if (contractorIdFilter && r.contractorId !== contractorIdFilter) {
        return false
      }

      // 班
      if (teamIdFilter && r.teamId !== teamIdFilter) {
        return false
      }

      // 状態
      if (statusFilter && r.status !== statusFilter) {
        return false
      }

      // 工事後報告
      if (postConstructionReportFilter) {
        if (postConstructionReportFilter === 'completed') {
          // 完了：postConstructionReport === true かつ status === '許可'
          if (!r.postConstructionReport || r.status !== '許可') {
            return false
          }
        }
        if (postConstructionReportFilter === 'notCompleted') {
          // 未完了：postConstructionReport === true かつ status !== '許可'
          if (!r.postConstructionReport || r.status === '許可') {
            return false
          }
        }
        if (postConstructionReportFilter === 'notRequired') {
          // 不要：postConstructionReport === false
          if (r.postConstructionReport) {
            return false
          }
        }
      }

      return true
    })
  }, [
    data,
    orderNumberFilter,
    applicationTypeFilter,
    customerCodeFilter,
    apartmentCodeFilter,
    contractorIdFilter,
    teamIdFilter,
    statusFilter,
    postConstructionReportFilter,
  ])

  const getStatusBadge = (status: AttachmentStatus): BadgeVariant => {
    const variantMap: Record<AttachmentStatus, BadgeVariant> = {
      受付: 'info',
      提出済: 'warning',
      許可: 'success',
      不許可: 'danger',
      取下げ: 'default',
    }
    return variantMap[status]
  }

  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}/${month}/${day}`
  }

  return (
    <div>
      {/* 絞り込みパネル */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center">
            <FunnelIcon className="w-4 h-4 mr-1.5" />
            絞り込み条件
          </h3>
          {/* 表示件数 */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <ChartBarIcon className="w-4 h-4 text-gray-500" />
              <Badge
                variant={filtered.length !== data.length ? 'info' : 'default'}
                size="sm"
                className="font-semibold"
              >
                表示: {filtered.length}件
              </Badge>
              <Badge variant="default" size="sm" className="font-normal">
                全: {data.length}件
              </Badge>
            </div>
          </div>
        </div>

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

          {/* 個別/集合 */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              個別/集合
            </label>
            <select
              value={applicationTypeFilter}
              onChange={(e) => setApplicationTypeFilter(e.target.value as '' | '個別' | '集合')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 text-sm"
            >
              <option value="">全て</option>
              <option value="個別">個別</option>
              <option value="集合">集合</option>
            </select>
          </div>

          {/* 顧客コード */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              顧客コード
            </label>
            <input
              type="text"
              value={customerCodeFilter}
              onChange={(e) => setCustomerCodeFilter(e.target.value)}
              placeholder="123456789"
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 text-sm placeholder:text-gray-400"
            />
            <p className="text-xs text-gray-500 mt-1">※個別物件のみ</p>
          </div>

          {/* 集合コード */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              集合コード
            </label>
            <input
              type="text"
              value={apartmentCodeFilter}
              onChange={(e) => setApartmentCodeFilter(e.target.value)}
              placeholder="K001"
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 text-sm placeholder:text-gray-400"
            />
            <p className="text-xs text-gray-500 mt-1">※集合物件のみ</p>
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
              <option value="不許可">不許可</option>
              <option value="取下げ">取下げ</option>
            </select>
          </div>

          {/* 工事後報告 */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              工事後報告
            </label>
            <select
              value={postConstructionReportFilter}
              onChange={(e) => setPostConstructionReportFilter(e.target.value as '' | 'completed' | 'notCompleted' | 'notRequired')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 text-sm"
            >
              <option value="">全て</option>
              <option value="completed">完了</option>
              <option value="notCompleted">未完了</option>
              <option value="notRequired">不要</option>
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
              <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                受注番号
              </th>
              <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                個別/集合
              </th>
              <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                顧客コード
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                顧客名
              </th>
              <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                集合住宅コード
              </th>
              <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                集合住宅名
              </th>
              <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                住所
              </th>
              <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                依頼先
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状態
              </th>
              <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                依頼日
              </th>
              <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                申請提出日
              </th>
              <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                申請許可日
              </th>
              <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                申請要否
              </th>
              <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                取下げ
              </th>
              <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                工事後報告
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={17} className="px-4 py-8 text-center text-sm text-gray-500">
                  条件に一致するデータがありません
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  {/* 整理番号 */}
                  <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap tabular-nums">
                    {r.serialNumber}
                  </td>

                  {/* 受注番号 */}
                  <td className="hidden md:table-cell px-4 py-3 text-sm text-gray-900 whitespace-nowrap font-medium">
                    {r.orderNumber || '-'}
                  </td>

                  {/* 個別/集合 */}
                  <td className="hidden md:table-cell px-4 py-3 text-sm whitespace-nowrap">
                    <Badge
                      variant={r.propertyType === '個別' ? 'info' : r.propertyType === '集合' ? 'warning' : 'default'}
                      size="sm"
                    >
                      {r.propertyType || '-'}
                    </Badge>
                  </td>

                  {/* 顧客コード */}
                  <td className="hidden lg:table-cell px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                    {r.propertyType === '個別' ? (r.customerCode || '-') : '-'}
                  </td>

                  {/* 顧客名 */}
                  <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                    {r.propertyType === '個別' ? (r.customerName || '-') : (r.collectiveHousingName || '-')}
                  </td>

                  {/* 集合住宅コード */}
                  <td className="hidden lg:table-cell px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                    {r.propertyType === '集合' ? (r.collectiveCode || '-') : '-'}
                  </td>

                  {/* 集合住宅名 */}
                  <td className="hidden lg:table-cell px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                    {r.propertyType === '集合' ? (r.collectiveHousingName || '-') : '-'}
                  </td>

                  {/* 住所 */}
                  <td className="hidden lg:table-cell px-4 py-3 text-sm text-gray-900" title={r.address}>
                    {r.address || '-'}
                  </td>

                  {/* 依頼先 */}
                  <td className="hidden md:table-cell px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                    {r.assigneeType === 'internal' ? (
                      <span className="text-blue-600 font-medium">自社 - {r.teamName}</span>
                    ) : (
                      <span className="text-gray-900">{r.contractorName} - {r.teamName}</span>
                    )}
                  </td>

                  {/* 状態 */}
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    <Badge variant={getStatusBadge(r.status)} size="sm">
                      {r.status}
                    </Badge>
                  </td>

                  {/* 依頼日 */}
                  <td className="hidden lg:table-cell px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                    {formatDate(r.requestedAt)}
                  </td>

                  {/* 申請提出日 */}
                  <td className="hidden lg:table-cell px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                    {formatDate(r.submittedAt)}
                  </td>

                  {/* 申請許可日 */}
                  <td className="hidden lg:table-cell px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                    {formatDate(r.approvedAt)}
                  </td>

                  {/* 申請要否 */}
                  <td className="hidden lg:table-cell px-4 py-3 text-sm text-gray-900 whitespace-nowrap text-center">
                    {r.withdrawNeeded === true ? (
                      <span className="text-red-600 text-sm font-semibold">要</span>
                    ) : r.withdrawNeeded === false ? (
                      <span className="text-gray-600 text-sm">不要</span>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>

                  {/* 取下げ */}
                  <td className="hidden lg:table-cell px-4 py-3 text-sm whitespace-nowrap text-center">
                    {r.withdrawCreated ? (
                      <Badge variant="success" size="sm">作成済</Badge>
                    ) : r.withdrawNeeded ? (
                      <Badge variant="danger" size="sm">未作成</Badge>
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </td>

                  {/* 工事後報告 */}
                  <td className="hidden lg:table-cell px-4 py-3 text-sm whitespace-nowrap text-center">
                    {r.postConstructionReport ? (
                      r.status === '許可' ? (
                        <Badge variant="success" size="sm">完了</Badge>
                      ) : (
                        <Badge variant="warning" size="sm">未完了</Badge>
                      )
                    ) : (
                      <Badge variant="default" size="sm">不要</Badge>
                    )}
                  </td>

                  {/* 操作 */}
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
    </div>
  )
}
