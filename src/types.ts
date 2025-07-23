export interface MenuItem {
  id: string;
  name: string;
  basePrice: number;
  sizes: { name: string; priceModifier: number }[];
  milkOptions: { name: string; priceModifier: number }[];
}

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
  size: string;
  milkType: string;
  itemTotal: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  estimatedReady: string;
}

export interface ParsedOrder {
  success: boolean;
  items?: OrderItem[];
  error?: string;
}

export interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
    };
    chat: {
      id: number;
      type: "private" | "group" | "supergroup" | "channel";
    };
    date: number;
    text?: string;
  };
}