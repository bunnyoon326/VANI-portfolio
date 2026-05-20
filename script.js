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

  const mobileNavQuery = window.matchMedia('(max-width: 1200px)');

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
  const mobileReview = window.matchMedia('(max-width: 1200px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const originalCards = Array.from(reviewTrack.children);
  let reviewAnimationFrame = null;
  let reviewLoopOffset = 0;
  let reviewLoopDistance = 0;
  let reviewLastTime = 0;

  const clearReviewLoop = () => {
    if (reviewAnimationFrame) {
      window.cancelAnimationFrame(reviewAnimationFrame);
      reviewAnimationFrame = null;
    }
    reviewLoopOffset = 0;
    reviewLoopDistance = 0;
    reviewLastTime = 0;
    reviewTrack.classList.remove('is-review-loop');
    reviewTrack.style.removeProperty('--review-loop-distance');
    reviewTrack.style.removeProperty('transform');
    reviewTrack.querySelectorAll('[data-review-clone="true"]').forEach((clone) => clone.remove());
  };

  const animateReviewLoop = (now) => {
    if (!reviewLastTime) reviewLastTime = now;
    const delta = Math.min(now - reviewLastTime, 48);
    reviewLastTime = now;

    reviewLoopOffset = (reviewLoopOffset + delta * 0.035) % reviewLoopDistance;
    reviewTrack.style.transform = `translate3d(${-reviewLoopOffset}px, 0, 0)`;
    reviewAnimationFrame = window.requestAnimationFrame(animateReviewLoop);
  };

  const setupReviewLoop = () => {
    clearReviewLoop();

    if (!mobileReview.matches || reducedMotion.matches) return;

    originalCards.forEach((card) => {
      const clone = card.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.dataset.reviewClone = 'true';
      reviewTrack.appendChild(clone);
    });

    const firstClone = reviewTrack.querySelector('[data-review-clone="true"]');
    if (!firstClone) return;

    const loopDistance = firstClone.offsetLeft - reviewTrack.firstElementChild.offsetLeft;
    if (!loopDistance) return;

    reviewLoopDistance = loopDistance;
    reviewTrack.style.setProperty('--review-loop-distance', `${reviewLoopDistance}px`);
    reviewTrack.classList.add('is-review-loop');
    reviewAnimationFrame = window.requestAnimationFrame(animateReviewLoop);
  };

  setupReviewLoop();
  const onReviewMediaChange = () => setupReviewLoop();

  if (mobileReview.addEventListener) {
    mobileReview.addEventListener('change', onReviewMediaChange);
    reducedMotion.addEventListener('change', onReviewMediaChange);
  } else {
    mobileReview.addListener(onReviewMediaChange);
    reducedMotion.addListener(onReviewMediaChange);
  }
}

const contactTypeSelect = document.querySelector('select[name="type"]');
const contactTypeTrigger = document.querySelector('.mobile-select-trigger');
const contactTypeTriggerText = contactTypeTrigger?.querySelector('span');
const contactTypeModal = document.getElementById('contactTypeModal');
const contactTypeSheet = contactTypeModal?.querySelector('.mobile-select-sheet');
const contactTypeBackdrop = contactTypeModal?.querySelector('.mobile-select-backdrop');
const contactTypeOptions = contactTypeModal?.querySelectorAll('[data-value]');
const mobileContactSelect = window.matchMedia('(max-width: 1200px)');

