-- 里山ドッグラン管理システム Row Level Security (RLS) ポリシー

-- RLSを有効にする
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE dogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccination_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE entry_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE special_holidays ENABLE ROW LEVEL SECURITY;

-- ユーザーテーブルのポリシー
CREATE POLICY "Users can view their own profile" ON users
FOR SELECT USING (auth.uid() = auth_id);

CREATE POLICY "Users can update their own profile" ON users
FOR UPDATE USING (auth.uid() = auth_id);

CREATE POLICY "Admins can view all users" ON users
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE auth_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Service role can insert users" ON users
FOR INSERT WITH CHECK (true);

-- 管理者テーブルのポリシー
CREATE POLICY "Admins can view admin users" ON admin_users
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE auth_id = auth.uid() AND is_active = true
  )
);

-- 申請テーブルのポリシー
CREATE POLICY "Anyone can create applications" ON applications
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own applications by email" ON applications
FOR SELECT USING (
  email IN (
    SELECT email FROM users WHERE auth_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all applications" ON applications
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE auth_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Admins can update applications" ON applications
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE auth_id = auth.uid() AND is_active = true
  )
);

-- 犬情報テーブルのポリシー
CREATE POLICY "Users can manage their own dogs" ON dogs
FOR ALL USING (
  user_id IN (
    SELECT id FROM users WHERE auth_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all dogs" ON dogs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE auth_id = auth.uid() AND is_active = true
  )
);

-- ワクチン記録のポリシー
CREATE POLICY "Users can manage vaccination records for their dogs" ON vaccination_records
FOR ALL USING (
  dog_id IN (
    SELECT d.id FROM dogs d
    INNER JOIN users u ON d.user_id = u.id
    WHERE u.auth_id = auth.uid()
  )
);

-- 投稿テーブルのポリシー
CREATE POLICY "Users can create posts" ON posts
FOR INSERT WITH CHECK (
  user_id IN (
    SELECT id FROM users WHERE auth_id = auth.uid()
  )
);

CREATE POLICY "Users can view approved posts" ON posts
FOR SELECT USING (status = 'approved');

CREATE POLICY "Users can view their own posts" ON posts
FOR SELECT USING (
  user_id IN (
    SELECT id FROM users WHERE auth_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own posts" ON posts
FOR UPDATE USING (
  user_id IN (
    SELECT id FROM users WHERE auth_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all posts" ON posts
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE auth_id = auth.uid() AND is_active = true
  )
);

-- いいねテーブルのポリシー
CREATE POLICY "Users can manage their own likes" ON likes
FOR ALL USING (
  user_id IN (
    SELECT id FROM users WHERE auth_id = auth.uid()
  )
);

CREATE POLICY "Anyone can view likes" ON likes
FOR SELECT USING (true);

-- コメントテーブルのポリシー
CREATE POLICY "Users can create comments" ON comments
FOR INSERT WITH CHECK (
  user_id IN (
    SELECT id FROM users WHERE auth_id = auth.uid()
  )
);

CREATE POLICY "Anyone can view comments" ON comments
FOR SELECT USING (true);

CREATE POLICY "Users can update their own comments" ON comments
FOR UPDATE USING (
  user_id IN (
    SELECT id FROM users WHERE auth_id = auth.uid()
  )
);

-- イベントテーブルのポリシー
CREATE POLICY "Anyone can view events" ON events
FOR SELECT USING (true);

CREATE POLICY "Admins can manage events" ON events
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE auth_id = auth.uid() AND is_active = true
  )
);

-- イベント登録テーブルのポリシー
CREATE POLICY "Users can manage their own event registrations" ON event_registrations
FOR ALL USING (
  user_id IN (
    SELECT id FROM users WHERE auth_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all event registrations" ON event_registrations
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE auth_id = auth.uid() AND is_active = true
  )
);

-- 入退場記録のポリシー
CREATE POLICY "Users can view their own entry logs" ON entry_logs
FOR SELECT USING (
  user_id IN (
    SELECT id FROM users WHERE auth_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all entry logs" ON entry_logs
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE auth_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Anyone can view current visitor count" ON entry_logs
FOR SELECT USING (exit_time IS NULL);

-- お知らせテーブルのポリシー
CREATE POLICY "Anyone can view active announcements" ON announcements
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage announcements" ON announcements
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE auth_id = auth.uid() AND is_active = true
  )
);

-- 営業時間テーブルのポリシー
CREATE POLICY "Anyone can view business hours" ON business_hours
FOR SELECT USING (true);

CREATE POLICY "Admins can manage business hours" ON business_hours
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE auth_id = auth.uid() AND is_active = true
  )
);

-- 特別休業日テーブルのポリシー
CREATE POLICY "Anyone can view special holidays" ON special_holidays
FOR SELECT USING (true);

CREATE POLICY "Admins can manage special holidays" ON special_holidays
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE auth_id = auth.uid() AND is_active = true
  )
);

-- その他のテーブルのポリシー（必要に応じて追加）
CREATE POLICY "Anyone can view hashtags" ON hashtags
FOR SELECT USING (true);

CREATE POLICY "Service role can manage hashtags" ON hashtags
FOR ALL WITH CHECK (true);

CREATE POLICY "Anyone can view post hashtag relationships" ON post_hashtags
FOR SELECT USING (true);

CREATE POLICY "Service role can manage post hashtag relationships" ON post_hashtags
FOR ALL WITH CHECK (true);

CREATE POLICY "Anyone can view post images" ON post_images
FOR SELECT USING (true);

CREATE POLICY "Users can manage images for their own posts" ON post_images
FOR ALL USING (
  post_id IN (
    SELECT p.id FROM posts p
    INNER JOIN users u ON p.user_id = u.id
    WHERE u.auth_id = auth.uid()
  )
);