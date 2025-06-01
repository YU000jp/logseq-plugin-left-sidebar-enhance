# Logseq プラグイン: Left Sidebar Enhance 

> [!NOTE]
>このプラグインはLogseq dbバージョンで動作します。

<div align="right">
 
[English](https://github.com/YU000jp/logseq-plugin-left-sidebar-enhance)|[日本語](https://github.com/YU000jp/logseq-plugin-left-sidebar-enhance/blob/main/readme.ja.md) [![latest release version](https://img.shields.io/github/v/release/YU000jp/logseq-plugin-left-sidebar-enhance)](https://github.com/YU000jp/logseq-plugin-left-sidebar-enhance/releases)
[![License](https://img.shields.io/github/license/YU000jp/logseq-plugin-left-sidebar-enhance?color=blue)](https://github.com/YU000jp/logseq-plugin-left-sidebar-enhance/LICENSE)
[![Downloads](https://img.shields.io/github/downloads/YU000jp/logseq-plugin-left-sidebar-enhance/total.svg)](https://github.com/YU000jp/logseq-plugin-left-sidebar-enhance/releases)
 公開日: 20231002 <a href="https://www.buymeacoffee.com/yu000japan"><img src="https://img.buymeacoffee.com/button-api/?text=Buy me a pizza&emoji=🍕&slug=yu000japan&button_colour=FFDD00&font_colour=000000&font_family=Poppins&outline_colour=000000&coffee_colour=ffffff" /></a>
 </div>

### 主な機能

プラグインとして3つの主要機能を提供:

1. 目次機能（自動生成）
2. 左サイドバーの自動表示/非表示機能 
3. 日付アクセス機能（日付・月次）

---

1. **ページアウトライン機能**
   - 開いたページのコンテンツに含まれるヘッダーから生成した目次を、左メニューに自動的に表示します
   >  (見出しのマークダウン: `#`,`##`,`###`,`####`,`#####`,`######`) 
   
   クイックアクション：
   - クリック：ヘッダーの位置へジャンプ
   - Ctrlクリック：ズームページとして開く
   - Shiftクリック：右サイドバーで開く
   - ショートカットキー（MDバージョンのみ）：`Alt+1`から`Alt+6`でヘッダーを挿入

   ![image](https://github.com/YU000jp/logseq-plugin-left-sidebar-enhance/assets/111847207/d5da0ec4-41cc-4c17-ae1b-9853fd040661)



2. マウスオーバーで、左メニューを自動で隠す (デフォルト: **無効**)
   > 左上の隅にある ![画像](https://github.com/YU000jp/logseq-plugin-left-sidebar-enhance/assets/111847207/8e3efccf-27e9-4332-b431-9765a69463a9) ボタンを使ってください。

3. 日誌(ジャーナル)の日付へのアクセス (デフォルト: **無効**)  dbバージョン ✖

   ![画像](https://github.com/YU000jp/logseq-plugin-left-sidebar-enhance/assets/111847207/ec42967a-4c66-4d02-9765-782772dbb18e)

   - 日付セレクタ：日付ページへのアクセス
   - 月のセレクタ：(`yyyy/MM`) のような月次ジャーナルへのアクセス

---

### インストール方法

Logseq マーケットプレースからインストール

- ツールバーにある [`---`] を押して [`プラグイン`] を開きます。マーケットプレースを選択します。検索フィールドに `Left` と入力し、検索結果から選択してインストールします。

### 使用方法

- 目次: 各ページを開くと、左サイドバーのメニューに自動的に目次が表示されます。
   - 動作の仕組み：
      > マークダウン形式(#)とLogseq DB形式の両方のヘッダーを自動検出
      - コンテンツが変更されると自動的に更新
      - クリックでヘッダーの位置へスクロール
   - Note:
     - デフォルトでは、日誌を開いたときに、スクロールで読み込まれている日付の一覧を表示します。目次を表示させたい場合は、日付ページを開いてください。
     > プラグイン設定で、その項目をオフにすると、当日のページに関するヘッダーリストを表示します。
- マウスオーバー: 左上の隅にある ![画像](https://github.com/YU000jp/logseq-plugin-left-sidebar-enhance/assets/111847207/8e3efccf-27e9-4332-b431-9765a69463a9) ボタンをクリックします。左サイドバーの状態が切り替わります。ショートカットキーでも同様に動作します。
- プラグインの設定で、各機能のオン・オフをおこなってください。

### ユーザー設定

1. お気に入りと履歴の重複を非表示
   - お気に入りと最近の項目における重複を自動的に非表示にします
   > プラグイン起動時と10分ごとに重複チェックを実行

2. 左サイドバーのマウスオーバー機能
   - マウスオーバーで左サイドバーを表示する機能の有効/無効
   - 表示タイプの選択：タイプA（コーナーホバー）またはタイプB（エッジホバー）
      - マウスオーバーの種類
         1. タイプ A: マウスが左隅付近のスペースに近づくと開きます。
            > ⚠️ウィンドウが小さい場合、問題が発生する可能性があります。
         1. タイプ B (推奨): 左端の列にマウスを置くと開きます。
3. 日付セレクター
   - 左サイドバーの日付セレクター機能を有効/無効
   > Logseq dbバージョンでは非対応

4. ページアウトライン（目次）機能
   - 目次機能の有効/無効
   - デフォルトでズームページとして開く
     > 無効の場合、Ctrlキーを押しながらクリックでズームページ表示
   - マウスオーバー時のハイライト機能
     - ヘッダーにマウスオーバーした時の対応ブロックのハイライト
     - ブロックにマウスオーバーした時の対応ヘッダーのハイライト
   - ジャーナルページでの日付リスト表示
   - 目次から除外する単語のリスト（改行区切りで入力）

---

## ショーケース / 質問 / アイデア / ヘルプ

> この種のことを尋ねたり見つけたりするために、[ディスカッション](https://github.com/YU000jp/logseq-plugin-left-sidebar-enhance/discussions) タブに移動してください。

### 関連プラグイン

- [ログ検索プラグイン](https://github.com/YU000jp/logseq-plugin-logging-search)
  > 完全にレンダリングされた結果を表示するクエリベースの検索プラグイン。左メニューに検索ボックスを追加。

## 先行技術とクレジット

- CSSコード（マウスオーバーで左サイドバーを表示） >
  1. Aタイプ: [@mæn](https://discord.com/channels/725182569297215569/775936939638652948/1155251493486727338)
  1. Bタイプ (デフォルト): [@sethyuan](https://github.com/YU000jp/logseq-plugin-left-sidebar-enhance/issues/1#issue-1910716211)
- Logseq プラグイン >
  1. [@hkgnp/ logseq-toc-plugin](https://github.com/hkgnp/logseq-toc-plugin/) (目次表示)
  1. [@freder/ logseq-plugin-jump-to-block](https://github.com/freder/logseq-plugin-jump-to-block/) (目次表示)
- 製作者: [@YU000jp](https://github.com/YU000jp)

