import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Building2,
  CalendarPlus,
  CheckCircle2,
  ClipboardList,
  Cpu,
  Factory,
  Hash,
  MapPin,
  Microscope,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { instrumentService } from '@/services/instrument.service';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { InstrumentImage, RatingStars, StatusBadge } from '@/components/InstrumentShared';
import { InstrumentCalendar } from '@/components/InstrumentCalendar';
import { BookingRequestDialog } from '@/components/BookingRequestDialog';
import { STATUS_CONFIG, formatDuration } from '@/lib/instrumentUtils';
import { SEO } from '@/components/SEO';

const TABS = ['details', 'calendar', 'ratings'] as const;

export default function InstrumentDetailPage() {
  const { slug = '' } = useParams();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const tab = TABS.includes(tabParam as (typeof TABS)[number]) ? (tabParam as string) : 'details';

  const [bookingOpen, setBookingOpen] = useState(false);
  const [slotStart, setSlotStart] = useState<Date | null>(null);

  const { data: instrument, isLoading } = useQuery({
    queryKey: ['instrument', slug],
    queryFn: async () => {
      const res = await instrumentService.getInstrumentBySlug(slug);
      return res.success && res.data ? res.data : null;
    },
  });

  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['instrument-calendar', instrument?.id],
    enabled: !!instrument,
    queryFn: async () => {
      const res = await instrumentService.getCalendarEvents(instrument!.id);
      return res.success && res.data ? res.data : [];
    },
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['instrument-reviews', instrument?.id],
    enabled: !!instrument,
    queryFn: async () => {
      const res = await instrumentService.getReviews(instrument!.id);
      return res.success && res.data ? res.data : [];
    },
  });

  if (isLoading) {
    return (
      <div className="container-wide py-16 animate-pulse space-y-6">
        <div className="h-8 w-1/3 bg-secondary rounded" />
        <div className="h-96 bg-secondary rounded-xl" />
      </div>
    );
  }

  if (!instrument) {
    return (
      <div className="container-wide py-20 text-center">
        <Microscope className="w-14 h-14 mx-auto text-muted-foreground mb-4 opacity-60" />
        <h1 className="font-heading text-2xl text-foreground mb-2">Instrument not found</h1>
        <p className="text-muted-foreground mb-6">The instrument you are looking for does not exist or was removed.</p>
        <Link to="/instruments" className="inline-flex items-center gap-2 text-accent font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to instruments
        </Link>
      </div>
    );
  }

  const openBooking = (start?: Date | null) => {
    setSlotStart(start ?? null);
    setBookingOpen(true);
  };
  const canBook = instrument.status !== 'maintenance';
  const average = instrument.averageRating ?? 0;
  const distribution = [5, 4, 3, 2, 1].map((n) => ({ n, count: reviews.filter((r) => r.rating === n).length }));

  const info = [
    { icon: Factory, label: 'Manufacturer', value: instrument.manufacturer },
    { icon: Cpu, label: 'Model', value: instrument.model },
    { icon: Microscope, label: 'Category', value: instrument.category },
    { icon: Hash, label: 'Serial number', value: instrument.serialNumber },
    { icon: MapPin, label: 'Location', value: instrument.location },
    { icon: UserCheck, label: 'Responsible admin', value: instrument.responsibleAdminName },
  ].filter((i) => i.value);

  return (
    <div className="bg-background">
      <SEO title={instrument.name} description={instrument.shortDescription} canonicalPath={`/instruments/${instrument.slug}`} />

      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-secondary/70 dark:from-secondary/25 via-secondary/45 dark:via-secondary/15 to-background border-b border-border">
        <div className="absolute top-10 right-10 w-64 h-64 bg-secondary/70 rounded-full blur-3xl" />
        <div className="container-wide relative py-8 sm:py-10">
          <Link to="/instruments" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors mb-5">
            <ArrowLeft className="w-4 h-4" /> All instruments
          </Link>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className="hidden sm:block w-28 h-28 rounded-xl overflow-hidden border border-border shrink-0 bg-secondary">
                <InstrumentImage src={instrument.imageUrl} alt={instrument.name} className="w-full h-full" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-accent mb-2">{instrument.category}</p>
                <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#166534] dark:text-foreground mb-3" style={{ letterSpacing: '-0.02em' }}>
                  {instrument.name}
                </h1>
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge status={instrument.status} />
                  <span className="text-sm text-muted-foreground">{STATUS_CONFIG[instrument.status].description}</span>
                  {instrument.reviewCount ? (
                    <span className="inline-flex items-center gap-2 text-sm">
                      <RatingStars value={average} />
                      <span className="font-semibold text-foreground">{average.toFixed(1)}</span>
                      <span className="text-muted-foreground">({instrument.reviewCount} reviews)</span>
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Book Instrument - top right */}
            <div className="lg:text-right shrink-0">
              <Button
                size="lg"
                disabled={!canBook}
                onClick={() => openBooking()}
                className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/25 gap-2 w-full lg:w-auto"
              >
                <CalendarPlus className="w-5 h-5" /> Book Instrument
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                {canBook ? 'Requests are confirmed after admin approval' : 'Bookings are paused during maintenance'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="container-wide py-8 sm:py-10">
        <Tabs value={tab} onValueChange={(v) => setSearchParams(v === 'details' ? {} : { tab: v }, { replace: true })}>
          <TabsList className="bg-secondary/60 h-auto p-1 mb-6">
            <TabsTrigger value="details" className="px-5 py-2 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">Details</TabsTrigger>
            <TabsTrigger value="calendar" className="px-5 py-2 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">Calendar</TabsTrigger>
            <TabsTrigger value="ratings" className="px-5 py-2 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              Ratings{instrument.reviewCount ? ` (${instrument.reviewCount})` : ''}
            </TabsTrigger>
          </TabsList>

          {/* DETAILS */}
          <TabsContent value="details" className="mt-0">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="rounded-2xl overflow-hidden border border-border bg-secondary aspect-[16/9]">
                  <InstrumentImage src={instrument.imageUrl} alt={instrument.name} className="w-full h-full" />
                </div>

                <div>
                  <h2 className="font-heading text-2xl text-foreground mb-3">About this instrument</h2>
                  <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: instrument.description }} />
                </div>

                {instrument.features.length > 0 && (
                  <div>
                    <h2 className="font-heading text-2xl text-foreground mb-3">Key features</h2>
                    <ul className="grid sm:grid-cols-2 gap-3">
                      {instrument.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 p-3 rounded-lg bg-card border border-border text-sm text-foreground">
                          <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {instrument.specifications.length > 0 && (
                  <div>
                    <h2 className="font-heading text-2xl text-foreground mb-3">Specifications</h2>
                    <div className="rounded-xl border border-border overflow-hidden bg-card">
                      {instrument.specifications.map((s, i) => (
                        <div key={s.id} className={`grid grid-cols-5 gap-4 px-4 py-3 text-sm ${i % 2 === 0 ? 'bg-secondary/30' : ''}`}>
                          <div className="col-span-2 font-medium text-muted-foreground">{s.label}</div>
                          <div className="col-span-3 text-foreground">{s.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <aside className="space-y-6">
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                  <h3 className="font-heading text-lg text-foreground mb-4">Instrument information</h3>
                  <dl className="space-y-4">
                    {info.map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-secondary text-secondary-foreground"><Icon className="w-4 h-4" /></div>
                        <div className="min-w-0">
                          <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
                          <dd className="text-sm font-medium text-foreground break-words">{value}</dd>
                        </div>
                      </div>
                    ))}
                  </dl>
                </div>

                <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                  <h3 className="font-heading text-lg text-foreground mb-4 flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-accent" /> Booking rules
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>Hours: {String(instrument.openingHour).padStart(2, '0')}:00 – {String(instrument.closingHour).padStart(2, '0')}:00</li>
                    <li>Session length: {formatDuration(instrument.minDurationMinutes)} – {formatDuration(instrument.maxDurationMinutes)}</li>
                    <li>Book up to {instrument.advanceBookingDays} days ahead</li>
                    <li>Requests need admin approval</li>
                  </ul>
                </div>

                {instrument.usageRequirements.length > 0 && (
                  <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                    <h3 className="font-heading text-lg text-foreground mb-4 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-accent" /> Usage requirements
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                      {instrument.usageRequirements.map((r) => <li key={r}>{r}</li>)}
                    </ul>
                  </div>
                )}

                <div className="rounded-xl border border-border bg-secondary/40 p-5 flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-accent mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    Questions about this instrument? Contact{' '}
                    <a className="text-accent font-medium hover:underline" href={`mailto:${instrument.responsibleAdminEmail}`}>
                      {instrument.responsibleAdminName}
                    </a>.
                  </p>
                </div>
              </aside>
            </div>
          </TabsContent>

          {/* CALENDAR */}
          <TabsContent value="calendar" className="mt-0">
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Switch between day, week and month. Click a free slot to start a booking request.
              </p>
              <Button disabled={!canBook} onClick={() => openBooking()} variant="outline" className="gap-2 self-start">
                <CalendarPlus className="w-4 h-4" /> New request
              </Button>
            </div>
            <InstrumentCalendar
              instrument={instrument}
              events={events}
              loading={eventsLoading}
              onSelectSlot={canBook ? (d) => openBooking(d) : undefined}
            />
          </TabsContent>

          {/* RATINGS */}
          <TabsContent value="ratings" className="mt-0">
            {reviews.length === 0 ? (
              <div className="text-center py-16 bg-card border border-border rounded-xl">
                <RatingStars value={0} size="lg" />
                <h3 className="font-heading text-xl text-foreground mt-4 mb-1">No reviews yet</h3>
                <p className="text-muted-foreground">Be the first to share your experience after using this instrument.</p>
              </div>
            ) : (
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm h-fit">
                  <div className="text-center mb-6">
                    <div className="font-heading text-5xl font-bold text-foreground">{average.toFixed(1)}</div>
                    <div className="mt-2 flex justify-center"><RatingStars value={average} size="md" /></div>
                    <p className="text-sm text-muted-foreground mt-2">Based on {reviews.length} reviews</p>
                  </div>
                  <div className="space-y-2">
                    {distribution.map(({ n, count }) => (
                      <div key={n} className="flex items-center gap-3 text-sm">
                        <span className="w-4 text-muted-foreground">{n}</span>
                        <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(count / reviews.length) * 100}%` }} />
                        </div>
                        <span className="w-4 text-right text-muted-foreground">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-4">
                  {reviews.map((r) => (
                    <article key={r.id} className="rounded-xl border border-border bg-card p-5 shadow-sm">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-semibold">
                            {r.reviewerName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground leading-tight">{r.reviewerName}</p>
                            {r.reviewerAffiliation && <p className="text-xs text-muted-foreground">{r.reviewerAffiliation}</p>}
                          </div>
                        </div>
                        <div className="text-right">
                          <RatingStars value={r.rating} />
                          <p className="text-xs text-muted-foreground mt-1">{format(new Date(r.createdAt), 'd MMM yyyy')}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{r.comment}</p>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>

      <BookingRequestDialog
        instrument={instrument}
        events={events}
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        initialStart={slotStart}
        onSubmitted={() => queryClient.invalidateQueries({ queryKey: ['instrument-calendar', instrument.id] })}
      />
    </div>
  );
}
