
import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowRight, 
  ArrowDown, 
  Menu, 
  ShieldCheck, 
  Clock, 
  Car, 
  Phone, 
  MessageCircle, 
  Facebook, 
  CheckCircle, 
  MapPin, 
  Mail, 
  Smartphone, 
  XCircle, 
  Users, 
  Settings2, 
  Tag, 
  Droplets, 
  ArrowUpRight,
  Send,
  Info,
  Fuel,
  ShieldAlert,
  Wind,
  Truck,
  Anchor,
  Compass,
  Map,
  Ship,
  Shield
} from 'lucide-react';
import { FLEET_DATA, CONTACT_INFO } from './constants';
import { Vehicle, BookingData, ContactPlatform } from './types';
import { generateBookingSummary, openPlatformLink, extractFeeFromService } from './services/messageService';

const ADDITIONAL_SERVICES_LIST = [
  "PICKUP & DROP OFF — CITY PROPER - 5 Seater – 1,000",
  "PICKUP & DROP OFF — CITY PROPER - 7 Seater – 1,200",
  "PICKUP & DROP OFF — CITY PROPER - 14 Seater – 1,500",
  "PICKUP & DROP OFF — PORT BARTON PALAWAN - 5 Seater – 4,500",
  "PICKUP & DROP OFF — PORT BARTON PALAWAN - 7 Seater – 5,500",
  "PICKUP & DROP OFF — PORT BARTON PALAWAN - 14 Seater – 6,000",
  "PICKUP & DROP OFF — SAN VICENTE PALAWAN - 5 Seater – 5,000",
  "PICKUP & DROP OFF — SAN VICENTE PALAWAN - 7 Seater – 6,000",
  "PICKUP & DROP OFF — SAN VICENTE PALAWAN - 14 Seater – 6,500",
  "PICKUP & DROP OFF — EL NIDO PALAWAN - 5 Seater – 6,000",
  "PICKUP & DROP OFF — EL NIDO PALAWAN - 7 Seater – 6,500",
  "PICKUP & DROP OFF — EL NIDO PALAWAN - 14 Seater – 8,000",
  "PICKUP & DROP OFF — BULILUYAN PORT - 5 Seater – 6,000",
  "PICKUP & DROP OFF — BULILUYAN PORT - 7 Seater – 6,500",
  "PICKUP & DROP OFF — BULILUYAN PORT - 14 Seater – 8,000"
];

