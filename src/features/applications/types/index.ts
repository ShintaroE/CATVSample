// 依頼種別
export type RequestType = 'survey' | 'attachment' | 'construction'

// 依頼先種別
export type AssigneeType = 'internal' | 'contractor' // 自社 or 協力会社

// 各タブのステータス定義
export type SurveyStatus = '依頼済み' | '調査日決定' | '完了' | 'キャンセル'
export type AttachmentStatus = '依頼済み' | '調査済み' | '依頼完了' | '申請中' | '申請許可' | '申請不許可' | 'キャンセル'
export type ConstructionStatus = '未着手' | '依頼済み' | '工事日決定' | '完了' | '工事返却' | '工事キャンセル'

// ========== 協力会社報告機能の型定義 ==========

/**
 * 工事可否判定（現地調査依頼）
 */
export type SurveyFeasibility =
  | '可能'           // 工事可能
  | '条件付き可能'   // 条件付きで可能
  | '要確認'         // 追加確認が必要
  | '不可'           // 工事不可
  | '未判定'         // まだ判定されていない（デフォルト）

/**
 * 工事可否判定結果
 */
export interface SurveyFeasibilityResult {
  reportedAt: string              // 報告日時 (ISO 8601)
  reportedBy: string              // 報告者ID（contractorId）
  reportedByName: string          // 報告者名（協力会社名）
  reportedByTeam?: string         // 報告者の班名
  feasibility: SurveyFeasibility  // 判定結果
}

/**
 * 申請有無（共架・添架依頼）
 */
export type AttachmentNeeded =
  | '必要'    // 申請が必要
  | '不要'    // 申請不要
  | '未確認'  // まだ確認されていない（デフォルト）

/**
 * 申請有無報告
 */
export interface AttachmentApplicationReport {
  reportedAt: string              // 報告日時 (ISO 8601)
  reportedBy: string              // 報告者ID（contractorId）
  reportedByName: string          // 報告者名（協力会社名）
  reportedByTeam?: string         // 報告者の班名
  applicationNeeded: AttachmentNeeded  // 申請有無
}


// 進捗履歴エントリ
export interface ProgressEntry {
  id: string
  timestamp: string // 更新日時 (ISO 8601)
  updatedBy: string // 更新者（ユーザーID or contractorId）
  updatedByName: string // 更新者名
  updatedByTeam?: string // 更新者の班名
  status: string // 更新後のステータス
  comment?: string // 進捗コメント
  photos?: string[] // 添付写真
}

// 共通の依頼情報
export interface RequestBase {
  id: string
  type: RequestType
  serialNumber: number // 整理番号
  orderNumber?: string // 受注番号

  // 物件種別関連
  propertyType?: '個別' | '集合' // 個別/集合の区別
  customerCode?: string // 顧客コード（個別の場合）
  customerName?: string // 顧客名（個別の場合）
  customerNameKana?: string // 顧客名カナ（個別の場合、必須）
  collectiveCode?: string // 集合コード（集合の場合）
  collectiveHousingName?: string // 集合住宅名（集合の場合）
  collectiveHousingNameKana?: string // 集合住宅名カナ（集合の場合）
  address?: string // 住所（個別の場合）or 部屋番号・顧客名（集合の場合）
  phoneNumber?: string // 電話番号

  // 依頼先情報
  assigneeType: AssigneeType // 自社 or 協力会社
  contractorId?: string // 協力会社ID（協力会社の場合）
  contractorName?: string // 協力会社名
  teamId?: string // 班ID
  teamName?: string // 班名

  // 共通日付
  kctReceivedDate?: string // KCT受取日 (YYYY-MM-DD)
  requestedAt?: string // 依頼日 (YYYY-MM-DD)
  scheduledDate?: string // 予定日（調査予定日/工事予定日など）
  completedAt?: string // 完了日（調査完了日/工事完了日など）

  notes?: string // 備考
  createdAt: string // 作成日時
  updatedAt: string // 更新日時

  // 進捗管理
  progressHistory?: ProgressEntry[] // 進捗履歴
  lastUpdatedBy?: string // 最終更新者
  lastUpdatedByName?: string // 最終更新者名

  // ファイル添付・備考機能
  attachments?: FileAttachments // ファイル添付管理
  requestNotes?: RequestNotes // 依頼時の備考
}

