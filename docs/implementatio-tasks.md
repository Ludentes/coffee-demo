# Implementation Tasks with Human Control Framework

This document defines the systematic AI-assisted development process with human verification at every step.

## Human Control Philosophy

**Core Principle**: AI accelerates implementation when provided with comprehensive context, while humans maintain control through systematic verification and understanding checkpoints.

**Non-Negotiables:**
- Every AI deliverable must be verified by human testing
- Developer must understand all implementation decisions  
- Code must follow documented standards exactly
- Business rules must be implemented precisely as specified

## Task 1: Telegram Bot Setup and Message Handling

### AI Deliverable
**File**: `src/bot.ts`  
**Purpose**: Complete Telegraf bot initialization with message processing pipeline

### Requirements
- Initialize Telegraf bot with proper token configuration and error handling
- Handle incoming text messages from customers in private chats
- Extract customer information (ID, name) and message content safely
- Route messages to MessageParser and OrderCalculator services
- Send formatted HTML responses back to Telegram with proper error handling
- Implement graceful error handling with user-friendly messages

### AI Implementation Report Template
```
TASK 1: TELEGRAM BOT IMPLEMENTATION REPORT

✅ COMPONENTS IMPLEMENTED:
- Telegraf bot initialization with environment variable validation
- Message middleware for text message processing  
- Customer data extraction with type safety
- Service integration points for parsing and calculation
- HTML response formatting with Telegram markup
- Comprehensive error handling with user guidance

🔧 KEY TECHNICAL DECISIONS:
- Used Telegraf framework for TypeScript support and middleware patterns
- Implemented webhook mode setup for production scalability  
- Added structured logging for debugging and monitoring
- Created error boundaries to prevent bot crashes
- Used HTML parse mode for rich message formatting

📋 SERVICE INTEGRATION:
- MessageParser.parseOrder() called with text input
- OrderCalculator.createOrder() called with parsed results
- Error responses formatted consistently with help suggestions
- Customer context passed through processing pipeline

⚠️ DEPENDENCIES & LIMITATIONS:
- Requires TELEGRAM_BOT_TOKEN environment variable
- MessageParser and OrderCalculator services must be implemented next
- Webhook URL configuration needed for production deployment
- No persistent storage implemented (orders exist only in memory)

🔍 TESTING RECOMMENDATIONS:
- Verify bot responds to messages sent via Telegram app
- Test error handling with malformed or missing token
- Confirm customer information extraction accuracy
- Validate HTML formatting displays correctly in Telegram
```

### Human Verification Checklist
- [ ] `npm run dev` starts bot without TypeScript compilation errors
- [ ] Bot responds to test messages sent via Telegram app  
- [ ] Customer ID and name extracted correctly from message context
- [ ] Error responses provide helpful guidance instead of technical details
- [ ] HTML formatting displays properly in Telegram (bold text, emojis, structure)
- [ ] Bot handles missing environment variables gracefully
- [ ] Logging outputs structured information suitable for debugging

### Human Understanding Checkpoint
**Review the bot implementation to understand:**
- How Telegraf middleware pattern processes incoming messages
- Where customer context gets extracted and passed to business logic
- How error boundaries prevent system crashes from propagating to users  
- Why HTML parse mode enables rich formatting in Telegram responses
- How service integration points enable modular business logic

---

## Task 2: Natural Language Order Parsing

### AI Deliverable
**File**: `src/services/MessageParser.ts` (Implemented in `src/bot.ts` - see [Service Implementation Explanation](./service-implementation-explanation.md))
**Purpose**: Convert natural language order text into structured business objects

### Requirements
- Parse customer order text using fuzzy string matching for menu items
- Extract quantities, sizes, and milk preferences with intelligent defaults
- Handle multiple items in single message separated by common delimiters
- Return structured OrderItem arrays or detailed error information
- Support common abbreviations and variations ("cap" → "Cappuccino")
- Apply business rules for defaults (medium size, whole milk when unspecified)

