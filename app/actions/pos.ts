// app/actions/pos.ts
'use server';

import { db } from '@/lib/db';
import { menuItems, orders, orderItems } from '@/lib/schema';
import { eq, sql, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// Add new item to menu
export async function addMenuItem(formData: FormData) {
    const name = formData.get('name') as string;
    const price = formData.get('price') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;

    if (!name || !price) return { success: false, error: 'Name and price required' };

    try {
        await db.insert(menuItems).values({
            name,
            price,
            description: description || null,
            category: category || 'Beverages',
        });
        revalidatePath('/pos');
        return { success: true };
    } catch (error) {
        console.error('Add menu item error:', error);
        return { success: false, error: 'Failed to add menu item' };
    }
}

// Fetch all menu items
export async function getMenuItems() {
    return await db.select().from(menuItems).orderBy(menuItems.name);
}

// Checkout & Save Bill
interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
}

export async function createOrder(data: {
    items: CartItem[];
    paymentMethod: string;
    userId: number;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
}) {
    if (!data.items || data.items.length === 0) {
        return { success: false, error: 'Cart is empty' };
    }

    const totalAmount = data.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    try {
        // 1. Insert Order
        const [newOrder] = await db
            .insert(orders)
            .values({
                userId: data.userId,
                totalAmount: totalAmount.toFixed(2),
                paymentMethod: data.paymentMethod,
                customerName: data.customerName || null,
                customerPhone: data.customerPhone || null,
                customerEmail: data.customerEmail || null,
            })
            .returning({ id: orders.id, orderNumber: orders.orderNumber });

        // 2. Insert Order Items
        const itemsData = data.items.map((item) => ({
            orderId: newOrder.id,
            menuItemId: item.id,
            quantity: item.quantity,
            unitPrice: item.price.toFixed(2),
        }));

        await db.insert(orderItems).values(itemsData);

        revalidatePath('/analytics');
        return { success: true, orderNumber: newOrder.orderNumber };
    } catch (error) {
        console.error('Checkout error:', error);
        return { success: false, error: 'Database error during checkout' };
    }
}

// Fetch Analytics (Total Sales & Most Sold Items)
export async function getAnalyticsData() {
    const salesResult = await db
        .select({
            totalRevenue: sql<string>`sum(${orders.totalAmount})`,
            totalOrders: sql<number>`count(${orders.id})`,
        })
        .from(orders);

    const topItems = await db
        .select({
            name: menuItems.name,
            totalSold: sql<number>`sum(${orderItems.quantity})`,
        })
        .from(orderItems)
        .innerJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
        .groupBy(menuItems.name)
        .orderBy(desc(sql`sum(${orderItems.quantity})`))
        .limit(5);

    return {
        revenue: salesResult[0]?.totalRevenue || '0.00',
        totalOrders: salesResult[0]?.totalOrders || 0,
        topItems,
    };
}