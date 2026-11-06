import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Microscope, Search } from 'lucide-react';
import { instrumentService } from '@/services/instrument.service';
import { INSTRUMENT_STATUSES, STATUS_CONFIG } from '@/lib/instrumentUtils';
import { InstrumentStatus } from '@/services/types';
import { InstrumentCard } from '@/components/InstrumentShared';
import { SEO } from '@/components/SEO';

export default function InstrumentsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState<'all' | InstrumentStatus>('all');

  const { data: instruments = [], isLoading: loading } = useQuery({
    queryKey: ['instruments'],
    queryFn: async () => {
      const res = await instrumentService.getInstruments();
      return res.success && res.data ? res.data : [];
    },
  });

  const categories = useMemo(() => [...new Set(instruments.map((i) => i.category))].sort(), [instruments]);

  const filtered = instruments.filter((i) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q || [i.name, i.shortDescription, i.manufacturer, i.model, i.category].some((v) => v.toLowerCase().includes(q));
    return matchesSearch && (category === 'all' || i.category === category) && (status === 'all' || i.status === status);
  });

  const chip = (active: boolean) =>
    `px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
      active
        ? 'bg-accent text-accent-foreground border-accent'
        : 'bg-card text-muted-foreground border-border hover:border-accent/50 hover:text-accent'
    }`;

  return (
    <div className="bg-background">
      <SEO
        title="Laboratory Instruments"
        description="Browse BCER Lab research instruments, check availability and request a booking online."
        canonicalPath="/instruments"
      />
      {/* Hero */}
      <section className="relative py-12 sm:py-16 md:py-20 overflow-hidden bg-gradient-to-br from-secondary/70 dark:from-secondary/25 via-secondary/45 dark:via-secondary/15 to-background">
        <div className="absolute top-10 sm:top-20 right-10 sm:right-20 w-48 sm:w-72 h-48 sm:h-72 bg-secondary/70 rounded-full blur-3xl" />
        <div className="absolute bottom-10 sm:bottom-20 left-10 sm:left-20 w-64 sm:w-96 h-64 sm:h-96 bg-secondary/60 rounded-full blur-3xl" />
        <div className="container-wide relative text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-secondary/80 text-secondary-foreground text-xs sm:text-sm font-medium mb-4 sm:mb-6 animate-fade-in border border-secondary-foreground/20">
            <Microscope className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Instrument Booking</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#166534] dark:text-foreground mb-4 sm:mb-6 animate-fade-in-up" style={{ letterSpacing: '-0.02em' }}>
            Laboratory Instruments
          </h1>
          <p className="text-sm sm:text-lg md:text-xl text-muted-foreground animate-fade-in-up leading-relaxed" style={{ animationDelay: '0.1s' }}>
            Discover our research equipment, check availability and request a time slot in a few clicks.
          </p>
        </div>
      </section>

      <section className="container-wide section-padding bg-background">
        {/* Filters */}
        <div className="space-y-4 mb-8">
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, manufacturer or model..."
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setStatus('all')} className={chip(status === 'all')}>All status</button>
            {INSTRUMENT_STATUSES.map((s) => (
              <button key={s} onClick={() => setStatus(s)} className={`${chip(status === s)} inline-flex items-center gap-2`}>
                <span className={`w-2 h-2 rounded-full ${STATUS_CONFIG[s].dot}`} />
                {STATUS_CONFIG[s].label}
              </button>
            ))}
          </div>
          {categories.length > 1 && (
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setCategory('all')} className={chip(category === 'all')}>All categories</button>
              {categories.map((c) => (
                <button key={c} onClick={() => setCategory(c)} className={chip(category === c)}>{c}</button>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-xl overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-secondary" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-1/3 bg-secondary rounded" />
                  <div className="h-5 w-full bg-secondary rounded" />
                  <div className="h-4 w-2/3 bg-secondary rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-xl">
            <Microscope className="w-14 h-14 mx-auto text-muted-foreground mb-4 opacity-60" />
            <h3 className="font-heading text-xl text-foreground mb-2">No instruments found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-5">
              Showing <span className="font-semibold text-foreground">{filtered.length}</span> of {instruments.length} instruments
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((inst, i) => (
                <InstrumentCard key={inst.id} instrument={inst} delay={`${(i % 8) * 0.04}s`} />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
