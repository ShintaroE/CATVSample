/**
 * アプリケーション全体で使用する定数
 */

/**
 * 営業時間
 */
export const BUSINESS_HOURS = {
  START: 9,
  END: 18,
} as const

/**
 * カレンダー表示モード
 */
export const CALENDAR_VIEW_MODES = {
  MONTH: 'month',
  WEEK: 'week',
  DAY: 'day',
} as const

/**
 * 除外日の時間帯タイプ
 */
export const EXCLUSION_TIME_TYPES = {
  ALL_DAY: 'all_day',
  AM: 'am',
  PM: 'pm',
  CUSTOM: 'custom',
} as const

/**
 * ユーザーロール
 */
export const USER_ROLES = {
  ADMIN: 'admin',
  CONTRACTOR: 'contractor',
} as const

/**
 * LocalStorageキー
 */
export const STORAGE_KEYS = {
  USER: 'user',
  ADMINS: 'admins',
  CONTRACTORS: 'contractors',
  TEAMS: 'teams',
  SCHEDULES: 'schedules',
  EXCLUSIONS: 'exclusions',
  APPLICATIONS_SURVEY: 'applications_survey',
  APPLICATIONS_ATTACHMENT: 'applications_attachment',
  APPLICATIONS_CONSTRUCTION: 'applications_construction',
  ORDERS: 'orders',
  ORDER_FILES: 'order_files',
} as const

/**
 * ステータス定義
 */
export const SCHEDULE_STATUSES = ['予定', '作業中', '完了', '延期'] as const
export const SURVEY_STATUSES = ['未着手', '調査中', '完了', 'キャンセル'] as const
export const ATTACHMENT_STATUSES = ['受付', '提出済', '許可', '取下げ'] as const
export const CONSTRUCTION_STATUSES = ['未着手', '施工中', '完了', '保留'] as const
export const APPOINTMENT_STATUSES = ['工事決定', '保留', '不通'] as const

/**
 * 協力会社カラー
 */
export const CONTRACTOR_COLORS = {
  直営班: 'blue',
  栄光電気: 'green',
  スライヴ: 'purple',
} as const

/**
 * 工事内容オプション
 */
export const WORK_CONTENT_OPTIONS = [
  '個別対応',
  'HCNAー技術人工事',
  'G・6ch追加人工事',
  '放送波人工事',
] as const
