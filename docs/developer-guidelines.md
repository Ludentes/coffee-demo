# Developer Guidelines

This document defines the coding standards, architectural patterns, and best practices for the Telegram Coffee Shop Order Bot project. Following these guidelines ensures consistent code quality, maintainability, and alignment with business requirements.

## Table of Contents
1. [Introduction](#1-introduction)
2. [TypeScript Standards](#2-typescript-standards)
3. [Architecture Patterns](#3-architecture-patterns)
4. [Error Handling Patterns](#4-error-handling-patterns)
5. [Response Standards](#5-response-standards)
6. [Business Logic Implementation](#6-business-logic-implementation)
7. [Testing Approach](#7-testing-approach)
8. [Code Organization](#8-code-organization)
9. [Naming Conventions](#9-naming-conventions)
10. [Code Formatting](#10-code-formatting)
11. [Linting](#11-linting)
12. [Logging Standards](#12-logging-standards)
13. [Performance Considerations](#13-performance-considerations)
14. [Security Guidelines](#14-security-guidelines)
15. [Dependency Management](#15-dependency-management)
16. [Documentation Standards](#16-documentation-standards)
17. [Contribution Guidelines](#17-contribution-guidelines)

## 1. Introduction

### Purpose
These guidelines establish a consistent approach to development, ensuring that all code contributions maintain high quality and follow established patterns. They serve as both a reference for current developers and onboarding material for new team members.

### Project Overview
The Telegram Coffee Shop Order Bot is a demonstration of systematic AI-assisted development. It processes natural language coffee orders via Telegram and responds with formatted order confirmations including pricing, tax, and pickup details.

### How to Use These Guidelines
- **New Developers**: Read this document completely before contributing
- **Current Team**: Reference specific sections when implementing features
- **Code Reviews**: Use as evaluation criteria for pull requests
- **AI Assistance**: Provide to AI tools for context-aware code generation

## 2. TypeScript Standards

### Strict Mode Requirements
- TypeScript's strict mode is **mandatory** for all files
- Configure `tsconfig.json` with `"strict": true`
- Enable all strict type checking options

### Type Safety Principles
- Every variable, parameter, and return value must have an explicit or inferred type
- No `any` types permitted throughout the codebase
- Use union types instead of type assertions when handling variable types
- Prefer readonly properties for immutable values

### Interface Usage
- Define interfaces in `types.ts` for all domain objects
- Follow the interfaces exactly as defined in the data model
- Extend existing interfaces rather than creating duplicative ones
- Use descriptive names that reflect business domain concepts

### Type Definitions
```typescript
// Example of proper interface definition
export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
  size: string;
  milkType: string;
  itemTotal: number;
}
```

## 3. Architecture Patterns

### Service Separation Principles
- Each service has a single, well-defined responsibility
- Services communicate through clearly defined interfaces
- Implementation details remain encapsulated within each service
- Dependencies are explicitly declared and injected

### Component Responsibilities
- **MessageParser**: Converts natural language → structured data
- **OrderCalculator**: Applies business logic and generates responses
- **Bot/Webhook**: Handles platform integration and coordinates services

### Integration Pattern
```typescript
// Example of proper service integration
async function handleMessage(text: string, customer: Customer): Promise<string> {
  // Parse the message text into structured data
  const parsedOrder = await messageParser.parseOrder(text);
  
  if (!parsedOrder.success) {
    return formatErrorResponse(parsedOrder.error);
  }
  
  // Calculate order details and generate confirmation
  const order = await orderCalculator.createOrder(parsedOrder.items, customer);
  return formatOrderConfirmation(order);
}
```

### Platform-Agnostic Business Logic
- Core business logic must be platform-independent
- Platform-specific code should be isolated in adapter layers
- Business rules implementation must be reusable across platforms
- Separate formatting logic from calculation logic

## 4. Error Handling Patterns

### Custom Error Classes
- Define specific error classes for different failure modes
- Extend the base Error class with additional context
- Include helpful information for debugging
- Maintain consistent error structure

```typescript
// Example of custom error class
export class MenuItemNotFoundError extends Error {
  constructor(itemName: string) {
    super(`Menu item not found: ${itemName}`);
    this.name = 'MenuItemNotFoundError';
  }
}
```

### Error Types
- **MenuItemNotFoundError**: Unknown item in order text
- **ParseError**: Cannot understand order format
- **ValidationError**: Invalid data structure

### User-Friendly Error Messages
- All error messages must be customer-facing and helpful
- Include specific guidance on how to correct the issue
- Provide examples of correct formats when applicable
- Use emoji for visual clarity in error messages

### Error Recovery
- Implement graceful degradation when possible
- Provide clear next steps for users to resolve errors
- Log detailed error information for debugging
- Never expose technical details to end users

## 5. Response Standards

### Consistent Response Format
- All responses follow the APIResponse interface pattern
- Include success/error indicators in every response
- Provide data payload for successful operations
- Include helpful error messages for failures

```typescript
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

### HTML Formatting for Telegram
- Use HTML parse mode for rich text formatting
- Follow Telegram's supported HTML subset
- Test all formatted messages in the Telegram app
- Ensure proper escaping of special characters

### Emoji Usage Guidelines
- Use emojis consistently for visual categorization
- Follow the established emoji patterns in templates
- Don't overuse emojis (maximum 1-2 per section)
- Ensure emojis render properly across platforms

### Required Response Elements
Order confirmations must include:
- ✅ Confirmation indicator
- 📋 Itemized order details
- 💰 Pricing breakdown (subtotal, tax, total)
- ⏰ Estimated ready time
- 🆔 Order identifier
- 📍 Pickup instructions

## 6. Business Logic Implementation

### Currency Calculation Best Practices
- Use precise decimal arithmetic for all currency operations
- Perform calculations in cents to avoid floating-point errors
- Apply rounding only at final display step
- Format all currency values with exactly 2 decimal places

```typescript
// Example of proper currency calculation
function calculateTax(subtotal: number): number {
  // Convert to cents, calculate, then convert back to dollars
  const subtotalCents = Math.round(subtotal * 100);
  const taxCents = Math.round(subtotalCents * TAX_RATE);
  return taxCents / 100;
}
```

### Business Rule Application
- Implement business rules exactly as specified in documentation
- Apply tax rate of 8.5% to subtotal
- Use correct price modifiers for sizes and milk options
- Calculate preparation time as current time + 10 minutes

### Default Value Handling
- Apply medium size when size not specified
- Use whole milk when milk type not specified
- Document all default values in code comments
- Ensure defaults match business requirements

## 7. Testing Approach

### Test Case Verification
- Verify against all test cases in `test/sample-messages.json`
- Ensure expected outputs match for all input scenarios
- Test both happy paths and error cases
- Validate pricing calculations match expected totals

### Human Verification Checkpoints
- Follow the verification checklists in implementation tasks
- Manually test all user-facing messages in Telegram
- Verify HTML formatting displays correctly
- Confirm error messages provide helpful guidance

### Edge Case Testing
- Test with minimum and maximum values
- Verify handling of special characters and emoji in input
- Test with multiple items and variations
- Ensure proper handling of invalid inputs

### Integration Testing
- Test complete flow from message input to response
- Verify service interactions work as expected
- Test platform-specific formatting
- Validate end-to-end user experience

## 8. Code Organization

### File Structure
```
src/
├── bot.ts                   # Telegram bot setup and message handling
├── types.ts                 # TypeScript interfaces for domain objects
└── services/
    ├── MessageParser.ts     # Parse natural language orders
    └── OrderCalculator.ts   # Calculate pricing and format responses
```

### Naming Conventions
- **Files**: PascalCase for classes, camelCase for utilities
- **Classes**: PascalCase (e.g., `MessageParser`)
- **Interfaces**: PascalCase (e.g., `OrderItem`)
- **Methods/Functions**: camelCase (e.g., `parseOrder`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `TAX_RATE`)

### Module Organization
- Group related functionality in the same module
- Export only what's necessary from each module
- Use barrel exports for service directories
- Keep circular dependencies strictly prohibited

### Import/Export Patterns
```typescript
// Preferred import style
import { MenuItem, OrderItem } from '../types';
import { parseOrder } from './services/MessageParser';

// Preferred export style
export interface ParseResult { /* ... */ }
export function parseMessage() { /* ... */ }
```

## 9. Naming Conventions

### File Naming
- **Component Files**: PascalCase for class-based components (e.g., `MessageParser.ts`)
- **Utility Files**: camelCase for utility functions (e.g., `formatUtils.ts`)
- **Test Files**: Same name as the file being tested with `.test.ts` suffix (e.g., `MessageParser.test.ts`)
- **Interface Files**: Use descriptive names that reflect domain concepts (e.g., `types.ts`)

### Class Naming
- Use PascalCase for all class names (e.g., `OrderCalculator`)
- Class names should be nouns or noun phrases
- Use descriptive names that reflect the class's responsibility
- Avoid abbreviations unless they are widely understood

### Interface Naming
- Use PascalCase for interface names (e.g., `OrderItem`)
- Don't prefix interfaces with `I` (e.g., use `Order` not `IOrder`)
- Name interfaces based on their purpose, not implementation
- For interfaces representing services, use descriptive names (e.g., `MessageParser` not `IMessageParser`)

### Function/Method Naming
- Use camelCase for all function and method names (e.g., `parseOrder`)
- Function names should be verbs or verb phrases that describe the action
- Boolean-returning functions should start with `is`, `has`, or `should` (e.g., `isValidOrder`)
- Event handlers should be named `handleEventName` (e.g., `handleSubmit`)

### Variable Naming
- Use camelCase for variable names (e.g., `orderTotal`)
- Choose descriptive names that indicate the variable's purpose
- Boolean variables should use positive names (e.g., `isValid` not `notValid`)
- Avoid single-letter variable names except in loops or mathematical formulas

### Constant Naming
- Use UPPER_SNAKE_CASE for constants (e.g., `TAX_RATE`)
- Constants should be declared at the top of the file or in a dedicated constants file
- Group related constants in constant objects with PascalCase names

### Enum Naming
- Use PascalCase for enum names (e.g., `OrderStatus`)
- Use PascalCase for enum members (e.g., `OrderStatus.Confirmed`)
- Singular noun for the enum name

## 10. Code Formatting

### Prettier Configuration
- Use Prettier for automatic code formatting
- Configure in `.prettierrc` file at project root
- Standard configuration:

```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

### Indentation
- Use 2 spaces for indentation
- Never mix tabs and spaces
- Maintain consistent indentation throughout the codebase

### Line Length
- Maximum line length of 100 characters
- Break long lines at logical points
- For method chains, break after each method call

### Whitespace
- Use blank lines to separate logical blocks of code
- No trailing whitespace at the end of lines
- One blank line at the end of each file
- Consistent spacing around operators and after commas

### Braces and Brackets
- Opening braces on the same line as the statement (K&R style)
- Always use braces for control statements, even for single-line blocks
- Consistent spacing inside brackets and parentheses

### String Formatting
- Use template literals for string interpolation
- Use single quotes for string literals
- For multiline strings, use template literals with proper indentation

## 11. Linting

### ESLint Configuration
- Use ESLint for static code analysis
- Configure in `.eslintrc.js` file at project root
- Extend recommended TypeScript ESLint rules

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended'
  ],
  plugins: ['@typescript-eslint'],
  rules: {
    // Custom rules
    '@typescript-eslint/explicit-function-return-type': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['warn', 'error'] }]
  }
};
```

### Required Rules
- No unused variables or imports
- No explicit `any` types
- Explicit return types for functions
- No console.log statements in production code
- No debugger statements
- Consistent use of single quotes
- Proper error handling (no empty catch blocks)

### IDE Integration
- Configure VS Code to use ESLint and Prettier extensions
- Enable "Format on Save" for automatic formatting
- Share workspace settings in `.vscode/settings.json`

## 12. Logging Standards

### Logging Levels
- **ERROR**: Critical issues that require immediate attention
- **WARN**: Potential problems that don't stop execution
- **INFO**: Important application events and milestones
- **DEBUG**: Detailed information for troubleshooting

### Logging Format
- Structured JSON logging for machine readability
- Include timestamp, log level, component name, and message
- Add context data as needed (order ID, customer ID, etc.)
- Mask sensitive information (tokens, personal data)

### Logging Implementation
```typescript
// Example logging utility
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'telegram-coffee-bot' },
  transports: [
    new winston.transports.Console(),
    // Add file transport for production
  ]
});

// Usage
logger.info('Order processed', { orderId: order.id, total: order.total });
logger.error('Failed to process order', { error: error.message, stack: error.stack });
```

### When to Log
- Log at the beginning and end of important operations
- Log all errors with context information
- Log business events (order created, payment processed)
- Log performance metrics for critical operations
- Don't log sensitive information (passwords, tokens)

### Environment-Specific Logging
- Development: Console output with detailed information
- Production: Structured JSON logs for aggregation
- Testing: Minimal logging or redirected to specific test outputs
- Configure log level via environment variables

## 13. Performance Considerations

### Asynchronous Operations
- Use async/await for asynchronous code
- Avoid blocking the event loop with long-running operations
- Use Promise.all for parallel operations when appropriate
- Implement proper error handling for all async operations

### Memory Management
- Avoid memory leaks by cleaning up event listeners and subscriptions
- Be cautious with closures that capture large objects
- Limit the size of cached data
- Use WeakMap/WeakSet for caches that reference objects

### Computation Efficiency
- Optimize expensive calculations
- Cache results of pure functions when appropriate
- Use memoization for repeated calculations with the same inputs
- Profile performance bottlenecks before optimizing

### Network Efficiency
- Minimize API calls by batching requests when possible
- Implement retry logic with exponential backoff for network operations
- Use connection pooling for database connections
- Implement proper timeout handling for all network requests

## 14. Security Guidelines

### Input Validation
- Validate all user input before processing
- Use strong typing to enforce data structure
- Implement length limits for string inputs
- Sanitize inputs to prevent injection attacks

### Authentication and Authorization
- Use secure methods for storing API tokens
- Never hardcode secrets in source code
- Implement proper access controls for admin functions
- Validate user permissions before processing requests

### Data Protection
- Mask sensitive data in logs
- Use environment variables for configuration secrets
- Implement proper error handling that doesn't leak sensitive information
- Follow the principle of least privilege for all operations

### Dependency Security
- Regularly update dependencies to patch security vulnerabilities
- Use npm audit to check for known vulnerabilities
- Pin dependency versions to prevent unexpected updates
- Consider using a tool like Dependabot for automated security updates

## 15. Dependency Management

### Package Selection Criteria
- Prefer established, well-maintained packages
- Check GitHub activity, issues, and stars before adding dependencies
- Consider bundle size impact for client-side packages
- Evaluate license compatibility with project requirements

### Version Pinning
- Use exact versions for critical dependencies
- Use caret ranges (^) for minor updates of stable dependencies
- Document dependency purpose and usage in package.json
- Create a dependencies.md file for complex dependency explanations

### Dependency Updates
- Schedule regular dependency updates
- Test thoroughly after updating dependencies
- Update one major version at a time
- Document breaking changes and required code modifications

### Managing Dev Dependencies
- Separate runtime dependencies from development tools
- Use devDependencies for testing, linting, and build tools
- Document build and development setup requirements
- Provide scripts for common development tasks

## 16. Documentation Standards

### Code Comments
- Document complex logic with clear explanations
- Include JSDoc comments for all public functions
- Explain business rule implementations
- Document assumptions and edge cases

```typescript
/**
 * Calculates the total price for an order item including all modifiers.
 * 
 * @param menuItem The base menu item
 * @param size The selected size (small, medium, large)
 * @param milkType The selected milk option
 * @param quantity Number of items ordered
 * @returns The calculated total price
 */
function calculateItemTotal(
  menuItem: MenuItem, 
  size: string, 
  milkType: string, 
  quantity: number
): number {
  // Implementation
}
```

### Implementation Reports
- Provide detailed implementation reports for each task
- Document key technical decisions and their rationale
- List all implemented capabilities
- Note any limitations or assumptions

### Human Understanding Checkpoints
- Document areas requiring human review
- Explain complex algorithms or business logic
- Provide verification steps for critical functionality
- Include examples of expected inputs and outputs

## 17. Contribution Guidelines

### Pull Request Process
1. Create feature branch from main
2. Implement changes following these guidelines
3. Add/update tests for new functionality
4. Submit PR with implementation report
5. Address review feedback
6. Merge after approval

### Code Review Standards
- Verify type safety and strict TypeScript usage
- Confirm business rules implemented correctly
- Check error handling for all edge cases
- Validate against test cases
- Ensure documentation is complete and accurate

### Quality Assurance Steps
- Run TypeScript compiler with strict checks
- Verify all test cases pass
- Test with actual Telegram bot
- Confirm formatting displays correctly
- Validate calculations match expected results

### Version Control Practices
- Write clear, descriptive commit messages
- Reference issue numbers in commits
- Keep commits focused on single changes
- Use semantic versioning for releases

## Conclusion

These guidelines ensure that the Telegram Coffee Shop Order Bot maintains high code quality, follows consistent patterns, and correctly implements business requirements. By adhering to these standards, we create maintainable, robust code that delivers an excellent customer experience while demonstrating systematic AI-assisted development principles.

Following these guidelines will:
- Ensure consistent code quality across the project
- Make the codebase easier to maintain and extend
- Reduce bugs and technical debt
- Facilitate onboarding of new developers
- Enable effective AI-assisted development
- Support cross-platform expansion to other messaging platforms

All team members are expected to follow these guidelines and suggest improvements when appropriate. The guidelines should evolve with the project as new patterns and best practices emerge.