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
} from '@/features/applications/types'
import { Contractor, Team } from '@/features/contractor/types'
import { getTeamsByContractorId } from '@/features/contractor/lib/contractorStorage'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { Input } from '@/shared/components/ui'
import FileAttachmentsComponent from './FileAttachments'
import RequestNotesComponent from './RequestNotes'

interface NewAttachmentModalProps {
  contractors: Contractor[]
  teams: Team[]
  onClose: () => void
  onCreate: (
    type: RequestType,
    data: Partial<SurveyRequest | AttachmentRequest | ConstructionRequest>
  ) => void
}

export default function NewAttachmentModal({
  contractors,
  teams,
  onClose,
  onCreate,
}: NewAttachmentModalProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState<Record<string, string | boolean | string[] | undefined>>({
    assigneeType: 'internal' as AssigneeType,
    propertyType: '個別', // 個別/集合
    contractorId: '',
    teamId: '',
    orderNumber: '',
    customerCode: '',
    customerName: '',
    collectiveCode: '', // 集合コード
    collectiveHousingName: '', // 集合住宅名
    address: '',
    requestedAt: '',
    scheduledDate: '',
    submittedAt: '',
    withdrawNeeded: false, // 申請要否（デフォルト: 申請不要）
    postConstructionReport: undefined, // 工事後報告（デフォルト: 未設定）
  })
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
      const chokueiContractor = contractors.find((c) => c.name === '直営班')
      return chokueiContractor ? getTeamsByContractorId(chokueiContractor.id) : []
    }
    if (formData.contractorId) {
      return getTeamsByContractorId(formData.contractorId as string)
    }
    return []
  }, [formData.assigneeType, formData.contractorId, contractors])

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

      // 個別/集合の切り替え時に不要なフィールドをクリア
      if (field === 'propertyType') {
        if (value === '個別') {
          newData.collectiveCode = ''
          newData.collectiveHousingName = ''
        } else if (value === '集合') {
          // 集合の場合は何もクリアしない（顧客コード・顧客名は両方で使用）
        }
      }

      return newData
    })
  }

  const handleFileUpload = async (files: File[]) => {
    if (!user) return
    setUploadingFiles(true)
    try {
      const newFiles: AttachedFile[] = await Promise.all(
        files.map(async (file) => {
          return new Promise<AttachedFile>((resolve) => {
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
                uploadedByRole: 'admin',
                uploadedAt: new Date().toISOString(),
              })
            }
            reader.readAsDataURL(file)
          })
        })
      )

      setAttachments((prev) => ({
        ...prev,
        fromAdmin: [...prev.fromAdmin, ...newFiles],
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
    link.click()
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
    } else if (formData.propertyType === '集合') {
      if (!formData.collectiveCode) {
        alert('集合コードを入力してください')
        return
      }
      if (!formData.collectiveHousingName) {
        alert('集合住宅名を入力してください')
        return
      }
    }

    if (!formData.address) {
      alert(formData.propertyType === '個別' ? '住所を入力してください' : '部屋番号・顧客名を入力してください')
      return
    }

    if (!formData.teamId) {
      alert('班を選択してください')
      return
    }

    // データ作成
    const newData: Partial<AttachmentRequest> = {
      ...formData,
      type: 'attachment',
      attachments,
      requestNotes,
    }

    onCreate('attachment', newData)
  }

  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto w-full max-w-5xl rounded-lg bg-white shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              新規共架・添架依頼
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
              {/* 基本情報 */}
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-3">基本情報</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="受注番号"
                    value={(formData.orderNumber as string) || ''}
                    onChange={(e) => handleChange('orderNumber', e.target.value)}
                    className="bg-white text-gray-900"
                  />
                  <Input
                    label="KCT受取日"
                    type="date"
                    value={(formData.kctReceivedDate as string) || ''}
                    onChange={(e) => handleChange('kctReceivedDate', e.target.value)}
                    className="bg-white text-gray-900"
                  />
                  <Input
                    label="依頼日"
                    type="date"
                    value={(formData.requestedAt as string) || ''}
                    onChange={(e) => handleChange('requestedAt', e.target.value)}
                    className="bg-white text-gray-900"
                  />
                </div>
              </div>

              {/* 物件情報 */}
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-3">物件情報</h3>

                {/* 個別/集合選択 */}
                <div className="mb-4">
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

                {/* 個別の場合 */}
                {formData.propertyType === '個別' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="顧客コード"
                      value={(formData.customerCode as string) || ''}
                      onChange={(e) => handleChange('customerCode', e.target.value)}
                      required
                      className="bg-white text-gray-900"
                    />
                    <Input
                      label="顧客名"
                      value={(formData.customerName as string) || ''}
                      onChange={(e) => handleChange('customerName', e.target.value)}
                      required
                      className="bg-white text-gray-900"
                    />
                    <Input
                      label="住所"
                      value={(formData.address as string) || ''}
                      onChange={(e) => handleChange('address', e.target.value)}
                      required
                      className="bg-white text-gray-900 md:col-span-2"
                    />
                    <Input
                      label="電話番号"
                      value={(formData.phoneNumber as string) || ''}
                      onChange={(e) => handleChange('phoneNumber', e.target.value)}
                      className="bg-white text-gray-900"
                    />
                  </div>
                )}

                {/* 集合の場合 */}
                {formData.propertyType === '集合' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="集合コード"
                      value={(formData.collectiveCode as string) || ''}
                      onChange={(e) => handleChange('collectiveCode', e.target.value)}
                      required
                      className="bg-white text-gray-900"
                    />
                    <Input
                      label="集合住宅名"
                      value={(formData.collectiveHousingName as string) || ''}
                      onChange={(e) => handleChange('collectiveHousingName', e.target.value)}
                      required
                      className="bg-white text-gray-900"
                    />
                    <Input
                      label="部屋番号・顧客名"
                      value={(formData.address as string) || ''}
                      onChange={(e) => handleChange('address', e.target.value)}
                      required
                      placeholder="例: 101号室 山田太郎"
                      className="bg-white text-gray-900 md:col-span-2"
                    />
                    <Input
                      label="電話番号"
                      value={(formData.phoneNumber as string) || ''}
                      onChange={(e) => handleChange('phoneNumber', e.target.value)}
                      className="bg-white text-gray-900"
                    />
                  </div>
                )}
              </div>

              {/* 依頼先情報 */}
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-3">依頼先情報</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">依頼先</label>
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
                  </div>

                  {formData.assigneeType === 'contractor' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">協力会社</label>
                        <select
                          value={(formData.contractorId as string) || ''}
                          onChange={(e) => handleChange('contractorId', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                          required
                        >
                          <option value="">選択してください</option>
                          {contractors
                            .filter((c) => c.name !== '直営班')
                            .map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">班</label>
                        <select
                          value={(formData.teamId as string) || ''}
                          onChange={(e) => handleChange('teamId', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                          required
                          disabled={!formData.contractorId}
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
                  )}

                  {formData.assigneeType === 'internal' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">班</label>
                        <select
                          value={(formData.teamId as string) || ''}
                          onChange={(e) => handleChange('teamId', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
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
                  )}
                </div>
              </div>

              {/* スケジュール情報 */}
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-3">スケジュール情報</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="調査予定日（オプション）"
                    type="date"
                    value={(formData.scheduledDate as string) || ''}
                    onChange={(e) => handleChange('scheduledDate', e.target.value)}
                    className="bg-white text-gray-900"
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      工事後報告
                    </label>
                    <select
                      value={
                        formData.postConstructionReport === true
                          ? 'required'
                          : formData.postConstructionReport === false
                          ? 'notRequired'
                          : ''
                      }
                      onChange={(e) => {
                        const value = e.target.value === 'required'
                          ? true
                          : e.target.value === 'notRequired'
                          ? false
                          : undefined
                        handleChange('postConstructionReport', value)
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                    >
                      <option value="">未設定</option>
                      <option value="required">必要</option>
                      <option value="notRequired">不要</option>
                    </select>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">※ 調査予定日は後から入力・変更できます</p>
              </div>

              {/* 申請情報 */}
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-3">申請情報</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      申請要否 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.withdrawNeeded ? 'required' : 'notRequired'}
                      onChange={(e) => handleChange('withdrawNeeded', e.target.value === 'required')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                      required
                    >
                      <option value="required">申請要</option>
                      <option value="notRequired">申請不要</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 管理者指示事項 */}
              <RequestNotesComponent
                userRole="admin"
                notes={requestNotes}
                onChange={(value) => setRequestNotes({ adminNotes: value })}
                isEditing={true}
              />

              {/* ファイル添付 */}
              <FileAttachmentsComponent
                userRole="admin"
                attachments={attachments}
                onFileUpload={handleFileUpload}
                onFileDelete={handleFileDelete}
                onFileDownload={handleFileDownload}
                uploadingFiles={uploadingFiles}
              />
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                作成
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
