# CATV工事管理システム - データベース定義

このディレクトリには、CATV工事管理システムのデータベース論理設計とテーブル定義（DDL）が含まれています。

## 📁 ディレクトリ構成

```
src/shared/database/
├── README.md              # このファイル
├── create_all_tables.sql  # 全テーブル一括作成スクリプト
└── tables/                # 個別テーブル定義
    ├── 01_admins.sql
    ├── 02_contractors.sql
    ├── 03_teams.sql
    ├── 04_orders.sql
    ├── 05_order_files.sql
    ├── 06_appointment_histories.sql
    ├── 07_application_requests.sql
    ├── 08_progress_histories.sql
    ├── 09_attached_files.sql
    ├── 10_schedules.sql
    ├── 11_exclusions.sql
    └── 12_assigned_teams.sql
```

## 📊 テーブル一覧

| No | テーブル名 | 説明 | 依存関係 |
|----|-----------|------|----------|
| 1 | admins | 管理者アカウント | - |
| 2 | contractors | 協力会社アカウント | - |
| 3 | teams | 班情報 | contractors |
| 4 | orders | 工事依頼マスタ | - |
| 5 | order_files | 地図PDF添付ファイル | orders, admins |
| 6 | appointment_histories | アポイント履歴 | orders |
| 7 | application_requests | 申請依頼統合テーブル | orders, contractors, teams |
| 8 | progress_histories | 進捗履歴 | application_requests |
| 9 | attached_files | 申請ファイル添付 | application_requests |
| 10 | schedules | 工事スケジュール | orders, contractors, teams |
| 11 | exclusions | 除外日 | contractors, teams |
| 12 | assigned_teams | スケジュール複数班割当 | schedules, contractors, teams |

## 🚀 データベース作成手順

### PostgreSQL の場合

```bash
# 1. データベースを作成
createdb catv_management

# 2. 接続
psql catv_management

# 3. 全テーブル一括作成
\i src/shared/database/create_all_tables.sql

# または個別に実行
\i src/shared/database/tables/01_admins.sql
\i src/shared/database/tables/02_contractors.sql
# ... (以下省略)
```

### 個別にテーブルを作成する場合

```bash
psql catv_management -f src/shared/database/tables/01_admins.sql
psql catv_management -f src/shared/database/tables/02_contractors.sql
# ... (以下省略)
```

## 🔑 主要な設計ポイント

### 1. 申請依頼の統合設計

現地調査依頼、共架・添架依頼、工事依頼の3種類を **application_requests** テーブルに統合。`type` カラムで種別を識別。

```sql
-- type = 'survey'       -> 現地調査依頼
-- type = 'attachment'   -> 共架・添架依頼
-- type = 'construction' -> 工事依頼
```

### 2. JSON型の活用

動的なデータ構造は PostgreSQL の JSONB 型で柔軟に対応:

- `orders.additional_costs`: 追加費用情報
- `orders.additional_notes`: 追加備考
- `orders.collective_construction_info`: 集合工事情報
- `application_requests.feasibility_result`: 工事可否判定結果
- `application_requests.application_report`: 申請有無報告
- `appointment_histories.schedule_info`: スケジュール情報

### 3. ファイル保存戦略

**現在（Phase 1）**: Base64形式でDB保存
- `order_files.file_data`: 最大2MB
- `attached_files.file_data`: 最大10MB

**将来（Phase 2）**: AWS S3 / Cloudinary移行
- `file_data` カラムを URL に変更
- ファイル本体は外部ストレージへ

### 4. 複数班対応

1つのスケジュールに複数の班を割り当て可能:

```
schedules (1) ←→ (多) assigned_teams
```

### 5. 進捗履歴の設計

**append-only** で履歴を完全保持:
- `progress_histories`: 削除・更新不可、追加のみ
- 監査証跡（audit trail）として機能

## 📝 データ型変換対応表（localStorage → PostgreSQL）

| localStorage | PostgreSQL | 備考 |
|-------------|------------|------|
| string (ISO 8601) | TIMESTAMP | 日時データ |
| string (YYYY-MM-DD) | DATE | 日付データ |
| string (HH:MM) | TIME | 時刻データ |
| string (JSON) | JSONB | JSON構造データ |
| boolean | BOOLEAN | - |
| number | INTEGER | - |
| string (Base64) | TEXT | ファイルデータ |

## 🔒 セキュリティ注意事項

### パスワード保存

**現在**: 平文保存（localStorage 互換）
```sql
password VARCHAR(255) -- 平文
```

**必須対応**: bcrypt でハッシュ化
```javascript
// Node.js での実装例
const bcrypt = require('bcrypt');
const saltRounds = 10;
const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
```

### SQL インジェクション対策

必ずプリペアドステートメントを使用:

```javascript
// ✅ 良い例
const result = await pool.query(
  'SELECT * FROM orders WHERE order_number = $1',
  [orderNumber]
);

// ❌ 悪い例
const result = await pool.query(
  `SELECT * FROM orders WHERE order_number = '${orderNumber}'`
);
```

## 🔄 マイグレーション戦略

### Phase 1: DB構築（現在）
- ✅ テーブル定義作成
- ✅ インデックス設計
- ⏳ 初期データ投入

### Phase 2: localStorage → DB移行
1. バックエンドAPI実装（Node.js + Express）
2. Repository パターン実装（既存コード対応済み）
3. データ移行スクリプト作成
4. 段階的移行（機能単位）

### Phase 3: 最適化
- ファイルストレージ外部化（S3/Cloudinary）
- パフォーマンスチューニング
- パーティショニング検討（大規模データ対応）

## 📚 参考資料

- [CLAUDE.md](../../CLAUDE.md) - プロジェクト全体の設計書
- [PostgreSQL公式ドキュメント](https://www.postgresql.org/docs/)
- [JSONB型の使い方](https://www.postgresql.org/docs/current/datatype-json.html)

## 🤝 開発者向け情報

### テーブル追加時の手順

1. `tables/` 配下に新規SQLファイル作成
2. ファイル名は `{番号}_{テーブル名}.sql` 形式
3. コメント（COMMENT ON）を必ず記載
4. `create_all_tables.sql` に追加
5. この README の「テーブル一覧」を更新

### ER図更新

テーブル定義変更時は、ER図も更新してください:
- ツール推奨: [draw.io](https://draw.io), [dbdiagram.io](https://dbdiagram.io)
- 保存先: `docs/er_diagram.png`

## ❓ 質問・問題報告

データベース設計に関する質問や問題は、プロジェクトの Issue で報告してください。
