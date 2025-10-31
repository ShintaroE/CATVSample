import React, { useState, useMemo } from 'react'
import { AttachmentRequest, AttachmentStatus, AttachmentDetail, AttachmentPreparationStatus, AttachedFile } from '@/features/applications/types'
import { Contractor, Team } from '@/features/contractor/types'
import { getTeamsByContractorId } from '@/features/contractor/lib/contractorStorage'
import { downloadFile } from '@/features/applications/lib/applicationStorage'
import { useAuth } from '@/features/auth/hooks/useAuth'
import FileAttachmentsComponent from './FileAttachments'
import RequestNotesComponent from './RequestNotes'

interface EditAttachmentModalProps {
  item: AttachmentRequest
  contractors: Contractor[]
  teams: Team[]
  onClose: () => void
  onSave: (updates: Partial<AttachmentRequest>) => void
}

export default function EditAttachmentModal({
  item,
  contractors,
  teams,
  onClose,
  onSave,
}: EditAttachmentModalProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState<Partial<AttachmentRequest>>(item)
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

  const handleChange = (field: string, value: string | boolean | string[] | undefined | AttachmentDetail | AttachmentPreparationStatus) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value }

      if (field === 'status' && value === '許可' && !newData.approvedAt) {
        newData.approvedAt = new Date().toISOString().split('T')[0]
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
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white w-[min(880px,92vw)] max-h-[90vh] overflow-auto rounded-lg shadow-xl">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            共架・添架依頼 編集（整理番号: {item.serialNumber}）
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            {/* 依頼先 */}
            <div className="sm:col-span-2 border-t pt-4">
              <h3 className="text-md font-semibold text-gray-900 mb-3">依頼先</h3>
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

            {/* 申請情報 */}
            <div className="sm:col-span-2 border-t pt-4">
              <h3 className="text-md font-semibold text-gray-900 mb-3">申請情報</h3>
            </div>

            <FormField label="状態">
              <select
                value={formData.status || ''}
                onChange={(e) => handleChange('status', e.target.value as AttachmentStatus)}
                className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
              >
                <option value="受付">受付</option>
                <option value="提出済">提出済</option>
                <option value="許可">許可</option>
                <option value="取下げ">取下げ</option>
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

            <FormField label="提出日">
              <input
                type="date"
                value={formData.submittedAt || ''}
                onChange={(e) => handleChange('submittedAt', e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
              />
            </FormField>

            <FormField label="許可日">
              <input
                type="date"
                value={formData.approvedAt || ''}
                onChange={(e) => handleChange('approvedAt', e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
              />
            </FormField>

            <FormField label="取下げ必要">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={!!formData.withdrawNeeded}
                  onChange={(e) => handleChange('withdrawNeeded', e.target.checked)}
                />
                必要
              </label>
            </FormField>

            <FormField label="取下げ作成">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={!!formData.withdrawCreated}
                  onChange={(e) => handleChange('withdrawCreated', e.target.checked)}
                />
                作成済
              </label>
            </FormField>

            <div className="sm:col-span-2">
              <FormField label="備考">
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-white text-gray-900 min-h-[72px]"
                  placeholder="その他の情報（任意）"
                />
              </FormField>
            </div>

            {/* 依頼時の備考 */}
            <div className="sm:col-span-2 border-t pt-4">
              <RequestNotesComponent
                userRole={user?.role || 'admin'}
                notes={formData.requestNotes}
                isEditing={user?.role === 'admin'}
                onChange={handleNotesChange}
              />
            </div>

            {/* ファイル添付 */}
            <div className="sm:col-span-2 border-t pt-4">
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
