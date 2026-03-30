import { Link } from 'react-router-dom';
import { Scroll } from 'lucide-react';

export function AppFooter() {
  const year = new Date().getFullYear();
  
  return (
    <footer className="w-full border-t border-border bg-background/50 py-6 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-4 md:flex-row md:px-8">
        <div className="flex items-center gap-2 text-muted-foreground/80">
          <Scroll className="h-4 w-4" />
          <span className="text-sm font-semibold tracking-wide" style={{ fontFamily: 'var(--font-heading)' }}>
            Grimório
          </span>
          <span className="text-sm">© {year}</span>
        </div>
        
        <div className="flex items-center gap-6 text-sm font-medium text-muted-foreground/80">
          <Link to="/terms-of-use" className="hover:text-primary transition-colors">
            Termos de Uso
          </Link>
          <a href="#" onClick={(e) => { e.preventDefault(); alert("Em breve!"); }} className="hover:text-primary transition-colors">
            Contato
          </a>
        </div>
      </div>
    </footer>
  );
}
