const CLASSES = {
  Wizard: {
    desc: "Spells +1 range. Elements last longer.",
    onMakeAbility: (ab) => {
      if (ab.type === "attack")
        ab.range = Math.min(4, (ab.range || 1) + 1);
    },
    spriteSet: "wizzard_m",
    talents: [
      {
        key: "ArcaneBattery",
        label: "Arcane Battery — every 3rd spell refunds cooldown",
        apply: (p) => (p.talents.ArcaneBattery = true),
      },
      {
        key: "Glacier",
        label: "Glacier — Freeze lasts +1",
        apply: (p) => (p.talents.Glacier = true),
      },
      {
        key: "Conduction",
        label: "Conduction — Shocked enemies take +25% dmg",
        apply: (p) => (p.talents.Conduction = true),
      },
    ],
  },
  Rogue: {
    desc: "End turn away from enemies to gain Stealth. Attacking from Stealth grants a Page.",
    spriteSet: "elf_m",
    passiveEndTurn: () => {
      const adj = State.enemies.some(
        (e) =>
          Math.abs(e.x - State.player.x) +
          Math.abs(e.y - State.player.y) ===
          1
      );
      if (!adj) {
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
      }
    },
    talents: [
      {
        key: "Flurry",
        label: "Flurry — First attack each battle hits twice",
        apply: (p) => (p.talents.Flurry = true),
      },
      {
        key: "ShadowScholar",
        label: "Shadow Scholar — End turns in Stealth: +1 Page",
        apply: (p) => (p.talents.ShadowScholar = true),
      },
      {
        key: "Expose",
        label: "Expose — Bleeding enemies take +30% dmg",
        apply: (p) => (p.talents.Expose = true),
      },
    ],
  },
  Fighter: {
    desc: "+20 max HP. On kill gain Haste (extra action).",
    onStart: (p) => {
      p.maxHp += 20;
      p.hp = p.maxHp;
    },
    spriteSet: "knight_m",
    passiveOnKill: () => {
      State.extraActions++;
      addFloatText(
        State.player.x,
        State.player.y,
        "HASTE!",
        "#aef5a9",
        50
      );
    },
    talents: [
      {
        key: "Riposte",
        label: "Riposte — 25% to counter 6 dmg when hit",
        apply: (p) => (p.talents.Riposte = true),
      },
      {
        key: "BrutalStrikes",
        label: "Brutal Strikes — +20% attack dmg",
        apply: (p) => (p.talents.BrutalStrikes = true),
      },
      {
        key: "Bulwark",
        label: "Bulwark — Start each battle with 15 Shield",
        apply: (p) => (p.talents.Bulwark = true),
      },
    ],
  },
  Cleric: {
    desc: "Heals grant 50% as Shield and cleanse 1 debuff.",
    spriteSet: "doc",
    passiveOnHeal: (amt) => {
      State.player.shields += Math.floor(amt * 0.5);
      cleanseOne(State.player);
      addFloatText(
        State.player.x,
        State.player.y,
        "+Shield",
        "#c9ffe5",
        40
      );
    },
    talents: [
      {
        key: "Sanctify",
        label: "Sanctify — Heals +20%; purge enemy buffs",
        apply: (p) => (p.talents.Sanctify = true),
      },
      {
        key: "Aegis",
        label: "Aegis — Begin each floor with 10 Shield",
        apply: (p) => (p.talents.Aegis = true),
      },
      {
        key: "Mercy",
        label: "Mercy — 20% at turn start: -1 to all CDs",
        apply: (p) => (p.talents.Mercy = true),
      },
    ],
  },
};
function cleanseOne(ent) {
  if (!ent.effects) return;
  const bad = [
    EFFECTS.BURN,
    EFFECTS.POISON,
    EFFECTS.BLEED,
    EFFECTS.SHOCK,
    EFFECTS.FREEZE,
    EFFECTS.STUN,
  ];
  const i = ent.effects.findIndex((e) => bad.includes(e.type));
  if (i >= 0) ent.effects.splice(i, 1);
}

