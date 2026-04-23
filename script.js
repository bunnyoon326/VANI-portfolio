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
  const heroState = {
    pointerX: window.innerWidth * 0.5,
    pointerY: window.innerHeight * 0.5,
    pointerActive: false,
    bounds: hero.getBoundingClientRect(),
  };

  const createBlobState = (index) => {
    const angle = Math.random() * Math.PI * 2;
    const distance = 110 + Math.random() * 340;
    const offsetX = Math.cos(angle) * distance;
    const offsetY = Math.sin(angle) * (70 + Math.random() * 240);

    return {
      node: blobNodes[index],
      baseX: offsetX,
      baseY: offsetY,
      driftPhaseX: Math.random() * Math.PI * 2,
      driftPhaseY: Math.random() * Math.PI * 2,
      breathPhase: Math.random() * Math.PI * 2,
      driftSpeedX: 0.00014 + Math.random() * 0.00022,
      driftSpeedY: 0.00012 + Math.random() * 0.0002,
      breathSpeed: 0.001 + Math.random() * 0.0012,
      driftAmpX: 28 + Math.random() * 38,
      driftAmpY: 28 + Math.random() * 42,
      breathAmp: 0.03 + Math.random() * 0.02,
      repelX: 0,
      repelY: 0,
      velocityX: 0,
      velocityY: 0,
    };
  };

  const blobs = Array.from(blobNodes).map((_, index) => createBlobState(index));
  const repelRadius = 300;
  const strength = 24;
  let rafId = 0;

  const easeInOutSine = (value) => 0.5 - 0.5 * Math.cos(Math.PI * value);

  const updateBounds = () => {
    heroState.bounds = hero.getBoundingClientRect();
  };

  const onPointerMove = (event) => {
    heroState.pointerX = event.clientX;
    heroState.pointerY = event.clientY;
    heroState.pointerActive = true;
  };

  const onPointerLeave = () => {
    heroState.pointerActive = false;
  };

  hero.addEventListener('pointermove', onPointerMove);
  hero.addEventListener('pointerleave', onPointerLeave);
  window.addEventListener('resize', updateBounds);
  window.addEventListener('scroll', updateBounds, { passive: true });

  const animate = (time) => {
    const centerX = heroState.bounds.left + heroState.bounds.width * 0.5;
    const centerY = heroState.bounds.top + heroState.bounds.height * 0.5;

    blobs.forEach((blob) => {
      blob.driftPhaseX += blob.driftSpeedX * 16.67;
      blob.driftPhaseY += blob.driftSpeedY * 16.67;
      blob.breathPhase += blob.breathSpeed * 16.67;

      const driftX = Math.sin(time * blob.driftSpeedX + blob.driftPhaseX) * blob.driftAmpX;
      const driftY = Math.cos(time * blob.driftSpeedY + blob.driftPhaseY) * blob.driftAmpY;

      const worldX = centerX + blob.baseX + driftX + blob.repelX;
      const worldY = centerY + blob.baseY + driftY + blob.repelY;

      if (heroState.pointerActive) {
        const deltaX = worldX - heroState.pointerX;
        const deltaY = worldY - heroState.pointerY;
        const distance = Math.hypot(deltaX, deltaY);

        if (distance < repelRadius) {
          const force = (1 - distance / repelRadius) ** 2;
          const directionX = deltaX / (distance || 1);
          const directionY = deltaY / (distance || 1);
          blob.velocityX += directionX * force * strength * 0.1;
          blob.velocityY += directionY * force * strength * 0.1;
        }
      }

      blob.velocityX *= 0.9;
      blob.velocityY *= 0.9;
      blob.repelX = (blob.repelX + blob.velocityX) * 0.94;
      blob.repelY = (blob.repelY + blob.velocityY) * 0.94;

      const breathCycle = (Math.sin(time * blob.breathSpeed + blob.breathPhase) + 1) * 0.5;
      const easedBreath = easeInOutSine(breathCycle);
      const scale = 0.95 + easedBreath * (blob.breathAmp * 2);
      const x = blob.baseX + driftX + blob.repelX;
      const y = blob.baseY + driftY + blob.repelY;

      blob.node.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale.toFixed(4)})`;
    });

    rafId = window.requestAnimationFrame(animate);
  };

  rafId = window.requestAnimationFrame(animate);

  window.addEventListener('beforeunload', () => {
    window.cancelAnimationFrame(rafId);
  });
}
