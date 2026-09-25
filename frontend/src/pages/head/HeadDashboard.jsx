import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import {
  Building2,
  UserCheck,
  GraduationCap,
  Check,
  X,
  FileText
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import StudentProgressModal from '../../components/StudentProgressModal';
import { useAuth } from '../../context/AuthContext';
import { toast } from '../../components/Toast';
import PageBackground from '../../components/PageBackground';

export default function HeadDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState('requests');
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reqsRes, supsRes, studentsRes] = await Promise.all([
        api.get('/universities/head/join-requests'),
        api.get('/universities/supervisors'),
        api.get('/universities/students'),
      ]);
      setRequests(reqsRes.data.requests || []);
      setSupervisors(supsRes.data.supervisors || []);
      setStudents(studentsRes.data.students || []);
    } catch (err) {
      console.error('Failed to load university head data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReviewRequest = async (id, status) => {
    try {
      setActionLoading((prev) => ({ ...prev, [id]: true }));
      await api.patch(`/universities/head/join-requests/${id}`, { status });
      toast.success(`Supervisor request marked as ${status}`);
      await fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update join request');
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const pendingRequests = requests.filter((r) => r.status === 'pending');

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      <PageBackground variant="head" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7 animate-applePageEnter">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/5 dark:border-white/10 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">
              {user?.universityId?.name || 'Faculty Administration Portal'}
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-xs sm:text-sm mt-1">
              Faculty of Technology • Dean: {user?.name} ({user?.position || 'Dean'}) • {user?.email}
            </p>
          </div>
        </div>

        {/* Structured Metric Summary Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-secondary glass-hover p-5 rounded-2xl">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 block">Pending Staff Join Requests</span>
            <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-50 mt-1.5 tabular-nums">{pendingRequests.length}</div>
            <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              Awaiting authorization
            </span>
          </div>

          <div className="glass-secondary glass-hover p-5 rounded-2xl">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 block">Authorized Supervisors</span>
            <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-50 mt-1.5 tabular-nums">{supervisors.length}</div>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium mt-1 inline-block">Active academic staff</span>
          </div>

          <div className="glass-secondary glass-hover p-5 rounded-2xl">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 block">Enrolled Undergraduates</span>
            <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-50 mt-1.5 tabular-nums">{students.length}</div>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium mt-1 inline-block">Faculty internship cohort</span>
          </div>
        </div>

        {/* Main Container with Reference Glassmorphism */}
        <div className="glass-form rounded-2xl shadow-glass-floating overflow-hidden">
          <div className="border-b border-black/5 dark:border-white/10 px-6 py-3.5 flex gap-2 overflow-x-auto bg-black/[0.02] dark:bg-white/[0.02]">
            <button
              onClick={() => setActiveTab('requests')}
              className={`btn-press px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 whitespace-nowrap transition-all duration-200 ${
                activeTab === 'requests'
                  ? 'glass-pill bg-white dark:bg-white/20 text-neutral-950 dark:text-white shadow-glass-sm font-semibold border-white/70 dark:border-white/20'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/5'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Supervisor Join Requests</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-black/5 dark:bg-white/10 text-neutral-700 dark:text-neutral-300 tabular-nums font-semibold">
                {pendingRequests.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('students')}
              className={`btn-press px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 whitespace-nowrap transition-all duration-200 ${
                activeTab === 'students'
                  ? 'glass-pill bg-white dark:bg-white/20 text-neutral-950 dark:text-white shadow-glass-sm font-semibold border-white/70 dark:border-white/20'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/5'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Enrolled Students & Logs</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-black/5 dark:bg-white/10 text-neutral-700 dark:text-neutral-300 tabular-nums font-semibold">
                {students.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('supervisors')}
              className={`btn-press px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 whitespace-nowrap transition-all duration-200 ${
                activeTab === 'supervisors'
                  ? 'glass-pill bg-white dark:bg-white/20 text-neutral-950 dark:text-white shadow-glass-sm font-semibold border-white/70 dark:border-white/20'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/5'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Faculty Staff Directory</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-black/5 dark:bg-white/10 text-neutral-700 dark:text-neutral-300 tabular-nums font-semibold">
                {supervisors.length}
              </span>
            </button>
          </div>

        {/* Tab 1: Requests */}
        {activeTab === 'requests' && (
          <div className="p-6">
            {requests.length === 0 ? (
              <div className="py-14 text-center text-neutral-500 dark:text-neutral-400">
                <div className="w-12 h-12 rounded-2xl glass-secondary flex items-center justify-center mx-auto mb-3 text-neutral-400">
                  <UserCheck className="w-6 h-6" />
                </div>
                <p className="font-semibold text-neutral-800 dark:text-neutral-200 text-sm">No Pending Staff Requests</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Faculty staff join requests will appear here for verification.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-black/5 dark:border-white/10">
                <table className="w-full text-left text-xs">
                  <thead className="text-[11px] font-semibold uppercase tracking-wider bg-black/[0.02] dark:bg-white/[0.02] text-neutral-500 dark:text-neutral-400 border-b border-black/5 dark:border-white/10">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">Supervisor Name</th>
                      <th className="py-3.5 px-4 font-semibold">Staff Registration No</th>
                      <th className="py-3.5 px-4 font-semibold">Faculty Position</th>
                      <th className="py-3.5 px-4 font-semibold">Contact Details</th>
                      <th className="py-3.5 px-4 font-semibold">Status</th>
                      <th className="py-3.5 px-4 text-right font-semibold">Action Decision</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 dark:divide-white/5">
                    {requests.map((req) => (
                      <tr key={req._id} className="hover:bg-white/50 dark:hover:bg-white/[0.03] transition-colors">
                        <td className="py-4 px-4 font-semibold text-neutral-900 dark:text-neutral-100">
                          {req.supervisorId?.name || 'Staff Member'}
                        </td>
                        <td className="py-4 px-4 font-mono font-medium text-neutral-700 dark:text-neutral-300">
                          <span className="glass-pill px-2 py-0.5 text-[11px]">
                            {req.staffRegNo}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-neutral-600 dark:text-neutral-300 font-medium">
                          {req.position || req.supervisorId?.position || 'Lecturer'}
                        </td>
                        <td className="py-4 px-4 text-neutral-600 dark:text-neutral-300">
                          <div className="font-medium text-neutral-900 dark:text-white">{req.supervisorId?.email}</div>
                          {req.supervisorId?.personalEmail && (
                            <div className="text-[11px] text-neutral-500 dark:text-neutral-400">{req.supervisorId?.personalEmail}</div>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <StatusBadge status={req.status} size="sm" />
                        </td>
                        <td className="py-4 px-4 text-right space-x-2">
                          {req.status === 'pending' ? (
                            <>
                              <button
                                onClick={() => handleReviewRequest(req._id, 'approved')}
                                disabled={actionLoading[req._id]}
                                className="btn-liquid-primary inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-xl shadow-glass-sm"
                              >
                                <Check className="w-3.5 h-3.5" /> Authorize
                              </button>
                              <button
                                onClick={() => handleReviewRequest(req._id, 'rejected')}
                                disabled={actionLoading[req._id]}
                                className="glass-hover inline-flex items-center gap-1.5 text-xs font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/30 px-3.5 py-1.5 rounded-xl transition"
                              >
                                <X className="w-3.5 h-3.5" /> Decline
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-neutral-400 dark:text-neutral-500">Processed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Enrolled Students */}
        {activeTab === 'students' && (
          <div className="p-6">
            {students.length === 0 ? (
              <div className="py-14 text-center text-neutral-500 dark:text-neutral-400">
                <div className="w-12 h-12 rounded-2xl glass-secondary flex items-center justify-center mx-auto mb-3 text-neutral-400">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <p className="font-semibold text-neutral-800 dark:text-neutral-200 text-sm">No Students Enrolled Yet</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Students enrolled under your faculty will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-black/5 dark:border-white/10">
                <table className="w-full text-left text-xs">
                  <thead className="text-[11px] font-semibold uppercase tracking-wider bg-black/[0.02] dark:bg-white/[0.02] text-neutral-500 dark:text-neutral-400 border-b border-black/5 dark:border-white/10">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">Student</th>
                      <th className="py-3.5 px-4 font-semibold">Reg No</th>
                      <th className="py-3.5 px-4 font-semibold">Degree & Discipline</th>
                      <th className="py-3.5 px-4 font-semibold">Target Field</th>
                      <th className="py-3.5 px-4 font-semibold">City / GPA</th>
                      <th className="py-3.5 px-4 text-right font-semibold">Daily Progress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 dark:divide-white/5">
                    {students.map((st) => (
                      <tr key={st._id} className="hover:bg-white/50 dark:hover:bg-white/[0.03] transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-semibold text-neutral-900 dark:text-white">{st.name}</div>
                          <div className="text-[11px] text-neutral-500 dark:text-neutral-400">{st.email}</div>
                        </td>
                        <td className="py-4 px-4 font-mono font-medium text-neutral-700 dark:text-neutral-300 tabular-nums">
                          <span className="glass-pill px-2 py-0.5 text-[11px]">
                            {st.profile?.studentRegNo || 'N/A'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-medium text-neutral-800 dark:text-neutral-200">{st.profile?.degreeProgram || 'BICT'}</div>
                          <span className="glass-pill inline-block mt-1 text-[10px] font-semibold text-neutral-600 dark:text-neutral-300 px-2 py-0.5">
                            {st.profile?.mainCategory || 'IT'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-neutral-600 dark:text-neutral-300 font-medium">
                          {st.profile?.desiredField || 'General'}
                        </td>
                        <td className="py-4 px-4 text-neutral-600 dark:text-neutral-300">
                          <div>{st.livingCity || st.profile?.livingCity || '—'}</div>
                          {st.profile?.gpa && <div className="text-neutral-800 dark:text-neutral-200 font-semibold tabular-nums text-[11px] mt-0.5">GPA: {st.profile.gpa}</div>}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => setSelectedStudentId(st._id)}
                            className="btn-liquid inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-xl shadow-glass-sm"
                          >
                            <FileText className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" /> Inspect Log
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

        {/* Tab 3: Supervisors */}
        {activeTab === 'supervisors' && (
          <div className="p-6">
            <div className="overflow-x-auto rounded-2xl border border-black/5 dark:border-white/10">
              <table className="w-full text-left text-xs">
                <thead className="text-[11px] font-semibold uppercase tracking-wider bg-black/[0.02] dark:bg-white/[0.02] text-neutral-500 dark:text-neutral-400 border-b border-black/5 dark:border-white/10">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">Staff Member</th>
                    <th className="py-3.5 px-4 font-semibold">Staff Reg No</th>
                    <th className="py-3.5 px-4 font-semibold">Position</th>
                    <th className="py-3.5 px-4 font-semibold">Official Email</th>
                    <th className="py-3.5 px-4 font-semibold">Contact</th>
                    <th className="py-3.5 px-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                  {supervisors.map((sup) => (
                    <tr key={sup._id} className="hover:bg-white/50 dark:hover:bg-white/[0.03] transition-colors">
                      <td className="py-4 px-4 font-semibold text-neutral-900 dark:text-white">{sup.name}</td>
                      <td className="py-4 px-4 font-mono font-medium text-neutral-700 dark:text-neutral-300">
                        <span className="glass-pill px-2 py-0.5 text-[11px]">
                          {sup.staffRegNo || 'STAFF-ID'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-neutral-600 dark:text-neutral-300">{sup.position || 'Academic Staff'}</td>
                      <td className="py-4 px-4 text-neutral-600 dark:text-neutral-300">{sup.email}</td>
                      <td className="py-4 px-4 text-neutral-600 dark:text-neutral-300">{sup.phone || 'N/A'}</td>
                      <td className="py-4 px-4">
                        <StatusBadge status={sup.status} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Progress Log Inspector Modal */}
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