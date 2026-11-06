/**
 * Instrument service.
 *
 * Every function returns the same `ApiResponse<T>` shape as the other services,
 * so pages never know where data comes from. For now the "database" is the
 * dummy data in `@/data/dummyinstrument`, persisted to localStorage so admin
 * actions (approve / reject / edit) survive a page refresh and show up on the
 * public calendar.
 *
 * BACKEND MIGRATION: replace each function body with an `apiRequest` call.
 * Suggested REST endpoints are noted above each function.
 */
import {
  dummyInstrumentBookings,
  dummyInstrumentCategories,
  dummyInstrumentReviews,
  dummyInstrumentRows,
  dummyInstrumentSpecifications,
  dummyInstrumentUnavailablePeriods,
} from '@/data/dummyinstruments';
import { overlaps, createInstrumentSlug } from '@/lib/instrumentUtils';
import {
  ApiResponse,
  BookingStatus,
  CreateBookingPayload,
  Instrument,
  InstrumentBooking,
  InstrumentCalendarEvent,
  InstrumentCategory,
  InstrumentReview,
  InstrumentSpecification,
  InstrumentStatus,
  InstrumentUnavailablePeriod,
} from './types';

type InstrumentRow = Omit<Instrument, 'specifications' | 'averageRating' | 'reviewCount'>;

interface InstrumentDb {
  instruments: InstrumentRow[];
  specifications: InstrumentSpecification[];
  bookings: InstrumentBooking[];
  unavailablePeriods: InstrumentUnavailablePeriod[];
  reviews: InstrumentReview[];
}

const STORAGE_KEY = 'bcer_instrument_db_v1';
export const INSTRUMENTS_CHANGED_EVENT = 'bcer:instruments-changed';

const seed = (): InstrumentDb => ({
  instruments: structuredClone(dummyInstrumentRows),
  specifications: structuredClone(dummyInstrumentSpecifications),
  bookings: structuredClone(dummyInstrumentBookings),
  unavailablePeriods: structuredClone(dummyInstrumentUnavailablePeriods),
  reviews: structuredClone(dummyInstrumentReviews),
});

function loadDb(): InstrumentDb {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as InstrumentDb;
  } catch {
    /* fall through to seed */
  }
  const db = seed();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  return db;
}

function saveDb(db: InstrumentDb) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  window.dispatchEvent(new Event(INSTRUMENTS_CHANGED_EVENT));
}

const delay = () => new Promise((r) => setTimeout(r, 120));
const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

function hydrate(db: InstrumentDb, row: InstrumentRow): Instrument {
  const reviews = db.reviews.filter((r) => r.instrumentId === row.id);
  const averageRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  return {
    ...row,
    specifications: db.specifications
      .filter((s) => s.instrumentId === row.id)
      .sort((a, b) => a.sortOrder - b.sortOrder),
    averageRating,
    reviewCount: reviews.length,
  };
}

/** True if the window collides with an approved booking or an unavailable period. */
function findConflict(db: InstrumentDb, instrumentId: string, startAt: string, endAt: string, ignoreBookingId?: string) {
  const s = new Date(startAt);
  const e = new Date(endAt);
  const booking = db.bookings.find(
    (b) =>
      b.instrumentId === instrumentId &&
      b.status === 'approved' &&
      b.id !== ignoreBookingId &&
      overlaps(s, e, new Date(b.startAt), new Date(b.endAt))
  );
  if (booking) return 'This time overlaps with an existing approved reservation.';
  const block = db.unavailablePeriods.find(
    (u) => u.instrumentId === instrumentId && overlaps(s, e, new Date(u.startAt), new Date(u.endAt))
  );
  if (block) return `The instrument is unavailable during this period (${block.reason}).`;
  return null;
}

