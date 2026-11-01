# 05 · Marca e animação de carregamento

## A marca

Um grimório fechado visto de frente: lombada à esquerda, capa com um **losango em engaste** no centro, fecho à direita e o bloco de páginas aparecendo embaixo. O losango é o mesmo formato dos espaços de magia da ficha.

Arquivos em `assets/` (gerados a partir da mesma geometria):

| Arquivo | Destino na implementação | Uso |
|---|---|---|
| `grimorio-marca.svg` | referência para `GrimorioMark.tsx` | Marca vetorial em `currentColor`, recortes transparentes. A partir de 24 px. |
| `favicon.svg` | `public/favicon.svg` (substitui o emoji atual) | Versão simplificada para 16–20 px (sem fecho). Troca de cor com o tema do navegador. |
| `favicon.ico` | `public/favicon.ico` | Reserva 16 + 32 px. |
| `apple-touch-icon.png` | `public/apple-touch-icon.png` | 180 px. |
| `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` | `public/` | App instalado. |
| `site.webmanifest` | `public/site.webmanifest` | Manifesto. |
| `geom.js`, `render-reference.js` | portar para `src/components/brand/loadingGeometry.ts` e `LoadingMark.tsx` | Geometria e ordem de desenho da animação. |

No `index.html`:

```html
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<link rel="icon" href="/favicon.ico" sizes="32x32" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<link rel="manifest" href="/site.webmanifest" />
<meta name="theme-color" content="#12151B" />
```

### `GrimorioMark`

```tsx
<GrimorioMark size={30} className="text-primary" title="Grimório" />
```

- SVG inline com `viewBox="0 0 64 64"`, preenchimento `currentColor`, recortes por `<mask>` (copie de `assets/grimorio-marca.svg`; gere o `id` da máscara com `useId()` para não colidir quando houver várias marcas na página).
- `title` opcional vira `role="img"` + `aria-label`; sem `title`, `aria-hidden`.
- Cor: `--primary` no escuro, `--primary-text` (`#8A6510`) no claro.
- Tamanho mínimo da marca completa: 24 px. Abaixo disso use a versão simplificada (`favicon.svg`).
- Respiro mínimo em volta: 1/8 da altura.
- Proibido: contorno, sombra, degradê, rotação, e mostrar o d20 na marca parada.

Onde aplicar (troca o ícone `Scroll` e o quadrado "G" provisório):

| Lugar | Tamanho |
|---|---|
| `AppHeader` (início, perfil) | 30 px + "Grimório" |
| Telas de conta (topo do cartão) | 64 px, empilhada com "Grimório" |
| Barra superior da ficha no computador e topo do trilho no tablet (botão voltar) | 30 px |
| `AppFooter` | 16 px (versão simplificada) |

## Animação de carregamento (`LoadingMark`)

Ciclo de **4,2 s** em loop. O losango **se solta antes de o livro abrir e nunca cruza o livro**:

| Trecho do ciclo (0–1) | O que acontece |
|---|---|
| 0,00–0,04 | marca parada (livro fechado) |
| 0,04–0,11 | o losango "se levanta" da capa, no lugar; o engaste se fecha por baixo dele e aparece um contorno fino de separação |
| 0,11–0,23 | o livro fechado recua (encolhe para 48 %, preso pela base) por baixo do losango parado |
| 0,21–0,37 | o losango sobe ao centro, gira 180° e vira um d20 (hexágono); a face triangular aparece no fim |
| 0,37–0,55 | o livro abre embaixo do dado (a capa vira para a esquerda) e cresce até o tamanho de livro aberto |
| 0,55–0,65 | pausa: livro aberto com o d20 em cima |
| 0,65–0,79 | o livro fecha e recua |
| 0,79–0,89 | o dado desce, gira de volta e vira losango, pairando |
| 0,87–0,96 | o livro volta ao tamanho por baixo dele |
| 0,94–0,99 | o losango assenta no engaste; o quadro final é idêntico à marca parada |

Implementação:

- Porte `assets/geom.js` para TypeScript sem mudar números. `frame(u, { reduced, ms })` devolve os pontos de cada polígono e as opacidades; `assets/render-reference.js` mostra a ordem de desenho (livro em um grupo com a transformação `bookT`; losango, contorno e face do d20 por cima).
- Anime com `requestAnimationFrame` atualizando atributos de um único `<svg>` por `ref` (não use estado do React por quadro).
- Cor do recorte (`K`) = cor do fundo onde a animação está (`--background`); cor da marca (`F`) = `--primary` / `--primary-text`.
- `prefers-reduced-motion: reduce`: marca parada com o losango pulsando suavemente (opacidade 0,45 ↔ 1 em 1,6 s), sem mover o livro.
- Abaixo da marca, texto de status com `role="status"` (ex.: "Abrindo o grimório…", "Carregando suas fichas…").

### Quando usar (`FullscreenLoader`)

- Só em carregamentos de **tela inteira**: verificação de sessão no `ProtectedRoute`, abrir uma ficha (`CharacterSheet.tsx` e `SharedCharacterSheet.tsx`, no lugar do círculo girando atual).
- **Mostrar só depois de 400 ms** de carregamento. Carregamentos mais rápidos não mostram nada (evita o livro piscando).
- Quando os dados chegam, **sair na hora** com esmaecimento de 150 ms; nunca esperar o ciclo terminar.
- Tamanho mínimo 48 px (abaixo disso o livro aberto vira borrão); recomendado 120–200 px.
- **Não usar** na lista de fichas (lá ficam os cartões-esqueleto) nem dentro de botões ("Entrando…", "Salvando…" continuam com o indicador pequeno da v1).
