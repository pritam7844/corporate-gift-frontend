'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';

export default function EmployeeLogin() {
  const params = useParams(); 
  const subdomain = params.subdomain; // Provided safely by our middleware!

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { handleEmployeeLogin, error, loading } = useAuth();

  const onSubmit = (e) => {
    e.preventDefault();
    handleEmployeeLogin(email, password, subdomain);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-96 border-t-4 border-blue-600">
        <h1 className="text-2xl font-bold text-center mb-2 text-gray-800 capitalize">
          {subdomain} Portal
        </h1>
        <p className="text-center text-sm text-gray-500 mb-6">Employee Gifting Access</p>
        
        {error && <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
        
        <form onSubmit={onSubmit} className="space-y-4">
          <input 
            type="email" placeholder="Work Email" required
            className="w-full px-3 py-2 border rounded-md"
            value={email} onChange={(e) => setEmail(e.target.value)} 
          />
          <input 
            type="password" placeholder="Password" required
            className="w-full px-3 py-2 border rounded-md"
            value={password} onChange={(e) => setPassword(e.target.value)} 
          />
          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition">
            {loading ? 'Logging in...' : 'Access Portal'}
          </button>
        </form>
      </div>
    </div>
  );
}