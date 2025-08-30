// Lightweight cutscene / dialogue system for Isekai narrative.
// Usage:
//   startCutscene('intro');
// Define sequences in CUTSCENES below. Each step can have (backward compatible):
// Legacy (single speaker change): { speaker, text, img, side, effect }
// Extended (dual portrait + bg): {
//   speaker, text,
//   leftImg,   // optional: update left portrait (omit to keep previous)
//   rightImg,  // optional: update right portrait
//   bg,        // optional: update background image (fullscreen)
//   active,    // 'left' | 'right' to highlight speaking portrait
//   effect     // reserved for future (flash, shake, etc.)
// }
// If both legacy img+side and extended fields provided, extended wins.
// Portrait images persist between steps until replaced; same for bg.
// When a cutscene is active gameplay input is suspended.

const CUTSCENES = {
 intro: [
    {
      speaker: '???',
      text: "Cold floor... glowing circles... This isn't my apartment.\nDid I fall asleep at my desk?",
      bg: 'src/assets/cutscenes/summoning_chamber.png',
      rightImg: 'src/assets/cutscenes/hero_portrait.png',
      active: 'right'
    },
    {
      speaker: 'Guide Sprite',
      text: "You are conscious. Good. Summoning residue stable. No limb mismatches this time.",
      leftImg: 'src/assets/cutscenes/guide_portrait.png',
      active: 'left'
    },
    {
      speaker: 'You',
      text: "“This time?” Wait—who are you? Where is this? Why does the air feel... static?",
      active: 'right'
    },
    {
      speaker: 'Guide Sprite',
      text: "Titles: Archivist, Custodian, Reluctant Babysitter of Off‑World Strays.\nYou may call me your Guide.",
      active: 'left'
    },
    {
      speaker: 'You',
      text: "Off‑World? So I actually got isekai’d? I was joking about wanting a ‘fresh start.’",
      active: 'right'
    },
    {
      speaker: 'Guide Sprite',
      text: "Your original reality persists—mostly. Threads between worlds are fraying.\nStatistically, you were <i>borrowed</i>.",
      active: 'left'
    },
    {
      speaker: 'You',
      text: "Borrowed sounds temporary. I can go back after I help... stitch reality?",
      active: 'right'
    },
    {
      speaker: 'Guide Sprite',
      text: "Return probability improves with each stabilized Fracture. Declines with death. So: do not die.",
      active: 'left'
    },
    {
      speaker: 'You',
      text: "Great motivational speech. Any tutorial popups I should read first?",
      rightImg: 'src/assets/cutscenes/hero_confident.png',
      active: 'right'
    },
    {
      speaker: 'Guide Sprite',
      text: "Sarcasm detected. Installing adaptive hint throttling.\nFocus: you must assume a Class to anchor local mana.",
      active: 'left'
    },
    {
      speaker: 'You',
      text: "Class, like RPG rules. Can I multi‑class? Speedrun build? Break your system?",
      active: 'right'
    },
    {
      speaker: 'Guide Sprite',
      text: "Confidence noted. The Codex tracks your growth as “Pages.” Collect them; they attune relic logic.\nLose them, and progress decays.",
      active: 'left'
    },
    {
      speaker: 'You',
      text: "So Pages are meta progression. Gold is... normal loot? Anything cursed I should avoid?",
      active: 'right'
    },
    {
      speaker: 'Guide Sprite',
      text: "Avoid dying. Also singing mushrooms. Also negotiating with reflective puddles.\nEverything else: improvise.",
      active: 'left'
    },
    {
      speaker: 'You',
      text: "You’re oddly calm for someone watching realities unravel.",
      active: 'right'
    },
    {
      speaker: 'Guide Sprite',
      text: "Panic is inefficient. Besides, you are the eleventh candidate. Patterns form.",
      active: 'left'
    },
    {
      speaker: 'You',
      text: "What happened to the first ten?",
      active: 'right'
    },
    {
      speaker: 'Guide Sprite',
      text: "Some ascended. Some... desynchronized. Their echoes occasionally drop loot.\nDo not dwell.",
      active: 'left'
    },
    {
      speaker: 'You',
      text: "Comforting. Is there a big villain or am I fighting metaphors?",
      active: 'right'
    },
    {
      speaker: 'Guide Sprite',
      text: "An Intelligence behind the Fractures manipulates thresholds. Masked. Efficient. Testing you.\nExpect escalation.",
      active: 'left'
    },
    {
      speaker: 'You',
      text: "So mysterious masked entity, collapsing worlds, collectible Pages, and a Guide with deadpan humor.\nFine. What's first?",
      active: 'right'
    },
    {
      speaker: 'Guide Sprite',
      text: "Select a Class. Each channels different lattice vectors: defense, burst, control, sustain.\nChoice imprints your soul pattern—for now.",
      active: 'left'
    },
    {
      speaker: 'You',
      text: "“For now” huh. Maybe I'll sample everything. Let’s see the options.",
      active: 'right'
    },
    {
      speaker: 'Guide Sprite',
      text: "Commit when ready. I will observe, advise, and occasionally mock inefficient decisions.",
      active: 'left'
    },
    {
      speaker: 'You',
      text: "Deal. Let’s make this run count.",
      active: 'right'
    },
    {
      speaker: 'Guide Sprite',
      text: "Initiating Class Interface. Do not tap anything combustible.",
      active: 'left'
    },
    {
      speaker: 'System',
      text: "<b>Class selection unlocked.</b>\nAnchor your role. Gather Pages. Stabilize Fractures. Survive.",
      active: 'left'
    }
  ],
};

let _cutscene = null; // { key, index, steps, bg, leftSrc, rightSrc }

