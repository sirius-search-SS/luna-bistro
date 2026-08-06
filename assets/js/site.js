/* ============================================================
   Luna Bistro — customer website (site.js)
   ============================================================ */
/* global window, document, LB, UI */

(function () {
  'use strict';

  var page = document.body.dataset.page;

  /* --------------------------------------------------------
     Shared chrome
     -------------------------------------------------------- */
  function chrome() {
    UI.applyTheme(LB.settings().theme);

    var toggle = UI.qs('.nav-toggle');
    var links = UI.qs('.nav-links');
    if (toggle && links) {
      var isMobile = function () { return window.matchMedia('(max-width: 900px)').matches; };
      if (isMobile()) links.hidden = true;
      toggle.addEventListener('click', function () {
        links.hidden = !links.hidden;
        toggle.setAttribute('aria-expanded', String(!links.hidden));
      });
      window.addEventListener('resize', UI.debounce(function () {
        links.hidden = isMobile() ? true : false;
        toggle.setAttribute('aria-expanded', 'false');
      }, 150));
    }

    UI.qsa('[data-year]').forEach(function (n) { n.textContent = new Date().getFullYear(); });
    UI.qsa('[data-icon]').forEach(function (n) { n.innerHTML = UI.icon(n.dataset.icon, Number(n.dataset.size) || 20); });
    UI.reveal();

    var news = UI.qs('#newsletter-form');
    if (news) {
      news.addEventListener('submit', function (e) {
        e.preventDefault();
        var input = news.querySelector('input');
        if (!input.value || input.value.indexOf('@') < 0) { UI.toast('Enter an email address we can reach you at.', 'error'); return; }
        UI.toast('You are on the list. We send one email a month, no more.', 'success');
        news.reset();
      });
    }
  }

  function dishCard(m) {
    return '<article class="card dish reveal">' +
      '<div class="ph ph-tone-' + m.tone + '" role="img" aria-label="' + UI.esc(m.item) + '">' +
        (m.popular ? '<span class="ribbon">Most ordered</span>' : m.isNew ? '<span class="ribbon">New</span>' : '') +
        UI.icon(m.category === 'Drinks' ? 'wine' : 'utensils', 34) +
      '</div>' +
      '<div class="dish-body">' +
        '<div class="dish-title"><h3>' + UI.esc(m.item) + '</h3><span class="dish-price">' + LB.money(m.price) + '</span></div>' +
        '<p>' + UI.esc(m.description) + '</p>' +
        '<div class="dish-tags">' + m.dietary.map(function (d) {
          return '<span class="dietary" data-diet="' + d + '">' + d.replace('-', ' ') + '</span>';
        }).join('') + '</div>' +
      '</div></article>';
  }

  function eventCard(ev) {
    var left = ev.seats - ev.booked;
    var pct = Math.round((ev.booked / ev.seats) * 100);
    return '<article class="card event reveal">' +
      '<div class="ph ph-tone-' + ev.tone + '" role="img" aria-label="' + UI.esc(ev.title) + '">' + UI.icon(ev.title.indexOf('Music') > -1 ? 'music' : ev.title.indexOf('Wine') > -1 ? 'wine' : 'utensils', 34) + '</div>' +
      '<div class="event-body">' +
        '<span class="event-date">' + LB.formatDate(ev.date, 'medium') + ' · ' + LB.formatTime(ev.time) + '</span>' +
        '<h3>' + UI.esc(ev.title) + '</h3>' +
        '<p>' + UI.esc(ev.description) + '</p>' +
        '<div class="seats"><span class="num" style="font-size:.82rem;color:var(--text-muted)">' + left + ' of ' + ev.seats + ' seats left</span>' +
          '<span class="seat-bar" aria-hidden="true"><i style="width:' + pct + '%"></i></span></div>' +
        '<a class="btn btn-soft btn-sm" href="reservation.html?date=' + ev.date + '&time=' + ev.time + '">Reserve for this night</a>' +
      '</div></article>';
  }

  /* --------------------------------------------------------
     Home
     -------------------------------------------------------- */
  function home() {
    var featured = LB.MENU.filter(function (m) { return m.popular; }).slice(0, 6);
    UI.qs('#featured-grid').innerHTML = featured.map(dishCard).join('');

    UI.qs('#value-grid').innerHTML = LB.VALUES.map(function (v) {
      return '<div class="value reveal"><h3>' + UI.esc(v.title) + '</h3><p>' + UI.esc(v.body) + '</p></div>';
    }).join('');

    UI.qs('#reviews-grid').innerHTML = LB.REVIEWS.slice(0, 3).map(function (r) {
      var initials = r.name.split(' ').map(function (p) { return p[0]; }).join('');
      return '<article class="card review reveal">' +
        '<div class="stars" aria-label="' + r.rating + ' out of 5">' + '★★★★★'.slice(0, r.rating) + '<span style="color:var(--line-strong)">' + '★★★★★'.slice(0, 5 - r.rating) + '</span></div>' +
        '<blockquote>' + UI.esc(r.text) + '</blockquote>' +
        '<footer><span class="avatar">' + UI.esc(initials) + '</span><span><b style="display:block;font-size:.9rem">' + UI.esc(r.name) + '</b>' +
        '<span class="faint" style="font-size:.8rem">' + UI.esc(r.role) + '</span></span></footer></article>';
    }).join('');

    UI.qs('#events-preview').innerHTML = LB.events().slice(0, 3).map(eventCard).join('');

    /* Signature panel: tonight's live availability */
    var tonight = LB.todayISO();
    var slots = LB.slotsFor(tonight).filter(function (s) { return s >= '17:00'; });
    if (!slots.length) {
      tonight = LB.iso(LB.addDays(LB.today(), 1));
      slots = LB.slotsFor(tonight).filter(function (s) { return s >= '17:00'; });
    }
    UI.qs('#service-date').textContent = LB.relative(tonight) + ' · ' + LB.formatDate(tonight, 'medium');
    UI.qs('#slot-grid').innerHTML = slots.slice(0, 8).map(function (s) {
      var left = LB.seatsLeft(tonight, s);
      var state = left === 0 ? 'full' : left < 12 ? 'few' : 'open';
      var label = left === 0 ? 'Full' : left < 12 ? left + ' seats' : 'Open';
      return '<a class="slot" data-state="' + state + '" href="reservation.html?date=' + tonight + '&time=' + s + '">' +
        '<b>' + LB.formatTime(s).replace(' ', '') + '</b><span>' + label + '</span></a>';
    }).join('');

    var covers = LB.seriesLastDays(30).reduce(function (s, d) { return s + d.covers; }, 0);
    UI.qs('#stat-covers').textContent = covers.toLocaleString('en-US');
  }

  /* --------------------------------------------------------
     Menu
     -------------------------------------------------------- */
  function menu() {
    var state = { category: 'All', diets: [], sort: 'popular', q: '' };
    var listEl = UI.qs('#menu-list');

    UI.qs('#cat-filters').innerHTML = ['All'].concat(LB.CATEGORIES).map(function (c) {
      return '<button class="chip' + (c === 'All' ? ' active' : '') + '" data-cat="' + UI.esc(c) + '">' + UI.esc(c) + '</button>';
    }).join('');

    UI.qs('#diet-filters').innerHTML = ['vegetarian', 'vegan', 'spicy', 'gluten-free'].map(function (d) {
      return '<button class="chip" aria-pressed="false" data-diet="' + d + '">' + d.replace('-', ' ') + '</button>';
    }).join('');

    function apply() {
      var items = LB.MENU.slice();
      if (state.category !== 'All') items = items.filter(function (m) { return m.category === state.category; });
      if (state.diets.length) {
        items = items.filter(function (m) {
          return state.diets.every(function (d) { return m.dietary.indexOf(d) > -1; });
        });
      }
      if (state.q) {
        var q = state.q.toLowerCase();
        items = items.filter(function (m) {
          return m.item.toLowerCase().indexOf(q) > -1 || m.description.toLowerCase().indexOf(q) > -1;
        });
      }
      if (state.sort === 'price-asc') items.sort(function (a, b) { return a.price - b.price; });
      else if (state.sort === 'price-desc') items.sort(function (a, b) { return b.price - a.price; });
      else if (state.sort === 'new') items.sort(function (a, b) { return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0); });
      else items.sort(function (a, b) { return (b.popular ? 1 : 0) - (a.popular ? 1 : 0); });

      UI.qs('#result-count').textContent = items.length + (items.length === 1 ? ' dish' : ' dishes');

      if (!items.length) {
        listEl.innerHTML = '<div class="empty-state"><p><strong>Nothing matches those filters.</strong></p>' +
          '<p>Clear a filter or search for something else — the full menu is 31 dishes.</p>' +
          '<button class="btn btn-ghost btn-sm" id="clear-filters">Clear all filters</button></div>';
        UI.qs('#clear-filters').addEventListener('click', function () {
          state = { category: 'All', diets: [], sort: 'popular', q: '' };
          UI.qsa('#cat-filters .chip').forEach(function (c) { c.classList.toggle('active', c.dataset.cat === 'All'); });
          UI.qsa('#diet-filters .chip').forEach(function (c) { c.setAttribute('aria-pressed', 'false'); });
          UI.qs('#menu-search').value = '';
          UI.qs('#menu-sort').value = 'popular';
          apply();
        });
        return;
      }

      var grouped = {};
      items.forEach(function (m) { (grouped[m.category] = grouped[m.category] || []).push(m); });
      listEl.innerHTML = LB.CATEGORIES.filter(function (c) { return grouped[c]; }).map(function (c) {
        return '<section class="menu-cat"><h2>' + UI.esc(c) + ' <span>' + grouped[c].length + ' dishes</span></h2>' +
          '<div class="card-grid">' + grouped[c].map(dishCard).join('') + '</div></section>';
      }).join('');
      UI.reveal();
    }

    UI.qs('#cat-filters').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-cat]');
      if (!btn) return;
      state.category = btn.dataset.cat;
      UI.qsa('#cat-filters .chip').forEach(function (c) { c.classList.toggle('active', c === btn); });
      apply();
    });
    UI.qs('#diet-filters').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-diet]');
      if (!btn) return;
      var d = btn.dataset.diet, on = btn.getAttribute('aria-pressed') === 'true';
      btn.setAttribute('aria-pressed', String(!on));
      state.diets = on ? state.diets.filter(function (x) { return x !== d; }) : state.diets.concat([d]);
      apply();
    });
    UI.qs('#menu-sort').addEventListener('change', function (e) { state.sort = e.target.value; apply(); });
    UI.qs('#menu-search').addEventListener('input', UI.debounce(function (e) { state.q = e.target.value; apply(); }, 180));

    apply();
  }

  /* --------------------------------------------------------
     Reservation
     -------------------------------------------------------- */
  function reservation() {
    var form = UI.qs('#booking-form');
    var params = new URLSearchParams(window.location.search);
    var dateInput = UI.qs('#f-date');
    var timeSelect = UI.qs('#f-time');
    var guestSelect = UI.qs('#f-guests');

    var min = LB.todayISO();
    var max = LB.iso(LB.addDays(LB.today(), 90));
    dateInput.min = min;
    dateInput.max = max;
    dateInput.value = params.get('date') || min;

    guestSelect.innerHTML = Array.from({ length: LB.settings().maxGuestsOnline }, function (_, i) {
      var n = i + 1;
      return '<option value="' + n + '">' + n + (n === 1 ? ' guest' : ' guests') + '</option>';
    }).join('') + '<option value="13">13+ — we will call you</option>';
    guestSelect.value = params.get('guests') || '2';

    UI.qs('#f-seating').innerHTML = LB.SEATING.map(function (s) { return '<option>' + s + '</option>'; }).join('');
    UI.qs('#f-occasion').innerHTML = LB.OCCASIONS.map(function (s) { return '<option>' + s + '</option>'; }).join('');

    function refreshSlots() {
      var d = dateInput.value;
      var slots = LB.slotsFor(d);
      var closed = !slots.length;
      UI.qs('#closed-note').hidden = !closed;
      if (closed) {
        timeSelect.innerHTML = '<option value="">Closed on this day</option>';
        timeSelect.disabled = true;
      } else {
        timeSelect.disabled = false;
        timeSelect.innerHTML = slots.map(function (s) {
          var left = LB.seatsLeft(d, s);
          var suffix = left === 0 ? ' — full' : left < 12 ? ' — ' + left + ' seats left' : '';
          return '<option value="' + s + '"' + (left === 0 ? ' disabled' : '') + '>' + LB.formatTime(s) + suffix + '</option>';
        }).join('');
        var wanted = params.get('time');
        if (wanted && slots.indexOf(wanted) > -1) { timeSelect.value = wanted; params.delete('time'); }
      }
      summary();
    }

    function summary() {
      var d = dateInput.value;
      UI.qs('#s-date').textContent = d ? LB.formatDate(d, 'long') : '—';
      UI.qs('#s-time').textContent = timeSelect.value ? LB.formatTime(timeSelect.value) : '—';
      UI.qs('#s-guests').textContent = guestSelect.value + (guestSelect.value === '1' ? ' guest' : ' guests');
      UI.qs('#s-seating').textContent = UI.qs('#f-seating').value;
      UI.qs('#s-occasion').textContent = UI.qs('#f-occasion').value;
      var hours = LB.HOURS[LB.parse(d).getDay()];
      UI.qs('#s-hours').textContent = hours.label;

      var filled = ['f-name', 'f-email', 'f-phone'].filter(function (id) { return UI.qs('#' + id).value.trim(); }).length;
      UI.qsa('.step')[0].classList.toggle('done', !!(d && timeSelect.value));
      UI.qsa('.step')[1].classList.toggle('done', filled === 3);
    }

    dateInput.addEventListener('change', refreshSlots);
    form.addEventListener('input', summary);
    form.addEventListener('change', summary);

    function fail(id, message) {
      var field = UI.qs('#' + id).closest('.field');
      field.classList.add('invalid');
      field.querySelector('.error-text').textContent = message;
      UI.qs('#' + id).setAttribute('aria-invalid', 'true');
    }
    function clearErrors() {
      UI.qsa('.field.invalid').forEach(function (f) {
        f.classList.remove('invalid');
        var c = f.querySelector('.control');
        if (c) c.removeAttribute('aria-invalid');
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearErrors();
      var ok = true;

      var name = UI.qs('#f-name').value.trim();
      var email = UI.qs('#f-email').value.trim();
      var phone = UI.qs('#f-phone').value.trim();
      var date = dateInput.value;
      var time = timeSelect.value;
      var guests = Number(guestSelect.value);

      if (name.length < 2) { fail('f-name', 'Tell us the name the table is under.'); ok = false; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { fail('f-email', 'Use a full email address, like you@example.com.'); ok = false; }
      if (phone.replace(/\D/g, '').length < 7) { fail('f-phone', 'We need a number we can reach you on if plans change.'); ok = false; }
      if (!date) { fail('f-date', 'Choose a date.'); ok = false; }
      else if (date < LB.todayISO()) { fail('f-date', 'Pick today or a date in the future.'); ok = false; }
      else if (!LB.slotsFor(date).length) { fail('f-date', 'We are closed on Mondays. Try another day.'); ok = false; }
      if (!time) { fail('f-time', 'Choose a service time.'); ok = false; }
      if (guests > LB.settings().maxGuestsOnline) {
        fail('f-guests', 'Parties above ' + LB.settings().maxGuestsOnline + ' are arranged by phone — call ' + LB.settings().phone + '.');
        ok = false;
      }
      if (!UI.qs('#f-terms').checked) { fail('f-terms', 'Confirm you can make the booking window.'); ok = false; }

      if (!ok) {
        UI.toast('Check the highlighted fields and try again.', 'error');
        var first = UI.qs('.field.invalid .control');
        if (first) first.focus();
        return;
      }

      var rec = LB.createReservation({
        name: name, email: email, phone: phone,
        date: date, time: time, guests: guests,
        seating: UI.qs('#f-seating').value,
        occasion: UI.qs('#f-occasion').value,
        special_requests: UI.qs('#f-requests').value.trim(),
        source: 'Website'
      });

      showConfirmation(rec);
    });

    function showConfirmation(rec) {
      var tpl = LB.settings().emailTemplates.confirmation
        .replace('{{name}}', rec.customer_name)
        .replace('{{date}}', LB.formatDate(rec.date, 'long'))
        .replace('{{time}}', LB.formatTime(rec.time))
        .replace('{{guests}}', rec.guests + (rec.guests === 1 ? ' guest' : ' guests'))
        .replace('{{code}}', rec.reservation_code);

      UI.qs('#booking-stage').innerHTML =
        '<div class="card confirmation">' +
          '<div class="check-mark">' + UI.icon('check', 30) + '</div>' +
          '<h2 style="margin-bottom:var(--s2)">Your table is booked</h2>' +
          '<p class="muted">Keep this reference — quote it if you need to change anything.</p>' +
          '<div class="confirm-code">' + UI.esc(rec.reservation_code) + '</div>' +
          '<dl class="kv" style="max-width:380px;margin:var(--s5) auto 0;text-align:left">' +
            '<dt>Name</dt><dd>' + UI.esc(rec.customer_name) + '</dd>' +
            '<dt>When</dt><dd>' + LB.formatDate(rec.date, 'long') + ' at ' + LB.formatTime(rec.time) + '</dd>' +
            '<dt>Party</dt><dd>' + rec.guests + (rec.guests === 1 ? ' guest' : ' guests') + '</dd>' +
            '<dt>Table</dt><dd>' + UI.esc(rec.table) + ' · ' + UI.esc(rec.seating) + '</dd>' +
            (rec.occasion !== 'None' ? '<dt>Occasion</dt><dd>' + UI.esc(rec.occasion) + '</dd>' : '') +
            (rec.special_requests ? '<dt>Notes</dt><dd>' + UI.esc(rec.special_requests) + '</dd>' : '') +
          '</dl>' +
          '<div class="card" style="background:var(--surface-alt);text-align:left;padding:var(--s4);max-width:520px;margin:var(--s6) auto 0">' +
            '<b style="font-size:.78rem;text-transform:uppercase;letter-spacing:.08em;color:var(--text-faint)">Confirmation email (simulated)</b>' +
            '<p class="muted" style="margin:var(--s2) 0 0;font-size:.9rem">' + UI.esc(tpl) + '</p>' +
          '</div>' +
          '<div class="row" style="justify-content:center;margin-top:var(--s6)">' +
            '<a class="btn" href="menu.html">Look at the menu</a>' +
            '<a class="btn btn-ghost" href="reservation.html">Book another table</a>' +
          '</div>' +
          '<p class="hint" style="margin-top:var(--s5)">This booking is now visible in the staff dashboard under Reservations.</p>' +
        '</div>';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      UI.toast('Booked. Reference ' + rec.reservation_code, 'success');
    }

    refreshSlots();
  }

  /* --------------------------------------------------------
     Events
     -------------------------------------------------------- */
  function events() {
    var list = LB.events().slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    UI.qs('#events-grid').innerHTML = list.map(eventCard).join('');
    UI.reveal();
  }

  /* --------------------------------------------------------
     Contact
     -------------------------------------------------------- */
  function contact() {
    var s = LB.settings();
    UI.qs('#c-address').textContent = s.address;
    UI.qs('#c-phone').textContent = s.phone;
    UI.qs('#c-email').textContent = s.email;

    var todayDow = new Date().getDay();
    UI.qs('#hours-body').innerHTML = [1, 2, 3, 4, 5, 6, 0].map(function (d) {
      return '<tr' + (d === todayDow ? ' class="today"' : '') + '><td>' + LB.DOW[d] + '</td><td>' + LB.HOURS[d].label + '</td></tr>';
    }).join('');

    var form = UI.qs('#contact-form');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = UI.qs('#k-name').value.trim();
      var email = UI.qs('#k-email').value.trim();
      var message = UI.qs('#k-message').value.trim();
      if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || message.length < 10) {
        UI.toast('Add your name, a valid email and a message of at least 10 characters.', 'error');
        return;
      }
      LB.log('Contact message from ' + name, 'mail');
      form.reset();
      UI.toast('Message sent. We reply within one working day.', 'success');
    });
  }

  /* --------------------------------------------------------
     Boot
     -------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    LB.load();
    chrome();
    if (page === 'home') home();
    if (page === 'menu') menu();
    if (page === 'reservation') reservation();
    if (page === 'events') events();
    if (page === 'contact') contact();
  });
})();
