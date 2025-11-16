'use client'

import React, { useRef } from 'react'
import { DocumentArrowUpIcon } from '@heroicons/react/24/outline'
import { OrderData } from '../../types'

interface ExcelUploadZoneProps {
  currentOrderCount: number
  onUpload: (orders: OrderData[]) => void
}

export default function ExcelUploadZone({ currentOrderCount, onUpload }: ExcelUploadZoneProps) {
  const [isDragOver, setIsDragOver] = React.useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const processFiles = (files: FileList, currentOrderCount: number) => {
    const excelFiles = Array.from(files).filter(file =>
      file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
    )

    if (excelFiles.length > 0) {
      // サンプルとして新しい工事依頼を追加
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      const sequence = String(currentOrderCount + 1).padStart(5, '0')

      const newOrder: OrderData = {
        orderNumber: `${year}${month}${day}${sequence}`,
        orderSource: 'KCT本社',
        constructionCategory: '個別',
        workType: '個別',
        customerCode: `${Math.floor(Math.random() * 900000000) + 100000000}`,
        customerType: '新規',
        customerName: '新規顧客',
        constructionDate: new Date().toISOString().split('T')[0],
        closureNumber: `CL-${String(currentOrderCount + 1).padStart(3, '0')}-A`,
        address: '倉敷市新規住所',
        surveyStatus: '未依頼',
        permissionStatus: '未依頼',
        constructionStatus: 'pending'
      }

      onUpload([newOrder])

      // 成功メッセージ（実際はトーストなど）
      alert(`${excelFiles[0].name} を読み込みました。\n受注番号: ${newOrder.orderNumber}`)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    processFiles(e.dataTransfer.files, currentOrderCount)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files, currentOrderCount)
    }
  }

  const handleClickUpload = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="mb-8">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          isDragOver
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClickUpload}
      >
        <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          工事依頼のEXCELファイルをドラッグ&ドロップ
        </p>
        <p className="text-xs text-gray-500 mt-1">
          または<span className="text-blue-600 font-medium">クリックしてファイルを選択</span>
        </p>
        <p className="text-xs text-gray-500">
          (.xlsx, .xls形式に対応)
        </p>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileInputChange}
        className="hidden"
        multiple
      />
    </div>
  )
}

