/* ==========================================================================
   PROFESORADO EN CIENCIAS DE LA ADMINISTRACIÓN — IES N.º 9 JUANA AZURDUY
   Motor interactivo: Cargador inteligente de extensiones (.png / .jpg / .webp),
   Carrusel de Grupos (grupo 1.jpg a grupo 5.jpg), Radar de Correlatividades,
   Matriz de Incumbencias, Acordeón con Perfiles 3D y Legajo Circular.
   ========================================================================== */
'use strict';

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* 1. RESOLUCIÓN INTELIGENTE DE EXTENSIONES DE IMAGEN (.png / .jpg / .webp) Y ESCUDOS SVG */
const FALLBACK_SVGS = {
  admin: "data:image/svg+xml;utf8," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">' +
    '<circle cx="100" cy="100" r="96" fill="#ffffff" stroke="#071326" stroke-width="6"/>' +
    '<circle cx="100" cy="100" r="64" fill="#0c1f3d"/>' +
    '<path d="M58 128 L85 98 L108 114 L145 72" fill="none" stroke="#ff6d00" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<polygon points="145,62 156,82 133,78" fill="#ff6d00"/>' +
    '<circle cx="70" cy="116" r="18" fill="#ff6d00"/><text x="70" y="123" text-anchor="middle" fill="#fff" font-family="Arial" font-weight="bold" font-size="22">$</text>' +
    '<text x="100" y="32" text-anchor="middle" fill="#071326" font-family="Arial" font-weight="900" font-size="11">PROF. EN CS. DE LA ADMINISTRACIÓN</text>' +
    '<text x="100" y="182" text-anchor="middle" fill="#071326" font-family="Arial" font-weight="900" font-size="12">DESDE 2022</text>' +
    '</svg>'
  ),
  ies: "data:image/svg+xml;utf8," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240">' +
    '<ellipse cx="100" cy="120" rx="88" ry="112" fill="#e0f2fe" stroke="#071326" stroke-width="6"/>' +
    '<text x="100" y="48" text-anchor="middle" fill="#15803d" font-family="Arial" font-weight="900" font-size="22">I.E.S. N° 9</text>' +
    '<rect x="62" y="135" width="76" height="44" rx="4" fill="#ffffff" stroke="#071326" stroke-width="3"/>' +
    '<line x1="100" y1="135" x2="100" y2="179" stroke="#071326" stroke-width="2"/>' +
    '<text x="100" y="114" text-anchor="middle" fill="#071326" font-family="Georgia" font-style="italic" font-weight="bold" font-size="15">"Juana Azurduy"</text>' +
    '<text x="100" y="206" text-anchor="middle" fill="#071326" font-family="Arial" font-weight="bold" font-size="10">SAN PEDRO DE JUJUY</text>' +
    '</svg>'
  )
};

$$('img[data-try-srcs], img[data-fallback]').forEach(img => {
  const candidates = (img.getAttribute('data-try-srcs') || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  let tryIndex = 0;
  const fallbackKey = img.getAttribute('data-fallback');

  function tryNextSource() {
    tryIndex += 1;
    if (tryIndex < candidates.length) {
      img.src = candidates[tryIndex];
    } else if (fallbackKey && FALLBACK_SVGS[fallbackKey] && img.src !== FALLBACK_SVGS[fallbackKey]) {
      img.src = FALLBACK_SVGS[fallbackKey];
    }
  }

  img.addEventListener('error', tryNextSource);
  if (img.complete && img.naturalWidth === 0) {
    tryNextSource();
  }
});

/* 2. NAVEGACIÓN FLOTANTE MÓVIL Y BARRA DE PROGRESO */
const menuBtn = $('#menu-toggle');
const dockMenu = $('#dock-menu');

function setNavState(open) {
  if (!menuBtn || !dockMenu) return;
  menuBtn.setAttribute('aria-expanded', String(open));
  dockMenu.classList.toggle('is-open', open);
}

if (menuBtn && dockMenu) {
  menuBtn.addEventListener('click', () => {
    setNavState(menuBtn.getAttribute('aria-expanded') !== 'true');
  });
  $$('#dock-menu a').forEach(a => a.addEventListener('click', () => setNavState(false)));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') setNavState(false);
  });
}

