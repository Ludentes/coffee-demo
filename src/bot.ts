import { Telegraf, Context } from 'telegraf';
import { message } from 'telegraf/filters';
import * as dotenv from 'dotenv';
import express from 'express';
import { ParsedOrder, Order, OrderItem } from './types';

// Load environment variables
dotenv.config();

// Custom error classes for different failure modes
class MenuItemNotFoundError extends Error {
  constructor(itemName: string) {
    super(`Menu item not found: ${itemName}`);
    this.name = 'MenuItemNotFoundError';
  }
}

class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ParseError';
  }
}

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Logging utility
const logger = {
  info: (message: string, data?: Record<string, unknown>): void => {
    console.log(`[INFO] ${message}`, data ? JSON.stringify(data) : '');
  },
  error: (message: string, error?: Error): void => {
    console.error(`[ERROR] ${message}`, error ? `\n${error.stack}` : '');
  },
  warn: (message: string, data?: Record<string, unknown>): void => {
    console.warn(`[WARN] ${message}`, data ? JSON.stringify(data) : '');
  }
};

// Validate environment variables
if (!process.env.TELEGRAM_BOT_TOKEN) {
  logger.error('TELEGRAM_BOT_TOKEN is not defined in environment variables');
  process.exit(1);
}

// Initialize Telegraf bot with webhookReply disabled for session safety
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN, {
  telegram: { webhookReply: false }
});

// Customer interface
interface Customer {
  id: string;
  name: string;
  username?: string;
}

// Response formatter for HTML messages
const formatHtmlResponse = {
  orderConfirmation: (order: Order): string => {
    const itemsList = order.items
      .map(item => `• ${item.quantity}x ${item.size} ${item.menuItem.name} with ${item.milkType} - $${item.itemTotal.toFixed(2)}`)
      .join('\n');

    return `✅ <b>Order Confirmed!</b>

📋 <b>Your Order:</b>
${itemsList}

💰 <b>Order Summary:</b>
Subtotal: $${order.subtotal.toFixed(2)}
Tax: $${order.tax.toFixed(2)}
Total: $${order.total.toFixed(2)}

⏰ <b>Ready by:</b> ${order.estimatedReady}
📍 <b>Show this message when picking up</b>
🆔 <b>Order #:</b> ${order.id}`;
  },
  
  errorMessage: (error: Error): string => {
    if (error instanceof MenuItemNotFoundError) {
      return `❌ ${error.message}

📋 <b>Available items:</b>
• Cappuccino - $3.50
• Latte - $4.00

Please try again with a valid menu item.`;
    } else if (error instanceof ParseError) {
      return `🤔 I didn't understand your order. Please try something like:
'1 large cappuccino with oat milk'
or '2 medium lattes'

Type /menu to see all available options.`;
    } else {
      return `❌ Something went wrong. Please try again later.`;
    }
  }
};

