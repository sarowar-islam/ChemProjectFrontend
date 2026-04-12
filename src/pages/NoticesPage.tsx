import { useEffect, useState } from 'react';
import { Bell, AlertCircle } from 'lucide-react';
import { noticeService } from '@/services/notice.service';
import { Notice } from '@/services/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

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
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-secondary/70 dark:from-secondary/25 via-secondary/45 dark:via-secondary/15 to-background py-6 sm:py-8">
        <div className="container-wide text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#166534] dark:text-foreground mb-4">Notices</h1>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto">
            Stay updated with the latest announcements and news from our research group.
          </p>
        </div>
      </div>

      <div className="container-wide py-4 sm:py-6">

      {/* Notices List */}
      <div className="max-w-3xl mx-auto">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-6 animate-pulse">
                <div className="h-5 w-3/4 bg-secondary rounded mb-3" />
                <div className="h-4 w-full bg-secondary rounded mb-2" />
                <div className="h-4 w-2/3 bg-secondary rounded" />
              </div>
            ))}
          </div>
        ) : notices.length === 0 ? (
          <div className="text-center py-6">
            <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No notices available.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notices.map((notice, index) => (
              <NoticeCard
                key={notice.id}
                notice={notice}
                delay={`${index * 0.05}s`}
                onClick={() => setSelectedNotice(notice)}
              />
            ))}
          </div>
        )}
      </div>
      </div>

      <Dialog open={!!selectedNotice} onOpenChange={() => setSelectedNotice(null)}>
        <DialogContent className="max-w-2xl bg-card border border-border max-h-[90vh] overflow-y-auto">
          {selectedNotice && (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading text-2xl text-foreground">{selectedNotice.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                  {selectedNotice.priority === 'important' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-300">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Important
                    </span>
                  )}
                  <span>
                    {new Date(selectedNotice.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{selectedNotice.content}</p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NoticeCard({ notice, delay, onClick }: { notice: Notice; delay: string; onClick: () => void }) {
  const isImportant = notice.priority === 'important';

  return (
    <article
      onClick={onClick}
      className={`bg-card border border-border rounded-xl p-4 sm:p-6 animate-fade-in-up ${
        isImportant ? 'border-l-4 border-l-red-500' : ''
      } cursor-pointer hover:shadow-md hover:border-accent/30 transition-all duration-300`}
      style={{ animationDelay: delay }}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div
          className={`p-1.5 sm:p-2 rounded-md sm:rounded-lg shrink-0 ${
            isImportant
              ? 'bg-red-100 text-red-500'
              : 'bg-accent/15 text-accent'
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
              <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium bg-red-100 text-red-500 shrink-0">
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
    </article>
  );
}
