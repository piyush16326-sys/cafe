// app/analytics/page.tsx
import { getAnalyticsData } from '@/app/actions/pos';
import Link from 'next/link';

export default async function AnalyticsPage() {
    const data = await getAnalyticsData();

    return (
        <div className="min-h-screen bg-slate-100 p-8 font-sans">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-black text-slate-800">📈 Cafe Sales & Analytics</h1>
                    <Link href="/pos" className="bg-amber-600 text-white px-5 py-2.5 rounded-xl font-bold shadow hover:bg-amber-700">
                        ← Back to POS Terminal
                    </Link>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow border border-slate-200">
                        <p className="text-sm font-semibold text-slate-500 uppercase">Total Sales Revenue</p>
                        <p className="text-4xl font-black text-amber-600 mt-2">₹{parseFloat(data.revenue || '0').toFixed(2)}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow border border-slate-200">
                        <p className="text-sm font-semibold text-slate-500 uppercase">Total Bills Generated</p>
                        <p className="text-4xl font-black text-slate-800 mt-2">{data.totalOrders}</p>
                    </div>
                </div>

                {/* Most Sold Items */}
                <div className="bg-white p-6 rounded-2xl shadow border border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">🏆 Most Sold Items</h2>
                    {data.topItems.length === 0 ? (
                        <p className="text-slate-400">No orders completed yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {data.topItems.map((item, index) => (
                                <div key={index} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border">
                                    <span className="font-semibold text-slate-800">
                                        {index + 1}. {item.name}
                                    </span>
                                    <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-bold text-sm">
                                        {item.totalSold} sold
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}