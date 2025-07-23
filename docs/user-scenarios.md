# User Scenarios and Stories

This document defines the customer experience and business requirements that drive our technical implementation.

## Primary User Scenario

**Context**: Sarah is a busy professional who wants coffee during her 15-minute break. She discovers our Telegram bot and wants to place an order for pickup.

**User Journey:**
1. **Discovery**: Sarah finds @DowntownCoffeeBot through a friend's recommendation
2. **First Interaction**: She sends `/start` and receives a welcoming menu preview  
3. **Order Placement**: She types "1 large cappuccino with oat milk" in natural language
4. **Confirmation**: Bot responds with pricing, tax, estimated ready time, and order number
5. **Pickup**: Sarah shows the confirmation message at the counter 15 minutes later

**Success Criteria:**
- Order placed in under 30 seconds
- Natural language understanding works without training
- Pricing is transparent and accurate
- Pickup process is smooth and fast

## User Stories

### Story 1: Natural Language Ordering
**As a customer**  
**I want to order coffee using natural language**  
**So that I can place orders quickly without learning complex menus or commands**

**Acceptance Criteria:**
- ✅ Customer can type "1 large cappuccino with oat milk" and receive accurate order
- ✅ Bot understands common abbreviations like "cap" for "cappuccino"  
- ✅ Bot applies default values (medium size, whole milk) when not specified
- ✅ Bot handles multiple items: "2 lattes, 1 small cappuccino"
- ✅ Bot provides helpful error messages for unknown items

**Examples:**
```
Valid Inputs:
• "1 large cappuccino with oat milk"
• "2 medium lattes" 
• "1 cap, 1 latte with almond milk"
• "large cappuccino" (defaults to whole milk)

Invalid Inputs:
• "1 espresso" → "Sorry, I couldn't find 'espresso' on our menu..."
• "xyz abc" → "I didn't understand your order. Please try..."
```

### Story 2: Order Confirmation and Pricing  
**As a customer**  
**I want to receive immediate order confirmation with transparent pricing**  
**So that I know exactly what I'm paying and when my order will be ready**

**Acceptance Criteria:**
- ✅ Confirmation includes itemized pricing with size and milk modifiers
- ✅ Tax calculation (8.5%) is shown separately and calculated correctly
- ✅ Estimated ready time is provided (current time + 10 minutes)
- ✅ Order ID is provided for pickup reference
- ✅ Message is formatted clearly with emojis and structure

**Confirmation Format:**
```
✅ Order Confirmed!

📋 Your Order:
• Large Cappuccino with oat milk - $4.00

💰 Order Summary:
Subtotal: $4.00
Tax: $0.34
Total: $4.34

⏰ Ready by: 2:45 PM
📍 Show this message when picking up  
🆔 Order #: ORD-ABC123
```

### Story 3: Error Handling and Guidance
**As a customer**  
**I want helpful error messages when my order isn't understood**  
**So that I can learn how to order successfully**

**Acceptance Criteria:**
- ✅ Unknown items trigger menu suggestions with available options
- ✅ Parsing errors include example formats and helpful tips
- ✅ Errors are friendly and encouraging, not technical or intimidating
- ✅ Bot suggests alternative actions (/menu, /help) when appropriate

**Error Message Examples:**
```
Unknown Item Error:
"❌ Sorry, I couldn't find 'espresso' on our menu.

📋 Available items:
• Cappuccino - $3.50
• Latte - $4.00

Please try again with a valid menu item."

Parsing Error:
"🤔 I didn't understand your order. Please try something like:
'1 large cappuccino with oat milk'
or '2 medium lattes'

Type /menu to see all available options."
```

## Business Requirements

### Menu and Pricing Rules
- **Menu Items**: Cappuccino ($3.50), Latte ($4.00)
- **Size Modifiers**: Small (-$0.50), Medium (+$0.00), Large (+$0.50)  
- **Milk Options**: Whole milk (+$0.00), Oat/Almond milk (+$0.50)
- **Tax Rate**: 8.5% applied to subtotal
- **Preparation Time**: 10 minutes for all orders

### Operational Constraints
- **Business Hours**: 6:00 AM - 8:00 PM, Monday-Sunday
- **Response Time**: All messages acknowledged within 30 seconds
- **Order Accuracy**: Pricing calculations must be precise to the cent
- **Customer Service**: Error messages must guide customers to successful ordering

### Quality Standards
- **Natural Language Processing**: Support common abbreviations and variations
- **Fuzzy Matching**: "cap" should match "Cappuccino" reliably
- **Default Handling**: Apply sensible defaults for missing size/milk specifications
- **Multiple Items**: Parse complex orders with multiple items and modifications

## Success Metrics

### Customer Experience
- **Order Completion Rate**: >90% of order attempts result in successful confirmation
- **Error Recovery Rate**: >80% of customers who receive error messages successfully place orders on retry
- **Average Order Time**: <60 seconds from first message to confirmation

### Technical Performance  
- **Parsing Accuracy**: >95% of valid orders parsed correctly on first attempt
- **Calculation Accuracy**: 100% accurate pricing with proper tax and modifier application
- **Response Time**: <3 seconds for order confirmation generation
- **Error Handling**: 0% system crashes, all errors handled gracefully

### Business Impact
- **Order Volume**: Enable 20+ orders per hour during peak times
- **Customer Satisfaction**: Clear pricing and pickup process reduces counter questions
- **Operational Efficiency**: Reduces phone order handling time by 50%

## Future Expansion Scenarios

### Additional Features (Out of Scope for Demo)
- **Payment Integration**: Process payments through Telegram's native payments
- **Order Status Updates**: Notify customers when orders are ready
- **Loyalty Program**: Track repeat customers and offer rewards
- **Group Orders**: Allow multiple people to add items to shared order

### Platform Expansion
- **WhatsApp Business API**: Same user stories apply with platform-specific message formatting
- **Discord Integration**: Adapt for server-based coffee ordering
- **Slack Integration**: Enable workplace coffee ordering through Slack channels

The systematic documentation approach demonstrated here scales to these additional platforms while preserving the core user experience and business logic.