(function () {
  const $ = (id) => document.getElementById(id);

  function bindEmptyStateToggle() {
    const title = $('detail-title');
    const empty = $('detail-empty-state');
    const wrapper = document.querySelector('.preview-content-wrapper');
    if (!title || !empty || !wrapper) return;
    const sync = () => {
      const filled = title.innerText.trim().length > 0;
      empty.style.display = filled ? 'none' : 'flex';
      wrapper.style.display = filled ? 'flex' : 'none';
    };
    new MutationObserver(sync).observe(title, { childList: true, characterData: true, subtree: true });
    sync();
  }

  function convertSelectToButtons(selectId) {
    const select = $(selectId);
    if (!select) return;
    select.style.display = 'none';
    let container = select.nextElementSibling;
    if (!container || !container.classList.contains('custom-select-menu')) {
      container = document.createElement('div');
      container.className = 'custom-select-menu';
      container.setAttribute('role', 'radiogroup');
      if (select.getAttribute('aria-label')) container.setAttribute('aria-label', select.getAttribute('aria-label'));
      select.parentNode.insertBefore(container, select.nextSibling);
    }
    const render = () => {
      container.innerHTML = '';
      Array.from(select.options).forEach((opt) => {
        if (!opt.value) return;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.setAttribute('role', 'radio');
        const active = select.value === opt.value;
        btn.className = 'menu-btn' + (active ? ' active' : '');
        btn.setAttribute('aria-checked', String(active));
        btn.tabIndex = active ? 0 : -1;
        btn.textContent = opt.text;
        btn.dataset.value = opt.value;
        btn.onclick = (e) => {
          e.preventDefault();
          select.value = opt.value;
          select.dispatchEvent(new Event('change'));
        };
        btn.onkeydown = (e) => {
          if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
          e.preventDefault();
          const list = Array.from(container.querySelectorAll('.menu-btn'));
          const idx = list.indexOf(btn);
          let next = idx;
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (idx + 1) % list.length;
          if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (idx - 1 + list.length) % list.length;
          if (e.key === 'Home') next = 0;
          if (e.key === 'End') next = list.length - 1;
          const nextBtn = list[next];
          if (nextBtn) {
            select.value = nextBtn.dataset.value;
            select.dispatchEvent(new Event('change'));
            nextBtn.focus();
          }
        };
        container.appendChild(btn);
      });
    };
    render();
    select.addEventListener('change', render);
    new MutationObserver(render).observe(select, { childList: true });
  }

  async function populateModelTargets() {
    try {
      const res = await fetch('/model-registry.json');
      if (!res.ok) return;
      const reg = await res.json();
      const fill = (id, bucket) => {
        const sel = $(id);
        if (!sel || !reg[bucket]) return;
        const previous = sel.value;
        sel.innerHTML = '';
        Object.entries(reg[bucket]).forEach(([provider, labels]) => {
          const og = document.createElement('optgroup');
          og.label = provider;
          labels.forEach((label) => {
            const opt = document.createElement('option');
            opt.value = label;
            opt.textContent = label;
            opt.dataset.provider = provider;
            og.appendChild(opt);
          });
          sel.appendChild(og);
        });
        if (previous && Array.from(sel.options).some((o) => o.value === previous)) sel.value = previous;
      };
      fill('image-model', 'image');
      fill('video-model', 'video');
    } catch (e) {
      console.warn('model-registry.json yüklenemedi:', e);
    }
  }

  function populateWorldsFromBrain() {
    const select = $('cascade-world');
    if (!select || typeof BRAIN === 'undefined' || !Array.isArray(BRAIN.worlds)) return;
    const previous = select.value;
    select.innerHTML = '';
    BRAIN.worlds
      .slice()
      .sort((a, b) => (a.category || '').localeCompare(b.category || '') ||
                      (a.name || a.id).localeCompare(b.name || b.id))
      .forEach((w) => {
        const opt = document.createElement('option');
        opt.value = w.id;
        opt.textContent = (w.emoji ? w.emoji + ' ' : '') + (w.name || w.id);
        if (w.category) opt.dataset.category = w.category;
        select.appendChild(opt);
      });
    if (previous && Array.from(select.options).some((o) => o.value === previous)) {
      select.value = previous;
    }
  }

  function bindMobileNav() {
    const toggle = $('mobile-nav-toggle');
    const sidebar = $('studio-sidebar');
    if (!toggle || !sidebar) return;
    toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        toggle.focus();
      }
    });
    document.addEventListener('click', (e) => {
      if (window.innerWidth > 900) return;
      if (!sidebar.classList.contains('open')) return;
      if (sidebar.contains(e.target) || toggle.contains(e.target)) return;
      sidebar.classList.remove('open');
    });
  }

  function bindBrainModal() {
    const open = $('btn-brain');
    const modal = $('brain-modal');
    const close = $('btn-brain-close');
    const sectionsList = $('brain-sections');
    const content = $('brain-content');
    if (!open || !modal || !close || !sectionsList || !content) return;
    let opener = null;
    const setActive = (btn) => {
      Array.from(sectionsList.children).forEach((c) => c.classList.remove('active'));
      if (btn) btn.classList.add('active');
    };
    const loadSection = async (name, btn) => {
      content.textContent = 'Yükleniyor…';
      setActive(btn);
      try {
        const res = await fetch('/api/brain/' + encodeURIComponent(name));
        if (!res.ok) { content.textContent = 'Bu bölüm okunamadı (' + res.status + ').'; return; }
        content.textContent = await res.text();
      } catch (e) {
        content.textContent = 'Ağ hatası: ' + (e && e.message);
      }
    };
    const populate = async () => {
      sectionsList.innerHTML = '';
      try {
        const res = await fetch('/api/brain');
        if (!res.ok) return;
        const data = await res.json();
        (data.sections || []).forEach((s, i) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'brain-section-btn';
          btn.textContent = s.name.replace(/\.md$/, '');
          btn.onclick = () => loadSection(s.name, btn);
          sectionsList.appendChild(btn);
          if (i === 0) loadSection(s.name, btn);
        });
      } catch (e) {
        sectionsList.innerHTML = '<div class="brain-section-btn">Brain endpoint yok</div>';
      }
    };
    open.addEventListener('click', () => {
      opener = open;
      modal.hidden = false;
      populate();
    });
    const dismiss = () => {
      modal.hidden = true;
      if (opener) opener.focus();
    };
    close.addEventListener('click', dismiss);
    modal.addEventListener('click', (e) => { if (e.target === modal) dismiss(); });
    document.addEventListener('keydown', (e) => { if (!modal.hidden && e.key === 'Escape') dismiss(); });
  }

  function bindBodyScrollLock() {
    const sidebar = $('studio-sidebar');
    if (!sidebar) return;
    const sync = () => {
      const locked = sidebar.classList.contains('open') && window.innerWidth <= 900;
      document.body.classList.toggle('scroll-locked', locked);
    };
    new MutationObserver(sync).observe(sidebar, { attributes: true, attributeFilter: ['class'] });
    window.addEventListener('resize', sync);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const init = () => {
      populateWorldsFromBrain();
      populateModelTargets();
      bindEmptyStateToggle();
      ['cascade-world', 'cascade-prop', 'cascade-reference', 'cascade-palette', 'cascade-music']
        .forEach(convertSelectToButtons);
      bindMobileNav();
      bindBodyScrollLock();
      bindBrainModal();
    };
    if (typeof BRAIN !== 'undefined' && BRAIN.worlds && BRAIN.worlds.length > 0) {
      init();
    } else if (window.loadWorlds) {
      window.loadWorlds().then(init);
    } else {
      init();
    }
  });
})();
