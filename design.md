# Design System

A portable reference of the design tokens, text styles, and frontend primitives used in the Data Library app. Drop these into a new project to keep the same look and feel.

## Stack

- **React 18** + **Vite 6**
- **Tailwind CSS v4** (CSS-first, `@theme inline` driven)
- **shadcn/ui** (style: `new-york`, base color: `neutral`, CSS variables enabled)
- **Radix UI** primitives (collapsible, dropdown, tabs, tooltip, label, separator)
- **lucide-react** icons (also used: small custom SVGs in `src/assets/icons.jsx`)
- **class-variance-authority** + **clsx** + **tailwind-merge** (variants & class merging)
- **tw-animate-css** (utility animations)

### Required dev setup
```bash
npm i react react-dom tailwindcss @tailwindcss/vite tw-animate-css \
  class-variance-authority clsx tailwind-merge lucide-react \
  @radix-ui/react-collapsible @radix-ui/react-dropdown-menu @radix-ui/react-label \
  @radix-ui/react-separator @radix-ui/react-tabs @radix-ui/react-tooltip radix-ui
```

```js
// vite.config.js
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import path from "path"
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
})
```

```js
// src/lib/utils.js — used by every primitive
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
export function cn(...inputs) { return twMerge(clsx(inputs)) }
```

---

## 1. Design tokens

All tokens live in `src/index.css` as CSS custom properties, exposed to Tailwind via `@theme inline`. Light values on `:root`, dark overrides on `.dark`. Toggle dark mode by adding the `dark` class to `<html>`.

### 1.1 Color tokens

#### Surfaces & text
| Token | Light | Dark | Use |
|---|---|---|---|
| `--background` | `#ffffff` | `#111827` | App background |
| `--foreground` | `#2e2e2e` | `#f3f4f6` | Body text |
| `--card` / `--card-foreground` | `#ffffff` / `#2e2e2e` | `#1f2937` / `#f3f4f6` | Cards |
| `--popover` / `--popover-foreground` | `#ffffff` / `#2e2e2e` | `#1f2937` / `#f3f4f6` | Menus, tooltips bg |
| `--muted` | `#f8f8f8` | `#1f2937` | Subtle bg (table headers) |
| `--muted-foreground` | `#5c5c5c` | `#9ca3af` | Secondary text |
| `--secondary` | `#f3f3f3` | `#273243` | Hover bg, neutral chips |
| `--secondary-foreground` | `#2e2e2e` | `#f3f4f6` | |
| `--accent` | `#f3f3f3` | `#273243` | Menu hover |
| `--accent-foreground` | `#2e2e2e` | `#f3f4f6` | |
| `--surface-hover` | `#ebebeb` | `#334155` | Header/sidebar hover |

#### Brand
| Token | Light | Dark | Use |
|---|---|---|---|
| `--primary` | `#066AFE` | `#066AFE` | Primary actions, links — same value in both modes |
| `--primary-foreground` | `#ffffff` | `#ffffff` | Text on primary |
| `--primary-hover` | `#0554CB` | `#2D85FE` | Hover state (lighter in dark for contrast) |
| `--primary-active` | `#044099` | `#5BA0FE` | Pressed state |
| `--primary-light` | `#EEF4FF` | `#172554` | Tinted backgrounds |
| `--primary-light-border` | `#9DC0F0` | `#1E40AF` | Tinted borders |

#### Borders & inputs
| Token | Light | Dark |
|---|---|---|
| `--border` | `#C9C9C9` | `#374151` |
| `--input` | `#d8d8d8` | `#4b5563` |
| `--ring` | `#066AFE` | `#066AFE` |

#### Status / semantic
Each status has a paired `*-bg` and `*-text` so badges/pills always meet contrast in both themes.

