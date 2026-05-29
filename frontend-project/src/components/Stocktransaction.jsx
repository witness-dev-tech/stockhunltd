import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, CheckCircle2, Edit2, Trash2, X } from 'lucide-react';
import api from '../api/apiAxios';
import { toast } from 'react-hot-toast';

export default function StockTransaction() {
    const [transactions, setTransactions] = useState([]);
    const [products, setProducts] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ 
        productCode: '', 
        warehouseCode: '', 
        quantityMoved: '', 
        transactionType: 'IN' 
    });

    const loadData = async () => {
        try {
            const [tRes, pRes, wRes] = await Promise.all([
                api.get('/transactions'),
                api.get('/products'),
                api.get('/warehouses')
            ]);
            setTransactions(tRes.data);
            setProducts(pRes.data);
            setWarehouses(wRes.data);
        } catch (err) { 
            toast.error('Error fetching system ledger logs'); 
        }
    };

    useEffect(() => { 
        loadData(); 
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { 
                ...form, 
                quantityMoved: parseInt(form.quantityMoved, 10) 
            };

            if (isEditing) {
                // Assuming you use route pattern /api/transactions/:id for modification overrides
                await api.put(`/transactions/${editingId}`, payload);
                toast.success('Transaction log entry modified successfully');
            } else {
                await api.post('/transactions', payload);
                toast.success('Stock level updated smoothly');
            }

            handleResetState();
            loadData();
        } catch (err) { 
            toast.error(err.response?.data?.details || err.response?.data?.error || 'Movement execution failed'); 
        }
    };

    const handleEditInitiate = (transaction) => {
        setIsEditing(true);
        setEditingId(transaction.transactionID);
        setForm({
            productCode: transaction.productCode,
            warehouseCode: transaction.warehouseCode,
            quantityMoved: transaction.quantityMoved,
            transactionType: transaction.transactionType
        });
        toast.info(`Editing log entry #${transaction.transactionID}`);
    };

    const handleDelete = async (id) => {
        if (!window.confirm(`Are you sure you want to delete transaction entry #${id}? This can cause balance changes.`)) return;
        try {
            await api.delete(`/transactions/${id}`);
            toast.success(`Transaction record #${id} dropped successfully`);
            if (editingId === id) handleResetState();
            loadData();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Could not clean transaction log history');
        }
    };

    const handleResetState = () => {
        setIsEditing(false);
        setEditingId(null);
        setForm({ productCode: '', warehouseCode: '', quantityMoved: '', transactionType: 'IN' });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">Stock Movements Ledger</h1>
                <p className="text-slate-400 mt-1">Execute or inspect operational item dispatches or entries.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Interactive Dynamic Management Form */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl h-fit sticky top-8">
                    <h2 className="text-xl font-bold mb-6 text-slate-100 flex items-center gap-2">
                        <ArrowLeftRight size={20} className={isEditing ? "text-amber-400" : "text-indigo-400"} />
                        {isEditing ? `Modify Log Entry #${editingId}` : 'Execute Stock Movement'}
                    </h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Target SKU Item</label>
                            <select 
                                className="bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 block w-full px-3 py-2.5 rounded-lg text-sm" 
                                value={form.productCode} 
                                onChange={e => setForm({...form, productCode: e.target.value})} 
                                required
                            >
                                <option value="">Select Target SKU</option>
                                {products.map(p => (
                                    <option key={p.productCode} value={p.productCode}>
                                        {p.productName} ({p.productCode})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Source/Target Warehouse</label>
                            <select 
                                className="bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 block w-full px-3 py-2.5 rounded-lg text-sm" 
                                value={form.warehouseCode} 
                                onChange={e => setForm({...form, warehouseCode: e.target.value})} 
                                required
                            >
                                <option value="">Select Location</option>
                                {warehouses.map(w => (
                                    <option key={w.warehouseCode} value={w.warehouseCode}>
                                        {w.warehouseName} ({w.warehouseCode})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Movement Operations Type</label>
                            <div className="grid grid-cols-2 gap-2">
                                {['IN', 'OUT'].map(type => (
                                    <button
                                        key={type} 
                                        type="button"
                                        onClick={() => setForm({...form, transactionType: type})}
                                        className={`py-2 text-sm font-semibold rounded-lg border transition-all ${
                                            form.transactionType === type 
                                            ? isEditing
                                                ? 'bg-amber-600 border-transparent text-white shadow-md'
                                                : 'bg-indigo-600 border-transparent text-white shadow-md' 
                                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                                        }`}
                                    >
                                        Stock {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Quantity to Move</label>
                            <input 
                                type="number" 
                                min="1" 
                                className="bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 block w-full px-3 py-2.5 rounded-lg text-sm" 
                                value={form.quantityMoved} 
                                onChange={e => setForm({...form, quantityMoved: e.target.value})} 
                                required 
                                placeholder="Minimum 1 units"
                            />
                        </div>

                        <div className="flex flex-col gap-2 pt-2">
                            <button 
                                type="submit" 
                                className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-lg ${
                                    isEditing 
                                    ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/10' 
                                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/10'
                                }`}
                            >
                                {isEditing ? 'Commit Log Override' : 'Process Adjustments'}
                            </button>

                            {isEditing && (
                                <button 
                                    type="button" 
                                    onClick={handleResetState}
                                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1"
                                >
                                    <X size={14} /> Cancel Editing
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Ledger Table Section with Action Portlets */}
                <div className="lg:col-span-2 overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
                            <thead className="bg-slate-800/40 text-slate-400 font-semibold uppercase text-xs tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">ID</th>
                                    <th className="px-6 py-4">SKU Product Target</th>
                                    <th className="px-6 py-4">Facility Code</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Quantity</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800 text-slate-300 font-medium">
                                {transactions.map((t) => (
                                    <tr key={t.transactionID} className="hover:bg-slate-800/20 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-slate-500">#{t.transactionID}</td>
                                        <td className="px-6 py-4 font-semibold text-slate-100">{t.productCode}</td>
                                        <td className="px-6 py-4 font-mono text-xs text-slate-400">{t.warehouseCode || 'N/A'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                                t.transactionType === 'IN' 
                                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                            }`}>
                                                {t.transactionType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-200">{t.quantityMoved} units</td>
                                        <td className="px-6 py-4 text-right space-x-3 whitespace-nowrap">
                                            <button 
                                                onClick={() => handleEditInitiate(t)} 
                                                className="text-slate-400 hover:text-amber-400 transition-colors inline-flex"
                                                title="Edit Entry Log"
                                            >
                                                <Edit2 size={15} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(t.transactionID)} 
                                                className="text-slate-400 hover:text-rose-400 transition-colors inline-flex"
                                                title="Delete Log Record"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {transactions.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-500 font-medium">
                                            No tracking transaction metrics parsed inside current records.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}