# CLAUDE.md

このファイルは、このリポジトリでコードを扱う際の Claude Code（claude.ai/code）向けガイダンスを提供します。

## ルール

### 📋 ドキュメント管理

- **必須**: プロジェクトに変更を加える際は、CLAUDE.md の内容に変更が必要かどうかを都度確認すること
- **必須**: CLAUDE.md の内容が現在のプロジェクト状態と乖離している場合は、必要に応じて更新すること

### 🌐 言語・エンコーディング

- **必須**: 全ての出力は日本語で行うこと
- **必須**: 日本語をファイルに出力する場合は、UTF-8 エンコーディングを使用すること
- **必須**: ファイルの最終行は改行すること

### 📁 ファイル命名規則

- **TypeScript**: `.ts`および`.tsx` のファイル名は、`PascalCase` で命名すること

### 💻 TypeScript コーディング規則

- **必須**: `any`型の使用を禁止すること
- **必須**: 型の安全性を保つため、具体的な型定義を使用すること
- **推奨**: `unknown`、`object`、`Record<string, unknown>`等の適切な型を使用すること
- **例外**: 既存のライブラリの型定義が不完全な場合のみ、`// eslint-disable-next-line @typescript-eslint/no-explicit-any`コメントと共に一時的に許可

### 📝 コード生成・ファイル作成時のルール

- **必須**: ファイルの最終行は改行で終わること
- **必須**: 不要な空白行やインデントを挿入しないこと
- **必須**: リスト項目の後に不要な空白やプレースホルダーを残さないこと
- **必須**: マークダウンファイルでは適切な改行とスペーシングを保つこと
- **禁止**: テンプレートファイル作成時に `- ` や `1. ` の後に余分なスペースやプレースホルダーを入れること
- **禁止**: 不完全な構文（閉じられていないタグ、不適切なインデントなど）を残すこと

## 開発コマンド

- **開発サーバー**: `npm run dev`
- **本番ビルド**: `npm run build`
- **リンティング**: `npm run lint`
- **本番サーバー**: `npm run start`

## アーキテクチャ概要

これは**Next.js 15.3.5**プロジェクトで、**TypeScript**、**Tailwind CSS**、**shadcn/ui**、**Firebase**を使用し、メニュー管理システム向けの**Clean Architecture**アプローチで設計されています。

### レイヤードアーキテクチャ

プロジェクトは以下の 4 層構造で構成されます：

```
UI Layer (Components)
    ↓
Presenter Layer
    ↓
Service Layer
    ↓
Repository Layer
    ↓
External Data Source (Firebase, API)
```

#### 1. UI Layer（UI レイヤー）

- **責務**: ユーザーインターフェースの描画とユーザーインタラクション
- **技術**: React Components, Next.js App Router, Tailwind CSS, shadcn/ui
- **場所**: `components/`, `src/app/`
- **特徴**: プレゼンテーション専用、ビジネスロジックは含まない

#### 2. Presenter Layer（プレゼンターレイヤー）

- **責務**: UI の状態管理、イベントハンドリング、サービス層との橋渡し
- **技術**: React Hooks, Custom Hooks
- **場所**: `src/presenters/`
- **特徴**: UI とビジネスロジックの分離、テスタブルな状態管理

#### 3. Service Layer（サービスレイヤー）

- **責務**: ビジネスロジック、データ変換、複数リポジトリの組み合わせ
- **場所**: `src/services/`
- **特徴**: ドメイン固有のロジック、トランザクション管理

#### 4. Repository Layer（リポジトリレイヤー）

- **責務**: データアクセスの抽象化、Firebase/API クライアントの管理
- **場所**: `src/repositories/`
- **特徴**: データソースの詳細を隠蔽、型安全なデータアクセス

### 現在のファイル構造

```
src/
├── app/                     # Next.js App Router
│   ├── api/                 # API Routes
│   │   ├── daily_menu/      # 日次メニューAPI
│   │   ├── image/           # 画像API
│   │   ├── menu/            # メニューAPI
│   │   ├── monthly_menu/    # 月次メニューAPI
│   │   └── original_menu/   # オリジナルメニューAPI
│   ├── globals.css          # グローバルスタイル
│   ├── layout.tsx           # ルートレイアウト
│   └── page.tsx             # ホームページ
├── infrastructure/          # インフラ設定
│   └── firebase.ts          # Firebase設定
├── presenters/              # Presenter Layer
│   ├── CalendarPresenter.ts
│   ├── MenuListPresenter.ts
│   ├── MonthMenuPresenter.ts
│   └── OriginalMenuPresenter.ts
├── repositories/            # Repository Layer
│   ├── api/                 # API Repository
│   ├── firebase/            # Firebase Repository
│   │   ├── CalendarRepository.ts
│   │   ├── ImageRepository.ts
│   │   ├── MenuRepository.ts
│   │   └── MonthMenuRepository.ts
│   └── interfaces/          # Repository Interfaces
│       ├── CalendarMenuRepository.ts
│       ├── MenuRepository.ts
│       └── MonthMenuRepository.ts
├── services/                # Service Layer
│   ├── CalendarService.ts
│   ├── ChangeMenuService.ts
│   ├── ImageService.ts
│   ├── MenuService.ts
│   ├── MonthMenuService.ts
│   ├── OriginalMenuCRUDService.ts
│   └── OriginalMenuService.ts
├── types/                   # 型定義
│   └── Menu.ts
└── utils/                   # ユーティリティ

components/                  # UI Layer
├── ui/                      # UI Components
│   ├── ImageUpload.tsx
│   ├── PriceInput.tsx
│   ├── button.tsx
│   └── checkbox.tsx
├── Calendar.tsx
├── Header.tsx
├── MenuItemList.tsx
├── MenuList.tsx
├── MonthMenu.tsx
├── OriginalMenuEditForm.tsx
├── OriginalMenuList.tsx
├── RemainingMenuDialog.tsx
├── SettingTab.tsx
└── date.tsx
```

