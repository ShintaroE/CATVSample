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
  // 共通フィルターフックを使用（検索ボタンパターン）
  const {
    inputFilters,
    searchFilters,
    baseFilteredData,
    updateInputFilter,
    executeSearch,
    clearInputFilters,
    isSearching,
    activeFilterCount: baseActiveFilterCount,
  } = useApplicationFilters(data)

  // Construction固有のフィルター（入力用と検索用に分離）
  const [inputStatus, setInputStatus] = useState<'' | ConstructionStatus>('')
  const [searchStatus, setSearchStatus] = useState<'' | ConstructionStatus>('')
  const [inputReportRequired, setInputReportRequired] = useState<'' | 'required' | 'notRequired'>('')
  const [searchReportRequired, setSearchReportRequired] = useState<'' | 'required' | 'notRequired'>('')
  const [inputReportStatus, setInputReportStatus] = useState<'' | 'completed' | 'pending'>('')
  const [searchReportStatus, setSearchReportStatus] = useState<'' | 'completed' | 'pending'>('')

  // Get teams for selected contractor（入力フィルターを使用）
  const availableTeams = useMemo(() => {
    if (!inputFilters.contractorId) return []
    return getTeamsByContractorId(inputFilters.contractorId)
  }, [inputFilters.contractorId])

  // Reset team filter when contractor changes（共通フックが自動的に行う）
  const handleContractorChange = (contractorId: string) => {
    updateInputFilter('contractorId', contractorId)
  }

  // 検索実行
  const handleSearch = () => {
    executeSearch()
    setSearchStatus(inputStatus)
    setSearchReportRequired(inputReportRequired)
    setSearchReportStatus(inputReportStatus)
  }

  // フィルタクリア（入力フォームのみクリア）
  const handleClear = () => {
    clearInputFilters()
    setInputStatus('')
    setInputReportRequired('')
    setInputReportStatus('')
  }

  // 適用中のフィルター数をカウント（検索後の状態をカウント）
  let totalActiveFilterCount = baseActiveFilterCount
  if (searchStatus) totalActiveFilterCount++
  if (searchReportRequired) totalActiveFilterCount++
  if (searchReportStatus) totalActiveFilterCount++

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

  // Construction固有のフィルターを適用（検索後の状態を使用）
  const filteredData = useMemo(() => {
    return baseFilteredData.filter(item => {
      // 状態
      if (searchStatus && item.status !== searchStatus) {
        return false
      }

      // 工事後報告（要否）
      if (searchReportRequired) {
        if (searchReportRequired === 'required') {
          if (!item.postConstructionApplicationReport?.required) {
            return false
          }
        } else if (searchReportRequired === 'notRequired') {
          if (item.postConstructionApplicationReport?.required) {
            return false
          }
        }
      }

      // 工事後報告（完了状態） - 「要」の場合のみ有効
      if (searchReportStatus && item.postConstructionApplicationReport?.required) {
        if (item.postConstructionApplicationReport.status !== searchReportStatus) {
          return false
        }
      }

      return true
    })
  }, [baseFilteredData, searchStatus, searchReportRequired, searchReportStatus])

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
          value={inputFilters.orderNumber}
          onChange={(e) => updateInputFilter('orderNumber', e.target.value)}
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
          value={inputFilters.phoneNumber}
          onChange={(e) => updateInputFilter('phoneNumber', e.target.value)}
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
          value={inputFilters.propertyType}
          onChange={(e) => updateInputFilter('propertyType', e.target.value as '' | '個別' | '集合')}
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
          value={inputFilters.customerCode}
          onChange={(e) => updateInputFilter('customerCode', e.target.value)}
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
          value={inputFilters.collectiveCode}
          onChange={(e) => updateInputFilter('collectiveCode', e.target.value)}
          placeholder="K001"
        />
        <p className="text-xs text-gray-500 mt-1">※集合物件のみ</p>
      </div>

      {/* 顧客名 */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          顧客名
        </label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-sm placeholder:text-gray-400"
          value={inputFilters.customerName}
          onChange={(e) => updateInputFilter('customerName', e.target.value)}
          placeholder="顧客名 or カナ"
        />
        <p className="text-xs text-gray-500 mt-1">※個別物件のみ</p>
      </div>

      {/* 集合住宅名 */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          集合住宅名
        </label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-sm placeholder:text-gray-400"
          value={inputFilters.collectiveHousingName}
          onChange={(e) => updateInputFilter('collectiveHousingName', e.target.value)}
          placeholder="集合住宅名 or カナ"
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
          value={inputFilters.contractorId}
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
          value={inputFilters.teamId}
          onChange={(e) => updateInputFilter('teamId', e.target.value)}
          disabled={!inputFilters.contractorId}
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
          value={inputStatus}
          onChange={(e) => setInputStatus(e.target.value as '' | ConstructionStatus)}
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
          value={inputReportRequired}
          onChange={(e) => setInputReportRequired(e.target.value as '' | 'required' | 'notRequired')}
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
          value={inputReportStatus}
          onChange={(e) => setInputReportStatus(e.target.value as '' | 'completed' | 'pending')}
          disabled={inputReportRequired !== 'required'}
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
      activeFilterCount={totalActiveFilterCount}
      onSearch={handleSearch}
      onClear={handleClear}
      isSearching={isSearching}
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
                顧客名（カナ）
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                集合コード
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                集合住宅名
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                集合住宅名（カナ）
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
                <td colSpan={17} className="px-4 py-8 text-center text-sm text-gray-500">
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
                    <td className="px-4 py-3 text-sm text-gray-400 whitespace-nowrap">
                      {item.propertyType === '個別' ? (item.customerNameKana || '-') : (item.collectiveHousingNameKana || '-')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {item.propertyType === '集合' ? (item.collectiveCode || '-') : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {item.propertyType === '集合' ? (item.collectiveHousingName || '-') : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400 whitespace-nowrap">
                      {item.propertyType === '集合' ? (item.collectiveHousingNameKana || '-') : '-'}
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
