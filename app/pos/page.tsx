// app/pos/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { getMenuItems, addMenuItem, createOrder } from '@/app/actions/pos';

interface MenuItem {
    id: number;
    name: string;
    price: string;
    description: string | null;
    category: string;
}

interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
}

export default function POSPage() {
    const [items, setItems] = useState<MenuItem[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [paymentMethod, setPaymentMethod] = useState('UPI');
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Hardcoded user ID for local laptop session (can be replaced with NextAuth / JWT cookie)
    const currentUserId = 1;

    useEffect(() => {
        loadMenu();
    }, []);

    async function loadMenu() {
        const data = await getMenuItems();
        setItems(data);
    }

    const addToCart = (item: MenuItem) => {
        setCart((prev) => {
            const existing = prev.find((i) => i.id === item.id);
            if (existing) {
                return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
            }
            return [...prev, { id: item.id, name: item.name, price: parseFloat(item.price), quantity: 1 }];
        });
    };

    const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setLoading(true);

        const res = await createOrder({
            items: cart,
            paymentMethod,
            userId: currentUserId,
            customerName,
            customerPhone,
            customerEmail,
        });

        setLoading(false);

        if (res.success) {
            alert(`Bill Generated Successfully! Order #${res.orderNumber}`);
            setCart([]);
            setCustomerName('');
            setCustomerPhone('');
            setCustomerEmail('');
        } else {
            alert('Error: ' + res.error);
        }
    };

    return (
        <div className="flex h-screen bg-slate-100 font-sans overflow-hidden">
            {/* LEFT: Menu & Catalog */}
            <div className="flex-1 p-6 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-black text-slate-800">☕ Jaipur Cafe POS</h1>
                    <div className="space-x-3">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl font-semibold shadow"
                        >
                            + Add Menu Item
                        </button>
                        <a
                            href="/analytics"
                            className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-xl font-semibold shadow inline-block"
                        >
                            📊 View Analytics
                        </a>
                    </div>
                </div>

                {/* Grid of Items */}
                <div className="grid grid-cols-3 gap-4 overflow-y-auto flex-1 pr-2">
                    {items.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => addToCart(item)}
                            className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-amber-500 hover:shadow-lg transition text-left flex flex-col justify-between h-36"
                        >
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">{item.name}</h3>
                                <p className="text-xs text-slate-500 line-clamp-2">{item.description}</p>
                            </div>
                            <span className="text-amber-600 font-extrabold text-xl">₹{parseFloat(item.price).toFixed(2)}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* RIGHT: Active Bill & Checkout Panel */}
            <div className="w-[420px] bg-white border-l border-slate-200 flex flex-col shadow-2xl p-6">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Current Order</h2>

                {/* Optional Customer Details */}
                <div className="space-y-2 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <p className="text-xs font-semibold text-slate-500 uppercase">Customer Details (Optional)</p>
                    <input
                        type="text"
                        placeholder="Name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3 py-1.5 text-sm bg-white border rounded-lg"
                    />
                    <input
                        type="text"
                        placeholder="Mobile Number"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full px-3 py-1.5 text-sm bg-white border rounded-lg"
                    />
                    <input
                        type="email"
                        placeholder="Gmail ID (for digital bill)"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full px-3 py-1.5 text-sm bg-white border rounded-lg"
                    />
                </div>

                {/* Cart items */}
                <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                    {cart.length === 0 ? (
                        <p className="text-slate-400 text-center mt-20">Click items from the menu to start a bill.</p>
                    ) : (
                        cart.map((item) => (
                            <div key={item.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border">
                                <div>
                                    <p className="font-semibold text-slate-800 text-sm">{item.name}</p>
                                    <p className="text-xs text-slate-500">₹{item.price} × {item.quantity}</p>
                                </div>
                                <span className="font-bold text-slate-800">₹{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))
                    )}
                </div>

                {/* Payment Options */}
                <div className="mb-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Payment Mode</p>
                    <div className="grid grid-cols-3 gap-2">
                        {['UPI', 'CASH', 'CARD'].map((mode) => (
                            <button
                                key={mode}
                                onClick={() => setPaymentMethod(mode)}
                                className={`py-2 text-sm font-bold rounded-xl border ${paymentMethod === mode ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-slate-700'
                                    }`}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Total & Checkout */}
                <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-xl font-black text-slate-900 mb-4">
                        <span>Total:</span>
                        <span>₹{total.toFixed(2)}</span>
                    </div>
                    <button
                        onClick={handleCheckout}
                        disabled={cart.length === 0 || loading}
                        className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 text-white font-bold py-3.5 rounded-xl shadow-lg transition text-lg"
                    >
                        {loading ? 'Processing...' : 'Complete & Save Bill'}
                    </button>
                </div>
            </div>

            {/* Modal: Add Menu Item */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
                    <form
                        action={async (formData) => {
                            await addMenuItem(formData);
                            setIsModalOpen(false);
                            loadMenu();
                        }}
                        className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl space-y-4"
                    >
                        <h3 className="text-xl font-bold text-slate-800">Add New Cafe Item</h3>
                        <input name="name" placeholder="Item Name (e.g. Masala Chai)" required className="w-full p-3 border rounded-xl" />
                        <input name="price" type="number" step="0.01" placeholder="Price in ₹" required className="w-full p-3 border rounded-xl" />
                        <input name="category" placeholder="Category (Beverages, Bakery...)" className="w-full p-3 border rounded-xl" />
                        <textarea name="description" placeholder="Description (Optional)" className="w-full p-3 border rounded-xl" />
                        <div className="flex justify-end space-x-3">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 font-semibold text-slate-600">
                                Cancel
                            </button>
                            <button type="submit" className="bg-amber-600 text-white px-5 py-2 rounded-xl font-bold shadow">
                                Save Item
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}