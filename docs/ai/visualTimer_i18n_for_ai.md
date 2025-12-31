# visualTimer — AI向け翻訳キー追加ガイド

目的
- AI や自動化ツールが `visualTimer` の翻訳キーを安全かつ一貫して追加・更新できるように、ファイル配置、命名規則、手順、テスト方法を明示する。

重要なファイル
- マスタ一覧（AIが編集するメインファイル）: `src/visualTimer/translations/keys.json`
- 実際の翻訳ファイル（人または翻訳システムが編集）:
  - 英語: `src/visualTimer/translations/en.json`
  - 日本語: `src/visualTimer/translations/ja.json`

命名規則（重要）
- プレフィックス: 全て `visualTimer.` で始める。
  - 例: `visualTimer.title.dayWindow`, `visualTimer.unit.hourShort`
- セマンティクス: カテゴリは `title`, `sub`, `unit`, `label`, `error` 等を使う。
  - `visualTimer.title.*` — 見出しやカードタイトル
  - `visualTimer.sub.*` — サブテキスト／説明文
  - `visualTimer.unit.*` — 単位短縮（例: `dayShort`）
- 英語のキー名を直接文字列として使わない（キーと翻訳を分離すること）。

値のフォーマット
- 値は短く簡潔に。UI 表示用の文言を入れる。
- フォーマット文字列や変数埋め込みは避ける（現状プラグイン内でテンプレ化は行わない）。
- 日付や数値はコード側で整形する（例: 日付は `YYYY/MM/DD` に変換してタイトルに連結するなど）。

AIによる追加・更新手順（推奨ワークフロー）
1. `src/visualTimer/translations/keys.json` を更新する（新しいキーと英語文言を追加）。
   - 既存キーと重複しないかチェックする。
2. `src/visualTimer/translations/en.json` にキーと英語文言を追加する（keys.json と整合）。
3. 翻訳担当がいない場合は `src/visualTimer/translations/ja.json` に暫定訳（自動翻訳）を追加しても良い。
4. 変更をコミット（下部のコミットメッセージ推奨フォーマットを参照）。
5. ビルド確認: リポジトリルートで `pnpm build` を実行してエラーがないことを確認する。

コード内の利用例
- 表示には必ず `t("キー名")` を使う。例:
  - `t("visualTimer.title.dayWindow")`
  - `t("visualTimer.unit.hourShort")`

テスト手順（簡易）
1. 変更をコミットする前にローカルでビルド:
```powershell
pnpm build
```
2. ビルドが成功すれば、Logseq 上でプラグインを読み込み、UI 表示を確認する。

注意点 / 禁止事項
- コード内に日本語を直接書かない（常に `t()` と翻訳キーを使う）。
- キーの命名を途中で変えない（既存キーを変更すると既存翻訳が失われる）。
- マスタファイル `keys.json` は AI が追加・提案する“出発点”として扱い、最終的には `en.json`/`ja.json` を人間がレビューすること。

コミットメッセージ推奨フォーマット
- Add key: `i18n(visualTimer): add visualTimer.title.newKey — <short description>`
- Update key: `i18n(visualTimer): update visualTimer.unit.hourShort — <reason>`

担当者向けメモ（人間レビュー）
- AI が `keys.json` に追加したら、翻訳担当者は `en.json` と `ja.json` の同一キーをレビューし、自然な表現に修正すること。

以上。必要なら、このガイドを CI ステップ（`keys.json` と `en.json` の整合チェック）やプルリクテンプレートに統合するための追加作業を行います。