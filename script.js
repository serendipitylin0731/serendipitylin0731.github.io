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
    if (key === 'timeline') return `assets/timeline-medals-subtle${english}-${currentTheme()}.svg?v=202611`;
    if (key === 'skills') return `assets/skills-${currentTheme()}.svg`;
    if (key === 'divider' || key === 'endline') return `assets/${key}-${currentTheme()}.svg`;
    return `assets/projects/${key}-visual-${currentTheme()}.svg`;
  }
  function updateAssets() {
    document.querySelectorAll('[data-asset]').forEach(el => {
      const path = assetPath(el.dataset.asset);
      const attribute = el.tagName === 'OBJECT' ? 'data' : 'src';
      if (el.getAttribute(attribute) !== path) el.setAttribute(attribute, path);
    });
    // Prepare images in hidden sections as well, so a page or card switch is ready to paint.
    document.querySelectorAll('img').forEach(image => {
      if (typeof image.decode === 'function') image.decode().catch(() => {});
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
    document.querySelectorAll('.project-carousel').forEach(carousel => {
      const category = en ? carousel.dataset.labelEn : carousel.dataset.labelZh;
      carousel.setAttribute('aria-label', category);
      carousel.querySelector('.project-viewport').setAttribute('aria-label', en ? `${category.replace(' carousel', '')} list` : `${category.replace('轮播', '')}列表`);

    });
    document.querySelector('meta[name="theme-color"]').content = currentTheme() === 'dark' ? '#0b1020' : '#f6f9fc';
    updateAssets();
    const alts = en ? {
      hero: "Hanfeng Lin's profile banner: Less is More, developer tools and routes",
      timeline: 'Education from Wenling Chengdong Primary School to SJTU Zhiyuan College, with competition awards from 2023 to 2026, including AI and education competitions. School names are links.',
      rail: 'Trajectory: illustrated Web and Android railway route planner',
      'cp-tester': 'CP Tester: code editor and three passing test results',
      codex: 'Codex Quota Rings: five-hour and seven-day quota rings and status cards',
      markdown: 'Markdown Preview and Compiler: source editor, preview, and PDF export',
      'shit-code': 'Shit Code Detector: 0–9 code style score and traceable issues',
      '3820': '3820 strategic analysis: indicators and sourced answers',
      ta: 'Zhiye TA Agent: textbook library and answers with page references',
      salary: 'Teacher attendance and salary tool: validated records and payroll export',
      'hello-codex': 'Hello! Codex: five-hour quota, daily active hours, and manual send controls',
      qqspeed: 'QQ Speed Garage: track library, race results and event management',
      guides: 'Beginner computing guides for Markdown, Git, WSL, and more',
      documents: 'Documents: illustrated archive of presentations, posters, and research notes',
      skills: 'Icons for the programming languages and development tools listed below'
    } : {
      hero: '林函锋的个人主页横幅：Less is More，开发工具、软件与铁路路线',
      timeline: '从温岭市城东小学到上海交通大学致远学院的学习经历，以及 2023 至 2026 年数学、物理和 AI 相关竞赛获奖时间轴。学校名称可点击。',
      rail: '轨迹：Web 与 Android 铁路出行规划路线示意',
      'cp-tester': 'CP Tester：代码编辑器与三个通过的测试结果',
      codex: 'Codex Quota Rings：5 小时与 7 天额度圆环和状态卡片',
      markdown: 'Markdown Preview & Compiler：源码编辑、预览与 PDF 导出界面',
      'shit-code': 'Shit Code Detector：0–9 分的代码风格评分与问题列表',
      '3820': '“3820”知识助手：战略指标图表与有来源的问答',
      ta: '知页 TA Agent：教材书库与带页码来源的问答',
      salary: '教师出勤与工资统计程序：考勤校验表与工资导出卡片',
      'hello-codex': 'Hello! Codex：五小时额度、每日启用时段与手动发送界面',
      qqspeed: '极速仓库：QQ 飞车地图图鉴、赛事计分与战绩管理',
      guides: '计算机入门讲义：Markdown、Git 和 WSL',
      documents: 'Documents：演示文档、海报和研究资料的档案界面',
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
  function setupAmbientBackground() {
    const canvas = document.getElementById('ambient-background');
    const context = canvas.getContext('2d');
    if (!context) return () => {};
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let dots = [];
    let width = 0;
    let height = 0;
    let frame = 0;
    let lastFrame = 0;
    const pointer = { active: false, x: 0, y: 0 };
    const influenceRadius = 260;

    function movePointer(x, y) {
      pointer.x = x;
      pointer.y = y;
      pointer.active = true;
    }
    function listenPointer(target, offset = () => ({ left: 0, top: 0 })) {
      target.addEventListener('pointermove', event => {
        if (event.pointerType === 'touch') return;
        const rect = offset();
        movePointer(event.clientX + rect.left, event.clientY + rect.top);
      }, { passive: true });
    }
    function releasePointer() {
      pointer.active = false;
    }
    listenPointer(document);
    document.addEventListener('pointerout', event => {
      if (!event.relatedTarget && (event.clientX <= 0 || event.clientY <= 0 || event.clientX >= width || event.clientY >= height)) releasePointer();
    });
    addEventListener('blur', releasePointer);
    document.querySelectorAll('object[data-asset]').forEach(object => {
      const bind = () => {
        try {
          if (object.contentDocument) listenPointer(object.contentDocument, () => object.getBoundingClientRect());
        } catch (error) { /* Cross-origin objects cannot forward pointer events. */ }
      };
      object.addEventListener('load', bind);
      bind();
    });

    function draw() {
      context.clearRect(0, 0, width, height);
      const light = currentTheme() === 'light';
      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];
        const rgb = dot.kind ? '118,88,185' : (light ? '22,124,116' : '93,228,199');
        if (i < 6) {
          const glow = context.createRadialGradient(dot.x, dot.y, 0, dot.x, dot.y, 90);
          glow.addColorStop(0, `rgba(${rgb},${light ? .09 : .13})`);
          glow.addColorStop(1, `rgba(${rgb},0)`);
          context.fillStyle = glow;
          context.beginPath();
          context.arc(dot.x, dot.y, 90, 0, Math.PI * 2);
          context.fill();
        }
        const alpha = (light ? .45 : .65) * (.78 + .22 * Math.sin(dot.phase));
        context.fillStyle = `rgba(${rgb},${alpha})`;
        context.beginPath();
        context.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
        context.fill();
      }
    }
    function resize() {
      const ratio = Math.min(devicePixelRatio || 1, 2);
      const oldWidth = width;
      const oldHeight = height;
      width = innerWidth;
      height = innerHeight;
      if (dots.length && oldWidth && oldHeight) {
        const scaleX = width / oldWidth;
        const scaleY = height / oldHeight;
        dots.forEach(dot => {
          dot.x *= scaleX; dot.homeX *= scaleX;
          dot.y *= scaleY; dot.homeY *= scaleY;
        });
      }
      const pixelWidth = Math.round(width * ratio);
      const pixelHeight = Math.round(height * ratio);
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
      }
      if (dots.length) { draw(); return; }
      const count = Math.min(72, Math.max(30, Math.round(width * height / 23000)));
      const columns = Math.ceil(Math.sqrt(count * width / height));
      const rows = Math.ceil(count / columns);
      dots = Array.from({ length: count }, (_, i) => {
        const homeX = ((i % columns) + .2 + Math.random() * .6) * width / columns;
        const homeY = (Math.floor(i / columns) + .2 + Math.random() * .6) * height / rows;
        const driftAngle = Math.random() * Math.PI * 2;
        const driftSpeed = .45 + Math.random() * .2;
        return {
          x: homeX, y: homeY, homeX, homeY,
          r: 1.8 + Math.random() * 2.6,
          vx: Math.cos(driftAngle) * driftSpeed,
          vy: Math.sin(driftAngle) * driftSpeed,
          driftAngle, driftSpeed,
          driftTurn: (Math.random() < .5 ? -1 : 1) * (.001 + Math.random() * .0015),
          phase: Math.random() * Math.PI * 2,
          kind: i % 2,
          orbit: 24 + Math.random() * 53,
          angle: Math.random() * Math.PI * 2,
          spin: (Math.random() < .5 ? -1 : 1) * (.0015 + Math.random() * .002)
        };
      });
      draw();
    }
    function animate(now = performance.now()) {
      if (motion.matches || document.hidden) { frame = 0; lastFrame = 0; return; }
      const step = lastFrame ? Math.min((now - lastFrame) / 16.67, 2) : 1;
      lastFrame = now;
      for (const dot of dots) {
        dot.angle += dot.spin * step;
        const distance = pointer.active ? Math.hypot(dot.x - pointer.x, dot.y - pointer.y) : Infinity;
        const influence = Math.max(0, 1 - distance / influenceRadius);
        // Blend attraction with the return to each particle's original region.
        // No impulse is applied when the cursor moves or leaves the screen.
        if (influence > 0) {
          const targetX = pointer.x + Math.cos(dot.angle) * dot.orbit;
          const targetY = pointer.y + Math.sin(dot.angle) * dot.orbit;
          dot.vx += (targetX - dot.x) * .00042 * influence * step;
          dot.vy += (targetY - dot.y) * .00042 * influence * step;
        }
        const homeWeight = 1 - influence;
        dot.driftAngle += dot.driftTurn * step;
        // A gentle current keeps every particle moving even without a pointer.
        dot.vx += ((Math.cos(dot.driftAngle) * dot.driftSpeed - dot.vx) * .05 + (dot.homeX - dot.x) * .000035) * homeWeight * step;
        dot.vy += ((Math.sin(dot.driftAngle) * dot.driftSpeed - dot.vy) * .05 + (dot.homeY - dot.y) * .000035) * homeWeight * step;
        const drag = Math.pow(.976, step);
        dot.vx *= drag;
        dot.vy *= drag;
        const maxSpeed = .65 + influence * .12;
        const speed = Math.hypot(dot.vx, dot.vy);
        if (speed > maxSpeed) {
          dot.vx *= maxSpeed / speed;
          dot.vy *= maxSpeed / speed;
        }
        dot.x = Math.max(0, Math.min(width, dot.x + dot.vx * step));
        dot.y = Math.max(0, Math.min(height, dot.y + dot.vy * step));
        dot.phase += .012 * step;
      }
      draw();
      frame = requestAnimationFrame(animate);
    }
    function restart() {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      lastFrame = 0;
      resize();
      animate();
    }
    addEventListener('resize', resize);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && frame) { cancelAnimationFrame(frame); frame = 0; }
      else if (!document.hidden && !frame) animate();
    });
    motion.addEventListener('change', restart);
    restart();
    return draw;
  }
  function setupProjectCarousel(carousel) {
    const viewport = carousel.querySelector('.project-viewport');
    const cards = [...carousel.querySelector('.project-track').children];
    const bar = carousel.querySelector('.carousel-bar');

    if (cards.length < 2) return;
    carousel.deckControls = { bar };
    carousel.classList.add('carousel-ready', 'carousel-single', 'carousel-cube');
    const stage = document.createElement('div');
    stage.className = 'project-stage';
    viewport.before(stage);
    stage.append(viewport);
    const makePreview = direction => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `project-preview project-preview-${direction}`;
      button.innerHTML = '<img alt="" aria-hidden="true"><span class="project-preview-title"></span>';
      stage.append(button);
      return button;
    };
    const left = makePreview('previous');
    const right = makePreview('next');
    const dots = document.createElement('div');
    dots.className = 'carousel-dots';
    dots.setAttribute('role', 'group');
    carousel.append(dots);
    const dotButtons = cards.map((card, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'carousel-dot';
      button.addEventListener('click', () => { lastAdvance = Date.now(); show(index); });
      dots.append(button);
      return button;
    });
    let current = 0;
    let lastAdvance = Date.now();
    let wasActive = false;
    let touchStart = null;
    let lastWheel = 0;
    function setPreview(button, index, direction) {
      const card = cards[index];
      const title = card.querySelector('h4');
      const visibleTitle = title.querySelector(`[data-lang="${currentLang()}"]`);
      const name = (visibleTitle || title).textContent.trim();
      button.querySelector('img').src = card.querySelector('img').src;
      button.querySelector('.project-preview-title').textContent = name;
      button.setAttribute('aria-label', currentLang() === 'en'
        ? `${direction === 'previous' ? 'Previous project' : 'Next project'}: ${name}`
        : `${direction === 'previous' ? '上一个项目' : '下一个项目'}：${name}`);
    }
    function show(index, notify = true) {
      const direction = index < current ? 'previous' : 'next';
      stage.querySelectorAll('.project-card-snapshot').forEach(element => element.remove());
      const activeCard = cards[current];
      const scroller = carousel.closest('.story-page-scroll');
      if (notify && !matchMedia('(prefers-reduced-motion: reduce)').matches &&
          activeCard.getClientRects().length === 1 && (!scroller || scroller.scrollLeft < 2)) {
        const rect = activeCard.getBoundingClientRect();
        const stageRect = stage.getBoundingClientRect();
        if (rect.width && rect.height) {
          const snapshot = document.createElement('div');
          snapshot.className = 'project-track project-card-snapshot';
          snapshot.dataset.direction = direction;
          snapshot.setAttribute('aria-hidden', 'true');
          snapshot.inert = true;
          snapshot.style.left = `${rect.left - stageRect.left}px`;
          snapshot.style.top = `${rect.top - stageRect.top}px`;
          snapshot.style.width = `${rect.width}px`;
          snapshot.append(activeCard.cloneNode(true));
          stage.append(snapshot);
          snapshot.addEventListener('animationend', () => snapshot.remove(), { once: true });
          window.setTimeout(() => snapshot.remove(), 1200);
        }
      }
      current = (index + cards.length) % cards.length;
      cards.forEach((card, i) => {
        card.hidden = i !== current;
        card.inert = i !== current;
        card.setAttribute('aria-hidden', String(i !== current));
      });
      dots.setAttribute('aria-label', currentLang() === 'en' ? 'Choose a project' : '选择项目');
      dotButtons.forEach((button, i) => {
        const title = cards[i].querySelector('h4');
        const name = (title.querySelector(`[data-lang="${currentLang()}"]`) || title).textContent.trim();
        button.setAttribute('aria-label', currentLang() === 'en' ? `Show project ${i + 1}: ${name}` : `查看第 ${i + 1} 个项目：${name}`);
        if (i === current) button.setAttribute('aria-current', 'true');
        else button.removeAttribute('aria-current');
      });
      setPreview(left, (current + cards.length - 1) % cards.length, 'previous');
      setPreview(right, (current + 1) % cards.length, 'next');
      if (notify) {
        stage.dataset.direction = direction;
        stage.classList.remove('is-turning');
        void stage.offsetWidth;
        stage.classList.add('is-turning');
        document.dispatchEvent(new CustomEvent('deck:layoutchange', { detail: { reset: true } }));
      }
    }
    function change(direction) {
      lastAdvance = Date.now();
      show(current + direction);
    }
    left.addEventListener('click', () => change(-1));
    right.addEventListener('click', () => change(1));
    viewport.addEventListener('keydown', event => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      event.preventDefault();
      change(event.key === 'ArrowRight' ? 1 : -1);
    });
    viewport.addEventListener('touchstart', event => { touchStart = event.changedTouches[0].clientX; }, { passive: true });
    viewport.addEventListener('touchend', event => {
      if (touchStart === null) return;
      const distance = touchStart - event.changedTouches[0].clientX;
      touchStart = null;
      if (Math.abs(distance) < 45) return;
      if (event.cancelable) event.preventDefault();
      change(distance > 0 ? 1 : -1);
    }, { passive: false });
    viewport.addEventListener('wheel', event => {
      if (Math.abs(event.deltaX) < 25 || Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      event.preventDefault();
      if (Date.now() - lastWheel > 650) {
        lastWheel = Date.now();
        change(event.deltaX > 0 ? 1 : -1);
      }
    }, { passive: false });
    new MutationObserver(() => show(current, false)).observe(root, { attributes: true, attributeFilter: ['lang', 'data-theme'] });
    window.setInterval(() => {
      const page = carousel.closest('.story-page');
      const scroller = page && page.querySelector('.story-page-scroll');
      const active = !!page && page.classList.contains('is-active') && !carousel.closest('[hidden]');
      if (!active || document.hidden || matchMedia('(prefers-reduced-motion: reduce)').matches) {
        wasActive = false;
        return;
      }
      if (!wasActive) {
        wasActive = true;
        lastAdvance = Date.now();
        return;
      }
      const focused = document.activeElement;
      const keyboardReading = focused && focused.matches(':focus-visible') &&
        (carousel.contains(focused) || bar.contains(focused));
      if (keyboardReading || (scroller && (scroller.scrollLeft > 2 || scroller.scrollTop > 8)) || Date.now() - lastAdvance < 5000) return;
      lastAdvance = Date.now();
      show(current + 1);
    }, 1000);
    show(0, false);
  }
  function setupProjectViews() {
    const section = document.getElementById('projects');
    const categories = [...section.querySelectorAll(':scope > .project-category')];
    const summary = section.querySelector(':scope > .subheading-row');
    const current = section.querySelector(':scope > .current-projects');
    const resources = section.querySelector(':scope > .documents-section');
    const skills = section.querySelector(':scope > #skills');
    if (categories.length !== 2 || !summary || !current || !resources || !skills) return;

    const views = [
      { id: 'current', zh: '近期项目', en: 'Current', panel: current },
      { id: 'extensions', zh: 'VS Code 插件', en: 'Extensions', panel: categories[0], bar: categories[0].querySelector('.carousel-bar') },
      { id: 'software', zh: '软件', en: 'Software', panel: categories[1], bar: categories[1].querySelector('.carousel-bar') },
      { id: 'resources', zh: '资料分享', en: 'Resources', panel: resources },
      { id: 'skills', zh: '技术与工具', en: 'Tools', panel: skills }
    ];
    const tabs = document.createElement('div');
    tabs.className = 'project-tabs';
    tabs.setAttribute('role', 'tablist');
    section.querySelector(':scope > .section-heading').after(tabs);
    summary.classList.add('project-section-summary');

    let selected = 0;
    const buttons = views.map((view, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'project-tab';
      button.id = `project-tab-${view.id}`;
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-controls', view.id === 'skills' ? 'skills' : `project-view-${view.id}`);
      button.innerHTML = `<span class="project-tab-number" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span><span class="project-tab-label"><span data-lang="zh">${view.zh}</span><span data-lang="en">${view.en}</span></span>`;
      if (view.id !== 'skills') view.panel.id = `project-view-${view.id}`;
      view.panel.classList.add('project-view');
      view.panel.setAttribute('role', 'tabpanel');
      view.panel.setAttribute('aria-labelledby', button.id);
      tabs.append(button);
      return button;
    });
    function activate(index, focus = false) {
      if (index < 0 || index >= views.length) return;
      const changed = index !== selected;
      selected = index;
      views.forEach((view, i) => {
        view.panel.hidden = i !== selected;
        if (view.bar) view.bar.hidden = i !== selected;
        buttons[i].setAttribute('aria-selected', i === selected ? 'true' : 'false');
        buttons[i].tabIndex = i === selected ? 0 : -1;
      });
      summary.hidden = !['extensions', 'software'].includes(views[selected].id);
      if (changed) document.dispatchEvent(new CustomEvent('deck:layoutchange', { detail: { reset: true } }));
      if (focus) buttons[selected].focus({ preventScroll: true });
    }
    buttons.forEach((button, index) => button.addEventListener('click', () => activate(index)));
    tabs.addEventListener('keydown', event => {
      let index = selected;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') index = (selected + 1) % views.length;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') index = (selected + views.length - 1) % views.length;
      else if (event.key === 'Home') index = 0;
      else if (event.key === 'End') index = views.length - 1;
      else return;
      event.preventDefault();
      activate(index, true);
    });
    const labelTabs = () => tabs.setAttribute('aria-label', currentLang() === 'en' ? 'Project categories' : '项目分类');
    new MutationObserver(labelTabs).observe(root, { attributes: true, attributeFilter: ['lang'] });
    labelTabs();
    activate(location.hash === '#skills' ? views.findIndex(view => view.id === 'skills') : 0);
  }
  function setupBeyondViews() {
    const section = document.getElementById('beyond');
    const cards = [section.querySelector('.beyond-card-games'), section.querySelector('.beyond-pair')];
    const labels = [['游戏', 'Games'], ['文艺与运动', 'Arts & sports']];
    if (cards.length !== labels.length || cards.some(card => !card)) return;
    const tabs = document.createElement('div');
    tabs.className = 'beyond-tabs';
    tabs.setAttribute('role', 'tablist');
    section.querySelector(':scope > .beyond-intro').after(tabs);
    let selected = 0;
    const buttons = cards.map((card, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'beyond-tab';
      button.id = `beyond-tab-${index}`;
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-controls', `beyond-view-${index}`);
      button.innerHTML = `<span data-lang="zh">${labels[index][0]}</span><span data-lang="en">${labels[index][1]}</span>`;
      card.id = `beyond-view-${index}`;
      card.setAttribute('role', 'tabpanel');
      card.setAttribute('aria-labelledby', button.id);
      tabs.append(button);
      return button;
    });
    function activate(index, focus = false) {
      const changed = selected !== index;
      selected = index;
      cards.forEach((card, i) => {
        card.hidden = i !== selected;
        buttons[i].setAttribute('aria-selected', String(i === selected));
        buttons[i].tabIndex = i === selected ? 0 : -1;
      });
      if (changed) document.dispatchEvent(new CustomEvent('deck:layoutchange', { detail: { reset: true } }));
      if (focus) buttons[selected].focus({ preventScroll: true });
    }
    buttons.forEach((button, index) => button.addEventListener('click', () => activate(index)));
    tabs.addEventListener('keydown', event => {
      let index = selected;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') index = (selected + 1) % cards.length;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') index = (selected + cards.length - 1) % cards.length;
      else if (event.key === 'Home') index = 0;
      else if (event.key === 'End') index = cards.length - 1;
      else return;
      event.preventDefault();
      activate(index, true);
    });
    const labelTabs = () => tabs.setAttribute('aria-label', currentLang() === 'en' ? 'Interests' : '兴趣分类');
    new MutationObserver(labelTabs).observe(root, { attributes: true, attributeFilter: ['lang'] });
    labelTabs();
    activate(0);
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
    updateMeta(); redrawAmbient();
  });
  const mobileTheme = matchMedia('(max-width: 680px), (hover: none) and (pointer: coarse)');
  const systemLight = matchMedia('(prefers-color-scheme: light)');
  function syncAutomaticTheme() {
    let saved = null;
    if (!mobileTheme.matches) { try { saved = localStorage.getItem('theme'); } catch (e) {} }
    const theme = saved || (systemLight.matches ? 'light' : 'dark');
    if (root.dataset.theme !== theme) { root.dataset.theme = theme; updateMeta(); redrawAmbient(); }
  }
  mobileTheme.addEventListener('change', syncAutomaticTheme);
  systemLight.addEventListener('change', () => { if (mobileTheme.matches) syncAutomaticTheme(); });
  document.getElementById('year').textContent = new Date().getFullYear();
  const redrawAmbient = setupAmbientBackground();
  updateMeta(); restartTyping(); document.querySelectorAll('.project-carousel').forEach(setupProjectCarousel); setupProjectViews(); setupBeyondViews();
})();
