// pick small enemy sprite sets
        const ENEMY_SETS = [
          {
            key: "goblin",
            idle: "goblin_idle_anim_f",
            run: "goblin_run_anim_f",
            frames: 4,
            w: 16,
            h: 16,
          },
          {
            key: "skelet",
            idle: "skelet_idle_anim_f",
            run: "skelet_run_anim_f",
            frames: 4,
            w: 16,
            h: 16,
          },
          {
            key: "orc",
            idle: "orc_warrior_idle_anim_f",
            run: "orc_warrior_run_anim_f",
            frames: 4,
            w: 16,
            h: 23,
          },
          {
            key: "imp",
            idle: "imp_idle_anim_f",
            run: "imp_run_anim_f",
            frames: 4,
            w: 16,
            h: 16,
          },
          {
            key: "wogol",
            idle: "wogol_idle_anim_f",
            run: "wogol_run_anim_f",
            frames: 4,
            w: 16,
            h: 23,
          },
        ];
        const BOSS_SET = {
          idle: "big_demon_idle_anim_f",
          run: "big_demon_run_anim_f",
          frames: 4,
          w: 32,
          h: 36,
        };

        function spriteSetForClass(clazz) {
          if (clazz === "Wizard")
            return {
              idle: "wizzard_m_idle_anim_f",
              run: "wizzard_m_run_anim_f",
              frames: 4,
              w: 16,
              h: 28,
            };
          if (clazz === "Rogue")
            return {
              idle: "elf_m_idle_anim_f",
              run: "elf_m_run_anim_f",
              frames: 4,
              w: 16,
              h: 28,
            };
          if (clazz === "Fighter")
            return {
              idle: "knight_m_idle_anim_f",
              run: "knight_m_run_anim_f",
              frames: 4,
              w: 16,
              h: 28,
            };
          if (clazz === "Cleric")
            return {
              idle: "doc_idle_anim_f",
              run: "doc_run_anim_f",
              frames: 4,
              w: 16,
              h: 23,
            };
          return {
            idle: "wizzard_m_idle_anim_f",
            run: "wizzard_m_run_anim_f",
            frames: 4,
            w: 16,
            h: 28,
          };
        }

        function spawnEnemies() {
          const count = clamp(1 + Math.floor(State.floor / 2), 1, 4),
            enemies = [];
          let placed = 0;
          while (placed < count) {
            const x = GRID_W - 2 - rand(0, 2),
              y = rand(1, GRID_H - 2);
            if (!blocked(x, y)) {
              const set = choice(ENEMY_SETS);
              enemies.push({
                x,
                y,
                hp: 30 + 12 * State.floor,
                dmg: 8 + 2 * State.floor,
                effects: [],
                set,
                movingTicks: 0,
              });
              placed++;
            }
          }
          return enemies;
        }
        function spawnBoss() {
          const pos = { x: GRID_W - 3, y: Math.floor(GRID_H / 2) };
          if (blocked(pos.x, pos.y)) {
            pos.x = GRID_W - 2;
            pos.y = 1;
          }
          const b = STAGES[State.stage].boss;
          return [
            {
              ...pos,
              hp: b.hp,
              dmg: b.dmg,
              effects: [],
              isBoss: true,
              name: b.name,
              theme: b.theme,
              set: BOSS_SET,
              movingTicks: 0,
            },
          ];
        }

        // pathfinding
        const DIRS = [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ];
        function nextStepTowards(e, tx, ty) {
          if (Math.abs(e.x - tx) + Math.abs(e.y - ty) === 1)
            return { x: e.x, y: e.y };
          const q = [],
            prev = Array.from({ length: GRID_H }, () =>
              Array.from({ length: GRID_W }, () => null)
            );
          q.push([e.x, e.y]);
          prev[e.y][e.x] = [e.x, e.y];
          while (q.length) {
            const [cx, cy] = q.shift();
            for (const [dx, dy] of DIRS) {
              const nx = cx + dx,
                ny = cy + dy;
              if (!inBounds(nx, ny)) continue;
              if (prev[ny][nx]) continue;
              if (!aiPassable(nx, ny)) continue;
              if (
                State.enemies.some((o) => o !== e && o.x === nx && o.y === ny)
              )
                continue;
              if (hazardous(nx, ny)) continue;
              prev[ny][nx] = [cx, cy];
              if (nx === tx && ny === ty) {
                let qx = cx,
                  qy = cy;
                while (
                  prev[qy][qx] &&
                  !(prev[qy][qx][0] === e.x && prev[qy][qx][1] === e.y)
                ) {
                  const p = prev[qy][qx];
                  qx = p[0];
                  qy = p[1];
                }
                return { x: qx, y: qy };
              }
              q.push([nx, ny]);
            }
          }
          let best = { x: e.x, y: e.y, score: 9999 };
          for (const [dx, dy] of DIRS) {
            const nx = e.x + dx,
              ny = e.y + dy;
            if (!aiPassable(nx, ny)) continue;
            if (State.enemies.some((o) => o !== e && o.x === nx && o.y === ny))
              continue;
            let s = Math.abs(nx - tx) + Math.abs(ny - ty);
            if (hazardous(nx, ny)) s += 3;
            if (s < best.score) {
              best = { x: nx, y: ny, score: s };
            }
          }
          return { x: best.x, y: best.y };
        }

        // ========= flow =========
