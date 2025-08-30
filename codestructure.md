# Code Structure Summary

High-level: A browser-based grid roguelite. Everything is plain JS loaded in `<script>` tags; no bundler. `index.html` sets up the canvas + HUD + modals. Game logic is split by domain: core (engine loop, state, utilities), assets (static data), combat (RPG systems), map (tiles + procedural generation / room handling), input (touch + keyboard + ability targeting), and ui (rendering + modals + HUD/effects).

## Root
- `index.html` – HTML shell. Declares canvas (`#game`), HUD stats (room, HP bar, gold, class, pages, armor, stage progress, ability info), control buttons (loadout, help, mute, restart), on‑screen d‑pad + ability bar, generic modal container. Loads every JS file in the required original order.
- `styles.css` – (Not inspected here) Layout/visual styles for HUD, modal, buttons, bars.
- `tileset.png` – Sprite atlas image consumed by atlas asset helpers.

## /src/core
- `util.js` – General helpers & lightweight game service functions. Examples: constants for long‑press detection; persistent `SETTINGS` wrapper around `localStorage`; math helpers (`rand`, `choice`, `clamp`); `victoryCheck()` flow after battles; (likely below) shared algorithms (LOS, pathing, status effect utilities, float text helpers, etc.). Acts as a common dependency for most other modules.
- `canvas.js` – Canvas setup & sizing logic. Grabs `<canvas id="game">`, applies DPR scaling, computes grid metrics (`GRID_W/H`, `TILE`, offsets, SCALE). Establishes rendering coordinate system used everywhere else.
- `audio.js` – Sound effect system (SFX registry, simple synth / WebAudio wrappers) and mute toggle logic (referenced by mute button + combat events like hits).
- `state.js` – Central mutable `State` singleton: player stats (position, HP, abilities, shields, effects, pages, class, armor & mods, talents, sprite set, motion ticks), enemies array, turn tracking, selection (current targeted ability + tile), floor/stage progression bookkeeping, story indices, extra action counter, room type. Serves as the authoritative game state bag.
- `flow.js` – High-level game flow orchestration: starting runs, generating next room/stage, entering combat, resolving loot selection, stage progress updates, game over handling, victory progression, and calling `loop()` from render setup.
- `run_setup.js` – Bootstrapping executed after all other modules load: attaches UI event listeners, populates initial abilities or class choices, calls initial render/update routines, registers resize/mute/help/restart handlers.
- `self_tests.js` – Optional sanity checks / quick diagnostic routines (e.g., verifying ability generation invariants, line-of-sight correctness, or effect application) executed in dev mode or via console.
- `util.js` (extended portions not shown) also likely defines: line-of-sight (`hasLineOfSight`), tile blockers (`blocked`), effect add/remove (`addEffect`, `hasEffect`), pathfinding helpers (`nextStepTowards`), text/effect visuals (`addFloatText`, `screenShake`), FX state container, toast system.

## /src/assets
- `atlas_0x72_tileset_png.js` – Defines sprite frame metadata referencing `tileset.png`: frame names, source rectangles, and `drawFrame()` helper tied to SCALE, plus class/enemy sprite set descriptors (idle/run prefixes, frame counts) used by `render.js`.
- `enemies_sprites.js` – Enemy sprite set declarations (per enemy type and boss) and likely enemy stat templates (base HP, damage, AI flags). Provides data consumed when spawning enemies or drawing them (`e.set`).
- `story_stages.js` – Narrative & stage progression data: `STAGES` array (themes, encounter tables, boss definitions, flavor text/story beats, environmental tile mixes) plus maybe reward tables.

## /src/map
- `tiles_map.js` – Tile type enum (`TILES`), current room grid, and generation logic for different room archetypes (battle, treasure/loot, heal, story, boss). Handles hazard placement (lava, spikes, bushes/stealth puddles), pickups (books for pages, heal flasks), and tile interaction helpers (`tileAt`, `applyTileOnEnter`).

