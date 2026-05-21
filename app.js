(function () {
  const navSearch = document.getElementById('navSearch');
  const navItems = Array.from(document.querySelectorAll('[data-nav-item]'));
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const sectionMap = new Map(
    navItems
      .map((item) => {
        const target = item.getAttribute('href');
        const section = target ? document.querySelector(target) : null;
        return section ? [section.id, item] : null;
      })
      .filter(Boolean),
  );

  if (navSearch) {
    navSearch.addEventListener('input', () => {
      const query = navSearch.value.trim().toLowerCase();
      for (const item of navItems) {
        const label = item.textContent.trim().toLowerCase();
        item.classList.toggle('is-hidden', query !== '' && !label.includes(query));
      }
    });
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      const isOpen = document.body.classList.toggle('menu-open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  for (const item of navItems) {
    item.addEventListener('click', () => {
      document.body.classList.remove('menu-open');
      menuToggle?.setAttribute('aria-expanded', 'false');
    });
  }

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;

      for (const item of navItems) {
        item.classList.remove('is-active');
      }

      sectionMap.get(visible.target.id)?.classList.add('is-active');
    },
    {
      rootMargin: '-20% 0px -55% 0px',
      threshold: [0.15, 0.4, 0.75],
    },
  );

  for (const [sectionId] of sectionMap) {
    const section = document.getElementById(sectionId);
    if (section) observer.observe(section);
  }

  const copyButtons = document.querySelectorAll('[data-copy-target]');
  for (const button of copyButtons) {
    button.addEventListener('click', async () => {
      const targetId = button.getAttribute('data-copy-target');
      const source = targetId ? document.getElementById(targetId) : null;
      const text = source?.innerText ?? '';
      if (!text) return;

      const original = button.textContent;
      try {
        await navigator.clipboard.writeText(text);
        button.textContent = 'Copied';
      } catch {
        button.textContent = 'Failed';
      }

      window.setTimeout(() => {
        button.textContent = original;
      }, 1200);
    });
  }
})();
