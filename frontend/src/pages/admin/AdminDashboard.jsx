import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { ShieldCheck, Building2, Briefcase, Users, Check, X, Search, FileCheck, Trash2 } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import { toast } from '../../components/Toast';
import PageBackground from '../../components/PageBackground';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [pendingUnis, setPendingUnis] = useState([]);
  const [pendingEmployers, setPendingEmployers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('universities');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState({});

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, unisRes, employersRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/universities/pending'),
        api.get('/admin/employers/pending'),
        api.get('/admin/users'),
      ]);
      setStats(statsRes.data.stats);
      setPendingUnis(unisRes.data.universities || []);
      setPendingEmployers(employersRes.data.employers || []);
      setAllUsers(usersRes.data.users || []);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReviewUniversity = async (id, status) => {
    try {
      setActionLoading((prev) => ({ ...prev, [id]: true }));
      await api.patch(`/admin/universities/${id}/status`, { status });
      toast.success(`University authorization status set to ${status}`);
      await fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating university status');
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleReviewEmployer = async (id, status) => {
    try {
      setActionLoading((prev) => ({ ...prev, [id]: true }));
      await api.patch(`/admin/employers/${id}/status`, { status });
      toast.success(`Employer authorization status set to ${status}`);
      await fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating employer status');
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleRemoveUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove user "${name}" from the system?`)) return;
    try {
      setActionLoading((prev) => ({ ...prev, [id]: true }));
      await api.delete(`/admin/users/${id}`);
      toast.success(`User "${name}" removed from the system`);
      await fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove user');
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const filteredUsers = allUsers.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q) ||
      u.companyName?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      <PageBackground variant="admin" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7 animate-applePageEnter">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/5 dark:border-white/10 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">
              System Administration
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-xs sm:text-sm mt-1">
              Institutional oversight, university and corporate authorizations, and platform user registry.
            </p>
          </div>
        </div>

        {/* Structured Metric Summary Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-secondary glass-hover p-5 rounded-2xl">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 block">Pending Universities</span>
            <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-50 mt-1.5 tabular-nums">{stats?.pendingUniversities ?? 0}</div>
            <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              Awaiting authorization
            </span>
          </div>

          <div className="glass-secondary glass-hover p-5 rounded-2xl">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 block">Pending Employers</span>
            <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-50 mt-1.5 tabular-nums">{stats?.pendingEmployers ?? 0}</div>
            <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              Awaiting verification
            </span>
          </div>

          <div className="glass-secondary glass-hover p-5 rounded-2xl">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 block">Active Undergraduates</span>
            <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-50 mt-1.5 tabular-nums">{stats?.totalStudents ?? 0}</div>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium mt-1 inline-block">Enrolled candidates</span>
          </div>

          <div className="glass-secondary glass-hover p-5 rounded-2xl">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 block">Published Internships</span>
            <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-50 mt-1.5 tabular-nums">{stats?.totalJobs ?? 0}</div>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium mt-1 inline-block">Active industry vacancies</span>
          </div>
        </div>

        {/* Main Tabs & Table Surface with Reference Glassmorphism */}
        <div className="glass-form rounded-2xl shadow-glass-floating overflow-hidden">
          <div className="border-b border-black/5 dark:border-white/10 px-6 py-3.5 flex gap-2 overflow-x-auto bg-black/[0.02] dark:bg-white/[0.02]">
            <button
              onClick={() => setActiveTab('universities')}
              className={`btn-press px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 whitespace-nowrap transition-all duration-200 ${
                activeTab === 'universities'
                  ? 'glass-pill bg-white dark:bg-white/20 text-neutral-950 dark:text-white shadow-glass-sm font-semibold border-white/70 dark:border-white/20'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/5'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>University Approvals</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-black/5 dark:bg-white/10 text-neutral-700 dark:text-neutral-300 tabular-nums font-semibold">
                {pendingUnis.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('employers')}
              className={`btn-press px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 whitespace-nowrap transition-all duration-200 ${
                activeTab === 'employers'
                  ? 'glass-pill bg-white dark:bg-white/20 text-neutral-950 dark:text-white shadow-glass-sm font-semibold border-white/70 dark:border-white/20'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/5'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Employer Approvals</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-black/5 dark:bg-white/10 text-neutral-700 dark:text-neutral-300 tabular-nums font-semibold">
                {pendingEmployers.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`btn-press px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 whitespace-nowrap transition-all duration-200 ${
                activeTab === 'users'
                  ? 'glass-pill bg-white dark:bg-white/20 text-neutral-950 dark:text-white shadow-glass-sm font-semibold border-white/70 dark:border-white/20'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/5'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>User Profiles Directory</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-black/5 dark:bg-white/10 text-neutral-700 dark:text-neutral-300 tabular-nums font-semibold">
                {allUsers.length}
              </span>
            </button>
          </div>

        {/* Tab 1: Universities */}
        {activeTab === 'universities' && (
          <div className="p-6">
            {pendingUnis.length === 0 ? (
              <div className="py-14 text-center text-neutral-500 dark:text-neutral-400">
                <div className="w-12 h-12 rounded-2xl glass-secondary flex items-center justify-center mx-auto mb-3 text-neutral-400">
                  <Building2 className="w-6 h-6" />
                </div>
                <p className="font-semibold text-neutral-800 dark:text-neutral-200 text-sm">No Pending University Registrations</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">All university onboarding submissions have been reviewed.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-black/5 dark:border-white/10">
                <table className="w-full text-left text-xs">
                  <thead className="text-[11px] font-semibold uppercase tracking-wider bg-black/[0.02] dark:bg-white/[0.02] text-neutral-500 dark:text-neutral-400 border-b border-black/5 dark:border-white/10">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">University Name</th>
                      <th className="py-3.5 px-4 font-semibold">Code / Campus</th>
                      <th className="py-3.5 px-4 font-semibold">Dean / Applier Contact</th>
                      <th className="py-3.5 px-4 font-semibold">Submitted Date</th>
                      <th className="py-3.5 px-4 text-right font-semibold">Action Decision</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 dark:divide-white/5">
                    {pendingUnis.map((uni) => (
                      <tr key={uni._id} className="hover:bg-white/50 dark:hover:bg-white/[0.03] transition-colors">
                        <td className="py-4 px-4 font-semibold text-neutral-900 dark:text-neutral-100">{uni.name}</td>
                        <td className="py-4 px-4 text-neutral-600 dark:text-neutral-300">
                          <span className="glass-pill px-2 py-0.5 text-[11px] font-mono font-medium mr-1.5">
                            {uni.code || 'N/A'}
                          </span>
                          {uni.location}
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-medium text-neutral-900 dark:text-white">{uni.headUserId?.name || 'Assigned Dean'}</div>
                          <div className="text-[11px] text-neutral-500 dark:text-neutral-400">{uni.headUserId?.email} • {uni.headUserId?.phone || 'No phone'}</div>
                        </td>
                        <td className="py-4 px-4 text-neutral-500 dark:text-neutral-400 tabular-nums">
                          {new Date(uni.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4 text-right space-x-2">
                          <button
                            onClick={() => handleReviewUniversity(uni._id, 'approved')}
                            disabled={actionLoading[uni._id]}
                            className="btn-liquid-primary inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-xl shadow-glass-sm"
                          >
                            <Check className="w-3.5 h-3.5" /> Authorize
                          </button>
                          <button
                            onClick={() => handleReviewUniversity(uni._id, 'rejected')}
                            disabled={actionLoading[uni._id]}
                            className="glass-hover inline-flex items-center gap-1.5 text-xs font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/30 px-3.5 py-1.5 rounded-xl transition"
                          >
                            <X className="w-3.5 h-3.5" /> Decline
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Employers */}
        {activeTab === 'employers' && (
          <div className="p-6">
            {pendingEmployers.length === 0 ? (
              <div className="py-14 text-center text-neutral-500 dark:text-neutral-400">
                <div className="w-12 h-12 rounded-2xl glass-secondary flex items-center justify-center mx-auto mb-3 text-neutral-400">
                  <Briefcase className="w-6 h-6" />
                </div>
                <p className="font-semibold text-neutral-800 dark:text-neutral-200 text-sm">No Pending Employer Registrations</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">All corporate recruiter submissions are up to date.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-black/5 dark:border-white/10">
                <table className="w-full text-left text-xs">
                  <thead className="text-[11px] font-semibold uppercase tracking-wider bg-black/[0.02] dark:bg-white/[0.02] text-neutral-500 dark:text-neutral-400 border-b border-black/5 dark:border-white/10">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">Company Name</th>
                      <th className="py-3.5 px-4 font-semibold">Industry Sector</th>
                      <th className="py-3.5 px-4 font-semibold">Representative</th>
                      <th className="py-3.5 px-4 font-semibold">Registration Date</th>
                      <th className="py-3.5 px-4 text-right font-semibold">Verification Decision</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 dark:divide-white/5">
                    {pendingEmployers.map((emp) => (
                      <tr key={emp._id} className="hover:bg-white/50 dark:hover:bg-white/[0.03] transition-colors">
                        <td className="py-4 px-4 font-semibold text-neutral-900 dark:text-neutral-100">{emp.companyName || emp.name}</td>
                        <td className="py-4 px-4">
                          <span className="glass-pill px-2.5 py-0.5 text-[11px] font-medium text-neutral-800 dark:text-neutral-200">
                            {emp.companyCategory || 'General IT'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-medium text-neutral-900 dark:text-white">{emp.name}</div>
                          <div className="text-[11px] text-neutral-500 dark:text-neutral-400">{emp.email} • {emp.phone || 'No phone'}</div>
                        </td>
                        <td className="py-4 px-4 text-neutral-500 dark:text-neutral-400 tabular-nums">
                          {new Date(emp.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4 text-right space-x-2">
                          <button
                            onClick={() => handleReviewEmployer(emp._id, 'approved')}
                            disabled={actionLoading[emp._id]}
                            className="btn-liquid-primary inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-xl shadow-glass-sm"
                          >
                            <Check className="w-3.5 h-3.5" /> Verify
                          </button>
                          <button
                            onClick={() => handleReviewEmployer(emp._id, 'rejected')}
                            disabled={actionLoading[emp._id]}
                            className="glass-hover inline-flex items-center gap-1.5 text-xs font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/30 px-3.5 py-1.5 rounded-xl transition"
                          >
                            <X className="w-3.5 h-3.5" /> Decline
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: All Profiles */}
        {activeTab === 'users' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 glass-input px-3.5 py-2.5 max-w-sm rounded-xl">
              <Search className="w-4 h-4 text-neutral-400 shrink-0" />
              <input
                type="text"
                placeholder="Search by name, email, or role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent text-xs w-full outline-none text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
              />
            </div>

            <div className="overflow-x-auto rounded-2xl border border-black/5 dark:border-white/10">
              <table className="w-full text-left text-xs">
                <thead className="text-[11px] font-semibold uppercase tracking-wider bg-black/[0.02] dark:bg-white/[0.02] text-neutral-500 dark:text-neutral-400 border-b border-black/5 dark:border-white/10">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">User</th>
                    <th className="py-3.5 px-4 font-semibold">Role</th>
                    <th className="py-3.5 px-4 font-semibold">Affiliation / Entity</th>
                    <th className="py-3.5 px-4 font-semibold">Status</th>
                    <th className="py-3.5 px-4 font-semibold">Joined</th>
                    <th className="py-3.5 px-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                  {filteredUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-white/50 dark:hover:bg-white/[0.03] transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-semibold text-neutral-900 dark:text-white">{u.name}</div>
                        <div className="text-[11px] text-neutral-500 dark:text-neutral-400">{u.email}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="glass-pill text-[10px] font-semibold capitalize text-neutral-800 dark:text-neutral-200 px-2.5 py-0.5">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-neutral-700 dark:text-neutral-300 text-xs font-medium">
                        {u.universityId?.name || u.companyName || '—'}
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={u.status} size="sm" />
                      </td>
                      <td className="py-4 px-4 text-neutral-500 dark:text-neutral-400 tabular-nums">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 text-right">
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleRemoveUser(u._id, u.name)}
                            disabled={actionLoading[u._id]}
                            className="glass-hover inline-flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 px-3 py-1 rounded-xl border border-transparent hover:border-rose-500/30 transition"
                            title="Remove user"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
  );
}

