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
    <div className="min-h-screen bg-[#FAFBF8]">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#F0F9FF] via-[#DBEAFE] to-[#F8FAFC] py-12 sm:py-16">
        <div className="container-wide text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1E40AF] mb-4">Notices</h1>
          <p className="text-sm sm:text-base lg:text-lg text-[#475569] max-w-2xl mx-auto">
            Stay updated with the latest announcements and news from our research group.
          </p>
        </div>
      </div>

      <div className="container-wide py-8 sm:py-12">

      {/* Notices List */}
      <div className="max-w-3xl mx-auto">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white border border-[#E5E7EB] rounded-xl p-6 animate-pulse">
                <div className="h-5 w-3/4 bg-[#F3F8FF] rounded mb-3" />
                <div className="h-4 w-full bg-[#F3F8FF] rounded mb-2" />
                <div className="h-4 w-2/3 bg-[#F3F8FF] rounded" />
              </div>
            ))}
          </div>
        ) : notices.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 mx-auto text-[#94A3B8] mb-4" />
            <p className="text-[#475569]">No notices available.</p>
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
    </div>
  );
}

function NoticeCard({ notice, delay }: { notice: Notice; delay: string }) {
  const isImportant = notice.priority === 'important';

  return (
    <div
      className={`bg-white border border-[#E5E7EB] rounded-xl p-4 sm:p-6 animate-fade-in-up ${
        isImportant ? 'border-l-4 border-l-red-500' : ''
      }`}
      style={{ animationDelay: delay }}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div
          className={`p-1.5 sm:p-2 rounded-md sm:rounded-lg shrink-0 ${
            isImportant
              ? 'bg-red-100 text-red-500'
              : 'bg-[#DBEAFE] text-[#3B82F6]'
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
            <h3 className="font-heading text-base sm:text-lg font-semibold text-[#0F172A]">
              {notice.title}
            </h3>
            {isImportant && (
              <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium bg-red-100 text-red-500 shrink-0">
                Important
              </span>
            )}
          </div>
          <p className="text-[#475569] text-xs sm:text-sm leading-relaxed mb-2 sm:mb-3">
            {notice.content}
          </p>
          <p className="text-[10px] sm:text-xs text-[#94A3B8]">
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
