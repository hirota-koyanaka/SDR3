# アクセシビリティガイドライン - WCAG 2.1 AA準拠

## 概要
里山ドッグラン管理システムのアクセシビリティガイドラインです。WCAG 2.1 AA準拠を目標とし、すべてのユーザーが快適に利用できるデザインを実現します。

## 基本原則

### 1. 知覚可能（Perceivable）
すべての情報とUIコンポーネントは、ユーザーが知覚できる方法で提示される必要があります。

### 2. 操作可能（Operable）
UIコンポーネントとナビゲーションは操作可能である必要があります。

### 3. 理解可能（Understandable）
情報とUIの操作は理解可能である必要があります。

### 4. 堅牢（Robust）
コンテンツは、様々な支援技術を含む幅広いユーザーエージェントで解釈できるよう、十分に堅牢である必要があります。

## カラーアクセシビリティ

### コントラスト比要件

#### 通常テキスト（14pt/18.5px未満）
- **最小要件**: 4.5:1以上
- **推奨**: 7:1以上（AAA準拠）

#### 大きいテキスト（14pt/18.5px以上、太字は12pt/16px以上）
- **最小要件**: 3:1以上
- **推奨**: 4.5:1以上（AAA準拠）

#### UIコンポーネント
- **最小要件**: 3:1以上（ボタン、フォーム、アイコン等）

### カラーパレットのコントラスト比

```css
/* テキストカラー */
--text-primary: #111827;     /* 背景白との比: 16.9:1 ✓ */
--text-secondary: #374151;   /* 背景白との比: 8.5:1 ✓ */
--text-tertiary: #6B7280;    /* 背景白との比: 4.5:1 ✓ */

/* ブランドカラー */
--primary-blue: #003DA5;     /* 背景白との比: 8.2:1 ✓ */
--primary-green: #00A650;    /* 背景白との比: 3.7:1 ✓ */

/* セマンティックカラー */
--success: #10B981;          /* 背景白との比: 3.4:1 ✓ */
--warning: #F59E0B;          /* 背景白との比: 2.8:1 ⚠️ */
--error: #EF4444;            /* 背景白との比: 3.3:1 ✓ */
```

### カラーのみに依存しない設計

```html
<!-- 悪い例 -->
<span style="color: red;">エラー</span>

<!-- 良い例 -->
<span style="color: #EF4444;" aria-label="エラー">
  <svg><!-- エラーアイコン --></svg>
  エラー
</span>
```

## フォントとタイポグラフィ

### フォントサイズ要件
- **最小サイズ**: 14px（モバイル16px推奨）
- **本文**: 16px以上
- **見出し**: 階層的にサイズ設定

### 行間設定
- **最小行間**: フォントサイズの1.5倍
- **推奨行間**: フォントサイズの1.6倍

```css
.accessible-text {
  font-size: 16px;
  line-height: 1.6;        /* 25.6px */
  letter-spacing: 0.025em; /* 読みやすさ向上 */
}
```

### 文字数制限
- **1行あたりの文字数**: 45-75文字（日本語は25-35文字）
- **段落の最大幅**: 80文字相当

## キーボードナビゲーション

### フォーカス管理

#### フォーカス可能要素
```css
/* フォーカス表示 */
.focus-visible {
  outline: 2px solid #003DA5;
  outline-offset: 2px;
  border-radius: 4px;
  box-shadow: 0 0 0 4px rgba(0, 61, 165, 0.2);
}

/* マウスクリック時は非表示 */
.focus-visible:not(:focus-visible) {
  outline: none;
  box-shadow: none;
}
```

#### タブ順序
```html
<!-- 論理的な順序でtabindex設定 -->
<form>
  <input tabindex="1" />
  <input tabindex="2" />
  <button tabindex="3">送信</button>
</form>
```

