# Deploying the Telegram Coffee Shop Bot

This document provides instructions for deploying the Telegram Coffee Shop Bot to a production server.

## Prerequisites

Before deploying, make sure you have:

1. A Telegram bot token from BotFather (see [BotFather Setup Guide](./botfather-setup.md))
2. Access to a server with Ubuntu (our deployment script is designed for Ubuntu)
3. A domain name pointing to your server (e.g., tuba.ludentes.ru)
4. SSH access to your server

## Deployment Steps

### Step 1: Get a Bot Token from BotFather

Before deploying, you need to get a bot token from BotFather:

1. Follow the instructions in [BotFather Setup Guide](./botfather-setup.md) to create a new bot
2. Copy the token provided by BotFather

### Step 2: Set Your Bot Token

You have two options to set your bot token:

#### Option 1: Set as Environment Variable (Recommended)

Set your Telegram bot token as an environment variable before running the deployment script:

```bash
export TELEGRAM_BOT_TOKEN=your_actual_token_from_botfather
```

This will automatically include your token in the .env file created on the server.

#### Option 2: Update the .env File After Deployment

If you've already deployed without setting the token:

```bash
ssh ubuntu@130.193.51.171 "sed -i 's/TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here/TELEGRAM_BOT_TOKEN=your_actual_token_from_botfather/' /var/www/tuba.ludentes.ru/html/bot/.env"
```

Then restart the bot service:

```bash
ssh ubuntu@130.193.51.171 "sudo systemctl restart telegram-coffee-bot"
```

### Step 3: Run the Deployment Script

From the project root directory, run:

```bash
./deploy.sh
```

This script will:

1. Build the TypeScript project
2. Create a deployment package with all necessary files
3. Transfer the files to your server
4. Install Node.js and npm if they're not already installed
5. Set up the bot as a systemd service
6. Start the bot service

### Step 4: Verify the Deployment

After the deployment script completes, you can verify that the bot is running by:

1. Checking the service status:
   ```bash
   ssh ubuntu@130.193.51.171 "sudo systemctl status telegram-coffee-bot"
   ```

2. Viewing the logs:
   ```bash
   ssh ubuntu@130.193.51.171 "sudo journalctl -u telegram-coffee-bot"
   ```

3. Verifying the webhook server is running:
   ```bash
   ssh ubuntu@130.193.51.171 "curl -s localhost:3000"
   ```

4. Testing the bot by sending a message to it on Telegram

### Step 5: Configure Webhook (Optional)

By default, the bot is configured to use webhooks in production mode. The webhook URL is set to:

```
https://tuba.ludentes.ru/webhook/telegram
```

If you need to change this, you can edit the `.env` file on the server:

```bash
ssh ubuntu@130.193.51.171 "nano /var/www/tuba.ludentes.ru/html/bot/.env"
```

For more information on webhook configuration, see the [Webhook Setup Guide](./webhook-setup.md).

## Troubleshooting

### Bot Not Starting

If the bot doesn't start, check the logs:

```bash
ssh ubuntu@130.193.51.171 "sudo journalctl -u telegram-coffee-bot"
```

Common issues include:

1. **Invalid Bot Token**: The most common issue is an invalid or missing bot token. You'll see a "404: Not Found" error in the logs. Make sure the `TELEGRAM_BOT_TOKEN` in the `.env` file is set to a valid token from BotFather.

2. **Missing .env File**: If the .env file is missing or not properly set up, the bot won't start. Check if the file exists:
   ```bash
   ssh ubuntu@130.193.51.171 "cat /var/www/tuba.ludentes.ru/html/bot/.env"
   ```

3. **Node.js Not Installed**: The installation script should install Node.js, but if it fails, you can install it manually:
   ```bash
   ssh ubuntu@130.193.51.171 "curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs"
   ```

4. **Permission Issues**: Make sure the bot has permission to access the necessary files:
   ```bash
   ssh ubuntu@130.193.51.171 "sudo chown -R ubuntu:ubuntu /var/www/tuba.ludentes.ru/html/bot"
   ```

5. **Express Server Not Starting**: If the Express server fails to start, check for port conflicts:
   ```bash
   ssh ubuntu@130.193.51.171 "sudo lsof -i :3000"
   ```
   If another process is using port 3000, you'll need to either stop that process or change the port in your .env file.

### Webhook Not Working

If the webhook isn't working, check:

1. **SSL Certificate**: Make sure your domain has a valid SSL certificate
2. **Nginx Configuration**: Make sure Nginx is configured to proxy requests to your bot
3. **Firewall Settings**: Make sure your server allows incoming connections on port 443
4. **Express Server**: Verify that the Express server is running:
   ```bash
   ssh ubuntu@130.193.51.171 "sudo systemctl status telegram-coffee-bot"
   ```
   You should see output indicating that the bot is running and the Express server has started.
5. **Port Configuration**: Make sure the port specified in your .env file (default: 3000) matches the port in your Nginx configuration.

For more information, see the [Webhook Setup Guide](./webhook-setup.md).

## Redeploying

To redeploy the bot after making changes, simply run the deployment script again:

```bash
./deploy.sh
```

The script will rebuild the project, transfer the updated files, and restart the service.

## Manual Deployment

If you prefer to deploy manually, you can:

1. Build the project:
   ```bash
   npm run build
   ```

2. Copy the necessary files to your server:
   ```bash
   scp -r dist package.json package-lock.json .env.example ubuntu@130.193.51.171:/var/www/tuba.ludentes.ru/html/bot/
   ```

3. Install dependencies on the server:
   ```bash
   ssh ubuntu@130.193.51.171 "cd /var/www/tuba.ludentes.ru/html/bot && npm install --only=production"
   ```

4. Set up the environment:
   ```bash
   ssh ubuntu@130.193.51.171 "cd /var/www/tuba.ludentes.ru/html/bot && cp .env.example .env && nano .env"
   ```

5. Start the bot:
   ```bash
   ssh ubuntu@130.193.51.171 "cd /var/www/tuba.ludentes.ru/html/bot && node dist/bot.js"
   ```

## Additional Resources

- [BotFather Setup Guide](./botfather-setup.md)
- [Webhook Setup Guide](./webhook-setup.md)
- [Telegram Bot API Documentation](https://core.telegram.org/bots/api)
- [Telegraf.js Documentation](https://telegraf.js.org/)