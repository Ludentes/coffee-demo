# Data Model and Tech Stack

This document defines the domain objects, business rules, and technology choices that form the foundation of our coffee shop order bot.

## Domain Model

### Core Business Objects

```typescript
// Customer representation
interface Customer {
  id: string;           // Telegram user ID as string
  name: string;         // First name from Telegram profile
  username?: string;    // Optional @username
}

// Menu item definition with pricing structure
interface MenuItem {
  id: string;
  name: string;
  basePrice: number;
  sizes: SizeOption[];
  milkOptions: MilkOption[];
}

interface SizeOption {
  name: "small" | "medium" | "large";
  priceModifier: number;  // -0.50, 0.00, +0.50
}

interface MilkOption {
  name: string;           // "whole milk", "oat milk", "almond milk"
  priceModifier: number;  // 0.00 or +0.50
}

// Individual item in customer order
interface OrderItem {
  menuItem: MenuItem;
  quantity: number;       // Positive integer
  size: string;          // Selected size name
  milkType: string;      // Selected milk option name
  itemTotal: number;     // Calculated total for this item
}

// Complete customer order
interface Order {
  id: string;            // Generated order identifier
  customerId: string;    // Reference to customer
  customerName: string;  // Customer display name
  items: OrderItem[];    // Array of ordered items
  subtotal: number;      // Sum of all item totals
  tax: number;          // Calculated tax amount
  total: number;        // Subtotal + tax
  estimatedReady: string; // Human-readable ready time
  createdAt: Date;      // Order timestamp
}

// Parsing result from message processing
interface ParsedOrder {
  success: boolean;
  items?: OrderItem[];   // Present when success = true
  error?: string;        // Present when success = false
}

// Telegram API message structure
interface TelegramMessage {
  message_id: number;
  from: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
  };
  chat: {
    id: number;
    type: "private";
  };
  date: number;
  text?: string;
}
```

## Business Rules

### Menu and Pricing
```typescript
const MENU_ITEMS: MenuItem[] = [
  {
    id: "1",
    name: "Cappuccino", 
    basePrice: 3.50,
    sizes: [
      { name: "small", priceModifier: -0.50 },
      { name: "medium", priceModifier: 0.00 },
      { name: "large", priceModifier: 0.50 }
    ],
    milkOptions: [
      { name: "whole milk", priceModifier: 0.00 },
      { name: "oat milk", priceModifier: 0.50 },
      { name: "almond milk", priceModifier: 0.50 }
    ]
  },
  {
    id: "2",
    name: "Latte",
    basePrice: 4.00,
    sizes: [
      { name: "small", priceModifier: -0.50 },
      { name: "medium", priceModifier: 0.00 },
      { name: "large", priceModifier: 0.50 }
    ],
    milkOptions: [
      { name: "whole milk", priceModifier: 0.00 },
      { name: "oat milk", priceModifier: 0.50 },
      { name: "almond milk", priceModifier: 0.50 }
    ]
  }
];
```

### Financial Calculations
```typescript
const BUSINESS_RULES = {
  TAX_RATE: 0.085,           // 8.5% sales tax
  PREP_TIME_MINUTES: 10,     // Standard preparation time
  DEFAULT_SIZE: "medium",    // When size not specified
  DEFAULT_MILK: "whole milk", // When milk not specified
  CURRENCY_SYMBOL: "$",      // Display currency
  ROUNDING_PRECISION: 2      // Decimal places for currency
};

// Price calculation formula
function calculateItemTotal(menuItem: MenuItem, size: string, milkType: string, quantity: number): number {
  const sizeModifier = menuItem.sizes.find(s => s.name === size)?.priceModifier || 0;
  const milkModifier = menuItem.milkOptions.find(m => m.name === milkType)?.priceModifier || 0;
  const unitPrice = menuItem.basePrice + sizeModifier + milkModifier;
  return Math.round(unitPrice * quantity * 100) / 100; // Round to 2 decimal places
}

// Tax calculation
function calculateTax(subtotal: number): number {
  return Math.round(subtotal * BUSINESS_RULES.TAX_RATE * 100) / 100;
}
```

### Natural Language Processing Rules
```typescript
const PARSING_RULES = {
  // Fuzzy matching threshold
  SIMILARITY_THRESHOLD: 0.6,
  
  // Common abbreviations
  ITEM_ALIASES: {
    "cap": "Cappuccino",
    "capp": "Cappuccino", 
    "cappucino": "Cappuccino", // Common misspelling
    "coffee": "Cappuccino"     // Generic fallback
  },
  
  // Size variations
  SIZE_ALIASES: {
    "sm": "small",
    "md": "medium", 
    "lg": "large",
    "med": "medium"
  },
  
  // Milk variations  
  MILK_ALIASES: {
    "oat": "oat milk",
    "almond": "almond milk",
    "regular": "whole milk",
    "normal": "whole milk"
  },
  
  // Quantity patterns
  QUANTITY_PATTERNS: [
    /^(\d+)x?\s+/,           // "1", "2x"
    /^(one|two|three|four|five)\s+/i  // Written numbers
  ]
};
```

## Tech Stack

### Core Dependencies
```json
{
  "dependencies": {
    "telegraf": "^4.16.3",     // Telegram Bot Framework
    "dotenv": "^16.0.0"        // Environment configuration
  },
  "devDependencies": {
    "typescript": "^5.0.0",    // Type safety
    "ts-node": "^10.9.0",      // Development execution
    "@types/node": "^18.0.0"   // Node.js type definitions
  }
}
```

### Runtime Environment
- **Node.js**: 18+ (ES2020 features, async/await)
- **TypeScript**: Strict mode enabled, no `any` types
- **Environment**: Development (polling) / Production (webhooks)

### External Integrations
```typescript
// Telegram Bot API configuration
const TELEGRAM_CONFIG = {
  API_BASE_URL: "https://api.telegram.org/bot",
  WEBHOOK_PATH: "/webhook",
  POLLING_TIMEOUT: 30,        // Seconds for long polling
  MAX_CONNECTIONS: 40         // Webhook concurrent connections
};

// Message format constraints
const MESSAGE_LIMITS = {
  MAX_TEXT_LENGTH: 4096,      // Telegram text message limit
  MAX_CAPTION_LENGTH: 1024,   // Media caption limit
  PARSE_MODE: "HTML"          // Rich formatting support
};
```

### Development Configuration
```typescript
// TypeScript compiler options
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs", 
    "strict": true,              // Enable all strict checks
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### File Structure
```
src/
├── bot.ts                   # Telegraf setup and message routing
├── types.ts                 # All TypeScript interfaces
└── services/
    ├── MessageParser.ts     # Natural language processing
    └── OrderCalculator.ts   #