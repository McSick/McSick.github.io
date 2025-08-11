# Fantasy Roguelite — Feature-Organized (Classic Scripts)

This refactor groups the original code by **feature** while keeping classic `<script>` tags (globals) so nothing breaks.

## Folder layout

- `src/core/` — canvas sizing, audio, global state, game flow, run setup, (optional) self-tests
- `src/assets/` — atlas/frame data, sprite definitions, story stage data
- `src/map/` — tile types, room generation and motif logic
- `src/combat/` — classes/talents, armor, abilities, turn engine
- `src/ui/` — HUD/effects, modals, renderer
- `src/input/` — touch input handlers, targeting helpers, keyboard and "smart self-cast"

Scripts load in dependency order at the bottom of `index.html`.

## Next step: Real ES Modules

If/when you want **real** ES modules:

1. Create `src/core/globals.ts` (or `.js`) that exports `State`, `Map`, canvas metrics, etc.
2. Convert each file to export its public API and import what it uses from `core/globals` or peers.
3. Replace `<script>` tags with a single `<script type="module" src="src/main.js"></script>` that imports the modules in order.
4. Optionally add Vite/ESBuild for bundling and dev server.

We can do that incrementally, file-by-file, without downtime.
