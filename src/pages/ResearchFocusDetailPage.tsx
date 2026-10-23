import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Compass, Layers, CheckCircle2 } from 'lucide-react';
import { researchFocusService } from '@/services/researchFocus.service';
import { ResearchFocus } from '@/services/types';
import { linkifyHtml } from '@/lib/htmlUtils';

export default function ResearchFocusDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [focusItem, setFocusItem] = useState<ResearchFocus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFocus = async () => {
      if (!id) return;
      try {
        const res = await researchFocusService.getById(id);
        if (res.success && res.data) {
          setFocusItem(res.data);
        } else {
          // If not found by direct ID (or if slug was passed), try matching from all items
          const allRes = await researchFocusService.getAll();
          if (allRes.success && allRes.data) {
            const found = allRes.data.find(
              (item) => item.id === id || item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') === id
            );
            if (found) {
              setFocusItem(found);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load research focus:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFocus();
  }, [id]);

  if (loading) {
    return (
      <div className="bg-background min-h-screen py-16">
        <div className="container-wide max-w-4xl animate-pulse space-y-6">
          <div className="h-6 w-32 bg-secondary rounded" />
          <div className="h-10 w-3/4 bg-secondary rounded" />
          <div className="h-5 w-1/2 bg-secondary rounded" />
          <div className="h-64 bg-secondary rounded-xl mt-8" />
        </div>
      </div>
    );
  }

  if (!focusItem) {
    return (
      <div className="bg-background min-h-screen py-20">
        <div className="container-wide max-w-2xl text-center">
          <Compass className="w-16 h-16 mx-auto text-muted-foreground/60 mb-4" />
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-3">
            Research Focus Area Not Found
          </h2>
          <p className="text-muted-foreground mb-6">
            The research area you are looking for does not exist or has been removed.
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground font-medium rounded-lg hover:bg-accent/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen py-10 sm:py-16">
      <div className="container-wide max-w-4xl">
        {/* Back Link */}
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-accent transition-colors mb-6 sm:mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>

        {/* Header */}
        <div className="space-y-4 mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/15 text-accent text-xs sm:text-sm font-semibold border border-accent/20">
            <Layers className="w-3.5 h-3.5" />
            <span>Research Focus Domain</span>
          </div>

          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight">
            {focusItem.title}
          </h1>

          {focusItem.shortDescription && (
            <p className="text-lg sm:text-xl text-muted-foreground font-normal leading-relaxed border-l-4 border-accent pl-4 py-1 text-justify">
              {focusItem.shortDescription}
            </p>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-accent" />
              <span>Active Research Field • CUET Chemistry</span>
            </div>

            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: focusItem.title,
                    text: focusItem.shortDescription,
                    url: window.location.href,
                  }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard!');
                }
              }}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-muted-foreground hover:text-accent transition-colors px-3 py-1.5 rounded-lg border border-border hover:bg-secondary/50"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Main Details Section */}
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-10 shadow-sm">
          {focusItem.details ? (
            <div
              className="prose dark:prose-invert max-w-none text-foreground/90 leading-relaxed [&_p]:mb-4 [&_p]:text-base [&_p]:leading-7 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-4 [&_li]:my-1.5 [&_li]:text-foreground/90 [&_a]:text-accent [&_a]:underline hover:[&_a]:text-accent/80 [&_strong]:text-foreground [&_h1]:text-foreground [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-3 [&_h2]:text-foreground [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-foreground [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-5 [&_h3]:mb-2"
              dangerouslySetInnerHTML={{ __html: linkifyHtml(focusItem.details) }}
            />
          ) : (
            <div className="py-8 text-center text-muted-foreground italic">
              Detailed descriptions for this research focus are currently being compiled.
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-secondary/50 border border-border">
          <div>
            <h3 className="font-heading text-lg font-bold text-foreground">Interested in Collaborating?</h3>
            <p className="text-sm text-muted-foreground">Get in touch with our research members or explore active projects.</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={() => navigate('/projects')}
              className="flex-1 sm:flex-initial px-5 py-2.5 bg-accent text-accent-foreground font-medium rounded-lg text-sm hover:bg-accent/90 transition-colors shadow-sm text-center"
            >
              View Projects
            </button>
            <button
              onClick={() => navigate('/team')}
              className="flex-1 sm:flex-initial px-5 py-2.5 bg-card border border-border text-foreground font-medium rounded-lg text-sm hover:bg-secondary transition-colors text-center"
            >
              Meet The Team
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