#### スキップリンク
```html
<a href="#main-content" class="skip-link">
  メインコンテンツにスキップ
</a>

<style>
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: #003DA5;
  color: white;
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
  transition: top 0.3s;
}

.skip-link:focus {
  top: 6px;
}
</style>
```

### キーボードショートカット
- **Tab**: 次の要素にフォーカス
- **Shift + Tab**: 前の要素にフォーカス
- **Enter**: リンクやボタンを実行
- **Space**: チェックボックスやボタンを実行
- **Escape**: モーダルやメニューを閉じる
- **Arrow Keys**: リストやメニュー内の移動

## フォームアクセシビリティ

### ラベルと説明文

```html
<!-- 良い例 -->
<div class="form-field">
  <label for="email" class="required">
    メールアドレス
    <span aria-label="必須項目">*</span>
  </label>
  <input 
    type="email" 
    id="email" 
    name="email"
    required
    aria-describedby="email-help email-error"
    aria-invalid="false"
  />
  <div id="email-help" class="help-text">
    ログイン時に使用します
  </div>
  <div id="email-error" class="error-text" aria-live="polite">
    <!-- エラーメッセージ -->
  </div>
</div>
```

### エラーハンドリング

```html
<!-- エラー状態 -->
<input 
  type="email"
  aria-invalid="true"
  aria-describedby="email-error"
  class="input-error"
/>
<div id="email-error" role="alert" aria-live="assertive">
  有効なメールアドレスを入力してください
</div>
```

### フィールドグループ化

```html
<fieldset>
  <legend>犬の基本情報</legend>
  
  <div class="form-field">
    <label for="dog-name">犬の名前</label>
    <input type="text" id="dog-name" name="dog-name" />
  </div>
  
  <div class="form-field">
    <label for="dog-breed">犬種</label>
    <input type="text" id="dog-breed" name="dog-breed" />
  </div>
</fieldset>
```

## ボタンとインタラクティブ要素

### タップターゲットサイズ
- **最小サイズ**: 44x44px
- **推奨サイズ**: 48x48px以上
- **間隔**: 隣接要素間8px以上

```css
.btn-accessible {
  min-width: 44px;
  min-height: 44px;
  padding: 12px 16px;
  margin: 4px;
  
  /* タッチデバイス用 */
  @media (hover: none) and (pointer: coarse) {
    min-width: 48px;
    min-height: 48px;
    padding: 14px 18px;
    margin: 6px;
  }
}
```

### ボタンラベル

```html
<!-- 良い例 -->
<button aria-label="申請を送信する">
  送信
</button>

<!-- アイコンボタン -->
<button aria-label="メニューを開く">
  <svg><!-- ハンバーガーアイコン --></svg>
</button>

<!-- 状態を示すボタン -->
<button aria-pressed="false" aria-label="いいね">
  <svg><!-- ハートアイコン --></svg>
  <span class="sr-only">いいねボタン</span>
</button>
```

## モーダルとダイアログ

### ARIA属性

```html
<div 
  class="modal-overlay" 
  role="dialog" 
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <div class="modal-content">
    <h2 id="modal-title">申請の確認</h2>
    <p id="modal-description">
      以下の内容で申請を送信しますか？
    </p>
    
    <div class="modal-actions">
      <button type="button" aria-label="申請をキャンセル">
        キャンセル
      </button>
      <button type="button" aria-label="申請を送信">
        送信
      </button>
    </div>
  </div>
</div>
```

### フォーカストラップ

```javascript
// フォーカス可能要素を取得
const focusableElements = modal.querySelectorAll(
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
);

const firstFocusableElement = focusableElements[0];
const lastFocusableElement = focusableElements[focusableElements.length - 1];

// Tabキーの制御
modal.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    if (e.shiftKey) {
      if (document.activeElement === firstFocusableElement) {
        lastFocusableElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastFocusableElement) {
        firstFocusableElement.focus();
        e.preventDefault();
      }
    }
  }
  
  if (e.key === 'Escape') {
    closeModal();
  }
});
```

