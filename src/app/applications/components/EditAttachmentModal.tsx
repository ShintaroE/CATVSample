import React, { useMemo, useState } from 'react'
import { Dialog } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { AttachmentRequest, AttachedFile } from '@/features/applications/types'
import { Contractor, Team } from '@/features/contractor/types'
import { getTeamsByContractorId } from '@/features/contractor/lib/contractorStorage'
import { downloadFile } from '@/features/applications/lib/applicationStorage'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { Input } from '@/shared/components/ui'
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
              {/* 基本情報 */}
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-3">基本情報</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="受注番号"
                    value={formData.orderNumber || ''}
                    onChange={(e) => handleChange('orderNumber', e.target.value)}
                    required
                    className="bg-white text-gray-900"
                  />
                  <Input
                    label="KCT受取日"
                    type="date"
                    value={formData.kctReceivedDate || ''}
                    onChange={(e) => handleChange('kctReceivedDate', e.target.value)}
                    className="bg-white text-gray-900"
                  />
                  <Input
                    label="依頼日"
                    type="date"
                    value={formData.requestedAt || ''}
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
                      value={formData.customerCode || ''}
                      onChange={(e) => handleChange('customerCode', e.target.value)}
                      className="bg-white text-gray-900"
                    />
                    <Input
                      label="顧客名"
                      value={formData.customerName || ''}
                      onChange={(e) => handleChange('customerName', e.target.value)}
                      className="bg-white text-gray-900"
                    />
                    <Input
                      label="住所"
                      value={formData.address || ''}
                      onChange={(e) => handleChange('address', e.target.value)}
                      className="bg-white text-gray-900 md:col-span-2"
                    />
                    <Input
                      label="電話番号"
                      value={formData.phoneNumber || ''}
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
                      value={formData.collectiveCode || ''}
                      onChange={(e) => handleChange('collectiveCode', e.target.value)}
                      className="bg-white text-gray-900"
                    />
                    <Input
                      label="集合住宅名"
                      value={formData.collectiveHousingName || ''}
                      onChange={(e) => handleChange('collectiveHousingName', e.target.value)}
                      className="bg-white text-gray-900"
                    />
                    <Input
                      label="部屋番号・顧客名"
                      value={formData.address || ''}
                      onChange={(e) => handleChange('address', e.target.value)}
                      placeholder="例: 101号室 山田太郎"
                      className="bg-white text-gray-900 md:col-span-2"
                    />
                    <Input
                      label="電話番号"
                      value={formData.phoneNumber || ''}
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
                          value={formData.contractorId || ''}
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
                          value={formData.teamId || ''}
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
                          value={formData.teamId || ''}
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
                    value={formData.scheduledDate || ''}
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      状態 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.status || ''}
                      onChange={(e) => handleChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                      required
                    >
                      <option value="受付">受付</option>
                      <option value="提出済">提出済</option>
                      <option value="許可">許可</option>
                      <option value="取下げ">取下げ</option>
                    </select>
                  </div>
                  <Input
                    label="申請提出日"
                    type="date"
                    value={formData.submittedAt || ''}
                    onChange={(e) => handleChange('submittedAt', e.target.value)}
                    className="bg-white text-gray-900"
                  />
                  <Input
                    label="申請許可日"
                    type="date"
                    value={formData.approvedAt || ''}
                    onChange={(e) => handleChange('approvedAt', e.target.value)}
                    className="bg-white text-gray-900"
                  />
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

              {/* その他設定 */}
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-3">その他設定</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={!!formData.withdrawCreated}
                      onChange={(e) => handleChange('withdrawCreated', e.target.checked)}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">取下げ作成</span>
                  </label>
                </div>
              </div>

              {/* 管理者指示事項 */}
              <RequestNotesComponent
                userRole={user?.role || 'admin'}
                notes={formData.requestNotes}
                onChange={handleNotesChange}
                isEditing={user?.role === 'admin'}
              />

              {/* ファイル添付 */}
              <FileAttachmentsComponent
                userRole={user?.role || 'admin'}
                attachments={formData.attachments || { fromAdmin: [], fromContractor: [] }}
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
                保存
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
