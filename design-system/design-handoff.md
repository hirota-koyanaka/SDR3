# デザインハンドオフドキュメント

## 概要
このドキュメントは、里山ドッグラン管理システムのデザインをエンジニアリングチームに引き継ぐための仕様書です。

## デザインファイル構成

### Figmaプロジェクト構造
```
里山ドッグラン Design System
├── 🎨 Design Tokens
│   ├── Colors
│   ├── Typography
│   ├── Spacing
│   └── Effects
├── 📦 Components
│   ├── Atoms
│   │   ├── Button
│   │   ├── Input
│   │   ├── Checkbox
│   │   ├── Radio
│   │   └── Badge
│   ├── Molecules
│   │   ├── Card
│   │   ├── Form Field
│   │   ├── Navigation Item
│   │   └── Toast
│   └── Organisms
│       ├── Header
│       ├── Sidebar
│       ├── Footer
│       └── Modal
├── 📱 Screens
│   ├── User Screens
│   │   ├── Homepage
│   │   ├── Application Form
│   │   ├── Dashboard
│   │   └── Profile
│   └── Admin Screens
│       ├── Dashboard
│       ├── User Management
│       └── Application Review
└── 📝 Documentation
    ├── Style Guide
    ├── Component Usage
    └── Accessibility Guide
```

## デザイントークン

### カラーシステム

#### ブランドカラー
```css
/* FC今治ブランドカラー */
--color-primary-blue: #003DA5;
--color-primary-green: #00A650;
--color-primary-blue-light: #4A7BC7;
--color-primary-blue-dark: #002A75;

/* セマンティックカラー */
--color-success: #10B981;
--color-warning: #F59E0B;
--color-error: #EF4444;
--color-info: #3B82F6;

/* グレースケール */
--color-gray-50: #F9FAFB;
--color-gray-100: #F3F4F6;
--color-gray-200: #E5E7EB;
--color-gray-300: #D1D5DB;
--color-gray-400: #9CA3AF;
--color-gray-500: #6B7280;
--color-gray-600: #4B5563;
--color-gray-700: #374151;
--color-gray-800: #1F2937;
--color-gray-900: #111827;
```

### タイポグラフィ

```css
/* フォントファミリー */
--font-family-primary: 'Noto Sans JP', sans-serif;
--font-family-secondary: 'Inter', sans-serif;

/* フォントサイズ */
--font-size-xs: 12px;
--font-size-sm: 14px;
--font-size-base: 16px;
--font-size-lg: 18px;
--font-size-xl: 20px;
--font-size-2xl: 24px;
--font-size-3xl: 30px;
--font-size-4xl: 36px;

/* フォントウェイト */
--font-weight-regular: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;

/* 行高 */
--line-height-tight: 1.2;
--line-height-normal: 1.5;
--line-height-relaxed: 1.6;
```

### スペーシング

```css
/* 8pxグリッドシステム */
--spacing-0: 0;
--spacing-1: 8px;
--spacing-2: 16px;
--spacing-3: 24px;
--spacing-4: 32px;
--spacing-5: 40px;
--spacing-6: 48px;
--spacing-8: 64px;
--spacing-10: 80px;
--spacing-12: 96px;
```

### ブレークポイント

```css
/* レスポンシブブレークポイント */
--breakpoint-xs: 0;
--breakpoint-sm: 576px;
--breakpoint-md: 768px;
--breakpoint-lg: 992px;
--breakpoint-xl: 1200px;
--breakpoint-2xl: 1400px;
```

## コンポーネント仕様

### Button Component

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'primary' \| 'secondary' \| 'success' \| 'danger' \| 'ghost' | 'primary' | ボタンの見た目 |
| size | 'small' \| 'medium' \| 'large' | 'medium' | ボタンサイズ |
| fullWidth | boolean | false | 幅100%表示 |
| disabled | boolean | false | 無効状態 |
| loading | boolean | false | ローディング状態 |
| icon | ReactNode | null | アイコン |
| onClick | function | - | クリックハンドラー |

