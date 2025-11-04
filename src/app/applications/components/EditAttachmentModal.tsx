import React, { useMemo, useState } from 'react'
import { Dialog } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { AttachmentRequest, AttachmentStatus, AttachedFile } from '@/features/applications/types'
import { Contractor, Team } from '@/features/contractor/types'
import { getTeamsByContractorId } from '@/features/contractor/lib/contractorStorage'
import { downloadFile } from '@/features/applications/lib/applicationStorage'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { Input, Textarea, Button } from '@/shared/components/ui'
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
  const [formData, setFormData] = useState<Partial<AttachmentRequest>>({
    ...item,
    submittedAt: item.submittedAt || '',
    approvedAt: item.approvedAt || '',
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

  const handleChange = (field: string, value: unknown) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value }

      if (field === 'status' && value === '許可' && !newData.approvedAt) {
        newData.approvedAt = new Date().toISOString().split('T')[0]
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
        files.map(
          (file) =>
            new Promise<AttachedFile>((resolve) => {
              const reader = new FileReader()
              reader.onload = () => {
                resolve({
                  id: `file-${Date.now()}-${Math.random()}`,
                  fileName: file.name,
                  fileSize: file.size,
                  fileType: file.type,
                  fileData: reader.result as string,
                  uploadedBy: user.id,
                  uploadedByName: user.name,
                  uploadedByRole: user.role as 'admin' | 'contractor',
                  uploadedAt: new Date().toISOString(),
                })
              }
              reader.readAsDataURL(file)
            })
        )
      )

      const existingAttachments = formData.attachments || { fromAdmin: [], fromContractor: [] }
      const targetArray = (user.role as 'admin' | 'contractor') === 'admin' ? 'fromAdmin' : 'fromContractor'

      setFormData((prev) => ({
        ...prev,
        attachments: {
          ...existingAttachments,
          [targetArray]: [...existingAttachments[targetArray], ...newFiles],
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
    const targetArray = (user.role as 'admin' | 'contractor') === 'admin' ? 'fromAdmin' : 'fromContractor'
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

    if (!formData.orderNumber) {
      alert('受注番号を入力してください')
      return
    }

    if (!formData.teamId) {
      alert('班を選択してください')
      return
    }

    onSave(formData)
  }

  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto w-full max-w-5xl rounded-lg bg-white shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              共架・添架依頼を編集
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="受注番号"
                    value={formData.orderNumber || ''}
                    onChange={(e) => handleChange('orderNumber', e.target.value)}
                    required
                    className="bg-white text-gray-900"
                    placeholder="例: 2024031500001"
                  />
                  <SelectField
                    label="状態"
                    value={formData.status || ''}
                    onChange={(value) => handleChange('status', value as AttachmentStatus)}
                    required
                  >
                    <option value="受付">受付</option>
                    <option value="調査済み">調査済み</option>
                    <option value="完了">完了</option>
                  </SelectField>
                  <Input
                    label="依頼日"
                    type="date"
                    value={formData.requestedAt || ''}
                    onChange={(e) => handleChange('requestedAt', e.target.value)}
                    className="bg-white text-gray-900"
                  />
                  <Input
                    label="提出日"
                    type="date"
                    value={formData.submittedAt || ''}
                    onChange={(e) => handleChange('submittedAt', e.target.value)}
                    className="bg-white text-gray-900"
                  />
                  <Input
                    label="許可日"
                    type="date"
                    value={formData.approvedAt || ''}
                    onChange={(e) => handleChange('approvedAt', e.target.value)}
                    className="bg-white text-gray-900"
                  />

                  <CheckboxField
                    label="取下げ必要"
                    checked={!!formData.withdrawNeeded}
                    onChange={(checked) => handleChange('withdrawNeeded', checked)}
                  />
                  <CheckboxField
                    label="取下げ作成"
                    checked={!!formData.withdrawCreated}
                    onChange={(checked) => handleChange('withdrawCreated', checked)}
                  />
                </div>
              </section>

              <section className="space-y-4">
                <SectionTitle>依頼先情報</SectionTitle>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <RadioField
                      label="自社（直営班）"
                      value="internal"
                      checked={formData.assigneeType === 'internal'}
                      onChange={(value) => handleChange('assigneeType', value)}
                    />
                    <RadioField
                      label="協力会社"
                      value="contractor"
                      checked={formData.assigneeType === 'contractor'}
                      onChange={(value) => handleChange('assigneeType', value)}
                    />
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
                <SectionTitle>備考</SectionTitle>
                <Textarea
                  label="備考"
                  value={formData.notes || ''}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="その他の情報（任意）"
                  fullWidth
                  className="min-h-[96px]"
                />
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

function RadioField({
  label,
  value,
  checked,
  onChange,
}: {
  label: string
  value: string
  checked: boolean
  onChange: (value: 'internal' | 'contractor') => void
}) {
  return (
    <label className="flex items-center">
      <input
        type="radio"
        value={value}
        checked={checked}
        onChange={(e) => onChange(e.target.value as 'internal' | 'contractor')}
        className="mr-2"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  )
}

function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-gray-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  )
}
