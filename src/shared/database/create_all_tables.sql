-- ============================================================
-- CATV工事管理システム - 全テーブル一括作成スクリプト
-- データベース: PostgreSQL 13以上推奨
-- 実行方法: psql catv_management -f create_all_tables.sql
-- ============================================================

-- 既存テーブル削除（開発環境のみ！本番環境では実行禁止）
-- DROP TABLE IF EXISTS assigned_teams CASCADE;
-- DROP TABLE IF EXISTS exclusions CASCADE;
-- DROP TABLE IF EXISTS schedules CASCADE;
-- DROP TABLE IF EXISTS attached_files CASCADE;
-- DROP TABLE IF EXISTS progress_histories CASCADE;
-- DROP TABLE IF EXISTS application_requests CASCADE;
-- DROP TABLE IF EXISTS appointment_histories CASCADE;
-- DROP TABLE IF EXISTS order_files CASCADE;
-- DROP TABLE IF EXISTS orders CASCADE;
-- DROP TABLE IF EXISTS teams CASCADE;
-- DROP TABLE IF EXISTS contractors CASCADE;
-- DROP TABLE IF EXISTS admins CASCADE;

\echo '============================================================'
\echo 'CATV工事管理システム - データベース構築開始'
\echo '============================================================'
\echo ''

-- ============================================================
-- 1. 管理者マスタ
-- ============================================================
\echo '作成中: admins（管理者マスタ）...'
\i tables/01_admins.sql
\echo '✓ 完了: admins'
\echo ''

-- ============================================================
-- 2. 協力会社マスタ
-- ============================================================
\echo '作成中: contractors（協力会社マスタ）...'
\i tables/02_contractors.sql
\echo '✓ 完了: contractors'
\echo ''

-- ============================================================
-- 3. 班マスタ
-- ============================================================
\echo '作成中: teams（班マスタ）...'
\i tables/03_teams.sql
\echo '✓ 完了: teams'
\echo ''

-- ============================================================
-- 4. 工事依頼マスタ
-- ============================================================
\echo '作成中: orders（工事依頼マスタ）...'
\i tables/04_orders.sql
\echo '✓ 完了: orders'
\echo ''

-- ============================================================
-- 5. 工事依頼ファイル
-- ============================================================
\echo '作成中: order_files（工事依頼ファイル）...'
\i tables/05_order_files.sql
\echo '✓ 完了: order_files'
\echo ''

-- ============================================================
-- 6. アポイント履歴
-- ============================================================
\echo '作成中: appointment_histories（アポイント履歴）...'
\i tables/06_appointment_histories.sql
\echo '✓ 完了: appointment_histories'
\echo ''

-- ============================================================
-- 7. 申請依頼マスタ
-- ============================================================
\echo '作成中: application_requests（申請依頼マスタ）...'
\i tables/07_application_requests.sql
\echo '✓ 完了: application_requests'
\echo ''

-- ============================================================
-- 8. 進捗履歴
-- ============================================================
\echo '作成中: progress_histories（進捗履歴）...'
\i tables/08_progress_histories.sql
\echo '✓ 完了: progress_histories'
\echo ''

-- ============================================================
-- 9. 添付ファイル
-- ============================================================
\echo '作成中: attached_files（添付ファイル）...'
\i tables/09_attached_files.sql
\echo '✓ 完了: attached_files'
\echo ''

-- ============================================================
-- 10. 工事スケジュール
-- ============================================================
\echo '作成中: schedules（工事スケジュール）...'
\i tables/10_schedules.sql
\echo '✓ 完了: schedules'
\echo ''

-- ============================================================
-- 11. 除外日
-- ============================================================
\echo '作成中: exclusions（除外日）...'
\i tables/11_exclusions.sql
\echo '✓ 完了: exclusions'
\echo ''

-- ============================================================
-- 12. スケジュール割当班
-- ============================================================
\echo '作成中: assigned_teams（スケジュール割当班）...'
\i tables/12_assigned_teams.sql
\echo '✓ 完了: assigned_teams'
\echo ''

\echo '============================================================'
\echo 'データベース構築完了'
\echo '============================================================'
\echo ''
\echo '作成されたテーブル:'
\echo '  1. admins                  - 管理者マスタ'
\echo '  2. contractors             - 協力会社マスタ'
\echo '  3. teams                   - 班マスタ'
\echo '  4. orders                  - 工事依頼マスタ'
\echo '  5. order_files             - 工事依頼ファイル'
\echo '  6. appointment_histories   - アポイント履歴'
\echo '  7. application_requests    - 申請依頼マスタ'
\echo '  8. progress_histories      - 進捗履歴'
\echo '  9. attached_files          - 添付ファイル'
\echo ' 10. schedules               - 工事スケジュール'
\echo ' 11. exclusions              - 除外日'
\echo ' 12. assigned_teams          - スケジュール割当班'
\echo ''
\echo 'テーブル一覧を確認:'
\echo '  \dt'
\echo ''
\echo 'テーブル構造を確認:'
\echo '  \d テーブル名'
\echo ''
