import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';

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
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container-wide">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
            <div className="w-[3.6rem] h-[3.6rem] sm:w-[4.5rem] sm:h-[4.5rem] shrink-0 group-hover:scale-105 transition-transform">
              <img
                src="/photos/Logo.png"
                alt="Yunus Ahmed Lab logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="font-heading text-sm lg:text-base font-semibold text-foreground">
                <span>Bio-Chemical and </span>
                <span className="text-[#0D8B4E]">Environmental</span>
              </span>
              <span className="text-[10px] lg:text-xs uppercase tracking-[0.35em] text-[#0D8B4E] font-medium mt-0.5">
                Research Lab
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-[15px] font-medium transition-colors duration-200 ${
                  location.pathname === item.path
                    ? 'text-accent'
                    : 'text-muted-foreground hover:text-accent'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle className="hidden md:inline-flex" />

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground"
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
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 animate-fade-in">
            <div className="px-4 pb-3">
              <ThemeToggle className="w-full justify-center" />
            </div>
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg text-[15px] font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-secondary hover:text-accent'
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
