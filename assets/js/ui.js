/* ============================================================
   Luna Bistro — shared UI helpers (ui.js)
   Icons, toasts, modals, drawers and small DOM utilities used by
   both the customer site and the dashboard.
   ============================================================ */
/* global window, document */

window.UI = (function () {
  'use strict';

  /* Icons — a hand-picked subset, inlined so the project has no
     runtime dependency on an icon CDN. */
  var PATHS = {
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    'check-circle': '<circle cx="12" cy="12" r="9"/><path d="M8.5 12.5 11 15l4.5-5"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',
    'calendar-plus': '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18M12 14v5M9.5 16.5h5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    users: '<path d="M16 20v-1.5a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V20"/><circle cx="9" cy="7" r="3.2"/><path d="M22 20v-1.5a4 4 0 0 0-3-3.8"/><path d="M16.5 4a3.2 3.2 0 0 1 0 6"/>',
    user: '<circle cx="12" cy="8" r="3.6"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/>',
    'layout-grid': '<rect x="3" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5"/>',
    'bar-chart': '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    'trending-up': '<path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
    'trending-down': '<path d="m3 7 6 6 4-4 8 8"/><path d="M15 17h6v-6"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 7 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3 14.9a1.6 1.6 0 0 0-1.5-1H1.4a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 3 8.6a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 7.3 4h.1A1.6 1.6 0 0 0 8.4 2.5V2.4a2 2 0 1 1 4 0v.1A1.6 1.6 0 0 0 15 4.6a1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8v.1a1.6 1.6 0 0 0 1.5 1h.1a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.4 1z"/>',
    'log-out': '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    eye: '<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    'chevron-left': '<path d="m15 18-6-6 6-6"/>',
    'chevron-right': '<path d="m9 18 6-6-6-6"/>',
    'chevron-down': '<path d="m6 9 6 6 6-6"/>',
    'arrow-right': '<path d="M4 12h16M14 6l6 6-6 6"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
    mail: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    'map-pin': '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
    star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
    utensils: '<path d="M4 3v7a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V3M6 12v9"/><path d="M17 3c-1.5 1-2.5 3-2.5 5.5S15.5 13 17 13v8"/>',
    wine: '<path d="M8 3h8l-.6 5.4a3.5 3.5 0 0 1-6.8 0z"/><path d="M12 13v6M8.5 21h7"/>',
    music: '<circle cx="6.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="15.5" r="2.5"/><path d="M9 17.5V6l11-2v11.5"/>',
    activity: '<path d="M22 12h-4l-3 8-6-16-3 8H2"/>',
    'refresh-cw': '<path d="M21 12a9 9 0 0 1-15.4 6.4L3 16"/><path d="M3 12a9 9 0 0 1 15.4-6.4L21 8"/><path d="M21 4v4h-4M3 20v-4h4"/>',
    download: '<path d="M12 3v12M7 11l5 5 5-5"/><path d="M21 21H3"/>',
    printer: '<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="7" rx="2"/><path d="M6 14h12v7H6z"/>',
    filter: '<path d="M3 5h18l-7 8v6l-4 2v-8z"/>',
    dollar: '<path d="M12 2v20"/><path d="M17 6.5C17 4.6 14.8 3.5 12 3.5S7 4.6 7 6.5 9.2 9.5 12 9.5s5 1.1 5 3-2.2 3-5 3-5-1.1-5-3"/>',
    sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
    bell: '<path d="M18 9a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7"/><path d="M10.5 20a2 2 0 0 0 3 0"/>',
    'door-open': '<path d="M13 3v18M13 3 5 5v14l8 2"/><path d="M17 3h2v18h-2"/><circle cx="10" cy="12" r=".8"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    alert: '<path d="M12 4 2.5 20h19z"/><path d="M12 10v4M12 17h.01"/>'
  };

  function icon(name, size) {
    var body = PATHS[name] || PATHS.info;
    var s = size || 20;
    return '<svg viewBox="0 0 24 24" width="' + s + '" height="' + s + '" fill="none" stroke="currentColor" ' +
      'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + body + '</svg>';
  }

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function el(html) {
    var t = document.createElement('template');
    t.innerHTML = String(html).trim();
    return t.content.firstElementChild;
  }

  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function debounce(fn, wait) {
    var t;
    return function () {
      var args = arguments, self = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(self, args); }, wait || 200);
    };
  }

  /* Toasts --------------------------------------------------- */
  function toastStack() {
    var s = qs('.toast-stack');
    if (!s) {
      s = el('<div class="toast-stack" role="status" aria-live="polite"></div>');
      document.body.appendChild(s);
    }
    return s;
  }
  function toast(message, kind) {
    var node = el('<div class="toast" data-kind="' + (kind || 'info') + '">' +
      '<span style="color:var(--brand);flex:none;margin-top:2px">' + icon(kind === 'error' ? 'alert' : kind === 'success' ? 'check-circle' : 'info', 18) + '</span>' +
      '<span>' + esc(message) + '</span></div>');
    toastStack().appendChild(node);
    setTimeout(function () {
      node.style.transition = 'opacity .25s ease, transform .25s ease';
      node.style.opacity = '0';
      node.style.transform = 'translateY(6px)';
      setTimeout(function () { node.remove(); }, 260);
    }, 3600);
  }

  /* Modal ---------------------------------------------------- */
  var lastFocus = null;
  function modal(opts) {
    close();
    lastFocus = document.activeElement;
    var wide = opts.wide ? ' modal-lg' : '';
    var backdrop = el(
      '<div class="modal-backdrop" role="dialog" aria-modal="true" aria-label="' + esc(opts.title || 'Dialog') + '">' +
        '<div class="modal' + wide + '">' +
          '<div class="modal-head"><h3>' + esc(opts.title || '') + '</h3>' +
            '<button class="icon-btn" data-close aria-label="Close dialog">' + icon('x', 16) + '</button></div>' +
          '<div class="modal-body"></div>' +
        '</div>' +
      '</div>');
    backdrop.querySelector('.modal-body').innerHTML = opts.body || '';
    if (opts.footer) {
      var foot = el('<div class="modal-foot"></div>');
      foot.innerHTML = opts.footer;
      backdrop.querySelector('.modal').appendChild(foot);
    }
    document.body.appendChild(backdrop);
    document.body.style.overflow = 'hidden';

    backdrop.addEventListener('click', function (e) {
      if (e.target === backdrop || e.target.closest('[data-close]')) close();
    });
    document.addEventListener('keydown', onKey);
    var focusable = backdrop.querySelector('input, select, textarea, button:not([data-close])');
    if (focusable) focusable.focus();
    if (typeof opts.onOpen === 'function') opts.onOpen(backdrop);
    return backdrop;
  }

  function drawer(opts) {
    close();
    lastFocus = document.activeElement;
    var backdrop = el('<div class="drawer-backdrop"></div>');
    var panel = el(
      '<aside class="drawer" role="dialog" aria-modal="true" aria-label="' + esc(opts.title || 'Details') + '">' +
        '<div class="drawer-head"><div><h3 style="margin:0">' + esc(opts.title || '') + '</h3>' +
        (opts.subtitle ? '<p class="muted" style="margin:4px 0 0;font-size:.86rem">' + esc(opts.subtitle) + '</p>' : '') +
        '</div><button class="icon-btn" data-close aria-label="Close panel">' + icon('x', 16) + '</button></div>' +
        '<div class="drawer-body"></div></aside>');
    panel.querySelector('.drawer-body').innerHTML = opts.body || '';
    document.body.appendChild(backdrop);
    document.body.appendChild(panel);
    document.body.style.overflow = 'hidden';
    backdrop.addEventListener('click', close);
    panel.addEventListener('click', function (e) { if (e.target.closest('[data-close]')) close(); });
    document.addEventListener('keydown', onKey);
    if (typeof opts.onOpen === 'function') opts.onOpen(panel);
    return panel;
  }

  function onKey(e) { if (e.key === 'Escape') close(); }

  function close() {
    qsa('.modal-backdrop, .drawer-backdrop, .drawer').forEach(function (n) { n.remove(); });
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onKey);
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) {} }
    lastFocus = null;
  }

  function confirmDialog(opts, onYes) {
    modal({
      title: opts.title || 'Are you sure?',
      body: '<p class="muted" style="margin:0">' + esc(opts.message || '') + '</p>',
      footer: '<button class="btn btn-ghost" data-close>Keep it</button>' +
        '<button class="btn ' + (opts.danger ? 'btn-danger' : '') + '" data-yes>' + esc(opts.confirmLabel || 'Confirm') + '</button>',
      onOpen: function (root) {
        root.querySelector('[data-yes]').addEventListener('click', function () { close(); onYes(); });
      }
    });
  }

  /* Reveal on scroll ---------------------------------------- */
  function reveal() {
    var nodes = qsa('.reveal');
    if (!nodes.length) return;
    if (!('IntersectionObserver' in window)) { nodes.forEach(function (n) { n.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -60px 0px' });
    nodes.forEach(function (n) { io.observe(n); });
  }

  /* Theme ---------------------------------------------------- */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
  }

  return {
    icon: icon, esc: esc, el: el, qs: qs, qsa: qsa, debounce: debounce,
    toast: toast, modal: modal, drawer: drawer, close: close, confirm: confirmDialog,
    reveal: reveal, applyTheme: applyTheme
  };
})();
