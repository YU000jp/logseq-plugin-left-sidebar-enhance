# Vue + Svelte Architecture

This plugin has been migrated from vanilla TypeScript to a hybrid Vue + Svelte architecture.

## Architecture Overview

### Main Application (Vue 3)
- **Entry Point**: `src/main.ts`
- **Main Component**: `src/components/vue/App.vue`
- **Settings UI**: `src/components/vue/Settings.vue`

The Vue 3 application serves as the main framework, handling:
- Application lifecycle management
- Settings management and reactive state
- Integration with existing TypeScript logic
- Global event handling and keyboard shortcuts

### UI Components (Svelte 5)
- **Date Selector**: `src/components/svelte/DateSelector.svelte`
- **Table of Contents**: `src/components/svelte/TableOfContents.svelte`

Svelte components are used for specific UI elements that benefit from Svelte's:
- Lightweight runtime
- Excellent performance for DOM-heavy operations
- Smooth integration with existing DOM manipulation code

## Integration Pattern

The Vue app mounts Svelte components manually using the `new ComponentName()` constructor pattern:

```typescript
// In Vue component
import SvelteComponent from '../svelte/SvelteComponent.svelte'

let svelteInstance = new SvelteComponent({
  target: document.getElementById('mount-point'),
  props: { /* props */ }
})
```

## Key Features

1. **Reactive State Management**: Vue handles global plugin state
2. **Component Lifecycle**: Both Vue and Svelte components properly clean up resources
3. **Settings Integration**: Vue-based settings panel with real-time updates
4. **Backward Compatibility**: All existing functionality preserved
5. **Framework Coexistence**: Vue and Svelte work together seamlessly

## File Structure

```
src/
├── main.ts                    # New Vue application entry point
├── index.ts.old              # Original entry point (renamed)
├── components/
│   ├── vue/
│   │   ├── App.vue           # Main Vue application
│   │   └── Settings.vue      # Settings panel (Vue)
│   └── svelte/
│       ├── DateSelector.svelte      # Date selector UI
│       └── TableOfContents.svelte   # TOC UI
├── page-outline/             # Existing TOC logic (unchanged)
├── util/                     # Existing utilities (unchanged)
└── ...                       # Other existing files
```

## Benefits of This Approach

1. **Modern Framework Benefits**: Reactive state management, component lifecycle
2. **Performance**: Svelte components are lightweight and fast
3. **Maintainability**: Clear separation of concerns
4. **Extensibility**: Easy to add new Vue components or Svelte widgets
5. **Developer Experience**: Modern tooling and debugging capabilities

## Development

- `npm run dev` - Development server with HMR
- `npm run build` - Development build
- `npm run prod` - Production build

The build process uses Vite with Vue and Svelte plugins for optimal bundling and tree-shaking.