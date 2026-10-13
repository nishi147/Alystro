import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Calendar,
  Video,
  FileText,
  Award,
  CheckCircle2,
  Clock,
  ExternalLink,
  Upload,
  Sparkles,
  CheckSquare,
  HelpCircle,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { api } from '../../services/api';
import { Assignment, Quiz, Certificate } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [attendanceSummary, setAttendanceSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Assignment Submission State
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quiz Taking Modal State
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [quizResult, setQuizResult] = useState<any | null>(null);

  const loadData = async () => {
    try {
      const [asgRes, quizRes, certRes, attRes] = await Promise.all([
        api.get('/assignments'),
        api.get('/quizzes'),
        api.get('/certificates'),
        api.get('/attendance/student/self'),
      ]);

      if (asgRes.success) setAssignments(asgRes.data || []);
      if (quizRes.success) setQuizzes(quizRes.data || []);
      if (certRes.success) setCertificates(certRes.data || []);
      if (attRes.success) setAttendanceSummary(attRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenSubmit = (asg: Assignment) => {
    setSelectedAssignment(asg);
    setSubmissionUrl(asg.userSubmission?.fileUrl || '');
    setSubmissionNotes(asg.userSubmission?.notes || '');
    setSubmitModalOpen(true);
  };

  const handleSendSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    setIsSubmitting(true);
    try {
      await api.post(`/assignments/${selectedAssignment._id}/submit`, {
        fileUrl: submissionUrl,
        notes: submissionNotes,
      });
      setSubmitModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error submitting assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartQuiz = (q: Quiz) => {
    setActiveQuiz(q);
    setSelectedAnswers(new Array(q.questions?.length || 0).fill(-1));
    setQuizResult(null);
    setQuizModalOpen(true);
  };

  const handleAnswerSelect = (qIdx: number, optIdx: number) => {
    const updated = [...selectedAnswers];
    updated[qIdx] = optIdx;
    setSelectedAnswers(updated);
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    try {
      const res = await api.post(`/quizzes/${activeQuiz._id}/attempt`, {
        answers: selectedAnswers,
      });
      if (res.success) {
        setQuizResult(res.data);
        loadData();
      }
    } catch (err: any) {
      alert(err.message || 'Error scoring quiz');
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Welcome Banner */}
      <div className="bg-navy-gradient text-white p-6 sm:p-8 rounded-3xl shadow-soft relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <Badge variant="navy" className="mb-2">Student Learning Space</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display">
            Welcome back, {user?.name}!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
            You are enrolled in the <strong className="text-brand-300">Foundation Program (AI & Digital Skills)</strong>.
            Continue working on your projects and attend your scheduled live session.
          </p>
        </div>
      </div>

      {/* Live Class Schedule & Attendance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Next Live Session Card */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded-md">
                Next Live Interactive Session
              </span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Live in 35 mins
              </span>
            </div>
            <h3 className="text-lg font-bold text-navy-950 mb-1">
              Class 6-8 AI Innovators: Advanced Storyboarding & Audio
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Mentor Rohit Verma • Mon, Wed, Fri (4:00 PM – 4:45 PM IST) • Online Video Meet
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">Join 5 mins before start</span>
            <a
              href="https://meet.google.com/aly-class6-live"
              target="_blank"
              rel="noreferrer"
            >
              <Button variant="primary" size="sm" leftIcon={<Video className="w-4 h-4" />}>
                Join Google Meet Class
              </Button>
            </a>
          </div>
        </div>

        {/* Attendance Rate */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-soft flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Class Attendance</span>
            <p className="text-3xl font-extrabold text-navy-950 font-display mt-2">
              {attendanceSummary?.attendanceRate ?? 94}%
            </p>
            <p className="text-xs text-emerald-600 font-semibold mt-1">✓ Eligible for Distinction Certificate</p>
          </div>
          <div className="pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              {attendanceSummary?.presentSessions ?? 12} of {attendanceSummary?.totalSessions ?? 13} sessions attended
            </span>
          </div>
        </div>
      </div>

      {/* Assignments & Quizzes Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Assignments */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-navy-950">Assignments & Projects</h3>
            <span className="text-xs font-semibold text-slate-400">{assignments.length} total</span>
          </div>

          <div className="space-y-3">
            {assignments.map((asg) => {
              const isGraded = asg.userSubmission?.status === 'GRADED';
              const isSubmitted = asg.userSubmission?.status === 'SUBMITTED';

              return (
                <div key={asg._id} className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-navy-950">{asg.title}</span>
                    {isGraded ? (
                      <Badge variant="success">
                        Graded: {asg.userSubmission.marksObtained}/{asg.totalMarks}
                      </Badge>
                    ) : isSubmitted ? (
                      <Badge variant="warning">Submitted (Under Review)</Badge>
                    ) : (
                      <Badge variant="neutral">Pending Submission</Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">{asg.description}</p>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-slate-400 font-mono">
                      Due: {new Date(asg.dueDate).toLocaleDateString()}
                    </span>
                    <Button variant="outline" size="sm" onClick={() => handleOpenSubmit(asg)}>
                      {isSubmitted ? 'Update Submission' : 'Submit Work'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quizzes & Practice Checkpoints */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-navy-950">Quizzes & Checkpoints</h3>
            <span className="text-xs font-semibold text-slate-400">{quizzes.length} available</span>
          </div>

          <div className="space-y-3">
            {quizzes.map((quiz) => (
              <div key={quiz._id} className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-navy-950">{quiz.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {quiz.questions?.length} Questions • {quiz.durationMinutes} Mins
                  </p>
                  {quiz.userResult && (
                    <span className="inline-block mt-1 text-[11px] font-bold text-emerald-600">
                      ✓ Score: {quiz.userResult.score}/{quiz.userResult.totalMarks} ({quiz.userResult.percentage}%)
                    </span>
                  )}
                </div>
                <Button variant="primary" size="sm" onClick={() => handleStartQuiz(quiz)}>
                  {quiz.userResult ? 'Retake Quiz' : 'Take Quiz'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Verified Certificates Ribbon */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-navy-950">My Issued Certificates</h3>
            <p className="text-xs text-slate-400">Verifiable credentials issued upon curriculum completion</p>
          </div>
          <Link to="/verify">
            <Button variant="outline" size="sm" leftIcon={<Award className="w-4 h-4" />}>
              Open Verification Portal
            </Button>
          </Link>
        </div>

        {certificates.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">Complete your 3-month capstone project to unlock your certificate.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certificates.map((cert) => (
              <div key={cert._id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                    {cert.certificateId}
                  </span>
                  <h4 className="text-sm font-bold text-navy-950 mt-1">{cert.programName}</h4>
                  <p className="text-xs text-emerald-600 font-semibold">{cert.grade}</p>
                </div>
                <Link to={`/verify/${cert.certificateId}`}>
                  <Button variant="outline" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                    View & Print
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Assignment Submission */}
      {selectedAssignment && (
        <Modal
          isOpen={submitModalOpen}
          onClose={() => setSubmitModalOpen(false)}
          title={`Submit: ${selectedAssignment.title}`}
          maxWidth="lg"
        >
          <form onSubmit={handleSendSubmission} className="space-y-4">
            <Input
              label="Project Link / Cloud URL (Google Drive, Canva, YouTube, etc.)"
              required
              placeholder="https://drive.google.com/..."
              value={submissionUrl}
              onChange={(e) => setSubmissionUrl(e.target.value)}
            />
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Notes for Mentor
              </label>
              <textarea
                rows={3}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                placeholder="Explain what tools you used and your creative thought process..."
                value={submissionNotes}
                onChange={(e) => setSubmissionNotes(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setSubmitModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                Submit Project
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Interactive Quiz Taker */}
      {activeQuiz && (
        <Modal
          isOpen={quizModalOpen}
          onClose={() => setQuizModalOpen(false)}
          title={activeQuiz.title}
          subtitle={`Pass Score: ${activeQuiz.passingScore}%`}
          maxWidth="xl"
        >
          {quizResult ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-navy-950 mb-1">
                {quizResult.passed ? 'Quiz Passed Successfully!' : 'Quiz Completed'}
              </h3>
              <p className="text-sm font-semibold text-slate-600">
                Score: {quizResult.score} / {quizResult.totalMarks} ({quizResult.percentage}%)
              </p>
              <Button variant="primary" size="sm" onClick={() => setQuizModalOpen(false)} className="mt-6 px-8">
                Done
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {activeQuiz.questions?.map((q, qIdx) => (
                <div key={qIdx} className="space-y-2 text-left">
                  <p className="text-xs font-bold text-slate-900">
                    {qIdx + 1}. {q.questionText}
                  </p>
                  <div className="space-y-1.5">
                    {q.options?.map((opt, optIdx) => (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleAnswerSelect(qIdx, optIdx)}
                        className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition ${
                          selectedAnswers[qIdx] === optIdx
                            ? 'bg-brand-50 border-brand-500 text-brand-700 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button variant="outline" size="sm" onClick={() => setQuizModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={handleSubmitQuiz}>
                  Submit Answers & Calculate Score
                </Button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};
