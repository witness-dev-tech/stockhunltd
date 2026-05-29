import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
            <div className="p-4 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-2xl mb-4">
                <AlertTriangle size={48} />
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-100 sm:text-5xl">404 - Area Missing</h1>
            <p className="mt-2 text-base text-slate-400 max-w-md">The specific system routing path you targeted does not exist inside StockHub logs framework.</p>
            <div className="mt-6">
                <Link to="/" className="inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-semibold rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-500 transition-colors">
                    Return to System Base
                </Link>
            </div>
        </div>
    );
}