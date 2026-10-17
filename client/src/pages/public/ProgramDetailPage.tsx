import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Clock,
  Calendar,
  Monitor,
  Award,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  ArrowLeft,
  Users,
  Layers,
  BookOpen,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { api } from '../../services/api';
import { Program } from '../../types';
import { BookDemoModal } from '../../components/modals/BookDemoModal';

export const ProgramDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [program, setProgram] = useState<Program | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'learn' | 'curriculum' | 'faq'>('overview');
  const [openMonth, setOpenMonth] = useState<number | null>(1);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fallbackPrograms: Record<string, Program> = {
    'classes-6-7': {
      id: 'classes-6-7',
      name: 'Foundation Level',
      slug: 'classes-6-7',
      gradeLevel: 'Classes 6–7',
      tagline: 'Build curiosity, creativity and strong digital basics from an early age.',
      description: 'A 3-month practical foundation introducing young students to how AI tools work, coding fundamentals through fun interactive activities, creative video editing, digital safety, and introductory freelancing concepts.',
      durationMonths: 3,
      sessionDurationMinutes: 45,
      mode: '100% Online via ALYSTRO App',
      schedule: 'Monday to Friday (Saturday & Sunday Off)',
      status: 'PUBLISHED',
      features: [
        'What is AI and how AI tools work',
        'Basic & safe use of AI tools',
        'Coding fundamentals through fun activities',
        'Basic video editing & creative content making',
        'Digital safety and responsible internet use',
        'Small practical projects & intro to freelancing',
      ],
      learningOutcomes: [
        'Understand what AI is and how everyday AI tools work safely',
        'Develop computational thinking and basic logic using creative coding activities',
        'Create simple video reels and creative content with transitions and music',
        'Browse the internet responsibly with strong digital safety habits',
        'Build and showcase first mini-projects with classmates',
      ],
      syllabus: [
        {
          month: 1,
          title: 'Curiosity & Digital Fundamentals',
          description: 'Introduction to technology, safe digital habits, and fun visual coding concepts.',
          topics: [
            'Welcome to ALYSTRO: The Digital World & What is AI?',
            'Safe Internet Use & Digital Citizenship',
            'Logical Thinking & Fun Block Coding Games',
            'Exploring Generative AI Tools safely for school projects',
          ],
        },
        {
          month: 2,
          title: 'Creative Content & Basic Video Editing',
          description: 'Hands-on storytelling, video cutting, transitions, and audio balancing.',
          topics: [
            'Storyboarding & Creative Content Planning',
            'Basic Video Cutting, Trimming & Splitting on Mobile/PC',
            'Adding Music, Sound Effects & Subtitles',
            'Making an Educational Explainer Video',
          ],
        },
        {
          month: 3,
          title: 'Mini Projects, Digital Showcase & Freelancing Intro',
          description: 'Applying skills to create real mini-projects and understand future opportunities.',
          topics: [
            'Building a Simple Interactive Quiz/Game',
            'Introduction to Digital Work & What Freelancing Means',
            'Final Practical Project Preparation',
            'Student Showcase, Certificate Award & Parent Progress Report',
          ],
        },
      ],
    },
    'classes-8-10': {
      id: 'classes-8-10',
      name: 'Skill Development Level',
      slug: 'classes-8-10',
      gradeLevel: 'Classes 8–10',
      tagline: 'Turn technology into practical skills and creative opportunities.',
      description: 'Designed for middle to high school students to master smart AI prompting, hands-on coding with real logic, professional video editing techniques, digital research, and freelancing portfolio basics.',
      durationMonths: 3,
      sessionDurationMinutes: 45,
      mode: '100% Online via ALYSTRO App',
      schedule: 'Monday to Friday (Saturday & Sunday Off)',
      status: 'PUBLISHED',
      features: [
        'AI tools and smart prompting techniques',
        'Practical coding and small projects',
        'Video editing and content creation',
        'Research & productivity using digital tools',
        'Freelancing basics & portfolio concepts',
        'Weekly practical assignments',
      ],
      learningOutcomes: [
        'Write advanced, structured AI prompts for study, research, and ideation',
        'Build working code scripts and real mini web or game applications',
        'Edit engaging reels, YouTube-style explainers, and dynamic videos',
        'Assemble a digital project showcase portfolio',
        'Understand client work, freelance platforms, and online ethical opportunities',
      ],
      syllabus: [
        {
          month: 1,
          title: 'Smart AI Prompting & Digital Productivity',
          description: 'Supercharging research, writing, and problem-solving with AI.',
          topics: [
            'Advanced AI Models & Multi-modal Intelligence',
            'Smart Prompt Engineering: Few-shot, persona & chain-of-thought',
            'AI-driven Research, Fact-checking & Productivity Workflows',
            'AI Graphics & Visual Asset Creation',
          ],
        },
        {
          month: 2,
          title: 'Practical Coding & Web Logic',
          description: 'Building interactive projects from scratch.',
          topics: [
            'Modern Coding Architecture & Programming Logic',
            'Building Responsive Web Interfaces & Interactive Components',
            'Algorithmic Thinking & Mini App Development',
            'Publishing and Hosting Your First Live Project',
          ],
        },
        {
          month: 3,
          title: 'Video Creation, Freelancing & Portfolio Building',
          description: 'Creating high-production content and establishing digital presence.',
          topics: [
            'Dynamic Video Editing: Keyframes, B-roll & Audio Mixing',
            'Freelancing Platforms, Freelancer Mindset & In-demand Gigs',
            'Creating Your First Digital Client Portfolio Deck',
            'Graduation Project Presentation & Certification',
          ],
        },
      ],
    },
    'classes-11-12': {
      id: 'classes-11-12',
      name: 'Advanced & Career Ready',
      slug: 'classes-11-12',
      gradeLevel: 'Classes 11–12',
      tagline: 'Prepare for higher studies, digital careers, freelancing and future opportunities.',
      description: 'A comprehensive pre-college accelerator equipping senior students with advanced AI workflows, real-world fullstack/Python project development, commercial video production, and actionable freelancing with client communication.',
      durationMonths: 3,
      sessionDurationMinutes: 45,
      mode: '100% Online via ALYSTRO App',
      schedule: 'Monday to Friday (Saturday & Sunday Off)',
      status: 'PUBLISHED',
      features: [
        'Advanced AI tools and productivity techniques',
        'Coding with real-world projects',
        'Professional video editing & content creation',
        'Portfolio building for digital careers',
        'Freelancing, client communication & project management',
        'Career-focused digital skills',
      ],
      learningOutcomes: [
        'Deploy enterprise-grade AI tools and automated workflow solutions',
        'Architect and ship production-ready coding projects with modern stacks',
        'Produce cinematic, commercial-grade video edits with advanced color & audio',
        'Establish an active freelance profile with pitch decks and proposals',
        'Acquire high-demand digital skills for university and early freelance earnings',
      ],
      syllabus: [
        {
          month: 1,
          title: 'Advanced AI Architecture & Career Productivity',
          description: 'Leveraging AI for high-velocity creation and career readiness.',
          topics: [
            'State-of-the-Art Generative AI & Automation Stacks',
            'Prompt Engineering for Software, Research & Content Pipelines',
            'AI Workflow Automation & Integration Tools',
            'Intellectual Property, Ethics & Professional Digital Standards',
          ],
        },
        {
          month: 2,
          title: 'Fullstack Project Coding & Systems',
          description: 'Building and deploying end-to-end applications.',
          topics: [
            'Fullstack Web Architecture & Real-world Project Structure',
            'Working with APIs, Data Pipelines & Cloud Deployment',
            'Version Control (Git/GitHub) & Collaborative Development',
            'Deploying Live Web Projects to Global CDN',
          ],
        },
        {
          month: 3,
          title: 'Commercial Video, Client Management & Freelancing Launch',
          description: 'Winning clients, delivering projects, and commercial content editing.',
          topics: [
            'Commercial Video Editing: Color grading, pacing & motion graphics',
            'Client Acquisition, Proposal Writing & Pricing Strategies',
            'Project Management, Delivery Standards & Client Feedback Loops',
            'Capstone Presentation, Certificate of Completion & Career Guidance',
          ],
        },
      ],
    },
  };

  const formatGradeLevel = (gl?: string) => {
    if (!gl) return '';
    if (gl === 'CLASS_6_8' || gl === 'CLASS_6_7') return 'Classes 6–7';
    if (gl === 'CLASS_8_10' || gl === 'CLASS_9_10') return 'Classes 8–10';
    if (gl === 'CLASS_11_12') return 'Classes 11–12';
    return gl.replace('CLASS_', 'Classes ').replace('_', '–');
  };

  useEffect(() => {
    async function loadProgram() {
      try {
        const res = await api.get(`/programs/${slug}`);
        if (res.success && res.data) {
          setProgram(res.data);
          setIsLoading(false);
          return;
        }
      } catch (e) {
        console.error(e);
      }

      // Check fallback data
      if (slug && fallbackPrograms[slug]) {
        setProgram(fallbackPrograms[slug]);
      } else if (slug?.includes('6-8') || slug?.includes('6-7')) {
        setProgram(fallbackPrograms['classes-6-7']);
      } else if (slug?.includes('8-10') || slug?.includes('9-10')) {
        setProgram(fallbackPrograms['classes-8-10']);
      } else if (slug?.includes('11-12')) {
        setProgram(fallbackPrograms['classes-11-12']);
      }
      setIsLoading(false);
    }
    loadProgram();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500" />
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-slate-50 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Program Not Found</h2>
        <Link to="/programs" className="text-brand-600 font-semibold mt-4 inline-block">
          ← Back to Programs Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/programs" className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-brand-600 mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to All Programs
        </Link>

        {/* Program Hero (Matching Screen 3) */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft p-6 sm:p-10 mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <Badge variant="primary" className="mb-3">
                {formatGradeLevel(program.gradeLevel)}
              </Badge>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-950 font-display mb-2">
                {program.name}
              </h1>
              <p className="text-sm sm:text-base font-semibold text-brand-600 mb-4">{program.tagline}</p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-8">
                {program.description}
              </p>

              {/* 4 Feature Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-100">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 text-center">
                  <Clock className="w-5 h-5 text-brand-500 mx-auto mb-1" />
                  <p className="text-[11px] text-slate-400 font-medium">Duration</p>
                  <p className="text-xs font-bold text-slate-800">{program.durationMonths} Months</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 text-center">
                  <Calendar className="w-5 h-5 text-brand-500 mx-auto mb-1" />
                  <p className="text-[11px] text-slate-400 font-medium">Session</p>
                  <p className="text-xs font-bold text-slate-800">{program.sessionDurationMinutes} Minutes</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 text-center">
                  <Monitor className="w-5 h-5 text-brand-500 mx-auto mb-1" />
                  <p className="text-[11px] text-slate-400 font-medium">Mode</p>
                  <p className="text-xs font-bold text-slate-800">{program.mode}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 text-center">
                  <Award className="w-5 h-5 text-brand-500 mx-auto mb-1" />
                  <p className="text-[11px] text-slate-400 font-medium">Certificate</p>
                  <p className="text-xs font-bold text-slate-800">On Completion</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-md">
                <img
                  src={
                    slug === 'classes-6-7'
                      ? '/images/indian_students_learning.jpg'
                      : slug === 'classes-11-12'
                      ? '/images/indian_tech_trainer.jpg'
                      : '/images/indian_classroom_workshop.jpg'
                  }
                  alt={program.name}
                  className="w-full h-72 object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-slate-200 mb-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-4 text-sm font-bold border-b-2 transition ${
                activeTab === 'overview'
                  ? 'border-brand-500 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('learn')}
              className={`pb-4 text-sm font-bold border-b-2 transition ${
                activeTab === 'learn'
                  ? 'border-brand-500 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              What You'll Learn
            </button>
            <button
              onClick={() => setActiveTab('curriculum')}
              className={`pb-4 text-sm font-bold border-b-2 transition ${
                activeTab === 'curriculum'
                  ? 'border-brand-500 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Curriculum Modules
            </button>
          </div>
        </div>

        {/* Tab Content 1: Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-soft">
              <h3 className="text-xl font-bold text-navy-950 mb-3">Program Overview</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                {program.description}
              </p>
              <h4 className="text-base font-bold text-navy-950 mb-2">Who Is It For?</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Students of {formatGradeLevel(program.gradeLevel)} eager to
                build real digital skills and creative confidence.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-soft">
              <h3 className="text-xl font-bold text-navy-950 mb-4">Key Learning Outcomes</h3>
              <ul className="space-y-3">
                {program.learningOutcomes?.map((outcome, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Tab Content 2: What You'll Learn */}
        {activeTab === 'learn' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {program.features?.map((feat, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-soft flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 font-bold">
                  {idx + 1}
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 mb-1">{feat}</h4>
                  <p className="text-xs text-slate-500">Mastered through hands-on guided mentor workshops and practical student submissions.</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab Content 3: Curriculum Modules */}
        {activeTab === 'curriculum' && (
          <div className="space-y-4 max-w-4xl mb-16">
            {program.syllabus?.map((syl) => {
              const isOpen = openMonth === syl.month;
              return (
                <div key={syl.month} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-soft">
                  <button
                    type="button"
                    onClick={() => setOpenMonth(isOpen ? null : syl.month)}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-50 transition"
                  >
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                        Month {syl.month}
                      </span>
                      <h4 className="text-lg font-bold text-navy-950 mt-0.5">{syl.title}</h4>
                      {syl.description && <p className="text-xs text-slate-500 mt-1">{syl.description}</p>}
                    </div>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-brand-500' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="p-6 pt-0 border-t border-slate-100 bg-slate-50/50">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Topics Covered:</p>
                      <ul className="space-y-2">
                        {syl.topics.map((t, i) => (
                          <li key={i} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Booking Banner (Screen 3) */}
        <div className="bg-navy-950 text-white rounded-3xl p-8 sm:p-12 text-center">
          <h3 className="text-2xl sm:text-3xl font-extrabold font-display mb-3">
            Ready to bring this program to your school?
          </h3>
          <p className="text-slate-300 max-w-lg mx-auto text-xs sm:text-sm mb-6">
            Book a free demo session and let your students experience the future skills.
          </p>
          <Button variant="primary" size="lg" onClick={() => setDemoModalOpen(true)}>
            Book Free Demo
          </Button>
        </div>
      </div>

      <BookDemoModal isOpen={demoModalOpen} onClose={() => setDemoModalOpen(false)} />
    </div>
  );
};
