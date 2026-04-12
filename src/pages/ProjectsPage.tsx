import { useEffect, useState } from 'react';
import { ExternalLink, FolderKanban, Beaker, Clock, CheckCircle2, Calendar, ArrowRight } from 'lucide-react';
import { projectService } from '@/services/project.service';
import { Project } from '@/services/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'ongoing' | 'completed'>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      const res = await projectService.getProjects();
      if (res.success && res.data) {
        setProjects(res.data);
      }
      setLoading(false);
    };

    fetchProjects();
  }, []);

  const filteredProjects = projects.filter((project) => {
    if (filter === 'all') return true;
    return project.status === filter;
  });

  const ongoingCount = projects.filter(p => p.status === 'ongoing').length;
  const completedCount = projects.filter(p => p.status === 'completed').length;

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="relative py-8 sm:py-10 md:py-16 overflow-hidden bg-gradient-to-br from-secondary/70 dark:from-secondary/25 via-secondary/45 dark:via-secondary/15 to-background">
        <div className="absolute top-10 sm:top-20 right-10 sm:right-20 w-48 sm:w-72 h-48 sm:h-72 bg-secondary/70 rounded-full blur-3xl" />
        
        <div className="container-wide relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-secondary/80 text-secondary-foreground text-xs sm:text-sm font-medium mb-4 sm:mb-6 animate-fade-in border border-secondary-foreground/20">
              <Beaker className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Innovation in Progress</span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#166534] dark:text-foreground mb-4 sm:mb-6 animate-fade-in-up" style={{ letterSpacing: '-0.02em' }}>
              Research Projects
            </h1>
            <p className="text-sm sm:text-lg md:text-xl text-muted-foreground animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              Explore our ongoing and completed research initiatives pushing the boundaries of chemistry.
            </p>
          </div>
        </div>
      </section>

      {/* Stats & Filter Section */}
      <section className="container-wide -mt-4 sm:-mt-10 relative z-10 mb-4 sm:mb-6">
        <div className="bg-card rounded-xl sm:rounded-xl shadow-lg border border-border p-4 sm:p-6 md:p-8">
          <div className="flex flex-col gap-4 sm:gap-6">
            {/* Stats */}
            <div className="flex items-center justify-center sm:justify-start gap-4 sm:gap-8">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-accent/15 text-accent">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <div className="font-heading text-xl sm:text-2xl font-bold text-accent">{ongoingCount}</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground">Ongoing</div>
                </div>
              </div>
              <div className="w-px h-10 sm:h-12 bg-border" />
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-accent/15 text-accent">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <div className="font-heading text-xl sm:text-2xl font-bold text-accent">{completedCount}</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground">Completed</div>
                </div>
              </div>
            </div>
            
            {/* Filter */}
            <div className="flex justify-center sm:justify-end">
              <div className="flex gap-1 sm:gap-2 bg-secondary p-1 sm:p-1.5 rounded-lg sm:rounded-xl">
                {(['all', 'ongoing', 'completed'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all ${
                      filter === status
                        ? 'bg-accent text-primary-foreground shadow-md'
                        : 'bg-card text-muted-foreground border border-border hover:bg-secondary'
                    }`}
                  >
                    {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="container-wide pb-8 sm:pb-10 md:pb-16 bg-secondary py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-8 animate-pulse">
                <div className="h-6 w-24 bg-accent/15 rounded-full mb-4" />
                <div className="h-7 w-3/4 bg-accent/15 rounded mb-4" />
                <div className="h-4 w-full bg-accent/15 rounded mb-2" />
                <div className="h-4 w-full bg-accent/15 rounded mb-2" />
                <div className="h-4 w-1/2 bg-accent/15 rounded" />
              </div>
            ))
          ) : filteredProjects.length === 0 ? (
            <div className="col-span-2 text-center py-10 bg-card border border-border rounded-3xl">
              <FolderKanban className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-heading text-xl text-foreground mb-2">No projects found</h3>
              <p className="text-muted-foreground">
                {filter !== 'all' ? `No ${filter} projects at the moment.` : 'Projects will appear here once added.'}
              </p>
            </div>
          ) : (
            filteredProjects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                delay={`${index * 0.1}s`}
                onClick={() => setSelectedProject(project)}
              />
            ))
          )}
        </div>
      </section>

      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="max-w-2xl bg-card border border-border max-h-[90vh] overflow-y-auto">
          {selectedProject && (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading text-2xl text-foreground">{selectedProject.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 text-accent" />
                  <span>
                    {new Date(selectedProject.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                    {selectedProject.endDate && ` - ${new Date(selectedProject.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}`}
                  </span>
                </div>
                <div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${selectedProject.status === 'ongoing' ? 'bg-accent/15 text-accent' : 'bg-secondary text-secondary-foreground'}`}>
                    {selectedProject.status === 'ongoing' ? <Clock className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    {selectedProject.status === 'ongoing' ? 'Ongoing' : 'Completed'}
                  </span>
                </div>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{selectedProject.description}</p>
                {selectedProject.researchLink && (
                  <a
                    href={selectedProject.researchLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-accent font-medium hover:text-accent/80 transition-colors"
                  >
                    Open Research Link
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProjectCard({ project, delay, onClick }: { project: Project; delay: string; onClick: () => void }) {
  const statusConfig = {
    ongoing: {
      bg: 'bg-accent/15',
      text: 'text-accent',
      icon: <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />,
      label: 'Ongoing'
    },
    completed: {
      bg: 'bg-secondary',
      text: 'text-secondary-foreground',
      icon: <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />,
      label: 'Completed'
    }
  };

  const status = statusConfig[project.status];

  return (
    <article
      onClick={onClick}
      className="group bg-card rounded-xl sm:rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:border-accent/30 transition-all duration-300 animate-fade-in-up cursor-pointer"
      style={{ animationDelay: delay }}
    >
      {/* Header with gradient */}
      <div className="relative h-24 sm:h-32 bg-gradient-to-br from-secondary/70 via-secondary/40 to-transparent p-4 sm:p-6">
        <div className="absolute top-4 sm:top-6 right-4 sm:right-6">
          <span className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold ${status.bg} ${status.text}`}>
            {status.icon}
            {status.label}
          </span>
        </div>
        <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6">
          <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-secondary border border-secondary-foreground/20">
            <FolderKanban className="w-4 h-4 sm:w-6 sm:h-6 text-accent" />
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4 sm:p-6 pt-3 sm:pt-4">
        <h3 className="font-heading text-base sm:text-xl font-semibold text-foreground group-hover:text-accent transition-colors mb-2 sm:mb-3 line-clamp-2">
          {project.title}
        </h3>

        <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6 line-clamp-3">
          {project.description}
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 pt-3 sm:pt-4 border-t border-border">
          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>
              {new Date(project.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
              {project.endDate && ` - ${new Date(project.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}`}
            </span>
          </div>
          
          {project.researchLink && (
            <a
              href={project.researchLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-accent hover:text-accent/80 font-medium transition-colors group/link"
            >
              Details
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 transition-transform group-hover/link:translate-x-0.5" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