const topProgress = $('#top-progress');
let scrollTick = false;
window.addEventListener('scroll', () => {
  if (scrollTick) return;
  scrollTick = true;
  requestAnimationFrame(() => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (topProgress) {
      topProgress.style.width = (max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0) + '%';
    }
    scrollTick = false;
  });
}, { passive: true });

/* 3. ANIMACIÓN DE ENTRADA (SCROLL REVEAL) */
const animItems = $$('[data-animate]');
if ('IntersectionObserver' in window && !reducedMotion) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  animItems.forEach(el => io.observe(el));
} else {
  animItems.forEach(el => el.classList.add('is-visible'));
}

/* 4. CARRUSEL CINEMATOGRÁFICO DE LOS 5 GRUPOS (grupo 1.jpg a grupo 5.jpg) */
const groupSlides = $$('.group-slide');
const thumbBtns = $$('.thumb-btn');
const prevGroupBtn = $('#group-prev');
const nextGroupBtn = $('#group-next');
const timerFill = $('#carousel-timer-fill');
const groupCarousel = $('#group-carousel');

let activeGroupIdx = 0;
let groupInterval = null;
let timerPercent = 0;

function showGroupSlide(index) {
  if (!groupSlides.length) return;
  activeGroupIdx = (index + groupSlides.length) % groupSlides.length;
  groupSlides.forEach((slide, i) => {
    slide.classList.toggle('is-active', i === activeGroupIdx);
  });
  thumbBtns.forEach((btn, i) => {
    const active = i === activeGroupIdx;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-selected', String(active));
  });
  timerPercent = 0;
  if (timerFill) timerFill.style.width = '0%';
}

function startGroupTimer() {
  if (reducedMotion || groupSlides.length <= 1) return;
  stopGroupTimer();
  groupInterval = setInterval(() => {
    timerPercent += 2;
    if (timerFill) timerFill.style.width = timerPercent + '%';
    if (timerPercent >= 100) {
      showGroupSlide(activeGroupIdx + 1);
    }
  }, 120);
}

function stopGroupTimer() {
  if (groupInterval) {
    clearInterval(groupInterval);
    groupInterval = null;
  }
}

if (groupSlides.length) {
  if (prevGroupBtn) {
    prevGroupBtn.addEventListener('click', () => {
      showGroupSlide(activeGroupIdx - 1);
      startGroupTimer();
    });
  }
  if (nextGroupBtn) {
    nextGroupBtn.addEventListener('click', () => {
      showGroupSlide(activeGroupIdx + 1);
      startGroupTimer();
    });
  }
  thumbBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      showGroupSlide(Number(btn.dataset.slideTo));
      startGroupTimer();
    });
  });

  if (groupCarousel) {
    groupCarousel.addEventListener('mouseenter', stopGroupTimer);
    groupCarousel.addEventListener('mouseleave', startGroupTimer);

    let touchX = null;
    groupCarousel.addEventListener('touchstart', e => {
      if (e.touches.length === 1) touchX = e.touches[0].clientX;
    }, { passive: true });
    groupCarousel.addEventListener('touchend', e => {
      if (touchX === null || !e.changedTouches.length) return;
      const dx = e.changedTouches[0].clientX - touchX;
      touchX = null;
      if (Math.abs(dx) > 42) {
        showGroupSlide(activeGroupIdx + (dx < 0 ? 1 : -1));
        startGroupTimer();
      }
    }, { passive: true });
  }
  startGroupTimer();
}

/* VISOR PANTALLA COMPLETA DEL CARRUSEL DE GRUPOS */
const modalDialog = $('#image-dialog');
const modalImg = $('#dialog-image');
const modalCap = $('#dialog-caption');
const modalCounter = $('#dialog-counter');
let modalIdx = 0;

