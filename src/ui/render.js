let tick = 0;
function drawGrid() {
  ctx.save();
  if (FX.shake > 0) {
    ctx.translate(
      (Math.random() - 0.5) * FX.shake,
      (Math.random() - 0.5) * FX.shake
    );
    FX.shake *= 0.92;
    if (FX.shake < 0.2) FX.shake = 0;
  }
  // vignette bg
  const g = ctx.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    10,
    canvas.width / 2,
    canvas.height / 2,
    Math.max(canvas.width, canvas.height) / 1.2
  );
  g.addColorStop(0, "#101635");
  g.addColorStop(1, "#060914");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // draw tiles (floor + overlays)
  const floorNames = [
    "floor_1",
    "floor_2",
    "floor_3",
    "floor_4",
    "floor_5",
    "floor_6",
    "floor_7",
    "floor_8",
  ];
  const spikeFrames = [
    "floor_spikes_anim_f0",
    "floor_spikes_anim_f1",
    "floor_spikes_anim_f2",
    "floor_spikes_anim_f3",
  ];
  const spikeName = spikeFrames[Math.floor(tick / 12) % 4];

  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < GRID_W; x++) {
      // base floor
      const base = floorNames[(x + y * 3) % floorNames.length];
      drawFrame(base, x, y, SCALE);

      const t = tileAt(x, y);
      if (t === TILES.WALL) {
        drawFrame("wall_mid", x, y, SCALE);
      }
      if (t === TILES.SPIKES) {
        drawFrame(spikeName, x, y, SCALE);
      }
      if (t === TILES.LAVA) {
        // visually: a hole + ember glow
        drawFrame("hole", x, y, SCALE);
        ctx.globalAlpha = 0.25;
        ctx.fillStyle = "#ff6a00";
        ctx.fillRect(
          offX + x * TILE + 4,
          offY + y * TILE + 4,
          TILE - 8,
          TILE - 8
        );
        ctx.globalAlpha = 1;
      }
      if (t === TILES.BOOK) {
        drawFrame("flask_blue", x, y, SCALE);
      }
      if (t === TILES.HEAL) {
        drawFrame("flask_green", x, y, SCALE);
      }
      if (t === TILES.BUSH) {
        // stealth puddle
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = "#0b5530";
        ctx.beginPath();
        ctx.arc(
          offX + x * TILE + TILE / 2,
          offY + y * TILE + TILE * 0.6,
          TILE * 0.35,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      // cell outline
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1;
      ctx.strokeRect(
        offX + x * TILE + 0.5,
        offY + y * TILE + 0.5,
        TILE - 1.5,
        TILE - 1.5
      );
    }
  }

  // selection highlight
  if (State.selection) {
    const ab = State.selection.ab;
    ctx.globalAlpha = 0.3;
    ctx.fillStyle =
      ab.type === "attack" ? "#ff6565" :
        ab.type === "move" ? "#8ad1ff" :
          "#7cf59a";

    for (let y = 0; y < GRID_H; y++) {
      for (let x = 0; x < GRID_W; x++) {
        const dist = Math.abs(x - State.player.x) + Math.abs(y - State.player.y);

        if (ab.type === "attack" && dist <= ab.range && !blocked(x, y)) {
          const losOK = hasLineOfSight(State.player.x, State.player.y, x, y);
          if (losOK) {
            ctx.fillRect(offX + x * TILE, offY + y * TILE, TILE - 2, TILE - 2);
          } else {
            // (optional) show in-range-but-blocked cells with faint overlay/X
            ctx.save();
            ctx.globalAlpha = 0.12;
            ctx.fillRect(offX + x * TILE, offY + y * TILE, TILE - 2, TILE - 2);
            ctx.globalAlpha = 0.6;
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(offX + x * TILE + 3, offY + y * TILE + 3);
            ctx.lineTo(offX + x * TILE + TILE - 5, offY + y * TILE + TILE - 5);
            ctx.moveTo(offX + x * TILE + TILE - 5, offY + y * TILE + 3);
            ctx.lineTo(offX + x * TILE + 3, offY + y * TILE + TILE - 5);
            ctx.stroke();
            ctx.restore();
          }
        } else if (ab.type === "move" && dist <= ab.range && !blocked(x, y) && hasLineOfSight(State.player.x, State.player.y, x, y)) {
          ctx.fillRect(offX + x * TILE, offY + y * TILE, TILE - 2, TILE - 2);
        } else if ((ab.type === "heal" || ab.type === "shield") &&
          x === State.player.x && y === State.player.y) {
          ctx.fillRect(offX + x * TILE, offY + y * TILE, TILE - 2, TILE - 2);
        }
      }
    }
    ctx.globalAlpha = 1;
  }


  // enemies
  for (const e of State.enemies) {
    try { drawStatusBadges(e); } catch (err) { /* ignore */ }
    const set = e.set;
    const prefix = e.movingTicks > 0 ? set.run : set.idle;
    const frm = prefix + (Math.floor(tick / 10) % set.frames);
    drawFrame(frm, e.x, e.y);
    e.movingTicks = Math.max(0, e.movingTicks - 1);

    // hp bar
    const baseHp = e.isBoss
      ? STAGES[State.stage].boss.hp
      : 30 + 12 * State.floor;
    const pct = clamp(e.hp / baseHp, 0, 1);
    const gx = offX + e.x * TILE + TILE / 2,
      gy = offY + e.y * TILE + TILE / 2;
    ctx.fillStyle = "#000";
    ctx.fillRect(gx - TILE * 0.35, gy - TILE * 0.55, TILE * 0.7, 6);
    ctx.fillStyle = e.isBoss ? "#ff7ad6" : "#ff7a7a";
    ctx.fillRect(
      gx - TILE * 0.35,
      gy - TILE * 0.55,
      TILE * 0.7 * pct,
      6
    );
    if (e.isBoss) {
      ctx.font = `${Math.floor(12 * DPR)}px sans-serif`;
      ctx.fillStyle = "#ffd6f2";
      ctx.textAlign = "center";
      ctx.fillText("👑 " + (e.name || "Boss"), gx, gy - TILE * 0.6);
    }
  }

  // player

  // status effect badges

  const ps = State.player.spriteSet || spriteSetForClass(State.player.class);
  const pfx = State.player.movingTicks > 0 ? ps.run : ps.idle;
  const pfrm = pfx + (Math.floor(tick / 10) % ps.frames);
  drawFrame(pfrm, State.player.x, State.player.y);
  State.player.movingTicks = Math.max(0, State.player.movingTicks - 1);
  if (State.player.shields > 0) {
    const px = offX + State.player.x * TILE + TILE / 2,
      py = offY + State.player.y * TILE + TILE / 2;
    ctx.strokeStyle = "#8ad1ff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(px, py, TILE * 0.42, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (hasEffect(State.player, EFFECTS.STEALTH)) {
    const px = offX + State.player.x * TILE + TILE / 2,
      py = offY + State.player.y * TILE + TILE / 2;
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(px, py, TILE * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.font = `${Math.floor(12 * DPR)}px sans-serif`;
    ctx.fillStyle = "#9ad5ff";
    ctx.textAlign = "center";
    ctx.fillText("STEALTH", px, py - TILE * 0.6);
  }

  // floating text
  for (const f of FX.floaters) {
    f.y += f.vy;
    f.ttl--;
    const a = Math.max(0, f.ttl / f.life);
    ctx.globalAlpha = a;
    ctx.fillStyle = f.color;
    ctx.font = `${Math.floor(16 * DPR)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(f.text, f.x, f.y);
    ctx.globalAlpha = 1;
  }
  FX.floaters = FX.floaters.filter((f) => f.ttl > 0);

  // turn banner
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = "#fff";
  ctx.font = `${Math.floor(24 * DPR)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(
    State.turn === "PLAYER" ? "Your Turn" : "Enemy Turn",
    canvas.width / 2,
    offY - 14
  );
  ctx.globalAlpha = 1;

  // toasts
  let ty = 40 * DPR;
  for (const t of FX.toasts) {
    ctx.globalAlpha = Math.min(1, t.time / 30);
    ctx.fillStyle = t.color;
    ctx.font = `${Math.floor(22 * DPR)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(t.text, canvas.width / 2, ty);
    ctx.globalAlpha = 1;
    t.time--;
    ty += 28 * DPR;
  }
  FX.toasts = FX.toasts.filter((t) => t.time > 0);

  if (FX.hitFlash > 0) {
    ctx.fillStyle = "rgba(255,60,60," + FX.hitFlash + ")";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    FX.hitFlash = Math.max(0, FX.hitFlash - 0.02);
  }
  ctx.restore();
  tick++;
}

function loop() {
  drawGrid();
  requestAnimationFrame(loop);
}

// ========= run setup =========
