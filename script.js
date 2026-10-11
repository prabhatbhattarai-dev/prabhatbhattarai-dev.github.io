<script>
(function(){
  'use strict';

  /* ---- THEME ---- */
  var root = document.documentElement;
  var themeBtn = document.getElementById('themeBtn');
  var themeIcon = document.getElementById('themeIcon');

  var SUN = '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>';
  var MOON = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';

  function applyTheme(t){
    root.setAttribute('data-theme', t);
    try { localStorage.setItem('pb-theme', t); } catch(e){}
    if (themeIcon) themeIcon.innerHTML = t === 'dark' ? MOON : SUN;
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', t === 'dark' ? '#0d0d0c' : '#f5f4f0');
  }

  var saved = null;
  try { saved = localStorage.getItem('pb-theme'); } catch(e){}
  if (saved === 'dark' || saved === 'light') applyTheme(saved);
  else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) applyTheme('dark');
  else applyTheme('light');

  if (themeBtn) themeBtn.addEventListener('click', function(){
    var cur = root.getAttribute('data-theme');
    applyTheme(cur === 'dark' ? 'light' : 'dark');
  });

  /* ---- DEVELOPMENT POPUP ---- */
  window.checkAndShowDevPopup = function() {
    var popup = document.getElementById('dev-popup');
    if (!popup) return;
    if (!sessionStorage.getItem('pbDevPopupClosed')) {
      popup.style.display = 'flex';
      setTimeout(function() {
        popup.classList.add('open');
        document.body.classList.add('no-scroll');
      }, 50);
    }
  };

  var closePopupBtn = document.getElementById('dev-popup-close');
  if (closePopupBtn) {
    closePopupBtn.addEventListener('click', function() {
      var popup = document.getElementById('dev-popup');
      if (popup) {
        popup.classList.remove('open');
        document.body.classList.remove('no-scroll');
        sessionStorage.setItem('pbDevPopupClosed', 'true');
        setTimeout(function() {
          popup.style.display = 'none';
        }, 400);
      }
    });
  }

  /* ---- REVEAL ---- */
  window.revealAll = function(){
    document.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('in'); });
  };

  var nav = document.getElementById('nav');
  function onScroll(){ if (nav) nav.classList.toggle('scrolled', window.scrollY > 12); }
  window.addEventListener('scroll', onScroll, { passive:true });
  onScroll();

  if ('IntersectionObserver' in window){
    var sections = [].slice.call(document.querySelectorAll('section[id]'));
    var navLinks = [].slice.call(document.querySelectorAll('.nav-menu a[href^="#"]'));

    var navObs = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting){
          var id = e.target.id;
          navLinks.forEach(function(a){
            a.classList.toggle('active', a.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { rootMargin:'-45% 0px -50% 0px', threshold:0 });
    sections.forEach(function(s){ navObs.observe(s); });

    var revObs = new IntersectionObserver(function(entries, obs){
      entries.forEach(function(e){
        if (e.isIntersecting){ e.target.classList.add('in'); obs.unobserve(e.target); }
      });
    }, { threshold:.1, rootMargin:'0px 0px -60px 0px' });
    document.querySelectorAll('.reveal').forEach(function(el){ revObs.observe(el); });
  } else {
    window.revealAll();
  }

  /* ---- OVERLAY ---- */
  var overlay = document.getElementById('overlay');
  var burger  = document.getElementById('burger');
  var overlayClose = document.getElementById('overlayClose');
  var lastFocus = null;

  function openOverlay(){
    if (!overlay) return;
    lastFocus = document.activeElement;
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden','false');
    document.body.classList.add('no-scroll');
    if (burger) burger.setAttribute('aria-expanded','true');
    setTimeout(function(){ if (overlayClose) overlayClose.focus({preventScroll:true}); }, 350);
  }
  function closeOverlay(){
    if (!overlay) return;
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden','true');
    document.body.classList.remove('no-scroll');
    if (burger) burger.setAttribute('aria-expanded','false');
    if (lastFocus && lastFocus.focus) lastFocus.focus({preventScroll:true});
  }

  if (burger) burger.addEventListener('click', openOverlay);
  if (overlayClose) overlayClose.addEventListener('click', closeOverlay);

  if (overlay){
    overlay.querySelectorAll('.overlay-nav a').forEach(function(a){
      a.addEventListener('click', function(e){
        var href = this.getAttribute('href');
        if (!href || href.charAt(0) !== '#'){ closeOverlay(); return; }
        e.preventDefault();
        closeOverlay();
        var target = document.querySelector(href);
        if (target){
          var y = target.getBoundingClientRect().top + window.pageYOffset - 70;
          setTimeout(function(){ window.scrollTo({top:y, behavior:'smooth'}); }, 150);
        }
      });
    });
  }

  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape' && overlay && overlay.classList.contains('open')) closeOverlay();
  });

  var rt;
  window.addEventListener('resize', function(){
    clearTimeout(rt);
    rt = setTimeout(function(){
      if (window.innerWidth > 940 && overlay && overlay.classList.contains('open')) closeOverlay();
    }, 120);
  });

  /* ---- COPY EMAIL ---- */
  var copyBtn = document.getElementById('copyEmail');
  if (copyBtn){
    var EMAIL = 'prabhatbhattarai456@gmail.com';
    copyBtn.addEventListener('click', function(){
      var btn = this;
      var original = btn.textContent;
      function ok(){
        btn.classList.add('copied');
        btn.textContent = 'Copied';
        setTimeout(function(){ btn.textContent = original; btn.classList.remove('copied'); }, 1800);
      }
      if (navigator.clipboard && window.isSecureContext){
        navigator.clipboard.writeText(EMAIL).then(ok).catch(function(){
          btn.textContent = 'Failed';
          setTimeout(function(){ btn.textContent = original; }, 1800);
        });
      } else {
        var ta = document.createElement('textarea');
        ta.value = EMAIL; ta.setAttribute('readonly','');
        ta.style.position='fixed'; ta.style.top='-9999px'; ta.style.opacity='0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); ok(); }
        catch(e){ btn.textContent = 'Failed'; setTimeout(function(){ btn.textContent = original; }, 1800); }
        document.body.removeChild(ta);
      }
    });
  }

  /* ---- FOOTER YEAR ---- */
  var y = document.getElementById('footerYear');
  if (y) y.textContent = new Date().getFullYear();
})();
</script>
