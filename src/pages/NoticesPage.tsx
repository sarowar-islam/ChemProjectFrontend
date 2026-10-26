import { useState } from 'react';
import { Bell, Search, ExternalLink, FileText } from 'lucide-react';
import { noticeService } from '@/services/notice.service';
import { Notice } from '@/services/types';
import { useQuery } from '@tanstack/react-query';

export default function NoticesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: notices = [], isLoading: loading } = useQuery({
    queryKey: ['notices'],
    queryFn: async () => {
      const res = await noticeService.getNotices();
      if (res.success && res.data) {
        return [...res.data].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      }
      return [];
    },
  });

  const filteredNotices = notices.filter(
    (notice) =>
      notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (notice.publishedBy && notice.publishedBy.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-secondary/70 dark:from-secondary/25 via-secondary/45 dark:via-secondary/15 to-background py-8 sm:py-12 border-b border-border">
        <div className="container-wide text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#166534] dark:text-foreground mb-4">
            All Notices
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto">
            Official announcements, notices, and documents from our research group and department.
          </p>
        </div>
      </div>

      <div className="container-wide py-8">
        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search notices by title or publisher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent transition-colors text-sm shadow-sm"
            />
          </div>
        </div>

        {/* Notices Table */}
        <div className="max-w-5xl mx-auto bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 bg-secondary/60 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredNotices.length === 0 ? (
            <div className="text-center py-16">
              <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground text-base">No notices found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-secondary/50 border-b border-border text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    <th className="py-4 px-4 sm:px-6 w-16 text-center">Sl</th>
                    <th className="py-4 px-4 sm:px-6">Notice Title</th>
                    <th className="py-4 px-4 sm:px-6">Published By</th>
                    <th className="py-4 px-4 sm:px-6 w-36">Published Date</th>
                    <th className="py-4 px-4 sm:px-6 w-28 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {filteredNotices.map((notice, index) => {
                    const isImportant = notice.priority === 'important';
                    return (
                      <tr
                        key={notice.id}
                        className="hover:bg-secondary/30 transition-colors group"
                      >
                        <td className="py-4 px-4 sm:px-6 text-center font-medium text-muted-foreground">
                          {index + 1}
                        </td>
                        <td className="py-4 px-4 sm:px-6">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                              {notice.title}
                            </span>
                            {isImportant && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-600 shrink-0">
                                Important
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 sm:px-6 text-muted-foreground">
                          {notice.publishedBy || 'Department of Chemistry'}
                        </td>
                        <td className="py-4 px-4 sm:px-6 text-muted-foreground whitespace-nowrap">
                          {new Date(notice.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="py-4 px-4 sm:px-6 text-center">
                          {notice.fileUrl ? (
                            <a
                              href={notice.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#166534] text-white hover:bg-[#166534]/90 transition-all shadow-sm"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              Details
                              <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                            </a>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">No file</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
