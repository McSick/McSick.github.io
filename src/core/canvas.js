const canvas = document.getElementById("game");
        const ctx = canvas.getContext("2d");
        const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
        function resize() {
          canvas.width = Math.floor(window.innerWidth * DPR);
          canvas.height = Math.floor(window.innerHeight * DPR);
          canvas.style.width = "100%";
          canvas.style.height = "100%";
        }
        window.addEventListener("resize", resize, { passive: true });
        resize();

        // grid
        const GRID_W = 8,
          GRID_H = 6,
          TILE = Math.floor(
            Math.min(canvas.width / (GRID_W + 2), canvas.height / (GRID_H + 4))
          );
        const offX = Math.floor((canvas.width - GRID_W * TILE) / 2);
        const offY = Math.floor((canvas.height - GRID_H * TILE) / 2);
        const BASE_UNIT = 16; // atlas tile unit
        const SCALE = (TILE - 2) / BASE_UNIT;

        // ========= atlas: 0x72 tileset.png =========
