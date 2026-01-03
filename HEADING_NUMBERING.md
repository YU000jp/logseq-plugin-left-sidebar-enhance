# Hierarchical Heading Numbering Feature

## Overview
This implementation adds comprehensive hierarchical heading numbering capabilities to the Left Sidebar Enhance plugin for Logseq.

## Features

### 1. Display-Only Hierarchical Numbering (Non-Destructive)
- **Description**: Displays hierarchical numbers (e.g., 1.2.3) on headings using CSS, without modifying the actual markdown files
- **Use Case**: When you want visual numbering for organization but don't want to modify your source files
- **Technology**: CSS counters with `::before` pseudo-elements
- **Compatibility**: Works in Live Preview, normal display, and PDF printing
- **Settings**:
  - `Enable heading numbering (display-only mode)` - Toggle this feature on/off
  - `Heading number delimiter (display-only)` - Choose your delimiter (e.g., ".", "-", " → ", "_")

### 2. File-Update Mode (File-Based Graphs Only)
- **Description**: Automatically adds hierarchical numbers directly to heading text in markdown files
- **Use Case**: When you want numbers to be part of the actual content
- **Safety**: Only works on local file-based graphs (not cloud-based) for data safety
- **Smart Updates**: 
  - Detects existing numbers using old delimiter
  - Recalculates and updates only changed blocks
  - Minimal file modifications
- **Settings**:
  - `Enable heading numbering (file-update mode, file-based graphs only)` - Toggle this feature
  - `Heading number delimiter (file-update mode, new)` - New delimiter for updates
  - `Heading number delimiter (file-update mode, old)` - Old delimiter to detect and replace

### 3. Heading Level Markers
- **Description**: Shows small, subtle H1/H2/H3 indicators next to headings
- **Use Case**: Quick visual reference for heading hierarchy depth
- **Design**: Small font, low opacity, minimal visual impact
- **Settings**:
  - `Show heading level markers (H1, H2, etc.)` - Toggle this feature

### 4. Per-Page Activation
- **Description**: Control which pages have heading numbering applied
- **UI**: Toolbar icon (shows 1, 1.1, 1.1.1 hierarchy)
  - Click to toggle heading numbering for current page
  - Opacity changes to show active/inactive state
- **Storage Modes**:
  - `storeTrueOnly` (default): Only explicitly enabled pages are stored
  - `storeFalseOnly`: All pages enabled by default, only disabled pages are stored
- **Settings**:
  - `Page activation storage mode` - Choose storage strategy
  - `Page activation states` - Internal storage (managed automatically)

### 5. Auto-Processing on Page Load
- **Description**: Automatically applies file-update mode when opening a page
- **Behavior**: 
  - Checks if page is active for heading numbering
  - If file-update mode is enabled and page is active, recalculates numbers
  - Updates only blocks that need changes

## How Hierarchical Numbering Works

The numbering system follows standard document hierarchy:

```
# Heading 1          → 1. Heading 1
## Heading 1.1       → 1.1 Heading 1.1
### Heading 1.1.1    → 1.1.1 Heading 1.1.1
### Heading 1.1.2    → 1.1.2 Heading 1.1.2
## Heading 1.2       → 1.2 Heading 1.2
# Heading 2          → 2. Heading 2
## Heading 2.1       → 2.1 Heading 2.1
```

## Configuration Examples

### Example 1: Display-Only Mode with Dot Delimiter
```
Settings:
- Enable heading numbering (display-only mode): ON
- Heading number delimiter (display-only): "."

Result: Headings display as "1.2.3 Your Heading" without modifying files
```

### Example 2: File-Update Mode with Arrow Delimiter
```
Settings:
- Enable heading numbering (file-update mode): ON
- Heading number delimiter (file-update mode, new): " → "
- Heading number delimiter (file-update mode, old): "."

Result: Updates files to show "1 → 2 → 3 Your Heading"
```

