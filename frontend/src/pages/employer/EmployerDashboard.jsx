import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  Briefcase,
  Users,
  Target,
  PlusCircle,
  Check,
  X,
  FileText,
  Clock,
  ExternalLink,
  AlertCircle,
  Building2,
  Calendar,
  Search
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import StudentProgressModal from '../../components/StudentProgressModal';
import { toast } from '../../components/Toast';
import PageBackground from '../../components/PageBackground';

export default function EmployerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('applicants');
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [suggestedStudents, setSuggestedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  // Job Post Modal
  const [showJobModal, setShowJobModal] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [jobCategory, setJobCategory] = useState(user?.companyCategory || 'Software Engineering');
  const [jobType, setJobType] = useState('Full-Time Internship');
  const [jobDesc, setJobDesc] = useState('');
  const [jobAvailability, setJobAvailability] = useState('Immediate');
  const [jobLocation, setJobLocation] = useState('Colombo / Hybrid');
  const [submittingJob, setSubmittingJob] = useState(false);

  // Filter applicants by job
  const [selectedJobFilter, setSelectedJobFilter] = useState('all');
  const [reviewLoading, setReviewLoading] = useState({});

  const fetchData = async () => {
    try {
      setLoading(true);
      const [jobsRes, appsRes, matchRes] = await Promise.all([
        api.get('/jobs/employer/my-jobs'),
        api.get('/employer/applicants'),
        api.get('/employer/suggested-students'),
      ]);
      setJobs(jobsRes.data.jobs || []);
      setApplicants(appsRes.data.applicants || []);
      setSuggestedStudents(matchRes.data.students || []);
    } catch (err) {
      console.error('Failed to load employer data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Escape key closes job modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showJobModal) {
        setShowJobModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showJobModal]);

  const handlePostJob = async (e) => {
    e.preventDefault();
    setSubmittingJob(true);
    try {
      await api.post('/jobs', {
        title: jobTitle,
        category: jobCategory,
        jobType,
        description: jobDesc,
        availability: jobAvailability,
        location: jobLocation,
      });
      setShowJobModal(false);
      setJobTitle('');
      setJobDesc('');
      toast.success('Internship vacancy published successfully.');
      await fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post vacancy');
    } finally {
      setSubmittingJob(false);
    }
  };

  const handleReviewApplicant = async (appId, status) => {
    try {
      setReviewLoading((prev) => ({ ...prev, [appId]: true }));
      await api.patch(`/employer/applicants/${appId}/status`, { status });
      toast.success(`Applicant status updated to "${status}".`);
      await fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating applicant status');
    } finally {
      setReviewLoading((prev) => ({ ...prev, [appId]: false }));
    }
  };

  const isApproved = user?.status === 'approved';

  const filteredApplicants = applicants.filter((a) => {
    if (selectedJobFilter === 'all') return true;
    return a.jobId?._id === selectedJobFilter;
  });

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      <PageBackground variant="employer" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7 animate-applePageEnter">
        {/* Header Banner */}
        <div className="glass-primary rounded-2xl p-7 sm:p-8 shadow-glass-floating flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
              {user?.companyName || user?.name}
            </h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-300 font-medium">
              Industry Category: <span className="text-neutral-900 dark:text-neutral-100">{user?.companyCategory || 'Software Engineering'}</span>
            </p>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
              <span>Contact Email: <span className="text-neutral-700 dark:text-neutral-200">{user?.email}</span></span>
              {user?.phone && (
                <>
                  <span>&bull;</span>
                  <span>Phone: <span className="font-mono text-neutral-700 dark:text-neutral-200 tabular-nums">{user.phone}</span></span>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="glass-secondary p-4 rounded-2xl text-center min-w-[105px] flex flex-col justify-center">
              <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 block mb-1">Status</span>
              <div className="flex justify-center">
                <StatusBadge status={user?.status} />
              </div>
            </div>
            <div className="glass-secondary p-4 rounded-2xl text-center min-w-[105px] flex flex-col justify-center">
              <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 block mb-0.5">Live Jobs</span>
              <span className="text-2xl font-bold text-neutral-900 dark:text-white tabular-nums">{jobs.length}</span>
            </div>
            <div className="glass-secondary p-4 rounded-2xl text-center min-w-[105px] flex flex-col justify-center">
              <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 block mb-0.5">Applicants</span>
              <span className="text-2xl font-bold text-neutral-900 dark:text-white tabular-nums">{applicants.length}</span>
            </div>
          </div>
        </div>

        {/* Verification Notice if Unapproved */}
        {!isApproved && (
          <div className="glass-secondary rounded-2xl p-5 border border-amber-500/30 bg-amber-500/10 dark:bg-amber-500/[0.08] flex items-start gap-3.5 text-amber-900 dark:text-amber-300 text-xs shadow-glass-sm">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-amber-950 dark:text-amber-200 text-sm block">Employer Account Verification Pending</span>
              <p className="text-amber-800 dark:text-amber-300/90 leading-relaxed">
                Your company profile is currently being reviewed by the Interlink System Administrator. Vacancy publication and applicant decision processing will be unlocked upon official authorization.
              </p>
            </div>
          </div>
        )}

        {/* Main Container with Reference Glassmorphism */}
        <div className="glass-form rounded-2xl shadow-glass-floating overflow-hidden">
          {/* Navigation Tabs & Post Action */}
          <div className="border-b border-black/5 dark:border-white/10 px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-black/[0.02] dark:bg-white/[0.02]">
            <div className="flex gap-2 overflow-x-auto">
              <button
                onClick={() => setActiveTab('applicants')}
                className={`btn-press px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 whitespace-nowrap transition-all duration-200 ${
                  activeTab === 'applicants'
                    ? 'glass-pill bg-white dark:bg-white/20 text-neutral-950 dark:text-white shadow-glass-sm font-semibold border-white/70 dark:border-white/20'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/5'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Applicants Manager</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-black/5 dark:bg-white/10 text-neutral-700 dark:text-neutral-300 tabular-nums font-semibold">
                  {applicants.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('jobs')}
                className={`btn-press px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 whitespace-nowrap transition-all duration-200 ${
                  activeTab === 'jobs'
                    ? 'glass-pill bg-white dark:bg-white/20 text-neutral-950 dark:text-white shadow-glass-sm font-semibold border-white/70 dark:border-white/20'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/5'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Job Vacancies</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-black/5 dark:bg-white/10 text-neutral-700 dark:text-neutral-300 tabular-nums font-semibold">
                  {jobs.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('suggested')}
                className={`btn-press px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 whitespace-nowrap transition-all duration-200 ${
                  activeTab === 'suggested'
                    ? 'glass-pill bg-white dark:bg-white/20 text-neutral-950 dark:text-white shadow-glass-sm font-semibold border-white/70 dark:border-white/20'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/5'
                }`}
              >
                <Target className="w-4 h-4" />
                <span>Candidate Matches</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-black/5 dark:bg-white/10 text-neutral-700 dark:text-neutral-300 tabular-nums font-semibold">
                  {suggestedStudents.length}
                </span>
              </button>
            </div>

            {isApproved && (
              <button
                onClick={() => setShowJobModal(true)}
                className="btn-liquid-primary inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full text-white shadow-glass-sm self-start sm:self-auto"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Post New Vacancy</span>
              </button>
            )}
          </div>

          {/* Tab 1: Applicants Manager */}
          {activeTab === 'applicants' && (
            <div className="p-6 sm:p-7 space-y-5">
              {/* Vacancy Selector Filter Pills */}
              {jobs.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 block">
                    Filter by Vacancy ({jobs.length} Active):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedJobFilter('all')}
                      className={`btn-press text-xs px-3.5 py-1.5 rounded-full font-medium transition flex items-center gap-2 ${
                        selectedJobFilter === 'all'
                          ? 'btn-liquid-primary text-white shadow-glass-sm font-semibold'
                          : 'glass-secondary glass-hover text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      <span>All Candidates</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] tabular-nums font-semibold ${selectedJobFilter === 'all' ? 'bg-white/20 text-white' : 'bg-black/5 dark:bg-white/10 text-neutral-700 dark:text-neutral-300'}`}>
                        {applicants.length}
                      </span>
                    </button>
                    {jobs.map((j) => {
                      const count = applicants.filter((a) => a.jobId?._id === j._id).length;
                      const isSelected = selectedJobFilter === j._id;
                      return (
                        <button
                          key={j._id}
                          onClick={() => setSelectedJobFilter(j._id)}
                          className={`btn-press text-xs px-3.5 py-1.5 rounded-full font-medium transition flex items-center gap-2 ${
                            isSelected
                              ? 'btn-liquid-primary text-white shadow-glass-sm font-semibold'
                              : 'glass-secondary glass-hover text-neutral-700 dark:text-neutral-300'
                          }`}
                        >
                          <span>{j.title}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full tabular-nums font-semibold ${isSelected ? 'bg-white/20 text-white' : 'bg-black/5 dark:bg-white/10 text-neutral-700 dark:text-neutral-300'}`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {filteredApplicants.length === 0 ? (
                <div className="py-16 text-center text-neutral-500 dark:text-neutral-400 border border-dashed border-black/10 dark:border-white/10 rounded-2xl glass-secondary">
                  <Users className="w-10 h-10 text-neutral-400 dark:text-neutral-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">No Applicants Found</p>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">Undergraduates who apply to your vacancies will appear here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl glass-secondary shadow-glass-sm border border-black/5 dark:border-white/10">
                  <table className="w-full text-left text-xs">
                    <thead className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/5 dark:border-white/10">
                      <tr>
                        <th className="py-3.5 px-4 font-semibold">Applicant</th>
                        <th className="py-3.5 px-4 font-semibold">Applied Position</th>
                        <th className="py-3.5 px-4 font-semibold">Degree & Category</th>
                        <th className="py-3.5 px-4 font-semibold">Progress / CV</th>
                        <th className="py-3.5 px-4 font-semibold">Status</th>
                        <th className="py-3.5 px-4 text-right font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 dark:divide-white/5">
                      {filteredApplicants.map((app) => (
                        <tr key={app._id} className="hover:bg-white/40 dark:hover:bg-white/[0.03] transition-colors">
                          <td className="py-4 px-4">
                            <div className="font-semibold text-neutral-900 dark:text-white">{app.studentId?.name || 'Student'}</div>
                            <div className="text-[11px] text-neutral-500 dark:text-neutral-400">{app.studentId?.email}</div>
                            <div className="text-[11px] text-neutral-500 dark:text-neutral-400 tabular-nums">{app.studentId?.phone || 'No phone'}</div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-medium text-neutral-900 dark:text-white">{app.jobId?.title}</span>
                            <span className="block text-[11px] text-neutral-400 dark:text-neutral-500">{app.jobId?.category}</span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                              {app.studentProfile?.degreeProgram || 'BICT'}
                            </div>
                            <div className="text-[11px] text-brand-600 dark:text-brand-400 font-semibold">
                              {app.studentProfile?.mainCategory || 'Software Engineering'}
                            </div>
                          </td>
                          <td className="py-4 px-4 space-y-1.5">
                            <button
                              onClick={() => setSelectedStudentId(app.studentId?._id)}
                              className="btn-liquid inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 glass-secondary hover:bg-brand-500/10 px-3 py-1.5 rounded-full transition border border-brand-500/20"
                            >
                              <FileText className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                              <span>Inspect Daily Logs</span>
                            </button>
                            {app.studentProfile?.cvUrl && (
                              <div>
                                <a
                                  href={app.studentProfile.cvUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[11px] text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 underline inline-flex items-center gap-1 block"
                                >
                                  <span>View CV Document</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <StatusBadge status={app.status} />
                          </td>
                          <td className="py-4 px-4 text-right space-x-2">
                            {app.status === 'pending' && isApproved ? (
                              <>
                                <button
                                  onClick={() => handleReviewApplicant(app._id, 'approved')}
                                  disabled={reviewLoading[app._id]}
                                  className="btn-liquid inline-flex items-center gap-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-full shadow-glass-sm transition"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Accept</span>
                                </button>
                                <button
                                  onClick={() => handleReviewApplicant(app._id, 'rejected')}
                                  disabled={reviewLoading[app._id]}
                                  className="btn-liquid inline-flex items-center gap-1 text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 px-3.5 py-1.5 rounded-full transition"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Reject</span>
                                </button>
                              </>
                            ) : (
                              <span className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">Processed</span>
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

          {/* Tab 2: Job Postings */}
          {activeTab === 'jobs' && (
            <div className="p-6 sm:p-7">
              {jobs.length === 0 ? (
                <div className="py-16 text-center text-neutral-500 dark:text-neutral-400 border border-dashed border-black/10 dark:border-white/10 rounded-2xl glass-secondary">
                  <Briefcase className="w-10 h-10 text-neutral-400 dark:text-neutral-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">No Job Vacancies Published</p>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">Click "Post New Vacancy" above to advertise open internship roles.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {jobs.map((j) => (
                    <div key={j._id} className="glass-secondary glass-hover rounded-2xl p-6 space-y-3.5 shadow-glass-sm flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-[11px] font-semibold px-3 py-1 rounded-full glass-pill text-neutral-800 dark:text-neutral-200">
                            {j.category}
                          </span>
                          <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-300 glass-pill px-2.5 py-0.5">
                            {j.jobType}
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-neutral-900 dark:text-white">{j.title}</h4>
                        <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-3 leading-relaxed">{j.description}</p>
                      </div>

                      <div className="text-xs text-neutral-500 dark:text-neutral-400 pt-3 border-t border-black/5 dark:border-white/10 flex justify-between">
                        <span>Location: <strong className="text-neutral-800 dark:text-neutral-200 font-semibold">{j.location}</strong></span>
                        <span>Availability: <strong className="text-neutral-800 dark:text-neutral-200 font-semibold">{j.availability}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Candidate Matches */}
          {activeTab === 'suggested' && (
            <div className="p-6 sm:p-7 space-y-5">
              <div className="glass-secondary rounded-2xl p-5 flex items-center justify-between shadow-glass-sm">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    <Target className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                    <span>Candidate Specialization Matches ({user?.companyCategory || 'Software Engineering'})</span>
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Enrolled undergraduates whose academic field and stated interests align with your recruitment domain.
                  </p>
                </div>
              </div>

              {suggestedStudents.length === 0 ? (
                <div className="py-16 text-center text-neutral-500 dark:text-neutral-400 border border-dashed border-black/10 dark:border-white/10 rounded-2xl glass-secondary">
                  <Target className="w-10 h-10 text-neutral-400 dark:text-neutral-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">No Matching Students Found</p>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">Matching candidates will appear as students register with aligned specializations.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {suggestedStudents.map((st) => (
                    <div
                      key={st._id}
                      className="glass-secondary glass-hover rounded-2xl p-6 space-y-4 flex flex-col justify-between shadow-glass-sm"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-semibold glass-pill text-brand-600 dark:text-brand-400 px-3 py-1">
                            {st.mainCategory}
                          </span>
                          <span className="text-[11px] font-semibold glass-pill text-neutral-600 dark:text-neutral-300 px-2.5 py-0.5">
                            Domain Match
                          </span>
                        </div>

                        <div className="flex items-center gap-3.5">
                          {st.profilePic ? (
                            <img src={st.profilePic} alt={st.userId?.name} className="w-12 h-12 rounded-2xl object-cover ring-1 ring-white/30 dark:ring-white/10 shadow-glass-sm shrink-0" />
                          ) : (
                            <div className="w-12 h-12 rounded-2xl glass-secondary flex items-center justify-center font-bold text-brand-600 dark:text-brand-400 text-sm shrink-0 ring-1 ring-white/20">
                              {st.userId?.name?.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-neutral-900 dark:text-white leading-tight">{st.userId?.name}</h4>
                              {st.gpa && (
                                <span className="text-[10px] glass-pill text-neutral-700 dark:text-neutral-300 font-semibold px-2 py-0.5 tabular-nums">
                                  GPA {st.gpa}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{st.universityId?.name}</div>
                          </div>
                        </div>

                        {st.desiredField && (
                          <div className="text-xs font-medium text-neutral-800 dark:text-neutral-200 glass-pill px-3 py-1.5">
                            Target Field: <strong className="text-neutral-900 dark:text-white font-semibold">{st.desiredField}</strong>
                          </div>
                        )}

                        <div className="text-xs text-neutral-500 dark:text-neutral-400">
                          Location: {st.livingCity || st.userId?.livingCity || 'Not specified'} &bull; {st.workType || 'Hybrid'}
                        </div>

                        {st.bio && <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">"{st.bio}"</p>}

                        {st.skills?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {st.skills.map((skill, i) => (
                              <span key={i} className="text-[10px] glass-pill text-neutral-700 dark:text-neutral-300 px-2.5 py-0.5 font-medium">
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-black/5 dark:border-white/10">
                        <button
                          onClick={() => setSelectedStudentId(st.userId?._id)}
                          className="btn-liquid w-full inline-flex items-center justify-center gap-2 text-xs font-semibold text-brand-600 dark:text-brand-400 glass-secondary hover:bg-brand-500/10 py-2.5 rounded-full border border-brand-500/20 transition"
                        >
                          <FileText className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                          <span>Inspect Progress Diary & Profile</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Post Job Modal */}
        {showJobModal && (
          <div
            onClick={() => setShowJobModal(false)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-apple-fade"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="glass-form rounded-2xl max-w-lg w-full shadow-glass-floating p-6 sm:p-7 space-y-5 animate-apple-spring"
            >
              <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-4">
                <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                  <span>Publish New Internship Vacancy</span>
                </h3>
                <button
                  onClick={() => setShowJobModal(false)}
                  className="p-1.5 rounded-full glass-secondary text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handlePostJob} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Job Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Trainee Software Engineer (Intern)"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="glass-input w-full text-xs px-3.5 py-2.5 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Category *</label>
                    <select
                      value={jobCategory}
                      onChange={(e) => setJobCategory(e.target.value)}
                      className="glass-input w-full text-xs px-3.5 py-2.5 rounded-xl"
                    >
                      <option value="Software Engineering">Software Engineering</option>
                      <option value="Networking & Cloud">Networking & Cloud</option>
                      <option value="Cybersecurity">Cybersecurity</option>
                      <option value="Data Science & AI">Data Science & AI</option>
                      <option value="Multimedia & UI/UX">Multimedia & UI/UX</option>
                      <option value="Business Information Systems">Business Information Systems</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Work Type</label>
                    <select
                      value={jobType}
                      onChange={(e) => setJobType(e.target.value)}
                      className="glass-input w-full text-xs px-3.5 py-2.5 rounded-xl"
                    >
                      <option value="Full-Time Internship">Full-Time Internship</option>
                      <option value="Part-Time Internship">Part-Time Internship</option>
                      <option value="Remote">Remote</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Availability</label>
                    <input
                      type="text"
                      value={jobAvailability}
                      onChange={(e) => setJobAvailability(e.target.value)}
                      placeholder="Immediate"
                      className="glass-input w-full text-xs px-3.5 py-2.5 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Location</label>
                    <input
                      type="text"
                      value={jobLocation}
                      onChange={(e) => setJobLocation(e.target.value)}
                      placeholder="Colombo / Hybrid"
                      className="glass-input w-full text-xs px-3.5 py-2.5 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Job Description & Requirements *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Outline internship duties, preferred tech stack, and qualifications..."
                    value={jobDesc}
                    onChange={(e) => setJobDesc(e.target.value)}
                    className="glass-input w-full text-xs px-3.5 py-2.5 rounded-xl leading-relaxed"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-black/5 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowJobModal(false)}
                    className="btn-liquid text-xs px-4 py-2.5 rounded-full glass-secondary text-neutral-700 dark:text-neutral-300 font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingJob}
                    className="btn-liquid-primary text-xs px-5 py-2.5 rounded-full text-white font-semibold shadow-glass-sm transition"
                  >
                    {submittingJob ? 'Publishing...' : 'Publish Vacancy'}
                  </button>
                </div>
              </form>
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