const App: React.FC = () => {
  const [isNavScrolled, setIsNavScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [unitOverride, setUnitOverride] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showSummaryStage, setShowSummaryStage] = useState(false);
  const [isGeneralBooking, setIsGeneralBooking] = useState(false);
  
  const [bookingForm, setBookingForm] = useState<BookingData>({
    customerName: '',
    contactNumber: '',
    startDate: '',
    endDate: '',
    deliveryLocation: '',
    pickupLocation: '',
    locationArea: 'City Proper',
    additionalService: ADDITIONAL_SERVICES_LIST[0],
    notes: ''
  });

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof BookingData, string>>>({});

  useEffect(() => {
    const handleScroll = () => {
      setIsNavScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleOpenDetails = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setUnitOverride(null);
    setShowDetailModal(true);
  };

  const handleCloseDetails = () => {
    setShowDetailModal(false);
  };

  const handleStartBooking = (vehicle?: Vehicle) => {
    if (vehicle) {
      setSelectedVehicle(vehicle);
      setUnitOverride(null);
      setIsGeneralBooking(false);
    } else {
      setSelectedVehicle(FLEET_DATA[0]);
      setUnitOverride(null);
      setIsGeneralBooking(true);
    }
    setShowDetailModal(false);
    setShowBookingModal(true);
    setShowSummaryStage(false);
  };

  const handleCloseBooking = () => {
    setShowBookingModal(false);
    setFormErrors({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'selectedUnitId') {
      if (value.startsWith('service_')) {
        const serviceName = value.replace('service_', '');
        setUnitOverride(serviceName);
        setSelectedVehicle(null);
      } else {
        const unit = FLEET_DATA.find(v => v.id === parseInt(value));
        if (unit) {
          setSelectedVehicle(unit);
          setUnitOverride(null);
        }
      }
    } else {
      setBookingForm(prev => ({ ...prev, [name]: value }));
    }

    if (formErrors[name as keyof BookingData]) {
      setFormErrors(prev => {
        const next = { ...prev };
        delete next[name as keyof BookingData];
        return next;
      });
    }
  };

  const validateForm = () => {
    const errors: Partial<Record<keyof BookingData, string>> = {};
    if (!bookingForm.customerName.trim()) errors.customerName = 'Required';
    if (!bookingForm.contactNumber.trim()) errors.contactNumber = 'Required';
    if (!bookingForm.startDate) errors.startDate = 'Required';
    if (!bookingForm.endDate) errors.endDate = 'Required';
    if (!bookingForm.deliveryLocation.trim()) errors.deliveryLocation = 'Required';
    if (!bookingForm.pickupLocation.trim()) errors.pickupLocation = 'Required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProceedToSummary = () => {
    if (validateForm()) {
      setShowSummaryStage(true);
    }
  };

  const handleSubmitBooking = (platform: ContactPlatform) => {
    const unit = unitOverride || selectedVehicle;
    if (!unit) return;
    const summary = generateBookingSummary(unit, bookingForm);
    openPlatformLink(platform, summary);
    handleCloseBooking();
  };

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setMobileMenuOpen(false);
    }
  };

  const additionalServicesCards = [
    { title: "CITY PROPER", icon: Truck, s5: "1,000", s7: "1,200", s14: "1,500" },
    { title: "PORT BARTON", icon: Anchor, s5: "4,500", s7: "5,500", s14: "6,000" },
    { title: "SAN VICENTE", icon: Compass, s5: "5,000", s7: "6,000", s14: "6,500" },
    { title: "EL NIDO", icon: Map, s5: "6,000", s7: "6,500", s14: "8,000" },
    { title: "BULILUYAN PORT", icon: Ship, s5: "6,000", s7: "6,500", s14: "8,000" }
  ];

  const currentUnit = unitOverride || selectedVehicle;

  return (
    <div className="min-h-screen bg-brand-50" id="top">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isNavScrolled ? 'glass-nav h-16' : 'glass-nav h-20'}`}>
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <a href="#top" onClick={(e) => scrollToSection(e, 'top')} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 shadow-lg group-hover:scale-105 transition-transform duration-300 shrink-0">
              <img src="https://github.com/bxxmzilla1/ear_car-rental/blob/main/logo.jpeg?raw=true" alt="EAR Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-lg font-medium tracking-tight text-white group-hover:text-brand-100 transition-colors flex items-center gap-2">
              <span className="font-bold">E.A.R.</span>
              <span className="text-white/60 text-sm font-normal hidden sm:inline">Car Rental Services | Palawan</span>
            </span>
          </a>
          
          <div className="flex items-center gap-8 ml-auto">
            <div className="hidden md:flex items-center gap-8 mr-4">
              <a href="#fleet" onClick={(e) => scrollToSection(e, 'fleet')} className="text-xs font-bold uppercase tracking-widest text-white/70 hover:text-white transition-colors">The Fleet</a>
              <a href="#services" onClick={(e) => scrollToSection(e, 'services')} className="text-xs font-bold uppercase tracking-widest text-white/70 hover:text-white transition-colors">Services</a>
              <a href="#contact" onClick={(e) => scrollToSection(e, 'contact')} className="text-xs font-bold uppercase tracking-widest text-white/70 hover:text-white transition-colors">Contact</a>
            </div>

            <button className="text-white hover:text-brand-100 transition-colors btn-neon rounded-full p-1" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="absolute top-full left-0 w-full glass-nav border-b border-white/10 p-8 flex flex-col items-center gap-8 animate-in slide-in-from-top duration-300 shadow-2xl">
            <a href="#fleet" onClick={(e) => scrollToSection(e, 'fleet')} className="text-2xl font-serif font-light text-white hover:text-brand-100 transition-colors">The Fleet</a>
            <a href="#services" onClick={(e) => scrollToSection(e, 'services')} className="text-2xl font-serif font-light text-white hover:text-brand-100 transition-colors">Services</a>
            <a href="#contact" onClick={(e) => scrollToSection(e, 'contact')} className="text-2xl font-serif font-light text-white hover:text-brand-100 transition-colors">Contact</a>
            <button 
              onClick={(e) => { handleStartBooking(); setMobileMenuOpen(false); }}
              className="bg-white text-brand-950 px-10 py-4 rounded-full font-bold uppercase tracking-widest text-xs btn-neon border border-transparent shadow-lg"
            >
              Book Your Unit
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 z-0">
          <img src="https://github.com/bxxmzilla1/ear_car-rental/blob/main/banner.jpg?raw=true" alt="Hero Banner" className="w-full h-full object-cover object-center opacity-40 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-50 via-brand-50/80 to-transparent"></div>
          <div className="bg-gradient-to-r from-brand-50 via-brand-50/40 to-transparent absolute top-0 right-0 bottom-0 left-0"></div>
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 w-full flex flex-col items-center justify-center text-center">
          <div className="glass-card bg-brand-950/20 p-10 md:p-16 rounded-[3rem] border-brand-950/10 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-brand-500/10 border border-brand-500/20">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
              <span className="text-xs font-bold tracking-widest text-brand-950 uppercase">Premium Units Available 2025</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1] mb-8 font-serif">
              <span className="text-white drop-shadow-lg">E.A.R.</span>
              <br className="md:hidden" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-brand-950 to-brand-950 md:ml-4">
                CAR RENTAL
              </span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-brand-950 to-brand-950">SERVICES</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-brand-950 tracking-wide font-medium mb-6 font-serif opacity-90">
              Premium Self-Drive & SUV Car Rental Services in Puerto Princesa, Palawan
            </p>
            
            <p className="text-lg text-brand-950/70 max-w-2xl font-light leading-relaxed mx-auto mb-12">
              Experience reliable and premium car rental services in Puerto Princesa, El Nido, and across Palawan. Choose from our well-maintained selection of sedans and SUVs.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto justify-center">
              <a href="#fleet" onClick={(e) => scrollToSection(e, 'fleet')} className="flex items-center justify-center gap-3 bg-brand-800 text-white px-10 py-5 rounded-full text-sm font-bold tracking-widest uppercase btn-neon border border-transparent shadow-[0_15px_30px_-5px_rgba(36,92,133,0.5)]">
                Explore Fleet
                <ArrowDown className="w-4 h-4" />
              </a>
              <button 
                onClick={() => handleStartBooking()} 
                className="flex items-center justify-center gap-3 bg-transparent border-2 border-brand-950/40 text-brand-950 px-10 py-5 rounded-full text-sm font-bold tracking-widest uppercase btn-neon hover:bg-brand-950 hover:text-white transition-all"
              >
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Fleet Grid */}
      <section className="pt-32 relative scroll-mt-20" id="fleet">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-6">
            <div className="space-y-4">
              <h2 className="text-5xl font-medium text-brand-950 tracking-tight font-serif">The Fleet</h2>
              <p className="text-brand-950/60 font-light max-w-lg text-xl">Curated selection of pristine vehicles available for daily rental.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {FLEET_DATA.map((car) => (
              <div 
                key={car.id} 
                className="group glass-card rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:shadow-[0_30px_60px_-12px_rgba(31,75,87,0.2)] hover:-translate-y-3"
              >
                <div className="relative h-64 overflow-hidden">
                  <img src={car.imageUrl} alt={`${car.brand} ${car.model}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-950/40 via-transparent to-transparent opacity-90"></div>
                  <div className="absolute top-6 left-6 bg-brand-950/90 backdrop-blur-md px-5 py-2 rounded-full text-[11px] font-bold tracking-[0.2em] text-white border border-white/10">
                    {car.year}
                  </div>
                </div>
                <div className="p-10 relative">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-3xl font-bold text-brand-950 tracking-tight leading-tight">{car.brand} {car.model}</h3>
                      <p className="text-xs text-brand-950/50 mt-2 uppercase tracking-[0.2em] font-extrabold">{car.color}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 mb-8 border-b border-brand-950/5 pb-6">
                    <div className="flex items-center gap-2 text-brand-950/70">
                      <Settings2 className="w-5 h-5" />
                      <span className="text-sm font-bold">{car.trans}</span>
                    </div>
                    <div className="flex items-center gap-2 text-brand-950/70">
                      <Users className="w-5 h-5" />
                      <span className="text-sm font-bold">{car.seats}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-4xl font-extrabold text-brand-500">₱{Number(car.price).toLocaleString()}</span>
                      <span className="text-[10px] uppercase text-brand-950/40 tracking-[0.3em] mt-1.5 font-bold">DAILY RATE</span>
                    </div>
                    <button 
                      onClick={() => handleOpenDetails(car)}
                      className="bg-brand-500/10 border border-brand-500/20 hover:bg-brand-500 text-brand-500 hover:text-white transition-all rounded-full p-5 flex items-center justify-center btn-neon shadow-sm"
                    >
                      <ArrowUpRight className="w-7 h-7" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Services Section */}
      <section className="py-24 bg-brand-50 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <h2 className="text-4xl font-medium text-brand-950 tracking-tight font-serif mb-4">Additional Services</h2>
            <div className="w-24 h-1 bg-brand-500/30 rounded-full"></div>
            <p className="text-brand-950/60 mt-4 text-lg">Pick-up and drop-off rates across major Palawan destinations.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {additionalServicesCards.map((service, idx) => (
              <div key={idx} className="glass-card p-8 rounded-[2rem] border-brand-950/5 hover:border-brand-500/30 transition-all duration-300">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-500">
                    <service.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-950/40">PICKUP & DROP OFF</h3>
                    <p className="text-xl font-bold text-brand-950">{service.title}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-brand-950/5 border border-brand-950/5">
                    <span className="text-sm font-bold text-brand-950/60">5 Seater</span>
                    <span className="text-xl font-extrabold text-brand-500">₱{service.s5}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-brand-950/5 border border-brand-950/5">
                    <span className="text-sm font-bold text-brand-950/60">7 Seater</span>
                    <span className="text-xl font-extrabold text-brand-500">₱{service.s7}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-brand-950/5 border border-brand-950/5">
                    <span className="text-sm font-bold text-brand-950/60">14 Seater</span>
                    <span className="text-xl font-extrabold text-brand-500">₱{service.s14}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-950 pb-20 pt-20 border-t border-white/5 relative z-10 text-white">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 text-center md:text-left">
             <div className="flex items-center gap-5 justify-center md:justify-start">
               <div className="w-16 h-16 rounded-full overflow-hidden border border-white/20 shadow-2xl">
                 <img src="https://github.com/bxxmzilla1/ear_car-rental/blob/main/logo.jpeg?raw=true" alt="EAR Logo" className="w-full h-full object-cover" />
               </div>
               <div>
                 <span className="text-4xl font-bold tracking-tight block">E.A.R. Car Rental</span>
                 <span className="text-[11px] text-white/40 uppercase tracking-[0.4em] font-extrabold">Palawan's Premier Choice</span>
               </div>
             </div>
             <p className="text-lg text-white/50 max-w-lg leading-relaxed font-light italic">Experience Palawan with the reliability of our premium vehicle fleet. Excellence is our standard.</p>
          </div>
          <div className="flex flex-col items-center md:items-end gap-8">
            <div className="flex gap-12">
              <a href="#" className="text-[12px] text-white/40 uppercase tracking-[0.3em] hover:text-white transition-colors font-bold">Privacy Policy</a>
              <a href="#" className="text-[12px] text-white/40 uppercase tracking-[0.3em] hover:text-white transition-colors font-bold">Terms of Use</a>
            </div>
            <p className="text-[11px] text-white/30 uppercase tracking-[0.3em] font-bold">© 2025 E.A.R. Car Rental Services • Puerto Princesa City</p>
          </div>
        </div>
      </footer>

      {/* Booking Modal */}
      {showBookingModal && currentUnit && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 overflow-y-auto">
          <div className="absolute inset-0 bg-brand-950/75 backdrop-blur-2xl" onClick={handleCloseBooking}></div>
          <div className="bg-brand-50 border border-brand-950/10 rounded-[3rem] shadow-2xl relative overflow-hidden w-full max-w-xl z-20 animate-in slide-in-from-bottom duration-500">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-100 via-brand-950 to-brand-100"></div>
            
            {!showSummaryStage ? (
              <div className="p-10 md:p-14 space-y-8">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-3xl font-bold text-brand-950 tracking-tight font-serif">Reservation</h3>
                    <p className="text-brand-950/60 text-lg mt-2 font-medium">Selected: <span className="text-brand-950 font-bold underline decoration-brand-500/50 underline-offset-8">
                      {typeof currentUnit === 'string' ? currentUnit : `${currentUnit.brand} ${currentUnit.model}`}
                    </span></p>
                  </div>
                  <button onClick={handleCloseBooking} className="text-brand-950/40 hover:text-brand-500 transition-colors btn-neon rounded-full p-2">
                    <XCircle className="w-10 h-10" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-brand-950">
                  {isGeneralBooking && (
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[12px] uppercase text-brand-950/40 tracking-[0.2em] font-extrabold">Select Unit or Services</label>
                      <select 
                        name="selectedUnitId" 
                        value={unitOverride ? `service_${unitOverride}` : selectedVehicle?.id} 
                        onChange={handleInputChange} 
                        className="w-full bg-white border border-brand-950/10 rounded-2xl px-5 py-4 text-base focus:outline-none focus:border-brand-500 transition-all shadow-sm"
                      >
                        <optgroup label="Units">
                          {FLEET_DATA.map(v => (
                            <option key={v.id} value={v.id}>{v.year} {v.brand} {v.model} (₱{Number(v.price).toLocaleString()}/day)</option>
                          ))}
                        </optgroup>
                        <optgroup label="Services">
                          {ADDITIONAL_SERVICES_LIST.map((service, i) => (
                            <option key={`svc-${i}`} value={`service_${service}`}>{service}</option>
                          ))}
                        </optgroup>
                      </select>
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-[12px] uppercase text-brand-950/40 tracking-[0.2em] font-extrabold">Name</label>
                    <input name="customerName" value={bookingForm.customerName} onChange={handleInputChange} placeholder="Your Full Name" className={`w-full bg-white border ${formErrors.customerName ? 'border-red-500' : 'border-brand-950/10'} rounded-2xl px-5 py-4 text-base focus:outline-none focus:border-brand-500 transition-all shadow-sm`} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] uppercase text-brand-950/40 tracking-[0.2em] font-extrabold">Contact</label>
                    <input name="contactNumber" value={bookingForm.contactNumber} onChange={handleInputChange} placeholder="Phone Number" className={`w-full bg-white border ${formErrors.contactNumber ? 'border-red-500' : 'border-brand-950/10'} rounded-2xl px-5 py-4 text-base focus:outline-none focus:border-brand-500 transition-all shadow-sm`} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] uppercase text-brand-950/40 tracking-[0.2em] font-extrabold">Additional Services</label>
                    <select name="additionalService" value={bookingForm.additionalService} onChange={handleInputChange} className="w-full bg-white border border-brand-950/10 rounded-2xl px-5 py-4 text-base focus:outline-none focus:border-brand-500 transition-all shadow-sm">
                      {ADDITIONAL_SERVICES_LIST.map((service, i) => (
                        <option key={i} value={service}>{service}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] uppercase text-brand-950/40 tracking-[0.2em] font-extrabold">Start Date of Rent</label>
                    <input name="startDate" type="date" value={bookingForm.startDate} onChange={handleInputChange} className={`w-full bg-white border ${formErrors.startDate ? 'border-red-500' : 'border-brand-950/10'} rounded-2xl px-5 py-4 text-base focus:outline-none focus:border-brand-500 transition-all text-brand-950 shadow-sm`} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] uppercase text-brand-950/40 tracking-[0.2em] font-extrabold">Deliver Location</label>
                    <input name="deliveryLocation" value={bookingForm.deliveryLocation} onChange={handleInputChange} placeholder="Pickup point" className={`w-full bg-white border ${formErrors.deliveryLocation ? 'border-red-500' : 'border-brand-950/10'} rounded-2xl px-5 py-4 text-base focus:outline-none focus:border-brand-500 transition-all shadow-sm`} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] uppercase text-brand-950/40 tracking-[0.2em] font-extrabold">End Date of Rent</label>
                    <input name="endDate" type="date" value={bookingForm.endDate} onChange={handleInputChange} className={`w-full bg-white border ${formErrors.endDate ? 'border-red-500' : 'border-brand-950/10'} rounded-2xl px-5 py-4 text-base focus:outline-none focus:border-brand-500 transition-all text-brand-950 shadow-sm`} />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[12px] uppercase text-brand-950/40 tracking-[0.2em] font-extrabold">Pick-Up Location</label>
                    <input name="pickupLocation" value={bookingForm.pickupLocation} onChange={handleInputChange} placeholder="Return point" className={`w-full bg-white border ${formErrors.pickupLocation ? 'border-red-500' : 'border-brand-950/10'} rounded-2xl px-5 py-4 text-base focus:outline-none focus:border-brand-500 transition-all shadow-sm`} />
                  </div>
                </div>

                <button onClick={handleProceedToSummary} className="w-full bg-brand-950 text-white py-6 rounded-full text-xl font-bold hover:bg-brand-500 transition-all shadow-2xl btn-neon mt-8">
                  Review Booking Summary
                </button>
              </div>
            ) : (
              <div className="p-10 md:p-14 space-y-8 animate-in slide-in-from-right duration-300">
                <div className="flex justify-between items-start">
                  <h3 className="text-3xl font-bold text-brand-950 tracking-tight font-serif">Booking Confirmation</h3>
                  <button onClick={() => setShowSummaryStage(false)} className="text-brand-950/40 hover:text-brand-500 transition-colors text-sm font-bold underline">Go Back</button>
                </div>

                <div className="glass-card bg-brand-950/5 border-brand-950/10 p-8 rounded-3xl space-y-3 text-sm text-brand-950 font-medium">
                  <p>
                    <span className="text-brand-950/40 uppercase tracking-widest text-[10px] block mb-1">Unit</span> 
                    {typeof currentUnit === 'string' ? currentUnit : `${currentUnit.year} ${currentUnit.brand} ${currentUnit.model} (${currentUnit.color})`}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <p><span className="text-brand-950/40 uppercase tracking-widest text-[10px] block mb-1">Name</span> {bookingForm.customerName}</p>
                    <p><span className="text-brand-950/40 uppercase tracking-widest text-[10px] block mb-1">Contact</span> {bookingForm.contactNumber}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <p><span className="text-brand-950/40 uppercase tracking-widest text-[10px] block mb-1">Start Date</span> {bookingForm.startDate}</p>
                    <p><span className="text-brand-950/40 uppercase tracking-widest text-[10px] block mb-1">End Date</span> {bookingForm.endDate}</p>
                  </div>
                  <p><span className="text-brand-950/40 uppercase tracking-widest text-[10px] block mb-1">Deliver Location</span> {bookingForm.deliveryLocation}</p>
                  <p><span className="text-brand-950/40 uppercase tracking-widest text-[10px] block mb-1">Pick-Up Location</span> {bookingForm.pickupLocation}</p>
                  
                  <div className="border-t border-brand-950/10 pt-4 mt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-brand-950/40">Daily Rate</span>
                      <span className="font-bold">₱{typeof currentUnit === 'string' ? '0' : Number(currentUnit.price).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-950/40">Delivery & Pick-Up Fee</span>
                      <span className="font-bold">₱{Number(extractFeeFromService(bookingForm.additionalService)).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-950/40">Car Wash Fee</span>
                      <span className="font-bold">₱{typeof currentUnit === 'string' ? '0' : Number(currentUnit.wash).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-brand-950/5">
                      <span className="text-brand-950/40">Security Deposit</span>
                      <span className="font-bold">2,000</span>
                    </div>
                  </div>

                  <p><span className="text-brand-950/40 uppercase tracking-widest text-[10px] block mb-1">Additional Services</span> {bookingForm.additionalService}</p>
                  
                  <p className="text-[11px] text-brand-500 italic pt-4">Note: Refundable after car return without damage</p>
                </div>

                <div className="space-y-6">
                  <p className="text-center text-[12px] uppercase text-brand-950/40 tracking-[0.4em] font-extrabold">Confirm & Send Inquiry Via</p>
                  <div className="grid grid-cols-3 gap-6">
                    <button onClick={() => handleSubmitBooking(ContactPlatform.WHATSAPP)} className="flex flex-col items-center gap-3 p-5 bg-white border border-brand-950/10 rounded-3xl transition-all text-brand-500 btn-neon shadow-sm">
                      <MessageCircle className="w-8 h-8" />
                      <span className="text-[10px] font-extrabold uppercase tracking-widest">WhatsApp</span>
                    </button>
                    <button onClick={() => handleSubmitBooking(ContactPlatform.VIBER)} className="flex flex-col items-center gap-3 p-5 bg-white border border-brand-950/10 rounded-3xl transition-all text-brand-500 btn-neon shadow-sm">
                      <Send className="w-8 h-8" />
                      <span className="text-[10px] font-extrabold uppercase tracking-widest">Viber</span>
                    </button>
                    <button onClick={() => handleSubmitBooking(ContactPlatform.MESSENGER)} className="flex flex-col items-center gap-3 p-5 bg-white border border-brand-950/10 rounded-3xl transition-all text-brand-500 btn-neon shadow-sm">
                      <Facebook className="w-8 h-8" />
                      <span className="text-[10px] font-extrabold uppercase tracking-widest">Messenger</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detail Modal - Styled to match image */}
      {showDetailModal && selectedVehicle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-brand-950/80 backdrop-blur-xl" onClick={handleCloseDetails}></div>
          <div className="bg-[#0A0A0A] border border-white/5 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] relative overflow-hidden w-full max-w-2xl z-10 animate-in zoom-in duration-300">
            <div className="max-h-[95vh] overflow-y-auto no-scrollbar text-white">
              {/* Image Section */}
              <div className="relative h-64 sm:h-80 overflow-hidden">
                <img src={selectedVehicle.imageUrl} alt={selectedVehicle.model} className="w-full h-full object-cover opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent"></div>
                <button 
                  onClick={handleCloseDetails} 
                  className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center transition-all"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {/* Content Section */}
              <div className="px-8 sm:px-12 pb-12 pt-4 space-y-10">
                {/* Brand & Model Header */}
                <div className="space-y-1">
                  <h3 className="text-4xl font-bold tracking-tight">{selectedVehicle.brand} {selectedVehicle.model}</h3>
                  <p className="text-white/40 text-xs uppercase tracking-[0.3em] font-bold">{selectedVehicle.year} Edition • {selectedVehicle.color}</p>
                </div>

                {/* Overview */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5 text-brand-100">
                    <Info className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-widest">Overview</span>
                  </div>
                  <p className="text-white/60 text-xl leading-relaxed font-light">
                    {selectedVehicle.description}
                  </p>
                </div>

                {/* Specs Grid - 4 Card Style */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/[0.03] border border-white/[0.05] p-6 rounded-3xl flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-brand-100">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest mb-0.5">Capacity</p>
                      <p className="text-lg font-bold">{selectedVehicle.seats}</p>
                    </div>
                  </div>
                  <div className="bg-white/[0.03] border border-white/[0.05] p-6 rounded-3xl flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-brand-100">
                      <Fuel className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest mb-0.5">Fuel Type</p>
                      <p className="text-lg font-bold">{selectedVehicle.fuelType || 'Gasoline'}</p>
                    </div>
                  </div>
                  <div className="bg-white/[0.03] border border-white/[0.05] p-6 rounded-3xl flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-brand-100">
                      <Settings2 className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest mb-0.5">Transmission</p>
                      <p className="text-lg font-bold">{selectedVehicle.trans === 'AT' ? 'Automatic' : 'Manual'}</p>
                    </div>
                  </div>
                  <div className="bg-white/[0.03] border border-white/[0.05] p-6 rounded-3xl flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-brand-100">
                      <Shield className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest mb-0.5">Service</p>
                      <p className="text-[14px] font-bold leading-tight">{selectedVehicle.serviceType || 'Self-drive or with driver'}</p>
                    </div>
                  </div>
                </div>

                {/* Rental Features */}
                <div className="space-y-6">
                  <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">Rental Features</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                    {[
                      "Unlimited Mileage",
                      "Clean & Sanitized Interior",
                      "Strong Air-Conditioning",
                      "Comprehensive Insurance",
                      "Well-maintained Unit",
                      `Carwash Fee: ₱${selectedVehicle.wash}`
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center gap-3 text-white/80">
                        <CheckCircle className="w-5 h-5 text-brand-100" />
                        <span className="text-sm font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Main Action Button */}
                <div className="pt-6">
                  <button 
                    onClick={() => handleStartBooking(selectedVehicle)} 
                    className="w-full bg-white text-black py-6 rounded-full text-xl font-bold hover:bg-brand-100 transition-all shadow-[0_15px_30px_rgba(255,255,255,0.1)] active:scale-[0.98]"
                  >
                    Book for ₱{Number(selectedVehicle.price).toLocaleString()}/Day
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;