function openGroupModal(idx) {
  if (!groupSlides.length || !modalImg) return;
  modalIdx = (idx + groupSlides.length) % groupSlides.length;
  const slide = groupSlides[modalIdx];
  const img = $('img', slide);
  const title = $('strong', slide);
  modalImg.src = img ? img.src : '';
  modalImg.alt = img ? img.alt : '';
  if (modalCap) modalCap.textContent = title ? title.textContent : '';
  if (modalCounter) modalCounter.textContent = (modalIdx + 1) + ' / ' + groupSlides.length;
  if (modalDialog && !modalDialog.open) modalDialog.showModal();
}

$$('[data-zoom]').forEach(btn => {
  btn.addEventListener('click', () => openGroupModal(Number(btn.dataset.zoom)));
});

const closeDialog = $('#dialog-close');
if (closeDialog && modalDialog) closeDialog.addEventListener('click', () => modalDialog.close());
const prevDialog = $('#dialog-prev');
if (prevDialog) prevDialog.addEventListener('click', () => openGroupModal(modalIdx - 1));
const nextDialog = $('#dialog-next');
if (nextDialog) nextDialog.addEventListener('click', () => openGroupModal(modalIdx + 1));
if (modalDialog) {
  modalDialog.addEventListener('click', e => {
    if (e.target === modalDialog) modalDialog.close();
  });
}

/* 5. SIMULADOR DE MALLA CURRICULAR Y RADAR DE CORRELATIVIDADES (RES. 2311-E/20) */
const subjects = Array.isArray(window.ADMIN_MATERIAS) ? window.ADMIN_MATERIAS : [];
const subjectById = new Map(subjects.map(s => [Number(s.id), s]));
const yearNames = { 1: '1.º Año', 2: '2.º Año', 3: '3.º Año', 4: '4.º Año' };

const unlocksMap = new Map();
subjects.forEach(s => unlocksMap.set(Number(s.id), []));
subjects.forEach(s => {
  const req = s.requirements || { cA: [], cR: [], rA: [] };
  const allReqs = new Set([...(req.cA || []), ...(req.cR || [])].map(Number));
  allReqs.forEach(reqId => {
    if (unlocksMap.has(reqId)) {
      unlocksMap.get(reqId).push(Number(s.id));
    }
  });
});

const mallaState = { year: '1', field: 'all', query: '', activeId: null, prevId: null };
const listEl = $('#subjects-list');
const searchEl = $('#subject-search');
const countEl = $('#subject-count');

