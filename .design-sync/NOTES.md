# design-sync notes — Huddle

Huddle is a Next.js 16 **app**, not a component library: no Storybook, no `dist/`. The sync ships a curated set of prop-driven components.

## How the build is wired
- **Entry**: `.design-sync/entry.ts` re-exports the synced components (default exports renamed) plus `fmt`, `CATEGORIES`, `MEMBER_COLORS`, `MONTHS`, `CURRENCY`. Add or remove components there AND in `componentSrcMap`, and add a `docs/<Name>.md` and `previews/<Name>.tsx` for each.
- **CSS**: `cfg.buildCmd` (`node .design-sync/build-css.mjs`) compiles `src/app/globals.css` with `@tailwindcss/postcss` into `.design-sync/.cache/huddle.css` (= `cfg.cssEntry`). Run it from the repo root before every sync. Tailwind scans the repo, so only classes used in `src/` or `.design-sync/previews/` ship.
- **Groups**: `srcDir` points at `.design-sync/docs` on purpose. If it points at `src/`, the converter groups by source folder (`budgetherocard`, `historyheader`, …) and ignores the doc `category:` frontmatter. Props come from `cfg.dtsPropsFor` (ts-morph extraction returned `[key: string]: unknown` for these default-export components). **Keep `dtsPropsFor` in step with the source props.**
- Run commands: `node .ds-sync/package-build.mjs --config .design-sync/config.json --node-modules ./node_modules --out ./ds-bundle` (the entry comes from `cfg.entry`). Playwright **1.61.0** matches the cached chromium-1228.

## Excluded on purpose
- `EarlierMonthsList`, `BottomNav`, `GroupSwitcher`: they import `next/link` / `next/navigation`. Bundling `next/link` throws `process is not defined` (`process.env.__NEXT_*`), and they need the Next router context.
- All `*Section`, `*HeroCard`, `CategoryRing`, `MonthTabs`, `MemberList`, etc.: server components that fetch through `data.ts` / Supabase. Syncing them would need presentational splits in the app.
- Forms (`ExpenseAddForm`, `BudgetSetForm`, `GroupsNewForm`, `ProfileView`): Supabase client + router.

## Known render warns / app findings
- **`Sk` + `className="rounded-full"` renders as a rounded square**, in production too: `Sk` hard-codes `rounded-xl`, and Tailwind emits `.rounded-xl` after `.rounded-full`. The 4 dashboard skeletons show square-ish avatar placeholders because of this. Previews are faithful, and the docs tell the agent to use `style.borderRadius`. Fix in the app: make `Sk` default to `rounded-xl` only when no rounded class is passed (or use `tailwind-merge`).
- `TxnList`, `ShareButton`: `cardMode: column` (grid overflow).
- `[FONT_REMOTE]` Plus Jakarta Sans loads from Google Fonts at runtime (no local font files ship).

## Re-sync risks
- `dtsPropsFor` is hand-written and goes stale silently if a component's props change.
- Docs in `.design-sync/docs/` hard-code colour hexes and the `CATEGORIES` table; re-check them against `src/lib/constants.ts`.
- `conventions.md` lists Tailwind classes that exist only because the app uses them. If a class disappears from `src/`, it drops out of the CSS; re-validate the header after big UI refactors.
- Grades were all done from absolute-rubric captures; there is no reference render.
