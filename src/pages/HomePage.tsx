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
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-[#F0F9FF] via-[#DBEAFE] to-[#F8FAFC]">
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-[#3B82F6]/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#1E40AF]/5 rounded-full blur-3xl" />
          <Atom className="absolute top-32 right-20 w-16 h-16 text-[#3B82F6]/20 animate-spin" style={{ animationDuration: '20s' }} />
          <Beaker className="absolute bottom-32 left-20 w-12 h-12 text-[#3B82F6]/20" />
        </div>

        <div className="container-wide relative z-10 py-12 sm:py-16 md:py-24">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#DBEAFE] text-[#1E40AF] text-xs sm:text-sm font-medium mb-6 sm:mb-8 animate-fade-in border border-[#93C5FD]">
              <FlaskConical className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Pioneering Chemistry Research</span>
            </div>
            
            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[#1E40AF] mb-4 sm:mb-6 animate-fade-in-up leading-[1.1]" style={{ animationDelay: '0.1s', letterSpacing: '-0.02em' }}>
              Prof. Dr. Yunus Ahmed<br />
              <span className="text-[#3B82F6]">Research Group</span>
            </h1>
            
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="w-10 sm:w-16 h-1 bg-[#3B82F6] rounded-full" />
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-[#0F172A] font-medium">Professor of Chemistry, CUET</p>
            </div>
            
            <p className="text-base sm:text-lg lg:text-xl text-[#475569] mb-6 sm:mb-8 md:mb-10 max-w-2xl animate-fade-in-up leading-relaxed" style={{ animationDelay: '0.3s' }}>
              Chittagong University of Engineering & Technology — Advancing the frontiers of sustainable chemistry through innovative research and collaboration.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <Link to="/projects" className="inline-flex items-center justify-center gap-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-medium rounded-lg shadow-lg shadow-[#3B82F6]/25 text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 transition-colors group">
                Explore Research <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/team" className="inline-flex items-center justify-center gap-2 border-2 border-[#3B82F6] text-[#3B82F6] hover:bg-[#EFF6FF] font-medium rounded-lg text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 transition-colors">
                <Users className="w-4 h-4 sm:w-5 sm:h-5" /> Meet Our Team
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Floating Cards */}
      <section className="container-wide -mt-12 sm:-mt-16 relative z-20 pb-12 sm:pb-16 md:pb-20">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="stat-card animate-pulse bg-white shadow-elevated border border-[#E5E7EB] rounded-xl">
                <div className="h-10 w-20 bg-[#F3F8FF] rounded mb-2" />
                <div className="h-4 w-24 bg-[#F3F8FF] rounded" />
              </div>
            ))
          ) : (
            <>
              <StatCard icon={<FolderKanban className="w-6 h-6" />} number={stats.totalProjects} label="Research Projects" delay="0s" color="bg-[#DBEAFE]" />
              <StatCard icon={<BookOpen className="w-6 h-6" />} number={stats.totalPublications} label="Publications" delay="0.1s" color="bg-[#DBEAFE]" />
              <StatCard icon={<Users className="w-6 h-6" />} number={stats.totalMembers} label="Team Members" delay="0.2s" color="bg-[#DBEAFE]" />
              <StatCard icon={<FlaskConical className="w-6 h-6" />} number={stats.ongoingProjects} label="Ongoing Projects" delay="0.3s" color="bg-[#DBEAFE]" />
            </>
          )}
        </div>
      </section>

      {/* About Us Section - Enhanced */}
      <section className="py-24 md:py-36 relative overflow-hidden bg-[#FAFBF8]">
        <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-[#FAFBF8] to-white/30" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#3B82F6]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#3B82F6]/5 rounded-full blur-3xl" />
        
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
                  <div className="flex items-center gap-3 sm:gap-4 text-white">
                    <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl">
                      <Award className="w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                    <div>
                      <p className="font-heading text-xl sm:text-2xl font-bold">15+ Years</p>
                      <p className="text-white/80 text-xs sm:text-sm">Research Excellence</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 sm:-bottom-6 -right-4 sm:-right-6 w-32 sm:w-48 h-32 sm:h-48 bg-accent/20 rounded-xl sm:rounded-2xl -z-10" />
              <div className="absolute -top-4 sm:-top-6 -left-4 sm:-left-6 w-20 sm:w-32 h-20 sm:h-32 bg-primary/10 rounded-xl sm:rounded-2xl -z-10" />
            </div>
            
            {/* Content Side */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#DBEAFE] text-[#3B82F6] text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                <Info className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>About Our Research Group</span>
              </div>
              
              <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-[#0F172A] mb-4 sm:mb-6 leading-tight" style={{ letterSpacing: '-0.02em' }}>
                Pushing the Boundaries of <span className="text-[#3B82F6]">Chemical Science</span>
              </h2>
              
              {aboutUs ? (
                <p className="text-[#475569] text-lg leading-relaxed mb-8">{aboutUs}</p>
              ) : (
                <p className="text-[#475569] text-lg leading-relaxed mb-8">
                  Welcome to Yunus Ahmed Lab at CUET. Our research group is dedicated to advancing the frontiers of chemistry through innovative approaches in environmental remediation, resource recovery, nanomaterials, and cutting-edge wastewater treatment technologies for sustainable development.
                </p>
              )}
              
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-[#E5E7EB]">
                  <div className="p-2 rounded-lg bg-[#DBEAFE] text-[#3B82F6]">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#0F172A]">Our Mission</h4>
                    <p className="text-sm text-[#475569]">Sustainable solutions for environmental challenges</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-[#E5E7EB]">
                  <div className="p-2 rounded-lg bg-[#DBEAFE] text-[#3B82F6]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#0F172A]">Our Vision</h4>
                    <p className="text-sm text-[#475569]">Clean water and environment for all</p>
                  </div>
                </div>
              </div>
              
              <Link to="/publications" className="inline-flex items-center gap-2 text-[#2563EB] font-semibold hover:text-[#1E40AF] transition-all group">
                View Our Publications <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Research Focus - Enhanced */}
      <section className="py-24 md:py-36 bg-[#F3F8FF] relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%231E40AF" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        </div>
        
        <div className="container-wide relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#DBEAFE] text-[#3B82F6] text-sm font-medium mb-6">
              <Microscope className="w-4 h-4" />
              <span>What We Do</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl text-[#0F172A] mb-4" style={{ letterSpacing: '-0.02em' }}>Our Research Focus</h2>
            <p className="text-[#475569] max-w-2xl mx-auto text-lg">
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
                className="group p-8 rounded-xl bg-white border border-[#E5E7EB] hover:border-[#3B82F6]/30 transition-all duration-300 animate-fade-in-up shadow-sm"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="p-3 rounded-xl bg-[#DBEAFE] text-[#3B82F6] w-fit mb-4 group-hover:scale-110 transition-transform">
                  {area.icon}
                </div>
                <h3 className="font-heading text-xl text-[#0F172A] mb-2" style={{ letterSpacing: '-0.02em' }}>{area.title}</h3>
                <p className="text-[#475569] text-sm leading-relaxed">{area.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Notices - Enhanced */}
      <section className="container-wide py-24 md:py-36 bg-[#FAFBF8]">
        <div className="flex items-center justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#DBEAFE] text-[#3B82F6] text-sm font-medium mb-4">
              <Bell className="w-4 h-4" />
              <span>Stay Updated</span>
            </div>
            <h2 className="font-heading text-3xl md:text-4xl text-[#0F172A]" style={{ letterSpacing: '-0.02em' }}>Recent Notices</h2>
          </div>
          <Link to="/notices" className="hidden sm:inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-[#0F172A] font-medium hover:bg-[#F3F8FF] transition-colors border border-[#E5E7EB]">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white border border-[#E5E7EB] rounded-xl p-6 animate-pulse">
                <div className="h-5 w-3/4 bg-[#F3F8FF] rounded mb-3" />
                <div className="h-4 w-full bg-[#F3F8FF] rounded mb-2" />
                <div className="h-4 w-2/3 bg-[#F3F8FF] rounded" />
              </div>
            ))
          ) : recentNotices.length === 0 ? (
            <div className="col-span-3 text-center py-12 bg-[#F3F8FF] rounded-xl border border-[#E5E7EB]">
              <Bell className="w-12 h-12 mx-auto text-[#94A3B8] mb-4" />
              <p className="text-[#475569]">No notices yet. Check back soon!</p>
            </div>
          ) : (
            recentNotices.map((notice, index) => (
              <NoticeCard key={notice.id} notice={notice} delay={`${index * 0.1}s`} />
            ))
          )}
        </div>
        
        <div className="mt-8 text-center sm:hidden">
          <Link to="/notices" className="inline-flex items-center gap-2 text-[#2563EB] font-medium hover:text-[#1E40AF] transition-all">
            View All Notices <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container-wide pb-16 sm:pb-20 md:pb-32">
        <div className="relative rounded-xl sm:rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-[#1E40AF]" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#1E40AF] via-[#2563EB] to-[#1E40AF]" />
          <div className="relative flex items-center py-16 sm:py-20">
            <div className="container-wide">
              <div className="max-w-xl px-2">
                <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl text-white mb-3 sm:mb-4" style={{ letterSpacing: '-0.02em' }}>
                  Interested in Joining Our Research?
                </h2>
                <p className="text-[#93C5FD] text-sm sm:text-base mb-6 sm:mb-8 leading-relaxed">
                  We're always looking for passionate researchers and students to join our team. Explore opportunities to contribute to groundbreaking chemistry research.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Link to="/teamlogin" className="inline-flex items-center justify-center gap-2 bg-white hover:bg-[#F3F8FF] text-[#1E40AF] font-medium rounded-lg text-sm sm:text-base px-5 sm:px-6 py-2.5 sm:py-3 transition-colors">
                    Team Portal <ArrowRight className="w-4 h-4" />
                  </Link>
                  <a href="https://mail.google.com/mail/?view=cm&to=yunus@cuet.ac.bd" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 border-2 border-white text-white hover:bg-white/10 font-medium rounded-lg text-sm sm:text-base px-5 sm:px-6 py-2.5 sm:py-3 transition-colors">
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
    <div className="bg-white rounded-xl sm:rounded-xl p-4 sm:p-6 shadow-sm border border-[#E5E7EB] hover:shadow-md hover:border-[#3B82F6]/30 transition-all duration-300 animate-fade-in-up group" style={{ animationDelay: delay }}>
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${color} text-[#3B82F6] group-hover:scale-110 transition-transform`}>{icon}</div>
        <div className="w-8 sm:w-12 h-1 bg-[#3B82F6]/30 rounded-full mt-2 sm:mt-3 hidden sm:block" />
      </div>
      <div className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-[#3B82F6] mb-0.5 sm:mb-1">{number}</div>
      <div className="text-xs sm:text-sm text-[#475569] font-medium">{label}</div>
    </div>
  );
}

function NoticeCard({ notice, delay }: { notice: Notice; delay: string }) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 hover:border-[#3B82F6]/30 transition-all duration-300 animate-fade-in-up group shadow-sm" style={{ animationDelay: delay }}>
      <div className="flex items-start gap-4 mb-4">
        <div className={`p-3 rounded-xl ${notice.priority === 'important' ? 'bg-red-100 text-red-600' : 'bg-[#DBEAFE] text-[#3B82F6]'} group-hover:scale-110 transition-transform`}>
          <Bell className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-heading text-lg font-semibold text-[#0F172A] truncate group-hover:text-[#3B82F6] transition-colors">{notice.title}</h3>
          <p className="text-xs text-[#94A3B8] mt-1">
            {new Date(notice.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>
      <p className="text-sm text-[#475569] line-clamp-3 leading-relaxed">{notice.content}</p>
    </div>
  );
}
