import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, LayoutDashboard, Warehouse, Box, ArrowLeftRight, FileBarChart, LogOut } from 'lucide-react';
import api from '../api/apiAxios';
import { toast } from 'react-hot-toast';

export default function Navbar({ children }) {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
            localStorage.removeItem('sh_logged_in');
            toast.success('Logged out successfully');
            navigate('/login');
        } catch (err) {
            toast.error('Logout failed');
        }
    };

    const navItems = [
        { to: "/", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
        { to: "/warehouses", icon: <Warehouse size={20} />, label: "Warehouses" },
        { to: "/products", icon: <Box size={20} />, label: "Products" },
        { to: "/transactions", icon: <ArrowLeftRight size={20} />, label: "Transactions" },
        { to: "/reports", icon: <FileBarChart size={20} />, label: "Reports" },
    ];

    const sidebarContent = (
        <div className="flex flex-col h-full bg-slate-900 text-slate-100 w-64 border-r border-slate-800">
            <div className="p-6 border-b border-slate-800 flex items-center gap-3">
                {/* Replaced generic Box icon with the favicon vector asset */}
                <div className="p-1.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center shadow-inner">
                    <img 
                        src="/favicon.svg" 
                        alt="StockHub Logo" 
                        className="w-9 h-9 object-contain"
                    />
                </div>
                <div>
                    <h1 className="font-bold text-lg tracking-tight text-slate-100">StockHub Ltd</h1>
                    <span className="text-xs text-slate-400">Management System</span>
                </div>
            </div>
            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => setIsOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                                isActive 
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                                : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"
                            }`
                        }
                    >
                        {item.icon}
                        {item.label}
                    </NavLink>
                ))}
            </nav>
            <div className="p-4 border-t border-slate-800">
                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:bg-rose-950/40 hover:text-rose-400 rounded-lg font-medium transition-colors"
                >
                    <LogOut size={20} />
                    Logout
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
            {/* Desktop Sidebar */}
            <aside className="hidden md:block h-screen sticky top-0 z-20">
                {sidebarContent}
            </aside>

            {/* Mobile Top Header */}
            <header className="md:hidden bg-slate-900 border-b border-slate-800 h-16 px-4 flex items-center justify-between sticky top-0 z-30">
                <div className="flex items-center gap-2.5">
                    {/* Replaced generic Box icon with the favicon vector asset for mobile views */}
                    <div className="p-1 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-center">
                        <img 
                            src="/favicon.svg" 
                            alt="StockHub Logo" 
                            className="w-6 h-6 object-contain"
                        />
                    </div>
                    <span className="font-bold tracking-tight text-slate-100">StockHub</span>
                </div>
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </header>

            {/* Mobile Sidebar Overlay Drawer */}
            {isOpen && (
                <div className="md:hidden fixed inset-0 z-40 flex">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
                    <aside className="relative z-50 animate-in slide-in-from-left duration-200">
                        {sidebarContent}
                    </aside>
                </div>
            )}

            {/* Viewport Content Wrapper */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}