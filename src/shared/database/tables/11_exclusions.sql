-- ============================================================
-- テーブル名: exclusions（除外日）
-- 説明: 協力会社・班ごとの作業不可日（終日、午前、午後、カスタム時間帯）
-- ============================================================

CREATE TABLE exclusions (
  -- 主キー
  id VARCHAR(50) PRIMARY KEY,

  -- 外部キー
  contractor_id VARCHAR(50) NOT NULL,
  team_id VARCHAR(50) NOT NULL,

  -- 除外日情報
  date DATE NOT NULL,
  reason TEXT NOT NULL,

  -- 協力会社・班情報（非正規化）
  contractor VARCHAR(100) NOT NULL,
  team_name VARCHAR(100) NOT NULL,

  -- 時間区分
  time_type VARCHAR(20) NOT NULL, -- 'all_day', 'am', 'pm', 'custom'
  start_time TIME, -- time_type='custom'の場合
  end_time TIME, -- time_type='custom'の場合

  -- 管理情報
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- 外部キー制約
  CONSTRAINT fk_exclusions_contractor FOREIGN KEY (contractor_id)
    REFERENCES contractors(id) ON DELETE CASCADE,
  CONSTRAINT fk_exclusions_team FOREIGN KEY (team_id)
    REFERENCES teams(id) ON DELETE CASCADE,

  -- 制約
  CONSTRAINT chk_exclusions_id_not_empty CHECK (id <> ''),
  CONSTRAINT chk_exclusions_time_type CHECK (time_type IN ('all_day', 'am', 'pm', 'custom')),
  CONSTRAINT chk_exclusions_custom_time CHECK (
    (time_type = 'custom' AND start_time IS NOT NULL AND end_time IS NOT NULL) OR
    (time_type <> 'custom')
  )
);

-- インデックス
CREATE INDEX idx_exclusions_contractor_id ON exclusions(contractor_id);
CREATE INDEX idx_exclusions_team_id ON exclusions(team_id);
CREATE INDEX idx_exclusions_date ON exclusions(date);
CREATE INDEX idx_exclusions_time_type ON exclusions(time_type);

-- 複合インデックス（日付×班で検索する場合）
CREATE INDEX idx_exclusions_date_team ON exclusions(date, team_id);

-- コメント
COMMENT ON TABLE exclusions IS '除外日: 協力会社・班ごとの作業不可日';
COMMENT ON COLUMN exclusions.id IS '除外日ID (UUID)';
COMMENT ON COLUMN exclusions.contractor_id IS '協力会社ID';
COMMENT ON COLUMN exclusions.team_id IS '班ID';
COMMENT ON COLUMN exclusions.date IS '除外日';
COMMENT ON COLUMN exclusions.reason IS '理由';
COMMENT ON COLUMN exclusions.contractor IS '協力会社名（非正規化）';
COMMENT ON COLUMN exclusions.team_name IS '班名（非正規化）';
COMMENT ON COLUMN exclusions.time_type IS '時間区分 (all_day=9:00-18:00, am=9:00-12:00, pm=12:00-18:00, custom=カスタム)';
COMMENT ON COLUMN exclusions.start_time IS '開始時刻 (time_type=customの場合)';
COMMENT ON COLUMN exclusions.end_time IS '終了時刻 (time_type=customの場合)';
COMMENT ON COLUMN exclusions.created_at IS '作成日時';
