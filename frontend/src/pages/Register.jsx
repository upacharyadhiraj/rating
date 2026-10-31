import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, User, Mail, MapPin, Lock, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const { name, email, address, password, confirmPassword } = formData;

  // Real-time validations
  const isNameValid = name.trim().length >= 20 && name.trim().length <= 60;
  const isAddressValid = address.trim().length > 0 && address.trim().length <= 400;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const hasLength = password.length >= 8 && password.length <= 16;
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const isPasswordValid = hasLength && hasUppercase && hasSpecial;
  const doPasswordsMatch = password.length > 0 && password === confirmPassword;

  const isFormValid = isNameValid && isAddressValid && isEmailValid && isPasswordValid && doPasswordsMatch;

  const handleChange = (e) => {
    const { name: field, value } = e.target;
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (!isFormValid) {
      setError('Please review the form and satisfy all specified validation rules.');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        address: address.trim(),
        password,
      });

      // Normal users navigate directly to their dashboard
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.data?.errors) {
        setFieldErrors(err.response.data.errors);
      }
      setError(err.response?.data?.message || err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to pre-fill a valid example for testing convenience
  const fillValidExample = () => {
    setFormData({
      name: 'Alexander Hamilton Junior Customer', // 34 chars (within 20-60)
      email: `user_${Date.now()}@consumer.com`,
      address: '777 Beacon Street, Suite 500, Boston, MA 02115',
      password: 'Password@123',
      confirmPassword: 'Password@123',
    });
    setError('');
    setFieldErrors({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50/40 to-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 mb-4">
          <Star size={30} className="fill-amber-300 text-amber-300" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Create Normal User Account
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Sign up to browse, search, and rate your favorite registered stores
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-100 sm:px-10">
          {error && (
            <div className="mb-6 flex items-start gap-2.5 p-3.5 text-sm text-rose-700 bg-rose-50 rounded-xl border border-rose-200">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name with length 20-60 indicator */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Full Name (20–60 characters)
                </label>
                <span
                  className={`text-xs font-semibold ${
                    isNameValid ? 'text-emerald-600' : name.length > 0 ? 'text-amber-600' : 'text-slate-400'
                  }`}
                >
                  {name.length}/60 chars {isNameValid && '✓'}
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  name="name"
                  required
                  value={name}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all text-slate-900 ${
                    fieldErrors.name
                      ? 'border-rose-400 focus:ring-rose-400'
                      : isNameValid
                      ? 'border-emerald-300 focus:ring-emerald-500'
                      : 'border-slate-200 focus:ring-indigo-500'
                  }`}
                  placeholder="e.g. Christopher Nolan Director"
                />
              </div>
              {fieldErrors.name && (
                <p className="mt-1 text-xs text-rose-600">{fieldErrors.name}</p>
              )}
              {name.length > 0 && !isNameValid && (
                <p className="mt-1 text-xs text-amber-600">
                  {name.length < 20
                    ? `Requires ${20 - name.length} more characters to reach minimum 20.`
                    : `Exceeds maximum 60 characters by ${name.length - 60}.`}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  value={email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all text-slate-900 ${
                    fieldErrors.email
                      ? 'border-rose-400 focus:ring-rose-400'
                      : isEmailValid
                      ? 'border-emerald-300 focus:ring-emerald-500'
                      : 'border-slate-200 focus:ring-indigo-500'
                  }`}
                  placeholder="youremail@example.com"
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-rose-600">{fieldErrors.email}</p>
              )}
            </div>

            {/* Address with max 400 chars */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Address (Max 400 characters)
                </label>
                <span className="text-xs text-slate-400">{address.length}/400</span>
              </div>
              <div className="relative">
                <div className="absolute top-3 left-3.5 pointer-events-none text-slate-400">
                  <MapPin size={18} />
                </div>
                <textarea
                  name="address"
                  rows={2}
                  required
                  maxLength={400}
                  value={address}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-900 resize-none"
                  placeholder="Street address, City, State, Postal Code"
                />
              </div>
              {fieldErrors.address && (
                <p className="mt-1 text-xs text-rose-600">{fieldErrors.address}</p>
              )}
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Password (8–16 chars)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    name="password"
                    required
                    value={password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-900"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    value={confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-900"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>
            </div>

            {/* Real-time Checklist for Password Rules */}
            <div className="p-3.5 bg-slate-50 rounded-xl space-y-1.5 border border-slate-100 text-xs">
              <span className="font-semibold text-slate-600 uppercase tracking-wider text-[10px] block">
                Challenge Password Validation Criteria:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div
                  className={`flex items-center gap-1.5 ${
                    hasLength ? 'text-emerald-600 font-semibold' : 'text-slate-400'
                  }`}
                >
                  <CheckCircle2 size={13} className={hasLength ? 'text-emerald-500' : 'text-slate-300'} />
                  <span>8 to 16 characters</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    hasUppercase ? 'text-emerald-600 font-semibold' : 'text-slate-400'
                  }`}
                >
                  <CheckCircle2 size={13} className={hasUppercase ? 'text-emerald-500' : 'text-slate-300'} />
                  <span>1+ Uppercase letter</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    hasSpecial ? 'text-emerald-600 font-semibold' : 'text-slate-400'
                  }`}
                >
                  <CheckCircle2 size={13} className={hasSpecial ? 'text-emerald-500' : 'text-slate-300'} />
                  <span>1+ Special character</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full mt-3 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md shadow-indigo-100 hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          {/* Fill test helper & Login link */}
          <div className="mt-5 flex items-center justify-between text-xs pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={fillValidExample}
              className="text-indigo-600 hover:text-indigo-800 font-medium underline"
            >
              Autofill valid sample data
            </button>
            <div className="text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-700">
                Log in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
