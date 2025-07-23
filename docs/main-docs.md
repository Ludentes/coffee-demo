# Telegram Coffee Shop Order Bot Demo

A minimal demonstration of systematic AI-assisted development for Telegram Bot integration. This project shows how proper context documentation enables AI to generate production-ready code that integrates correctly with business requirements.

## 🎯 Project Goal

Build a Telegram bot that processes coffee orders in natural language and responds with formatted order confirmations. Input: "1 large cappuccino with oat milk" → Output: Professional order confirmation with pricing, tax, and pickup details.

## 📁 Project Structure

```
src/
├── bot.ts                   # Main Telegram bot setup and message handling
├── types.ts                 # TypeScript interfaces for domain objects
└── services/
    ├── MessageParser.ts     # Parse natural language orders
    └── OrderCalculator.ts   # Calculate pricing and format responses
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ and npm
- Telegram account
- Bot token from @BotFather

### Bot Setup
1. Message @BotFather on Telegram
2. Use `/newbot` command to create your bot
3. Save the bot token provided
4. Optionally set bot description and commands with @BotFather

### Development Setup
```bash
# Clone and install dependencies
git clone <repository-url>
cd telegram-coffee-bot
npm install

# Environment setup
cp .env.example .env
# Edit .env with your bot token from @BotFather

# Start development server
npm run dev
# Bot will start and listen for messages
```

### Production Deployment
```bash
npm run build
npm run start
```

## 📋 Implementation Requirements

### Core Business Logic
- **Menu Items**: Cappuccino ($3.50), Latte ($4.00)
- **Sizes**: Small (-$0.50), Medium (+$0.00), Large (+$0.50)
- **Milk Options**: Whole milk (+$0.00), Oat/Almond milk (+$0.50)
- **Tax Rate**: 8.5% applied to subtotal
- **Prep Time**: 10 minutes for all orders

### Technical Requirements
- **TypeScript**: Strict mode, no `any` types
- **Error Handling**: Custom error classes for different failure types
- **Response Format**: Telegram Bot API compatible JSON structure
- **Logging**: Structured logs for debugging and monitoring

## 🔧 Key Implementation Files

### 1. `/src/bot.ts` - Main Bot Handler
**Purpose**: Telegraf bot setup that receives Telegram messages and sends confirmations
**Requirements**:
- Initialize Telegraf bot with proper token configuration
- Handle text messages from customers in private chats
- Extract customer information and message text
- Process orders through MessageParser and OrderCalculator
- Send formatted HTML responses back to Telegram
- Handle all error cases gracefully with user-friendly messages

### 2. `/src/services/MessageParser.ts` - Natural Language Processing
**Purpose**: Convert order text like "1 large cap with oat milk" into structured data
**Requirements**:
- Fuzzy string matching for menu items ("cap" → "Cappuccino")
- Extract quantities, sizes, and milk preferences from natural language
- Support multiple items in one message separated by commas
- Return detailed error messages for invalid input with suggestions
- Use default values for missing information (medium size, whole milk)

### 3. `/src/services/OrderCalculator.ts` - Business Logic
**Purpose**: Calculate pricing and generate customer-facing order confirmations
**Requirements**:
- Precise decimal arithmetic for currency calculations
- Apply tax to subtotal, round to nearest cent
- Generate unique order IDs and estimated ready times
- Format confirmation message with HTML markup for Telegram
- Follow exact message template from specifications with emojis

## 📊 Test Cases

### Valid Orders
```bash
# Simple order - test via Telegram app
Send: "1 large cappuccino with oat milk"
Expected: Order confirmation with $4.34 total ($4.00 + $0.34 tax)

# Multiple items
Send: "2 medium lattes, 1 small cappuccino"
Expected: Order confirmation with correct totals for each item

# Fuzzy matching
Send: "1 large cap with oat milk"
Expected: Correctly matches "Cappuccino"
```

### Error Cases
```bash
# Invalid menu item
Send: "1 espresso"
Expected: Menu item not found error with available options

