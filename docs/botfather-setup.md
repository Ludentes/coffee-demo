# Setting Up Your Telegram Bot with BotFather

This guide will walk you through the process of creating and configuring a Telegram bot for the Coffee Shop Bot demo using BotFather.

## What is BotFather?

BotFather is the official Telegram bot that helps you create and manage your Telegram bots. It provides a simple interface to create new bots and change their settings.

## Step 1: Start a Chat with BotFather

1. Open the Telegram app on your device
2. Search for `@BotFather` in the search bar
3. Start a chat with BotFather by clicking on it
4. Click the "Start" button or send `/start` to begin

## Step 2: Create a New Bot

1. Send the command `/newbot` to BotFather
2. BotFather will ask you to choose a name for your bot
   - This is the display name that will appear in contacts and conversations
   - Example: "Downtown Coffee Bot"
3. Next, choose a username for your bot
   - Must end with "bot" (e.g., `downtown_coffee_bot`)
   - Must be unique across Telegram
   - Can only contain Latin characters, numbers, and underscores

## Step 3: Get Your Bot Token

After successfully creating your bot, BotFather will provide you with a token. It will look something like this:
```
123456789:ABCDefGhIJKlmNoPQRsTUVwxyZ
```

**IMPORTANT:** This token is used to authenticate your bot and should be kept secret. Anyone with this token can control your bot.

## Step 4: Configure Your Bot (Optional but Recommended)

### Set Bot Description
1. Send `/setdescription` to BotFather
2. Select your bot
3. Send a description of your bot (up to 512 characters)
   ```
   I'm a coffee ordering bot for Downtown Coffee Shop. Send me your order in natural language, and I'll confirm it with pricing and pickup details.
   ```

### Set Bot About Info
1. Send `/setabouttext` to BotFather
2. Select your bot
3. Send a short description (up to 120 characters)
   ```
   Order coffee using natural language. Try "1 large cappuccino with oat milk"
   ```

### Set Bot Profile Picture
1. Send `/setuserpic` to BotFather
2. Select your bot
3. Send an image file (square image recommended)

### Set Bot Commands
1. Send `/setcommands` to BotFather
2. Select your bot
3. Send the list of commands with descriptions (one command per line, command followed by description)
   ```
   start - Welcome message and introduction
   menu - Show available coffee options and prices
   help - Get help with ordering
   ```

## Step 5: Configure Your Bot for Privacy

By default, bots can see all messages in a group. For a coffee ordering bot, you might want to change this setting:

1. Send `/setprivacy` to BotFather
2. Select your bot
3. Choose `Enable` to make your bot only see messages that start with a slash (/) or messages that mention the bot by username
   - For a coffee ordering bot, you might want to choose `Disable` so it can see all messages in private chats

## Step 6: Update Your .env File

1. Open the `.env` file in your project
2. Replace the placeholder with your actual bot token:
   ```
   TELEGRAM_BOT_TOKEN=your_bot_token_here
   ```
   Replace `your_bot_token_here` with the token you received from BotFather

## Step 7: Test Your Bot

1. Start a chat with your bot by searching for its username
2. Send the `/start` command to see the welcome message
3. Try ordering coffee with a message like "1 large cappuccino with oat milk"
4. Verify that your bot responds correctly

## Troubleshooting

If your bot doesn't respond:
1. Make sure your application is running
2. Check that you've entered the correct token in the `.env` file
3. Ensure your bot's privacy settings are configured correctly
4. Check the application logs for any errors

## Additional BotFather Commands

- `/mybots` - Lists all your bots and allows you to edit them
- `/setname` - Change your bot's name
- `/setusername` - Change your bot's username
- `/deletebot` - Delete a bot
- `/setinline` - Enable/disable inline mode for your bot
- `/setinlinegeo` - Enable/disable inline location requests
- `/setjoingroups` - Control whether your bot can be added to groups

## Next Steps

After setting up your bot with BotFather, you can deploy your application to make your bot available 24/7. Use the `deploy.sh` script to deploy your bot to your server.

For more information on Telegram Bot API, visit: https://core.telegram.org/bots/api