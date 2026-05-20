const headerTemplate = `
<header class="site-header">
  <div class="container header-inner">
    <a class="logo logo-placeholder" href="index.html" aria-label="VANI 로고">
      <img class="logo-image" src="img/logo.svg" alt="VANI 로고" />
    </a>
    <button class="menu-toggle" type="button" aria-label="메뉴 열기" aria-controls="site-nav" aria-expanded="false">
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
    </button>
    <nav class="nav nav-left" id="site-nav" aria-label="주요 메뉴">
      <a href="about.html" data-page="about.html">ABOUT</a>
      <a href="work.html" data-page="work.html">WORK</a>
      <a href="contact.html" data-page="contact.html">CONTACT</a>
    </nav>
    <div class="header-social" aria-label="소셜 링크">
      <a class="social-link" href="https://www.instagram.com/vani.studio.kr/" target="_blank" rel="noopener noreferrer" aria-label="인스타그램">
        <img src="img/header_instagram.svg" alt="" aria-hidden="true" />
      </a>
      <a class="social-link" href="https://open.kakao.com/me/vanistudio" target="_blank" rel="noopener noreferrer" aria-label="카카오톡">
        <img src="img/header_kakao-talk.svg" alt="" aria-hidden="true" />
      </a>
    </div>
  </div>
</header>
`;

const getHeaderTarget = () => {
  const existingHeader = document.getElementById('site-header') || document.querySelector('.site-header');
  if (existingHeader) return existingHeader;

  const headerMount = document.createElement('div');
  headerMount.id = 'site-header';
  document.body.prepend(headerMount);
  return headerMount;
};

