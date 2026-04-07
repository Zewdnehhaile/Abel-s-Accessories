import React, { useMemo, useRef, useState } from 'react';
import { RepairStatus, RepairRequest } from '../types';
import { Search, CheckCircle, AlertCircle, Wrench, Battery, Droplets, Cpu } from 'lucide-react';
import { createRepairRequest, trackRepair } from '../services/repairService';

type PaymentMethod = 'chapa' | 'cash';

type RepairService = {
  id: 'screen' | 'battery' | 'water' | 'logic';
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  accent: string;
  prompt: string;
};

const PaymentBadge: React.FC<{ method: PaymentMethod }> = ({ method }) => {
  const logos: Record<PaymentMethod, string | null> = {
    chapa: '/chapa.svg',
    cash: null
  };
  const fallback: Record<PaymentMethod, string> = {
    chapa: 'CH',
    cash: '$'
  };
  const bg: Record<PaymentMethod, string> = {
    chapa: 'from-amber-500 to-orange-500',
    cash: 'from-slate-500 to-slate-700'
  };
  const logo = logos[method];
  return (
    <span className={`inline-flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br ${bg[method]} text-white text-xs font-black overflow-hidden`}>
      {logo ? (
        <img src={logo} alt={`${method} logo`} className="w-6 h-6" />
      ) : (
        fallback[method]
      )}
    </span>
  );
};

