function smartSelfCast() {
          if (!State.selection || !State.selection.ab) return false;
          const ab = State.selection.ab;
          if (ab.type !== "heal" && ab.type !== "shield") return false;

          // Synthesize a tap at the center of the player's tile
          const cx = (offX + State.player.x * TILE + TILE / 2) / DPR;
          const cy = (offY + State.player.y * TILE + TILE / 2) / DPR;
          handleTap({ clientX: cx, clientY: cy }); // uses your existing handleTap logic
          return true;
        }

        (function setupKeyboard() {
          const abilityInfoEl = document.getElementById("abilityInfo");
          const ABILITY_HINT =
            "Click/tap an ability, then tap a tile. Hover to see details here.";
          const isModalOpen = () =>
            document.getElementById("modal")?.classList.contains("show");
          const typingTarget = (el) =>
            el && /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(el.tagName);

          function updateAbilityHUD() {
            if (typeof setAbilityInfoFromSelection === "function") {
              setAbilityInfoFromSelection();
            } else {
              // fallback if you didn’t add setAbilityInfoFromSelection earlier
              if (State.selection?.ab) {
                abilityInfoEl.textContent = `${State.selection.ab.name}: ${State.selection.ab.desc}`;
              } else {
                abilityInfoEl.textContent = ABILITY_HINT;
              }
            }
          }

          window.addEventListener(
            "keydown",
            (e) => {
              if (typingTarget(e.target)) return; // don't hijack typing
              if (isModalOpen()) {
                // allow Esc to close modal quickly
                if (e.code === "Escape") {
                  e.preventDefault();
                  hideModal?.();
                }
                return;
              }

              // Movement: WASD + Arrows
              if (e.code === "ArrowUp" || e.code === "KeyW") {
                e.preventDefault();
                dirMove(0, -1);
                return;
              }
              if (e.code === "ArrowDown" || e.code === "KeyS") {
                e.preventDefault();
                dirMove(0, 1);
                return;
              }
              if (e.code === "ArrowLeft" || e.code === "KeyA") {
                e.preventDefault();
                dirMove(-1, 0);
                return;
              }
              if (e.code === "ArrowRight" || e.code === "KeyD") {
                e.preventDefault();
                dirMove(1, 0);
                return;
              }
              // Enter/Space → smart self-cast (heal/shield) if an ability is selected
              if (
                e.code === "Enter" ||
                e.code === "Space" ||
                e.code === "NumpadEnter"
              ) {
                if (isModalOpen()) return;
                if (smartSelfCast()) {
                  e.preventDefault();
                  return;
                }
              }

              // Quick ability select: 1-4 (and Numpad 1-4)
              if (e.code === "Digit1" || e.code === "Numpad1") {
                e.preventDefault();
                selectAbility(0);
                updateAbilityHUD();
                SFX.beep("ui");
                return;
              }
              if (e.code === "Digit2" || e.code === "Numpad2") {
                e.preventDefault();
                selectAbility(1);
                updateAbilityHUD();
                SFX.beep("ui");
                return;
              }
              if (e.code === "Digit3" || e.code === "Numpad3") {
                e.preventDefault();
                selectAbility(2);
                updateAbilityHUD();
                SFX.beep("ui");
                return;
              }
              if (e.code === "Digit4" || e.code === "Numpad4") {
                e.preventDefault();
                selectAbility(3);
                updateAbilityHUD();
                SFX.beep("ui");
                return;
              }

              // Optional: Esc cancels current selection
              if (e.code === "Escape") {
                if (State.selection) {
                  State.selection = null;
                  updateAbilityHUD();
                  SFX.beep("ui");
                }
              }
            },
            { passive: false }
          );
        })();

        // ========= render =========
