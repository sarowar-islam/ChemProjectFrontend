import { Link, useLocation } from 'react-router-dom';
import { FlaskConical, Menu, X } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Projects', path: '/projects' },
  { label: 'Publications', path: '/publications' },
  { label: 'Team', path: '/team' },
  { label: 'News', path: '/news' },
  { label: 'Notices', path: '/notices' },
];

export function Header() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
      <div className="container-wide">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
            <div className="p-1.5 sm:p-2 rounded-lg bg-accent text-accent-foreground group-hover:scale-105 transition-transform">
              <FlaskConical className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="hidden xs:block sm:block">
              <span className="font-heading text-base sm:text-lg lg:text-xl font-semibold text-foreground">
                Yunus Ahmed Lab
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`navbar-link ${
                  location.pathname === item.path ? 'active' : ''
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-secondary rounded-lg transition-colors text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 animate-fade-in">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg text-[15px] font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'bg-accent text-accent-foreground'
                      : 'text-foreground/80 hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
