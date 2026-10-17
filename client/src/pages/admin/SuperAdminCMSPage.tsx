import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Sparkles,
  Edit,
  Plus,
  Eye,
  CheckCircle2,
  Layers,
  Clock,
  Calendar,
  MessageSquare,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { api } from '../../services/api';
import { Program } from '../../types';

interface CMSItem {
  _id: string;
  key: string;
  category: 'HERO' | 'PROGRAMS' | 'TESTIMONIALS' | 'PROJECTS' | 'FAQS' | 'STATS' | 'GALLERY' | 'BLOG';
  title?: string;
  data: any;
  published: boolean;
  updatedAt: string;
}

export const SuperAdminCMSPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'programs' | 'cms'>('programs');
  const [programs, setPrograms] = useState<Program[]>([]);
  const [cmsItems, setCmsItems] = useState<CMSItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit CMS Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{
    key: string;
    category: string;
    title: string;
    jsonContent: string;
  }>({
    key: '',
    category: 'FAQS',
    title: '',
    jsonContent: '{}',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [progRes, cmsRes] = await Promise.all([
        api.get('/programs'),
        api.get('/cms'),
      ]);
      if (progRes.success && progRes.data) {
        setPrograms(progRes.data);
      }
      if (cmsRes.success && cmsRes.data) {
        setCmsItems(cmsRes.data);
      }
    } catch (err) {
      console.error('Failed to load CMS data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenEdit = (item?: CMSItem) => {
    if (item) {
      setEditingItem({
        key: item.key,
        category: item.category,
        title: item.title || '',
        jsonContent: JSON.stringify(item.data, null, 2),
      });
    } else {
      setEditingItem({
        key: `custom_${Date.now()}`,
        category: 'FAQS',
        title: '',
        jsonContent: JSON.stringify({ question: 'How do students join?', answer: 'Via the ALYSTRO portal.' }, null, 2),
      });
    }
    setEditModalOpen(true);
  };

  const handleSaveCMS = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let parsedData = {};
      try {
        parsedData = JSON.parse(editingItem.jsonContent);
      } catch (e) {
        alert('Invalid JSON format in data field.');
        setIsSubmitting(false);
        return;
      }

      await api.put(`/cms/${editingItem.key}`, {
        category: editingItem.category,
        title: editingItem.title,
        data: parsedData,
        published: true,
      });

      setEditModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error updating CMS content');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-brand-50 text-brand-600">
              <BookOpen className="w-5 h-5" />
            </span>
            <h2 className="text-2xl font-extrabold text-navy-950 font-display">
              Programs Catalog & CMS Content
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Manage flagship curriculum offerings, landing page banners, FAQs, and public student showcases.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'cms' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleOpenEdit()}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Content Block
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex space-x-6">
          <button
            onClick={() => setActiveTab('programs')}
            className={`pb-3 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'programs'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Flagship Programs ({programs.length})
          </button>
          <button
            onClick={() => setActiveTab('cms')}
            className={`pb-3 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'cms'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            Live Website Content ({cmsItems.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Programs */}
      {activeTab === 'programs' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {programs.map((prog) => (
            <div
              key={prog._id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-soft hover:shadow-card transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="primary">
                    {prog.gradeLevel.replace('CLASS_', 'Classes ').replace('_', '–')}
                  </Badge>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Live
                  </span>
                </div>
                <h3 className="text-lg font-bold text-navy-950 mb-1">{prog.name}</h3>
                <p className="text-xs font-semibold text-brand-600 mb-3">{prog.tagline}</p>
                <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                  {prog.description}
                </p>

                <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs text-slate-500 mb-4">
                  <div className="flex items-center justify-between">
                    <span>Duration:</span>
                    <strong className="text-slate-800">{prog.durationMonths} Months</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Session:</span>
                    <strong className="text-slate-800">{prog.sessionDurationMinutes} Mins Daily</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Mode:</span>
                    <strong className="text-slate-800">{prog.mode}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Syllabus Modules:</span>
                    <strong className="text-slate-800">{prog.syllabus?.length || 3} Months</strong>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to={`/programs/${prog.slug}`}
                  target="_blank"
                  className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 py-2 rounded-xl transition"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Public Curriculum
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: CMS Content Blocks */}
      {activeTab === 'cms' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-soft">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Content Identifier</th>
                <th className="py-3.5 px-6">Category</th>
                <th className="py-3.5 px-6">Title / Label</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Last Updated</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cmsItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No CMS blocks registered yet. Click "Add Content Block" above to initialize.
                  </td>
                </tr>
              ) : (
                cmsItems.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-4 px-6 font-mono text-xs font-bold text-slate-800">
                      {item.key}
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant="neutral">{item.category}</Badge>
                    </td>
                    <td className="py-4 px-6 font-semibold text-navy-950">
                      {item.title || 'Untitled Section'}
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={item.published ? 'success' : 'neutral'} dot>
                        {item.published ? 'Published' : 'Draft'}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500">
                      {new Date(item.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(item)}
                        leftIcon={<Edit className="w-3.5 h-3.5 text-brand-600" />}
                      >
                        Edit Data
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit CMS Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={editingItem.key ? `Edit Content Block: ${editingItem.key}` : 'New Content Block'}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveCMS} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Content Key (Unique)
            </label>
            <Input
              value={editingItem.key}
              onChange={(e) => setEditingItem({ ...editingItem, key: e.target.value })}
              required
              placeholder="e.g. homepage_faqs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Category
              </label>
              <select
                className="w-full rounded-xl border border-slate-200 p-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={editingItem.category}
                onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
              >
                <option value="HERO">HERO</option>
                <option value="PROGRAMS">PROGRAMS</option>
                <option value="TESTIMONIALS">TESTIMONIALS</option>
                <option value="PROJECTS">PROJECTS</option>
                <option value="FAQS">FAQS</option>
                <option value="STATS">STATS</option>
                <option value="GALLERY">GALLERY</option>
                <option value="BLOG">BLOG</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Title / Heading
              </label>
              <Input
                value={editingItem.title}
                onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                placeholder="e.g. Frequently Asked Questions"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              JSON Content Payload
            </label>
            <textarea
              rows={8}
              className="w-full rounded-xl border border-slate-200 p-3 font-mono text-xs text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500"
              value={editingItem.jsonContent}
              onChange={(e) => setEditingItem({ ...editingItem, jsonContent: e.target.value })}
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="ghost" type="button" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isSubmitting}>
              Save Content
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
