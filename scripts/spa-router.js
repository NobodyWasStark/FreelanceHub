/**
 * SkillBridge Client-Side SPA Router
 *
 * Intercepts clicks on sidebar navigation anchors and performs a fetch-based
 * content swap instead of a full browser reload. The sidebar (and its loaded
 * scripts: api.js, nav-badges.js) is never re-initialized — only the <main>
 * content region and the page <title> are replaced.
 *
 * The active nav link highlight is also updated automatically.
 *
 * Rules / assumptions:
 *  - Navigation links are <a> elements inside #sidebar whose href points to a
 *    same-origin skillbridge-*.html page.
 *  - Each page has exactly one <main> element that wraps the page-specific
 *    content that should be swapped.
 *  - Each destination page may load a page-specific script (e.g. proposal.js,
 *    report.js). These are discovered from the fetched HTML and executed once
 *    per navigation.
 *  - Pages that need their own init logic export a global function named
 *    window.__pageInit() which the router calls after injecting the HTML.
 *
 * Limitations:
 *  - Does NOT work for the Messages page (uses WebSockets / complex init).
 *    Full reload is preserved for that page.
 *  - Does NOT affect logout or external links.
 */
(function () {
  'use strict';

  // Pages that require a full reload (complex setup / WebSocket / etc.)
  const FULL_RELOAD_PAGES = ['skillbridge-message.html'];

  // Map from page filename → dedicated script to load
  const PAGE_SCRIPTS = {
    'skillbridge-dashboard.html':  null,        // inline script in the page
    'skillbridge-post-job.html':   '/scripts/post-job.js',
    'skillbridge-proposal.html':   '/scripts/proposal.js',
    'skillbridge-reports.html':    '/scripts/report.js',
    'skillbridge-settings.html':   '/scripts/settings.js',
    'skillbridge-profile.html':    '/scripts/profile.js',
    'skillbridge-post.html':       null,
  };

  // Scripts already loaded in this session (avoid double-loading)
  const loadedScripts = new Set();

  /** Return just the filename portion of a URL/path */
  function filename(url) {
    return url.split('/').pop().split('?')[0];
  }

  /** Highlight the correct sidebar link for the current path */
  function updateActiveLink(href) {
    const target = filename(href);
    document.querySelectorAll('#sidebar nav a').forEach(link => {
      const lf = filename(link.getAttribute('href') || '');
      const isActive = lf === target;
      // Remove all active styling first
      link.classList.remove(
        'bg-green-50', 'text-green-700', 'shadow-sm',
        'hover:text-green-700', 'hover:bg-green-50',
        'text-gray-500', 'text-slate-500'
      );
      if (isActive) {
        link.classList.add('bg-green-50', 'text-green-700', 'shadow-sm');
      } else {
        link.classList.add('text-gray-500');
      }
    });
  }

  /** Load a script once, resolve when ready */
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (loadedScripts.has(src)) { resolve(); return; }
      const s = document.createElement('script');
      s.src = src;
      s.onload  = () => { loadedScripts.add(src); resolve(); };
      s.onerror = reject;
      document.body.appendChild(s);
    });
  }

  /** Execute inline <script> tags found inside a freshly-injected DOM node */
  function runInlineScripts(container) {
    container.querySelectorAll('script').forEach(oldScript => {
      const newScript = document.createElement('script');
      if (oldScript.src) {
        // External — handled separately via loadScript()
        return;
      }
      newScript.textContent = oldScript.textContent;
      document.body.appendChild(newScript);
      oldScript.remove();
    });
  }

  /** Main navigation handler */
  async function navigate(href) {
    const file = filename(href);

    // Full-reload pages bypass the router
    if (FULL_RELOAD_PAGES.includes(file)) {
      window.location.href = href;
      return;
    }

    // Push the new URL into browser history
    if (window.location.pathname !== new URL(href, window.location.origin).pathname) {
      history.pushState({ href }, '', href);
    }

    updateActiveLink(href);

    // Show a lightweight progress indicator on the main area
    const mainEl = document.querySelector('main');
    if (mainEl) {
      mainEl.style.opacity = '0.4';
      mainEl.style.transition = 'opacity 0.15s';
    }

    try {
      const response = await fetch(href, { credentials: 'same-origin' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const html = response.text ? await response.text() : '';

      // Parse the fetched page
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Swap <title>
      document.title = doc.title;

      // Swap <main>
      const newMain = doc.querySelector('main');
      const currentMain = document.querySelector('main');
      if (newMain && currentMain) {
        currentMain.replaceWith(newMain);
      }

      // Restore opacity & trigger fade-in
      const replacedMain = document.querySelector('main');
      if (replacedMain) {
        replacedMain.style.opacity = '0';
        replacedMain.style.transition = 'none';
        // Run inline scripts inside the new main (e.g. skeleton CSS)
        runInlineScripts(replacedMain);
        // Fade in
        requestAnimationFrame(() => {
          replacedMain.style.transition = 'opacity 0.25s ease';
          replacedMain.style.opacity = '1';
        });
      }

      // Load the page-specific external script (once per session)
      const scriptSrc = PAGE_SCRIPTS[file];
      if (scriptSrc) {
        // Wipe the old module's globals so it re-initialises cleanly
        window.__pageInit = null;
        await loadScript(scriptSrc);
      }

      // Dashboard uses an inline async IIFE for its data — we need to re-run
      // the inline scripts that were in the outer <body> (not inside <main>)
      const bodyScripts = doc.querySelectorAll('body > script:not([src])');
      bodyScripts.forEach(s => {
        if (s.textContent.includes('requireAuth') || s.textContent.includes('dashboard')) {
          const clone = document.createElement('script');
          clone.textContent = s.textContent;
          document.body.appendChild(clone);
        }
      });

      // Call optional page init hook
      if (typeof window.__pageInit === 'function') {
        window.__pageInit();
      }

    } catch (err) {
      // On any error fall back to a real navigation
      console.warn('[spa-router] fetch failed, falling back to reload:', err);
      window.location.href = href;
    }
  }

  /** Attach click handlers to all sidebar nav links */
  function attachHandlers() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    sidebar.addEventListener('click', function (e) {
      const link = e.target.closest('a[href]');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href || href === '#' || href.startsWith('http')) return;

      // Ignore logout and help links
      if (link.hasAttribute('onclick')) return;

      e.preventDefault();
      navigate(href);
    });
  }

  /** Handle browser back/forward */
  window.addEventListener('popstate', function (e) {
    const href = (e.state && e.state.href) || window.location.href;
    navigate(href);
  });

  // Boot: mark current page in history state and attach handlers
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      history.replaceState({ href: window.location.href }, '');
      attachHandlers();
      updateActiveLink(window.location.pathname);
    });
  } else {
    history.replaceState({ href: window.location.href }, '');
    attachHandlers();
    updateActiveLink(window.location.pathname);
  }
}());
