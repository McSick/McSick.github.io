const modal = document.getElementById("modal"),
  modalTitle = document.getElementById("modalTitle"),
  modalContent = document.getElementById("modalContent"),
  modalFooter = document.getElementById("modalFooter");
const showModal = () => modal.classList.add("show");
const hideModal = () => {
  modal.classList.remove("show");
  modalContent.innerHTML = "";
  modalFooter.innerHTML = "";
};

function openLoadoutModal() {
  modalTitle.textContent = "Loadout";
  modalContent.innerHTML = "";
  modalFooter.innerHTML = "";
  const wrap = document.createElement("div");
  const section = (title, el) => {
    const h = document.createElement("h3");
    h.textContent = title;
    wrap.appendChild(h);
    wrap.appendChild(el);
  };
  const c = document.createElement("div");
  c.className = "choice";
  c.innerHTML = `<div class="title">Class</div><div class="row">${State.player.class
    } — ${CLASSES[State.player.class]?.desc || ""}</div>`;
  const a = document.createElement("div");
  a.className = "choice";
  a.innerHTML = `<div class="title">Armor</div><div class="row">${State.player.armor
      ? `<b>${State.player.armor.name}</b> — ${State.player.armor.desc}`
      : "None"
    }</div>`;
  const tWrap = document.createElement("div");
  tWrap.className = "choices";
  const learned = Object.entries(State.player.talents).filter(
    ([k, v]) => v
  );
  if (!learned.length) {
    const d = document.createElement("div");
    d.className = "choice";
    d.innerHTML = '<div class="row">No talents learned yet.</div>';
    tWrap.appendChild(d);
  } else
    learned.forEach(([key]) => {
      const def = CLASSES[State.player.class]?.talents.find(
        (t) => t.key === key
      );
      const d = document.createElement("div");
      d.className = "choice";
      d.innerHTML = `<div class='title'>${def?.label || key}</div>`;
      tWrap.appendChild(d);
    });
  const g = document.createElement("div");
  g.className = "choice";
  g.innerHTML = `<div class='title'>Legend</div><div class='row'>🔥 Burn • ❄ Freeze • ⚡ Shock • ☠ Poison • 🩸 Bleed • 🛡 Shield • Page: empowers Tome</div>`;
  section("Class", c);
  section("Armor", a);
  section("Talents", tWrap);
  section("Legend", g);
  modalContent.appendChild(wrap);
  const close = document.createElement("button");
  close.textContent = "Close";
  close.onclick = hideModal;
  modalFooter.appendChild(close);
  showModal();
}