// 現地調査依頼
export interface SurveyRequest extends RequestBase {
  type: 'survey'
  status: SurveyStatus
  feasibilityResult?: SurveyFeasibilityResult // 工事可否判定結果（協力会社報告用）
}

// 申請内容詳細
export interface AttachmentDetail {
  lineType?: string // 現状線の種別
  mountHeight?: string // 取付高さ
  photos?: string[] // 写真
}

// 共架・添架申請準備状況
export interface AttachmentPreparationStatus {
  reportedAt: string // 報告日時
  documentsReady: boolean // 書類準備完了
  photosReady: boolean // 写真準備完了
  expectedSubmitDate?: string // 提出予定日
  notes?: string
}

// 共架・添架依頼
export interface AttachmentRequest extends RequestBase {
  type: 'attachment'
  status: AttachmentStatus
  submittedAt?: string // 申請提出日
  approvedAt?: string // 許可日
  surveyCompletedAt?: string // 調査完了日
  withdrawNeeded?: boolean // 申請要否 (true: 申請要, false: 申請不要)
  surveyStatusByContractor?: 'not_surveyed' | 'surveyed' // 協力会社による調査状況
  detail?: AttachmentDetail
  preparationStatus?: AttachmentPreparationStatus // 申請準備状況
  applicationReport?: AttachmentApplicationReport // 申請有無報告
}

// 工事結果
export interface ConstructionResult {
  actualDate?: string // 実施日
  workHours?: number // 作業時間
  materials?: string // 使用材料
  photos?: string[] // 写真
  notes?: string // 作業内容詳細
}

// 工事進捗状況
export interface ConstructionWorkProgress {
  reportedAt: string // 報告日時
  progressRate: number // 進捗率 (0-100)
  currentPhase?: string // 現在のフェーズ
  estimatedCompletion?: string // 完了予定日
  issues?: string // 問題点・遅延理由
  photos?: string[] // 施工写真
}

// 工事依頼
// 工事後の申請完了報告
export interface PostConstructionApplicationReport {
  required: boolean                      // 要否 (true: 必要, false: 不要)
  status?: 'completed' | 'pending'       // 完了状態 (required=trueの場合のみ使用)
  reportedAt?: string                    // 報告日時 (ISO 8601)
  reportedBy?: string                    // 報告者ID
  reportedByName?: string                // 報告者名
}

export interface ConstructionRequest extends RequestBase {
  type: 'construction'
  status: ConstructionStatus
  constructionType?: string // 工事種別
  constructionRequestedDate?: string // 工事依頼日 (YYYY-MM-DD)
  constructionCompletedDate?: string // 工事完了日 (YYYY-MM-DD)
  postConstructionApplicationReport?: PostConstructionApplicationReport // 工事後の申請完了報告
  constructionDate?: string // 工事予定日 (YYYY-MM-DD)
  constructionDateSetBy?: string // 工事日を設定した管理者のID
  constructionDateSetByName?: string // 管理者名
  constructionDateSetAt?: string // 設定日時 (ISO 8601)
  constructionResult?: ConstructionResult
  workProgress?: ConstructionWorkProgress // 施工進捗
}

export type ApplicationRequest = SurveyRequest | AttachmentRequest | ConstructionRequest

// ========== ファイル添付機能の型定義 ==========

/**
 * 添付ファイル情報
 */
export interface AttachedFile {
  id: string                    // ファイルID
  fileName: string              // ファイル名
  fileSize: number              // ファイルサイズ（バイト）
  fileType: string              // MIMEタイプ (e.g., "application/pdf", "image/jpeg")
  fileData: string              // Base64エンコードされたファイルデータ
  uploadedBy: string            // アップロード者ID
  uploadedByName: string        // アップロード者名
  uploadedByRole: 'admin' | 'contractor'  // アップロード者のロール
  uploadedAt: string            // アップロード日時 (ISO 8601)
  description?: string          // ファイルの説明（任意）
}

/**
 * ファイル添付管理
 * 依頼側（admin）と協力会社（contractor）で送受信を分離
 */
export interface FileAttachments {
  fromAdmin: AttachedFile[]     // 管理者がアップロードしたファイル
  fromContractor: AttachedFile[] // 協力会社がアップロードしたファイル
}

/**
 * 依頼時の備考情報
 */
export interface RequestNotes {
  adminNotes?: string           // 管理者からの備考（依頼時に記入）
  contractorNotes?: string      // 協力会社からの備考（任意）
}
