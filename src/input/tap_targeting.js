// --- Unified press handlers: short tap = action, long press = inspect ---
let _pressTimer = null;
let _pressHandled = false;
let _pressStartPos = null;

function _clearPressTimer() {
  if (_pressTimer) { clearTimeout(_pressTimer); _pressTimer = null; }
}

function _eventClientXY(ev) {
  if (ev && ev.changedTouches && ev.changedTouches[0]) {
    return { x: ev.changedTouches[0].clientX, y: ev.changedTouches[0].clientY };
  }
  if (ev && ev.touches && ev.touches[0]) {
    return { x: ev.touches[0].clientX, y: ev.touches[0].clientY };
  }
  return { x: ev.clientX || 0, y: ev.clientY || 0 };
}

function _gridFromEvent(ev) {
  const { x: cx, y: cy } = _eventClientXY(ev);
  const x = (cx || 0) * DPR, y = (cy || 0) * DPR;   // <-- DPR fix
  const gx = Math.floor((x - offX) / TILE), gy = Math.floor((y - offY) / TILE);
  return { gx, gy };
}

function _onPressStart(ev) {
  _pressHandled = false;
  const { x, y } = _eventClientXY(ev);
  _pressStartPos = { x: (x || 0) * DPR, y: (y || 0) * DPR };
  _clearPressTimer();
  _pressTimer = setTimeout(() => {
    const { gx, gy } = _gridFromEvent(ev);
    const enemy = State.enemies && State.enemies.find((en) => en.x === gx && en.y === gy);
    if (enemy) {
      _pressHandled = true;
      try { openInspectEntityModal(enemy); } catch (e) {
        console.error("Error opening inspect modal:", e);
      }
    }
    _clearPressTimer();
  }, LONG_PRESS_MS);
}

function _onPressMove(ev) {
  if (!_pressStartPos) return;
  const { x, y } = _eventClientXY(ev);
  const px = (x || 0) * DPR, py = (y || 0) * DPR;
  const dx = Math.abs(px - _pressStartPos.x);
  const dy = Math.abs(py - _pressStartPos.y);
  if (dx > MOVE_TOLERANCE * DPR || dy > MOVE_TOLERANCE * DPR) _clearPressTimer();
}

function _onPressEnd(ev) {
  const wasHandled = _pressHandled;
  _clearPressTimer();
  _pressStartPos = null;
  if (wasHandled) return; // long-press consumed → don't attack
  // Short tap → route to existing handleTap with normalized coords
  const p = _eventClientXY(ev);
  handleTap({ clientX: p.x, clientY: p.y });
}

// Mouse + touch bindings (no immediate click handler!)
canvas.addEventListener("mousedown", _onPressStart, { passive: true });
canvas.addEventListener("mousemove", _onPressMove, { passive: true });
canvas.addEventListener("mouseup", _onPressEnd, { passive: true });

canvas.addEventListener("touchstart", _onPressStart, { passive: true });
canvas.addEventListener("touchmove", _onPressMove, { passive: true });
canvas.addEventListener("touchend", _onPressEnd, { passive: true });
canvas.addEventListener("touchcancel", _clearPressTimer, { passive: true });
// --- end unified press handlers ---

