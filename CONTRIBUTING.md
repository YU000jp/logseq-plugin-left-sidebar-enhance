# Contributing to Left Sidebar Enhance

Thank you for your interest in contributing to this Logseq plugin! This guide will help you understand the project structure and development workflow.

## Project Structure

Please refer to `ARCHITECTURE.md` for a detailed overview of the project structure and the maintainability improvements that have been implemented.

## Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Build the project: `npm run build`
4. For production build: `npm run prod`

## Code Organization Principles

### 1. Separation of Concerns
- **`config/`**: Configuration constants and magic numbers
- **`core/`**: Business logic and state management
- **`utils/`**: Reusable utility functions
- **`types/`**: TypeScript type definitions
- **`page-outline/`**: TOC-specific functionality

### 2. State Management
Use the centralized state manager for all plugin state:

```typescript
import { stateManager } from './core/state'

// Get state
const currentPage = stateManager.getCurrentPageOriginalName()

// Set state (with automatic logging)
stateManager.setCurrentPageOriginalName('new-page')
```

### 3. Logging
Use the centralized logger for all logging needs:

```typescript
import { logger } from './utils/logger'

logger.info('Operation started', { context })
logger.debug('Debug information', data)
logger.error('Error occurred', error)
```

### 4. Constants
Use constants from the config module:

```typescript
import { TIMEOUTS, ELEMENT_IDS } from './config/constants'

setTimeout(callback, TIMEOUTS.TOC_UPDATE_DELAY)
removeContainer(ELEMENT_IDS.TOC_CONTAINER)
```

## Development Guidelines

### Code Style
- Use TypeScript for all new code
- Add proper type annotations
- Include JSDoc comments for public functions
- Use meaningful variable and function names
- Keep functions small and focused

### Error Handling
- Always handle potential errors
- Use the logger for error reporting
- Provide meaningful error messages
- Use try-catch blocks for async operations

### Performance
- Use the logger's `measureTime` for performance monitoring
- Avoid blocking operations in the main thread
- Use timeouts appropriately for DOM operations

### Adding New Features

1. **Create types first**: Add necessary TypeScript interfaces to `types/index.ts`
2. **Add configuration**: Put any constants in `config/constants.ts`
3. **Use proper logging**: Include appropriate logging throughout
4. **Update documentation**: Add to README or architecture docs as needed
5. **Test thoroughly**: Ensure both dev and prod builds work

## File Naming Conventions

- Use camelCase for function and variable names
- Use PascalCase for class names and TypeScript interfaces
- Use kebab-case for file names when appropriate
- Use descriptive names that indicate the module's purpose

## Common Patterns

### DOM Manipulation
```typescript
import { createElementWithAttributes, safeGetElementById } from './utils/domUtils'

const element = createElementWithAttributes('div', {
  class: 'my-class',
  id: 'my-id'
})

const existingElement = safeGetElementById('element-id')
```

### Async Operations with Timeout
```typescript
import { withTimeout } from './utils/lib'

try {
  const result = await withTimeout(
    () => someAsyncOperation(),
    5000,
    'my operation'
  )
} catch (error) {
  logger.error('Operation failed or timed out', error)
}
```

### Version-Specific Code
```typescript
import { versionManager } from './core/version'

if (versionManager.isCurrentVersionMd()) {
  // MD version specific code
} else {
  // DB version specific code
}
```

## Testing

While there are no automated tests yet, please manually test:

1. Plugin loads without errors
2. All features work as expected
3. No console errors in browser dev tools
4. Both development and production builds work
5. State changes are properly logged

## Pull Request Guidelines

1. Ensure your code follows the established patterns
2. Add appropriate logging and error handling
3. Update documentation if needed
4. Test both development and production builds
5. Keep changes focused and atomic

## Questions and Support

If you have questions about the architecture or need help with development, please:

1. Check the `ARCHITECTURE.md` file first
2. Look for similar patterns in existing code
3. Open an issue for discussion

Thank you for contributing to making this plugin more maintainable and robust!