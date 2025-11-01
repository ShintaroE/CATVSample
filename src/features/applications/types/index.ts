// 依頼種別
export type RequestType = 'survey' | 'attachment' | 'construction'

// 依頼先種別
export type AssigneeType = 'internal' | 'contractor' // 自社 or 協力会社

// 各タブのステータス定義
export type SurveyStatus = '未着手' | '調査中' | '完了' | 'キャンセル'
export type AttachmentStatus = '受付' | '調査済み' | '完了'
export type ConstructionStatus = '未着手' | '施工中' | '完了' | '一部完了' | '中止' | '延期' | '保留'

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
  contractNo?: string // 契約No.
  customerCode?: string // 顧客コード
  customerName?: string // 顧客名
  address?: string // 住所
  phoneNumber?: string // 電話番号

  // 依頼先情報
  assigneeType: AssigneeType // 自社 or 協力会社
  contractorId?: string // 協力会社ID（協力会社の場合）
  contractorName?: string // 協力会社名
  teamId?: string // 班ID
  teamName?: string // 班名

  // 共通日付
  requestedAt?: string // 依頼日 (YYYY-MM-DD)
  scheduledDate?: string // 予定日
  completedAt?: string // 完了日

  notes?: string // 備考
  createdAt: string // 作成日時
  updatedAt: string // 更新日時

  // 進捗管理
  progressHistory?: ProgressEntry[] // 進捗履歴
  lastUpdatedBy?: string // 最終更新者
  lastUpdatedByName?: string // 最終更新者名

  // ファイル添付・備考機能（新規追加）
  attachments?: FileAttachments // ファイル添付管理
  requestNotes?: RequestNotes // 依頼時の備考
}

// 調査結果
export interface SurveyResult {
  photos?: string[] // 写真
  closureNumber?: string // クロージャ番号
  lineType?: string // 現状線種別
  notes?: string // 所見
}

// 現地調査中間報告
export interface SurveyIntermediateReport {
  reportedAt: string // 報告日時
  progressRate: number // 進捗率 (0-100)
  findings?: string // 現地での気づき
  issues?: string // 問題点
  photos?: string[] // 現地写真
}

// 現地調査依頼
export interface SurveyRequest extends RequestBase {
  type: 'survey'
  status: SurveyStatus
  surveyItems?: string[] // 調査項目
  surveyResult?: SurveyResult // 調査結果
  intermediateReport?: SurveyIntermediateReport // 中間報告
  feasibilityResult?: SurveyFeasibilityResult // 工事可否判定結果
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
  submittedAt?: string // 提出日
  approvedAt?: string // 許可日
  withdrawNeeded?: boolean // 取下げ必要
  withdrawCreated?: boolean // 取下げ作成済
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
export interface ConstructionRequest extends RequestBase {
  type: 'construction'
  status: ConstructionStatus
  constructionType?: string // 工事種別
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
