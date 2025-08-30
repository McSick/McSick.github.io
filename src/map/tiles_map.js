const TILES = {
  FLOOR: 0,
  WALL: 1,
  LAVA: 2,
  BUSH: 3,
  BOOK: 4,
  HEAL: 5,
  SPIKES: 6,
};
const THEMES = [
  {
    key: "Ember Vault",
    tiles: [TILES.LAVA, TILES.SPIKES],
    wallDensity: 0.08,
  },
  { key: "Library", tiles: [TILES.BOOK], wallDensity: 0.1 },
  { key: "Overgrown Crypt", tiles: [TILES.BUSH], wallDensity: 0.1 },
  { key: "Sanctum", tiles: [TILES.HEAL], wallDensity: 0.06 },
  { key: "Catacombs", tiles: [], wallDensity: 0.14 },
];
const Map = {
  tiles: Array.from({ length: GRID_H }, () =>
    Array.from({ length: GRID_W }, () => TILES.FLOOR)
  ),
  theme: "Catacombs",
};
const inBounds = (x, y) => x >= 0 && y >= 0 && x < GRID_W && y < GRID_H;
function tileAt(x, y) {
  if (!inBounds(x, y)) return TILES.WALL;
  const row = Map.tiles[y];
  if (!row) return TILES.FLOOR;
  const t = row[x];
  return t === undefined ? TILES.FLOOR : t;
}
const blocked = (x, y) => tileAt(x, y) === TILES.WALL;
// --- Line of Sight helpers ---

// What tiles block vision? (add BUSH if you want shrubs to block too)
const SIGHT_BLOCKERS = new Set([TILES.WALL]); // , TILES.BUSH

function occludesSight(x, y) {
  const t = tileAt(x, y);
  return SIGHT_BLOCKERS.has(t);
}

// Bresenham LOS across grid cells. Checks *intermediate* cells only.
function hasLineOfSight(x0, y0, x1, y1) {
  let x = x0, y = y0;
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let dx = Math.abs(x1 - x0);
  let dy = -Math.abs(y1 - y0);
  let err = dx + dy;

  while (true) {
    if (x === x1 && y === y1) return true; // reached target, LOS ok

    // step one cell
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x += sx; }
    if (e2 <= dx) { err += dx; y += sy; }

    // if we just stepped onto the target, allow (don’t treat target as blocking)
    if (x === x1 && y === y1) return true;

    // any *intermediate* tile that blocks vision → no LOS
    if (occludesSight(x, y)) return false;
  }
}

const hazardous = (x, y) =>
  [TILES.LAVA, TILES.SPIKES].includes(tileAt(x, y));
const aiPassable = (x, y) => inBounds(x, y) && !blocked(x, y);

function genRoom() {
  Map.tiles = Array.from({ length: GRID_H }, () =>
    Array.from({ length: GRID_W }, () => TILES.FLOOR)
  );
  const theme = choice(THEMES);
  Map.theme = theme.key;
  // scatter walls
  for (
    let i = 0;
    i < Math.floor(GRID_W * GRID_H * theme.wallDensity);
    i++
  ) {
    const x = rand(0, GRID_W - 1),
      y = rand(0, GRID_H - 1);
    Map.tiles[y][x] = TILES.WALL;
  }
  // motif
  const motif = choice(["pillars", "cross", "ring", "lanes"]);
  if (motif === "pillars") {
    for (let y = 1; y < GRID_H; y += 2)
      for (let x = 1; x < GRID_W; x += 2)
        if (Math.random() < 0.5) Map.tiles[y][x] = TILES.WALL;
  } else if (motif === "cross") {
    for (let x = 2; x < GRID_W - 2; x++)
      Map.tiles[Math.floor(GRID_H / 2)][x] = TILES.WALL;
    for (let y = 1; y < GRID_H - 1; y++)
      Map.tiles[y][Math.floor(GRID_W / 2)] = TILES.WALL;
  } else if (motif === "ring") {
    for (let x = 1; x < GRID_W - 1; x++) {
      Map.tiles[1][x] = TILES.WALL;
      Map.tiles[GRID_H - 2][x] = TILES.WALL;
    }
    for (let y = 1; y < GRID_H - 1; y++) {
      Map.tiles[y][1] = TILES.WALL;
      Map.tiles[y][GRID_W - 2] = TILES.WALL;
    }
  } else if (motif === "lanes") {
    for (let y = 0; y < GRID_H; y++)
      if (y % 2 === 0)
        for (let x = 0; x < GRID_W; x++)
          if (Math.random() < 0.25) Map.tiles[y][x] = TILES.WALL;
  }

  // theme specials
  const empties = [];
  for (let y = 0; y < GRID_H; y++)
    for (let x = 0; x < GRID_W; x++)
      if (Map.tiles[y][x] === TILES.FLOOR) empties.push([x, y]);
  empties.sort(() => Math.random() - 0.5);
  const count = Math.min(6, Math.floor(empties.length * 0.12));
  for (let i = 0; i < count; i++) {
    const [x, y] = empties[i];
    const t = choice(theme.tiles);
    if (t !== undefined) Map.tiles[y][x] = t;
  }

  // clear spawns
  Map.tiles[Math.floor(GRID_H / 2)][1] = TILES.FLOOR;
  Map.tiles[Math.floor(GRID_H / 2)][GRID_W - 2] = TILES.FLOOR;

  // Ensure full connectivity of all non-wall tiles so nothing is isolated.
  ensureConnectivity();
}

