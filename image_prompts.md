
Global style baseline (prepend to all) high-detail fantasy anime illustration, crisp refined line art, gentle painterly shading, subtle rim light, balanced vibrant color palette, soft atmospheric depth, 4k, sharp focus, no text, no watermark

Negative prompt (append / use in negative box) blurry, low detail, extra limbs, extra arms, extra hands, mangled hands, mutated anatomy, distorted face, text, watermark, logo, signature, frame, border, jpeg artifacts, multiple heads, cropped head, glitch

SECTION A: Character portrait prompts (plain background) General template (replace {CHAR}, {TRAITS}, {EXPRESSION}): {CHAR} character portrait, waist-up, facing slightly {ANGLE}, {TRAITS}, {EXPRESSION}, neutral flat seamless light-gray background, studio lighting, clean edges, global style

Angle suggestions rotate across characters to avoid identical feel: (1) 3/4 left, (2) 3/4 right, (3) frontal, (4) slight upward perspective.

Protagonist (base reference) Bewildered isekai adventurer, short tousled dark hair with a single silver streak, lean athletic build, light leather travel tunic + subtle azure rune trims, simple sword hilt over shoulder, faint azure mana glow in eyes, calm determined expression, 3/4 left, neutral flat pale-gray background, global style

Protagonist (confident) Same character design, soft confident half-smile, subtle forward lean, hands loosely at belt, 3/4 right, neutral flat pale-gray background, global style

Protagonist (battle focus) Same design, intense narrowed eyes, a few scuff marks, faint floating motes of blue energy around shoulders, frontal, neutral flat pale-gray background, global style

Guide (base) Enigmatic robed archivist, layered teal and ivory rune-etched robes, luminous monocle over one eye, floating closed tome at shoulder level, serene warm smile, 3/4 right, neutral flat light-gray background, global style

Guide (serious) Same design, monocle glowing brighter, brows slightly furrowed, faint amber glyph halo behind head (keep subtle), frontal, neutral flat light-gray background, global style

Rival (base) Agile spear fighter, charcoal segmented light armor with crimson accents, wind-swept medium-length hair, confident smirk, spear angled behind, 3/4 left, neutral flat light-gray background, global style

Rival (agitated) Same design, rain speckled armor (light suggestion), tense jaw, sparks of ember energy drifting, frontal, neutral flat light-gray background, global style

Healer / Support (base) Cheerful alchemist, mint and gold short cloak, layered belts with potion vials glowing pastel, soft green aura, bright encouraging smile, 3/4 right, neutral flat light-gray background, global style

Healer (concerned) Same design, worried expression, holding a glowing pastel pink vial near chest, frontal, neutral flat light-gray background, global style

Antagonist (base) Tall figure in flowing shadow-cloak dissolving into faint cinders, obsidian mask with vertical amethyst slit, faint violet backglow silhouette, emotionless presence, frontal, neutral very dark gray background (not pure black) for cutout, global style

Antagonist (power flare) Same design, cloak edges lifting as if in unseen wind, amethyst slit blazing brighter, subtle concentric dark energy rings, 3/4 right, neutral very dark gray background, global style

Optional transparent background variant Duplicate any portrait prompt and replace neutral flat light-gray background with transparent background, isolated subject, (some models: “alpha channel” or “blank background”). If unsupported, keep a single solid #cfd2d8 light gray tone for easy manual removal.

Emotion quick variants (append near expression):

surprised gasp
subtle blush
restrained anger
resolute determination
weary but hopeful
File naming suggestions (portraits) src/assets/cutscenes/char_protagonist_base.png char_protagonist_confident.png char_protagonist_battle.png char_guide_base.png char_guide_serious.png char_rival_base.png char_rival_agitated.png char_healer_base.png char_healer_concerned.png char_antagonist_base.png char_antagonist_power.png (or add _t, _l, _r if later mirroring needed)

SECTION B: Background plate prompts (no characters) General template: Wide background environment, {SCENE DESCRIPTION}, immersive lighting, cinematic composition, no characters, no figures, no silhouettes, global style

Summoning chamber Ancient arcane summoning hall, concentric rune circles inlaid in worn stone floor, suspended crystal braziers emitting cool blue light shafts, faint dust motes, towering shadowed pillars, no characters, global style

Floating archive Vertical spiraling library of floating shelves, scrolls and tomes orbiting a central luminous crystal core, warm amber + teal mixed glow, soft volumetric mist, no characters, global style

Forest dungeon entry Mossy cyclopean archway half-swallowed by bioluminescent vines, faint turquoise fungi clusters, distant depth into darkness, dripping moisture glints, no characters, global style

Cliff rain confrontation Stormy mountain pass, jagged wet stone, sheets of diagonal rain, low clouds swirling below precipice, occasional distant lightning glow, no characters, global style

Ruined bridge chasm Half-collapsed stone bridge over fog-filled abyss, broken segments suspended by faint magical embers, cold desaturated palette with subtle cyan highlights, no characters, global style

Crystal relic chamber Circular cavern, central crystalline pedestal emitting prismatic refracted light beams, floating dust and gently levitating pebbles, iridescent wall reflections, no characters, global style

Sky bazaar town Multi-tier aerial marketplace platforms connected by rope bridges, colorful tapestry banners fluttering, distant airships, warm late afternoon sun haze, no characters, global style

Night camp clearing Quiet forest clearing at night, banked campfire embers (no people), soft warm light pool contrasting cool moonlit trees, faint rising sparks, star-dense sky, no characters, global style

Wyrm cavern Vast subterranean cavern with massive crystal stalactites, turquoise-magenta bioluminescent pools, distant coiled serpentine fossil silhouette suggestion (not a living creature), no characters, global style

Nexus gate fork Mystic nexus platform, bifurcated portal: left side lush verdant golden glow, right side stellar void with constellations, floating rune rings overhead, no characters, global style

Shadow throne hall Obsidian hall, tall arch windows leaking faint violet haze, fractured mirror floor reflecting dim braziers, looming empty throne framed by vertical crystal shards, no characters, global style

Epilogue dawn cliff High overlook above rolling cloud sea at sunrise, warm gold-pink horizon gradient, fluttering wild grass in foreground, distant floating islets, no characters, global style

Background file naming src/assets/cutscenes/bg_summoning_chamber.png bg_library_archive.png bg_forest_entry.png bg_cliff_rain.png bg_ruined_bridge.png bg_relic_chamber.png bg_sky_bazaar.png bg_camp_night.png bg_wyrm_cavern.png bg_nexus_gate.png bg_shadow_throne.png bg_dawn_cliff.png

SECTION C: Consistency tips

Generate all base portraits first, lock seeds / settings, reuse for expression variants.
Keep camera distance constant (waist-up) for uniform scaling.
Avoid dramatic backlighting that obliterates silhouette edges (helps cutout).
If model injects unwanted props, add: no extra accessories, no foreground objects to negative prompt.
SECTION D: Quick insertion example (cutscene step) { speaker: 'Guide', text: 'You were summoned. Worlds are fracturing.', bg: 'src/assets/cutscenes/bg_summoning_chamber.png', leftImg: 'src/assets/cutscenes/char_protagonist_base.png', rightImg: 'src/assets/cutscenes/char_guide_base.png', active: 'right' }