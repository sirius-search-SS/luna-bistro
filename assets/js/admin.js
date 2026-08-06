/* ============================================================
   Luna Bistro — admin dashboard (admin.js)
   One script, dispatched by <body data-page="…">.
   ============================================================ */
/* global window, document, LB, UI, Chart */

(function () {
  'use strict';

  var page = document.body.dataset.page;
  var charts = {};

  var NAV = [
    { group: 'Service', items: [
      { id: 'dashboard', label: 'Dashboard', href: 'index.html', icon: 'bar-chart' },
      { id: 'reservations', label: 'Reservations', href: 'reservations.html', icon: 'calendar', badge: 'pending' },
      { id: 'tables', label: 'Tables', href: 'tables.html', icon: 'layout-grid' },
      { id: 'calendar', label: 'Calendar', href: 'calendar.html', icon: 'calendar-plus' }
    ]},
    { group: 'Guests', items: [
      { id: 'customers', label: 'Customers', href: 'customers.html', icon: 'users' }
    ]},
    { group: 'Business', items: [
      { id: 'reports', label: 'Reports', href: 'reports.html', icon: 'trending-up' },
      { id: 'settings', label: 'Settings', href: 'settings.html', icon: 'settings' }
    ]}
  ];

  var TITLES = {
    dashboard: ['Dashboard', 'Today at a glance'],
    reservations: ['Reservations', 'Every booking, past and future'],
    tables: ['Tables', 'Live floor status'],
    customers: ['Customers', 'Guest profiles and history'],
    calendar: ['Calendar', 'Bookings by day, week and month'],
    reports: ['Reports', 'Performance over time'],
    settings: ['Settings', 'Restaurant configuration']
  };

  /* ========================================================
     Shell
     ======================================================== */
  function shell() {
    if (!LB.auth.require()) return false;
    UI.applyTheme(LB.settings().theme);

    var user = LB.auth.user();
    var pending = LB.reservations().filter(function (r) { return r.status === 'pending'; }).length;

    var sidebar = UI.qs('.sidebar');
    sidebar.innerHTML =
      '<a class="brand" href="../index.html">' +
        '<span class="brand-mark" aria-hidden="true"></span>' +
        '<span><span class="brand-name">Luna Bistro</span><span class="brand-sub">Staff console</span></span>' +
      '</a>' +
      NAV.map(function (g) {
        return '<div class="side-group"><p class="side-label">' + g.group + '</p>' +
          g.items.map(function (it) {
            var badge = it.badge === 'pending' && pending ? '<span class="count">' + pending + '</span>' : '';
            return '<a class="side-link" href="' + it.href + '"' + (it.id === page ? ' aria-current="page"' : '') + '>' +
              UI.icon(it.icon, 18) + '<span>' + it.label + '</span>' + badge + '</a>';
          }).join('') + '</div>';
      }).join('') +
      '<div class="side-foot">' +
        '<div class="row" style="margin-bottom:var(--s3)">' +
          '<span class="avatar">' + UI.esc(user.name.split(' ').map(function (p) { return p[0]; }).join('')) + '</span>' +
          '<span class="grow"><b style="display:block;font-size:.88rem">' + UI.esc(user.name) + '</b>' +
          '<span class="faint" style="font-size:.76rem">' + UI.esc(user.role) + '</span></span>' +
        '</div>' +
        '<a class="side-link" href="../index.html">' + UI.icon('door-open', 18) + '<span>View public site</span></a>' +
        '<button class="side-link" id="logout" style="border:0;background:none;width:100%;cursor:pointer;text-align:left">' + UI.icon('log-out', 18) + '<span>Sign out</span></button>' +
      '</div>';

    var t = TITLES[page] || ['Luna Bistro', ''];
    var topbar = UI.qs('.topbar');
    topbar.innerHTML =
      '<button class="btn btn-ghost btn-icon menu-btn" id="menu-btn" aria-label="Open navigation">' + UI.icon('menu', 18) + '</button>' +
      '<div><p class="crumbs">Luna Bistro / ' + UI.esc(t[0]) + '</p><h1>' + UI.esc(t[1]) + '</h1></div>' +
      '<div class="topbar-actions">' +
        '<div class="search-box"><label class="sr-only" for="global-search">Search bookings</label>' +
          UI.icon('search', 16) +
          '<input class="control" id="global-search" type="search" placeholder="Search name or code"></div>' +
        '<button class="btn btn-ghost btn-icon" id="theme-btn" aria-label="Toggle dark mode">' + UI.icon('moon', 18) + '</button>' +
        '<a class="btn btn-sm" href="reservations.html?new=1">' + UI.icon('plus', 16) + 'New booking</a>' +
      '</div>';

    UI.qs('#logout').addEventListener('click', function () {
      LB.auth.logout();
      window.location.href = 'login.html';
    });

    UI.qs('#theme-btn').addEventListener('click', function () {
      var next = LB.settings().theme === 'dark' ? 'light' : 'dark';
      LB.saveSettings({ theme: next });
      UI.applyTheme(next);
      Object.keys(charts).forEach(function (k) { if (charts[k]) { charts[k].destroy(); charts[k] = null; } });
      if (page === 'dashboard') dashboard();
      if (page === 'reports') reports();
    });

    UI.qs('#menu-btn').addEventListener('click', function () {
      sidebar.classList.add('open');
      var scrim = UI.el('<div class="scrim"></div>');
      document.body.appendChild(scrim);
      scrim.addEventListener('click', function () { sidebar.classList.remove('open'); scrim.remove(); });
    });

    UI.qs('#global-search').addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      var q = e.target.value.trim();
      if (!q) return;
      window.location.href = 'reservations.html?q=' + encodeURIComponent(q);
    });

    return true;
  }

  /* ========================================================
     Chart helper
     ======================================================== */
  function css(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function chart(id, config) {
    var canvas = document.getElementById(id);
    if (!canvas) return;
    if (typeof Chart === 'undefined') {
      canvas.parentElement.innerHTML = '<div class="empty-state" style="height:100%;display:grid;place-items:center">' +
        '<p style="margin:0">Charts need Chart.js. Connect to the internet, or drop the library into <code>assets/vendor/</code>.</p></div>';
      return;
    }
    if (charts[id]) charts[id].destroy();
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.color = css('--text-muted');
    Chart.defaults.borderColor = css('--line');
    charts[id] = new Chart(canvas.getContext('2d'), config);
  }

  function lineOpts(extra) {
    return Object.assign({
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { display: false }, tooltip: { padding: 10, cornerRadius: 8 } },
      scales: {
        x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkipPadding: 14 } },
        y: { beginAtZero: true, border: { display: false }, grid: { color: css('--line') } }
      }
    }, extra || {});
  }

  /* ========================================================
     Dashboard
     ======================================================== */
  function dashboard() {
    var s = LB.statsForToday();
    var r = LB.rates();
    var series = LB.seriesLastDays(14);
    var last7 = series.slice(7);
    var prev7 = series.slice(0, 7);
    var sum = function (a, k) { return a.reduce(function (x, d) { return x + d[k]; }, 0); };
    var delta = function (a, b) { return b ? Math.round(((a - b) / b) * 100) : 0; };
    var revDelta = delta(sum(last7, 'revenue'), sum(prev7, 'revenue'));
    var resDelta = delta(sum(last7, 'reservations'), sum(prev7, 'reservations'));
    var monthRevenue = LB.seriesLastDays(30).reduce(function (x, d) { return x + d.revenue; }, 0);

    function kpi(label, value, icon, delta2, sub) {
      var d = delta2 === undefined ? '' :
        '<span class="kpi-delta ' + (delta2 >= 0 ? 'up' : 'down') + '">' +
        UI.icon(delta2 >= 0 ? 'trending-up' : 'trending-down', 14) +
        Math.abs(delta2) + '% vs last week</span>';
      return '<article class="card kpi"><span class="kpi-icon">' + UI.icon(icon, 17) + '</span>' +
        '<span class="kpi-label">' + label + '</span>' +
        '<span class="kpi-value">' + value + '</span>' +
        (d || (sub ? '<span class="kpi-delta faint">' + sub + '</span>' : '')) + '</article>';
    }

    UI.qs('#kpis').innerHTML = [
      kpi("Today's reservations", s.reservations, 'calendar', resDelta),
      kpi("Today's revenue", LB.money(s.revenue), 'dollar', revDelta),
      kpi('Available tables', s.available + ' <small>/ ' + LB.tables().length + '</small>', 'layout-grid', undefined, s.cleaning + ' being cleaned'),
      kpi('Occupied tables', s.occupied, 'utensils', undefined, s.reserved + ' reserved for later'),
      kpi('Walk-ins today', s.walkIns, 'door-open', undefined, 'seated without a booking'),
      kpi('Covers today', s.covers, 'users', undefined, 'avg party ' + r.avgGuests.toFixed(1)),
      kpi('Average rating', '4.8', 'star', undefined, 'across 412 reviews'),
      kpi('Revenue, 30 days', LB.money(monthRevenue), 'trending-up', undefined, 'avg spend ' + LB.money(r.avgSpend))
    ].join('');

    chart('chart-week', {
      type: 'line',
      data: {
        labels: series.map(function (d) { return d.label; }),
        datasets: [{
          data: series.map(function (d) { return d.reservations; }),
          borderColor: css('--brand'), backgroundColor: 'rgba(139,94,60,.10)',
          fill: true, tension: .35, pointRadius: 3, pointBackgroundColor: css('--brand'), borderWidth: 2
        }]
      },
      options: lineOpts()
    });

    chart('chart-revenue', {
      type: 'bar',
      data: {
        labels: series.map(function (d) { return d.label; }),
        datasets: [{ data: series.map(function (d) { return d.revenue; }), backgroundColor: css('--secondary'), borderRadius: 6, maxBarThickness: 26 }]
      },
      options: lineOpts({ plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (c) { return LB.money(c.parsed.y); } } } } })
    });

    var hours = LB.busyHours();
    chart('chart-hours', {
      type: 'bar',
      data: {
        labels: hours.map(function (h) { return h.time; }),
        datasets: [{ data: hours.map(function (h) { return h.covers; }), backgroundColor: css('--accent'), borderRadius: 5, maxBarThickness: 22 }]
      },
      options: lineOpts()
    });

    var pop = LB.popularTables(6);
    chart('chart-tables', {
      type: 'bar',
      data: {
        labels: pop.map(function (p) { return p.table; }),
        datasets: [{ data: pop.map(function (p) { return p.count; }), backgroundColor: css('--brand'), borderRadius: 5, maxBarThickness: 22 }]
      },
      options: lineOpts({ indexAxis: 'y' })
    });

    var upcoming = LB.reservations()
      .filter(function (x) { return x.date >= LB.todayISO() && (x.status === 'confirmed' || x.status === 'pending'); })
      .sort(function (a, b) { return (a.date + a.time) < (b.date + b.time) ? -1 : 1; })
      .slice(0, 8);

    UI.qs('#upcoming').innerHTML = upcoming.length ? upcoming.map(function (x) {
      var m = LB.STATUS_META[x.status];
      return '<tr><td><span class="cell-strong">' + UI.esc(x.customer_name) + '</span>' +
        '<span class="cell-sub num">' + UI.esc(x.reservation_code) + '</span></td>' +
        '<td class="num">' + x.guests + '</td>' +
        '<td>' + LB.relative(x.date) + '<span class="cell-sub num">' + LB.formatTime(x.time) + '</span></td>' +
        '<td class="num">' + UI.esc(x.table) + '</td>' +
        '<td><span class="status ' + m.cls + '">' + m.label + '</span></td></tr>';
    }).join('') : '<tr><td colspan="5" class="muted">Nothing booked yet. New bookings from the website appear here.</td></tr>';

    var acts = LB.activity();
    UI.qs('#activity').innerHTML = acts.length ? acts.slice(0, 8).map(function (a) {
      var when = new Date(a.at);
      return '<li><span class="fdot">' + UI.icon(a.icon, 15) + '</span>' +
        '<span>' + UI.esc(a.text) + '<time>' + when.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) + '</time></span></li>';
    }).join('') : '<li class="muted">No activity yet today. Actions you take here are logged in this feed.</li>';
  }

  /* ========================================================
     Reservations
     ======================================================== */
  function reservations() {
    var params = new URLSearchParams(window.location.search);
    var state = {
      q: params.get('q') || '',
      status: 'all',
      range: 'upcoming',
      sort: 'date',
      dir: 1,
      pageNo: 1,
      perPage: 10
    };

    UI.qs('#res-toolbar').innerHTML =
      '<div class="search-box"><label class="sr-only" for="r-q">Search</label>' + UI.icon('search', 16) +
        '<input class="control" id="r-q" type="search" placeholder="Name, code, phone" style="width:220px" value="' + UI.esc(state.q) + '"></div>' +
      '<label class="sr-only" for="r-status">Status</label>' +
      '<select class="control" id="r-status"><option value="all">All statuses</option>' +
        LB.STATUSES.map(function (s) { return '<option value="' + s + '">' + LB.STATUS_META[s].label + '</option>'; }).join('') + '</select>' +
      '<label class="sr-only" for="r-range">Date range</label>' +
      '<select class="control" id="r-range">' +
        '<option value="upcoming">Today and upcoming</option><option value="today">Today only</option>' +
        '<option value="past">Past bookings</option><option value="all">Everything</option></select>' +
      '<div class="grow"></div>' +
      '<button class="btn btn-ghost btn-sm" id="r-export">' + UI.icon('download', 16) + 'Export CSV</button>' +
      '<button class="btn btn-sm" id="r-new">' + UI.icon('plus', 16) + 'New booking</button>';

    function filtered() {
      var t = LB.todayISO();
      var list = LB.reservations().slice();
      if (state.range === 'today') list = list.filter(function (r) { return r.date === t; });
      else if (state.range === 'upcoming') list = list.filter(function (r) { return r.date >= t; });
      else if (state.range === 'past') list = list.filter(function (r) { return r.date < t; });
      if (state.status !== 'all') list = list.filter(function (r) { return r.status === state.status; });
      if (state.q) {
        var q = state.q.toLowerCase();
        list = list.filter(function (r) {
          return (r.customer_name + ' ' + r.reservation_code + ' ' + r.phone + ' ' + r.email + ' ' + r.table).toLowerCase().indexOf(q) > -1;
        });
      }
      list.sort(function (a, b) {
        var av, bv;
        if (state.sort === 'date') { av = a.date + a.time; bv = b.date + b.time; }
        else if (state.sort === 'guests') { av = a.guests; bv = b.guests; }
        else if (state.sort === 'status') { av = a.status; bv = b.status; }
        else { av = a.customer_name.toLowerCase(); bv = b.customer_name.toLowerCase(); }
        return av < bv ? -state.dir : av > bv ? state.dir : 0;
      });
      return list;
    }

    function render() {
      var list = filtered();
      var pages = Math.max(1, Math.ceil(list.length / state.perPage));
      if (state.pageNo > pages) state.pageNo = pages;
      var slice = list.slice((state.pageNo - 1) * state.perPage, state.pageNo * state.perPage);

      UI.qs('#res-body').innerHTML = slice.length ? slice.map(function (r) {
        var m = LB.STATUS_META[r.status];
        return '<tr data-id="' + r.id + '">' +
          '<td><span class="cell-strong">' + UI.esc(r.customer_name) + '</span><span class="cell-sub num">' + UI.esc(r.reservation_code) + '</span></td>' +
          '<td class="num">' + r.guests + '</td>' +
          '<td>' + LB.formatDate(r.date, 'medium') + '<span class="cell-sub">' + LB.relative(r.date) + '</span></td>' +
          '<td class="num">' + LB.formatTime(r.time) + '</td>' +
          '<td class="num">' + UI.esc(r.table) + '<span class="cell-sub">' + UI.esc(r.seating) + '</span></td>' +
          '<td><span class="status ' + m.cls + '">' + m.label + '</span></td>' +
          '<td><div class="actions-cell">' +
            '<button class="icon-btn" data-act="view" title="View details" aria-label="View ' + UI.esc(r.reservation_code) + '">' + UI.icon('eye', 15) + '</button>' +
            '<button class="icon-btn" data-act="edit" title="Edit booking" aria-label="Edit ' + UI.esc(r.reservation_code) + '">' + UI.icon('edit', 15) + '</button>' +
            '<button class="icon-btn danger" data-act="delete" title="Delete booking" aria-label="Delete ' + UI.esc(r.reservation_code) + '">' + UI.icon('trash', 15) + '</button>' +
          '</div></td></tr>';
      }).join('') : '<tr><td colspan="7"><div class="empty-state"><p style="margin:0"><strong>No bookings match those filters.</strong></p>' +
        '<p style="margin:var(--s2) 0 0">Widen the date range, or clear the search box.</p></div></td></tr>';

      UI.qs('#res-count').textContent = list.length + (list.length === 1 ? ' booking' : ' bookings');

      var btns = [];
      for (var i = 1; i <= pages; i++) {
        if (pages > 7 && i > 3 && i < pages - 1 && Math.abs(i - state.pageNo) > 1) {
          if (btns[btns.length - 1] !== '…') btns.push('…');
          continue;
        }
        btns.push(i);
      }
      UI.qs('#res-pager').innerHTML =
        '<button data-page="prev"' + (state.pageNo === 1 ? ' disabled' : '') + ' aria-label="Previous page">' + UI.icon('chevron-left', 15) + '</button>' +
        btns.map(function (b) {
          return b === '…' ? '<button disabled>…</button>' :
            '<button data-page="' + b + '"' + (b === state.pageNo ? ' aria-current="true"' : '') + '>' + b + '</button>';
        }).join('') +
        '<button data-page="next"' + (state.pageNo === pages ? ' disabled' : '') + ' aria-label="Next page">' + UI.icon('chevron-right', 15) + '</button>';
    }

    /* --- detail / edit --- */
    function detail(r) {
      var c = LB.customer(r.customer_id);
      var m = LB.STATUS_META[r.status];
      var history = LB.reservations().filter(function (x) { return x.customer_id === r.customer_id && x.id !== r.id; }).length;
      UI.drawer({
        title: r.customer_name,
        subtitle: r.reservation_code,
        body: '<span class="status ' + m.cls + '" style="margin-bottom:var(--s4)">' + m.label + '</span>' +
          '<dl class="kv" style="margin-top:var(--s4)">' +
            '<dt>Date</dt><dd>' + LB.formatDate(r.date, 'long') + '</dd>' +
            '<dt>Time</dt><dd>' + LB.formatTime(r.time) + '</dd>' +
            '<dt>Party</dt><dd>' + r.guests + ' guests</dd>' +
            '<dt>Table</dt><dd>' + UI.esc(r.table) + ' · ' + UI.esc(r.seating) + '</dd>' +
            '<dt>Occasion</dt><dd>' + UI.esc(r.occasion) + '</dd>' +
            '<dt>Source</dt><dd>' + UI.esc(r.source) + '</dd>' +
            '<dt>Phone</dt><dd>' + UI.esc(r.phone) + '</dd>' +
            '<dt>Email</dt><dd style="word-break:break-all">' + UI.esc(r.email) + '</dd>' +
            '<dt>Booked on</dt><dd>' + LB.formatDate(r.created_at) + '</dd>' +
            (r.spend ? '<dt>Spend</dt><dd>' + LB.money2(r.spend) + '</dd>' : '') +
          '</dl>' +
          (r.special_requests ? '<div class="card" style="background:var(--warning-soft);border-color:transparent;padding:var(--s4);margin-top:var(--s5)">' +
            '<b style="font-size:.76rem;text-transform:uppercase;letter-spacing:.08em">Special request</b>' +
            '<p style="margin:6px 0 0;font-size:.9rem">' + UI.esc(r.special_requests) + '</p></div>' : '') +
          '<p class="hint" style="margin-top:var(--s5)">' + (c ? c.visits : 0) + ' recorded visits · ' + history + ' other bookings on file</p>' +
          '<h4 style="margin-top:var(--s5)">Move to</h4>' +
          '<div class="choice-grid">' + LB.STATUSES.map(function (s) {
            return '<button class="chip" data-status="' + s + '"' + (s === r.status ? ' disabled style="opacity:.45"' : '') + '>' + LB.STATUS_META[s].label + '</button>';
          }).join('') + '</div>' +
          '<button class="btn btn-block" data-edit style="margin-top:var(--s5)">Edit this booking</button>',
        onOpen: function (root) {
          root.addEventListener('click', function (e) {
            var st = e.target.closest('[data-status]');
            if (st) {
              LB.updateReservation(r.id, { status: st.dataset.status });
              UI.close(); render();
              UI.toast(r.reservation_code + ' is now ' + LB.STATUS_META[st.dataset.status].label.toLowerCase() + '.', 'success');
            }
            if (e.target.closest('[data-edit]')) { UI.close(); form(r); }
          });
        }
      });
    }

    function form(existing) {
      var r = existing || {};
      var dateVal = r.date || LB.todayISO();
      var slots = LB.slotsFor(dateVal);
      if (!slots.length) slots = LB.SLOTS;

      UI.modal({
        title: existing ? 'Edit ' + r.reservation_code : 'New booking',
        wide: true,
        body:
          '<div class="grid-2">' +
            '<div class="field"><label for="e-name">Guest name <span class="req">*</span></label><input class="control" id="e-name" value="' + UI.esc(r.customer_name || '') + '"></div>' +
            '<div class="field"><label for="e-email">Email</label><input class="control" id="e-email" type="email" value="' + UI.esc(r.email || '') + '"></div>' +
          '</div>' +
          '<div class="grid-2">' +
            '<div class="field"><label for="e-phone">Phone</label><input class="control" id="e-phone" value="' + UI.esc(r.phone || '') + '"></div>' +
            '<div class="field"><label for="e-source">Source</label><select class="control" id="e-source">' +
              LB.SOURCES.map(function (s) { return '<option' + (s === r.source ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select></div>' +
          '</div>' +
          '<div class="grid-3">' +
            '<div class="field"><label for="e-date">Date <span class="req">*</span></label><input class="control" id="e-date" type="date" value="' + dateVal + '"></div>' +
            '<div class="field"><label for="e-time">Time <span class="req">*</span></label><select class="control" id="e-time">' +
              slots.map(function (s) { return '<option value="' + s + '"' + (s === r.time ? ' selected' : '') + '>' + LB.formatTime(s) + '</option>'; }).join('') + '</select></div>' +
            '<div class="field"><label for="e-guests">Guests <span class="req">*</span></label><input class="control" id="e-guests" type="number" min="1" max="20" value="' + (r.guests || 2) + '"></div>' +
          '</div>' +
          '<div class="grid-3">' +
            '<div class="field"><label for="e-table">Table</label><select class="control" id="e-table">' +
              '<option value="">Auto-assign</option>' +
              LB.tables().map(function (t) {
                return '<option value="' + t.table_number + '"' + (t.table_number === r.table ? ' selected' : '') + '>' + t.table_number + ' · ' + t.capacity + ' seats · ' + t.location + '</option>';
              }).join('') + '</select></div>' +
            '<div class="field"><label for="e-seating">Seating</label><select class="control" id="e-seating">' +
              LB.SEATING.map(function (s) { return '<option' + (s === r.seating ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select></div>' +
            '<div class="field"><label for="e-status">Status</label><select class="control" id="e-status">' +
              LB.STATUSES.map(function (s) { return '<option value="' + s + '"' + (s === r.status ? ' selected' : '') + '>' + LB.STATUS_META[s].label + '</option>'; }).join('') + '</select></div>' +
          '</div>' +
          '<div class="field"><label for="e-occasion">Occasion</label><select class="control" id="e-occasion">' +
            LB.OCCASIONS.map(function (s) { return '<option' + (s === r.occasion ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select></div>' +
          '<div class="field"><label for="e-notes">Special requests</label><textarea class="control" id="e-notes">' + UI.esc(r.special_requests || '') + '</textarea></div>',
        footer: '<button class="btn btn-ghost" data-close>Cancel</button><button class="btn" data-save>' + (existing ? 'Save changes' : 'Create booking') + '</button>',
        onOpen: function (root) {
          root.querySelector('#e-date').addEventListener('change', function (e) {
            var ss = LB.slotsFor(e.target.value);
            var sel = root.querySelector('#e-time');
            if (!ss.length) { UI.toast('The restaurant is closed that day — booking will need a manager override.', 'warning'); ss = LB.SLOTS; }
            sel.innerHTML = ss.map(function (s) { return '<option value="' + s + '">' + LB.formatTime(s) + '</option>'; }).join('');
          });

          root.querySelector('[data-save]').addEventListener('click', function () {
            var name = root.querySelector('#e-name').value.trim();
            var guests = Number(root.querySelector('#e-guests').value);
            var date = root.querySelector('#e-date').value;
            var time = root.querySelector('#e-time').value;
            if (!name || !date || !time || !guests) { UI.toast('Name, date, time and party size are required.', 'error'); return; }

            var table = root.querySelector('#e-table').value ||
              LB.assignTable(date, time, guests, root.querySelector('#e-seating').value);

            var patch = {
              customer_name: name,
              email: root.querySelector('#e-email').value.trim(),
              phone: root.querySelector('#e-phone').value.trim(),
              date: date, time: time, guests: guests, table: table,
              seating: root.querySelector('#e-seating').value,
              occasion: root.querySelector('#e-occasion').value,
              status: root.querySelector('#e-status').value,
              source: root.querySelector('#e-source').value,
              special_requests: root.querySelector('#e-notes').value.trim()
            };

            if (existing) {
              LB.updateReservation(r.id, patch);
              UI.toast('Booking updated.', 'success');
            } else {
              var created = LB.createReservation({
                name: name, email: patch.email, phone: patch.phone,
                date: date, time: time, guests: guests,
                seating: patch.seating, occasion: patch.occasion,
                special_requests: patch.special_requests, source: patch.source
              });
              LB.updateReservation(created.id, { status: patch.status, table: table });
              UI.toast('Booking created — ' + created.reservation_code, 'success');
            }
            UI.close();
            render();
          });
        }
      });
    }

    /* --- events --- */
    UI.qs('#r-q').addEventListener('input', UI.debounce(function (e) { state.q = e.target.value; state.pageNo = 1; render(); }, 180));
    UI.qs('#r-status').addEventListener('change', function (e) { state.status = e.target.value; state.pageNo = 1; render(); });
    UI.qs('#r-range').addEventListener('change', function (e) { state.range = e.target.value; state.pageNo = 1; render(); });
    UI.qs('#r-new').addEventListener('click', function () { form(null); });

    UI.qs('#r-export').addEventListener('click', function () {
      var rows = [['Code', 'Guest', 'Guests', 'Date', 'Time', 'Table', 'Status', 'Source', 'Spend']];
      filtered().forEach(function (r) {
        rows.push([r.reservation_code, r.customer_name, r.guests, r.date, r.time, r.table, r.status, r.source, r.spend]);
      });
      var csv = rows.map(function (row) {
        return row.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(',');
      }).join('\n');
      var url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
      var a = document.createElement('a');
      a.href = url; a.download = 'luna-bistro-reservations.csv'; a.click();
      URL.revokeObjectURL(url);
      UI.toast('CSV exported.', 'success');
    });

    UI.qs('#res-table').addEventListener('click', function (e) {
      var th = e.target.closest('th[data-sort]');
      if (th) {
        var key = th.dataset.sort;
        state.dir = state.sort === key ? -state.dir : 1;
        state.sort = key;
        UI.qsa('#res-table th').forEach(function (h) { h.removeAttribute('aria-sort'); });
        th.setAttribute('aria-sort', state.dir === 1 ? 'ascending' : 'descending');
        render();
        return;
      }
      var row = e.target.closest('tr[data-id]');
      if (!row) return;
      var rec = LB.reservation(row.dataset.id);
      var act = e.target.closest('[data-act]');
      if (!act) { detail(rec); return; }
      if (act.dataset.act === 'view') detail(rec);
      if (act.dataset.act === 'edit') form(rec);
      if (act.dataset.act === 'delete') {
        UI.confirm({
          title: 'Delete ' + rec.reservation_code + '?',
          message: 'This removes the booking for ' + rec.customer_name + ' on ' + LB.formatDate(rec.date, 'long') + '. It cannot be undone.',
          confirmLabel: 'Delete booking', danger: true
        }, function () {
          LB.deleteReservation(rec.id);
          render();
          UI.toast('Booking deleted.', 'success');
        });
      }
    });

    UI.qs('#res-pager').addEventListener('click', function (e) {
      var b = e.target.closest('[data-page]');
      if (!b) return;
      var v = b.dataset.page;
      if (v === 'prev') state.pageNo = Math.max(1, state.pageNo - 1);
      else if (v === 'next') state.pageNo = state.pageNo + 1;
      else state.pageNo = Number(v);
      render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    render();
    if (params.get('new')) form(null);
  }

  /* ========================================================
     Tables
     ======================================================== */
  function tablesPage() {
    var STATUSES = [
      { key: 'available', label: 'Available', color: 'var(--success)' },
      { key: 'cleaning', label: 'Cleaning', color: 'var(--warning)' },
      { key: 'reserved', label: 'Reserved', color: 'var(--danger)' },
      { key: 'occupied', label: 'Occupied', color: 'var(--info)' }
    ];

    UI.qs('#legend').innerHTML = STATUSES.map(function (s) {
      return '<span><i style="background:' + s.color + '"></i>' + s.label + '</span>';
    }).join('');

    function render() {
      var tbls = LB.tables();
      var t = LB.todayISO();
      var locations = {};
      tbls.forEach(function (tb) { (locations[tb.location] = locations[tb.location] || []).push(tb); });

      UI.qs('#floor-areas').innerHTML = Object.keys(locations).map(function (loc) {
        return '<section style="margin-bottom:var(--s5)">' +
          '<div class="panel-head"><h3>' + UI.esc(loc) + '</h3>' +
          '<span class="faint num" style="font-size:.8rem">' + locations[loc].length + ' tables · ' +
          locations[loc].reduce(function (s, x) { return s + x.capacity; }, 0) + ' seats</span></div>' +
          '<div class="floor">' + locations[loc].map(function (tb) {
            var next = LB.activeOn(t).filter(function (r) { return r.table === tb.table_number; })
              .sort(function (a, b) { return a.time < b.time ? -1 : 1; })[0];
            return '<button class="table-tile" data-table="' + tb.table_number + '" data-status="' + tb.status + '">' +
              '<span class="row-between"><b>' + tb.table_number + '</b><span class="dot"></span></span>' +
              '<span>' + tb.capacity + ' seats</span>' +
              '<span class="num">' + (next ? LB.formatTime(next.time) : '—') + '</span></button>';
          }).join('') + '</div></section>';
      }).join('');

      var counts = {};
      STATUSES.forEach(function (s) { counts[s.key] = tbls.filter(function (x) { return x.status === s.key; }).length; });
      UI.qs('#floor-summary').innerHTML = STATUSES.map(function (s) {
        return '<article class="card kpi"><span class="kpi-label">' + s.label + '</span>' +
          '<span class="kpi-value" style="color:' + s.color + '">' + counts[s.key] + '</span>' +
          '<span class="kpi-delta faint">of ' + tbls.length + ' tables</span></article>';
      }).join('');
    }

    UI.qs('#floor-areas').addEventListener('click', function (e) {
      var tile = e.target.closest('[data-table]');
      if (!tile) return;
      var num = tile.dataset.table;
      var tb = LB.tables().filter(function (x) { return x.table_number === num; })[0];
      var t = LB.todayISO();
      var todays = LB.activeOn(t).filter(function (r) { return r.table === num; })
        .sort(function (a, b) { return a.time < b.time ? -1 : 1; });

      UI.drawer({
        title: 'Table ' + num,
        subtitle: tb.location + ' · ' + tb.capacity + ' seats',
        body:
          '<h4>Status</h4>' +
          '<div class="choice-grid">' + STATUSES.map(function (s) {
            return '<button class="chip' + (s.key === tb.status ? ' active' : '') + '" data-set="' + s.key + '">' + s.label + '</button>';
          }).join('') + '</div>' +
          '<h4 style="margin-top:var(--s5)">Today\'s bookings</h4>' +
          (todays.length ? '<div class="cal-list">' + todays.map(function (r) {
            var m = LB.STATUS_META[r.status];
            return '<div class="cal-row"><time>' + LB.formatTime(r.time) + '</time>' +
              '<div><b>' + UI.esc(r.customer_name) + '</b> · ' + r.guests + ' guests' +
              '<span class="cell-sub num">' + UI.esc(r.reservation_code) + '</span>' +
              '<span class="status ' + m.cls + '" style="margin-top:6px">' + m.label + '</span>' +
              (r.special_requests ? '<p class="hint" style="margin:6px 0 0">' + UI.esc(r.special_requests) + '</p>' : '') +
              '</div></div>';
          }).join('') + '</div>' : '<p class="muted">Nothing booked on this table today.</p>') +
          '<h4 style="margin-top:var(--s5)">Notes</h4>' +
          '<textarea class="control" id="tbl-notes" placeholder="Wobbly leg, reserved for a regular, anything the floor team should know.">' + UI.esc(tb.notes || '') + '</textarea>' +
          '<button class="btn btn-block" id="tbl-save" style="margin-top:var(--s3)">Save note</button>',
        onOpen: function (root) {
          root.addEventListener('click', function (ev) {
            var set = ev.target.closest('[data-set]');
            if (set) {
              LB.setTableStatus(num, set.dataset.set);
              UI.close(); render();
              UI.toast('Table ' + num + ' set to ' + set.dataset.set + '.', 'success');
            }
            if (ev.target.closest('#tbl-save')) {
              var db = LB.load();
              db.tables.forEach(function (x) { if (x.table_number === num) x.notes = root.querySelector('#tbl-notes').value; });
              LB.save(); UI.close();
              UI.toast('Note saved to table ' + num + '.', 'success');
            }
          });
        }
      });
    });

    render();
  }

  /* ========================================================
     Customers
     ======================================================== */
  function customers() {
    var state = { q: '', sort: 'visits' };

    function render() {
      var list = LB.customers().slice();
      if (state.q) {
        var q = state.q.toLowerCase();
        list = list.filter(function (c) {
          return (c.first_name + ' ' + c.last_name + ' ' + c.email + ' ' + c.phone).toLowerCase().indexOf(q) > -1;
        });
      }
      if (state.sort === 'visits') list.sort(function (a, b) { return b.visits - a.visits; });
      else if (state.sort === 'points') list.sort(function (a, b) { return b.loyalty_points - a.loyalty_points; });
      else list.sort(function (a, b) { return a.first_name.localeCompare(b.first_name); });

      UI.qs('#cust-count').textContent = list.length + (list.length === 1 ? ' guest' : ' guests');
      UI.qs('#cust-grid').innerHTML = list.length ? list.map(function (c) {
        var initials = (c.first_name[0] || '') + (c.last_name[0] || '');
        var upcoming = LB.reservations().filter(function (r) {
          return r.customer_id === c.id && r.date >= LB.todayISO() && r.status !== 'cancelled';
        }).length;
        return '<article class="card cust" data-id="' + c.id + '" tabindex="0" role="button" aria-label="Open profile for ' + UI.esc(c.first_name + ' ' + c.last_name) + '">' +
          '<div class="cust-top"><span class="avatar">' + UI.esc(initials.toUpperCase()) + '</span>' +
            '<span class="grow"><b>' + UI.esc(c.first_name + ' ' + c.last_name) + '</b>' +
            '<span class="cell-sub">' + UI.esc(c.email) + '</span></span></div>' +
          '<div class="cust-meta">' +
            '<span>Visits<b>' + c.visits + '</b></span>' +
            '<span>Points<b>' + c.loyalty_points + '</b></span>' +
            '<span>Usual table<b>' + UI.esc(c.favorite_table || '—') + '</b></span>' +
          '</div>' +
          (upcoming ? '<span class="badge badge-success">' + upcoming + ' upcoming</span>' : '<span class="badge badge-muted">No booking yet</span>') +
          '</article>';
      }).join('') : '<div class="empty-state"><p style="margin:0"><strong>No guests match that search.</strong></p><p style="margin:var(--s2) 0 0">Try a surname or an email address.</p></div>';
    }

    function profile(c) {
      var mine = LB.reservations().filter(function (r) { return r.customer_id === c.id; })
        .sort(function (a, b) { return a.date < b.date ? 1 : -1; });
      var upcoming = mine.filter(function (r) { return r.date >= LB.todayISO() && r.status !== 'cancelled'; });
      var past = mine.filter(function (r) { return r.date < LB.todayISO(); });
      var spend = mine.reduce(function (s, r) { return s + (r.spend || 0); }, 0);

      UI.modal({
        title: c.first_name + ' ' + c.last_name,
        wide: true,
        body:
          '<div class="grid-half" style="gap:var(--s5)">' +
            '<dl class="kv">' +
              '<dt>Customer ID</dt><dd class="num">' + UI.esc(c.id) + '</dd>' +
              '<dt>Email</dt><dd style="word-break:break-all">' + UI.esc(c.email) + '</dd>' +
              '<dt>Phone</dt><dd>' + UI.esc(c.phone) + '</dd>' +
              '<dt>Birthdate</dt><dd>' + (c.birthdate ? LB.formatDate(c.birthdate) : '—') + '</dd>' +
              '<dt>Usual table</dt><dd>' + UI.esc(c.favorite_table || '—') + '</dd>' +
            '</dl>' +
            '<dl class="kv">' +
              '<dt>Visits</dt><dd class="num">' + c.visits + '</dd>' +
              '<dt>Loyalty points</dt><dd class="num">' + c.loyalty_points + '</dd>' +
              '<dt>Lifetime spend</dt><dd class="num">' + LB.money(spend) + '</dd>' +
              '<dt>Last visit</dt><dd>' + (past.length ? LB.formatDate(past[0].date, 'long') : 'No visits yet') + '</dd>' +
              '<dt>Bookings on file</dt><dd class="num">' + mine.length + '</dd>' +
            '</dl>' +
          '</div>' +
          (c.notes ? '<div class="card" style="background:var(--brand-soft);border-color:transparent;padding:var(--s4);margin-top:var(--s4)">' +
            '<b style="font-size:.76rem;text-transform:uppercase;letter-spacing:.08em">Guest note</b>' +
            '<p style="margin:6px 0 0;font-size:.9rem">' + UI.esc(c.notes) + '</p></div>' : '') +
          '<h4 style="margin-top:var(--s5)">Upcoming</h4>' +
          (upcoming.length ? list(upcoming) : '<p class="muted">Nothing booked.</p>') +
          '<h4 style="margin-top:var(--s5)">Past bookings</h4>' +
          (past.length ? list(past.slice(0, 8)) : '<p class="muted">No history yet.</p>'),
        footer: '<button class="btn btn-ghost" data-close>Close</button>'
      });

      function list(rows) {
        return '<div class="table-scroll"><table class="data"><tbody>' + rows.map(function (r) {
          var m = LB.STATUS_META[r.status];
          return '<tr><td class="num">' + UI.esc(r.reservation_code) + '</td>' +
            '<td>' + LB.formatDate(r.date, 'medium') + ' · ' + LB.formatTime(r.time) + '</td>' +
            '<td class="num">' + r.guests + ' guests</td>' +
            '<td class="num">' + UI.esc(r.table) + '</td>' +
            '<td><span class="status ' + m.cls + '">' + m.label + '</span></td></tr>';
        }).join('') + '</tbody></table></div>';
      }
    }

    UI.qs('#c-q').addEventListener('input', UI.debounce(function (e) { state.q = e.target.value; render(); }, 180));
    UI.qs('#c-sort').addEventListener('change', function (e) { state.sort = e.target.value; render(); });
    UI.qs('#cust-grid').addEventListener('click', function (e) {
      var card = e.target.closest('[data-id]');
      if (card) profile(LB.customer(card.dataset.id));
    });
    UI.qs('#cust-grid').addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var card = e.target.closest('[data-id]');
      if (card) { e.preventDefault(); profile(LB.customer(card.dataset.id)); }
    });

    render();
  }

  /* ========================================================
     Calendar
     ======================================================== */
  function calendar() {
    var view = 'month';
    var cursor = LB.today();

    function title() {
      if (view === 'month') return LB.MON[cursor.getMonth()] + ' ' + cursor.getFullYear();
      if (view === 'week') {
        var start = startOfWeek(cursor);
        var end = LB.addDays(start, 6);
        return LB.formatDate(LB.iso(start), 'medium') + ' – ' + LB.formatDate(LB.iso(end), 'medium');
      }
      return LB.formatDate(LB.iso(cursor), 'long');
    }
    function startOfWeek(d) { return LB.addDays(d, -((d.getDay() + 6) % 7)); }

    function chip(r) {
      var m = LB.STATUS_META[r.status];
      return '<div class="cal-chip ' + m.cls + '" draggable="true" data-id="' + r.id + '" title="' +
        UI.esc(r.customer_name + ' · ' + r.guests + ' guests · ' + LB.formatTime(r.time)) + '">' +
        LB.formatTime(r.time).replace(' ', '') + ' ' + UI.esc(r.customer_name.split(' ')[0]) + ' (' + r.guests + ')</div>';
    }

    function render() {
      UI.qs('#cal-title').textContent = title();
      UI.qsa('#cal-views button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.view === view)); });
      var host = UI.qs('#cal-body');

      if (view === 'month') {
        var first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
        var start = startOfWeek(first);
        var cells = '';
        for (var i = 0; i < 42; i++) {
          var d = LB.addDays(start, i);
          var ds = LB.iso(d);
          var list = LB.byDate(ds).filter(function (r) { return r.status !== 'cancelled'; })
            .sort(function (a, b) { return a.time < b.time ? -1 : 1; });
          var cls = 'cal-cell' + (d.getMonth() !== cursor.getMonth() ? ' dim' : '') + (ds === LB.todayISO() ? ' today' : '');
          cells += '<div class="' + cls + '" data-date="' + ds + '">' +
            '<span class="cal-date">' + d.getDate() + '</span>' +
            list.slice(0, 3).map(chip).join('') +
            (list.length > 3 ? '<span class="cal-more">+' + (list.length - 3) + ' more</span>' : '') +
            '</div>';
        }
        host.innerHTML = '<div class="cal-grid">' +
          ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(function (d) { return '<div class="cal-dow">' + d + '</div>'; }).join('') +
          cells + '</div>' +
          '<p class="hint" style="margin-top:var(--s3)">Drag a booking onto another day to move it. Click a day to see the full list.</p>';
        wireDnd();
      } else if (view === 'week') {
        var ws = startOfWeek(cursor);
        host.innerHTML = '<div class="cal-week">' + Array.from({ length: 7 }, function (_, i) {
          var d = LB.addDays(ws, i);
          var ds = LB.iso(d);
          var list = LB.byDate(ds).filter(function (r) { return r.status !== 'cancelled'; })
            .sort(function (a, b) { return a.time < b.time ? -1 : 1; });
          return '<div class="cal-week-col" data-date="' + ds + '">' +
            '<h4>' + LB.DOW[d.getDay()].slice(0, 3) + ' ' + d.getDate() + '</h4>' +
            (list.length ? list.map(chip).join('') : '<span class="cal-more" style="text-align:center">—</span>') + '</div>';
        }).join('') + '</div>';
        wireDnd();
      } else {
        var ds2 = LB.iso(cursor);
        var day = LB.byDate(ds2).sort(function (a, b) { return a.time < b.time ? -1 : 1; });
        host.innerHTML = day.length ? '<div class="cal-list">' + day.map(function (r) {
          var m = LB.STATUS_META[r.status];
          return '<div class="cal-row"><time>' + LB.formatTime(r.time) + '</time><div>' +
            '<b>' + UI.esc(r.customer_name) + '</b> · ' + r.guests + ' guests · table ' + UI.esc(r.table) +
            '<span class="cell-sub num">' + UI.esc(r.reservation_code) + ' · ' + UI.esc(r.source) + '</span>' +
            '<span class="status ' + m.cls + '" style="margin-top:6px">' + m.label + '</span>' +
            (r.special_requests ? '<p class="hint" style="margin:6px 0 0">' + UI.esc(r.special_requests) + '</p>' : '') +
            '</div></div>';
        }).join('') + '</div>' :
          '<div class="empty-state"><p style="margin:0"><strong>Nothing booked on this day.</strong></p>' +
          '<p style="margin:var(--s2) 0 0">Use New booking in the top bar to add one.</p></div>';
      }
    }

    function wireDnd() {
      UI.qsa('.cal-chip').forEach(function (c) {
        c.addEventListener('dragstart', function (e) { e.dataTransfer.setData('text/plain', c.dataset.id); });
      });
      UI.qsa('[data-date]').forEach(function (cell) {
        cell.addEventListener('dragover', function (e) { e.preventDefault(); cell.classList.add('drop-target'); });
        cell.addEventListener('dragleave', function () { cell.classList.remove('drop-target'); });
        cell.addEventListener('drop', function (e) {
          e.preventDefault();
          cell.classList.remove('drop-target');
          var id = e.dataTransfer.getData('text/plain');
          var rec = LB.reservation(id);
          if (!rec || rec.date === cell.dataset.date) return;
          LB.updateReservation(id, { date: cell.dataset.date });
          UI.toast(rec.reservation_code + ' moved to ' + LB.formatDate(cell.dataset.date, 'long') + '.', 'success');
          render();
        });
        cell.addEventListener('click', function (e) {
          if (e.target.closest('.cal-chip')) return;
          view = 'day';
          cursor = LB.parse(cell.dataset.date);
          render();
        });
      });
    }

    UI.qs('#cal-views').addEventListener('click', function (e) {
      var b = e.target.closest('[data-view]');
      if (b) { view = b.dataset.view; render(); }
    });
    UI.qs('#cal-prev').addEventListener('click', function () {
      cursor = view === 'month' ? new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1) : LB.addDays(cursor, view === 'week' ? -7 : -1);
      render();
    });
    UI.qs('#cal-next').addEventListener('click', function () {
      cursor = view === 'month' ? new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1) : LB.addDays(cursor, view === 'week' ? 7 : 1);
      render();
    });
    UI.qs('#cal-today').addEventListener('click', function () { cursor = LB.today(); render(); });

    render();
  }

  /* ========================================================
     Reports
     ======================================================== */
  function reports() {
    var r = LB.rates();
    var d30 = LB.seriesLastDays(30);
    var d7 = LB.seriesLastDays(7);

    UI.qs('#report-kpis').innerHTML = [
      ['Occupancy rate', r.occupancy.toFixed(1) + '%', 'seats filled vs capacity'],
      ['Cancellation rate', r.cancellation.toFixed(1) + '%', 'of all bookings'],
      ['No-show rate', r.noShow.toFixed(1) + '%', 'of all bookings'],
      ['Repeat customers', r.repeat.toFixed(0) + '%', 'have visited more than once'],
      ['Average party', r.avgGuests.toFixed(1), 'guests per booking'],
      ['Average spend', LB.money(r.avgSpend), 'per completed booking']
    ].map(function (k) {
      return '<article class="card kpi"><span class="kpi-label">' + k[0] + '</span>' +
        '<span class="kpi-value">' + k[1] + '</span><span class="kpi-delta faint">' + k[2] + '</span></article>';
    }).join('');

    chart('r-daily', {
      type: 'line',
      data: {
        labels: d30.map(function (x) { return x.label; }),
        datasets: [{ label: 'Reservations', data: d30.map(function (x) { return x.reservations; }), borderColor: css('--brand'), backgroundColor: 'rgba(139,94,60,.10)', fill: true, tension: .3, pointRadius: 0, borderWidth: 2 }]
      },
      options: lineOpts()
    });

    var weeks = [0, 1, 2, 3].map(function (i) {
      var slice = d30.slice(Math.max(0, d30.length - (4 - i) * 7), d30.length - (3 - i) * 7);
      return { label: 'Week ' + (i + 1), revenue: slice.reduce(function (s, x) { return s + x.revenue; }, 0) };
    });
    chart('r-weekly', {
      type: 'bar',
      data: { labels: weeks.map(function (w) { return w.label; }), datasets: [{ data: weeks.map(function (w) { return w.revenue; }), backgroundColor: css('--secondary'), borderRadius: 8, maxBarThickness: 60 }] },
      options: lineOpts({ plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (c) { return LB.money(c.parsed.y); } } } } })
    });

    chart('r-monthly', {
      type: 'line',
      data: { labels: d30.map(function (x) { return x.label; }), datasets: [{ data: d30.map(function (x) { return x.revenue; }), borderColor: css('--accent'), backgroundColor: 'rgba(233,196,106,.20)', fill: true, tension: .3, pointRadius: 0, borderWidth: 2 }] },
      options: lineOpts({ plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (c) { return LB.money(c.parsed.y); } } } } })
    });

    var hours = LB.busyHours();
    chart('r-hours', {
      type: 'bar',
      data: { labels: hours.map(function (h) { return h.time; }), datasets: [{ data: hours.map(function (h) { return h.covers; }), backgroundColor: css('--brand'), borderRadius: 5, maxBarThickness: 24 }] },
      options: lineOpts()
    });

    chart('r-guests', {
      type: 'line',
      data: { labels: d7.map(function (x) { return x.label; }), datasets: [{ data: d7.map(function (x) { return x.reservations ? +(x.covers / x.reservations).toFixed(1) : 0; }), borderColor: css('--info'), tension: .35, pointRadius: 4, borderWidth: 2 }] },
      options: lineOpts()
    });

    var cats = LB.categoryPopularity();
    chart('r-categories', {
      type: 'bar',
      data: { labels: cats.map(function (c) { return c.category; }), datasets: [{ data: cats.map(function (c) { return c.orders; }), backgroundColor: css('--secondary'), borderRadius: 5, maxBarThickness: 22 }] },
      options: lineOpts({ indexAxis: 'y' })
    });

    var src = LB.sourceSplit();
    chart('r-sources', {
      type: 'doughnut',
      data: {
        labels: src.map(function (s) { return s.source; }),
        datasets: [{ data: src.map(function (s) { return s.count; }), backgroundColor: [css('--brand'), css('--secondary'), css('--accent'), css('--info')], borderWidth: 0 }]
      },
      options: { responsive: true, maintainAspectRatio: false, cutout: '62%', plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 14 } } } }
    });

    var pop = LB.popularTables(8);
    chart('r-tables', {
      type: 'bar',
      data: { labels: pop.map(function (p) { return p.table; }), datasets: [{ data: pop.map(function (p) { return p.count; }), backgroundColor: css('--brand'), borderRadius: 5, maxBarThickness: 22 }] },
      options: lineOpts()
    });

    UI.qs('#r-print').addEventListener('click', function () { window.print(); });
  }

  /* ========================================================
     Settings
     ======================================================== */
  function settings() {
    var s = LB.settings();
    var tabs = [
      ['restaurant', 'Restaurant'],
      ['hours', 'Hours & holidays'],
      ['tables', 'Table configuration'],
      ['email', 'Email templates'],
      ['appearance', 'Appearance'],
      ['notifications', 'Notifications'],
      ['data', 'Demo data']
    ];

    UI.qs('#set-tabs').innerHTML = tabs.map(function (t, i) {
      return '<button role="tab" data-tab="' + t[0] + '" aria-selected="' + (i === 0) + '">' + t[1] + '</button>';
    }).join('');

    function panel(id) {
      s = LB.settings();
      if (id === 'restaurant') return '' +
        '<h3>Restaurant information</h3>' +
        '<div class="grid-2">' +
          field('set-name', 'Restaurant name', s.name) +
          field('set-tagline', 'Tagline', s.tagline) +
        '</div>' +
        field('set-address', 'Address', s.address) +
        '<div class="grid-2">' + field('set-phone', 'Phone', s.phone) + field('set-email', 'Email', s.email) + '</div>' +
        '<div class="grid-2">' +
          '<div class="field"><label for="set-turn">Table turn time (minutes)</label><input class="control" id="set-turn" type="number" min="45" max="240" value="' + s.turnMinutes + '"></div>' +
          '<div class="field"><label for="set-max">Largest party bookable online</label><input class="control" id="set-max" type="number" min="2" max="20" value="' + s.maxGuestsOnline + '"></div>' +
        '</div>' +
        '<button class="btn" data-save="restaurant">Save changes</button>';

      if (id === 'hours') return '' +
        '<h3>Opening hours</h3>' +
        '<p class="muted">Service hours drive which slots guests can choose on the booking form.</p>' +
        '<table class="data" style="min-width:0"><tbody>' +
          [1, 2, 3, 4, 5, 6, 0].map(function (d) {
            return '<tr><td style="width:140px">' + LB.DOW[d] + '</td><td class="num">' + LB.HOURS[d].label + '</td>' +
              '<td style="text-align:right">' + (LB.HOURS[d].open ? '<span class="badge badge-success">Open</span>' : '<span class="badge badge-muted">Closed</span>') + '</td></tr>';
          }).join('') +
        '</tbody></table>' +
        '<h3 style="margin-top:var(--s6)">Holiday schedule</h3>' +
        '<table class="data" style="min-width:0"><tbody id="holiday-body">' +
          s.holidays.map(function (h, i) {
            return '<tr><td class="num" style="width:140px">' + h.date + '</td><td>' + UI.esc(h.label) + '</td>' +
              '<td style="text-align:right"><button class="icon-btn danger" data-holiday="' + i + '">' + UI.icon('trash', 15) + '</button></td></tr>';
          }).join('') +
        '</tbody></table>' +
        '<div class="row wrap" style="margin-top:var(--s4)">' +
          '<input class="control" id="hol-date" type="date" style="max-width:180px">' +
          '<input class="control" id="hol-label" placeholder="Reason, e.g. Staff training" style="max-width:280px">' +
          '<button class="btn btn-sm" data-add-holiday>Add closure</button>' +
        '</div>';

      if (id === 'tables') return '' +
        '<h3>Table configuration</h3>' +
        '<p class="muted">' + LB.tables().length + ' tables · ' +
          LB.tables().reduce(function (x, t) { return x + t.capacity; }, 0) + ' seats total.</p>' +
        '<div class="table-scroll"><table class="data"><thead><tr><th>Table</th><th>Capacity</th><th>Area</th><th>Status</th></tr></thead><tbody>' +
          LB.tables().map(function (t) {
            return '<tr><td class="cell-strong num">' + t.table_number + '</td><td class="num">' + t.capacity + '</td>' +
              '<td>' + UI.esc(t.location) + '</td><td><span class="badge badge-muted badge-plain">' + t.status + '</span></td></tr>';
          }).join('') +
        '</tbody></table></div>' +
        '<p class="hint">Edit live status from the Tables page — this view is the master configuration.</p>';

      if (id === 'email') return '' +
        '<h3>Email templates</h3>' +
        '<p class="muted">Use <code>{{name}}</code>, <code>{{date}}</code>, <code>{{time}}</code>, <code>{{guests}}</code> and <code>{{code}}</code>.</p>' +
        area('tpl-confirmation', 'Booking confirmation', s.emailTemplates.confirmation) +
        area('tpl-reminder', 'Day-before reminder', s.emailTemplates.reminder) +
        area('tpl-cancellation', 'Cancellation notice', s.emailTemplates.cancellation) +
        '<button class="btn" data-save="email">Save templates</button>';

      if (id === 'appearance') return '' +
        '<h3>Appearance</h3>' +
        '<div class="field"><label for="set-theme">Theme</label><select class="control" id="set-theme">' +
          '<option value="light"' + (s.theme === 'light' ? ' selected' : '') + '>Light</option>' +
          '<option value="dark"' + (s.theme === 'dark' ? ' selected' : '') + '>Dark</option></select></div>' +
        '<div class="field"><label for="set-lang">Language</label><select class="control" id="set-lang">' +
          ['en|English', 'th|ไทย (Thai)', 'my|မြန်မာ (Burmese)'].map(function (o) {
            var p = o.split('|');
            return '<option value="' + p[0] + '"' + (s.language === p[0] ? ' selected' : '') + '>' + p[1] + '</option>';
          }).join('') + '</select>' +
          '<span class="hint">Language is stored with the restaurant profile; translation files are not part of this demo.</span></div>' +
        '<button class="btn" data-save="appearance">Save appearance</button>';

      if (id === 'notifications') return '' +
        '<h3>Notifications</h3>' +
        [['email', 'Email the guest on every status change'],
         ['sms', 'Send an SMS reminder the day before'],
         ['dailyDigest', 'Email the manager a service digest at 07:00'],
         ['largeParty', 'Alert the floor team for parties of eight or more']]
        .map(function (n) {
          return '<label class="switch"><span>' + n[1] + '</span>' +
            '<input type="checkbox" data-notify="' + n[0] + '"' + (s.notify[n[0]] ? ' checked' : '') + '></label>';
        }).join('');

      return '' +
        '<h3>Demo data</h3>' +
        '<p class="muted">This build stores everything in your browser. Nothing leaves this machine.</p>' +
        '<div class="row wrap" style="margin-top:var(--s4)">' +
          '<button class="btn btn-ghost" data-export-json>' + UI.icon('download', 16) + 'Download data as JSON</button>' +
          '<button class="btn btn-danger" data-reset>Reset to seed data</button>' +
        '</div>' +
        '<p class="hint">Reset regenerates 43 days of bookings around today, so the dashboard always has something to show.</p>';
    }

    function field(id, label, value) {
      return '<div class="field"><label for="' + id + '">' + label + '</label>' +
        '<input class="control" id="' + id + '" value="' + UI.esc(value) + '"></div>';
    }
    function area(id, label, value) {
      return '<div class="field"><label for="' + id + '">' + label + '</label>' +
        '<textarea class="control" id="' + id + '">' + UI.esc(value) + '</textarea></div>';
    }

    function show(id) {
      UI.qs('#set-panel').innerHTML = panel(id);
      UI.qsa('#set-tabs button').forEach(function (b) { b.setAttribute('aria-selected', String(b.dataset.tab === id)); });
    }

    UI.qs('#set-tabs').addEventListener('click', function (e) {
      var b = e.target.closest('[data-tab]');
      if (b) show(b.dataset.tab);
    });

    UI.qs('#set-panel').addEventListener('click', function (e) {
      var save = e.target.closest('[data-save]');
      if (save) {
        var which = save.dataset.save;
        if (which === 'restaurant') {
          LB.saveSettings({
            name: UI.qs('#set-name').value.trim(),
            tagline: UI.qs('#set-tagline').value.trim(),
            address: UI.qs('#set-address').value.trim(),
            phone: UI.qs('#set-phone').value.trim(),
            email: UI.qs('#set-email').value.trim(),
            turnMinutes: Number(UI.qs('#set-turn').value),
            maxGuestsOnline: Number(UI.qs('#set-max').value)
          });
        } else if (which === 'email') {
          LB.saveSettings({ emailTemplates: {
            confirmation: UI.qs('#tpl-confirmation').value,
            reminder: UI.qs('#tpl-reminder').value,
            cancellation: UI.qs('#tpl-cancellation').value
          }});
        } else if (which === 'appearance') {
          var theme = UI.qs('#set-theme').value;
          LB.saveSettings({ theme: theme, language: UI.qs('#set-lang').value });
          UI.applyTheme(theme);
        }
        UI.toast('Settings saved.', 'success');
        return;
      }

      if (e.target.closest('[data-add-holiday]')) {
        var date = UI.qs('#hol-date').value;
        var label = UI.qs('#hol-label').value.trim();
        if (!date || !label) { UI.toast('Add both a date and a reason.', 'error'); return; }
        var hs = LB.settings().holidays.concat([{ date: date, label: label }]);
        LB.saveSettings({ holidays: hs });
        show('hours');
        UI.toast('Closure added.', 'success');
        return;
      }

      var del = e.target.closest('[data-holiday]');
      if (del) {
        var idx = Number(del.dataset.holiday);
        var rest = LB.settings().holidays.filter(function (_, i) { return i !== idx; });
        LB.saveSettings({ holidays: rest });
        show('hours');
        return;
      }

      if (e.target.closest('[data-export-json]')) {
        var url = URL.createObjectURL(new Blob([JSON.stringify(LB.load(), null, 2)], { type: 'application/json' }));
        var a = document.createElement('a');
        a.href = url; a.download = 'luna-bistro-data.json'; a.click();
        URL.revokeObjectURL(url);
        UI.toast('Data exported.', 'success');
        return;
      }

      if (e.target.closest('[data-reset]')) {
        UI.confirm({
          title: 'Reset all demo data?',
          message: 'Every booking, guest and table status returns to the seeded state. Anything you created here is lost.',
          confirmLabel: 'Reset data', danger: true
        }, function () { LB.reset(); window.location.reload(); });
      }
    });

    UI.qs('#set-panel').addEventListener('change', function (e) {
      var n = e.target.closest('[data-notify]');
      if (!n) return;
      var notify = Object.assign({}, LB.settings().notify);
      notify[n.dataset.notify] = n.checked;
      LB.saveSettings({ notify: notify });
      UI.toast('Notification preference saved.', 'success');
    });

    show('restaurant');
  }

  /* ========================================================
     Login
     ======================================================== */
  function login() {
    if (LB.auth.user()) { window.location.href = 'index.html'; return; }
    var form = UI.qs('#login-form');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = UI.qs('#l-email').value.trim();
      var pass = UI.qs('#l-pass').value;
      if (LB.auth.login(email, pass)) {
        window.location.href = 'index.html';
      } else {
        UI.toast('That email and password combination does not match a staff account.', 'error');
        UI.qs('#l-pass').value = '';
        UI.qs('#l-pass').focus();
      }
    });
    UI.qs('#fill-demo').addEventListener('click', function () {
      UI.qs('#l-email').value = 'manager@lunabistro.example';
      UI.qs('#l-pass').value = 'luna2026';
    });
  }

  /* ========================================================
     Boot
     ======================================================== */
  document.addEventListener('DOMContentLoaded', function () {
    LB.load();
    UI.qsa('[data-icon]').forEach(function (n) { n.innerHTML = UI.icon(n.dataset.icon, Number(n.dataset.size) || 20); });

    if (page === 'login') { UI.applyTheme(LB.settings().theme); login(); return; }
    if (!shell()) return;

    if (page === 'dashboard') dashboard();
    if (page === 'reservations') reservations();
    if (page === 'tables') tablesPage();
    if (page === 'customers') customers();
    if (page === 'calendar') calendar();
    if (page === 'reports') reports();
    if (page === 'settings') settings();
  });
})();
