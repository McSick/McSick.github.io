// src/ui/inspect_modal.js
function openInspectEntityModal(entity) {
  if (!entity) return;

  // Title + clear content
  modalTitle.textContent = entity.name ? `Inspect: ${entity.name}` : "Inspect";
  modalContent.innerHTML = "";
  modalFooter.innerHTML = "";

  const root = document.createElement("div");
  root.className = "choices";

  // ---- Summary card
  const summary = document.createElement("div");
  summary.className = "choice";
  const baseHp = entity.isBoss
    ? STAGES[State.stage].boss.hp
    : 30 + 12 * State.floor; // mirrors render.js
  const pct = Math.max(0, Math.min(1, entity.hp / baseHp));
  summary.innerHTML = `
    <div class="title">${entity.name || (entity.isBoss ? "Boss" : "Enemy")}</div>
    <div class="row">HP: <b>${entity.hp}</b> / ${baseHp} (${Math.round(pct * 100)}%)</div>
    ${entity.shields ? `<div class="row">Shields: <b>${entity.shields}</b></div>` : ""}
  `;
  root.appendChild(summary);

  // ---- Status effects
  const effBox = document.createElement("div");
  effBox.className = "choice";
  effBox.innerHTML = `<div class="title">Status Effects</div>`;
  const effWrap = document.createElement("div");
  effWrap.className = "row";

  const active = (entity.effects || []).filter(e => (e.duration || 0) > 0);
  if (!active.length) {
    const none = document.createElement("div");
    none.textContent = "No active effects.";
    effWrap.appendChild(none);
  } else {
    active.forEach(eff => {
      const meta = getEffectMeta ? getEffectMeta(eff.type) : { icon: "?", color: "#bbb", desc: "" };
      const pill = document.createElement("span");
      pill.className = "pill";
      pill.style.background = meta.color;
      pill.style.color = "#111";
      pill.style.margin = "4px";
      pill.title = meta.desc || "";
      pill.textContent = `${meta.icon} ${eff.type} • dur ${eff.duration}${eff.power ? ` • pow ${eff.power}` : ""}`;
      effWrap.appendChild(pill);
    });
  }
  effBox.appendChild(effWrap);
  root.appendChild(effBox);

  modalContent.appendChild(root);

  // Footer
  const close = document.createElement("button");
  close.className = "btn btn--small btn--primary";
  close.textContent = "Close";
  close.onclick = hideModal;
  modalFooter.appendChild(close);

  showModal();
}
