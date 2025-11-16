import React, { useMemo, useState } from 'react'
import { FunnelIcon, PencilSquareIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import { ConstructionRequest, ConstructionStatus, PostConstructionReport } from '@/features/applications/types'
import { Contractor } from '@/features/contractor/types'
import { getTeamsByContractorId } from '@/features/contractor/lib/contractorStorage'
import { Badge, BadgeVariant } from '@/shared/components/ui'

interface ConstructionTabProps {
  data: ConstructionRequest[]
  contractors: Contractor[]
  onEdit: (item: ConstructionRequest) => void
}

const ConstructionTab: React.FC<ConstructionTabProps> = ({ data, contractors, onEdit }) => {
  const [orderNumberFilter, setOrderNumberFilter] = useState('')
  const [customerCodeFilter, setCustomerCodeFilter] = useState('')
  const [collectiveCodeFilter, setCollectiveCodeFilter] = useState('')
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<'' | '個別' | '集合'>('')
  const [contractorIdFilter, setContractorIdFilter] = useState('')
  const [teamIdFilter, setTeamIdFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<'' | ConstructionStatus>('')
  const [postConstructionReportFilter, setPostConstructionReportFilter] = useState<'' | PostConstructionReport>('')

  // Get teams for selected contractor
  const availableTeams = useMemo(() => {
    if (!contractorIdFilter) return []
    return getTeamsByContractorId(contractorIdFilter)
  }, [contractorIdFilter])

  // Reset team filter when contractor changes
  const handleContractorChange = (contractorId: string) => {
    setContractorIdFilter(contractorId)
    setTeamIdFilter('')
  }

  // フィルタクリア
  const handleClearFilters = () => {
    setOrderNumberFilter('')
    setCustomerCodeFilter('')
    setCollectiveCodeFilter('')
    setPropertyTypeFilter('')
    setContractorIdFilter('')
    setTeamIdFilter('')
    setStatusFilter('')
    setPostConstructionReportFilter('')
  }

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

  const getPostConstructionReportBadge = (report: PostConstructionReport | undefined): { variant: BadgeVariant; text: string } => {
    if (!report) {
      return { variant: 'default', text: '-' }
    }
    switch (report) {
      case '完了':
        return { variant: 'success', text: '完了' }
      case '未完了':
        return { variant: 'warning', text: '未完了' }
      case '不要':
        return { variant: 'default', text: '不要' }
      default:
        return { variant: 'default', text: '-' }
    }
  }

  // Filter data
  const filteredData = useMemo(() => {
    return data.filter(item => {
      // 受注番号（部分一致）
      if (orderNumberFilter && !item.orderNumber?.toLowerCase().includes(orderNumberFilter.toLowerCase())) {
        return false
      }

      // 個別/集合（テーブル表示と同じロジックで判定）
      if (propertyTypeFilter) {
        if (propertyTypeFilter === '個別') {
          // 個別を選択した場合、propertyTypeが'個別'のもののみ表示
          if (item.propertyType !== '個別') {
            return false
          }
        } else if (propertyTypeFilter === '集合') {
          // 集合を選択した場合、propertyTypeが'個別'でないもの（集合またはundefined等）を表示
          if (item.propertyType === '個別') {
            return false
          }
        }
      }

      // 顧客コード（個別のみ、部分一致）
      if (customerCodeFilter) {
        // 個別物件の場合のみチェック
        if (item.propertyType === '個別') {
          if (!(item.customerCode || '').toLowerCase().includes(customerCodeFilter.toLowerCase())) {
            return false
          }
        } else {
          // 集合物件の場合は、顧客コードフィルターで除外しない（スキップ）
          // ただし、propertyTypeFilterで個別が選択されている場合は、集合物件は除外される
        }
      }

      // 集合コード（集合のみ、部分一致）
      if (collectiveCodeFilter) {
        // 集合物件の場合のみチェック
        if (item.propertyType === '集合') {
          if (!(item.collectiveCode || '').toLowerCase().includes(collectiveCodeFilter.toLowerCase())) {
            return false
          }
        } else {
          // 個別物件の場合は、集合コードフィルターで除外しない（スキップ）
          // ただし、propertyTypeFilterで集合が選択されている場合は、個別物件は除外される
        }
      }

      if (contractorIdFilter && item.contractorId !== contractorIdFilter) {
        return false
      }
      if (teamIdFilter && item.teamId !== teamIdFilter) {
        return false
      }
      if (statusFilter && item.status !== statusFilter) {
        return false
      }
      if (postConstructionReportFilter && item.postConstructionReport !== postConstructionReportFilter) {
        return false
      }
      return true
    })
  }, [data, orderNumberFilter, propertyTypeFilter, customerCodeFilter, collectiveCodeFilter, contractorIdFilter, teamIdFilter, statusFilter, postConstructionReportFilter])

  return (
    <div className="space-y-4 w-full max-w-full overflow-x-hidden">
      {/* Filtering Panel */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 w-full max-w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3 w-full">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center">
            <FunnelIcon className="w-4 h-4 mr-1.5" />
            絞り込み条件
          </h3>
          {/* 表示件数 */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <ChartBarIcon className="w-4 h-4 text-gray-500" />
              <Badge
                variant={filteredData.length !== data.length ? 'info' : 'default'}
                size="sm"
                className="font-semibold"
              >
                表示: {filteredData.length}件
              </Badge>
              <Badge variant="default" size="sm" className="font-normal">
                全: {data.length}件
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {/* 受注番号 */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              受注番号
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-sm"
              value={orderNumberFilter}
              onChange={(e) => setOrderNumberFilter(e.target.value)}
              placeholder="受注番号で絞り込み"
            />
          </div>

          {/* 個別/集合 */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              個別/集合
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-sm"
              value={propertyTypeFilter}
              onChange={(e) => setPropertyTypeFilter(e.target.value as '' | '個別' | '集合')}
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
              value={customerCodeFilter}
              onChange={(e) => setCustomerCodeFilter(e.target.value)}
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
              value={collectiveCodeFilter}
              onChange={(e) => setCollectiveCodeFilter(e.target.value)}
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
              value={contractorIdFilter}
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
              value={teamIdFilter}
              onChange={(e) => setTeamIdFilter(e.target.value)}
              disabled={!contractorIdFilter}
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
              <option value="依頼済み">依頼済み</option>
              <option value="工事日決定">工事日決定</option>
              <option value="完了">完了</option>
              <option value="工事返却">工事返却</option>
              <option value="工事キャンセル">工事キャンセル</option>
            </select>
          </div>

          {/* 工事後報告 */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              工事後報告
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-sm"
              value={postConstructionReportFilter}
              onChange={(e) => setPostConstructionReportFilter(e.target.value as '' | PostConstructionReport)}
            >
              <option value="">全て</option>
              <option value="完了">完了</option>
              <option value="未完了">未完了</option>
              <option value="不要">不要</option>
            </select>
          </div>
        </div>

        {/* クリアボタン */}
        <div className="flex justify-end mt-4 w-full">
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex-shrink-0"
          >
            クリア
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-max divide-y divide-gray-200">
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
                const reportBadge = getPostConstructionReportBadge(item.postConstructionReport)
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
    </div>
  )
}

export default ConstructionTab
