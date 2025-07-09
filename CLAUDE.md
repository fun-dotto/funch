# CLAUDE.md - Clean Architecture Layer Guidelines

## 概要

このドキュメントは、Firebase を使った Web アプリケーションにおける Clean Architecture の実装指針を定義します。各層の責務を明確に分離し、保守性・テスト性・拡張性を向上させることを目的としています。

## アーキテクチャ構成

```
┌─────────────────┐
│   UI Layer      │ ← ユーザーインターフェース
├─────────────────┤
│ Presenter Layer │ ← UI制御・状態管理
├─────────────────┤
│ Service Layer   │ ← ビジネスロジック
├─────────────────┤
│Repository Layer │ ← データアクセス
└─────────────────┘
```

## 各層の責務定義

### 1. UI Layer（UI コンポーネント層）

**責務**: 画面の描画とユーザーインタラクションの処理

**含むべき処理**:

- JSX/TSX による画面レンダリング
- ユーザーイベントの受け取り（onClick, onChange など）
- 表示用データの軽微な加工（日付フォーマット、表示文字列の変換など）
- ローディング状態、エラー状態の表示
- フォーム入力値の管理（useState での値保持）
- モーダル、ドロワーなどの UI 状態管理

**含まないべき処理**:

- データの永続化処理
- ビジネスルールの実装
- バリデーション処理
- 非同期処理の制御
- エラーハンドリングの詳細

**ファイル例**:

- `UserListView.tsx`
- `MenuCalendarView.tsx`
- `LoginFormView.tsx`

### 2. Presenter Layer（プレゼンター層）

**責務**: UI と Service の仲介、UI 固有のロジック処理

**含むべき処理**:

- Service Layer への処理委譲
- 非同期処理の制御（loading 状態管理）
- UI 固有のエラーハンドリング
- 複数の Service を組み合わせた処理
- UI 状態の管理（どの画面を表示するかなど）
- 成功・失敗メッセージの表示制御
- 確認ダイアログの制御
- フォームデータの Service への受け渡し

**含まないべき処理**:

- ビジネスロジック
- データベース操作
- バリデーション処理
- 実際の画面描画

**ファイル例**:

- `UserPresenter.ts`
- `MenuCalendarPresenter.ts`
- `LoginPresenter.ts`

### 3. Service Layer（サービス層）

**責務**: ビジネスロジックとドメイン固有の処理

**含むべき処理**:

- ビジネスルールの実装
- データのバリデーション
- 複数 Repository の組み合わせ処理
- トランザクション制御
- ドメインエンティティの生成・変換
- 重複チェック、存在チェック
- 権限チェック
- 計算処理（合計、平均など）
- 状態遷移の管理
- ビジネス例外の発生

**含まないべき処理**:

- Firebase 固有の処理
- UI 固有の処理
- 画面制御
- 外部 API 通信（Repository で実装）

**ファイル例**:

- `UserService.ts`
- `MenuService.ts`
- `AuthService.ts`

### 4. Repository Layer（レポジトリ層）

**責務**: データの永続化とデータアクセス

**含むべき処理**:

- Firebase CRUD 操作（create, read, update, delete）
- Firestore クエリの実行
- データの型変換（Entity ↔ Firestore Document）
- バッチ処理
- リアルタイム更新の監視
- インデックス最適化
- 外部 API 通信
- キャッシュ処理
- 接続エラーのハンドリング

**含まないべき処理**:

- ビジネスロジック
- バリデーション
- UI 制御
- 複雑な計算処理

**ファイル例**:

- `FirebaseUserRepository.ts`
- `FirebaseMenuRepository.ts`
- `LocalStorageRepository.ts`

## 層間の依存関係

### 依存の方向

```
UI Layer → Presenter Layer → Service Layer → Repository Layer
```

### インターフェース設計

- 各層は下位層のインターフェースに依存する
- 上位層は下位層の具体実装を知らない
- Repository は interface として定義し、DI で注入する

## データフロー

### 作成処理のフロー

1. **UI Layer**: フォームデータを取得
2. **Presenter Layer**: Service に処理を委譲
3. **Service Layer**: バリデーション → ビジネスロジック適用
4. **Repository Layer**: Firebase に保存

### 取得処理のフロー

1. **UI Layer**: 画面表示時にデータ要求
2. **Presenter Layer**: Service に処理を委譲
3. **Service Layer**: 必要に応じてデータ変換
4. **Repository Layer**: Firebase からデータ取得

### 更新処理のフロー

1. **UI Layer**: 編集フォームデータを取得
2. **Presenter Layer**: Service に処理を委譲
3. **Service Layer**: 更新可能性チェック → 更新処理
4. **Repository Layer**: Firebase のデータ更新

### 削除処理のフロー

1. **UI Layer**: 削除確認ダイアログ
2. **Presenter Layer**: Service に処理を委譲
3. **Service Layer**: 削除可能性チェック → 削除処理
4. **Repository Layer**: Firebase からデータ削除

## エラーハンドリング

### エラーの種類と処理層

- **ValidationError**: Service Layer で生成、Presenter Layer で UI 用メッセージに変換
- **BusinessError**: Service Layer で生成、Presenter Layer で UI 用メッセージに変換
- **NotFoundError**: Repository Layer で生成、Service Layer で適切な処理
- **NetworkError**: Repository Layer で生成、Presenter Layer で再試行制御

### エラーハンドリングの流れ

1. **Repository Layer**: 技術的エラーを検出・変換
2. **Service Layer**: ビジネスエラーを検出・生成
3. **Presenter Layer**: UI 用エラーメッセージに変換・表示制御
4. **UI Layer**: エラーメッセージを表示

## ファイル構成例

```
src/
├── components/           # UI Layer
│   ├── UserListView.tsx
│   ├── MenuCalendarView.tsx
│   └── common/
├── presenters/          # Presenter Layer
│   ├── UserPresenter.ts
│   ├── MenuCalendarPresenter.ts
│   └── types/
├── services/            # Service Layer
│   ├── UserService.ts
│   ├── MenuService.ts
│   └── errors/
├── repositories/        # Repository Layer
│   ├── interfaces/
│   ├── firebase/
│   └── local/
└── types/              # 共通型定義
```

## 実装時の注意点

### DO（すべき）

- 各層の責務を明確に分離する
- インターフェースを使って依存関係を管理する
- エラーは適切な層で処理する
- 単一責任の原則を守る
- 各層でのテストを書く

### DON'T（すべきでない）

- UI Layer でビジネスロジックを実装する
- Repository Layer でバリデーションを行う
- Service Layer で Firebase 固有の処理を直接実装する
- 層をスキップした直接的な依存関係を作る
- 上位層の詳細を下位層に持ち込む

## まとめ

この指針に従うことで、以下の利点が得られます：

1. **保守性**: 各層の責務が明確で変更しやすい
2. **テスト性**: 各層を独立してテストできる
3. **拡張性**: 新機能追加時に適切な層に実装できる
4. **可読性**: コードの意図が明確になる
5. **再利用性**: 各層のコンポーネントを他の機能でも使用できる

各層の責務を守り、依存関係を正しく管理することで、スケーラブルで保守性の高いアプリケーションを構築できます。
