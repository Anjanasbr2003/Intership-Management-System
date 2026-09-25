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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
              System Administration
            </h1>
            <p className="text-text-muted text-xs sm:text-sm mt-1">
              Institutional oversight, university and corporate authorizations, and platform user registry.
            </p>
          </div>
        </div>

        {/* Structured Metric Summary Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card hover-card-effect p-5 rounded-2xl">
            <span className="text-xs font-medium text-text-muted block">Pending Universities</span>
            <div className="text-3xl font-bold text-text-primary mt-1.5 tabular-nums">{stats?.pendingUniversities ?? 0}</div>
            <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse"></span>
              Awaiting authorization
            </span>
          </div>

          <div className="card hover-card-effect p-5 rounded-2xl">
            <span className="text-xs font-medium text-text-muted block">Pending Employers</span>
            <div className="text-3xl font-bold text-text-primary mt-1.5 tabular-nums">{stats?.pendingEmployers ?? 0}</div>
            <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse"></span>
              Awaiting verification
            </span>
          </div>

          <div className="card hover-card-effect p-5 rounded-2xl">
            <span className="text-xs font-medium text-text-muted block">Active Undergraduates</span>
            <div className="text-3xl font-bold text-text-primary mt-1.5 tabular-nums">{stats?.totalStudents ?? 0}</div>
            <span className="text-[11px] text-text-muted font-medium mt-1 inline-block">Enrolled candidates</span>
          </div>

          <div className="card hover-card-effect p-5 rounded-2xl">
            <span className="text-xs font-medium text-text-muted block">Published Internships</span>
            <div className="text-3xl font-bold text-text-primary mt-1.5 tabular-nums">{stats?.totalJobs ?? 0}</div>
            <span className="text-[11px] text-text-muted font-medium mt-1 inline-block">Active industry vacancies</span>
          </div>
        </div>

        {/* Main Tabs & Table Surface with Reference Glassmorphism */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Navigation Sidebar */}
          <div className="lg:w-64 shrink-0 flex flex-col gap-4">
            <div className="flex flex-row lg:flex-col gap-1 overflow-x-auto card-elevated p-3 rounded-2xl shadow-card-elevated shadow-lg h-fit">
              <button
                onClick={() => setActiveTab('universities')}
                className={`transition-transform active:scale-95 px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-between gap-3 whitespace-nowrap lg:w-full transition-all duration-200 ${
                  activeTab === 'universities'
                    ? 'sidebar-nav-item active'
                    : 'sidebar-nav-item'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Building2 className="w-4 h-4 shrink-0" />
                  <span className="truncate">University Approvals</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-surface-hover text-text-secondary tabular-nums font-semibold shrink-0">
                  {pendingUnis.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('employers')}
                className={`transition-transform active:scale-95 px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-between gap-3 whitespace-nowrap lg:w-full transition-all duration-200 ${
                  activeTab === 'employers'
                    ? 'sidebar-nav-item active'
                    : 'sidebar-nav-item'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Briefcase className="w-4 h-4 shrink-0" />
                  <span className="truncate">Employer Approvals</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-surface-hover text-text-secondary tabular-nums font-semibold shrink-0">
                  {pendingEmployers.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('users')}
                className={`transition-transform active:scale-95 px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-between gap-3 whitespace-nowrap lg:w-full transition-all duration-200 ${
                  activeTab === 'users'
                    ? 'sidebar-nav-item active'
                    : 'sidebar-nav-item'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Users className="w-4 h-4 shrink-0" />
                  <span className="truncate">User Profiles Directory</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-surface-hover text-text-secondary tabular-nums font-semibold shrink-0">
                  {allUsers.length}
                </span>
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 card-elevated p-6 rounded-2xl shadow-card-elevated shadow-lg overflow-hidden min-h-[500px]">
          {/* Tab 1: Universities */}
        {activeTab === 'universities' && (
          <div className="p-6">
            {pendingUnis.length === 0 ? (
              <div className="py-14 text-center text-text-muted">
                <div className="w-12 h-12 rounded-2xl card flex items-center justify-center mx-auto mb-3 text-text-disabled">
                  <Building2 className="w-6 h-6" />
                </div>
                <p className="font-semibold text-text-primary text-sm">No Pending University Registrations</p>
                <p className="text-xs text-text-muted mt-1">All university onboarding submissions have been reviewed.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-border-subtle">
                <table className="w-full text-left text-xs">
                  <thead className="text-[11px] font-semibold uppercase tracking-wider bg-black/[0.02] dark:bg-white/[0.02] text-text-muted border-b border-border-subtle">
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
                        <td className="py-4 px-4 font-semibold text-text-primary dark:text-neutral-100">{uni.name}</td>
                        <td className="py-4 px-4 text-text-secondary">
                          <span className="bg-secondary text-text-secondary border border-border-subtle rounded-full px-2 py-0.5 text-[11px] font-mono font-medium mr-1.5">
                            {uni.code || 'N/A'}
                          </span>
                          {uni.location}
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-medium text-text-primary">{uni.headUserId?.name || 'Assigned Dean'}</div>
                          <div className="text-[11px] text-text-muted">{uni.headUserId?.email} • {uni.headUserId?.phone || 'No phone'}</div>
                        </td>
                        <td className="py-4 px-4 text-text-muted tabular-nums">
                          {new Date(uni.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4 flex flex-wrap items-center justify-end gap-2">
                          <button
                            onClick={() => handleReviewUniversity(uni._id, 'approved')}
                            disabled={actionLoading[uni._id]}
                            className="btn-primary inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-xl shadow-sm"
                          >
                            <Check className="w-3.5 h-3.5" /> Authorize
                          </button>
                          <button
                            onClick={() => handleReviewUniversity(uni._id, 'rejected')}
                            disabled={actionLoading[uni._id]}
                            className="btn-danger inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-xl shadow-sm"
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
              <div className="py-14 text-center text-text-muted">
                <div className="w-12 h-12 rounded-2xl card flex items-center justify-center mx-auto mb-3 text-text-disabled">
                  <Briefcase className="w-6 h-6" />
                </div>
                <p className="font-semibold text-text-primary text-sm">No Pending Employer Registrations</p>
                <p className="text-xs text-text-muted mt-1">All corporate recruiter submissions are up to date.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-border-subtle">
                <table className="w-full text-left text-xs">
                  <thead className="text-[11px] font-semibold uppercase tracking-wider bg-black/[0.02] dark:bg-white/[0.02] text-text-muted border-b border-border-subtle">
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
                        <td className="py-4 px-4 font-semibold text-text-primary dark:text-neutral-100">{emp.companyName || emp.name}</td>
                        <td className="py-4 px-4">
                          <span className="bg-secondary text-text-secondary border border-border-subtle rounded-full px-2.5 py-0.5 text-[11px] font-medium text-text-primary">
                            {emp.companyCategory || 'General IT'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-medium text-text-primary">{emp.name}</div>
                          <div className="text-[11px] text-text-muted">{emp.email} • {emp.phone || 'No phone'}</div>
                        </td>
                        <td className="py-4 px-4 text-text-muted tabular-nums">
                          {new Date(emp.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4 flex flex-wrap items-center justify-end gap-2">
                          <button
                            onClick={() => handleReviewEmployer(emp._id, 'approved')}
                            disabled={actionLoading[emp._id]}
                            className="btn-primary inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-xl shadow-sm"
                          >
                            <Check className="w-3.5 h-3.5" /> Verify
                          </button>
                          <button
                            onClick={() => handleReviewEmployer(emp._id, 'rejected')}
                            disabled={actionLoading[emp._id]}
                            className="btn-danger inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-xl shadow-sm"
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
            <div className="flex items-center gap-2 input-field px-3.5 py-2.5 max-w-sm rounded-xl">
              <Search className="w-4 h-4 text-text-disabled shrink-0" />
              <input
                type="text"
                placeholder="Search by name, email, or role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent text-xs w-full outline-none text-text-primary placeholder:text-text-disabled dark:placeholder:text-text-muted"
              />
            </div>

            <div className="overflow-x-auto rounded-2xl border border-border-subtle">
              <table className="w-full text-left text-xs">
                <thead className="text-[11px] font-semibold uppercase tracking-wider bg-black/[0.02] dark:bg-white/[0.02] text-text-muted border-b border-border-subtle">
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
                        <div className="font-semibold text-text-primary">{u.name}</div>
                        <div className="text-[11px] text-text-muted">{u.email}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="bg-secondary text-text-secondary border border-border-subtle rounded-full text-[10px] font-semibold capitalize text-text-primary px-2.5 py-0.5">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-text-secondary text-xs font-medium">
                        {u.universityId?.name || u.companyName || '—'}
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={u.status} size="sm" />
                      </td>
                      <td className="py-4 px-4 text-text-muted tabular-nums">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 text-right">
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleRemoveUser(u._id, u.name)}
                            disabled={actionLoading[u._id]}
                            className="hover-card-effect inline-flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 px-3 py-1 rounded-xl border border-transparent hover:border-rose-500/30 transition"
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
  </div>
  );
}

