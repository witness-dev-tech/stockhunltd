import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Warehouse as WhIcon } from 'lucide-react';
import api from '../api/apiAxios';
import { toast } from 'react-hot-toast';

export default function Warehouse() {
    const [warehouses, setWarehouses] = useState([]);
    const [form, setForm] = useState({ warehouseCode: '', warehouseName: '', warehouseLocation: '' });
    const [isEditing, setIsEditing] = useState(false);

    const fetchWarehouses = async () => {
        try {
            const res = await api.get('/warehouses');
            setWarehouses(res.data);
        } catch (err) { toast.error('Could not load warehouses'); }
    };

    useEffect(() => { fetchWarehouses(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await api.put(`/warehouses/${form.warehouseCode}`, form);
                toast.success('Warehouse entry updated');
            } else {
                await api.post('/warehouses', form);
                toast.success('New warehouse registered');
            }
            setForm({ warehouseCode: '', warehouseName: '', warehouseLocation: '' });
            setIsEditing(false);
            fetchWarehouses();
        } catch (err) { toast.error(err.response?.data?.error || 'Operation failed'); }
    };

    const handleDelete = async (code) => {
        if (!window.confirm("Delete this warehouse? This can affect product constraints.")) return;
        try {
            await api.delete(`/warehouses/${code}`);
            toast.success('Warehouse removed');
            fetchWarehouses();
        } catch (err) { toast.error('Failed to clear entry'); }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">Warehouse Network</h1>
                <p className="text-slate-400 mt-1">Manage global physical fulfillment structures.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Form Module */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl lg:sticky lg:top-8">
                    <h2 className="text-xl font-bold mb-6 text-slate-100 flex items-center gap-2">
                        <WhIcon size={20} className="text-indigo-400" />
                        {isEditing ? 'Modify Warehouse' : 'Register Location'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Code</label>
                            <input
                                type="text"
                                disabled={isEditing}
                                className="bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 block w-full px-3 py-2.5 rounded-lg text-sm disabled:opacity-50"
                                placeholder="e.g. WH-EAST"
                                value={form.warehouseCode}
                                onChange={e => setForm({...form, warehouseCode: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Name</label>
                            <input
                                type="text"
                                className="bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 block w-full px-3 py-2.5 rounded-lg text-sm"
                                placeholder="Main Distribution Hub"
                                value={form.warehouseName}
                                onChange={e => setForm({...form, warehouseName: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Location</label>
                            <input
                                type="text"
                                className="bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 block w-full px-3 py-2.5 rounded-lg text-sm"
                                placeholder="City, Country"
                                value={form.warehouseLocation}
                                onChange={e => setForm({...form, warehouseLocation: e.target.value})}
                            />
                        </div>
                        <button type="submit" className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-sm transition-colors shadow-lg shadow-indigo-600/10">
                            <Plus size={16} /> {isEditing ? 'Apply Changes' : 'Add Warehouse'}
                        </button>
                    </form>
                </div>

                {/* Data Presentation Layout Grid */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
                        <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
                            <thead className="bg-slate-800/40 text-slate-400 font-semibold uppercase tracking-wider text-xs">
                                <tr>
                                    <th className="px-6 py-4">Code</th>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Location</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800 text-slate-300">
                                {warehouses.map((w) => (
                                    <tr key={w.warehouseCode} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4 font-mono font-bold text-indigo-400">{w.warehouseCode}</td>
                                        <td className="px-6 py-4 font-medium text-slate-100">{w.warehouseName}</td>
                                        <td className="px-6 py-4 text-slate-400">{w.warehouseLocation || 'N/A'}</td>
                                        <td className="px-6 py-4 text-right space-x-3">
                                            <button onClick={() => { setForm(w); setIsEditing(true); }} className="text-slate-400 hover:text-indigo-400 inline-flex transition-colors"><Edit2 size={16} /></button>
                                            <button onClick={() => handleDelete(w.warehouseCode)} className="text-slate-400 hover:text-rose-400 inline-flex transition-colors"><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}