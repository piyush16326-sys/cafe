// lib/schema.ts
import { pgTable, serial, text, decimal, integer, timestamp } from 'drizzle-orm/pg-core';

// 1. Users table (for login/signup and role tracking)
export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    username: text('username').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    role: text('role').default('cashier'), // cashier, admin, etc.
    createdAt: timestamp('created_at').defaultNow(),
});

// 2. Menu Items table (for your cafe items, prices, and descriptions)
export const menuItems = pgTable('menu_items', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    description: text('description'),
    category: text('category').default('Beverages'),
    createdAt: timestamp('created_at').defaultNow(),
});

// 3. Orders table (stores total amount, payment method, and optional customer details)
export const orders = pgTable('orders', {
    id: serial('id').primaryKey(),
    orderNumber: serial('order_number'),
    userId: integer('user_id').references(() => users.id),
    totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
    paymentMethod: text('payment_method').notNull(), // CASH, UPI, CARD
    customerName: text('customer_name'),
    customerPhone: text('customer_phone'),
    customerEmail: text('customer_email'),
    createdAt: timestamp('created_at').defaultNow(),
});

// 4. Order Items table (links individual items to a specific order)
export const orderItems = pgTable('order_items', {
    id: serial('id').primaryKey(),
    orderId: integer('order_id').references(() => orders.id, { onDelete: 'cascade' }),
    menuItemId: integer('menu_item_id').references(() => menuItems.id),
    quantity: integer('quantity').notNull(),
    unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
});