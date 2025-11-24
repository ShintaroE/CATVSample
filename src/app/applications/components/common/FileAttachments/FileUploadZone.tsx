'use client'

import React, { useRef, useState } from 'react'
import { Button } from '@/shared/components/ui'
import { CloudArrowUpIcon } from '@heroicons/react/24/outline'

interface FileUploadZoneProps {
  onUpload: (files: File[]) => Promise<void>
  maxFiles?: number
  maxFileSize?: number // MB
  acceptedFileTypes?: string[]
  loading?: boolean
}

export default function FileUploadZone({
  onUpload,
  maxFiles = 10,
  maxFileSize = 10,
  acceptedFileTypes = ['image/*', 'application/pdf', '.xlsx', '.xls', '.doc', '.docx'],
  loading = false
}: FileUploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const isProcessing = loading || isUploading

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    // ファイルサイズチェック
    const maxBytes = maxFileSize * 1024 * 1024
    const invalidFiles = Array.from(files).filter(file => file.size > maxBytes)

    if (invalidFiles.length > 0) {
      alert(`ファイルサイズは${maxFileSize}MB以下にしてください。\n大きすぎるファイル: ${invalidFiles.map(f => f.name).join(', ')}`)
      return
    }

    // ファイル数チェック
    if (files.length > maxFiles) {
      alert(`一度にアップロードできるファイルは${maxFiles}個までです。`)
      return
    }

    setIsUploading(true)
    try {
      await onUpload(Array.from(files))
      // 入力をクリア
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('File upload error:', error)
      alert('ファイルのアップロードに失敗しました。')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  return (
    <div className="mt-4">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedFileTypes.join(',')}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-colors
          ${isDragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
          }
          ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
        `}
        onClick={() => fileInputRef.current?.click()}
      >
        <CloudArrowUpIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
        <p className="text-sm text-gray-600 mb-2">
          {isProcessing ? 'アップロード中...' : 'ファイルをドラッグ＆ドロップ'}
        </p>
        <Button
          variant="secondary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            fileInputRef.current?.click()
          }}
          disabled={isProcessing}
        >
          またはファイルを選択
        </Button>
        <p className="text-xs text-gray-500 mt-2">
          {acceptedFileTypes.includes('image/*') && '画像、'}
          PDF、Excel、Word対応 (最大{maxFileSize}MB、{maxFiles}ファイルまで)
        </p>
      </div>
    </div>
  )
}
