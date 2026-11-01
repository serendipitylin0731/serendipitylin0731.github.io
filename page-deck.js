(() => {
  const root = document.documentElement;
  const main = document.getElementById('main');
  const footer = document.querySelector('.site-footer');
  const sections = [...main.querySelectorAll(':scope > section')];
  const labels = {
    top: ['首页', 'Home'],
    about: ['关于我', 'About'],
    journey: ['学习经历', 'Journey'],
    projects: ['项目', 'Projects'],
    skills: ['技术与工具', 'Tools'],
    beyond: ['代码之外', 'Beyond code'],
    contact: ['联系我', 'Contact']
  };
  if (sections.length < 2 || sections.some(section => !labels[section.id])) return;

  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  const pages = sections.map(section => {
    const panel = document.createElement('div');
    const scroller = document.createElement('div');
    const content = document.createElement('div');
    panel.className = 'story-page';
    scroller.className = 'story-page-scroll';
    scroller.tabIndex = -1;
    content.className = 'story-page-content';
    main.insertBefore(panel, section);
    panel.append(scroller);
    scroller.append(content);
    content.append(section);
    if (section.id === 'contact' && footer) content.append(footer);
    return { id: section.id, panel, scroller };
  });

  const rail = document.createElement('nav');
  rail.className = 'deck-rail';
  rail.innerHTML = '<div class="deck-counter" aria-hidden="true"><span class="deck-counter-current">01</span><span class="deck-counter-divider">/</span><span class="deck-counter-total"></span></div><div class="deck-links"></div><div class="deck-controls"><button class="deck-previous" type="button">↑</button><button class="deck-next" type="button">↓</button></div>';
  const links = rail.querySelector('.deck-links');
  const previous = rail.querySelector('.deck-previous');
  const next = rail.querySelector('.deck-next');
  const counter = rail.querySelector('.deck-counter-current');
  rail.querySelector('.deck-counter-total').textContent = String(pages.length).padStart(2, '0');
  const pageLinks = pages.map(page => {
    const link = document.createElement('a');
    const label = document.createElement('span');
    link.href = `#${page.id}`;
    link.className = 'deck-link';
    label.className = 'deck-link-label';
    label.setAttribute('aria-hidden', 'true');
    link.append(label);
    links.append(link);
    return link;
  });
  const sweep = document.createElement('div');
  sweep.className = 'deck-sweep';
  sweep.setAttribute('aria-hidden', 'true');
  const announcement = document.createElement('div');
  announcement.className = 'sr-only';
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  main.append(sweep, rail, announcement);

  const english = () => root.lang === 'en';
  const nameOf = page => labels[page.id][english() ? 1 : 0];
  const indexFromHash = () => {
    let hash = location.hash.slice(1);
    try { hash = decodeURIComponent(hash); } catch (error) { /* Ignore malformed fragments. */ }
    const index = pages.findIndex(page => page.id === hash);
    return index < 0 ? 0 : index;
  };
  let current = indexFromHash();
  let moving = false;
  let motionTimer = 0;
  let wheelLast = 0;
  let wheelDirection = 0;
  let wheelAmount = 0;
  let wheelStartedAtEdge = false;
  let touch = null;

  function updateLabels(announce = false) {
    const en = english();
    rail.setAttribute('aria-label', en ? 'Page navigation' : '页面导航');
    previous.setAttribute('aria-label', en ? 'Previous page' : '上一页');
    next.setAttribute('aria-label', en ? 'Next page' : '下一页');
    previous.disabled = current === 0;
    next.disabled = current === pages.length - 1;
    counter.textContent = String(current + 1).padStart(2, '0');
    pageLinks.forEach((link, index) => {
      const label = nameOf(pages[index]);
      link.setAttribute('aria-label', en ? `Page ${index + 1}: ${label}` : `第 ${index + 1} 页：${label}`);
      link.title = label;
      link.querySelector('.deck-link-label').textContent = label;
      if (index === current) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    document.querySelectorAll('.main-nav a[href^="#"]').forEach(link => {
      if (link.getAttribute('href') === `#${pages[current].id}`) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    if (announce) announcement.textContent = en
      ? `Page ${current + 1} of ${pages.length}: ${nameOf(pages[current])}`
      : `第 ${current + 1} 页，共 ${pages.length} 页：${nameOf(pages[current])}`;
  }

  function setAvailable(page, available) {
    page.panel.inert = !available;
    page.panel.setAttribute('aria-hidden', available ? 'false' : 'true');
  }

  function atEdge(scroller, direction) {
    return direction > 0
      ? scroller.scrollTop >= scroller.scrollHeight - scroller.clientHeight - 2
      : scroller.scrollTop <= 2;
  }

  function writeHash(id, mode) {
    if (mode === 'none') return;
    const url = new URL(location.href);
    url.hash = id;
    if (mode === 'push' && location.hash !== `#${id}`) history.pushState(null, '', url);
    else history.replaceState(null, '', url);
  }

  function showPage(index, options = {}) {
    if (index < 0 || index >= pages.length) return;
    const destination = pages[index];
    if (index === current) {
      if (options.reset) destination.scroller.scrollTop = 0;
      writeHash(destination.id, options.history || 'none');
      if (options.focus) destination.scroller.focus({ preventScroll: true });
      return;
    }

    clearTimeout(motionTimer);
    pages.forEach(page => page.panel.classList.remove('is-exiting-up', 'is-exiting-down', 'is-before'));
    const outgoing = pages[current];
    const direction = index > current ? 1 : -1;
    const focusWasInside = outgoing.panel.contains(document.activeElement);
    destination.scroller.scrollTop = options.fromEnd && direction < 0
      ? destination.scroller.scrollHeight : 0;
    if (direction < 0) destination.panel.classList.add('is-before');
    void destination.panel.offsetWidth;

    setAvailable(outgoing, false);
    outgoing.panel.classList.remove('is-active');
    outgoing.panel.classList.add(direction > 0 ? 'is-exiting-up' : 'is-exiting-down');
    destination.panel.classList.remove('is-before');
    destination.panel.classList.add('is-active');
    setAvailable(destination, true);
    current = index;
    writeHash(destination.id, options.history || 'replace');
    updateLabels(true);
    if (focusWasInside || options.focus) destination.scroller.focus({ preventScroll: true });

    main.classList.remove('deck-forward', 'deck-backward');
    void main.offsetWidth;
    if (!motionPreference.matches) main.classList.add(direction > 0 ? 'deck-forward' : 'deck-backward');
    moving = !motionPreference.matches;
    motionTimer = window.setTimeout(() => {
      outgoing.panel.classList.remove('is-exiting-up', 'is-exiting-down');
      main.classList.remove('deck-forward', 'deck-backward');
      moving = false;
    }, motionPreference.matches ? 0 : 820);
  }

  function nestedCanScroll(target, scroller, direction) {
    let node = target && target.nodeType === 1 ? target : target && target.parentElement;
    while (node && node !== scroller && scroller.contains(node)) {
      const overflow = getComputedStyle(node).overflowY;
      if (/(auto|scroll)/.test(overflow) && node.scrollHeight > node.clientHeight + 2 && !atEdge(node, direction)) return true;
      node = node.parentElement;
    }
    return false;
  }

  function handleWheel(event, fromObject = false) {
    if (event.ctrlKey || event.metaKey || event.shiftKey || Math.abs(event.deltaX) >= Math.abs(event.deltaY) || !event.deltaY) return;
    const direction = Math.sign(event.deltaY);
    const scroller = pages[current].scroller;
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? scroller.clientHeight : 1);
    const now = performance.now();
    const fresh = now - wheelLast > 200 || direction !== wheelDirection;
    wheelLast = now;
    if (fresh) {
      wheelDirection = direction;
      wheelAmount = 0;
      wheelStartedAtEdge = atEdge(scroller, direction);
    }
    wheelAmount += Math.abs(delta);
    if (moving) {
      event.preventDefault();
      return;
    }
    if (!fromObject && nestedCanScroll(event.target, scroller, direction)) return;
    if (!atEdge(scroller, direction)) {
      if (fromObject || !scroller.contains(event.target)) {
        event.preventDefault();
        scroller.scrollTop += delta;
      }
      return;
    }
    if (current + direction < 0 || current + direction >= pages.length) return;
    event.preventDefault();
    if (wheelStartedAtEdge && wheelAmount >= 35) {
      wheelStartedAtEdge = false;
      showPage(current + direction, { fromEnd: direction < 0 });
    }
  }

  function startTouch(event, object = null) {
    if (event.touches.length !== 1) return;
    const point = event.touches[0];
    const scroller = pages[current].scroller;
    const timeline = object && object.closest('.timeline-frame');
    touch = { x: point.clientX, y: point.clientY, top: scroller.scrollTop,
      atTop: atEdge(scroller, -1), atBottom: atEdge(scroller, 1),
      object, timeline, left: timeline ? timeline.scrollLeft : 0 };
  }

  function moveEmbeddedTouch(event) {
    if (!touch || !touch.object || event.touches.length !== 1) return;
    const dx = event.touches[0].clientX - touch.x;
    const dy = event.touches[0].clientY - touch.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 8) return;
    if (Math.abs(dy) > Math.abs(dx)) {
      event.preventDefault();
      pages[current].scroller.scrollTop = touch.top - dy;
    } else if (touch.timeline) {
      event.preventDefault();
      touch.timeline.scrollLeft = touch.left - dx;
    }
  }

  function endTouch(event) {
    if (!touch || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - touch.x;
    const dy = event.changedTouches[0].clientY - touch.y;
    const direction = dy < 0 ? 1 : -1;
    const beganAtEdge = direction > 0 ? touch.atBottom : touch.atTop;
    touch = null;
    if (!moving && beganAtEdge && Math.abs(dy) > 75 && Math.abs(dy) > Math.abs(dx) * 1.35) {
      showPage(current + direction, { fromEnd: direction < 0 });
    }
  }

  function bindEmbeddedDocument(object) {
    let embedded;
    try { embedded = object.contentDocument; } catch (error) { return; }
    if (!embedded || !embedded.documentElement || embedded.documentElement.dataset.deckBound === 'true') return;
    embedded.documentElement.dataset.deckBound = 'true';
    embedded.addEventListener('wheel', event => handleWheel(event, true), { passive: false });
    embedded.addEventListener('touchstart', event => startTouch(event, object), { passive: true });
    embedded.addEventListener('touchmove', moveEmbeddedTouch, { passive: false });
    embedded.addEventListener('touchend', endTouch, { passive: true });
    embedded.addEventListener('touchcancel', () => { touch = null; }, { passive: true });
  }

  pages.forEach((page, index) => {
    page.panel.classList.toggle('is-active', index === current);
    setAvailable(page, index === current);
  });
  root.classList.add('deck-ready');
  updateLabels();
  document.querySelectorAll('object[data-asset]').forEach(object => {
    object.addEventListener('load', () => bindEmbeddedDocument(object));
    bindEmbeddedDocument(object);
  });
  window.addEventListener('wheel', event => handleWheel(event), { passive: false });
  window.addEventListener('touchstart', event => startTouch(event), { passive: true });
  window.addEventListener('touchend', endTouch, { passive: true });
  window.addEventListener('touchcancel', () => { touch = null; }, { passive: true });

  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const id = link.getAttribute('href').slice(1);
    const index = id === 'main' ? 0 : pages.findIndex(page => page.id === id);
    if (index < 0) return;
    event.preventDefault();
    showPage(index, { history: 'push', reset: true, focus: id === 'main' });
  });
  previous.addEventListener('click', () => showPage(current - 1, { history: 'push' }));
  next.addEventListener('click', () => showPage(current + 1, { history: 'push' }));
  window.addEventListener('popstate', () => showPage(indexFromHash(), { history: 'none', reset: true }));
  window.addEventListener('hashchange', () => showPage(indexFromHash(), { history: 'none', reset: true }));
  new MutationObserver(() => updateLabels()).observe(root, { attributes: true, attributeFilter: ['lang'] });

  window.addEventListener('keydown', event => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    const target = event.target;
    if (target && target.closest && target.closest('input, textarea, select, [contenteditable="true"]')) return;
    const isControl = target && target.closest && target.closest('button, a, summary');
    let direction = 0;
    let distance = 0;
    if (event.key === 'PageDown' || (event.key === ' ' && !event.shiftKey && !isControl)) { direction = 1; distance = 0.8; }
    else if (event.key === 'PageUp' || (event.key === ' ' && event.shiftKey && !isControl)) { direction = -1; distance = 0.8; }
    else if (event.key === 'ArrowDown' && !isControl) { direction = 1; distance = 0.16; }
    else if (event.key === 'ArrowUp' && !isControl) { direction = -1; distance = 0.16; }
    if (!direction || nestedCanScroll(target, pages[current].scroller, direction)) return;
    event.preventDefault();
    if (moving) return;
    const scroller = pages[current].scroller;
    if (atEdge(scroller, direction)) showPage(current + direction, { fromEnd: direction < 0 });
    else scroller.scrollBy({ top: direction * scroller.clientHeight * distance, behavior: motionPreference.matches ? 'auto' : 'smooth' });
  });
})();
