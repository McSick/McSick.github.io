function openClassSelect() {
          modalTitle.textContent = "Choose Your Class";
          modalContent.innerHTML = "";
          modalFooter.innerHTML = "";
          const wrap = document.createElement("div");
          wrap.className = "choices";
          Object.entries(CLASSES).forEach(([name, def]) => {
            const d = document.createElement("div");
            d.className = "choice";
            d.innerHTML = `<div class='title'>${name}</div><div class='row'>${def.desc}</div>`;
            const b = document.createElement("button");
            b.className = "btn btn--small btn--primary";
            b.textContent = `Become ${name}`;
            b.onclick = () => {
              State.player.class = name;
              State.player.spriteSet = spriteSetForClass(name);
              if (def.onStart) def.onStart(State.player);
              State.player.abilities = newAbilitySet();
              State._flurryUsed = false;
              renderAbilityButtons();
              updateHUD();
              hideModal();
              nextRoom();
              SFX.beep("ui");
            };
            d.appendChild(b);
            wrap.appendChild(d);
          });
          const legend = document.createElement("div");
          legend.className = "choice";
          legend.innerHTML =
            "<div class='title'>Legend</div><div class='row'>Tap an ability then tap a tile • hover on an ability for details • Puddle = stealth • Blue flask = Page • Green flask = heal • Spikes = trap • Hole = lava</div>";
          wrap.appendChild(legend);
          modalContent.appendChild(wrap);
          showModal();
        }

        function startRun() {
          State._lootShown = false;
          State.gold = 0;
          State.floor = 1;
          State.stage = 0;
          State.stageFloor = 1;
          State.storyIndex = 0;
          Object.assign(State.player, {
            hp: 100,
            maxHp: 100,
            shields: 0,
            effects: [],
            pages: 0,
            armor: null,
            armorMods: {},
            talents: {},
            movingTicks: 0,
          });
          State.pendingHits = 0;
          State.extraActions = 0;
          State._flurryUsed = false;
          renderAbilityButtons();
          updateHUD();
          addToast("A new run begins...", "#cde3ff", 120);
          const launchClassSelect = () => {
            if (SETTINGS.showHelpOnNewRun) {
              openControlsModal({ afterClose: () => openClassSelect() });
            } else {
              openClassSelect();
            }
          };
          // If intro cutscene not yet viewed this session, play it first
          if (!State._introPlayed && window.startCutscene) {
            State._introPlayed = true;
            startCutscene('intro', { onDone: launchClassSelect });
          } else {
            launchClassSelect();
          }
        }

        // ========= self-tests =========
