-- ============================================================
-- テーブル名: teams（班マスタ）
-- 説明: 協力会社配下の班情報（A班、B班、1班、第1班など）
-- ============================================================

CREATE TABLE teams (
  -- 主キー
  id VARCHAR(50) PRIMARY KEY,

  -- 外部キー
  contractor_id VARCHAR(50) NOT NULL,

  -- 基本情報
  team_name VARCHAR(100) NOT NULL,
  members TEXT, -- JSON配列: ["山田太郎", "佐藤花子"]

  -- 管理情報
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- 外部キー制約
  CONSTRAINT fk_teams_contractor FOREIGN KEY (contractor_id)
    REFERENCES contractors(id) ON DELETE CASCADE,

  -- 制約
  CONSTRAINT chk_teams_id_not_empty CHECK (id <> ''),
  CONSTRAINT chk_teams_team_name_not_empty CHECK (team_name <> '')
);

-- インデックス
CREATE INDEX idx_teams_contractor_id ON teams(contractor_id);
CREATE INDEX idx_teams_is_active ON teams(is_active);

-- コメント
COMMENT ON TABLE teams IS '班マスタ: 協力会社配下の班情報';
COMMENT ON COLUMN teams.id IS '班ID (UUID)';
COMMENT ON COLUMN teams.contractor_id IS '協力会社ID';
COMMENT ON COLUMN teams.team_name IS '班名 (A班、B班、1班、第1班など)';
COMMENT ON COLUMN teams.members IS '班員リスト (JSON配列形式)';
COMMENT ON COLUMN teams.created_at IS '作成日時';
COMMENT ON COLUMN teams.is_active IS '有効フラグ (true=有効, false=無効)';
