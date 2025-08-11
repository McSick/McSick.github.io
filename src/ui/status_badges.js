// Draw small status chips (icon + duration) above an entity (enemy or player)
function drawStatusBadges(entity) {
  if (!entity || !entity.effects || entity.effects.length === 0) return;
  const gx = offX + entity.x * TILE + TILE / 2;
  const gy = offY + entity.y * TILE + TILE / 2;

  // layout: row of circles just above the HP bar
  const R = Math.max(8, Math.floor(TILE * 0.12)); // badge radius in px
  const gap = Math.max(2, Math.floor(R * 0.3));
  const totalW = entity.effects.length * (R*2) + (entity.effects.length - 1) * gap;
  let x = gx - totalW / 2;

  const y = gy - TILE * 0.8; // above hp bar


  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `${Math.max(10, Math.floor(R*0.9)) * DPR}px sans-serif`;

  entity.effects.forEach((eff, i) => {
    const meta = getEffectMeta(eff.type);
    const cx = x + R;
    const cy = y + R;

    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.beginPath(); ctx.arc(cx+1, cy+1, R, 0, Math.PI*2); ctx.fill();

    // Badge background
    ctx.fillStyle = meta.color;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI*2); ctx.fill();

    // Icon (emoji)
    ctx.fillStyle = "#111";
    ctx.fillText(meta.icon, cx, cy);

    // Duration ring
    const maxDur = Math.max(eff.maxDuration || eff.duration || 1, 1);
    const frac = Math.max(0.05, Math.min(1, Math.max(0, (eff.duration || 0)) / maxDur));
    ctx.strokeStyle = "#111";
    ctx.lineWidth = Math.max(1, Math.floor(R*0.20));
    ctx.beginPath();
    ctx.arc(cx, cy, R - ctx.lineWidth*0.5, -Math.PI/2, -Math.PI/2 + Math.PI*2*frac);
    ctx.stroke();

    // Duration number
    // ctx.fillStyle = "#111";
    // ctx.font = `${Math.max(9, Math.floor(R*0.8)) * DPR}px sans-serif`;
    // ctx.fillText(String(Math.max(0, eff.duration|0)), cx, cy + R + Math.max(8, Math.floor(R*0.9)));
    x += R*2 + gap;
  });

  ctx.restore();
}
