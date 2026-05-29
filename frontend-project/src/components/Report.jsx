import React, { useState, useEffect } from 'react';
import { FileBarChart, Calendar, Search, RefreshCw, AlertCircle, Download } from 'lucide-react';
import api from '../api/apiAxios';
import { toast } from 'react-hot-toast';

export default function Report() {
    const [period, setPeriod] = useState('daily');
    const [reportData, setReportData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchGeneratedReport = async (selectedPeriod) => {
        setLoading(true);
        try {
            const res = await api.get(`/reports/${selectedPeriod}`);
            setReportData(res.data);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to sync ledger matrix aggregates.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGeneratedReport(period);
    }, [period]);

    // Dynamic filtering engine mapping against target columns
    const filteredReports = reportData.filter((row) => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return true;

        return (
            row.productName?.toLowerCase().includes(query) ||
            row.productCode?.toLowerCase().includes(query) ||
            row.warehouseName?.toLowerCase().includes(query)
        );
    });

    // Helper utilities to parse structural responses safely depending on active switch matrices
    const getStockInValue = (row) => row.DailyStockIn ?? row.WeeklyStockIn ?? row.MonthlyStockIn ?? 0;
    const getStockOutValue = (row) => row.DailyStockOut ?? row.WeeklyStockOut ?? row.MonthlyStockOut ?? 0;
    
    const getTimeLabel = (row) => {
        if (period === 'daily' && row.ReportDate) {
            return new Date(row.ReportDate).toLocaleDateString(undefined, { dateStyle: 'medium' });
        }
        if (period === 'weekly') {
            return `Wk ${row.ReportWeek}, ${row.ReportYear}`;
        }
        if (period === 'monthly') {
            return `${row.ReportMonth} ${row.ReportYear}`;
        }
        return 'N/A';
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">Stock Valuation &amp; Audits</h1>
                    <p className="text-slate-400 mt-1">Cross-examine stock mutations, inward supplies, and outgoing logistics metrics.</p>
                </div>
                <button 
                    onClick={() => fetchGeneratedReport(period)} 
                    className="self-start sm:self-center p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 hover:text-indigo-400 transition-colors flex items-center gap-2 text-sm font-medium"
                    title="Refresh Ledger"
                >
                    <RefreshCw size={16} className={loading ? "animate-spin text-indigo-400" : ""} />
                    Sync Ledger
                </button>
            </div>

            {/* Filter control dashboard panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Timeframe Switcher */}
                <div className="md:col-span-5 lg:col-span-4">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Aggregate Timeframe</label>
                    <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 border border-slate-800 rounded-xl">
                        {['daily', 'weekly', 'monthly'].map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => { setPeriod(t); setSearchQuery(''); }}
                                className={`py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                                    period === t 
                                    ? 'bg-indigo-600 text-white shadow' 
                                    : 'text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Real-time Search Input Field */}
                <div className="md:col-span-7 lg:col-span-8">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Search Filters</label>
                    <div className="relative rounded-xl shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                            <Search size={18} />
                        </div>
                        <input
                            type="text"
                            className="bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 block w-full pl-10 pr-4 py-2 rounded-xl text-sm transition-all"
                            placeholder="Filter reports by product title, SKU code, or warehouse hub..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Ledger Aggregate Output Layout */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
                        <thead className="bg-slate-800/40 text-slate-400 font-semibold uppercase text-xs tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Timeline Index</th>
                                <th className="px-6 py-4">Product Variant Description</th>
                                <th className="px-6 py-4">Assigned Facility Base</th>
                                <th className="px-6 py-4 text-emerald-400">Total Stock In (+)</th>
                                <th className="px-6 py-4 text-rose-400">Total Stock Out (-)</th>
                                <th className="px-6 py-4">Net Flow Balance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-slate-300 font-medium">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-16 text-center text-slate-500 font-medium animate-pulse">
                                        Compiling dynamic multidimensional reports matrices...
                                        </td>
                                </tr>
                            ) : filteredReports.map((row, index) => {
                                const stockIn = getStockInValue(row);
                                const stockOut = getStockOutValue(row);
                                const netBalance = stockIn - stockOut;

                                return (
                                    <tr key={`${row.productCode}-${index}`} className="hover:bg-slate-800/20 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-indigo-400 flex items-center gap-2">
                                            <Calendar size={14} className="text-slate-500" />
                                            {getTimeLabel(row)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-100">{row.productName}</div>
                                            <div className="text-xs text-slate-500 font-mono mt-0.5">{row.productCode}</div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-400">
                                            {row.warehouseName}
                                        </td>
                                        <td className="px-6 py-4 font-mono font-bold text-emerald-400">
                                            +{stockIn} units
                                        </td>
                                        <td className="px-6 py-4 font-mono font-bold text-rose-400">
                                            -{stockOut} units
                                        </td>
                                        <td className="px-6 py-4 font-mono">
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                                netBalance > 0 
                                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                                : netBalance < 0 
                                                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                                    : 'bg-slate-950 text-slate-400 border border-slate-800'
                                            }`}>
                                                {netBalance > 0 ? `+${netBalance}` : netBalance} units
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                            
                            {!loading && filteredReports.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-16 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                                            <AlertCircle size={24} className="text-slate-600" />
                                            <p className="font-medium text-slate-400">No report entries matched your lookup filter criteria.</p>
                                            <p className="text-xs text-slate-500">Verify your query string parameter variables or try switching standard reporting periods.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}