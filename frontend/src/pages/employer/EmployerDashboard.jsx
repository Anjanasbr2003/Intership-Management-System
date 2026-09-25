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
        <div className="card-elevated rounded-2xl p-7 sm:p-8 shadow-card-elevated shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
              {user?.companyName || user?.name}
            </h1>
            <p className="text-sm text-text-secondary font-medium">
              Industry Category: <span className="text-text-primary">{user?.companyCategory || 'Software Engineering'}</span>
            </p>
            <div className="text-xs text-text-muted flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
              <span>Contact Email: <span className="text-text-secondary">{user?.email}</span></span>
              {user?.phone && (
                <>
                  <span>&bull;</span>
                  <span>Phone: <span className="font-mono text-text-secondary tabular-nums">{user.phone}</span></span>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="card p-4 rounded-2xl text-center min-w-[105px] flex flex-col justify-center">
              <span className="text-[11px] font-semibold text-text-muted block mb-1">Status</span>
              <div className="flex justify-center">
                <StatusBadge status={user?.status} />
              </div>
            </div>
            <div className="card p-4 rounded-2xl text-center min-w-[105px] flex flex-col justify-center">
              <span className="text-[11px] font-semibold text-text-muted block mb-0.5">Live Jobs</span>
              <span className="text-2xl font-bold text-text-primary tabular-nums">{jobs.length}</span>
            </div>
            <div className="card p-4 rounded-2xl text-center min-w-[105px] flex flex-col justify-center">
              <span className="text-[11px] font-semibold text-text-muted block mb-0.5">Applicants</span>
              <span className="text-2xl font-bold text-text-primary tabular-nums">{applicants.length}</span>
            </div>
          </div>
        </div>

        {/* Verification Notice if Unapproved */}
        {!isApproved && (
          <div className="card rounded-2xl p-5 badge-warning flex items-start gap-3.5 text-xs shadow-sm">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-amber-950 dark:text-amber-200 text-sm block">Employer Account Verification Pending</span>
              <p className="text-amber-800 dark:text-amber-300/90 leading-relaxed">
                Your company profile is currently being reviewed by the System Administrator. Vacancy publication and applicant decision processing will be unlocked upon official authorization.
              </p>
            </div>
          </div>
        )}

        {/* Main Container with Reference Glassmorphism */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Navigation Sidebar */}
          <div className="lg:w-64 shrink-0 flex flex-col gap-4">
            <div className="flex flex-row lg:flex-col gap-1 overflow-x-auto card-elevated p-3 rounded-2xl shadow-card-elevated shadow-lg">
              <button
                onClick={() => setActiveTab('applicants')}
                className={`transition-transform active:scale-95 px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-between gap-3 whitespace-nowrap lg:w-full transition-all duration-200 ${
                  activeTab === 'applicants'
                    ? 'sidebar-nav-item active'
                    : 'sidebar-nav-item'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Users className="w-4 h-4 shrink-0" />
                  <span className="truncate">Applicants Manager</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-surface-hover text-text-secondary tabular-nums font-semibold shrink-0">
                  {applicants.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('jobs')}
                className={`transition-transform active:scale-95 px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-between gap-3 whitespace-nowrap lg:w-full transition-all duration-200 ${
                  activeTab === 'jobs'
                    ? 'sidebar-nav-item active'
                    : 'sidebar-nav-item'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Briefcase className="w-4 h-4 shrink-0" />
                  <span className="truncate">Job Vacancies</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-surface-hover text-text-secondary tabular-nums font-semibold shrink-0">
                  {jobs.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('suggested')}
                className={`transition-transform active:scale-95 px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-between gap-3 whitespace-nowrap lg:w-full transition-all duration-200 ${
                  activeTab === 'suggested'
                    ? 'sidebar-nav-item active'
                    : 'sidebar-nav-item'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Target className="w-4 h-4 shrink-0" />
                  <span className="truncate">Candidate Matches</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-surface-hover text-text-secondary tabular-nums font-semibold shrink-0">
                  {suggestedStudents.length}
                </span>
              </button>
            </div>

            {isApproved && (
              <button
                onClick={() => setShowJobModal(true)}
                className="btn-primary inline-flex items-center justify-center gap-2 text-sm font-semibold px-4 py-3 rounded-2xl shadow-sm w-full"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Post New Vacancy</span>
              </button>
            )}
          </div>

          {/* Content Area */}
          <div className="flex-1 card-elevated p-6 rounded-2xl shadow-card-elevated shadow-lg overflow-hidden min-h-[500px]">
          {/* Tab 1: Applicants Manager */}
          {activeTab === 'applicants' && (
            <div className="p-6 sm:p-7 space-y-5">
              {/* Vacancy Selector Filter Pills */}
              {jobs.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-text-muted block">
                    Filter by Vacancy ({jobs.length} Active):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedJobFilter('all')}
                      className={`transition-transform active:scale-95 text-xs px-3.5 py-1.5 rounded-full font-medium transition flex items-center gap-2 ${
                        selectedJobFilter === 'all'
                          ? 'btn-primary text-white shadow-sm font-semibold'
                          : 'card hover-card-effect text-text-secondary'
                      }`}
                    >
                      <span>All Candidates</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] tabular-nums font-semibold ${selectedJobFilter === 'all' ? 'bg-white/20 text-white' : 'bg-surface-hover text-text-secondary'}`}>
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
                          className={`transition-transform active:scale-95 text-xs px-3.5 py-1.5 rounded-full font-medium transition flex items-center gap-2 ${
                            isSelected
                              ? 'btn-primary text-white shadow-sm font-semibold'
                              : 'card hover-card-effect text-text-secondary'
                          }`}
                        >
                          <span>{j.title}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full tabular-nums font-semibold ${isSelected ? 'bg-white/20 text-white' : 'bg-surface-hover text-text-secondary'}`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {filteredApplicants.length === 0 ? (
                <div className="py-16 text-center text-text-muted border border-dashed border-black/10 dark:border-white/10 rounded-2xl card">
                  <Users className="w-10 h-10 text-text-disabled dark:text-text-secondary mx-auto mb-2" />
                  <p className="text-sm font-semibold text-text-secondary">No Applicants Found</p>
                  <p className="text-xs text-text-disabled mt-1">Undergraduates who apply to your vacancies will appear here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl card shadow-sm border border-border-subtle">
                  <table className="w-full text-left text-xs">
                    <thead className="text-[11px] font-semibold text-text-muted bg-black/[0.02] dark:bg-white/[0.02] border-b border-border-subtle">
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
                            <div className="font-semibold text-text-primary">{app.studentId?.name || 'Student'}</div>
                            <div className="text-[11px] text-text-muted">{app.studentId?.email}</div>
                            <div className="text-[11px] text-text-muted tabular-nums">{app.studentId?.phone || 'No phone'}</div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-medium text-text-primary">{app.jobId?.title}</span>
                            <span className="block text-[11px] text-text-disabled">{app.jobId?.category}</span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-xs font-medium text-text-primary">
                              {app.studentProfile?.degreeProgram || 'BICT'}
                            </div>
                            <div className="text-[11px] text-primary dark:text-brand-400 font-semibold">
                              {app.studentProfile?.mainCategory || 'Software Engineering'}
                            </div>
                          </td>
                          <td className="py-4 px-4 space-y-1.5">
                            <button
                              onClick={() => setSelectedStudentId(app.studentId?._id)}
                              className="transition-transform active:scale-95 inline-flex items-center gap-1.5 text-xs font-semibold text-primary dark:text-brand-400 card hover:bg-primary/10 px-3 py-1.5 rounded-full transition border border-brand-500/20"
                            >
                              <FileText className="w-3.5 h-3.5 text-primary dark:text-brand-400" />
                              <span>Inspect Daily Logs</span>
                            </button>
                            {app.studentProfile?.cvUrl && (
                              <div>
                                <a
                                  href={app.studentProfile.cvUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[11px] text-text-muted hover:text-neutral-800 dark:hover:text-neutral-200 underline inline-flex items-center gap-1 block"
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
                          <td className="py-4 px-4 flex flex-wrap items-center justify-end gap-2">
                            {app.status === 'pending' && isApproved ? (
                              <>
                                <button
                                  onClick={() => handleReviewApplicant(app._id, 'approved')}
                                  disabled={reviewLoading[app._id]}
                                  className="transition-transform active:scale-95 inline-flex items-center gap-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-full shadow-sm transition"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Accept</span>
                                </button>
                                <button
                                  onClick={() => handleReviewApplicant(app._id, 'rejected')}
                                  disabled={reviewLoading[app._id]}
                                  className="btn-danger inline-flex items-center gap-1 text-xs font-semibold px-3.5 py-1.5 rounded-xl shadow-sm"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Reject</span>
                                </button>
                              </>
                            ) : (
                              <span className="text-xs text-text-disabled font-medium">Processed</span>
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
                <div className="py-16 text-center text-text-muted border border-dashed border-black/10 dark:border-white/10 rounded-2xl card">
                  <Briefcase className="w-10 h-10 text-text-disabled dark:text-text-secondary mx-auto mb-2" />
                  <p className="text-sm font-semibold text-text-secondary">No Job Vacancies Published</p>
                  <p className="text-xs text-text-disabled mt-1">Click "Post New Vacancy" above to advertise open internship roles.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {jobs.map((j) => (
                    <div key={j._id} className="card hover-card-effect rounded-2xl p-6 space-y-3.5 shadow-sm flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-secondary text-text-secondary border border-border-subtle rounded-full text-text-primary">
                            {j.category}
                          </span>
                          <span className="text-[11px] font-medium text-text-secondary bg-secondary text-text-secondary border border-border-subtle rounded-full px-2.5 py-0.5">
                            {j.jobType}
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-text-primary">{j.title}</h4>
                        <p className="text-xs text-text-secondary line-clamp-3 leading-relaxed">{j.description}</p>
                      </div>

                      <div className="text-xs text-text-muted pt-3 border-t border-border-subtle flex justify-between">
                        <span>Location: <strong className="text-text-primary font-semibold">{j.location}</strong></span>
                        <span>Availability: <strong className="text-text-primary font-semibold">{j.availability}</strong></span>
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
              <div className="card rounded-2xl p-5 flex items-center justify-between shadow-sm">
                <div>
                  <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary dark:text-brand-400" />
                    <span>Candidate Specialization Matches ({user?.companyCategory || 'Software Engineering'})</span>
                  </h3>
                  <p className="text-xs text-text-muted mt-1">
                    Enrolled undergraduates whose academic field and stated interests align with your recruitment domain.
                  </p>
                </div>
              </div>

              {suggestedStudents.length === 0 ? (
                <div className="py-16 text-center text-text-muted border border-dashed border-black/10 dark:border-white/10 rounded-2xl card">
                  <Target className="w-10 h-10 text-text-disabled dark:text-text-secondary mx-auto mb-2" />
                  <p className="text-sm font-semibold text-text-secondary">No Matching Students Found</p>
                  <p className="text-xs text-text-disabled mt-1">Matching candidates will appear as students register with aligned specializations.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {suggestedStudents.map((st) => (
                    <div
                      key={st._id}
                      className="card hover-card-effect rounded-2xl p-6 space-y-4 flex flex-col justify-between shadow-sm"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-semibold bg-secondary text-text-secondary border border-border-subtle rounded-full text-primary dark:text-brand-400 px-3 py-1">
                            {st.mainCategory}
                          </span>
                          <span className="text-[11px] font-semibold bg-secondary text-text-secondary border border-border-subtle rounded-full text-text-secondary px-2.5 py-0.5">
                            Domain Match
                          </span>
                        </div>

                        <div className="flex items-center gap-3.5">
                          {st.profilePic ? (
                            <img src={st.profilePic} alt={st.userId?.name} className="w-12 h-12 rounded-2xl object-cover ring-1 ring-white/30 dark:ring-white/10 shadow-sm shrink-0" />
                          ) : (
                            <div className="w-12 h-12 rounded-2xl card flex items-center justify-center font-bold text-primary dark:text-brand-400 text-sm shrink-0 ring-1 ring-white/20">
                              {st.userId?.name?.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-text-primary leading-tight">{st.userId?.name}</h4>
                              {st.gpa && (
                                <span className="text-[10px] bg-secondary text-text-secondary border border-border-subtle rounded-full text-text-secondary font-semibold px-2 py-0.5 tabular-nums">
                                  GPA {st.gpa}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-text-muted mt-0.5">{st.universityId?.name}</div>
                          </div>
                        </div>

                        {st.desiredField && (
                          <div className="text-xs font-medium text-text-primary bg-secondary text-text-secondary border border-border-subtle rounded-full px-3 py-1.5">
                            Target Field: <strong className="text-text-primary font-semibold">{st.desiredField}</strong>
                          </div>
                        )}

                        <div className="text-xs text-text-muted">
                          Location: {st.livingCity || st.userId?.livingCity || 'Not specified'} &bull; {st.workType || 'Hybrid'}
                        </div>

                        {st.bio && <p className="text-xs text-text-muted line-clamp-2">"{st.bio}"</p>}

                        {st.skills?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {st.skills.map((skill, i) => (
                              <span key={i} className="text-[10px] bg-secondary text-text-secondary border border-border-subtle rounded-full text-text-secondary px-2.5 py-0.5 font-medium">
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-border-subtle">
                        <button
                          onClick={() => setSelectedStudentId(st.userId?._id)}
                          className="transition-transform active:scale-95 w-full inline-flex items-center justify-center gap-2 text-xs font-semibold text-primary dark:text-brand-400 card hover:bg-primary/10 py-2.5 rounded-full border border-brand-500/20 transition"
                        >
                          <FileText className="w-3.5 h-3.5 text-primary dark:text-brand-400" />
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
        </div>

        {/* Post Job Modal */}
        {showJobModal && (
          <div
            onClick={() => setShowJobModal(false)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-apple-fade"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="card-elevated p-6 rounded-2xl max-w-lg w-full shadow-card-elevated shadow-lg p-6 sm:p-7 space-y-5 animate-apple-spring"
            >
              <div className="flex items-center justify-between border-b border-border-subtle pb-4">
                <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-primary dark:text-brand-400" />
                  <span>Publish New Internship Vacancy</span>
                </h3>
                <button
                  onClick={() => setShowJobModal(false)}
                  className="p-1.5 rounded-full card text-text-disabled hover:text-text-secondary dark:hover:text-neutral-200 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handlePostJob} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5">Job Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Trainee Software Engineer (Intern)"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="input-field w-full text-xs px-3.5 py-2.5 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1.5">Category *</label>
                    <select
                      value={jobCategory}
                      onChange={(e) => setJobCategory(e.target.value)}
                      className="input-field w-full text-xs px-3.5 py-2.5 rounded-xl"
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
                    <label className="block text-xs font-semibold text-text-secondary mb-1.5">Work Type</label>
                    <select
                      value={jobType}
                      onChange={(e) => setJobType(e.target.value)}
                      className="input-field w-full text-xs px-3.5 py-2.5 rounded-xl"
                    >
                      <option value="Full-Time Internship">Full-Time Internship</option>
                      <option value="Part-Time Internship">Part-Time Internship</option>
                      <option value="Remote">Remote</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1.5">Availability</label>
                    <input
                      type="text"
                      value={jobAvailability}
                      onChange={(e) => setJobAvailability(e.target.value)}
                      placeholder="Immediate"
                      className="input-field w-full text-xs px-3.5 py-2.5 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1.5">Location</label>
                    <input
                      type="text"
                      value={jobLocation}
                      onChange={(e) => setJobLocation(e.target.value)}
                      placeholder="Colombo / Hybrid"
                      className="input-field w-full text-xs px-3.5 py-2.5 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5">Job Description & Requirements *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Outline internship duties, preferred tech stack, and qualifications..."
                    value={jobDesc}
                    onChange={(e) => setJobDesc(e.target.value)}
                    className="input-field w-full text-xs px-3.5 py-2.5 rounded-xl leading-relaxed"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-border-subtle">
                  <button
                    type="button"
                    onClick={() => setShowJobModal(false)}
                    className="transition-transform active:scale-95 text-xs px-4 py-2.5 rounded-full card text-text-secondary font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingJob}
                    className="btn-primary text-xs px-5 py-2.5 rounded-full text-white font-semibold shadow-sm transition"
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