| Token | Light | Dark |
|---|---|---|
| `--success` | `#06A59A` | `#2dd4bf` |
| `--destructive` / `-foreground` | `#c23934` / `#fff` | `#ef4444` / `#fff` |
| `--status-ready-bg` / `-text` | `#DEF9F3` / `#056764` | `#0f3f36` / `#99f6e4` |
| `--status-processing-bg` / `-text` | `#EDF4FF` / `#0B5CAB` | `#132b54` / `#bfdbfe` |
| `--status-failed-bg` / `-text` | `#FEF0F3` / `#B60554` | `#4c1d2f` / `#fda4c2` |
| `--status-warning-bg` / `-text` | `#FFF4D6` / `#8A5A00` | `#4A3411` / `#FDE68A` |

#### Chrome
| Token | Light | Dark | Use |
|---|---|---|---|
| `--global-header` | `#001639` | `#0a1020` | Top bar bg in dark variant |
| `--tooltip-ai` | `#032D60` | `#032D60` | AI/branded tooltip bg |
| `--sidebar` | `#ffffff` | `#111827` | Sidebar bg |
| `--sidebar-foreground` | `#2e2e2e` | `#f3f4f6` | |
| `--sidebar-accent` | `#E8F3FD` | `#1f2937` | Active nav row bg |
| `--sidebar-accent-foreground` | `#044099` | `#e5e7eb` | Active nav text |
| `--sidebar-border` | `#e5e5e5` | `#374151` | |
| `--sidebar-primary` | `#066AFE` | `#066AFE` | Active rail color |

#### Charts (oklch scale)
`--chart-1` … `--chart-5` are tuned in oklch for perceptually even hues across light/dark. Use directly when adding charts.

### 1.2 Radius tokens
Base `--radius: 0.5rem` (8px). Tailwind exposes a scale built from it:

| Class | Value |
|---|---|
| `rounded-sm` | `calc(var(--radius) - 4px)` → 4px |
| `rounded-md` | `calc(var(--radius) - 2px)` → 6px |
| `rounded-lg` | `var(--radius)` → 8px |
| `rounded-xl` | `calc(var(--radius) + 4px)` → 12px |
| `rounded-2xl` | `calc(var(--radius) + 8px)` → 16px |
| `rounded-3xl` | `calc(var(--radius) + 12px)` → 20px |
| `rounded-4xl` | `calc(var(--radius) + 16px)` → 24px |

Rules of thumb in this app: cards = `rounded-xl`, modals = `rounded-xl`, buttons = `rounded-full`, badges = `rounded-2xl`, inputs = `rounded` (4px), checkboxes = `rounded-[3px]`.

### 1.3 Spacing & layout

The app sticks to Tailwind's default 4px scale. Frequent values worth knowing:

- **Page gutter**: `px-6` (24px)
- **Section vertical rhythm**: `py-7` (28px) for hero, `py-3` for title bars
- **Card header / content padding**: `p-5 px-6` header, `px-6 pb-5` content
- **Modal padding**: `p-6`
- **Stack gap inside cards**: `gap-3` to `gap-6`
- **Sidebar widths**: collapsed `48px`, expanded `180px`
- **Global header height**: `h-11` (44px); sub-header tabs `h-10`; table head row `h-9`

### 1.4 Shadows

App uses CSS shadows directly rather than tokens. Standard recipes:

```css
/* Card hover lift (light) */
shadow-[inset_0_0_0_2px_var(--primary),0_2px_8px_rgba(2,6,23,0.12)]
/* Card hover lift (dark) */
dark:shadow-[inset_0_0_0_2px_var(--primary),0_2px_10px_rgba(0,0,0,0.35)]
/* Resting card outline */
shadow-[inset_0_0_0_1px_var(--border)]
/* Bottom action bar */
shadow-[0_-2px_8px_rgba(0,0,0,0.06)]
/* Modal */
shadow-xl
/* Avatar focus ring */
shadow-[0_0_0_2px_rgba(0,0,0,0.1)]
```

### 1.5 Motion tokens

Defined in `@theme inline`:

