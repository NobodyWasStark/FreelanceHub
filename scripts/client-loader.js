/**
 * SkillBridge Client Loader
 * Injected synchronously as the FIRST script in every skillbridge-*.html page.
 * Renders instantly before Tailwind CDN, fonts, or any API calls complete.
 * Call window.hideClientLoader() from page JS once data is ready.
 * Safety: auto-dismisses after MAX_WAIT_MS so a hung API never blocks the page.
 */
(function () {
  var MAX_WAIT_MS = 1500; // 1.5s cap — all pages call hideClientLoader() explicitly.
                           // This is only a safety net for unexpected hangs.

  var style = document.createElement('style');
  style.textContent = `
    #sb-client-loader {
      position: fixed;
      inset: 0;
      z-index: 99999;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 28px;
      background: #f8faf8;
      transition: opacity 0.35s ease, visibility 0.35s ease;
    }
    #sb-client-loader.hidden {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
    }
    .sb-cl__brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .sb-cl__icon {
      width: 44px;
      height: 44px;
      background: #15803d;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .sb-cl__icon svg {
      width: 24px;
      height: 24px;
      fill: none;
      stroke: #fff;
      stroke-width: 2.5;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .sb-cl__wordmark {
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
      font-size: 24px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.5px;
    }
    .sb-cl__wordmark span {
      color: #15803d;
    }
    .sb-cl__bar {
      width: 180px;
      height: 3px;
      background: #e2e8f0;
      border-radius: 99px;
      overflow: hidden;
    }
    .sb-cl__bar-fill {
      height: 100%;
      width: 40%;
      background: linear-gradient(90deg, #15803d, #4ade80);
      border-radius: 99px;
      animation: sb-cl-slide 1.2s ease-in-out infinite;
    }
    @keyframes sb-cl-slide {
      0%   { transform: translateX(-100%); }
      50%  { transform: translateX(150%); }
      100% { transform: translateX(350%); }
    }
  `;
  document.head.appendChild(style);

  var loader = document.createElement('div');
  loader.id = 'sb-client-loader';
  loader.innerHTML = `
    <div class="sb-cl__brand">
      <div class="sb-cl__icon">
        <svg viewBox="0 0 24 24">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
      </div>
      <div class="sb-cl__wordmark">Skill<span>Bridge</span></div>
    </div>
    <div class="sb-cl__bar">
      <div class="sb-cl__bar-fill"></div>
    </div>
  `;

  // Append as soon as body exists — use documentElement as safe fallback
  if (document.body) {
    document.body.appendChild(loader);
  } else {
    document.addEventListener('DOMContentLoaded', function () {
      document.body.appendChild(loader);
    });
  }

  var dismissed = false;

  window.hideClientLoader = function () {
    if (dismissed) return;
    dismissed = true;
    var el = document.getElementById('sb-client-loader');
    if (!el) return;
    el.classList.add('hidden');
    setTimeout(function () { if (el.parentNode) el.remove(); }, 380);
  };

  // Safety net: always dismiss after MAX_WAIT_MS, no matter what the page does.
  // This prevents an infinite spinner when Auth.me() hangs on a cold backend.
  setTimeout(function () {
    window.hideClientLoader();
  }, MAX_WAIT_MS);
}());