## /src/combat
- `abilities_unchanged.js` – Procedural ability generator. Defines rarity tiers with weights & multipliers, name components (PREFIX, ELEMENT, BASE), and `makeAbility()` producing ability objects (attack / heal / shield / move / stealth / tome) with stats (dmg, heal, shield, range, cooldown, hits, element, description) applying class modifications via `CLASSES[<class>].onMakeAbility`. Also exports `newAbilitySet()` for offering loot choices.
- `armor.js` – Armor item definitions and selection/reward logic; applies armor mods to player (e.g., stealth duration bonuses, defensive stats); likely integration with loot modal.
- `classes_talents.js` – Player class definitions (`Wizard`, `Rogue`, `Fighter`, `Cleric`) with passive hooks (`onStart`, `onMakeAbility`, `passiveEndTurn`, `passiveOnHeal`, `passiveOnKill`) and talent lists (each granting flags stored in `player.talents`). Also contains `cleanseOne()` utility for debuff removal (used by Cleric passive).
- `turns.js` – Turn engine. Functions: `startPlayerTurn()`, `endPlayerTurn()`, `enemyTurn()`. Handles effect processing (`processStartEffects`, `processEffects`), cooldown ticking, passives (Rogue stealth upkeep, Fighter haste on kill, Cleric Mercy talent 20% cooldown refund), applying damage/healing/shield depletion, enemy pathing (`nextStepTowards`), attack resolution (including riposte), death filtering, victory checks, HUD refresh, and turn switching.

## /src/input
- `input.js` – Core input routing: selecting ability buttons, handling tap/click on grid coordinates, initiating targeting mode (`State.selection`), confirming ability casts, cancelling selection, delegating to specialized helpers (tap or keyboard) and performing ability resolution.
- `tap_targeting.js` – Touch/mouse specific logic: translates pointer positions to grid cells using offsets/TILE size, long-press detection (uses constants from `util.js`), visual feedback for ability previews, and triggers ability or movement actions.
- `keyboard_input.js` – Keyboard controls: arrow/WASD movement, number hotkeys for abilities, space/enter to confirm, escape to cancel, plus any accessibility shortcuts (restart, help, mute).
- `smart_self_cast_helper_reuse_the_normal_targeting_path.js` – Helper that reuses the generic targeting pipeline to implement self-cast behaviors (heals, shields, stealth) without separate bespoke code paths, ensuring consistent highlighting and resolution.

## /src/ui
- `effects_hud_helpers.js` – Shared HUD & effect utilities: `updateHUD()` (sync DOM elements for HP bar, gold, class, pages, armor, stage progress), status effect ticking/formatting, `addEffect`/`hasEffect` wrappers, shield/stealth text, possibly `tickEndTurnBuffs`, `processStartEffects`, `processEffects` used by `turns.js`.
- `modal_ui.js` – Generic modal system: open/close logic for loot, talent, armor, help dialogs; dynamic content & buttons injected into `#modalContent`/`#modalFooter`; traps focus / handles dismissal; likely functions like `openLootModal()` referenced in `victoryCheck()`.
- `inspect_modal.js` – Renders enlarged ability/item inspection details on long‑press/hover (full description, rarity color, stats breakdown) inside modal or a tooltip-style card.
- `status_badges.js` – Draw-layer or DOM HUD overlay for per-entity status icons (burn, poison, bleed, shock, freeze, stun, stealth, shield) rendered above units (called via `drawStatusBadges(e)` inside `render.js`).
- `render.js` – Main render loop & scene drawing. Functions: `drawGrid()` (background gradient, tiles, hazards, selection highlight with LOS/bocked cells feedback, enemies with animation & HP bars, player sprite + shields + stealth overlay, floating combat text, turn banner, toasts, screen hit flash). Maintains `tick` counter and runs animation damping for shake/hit flash. Starts continuous `requestAnimationFrame(loop)` in an unseen `loop()` call invoked from setup (`flow.js` or `run_setup.js`).
- `inspect_modal.js` + `modal_ui.js` integrate with ability hover text shown in `#abilityInfo` and long‑press detection from input.
- `cutscenes.js` – Lightweight narrative / dialogue system. Exposes `startCutscene(key, { onDone })` & `isCutsceneActive()`. A `CUTSCENES` map defines arrays of step objects. Each step supports a legacy single‑portrait form `{ speaker, text, img, side }` or extended dual‑portrait & background form:
	- `speaker` (string) – label shown above dialogue box.
	- `text` – supports `\n` line breaks + simple markup: `*italic*`, `**bold**`.
	- `bg` – (optional) full‑screen background image path; persists until replaced.
	- `leftImg` / `rightImg` – (optional) portrait image paths; persist between steps so only changes need re‑specifying.
	- `active` – `'left' | 'right'` to glow the speaking portrait and dim the other.
	- `effect` – reserved future hook (e.g., shake/flash).
	- Legacy fields `img` + `side` auto‑map to `leftImg` / `rightImg` if extended fields are not present.
	Runtime state stores persistent `bg`, `leftSrc`, `rightSrc` so you can build long conversations cheaply. Clicking backdrop, pressing Enter/Space advances; Esc skips. On completion, `onDone` callback (used in `startRun()` flow) resumes normal UI (e.g., opens class select). CSS additions provide layered background (`.cutBg`), portrait fade/slide‑in, active/inactive highlight, and responsive layout.

