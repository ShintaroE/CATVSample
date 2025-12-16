-- ============================================================
-- テーブル名: attached_files（添付ファイル）
-- 説明: 申請依頼に関連する双方向ファイル添付（管理者⇄協力会社、Base64形式、10MB制限）
-- 注意: 将来的にはS3/Cloudinaryに移行予定
-- ============================================================

CREATE TABLE attached_files (
  -- 主キー
  id VARCHAR(50) PRIMARY KEY,

  -- 外部キー
  application_request_id VARCHAR(50) NOT NULL,

  -- ファイル情報
  file_name VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL, -- バイト単位
  file_type VARCHAR(100) NOT NULL, -- MIMEタイプ
  file_data TEXT NOT NULL, -- Base64エンコードされたファイルデータ

  -- アップロード情報
  uploaded_by VARCHAR(50) NOT NULL, -- admin.id or contractor.id
  uploaded_by_name VARCHAR(100) NOT NULL,
  uploaded_by_role VARCHAR(20) NOT NULL, -- 'admin' or 'contractor'
  uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  description TEXT,

  -- 外部キー制約
  CONSTRAINT fk_attached_files_application_request FOREIGN KEY (application_request_id)
    REFERENCES application_requests(id) ON DELETE CASCADE,

  -- 制約
  CONSTRAINT chk_attached_files_id_not_empty CHECK (id <> ''),
  CONSTRAINT chk_attached_files_file_size_positive CHECK (file_size > 0),
  CONSTRAINT chk_attached_files_file_size_limit CHECK (file_size <= 10485760), -- 10MB制限
  CONSTRAINT chk_attached_files_uploaded_by_role CHECK (uploaded_by_role IN ('admin', 'contractor'))
);

-- インデックス
CREATE INDEX idx_attached_files_application_request_id ON attached_files(application_request_id);
CREATE INDEX idx_attached_files_uploaded_by ON attached_files(uploaded_by);
CREATE INDEX idx_attached_files_uploaded_by_role ON attached_files(uploaded_by_role);
CREATE INDEX idx_attached_files_uploaded_at ON attached_files(uploaded_at);

-- コメント
COMMENT ON TABLE attached_files IS '添付ファイル: 申請依頼に関連する双方向ファイル添付（管理者⇄協力会社）';
COMMENT ON COLUMN attached_files.id IS 'ファイルID (UUID)';
COMMENT ON COLUMN attached_files.application_request_id IS '申請ID';
COMMENT ON COLUMN attached_files.file_name IS 'ファイル名';
COMMENT ON COLUMN attached_files.file_size IS 'ファイルサイズ (バイト単位、最大10MB)';
COMMENT ON COLUMN attached_files.file_type IS 'MIMEタイプ (例: application/pdf, image/jpeg)';
COMMENT ON COLUMN attached_files.file_data IS 'Base64エンコードされたファイルデータ (将来的にS3/CloudinaryのURLに変更予定)';
COMMENT ON COLUMN attached_files.uploaded_by IS 'アップロード者ID (admin.id or contractor.id)';
COMMENT ON COLUMN attached_files.uploaded_by_name IS 'アップロード者名';
COMMENT ON COLUMN attached_files.uploaded_by_role IS 'アップロード者のロール (admin/contractor)';
COMMENT ON COLUMN attached_files.uploaded_at IS 'アップロード日時';
COMMENT ON COLUMN attached_files.description IS 'ファイルの説明（任意）';
