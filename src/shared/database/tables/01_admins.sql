-- ============================================================
-- テーブル名: admins（管理者マスタ）
-- 説明: KCT側の管理者アカウント情報を管理
-- ============================================================

CREATE TABLE admins (
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
  CONSTRAINT chk_admins_id_not_empty CHECK (id <> ''),
  CONSTRAINT chk_admins_username_not_empty CHECK (username <> '')
);

-- インデックス
CREATE UNIQUE INDEX idx_admins_username ON admins(username);
CREATE INDEX idx_admins_is_active ON admins(is_active);

-- コメント
COMMENT ON TABLE admins IS '管理者マスタ: KCT側の管理者アカウント情報';
COMMENT ON COLUMN admins.id IS '管理者ID (UUID)';
COMMENT ON COLUMN admins.name IS '管理者名';
COMMENT ON COLUMN admins.username IS 'ログインユーザー名';
COMMENT ON COLUMN admins.password IS 'パスワード（将来的にハッシュ化必須）';
COMMENT ON COLUMN admins.created_at IS '作成日時';
COMMENT ON COLUMN admins.is_active IS '有効フラグ (true=有効, false=無効)';