// Guarantee every non-wall tile is reachable from the primary spawn (mid-left).
function ensureConnectivity() {
  const startX = 1, startY = Math.floor(GRID_H / 2);
  if (Map.tiles[startY][startX] === TILES.WALL) Map.tiles[startY][startX] = TILES.FLOOR;

  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];

  const passable = (x,y) => Map.tiles[y][x] !== TILES.WALL;

  function flood() {
    const visited = Array.from({length: GRID_H},()=>Array(GRID_W).fill(false));
    const q = [[startX,startY]];
    visited[startY][startX] = true;
    const visitedList = [[startX,startY]];
    while(q.length){
      const [x,y] = q.shift();
      for (const [dx,dy] of dirs){
        const nx = x+dx, ny = y+dy;
        if (nx>=0 && ny>=0 && nx<GRID_W && ny<GRID_H && !visited[ny][nx] && passable(nx,ny)) {
          visited[ny][nx] = true;
            visitedList.push([nx,ny]);
          q.push([nx,ny]);
        }
      }
    }
    return { visited, visitedList };
  }

  function totalPassable() {
    let c=0;
    for (let y=0;y<GRID_H;y++) for (let x=0;x<GRID_W;x++) if (passable(x,y)) c++;
    return c;
  }

  let { visited, visitedList } = flood();
  const targetCount = totalPassable();

  // Helper find first unvisited passable tile
  function findUnvisited() {
    for (let y=0;y<GRID_H;y++) for (let x=0;x<GRID_W;x++) if (passable(x,y) && !visited[y][x]) return [x,y];
    return null;
  }

  // Connect components by carving a straight Manhattan corridor to nearest visited tile.
  while (true) {
    const next = findUnvisited();
    if (!next) break; // all connected
    const [ux,uy] = next;
    // pick nearest visited tile (Manhattan)
    let best = null; let bestD = Infinity;
    for (const [vx,vy] of visitedList) {
      const d = Math.abs(vx-ux)+Math.abs(vy-uy);
      if (d < bestD) { bestD = d; best = [vx,vy]; }
    }
    if (!best) break; // safety
    let cx = ux, cy = uy;
    // carve from unvisited tile toward best until we intersect visited region
    while (!visited[cy][cx]) {
      if (Map.tiles[cy][cx] === TILES.WALL) Map.tiles[cy][cx] = TILES.FLOOR; // carve
      // step horizontally or vertically towards target
      const [tx,ty] = best;
      if (cx !== tx) cx += cx < tx ? 1 : -1; else if (cy !== ty) cy += cy < ty ? 1 : -1;
      if (cx<0||cy<0||cx>=GRID_W||cy>=GRID_H) break; // safety
    }
    // Recompute visited after carving
    ({ visited, visitedList } = flood());
    if (visitedList.length >= targetCount) break;
  }
}

function applyTileOnEnter(entity) {
  const t = tileAt(entity.x, entity.y);
  if (t === TILES.BUSH) {
    const bonus =
      entity === State.player
        ? State.player.armorMods?.stealthPlus || 0
        : 0;
    addEffect(entity, EFFECTS.STEALTH, 2 + bonus); // was 1; now persists past end-turn decay
    addFloatText(entity.x, entity.y, "Hiding", "#9ad5ff", 40);
  }

  if (t === TILES.BOOK && entity === State.player) {
    State.player.pages++;
    addFloatText(entity.x, entity.y, "+Page", "#c8b8ff", 40);
    SFX.beep("loot");
  }
  if (t === TILES.HEAL) {
    const amt = 5;
    entity.hp = clamp(
      entity.hp + amt,
      0,
      entity.maxHp || entity.hp + amt
    );
    addFloatText(entity.x, entity.y, `+${amt}`, "#7cf59a", 40);
  }
  if (t === TILES.LAVA) {
    addEffect(entity, EFFECTS.BURN, 2, 4);
  }
  if (t === TILES.SPIKES) {
    entity.hp -= 4;
    addFloatText(entity.x, entity.y, "-4", "#f5b5b5", 40);
  }
}

// ========= state =========
