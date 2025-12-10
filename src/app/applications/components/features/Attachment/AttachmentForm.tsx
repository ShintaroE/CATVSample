'use client'

import React, { useState, useEffect } from 'react'
import {
    AttachmentRequest,
    AttachedFile,
    AttachmentStatus
} from '@/features/applications/types'
import { Contractor } from '@/features/contractor/types'
// getTeamsByContractorId は共架・添架では不要
import { useAuth } from '@/features/auth/hooks/useAuth'
import { Input, Button } from '@/shared/components/ui'
import FileAttachmentsComponent from '../../common/FileAttachments'
import RequestNotesComponent from '../../common/RequestNotes'
import ProgressHistory from '../../common/ProgressHistory'
import OrderSearchModal from '@/shared/components/order/OrderSearchModal'
import { OrderData } from '@/app/orders/types'

interface AttachmentFormProps {
    initialData?: Partial<AttachmentRequest>
    contractors: Contractor[]
    onSubmit: (data: Partial<AttachmentRequest>) => void
    onCancel: () => void
    isEditing?: boolean
}

export default function AttachmentForm({
    initialData,
    contractors,
    onSubmit,
    onCancel,
    isEditing = false
}: AttachmentFormProps) {
    const { user } = useAuth()

    const defaultData: Partial<AttachmentRequest> = {
        assigneeType: 'internal',
        contractorId: '',
        teamId: '',
        status: '依頼済み',
        withdrawNeeded: false,
        attachments: { fromAdmin: [], fromContractor: [] },
        requestNotes: { adminNotes: '' }
    }

    const [formData, setFormData] = useState<Partial<AttachmentRequest>>({ ...defaultData, ...initialData })
    const [uploadingFiles, setUploadingFiles] = useState(false)
    const [showOrderSearchModal, setShowOrderSearchModal] = useState(false)

    // Update formData when initialData changes
    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({ ...prev, ...initialData }))
        }
    }, [initialData])

    const handleChange = (field: string, value: string | boolean) => {
        setFormData((prev) => {
            const newData = { ...prev, [field]: value }

            // ステータスが完了に変更された場合、完了日を自動設定
            if (field === 'status' && value === '完了' && !newData.completedAt) {
                newData.completedAt = new Date().toISOString().split('T')[0]
            }

            if (field === 'assigneeType') {
                newData.contractorId = ''
                newData.contractorName = ''
                // teamId/teamName は空文字列のまま保持
            }

            if (field === 'contractorId') {
                const contractor = contractors.find((c) => c.id === value)
                newData.contractorName = contractor?.name || ''
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

            const currentAttachments = formData.attachments || { fromAdmin: [], fromContractor: [] }
            setFormData(prev => ({
                ...prev,
                attachments: {
                    fromAdmin: [...currentAttachments.fromAdmin, ...newFiles],
                    fromContractor: currentAttachments.fromContractor,
                },
            }))
        } catch (error) {
            console.error('File upload failed:', error)
            alert('ファイルのアップロードに失敗しました')
        } finally {
            setUploadingFiles(false)
        }
    }

    const handleFileDelete = (fileId: string) => {
        const currentAttachments = formData.attachments || { fromAdmin: [], fromContractor: [] }
        setFormData(prev => ({
            ...prev,
            attachments: {
                fromAdmin: currentAttachments.fromAdmin.filter((f) => f.id !== fileId),
                fromContractor: currentAttachments.fromContractor,
            },
        }))
    }

    const handleFileDownload = (file: AttachedFile) => {
        const link = document.createElement('a')
        link.href = file.fileData
        link.download = file.fileName
        link.click()
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

        // クロージャ番号があれば管理者指示事項に追加
        if (order.closureNumber) {
            const currentNotes = formData.requestNotes?.adminNotes || ''
            const newNotes = currentNotes
                ? `${currentNotes}\nクロージャ番号: ${order.closureNumber}`
                : `クロージャ番号: ${order.closureNumber}`
            setFormData(prev => ({
                ...prev,
                requestNotes: { adminNotes: newNotes }
            }))
        }

        setShowOrderSearchModal(false)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // バリデーション
        if (!formData.orderNumber) {
            alert('受注番号を入力してください')
            return
        }

        // 共架・添架依頼では班の選択は不要

        onSubmit(formData)
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="px-6 py-4 space-y-6">
                {/* 基本情報 */}
                <div>
                    <h3 className="text-md font-medium text-gray-900 mb-3">基本情報</h3>
                    <div className="grid grid-cols-1 gap-4">
                        <Input
                            label="受注番号"
                            value={formData.orderNumber || ''}
                            onChange={(e) => handleChange('orderNumber', e.target.value)}
                            required
                            disabled={isEditing}
                            className={isEditing ? "bg-gray-100 text-gray-500" : "bg-white text-gray-900"}
                            placeholder="例: 2024031500001"
                            endAdornment={!isEditing ? (
                                <Button
                                    variant="secondary"
                                    onClick={() => setShowOrderSearchModal(true)}
                                    type="button"
                                >
                                    🔍 検索
                                </Button>
                            ) : undefined}
                        />
                        {isEditing && <p className="text-xs text-gray-500 mt-1">※ 受注番号は編集できません</p>}
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
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    協力会社 <span className="text-red-500">*</span>
                                </label>
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
                                <p className="text-xs text-gray-500 mt-2">※ 共架・添架依頼では班の指定は不要です。</p>
                            </div>
                        )}

                        {formData.assigneeType === 'internal' && (
                            <div className="text-sm text-gray-600 py-2">
                                ※ 自社（直営班）に依頼します。班の指定は不要です。
                            </div>
                        )}
                    </div>
                </div>

                {/* スケジュール情報（編集時のみ） */}
                {isEditing && (
                    <div>
                        <h3 className="text-md font-medium text-gray-900 mb-3">スケジュール情報</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                            <Input
                                label="申請許可日"
                                type="date"
                                value={formData.approvedAt || ''}
                                onChange={(e) => handleChange('approvedAt', e.target.value)}
                                className="bg-white text-gray-900"
                            />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">状態</label>
                                <select
                                    value={formData.status || '依頼済み'}
                                    onChange={(e) => handleChange('status', e.target.value as AttachmentStatus)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                                >
                                    <option value="依頼済み">依頼済み</option>
                                    <option value="調査済み">調査済み</option>
                                    <option value="申請中">申請中</option>
                                    <option value="申請許可">申請許可</option>
                                    <option value="申請不許可">申請不許可</option>
                                    <option value="キャンセル">キャンセル</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* 申請要否（編集時のみ） */}
                {isEditing && (
                    <div>
                        <h3 className="text-md font-medium text-gray-900 mb-3">申請要否</h3>
                        <div className="flex gap-4">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    checked={formData.withdrawNeeded === false}
                                    onChange={() => handleChange('withdrawNeeded', false)}
                                    className="mr-2"
                                />
                                <span className="text-sm text-gray-700">不要</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    checked={formData.withdrawNeeded === true}
                                    onChange={() => handleChange('withdrawNeeded', true)}
                                    className="mr-2"
                                />
                                <span className="text-sm text-gray-700">必要</span>
                            </label>
                        </div>
                    </div>
                )}

                {/* 管理者指示事項 */}
                <RequestNotesComponent
                    userRole="admin"
                    notes={formData.requestNotes || { adminNotes: '' }}
                    onChange={(value) => setFormData(prev => ({ ...prev, requestNotes: { ...prev.requestNotes, adminNotes: value } }))}
                    isEditing={true}
                />

                {/* ファイル添付 */}
                <FileAttachmentsComponent
                    userRole="admin"
                    attachments={formData.attachments || { fromAdmin: [], fromContractor: [] }}
                    onFileUpload={handleFileUpload}
                    onFileDelete={handleFileDelete}
                    onFileDownload={handleFileDownload}
                    uploadingFiles={uploadingFiles}
                />

                {/* 進捗履歴 (編集時のみ) */}
                {isEditing && formData.progressHistory && formData.progressHistory.length > 0 && (
                    <ProgressHistory history={formData.progressHistory} />
                )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                    キャンセル
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    {isEditing ? '保存' : '作成'}
                </button>
            </div>

            {/* 受注情報検索モーダル */}
            <OrderSearchModal
                isOpen={showOrderSearchModal}
                onClose={() => setShowOrderSearchModal(false)}
                onSelect={handleOrderSelect}
            />
        </form>
    )
}
