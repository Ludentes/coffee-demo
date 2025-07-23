# Setting Up a Webhook for Your Telegram Bot

This guide explains how to configure your Telegram bot to use a webhook, which allows Telegram to send updates to your server whenever your bot receives a message.

## What is a Webhook?

A webhook is a way for Telegram to notify your server when your bot receives a message or other updates. Instead of your bot constantly asking Telegram if there are new messages (polling), Telegram will send HTTP requests to your server whenever there's an update for your bot.

Using webhooks is recommended for production environments because:
- It's more efficient than polling
- It reduces latency in message processing
- It's more reliable for high-traffic bots

## Prerequisites

Before setting up a webhook, you need:
1. A server with a public IP address or domain name
2. HTTPS support (Telegram only sends webhook requests to HTTPS URLs)
3. A valid SSL certificate for your domain
4. Your bot token from BotFather (see [BotFather Setup Guide](./botfather-setup.md))

## Step 1: Configure Your Environment Variables

Edit your `.env` file to include the following variables:

```
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_bot_token_here

# Environment Configuration
NODE_ENV=production

# Server Configuration
PORT=3000
WEBHOOK_DOMAIN=https://tuba.ludentes.ru
WEBHOOK_PATH=/webhook/telegram

# Logging Configuration
LOG_LEVEL=info
```

Replace:
- `your_bot_token_here` with your actual bot token
- `https://tuba.ludentes.ru` with your server's domain name
- `/webhook/telegram` with your preferred webhook path

## Step 2: Deploy Your Bot to the Server

Use the provided `deploy.sh` script to deploy your bot to your server:

```bash
./deploy.sh
```

This script will:
1. Build your TypeScript project
2. Package the necessary files
3. Transfer them to your server using SCP
4. Set up a systemd service to run your bot

## Step 3: Configure Nginx (Optional but Recommended)

If you're using Nginx as a reverse proxy, add the following configuration to your server block:

```nginx
location /webhook/telegram {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

Replace:
- `/webhook/telegram` with your webhook path
- `3000` with your application port

## Step 4: Verify Your Webhook Setup

You can verify that your webhook is set up correctly by visiting:

```
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo
```

Replace `<YOUR_BOT_TOKEN>` with your actual bot token.

You should see a response like:

```json
{
  "ok": true,
  "result": {
    "url": "https://tuba.ludentes.ru/webhook/telegram",
    "has_custom_certificate": false,
    "pending_update_count": 0,
    "max_connections": 40,
    "ip_address": "123.456.789.0"
  }
}
```

## Step 5: Test Your Bot

Send a message to your bot on Telegram. If everything is set up correctly, your bot should respond according to your implementation.

## Troubleshooting

### Webhook Not Working

If your webhook isn't working, check:

1. **SSL Certificate**: Ensure your SSL certificate is valid and not expired
2. **Firewall Settings**: Make sure your server allows incoming connections on port 443
3. **Nginx Configuration**: Verify your Nginx configuration is correct
4. **Application Logs**: Check your application logs for errors
5. **Telegram API Logs**: Use the getWebhookInfo method to see if Telegram is reporting any issues
6. **Express Server**: Verify that the Express server is running and listening on the correct port
7. **Request Handling**: Check that the webhook endpoint is correctly configured to handle Telegram updates

### Switching Back to Polling

If you need to switch back to polling mode for development:

1. Set `NODE_ENV=development` in your `.env` file
2. Remove the webhook by visiting:
   ```
   https://api.telegram.org/bot<YOUR_BOT_TOKEN>/deleteWebhook
   ```
3. Restart your bot

## Understanding Webhook Behavior

When using webhooks, you need a web server to handle incoming webhook requests from Telegram. Our implementation uses Express to create this web server.

You might notice something interesting in your logs:

```
telegram-coffee-bot[636877]: [INFO] Bot started with webhook: https://tuba.ludentes.ru/webhook/telegram
telegram-coffee-bot[636877]: [INFO] Bot webhook server started on port 3000
```

Unlike the previous implementation where the bot would exit after setting up the webhook, our current implementation:

1. Sets up the webhook with the Telegram API
2. Starts an Express server to listen for incoming webhook requests
3. Keeps running to process incoming webhook requests

This is the correct behavior for a webhook-based bot. The bot needs to keep running to handle incoming webhook requests from Telegram.

### Systemd Configuration

Our systemd service is now configured as a standard service (not oneshot) since the bot process needs to keep running:

```ini
[Service]
Type=simple
User=ubuntu
WorkingDirectory=/var/www/tuba.ludentes.ru/html/bot
ExecStart=/bin/bash /var/www/tuba.ludentes.ru/html/bot/start.sh
Restart=on-failure
RestartSec=10
```

This configuration means:
- The service will start the bot
- The bot will set up the webhook and start an Express server
- The service will keep the bot process running
- If the bot crashes, systemd will restart it after 10 seconds

## How Our Implementation Works

In our `bot.ts` file, we have the following code that sets up the webhook or polling based on the environment:

```typescript
// Initialize Telegraf bot with webhookReply disabled for session safety
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN, {
  telegram: { webhookReply: false }
});

