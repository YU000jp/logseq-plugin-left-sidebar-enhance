# Logseq Plugin: Left-Sidebar Enhance

[English](https://github.com/YU000jp/logseq-plugin-left-sidebar-enhance) | [日本語](https://github.com/YU000jp/logseq-plugin-left-sidebar-enhance/blob/main/readme.ja.md)

Includes some features such as mouse over to show left sidebar.

[![latest release version](https://img.shields.io/github/v/release/YU000jp/logseq-plugin-left-sidebar-enhance)](https://github.com/YU000jp/logseq-plugin-left-sidebar-enhance/releases)
[![License](https://img.shields.io/github/license/YU000jp/logseq-plugin-left-sidebar-enhance?color=blue)](https://github.com/YU000jp/logseq-plugin-left-sidebar-enhance/LICENSE)
[![Downloads](https://img.shields.io/github/downloads/YU000jp/logseq-plugin-left-sidebar-enhance/total.svg)](https://github.com/YU000jp/logseq-plugin-left-sidebar-enhance/releases)
 Published 2023/10/02

## Options

1. Table Of Contents in left sidebar
   > Use markdown headers #,##,###,####,#####,######

   ![image](https://github.com/YU000jp/logseq-plugin-left-sidebar-enhance/assets/111847207/d5da0ec4-41cc-4c17-ae1b-9853fd040661)

1. mouse over to show left sidebar (default: *Disable*)
   > Enable toggling of ![image](https://github.com/YU000jp/logseq-plugin-left-sidebar-enhance/assets/111847207/8e3efccf-27e9-4332-b431-9765a69463a9) button in the top-left corner. (Use it if using the width adjustment feature in "favorite tree" plugin)

1. Easy access to Journal-dates (default: *Disable*)

   ![image](https://github.com/YU000jp/logseq-plugin-left-sidebar-enhance/assets/111847207/ec42967a-4c66-4d02-9765-782772dbb18e)

   1. Date selector
      - Access single journal page

   1. Month selector
      - Access a hierarchical page (`yyyy/MM`)
      - For monthly Journal

---

## Getting Started

Install from Logseq Marketplace

  - Press [`---`] on the top right toolbar to open [`Plugins`]. Select marketplace. Type `Left` in the search field, select it from the search results and install.

### Usage

- Click ![image](https://github.com/YU000jp/logseq-plugin-left-sidebar-enhance/assets/111847207/8e3efccf-27e9-4332-b431-9765a69463a9)
 button in the top-left corner. The state of left sidebar will switch.
- Some features are turned on. If not need it, turn it off in the plugin settings.

---

## Showcase / Questions / Ideas / Help

> Go to the [discussion](https://github.com/YU000jp/logseq-plugin-left-sidebar-enhance/discussions) tab to ask and find this kind of things.

1. This plugin relies on Logseq's DOM (Document Object Model) structure. If the DOM structure changes due to a Logseq version update, styles may not be applied. We will adjust the CSS to deal with it. If you notice something, please raise an issue.
1. Type of mouse over
   1. Type A: It opens when the mouse approaches the space near the left corner.
      > ⚠️If the window is small, problems may occur.
   1. Type B: It opens when hover the mouse over the leftmost line.
1. Recommended
   1. [sethyuan / Favorite tree plugin](https://github.com/sethyuan/logseq-plugin-favorite-tree)

## Prior art & Credit

- CSS code (mouse over to show left sidebar) >
   1. Type A: [@mæn](https://discord.com/channels/725182569297215569/775936939638652948/1155251493486727338) 
   1. Type B (default): [@sethyuan](https://github.com/YU000jp/logseq-plugin-left-sidebar-enhance/issues/1#issue-1910716211)
1. "Table of contents" feature:
   1. [@hkgnp/ logseq-toc plugin](https://github.com/hkgnp/logseq-toc-plugin/)
   1. [@freder/ logseq-plugin-jump-to-block plugin](https://github.com/freder/logseq-plugin-jump-to-block/)
- Author > [@YU000jp](https://github.com/YU000jp)

<a href="https://www.buymeacoffee.com/yu000japan"><img src="https://img.buymeacoffee.com/button-api/?text=Buy me a pizza&emoji=🍕&slug=yu000japan&button_colour=FFDD00&font_colour=000000&font_family=Poppins&outline_colour=000000&coffee_colour=ffffff" /></a>
