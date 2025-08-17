new QRCode(document.getElementById("qrcode"), {
  text: "https://discord.gg/qAq6wAAfwc",
  width: 200,
  height: 200,
  colorDark: "#400063",
  colorLight: "#000000",
  correctLevel: QRCode.CorrectLevel.H
});

(function () {
  const canvas = document.getElementById('fx');
  const ctx = canvas.getContext('2d', { alpha: true });
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const CHARSET = ':+-*^#@$";.?/\\|';
  const COLORS = ['#c183e3', '#ffd166', '#06d6a0', '#ef476f', '#118ab2', '#f78c6b', '#a0e7e5'];

  const MAX_PARTICLES = prefersReduced ? 600 : 1200;
  const BASE_SPRAY_COUNT = prefersReduced ? 8 : 20;
  const BURST_SPRAY_COUNT = prefersReduced ? 20 : 45;
  const FRICTION = 0.9;

  let DPR = Math.max(1, window.devicePixelRatio || 1);

  function resize() {
    DPR = Math.max(1, window.devicePixelRatio || 1);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = Math.max(1, Math.floor(w * DPR));
    canvas.height = Math.max(1, Math.floor(h * DPR));
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  const rand = (min, max) => Math.random() * (max - min) + min;
  const pick  = (arr) => arr[(Math.random() * arr.length) | 0];

  const particles = [];

  class SprayParticle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      const angle = Math.random() * Math.PI * 2;
      const speed = prefersReduced ? rand(0.4, 2.2) : rand(0.5, 3.5);
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.char = pick(CHARSET);
      this.size = rand(10, 18);
      this.color = pick(COLORS);
      this.life = 0;
      this.maxLife = rand(15, 40);
    }
    update() {
      this.life++;
      this.x += this.vx;
      this.y += this.vy;
      this.vx *= FRICTION;
      this.vy *= FRICTION;
    }
    draw(ctx) {
      const t = this.life / this.maxLife;
      const alpha = Math.max(0, 1 - t * 1.2);
      ctx.globalAlpha = alpha;
      ctx.font = `${this.size}px 'Press Start 2P', monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = this.color;
      ctx.fillText(this.char, this.x, this.y);
      ctx.globalAlpha = 1;
    }
    get dead() { return this.life > this.maxLife; }
  }

  function spawn(x, y, count = BASE_SPRAY_COUNT) {
    for (let i = 0; i < count; i++) particles.push(new SprayParticle(x, y));
    if (particles.length > MAX_PARTICLES) particles.splice(0, particles.length - MAX_PARTICLES);
  }

  let spraying = false;
  window.addEventListener('mousemove', (e) => { spawn(e.clientX, e.clientY, spraying ? BURST_SPRAY_COUNT : BASE_SPRAY_COUNT); }, { passive: true });
  window.addEventListener('mousedown', (e) => { spraying = true; spawn(e.clientX, e.clientY, BURST_SPRAY_COUNT); }, { passive: true });
  window.addEventListener('mouseup', () => { spraying = false; }, { passive: true });
  window.addEventListener('mouseleave', () => { spraying = false; }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    const t = e.touches && e.touches[0];
    if (t) spawn(t.clientX, t.clientY, BASE_SPRAY_COUNT);
  }, { passive: true });

  window.addEventListener('touchstart', (e) => {
    const t = e.touches && e.touches[0];
    if (t) spawn(t.clientX, t.clientY, BURST_SPRAY_COUNT);
  }, { passive: true });

  function loop() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.update();
      p.draw(ctx);
      if (p.dead) particles.splice(i, 1);
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