# Unparseable text
Send: "blah blah blah"
Expected: Parsing error with example format and /menu suggestion
```

## 🎯 Success Criteria

### Technical Validation
- [ ] TypeScript compiles without errors using strict mode
- [ ] Bot responds to messages sent via Telegram app
- [ ] All test cases return expected results
- [ ] Error handling provides helpful customer messages
- [ ] Order calculations match business rules exactly
- [ ] Response format displays properly in Telegram with HTML formatting

### Business Validation
- [ ] Menu item fuzzy matching works reliably for common abbreviations
- [ ] Pricing calculations include all modifiers and tax correctly
- [ ] Order confirmations are professional and include all required information
- [ ] Error messages guide customers to successful orders with clear examples
- [ ] System handles edge cases gracefully without crashing

## 🏗️ Architecture Principles

### Type Safety
All data structures use TypeScript interfaces defined in `types.ts`. No `any` types permitted throughout codebase.

### Error Handling
Custom error classes for different failure modes:
- `MenuItemNotFoundError`: Unknown item in order text
- `ParseError`: Cannot understand order format
- `ValidationError`: Invalid data structure

### Integration Pattern
Each service has a single responsibility:
- **MessageParser**: Natural language → Structured data
- **OrderCalculator**: Structured data → Business logic → Customer response
- **Bot**: Telegram API handling and service coordination

### Response Standards
All responses follow consistent format:
```typescript
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

## 📖 Documentation References

- **Complete Specifications**: See `/docs/demo-context.md` for full requirements
- **Business Rules**: Pricing, tax calculation, and message formatting details
- **Telegram Integration**: Bot API format and response structure
- **Human Verification**: Checklists for validating AI-generated code

## 🎬 Demo Context

This is a **minimal demonstration** of systematic AI-assisted development. The same context-first approach scales to enterprise systems with:
- Database integration and order persistence
- Payment processing and POS system integration
- Multi-language support and internationalization
- Advanced analytics and customer insights
- Inventory management and real-time updates

## 🔄 Future Platform Expansion

This Telegram implementation demonstrates platform-agnostic business logic:

### WhatsApp Business API Integration
- **Domain Model**: 100% reusable (Customer, Order, MenuItem)
- **Business Logic**: 95% reusable (same pricing, parsing, calculations)
- **Platform Changes**: Message format, template requirements, authentication
- **Migration Effort**: Estimated 2-3 weeks for WhatsApp integration

### Multi-Platform Strategy
- **Shared Services**: MessageParser and OrderCalculator work across platforms
- **Platform Adapters**: Each messaging platform gets its own bot handler
- **Unified Database**: Single source of truth for orders and customer data
- **Consistent Experience**: Same menu, pricing, and business rules everywhere

## 🔍 For AI Development Tools

When implementing this project:

1. **Read the full specification** in `/docs/demo-context.md` before writing any code
2. **Follow the TypeScript interfaces** exactly as defined in types.ts
3. **Implement business rules precisely** as documented (tax rate, pricing, formatting)
4. **Use the error handling patterns** specified for consistency across services
5. **Test against all provided test cases** to ensure correctness and reliability
6. **Provide implementation reports** explaining key decisions and integration points

The goal is not just working code, but code that demonstrates how systematic documentation enables reliable AI assistance while maintaining human understanding and control.

**Key Principle**: Comprehensive context documentation enables AI to generate code that integrates correctly with business requirements and technical architecture, while keeping developers in full control of the implementation process.# WhatsApp Coffee Bot Demo

A minimal demonstration of systematic AI-assisted development for WhatsApp Business integration. This project shows how proper context documentation enables AI to generate production-ready code that integrates correctly with business requirements.

## 🎯 Project Goal

Build a WhatsApp webhook that processes coffee orders in natural language and responds with formatted order confirmations. Input: "1 large cappuccino with oat milk" → Output: Professional order confirmation with pricing, tax, and pickup details.

## 📁 Project Structure

```
src/
├── webhook.ts               # Main WhatsApp webhook endpoint
├── types.ts                 # TypeScript interfaces for domain objects
└── services/
    ├── MessageParser.ts     # Parse natural language orders
    └── OrderCalculator.ts   # Calculate pricing and format responses
```

## 🚀 Quick Start

```bash
npm install
npm run dev
# Server runs on http://localhost:3000
# Webhook endpoint: POST /webhook/whatsapp
```

## 📋 Implementation Requirements

### Core Business Logic
- **Menu Items**: Cappuccino ($3.50), Latte ($4.00)
- **Sizes**: Small (-$0.50), Medium (+$0.00), Large (+$0.50)
- **Milk Options**: Whole milk (+$0.00), Oat/Almond milk (+$0.50)
- **Tax Rate**: 8.5% applied to subtotal
- **Prep Time**: 10 minutes for all orders

### Technical Requirements
- **TypeScript**: Strict mode, no `any` types
- **Error Handling**: Custom error classes for different failure types
- **Response Format**: WhatsApp-compatible JSON structure
- **Logging**: Structured logs for debugging and monitoring

## 🔧 Key Implementation Files

