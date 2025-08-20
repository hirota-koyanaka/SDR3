-- 管理者ユーザー初期設定
-- 注意: 実際のauth_idは、Supabase Authでユーザーを作成した後に取得してください

-- 1. Supabase Authでスーパー管理者アカウントを手動作成
-- Email: admin@satoyama-dogrun.com
-- Password: 強力なパスワード

-- 2. 作成されたauth_idを以下のSQLで置き換えて実行
-- auth_idはAuth > Users画面で確認できます

-- スーパー管理者の追加（auth_idを実際の値に置き換えてください）
INSERT INTO admin_users (auth_id, email, name, role, is_active) VALUES
('あなたのauth_idをここに入力', 'admin@satoyama-dogrun.com', 'システム管理者', 'super_admin', true);

-- 一般管理者の追加例（必要に応じて）
-- INSERT INTO admin_users (auth_id, email, name, role, is_active) VALUES
-- ('auth_id_2', 'staff@satoyama-dogrun.com', 'スタッフ', 'admin', true);

-- 初期営業時間設定
INSERT INTO business_hours (day_of_week, open_time, close_time, is_closed) VALUES
(0, '10:00', '17:00', false), -- 日曜日
(1, '09:00', '17:00', false), -- 月曜日
(2, '09:00', '17:00', false), -- 火曜日
(3, '09:00', '17:00', false), -- 水曜日
(4, '09:00', '17:00', false), -- 木曜日
(5, '09:00', '17:00', false), -- 金曜日
(6, '09:00', '17:00', false); -- 土曜日

-- 初期お知らせの追加
INSERT INTO announcements (title, content, priority, is_active, created_by) VALUES
('里山ドッグラン管理システム稼働開始', '里山ドッグラン管理システムが稼働を開始しました。ご利用前に必ず利用申請を行ってください。', 'high', true, (SELECT id FROM admin_users WHERE role = 'super_admin' LIMIT 1));

-- テスト用の特別休業日（例）
-- INSERT INTO special_holidays (holiday_date, reason) VALUES
-- ('2024-01-01', '元日'),
-- ('2024-12-29', '年末休業'),
-- ('2024-12-30', '年末休業'),
-- ('2024-12-31', '年末休業');