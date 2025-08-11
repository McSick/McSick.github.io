const EFFECTS = {
          BURN: "Burn",
          FREEZE: "Freeze",
          SHOCK: "Shock",
          POISON: "Poison",
          BLEED: "Bleed",
          STUN: "Stun",
          STEALTH: "Stealth",
          HASTE: "Haste",
        };
        const FX = { floaters: [], hitFlash: 0, shake: 0, toasts: [] };
        function addFloatText(gx, gy, text, color = "#fff", life = 60) {
          const x = offX + gx * TILE + TILE / 2 + rand(-6, 6),
            y = offY + gy * TILE + TILE / 2 + rand(-2, 2);
          FX.floaters.push({ x, y, vy: -0.6, life, ttl: life, text, color });
        }
        function addToast(text, color = "#fff", time = 120) {
          FX.toasts.push({ text, color, time });
        }
        function screenShake(s = 6) {
          FX.shake = Math.max(FX.shake, s);
        }
function addEffect(ent, type, dur = 1, power = 0) {
  if (!ent.effects) ent.effects = [];
  const existing = ent.effects.find((e) => e.type === type);
  if (existing) {
    existing.duration = Math.max(existing.duration, dur);
    existing.power = Math.max(existing.power, power);
    existing.maxDuration = Math.max(existing.maxDuration || 0, existing.duration);
  } else {
    ent.effects.push({ type, duration: dur, power, maxDuration: dur });
  }
}
        function hasEffect(ent, type) {
          return (
            ent.effects &&
            ent.effects.some((e) => e.type === type && e.duration > 0)
          );
        }
        function consumeEffect(ent, type) {
          if (!ent.effects) return;
          const i = ent.effects.findIndex(
            (e) => e.type === type && e.duration > 0
          );
          if (i >= 0) ent.effects.splice(i, 1);
        }

        // Start-of-turn processing: don't tick down STEALTH/HASTE here
        function processStartEffects(entity) {
          if (!entity.effects) return;
          const out = [];
          for (const eff of entity.effects) {
            switch (eff.type) {
              case EFFECTS.BURN:
                entity.hp -= eff.power || 4;
                eff.duration--;
                addFloatText(
                  entity.x,
                  entity.y,
                  `-${eff.power || 4}🔥`,
                  "#ffb0a0",
                  40
                );
                break;
              case EFFECTS.POISON:
                entity.hp -= eff.power || 5;
                eff.duration--;
                addFloatText(
                  entity.x,
                  entity.y,
                  `-${eff.power || 5}☠`,
                  "#9cff9c",
                  40
                );
                break;
              case EFFECTS.FREEZE:
              case EFFECTS.STUN:
                // decrement but DO NOT decide skip here—caller will check explicitly
                eff.duration--;
                break;
              case EFFECTS.STEALTH:
              case EFFECTS.HASTE:
                // positive buffs last through your action — don't tick here
                break;
              default:
                eff.duration--;
                break;
            }
            if (eff.duration > 0) out.push(eff);
          }
          entity.effects = out;
        }

        // End-of-turn decay for positive buffs that should last through your action
        function tickEndTurnBuffs(entity) {
          if (!entity.effects) return;
          for (const eff of entity.effects) {
            if (eff.type === EFFECTS.STEALTH || eff.type === EFFECTS.HASTE) {
              eff.duration--;
            }
          }
          entity.effects = entity.effects.filter((e) => e.duration > 0);
        }

        function splashDamage(cx, cy, amt) {
          for (const e of State.enemies) {
            if (Math.abs(e.x - cx) + Math.abs(e.y - cy) === 1) {
              e.hp -= amt;
              addFloatText(e.x, e.y, `-${amt}`, "#ffd18a", 40);
            }
          }
        }
        function onHitCombos(attacker, target, base, meta) {
          let dmg = base;
          if (hasEffect(target, EFFECTS.FREEZE)) {
            dmg = Math.round(dmg * 1.5);
            consumeEffect(target, EFFECTS.FREEZE);
            if (Math.random() < 0.25) addEffect(target, EFFECTS.STUN, 1);
            addFloatText(target.x, target.y, "SHATTER!", "#bde0ff", 40);
          }
          if (meta.element === "Shock" && hasEffect(target, EFFECTS.BURN)) {
            splashDamage(target.x, target.y, 10);
            addFloatText(target.x, target.y, "OVERLOAD", "#ffe477", 40);
          }
          if (hasEffect(attacker, EFFECTS.STEALTH)) {
            dmg = Math.round(dmg * 1.5);
            if (State.player === attacker) State.player.pages++;
            consumeEffect(attacker, EFFECTS.STEALTH);
            State.extraActions++;
            addFloatText(attacker.x, attacker.y, "BACKSTAB!", "#d6b8ff", 45);
          }
          return dmg;
        }

        // ========= story / stages =========


// ======= Effect metadata for UI badges & tooltips =======
const EFFECT_META = {
  [EFFECTS.BURN]:   { icon: "🔥", color: "#ff7a7a", desc: "Lose HP each turn; Fire damage." },
  [EFFECTS.FREEZE]: { icon: "❄️", color: "#7ad1ff", desc: "Chance to skip a turn; brittle to melee." },
  [EFFECTS.SHOCK]:  { icon: "⚡", color: "#ffe477", desc: "Chain reactions with Burn; bonus damage from lightning." },
  [EFFECTS.POISON]: { icon: "☠️", color: "#9be37a", desc: "Damage over time; stacks lightly." },
  [EFFECTS.BLEED]:  { icon: "🩸", color: "#ff9bb0", desc: "Damage when moving or on turn start." },
  [EFFECTS.STUN]:   { icon: "💫", color: "#ffd6f2", desc: "Cannot act while stunned." },
  [EFFECTS.STEALTH]:{ icon: "🕵️", color: "#d6b8ff", desc: "Next attack deals more; grants extra action." },
  [EFFECTS.HASTE]:  { icon: "🏃", color: "#7cf59a", desc: "Gain extra action / shorter cooldowns." },
};
function getEffectMeta(type) {
  return EFFECT_META[type] || { icon: "?", color: "#bbb", desc: "" };
}
