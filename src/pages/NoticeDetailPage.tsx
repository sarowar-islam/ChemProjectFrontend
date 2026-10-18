import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Bell, AlertCircle, Calendar, ArrowLeft, Share2 } from 'lucide-react';
import { noticeService } from '@/services/notice.service';
import { Notice } from '@/services/types';

export default function NoticeDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);

  const createSlug = (title: string) => {
    if (!title) return '';
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  };

  useEffect(() => {
    const fetchNotice = async () => {
      const res = await noticeService.getNotices();
      if (res.success && res.data) {
        const found = res.data.find(
          (item: Notice) => item.id === slug || createSlug(item.title) === slug
        );
        if (found) {
          setNotice(found);
        }
      }
      setLoading(false);
    };
    fetchNotice();
  }, [slug]);

  if (loading) {
    return (
      <div className="container-wide py-16 text-center">
        <div className="animate-pulse space-y-4 max-w-2xl mx-auto">
          <div className="h-8 bg-secondary rounded w-3/4 mx-auto" />
          <div className="h-4 bg-secondary rounded w-1/2 mx-auto" />
          <div className="h-40 bg-secondary rounded w-full mt-6" />
        </div>
      </div>
    );
  }

  if (!notice) {
    return (
      <div className="container-wide py-20 text-center">
        <Bell className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="font-heading text-2xl font-bold text-foreground mb-2">Notice Not Found</h2>
        <p className="text-muted-foreground mb-6">The notice you are looking for does not exist or has been removed.</p>
        <button
          onClick={() => navigate('/notices')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground font-medium rounded-lg hover:bg-accent/90 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Notices
        </button>
      </div>
    );
  }

  const isImportant = notice.priority === 'important';

  return (
    <div className="bg-background min-h-screen py-10 sm:py-16">
      <div className="container-wide max-w-3xl">
        {/* Back Link */}
        <button
          onClick={() => navigate('/notices')}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-accent transition-colors mb-6 sm:mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Notices
        </button>

        {/* Notice Card Container */}
        <div className={`bg-card border border-border rounded-2xl p-6 sm:p-10 shadow-sm ${isImportant ? 'border-l-4 border-l-red-500' : ''}`}>
          <div className="flex items-start gap-4 mb-6">
            <div className={`p-3 rounded-xl ${isImportant ? 'bg-red-100 text-red-500 dark:bg-red-500/20' : 'bg-accent/15 text-accent'}`}>
              {isImportant ? <AlertCircle className="w-6 h-6" /> : <Bell className="w-6 h-6" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {isImportant && (
                  <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-300">
                    Important Notice
                  </span>
                )}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5 text-accent" />
                  {new Date(notice.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
                {notice.title}
              </h1>
            </div>
          </div>

          <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed pt-4 border-t border-border">
            <p className="whitespace-pre-wrap text-foreground/90 text-base sm:text-lg">
              {notice.content}
            </p>
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 font-medium text-sm transition-colors"
            >
              <Share2 className="w-4 h-4" /> Share Notice
            </button>
            <Link
              to="/notices"
              className="inline-flex items-center gap-2 text-accent font-semibold hover:underline text-sm"
            >
              View All Notices <ArrowLeft className="w-4 h-4 rotate-180" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