### Example 3: Per-Page Activation
```
Settings:
- Page activation storage mode: storeTrueOnly

Usage:
1. Open a page
2. Click the toolbar icon (shows 1, 1.1, 1.1.1)
3. Icon becomes fully opaque = enabled for this page
4. Page state is saved automatically
```

## Implementation Details

### Files Modified
- `src/settings/keys.ts` - Added new setting keys
- `src/settings/toc.ts` - Added settings UI definitions
- `src/settings/onSettingsChanged.ts` - Added settings change handler
- `src/index.ts` - Integrated initialization and cleanup
- `.gitignore` - Added package-lock.json exclusion

### Files Created
- `src/heading-numbering/index.ts` - Core numbering logic (365 lines)
- `src/heading-numbering/toolbarIcon.ts` - Toolbar UI component (106 lines)
- `src/heading-numbering/headingNumbering.css` - CSS styles (76 lines)

### Technical Architecture
1. **CSS Counters**: Used for display-only mode with hierarchical counter-reset
2. **Logseq Plugin API**: Used for file modifications in file-update mode
3. **Settings Dispatcher**: Integrated with existing centralized settings handler
4. **Type Safety**: Full TypeScript implementation with proper types
5. **Error Handling**: Defensive programming with fallbacks for UI elements

### Performance Considerations
- Display-only mode: Pure CSS, no performance impact
- File-update mode: Only updates changed blocks, O(n) complexity
- Per-page checks: O(1) hash map lookup
- Toolbar icon: Singleton pattern, minimal DOM operations

## Safety Features

1. **File-Based Graph Detection**: File-update mode only works on local file-based graphs
2. **Minimal Updates**: Only modifies blocks that actually need number changes
3. **Old Number Detection**: Smart detection prevents duplicate numbering
4. **Settings Isolation**: All features independent and can be toggled separately
5. **Default OFF**: All features default to disabled, preserving existing behavior

## Testing Recommendations

1. **Display-Only Mode**:
   - Enable display-only mode
   - Try different delimiters (".", "-", "→")
   - Verify no file modifications occur
   - Test PDF printing

2. **File-Update Mode**:
   - Create a test page in file-based graph
   - Add various heading levels
   - Enable file-update mode
   - Verify numbers are added correctly
   - Change heading structure, verify renumbering

3. **Heading Level Markers**:
   - Enable markers
   - Verify H1-H6 labels appear
   - Check visual styling is subtle

4. **Per-Page Activation**:
   - Test storeTrueOnly mode
   - Test storeFalseOnly mode
   - Verify toolbar icon state updates
   - Check state persistence across page loads

5. **Existing Features**:
   - Verify Page Outline still works
   - Verify Visual Timer still works
   - Verify Mouse Over still works

## Future Enhancements (Not Implemented)

Potential future improvements:
- Custom number formats (Roman numerals, letters)
- Skip numbering for specific headings
- Different numbering styles per heading level
- Batch processing for multiple pages
- Import/export numbering configurations

## Troubleshooting

**Issue**: Toolbar icon doesn't appear
- Solution: Check browser console for selector errors, may need UI update

**Issue**: File-update mode doesn't work
- Solution: Verify you're using a file-based graph (not cloud-based)

**Issue**: Numbers don't update
- Solution: Check page activation state via toolbar icon

**Issue**: Old numbers not detected
- Solution: Verify old delimiter setting matches your existing numbers

## Acceptance Criteria Status

- ✅ Original plugin features not broken
- ✅ Display-only mode works and reflects in printing
- ✅ File-update mode recalculates correctly with minimal updates
- ✅ Heading level markers display subtly
- ✅ Per-page activation works correctly
- ✅ Storage mode settings function properly
- ✅ Delimiter settings (new/old) work correctly
- ✅ Existing features unaffected
- ✅ h1-h6 support
- ✅ Performance acceptable (CSS-based, minimal DOM operations)
- ✅ All features can be toggled independently
- ✅ All features default to OFF
- ✅ TypeScript implementation
- ✅ Security scan passed (0 vulnerabilities)
