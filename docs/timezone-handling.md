# Timezone Handling in the Telegram Coffee Shop Bot

## Current Implementation

In the current implementation, the bot handles timezones as follows:

1. **Ready Time Calculation**: The bot calculates the estimated ready time by adding 10 minutes to the current server time:

```typescript
calculateReadyTime: (): string => {
  const now = new Date();
  const readyTime = new Date(now.getTime() + 10 * 60000); // Add 10 minutes
  
  // Format time as "1:30 PM"
  return readyTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}
```

2. **Timezone Consideration**: The current implementation does not explicitly handle different timezones. The `toLocaleTimeString` method formats the time according to the server's local timezone, not the user's timezone.

## Implications

1. **Server Timezone**: The ready time displayed to users will be in the server's timezone. If the server is in a different timezone than the user, the ready time might be confusing.

2. **Consistency**: All users will see the same time regardless of their location, which might lead to confusion if the coffee shop serves customers in different timezones.

## Improvement Recommendations

To better handle timezones, we could implement the following improvements:

### 1. Store the Coffee Shop's Timezone

Add a configuration parameter for the coffee shop's timezone:

```typescript
// In .env file
COFFEE_SHOP_TIMEZONE=America/New_York
```

### 2. Format Time in the Coffee Shop's Timezone

Modify the `calculateReadyTime` method to use the coffee shop's timezone:

```typescript
calculateReadyTime: (): string => {
  const now = new Date();
  const readyTime = new Date(now.getTime() + 10 * 60000); // Add 10 minutes
  
  // Format time in the coffee shop's timezone
  return readyTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: process.env.COFFEE_SHOP_TIMEZONE || 'UTC'
  });
}
```

### 3. Include Timezone Information in the Response

Modify the order confirmation message to include the timezone:

```typescript
return `✅ <b>Order Confirmed!</b>

📋 <b>Your Order:</b>
${itemsList}

💰 <b>Order Summary:</b>
Subtotal: $${order.subtotal.toFixed(2)}
Tax: $${order.tax.toFixed(2)}
Total: $${order.total.toFixed(2)}

⏰ <b>Ready by:</b> ${order.estimatedReady} (${process.env.COFFEE_SHOP_TIMEZONE || 'UTC'})
📍 <b>Show this message when picking up</b>
🆔 <b>Order #:</b> ${order.id}`;
```

### 4. Consider User's Timezone (Advanced)

For a more personalized experience, we could try to determine the user's timezone:

1. Ask the user for their location (requires user permission)
2. Use Telegram's location sharing feature
3. Store user preferences including timezone

Then format the time in the user's timezone:

```typescript
calculateReadyTime: (userTimezone?: string): string => {
  const now = new Date();
  const readyTime = new Date(now.getTime() + 10 * 60000); // Add 10 minutes
  
  // Use coffee shop's timezone as default, user's timezone if available
  const timezone = userTimezone || process.env.COFFEE_SHOP_TIMEZONE || 'UTC';
  
  // Format time in the appropriate timezone
  return readyTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: timezone
  });
}
```

## Implementation Priority

For the current version of the bot, implementing options 1-3 would provide a good balance of clarity and simplicity:

1. Define the coffee shop's timezone in the configuration
2. Format times in that timezone
3. Include timezone information in messages

This ensures that all times are consistent and users understand which timezone is being used, without requiring complex user timezone detection.