// Comprehensive implementation of MessageParser service for Task 2
const messageParser = {
  // Menu data
  menuItems: {
    'cappuccino': {
      id: 'cap1',
      name: 'Cappuccino',
      basePrice: 3.50,
      sizes: [
        { name: 'Small', priceModifier: -0.50 },
        { name: 'Medium', priceModifier: 0 },
        { name: 'Large', priceModifier: 0.50 }
      ],
      milkOptions: [
        { name: 'Whole Milk', priceModifier: 0 },
        { name: 'Oat Milk', priceModifier: 0.50 },
        { name: 'Almond Milk', priceModifier: 0.50 }
      ],
      aliases: ['cap', 'capp', 'cappucino', 'capuccino']
    },
    'latte': {
      id: 'lat1',
      name: 'Latte',
      basePrice: 4.00,
      sizes: [
        { name: 'Small', priceModifier: -0.50 },
        { name: 'Medium', priceModifier: 0 },
        { name: 'Large', priceModifier: 0.50 }
      ],
      milkOptions: [
        { name: 'Whole Milk', priceModifier: 0 },
        { name: 'Oat Milk', priceModifier: 0.50 },
        { name: 'Almond Milk', priceModifier: 0.50 }
      ],
      aliases: ['lat', 'cafe latte', 'coffee latte']
    }
  },
  
  sizes: {
    'small': { name: 'Small', priceModifier: -0.50 },
    'medium': { name: 'Medium', priceModifier: 0 },
    'large': { name: 'Large', priceModifier: 0.50 },
    's': { name: 'Small', priceModifier: -0.50 },
    'm': { name: 'Medium', priceModifier: 0 },
    'l': { name: 'Large', priceModifier: 0.50 },
    'regular': { name: 'Medium', priceModifier: 0 },
    'big': { name: 'Large', priceModifier: 0.50 },
    'standard': { name: 'Medium', priceModifier: 0 }
  },
  
  milkTypes: {
    'whole milk': { name: 'Whole Milk', priceModifier: 0 },
    'oat milk': { name: 'Oat Milk', priceModifier: 0.50 },
    'almond milk': { name: 'Almond Milk', priceModifier: 0.50 },
    'whole': { name: 'Whole Milk', priceModifier: 0 },
    'oat': { name: 'Oat Milk', priceModifier: 0.50 },
    'almond': { name: 'Almond Milk', priceModifier: 0.50 },
    'regular milk': { name: 'Whole Milk', priceModifier: 0 },
    'regular': { name: 'Whole Milk', priceModifier: 0 },
    'normal milk': { name: 'Whole Milk', priceModifier: 0 },
    'normal': { name: 'Whole Milk', priceModifier: 0 }
  },
  
  // Helper methods
  /**
   * Calculate similarity score between two strings
   * @param str1 First string
   * @param str2 Second string
   * @returns Similarity score (0-1)
   */
  calculateSimilarity: (str1: string, str2: string): number => {
    // Simple implementation of Levenshtein distance for fuzzy matching
    const a = str1.toLowerCase();
    const b = str2.toLowerCase();
    
    // If exact match, return 1
    if (a === b) return 1;
    
    // If one string contains the other, high similarity
    if (a.includes(b) || b.includes(a)) {
      return 0.9;
    }
    
    // Calculate Levenshtein distance
    const matrix: number[][] = [];
    
    // Initialize matrix
    for (let i = 0; i <= a.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= b.length; j++) {
      matrix[0][j] = j;
    }
    
    // Fill matrix
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,      // deletion
          matrix[i][j - 1] + 1,      // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }
    
    // Calculate similarity score (0-1)
    const maxLength = Math.max(a.length, b.length);
    const distance = matrix[a.length][b.length];
    return 1 - distance / maxLength;
  },
  
  /**
   * Find best match for a term in a dictionary using fuzzy matching
   * @param term Term to match
   * @param dictionary Dictionary of terms
   * @param threshold Similarity threshold (0-1)
   * @returns Best match or null if no match above threshold
   */
  findBestMatch: (term: string, dictionary: Record<string, any>, threshold: number = 0.7): { key: string, item: any, score: number } | null => {
    let bestMatch = null;
    let bestScore = threshold;
    
    for (const [key, item] of Object.entries(dictionary)) {
      const score = messageParser.calculateSimilarity(term, key);
      
      if (score > bestScore) {
        bestMatch = { key, item, score };
        bestScore = score;
      }
      
      // Check aliases if available
      if (item.aliases) {
        for (const alias of item.aliases) {
          const aliasScore = messageParser.calculateSimilarity(term, alias);
          if (aliasScore > bestScore) {
            bestMatch = { key, item, score: aliasScore };
            bestScore = aliasScore;
          }
        }
      }
    }
    
    return bestMatch;
  },
  
  /**
   * Split text into separate order items
   * @param text Order text
   * @returns Array of order item texts
   */
  splitOrderItems: (text: string): string[] => {
    // Split by common separators: commas, 'and', semicolons, plus signs
    const separators = [',', ' and ', ';', '+'];
    let items = [text];
    
    for (const separator of separators) {
      const newItems = [];
      for (const item of items) {
        if (item.includes(separator)) {
          newItems.push(...item.split(separator).map(i => i.trim()).filter(i => i));
        } else {
          newItems.push(item);
        }
      }
      items = newItems;
    }
    
    return items;
  },
  
  /**
   * Parse a single order item
   * @param text Order item text
   * @returns Parsed order item or error
   */
  parseOrderItem: (text: string): { success: boolean, item?: OrderItem, error?: string } => {
    try {
      const lowerText = text.toLowerCase();
      
      // Extract quantity (default to 1 if not specified)
      let quantity = 1;
      const quantityMatch = lowerText.match(/^(\d+)/);
      if (quantityMatch) {
        quantity = parseInt(quantityMatch[1]);
      }
      
      // Extract menu item with fuzzy matching
      let menuItem = null;
      const words = lowerText.split(/\s+/);
      
      for (const word of words) {
        if (word.length < 3) continue; // Skip short words
        
        const match = messageParser.findBestMatch(word, messageParser.menuItems);
        if (match) {
          menuItem = match.item;
          break;
        }
      }
      
      // If no match found, try the whole text
      if (!menuItem) {
        for (const [key, item] of Object.entries(messageParser.menuItems)) {
          if (lowerText.includes(key)) {
            menuItem = item;
            break;
          }
        }
      }
      
      if (!menuItem) {
        return {
          success: false,
          error: `Menu item not found. Available items: ${Object.values(messageParser.menuItems).map(item => item.name).join(', ')}`
        };
      }
      
      // Extract size with fuzzy matching
      let size = messageParser.sizes['medium']; // Default to medium
      for (const word of words) {
        const match = messageParser.findBestMatch(word, messageParser.sizes);
        if (match) {
          size = match.item;
          break;
        }
      }
      
      // Extract milk type with fuzzy matching
      let milkType = messageParser.milkTypes['whole milk']; // Default to whole milk
      
      // Check for milk type phrases
      for (const [key, value] of Object.entries(messageParser.milkTypes)) {
        if (lowerText.includes(key)) {
          milkType = value;
          break;
        }
      }
      
      // If no match found, try individual words
      if (milkType === messageParser.milkTypes['whole milk']) {
        for (const word of words) {
          const match = messageParser.findBestMatch(word, messageParser.milkTypes);
          if (match) {
            milkType = match.item;
            break;
          }
        }
      }
      
      // Calculate item total
      const itemTotal = menuItem.basePrice + size.priceModifier + milkType.priceModifier;
      
      // Create order item
      const orderItem: OrderItem = {
        menuItem,
        quantity,
        size: size.name,
        milkType: milkType.name,
        itemTotal: itemTotal * quantity
      };
      
      return {
        success: true,
        item: orderItem
      };
    } catch (error) {
      logger.error('Error parsing order item', error as Error);
      return {
        success: false,
        error: 'Failed to parse this item. Please try a simpler format.'
      };
    }
  },
  
  /**
   * Main method to parse an order from text
   * @param text Order text
   * @returns Parsed order or error
   */
  parseOrder: async (text: string): Promise<ParsedOrder> => {
    logger.info('Parsing order text', { text });
    
    try {
      // Split text into separate order items
      const orderItemTexts = messageParser.splitOrderItems(text);
      
      if (orderItemTexts.length === 0) {
        return {
          success: false,
          error: 'Please specify at least one item to order.'
        };
      }
      
      // Parse each order item
      const orderItems: OrderItem[] = [];
      const errors: string[] = [];
      
      for (const itemText of orderItemTexts) {
        const result = messageParser.parseOrderItem(itemText);
        
        if (result.success && result.item) {
          orderItems.push(result.item);
        } else if (result.error) {
          errors.push(result.error);
        }
      }
      
      // If no items were successfully parsed, return error
      if (orderItems.length === 0) {
        return {
          success: false,
          error: errors.length > 0
            ? `Failed to parse order: ${errors.join('; ')}`
            : 'Failed to parse your order. Please try again with a simpler format.'
        };
      }
      
      // Return successfully parsed items
      return {
        success: true,
        items: orderItems
      };
    } catch (error) {
      logger.error('Error parsing order', error as Error);
      return {
        success: false,
        error: 'Failed to parse your order. Please try again with a simpler format.'
      };
    }
  }
};

