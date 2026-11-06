import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FlaskConical, Star } from 'lucide-react';
import { Instrument, InstrumentStatus } from '@/services/types';
import { STATUS_CONFIG } from '@/lib/instrumentUtils';
import { cn } from '@/lib/utils';

export function StatusBadge({ status, className }: { status: InstrumentStatus; className?: string }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm',
        cfg.badge,
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-white/90" />
      {cfg.label}
    </span>
  );
}

export function RatingStars({ value, size = 'sm' }: { value: number; size?: 'sm' | 'md' | 'lg' }) {
  const px = size === 'lg' ? 'w-6 h-6' : size === 'md' ? 'w-5 h-5' : 'w-4 h-4';
  return (
    <div className="inline-flex items-center gap-0.5" aria-label={`${value.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(px, n <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30')}
        />
      ))}
    </div>
  );
}

export function InstrumentImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className={cn('flex items-center justify-center bg-secondary text-muted-foreground', className)}>
        <FlaskConical className="w-10 h-10 opacity-50" />
      </div>
    );
  }
  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={cn('object-cover', className)} />;
}

export function InstrumentCard({ instrument, delay = '0s' }: { instrument: Instrument; delay?: string }) {
  return (
    <Link
      to={`/instruments/${instrument.slug}`}
      className="group bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-elevated hover:border-accent/40 transition-all duration-300 flex flex-col animate-fade-in-up"
      style={{ animationDelay: delay }}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        <InstrumentImage
          src={instrument.imageUrl}
          alt={instrument.name}
          className="w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
        <StatusBadge status={instrument.status} className="absolute top-3 right-3" />
      </div>
      <div className="p-5 flex flex-col flex-1">
        <p className="text-xs font-medium uppercase tracking-wider text-accent mb-1.5">{instrument.category}</p>
        <h3 className="font-heading text-lg font-bold text-foreground group-hover:text-accent transition-colors mb-2" style={{ letterSpacing: '-0.01em' }}>
          {instrument.name}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4">{instrument.shortDescription}</p>
        <div className="mt-auto pt-4 border-t border-border/60 flex items-center justify-between">
          {instrument.reviewCount ? (
            <div className="flex items-center gap-1.5 text-sm">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-foreground">{instrument.averageRating?.toFixed(1)}</span>
              <span className="text-muted-foreground">({instrument.reviewCount})</span>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">No reviews yet</span>
          )}
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent group-hover:gap-2 transition-all">
            View details <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
