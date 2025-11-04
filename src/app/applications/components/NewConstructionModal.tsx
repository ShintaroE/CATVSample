import React, { useMemo, useState } from 'react'
import {
  RequestType,
  SurveyRequest,
  AttachmentRequest,
  ConstructionRequest,
  AssigneeType,
  FileAttachments,
  RequestNotes,
  AttachedFile,
  PostConstructionReport,
} from '@/features/applications/types'
import { Contractor, Team } from '@/features/contractor/types'
import { getTeamsByContractorId } from '@/features/contractor/lib/contractorStorage'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { Input, Textarea, Button } from '@/shared/components/ui'
import FileAttachmentsComponent from './FileAttachments'
import RequestNotesComponent from './RequestNotes'

interface NewConstructionModalProps {
  contractors: Contractor[]
  teams: Team[]
  onClose: () => void
  onCreate: (
    type: RequestType,
    data: Partial<SurveyRequest | AttachmentRequest | ConstructionRequest>
  ) => void
}

export default function NewConstructionModal({
  contractors,
  teams,
  onClose,
  onCreate,
}: NewConstructionModalProps) {
  const { user } = useAuth()
  const chokueiContractor = useMemo(
    () => contractors.find((c) => c.name === '直営班'),
    [contractors]
  )

  const [formData, setFormData] = useState<Record<string, string | boolean | string[] | undefined>>(() => ({
    assigneeType: 'internal' as AssigneeType,
    contractorId: chokueiContractor?.id || '',
    contractorName: chokueiContractor?.name || '',
    teamId: '',
    teamName: '',
    propertyType: '個別',
    status: '未着手',
    kctReceivedDate: '',
    constructionRequestedDate: '',
    postConstructionReport: '未完了' as PostConstructionReport,
  }))
  const [attachments, setAttachments] = useState<FileAttachments>({
    fromAdmin: [],
    fromContractor: [],
  })
  const [requestNotes, setRequestNotes] = useState<RequestNotes>({
    adminNotes: '',
  })
  const [uploadingFiles, setUploadingFiles] = useState(false)

  const availableTeams = useMemo(() => {
    if (formData.assigneeType === 'internal') {
      return chokueiContractor ? getTeamsByContractorId(chokueiContractor.id) : []
    }
    if (formData.contractorId && typeof formData.contractorId === 'string') {
      return getTeamsByContractorId(formData.contractorId)
    }
    return []
  }, [formData.assigneeType, formData.contractorId, chokueiContractor])

  const handleChange = (
    field: string,
    value: string | boolean | string[] | undefined
  ) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value }

      if (field === 'assigneeType') {
        newData.contractorId = ''
        newData.contractorName = ''
        newData.teamId = ''
        newData.teamName = ''

        if (value === 'internal') {
          newData.contractorId = chokueiContractor?.id || ''
          newData.contractorName = chokueiContractor?.name || ''
        }
      }

      if (field === 'contractorId') {
        const contractor = contractors.find((c) => c.id === value)
        newData.contractorName = contractor?.name || ''
        newData.teamId = ''
        newData.teamName = ''
      }

      if (field === 'teamId') {
        const team = teams.find((t) => t.id === value)
        newData.teamName = team?.teamName || ''
      }

      if (field === 'propertyType') {
        if (value === '個別') {
          newData.collectiveCode = ''
          newData.collectiveHousingName = ''
        } else if (value === '集合') {
          newData.customerCode = ''
          newData.customerName = ''
        }
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
            reader.onload = () => {
              resolve({
                name: file.name,
                size: file.size,
                type: file.type,
                data: reader.result as string,
              })
            }
            reader.readAsDataURL(file)
          })
        })
      )

      setAttachments((prev) => ({
        ...prev,
        fromAdmin: [
          ...prev.fromAdmin,
          ...newFiles.map((f, i) => ({
            id: `temp-${Date.now()}-${i}`,
            fileName: f.name,
            fileSize: f.size,
            fileType: f.type,
            fileData: f.data,
            uploadedBy: user.id,
            uploadedByName: user.name,
            uploadedByRole: 'admin' as const,
            uploadedAt: new Date().toISOString(),
          })),
        ],
      }))
    } catch (error) {
      console.error('File upload failed:', error)
    } finally {
      setUploadingFiles(false)
    }
  }

  const handleFileDelete = (fileId: string) => {
    setAttachments((prev) => ({
      ...prev,
      fromAdmin: prev.fromAdmin.filter((f) => f.id !== fileId),
    }))
  }

  const handleFileDownload = (file: AttachedFile) => {
    const link = document.createElement('a')
    link.href = file.fileData
    link.download = file.fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

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

    onCreate('construction', {
      ...formData,
      attachments,
      requestNotes,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-[min(880px,92vw)] max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-medium text-gray-900">新規工事依頼</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <span className="text-2xl leading-none">×</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 px-6 py-4">
          <section className="space-y-4">
            <SectionTitle>基本情報</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
              label="受注番号"
              value={(formData.orderNumber as string) || ''}
              onChange={(e) => handleChange('orderNumber', e.target.value)}
              required
              placeholder="例: 2024031500001"
              fullWidth
              className="bg-white text-gray-900"
            />
            <Input
              label="KCT受取日"
              type="date"
              value={(formData.kctReceivedDate as string) || ''}
              onChange={(e) => handleChange('kctReceivedDate', e.target.value)}
              fullWidth
              className="bg-white text-gray-900"
            />
            <Input
              label="工事依頼日"
              type="date"
              value={(formData.constructionRequestedDate as string) || ''}
              onChange={(e) => handleChange('constructionRequestedDate', e.target.value)}
              fullWidth
              className="bg-white text-gray-900"
            />
          </div>
        </section>

        <section className="space-y-4">
          <SectionTitle>物件情報</SectionTitle>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              個別/集合 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="個別"
                  checked={formData.propertyType === '個別'}
                  onChange={(e) => handleChange('propertyType', e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">個別</span>
              </label>
              <label className="flex items-center">
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
          </div>

          {formData.propertyType === '個別' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="顧客コード"
                value={(formData.customerCode as string) || ''}
                onChange={(e) => handleChange('customerCode', e.target.value)}
                required
                fullWidth
                className="bg-white text-gray-900"
              />
              <Input
                label="顧客名"
                value={(formData.customerName as string) || ''}
                onChange={(e) => handleChange('customerName', e.target.value)}
                required
                fullWidth
                className="bg-white text-gray-900"
              />
              <Input
                label="住所"
                value={(formData.address as string) || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                required
                fullWidth
                className="bg-white text-gray-900 md:col-span-2"
              />
              <Input
                label="電話番号"
                value={(formData.phoneNumber as string) || ''}
                onChange={(e) => handleChange('phoneNumber', e.target.value)}
                placeholder="086-123-4567"
                fullWidth
                className="bg-white text-gray-900"
              />
            </div>
          )}

          {formData.propertyType === '集合' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="集合コード"
                value={(formData.collectiveCode as string) || ''}
                onChange={(e) => handleChange('collectiveCode', e.target.value)}
                required
                fullWidth
                className="bg-white text-gray-900"
              />
              <Input
                label="集合住宅名"
                value={(formData.collectiveHousingName as string) || ''}
                onChange={(e) => handleChange('collectiveHousingName', e.target.value)}
                required
                fullWidth
                className="bg-white text-gray-900"
              />
              <Input
                label="部屋番号・顧客名"
                value={(formData.address as string) || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                required
                placeholder="例: 101号室 山田太郎"
                fullWidth
                className="bg-white text-gray-900 md:col-span-2"
              />
              <Input
                label="電話番号"
                value={(formData.phoneNumber as string) || ''}
                onChange={(e) => handleChange('phoneNumber', e.target.value)}
                placeholder="086-123-4567"
                fullWidth
                className="bg-white text-gray-900"
              />
            </div>
          )}
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
                  value={(formData.contractorId as string) || ''}
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
                value={(formData.teamId as string) || ''}
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
              label="工事種別"
              value={(formData.constructionType as string) || ''}
              onChange={(value) => handleChange('constructionType', value)}
              required
            >
              <option value="">選択してください</option>
              <option value="宅内引込">宅内引込</option>
              <option value="撤去">撤去</option>
              <option value="移設">移設</option>
              <option value="その他">その他</option>
            </SelectField>

            <SelectField
              label="工事後報告"
              value={(formData.postConstructionReport as string) || ''}
              onChange={(value) => handleChange('postConstructionReport', value)}
              required
            >
              <option value="未完了">未完了</option>
              <option value="完了">完了</option>
              <option value="不要">不要</option>
            </SelectField>
          </div>
        </section>

        <section className="space-y-4 border-t border-gray-200 pt-4">
          <RequestNotesComponent
            userRole="admin"
            notes={requestNotes}
            isEditing
            onChange={(notes) => setRequestNotes({ adminNotes: notes })}
          />
        </section>

        <section className="space-y-4 border-t border-gray-200 pt-4">
          <FileAttachmentsComponent
            userRole="admin"
            attachments={attachments}
            isEditing
            onFileUpload={handleFileUpload}
            onFileDelete={handleFileDelete}
            onFileDownload={handleFileDownload}
            uploadingFiles={uploadingFiles}
          />
        </section>

        <section className="space-y-2 border-t border-gray-200 pt-4">
          <Textarea
            label="その他備考"
            value={(formData.notes as string) || ''}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="その他の情報（任意）"
            fullWidth
            className="min-h-[96px]"
            />
          </section>

          <div className="flex items-center justify-end space-x-3 border-t border-gray-200 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              キャンセル
            </Button>
            <Button type="submit">登録</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-md font-medium text-gray-900">{children}</h3>
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
        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
      >
        {children}
      </select>
    </div>
  )
}