// Starter loadout builder: called after class select before first room.
function openStarterLoadoutModal() {
  modalTitle.textContent = "Starter Loadout";
  modalContent.innerHTML = "";
  modalFooter.innerHTML = "";

  const wrap = document.createElement('div');
  wrap.className = 'choices';

  // Generate candidate abilities (ensure at least one damage attack)
  function genStarterPool() {
    const list = [];
    let hasAttack = false;
    for (let i = 0; i < 8; i++) {
      const ab = makeAbility();
      if (ab.type === 'attack') hasAttack = true;
      list.push(ab);
    }
    if (!hasAttack) {
      // replace first non-attack with an attack
      const attack = (() => {
        for (let tries = 0; tries < 30; tries++) {
          const a = makeAbility();
          if (a.type === 'attack') return a;
        }
        return makeAbility();
      })();
      const idx = list.findIndex(a => a.type !== 'attack');
      if (idx >= 0) list[idx] = attack; else list[0] = attack;
    }
    return list;
  }

  const starterPool = genStarterPool();
  const saved = (window.loadSavedAbilities ? loadSavedAbilities() : []).slice(0, 8);
  let lastRun = [];
  try { lastRun = JSON.parse(localStorage.getItem('lastRunAbilities')||'[]') || []; } catch(e) { lastRun = []; }
  // Filter out any malformed entries
  lastRun = Array.isArray(lastRun) ? lastRun.filter(a=>a && a.name && a.type) : [];
  const chosen = [];

  function renderChosen() {
    chosenWrap.innerHTML = '';
    chosen.forEach((ab, i) => {
      const d = document.createElement('div');
      d.className = 'choice';
      d.innerHTML = `<div class='title' style='color:${ab.color}'>${ab.name}</div><div class='row'><span>${ab.desc}</span></div>`;
      const rm = document.createElement('button');
      rm.className = 'btn btn--small btn--ghost';
      rm.textContent = 'Remove';
  rm.onclick = () => { chosen.splice(i,1); renderChosen(); updateFooterState(); refreshPoolButtons(); };
      d.appendChild(rm);
      chosenWrap.appendChild(d);
    });
  }

  function abilityCard(ab, sourceLabel, sourceType) {
    const div = document.createElement('div');
    const isCarry = sourceType==='lastRun' || sourceType==='saved';
    div.className = 'choice' + (isCarry ? ' carryAbility' : '');
    const carryInfo = isCarry ? `<span class='pill pill--carry'>Carry</span>` : '';
    div.innerHTML = `<div class='title' style='color:${ab.color}'>${ab.name} <span class='pill'>${ab.rarity}</span> ${carryInfo}</div>
      <div class='row'><span>${ab.desc}</span></div>
      <div class='row'><span class='pill'>${ab.type}</span><span class='pill'>CD ${ab.cd}</span><span class='pill'>R ${ab.range}</span>${ab.hits>1?`<span class='pill'>x${ab.hits}</span>`:''}</div>
      ${sourceLabel?`<div class='row sourceTag'>${sourceLabel}${isCarry?" — carry-over pool (limit 2)":''}</div>`:''}`;
    const add = document.createElement('button');
    add.className = 'btn btn--small btn--primary';
    add.textContent = 'Add';
    const key = ab.name + '|' + ab.type;
    function alreadyChosen(){ return chosen.some(c => c.name===ab.name && c.type===ab.type); }
    add.onclick = () => {
      if (chosen.length >= 4) { add.textContent = 'Max 4'; return; }
      if (isCarry) {
        const alreadyCarry = chosen.filter(c => c.__carry).length;
        if (alreadyCarry >= 2 && !alreadyChosen()) { add.textContent = 'Max 2 carry'; return; }
      }
      if (alreadyChosen()) { add.textContent = 'Picked'; return; }
      const cloned = structuredClone ? structuredClone(ab) : JSON.parse(JSON.stringify(ab));
      if (isCarry) cloned.__carry = true;
      chosen.push(cloned);
      add.textContent = 'Picked';
      add.disabled = true;
      div.classList.add('picked');
      renderChosen(); updateFooterState();
    };
    if (alreadyChosen()) { add.textContent='Picked'; add.disabled=true; }
    div.appendChild(add);
    return div;
  }

  const poolWrap = document.createElement('div');
  poolWrap.className = 'choices';
  starterPool.forEach(ab => poolWrap.appendChild(abilityCard(ab,'Generated','generated')));
  if (saved.length) saved.forEach(ab => poolWrap.appendChild(abilityCard(ab,'Saved','saved')));
  if (lastRun.length) {
    // de-duplicate with saved to avoid double counting (by name+type)
    const savedKeys = new Set(saved.map(a=>a.name+'|'+a.type));
    lastRun.forEach(ab => {
      if (!savedKeys.has(ab.name+'|'+ab.type)) poolWrap.appendChild(abilityCard(ab,'Last Run','lastRun')); else poolWrap.appendChild(abilityCard(ab,'Last Run (dup saved)','lastRun'));
    });
  }

  const armorPick = choice(ARMOR_POOL);
  const armorDiv = document.createElement('div');
  armorDiv.className = 'choice';
  armorDiv.innerHTML = `<div class='title'>Starting Armor</div><div class='row'><b>${armorPick.name}</b>: ${armorPick.desc}</div>`;
  const armorBtn = document.createElement('button');
  armorBtn.className = 'btn btn--small btn--primary';
  armorBtn.textContent = 'Equip';
  let armorEquipped = null;
  armorBtn.onclick = () => {
    armorEquipped = armorPick;
    armorBtn.textContent = 'Equipped';
  };
  armorDiv.appendChild(armorBtn);

  const chosenWrap = document.createElement('div');
  chosenWrap.className = 'choices';

  // Sections layout
  modalContent.appendChild(document.createElement('h3')).textContent = 'Choose up to 4 Abilities (need at least 1 attack, max 2 carry-over)';
  modalContent.appendChild(poolWrap);
  modalContent.appendChild(document.createElement('h3')).textContent = 'Selected';
  modalContent.appendChild(chosenWrap);
  modalContent.appendChild(document.createElement('h3')).textContent = 'Armor';
  modalContent.appendChild(armorDiv);

  // No auto-prefill; user must choose. Carry-over limit enforced per-card.

  function updateFooterState() {
    startBtn.disabled = !(chosen.length && chosen.some(a=>a.type==='attack'));
  }

  const startBtn = document.createElement('button');
  startBtn.className = 'btn btn--small btn--primary';
  startBtn.textContent = 'Begin Adventure';
  startBtn.disabled = true;
  startBtn.onclick = () => {
    State.player.abilities = chosen.map(a => ({...a, cdLeft:0}));
    if (armorEquipped) equipArmor(armorEquipped);
    renderAbilityButtons();
    updateHUD();
    hideModal();
    nextRoom();
  };
  let rerolled = false;
  const rerollBtn = document.createElement('button');
  rerollBtn.className = 'btn btn--small btn--ghost';

  function refreshPoolButtons() {
    const carryChosen = chosen.filter(c=>c.__carry).length;
    const chosenKeys = new Set(chosen.map(c=>c.name+'|'+c.type));
    poolWrap.querySelectorAll('.choice').forEach(card => {
      const btn = card.querySelector('button.btn');
      if (!btn) return;
      const key = card.dataset.name + '|' + card.dataset.type;
      const isCarry = !!card.dataset.carry;
      if (chosenKeys.has(key)) {
        btn.textContent = 'Picked';
        btn.disabled = true;
        card.classList.add('picked');
      } else {
        // Not chosen; determine if selectable
        if (chosen.length >=4) {
          btn.textContent = 'Max 4';
          btn.disabled = true;
        } else if (isCarry && carryChosen >=2) {
          btn.textContent = 'Max 2 carry';
          btn.disabled = true;
        } else {
          btn.textContent = 'Add';
          btn.disabled = false;
          card.classList.remove('picked');
        }
      }
    });
  }
  rerollBtn.textContent = 'Reroll (1x)';
  rerollBtn.onclick = () => {
    if (rerolled) return; // safety
    rerolled = true;
    poolWrap.innerHTML='';
    const fresh = genStarterPool();
    fresh.forEach(ab => poolWrap.appendChild(abilityCard(ab,'Generated','generated')));
    // re-add saved and lastRun abilities after reroll
    if (saved.length) saved.forEach(ab => poolWrap.appendChild(abilityCard(ab,'Saved','saved')));
    if (lastRun.length) {
      const savedKeys = new Set(saved.map(a=>a.name+'|'+a.type));
      lastRun.forEach(ab => {
        if (!savedKeys.has(ab.name+'|'+ab.type)) poolWrap.appendChild(abilityCard(ab,'Last Run','lastRun')); else poolWrap.appendChild(abilityCard(ab,'Last Run (dup saved)','lastRun'));
      });
    }
    rerollBtn.textContent = 'Rerolled';
    rerollBtn.disabled = true;
    refreshPoolButtons();
  };
  modalFooter.appendChild(rerollBtn);
  modalFooter.appendChild(startBtn);
  showModal();
  renderChosen(); updateFooterState(); refreshPoolButtons();
}
window.openStarterLoadoutModal = openStarterLoadoutModal;

