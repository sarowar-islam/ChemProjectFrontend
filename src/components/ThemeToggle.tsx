import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-accent text-accent-foreground shadow-lg hover:brightness-110 transition-all duration-300 hover:scale-110 group"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 transition-transform group-hover:rotate-45" />
      ) : (
        <Moon className="w-5 h-5 transition-transform group-hover:-rotate-12" />
      )}
    </button>
  );
}
