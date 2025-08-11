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
  modalTitle.textContent =
    State.roomType === "BOSS"
      ? "Boss Defeated! Choose rewards"
      : "Victory! Choose rewards";
  modalContent.innerHTML = "";
  modalFooter.innerHTML = "";
  const root = document.createElement("div");
  const loot = [makeAbility(), makeAbility(), makeAbility()],
    abWrap = document.createElement("div");
  abWrap.className = "choices";
  loot.forEach((ab) => {
    const d = document.createElement("div");
    d.className = "choice";
    d.innerHTML = `<div class="title" style="color:${ab.color}">${ab.name
      } <span class="pill">${ab.rarity
      }</span></div><div class="row"><span>${ab.desc
      }</span></div><div class="row"><span class="pill">CD ${ab.cd
      }</span><span class="pill">Range ${ab.range || 1}</span>${ab.hits > 1 ? `<span class="pill">Hits ${ab.hits}</span>` : ""
      }</div>`;
    const b = document.createElement("button");
    b.className = "btn btn--small btn--primary";
    b.textContent = "Take & replace...";
    b.onclick = () => {
      replaceAbilityFlow(ab, 0);
      SFX.beep("loot");
    };
    d.appendChild(b);
    abWrap.appendChild(d);
  });
  root.appendChild(document.createElement("h3")).textContent =
    "Abilities";
  root.appendChild(abWrap);

  const roll = Math.random();
  if (roll < 0.5) {
    const picks = [choice(ARMOR_POOL), choice(ARMOR_POOL)],
      aw = document.createElement("div");
    aw.className = "choices";
    picks.forEach((a) => {
      const d = document.createElement("div");
      d.className = "choice";
      d.innerHTML = `<div class='title'>${a.name}</div><div class='row'>${a.desc}</div>`;
      const b = document.createElement("button");
      b.className = "btn btn--small btn--primary";
      b.textContent = "Equip";
      b.onclick = () => {
        equipArmor(a);
        hideModal();
        afterRewards();
      };
      d.appendChild(b);
      aw.appendChild(d);
    });
    root.appendChild(document.createElement("h3")).textContent =
      "Bonus: Armor";
    root.appendChild(aw);
  } else {
    const clazz = CLASSES[State.player.class];
    if (clazz) {
      const pool = [...clazz.talents];
      const picks = [
        pool.splice(rand(0, pool.length - 1), 1)[0],
        pool.splice(rand(0, Math.max(0, pool.length - 1)), 1)[0],
      ].filter(Boolean);
      if (picks.length) {
        const tw = document.createElement("div");
        tw.className = "choices";
        picks.forEach((t) => {
          const d = document.createElement("div");
          d.className = "choice";
          d.innerHTML = `<div class='title'>${t.label}</div>`;
          const b = document.createElement("button");
          b.className = "btn btn--small btn--primary";
          b.textContent = "Learn";
          b.onclick = () => {
            t.apply(State.player);
            hideModal();
            afterRewards();
          };
          d.appendChild(b);
          tw.appendChild(d);
        });
        root.appendChild(document.createElement("h3")).textContent =
          "Bonus: Talent";
        root.appendChild(tw);
      }
    }
  }
  modalContent.appendChild(root);
  const skip = document.createElement("button");
  skip.className = "btn btn--ghost";
  skip.textContent = "Skip (keep current)";
  skip.onclick = () => {
    hideModal();
    afterRewards();
  };
  modalFooter.appendChild(skip);
  showModal();
}
function afterRewards() {
  const wasBoss = State.roomType === "BOSS";
  if (wasBoss) {
    modalTitle.textContent = "Run Cleared!";
    modalContent.innerHTML = `<p>You extinguished the <b>${STAGES[State.stage].boss.name
      }</b> and calmed the <b>${STAGES[State.stage].name
      }</b>.</p><p>Floor reached: <b>${State.floor
      }</b> • Gold: <span class='gold'><b>${State.gold}</b></span></p>`;
    modalFooter.innerHTML = "";
    const b = document.createElement("button");
    b.className = "btn btn--small btn--primary";
    b.textContent = "Start a new run";
    b.onclick = () => {
      startRun();
      hideModal();
    };
    modalFooter.appendChild(b);
    showModal();
    return;
  }
  State.floor++;
  State.stageFloor++;
  nextRoom();
}
function gameOver() {
  modalTitle.textContent = "Game Over";
  modalContent.innerHTML = `<p>You fell on <b>Floor ${State.floor}</b> with <span class="gold"><b>${State.gold} gold</b></span>.</p>`;
  modalFooter.innerHTML = "";
  const b = document.createElement("button");
  b.className = "btn btn--small btn--primary";
  b.textContent = "Restart run";
  b.onclick = () => {
    startRun();
    hideModal();
  };
  modalFooter.appendChild(b);
  showModal();
}