function openRoomModal() {
  modalTitle.textContent = State.roomType;
  modalContent.innerHTML = "";
  modalFooter.innerHTML = "";
  if (State.roomType === "STORY") {
    const stage = STAGES[State.stage];
    const line =
      stage.story[Math.min(State.storyIndex, stage.story.length - 1)];
    modalContent.innerHTML = `<p>${line}</p>`;
    const cont = document.createElement("button");
    cont.textContent = "Continue";
    cont.onclick = () => {
      State.storyIndex++;
      hideModal();
      nextRoom();
      SFX.beep("ui");
    };
    modalFooter.appendChild(cont);
    showModal();
  } else if (State.roomType === "SHOP") {
    const offers = [makeAbility(), makeAbility(), makeAbility()],
      prices = offers.map(() => rand(25, 50));

    // ⬇️ Wallet pill at the top of the modal
    const wallet = document.createElement("div");
    wallet.className = "row";
    wallet.style.margin = "0 0 8px 0";
    wallet.innerHTML = `<div class="goldChip"><span class="coin"></span> Gold: <span id="shopGold">${State.gold}</span>g</div>`;
    modalContent.appendChild(wallet);

    // helper to keep it in sync
    const updateShopGold = () => {
      const el = document.getElementById("shopGold");
      if (el) el.textContent = State.gold;
      // also keep HUD gold in sync
      document.getElementById("gold").textContent = State.gold;
    };

    const wrap = document.createElement("div");
    wrap.className = "choices";
    offers.forEach((ab, i) => {
      const div = document.createElement("div");
      div.className = "choice";
      div.innerHTML = `<div class="title" style="color:${ab.color}">${ab.name
        } <span class="pill">${ab.rarity}</span></div>
      <div class="row"><span>${ab.desc}</span></div>
      <div class="row"><span class="pill">CD ${ab.cd
        }</span><span class="pill">Range ${ab.range || 1}</span>${ab.hits > 1 ? `<span class="pill">Hits ${ab.hits}</span>` : ""
        }</div>
      <div class="row" style="margin-top:6px">Price: <b class="gold">${prices[i]
        }g</b></div>`;
      const buy = document.createElement("button");
      buy.className = "btn btn--small btn--primary"; // (from your button styles)
      buy.textContent = "Buy & replace...";
      buy.onclick = () => {
        if (State.gold < prices[i]) {
          buy.textContent = "Not enough gold";
          SFX.beep("hit");
          return;
        }
        State.gold -= prices[i];
        updateShopGold();
        replaceAbilityFlow(ab, 0);
        SFX.beep("loot");
      };
      div.appendChild(buy);
      wrap.appendChild(div);
    });

    const armor = choice(ARMOR_POOL);
    const ar = document.createElement("div");
    ar.className = "choice";
    ar.innerHTML = `<div class="title">${armor.name}</div><div class="row">${armor.desc}</div><div class='row' style='margin-top:6px'>Price: <b class='gold'>60g</b></div>`;
    const buyA = document.createElement("button");
    buyA.className = "btn btn--small btn--primary";
    buyA.textContent = "Buy armor";
    buyA.onclick = () => {
      if (State.gold < 60) {
        buyA.textContent = "Not enough gold";
        SFX.beep("hit");
        return;
      }
      State.gold -= 60;
      updateShopGold();
      equipArmor(armor);
      updateHUD();
      hideModal();
      nextRoom();
    };
    ar.appendChild(buyA);

    wrap.appendChild(ar);
    modalContent.appendChild(wrap);

    const skip = document.createElement("button");
    skip.className = "btn btn--ghost";
    skip.textContent = "Leave shop";
    skip.onclick = () => {
      hideModal();
      nextRoom();
      SFX.beep("ui");
    };
    modalFooter.appendChild(skip);

    showModal();
  } else if (State.roomType === "HEAL") {
    const amt = Math.round(State.player.maxHp * 0.4);
    modalContent.innerHTML = `<p>You discover a tranquil fountain. Restore <b>${amt} HP</b>?</p>`;
    const yes = document.createElement("button");
    yes.textContent = "Drink";
    yes.onclick = () => {
      State.player.hp = clamp(
        State.player.hp + amt,
        0,
        State.player.maxHp
      );
      updateHUD();
      hideModal();
      nextRoom();
      SFX.beep("heal");
    };
    const no = document.createElement("button");
    no.textContent = "Move on";
    no.onclick = () => {
      hideModal();
      nextRoom();
      SFX.beep("ui");
    };
    modalFooter.appendChild(yes);
    modalFooter.appendChild(no);
    showModal();
  }
}
function openControlsModal(opts = {}) {
  const afterClose = opts.afterClose;
  const hasHover =
    window.matchMedia && window.matchMedia("(hover:hover)").matches;
  const isTouch =
    window.matchMedia && window.matchMedia("(pointer:coarse)").matches;
  const showKeyboard = !isTouch; // desktop-ish heuristic

  modalTitle.textContent = "Controls & Guide";

  modalContent.innerHTML = `
    <div class="helpGrid">
      <div class="choice helpSection">
        <div class="title">🎮 Movement</div>
        <ul>
          <li>${isTouch ? "Use the on-screen D-Pad." : "WASD or Arrow Keys."
    }</li>
          <li>Tap a grid tile to target when an ability is selected.</li>
        </ul>
      </div>

      <div class="choice helpSection">
        <div class="title">✨ Abilities</div>
        <ul>
          <li>Tap/click an ability, then tap a tile.</li>
          ${hasHover ? `<li>Hover shows details in the HUD line.</li>` : ``}
          <li><span class="kbd">Enter</span> / <span class="kbd">Space</span> smart-cast Heal/Shield on yourself.</li>
          <li><span class="kbd">Esc</span> cancels selection.</li>
        </ul>
      </div>

      ${showKeyboard
      ? `
      <div class="choice helpSection">
        <div class="title">⌨️ Shortcuts</div>
        <ul>
          <li><span class="kbd">1</span><span class="kbd">2</span><span class="kbd">3</span><span class="kbd">4</span> select abilities.</li>
        </ul>
      </div>`
      : ``
    }

      <div class="choice helpSection">
        <div class="title">🗺 Tiles</div>
        <ul>
          <li>Spikes: damage on step</li>
          <li>Hole (glow): lava (burn)</li>
          <li>Green flask: heal</li>
          <li>Blue flask: page</li>
          <li>Dark puddle: hide/stealth</li>
        </ul>
      </div>

      <div class="choice helpSection">
        <div class="title">🔁 Turn Flow</div>
        <ul>
          <li>Player → Enemies; DOTs/debuffs tick at each unit’s turn start.</li>
          <li>Stealth/Haste last through your action and decay at end of turn.</li>
        </ul>
      </div>

      <div class="choice helpSection">
        <div class="title">🧠 Tips</div>
        <ul>
          <li>Backstab from Stealth → +Page & extra action.</li>
          <li>Shock + Burn → Overload splash.</li>
        </ul>
      </div>
    </div>

    <div class="row" id="helpToggleWrap" style="align-items:center;gap:8px;margin-top:10px">
      <input type="checkbox" id="helpOnRunChk" />
      <label for="helpOnRunChk">Show this on new runs</label>
    </div>
  `;

  modalFooter.innerHTML = "";
  const close = document.createElement("button");
  close.textContent = "Close";
  close.onclick = () => {
    const chk = document.getElementById("helpOnRunChk");
    if (chk) setSetting("showHelpOnNewRun", chk.checked);
    hideModal();
    if (typeof afterClose === "function") afterClose();
  };
  modalFooter.appendChild(close);

  showModal();

  // init toggle state after DOM exists
  const chk = document.getElementById("helpOnRunChk");
  if (chk) chk.checked = !!SETTINGS.showHelpOnNewRun;
}

