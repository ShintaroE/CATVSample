import React, { useState, useMemo } from 'react'
import { SurveyRequest, SurveyStatus, SurveyResult, SurveyIntermediateReport } from '@/types/application'
import { Contractor, Team } from '@/types/contractor'
import { getTeamsByContractorId } from '@/lib/contractors'
import ProgressHistory from './ProgressHistory'

interface EditSurveyModalProps {
  item: SurveyRequest
  contractors: Contractor[]
  teams: Team[]
  onClose: () => void
  onSave: (updates: Partial<SurveyRequest>) => void
}

export default function EditSurveyModal({
  item,
  contractors,
  teams,
  onClose,
  onSave,
}: EditSurveyModalProps) {
  const [formData, setFormData] = useState<Partial<SurveyRequest>>(item)

  const availableTeams = useMemo(() => {
    if (formData.assigneeType === 'internal') {
      const chokueiContractor = contractors.find((c) => c.name === '直営班')
      return chokueiContractor ? getTeamsByContractorId(chokueiContractor.id) : []
    } else if (formData.contractorId) {
      return getTeamsByContractorId(formData.contractorId)
    }
    return []
  }, [formData.assigneeType, formData.contractorId, contractors])

  const handleChange = (field: string, value: string | boolean | string[] | undefined | SurveyResult | SurveyIntermediateReport) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value }

      // ステータスが完了に変更された場合、完了日を自動設定
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
            現地調査依頼 編集（整理番号: {item.serialNumber}）
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

            {/* 依頼先情報 */}
            <h3 className="text-md font-semibold text-gray-900 mb-3 border-t pt-4">依頼先</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="sm:col-span-2">
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
              </div>
            </div>

            {/* 進捗情報 */}
            <h3 className="text-md font-semibold text-gray-900 mb-3 border-t pt-4">進捗情報</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <FormField label="状態">
                <select
                  value={formData.status || ''}
                  onChange={(e) => handleChange('status', e.target.value as SurveyStatus)}
                  className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
                >
                  <option value="未着手">未着手</option>
                  <option value="調査中">調査中</option>
                  <option value="完了">完了</option>
                  <option value="キャンセル">キャンセル</option>
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

              <FormField label="予定日">
                <input
                  type="date"
                  value={formData.scheduledDate || ''}
                  onChange={(e) => handleChange('scheduledDate', e.target.value)}
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

            {/* 調査情報 */}
            <h3 className="text-md font-semibold text-gray-900 mb-3 border-t pt-4">調査情報</h3>
            <div className="grid grid-cols-1 gap-4 mb-6">
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
                              : current.filter((i) => i !== item)
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

              <FormField label="クロージャ番号">
                <input
                  value={formData.surveyResult?.closureNumber || ''}
                  onChange={(e) =>
                    handleChange('surveyResult', {
                      ...(formData.surveyResult || {}),
                      closureNumber: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
                  placeholder="例: CL-2024-0123"
                />
              </FormField>

              <FormField label="現状線種別">
                <select
                  value={formData.surveyResult?.lineType || ''}
                  onChange={(e) =>
                    handleChange('surveyResult', {
                      ...(formData.surveyResult || {}),
                      lineType: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
                >
                  <option value="">未選択</option>
                  <option value="光ファイバ">光ファイバ</option>
                  <option value="同軸">同軸</option>
                  <option value="メタル">メタル</option>
                  <option value="その他">その他</option>
                </select>
              </FormField>

              <FormField label="調査所見">
                <textarea
                  value={formData.surveyResult?.notes || ''}
                  onChange={(e) =>
                    handleChange('surveyResult', {
                      ...(formData.surveyResult || {}),
                      notes: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-md bg-white text-gray-900 min-h-[72px]"
                  placeholder="調査結果や気づいた点を記載してください"
                />
              </FormField>

              <FormField label="備考">
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-white text-gray-900 min-h-[72px]"
                />
              </FormField>
            </div>

            {/* 進捗履歴 */}
            {item.progressHistory && item.progressHistory.length > 0 && (
              <>
                <h3 className="text-md font-semibold text-gray-900 mb-3 border-t pt-4">
                  進捗履歴
                </h3>
                <div className="mb-6">
                  <ProgressHistory history={item.progressHistory} />
                </div>
              </>
            )}
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
