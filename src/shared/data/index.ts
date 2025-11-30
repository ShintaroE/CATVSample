/**
 * サンプルデータ統合エクスポート
 *
 * 全ドメインのサンプルデータを一箇所で管理し、re-exportする
 */

// アカウント関連
export { sampleAdmins, sampleContractors, sampleTeams } from './accountData'

// 申請管理関連
export {
  sampleSurveyRequests,
  sampleAttachmentRequests,
  sampleConstructionRequests,
} from './applicationData'

// スケジュール・除外日関連
export { sampleExclusions } from './scheduleData'

// 工事依頼関連
export { sampleOrders } from './orderData'
