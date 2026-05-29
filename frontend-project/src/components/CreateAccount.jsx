import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/apiAxios';
import { toast } from 'react-hot-toast';

export default function CreateAccount() {
    const [form, setForm] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/register', form);
            toast.success('Registration complete! Please log in.');
            navigate('/login');
        } catch (err) {
            const serverErrors = err.response?.data?.errors;
            toast.error(serverErrors ? serverErrors[0].msg : (err.response?.data?.error || 'Registration failed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 items-center px-4">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                {/* Embedded StockHub custom favicon asset into registration header */}
                <div className="mx-auto h-14 w-14 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center p-1.5 shadow-xl shadow-indigo-500/5">
                    <img 
                        src="/favicon.svg" 
                        alt="StockHub Logo" 
                        className="w-full h-full object-contain"
                    />
                </div>
                <h2 className="mt-6 text-3xl font-extrabold text-slate-100 tracking-tight">Register Warehouse Account</h2>
                <p className="mt-2 text-sm text-slate-400">Join StockHub Ltd System Portal</p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-slate-900 py-8 px-4 shadow-xl border border-slate-800 sm:rounded-2xl sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-medium text-slate-300">Username</label>
                            <input
                                type="text"
                                required
                                className="mt-1 bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent block w-full px-3 py-2.5 rounded-lg text-sm transition-all"
                                placeholder="At least 4 characters"
                                value={form.username}
                                onChange={e => setForm({...form, username: e.target.value})}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300">Password</label>
                            <input
                                type="password"
                                required
                                className="mt-1 bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent block w-full px-3 py-2.5 rounded-lg text-sm transition-all"
                                placeholder="At least 6 characters"
                                value={form.password}
                                onChange={e => setForm({...form, password: e.target.value})}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Creating Account...' : 'Register'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-slate-400">
                            Already have an account?{' '}
                            <Link to="/login" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                                Log in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}