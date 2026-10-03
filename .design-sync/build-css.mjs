// Compiles the app's Tailwind v4 stylesheet (src/app/globals.css) into a static
// CSS file for design-sync. Tailwind scans the repo from cwd, so run from the repo root.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import postcss from 'postcss'
import tailwind from '@tailwindcss/postcss'

const from = 'src/app/globals.css'
const to = '.design-sync/.cache/huddle.css'
const result = await postcss([tailwind({ base: process.cwd() })]).process(readFileSync(from, 'utf8'), { from, to })
mkdirSync('.design-sync/.cache', { recursive: true })
writeFileSync(to, result.css)
console.log(`wrote ${to} (${result.css.length} bytes)`)
