import React, { useState, useEffect } from 'react';
import api from '../api/client';
import {
  X,
  Calendar,
  Clock,
  BookOpen,
  User,
  MapPin,
  Briefcase,
  Globe,
  FileText
} from 'lucide-react';

export default function StudentProgressModal({ studentId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!studentId) return;
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/students/${studentId}/logs`);
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch student progress logs');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [studentId]);

  const totalHours = data?.logs?.reduce((acc, curr) => acc + (curr.hoursWorked || 0), 0) || 0;
  const p = data?.profile;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/50 dark:bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card-elevated p-6 rounded-2xl max-w-3xl w-full shadow-card-elevated shadow-lg overflow-hidden animate-modal"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200/60 dark:border-white/10 flex justify-between items-start">
          <div className="flex items-start gap-4">
            {p?.profilePic ? (
              <img
                src={p.profilePic}
                alt={data?.student?.name}
                className="w-14 h-14 rounded-2xl object-cover border border-white/40 dark:border-white/10 shadow-xs"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-surface-hover flex items-center justify-center text-text-muted border border-border-subtle shadow-xs">
                <User className="w-7 h-7" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold tracking-tight text-text-primary">{data?.student?.name || 'Undergraduate Profile'}</h2>
                {p?.gpa && (
                  <span className="bg-secondary text-text-secondary border border-border-subtle rounded-full text-xs text-text-primary font-semibold px-2.5 py-0.5 tabular-nums">
                    GPA {p.gpa}
                  </span>
                )}
              </div>
              <p className="text-xs text-text-muted mt-1 font-medium tracking-tight">
                {p?.studentRegNo || 'Reg Pending'} • {p?.universityId?.name || 'Registered University'}
              </p>
              {p?.desiredField && (
                <div className="text-xs text-text-primary font-medium mt-1.5 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-primary dark:text-brand-400" />
                  Target Field: <span className="text-brand-700 dark:text-brand-400 font-semibold">{p.desiredField}</span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="transition-transform active:scale-95 text-slate-400 dark:text-text-disabled hover:text-slate-700 dark:hover:text-white p-2 rounded-full hover:bg-surface-hover transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          {loading ? (
            <div className="py-12 flex justify-center items-center">
              <div className="h-7 w-7 border-2 border-brand-500/30 border-t-brand-600 dark:border-t-brand-400 rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="badge-error p-4 rounded-2xl text-xs sm:text-sm">
              {error}
            </div>
          ) : (
            <>
              {/* Metadata Details Grid */}
              <div className="card p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-text-muted font-medium block">Living City</span>
                  <span className="font-semibold text-slate-800 dark:text-neutral-200 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-primary" /> {p?.livingCity || data?.student?.livingCity || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-text-muted font-medium block">Category</span>
                  <span className="font-semibold text-brand-700 dark:text-brand-400 mt-0.5 inline-block">{p?.mainCategory || 'IT'}</span>
                </div>
                <div>
                  <span className="text-text-muted font-medium block">Work Preference</span>
                  <span className="font-semibold text-slate-800 dark:text-neutral-200 mt-0.5 inline-block">
                    {p?.workType || 'Hybrid'} • {p?.availability || 'Full-Time'}
                  </span>
                </div>
                <div>
                  <span className="text-text-muted font-medium block">Total Verified Hours</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm mt-0.5 inline-block tabular-nums">{totalHours} Hours</span>
                </div>

                <div className="col-span-2 sm:col-span-4 border-t border-slate-200/60 dark:border-white/10 pt-3.5 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    {p?.linkedinUrl && (
                      <a href={p.linkedinUrl} target="_blank" rel="noreferrer" className="transition-transform active:scale-95 inline-flex items-center gap-1 text-text-primary hover:text-primary dark:hover:text-brand-400 font-medium text-xs">
                        LinkedIn
                      </a>
                    )}
                    {p?.githubUrl && (
                      <a href={p.githubUrl} target="_blank" rel="noreferrer" className="transition-transform active:scale-95 inline-flex items-center gap-1 text-text-primary hover:text-slate-900 dark:hover:text-white font-medium text-xs">
                        GitHub
                      </a>
                    )}
                    {p?.portfolioUrl && (
                      <a href={p.portfolioUrl} target="_blank" rel="noreferrer" className="transition-transform active:scale-95 inline-flex items-center gap-1 text-text-primary hover:text-primary dark:hover:text-brand-400 font-medium text-xs">
                        <Globe className="w-3.5 h-3.5" /> Portfolio
                      </a>
                    )}
                  </div>

                  {p?.cvUrl && (
                    <a
                      href={p.cvUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-primary inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold"
                    >
                      <FileText className="w-3.5 h-3.5" /> View Uploaded CV
                    </a>
                  )}
                </div>

                {p?.bio && (
                  <div className="col-span-2 sm:col-span-4 text-slate-600 dark:text-neutral-300 bg-white/40 dark:bg-black/40 p-3.5 rounded-xl border border-white/40 dark:border-white/10 text-xs leading-relaxed">
                    "{p.bio}"
                  </div>
                )}
              </div>

              {/* Daily Progress Logs */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold tracking-tight text-text-primary flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary dark:text-brand-400" />
                    Daily Progress Diary
                    <span className="text-xs font-normal text-text-muted tabular-nums">({data?.logs?.length || 0} entries)</span>
                  </h3>
                  <span className="text-xs text-text-muted">
                    Logged internship hours & tasks
                  </span>
                </div>

                {data?.logs?.length === 0 ? (
                  <div className="card text-center py-10 text-text-muted border border-dashed border-slate-200 dark:border-white/10 rounded-2xl text-xs">
                    No progress logs submitted yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.logs.map((log) => (
                      <div key={log._id} className="card p-4 space-y-2.5 transition-all hover:scale-[1.008]">
                        <div className="flex justify-between items-center text-xs border-b border-slate-200/50 dark:border-white/10 pb-2">
                          <span className="flex items-center gap-1.5 font-semibold text-text-primary tabular-nums">
                            <Calendar className="w-3.5 h-3.5 text-primary" />
                            {new Date(log.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                          <span className="bg-secondary text-text-secondary border border-border-subtle rounded-full text-[11px] font-semibold text-text-primary px-2.5 py-0.5 tabular-nums">
                            {log.hoursWorked || 8} hrs
                          </span>
                        </div>
                        <div className="text-xs text-text-primary whitespace-pre-line leading-relaxed">
                          {log.tasksCompleted}
                        </div>
                        {log.learnings && (
                          <div className="text-[11px] bg-white/40 dark:bg-black/40 text-slate-600 dark:text-neutral-300 p-2.5 rounded-xl border border-white/40 dark:border-white/10 flex items-start gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                            <div>
                              <span className="font-semibold text-slate-800 dark:text-neutral-200">Learnings: </span>
                              {log.learnings}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200/60 dark:border-white/10 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="transition-transform active:scale-95 px-5 py-2 text-xs font-semibold bg-secondary text-text-secondary border border-border-subtle rounded-full text-slate-700 dark:text-neutral-200 hover:bg-surface-hover transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

