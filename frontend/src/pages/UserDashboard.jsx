import React, { useState, useEffect } from 'react';
import { Search, Star, Store, MapPin, Mail, Sparkles, Filter, X, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { Navbar } from '../components/Navbar';
import { StarRating } from '../components/StarRating';
import { SortableHeader } from '../components/SortableHeader';

export const UserDashboard = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');

  // Rating modal state
  const [selectedStore, setSelectedStore] = useState(null);
  const [newRating, setNewRating] = useState(5);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const fetchStores = async () => {
    setLoading(true);
    try {
      const res = await api.get('/stores', {
        params: {
          search,
          sortBy,
          sortOrder,
        },
      });
      if (res.data.success) {
        setStores(res.data.stores);
      }
    } catch (error) {
      console.error('Failed to fetch stores:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search input
    const timer = setTimeout(() => {
      fetchStores();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, sortBy, sortOrder]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
    } else {
      setSortBy(field);
      setSortOrder('ASC');
    }
  };

  const handleOpenRatingModal = (store) => {
    setSelectedStore(store);
    setNewRating(store.user_rating || 5);
  };

  const handleSubmitRating = async () => {
    if (!selectedStore) return;
    setSubmittingRating(true);
    try {
      const res = await api.post(`/stores/${selectedStore.id}/rating`, {
        rating: newRating,
      });

      if (res.data.success) {
        setToastMessage(`Rating of ${newRating} ★ submitted for ${selectedStore.name}!`);
        setTimeout(() => setToastMessage(''), 3500);

        // Update local state without full reload
        setStores((prevStores) =>
          prevStores.map((s) => {
            if (s.id === selectedStore.id) {
              return {
                ...s,
                user_rating: newRating,
                overall_rating: res.data.storeStats.overallRating,
                total_ratings: res.data.storeStats.totalRatings,
              };
            }
            return s;
          })
        );
        setSelectedStore(null);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit rating.');
    } finally {
      setSubmittingRating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Banner */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-950/10 mb-8 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/20 mb-3">
              <Sparkles size={14} className="text-amber-300" /> Customer Rating Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Discover & Review Registered Stores
            </h1>
            <p className="mt-2 text-sm text-indigo-100/90 leading-relaxed">
              Browse stores, search by store name or location, and submit or modify your 1 to 5 star ratings.
            </p>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="mb-6 flex items-center justify-between p-4 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20 animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={20} className="shrink-0" />
              <span className="font-semibold text-sm">{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage('')}
              className="p-1 hover:bg-emerald-600 rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Search and Filter Controls */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200/80 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search stores by Name or Address..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-900"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end text-xs text-slate-500">
            <span className="font-semibold text-slate-700">
              {stores.length} {stores.length === 1 ? 'store' : 'stores'} found
            </span>
          </div>
        </div>

        {/* Stores Table with Sorting */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <SortableHeader
                    label="Store Name"
                    field="name"
                    currentSortBy={sortBy}
                    currentSortOrder={sortOrder}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Address"
                    field="address"
                    currentSortBy={sortBy}
                    currentSortOrder={sortOrder}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Overall Rating"
                    field="rating"
                    currentSortBy={sortBy}
                    currentSortOrder={sortOrder}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="My Rating"
                    field="myRating"
                    currentSortBy={sortBy}
                    currentSortOrder={sortOrder}
                    onSort={handleSort}
                  />
                  <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
                      <p className="text-sm">Loading registered stores...</p>
                    </td>
                  </tr>
                ) : stores.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">
                      <Store size={36} className="mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold">No stores found</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Try adjusting your search criteria.
                      </p>
                    </td>
                  </tr>
                ) : (
                  stores.map((store) => (
                    <tr
                      key={store.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Store Name & Email */}
                      <td className="px-4 py-4">
                        <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {store.name}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Mail size={12} className="shrink-0" />
                          <span>{store.email}</span>
                        </div>
                      </td>

                      {/* Address */}
                      <td className="px-4 py-4 max-w-xs text-slate-600 text-xs">
                        <div className="flex items-start gap-1">
                          <MapPin size={14} className="shrink-0 text-slate-400 mt-0.5" />
                          <span className="line-clamp-2">{store.address}</span>
                        </div>
                      </td>

                      {/* Overall Rating */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <StarRating rating={store.overall_rating} size={16} />
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          Based on {store.total_ratings} {store.total_ratings === 1 ? 'review' : 'reviews'}
                        </span>
                      </td>

                      {/* User's Submitted Rating */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        {store.user_rating !== null ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
                            <Star size={14} className="fill-amber-400 text-amber-400" />
                            <span className="font-bold text-xs">{store.user_rating} / 5</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Not rated yet</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleOpenRatingModal(store)}
                          className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all shadow-sm ${
                            store.user_rating !== null
                              ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                              : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow'
                          }`}
                        >
                          {store.user_rating !== null ? 'Modify Rating' : 'Submit Rating'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Interactive Rating Modal */}
      {selectedStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-100 text-center p-6">
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedStore(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 mx-auto flex items-center justify-center mb-3">
              <Star size={26} className="fill-amber-400" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              {selectedStore.user_rating !== null ? 'Modify Your Rating' : 'Rate this Store'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-[260px] mx-auto truncate font-medium">
              {selectedStore.name}
            </p>

            <div className="py-6 flex flex-col items-center justify-center">
              <StarRating
                rating={newRating}
                interactive={true}
                size={34}
                onRate={(val) => setNewRating(val)}
                showValue={false}
              />
              <span className="text-2xl font-extrabold text-slate-800 mt-3">
                {newRating} <span className="text-sm font-semibold text-slate-400">/ 5 Stars</span>
              </span>
              <p className="text-xs text-slate-400 mt-1">Click any star to pick 1 to 5</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedStore(null)}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submittingRating}
                onClick={handleSubmitRating}
                className="flex-1 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all disabled:opacity-60"
              >
                {submittingRating ? 'Saving...' : 'Save Rating'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
