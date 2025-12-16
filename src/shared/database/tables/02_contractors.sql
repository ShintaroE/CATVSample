-- ============================================================
-- テーブル名: contractors（協力会社マスタ）
-- 説明: 協力会社（直営班・栄光電気通信・スライヴ）のアカウント情報
-- ============================================================

CREATE TABLE contractors (
  -- 主キー
  id VARCHAR(50) PRIMARY KEY,

  -- 基本情報
  name VARCHAR(100) NOT NULL,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,

  -- 管理情報
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- 制約
  CONSTRAINT chk_contractors_id_not_empty CHECK (id <> ''),
  CONSTRAINT chk_contractors_username_not_empty CHECK (username <> '')
);

-- インデックス
CREATE UNIQUE INDEX idx_contractors_username ON contractors(username);
CREATE INDEX idx_contractors_is_active ON contractors(is_active);

-- コメント
COMMENT ON TABLE contractors IS '協力会社マスタ: 協力会社アカウント情報（直営班・栄光電気通信・スライヴ）';
COMMENT ON COLUMN contractors.id IS '協力会社ID (UUID)';
COMMENT ON COLUMN contractors.name IS '協力会社名';
COMMENT ON COLUMN contractors.username IS 'ログインユーザー名';
COMMENT ON COLUMN contractors.password IS 'パスワード（将来的にハッシュ化必須）';
COMMENT ON COLUMN contractors.created_at IS '作成日時';
COMMENT ON COLUMN contractors.is_active IS '有効フラグ (true=有効, false=無効)';
