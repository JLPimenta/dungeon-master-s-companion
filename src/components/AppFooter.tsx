import { Link } from 'react-router-dom';
import { GrimorioMark } from '@/components/brand/GrimorioMark';

export function AppFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-hairline bg-surface">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-[18px] text-[15px] text-muted-foreground">
        <span className="flex items-center gap-2">
          <GrimorioMark size={16} className="text-primary-text" />
          <span className="font-heading font-bold tracking-[0.06em]">Grimório</span>
          <span>© {year}</span>
        </span>

        <span className="flex items-center gap-5">
          <Link to="/terms-of-use" className="rounded-sm underline-offset-[3px] hover:text-primary-text hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            Termos de Uso
          </Link>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); alert("Em breve!"); }}
            className="rounded-sm underline-offset-[3px] hover:text-primary-text hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Contato
          </a>
        </span>
      </div>
    </footer>
  );
}
