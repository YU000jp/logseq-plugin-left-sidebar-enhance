# Auto-adjust Markdown Heading Levels

## Overview

The **Auto-adjust Markdown Heading Levels** feature automatically normalizes Markdown heading levels (`#` to `######`) based on the actual outline depth in your document structure. This helps maintain consistent heading hierarchy throughout your notes.

## Key Features

- **Automatic Level Normalization**: Rewrites Markdown heading levels to match their position in the document hierarchy
- **Preset Configurations**: Choose from three predefined heading level ranges
- **H1 Reservation**: Option to reserve H1 for page titles
- **Source Rewriting**: Directly modifies the Markdown source for permanent changes
- **Compatible with Existing Features**: Works alongside existing heading numbering functions

## Configuration

### Enable the Feature

1. Open plugin settings
2. Navigate to "Page outline function" section
3. Enable "Auto-adjust heading levels"

### Heading Level Range Presets

Choose one of three preset ranges for heading normalization:

#### H2-H6 (Default)
- First level headings → H2
- Second level headings → H3
- Third level headings → H4
- Fourth level headings → H5
- Fifth+ level headings → H6

**Use case**: Reserve H1 for page titles, use H2-H6 for content structure

#### H1-H3
- First level headings → H1
- Second level headings → H2
- Third+ level headings → H3

**Use case**: Simple documents with limited hierarchy depth

#### H2-H4
- First level headings → H2
- Second level headings → H3
- Third+ level headings → H4

**Use case**: Moderate hierarchy with H1 reserved for titles

### Reserve H1 for Page Titles

When enabled, this option prevents H1 from being used in content. Even if a heading would normally be assigned H1 based on depth, it will be promoted to H2 instead.

**Note**: This option only has an effect when using a preset that includes H1, such as **H1-H3**. When using presets like H2-H6 or H2-H4, H1 is already excluded by the preset range, so this option has no additional effect.

This is useful for maintaining semantic HTML structure where each page should have only one H1 (the title).

## Usage

### Commands

Two commands are available via the command palette:

1. **Normalize headings on current page**
   - Normalizes all headings on the currently open page
   - Keyboard shortcut: Access via command palette

2. **Normalize headings in selection**
   - Normalizes headings in the selected block and its children
   - Keyboard shortcut: Access via command palette

### Algorithm

The normalization uses this formula:

```
level = clamp(minLevel + depth - 1, minLevel, maxLevel)
```

Where:
- `depth` = The heading's position in the outline hierarchy (1, 2, 3, ...)
- `minLevel` = Minimum heading level from preset (e.g., 2 for H2-H6)
- `maxLevel` = Maximum heading level from preset (e.g., 6 for H2-H6)

### Examples

**H2-H6 Preset:**
- Depth 1 → H2
- Depth 2 → H3
- Depth 3 → H4
- Depth 4 → H5
- Depth 5+ → H6

**H1-H3 Preset:**
- Depth 1 → H1
- Depth 2 → H2
- Depth 3+ → H3

## Compatibility

### With Existing Heading Numbering

The auto-heading-level feature is designed to work alongside the existing hierarchical heading numbering feature:

1. **Processing Order**: Heading level normalization → Heading numbering → TOC generation
2. **Independent Operations**: Both features can be enabled simultaneously
3. **No Conflicts**: Numbering is applied after level normalization
4. **Automatic Integration**: When both features are enabled, heading levels are automatically normalized before applying numbers on page load

#### Automatic Integration

When both "Auto-adjust heading levels" and "Enable heading numbering (file-update mode)" are enabled:

- **On Page Load**: Heading levels are automatically normalized first, then hierarchical numbers are applied
- **No Manual Action Required**: The normalization happens silently in the background
- **Consistent Hierarchy**: Ensures both heading levels and numbering reflect the correct document structure

This integration ensures that your heading numbers are always applied to properly leveled headings, maintaining semantic correctness.

### With TOC and Anchors

After normalizing heading levels, the table of contents and anchor links are automatically regenerated to reflect the new structure.

## Important Notes

### Initial State

The feature is **disabled by default** to preserve existing user behavior. You must explicitly enable it in settings.

### File-Based Graphs Only

This feature only works on file-based (local) Logseq graphs. It is not available for cloud-based graphs.

### Backup Recommendation

As this feature modifies your Markdown source files, it's recommended to:
- Commit your work to version control before bulk normalization
- Test on a single page first
- Review changes before proceeding with large-scale normalization

### Non-Heading Elements

The following elements are **not affected** by heading normalization:
- Paragraphs
- Code blocks
- Quotes
- Lists
- Page properties
- Tags

Only Markdown headings (lines starting with `#` to `######`) are processed.

## Troubleshooting

### Headings Not Changing

1. Verify the feature is enabled in settings
2. Check that you're using a file-based graph
3. Ensure the blocks contain valid Markdown headings
4. Check that the headings aren't already at the correct level

### Unexpected Heading Levels

1. Review your chosen preset setting
2. Check the "Reserve H1 for page title" option
3. Verify the heading hierarchy in your document
4. Remember: Depths beyond the max level are clamped to maxLevel

### Command Not Found

Make sure the plugin is fully loaded before accessing commands via the command palette.