### 1. `/src/webhook.ts` - Main Endpoint
**Purpose**: Express.js server that receives WhatsApp messages and sends confirmations
**Requirements**:
- POST endpoint accepting WhatsApp webhook format
- Extract customer phone and message text
- Process orders through MessageParser and OrderCalculator
- Return formatted WhatsApp response
- Handle all error cases gracefully

### 2. `/src/services/MessageParser.ts` - Natural Language Processing
**Purpose**: Convert order text like "1 large cap with oat milk" into structured data
**Requirements**:
- Fuzzy string matching for menu items ("cap" → "Cappuccino")
- Extract quantities, sizes, and milk preferences
- Support multiple items in one message
- Return detailed error messages for invalid input
- Use default values for missing information

### 3. `/src/services/OrderCalculator.ts` - Business Logic
**Purpose**: Calculate pricing and generate customer-facing order confirmations
**Requirements**:
- Precise decimal arithmetic for currency calculations
- Apply tax to subtotal, round to nearest cent
- Generate unique order IDs and estimated ready times
- Format confirmation message with emojis and structure
- Follow exact message template from specifications

## 📊 Test Cases

### Valid Orders
```bash
# Simple order
curl -X POST localhost:3000/webhook/whatsapp \
  -H "Content-Type: application/json" \
  -d '{"from": "1234567890", "text": {"body": "1 large cappuccino with oat milk"}}'

# Expected result: $4.50 + $0.38 tax = $4.88 total

# Multiple items
curl -X POST localhost:3000/webhook/whatsapp \
  -H "Content-Type: application/json" \
  -d '{"from": "1234567890", "text": {"body": "2 medium lattes, 1 small cappuccino"}}'

# Fuzzy matching
curl -X POST localhost:3000/webhook/whatsapp \
  -H "Content-Type: application/json" \
  -d '{"from": "1234567890", "text": {"body": "1 large cap with oat milk"}}'
```

### Error Cases
```bash
# Invalid menu item
curl -X POST localhost:3000/webhook/whatsapp \
  -H "Content-Type: application/json" \
  -d '{"from": "1234567890", "text": {"body": "1 espresso"}}'

# Unparseable text
curl -X POST localhost:3000/webhook/whatsapp \
  -H "Content-Type: application/json" \
  -d '{"from": "1234567890", "text": {"body": "blah blah blah"}}'
```

## 🎯 Success Criteria

### Technical Validation
- [ ] TypeScript compiles without errors
- [ ] All test cases return expected results
- [ ] Error handling provides helpful customer messages
- [ ] Order calculations match business rules exactly
- [ ] Response format follows WhatsApp API specification

### Business Validation
- [ ] Menu item fuzzy matching works reliably
- [ ] Pricing calculations include all modifiers and tax
- [ ] Order confirmations are professional and clear
- [ ] Error messages guide customers to successful orders
- [ ] System handles edge cases gracefully

## 🏗️ Architecture Principles

### Type Safety
All data structures use TypeScript interfaces defined in `types.ts`. No `any` types permitted.

### Error Handling
Custom error classes for different failure modes:
- `MenuItemNotFoundError`: Unknown item in order
- `ParseError`: Cannot understand order text
- `ValidationError`: Invalid data format

### Integration Pattern
Each service has a single responsibility:
- **MessageParser**: Text → Structured data
- **OrderCalculator**: Data → Business logic → Response
- **Webhook**: HTTP handling and service coordination

### Response Standards
All responses follow consistent format:
```typescript
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

## 📖 Documentation References

- **Complete Specifications**: See `/docs/demo-context.md` for full requirements
- **Business Rules**: Pricing, tax calculation, and message formatting
- **WhatsApp Integration**: Webhook format and response structure
- **Human Verification**: Checklists for validating AI-generated code

## 🎬 Demo Context

This is a **minimal demonstration** of systematic AI-assisted development. The same context-first approach scales to enterprise systems with:
- Database integration and persistence
- Authentication and security layers
- Payment processing and POS integration
- Monitoring, alerting, and analytics
- Multi-language and multi-region support

**Key Principle**: Comprehensive context documentation enables AI to generate code that integrates correctly with business requirements and technical architecture.

## 🔍 For AI Development Tools

When implementing this project:

1. **Read the full specification** in `/docs/demo-context.md` before writing any code
2. **Follow the TypeScript interfaces** exactly as defined
3. **Implement business rules precisely** as documented
4. **Use the error handling patterns** specified for consistency
5. **Test against all provided test cases** to ensure correctness
6. **Provide implementation reports** explaining key decisions and integration points

The goal is not just working code, but code that demonstrates how systematic documentation enables reliable AI assistance while maintaining human understanding and control.