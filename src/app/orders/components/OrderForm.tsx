'use client'

import React, { useState, useEffect } from 'react'
import { OrderData, ConstructionCategory, IndividualWorkType, CollectiveWorkType, getWorkTypeOptions, individualWorkTypeOptions, collectiveWorkTypeOptions, OrderStatus } from '../types'
import { Button } from '@/shared/components/ui'
import { isKatakanaOnly, getKatakanaValidationMessage } from '@/shared/utils/validators'

interface OrderFormProps {
    initialData?: Partial<OrderData>
    onSubmit: (data: OrderData) => void
    onCancel: () => void
    isEditing?: boolean
}

export default function OrderForm({ initialData, onSubmit, onCancel, isEditing = false }: OrderFormProps) {
    const defaultData: Partial<OrderData> = {
        orderSource: 'KCT本社',
        constructionCategory: '個別',
        workType: '個別',
        customerType: '新規',
        orderNumber: '',
        customerCode: '',
        customerName: '',
        customerNameKana: '',
        address: '',
        phoneNumber: '',
        collectiveCode: '',
        collectiveHousingName: '',
        collectiveHousingNameKana: '',
        orderStatus: 'アクティブ',
    }

    const [formData, setFormData] = useState<Partial<OrderData>>({ ...defaultData, ...initialData })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [showOptionalFields, setShowOptionalFields] = useState(true)

    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({ ...prev, ...initialData }))
        }
    }, [initialData])

    const handleCategoryChange = (category: ConstructionCategory) => {
        setFormData(prev => ({
            ...prev,
            constructionCategory: category,
            workType: category === '個別'
                ? individualWorkTypeOptions[0]
                : collectiveWorkTypeOptions[0],
            // 個別に変更時は集合住宅情報をクリア
            ...(category === '個別' && {
                collectiveCode: '',
                collectiveHousingName: '',
            })
        }))

        // 個別に切り替えた時、集合住宅関連のエラーをクリア
        if (category === '個別') {
            setErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors.collectiveCode
                delete newErrors.collectiveHousingName
                return newErrors
            })
        }
    }

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {}

        // 受注番号: 必須
        if (!formData.orderNumber || formData.orderNumber.trim() === '') {
            newErrors.orderNumber = '受注番号を入力してください'
        }

        // 顧客コード: 9桁の数字
        if (!formData.customerCode || !/^\d{9}$/.test(formData.customerCode)) {
            newErrors.customerCode = '9桁の数字を入力してください'
        }

        // 顧客名: 必須
        if (!formData.customerName || formData.customerName.trim() === '') {
            newErrors.customerName = '顧客名を入力してください'
        }

        // 顧客名カナ: 必須 + カタカナのみ
        if (!formData.customerNameKana || formData.customerNameKana.trim() === '') {
            newErrors.customerNameKana = '顧客名（カナ）を入力してください'
        } else if (!isKatakanaOnly(formData.customerNameKana)) {
            newErrors.customerNameKana = getKatakanaValidationMessage('顧客名（カナ）')
        }

        // 住所: 必須
        if (!formData.address || formData.address.trim() === '') {
            newErrors.address = '住所を入力してください'
        }

        // 電話番号: 必須 + 10-11桁の数字
        if (!formData.phoneNumber || !/^\d{10,11}$/.test(formData.phoneNumber)) {
            newErrors.phoneNumber = '10-11桁の数字を入力してください'
        }

        // 集合住宅の場合: 集合住宅コードと集合住宅名が必須
        if (formData.constructionCategory === '集合') {
            if (!formData.collectiveCode || formData.collectiveCode.trim() === '') {
                newErrors.collectiveCode = '集合住宅コードを入力してください'
            }
            if (!formData.collectiveHousingName || formData.collectiveHousingName.trim() === '') {
                newErrors.collectiveHousingName = '集合住宅名を入力してください'
            }
            // 集合住宅名カナ: 必須 + カタカナのみ
            if (!formData.collectiveHousingNameKana || formData.collectiveHousingNameKana.trim() === '') {
                newErrors.collectiveHousingNameKana = '集合住宅名（カナ）を入力してください'
            } else if (!isKatakanaOnly(formData.collectiveHousingNameKana)) {
                newErrors.collectiveHousingNameKana = getKatakanaValidationMessage('集合住宅名（カナ）')
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        // 必須フィールドの型アサーション
        // 新規作成時はデフォルト値で補完、編集時は既存データを維持
        const submittedData: OrderData = {
            ...defaultData,
            ...formData,
            orderNumber: formData.orderNumber!,
            orderSource: formData.orderSource!,
            constructionCategory: formData.constructionCategory!,
            workType: formData.workType!,
            customerCode: formData.customerCode!,
            customerType: formData.customerType!,
            customerName: formData.customerName!,
            address: formData.address!,
            phoneNumber: formData.phoneNumber!,
            // 以下のフィールドは新規作成時に必要だが、フォームにはないためデフォルト値を設定
            constructionDate: formData.constructionDate,
            closureNumber: formData.closureNumber,
            surveyStatus: formData.surveyStatus || '未依頼',
            permissionStatus: formData.permissionStatus || '未依頼',
            constructionStatus: formData.constructionStatus || '未着手',
            appointmentHistory: formData.appointmentHistory || [],
            orderStatus: formData.orderStatus || 'アクティブ',
            cancelledAt: formData.orderStatus === 'キャンセル' ? (formData.cancelledAt || new Date().toISOString()) : undefined,
            cancellationReason: formData.orderStatus === 'キャンセル' ? formData.cancellationReason : undefined,
        } as OrderData

        onSubmit(submittedData)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* セクション1: 基本情報 */}
            <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">基本情報</h4>

                {/* 受注番号 */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        受注番号 {isEditing ? '' : <span className="text-red-500">*</span>}
                    </label>
                    <input
                        type="text"
                        value={formData.orderNumber}
                        onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                        placeholder="例: 2025110800004"
                        className={`w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 ${isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                        required
                        disabled={isEditing}
                    />
                    {isEditing && <p className="text-xs text-gray-500 mt-1">※ 受注番号は編集できません</p>}
                    {errors.orderNumber && (
                        <p className="text-xs text-red-500 mt-1">{errors.orderNumber}</p>
                    )}
                </div>

                {/* 受注先（必須） */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        受注先 <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={formData.orderSource}
                        onChange={(e) => setFormData({ ...formData, orderSource: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900"
                        required
                    >
                        <option value="KCT本社">KCT本社</option>
                        <option value="KCT水島">KCT水島</option>
                        <option value="KCT玉島">KCT玉島</option>
                    </select>
                </div>

                {/* クロージャ番号 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        クロージャ番号
                    </label>
                    <input
                        type="text"
                        value={formData.closureNumber || ''}
                        onChange={(e) => setFormData({ ...formData, closureNumber: e.target.value })}
                        placeholder="例: CL-123"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900"
                    />
                </div>
            </div>

            {/* セクション2: 工事区分 */}
            <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">工事区分</h4>

                {/* 個別/集合（必須・ラジオボタン） */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        個別/集合 <span className="text-red-500">*</span>
                    </label>
                    <div className="flex space-x-6">
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                value="個別"
                                checked={formData.constructionCategory === '個別'}
                                onChange={(e) => handleCategoryChange(e.target.value as ConstructionCategory)}
                                className="mr-2"
                                required
                            />
                            <span className="text-sm text-gray-900">個別</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                value="集合"
                                checked={formData.constructionCategory === '集合'}
                                onChange={(e) => handleCategoryChange(e.target.value as ConstructionCategory)}
                                className="mr-2"
                            />
                            <span className="text-sm text-gray-900">集合</span>
                        </label>
                    </div>
                </div>

                {/* 工事種別（必須・動的変更） */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        工事種別 <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={formData.workType}
                        onChange={(e) => setFormData({ ...formData, workType: e.target.value as IndividualWorkType | CollectiveWorkType })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900"
                        required
                    >
                        {getWorkTypeOptions(formData.constructionCategory!).map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>

                {/* 集合住宅情報（集合の場合のみ表示） */}
                {formData.constructionCategory === '集合' && (
                    <div className="mt-4 p-3 bg-white rounded-md border border-gray-300">
                        <h5 className="text-sm font-medium text-gray-700 mb-3">
                            集合住宅情報 <span className="text-red-500">*</span>
                        </h5>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    集合住宅コード <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.collectiveCode || ''}
                                    onChange={(e) => setFormData({ ...formData, collectiveCode: e.target.value })}
                                    placeholder="例: AP-001"
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900"
                                    required
                                />
                                {errors.collectiveCode && (
                                    <p className="text-xs text-red-500 mt-1">{errors.collectiveCode}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    集合住宅名 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.collectiveHousingName || ''}
                                    onChange={(e) => setFormData({ ...formData, collectiveHousingName: e.target.value })}
                                    placeholder="例: サンライズマンション"
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900"
                                    required
                                />
                                {errors.collectiveHousingName && (
                                    <p className="text-xs text-red-500 mt-1">{errors.collectiveHousingName}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    集合住宅名（カナ） <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.collectiveHousingNameKana || ''}
                                    onChange={(e) => setFormData({ ...formData, collectiveHousingNameKana: e.target.value })}
                                    placeholder="例: サンライズマンション"
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900"
                                    required
                                />
                                {errors.collectiveHousingNameKana && (
                                    <p className="text-xs text-red-500 mt-1">{errors.collectiveHousingNameKana}</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* セクション3: 顧客情報 */}
            <div className="p-4 bg-green-50 rounded-md border border-green-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">顧客情報</h4>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    {/* 顧客コード（必須） */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            顧客コード <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.customerCode}
                            onChange={(e) => setFormData({ ...formData, customerCode: e.target.value })}
                            placeholder="9桁の数字"
                            pattern="\d{9}"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900"
                            required
                        />
                        {errors.customerCode && (
                            <p className="text-xs text-red-500 mt-1">{errors.customerCode}</p>
                        )}
                    </div>

                    {/* 顧客名（必須） */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            顧客名 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.customerName}
                            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                            placeholder="例: 田中太郎"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900"
                            required
                        />
                        {errors.customerName && (
                            <p className="text-xs text-red-500 mt-1">{errors.customerName}</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    {/* 顧客名カナ（必須） */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            顧客名（カナ） <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.customerNameKana}
                            onChange={(e) => setFormData({ ...formData, customerNameKana: e.target.value })}
                            placeholder="例: タナカタロウ"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900"
                            required
                        />
                        {errors.customerNameKana && (
                            <p className="text-xs text-red-500 mt-1">{errors.customerNameKana}</p>
                        )}
                    </div>
                </div>

                {/* 新規/既存（必須・ラジオボタン） */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        新規/既存 <span className="text-red-500">*</span>
                    </label>
                    <div className="flex space-x-6">
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                value="新規"
                                checked={formData.customerType === '新規'}
                                onChange={(e) => setFormData({ ...formData, customerType: e.target.value as '新規' | '既存' })}
                                className="mr-2"
                                required
                            />
                            <span className="text-sm text-gray-900">新規</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                value="既存"
                                checked={formData.customerType === '既存'}
                                onChange={(e) => setFormData({ ...formData, customerType: e.target.value as '新規' | '既存' })}
                                className="mr-2"
                            />
                            <span className="text-sm text-gray-900">既存</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* セクション4: 受注ステータス（編集モード時のみ表示） */}
            {isEditing && (
                <div className="p-4 bg-yellow-50 rounded-md border border-yellow-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-4">受注ステータス</h4>

                    {/* ステータス選択（ラジオボタン） */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            ステータス <span className="text-red-500">*</span>
                        </label>
                        <div className="flex space-x-6">
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    value="アクティブ"
                                    checked={formData.orderStatus === 'アクティブ'}
                                    onChange={(e) => setFormData({ ...formData, orderStatus: e.target.value as OrderStatus })}
                                    className="mr-2"
                                    required
                                />
                                <span className="text-sm text-gray-900">アクティブ</span>
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    value="キャンセル"
                                    checked={formData.orderStatus === 'キャンセル'}
                                    onChange={(e) => setFormData({ ...formData, orderStatus: e.target.value as OrderStatus })}
                                    className="mr-2"
                                />
                                <span className="text-sm text-gray-900">キャンセル</span>
                            </label>
                        </div>
                    </div>

                    {/* キャンセル理由（キャンセル選択時のみ表示） */}
                    {formData.orderStatus === 'キャンセル' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                キャンセル理由（任意）
                            </label>
                            <textarea
                                value={formData.cancellationReason || ''}
                                onChange={(e) => setFormData({ ...formData, cancellationReason: e.target.value })}
                                placeholder="キャンセル理由を入力してください"
                                rows={3}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900"
                            />
                        </div>
                    )}
                </div>
            )}

            {/* セクション5: 連絡先情報（折りたたみ） */}
            <div>
                <button
                    type="button"
                    onClick={() => setShowOptionalFields(!showOptionalFields)}
                    className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                    {showOptionalFields ? '▼' : '▶'} 連絡先情報
                </button>

                {showOptionalFields && (
                    <div className="mt-3 p-4 bg-gray-50 rounded-md border border-gray-200">
                        <div className="grid grid-cols-2 gap-4">

                            {/* 住所 */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    住所 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.address || ''}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="例: 岡山県倉敷市..."
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900"
                                    required
                                />
                                {errors.address && (
                                    <p className="text-xs text-red-500 mt-1">{errors.address}</p>
                                )}
                            </div>

                            {/* 電話番号 */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    電話番号 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phoneNumber || ''}
                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    placeholder="例: 08612345678"
                                    pattern="\d{10,11}"
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900"
                                    required
                                />
                                {errors.phoneNumber && (
                                    <p className="text-xs text-red-500 mt-1">{errors.phoneNumber}</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* フッター */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="secondary" onClick={onCancel} type="button">
                    キャンセル
                </Button>
                <Button variant="primary" type="submit">
                    {isEditing ? '保存' : '作成'}
                </Button>
            </div>
        </form>
    )
}
