-- ============================================================
-- テーブル名: orders（工事依頼マスタ）
-- 説明: 小川オーダー表形式の工事依頼情報。Excelアップロードまたは手動登録。
-- ============================================================

CREATE TABLE orders (
  -- 主キー
  order_number VARCHAR(50) PRIMARY KEY,

  -- 基本情報
  order_source VARCHAR(100) NOT NULL,
  construction_category VARCHAR(20) NOT NULL, -- '個別' or '集合'
  work_type VARCHAR(100) NOT NULL,

  -- 集合住宅情報
  collective_code VARCHAR(50),
  collective_housing_name VARCHAR(200),
  collective_housing_name_kana VARCHAR(200),

  -- 顧客情報
  customer_code VARCHAR(50) NOT NULL,
  customer_type VARCHAR(20) NOT NULL, -- '新規' or '既存'
  customer_name VARCHAR(200) NOT NULL,
  customer_name_kana VARCHAR(200) NOT NULL,

  -- 工事情報
  construction_date DATE,
  closure_number VARCHAR(50), -- クロージャ番号
  address TEXT,
  phone_number VARCHAR(20),

  -- ステータス
  survey_status VARCHAR(20), -- '不要', '未依頼', '依頼済み', '調査日決定', '完了', 'キャンセル'
  permission_status VARCHAR(20), -- '不要', '未依頼', '依頼済み', '調査済み', '依頼完了', '申請中', '申請許可', '申請不許可', 'キャンセル'
  construction_status VARCHAR(20), -- '未着手', '依頼済み', '工事日決定', '完了', '工事返却', '工事キャンセル'

  -- ファイル
  map_pdf_id VARCHAR(50), -- FK → order_files.id

  -- 受注管理
  order_status VARCHAR(20) DEFAULT 'アクティブ', -- 'アクティブ' or 'キャンセル'
  cancelled_at TIMESTAMP,
  cancellation_reason TEXT,

  -- JSON構造データ
  additional_costs JSONB, -- 追加費用情報
  additional_notes JSONB, -- 追加備考
  collective_construction_info JSONB, -- 集合工事情報

  -- 制約
  CONSTRAINT chk_orders_construction_category CHECK (construction_category IN ('個別', '集合')),
  CONSTRAINT chk_orders_customer_type CHECK (customer_type IN ('新規', '既存')),
  CONSTRAINT chk_orders_order_status CHECK (order_status IN ('アクティブ', 'キャンセル'))
);

-- インデックス
CREATE INDEX idx_orders_customer_code ON orders(customer_code);
CREATE INDEX idx_orders_collective_code ON orders(collective_code);
CREATE INDEX idx_orders_order_status ON orders(order_status);
CREATE INDEX idx_orders_construction_date ON orders(construction_date);
CREATE INDEX idx_orders_survey_status ON orders(survey_status);
CREATE INDEX idx_orders_permission_status ON orders(permission_status);
CREATE INDEX idx_orders_construction_status ON orders(construction_status);

-- GINインデックス（JSON検索用）
CREATE INDEX idx_orders_additional_costs_gin ON orders USING GIN (additional_costs);
CREATE INDEX idx_orders_additional_notes_gin ON orders USING GIN (additional_notes);
CREATE INDEX idx_orders_collective_construction_info_gin ON orders USING GIN (collective_construction_info);

-- コメント
COMMENT ON TABLE orders IS '工事依頼マスタ: 小川オーダー表形式の工事依頼情報';
COMMENT ON COLUMN orders.order_number IS '受注番号 (例: 2024031500001)';
COMMENT ON COLUMN orders.order_source IS '受注元 (KCT、営業部など)';
COMMENT ON COLUMN orders.construction_category IS '個別/集合の区別';
COMMENT ON COLUMN orders.work_type IS '工事種別';
COMMENT ON COLUMN orders.collective_code IS '集合住宅コード (集合の場合のみ)';
COMMENT ON COLUMN orders.collective_housing_name IS '集合住宅名 (集合の場合のみ)';
COMMENT ON COLUMN orders.collective_housing_name_kana IS '集合住宅名カナ (集合の場合のみ)';
COMMENT ON COLUMN orders.customer_code IS '顧客コード';
COMMENT ON COLUMN orders.customer_type IS '顧客タイプ (新規/既存)';
COMMENT ON COLUMN orders.customer_name IS '顧客名';
COMMENT ON COLUMN orders.customer_name_kana IS '顧客名カナ (必須、ひらがな検索対応)';
COMMENT ON COLUMN orders.construction_date IS '工事日';
COMMENT ON COLUMN orders.closure_number IS 'クロージャ番号 (光ファイバー接続ポイントID)';
COMMENT ON COLUMN orders.address IS '住所';
COMMENT ON COLUMN orders.phone_number IS '電話番号';
COMMENT ON COLUMN orders.survey_status IS '現地調査ステータス';
COMMENT ON COLUMN orders.permission_status IS '共架・添架ステータス';
COMMENT ON COLUMN orders.construction_status IS '工事ステータス';
COMMENT ON COLUMN orders.map_pdf_id IS '地図PDF ID';
COMMENT ON COLUMN orders.order_status IS '受注ステータス';
COMMENT ON COLUMN orders.cancelled_at IS 'キャンセル日時';
COMMENT ON COLUMN orders.cancellation_reason IS 'キャンセル理由';
COMMENT ON COLUMN orders.additional_costs IS '追加費用情報 (JSON: クロージャ増設、道路申請、他社改修、NW機器、引込用申請)';
COMMENT ON COLUMN orders.additional_notes IS '追加備考 (JSON: 現調依頼備考、共架添架依頼備考、工事依頼備考)';
COMMENT ON COLUMN orders.collective_construction_info IS '集合工事情報 (JSON: 階数、世帯数、先行資料印刷、ブースター型、分配器交換、ドロップ先行)';
