(() => {
  const root = document.documentElement;
  const main = document.getElementById('main');
  const footer = document.querySelector('.site-footer');
  const sections = [...main.querySelectorAll(':scope > section')];
  const labels = {
    top: ['首页', 'Home'], about: ['关于与经历', 'About & journey'],
    journey: ['学习经历', 'Journey'], projects: ['项目', 'Projects'],
    skills: ['技术与工具', 'Tools'], beyond: ['代码之外', 'Beyond code'], contact: ['联系我', 'Contact']
  };
  if (sections.length < 2 || sections.some(section => !labels[section.id])) return;
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  const groups = sections.reduce((result, section) => {
    if (section.id === 'journey' && result.length && result[result.length - 1].id === 'about') result[result.length - 1].sections.push(section);
    else result.push({ id: section.id, sections: [section] });
    return result;
  }, []);
  const pages = groups.map(group => {
    const panel = document.createElement('div');
    const scroller = document.createElement('div');
    const content = document.createElement('div');
    panel.className = 'story-page';
    panel.dataset.page = group.id;
    scroller.className = 'story-page-scroll';
    scroller.tabIndex = -1;
    content.className = 'story-page-content';
    main.insertBefore(panel, group.sections[0]);
    panel.append(scroller);
    scroller.append(content);
    content.append(...group.sections);
    if (group.id === 'contact' && footer) content.append(footer);
    let projectHeader = null;
    if (group.id === 'projects') {
      const heading = group.sections[0].querySelector(':scope > .section-heading');
      const tabs = group.sections[0].querySelector(':scope > .project-tabs');
      if (heading && tabs) {
        projectHeader = document.createElement('div');
        const headingRow = document.createElement('div');
        const carouselControls = document.createElement('div');
        projectHeader.className = 'page-project-header';
        headingRow.className = 'page-project-heading';
        carouselControls.className = 'page-project-carousels';
        group.sections[0].querySelectorAll('.project-carousel').forEach(carousel => {
          if (carousel.deckControls && carousel.deckControls.bar) carouselControls.append(carousel.deckControls.bar);
        });
        headingRow.append(heading, carouselControls);
        projectHeader.append(headingRow, tabs);
        panel.append(projectHeader);
      }
    }
    if (group.id === 'beyond') {
      const heading = group.sections[0].querySelector(':scope > .section-heading');
      const intro = group.sections[0].querySelector(':scope > .beyond-intro');
      const tabs = group.sections[0].querySelector(':scope > .beyond-tabs');
      if (heading && intro && tabs) {
        projectHeader = document.createElement('div');
        projectHeader.className = 'page-beyond-header';
        projectHeader.append(heading, intro, tabs);
        panel.append(projectHeader);
      }
    }
    return { id: group.id, sections: group.sections, panel, scroller, projectHeader, readIndex: 0, readCount: 1, readTarget: null, readTimer: 0 };
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
  const reader = document.createElement('div');
  reader.className = 'deck-reader';
  reader.hidden = true;
  reader.innerHTML = '<span class="deck-reader-label"></span><button class="reader-previous" type="button">←</button><span class="reader-position" aria-live="polite"></span><button class="reader-next" type="button">→</button>';
  const readerLabel = reader.querySelector('.deck-reader-label');
  const readerPosition = reader.querySelector('.reader-position');
  const readerPrevious = reader.querySelector('.reader-previous');
  const readerNext = reader.querySelector('.reader-next');
  const sweep = document.createElement('div');
  sweep.className = 'deck-sweep';
  sweep.setAttribute('aria-hidden', 'true');
  const announcement = document.createElement('div');
  announcement.className = 'sr-only';
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  main.append(sweep, rail, reader, announcement);

  const english = () => root.lang === 'en';
  const nameOf = page => labels[page.id][english() ? 1 : 0];
  const hashTarget = () => {
    let hash = location.hash.slice(1);
    try { hash = decodeURIComponent(hash); } catch (error) { /* Ignore malformed fragments. */ }
    return hash;
  };
  const indexForTarget = target => pages.findIndex(page => page.sections.some(section => section.id === target));
  const indexFromHash = () => {
    const index = indexForTarget(hashTarget());
    return index < 0 ? 0 : index;
  };
  let current = indexFromHash();
  let moving = false;
  let motionTimer = 0;
  let refreshFrame = 0;
  let refreshReset = false;
  let refreshAnchor = null;
  let wheelLast = 0;
  let wheelDirection = 0;
  let wheelAmount = 0;
  let wheelConsumed = false;
  let touch = null;
  const initialAnchor = hashTarget();
  let initialAnchorPending = indexForTarget(initialAnchor) >= 0;

  function columnForSection(page, target) {
    const section = page.sections.find(item => item.id === target);
    if (!section || section.id === page.id) return 0;
    const rect = section.getClientRects()[0];
    const viewport = page.scroller.getBoundingClientRect();
    if (!rect || !page.scroller.clientWidth) return 0;
    const scale = viewport.width / page.scroller.clientWidth || 1;
    const left = page.scroller.scrollLeft + (rect.left - viewport.left) / scale;
    return Math.max(0, Math.min(page.readCount - 1, Math.floor((left + 2) / page.scroller.clientWidth)));
  }

  function updateLabels(announce = false) {
    const en = english();
    const page = pages[current];
    rail.setAttribute('aria-label', en ? 'Page navigation' : '页面导航');
    previous.setAttribute('aria-label', en ? 'Previous section' : '上一部分');
    next.setAttribute('aria-label', en ? 'Next section' : '下一部分');
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
    const journey = page.sections.find(section => section.id === 'journey');
    const journeyStart = journey ? columnForSection(page, 'journey') : 0;
    const activeId = journey && page.readIndex >= journeyStart ? 'journey' : page.id;
    page.activeSection = activeId;
    page.sectionOffset = activeId === 'journey' ? page.readIndex - journeyStart : page.readIndex;
    document.querySelectorAll('.main-nav a[href^="#"]').forEach(link => {
      if (link.getAttribute('href') === `#${activeId}`) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    reader.hidden = page.readCount <= 1;
    readerLabel.textContent = en ? 'READ' : '内容';
    readerPosition.textContent = `${String(page.readIndex + 1).padStart(2, '0')} / ${String(page.readCount).padStart(2, '0')}`;
    readerPrevious.setAttribute('aria-label', en ? 'Previous screen in this section' : '本部分上一屏');
    readerNext.setAttribute('aria-label', en ? 'Next screen in this section' : '本部分下一屏');
    readerPrevious.disabled = page.readIndex === 0;
    readerNext.disabled = page.readIndex >= page.readCount - 1;
    if (announce) announcement.textContent = en
      ? `${nameOf(page)}, screen ${page.readIndex + 1} of ${page.readCount}`
      : `${nameOf(page)}，第 ${page.readIndex + 1} 屏，共 ${page.readCount} 屏`;
  }

  function setAvailable(page, available) {
    page.panel.inert = !available;
    page.panel.setAttribute('aria-hidden', available ? 'false' : 'true');
  }

  function measurePage(page, reset = false) {
    clearTimeout(page.readTimer);
    page.readTarget = null;
    if (page.projectHeader) page.panel.style.setProperty('--project-header-height', `${page.projectHeader.offsetHeight}px`);
    const width = page.scroller.clientWidth;
    if (!width) return;
    page.scroller.style.setProperty('--deck-page-width', `${width}px`);
    page.readCount = Math.max(1, Math.ceil((page.scroller.scrollWidth - 2) / width));
    page.readIndex = reset ? 0 : Math.min(page.readIndex, page.readCount - 1);
    page.scroller.scrollTo({ left: page.readIndex * width, top: 0, behavior: 'auto' });
  }

  function refreshPages(resetCurrent = false) {
    pages.forEach((page, index) => measurePage(page, resetCurrent && index === current));
    updateLabels();
  }

  function scheduleRefresh(resetCurrent = false, anchor = null) {
    refreshReset = refreshReset || resetCurrent;
    if (anchor) refreshAnchor = anchor;
    if (refreshFrame) return;
    refreshFrame = requestAnimationFrame(() => {
      const reset = refreshReset;
      const saved = refreshAnchor;
      refreshFrame = 0;
      refreshReset = false;
      refreshAnchor = null;
      refreshPages(reset);
      if (!reset && saved && saved.page === pages[current]) {
        readPage(saved.page, columnForSection(saved.page, saved.section) + saved.offset, false, false);
      }
    });
  }

  function readPage(page, index, smooth = true, announce = true) {
    clearTimeout(page.readTimer);
    page.readIndex = Math.max(0, Math.min(index, page.readCount - 1));
    page.readTarget = smooth && !motionPreference.matches ? page.readIndex : null;
    page.scroller.scrollTo({ left: page.readIndex * page.scroller.clientWidth, top: 0,
      behavior: smooth && !motionPreference.matches ? 'smooth' : 'auto' });
    if (page.readTarget !== null) page.readTimer = window.setTimeout(() => {
      page.readTarget = null;
      page.readIndex = Math.max(0, Math.min(page.readCount - 1, Math.round(page.scroller.scrollLeft / page.scroller.clientWidth)));
      if (page === pages[current]) updateLabels();
    }, 600);
    if (page === pages[current]) updateLabels(announce);
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
      measurePage(destination);
      if (options.target) readPage(destination, columnForSection(destination, options.target), true, false);
      else if (options.reset) readPage(destination, 0, false, false);
      writeHash(options.target || destination.id, options.history || 'none');
      if (options.focus) destination.scroller.focus({ preventScroll: true });
      updateLabels();
      return;
    }
    clearTimeout(motionTimer);
    pages.forEach(page => page.panel.classList.remove('is-exiting-up', 'is-exiting-down', 'is-before'));
    const outgoing = pages[current];
    const direction = index > current ? 1 : -1;
    const focusWasInside = outgoing.panel.contains(document.activeElement);
    measurePage(destination);
    if (direction < 0) destination.panel.classList.add('is-before');
    void destination.panel.offsetWidth;
    setAvailable(outgoing, false);
    outgoing.panel.classList.remove('is-active');
    outgoing.panel.classList.add(direction > 0 ? 'is-exiting-up' : 'is-exiting-down');
    destination.panel.classList.remove('is-before');
    destination.panel.classList.add('is-active');
    setAvailable(destination, true);
    current = index;
    const readingIndex = options.target ? columnForSection(destination, options.target)
      : options.fromEnd && direction < 0 ? destination.readCount - 1 : 0;
    readPage(destination, readingIndex, false, false);
    writeHash(options.target || destination.id, options.history || 'replace');
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

  function advance(direction) {
    if (moving) return;
    const page = pages[current];
    const nextReading = page.readIndex + direction;
    if (nextReading >= 0 && nextReading < page.readCount) readPage(page, nextReading);
    else showPage(current + direction, { fromEnd: direction < 0 });
  }

  function handleWheel(event) {
    if (event.ctrlKey || event.metaKey || event.shiftKey || Math.abs(event.deltaX) >= Math.abs(event.deltaY) || !event.deltaY) return;
    initialAnchorPending = false;
    event.preventDefault();
    const direction = Math.sign(event.deltaY);
    const now = performance.now();
    if (now - wheelLast > 200 || direction !== wheelDirection) {
      wheelDirection = direction;
      wheelAmount = 0;
      wheelConsumed = false;
    }
    wheelLast = now;
    wheelAmount += Math.abs(event.deltaY) * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? pages[current].scroller.clientHeight : 1);
    if (!moving && !wheelConsumed && wheelAmount >= 35) {
      wheelConsumed = true;
      advance(direction);
    }
  }

  function startTouch(event, object = null) {
    if (event.touches.length !== 1) return;
    initialAnchorPending = false;
    const point = event.touches[0];
    const timeline = object && object.closest('.timeline-frame');
    touch = { x: point.clientX, y: point.clientY, object, timeline, left: timeline ? timeline.scrollLeft : 0 };
  }

  function moveEmbeddedTouch(event) {
    if (!touch || !touch.object || event.touches.length !== 1) return;
    const dx = event.touches[0].clientX - touch.x;
    const dy = event.touches[0].clientY - touch.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 8) return;
    if (Math.abs(dy) > Math.abs(dx)) event.preventDefault();
    else if (touch.timeline) {
      event.preventDefault();
      touch.timeline.scrollLeft = touch.left - dx;
    }
  }

  function endTouch(event) {
    if (!touch || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - touch.x;
    const dy = event.changedTouches[0].clientY - touch.y;
    touch = null;
    if (!moving && Math.abs(dy) > 75 && Math.abs(dy) > Math.abs(dx) * 1.35) advance(dy < 0 ? 1 : -1);
  }

  function bindEmbeddedDocument(object) {
    let embedded;
    try { embedded = object.contentDocument; } catch (error) { return; }
    if (!embedded || !embedded.documentElement || embedded.documentElement.dataset.deckBound === 'true') return;
    embedded.documentElement.dataset.deckBound = 'true';
    embedded.addEventListener('wheel', handleWheel, { passive: false });
    embedded.addEventListener('touchstart', event => startTouch(event, object), { passive: true });
    embedded.addEventListener('touchmove', moveEmbeddedTouch, { passive: false });
    embedded.addEventListener('touchend', endTouch, { passive: true });
    embedded.addEventListener('touchcancel', () => { touch = null; }, { passive: true });
  }

  pages.forEach((page, index) => {
    page.panel.classList.toggle('is-active', index === current);
    setAvailable(page, index === current);
    page.scroller.addEventListener('scroll', () => {
      if (page.scroller.scrollTop) page.scroller.scrollTop = 0;
      const width = page.scroller.clientWidth;
      if (!width || page.readTarget !== null) return;
      page.readIndex = Math.max(0, Math.min(page.readCount - 1, Math.round(page.scroller.scrollLeft / width)));
      if (index === current) updateLabels();
    }, { passive: true });
    page.scroller.addEventListener('focusin', event => {
      if (event.target === page.scroller) return;
      const target = event.target.closest('.timeline-frame') || event.target;
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (index !== current || !page.scroller.contains(document.activeElement)) return;
        const rect = target.getClientRects()[0];
        const viewport = page.scroller.getBoundingClientRect();
        const width = page.scroller.clientWidth;
        if (!rect || !width) return;
        const scale = viewport.width / width || 1;
        const left = page.scroller.scrollLeft + (rect.left - viewport.left) / scale;
        const screen = Math.floor((left + 2) / width);
        if (Math.abs(page.scroller.scrollLeft - screen * width) > 1) readPage(page, screen, false, false);
      }));
    });
  });
  root.classList.add('deck-ready');
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
  const keepStageStill = () => {
    if (main.scrollTop || main.scrollLeft) {
      main.scrollTop = 0;
      main.scrollLeft = 0;
    }
  };
  main.addEventListener('scroll', keepStageStill, { passive: true });
  keepStageStill();
  refreshPages();
  const settleInitialAnchor = () => {
    if (!initialAnchorPending || indexForTarget(initialAnchor) !== current) return;
    const page = pages[current];
    measurePage(page);
    readPage(page, columnForSection(page, initialAnchor), false, false);
  };
  if (initialAnchorPending) {
    requestAnimationFrame(settleInitialAnchor);
    const afterLoad = () => requestAnimationFrame(() => requestAnimationFrame(() => {
      settleInitialAnchor();
      initialAnchorPending = false;
    }));
    if (document.readyState === 'complete') afterLoad();
    else window.addEventListener('load', afterLoad, { once: true });
  }
  document.querySelectorAll('object[data-asset]').forEach(object => {
    object.addEventListener('load', () => { bindEmbeddedDocument(object); scheduleRefresh(); });
    bindEmbeddedDocument(object);
  });
  document.addEventListener('deck:layoutchange', event => scheduleRefresh(Boolean(event.detail && event.detail.reset)));
  document.addEventListener('toggle', () => scheduleRefresh(), true);
  window.addEventListener('resize', () => scheduleRefresh());
  new MutationObserver(() => {
    const page = pages[current];
    const anchor = page.sections.length > 1
      ? { page, section: page.activeSection || page.id, offset: page.sectionOffset || 0 }
      : null;
    scheduleRefresh(false, anchor);
  }).observe(root, { attributes: true, attributeFilter: ['lang'] });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => {
    scheduleRefresh();
    if (initialAnchorPending) requestAnimationFrame(settleInitialAnchor);
  });
  window.addEventListener('wheel', handleWheel, { passive: false });
  window.addEventListener('touchstart', event => startTouch(event), { passive: true });
  window.addEventListener('touchend', endTouch, { passive: true });
  window.addEventListener('touchcancel', () => { touch = null; }, { passive: true });
  window.addEventListener('pointerdown', () => { initialAnchorPending = false; }, { once: true, passive: true });

  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const id = link.getAttribute('href').slice(1);
    const index = id === 'main' ? 0 : indexForTarget(id);
    if (index < 0) return;
    event.preventDefault();
    showPage(index, { history: 'push', reset: true, focus: id === 'main', target: id === 'main' ? undefined : id });
  });
  previous.addEventListener('click', () => showPage(current - 1, { history: 'push' }));
  next.addEventListener('click', () => showPage(current + 1, { history: 'push' }));
  readerPrevious.addEventListener('click', () => readPage(pages[current], pages[current].readIndex - 1));
  readerNext.addEventListener('click', () => readPage(pages[current], pages[current].readIndex + 1));
  const restoreHash = () => showPage(indexFromHash(), { history: 'none', reset: true, target: hashTarget() });
  window.addEventListener('popstate', restoreHash);
  window.addEventListener('hashchange', restoreHash);
  window.addEventListener('keydown', event => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    initialAnchorPending = false;
    const target = event.target;
    if (target && target.closest && target.closest('input, textarea, select, [contenteditable="true"]')) return;
    const isControl = target && target.closest && target.closest('button, a, summary');
    let direction = 0;
    if (event.key === 'PageDown' || (event.key === ' ' && !event.shiftKey && !isControl)) direction = 1;
    else if (event.key === 'PageUp' || (event.key === ' ' && event.shiftKey && !isControl)) direction = -1;
    else if ((event.key === 'ArrowDown' || event.key === 'ArrowRight') && !isControl) direction = 1;
    else if ((event.key === 'ArrowUp' || event.key === 'ArrowLeft') && !isControl) direction = -1;
    if (!direction) return;
    event.preventDefault();
    advance(direction);
  });
})();
