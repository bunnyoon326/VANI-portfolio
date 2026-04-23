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
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = () => window.matchMedia('(max-width: 760px)').matches;
  const orbConfig = [
    { baseX: 0.2, baseY: 0.26, driftX: 260, driftY: 145, speed: 0.0001, phase: 1.1, repel: 460, bobAmp: 10, bobFreq: 0.0011, elast: 0.038 },
    { baseX: 0.5, baseY: 0.54, driftX: 280, driftY: 160, speed: 0.000092, phase: 2.8, repel: 420, bobAmp: 8, bobFreq: 0.001, elast: 0.036 },
    { baseX: 0.76, baseY: 0.28, driftX: 220, driftY: 130, speed: 0.000115, phase: 4.9, repel: 380, bobAmp: 7, bobFreq: 0.00125, elast: 0.04 },
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
  heroFrame.addEventListener('pointerenter', () => {
    mouse.active = true;
  });
  heroFrame.addEventListener('pointerleave', () => {
    mouse.active = false;
  });
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
      const mobileMultiplier = isMobile() ? 0.52 : 1;
      const driftX =
        Math.sin(now * config.speed + config.phase) * config.driftX +
        Math.sin(now * config.speed * 1.5 + config.phase * 0.8) * config.driftX * 0.55;
      const driftY =
        Math.cos(now * config.speed * 0.82 + config.phase * 0.7) * config.driftY +
        Math.sin(now * config.speed * 1.2 + config.phase * 1.4) * config.driftY * 0.52;
      const bob = Math.sin(now * config.bobFreq + config.phase * 1.5) * config.bobAmp;

      const homeX = frameRect.width * config.baseX + driftX * mobileMultiplier;
      const homeY = frameRect.height * config.baseY + (driftY + bob) * mobileMultiplier;

      let repelX = 0;
      let repelY = 0;

      const pointerInFrame =
        mouse.x >= frameRect.left &&
        mouse.x <= frameRect.left + frameRect.width &&
        mouse.y >= frameRect.top &&
        mouse.y <= frameRect.top + frameRect.height;

      if ((mouse.active || pointerInFrame) && pointerInFrame && !reduceMotion) {
        const orbScreenX = frameRect.left + orb.x;
        const orbScreenY = frameRect.top + orb.y;
        const dx = orbScreenX - mouse.x;
        const dy = orbScreenY - mouse.y;
        const distance = Math.hypot(dx, dy);

        const orbSize = heroOrbs[index].offsetWidth || 300;
        const influenceRadius = Math.max(config.repel, orbSize * 0.75);

        if (distance < influenceRadius) {
          const ratio = (influenceRadius - distance) / influenceRadius;
          const easing = ratio * ratio * (3 - 2 * ratio);
          const unitX = dx / (distance || 1);
          const unitY = dy / (distance || 1);
          const force = 6.2 * easing;
          repelX = unitX * force;
          repelY = unitY * force;
        }
      }

      const springX = (homeX - orb.x) * config.elast;
      const springY = (homeY - orb.y) * config.elast;

      orb.vx = (orb.vx + springX + repelX) * 0.93;
      orb.vy = (orb.vy + springY + repelY) * 0.93;

      orb.x += orb.vx * dt;
      orb.y += orb.vy * dt;

      const orbSize = heroOrbs[index].offsetWidth || 300;
      const edgePad = orbSize * 0.34;
      orb.x = clamp(orb.x, -edgePad, frameRect.width + edgePad);
      orb.y = clamp(orb.y, -edgePad * 0.75, frameRect.height + edgePad * 0.65);

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
    </svg>`;

  const marqueeHtml = sentences
    .map((sentence) => `<span class="hero-marquee-item"><span>${sentence}</span>${starSvg}</span>`)
    .join('');

  heroMarqueeGroupA.innerHTML = marqueeHtml;
  heroMarqueeGroupB.innerHTML = marqueeHtml;
}
