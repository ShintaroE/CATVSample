-- ============================================================
-- テーブル名: application_requests（申請依頼マスタ）
-- 説明: 現地調査依頼、共架・添架依頼、工事依頼の3種類を統合したテーブル
-- ============================================================

CREATE TABLE application_requests (
  -- 主キー
  id VARCHAR(50) PRIMARY KEY,

  -- 申請種別
  type VARCHAR(20) NOT NULL, -- 'survey', 'attachment', 'construction'
  serial_number INTEGER NOT NULL, -- type別に自動採番

  -- 外部キー
  order_number VARCHAR(50),

  -- 物件情報
  property_type VARCHAR(20), -- '個別' or '集合'
  customer_code VARCHAR(50),
  customer_name VARCHAR(200),
  customer_name_kana VARCHAR(200),
  collective_code VARCHAR(50),
  collective_housing_name VARCHAR(200),
  collective_housing_name_kana VARCHAR(200),
  address TEXT,
  phone_number VARCHAR(20),

  -- 依頼先情報
  assignee_type VARCHAR(20) NOT NULL, -- 'internal' or 'contractor'
  contractor_id VARCHAR(50),
  contractor_name VARCHAR(100),
  team_id VARCHAR(50),
  team_name VARCHAR(100),

  -- 日付情報
  kct_received_date DATE,
  requested_at DATE,
  scheduled_date DATE, -- 調査予定日/工事予定日
  completed_at DATE, -- 調査完了日/工事完了日

  -- ステータス
  status VARCHAR(30) NOT NULL,

  -- 共通情報
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_updated_by VARCHAR(50),
  last_updated_by_name VARCHAR(100),
  request_notes JSONB, -- adminNotes, contractorNotes

  -- Survey専用フィールド
  feasibility_result JSONB, -- 工事可否判定結果

  -- Attachment専用フィールド
  submitted_at DATE, -- 申請提出日
  approved_at DATE, -- 許可日
  survey_completed_at DATE, -- 調査完了日
  withdraw_needed BOOLEAN, -- 申請要否
  survey_status_by_contractor VARCHAR(20), -- 'not_surveyed' or 'surveyed'
  detail JSONB, -- lineType, mountHeight, photos
  preparation_status JSONB, -- 申請準備状況
  application_report JSONB, -- 申請有無報告

  -- Construction専用フィールド
  construction_type VARCHAR(100),
  construction_requested_date DATE,
  construction_date DATE,
  construction_completed_date DATE,
  construction_date_set_by VARCHAR(50),
  construction_date_set_by_name VARCHAR(100),
  construction_date_set_at TIMESTAMP,
  construction_result JSONB,
  work_progress JSONB,
  post_construction_application_report JSONB,

  -- 外部キー制約
  CONSTRAINT fk_application_requests_order FOREIGN KEY (order_number)
    REFERENCES orders(order_number) ON DELETE SET NULL,
  CONSTRAINT fk_application_requests_contractor FOREIGN KEY (contractor_id)
    REFERENCES contractors(id) ON DELETE SET NULL,
  CONSTRAINT fk_application_requests_team FOREIGN KEY (team_id)
    REFERENCES teams(id) ON DELETE SET NULL,

  -- 制約
  CONSTRAINT chk_application_requests_type CHECK (type IN ('survey', 'attachment', 'construction')),
  CONSTRAINT chk_application_requests_assignee_type CHECK (assignee_type IN ('internal', 'contractor')),
  CONSTRAINT chk_application_requests_property_type CHECK (property_type IN ('個別', '集合')),
  CONSTRAINT chk_application_requests_serial_number_positive CHECK (serial_number > 0)
);

-- インデックス
CREATE INDEX idx_application_requests_type ON application_requests(type);
CREATE INDEX idx_application_requests_serial_number ON application_requests(serial_number);
CREATE INDEX idx_application_requests_order_number ON application_requests(order_number);
CREATE INDEX idx_application_requests_contractor_id ON application_requests(contractor_id);
CREATE INDEX idx_application_requests_team_id ON application_requests(team_id);
CREATE INDEX idx_application_requests_status ON application_requests(status);
CREATE INDEX idx_application_requests_scheduled_date ON application_requests(scheduled_date);
CREATE INDEX idx_application_requests_construction_date ON application_requests(construction_date);