## Cross-cutting Concepts
- Effects System – Entities have `effects` arrays storing timed buffs/debuffs (STEALTH, HASTE, BURN, POISON, BLEED, SHOCK, FREEZE, STUN, etc.). Helper functions manage application, stacking, decay at start/end of turns, and interactions (e.g., Rogue applying STEALTH, Fighter HASTE, Cleric cleansing debuff on heal).
- Ability Lifecycle – Generated via `makeAbility()`, optionally modified by class `onMakeAbility`. When selected, `State.selection` stores `{ ab, targeting }`, render highlights valid tiles (range + LOS), and input handlers confirm execution applying damage/heal/shield, adjusting cooldowns, triggering passives (Flurry extra hit, Tome page spend, ArcaneBattery refunds, etc.).
- Enemy AI Loop – Each enemy processes effects, moves one step toward player via path helper while avoiding blockers, applies damage if adjacent, may die and get pruned; upon all enemies dead `victoryCheck()` opens loot.
- Progression – `STAGES` define sets of floors culminating in boss; stage progress bar updated via HUD; loot after combat offers abilities/armor/pages; pages used by Tome ability; talents selected via modal.
- Rendering Data Pipeline – Sprite atlas metadata -> `drawFrame()` -> `render.js` composition of layers; calculations rely on shared grid constants from `canvas.js`.
- Persistence – Minimal: user setting `showHelpOnNewRun` stored in `localStorage` plus possibly mute state.
- Narrative / Cutscene System – `cutscenes.js` sits outside the modal system to give a cinematic overlay: persistent background + dual portraits with highlight, advancing via button/keyboard/backdrop click. Integrates with run bootstrap (`run_setup.js`) to optionally play an intro sequence before class selection. Designed to be data‑driven so adding new story beats only requires appending arrays in `CUTSCENES`.

## File Load Order Importance
Scripts load in a specific order so global symbols exist when referenced (no modules/imports). Core utils/state must precede systems depending on them (combat, UI, input). Rendering and flow run after everything so they can access all helpers.

## Potential Improvement Opportunities (Optional)
- Convert globals to ES modules for clearer dependencies.
- Introduce a simple build step (Rollup/Vite) for tree-shaking & minification.
- Encapsulate `State` mutations behind functions to reduce accidental coupling.
- Formalize an event bus instead of ad-hoc direct calls (e.g., victory, damage, effect applied).
- Add unit tests for ability generation, LOS, and effect tick order (currently in `self_tests.js`).

---
This summary reflects inferred roles based on inspected snippets and naming conventions across the split source files.
