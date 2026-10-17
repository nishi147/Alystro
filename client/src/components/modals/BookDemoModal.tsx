import React, { useState } from 'react';
import { Sparkles, CheckCircle2, Calendar, User, Mail, Phone, Building2, BookOpen } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { api } from '../../services/api';

interface BookDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BookDemoModal: React.FC<BookDemoModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    schoolName: '',
    contactPerson: '',
    designation: 'Principal',
    email: '',
    phone: '',
    city: 'Jaipur',
    classes: 'Class 6-8',
    estimatedStudents: 250,
    preferredDemoDate: '',
    message: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      await api.post('/crm', {
        ...formData,
        classes: [formData.classes],
      });
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit demo request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setErrorMessage('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleResetAndClose} maxWidth="xl" isSubmitting={isLoading}>
      {isSuccess ? (
        <div className="text-center py-6 px-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Free Demo Session Booked!</h3>
          <p className="text-slate-600 text-sm max-w-md mx-auto mb-6">
            Thank you, <span className="font-semibold text-slate-900">{formData.contactPerson}</span>. Our
            academic coordinator for <span className="font-semibold">{formData.schoolName}</span> will get in
            touch within 24 hours to coordinate the 3-day demo session.
          </p>
          <Button variant="primary" onClick={handleResetAndClose} className="px-8">
            Done
          </Button>
        </div>
      ) : (
        <div>
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-brand-500" />
              Free 3-Day Live Demo Session
            </div>
            <h3 className="text-2xl font-extrabold text-navy-950 font-display">
              Bring Future Skills to Your School
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Experience the ALYSTRO curriculum, live mentor instruction, and interactive student projects with zero commitment.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-medium">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="School Name"
                required
                placeholder="e.g. Heritage Public School"
                leftIcon={<Building2 className="w-4 h-4" />}
                value={formData.schoolName}
                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
              />
              <Input
                label="City / Location"
                required
                placeholder="e.g. Jaipur"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Contact Person Name"
                required
                placeholder="e.g. Dr. Ramesh Sharma"
                leftIcon={<User className="w-4 h-4" />}
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              />
              <Select
                label="Designation"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                options={[
                  { value: 'Principal', label: 'Principal' },
                  { value: 'Vice Principal', label: 'Vice Principal' },
                  { value: 'School Director / Trustee', label: 'School Director / Trustee' },
                  { value: 'Computer / HOD', label: 'Head of Computer Dept' },
                  { value: 'Teacher / Staff', label: 'Teacher / Staff' },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Work Email"
                type="email"
                required
                placeholder="principal@school.edu"
                leftIcon={<Mail className="w-4 h-4" />}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <Input
                label="Mobile Number (WhatsApp)"
                type="tel"
                required
                placeholder="+91 98765 43210"
                leftIcon={<Phone className="w-4 h-4" />}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Classes Interested In"
                value={formData.classes}
                onChange={(e) => setFormData({ ...formData, classes: e.target.value })}
                options={[
                  { value: 'Classes 6-7', label: 'Classes 6–7 | Foundation Level' },
                  { value: 'Classes 8-10', label: 'Classes 8–10 | Skill Development Level' },
                  { value: 'Classes 11-12', label: 'Classes 11–12 | Advanced & Career Ready' },
                  { value: 'All Classes (6-12)', label: 'All Classes (Class 6–12)' },
                ]}
              />
              <Input
                label="Preferred Demo Date"
                type="date"
                leftIcon={<Calendar className="w-4 h-4" />}
                value={formData.preferredDemoDate}
                onChange={(e) => setFormData({ ...formData, preferredDemoDate: e.target.value })}
              />
            </div>

            <div className="pt-2">
              <Button type="submit" variant="primary" className="w-full py-3 font-bold" isLoading={isLoading}>
                Confirm & Request Free Demo
              </Button>
              <p className="text-[11px] text-slate-400 text-center mt-2">
                🔒 We respect your school privacy. Need immediate assistance? Write to us at{' '}
                <a href="mailto:Alystro64@gmail.com" className="text-brand-600 font-semibold hover:underline">
                  Alystro64@gmail.com
                </a>
              </p>
            </div>
          </form>
        </div>
      )}
    </Modal>
  );
};