```css
--animate-in: enter 0.15s ease-out;
--animate-out: exit 0.1s ease-in;
--animate-shimmer: shimmer-sweep 3.5s ease-in-out infinite;
--animate-pulse-ring: pulse-ring 2.4s ease-out infinite;
--ease-out-strong:    cubic-bezier(0.23, 1, 0.32, 1);
--ease-overshoot:     cubic-bezier(0.34, 1.56, 0.64, 1);
--ease-in-out-strong: cubic-bezier(0.65, 0, 0.35, 1);
```

Common durations used in components: **150ms** (micro), **200ms** (default), **240–280ms** (collapsibles, overshoot), **3500ms** (shimmer loop).

#### Keyframes shipped in `index.css`
- `pulse-ring` — soft expanding success halo (status dots in progress)
- `shimmer-sweep` — left-to-right gradient sweep (indexing pill, skeletons)
- `retriever-enter` — fade + 8px slide-in from left + slight scale
- `file-row-enter` — fade + 8px slide-down for new table rows
- `check-pop` — overshoot scale-in for completed checkmarks
- `fade-in` — opacity 0 → 1
- `collapsible-down` / `collapsible-up` — height + 4px translate (Radix Collapsible)
- `enter` / `exit` — generic transform-driven enter/exit (used by `tw-animate-css` and Radix)

#### Reusable interaction patterns
- **Pressable feedback**: `active:scale-[0.96]` on every button / card / nav item.
- **Color/transform transitions**: `transition-[color,background-color,transform]` (avoid blanket `transition-all`).
- **Focus ring**: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`.
- **Radix open/close**: pair `data-[state=open]:animate-in` with `fade-in-0 zoom-in-95 slide-in-from-*-2` from `tw-animate-css`.

---

## 2. Typography

### 2.1 Font

```css
--font-sans: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
             Helvetica, Arial, sans-serif;
```

`body` defaults: `font-family: var(--font-sans); font-size: 14px;` with antialiasing on. Components reapply `font-sans` on text-heavy elements (inputs, tables, cards) so they render correctly inside isolated demos.

### 2.2 Text style scale

Concrete styles observed across the app — copy/paste these instead of inventing new sizes.

| Style | Tailwind | Where it shows up |
|---|---|---|
| Page title (collapsed meta) | `text-base font-medium` | Library detail name when collapsed |
| Page title (expanded meta) | `text-[22px] font-medium` | Library detail name when expanded |
| Section hero | `text-xl font-medium text-balance` | "Build agent knowledge in minutes" |
| H3 section | `text-base font-semibold` | "All Libraries" |
| Card title | `text-[15px] font-bold leading-none tracking-tight` | `<CardTitle>`, status/agent-tool headers |
| Modal title | `text-lg font-semibold text-balance` | Confirm dialogs |
| Body | `text-sm font-normal leading-relaxed text-pretty` | Paragraphs, descriptions |
| Body muted | `text-sm text-muted-foreground leading-[1.55]` | Status descriptions |
| Label / form caption | `text-xs font-semibold text-muted-foreground` | shadcn `<Label>` |
| Link | `text-sm text-primary hover:underline` (often inline-flex with arrow icon) | "Learn more" links |
| Button | `text-sm font-semibold` (default) / `text-xs` (sm) | All buttons |
| Tab trigger | `text-sm font-semibold text-primary` | Top app tabs |
| Table head | `text-xs font-semibold text-foreground` | All `<th>` |
| Table cell | `text-sm text-foreground` | All `<td>` |
| Tooltip | `text-xs text-primary-foreground` on `bg-foreground` | All tooltips |
| Code / mono | `font-mono text-sm` (often inside status-tinted bg) | API names, error blocks |
| Tabular numerals | `tabular-nums` | Dates, counts in tables |

### 2.3 Text balance

- Use `text-balance` for headlines and modal titles.
- Use `text-pretty` for body paragraphs.
- Prefer `truncate` on single-line table cells / step labels; pair with `min-w-0` on the parent flex item.

---

## 3. Frontend primitives (`src/components/ui`)

All primitives accept `className` and forward refs. Variants use `cva`. Import via the `@/` alias.

### 3.1 Button — `button.jsx`

Base: `inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none`

| `variant` | Style |
|---|---|
| `brand` (default) | `bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active rounded-full` |
| `neutral` | `bg-background text-foreground border border-input hover:bg-secondary rounded-full` |
| `outlineBrand` | `bg-background text-primary border border-input hover:bg-secondary rounded-full` |
| `ghost` | `hover:bg-accent hover:text-accent-foreground` |
| `icon` | `bg-transparent text-muted-foreground hover:bg-secondary rounded-full` |
| `link` | `text-primary underline-offset-4 hover:underline p-0 h-auto` |
| `destructive` | `bg-background text-destructive border border-destructive hover:bg-destructive/5 rounded-full` |

| `size` | Style |
|---|---|
| `default` | `h-8 px-4` |
| `sm` | `h-7 px-3 text-xs` |
| `lg` | `h-10 px-6` |
| `icon` | `h-8 w-8 p-0` |

### 3.2 Badge — `badge.jsx`

Base: `inline-flex items-center justify-center rounded-2xl px-3 py-0.5 text-sm leading-5 font-medium w-fit`

| `variant` | Use |
|---|---|
| `default` | Brand-colored chip |
| `secondary` | Neutral chip |
| `outline` | Outlined chip |
| `ghost` | Hover-only chip |
| `link` | Inline link-styled chip |
| `success` | Pairs `--status-ready-bg` / `--status-ready-text` |
| `inProgress` | Pairs `--status-processing-bg` / `--status-processing-text` |
| `warning` | Pairs `--status-warning-bg` / `--status-warning-text` |
| `destructive` | Pairs `--status-failed-bg` / `--status-failed-text` |

Map domain status → variant using a small helper (see `MainContent.jsx::StatusIndicator`): `Ready/Deployed → success`, `Processing → inProgress`, `Failed → destructive`, else `default`.

### 3.3 Card — `card.jsx`

Slot exports: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`.

