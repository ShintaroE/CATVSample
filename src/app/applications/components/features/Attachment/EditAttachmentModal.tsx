import React, { useMemo, useState } from 'react'
import { Dialog } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { AttachmentRequest, AttachedFile } from '@/features/applications/types'
import { Contractor, Team } from '@/features/contractor/types'
import { getTeamsByContractorId } from '@/features/contractor/lib/contractorStorage'
import { downloadFile } from '@/features/applications/lib/applicationStorage'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { Input } from '@/shared/components/ui'
import FileAttachmentsComponent from '../../common/FileAttachments'
import RequestNotesComponent from '../../common/RequestNotes'

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
    withdrawNeeded: item.withdrawNeeded ?? false,
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
                <div className="grid grid-cols-1 gap-4">
                  <Input
                    label="調査予定日（オプション）"
                    type="date"
                    value={formData.scheduledDate || ''}
                    onChange={(e) => handleChange('scheduledDate', e.target.value)}
                    className="bg-white text-gray-900"
                  />
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
                      <option value="依頼済み">依頼済み</option>
                      <option value="調査済み">調査済み</option>
                      <option value="申請中">申請中</option>
                      <option value="申請許可">申請許可</option>
                      <option value="申請不許可">申請不許可</option>
                      <option value="キャンセル">キャンセル</option>
                    </select>
                  </div>
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
                  <Input
                    label="調査完了日"
                    type="date"
                    value={formData.surveyCompletedAt || ''}
                    onChange={(e) => handleChange('surveyCompletedAt', e.target.value)}
                    className="bg-white text-gray-900"
                  />
                  <Input
                    label="申請提出日"
                    type="date"
                    value={formData.submittedAt || ''}
                    onChange={(e) => handleChange('submittedAt', e.target.value)}
                    className="bg-white text-gray-900"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                  <Input
                    label="申請許可日"
                    type="date"
                    value={formData.approvedAt || ''}
                    onChange={(e) => handleChange('approvedAt', e.target.value)}
                    className="bg-white text-gray-900"
                  />
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
