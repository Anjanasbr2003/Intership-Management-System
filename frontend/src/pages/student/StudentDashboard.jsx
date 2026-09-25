import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
  Calendar,
  Clock,
  BookOpen,
  Briefcase,
  FileText,
  Upload,
  CheckCircle2,
  PlusCircle,
  Search,
  Building2,
  MapPin,
  Send,
  AlertCircle,
  ExternalLink,
  User,
  X,
  Camera,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import { toast } from '../../components/Toast';
import PageBackground from '../../components/PageBackground';

export default function StudentDashboard() {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('logs');
  const [profile, setProfile] = useState(null);
  const [logs, setLogs] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Log Entry Form
  const [showLogModal, setShowLogModal] = useState(false);
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [hoursWorked, setHoursWorked] = useState(8);
  const [tasksCompleted, setTasksCompleted] = useState('');
  const [learnings, setLearnings] = useState('');
  const [logSubmitting, setLogSubmitting] = useState(false);

  // Profile Edit State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [livingCity, setLivingCity] = useState('');
  const [personalEmail, setPersonalEmail] = useState('');
  const [degreeProgram, setDegreeProgram] = useState('');
  const [mainCategory, setMainCategory] = useState('IT');
  const [desiredField, setDesiredField] = useState('');
  const [workType, setWorkType] = useState('Hybrid');
  const [availability, setAvailability] = useState('Full-Time');
  const [gpa, setGpa] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [bio, setBio] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [cvFile, setCvFile] = useState(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [uploadingProfilePhoto, setUploadingProfilePhoto] = useState(false);

  // Job Search / Filter State
  const [jobSearch, setJobSearch] = useState('');
  const [jobCategory, setJobCategory] = useState('All');
  const [applyingJobId, setApplyingJobId] = useState(null);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const [profRes, logsRes, jobsRes, appsRes] = await Promise.all([
        api.get('/students/profile'),
        api.get('/students/logs'),
        api.get('/jobs'),
        api.get('/employer/my-applications'),
      ]);

      const prof = profRes.data.profile;
      const u = profRes.data.user;
      setProfile(prof);
      if (u) {
        setName(u.name || '');
        setPhone(u.phone || '');
        setLivingCity(u.livingCity || '');
        setPersonalEmail(u.personalEmail || '');
      }
      if (prof) {
        setDegreeProgram(prof.degreeProgram || '');
        setMainCategory(prof.mainCategory || 'IT');
        setDesiredField(prof.desiredField || '');
        setWorkType(prof.workType || 'Hybrid');
        setAvailability(prof.availability || 'Full-Time');
        setGpa(prof.gpa || '');
        setProfilePic(prof.profilePic || '');
        setLinkedinUrl(prof.linkedinUrl || '');
        setGithubUrl(prof.githubUrl || '');
        setPortfolioUrl(prof.portfolioUrl || '');
        setBio(prof.bio || '');
        setSkillsText(prof.skills ? prof.skills.join(', ') : '');
      }

      setLogs(logsRes.data.logs || []);
      setJobs(jobsRes.data.jobs || []);
      setApplications(appsRes.data.applications || []);
    } catch (err) {
      console.error('Failed to load student data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  // Escape key closes log modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showLogModal) {
        setShowLogModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLogModal]);

  const handleAddLog = async (e) => {
    e.preventDefault();
    setLogSubmitting(true);
    try {
      await api.post('/students/logs', {
        date: logDate,
        hoursWorked,
        tasksCompleted,
        learnings,
      });
      setShowLogModal(false);
      setTasksCompleted('');
      setLearnings('');
      toast.success('Daily progress entry logged successfully.');
      await fetchStudentData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit log entry');
    } finally {
      setLogSubmitting(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg('');
    try {
      await api.put('/students/profile', {
        name,
        phone,
        livingCity,
        personalEmail,
        degreeProgram,
        mainCategory,
        desiredField,
        workType,
        availability,
        gpa,
        profilePic,
        linkedinUrl,
        githubUrl,
        portfolioUrl,
        skills: skillsText,
        bio,
      });

      if (cvFile) {
        const formData = new FormData();
        formData.append('cv', cvFile);
        await api.post('/students/cv', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setProfileMsg('Profile and CV updated successfully.');
      toast.success('Profile and CV saved successfully.');
      await fetchStudentData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleUploadProfilePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploadingProfilePhoto(true);
      const res = await api.post('/students/profile-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const newPic = res.data.profilePic;
      setProfilePic(newPic);
      setProfile((prev) => (prev ? { ...prev, profilePic: newPic } : prev));
      if (refreshUser) {
        await refreshUser();
      }
      toast.success('Profile picture updated successfully!');
    } catch (err) {
      console.error('Failed to upload profile picture:', err);
      toast.error(err.response?.data?.message || 'Failed to upload profile picture');
    } finally {
      setUploadingProfilePhoto(false);
    }
  };

  const handleRemoveProfilePhoto = async () => {
    try {
      setUploadingProfilePhoto(true);
      await api.put('/students/profile', { profilePic: '' });
      setProfilePic('');
      setProfile((prev) => (prev ? { ...prev, profilePic: '' } : prev));
      if (refreshUser) {
        await refreshUser();
      }
      toast.success('Profile picture removed');
    } catch (err) {
      console.error('Failed to remove profile picture:', err);
      toast.error('Failed to remove profile picture');
    } finally {
      setUploadingProfilePhoto(false);
    }
  };

  const handleApplyJob = async (jobId) => {
    try {
      setApplyingJobId(jobId);
      await api.post(`/employer/apply/${jobId}`);
      toast.success('Application submitted successfully to employer.');
      await fetchStudentData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error submitting application');
    } finally {
      setApplyingJobId(null);
    }
  };

  const totalLoggedHours = logs.reduce((acc, curr) => acc + (curr.hoursWorked || 0), 0);
  const appliedJobIds = new Set(applications.map((a) => a.jobId?._id));

  const filteredJobs = jobs.filter((j) => {
    const matchCategory = jobCategory === 'All' || j.category === jobCategory;
    const matchSearch =
      j.title.toLowerCase().includes(jobSearch.toLowerCase()) ||
      j.companyName.toLowerCase().includes(jobSearch.toLowerCase()) ||
      j.description.toLowerCase().includes(jobSearch.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      <PageBackground variant="student" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7 animate-applePageEnter">
        {/* Header Profile & Summary Strip */}
        <div className="card-elevated rounded-2xl p-7 sm:p-8 shadow-card-elevated shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            {profile?.profilePic ? (
              <img
                src={profile.profilePic}
                alt={user?.name}
                className="w-16 h-16 rounded-2xl object-cover ring-1 ring-white/30 shadow-sm shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl card text-primary flex items-center justify-center font-bold ring-1 ring-white/20 shrink-0">
                <GraduationCap className="w-8 h-8" />
              </div>
            )}

            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">{user?.name}</h1>
              <p className="text-sm text-text-secondary font-medium">
                {profile?.degreeProgram || 'Undergraduate Degree'} &bull; {profile?.mainCategory || 'IT'}
              </p>
              <div className="text-xs text-text-muted flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5">
                <span>Reg No: <span className="font-mono text-text-secondary tabular-nums">{profile?.studentRegNo || 'Pending'}</span></span>
                <span>&bull;</span>
                <span>Location: <span className="text-text-secondary">{user?.livingCity || profile?.livingCity || 'Not specified'}</span></span>
                <span>&bull;</span>
                <span>Target: <span className="text-text-secondary">{profile?.desiredField || 'Software Engineer'}</span></span>
              </div>
            </div>
          </div>

          {/* Top Metric Strip */}
          <div className="grid grid-cols-3 gap-3">
            <div className="card p-4 rounded-2xl text-center min-w-[100px]">
              <span className="text-[11px] font-semibold text-text-muted block">Logged Hours</span>
              <span className="text-2xl font-bold text-text-primary tabular-nums">{totalLoggedHours}h</span>
            </div>
            <div className="card p-4 rounded-2xl text-center min-w-[100px]">
              <span className="text-[11px] font-semibold text-text-muted block">Daily Logs</span>
              <span className="text-2xl font-bold text-text-primary tabular-nums">{logs.length}</span>
            </div>
            <div className="card p-4 rounded-2xl text-center min-w-[100px]">
              <span className="text-[11px] font-semibold text-text-muted block">Applications</span>
              <span className="text-2xl font-bold text-text-primary tabular-nums">{applications.length}</span>
            </div>
          </div>
        </div>

        {/* Main Container with Reference Glassmorphism */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Navigation Sidebar */}
          <div className="lg:w-64 shrink-0 flex flex-row lg:flex-col gap-1 overflow-x-auto card-elevated p-3 rounded-2xl shadow-card-elevated shadow-lg h-fit">
            <button
              onClick={() => setActiveTab('logs')}
              className={`transition-transform active:scale-95 px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-between gap-3 whitespace-nowrap lg:w-full transition-all duration-200 ${
                activeTab === 'logs'
                  ? 'sidebar-nav-item active'
                  : 'sidebar-nav-item'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Clock className="w-4 h-4 shrink-0" />
                <span className="truncate">Daily Progress Log</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-surface-hover text-text-secondary tabular-nums font-semibold shrink-0">
                {logs.length}
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
                <span className="truncate">Internship Vacancies</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-surface-hover text-text-secondary tabular-nums font-semibold shrink-0">
                {jobs.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('applications')}
              className={`transition-transform active:scale-95 px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-between gap-3 whitespace-nowrap lg:w-full transition-all duration-200 ${
                activeTab === 'applications'
                  ? 'sidebar-nav-item active'
                  : 'sidebar-nav-item'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Send className="w-4 h-4 shrink-0" />
                <span className="truncate">My Applications</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-surface-hover text-text-secondary tabular-nums font-semibold shrink-0">
                {applications.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`transition-transform active:scale-95 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 whitespace-nowrap lg:w-full transition-all duration-200 ${
                activeTab === 'profile'
                  ? 'sidebar-nav-item active'
                  : 'sidebar-nav-item'
              }`}
            >
              <GraduationCap className="w-4 h-4 shrink-0" />
              <span>Profile & CV</span>
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 card-elevated p-6 rounded-2xl shadow-card-elevated shadow-lg overflow-hidden min-h-[500px]">
          {/* Tab 1: Daily Progress Logs */}
        {activeTab === 'logs' && (
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-text-primary tracking-tight">Internship Progress Diary</h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Entries are reviewed by your assigned academic supervisor and faculty head.
                </p>
              </div>

              <button
                onClick={() => setShowLogModal(true)}
                className="btn-primary inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl shadow-sm transition self-start"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Log Today's Progress</span>
              </button>
            </div>

            {logs.length === 0 ? (
              <div className="py-14 text-center text-text-muted border border-dashed border-black/10 dark:border-white/10 rounded-2xl card">
                <Clock className="w-10 h-10 text-text-disabled mx-auto mb-2" />
                <p className="text-sm font-semibold text-text-primary">No Daily Progress Logs Recorded Yet</p>
                <p className="text-xs text-text-muted mt-1">Click "Log Today's Progress" to submit today's hours and learnings.</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {logs.map((log) => (
                  <div
                    key={log._id}
                    className="card hover-card-effect rounded-2xl p-5 border border-border-subtle transition space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle pb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="font-semibold text-text-primary text-xs">
                          {new Date(log.date).toLocaleDateString(undefined, {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <span className="bg-secondary text-text-secondary border border-border-subtle rounded-full inline-flex items-center gap-1 text-text-secondary text-xs font-semibold px-2.5 py-1 tabular-nums self-start">
                        <Clock className="w-3 h-3 text-text-disabled" /> {log.hoursWorked || 8} Hours Logged
                      </span>
                    </div>

                    <div className="text-xs text-text-primary leading-relaxed whitespace-pre-line">
                      {log.tasksCompleted}
                    </div>

                    {log.learnings && (
                      <div className="card badge-info rounded-xl p-3.5 text-xs text-text-secondary flex items-start gap-2.5">
                        <BookOpen className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-text-primary">Learnings / Reflections: </span>
                          {log.learnings}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Job Board */}
        {activeTab === 'jobs' && (
          <div className="p-6 space-y-6">
            {/* Search & Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 relative">
                <Search className="w-4 h-4 text-text-disabled absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search by job title, company name, or keywords..."
                  value={jobSearch}
                  onChange={(e) => setJobSearch(e.target.value)}
                  className="input-field w-full pl-9 pr-3.5 h-10 text-xs rounded-xl text-text-primary placeholder:text-text-disabled"
                />
              </div>

              <div>
                <select
                  value={jobCategory}
                  onChange={(e) => setJobCategory(e.target.value)}
                  className="input-field w-full h-10 px-3.5 text-xs rounded-xl text-text-primary"
                >
                  <option value="All" className="dark:bg-neutral-900">All Categories</option>
                  <option value="Software Engineering" className="dark:bg-neutral-900">Software Engineering</option>
                  <option value="Networking & Cloud" className="dark:bg-neutral-900">Networking & Cloud</option>
                  <option value="Cybersecurity" className="dark:bg-neutral-900">Cybersecurity</option>
                  <option value="Data Science & AI" className="dark:bg-neutral-900">Data Science & AI</option>
                  <option value="Multimedia & UI/UX" className="dark:bg-neutral-900">Multimedia & UI/UX</option>
                  <option value="Business Information Systems" className="dark:bg-neutral-900">Business Information Systems</option>
                </select>
              </div>
            </div>

            {/* Jobs Grid */}
            {filteredJobs.length === 0 ? (
              <div className="py-14 text-center text-text-muted border border-dashed border-black/10 dark:border-white/10 rounded-2xl card">
                <Briefcase className="w-10 h-10 text-text-disabled mx-auto mb-2" />
                <p className="text-sm font-semibold text-text-primary">No Matching Vacancies Found</p>
                <p className="text-xs text-text-muted mt-1">Try modifying your search keywords or category filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredJobs.map((job) => {
                  const isApplied = appliedJobIds.has(job._id);
                  return (
                    <div
                      key={job._id}
                      className="card hover-card-effect rounded-2xl p-5 border border-border-subtle transition flex flex-col justify-between space-y-3.5"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="bg-secondary text-text-secondary border border-border-subtle rounded-full text-[10px] font-semibold px-2.5 py-0.5 text-primary">
                            {job.category}
                          </span>
                          <span className="bg-secondary text-text-secondary border border-border-subtle rounded-full text-[11px] font-medium text-text-secondary px-2.5 py-0.5">
                            {job.jobType}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-text-primary leading-snug tracking-tight">{job.title}</h4>

                        <div className="flex items-center gap-3 text-xs text-text-muted">
                          <span className="flex items-center gap-1 font-medium text-text-secondary">
                            <Building2 className="w-3.5 h-3.5 text-text-disabled" /> {job.companyName}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-text-disabled" /> {job.location || 'Remote'}
                          </span>
                        </div>

                        <p className="text-xs text-text-secondary line-clamp-3 leading-relaxed pt-1">
                          {job.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-border-subtle flex items-center justify-between">
                        <span className="text-[11px] text-text-muted">
                          Availability: <strong className="text-text-secondary">{job.availability || 'Immediate'}</strong>
                        </span>

                        {isApplied ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-secondary text-text-secondary border border-border-subtle rounded-full bg-emerald-500/10 px-3 py-1 border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Applied
                          </span>
                        ) : (
                          <button
                            onClick={() => handleApplyJob(job._id)}
                            disabled={applyingJobId === job._id}
                            className="btn-primary inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-xl shadow-sm"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>{applyingJobId === job._id ? 'Submitting...' : 'Apply Now'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        {/* Tab 3: My Applications */}
        {activeTab === 'applications' && (
          <div className="p-6">
            {applications.length === 0 ? (
              <div className="py-14 text-center text-text-muted">
                <div className="w-12 h-12 rounded-2xl card flex items-center justify-center mx-auto mb-3 text-text-disabled">
                  <Send className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-text-primary">No Applications Submitted</p>
                <p className="text-xs text-text-muted mt-1">Explore open positions in the Internship Vacancies tab to submit applications.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-border-subtle">
                <table className="w-full text-left text-xs">
                  <thead className="text-[11px] font-semibold uppercase tracking-wider bg-black/[0.02] dark:bg-white/[0.02] text-text-muted border-b border-border-subtle">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">Position / Job</th>
                      <th className="py-3.5 px-4 font-semibold">Employer</th>
                      <th className="py-3.5 px-4 font-semibold">Category</th>
                      <th className="py-3.5 px-4 font-semibold">Applied Date</th>
                      <th className="py-3.5 px-4 text-right font-semibold">Application Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 dark:divide-white/5">
                    {applications.map((app) => (
                      <tr key={app._id} className="hover:bg-white/50 dark:hover:bg-white/[0.03] transition-colors">
                        <td className="py-4 px-4 font-semibold text-text-primary">
                          {app.jobId?.title || 'Internship Vacancy'}
                        </td>
                        <td className="py-4 px-4 text-text-secondary font-medium">
                          {app.employerId?.companyName || app.employerId?.name}
                        </td>
                        <td className="py-4 px-4">
                          <span className="bg-secondary text-text-secondary border border-border-subtle rounded-full text-[11px] px-2.5 py-0.5 text-text-secondary">
                            {app.jobId?.category || 'IT'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-xs text-text-muted tabular-nums">
                          {new Date(app.appliedAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <StatusBadge status={app.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Profile & CV */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="p-6 space-y-6 max-w-3xl">
            {profileMsg && (
              <div className="card bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 p-3.5 rounded-xl text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>{profileMsg}</span>
              </div>
            )}

            {/* Group 1: Personal Details */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted border-b border-border-subtle pb-2">
                Personal Contact Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field w-full text-xs h-10 px-3.5 rounded-xl text-text-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Living City</label>
                  <input
                    type="text"
                    value={livingCity}
                    onChange={(e) => setLivingCity(e.target.value)}
                    placeholder="e.g. Matara / Colombo"
                    className="input-field w-full text-xs h-10 px-3.5 rounded-xl text-text-primary placeholder:text-text-disabled"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+94 77 123 4567"
                    className="input-field w-full text-xs h-10 px-3.5 rounded-xl text-text-primary placeholder:text-text-disabled"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Personal Email (Optional)</label>
                  <input
                    type="email"
                    value={personalEmail}
                    onChange={(e) => setPersonalEmail(e.target.value)}
                    placeholder="personal@gmail.com"
                    className="input-field w-full text-xs h-10 px-3.5 rounded-xl text-text-primary placeholder:text-text-disabled"
                  />
                </div>
              </div>
            </div>

            {/* Group 2: Academic & Career Profile */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted border-b border-border-subtle pb-2">
                Academic & Placement Profile
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Degree Program</label>
                  <input
                    type="text"
                    value={degreeProgram}
                    onChange={(e) => setDegreeProgram(e.target.value)}
                    placeholder="Bachelor of Information and Communication Technology (BICT)"
                    className="input-field w-full text-xs h-10 px-3.5 rounded-xl text-text-primary placeholder:text-text-disabled"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Main Category</label>
                  <select
                    value={mainCategory}
                    onChange={(e) => setMainCategory(e.target.value)}
                    className="input-field w-full text-xs h-10 px-3.5 rounded-xl text-text-primary"
                  >
                    <option value="IT" className="dark:bg-neutral-900">IT & Computing</option>
                    <option value="Agriculture" className="dark:bg-neutral-900">Agriculture</option>
                    <option value="Science" className="dark:bg-neutral-900">Science & Biology</option>
                    <option value="Art" className="dark:bg-neutral-900">Art & Design</option>
                    <option value="Engineering" className="dark:bg-neutral-900">Engineering</option>
                    <option value="Management" className="dark:bg-neutral-900">Management / Documentation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Desired Internship Field</label>
                  <input
                    type="text"
                    value={desiredField}
                    onChange={(e) => setDesiredField(e.target.value)}
                    placeholder="e.g. Frontend Engineer / Bio Analyst"
                    className="input-field w-full text-xs h-10 px-3.5 rounded-xl text-text-primary placeholder:text-text-disabled"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Cumulative GPA</label>
                  <input
                    type="text"
                    value={gpa}
                    onChange={(e) => setGpa(e.target.value)}
                    placeholder="3.82"
                    className="input-field w-full text-xs h-10 px-3.5 rounded-xl text-text-primary tabular-nums placeholder:text-text-disabled"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Preferred Work Mode</label>
                  <select
                    value={workType}
                    onChange={(e) => setWorkType(e.target.value)}
                    className="input-field w-full text-xs h-10 px-3.5 rounded-xl text-text-primary"
                  >
                    <option value="Hybrid" className="dark:bg-neutral-900">Hybrid</option>
                    <option value="Remote" className="dark:bg-neutral-900">Remote</option>
                    <option value="Onsite" className="dark:bg-neutral-900">Onsite</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Availability</label>
                  <select
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    className="input-field w-full text-xs h-10 px-3.5 rounded-xl text-text-primary"
                  >
                    <option value="Full-Time" className="dark:bg-neutral-900">Full-Time</option>
                    <option value="Part-Time" className="dark:bg-neutral-900">Part-Time</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Group 3: Links & Portfolio */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted border-b border-border-subtle pb-2">
                Profiles & Portfolio Links
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2 card p-4 rounded-2xl border border-white/60 dark:border-white/10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
                    <div>
                      <h5 className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-primary" />
                        <span>Profile Picture</span>
                      </h5>
                      <p className="text-[11px] text-text-muted mt-0.5">
                        Upload or change your account profile photo (Max 5MB)
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Avatar Preview */}
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden card-elevated flex items-center justify-center border border-border-strong shadow-sm shrink-0">
                      {profilePic ? (
                        <img
                          src={profilePic}
                          alt={name || user?.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-7 h-7 text-text-disabled" />
                      )}
                      {uploadingProfilePhoto && (
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <label className="btn-primary cursor-pointer text-xs font-semibold px-4 py-2 rounded-xl inline-flex items-center gap-2 shadow-sm">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{profilePic ? 'Change Photo' : 'Upload Photo'}</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            onChange={handleUploadProfilePhoto}
                            className="hidden"
                            disabled={uploadingProfilePhoto}
                          />
                        </label>

                        {profilePic && (
                          <button
                            type="button"
                            onClick={handleRemoveProfilePhoto}
                            disabled={uploadingProfilePhoto}
                            className="transition-transform active:scale-95 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 px-3 py-2 rounded-xl border border-transparent hover:border-rose-500/20 transition flex items-center gap-1.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>
                      <span className="text-[10px] text-text-muted">
                        Supports JPG, PNG, WEBP or GIF formats
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">LinkedIn URL</label>
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="input-field w-full text-xs h-10 px-3.5 rounded-xl text-text-primary placeholder:text-text-disabled"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">GitHub URL</label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/username"
                    className="input-field w-full text-xs h-10 px-3.5 rounded-xl text-text-primary placeholder:text-text-disabled"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Portfolio Website</label>
                  <input
                    type="url"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="https://myportfolio.dev"
                    className="input-field w-full text-xs h-10 px-3.5 rounded-xl text-text-primary placeholder:text-text-disabled"
                  />
                </div>
              </div>
            </div>

            {/* Group 4: Skills & Bio */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted border-b border-border-subtle pb-2">
                Skills & Biography
              </h4>
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Skills (comma-separated)</label>
                  <input
                    type="text"
                    value={skillsText}
                    onChange={(e) => setSkillsText(e.target.value)}
                    placeholder="React, Node.js, Express, MongoDB, Git"
                    className="input-field w-full text-xs h-10 px-3.5 rounded-xl text-text-primary placeholder:text-text-disabled"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Short Bio / Career Objective</label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Describe your technical focus, internship expectations, and goals..."
                    className="input-field w-full text-xs p-3.5 rounded-xl text-text-primary placeholder:text-text-disabled leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Group 5: CV Upload */}
            <div className="p-4 rounded-2xl card space-y-2">
              <label className="block text-xs font-semibold text-text-secondary">
                Curriculum Vitae Document (PDF or Word)
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setCvFile(e.target.files[0])}
                className="text-xs text-text-muted file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-500/10 file:text-blue-600 dark:file:text-blue-400 hover:file:bg-blue-500/20 cursor-pointer"
              />
              {profile?.cvUrl && (
                <div className="text-xs text-text-muted pt-1 flex items-center gap-1.5">
                  <span className="text-text-muted">Active CV on file:</span>
                  <a
                    href={profile.cvUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-primary hover:underline inline-flex items-center gap-1"
                  >
                    <span>View / Download CV</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={profileSaving}
              className="btn-primary inline-flex items-center gap-1.5 text-xs font-semibold px-5 py-2.5 rounded-xl shadow-sm"
            >
              {profileSaving ? 'Saving Changes...' : 'Save Profile & CV'}
            </button>
          </form>
        )}
          </div>
        </div>

      {/* Log Entry Modal */}
      {showLogModal && (
        <div
          onClick={() => setShowLogModal(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="card-elevated p-6 rounded-2xl max-w-lg w-full p-6 sm:p-7 space-y-4 animate-appleModalSpring shadow-card-elevated shadow-lg"
          >
            <div className="flex items-center justify-between border-b border-border-subtle pb-3.5">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-primary" />
                <span>New Daily Progress Entry</span>
              </h3>
              <button
                onClick={() => setShowLogModal(false)}
                className="p-1 rounded-full text-text-disabled hover:text-text-secondary dark:hover:text-neutral-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddLog} className="space-y-4">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    className="input-field w-full text-xs h-10 px-3.5 rounded-xl text-text-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Hours Worked *</label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    required
                    value={hoursWorked}
                    onChange={(e) => setHoursWorked(e.target.value)}
                    className="input-field w-full text-xs h-10 px-3.5 rounded-xl text-text-primary tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Tasks Completed *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Details of technical tasks worked on today..."
                  value={tasksCompleted}
                  onChange={(e) => setTasksCompleted(e.target.value)}
                  className="input-field w-full text-xs p-3.5 rounded-xl text-text-primary placeholder:text-text-disabled leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Learnings / Reflections</label>
                <textarea
                  rows={2}
                  placeholder="Key technical insights, challenges resolved, or skills practiced..."
                  value={learnings}
                  onChange={(e) => setLearnings(e.target.value)}
                  className="input-field w-full text-xs p-3.5 rounded-xl text-text-primary placeholder:text-text-disabled leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="transition-transform active:scale-95 text-xs px-4 py-2 rounded-xl text-text-secondary font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={logSubmitting}
                  className="btn-primary text-xs px-4 py-2 rounded-xl shadow-sm font-semibold"
                >
                  {logSubmitting ? 'Submitting...' : 'Save Log Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  </div>
  );
}
