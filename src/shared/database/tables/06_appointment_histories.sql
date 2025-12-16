-- ============================================================
-- テーブル名: appointment_histories（アポイント履歴）
-- 説明: 顧客との電話対応履歴（工事決定、調査日決定、保留、不通、留守電）
-- ============================================================

CREATE TABLE appointment_histories (
  -- 主キー
  id VARCHAR(50) PRIMARY KEY,

  -- 外部キー
  order_number VARCHAR(50) NOT NULL,

  -- 対応情報
  date DATE NOT NULL,
  end_time TIME,
  status VARCHAR(20) NOT NULL, -- '工事決定', '調査日決定', '保留', '不通', '留守電'
  content TEXT NOT NULL,

  -- スケジュール情報（JSON）
  schedule_info JSONB, -- status='工事決定' or '調査日決定'の場合

  -- 管理情報
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- 外部キー制約
  CONSTRAINT fk_appointment_histories_order FOREIGN KEY (order_number)
    REFERENCES orders(order_number) ON DELETE CASCADE,

  -- 制約
  CONSTRAINT chk_appointment_histories_id_not_empty CHECK (id <> ''),
  CONSTRAINT chk_appointment_histories_status CHECK (status IN ('工事決定', '調査日決定', '保留', '不通', '留守電'))
);

-- インデックス
CREATE INDEX idx_appointment_histories_order_number ON appointment_histories(order_number);
CREATE INDEX idx_appointment_histories_date ON appointment_histories(date);
CREATE INDEX idx_appointment_histories_status ON appointment_histories(status);
CREATE INDEX idx_appointment_histories_created_at ON appointment_histories(created_at);

-- GINインデックス（JSON検索用）
CREATE INDEX idx_appointment_histories_schedule_info_gin ON appointment_histories USING GIN (schedule_info);

-- コメント
COMMENT ON TABLE appointment_histories IS 'アポイント履歴: 顧客との電話対応履歴';
COMMENT ON COLUMN appointment_histories.id IS '履歴ID (UUID)';
COMMENT ON COLUMN appointment_histories.order_number IS '受注番号';
COMMENT ON COLUMN appointment_histories.date IS '対応日';
COMMENT ON COLUMN appointment_histories.end_time IS '終了時刻 (工事決定・調査日決定の場合)';
COMMENT ON COLUMN appointment_histories.status IS '対応ステータス';
COMMENT ON COLUMN appointment_histories.content IS '対応内容';
COMMENT ON COLUMN appointment_histories.schedule_info IS 'スケジュール情報 (JSON: assignedTeams, workStartTime, workEndTime)';
COMMENT ON COLUMN appointment_histories.created_at IS '作成日時';
