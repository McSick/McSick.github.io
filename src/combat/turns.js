function startPlayerTurn() {
          processStartEffects(State.player);
          if (victoryCheck("turnStart")) return;

          const frozen = hasEffect(State.player, EFFECTS.FREEZE);
          const stunned = hasEffect(State.player, EFFECTS.STUN);
          const skip = frozen || stunned; // Stealth NEVER causes skip

          if (
            State.player.class === "Cleric" &&
            State.player.talents.Mercy &&
            Math.random() < 0.2
          ) {
            State.player.abilities.forEach((a) => {
              if (a.cdLeft > 0) a.cdLeft--;
            });
            addFloatText(
              State.player.x,
              State.player.y,
              "Mercy",
              "#c9ffe5",
              40
            );
          }

          renderAbilityButtons();
          updateHUD();

          if (State.player.hp <= 0) {
            gameOver();
            return;
          }
          if (skip) {
            addFloatText(
              State.player.x,
              State.player.y,
              frozen ? "Frozen" : "Stunned",
              "#b0c7ff",
              40
            );
            endPlayerTurn(true);
            return;
          }
        }

        function endPlayerTurn(skipped = false) {
          State.player.abilities.forEach((ab) => {
            if (ab.cdLeft > 0) ab.cdLeft = Math.max(0, ab.cdLeft - 1);
          });

          // Decay STEALTH/HASTE after you act
          tickEndTurnBuffs(State.player);

          // Rogue passive: apply new Stealth if not adjacent
          if (State.player.class === "Rogue" && CLASSES.Rogue.passiveEndTurn)
            CLASSES.Rogue.passiveEndTurn();

          // Shadow Scholar: if you end the turn in Stealth, gain a Page
          if (
            State.player.class === "Rogue" &&
            State.player.talents.ShadowScholar &&
            hasEffect(State.player, EFFECTS.STEALTH)
          ) {
            State.player.pages++;
            addFloatText(
              State.player.x,
              State.player.y,
              "+Page",
              "#c8b8ff",
              40
            );
          }

          if (!skipped && State.extraActions > 0) {
            State.extraActions--;
            startPlayerTurn();
            return;
          }
          State.turn = "ENEMY";
          enemyTurn();
        }

        function enemyTurn() {
          for (const e of [...State.enemies]) {
            const { skip } = processEffects(e);
            if (e.hp <= 0) continue;
            if (skip) continue;
            const step = nextStepTowards(e, State.player.x, State.player.y);
            if (step.x !== e.x || step.y !== e.y) {
              e.x = step.x;
              e.y = step.y;
              e.movingTicks = 6;
              applyTileOnEnter(e);
            }
            if (hasEffect(e, EFFECTS.BLEED)) e.hp -= 6;
            if (
              Math.abs(e.x - State.player.x) +
                Math.abs(e.y - State.player.y) ===
              1
            ) {
              let dmg = e.dmg;
              if (State.player.shields > 0) {
                const soak = Math.min(State.player.shields, dmg);
                State.player.shields -= soak;
                dmg -= soak;
              }
              if (dmg > 0) {
                State.player.hp -= dmg;
                addFloatText(
                  State.player.x,
                  State.player.y,
                  `-${dmg}`,
                  "#ff8a8a",
                  50
                );
                screenShake(8);
                FX.hitFlash = Math.min(0.3, FX.hitFlash + 0.2);
                SFX.beep("hit");
                if (
                  State.player.class === "Fighter" &&
                  State.player.talents.Riposte &&
                  Math.random() < 0.25
                ) {
                  e.hp -= 6;
                  addFloatText(e.x, e.y, "-6 (Riposte)", "#ffe0a5", 40);
                }
              }
            }
          }
          State.enemies = State.enemies.filter((e) => e.hp > 0);
          if (victoryCheck("enemyTurn")) return;
          updateHUD();
          if (State.player.hp <= 0) {
            gameOver();
            return;
          }
          State.turn = "PLAYER";
          startPlayerTurn();
        }

        // ========= tap targeting =========
