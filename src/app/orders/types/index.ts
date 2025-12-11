import { ConstructionStatus } from '@/features/applications/types'
import { AssignedTeam } from '@/features/calendar/types'

/**
 * 注文に紐づくファイル情報
 */
export interface OrderFile {
  id: string                    // ファイルID（UUID）
  orderNumber: string           // 注文番号（外部キー）
  fileName: string              // ファイル名
  fileSize: number              // ファイルサイズ（bytes）
  fileType: string              // MIMEタイプ（例: "application/pdf"）
  fileData: string              // Base64エンコードされたファイルデータ
  uploadedAt: string            // アップロード日時（ISO 8601）
  uploadedBy?: string           // アップロードユーザーID
}

/**
 * ファイルサイズ制限
 */
export const FILE_SIZE_LIMITS = {
  MAX_SIZE: 2 * 1024 * 1024,           // 2MB
  WARNING_SIZE: 1.5 * 1024 * 1024,     // 1.5MB（警告表示）
} as const

export interface AppointmentHistory {
  id: string
  date: string
  endTime?: string
  status: '工事決定' | '調査日決定' | '保留' | '不通' | '留守電'
  content: string
  // 工事決定・調査日決定時の追加情報
  scheduleInfo?: {
    assignedTeams: AssignedTeam[]  // 複数班対応
    workStartTime: string  // 工事/調査開始時刻 (HH:MM)
    workEndTime: string    // 工事/調査終了時刻 (HH:MM)
  }
}

export type ConstructionCategory = '個別' | '集合'

export type IndividualWorkType = '個別' | 'マンションタイプ光工事' | 'Gドット' | '防犯カメラ'
export type CollectiveWorkType = 'HCNA一括導入工事' | 'G.fast導入工事' | '放送導入工事'

export type OrderStatus = 'アクティブ' | 'キャンセル'

export interface AdditionalCosts {
  // クロージャ増設
  closureExpansion: {
    required: 'required' | 'not_required'
    scheduledDate?: string
  }

  // 道路申請
  roadApplication: {
    required: 'required' | 'not_required'
    applicationDate?: string
    responseDate?: string
    completionReport: 'incomplete' | 'completed'
  }

  // 他社改修
  otherCompanyRepair: {
    required: 'required' | 'not_required'
    applicationDate?: string
    responseDate?: string
  }

  // NWスパハンなど
  nwEquipment: {
    required: 'required' | 'not_required'
    quotationCreatedDate?: string
    quotationSubmittedDate?: string
  }

  // 引込用申請
  serviceLineApplication: {
    required: 'required' | 'not_required'
    billingDate?: string
  }
}

export interface AdditionalNotes {
  surveyRequestNotes?: string        // 現調依頼備考
  attachmentRequestNotes?: string    // 共架・添架依頼備考
  constructionRequestNotes?: string  // 工事依頼備考
}

export interface CollectiveConstructionInfo {
  floors?: number                    // 階数
  units?: number                     // 世帯数
  advanceMaterialPrinting: 'required' | 'not_required'  // 先行資料印刷要否
  boosterType?: string               // ブースター型
  distributorReplacement?: string    // 分配器交換
  dropAdvance?: string               // ドロップ先行
}

export type OrderSurveyStatus = '不要' | '未依頼' | '依頼済み' | '調査日決定' | '完了' | 'キャンセル'
export type OrderPermissionStatus = '不要' | '未依頼' | '依頼済み' | '調査済み' | '依頼完了' | '申請中' | '申請許可' | '申請不許可' | 'キャンセル'

export interface OrderData {
  orderNumber: string
  orderSource: string
  constructionCategory: ConstructionCategory
  workType: IndividualWorkType | CollectiveWorkType
  collectiveCode?: string           // 集合住宅コード（集合の場合）
  collectiveHousingName?: string    // 集合住宅名（集合の場合）
  customerCode: string
  customerType: '新規' | '既存'
  customerName: string
  constructionDate?: string
  closureNumber?: string
  address?: string
  phoneNumber?: string
  surveyStatus?: OrderSurveyStatus
  permissionStatus?: OrderPermissionStatus
  constructionStatus?: ConstructionStatus
  mapPdfId?: string
  appointmentHistory?: AppointmentHistory[]
  additionalCosts?: AdditionalCosts
  additionalNotes?: AdditionalNotes
  collectiveConstructionInfo?: CollectiveConstructionInfo
  // 受注ステータス
  orderStatus?: OrderStatus
  cancelledAt?: string              // キャンセル日時（ISO 8601）
  cancellationReason?: string       // キャンセル理由
}

export const individualWorkTypeOptions: IndividualWorkType[] = [
  '個別',
  'マンションタイプ光工事',
  'Gドット',
  '防犯カメラ'
]

export const collectiveWorkTypeOptions: CollectiveWorkType[] = [
  'HCNA一括導入工事',
  'G.fast導入工事',
  '放送導入工事'
]

export function getWorkTypeOptions(category: ConstructionCategory) {
  return category === '個別'
    ? individualWorkTypeOptions
    : collectiveWorkTypeOptions
}
