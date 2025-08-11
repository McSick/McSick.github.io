function dirMove(dx, dy) {
  if (State.roomType !== "BATTLE" && State.roomType !== "BOSS") return;
  if (State.turn !== "PLAYER") return;
  if (
    hasEffect(State.player, EFFECTS.FREEZE) ||
    hasEffect(State.player, EFFECTS.STUN)
  )
    return;
  const nx = clamp(State.player.x + dx, 0, GRID_W - 1),
    ny = clamp(State.player.y + dy, 0, GRID_H - 1);
  if (blocked(nx, ny)) return;
  if (State.enemies.some((e) => e.x === nx && e.y === ny)) return;
  State.player.x = nx;
  State.player.y = ny;
  State.player.movingTicks = 6;
  applyTileOnEnter(State.player);
  if (hasEffect(State.player, EFFECTS.BLEED)) {
    State.player.hp -= 6;
    addFloatText(State.player.x, State.player.y, "-6", "#f59999", 40);
  }
  endPlayerTurn();
}
document.querySelector(".dpad").addEventListener(
  "touchstart",
  (e) => {
    const t = e.target.closest("button");
    if (!t) return;
    const dir = t.getAttribute("data-dir");
    if (dir === "up") dirMove(0, -1);
    if (dir === "down") dirMove(0, 1);
    if (dir === "left") dirMove(-1, 0);
    if (dir === "right") dirMove(1, 0);
  },
  { passive: true }
);
document.querySelector(".dpad").addEventListener("click", (e) => {
  const t = e.target.closest("button");
  if (!t) return;
  const dir = t.getAttribute("data-dir");
  if (dir === "up") dirMove(0, -1);
  if (dir === "down") dirMove(0, 1);
  if (dir === "left") dirMove(-1, 0);
  if (dir === "right") dirMove(1, 0);
});
document.getElementById("loadoutBtn").onclick = openLoadoutModal;
document.getElementById("restartBtn").onclick = () => startRun();
document.getElementById("muteBtn").onclick = () => {
  SFX.mute();
  SFX.beep("ui");
};

const abilitiesEl = document.getElementById("abilities");
// Use hover only on devices that actually support it
const SUPPORTS_HOVER =
  window.matchMedia && window.matchMedia("(hover: hover)").matches;
const abilityInfoEl = document.getElementById("abilityInfo");
const ABILITY_HINT =
  "Click/tap an ability, then tap a tile. Hover to see details here.";

function setAbilityInfoFromSelection() {
  if (State.selection && State.selection.ab) {
    abilityInfoEl.textContent = `${State.selection.ab.name}: ${State.selection.ab.desc}`;
  } else {
    abilityInfoEl.textContent = ABILITY_HINT;
  }
}

function renderAbilityButtons() {
  abilitiesEl.innerHTML = "";
  State.player.abilities.forEach((ab, idx) => {
    const b = document.createElement("button");
    b.innerHTML = `
      <div style="font-size:12px;opacity:.8">Slot ${idx + 1
      } • <span style="color:${ab.color}">${ab.rarity}</span></div>
      <div>${ab.name}</div>
      <div class="smallRow">
        <span class="pill">CD ${ab.cdLeft || 0}/${ab.cd}</span>
        ${ab.range ? `<span class="pill">R${ab.range}</span>` : ``}
        ${ab.hits > 1 ? `<span class="pill">x${ab.hits}</span>` : ``}
        ${ab.element ? `<span class="pill">${ab.element}</span>` : ``}
      </div>`;
    b.title = `${ab.name} — ${ab.desc}`;
    if (ab.cdLeft > 0) b.classList.add("cooldown");

    // Select immediately on pointerdown (prevents DOM-swap/ghost-click issues)
    b.addEventListener(
      "pointerdown",
      (ev) => {
        ev.preventDefault();
        selectAbility(idx);
        setAbilityInfoFromSelection();
      },
      { passive: false }
    );

    // Kill any synthetic click that might still fire on some browsers
    b.addEventListener("click", (e) => e.preventDefault(), {
      passive: false,
    });

    // Desktop hover → show details in HUD (never a modal)
    if (SUPPORTS_HOVER) {
      b.addEventListener("pointerenter", () => {
        abilityInfoEl.textContent = `${ab.name}: ${ab.desc}`;
      });
      const reset = () => setAbilityInfoFromSelection();
      b.addEventListener("pointerleave", reset);
      b.addEventListener("pointercancel", reset);
    }

    abilitiesEl.appendChild(b);
  });

  setAbilityInfoFromSelection();
}

function showAbilityInfo(ab) {
  modalTitle.textContent = ab.name;
  modalContent.innerHTML = `<p style='color:${ab.color};font-weight:800'>${ab.rarity}</p><p>${ab.desc}</p>`;
  modalFooter.innerHTML = "";
  const c = document.createElement("button");
  c.textContent = "Close";
  c.onclick = hideModal;
  modalFooter.appendChild(c);
  showModal();
}

function selectAbility(idx) {
  const ab = State.player.abilities[idx];
  if (
    (State.roomType !== "BATTLE" && State.roomType !== "BOSS") ||
    State.turn !== "PLAYER"
  )
    return;
  if (ab.cdLeft > 0) return;
  document.getElementById(
    "abilityInfo"
  ).textContent = `${ab.name}: ${ab.desc}`;
  State.selection = { idx, ab };
  if (ab.type === "tome") {
    const spend = Math.min(2, State.player.pages);
    if (spend > 0) {
      State.player.pages -= spend;
      State.pendingHits = (State.pendingHits || 0) + spend;
      addFloatText(
        State.player.x,
        State.player.y,
        `+${spend} hit`,
        "#d0c7ff",
        45
      );
      SFX.beep("cast");
    }
    ab.cdLeft = ab.cd;
    State.selection = null;
    updateHUD();
    return;
  }
  if (ab.type === "stealth") {
    addEffect(
      State.player,
      EFFECTS.STEALTH,
      1 + (State.player.armorMods?.stealthPlus || 0)
    );
    addFloatText(
      State.player.x,
      State.player.y,
      "STEALTH",
      "#9ad5ff",
      45
    );
    SFX.beep("cast");
    ab.cdLeft = ab.cd;
    State.selection = null;
    endPlayerTurn();
  }
}
// Back-compat: enemyTurn expects { skip } from processEffects()
// Use the new start-of-turn ticker + explicit FREEZE/STUN check.
function processEffects(entity) {
  processStartEffects(entity); // applies DOTs and decrements debuffs
  const skip =
    hasEffect(entity, EFFECTS.FREEZE) ||
    hasEffect(entity, EFFECTS.STUN);
  return { skip };
}

// ========= turns =========
