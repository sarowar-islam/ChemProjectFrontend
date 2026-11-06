/**
 * Instrument service - Backend Integration
 *
 * All functions now connect to the real backend API endpoints.
 */
import { apiRequest } from '@/lib/api';
import {
  ApiResponse,
  BookingStatus,
  CreateBookingPayload,
  Instrument,
  InstrumentBooking,
  InstrumentCalendarEvent,
  InstrumentCategory,
  InstrumentReview,
  InstrumentStatus,
  InstrumentUnavailablePeriod,
} from './types';

export const INSTRUMENTS_CHANGED_EVENT = 'bcer:instruments-changed';

async function unwrap<T>(promise: Promise<{ success: true; data: any } | { success: false; error: string }>): Promise<ApiResponse<T>> {
  const res = await promise;
  if (!res.success) {
    return { success: false, error: res.error };
  }
  const payload = res.data;
  if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
    return { success: true, data: payload.data };
  }
  return { success: true, data: payload };
}

export const instrumentService = {
  // GET /api/instruments
  async getInstruments(): Promise<ApiResponse<Instrument[]>> {
    return unwrap<Instrument[]>(apiRequest({
      method: 'GET',
      url: '/instruments',
    }));
  },

  // GET /api/instruments/slug/:slug
  async getInstrumentBySlug(slug: string): Promise<ApiResponse<Instrument>> {
    return unwrap<Instrument>(apiRequest({
      method: 'GET',
      url: `/instruments/slug/${slug}`,
    }));
  },

  // GET /api/instrument-categories
  async getCategories(): Promise<ApiResponse<InstrumentCategory[]>> {
    return unwrap<InstrumentCategory[]>(apiRequest({
      method: 'GET',
      url: '/instrument-categories',
    }));
  },

  // POST /api/admin/instruments
  async createInstrument(
    input: Omit<Instrument, 'id' | 'slug' | 'createdAt' | 'updatedAt' | 'averageRating' | 'reviewCount' | 'specifications'> & {
      specifications: { label: string; value: string }[];
    }
  ): Promise<ApiResponse<Instrument>> {
    const result = await unwrap<Instrument>(apiRequest({
      method: 'POST',
      url: '/admin/instruments',
      data: input,
    }));

    if (result.success) {
      window.dispatchEvent(new Event(INSTRUMENTS_CHANGED_EVENT));
    }

    return result;
  },

  // PUT /api/admin/instruments/:id
  async updateInstrument(
    id: string,
    updates: Partial<Omit<Instrument, 'id' | 'specifications'>> & { specifications?: { label: string; value: string }[] }
  ): Promise<ApiResponse<Instrument>> {
    const result = await unwrap<Instrument>(apiRequest({
      method: 'PUT',
      url: `/admin/instruments/${id}`,
      data: updates,
    }));

    if (result.success) {
      window.dispatchEvent(new Event(INSTRUMENTS_CHANGED_EVENT));
    }

    return result;
  },

  // PATCH /api/admin/instruments/:id/status
  async updateStatus(id: string, status: InstrumentStatus): Promise<ApiResponse<Instrument>> {
    const result = await unwrap<Instrument>(apiRequest({
      method: 'PATCH',
      url: `/admin/instruments/${id}/status`,
      data: { status },
    }));

    if (result.success) {
      window.dispatchEvent(new Event(INSTRUMENTS_CHANGED_EVENT));
    }

    return result;
  },

  // DELETE /api/admin/instruments/:id
  async deleteInstrument(id: string): Promise<ApiResponse<void>> {
    const result = await unwrap<void>(apiRequest({
      method: 'DELETE',
      url: `/admin/instruments/${id}`,
    }));

    if (result.success) {
      window.dispatchEvent(new Event(INSTRUMENTS_CHANGED_EVENT));
    }

    return result;
  },

  // POST /api/upload/instrument-image
  async uploadInstrumentImage(file: File): Promise<ApiResponse<{ imageUrl: string }>> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await unwrap<{ imageUrl: string }>(apiRequest({
      method: 'POST',
      url: '/upload/instrument-image',
      data: formData,
    }));
    return res;
  },

  // GET /api/instruments/:id/calendar
  async getCalendarEvents(instrumentId: string): Promise<ApiResponse<InstrumentCalendarEvent[]>> {
    return unwrap<InstrumentCalendarEvent[]>(apiRequest({
      method: 'GET',
      url: `/instruments/${instrumentId}/calendar`,
    }));
  },

  // GET /api/instruments/:id/reviews
  async getReviews(instrumentId: string): Promise<ApiResponse<InstrumentReview[]>> {
    return unwrap<InstrumentReview[]>(apiRequest({
      method: 'GET',
      url: `/instruments/${instrumentId}/reviews`,
    }));
  },

  // POST /api/instrument-bookings
  async createBooking(payload: CreateBookingPayload): Promise<ApiResponse<InstrumentBooking>> {
    const result = await unwrap<InstrumentBooking>(apiRequest({
      method: 'POST',
      url: '/instrument-bookings',
      data: payload,
    }));

    if (result.success) {
      window.dispatchEvent(new Event(INSTRUMENTS_CHANGED_EVENT));
    }

    return result;
  },

  // GET /api/admin/instrument-bookings?status=
  async getBookings(status?: BookingStatus): Promise<ApiResponse<InstrumentBooking[]>> {
    const params = status ? { status } : {};
    return unwrap<InstrumentBooking[]>(apiRequest({
      method: 'GET',
      url: '/admin/instrument-bookings',
      params,
    }));
  },

  // GET /api/admin/instrument-bookings/pending-count
  async getPendingCount(): Promise<number> {
    const result = await unwrap<{ count: number }>(apiRequest({
      method: 'GET',
      url: '/admin/instrument-bookings/pending-count',
    }));

    if (result.success && result.data) {
      return result.data.count;
    }
    return 0;
  },

  // GET /api/admin/instrument-bookings/:id
  async getBookingById(id: string): Promise<ApiResponse<InstrumentBooking>> {
    return unwrap<InstrumentBooking>(apiRequest({
      method: 'GET',
      url: `/admin/instrument-bookings/${id}`,
    }));
  },

  // PATCH /api/admin/instrument-bookings/:id/approve
  async approveBooking(id: string, adminNote?: string): Promise<ApiResponse<InstrumentBooking>> {
    const result = await unwrap<InstrumentBooking>(apiRequest({
      method: 'PATCH',
      url: `/admin/instrument-bookings/${id}/approve`,
      data: { adminNote },
    }));

    if (result.success) {
      window.dispatchEvent(new Event(INSTRUMENTS_CHANGED_EVENT));
    }

    return result;
  },

  // PATCH /api/admin/instrument-bookings/:id/reject
  async rejectBooking(id: string, adminNote: string): Promise<ApiResponse<InstrumentBooking>> {
    const result = await unwrap<InstrumentBooking>(apiRequest({
      method: 'PATCH',
      url: `/admin/instrument-bookings/${id}/reject`,
      data: { adminNote },
    }));

    if (result.success) {
      window.dispatchEvent(new Event(INSTRUMENTS_CHANGED_EVENT));
    }

    return result;
  },

  // DELETE /api/admin/instrument-bookings/:id
  async cancelBooking(id: string, adminNote?: string): Promise<ApiResponse<InstrumentBooking>> {
    const result = await unwrap<InstrumentBooking>(apiRequest({
      method: 'DELETE',
      url: `/admin/instrument-bookings/${id}`,
      data: { adminNote },
    }));

    if (result.success) {
      window.dispatchEvent(new Event(INSTRUMENTS_CHANGED_EVENT));
    }

    return result;
  },

  // POST /api/instrument-reviews
  async createReview(review: {
    instrumentId: string;
    bookingId?: string;
    reviewerName: string;
    reviewerAffiliation?: string;
    rating: number;
    comment: string;
  }): Promise<ApiResponse<InstrumentReview>> {
    return unwrap<InstrumentReview>(apiRequest({
      method: 'POST',
      url: '/instrument-reviews',
      data: review,
    }));
  },

  // POST /api/admin/instrument-categories
  async createCategory(name: string): Promise<ApiResponse<InstrumentCategory>> {
    return unwrap<InstrumentCategory>(apiRequest({
      method: 'POST',
      url: '/admin/instrument-categories',
      data: { name },
    }));
  },

  // POST /api/admin/instrument-unavailable-periods
  async createUnavailablePeriod(period: Omit<InstrumentUnavailablePeriod, 'id'>): Promise<ApiResponse<InstrumentUnavailablePeriod>> {
    return unwrap<InstrumentUnavailablePeriod>(apiRequest({
      method: 'POST',
      url: '/admin/instrument-unavailable-periods',
      data: period,
    }));
  },

  // DELETE /api/admin/instrument-unavailable-periods/:id
  async deleteUnavailablePeriod(id: string): Promise<ApiResponse<void>> {
    return unwrap<void>(apiRequest({
      method: 'DELETE',
      url: `/admin/instrument-unavailable-periods/${id}`,
    }));
  },

  /** Conflict message check (backend validates on approve). */
  checkBookingConflict(_booking: InstrumentBooking): string | null {
    return null;
  },
};
