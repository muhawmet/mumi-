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
      select.parentNode.insertBefore(container, select.nextSibling);
    }
    const render = () => {
      container.innerHTML = '';
      Array.from(select.options).forEach((opt) => {
        if (!opt.value) return;
        const btn = document.createElement('button');
        btn.className = 'menu-btn' + (select.value === opt.value ? ' active' : '');
        btn.innerText = opt.text;
        btn.onclick = (e) => {
          e.preventDefault();
          select.value = opt.value;
          select.dispatchEvent(new Event('change'));
          Array.from(container.children).forEach((c) => c.classList.remove('active'));
          btn.classList.add('active');
        };
        container.appendChild(btn);
      });
    };
    render();
    select.addEventListener('change', () => {
      Array.from(container.children).forEach((btn, idx) => {
        const opt = select.options[idx];
        btn.classList.toggle('active', !!opt && select.value === opt.value);
      });
    });
    new MutationObserver(render).observe(select, { childList: true });
  }

  function bindMobileNav() {
    const toggle = $('mobile-nav-toggle');
    const sidebar = $('studio-sidebar');
    if (!toggle || !sidebar) return;
    toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
    document.addEventListener('click', (e) => {
      if (window.innerWidth > 900) return;
      if (!sidebar.classList.contains('open')) return;
      if (sidebar.contains(e.target) || toggle.contains(e.target)) return;
      sidebar.classList.remove('open');
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    bindEmptyStateToggle();
    ['cascade-world', 'cascade-prop', 'cascade-reference', 'cascade-palette', 'cascade-music']
      .forEach(convertSelectToButtons);
    bindMobileNav();
  });
})();