- `Card`: `rounded-lg border border-border bg-card text-card-foreground`
- `CardHeader`: `flex flex-col space-y-1.5 p-5 px-6`
- `CardTitle`: `h3 · text-[15px] font-bold leading-none tracking-tight`
- `CardDescription`: `p · text-sm text-muted-foreground`
- `CardContent`: `px-6 pb-5`
- `CardFooter`: `flex items-center px-6 pb-5`

When using as a collapsible "section card" override to `rounded-xl p-0` and provide your own `CollapsibleTrigger` row (see Status / Agent Tool cards).

### 3.4 Input — `input.jsx`
`h-9 w-full rounded border border-input bg-background px-3 text-sm font-sans` + `focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none`. Disabled = `opacity-50 cursor-not-allowed`.

### 3.5 Textarea — `textarea.jsx`
`min-h-[72px] w-full rounded border border-input bg-background px-3 py-2.5 resize-y` with same focus behavior as Input.

### 3.6 Label — `label.jsx`
`text-xs font-semibold text-muted-foreground leading-none` (Radix `LabelPrimitive`).

### 3.7 Checkbox — `checkbox.jsx`
Custom button-based (not Radix). `h-4 w-4 rounded-[3px]`. Checked: `bg-primary border-primary text-primary-foreground` with a 10px `Check` icon (`strokeWidth={3}`).
Calls both `onCheckedChange(next)` and `onChange(next)`.

### 3.8 Switch — `switch.jsx`
`h-5 w-9 rounded-full` track with a `h-4 w-4` thumb that translates 16px on. Track `bg-primary` when checked, else `bg-input`.

### 3.9 Tabs — `tabs.jsx` (Radix)
- `TabsList`: `inline-flex items-center h-full`
- `TabsTrigger`: `h-full px-3 text-sm font-semibold text-primary` with an animated 3px-tall primary underline on `data-[state=active]` (`after:` pseudo, inset 4px).
- `TabsContent`: `flex flex-1 overflow-hidden`

### 3.10 Tooltip — `tooltip.jsx` (Radix)
`bg-foreground text-primary-foreground text-xs rounded-md px-3 py-1.5 shadow-md`. Default `sideOffset={4}`. Wrap the app once with `<TooltipProvider delayDuration={300}>`.

