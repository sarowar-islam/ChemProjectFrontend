import { useEffect, useState } from 'react';
import { Newspaper, Calendar, User, ArrowRight, X, ChevronLeft } from 'lucide-react';
import { newsService } from '@/services/news.service';
import { News } from '@/services/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function NewsPage() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      const res = await newsService.getNews();
      if (res.success && res.data) {
        // Sort by date, newest first
        const sorted = [...res.data].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setNews(sorted);
      }
      setLoading(false);
    };

    fetchNews();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-16 sm:py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[#0F172A]" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        </div>
        <div className="absolute top-10 sm:top-20 right-10 sm:right-20 w-48 sm:w-72 h-48 sm:h-72 bg-[#FACC15]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 sm:bottom-20 left-10 sm:left-20 w-64 sm:w-96 h-64 sm:h-96 bg-white/5 rounded-full blur-3xl" />
        
        <div className="container-wide relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/10 text-[#F8FAFC] text-xs sm:text-sm font-medium mb-4 sm:mb-6 animate-fade-in border border-white/20">
              <Newspaper className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Latest Updates</span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#F8FAFC] mb-4 sm:mb-6 animate-fade-in-up" style={{ letterSpacing: '-0.02em' }}>
              News & Updates
            </h1>
            <p className="text-sm sm:text-lg md:text-xl text-[#CBD5E1] animate-fade-in-up px-4" style={{ animationDelay: '0.1s' }}>
              Stay informed about the latest happenings, achievements, and announcements from our research group.
            </p>
          </div>
        </div>
      </section>

      {/* News Grid */}
      <section className="container-wide section-padding">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card-academic overflow-hidden animate-pulse">
                <div className="h-48 bg-secondary" />
                <div className="p-6">
                  <div className="h-5 w-3/4 bg-secondary rounded mb-3" />
                  <div className="h-4 w-full bg-secondary rounded mb-2" />
                  <div className="h-4 w-2/3 bg-secondary rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-20 bg-secondary/50 rounded-xl border border-border/50">
            <Newspaper className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-heading text-xl text-foreground mb-2">No news available</h3>
            <p className="text-muted-foreground">News and updates will appear here once published.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item, index) => (
              <NewsCard 
                key={item.id} 
                news={item} 
                delay={`${index * 0.05}s`}
                onClick={() => setSelectedNews(item)}
              />
            ))}
          </div>
        )}
      </section>

      {/* News Detail Modal */}
      <Dialog open={!!selectedNews} onOpenChange={() => setSelectedNews(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedNews && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <Calendar className="w-3 h-3" />
                  {new Date(selectedNews.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                  {selectedNews.author && (
                    <>
                      <span className="mx-2">•</span>
                      <User className="w-3 h-3" />
                      {selectedNews.author}
                    </>
                  )}
                </div>
                <DialogTitle className="font-heading text-2xl sm:text-3xl text-primary">
                  {selectedNews.title}
                </DialogTitle>
              </DialogHeader>
              
              {selectedNews.imageUrl && (
                <div className="mt-4 rounded-xl overflow-hidden">
                  <img 
                    src={selectedNews.imageUrl} 
                    alt={selectedNews.title}
                    className="w-full h-64 object-cover"
                  />
                </div>
              )}
              
              <div className="mt-6 prose prose-sm max-w-none">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {selectedNews.content}
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NewsCard({ 
  news, 
  delay, 
  onClick 
}: { 
  news: News; 
  delay: string;
  onClick: () => void;
}) {
  return (
    <article
      onClick={onClick}
      className="group card-academic overflow-hidden cursor-pointer hover:shadow-elevated hover:border-[#FACC15]/25 transition-all duration-300 animate-fade-in-up"
      style={{ animationDelay: delay }}
    >
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-[#FACC15]/10 to-secondary overflow-hidden">
        {news.imageUrl ? (
          <img 
            src={news.imageUrl} 
            alt={news.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Newspaper className="w-12 h-12 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Content */}
      <div className="p-5 sm:p-6">
        {/* Date & Author */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(news.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </div>
          {news.author && (
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {news.author}
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="font-heading text-lg font-semibold text-foreground group-hover:text-[#FACC15] transition-colors mb-2 line-clamp-2">
          {news.title}
        </h3>

        {/* Summary */}
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {news.summary || news.content.substring(0, 150) + '...'}
        </p>

        {/* Read More */}
        <div className="flex items-center gap-2 text-sm font-medium text-[#FACC15] group-hover:gap-3 transition-all">
          Read More
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </article>
  );
}
