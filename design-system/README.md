# 里山ドッグラン デザインシステム

## 概要
里山ドッグラン管理システムのデザインシステムドキュメントです。FC今治のブランドガイドラインに準拠し、一貫性のあるユーザー体験を提供します。

## ディレクトリ構造

```
design-system/
├── foundation/          # 基礎要素
│   ├── brand-colors.json    # ブランドカラー定義
│   ├── typography.json      # タイポグラフィ設定
│   ├── spacing.json         # スペーシングシステム
│   ├── breakpoints.json     # レスポンシブブレークポイント
│   ├── shadows.json         # シャドウ定義
│   └── animations.json      # アニメーション設定
├── components/          # UIコンポーネント
│   ├── atoms/              # 基本コンポーネント
│   ├── molecules/          # 複合コンポーネント
│   └── organisms/          # 高度なコンポーネント
├── patterns/           # デザインパターン
├── guidelines/         # ガイドライン
└── assets/            # アセット（アイコン、画像等）
```

## ブランドカラー

### プライマリーカラー
- **FC今治ブルー**: `#003DA5` - メインブランドカラー
- **FC今治グリーン**: `#00A650` - サブブランドカラー

### セマンティックカラー
- **Success**: `#10B981` - 成功・完了状態
- **Warning**: `#F59E0B` - 警告・注意状態
- **Error**: `#EF4444` - エラー・危険状態
- **Info**: `#3B82F6` - 情報・通知状態

## タイポグラフィ

### フォントファミリー
- **日本語**: Noto Sans JP
- **英数字**: Inter
- **システムフォント**: システムデフォルトフォント

### フォントサイズ
- **見出し**: 32px, 24px, 20px, 18px, 16px
- **本文**: 18px (large), 16px (regular), 14px (small)
- **UI要素**: 16px (button), 14px (label), 12px (caption)

## スペーシング

8pxグリッドシステムを採用：
- `xs`: 4px
- `sm`: 8px
- `md`: 16px
- `lg`: 24px
- `xl`: 32px
- `2xl`: 48px
- `3xl`: 64px

## レスポンシブデザイン

### ブレークポイント
- **Mobile**: 0-575px
- **Small**: 576-767px
- **Tablet**: 768-991px
- **Desktop**: 992-1199px
- **Large**: 1200-1399px
- **Extra Large**: 1400px+

### コンテナ幅
- `sm`: 540px
- `md`: 720px
- `lg`: 960px
- `xl`: 1140px
- `2xl`: 1320px

## アニメーション

### 基本設定
- **Duration**: fast (150ms), normal (300ms), slow (500ms)
- **Easing**: easeOut, easeInOut
- **Transitions**: colors, opacity, shadow, transform

### プリセットアニメーション
- fadeIn / fadeOut
- fadeInUp / fadeInDown
- slideInRight / slideInLeft
- pulse
- spin
- bounce

## アクセシビリティ

WCAG 2.1 AA準拠を目標：
- カラーコントラスト比: 4.5:1以上（通常テキスト）
- タップターゲット: 最小44x44px
- キーボードナビゲーション対応
- スクリーンリーダー対応

## 使用方法

### デザイナー向け
1. Figmaプロジェクトでデザイントークンをインポート
2. コンポーネントライブラリを使用
3. ガイドラインに従ってデザイン作成

### 開発者向け
1. JSONファイルからデザイントークンを取得
2. CSS変数またはSass変数として実装
3. コンポーネント仕様に従って開発

## 更新履歴

- 2025-01-19: 初版作成
  - 基礎要素（Foundation）の定義
  - FC今治ブランドカラーの設定
  - タイポグラフィシステムの構築
  - スペーシング・グリッドシステムの定義