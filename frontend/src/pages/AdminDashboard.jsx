import React, { useState, useEffect } from 'react';
import {
  Users,
  Store,
  Star,
  Plus,
  Search,
  Filter,
  X,
  Shield,
  Eye,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Mail,
  User,
  KeyRound,
} from 'lucide-react';
import api from '../services/api';
import { Navbar } from '../components/Navbar';
import { StarRating } from '../components/StarRating';
import { SortableHeader } from '../components/SortableHeader';

export const AdminDashboard = () => {
  // Metrics state
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0,
  });

  const [activeTab, setActiveTab] = useState('stores'); // 'stores' | 'users'

  // Stores table state
  const [stores, setStores] = useState([]);
  const [storesLoading, setStoresLoading] = useState(false);
  const [storeFilterName, setStoreFilterName] = useState('');
  const [storeFilterEmail, setStoreFilterEmail] = useState('');
  const [storeFilterAddress, setStoreFilterAddress] = useState('');
  const [storeSortBy, setStoreSortBy] = useState('name');
  const [storeSortOrder, setStoreSortOrder] = useState('ASC');

  // Users table state
  const [usersList, setUsersList] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userFilterName, setUserFilterName] = useState('');
  const [userFilterEmail, setUserFilterEmail] = useState('');
  const [userFilterAddress, setUserFilterAddress] = useState('');
  const [userFilterRole, setUserFilterRole] = useState('');
  const [userSortBy, setUserSortBy] = useState('id');
  const [userSortOrder, setUserSortOrder] = useState('ASC');

  // Modal states
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isAddStoreModalOpen, setIsAddStoreModalOpen] = useState(false);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // 1. Fetch Metrics
  const fetchMetrics = async () => {
    try {
      const res = await api.get('/admin/metrics');
      if (res.data.success) {
        setMetrics(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch admin metrics:', error);
    }
  };

  // 2. Fetch Stores
  const fetchStores = async () => {
    setStoresLoading(true);
    try {
      const res = await api.get('/admin/stores', {
        params: {
          name: storeFilterName,
          email: storeFilterEmail,
          address: storeFilterAddress,
          sortBy: storeSortBy,
          sortOrder: storeSortOrder,
        },
      });
      if (res.data.success) {
        setStores(res.data.stores);
      }
    } catch (error) {
      console.error('Failed to fetch stores:', error);
    } finally {
      setStoresLoading(false);
    }
  };

  // 3. Fetch Users
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await api.get('/admin/users', {
        params: {
          name: userFilterName,
          email: userFilterEmail,
          address: userFilterAddress,
          role: userFilterRole,
          sortBy: userSortBy,
          sortOrder: userSortOrder,
        },
      });
      if (res.data.success) {
        setUsersList(res.data.users);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchMetrics();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStores();
    }, 200);
    return () => clearTimeout(timer);
  }, [storeFilterName, storeFilterEmail, storeFilterAddress, storeSortBy, storeSortOrder]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 200);
    return () => clearTimeout(timer);
  }, [userFilterName, userFilterEmail, userFilterAddress, userFilterRole, userSortBy, userSortOrder]);

  const handleStoreSort = (field) => {
    if (storeSortBy === field) {
      setStoreSortOrder((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
    } else {
      setStoreSortBy(field);
      setStoreSortOrder('ASC');
    }
  };

  const handleUserSort = (field) => {
    if (userSortBy === field) {
      setUserSortOrder((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
    } else {
      setUserSortBy(field);
      setUserSortOrder('ASC');
    }
  };

  // View User Details
  const handleViewUser = async (userId) => {
    try {
      const res = await api.get(`/admin/users/${userId}`);
      if (res.data.success) {
        setSelectedUserDetails(res.data.user);
      }
    } catch (error) {
      alert('Failed to load user details.');
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
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

        {/* Dashboard Title & Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              System Administrator Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage platform stores, user accounts, and review metrics
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddStoreModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all"
            >
              <Plus size={16} /> Add New Store
            </button>
            <button
              onClick={() => setIsAddUserModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-all"
            >
              <Plus size={16} /> Add New User
            </button>
          </div>
        </div>

        {/* 1. Dashboard Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {/* Card 1: Total Users */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Users size={28} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Users
              </p>
              <h3 className="text-3xl font-black text-slate-900 mt-0.5">
                {metrics.totalUsers}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Admins, Owners & Normal Users</p>
            </div>
          </div>

          {/* Card 2: Total Stores */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Store size={28} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Stores
              </p>
              <h3 className="text-3xl font-black text-slate-900 mt-0.5">
                {metrics.totalStores}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Registered commercial stores</p>
            </div>
          </div>

          {/* Card 3: Total Submitted Ratings */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
              <Star size={28} className="fill-amber-400 text-amber-400" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Ratings
              </p>
              <h3 className="text-3xl font-black text-slate-900 mt-0.5">
                {metrics.totalRatings}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Ratings submitted (1 to 5)</p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-200 mb-6">
          <button
            onClick={() => setActiveTab('stores')}
            className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'stores'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Store size={18} />
            <span>Stores Directory ({stores.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'users'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Users size={18} />
            <span>Users & Administrators ({usersList.length})</span>
          </button>
        </div>

        {/* TAB 1: STORES DIRECTORY */}
        {activeTab === 'stores' && (
          <div className="space-y-4">
            {/* Filters for Stores: Name, Email, Address */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <Filter size={14} /> Filter Stores
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Filter by Store Name..."
                  value={storeFilterName}
                  onChange={(e) => setStoreFilterName(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-900"
                />
                <input
                  type="text"
                  placeholder="Filter by Email..."
                  value={storeFilterEmail}
                  onChange={(e) => setStoreFilterEmail(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-900"
                />
                <input
                  type="text"
                  placeholder="Filter by Address..."
                  value={storeFilterAddress}
                  onChange={(e) => setStoreFilterAddress(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-900"
                />
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
                        currentSortBy={storeSortBy}
                        currentSortOrder={storeSortOrder}
                        onSort={handleStoreSort}
                      />
                      <SortableHeader
                        label="Email"
                        field="email"
                        currentSortBy={storeSortBy}
                        currentSortOrder={storeSortOrder}
                        onSort={handleStoreSort}
                      />
                      <SortableHeader
                        label="Address"
                        field="address"
                        currentSortBy={storeSortBy}
                        currentSortOrder={storeSortOrder}
                        onSort={handleStoreSort}
                      />
                      <SortableHeader
                        label="Overall Rating"
                        field="rating"
                        currentSortBy={storeSortBy}
                        currentSortOrder={storeSortOrder}
                        onSort={handleStoreSort}
                      />
                      <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-600">
                        Store Owner
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {storesLoading ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400">
                          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
                          <p className="text-xs">Loading stores...</p>
                        </td>
                      </tr>
                    ) : stores.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-500">
                          <Store size={32} className="mx-auto text-slate-300 mb-2" />
                          <p className="font-semibold text-sm">No stores matched criteria</p>
                        </td>
                      </tr>
                    ) : (
                      stores.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-4 py-4 font-bold text-slate-900">{s.name}</td>
                          <td className="px-4 py-4 text-xs text-slate-600">{s.email}</td>
                          <td className="px-4 py-4 text-xs text-slate-500 max-w-xs truncate">
                            {s.address}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <StarRating rating={s.overall_rating} size={15} />
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              {s.total_ratings} {s.total_ratings === 1 ? 'rating' : 'ratings'}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-xs text-slate-700">
                            {s.owner_name ? (
                              <span className="font-medium text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
                                {s.owner_name}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">Unassigned</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USERS DIRECTORY */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Filters for Users: Name, Email, Address, Role */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <Filter size={14} /> Filter Users & Roles
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <input
                  type="text"
                  placeholder="Filter by Name..."
                  value={userFilterName}
                  onChange={(e) => setUserFilterName(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-900"
                />
                <input
                  type="text"
                  placeholder="Filter by Email..."
                  value={userFilterEmail}
                  onChange={(e) => setUserFilterEmail(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-900"
                />
                <input
                  type="text"
                  placeholder="Filter by Address..."
                  value={userFilterAddress}
                  onChange={(e) => setUserFilterAddress(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-900"
                />
                <select
                  value={userFilterRole}
                  onChange={(e) => setUserFilterRole(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-900"
                >
                  <option value="">All Roles</option>
                  <option value="ADMIN">System Administrator</option>
                  <option value="USER">Normal User</option>
                  <option value="STORE_OWNER">Store Owner</option>
                </select>
              </div>
            </div>

            {/* Users Table with Sorting */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <SortableHeader
                        label="Full Name"
                        field="name"
                        currentSortBy={userSortBy}
                        currentSortOrder={userSortOrder}
                        onSort={handleUserSort}
                      />
                      <SortableHeader
                        label="Email"
                        field="email"
                        currentSortBy={userSortBy}
                        currentSortOrder={userSortOrder}
                        onSort={handleUserSort}
                      />
                      <SortableHeader
                        label="Address"
                        field="address"
                        currentSortBy={userSortBy}
                        currentSortOrder={userSortOrder}
                        onSort={handleUserSort}
                      />
                      <SortableHeader
                        label="Role"
                        field="role"
                        currentSortBy={userSortBy}
                        currentSortOrder={userSortOrder}
                        onSort={handleUserSort}
                      />
                      <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {usersLoading ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400">
                          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
                          <p className="text-xs">Loading users...</p>
                        </td>
                      </tr>
                    ) : usersList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-500">
                          <Users size={32} className="mx-auto text-slate-300 mb-2" />
                          <p className="font-semibold text-sm">No users matched criteria</p>
                        </td>
                      </tr>
                    ) : (
                      usersList.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-4 py-4 font-bold text-slate-900">{u.name}</td>
                          <td className="px-4 py-4 text-xs text-slate-600">{u.email}</td>
                          <td className="px-4 py-4 text-xs text-slate-500 max-w-xs truncate">
                            {u.address}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            {u.role === 'ADMIN' ? (
                              <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                                Admin
                              </span>
                            ) : u.role === 'STORE_OWNER' ? (
                              <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                Store Owner
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                Normal User
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right">
                            <button
                              onClick={() => handleViewUser(u.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all"
                            >
                              <Eye size={14} /> View Details
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL 1: VIEW USER DETAILS (Including Store Rating if Store Owner!) */}
      {selectedUserDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <User size={18} className="text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">User Details</h3>
              </div>
              <button
                onClick={() => setSelectedUserDetails(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Full Name
                </span>
                <p className="font-bold text-slate-900 text-base">{selectedUserDetails.name}</p>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Email Address
                </span>
                <p className="text-slate-700">{selectedUserDetails.email}</p>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Address
                </span>
                <p className="text-slate-700 leading-relaxed">{selectedUserDetails.address}</p>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Assigned Role
                </span>
                <span className="inline-block mt-0.5 px-3 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-800">
                  {selectedUserDetails.role}
                </span>
              </div>

              {/* Requirement: If user is Store Owner, display their store rating! */}
              {selectedUserDetails.role === 'STORE_OWNER' && (
                <div className="mt-4 p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wider">
                    <Store size={15} /> Store Owner Rating Details
                  </div>
                  {selectedUserDetails.store ? (
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {selectedUserDetails.store.store_name}
                      </p>
                      <p className="text-xs text-slate-500 mb-2">
                        {selectedUserDetails.store.store_address}
                      </p>
                      <div className="flex items-center gap-2">
                        <StarRating rating={selectedUserDetails.storeRating} size={18} />
                        <span className="text-xs text-slate-500 font-semibold">
                          ({selectedUserDetails.store.total_ratings} reviews)
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-amber-800 italic">
                      No store is currently associated with this owner account.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-right">
              <button
                type="button"
                onClick={() => setSelectedUserDetails(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/70 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD NEW USER */}
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onSuccess={() => {
          fetchUsers();
          fetchMetrics();
          showToast('New user created successfully!');
        }}
      />

      {/* MODAL 3: ADD NEW STORE */}
      <AddStoreModal
        isOpen={isAddStoreModalOpen}
        onClose={() => setIsAddStoreModalOpen(false)}
        onSuccess={() => {
          fetchStores();
          fetchMetrics();
          showToast('New store added successfully!');
        }}
      />
    </div>
  );
};

// Sub-component: Add User Modal (Admin)
const AddUserModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    role: 'USER',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  if (!isOpen) return null;

  const { name, email, address, password, role } = formData;

  const isNameValid = name.trim().length >= 20 && name.trim().length <= 60;
  const isAddressValid = address.trim().length > 0 && address.trim().length <= 400;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isPasswordValid =
    password.length >= 8 &&
    password.length <= 16 &&
    /[A-Z]/.test(password) &&
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const isValid = isNameValid && isAddressValid && isEmailValid && isPasswordValid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (!isValid) {
      setError('Please fulfill all validation requirements.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/admin/users', formData);
      if (res.data.success) {
        onSuccess();
        onClose();
        setFormData({
          name: '',
          email: '',
          address: '',
          password: '',
          role: 'USER',
        });
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        setFieldErrors(err.response.data.errors);
      }
      setError(err.response?.data?.message || 'Failed to create user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-900 text-lg">Add New User</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-sm">
          {error && (
            <div className="flex items-start gap-2 p-3 text-xs text-rose-700 bg-rose-50 rounded-xl border border-rose-200">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Full Name (20–60 chars)
              </label>
              <span className={`text-xs ${isNameValid ? 'text-emerald-600' : 'text-slate-400'}`}>
                {name.length}/60
              </span>
            </div>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              placeholder="e.g. Alexander Hamilton Junior Official"
            />
            {fieldErrors.name && <p className="text-xs text-rose-600 mt-1">{fieldErrors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              placeholder="user@example.com"
            />
            {fieldErrors.email && <p className="text-xs text-rose-600 mt-1">{fieldErrors.email}</p>}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Address (Max 400 chars)
              </label>
              <span className="text-xs text-slate-400">{address.length}/400</span>
            </div>
            <textarea
              required
              rows={2}
              maxLength={400}
              value={address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none"
              placeholder="Address details..."
            />
            {fieldErrors.address && (
              <p className="text-xs text-rose-600 mt-1">{fieldErrors.address}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password (8–16 chars)
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                placeholder="Must include 1 UPPER & 1 SPECIAL"
              />
              {fieldErrors.password && (
                <p className="text-xs text-rose-600 mt-1">{fieldErrors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              >
                <option value="USER">Normal User</option>
                <option value="ADMIN">System Administrator</option>
                <option value="STORE_OWNER">Store Owner</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-500">
            Rules: Name must be 20-60 characters. Password must have 1 uppercase letter and 1 special character.
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !isValid}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Sub-component: Add Store Modal (Admin)
const AddStoreModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    ownerId: '',
  });

  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch available store owners for dropdown
  useEffect(() => {
    if (isOpen) {
      api.get('/admin/users', { params: { role: 'STORE_OWNER' } }).then((res) => {
        if (res.data.success) {
          setOwners(res.data.users);
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/admin/stores', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        ownerId: formData.ownerId ? parseInt(formData.ownerId, 10) : null,
      });

      if (res.data.success) {
        onSuccess();
        onClose();
        setFormData({ name: '', email: '', address: '', ownerId: '' });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add store.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-900 text-lg">Add New Store</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
          {error && (
            <div className="flex items-start gap-2 p-3 text-xs text-rose-700 bg-rose-50 rounded-xl border border-rose-200">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Store Name
            </label>
            <input
              type="text"
              required
              maxLength={60}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              placeholder="e.g. Apex Electronics Emporium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Store Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              placeholder="store@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Store Address (Max 400 chars)
            </label>
            <textarea
              required
              rows={2}
              maxLength={400}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none"
              placeholder="Full location address..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Assign Store Owner (Optional)
            </label>
            <select
              value={formData.ownerId}
              onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            >
              <option value="">-- No Owner Assigned Yet --</option>
              {owners.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.name} ({owner.email})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-50"
            >
              {loading ? 'Adding Store...' : 'Add Store'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
