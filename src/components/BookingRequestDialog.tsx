import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { instrumentService } from '@/services/instrument.service';
import { Instrument, InstrumentCalendarEvent } from '@/services/types';
import { buildTimeOptions, combineDateTime, formatDuration, overlaps } from '@/lib/instrumentUtils';

interface Props {
  instrument: Instrument;
  events: InstrumentCalendarEvent[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-selected slot from the calendar */
  initialStart?: Date | null;
  onSubmitted?: () => void;
}

const emptyForm = {
  requesterName: '',
  requesterEmail: '',
  requesterPhone: '',
  affiliation: '',
  supervisorName: '',
  purposeTitle: '',
  purposeDescription: '',
  sampleDetails: '',
};

export function BookingRequestDialog({ instrument, events, open, onOpenChange, initialStart, onSubmitted }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const times = useMemo(() => buildTimeOptions(instrument), [instrument]);

  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Reset every time the dialog opens
  useEffect(() => {
    if (!open) return;
    const start = initialStart ?? null;
    setDate(start ? format(start, 'yyyy-MM-dd') : '');
    const st = start ? format(start, 'HH:mm') : '';
    setStartTime(st);
    const idx = times.indexOf(st);
    setEndTime(idx >= 0 && times[idx + 2] ? times[idx + 2] : idx >= 0 && times[idx + 1] ? times[idx + 1] : '');
    setForm({
      ...emptyForm,
      requesterName: user?.username ?? '',
      requesterEmail: user?.email ?? '',
    });
    setSubmitted(false);
    setError('');
  }, [open, initialStart, times, user]);

  const minDate = format(new Date(), 'yyyy-MM-dd');
  const maxDate = format(new Date(Date.now() + instrument.advanceBookingDays * 86400000), 'yyyy-MM-dd');

  const range = useMemo(() => {
    if (!date || !startTime || !endTime) return null;
    const s = combineDateTime(date, startTime);
    const e = combineDateTime(date, endTime);
    return { s, e, minutes: Math.round((e.getTime() - s.getTime()) / 60000) };
  }, [date, startTime, endTime]);

  // Live validation of the chosen time window
  const timeProblem = useMemo(() => {
    if (!range) return '';
    if (range.minutes <= 0) return 'End time must be after the start time.';
    if (range.s < new Date()) return 'Please choose a time in the future.';
    if (range.minutes < instrument.minDurationMinutes)
      return `Minimum booking duration is ${formatDuration(instrument.minDurationMinutes)}.`;
    if (range.minutes > instrument.maxDurationMinutes)
      return `Maximum booking duration is ${formatDuration(instrument.maxDurationMinutes)}.`;
    const clash = events.find((e) => overlaps(range.s, range.e, new Date(e.startAt), new Date(e.endAt)));
    if (clash) return clash.kind === 'booking' ? 'This time overlaps with an existing reservation.' : `Instrument unavailable: ${clash.subtitle ?? clash.title}.`;
    return '';
  }, [range, events, instrument]);

  const set = (k: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!range) return setError('Please select a date, start time and end time.');
    if (timeProblem) return setError(timeProblem);
    if (!form.requesterName.trim() || !form.requesterEmail.trim() || !form.affiliation.trim())
      return setError('Please fill in your name, email and affiliation.');
    if (!/^\S+@\S+\.\S+$/.test(form.requesterEmail)) return setError('Please enter a valid email address.');
    if (!form.purposeTitle.trim() || !form.purposeDescription.trim())
      return setError('Please describe your research or intended usage.');

    setSubmitting(true);
    const res = await instrumentService.createBooking({
      instrumentId: instrument.id,
      requesterId: user?.id,
      requesterName: form.requesterName.trim(),
      requesterEmail: form.requesterEmail.trim(),
      requesterPhone: form.requesterPhone.trim() || undefined,
      affiliation: form.affiliation.trim(),
      supervisorName: form.supervisorName.trim() || undefined,
      purposeTitle: form.purposeTitle.trim(),
      purposeDescription: form.purposeDescription.trim(),
      sampleDetails: form.sampleDetails.trim() || undefined,
      startAt: range.s.toISOString(),
      endAt: range.e.toISOString(),
    });
    setSubmitting(false);
    if (!res.success) return setError(res.error || 'Could not submit your request.');
    setSubmitted(true);
    toast({ title: 'Request submitted', description: 'The responsible admin will review your booking request.' });
    onSubmitted?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {submitted ? (
          <div className="text-center py-6">
            <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto mb-4" />
            <DialogTitle className="font-heading text-2xl mb-2">Request sent for approval</DialogTitle>
            <DialogDescription className="max-w-md mx-auto leading-relaxed">
              Your request for <strong>{instrument.name}</strong> on{' '}
              <strong>{range && `${format(range.s, 'd MMM yyyy')}, ${format(range.s, 'h:mm a')} – ${format(range.e, 'h:mm a')}`}</strong>{' '}
              is now pending. {instrument.responsibleAdminName} will review it, and the slot is only reserved once approved.
            </DialogDescription>
            <Button className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <DialogHeader>
              <DialogTitle className="font-heading text-2xl">Book {instrument.name}</DialogTitle>
              <DialogDescription>
                Requests are reviewed by {instrument.responsibleAdminName}. The time is reserved only after approval.
              </DialogDescription>
            </DialogHeader>

            {/* Time selection */}
            <div className="rounded-xl border border-border bg-secondary/30 p-4 space-y-3">
              <p className="text-sm font-semibold text-foreground">When do you need it?</p>
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="bk-date">Date</Label>
                  <Input id="bk-date" type="date" min={minDate} max={maxDate} value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Start time</Label>
                  <Select value={startTime} onValueChange={setStartTime}>
                    <SelectTrigger><SelectValue placeholder="Start" /></SelectTrigger>
                    <SelectContent>
                      {times.slice(0, -1).map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>End time</Label>
                  <Select value={endTime} onValueChange={setEndTime}>
                    <SelectTrigger><SelectValue placeholder="End" /></SelectTrigger>
                    <SelectContent>
                      {times.slice(1).map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {range && !timeProblem && (
                <p className="text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Slot is free · {formatDuration(range.minutes)}
                </p>
              )}
              {timeProblem && (
                <p className="text-sm text-destructive flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" /> {timeProblem}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Duration {formatDuration(instrument.minDurationMinutes)} – {formatDuration(instrument.maxDurationMinutes)} · up to {instrument.advanceBookingDays} days in advance
              </p>
            </div>

            {/* Requester */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="bk-name">Full name *</Label>
                <Input id="bk-name" value={form.requesterName} onChange={set('requesterName')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bk-email">Email *</Label>
                <Input id="bk-email" type="email" value={form.requesterEmail} onChange={set('requesterEmail')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bk-phone">Phone</Label>
                <Input id="bk-phone" value={form.requesterPhone} onChange={set('requesterPhone')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bk-aff">Position &amp; affiliation *</Label>
                <Input id="bk-aff" placeholder="e.g. MSc Student, Dept. of Chemistry" value={form.affiliation} onChange={set('affiliation')} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="bk-sup">Supervisor</Label>
                <Input id="bk-sup" value={form.supervisorName} onChange={set('supervisorName')} />
              </div>
            </div>

            {/* Purpose */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="bk-title">Research / usage title *</Label>
                <Input id="bk-title" value={form.purposeTitle} onChange={set('purposeTitle')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bk-desc">Intended usage *</Label>
                <Textarea id="bk-desc" rows={3} placeholder="Describe your experiment and what you will measure." value={form.purposeDescription} onChange={set('purposeDescription')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bk-sample">Sample details</Label>
                <Textarea id="bk-sample" rows={2} placeholder="Sample type, quantity, hazards (if any)" value={form.sampleDetails} onChange={set('sampleDetails')} />
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 text-destructive text-sm px-3 py-2 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> {error}
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting} className="bg-accent text-accent-foreground hover:bg-accent/90">
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Submit booking request
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
