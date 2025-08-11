function runSelfTests() {
          const results = [];
          const ok = (name, cond) => {
            results.push({ name, pass: !!cond });
            if (!cond) console.error("❌", name);
          };
          try {
            // tileAt safe
            const keep = Map.tiles;
            Map.tiles = [];
            ok("tileAt safe on empty map", typeof tileAt(0, 0) === "number");
            Map.tiles = keep;
            // frames exist
            ok("has floor_1", !!ASSETS.frames["floor_1"]);
            ok("has wall_mid", !!ASSETS.frames["wall_mid"]);
            ok("has goblin idle", !!ASSETS.frames["goblin_idle_anim_f0"]);
            ok(
              "has class wizard idle",
              !!ASSETS.frames["wizzard_m_idle_anim_f0"]
            );
            ok("has boss frame", !!ASSETS.frames["big_demon_idle_anim_f0"]);
            // BFS returns in-bounds
            genRoom();
            const e = {
              x: GRID_W - 2,
              y: Math.floor(GRID_H / 2),
              hp: 10,
              dmg: 1,
              effects: [],
            };
            const step = nextStepTowards(e, 1, Math.floor(GRID_H / 2));
            ok("BFS step in-bounds", step && inBounds(step.x, step.y));
          } catch (err) {
            console.error("Self-tests error", err);
          }
          console.table(results);
        }

        // boot
        runSelfTests();
        startRun();
        requestAnimationFrame(loop);
