# Project Architecture

This document outlines the improved project structure and maintainability enhancements made to the Left Sidebar Enhance plugin.

## Directory Structure

```
src/
├── config/           # Configuration and constants
│   └── constants.ts  # Application constants and magic numbers
├── core/            # Core business logic
│   ├── state.ts     # Centralized state management
│   └── version.ts   # Version management utilities
├── types/           # TypeScript type definitions
│   └── index.ts     # Application-specific types
├── utils/           # Utility functions (previously util/)
│   ├── domUtils.ts  # DOM manipulation utilities
│   ├── lib.ts       # General utility functions
│   ├── logger.ts    # Centralized logging
│   ├── markdown.ts  # Markdown processing utilities
│   └── query/       # Database query utilities
├── page-outline/    # Page outline (TOC) functionality
├── translations/    # Internationalization files
└── index.ts        # Main application entry point
```

## Key Improvements

### 1. Centralized Configuration
- All magic numbers, timeouts, and element IDs moved to `config/constants.ts`
- Version-specific patterns and defaults centralized
- Easier to maintain and update configuration values

### 2. Enhanced Type Safety
- Added comprehensive TypeScript interfaces in `types/index.ts`
- Proper typing for plugin state, settings, and function parameters
- Improved IDE support and runtime error detection

### 3. Centralized State Management
- `core/state.ts` manages all plugin state through singleton pattern
- Eliminates scattered global variables
- Proper state encapsulation with getter/setter methods
- Built-in logging for state changes

### 4. Robust Logging System
- `utils/logger.ts` provides centralized logging with levels
- Performance measurement capabilities
- Consistent log formatting with timestamps
- Easy to enable/disable debug information

### 5. Version Management
- `core/version.ts` handles Logseq version detection and compatibility
- Centralized version-specific logic
- Proper error handling for version detection failures

### 6. Improved Error Handling
- Enhanced DOM utilities with proper error handling
- Timeout utilities for async operations
- Better error propagation and logging

### 7. Code Organization
- Separated concerns into logical modules
- Reduced function complexity
- Improved readability with proper documentation
- Consistent code style and naming conventions

## Benefits

1. **Maintainability**: Easier to locate and modify specific functionality
2. **Testability**: Better separation of concerns makes testing easier
3. **Debugging**: Centralized logging makes issue diagnosis faster
4. **Type Safety**: Reduced runtime errors through better typing
5. **Configuration Management**: Single source of truth for all constants
6. **State Management**: Predictable state changes with proper encapsulation
7. **Error Handling**: More robust error recovery and reporting

## Usage Examples

### Using the Logger
```typescript
import { logger } from './utils/logger'

logger.info('Operation started')
logger.debug('Debug information', { data })
logger.error('Operation failed', error)

// Measure performance
await logger.measureTime('expensive operation', async () => {
  // expensive operation here
})
```

### Using State Management
```typescript
import { stateManager } from './core/state'

// Get current page
const currentPage = stateManager.getCurrentPageOriginalName()

// Update state
stateManager.setCurrentPageOriginalName('new-page')

// Check processing flags
if (!stateManager.isProcessingBlockChanged()) {
  // proceed with operation
}
```

### Using Constants
```typescript
import { TIMEOUTS, ELEMENT_IDS } from './config/constants'

setTimeout(() => {
  // operation
}, TIMEOUTS.TOC_UPDATE_DELAY)

removeContainer(ELEMENT_IDS.TOC_CONTAINER)
```

## Migration Guide

The changes are backward compatible. Existing functionality remains the same, but now uses the improved architecture internally. No changes are required for plugin users.

## Future Improvements

1. Add unit tests for core modules
2. Implement configuration validation
3. Add performance monitoring
4. Consider adding a plugin API for extensibility
5. Implement proper dependency injection for better testability