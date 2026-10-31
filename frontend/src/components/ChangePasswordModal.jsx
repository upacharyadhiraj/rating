import React, { useState } from 'react';
import { X, Lock, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';
import api from '../services/api';

export const ChangePasswordModal = ({ isOpen, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  // Real-time password requirement checks
  const hasLength = newPassword.length >= 8 && newPassword.length <= 16;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const isValid = hasLength && hasUppercase && hasSpecial && passwordsMatch && currentPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!isValid) {
      setError('Please fulfill all password requirements before submitting.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.patch('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      if (res.data.success) {
        setSuccess('Password updated successfully!');
        setTimeout(() => {
          onClose();
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setSuccess('');
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <KeyRound size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Update Password</h3>
              <p className="text-xs text-slate-500">Secure your account credentials</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-rose-700 bg-rose-50 rounded-xl border border-rose-200">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 text-sm text-emerald-700 bg-emerald-50 rounded-xl border border-emerald-200">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              placeholder="Enter current password"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              New Password
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              placeholder="8-16 characters"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              placeholder="Re-enter new password"
            />
          </div>

          {/* Validation Checklist */}
          <div className="p-3.5 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Password Requirements:
            </p>
            <div className="grid grid-cols-1 gap-1 text-xs">
              <div
                className={`flex items-center gap-1.5 ${
                  hasLength ? 'text-emerald-600 font-medium' : 'text-slate-500'
                }`}
              >
                <CheckCircle2 size={13} className={hasLength ? 'text-emerald-500' : 'text-slate-300'} />
                <span>8 to 16 characters</span>
              </div>
              <div
                className={`flex items-center gap-1.5 ${
                  hasUppercase ? 'text-emerald-600 font-medium' : 'text-slate-500'
                }`}
              >
                <CheckCircle2 size={13} className={hasUppercase ? 'text-emerald-500' : 'text-slate-300'} />
                <span>At least one uppercase letter (A-Z)</span>
              </div>
              <div
                className={`flex items-center gap-1.5 ${
                  hasSpecial ? 'text-emerald-600 font-medium' : 'text-slate-500'
                }`}
              >
                <CheckCircle2 size={13} className={hasSpecial ? 'text-emerald-500' : 'text-slate-300'} />
                <span>At least one special character (!@#$%^&*)</span>
              </div>
              {confirmPassword && (
                <div
                  className={`flex items-center gap-1.5 ${
                    passwordsMatch ? 'text-emerald-600 font-medium' : 'text-rose-500'
                  }`}
                >
                  <CheckCircle2
                    size={13}
                    className={passwordsMatch ? 'text-emerald-500' : 'text-slate-300'}
                  />
                  <span>Passwords match</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !isValid}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