// Start the bot
const startBot = async () => {
  try {
    // Use webhook in production, polling in development
    if (process.env.NODE_ENV === 'production' && process.env.WEBHOOK_DOMAIN && process.env.WEBHOOK_PATH) {
      const webhookUrl = `${process.env.WEBHOOK_DOMAIN}${process.env.WEBHOOK_PATH}`;
      const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
      
      // Set up the webhook
      await bot.telegram.setWebhook(webhookUrl);
      logger.info(`Bot webhook set to: ${webhookUrl}`);
      
      // Start Express server to handle webhook requests
      const app = express();
      
      // Set the bot webhook to the path specified in .env
      app.use(bot.webhookCallback(process.env.WEBHOOK_PATH));
      
      // Start the server
      app.listen(port, () => {
        logger.info(`Webhook server listening on port ${port}`);
      });
    } else {
      // Use polling for development
      await bot.launch();
      logger.info('Bot started in polling mode');
      // In polling mode, the bot keeps running and checking for new messages
    }
    
    // Enable graceful stop
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
  } catch (error) {
    logger.error('Failed to start bot', error as Error);
    process.exit(1);
  }
};
```

This code:
1. Initializes the Telegraf bot with `webhookReply: false` for session safety
2. Checks if we're in production mode and have webhook configuration
3. If yes:
   - Sets up the webhook with Telegram
   - Creates an Express server to handle incoming webhook requests
   - Uses Telegraf's built-in `webhookCallback` method to handle webhook requests
   - Starts the server on the specified port
4. If no, uses polling mode
5. Sets up graceful shutdown handlers

### Important Notes About Webhook Implementation

1. **webhookReply: false**: We disable webhook replies for session safety, as recommended in the Telegraf documentation. This ensures that session data is properly handled when using webhooks.

2. **bot.webhookCallback()**: We use Telegraf's built-in `webhookCallback` method to handle webhook requests. This method creates an Express middleware that processes incoming webhook requests and passes them to the bot.

3. **Continuous Process**: Unlike some webhook implementations where the bot sets up the webhook and then exits, our implementation keeps the process running to handle incoming webhook requests. This is why we use `Type=simple` in our systemd service configuration instead of `Type=oneshot`.

## Advanced Webhook Configuration

For advanced webhook configuration, you can use the Telegram API directly:

```
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://tuba.ludentes.ru/webhook/telegram&max_connections=40&drop_pending_updates=true
```

Parameters:
- `url`: Your webhook URL
- `max_connections`: Maximum number of simultaneous HTTPS connections for webhook updates (default: 40)
- `drop_pending_updates`: Whether to drop all pending updates (useful when redeploying)

## Security Considerations

1. **Keep Your Bot Token Secret**: Never commit your bot token to version control
2. **Use HTTPS**: Always use HTTPS for your webhook URL
3. **Validate Incoming Requests**: Verify that incoming requests are actually from Telegram
4. **Rate Limiting**: Implement rate limiting to prevent abuse
5. **IP Whitelisting**: Consider whitelisting Telegram's IP addresses

## Additional Resources

- [Telegram Bot API Documentation](https://core.telegram.org/bots/api#setwebhook)
- [Telegraf.js Documentation](https://telegraf.js.org/#/?id=webhooks)
- [Let's Encrypt](https://letsencrypt.org/) (for free SSL certificates)