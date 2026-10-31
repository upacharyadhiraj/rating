import React, { useState, useEffect } from 'react';
import { Store, Star, Users, MapPin, Mail, Calendar, Sparkles, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { Navbar } from '../components/Navbar';
import { StarRating } from '../components/StarRating';
import { SortableHeader } from '../components/SortableHeader';

export const OwnerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get('/owner/dashboard', {
        params: {
          sortBy,
          sortOrder,
        },
      });
      if (res.data.success) {
        setData(res.data);
      }
    } catch (error) {
      console.error('Failed to load owner dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [sortBy, sortOrder]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
    } else {
      setSortBy(field);
      setSortOrder('ASC');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Loading State */}
        {loading && !data && (
          <div className="py-20 text-center text-slate-400">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
            <p className="text-sm">Loading your store performance...</p>
          </div>
        )}

        {/* Case: No Store Assigned to this Owner yet */}
        {!loading && data && !data.hasStore && (
          <div className="max-w-md mx-auto my-12 bg-white rounded-3xl p-8 border border-slate-200 text-center shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 mx-auto flex items-center justify-center mb-4">
              <Store size={30} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">No Store Assigned</h2>
            <p className="text-sm text-slate-500 mt-2">
              There is currently no store linked to your owner account. Please request the System Administrator to assign your store.
            </p>
          </div>
        )}

        {/* Store Overview and Ratings */}
        {data && data.hasStore && data.store && (
          <>
            {/* Store Banner & Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Main Store Info Card */}
              <div className="lg:col-span-2 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-slate-900/10 flex flex-col justify-between">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30 mb-3">
                    <Store size={14} /> Registered Store
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    {data.store.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-indigo-200/90 mt-3">
                    <div className="flex items-center gap-1">
                      <Mail size={14} className="text-indigo-400" />
                      <span>{data.store.email}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin size={14} className="text-indigo-400" />
                      <span>{data.store.address}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-indigo-800/60 flex items-center gap-2 text-xs text-indigo-300">
                  <Sparkles size={14} className="text-amber-400" />
                  <span>Real-time customer feedback updated automatically.</span>
                </div>
              </div>

              {/* Rating Metric Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col justify-center items-center text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Average Rating
                </span>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-5xl font-black text-slate-900">
                    {data.store.averageRating.toFixed(1)}
                  </span>
                  <span className="text-xl font-bold text-slate-400">/ 5.0</span>
                </div>

                <StarRating rating={data.store.averageRating} size={24} showValue={false} />

                <div className="mt-4 px-4 py-1.5 rounded-full bg-slate-100 text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <Users size={14} />
                  <span>{data.store.totalRatings} total reviews</span>
                </div>
              </div>
            </div>

            {/* List of Users Who Submitted Ratings for their Store */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Customer Ratings & Reviews</h2>
                  <p className="text-xs text-slate-500">
                    List of customers who reviewed {data.store.name}
                  </p>
                </div>
                <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
                  {data.ratings.length} {data.ratings.length === 1 ? 'Customer Review' : 'Customer Reviews'}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <SortableHeader
                        label="Customer Name"
                        field="name"
                        currentSortBy={sortBy}
                        currentSortOrder={sortOrder}
                        onSort={handleSort}
                      />
                      <SortableHeader
                        label="Email"
                        field="email"
                        currentSortBy={sortBy}
                        currentSortOrder={sortOrder}
                        onSort={handleSort}
                      />
                      <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-600">
                        Address
                      </th>
                      <SortableHeader
                        label="Rating Given"
                        field="rating"
                        currentSortBy={sortBy}
                        currentSortOrder={sortOrder}
                        onSort={handleSort}
                      />
                      <SortableHeader
                        label="Date Submitted"
                        field="created_at"
                        currentSortBy={sortBy}
                        currentSortOrder={sortOrder}
                        onSort={handleSort}
                      />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.ratings.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-500">
                          <Users size={36} className="mx-auto text-slate-300 mb-2" />
                          <p className="font-semibold">No ratings submitted yet</p>
                          <p className="text-xs text-slate-400 mt-1">
                            When users rate your store, their reviews will appear here.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      data.ratings.map((item) => (
                        <tr key={item.rating_id} className="hover:bg-slate-50/70 transition-colors">
                          {/* Name */}
                          <td className="px-4 py-4 font-bold text-slate-900">
                            {item.user_name}
                          </td>

                          {/* Email */}
                          <td className="px-4 py-4 text-xs text-slate-600">
                            {item.user_email}
                          </td>

                          {/* Address */}
                          <td className="px-4 py-4 text-xs text-slate-500 max-w-xs truncate">
                            {item.user_address}
                          </td>

                          {/* Rating */}
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <StarRating rating={item.rating} size={15} showValue={false} />
                              <span className="font-bold text-xs text-slate-800">
                                {item.rating} / 5
                              </span>
                            </div>
                          </td>

                          {/* Date */}
                          <td className="px-4 py-4 whitespace-nowrap text-xs text-slate-500">
                            <div className="flex items-center gap-1">
                              <Calendar size={13} className="text-slate-400" />
                              <span>{new Date(item.created_at).toLocaleDateString()}</span>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};