const initHeader = () => {
  const headerMount = getHeaderTarget();
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  const activePage = headerMount?.dataset.activePage || window.location.pathname.split('/').pop();
  const header = document.querySelector('.site-header');
  const headerInner = document.querySelector('.header-inner');
  const headerSocial = document.querySelector('.header-social');
  let menuBackdrop = document.querySelector('.menu-backdrop');

  if (!menuBackdrop) {
    menuBackdrop = document.createElement('button');
    menuBackdrop.className = 'menu-backdrop';
    menuBackdrop.type = 'button';
    menuBackdrop.setAttribute('aria-label', '메뉴 닫기');
    document.body.appendChild(menuBackdrop);
  }

  document.querySelectorAll('.nav a[data-page]').forEach((link) => {
    link.classList.toggle('active', link.dataset.page === activePage);
  });

  if (!menuButton || !nav) return;

  const mobileNavQuery = window.matchMedia('(max-width: 760px)');

  const syncNavMount = () => {
    if (mobileNavQuery.matches) {
      if (nav.parentElement !== document.body) {
        document.body.appendChild(nav);
      }
      return;
    }

    if (headerInner && nav.parentElement !== headerInner) {
      headerInner.insertBefore(nav, headerSocial || null);
    }
  };

  const closeMenu = () => {
    nav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
    header?.classList.remove('menu-open');
  };

  const openMenu = () => {
    nav.classList.add('open');
    menuButton.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
    header?.classList.add('menu-open');
  };

  menuButton.addEventListener('click', () => {
    if (nav.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  menuBackdrop.addEventListener('click', closeMenu);

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  syncNavMount();
  mobileNavQuery.addEventListener('change', () => {
    closeMenu();
    syncNavMount();
  });
};
const loadHeader = async () => {
  const headerMount = getHeaderTarget();
  if (!headerMount) return;

  try {
    const response = await fetch('header.html', { cache: 'no-cache' });
    if (!response.ok) throw new Error('Header fetch failed');
    const headerHtml = await response.text();
    if (headerMount.id === 'site-header') {
      headerMount.innerHTML = headerHtml;
    } else {
      headerMount.outerHTML = headerHtml;
    }
  } catch (error) {
    if (headerMount.id === 'site-header') {
      headerMount.innerHTML = headerTemplate;
    } else {
      headerMount.outerHTML = headerTemplate;
    }
  }

  initHeader();
};

loadHeader();

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
const heroFrame = document.querySelector('.hero');
const heroOrbs = document.querySelectorAll('.hero-orb');

if (heroFrame && heroOrbs.length) {
  const mouse = { x: 0, y: 0, active: false };
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobileHero = () => window.matchMedia('(max-width: 760px)').matches;
  const desktopOrbSeeds = [
    { x: 0.1, y: -0.05, vx: 0.13, vy: 0.07 },
    { x: 0.5, y: 0.12, vx: -0.08, vy: 0.11 },
    { x: 0.48, y: 0.47, vx: 0.1, vy: -0.06 },
  ];
  const mobileOrbSeeds = [
    { x: 0, y: 0, vx: 0.09, vy: 0.07 },
    { x: 0.35, y: 0.14, vx: -0.08, vy: 0.08 },
    { x: 0.09, y: 0.4, vx: 0.08, vy: -0.06 },
  ];
  const getOrbSeeds = () => (isMobileHero() ? mobileOrbSeeds : desktopOrbSeeds);

  const state = Array.from(heroOrbs, (element, index) => ({
    element,
    x: 0,
    y: 0,
    vx: getOrbSeeds()[index]?.vx || 0.08,
    vy: getOrbSeeds()[index]?.vy || 0.08,
    size: element.offsetWidth || 500,
  }));
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const reflectVelocity = (orb, normalX, normalY) => {
    const dot = orb.vx * normalX + orb.vy * normalY;
    if (dot >= 0) return;
    orb.vx -= 2 * dot * normalX;
    orb.vy -= 2 * dot * normalY;
  };

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
  let frameRect = getRectData();

  const recalcBounds = () => {
    frameRect = getRectData();
    const orbSeeds = getOrbSeeds();
    state.forEach((orb, index) => {
      orb.size = orb.element.offsetWidth || orb.size;
      const seed = orbSeeds[index] || orbSeeds[0];
      if (!orb.initialized) {
        orb.x = frameRect.width * seed.x;
        orb.y = frameRect.height * seed.y;
        orb.initialized = true;
      }
      orb.x = clamp(orb.x, 0, Math.max(0, frameRect.width - orb.size));
      orb.y = clamp(orb.y, 0, Math.max(0, frameRect.height - orb.size));
    });
  };

  recalcBounds();

  const onPointer = (clientX, clientY) => {
    mouse.x = clientX;
    mouse.y = clientY;
    mouse.active = true;
  };

  window.addEventListener('pointermove', (event) => onPointer(event.clientX, event.clientY), { passive: true });
  window.addEventListener('pointerdown', (event) => onPointer(event.clientX, event.clientY), { passive: true });
  window.addEventListener('mousemove', (event) => onPointer(event.clientX, event.clientY), { passive: true });
  heroFrame.addEventListener('pointerenter', () => {
    mouse.active = true;
  });
  heroFrame.addEventListener('pointerleave', () => {
    mouse.active = false;
  });
  window.addEventListener('pointerleave', () => {
    mouse.active = false;
  });

  window.addEventListener('resize', recalcBounds, { passive: true });

  let lastTime = performance.now();

  const animateOrbs = (now) => {
    const dt = Math.min(now - lastTime, 48);
    lastTime = now;
    frameRect = getRectData();

    state.forEach((orb) => {
      orb.size = orb.element.offsetWidth || orb.size;
      const maxX = Math.max(0, frameRect.width - orb.size);
      const maxY = Math.max(0, frameRect.height - orb.size);
      const speedScale = reduceMotion ? 0.25 : 1;
      const centerX = frameRect.left + orb.x + orb.size / 2;
      const centerY = frameRect.top + orb.y + orb.size / 2;

      const pointerInFrame =
        mouse.x >= frameRect.left &&
        mouse.x <= frameRect.left + frameRect.width &&
        mouse.y >= frameRect.top &&
        mouse.y <= frameRect.top + frameRect.height;

      if (mouse.active && pointerInFrame) {
        const dx = centerX - mouse.x;
        const dy = centerY - mouse.y;
        const distance = Math.hypot(dx, dy);
        const influenceRadius = orb.size * 0.54;

        if (distance < influenceRadius) {
          const unitX = dx / (distance || 1);
          const unitY = dy / (distance || 1);
          reflectVelocity(orb, unitX, unitY);
          const force = ((influenceRadius - distance) / influenceRadius) * 0.32 * speedScale;
          orb.vx += unitX * force;
          orb.vy += unitY * force;
        }
      }

      orb.x += orb.vx * dt * speedScale;
      orb.y += orb.vy * dt * speedScale;

      if (orb.x <= 0 || orb.x >= maxX) {
        orb.x = clamp(orb.x, 0, maxX);
        reflectVelocity(orb, orb.x <= 0 ? 1 : -1, 0);
      }

      if (orb.y <= 0 || orb.y >= maxY) {
        orb.y = clamp(orb.y, 0, maxY);
        reflectVelocity(orb, 0, orb.y <= 0 ? 1 : -1);
      }

      const maxSpeed = 0.28;
      const currentSpeed = Math.hypot(orb.vx, orb.vy);
      if (currentSpeed > maxSpeed) {
        orb.vx = (orb.vx / currentSpeed) * maxSpeed;
        orb.vy = (orb.vy / currentSpeed) * maxSpeed;
      }

      orb.element.style.transform = `translate3d(${orb.x}px, ${orb.y}px, 0)`;
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