### 3.11 Dropdown menu — `dropdown-menu.jsx` (Radix)
- Content: `min-w-[8rem] rounded-lg border bg-popover p-1 shadow-lg`
- Item: `flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm focus:bg-accent`
- Separator: `-mx-1 my-1 h-px bg-border`
- Sub-content uses the same surface as content.

### 3.12 Separator — `separator.jsx` (Radix)
`shrink-0 bg-border`. Horizontal: `h-[1px] w-full`. Vertical: `h-full w-[1px]`.

### 3.13 Table — `table.jsx`
- `Table`: wrapped in `relative w-full overflow-auto`; `caption-bottom text-sm border-collapse`
- `TableHeader`: `bg-muted`
- `TableHead`: `h-9 px-3 text-left text-xs font-semibold whitespace-nowrap`
- `TableRow`: `border-b border-border hover:bg-muted` (hover bg is the row affordance)
- `TableCell`: `px-3 py-2.5 align-middle border-b border-border`

Rows used as click targets: add `cursor-pointer` and stop propagation on cell-level interactive widgets (checkboxes, menus).

### 3.14 Collapsible — `collapsible.jsx`
Pure Radix re-export. Content uses `data-[state=open]:animate-[collapsible-down_280ms_cubic-bezier(0.16,1,0.3,1)]` and `data-[state=closed]:animate-[collapsible-up_220ms_cubic-bezier(0.4,0,1,1)]`.

### 3.15 RetrieverPill — `retriever-pill.jsx`
Domain-flavored chip with four variants: `default`, `placeholder` (dashed), `indexing` (shimmer + spinner), `ready` (success-tinted, `Database` icon). Useful as a template for any "live status pill".

---

## 4. Composite patterns

These aren't shipped as primitives but are repeated enough that they're worth lifting verbatim.

### 4.1 Section card with collapsible header
Used by `StatusCard`, `AgentToolCard`, etc.
```jsx
<Collapsible open={open} onOpenChange={setOpen}>
  <Card className="mb-4 overflow-hidden rounded-xl p-0">
    <CollapsibleTrigger className="flex items-center gap-2 py-4 px-6 cursor-pointer bg-transparent border-none w-full text-left hover:opacity-85">
      <span className={`flex items-center transition-transform duration-200 ${open ? 'rotate-0' : '-rotate-90'}`}>
        <ChevronDown size={12} />
      </span>
      <span className="text-[15px] font-bold text-foreground">Title</span>
    </CollapsibleTrigger>
    <CollapsibleContent>
      <div className="px-6 pb-6">…</div>
    </CollapsibleContent>
  </Card>
</Collapsible>
```

### 4.2 Stepper / status timeline (`StatusCard`)
Vertical list of `StepDot` + dashed `StepConnector`. Dot states:

- `default`: `border-2 border-input bg-background`
- `inProgress`: `bg-success/30` + animated `pulse-ring` halo + inner `bg-success` dot
- `ready`: `bg-success` with `Check` overshoot pop
- `error`: transparent dot with `ErrorIcon` overlay in destructive

Connector fills top-to-bottom on `ready` via a `scale-y` transform with `--ease-out-strong` over 280ms. Description text adopts `text-destructive` when the step's status is `error`.

### 4.3 Confirmation modal
```jsx
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
  <div className="w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-xl"
       role="dialog" aria-modal="true">
    <h3 className="m-0 text-lg font-semibold text-balance">Title</h3>
    <p className="mt-2 mb-0 text-sm text-muted-foreground leading-relaxed">…</p>
    <div className="mt-6 flex items-center justify-end gap-2">
      <Button variant="ghost" className="h-9">Cancel</Button>
      <Button variant="destructive" className="h-9">Delete</Button>
    </div>
  </div>
</div>
```

