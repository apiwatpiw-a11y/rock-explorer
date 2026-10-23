/* ROCK EXPLORER — หน้าเว็บสำหรับนักเรียน */
(function () {
  'use strict';

  var cfg = window.ROCK_CONFIG || {};
  var API = window.RockAPI;
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function rich(s) { return esc(s).replace(/&lt;em&gt;/g, '<em>').replace(/&lt;\/em&gt;/g, '</em>'); }
  function bg(url) { return url ? "background-image:url('" + String(url).replace(/['"()\\\s]/g, encodeURIComponent) + "')" : ''; }
  var TH = ['ก', 'ข', 'ค', 'ง', 'จ', 'ฉ'];

  /* ---------- ไอคอน ---------- */
  var I = {
    quiz: '<path d="M15 4h2a2 2 0 0 1 2 2v5"/><path d="M9 4H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h5"/><rect x="9" y="2.5" width="6" height="3.5" rx="1"/><path d="M8.5 11h6M8.5 15h3"/><path d="M18.4 13.6a1.5 1.5 0 0 1 2.1 2.1l-5 5-2.9.8.8-2.9z"/>',
    book: '<path d="M2.5 5.5c2.8-1.2 6-1.2 9.5.6v14c-3.5-1.8-6.7-1.8-9.5-.6z"/><path d="M21.5 5.5c-2.8-1.2-6-1.2-9.5.6v14c3.5-1.8 6.7-1.8 9.5-.6z"/>',
    cube: '<path d="M12 2.8 20.2 7.4v9.2L12 21.2l-8.2-4.6V7.4z"/><path d="M3.8 7.4 12 12l8.2-4.6M12 12v9.2"/>',
    sheet: '<rect x="5" y="3.5" width="14" height="18" rx="2"/><path d="M9 2.5h6v3H9z"/><path d="m8.5 10.5 1.2 1.2 2-2.2M13.5 11H16M8.5 15.5l1.2 1.2 2-2.2M13.5 16H16"/>',
    quizok: '<path d="M14 2.5H7a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h4.5"/><path d="M14 2.5V7h4.5M14 2.5 18.5 7v4"/><path d="M8.5 11h6M8.5 14.5H12"/><circle cx="17.5" cy="17.5" r="4"/><path d="m15.8 17.6 1.2 1.2 2.2-2.4"/>',
    chart: '<rect x="3.5" y="13" width="4" height="7.5" rx="1"/><rect x="10" y="8.5" width="4" height="12" rx="1"/><rect x="16.5" y="3.5" width="4" height="17" rx="1"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.6-4 4.5-6 8-6s6.4 2 8 6"/>',
    chevdown: '<path d="m6 9 6 6 6-6"/>',
    chevright: '<path d="m9 6 6 6-6 6"/>',
    up: '<path d="m6 15 6-6 6 6"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    check: '<path d="M5 12.5 9.5 17 19 7.5"/>',
    bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.8.6 1.1 1.4 1.1 2.2h5c0-.8.3-1.6 1.1-2.2A6 6 0 0 0 12 3z"/>',
    mountain: '<path d="M2 20 9 7l4 7 2.5-4L22 20z"/><path d="m7.2 10.4 1.8 1.6 1.5-1.4"/>',
    volcano: '<path d="m3 21 5-9h8l5 9z"/><path d="m9 12 1.5-3h3L15 12"/><path d="M11 6c-1-1.5 0-3 1.5-3 .8-1 2.6-.9 3 .6 1.4 0 2 1.6 1 2.6"/>',
    layers: '<path d="M12 3 2.5 8 12 13l9.5-5z"/><path d="m2.5 12 9.5 5 9.5-5"/><path d="m2.5 16 9.5 5 9.5-5"/>',
    leaf: '<path d="M12 21v-9"/><path d="M12 12c0-4-3-7-8-7 0 4.5 3 7 8 7z"/><path d="M12 10c0-3.5 2.5-6 7-6 0 4-2.5 6-7 6z"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
    rotate: '<path d="M20 12a8 8 0 1 1-2.4-5.7"/><path d="M20 4v4.5h-4.5"/>',
    zoom: '<circle cx="11" cy="11" r="7"/><path d="m20.5 20.5-4.5-4.5M8 11h6M11 8v6"/>',
    crosshair: '<circle cx="12" cy="12" r="7.5"/><circle cx="12" cy="12" r="2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
    home: '<path d="M3.5 11 12 3.5 20.5 11"/><path d="M5.5 9.5V20h13V9.5"/><path d="M10 20v-6h4v6"/>',
    camera: '<path d="M4 7.5h3.5L9 5h6l1.5 2.5H20A1.5 1.5 0 0 1 21.5 9v9.5A1.5 1.5 0 0 1 20 20H4a1.5 1.5 0 0 1-1.5-1.5V9A1.5 1.5 0 0 1 4 7.5z"/><circle cx="12" cy="13.5" r="3.8"/>',
    scan: '<path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16"/>',
    orbit: '<path d="M12 9.5c4.7 0 8.5 1.6 8.5 3.5s-3.8 3.5-8.5 3.5S3.5 14.9 3.5 13"/><path d="m6 15.5-2.5-2.5L6 10.5"/><path d="M12 3.5 15 7H9z"/><path d="M12 7v6"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.3a2.5 2.5 0 0 1 4.8 1c0 1.7-2.4 2.2-2.4 3.7"/><path d="M12 17.3v.2"/>',
    download: '<path d="M12 4v11M7 10.5l5 5 5-5"/><path d="M4 17v2.5A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5V17"/>',
    clip: '<path d="m20.5 11.5-8.2 8.2a5 5 0 0 1-7-7l8.5-8.6a3.3 3.3 0 0 1 4.7 4.7L10 17.3a1.7 1.7 0 0 1-2.4-2.4l7.6-7.5"/>',
    send: '<path d="M21 3 10.5 13.5"/><path d="m21 3-6.5 18-4-7.5L3 9.5z"/>',
    save: '<path d="M14 2.5H6.5a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8z"/><path d="M14 2.5V8h5.5"/><path d="M8.5 13h7M8.5 17h5"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    thermo: '<path d="M14 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0z"/><path d="M12 9v7"/>',
    press: '<path d="M12 3v11M7 9.5l5 5 5-5"/><path d="M4 20h16"/>',
    drop: '<path d="M12 3s6.5 7.2 6.5 11.5a6.5 6.5 0 0 1-13 0C5.5 10.2 12 3 12 3z"/>',
    pebbles: '<path d="M7.5 20C4.7 20 3 18.7 3 16.7c0-2.2 2-3.9 4.4-3.9 2.5 0 4.1 1.6 4.1 3.6S9.9 20 7.5 20z"/><path d="M16.8 20.5c-2.4 0-4.1-1.1-4.1-2.9s1.7-3.5 4-3.5 4.3 1.4 4.3 3.3-1.8 3.1-4.2 3.1z"/><path d="M12 12c-2 0-3.5-1.2-3.5-3 0-2 1.7-3.8 3.9-3.8S16 6.8 16 8.8 14.2 12 12 12z"/>',
    crystal: '<path d="M12 2.5 18 8l-6 13.5L6 8z"/><path d="M6 8h12M9.5 8 12 21.5 14.5 8 12 2.5"/>',
    shell: '<path d="M3 15.5C3 9.5 7 5 12 5s9 4.5 9 10.5"/><path d="M3 15.5c2 2 4 3 9 3s7-1 9-3"/><path d="M12 5v13.5M7.5 6.5 9 18M16.5 6.5 15 18M4.5 10 6 17M19.5 10 18 17"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5v-3a4 4 0 0 1 8 0v3"/>',
    logout: '<path d="M14 4h4.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H14"/><path d="M10 16.5 5.5 12 10 7.5M5.5 12H16"/>',
    menu: '<path d="M4 6.5h16M4 12h16M4 17.5h16"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    upload: '<path d="M12 16V5M7 9.5l5-5 5 5"/><path d="M4 17v2.5A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5V17"/>',
    bookmark: '<path d="M6.5 3.5h11v17L12 16.5l-5.5 4z"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12.5h5"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M17 6l3 3M14.5 8.5l2 2"/>'
  };
  function ic(name, cls) { return '<svg class="' + (cls || 'ic') + '" viewBox="0 0 24 24" aria-hidden="true">' + (I[name] || '') + '</svg>'; }
  var LOGO = '<svg viewBox="0 0 48 48" fill="none" stroke="#153E3D" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><path d="M7 19 16.5 7.5l15.5 1L41.5 21 37.5 37 22.5 42.5 9.5 33.5z"/><path d="m16.5 7.5 4 12.5L32 8.5M20.5 20 7 19M20.5 20l2 22.5M20.5 20l17 17M20.5 20l21-1"/></svg>';
  var ARCUBE = '<svg class="arcube" viewBox="0 0 74 86" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M30 6 56 20v28L30 62 4 48V20z"/><path d="M4 20l26 14 26-14M30 34v28"/><text x="56" y="82" fill="currentColor" stroke="none" font-size="15" font-family="inherit">AR</text></svg>';
  var CHAT = '<svg viewBox="0 0 130 96" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 10h86a8 8 0 0 1 8 8v42a8 8 0 0 1-8 8H50L26 88V68H14a8 8 0 0 1-8-8V18a8 8 0 0 1 8-8z"/><path d="M30 30h56M30 46h40"/><path d="M114 8l8-6M118 22h10M114 36l8 4"/></svg>';

  /* ---------- สถานะของแอป ---------- */
  var S = { content: null, user: null, me: null, test: null, review: null, after: '', ar: { cat: null, rock: null, pins: true, spin: true }, ws: null };
  var STEPS = [
    { id: 'pretest', label: 'ทดสอบก่อนเรียน', icon: 'quiz', route: 'pretest' },
    { id: 'lessons', label: 'ศึกษาเนื้อหา', icon: 'book', route: 'lessons' },
    { id: 'ar', label: 'สำรวจหิน AR', icon: 'cube', route: 'ar' },
    { id: 'worksheet', label: 'ทำใบงาน', icon: 'sheet', route: 'worksheet' },
    { id: 'posttest', label: 'ทดสอบหลังเรียน', icon: 'quizok', route: 'posttest' },
    { id: 'survey', label: 'ความพึงพอใจ', icon: 'chart', route: 'survey' }
  ];
  var NEED = { pretest: null, lessons: 'pretest', ar: 'pretest', worksheet: 'pretest', posttest: 'worksheet', survey: 'posttest' };
  var TAB_META = { origin: { th: 'การเกิด', icon: 'mountain' }, texture: { th: 'เนื้อหิน', icon: 'layers' }, classify: { th: 'การจำแนก', icon: 'cube' }, uses: { th: 'ประโยชน์', icon: 'leaf' } };
  var CAT_LESSON = { ign: 'igneous', sed: 'sedimentary', met: 'metamorphic' };
  var LESSON_CAT = { igneous: 'ign', sedimentary: 'sed', metamorphic: 'met' };
  var TYPE_TH = { igneous: 'หินอัคนี', sedimentary: 'หินตะกอน', metamorphic: 'หินแปร' };

  function C() { return S.content; }
  function isStudent() { return S.user && S.user.role === 'student'; }
  function isTeacher() { return S.user && S.user.role === 'teacher'; }
  function seqOn() { return C().settings.requireSequence !== false; }
  function stepDone(id) { return !!(S.me && S.me.steps && S.me.steps.done[id]); }
  function stepLocked(id) { return isStudent() && seqOn() && NEED[id] && !stepDone(NEED[id]); }
  function stepLabel(id) { for (var i = 0; i < STEPS.length; i++) if (STEPS[i].id === id) return STEPS[i].label; return ''; }

  /* ---------- เส้นทาง (router) ---------- */
  function hashRoute() { var h = location.hash || ''; if (h.indexOf('#/') !== 0) return ''; try { return decodeURIComponent(h.slice(2)); } catch (e) { return h.slice(2); } }
  S.route = hashRoute();
  function route() { return S.route; }
  function go(r) {
    S.route = r;
    try { if (location.hash !== '#/' + r) history.pushState(null, '', '#/' + r); } catch (e) { /* บางหน้าต่างไม่ให้เปลี่ยนที่อยู่ */ }
    render(); window.scrollTo(0, 0);
  }
  function onNav() { var h = hashRoute(); if (h !== S.route) { S.route = h; render(); window.scrollTo(0, 0); } }
  window.addEventListener('hashchange', onNav);
  window.addEventListener('popstate', onNav);

  /* ---------- ข้อความแจ้งและกล่องโต้ตอบ ---------- */
  var toastTimer;
  function toast(msg, bad) {
    var t = $('#toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.className = 'toast' + (bad ? ' bad' : ''); t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.hidden = true; }, 3600);
  }
  function modal(html, opts) {
    opts = opts || {};
    var m = document.createElement('div');
    m.className = 'modal' + (opts.wide ? ' wide' : '');
    m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true');
    m.innerHTML = '<div>' + html + '</div>';
    var prev = document.activeElement;
    function close() { m.remove(); document.removeEventListener('keydown', onKey); if (prev && prev.focus) prev.focus(); if (opts.onClose) opts.onClose(); }
    function onKey(e) { if (e.key === 'Escape') close(); }
    m.addEventListener('click', function (e) { if (e.target === m || e.target.closest('[data-close]')) close(); });
    document.addEventListener('keydown', onKey);
    document.body.appendChild(m);
    var f = m.querySelector('[autofocus], button, a, input, select, textarea'); if (f) f.focus();
    m.close = close;
    return m;
  }
  function confirmBox(title, text, okLabel) {
    return new Promise(function (resolve) {
      var done = false;
      var m = modal('<h2>' + esc(title) + '</h2><p>' + esc(text) + '</p><div class="actions"><button class="btn ghost" data-close>ยกเลิก</button><button class="btn" data-ok autofocus>' + esc(okLabel || 'ยืนยัน') + '</button></div>',
        { onClose: function () { if (!done) resolve(false); } });
      m.querySelector('[data-ok]').addEventListener('click', function () { done = true; resolve(true); m.close(); });
    });
  }

  /* ---------- ดาวน์โหลดไฟล์ (ใช้ได้ทั้งเว็บปกติและในหน้า Claude) ---------- */
  function saveFile(filename, data, mime) {
    var blob = data instanceof Blob ? data : new Blob([data], { type: mime || 'application/octet-stream' });
    var cl = window.claude;
    var viaClaude = cl && typeof cl.use === 'function' ? cl.use('downloads') : Promise.resolve(null);
    return Promise.resolve(viaClaude).then(function (dl) {
      if (dl) return dl.save({ filename: filename, data: blob }).then(function () { return true; }, function (e) { if (e && e.code === 'declined') return false; throw e; });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = filename;
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
      return true;
    }).catch(function () { toast('ดาวน์โหลดไฟล์ไม่สำเร็จในหน้านี้', true); return false; });
  }

  /* ---------- ส่วนหัว ---------- */
  function navCurrent(r) {
    if (!r) return 'home';
    if (/^(ar)(\/|$)/.test(r)) return 'ar';
    if (/^results/.test(r)) return 'results';
    if (/^(account|login)/.test(r)) return 'account';
    if (/^admin/.test(r)) return 'admin';
    return 'lessons';
  }
  function topbar(r) {
    var cur = navCurrent(r);
    var links = [['home', '', 'หน้าแรก'], ['lessons', 'lessons', 'บทเรียน'], ['ar', 'ar', 'สำรวจหิน AR'], ['results', 'results', 'ผลการเรียน']];
    if (isTeacher()) links.push(['admin', 'admin', 'จัดการ']);
    var nav = links.map(function (l) {
      return '<a href="#/' + l[1] + '"' + (cur === l[0] ? ' aria-current="page"' : '') + '>' + l[2] + '</a>';
    }).join('');
    var acct;
    if (!S.user) {
      acct = '<a class="btn ghost" href="#/login" style="border-color:var(--ink);min-height:46px">เข้าสู่ระบบ</a>';
    } else {
      var label = isTeacher() ? 'ครู' : 'นักเรียน';
      acct = '<div class="acct"><button type="button" data-act="acct" aria-expanded="false" aria-haspopup="true">' + ic('user') + '<span class="lbl">' + label + '</span>' + ic('chevdown') + '</button>' +
        '<div class="menu" hidden><div class="who"><b>' + esc(S.user.name || S.user.id) + '</b><span>' + (isTeacher() ? 'ครูผู้สอน' : 'เลขประจำตัว ' + esc(S.user.id) + (S.user.room ? ' · ม.' + esc(S.user.room) : '') + (S.user.no ? ' เลขที่ ' + esc(S.user.no) : '')) + '</span></div>' +
        '<a href="#/account">' + ic('user') + 'บัญชีผู้เรียน</a>' +
        (isTeacher() ? '<a href="#/admin">' + ic('gear') + 'จัดการบทเรียน</a>' : '<a href="#/results">' + ic('chart') + 'ผลการเรียน</a>') +
        '<button type="button" data-act="logout">' + ic('logout') + 'ออกจากระบบ</button></div></div>';
    }
    var demo = API.remote ? '' : '<div class="demobar"><div class="in gutter"><span><b>โหมดทดลอง</b> ข้อมูลเก็บในเบราว์เซอร์นี้เท่านั้น · <span class="why">' + esc(API.configProblem) + '</span></span>' +
      '<span>บัญชีครู <code>teacher</code> รหัส <code>teacher1234</code></span><span>รหัสชั้นเรียน <code>' + esc(API.demoClassCode() || 'ไม่ต้องใช้') + '</code></span>' +
      '<button type="button" data-act="resetdemo">ล้างข้อมูลทดลอง</button></div></div>';
    return '<header class="topbar" id="topbar"><div class="in gutter"><a class="brand" href="#/" aria-label="ROCK EXPLORER หน้าแรก">' + LOGO +
      '<span><b>ROCK EXPLORER</b><small>บทเรียนออนไลน์ เรื่องทรัพยากรหิน</small></span></a>' +
      '<button class="navtoggle" type="button" data-act="nav" aria-label="เปิดเมนู" aria-expanded="false">' + ic('menu') + '</button>' +
      '<nav class="mainnav" aria-label="เมนูหลัก">' + nav + '</nav>' + acct + '</div></header>' + demo;
  }

  /* ---------- แถบเส้นทางการเรียน ---------- */
  function sidebar(curStep) {
    var items = STEPS.map(function (s, i) {
      var done = stepDone(s.id), locked = stepLocked(s.id);
      var st = done ? '<span class="st ok" title="ทำแล้ว">' + ic('check', '') + '</span>' : (locked ? '<span class="st lock" title="ยังไม่เปิด">' + ic('lock', '') + '</span>' : (s.id === curStep ? '<span class="st">' + ic('chevright', 'ic') + '</span>' : '<span class="st"></span>'));
      return '<li><a href="#/' + s.route + '"' + (s.id === curStep ? ' aria-current="step"' : '') + (locked ? ' class="locked"' : '') + '><span class="n">' + (i + 1) + '</span>' + ic(s.icon) + '<span>' + s.label + '</span>' + st + '</a></li>';
    }).join('');
    var curIdx = 0; STEPS.forEach(function (s, i) { if (s.id === curStep) curIdx = i; });
    return '<aside class="side" id="side"><div class="stick"><h2>เส้นทางการเรียน</h2>' +
      '<button class="sidetoggle" type="button" data-act="side" aria-expanded="false"><span class="cur"><i>' + (curIdx + 1) + '</i>เส้นทางการเรียน: ' + stepLabel(curStep) + '</span>' + ic('chevdown') + '</button>' +
      '<ol class="steps">' + items + '</ol>' +
      '<div class="pace">' + ic('clock') + 'เรียนตามจังหวะของตนเอง</div>' +
      '<div class="deco" style="' + bg('assets/img/deco-sidebar.jpg') + '"></div></div></aside>';
  }
  function shell(step, inner) { return '<div class="shell gutter">' + sidebar(step) + '<main class="main" id="main">' + inner + '</main></div>'; }

  function gate(step) {
    if (!S.user) {
      return '<div class="card locked-msg">' + ic('lock') + '<h2>เข้าสู่ระบบก่อนเริ่มเรียน</h2><p>ระบบจะบันทึกความก้าวหน้า คำตอบ และคะแนนไว้ในบัญชีของคุณ เพื่อกลับมาเรียนต่อได้ทุกเมื่อ</p>' +
        '<div class="actions" style="justify-content:flex-start"><a class="btn" href="#/login" data-act="loginfor" data-r="' + esc(route()) + '">เข้าสู่ระบบ</a><a class="btn ghost" href="#/login" data-act="registerfor" data-r="' + esc(route()) + '">ลงทะเบียนนักเรียน</a></div></div>';
    }
    if (stepLocked(step)) {
      var need = NEED[step];
      var r = STEPS.filter(function (s) { return s.id === need; })[0].route;
      return '<div class="card locked-msg">' + ic('lock') + '<h2>ขั้นตอนนี้ยังไม่เปิด</h2><p>ทำขั้น “' + stepLabel(need) + '” ให้เสร็จก่อน แล้วขั้น “' + stepLabel(step) + '” จะเปิดให้ทันที</p>' +
        '<a class="btn" href="#/' + r + '">ไปที่ ' + stepLabel(need) + ' ' + ic('arrow') + '</a></div>';
    }
    return '';
  }

  /* =====================================================================
     หน้า 1: หน้าแรก
     ===================================================================== */
  function nextStep() {
    if (!S.me) return null;
    var cur = S.me.steps.current;
    return cur ? STEPS.filter(function (s) { return s.id === cur; })[0] : null;
  }
  function viewHome() {
    var L = C().lessons, st = C().settings;
    var ns = nextStep();
    var primary;
    if (isTeacher()) primary = '<a class="btn lg" href="#/admin">ไปหน้าจัดการบทเรียน ' + ic('arrow') + '</a>';
    else if (ns && ns.id !== 'pretest') primary = '<a class="btn lg" href="#/' + ns.route + '">เรียนต่อ: ' + ns.label + ' ' + ic('arrow') + '</a>';
    else if (S.me && !ns) primary = '<a class="btn lg" href="#/results">ดูผลการเรียน ' + ic('arrow') + '</a>';
    else primary = '<a class="btn lg" href="#/pretest">เริ่มทดสอบก่อนเรียน ' + ic('arrow') + '</a>';
    var hero = '<section class="hero gutter"><div class="copy">' +
      '<span class="eyebrow">' + esc(st.subject) + '</span>' +
      '<h1>เปิดโลก<span>ทรัพยากรหิน</span></h1>' +
      '<p class="lead">เรียนรู้ด้วยตนเอง ผ่านเนื้อหา หิน 3 มิติ และกิจกรรมทบทวน</p>' +
      '<div class="ctas">' + primary + '<a class="btn ghost lg" href="#path" data-act="scroll" data-to="path">ดูเส้นทางการเรียนรู้</a></div>' +
      '<div class="feats"><span class="feat">' + ic('clock') + 'เรียนตามจังหวะของตนเอง</span><span class="feat">' + ic('cube') + 'สำรวจผ่าน AR</span><span class="feat">' + ic('chart') + 'ติดตามความก้าวหน้า</span></div>' +
      '</div><div class="art"><div class="heroimg" style="position:relative">' +
      '<img src="assets/img/hero-rocks.jpg" alt="หินแกรนิต หินทราย และหินอ่อน วางบนแท่นหิน" width="972" height="448" style="width:100%;height:auto;-webkit-mask-image:linear-gradient(90deg,transparent 0%,#000 20%);mask-image:linear-gradient(90deg,transparent 0%,#000 20%)">' +
      '<svg viewBox="0 0 972 448" preserveAspectRatio="none" aria-hidden="true" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none"><path d="M286 99 249 115M498 205 467 222M832 105 807 121" stroke="#fff" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>' +
      pin('หินอัคนี', 32.5, 18.5, 25.2, 26.1) + pin('หินตะกอน', 54.4, 42, 47.7, 50.2) + pin('หินแปร', 89.9, 19.5, 82.7, 27.7) +
      '<span style="position:absolute;left:43%;top:8%">' + ARCUBE + '</span></div></div></section>';
    var path = '<section class="section gutter" id="path"><h2>เส้นทางการเรียนรู้ 6 ขั้นตอน</h2><div class="path">' +
      STEPS.map(function (s, i) {
        var cls = stepDone(s.id) ? 'done' : (S.me && S.me.steps.current === s.id ? 'cur' : '');
        return '<a href="#/' + s.route + '" class="' + cls + '"><span class="num">' + (stepDone(s.id) ? ic('check', 'ic') : i + 1) + '</span><span class="lbl">' + ic(s.icon) + s.label + '</span></a>';
      }).join('') + '</div></section>';
    var cards = '<section class="section gutter"><h2>เลือกสำรวจหิน 3 ประเภท</h2><div class="rockcards">' +
      L.order.map(function (k) {
        var l = L[k];
        return '<a class="rockcard" href="#/lesson/' + k + '/origin"><span class="img" style="' + bg(l.homeImage) + '" role="img" aria-label="' + esc(l.th) + '"></span><span class="tx"><b class="' + (k === 'sedimentary' ? 'sed' : '') + '">' + esc(l.th) + '</b><span>' + esc(l.en) + '</span><em>ดูบทเรียน ' + ic('arrow') + '</em></span></a>';
      }).join('') + '</div></section>';
    var foot = '<footer class="foot gutter"><span>' + esc(st.schoolName) + (st.contact ? ' · ' + esc(st.contact) : '') + '</span><span>ภาพหินในเว็บไซต์เป็นภาพจำลองประกอบการเรียนรู้ · โมเดล 3 มิติแสดงเครดิตผู้สแกนในห้องสำรวจหิน</span></footer>';
    return hero + path + cards + foot;
  }
  function pin(text, x, y, dx, dy) {
    return '<span class="tagpin" style="left:' + x + '%;top:' + y + '%"><span>' + esc(text) + '</span></span>' +
      '<span class="tagpin" style="left:' + dx + '%;top:' + dy + '%"><em></em></span>';
  }

  /* =====================================================================
     เข้าสู่ระบบ / ลงทะเบียน
     ===================================================================== */
  var authTab = 'login';
  function viewLogin() {
    if (S.user) return '<div class="auth gutter"><div class="card pad"><h1>เข้าสู่ระบบแล้ว</h1><p>คุณเข้าสู่ระบบในชื่อ ' + esc(S.user.name) + '</p><a class="btn" href="#/">ไปหน้าแรก</a></div></div>';
    var st = C().settings;
    var login = '<form class="form" id="loginForm" novalidate>' +
      '<label for="li-id">ชื่อผู้ใช้หรือเลขประจำตัวนักเรียน<input class="field" id="li-id" name="id" autocomplete="username" required></label>' +
      '<label for="li-pw">รหัสผ่าน<input class="field" id="li-pw" name="password" type="password" autocomplete="current-password" required></label>' +
      '<p class="err" id="li-err" role="alert"></p><button class="btn lg" type="submit">เข้าสู่ระบบ</button>' +
      '<p class="muted" style="font-size:.9rem">ลืมรหัสผ่าน แจ้งครูผู้สอนเพื่อตั้งรหัสผ่านใหม่</p></form>';
    var reg = '<form class="form" id="regForm" novalidate>' +
      '<label for="rg-id">เลขประจำตัวนักเรียน<input class="field" id="rg-id" name="id" inputmode="numeric" autocomplete="username" required></label>' +
      '<label for="rg-name">ชื่อ–นามสกุล<input class="field" id="rg-name" name="name" autocomplete="name" required></label>' +
      '<div class="row2"><label for="rg-room">ห้อง <small>เช่น 4/1</small><input class="field" id="rg-room" name="room" required></label>' +
      '<label for="rg-no">เลขที่<input class="field" id="rg-no" name="no" inputmode="numeric"></label></div>' +
      '<div class="row2"><label for="rg-pw">ตั้งรหัสผ่าน <small>อย่างน้อย 4 ตัว</small><input class="field" id="rg-pw" name="password" type="password" autocomplete="new-password" required></label>' +
      '<label for="rg-pw2">ยืนยันรหัสผ่าน<input class="field" id="rg-pw2" name="password2" type="password" autocomplete="new-password" required></label></div>' +
      (st.needClassCode ? '<label for="rg-code">รหัสชั้นเรียน <small>ขอรหัสจากครูผู้สอน</small><input class="field" id="rg-code" name="classCode" autocapitalize="characters" required></label>' : '') +
      '<p class="err" id="rg-err" role="alert"></p><button class="btn lg" type="submit">ลงทะเบียนและเริ่มเรียน</button></form>';
    return '<div class="auth gutter"><div class="pic" style="' + bg('assets/img/quiz-rocks.jpg') + '" role="img" aria-label="ตัวอย่างหินสามประเภท"></div>' +
      '<div class="card box"><h1>บัญชีผู้เรียน</h1><p class="muted">เข้าสู่ระบบเพื่อบันทึกความก้าวหน้า แล้วกลับมาเรียนต่อจากบัญชีเดิมได้ทุกเมื่อ</p>' +
      '<div class="tabbar" role="tablist"><button type="button" role="tab" data-act="authtab" data-t="login" aria-selected="' + (authTab === 'login') + '">เข้าสู่ระบบ</button><button type="button" role="tab" data-act="authtab" data-t="reg" aria-selected="' + (authTab === 'reg') + '">ลงทะเบียนนักเรียน</button></div>' +
      (authTab === 'login' ? login : reg) + '</div></div>';
  }
  function bindLogin() {
    var lf = $('#loginForm'), rf = $('#regForm');
    if (lf) lf.addEventListener('submit', function (e) {
      e.preventDefault();
      var fd = new FormData(lf), err = $('#li-err');
      if (!fd.get('id') || !fd.get('password')) { err.textContent = 'กรอกชื่อผู้ใช้และรหัสผ่าน'; return; }
      busy(lf, true);
      API.call('login', { id: fd.get('id'), password: fd.get('password') }).then(afterAuth, function (x) { err.textContent = x.message; busy(lf, false); });
    });
    if (rf) rf.addEventListener('submit', function (e) {
      e.preventDefault();
      var fd = new FormData(rf), err = $('#rg-err');
      if (fd.get('password') !== fd.get('password2')) { err.textContent = 'รหัสผ่านทั้งสองช่องไม่ตรงกัน'; return; }
      busy(rf, true);
      API.call('register', { id: fd.get('id'), name: fd.get('name'), room: fd.get('room'), no: fd.get('no'), password: fd.get('password'), classCode: fd.get('classCode') || '' })
        .then(afterAuth, function (x) { err.textContent = x.message; busy(rf, false); });
    });
  }
  function busy(form, on) {
    $$('button[type="submit"]', form).forEach(function (b) {
      if (on) { b.dataset.label = b.textContent; b.textContent = 'กำลังดำเนินการ…'; } else if (b.dataset.label) b.textContent = b.dataset.label;
      b.disabled = on;
    });
  }
  function afterAuth(res) {
    API.setSession({ token: res.token, user: res.user });
    S.user = res.user; S.test = null; S.review = null; S.ws = null;
    loadMe().then(function () {
      toast('ยินดีต้อนรับ ' + (res.user.name || res.user.id));
      var to = S.after || (res.user.role === 'teacher' ? 'admin' : '');
      S.after = '';
      go(to);
    });
  }
  function loadMe() {
    if (!API.session()) { S.user = null; S.me = null; return Promise.resolve(); }
    return API.call('me', {}).then(function (d) {
      S.user = d.user; S.me = d.steps ? d : null;
    }, function () { API.setSession(null); S.user = null; S.me = null; });
  }
  function setMe(d) { if (d && d.steps) { S.me = d; S.user = d.user; } }

  /* =====================================================================
     หน้า 2 และ 9: แบบทดสอบก่อน/หลังเรียน
     ===================================================================== */
  function viewTest(kind) {
    var step = kind === 'pre' ? 'pretest' : 'posttest';
    var title = kind === 'pre' ? 'ทดสอบก่อนเรียน' : 'ทดสอบหลังเรียน';
    var sub = kind === 'pre' ? 'สำรวจความรู้เดิม เรื่องทรัพยากรหิน' : 'วัดความรู้หลังเรียน เรื่องทรัพยากรหิน';
    var note = kind === 'pre' ? 'ตอบตามความเข้าใจของตนเอง คะแนนส่วนนี้ใช้เปรียบเทียบพัฒนาการ' : 'วัดจุดประสงค์เดียวกับแบบทดสอบก่อนเรียน ผ่านเกณฑ์เมื่อได้ร้อยละ ' + C().settings.passPercent + ' ขึ้นไป';
    var count = kind === 'pre' ? C().counts.pre : C().counts.post;
    var head = '<nav class="crumb" aria-label="ตำแหน่ง"><a href="#/">หน้าแรก</a><span>/</span><b>' + title + '</b></nav>' +
      '<div class="ptitle"><h1>' + title + '</h1><p class="sub">' + sub + '</p></div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:10px 18px;align-items:center"><span class="pill">' + count + ' ข้อ</span><span class="hint">' + ic('bookmark') + esc(note) + '</span></div>';
    if (isTeacher()) return shell(step, head + '<div class="card locked-msg">' + ic('gear') + '<h2>มุมมองของครู</h2><p>ครูดูตัวอย่าง แก้ไขข้อสอบ ตัวเลือก เฉลย และคำอธิบายได้ที่หน้าจัดการ</p><a class="btn" href="#/admin/tests">แก้ไขข้อสอบ</a></div>');
    var g = gate(step); if (g) return shell(step, head + g);
    var T = S.test;
    if (!T || T.kind !== kind) { loadTest(kind); return shell(step, head + '<div class="loading"><div class="spin"></div></div>'); }
    if (!T.canSubmit || (T.last && !T.retaking)) return shell(step, head + testDone(kind, T));
    return shell(step, head + testBody(T));
  }
  function loadTest(kind) {
    API.call('getTest', { kind: kind }).then(function (d) {
      var n = d.questions.length, ans = new Array(n).fill(null), idx = 0;
      var local = null;
      try { local = JSON.parse(API.store.get('rockexplorer.draft.' + S.user.id + '.' + kind) || 'null'); } catch (e) { local = null; }
      var dr = d.draft;
      if (local && (!dr || (local.at || '') > (dr.at || ''))) dr = local;
      if (dr && dr.answers) { dr.answers.forEach(function (a, i) { if (i < n && a !== null && a !== undefined && a !== '') ans[i] = Number(a); }); idx = Math.min(Number(dr.index) || 0, n - 1); }
      var retaking = kind === 'post' && d.canSubmit && !!d.last && (!!S.wantRetake || !!(dr && dr.answers && dr.answers.some(function (x) { return x !== null && x !== undefined; })));
      S.wantRetake = false;
      S.test = { kind: kind, questions: d.questions, answers: ans, idx: idx, attempts: d.attempts, maxAttempts: d.maxAttempts, canSubmit: d.canSubmit, last: d.last, retaking: retaking };
      render();
    }, function (e) { toast(e.message, true); S.test = { kind: kind, questions: [], answers: [], idx: 0, canSubmit: false, error: e.message }; render(); });
  }
  function testBody(T) {
    var q = T.questions[T.idx], n = T.questions.length;
    var answered = T.answers.filter(function (a) { return a !== null; }).length;
    var opts = q.choices.map(function (c, i) {
      return '<label class="opt"><input type="radio" name="q" value="' + i + '" data-act="answer"' + (T.answers[T.idx] === i ? ' checked' : '') + '><span>' + TH[i] + '.&nbsp; ' + esc(c) + '</span></label>';
    }).join('');
    var last = T.idx === n - 1;
    var card = '<section class="card qcard" aria-labelledby="qtext">' +
      '<div class="qhead"><span>ข้อ ' + (T.idx + 1) + ' &nbsp;จาก ' + n + '</span>' + (T.kind === 'post' && T.attempts ? '<span class="tag wait">ครั้งที่ ' + (T.attempts + 1) + ' จาก ' + T.maxAttempts + '</span>' : '') + '</div>' +
      '<div class="prog"><div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="' + n + '" aria-valuenow="' + answered + '" aria-label="ตอบแล้ว"><i style="width:' + Math.max(4, answered / n * 100) + '%"></i></div><span class="tnum">' + answered + '/' + n + '</span></div>' +
      (q.image ? '<img src="' + esc(q.image) + '" alt="" style="max-height:260px;object-fit:contain;border-radius:12px">' : '') +
      '<h2 class="qtext" id="qtext">' + esc(q.q) + '</h2>' +
      '<fieldset style="border:0;margin:0;padding:0"><legend class="sr">ตัวเลือกข้อ ' + (T.idx + 1) + '</legend><div class="opts">' + opts + '</div></fieldset>' +
      '<div class="qnav"><div class="l"><button class="btn ghost" type="button" data-act="pause">' + ic('bookmark') + 'บันทึกและพักไว้</button>' +
      (T.idx > 0 ? '<button class="btn quiet" type="button" data-act="qprev">' + ic('back') + 'ข้อก่อนหน้า</button>' : '') + '</div>' +
      (last ? '<button class="btn" type="button" data-act="submittest">ส่งคำตอบ ' + ic('send') + '</button>' : '<button class="btn" type="button" data-act="qnext">ข้อถัดไป ' + ic('arrow') + '</button>') +
      '</div></section>';
    var grid = T.questions.map(function (x, i) {
      return '<button type="button" data-act="qgo" data-i="' + i + '" class="' + (T.answers[i] !== null ? 'ans' : '') + '"' + (i === T.idx ? ' aria-current="true"' : '') + ' aria-label="ข้อ ' + (i + 1) + (T.answers[i] !== null ? ' ตอบแล้ว' : ' ยังไม่ตอบ') + '">' + (i + 1) + '</button>';
    }).join('');
    var side = '<div style="display:grid;gap:18px"><section class="card qlist"><h3>รายการข้อสอบ</h3><div class="qgrid">' + grid + '</div>' +
      '<div class="legend"><span><i class="f"></i>ตอบแล้ว</span><span><i></i>ยังไม่ตอบ</span></div>' +
      (answered === n ? '<button class="btn" type="button" data-act="submittest">ส่งคำตอบ ' + ic('send') + '</button>' : '') + '</section>' +
      '<figure class="card photo" style="margin:0"><img src="assets/img/quiz-rocks.jpg" alt="หินแกรนิต หินทราย และหินอ่อน" loading="lazy"><p>สังเกต คิด และเลือกคำตอบ</p></figure></div>';
    return '<div class="qwrap">' + card + side + '</div>';
  }
  function testDone(kind, T) {
    var a = T.last;
    if (!a) return '<div class="card locked-msg"><p>' + esc(T.error || 'ยังไม่มีข้อสอบ') + '</p></div>';
    if (kind === 'pre') {
      return '<div class="card donebox"><span class="tag ok">ส่งแล้ว</span><h2>ทำแบบทดสอบก่อนเรียนครบแล้ว</h2>' +
        '<div class="scorebig">' + a.score + '/' + a.total + '</div><p>คะแนนนี้ใช้เปรียบเทียบกับแบบทดสอบหลังเรียน เพื่อดูพัฒนาการของตนเอง ไม่นำไปคิดเกรด</p>' +
        '<a class="btn lg" href="#/lessons">ไปศึกษาเนื้อหา ' + ic('arrow') + '</a></div>';
    }
    var passed = a.percent >= Number(C().settings.passPercent || 0);
    var left = T.maxAttempts - T.attempts;
    return '<div class="card donebox"><span class="tag ' + (passed ? 'ok' : 'wait') + '">' + (passed ? 'ผ่านเกณฑ์' : 'ยังไม่ผ่านเกณฑ์') + '</span><h2>ส่งแบบทดสอบหลังเรียนแล้ว</h2>' +
      '<div class="scorebig">' + a.score + '/' + a.total + '</div><p>ร้อยละ ' + a.percent + ' · เกณฑ์ผ่านร้อยละ ' + C().settings.passPercent + '</p>' +
      '<div class="actions" style="justify-content:flex-start"><a class="btn lg" href="#/results">ดูผลและเฉลย ' + ic('arrow') + '</a>' +
      (left > 0 && T.canSubmit ? '<button class="btn ghost lg" type="button" data-act="retake">ทำแบบทดสอบอีกครั้ง (เหลือ ' + left + ' ครั้ง)</button>' : '') + '</div></div>';
  }
  var draftTimer;
  function saveDraftSoon(now) {
    var T = S.test; if (!T) return;
    var d = { answers: T.answers, index: T.idx, at: new Date().toISOString() };
    API.store.set('rockexplorer.draft.' + S.user.id + '.' + T.kind, JSON.stringify(d));
    clearTimeout(draftTimer);
    var send = function () { return API.call('saveDraft', { kind: T.kind, answers: T.answers, index: T.idx }).catch(function () { /* เก็บในเครื่องไว้แล้ว */ }); };
    if (now) return send();
    draftTimer = setTimeout(send, 1200);
    return Promise.resolve();
  }
  function submitTest() {
    var T = S.test;
    var missing = []; T.answers.forEach(function (a, i) { if (a === null) missing.push(i + 1); });
    if (missing.length) {
      toast('ยังไม่ได้ตอบข้อ ' + missing.slice(0, 8).join(', ') + (missing.length > 8 ? ' …' : ''), true);
      T.idx = missing[0] - 1; render(); return;
    }
    confirmBox('ส่งคำตอบ?', 'ตอบครบ ' + T.answers.length + ' ข้อแล้ว เมื่อส่งแล้วจะแก้ไขคำตอบไม่ได้', 'ส่งคำตอบ').then(function (yes) {
      if (!yes) return;
      API.call('submitTest', { kind: T.kind, answers: T.answers }).then(function (r) {
        API.store.del('rockexplorer.draft.' + S.user.id + '.' + T.kind);
        setMe(r.state); S.test = null; S.review = null;
        if (T.kind === 'pre') {
          var m = modal('<h2>ส่งแบบทดสอบก่อนเรียนแล้ว</h2><div class="scorebig">' + r.score + '/' + r.total + '</div><p>เก็บคะแนนนี้ไว้เทียบกับหลังเรียน ต่อไปศึกษาเนื้อหาหินทั้ง 3 ประเภท</p><div class="actions"><button class="btn" data-close autofocus>ไปศึกษาเนื้อหา ' + ic('arrow') + '</button></div>',
            { onClose: function () { go('lessons'); } });
          return m;
        }
        go('results');
      }, function (e) { toast(e.message, true); });
    });
  }

  /* =====================================================================
     หน้า 3: ภาพรวมบทเรียน
     ===================================================================== */
  function lessonSeen(type, tab) { return !!(S.me && S.me.lessons && S.me.lessons[type] && S.me.lessons[type][tab]); }
  function viewLessons() {
    var L = C().lessons;
    var head = '<div class="banner"><div class="bg" style="' + bg('assets/img/banner-mountain.jpg') + '"></div>' +
      '<p class="eyebrow">ขั้นที่ 2 • ศึกษาเนื้อหา</p>' +
      '<div class="ptitle"><h1>สำรวจโลกของหิน</h1><p class="sub">เรียนรู้การเกิด เนื้อหิน การจำแนก และประโยชน์ของหิน</p></div>' +
      '<div class="goal" style="margin-top:14px">' + ic('target') + '<span><b>เป้าหมายการเรียนรู้:</b> ' + esc(L.goal) + '</span></div></div>';
    var g = gate('lessons'); if (g) return shell('lessons', head + g);
    var cards = '<div class="lcards">' + L.order.map(function (k) {
      var l = L[k];
      var chips = Object.keys(TAB_META).map(function (t) {
        var seen = lessonSeen(k, t);
        return '<a class="chip' + (seen ? ' seen' : '') + '" href="#/lesson/' + k + '/' + t + '">' + ic(TAB_META[t].icon) + TAB_META[t].th + (seen ? ic('check', 'ic ok') : '') + '</a>';
      }).join('');
      return '<article class="card lcard"><div class="img" style="' + bg(l.cardImage) + '" role="img" aria-label="' + esc(l.th) + '"><span class="no">บทที่ ' + l.no + '</span></div>' +
        '<div class="bd"><h3 class="' + (k === 'sedimentary' ? 'sed' : '') + '">' + esc(l.th) + '</h3><span class="en">' + esc(l.en) + '</span><p class="d">' + esc(l.cardText) + '</p>' +
        '<div class="chips">' + chips + '</div><a class="btn" href="#/lesson/' + k + '/origin">เข้าสู่บทเรียน ' + ic('arrow') + '</a></div></article>';
    }).join('') + '</div>';
    var cyc = '<section class="card cycle"><div><h3>' + esc(L.cycle.title) + '</h3><p>' + esc(L.cycle.text) + '</p></div>' +
      '<div class="rocks"><img src="' + esc(L.igneous.thumb) + '" alt="หินอัคนี">' + curve() + '<img src="' + esc(L.sedimentary.thumb) + '" alt="หินตะกอน">' + curve() + '<img src="' + esc(L.metamorphic.thumb) + '" alt="หินแปร"></div>' +
      '<button class="btn ghost" type="button" data-act="cycle">ดูภาพรวมวัฏจักรหิน ' + ic('arrow') + '</button></section>';
    var nav = '<div class="pnav"><a class="btn ghost" href="#/">' + ic('back') + 'กลับหน้าแรก</a><a class="btn" href="#/ar">ไปสำรวจหิน AR ' + ic('arrow') + '</a></div>';
    return shell('lessons', head + cards + cyc + nav);
  }
  function curve() { return '<svg viewBox="0 0 64 36" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M4 26C18 6 40 4 56 16"/><path d="m46 10 11 6-9 9"/></svg>'; }
  function cycleModal() {
    var svg = '<svg class="cyclesvg" viewBox="0 0 900 560" role="img" aria-label="แผนภาพวัฏจักรหิน">' +
      '<defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill="#188878"/></marker></defs>' +
      box(360, 20, 'แมกมา', 'หินหนืดใต้ผิวโลก', '#FCF4E4') + box(40, 210, 'หินอัคนี', 'แกรนิต บะซอลต์', '#EEF7F3') + box(680, 210, 'หินแปร', 'หินอ่อน ไนส์', '#EEF7F3') +
      box(360, 420, 'หินตะกอน', 'หินทราย หินปูน', '#EEF7F3') + box(90, 430, 'ตะกอน', 'กรวด ทราย โคลน', '#FCF4E4') +
      arrowP('M360 70 C250 80 190 130 160 200', 'การเย็นตัวและตกผลึก', 175, 112) +
      arrowP('M110 270 C100 340 110 390 140 425', 'ผุพัง กร่อน พัดพา', 20, 360) +
      arrowP('M270 470 L355 470', 'สะสม อัดแน่น เชื่อมประสาน', 210, 525) +
      arrowP('M550 440 C640 420 720 360 750 280', 'ความร้อนและความดัน', 640, 420) +
      arrowP('M770 205 C760 120 660 60 545 50', 'การหลอมเหลว', 690, 110) +
      arrowP('M680 240 L265 240', 'ยกตัว ผุพัง (หินทุกชนิดผุพังได้)', 330, 228) +
      arrowP('M760 285 C700 420 400 470 230 455', '', 0, 0) +
      '</svg>';
    function box(x, y, t, s, fill) { return '<g><rect x="' + x + '" y="' + y + '" width="180" height="70" rx="14" fill="' + fill + '" stroke="#188878" stroke-width="2"/><text x="' + (x + 90) + '" y="' + (y + 32) + '" text-anchor="middle" font-size="22" font-weight="800" fill="#153E3D">' + t + '</text><text x="' + (x + 90) + '" y="' + (y + 56) + '" text-anchor="middle" font-size="15" fill="#5B726F">' + s + '</text></g>'; }
    function arrowP(d, label, lx, ly) { return '<path d="' + d + '" fill="none" stroke="#188878" stroke-width="2.5" marker-end="url(#ah)"/>' + (label ? '<text x="' + lx + '" y="' + ly + '" font-size="15" fill="#126B5F" font-weight="600">' + label + '</text>' : ''); }
    modal('<h2>ภาพรวมวัฏจักรหิน</h2><p>หินทั้ง 3 ประเภทเปลี่ยนเป็นกันได้ตลอดเวลาทางธรณีวิทยา เส้นทางไม่จำเป็นต้องวนครบรอบ เช่น หินอัคนีอาจถูกแปรสภาพเป็นหินแปรได้โดยตรง</p><div style="overflow-x:auto"><div style="min-width:620px">' + svg + '</div></div><div class="actions"><button class="btn" data-close>ปิด</button></div>', { wide: true });
  }

  /* =====================================================================
     หน้า 4–6: หินอัคนี หินตะกอน หินแปร
     ===================================================================== */
  function viewLesson(type, tab) {
    var L = C().lessons, l = L[type];
    if (!l) return shell('lessons', '<div class="card locked-msg"><h2>ไม่พบบทเรียนนี้</h2><a class="btn" href="#/lessons">กลับหน้าบทเรียน</a></div>');
    if (!l.tabs[tab]) tab = 'origin';
    var t = l.tabs[tab];
    var head = '<div class="banner"><div class="bg" style="' + bg(l.banner) + '"></div><span style="position:absolute;right:22%;top:0;z-index:1">' + ARCUBE + '</span>' +
      '<nav class="crumb" aria-label="ตำแหน่ง"><a href="#/lessons">บทเรียน</a><span>/</span><b>' + esc(l.th) + '</b></nav>' +
      '<div class="ptitle"><h1>' + esc(l.th) + '</h1><span class="en">' + esc(l.en) + '</span><p class="sub">' + esc(l.tagline) + '</p></div></div>';
    var g = gate('lessons'); if (g) return shell('lessons', head + g);
    var tabs = '<div class="tabs" role="tablist" aria-label="หัวข้อบทเรียน">' + Object.keys(TAB_META).map(function (k) {
      return '<button type="button" role="tab" data-act="ltab" data-type="' + type + '" data-tab="' + k + '" aria-selected="' + (k === tab) + '">' + ic(TAB_META[k].icon) + TAB_META[k].th + (lessonSeen(type, k) && k !== tab ? ic('check', 'ic seen') : '') + '</button>';
    }).join('') + '</div>';
    var fig = '<figure class="figure" data-fit style="margin:0"><img src="' + esc(t.image) + '" alt="ตัวอย่าง' + esc(l.th) + '">' +
      (t.imageLabels || []).map(function (lb) { return '<span class="figlabel" data-x="' + Number(lb.x) + '" data-y="' + Number(lb.y) + '" style="left:' + Number(lb.x) + '%;top:' + Number(lb.y) + '%">' + esc(lb.text) + '</span>'; }).join('') + '</figure>';
    var panel = '<section class="card panel" aria-live="polite"><h2>' + rich(t.heading) + '</h2>' + (t.intro ? '<p class="intro">' + esc(t.intro) + '</p>' : '') + layout(t) +
      (t.observe ? '<div class="observe">' + ic('bulb') + '<span><b>ชวนสังเกต:</b> ' + esc(t.observe) + '</span></div>' : '') + '</section>';
    var bottom;
    if (l.observeCard) {
      bottom = '<div class="duo"><div class="card mini"><span class="ico">' + ic('search') + '</span><div><b>' + esc(l.observeCard.title) + '</b><p>' + esc(l.observeCard.text) + '</p></div>' + (l.observeCard.image ? '<img src="' + esc(l.observeCard.image) + '" alt="">' : '') + '</div>' +
        '<div class="card mini"><span class="ico">' + ic('leaf') + '</span><div><b>ประโยชน์ของ' + esc(l.th) + '</b><p>' + esc(l.usesShort) + '</p></div>' + (l.usesCard && l.usesCard.image ? '<img src="' + esc(l.usesCard.image) + '" alt="">' : '') + '</div></div>';
    } else {
      bottom = '<div class="duo"><div class="card mini"><span class="ico">' + ic('save') + '</span><div><b>สรุปจำง่าย</b><p>' + esc(l.summary) + '</p></div></div>' +
        '<div class="card mini"><span class="ico">' + ic('leaf') + '</span><div><b>ประโยชน์ของ' + esc(l.th) + '</b><p>' + esc(l.usesShort) + '</p></div></div></div>';
    }
    var order = L.order, i = order.indexOf(type);
    var prev = i > 0 ? '<a class="btn ghost" href="#/lesson/' + order[i - 1] + '/origin">' + ic('back') + 'ย้อนกลับ: ' + esc(L[order[i - 1]].th) + '</a>' : '<a class="btn ghost" href="#/lessons">' + ic('back') + 'กลับหน้าบทเรียน</a>';
    var tabKeys = Object.keys(TAB_META), ti = tabKeys.indexOf(tab);
    var next;
    if (ti < tabKeys.length - 1) next = '<a class="btn" href="#/lesson/' + type + '/' + tabKeys[ti + 1] + '">ต่อไป: ' + TAB_META[tabKeys[ti + 1]].th + ' ' + ic('arrow') + '</a>';
    else if (i < order.length - 1) next = '<a class="btn" href="#/lesson/' + order[i + 1] + '/origin">ศึกษา' + esc(L[order[i + 1]].th) + ' ' + ic('arrow') + '</a>';
    else next = '<a class="btn" href="#/ar">ไปสำรวจหิน AR ' + ic('arrow') + '</a>';
    return shell('lessons', head + tabs + '<div class="lmain">' + fig + panel + '</div>' + bottom + '<div class="pnav">' + prev + next + '</div>');
  }
  function layout(t) {
    var out = '';
    if (t.layout === 'cards') {
      out += '<div style="display:grid;gap:10px">' + (t.items || []).map(function (it) {
        return '<div class="icard">' + ic(it.icon && I[it.icon] ? it.icon : 'leaf') + '<div><b>' + esc(it.title) + '</b><p>' + esc(it.text) + '</p>' + (it.tag ? '<span class="tagline">' + esc(it.tag) + '</span>' : '') + '</div></div>';
      }).join('') + '</div>';
    } else if (t.layout === 'steps') {
      out += '<ol class="slist">' + (t.items || []).map(function (it, i) { return '<li><span class="n">' + (i + 1) + '</span><div><b>' + esc(it.title) + '</b><p>' + esc(it.text) + '</p></div></li>'; }).join('') + '</ol>';
    } else if (t.layout === 'list') {
      out += '<div class="list">' + (t.items || []).map(function (it) { return '<div><b>' + esc(it.title) + '</b><p>' + esc(it.text) + '</p>' + (it.tag ? '<span>' + esc(it.tag) + '</span>' : '') + '</div>'; }).join('') + '</div>';
    } else if (t.layout === 'table' && t.table) {
      out += '<div class="tblwrap"><table class="tbl"><thead><tr>' + t.table.head.map(function (h) { return '<th scope="col">' + esc(h) + '</th>'; }).join('') + '</tr></thead><tbody>' +
        t.table.rows.map(function (r) { return '<tr>' + r.map(function (c, j) { return j === 0 ? '<th scope="row">' + esc(c) + '</th>' : '<td>' + esc(c) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
    } else if (t.layout === 'agents') {
      out += '<div class="ichips">' + (t.chips || []).map(function (c) { return '<span class="ichip out">' + ic(c.icon && I[c.icon] ? c.icon : 'leaf') + esc(c.text) + '</span>'; }).join('') + '</div>';
      out += '<div class="pairs">' + (t.pairs || []).map(function (p) {
        return '<div class="pair"><b>' + esc(p.from) + '</b><img src="' + esc(p.fromImage) + '" alt="' + esc(p.from) + '"><svg class="ar" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' + I.arrow + '</svg><img src="' + esc(p.toImage) + '" alt="' + esc(p.to) + '"><span class="to"><b>' + esc(p.to) + '</b><span>' + esc(p.text) + '</span></span></div>';
      }).join('') + '</div>';
      out += '<div class="cmp">' + (t.compare || []).map(function (c) { return '<div><img src="' + esc(c.image) + '" alt="' + esc(c.title) + '"><div><b>' + esc(c.title) + '</b><span>' + esc(c.text) + '</span></div></div>'; }).join('') + '</div>';
    }
    if (t.layout !== 'agents' && t.chips && t.chips.length) {
      out += (t.chipsTitle ? '<b style="color:var(--ink)">' + esc(t.chipsTitle) + '</b>' : '') + '<div class="ichips">' + t.chips.map(function (c) { return '<span class="ichip ' + esc(c.tone || '') + '">' + ic(c.icon && I[c.icon] ? c.icon : 'leaf') + esc(c.text) + '</span>'; }).join('') + '</div>';
    }
    if (t.note) out += '<p class="note">' + esc(t.note) + '</p>';
    return out;
  }
  /* ปรับภาพบทเรียนให้สูงพอดีกับกรอบเนื้อหา แล้ววางป้ายตามตำแหน่งจริงบนภาพที่ถูกครอบตัด */
  function fitFigures() {
    $$('.figure[data-fit]').forEach(function (fig) {
      var img = fig.querySelector('img');
      if (!img || !img.naturalWidth) { if (img) img.addEventListener('load', fitFigures, { once: true }); return; }
      var w = fig.clientWidth, iw = img.naturalWidth, ih = img.naturalHeight, natH = w * ih / iw;
      var panel = fig.nextElementSibling, side = panel && panel.offsetTop === fig.offsetTop;
      var h = side ? Math.max(natH, Math.min(panel.offsetHeight, w * 0.95)) : natH;
      fig.style.aspectRatio = 'auto'; fig.style.height = Math.round(h) + 'px';
      var sc = Math.max(w / iw, h / ih), ox = (w - iw * sc) / 2, oy = (h - ih * sc) / 2;
      fig.querySelectorAll('.figlabel').forEach(function (lb) {
        var x = ox + Number(lb.dataset.x) / 100 * iw * sc, y = oy + Number(lb.dataset.y) / 100 * ih * sc;
        var half = lb.offsetWidth / 2 + 8;
        lb.style.left = Math.min(Math.max(x, half), w - half) + 'px';
        lb.style.top = Math.min(Math.max(y, 24), h - 24) + 'px';
      });
    });
  }
  window.addEventListener('resize', function () { clearTimeout(fitFigures.t); fitFigures.t = setTimeout(fitFigures, 120); });
  function markLesson(type, tab) {
    if (!isStudent() || stepLocked('lessons') || lessonSeen(type, tab)) return;
    API.call('saveProgress', { lesson: { type: type, tab: tab }, route: 'lesson/' + type + '/' + tab }).then(function (d) {
      var wasDone = stepDone('lessons'); setMe(d);
      if (!wasDone && stepDone('lessons')) toast('ศึกษาเนื้อหาครบทั้ง 3 บทแล้ว ต่อไปสำรวจหิน AR');
      $$('.steps').length && refreshSide('lessons');
    }).catch(function () { /* ลองใหม่ครั้งหน้า */ });
  }
  function refreshSide(step) { var s = $('#side'); if (s) { var w = document.createElement('div'); w.innerHTML = sidebar(step); s.replaceWith(w.firstChild); } }

  /* =====================================================================
     หน้า 7: ห้องสำรวจหิน AR
     ===================================================================== */
  var CATS = [['ign', 'หินอัคนี'], ['sed', 'หินตะกอน'], ['met', 'หินแปร']];
  function rocksOf(cat) { return (C().rocks || []).filter(function (r) { return r.cat === cat; }); }
  function rockById(id) { return (C().rocks || []).filter(function (r) { return r.id === id; })[0]; }
  function arSeenCat(cat) { if (!S.me || !S.me.ar) return false; return Object.keys(S.me.ar).some(function (id) { var r = rockById(id); return r && r.cat === cat; }); }
  function viewAR(rid) {
    var head = '<div class="arhead"><div class="ptitle"><h1 style="font-size:clamp(2rem,1.4rem + 2.2vw,3.2rem)">ห้องสำรวจหิน AR</h1><p class="sub">หมุน ขยาย และสังเกตเนื้อหินได้รอบด้าน</p></div>';
    var g = gate('ar'); if (g) return shell('ar', head + '</div>' + g);
    var rock = rockById(rid) || rockById(S.ar.rock) || rocksOf('ign')[0];
    if (!rock) return shell('ar', head + '</div><div class="card locked-msg">ยังไม่มีข้อมูลหิน</div>');
    S.ar.rock = rock.id; S.ar.cat = rock.cat;
    var seg = '<div class="seg" role="tablist" aria-label="ประเภทหิน">' + CATS.map(function (c) {
      return '<button type="button" role="tab" data-act="arcat" data-cat="' + c[0] + '" aria-selected="' + (c[0] === rock.cat) + '">' + c[1] + (arSeenCat(c[0]) ? ic('check', 'ok') : '') + '</button>';
    }).join('') + '</div>';
    var thumbs = rocksOf(rock.cat).map(function (r) {
      var seen = S.me && S.me.ar && S.me.ar[r.id];
      var sw = 'rgb(' + (r.sw || [180, 180, 180]).join(',') + ')';
      return '<button type="button" class="thumb" data-act="arrock" data-id="' + r.id + '" aria-current="' + (r.id === rock.id) + '"><span class="t" style="' + (r.image ? bg(r.image) : '') + '">' + (r.image ? '' : '<i style="background:' + sw + '"></i>') + '</span>' +
        (r.model === 'none' ? '<span class="nm">ไม่มีโมเดล</span>' : '') + (seen ? '<span class="seen">' + ic('check', '') + '</span>' : '') + '<span>' + esc(r.th.replace(/^หิน/, '')) + '</span></button>';
    }).join('');
    var stage = '<section class="stage' + (S.ar.pins ? '' : ' nohs') + '" id="stage" aria-label="โมเดลหิน 3 มิติ">' + ARCUBE +
      '<model-viewer id="mv" camera-controls touch-action="pan-y" ' + (S.ar.spin ? 'auto-rotate ' : '') + 'auto-rotate-delay="2500" rotation-per-second="16deg" shadow-intensity="0.9" shadow-softness="0.9" exposure="1.05" environment-image="neutral" ar ar-modes="webxr scene-viewer quick-look" ar-scale="fixed" ar-placement="floor" camera-orbit="20deg 65deg auto" min-camera-orbit="auto 5deg auto" max-camera-orbit="auto 175deg auto" interaction-prompt="none" alt="โมเดลสามมิติของ' + esc(rock.th) + '"><span slot="ar-button" hidden></span><span slot="progress-bar"></span></model-viewer>' +
      '<div class="name"><b>' + esc(rock.th) + '</b> • ' + esc(rock.en) + '</div>' +
      '<div class="state" id="arstate"><div><div class="spin"></div><span>กำลังโหลดโมเดล…</span></div></div>' +
      '<div class="arbottom"><div class="thumbs" role="list" aria-label="ตัวอย่างหิน">' + thumbs + '</div>' +
      '<div class="tools"><button type="button" data-act="arspin" aria-pressed="' + S.ar.spin + '">' + ic('rotate') + 'หมุน</button><button type="button" data-act="arzoom">' + ic('zoom') + 'ขยาย</button>' +
      '<button type="button" data-act="arpins" aria-pressed="' + S.ar.pins + '">' + ic('crosshair') + 'จุดสังเกต</button><button type="button" data-act="arreset">' + ic('home') + 'คืนมุมมอง</button></div></div></section>';
    var side = '<aside class="card arside"><h2>วางหินในโลกจริง</h2><div class="arprev"><img src="assets/img/ar-table.jpg" alt="ตัวอย่างหินแกรนิตเสมือนวางบนโต๊ะ"><span>ตัวอย่างมุมมอง AR</span></div>' +
      '<button class="btn lg" type="button" data-act="arcam">' + ic('camera') + 'เปิดกล้องเพื่อดู AR</button>' +
      '<div class="arsteps"><div><span class="n">1</span>' + ic('cube') + 'เลือกตัวอย่างหิน</div><div><span class="n">2</span>' + ic('scan') + 'สแกนพื้นราบ</div><div><span class="n">3</span>' + ic('orbit') + 'วางและเดินดูรอบด้าน</div></div>' +
      '<div class="arhelp">' + ic('help') + '<span><b>อุปกรณ์ไม่รองรับ AR?</b> หมุนดูโมเดล 3 มิติได้</span></div></aside>';
    var seen = '<div class="seenrow"><b>สำรวจแล้ว:</b>' + CATS.map(function (c) { var ok = arSeenCat(c[0]); return '<span class="' + (ok ? 'ok' : '') + '">' + (ok ? ic('check', '') : '') + c[1] + '</span>'; }).join('') + '<span class="muted" style="border:0;background:none">สำรวจอย่างน้อยกลุ่มละ 1 ก้อนเพื่อผ่านขั้นนี้</span></div>';
    var info = '<section class="card arinfo" id="arinfo">' + rockInfo(rock) + '</section>';
    var foot = '<div class="arfoot"><a class="btn ghost" href="#/lessons">' + ic('back') + 'กลับไปศึกษาเนื้อหา</a><div class="sandnote">' + ic('bulb') + esc(C().settings.arNote) + '</div><a class="btn lg" href="#/worksheet">ไปทำใบงาน ' + ic('arrow') + '</a></div>';
    return shell('ar', head + seg + '</div>' + seen + '<div class="arwrap"><div style="display:grid;gap:16px;min-width:0">' + stage + info + '</div>' + side + '</div>' + foot);
  }
  function rockInfo(r) {
    var rows = [['เนื้อหิน', r.tex], ['กลุ่ม', r.chip || ''], ['องค์ประกอบ', r.comp || ''], ['แร่ประกอบหิน', r.minT], ['หินเดิม', r.protoT || ''], ['ระดับการแปรสภาพ', r.gradeT || ''], ['การเกิด', r.origin], ['พบในประเทศไทย', r.thai || ''], ['ทำไมจึงเป็นเช่นนี้', r.why]]
      .filter(function (x) { return x[1]; });
    return '<h3>ข้อมูล' + esc(r.th) + ' <span class="muted" style="font-weight:400;font-size:1rem">' + esc(r.en) + '</span></h3>' +
      (r.note ? '<p class="note">' + esc(r.note) + '</p>' : '') +
      '<dl class="kv">' + rows.map(function (x) { return '<dt>' + x[0] + '</dt><dd>' + esc(x[1]) + '</dd>'; }).join('') + '</dl>' +
      (r.scan ? '<p class="credit">โมเดลสแกน: <a href="' + esc(r.scan.src) + '" target="_blank" rel="noopener">' + esc(r.scan.title) + '</a> โดย ' + esc(r.scan.author) + ' · สัญญาอนุญาต <a href="' + esc(r.scan.licUrl) + '" target="_blank" rel="noopener">' + esc(r.scan.lic) + '</a> · ปรับขนาดไฟล์และมาตราส่วนเพื่อใช้ในชั้นเรียน</p>' : '');
  }
  var modelCache = {};
  function modelSrc(r) {
    if (r.model === 'none') return Promise.reject(new Error('none'));
    var url = r.model || ((cfg.MODEL_BASE || 'scans/') + r.id + '.' + (cfg.MODEL_EXT || 'glb'));
    if (!/\.glb\.txt(\?|$)/.test(url)) return Promise.resolve(url);
    if (modelCache[url]) return modelCache[url];
    modelCache[url] = fetch(url).then(function (res) {
      if (!res.ok) throw new Error('ไม่พบไฟล์โมเดล');
      return res.text();
    }).then(function (txt) {
      var bin = atob(txt.trim()), n = bin.length, u = new Uint8Array(n);
      for (var i = 0; i < n; i++) u[i] = bin.charCodeAt(i);
      return URL.createObjectURL(new Blob([u], { type: 'model/gltf-binary' }));
    });
    modelCache[url].catch(function () { delete modelCache[url]; });
    return modelCache[url];
  }
  function arState(html) { var s = $('#arstate'); if (!s) return; if (!html) { s.hidden = true; return; } s.hidden = false; s.innerHTML = '<div>' + html + '</div>'; }
  function bindAR() {
    var mv = $('#mv'); if (!mv) return;
    var r = rockById(S.ar.rock);
    if (!window.customElements || !customElements.get('model-viewer')) {
      var wait = setTimeout(function () { if (!customElements.get('model-viewer')) arState('<b>ยังโหลดตัวแสดงโมเดล 3 มิติไม่ได้</b><span>ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต แล้วเปิดหน้านี้อีกครั้ง</span>'); }, 12000);
      if (window.customElements) customElements.whenDefined('model-viewer').then(function () { clearTimeout(wait); if ($('#mv') === mv) loadRock(mv, r); });
      return;
    }
    loadRock(mv, r);
  }
  function noModel(r, msg) {
    arState((r.image ? '<img src="' + esc(r.image) + '" alt="">' : '') + '<b>' + msg + '</b><span>อ่านข้อมูลหินด้านล่าง หรือเลือกตัวอย่างอื่น</span>');
    markAR(r);
  }
  function loadRock(mv, r) {
    arState('<div class="spin"></div><span>กำลังโหลดโมเดล' + esc(r.th) + '…</span>');
    mv.querySelectorAll('.hs').forEach(function (h) { h.remove(); });
    if (r.model === 'none') { noModel(r, 'ยังไม่มีโมเดล 3 มิติของ' + r.th); return; }
    modelSrc(r).then(function (u) {
      if (S.ar.rock !== r.id || !document.body.contains(mv)) return;
      mv.addEventListener('load', function onLoad() {
        mv.removeEventListener('load', onLoad);
        arState(null);
        markAR(r);
      });
      mv.addEventListener('error', function onErr() { mv.removeEventListener('error', onErr); noModel(r, 'โหลดโมเดล' + r.th + 'ไม่สำเร็จ'); });
      mv.src = u;
      (r.hs || []).forEach(function (h) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'hs'; b.slot = 'hotspot-' + h.k;
        b.dataset.position = h.p.join(' '); b.dataset.normal = h.n.join(' ');
        b.dataset.visibilityAttribute = 'visible';
        b.setAttribute('aria-label', h.t + ': ' + h.d);
        b.innerHTML = '<span class="lab">' + esc(h.t) + '</span><span class="tip">' + esc(h.d) + '</span>';
        b.addEventListener('click', function (e) { e.stopPropagation(); var on = !b.classList.contains('on'); mv.querySelectorAll('.hs').forEach(function (x) { x.classList.remove('on'); }); b.classList.toggle('on', on); });
        mv.appendChild(b);
      });
    }, function () { noModel(r, 'โหลดโมเดล' + r.th + 'ไม่สำเร็จ'); });
  }
  function markAR(r) {
    if (!isStudent() || (S.me && S.me.ar && S.me.ar[r.id])) return;
    var before = stepDone('ar');
    API.call('saveProgress', { ar: r.id, route: 'ar/' + r.id }).then(function (d) {
      setMe(d);
      var th = $('.thumb[data-id="' + r.id + '"] .t'); if (th && !th.parentNode.querySelector('.seen')) th.insertAdjacentHTML('afterend', '<span class="seen">' + ic('check', '') + '</span>');
      var row = $('.seenrow'); if (row) { var w = document.createElement('div'); w.innerHTML = '<div class="seenrow"><b>สำรวจแล้ว:</b>' + CATS.map(function (c) { var ok = arSeenCat(c[0]); return '<span class="' + (ok ? 'ok' : '') + '">' + (ok ? ic('check', '') : '') + c[1] + '</span>'; }).join('') + '<span class="muted" style="border:0;background:none">สำรวจอย่างน้อยกลุ่มละ 1 ก้อนเพื่อผ่านขั้นนี้</span></div>'; row.replaceWith(w.firstChild); }
      if (!before && stepDone('ar')) { toast('สำรวจหินครบทั้ง 3 ประเภทแล้ว ต่อไปทำใบงาน'); refreshSide('ar'); }
    }).catch(function () { /* ข้าม */ });
  }
  function arCamera() {
    var mv = $('#mv');
    if (mv && mv.canActivateAR) { try { mv.activateAR(); return; } catch (e) { /* แสดงคำแนะนำ */ } }
    var inFrame = false; try { inFrame = window.self !== window.top; } catch (e) { inFrame = true; }
    var link = location.href.split('#')[0] + '#/ar/' + S.ar.rock;
    var qr = '';
    if (!inFrame && /^https?:/.test(location.protocol) && typeof window.qrcode === 'function') {
      try { var q = window.qrcode(0, 'M'); q.addData(link); q.make(); qr = '<div class="qr" style="justify-self:center">' + q.createSvgTag({ cellSize: 5, margin: 2, scalable: true }) + '</div>'; } catch (e) { qr = ''; }
    }
    modal('<h2>เปิด AR บนโทรศัพท์มือถือ</h2><p>อุปกรณ์นี้ยังเปิดกล้อง AR ไม่ได้ ใช้การหมุนดูโมเดล 3 มิติแทนได้ หรือเปิดหน้านี้บนมือถือ Android ที่รองรับ ARCore (Chrome) หรือ iPhone/iPad (Safari)</p>' +
      (qr ? qr + '<p style="text-align:center">สแกน QR เพื่อเปิด' + esc((rockById(S.ar.rock) || {}).th || '') + 'บนมือถือ แล้วกดปุ่ม “เปิดกล้องเพื่อดู AR”</p>' : '') +
      '<ol style="margin:0;padding-left:22px;display:grid;gap:6px"><li>เลือกตัวอย่างหิน แล้วกด “เปิดกล้องเพื่อดู AR”</li><li>ส่องกล้องไปที่พื้นหรือโต๊ะ แล้วขยับมือถือช้า ๆ ให้ระบบสแกนพื้นราบ</li><li>แตะเพื่อวางหิน แล้วเดินดูรอบด้าน ขนาดหินในจอเท่ากับขนาดจริงโดยประมาณ</li></ol>' +
      '<div class="actions"><button class="btn" data-close>เข้าใจแล้ว</button></div>');
  }

  /* =====================================================================
     หน้า 8: ใบงาน
     ===================================================================== */
  var TYPE_OPTS = [['', 'เลือกประเภท'], ['igneous', 'หินอัคนี'], ['sedimentary', 'หินตะกอน'], ['metamorphic', 'หินแปร']];
  function viewWorksheet() {
    var W = C().worksheet;
    var head = '<div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-start;gap:16px"><div class="ptitle"><h1>' + esc(W.heading) + '</h1><p class="sub">' + esc(W.subheading) + '</p></div>' +
      '<button class="btn ghost lg" type="button" data-act="wsdownload">' + ic('download') + 'ดาวน์โหลดใบงาน</button></div>';
    if (isTeacher()) return shell('worksheet', head + '<div class="card locked-msg">' + ic('gear') + '<h2>มุมมองของครู</h2><p>ตรวจใบงานของนักเรียนและแก้ไขตัวอย่างหิน A–C ได้ที่หน้าจัดการ</p><a class="btn" href="#/admin/worksheets">ไปตรวจใบงาน</a></div>');
    var g = gate('worksheet'); if (g) return shell('worksheet', head + g);
    var ws = (S.me && S.me.worksheet) || null;
    var local = null;
    try { local = JSON.parse(API.store.get('rockexplorer.ws.' + S.user.id) || 'null'); } catch (e) { local = null; }
    var ans = (local && (!ws || (local.at || '') > (ws.updatedAt || ''))) ? local.answers : ((ws && ws.answers) || { rows: {}, questions: {} });
    S.ws = ans;
    var lockedWs = ws && ws.status === 'reviewed';
    var showCheck = ws && (ws.status === 'submitted' || ws.status === 'reviewed' || ws.status === 'returned');
    var status = '';
    if (ws && ws.status === 'submitted') status = '<div class="status">' + ic('check') + '<b>ส่งใบงานแล้ว</b><span class="muted">รอครูตรวจ · แก้ไขแล้วส่งใหม่ได้จนกว่าครูจะตรวจ</span></div>';
    if (ws && ws.status === 'returned') status = '<div class="status warn">' + ic('edit') + '<b>ครูส่งใบงานกลับให้แก้ไข</b>' + (ws.feedback ? '<p>ข้อเสนอแนะจากครู: ' + esc(ws.feedback) + '</p>' : '') + '</div>';
    if (lockedWs) status = '<div class="status">' + ic('check') + '<b>ครูตรวจใบงานแล้ว' + (ws.score != null ? ' · คะแนน ' + ws.score : '') + '</b>' + (ws.feedback ? '<p>ข้อเสนอแนะจากครู: ' + esc(ws.feedback) + '</p>' : '') + '</div>';
    var samples = '<div class="wsamples">' + W.samples.map(function (s) { return '<figure class="wsample" style="margin:0"><img src="' + esc(s.image) + '" alt="ตัวอย่าง ' + esc(s.id) + '"><b>ตัวอย่าง ' + esc(s.id) + '</b><span>' + esc(s.caption) + '</span></figure>'; }).join('') + '</div>';
    var rows = W.samples.map(function (s) {
      var r = (ans.rows || {})[s.id] || {};
      var mark = '';
      if (showCheck && ws.autoCheck && ws.autoCheck[s.id] != null && ws.status !== 'submitted') mark = ws.autoCheck[s.id] ? ' ok' : ' no';
      return '<tr><td>' + esc(s.id) + '</td>' +
        '<td><label class="sr" for="ws-obs-' + s.id + '">ลักษณะที่สังเกตของตัวอย่าง ' + s.id + '</label><input class="field" id="ws-obs-' + s.id + '" data-ws="rows.' + s.id + '.obs" value="' + esc(r.obs || '') + '" placeholder="' + esc(s.placeholder || 'บันทึกข้อสังเกต') + '"' + (lockedWs ? ' disabled' : '') + '></td>' +
        '<td><label class="sr" for="ws-type-' + s.id + '">ประเภทหินของตัวอย่าง ' + s.id + '</label><select class="field' + mark + '" id="ws-type-' + s.id + '" data-ws="rows.' + s.id + '.type"' + (lockedWs ? ' disabled' : '') + '>' + TYPE_OPTS.map(function (o) { return '<option value="' + o[0] + '"' + ((r.type || '') === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select></td>' +
        '<td><label class="sr" for="ws-why-' + s.id + '">เหตุผลของตัวอย่าง ' + s.id + '</label><input class="field" id="ws-why-' + s.id + '" data-ws="rows.' + s.id + '.reason" value="' + esc(r.reason || '') + '" placeholder="อธิบายจากหลักฐาน"' + (lockedWs ? ' disabled' : '') + '></td></tr>';
    }).join('');
    var qs = (W.questions || []).map(function (q) {
      return '<section class="card pad" style="display:grid;gap:10px"><label for="ws-q-' + esc(q.id) + '" style="font-size:1.25rem;font-weight:800;color:var(--ink)">' + esc(q.text) + '</label><textarea class="field" id="ws-q-' + esc(q.id) + '" data-ws="questions.' + esc(q.id) + '" placeholder="' + esc(q.placeholder || '') + '"' + (lockedWs ? ' disabled' : '') + '>' + esc((ans.questions || {})[q.id] || '') + '</textarea></section>';
    }).join('');
    var main = '<div style="display:grid;gap:16px;min-width:0"><section class="card pad" style="display:grid;gap:16px"><div><h2 style="font-size:1.6rem;font-weight:800">' + esc(W.title) + '</h2><p>' + esc(W.intro) + '</p></div>' + samples +
      '<div class="tblwrap"><table class="wtable"><thead><tr><th>ตัวอย่าง</th><th>ลักษณะที่สังเกต</th><th>ประเภทหิน</th><th>เหตุผล</th></tr></thead><tbody>' + rows + '</tbody></table></div></section>' + qs + '</div>';
    var file = ws && ws.fileName ? '<div class="attached">' + ic('clip') + '<b>แนบแล้ว:</b> ' + (/^data:/.test(ws.fileUrl) ? esc(ws.fileName) : '<a href="' + esc(ws.fileUrl) + '" target="_blank" rel="noopener">' + esc(ws.fileName) + '</a>') + '</div>' : '';
    var aside = '<div style="display:grid;gap:14px"><section class="card guide"><h3>แนวทางทำใบงาน</h3><ul>' + (W.guide || []).map(function (g) { return '<li><i>' + ic('check', '') + '</i>' + esc(g) + '</li>'; }).join('') + '</ul>' + (W.tip ? '<div class="tip">' + ic('bulb') + esc(W.tip) + '</div>' : '') + '</section>' +
      '<section class="card guide">' + (lockedWs ? '' : '<label class="drop" id="drop" for="wsfile">' + ic('clip') + '<b>แนบไฟล์ใบงาน</b><small>PDF / JPG / PNG ไม่เกิน ' + (C().settings.maxUploadMB || 10) + ' MB</small><input type="file" id="wsfile" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"></label>') + file + '</section></div>';
    var actions = lockedWs ? '<div class="actions"><a class="btn lg" href="#/posttest">ไปทดสอบหลังเรียน ' + ic('arrow') + '</a></div>' :
      '<div class="actions"><button class="btn ghost lg" type="button" data-act="wssave">' + ic('save') + 'บันทึกฉบับร่าง</button><button class="btn lg" type="button" data-act="wssubmit" style="min-width:220px">' + ic('send') + (ws && ws.status === 'submitted' ? 'ส่งใบงานอีกครั้ง' : 'ส่งใบงาน') + '</button>' +
      '<a class="btn ghost lg' + (stepDone('worksheet') ? '' : ' disabled') + '" href="#/posttest"' + (stepDone('worksheet') ? '' : ' aria-disabled="true" tabindex="-1"') + '>ไปทดสอบหลังเรียน ' + ic('arrow') + '</a></div>';
    return shell('worksheet', head + status + '<div class="wswrap">' + main + aside + '</div>' + actions);
  }
  function wsCollect() {
    var a = { rows: {}, questions: {} };
    $$('[data-ws]').forEach(function (el) {
      var p = el.getAttribute('data-ws').split('.');
      if (p[0] === 'rows') { a.rows[p[1]] = a.rows[p[1]] || {}; a.rows[p[1]][p[2]] = el.value; } else a.questions[p[1]] = el.value;
    });
    return a;
  }
  function wsLocal() { API.store.set('rockexplorer.ws.' + S.user.id, JSON.stringify({ answers: wsCollect(), at: new Date().toISOString() })); }
  function wsSend(submit) {
    var a = wsCollect();
    var run = function () {
      return API.call('saveWorksheet', { answers: a, submit: submit }).then(function (d) {
        setMe(d); API.store.del('rockexplorer.ws.' + S.user.id);
        toast(submit ? 'ส่งใบงานแล้ว ครูจะตรวจและให้ข้อเสนอแนะ' : 'บันทึกฉบับร่างแล้ว');
        render();
      }, function (e) { toast(e.message, true); });
    };
    if (!submit) return run();
    confirmBox('ส่งใบงาน?', 'ครูจะเห็นคำตอบและไฟล์แนบของคุณ แก้ไขได้จนกว่าครูจะตรวจ', 'ส่งใบงาน').then(function (y) { if (y) run(); });
  }
  function wsUpload(file) {
    if (!file) return;
    var okType = /^(application\/pdf|image\/jpeg|image\/png)$/.test(file.type) || /\.(pdf|jpe?g|png)$/i.test(file.name);
    if (!okType) { toast('แนบได้เฉพาะไฟล์ PDF, JPG หรือ PNG', true); return; }
    var max = (Number(C().settings.maxUploadMB) || 10) * 1048576;
    if (file.size > max) { toast('ไฟล์ใหญ่เกิน ' + (max / 1048576) + ' MB', true); return; }
    var mime = file.type || (/\.pdf$/i.test(file.name) ? 'application/pdf' : /\.png$/i.test(file.name) ? 'image/png' : 'image/jpeg');
    var rd = new FileReader();
    var drop = $('#drop'); if (drop) drop.querySelector('b').textContent = 'กำลังอัปโหลด…';
    rd.onload = function () {
      var b64 = String(rd.result).split(',')[1] || '';
      wsLocal();
      API.call('uploadWorksheetFile', { name: file.name, mime: mime, data: b64 }).then(function (d) { setMe(d); toast('แนบไฟล์ ' + file.name + ' แล้ว'); render(); }, function (e) { toast(e.message, true); render(); });
    };
    rd.onerror = function () { toast('อ่านไฟล์ไม่สำเร็จ', true); };
    rd.readAsDataURL(file);
  }

  /* =====================================================================
     หน้า 9: ผลการเรียน
     ===================================================================== */
  function viewResults() {
    var head = '<nav class="crumb"><a href="#/posttest">ทดสอบหลังเรียน</a><span>/</span><b>สรุปผล</b></nav>' +
      '<div class="ptitle"><h1>ผลทดสอบหลังเรียน</h1><p class="sub">เปรียบเทียบความรู้ก่อน–หลัง และทบทวนจุดที่ควรพัฒนา</p></div>';
    if (isTeacher()) return shell('posttest', head + '<div class="card locked-msg">' + ic('chart') + '<h2>ผลการเรียนของทั้งชั้น</h2><p>ดูคะแนนก่อน–หลังเรียนของนักเรียนทุกคนและส่งออกเป็นไฟล์ตารางได้ที่หน้าจัดการ</p><a class="btn" href="#/admin">ไปหน้าจัดการ</a></div>');
    if (!S.user) return shell('posttest', head + gate('posttest'));
    var me = S.me, pre = me && me.pre, post = me && me.post;
    if (!post) {
      return shell('posttest', head + '<div class="stats">' + stat('quiz', 'ก่อนเรียน', pre ? pre.score + '/' + pre.total : '–', pre ? Math.round(pre.percent) + '%' : 'ยังไม่ได้ทำ') +
        stat('quizok', 'หลังเรียน', '–', 'ยังไม่ได้ทำ') + stat('chart', 'ความก้าวหน้า', me ? me.steps.count + '/6' : '0/6', 'ขั้นตอนที่ทำแล้ว') + '</div>' +
        '<div class="card locked-msg">' + ic('quizok') + '<h2>ยังไม่มีผลทดสอบหลังเรียน</h2><p>เรียนให้ครบตามเส้นทาง แล้วทำแบบทดสอบหลังเรียนเพื่อดูพัฒนาการและเฉลยพร้อมคำอธิบาย</p>' +
        (nextStep() ? '<a class="btn" href="#/' + nextStep().route + '">ไปที่ขั้นต่อไป: ' + nextStep().label + ' ' + ic('arrow') + '</a>' : '') + '</div>');
    }
    if (!S.review) {
      API.call('review', { kind: 'post' }).then(function (d) { S.review = d; render(); }, function (e) { S.review = { items: [], error: e.message }; render(); });
    }
    var gain = pre ? post.score - pre.score : null;
    var passed = post.percent >= Number(C().settings.passPercent || 0);
    var banner = '<section class="rbanner"><span class="chk">' + ic('check', '') + '</span><div><h2>' + (passed ? 'ทำแบบทดสอบครบแล้ว' : 'ส่งแบบทดสอบแล้ว · ยังไม่ผ่านเกณฑ์') + '</h2><p>' + (passed ? 'มองเห็นพัฒนาการ และเลือกกลับไปทบทวนได้' : 'ทบทวนหัวข้อที่แนะนำ แล้วลองทำแบบทดสอบอีกครั้ง') + '</p></div><span class="rk" style="' + bg('assets/img/result-rocks.jpg') + '"></span></section>';
    var stats = '<div class="stats">' + stat('quiz', 'ก่อนเรียน', pre ? pre.score + '/' + pre.total : '–', pre ? Math.round(pre.percent) + '%' : '') +
      stat('quizok', 'หลังเรียน', post.score + '/' + post.total, Math.round(post.percent) + '%') +
      stat('chart', gain != null && gain < 0 ? 'เปลี่ยนแปลง' : 'เพิ่มขึ้น', gain != null ? (gain > 0 ? gain : gain) + ' คะแนน' : '–', 'จากคะแนนเต็ม ' + post.total) + '</div>';
    var R = S.review;
    var acc;
    if (!R) acc = '<div class="loading" style="min-height:160px"><div class="spin"></div></div>';
    else if (R.error) acc = '<p class="err">' + esc(R.error) + '</p>';
    else {
      var items = R.items.slice().map(function (it, i) { it.no = i + 1; return it; });
      var wrong = items.filter(function (it) { return it.chosen !== it.answer; });
      var showAll = S.showAll;
      var list = (showAll ? items : (wrong.length ? wrong : items.slice(0, 3)));
      acc = '<div class="acc">' + list.map(function (it, k) {
        var ok = it.chosen === it.answer;
        return '<details' + (k === 0 ? ' open' : '') + '><summary><span>' + it.no + '. ' + esc(it.q) + '</span>' + ic('chevdown', 'ic chev') + '</summary><div class="ans">' +
          (ok ? '' : '<div class="row no">' + '<span class="mark no">' + ic('close', '') + '</span>คำตอบของคุณ: ' + esc(TH[it.chosen] + '. ' + it.choices[it.chosen]) + '</div>') +
          '<div class="row ok"><span class="mark ok">' + ic('check', '') + '</span>คำตอบ: ' + esc(TH[it.answer] + '. ' + it.choices[it.answer]) + '</div>' +
          (it.explain ? '<p class="ex">' + esc(it.explain) + '</p>' : '') + '</div></details>';
      }).join('') + '</div>';
      if (!wrong.length && !showAll) acc = '<p class="ok-msg">ตอบถูกทุกข้อ ยอดเยี่ยม</p>' + acc;
    }
    var revs = reviewLinks(post);
    var left = me.postMaxAttempts - me.postAttempts;
    var rgrid = '<div class="rgrid"><section class="card pad" style="display:grid;gap:14px"><h2 style="font-size:1.6rem;font-weight:800">ทบทวนคำตอบพร้อมคำอธิบาย</h2>' + acc + '</section>' +
      '<section class="card pad" style="display:grid;gap:14px"><h2 style="font-size:1.6rem;font-weight:800">กลับไปทบทวน</h2><div class="revlist">' + revs + '</div>' +
      (!passed && left > 0 ? '<button class="btn ghost" type="button" data-act="retake2">ทำแบบทดสอบหลังเรียนอีกครั้ง (เหลือ ' + left + ' ครั้ง)</button>' : '') + '</section></div>';
    var foot = '<div class="pnav"><button class="btn ghost lg" type="button" data-act="showall">' + (S.showAll ? 'ดูเฉพาะข้อที่ควรทบทวน' : 'ดูคำตอบทุกข้อ') + '</button>' +
      (stepDone('survey') ? '<a class="btn lg" href="#/survey">ดูสถานะการเรียน ' + ic('chevright') + '</a>' : '<a class="btn lg" href="#/survey">ทำแบบสอบถามความพึงพอใจ ' + ic('chevright') + '</a>') + '</div>';
    return shell('posttest', head + banner + stats + rgrid + foot);
  }
  function stat(icon, label, big, small) { return '<div class="card stat"><span class="ico">' + ic(icon) + '</span><div><b>' + label + '</b><strong>' + big + '</strong><span>' + small + '</span></div></div>'; }
  function reviewLinks(post) {
    var L = C().lessons;
    var topics = [['ign', 'igneous'], ['sed', 'sedimentary'], ['met', 'metamorphic']].map(function (x) {
      var bt = (post.byTopic || {})[x[0]] || { score: 0, total: 0 };
      return { cat: x[0], type: x[1], score: bt.score, total: bt.total, pct: bt.total ? bt.score / bt.total : 1 };
    }).sort(function (a, b) { return a.pct - b.pct; });
    var label = { igneous: ['การเกิดหินอัคนี', 'origin'], sedimentary: ['ลักษณะหินตะกอน', 'texture'], metamorphic: ['เนื้อหินแปร', 'texture'] };
    return topics.map(function (t) {
      return '<a href="#/lesson/' + t.type + '/' + label[t.type][1] + '"><img src="' + esc(L[t.type].thumb) + '" alt=""><span>' + label[t.type][0] + '<small>' + TYPE_TH[t.type] + ' ตอบถูก ' + t.score + '/' + t.total + ' ข้อ</small></span>' + ic('arrow') + '</a>';
    }).join('');
  }

  /* =====================================================================
     หน้า 10: แบบสอบถามความพึงพอใจ
     ===================================================================== */
  function viewSurvey() {
    var SV = C().survey;
    var head = '<p class="eyebrow">' + esc(C().settings.subject) + '</p><div class="ptitle"><h1>' + esc(SV.title) + '</h1><p class="sub">' + esc(SV.subtitle) + '</p></div>' +
      '<div class="goal" style="max-width:fit-content">' + ic('leaf') + esc(SV.note) + '</div>';
    if (isTeacher()) return shell('survey', head + '<div class="card locked-msg">' + ic('gear') + '<h2>มุมมองของครู</h2><p>ดูค่าเฉลี่ยความพึงพอใจและข้อเสนอแนะของนักเรียน และส่งออกเป็นไฟล์ตารางได้ที่หน้าจัดการ</p><a class="btn" href="#/admin">ไปหน้าจัดการ</a></div>');
    var g = gate('survey'); if (g) return shell('survey', head + g);
    if (stepDone('survey')) {
      var me = S.me;
      return shell('survey', head + '<section class="card complete"><span class="big">' + ic('check', '') + '</span><h2>เรียนครบทุกกิจกรรมแล้ว</h2><p>' + esc(SV.thanks) + ' · ' + esc(SV.thanksSub) + '</p>' +
        '<div class="stats" style="width:100%">' + stat('quiz', 'ก่อนเรียน', me.pre ? me.pre.score + '/' + me.pre.total : '–', '') + stat('quizok', 'หลังเรียน', me.post ? me.post.score + '/' + me.post.total : '–', '') + stat('chart', 'ความก้าวหน้า', '6/6', 'ขั้นตอน') + '</div>' +
        '<div class="actions" style="justify-content:center"><a class="btn ghost" href="#/results">ดูผลการเรียน</a><a class="btn" href="#/ar">กลับไปสำรวจหินต่อ</a></div></section>');
    }
    var rows = SV.items.map(function (t, i) {
      return '<tr><th scope="row">' + esc(t) + '</th>' + [5, 4, 3, 2, 1].map(function (v) {
        return '<td><label><input type="radio" name="sv' + i + '" value="' + v + '" aria-label="' + esc(t) + ' ระดับ ' + v + ' ' + esc(SV.scale[v - 1]) + '"></label></td>';
      }).join('') + '</tr>';
    }).join('');
    var form = '<form id="svForm" novalidate style="display:grid;gap:16px;min-width:0"><div class="svhead"><h2>ประเมินประสบการณ์การเรียนรู้</h2><span class="muted">5 ' + esc(SV.scale[4]) + ' • 4 ' + esc(SV.scale[3]) + ' • 3 ' + esc(SV.scale[2]) + ' • 2 ' + esc(SV.scale[1]) + ' • 1 ' + esc(SV.scale[0]) + '</span></div>' +
      '<div style="overflow-x:auto"><table class="likert"><thead><tr><th scope="col" style="text-align:left">รายการประเมิน</th><th scope="col">5</th><th scope="col">4</th><th scope="col">3</th><th scope="col">2</th><th scope="col">1</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '<label for="sv-comment" style="display:flex;align-items:center;gap:10px;font-size:1.4rem;font-weight:800;color:var(--ink)">ข้อเสนอแนะเพิ่มเติม <span class="tag">ไม่บังคับ</span></label>' +
      '<textarea class="field" id="sv-comment" name="comment" placeholder="สิ่งที่ชอบ หรือสิ่งที่อยากให้ปรับปรุง"></textarea><p class="err" id="sv-err" role="alert"></p>' +
      '<div class="duo"><a class="btn ghost lg" href="#/results">' + ic('back') + 'ย้อนกลับ</a><button class="btn lg" type="submit">ส่งแบบสอบถาม ' + ic('arrow') + '</button></div></form>';
    var thanks = '<aside class="thanks"><div class="top">' + CHAT + '<h3>' + esc(SV.thanks).replace('สำรวจ', 'สำรวจ<br>') + '</h3><p>' + esc(SV.thanksSub) + '</p></div><div class="img" style="' + bg('assets/img/survey-rocks.jpg') + '"></div></aside>';
    return shell('survey', head + '<section class="card svwrap">' + form + thanks + '</section>');
  }
  function bindSurvey() {
    var f = $('#svForm'); if (!f) return;
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var n = C().survey.items.length, r = [], miss = [];
      for (var i = 0; i < n; i++) { var c = f.querySelector('input[name="sv' + i + '"]:checked'); if (c) r.push(Number(c.value)); else { r.push(null); miss.push(i + 1); } }
      if (miss.length) { $('#sv-err').textContent = 'กรุณาประเมินให้ครบทุกข้อ (ยังไม่ได้ประเมินข้อ ' + miss.join(', ') + ')'; return; }
      var btn = f.querySelector('button[type="submit"]'); btn.disabled = true;
      API.call('submitSurvey', { ratings: r, comment: $('#sv-comment').value }).then(function (d) { setMe(d); toast('ส่งแบบสอบถามแล้ว ขอบคุณครับ'); render(); }, function (x) { $('#sv-err').textContent = x.message; btn.disabled = false; });
    });
  }

  /* =====================================================================
     บัญชีผู้เรียน
     ===================================================================== */
  function viewAccount() {
    if (!S.user) { S.after = 'account'; return viewLogin(); }
    var u = S.user, me = S.me;
    var prog = me ? '<div class="funnel">' + STEPS.map(function (s, i) {
      var d = stepDone(s.id);
      return '<div><span>' + (i + 1) + '. ' + s.label + '</span><span class="track"><i style="width:' + (d ? 100 : 0) + '%"></i></span><span class="tag ' + (d ? 'ok' : '') + '">' + (d ? 'ทำแล้ว' : 'ยังไม่ทำ') + '</span></div>';
    }).join('') + '</div>' : '';
    return '<div class="admin gutter" style="max-width:1000px"><h1>บัญชีผู้เรียน</h1>' +
      '<section class="card pad" style="display:grid;gap:8px"><h2 style="font-size:1.4rem">' + esc(u.name || u.id) + '</h2><p class="muted">' + (isTeacher() ? 'ครูผู้สอน · ชื่อผู้ใช้ ' + esc(u.id) : 'เลขประจำตัว ' + esc(u.id) + (u.room ? ' · ห้อง ' + esc(u.room) : '') + (u.no ? ' · เลขที่ ' + esc(u.no) : '')) + '</p>' +
      (me ? '<p>เรียนแล้ว <b>' + me.steps.count + '</b> จาก 6 ขั้นตอน' + (me.lastRoute ? ' · เรียนต่อจากหน้าล่าสุดได้' : '') + '</p>' : '') +
      '<div class="actions" style="justify-content:flex-start">' + (me && me.lastRoute ? '<a class="btn" href="#/' + esc(me.lastRoute) + '">เรียนต่อจากที่ค้างไว้ ' + ic('arrow') + '</a>' : '') + (nextStep() ? '<a class="btn ghost" href="#/' + nextStep().route + '">ขั้นต่อไป: ' + nextStep().label + '</a>' : '') + (isTeacher() ? '<a class="btn" href="#/admin">ไปหน้าจัดการ</a>' : '') + '</div></section>' +
      (me ? '<section class="card pad" style="display:grid;gap:12px"><h2 style="font-size:1.3rem">ความก้าวหน้า</h2>' + prog + '</section>' : '') +
      '<section class="card pad" style="display:grid;gap:12px;max-width:560px"><h2 style="font-size:1.3rem">เปลี่ยนรหัสผ่าน</h2><form class="form" id="pwForm" novalidate>' +
      '<label for="pw-old">รหัสผ่านเดิม<input class="field" id="pw-old" type="password" autocomplete="current-password"></label>' +
      '<label for="pw-new">รหัสผ่านใหม่<input class="field" id="pw-new" type="password" autocomplete="new-password"></label>' +
      '<p class="err" id="pw-err" role="alert"></p><button class="btn" type="submit">' + ic('key') + 'บันทึกรหัสผ่านใหม่</button></form></section>' +
      '<div><button class="btn danger" type="button" data-act="logout">' + ic('logout') + 'ออกจากระบบ</button></div></div>';
  }
  function bindAccount() {
    var f = $('#pwForm'); if (!f) return;
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      API.call('changePassword', { oldPassword: $('#pw-old').value, newPassword: $('#pw-new').value }).then(function () { toast('เปลี่ยนรหัสผ่านแล้ว'); f.reset(); $('#pw-err').textContent = ''; }, function (x) { $('#pw-err').textContent = x.message; });
    });
  }

  /* =====================================================================
     วาดหน้า
     ===================================================================== */
  function render() {
    if (!S.content) return;
    var r = route(), parts = r.split('/'), html = '', after = null, cls = 'page';
    var app = $('#app');
    switch (parts[0]) {
      case '': case 'home': html = viewHome(); break;
      case 'login': html = viewLogin(); after = bindLogin; break;
      case 'pretest': html = viewTest('pre'); break;
      case 'posttest': html = viewTest('post'); break;
      case 'lessons': html = viewLessons(); break;
      case 'lesson': html = viewLesson(parts[1], parts[2] || 'origin'); after = function () { fitFigures(); if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitFigures); var l = C().lessons[parts[1]]; if (l) markLesson(parts[1], l.tabs[parts[2]] ? parts[2] : 'origin'); }; break;
      case 'ar': html = viewAR(parts[1]); after = bindAR; break;
      case 'worksheet': html = viewWorksheet(); after = bindWorksheet; break;
      case 'results': html = viewResults(); break;
      case 'survey': html = viewSurvey(); after = bindSurvey; break;
      case 'account': html = viewAccount(); after = S.user ? bindAccount : bindLogin; break;
      case 'admin':
        if (!isTeacher()) { html = S.user ? shell('pretest', '<div class="card locked-msg">' + ic('lock') + '<h2>ส่วนนี้สำหรับครูเท่านั้น</h2><a class="btn" href="#/">กลับหน้าแรก</a></div>') : viewLogin(); if (!S.user) { S.after = r; after = bindLogin; } break; }
        html = '<div id="adminroot"></div>'; after = function () { window.RockAdmin.mount($('#adminroot'), ctx(), parts[1] || 'overview'); }; break;
      default: html = viewHome();
    }
    app.innerHTML = topbar(r) + '<div class="' + cls + '">' + html + '</div>';
    document.title = titleFor(parts[0]);
    if (after) after();
    if (isStudent() && /^(pretest|lessons|lesson|ar|worksheet|posttest|results|survey)/.test(r)) rememberRoute(r);
  }
  var routeTimer;
  function rememberRoute(r) {
    clearTimeout(routeTimer);
    routeTimer = setTimeout(function () {
      if (!S.me || S.me.lastRoute === r || route() !== r) return;
      API.call('saveProgress', { route: r }).then(function (d) { if (S.me) S.me.lastRoute = d.lastRoute; }).catch(function () { /* ข้าม */ });
    }, 1500);
  }
  function titleFor(p) {
    var m = { '': 'ROCK EXPLORER', pretest: 'ทดสอบก่อนเรียน · ROCK EXPLORER', lessons: 'บทเรียน · ROCK EXPLORER', lesson: 'บทเรียน · ROCK EXPLORER', ar: 'ห้องสำรวจหิน AR · ROCK EXPLORER', worksheet: 'ใบงาน · ROCK EXPLORER', posttest: 'ทดสอบหลังเรียน · ROCK EXPLORER', results: 'ผลการเรียน · ROCK EXPLORER', survey: 'แบบสอบถาม · ROCK EXPLORER', admin: 'จัดการบทเรียน · ROCK EXPLORER', login: 'เข้าสู่ระบบ · ROCK EXPLORER', account: 'บัญชีผู้เรียน · ROCK EXPLORER' };
    return m[p] || 'ROCK EXPLORER';
  }
  function bindWorksheet() {
    var f = $('#wsfile');
    if (f) f.addEventListener('change', function () { wsUpload(f.files[0]); });
    var d = $('#drop');
    if (d) {
      ['dragenter', 'dragover'].forEach(function (ev) { d.addEventListener(ev, function (e) { e.preventDefault(); d.classList.add('over'); }); });
      ['dragleave', 'drop'].forEach(function (ev) { d.addEventListener(ev, function (e) { e.preventDefault(); d.classList.remove('over'); }); });
      d.addEventListener('drop', function (e) { var file = e.dataTransfer && e.dataTransfer.files[0]; wsUpload(file); });
    }
    $$('[data-ws]').forEach(function (el) { el.addEventListener('input', wsLocal); el.addEventListener('change', wsLocal); });
  }
  function ctx() {
    return { api: API, content: C, setContent: function (c) { S.content = c; }, reloadContent: loadContent, toast: toast, modal: modal, confirm: confirmBox, esc: esc, ic: ic, saveFile: saveFile, user: function () { return S.user; }, go: go };
  }

  /* ---------- การคลิกทั้งหน้า ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-act]');
    var menu = $('.acct .menu');
    if (menu && !e.target.closest('.acct')) { menu.hidden = true; var bt = $('.acct > button'); if (bt) bt.setAttribute('aria-expanded', 'false'); }
    if (!a || a.tagName === 'A' && a.getAttribute('href') && a.getAttribute('href').indexOf('#/') === 0 && a.getAttribute('data-act') !== 'scroll') {
      var link = e.target.closest('a[href^="#/"]');
      if (link && !e.ctrlKey && !e.metaKey && !e.shiftKey && link.target !== '_blank') {
        var tb = $('#topbar'); if (tb) tb.classList.remove('open');
        if (a) handleAct(a, e);
        e.preventDefault(); go(link.getAttribute('href').slice(2));
      }
      return;
    }
    handleAct(a, e);
  });
  function handleAct(a, e) {
    var act = a.getAttribute('data-act');
    var T = S.test;
    switch (act) {
      case 'nav': var tb2 = $('#topbar'); var open = !tb2.classList.contains('open'); tb2.classList.toggle('open', open); a.setAttribute('aria-expanded', open); break;
      case 'acct': var m = a.parentNode.querySelector('.menu'); m.hidden = !m.hidden; a.setAttribute('aria-expanded', String(!m.hidden)); break;
      case 'side': var sd = $('#side'); var o = !sd.classList.contains('open'); sd.classList.toggle('open', o); a.setAttribute('aria-expanded', o); break;
      case 'logout':
        API.call('logout', {}).catch(function () { /* ข้าม */ });
        API.setSession(null); S.user = null; S.me = null; S.test = null; S.review = null; toast('ออกจากระบบแล้ว'); go(''); break;
      case 'resetdemo':
        confirmBox('ล้างข้อมูลทดลอง?', 'บัญชี คำตอบ และคะแนนที่ทดลองไว้ในเบราว์เซอร์นี้จะถูกลบ แล้วเริ่มใหม่พร้อมข้อมูลตัวอย่าง', 'ล้างข้อมูล').then(function (y) {
          if (!y) return; API.resetDemo(); S.user = null; S.me = null; S.test = null; S.review = null; S.content = null; boot();
        }); break;
      case 'scroll': e.preventDefault(); var t = document.getElementById(a.getAttribute('data-to')); if (t) t.scrollIntoView({ block: 'start' }); break;
      case 'loginfor': case 'registerfor': S.after = a.getAttribute('data-r') || ''; authTab = act === 'registerfor' ? 'reg' : 'login'; break;
      case 'authtab': authTab = a.getAttribute('data-t'); render(); break;
      case 'answer':
        if (!T) break; T.answers[T.idx] = Number(a.value); saveDraftSoon();
        var qgb = $('.qgrid button[data-i="' + T.idx + '"]'); if (qgb) qgb.classList.add('ans');
        var bar = $('.bar i'), cnt = T.answers.filter(function (x) { return x !== null; }).length;
        if (bar) { bar.style.width = Math.max(4, cnt / T.answers.length * 100) + '%'; bar.parentNode.setAttribute('aria-valuenow', cnt); bar.parentNode.nextSibling.textContent = cnt + '/' + T.answers.length; }
        if (cnt === T.answers.length && !$('.qlist [data-act="submittest"]')) render();
        break;
      case 'qnext': if (T) { T.idx = Math.min(T.idx + 1, T.questions.length - 1); saveDraftSoon(); render(); focusQ(); } break;
      case 'qprev': if (T) { T.idx = Math.max(T.idx - 1, 0); render(); focusQ(); } break;
      case 'qgo': if (T) { T.idx = Number(a.getAttribute('data-i')); render(); focusQ(); } break;
      case 'pause': saveDraftSoon(true).then(function () { toast('บันทึกคำตอบไว้แล้ว กลับมาทำต่อได้ทุกเมื่อ'); go(''); }); break;
      case 'submittest': submitTest(); break;
      case 'retake': case 'retake2':
        if (S.test && S.test.kind === 'post') { S.test.retaking = true; S.test.answers = S.test.answers.map(function () { return null; }); S.test.idx = 0; }
        else { S.test = null; S.wantRetake = true; }
        go('posttest'); break;
      case 'cycle': cycleModal(); break;
      case 'ltab': go('lesson/' + a.getAttribute('data-type') + '/' + a.getAttribute('data-tab')); break;
      case 'arcat': var first = rocksOf(a.getAttribute('data-cat'))[0]; if (first) go('ar/' + first.id); break;
      case 'arrock': go('ar/' + a.getAttribute('data-id')); break;
      case 'arspin': S.ar.spin = !S.ar.spin; var mv1 = $('#mv'); if (mv1) mv1.autoRotate = S.ar.spin; a.setAttribute('aria-pressed', S.ar.spin); break;
      case 'arpins': S.ar.pins = !S.ar.pins; $('#stage').classList.toggle('nohs', !S.ar.pins); a.setAttribute('aria-pressed', S.ar.pins); break;
      case 'arzoom': var mv2 = $('#mv'); if (mv2 && mv2.getCameraOrbit) { var o2 = mv2.getCameraOrbit(); mv2.cameraOrbit = o2.theta + 'rad ' + o2.phi + 'rad ' + Math.max(o2.radius * 0.72, 0.02) + 'm'; } break;
      case 'arreset': var mv3 = $('#mv'); if (mv3) { mv3.cameraTarget = 'auto auto auto'; mv3.cameraOrbit = '20deg 65deg auto'; mv3.fieldOfView = 'auto'; mv3.querySelectorAll('.hs.on').forEach(function (h) { h.classList.remove('on'); }); } break;
      case 'arcam': arCamera(); break;
      case 'wssave': wsSend(false); break;
      case 'wssubmit': wsSend(true); break;
      case 'wsdownload': fetch('assets/worksheet.pdf').then(function (r) { if (!r.ok) throw new Error(); return r.blob(); }).then(function (b) { return saveFile('ใบงาน-นักสำรวจหิน.pdf', b, 'application/pdf'); }).catch(function () { toast('ไม่พบไฟล์ใบงานสำหรับดาวน์โหลด', true); }); break;
      case 'showall': S.showAll = !S.showAll; render(); break;
    }
  }
  function focusQ() { var q = $('#qtext'); if (q) { q.setAttribute('tabindex', '-1'); q.focus({ preventScroll: true }); } }
  document.addEventListener('keydown', function (e) {
    if (!S.test || !$('.qcard') || /input|textarea|select/i.test((e.target.tagName || '')) && e.target.type !== 'radio') return;
    if (e.key >= '1' && e.key <= '4' && !e.ctrlKey && !e.metaKey) {
      var inp = $$('.opt input')[Number(e.key) - 1]; if (inp) { inp.checked = true; inp.click(); }
    }
  });

  /* ---------- เริ่มต้น ---------- */
  function loadContent() {
    return API.call('publicContent', {}).then(function (c) { S.content = c; return c; });
  }
  function boot() {
    $('#app').innerHTML = '<div class="loading"><div class="spin"></div></div>';
    loadContent().then(loadMe).then(function () {
      render();
    }, function (e) {
      $('#app').innerHTML = '<div class="auth gutter"><div class="card pad" style="display:grid;gap:12px"><h1>เปิดบทเรียนไม่สำเร็จ</h1><p>' + esc(e.message) + '</p><button class="btn" type="button" onclick="location.reload()">ลองอีกครั้ง</button></div></div>';
    });
  }
  window.RockApp = { go: go, render: render, toast: toast };
  boot();
})();
