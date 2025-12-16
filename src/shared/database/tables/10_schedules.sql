-- ============================================================
-- テーブル名: schedules（工事スケジュール）
-- 説明: 工事日程調整画面で管理するスケジュール情報
-- ============================================================

CREATE TABLE schedules (
  -- 主キー
  id VARCHAR(50) PRIMARY KEY,

  -- スケジュール種別
  schedule_type VARCHAR(20) NOT NULL, -- 'construction' or 'survey'

  -- 外部キー
  order_number VARCHAR(50) NOT NULL,

  -- 物件情報
  property_type VARCHAR(20), -- '個別' or '集合'
  customer_code VARCHAR(50),
  customer_name VARCHAR(200) NOT NULL,
  collective_code VARCHAR(50),
  collective_housing_name VARCHAR(200),
  address TEXT NOT NULL,
  phone_number VARCHAR(20),

  -- 協力会社・班情報
  contractor VARCHAR(100) NOT NULL, -- '直営班', '栄光電気', 'スライヴ'
  contractor_id VARCHAR(50) NOT NULL,
  team_id VARCHAR(50),
  team_name VARCHAR(100),

  -- スケジュール情報
  assigned_date DATE NOT NULL, -- 工事日 or 調査日
  time_slot VARCHAR(20) NOT NULL, -- "09:00-12:00" 形式
  memo TEXT,

  -- 管理情報
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- 外部キー制約
  CONSTRAINT fk_schedules_order FOREIGN KEY (order_number)
    REFERENCES orders(order_number) ON DELETE CASCADE,
  CONSTRAINT fk_schedules_contractor FOREIGN KEY (contractor_id)
    REFERENCES contractors(id) ON DELETE CASCADE,
  CONSTRAINT fk_schedules_team FOREIGN KEY (team_id)
    REFERENCES teams(id) ON DELETE SET NULL,

  -- 制約
  CONSTRAINT chk_schedules_id_not_empty CHECK (id <> ''),
  CONSTRAINT chk_schedules_schedule_type CHECK (schedule_type IN ('construction', 'survey')),
  CONSTRAINT chk_schedules_property_type CHECK (property_type IN ('個別', '集合'))
);

-- インデックス
CREATE INDEX idx_schedules_order_number ON schedules(order_number);
CREATE INDEX idx_schedules_contractor_id ON schedules(contractor_id);
CREATE INDEX idx_schedules_team_id ON schedules(team_id);
CREATE INDEX idx_schedules_assigned_date ON schedules(assigned_date);
CREATE INDEX idx_schedules_schedule_type ON schedules(schedule_type);
CREATE INDEX idx_schedules_updated_at ON schedules(updated_at);

-- 複合インデックス（日付×協力会社で検索する場合）
CREATE INDEX idx_schedules_date_contractor ON schedules(assigned_date, contractor_id);

-- コメント
COMMENT ON TABLE schedules IS '工事スケジュール: 工事日程調整画面で管理するスケジュール情報';
COMMENT ON COLUMN schedules.id IS 'スケジュールID (UUID)';
COMMENT ON COLUMN schedules.schedule_type IS 'スケジュール種別 (construction/survey)';
COMMENT ON COLUMN schedules.order_number IS '受注番号';
COMMENT ON COLUMN schedules.property_type IS '物件種別 (個別/集合)';
COMMENT ON COLUMN schedules.customer_code IS '顧客コード';
COMMENT ON COLUMN schedules.customer_name IS '顧客名';
COMMENT ON COLUMN schedules.collective_code IS '集合住宅コード';
COMMENT ON COLUMN schedules.collective_housing_name IS '集合住宅名';
COMMENT ON COLUMN schedules.address IS '住所';
COMMENT ON COLUMN schedules.phone_number IS '電話番号';
COMMENT ON COLUMN schedules.contractor IS '協力会社名';
COMMENT ON COLUMN schedules.contractor_id IS '協力会社ID';
COMMENT ON COLUMN schedules.team_id IS '班ID';
COMMENT ON COLUMN schedules.team_name IS '班名';
COMMENT ON COLUMN schedules.assigned_date IS '割当日 (工事日 or 調査日)';
COMMENT ON COLUMN schedules.time_slot IS '時間帯 (09:00-12:00 形式)';
COMMENT ON COLUMN schedules.memo IS 'メモ';
COMMENT ON COLUMN schedules.created_at IS '作成日時';
COMMENT ON COLUMN schedules.updated_at IS '更新日時';
