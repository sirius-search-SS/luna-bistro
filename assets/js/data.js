/* ============================================================
   Luna Bistro — data layer (data.js)
   A mock "backend": seed data, a deterministic generator and a
   small persistence layer on top of localStorage.

   Loaded as a classic script so the project runs straight from
   the file system (no bundler, no module/CORS issues).
   ============================================================ */
/* global window, document */

window.LB = (function () {
  'use strict';

  var STORAGE_KEY = 'luna-bistro/v1';
  var SESSION_KEY = 'luna-bistro/session';

  /* --------------------------------------------------------
     Safe storage — falls back to memory if the browser blocks it
     -------------------------------------------------------- */
  var memory = {};
  var storage = {
    get: function (key) {
      try { return window.localStorage.getItem(key); }
      catch (e) { return key in memory ? memory[key] : null; }
    },
    set: function (key, value) {
      try { window.localStorage.setItem(key, value); }
      catch (e) { memory[key] = value; }
    },
    remove: function (key) {
      try { window.localStorage.removeItem(key); }
      catch (e) { delete memory[key]; }
    }
  };
  var session = {
    get: function (k) { try { return window.sessionStorage.getItem(k); } catch (e) { return memory['s:' + k] || null; } },
    set: function (k, v) { try { window.sessionStorage.setItem(k, v); } catch (e) { memory['s:' + k] = v; } },
    remove: function (k) { try { window.sessionStorage.removeItem(k); } catch (e) { delete memory['s:' + k]; } }
  };

  /* --------------------------------------------------------
     Deterministic pseudo-random generator, so the demo data is
     identical on every first load.
     -------------------------------------------------------- */
  function rng(seed) {
    var s = seed >>> 0;
    return function () {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }
  function pick(rand, list) { return list[Math.floor(rand() * list.length)]; }
  function between(rand, min, max) { return min + Math.floor(rand() * (max - min + 1)); }

  /* --------------------------------------------------------
     Dates
     -------------------------------------------------------- */
  function iso(d) {
    var y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), da = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + da;
  }
  function parse(s) { var p = String(s).split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function addDays(d, n) { var c = new Date(d.getTime()); c.setDate(c.getDate() + n); return c; }
  function today() { var d = new Date(); d.setHours(0, 0, 0, 0); return d; }
  function todayISO() { return iso(today()); }

  var DOW = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  function formatDate(isoStr, style) {
    var d = parse(isoStr);
    if (style === 'long') return DOW[d.getDay()] + ', ' + d.getDate() + ' ' + MON[d.getMonth()] + ' ' + d.getFullYear();
    if (style === 'medium') return DOW[d.getDay()].slice(0, 3) + ' ' + d.getDate() + ' ' + MON[d.getMonth()].slice(0, 3);
    return d.getDate() + ' ' + MON[d.getMonth()].slice(0, 3) + ' ' + d.getFullYear();
  }
  function formatTime(t) {
    var p = t.split(':'), h = +p[0], m = p[1];
    var ap = h >= 12 ? 'PM' : 'AM';
    var hh = h % 12 === 0 ? 12 : h % 12;
    return hh + ':' + m + ' ' + ap;
  }
  function money(n) {
    return '$' + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }
  function money2(n) {
    return '$' + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function relative(isoStr) {
    var diff = Math.round((parse(isoStr) - today()) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    if (diff === -1) return 'Yesterday';
    if (diff > 1 && diff < 7) return 'In ' + diff + ' days';
    if (diff < -1 && diff > -7) return Math.abs(diff) + ' days ago';
    return formatDate(isoStr, 'medium');
  }

  /* --------------------------------------------------------
     Service hours & slots
     -------------------------------------------------------- */
  var HOURS = {
    0: { open: '11:30', close: '21:30', label: '11:30 – 21:30' },
    1: { open: null, close: null, label: 'Closed' },
    2: { open: '11:30', close: '22:00', label: '11:30 – 22:00' },
    3: { open: '11:30', close: '22:00', label: '11:30 – 22:00' },
    4: { open: '11:30', close: '22:00', label: '11:30 – 22:00' },
    5: { open: '11:30', close: '23:00', label: '11:30 – 23:00' },
    6: { open: '11:00', close: '23:00', label: '11:00 – 23:00' }
  };
  var SLOTS = [
    '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'
  ];
  function slotsFor(isoStr) {
    var day = parse(isoStr).getDay();
    var h = HOURS[day];
    if (!h.open) return [];
    return SLOTS.filter(function (s) { return s >= h.open && s <= h.close; });
  }

  /* --------------------------------------------------------
     Static content
     -------------------------------------------------------- */
  var CATEGORIES = ['Appetizers', 'Soups', 'Salads', 'Main Courses', 'Seafood', 'Pasta', 'Desserts', 'Drinks'];

  var MENU = [
    { id: 'm01', category: 'Appetizers', item: 'Charred Aubergine Dip', description: 'Smoked over vine cuttings, finished with tahini, pomegranate and warm flatbread.', price: 11, dietary: ['vegetarian', 'vegan'], popular: true, isNew: false, tone: 1 },
    { id: 'm02', category: 'Appetizers', item: 'Crisp Artichoke Hearts', description: 'Twice-fried, lemon salt, whipped feta and a scatter of mint.', price: 13, dietary: ['vegetarian'], popular: false, isNew: false, tone: 2 },
    { id: 'm03', category: 'Appetizers', item: 'Chilli Prawn Toast', description: 'Brioche, tiger prawns, bird\'s eye chilli and a lime crème fraîche.', price: 15, dietary: ['spicy'], popular: true, isNew: false, tone: 3 },
    { id: 'm04', category: 'Appetizers', item: 'Beef Tartare, Cured Yolk', description: 'Hand-cut sirloin, capers, shallot, mustard oil and rye crisps.', price: 17, dietary: [], popular: false, isNew: true, tone: 4 },

    { id: 'm05', category: 'Soups', item: 'Roast Tomato & Basil', description: 'Slow-roasted plum tomatoes, basil oil, sourdough croutons.', price: 9, dietary: ['vegetarian', 'vegan'], popular: false, isNew: false, tone: 2 },
    { id: 'm06', category: 'Soups', item: 'Wild Mushroom Velouté', description: 'Porcini, chestnut mushroom, thyme cream and truffle drizzle.', price: 11, dietary: ['vegetarian', 'gluten-free'], popular: true, isNew: false, tone: 3 },
    { id: 'm07', category: 'Soups', item: 'Spiced Coconut & Lentil', description: 'Red lentil, coconut milk, toasted cumin and a chilli crackle.', price: 10, dietary: ['vegan', 'spicy', 'gluten-free'], popular: false, isNew: false, tone: 1 },

    { id: 'm08', category: 'Salads', item: 'Heritage Tomato & Burrata', description: 'Six tomato varieties, Puglian burrata, basil, aged balsamic.', price: 14, dietary: ['vegetarian', 'gluten-free'], popular: true, isNew: false, tone: 2 },
    { id: 'm09', category: 'Salads', item: 'Charred Broccoli & Almond', description: 'Tenderstem, smoked almond, chilli, preserved lemon dressing.', price: 12, dietary: ['vegan', 'spicy', 'gluten-free'], popular: false, isNew: false, tone: 1 },
    { id: 'm10', category: 'Salads', item: 'Little Gem Caesar', description: 'Anchovy dressing, sourdough crumb, aged parmesan.', price: 12, dietary: [], popular: false, isNew: false, tone: 4 },

    { id: 'm11', category: 'Main Courses', item: 'Dry-Aged Ribeye, 300g', description: '40-day aged, bone marrow butter, triple-cooked chips.', price: 38, dietary: ['gluten-free'], popular: true, isNew: false, tone: 3 },
    { id: 'm12', category: 'Main Courses', item: 'Herb-Fed Chicken', description: 'Half bird, tarragon jus, confit garlic, seasonal greens.', price: 26, dietary: ['gluten-free'], popular: true, isNew: false, tone: 4 },
    { id: 'm13', category: 'Main Courses', item: 'Slow Lamb Shoulder', description: 'Six hours in harissa and honey, whipped chickpea, herb salad.', price: 31, dietary: ['spicy'], popular: false, isNew: false, tone: 1 },
    { id: 'm14', category: 'Main Courses', item: 'Roast Cauliflower Steak', description: 'Charred whole, green harissa, pine nut and raisin dressing.', price: 21, dietary: ['vegan', 'gluten-free'], popular: false, isNew: true, tone: 2 },
    { id: 'm15', category: 'Main Courses', item: 'Duck Breast & Cherry', description: 'Pink-roasted, morello cherry, celeriac purée, jus gras.', price: 33, dietary: ['gluten-free'], popular: false, isNew: false, tone: 3 },

    { id: 'm16', category: 'Seafood', item: 'Cornish Cod, Brown Butter', description: 'Line-caught, samphire, caper and brown butter emulsion.', price: 29, dietary: ['gluten-free'], popular: true, isNew: false, tone: 2 },
    { id: 'm17', category: 'Seafood', item: 'Grilled Octopus', description: 'Charred over charcoal, smoked paprika oil, potato and olive.', price: 27, dietary: ['spicy', 'gluten-free'], popular: false, isNew: false, tone: 3 },
    { id: 'm18', category: 'Seafood', item: 'Seared Scallops', description: 'Hand-dived, pea purée, crisp pancetta, lemon oil.', price: 26, dietary: ['gluten-free'], popular: true, isNew: false, tone: 1 },
    { id: 'm19', category: 'Seafood', item: 'Whole Sea Bream', description: 'Salt-baked for two, fennel, lemon and a herb dressing.', price: 44, dietary: ['gluten-free'], popular: false, isNew: true, tone: 4 },

    { id: 'm20', category: 'Pasta', item: 'Cacio e Pepe', description: 'Fresh tonnarelli, pecorino romano, cracked black pepper.', price: 18, dietary: ['vegetarian'], popular: true, isNew: false, tone: 2 },
    { id: 'm21', category: 'Pasta', item: 'Crab Linguine', description: 'Devon brown and white crab, chilli, parsley, lemon.', price: 24, dietary: ['spicy'], popular: true, isNew: false, tone: 1 },
    { id: 'm22', category: 'Pasta', item: 'Wild Mushroom Tagliatelle', description: 'Hand-rolled ribbons, garlic cream, thyme, aged parmesan.', price: 20, dietary: ['vegetarian'], popular: false, isNew: false, tone: 3 },
    { id: 'm23', category: 'Pasta', item: 'Beef Shin Pappardelle', description: 'Eight-hour ragù, red wine, gremolata.', price: 23, dietary: [], popular: false, isNew: false, tone: 4 },

    { id: 'm24', category: 'Desserts', item: 'Burnt Basque Cheesecake', description: 'Caramelised top, soft centre, poached quince.', price: 10, dietary: ['vegetarian'], popular: true, isNew: false, tone: 2 },
    { id: 'm25', category: 'Desserts', item: 'Dark Chocolate Delice', description: '70% Valrhona, salted caramel, cocoa nib crumb.', price: 11, dietary: ['vegetarian'], popular: true, isNew: false, tone: 3 },
    { id: 'm26', category: 'Desserts', item: 'Coconut Panna Cotta', description: 'Set with agar, passion fruit, toasted coconut.', price: 9, dietary: ['vegan', 'gluten-free'], popular: false, isNew: true, tone: 1 },
    { id: 'm27', category: 'Desserts', item: 'Affogato al Caffè', description: 'Vanilla bean ice cream drowned in a double espresso.', price: 7, dietary: ['vegetarian', 'gluten-free'], popular: false, isNew: false, tone: 4 },

    { id: 'm28', category: 'Drinks', item: 'Luna Negroni', description: 'House gin, Campari, vermouth di Torino, burnt orange.', price: 13, dietary: ['vegan', 'gluten-free'], popular: true, isNew: false, tone: 3 },
    { id: 'm29', category: 'Drinks', item: 'Smoked Old Fashioned', description: 'Rye whiskey, demerara, cherrywood smoke.', price: 14, dietary: ['vegan', 'gluten-free'], popular: false, isNew: false, tone: 4 },
    { id: 'm30', category: 'Drinks', item: 'Garden Spritz (0%)', description: 'Alcohol-free aperitivo, elderflower, cucumber, soda.', price: 8, dietary: ['vegan', 'gluten-free'], popular: false, isNew: true, tone: 2 },
    { id: 'm31', category: 'Drinks', item: 'House Red — Nero d\'Avola', description: 'Sicily. Plum, black pepper, soft tannin. Glass or carafe.', price: 9, dietary: ['vegan'], popular: false, isNew: false, tone: 1 }
  ];

  var EVENTS = [
    { id: 'e1', title: 'Live Music Friday', dateOffset: 3, time: '20:00', description: 'A four-piece jazz quartet takes the corner stage every Friday. No cover charge, dinner service runs as normal.', seats: 60, booked: 44, tone: 3 },
    { id: 'e2', title: 'Wine Tasting: Southern Italy', dateOffset: 9, time: '18:30', description: 'Six pours from Puglia, Campania and Sicily, matched with small plates and led by our head sommelier.', seats: 24, booked: 21, tone: 2 },
    { id: 'e3', title: "Chef's Special Night", dateOffset: 16, time: '19:00', description: 'A seven-course tasting menu that never repeats, cooked and served by the kitchen team at the pass.', seats: 30, booked: 12, tone: 4 },
    { id: 'e4', title: 'Holiday Dinner', dateOffset: 28, time: '18:00', description: 'A shared-table festive menu with mulled aperitif on arrival. Ideal for groups of six and above.', seats: 80, booked: 31, tone: 1 },
    { id: 'e5', title: 'Pasta Masterclass', dateOffset: 35, time: '11:00', description: 'Two hours rolling, shaping and saucing with our pasta chef. You eat what you make, apron included.', seats: 16, booked: 5, tone: 2 },
    { id: 'e6', title: 'Sunday Roast Sessions', dateOffset: 5, time: '13:00', description: 'Slow vinyl, long lunch, and a roast that lands on the table whole. Runs every Sunday through winter.', seats: 70, booked: 58, tone: 1 }
  ];

  var REVIEWS = [
    { name: 'Amara Osei', role: 'Regular since 2023', rating: 5, text: 'Booked at 6pm for a table at 8pm and still got the window seat we asked for. The cod is the reason we keep coming back.' },
    { name: 'Daniel Whitfield', role: 'Anniversary dinner', rating: 5, text: 'They noted the occasion on the booking form and brought out dessert with a candle. Nobody mentioned it, it just happened.' },
    { name: 'Priya Raghunathan', role: 'Table of nine', rating: 4, text: 'Large group, split bill, no fuss. The kitchen paced the courses so nobody was waiting on anyone else.' },
    { name: 'Tomás Ferreira', role: 'Wine tasting guest', rating: 5, text: 'The sommelier talked us through six pours without a single word of jargon. We left with two bottles.' },
    { name: 'Hannah Lindqvist', role: 'Weekday lunch', rating: 4, text: 'In and out in fifty minutes with a proper plate of food. Rare for somewhere this good.' },
    { name: 'Marcus Oyelaran', role: 'First visit', rating: 5, text: 'Vegan menu that clearly had thought put into it rather than one sad pasta. The cauliflower steak was the best thing on the table.' }
  ];

  var VALUES = [
    { title: 'A table in two minutes', body: 'Pick a date, a time and a seat preference. Confirmation lands on screen before you close the tab.' },
    { title: 'Cooked to order, always', body: 'Nothing sits under a lamp. Every plate leaves the pass the moment it is finished.' },
    { title: 'We remember you', body: 'Favourite table, usual order, the allergy you mentioned last spring. It is all on your profile.' },
    { title: 'Room for the whole party', body: 'Tables for two through to a private room for twenty, bookable without a phone call.' }
  ];

  var TABLES = [
    { id: 1, table_number: 'T1', capacity: 2, location: 'Window' },
    { id: 2, table_number: 'T2', capacity: 2, location: 'Window' },
    { id: 3, table_number: 'T3', capacity: 2, location: 'Window' },
    { id: 4, table_number: 'T4', capacity: 4, location: 'Window' },
    { id: 5, table_number: 'T5', capacity: 4, location: 'Main floor' },
    { id: 6, table_number: 'T6', capacity: 4, location: 'Main floor' },
    { id: 7, table_number: 'T7', capacity: 4, location: 'Main floor' },
    { id: 8, table_number: 'T8', capacity: 6, location: 'Main floor' },
    { id: 9, table_number: 'T9', capacity: 6, location: 'Main floor' },
    { id: 10, table_number: 'T10', capacity: 2, location: 'Bar' },
    { id: 11, table_number: 'T11', capacity: 2, location: 'Bar' },
    { id: 12, table_number: 'T12', capacity: 4, location: 'Bar' },
    { id: 13, table_number: 'T13', capacity: 4, location: 'Terrace' },
    { id: 14, table_number: 'T14', capacity: 4, location: 'Terrace' },
    { id: 15, table_number: 'T15', capacity: 6, location: 'Terrace' },
    { id: 16, table_number: 'T16', capacity: 8, location: 'Booth' },
    { id: 17, table_number: 'T17', capacity: 8, location: 'Booth' },
    { id: 18, table_number: 'T18', capacity: 12, location: 'Private room' }
  ];

  var FIRST = ['Amara', 'Daniel', 'Priya', 'Tomás', 'Hannah', 'Marcus', 'Leila', 'Jonas', 'Fatima', 'Oliver', 'Mei', 'Rafael', 'Nadia', 'Callum', 'Ines', 'Yusuf', 'Grace', 'Anton'];
  var LAST = ['Osei', 'Whitfield', 'Raghunathan', 'Ferreira', 'Lindqvist', 'Oyelaran', 'Haddad', 'Berg', 'Al-Amin', 'Pemberton', 'Chen', 'Duarte', 'Kovač', 'Frazier', 'Moreau', 'Demir', 'Nakamura', 'Petrov'];
  var OCCASIONS = ['None', 'Birthday', 'Anniversary', 'Business', 'Date night', 'Celebration'];
  var SEATING = ['No preference', 'Window', 'Booth', 'Terrace', 'Bar', 'Quiet corner'];
  var SOURCES = ['Website', 'Phone', 'Walk-in', 'Partner app'];
  var REQUESTS = ['', '', '', 'High chair needed', 'Nut allergy at the table', 'Celebrating — candle on dessert please', 'Wheelchair access', 'Quiet table if possible', 'Split bill on arrival'];

  var STATUS_META = {
    'pending':    { label: 'Pending',    cls: 'st-pending' },
    'confirmed':  { label: 'Confirmed',  cls: 'st-confirmed' },
    'checked-in': { label: 'Checked in', cls: 'st-checked-in' },
    'completed':  { label: 'Completed',  cls: 'st-completed' },
    'cancelled':  { label: 'Cancelled',  cls: 'st-cancelled' },
    'no-show':    { label: 'No show',    cls: 'st-no-show' }
  };
  var STATUSES = Object.keys(STATUS_META);

  /* --------------------------------------------------------
     Seeding
     -------------------------------------------------------- */
  function seedCustomers() {
    var rand = rng(20260114);
    var list = [];
    for (var i = 0; i < 18; i++) {
      var first = FIRST[i], last = LAST[i];
      var visits = pick(rand, [1, 1, 1, 2, 3, 4, 5, 7, 9, 12, 15, 18, 22, 26, 31]);
      list.push({
        id: 'C-' + String(1000 + i),
        first_name: first,
        last_name: last,
        email: first.toLowerCase().replace(/[^a-z]/g, '') + '.' + last.toLowerCase().replace(/[^a-z]/g, '') + '@example.com',
        phone: '+1 (415) 555-0' + String(100 + i),
        birthdate: (1968 + between(rand, 0, 30)) + '-' + String(between(rand, 1, 12)).padStart(2, '0') + '-' + String(between(rand, 1, 28)).padStart(2, '0'),
        favorite_table: pick(rand, TABLES).table_number,
        visits: visits,
        loyalty_points: visits * between(rand, 18, 42),
        notes: pick(rand, ['', '', 'Prefers still water, no ice.', 'Allergic to shellfish.', 'Always asks for the terrace.', 'Corporate account — invoice monthly.'])
      });
    }
    return list;
  }

  function seedReservations(customers) {
    var rand = rng(77031);
    var list = [];
    var counter = 1;
    var base = today();

    for (var d = -21; d <= 21; d++) {
      var day = addDays(base, d);
      var dateStr = iso(day);
      var slots = slotsFor(dateStr);
      if (!slots.length) continue;

      var weekend = day.getDay() === 5 || day.getDay() === 6 || day.getDay() === 0;
      var count = weekend ? between(rand, 16, 24) : between(rand, 10, 15);

      for (var i = 0; i < count; i++) {
        var cust = pick(rand, customers);
        var guests = pick(rand, [2, 2, 2, 3, 4, 4, 4, 5, 6, 6, 8, 10]);
        var candidates = TABLES.filter(function (t) { return t.capacity >= guests && t.capacity <= guests + 2; });
        if (!candidates.length) candidates = TABLES.filter(function (t) { return t.capacity >= guests; });
        var table = candidates.length ? pick(rand, candidates) : TABLES[TABLES.length - 1];
        var status;
        if (d < 0) status = pick(rand, ['completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'cancelled', 'no-show']);
        else if (d === 0) status = pick(rand, ['completed', 'checked-in', 'confirmed', 'confirmed', 'pending']);
        else status = pick(rand, ['confirmed', 'confirmed', 'confirmed', 'confirmed', 'confirmed', 'confirmed', 'pending', 'pending', 'pending', 'cancelled']);

        var spend = status === 'completed' ? guests * between(rand, 38, 92) : 0;

        list.push({
          id: 'R' + counter,
          reservation_code: 'LB-' + day.getFullYear() + '-' + String(counter).padStart(5, '0'),
          customer_id: cust.id,
          customer_name: cust.first_name + ' ' + cust.last_name,
          email: cust.email,
          phone: cust.phone,
          date: dateStr,
          time: pick(rand, slots),
          guests: guests,
          table: table.table_number,
          seating: pick(rand, SEATING),
          occasion: pick(rand, OCCASIONS),
          status: status,
          source: pick(rand, ['Website', 'Website', 'Website', 'Website', 'Phone', 'Phone', 'Walk-in', 'Partner app']),
          special_requests: pick(rand, REQUESTS),
          spend: spend,
          created_at: iso(addDays(day, -between(rand, 1, 14)))
        });
        counter++;
      }
    }
    return list;
  }

  function seedTables(reservations) {
    var rand = rng(4242);
    var now = new Date();
    var nowMin = now.getHours() * 60 + now.getMinutes();
    var t = todayISO();

    return TABLES.map(function (tbl) {
      var live = reservations.filter(function (r) {
        return r.date === t && r.table === tbl.table_number &&
          (r.status === 'checked-in' || r.status === 'confirmed' || r.status === 'pending');
      });
      var status = 'available';
      if (live.some(function (r) { return r.status === 'checked-in'; })) status = 'occupied';
      else if (live.length) {
        var mins = live.map(function (r) { var p = r.time.split(':'); return +p[0] * 60 + +p[1]; });
        var soon = mins.some(function (m) { return m - nowMin < 180 && m - nowMin > -60; });
        status = soon ? 'reserved' : (rand() > 0.85 ? 'cleaning' : 'available');
      } else if (rand() > 0.88) status = 'cleaning';

      return {
        id: tbl.id,
        table_number: tbl.table_number,
        capacity: tbl.capacity,
        location: tbl.location,
        status: status,
        notes: ''
      };
    });
  }

  var DEFAULT_SETTINGS = {
    name: 'Luna Bistro',
    tagline: 'Reserve. Dine. Delight.',
    address: '42 Marlowe Street, Riverside Quarter, Bangkok 10500',
    phone: '+66 2 555 0142',
    email: 'hello@lunabistro.example',
    currency: 'USD',
    turnMinutes: 105,
    maxGuestsOnline: 12,
    theme: 'light',
    language: 'en',
    notify: { email: true, sms: false, dailyDigest: true, largeParty: true },
    holidays: [{ date: '2026-12-25', label: 'Christmas Day — closed' }, { date: '2026-01-01', label: "New Year's Day — closed" }],
    emailTemplates: {
      confirmation: 'Hi {{name}}, your table at Luna Bistro is confirmed for {{date}} at {{time}} for {{guests}}. Your reference is {{code}}.',
      reminder: 'Hi {{name}}, we are looking forward to seeing you tomorrow at {{time}}. Reply to this email if anything has changed.',
      cancellation: 'Hi {{name}}, your booking {{code}} has been cancelled. We hope to see you another time.'
    }
  };

  /* --------------------------------------------------------
     Store
     -------------------------------------------------------- */
  var db = null;

  function build() {
    var customers = seedCustomers();
    var reservations = seedReservations(customers);
    return {
      version: 1,
      seededOn: todayISO(),
      customers: customers,
      reservations: reservations,
      tables: seedTables(reservations),
      events: EVENTS.map(function (e) {
        return {
          id: e.id, title: e.title, date: iso(addDays(today(), e.dateOffset)), time: e.time,
          description: e.description, seats: e.seats, booked: e.booked, tone: e.tone
        };
      }),
      settings: JSON.parse(JSON.stringify(DEFAULT_SETTINGS)),
      activity: []
    };
  }

  function load() {
    if (db) return db;
    var raw = storage.get(STORAGE_KEY);
    if (raw) {
      try {
        var parsed = JSON.parse(raw);
        if (parsed && parsed.version === 1 && parsed.seededOn === todayISO()) { db = parsed; return db; }
      } catch (e) { /* fall through and reseed */ }
    }
    db = build();
    save();
    return db;
  }

  function save() {
    if (!db) return;
    storage.set(STORAGE_KEY, JSON.stringify(db));
  }

  function reset() { storage.remove(STORAGE_KEY); db = null; return load(); }

  function log(text, icon) {
    var d = load();
    d.activity.unshift({ text: text, icon: icon || 'activity', at: new Date().toISOString() });
    d.activity = d.activity.slice(0, 40);
    save();
  }

  /* --------------------------------------------------------
     Queries & mutations
     -------------------------------------------------------- */
  function reservations() { return load().reservations; }
  function customers() { return load().customers; }
  function tables() { return load().tables; }
  function events() { return load().events; }
  function settings() { return load().settings; }
  function activity() { return load().activity; }

  function byDate(dateStr) {
    return reservations().filter(function (r) { return r.date === dateStr; });
  }
  function activeOn(dateStr) {
    return byDate(dateStr).filter(function (r) { return r.status !== 'cancelled' && r.status !== 'no-show'; });
  }
  function customer(id) {
    return customers().filter(function (c) { return c.id === id; })[0] || null;
  }
  function reservation(id) {
    return reservations().filter(function (r) { return r.id === id; })[0] || null;
  }

  function nextCode() {
    var year = new Date().getFullYear();
    var n = reservations().length + 1;
    return 'LB-' + year + '-' + String(n).padStart(5, '0');
  }

  function seatsLeft(dateStr, time) {
    var capacity = TABLES.reduce(function (sum, t) { return sum + t.capacity; }, 0);
    var taken = activeOn(dateStr)
      .filter(function (r) { return r.time === time; })
      .reduce(function (sum, r) { return sum + r.guests; }, 0);
    return Math.max(0, Math.round(capacity * 0.55) - taken);
  }

  function assignTable(dateStr, time, guests, seating) {
    var busy = activeOn(dateStr).filter(function (r) { return r.time === time; }).map(function (r) { return r.table; });
    var pool = tables().filter(function (t) {
      return t.capacity >= guests && busy.indexOf(t.table_number) === -1;
    });
    if (seating && seating !== 'No preference') {
      var pref = pool.filter(function (t) { return t.location.toLowerCase().indexOf(seating.toLowerCase()) > -1; });
      if (pref.length) pool = pref;
    }
    pool.sort(function (a, b) { return a.capacity - b.capacity; });
    return pool.length ? pool[0].table_number : 'Waitlist';
  }

  function createReservation(input) {
    var d = load();
    var existing = d.customers.filter(function (c) {
      return c.email.toLowerCase() === String(input.email || '').toLowerCase();
    })[0];

    if (!existing) {
      var parts = String(input.name || 'Guest').trim().split(/\s+/);
      existing = {
        id: 'C-' + String(1000 + d.customers.length),
        first_name: parts[0] || 'Guest',
        last_name: parts.slice(1).join(' ') || '',
        email: input.email || '',
        phone: input.phone || '',
        birthdate: '',
        favorite_table: '',
        visits: 0,
        loyalty_points: 0,
        notes: ''
      };
      d.customers.push(existing);
    }

    var rec = {
      id: 'R' + (d.reservations.length + 1) + '-' + Date.now().toString(36),
      reservation_code: nextCode(),
      customer_id: existing.id,
      customer_name: (existing.first_name + ' ' + existing.last_name).trim(),
      email: existing.email,
      phone: input.phone || existing.phone,
      date: input.date,
      time: input.time,
      guests: Number(input.guests),
      table: assignTable(input.date, input.time, Number(input.guests), input.seating),
      seating: input.seating || 'No preference',
      occasion: input.occasion || 'None',
      status: 'pending',
      source: input.source || 'Website',
      special_requests: input.special_requests || '',
      spend: 0,
      created_at: todayISO()
    };
    d.reservations.push(rec);
    save();
    log(rec.customer_name + ' booked ' + rec.guests + ' for ' + formatDate(rec.date, 'medium') + ' at ' + formatTime(rec.time), 'calendar-plus');
    return rec;
  }

  function updateReservation(id, patch) {
    var d = load();
    for (var i = 0; i < d.reservations.length; i++) {
      if (d.reservations[i].id === id) {
        var before = d.reservations[i].status;
        Object.keys(patch).forEach(function (k) { d.reservations[i][k] = patch[k]; });
        if (patch.status === 'completed' && !d.reservations[i].spend) {
          d.reservations[i].spend = d.reservations[i].guests * 62;
        }
        save();
        if (patch.status && patch.status !== before) {
          log(d.reservations[i].reservation_code + ' → ' + STATUS_META[patch.status].label, 'refresh-cw');
        }
        return d.reservations[i];
      }
    }
    return null;
  }

  function deleteReservation(id) {
    var d = load();
    var rec = reservation(id);
    d.reservations = d.reservations.filter(function (r) { return r.id !== id; });
    save();
    if (rec) log(rec.reservation_code + ' was deleted', 'trash-2');
  }

  function setTableStatus(tableNumber, status) {
    var d = load();
    d.tables.forEach(function (t) { if (t.table_number === tableNumber) t.status = status; });
    save();
    log(tableNumber + ' set to ' + status, 'layout-grid');
  }

  function saveSettings(patch) {
    var d = load();
    Object.keys(patch).forEach(function (k) { d.settings[k] = patch[k]; });
    save();
    log('Settings updated', 'settings');
  }

  /* --------------------------------------------------------
     Analytics helpers
     -------------------------------------------------------- */
  function statsForToday() {
    var t = todayISO();
    var list = byDate(t);
    var active = list.filter(function (r) { return r.status !== 'cancelled' && r.status !== 'no-show'; });
    var tbls = tables();
    return {
      reservations: active.length,
      covers: active.reduce(function (s, r) { return s + r.guests; }, 0),
      revenue: list.reduce(function (s, r) { return s + (r.spend || 0); }, 0),
      available: tbls.filter(function (t2) { return t2.status === 'available'; }).length,
      occupied: tbls.filter(function (t2) { return t2.status === 'occupied'; }).length,
      reserved: tbls.filter(function (t2) { return t2.status === 'reserved'; }).length,
      cleaning: tbls.filter(function (t2) { return t2.status === 'cleaning'; }).length,
      walkIns: list.filter(function (r) { return r.source === 'Walk-in'; }).length,
      pending: list.filter(function (r) { return r.status === 'pending'; }).length
    };
  }

  function seriesLastDays(n) {
    var out = [];
    for (var i = n - 1; i >= 0; i--) {
      var dateStr = iso(addDays(today(), -i));
      var list = byDate(dateStr);
      out.push({
        date: dateStr,
        label: formatDate(dateStr, 'medium'),
        reservations: list.filter(function (r) { return r.status !== 'cancelled'; }).length,
        covers: list.reduce(function (s, r) { return s + (r.status === 'cancelled' ? 0 : r.guests); }, 0),
        revenue: list.reduce(function (s, r) { return s + (r.spend || 0); }, 0)
      });
    }
    return out;
  }

  function busyHours() {
    var map = {};
    SLOTS.forEach(function (s) { map[s] = 0; });
    reservations().forEach(function (r) {
      if (r.status === 'cancelled') return;
      if (map[r.time] === undefined) map[r.time] = 0;
      map[r.time] += r.guests;
    });
    return SLOTS.map(function (s) { return { time: s, covers: map[s] || 0 }; });
  }

  function popularTables(limit) {
    var map = {};
    reservations().forEach(function (r) {
      if (r.status === 'cancelled') return;
      map[r.table] = (map[r.table] || 0) + 1;
    });
    return Object.keys(map)
      .map(function (k) { return { table: k, count: map[k] }; })
      .sort(function (a, b) { return b.count - a.count; })
      .slice(0, limit || 6);
  }

  function sourceSplit() {
    var map = {};
    SOURCES.forEach(function (s) { map[s] = 0; });
    reservations().forEach(function (r) { map[r.source] = (map[r.source] || 0) + 1; });
    return SOURCES.map(function (s) { return { source: s, count: map[s] }; });
  }

  function rates() {
    var all = reservations();
    var cancelled = all.filter(function (r) { return r.status === 'cancelled'; }).length;
    var noShow = all.filter(function (r) { return r.status === 'no-show'; }).length;
    var repeat = customers().filter(function (c) { return c.visits > 1; }).length;
    var totalSeats = TABLES.reduce(function (s, t) { return s + t.capacity; }, 0);
    var last7 = seriesLastDays(7);
    var avgCovers = last7.reduce(function (s, d2) { return s + d2.covers; }, 0) / 7;
    return {
      cancellation: all.length ? (cancelled / all.length) * 100 : 0,
      noShow: all.length ? (noShow / all.length) * 100 : 0,
      repeat: customers().length ? (repeat / customers().length) * 100 : 0,
      occupancy: Math.min(100, (avgCovers / (totalSeats * 2)) * 100),
      avgGuests: all.length ? all.reduce(function (s, r) { return s + r.guests; }, 0) / all.length : 0,
      avgSpend: (function () {
        var done = all.filter(function (r) { return r.spend > 0; });
        return done.length ? done.reduce(function (s, r) { return s + r.spend; }, 0) / done.length : 0;
      })()
    };
  }

  function categoryPopularity() {
    var rand = rng(9911);
    return CATEGORIES.map(function (c) {
      var items = MENU.filter(function (m) { return m.category === c; });
      var pop = items.filter(function (m) { return m.popular; }).length;
      return { category: c, orders: 120 + pop * 90 + between(rand, 0, 140) };
    }).sort(function (a, b) { return b.orders - a.orders; });
  }

  /* --------------------------------------------------------
     Auth (demo only — no real security)
     -------------------------------------------------------- */
  var auth = {
    login: function (email, password) {
      if (String(email).trim().toLowerCase() === 'manager@lunabistro.example' && password === 'luna2026') {
        session.set(SESSION_KEY, JSON.stringify({ name: 'Rae Salcedo', role: 'General Manager', email: email }));
        return true;
      }
      return false;
    },
    user: function () {
      try { return JSON.parse(session.get(SESSION_KEY) || 'null'); } catch (e) { return null; }
    },
    logout: function () { session.remove(SESSION_KEY); },
    require: function () {
      if (!auth.user()) {
        var depth = window.location.pathname.indexOf('/admin/') > -1 ? '' : 'admin/';
        window.location.href = depth + 'login.html';
        return false;
      }
      return true;
    }
  };

  /* --------------------------------------------------------
     Public API
     -------------------------------------------------------- */
  return {
    CATEGORIES: CATEGORIES, MENU: MENU, REVIEWS: REVIEWS, VALUES: VALUES,
    TABLES: TABLES, SLOTS: SLOTS, HOURS: HOURS, DOW: DOW, MON: MON,
    OCCASIONS: OCCASIONS, SEATING: SEATING, SOURCES: SOURCES,
    STATUS_META: STATUS_META, STATUSES: STATUSES,

    storage: storage, session: session,
    load: load, save: save, reset: reset, log: log,

    reservations: reservations, customers: customers, tables: tables,
    events: events, settings: settings, activity: activity,
    byDate: byDate, activeOn: activeOn, customer: customer, reservation: reservation,

    createReservation: createReservation, updateReservation: updateReservation,
    deleteReservation: deleteReservation, setTableStatus: setTableStatus,
    saveSettings: saveSettings, assignTable: assignTable, seatsLeft: seatsLeft,
    nextCode: nextCode, slotsFor: slotsFor,

    statsForToday: statsForToday, seriesLastDays: seriesLastDays, busyHours: busyHours,
    popularTables: popularTables, sourceSplit: sourceSplit, rates: rates,
    categoryPopularity: categoryPopularity,

    iso: iso, parse: parse, addDays: addDays, today: today, todayISO: todayISO,
    formatDate: formatDate, formatTime: formatTime, money: money, money2: money2, relative: relative,

    auth: auth
  };
})();
