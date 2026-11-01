import React from 'react';
import { useTheme } from 'next-themes';
import { GrimorioMark } from '@/components/brand/GrimorioMark';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

/** Telas de conta (redesign v2): marca no topo e cartão central de até 440 px. */
export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-4 py-8">
      <div className="my-auto flex w-full max-w-[440px] flex-col gap-5">
        <div className="flex flex-col items-center gap-2 text-center text-primary-text">
          <GrimorioMark size={64} />
          <span className="font-heading text-[26px] font-bold tracking-[0.08em]">Grimório</span>
        </div>

        <section className="rounded-[14px] border border-hairline bg-card px-[22px] py-6 shadow-[inset_0_1px_0_hsl(var(--primary)/0.35)]">
          <div className="mb-5 text-center">
            <h1 className="font-heading text-[22px] font-bold tracking-[0.04em] text-foreground">{title}</h1>
            {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
          </div>
          {children}
        </section>
      </div>
    </div>
  );
}

/** Tema dos widgets de terceiros (reCAPTCHA, Google) acompanhando o tema da página. */
// eslint-disable-next-line react-refresh/only-export-components
export function useWidgetTheme(): 'light' | 'dark' {
  const { resolvedTheme } = useTheme();
  return resolvedTheme === 'light' ? 'light' : 'dark';
}
