import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FolderKanban, Calendar, Clock, CheckCircle2, ExternalLink, ArrowLeft, Share2 } from 'lucide-react';
import { projectService } from '@/services/project.service';
import { Project } from '@/services/types';
import { linkifyHtml } from '@/lib/htmlUtils';

export default function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const createSlug = (title: string) => {
    if (!title) return '';
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  };

  useEffect(() => {
    const fetchProject = async () => {
      const res = await projectService.getProjects();
      if (res.success && res.data) {
        const found = res.data.find(
          (item: Project) => item.id === slug || createSlug(item.title) === slug
        );
        if (found) {
          setProject(found);
        }
      }
      setLoading(false);
    };
    fetchProject();
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

  if (!project) {
    return (
      <div className="container-wide py-20 text-center">
        <FolderKanban className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="font-heading text-2xl font-bold text-foreground mb-2">Project Not Found</h2>
        <p className="text-muted-foreground mb-6">The project you are looking for does not exist or has been removed.</p>
        <button
          onClick={() => navigate('/projects')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground font-medium rounded-lg hover:bg-accent/90 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Projects
        </button>
      </div>
    );
  }

  const isOngoing = project.status === 'ongoing';

  return (
    <div className="bg-background min-h-screen py-10 sm:py-16">
      <div className="container-wide max-w-3xl">
        {/* Back Link */}
        <button
          onClick={() => navigate('/projects')}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-accent transition-colors mb-6 sm:mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Research Projects
        </button>

        {/* Project Container */}
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-10 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="p-3 rounded-2xl bg-secondary text-accent border border-secondary-foreground/20">
              <FolderKanban className="w-8 h-8" />
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold ${isOngoing ? 'bg-accent/15 text-accent' : 'bg-secondary text-secondary-foreground'}`}>
              {isOngoing ? <Clock className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
              {isOngoing ? 'Ongoing Project' : 'Completed Project'}
            </span>
          </div>

          <h1 className="font-heading text-2xl sm:text-4xl font-bold text-foreground mb-4">
            {project.title}
          </h1>

          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 pb-6 border-b border-border">
            <Calendar className="w-4 h-4 text-accent" />
            <span>
              {new Date(project.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
              {project.endDate && ` — ${new Date(project.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}`}
            </span>
          </div>

          <div
            className="prose prose-lg max-w-none text-foreground leading-relaxed mb-8 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_a]:text-accent [&_a]:underline hover:[&_a]:text-accent/80"
            dangerouslySetInnerHTML={{ __html: linkifyHtml(project.description) }}
          />

          {project.researchLink && (
            <div className="mb-8 p-4 rounded-xl bg-secondary/50 border border-border">
              <a
                href={project.researchLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-accent font-medium hover:underline text-base"
              >
                <span>Visit External Project / Research Link</span>
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
              <Share2 className="w-4 h-4" /> Share Project
            </button>
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 text-accent font-semibold hover:underline text-sm"
            >
              All Projects <ArrowLeft className="w-4 h-4 rotate-180" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
