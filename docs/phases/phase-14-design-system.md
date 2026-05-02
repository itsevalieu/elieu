# Phase 14 — Design System & UI Library

**Status**: Complete

---

## Overview

A shared `@evalieu/design-system` package that provides a single source of truth for design tokens, base styles, and reusable components across all frontends (newsletter, magazine layout, portfolio, and admin).

---

## Package Structure

```
frontend/design-system/
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts              # barrel export for components + tokens
    ├── utils.ts              # cx() class-name utility
    ├── tokens/
    │   ├── index.ts
    │   ├── colors.ts         # all color palettes as JS objects
    │   ├── typography.ts     # font families, sizes, weights, line heights
    │   ├── spacing.ts        # spacing scale, max-widths
    │   └── breakpoints.ts    # breakpoints + media queries
    ├── styles/
    │   ├── index.css          # combined import
    │   ├── tokens.css         # all --ds-* CSS custom properties
    │   ├── reset.css          # normalize / reset
    │   └── typography.css     # .ds-headline, .ds-prose, etc.
    └── components/
        ├── Button/            # .ds-btn variants
        ├── Input/             # .ds-input + .ds-field
        ├── Select/            # reuses Input CSS
        ├── Textarea/          # reuses Input CSS + .ds-textarea
        ├── Card/              # .ds-card with padding/elevation
        ├── Badge/             # .ds-badge with auto-tone detection
        ├── Container/         # max-width containers
        ├── Stack/             # flexbox stack layout
        └── Modal/             # portal overlay with backdrop
```

---

## Design Token Architecture

### CSS Custom Properties (`--ds-*` prefix)

All tokens are defined in `styles/tokens.css` as `:root` properties. Theme switching works via data attributes on `<html>`:

| Attribute | Values | Selectors |
|-----------|--------|-----------|
| `data-theme` | `"light"`, `"dark"` | `[data-theme="dark"]` |
| `data-layout` | `"newspaper"`, `"magazine"` | `[data-layout="magazine"]` |
| `data-app` | `"portfolio"` | `[data-app="portfolio"]` |

Compound selectors combine them: `[data-theme="dark"][data-layout="magazine"]`.

### Token Categories

| Category | Prefix | Examples |
|----------|--------|---------|
| Colors | `--ds-color-*` | `--ds-color-bg`, `--ds-color-ink`, `--ds-color-accent` |
| Semantic | `--ds-error`, `--ds-success` | Status colors independent of theme |
| Typography | `--ds-font-*`, `--ds-text-*` | `--ds-font-headline`, `--ds-text-lg` |
| Spacing | `--ds-space-*` | `--ds-space-md`, `--ds-space-xl` |
| Layout | `--ds-max-*` | `--ds-max-prose`, `--ds-max-wide` |
| Radius | `--ds-radius-*` | `--ds-radius-md`, `--ds-radius-full` |
| Shadows | `--ds-shadow-*` | `--ds-shadow-sm` through `--ds-shadow-xl` |
| Transitions | `--ds-transition-*` | `--ds-transition-fast` (150ms), `--ds-transition-slow` (300ms) |
| Categories | `--ds-cat-*` | `--ds-cat-writing`, `--ds-cat-games` |

### TypeScript Exports

All token values are also available as typed TS constants for JS-side logic:

```ts
import { colors, fontFamily, spacing, breakpoints } from '@evalieu/design-system/tokens';
```

---

## Component Library

Each component uses CSS custom properties (not Tailwind) — so it works in any styling context.

### Button
- **Variants**: `primary`, `secondary`, `danger`, `ghost`
- **Sizes**: `sm`, `md`, `lg`
- Accepts all `<button>` HTML props via `forwardRef`

### Input / Select / Textarea
- Label, error message, and required indicator built in
- Accessible: `aria-invalid`, `aria-describedby` for errors
- Focus ring uses `--ds-color-accent`

### Card
- **Padding**: `none`, `sm`, `md`, `lg`
- **Modifiers**: `elevated` (shadow), `bordered` (border)
- Polymorphic: `as="article"`, `as="section"`, etc.

### Badge
- **Tones**: `neutral`, `green`, `blue`, `yellow`, `red`
- Auto-detection: pass a status string as `children` and it auto-resolves tone
- Dark mode aware

### Container
- **Sizes**: `prose` (720px), `content` (880px), `wide` (1200px)
- Centered with responsive padding

### Stack
- Flexbox layout primitive
- **Direction**: `column`, `row`
- **Gap**: `xs` through `xl`
- `wrap` prop for flex-wrap

### Modal
- Portal-based (renders to `document.body`)
- Backdrop with blur
- Escape key + click-outside to close
- Scroll lock while open

---

## Integration

Each frontend app:
1. Declares `@evalieu/design-system` as a workspace dependency
2. Lists it in `transpilePackages` (Next.js config)
3. Has tsconfig paths for IDE resolution
4. Imports `@evalieu/design-system/styles` at the root layout level

The portfolio app was additionally fixed:
- `globals.scss` was not imported in `layout.tsx` — now imported
- Legacy `--primary-color` etc. mapped to `--ds-*` tokens
- `<html data-app="portfolio">` added for theme scoping

---

## Migration Path

Existing components don't need to change immediately. The design system is additive:

1. **New components** should import from `@evalieu/design-system`
2. **Existing components** can gradually adopt `--ds-*` tokens in their SCSS
3. **Admin Tailwind components** can reference `--ds-*` vars in custom utilities if desired
4. Over time, duplicated Button/Input/Select/Textarea implementations in admin can be replaced with design-system versions
