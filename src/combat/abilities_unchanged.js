const RARITY = [
          { key: "Common", color: "#c8d0e0", weight: 40, mult: 1 },
          { key: "Uncommon", color: "#7cf59a", weight: 30, mult: 1.2 },
          { key: "Rare", color: "#8ad1ff", weight: 18, mult: 1.45 },
          { key: "Epic", color: "#b189ff", weight: 9, mult: 1.8 },
          { key: "Legendary", color: "#ffbf4f", weight: 3, mult: 2.3 },
        ];
        const weightedPick = () => {
          const tot = RARITY.reduce((a, r) => a + r.weight, 0);
          let r = Math.random() * tot;
          for (const it of RARITY) {
            if ((r -= it.weight) <= 0) return it;
          }
          return RARITY[0];
        };
        const PREFIX = [
          "Rusty",
          "Fine",
          "Cruel",
          "Heroic",
          "Mystic",
          "Ancient",
          "Gilded",
          "Doomed",
          "Serrated",
          "Blessed",
        ];
        const ELEMENT = [
          "",
          "Flaming",
          "Frost",
          "Shock",
          "Venom",
          "Holy",
          "Shadow",
        ];
        const BASE = [
          { key: "Slash", type: "attack" },
          { key: "Bolt", type: "attack" },
          { key: "Blast", type: "attack" },
          { key: "Stab", type: "attack" },
          { key: "Heal", type: "heal" },
          { key: "Shield", type: "shield" },
          { key: "Blink", type: "move" },
          { key: "Hide", type: "stealth" },
          { key: "Tome", type: "tome" },
        ];
        function makeAbility() {
          const rar = weightedPick();
          const pre = choice(PREFIX);
          const ele = choice(ELEMENT);
          const base = choice(BASE);
          const mult = rar.mult;
          let dmg = 0,
            heal = 0,
            shield = 0,
            range = 1,
            cd = 0,
            desc = "",
            hits = 1,
            type = base.type,
            element = null;
          if (type === "attack") {
            dmg = Math.round(choice([7, 9, 11, 13, 15]) * mult);
            range = choice([1, 2, 3]);
            cd = choice([0, 1, 2]);
            hits = Math.random() < 0.15 ? 2 : 1;
            element = ele || null;
            desc = `Deal ${dmg}${
              hits > 1 ? ` x${hits}` : ""
            } at range ${range}${element ? ` (${element})` : ""}.`;
          }
          if (type === "heal") {
            heal = Math.round(choice([10, 14, 18, 22]) * mult);
            cd = choice([1, 2]);
            desc = "Restore " + heal + " HP. (Cleric: Shield & cleanse)";
          }
          if (type === "shield") {
            shield = Math.round(choice([8, 12, 16, 20]) * mult);
            cd = choice([2, 3]);
            desc = `Gain ${shield} Shield for 1 room.`;
          }
          if (type === "move") {
            range = choice([2, 3]);
            cd = choice([1, 2]);
            desc = `Teleport within ${range} tiles.`;
          }
          if (type === "stealth") {
            cd = 2;
            range = 0;
            desc = "Enter Stealth for 1 turn.";
          }
          if (type === "tome") {
            cd = 1;
            range = 0;
            desc = "Spend up to 2 Pages: +1 hit to next attack per Page.";
          }
          const name = [pre, ele, base.key].filter(Boolean).join(" ");
          const ab = {
            name,
            rarity: rar.key,
            color: rar.color,
            type,
            dmg,
            heal,
            shield,
            range,
            cd,
            cdLeft: 0,
            desc,
            hits,
            element,
          };
          const c = State.player.class && CLASSES[State.player.class];
          if (c && c.onMakeAbility) c.onMakeAbility(ab);
          return ab;
        }
        const newAbilitySet = () =>
          Array.from({ length: 4 }, () => makeAbility());

        // ========= armor =========
