-- ============================================================
-- テーブル名: assigned_teams（スケジュール割当班）
-- 説明: 1つのスケジュールに複数の班を割り当てる中間テーブル
-- ============================================================

CREATE TABLE assigned_teams (
  -- 主キー
  id VARCHAR(50) PRIMARY KEY,

  -- 外部キー
  schedule_id VARCHAR(50) NOT NULL,
  contractor_id VARCHAR(50) NOT NULL,
  team_id VARCHAR(50) NOT NULL,

  -- 協力会社・班情報（非正規化）
  contractor_name VARCHAR(100) NOT NULL,
  team_name VARCHAR(100) NOT NULL,

  -- 外部キー制約
  CONSTRAINT fk_assigned_teams_schedule FOREIGN KEY (schedule_id)
    REFERENCES schedules(id) ON DELETE CASCADE,
  CONSTRAINT fk_assigned_teams_contractor FOREIGN KEY (contractor_id)
    REFERENCES contractors(id) ON DELETE CASCADE,
  CONSTRAINT fk_assigned_teams_team FOREIGN KEY (team_id)
    REFERENCES teams(id) ON DELETE CASCADE,

  -- 制約
  CONSTRAINT chk_assigned_teams_id_not_empty CHECK (id <> '')
);

-- インデックス
CREATE INDEX idx_assigned_teams_schedule_id ON assigned_teams(schedule_id);
CREATE INDEX idx_assigned_teams_contractor_id ON assigned_teams(contractor_id);
CREATE INDEX idx_assigned_teams_team_id ON assigned_teams(team_id);

-- 複合ユニークインデックス（同じスケジュールに同じ班を複数回割り当てできない）
CREATE UNIQUE INDEX idx_assigned_teams_schedule_team ON assigned_teams(schedule_id, team_id);

-- コメント
COMMENT ON TABLE assigned_teams IS 'スケジュール割当班: 1つのスケジュールに複数の班を割り当てる中間テーブル';
COMMENT ON COLUMN assigned_teams.id IS '割当ID (UUID)';
COMMENT ON COLUMN assigned_teams.schedule_id IS 'スケジュールID';
COMMENT ON COLUMN assigned_teams.contractor_id IS '協力会社ID';
COMMENT ON COLUMN assigned_teams.team_id IS '班ID';
COMMENT ON COLUMN assigned_teams.contractor_name IS '協力会社名（非正規化）';
COMMENT ON COLUMN assigned_teams.team_name IS '班名（非正規化）';
