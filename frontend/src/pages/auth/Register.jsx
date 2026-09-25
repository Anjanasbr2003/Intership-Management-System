import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import {
  GraduationCap,
  Building2,
  UserCheck,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Camera,
  Upload,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react';
import { toast } from '../../components/Toast';
import PageBackground from '../../components/PageBackground';
import InterlinkLogo from '../../components/InterlinkLogo';

export default function Register() {
  const [role, setRole] = useState('student');
  const [approvedUnis, setApprovedUnis] = useState([]);
  const [masterUnis, setMasterUnis] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadingPic, setUploadingPic] = useState(false);
  const [previewPic, setPreviewPic] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    personalEmail: '',
    password: '',
    phone: '',
    livingCity: '',

    // Head
    universityName: '',
    applierPosition: 'Dean, Faculty of Technology',

    // Supervisor
    position: 'Senior Lecturer',
    staffRegNo: '',
    universityId: '',
    autoSendJoinRequest: true,

    // Student
    studentRegNo: '',
    degreeProgram: 'Bachelor of Information and Communication Technology (BICT)',
    mainCategory: 'IT',
    desiredField: 'Software Engineering / Web Development',
    workType: 'Hybrid',
    availability: 'Full-Time',
    profilePic: '',
    gpa: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    skills: '',

    // Employer
    companyName: '',
    companyCategory: 'IT sector',
    recruiterName: '',
    recruitmentArea: 'Western Province / Islandwide',
    recruiterDesignation: 'Talent Acquisition Lead',
    recruiterLinkedin: '',
    recruiterContactNumber: '',
    businessRegNumber: '',
    taxId: '',
    companyWebsite: '',
  });

  useEffect(() => {
    const loadUniversities = async () => {
      try {
        const [approvedRes, masterRes] = await Promise.all([
          api.get('/universities/approved'),
          api.get('/universities/master-list'),
        ]);
        const approved = approvedRes.data.universities || [];
        const master = masterRes.data.universities || [];
        setApprovedUnis(approved);
        setMasterUnis(master);
        if (approved.length > 0) {
          setFormData((prev) => ({ ...prev, universityId: approved[0]._id }));
        }
        if (master.length > 0) {
          setFormData((prev) => ({ ...prev, universityName: master[0].name }));
        }
      } catch (err) {
        console.error('Failed to load universities:', err);
      }
    };
    loadUniversities();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setPreviewPic(localUrl);

    const data = new FormData();
    data.append('image', file);

    setUploadingPic(true);
    try {
      const res = await api.post('/auth/upload-image', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFormData((prev) => ({ ...prev, profilePic: res.data.imageUrl }));
      toast.success('Profile photo attached');
    } catch (err) {
      console.error('Registration image upload error:', err);
      toast.error(err.response?.data?.message || 'Failed to upload image');
      setPreviewPic('');
    } finally {
      setUploadingPic(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewPic('');
    setFormData((prev) => ({ ...prev, profilePic: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const payload = { ...formData, role };
      const user = await register(payload);

      if (user.role === 'head') {
        const msg = 'University registration submitted. Awaiting Administrator review.';
        setSuccess(msg);
        toast.success(msg);
        setTimeout(() => navigate('/login'), 3000);
      } else if (user.role === 'employer') {
        const msg = 'Employer registration submitted. Awaiting Administrator verification.';
        setSuccess(msg);
        toast.success(msg);
        setTimeout(() => navigate('/login'), 3000);
      } else if (user.role === 'supervisor') {
        const msg = 'Supervisor profile created. Authorization request routed to University Head.';
        setSuccess(msg);
        toast.success(msg);
        setTimeout(() => navigate('/supervisor'), 1500);
      } else {
        toast.success('Registration successful!');
        navigate('/student');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please check your information.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { id: 'student', label: 'Undergraduate', icon: GraduationCap },
    { id: 'supervisor', label: 'Academic Staff', icon: UserCheck },
    { id: 'head', label: 'Faculty Head', icon: Building2 },
    { id: 'employer', label: 'Industry Employer', icon: Briefcase },
  ];

  return (
    <div className="relative min-h-[calc(100vh-4rem)] py-10 px-4 sm:px-6 lg:px-8">
      <PageBackground variant="register" />
      <div className="sm:mx-auto sm:w-full sm:max-w-3xl text-center mb-6 relative z-10 animate-applePageEnter">
        <InterlinkLogo className="w-12 h-12 mb-3 mx-auto" />
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">Create an Interlink Account</h1>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
          National University Internship & Placement Platform
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-3xl relative z-10 animate-applePageEnter">
        <div className="glass-form py-8 px-6 sm:px-10 rounded-2xl shadow-glass-floating">
          {/* Segmented Role Selector */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
              Select Stakeholder Role
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 glass-secondary rounded-2xl">
              {roles.map((r) => {
                const Icon = r.icon;
                const isSelected = role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`btn-press flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-medium transition-all duration-200 ${
                      isSelected
                        ? 'bg-white dark:bg-white/20 text-neutral-900 dark:text-white shadow-glass-sm font-semibold border border-white/60 dark:border-white/20'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-neutral-400'}`} />
                    <span>{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="mb-5 glass-card bg-rose-500/10 dark:bg-rose-950/40 border border-rose-500/30 text-rose-700 dark:text-rose-300 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-5 glass-card bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{success}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* HEAD */}
            {role === 'head' && (
              <div className="space-y-4">
                <div className="glass-secondary p-4 rounded-2xl border border-blue-500/20 bg-blue-500/5 text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  <span className="font-semibold text-neutral-900 dark:text-white">Faculty Leadership Registration:</span> Authorized Deans and Department Heads can register institution profiles. Admin authorization is required prior to faculty supervision activities.
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                      University (Select from Master Registry) *
                    </label>
                    <select
                      name="universityName"
                      required
                      value={formData.universityName}
                      onChange={handleChange}
                      className="glass-input w-full h-11 px-3.5 rounded-xl text-sm font-medium text-neutral-900 dark:text-white"
                    >
                      {masterUnis.map((u, i) => (
                        <option key={i} value={u.name} className="dark:bg-neutral-900">{u.name} ({u.type})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Applier Full Name *</label>
                    <input type="text" name="name" required placeholder="Prof. Ananda Jayawardena" value={formData.name} onChange={handleChange} className="glass-input w-full h-11 px-3.5 rounded-xl text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Designation / Position *</label>
                    <input type="text" name="applierPosition" required placeholder="Dean / HOD" value={formData.applierPosition} onChange={handleChange} className="glass-input w-full h-11 px-3.5 rounded-xl text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Official University Email *</label>
                    <input type="email" name="email" required placeholder="dean@fot.ruh.ac.lk" value={formData.email} onChange={handleChange} className="glass-input w-full h-11 px-3.5 rounded-xl text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Official Contact Number *</label>
                    <input type="text" name="phone" required placeholder="+94 41 222 3333" value={formData.phone} onChange={handleChange} className="glass-input w-full h-11 px-3.5 rounded-xl text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Password *</label>
                    <input type="password" name="password" required placeholder="••••••••" value={formData.password} onChange={handleChange} className="glass-input w-full h-11 px-3.5 rounded-xl text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400" />
                  </div>
                </div>
              </div>
            )}
            {/* SUPERVISOR */}
            {role === 'supervisor' && (
              <div className="space-y-4">
                <div className="glass-secondary p-4 rounded-2xl border border-blue-500/20 bg-blue-500/5 text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  <span className="font-semibold text-neutral-900 dark:text-white">Academic Supervisor Registration:</span> Register with your faculty staff number. A join authorization request will be transmitted to your University Head.
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Supervisor Full Name *</label>
                    <input type="text" name="name" required placeholder="Dr. Kasun Wickramasinghe" value={formData.name} onChange={handleChange} className="glass-input w-full h-11 px-3.5 rounded-xl text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Assigned University *</label>
                    <select name="universityId" required value={formData.universityId} onChange={handleChange} className="glass-input w-full h-11 px-3.5 rounded-xl text-sm font-medium text-neutral-900 dark:text-white">
                      {approvedUnis.map((u) => (
                        <option key={u._id} value={u._id} className="dark:bg-neutral-900">{u.name} ({u.code})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">University Position *</label>
                    <input type="text" name="position" required placeholder="Senior Lecturer / Lecturer" value={formData.position} onChange={handleChange} className="glass-input w-full h-11 px-3.5 rounded-xl text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Academic Staff Reg No *</label>
                    <input type="text" name="staffRegNo" required placeholder="STAFF/RUH/FOT/042" value={formData.staffRegNo} onChange={handleChange} className="glass-input w-full h-11 px-3.5 rounded-xl text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">University Email (Verification & Login) *</label>
                    <input type="email" name="email" required placeholder="kasun.w@fot.ruh.ac.lk" value={formData.email} onChange={handleChange} className="glass-input w-full h-11 px-3.5 rounded-xl text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Personal Email (Optional - can also log in with this)</label>
                    <input type="email" name="personalEmail" placeholder="kasun.personal@gmail.com" value={formData.personalEmail} onChange={handleChange} className="glass-input w-full h-11 px-3.5 rounded-xl text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Contact Number *</label>
                    <input type="text" name="phone" required placeholder="+94 71 888 9999" value={formData.phone} onChange={handleChange} className="glass-input w-full h-11 px-3.5 rounded-xl text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Password *</label>
                    <input type="password" name="password" required placeholder="••••••••" value={formData.password} onChange={handleChange} className="glass-input w-full h-11 px-3.5 rounded-xl text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400" />
                  </div>
                </div>
                <div className="flex items-center gap-2.5 p-3.5 glass-secondary rounded-xl">
                  <input type="checkbox" id="autoSend" name="autoSendJoinRequest" checked={formData.autoSendJoinRequest} onChange={handleChange} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 accent-blue-600" />
                  <label htmlFor="autoSend" className="text-xs font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer">
                    Automatically route join request to University Head upon registration
                  </label>
                </div>
              </div>
            )}

            {/* STUDENT */}
            {role === 'student' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Full Name *</label>
                    <input type="text" name="name" required placeholder="E. Tharinda Gimhana" value={formData.name} onChange={handleChange} className="glass-input w-full h-11 px-3.5 rounded-xl text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Enrolled University *</label>
                    <select name="universityId" required value={formData.universityId} onChange={handleChange} className="glass-input w-full h-11 px-3.5 rounded-xl text-sm font-medium text-neutral-900 dark:text-white">
                      {approvedUnis.map((u) => (
                        <option key={u._id} value={u._id} className="dark:bg-neutral-900">{u.name} ({u.code})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Student Reg No *</label>
                    <input type="text" name="studentRegNo" required placeholder="TG/2023/1704" value={formData.studentRegNo} onChange={handleChange} className="glass-input w-full h-11 px-3.5 rounded-xl text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Current Living City *</label>
                    <input type="text" name="livingCity" required placeholder="Matara / Colombo" value={formData.livingCity} onChange={handleChange} className="glass-input w-full h-11 px-3.5 rounded-xl text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">University / Institutional Email *</label>
                    <input type="email" name="email" required placeholder="tharinda.g@fot.ruh.ac.lk" value={formData.email} onChange={handleChange} className="glass-input w-full h-11 px-3.5 rounded-xl text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Personal Email (Optional - can also log in with this)</label>
                    <input type="email" name="personalEmail" placeholder="tharinda.personal@gmail.com" value={formData.personalEmail} onChange={handleChange} className="glass-input w-full h-11 px-3.5 rounded-xl text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Phone Number *</label>
                    <input type="text" name="phone" required placeholder="+94 76 987 6543" value={formData.phone} onChange={handleChange} className="glass-input w-full h-11 px-3.5 rounded-xl text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Degree Program *</label>
                    <input type="text" name="degreeProgram" required placeholder="BICT (Hons)" value={formData.degreeProgram} onChange={handleChange} className="glass-input w-full h-11 px-3.5 rounded-xl text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Primary Discipline *</label>
                    <select name="mainCategory" value={formData.mainCategory} onChange={handleChange} className="glass-input w-full h-11 px-3.5 rounded-xl text-sm font-medium text-neutral-900 dark:text-white">
                      <option value="IT" className="dark:bg-neutral-900">IT</option>
                      <option value="Agriculture" className="dark:bg-neutral-900">Agriculture</option>
                      <option value="Science" className="dark:bg-neutral-900">Science & Biology</option>
                      <option value="Art" className="dark:bg-neutral-900">Art & Design</option>
                      <option value="Engineering" className="dark:bg-neutral-900">Engineering</option>
                      <option value="Management" className="dark:bg-neutral-900">Management / Documentation</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Target Field of Specialization *</label>
                    <input type="text" name="desiredField" required placeholder="Full-Stack Web Engineering" value={formData.desiredField} onChange={handleChange} className="glass-input w-full h-11 px-3.5 rounded-xl text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Work Preference *</label>
                    <select name="workType" value={formData.workType} onChange={handleChange} className="glass-input w-full h-11 px-3.5 rounded-xl text-sm font-medium text-neutral-900 dark:text-white">
                      <option value="Hybrid" className="dark:bg-neutral-900">Hybrid</option>
                      <option value="Remote" className="dark:bg-neutral-900">Remote</option>
                      <option value="Onsite" className="dark:bg-neutral-900">Onsite</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Availability *</label>
                    <select name="availability" value={formData.availability} onChange={handleChange} className="glass-input w-full h-11 px-3.5 rounded-xl text-sm font-medium text-neutral-900 dark:text-white">
                      <option value="Full-Time" className="dark:bg-neutral-900">Full-Time</option>
                      <option value="Part-Time" className="dark:bg-neutral-900">Part-Time</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Current GPA</label>
                    <input type="text" name="gpa" placeholder="3.82" value={formData.gpa} onChange={handleChange} className="glass-input w-full h-11 px-3.5 rounded-xl text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400" />
                  </div>
                  <div className="sm:col-span-2 glass-secondary p-3.5 rounded-xl border border-white/60 dark:border-white/10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                      <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>Profile Picture</span>
                      </label>
                      <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
                        Optional &bull; You can also upload later in your account
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Avatar preview */}
                      <div className="relative w-14 h-14 rounded-2xl overflow-hidden glass-primary flex items-center justify-center border border-white/80 dark:border-white/20 shadow-glass-sm shrink-0">
                        {previewPic || formData.profilePic ? (
                          <img
                            src={previewPic || formData.profilePic}
                            alt="Profile Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-neutral-400 dark:text-neutral-500" />
                        )}
                        {uploadingPic && (
                          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          </div>
                        )}
                      </div>

                      {/* Upload Controls */}
                      <div className="flex flex-col gap-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <label className="btn-liquid-primary cursor-pointer text-xs font-semibold px-3.5 py-1.5 rounded-xl inline-flex items-center gap-1.5 shadow-glass-sm">
                            <Upload className="w-3.5 h-3.5" />
                            <span>{formData.profilePic ? 'Change Image' : 'Upload Image'}</span>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp,image/gif"
                              onChange={handleImageFileChange}
                              className="hidden"
                              disabled={uploadingPic}
                            />
                          </label>

                          {(previewPic || formData.profilePic) && (
                            <button
                              type="button"
                              onClick={handleRemoveImage}
                              className="btn-liquid p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-xl transition border border-transparent hover:border-rose-500/20"
                              title="Remove photo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                          Supports JPG, PNG, WEBP or GIF up to 5MB
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">LinkedIn Profile</label>
                    <input type="url" name="linkedinUrl" placeholder="https://linkedin.com/in/..." value={formData.linkedinUrl} onChange={handleChange} className="glass-input w-full h-11 px-3.5 rounded-xl text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">GitHub / Code Repository</label>
                    <input type="url" name="githubUrl" placeholder="https://github.com/..." value={formData.githubUrl} onChange={handleChange} className="glass-input w-full h-11 px-3.5 rounded-xl text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Portfolio Link</label>
                    <input type="url" name="portfolioUrl" placeholder="https://portfolio.dev" value={formData.portfolioUrl} onChange={handleChange} className="glass-input w-full h-11 px-3.5 rounded-xl text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Account Password *</label>
                    <input type="password" name="password" required placeholder="••••••••" value={formData.password} onChange={handleChange} className="glass-input w-full h-11 px-3.5 rounded-xl text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400" />
                  </div>
                </div>
              </div>
            )}

            {/* EMPLOYER */}
            {role === 'employer' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Company Legal Name *</label>
                    <input type="text" name="companyName" required placeholder="Virtusa Sri Lanka" value={formData.companyName} onChange={handleChange} className="glass-input w-full h-11 px-3.5 rounded-xl text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Industry Sector *</label>
                    <select name="companyCategory" value={formData.companyCategory} onChange={handleChange} className="glass-input w-full h-11 px-3.5 rounded-xl text-sm font-medium text-neutral-900 dark:text-white">
                      <option value="IT sector" className="dark:bg-neutral-900">IT sector</option>
                      <option value="Biology" className="dark:bg-neutral-900">Biology & Science</option>
                      <option value="Documentation" className="dark:bg-neutral-900">Documentation & Management</option>
                      <option value="Agriculture" className="dark:bg-neutral-900">Agriculture</option>
                      <option value="Engineering" className="dark:bg-neutral-900">Engineering</option>
                      <option value="Finance" className="dark:bg-neutral-900">Finance</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Corporate Email Address *</label>
                    <input type="email" name="email" required placeholder="careers@virtusa.com" value={formData.email} onChange={handleChange} className="glass-input w-full h-11 px-3.5 rounded-xl text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Corporate Contact Number *</label>
                    <input type="text" name="phone" required placeholder="+94 11 472 8000" value={formData.phone} onChange={handleChange} className="glass-input w-full h-11 px-3.5 rounded-xl text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Recruiter Full Name *</label>
                    <input type="text" name="name" required placeholder="Kasun Wijesinghe" value={formData.name} onChange={handleChange} className="glass-input w-full h-11 px-3.5 rounded-xl text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Recruiter Designation *</label>
                    <input type="text" name="recruiterDesignation" required placeholder="Senior Talent Acquisition Lead" value={formData.recruiterDesignation} onChange={handleChange} className="glass-input w-full h-11 px-3.5 rounded-xl text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Intern Recruitment Scope *</label>
                    <input type="text" name="recruitmentArea" required placeholder="Western Province / Islandwide" value={formData.recruitmentArea} onChange={handleChange} className="glass-input w-full h-11 px-3.5 rounded-xl text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Recruiter Direct Phone (Optional)</label>
                    <input type="text" name="recruiterContactNumber" placeholder="+94 77 111 2222" value={formData.recruiterContactNumber} onChange={handleChange} className="glass-input w-full h-11 px-3.5 rounded-xl text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Business Registration Number (BRN) *</label>
                    <input type="text" name="businessRegNumber" required placeholder="PV-10492-SL" value={formData.businessRegNumber} onChange={handleChange} className="glass-input w-full h-11 px-3.5 rounded-xl text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Tax Identification Number (TIN)</label>
                    <input type="text" name="taxId" placeholder="TIN-98234123" value={formData.taxId} onChange={handleChange} className="glass-input w-full h-11 px-3.5 rounded-xl text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Company Website</label>
                    <input type="url" name="companyWebsite" placeholder="https://www.virtusa.com" value={formData.companyWebsite} onChange={handleChange} className="glass-input w-full h-11 px-3.5 rounded-xl text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Recruiter LinkedIn Profile</label>
                    <input type="url" name="recruiterLinkedin" placeholder="https://linkedin.com/in/..." value={formData.recruiterLinkedin} onChange={handleChange} className="glass-input w-full h-11 px-3.5 rounded-xl text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Account Password *</label>
                    <input type="password" name="password" required placeholder="••••••••" value={formData.password} onChange={handleChange} className="glass-input w-full h-11 px-3.5 rounded-xl text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400" />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-liquid-primary w-full h-11 mt-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-glass-sm"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Submit {roles.find((r) => r.id === role)?.label} Registration</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-neutral-500 dark:text-neutral-400">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}