import React, { useState, useMemo } from 'react'
import { ConstructionRequest, ConstructionStatus, ConstructionResult, ConstructionWorkProgress } from '@/features/applications/types'
import { Contractor, Team } from '@/features/contractor/types'
import { getTeamsByContractorId } from '@/features/contractor/lib/contractorStorage'

interface EditConstructionModalProps {
  item: ConstructionRequest
  contractors: Contractor[]
  teams: Team[]
  onClose: () => void
  onSave: (updates: Partial<ConstructionRequest>) => void
}

export default function EditConstructionModal({
  item,
  contractors,
  teams,
  onClose,
  onSave,
}: EditConstructionModalProps) {
  const [formData, setFormData] = useState<Partial<ConstructionRequest>>(item)

  const availableTeams = useMemo(() => {
    if (formData.assigneeType === 'internal') {
      const chokueiContractor = contractors.find((c) => c.name === '直営班')
      return chokueiContractor ? getTeamsByContractorId(chokueiContractor.id) : []
    } else if (formData.contractorId) {
      return getTeamsByContractorId(formData.contractorId)
    }
    return []
  }, [formData.assigneeType, formData.contractorId, contractors])

  const handleChange = (field: string, value: string | boolean | string[] | undefined | ConstructionResult | ConstructionWorkProgress) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value }

      if (field === 'status' && value === '完了' && !newData.completedAt) {
        newData.completedAt = new Date().toISOString().split('T')[0]
      }

      if (field === 'assigneeType') {
        newData.contractorId = ''
        newData.teamId = ''
        if (value === 'internal') {
          const chokueiContractor = contractors.find((c) => c.name === '直営班')
          if (chokueiContractor) {
            newData.contractorId = chokueiContractor.id
            newData.contractorName = chokueiContractor.name
          }
        }
      }

      if (field === 'contractorId') {
        newData.teamId = ''
        const contractor = contractors.find((c) => c.id === value)
        newData.contractorName = contractor?.name || ''
      }

      if (field === 'teamId') {
        const team = teams.find((t) => t.id === value)
        newData.teamName = team?.teamName || ''
      }

      return newData
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white w-[min(880px,92vw)] max-h-[90vh] overflow-auto rounded-lg shadow-xl">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            工事依頼 編集（整理番号: {item.serialNumber}）
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-5 py-4">
            {/* 基本情報 */}
            <h3 className="text-md font-semibold text-gray-900 mb-3">基本情報</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <FormField label="受注番号">
                <input
                  value={formData.orderNumber || ''}
                  onChange={(e) => handleChange('orderNumber', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
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
                />
              </FormField>
            </div>

            {/* 依頼先 */}
            <h3 className="text-md font-semibold text-gray-900 mb-3 border-t pt-4">依頼先</h3>
            <div className="grid grid-cols-1 gap-4 mb-6">
              <div>
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
              </div>
            </div>

            {/* 工事情報 */}
            <h3 className="text-md font-semibold text-gray-900 mb-3 border-t pt-4">工事情報</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <FormField label="状態">
                <select
                  value={formData.status || ''}
                  onChange={(e) => handleChange('status', e.target.value as ConstructionStatus)}
                  className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
                >
                  <option value="未着手">未着手</option>
                  <option value="施工中">施工中</option>
                  <option value="完了">完了</option>
                  <option value="保留">保留</option>
                </select>
              </FormField>

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

              <FormField label="依頼日">
                <input
                  type="date"
                  value={formData.requestedAt || ''}
                  onChange={(e) => handleChange('requestedAt', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
                />
              </FormField>

              <FormField label="工事予定日">
                <input
                  type="date"
                  value={formData.constructionDate || ''}
                  onChange={(e) => handleChange('constructionDate', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
                />
              </FormField>

              <FormField label="完了日">
                <input
                  type="date"
                  value={formData.completedAt || ''}
                  onChange={(e) => handleChange('completedAt', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
                />
              </FormField>
            </div>

            {/* 工事結果 */}
            <h3 className="text-md font-semibold text-gray-900 mb-3 border-t pt-4">工事結果</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <FormField label="実施日">
                <input
                  type="date"
                  value={formData.constructionResult?.actualDate || ''}
                  onChange={(e) =>
                    handleChange('constructionResult', {
                      ...(formData.constructionResult || {}),
                      actualDate: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
                />
              </FormField>

              <FormField label="作業時間（時間）">
                <input
                  type="number"
                  step="0.5"
                  value={formData.constructionResult?.workHours || ''}
                  onChange={(e) =>
                    handleChange('constructionResult', {
                      ...(formData.constructionResult || {}),
                      workHours: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
                  placeholder="例: 3.5"
                />
              </FormField>

              <div className="sm:col-span-2">
                <FormField label="使用材料">
                  <input
                    value={formData.constructionResult?.materials || ''}
                    onChange={(e) =>
                      handleChange('constructionResult', {
                        ...(formData.constructionResult || {}),
                        materials: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
                    placeholder="例: 光ケーブル50m、クランプ3個"
                  />
                </FormField>
              </div>

              <div className="sm:col-span-2">
                <FormField label="作業内容詳細">
                  <textarea
                    value={formData.constructionResult?.notes || ''}
                    onChange={(e) =>
                      handleChange('constructionResult', {
                        ...(formData.constructionResult || {}),
                        notes: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-md bg-white text-gray-900 min-h-[72px]"
                    placeholder="作業内容や特記事項を記載してください"
                  />
                </FormField>
              </div>

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
              保存
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
