-- ============================================================
-- テーブル名: progress_histories（進捗履歴）
-- 説明: 申請依頼の進捗更新履歴（append-onlyで追加のみ）
-- ============================================================

CREATE TABLE progress_histories (
  -- 主キー
  id VARCHAR(50) PRIMARY KEY,

  -- 外部キー
  application_request_id VARCHAR(50) NOT NULL,

  -- 更新情報
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by VARCHAR(50) NOT NULL, -- admin.id or contractor.id
  updated_by_name VARCHAR(100) NOT NULL,
  updated_by_team VARCHAR(100),

  -- ステータス情報
  status VARCHAR(30) NOT NULL, -- 更新後のステータス
  comment TEXT,
  photos JSONB, -- ["photo1.jpg", "photo2.jpg"]

  -- 外部キー制約
  CONSTRAINT fk_progress_histories_application_request FOREIGN KEY (application_request_id)
    REFERENCES application_requests(id) ON DELETE CASCADE,

  -- 制約
  CONSTRAINT chk_progress_histories_id_not_empty CHECK (id <> '')
);

-- インデックス
CREATE INDEX idx_progress_histories_application_request_id ON progress_histories(application_request_id);
CREATE INDEX idx_progress_histories_timestamp ON progress_histories(timestamp);
CREATE INDEX idx_progress_histories_updated_by ON progress_histories(updated_by);

-- GINインデックス（JSON検索用）
CREATE INDEX idx_progress_histories_photos_gin ON progress_histories USING GIN (photos);

-- コメント
COMMENT ON TABLE progress_histories IS '進捗履歴: 申請依頼の進捗更新履歴（append-onlyで追加のみ）';
COMMENT ON COLUMN progress_histories.id IS '履歴ID (UUID)';
COMMENT ON COLUMN progress_histories.application_request_id IS '申請ID';
COMMENT ON COLUMN progress_histories.timestamp IS '更新日時';
COMMENT ON COLUMN progress_histories.updated_by IS '更新者ID (admin.id or contractor.id)';
COMMENT ON COLUMN progress_histories.updated_by_name IS '更新者名';
COMMENT ON COLUMN progress_histories.updated_by_team IS '更新者の班名';
COMMENT ON COLUMN progress_histories.status IS '更新後のステータス';
COMMENT ON COLUMN progress_histories.comment IS '進捗コメント';
COMMENT ON COLUMN progress_histories.photos IS '添付写真 (JSON配列)';
