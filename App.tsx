
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ArrowDown, 
  Menu, 
  ShieldCheck, 
  Clock, 
  Car, 
  MessageCircle, 
  Facebook, 
  CheckCircle, 
  MapPin, 
  Smartphone, 
  XCircle, 
  Users, 
  Settings2, 
  ArrowUpRight,
  Send,
  Info,
  Fuel,
  Shield,
  Truck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { FLEET_DATA, CONTACT_INFO } from './constants';
import { Vehicle, BookingData, ContactPlatform } from './types';
import { generateBookingSummary, openPlatformLink } from './services/messageService';

const parsePrice = (value: string | number): number => {
  if (typeof value === 'number') return value;
  return Number(String(value || '0').replace(/,/g, '')) || 0;
};

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
  const [availabilityCheckedById, setAvailabilityCheckedById] = useState<Record<number, boolean>>({});
  
  const [bookingForm, setBookingForm] = useState<BookingData>({
    customerName: '',
    contactNumber: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    deliveryLocation: '',
    pickupLocation: '',
    locationArea: 'City Proper',
    additionalService: 'N/A',
    notes: ''
  });

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof BookingData, string>>>({});
  const [additionalServicesIndex, setAdditionalServicesIndex] = useState(0);
  const additionalServicesRef = useRef<HTMLDivElement>(null);

  const ADDITIONAL_SERVICES_RATES = [
    { title: 'CITY PROPER', s5: '1,000', s7: '1,200', s14: '1,500' },
    { title: 'PORT BARTON PALAWAN', s5: '4,500', s7: '5,500', s14: '6,000' },
    { title: 'SAN VICENTE PALAWAN', s5: '5,000', s7: '6,000', s14: '6,500' },
    { title: 'EL NIDO PALAWAN', s5: '6,000', s7: '6,500', s14: '8,000' },
    { title: 'BULILUYAN PORT', s5: '6,000', s7: '6,500', s14: '8,000' }
  ];

  const scrollAdditionalServices = (direction: 'prev' | 'next') => {
    const container = additionalServicesRef.current;
    if (!container) return;
    const cardWidth = container.offsetWidth;
    const scrollAmount = direction === 'next' ? cardWidth : -cardWidth;
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsNavScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (showBookingModal) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [showBookingModal]);

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

  useEffect(() => {
    const container = additionalServicesRef.current;
    if (!container) return;
    const handleScroll = () => {
      const itemWidth = container.scrollWidth / ADDITIONAL_SERVICES_RATES.length;
      const index = Math.min(Math.round(container.scrollLeft / itemWidth), ADDITIONAL_SERVICES_RATES.length - 1);
      setAdditionalServicesIndex(Math.max(0, index));
    };
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

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

  const currentUnit = unitOverride || selectedVehicle;
  const SECURITY_DEPOSIT_PHP = 3000;
  const MIN_RENTAL_DAYS = 3;

  return (
    <div className="min-h-screen bg-brand-50" id="top">
      {/* Navigation */}
      <nav className={`relative w-full z-50 transition-all duration-300 ${isNavScrolled ? 'glass-nav h-16' : 'glass-nav h-20'}`}>
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <a href="#top" onClick={(e) => scrollToSection(e, 'top')} className="flex items-center gap-3 group" title="E.A.R. Car Rental Puerto Princesa - Palawan Car Rental Home">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 shadow-lg group-hover:scale-105 transition-transform duration-300 shrink-0">
              <img src="https://raw.githubusercontent.com/bxxmzilla1/earcarrental/main/logo.png" alt="E.A.R. Car Rental - Puerto Princesa Palawan Car Rental" className="w-full h-full object-cover" />
            </div>
            <span className="text-lg font-medium tracking-tight text-white group-hover:text-brand-100 transition-colors flex items-center gap-2">
              <span className="font-bold">E.A.R.</span>
              <span className="text-white/60 text-sm font-normal hidden sm:inline">Car Rental Services | Palawan</span>
            </span>
          </a>
          
          <div className="flex items-center gap-8 ml-auto">
            <div className="hidden md:flex items-center gap-8 mr-4">
              <a href="#fleet" onClick={(e) => scrollToSection(e, 'fleet')} title="View car rental fleet in Puerto Princesa Palawan" className="text-xs font-bold uppercase tracking-widest text-white/70 hover:text-white transition-colors">Our Collection</a>
              <a href="#services" onClick={(e) => scrollToSection(e, 'services')} title="Car rental services - El Nido, Port Barton, San Vicente" className="text-xs font-bold uppercase tracking-widest text-white/70 hover:text-white transition-colors">Services</a>
              <a href="#contact" onClick={(e) => scrollToSection(e, 'contact')} title="Contact E.A.R. Car Rental Puerto Princesa" className="text-xs font-bold uppercase tracking-widest text-white/70 hover:text-white transition-colors">Contact</a>
            </div>

            <button className="text-white hover:text-brand-100 transition-colors btn-neon rounded-full p-1" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="absolute top-full left-0 w-full glass-nav border-b border-white/10 p-8 flex flex-col items-center gap-8 animate-in slide-in-from-top duration-300 shadow-2xl">
            <a href="#fleet" onClick={(e) => scrollToSection(e, 'fleet')} title="View car rental fleet in Puerto Princesa Palawan" className="text-2xl font-serif font-light text-white hover:text-brand-100 transition-colors">Our Collection</a>
            <a href="#services" onClick={(e) => scrollToSection(e, 'services')} title="Car rental services - El Nido, Port Barton, San Vicente" className="text-2xl font-serif font-light text-white hover:text-brand-100 transition-colors">Services</a>
            <a href="#contact" onClick={(e) => scrollToSection(e, 'contact')} title="Contact E.A.R. Car Rental Puerto Princesa" className="text-2xl font-serif font-light text-white hover:text-brand-100 transition-colors">Contact</a>
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
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pb-32">
        <div className="absolute inset-0 z-0">
          <img src="https://raw.githubusercontent.com/bxxmzilla1/earcarrental/main/banner.jpeg" alt="Hero Banner" className="w-full h-full object-cover object-center opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-50 via-brand-50/80 to-transparent"></div>
          <div className="bg-gradient-to-r from-brand-50 via-brand-50/40 to-transparent absolute top-0 right-0 bottom-0 left-0"></div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-[120px] animate-pulse-slow pointer-events-none"></div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-6 w-full flex flex-col items-center justify-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full bg-white/45 border border-brand-950/10 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
            <span className="text-xs font-medium tracking-wide text-brand-950">Premium Units Available 2025</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight leading-[1.1] mb-6 font-serif">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-950 via-brand-950 to-brand-800">E.A.R. CAR RENTAL</span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-950 via-brand-950 to-brand-800">SERVICES</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-brand-950 tracking-wide font-light mb-8 font-serif">
            Premium Self-Drive & SUV Car Rental Services in Puerto Princesa, Palawan
          </p>
          
          <p className="text-lg text-brand-950/70 max-w-xl font-light leading-relaxed mx-auto mb-10">
            Experience reliable and premium car rental services in Puerto Princesa, El Nido, and across Palawan. Choose from sedans, SUVs, vans, and pickup trucks perfect for island travel and long-distance drives.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
            <a href="#fleet" onClick={(e) => scrollToSection(e, 'fleet')} title="Browse car rental fleet - Puerto Princesa Palawan" className="flex items-center justify-center gap-3 bg-brand-800 text-white px-8 py-4 rounded-full text-sm font-semibold tracking-wide btn-neon border border-transparent shadow-[0_0_25px_-5px_rgba(36,92,133,0.5)]">
              Explore Fleet
              <ArrowDown className="w-4 h-4" />
            </a>
            <button 
              onClick={() => handleStartBooking()} 
              className="flex items-center justify-center gap-3 bg-transparent border border-brand-950/20 text-brand-950 px-8 py-4 rounded-full text-sm font-medium tracking-wide btn-neon hover:bg-brand-950 hover:text-white transition-all"
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-white/10 bg-brand-950 backdrop-blur-sm relative z-20 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="space-y-1 text-center md:text-left">
            <p className="text-3xl font-medium text-white tracking-tight font-serif">15+</p>
            <p className="text-xs uppercase tracking-widest text-white/50">Available Rental Vehicles</p>
          </div>
          <div className="space-y-1 text-center md:text-left">
            <p className="text-3xl font-medium text-white tracking-tight font-serif">24/7</p>
            <p className="uppercase text-xs text-white/50 tracking-widest">Customer Support in Palawan</p>
          </div>
          <div className="space-y-1 text-center md:text-left">
            <p className="text-3xl font-medium text-white tracking-tight font-serif">100%</p>
            <p className="text-xs uppercase tracking-widest text-white/50">Trusted Car Rental in Puerto Princesa</p>
          </div>
          <div className="space-y-1 text-center md:text-left">
            <p className="text-3xl font-medium text-white tracking-tight font-serif">0%</p>
            <p className="text-xs uppercase tracking-widest text-white/50">Transparent Pricing - No Hidden Fees</p>
          </div>
        </div>
      </section>

      {/* Fleet Grid */}
      <section className="pt-32 pb-32 relative scroll-mt-20" id="fleet">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="space-y-4">
              <h2 className="text-4xl font-medium text-brand-950 tracking-tight font-serif">Our Collection</h2>
              <p className="text-brand-950/60 font-light max-w-lg text-lg">Explore our fleet of well-maintained sedans, SUVs, vans, and 4x4 pickups available for daily car rental in Puerto Princesa, Palawan.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FLEET_DATA.map((car) => (
              <div key={car.id} className="group rounded-[1.75rem] bg-white/80 border border-brand-950/10 shadow-[0_20px_60px_-25px_rgba(15,23,42,0.35)] overflow-hidden transition-transform duration-300 hover:-translate-y-1">
                <div className="relative h-56 overflow-hidden bg-brand-950/5">
                  <img
                    src={car.imageUrl}
                    alt={`${car.brand} ${car.model}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                  <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-semibold tracking-widest text-white border border-white/10">
                    {car.year}
                  </div>

                  <label className="absolute left-4 bottom-4 inline-flex items-center gap-2 bg-white/90 backdrop-blur-md border border-brand-950/10 shadow-sm rounded-full px-3 py-2 select-none cursor-pointer">
                    <input
                      type="checkbox"
                      className="accent-brand-500"
                      checked={availabilityCheckedById[car.id] ?? true}
                      onChange={(e) => setAvailabilityCheckedById((prev) => ({ ...prev, [car.id]: e.target.checked }))}
                      aria-label={`Check availability for ${car.brand} ${car.model}`}
                    />
                    <span className="text-xs font-semibold text-brand-950/80">Check availability</span>
                  </label>
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between gap-6">
                    <div className="min-w-0">
                      <h3 className="text-xl font-bold text-brand-950 tracking-tight break-words">
                        {car.brand} {car.model} <span className="text-brand-950/60 font-semibold">({car.color})</span>
                      </h3>

                      <div className="mt-3 space-y-2 text-sm text-brand-950/70">
                        <div className="flex items-center gap-2">
                          <Info className="w-4 h-4 text-brand-950/50" />
                          <span className="font-semibold">Deposit:</span>
                          <span>₱{SECURITY_DEPOSIT_PHP.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-brand-950/50" />
                          <span>Puerto Princesa, Palawan, Philippines</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-brand-950/50" />
                          <span>Minimum {MIN_RENTAL_DAYS} days rental</span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-brand-950/40">Price per day</p>
                      <p className="text-4xl font-extrabold text-brand-950 tracking-tight">
                        ₱{parsePrice(car.price).toLocaleString()}
                      </p>
                      <p className="text-sm text-brand-950/60 font-semibold mt-1">
                        Monthly: ₱{(parsePrice(car.price) * 30).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 text-brand-950/70">
                      <div className="flex items-center gap-1.5">
                        <Settings2 className="w-4 h-4" />
                        <span className="text-xs font-semibold">{car.trans === 'AT' ? 'Automatic' : 'Manual'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        <span className="text-xs font-semibold">{car.seats}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenDetails(car)}
                    className="mt-6 w-full bg-brand-500 text-white py-4 rounded-2xl font-extrabold uppercase tracking-widest text-xs hover:bg-brand-800 transition-colors shadow-[0_15px_35px_-15px_rgba(58,127,136,0.6)] btn-neon"
                  >
                    View Deal
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Services - Pickup & Drop Off Rates Carousel */}
      <section id="additional-services" className="py-24 bg-brand-50 relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <h2 className="text-4xl font-medium text-brand-950 tracking-tight font-serif mb-4">Additional Services</h2>
            <div className="w-24 h-1 bg-brand-500/30 rounded-full"></div>
            <p className="text-brand-950/60 mt-4 text-lg">Pick-up and drop-off rates across major Palawan destinations.</p>
          </div>

          <div ref={additionalServicesRef} className="flex gap-8 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar -mx-6 px-6" style={{ scrollSnapType: 'x mandatory' }}>
            {ADDITIONAL_SERVICES_RATES.map((service) => (
              <div key={service.title} className="flex-shrink-0 w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)] snap-center">
                <div className="glass-card p-8 rounded-[2rem] border-brand-950/5 hover:border-brand-500/30 transition-all duration-300 h-full">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-500">
                      <Truck className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-950/40">PICKUP & DROP OFF</h3>
                      <p className="text-xl font-bold text-brand-950">{service.title}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-brand-950/5 border border-brand-950/5">
                      <span className="text-sm font-bold text-brand-950/60">5 seater</span>
                      <span className="text-xl font-extrabold text-brand-500">₱{service.s5}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-brand-950/5 border border-brand-950/5">
                      <span className="text-sm font-bold text-brand-950/60">7 seater</span>
                      <span className="text-xl font-extrabold text-brand-500">₱{service.s7}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-brand-950/5 border border-brand-950/5">
                      <span className="text-sm font-bold text-brand-950/60">14 seater</span>
                      <span className="text-xl font-extrabold text-brand-500">₱{service.s14}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-4 mt-12">
            <button onClick={() => scrollAdditionalServices('prev')} aria-label="Previous" className="w-12 h-12 rounded-full bg-brand-950/10 hover:bg-brand-500 text-brand-950 hover:text-white transition-all flex items-center justify-center border border-brand-950/10">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="flex gap-2">
              {ADDITIONAL_SERVICES_RATES.map((_, i) => (
                <button key={i} onClick={() => { const c = additionalServicesRef.current; if (c) { const itemWidth = c.scrollWidth / ADDITIONAL_SERVICES_RATES.length; c.scrollTo({ left: i * itemWidth, behavior: 'smooth' }); setAdditionalServicesIndex(i); } }} className={`w-2.5 h-2.5 rounded-full transition-colors ${i === additionalServicesIndex ? 'bg-brand-500 scale-125' : 'bg-brand-950/30 hover:bg-brand-950/50'}`} aria-label={`Go to slide ${i + 1}`} />
              ))}
            </div>
            <button onClick={() => scrollAdditionalServices('next')} aria-label="Next" className="w-12 h-12 rounded-full bg-brand-950/10 hover:bg-brand-500 text-brand-950 hover:text-white transition-all flex items-center justify-center border border-brand-950/10">
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>

      {/* Services - Value Props */}
      <section id="services" className="py-24 bg-white/30 border-t border-brand-950/5 scroll-mt-20 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="glass-card p-8 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity text-brand-500">
                <ShieldCheck className="w-20 h-20" />
              </div>
              <div className="w-12 h-12 rounded-full bg-brand-950/10 flex items-center justify-center mb-6 text-brand-500 group-hover:text-brand-800 transition-colors">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-medium text-brand-950 mb-3 tracking-tight group-hover:text-brand-500 transition-colors">Secure & Insured</h3>
              <p className="text-base text-brand-950/60 leading-relaxed font-light">Every vehicle comes with comprehensive insurance options for your peace of mind while on the road.</p>
            </div>
            <div className="glass-card p-8 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity text-brand-500">
                <Clock className="w-20 h-20" />
              </div>
              <div className="w-12 h-12 rounded-full bg-brand-950/10 flex items-center justify-center mb-6 text-brand-500 group-hover:text-brand-800 transition-colors">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-medium text-brand-950 mb-3 tracking-tight group-hover:text-brand-500 transition-colors">Flexible Duration</h3>
              <p className="text-base text-brand-950/60 leading-relaxed font-light">Whether it&apos;s a day trip or a month-long expedition, we offer flexible rental periods tailored to you.</p>
            </div>
            <div className="glass-card p-8 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity text-brand-500">
                <Car className="w-20 h-20" />
              </div>
              <div className="w-12 h-12 rounded-full bg-brand-950/10 flex items-center justify-center mb-6 text-brand-500 group-hover:text-brand-800 transition-colors">
                <Car className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-medium text-brand-950 mb-3 tracking-tight group-hover:text-brand-500 transition-colors">Pristine Condition</h3>
              <p className="text-base text-brand-950/60 leading-relaxed font-light">Each unit undergoes a rigorous 20-point inspection and professional cleaning before handover.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32 relative overflow-hidden bg-brand-950 scroll-mt-20">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-brand-500/10 blur-[120px] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
            <h2 className="text-5xl md:text-6xl font-medium text-white tracking-tight font-serif drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">Connect With Us</h2>
            <div className="w-24 h-0.5 bg-white/20 mx-auto rounded-full"></div>
            <p className="text-white/60 text-lg md:text-xl font-light leading-relaxed">Quick and secure booking support via WhatsApp, Viber, or Facebook. Serving Brgy. San Jose, Puerto Princesa City, El Nido, and nearby areas in Palawan.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
            <button onClick={() => openPlatformLink(ContactPlatform.WHATSAPP, 'Hi! I\'d like to inquire about car rental.')} className="glass-card group p-8 rounded-[2rem] hover:border-brand-400/50 transition-all duration-500 hover:shadow-[0_0_40px_-10px_rgba(127,169,175,0.2)] flex flex-col items-center text-center btn-neon border border-white/5">
              <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform group-hover:text-brand-950">
                <MessageCircle className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-bold uppercase tracking-widest text-white/50 mb-2 group-hover:text-brand-950 transition-colors">WhatsApp</h4>
              <p className="text-xl font-medium text-white group-hover:text-brand-950 transition-colors">+63 946 349 3363</p>
            </button>
            <button onClick={() => openPlatformLink(ContactPlatform.VIBER, 'Hi! I\'d like to inquire about car rental.')} className="glass-card group p-8 rounded-[2rem] hover:border-brand-400/50 transition-all duration-500 hover:shadow-[0_0_40px_-10px_rgba(127,169,175,0.2)] flex flex-col items-center text-center btn-neon border border-white/5">
              <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform group-hover:text-brand-950">
                <Send className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-bold uppercase tracking-widest text-white/50 mb-2 group-hover:text-brand-950 transition-colors">Viber</h4>
              <p className="text-xl font-medium text-white group-hover:text-brand-950 transition-colors">+63 946 349 3363</p>
            </button>
            <button onClick={() => openPlatformLink(ContactPlatform.MESSENGER, '')} className="glass-card group p-8 rounded-[2rem] hover:border-brand-400/50 transition-all duration-500 hover:shadow-[0_0_40px_-10px_rgba(127,169,175,0.2)] flex flex-col items-center text-center btn-neon border border-white/5">
              <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform group-hover:text-brand-950">
                <Facebook className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-bold uppercase tracking-widest text-white/50 mb-2 group-hover:text-brand-950 transition-colors">Facebook</h4>
              <p className="text-xl font-medium text-white group-hover:text-brand-950 transition-colors">E.A.R. Car Rental</p>
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div className="glass-card group p-10 rounded-[2.5rem] border-white/5 hover:border-brand-500/30 transition-colors">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-brand-100 group-hover:text-brand-950 transition-colors">
                  <MapPin className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold uppercase tracking-widest text-white/50 group-hover:text-brand-950 transition-colors">Location</h4>
              </div>
              <a href={CONTACT_INFO.mapsUrl} target="_blank" rel="noopener noreferrer" title="E.A.R. Car Rental location - Puerto Princesa City Palawan" className="text-white/80 text-lg font-light leading-relaxed group-hover:text-brand-950 transition-colors block">{CONTACT_INFO.address}</a>
            </div>
            <div className="glass-card group p-10 rounded-[2.5rem] border-white/5 hover:border-brand-500/30 transition-colors">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-brand-100 group-hover:text-brand-950 transition-colors">
                  <Smartphone className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold uppercase tracking-widest text-white/50 group-hover:text-brand-950 transition-colors">Phone</h4>
              </div>
              <a href={`tel:${CONTACT_INFO.phone}`} title="Call E.A.R. Car Rental Puerto Princesa" className="text-white/80 text-lg font-light hover:text-brand-950 transition-colors block">{CONTACT_INFO.phone}</a>
              <p className="text-white/60 text-base mt-4 font-light group-hover:text-brand-950 transition-colors">{CONTACT_INFO.email}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-950/50 border-t border-white/5 relative z-10 py-12 text-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20">
              <img src="https://raw.githubusercontent.com/bxxmzilla1/earcarrental/main/logo.png" alt="E.A.R. Car Rental - Puerto Princesa Palawan Car Rental" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight">E.A.R. Car Rental</span>
              <span className="text-[10px] text-white/40 uppercase tracking-[0.3em] font-bold block">Palawan&apos;s Premier Choice</span>
            </div>
          </div>
          <div className="flex gap-8">
            <a href="#privacy-policy" title="E.A.R. Car Rental Privacy Policy" className="text-[11px] text-white/40 uppercase tracking-[0.2em] hover:text-white transition-colors font-bold">Privacy Policy</a>
            <a href="#terms-of-use" title="E.A.R. Car Rental Terms of Use" className="text-[11px] text-white/40 uppercase tracking-[0.2em] hover:text-white transition-colors font-bold">Terms of Use</a>
          </div>
          <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold">© 2025 E.A.R. Car Rental Services • Puerto Princesa City</p>
        </div>
      </footer>

      {/* Booking Modal */}
      {showBookingModal && currentUnit && (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-brand-950/75 backdrop-blur-2xl" onClick={handleCloseBooking}></div>
          <div className="bg-brand-50 border border-brand-950/10 rounded-t-[2rem] sm:rounded-[3rem] shadow-2xl relative overflow-hidden w-full max-w-xl z-20 animate-in slide-in-from-bottom duration-500 flex flex-col h-[100dvh] sm:h-auto sm:max-h-[90vh] sm:my-6">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-100 via-brand-950 to-brand-100 shrink-0"></div>
            
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
            {!showSummaryStage ? (
              <div className="p-5 sm:p-10 md:p-14 space-y-6 sm:space-y-8">
                <div className="flex justify-between items-start gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-2xl sm:text-3xl font-bold text-brand-950 tracking-tight font-serif">Reservation</h3>
                    <p className="text-brand-950/60 text-sm sm:text-lg mt-1 sm:mt-2 font-medium break-words">Selected: <span className="text-brand-950 font-bold underline decoration-brand-500/50 underline-offset-8">
                      {typeof currentUnit === 'string' ? currentUnit : `${currentUnit.brand} ${currentUnit.model}`}
                    </span></p>
                  </div>
                  <button onClick={handleCloseBooking} className="text-brand-950/40 hover:text-brand-500 transition-colors btn-neon rounded-full p-2 shrink-0">
                    <XCircle className="w-8 h-8 sm:w-10 sm:h-10" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 text-brand-950">
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
                            <option key={v.id} value={v.id}>{v.year} {v.brand} {v.model} (₱{parsePrice(v.price).toLocaleString()}/day)</option>
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
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[12px] uppercase text-brand-950/40 tracking-[0.2em] font-extrabold">Name</label>
                    <input name="customerName" value={bookingForm.customerName} onChange={handleInputChange} placeholder="Your Full Name" className={`w-full bg-white border ${formErrors.customerName ? 'border-red-500' : 'border-brand-950/10'} rounded-2xl px-5 py-4 text-base focus:outline-none focus:border-brand-500 transition-all shadow-sm`} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] uppercase text-brand-950/40 tracking-[0.2em] font-extrabold">Contact</label>
                    <input name="contactNumber" value={bookingForm.contactNumber} onChange={handleInputChange} placeholder="Phone Number" className={`w-full bg-white border ${formErrors.contactNumber ? 'border-red-500' : 'border-brand-950/10'} rounded-2xl px-5 py-4 text-base focus:outline-none focus:border-brand-500 transition-all shadow-sm`} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] uppercase text-brand-950/40 tracking-[0.2em] font-extrabold">Deliver Location</label>
                    <input name="deliveryLocation" value={bookingForm.deliveryLocation} onChange={handleInputChange} placeholder="Pickup point" className={`w-full bg-white border ${formErrors.deliveryLocation ? 'border-red-500' : 'border-brand-950/10'} rounded-2xl px-5 py-4 text-base focus:outline-none focus:border-brand-500 transition-all shadow-sm`} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] uppercase text-brand-950/40 tracking-[0.2em] font-extrabold">Start Date of Rent</label>
                    <div className="flex gap-3">
                      <input name="startDate" type="date" value={bookingForm.startDate} onChange={handleInputChange} className={`flex-1 min-w-0 bg-white border ${formErrors.startDate ? 'border-red-500' : 'border-brand-950/10'} rounded-2xl px-5 py-4 text-base focus:outline-none focus:border-brand-500 transition-all text-brand-950 shadow-sm`} />
                      <input name="startTime" type="time" value={bookingForm.startTime} onChange={handleInputChange} title="Start time of rent" className={`w-28 shrink-0 bg-white border border-brand-950/10 rounded-2xl px-5 py-4 text-base focus:outline-none focus:border-brand-500 transition-all text-brand-950 shadow-sm`} aria-label="Start time of rent" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] uppercase text-brand-950/40 tracking-[0.2em] font-extrabold">End Date of Rent</label>
                    <div className="flex gap-3">
                      <input name="endDate" type="date" value={bookingForm.endDate} onChange={handleInputChange} className={`flex-1 min-w-0 bg-white border ${formErrors.endDate ? 'border-red-500' : 'border-brand-950/10'} rounded-2xl px-5 py-4 text-base focus:outline-none focus:border-brand-500 transition-all text-brand-950 shadow-sm`} />
                      <input name="endTime" type="time" value={bookingForm.endTime} onChange={handleInputChange} title="End time of rent" className={`w-28 shrink-0 bg-white border border-brand-950/10 rounded-2xl px-5 py-4 text-base focus:outline-none focus:border-brand-500 transition-all text-brand-950 shadow-sm`} aria-label="End time of rent" />
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[12px] uppercase text-brand-950/40 tracking-[0.2em] font-extrabold">Pick-Up Location</label>
                    <input name="pickupLocation" value={bookingForm.pickupLocation} onChange={handleInputChange} placeholder="Return point" className={`w-full bg-white border ${formErrors.pickupLocation ? 'border-red-500' : 'border-brand-950/10'} rounded-2xl px-5 py-4 text-base focus:outline-none focus:border-brand-500 transition-all shadow-sm`} />
                  </div>
                </div>

                <button onClick={handleProceedToSummary} className="w-full bg-brand-950 text-white py-5 sm:py-6 rounded-full text-lg sm:text-xl font-bold hover:bg-brand-500 transition-all shadow-2xl btn-neon mt-4 sm:mt-8">
                  Review Booking Summary
                </button>
              </div>
            ) : (
              <div className="p-5 sm:p-10 md:p-14 space-y-6 sm:space-y-8 animate-in slide-in-from-right duration-300">
                <div className="flex justify-between items-start gap-3">
                  <h3 className="text-2xl sm:text-3xl font-bold text-brand-950 tracking-tight font-serif">Booking Confirmation</h3>
                  <button onClick={() => setShowSummaryStage(false)} className="text-brand-950/40 hover:text-brand-500 transition-colors text-sm font-bold underline shrink-0">Go Back</button>
                </div>

                <div className="glass-card bg-brand-950/5 border-brand-950/10 p-5 sm:p-8 rounded-2xl sm:rounded-3xl space-y-3 text-sm text-brand-950 font-medium">
                  <p>
                    <span className="text-brand-950/40 uppercase tracking-widest text-[10px] block mb-1">Unit</span> 
                    {typeof currentUnit === 'string' ? currentUnit : `${currentUnit.year} ${currentUnit.brand} ${currentUnit.model} (${currentUnit.color})`}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <p><span className="text-brand-950/40 uppercase tracking-widest text-[10px] block mb-1">Name</span> {bookingForm.customerName}</p>
                    <p><span className="text-brand-950/40 uppercase tracking-widest text-[10px] block mb-1">Contact</span> {bookingForm.contactNumber}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <p><span className="text-brand-950/40 uppercase tracking-widest text-[10px] block mb-1">Start Date & Time</span> {bookingForm.startDate}{bookingForm.startTime ? ` ${bookingForm.startTime}` : ''}</p>
                    <p><span className="text-brand-950/40 uppercase tracking-widest text-[10px] block mb-1">End Date & Time</span> {bookingForm.endDate}{bookingForm.endTime ? ` ${bookingForm.endTime}` : ''}</p>
                  </div>
                  <p><span className="text-brand-950/40 uppercase tracking-widest text-[10px] block mb-1">Deliver Location</span> {bookingForm.deliveryLocation}</p>
                  <p><span className="text-brand-950/40 uppercase tracking-widest text-[10px] block mb-1">Pick-Up Location</span> {bookingForm.pickupLocation}</p>
                  
                  <div className="border-t border-brand-950/10 pt-4 mt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-brand-950/40">Daily Rate</span>
                      <span className="font-bold">₱{typeof currentUnit === 'string' ? '0' : parsePrice(currentUnit.price).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-950/40">Delivery & Pick-Up Fee</span>
                      <span className="font-bold">₱300</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-950/40">Car Wash Fee</span>
                      <span className="font-bold">₱{typeof currentUnit === 'string' ? '0' : parsePrice(currentUnit.wash).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-brand-950/5">
                      <span className="text-brand-950/40">Security Deposit</span>
                      <span className="font-bold">₱{SECURITY_DEPOSIT_PHP.toLocaleString()}</span>
                    </div>
                  </div>

                  <p><span className="text-brand-950/40 uppercase tracking-widest text-[10px] block mb-1">Additional Services</span> {bookingForm.additionalService}</p>
                  
                  <p className="text-[11px] text-brand-500 italic pt-4">Note: Refundable after car return without damage</p>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <p className="text-center text-[11px] sm:text-[12px] uppercase text-brand-950/40 tracking-[0.3em] sm:tracking-[0.4em] font-extrabold">Confirm & Send Inquiry Via</p>
                  <div className="grid grid-cols-3 gap-3 sm:gap-6">
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
        </div>
      )}

      {/* Detail Modal - Fleet Vehicle Preview */}
      {showDetailModal && selectedVehicle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
          <div className="absolute inset-0 bg-brand-950/80 backdrop-blur-xl" onClick={handleCloseDetails}></div>
          <div className="bg-brand-950 border border-brand-500/20 rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_0_60px_rgba(31,75,87,0.4)] relative overflow-hidden w-full max-w-2xl z-10 animate-in zoom-in duration-300 max-h-[95vh] flex flex-col">
            <div className="overflow-y-auto overscroll-contain text-white flex-1 min-h-0">
              {/* Image Section */}
              <div className="relative h-48 sm:h-80 overflow-hidden shrink-0">
                <img src={selectedVehicle.imageUrl} alt={selectedVehicle.model} className="w-full h-full object-cover opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-950 via-transparent to-transparent"></div>
                <button 
                  onClick={handleCloseDetails} 
                  className="absolute top-4 right-4 sm:top-8 sm:right-8 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-brand-500/30 backdrop-blur-md flex items-center justify-center transition-all text-white shrink-0"
                >
                  <XCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              {/* Content Section */}
              <div className="px-5 sm:px-8 md:px-12 pb-8 sm:pb-12 pt-4 space-y-6 sm:space-y-10">
                {/* Brand & Model Header */}
                <div className="space-y-1">
                  <h3 className="text-2xl sm:text-4xl font-bold tracking-tight text-white break-words">{selectedVehicle.brand} {selectedVehicle.model}</h3>
                  <p className="text-brand-100/80 text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] font-bold break-words">{selectedVehicle.year} Edition • {selectedVehicle.color}</p>
                </div>

                {/* Overview */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-2.5 text-brand-100">
                    <Info className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                    <span className="text-xs font-bold uppercase tracking-widest">Overview</span>
                  </div>
                  <p className="text-white/80 text-base sm:text-xl leading-relaxed font-light">
                    {selectedVehicle.description}
                  </p>
                </div>

                {/* Specs Grid - 4 Card Style - stack on mobile to prevent overlap */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-brand-800/40 border border-brand-500/20 p-4 sm:p-6 rounded-2xl sm:rounded-3xl flex items-center gap-3 sm:gap-5 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-brand-500/20 flex items-center justify-center text-brand-100 shrink-0">
                      <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] uppercase font-bold text-brand-100/60 tracking-widest mb-0.5">Capacity</p>
                      <p className="text-base sm:text-lg font-bold text-white break-words">{selectedVehicle.seats}</p>
                    </div>
                  </div>
                  <div className="bg-brand-800/40 border border-brand-500/20 p-4 sm:p-6 rounded-2xl sm:rounded-3xl flex items-center gap-3 sm:gap-5 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-brand-500/20 flex items-center justify-center text-brand-100 shrink-0">
                      <Fuel className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] uppercase font-bold text-brand-100/60 tracking-widest mb-0.5">Fuel Type</p>
                      <p className="text-base sm:text-lg font-bold text-white break-words">{selectedVehicle.fuelType || 'Gasoline'}</p>
                    </div>
                  </div>
                  <div className="bg-brand-800/40 border border-brand-500/20 p-4 sm:p-6 rounded-2xl sm:rounded-3xl flex items-center gap-3 sm:gap-5 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-brand-500/20 flex items-center justify-center text-brand-100 shrink-0">
                      <Settings2 className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] uppercase font-bold text-brand-100/60 tracking-widest mb-0.5">Transmission</p>
                      <p className="text-base sm:text-lg font-bold text-white break-words">{selectedVehicle.trans === 'AT' ? 'Automatic' : 'Manual'}</p>
                    </div>
                  </div>
                  <div className="bg-brand-800/40 border border-brand-500/20 p-4 sm:p-6 rounded-2xl sm:rounded-3xl flex items-center gap-3 sm:gap-5 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-brand-500/20 flex items-center justify-center text-brand-100 shrink-0">
                      <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] uppercase font-bold text-brand-100/60 tracking-widest mb-0.5">Service</p>
                      <p className="text-sm sm:text-base font-bold leading-tight text-white break-words">{selectedVehicle.serviceType || 'Self-drive or with driver'}</p>
                    </div>
                  </div>
                </div>

                {/* Rental Features */}
                <div className="space-y-4 sm:space-y-6">
                  <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-brand-100/70">Rental Features</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 sm:gap-y-4 gap-x-4 sm:gap-x-8">
                    {[
                      "Unlimited Mileage",
                      "Clean & Sanitized Interior",
                      "Strong Air-Conditioning",
                      "Comprehensive Insurance",
                      "Well-maintained Unit",
                      `Carwash Fee: ₱${selectedVehicle.wash}`
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center gap-3 text-white/90 min-w-0">
                        <CheckCircle className="w-5 h-5 text-brand-100 shrink-0" />
                        <span className="text-sm font-medium break-words">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Main Action Button */}
                <div className="pt-4 sm:pt-6">
                  <button 
                    onClick={() => handleStartBooking(selectedVehicle)} 
                    className="w-full bg-brand-100 text-brand-950 py-5 sm:py-6 rounded-full text-lg sm:text-xl font-bold hover:bg-white transition-all shadow-[0_15px_30px_-5px_rgba(127,169,175,0.4)] active:scale-[0.98]"
                  >
                    Book for ₱{parsePrice(selectedVehicle.price).toLocaleString()}/Day
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