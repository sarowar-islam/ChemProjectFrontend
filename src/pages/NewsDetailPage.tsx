import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Newspaper, Calendar, User, ArrowLeft, Share2, ChevronLeft, ChevronRight } from 'lucide-react';
import { newsService } from '@/services/news.service';
import { News } from '@/services/types';
import { linkifyHtml } from '@/lib/htmlUtils';

export default function NewsDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [newsItem, setNewsItem] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const createSlug = (title: string) => {
    if (!title) return '';
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  };

  useEffect(() => {
    const fetchNewsItem = async () => {
      const res = await newsService.getNews();
      if (res.success && res.data) {
        const found = res.data.find(
          (item: News) => item.id === slug || createSlug(item.title) === slug
        );
        if (found) {
          setNewsItem(found);
        }
      }
      setLoading(false);
    };
    fetchNewsItem();
  }, [slug]);

  const defaultImages = [
    '/photos/frontpage-image.jpg',
    '/Images/hero-image/profle.png',
    '/Images/hero-image/sarowar professional.png'
  ];

  const images = newsItem?.imageUrl
    ? newsItem.imageUrl.split(',').filter(Boolean)
    : defaultImages;

  // Auto slideshow every 3 seconds if multiple images exist
  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [images.length]);

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  if (loading) {
    return (
      <div className="container-wide py-16 text-center">
        <div className="animate-pulse space-y-4 max-w-2xl mx-auto">
          <div className="h-8 bg-secondary rounded w-3/4 mx-auto" />
          <div className="h-4 bg-secondary rounded w-1/2 mx-auto" />
          <div className="h-64 bg-secondary rounded w-full mt-6" />
        </div>
      </div>
    );
  }

  if (!newsItem) {
    return (
      <div className="container-wide py-20 text-center">
        <Newspaper className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="font-heading text-2xl font-bold text-foreground mb-2">News Article Not Found</h2>
        <p className="text-muted-foreground mb-6">The news article you are looking for does not exist or has been removed.</p>
        <button
          onClick={() => navigate('/news')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground font-medium rounded-lg hover:bg-accent/90 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to News
        </button>
      </div>
    );
  }

  const currentDisplayImage = images[currentImageIndex] || images[0];

  return (
    <div className="bg-background min-h-screen py-10 sm:py-16">
      <div className="container-wide max-w-4xl">
        {/* Back Link */}
        <button
          onClick={() => navigate('/news')}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-accent transition-colors mb-6 sm:mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to News & Updates
        </button>

        {/* Article Header */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-accent" />
              {new Date(newsItem.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
            {newsItem.author && (
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-accent" />
                {newsItem.author}
              </div>
            )}
          </div>

          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight">
            {newsItem.title}
          </h1>
        </div>

        {/* Featured Image Slideshow */}
        {images.length > 0 && (
          <div className="relative rounded-2xl overflow-hidden shadow-elevated border border-border mb-8 bg-card group">
            <div className="relative aspect-video w-full">
              <img
                key={currentDisplayImage}
                src={currentDisplayImage}
                alt={newsItem.title}
                className="w-full h-full object-cover transition-opacity duration-500 animate-fade-in"
              />
            </div>

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/75 transition-colors opacity-80 group-hover:opacity-100 shadow-md"
                  title="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/75 transition-colors opacity-80 group-hover:opacity-100 shadow-md"
                  title="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* Counter Badge / Dots */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 text-white text-xs font-medium backdrop-blur-sm">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>
        )}

        {/* Article Content */}
        <div
          className="prose prose-lg max-w-none text-foreground leading-relaxed space-y-6 bg-card p-6 sm:p-10 rounded-2xl border border-border shadow-sm [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_a]:text-accent [&_a]:underline hover:[&_a]:text-accent/80"
          dangerouslySetInnerHTML={{ __html: linkifyHtml(newsItem.content) }}
        />

        {/* Share / Footer actions */}
        <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert('Link copied to clipboard!');
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 font-medium text-sm transition-colors"
          >
            <Share2 className="w-4 h-4" /> Share Article
          </button>
          <Link
            to="/news"
            className="inline-flex items-center gap-2 text-accent font-semibold hover:underline"
          >
            View More News <ArrowLeft className="w-4 h-4 rotate-180" />
          </Link>
        </div>
      </div>
    </div>
  );
}