function handleTap(ev) {
  if (
    (State.roomType !== "BATTLE" && State.roomType !== "BOSS") ||
    State.turn !== "PLAYER"
  )
    return;
  const x = (ev.clientX || 0) * DPR,
    y = (ev.clientY || 0) * DPR;
  const gx = Math.floor((x - offX) / TILE),
    gy = Math.floor((y - offY) / TILE);
  if (gx < 0 || gy < 0 || gx >= GRID_W || gy >= GRID_H) return;
  if (State.selection) {
    const { ab } = State.selection;
    const dist =
      Math.abs(gx - State.player.x) + Math.abs(gy - State.player.y);
    if (ab.type === "attack") {
      if (dist <= ab.range) {
        const target = State.enemies.find((e) => e.x === gx && e.y === gy);
        const losOK = hasLineOfSight(State.player.x, State.player.y, gx, gy);
        if (target && losOK) {
          resolveAttack(State.player, target, ab);
          if (victoryCheck("attack")) return;
          State.selection = null;
          endPlayerTurn();
          SFX.beep("cast");
        } else if (target && !losOK) {
          // feedback if you can reach but can't see
          addFloatText(gx, gy, "BLOCKED", "#555", 40);
          SFX.beep("hit");
          return;
        }
      }
    }
    else if (ab.type === "heal") {
      if (gx === State.player.x && gy === State.player.y) {
        let amt = ab.heal;
        if (
          State.player.class === "Cleric" &&
          State.player.talents.Sanctify
        )
          amt = Math.round(amt * 1.2);
        State.player.hp = clamp(
          State.player.hp + amt,
          0,
          State.player.maxHp
        );
        addFloatText(
          State.player.x,
          State.player.y,
          `+${amt}`,
          "#7cf59a",
          50
        );
        if (
          State.player.class === "Cleric" &&
          CLASSES.Cleric.passiveOnHeal
        )
          CLASSES.Cleric.passiveOnHeal(amt);
        ab.cdLeft = ab.cd;
        State.selection = null;
        updateHUD();
        endPlayerTurn();
        SFX.beep("heal");
      }
    } else if (ab.type === "shield") {
      if (gx === State.player.x && gy === State.player.y) {
        State.player.shields += ab.shield;
        addFloatText(
          State.player.x,
          State.player.y,
          `+${ab.shield}🛡`,
          "#bde7ff",
          40
        );
        ab.cdLeft = ab.cd;
        State.selection = null;
        endPlayerTurn();
        SFX.beep("cast");
      }
    } else if (ab.type === "move") {
      const losOK = hasLineOfSight(State.player.x, State.player.y, gx, gy);
      if (
        dist <= ab.range &&
        !State.enemies.some((e) => e.x === gx && e.y === gy) &&
        !blocked(gx, gy) && losOK
      ) {
        State.player.x = gx;
        State.player.y = gy;
        State.player.movingTicks = 6;
        applyTileOnEnter(State.player);
        addFloatText(gx, gy, "BLINK", "#8ad1ff", 40);
        ab.cdLeft = ab.cd;
        State.selection = null;
        endPlayerTurn();
        SFX.beep("cast");
      }
    }
  }
}

function resolveAttack(attacker, target, ab) {
  let hits = ab.hits + (State.pendingHits || 0);
  State.pendingHits = 0;
  if (
    State.player === attacker &&
    State.player.class === "Rogue" &&
    State.player.talents.Flurry &&
    !State._flurryUsed
  ) {
    hits++;
    State._flurryUsed = true;
    addFloatText(attacker.x, attacker.y, "FLURRY +1", "#d6b8ff", 45);
  }
  for (let i = 0; i < hits; i++) {
    let dmg = ab.dmg;
    if (
      State.player === attacker &&
      State.player.class === "Fighter" &&
      State.player.talents.BrutalStrikes
    )
      dmg = Math.round(dmg * 1.2);
    if (
      State.player === attacker &&
      State.player.talents.Conduction &&
      hasEffect(target, EFFECTS.SHOCK)
    )
      dmg = Math.round(dmg * 1.25);
    if (
      State.player === attacker &&
      State.player.talents.Expose &&
      hasEffect(target, EFFECTS.BLEED)
    )
      dmg = Math.round(dmg * 1.3);
    dmg = onHitCombos(attacker, target, dmg, { element: ab.element });
    target.hp -= dmg;
    addFloatText(target.x, target.y, `-${dmg}`, "#ff8a8a", 50);
    if (ab.element === "Flaming")
      addEffect(
        target,
        EFFECTS.BURN,
        3,
        4 + (State.player.armorMods?.burnPlus || 0)
      );
    if (ab.element === "Frost")
      addEffect(
        target,
        EFFECTS.FREEZE,
        1 + (State.player.talents.Glacier ? 1 : 0)
      );
    if (ab.element === "Shock")
      addEffect(
        target,
        EFFECTS.SHOCK,
        1 + (State.player.armorMods?.shockPlus || 0)
      );
    if (ab.element === "Venom") addEffect(target, EFFECTS.POISON, 3, 5);
    if (ab.element === "Shadow") addEffect(target, EFFECTS.BLEED, 3, 0);
    if (
      State.player === attacker &&
      State.player.class === "Wizard" &&
      State.player.talents.ArcaneBattery
    ) {
      State.player._casts = (State.player._casts || 0) + 1;
      if (State.player._casts % 3 === 0) {
        ab.cdLeft = 0;
        addFloatText(attacker.x, attacker.y, "BATTERY!", "#b6f7ff", 45);
      }
    }
    if (
      ab.element === "Shock" &&
      hasEffect(target, EFFECTS.BURN) &&
      State.player.armorMods?.overloadPlus
    ) {
      splashDamage(
        target.x,
        target.y,
        State.player.armorMods.overloadPlus
      );
    }
  }
  if (
    target.hp <= 0 &&
    State.player === attacker &&
    State.player.class === "Fighter"
  )
    CLASSES.Fighter.passiveOnKill();
  ab.cdLeft = ab.cd;
  State.selection = null;
  State.enemies = State.enemies.filter((e) => e.hp > 0);
  SFX.beep("hit");
}
// ========= keyboard input =========
