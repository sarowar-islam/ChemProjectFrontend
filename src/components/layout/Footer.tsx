import { Link } from 'react-router-dom';
import { Mail, MapPin, ExternalLink, Facebook, Linkedin, GraduationCap, LogIn } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container-wide section-padding">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 shrink-0">
                <img
                  src="/photos/Logo.png"
                  alt="Yunus Ahmed Lab logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-heading text-sm lg:text-base font-semibold text-foreground">
                  <span>Bio-Chemical and </span>
                  <span className="text-[#15803D]">Environmental</span>
                </span>
                <span className="text-[10px] lg:text-xs uppercase tracking-[0.35em] text-[#15803D] font-medium mt-0.5">
                  Research Lab
                </span>
              </div>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Advancing the frontiers of chemistry through innovative research 
              and collaborative discovery at CUET.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-lg mb-4 text-[#166534] dark:text-foreground">Quick Links</h4>
            <nav className="flex flex-col gap-2">
              {[
                { label: 'Research Projects', path: '/projects' },
                { label: 'Publications', path: '/publications' },
                { label: 'Our Team', path: '/team' },
                { label: 'News', path: '/news' },
                { label: 'Notices', path: '/notices' },
              ].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-muted-foreground hover:text-accent text-sm transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/teamlogin"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-accent text-sm transition-colors mt-2 pt-2 border-t border-border"
              >
                <LogIn className="w-4 h-4" />
                Team Member Login
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading text-lg mb-4 text-[#166534] dark:text-foreground">Contact</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 text-[#166534] dark:text-foreground" />
                <span className="text-muted-foreground">
                  Department of Chemistry<br />
                  Chittagong University of Engineering & Technology<br />
                  Chittagong, Bangladesh
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#166534] dark:text-foreground" />
                <a
                  href="https://mail.google.com/mail/?view=cm&to=yunus@cuet.ac.bd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-accent transition-colors"
                >
                  yunus@cuet.ac.bd
                </a>
              </div>
              <div className="flex items-center gap-3">
                <ExternalLink className="w-4 h-4 text-[#166534] dark:text-foreground" />
                <a
                  href="https://cuet.ac.bd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-accent transition-colors"
                >
                  CUET Official Website
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-6 pt-4 border-t border-border">
          {/* Social Media Links */}
          <div className="flex justify-center gap-6 mb-6">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-accent/10 text-muted-foreground hover:text-accent transition-all"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-accent/10 text-muted-foreground hover:text-accent transition-all"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a
              href="https://scholar.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-accent/10 text-muted-foreground hover:text-accent transition-all"
              aria-label="Google Scholar"
            >
              <GraduationCap className="w-5 h-5" />
            </a>
          </div>
          
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Yunus Ahmed Lab. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