// Keep the HUD button wiring (unchanged)
document.getElementById("helpBtn").onclick = () => openControlsModal();

function replaceAbilityFlow(newAb, price) {
  const grid = document.createElement("div");
  grid.className = "choices";
  State.player.abilities.forEach((cur, i) => {
    const d = document.createElement("div");
    d.className = "choice";
    d.innerHTML = `<div class="title">Slot ${i + 1
      }</div><div class="row"><span style="color:${cur.color}">${cur.name
      }</span></div><div class="row"><span>${cur.desc}</span></div>`;
    const b = document.createElement("button");
    b.className = "btn btn--small btn--primary";
    b.textContent = price
      ? `Replace with ${newAb.name} (${price}g)`
      : `Replace with ${newAb.name}`;
    b.onclick = () => {
      if (price && State.gold < price) {
        b.textContent = "Not enough gold";
        return;
      }
      if (price) State.gold -= price;
      State.player.abilities[i] = newAb;
      renderAbilityButtons();
      updateHUD();
      hideModal();
      nextRoom();
      SFX.beep("ui");
    };
    d.appendChild(b);
    grid.appendChild(d);
  });
  modalContent.innerHTML = "";
  modalContent.appendChild(grid);
}

function openLootModal() {
  modalTitle.textContent = State.roomType === 'BOSS' ? 'Boss Defeated! Choose a reward' : 'Victory! Choose a reward';
  modalContent.innerHTML = '';
  modalFooter.innerHTML = '';

  // Build a unified reward list of length 3 mixing abilities, armor, talents.
  const rewards = [];
  // Always at least one ability
  rewards.push({ type:'ability', data: makeAbility() });
  // Candidate pools
  const armorCandidate = choice(ARMOR_POOL);
  const clazz = CLASSES[State.player.class];
  let talentCandidate = null;
  if (clazz && clazz.talents && clazz.talents.length) {
    // pick a random talent not yet learned (if any)
    const avail = clazz.talents.filter(t => !State.player.talents[t.key]);
    if (avail.length) talentCandidate = choice(avail);
  }
  // Decide remaining slots (2) from armor / talent / abilities ensuring no duplicates by object reference
  const slotsNeeded = 2;
  const poolOrder = [];
  if (talentCandidate) poolOrder.push('talent');
  poolOrder.push('armor');
  // Fill with an extra ability if still space
  while (rewards.length < 1 + slotsNeeded) {
    if (poolOrder.length) {
      const kind = poolOrder.shift();
      if (kind === 'armor') rewards.push({ type:'armor', data: armorCandidate });
      else if (kind === 'talent' && talentCandidate) rewards.push({ type:'talent', data: talentCandidate });
    } else {
      rewards.push({ type:'ability', data: makeAbility() });
    }
  }

  const wrap = document.createElement('div');
  wrap.className = 'choices';
  rewards.forEach((r,i) => {
    const card = document.createElement('div');
    card.className = 'choice';
    if (r.type === 'ability') {
      const ab = r.data;
      card.innerHTML = `<div class='title' style='color:${ab.color}'>${ab.name} <span class='pill'>${ab.rarity}</span> <span class='pill'>Ability</span></div>
        <div class='row'><span>${ab.desc}</span></div>
        <div class='row'><span class='pill'>CD ${ab.cd}</span><span class='pill'>Range ${ab.range||1}</span>${ab.hits>1?`<span class='pill'>Hits ${ab.hits}</span>`:''}</div>`;
      const take = document.createElement('button');
      take.className = 'btn btn--small btn--primary';
      take.textContent = 'Take & replace...';
      take.onclick = () => { replaceAbilityFlow(ab,0); SFX.beep('loot'); };
      const saveBtn = document.createElement('button');
      saveBtn.className = 'btn btn--small btn--ghost';
      saveBtn.textContent = 'Save (carry-over)';
      saveBtn.onclick = () => {
        if (!window.addSavedAbility) return;
        const before = loadSavedAbilities();
        if (before.length >= 2) { saveBtn.textContent='Carry limit reached'; return; }
        addSavedAbility(ab);
        const after = loadSavedAbilities();
        if (after.length > before.length) { saveBtn.textContent='Saved'; saveBtn.disabled = true; } else { saveBtn.textContent='Already saved'; }
      };
      card.appendChild(take); card.appendChild(saveBtn);
    } else if (r.type === 'armor') {
      const ar = r.data;
      card.innerHTML = `<div class='title'>${ar.name} <span class='pill'>Armor</span></div><div class='row'>${ar.desc}</div>`;
      const btn = document.createElement('button');
      btn.className = 'btn btn--small btn--primary';
      btn.textContent = 'Equip';
      btn.onclick = () => { equipArmor(ar); hideModal(); afterRewards(); };
      card.appendChild(btn);
    } else if (r.type === 'talent') {
      const t = r.data;
      card.innerHTML = `<div class='title'>${t.label} <span class='pill'>Talent</span></div>`;
      const btn = document.createElement('button');
      btn.className = 'btn btn--small btn--primary';
      btn.textContent = 'Learn';
      btn.onclick = () => { t.apply(State.player); hideModal(); afterRewards(); };
      card.appendChild(btn);
    }
    wrap.appendChild(card);
  });

  modalContent.appendChild(document.createElement('h3')).textContent = 'Rewards (choose one)';
  modalContent.appendChild(wrap);
  const skip = document.createElement('button');
  skip.className = 'btn btn--ghost';
  skip.textContent = 'Skip (keep current)';
  skip.onclick = () => { hideModal(); afterRewards(); };
  modalFooter.appendChild(skip);
  showModal();
}
function afterRewards() {
  const wasBoss = State.roomType === "BOSS";
  if (wasBoss) {
    hideModal();
    if (window.startCutscene) {
      startCutscene('bossClear', { onDone: () => { startRun(); } });
    } else {
      modalTitle.textContent = "Run Cleared!";
      modalContent.innerHTML = `<p>You extinguished the <b>${STAGES[State.stage].boss.name}</b> and calmed the <b>${STAGES[State.stage].name}</b>.</p>`;
      modalFooter.innerHTML = "";
      const b = document.createElement('button');
      b.className = 'btn btn--small btn--primary';
      b.textContent = 'Start a new run';
      b.onclick = () => { startRun(); hideModal(); };
      modalFooter.appendChild(b);
      showModal();
    }
    return;    
  }
  State.floor++;
  State.stageFloor++;
  nextRoom();
}
function gameOver() {
  try {
    // Store snapshot of current run's first 4 abilities for next run prefill
    if (State.player && Array.isArray(State.player.abilities)) {
      const snap = State.player.abilities.slice(0,4).map(a => {
        // trim volatile runtime fields
        const { cdLeft, chargesLeft, ...rest } = a;
        return rest;
      });
      localStorage.setItem('lastRunAbilities', JSON.stringify(snap));
    }
  } catch(e) { /* non-fatal */ }

  // Launch death cutscene, then after it completes show carry-over modal or straight to class selection.
  if (window.startCutscene) {
    startCutscene('death', {
      onDone: () => {
        // After cutscene, open class selection (which leads to starter loadout) directly.
        hideModal(); // ensure any stale modal hidden
        startRun();
      }
    });
    return;
  }
  // Fallback if cutscenes not available
  modalTitle.textContent = "Game Over";
  modalContent.innerHTML = `<p>You fell on <b>Floor ${State.floor}</b> with <span class="gold"><b>${State.gold} gold</b></span>.</p><p>(Cutscene system unavailable)</p>`;
  modalFooter.innerHTML = "";
  const b = document.createElement("button");
  b.className = "btn btn--small btn--primary";
  b.textContent = "Restart run";
  b.onclick = () => { startRun(); hideModal(); };
  modalFooter.appendChild(b);
  showModal();
}