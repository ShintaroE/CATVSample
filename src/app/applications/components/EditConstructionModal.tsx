import React, { useState, useMemo } from 'react'
import {
  ConstructionRequest,
  ConstructionStatus,
  AttachedFile,
  PostConstructionReport,
} from '@/features/applications/types'
import { Contractor, Team } from '@/features/contractor/types'
import { getTeamsByContractorId } from '@/features/contractor/lib/contractorStorage'
import { downloadFile } from '@/features/applications/lib/applicationStorage'
import { useAuth } from '@/features/auth/hooks/useAuth'
import FileAttachmentsComponent from './FileAttachments'
import RequestNotesComponent from './RequestNotes'
import ProgressHistory from './ProgressHistory'

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
  const { user } = useAuth()
  const [formData, setFormData] = useState<Partial<ConstructionRequest>>({
    ...item,
    propertyType: item.propertyType || '個別',
    postConstructionReport: item.postConstructionReport || '未完了',
  })
  const [uploadingFiles, setUploadingFiles] = useState(false)

  const availableTeams = useMemo(() => {
    if (formData.assigneeType === 'internal') {
      const chokueiContractor = contractors.find((c) => c.name === '直営班')
      return chokueiContractor ? getTeamsByContractorId(chokueiContractor.id) : []
    } else if (formData.contractorId) {
      return getTeamsByContractorId(formData.contractorId)
    }
    return []
  }, [formData.assigneeType, formData.contractorId, contractors])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value }

      // Auto-set dates when status becomes '完了'
      if (field === 'status' && value === '完了') {
        if (!newData.completedAt) {
          newData.completedAt = new Date().toISOString().split('T')[0]
        }
        if (!newData.constructionCompletedDate) {
          newData.constructionCompletedDate = new Date().toISOString().split('T')[0]
        }
      }

      // Clear fields when switching propertyType
      if (field === 'propertyType') {
        if (value === '個別') {
          newData.collectiveCode = ''
          newData.collectiveHousingName = ''
        } else if (value === '集合') {
          newData.customerCode = ''
        }
      }

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

  const handleFileUpload = async (files: File[]) => {
    if (!user) return
    setUploadingFiles(true)
    try {
      const newFiles = await Promise.all(
        files.map(async (file) => {
          const reader = new FileReader()
          return new Promise<{ name: string; size: number; type: string; data: string }>((resolve) => {
            reader.onload = () => resolve({ name: file.name, size: file.size, type: file.type, data: reader.result as string })
            reader.readAsDataURL(file)
          })
        })
      )
      const existingAttachments = formData.attachments || { fromAdmin: [], fromContractor: [] }
      const uploadedByRole = user.role as 'admin' | 'contractor'
      const targetArray = uploadedByRole === 'admin' ? 'fromAdmin' : 'fromContractor'
      setFormData((prev) => ({
        ...prev,
        attachments: {
          ...existingAttachments,
          [targetArray]: [
            ...existingAttachments[targetArray],
            ...newFiles.map((f, i) => ({
              id: `temp-${Date.now()}-${i}`,
              fileName: f.name,
              fileSize: f.size,
              fileType: f.type,
              fileData: f.data,
              uploadedBy: user.id,
              uploadedByName: user.name,
              uploadedByRole,
              uploadedAt: new Date().toISOString(),
            })),
          ],
        },
      }))
    } catch (error) {
      console.error('File upload failed:', error)
    } finally {
      setUploadingFiles(false)
    }
  }

  const handleFileDelete = (fileId: string) => {
    if (!user) return
    const uploadedByRole = user.role as 'admin' | 'contractor'
    const targetArray = uploadedByRole === 'admin' ? 'fromAdmin' : 'fromContractor'
    const existingAttachments = formData.attachments || { fromAdmin: [], fromContractor: [] }
    setFormData((prev) => ({
      ...prev,
      attachments: {
        ...existingAttachments,
        [targetArray]: existingAttachments[targetArray].filter((f) => f.id !== fileId),
      },
    }))
  }

  const handleFileDownload = (file: AttachedFile) => { downloadFile(file) }

  const handleNotesChange = (notes: string) => {
    setFormData((prev) => ({
      ...prev,
      requestNotes: { ...prev.requestNotes, adminNotes: notes },
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // バリデーション
    if (!formData.orderNumber) {
      alert('受注番号を入力してください')
      return
    }

    if (!formData.propertyType) {
      alert('個別/集合を選択してください')
      return
    }

    if (formData.propertyType === '個別') {
      if (!formData.customerCode) {
        alert('顧客コードを入力してください')
        return
      }
      if (!formData.customerName) {
        alert('顧客名を入力してください')
        return
      }
      if (!formData.address) {
        alert('住所を入力してください')
        return
      }
    } else if (formData.propertyType === '集合') {
      if (!formData.collectiveCode) {
        alert('集合コードを入力してください')
        return
      }
      if (!formData.collectiveHousingName) {
        alert('集合住宅名を入力してください')
        return
      }
      if (!formData.address) {
        alert('部屋番号・顧客名を入力してください')
        return
      }
    }

    if (!formData.teamId) {
      alert('班を選択してください')
      return
    }

    if (!formData.constructionType) {
      alert('工事種別を選択してください')
      return
    }

    if (!formData.postConstructionReport) {
      alert('工事後報告を選択してください')
      return
    }

    // 工事予定日が変更されている場合、設定者情報を記録
    if (formData.constructionDate !== item.constructionDate && user) {
      formData.constructionDateSetBy = user.id
      formData.constructionDateSetByName = user.name
      formData.constructionDateSetAt = new Date().toISOString()
    }

    onSave(formData)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white w-[min(880px,92vw)] max-h-[90vh] overflow-auto rounded-lg shadow-xl">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            工事依頼編集（整理番号: {item.serialNumber}）
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
              <FormField label="受注番号" required>
                <input
                  value={formData.orderNumber || ''}
                  onChange={(e) => handleChange('orderNumber', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
                  placeholder="例: 2024031500001"
                />
              </FormField>

              <FormField label="KCT受取日">
                <input
                  type="date"
                  value={formData.kctReceivedDate || ''}
                  onChange={(e) => handleChange('kctReceivedDate', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
                />
              </FormField>

              <FormField label="工事依頼日">
                <input
                  type="date"
                  value={formData.constructionRequestedDate || ''}
                  onChange={(e) => handleChange('constructionRequestedDate', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
                />
              </FormField>
            </div>

            {/* 物件情報 */}
            <h3 className="text-md font-semibold text-gray-900 mb-3 border-t pt-4">物件情報</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="sm:col-span-2">
                <FormField label="物件種別" required>
                  <div className="flex gap-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        value="個別"
                        checked={formData.propertyType === '個別'}
                        onChange={(e) => handleChange('propertyType', e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">個別</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        value="集合"
                        checked={formData.propertyType === '集合'}
                        onChange={(e) => handleChange('propertyType', e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">集合</span>
                    </label>
                  </div>
                </FormField>
              </div>

              {formData.propertyType === '個別' ? (
                <>
                  <FormField label="顧客コード" required>
                    <input
                      value={formData.customerCode || ''}
                      onChange={(e) => handleChange('customerCode', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
                    />
                  </FormField>

                  <FormField label="顧客名" required>
                    <input
                      value={formData.customerName || ''}
                      onChange={(e) => handleChange('customerName', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
                    />
                  </FormField>

                  <div className="sm:col-span-2">
                    <FormField label="住所" required>
                      <input
                        value={formData.address || ''}
                        onChange={(e) => handleChange('address', e.target.value)}
                        className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
                      />
                    </FormField>
                  </div>
                </>
              ) : (
                <>
                  <FormField label="集合コード" required>
                    <input
                      value={formData.collectiveCode || ''}
                      onChange={(e) => handleChange('collectiveCode', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
                    />
                  </FormField>

                  <FormField label="集合住宅名" required>
                    <input
                      value={formData.collectiveHousingName || ''}
                      onChange={(e) => handleChange('collectiveHousingName', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
                    />
                  </FormField>

                  <div className="sm:col-span-2">
                    <FormField label="部屋番号・顧客名" required>
                      <input
                        value={formData.address || ''}
                        onChange={(e) => handleChange('address', e.target.value)}
                        className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
                        placeholder="例: 101号室 山田太郎"
                      />
                    </FormField>
                  </div>
                </>
              )}

              <FormField label="電話番号">
                <input
                  value={formData.phoneNumber || ''}
                  onChange={(e) => handleChange('phoneNumber', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
                  placeholder="086-123-4567"
                />
              </FormField>
            </div>

            {/* 依頼先情報 */}
            <h3 className="text-md font-semibold text-gray-900 mb-3 border-t pt-4">依頼先情報</h3>
            <div className="grid grid-cols-1 gap-4 mb-6">
              <div>
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
                </FormField>
              </div>
            </div>

            {/* 工事情報 */}
            <h3 className="text-md font-semibold text-gray-900 mb-3 border-t pt-4">工事情報</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <FormField label="工事種別" required>
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

              <FormField label="状態">
                <select
                  value={formData.status || ''}
                  onChange={(e) => handleChange('status', e.target.value as ConstructionStatus)}
                  className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
                >
                  <option value="未着手">未着手</option>
                  <option value="施工中">施工中</option>
                  <option value="完了">完了</option>
                  <option value="一部完了">一部完了</option>
                  <option value="中止">中止</option>
                  <option value="延期">延期</option>
                  <option value="保留">保留</option>
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

              <FormField label="工事完了日">
                <input
                  type="date"
                  value={formData.constructionCompletedDate || ''}
                  onChange={(e) => handleChange('constructionCompletedDate', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
                />
              </FormField>

              <FormField label="工事後報告" required>
                <select
                  value={formData.postConstructionReport || ''}
                  onChange={(e) => handleChange('postConstructionReport', e.target.value as PostConstructionReport)}
                  className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
                >
                  <option value="完了">完了</option>
                  <option value="未完了">未完了</option>
                  <option value="不要">不要</option>
                </select>
              </FormField>
            </div>

            {/* その他備考 */}
            <div className="border-t pt-4 mb-6">
              <FormField label="その他備考">
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-white text-gray-900 min-h-[72px]"
                  placeholder="その他の情報（任意）"
                />
              </FormField>
            </div>

            {/* 管理者指示事項 */}
            <div className="border-t pt-4 mb-6">
              <RequestNotesComponent
                userRole={user?.role || 'admin'}
                notes={formData.requestNotes}
                isEditing={user?.role === 'admin'}
                onChange={handleNotesChange}
              />
            </div>

            {/* ファイル添付 */}
            <div className="border-t pt-4 mb-6">
              <FileAttachmentsComponent
                userRole={user?.role || 'admin'}
                attachments={formData.attachments || { fromAdmin: [], fromContractor: [] }}
                isEditing={true}
                onFileUpload={handleFileUpload}
                onFileDelete={handleFileDelete}
                onFileDownload={handleFileDownload}
                uploadingFiles={uploadingFiles}
              />
            </div>

            {/* 進捗履歴 */}
            <div className="border-t pt-4">
              <h3 className="text-md font-semibold text-gray-900 mb-3">進捗履歴</h3>
              <ProgressHistory history={item.progressHistory || []} />
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
