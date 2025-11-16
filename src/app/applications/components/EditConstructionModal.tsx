import React, { useMemo, useState } from 'react'
import { Dialog } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { ConstructionRequest, AttachedFile } from '@/features/applications/types'
import { Contractor, Team } from '@/features/contractor/types'
import { getTeamsByContractorId } from '@/features/contractor/lib/contractorStorage'
import { downloadFile } from '@/features/applications/lib/applicationStorage'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { Input, Button } from '@/shared/components/ui'
import FileAttachmentsComponent from './FileAttachments'
import RequestNotesComponent from './RequestNotes'

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
    }
    if (formData.contractorId) {
      return getTeamsByContractorId(formData.contractorId)
    }
    return []
  }, [formData.assigneeType, formData.contractorId, contractors])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value }

      if (field === 'status' && value === '完了') {
        if (!newData.completedAt) {
          newData.completedAt = new Date().toISOString().split('T')[0]
        }
        if (!newData.constructionCompletedDate) {
          newData.constructionCompletedDate = new Date().toISOString().split('T')[0]
        }
      }

      if (field === 'propertyType') {
        if (value === '個別') {
          newData.collectiveCode = ''
          newData.collectiveHousingName = ''
        } else if (value === '集合') {
          newData.customerCode = ''
        }
      }

      if (field === 'assigneeType') {
        newData.contractorId = ''
        newData.contractorName = ''
        newData.teamId = ''
        newData.teamName = ''

        if (value === 'internal') {
          const chokueiContractor = contractors.find((c) => c.name === '直営班')
          if (chokueiContractor) {
            newData.contractorId = chokueiContractor.id
            newData.contractorName = chokueiContractor.name
          }
        }
      }

      if (field === 'contractorId') {
        const contractor = contractors.find((c) => c.id === value)
        newData.contractorName = contractor?.name || ''
        newData.teamId = ''
        newData.teamName = ''
      }

      if (field === 'teamId') {
        const team =
          availableTeams.find((t) => t.id === value) ||
          teams.find((t) => t.id === value)
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

  const handleFileDownload = (file: AttachedFile) => {
    downloadFile(file)
  }

  const handleNotesChange = (notes: string) => {
    setFormData((prev) => ({
      ...prev,
      requestNotes: { ...prev.requestNotes, adminNotes: notes },
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const updates: Partial<ConstructionRequest> = { ...formData }

    if (!updates.orderNumber) {
      alert('受注番号を入力してください')
      return
    }

    if (!updates.propertyType) {
      alert('個別/集合を選択してください')
      return
    }

    if (updates.propertyType === '個別') {
      if (!updates.customerCode) {
        alert('顧客コードを入力してください')
        return
      }
      if (!updates.customerName) {
        alert('顧客名を入力してください')
        return
      }
      if (!updates.address) {
        alert('住所を入力してください')
        return
      }
    } else if (updates.propertyType === '集合') {
      if (!updates.collectiveCode) {
        alert('集合コードを入力してください')
        return
      }
      if (!updates.collectiveHousingName) {
        alert('集合住宅名を入力してください')
        return
      }
      if (!updates.address) {
        alert('部屋番号・顧客名を入力してください')
        return
      }
    }

    if (!updates.teamId) {
      alert('班を選択してください')
      return
    }

    if (!updates.postConstructionReport) {
      alert('工事後報告を選択してください')
      return
    }

    if (updates.constructionDate !== item.constructionDate && user) {
      updates.constructionDateSetBy = user.id
      updates.constructionDateSetByName = user.name
      updates.constructionDateSetAt = new Date().toISOString()
    }

    onSave(updates)
  }

  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto w-full max-w-5xl rounded-lg bg-white shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              工事依頼編集（整理番号: {item.serialNumber}）
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="px-6 py-4 space-y-6">
              <section>
                <SectionTitle>基本情報</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="受注番号"
                    value={formData.orderNumber || ''}
                    onChange={(e) => handleChange('orderNumber', e.target.value)}
                    required
                    className="bg-white text-gray-900"
                    placeholder="例: 2024031500001"
                  />
                  <Input
                    label="KCT受取日"
                    type="date"
                    value={formData.kctReceivedDate || ''}
                    onChange={(e) => handleChange('kctReceivedDate', e.target.value)}
                    className="bg-white text-gray-900"
                  />
                  <Input
                    label="工事依頼日"
                    type="date"
                    value={formData.constructionRequestedDate || ''}
                    onChange={(e) => handleChange('constructionRequestedDate', e.target.value)}
                    className="bg-white text-gray-900"
                  />
                </div>
              </section>

              <section className="space-y-4">
                <SectionTitle>依頼先情報</SectionTitle>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="internal"
                        checked={formData.assigneeType === 'internal'}
                        onChange={(e) => handleChange('assigneeType', e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">自社（直営班）</span>
                    </label>
                    <label className="flex items-center">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData.assigneeType === 'contractor' && (
                      <SelectField
                        label="協力会社"
                        value={formData.contractorId || ''}
                        onChange={(value) => handleChange('contractorId', value)}
                        required
                      >
                        <option value="">選択してください</option>
                        {contractors
                          .filter((c) => c.isActive && c.name !== '直営班')
                          .map((contractor) => (
                            <option key={contractor.id} value={contractor.id}>
                              {contractor.name}
                            </option>
                          ))}
                      </SelectField>
                    )}

                    <SelectField
                      label="班"
                      value={formData.teamId || ''}
                      onChange={(value) => handleChange('teamId', value)}
                      required
                    >
                      <option value="">選択してください</option>
                      {availableTeams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.teamName}
                        </option>
                      ))}
                    </SelectField>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <SectionTitle>工事情報</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SelectField
                    label="状態"
                    value={formData.status || ''}
                    onChange={(value) => handleChange('status', value)}
                    required
                  >
                    <option value="未着手">未着手</option>
                    <option value="依頼済み">依頼済み</option>
                    <option value="工事日決定">工事日決定</option>
                    <option value="完了">完了</option>
                    <option value="工事返却">工事返却</option>
                    <option value="工事キャンセル">工事キャンセル</option>
                  </SelectField>

                  <Input
                    label="工事予定日"
                    type="date"
                    value={formData.constructionDate || ''}
                    onChange={(e) => handleChange('constructionDate', e.target.value)}
                    className="bg-white text-gray-900"
                  />

                  <Input
                    label="工事完了日"
                    type="date"
                    value={formData.constructionCompletedDate || ''}
                    onChange={(e) => handleChange('constructionCompletedDate', e.target.value)}
                    className="bg-white text-gray-900"
                  />

                  <SelectField
                    label="工事後報告"
                    value={formData.postConstructionReport || ''}
                    onChange={(value) => handleChange('postConstructionReport', value)}
                    required
                  >
                    <option value="完了">完了</option>
                    <option value="未完了">未完了</option>
                    <option value="不要">不要</option>
                  </SelectField>
                </div>
              </section>

              <section className="space-y-4 border-t border-gray-200 pt-4">
                <RequestNotesComponent
                  userRole={user?.role || 'admin'}
                  notes={formData.requestNotes}
                  isEditing={user?.role === 'admin'}
                  onChange={handleNotesChange}
                />
              </section>

              <section className="space-y-4 border-t border-gray-200 pt-4">
                <FileAttachmentsComponent
                  userRole={user?.role || 'admin'}
                  attachments={formData.attachments || { fromAdmin: [], fromContractor: [] }}
                  isEditing
                  onFileUpload={handleFileUpload}
                  onFileDelete={handleFileDelete}
                  onFileDownload={handleFileDownload}
                  uploadingFiles={uploadingFiles}
                />
              </section>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <Button type="button" variant="secondary" onClick={onClose}>
                キャンセル
              </Button>
              <Button type="submit">保存</Button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-3 text-md font-medium text-gray-900">{children}</h3>
}

function SelectField({
  label,
  value,
  onChange,
  children,
  required = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  children: React.ReactNode
  required?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900"
      >
        {children}
      </select>
    </div>
  )
}
