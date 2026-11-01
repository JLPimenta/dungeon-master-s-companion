import { Copy, Globe, Lock, Share2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useSheetChrome } from './SheetChromeContext';

export const iconButtonClass =
  'relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-primary/10';

/**
 * Compartilhar (conteúdo idêntico ao da v1). Botão discreto, no mesmo estilo
 * dos outros ícones da barra; ficha pública ganha só um ponto dourado.
 */
export function SharePopover({ bordered }: { bordered?: boolean }) {
  const { share, readOnly } = useSheetChrome();
  if (readOnly || !share) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={share.isShared ? 'Compartilhar ficha (pública)' : 'Compartilhar ficha (privada)'}
          className={cn(iconButtonClass, bordered && 'border border-border/60')}
        >
          <Share2 className="h-[18px] w-[18px]" />
          {share.isShared && (
            <span aria-hidden className="absolute right-[7px] top-[7px] h-[7px] w-[7px] rounded-full bg-primary" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[340px] max-w-[calc(100vw-20px)] border-border/60 bg-card p-4">
        <div className="mb-3 flex items-center gap-2 font-semibold">
          {share.isShared
            ? <Globe className="h-4 w-4 text-primary" />
            : <Lock className="h-4 w-4 text-muted-foreground" />}
          <span>{share.isShared ? 'Ficha pública' : 'Ficha privada'}</span>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-md border border-hairline bg-background/60 px-3 py-2">
          <label htmlFor="share-toggle" className="cursor-pointer text-[15px] text-muted-foreground">
            Permitir acesso via link
          </label>
          <Switch id="share-toggle" checked={share.isShared} onCheckedChange={share.onToggle} />
        </div>
        {share.isShared && (
          <div className="mt-3 space-y-2">
            <p className="text-sm text-muted-foreground">
              Qualquer pessoa com o link poderá visualizar esta ficha em modo somente leitura.
            </p>
            <div className="flex gap-2">
              <input
                readOnly
                aria-label="Link de compartilhamento"
                value={share.link}
                onFocus={e => e.currentTarget.select()}
                className="h-10 min-w-0 flex-1 truncate rounded-md border border-hairline bg-background px-2.5 text-sm text-muted-foreground"
              />
              <button
                type="button"
                onClick={share.onCopyLink}
                className="flex h-10 shrink-0 items-center gap-1.5 rounded-md border border-primary/50 px-3 text-[15px] text-primary-text hover:bg-primary/10"
              >
                <Copy className="h-3.5 w-3.5" />
                Copiar
              </button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
