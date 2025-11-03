import React, { useState, useMemo } from 'react'
import {
  RequestType,
  SurveyRequest,
  AttachmentRequest,
  ConstructionRequest,
  AssigneeType,
  FileAttachments,
  RequestNotes,
  AttachedFile,
} from '@/features/applications/types'
import { Contractor, Team } from '@/features/contractor/types'
import { getTeamsByContractorId } from '@/features/contractor/lib/contractorStorage'
import { useAuth } from '@/features/auth/hooks/useAuth'
import FileAttachmentsComponent from './FileAttachments'
import RequestNotesComponent from './RequestNotes'

interface NewSurveyModalProps {
  contractors: Contractor[]
  teams: Team[]
  onClose: () => void
  onCreate: (
    type: RequestType,
    data: Partial<SurveyRequest | AttachmentRequest | ConstructionRequest>
  ) => void
}

export default function NewSurveyModal({
  contractors,
  teams,
  onClose,
  onCreate,
}: NewSurveyModalProps) {
  const { user } = useAuth()
  const activeTab: RequestType = 'survey'
  const [formData, setFormData] = useState<Record<string, string | boolean | string[] | undefined>>({
    assigneeType: 'internal' as AssigneeType,
    contractorId: '',
    teamId: '',
  })
  const [attachments, setAttachments] = useState<FileAttachments>({
    fromAdmin: [],
    fromContractor: [],
  })
  const [requestNotes, setRequestNotes] = useState<RequestNotes>({
    adminNotes: '',
  })
  const [uploadingFiles, setUploadingFiles] = useState(false)

  // 協力会社選択時に利用可能な班を取得
  const availableTeams = useMemo(() => {
    if (formData.assigneeType === 'internal') {
      // 自社の場合は直営班の班のみ
      const chokueiContractor = contractors.find((c) => c.name === '直営班')
      return chokueiContractor
        ? getTeamsByContractorId(chokueiContractor.id)
        : []
    } else if (formData.contractorId && typeof formData.contractorId === 'string') {
      return getTeamsByContractorId(formData.contractorId)
    }
    return []
  }, [formData.assigneeType, formData.contractorId, contractors])

  const handleChange = (
    field: string,
    value: string | boolean | string[] | undefined
  ) => {
    setFormData((prev) => {
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

  const handleFileUpload = async (files: File[]) => {
    if (!user) return

    setUploadingFiles(true)
    try {
      // 新規作成時は一時的にattachments stateに保存
      // 実際のアップロードは登録時に行う
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
    onCreate(activeTab, {
      ...formData,
      attachments,
      requestNotes,
    })
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
          <h2 className="text-lg font-semibold">新規現地調査依頼</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 共通項目 */}
            <FormField label="受注番号">
              <input
                value={(formData.orderNumber as string) || ''}
                onChange={(e) => handleChange('orderNumber', e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
                placeholder="例: 2024031500001"
              />
            </FormField>

            <FormField label="契約No.">
              <input
                value={(formData.contractNo as string) || ''}
                onChange={(e) => handleChange('contractNo', e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
              />
            </FormField>

            <FormField label="顧客コード">
              <input
                value={(formData.customerCode as string) || ''}
                onChange={(e) => handleChange('customerCode', e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
              />
            </FormField>

            <FormField label="顧客名">
              <input
                value={(formData.customerName as string) || ''}
                onChange={(e) => handleChange('customerName', e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
              />
            </FormField>

            <div className="sm:col-span-2">
              <FormField label="住所">
                <input
                  value={(formData.address as string) || ''}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
                />
              </FormField>
            </div>

            <FormField label="電話番号">
              <input
                value={(formData.phoneNumber as string) || ''}
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
                        value={(formData.contractorId as string) || ''}
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
                      value={(formData.teamId as string) || ''}
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
                value={(formData.requestedAt as string) || ''}
                onChange={(e) => handleChange('requestedAt', e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
              />
            </FormField>

            <FormField label="予定日">
              <input
                type="date"
                value={(formData.scheduledDate as string) || ''}
                onChange={(e) => handleChange('scheduledDate', e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
              />
            </FormField>

            {/* 現地調査依頼の追加項目 */}
            <div className="sm:col-span-2">
              <FormField label="調査項目">
                <div className="space-y-2">
                  {['クロージャ番号確認', '引込ルート確認', '電柱高さ測定', 'その他'].map(
                    (item) => (
                      <label key={item} className="inline-flex items-center mr-4">
                        <input
                          type="checkbox"
                          checked={((formData.surveyItems as string[]) || []).includes(item)}
                          onChange={(e) => {
                            const current = (formData.surveyItems as string[]) || []
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

            {/* 依頼時の備考 */}
            <div className="sm:col-span-2 border-t pt-4">
              <RequestNotesComponent
                userRole="admin"
                notes={requestNotes}
                isEditing={true}
                onChange={(notes) => setRequestNotes({ adminNotes: notes })}
              />
            </div>

            {/* ファイル添付 */}
            <div className="sm:col-span-2 border-t pt-4">
              <FileAttachmentsComponent
                userRole="admin"
                attachments={attachments}
                isEditing={true}
                onFileUpload={handleFileUpload}
                onFileDelete={handleFileDelete}
                onFileDownload={handleFileDownload}
                uploadingFiles={uploadingFiles}
              />
            </div>

            {/* その他の備考（従来の備考フィールド） */}
            <div className="sm:col-span-2 border-t pt-4">
              <FormField label="その他備考">
                <textarea
                  value={(formData.notes as string) || ''}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-white text-gray-900 min-h-[72px]"
                  placeholder="その他の情報（任意）"
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
