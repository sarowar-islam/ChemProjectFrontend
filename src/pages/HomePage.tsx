import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FlaskConical, BookOpen, Users, FolderKanban, ArrowRight, Bell, Info, Beaker, Atom, Microscope, TestTube, GraduationCap, Award, Target, Sparkles, Calendar, Newspaper } from 'lucide-react';
import { adminService } from '@/services/admin.service';
import { noticeService } from '@/services/notice.service';
import { newsService } from '@/services/news.service';
import { settingsService } from '@/services/settings.service';
import { Notice, News } from '@/services/types';
import HeroTitle from '@/components/HeroTitle';
import { linkifyHtml } from '@/lib/htmlUtils';

export default function HomePage() {
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalPublications: 0,
    totalMembers: 0,
    ongoingProjects: 0,
  });
  const [recentNews, setRecentNews] = useState<News[]>([]);
  const [recentNotices, setRecentNotices] = useState<Notice[]>([]);
  const [aboutUs, setAboutUs] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Featured hero images changing every 3 seconds from public folder
  const heroImages = [
    '/Images/hero-image/1.jpg',
    '/Images/hero-image/2.jpg',
    '/Images/hero-image/3.jpg'
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  useEffect(() => {
    const fetchData = async () => {
      const [statsRes, newsRes, noticesRes, settingsRes] = await Promise.all([
        adminService.getDashboardStats(),
        newsService.getNews(),
        noticeService.getRecentNotices(3),
        settingsService.getSettings(),
      ]);

      if (statsRes.success && statsRes.data) setStats(statsRes.data);
      if (newsRes.success && newsRes.data) {
        const sorted = [...newsRes.data].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setRecentNews(sorted.slice(0, 4));
      }
      if (noticesRes.success && noticesRes.data) setRecentNotices(noticesRes.data);
      if (settingsRes.success && settingsRes.data) setAboutUs(settingsRes.data.aboutUs || '');
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div>
      {/* Hero Section with Split Layout & Featured Images Slideshow */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-secondary/70 dark:from-secondary/25 via-secondary/45 dark:via-secondary/15 to-background">
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-secondary/70 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/60 rounded-full blur-3xl" />
          <Atom className="absolute top-32 right-20 w-16 h-16 text-secondary-foreground/45 animate-spin" style={{ animationDuration: '20s' }} />
          <Beaker className="absolute bottom-32 left-20 w-12 h-12 text-secondary-foreground/45" />
        </div>

        <div className="container-wide relative z-10 py-10 sm:py-12 md:py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column: Research Name and Action Buttons */}
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-secondary/80 text-secondary-foreground text-xs sm:text-sm font-medium mb-6 sm:mb-4 animate-fade-in border border-secondary-foreground/20">
                <FlaskConical className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Pioneering Chemistry Research</span>
              </div>

              <HeroTitle />

              <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="w-10 sm:w-16 h-1 bg-accent rounded-full" />
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-foreground font-medium">Department of Chemistry, CUET</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <Link to="/projects" className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground font-medium rounded-lg shadow-lg shadow-accent/25 text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 transition-colors group">
                  Explore Research <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link to="/team" className="inline-flex items-center justify-center gap-2 border-2 border-accent text-accent hover:bg-accent/10 font-medium rounded-lg text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 transition-colors">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" /> Meet Our Team
                </Link>
              </div>
            </div>

            {/* Right Column: Featured Images Slideshow (Changing every 3 seconds) */}
            <div className="relative animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-elevated border-2 border-border bg-card h-[320px] sm:h-[400px] lg:h-[450px]">
                {heroImages.map((img, idx) => (
                  <img
                    key={img}
                    src={img}
                    alt={`Hero Featured ${idx + 1}`}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${idx === currentImageIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
                  />
                ))}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent pointer-events-none" />

                {/* Slideshow Indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
                  {heroImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`h-2.5 rounded-full transition-all ${idx === currentImageIndex ? 'w-8 bg-accent' : 'w-2.5 bg-background/60 hover:bg-background'}`}
                      aria-label={`Slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-40 h-40 bg-accent/20 rounded-2xl -z-10 blur-xl" />
              <div className="absolute -top-4 -left-4 w-40 h-40 bg-primary/10 rounded-2xl -z-10 blur-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Floating Cards */}
      <section className="container-wide mt-4 sm:mt-6 relative z-20 pb-6 sm:pb-8 md:pb-10">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="stat-card animate-pulse bg-card shadow-elevated border border-border rounded-xl">
                <div className="h-10 w-20 bg-secondary rounded mb-2" />
                <div className="h-4 w-24 bg-secondary rounded" />
              </div>
            ))
          ) : (
            <>
              <StatCard icon={<FolderKanban className="w-6 h-6" />} number={stats.totalProjects} label="Research Projects" delay="0s" color="bg-secondary text-secondary-foreground" to="/projects" />
              <StatCard icon={<BookOpen className="w-6 h-6" />} number={stats.totalPublications} label="Publications" delay="0.1s" color="bg-secondary text-secondary-foreground" to="/publications" />
              <StatCard icon={<Users className="w-6 h-6" />} number={stats.totalMembers} label="Team Members" delay="0.2s" color="bg-secondary text-secondary-foreground" to="/team" />
              <StatCard icon={<FlaskConical className="w-6 h-6" />} number={stats.ongoingProjects} label="Ongoing Projects" delay="0.3s" color="bg-secondary text-secondary-foreground" to="/projects" />
            </>
          )}
        </div>
      </section>

      {/* About Us Section - Enhanced */}
      <section className="py-12 md:py-16 relative overflow-hidden bg-background">
        <div className="absolute inset-0 bg-gradient-to-br from-background/50 via-background to-background/30" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/65 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/50 rounded-full blur-3xl" />

        <div className="container-wide relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Image Side */}
            <div className="relative animate-fade-in-up">
              <div className="relative z-10 rounded-xl sm:rounded-2xl overflow-hidden shadow-elevated">
                <img
                  src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80"
                  alt="Research Laboratory"
                  className="w-full h-[300px] sm:h-[400px] lg:h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
                <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6">
                  <div className="flex items-center gap-3 sm:gap-4 text-primary-foreground">
                    <div className="p-2 sm:p-3 bg-card/20 backdrop-blur-sm rounded-lg sm:rounded-xl">
                      <Award className="w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                    <div>
                      <p className="font-heading text-xl sm:text-2xl font-bold">15+ Years</p>
                      <p className="text-primary-foreground/80 text-xs sm:text-sm">Research Excellence</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 sm:-bottom-6 -right-4 sm:-right-6 w-32 sm:w-48 h-32 sm:h-48 bg-accent/20 rounded-xl sm:rounded-2xl -z-10" />
              <div className="absolute -top-4 sm:-top-6 -left-4 sm:-left-6 w-20 sm:w-32 h-20 sm:h-32 bg-primary/10 rounded-xl sm:rounded-2xl -z-10" />
            </div>

            {/* Content Side */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-secondary/80 text-secondary-foreground text-xs sm:text-sm font-medium mb-4 sm:mb-6 border border-secondary-foreground/20">
                <Info className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>About Our Research Group</span>
              </div>

              <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-[#166534] dark:text-foreground mb-4 sm:mb-6 leading-tight" style={{ letterSpacing: '-0.02em' }}>
                Pushing the Boundaries of <span className="text-accent">Chemical Science</span>
              </h2>

              {aboutUs ? (
                <div
                  className="prose dark:prose-invert max-w-none text-muted-foreground text-base sm:text-lg leading-relaxed mb-6 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 [&_a]:text-accent [&_a]:underline hover:[&_a]:text-accent/80 [&_strong]:text-foreground [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground"
                  dangerouslySetInnerHTML={{ __html: linkifyHtml(aboutUs) }}
                />
              ) : (
                <p className="text-muted-foreground text-lg leading-relaxed mb-4">
                  Welcome to Yunus Ahmed Lab at CUET. Our research group is dedicated to advancing the frontiers of chemistry through innovative approaches in environmental remediation, resource recovery, nanomaterials, and cutting-edge wastewater treatment technologies for sustainable development.
                </p>
              )}

              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <Link to="/projects" className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border hover:border-accent/30 hover:shadow-sm transition-all duration-300">
                  <div className="p-2 rounded-lg bg-secondary text-secondary-foreground">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Our Mission</h4>
                    <p className="text-sm text-muted-foreground">Sustainable solutions for environmental challenges</p>
                  </div>
                </Link>
                <Link to="/publications" className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border hover:border-accent/30 hover:shadow-sm transition-all duration-300">
                  <div className="p-2 rounded-lg bg-secondary text-secondary-foreground">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Our Vision</h4>
                    <p className="text-sm text-muted-foreground">Clean water and environment for all</p>
                  </div>
                </Link>
              </div>

              <Link to="/publications" className="inline-flex items-center gap-2 text-accent font-semibold hover:text-accent/80 transition-all group">
                View Our Publications <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Research Focus - Enhanced */}
      <section className="py-12 md:py-16 bg-secondary relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%230891B2" fill-opacity="0.35"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        </div>

        <div className="container-wide relative">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/85 text-secondary-foreground text-sm font-medium mb-6 border border-secondary-foreground/20">
              <Microscope className="w-4 h-4" />
              <span>What We Do</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl text-[#166534] dark:text-foreground mb-4" style={{ letterSpacing: '-0.02em' }}>Our Research Focus</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Exploring innovative solutions across multiple domains of chemistry to address global challenges.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              { icon: <FlaskConical className="w-8 h-8" />, title: 'Environmental Remediation', desc: 'Developing solutions for pollution control and environmental cleanup', to: '/projects' },
              { icon: <Atom className="w-8 h-8" />, title: 'Nanomaterials', desc: 'Engineering nanoscale materials for water treatment and sensing', to: '/projects' },
              { icon: <TestTube className="w-8 h-8" />, title: 'Wastewater Treatment', desc: 'Cutting-edge technologies for industrial effluent treatment', to: '/projects' },
              { icon: <Beaker className="w-8 h-8" />, title: 'Resource Recovery', desc: 'Extracting valuable materials from waste streams and e-waste', to: '/projects' },
              { icon: <Microscope className="w-8 h-8" />, title: 'Adsorption Studies', desc: 'Novel adsorbents for heavy metal and pollutant removal', to: '/projects' },
              { icon: <GraduationCap className="w-8 h-8" />, title: 'Green Chemistry', desc: 'Eco-friendly synthesis and sustainable chemical processes', to: '/projects' },
            ].map((area, index) => (
              <Link
                to={area.to}
                key={area.title}
                className="group p-8 rounded-xl bg-card border border-border hover:border-accent/30 transition-all duration-300 animate-fade-in-up shadow-sm"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="p-3 rounded-xl bg-accent/15 text-accent w-fit mb-4 group-hover:scale-110 transition-transform">
                  {area.icon}
                </div>
                <h3 className="font-heading text-xl text-foreground mb-2" style={{ letterSpacing: '-0.02em' }}>{area.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{area.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent News Section (4 in a row) */}
      <section className="container-wide py-12 md:py-16 bg-background">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/15 text-accent text-sm font-medium mb-4">
              <Newspaper className="w-4 h-4" />
              <span>Latest Updates</span>
            </div>
            <h2 className="font-heading text-3xl md:text-4xl text-[#166534] dark:text-foreground" style={{ letterSpacing: '-0.02em' }}>Recent News</h2>
          </div>
          <Link to="/news" className="hidden sm:inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-card text-foreground font-medium hover:bg-secondary transition-colors border border-border">
            View All News <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-xl overflow-hidden animate-pulse">
                <div className="h-44 bg-secondary" />
                <div className="p-5">
                  <div className="h-4 w-1/3 bg-secondary rounded mb-3" />
                  <div className="h-5 w-full bg-secondary rounded mb-2" />
                  <div className="h-4 w-2/3 bg-secondary rounded" />
                </div>
              </div>
            ))
          ) : recentNews.length === 0 ? (
            <div className="col-span-4 text-center py-10 bg-secondary/50 rounded-xl border border-border">
              <Newspaper className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No news articles published yet.</p>
            </div>
          ) : (
            recentNews.map((item, index) => (
              <NewsCard key={item.id} newsItem={item} delay={`${index * 0.05}s`} />
            ))
          )}
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Link to="/news" className="inline-flex items-center gap-2 text-accent font-medium hover:text-accent/80 transition-all">
            View All News <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Recent Notices - Enhanced */}
      <section className="container-wide py-12 md:py-16 bg-background">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/15 text-accent text-sm font-medium mb-4">
              <Bell className="w-4 h-4" />
              <span>Stay Updated</span>
            </div>
            <h2 className="font-heading text-3xl md:text-4xl text-[#166534] dark:text-foreground" style={{ letterSpacing: '-0.02em' }}>Recent Notices</h2>
          </div>
          <Link to="/notices" className="hidden sm:inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-card text-foreground font-medium hover:bg-secondary transition-colors border border-border">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-6 animate-pulse">
                <div className="h-5 w-3/4 bg-secondary rounded mb-3" />
                <div className="h-4 w-full bg-secondary rounded mb-2" />
                <div className="h-4 w-2/3 bg-secondary rounded" />
              </div>
            ))
          ) : recentNotices.length === 0 ? (
            <div className="text-center py-6 bg-secondary rounded-xl border border-border">
              <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No notices yet. Check back soon!</p>
            </div>
          ) : (
            recentNotices.map((notice, index) => (
              <NoticeCard key={notice.id} notice={notice} delay={`${index * 0.1}s`} />
            ))
          )}
        </div>

        <div className="mt-4 text-center sm:hidden">
          <Link to="/notices" className="inline-flex items-center gap-2 text-accent font-medium hover:text-accent/80 transition-all">
            View All Notices <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container-wide pb-8 sm:pb-10 md:pb-16">
        <div className="relative rounded-xl sm:rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-primary" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-primary" />
          <div className="relative flex items-center py-8 sm:py-10">
            <div className="container-wide">
              <div className="max-w-xl px-2">
                <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl text-primary-foreground mb-3 sm:mb-4" style={{ letterSpacing: '-0.02em' }}>
                  Interested in Joining Our Research?
                </h2>
                <p className="text-primary-foreground/80 text-sm sm:text-base mb-6 sm:mb-4 leading-relaxed">
                  We're always looking for passionate researchers and students to join our team. Explore opportunities to contribute to groundbreaking chemistry research.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Link to="/teamlogin" className="inline-flex items-center justify-center gap-2 bg-background hover:bg-secondary text-foreground font-medium rounded-lg text-sm sm:text-base px-5 sm:px-6 py-2.5 sm:py-3 transition-colors">
                    Team Portal <ArrowRight className="w-4 h-4" />
                  </Link>
                  <a href="https://mail.google.com/mail/?view=cm&to=yunusahmed@cuet.ac.bd" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 border-2 border-white text-primary-foreground hover:bg-card/10 font-medium rounded-lg text-sm sm:text-base px-5 sm:px-6 py-2.5 sm:py-3 transition-colors">
                    Contact Us
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon, number, label, delay, color, to }: { icon: React.ReactNode; number: number; label: string; delay: string; color: string; to: string }) {
  return (
    <Link to={to} className="bg-card rounded-xl sm:rounded-xl p-4 sm:p-6 shadow-sm border border-border hover:shadow-md hover:border-accent/30 transition-all duration-300 animate-fade-in-up group block" style={{ animationDelay: delay }}>
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${color} text-accent group-hover:scale-110 transition-transform`}>{icon}</div>
        <div className="w-8 sm:w-12 h-1 bg-accent/30 rounded-full mt-2 sm:mt-3 hidden sm:block" />
      </div>
      <div className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-accent mb-0.5 sm:mb-1">{number}</div>
      <div className="text-xs sm:text-sm text-muted-foreground font-medium">{label}</div>
    </Link>
  );
}

function NewsCard({ newsItem, delay }: { newsItem: News; delay: string }) {
  const firstImageUrl = newsItem.imageUrl ? newsItem.imageUrl.split(',')[0].trim() : '';
  const createSlug = (title: string) => {
    if (!title) return '';
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  };
  const slug = createSlug(newsItem.title) || newsItem.id;

  return (
    <Link to={`/news/${slug}`} className="bg-card border border-border rounded-xl overflow-hidden hover:border-accent/30 transition-all duration-300 animate-fade-in-up group shadow-sm flex flex-col" style={{ animationDelay: delay }}>
      <div className="h-44 w-full overflow-hidden bg-secondary relative">
        {firstImageUrl ? (
          <img src={firstImageUrl} alt={newsItem.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Newspaper className="w-10 h-10 text-muted-foreground/40" />
          </div>
        )}
      </div>
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <Calendar className="w-3.5 h-3.5 text-accent" />
            {new Date(newsItem.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
          </div>
          <h3 className="font-heading font-semibold text-foreground text-base line-clamp-2 group-hover:text-accent transition-colors mb-2">{newsItem.title}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2" dangerouslySetInnerHTML={{ __html: newsItem.summary || newsItem.content }} />
        </div>
        <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-accent">
          Read Article <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </Link>
  );
}

function NoticeCard({ notice, delay }: { notice: Notice; delay: string }) {
  const createSlug = (title: string) => {
    if (!title) return '';
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  };
  const slug = createSlug(notice.title) || notice.id;

  return (
    <Link to={`/notices/${slug}`} className="bg-card border border-border rounded-xl p-6 hover:border-accent/30 transition-all duration-300 animate-fade-in-up group shadow-sm block" style={{ animationDelay: delay }}>
      <div className="flex items-start gap-4 mb-4">
        <div className={`p-3 rounded-xl ${notice.priority === 'important' ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-300' : 'bg-accent/15 text-accent'} group-hover:scale-110 transition-transform`}>
          <Bell className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-heading text-lg font-semibold text-foreground truncate group-hover:text-accent transition-colors">{notice.title}</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {new Date(notice.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{notice.content}</p>
    </Link>
  );
}
