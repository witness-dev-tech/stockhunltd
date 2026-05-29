import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Box, Warehouse, Tag, DollarSign, Calendar, Truck, AlertCircle } from 'lucide-react';
import api from '../api/apiAxios';
import { toast } from 'react-hot-toast';

export default function Product() {
    const [products, setProducts] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        productCode: '', 
        productName: '', 
        category: '', 
        quantityInStock: 0, 
        unitPrice: '', 
        supplierName: '', 
        dateReceived: '', 
        warehouseCode: ''
    });

    const initLoad = async () => {
        setLoading(true);
        try {
            const [pRes, wRes] = await Promise.all([
                api.get('/products'), 
                api.get('/warehouses')
            ]);
            setProducts(pRes.data);
            setWarehouses(wRes.data);
        } catch (err) { 
            toast.error('Failed to load item portfolio dependencies'); 
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        initLoad(); 
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!form.warehouseCode) {
            toast.error('Please assign this product to a warehouse location');
            return;
        }

        try {
            // Clean payload transformations matching express-validator schemas 
            const payload = {
                productCode: form.productCode.trim(),
                productName: form.productName.trim(),
                category: form.category?.trim() || 'General',
                quantityInStock: parseInt(form.quantityInStock, 10) || 0,
                unitPrice: parseFloat(form.unitPrice), // Fixed: Form text inputs parsed to decimals
                supplierName: form.supplierName?.trim() || 'StockHub Internal',
                dateReceived: form.dateReceived ? form.dateReceived.substring(0, 10) : new Date().toISOString().substring(0, 10),
                warehouseCode: form.warehouseCode
            };

            if (isEditing) {
                await api.put(`/products/${form.productCode}`, payload);
                toast.success('Product portfolio updated successfully');
            } else {
                await api.post('/products', payload);
                toast.success('Product SKU registered completely');
            }

            // Clear configuration
            setForm({ 
                productCode: '', 
                productName: '', 
                category: '', 
                quantityInStock: 0, 
                unitPrice: '', 
                supplierName: '', 
                dateReceived: '', 
                warehouseCode: '' 
            });
            setIsEditing(false);
            initLoad();
        } catch (err) {
            // Catch express-validator array payloads or standard strings
            if (err.response?.data?.errors) {
                err.response.data.errors.forEach(valErr => {
                    toast.error(`${valErr.path || 'Validation'}: ${valErr.msg}`);
                });
            } else {
                toast.error(err.response?.data?.error || 'Execution failure processing data types.');
            }
        }
    };

    const handleDelete = async (code) => {
        if (!window.confirm("Are you sure you want to completely delete this product SKU?")) return;
        try {
            await api.delete(`/products/${code}`);
            toast.success('Product removed from active catalog');
            initLoad();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to clean record entry');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header Content */}
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">Product Portfolio (SKUs)</h1>
                <p className="text-slate-400 mt-1">Manage global item variants, pricing configurations, and stock assignments.</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start">
                {/* Form Component Module */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl xl:col-span-1">
                    <h2 className="text-xl font-bold mb-6 text-slate-100 flex items-center gap-2">
                        <Box size={20} className="text-indigo-400" />
                        {isEditing ? 'Modify SKU Details' : 'Register SKU Variant'}
                    </h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Product SKU Code</label>
                            <input 
                                type="text" 
                                disabled={isEditing} 
                                className="bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 block w-full px-3 py-2.5 rounded-lg text-sm disabled:opacity-50" 
                                placeholder="e.g. PROD-1002"
                                value={form.productCode} 
                                onChange={e => setForm({...form, productCode: e.target.value})} 
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Product Name / Label</label>
                            <input 
                                type="text" 
                                className="bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 block w-full px-3 py-2.5 rounded-lg text-sm" 
                                placeholder="Wireless Mouse MX"
                                value={form.productName} 
                                onChange={e => setForm({...form, productName: e.target.value})} 
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Category</label>
                                <input 
                                    type="text" 
                                    className="bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 block w-full px-3 py-2.5 rounded-lg text-sm" 
                                    placeholder="Electronics"
                                    value={form.category} 
                                    onChange={e => setForm({...form, category: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Unit Price (frw)</label>
                                <input 
                                    type="number" 
                                    step="0.01" 
                                    min="0.01"
                                    className="bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 block w-full px-3 py-2.5 rounded-lg text-sm" 
                                    placeholder="29.99"
                                    value={form.unitPrice} 
                                    onChange={e => setForm({...form, unitPrice: e.target.value})} 
                                    required
                                />
                            </div>
                        </div>

                        {!isEditing && (
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Initial Opening Stock</label>
                                <input 
                                    type="number" 
                                    min="0"
                                    className="bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 block w-full px-3 py-2.5 rounded-lg text-sm" 
                                    placeholder="0"
                                    value={form.quantityInStock} 
                                    onChange={e => setForm({...form, quantityInStock: e.target.value})}
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Supplier / Manufacturer</label>
                            <input 
                                type="text" 
                                className="bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 block w-full px-3 py-2.5 rounded-lg text-sm" 
                                placeholder="Logitech Corp"
                                value={form.supplierName} 
                                onChange={e => setForm({...form, supplierName: e.target.value})}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Assigned Distribution Warehouse</label>
                            <select 
                                className="bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 block w-full px-3 py-2.5 rounded-lg text-sm" 
                                value={form.warehouseCode} 
                                onChange={e => setForm({...form, warehouseCode: e.target.value})} 
                                required
                            >
                                <option value="">Select Target Hub Location</option>
                                {warehouses.map(w => (
                                    <option key={w.warehouseCode} value={w.warehouseCode}>
                                        {w.warehouseName} ({w.warehouseCode})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-2">
                            <Plus size={16} />
                            {isEditing ? 'Save Changes' : 'Add Item Variant'}
                        </button>
                        
                        {isEditing && (
                            <button 
                                type="button" 
                                onClick={() => {
                                    setIsEditing(false);
                                    setForm({ productCode: '', productName: '', category: '', quantityInStock: 0, unitPrice: '', supplierName: '', dateReceived: '', warehouseCode: '' });
                                }}
                                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-semibold transition-colors"
                            >
                                Cancel Optimization
                            </button>
                        )}
                    </form>
                </div>

                {/* Main Dynamic Table Element Display */}
                <div className="xl:col-span-3 overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
                            <thead className="bg-slate-800/40 text-slate-400 font-semibold uppercase text-xs tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">SKU Code</th>
                                    <th className="px-6 py-4">Product details</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Unit Price</th>
                                    <th className="px-6 py-4">Inventory Available</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800 text-slate-300">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-500 font-medium animate-pulse">
                                            Pulling inventory datasets directly from source clusters...
                                        </td>
                                    </tr>
                                ) : products.map((p) => (
                                    <tr key={p.productCode} className="hover:bg-slate-800/20 transition-colors">
                                        <td className="px-6 py-4 font-mono font-bold text-indigo-400">{p.productCode}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-100">{p.productName}</div>
                                            <div className="text-xs text-slate-400 mt-0.5">Supplier: {p.supplierName || 'Internal Warehouse'}</div>
                                            <div className="text-xs text-indigo-400 font-medium inline-block bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/10 mt-1">
                                                Base WH: {p.warehouseCode}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 text-xs bg-slate-950 text-slate-400 border border-slate-800 rounded font-medium">
                                                {p.category || 'General'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-mono font-semibold text-slate-100">
                                            frw{Number(p.unitPrice).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`font-bold font-mono px-2.5 py-1 rounded-full text-xs ${
                                                    p.quantityInStock <= 10 
                                                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse' 
                                                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                }`}>
                                                    {p.quantityInStock} units Available
                                                </span>
                                                {p.quantityInStock <= 10 && (
                                                    <AlertCircle size={14} className="text-rose-400" title="Low inventory thresholds crossed!" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-3">
                                            <button 
                                                onClick={() => { setForm(p); setIsEditing(true); }} 
                                                className="text-slate-400 hover:text-indigo-400 transition-colors inline-flex"
                                                title="Edit SKU"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(p.productCode)} 
                                                className="text-slate-400 hover:text-rose-400 transition-colors inline-flex"
                                                title="Delete SKU"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {!loading && products.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-500 font-medium">
                                            No active stock variants compiled in index registers.
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