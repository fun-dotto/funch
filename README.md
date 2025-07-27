# Funch - 学食メニュー管理システム

## システム概要

Funch は、学生が学食メニューを簡単に閲覧できるシステムです。スマートフォンからいつでも最新のメニュー情報を確認でき、快適な学食利用をサポートします。

## 技術スタック

### フロントエンド
- **Next.js 15.3.5** (React 18.3.1, TypeScript 5.5.3)
- **Tailwind CSS 3.4.10** - スタイリング
- **shadcn/ui** - モダンな UI コンポーネントライブラリ
- **@dnd-kit/core 6.1.0** - ドラッグ&ドロップ
- **@radix-ui** - UI コンポーネント
- **lucide-react 0.525.0** - アイコンライブラリ
- **react-icons 5.3.0** - アイコンライブラリ

### バックエンド
- **Firebase 11.2.0**
  - Firestore (データベース)
  - Firebase Auth (認証)
  - Firebase Storage (画像)

### アーキテクチャパターン
- **Clean Architecture**
  - UI Layer (React コンポーネント)
  - Presenter Layer (状態管理)
  - Service Layer (ビジネスロジック)
  - Repository Layer (データアクセス)

## 開発コマンド

- **開発サーバー**: `npm run dev`
- **本番ビルド**: `npm run build`
- **リンティング**: `npm run lint`
- **本番サーバー**: `npm run start`

## プロジェクト構造

```
src/
├── app/                     # Next.js App Router
│   ├── api/                 # API Routes
│   ├── globals.css          # グローバルスタイル
│   ├── layout.tsx           # ルートレイアウト
│   └── page.tsx             # ホームページ
├── infrastructure/          # インフラ設定
│   └── firebase.ts          # Firebase設定
├── presenters/              # Presenter Layer
├── repositories/            # Repository Layer
│   ├── firebase/            # Firebase Repository
│   └── interfaces/          # Repository Interfaces
├── services/                # Service Layer
├── types/                   # 型定義
└── utils/                   # ユーティリティ

components/                  # UI Layer
├── ui/                      # shadcn/ui Components
└── ...                      # ビジネスコンポーネント
```

## 環境変数

以下の環境変数を設定してください：

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## セットアップ

1. リポジトリをクローン
```bash
git clone https://github.com/your-repo/funch.git
cd funch
```

2. 依存関係をインストール
```bash
npm install
```

3. 環境変数を設定
```bash
cp .env.example .env.local
# .env.local に必要な環境変数を設定
```

4. 開発サーバーを起動
```bash
npm run dev
```

## データフロー

学食メニューが学生に表示されるまでの流れ：

```
1. 大学生協の方がFunch Adminでメニューを入力
          ↓
2. メニューデータがFirebaseに保存される
          ↓
3. Funch-DottoがFirebaseからデータを取得
          ↓
4. 学生のアプリ画面にメニューが表示される
```

## ライセンス

MIT License

## 貢献

プルリクエストや Issue の作成を歓迎します。詳細は [CLAUDE.md](./CLAUDE.md) を参照してください。