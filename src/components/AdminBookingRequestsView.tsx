import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { AlertTriangle, Check, ClipboardList, Loader2, Mail, Phone, UserRound, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { instrumentService } from '@/services/instrument.service';
import { BookingStatus, Instrument, InstrumentBooking } from '@/services/types';
import { BOOKING_STATUS_CONFIG, bookingMinutes, formatDuration, formatRange } from '@/lib/instrumentUtils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { InstrumentImage } from './InstrumentShared';

type Filter = 'all' | BookingStatus;
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'cancelled', label: 'Cancelled' },
  { id: 'all', label: 'All' },
];

export function AdminBookingRequestsView() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [bookings, setBookings] = useState<InstrumentBooking[]>([]);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('pending');
  const [busyId, setBusyId] = useState<string | null>(null);

  const [noteDialog, setNoteDialog] = useState<{ booking: InstrumentBooking; mode: 'reject' | 'cancel' } | null>(null);
  const [note, setNote] = useState('');

  const adminId = user?.id ?? 'admin-001';

  const refresh = async () => {
    const [b, i] = await Promise.all([instrumentService.getBookings(), instrumentService.getInstruments()]);
    if (b.success && b.data) setBookings(b.data);
    if (i.success && i.data) setInstruments(i.data);
    setLoading(false);
    queryClient.invalidateQueries({ queryKey: ['instrument-calendar'] });
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: bookings.length };
    FILTERS.forEach((f) => f.id !== 'all' && (c[f.id] = bookings.filter((b) => b.status === f.id).length));
    return c;
  }, [bookings]);

  const list = bookings
    .filter((b) => filter === 'all' || b.status === filter)
    .sort((a, b) =>
      filter === 'pending' || filter === 'approved'
        ? new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  const approve = async (b: InstrumentBooking) => {
    setBusyId(b.id);
    const res = await instrumentService.approveBooking(b.id, adminId);
    setBusyId(null);
    if (res.success) {
      toast({ title: 'Booking approved', description: 'The slot now appears on the instrument calendar.' });
      refresh();
    } else {
      toast({ title: 'Cannot approve', description: res.error, variant: 'destructive' });
    }
  };

  const submitNote = async () => {
    if (!noteDialog) return;
    const { booking, mode } = noteDialog;
    if (mode === 'reject' && !note.trim()) {
      toast({ title: 'Reason required', description: 'Please tell the requester why the request was rejected.', variant: 'destructive' });
      return;
    }
    setBusyId(booking.id);
    const res =
      mode === 'reject'
        ? await instrumentService.rejectBooking(booking.id, adminId, note.trim())
        : await instrumentService.cancelBooking(booking.id, adminId, note.trim() || undefined);
    setBusyId(null);
    if (res.success) {
      toast({ title: mode === 'reject' ? 'Request rejected' : 'Booking cancelled' });
      setNoteDialog(null);
      setNote('');
      refresh();
    }
  };

  const instrumentOf = (id: string) => instruments.find((i) => i.id === id);

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-heading text-2xl text-foreground">Booking Requests</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Review requests, then approve or reject them. Approved bookings appear on the instrument calendar and block the time for others.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3.5 py-2 rounded-full text-sm font-medium border transition-colors ${
              filter === f.id ? 'bg-accent text-primary-foreground border-accent' : 'bg-card text-muted-foreground border-border hover:border-accent/50'
            }`}
          >
            {f.label} ({counts[f.id] ?? 0})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-36 bg-card border border-border rounded-xl animate-pulse" />)}</div>
      ) : list.length === 0 ? (
        <div className="text-center py-14 bg-card border border-border rounded-xl">
          <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-60" />
          <h3 className="font-heading text-lg text-foreground mb-1">No requests here</h3>
          <p className="text-sm text-muted-foreground">Nothing matches this filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((b) => {
            const inst = instrumentOf(b.instrumentId);
            const cfg = BOOKING_STATUS_CONFIG[b.status];
            const conflict = b.status === 'pending' ? instrumentService.checkBookingConflict(b) : null;
            const busy = busyId === b.id;
            return (
              <div key={b.id} className="bg-card border border-border rounded-xl p-5 shadow-sm">
                <div className="flex flex-col lg:flex-row gap-5">
                  <div className="flex items-start gap-4 lg:w-72 shrink-0">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary shrink-0">
                      <InstrumentImage src={inst?.imageUrl ?? ''} alt={inst?.name ?? 'Instrument'} className="w-full h-full" />
                    </div>
                    <div className="min-w-0">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mb-1.5 ${cfg.className}`}>{cfg.label}</span>
                      <h3 className="font-semibold text-foreground leading-tight">{inst?.name ?? 'Deleted instrument'}</h3>
                      <p className="text-xs text-muted-foreground mt-1">Requested {format(new Date(b.createdAt), 'd MMM yyyy')}</p>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-accent">{formatRange(b.startAt, b.endAt)}</p>
                      <p className="text-xs text-muted-foreground">{formatDuration(bookingMinutes(b.startAt, b.endAt))}</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{b.purposeTitle}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{b.purposeDescription}</p>
                      {b.sampleDetails && <p className="text-sm text-muted-foreground mt-1"><span className="font-medium text-foreground">Samples:</span> {b.sampleDetails}</p>}
                    </div>
                    <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5"><UserRound className="w-4 h-4" /> {b.requesterName} · {b.affiliation}</span>
                      <span className="inline-flex items-center gap-1.5"><Mail className="w-4 h-4" /> {b.requesterEmail}</span>
                      {b.requesterPhone && <span className="inline-flex items-center gap-1.5"><Phone className="w-4 h-4" /> {b.requesterPhone}</span>}
                      {b.supervisorName && <span>Supervisor: {b.supervisorName}</span>}
                    </div>
                    {b.adminNote && (
                      <p className="text-sm rounded-lg bg-secondary/50 border border-border px-3 py-2 text-muted-foreground">
                        <span className="font-medium text-foreground">Admin note:</span> {b.adminNote}
                      </p>
                    )}
                    {conflict && (
                      <p className="text-sm flex items-start gap-2 text-destructive">
                        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> {conflict} Approving is blocked.
                      </p>
                    )}
                  </div>

                  <div className="flex lg:flex-col gap-2 lg:w-36 shrink-0">
                    {b.status === 'pending' && (
                      <>
                        <Button size="sm" disabled={busy || !!conflict} onClick={() => approve(b)} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
                          {busy ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Check className="w-4 h-4 mr-1.5" />} Approve
                        </Button>
                        <Button size="sm" variant="outline" disabled={busy} onClick={() => { setNote(''); setNoteDialog({ booking: b, mode: 'reject' }); }} className="flex-1 text-destructive hover:text-destructive">
                          <X className="w-4 h-4 mr-1.5" /> Reject
                        </Button>
                      </>
                    )}
                    {b.status === 'approved' && (
                      <Button size="sm" variant="outline" disabled={busy} onClick={() => { setNote(''); setNoteDialog({ booking: b, mode: 'cancel' }); }} className="flex-1">
                        Cancel booking
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={!!noteDialog} onOpenChange={(o) => !o && setNoteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{noteDialog?.mode === 'reject' ? 'Reject booking request' : 'Cancel approved booking'}</DialogTitle>
            <DialogDescription>
              {noteDialog?.mode === 'reject'
                ? 'The requester will see this reason.'
                : 'The reserved time will become available again for other users.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label>{noteDialog?.mode === 'reject' ? 'Reason *' : 'Note (optional)'}</Label>
            <Textarea rows={4} value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteDialog(null)}>Back</Button>
            <Button onClick={submitNote} disabled={!!busyId} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {noteDialog?.mode === 'reject' ? 'Reject request' : 'Cancel booking'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
