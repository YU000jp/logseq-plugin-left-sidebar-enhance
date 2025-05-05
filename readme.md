# Logseq Plugin: Left Sidebar Enhance

> [!NOTE]
> This plugin works on Logseq db version.

<div align="right">

[English](https://github.com/YU000jp/logseq-plugin-left-sidebar-enhance)|[日本語](https://github.com/YU000jp/logseq-plugin-left-sidebar-enhance/blob/main/readme.ja.md) [![latest release version](https://img.shields.io/github/v/release/YU000jp/logseq-plugin-left-sidebar-enhance)](https://github.com/YU000jp/logseq-plugin-left-sidebar-enhance/releases)
[![License](https://img.shields.io/github/license/YU000jp/logseq-plugin-left-sidebar-enhance?color=blue)](https://github.com/YU000jp/logseq-plugin-left-sidebar-enhance/LICENSE)
[![Downloads](https://img.shields.io/github/downloads/YU000jp/logseq-plugin-left-sidebar-enhance/total.svg)](https://github.com/YU000jp/logseq-plugin-left-sidebar-enhance/releases)
 Released: 20231002 <a href="https://www.buymeacoffee.com/yu000japan"><img src="https://img.buymeacoffee.com/button-api/?text=Buy me a pizza&emoji=🍕&slug=yu000japan&button_colour=FFDD00&font_colour=000000&font_family=Poppins&outline_colour=000000&coffee_colour=ffffff" /></a>
</div>

### Main Features

This plugin provides three main features:

1. Page Outline (:Table of contents :Auto-generated)
2. Auto-hide/show Left Sidebar
3. Date Access (Daily & Monthly)

---

1. **Page Outline Feature**
   - Automatically displays a Page Outline in the left menu, generated from headers in the opened page's content
   > (Markdown headers: `#`,`##`,`###`,`####`,`#####`,`######`)
   
   Quick Actions:
   - Click: Jump to header position
   - Ctrl+Click: Open as zoom page
   - Shift+Click: Open in right sidebar
   - Shortcut keys (MD version only): `Alt+1` to `Alt+6` to insert headers

   ![image](https://github.com/YU000jp/logseq-plugin-left-sidebar-enhance/assets/111847207/d5da0ec4-41cc-4c17-ae1b-9853fd040661)

2. Auto-hide Left Menu on Mouse Over (Default: **Disabled**)
   > Use the ![image](https://github.com/YU000jp/logseq-plugin-left-sidebar-enhance/assets/111847207/8e3efccf-27e9-4332-b431-9765a69463a9) button in the top-left corner.

3. Journal Date Access (Default: **Disabled**) db version ✖

   ![image](https://github.com/YU000jp/logseq-plugin-left-sidebar-enhance/assets/111847207/ec42967a-4c66-4d02-9765-782772dbb18e)

   - Date selector: Access to date pages
   - Month selector: Access to monthly journals (like `yyyy/MM`)

---

### Installation

Install from Logseq Marketplace

- Click [`---`] on the toolbar to open [`Plugins`]. Select Marketplace. Type `Left` in the search field and select it from the results to install.

### Usage

- Page Outline: When opening any page, the TOC automatically appears in the left sidebar menu.
   - How it works:
      > Automatically detects both Markdown (#) and Logseq DB format headers
      - Updates automatically when content changes
      - Click to scroll to header position
   - Note:
     - By default, when opening the journal, it shows a list of dates loaded by scrolling. To view the TOC, open a date page.
     > Turn off this option in plugin settings to show header list for the current day's page.
- Mouse Over: Click the ![image](https://github.com/YU000jp/logseq-plugin-left-sidebar-enhance/assets/111847207/8e3efccf-27e9-4332-b431-9765a69463a9) button in the top-left corner. The left sidebar state will toggle. Shortcut keys work the same way.
- Use plugin settings to enable/disable each feature.

### User Settings

1. Hide Duplicates in Favorites and History
   - Automatically hides duplicates between favorites and recent items
   > Checks for duplicates on plugin startup and every 10 minutes

2. Left Sidebar Mouse Over Feature
   - Enable/disable auto-show left sidebar on mouse over
   - Select display type: Type A (Corner Hover) or Type B (Edge Hover)
   - Mouse Over Types
      1. Type A: Opens when mouse approaches the left corner area
         > ⚠️May cause issues with small windows
      1. Type B (Recommended): Opens when mouse is placed on the leftmost column

3. Date Selector
   - Enable/disable date selector feature in left sidebar
   > Not supported in Logseq db version

4. Page Outline (TOC) Feature
   - Enable/disable TOC feature
   - Open as zoom page by default
     > If disabled, Ctrl+Click for zoom page view
   - Mouse over highlight feature
     - Highlight corresponding block when hovering over header
     - Highlight corresponding header when hovering over block
   - Show date list in journal pages
   - List of words to exclude from TOC (line-separated)

---

## Showcase / Questions / Ideas / Help

> Head to the [Discussion](https://github.com/YU000jp/logseq-plugin-left-sidebar-enhance/discussions) tab to ask and find this kind of things.

- Recommended
  1. [sethyuan / Favorite Tree Plugin](https://github.com/sethyuan/logseq-plugin-favorite-tree)

## Prior Art & Credit

- CSS code (Show left sidebar on mouse over) >
  1. Type A: [@mæn](https://discord.com/channels/725182569297215569/775936939638652948/1155251493486727338)
  1. Type B (Default): [@sethyuan](https://github.com/YU000jp/logseq-plugin-left-sidebar-enhance/issues/1#issue-1910716211)
- Logseq Plugin >
  1. [@hkgnp/ logseq-toc-plugin](https://github.com/hkgnp/logseq-toc-plugin/) (TOC display)
  1. [@freder/ logseq-plugin-jump-to-block](https://github.com/freder/logseq-plugin-jump-to-block/) (TOC display)
- Author: [@YU000jp](https://github.com/YU000jp)
