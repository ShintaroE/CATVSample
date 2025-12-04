import React, { useMemo, useState } from 'react'
import { PencilSquareIcon } from '@heroicons/react/24/outline'
import { ConstructionRequest, ConstructionStatus } from '@/features/applications/types'
import { Contractor } from '@/features/contractor/types'
import { getTeamsByContractorId } from '@/features/contractor/lib/contractorStorage'
import { Badge, BadgeVariant } from '@/shared/components/ui'
import FilterableTableLayout from '../../common/FilterableTableLayout'
import { useApplicationFilters } from '../../../hooks/useApplicationFilters'

interface ConstructionTabProps {
  data: ConstructionRequest[]
  contractors: Contractor[]
  onEdit: (item: ConstructionRequest) => void
}

const ConstructionTab: React.FC<ConstructionTabProps> = ({ data, contractors, onEdit }) => {
  // 共通フィルターフックを使用
  const {
    filters,
    baseFilteredData,
    updateFilter,
    clearFilters: clearBaseFilters,
    activeFilterCount: baseActiveFilterCount,
  } = useApplicationFilters(data)

  // Construction固有のフィルター
  const [statusFilter, setStatusFilter] = useState<'' | ConstructionStatus>('')
  const [reportRequiredFilter, setReportRequiredFilter] = useState<'' | 'required' | 'notRequired'>('')
  const [reportStatusFilter, setReportStatusFilter] = useState<'' | 'completed' | 'pending'>('')

  // Get teams for selected contractor
  const availableTeams = useMemo(() => {
    if (!filters.contractorId) return []
    return getTeamsByContractorId(filters.contractorId)
  }, [filters.contractorId])

  // Reset team filter when contractor changes（共通フックが自動的に行う）
  const handleContractorChange = (contractorId: string) => {
    updateFilter('contractorId', contractorId)
  }

  // フィルタクリア
  const handleClearFilters = () => {
    clearBaseFilters()
    setStatusFilter('')
    setReportRequiredFilter('')
    setReportStatusFilter('')
  }

  // 適用中のフィルター数をカウント
  let activeFilterCount = baseActiveFilterCount
  if (statusFilter) activeFilterCount++
  if (reportRequiredFilter) activeFilterCount++
  if (reportStatusFilter) activeFilterCount++

  // Badge variant functions
  const getStatusBadge = (status: ConstructionStatus): BadgeVariant => {
    const variantMap: Record<ConstructionStatus, BadgeVariant> = {
      未着手: 'default',
      依頼済み: 'info',
      工事日決定: 'warning',
      完了: 'success',
      工事返却: 'danger',
      工事キャンセル: 'danger',
    }
    return variantMap[status]
  }

  const getPostConstructionReportBadge = (item: ConstructionRequest): { variant: BadgeVariant; text: string } => {
    if (!item.postConstructionApplicationReport) {
      return { variant: 'default', text: '-' }
    }

    const report = item.postConstructionApplicationReport

    if (!report.required) {
      return { variant: 'default', text: '不要' }
    }

    if (report.status === 'completed') {
      return { variant: 'success', text: '要-完了' }
    }

    if (report.status === 'pending') {
      return { variant: 'warning', text: '要-未完了' }
    }

    return { variant: 'info', text: '要' }
  }

  // Construction固有のフィルターを適用
  const filteredData = useMemo(() => {
    return baseFilteredData.filter(item => {
      // 状態
      if (statusFilter && item.status !== statusFilter) {
        return false
      }

      // 工事後報告（要否）
      if (reportRequiredFilter) {
        if (reportRequiredFilter === 'required') {
          if (!item.postConstructionApplicationReport?.required) {
            return false
          }
        } else if (reportRequiredFilter === 'notRequired') {
          if (item.postConstructionApplicationReport?.required) {
            return false
          }
        }
      }

      // 工事後報告（完了状態） - 「要」の場合のみ有効
      if (reportStatusFilter && item.postConstructionApplicationReport?.required) {
        if (item.postConstructionApplicationReport.status !== reportStatusFilter) {
          return false
        }
      }

      return true
    })
  }, [baseFilteredData, statusFilter, reportRequiredFilter, reportStatusFilter])

  // フィルターJSX
  const filterElements = (
    <>
      {/* 受注番号 */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          受注番号
        </label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-sm"
          value={filters.orderNumber}
          onChange={(e) => updateFilter('orderNumber', e.target.value)}
          placeholder="受注番号で絞り込み"
        />
      </div>

      {/* 電話番号 */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          電話番号
        </label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-sm"
          value={filters.phoneNumber}
          onChange={(e) => updateFilter('phoneNumber', e.target.value)}
          placeholder="086-123-4567"
        />
      </div>

      {/* 個別/集合 */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          個別/集合
        </label>
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-sm"
          value={filters.propertyType}
          onChange={(e) => updateFilter('propertyType', e.target.value as '' | '個別' | '集合')}
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-sm placeholder:text-gray-400"
          value={filters.customerCode}
          onChange={(e) => updateFilter('customerCode', e.target.value)}
          placeholder="C123456"
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-sm placeholder:text-gray-400"
          value={filters.collectiveCode}
          onChange={(e) => updateFilter('collectiveCode', e.target.value)}
          placeholder="K001"
        />
        <p className="text-xs text-gray-500 mt-1">※集合物件のみ</p>
      </div>

      {/* 依頼先 */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          依頼先
        </label>
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-sm"
          value={filters.contractorId}
          onChange={(e) => handleContractorChange(e.target.value)}
        >
          <option value="">全て</option>
          {contractors.filter(c => c.isActive).map(contractor => (
            <option key={contractor.id} value={contractor.id}>
              {contractor.name}
            </option>
          ))}
        </select>
      </div>

      {/* 班 */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          班
        </label>
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-sm disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
          value={filters.teamId}
          onChange={(e) => updateFilter('teamId', e.target.value)}
          disabled={!filters.contractorId}
        >
          <option value="">全て</option>
          {availableTeams.filter(t => t.isActive).map(team => (
            <option key={team.id} value={team.id}>
              {team.teamName}
            </option>
          ))}
        </select>
      </div>

      {/* 状態 */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          状態
        </label>
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as '' | ConstructionStatus)}
        >
          <option value="">全て</option>
          <option value="未着手">未着手</option>
          <option value="依頼済み">依頼済み</option>
          <option value="工事日決定">工事日決定</option>
          <option value="完了">完了</option>
          <option value="工事返却">工事返却</option>
          <option value="工事キャンセル">工事キャンセル</option>
        </select>
      </div>

      {/* 工事後報告（要否） */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          工事後報告（要否）
        </label>
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-sm"
          value={reportRequiredFilter}
          onChange={(e) => setReportRequiredFilter(e.target.value as '' | 'required' | 'notRequired')}
        >
          <option value="">全て</option>
          <option value="required">必要</option>
          <option value="notRequired">不要</option>
        </select>
      </div>

      {/* 工事後報告（完了状態） */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          工事後報告（完了状態）
        </label>
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-sm disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
          value={reportStatusFilter}
          onChange={(e) => setReportStatusFilter(e.target.value as '' | 'completed' | 'pending')}
          disabled={reportRequiredFilter !== 'required'}
        >
          <option value="">全て</option>
          <option value="completed">完了</option>
          <option value="pending">未完了</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">※「要否」で「必要」を選択時のみ有効</p>
      </div>
    </>
  )

  return (
    <FilterableTableLayout
      totalCount={data.length}
      filteredCount={filteredData.length}
      activeFilterCount={activeFilterCount}
      onClearFilters={handleClearFilters}
      filters={filterElements}
    >
      <div className="w-full overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                整理番号
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                受注番号
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                個別/集合
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                顧客コード
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                顧客名
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                集合コード
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                集合住宅名
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                住所
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                依頼先
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                状態
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                工事依頼日
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                工事予定日
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                工事完了日
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                工事後報告
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={15} className="px-4 py-8 text-center text-sm text-gray-500">
                  データがありません
                </td>
              </tr>
            ) : (
              filteredData.map((item) => {
                const reportBadge = getPostConstructionReportBadge(item)
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap tabular-nums">
                      {item.serialNumber}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap font-medium">
                      {item.orderNumber || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      <Badge
                        variant={item.propertyType === '個別' ? 'info' : item.propertyType === '集合' ? 'warning' : 'default'}
                        size="sm"
                      >
                        {item.propertyType || '-'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {item.propertyType === '個別' ? (item.customerCode || '-') : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {item.propertyType === '個別' ? (item.customerName || '-') : (item.collectiveHousingName || '-')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {item.propertyType === '集合' ? (item.collectiveCode || '-') : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {item.propertyType === '集合' ? (item.collectiveHousingName || '-') : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      <div className="max-w-[200px] truncate" title={item.address}>
                        {item.address ? (item.address.length > 8 ? `${item.address.substring(0, 8)}...` : item.address) : '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {item.assigneeType === 'internal' ? (
                        <span className="text-blue-600 font-medium">自社 - {item.teamName}</span>
                      ) : (
                        <span className="text-gray-900">{item.contractorName} - {item.teamName}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      <Badge variant={getStatusBadge(item.status)} size="sm">
                        {item.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {item.constructionRequestedDate || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {item.constructionDate || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {item.constructionCompletedDate || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      <Badge variant={reportBadge.variant} size="sm">
                        {reportBadge.text}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      <button
                        onClick={() => onEdit(item)}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <PencilSquareIcon className="h-4 w-4 mr-1" />
                        編集
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </FilterableTableLayout>
  )
}

export default ConstructionTab