const Repair: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'request' | 'track'>('request');
  const [trackingId, setTrackingId] = useState('');
  const [searchResult, setSearchResult] = useState<RepairRequest | 'not_found' | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [trackError, setTrackError] = useState('');
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    telegramUsername: '',
    device: '',
    description: '',
    payment: 'chapa'
  });
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [selectedService, setSelectedService] = useState<RepairService['id'] | null>(null);

  const repairServices = useMemo<RepairService[]>(() => ([
    {
      id: 'screen',
      title: 'Screen Repair',
      description: 'OLED/LCD replacement',
      icon: Wrench,
      accent: 'blue',
      prompt: 'Screen repair request: display, glass, or touch issue.'
    },
    {
      id: 'battery',
      title: 'Battery Service',
      description: 'Restore performance',
      icon: Battery,
      accent: 'green',
      prompt: 'Battery service request: battery draining quickly or not holding charge.'
    },
    {
      id: 'water',
      title: 'Water Damage',
      description: 'Ultrasonic cleaning',
      icon: Droplets,
      accent: 'cyan',
      prompt: 'Water damage request: the device was exposed to liquid or moisture.'
    },
    {
      id: 'logic',
      title: 'Logic Board',
      description: 'Micro-soldering',
      icon: Cpu,
      accent: 'purple',
      prompt: 'Logic board repair request: board-level issue or no power problem.'
    }
  ]), []);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) return;
    setIsTracking(true);
    setTrackError('');
    try {
      const result = await trackRepair(trackingId.trim());
      setSearchResult(result);
    } catch (err: any) {
      if (err?.message?.includes('not found')) {
        setSearchResult('not_found');
      } else {
        setTrackError(err?.message || 'Failed to track repair.');
        setSearchResult(null);
      }
    } finally {
      setIsTracking(false);
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const service = repairServices.find(item => item.id === selectedService);
      const finalDescription = service && !formData.description.toLowerCase().includes(service.title.toLowerCase())
        ? `${service.prompt}\n\n${formData.description}`.trim()
        : formData.description;

      const result = await createRepairRequest({
        name: formData.name,
        phone: formData.phone,
        telegramUsername: formData.telegramUsername,
        device: formData.device,
        description: finalDescription,
        payment: formData.payment as 'chapa' | 'cash'
      });
      setSubmittedCode(result.trackingCode);
      setFormData({ name: '', phone: '', telegramUsername: '', device: '', description: '', payment: 'chapa' });
      setSelectedService(null);
    } catch (err: any) {
      setSubmitError(err?.message || 'Failed to submit request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-body)] animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="bg-[var(--bg-card)] border-b border-[var(--border)] py-12">
          <div className="max-w-[1300px] mx-auto px-[5%] text-center">
              <h2 className="text-4xl md:text-5xl font-black text-[var(--text-main)] mb-4 tracking-tight">Repair Center</h2>
              <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto mb-8">
                  Fast, reliable, and professional repairs for all your devices. We bring your tech back to life.
              </p>
              
              <div className="flex justify-center gap-4 bg-[var(--bg-body)] p-1.5 rounded-full w-fit mx-auto border border-[var(--border)]">
                  <button 
                    onClick={() => setActiveTab('request')}
                    className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === 'request' ? 'bg-[var(--primary)] text-white shadow-lg' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                  >
                    Book Repair
                  </button>
                  <button 
                    onClick={() => setActiveTab('track')}
                    className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === 'track' ? 'bg-[var(--primary)] text-white shadow-lg' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                  >
                    Track Status
                  </button>
              </div>
          </div>
      </div>

      <div className="max-w-[1300px] mx-auto px-[5%] py-12">
        {activeTab === 'request' && (
            <div className="flex flex-col gap-12">
              {/* Services Grid - Horizontal Top */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {repairServices.map(service => {
                    const Icon = service.icon;
                    const isSelected = selectedService === service.id;
                    const accentClass = {
                      blue: 'bg-blue-500/10 text-blue-500',
                      green: 'bg-green-500/10 text-green-500',
                      cyan: 'bg-cyan-500/10 text-cyan-500',
                      purple: 'bg-purple-500/10 text-purple-500'
                    }[service.accent];

                    return (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => {
                          setSelectedService(service.id);
                          setFormData(prev => ({
                            ...prev,
                            description: prev.description.trim().includes(service.prompt)
                              ? prev.description
                              : prev.description.trim()
                                ? `${service.prompt}\n\n${prev.description.trim()}`
                                : service.prompt
                          }));
                          window.setTimeout(() => descriptionRef.current?.focus(), 0);
                        }}
                        className={`card p-6 flex flex-col items-center text-center transition-all border-2 ${
                          isSelected
                            ? 'border-[var(--primary)] bg-[var(--primary)]/5 shadow-xl scale-[1.02]'
                            : 'border-transparent hover:border-[var(--primary)]'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${accentClass}`}>
                          <Icon size={24} />
                        </div>
                        <h3 className="font-bold text-[var(--text-main)] mb-1 text-base">{service.title}</h3>
                        <p className="text-[var(--text-muted)] text-sm">{service.description}</p>
                        {isSelected && (
                          <span className="mt-3 text-xs font-bold uppercase tracking-widest text-[var(--primary)]">
                            Selected
                          </span>
                        )}
                      </button>
                    );
                  })}
              </div>

              {/* Booking Form - Centered & Prominent */}
              <div className="w-full max-w-2xl mx-auto">
                  <div className="card border-[var(--border)] shadow-2xl p-8 md:p-10 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--primary)] to-purple-500"></div>
                      
                      <h3 className="text-2xl font-bold text-center mb-8 text-[var(--text-main)]">New Service Request</h3>
                      
                      {!submittedCode ? (
                        <form onSubmit={handleSubmitRequest} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                  <label htmlFor="repair-name" className="block text-sm font-semibold mb-2 text-[var(--text-main)]">Full Name</label>
                                  <input 
                                      id="repair-name"
                                      type="text" 
                                      className="form-control"
                                      placeholder="e.g. Dawit Kebede"
                                      required
                                      value={formData.name}
                                      onChange={e => setFormData({...formData, name: e.target.value})}
                                  />
                              </div>
                              <div>
                                  <label htmlFor="repair-phone" className="block text-sm font-semibold mb-2 text-[var(--text-main)]">Phone Number</label>
                                  <input 
                                      id="repair-phone"
                                      type="tel" 
                                      className="form-control"
                                      placeholder="+251 ..."
                                      required
                                      value={formData.phone}
                                      onChange={e => setFormData({...formData, phone: e.target.value})}
                                  />
                              </div>
                              <div>
                                  <label htmlFor="repair-telegram" className="block text-sm font-semibold mb-2 text-[var(--text-main)]">
                                    Telegram Username
                                  </label>
                                  <input 
                                      id="repair-telegram"
                                      type="text" 
                                      className="form-control"
                                      placeholder="@your_username"
                                      value={formData.telegramUsername}
                                      onChange={e => setFormData({...formData, telegramUsername: e.target.value})}
                                  />
                              </div>
                          </div>

                          <div>
                              <label htmlFor="repair-device" className="block text-sm font-semibold mb-2 text-[var(--text-main)]">Device Model</label>
                              <input 
                                  id="repair-device"
                                  type="text" 
                                  className="form-control"
                                  placeholder="e.g. iPhone 14 Pro Max"
                                  required
                                  value={formData.device}
                                  onChange={e => setFormData({...formData, device: e.target.value})}
                              />
                          </div>

                          <div>
                              <label htmlFor="repair-description" className="block text-sm font-semibold mb-2 text-[var(--text-main)]">Problem Description</label>
                              <textarea 
                                  id="repair-description"
                                  ref={descriptionRef}
                                  className="form-control bg-[var(--input-bg)]"
                                  rows={4}
                                  placeholder="Briefly describe what's wrong..."
                                  required
                                  value={formData.description}
                                  onChange={e => setFormData({...formData, description: e.target.value})}
                              ></textarea>
                          </div>

                          {selectedService && (
                            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-body)] px-4 py-3 text-sm text-[var(--text-muted)] flex items-center justify-between gap-3">
                              <span>
                                Selected service: <strong className="text-[var(--text-main)]">{repairServices.find(s => s.id === selectedService)?.title}</strong>
                              </span>
                              <button
                                type="button"
                                className="text-[var(--primary)] font-bold"
                                onClick={() => setSelectedService(null)}
                              >
                                Clear
                              </button>
                            </div>
                          )}

                          <div>
                              <label className="block text-sm font-semibold mb-3 text-[var(--text-main)]">Preferred Payment</label>
                              <div className="grid grid-cols-2 gap-4">
                                  <label className={`cursor-pointer border rounded-xl p-4 flex items-center gap-3 transition-all ${formData.payment === 'chapa' ? 'border-[var(--primary)] bg-[var(--primary)]/5' : 'border-[var(--border)] hover:bg-[var(--bg-body)]'}`}>
                                      <input type="radio" name="payment" value="chapa" checked={formData.payment === 'chapa'} onChange={() => setFormData({...formData, payment: 'chapa'})} className="hidden" />
                                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.payment === 'chapa' ? 'border-[var(--primary)]' : 'border-[var(--text-muted)]'}`}>
                                          {formData.payment === 'chapa' && <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary)]" />}
                                      </div>
                                      <PaymentBadge method="chapa" />
                                      <div>
                                        <span className="block text-sm font-bold text-[var(--text-main)]">Chapa (Test)</span>
                                        <span className="block text-xs text-[var(--text-muted)]">Secure digital payment</span>
                                      </div>
                                  </label>
                                  <label className={`cursor-pointer border rounded-xl p-4 flex items-center gap-3 transition-all ${formData.payment === 'cash' ? 'border-[var(--primary)] bg-[var(--primary)]/5' : 'border-[var(--border)] hover:bg-[var(--bg-body)]'}`}>
                                      <input type="radio" name="payment" value="cash" checked={formData.payment === 'cash'} onChange={() => setFormData({...formData, payment: 'cash'})} className="hidden" />
                                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.payment === 'cash' ? 'border-[var(--primary)]' : 'border-[var(--text-muted)]'}`}>
                                          {formData.payment === 'cash' && <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary)]" />}
                                      </div>
                                      <PaymentBadge method="cash" />
                                      <div>
                                        <span className="block text-sm font-bold text-[var(--text-main)]">Cash</span>
                                        <span className="block text-xs text-[var(--text-muted)]">Pay at shop</span>
                                      </div>
                                  </label>
                              </div>
                          </div>

                          {submitError && (
                            <div className="text-sm text-red-500 text-center">{submitError}</div>
                          )}

                          <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full py-4 text-lg mt-4 shadow-xl shadow-[var(--primary)]/20">
                              {isSubmitting ? 'Submitting...' : 'Confirm Appointment'}
                          </button>
                        </form>
                      ) : (
                        <div className="text-center py-10 animate-in zoom-in">
                          <div className="w-20 h-20 bg-[var(--accent-green)]/20 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-[var(--accent-green)]/10">
                            <CheckCircle className="text-[var(--accent-green)] w-10 h-10" />
                          </div>
                          <h3 className="text-3xl font-bold text-[var(--text-main)] mb-3">Request Received!</h3>
                          <p className="text-[var(--text-muted)] mb-8">Please save your tracking code below.</p>
                          
                          <div className="bg-[var(--bg-body)] border border-[var(--border)] rounded-xl p-6 max-w-xs mx-auto mb-8 shadow-inner">
                            <span className="text-xs text-[var(--text-muted)] uppercase tracking-widest block mb-2 font-bold">Tracking Code</span>
                            <span className="text-4xl font-mono font-black text-[var(--primary)] tracking-wider block">{submittedCode}</span>
                          </div>
                          
                          <button onClick={() => setSubmittedCode(null)} className="text-[var(--text-main)] hover:text-[var(--primary)] font-medium underline underline-offset-4 decoration-2">
                            Submit Another Request
                          </button>
                        </div>
                      )}
                  </div>
              </div>
            </div>
        )}

        {activeTab === 'track' && (
            <div className="max-w-xl mx-auto">
                <div className="card p-8 md:p-10 border-[var(--border)]">
                    <h3 className="text-2xl font-bold text-center mb-8 text-[var(--text-main)]">Track Your Repair</h3>
                    <form onSubmit={handleTrack} className="flex gap-3 mb-10">
                      <div className="relative flex-1">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={20} />
                          <input 
                            type="text" 
                            placeholder="Enter Code (e.g. R-8821)"
                            className="form-control pl-12 text-lg h-12"
                            value={trackingId}
                            onChange={e => setTrackingId(e.target.value)}
                          />
                      </div>
                      <button type="submit" disabled={isTracking} className="btn btn-primary px-8 h-12">
                        {isTracking ? 'Tracking...' : 'Track'}
                      </button>
                    </form>

                    {trackError && (
                      <div className="text-center text-red-500 mb-6">{trackError}</div>
                    )}

                    {searchResult && (
                        <div className="border-t border-[var(--border)] pt-8 animate-in fade-in slide-in-from-bottom-2">
                          {searchResult === 'not_found' ? (
                              <div className="text-center text-[var(--text-muted)] py-8">
                                  <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                  <p className="text-lg">No repair record found with that code.</p>
                              </div>
                          ) : (
                              <div>
                                  <div className="flex justify-between items-start mb-6">
                                      <div>
                                          <h4 className="font-bold text-2xl text-[var(--text-main)] mb-1">{searchResult.deviceModel}</h4>
                                          <span className="text-sm text-[var(--text-muted)]">{searchResult.issueDescription}</span>
                                      </div>
                                      <span className={`px-4 py-1.5 rounded-full text-sm font-bold capitalize ${searchResult.repairStatus === RepairStatus.COMPLETED ? 'bg-[var(--accent-green)]/20 text-[var(--accent-green)]' : 'bg-[var(--accent-orange)]/20 text-[var(--accent-orange)]'}`}>
                                          {searchResult.repairStatus.replace('_', ' ')}
                                      </span>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4">
                                      <div className="bg-[var(--bg-body)] p-4 rounded-xl border border-[var(--border)]">
                                          <span className="block text-[var(--text-muted)] text-xs uppercase font-bold mb-1">Customer</span>
                                          <span className="font-medium text-[var(--text-main)] truncate block">{searchResult.customerName}</span>
                                      </div>
                                      <div className="bg-[var(--bg-body)] p-4 rounded-xl border border-[var(--border)]">
                                          <span className="block text-[var(--text-muted)] text-xs uppercase font-bold mb-1">Est. Cost</span>
                                          <span className="font-medium text-[var(--text-main)] block">{searchResult.estimatedCost} ETB</span>
                                      </div>
                                  </div>
                                  
                                  {/* Progress Bar Visual */}
                                  <div className="mt-8">
                                      <div className="h-2 w-full bg-[var(--bg-body)] rounded-full overflow-hidden">
                                          <div 
                                            className={`h-full rounded-full transition-all duration-1000 ${
                                              searchResult.repairStatus === RepairStatus.COMPLETED
                                                ? 'bg-[var(--accent-green)] w-full'
                                                : searchResult.repairStatus === RepairStatus.READY
                                                  ? 'bg-[var(--accent-orange)] w-4/5'
                                                  : searchResult.repairStatus === RepairStatus.IN_PROGRESS
                                                    ? 'bg-[var(--accent-orange)] w-1/2'
                                                    : 'bg-[var(--accent-orange)] w-1/4'
                                            }`}
                                          ></div>
                                      </div>
                                      <div className="flex justify-between text-xs text-[var(--text-muted)] mt-2 font-medium uppercase tracking-wide">
                                          <span>Received</span>
                                          <span>In Repair</span>
                                          <span>Ready</span>
                                      </div>
                                  </div>
                              </div>
                          )}
                        </div>
                    )}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Repair;