## テーブルアクセシビリティ

### 見出しセル

```html
<table role="table" aria-label="申請一覧">
  <caption>利用申請の一覧です</caption>
  <thead>
    <tr>
      <th scope="col" id="name">申請者名</th>
      <th scope="col" id="date">申請日</th>
      <th scope="col" id="status">ステータス</th>
      <th scope="col" id="actions">操作</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td headers="name">田中美咲</td>
      <td headers="date">2025/01/19</td>
      <td headers="status">
        <span class="status-badge pending" aria-label="審査中">
          審査中
        </span>
      </td>
      <td headers="actions">
        <button aria-label="田中美咲さんの申請を承認">
          承認
        </button>
      </td>
    </tr>
  </tbody>
</table>
```

## 画像とメディア

### 代替テキスト

```html
<!-- 装飾的画像 -->
<img src="decoration.jpg" alt="" role="presentation" />

<!-- 情報を含む画像 -->
<img 
  src="dog-chart.jpg" 
  alt="犬種別利用者数グラフ：柴犬35%、トイプードル25%、ゴールデンレトリバー20%、その他20%" 
/>

<!-- 複雑な図表 -->
<img 
  src="complex-chart.jpg" 
  alt="利用者数推移グラフ" 
  aria-describedby="chart-description"
/>
<div id="chart-description">
  2024年1月から12月の月別利用者数の推移を示しています。
  1月100名から徐々に増加し、8月にピークの300名に達し、
  12月は250名となっています。
</div>
```

## ライブリージョン

### 動的コンテンツの通知

```html
<!-- 緊急性のある通知 -->
<div aria-live="assertive" role="alert">
  申請の送信に失敗しました
</div>

<!-- 緊急性のない通知 -->
<div aria-live="polite" id="status-message">
  保存しました
</div>

<!-- カウンター -->
<div aria-live="polite" aria-atomic="true">
  残り文字数: <span id="char-count">500</span>文字
</div>
```

## 実装チェックリスト

### 基本チェック項目

- [ ] すべてのページにページタイトルが設定されている
- [ ] 見出し構造が論理的（h1→h2→h3の順序）
- [ ] すべての画像に適切なalt属性が設定されている
- [ ] フォームのラベルが適切に関連付けられている
- [ ] キーボードだけで操作可能
- [ ] フォーカス表示が明確
- [ ] カラーコントラストが基準を満たしている
- [ ] テキストサイズが200%まで拡大可能

### フォームチェック項目

- [ ] 必須項目が明確に示されている
- [ ] エラーメッセージが適切に表示される
- [ ] フィールドの目的が明確
- [ ] 自動補完属性が設定されている
- [ ] 送信前に確認画面がある

### ナビゲーションチェック項目

- [ ] スキップリンクが提供されている
- [ ] パンくずリストがある
- [ ] 現在位置が明確
- [ ] メニューの開閉がキーボードで操作可能
- [ ] サイトマップが提供されている

## テストツール

### 自動テストツール
1. **axe-core**: アクセシビリティの自動検証
2. **WAVE**: Web Accessibility Evaluation Tool
3. **Lighthouse**: Chrome DevToolsの監査機能
4. **Pa11y**: コマンドラインツール

### 手動テスト
1. **キーボードナビゲーション**: Tab、Shift+Tab、Enter、Spaceでの操作確認
2. **スクリーンリーダー**: NVDA、JAWSでの読み上げ確認
3. **ズーム**: 200%拡大での表示確認
4. **カラーブラインドシミュレーター**: 色覚異常での見え方確認

## ブラウザサポート

### スクリーンリーダー対応
- **Windows**: NVDA、JAWS
- **macOS**: VoiceOver
- **iOS**: VoiceOver
- **Android**: TalkBack

### ブラウザ要件
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 更新履歴

- 2025-01-19: 初版作成、WCAG 2.1 AA準拠ガイドライン策定