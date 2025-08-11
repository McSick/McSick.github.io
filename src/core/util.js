// Long-press tuning
        const LONG_PRESS_MS = 700; // hold duration to trigger details
        const MOVE_TOLERANCE = 10; // px of finger drift allowed
        // Simple settings persisted to localStorage
        const SETTINGS = {
          showHelpOnNewRun:
            localStorage.getItem("showHelpOnNewRun") === null
              ? true
              : localStorage.getItem("showHelpOnNewRun") === "true",
        };
        function setSetting(key, val) {
          SETTINGS[key] = !!val;
          try {
            localStorage.setItem(key, String(!!val));
          } catch (e) {}
        }

        function victoryCheck(origin = "") {
          // Only matters in combat rooms
          if (!(State.roomType === "BATTLE" || State.roomType === "BOSS"))
            return false;
          if (State.enemies.length > 0) return false;
          if (State._lootShown) return true; // guard against double-open

          State._lootShown = true;
          const goldGain =
            State.roomType === "BOSS"
              ? rand(60, 90) + 10 * (State.floor - 1)
              : rand(15, 30) + 5 * (State.floor - 1);

          State.gold += goldGain;
          updateHUD();

          // slight delay so the render can settle
          setTimeout(() => openLootModal(), 50);
          return true;
        }

        const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
        const choice = (arr) => arr[Math.floor(Math.random() * arr.length)];
        const clamp = (v, mi, ma) => Math.max(mi, Math.min(ma, v));

        // ========= canvas =========
