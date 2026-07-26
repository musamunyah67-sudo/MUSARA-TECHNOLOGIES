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

// Smooth-scroll for in-page section links
document.querySelectorAll('a[href^="#"]:not([data-modal-title])').forEach((link) => {
  link.addEventListener('click', (e) => {
    const id = link.getAttribute('href').slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
  });
}, { threshold: 0.12 });
revealEls.forEach(el => io.observe(el));
