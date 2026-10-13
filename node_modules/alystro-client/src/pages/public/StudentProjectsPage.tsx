import React, { useState } from 'react';
import { Sparkles, Play, Eye, ExternalLink, Filter, Layers, Award } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';

export const StudentProjectsPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [selectedProject, setSelectedProject] = useState<any | null>(null);

  const projects = [
    {
      id: 1,
      title: 'AI Art Cyber Guardian',
      category: 'AI',
      grade: 'Class 6',
      student: 'Aarav Sharma',
      school: 'ABC International School',
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600',
      description: 'Generative AI artwork exploring clean energy and cyber-defense systems in futuristic smart cities.',
      tools: ['Midjourney', 'Canva', 'AI Prompt Engineering'],
    },
    {
      id: 2,
      title: 'Water Cycle Explainer Reel',
      category: 'VIDEO',
      grade: 'Class 8',
      student: 'Ananya Patel',
      school: 'ABC International School',
      thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&q=80&w=600',
      description: 'A 60-second animated reel explaining atmospheric condensation with multi-track sound effects.',
      tools: ['CapCut', 'Canva Animation', 'Audacity'],
    },
    {
      id: 3,
      title: 'Wildlife Conservation Infographic',
      category: 'CREATIVITY',
      grade: 'Class 7',
      student: 'Rohan Mehra',
      school: 'Delhi Public Modern School',
      thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=600',
      description: 'Digital poster highlighting endangered tiger habitats across Rajasthan national parks.',
      tools: ['Figma Basics', 'Smart AI Vector Tools'],
    },
    {
      id: 4,
      title: 'Historical AI Story Video',
      category: 'VIDEO',
      grade: 'Class 9',
      student: 'Diya Singhania',
      school: 'ABC International School',
      thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600',
      description: 'A narrative mini-documentary reconstructing Harappan trade routes using AI-generated avatars.',
      tools: ['Runway Gen-2', 'Premiere Rush', 'ElevenLabs Voiceover'],
    },
    {
      id: 5,
      title: 'Space Colonization Pitch Deck',
      category: 'PRESENTATIONS',
      grade: 'Class 8',
      student: 'Ishaan Verma',
      school: 'St. Xavier Tech Academy',
      thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=600',
      description: '10-slide interactive presentation designed for an interplanetary colony architecture competition.',
      tools: ['Google Slides AI', 'Digital Infographics'],
    },
    {
      id: 6,
      title: '60-Sec Physics Demonstration Reel',
      category: 'VIDEO',
      grade: 'Class 10',
      student: 'Kabir Malhotra',
      school: 'ABC International School',
      thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=600',
      description: 'Engaging short-form video demonstration illustrating Bernoulli’s aerodynamic principle.',
      tools: ['Timeline Editor', 'Dynamic Keyframing'],
    },
    {
      id: 7,
      title: 'Futuristic Vehicle 3D Concept',
      category: 'AI',
      grade: 'Class 11',
      student: 'Sneha Rao',
      school: 'Delhi Public Modern School',
      thumbnail: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&q=80&w=600',
      description: 'Concept art and design blueprint for a solar-powered vertical takeoff urban emergency vehicle.',
      tools: ['Multi-modal AI', 'Photoshop Touch'],
    },
    {
      id: 8,
      title: 'AI Story Video: The Lost Algorithm',
      category: 'CREATIVITY',
      grade: 'Class 12',
      student: 'Aditya Sen',
      school: 'St. Xavier Tech Academy',
      thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=600',
      description: 'Philosophical short film exploring human ethics in an autonomous society.',
      tools: ['AI Scriptwriting', 'Timeline Sound Design'],
    },
  ];

  const filtered = projects.filter((p) => {
    if (activeCategory === 'ALL') return true;
    return p.category === activeCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="primary" className="mb-2">Student Showcase</Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-950 font-display tracking-tight mb-2">
            Student Projects
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Real Projects. Real Creativity. Explore work designed by Class 6–12 students during live ALYSTRO sessions.
          </p>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            {[
              { id: 'ALL', label: 'All Projects' },
              { id: 'AI', label: 'AI Tools' },
              { id: 'VIDEO', label: 'Video Editing' },
              { id: 'CREATIVITY', label: 'Creativity & Posters' },
              { id: 'PRESENTATIONS', label: 'Presentations' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeCategory === cat.id
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid (Screen 6) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all group flex flex-col justify-between cursor-pointer"
              onClick={() => setSelectedProject(item)}
            >
              <div>
                <div className="relative h-48 overflow-hidden bg-navy-900">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-navy-950/20 group-hover:bg-navy-950/40 transition-colors flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white/90 text-navy-950 flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all shadow-lg">
                      <Play className="w-5 h-5 fill-navy-950 ml-0.5" />
                    </div>
                  </div>
                  <span className="absolute top-3 left-3 bg-navy-950/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {item.grade}
                  </span>
                </div>

                <div className="p-5">
                  <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider">
                    {item.category}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1 mb-1">{item.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-slate-600">{item.student}</span>
                <span className="text-brand-600 font-semibold group-hover:underline">View →</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <Modal
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
          title={selectedProject.title}
          subtitle={`${selectedProject.grade} • ${selectedProject.student} • ${selectedProject.school}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="rounded-2xl overflow-hidden border border-slate-200 relative h-72 bg-navy-900">
              <img
                src={selectedProject.thumbnail}
                alt={selectedProject.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h4 className="text-sm font-bold text-navy-950 mb-1">Project Summary</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                {selectedProject.description}
              </p>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Tools Used</h4>
              <div className="flex flex-wrap gap-2">
                {selectedProject.tools?.map((t: string, i: number) => (
                  <span
                    key={i}
                    className="text-xs font-semibold px-2.5 py-1 bg-brand-50 text-brand-700 rounded-lg border border-brand-200/60"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="pt-4 flex justify-end">
              <Button variant="primary" size="sm" onClick={() => setSelectedProject(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