function isCutsceneActive() { return !!_cutscene; }

function startCutscene(key, opts = {}) {
  const steps = CUTSCENES[key];
  if (!steps || !steps.length) return console.warn('Cutscene missing:', key);
  _cutscene = { key, index: 0, steps, onDone: opts.onDone, bg: null, leftSrc: null, rightSrc: null };
  showCutsceneFrame();
}

function endCutscene() {
  hideCutsceneLayer();
  const done = _cutscene?.onDone;
  _cutscene = null;
  if (done) done();
}

// DOM layer (lazy create)
let cutLayer, cutBg, cutImgLeft, cutImgRight, cutTextBox, cutSpeaker, cutNextBtn, cutSkipBtn;

function ensureCutsceneLayer() {
  if (cutLayer) return;
  cutLayer = document.createElement('div');
  cutLayer.id = 'cutsceneLayer';
  cutLayer.innerHTML = `
    <div class="cutBg" id="cutBg"></div>
    <div class="cutInner">
      <div class="cutPortrait left"><img id="cutImgLeft" /></div>
      <div class="cutPortrait right"><img id="cutImgRight" /></div>
      <div class="cutDialogue">
        <div class="cutSpeaker" id="cutSpeaker"></div>
        <div class="cutText" id="cutText"></div>
        <div class="cutBtns">
          <button id="cutNextBtn" class="btn btn--small btn--primary">Next ▶</button>
          <button id="cutSkipBtn" class="btn btn--small btn--ghost">Skip</button>
        </div>
      </div>
    </div>`;
  document.getElementById('gameWrap').appendChild(cutLayer);
  cutBg = cutLayer.querySelector('#cutBg');
  cutImgLeft = cutLayer.querySelector('#cutImgLeft');
  cutImgRight = cutLayer.querySelector('#cutImgRight');
  cutTextBox = cutLayer.querySelector('#cutText');
  cutSpeaker = cutLayer.querySelector('#cutSpeaker');
  cutNextBtn = cutLayer.querySelector('#cutNextBtn');
  cutSkipBtn = cutLayer.querySelector('#cutSkipBtn');
  cutNextBtn.onclick = advanceCutscene;
  cutSkipBtn.onclick = endCutscene;
  cutLayer.addEventListener('click', (e) => {
    if (e.target === cutLayer || e.target === cutBg) advanceCutscene();
  });
  document.addEventListener('keydown', (e) => {
    if (!_cutscene) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      advanceCutscene();
    } else if (e.key === 'Escape') {
      endCutscene();
    }
  });
}

function showCutsceneFrame() {
  ensureCutsceneLayer();
  const step = _cutscene.steps[_cutscene.index];
  cutLayer.classList.add('show');
  cutSpeaker.textContent = step.speaker || '';
  cutTextBox.innerHTML = formatCutsceneText(step.text);
  // Update persistent media (bg + portraits) only if provided this step
  if (step.bg) {
    _cutscene.bg = step.bg;
    if (cutBg) {
      cutBg.style.backgroundImage = `url('${step.bg}')`;
    }
  } else if (!_cutscene.bg && cutBg) {
    // default solid if none ever set
    cutBg.style.background = 'linear-gradient(#101423,#070a16)';
  }

  // Extended fields
  if (step.leftImg) _cutscene.leftSrc = step.leftImg;
  if (step.rightImg) _cutscene.rightSrc = step.rightImg;
  // Legacy single update fallback
  if (step.img && step.side) {
    if (step.side === 'right') _cutscene.rightSrc = step.img; else _cutscene.leftSrc = step.img;
  }

  // Apply portrait sources
  if (_cutscene.leftSrc) {
    if (cutImgLeft.src !== _cutscene.leftSrc) cutImgLeft.src = _cutscene.leftSrc;
    cutImgLeft.parentElement.classList.add('on');
  }
  if (_cutscene.rightSrc) {
    if (cutImgRight.src !== _cutscene.rightSrc) cutImgRight.src = _cutscene.rightSrc;
    cutImgRight.parentElement.classList.add('on');
  }

  // Speaker highlighting
  const activeSide = step.active || step.side || null;
  [cutImgLeft.parentElement, cutImgRight.parentElement].forEach(p => {
    p.classList.remove('active', 'inactive');
  });
  if (activeSide === 'left' && _cutscene.leftSrc) {
    cutImgLeft.parentElement.classList.add('active');
    if (_cutscene.rightSrc) cutImgRight.parentElement.classList.add('inactive');
  } else if (activeSide === 'right' && _cutscene.rightSrc) {
    cutImgRight.parentElement.classList.add('active');
    if (_cutscene.leftSrc) cutImgLeft.parentElement.classList.add('inactive');
  }
  const last = _cutscene.index >= _cutscene.steps.length - 1;
  cutNextBtn.textContent = last ? 'Finish ✔' : 'Next ▶';
}

function advanceCutscene() {
  if (!_cutscene) return;
  if (_cutscene.index < _cutscene.steps.length - 1) {
    _cutscene.index++;
    showCutsceneFrame();
  } else {
    endCutscene();
  }
}

function hideCutsceneLayer() {
  if (cutLayer) cutLayer.classList.remove('show');
}

function formatCutsceneText(t) {
  if (!t) return '';
  return t
    .replace(/\n/g, '<br/>')
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/\*(.+?)\*/g, '<i>$1</i>');
}

// Integration example: run intro before class select on new run.
// In startRun() you can call: startCutscene('intro', { onDone: () => openClassSelect() });
// For now we expose startCutscene globally.
window.startCutscene = startCutscene;
window.isCutsceneActive = isCutsceneActive;
