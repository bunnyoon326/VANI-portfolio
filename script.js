const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');

if (menuButton && nav) {
  menuButton.addEventListener('click', () => {
    nav.classList.toggle('open');
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => nav.classList.remove('open'));
  });
}

const reviewTrack = document.getElementById('reviewTrack');

if (reviewTrack) {
  let scrollPosition = 0;

  setInterval(() => {
    const card = reviewTrack.querySelector('.review-card');
    if (!card) return;

    const distance = card.offsetWidth + 16;
    scrollPosition += distance;

    if (scrollPosition >= reviewTrack.scrollWidth - reviewTrack.clientWidth + 10) {
      scrollPosition = 0;
    }

    reviewTrack.scrollTo({ left: scrollPosition, behavior: 'smooth' });
  }, 3500);
}

const heroFrame = document.getElementById('heroFrame');
const heroOrbs = document.querySelectorAll('.hero-orb');

if (heroFrame && heroOrbs.length) {
  const mouse = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.25, active: false };
  const orbConfig = [
    { baseX: 0.24, baseY: 0.18, driftX: 42, driftY: 24, speed: 0.00034, phase: 1.2, repel: 130, bobAmp: 6.4, bobFreq: 0.0016, elast: 0.065 },
    { baseX: 0.56, baseY: 0.14, driftX: 32, driftY: 18, speed: 0.00042, phase: 3.5, repel: 105, bobAmp: 5.2, bobFreq: 0.0019, elast: 0.072 },
    { baseX: 0.77, baseY: 0.2, driftX: 24, driftY: 16, speed: 0.00051, phase: 5.4, repel: 88, bobAmp: 4.4, bobFreq: 0.0022, elast: 0.078 },
  ];

  const state = orbConfig.map((cfg) => ({ cfg, x: 0, y: 0, vx: 0, vy: 0, scale: 1 }));
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  const getRectData = () => {
    const rect = heroFrame.getBoundingClientRect();
    return { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
  };

  let frameRect = getRectData();

  const recalcBase = () => {
    frameRect = getRectData();
    state.forEach((orb, index) => {
      orb.x = frameRect.width * orbConfig[index].baseX;
      orb.y = frameRect.height * orbConfig[index].baseY;
    });
  };

  recalcBase();

  const onPointer = (clientX, clientY) => {
    mouse.x = clientX;
    mouse.y = clientY;
    mouse.active = true;
  };

  window.addEventListener('pointermove', (event) => onPointer(event.clientX, event.clientY), { passive: true });
  window.addEventListener('pointerdown', (event) => onPointer(event.clientX, event.clientY), { passive: true });
  window.addEventListener('pointerleave', () => {
    mouse.active = false;
  });

  window.addEventListener('resize', recalcBase, { passive: true });

  let lastTime = performance.now();

  const animateOrbs = (now) => {
    const dt = Math.min((now - lastTime) / 16.666, 1.8);
    lastTime = now;
    frameRect = getRectData();

    state.forEach((orb, index) => {
      const config = orb.cfg;
      const driftX =
        Math.sin(now * config.speed + config.phase) * config.driftX +
        Math.sin(now * config.speed * 0.63 + config.phase * 1.9) * config.driftX * 0.42;
      const driftY =
        Math.cos(now * config.speed * 0.82 + config.phase * 0.7) * config.driftY +
        Math.sin(now * config.speed * 0.37 + config.phase * 2.1) * config.driftY * 0.46;
      const bob = Math.sin(now * config.bobFreq + config.phase * 1.5) * config.bobAmp;

      const homeX = frameRect.width * config.baseX + driftX;
      const homeY = frameRect.height * config.baseY + driftY + bob;

      let repelX = 0;
      let repelY = 0;

      if (mouse.active) {
        const orbScreenX = frameRect.left + orb.x;
        const orbScreenY = frameRect.top + orb.y;
        const dx = orbScreenX - mouse.x;
        const dy = orbScreenY - mouse.y;
        const distance = Math.hypot(dx, dy);

        if (distance < config.repel) {
          const ratio = (config.repel - distance) / config.repel;
          const easing = ratio * ratio * (3 - 2 * ratio);
          const unitX = dx / (distance || 1);
          const unitY = dy / (distance || 1);
          const force = 2.4 * easing;
          repelX = unitX * force;
          repelY = unitY * force;
        }
      }

      const springX = (homeX - orb.x) * config.elast;
      const springY = (homeY - orb.y) * config.elast;

      orb.vx = (orb.vx + springX + repelX) * 0.92;
      orb.vy = (orb.vy + springY + repelY) * 0.92;

      orb.x += orb.vx * dt;
      orb.y += orb.vy * dt;

      const maxPad = 28;
      orb.x = clamp(orb.x, -maxPad, frameRect.width + maxPad);
      orb.y = clamp(orb.y, -maxPad, frameRect.height * 0.56);

      const pulse = 1 + Math.sin(now * config.bobFreq * 0.9 + config.phase) * 0.018;
      orb.scale += (pulse - orb.scale) * 0.08;

      heroOrbs[index].style.transform = `translate3d(${orb.x}px, ${orb.y}px, 0) translate(-50%, -50%) scale(${orb.scale})`;
    });

    window.requestAnimationFrame(animateOrbs);
  };

  window.requestAnimationFrame(animateOrbs);
}

const heroMarqueeGroupA = document.getElementById('heroMarqueeGroupA');
const heroMarqueeGroupB = document.getElementById('heroMarqueeGroupB');

if (heroMarqueeGroupA && heroMarqueeGroupB) {
  const sentences = [
    '니즈는 제가 읽을게요 👀',
    '복잡한 건 덜고, 중요한 건 남깁니다.',
    '깔끔하지만, 심심하진 않게.',
    '디자인은 감각이 아니라, 방향입니다.',
    '보기 좋은 디자인보다, 잘 쓰이는 디자인.',
    '고민은 줄이고, 결과는 또렷하게.',
  ];

  const starSvg = `
    <svg class="hero-marquee-star" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <path d="M12 2.8L13.8 8.2L19.2 10L13.8 11.8L12 17.2L10.2 11.8L4.8 10L10.2 8.2L12 2.8Z" fill="currentColor"/>
      <path d="M18.8 14.2L19.6 16.4L21.8 17.2L19.6 18L18.8 20.2L18 18L15.8 17.2L18 16.4L18.8 14.2Z" fill="currentColor" opacity="0.9"/>
    </svg>`;

  const marqueeHtml = sentences
    .map((sentence) => `<span class="hero-marquee-item"><span>${sentence}</span>${starSvg}</span>`)
    .join('');

  heroMarqueeGroupA.innerHTML = marqueeHtml;
  heroMarqueeGroupB.innerHTML = marqueeHtml;
}
