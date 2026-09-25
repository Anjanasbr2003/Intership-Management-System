import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  UserCheck,
  GraduationCap,
  Clock,
  FileText,
  AlertCircle,
  Send,
  CheckCircle2,
  Building2,
  User,
  ShieldCheck,
  Search
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import StudentProgressModal from '../../components/StudentProgressModal';
import { toast } from '../../components/Toast';
import PageBackground from '../../components/PageBackground';

export default function SupervisorDashboard() {
  const { user, refreshUser } = useAuth();
  const [headInfo, setHeadInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Join Request Form State
  const [staffRegNo, setStaffRegNo] = useState(user?.staffRegNo || '');
  const [position, setPosition] = useState(user?.position || 'Senior Lecturer');
  const [sendingRequest, setSendingRequest] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [headRes, reqsRes] = await Promise.all([
        api.get('/supervisors/head-info'),
        api.get('/supervisors/my-requests'),
      ]);
      setHeadInfo(headRes.data);
      setMyRequests(reqsRes.data.requests || []);

      if (user?.status === 'approved' && user?.universityId) {
        const studentsRes = await api.get('/universities/students');
        setStudents(studentsRes.data.students || []);
      }
    } catch (e) {
      console.error('Failed to load supervisor data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.status]);

  const handleSendRequestToHead = async (e) => {
    e.preventDefault();
    setMsg('');
    setErr('');
    setSendingRequest(true);
    try {
      await api.post('/supervisors/join-request', {
        staffRegNo,
        position,
      });
      const successTxt = 'Request submitted directly to your University Head. Awaiting authorization.';
      setMsg(successTxt);
      toast.success(successTxt);
      await refreshUser();
      await fetchData();
    } catch (error) {
      const errTxt = error.response?.data?.message || 'Failed to submit request';
      setErr(errTxt);
      toast.error(errTxt);
    } finally {
      setSendingRequest(false);
    }
  };

  const isApproved = user?.status === 'approved';

  const filteredStudents = students.filter((st) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const name = (st.name || '').toLowerCase();
    const reg = (st.profile?.studentRegNo || '').toLowerCase();
    const field = (st.profile?.desiredField || '').toLowerCase();
    return name.includes(term) || reg.includes(term) || field.includes(term);
  });

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      <PageBackground variant="supervisor" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7 animate-applePageEnter">
        {/* Header Banner */}
        <div className="glass-primary rounded-2xl p-7 sm:p-8 shadow-glass-floating flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">{user?.name}</h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-300 font-medium">
              {user?.position || 'Academic Staff'} &bull; {headInfo?.university?.name || 'Assigned University'}
            </p>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
              <span>Staff ID: <span className="font-mono text-neutral-700 dark:text-neutral-200 tabular-nums">{user?.staffRegNo || 'Pending'}</span></span>
              <span>&bull;</span>
              <span>Email: <span className="text-neutral-700 dark:text-neutral-200">{user?.email}</span></span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="glass-secondary p-4 rounded-2xl text-center min-w-[140px]">
              <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 block mb-1">Supervisory Status</span>
              <StatusBadge status={user?.status} />
            </div>
            {isApproved && (
              <div className="glass-secondary p-4 rounded-2xl text-center min-w-[120px]">
                <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 block mb-0.5">Assigned Interns</span>
                <span className="text-2xl font-bold text-neutral-900 dark:text-white tabular-nums">{students.length}</span>
              </div>
            )}
          </div>
        </div>

        {/* University Head Direct Contact & Request Card with Reference Glassmorphism */}
        <div className="glass-form p-6 rounded-2xl shadow-glass-floating space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white tracking-tight">
                Designated Faculty Head Contact
              </h2>
            </div>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 hidden sm:inline">
              Official institutional authority for intern supervision
            </span>
          </div>

          {headInfo?.head ? (
            <div className="glass-card p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white">{headInfo.head.name}</h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 font-medium">{headInfo.head.position || 'Dean / Head of Department'}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">{headInfo.head.email} {headInfo.head.phone && `\u2022 ${headInfo.head.phone}`}</p>
                </div>
              </div>

              <div>
                {isApproved ? (
                  <span className="inline-flex items-center gap-1.5 glass-pill bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-semibold px-3 py-1.5 border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Authorized to Supervise
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 glass-pill bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs font-semibold px-3 py-1.5 border-amber-500/20">
                    <Clock className="w-3.5 h-3.5 text-amber-500" /> Authorization Pending
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="p-3.5 glass-card bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs rounded-xl border border-amber-500/20">
              No University Head is currently registered for this university.
            </div>
          )}

          {/* If supervisor is not yet approved, display the direct request form */}
          {!isApproved && headInfo?.head && (
            <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/10">
              <form onSubmit={handleSendRequestToHead} className="space-y-4 max-w-xl">
                <div>
                  <h3 className="text-xs font-bold text-neutral-900 dark:text-white">
                    Request Supervisory Access from {headInfo.head.name}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Submit your staff credentials to allow your faculty head to verify and grant access to undergraduate progress logs.
                  </p>
                </div>

                {err && (
                  <div className="p-3 glass-card bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/30 rounded-xl text-xs font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{err}</span>
                  </div>
                )}
                {msg && (
                  <div className="p-3 glass-card bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                    <span>{msg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Academic Staff Reg No *</label>
                    <input
                      type="text"
                      required
                      value={staffRegNo}
                      onChange={(e) => setStaffRegNo(e.target.value)}
                      placeholder="STAFF/RUH/FOT/042"
                      className="glass-input w-full text-xs h-10 px-3.5 rounded-xl text-neutral-900 dark:text-white placeholder:text-neutral-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Position / Designation *</label>
                    <input
                      type="text"
                      required
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      placeholder="Senior Lecturer"
                      className="glass-input w-full text-xs h-10 px-3.5 rounded-xl text-neutral-900 dark:text-white placeholder:text-neutral-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={sendingRequest}
                  className="btn-liquid-primary inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl shadow-glass-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{sendingRequest ? 'Submitting Request...' : 'Submit Request to University Head'}</span>
                </button>
              </form>
            </div>
          )}
        </div>

      {/* Student Roster (Strictly scoped to own university) */}
      {isApproved && (
        <div className="glass-form rounded-2xl shadow-glass-floating overflow-hidden">
          <div className="p-6 border-b border-black/5 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-black/[0.02] dark:bg-white/[0.02]">
            <div>
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2 tracking-tight">
                <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Undergraduate Interns Under Supervision
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Enrolled students from {headInfo?.university?.name || 'your university'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Filter by name, reg no, field..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="glass-input w-full pl-9 pr-3.5 h-9 text-xs rounded-xl text-neutral-900 dark:text-white placeholder:text-neutral-400"
                />
              </div>
              <span className="glass-pill text-xs font-semibold text-neutral-700 dark:text-neutral-300 px-3 py-1.5 rounded-full tabular-nums shrink-0">
                {filteredStudents.length} Students
              </span>
            </div>
          </div>

          <div className="p-6">
            {filteredStudents.length === 0 ? (
              <div className="py-14 text-center text-neutral-500 dark:text-neutral-400">
                <div className="w-12 h-12 rounded-2xl glass-secondary flex items-center justify-center mx-auto mb-3 text-neutral-400">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">No Students Found</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  {searchTerm ? 'Try adjusting your search criteria.' : 'Enrolled students from your university will appear here.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-black/5 dark:border-white/10">
                <table className="w-full text-left text-xs">
                  <thead className="text-[11px] font-semibold uppercase tracking-wider bg-black/[0.02] dark:bg-white/[0.02] text-neutral-500 dark:text-neutral-400 border-b border-black/5 dark:border-white/10">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">Student</th>
                      <th className="py-3.5 px-4 font-semibold">Reg No</th>
                      <th className="py-3.5 px-4 font-semibold">Degree & Category</th>
                      <th className="py-3.5 px-4 font-semibold">Target Field</th>
                      <th className="py-3.5 px-4 font-semibold">City</th>
                      <th className="py-3.5 px-4 text-right font-semibold">Progress Diary</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 dark:divide-white/5">
                    {filteredStudents.map((st) => (
                      <tr key={st._id} className="hover:bg-white/50 dark:hover:bg-white/[0.03] transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-semibold text-neutral-900 dark:text-white">{st.name}</div>
                          <div className="text-[11px] text-neutral-500 dark:text-neutral-400">{st.email}</div>
                        </td>
                        <td className="py-4 px-4 font-mono text-xs text-neutral-700 dark:text-neutral-300 tabular-nums">
                          <span className="glass-pill px-2 py-0.5 text-[11px]">
                            {st.profile?.studentRegNo || 'Pending'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-xs font-medium text-neutral-800 dark:text-neutral-200">{st.profile?.degreeProgram || 'BICT'}</div>
                          <span className="glass-pill inline-block mt-1 text-[10px] font-semibold text-neutral-600 dark:text-neutral-300 px-2 py-0.5">
                            {st.profile?.mainCategory || 'IT'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-xs font-medium text-neutral-700 dark:text-neutral-300">
                          {st.profile?.desiredField || 'General'}
                        </td>
                        <td className="py-4 px-4 text-xs text-neutral-600 dark:text-neutral-400">
                          {st.livingCity || st.profile?.livingCity || '—'}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => setSelectedStudentId(st._id)}
                            className="btn-liquid inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-xl shadow-glass-sm"
                          >
                            <FileText className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                            <span>Inspect Progress Log</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Progress Inspector Modal */}
      {selectedStudentId && (
        <StudentProgressModal
          studentId={selectedStudentId}
          onClose={() => setSelectedStudentId(null)}
        />
      )}
    </div>
  </div>
  );
}