### コアデータモデル

**Menu スキーマ**: 基本情報（id、title、price）、カテゴリ情報（category）、サイズ情報（large、small）、エネルギー情報（energy）、画像情報（image）を含みます。

**MenuItem スキーマ**: メニューアイテムの詳細情報（item_code、title、price、category_id、image_url、large、small、energy）を持つ表示用の型です。

**OriginalMenu スキーマ**: ユーザーが作成したオリジナルメニューの情報を管理します。

### Firebase 設定

**Firebase 初期化**: プロジェクトは Firebase SDK を統合し、以下の機能を提供します：

**設定ファイル**:

- `src/infrastructure/firebase.ts`: Firebase 初期化設定

**Firebase 機能**:

- **Firestore**: メニューデータの永続化
- **Storage**: 画像ファイルの保存
- **Authentication**: ユーザー認証（設定済み）

**必要な環境変数**:

- `NEXT_PUBLIC_FIREBASE_API_KEY`: Firebase API Key
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: Firebase 認証ドメイン
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: Firebase プロジェクト ID
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`: Firebase Storage bucket
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`: Firebase Messaging sender ID
- `NEXT_PUBLIC_FIREBASE_APP_ID`: Firebase App ID

### データフロー

#### 作成処理のフロー

1. **UI Layer**: フォームデータを取得
2. **Presenter Layer**: Service に処理を委譲
3. **Service Layer**: バリデーション → ビジネスロジック適用
4. **Repository Layer**: Firebase に保存

#### 取得処理のフロー

1. **UI Layer**: 画面表示時にデータ要求
2. **Presenter Layer**: Service に処理を委譲
3. **Service Layer**: 必要に応じてデータ変換
4. **Repository Layer**: Firebase からデータ取得

#### 更新処理のフロー

1. **UI Layer**: 編集フォームデータを取得
2. **Presenter Layer**: Service に処理を委譲
3. **Service Layer**: 更新可能性チェック → 更新処理
4. **Repository Layer**: Firebase のデータ更新

#### 削除処理のフロー

1. **UI Layer**: 削除確認ダイアログ
2. **Presenter Layer**: Service に処理を委譲
3. **Service Layer**: 削除可能性チェック → 削除処理
4. **Repository Layer**: Firebase からデータ削除

### 実装時の注意点

#### DO（すべき）

- 各層の責務を明確に分離する
- インターフェースを使って依存関係を管理する
- エラーは適切な層で処理する
- 単一責任の原則を守る
- 各層でのテストを書く

#### DON'T（すべきでない）

- UI Layer でビジネスロジックを実装する
- Repository Layer でバリデーションを行う
- Service Layer で Firebase 固有の処理を直接実装する
- 層をスキップした直接的な依存関係を作る
- 上位層の詳細を下位層に持ち込む

### 重要な注意事項

- **パッケージマネージャー**: npm を使用（yarn/pnpm ではない）
- **Node.js**: 対応バージョンの使用を推奨
- **開発サーバー**: `npm run dev`で動作
- **API サーバー**: `http://localhost:3000/api`で動作（Next.js API ルート）
- **データベース**: Firebase Firestore + Firebase Storage
- **認証**: Firebase Authentication

## 主要な依存関係

### フロントエンド

- **React**: 18.3.1 - UI ライブラリ
- **Next.js**: 15.3.5 - React フレームワーク
- **TypeScript**: 5.5.3 - 型安全性
- **Tailwind CSS**: 3.4.10 - スタイリング

### UI/UX

- **shadcn/ui**: モダンなUIコンポーネントライブラリ
- **lucide-react**: 0.525.0 - アイコンライブラリ
- **react-icons**: 5.3.0 - アイコンライブラリ
- **@radix-ui**: コンポーネントライブラリ
- **@dnd-kit/core**: 6.1.0 - ドラッグアンドドロップ
- **clsx**: 2.1.1 - 条件付きクラス名管理
- **tailwind-merge**: 3.3.1 - TailwindCSSクラスのマージ
- **class-variance-authority**: 0.7.1 - バリアント管理

### データベース・認証

- **firebase**: 11.2.0 - Firebase SDK
- **react-select**: 5.8.2 - セレクトコンポーネント
- **wanakana**: 5.3.1 - 日本語変換ライブラリ

### 開発

- **ESLint**: 9.8.0 - コード品質チェック
- **TypeScript ESLint**: 8.0.0 - TypeScript 用 ESLint

### shadcn/ui 設定

**shadcn/ui コンポーネントシステム**: プロジェクトはモダンなUIコンポーネントライブラリ shadcn/ui を使用します：

**設定ファイル**:
- `components.json`: shadcn/ui 設定（New Yorkスタイル、TypeScript、Tailwind CSS変数使用）
- `lib/utils.ts`: クラス名結合用ユーティリティ（`cn`関数）

**利用可能なUIコンポーネント**:
- `Button`: 複数バリアント対応ボタン
- `Input`: 入力フィールドコンポーネント
- `Checkbox`: チェックボックスコンポーネント
- `ImageUpload`: 画像アップロードコンポーネント
- `PriceInput`: 価格入力コンポーネント

**コンポーネント配置**:
- `components/ui/`: shadcn/ui コンポーネント
- `@/components`, `@/lib/utils` などのパスエイリアス設定済み
