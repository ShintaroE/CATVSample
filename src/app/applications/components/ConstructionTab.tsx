import React, { useMemo, useState } from 'react'
import { FunnelIcon, PencilSquareIcon } from '@heroicons/react/24/outline'
import { ConstructionRequest, ConstructionStatus, PostConstructionReport } from '@/features/applications/types'
import { Contractor, Team } from '@/features/contractor/types'
import { getTeamsByContractorId } from '@/features/contractor/lib/contractorStorage'
import { Badge, BadgeVariant } from '@/shared/components/ui'

interface ConstructionTabProps {
  data: ConstructionRequest[]
  contractors: Contractor[]
  teams: Team[]
  onEdit: (item: ConstructionRequest) => void
}

const ConstructionTab: React.FC<ConstructionTabProps> = ({ data, contractors, teams, onEdit }) => {
  const [orderNumberFilter, setOrderNumberFilter] = useState('')
  const [customerNameFilter, setCustomerNameFilter] = useState('')
  const [constructionTypeFilter, setConstructionTypeFilter] = useState('')
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

  // Badge variant functions
  const getStatusBadge = (status: ConstructionStatus): BadgeVariant => {
    switch (status) {
      case '未着手':
        return 'default'
      case '施工中':
        return 'warning'
      case '完了':
        return 'success'
      case '一部完了':
        return 'info'
      case '中止':
        return 'danger'
      case '延期':
        return 'warning'
      case '保留':
        return 'default'
      default:
        return 'default'
    }
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
      if (orderNumberFilter && !item.orderNumber?.toLowerCase().includes(orderNumberFilter.toLowerCase())) {
        return false
      }
      if (customerNameFilter && !item.customerName?.toLowerCase().includes(customerNameFilter.toLowerCase())) {
        return false
      }
      if (constructionTypeFilter && item.constructionType !== constructionTypeFilter) {
        return false
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
  }, [data, orderNumberFilter, customerNameFilter, constructionTypeFilter, contractorIdFilter, teamIdFilter, statusFilter, postConstructionReportFilter])

  return (
    <div className="space-y-4">
      {/* Filtering Panel */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center mb-3">
          <FunnelIcon className="h-5 w-5 text-gray-600 mr-2" />
          <h3 className="text-sm font-semibold text-gray-700">フィルタ</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* 受注番号 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              受注番号
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              value={orderNumberFilter}
              onChange={(e) => setOrderNumberFilter(e.target.value)}
              placeholder="受注番号で絞り込み"
            />
          </div>

          {/* 顧客名 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              顧客名
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              value={customerNameFilter}
              onChange={(e) => setCustomerNameFilter(e.target.value)}
              placeholder="顧客名で絞り込み"
            />
          </div>

          {/* 工事種別 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              工事種別
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              value={constructionTypeFilter}
              onChange={(e) => setConstructionTypeFilter(e.target.value)}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              依頼先
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              value={contractorIdFilter}
              onChange={(e) => handleContractorChange(e.target.value)}
            >
              <option value="">全て</option>
              {contractors.map(contractor => (
                <option key={contractor.id} value={contractor.id}>
                  {contractor.name}
                </option>
              ))}
            </select>
          </div>

          {/* 班 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              班
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
              value={teamIdFilter}
              onChange={(e) => setTeamIdFilter(e.target.value)}
              disabled={!contractorIdFilter}
            >
              <option value="">全て</option>
              {availableTeams.map(team => (
                <option key={team.id} value={team.id}>
                  {team.teamName}
                </option>
              ))}
            </select>
          </div>

          {/* 状態 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              状態
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as '' | ConstructionStatus)}
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

          {/* 工事後報告 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              工事後報告
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
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
      </div>

      {/* Table */}
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
                個別/集合
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                顧客コード
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                顧客名
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                集合コード
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                集合住宅名
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                住所
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                依頼先
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状態
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                工事依頼日
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                工事予定日
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                工事完了日
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                工事後報告
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {item.serialNumber}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {item.orderNumber || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {item.propertyType === '個別' ? '個別' : '集合'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {item.propertyType === '個別' ? item.customerCode : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {item.customerName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {item.propertyType === '集合' ? item.collectiveCode : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {item.propertyType === '集合' ? item.collectiveHousingName : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {item.address}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {item.contractorName} - {item.teamName}
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      <Badge variant={getStatusBadge(item.status)}>
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
                      <Badge variant={reportBadge.variant}>
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
