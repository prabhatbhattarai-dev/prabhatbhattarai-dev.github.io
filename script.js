const rope = document.getElementById('rope');
const ropeLine = document.getElementById('ropeLine');
const ropeSwing = document.getElementById('ropeSwing');
const root = document.documentElement;

let isDragging = false, startX = 0, startY = 0, currentX = 0, currentY = 0;
const threshold = 100;
const BASE = 100;

rope.addEventListener('pointerdown', (e) => {
  if (!loader.classList.contains('exit')) return;
  isDragging = true;
  startX = currentX = e.clientX;
  startY = currentY = e.clientY;
  ropeSwing.classList.remove('is-wobble');
  ropeSwing.classList.add('is-dragging');
  ropeLine.style.transition = 'none';
  rope.setPointerCapture(e.pointerId);
});

rope.addEventListener('pointermove', (e) => {
  if (!isDragging) return;
  currentX = e.clientX;
  currentY = e.clientY;
  const pull = Math.min(Math.max(currentY - startY, 0) * 0.8, 180);
  ropeLine.style.height = `${BASE + pull}px`;

  // rope tilts toward the pointer
  const tilt = Math.max(-18, Math.min(18, (currentX - startX) * 0.12));
  ropeSwing.style.transform = `rotate(${tilt}deg)`;
});

function releaseRope() {
  if (!isDragging) return;
  isDragging = false;
  const pulled = currentY - startY > threshold;

  // springy snap-back with overshoot
  ropeLine.style.transition = 'height .7s cubic-bezier(0.34, 1.56, 0.64, 1)';
  ropeLine.style.height = BASE + 'px';

  // clear drag tilt, play wobble, then resume idle sway
  ropeSwing.style.transform = '';
  ropeSwing.classList.remove('is-dragging');
  void ropeSwing.offsetWidth; // restart animation
  ropeSwing.classList.add('is-wobble');
  ropeSwing.addEventListener('animationend', () => ropeSwing.classList.remove('is-wobble'), { once: true });

  if (pulled) toggleTheme();
  startX = startY = currentX = currentY = 0;
}
rope.addEventListener('pointerup', releaseRope);
rope.addEventListener('pointercancel', releaseRope);

function applyTheme() {
  const newTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', newTheme);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', newTheme === 'dark' ? '#0E0D0C' : '#FBF6EC');
}

function toggleTheme() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!document.startViewTransition || reduce) { applyTheme(); return; }

  const vt = document.startViewTransition(applyTheme);
  vt.ready.then(() => {
    const r = Math.hypot(innerWidth, innerHeight);
    root.animate(
      { clipPath: ['circle(0px at 50% 0px)', `circle(${r}px at 50% 0px)`] },
      { duration: 800, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', pseudoElement: '::view-transition-new(root)' }
    );
  });
}

const themeBtn = document.getElementById('themeToggle');
if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
