import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Building2,
  BookOpen,
  Calendar,
  Award,
  DollarSign,
  ArrowUpRight,
  Plus,
  Edit,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  FileCheck,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { api } from '../../services/api';
import { SuperAdminStats, Lead } from '../../types';

export const SuperAdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<SuperAdminStats | null>(null);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsRes, leadsRes] = await Promise.all([
          api.get('/stats/super-admin'),
          api.get('/crm'),
        ]);

        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data);
        }
        if (leadsRes.success && leadsRes.data) {
          setRecentLeads(leadsRes.data.slice(0, 8));
        }
      } catch (err) {
        console.error('Error fetching admin dashboard stats:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONVERTED':
        return <Badge variant="success" dot>Converted</Badge>;
      case 'DEMO_SCHEDULED':
        return <Badge variant="warning" dot>Demo Scheduled</Badge>;
      case 'DEMO_DONE':
        return <Badge variant="info" dot>Demo Done</Badge>;
      case 'CONTACTED':
        return <Badge variant="primary" dot>Contacted</Badge>;
      case 'NEW':
      default:
        return <Badge variant="neutral" dot>New</Badge>;
    }
  };

  const COLORS = ['#2563EB', '#0284C7', '#38BDF8', '#818CF8', '#A78BFA'];

  return (
    <div className="space-y-8">
      {/* Top Welcome & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-navy-950 font-display">
            Executive Platform Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time multi-school aggregates, CRM conversions, and revenue metrics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/admin/schools">
            <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              Add School
            </Button>
          </Link>
          <Link to="/admin/crm">
            <Button variant="outline" size="sm">
              CRM Pipeline
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary 4 Metric Cards (Matching Screen 8 Dashboard Mockup) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Leads</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-display">
            {stats?.summary?.totalLeads ?? 125}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            ↑ {stats?.summary?.newLeads ?? 12} new this week
          </p>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Schools</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-display">
            {stats?.summary?.totalSchools ?? 14}
          </p>
          <p className="text-[11px] text-slate-500 font-semibold mt-1">
            {stats?.summary?.activeSchools ?? 12} Active Tenants
          </p>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Programs</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-display">
            {stats?.summary?.totalPrograms ?? 8}
          </p>
          <p className="text-[11px] text-slate-500 font-semibold mt-1">Class 6–12 Live</p>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Demo Requests</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-display">
            {stats?.summary?.scheduledDemos ?? 32}
          </p>
          <p className="text-[11px] text-amber-600 font-semibold mt-1">Scheduled Workshops</p>
        </div>
      </div>

      {/* Charts & Quick Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Recent Leads Table (Matching Screen 8 Mockup Table) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-navy-950">Recent Inquiries & Leads</h3>
                <p className="text-xs text-slate-400">Live feed from "Book Free Demo" website submissions</p>
              </div>
              <Link to="/admin/crm" className="text-xs font-bold text-brand-600 hover:text-brand-700">
                View All Leads →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-5 font-semibold">Contact Person</th>
                    <th className="py-3 px-5 font-semibold">School Name</th>
                    <th className="py-3 px-5 font-semibold">Mobile</th>
                    <th className="py-3 px-5 font-semibold">Class</th>
                    <th className="py-3 px-5 font-semibold">Status</th>
                    <th className="py-3 px-5 font-semibold text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {recentLeads.map((lead) => (
                    <tr key={lead._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-5 font-semibold text-slate-900">{lead.contactPerson}</td>
                      <td className="py-3.5 px-5">{lead.schoolName}</td>
                      <td className="py-3.5 px-5 font-mono">{lead.phone}</td>
                      <td className="py-3.5 px-5">
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[11px] font-medium">
                          {lead.classes?.[0] || 'Class 6-8'}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">{getStatusBadge(lead.status)}</td>
                      <td className="py-3.5 px-5 text-right text-slate-400 font-mono text-[11px]">
                        {new Date(lead.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* CRM Conversion Funnel Chart */}
          {stats?.charts?.crmFunnel && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-soft">
              <h3 className="text-base font-bold text-navy-950 mb-4">Pipeline Conversion Stages</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.charts.crmFunnel}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="stage" stroke="#64748B" fontSize={12} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={12} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0B1B3D', borderRadius: '12px', color: '#fff', border: 'none' }} />
                    <Bar dataKey="count" fill="#2563EB" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Quick Actions & Website Content Management */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Actions (Matching Screen 8 Sidebar Panel) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-soft">
            <h3 className="text-sm font-bold text-navy-950 uppercase tracking-wider mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2.5">
              <Link to="/admin/schools">
                <Button variant="outline" size="sm" className="w-full text-xs justify-start">
                  + Add School
                </Button>
              </Link>
              <Link to="/admin/cms">
                <Button variant="outline" size="sm" className="w-full text-xs justify-start">
                  + Add Program
                </Button>
              </Link>
              <Link to="/admin/cms">
                <Button variant="outline" size="sm" className="w-full text-xs justify-start">
                  + Add Testimonial
                </Button>
              </Link>
              <Link to="/admin/schools">
                <Button variant="outline" size="sm" className="w-full text-xs justify-start">
                  + Add Event
                </Button>
              </Link>
            </div>
          </div>

          {/* Website Content (Matching Screen 8 Sidebar Panel) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-soft">
            <h3 className="text-sm font-bold text-navy-950 uppercase tracking-wider mb-4">Website Content</h3>
            <div className="space-y-2">
              <Link to="/admin/cms" className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-700 transition">
                <span>Edit Homepage Banner & Stats</span>
                <Edit className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link to="/admin/cms" className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-700 transition">
                <span>Manage FAQs Accordion</span>
                <Edit className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link to="/admin/cms" className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-700 transition">
                <span>Manage Student Projects Gallery</span>
                <Edit className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>

          {/* Student Distribution Breakdown */}
          {stats?.charts?.schoolBreakdown && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-soft">
              <h3 className="text-sm font-bold text-navy-950 uppercase tracking-wider mb-3">Active Students By School</h3>
              <div className="space-y-3">
                {stats.charts.schoolBreakdown.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 truncate max-w-[180px]">{item.name}</span>
                    <span className="font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                      {item.students} students
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
