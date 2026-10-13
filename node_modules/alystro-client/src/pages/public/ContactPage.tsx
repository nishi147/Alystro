import React, { useState } from 'react';
import { MapPin, Phone, Mail, MessageSquare, CheckCircle2, Building2, User, Sparkles } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { api } from '../../services/api';

export const ContactPage: React.FC = () => {
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
    agreeTerms: true,
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
      setErrorMessage(err.message || 'Submission failed. Please check inputs.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <Badge variant="primary" className="mb-2">We Are Here For You</Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-950 font-display">
            Contact & Book Demo
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Let's bring future skills to your school. Reach out to our academic team in Jaipur.
          </p>
        </div>

        {/* Split View: Left Contact / Map, Right Form (Screen 8) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          {/* Left Column: Contact Details & Map Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-soft">
              <h2 className="text-xl font-bold text-navy-950 mb-6">Get in Touch</h2>

              <ul className="space-y-4 text-xs sm:text-sm text-slate-600 mb-8">
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-slate-900 font-semibold">Head Office:</strong>
                    ALYSTRO SOFTWARE, Jaipur, Rajasthan, India
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-slate-900 font-semibold">Call Us:</strong>
                    <a href="tel:+919876543210" className="hover:text-brand-600 transition">
                      +91 98765 43210
                    </a>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-slate-900 font-semibold">Email:</strong>
                    <a href="mailto:info@alystro.com" className="hover:text-brand-600 transition">
                      info@alystro.com
                    </a>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-slate-900 font-semibold">WhatsApp:</strong>
                    <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="hover:text-emerald-600 transition">
                      Chat with Academic Desk
                    </a>
                  </div>
                </li>
              </ul>

              {/* Styled Map Illustration for Jaipur */}
              <div className="rounded-2xl overflow-hidden border border-slate-200 relative h-48 bg-slate-100">
                <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] opacity-70" />
                <div className="absolute inset-0 flex items-center justify-center flex-col text-center p-4">
                  <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/30 animate-bounce">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 mt-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
                    Jaipur Campus Hub
                  </span>
                  <span className="text-[10px] text-slate-500">Rajasthan, India</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Book a Free Demo Form (Screen 8) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-soft">
              <h2 className="text-2xl font-extrabold text-navy-950 font-display mb-1">
                Book a Free Demo
              </h2>
              <p className="text-xs text-slate-500 mb-6">
                Fill this form to request a 3-day complimentary demo for your school students.
              </p>

              {isSuccess ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Request Received!</h3>
                  <p className="text-slate-600 text-sm max-w-md mx-auto mb-6">
                    Our academic coordinator will reach out to <span className="font-semibold">{formData.email}</span> within 24 hours to schedule the demo workshop.
                  </p>
                  <Button variant="primary" onClick={() => setIsSuccess(false)}>
                    Submit Another Request
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errorMessage && (
                    <div className="p-3 bg-rose-50 text-rose-700 text-xs font-medium rounded-xl border border-rose-200">
                      {errorMessage}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="School Name"
                      required
                      placeholder="e.g. Cambridge Court High School"
                      value={formData.schoolName}
                      onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                    />
                    <Input
                      label="City / Location"
                      required
                      placeholder="Jaipur"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Contact Person Name"
                      required
                      placeholder="Mr. Rajesh Verma"
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
                        { value: 'Director', label: 'Director / Trustee' },
                        { value: 'Computer HOD', label: 'Head of Computer Dept' },
                      ]}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Mobile Number"
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                    <Input
                      label="Official Email"
                      type="email"
                      required
                      placeholder="principal@school.edu"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                      label="Classes Interested In"
                      value={formData.classes}
                      onChange={(e) => setFormData({ ...formData, classes: e.target.value })}
                      options={[
                        { value: 'Class 6-8', label: 'Class 6–8 (Foundation)' },
                        { value: 'Class 9-10', label: 'Class 9–10 (Skill Builder)' },
                        { value: 'Class 11-12', label: 'Class 11–12 (Future Ready)' },
                        { value: 'All Classes', label: 'All Classes 6–12' },
                      ]}
                    />
                    <Input
                      label="Preferred Demo Date"
                      type="date"
                      value={formData.preferredDemoDate}
                      onChange={(e) => setFormData({ ...formData, preferredDemoDate: e.target.value })}
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="agree"
                      checked={formData.agreeTerms}
                      onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                      className="rounded text-brand-600 focus:ring-brand-500 h-4 w-4"
                      required
                    />
                    <label htmlFor="agree" className="text-xs text-slate-500">
                      I agree to be contacted by ALYSTRO academic team for scheduling the demo.
                    </label>
                  </div>

                  <div className="pt-2">
                    <Button type="submit" variant="primary" className="w-full py-3 font-bold" isLoading={isLoading}>
                      Submit Request
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
