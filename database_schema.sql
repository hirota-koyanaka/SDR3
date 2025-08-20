-- ========================================
-- 里山ドッグラン管理システム データベーススキーマ
-- ========================================
-- Supabase Project: hoechpkznbpavyozjqni
-- 作成日: 2024年
-- 
-- このファイルを Supabase SQL Editor で実行してください
-- ========================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- 1. ユーザーテーブル
-- ========================================
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    is_imabari_resident BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    admin_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 2. 管理者テーブル
-- ========================================
CREATE TABLE admin_users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'moderator')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 3. 犬テーブル
-- ========================================
CREATE TABLE dogs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    breed VARCHAR(100),
    weight DECIMAL(5,2),
    gender VARCHAR(10) CHECK (gender IN ('male', 'female')),
    birth_date DATE,
    vaccination_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 4. 申請テーブル
-- ========================================
CREATE TABLE applications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    is_imabari_resident BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_memo TEXT,
    rejected_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE
);

-- ========================================
-- 5. 申請犬情報テーブル
-- ========================================
CREATE TABLE application_dogs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    breed VARCHAR(100),
    weight DECIMAL(5,2),
    gender VARCHAR(10) CHECK (gender IN ('male', 'female')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 6. ワクチン証明書テーブル
-- ========================================
CREATE TABLE vaccination_certificates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    dog_name VARCHAR(50),
    file_url TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 7. イベントテーブル
-- ========================================
CREATE TABLE events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location VARCHAR(200),
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    fee DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 8. イベント参加者テーブル
-- ========================================
CREATE TABLE event_participants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    attended BOOLEAN DEFAULT false,
    UNIQUE(event_id, user_id)
);

-- ========================================
-- 9. 投稿テーブル
-- ========================================
CREATE TABLE posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    image_url TEXT,
    hashtags TEXT[], -- PostgreSQL配列型
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    report_count INTEGER DEFAULT 0,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE
);

-- ========================================
-- 10. 投稿通報テーブル
-- ========================================
CREATE TABLE post_reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- ========================================
-- 11. 入退場ログテーブル
-- ========================================
CREATE TABLE entry_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    entry_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    exit_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 12. お知らせテーブル
-- ========================================
CREATE TABLE announcements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 13. 営業時間テーブル
-- ========================================
CREATE TABLE business_hours (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=日曜日
    open_time TIME,
    close_time TIME,
    is_closed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(day_of_week)
);

-- ========================================
-- 14. 特別休業日テーブル
-- ========================================
CREATE TABLE special_holidays (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    holiday_date DATE NOT NULL UNIQUE,
    reason VARCHAR(200) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 15. システム設定テーブル
-- ========================================
CREATE TABLE system_config (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- インデックス作成
-- ========================================

-- ユーザー検索用
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_auth_id ON users(auth_id);

-- 管理者検索用
CREATE INDEX idx_admin_users_auth_id ON admin_users(auth_id);

-- 犬検索用
CREATE INDEX idx_dogs_user_id ON dogs(user_id);

-- 申請検索用
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_created_at ON applications(created_at);

-- イベント検索用
CREATE INDEX idx_events_event_date ON events(event_date);
CREATE INDEX idx_events_status ON events(status);

-- 投稿検索用
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_created_at ON posts(created_at);

-- 入退場ログ検索用
CREATE INDEX idx_entry_logs_user_id ON entry_logs(user_id);
CREATE INDEX idx_entry_logs_entry_time ON entry_logs(entry_time);
CREATE INDEX idx_entry_logs_exit_time ON entry_logs(exit_time);

-- お知らせ検索用
CREATE INDEX idx_announcements_is_published ON announcements(is_published);
CREATE INDEX idx_announcements_created_at ON announcements(created_at);

-- ========================================
-- 更新日時の自動更新トリガー
-- ========================================

-- トリガー関数を作成
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 各テーブルにトリガーを適用
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dogs_updated_at BEFORE UPDATE ON dogs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_config_updated_at BEFORE UPDATE ON system_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 初期データ挿入
-- ========================================

-- デフォルト営業時間（平日: 9:00-18:00, 土日: 8:00-19:00）
INSERT INTO business_hours (day_of_week, open_time, close_time, is_closed) VALUES
(0, '08:00', '19:00', false), -- 日曜日
(1, '09:00', '18:00', false), -- 月曜日
(2, '09:00', '18:00', false), -- 火曜日
(3, '09:00', '18:00', false), -- 水曜日
(4, '09:00', '18:00', false), -- 木曜日
(5, '09:00', '18:00', false), -- 金曜日
(6, '08:00', '19:00', false); -- 土曜日

-- システム設定のデフォルト値
INSERT INTO system_config (config_key, config_value, description) VALUES
('max_dogs_per_user', '3', 'ユーザーあたりの最大犬数'),
('max_simultaneous_users', '50', '同時入場可能な最大ユーザー数'),
('require_vaccination', 'true', 'ワクチン接種証明書の必須設定'),
('vaccination_validity_days', '365', 'ワクチン接種証明書の有効期間（日数）'),
('allow_guest_viewing', 'false', 'ゲストユーザーの閲覧許可'),
('enable_sns_features', 'true', 'SNS機能の有効化'),
('enable_event_registration', 'true', 'イベント登録機能の有効化'),
('maintenance_mode', 'false', 'メンテナンスモード'),
('site_title', '里山ドッグラン', 'サイトタイトル'),
('contact_email', 'info@satoyama-dogrun.com', '連絡先メールアドレス');

-- ========================================
-- 完了メッセージ
-- ========================================
-- データベーススキーマの作成が完了しました
-- 次のステップ: Row Level Security (RLS) ポリシーの設定