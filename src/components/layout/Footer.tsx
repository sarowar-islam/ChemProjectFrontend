import { Link } from 'react-router-dom';
import { FlaskConical, Mail, MapPin, ExternalLink, Facebook, Linkedin, GraduationCap, LogIn } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-[#E5E7EB]">
      <div className="container-wide section-padding">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-[#1E40AF]/10 text-[#1E40AF]">
                <FlaskConical className="w-5 h-5" />
              </div>
              <span className="font-heading text-lg font-semibold text-[#1E40AF]">
                Yunus Ahmed Lab
              </span>
            </Link>
            <p className="text-[#475569] text-sm leading-relaxed">
              Advancing the frontiers of chemistry through innovative research 
              and collaborative discovery at CUET.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-lg mb-4 text-[#1E40AF]">Quick Links</h4>
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
                  className="text-[#475569] hover:text-[#3B82F6] text-sm transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/teamlogin"
                className="inline-flex items-center gap-2 text-[#475569] hover:text-[#3B82F6] text-sm transition-colors mt-2 pt-2 border-t border-[#E5E7EB]"
              >
                <LogIn className="w-4 h-4" />
                Team Member Login
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading text-lg mb-4 text-[#1E40AF]">Contact</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 text-[#1E40AF]" />
                <span className="text-[#475569]">
                  Department of Chemistry<br />
                  Chittagong University of Engineering & Technology<br />
                  Chittagong, Bangladesh
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#1E40AF]" />
                <a
                  href="https://mail.google.com/mail/?view=cm&to=yunus@cuet.ac.bd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#475569] hover:text-[#3B82F6] transition-colors"
                >
                  yunus@cuet.ac.bd
                </a>
              </div>
              <div className="flex items-center gap-3">
                <ExternalLink className="w-4 h-4 text-[#1E40AF]" />
                <a
                  href="https://cuet.ac.bd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#475569] hover:text-[#3B82F6] transition-colors"
                >
                  CUET Official Website
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-[#E5E7EB]">
          {/* Social Media Links */}
          <div className="flex justify-center gap-6 mb-6">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-[#3B82F6]/10 text-[#475569] hover:text-[#3B82F6] transition-all"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-[#3B82F6]/10 text-[#475569] hover:text-[#3B82F6] transition-all"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a
              href="https://scholar.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-[#3B82F6]/10 text-[#475569] hover:text-[#3B82F6] transition-all"
              aria-label="Google Scholar"
            >
              <GraduationCap className="w-5 h-5" />
            </a>
          </div>
          
          <p className="text-center text-sm text-[#94A3B8]">
            © {new Date().getFullYear()} Yunus Ahmed Lab. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