if (contactTypeSelect && contactTypeTrigger && contactTypeModal && contactTypeOptions?.length) {
  const closeContactTypeModal = () => {
    contactTypeModal.classList.remove('is-open');
    contactTypeModal.setAttribute('aria-hidden', 'true');
    contactTypeTrigger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('modal-open');
    contactTypeTrigger.focus();
  };

  const openContactTypeModal = () => {
    if (!mobileContactSelect.matches) return;

    contactTypeModal.classList.add('is-open');
    contactTypeModal.setAttribute('aria-hidden', 'false');
    contactTypeTrigger.setAttribute('aria-expanded', 'true');
    document.body.classList.add('modal-open');
    contactTypeSheet?.focus();
  };

  const setContactTypeValue = (value) => {
    contactTypeSelect.value = value;
    contactTypeSelect.dispatchEvent(new Event('change', { bubbles: true }));
    if (contactTypeTriggerText) contactTypeTriggerText.textContent = value || '선택';
  };

  contactTypeTrigger.addEventListener('click', openContactTypeModal);
  contactTypeBackdrop?.addEventListener('click', closeContactTypeModal);

  contactTypeOptions.forEach((option) => {
    option.addEventListener('click', () => {
      setContactTypeValue(option.dataset.value);
      closeContactTypeModal();
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && contactTypeModal.classList.contains('is-open')) {
      closeContactTypeModal();
    }
  });

  contactTypeSelect.addEventListener('change', () => {
    if (contactTypeTriggerText) contactTypeTriggerText.textContent = contactTypeSelect.value || '선택';
  });
}

const contactForm = document.querySelector('.contact-form');

if (contactForm) {
  const phoneInput = contactForm.querySelector('input[name="phone"]');
  const budgetInput = contactForm.querySelector('input[name="budget"]');
  const messageInput = contactForm.querySelector('textarea[name="message"]');
  const blockedWords = [
    '무료홍보',
    '상위노출',
    '검색노출',
    '바이럴',
    '체험단모집',
    '블로그배포',
    '트래픽',
    '방문자증가',
    '팔로워',
    '좋아요',
    '댓글작업',
    '계정판매',
    '디엠마케팅',
    '대량발송',
    '문자광고',
    '광고문의',
    '대출',
    '무직자대출',
    '소액대출',
    '개인돈',
    '급전',
    '당일입금',
    '고수익',
    '부업',
    '재택알바',
    '리딩방',
    '투자방',
    '코인추천',
    '주식추천',
    '수익보장',
    '먹튀',
    '환전',
    '성인사이트',
    '19금',
    '야동',
    '음란',
    '조건만남',
    '출장마사지',
    '유흥',
    '도박',
    '카지노',
    '바카라',
    '토토',
    '스포츠토토',
    '불법도박',
    '불법',
    '마약',
    '대마',
    '필로폰',
    '시발',
    '씨발',
    'ㅅㅂ',
    'ㅆㅂ',
    '병신',
    'ㅂㅅ',
    '개새',
    '꺼져',
    '죽어',
    '닥쳐',
    '미친년',
    '미친놈',
    'script',
    'javascript:',
    'onerror',
    'onclick',
    'iframe',
    'eval',
    'alert(',
    'document.cookie',
    'select *',
    'drop table',
    'union select',
  ];

  const normalizeText = (value) => value.toLowerCase().replace(/\s+/g, '');
  const compactBlockedWords = blockedWords.map((word) => normalizeText(word));
  const blockedMessage = '문의 내용에 제출이 어려운 표현이 포함되어 있어요.\n필요한 내용만 정리해서 다시 보내주세요.';

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  };

  const isInvalidPhone = (value) => {
    if (!/^010-\d{4}-\d{4}$/.test(value)) return true;

    const [, middle, last] = value.split('-');
    const repeated = /^(\d)\1{3}$/;
    const sequential = (part) => part === '1234' || part === '0123' || part === '9876' || part === '4321';
    return repeated.test(middle) || repeated.test(last) || sequential(middle) || sequential(last);
  };

  const hasBlockedWord = (value) => {
    const normalized = normalizeText(value);
    return compactBlockedWords.some((word) => normalized.includes(word));
  };

  phoneInput?.addEventListener('input', () => {
    phoneInput.value = formatPhone(phoneInput.value);
  });

  budgetInput?.addEventListener('input', () => {
    budgetInput.value = budgetInput.value.replace(/\D/g, '');
  });

  contactForm.addEventListener('submit', (event) => {
    const nameInput = contactForm.querySelector('input[name="name"]');
    const organizationInput = contactForm.querySelector('input[name="organization"]');
    const emailInput = contactForm.querySelector('input[name="email"]');
    const typeInput = contactForm.querySelector('select[name="type"]');

    if ((nameInput?.value.trim().length || 0) < 2) {
      event.preventDefault();
      alert('이름은 2글자 이상 입력해주세요.');
      nameInput?.focus();
      return;
    }

    if ((organizationInput?.value.trim().length || 0) < 1) {
      event.preventDefault();
      alert('소속/단체를 입력해주세요.');
      organizationInput?.focus();
      return;
    }

    if (!phoneInput?.value || isInvalidPhone(phoneInput.value)) {
      event.preventDefault();
      alert('연락처는 010-0000-0000 형식의 실제 사용 가능한 번호로 입력해주세요.');
      phoneInput?.focus();
      return;
    }

    if (!emailInput?.validity.valid) {
      event.preventDefault();
      alert('이메일 형식에 맞게 입력해주세요.');
      emailInput?.focus();
      return;
    }

    if (!typeInput?.value) {
      event.preventDefault();
      alert('문의 유형을 선택해주세요.');
      contactTypeTrigger?.focus();
      return;
    }

    if (!budgetInput?.value || !/^\d+$/.test(budgetInput.value)) {
      event.preventDefault();
      alert('보유예산은 숫자만 입력해주세요.');
      budgetInput?.focus();
      return;
    }

    if (!messageInput?.value.trim()) {
      event.preventDefault();
      alert('문의 내용을 입력해주세요.');
      messageInput?.focus();
      return;
    }

    if (hasBlockedWord(messageInput.value)) {
      event.preventDefault();
      alert(blockedMessage);
      messageInput.focus();
    }
  });
}

const heroFrame = document.querySelector('.hero');
const heroOrbs = document.querySelectorAll('.hero-orb');

if (heroFrame && heroOrbs.length) {
  const mouse = { x: 0, y: 0, active: false };
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobileHero = () => window.matchMedia('(max-width: 1200px)').matches;
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


