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

const hero = document.querySelector('.hero');
const blobNodes = document.querySelectorAll('.hero-blob');

if (hero && blobNodes.length) {
  const ringLayouts = [
    { x: 58, y: -8, depth: 0.24, driftX: 12, driftY: 10, speed: 0.00022 },
    { x: 60, y: -2, depth: 0.2, driftX: 10, driftY: 9, speed: 0.0002 },
    { x: 62, y: 5, depth: 0.16, driftX: 8, driftY: 7, speed: 0.00018 },
    { x: 64, y: 11, depth: 0.12, driftX: 6, driftY: 6, speed: 0.00016 },
    { x: 55, y: -16, depth: 0.08, driftX: 14, driftY: 11, speed: 0.00015 },
    { x: -20, y: 63, depth: 0.1, driftX: 10, driftY: 8, speed: 0.00017 },
  ];

  const state = {
    pointerX: 0,
    pointerY: 0,
    targetX: 0,
    targetY: 0,
    hasPointer: false,
  };

  const rings = Array.from(blobNodes).map((node, index) => ({
    node,
    ...ringLayouts[index],
    phase: Math.random() * Math.PI * 2,
  }));

  const setIdleTarget = () => {
    state.targetX = 0;
    state.targetY = 0;
  };

  hero.addEventListener('pointermove', (event) => {
    const bounds = hero.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    state.targetX = x * 48;
    state.targetY = y * 42;
    state.hasPointer = true;
  });

  hero.addEventListener('pointerleave', () => {
    state.hasPointer = false;
    setIdleTarget();
  });

  const animate = (time) => {
    state.pointerX += (state.targetX - state.pointerX) * 0.08;
    state.pointerY += (state.targetY - state.pointerY) * 0.08;

    rings.forEach((ring) => {
      const driftX = Math.sin(time * ring.speed + ring.phase) * ring.driftX;
      const driftY = Math.cos(time * ring.speed + ring.phase) * ring.driftY;
      const followX = state.pointerX * ring.depth;
      const followY = state.pointerY * ring.depth;
      const breathing = 1 + Math.sin(time * (ring.speed * 1.8) + ring.phase) * 0.008;
      const x = `calc(${ring.x}% + ${driftX + followX}px)`;
      const y = `calc(${ring.y}% + ${driftY + followY}px)`;

      ring.node.style.left = x;
      ring.node.style.top = y;
      ring.node.style.transform = `translate(-50%, -50%) scale(${breathing.toFixed(4)})`;
    });

    window.requestAnimationFrame(animate);
  };

  setIdleTarget();
  window.requestAnimationFrame(animate);
}
