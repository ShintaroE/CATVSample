-- ============================================================
-- テーブル名: order_files（工事依頼ファイル）
-- 説明: 工事依頼に紐づく地図PDFなどのファイル（Base64形式、2MB制限）
-- 注意: 将来的にはS3/Cloudinaryに移行予定
-- ============================================================

CREATE TABLE order_files (
  -- 主キー
  id VARCHAR(50) PRIMARY KEY,

  -- 外部キー
  order_number VARCHAR(50) NOT NULL,

  -- ファイル情報
  file_name VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL, -- バイト単位
  file_type VARCHAR(100) NOT NULL, -- MIMEタイプ
  file_data TEXT NOT NULL, -- Base64エンコードされたファイルデータ

  -- 管理情報
  uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  uploaded_by VARCHAR(50), -- FK → admins.id

  -- 外部キー制約
  CONSTRAINT fk_order_files_order FOREIGN KEY (order_number)
    REFERENCES orders(order_number) ON DELETE CASCADE,
  CONSTRAINT fk_order_files_uploaded_by FOREIGN KEY (uploaded_by)
    REFERENCES admins(id) ON DELETE SET NULL,

  -- 制約
  CONSTRAINT chk_order_files_id_not_empty CHECK (id <> ''),
  CONSTRAINT chk_order_files_file_size_positive CHECK (file_size > 0),
  CONSTRAINT chk_order_files_file_size_limit CHECK (file_size <= 2097152) -- 2MB制限
);

-- インデックス
CREATE INDEX idx_order_files_order_number ON order_files(order_number);
CREATE INDEX idx_order_files_uploaded_by ON order_files(uploaded_by);
CREATE INDEX idx_order_files_uploaded_at ON order_files(uploaded_at);

-- コメント
COMMENT ON TABLE order_files IS '工事依頼ファイル: 地図PDFなどの添付ファイル';
COMMENT ON COLUMN order_files.id IS 'ファイルID (UUID)';
COMMENT ON COLUMN order_files.order_number IS '受注番号';
COMMENT ON COLUMN order_files.file_name IS 'ファイル名 (例: map_20240315.pdf)';
COMMENT ON COLUMN order_files.file_size IS 'ファイルサイズ (バイト単位、最大2MB)';
COMMENT ON COLUMN order_files.file_type IS 'MIMEタイプ (例: application/pdf)';
COMMENT ON COLUMN order_files.file_data IS 'Base64エンコードされたファイルデータ (将来的にS3/CloudinaryのURLに変更予定)';
COMMENT ON COLUMN order_files.uploaded_at IS 'アップロード日時';
COMMENT ON COLUMN order_files.uploaded_by IS 'アップロードユーザーID';
