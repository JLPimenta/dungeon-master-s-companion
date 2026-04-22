import { useState, useEffect } from 'react';

interface BonusInputProps {
    value: number;
    onChange: (v: number) => void;
    title: string;
    /** Largura do campo. Padrão: 'w-10' */
    widthClass?: string;
    /** Altura do campo. Padrão: 'h-8' */
    heightClass?: string;
    /** Tamanho do texto. Padrão: 'text-sm' */
    textClass?: string;
}

/**
 * Input para bônus manuais em campos calculados (salvaguardas, perícias, iniciativa, proficiência).
 *
 * Problemas resolvidos:
 * - Mantém estado interno de string para não travar o cursor enquanto o usuário edita.
 * - `onFocus` seleciona tudo: em mobile o teclado numérico substitui o valor sem acumular dígitos.
 * - `onBlur` normaliza: string vazia ou inválida vira 0; remove zeros à esquerda.
 * - Aceita negativos (ex: -1 em penalty de maldição).
 * - Aparência: borda tracejada quase invisível quando = 0; acende na cor primária quando ≠ 0.
 */
export function BonusInput({
                               value,
                               onChange,
                               title,
                               widthClass = 'w-10',
                               heightClass = 'h-8',
                               textClass = 'text-sm',
                           }: BonusInputProps) {
    const [raw, setRaw] = useState(String(value));

    // Sincroniza quando o valor externo muda (carregamento de dados, reset etc.)
    useEffect(() => {
        setRaw(String(value));
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        // Permite string vazia ou sinal de menos durante a digitação
        if (v === '' || v === '-') {
            setRaw(v);
            return;
        }
        // Aceita apenas dígitos e sinal negativo no início
        if (/^-?\d+$/.test(v)) {
            setRaw(v);
            onChange(parseInt(v, 10));
        }
    };

    const handleBlur = () => {
        const n = parseInt(raw, 10);
        const final = isNaN(n) ? 0 : n;
        setRaw(String(final));
        onChange(final);
    };

    const isActive = value !== 0;

    return (
        <input
            type="text"
            inputMode="text"
            value={raw}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={e => e.target.select()}
            title={title}
            className={[
                widthClass,
                heightClass,
                textClass,
                'shrink-0 rounded border border-dashed bg-transparent px-0 text-center',
                'focus:outline-none focus:ring-1 focus:ring-primary/40',
                isActive
                    ? 'border-primary/60 text-primary'
                    : 'border-primary/20 text-muted-foreground/40',
            ].join(' ')}
        />
    );
}