// Comprehensive implementation of OrderCalculator service for Task 3
const orderCalculator = {
  // Helper methods for precise calculations and formatting
  roundCurrency: (amount: number): number => {
    // Use Math.round to avoid floating point precision errors
    return Math.round(amount * 100) / 100;
  },
  
  formatCurrency: (amount: number): string => {
    // Always show exactly 2 decimal places
    return amount.toFixed(2);
  },
  
  calculateTax: (subtotal: number): number => {
    const taxRate = 0.085; // 8.5%
    return orderCalculator.roundCurrency(subtotal * taxRate);
  },
  
  generateOrderId: (customerId: string): string => {
    // Format: ORD-TIMESTAMP-CUSTOMERID
    const timestamp = Date.now().toString().slice(-6);
    const customerSuffix = customerId.slice(-3);
    return `ORD-${timestamp}-${customerSuffix}`;
  },
  
  calculateReadyTime: (): string => {
    const now = new Date();
    const readyTime = new Date(now.getTime() + 10 * 60000); // Add 10 minutes
    
    // Format time as "1:30 PM"
    return readyTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  },
  
  // Main order creation method
  createOrder: async (items: OrderItem[], customer: Customer): Promise<Order> => {
    logger.info('Creating order', { items, customerId: customer.id });
    
    try {
      // Calculate subtotal with precise decimal arithmetic
      const subtotal = items.reduce((total, item) => {
        return orderCalculator.roundCurrency(total + item.itemTotal);
      }, 0);
      
      // Calculate tax (8.5%)
      const tax = orderCalculator.calculateTax(subtotal);
      
      // Calculate total
      const total = orderCalculator.roundCurrency(subtotal + tax);
      
      // Generate unique order ID with timestamp and customer identifier
      const orderId = orderCalculator.generateOrderId(customer.id);
      
      // Calculate estimated ready time (current time + 10 minutes)
      const estimatedReady = orderCalculator.calculateReadyTime();
      
      // Create order
      const order: Order = {
        id: orderId,
        customerId: customer.id,
        customerName: customer.name,
        items,
        subtotal,
        tax,
        total,
        estimatedReady
      };
      
      logger.info('Order created successfully', {
        orderId,
        customerId: customer.id,
        itemCount: items.length,
        total: orderCalculator.formatCurrency(total)
      });
      
      return order;
    } catch (error) {
      logger.error('Error creating order', error as Error);
      throw new Error('Failed to calculate order details');
    }
  }
};

