import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Newspaper, Calendar, User, ArrowRight } from 'lucide-react';
import { newsService } from '@/services/news.service';
import { News } from '@/services/types';
import { stripHtml } from '@/lib/htmlUtils';

export default function NewsPage() {
  const navigate = useNavigate();
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

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

  const createSlug = (title: string) => {
    if (!title) return '';
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  };

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 md:py-20 overflow-hidden bg-gradient-to-br from-secondary/70 dark:from-secondary/25 via-secondary/45 dark:via-secondary/15 to-background">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%230891B2" fill-opacity="0.35"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        </div>
        <div className="absolute top-10 sm:top-20 right-10 sm:right-20 w-48 sm:w-72 h-48 sm:h-72 bg-secondary/70 rounded-full blur-3xl" />
        <div className="absolute bottom-10 sm:bottom-20 left-10 sm:left-20 w-64 sm:w-96 h-64 sm:h-96 bg-secondary/60 rounded-full blur-3xl" />

        <div className="container-wide relative text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-secondary/80 text-secondary-foreground text-xs sm:text-sm font-medium mb-4 sm:mb-6 animate-fade-in border border-secondary-foreground/20">
            <Newspaper className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Latest Updates</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#166534] dark:text-foreground mb-4 sm:mb-6 animate-fade-in-up" style={{ letterSpacing: '-0.02em' }}>
            News & Updates
          </h1>
          <p className="text-sm sm:text-lg md:text-xl text-muted-foreground animate-fade-in-up leading-relaxed" style={{ animationDelay: '0.1s' }}>
            Stay informed about the latest happenings, achievements, and announcements from our research group.
          </p>
        </div>
      </section>

      {/* News Grid */}
      <section className="container-wide section-padding bg-background">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-xl overflow-hidden animate-pulse">
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
          <div className="text-center py-10 bg-secondary rounded-xl border border-border">
            <Newspaper className="w-16 h-16 mx-auto text-accent mb-4" />
            <h3 className="font-heading text-xl text-foreground mb-2">No news available</h3>
            <p className="text-muted-foreground">News and updates will appear here once published.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item, index) => {
              const firstImageUrl = item.imageUrl ? item.imageUrl.split(',')[0].trim() : '';
              const slug = createSlug(item.title) || item.id;
              return (
                <NewsCard
                  key={item.id}
                  news={{ ...item, imageUrl: firstImageUrl }}
                  delay={`${index * 0.05}s`}
                  onClick={() => navigate(`/news/${slug}`)}
                />
              );
            })}
          </div>
        )}
      </section>
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
      className="group bg-card border border-border rounded-xl overflow-hidden cursor-pointer hover:shadow-lg hover:border-accent/30 transition-all duration-300 animate-fade-in-up"
      style={{ animationDelay: delay }}
    >
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-secondary to-secondary/70 overflow-hidden">
        {news.imageUrl ? (
          <img
            src={news.imageUrl}
            alt={news.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Newspaper className="w-12 h-12 text-secondary-foreground/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Content */}
      <div className="p-5 sm:p-6">
        {/* Date & Author */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-accent" />
            {new Date(news.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </div>
          {news.author && (
            <div className="flex items-center gap-1">
              <User className="w-3 h-3 text-accent" />
              {news.author}
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="font-heading text-lg font-semibold text-foreground group-hover:text-accent transition-colors mb-2 line-clamp-2">
          {news.title}
        </h3>

        {/* Summary */}
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {stripHtml(news.summary || news.content)}
        </p>

        {/* Read More */}
        <div className="flex items-center gap-2 text-sm font-medium text-accent group-hover:text-accent/80 group-hover:gap-3 transition-all">
          Read More
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </article>
  );
}
