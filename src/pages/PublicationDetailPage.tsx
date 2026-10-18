import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { BookOpen, FileText, Quote, ExternalLink, ArrowLeft, Share2, GraduationCap } from 'lucide-react';
import { scholarService, ScholarPublication } from '@/services';

export default function PublicationDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [publication, setPublication] = useState<ScholarPublication | null>(null);
  const [loading, setLoading] = useState(true);

  const createSlug = (title: string) => {
    if (!title) return '';
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  };

  useEffect(() => {
    const fetchPublication = async () => {
      try {
        const res = await scholarService.getMainPublications();
        if (res.success && res.data && res.data.success && res.data.publications) {
          const found = res.data.publications.find(
            (item: ScholarPublication) =>
              item.scholarId === slug || createSlug(item.title) === slug
          );
          if (found) {
            setPublication(found);
          }
        }
      } catch (e) {
        console.error('Error fetching publication detail:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchPublication();
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

  if (!publication) {
    return (
      <div className="container-wide py-20 text-center">
        <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="font-heading text-2xl font-bold text-foreground mb-2">Publication Not Found</h2>
        <p className="text-muted-foreground mb-6">The publication you are looking for does not exist or has been removed.</p>
        <button
          onClick={() => navigate('/publications')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground font-medium rounded-lg hover:bg-accent/90 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Publications
        </button>
      </div>
    );
  }

  const citations = parseInt(publication.citedBy) || 0;

  return (
    <div className="bg-background min-h-screen py-10 sm:py-16">
      <div className="container-wide max-w-3xl">
        {/* Back Link */}
        <button
          onClick={() => navigate('/publications')}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-accent transition-colors mb-6 sm:mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Publications
        </button>

        {/* Publication Container */}
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-10 shadow-sm">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 rounded-2xl bg-secondary text-accent border border-secondary-foreground/20">
              <FileText className="w-8 h-8" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {publication.year && (
                  <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold">
                    {publication.year}
                  </span>
                )}
                {citations > 0 && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent/15 text-accent text-xs font-semibold">
                    <Quote className="w-3 h-3" />
                    {citations} citations
                  </span>
                )}
              </div>
            </div>
          </div>

          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-4 leading-tight">
            {publication.title}
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground mb-6">
            <span className="font-medium text-foreground">Authors:</span> {publication.authors?.join(', ') || 'Authors not available'}
          </p>

          <div className="p-4 rounded-xl bg-secondary/50 border border-border mb-8">
            <p className="text-sm font-medium text-foreground">
              <span className="text-muted-foreground">Journal / Source:</span> {publication.journal || 'Journal not specified'}
            </p>
          </div>

          {publication.articleUrl && (
            <div className="mb-8">
              <a
                href={publication.articleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground font-medium rounded-xl hover:bg-accent/90 transition-colors shadow-sm"
              >
                <span>View Full Publication on Google Scholar</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-border pt-6">
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 font-medium text-sm transition-colors"
            >
              <Share2 className="w-4 h-4" /> Share Publication
            </button>
            <Link
              to="/publications"
              className="inline-flex items-center gap-2 text-accent font-semibold hover:underline text-sm"
            >
              All Publications <ArrowLeft className="w-4 h-4 rotate-180" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