// Extract customer information from Telegram context
const extractCustomer = (ctx: Context): Customer => {
  if (!ctx.from) {
    throw new ValidationError('Customer information not available');
  }
  
  return {
    id: ctx.from.id.toString(),
    name: ctx.from.first_name,
    username: ctx.from.username
  };
};

// Handle /start command
bot.command('start', async (ctx) => {
  await ctx.replyWithHTML(`👋 <b>Welcome to Downtown Coffee Bot!</b>

I can help you order coffee for pickup. Just send me your order in natural language like:
"1 large cappuccino with oat milk" or "2 medium lattes"

Type /menu to see our available options.`);
});

// Handle /menu command
bot.command('menu', async (ctx) => {
  await ctx.replyWithHTML(`📋 <b>Our Menu:</b>

<b>Coffee Options:</b>
• Cappuccino - $3.50
• Latte - $4.00

<b>Sizes:</b>
• Small (-$0.50)
• Medium (standard price)
• Large (+$0.50)

<b>Milk Options:</b>
• Whole milk (included)
• Oat milk (+$0.50)
• Almond milk (+$0.50)

<b>How to Order:</b>
Just type your order like:
"1 large cappuccino with oat milk" or "2 medium lattes with whole milk"`);
});

// Handle /help command
bot.command('help', async (ctx) => {
  await ctx.replyWithHTML(`❓ <b>Need Help?</b>

<b>Ordering:</b>
Just type your order in natural language like:
"1 large cappuccino with oat milk" or "2 medium lattes"

<b>Commands:</b>
/start - Welcome message
/menu - See our menu options
/help - Show this help message

<b>Examples:</b>
• "1 large cappuccino with oat milk"
• "2 medium lattes"
• "1 small cappuccino, 1 large latte with almond milk"

If you need further assistance, please contact us at (555) 123-4567.`);
});

// Handle text messages
bot.on(message('text'), async (ctx) => {
  try {
    logger.info('Received message', {
      messageId: ctx.message.message_id,
      from: ctx.from?.id,
      text: ctx.message.text
    });

    // Skip processing commands (they are handled by specific command handlers)
    if (ctx.message.text.startsWith('/')) {
      logger.info('Skipping command message', { command: ctx.message.text });
      return;
    }

    // Only process messages in private chats
    if (ctx.chat.type !== 'private') {
      logger.info('Ignoring message from non-private chat', { chatType: ctx.chat.type });
      return;
    }

    // Extract customer information
    const customer = extractCustomer(ctx);
    logger.info('Extracted customer', { customer });

    // Parse the order text
    const parsedOrder = await messageParser.parseOrder(ctx.message.text);
    
    if (!parsedOrder.success) {
      // Handle parsing error
      logger.warn('Order parsing failed', { error: parsedOrder.error });
      await ctx.replyWithHTML(formatHtmlResponse.errorMessage(new ParseError(parsedOrder.error || 'Failed to parse order')));
      return;
    }
    
    // Calculate order details
    try {
      const order = await orderCalculator.createOrder(parsedOrder.items!, customer);
      
      // Send order confirmation
      await ctx.replyWithHTML(formatHtmlResponse.orderConfirmation(order));
      logger.info('Order processed successfully', { orderId: order.id });
    } catch (error) {
      // Handle calculation error
      logger.error('Order calculation failed', error as Error);
      await ctx.replyWithHTML(formatHtmlResponse.errorMessage(error as Error));
    }
  } catch (error) {
    // Handle unexpected errors
    logger.error('Unexpected error processing message', error as Error);
    await ctx.replyWithHTML('❌ Something went wrong. Please try again later.');
  }
});

// Error handling for bot errors
bot.catch((err, ctx) => {
  logger.error('Bot error', err as Error);
  ctx.reply('❌ Something went wrong. Please try again later.');
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
    }
    
    // Enable graceful stop
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
  } catch (error) {
    logger.error('Failed to start bot', error as Error);
    process.exit(1);
  }
};

// Start the bot
startBot();