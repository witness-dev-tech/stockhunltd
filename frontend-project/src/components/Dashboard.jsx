import React, { useEffect, useState } from 'react';
import { Warehouse, Box, ArrowLeftRight, AlertCircle } from 'lucide-react';
import api from '../api/apiAxios';

export default function Dashboard() {
    const [metrics, setMetrics] = useState({ warehouses: 0, products: 0, transactions: 0, lowStock: 0 });

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const [w, p, t] = await Promise.all([
                    api.get('/warehouses'),
                    api.get('/products'),
                    api.get('/transactions')
                ]);
                const low = p.data.filter(item => item.quantityInStock <= 10).length;
                setMetrics({
                    warehouses: w.data.length,
                    products: p.data.length,
                    transactions: t.data.length,
                    lowStock: low
                });
            } catch (err) {
                console.error('Failed to load metrics summary metrics');
            }
        };
        fetchMetrics();
    }, []);

    const cards = [
        { title: "Total Warehouses", val: metrics.warehouses, icon: <Warehouse size={24} />, color: "bg-blue-600/10 text-blue-400 border-blue-500/20" },
        { title: "Unique SKUs Active", val: metrics.products, icon: <Box size={24} />, color: "bg-indigo-600/10 text-indigo-400 border-indigo-500/20" },
        { title: "Total Transactions Logged", val: metrics.transactions, icon: <ArrowLeftRight size={24} />, color: "bg-emerald-600/10 text-emerald-400 border-emerald-500/20" },
        { title: "Low Stock Items", val: metrics.lowStock, icon: <AlertCircle size={24} />, color: "bg-rose-600/10 text-rose-400 border-rose-500/20" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">StockHub Dashboard</h1>
                <p className="text-slate-400 mt-1">Real-time status overview of operations.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((c, i) => (
                    <div key={i} className={`p-6 bg-slate-900 border rounded-2xl flex items-center justify-between shadow-lg ${c.color}`}>
                        <div className="space-y-2">
                            <span className="text-sm font-medium text-slate-400 block">{c.title}</span>
                            <span className="text-3xl font-bold tracking-tight block text-slate-100">{c.val}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                            {c.icon}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}