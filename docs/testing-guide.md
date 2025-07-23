# Telegram Coffee Shop Bot Testing Guide

This document provides specific test messages to send to the bot and the expected responses for each test case. Use this guide to verify that the bot is functioning correctly.

## Basic Commands

### Start Command
**Send to bot:**
```
/start
```

**Expected response:**
```
👋 Welcome to Downtown Coffee Bot!

I can help you order coffee for pickup. Just send me your order in natural language like:
"1 large cappuccino with oat milk" or "2 medium lattes"

Type /menu to see our available options.
```

### Menu Command
**Send to bot:**
```
/menu
```

**Expected response:**
```
📋 Our Menu:

Coffee Options:
• Cappuccino - $3.50
• Latte - $4.00

Sizes:
• Small (-$0.50)
• Medium (standard price)
• Large (+$0.50)

Milk Options:
• Whole milk (included)
• Oat milk (+$0.50)
• Almond milk (+$0.50)

How to Order:
Just type your order like:
"1 large cappuccino with oat milk" or "2 medium lattes with whole milk"
```

### Help Command
**Send to bot:**
```
/help
```

**Expected response:**
```
❓ Need Help?

Ordering:
Just type your order in natural language like:
"1 large cappuccino with oat milk" or "2 medium lattes"

Commands:
/start - Welcome message
/menu - See our menu options
/help - Show this help message

Examples:
• "1 large cappuccino with oat milk"
• "2 medium lattes"
• "1 small cappuccino, 1 large latte with almond milk"

If you need further assistance, please contact us at (555) 123-4567.
```

## Basic Order Tests

### Simple Order
**Send to bot:**
```
1 large cappuccino with oat milk
```

**Expected response:**
```
✅ Order Confirmed!

📋 Your Order:
• 1x Large Cappuccino with Oat Milk - $4.50

💰 Order Summary:
Subtotal: $4.50
Tax: $0.38
Total: $4.88

⏰ Ready by: [current time + 10 minutes]
📍 Show this message when picking up
🆔 Order #: ORD-[timestamp]-[user ID]
```

### Multiple Items Order
**Send to bot:**
```
1 large cappuccino with oat milk and 2 medium lattes
```

**Expected response:**
```
✅ Order Confirmed!

📋 Your Order:
• 1x Large Cappuccino with Oat Milk - $4.50
• 2x Medium Latte with Whole Milk - $8.00

💰 Order Summary:
Subtotal: $12.50
Tax: $1.06
Total: $13.56

⏰ Ready by: [current time + 10 minutes]
📍 Show this message when picking up
🆔 Order #: ORD-[timestamp]-[user ID]
```

### Order with Default Values
**Send to bot:**
```
1 cappuccino
```

**Expected response:**
```
✅ Order Confirmed!

📋 Your Order:
• 1x Medium Cappuccino with Whole Milk - $3.50

💰 Order Summary:
Subtotal: $3.50
Tax: $0.30
Total: $3.80

⏰ Ready by: [current time + 10 minutes]
📍 Show this message when picking up
🆔 Order #: ORD-[timestamp]-[user ID]
```

## Fuzzy Matching Tests

### Abbreviated Coffee Name
**Send to bot:**
```
1 large cap with oat milk
```

**Expected response:**
```
✅ Order Confirmed!

📋 Your Order:
• 1x Large Cappuccino with Oat Milk - $4.50

💰 Order Summary:
Subtotal: $4.50
Tax: $0.38
Total: $4.88

⏰ Ready by: [current time + 10 minutes]
📍 Show this message when picking up
🆔 Order #: ORD-[timestamp]-[user ID]
```

### Abbreviated Size and Milk
**Send to bot:**
```
1 lg latte with alm milk
```

**Expected response:**
```
✅ Order Confirmed!

📋 Your Order:
• 1x Large Latte with Almond Milk - $5.00

💰 Order Summary:
Subtotal: $5.00
Tax: $0.43
Total: $5.43

⏰ Ready by: [current time + 10 minutes]
📍 Show this message when picking up
🆔 Order #: ORD-[timestamp]-[user ID]
```

