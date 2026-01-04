# Testing Guide: Auto-adjust Markdown Heading Levels

This guide helps you verify the auto-heading-level feature works correctly.

## Prerequisites

1. Using a **file-based** Logseq graph (not cloud-based)
2. Plugin installed and enabled
3. Plugin loaded successfully (check in Plugins menu)

## Test 1: Enable the Feature

1. Open Logseq plugin settings
2. Navigate to "Page outline function" section
3. Enable "Auto-adjust heading levels"
4. Verify new settings appear:
   - Heading level range preset
   - Reserve H1 for page title

## Test 2: H2-H6 Preset (Default)

### Setup
1. Create a new test page named "Test Auto Heading"
2. Add the following content:

```
# First level
## Second level
### Third level
# Another first level
## Another second level
### Yet another third level
```

### Execute
1. Open command palette (Ctrl/Cmd+Shift+P)
2. Search for "Normalize headings on current page"
3. Run the command

### Expected Result
After normalization with H2-H6 preset:
```
## First level
### Second level
#### Third level
## Another first level
### Another second level
#### Yet another third level
```

All top-level headings should become H2, second-level H3, etc.

## Test 3: H1-H3 Preset

### Setup
1. In plugin settings, change "Heading level range preset" to "h1-h3"
2. Use the same test page from Test 2

### Execute
1. Run "Normalize headings on current page" command

### Expected Result
```
# First level
## Second level
### Third level
# Another first level
## Another second level
### Yet another third level
```

Top-level → H1, second-level → H2, third-level → H3

## Test 4: H2-H4 Preset

### Setup
1. Change preset to "h2-h4"
2. Add deeper nesting to test page:

```
# First level
## Second level
### Third level
#### Fourth level
##### Fifth level
```

### Execute
1. Run "Normalize headings on current page" command

### Expected Result
```
## First level
### Second level
#### Third level
#### Fourth level (clamped to max)
#### Fifth level (clamped to max)
```

Levels beyond H4 should be clamped to H4.

## Test 5: H1 Reservation

### Setup
1. Use **H2-H6** preset
2. Enable "Reserve H1 for page title"
3. Create test content:

```
# Page Title (existing H1 - should be preserved)
## First section
### Subsection
## Second section
```

### Execute
1. Run "Normalize headings on current page" command

### Expected Result
```
# Page Title (preserved - not changed because reserveH1 is true)
## First section
### Subsection
## Second section
```

The existing H1 heading should be preserved and not modified when reservation is enabled.

### Test 5b: H1 Reservation with H1-H3 Preset

### Setup
1. Use **H1-H3** preset
2. Enable "Reserve H1 for page title"
3. Create test content (no existing H1):

```
## First section
### Subsection
```

### Execute
1. Run "Normalize headings on current page" command

### Expected Result
```
## First section (depth 1, but promoted from H1 to H2 due to reservation)
### Subsection (depth 2 → H2, but child so becomes H3)
```

With H1-H3 preset and reservation enabled, depth-1 headings are promoted to H2 to avoid creating new H1 headings.

## Test 6: Selection-Based Normalization

### Setup
1. Create a page with multiple sections:

```
# Section A
## A.1
### A.1.1

# Section B
## B.1
### B.1.1
```

### Execute
1. Click on "Section B" block to select it
2. Run "Normalize headings in selection" command

### Expected Result
Only Section B and its children are normalized:
```
# Section A (unchanged)
## A.1 (unchanged)
### A.1.1 (unchanged)

## Section B (normalized)
### B.1 (normalized)
#### B.1.1 (normalized)
```

## Test 7: Non-Heading Elements

### Setup
1. Create mixed content:

```
This is a paragraph.

# Heading 1

- List item
- Another item

## Heading 2

> Quote block

### Heading 3

    code block
    more code
```

### Execute
1. Run "Normalize headings on current page" command

### Expected Result
Only headings are modified; paragraphs, lists, quotes, and code blocks remain unchanged:
```
This is a paragraph.

## Heading 1

- List item
- Another item

### Heading 2

> Quote block

#### Heading 3

    code block
    more code
```

## Test 8: Compatibility with Heading Numbering

### Setup
1. Enable both:
   - "Auto-adjust heading levels"
   - "Enable heading numbering (file-update mode)"
2. Create test page:

```
# First
## Second
### Third
```

### Execute
1. Run "Normalize headings on current page" command
2. Page should automatically apply heading numbers (if page is active)

### Expected Result
```
## 1. First
### 1.1. Second
#### 1.1.1. Third
```

Both features should work together:
- Levels are normalized to H2-H6
- Numbers are added hierarchically

## Test 9: Translation Display

### Setup
1. Change Logseq language in Settings
2. Check plugin settings

### Expected Result
All auto-heading-level settings should display in the selected language:
- Japanese: "見出しレベルの自動調整を有効にする"
- English: "Enable auto-adjust heading levels"
- Other languages: English fallback

## Test 10: Error Handling

### Test 10a: No Page Open
1. Close all pages/navigate to graph view
2. Run "Normalize headings on current page" command
3. Expected: Warning message "No page is currently open"

### Test 10b: No Block Selected
1. Click outside all blocks
2. Run "Normalize headings in selection" command
3. Expected: Warning message "No block selected"

### Test 10c: Feature Disabled
1. Disable "Auto-adjust heading levels" in settings
2. Run normalization command
3. Expected: Warning message "Auto heading level adjustment is not enabled"

### Test 10d: No Headings
1. Create page with only paragraphs (no headings)
2. Run normalization command
3. Expected: Info message "No headings found on page"

## Verification Checklist

After running all tests, verify:

- [ ] H2-H6 preset works correctly
- [ ] H1-H3 preset works correctly
- [ ] H2-H4 preset works correctly
- [ ] H1 reservation prevents H1 in content
- [ ] Selection-based normalization only affects selected blocks
- [ ] Non-heading elements are unaffected
- [ ] Compatible with heading numbering feature
- [ ] Commands appear in command palette
- [ ] Settings display in user's language
- [ ] Error messages are helpful and appropriate
- [ ] Page source files are modified correctly
- [ ] TOC updates after normalization

## Troubleshooting

If tests fail:

1. **Commands not found**: Restart Logseq to reload plugin
2. **No changes made**: Check if using file-based graph (not cloud)
3. **Unexpected levels**: Verify selected preset in settings
4. **Numbers corrupted**: Try running cleanup command first
5. **Build errors**: Run `npm run build` and check for TypeScript errors

## Performance Testing

For large pages (100+ headings):

1. Create a page with many nested headings
2. Run normalization command
3. Verify:
   - Command completes in reasonable time (<5 seconds)
   - All headings are updated correctly
   - No UI freezing or crashes
   - Success message shows correct count

## Reporting Issues

If you find bugs:

1. Note the test case that failed
2. Record your settings (preset, H1 reservation)
3. Provide before/after markdown examples
4. Check browser console for error messages
5. Report to: [GitHub Issues](https://github.com/YU000jp/logseq-plugin-left-sidebar-enhance/issues)