### AI Implementation Report Template
```
TASK 2: MESSAGE PARSER IMPLEMENTATION REPORT

✅ PARSING CAPABILITIES IMPLEMENTED:
- Fuzzy string matching using Levenshtein distance algorithm
- Quantity extraction with regex patterns (supports "1", "two", "2x" formats)
- Size detection with fallback to medium default
- Milk type parsing with support for common variations
- Multi-item parsing using comma and conjunction separators
- Comprehensive error categorization and messaging

🔧 ALGORITHM DECISIONS:
- Levenshtein distance with 60% similarity threshold for fuzzy matching
- Regex-based tokenization for quantity and modifier extraction
- Alias matching for common abbreviations before fuzzy fallback
- Default value application follows business rule specifications
- Error messages include specific suggestions and examples

📋 BUSINESS RULE IMPLEMENTATION:
- Menu items: Cappuccino ($3.50), Latte ($4.00) with exact pricing
- Size modifiers: Small (-$0.50), Medium (default), Large (+$0.50)
- Milk options: Whole (default), Oat/Almond (+$0.50) with price modifiers
- Fuzzy matching aliases: "cap"→"Cappuccino", variations handled consistently

⚠️ EDGE CASES & LIMITATIONS:
- Complex modifications not supported (temperature, syrup flavors)
- Single-character input may trigger false positive matches
- Multi-language support not implemented in minimal demo
- Assumes English-language input with standard abbreviations

🔍 TESTING COVERAGE:
- Simple orders: "1 large cappuccino with oat milk"
- Fuzzy matching: "1 large cap with oat milk" 
- Multiple items: "2 lattes, 1 small cappuccino"
- Default handling: "1 cappuccino" (medium, whole milk)
- Error cases: unknown items, unparseable text
```

### Human Verification Checklist
- [ ] `parseOrder("1 large cappuccino with oat milk")` returns correct structured data
- [ ] Fuzzy matching: `parseOrder("1 large cap with oat milk")` correctly identifies Cappuccino
- [ ] Default application: `parseOrder("1 cappuccino")` applies medium size and whole milk
- [ ] Multi-item parsing: `parseOrder("2 lattes, 1 small cap")` returns array with 2 items
- [ ] Error handling: `parseOrder("1 espresso")` returns helpful error with menu options
- [ ] Parsing errors: `parseOrder("xyz abc")` returns formatting guidance with examples
- [ ] Price modifiers calculated correctly for all size and milk combinations

### Human Understanding Checkpoint
**Review the parsing logic to understand:**
- How fuzzy matching algorithm determines best menu item matches
- Where business rules get applied for default size and milk selections
- How multi-item parsing splits and processes complex order text
- Why specific error messages guide customers toward successful ordering
- How the algorithm balances flexibility with accuracy in natural language processing

---

## Task 3: Order Calculation and Response Formatting

### AI Deliverable
**File**: `src/services/OrderCalculator.ts` (Implemented in `src/bot.ts` - see [Service Implementation Explanation](./service-implementation-explanation.md))
**Purpose**: Apply business logic to calculate pricing and generate customer confirmations

### Requirements
- Calculate accurate item totals using base prices plus size and milk modifiers
- Apply 8.5% tax rate to subtotal with proper rounding to nearest cent
- Generate unique order IDs with timestamp-based approach for traceability
- Create estimated ready times (current time + 10 minutes) in readable format
- Format order confirmations using HTML markup for Telegram display
- Handle currency formatting consistently throughout calculations

### AI Implementation Report Template
```
TASK 3: ORDER CALCULATOR IMPLEMENTATION REPORT

✅ CALCULATION FEATURES IMPLEMENTED:
- Precise decimal arithmetic using Math.round() for currency precision
- Tax calculation at 8.5% rate with proper cent-based rounding
- Order ID generation using timestamp + random suffix for uniqueness
- Ready time calculation with 10-minute preparation window
- HTML confirmation formatting with emoji structure and bold emphasis
- Currency formatting to exactly 2 decimal places with $ symbol

🔧 MATHEMATICAL DECISIONS:
- Base price + size modifier + milk modifier calculation order
- Tax applied to final subtotal, not individual items
- Rounding performed at final step to prevent floating point errors
- Order ID format: "ORD-{timestamp}-{random}" for uniqueness and traceability
- Time formatting uses 12-hour format with AM/PM for customer clarity

📋 BUSINESS RULE COMPLIANCE:
- Tax rate: exactly 8.5% as specified in business requirements
- Preparation time: consistent 10 minutes for all orders regardless of complexity
- Price precision: all monetary values rounded to exactly 2 decimal places
- Order confirmation includes all required elements per specification

⚠️ ASSUMPTIONS & CONSTRAINTS:
- Single-location operation (no multi-store ID prefixes)
- USD currency assumed with $ symbol formatting
- No promotional discounts or loyalty program integration
- Preparation time static regardless of order complexity or kitchen load

🔍 VERIFICATION CALCULATIONS:
- Large Cappuccino: $3.50 + $0.50 (large) = $4.00
- Oat Milk addition: $4.00 + $0.50 = $4.50 subtotal
- Tax calculation: $4.50 × 0.085 = $0.3825 → rounds to $0.38
- Final total: $4.50 + $0.38 = $4.88
```

