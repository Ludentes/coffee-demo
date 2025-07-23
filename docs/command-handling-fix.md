# Command Handling Fix

## Issue Identified

During testing, we discovered that the bot is not properly handling commands. When a user sends the `/menu` command, instead of displaying the menu, the bot responds with an error message or doesn't respond at all.

## Root Cause Analysis

After examining the code in `src/bot.ts`, we identified two issues:

1. **Initial Issue**: The text message handler was processing all text messages, including commands, and trying to parse them as orders.
   - We added a check to skip processing commands in the text message handler.

2. **Second Issue**: The order of middleware registration in Telegraf matters. The command handlers were registered after the message handler, which meant they weren't getting a chance to process the commands.
   - Even with the command check in the message handler, the command handlers themselves weren't being triggered.

## Implemented Fixes

### Fix 1: Skip Command Processing in Message Handler

We modified the text message handler to check if the message is a command and skip processing it:

```typescript
// Skip processing commands (they are handled by specific command handlers)
if (ctx.message.text.startsWith('/')) {
  logger.info('Skipping command message', { command: ctx.message.text });
  return;
}
```

### Fix 2: Reorder Middleware Registration

We moved the command handlers to be registered before the message handler:

```typescript
// Register command handlers first
bot.command('start', async (ctx) => { /* ... */ });
bot.command('menu', async (ctx) => { /* ... */ });
bot.command('help', async (ctx) => { /* ... */ });

// Then register the message handler
bot.on(message('text'), async (ctx) => { /* ... */ });
```

## Additional Considerations

1. **BotFather Registration**: While not strictly necessary for the commands to work in the code, registering commands with BotFather provides a better user experience by showing available commands in the Telegram interface. See [BotFather Commands Guide](./botfather-commands.md) for details.

2. **Middleware Order**: In Telegraf, the order of middleware registration is critical. Always register specific handlers (like command handlers) before more general handlers (like the message handler).

## Expected Outcome

After implementing these fixes:
- The `/menu` command will be handled by the dedicated command handler
- The bot will display the menu as expected
- The text message handler will only process non-command messages