function cleanStr(str) {
  return String(str).toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function getVisibleSubjects() {
  return subjects.filter(s => {
    const matchYear = mallaState.query || mallaState.year === 'all' || String(s.year) === mallaState.year;
    const matchField = mallaState.field === 'all' ||
      (mallaState.field === 'libre' ? Boolean(s.libre) : s.field.toLowerCase().includes(mallaState.field.toLowerCase()));
    const matchQuery = !mallaState.query ||
      cleanStr(s.name + ' ' + s.id + ' ' + s.field + ' ' + s.format + ' ' + yearNames[s.year]).includes(mallaState.query);
    return matchYear && matchField && matchQuery;
  });
}

function makeChips(ids, cls, emptyMsg) {
  if (!ids || !ids.length) return '<p>' + emptyMsg + '</p>';
  return '<div class="dep-chips">' + ids.map(id => {
    const item = subjectById.get(Number(id));
    if (!item) return '';
    return '<button type="button" class="dep-chip ' + cls + '" data-jump="' + item.id + '">' +
      '<span>#' + item.id + '</span> ' + escapeHtml(item.name) + ' ↗</button>';
  }).join('') + '</div>';
}

function renderSubjectDrawer(s) {
  const req = s.requirements || { cA: [], cR: [], rA: [] };
  const approved = Array.from(new Set((req.cA || []).map(Number)));
  const regular = Array.from(new Set((req.cR || []).map(Number))).filter(id => !approved.includes(id));
  const finals = Array.from(new Set((req.rA || []).map(Number)));
  const unlocks = unlocksMap.get(Number(s.id)) || [];

  const prev = mallaState.prevId && mallaState.prevId !== s.id ? subjectById.get(mallaState.prevId) : null;
  const backHtml = prev
    ? '<button type="button" class="unit-back-btn" data-back="' + prev.id + '">← Volver a #' + prev.id + ' ' + escapeHtml(prev.name) + '</button>'
    : '';

  return '<div class="unit-drawer" id="drawer-' + s.id + '">' +
    backHtml +
    '<div class="unit-specs-pills">' +
      '<span>Formato: ' + escapeHtml(s.format) + '</span>' +
      '<span>Régimen: ' + escapeHtml(s.regime) + '</span>' +
      '<span>Carga: ' + escapeHtml(s.weekly) + ' hs sem. (' + s.hours + ' hs cát.)</span>' +
      '<span>Acreditación: ' + escapeHtml(s.accreditation) + '</span>' +
      '<span>' + (s.libre ? '(*) Admite Alumno Libre' : 'Cursado Presencial') + '</span>' +
    '</div>' +
    '<div class="dep-section"><h4>Para cursar · Tener Aprobadas</h4>' + makeChips(approved, 'approved', 'Sin correlativas aprobadas exigidas para cursar.') + '</div>' +
    '<div class="dep-section"><h4>Para cursar · Tener Regulares</h4>' + makeChips(regular, 'regular', 'Sin correlativas regulares exigidas para cursar.') + '</div>' +
    '<div class="dep-section"><h4>Para rendir o promocionar · Tener Aprobadas</h4>' + makeChips(finals, 'exam', 'Sin requisitos previos para acreditar.') + '</div>' +
    '<div class="dep-section"><h4>Unidades posteriores que habilita</h4>' + makeChips(unlocks, 'unlocks', 'Unidad terminal del trayecto formativo.') + '</div>' +
  '</div>';
}

function renderMalla() {
  if (!listEl) return;

  $$('[data-year]').forEach(btn => {
    const active = !mallaState.query && mallaState.year === btn.dataset.year;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-pressed', String(active));
  });

  $$('[data-field]').forEach(btn => {
    const active = mallaState.field === btn.dataset.field;
    btn.classList.toggle('is-active', active);
  });

  const visible = getVisibleSubjects();
  if (countEl) {
    countEl.textContent = visible.length + (visible.length === 1 ? ' unidad' : ' unidades');
  }

  if (!visible.length) {
    listEl.innerHTML = '<div style="grid-column:1/-1;padding:36px;text-align:center;background:rgba(255,255,255,0.05);border-radius:14px;color:#cbd5e1;">No se encontraron unidades con ese filtro.</div>';
    return;
  }

  const sel = mallaState.activeId !== null ? subjectById.get(mallaState.activeId) : null;
  const appSet = sel ? new Set((sel.requirements.cA || []).map(Number)) : new Set();
  const regSet = sel ? new Set((sel.requirements.cR || []).map(Number)) : new Set();
  const unlSet = sel ? new Set(unlocksMap.get(Number(sel.id)) || []) : new Set();

  listEl.innerHTML = visible.map(s => {
    const isOpen = mallaState.activeId === s.id;
    const cls = [
      'unit-card',
      isOpen ? 'is-open is-selected' : '',
      appSet.has(s.id) ? 'is-req-approved' : '',
      !appSet.has(s.id) && regSet.has(s.id) ? 'is-req-regular' : '',
      unlSet.has(s.id) ? 'is-unlocked-target' : ''
    ].filter(Boolean).join(' ');

    const libreHtml = s.libre ? '<span class="unit-libre-pill" title="Admite condición de Alumno Libre por opción">(*) Libre</span>' : '';

    return '<article class="' + cls + '" id="unit-' + s.id + '" data-field-type="' + escapeHtml(s.field) + '">' +
      '<button type="button" class="unit-card-btn" data-open="' + s.id + '" aria-expanded="' + isOpen + '">' +
        '<div class="unit-top-bar">' +
          '<span class="unit-order-badge">ORDEN #' + s.id + '</span>' +
          '<div class="unit-tags-right">' +
            libreHtml +
            '<span class="unit-field-pill">' + escapeHtml(s.field) + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="unit-title-row">' +
          '<strong>' + escapeHtml(s.name) + '</strong>' +
          '<span class="unit-chevron"><svg class="ico"><use href="#ico-chevron"/></svg></span>' +
        '</div>' +
        '<div class="unit-Quick-meta">' +
          '<span>' + yearNames[s.year] + '</span>' +
          '<span>· ' + escapeHtml(s.format) + '</span>' +
          '<span>· ' + s.hours + ' hs cát.</span>' +
        '</div>' +
      '</button>' +
      (isOpen ? renderSubjectDrawer(s) : '') +
    '</article>';
  }).join('');
}

function navigateToUnit(id) {
  const target = subjectById.get(Number(id));
  if (!target) return;
  mallaState.prevId = mallaState.activeId && mallaState.activeId !== target.id ? mallaState.activeId : mallaState.prevId;
  mallaState.year = String(target.year);
  mallaState.field = 'all';
  mallaState.query = '';
  if (searchEl) searchEl.value = '';
  mallaState.activeId = target.id;
  renderMalla();
  const el = $('#unit-' + target.id);
  if (el) el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
}

$$('[data-year]').forEach(btn => {
  btn.addEventListener('click', () => {
    mallaState.year = btn.dataset.year;
    mallaState.activeId = null;
    mallaState.prevId = null;
    renderMalla();
  });
});

$$('[data-field]').forEach(btn => {
  btn.addEventListener('click', () => {
    mallaState.field = btn.dataset.field;
    mallaState.activeId = null;
    if (mallaState.field !== 'all') mallaState.year = 'all';
    renderMalla();
  });
});

if (searchEl) {
  searchEl.addEventListener('input', () => {
    mallaState.query = cleanStr(searchEl.value);
    mallaState.activeId = null;
    renderMalla();
  });
}

if (listEl) {
  listEl.addEventListener('click', e => {
    const back = e.target.closest('[data-back]');
    if (back) {
      const id = Number(back.dataset.back);
      mallaState.prevId = null;
      navigateToUnit(id);
      return;
    }
    const jump = e.target.closest('[data-jump]');
    if (jump) {
      navigateToUnit(Number(jump.dataset.jump));
      return;
    }
    const openBtn = e.target.closest('[data-open]');
    if (!openBtn) return;
    const id = Number(openBtn.dataset.open);
    mallaState.activeId = mallaState.activeId === id ? null : id;
    mallaState.prevId = null;
    renderMalla();
  });
  renderMalla();
}

/* 6. MATRIZ DE INCUMBENCIAS Y SALIDA LABORAL */
const competencies = Array.isArray(window.ADMIN_COMPETENCIAS) ? window.ADMIN_COMPETENCIAS : [];
const compState = { filter: 'all', query: '', activeId: null };
const compListEl = $('#comp-list');
const compSearchEl = $('#comp-search');
const compCountEl = $('#comp-count');

function getVisibleCompetencies() {
  return competencies.filter(item => {
    const matchFilter = compState.query ||
      compState.filter === 'all' ||
      (compState.filter === 'docente' ? item.role === 'DOCENTE' : item.category === compState.filter);
    const matchQuery = !compState.query ||
      cleanStr(item.name + ' ' + item.orientation + ' ' + item.modality + ' ' + item.course).includes(compState.query);
    return matchFilter && matchQuery;
  });
}

function renderCompetencies() {
  if (!compListEl) return;

  $$('[data-comp-filter]').forEach(btn => {
    const active = !compState.query && compState.filter === btn.dataset.compFilter;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-pressed', String(active));
  });

  const visible = getVisibleCompetencies();
  if (compCountEl) {
    compCountEl.textContent = 'Mostrando ' + visible.length + (visible.length === 1 ? ' espacio curricular' : ' espacios curriculares');
  }

  if (!visible.length) {
    compListEl.innerHTML = '<div style="grid-column:1/-1;padding:32px;text-align:center;background:rgba(255,255,255,0.06);border-radius:14px;">Sin coincidencias para esa búsqueda.</div>';
    return;
  }

  compListEl.innerHTML = visible.map(item => {
    const isOpen = compState.activeId === item.id;
    const isDocente = item.role === 'DOCENTE';
    return '<article class="unit-card ' + (isOpen ? 'is-open' : '') + '" data-field-type="' + (isDocente ? 'Práctica Profesional' : 'Específica') + '">' +
      '<button type="button" class="unit-card-btn" data-comp-open="' + item.id + '" aria-expanded="' + isOpen + '">' +
        '<div class="unit-top-bar">' +
          '<span class="unit-order-badge">' + escapeHtml(item.course) + '</span>' +
          '<span class="unit-libre-pill" style="background:' + (isDocente ? '#d1fae5;color:#065f46' : '#fef3c7;color:#92400e') + '">' + escapeHtml(item.role) + '</span>' +
        '</div>' +
        '<div class="unit-title-row">' +
          '<strong>' + escapeHtml(item.name) + '</strong>' +
          '<span class="unit-chevron"><svg class="ico"><use href="#ico-chevron"/></svg></span>' +
        '</div>' +
        '<div class="unit-Quick-meta">' +
          '<span>' + escapeHtml(item.modality) + '</span>' +
          '<span>· ' + escapeHtml(item.orientation) + '</span>' +
        '</div>' +
      '</button>' +
      (isOpen ? '<div class="unit-drawer"><div class="dep-section"><h4>Alcance y Marco Curricular</h4><p style="color:#334155;font-weight:600">' + escapeHtml(item.note) + ' (' + escapeHtml(item.res) + ')</p></div></div>' : '') +
    '</article>';
  }).join('');
}

if (compListEl) {
  $$('[data-comp-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      compState.filter = btn.dataset.compFilter;
      compState.activeId = null;
      compState.query = '';
      if (compSearchEl) compSearchEl.value = '';
      renderCompetencies();
    });
  });
  if (compSearchEl) {
    compSearchEl.addEventListener('input', () => {
      compState.query = cleanStr(compSearchEl.value);
      compState.activeId = null;
      renderCompetencies();
    });
  }
  compListEl.addEventListener('click', e => {
    const btn = e.target.closest('[data-comp-open]');
    if (!btn) return;
    const id = Number(btn.dataset.compOpen);
    compState.activeId = compState.activeId === id ? null : id;
    renderCompetencies();
  });
  renderCompetencies();
}

