import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Plus,
  Eye,
  Edit3,
  RefreshCw,
  FileText,
  MessageSquare,
  HelpCircle,
  Globe,
  Search,
  Star,
  ChevronDown,
  ChevronUp,
  ToggleLeft,
  ToggleRight,
  Save,
  X,
  Hash,
  Layers,
  Image,
  AlertTriangle,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { api } from '../../services/api';
import { Program } from '../../types';

type CMSCategory =
  | 'HERO'
  | 'PROGRAMS'
  | 'TESTIMONIALS'
  | 'PROJECTS'
  | 'FAQS'
  | 'STATS'
  | 'GALLERY'
  | 'BLOG';

interface CMSItem {
  _id: string;
  key: string;
  category: CMSCategory;
  title?: string;
  data: any;
  published: boolean;
  updatedAt: string;
}

type ActiveTab = 'programs' | 'testimonials' | 'faqs' | 'projects' | 'raw';

const CATEGORY_META: Record<CMSCategory, { label: string; color: string }> = {
  HERO: { label: 'Hero Banner', color: 'bg-violet-100 text-violet-700 border-violet-200' },
  PROGRAMS: { label: 'Programs', color: 'bg-brand-50 text-brand-700 border-brand-200' },
  TESTIMONIALS: { label: 'Testimonials', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  PROJECTS: { label: 'Student Projects', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  FAQS: { label: 'FAQs', color: 'bg-sky-50 text-sky-700 border-sky-200' },
  STATS: { label: 'Stats', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  GALLERY: { label: 'Gallery', color: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200' },
  BLOG: { label: 'Blog', color: 'bg-slate-100 text-slate-700 border-slate-200' },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

const FaqAccordionItem: React.FC<{ q: string; a: string; index: number }> = ({ q, a, index }) => {
  const [open, setOpen] = useState(index === 0);
  return (
    <div>
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 transition">
        <span className="text-sm font-semibold text-navy-950 pr-4">{q}</span>
        {open ? <ChevronUp className="w-4 h-4 text-brand-500 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
      </button>
      {open && <div className="px-6 pb-4"><p className="text-sm text-slate-600 leading-relaxed">{a}</p></div>}
    </div>
  );
};

interface FaqEditorProps {
  items: { q: string; a: string }[];
  onChange: (items: { q: string; a: string }[]) => void;
}
const FaqEditor: React.FC<FaqEditorProps> = ({ items, onChange }) => {
  const add = () => onChange([...items, { q: '', a: '' }]);
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const update = (i: number, field: 'q' | 'a', val: string) => {
    const c = [...items]; c[i] = { ...c[i], [field]: val }; onChange(c);
  };
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Q{i + 1}</span>
            <button type="button" onClick={() => remove(i)} className="text-slate-400 hover:text-rose-500 transition"><X className="w-4 h-4" /></button>
          </div>
          <input type="text" placeholder="Question" value={item.q} onChange={e => update(i, 'q', e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
          <textarea rows={2} placeholder="Answer" value={item.a} onChange={e => update(i, 'a', e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
        </div>
      ))}
      <button type="button" onClick={add}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-brand-300 text-brand-500 text-sm font-semibold hover:bg-brand-50 transition">
        <Plus className="w-4 h-4" /> Add FAQ
      </button>
    </div>
  );
};

interface TestimonialEditorProps {
  items: { name: string; role: string; avatar: string; quote: string; rating: number }[];
  onChange: (items: any[]) => void;
}
const TestimonialEditor: React.FC<TestimonialEditorProps> = ({ items, onChange }) => {
  const add = () => onChange([...items, { name: '', role: '', avatar: '', quote: '', rating: 5 }]);
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const update = (i: number, field: string, val: any) => {
    const c = [...items]; c[i] = { ...c[i], [field]: val }; onChange(c);
  };
  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Testimonial {i + 1}</span>
            <button type="button" onClick={() => remove(i)} className="text-slate-400 hover:text-rose-500 transition"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input type="text" placeholder="Full Name" value={item.name} onChange={e => update(i, 'name', e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            <input type="text" placeholder="Role / School" value={item.role} onChange={e => update(i, 'role', e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
          <input type="url" placeholder="Avatar URL" value={item.avatar} onChange={e => update(i, 'avatar', e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
          <textarea rows={3} placeholder="Quote..." value={item.quote} onChange={e => update(i, 'quote', e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold">Rating:</span>
            {[1,2,3,4,5].map(star => (
              <button key={star} type="button" onClick={() => update(i, 'rating', star)}
                className={star <= item.rating ? 'text-amber-400 transition' : 'text-slate-300 hover:text-amber-300 transition'}>
                <Star className="w-4 h-4 fill-current" />
              </button>
            ))}
          </div>
        </div>
      ))}
      <button type="button" onClick={add}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-emerald-300 text-emerald-600 text-sm font-semibold hover:bg-emerald-50 transition">
        <Plus className="w-4 h-4" /> Add Testimonial
      </button>
    </div>
  );
};

interface ProjectEditorProps {
  items: { title: string; category: string; grade: string; student: string; thumbnail: string; description: string }[];
  onChange: (items: any[]) => void;
}
const ProjectEditor: React.FC<ProjectEditorProps> = ({ items, onChange }) => {
  const add = () => onChange([...items, { title: '', category: '', grade: '', student: '', thumbnail: '', description: '' }]);
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const update = (i: number, field: string, val: string) => {
    const c = [...items]; c[i] = { ...c[i], [field]: val }; onChange(c);
  };
  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Project {i + 1}</span>
            <button type="button" onClick={() => remove(i)} className="text-slate-400 hover:text-rose-500 transition"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input type="text" placeholder="Title" value={item.title} onChange={e => update(i, 'title', e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            <input type="text" placeholder="Category" value={item.category} onChange={e => update(i, 'category', e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            <input type="text" placeholder="Grade" value={item.grade} onChange={e => update(i, 'grade', e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            <input type="text" placeholder="Student Name" value={item.student} onChange={e => update(i, 'student', e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
          <input type="url" placeholder="Thumbnail URL" value={item.thumbnail} onChange={e => update(i, 'thumbnail', e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
          <textarea rows={2} placeholder="Description" value={item.description} onChange={e => update(i, 'description', e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
        </div>
      ))}
      <button type="button" onClick={add}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-amber-300 text-amber-600 text-sm font-semibold hover:bg-amber-50 transition">
        <Plus className="w-4 h-4" /> Add Project
      </button>
    </div>
  );
};

export const SuperAdminCMSPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('programs');
  const [programs, setPrograms] = useState<Program[]>([]);
  const [cmsItems, setCmsItems] = useState<CMSItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CMSCategory | 'ALL'>('ALL');
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<CMSItem | null>(null);
  const [editKey, setEditKey] = useState('');
  const [editCat, setEditCat] = useState<CMSCategory>('FAQS');
  const [editTitle, setEditTitle] = useState('');
  const [editStructured, setEditStructured] = useState<any[]>([]);
  const [editRaw, setEditRaw] = useState('{}');
  const [jsonErr, setJsonErr] = useState('');
  const [saving, setSaving] = useState(false);
  const [previewItem, setPreviewItem] = useState<CMSItem | null>(null);

  const showToast = (text: string, ok = true) => {
    setToast({ text, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [pr, cr] = await Promise.all([api.get('/programs'), api.get('/cms')]);
      if (pr.success) setPrograms(pr.data);
      if (cr.success) setCmsItems(cr.data);
    } catch (e: any) {
      showToast(e.message || 'Failed to load', false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const editorType = (cat: CMSCategory) =>
    cat === 'FAQS' ? 'faqs' : cat === 'TESTIMONIALS' ? 'testimonials' : cat === 'PROJECTS' ? 'projects' : 'raw';

  const openEdit = (item?: CMSItem) => {
    if (item) {
      setEditItem(item);
      setEditKey(item.key);
      setEditCat(item.category);
      setEditTitle(item.title || '');
      setEditStructured(Array.isArray(item.data) ? [...item.data] : []);
      setEditRaw(JSON.stringify(item.data, null, 2));
    } else {
      setEditItem(null);
      setEditKey('custom_' + Date.now());
      setEditCat('FAQS');
      setEditTitle('');
      setEditStructured([{ q: 'New question?', a: 'Answer here.' }]);
      setEditRaw('{}');
    }
    setJsonErr('');
    setEditOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setJsonErr('');
    let data: any;
    if (editorType(editCat) === 'raw') {
      try { data = JSON.parse(editRaw); }
      catch { setJsonErr('Invalid JSON — fix syntax before saving.'); setSaving(false); return; }
    } else {
      data = editStructured;
    }
    try {
      await api.put('/cms/' + editKey, { category: editCat, title: editTitle, data, published: editItem?.published ?? true });
      setEditOpen(false);
      await loadData();
      showToast('Saved successfully!');
    } catch (e: any) {
      showToast(e.message || 'Save failed', false);
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (item: CMSItem) => {
    try {
      await api.put('/cms/' + item.key, { category: item.category, title: item.title, data: item.data, published: !item.published });
      await loadData();
      showToast('"' + item.key + '" ' + (item.published ? 'unpublished' : 'published') + '.');
    } catch (e: any) { showToast(e.message || 'Failed', false); }
  };

  const faqItem = cmsItems.find(c => c.category === 'FAQS');
  const testimonialItem = cmsItems.find(c => c.category === 'TESTIMONIALS');
  const projectItem = cmsItems.find(c => c.category === 'PROJECTS');

  const filtered = cmsItems.filter(item => {
    const s = searchQuery.toLowerCase();
    const matchS = !s || item.key.toLowerCase().includes(s) || (item.title || '').toLowerCase().includes(s);
    const matchC = categoryFilter === 'ALL' || item.category === categoryFilter;
    return matchS && matchC;
  });

  const tabs = [
    { id: 'programs' as ActiveTab, label: 'Programs', count: programs.length },
    { id: 'testimonials' as ActiveTab, label: 'Testimonials', count: testimonialItem && Array.isArray(testimonialItem.data) ? testimonialItem.data.length : 0 },
    { id: 'faqs' as ActiveTab, label: 'FAQs', count: faqItem && Array.isArray(faqItem.data) ? faqItem.data.length : 0 },
    { id: 'projects' as ActiveTab, label: 'Projects', count: projectItem && Array.isArray(projectItem.data) ? projectItem.data.length : 0 },
    { id: 'raw' as ActiveTab, label: 'All Blocks', count: cmsItems.length },
  ];

  return (
    <div className="space-y-6">
      {toast && (
        <div className={'fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-semibold ' + (toast.ok ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white')}>
          {toast.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {toast.text}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-brand-50 text-brand-600"><FileText className="w-5 h-5" /></span>
            <h2 className="text-2xl font-extrabold text-navy-950 font-display">Content Management</h2>
          </div>
          <p className="text-xs text-slate-500">Manage programs, testimonials, FAQs, and student projects shown on the public site.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadData} disabled={isLoading}
            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-brand-600 hover:border-brand-300 transition disabled:opacity-50">
            <RefreshCw className={isLoading ? 'w-4 h-4 animate-spin' : 'w-4 h-4'} />
          </button>
          {activeTab === 'raw' && (
            <Button variant="primary" size="sm" onClick={() => openEdit()} leftIcon={<Plus className="w-4 h-4" />}>New Block</Button>
          )}
        </div>
      </div>

      <div className="border-b border-slate-200">
        <div className="flex gap-1 overflow-x-auto pb-px">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={'flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition ' + (activeTab === tab.id ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-800')}>
              {tab.label}
              <span className={'px-1.5 py-0.5 rounded-full text-[11px] font-bold ' + (activeTab === tab.id ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-600')}>{tab.count}</span>
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-6 h-6 text-brand-500 animate-spin" />
          <span className="ml-3 text-slate-500 text-sm">Loading...</span>
        </div>
      )}
      {!isLoading && activeTab === 'programs' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {programs.length === 0 && <p className="col-span-3 py-16 text-center text-slate-400 text-sm">No programs found.</p>}
          {programs.map(prog => (
            <div key={prog._id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-soft hover:shadow-card transition flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-brand-50 text-brand-700 border border-brand-200">
                  {(prog.gradeLevel || '').replace('CLASS_', 'Class ').replace('_', '–')}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">● Live</span>
              </div>
              <h3 className="text-base font-bold text-navy-950 mb-1">{prog.name}</h3>
              <p className="text-xs font-semibold text-brand-600 mb-3">{prog.tagline}</p>
              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed flex-1 mb-4">{prog.description}</p>
              <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500 mb-4">
                <div className="flex justify-between"><span>Duration</span><strong className="text-slate-800">{prog.durationMonths} Months</strong></div>
                <div className="flex justify-between"><span>Session</span><strong className="text-slate-800">{prog.sessionDurationMinutes} Mins</strong></div>
                <div className="flex justify-between"><span>Mode</span><strong className="text-slate-800">{prog.mode}</strong></div>
              </div>
              <Link to={'/programs/' + prog.slug} target="_blank"
                className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 py-2 rounded-xl transition">
                <Eye className="w-3.5 h-3.5" /> View Public Page
              </Link>
            </div>
          ))}
        </div>
      )}

      {!isLoading && activeTab === 'testimonials' && (
        <div className="space-y-4">
          {!testimonialItem ? (
            <div className="py-16 text-center text-slate-400">
              <MessageSquare className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-medium">No testimonials block found. Seed the database first.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-navy-950">{testimonialItem.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{Array.isArray(testimonialItem.data) ? testimonialItem.data.length : 0} entries · <Badge variant={testimonialItem.published ? 'success' : 'neutral'} dot size="sm">{testimonialItem.published ? 'Published' : 'Draft'}</Badge></p>
                </div>
                <Button variant="primary" size="sm" onClick={() => openEdit(testimonialItem)} leftIcon={<Edit3 className="w-3.5 h-3.5" />}>Edit Testimonials</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.isArray(testimonialItem.data) && testimonialItem.data.map((t: any, idx: number) => (
                  <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-soft">
                    <div className="flex items-start gap-3 mb-3">
                      {t.avatar && <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                        onError={e => { (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(t.name || 'U'); }} />}
                      <div>
                        <p className="text-sm font-bold text-navy-950">{t.name}</p>
                        <p className="text-xs text-slate-500">{t.role}</p>
                        <div className="flex gap-0.5 mt-1">
                          {[1,2,3,4,5].map(s => <Star key={s} className={'w-3 h-3 ' + (s <= (t.rating || 5) ? 'text-amber-400 fill-current' : 'text-slate-200 fill-current')} />)}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 italic leading-relaxed line-clamp-4">"{t.quote}"</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
      {!isLoading && activeTab === 'faqs' && (
        <div className="space-y-4">
          {!faqItem ? (
            <div className="py-16 text-center text-slate-400">
              <HelpCircle className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-medium">No FAQ block found. Seed the database first.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-navy-950">{faqItem.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{Array.isArray(faqItem.data) ? faqItem.data.length : 0} questions · <Badge variant={faqItem.published ? 'success' : 'neutral'} dot size="sm">{faqItem.published ? 'Published' : 'Draft'}</Badge></p>
                </div>
                <Button variant="primary" size="sm" onClick={() => openEdit(faqItem)} leftIcon={<Edit3 className="w-3.5 h-3.5" />}>Edit FAQs</Button>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-soft divide-y divide-slate-100">
                {Array.isArray(faqItem.data) && faqItem.data.map((faq: any, idx: number) => (
                  <FaqAccordionItem key={idx} q={faq.q} a={faq.a} index={idx} />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {!isLoading && activeTab === 'projects' && (
        <div className="space-y-4">
          {!projectItem ? (
            <div className="py-16 text-center text-slate-400">
              <Image className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-medium">No student projects block found. Seed the database first.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-navy-950">{projectItem.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{Array.isArray(projectItem.data) ? projectItem.data.length : 0} projects · <Badge variant={projectItem.published ? 'success' : 'neutral'} dot size="sm">{projectItem.published ? 'Published' : 'Draft'}</Badge></p>
                </div>
                <Button variant="primary" size="sm" onClick={() => openEdit(projectItem)} leftIcon={<Edit3 className="w-3.5 h-3.5" />}>Edit Projects</Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {Array.isArray(projectItem.data) && projectItem.data.map((proj: any, idx: number) => (
                  <div key={idx} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-soft">
                    {proj.thumbnail && <img src={proj.thumbnail} alt={proj.title} className="w-full h-36 object-cover"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                    <div className="p-4">
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">{proj.category}</span>
                      <h4 className="text-sm font-bold text-navy-950 mt-2 mb-1">{proj.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mb-2">{proj.description}</p>
                      <p className="text-[11px] text-slate-400">{proj.student} · {proj.grade}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
      {!isLoading && activeTab === 'raw' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input type="text" placeholder="Search by key or title..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value as any)}
                className="rounded-xl border border-slate-200 text-sm px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-400">
                <option value="ALL">All Categories</option>
                {Object.entries(CATEGORY_META).map(([k, m]) => <option key={k} value={k}>{m.label}</option>)}
              </select>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-soft">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Key</th>
                  <th className="py-3.5 px-5">Category</th>
                  <th className="py-3.5 px-5">Title</th>
                  <th className="py-3.5 px-5">Items</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5">Updated</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="py-12 text-center text-slate-400 text-sm">No content blocks found.</td></tr>
                ) : filtered.map(item => {
                  const meta = CATEGORY_META[item.category] || CATEGORY_META['BLOG'];
                  const cnt = Array.isArray(item.data) ? item.data.length : null;
                  return (
                    <tr key={item._id} className="hover:bg-slate-50/60 transition">
                      <td className="py-4 px-5 font-mono text-xs font-bold text-slate-800">{item.key}</td>
                      <td className="py-4 px-5">
                        <span className={'inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ' + meta.color}>{meta.label}</span>
                      </td>
                      <td className="py-4 px-5 font-medium text-navy-950 max-w-[180px] truncate">
                        {item.title || <span className="text-slate-400 italic">Untitled</span>}
                      </td>
                      <td className="py-4 px-5 text-xs">{cnt !== null ? <span className="font-semibold text-slate-700">{cnt} items</span> : <span className="text-slate-400">Object</span>}</td>
                      <td className="py-4 px-5">
                        <button onClick={() => togglePublish(item)} className="flex items-center gap-1.5 text-xs font-semibold transition"
                          title={item.published ? 'Click to unpublish' : 'Click to publish'}>
                          {item.published
                            ? <><ToggleRight className="w-5 h-5 text-emerald-500" /><span className="text-emerald-700">Published</span></>
                            : <><ToggleLeft className="w-5 h-5 text-slate-400" /><span className="text-slate-500">Draft</span></>}
                        </button>
                      </td>
                      <td className="py-4 px-5 text-xs text-slate-500">{formatDate(item.updatedAt)}</td>
                      <td className="py-4 px-5">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setPreviewItem(item)} className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition" title="Preview JSON"><Eye className="w-4 h-4" /></button>
                          <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition" title="Edit"><Edit3 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)}
        title={editItem ? 'Edit: ' + editItem.key : 'Create New Content Block'} maxWidth="xl">
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Content Key *</label>
              <Input value={editKey} onChange={e => setEditKey(e.target.value)} required disabled={!!editItem} placeholder="e.g. homepage_faqs" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Category *</label>
              <select className="w-full rounded-xl border border-slate-200 p-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={editCat} onChange={e => setEditCat(e.target.value as CMSCategory)}>
                {Object.entries(CATEGORY_META).map(([k, m]) => <option key={k} value={k}>{m.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Section Title</label>
            <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="e.g. Frequently Asked Questions" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Content Data</label>
            {editorType(editCat) === 'faqs' && <FaqEditor items={Array.isArray(editStructured) ? editStructured : []} onChange={setEditStructured} />}
            {editorType(editCat) === 'testimonials' && <TestimonialEditor items={Array.isArray(editStructured) ? editStructured : []} onChange={setEditStructured} />}
            {editorType(editCat) === 'projects' && <ProjectEditor items={Array.isArray(editStructured) ? editStructured : []} onChange={setEditStructured} />}
            {editorType(editCat) === 'raw' && (
              <div>
                <textarea rows={10}
                  className={'w-full rounded-xl border px-3 py-3 font-mono text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500 ' + (jsonErr ? 'border-rose-400' : 'border-slate-200')}
                  value={editRaw} onChange={e => { setEditRaw(e.target.value); setJsonErr(''); }} required />
                {jsonErr && <p className="text-xs text-rose-600 mt-1 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" />{jsonErr}</p>}
              </div>
            )}
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="ghost" type="button" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" isLoading={saving} leftIcon={<Save className="w-4 h-4" />}>Save Content</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!previewItem} onClose={() => setPreviewItem(null)} title={'Preview: ' + (previewItem?.key || '')} maxWidth="lg">
        {previewItem && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className={'inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ' + (CATEGORY_META[previewItem.category]?.color || '')}>
                {CATEGORY_META[previewItem.category]?.label}
              </span>
              <Badge variant={previewItem.published ? 'success' : 'neutral'} dot>{previewItem.published ? 'Published' : 'Draft'}</Badge>
              <span className="text-xs text-slate-500">Updated {formatDate(previewItem.updatedAt)}</span>
            </div>
            <p className="text-sm font-semibold text-navy-950">{previewItem.title}</p>
            <pre className="bg-slate-950 text-emerald-300 rounded-xl p-4 text-xs overflow-auto max-h-96 font-mono leading-relaxed">
              {JSON.stringify(previewItem.data, null, 2)}
            </pre>
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => { const it = previewItem; setPreviewItem(null); openEdit(it); }} leftIcon={<Edit3 className="w-3.5 h-3.5" />}>Edit This Block</Button>
              <Button variant="ghost" size="sm" onClick={() => setPreviewItem(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
