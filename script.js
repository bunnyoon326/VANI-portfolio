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