/* 7. ACORDEÓN INTERACTIVO DE PERFILES CON IMÁGENES 3D (DECK) */
const deckCards = $$('.deck-card');
deckCards.forEach(card => {
  card.addEventListener('click', () => {
    deckCards.forEach(c => c.classList.toggle('is-expanded', c === card));
  });
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      deckCards.forEach(c => c.classList.toggle('is-expanded', c === card));
    }
  });
});

/* 8. VERIFICADOR DE LEGAJO CON ANILLO SVG EN VIVO */
const LEGAJO_KEY = 'ies9_admin_legajo_v2';
const legajoInputs = $$('#checklist-items input[type="checkbox"]');
const checkCount = $('#checklist-count');
const checkPercent = $('#checklist-percent');
const ringFill = $('#legajo-ring-fill');
const resetBtn = $('#reset-checklist');

function loadLegajo() {
  try {
    const saved = JSON.parse(localStorage.getItem(LEGAJO_KEY) || '{}');
    legajoInputs.forEach(inp => {
      if (saved[inp.dataset.doc]) inp.checked = true;
    });
  } catch (_) {}
}

function syncLegajo() {
  const total = legajoInputs.length || 1;
  const done = legajoInputs.filter(i => i.checked).length;
  const pct = Math.round((done / total) * 100);
  const circumference = 264;
  const dash = (done / total) * circumference;

  if (checkCount) checkCount.textContent = String(done);
  if (checkPercent) checkPercent.textContent = pct + '%';
  if (ringFill) ringFill.setAttribute('stroke-dasharray', dash + ' ' + circumference);

  try {
    const state = {};
    legajoInputs.forEach(i => { state[i.dataset.doc] = i.checked; });
    localStorage.setItem(LEGAJO_KEY, JSON.stringify(state));
  } catch (_) {}
}

if (legajoInputs.length) {
  loadLegajo();
  legajoInputs.forEach(i => i.addEventListener('change', syncLegajo));
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      legajoInputs.forEach(i => { i.checked = false; });
      syncLegajo();
    });
  }
  syncLegajo();
}