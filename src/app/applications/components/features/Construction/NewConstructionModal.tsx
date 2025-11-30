import React, { useMemo, useState } from 'react'
import { Dialog } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import {
  RequestType,
  SurveyRequest,
  AttachmentRequest,
  ConstructionRequest,
  AssigneeType,
  FileAttachments,
  RequestNotes,
  AttachedFile,
  PostConstructionApplicationReport,
} from '@/features/applications/types'
import { Contractor, Team } from '@/features/contractor/types'
import { getTeamsByContractorId } from '@/features/contractor/lib/contractorStorage'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { Input, Button } from '@/shared/components/ui'
import FileAttachmentsComponent from '../../common/FileAttachments'
import RequestNotesComponent from '../../common/RequestNotes'
import OrderSearchModal from '@/shared/components/order/OrderSearchModal'
import { OrderData } from '@/app/orders/types'

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
    status: '未着手',
    kctReceivedDate: '',
    constructionRequestedDate: '',
  }))
  const [postConstructionReport, setPostConstructionReport] = useState<PostConstructionApplicationReport>({ required: false })
  const [attachments, setAttachments] = useState<FileAttachments>({
    fromAdmin: [],
    fromContractor: [],
  })
  const [requestNotes, setRequestNotes] = useState<RequestNotes>({
    adminNotes: '',
  })
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [showOrderSearchModal, setShowOrderSearchModal] = useState(false)

  const availableTeams = useMemo(() => {
    if (formData.assigneeType === 'internal') {
      return chokueiContractor ? getTeamsByContractorId(chokueiContractor.id) : []
    }
    if (formData.contractorId) {
      return getTeamsByContractorId(formData.contractorId as string)
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

  const handleOrderSelect = (order: OrderData) => {
    // 受注番号（必須）
    handleChange('orderNumber', order.orderNumber)

    // 物件種別によって分岐
    if (order.constructionCategory === '個別') {
      handleChange('propertyType', '個別')
      handleChange('customerCode', order.customerCode)
      handleChange('customerName', order.customerName)
      handleChange('address', order.address || '')
      handleChange('phoneNumber', order.phoneNumber || '')
    } else {
      handleChange('propertyType', '集合')
      handleChange('collectiveCode', order.collectiveCode || '')
      handleChange('collectiveHousingName', order.collectiveHousingName || '')
      handleChange('address', order.address || '')
      handleChange('phoneNumber', order.phoneNumber || '')
    }

    // クロージャ番号があれば備考に追加
    if (order.closureNumber) {
      const currentNotes = requestNotes.adminNotes || ''
      const newNotes = currentNotes
        ? `${currentNotes}\nクロージャ番号: ${order.closureNumber}`
        : `クロージャ番号: ${order.closureNumber}`
      setRequestNotes({ adminNotes: newNotes })
    }

    setShowOrderSearchModal(false)
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

    if (postConstructionReport.required && !postConstructionReport.status) {
      alert('工事後の申請完了報告が必要な場合は、完了状態を選択してください')
      return
    }

    onCreate('construction', {
      ...formData,
      postConstructionApplicationReport: postConstructionReport,
      attachments,
      requestNotes,
    })
  }

  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto w-full max-w-5xl rounded-lg bg-white shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              新規工事依頼
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
                    value={(formData.orderNumber as string) || ''}
                    onChange={(e) => handleChange('orderNumber', e.target.value)}
                    required
                    className="bg-white text-gray-900"
                    placeholder="例: 2024031500001"
                    endAdornment={
                      <Button
                        variant="secondary"
                        onClick={() => setShowOrderSearchModal(true)}
                        type="button"
                      >
                        🔍 検索
                      </Button>
                    }
                  />
                  <Input
                    label="KCT受取日"
                    type="date"
                    value={(formData.kctReceivedDate as string) || ''}
                    onChange={(e) => handleChange('kctReceivedDate', e.target.value)}
                    className="bg-white text-gray-900"
                  />
                  <Input
                    label="工事依頼日"
                    type="date"
                    value={(formData.constructionRequestedDate as string) || ''}
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    工事後の申請完了報告 <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-3">
                    {/* 要否選択 */}
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={!postConstructionReport.required}
                          onChange={() => {
                            setPostConstructionReport({ required: false })
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">不要</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={postConstructionReport.required === true}
                          onChange={() => {
                            setPostConstructionReport({ required: true, status: 'pending' })
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">必要</span>
                      </label>
                    </div>

                    {/* 完了状態選択（必要の場合のみ表示） */}
                    {postConstructionReport.required && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          完了状態 <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={postConstructionReport.status || 'pending'}
                          onChange={(e) => {
                            setPostConstructionReport({
                              required: true,
                              status: e.target.value as 'completed' | 'pending'
                            })
                          }}
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900"
                        >
                          <option value="pending">未完了</option>
                          <option value="completed">完了</option>
                        </select>
                      </div>
                    )}
                  </div>
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
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <Button type="button" variant="secondary" onClick={onClose}>
                キャンセル
              </Button>
              <Button type="submit">登録</Button>
            </div>
          </form>

          {/* 受注情報検索モーダル */}
          <OrderSearchModal
            isOpen={showOrderSearchModal}
            onClose={() => setShowOrderSearchModal(false)}
            onSelect={handleOrderSelect}
          />
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
