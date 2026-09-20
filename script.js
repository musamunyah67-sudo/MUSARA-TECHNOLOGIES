const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

const form = document.getElementById('contactForm');
const successMsg = document.getElementById('successMsg');
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    company: document.getElementById('company').value,
    subject: document.getElementById('subject').value,
    message: document.getElementById('message').value
  };

  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) { submitBtn.disabled = true; }

  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const result = await response.json();

    if (response.ok && result.success) {
      successMsg.style.display = 'block';
      form.reset();
    } else {
      alert((result && result.message) || 'Failed to send message. Please try again.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to send message. Please try again.');
  } finally {
    if (submitBtn) { submitBtn.disabled = false; }
  }
});

// Detail modal for service / portfolio / blog cards
const modal = document.getElementById('cardModal');
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDesc');
const modalImg = document.getElementById('modalImg');
const modalImgWrap = document.getElementById('modalImgWrap');
const modalClose = document.getElementById('modalClose');
let lastFocused = null;

function openModal(card) {
  const title = card.getAttribute('data-modal-title') || '';
  const desc = card.getAttribute('data-modal-desc') || '';
  const img = card.getAttribute('data-modal-img') || '';
  modalTitle.textContent = title;
  modalDesc.textContent = desc;
  if (img) {
    modalImg.src = img;
    modalImg.alt = title;
    modalImgWrap.classList.add('has-img');
  } else {
    modalImg.src = '';
    modalImgWrap.classList.remove('has-img');
  }
  lastFocused = document.activeElement;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  modalClose.focus();
}

function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  if (lastFocused) lastFocused.focus();
}

document.querySelectorAll('[data-modal-title]').forEach((card) => {
  card.addEventListener('click', (e) => { e.preventDefault(); openModal(card); });
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(card); }
  });
});

modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('open')) closeModal(); });

// ---- Multi-page navigation ----
// The long single-scroll layout is split into named "pages" (.app-page[data-page]).
// Only one page is shown at a time; nav links, footer links and in-page CTA
// buttons all route through showPage() instead of scrolling.
const pages = document.querySelectorAll('.app-page');
const pageKeys = Array.from(pages).map(p => p.getAttribute('data-page'));
const navAnchorLinks = document.querySelectorAll('a[href^="#"]:not([data-modal-title])');

function animateRevealsIn(container) {
  container.querySelectorAll('.reveal:not(.in)').forEach(el => el.classList.add('in'));
}

function triggerCounters(container) {
  container.querySelectorAll('.num[data-target]').forEach(num => {
    const target = parseInt(num.getAttribute('data-target'));
    if (!isNaN(target) && target > 0 && !num.hasAttribute('data-counted')) {
      num.setAttribute('data-counted', 'true');
      animateCounter(num, target);
    }
  });
}

function showPage(key, options = {}) {
  const { updateHash = true, scrollTop = true } = options;
  if (!pageKeys.includes(key)) key = 'home';

  pages.forEach(p => p.classList.toggle('is-active', p.getAttribute('data-page') === key));

  document.querySelectorAll('.nav-links a, .footer-grid a').forEach(a => {
    const href = a.getAttribute('href') || '';
    a.classList.toggle('is-active', href === '#' + key);
  });

  const activePage = document.getElementById('page-' + key);
  if (activePage) {
    animateRevealsIn(activePage);
    triggerCounters(activePage);
  }

  if (scrollTop) window.scrollTo({ top: 0, behavior: 'instant' in document.documentElement.style ? 'instant' : 'auto' });
  if (updateHash && location.hash.slice(1) !== key) {
    history.pushState({ page: key }, '', '#' + key);
  }
  navLinks.classList.remove('open');
}

navAnchorLinks.forEach((link) => {
  link.addEventListener('click', (e) => {
    const id = link.getAttribute('href').slice(1);
    if (!id) return;
    if (pageKeys.includes(id)) {
      e.preventDefault();
      showPage(id);
    } else {
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });
});

window.addEventListener('popstate', () => {
  const key = location.hash.slice(1) || 'home';
  showPage(key, { updateHash: false });
});

// Initial page on load: honor a shared/bookmarked #hash, default to home
document.addEventListener('DOMContentLoaded', () => {
  const initialKey = location.hash.slice(1) || 'home';
  showPage(initialKey, { updateHash: false, scrollTop: false });
});

const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
  });
}, { threshold: 0.12 });
revealEls.forEach(el => io.observe(el));

// Counting animation for stats
function animateCounter(element, target, duration = 2000) {
  const start = 0;
  const increment = target / (duration / 16);
  let current = start;
  
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = target + '+';
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(current);
    }
  }, 16);
}

// Observe stats for counting animation (covers any stat visible without a page switch,
// e.g. scrolling further down within the active page; triggerCounters() above handles
// the common case of stats becoming visible via page navigation)
document.addEventListener('DOMContentLoaded', () => {
  const statNumbers = document.querySelectorAll('.hero-stats .num[data-target], .section-stat .num[data-target]');
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.hasAttribute('data-counted')) {
        const target = parseInt(entry.target.getAttribute('data-target'));
        if (!isNaN(target) && target > 0) {
          entry.target.setAttribute('data-counted', 'true');
          animateCounter(entry.target, target);
          statsObserver.unobserve(entry.target);
        }
      }
    });
  }, { threshold: 0.1 });

  statNumbers.forEach(num => statsObserver.observe(num));
});