export const instrumentService = {
  // GET /instruments
  async getInstruments(): Promise<ApiResponse<Instrument[]>> {
    await delay();
    const db = loadDb();
    return { success: true, data: db.instruments.map((r) => hydrate(db, r)) };
  },

  // GET /instruments/slug/:slug
  async getInstrumentBySlug(slug: string): Promise<ApiResponse<Instrument>> {
    await delay();
    const db = loadDb();
    const row = db.instruments.find((i) => i.slug === slug);
    return row ? { success: true, data: hydrate(db, row) } : { success: false, error: 'Instrument not found' };
  },

  // GET /instrument-categories
  async getCategories(): Promise<ApiResponse<InstrumentCategory[]>> {
    return { success: true, data: dummyInstrumentCategories };
  },

  // POST /admin/instruments
  async createInstrument(
    input: Omit<Instrument, 'id' | 'slug' | 'createdAt' | 'updatedAt' | 'averageRating' | 'reviewCount' | 'specifications'> & {
      specifications: { label: string; value: string }[];
    }
  ): Promise<ApiResponse<Instrument>> {
    await delay();
    const db = loadDb();
    const { specifications, ...rest } = input;
    let slug = createInstrumentSlug(rest.name);
    if (db.instruments.some((i) => i.slug === slug)) slug = `${slug}-${Date.now().toString(36).slice(-3)}`;
    const now = new Date().toISOString();
    const row: InstrumentRow = { ...rest, id: newId('ins'), slug, createdAt: now, updatedAt: now };
    db.instruments.push(row);
    db.specifications.push(
      ...specifications.map((s, i) => ({ id: newId('spec'), instrumentId: row.id, label: s.label, value: s.value, sortOrder: i }))
    );
    saveDb(db);
    return { success: true, data: hydrate(db, row) };
  },

  // PUT /admin/instruments/:id
  async updateInstrument(
    id: string,
    updates: Partial<Omit<Instrument, 'id' | 'specifications'>> & { specifications?: { label: string; value: string }[] }
  ): Promise<ApiResponse<Instrument>> {
    await delay();
    const db = loadDb();
    const idx = db.instruments.findIndex((i) => i.id === id);
    if (idx === -1) return { success: false, error: 'Instrument not found' };
    const { specifications, ...rest } = updates;
    db.instruments[idx] = { ...db.instruments[idx], ...rest, updatedAt: new Date().toISOString() } as InstrumentRow;
    if (specifications) {
      db.specifications = db.specifications.filter((s) => s.instrumentId !== id);
      db.specifications.push(
        ...specifications.map((s, i) => ({ id: newId('spec'), instrumentId: id, label: s.label, value: s.value, sortOrder: i }))
      );
    }
    saveDb(db);
    return { success: true, data: hydrate(db, db.instruments[idx]) };
  },

  // PATCH /admin/instruments/:id/status
  async updateStatus(id: string, status: InstrumentStatus): Promise<ApiResponse<Instrument>> {
    return this.updateInstrument(id, { status });
  },

  // DELETE /admin/instruments/:id  (cascade bookings, reviews, specs, periods)
  async deleteInstrument(id: string): Promise<ApiResponse<void>> {
    await delay();
    const db = loadDb();
    db.instruments = db.instruments.filter((i) => i.id !== id);
    db.specifications = db.specifications.filter((s) => s.instrumentId !== id);
    db.bookings = db.bookings.filter((b) => b.instrumentId !== id);
    db.reviews = db.reviews.filter((r) => r.instrumentId !== id);
    db.unavailablePeriods = db.unavailablePeriods.filter((u) => u.instrumentId !== id);
    saveDb(db);
    return { success: true };
  },

  // POST /upload/instrument-image  (multipart; backend returns the stored URL)
  async uploadInstrumentImage(file: File): Promise<ApiResponse<{ imageUrl: string }>> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ success: true, data: { imageUrl: reader.result as string } });
      reader.onerror = () => resolve({ success: false, error: 'Failed to read image' });
      reader.readAsDataURL(file);
    });
  },

  // GET /instruments/:id/calendar?from=&to=   (approved bookings + unavailable periods only)
  async getCalendarEvents(instrumentId: string): Promise<ApiResponse<InstrumentCalendarEvent[]>> {
    await delay();
    const db = loadDb();
    const bookings: InstrumentCalendarEvent[] = db.bookings
      .filter((b) => b.instrumentId === instrumentId && b.status === 'approved')
      .map((b) => ({
        id: b.id,
        instrumentId,
        kind: 'booking',
        title: 'Reserved',
        subtitle: b.requesterName,
        startAt: b.startAt,
        endAt: b.endAt,
      }));
    const blocks: InstrumentCalendarEvent[] = db.unavailablePeriods
      .filter((u) => u.instrumentId === instrumentId)
      .map((u) => ({
        id: u.id,
        instrumentId,
        kind: 'unavailable',
        title: u.type === 'maintenance' ? 'Maintenance' : u.type === 'calibration' ? 'Calibration' : 'Closed',
        subtitle: u.reason,
        startAt: u.startAt,
        endAt: u.endAt,
      }));
    return { success: true, data: [...bookings, ...blocks] };
  },

  // GET /instruments/:id/reviews
  async getReviews(instrumentId: string): Promise<ApiResponse<InstrumentReview[]>> {
    await delay();
    const db = loadDb();
    return {
      success: true,
      data: db.reviews
        .filter((r) => r.instrumentId === instrumentId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    };
  },

  // POST /instrument-bookings   (always created with status "pending")
  async createBooking(payload: CreateBookingPayload): Promise<ApiResponse<InstrumentBooking>> {
    await delay();
    const db = loadDb();
    if (new Date(payload.endAt) <= new Date(payload.startAt)) {
      return { success: false, error: 'End time must be after the start time.' };
    }
    const conflict = findConflict(db, payload.instrumentId, payload.startAt, payload.endAt);
    if (conflict) return { success: false, error: conflict };
    const booking: InstrumentBooking = {
      ...payload,
      id: newId('bk'),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    db.bookings.push(booking);
    saveDb(db);
    return { success: true, data: booking };
  },

  // GET /admin/instrument-bookings?status=
  async getBookings(status?: BookingStatus): Promise<ApiResponse<InstrumentBooking[]>> {
    await delay();
    const db = loadDb();
    const list = db.bookings
      .filter((b) => !status || b.status === status)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return { success: true, data: list };
  },

  /** Synchronous count for the admin sidebar badge. */
  getPendingCount(): number {
    return loadDb().bookings.filter((b) => b.status === 'pending').length;
  },

  /** Conflict message for a pending booking if approving it now would double-book. */
  checkBookingConflict(booking: InstrumentBooking): string | null {
    return findConflict(loadDb(), booking.instrumentId, booking.startAt, booking.endAt, booking.id);
  },

  // PATCH /admin/instrument-bookings/:id/approve
  async approveBooking(id: string, reviewerId: string, adminNote?: string): Promise<ApiResponse<InstrumentBooking>> {
    await delay();
    const db = loadDb();
    const idx = db.bookings.findIndex((b) => b.id === id);
    if (idx === -1) return { success: false, error: 'Booking not found' };
    const b = db.bookings[idx];
    const conflict = findConflict(db, b.instrumentId, b.startAt, b.endAt, b.id);
    if (conflict) return { success: false, error: conflict };
    db.bookings[idx] = { ...b, status: 'approved', adminNote, reviewedBy: reviewerId, reviewedAt: new Date().toISOString() };
    saveDb(db);
    return { success: true, data: db.bookings[idx] };
  },

  // PATCH /admin/instrument-bookings/:id/reject
  async rejectBooking(id: string, reviewerId: string, adminNote: string): Promise<ApiResponse<InstrumentBooking>> {
    await delay();
    const db = loadDb();
    const idx = db.bookings.findIndex((b) => b.id === id);
    if (idx === -1) return { success: false, error: 'Booking not found' };
    db.bookings[idx] = { ...db.bookings[idx], status: 'rejected', adminNote, reviewedBy: reviewerId, reviewedAt: new Date().toISOString() };
    saveDb(db);
    return { success: true, data: db.bookings[idx] };
  },

  // DELETE /admin/instrument-bookings/:id  (cancel an approved booking, frees the slot)
  async cancelBooking(id: string, reviewerId: string, adminNote?: string): Promise<ApiResponse<InstrumentBooking>> {
    await delay();
    const db = loadDb();
    const idx = db.bookings.findIndex((b) => b.id === id);
    if (idx === -1) return { success: false, error: 'Booking not found' };
    db.bookings[idx] = { ...db.bookings[idx], status: 'cancelled', adminNote, reviewedBy: reviewerId, reviewedAt: new Date().toISOString() };
    saveDb(db);
    return { success: true, data: db.bookings[idx] };
  },
};
