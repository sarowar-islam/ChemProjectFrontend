import { addMinutes, differenceInMinutes, format, isBefore, startOfDay } from 'date-fns';
import { BookingStatus, Instrument, InstrumentStatus } from '@/services/types';

export const INSTRUMENT_STATUSES: InstrumentStatus[] = ['available', 'booked', 'in_use', 'maintenance'];

export const STATUS_CONFIG: Record<
  InstrumentStatus,
  { label: string; badge: string; dot: string; description: string }
> = {
  available: {
    label: 'Available',
    badge: 'bg-emerald-600 text-white',
    dot: 'bg-emerald-500',
    description: 'Ready to be booked',
  },
  booked: {
    label: 'Booked',
    badge: 'bg-amber-500 text-white',
    dot: 'bg-amber-500',
    description: 'Reserved for upcoming sessions',
  },
  in_use: {
    label: 'In Use',
    badge: 'bg-sky-600 text-white',
    dot: 'bg-sky-500',
    description: 'Currently being used',
  },
  maintenance: {
    label: 'Maintenance',
    badge: 'bg-rose-600 text-white',
    dot: 'bg-rose-500',
    description: 'Temporarily out of service',
  },
};

export const BOOKING_STATUS_CONFIG: Record<BookingStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300' },
  approved: { label: 'Approved', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300' },
  rejected: { label: 'Rejected', className: 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300' },
  cancelled: { label: 'Cancelled', className: 'bg-muted text-muted-foreground' },
};

export const overlaps = (aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) =>
  aStart < bEnd && bStart < aEnd;

/** "09:00" / "13:30" style options between opening and closing hour. */
export function buildTimeOptions(instrument: Pick<Instrument, 'openingHour' | 'closingHour' | 'slotIntervalMinutes'>) {
  const options: string[] = [];
  const total = (instrument.closingHour - instrument.openingHour) * 60;
  for (let m = 0; m <= total; m += instrument.slotIntervalMinutes) {
    const h = instrument.openingHour + Math.floor(m / 60);
    const min = m % 60;
    options.push(`${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`);
  }
  return options;
}

/** Combine "yyyy-MM-dd" and "HH:mm" in local time. */
export function combineDateTime(date: string, time: string): Date {
  const [y, mo, d] = date.split('-').map(Number);
  const [h, m] = time.split(':').map(Number);
  return new Date(y, mo - 1, d, h, m, 0, 0);
}

export const formatDuration = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
};

export const formatRange = (startIso: string, endIso: string) => {
  const s = new Date(startIso);
  const e = new Date(endIso);
  return `${format(s, 'EEE, d MMM yyyy')} · ${format(s, 'h:mm a')} – ${format(e, 'h:mm a')}`;
};

export const bookingMinutes = (startIso: string, endIso: string) =>
  differenceInMinutes(new Date(endIso), new Date(startIso));

export const createInstrumentSlug = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export { addMinutes, isBefore, startOfDay };
