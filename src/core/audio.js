const SFX = {
          ctx: null,
          muted: false,
          vol: 0.5,
          _init() {
            if (this.ctx) return;
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return;
            this.ctx = new AC();
          },
          mute(t) {
            this.muted = t !== undefined ? !!t : !this.muted;
            document.getElementById("muteBtn").textContent = this.muted
              ? "🔈"
              : "🔊";
          },
          beep(type = "ui") {
            if (this.muted) return;
            this._init();
            if (!this.ctx) return;
            const ctx = this.ctx;
            const now = ctx.currentTime;
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.connect(g);
            g.connect(ctx.destination);
            const env = (a, d, s, r) => {
              g.gain.cancelScheduledValues(now);
              g.gain.setValueAtTime(0, now);
              g.gain.linearRampToValueAtTime(this.vol, now + a);
              g.gain.linearRampToValueAtTime(this.vol * s, now + a + d);
              g.gain.linearRampToValueAtTime(0.0001, now + a + d + r);
            };
            if (type === "hit") {
              o.type = "square";
              o.frequency.setValueAtTime(220, now);
              o.frequency.exponentialRampToValueAtTime(120, now + 0.1);
              env(0.005, 0.05, 0.3, 0.08);
            }
            if (type === "cast") {
              o.type = "sawtooth";
              o.frequency.setValueAtTime(440, now);
              o.frequency.exponentialRampToValueAtTime(660, now + 0.12);
              env(0.005, 0.08, 0.2, 0.1);
            }
            if (type === "heal") {
              o.type = "triangle";
              o.frequency.setValueAtTime(660, now);
              o.frequency.exponentialRampToValueAtTime(880, now + 0.12);
              env(0.005, 0.1, 0.5, 0.15);
            }
            if (type === "loot") {
              o.type = "triangle";
              o.frequency.setValueAtTime(880, now);
              o.frequency.exponentialRampToValueAtTime(1320, now + 0.14);
              env(0.005, 0.05, 0.2, 0.1);
            }
            if (type === "boss") {
              o.type = "square";
              o.frequency.setValueAtTime(160, now);
              o.frequency.exponentialRampToValueAtTime(120, now + 0.25);
              env(0.005, 0.12, 0.2, 0.25);
            }
            if (type === "ui") {
              o.type = "sine";
              o.frequency.setValueAtTime(520, now);
              env(0.005, 0.03, 0.2, 0.05);
            }
            o.start(now);
            o.stop(now + 0.35);
          },
        };

        // ========= effects / HUD helpers =========