### 4.4 Sticky bulk-action bar
Appears when the table has selections.
```jsx
<div className="flex justify-center gap-3 py-4 px-6 bg-background border-t border-border shadow-[0_-2px_8px_rgba(0,0,0,0.06)]">
  <Button variant="ghost">Cancel</Button>
  <Button variant="destructive"><Trash2 size={14} /> Delete</Button>
</div>
```

### 4.5 Header icon button
Used in `GlobalHeader`. Pattern: `bg-transparent border-none p-1.5 rounded` + `before:absolute before:inset-[-5px] before:content-['']` to enlarge the hit target without changing visual size. Hover swaps to `bg-surface-hover` (or `bg-white/10` in dark chrome).

### 4.6 Sidebar nav item
Two states share padding/gap; only the left rail and weight change:

- **Inactive**: `text-sm font-normal text-sidebar-foreground border-l-4 border-l-transparent hover:bg-surface-hover`
- **Active**: `text-sm font-semibold text-sidebar-accent-foreground bg-sidebar-accent border-l-4 border-l-primary hover:bg-primary-light`

When `collapsed`, swap to `border-l-2`, `justify-center`, drop the label.

### 4.7 Data source / empty-state card (`DataSourceCard`)
```jsx
<button className="group flex flex-col justify-end bg-card rounded-lg p-4 min-h-[108px] gap-3
  shadow-[inset_0_0_0_1px_var(--border)]
  hover:shadow-[inset_0_0_0_2px_var(--primary),0_2px_8px_rgba(2,6,23,0.12)]
  active:scale-[0.96] transition-[box-shadow,transform]">
  …
</button>
```
The `inset` box-shadow is preferred over `border` here so the hover state can thicken the outline without re-laying out the card.

### 4.8 Inline expanding search
Toggle between an icon button and a 200px input with the `animate-in fade-in slide-in-from-right-2 duration-150` utility classes. Collapse on `Escape` and on `blur` when empty.

---

## 5. Iconography

- **System icons**: `lucide-react`. Default sizes: `12` (chevrons in headers), `14` (inline / buttons), `16` (icon buttons), `18` (header chrome).
- **Brand & domain icons**: hand-rolled SVGs in `src/assets/icons.jsx` (e.g. `ArrowUpRight`, `ErrorIcon`, `RetrieverIcon`, `AgentAstroIcon`, `UserAvatar`, `SalesforceCloudLogo`).
- **Color**: icons inherit `currentColor`; tint via `text-*` utilities. Inside dark mode, raster icons get `dark:invert dark:brightness-200` when needed.

`ArrowUpRight` (size 11) is the standard "external/inline link" affordance — pair it with link text using `inline-flex items-center gap-1`.

---

## 6. Theming

```jsx
// App.jsx — persisted dark mode toggle
const [isDarkMode, setIsDarkMode] = useState(() => {
  const saved = localStorage.getItem('theme')
  if (saved === 'dark') return true
  if (saved === 'light') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
})
useEffect(() => {
  document.documentElement.classList.toggle('dark', isDarkMode)
  localStorage.setItem('theme', isDarkMode ? 'dark' : 'light')
}, [isDarkMode])
```

Every token has a `.dark` override in `index.css`. Component code references the semantic token (`bg-card`, `text-foreground`, `bg-[var(--status-ready-bg)]`) — never hard-coded hexes — so no per-component branching is needed.

---

## 7. Porting checklist

When dropping this system into a new project:

1. Copy `src/index.css` (tokens, keyframes, `@theme inline` block) and import it in your entry.
2. Install the dependency set from §0.
3. Add `vite.config.js` aliases (`@` → `./src`) and the `@tailwindcss/vite` plugin.
4. Copy `src/lib/utils.js` (`cn`).
5. Copy `src/components/ui/*` — they are framework-agnostic and only depend on Radix + the tokens above.
6. Wrap the app in `<TooltipProvider delayDuration={300}>` and toggle `dark` on `<html>` for theming.
7. Reuse the §4 composite patterns rather than rebuilding them — they already encode the motion + spacing + state colors.

Anything outside `src/components/ui` and `src/lib` is product-specific and should be re-derived against your new domain.
