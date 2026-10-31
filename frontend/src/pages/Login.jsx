import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Mail, Lock, AlertCircle, ArrowRight, ShieldCheck, UserCheck, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      // Navigate to respective dashboard
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else if (user.role === 'STORE_OWNER') {
        navigate('/owner');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-click test fill helper
  const fillCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50/40 to-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 mb-4">
          <Star size={30} className="fill-amber-300 text-amber-300" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Welcome to StoreRate
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Single login platform for Customers, Store Owners, and Administrators
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-100 sm:px-10">
          {error && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 text-sm text-rose-700 bg-rose-50 rounded-xl border border-rose-200 animate-shake">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-900"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-900"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md shadow-indigo-100 hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-60"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          {/* Registration link */}
          <div className="mt-6 text-center text-sm text-slate-600 pt-4 border-t border-slate-100">
            <span>New customer? </span>
            <Link
              to="/register"
              className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              Register here
            </Link>
          </div>

          {/* Quick Demo Pre-fills for Testing */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-3">
              Quick 1-Click Demo Logins
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials('admin@storerating.com', 'Password@123')}
                className="flex flex-col items-center justify-center p-2 rounded-xl border border-purple-100 bg-purple-50/50 hover:bg-purple-100/60 transition-all text-center group"
              >
                <ShieldCheck size={16} className="text-purple-600 mb-1" />
                <span className="text-[11px] font-bold text-purple-900">Admin</span>
                <span className="text-[9px] text-purple-600">Full Access</span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('alexander@consumer.com', 'Password@123')}
                className="flex flex-col items-center justify-center p-2 rounded-xl border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-100/60 transition-all text-center group"
              >
                <UserCheck size={16} className="text-emerald-600 mb-1" />
                <span className="text-[11px] font-bold text-emerald-900">Normal User</span>
                <span className="text-[9px] text-emerald-600">Rate Stores</span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('owner1@dundermifflin.com', 'Password@123')}
                className="flex flex-col items-center justify-center p-2 rounded-xl border border-amber-100 bg-amber-50/50 hover:bg-amber-100/60 transition-all text-center group"
              >
                <Store size={16} className="text-amber-600 mb-1" />
                <span className="text-[11px] font-bold text-amber-900">Store Owner</span>
                <span className="text-[9px] text-amber-600">Store Stats</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