### Human Verification Checklist
- [ ] Price calculation: Large Cappuccino ($3.50 + $0.50) + Oat Milk ($0.50) = $4.50 subtotal
- [ ] Tax calculation: $4.50 × 0.085 = $0.3825 → correctly rounds to $0.38  
- [ ] Total calculation: $4.50 + $0.38 = $4.88 final total
- [ ] Order confirmation includes all required elements (items, pricing, timing, order ID)
- [ ] HTML formatting displays correctly in Telegram with proper bold text and emoji structure
- [ ] Currency values always show exactly 2 decimal places in all contexts
- [ ] Estimated ready time shows current time + 10 minutes in readable 12-hour format
- [ ] Order IDs are unique across multiple rapid order generations

### Human Understanding Checkpoint
**Review the calculation implementation to understand:**
- How price modifiers combine systematically (base + size + milk)
- Where tax gets applied in the calculation chain and why
- How order confirmation message structure enhances customer experience
- Why specific rounding approaches prevent floating-point calculation errors
- How order ID generation supports customer service and order tracking needs

---

## Quality Assurance Framework

### Code Review Process
After each AI task completion:

1. **Technical Verification**: Run all checklist items to confirm functionality
2. **Implementation Review**: Read AI progress report to understand technical decisions  
3. **Understanding Checkpoint**: Ensure complete comprehension of implementation approach
4. **Integration Testing**: Verify components work together as expected system
5. **Business Logic Validation**: Confirm all business rules implemented exactly as specified

### Red Flags for Human Intervention
- AI implements features not specified in requirements
- Code doesn't follow TypeScript interfaces defined in data model
- Business logic deviates from documented rules or calculations
- Error handling doesn't match specified customer experience patterns
- Integration points don't align with established service boundaries

### Success Criteria for Human Approval
- All verification checklist items pass completely
- AI implementation report explains key decisions clearly
- Human reviewer understands implementation approach thoroughly  
- Code follows project standards and quality guidelines consistently
- Business requirements implemented accurately without deviations

### Continuous Quality Control
- **Never accept AI code without complete verification process**
- **Always understand implementation decisions before approval**
- **Test edge cases and error scenarios comprehensively**
- **Validate that business rules match specifications exactly**
- **Ensure integration points maintain service boundaries correctly**

This systematic approach ensures AI assistance accelerates development while maintaining human architectural control and code quality standards throughout the implementation process.

---

## Implementation Notes

### Service Implementation Approach

While the original specification called for separate service files in a dedicated services folder, the current implementation includes these services directly in the `src/bot.ts` file. This approach was taken to simplify the initial development process while still maintaining a modular design with clear separation of concerns.

The services are implemented as self-contained objects with well-defined interfaces, making it straightforward to refactor them into separate files in the future if desired. See [Service Implementation Explanation](./service-implementation-explanation.md) for a detailed explanation of this approach and recommendations for future refactoring.

### Key Benefits of Current Approach

- **Simplified Development**: Reduced the number of files to manage during initial implementation
- **Easier Understanding**: Complete flow can be understood in a single file
- **Maintained Modularity**: Services are still implemented with clear boundaries and interfaces
- **Future-Proof Design**: Code structure allows for easy extraction into separate files

### Refactoring Recommendations

If alignment with the original specification is desired, the following steps are recommended:

1. Create a `src/services` directory
2. Extract the `messageParser` object to `src/services/MessageParser.ts`
3. Extract the `orderCalculator` object to `src/services/OrderCalculator.ts`
4. Update imports in `src/bot.ts` to reference these new service files

This refactoring would maintain all existing functionality while aligning with the original architectural vision of separate service files.