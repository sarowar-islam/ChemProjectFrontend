import { useMemo, useState } from 'react';
import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Instrument, InstrumentCalendarEvent } from '@/services/types';
import { overlaps } from '@/lib/instrumentUtils';
import { cn } from '@/lib/utils';

type View = 'day' | 'week' | 'month';

const HOUR_PX = 56;
const WEEK_OPTS = { weekStartsOn: 0 as const };

const hatch: React.CSSProperties = {
  backgroundImage:
    'repeating-linear-gradient(45deg, rgba(225,29,72,0.14) 0, rgba(225,29,72,0.14) 6px, rgba(225,29,72,0.05) 6px, rgba(225,29,72,0.05) 12px)',
};

interface Props {
  instrument: Instrument;
  events: InstrumentCalendarEvent[];
  loading?: boolean;
  /** Called when the user clicks a free slot (start time). Omit to disable click-to-book. */
  onSelectSlot?: (start: Date) => void;
}

export function InstrumentCalendar({ instrument, events, loading, onSelectSlot }: Props) {
  const [view, setView] = useState<View>('week');
  const [cursor, setCursor] = useState(new Date());
  const now = new Date();

  const parsed = useMemo(
    () => events.map((e) => ({ ...e, start: new Date(e.startAt), end: new Date(e.endAt) })),
    [events]
  );

  const dayWindow = (d: Date) => {
    const open = new Date(d);
    open.setHours(instrument.openingHour, 0, 0, 0);
    const close = new Date(d);
    close.setHours(instrument.closingHour, 0, 0, 0);
    return { open, close };
  };

  const slotsPerDay = Math.floor(((instrument.closingHour - instrument.openingHour) * 60) / instrument.slotIntervalMinutes);

  const slotState = (day: Date, idx: number) => {
    const { open } = dayWindow(day);
    const start = new Date(open.getTime() + idx * instrument.slotIntervalMinutes * 60000);
    const end = new Date(start.getTime() + instrument.slotIntervalMinutes * 60000);
    const occupied = parsed.some((e) => overlaps(start, end, e.start, e.end));
    return { start, end, occupied, past: end <= now };
  };

  const freeSlots = (day: Date) => {
    let n = 0;
    for (let i = 0; i < slotsPerDay; i++) {
      const s = slotState(day, i);
      if (!s.occupied && !s.past) n++;
    }
    return n;
  };

  const days =
    view === 'day'
      ? [cursor]
      : view === 'week'
      ? eachDayOfInterval({ start: startOfWeek(cursor, WEEK_OPTS), end: endOfWeek(cursor, WEEK_OPTS) })
      : eachDayOfInterval({
          start: startOfWeek(startOfMonth(cursor), WEEK_OPTS),
          end: endOfWeek(endOfMonth(cursor), WEEK_OPTS),
        });

  const step = (dir: 1 | -1) =>
    setCursor((c) => (view === 'day' ? addDays(c, dir) : view === 'week' ? addWeeks(c, dir) : addMonths(c, dir)));

  const title =
    view === 'day'
      ? format(cursor, 'EEEE, d MMMM yyyy')
      : view === 'week'
      ? `${format(days[0], 'd MMM')} – ${format(days[6], 'd MMM yyyy')}`
      : format(cursor, 'MMMM yyyy');

  const hours = Array.from({ length: instrument.closingHour - instrument.openingHour }, (_, i) => instrument.openingHour + i);
  const gridHeight = hours.length * HOUR_PX;

  const eventStyle = (e: (typeof parsed)[number], day: Date) => {
    const { open, close } = dayWindow(day);
    const s = Math.max(e.start.getTime(), open.getTime());
    const en = Math.min(e.end.getTime(), close.getTime());
    if (en <= s) return null;
    return {
      top: ((s - open.getTime()) / 3600000) * HOUR_PX,
      height: Math.max(((en - s) / 3600000) * HOUR_PX - 2, 18),
    };
  };

  /* ------------------------------------------------------------ time grid */
  const renderTimeGrid = () => (
    <div className="overflow-x-auto">
      <div className={cn(view === 'week' && 'min-w-[720px]')}>
        {/* Day headers */}
        <div className="flex border-b border-border bg-secondary/40">
          <div className="w-14 shrink-0" />
          {days.map((d) => (
            <button
              key={d.toISOString()}
              onClick={() => {
                setCursor(d);
                setView('day');
              }}
              className="flex-1 py-2.5 text-center border-l border-border hover:bg-secondary/70 transition-colors"
            >
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{format(d, 'EEE')}</div>
              <div
                className={cn(
                  'mx-auto mt-0.5 w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold',
                  isSameDay(d, now) ? 'bg-accent text-accent-foreground' : 'text-foreground'
                )}
              >
                {format(d, 'd')}
              </div>
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="flex">
          <div className="w-14 shrink-0 relative" style={{ height: gridHeight }}>
            {hours.map((h, i) => (
              <div
                key={h}
                className="absolute right-2 -translate-y-1/2 text-[11px] text-muted-foreground"
                style={{ top: i * HOUR_PX, display: i === 0 ? 'none' : undefined }}
              >
                {format(new Date(2000, 0, 1, h), 'h a')}
              </div>
            ))}
          </div>

          {days.map((d) => {
            const dayEvents = parsed.filter((e) => overlaps(e.start, e.end, dayWindow(d).open, dayWindow(d).close));
            const { open, close } = dayWindow(d);
            const showNow = isSameDay(d, now) && now >= open && now <= close;
            return (
              <div key={d.toISOString()} className="flex-1 relative border-l border-border" style={{ height: gridHeight }}>
                {hours.map((h, i) => (
                  <div key={h} className="absolute inset-x-0 border-t border-border/70" style={{ top: i * HOUR_PX }} />
                ))}

                {/* Clickable free slots */}
                {Array.from({ length: slotsPerDay }).map((_, idx) => {
                  const s = slotState(d, idx);
                  const slotPx = (instrument.slotIntervalMinutes / 60) * HOUR_PX;
                  const bookable = !s.occupied && !s.past && !!onSelectSlot && instrument.status !== 'maintenance';
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={!bookable}
                      onClick={() => onSelectSlot?.(s.start)}
                      title={bookable ? `Available ${format(s.start, 'h:mm a')} – click to request` : undefined}
                      className={cn(
                        'group absolute inset-x-0 text-[10px] font-medium text-emerald-700 dark:text-emerald-300 transition-colors',
                        s.past && 'bg-muted/40',
                        bookable && 'hover:bg-emerald-500/15 cursor-pointer'
                      )}
                      style={{ top: idx * slotPx, height: slotPx }}
                    >
                      {bookable && <span className="opacity-0 group-hover:opacity-100">+ Book</span>}
                    </button>
                  );
                })}

                {/* Events */}
                {dayEvents.map((e) => {
                  const pos = eventStyle(e, d);
                  if (!pos) return null;
                  const blocked = e.kind === 'unavailable';
                  return (
                    <div
                      key={`${e.id}-${d.toDateString()}`}
                      className={cn(
                        'absolute inset-x-1 rounded-md px-2 py-1 overflow-hidden text-[11px] leading-tight border',
                        blocked
                          ? 'border-rose-300 dark:border-rose-500/40 text-rose-800 dark:text-rose-300'
                          : 'bg-amber-100 dark:bg-amber-500/20 border-amber-300 dark:border-amber-500/40 text-amber-900 dark:text-amber-200'
                      )}
                      style={{ top: pos.top + 1, height: pos.height, ...(blocked ? hatch : {}) }}
                      title={`${e.title}${e.subtitle ? ' – ' + e.subtitle : ''}\n${format(e.start, 'h:mm a')} – ${format(e.end, 'h:mm a')}`}
                    >
                      <div className="font-semibold truncate">{e.title}</div>
                      {pos.height > 34 && <div className="truncate opacity-80">{e.subtitle}</div>}
                    </div>
                  );
                })}

                {showNow && (
                  <div
                    className="absolute inset-x-0 h-0.5 bg-accent z-10 pointer-events-none"
                    style={{ top: ((now.getTime() - open.getTime()) / 3600000) * HOUR_PX }}
                  >
                    <span className="absolute -left-1 -top-[3px] w-2 h-2 rounded-full bg-accent" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  /* ---------------------------------------------------------------- month */
  const renderMonth = () => (
    <div className="overflow-x-auto">
      <div className="min-w-[640px]">
        <div className="grid grid-cols-7 bg-secondary/40 border-b border-border">
          {days.slice(0, 7).map((d) => (
            <div key={d.toISOString()} className="py-2.5 text-center text-[11px] uppercase tracking-wider text-muted-foreground">
              {format(d, 'EEE')}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((d) => {
            const dayEvents = parsed
              .filter((e) => overlaps(e.start, e.end, dayWindow(d).open, dayWindow(d).close))
              .sort((a, b) => a.start.getTime() - b.start.getTime());
            const inMonth = isSameMonth(d, cursor);
            const free = freeSlots(d);
            const shown = dayEvents.slice(0, 2);
            return (
              <button
                key={d.toISOString()}
                onClick={() => {
                  setCursor(d);
                  setView('day');
                }}
                className={cn(
                  'min-h-[104px] p-1.5 text-left border-b border-r border-border hover:bg-secondary/50 transition-colors flex flex-col gap-1',
                  !inMonth && 'bg-muted/30 text-muted-foreground/60'
                )}
              >
                <span
                  className={cn(
                    'w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold',
                    isSameDay(d, now) ? 'bg-accent text-accent-foreground' : 'text-foreground'
                  )}
                >
                  {format(d, 'd')}
                </span>
                {shown.map((e) => (
                  <span
                    key={`${e.id}-${d.toDateString()}`}
                    className={cn(
                      'w-full truncate rounded px-1.5 py-0.5 text-[10px] font-medium border',
                      e.kind === 'unavailable'
                        ? 'border-rose-300 dark:border-rose-500/40 text-rose-800 dark:text-rose-300'
                        : 'bg-amber-100 dark:bg-amber-500/20 border-amber-300 dark:border-amber-500/40 text-amber-900 dark:text-amber-200'
                    )}
                    style={e.kind === 'unavailable' ? hatch : undefined}
                  >
                    {format(e.start, 'HH:mm')} {e.title}
                  </span>
                ))}
                {dayEvents.length > shown.length && (
                  <span className="text-[10px] text-muted-foreground">+{dayEvents.length - shown.length} more</span>
                )}
                {inMonth && free > 0 && (
                  <span className="mt-auto text-[10px] font-medium text-emerald-700 dark:text-emerald-400">{free} free slots</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <button
            onClick={() => step(-1)}
            className="p-2 rounded-lg border border-border hover:bg-secondary text-muted-foreground"
            aria-label="Previous"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => step(1)}
            className="p-2 rounded-lg border border-border hover:bg-secondary text-muted-foreground"
            aria-label="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCursor(new Date())}
            className="px-3 py-2 rounded-lg border border-border hover:bg-secondary text-sm font-medium text-foreground"
          >
            Today
          </button>
          <h3 className="font-heading text-lg font-semibold text-foreground ml-2">{title}</h3>
        </div>
        <div className="inline-flex rounded-lg border border-border bg-secondary/40 p-1 self-start md:self-auto">
          {(['day', 'week', 'month'] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                'px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors',
                view === v ? 'bg-accent text-accent-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {loading ? <div className="h-96 animate-pulse bg-secondary/30" /> : view === 'month' ? renderMonth() : renderTimeGrid()}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 border-t border-border text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/50" /> Available (click a slot to book)</span>
        <span className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded bg-amber-100 border border-amber-300" /> Reserved</span>
        <span className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded border border-rose-300" style={hatch} /> Unavailable</span>
        <span className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded bg-muted" /> Past</span>
        <span className="ml-auto">
          Bookable {String(instrument.openingHour).padStart(2, '0')}:00 – {String(instrument.closingHour).padStart(2, '0')}:00
        </span>
      </div>
    </div>
  );
}
