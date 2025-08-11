const ARMOR_POOL = [
          {
            name: "Leather of Shadows",
            desc: "+1 Stealth duration; attacks from Stealth +10%.",
            apply: (p) => {
              p.armorMods = { stealthPlus: 1, stealthDmg: 1.1 };
            },
          },
          {
            name: "Frostplate",
            desc: "Attacks inflict brief Freeze (1).",
            apply: (p) => {
              p.armorMods = { onHitFreeze: 1 };
            },
          },
          {
            name: "Storm Mail",
            desc: "Shock duration +1; Overload splash +5 dmg.",
            apply: (p) => {
              p.armorMods = { shockPlus: 1, overloadPlus: 5 };
            },
          },
          {
            name: "Pyromancer Robe",
            desc: "Burn ticks +2.",
            apply: (p) => {
              p.armorMods = { burnPlus: 2 };
            },
          },
          {
            name: "Knight's Bulwark",
            desc: "Start battle with +15 Shield.",
            apply: (p) => {
              p.armorMods = { startShield: 15 };
            },
          },
        ];
        function equipArmor(a) {
          State.player.armor = a;
          a.apply(State.player);
          updateHUD();
          addToast(`Equipped: ${a.name}`, "#ffd6a6");
          SFX.beep("ui");
        }

        // ========= enemies / sprites =========
