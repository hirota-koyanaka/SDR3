# 里山ドッグラン UIスタイルガイド 最終版

## 目次
1. [デザイン原則](#デザイン原則)
2. [ブランド要素](#ブランド要素)
3. [カラーシステム](#カラーシステム)
4. [タイポグラフィ](#タイポグラフィ)
5. [レイアウトとスペーシング](#レイアウトとスペーシング)
6. [コンポーネント](#コンポーネント)
7. [インタラクション](#インタラクション)
8. [アクセシビリティ](#アクセシビリティ)
9. [レスポンシブデザイン](#レスポンシブデザイン)
10. [実装ガイド](#実装ガイド)

---

## デザイン原則

### 1. 親しみやすさ（Approachable）
- 温かみのある色使いと丸みのあるデザイン
- 分かりやすいアイコンと直感的なUIパターン
- ユーザーフレンドリーなメッセージとガイダンス

### 2. シンプル（Simple）
- 必要最小限の要素で構成
- 明確な情報階層と視覚的な整理
- 無駄な装飾を避けたクリーンなデザイン

### 3. 信頼性（Trustworthy）
- FC今治の公式性を感じさせるプロフェッショナルな外観
- 一貫性のあるデザインパターン
- 安心感を与える色使いとレイアウト

### 4. アクセシブル（Accessible）
- すべての人が使いやすいユニバーサルデザイン
- WCAG 2.1 AA準拠
- 多様なデバイスと環境での最適化

---

## ブランド要素

### ロゴ使用規定
- FC今治のブランドガイドラインに準拠
- 最小使用サイズ：24px（デジタル）
- クリアスペース：ロゴの高さの1/2以上
- 改変禁止

### ブランドメッセージ
- **タグライン**: 「愛犬と自然を楽しむ、今治の里山ドッグラン」
- **キーワード**: 自然、安全、コミュニティ、FC今治

---

## カラーシステム

### プライマリーカラー

```css
/* FC今治ブランドカラー */
--primary-blue: #003DA5;      /* メインブランドカラー */
--primary-green: #00A650;     /* サブブランドカラー */

/* バリエーション */
--primary-blue-light: #4A7BC7;
--primary-blue-dark: #002A75;
--primary-green-light: #10B981;
--primary-green-dark: #059669;
```

### セマンティックカラー

```css
/* 状態カラー */
--success: #10B981;           /* 成功・完了 */
--warning: #F59E0B;           /* 警告・注意 */
--error: #EF4444;             /* エラー・危険 */
--info: #3B82F6;              /* 情報・通知 */

/* 背景カラー */
--background-primary: #FFFFFF;
--background-secondary: #F9FAFB;
--background-tertiary: #F3F4F6;
```

### グレースケール

```css
/* ニュートラルカラー */
--gray-50: #F9FAFB;
--gray-100: #F3F4F6;
--gray-200: #E5E7EB;
--gray-300: #D1D5DB;
--gray-400: #9CA3AF;
--gray-500: #6B7280;
--gray-600: #4B5563;
--gray-700: #374151;
--gray-800: #1F2937;
--gray-900: #111827;
```

### 使用例

```html
<!-- プライマリーボタン -->
<button class="btn" style="background: var(--primary-blue);">
  申請する
</button>

<!-- 成功メッセージ -->
<div class="alert" style="background: var(--success); color: white;">
  申請が完了しました
</div>
```

---

## タイポグラフィ

### フォントファミリー

```css
/* 日本語メインフォント */
--font-family-primary: 'Noto Sans JP', -apple-system, BlinkMacSystemFont, 
                       'Hiragino Sans', 'Yu Gothic', sans-serif;

/* 英数字サブフォント */
--font-family-secondary: 'Inter', -apple-system, BlinkMacSystemFont, 
                         'Segoe UI', sans-serif;

/* システムフォント */
--font-family-system: -apple-system, BlinkMacSystemFont, 'Segoe UI', 
                      'Hiragino Sans', sans-serif;
```

### フォントサイズ階層

```css
/* 見出し */
--text-5xl: 48px;    /* h1 - ヒーロータイトル */
--text-4xl: 36px;    /* h1 - ページタイトル */
--text-3xl: 30px;    /* h2 - セクションタイトル */
--text-2xl: 24px;    /* h2 - サブセクション */
--text-xl: 20px;     /* h3 - カードタイトル */
--text-lg: 18px;     /* h4 - 小見出し */

/* 本文 */
--text-base: 16px;   /* 基本テキスト */
--text-sm: 14px;     /* 小さいテキスト */
--text-xs: 12px;     /* キャプション */
```

### タイポグラフィスケール

| 用途 | サイズ | ウェイト | 行間 | 例 |
|------|--------|----------|------|-----|
| Hero Title | 48px | 700 | 1.2 | メインビジュアルのタイトル |
| Page Title | 36px | 700 | 1.3 | ページの大見出し |
| Section Title | 24px | 600 | 1.4 | セクションの見出し |
| Card Title | 20px | 600 | 1.4 | カードのタイトル |
| Body Large | 18px | 400 | 1.6 | 重要な本文 |
| Body Regular | 16px | 400 | 1.6 | 標準的な本文 |
| Body Small | 14px | 400 | 1.5 | 補足情報 |
| Caption | 12px | 400 | 1.4 | キャプション・注釈 |

### 使用例

```css
.hero-title {
  font-size: var(--text-5xl);
  font-weight: 700;
  line-height: 1.2;
  color: var(--gray-900);
  letter-spacing: -0.02em;
}

.body-text {
  font-size: var(--text-base);
  font-weight: 400;
  line-height: 1.6;
  color: var(--gray-700);
}
```

---

## レイアウトとスペーシング

### 8pxグリッドシステム

```css
/* スペーシングスケール */
--space-0: 0px;
--space-1: 8px;      /* xs */
--space-2: 16px;     /* sm */
--space-3: 24px;     /* md */
--space-4: 32px;     /* lg */
--space-5: 40px;     /* xl */
--space-6: 48px;     /* 2xl */
--space-8: 64px;     /* 3xl */
--space-10: 80px;    /* 4xl */
```

### レイアウトパターン

#### グリッドシステム
```css
/* レスポンシブグリッド */
.grid {
  display: grid;
  gap: var(--space-6);
}

.grid-cols-1 { grid-template-columns: 1fr; }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
```

#### コンテナ
```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-4);
}

@media (max-width: 768px) {
  .container {
    padding: 0 var(--space-2);
  }
}
```

---

## コンポーネント

### ボタン

#### バリエーション
```css
/* プライマリーボタン */
.btn-primary {
  background: var(--primary-blue);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: var(--primary-blue-dark);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 61, 165, 0.3);
}

/* セカンダリーボタン */
.btn-secondary {
  background: white;
  color: var(--primary-blue);
  border: 2px solid var(--primary-blue);
  padding: 10px 22px;
  border-radius: 12px;
}

/* 成功ボタン */
.btn-success {
  background: var(--success);
  color: white;
}

/* 危険ボタン */
.btn-danger {
  background: var(--error);
  color: white;
}
```

#### サイズバリエーション
```css
.btn-small {
  padding: 6px 12px;
  font-size: var(--text-sm);
  border-radius: 8px;
}

.btn-large {
  padding: 16px 32px;
  font-size: var(--text-lg);
  border-radius: 16px;
}
```

### フォーム要素

#### 入力フィールド
```css
.input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--gray-300);
  border-radius: 12px;
  font-size: var(--text-base);
  transition: all 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 3px rgba(0, 61, 165, 0.1);
}

.input.error {
  border-color: var(--error);
  background: #FEF2F2;
}

.input.success {
  border-color: var(--success);
  background: #F0FDF4;
}
```

#### ラベル
```css
.label {
  display: block;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--gray-700);
  margin-bottom: 6px;
}

.label.required::after {
  content: ' *';
  color: var(--error);
}
```

### カード

```css
.card {
  background: white;
  border-radius: 16px;
  padding: var(--space-6);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--gray-200);
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.card-header {
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--gray-200);
}

.card-title {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--gray-900);
}
```

### バッジ

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.badge-success {
  background: #D1FAE5;
  color: var(--success);
}

.badge-warning {
  background: #FEF3C7;
  color: var(--warning);
}

.badge-error {
  background: #FEE2E2;
  color: var(--error);
}
```

---

## インタラクション

### ホバーエフェクト

```css
/* ボタンホバー */
.interactive-element {
  transition: all 0.2s ease;
}

.interactive-element:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* カードホバー */
.card-interactive:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}
```

### トランジション

```css
/* 基本トランジション */
.transition-all { transition: all 0.3s ease; }
.transition-colors { transition: background-color 0.15s ease, 
                               border-color 0.15s ease, 
                               color 0.15s ease; }
.transition-transform { transition: transform 0.15s ease; }
.transition-opacity { transition: opacity 0.15s ease; }
```

### アニメーション

```css
/* フェードイン */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-in {
  animation: fadeIn 0.5s ease-out;
}

/* ローディング */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading {
  animation: spin 1s linear infinite;
}
```

---

## アクセシビリティ

### カラーコントラスト

| 背景色 | テキスト色 | コントラスト比 | 適合レベル |
|--------|------------|----------------|------------|
| #FFFFFF | #111827 | 16.9:1 | AAA |
| #FFFFFF | #374151 | 8.5:1 | AAA |
| #FFFFFF | #6B7280 | 4.5:1 | AA |
| #003DA5 | #FFFFFF | 8.2:1 | AAA |

### フォーカス表示

```css
.focus-visible {
  outline: 2px solid var(--primary-blue);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(0, 61, 165, 0.2);
}

/* マウスクリック時は非表示 */
.focus-visible:not(:focus-visible) {
  outline: none;
  box-shadow: none;
}
```

### タップターゲット

```css
.touch-target {
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (hover: none) and (pointer: coarse) {
  .touch-target {
    min-width: 48px;
    min-height: 48px;
  }
}
```

---

## レスポンシブデザイン

### ブレークポイント

```css
/* モバイル優先アプローチ */
:root {
  --breakpoint-sm: 576px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 992px;
  --breakpoint-xl: 1200px;
  --breakpoint-2xl: 1400px;
}

/* メディアクエリ */
@media (min-width: 768px) {
  .md\:grid-cols-2 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 992px) {
  .lg\:grid-cols-3 {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### レスポンシブタイポグラフィ

```css
.responsive-title {
  font-size: clamp(24px, 5vw, 48px);
  line-height: 1.2;
}

.responsive-body {
  font-size: clamp(14px, 2vw, 16px);
  line-height: 1.6;
}
```

---

## 実装ガイド

### CSS変数の活用

```css
:root {
  /* カラー */
  --primary: #003DA5;
  --secondary: #00A650;
  
  /* スペーシング */
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  
  /* ボーダーラジアス */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  
  /* シャドウ */
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.15);
}
```

### ユーティリティクラス

```css
/* スペーシング */
.p-sm { padding: var(--space-sm); }
.p-md { padding: var(--space-md); }
.p-lg { padding: var(--space-lg); }

.m-sm { margin: var(--space-sm); }
.m-md { margin: var(--space-md); }
.m-lg { margin: var(--space-lg); }

/* テキスト */
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

.font-bold { font-weight: 700; }
.font-semibold { font-weight: 600; }
.font-medium { font-weight: 500; }

/* 表示制御 */
.hidden { display: none; }
.block { display: block; }
.flex { display: flex; }
.grid { display: grid; }
```

### コンポーネント実装例

```html
<!-- ボタンコンポーネント -->
<button class="btn btn-primary btn-large">
  <svg class="btn-icon"><!-- アイコン --></svg>
  申請を送信
</button>

<!-- カードコンポーネント -->
<div class="card">
  <div class="card-header">
    <h3 class="card-title">申請状況</h3>
    <span class="badge badge-warning">審査中</span>
  </div>
  <div class="card-body">
    <p>申請内容を確認中です。</p>
  </div>
</div>

<!-- フォームコンポーネント -->
<div class="form-field">
  <label class="label required" for="email">
    メールアドレス
  </label>
  <input 
    class="input" 
    type="email" 
    id="email" 
    placeholder="example@email.com"
    aria-describedby="email-help"
  />
  <div id="email-help" class="help-text">
    ログイン時に使用します
  </div>
</div>
```

---

## Do's and Don'ts

### ✅ Do's（推奨）

1. **一貫性を保つ**
   - 同じ機能には同じUIパターンを使用
   - カラーとタイポグラフィを統一

2. **余白を十分にとる**
   - 8pxグリッドシステムに従う
   - 読みやすいライン間隔を確保

3. **ユーザーフレンドリーなメッセージ**
   - 丁寧で分かりやすい表現
   - エラーメッセージは建設的に

4. **アクセシビリティを考慮**
   - 適切なコントラスト比を確保
   - キーボード操作に対応

### ❌ Don'ts（避けること）

1. **情報の詰め込み**
   - 1画面に多すぎる情報を配置
   - 余白の不足

2. **不統一なデザイン**
   - ページごとに異なるスタイル
   - 一貫性のないUIパターン

3. **アクセシビリティの無視**
   - 低コントラストの組み合わせ
   - キーボード操作ができない要素

4. **過度な装飾**
   - 不必要なアニメーション
   - 読みにくい装飾的フォント

---

## 更新履歴

- **2025-01-19**: 最終版作成
  - 全セクションの内容完成
  - 実装例とガイドライン統合
  - アクセシビリティ要件追加

---

## 参考資料

- [FC今治ブランドガイドライン](★必読 FC今治ブランドガイドライン (3).pdf)
- [WCAG 2.1 ガイドライン](https://www.w3.org/WAI/WCAG21/)
- [Material Design](https://material.io/design)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)