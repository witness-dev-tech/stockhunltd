import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Module Component Structural Inclusions
import Login from './components/Login';
import CreateAccount from './components/CreateAccount';
import Dashboard from './components/Dashboard';
import Warehouse from './components/Warehouse';
import Product from './components/Product';
import StockTransaction from './components/StockTransaction';
import Report from './components/Report';
import NotFound from './components/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

export default function App() {
    return (
        <BrowserRouter>
            {/* Context Toaster UI Engine configuration parameters */}
            <Toaster 
                position="top-right"
                toastOptions={{
                    style: { background: '#0f172a', color: '#f1f5f9', border: '1px solid #334155' }
                }} 
            />
            
            <Routes>
                {/* Open Authentication Pathways endpoints */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<CreateAccount />} />

                {/* Secure Operations Ecosystem pathways */}
                <Route path="/" element={<ProtectedRoute><Navbar><Dashboard /></Navbar></ProtectedRoute>} />
                <Route path="/warehouses" element={<ProtectedRoute><Navbar><Warehouse /></Navbar></ProtectedRoute>} />
                <Route path="/products" element={<ProtectedRoute><Navbar><Product /></Navbar></ProtectedRoute>} />
                <Route path="/transactions" element={<ProtectedRoute><Navbar><StockTransaction /></Navbar></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute><Navbar><Report /></Navbar></ProtectedRoute>} />

                {/* Fallback Core System 404 Interceptor */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}