## Multi-Item Parsing Tests

### Items Separated by Comma
**Send to bot:**
```
2 lattes, 1 small cap
```

**Expected response:**
```
✅ Order Confirmed!

📋 Your Order:
• 2x Medium Latte with Whole Milk - $8.00
• 1x Small Cappuccino with Whole Milk - $3.00

💰 Order Summary:
Subtotal: $11.00
Tax: $0.94
Total: $11.94

⏰ Ready by: [current time + 10 minutes]
📍 Show this message when picking up
🆔 Order #: ORD-[timestamp]-[user ID]
```

### Items Separated by "and"
**Send to bot:**
```
1 small cappuccino with almond milk and 1 large latte
```

**Expected response:**
```
✅ Order Confirmed!

📋 Your Order:
• 1x Small Cappuccino with Almond Milk - $3.50
• 1x Large Latte with Whole Milk - $4.50

💰 Order Summary:
Subtotal: $8.00
Tax: $0.68
Total: $8.68

⏰ Ready by: [current time + 10 minutes]
📍 Show this message when picking up
🆔 Order #: ORD-[timestamp]-[user ID]
```

## Error Handling Tests

### Unknown Menu Item
**Send to bot:**
```
1 espresso
```

**Expected response:**
```
❌ Menu item not found

📋 Available items:
• Cappuccino - $3.50
• Latte - $4.00

Please try again with a valid menu item.
```

### Invalid Format
**Send to bot:**
```
xyz abc
```

**Expected response:**
```
🤔 I didn't understand your order. Please try something like:
'1 large cappuccino with oat milk'
or '2 medium lattes'

Type /menu to see all available options.
```

## Edge Case Tests

### Special Characters
**Send to bot:**
```
1 cappuccino!!! with oat milk???
```

**Expected response:**
```
✅ Order Confirmed!

📋 Your Order:
• 1x Medium Cappuccino with Oat Milk - $4.00

💰 Order Summary:
Subtotal: $4.00
Tax: $0.34
Total: $4.34

⏰ Ready by: [current time + 10 minutes]
📍 Show this message when picking up
🆔 Order #: ORD-[timestamp]-[user ID]
```

### Case Sensitivity
**Send to bot:**
```
1 LARGE CAPPUCCINO with OAT milk
```

**Expected response:**
```
✅ Order Confirmed!

📋 Your Order:
• 1x Large Cappuccino with Oat Milk - $4.50

💰 Order Summary:
Subtotal: $4.50
Tax: $0.38
Total: $4.88

⏰ Ready by: [current time + 10 minutes]
📍 Show this message when picking up
🆔 Order #: ORD-[timestamp]-[user ID]
```

### Extra Spaces
**Send to bot:**
```
1   large    cappuccino   with    oat    milk
```

**Expected response:**
```
✅ Order Confirmed!

📋 Your Order:
• 1x Large Cappuccino with Oat Milk - $4.50

💰 Order Summary:
Subtotal: $4.50
Tax: $0.38
Total: $4.88

⏰ Ready by: [current time + 10 minutes]
📍 Show this message when picking up
🆔 Order #: ORD-[timestamp]-[user ID]
```

## Testing Checklist

- [x] All commands (/start, /menu, /help) return the expected responses
- [x] Simple orders are processed correctly
- [x] Multiple item orders are processed correctly
- [x] Default values are applied when size or milk type is not specified
- [x] Fuzzy matching correctly identifies abbreviated or misspelled items
- [x] Multi-item parsing works with different separators (comma, "and")
- [x] Error messages are helpful and guide the user toward successful ordering
- [x] Edge cases (special characters, case sensitivity, extra spaces) are handled properly
- [x] Order calculations (subtotal, tax, total) are accurate
- [x] Order IDs are unique and follow the expected format
- [x] Ready time is correctly calculated (current time + 10 minutes)