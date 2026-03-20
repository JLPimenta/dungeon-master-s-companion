

# Plano Atualizado - D&D 5.5 Character Sheet Manager

## Web (sem alterações)

Mantém tudo já aprovado: tema medieval escuro, dashboard com cards, ficha completa, localStorage, service layer com Repository Pattern, cálculos automáticos, compartilhamento, fullscreen, notas e campos personalizáveis.

## Mobile - Capacitor (Nova Seção)

Como o projeto já é React + Vite, usaremos **Capacitor** para empacotar o app como nativo (iOS e Android). Isso evita reescrever em Flutter ou React Native — o mesmo código React roda como app nativo com acesso a APIs do dispositivo.

### Por que Capacitor e não React Native?

- Zero reescrita: o mesmo código React/Vite vira app nativo
- Acesso completo a APIs nativas (filesystem, câmera, etc.)
- Publicável na App Store e Google Play
- Quando migrar para backend, basta trocar o service — funciona igual no mobile

### Persistência no Mobile

A service layer já planejada (Repository Pattern) facilita isso:

```text
CharacterService (interface)
├── localStorageService.ts   ← Web (localStorage)
├── capacitorStorageService.ts ← Mobile (Capacitor Preferences/Filesystem)
└── apiService.ts            ← Futuro (Spring Boot / NestJS)
```

No mobile, usaremos **@capacitor/preferences** (key-value) ou **@capacitor/filesystem** (JSON files) para persistência local no dispositivo. A escolha será feita automaticamente com detecção de plataforma (`Capacitor.isNativePlatform()`).

### Responsividade

Os componentes da ficha serão construídos mobile-first:
- Dashboard: 1 coluna em telas pequenas, grid em telas maiores
- Ficha: seções empilhadas verticalmente no mobile, layout multi-coluna no desktop
- Inputs e botões com tamanho adequado para toque

### Setup Capacitor (passo final do MVP)

1. Instalar `@capacitor/core`, `@capacitor/cli`, `@capacitor/ios`, `@capacitor/android`, `@capacitor/preferences`
2. `npx cap init` com config apontando para o preview do Lovable (hot-reload)
3. Criar `capacitorStorageService.ts` implementando `CharacterService`
4. Criar util `getPlatformService()` que retorna o service correto por plataforma
5. Para testar no dispositivo: export para GitHub → `npm install` → `npx cap add android/ios` → `npx cap sync` → `npx cap run`

### Ordem de Implementação Atualizada

1. Tipos, cálculos, service layer (interface) e tema medieval
2. `localStorageService.ts` + Dashboard (cards, criar, excluir)
3. Ficha - Página 1 (cabeçalho, atributos, combate, perícias, armas)
4. Ficha - Página 2 (magias, inventário, itens sintonizados, moedas)
5. Extras (notas, campos personalizáveis, compartilhar, fullscreen)
6. **Capacitor setup + `capacitorStorageService.ts` + detecção de plataforma**
7. Testes no dispositivo físico/emulador

## Futuro — Tela de Configuração (/settings)

Página onde o jogador poderá definir regras da mesa que alterem dinamicamente os cálculos e campos da ficha. Exemplos:
- Fórmula de itens sintonizados (padrão: bônus de proficiência)
- Regras de descanso (curto/longo)
- Variantes de encumbrance
- Campos obrigatórios customizados
- Regras homebrew que afetem atributos/perícias

Essa funcionalidade será integrada aos Campos Personalizáveis (US11) existentes.

O passo 6 é independente — pode ser feito a qualquer momento após o passo 2, pois só troca a implementação do service.

