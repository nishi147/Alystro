import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Search,
  Download,
  Building2,
  CheckCircle2,
  Phone,
  Mail,
  Filter,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { api } from '../../services/api';
import { Student, School } from '../../types';
import { exportToCsv } from '../../utils/exportCsv';

export const SuperAdminStudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [search, setSearch] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [stuRes, schRes] = await Promise.all([
        api.get(`/students?search=${encodeURIComponent(search)}`),
        api.get('/schools'),
      ]);

      if (stuRes.success && stuRes.data) {
        setStudents(stuRes.data);
      }
      if (schRes.success && schRes.data) {
        setSchools(schRes.data);
      }
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search]);

  const filteredStudents = students.filter((s) => {
    if (selectedSchool !== 'ALL') {
      const schId = typeof s.school === 'object' ? s.school?._id : s.school;
      if (schId !== selectedSchool) return false;
    }
    return true;
  });

  const handleExportCsv = () => {
    const dataToExport = filteredStudents.map((s) => ({
      'Roll Number': s.rollNumber,
      Name: s.name,
      Email: s.email,
      Grade: s.grade,
      Section: s.section,
      School: typeof s.school === 'object' ? s.school?.name : 'Partner School',
      'Parent Contact': s.parentPhone || '',
      Status: s.status,
    }));
    exportToCsv('ALYSTRO_All_Students', dataToExport);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-brand-50 text-brand-600">
              <GraduationCap className="w-5 h-5" />
            </span>
            <h2 className="text-2xl font-extrabold text-navy-950 font-display">
              All Students Directory
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Cross-institution student roster across all partnered schools and active learning batches.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCsv}
          leftIcon={<Download className="w-4 h-4" />}
        >
          Export Students CSV
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3 max-w-xl">
          <div className="flex-1">
            <Input
              placeholder="Search by student name, roll number, or email..."
              leftIcon={<Search className="w-4 h-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="rounded-xl border border-slate-200 p-2.5 text-xs font-semibold bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
          >
            <option value="ALL">All Schools ({schools.length})</option>
            {schools.map((sch) => (
              <option key={sch._id} value={sch._id}>
                {sch.name}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs font-semibold text-slate-500">
          Total Enrolled: <strong className="text-slate-900">{filteredStudents.length}</strong>
        </span>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Student</th>
                <th className="py-3.5 px-6">Roll No</th>
                <th className="py-3.5 px-6">Partner School</th>
                <th className="py-3.5 px-6">Grade / Section</th>
                <th className="py-3.5 px-6">Parent Contact</th>
                <th className="py-3.5 px-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto mb-2" />
                    Loading student roster...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No students found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((stu) => {
                  const schoolName =
                    typeof stu.school === 'object' ? stu.school?.name : 'Partner School';
                  return (
                    <tr key={stu._id} className="hover:bg-slate-50/60 transition">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 font-bold text-xs flex items-center justify-center shrink-0">
                            {stu.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-navy-950 text-sm leading-tight">
                              {stu.name}
                            </p>
                            <p className="text-xs text-slate-400">{stu.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono text-xs font-bold text-slate-700">
                        {stu.rollNumber}
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[200px]">{schoolName}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-semibold text-slate-700">
                          {stu.grade} - {stu.section}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-500">
                        {stu.parentPhone ? (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {stu.parentPhone}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Badge variant="success" dot>
                          {stu.status || 'ACTIVE'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