-- 複合ユニークインデックス
CREATE UNIQUE INDEX idx_application_requests_type_serial ON application_requests(type, serial_number);

-- GINインデックス（JSON検索用）
CREATE INDEX idx_application_requests_request_notes_gin ON application_requests USING GIN (request_notes);
CREATE INDEX idx_application_requests_feasibility_result_gin ON application_requests USING GIN (feasibility_result);
CREATE INDEX idx_application_requests_application_report_gin ON application_requests USING GIN (application_report);
CREATE INDEX idx_application_requests_construction_result_gin ON application_requests USING GIN (construction_result);

-- コメント
COMMENT ON TABLE application_requests IS '申請依頼マスタ: 現地調査・共架添架・工事依頼の統合テーブル';
COMMENT ON COLUMN application_requests.id IS '申請ID (UUID)';
COMMENT ON COLUMN application_requests.type IS '申請種別 (survey/attachment/construction)';
COMMENT ON COLUMN application_requests.serial_number IS '整理番号 (type別に自動採番)';
COMMENT ON COLUMN application_requests.order_number IS '受注番号';
COMMENT ON COLUMN application_requests.property_type IS '物件種別 (個別/集合)';
COMMENT ON COLUMN application_requests.customer_code IS '顧客コード';
COMMENT ON COLUMN application_requests.customer_name IS '顧客名';
COMMENT ON COLUMN application_requests.customer_name_kana IS '顧客名カナ (必須、ひらがな検索対応)';
COMMENT ON COLUMN application_requests.collective_code IS '集合住宅コード';
COMMENT ON COLUMN application_requests.collective_housing_name IS '集合住宅名';
COMMENT ON COLUMN application_requests.collective_housing_name_kana IS '集合住宅名カナ';
COMMENT ON COLUMN application_requests.address IS '住所';
COMMENT ON COLUMN application_requests.phone_number IS '電話番号';
COMMENT ON COLUMN application_requests.assignee_type IS '依頼先種別 (internal/contractor)';
COMMENT ON COLUMN application_requests.contractor_id IS '協力会社ID';
COMMENT ON COLUMN application_requests.contractor_name IS '協力会社名';
COMMENT ON COLUMN application_requests.team_id IS '班ID (surveyとconstructionは必須)';
COMMENT ON COLUMN application_requests.team_name IS '班名';
COMMENT ON COLUMN application_requests.kct_received_date IS 'KCT受取日';
COMMENT ON COLUMN application_requests.requested_at IS '依頼日';
COMMENT ON COLUMN application_requests.scheduled_date IS '予定日 (調査予定日/工事予定日)';
COMMENT ON COLUMN application_requests.completed_at IS '完了日 (調査完了日/工事完了日)';
COMMENT ON COLUMN application_requests.status IS 'ステータス (type別に異なる値)';
COMMENT ON COLUMN application_requests.notes IS '備考';
COMMENT ON COLUMN application_requests.request_notes IS '依頼備考 (JSON: adminNotes, contractorNotes)';
COMMENT ON COLUMN application_requests.feasibility_result IS '工事可否判定結果 (Survey専用)';
COMMENT ON COLUMN application_requests.submitted_at IS '申請提出日 (Attachment専用)';
COMMENT ON COLUMN application_requests.approved_at IS '許可日 (Attachment専用)';
COMMENT ON COLUMN application_requests.survey_completed_at IS '調査完了日 (Attachment専用)';
COMMENT ON COLUMN application_requests.withdraw_needed IS '申請要否 (Attachment専用)';
COMMENT ON COLUMN application_requests.survey_status_by_contractor IS '協力会社による調査状況 (Attachment専用)';
COMMENT ON COLUMN application_requests.construction_type IS '工事種別 (Construction専用)';
COMMENT ON COLUMN application_requests.construction_requested_date IS '工事依頼日 (Construction専用)';
COMMENT ON COLUMN application_requests.construction_date IS '工事予定日 (Construction専用)';
COMMENT ON COLUMN application_requests.construction_completed_date IS '工事完了日 (Construction専用)';
COMMENT ON COLUMN application_requests.construction_result IS '工事結果 (Construction専用)';