#### 実装例
```jsx
<Button 
  variant="primary"
  size="medium"
  onClick={handleSubmit}
>
  申請する
</Button>
```

### Input Component

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| type | string | 'text' | 入力タイプ |
| size | 'small' \| 'medium' \| 'large' | 'medium' | サイズ |
| error | boolean | false | エラー状態 |
| helperText | string | '' | ヘルパーテキスト |
| required | boolean | false | 必須項目 |
| disabled | boolean | false | 無効状態 |
| placeholder | string | '' | プレースホルダー |

### Card Component

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'default' \| 'elevated' \| 'outlined' | 'default' | カードスタイル |
| size | 'small' \| 'medium' \| 'large' | 'medium' | パディングサイズ |
| interactive | boolean | false | ホバーエフェクト |

## アイコンシステム

### 使用ライブラリ
- **Lucide Icons**: メインアイコンセット
- **カスタムアイコン**: SVGで提供

### アイコンサイズ
- Small: 16x16px
- Medium: 20x20px
- Large: 24x24px
- XLarge: 32x32px

## アニメーション仕様

### 基本設定
```css
/* トランジション */
--transition-fast: 150ms ease-out;
--transition-normal: 300ms ease-out;
--transition-slow: 500ms ease-out;

/* アニメーション */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

## レスポンシブデザイン

### グリッドシステム
- Mobile: 4カラム
- Tablet: 8カラム
- Desktop: 12カラム

### コンテナ幅
- sm: 540px
- md: 720px
- lg: 960px
- xl: 1140px
- 2xl: 1320px

## アクセシビリティガイドライン

### カラーコントラスト
- 通常テキスト: 4.5:1以上
- 大きいテキスト: 3:1以上
- UI要素: 3:1以上

### フォーカス管理
- すべてのインタラクティブ要素にフォーカス表示
- キーボードナビゲーション対応
- フォーカストラップ（モーダル内）

### ARIA属性
```html
<!-- ボタン例 -->
<button 
  aria-label="申請を送信"
  aria-disabled="false"
  role="button"
>

<!-- フォーム例 -->
<input 
  aria-required="true"
  aria-invalid="false"
  aria-describedby="email-error"
>
```

## 実装チェックリスト

### デザイナー → エンジニア

#### 引き継ぎ資料
- [ ] Figmaファイルへのアクセス権限
- [ ] デザイントークン（JSON形式）
- [ ] アイコンセット（SVG形式）
- [ ] 画像アセット（最適化済み）
- [ ] フォントファイル/CDNリンク

#### コミュニケーション
- [ ] 週次デザインレビュー設定
- [ ] Slackチャンネル参加
- [ ] 質問対応体制確立

### 実装確認項目

#### スタイル
- [ ] カラーがデザイントークンと一致
- [ ] フォントサイズ・ウェイトが正確
- [ ] スペーシングが8pxグリッドに準拠
- [ ] ホバー・フォーカス状態の実装

#### レスポンシブ
- [ ] モバイル表示の確認
- [ ] タブレット表示の確認
- [ ] デスクトップ表示の確認
- [ ] ブレークポイントでの切り替え

#### インタラクション
- [ ] アニメーションの実装
- [ ] トランジションの適用
- [ ] ローディング状態
- [ ] エラー状態

#### アクセシビリティ
- [ ] キーボード操作
- [ ] スクリーンリーダー対応
- [ ] カラーコントラスト
- [ ] フォーカス表示

## サポート体制

### デザインQA
- 実装後のビジュアル確認
- フィードバック提供
- 改善提案

### 更新管理
- デザインシステムの更新通知
- 変更履歴の管理
- バージョン管理

## 付録

### リソースリンク
- [Figmaプロジェクト](#)
- [アイコンライブラリ](https://lucide.dev)
- [FC今治公式サイト](https://www.fcimabari.com)

### ツール
- [Figma](https://www.figma.com)
- [Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Responsive Viewer](https://responsiveviewer.org)

---

最終更新日: 2025年1月19日
作成者: UI/UXデザインチーム