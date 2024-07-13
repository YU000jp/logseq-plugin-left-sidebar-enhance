# Logseq プラグイン: Left Sidebar Enhance 

<div align="right">
 
[English](https://github.com/YU000jp/logseq-plugin-left-sidebar-enhance)|[日本語](https://github.com/YU000jp/logseq-plugin-left-sidebar-enhance/blob/main/readme.ja.md) [![latest release version](https://img.shields.io/github/v/release/YU000jp/logseq-plugin-left-sidebar-enhance)](https://github.com/YU000jp/logseq-plugin-left-sidebar-enhance/releases)
[![License](https://img.shields.io/github/license/YU000jp/logseq-plugin-left-sidebar-enhance?color=blue)](https://github.com/YU000jp/logseq-plugin-left-sidebar-enhance/LICENSE)
[![Downloads](https://img.shields.io/github/downloads/YU000jp/logseq-plugin-left-sidebar-enhance/total.svg)](https://github.com/YU000jp/logseq-plugin-left-sidebar-enhance/releases)
 公開日: 20231002 <a href="https://www.buymeacoffee.com/yu000japan"><img src="https://img.buymeacoffee.com/button-api/?text=Buy me a pizza&emoji=🍕&slug=yu000japan&button_colour=FFDD00&font_colour=000000&font_family=Poppins&outline_colour=000000&coffee_colour=ffffff" /></a>
 </div>

## 機能オプション

1. ページの目次
   - 開いたページのマークダウンに含まれるヘッダー(`#`,`##`,`###`,`####`,`#####`,`######`)から生成した目次を、左メニューに自動的に表示します
     > **マークダウンのヘッダーを挿入するショートカット・コマンド** -> `Alt+1` `Alt+2` `Alt+3` `Alt+4` `Alt+5` `Alt+6`

   ![image](https://github.com/YU000jp/logseq-plugin-left-sidebar-enhance/assets/111847207/d5da0ec4-41cc-4c17-ae1b-9853fd040661)

   - Tip:
     1. Ctrlキーを押しながらクリックすると、ブロックズームまたは単一のジャーナルを開くことができます。
     1. サイドバーで開くには、Shiftキーを押しながらクリックします。
   - Note:
     1. 日誌では、目次ではなくスクロールで読み込まれている日付のみが表示されます。目次機能をつかうのは、シングルページを開いてください。

1. マウスオーバーで、左メニューを自動で隠す (デフォルト: **無効**)
   > 左上の隅にある ![画像](https://github.com/YU000jp/logseq-plugin-left-sidebar-enhance/assets/111847207/8e3efccf-27e9-4332-b431-9765a69463a9) ボタンを使ってください。

1. ジャーナルの日付へのアクセス (デフォルト: **無効**)

   ![画像](https://github.com/YU000jp/logseq-plugin-left-sidebar-enhance/assets/111847207/ec42967a-4c66-4d02-9765-782772dbb18e)

   1. 日付セレクタ
      - 日次ページ(デイリージャーナル)へのアクセス
   1. 月のセレクタ
      -  (`yyyy/MM`) のような月次ジャーナルへのアクセス

---

## はじめに

Logseq マーケットプレースからインストール

- ツールバーにある [`---`] を押して [`プラグイン`] を開きます。マーケットプレースを選択します。検索フィールドに `Left` と入力し、検索結果から選択してインストールします。

### 使用方法

- 目次: 各ページを開くと、左サイドバーのメニューに自動的に目次が表示されます。
- マウスオーバー: 左上の隅にある ![画像](https://github.com/YU000jp/logseq-plugin-left-sidebar-enhance/assets/111847207/8e3efccf-27e9-4332-b431-9765a69463a9) ボタンをクリックします。左サイドバーの状態が切り替わります。
- プラグインの設定で、各機能のオン・オフをおこなってください。

---

## ショーケース / 質問 / アイデア / ヘルプ

> この種のことを尋ねたり見つけたりするために、[ディスカッション](https://github.com/YU000jp/logseq-plugin-left-sidebar-enhance/discussions) タブに移動してください。

- マウスオーバーの種類
  1. タイプ A: マウスが左隅付近のスペースに近づくと開きます。
     > ⚠️ウィンドウが小さい場合、問題が発生する可能性があります。
  1. タイプ B (推奨): 左端の行にマウスを置くと開きます。

- おすすめ
  1. [sethyuan / Favorite Tree プラグイン](https://github.com/sethyuan/logseq-plugin-favorite-tree)

## 先行技術とクレジット

- CSSコード（マウスオーバーで左サイドバーを表示） >
  1. Aタイプ: [@mæn](https://discord.com/channels/725182569297215569/775936939638652948/1155251493486727338)
  1. Bタイプ (デフォルト): [@sethyuan](https://github.com/YU000jp/logseq-plugin-left-sidebar-enhance/issues/1#issue-1910716211)
- Logseq プラグイン >
  1. [@hkgnp/ logseq-toc-plugin](https://github.com/hkgnp/logseq-toc-plugin/) (目次表示)
  1. [@freder/ logseq-plugin-jump-to-block](https://github.com/freder/logseq-plugin-jump-to-block/) (目次表示)
- 製作者: [@YU000jp](https://github.com/YU000jp)

