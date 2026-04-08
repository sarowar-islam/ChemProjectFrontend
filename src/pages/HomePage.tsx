import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FlaskConical, BookOpen, Users, FolderKanban, ArrowRight, Bell, Info, Beaker, Atom, Microscope, TestTube, GraduationCap, Award, Target, Sparkles } from 'lucide-react';
import { adminService } from '@/services/admin.service';
import { noticeService } from '@/services/notice.service';
import { settingsService } from '@/services/settings.service';
import { Notice } from '@/services/types';

export default function HomePage() {
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalPublications: 0,
    totalMembers: 0,
    ongoingProjects: 0,
  });
  const [recentNotices, setRecentNotices] = useState<Notice[]>([]);
  const [aboutUs, setAboutUs] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [statsRes, noticesRes, settingsRes] = await Promise.all([
        adminService.getDashboardStats(),
        noticeService.getRecentNotices(3),
        settingsService.getSettings(),
      ]);

      if (statsRes.success && statsRes.data) setStats(statsRes.data);
      if (noticesRes.success && noticesRes.data) setRecentNotices(noticesRes.data);
      if (settingsRes.success && settingsRes.data) setAboutUs(settingsRes.data.aboutUs || '');
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div>
      {/* Hero Section with Light Gradient Background */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-secondary/70 dark:from-secondary/25 via-secondary/45 dark:via-secondary/15 to-background">
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-secondary/70 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/60 rounded-full blur-3xl" />
          <Atom className="absolute top-32 right-20 w-16 h-16 text-secondary-foreground/45 animate-spin" style={{ animationDuration: '20s' }} />
          <Beaker className="absolute bottom-32 left-20 w-12 h-12 text-secondary-foreground/45" />
        </div>

        <div className="container-wide relative z-10 py-6 sm:py-8 md:py-12">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-secondary/80 text-secondary-foreground text-xs sm:text-sm font-medium mb-6 sm:mb-4 animate-fade-in border border-secondary-foreground/20">
              <FlaskConical className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Pioneering Chemistry Research</span>
            </div>
            
            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[#166534] dark:text-foreground mb-4 sm:mb-6 animate-fade-in-up leading-[1.1]" style={{ animationDelay: '0.1s', letterSpacing: '-0.02em' }}>
              Bio-Chemical and Environmental<br />
              <span className="text-accent">Research Lab</span>
            </h1>
            
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="w-10 sm:w-16 h-1 bg-accent rounded-full" />
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-foreground font-medium">Department of Chemistry, CUET</p>
            </div>
            
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-4 md:mb-5 max-w-2xl animate-fade-in-up leading-relaxed" style={{ animationDelay: '0.3s' }}>
              Chittagong University of Engineering & Technology — Advancing the frontiers of sustainable chemistry through innovative research and collaboration.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <Link to="/projects" className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground font-medium rounded-lg shadow-lg shadow-accent/25 text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 transition-colors group">
                Explore Research <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/team" className="inline-flex items-center justify-center gap-2 border-2 border-accent text-accent hover:bg-accent/10 font-medium rounded-lg text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 transition-colors">
                <Users className="w-4 h-4 sm:w-5 sm:h-5" /> Meet Our Team
              </Link>
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
              <StatCard icon={<FolderKanban className="w-6 h-6" />} number={stats.totalProjects} label="Research Projects" delay="0s" color="bg-secondary text-secondary-foreground" />
              <StatCard icon={<BookOpen className="w-6 h-6" />} number={stats.totalPublications} label="Publications" delay="0.1s" color="bg-secondary text-secondary-foreground" />
              <StatCard icon={<Users className="w-6 h-6" />} number={stats.totalMembers} label="Team Members" delay="0.2s" color="bg-secondary text-secondary-foreground" />
              <StatCard icon={<FlaskConical className="w-6 h-6" />} number={stats.ongoingProjects} label="Ongoing Projects" delay="0.3s" color="bg-secondary text-secondary-foreground" />
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
                  src="https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=800&q=80" 
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
                <p className="text-muted-foreground text-lg leading-relaxed mb-4">{aboutUs}</p>
              ) : (
                <p className="text-muted-foreground text-lg leading-relaxed mb-4">
                  Welcome to Yunus Ahmed Lab at CUET. Our research group is dedicated to advancing the frontiers of chemistry through innovative approaches in environmental remediation, resource recovery, nanomaterials, and cutting-edge wastewater treatment technologies for sustainable development.
                </p>
              )}
              
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border">
                  <div className="p-2 rounded-lg bg-secondary text-secondary-foreground">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Our Mission</h4>
                    <p className="text-sm text-muted-foreground">Sustainable solutions for environmental challenges</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border">
                  <div className="p-2 rounded-lg bg-secondary text-secondary-foreground">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Our Vision</h4>
                    <p className="text-sm text-muted-foreground">Clean water and environment for all</p>
                  </div>
                </div>
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
              { icon: <FlaskConical className="w-8 h-8" />, title: 'Environmental Remediation', desc: 'Developing solutions for pollution control and environmental cleanup' },
              { icon: <Atom className="w-8 h-8" />, title: 'Nanomaterials', desc: 'Engineering nanoscale materials for water treatment and sensing' },
              { icon: <TestTube className="w-8 h-8" />, title: 'Wastewater Treatment', desc: 'Cutting-edge technologies for industrial effluent treatment' },
              { icon: <Beaker className="w-8 h-8" />, title: 'Resource Recovery', desc: 'Extracting valuable materials from waste streams and e-waste' },
              { icon: <Microscope className="w-8 h-8" />, title: 'Adsorption Studies', desc: 'Novel adsorbents for heavy metal and pollutant removal' },
              { icon: <GraduationCap className="w-8 h-8" />, title: 'Green Chemistry', desc: 'Eco-friendly synthesis and sustainable chemical processes' },
            ].map((area, index) => (
              <div 
                key={area.title} 
                className="group p-8 rounded-xl bg-card border border-border hover:border-accent/30 transition-all duration-300 animate-fade-in-up shadow-sm"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="p-3 rounded-xl bg-accent/15 text-accent w-fit mb-4 group-hover:scale-110 transition-transform">
                  {area.icon}
                </div>
                <h3 className="font-heading text-xl text-foreground mb-2" style={{ letterSpacing: '-0.02em' }}>{area.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{area.desc}</p>
              </div>
            ))}
          </div>
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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-6 animate-pulse">
                <div className="h-5 w-3/4 bg-secondary rounded mb-3" />
                <div className="h-4 w-full bg-secondary rounded mb-2" />
                <div className="h-4 w-2/3 bg-secondary rounded" />
              </div>
            ))
          ) : recentNotices.length === 0 ? (
            <div className="col-span-3 text-center py-6 bg-secondary rounded-xl border border-border">
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
                  <a href="https://mail.google.com/mail/?view=cm&to=yunus@cuet.ac.bd" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 border-2 border-white text-primary-foreground hover:bg-card/10 font-medium rounded-lg text-sm sm:text-base px-5 sm:px-6 py-2.5 sm:py-3 transition-colors">
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

function StatCard({ icon, number, label, delay, color }: { icon: React.ReactNode; number: number; label: string; delay: string; color: string }) {
  return (
    <div className="bg-card rounded-xl sm:rounded-xl p-4 sm:p-6 shadow-sm border border-border hover:shadow-md hover:border-accent/30 transition-all duration-300 animate-fade-in-up group" style={{ animationDelay: delay }}>
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${color} text-accent group-hover:scale-110 transition-transform`}>{icon}</div>
        <div className="w-8 sm:w-12 h-1 bg-accent/30 rounded-full mt-2 sm:mt-3 hidden sm:block" />
      </div>
      <div className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-accent mb-0.5 sm:mb-1">{number}</div>
      <div className="text-xs sm:text-sm text-muted-foreground font-medium">{label}</div>
    </div>
  );
}

function NoticeCard({ notice, delay }: { notice: Notice; delay: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 hover:border-accent/30 transition-all duration-300 animate-fade-in-up group shadow-sm" style={{ animationDelay: delay }}>
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
    </div>
  );
}
