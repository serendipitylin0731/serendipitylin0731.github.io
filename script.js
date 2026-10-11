(() => {
  const root = document.documentElement;
  const langButton = document.getElementById('lang-toggle');
  const themeButton = document.getElementById('theme-toggle');
  const typed = document.getElementById('typed-text');
  const copy = [
    'Student @ SJTU Zhiyuan College',
    'Building plugins and useful software',
    'Explore → Build → Share'
  ];
  let typingTimer;
  let lineIndex = 0;
  let charIndex = 0;
  let deleting = false;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function currentLang() { return root.lang === 'en' ? 'en' : 'zh'; }
  function currentTheme() { return root.dataset.theme === 'light' ? 'light' : 'dark'; }
  function assetPath(key) {
    const english = currentLang() === 'en' ? '-en' : '';
    const light = currentTheme() === 'light' ? '-light' : '';
    if (key === 'hero') return `assets/hero${english}${light}.svg`;
    if (key === 'timeline') return `assets/timeline-medals-subtle${english}-${currentTheme()}.svg`;
    if (key === 'skills') return `assets/skills-${currentTheme()}.svg`;
    if (key === 'divider' || key === 'endline') return `assets/${key}-${currentTheme()}.svg`;
    return `assets/projects/${key}-visual-${currentTheme()}.svg`;
  }
  function updateAssets() {
    document.querySelectorAll('[data-asset]').forEach(el => {
      const path = assetPath(el.dataset.asset);
      if (el.tagName === 'OBJECT') el.data = path;
      else el.src = path;
    });
  }
  function updateMeta() {
    const en = currentLang() === 'en';
    document.title = en ? 'Hanfeng Lin · Personal homepage' : '林函锋 · 个人主页';
    document.querySelector('meta[name="description"]').content = en
      ? 'Hanfeng Lin · Computer Science student at SJTU Zhiyuan College. Software projects, teaching tools, education, and interests.'
      : '林函锋 Hanfeng Lin · 上海交通大学致远学院 JOHN 班学生。分享软件开发、铁路出行规划、教学工具与学习经历。';
    langButton.textContent = en ? '中' : 'EN';
    langButton.setAttribute('aria-label', en ? '切换到简体中文' : 'Switch to English');
    themeButton.querySelector('.theme-icon').textContent = currentTheme() === 'dark' ? '☀' : '☾';
    themeButton.setAttribute('aria-label', currentTheme() === 'dark' ? (en ? 'Switch to light theme' : '切换到浅色主题') : (en ? 'Switch to dark theme' : '切换到深色主题'));
    document.getElementById('project-carousel').setAttribute('aria-label', en ? 'Completed projects carousel' : '已结项项目轮播');
    document.getElementById('project-viewport').setAttribute('aria-label', en ? 'Completed projects list' : '已结项项目列表');
    document.getElementById('project-prev').setAttribute('aria-label', en ? 'Previous project' : '上一个项目');
    document.getElementById('project-next').setAttribute('aria-label', en ? 'Next project' : '下一个项目');
    document.querySelector('meta[name="theme-color"]').content = currentTheme() === 'dark' ? '#0b1020' : '#f6f9fc';
    updateAssets();
    const alts = en ? {
      hero: "Hanfeng Lin's profile banner: Less is More, developer tools and routes",
      timeline: 'Education from Wenling Chengdong Primary School to SJTU Zhiyuan College, with mathematics and physics competition awards from 2023 to 2025. School names are links.',
      rail: 'Trajectory: illustrated Android railway route planner',
      'cp-tester': 'CP Tester: code editor and three passing test results',
      guides: 'Beginner computing guides for Markdown, Git, WSL, and more',
      skills: 'Icons for the programming languages and development tools listed below'
    } : {
      hero: '林函锋的个人主页横幅：Less is More，开发工具、软件与铁路路线',
      timeline: '从温岭市城东小学到上海交通大学致远学院的学习经历，以及 2023 至 2025 年的数学和物理竞赛获奖时间轴。学校名称可点击。',
      rail: '轨迹：Android 铁路出行规划路线示意',
      'cp-tester': 'CP Tester：代码编辑器与三个通过的测试结果',
      guides: '计算机入门讲义：Markdown、Git 和 WSL',
      skills: '下方所列编程语言和开发工具的图标'
    };
    document.querySelectorAll('[data-asset]').forEach(el => {
      const label = alts[el.dataset.asset];
      if (!label) return;
      if (el.tagName === 'OBJECT') el.setAttribute('aria-label', label);
      else el.alt = label;
    });
  }
  function typeNext() {
    const lines = copy;
    const line = lines[lineIndex];
    if (reducedMotion) { typed.textContent = lines[0]; return; }
    if (!deleting) {
      charIndex++;
      typed.textContent = line.slice(0, charIndex);
      if (charIndex >= line.length) { deleting = true; typingTimer = setTimeout(typeNext, 1750); return; }
      typingTimer = setTimeout(typeNext, 65);
    } else {
      charIndex--;
      typed.textContent = line.slice(0, charIndex);
      if (charIndex <= 0) { deleting = false; lineIndex = (lineIndex + 1) % lines.length; typingTimer = setTimeout(typeNext, 320); return; }
      typingTimer = setTimeout(typeNext, 32);
    }
  }
  function restartTyping() {
    clearTimeout(typingTimer);
    lineIndex = 0; charIndex = 0; deleting = false; typed.textContent = '';
    typeNext();
  }
  function setupProjectCarousel() {
    const carousel = document.getElementById('project-carousel');
    const viewport = document.getElementById('project-viewport');
    const track = document.getElementById('project-track');
    const position = document.getElementById('carousel-position');
    const total = track.children.length;
    if (total < 2) return;
    let moving = false;
    let direction = 0;
    let touchStartX = null;
    let keyboardFocus = false;
    let lastInputWasKeyboard = false;
    let lastManualMove = 0;

    function visibleCount() {
      return Number.parseInt(getComputedStyle(carousel).getPropertyValue('--visible-cards'), 10) || 3;
    }
    function stepWidth() {
      return track.firstElementChild.getBoundingClientRect().width +
        Number.parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap);
    }
    function updateVisible() {
      const visible = visibleCount();
      [...track.children].forEach((card, index) => {
        card.inert = index >= visible;
        card.setAttribute('aria-hidden', index >= visible ? 'true' : 'false');
      });
      position.textContent = `${String(track.firstElementChild.dataset.projectIndex).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
    }
    function finishMove() {
      if (direction > 0) track.append(track.firstElementChild);
      track.style.transition = 'none';
      track.style.transform = 'translateX(0)';
      void track.offsetWidth;
      track.style.transition = '';
      moving = false;
      direction = 0;
      updateVisible();
    }
    track.addEventListener('transitionend', event => {
      if (event.target === track && event.propertyName === 'transform' && moving) finishMove();
    });
    function move(next) {
      if (moving) return;
      if (reducedMotion) {
        if (next) track.append(track.firstElementChild);
        else track.prepend(track.lastElementChild);
        updateVisible();
        return;
      }
      moving = true;
      direction = next ? 1 : -1;
      const distance = stepWidth();
      if (next) {
        track.style.transition = 'transform .55s ease';
        track.style.transform = `translateX(-${distance}px)`;
      } else {
        track.prepend(track.lastElementChild);
        track.style.transition = 'none';
        track.style.transform = `translateX(-${distance}px)`;
        void track.offsetWidth;
        track.style.transition = 'transform .55s ease';
        track.style.transform = 'translateX(0)';
      }
    }
    function manualMove(next) {
      lastManualMove = Date.now();
      move(next);
    }
    document.getElementById('project-prev').addEventListener('click', () => manualMove(false));
    document.getElementById('project-next').addEventListener('click', () => manualMove(true));
    document.addEventListener('keydown', event => {
      if (event.key === 'Tab') lastInputWasKeyboard = true;
    });
    document.addEventListener('pointerdown', () => { lastInputWasKeyboard = false; keyboardFocus = false; });
    carousel.addEventListener('focusin', () => { keyboardFocus = lastInputWasKeyboard; });
    carousel.addEventListener('focusout', event => {
      if (!carousel.contains(event.relatedTarget)) keyboardFocus = false;
    });
    carousel.addEventListener('keydown', () => { keyboardFocus = true; });
    viewport.addEventListener('keydown', event => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        manualMove(event.key === 'ArrowRight');
      }
    });
    viewport.addEventListener('touchstart', event => {
      touchStartX = event.changedTouches[0].clientX;
    }, { passive: true });
    viewport.addEventListener('touchend', event => {
      if (touchStartX === null) return;
      const distance = touchStartX - event.changedTouches[0].clientX;
      touchStartX = null;
      if (Math.abs(distance) < 45) return;
      if (event.cancelable) event.preventDefault();
      manualMove(distance > 0);
    }, { passive: false });
    viewport.addEventListener('wheel', event => {
      if (Math.abs(event.deltaX) < 25 || Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      event.preventDefault();
      if (!moving && Date.now() - lastManualMove > 650) manualMove(event.deltaX > 0);
    }, { passive: false });
    carousel.classList.add('carousel-ready');
    updateVisible();
    window.addEventListener('resize', updateVisible);
    if (!reducedMotion) {
      setInterval(() => {
        if (!moving && !document.hidden && !carousel.matches(':hover') && !keyboardFocus && Date.now() - lastManualMove >= 4200) move(true);
      }, 4200);
    }
  }
  langButton.addEventListener('click', () => {
    root.lang = currentLang() === 'en' ? 'zh-CN' : 'en';
    try { localStorage.setItem('lang', currentLang()); } catch (e) {}
    const url = new URL(location.href);
    if (currentLang() === 'en') url.searchParams.set('lang', 'en'); else url.searchParams.delete('lang');
    history.replaceState(null, '', url);
    updateMeta(); restartTyping();
  });
  themeButton.addEventListener('click', () => {
    root.dataset.theme = currentTheme() === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('theme', currentTheme()); } catch (e) {}
    updateMeta();
  });
  document.getElementById('year').textContent = new Date().getFullYear();
  updateMeta(); restartTyping(); setupProjectCarousel();
})();
