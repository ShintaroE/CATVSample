import { OrderFile, FILE_SIZE_LIMITS } from '../types'
import { STORAGE_KEYS } from '@/shared/utils/constants'

const STORAGE_KEY = STORAGE_KEYS.ORDER_FILES

/**
 * ファイルサイズバリデーション結果
 */
export interface FileSizeValidation {
  valid: boolean
  error?: string
  warning?: string
}

/**
 * 工事依頼ファイルのlocalStorage操作
 */
export const orderFileStorage = {
  /**
   * すべてのファイルを取得
   */
  getAll(): OrderFile[] {
    if (typeof window === 'undefined') return []
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Failed to load order files:', error)
      return []
    }
  },

  /**
   * ファイルを保存
   */
  saveAll(files: OrderFile[]): void {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(files))
    } catch (error) {
      console.error('Failed to save order files:', error)
      throw new Error('ファイルの保存に失敗しました。容量不足の可能性があります。')
    }
  },

  /**
   * ファイルを追加
   */
  add(file: OrderFile): void {
    const files = this.getAll()
    files.push(file)
    this.saveAll(files)
  },

  /**
   * ファイルを削除
   */
  delete(fileId: string): void {
    const files = this.getAll().filter(f => f.id !== fileId)
    this.saveAll(files)
  },

  /**
   * IDでファイルを取得
   */
  getById(fileId: string): OrderFile | undefined {
    return this.getAll().find(f => f.id === fileId)
  },

  /**
   * 注文番号でファイルを取得
   */
  getByOrderNumber(orderNumber: string): OrderFile[] {
    return this.getAll().filter(f => f.orderNumber === orderNumber)
  },

  /**
   * 注文番号に紐づくすべてのファイルを削除
   */
  deleteByOrderNumber(orderNumber: string): void {
    const files = this.getAll().filter(f => f.orderNumber !== orderNumber)
    this.saveAll(files)
  },

  /**
   * ファイルサイズのバリデーション
   */
  validateFileSize(file: File): FileSizeValidation {
    if (file.size > FILE_SIZE_LIMITS.MAX_SIZE) {
      return {
        valid: false,
        error: `ファイルサイズが大きすぎます（最大${FILE_SIZE_LIMITS.MAX_SIZE / 1024 / 1024}MB）`,
      }
    }

    if (file.size > FILE_SIZE_LIMITS.WARNING_SIZE) {
      return {
        valid: true,
        warning: 'ファイルサイズが大きいため、保存できない可能性があります',
      }
    }

    return { valid: true }
  },

  /**
   * ファイルをBase64に変換してアップロード
   */
  async uploadFile(
    orderNumber: string,
    file: File,
    uploadedBy?: string
  ): Promise<string> {
    // サイズバリデーション
    const validation = this.validateFileSize(file)
    if (!validation.valid) {
      throw new Error(validation.error)
    }

    // Base64変換
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = () => {
        try {
          const fileId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          const orderFile: OrderFile = {
            id: fileId,
            orderNumber,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            fileData: reader.result as string,
            uploadedAt: new Date().toISOString(),
            uploadedBy,
          }

          this.add(orderFile)
          resolve(fileId)
        } catch (error) {
          reject(new Error('ファイルの保存に失敗しました'))
        }
      }

      reader.onerror = () => {
        reject(new Error('ファイルの読み込みに失敗しました'))
      }

      reader.readAsDataURL(file)
    })
  },

  /**
   * ファイルをダウンロード
   */
  downloadFile(fileId: string): void {
    const file = this.getById(fileId)
    if (!file) {
      console.error('File not found:', fileId)
      return
    }

    // data URLからBlob作成
    const link = document.createElement('a')
    link.href = file.fileData
    link.download = file.fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  },

  /**
   * データをクリア（開発用）
   */
  clear(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEY)
  }
}
