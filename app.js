(function () {
  const navSearch = document.getElementById('navSearch');
  const navItems = Array.from(document.querySelectorAll('[data-nav-item]'));
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const tabTriggers = Array.from(document.querySelectorAll('[data-doc-tab-trigger]'));
  const tabContents = Array.from(document.querySelectorAll('[data-doc-tab-content]'));
  const tabSections = Array.from(document.querySelectorAll('.docs-section[data-doc-tab]'));
  const railPanels = Array.from(document.querySelectorAll('.docs-rail__panel[data-doc-tab]'));
  const sectionMap = new Map(
    navItems
      .map((item) => {
        const target = item.getAttribute('href');
        const section = target ? document.querySelector(target) : null;
        return section ? [section.id, item] : null;
      })
      .filter(Boolean),
  );

  let activeTab = 'sso';
  let activeSectionId = null;

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting && entry.target.dataset.docTab === activeTab)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;

      activeSectionId = visible.target.id;
      syncActiveNav();
    },
    {
      rootMargin: '-20% 0px -55% 0px',
      threshold: [0.15, 0.4, 0.75],
    },
  );

  function sectionForItem(item) {
    const target = item.getAttribute('href');
    return target ? document.querySelector(target) : null;
  }

  function firstNavItemForTab(tab) {
    return navItems.find((item) => item.dataset.docTab === tab) ?? null;
  }

  function syncActiveNav() {
    for (const item of navItems) {
      const section = sectionForItem(item);
      const isCurrent = item.dataset.docTab === activeTab && section && section.id === activeSectionId;
      item.classList.toggle('is-active', Boolean(isCurrent));
    }
  }

  function applySearchFilter() {
    const query = navSearch?.value.trim().toLowerCase() ?? '';

    for (const item of navItems) {
      const label = item.textContent.trim().toLowerCase();
      const matchesTab = item.dataset.docTab === activeTab;
      const matchesQuery = query === '' || label.includes(query);
      item.classList.toggle('docs-tab-hidden', !matchesTab || !matchesQuery);
    }
  }

  function updateTabVisibility() {
    for (const pane of tabContents) {
      pane.classList.toggle('docs-tab-hidden', pane.dataset.docTabContent !== activeTab);
    }

    for (const section of tabSections) {
      section.classList.toggle('docs-tab-hidden', section.dataset.docTab !== activeTab);
    }

    for (const panel of railPanels) {
      panel.classList.toggle('docs-tab-hidden', panel.dataset.docTab !== activeTab);
    }

    for (const trigger of tabTriggers) {
      const isActive = trigger.dataset.docTabTrigger === activeTab;
      trigger.classList.toggle('is-active', isActive);
      trigger.setAttribute('aria-selected', String(isActive));
      trigger.setAttribute('tabindex', isActive ? '0' : '-1');
    }

    document.body.dataset.docsTab = activeTab;
    applySearchFilter();
    syncActiveNav();
  }

  function setActiveTab(tab, { scrollToFirstSection = false } = {}) {
    if (!tab || tab === activeTab) {
      updateTabVisibility();
      return;
    }

    activeTab = tab;
    const firstItem = firstNavItemForTab(activeTab);
    const firstSection = firstItem ? sectionForItem(firstItem) : null;

    if (!activeSectionId || document.getElementById(activeSectionId)?.dataset.docTab !== activeTab) {
      activeSectionId = firstSection?.id ?? null;
    }

    updateTabVisibility();

    if (scrollToFirstSection && firstSection) {
      firstSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (history.replaceState) {
        history.replaceState(null, '', `#${firstSection.id}`);
      }
    }
  }

  if (navSearch) {
    navSearch.addEventListener('input', applySearchFilter);
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      const isOpen = document.body.classList.toggle('menu-open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  for (const trigger of tabTriggers) {
    trigger.addEventListener('click', () => {
      const tab = trigger.dataset.docTabTrigger;
      setActiveTab(tab, { scrollToFirstSection: true });
    });
  }

  for (const item of navItems) {
    item.addEventListener('click', () => {
      const targetTab = item.dataset.docTab;
      const section = sectionForItem(item);
      if (targetTab) activeTab = targetTab;
      if (section) activeSectionId = section.id;
      updateTabVisibility();
      document.body.classList.remove('menu-open');
      menuToggle?.setAttribute('aria-expanded', 'false');
    });
  }

  for (const [sectionId] of sectionMap) {
    const section = document.getElementById(sectionId);
    if (section) observer.observe(section);
  }

  window.addEventListener('hashchange', () => {
    const hash = window.location.hash;
    if (!hash) return;

    const section = document.querySelector(hash);
    if (!section || !section.dataset.docTab) return;

    activeTab = section.dataset.docTab;
    activeSectionId = section.id;
    updateTabVisibility();
  });

  const hashTarget = window.location.hash ? document.querySelector(window.location.hash) : null;
  if (hashTarget?.dataset.docTab) {
    activeTab = hashTarget.dataset.docTab;
    activeSectionId = hashTarget.id;
  } else {
    const firstItem = firstNavItemForTab(activeTab);
    activeSectionId = sectionForItem(firstItem)?.id ?? null;
  }

  updateTabVisibility();

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
