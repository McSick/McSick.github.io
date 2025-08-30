const RoomTypes = ["BATTLE", "STORY", "SHOP", "HEAL", "BOSS"];
function nextRoom() {
  State._lootShown = false;

  State.selection = null;
  State.turn = "PLAYER";
  State.extraActions = 0;
  const stage = STAGES[State.stage];
  const isBossNow = State.stageFloor > stage.floors;
  if (isBossNow) {
    State.roomType = "BOSS";
    genRoom();
    State.player.x = 1;
    State.player.y = Math.floor(GRID_H / 2);
    State.enemies = spawnBoss();
    addToast(`Boss: ${stage.boss.name}`, "#ff7ad6", 180);
    SFX.beep("boss");
  } else {
    const weights = { BATTLE: 55, STORY: 15, SHOP: 15, HEAL: 15 };
    const pool = [];
    for (const k of ["BATTLE", "STORY", "SHOP", "HEAL"])
      for (let i = 0; i < weights[k]; i++) pool.push(k);
    State.roomType = choice(pool);
    if (State.roomType === "BATTLE") {
      genRoom();
      State.player.x = 1;
      State.player.y = Math.floor(GRID_H / 2);
      State.enemies = spawnEnemies();
    } else {
      State.enemies = [];
      genRoom();
      openRoomModal();
    }
  }
  if (State.roomType === "BATTLE" || State.roomType === "BOSS") {
    if (State.player.armorMods?.startShield)
      State.player.shields += State.player.armorMods.startShield;
    if (State.player.class === "Cleric" && State.player.talents.Aegis)
      State.player.shields += 10;
  }
  updateHUD();
}

function updateHUD() {
  const stage = STAGES[State.stage];
  document.getElementById("roomType").textContent =
    State.roomType + ` (F${State.floor})`;
  document.getElementById("roomTheme").textContent =
    State.roomType === "BATTLE" || State.roomType === "BOSS"
      ? `• ${Map.theme}`
      : "";
  document.getElementById("gold").textContent = State.gold;
  document.getElementById("clazz").textContent = State.player.class;
  document.getElementById("pages").textContent = State.player.pages;
  document.getElementById("armorName").textContent = State.player.armor
    ? State.player.armor.name
    : "None";
  document.getElementById("hpFill").style.width =
    clamp(
      Math.round((State.player.hp / State.player.maxHp) * 100),
      0,
      100
    ) + "%";
  const progress = Math.min(
    100,
    Math.floor(
      (Math.min(State.stageFloor, stage.floors) / stage.floors) * 100
    )
  );
  document.getElementById("stageProg").style.width = progress + "%";
  document.getElementById("stageLabel").textContent = `${stage.name
    } ${Math.min(State.stageFloor, stage.floors)}/${stage.floors}`;
}

// ========= modal ui =========
