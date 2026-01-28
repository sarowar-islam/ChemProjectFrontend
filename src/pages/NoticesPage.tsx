import { useEffect, useState } from 'react';
import { Bell, AlertCircle } from 'lucide-react';
import { noticeService } from '@/services/notice.service';
import { Notice } from '@/services/types';

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotices = async () => {
      const res = await noticeService.getNotices();
      if (res.success && res.data) {
        // Sort by date, newest first
        const sorted = [...res.data].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setNotices(sorted);
      }
      setLoading(false);
    };

    fetchNotices();
  }, []);

  return (
    <div className="container-wide section-padding">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title text-3xl sm:text-4xl md:text-5xl">Notices</h1>
        <p className="page-subtitle text-sm sm:text-base lg:text-lg">
          Stay updated with the latest announcements and news from our research group.
        </p>
      </div>

      {/* Notices List */}
      <div className="max-w-3xl mx-auto">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card-academic p-6 animate-pulse">
                <div className="h-5 w-3/4 bg-muted rounded mb-3" />
                <div className="h-4 w-full bg-muted rounded mb-2" />
                <div className="h-4 w-2/3 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : notices.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No notices available.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notices.map((notice, index) => (
              <NoticeCard key={notice.id} notice={notice} delay={`${index * 0.05}s`} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function NoticeCard({ notice, delay }: { notice: Notice; delay: string }) {
  const isImportant = notice.priority === 'important';

  return (
    <div
      className={`card-academic p-4 sm:p-6 animate-fade-in-up ${
        isImportant ? 'border-l-4 border-l-destructive' : ''
      }`}
      style={{ animationDelay: delay }}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div
          className={`p-1.5 sm:p-2 rounded-md sm:rounded-lg shrink-0 ${
            isImportant
              ? 'bg-destructive/10 text-destructive'
              : 'bg-accent/10 text-accent'
          }`}
        >
          {isImportant ? (
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          ) : (
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 sm:gap-4 mb-1.5 sm:mb-2">
            <h3 className="font-heading text-base sm:text-lg font-semibold text-foreground">
              {notice.title}
            </h3>
            {isImportant && (
              <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium bg-destructive/10 text-destructive shrink-0">
                Important
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed mb-2 sm:mb-3">
            {notice.content}
          </p>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            {new Date(notice.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
