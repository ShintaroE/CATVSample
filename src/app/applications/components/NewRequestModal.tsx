import React, { useState, useMemo } from 'react'
import {
  RequestType,
  SurveyRequest,
  AttachmentRequest,
  ConstructionRequest,
  AssigneeType,
} from '@/types/application'
import { Contractor, Team } from '@/types/contractor'
import { getTeamsByContractorId } from '@/lib/contractors'

interface NewRequestModalProps {
  defaultTab: RequestType
  contractors: Contractor[]
  teams: Team[]
  onClose: () => void
  onCreate: (
    type: RequestType,
    data: Partial<SurveyRequest | AttachmentRequest | ConstructionRequest>
  ) => void
}

export default function NewRequestModal({
  defaultTab,
  contractors,
  teams,
  onClose,
  onCreate,
}: NewRequestModalProps) {
  const [activeTab, setActiveTab] = useState<RequestType>(defaultTab)
  const [formData, setFormData] = useState<any>({
    assigneeType: 'internal' as AssigneeType,
    contractorId: '',
    teamId: '',
  })

  // 協力会社選択時に利用可能な班を取得
  const availableTeams = useMemo(() => {
    if (formData.assigneeType === 'internal') {
      // 自社の場合は直営班の班のみ
      const chokueiContractor = contractors.find((c) => c.name === '直営班')
      return chokueiContractor
        ? getTeamsByContractorId(chokueiContractor.id)
        : []
    } else if (formData.contractorId) {
      return getTeamsByContractorId(formData.contractorId)
    }
    return []
  }, [formData.assigneeType, formData.contractorId, contractors])

  const handleChange = (
    field: string,
    value: string | boolean | string[] | undefined
  ) => {
    setFormData((prev: any) => {
      const newData = { ...prev, [field]: value }

      // 依頼先タイプ変更時にcontractorIdとteamIdをリセット
      if (field === 'assigneeType') {
        newData.contractorId = ''
        newData.teamId = ''

        // 自社選択時は自動的に直営班をセット
        if (value === 'internal') {
          const chokueiContractor = contractors.find((c) => c.name === '直営班')
          if (chokueiContractor) {
            newData.contractorId = chokueiContractor.id
            newData.contractorName = chokueiContractor.name
          }
        }
      }

      // 協力会社変更時にteamIdをリセット
      if (field === 'contractorId') {
        newData.teamId = ''
        const contractor = contractors.find((c) => c.id === value)
        newData.contractorName = contractor?.name || ''
      }

      // 班選択時に班名を設定
      if (field === 'teamId') {
        const team = teams.find((t) => t.id === value)
        newData.teamName = team?.teamName || ''
      }

      return newData
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCreate(activeTab, formData)
  }

  const TAB_LABELS: Record<RequestType, string> = {
    survey: '現地調査依頼',
    attachment: '共架・添架依頼',
    construction: '工事依頼',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white w-[min(880px,92vw)] max-h-[90vh] overflow-auto rounded-lg shadow-xl">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">新規依頼</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">
            ×
          </button>
        </div>

        {/* タブ */}
        <div className="px-5 border-b border-gray-200">
          <nav className="-mb-px flex space-x-6">
            {(Object.keys(TAB_LABELS) as RequestType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm
                  ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }
                `}
              >
                {TAB_LABELS[tab]}
              </button>
            ))}
          </nav>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 共通項目 */}
            <FormField label="受注番号">
              <input
                value={formData.orderNumber || ''}
                onChange={(e) => handleChange('orderNumber', e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
                placeholder="例: 2024031500001"
              />
            </FormField>

            <FormField label="契約No.">
              <input
                value={formData.contractNo || ''}
                onChange={(e) => handleChange('contractNo', e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
              />
            </FormField>

            <FormField label="顧客コード">
              <input
                value={formData.customerCode || ''}
                onChange={(e) => handleChange('customerCode', e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
              />
            </FormField>

            <FormField label="顧客名">
              <input
                value={formData.customerName || ''}
                onChange={(e) => handleChange('customerName', e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
              />
            </FormField>

            <div className="sm:col-span-2">
              <FormField label="住所">
                <input
                  value={formData.address || ''}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
                />
              </FormField>
            </div>

            <FormField label="電話番号">
              <input
                value={formData.phoneNumber || ''}
                onChange={(e) => handleChange('phoneNumber', e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
                placeholder="086-123-4567"
              />
            </FormField>

            {/* 依頼先選択 */}
            <div className="sm:col-span-2 border-t pt-4">
              <FormField label="依頼先" required>
                <div className="flex gap-4 mb-3">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="internal"
                      checked={formData.assigneeType === 'internal'}
                      onChange={(e) => handleChange('assigneeType', e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">自社（直営班）</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="contractor"
                      checked={formData.assigneeType === 'contractor'}
                      onChange={(e) => handleChange('assigneeType', e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">協力会社</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {formData.assigneeType === 'contractor' && (
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">協力会社</label>
                      <select
                        value={formData.contractorId || ''}
                        onChange={(e) => handleChange('contractorId', e.target.value)}
                        className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
                        required
                      >
                        <option value="">選択してください</option>
                        {contractors
                          .filter((c) => c.name !== '直営班' && c.isActive)
                          .map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">班</label>
                    <select
                      value={formData.teamId || ''}
                      onChange={(e) => handleChange('teamId', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
                      required
                    >
                      <option value="">選択してください</option>
                      {availableTeams.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.teamName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </FormField>
            </div>

            <FormField label="依頼日">
              <input
                type="date"
                value={formData.requestedAt || ''}
                onChange={(e) => handleChange('requestedAt', e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
              />
            </FormField>

            <FormField label="予定日">
              <input
                type="date"
                value={formData.scheduledDate || ''}
                onChange={(e) => handleChange('scheduledDate', e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
              />
            </FormField>

            {/* タブ別の追加項目 */}
            {activeTab === 'survey' && (
              <>
                <div className="sm:col-span-2">
                  <FormField label="調査項目">
                    <div className="space-y-2">
                      {['クロージャ番号確認', '引込ルート確認', '電柱高さ測定', 'その他'].map(
                        (item) => (
                          <label key={item} className="inline-flex items-center mr-4">
                            <input
                              type="checkbox"
                              checked={(formData.surveyItems || []).includes(item)}
                              onChange={(e) => {
                                const current = formData.surveyItems || []
                                const updated = e.target.checked
                                  ? [...current, item]
                                  : current.filter((i: string) => i !== item)
                                handleChange('surveyItems', updated)
                              }}
                              className="mr-2"
                            />
                            <span className="text-sm text-gray-700">{item}</span>
                          </label>
                        )
                      )}
                    </div>
                  </FormField>
                </div>
              </>
            )}

            {activeTab === 'attachment' && (
              <>
                <FormField label="提出日">
                  <input
                    type="date"
                    value={formData.submittedAt || ''}
                    onChange={(e) => handleChange('submittedAt', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
                  />
                </FormField>
              </>
            )}

            {activeTab === 'construction' && (
              <>
                <FormField label="工事種別">
                  <select
                    value={formData.constructionType || ''}
                    onChange={(e) => handleChange('constructionType', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
                  >
                    <option value="">選択してください</option>
                    <option value="宅内引込">宅内引込</option>
                    <option value="撤去">撤去</option>
                    <option value="移設">移設</option>
                    <option value="その他">その他</option>
                  </select>
                </FormField>

                <FormField label="工事予定日">
                  <input
                    type="date"
                    value={formData.constructionDate || ''}
                    onChange={(e) => handleChange('constructionDate', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
                  />
                </FormField>
              </>
            )}

            <div className="sm:col-span-2">
              <FormField label="備考">
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-white text-gray-900 min-h-[72px]"
                />
              </FormField>
            </div>
          </div>

          <div className="px-5 py-4 border-t flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-md border bg-white text-gray-700 hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              登録
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function FormField({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}
