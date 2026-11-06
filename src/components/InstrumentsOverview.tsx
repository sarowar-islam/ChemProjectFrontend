import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, CalendarCheck, Microscope } from 'lucide-react';
import { instrumentService } from '@/services/instrument.service';
import { INSTRUMENT_STATUSES, STATUS_CONFIG } from '@/lib/instrumentUtils';
import { InstrumentCard } from './InstrumentShared';

/** Homepage section shown right after the hero. */
export function InstrumentsOverview() {
  const { data: instruments = [], isLoading } = useQuery({
    queryKey: ['instruments'],
    queryFn: async () => {
      const res = await instrumentService.getInstruments();
      return res.success && res.data ? res.data : [];
    },
  });

  // Show available instruments first, then the rest, max 4 cards
  const featured = [...instruments]
    .sort((a, b) => Number(b.status === 'available') - Number(a.status === 'available'))
    .slice(0, 4);

  return (
    <section className="py-12 md:py-16 bg-background relative overflow-hidden">
      <div className="container-wide relative">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/15 text-accent text-sm font-medium mb-4">
              <CalendarCheck className="w-4 h-4" />
              <span>Instrument Booking</span>
            </div>
            <h2 className="font-heading text-3xl md:text-4xl text-[#166534] dark:text-foreground mb-3" style={{ letterSpacing: '-0.02em' }}>
              Book Laboratory Instruments Online
            </h2>
            <p className="text-muted-foreground max-w-2xl">
              Explore our research instruments, check live availability and request a time slot without contacting the lab manually.
            </p>
          </div>
          <Link
            to="/instruments"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-accent text-accent-foreground font-medium hover:bg-accent/90 transition-colors shadow-lg shadow-accent/20 group shrink-0"
          >
            Explore All Instruments <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {!isLoading && instruments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {INSTRUMENT_STATUSES.map((s) => {
              const count = instruments.filter((i) => i.status === s).length;
              return (
                <span key={s} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border text-xs sm:text-sm text-muted-foreground">
                  <span className={`w-2 h-2 rounded-full ${STATUS_CONFIG[s].dot}`} />
                  <span className="font-semibold text-foreground">{count}</span> {STATUS_CONFIG[s].label}
                </span>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-xl overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-secondary" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-1/3 bg-secondary rounded" />
                  <div className="h-5 w-full bg-secondary rounded" />
                  <div className="h-4 w-2/3 bg-secondary rounded" />
                </div>
              </div>
            ))
          ) : featured.length === 0 ? (
            <div className="col-span-full text-center py-10 bg-secondary/50 rounded-xl border border-border">
              <Microscope className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No instruments listed yet.</p>
            </div>
          ) : (
            featured.map((inst, i) => <InstrumentCard key={inst.id} instrument={inst} delay={`${i * 0.05}s`} />)
          )}
        </div>
      </div>
    </section>
  );
}
