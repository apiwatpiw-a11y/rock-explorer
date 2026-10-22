/* ROCK EXPLORER — หน้าจัดการสำหรับครู */
window.RockAdmin = (function () {
  'use strict';
  var X, root, tab = 'overview', data = null, content = null, filter = { room: '', q: '', ws: 'pending', test: 'pretest', lesson: 'igneous', rock: '' };
  var W = null, Wkey = null, dirty = false;
  var TABS = [['overview', 'ภาพรวม'], ['students', 'ผู้เรียน'], ['worksheets', 'ตรวจใบงาน'], ['tests', 'ข้อสอบ'], ['lessons', 'เนื้อหาบทเรียน'], ['activities', 'ใบงานและแบบสอบถาม'], ['rocks', 'หินและโมเดล'], ['settings', 'ตั้งค่า']];
  var STEP_TH = ['ทดสอบก่อนเรียน', 'ศึกษาเนื้อหา', 'สำรวจหิน AR', 'ทำใบงาน', 'ทดสอบหลังเรียน', 'ความพึงพอใจ'];
  var STEP_ID = ['pretest', 'lessons', 'ar', 'worksheet', 'posttest', 'survey'];
  var TOPIC_TH = { ign: 'หินอัคนี', sed: 'หินตะกอน', met: 'หินแปร' };
  var TYPE_TH = { igneous: 'หินอัคนี', sedimentary: 'หินตะกอน', metamorphic: 'หินแปร', '': '–' };
  var CAT_TH = { ign: 'หินอัคนี', sed: 'หินตะกอน', met: 'หินแปร' };
  var TH = ['ก', 'ข', 'ค', 'ง'];
  function esc(s) { return X.esc(s); }
  function ic(n, c) { return X.ic(n, c); }
  function $(s) { return root.querySelector(s); }
  function $$(s) { return Array.prototype.slice.call(root.querySelectorAll(s)); }
  function fmtDate(iso) { if (!iso) return '–'; var d = new Date(iso); if (isNaN(d)) return esc(iso); return d.toLocaleString('th-TH', { day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' }); }
  function avg(a) { return a.length ? a.reduce(function (s, x) { return s + x; }, 0) / a.length : null; }
  function sd(a) { var m = avg(a); if (a.length < 2) return null; return Math.sqrt(a.reduce(function (s, x) { return s + (x - m) * (x - m); }, 0) / (a.length - 1)); }
  function f1(x) { return x == null ? '–' : (Math.round(x * 100) / 100).toFixed(2); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function mount(el, ctx, t) {
    X = ctx; root = el; tab = TABS.some(function (x) { return x[0] === t; }) ? t : 'overview';
    root.innerHTML = '<div class="admin gutter"><div class="loading"><div class="spin"></div></div></div>';
    Promise.all([X.api.call('adminData', {}), X.api.call('adminContent', {})]).then(function (r) {
      data = r[0]; content = r[1]; draw();
    }, function (e) { root.innerHTML = '<div class="admin gutter"><div class="card pad"><h1>เปิดหน้าจัดการไม่สำเร็จ</h1><p class="err">' + esc(e.message) + '</p></div></div>'; });
  }
  function refreshData() { return X.api.call('adminData', {}).then(function (d) { data = d; }); }
  function students() {
    return data.students.filter(function (s) {
      if (filter.room && s.room !== filter.room) return false;
      if (filter.q) { var q = filter.q.toLowerCase(); if ((s.id + ' ' + s.name).toLowerCase().indexOf(q) < 0) return false; }
      return true;
    });
  }
  function rooms() { var m = {}; data.students.forEach(function (s) { if (s.room) m[s.room] = 1; }); return Object.keys(m).sort(); }
  function pendingCount() { return data.students.filter(function (s) { return s.worksheet && s.worksheet.status === 'submitted'; }).length; }

  function draw() {
    var tabs = '<div class="atabs" role="tablist">' + TABS.map(function (t) {
      return '<button type="button" role="tab" data-at="' + t[0] + '" aria-selected="' + (t[0] === tab) + '">' + t[1] + (t[0] === 'worksheets' && pendingCount() ? '<span class="badge">' + pendingCount() + '</span>' : '') + '</button>';
    }).join('') + '</div>';
    var body = { overview: vOverview, students: vStudents, worksheets: vWorksheets, tests: vTests, lessons: vLessons, activities: vActivities, rocks: vRocks, settings: vSettings }[tab]();
    root.innerHTML = '<div class="admin gutter"><div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:end;gap:12px"><div><p class="eyebrow">สำหรับครูผู้สอน</p><h1>จัดการบทเรียน</h1></div>' +
      (X.api.remote ? '<span class="tag ok">เชื่อมต่อ Google Sheets</span>' : '<span class="tag wait">โหมดทดลอง · ข้อมูลตัวอย่างในเบราว์เซอร์นี้</span>') + '</div>' + tabs + '<div id="atab" style="display:grid;gap:16px">' + body + '</div></div>';
    bind();
  }
  function roomSelect() {
    return '<label class="sr" for="f-room">ห้อง</label><select class="field" id="f-room" data-f="room" style="width:auto;min-width:150px"><option value="">ทุกห้อง</option>' + rooms().map(function (r) { return '<option' + (filter.room === r ? ' selected' : '') + '>' + esc(r) + '</option>'; }).join('') + '</select>';
  }

  /* ---------- ภาพรวม ---------- */
  function vOverview() {
    var st = students(), n = st.length;
    var done6 = st.filter(function (s) { return s.steps.count === 6; }).length;
    var pre = st.filter(function (s) { return s.pre; }).map(function (s) { return s.pre.score; });
    var post = st.filter(function (s) { return s.post; }).map(function (s) { return s.post.score; });
    var pairs = st.filter(function (s) { return s.pre && s.post; });
    var gain = pairs.map(function (s) { return s.post.score - s.pre.score; });
    var total = (content.posttest.questions || []).length;
    var pass = st.filter(function (s) { return s.post && s.post.percent >= Number(content.settings.passPercent || 0); }).length;
    var sv = st.filter(function (s) { return s.survey; });
    var items = (content.survey.items || []);
    var means = items.map(function (_, i) { return avg(sv.map(function (s) { return Number(s.survey.ratings[i]); }).filter(function (x) { return x; })); });
    var allR = []; sv.forEach(function (s) { s.survey.ratings.forEach(function (x) { allR.push(Number(x)); }); });
    var kpis = '<div class="kpis">' +
      kpi('นักเรียน', n, 'คน') + kpi('เรียนครบ 6 ขั้น', done6, n ? Math.round(done6 / n * 100) + '% ของทั้งหมด' : '') +
      kpi('คะแนนเฉลี่ยก่อนเรียน', f1(avg(pre)), pre.length + ' คน · เต็ม ' + (content.pretest.questions || []).length) +
      kpi('คะแนนเฉลี่ยหลังเรียน', f1(avg(post)), post.length + ' คน · เต็ม ' + total) +
      kpi('พัฒนาการเฉลี่ย', gain.length ? (avg(gain) >= 0 ? '+' : '') + f1(avg(gain)) : '–', pairs.length + ' คนที่มีคะแนนทั้งสองครั้ง') +
      kpi('ผ่านเกณฑ์หลังเรียน', pass, 'เกณฑ์ร้อยละ ' + content.settings.passPercent) +
      kpi('ใบงานรอตรวจ', st.filter(function (s) { return s.worksheet && s.worksheet.status === 'submitted'; }).length, 'ฉบับ') +
      kpi('ความพึงพอใจเฉลี่ย', f1(avg(allR)), sv.length + ' คน · เต็ม 5') + '</div>';
    var funnel = '<section class="card pad" style="display:grid;gap:14px"><h2 style="font-size:1.35rem">ความก้าวหน้าตามเส้นทางการเรียน</h2><div class="funnel">' + STEP_ID.map(function (id, i) {
      var c = st.filter(function (s) { return s.steps.done[id]; }).length;
      return '<div><span>' + (i + 1) + '. ' + STEP_TH[i] + '</span><span class="track"><i style="width:' + (n ? c / n * 100 : 0) + '%"></i></span><span class="tnum">' + c + '/' + n + '</span></div>';
    }).join('') + '</div></section>';
    var topics = ['ign', 'sed', 'met'].map(function (t) {
      var a = [], b = [];
      st.forEach(function (s) { if (s.pre && s.pre.byTopic && s.pre.byTopic[t]) a.push(s.pre.byTopic[t].score / s.pre.byTopic[t].total * 100); if (s.post && s.post.byTopic && s.post.byTopic[t]) b.push(s.post.byTopic[t].score / s.post.byTopic[t].total * 100); });
      return '<div><span>' + TOPIC_TH[t] + '</span><span style="display:grid;gap:4px"><span class="track" title="ก่อนเรียน"><i style="width:' + (avg(a) || 0) + '%;background:#9FC9BE"></i></span><span class="track" title="หลังเรียน"><i style="width:' + (avg(b) || 0) + '%"></i></span></span><span class="tnum" style="font-size:.85rem">' + (avg(a) == null ? '–' : Math.round(avg(a)) + '%') + ' → ' + (avg(b) == null ? '–' : Math.round(avg(b)) + '%') + '</span></div>';
    }).join('');
    var topicCard = '<section class="card pad" style="display:grid;gap:14px"><h2 style="font-size:1.35rem">ร้อยละตอบถูกเฉลี่ยรายหัวข้อ</h2><p class="muted" style="font-size:.9rem">แถบอ่อน = ก่อนเรียน · แถบเข้ม = หลังเรียน</p><div class="funnel">' + topics + '</div></section>';
    var survey = '<section class="card pad" style="display:grid;gap:14px"><h2 style="font-size:1.35rem">ผลแบบสอบถามความพึงพอใจ (' + sv.length + ' คน)</h2><div class="funnel">' + items.map(function (it, i) {
      return '<div><span>' + esc(it) + '</span><span class="track"><i style="width:' + ((means[i] || 0) / 5 * 100) + '%;background:var(--sand)"></i></span><span class="tnum">' + f1(means[i]) + '</span></div>';
    }).join('') + '</div>' + (sv.filter(function (s) { return s.survey.comment; }).length ? '<details><summary style="cursor:pointer;font-weight:600;color:var(--ink)">ข้อเสนอแนะจากนักเรียน</summary><ul style="margin:10px 0 0;padding-left:20px;display:grid;gap:6px">' + sv.filter(function (s) { return s.survey.comment; }).map(function (s) { return '<li>' + esc(s.survey.comment) + ' <span class="muted">— ' + esc(s.name) + '</span></li>'; }).join('') + '</ul></details>' : '') + '</section>';
    return '<div class="toolbar">' + roomSelect() + '<span class="grow"></span>' + exportButtons() + '</div>' + kpis + '<div class="duo">' + funnel + topicCard + '</div>' + survey;
  }
  function kpi(label, val, sub) { return '<div class="card kpi"><span>' + label + '</span><strong>' + val + '</strong><small>' + (sub || '') + '</small></div>'; }
  function exportButtons() {
    return '<button class="btn ghost sm" type="button" data-x="exp-scores">' + ic('download') + 'คะแนนและความก้าวหน้า (.csv)</button>' +
      '<button class="btn ghost sm" type="button" data-x="exp-items">' + ic('download') + 'คำตอบรายข้อ (.csv)</button>' +
      '<button class="btn ghost sm" type="button" data-x="exp-survey">' + ic('download') + 'แบบสอบถาม (.csv)</button>' +
      '<button class="btn ghost sm" type="button" data-x="exp-ws">' + ic('download') + 'ใบงาน (.csv)</button>';
  }

  /* ---------- ผู้เรียน ---------- */
  function wsTag(w) {
    if (!w) return '<span class="tag">ยังไม่เริ่ม</span>';
    return { draft: '<span class="tag">ฉบับร่าง</span>', submitted: '<span class="tag wait">รอตรวจ</span>', reviewed: '<span class="tag ok">ตรวจแล้ว' + (w.score != null ? ' · ' + w.score : '') + '</span>', returned: '<span class="tag bad">ส่งกลับแก้ไข</span>' }[w.status] || '';
  }
  function vStudents() {
    var st = students();
    var rows = st.map(function (s) {
      return '<tr><td class="tnum">' + esc(s.room) + '</td><td class="tnum">' + esc(s.no) + '</td><td class="tnum">' + esc(s.id) + '</td><td>' + esc(s.name) + '</td>' +
        '<td><span class="dots" title="' + s.steps.count + '/6 ขั้น">' + STEP_ID.map(function (id) { return '<i class="' + (s.steps.done[id] ? 'on' : '') + '"></i>'; }).join('') + '</span></td>' +
        '<td class="tnum">' + (s.pre ? s.pre.score + '/' + s.pre.total : '–') + '</td><td class="tnum">' + (s.post ? s.post.score + '/' + s.post.total + (s.postAttempts > 1 ? ' <small class="muted">(' + s.postAttempts + ' ครั้ง)</small>' : '') : '–') + '</td>' +
        '<td>' + wsTag(s.worksheet) + '</td><td>' + (s.survey ? '<span class="tag ok">ส่งแล้ว</span>' : '–') + '</td><td>' + fmtDate(s.lastLogin) + '</td>' +
        '<td><button class="btn ghost sm" type="button" data-x="student" data-id="' + esc(s.id) + '">ดูรายละเอียด</button></td></tr>';
    }).join('');
    return '<div class="toolbar"><label class="sr" for="f-q">ค้นหา</label><input class="field" id="f-q" data-f="q" placeholder="ค้นหาชื่อหรือเลขประจำตัว" value="' + esc(filter.q) + '" style="max-width:300px">' + roomSelect() + '<span class="grow"></span>' + exportButtons() + '</div>' +
      '<p class="muted">นักเรียน ' + st.length + ' คน · นักเรียนลงทะเบียนเองด้วยรหัสชั้นเรียน <b>' + esc(content.settings.classCode || '(ไม่ต้องใช้รหัส)') + '</b> (เปลี่ยนได้ที่แท็บตั้งค่า)</p>' +
      '<div class="tblwrap"><table class="atable"><thead><tr><th>ห้อง</th><th>เลขที่</th><th>เลขประจำตัว</th><th>ชื่อ–นามสกุล</th><th>ความก้าวหน้า</th><th>ก่อนเรียน</th><th>หลังเรียน</th><th>ใบงาน</th><th>แบบสอบถาม</th><th>เข้าใช้ล่าสุด</th><th></th></tr></thead><tbody>' +
      (rows || '<tr><td colspan="11" class="muted" style="text-align:center;padding:30px">ยังไม่มีนักเรียนลงทะเบียน</td></tr>') + '</tbody></table></div>';
  }
  function topicLine(a) {
    if (!a || !a.byTopic) return '';
    return Object.keys(TOPIC_TH).filter(function (t) { return a.byTopic[t]; }).map(function (t) { return TOPIC_TH[t] + ' ' + a.byTopic[t].score + '/' + a.byTopic[t].total; }).join(' · ');
  }
  function openStudent(id) {
    var s = data.students.filter(function (x) { return x.id === id; })[0]; if (!s) return;
    var d = document.createElement('div'); d.className = 'drawer'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true');
    var w = s.worksheet;
    d.innerHTML = '<div><div style="display:flex;justify-content:space-between;gap:10px;align-items:start"><div><h2 style="font-size:1.6rem">' + esc(s.name) + '</h2><p class="muted">เลขประจำตัว ' + esc(s.id) + ' · ห้อง ' + esc(s.room) + ' · เลขที่ ' + esc(s.no) + '</p></div><button class="btn quiet" type="button" data-close aria-label="ปิด">' + ic('close') + '</button></div>' +
      '<section class="card pad" style="display:grid;gap:8px"><b>ความก้าวหน้า ' + s.steps.count + '/6</b><div class="funnel">' + STEP_ID.map(function (sid, i) { return '<div><span>' + STEP_TH[i] + '</span><span class="track"><i style="width:' + (s.steps.done[sid] ? 100 : 0) + '%"></i></span><span>' + (s.steps.done[sid] ? '✓' : '') + '</span></div>'; }).join('') + '</div><small class="muted">ลงทะเบียน ' + fmtDate(s.createdAt) + ' · เข้าใช้ล่าสุด ' + fmtDate(s.lastLogin) + '</small></section>' +
      '<section class="card pad" style="display:grid;gap:6px"><b>คะแนน</b><p>ก่อนเรียน: ' + (s.pre ? s.pre.score + '/' + s.pre.total + ' (' + topicLine(s.pre) + ') · ' + fmtDate(s.pre.submittedAt) : 'ยังไม่ได้ทำ') + '</p>' +
      '<p>หลังเรียน: ' + (s.post ? s.post.score + '/' + s.post.total + ' (' + topicLine(s.post) + ') · ครั้งที่ ' + s.postAttempts + ' · ' + fmtDate(s.post.submittedAt) : 'ยังไม่ได้ทำ') + '</p>' +
      '<div class="actions" style="justify-content:flex-start"><button class="btn ghost sm" type="button" data-y="resetpost">เปิดให้สอบหลังเรียนใหม่</button><button class="btn ghost sm" type="button" data-y="resetpre">เปิดให้สอบก่อนเรียนใหม่</button></div></section>' +
      '<section class="card pad" style="display:grid;gap:8px"><b>ใบงาน</b> ' + wsTag(w) + (w ? wsAnswersHtml(w) : '') + '</section>' +
      '<section class="card pad" style="display:grid;gap:6px"><b>แบบสอบถาม</b>' + (s.survey ? '<p>' + (content.survey.items || []).map(function (it, i) { return esc(it) + ' = ' + s.survey.ratings[i]; }).join('<br>') + '</p>' + (s.survey.comment ? '<p>ข้อเสนอแนะ: ' + esc(s.survey.comment) + '</p>' : '') : '<p class="muted">ยังไม่ได้ส่ง</p>') + '</section>' +
      '<section class="card pad" style="display:grid;gap:10px"><b>ตั้งรหัสผ่านใหม่</b><div class="toolbar"><label class="sr" for="np">รหัสผ่านใหม่</label><input class="field" id="np" placeholder="รหัสผ่านใหม่ อย่างน้อย 4 ตัว" style="max-width:260px"><button class="btn sm" type="button" data-y="pw">' + ic('key') + 'บันทึก</button></div></section>' +
      '<div><button class="btn danger" type="button" data-y="del">' + ic('trash') + 'ลบบัญชีนักเรียนนี้</button></div></div>';
    function close() { d.remove(); document.removeEventListener('keydown', onKey); }
    function onKey(e) { if (e.key === 'Escape') close(); }
    document.addEventListener('keydown', onKey);
    d.addEventListener('click', function (e) {
      if (e.target === d || e.target.closest('[data-close]')) { close(); return; }
      var b = e.target.closest('[data-y]'); if (!b) return;
      var y = b.getAttribute('data-y');
      if (y === 'pw') {
        X.api.call('resetPassword', { userId: s.id, password: d.querySelector('#np').value }).then(function () { X.toast('ตั้งรหัสผ่านใหม่ให้ ' + s.name + ' แล้ว'); d.querySelector('#np').value = ''; }, function (er) { X.toast(er.message, true); });
      } else if (y === 'resetpost' || y === 'resetpre') {
        X.confirm('เปิดให้สอบใหม่?', 'คะแนน' + (y === 'resetpre' ? 'ก่อนเรียน' : 'หลังเรียน') + 'ทุกครั้งของ ' + s.name + ' จะถูกลบ แล้วนักเรียนทำแบบทดสอบได้อีกครั้ง', 'ลบคะแนนและเปิดสอบใหม่').then(function (ok) {
          if (!ok) return; X.api.call('resetAttempt', { userId: s.id, kind: y === 'resetpre' ? 'pre' : 'post' }).then(function () { X.toast('เปิดให้สอบใหม่แล้ว'); close(); refreshData().then(draw); }, function (er) { X.toast(er.message, true); });
        });
      } else if (y === 'del') {
        X.confirm('ลบบัญชีนักเรียน?', 'ข้อมูลทั้งหมดของ ' + s.name + ' (คะแนน ใบงาน ไฟล์แนบ และแบบสอบถาม) จะถูกลบและกู้คืนไม่ได้', 'ลบบัญชี').then(function (ok) {
          if (!ok) return; X.api.call('deleteStudent', { userId: s.id }).then(function () { X.toast('ลบบัญชีแล้ว'); close(); refreshData().then(draw); }, function (er) { X.toast(er.message, true); });
        });
      }
    });
    document.body.appendChild(d);
    d.querySelector('[data-close]').focus();
  }
  function wsAnswersHtml(w) {
    var def = content.worksheet;
    var a = w.answers || { rows: {}, questions: {} };
    var rows = (def.samples || []).map(function (sm) {
      var r = (a.rows || {})[sm.id] || {};
      var chk = w.autoCheck && w.autoCheck[sm.id] != null ? (w.autoCheck[sm.id] ? '<span class="tag ok">ตรงเฉลย</span>' : '<span class="tag bad">ไม่ตรงเฉลย (' + TYPE_TH[sm.answer || ''] + ')</span>') : '';
      return '<tr><th>' + esc(sm.id) + '</th><td class="wrap">' + esc(r.obs || '–') + '</td><td>' + esc(TYPE_TH[r.type || ''] || '–') + ' ' + chk + '</td><td class="wrap">' + esc(r.reason || '–') + '</td></tr>';
    }).join('');
    var qs = (def.questions || []).map(function (q) { return '<p><b>' + esc(q.text) + '</b><br>' + esc((a.questions || {})[q.id] || '–') + '</p>'; }).join('');
    var file = w.fileName ? '<p>' + ic('clip') + ' ไฟล์แนบ: ' + (/^data:/.test(w.fileUrl) ? '<button class="btn quiet sm" type="button" data-file="' + esc(w.fileUrl) + '" data-name="' + esc(w.fileName) + '">' + esc(w.fileName) + '</button>' : '<a href="' + esc(w.fileUrl) + '" target="_blank" rel="noopener">' + esc(w.fileName) + '</a>') + '</p>' : '';
    return '<div class="tblwrap"><table class="atable"><thead><tr><th>ตัวอย่าง</th><th>ลักษณะที่สังเกต</th><th>ประเภทหิน</th><th>เหตุผล</th></tr></thead><tbody>' + rows + '</tbody></table></div>' + qs + file +
      (w.feedback ? '<p class="muted">ข้อเสนอแนะที่ให้ไว้: ' + esc(w.feedback) + '</p>' : '');
  }

  /* ---------- ตรวจใบงาน ---------- */
  function vWorksheets() {
    var list = students().filter(function (s) { return s.worksheet && s.worksheet.status !== 'draft' && (filter.ws === 'all' || s.worksheet.status === 'submitted'); });
    list.sort(function (a, b) { return String(a.worksheet.submittedAt).localeCompare(String(b.worksheet.submittedAt)); });
    var cards = list.map(function (s) {
      var w = s.worksheet;
      return '<section class="card pad" style="display:grid;gap:12px" data-ws-card="' + esc(s.id) + '"><div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px"><div><b style="font-size:1.15rem;color:var(--ink)">' + esc(s.name) + '</b> <span class="muted">ห้อง ' + esc(s.room) + ' เลขที่ ' + esc(s.no) + ' · ส่งเมื่อ ' + fmtDate(w.submittedAt) + '</span></div>' + wsTag(w) + '</div>' +
        wsAnswersHtml(w) +
        '<div class="form" style="grid-template-columns:140px 1fr;align-items:end"><label for="sc-' + esc(s.id) + '">คะแนน<input class="field" id="sc-' + esc(s.id) + '" type="number" min="0" step="0.5" value="' + (w.score == null ? '' : w.score) + '"></label>' +
        '<label for="fb-' + esc(s.id) + '">ข้อเสนอแนะถึงนักเรียน<textarea class="field" id="fb-' + esc(s.id) + '" style="min-height:64px">' + esc(w.feedback || '') + '</textarea></label></div>' +
        '<div class="actions"><button class="btn ghost sm" type="button" data-x="wsreturn" data-id="' + esc(s.id) + '">ส่งกลับให้แก้ไข</button><button class="btn sm" type="button" data-x="wsreview" data-id="' + esc(s.id) + '">' + ic('check') + 'บันทึกผลตรวจ</button></div></section>';
    }).join('');
    return '<div class="toolbar"><div class="tabbar" style="width:auto"><button type="button" data-x="wsfilter" data-v="pending" aria-selected="' + (filter.ws === 'pending') + '">รอตรวจ (' + pendingCount() + ')</button><button type="button" data-x="wsfilter" data-v="all" aria-selected="' + (filter.ws === 'all') + '">ทั้งหมด</button></div>' + roomSelect() + '<span class="grow"></span><button class="btn ghost sm" type="button" data-x="exp-ws">' + ic('download') + 'ส่งออกใบงาน (.csv)</button></div>' +
      (cards || '<div class="card pad muted" style="text-align:center">' + (filter.ws === 'pending' ? 'ไม่มีใบงานรอตรวจ' : 'ยังไม่มีนักเรียนส่งใบงาน') + '</div>');
  }

  /* =====================================================================
     ตัวแก้ไขเนื้อหาแบบฟอร์ม
     ===================================================================== */
  function getP(o, path) { return path.split('.').reduce(function (a, k) { return a == null ? a : a[k]; }, o); }
  function setP(o, path, v) { var ks = path.split('.'), last = ks.pop(); var t = ks.reduce(function (a, k) { if (a[k] == null) a[k] = /^\d+$/.test(k) ? [] : {}; return a[k]; }, o); t[last] = v; }
  function startEdit(key) { if (Wkey !== key || !W) { W = clone(content[key]); Wkey = key; dirty = false; } }
  function inp(path, label, type, opts) {
    opts = opts || {};
    var v = getP(W, path); if (v == null) v = '';
    var id = 'e-' + path.replace(/\./g, '-');
    if (type === 'textarea') return '<label for="' + id + '">' + label + '<textarea class="field" id="' + id + '" data-p="' + path + '" rows="' + (opts.rows || 3) + '">' + esc(v) + '</textarea></label>';
    if (type === 'select') return '<label for="' + id + '">' + label + '<select class="field" id="' + id + '" data-p="' + path + '"' + (opts.num ? ' data-num="1"' : '') + '>' + opts.options.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (String(v) === String(o[0]) ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select></label>';
    if (type === 'check') return '<label for="' + id + '" style="display:flex;align-items:center;gap:10px"><input type="checkbox" id="' + id + '" data-p="' + path + '" data-bool="1"' + (v ? ' checked' : '') + ' style="width:22px;height:22px;accent-color:var(--teal)">' + label + '</label>';
    if (type === 'image') return '<label for="' + id + '">' + label + '<span class="imgrow"><input class="field" id="' + id + '" data-p="' + path + '" value="' + esc(v) + '" placeholder="assets/img/... หรือ https://..."><span class="btn ghost sm" role="button" tabindex="0" data-up="' + path + '">' + ic('upload') + 'อัปโหลด</span>' + (v ? '<img src="' + esc(v) + '" alt="">' : '<span></span>') + '</span></label>';
    return '<label for="' + id + '">' + label + '<input class="field" id="' + id + '" data-p="' + path + '"' + (type === 'number' ? ' type="number" data-num="1"' : '') + ' value="' + esc(v) + '"></label>';
  }
  function list(path, title, itemFn, blank, opts) {
    opts = opts || {};
    var arr = getP(W, path) || [];
    return '<div style="display:grid;gap:8px"><b style="color:var(--ink)">' + title + '</b>' + arr.map(function (_, i) {
      return '<div class="item"><div class="itemhead"><span>' + (opts.label ? opts.label(i) : 'รายการที่ ' + (i + 1)) + '</span><span class="b">' +
        '<button type="button" data-ed="up" data-path="' + path + '" data-i="' + i + '" aria-label="เลื่อนขึ้น"' + (i === 0 ? ' disabled' : '') + '>↑</button>' +
        '<button type="button" data-ed="down" data-path="' + path + '" data-i="' + i + '" aria-label="เลื่อนลง"' + (i === arr.length - 1 ? ' disabled' : '') + '>↓</button>' +
        '<button type="button" data-ed="del" data-path="' + path + '" data-i="' + i + '" aria-label="ลบ">✕</button></span></div>' + itemFn(path + '.' + i, i) + '</div>';
    }).join('') + (blank === null ? '' : '<button class="btn ghost sm" type="button" data-ed="add" data-path="' + path + '" data-blank="' + esc(JSON.stringify(blank)) + '" style="justify-self:start">' + ic('plus') + 'เพิ่ม' + (opts.addLabel || 'รายการ') + '</button>') + '</div>';
  }
  function strList(path, title, addLabel) {
    return list(path, title, function (p) { return '<input class="field" data-p="' + p + '" value="' + esc(getP(W, p) || '') + '" aria-label="' + esc(title) + '">'; }, '', { addLabel: addLabel, label: function (i) { return 'ข้อ ' + (i + 1); } });
  }
  function tableEd(path) {
    var t = getP(W, path); if (!t) return '';
    var head = t.head || [], rows = t.rows || [];
    return '<div style="display:grid;gap:8px"><b style="color:var(--ink)">ตาราง</b><div class="tblwrap"><table class="atable"><thead><tr>' + head.map(function (h, j) { return '<th><input class="field" data-p="' + path + '.head.' + j + '" value="' + esc(h) + '" aria-label="หัวตาราง ' + (j + 1) + '"></th>'; }).join('') + '<th></th></tr></thead><tbody>' +
      rows.map(function (r, i) { return '<tr>' + head.map(function (_, j) { return '<td><input class="field" data-p="' + path + '.rows.' + i + '.' + j + '" value="' + esc(r[j] || '') + '" aria-label="แถว ' + (i + 1) + ' คอลัมน์ ' + (j + 1) + '"></td>'; }).join('') + '<td><button class="btn quiet sm" type="button" data-ed="del" data-path="' + path + '.rows" data-i="' + i + '" aria-label="ลบแถว">✕</button></td></tr>'; }).join('') +
      '</tbody></table></div><button class="btn ghost sm" type="button" data-ed="add" data-path="' + path + '.rows" data-blank="' + esc(JSON.stringify(head.map(function () { return ''; }))) + '" style="justify-self:start">' + ic('plus') + 'เพิ่มแถว</button></div>';
  }
  function saveBar(key, note) {
    var custom = content.custom && content.custom[key];
    return '<div class="savebar"><span class="grow">' + (note || '') + (custom ? ' · แก้ไขล่าสุด ' + fmtDate(custom) : ' · ใช้เนื้อหาเริ่มต้น') + '</span>' +
      (custom ? '<button class="btn ghost sm" type="button" data-x="reset" data-key="' + key + '">คืนค่าเริ่มต้น</button>' : '') +
      '<button class="btn ghost sm" type="button" data-x="discard" data-key="' + key + '">ยกเลิกการแก้ไข</button><button class="btn sm" type="button" data-x="save" data-key="' + key + '">' + ic('save') + 'บันทึก</button></div>';
  }

  /* ---------- ข้อสอบ ---------- */
  function vTests() {
    var key = filter.test; startEdit(key);
    var REVIEW = [['', 'ไม่ระบุ']];
    ['igneous', 'sedimentary', 'metamorphic'].forEach(function (t) { ['origin', 'texture', 'classify', 'uses'].forEach(function (tb) { REVIEW.push(['lesson/' + t + '/' + tb, TYPE_TH[t] + ' › ' + { origin: 'การเกิด', texture: 'เนื้อหิน', classify: 'การจำแนก', uses: 'ประโยชน์' }[tb]]); }); });
    var tested = data.students.filter(function (s) { return key === 'pretest' ? s.pre : s.post; }).length;
    var qs = list('questions', 'ข้อสอบ ' + (W.questions || []).length + ' ข้อ', function (p, i) {
      var q = getP(W, p);
      return '<div class="grid2">' + inp(p + '.topic', 'หัวข้อ', 'select', { options: [['ign', 'หินอัคนี'], ['sed', 'หินตะกอน'], ['met', 'หินแปร']] }) + inp(p + '.review', 'หน้าที่ให้ทบทวนเมื่อตอบผิด', 'select', { options: REVIEW }) + '</div>' +
        inp(p + '.q', 'คำถาม', 'textarea', { rows: 2 }) +
        '<div style="display:grid;gap:6px"><span style="font-size:.9rem;font-weight:600;color:var(--ink)">ตัวเลือก (เลือกวงกลมหน้าคำตอบที่ถูก)</span>' + (q.choices || []).map(function (c, j) {
          return '<span class="choice"><input type="radio" name="ans-' + i + '" data-p="' + p + '.answer" data-num="1" value="' + j + '"' + (Number(q.answer) === j ? ' checked' : '') + ' aria-label="เฉลยข้อ ' + TH[j] + '"><input class="field" data-p="' + p + '.choices.' + j + '" value="' + esc(c) + '" aria-label="ตัวเลือก ' + TH[j] + '"></span>';
        }).join('') + '</div>' +
        inp(p + '.explain', 'คำอธิบายเฉลย', 'textarea', { rows: 2 }) + inp(p + '.image', 'ภาพประกอบคำถาม (ไม่บังคับ)', 'image');
    }, { id: '', topic: 'ign', q: '', choices: ['', '', '', ''], answer: 0, explain: '', review: '' }, { label: function (i) { return 'ข้อ ' + (i + 1); }, addLabel: 'ข้อสอบ' });
    return '<div class="toolbar"><div class="tabbar" style="width:auto"><button type="button" data-x="testkind" data-v="pretest" aria-selected="' + (key === 'pretest') + '">แบบทดสอบก่อนเรียน</button><button type="button" data-x="testkind" data-v="posttest" aria-selected="' + (key === 'posttest') + '">แบบทดสอบหลังเรียน</button></div></div>' +
      (tested ? '<div class="status warn">' + ic('bulb') + '<span>มีนักเรียนทำชุดนี้แล้ว ' + tested + ' คน การแก้เฉลยหรือลำดับข้อจะทำให้การแสดงเฉลยย้อนหลังคลาดเคลื่อน ควรแก้ก่อนเริ่มใช้กับนักเรียน</span></div>' : '') +
      '<div class="ed"><fieldset><legend>ข้อความหัวหน้า</legend>' + inp('title', 'ชื่อแบบทดสอบ', 'text') + inp('subtitle', 'คำอธิบาย', 'text') + inp('note', 'หมายเหตุถึงนักเรียน', 'text') + '</fieldset>' + qs + '</div>' + saveBar(key, 'แบบทดสอบ' + (key === 'pretest' ? 'ก่อนเรียน' : 'หลังเรียน'));
  }

  /* ---------- เนื้อหาบทเรียน ---------- */
  function vLessons() {
    startEdit('lessons');
    var t = filter.lesson, base = t;
    var L = getP(W, base);
    var TABN = { origin: 'การเกิด', texture: 'เนื้อหิน', classify: 'การจำแนก', uses: 'ประโยชน์' };
    var head = '<fieldset><legend>' + TYPE_TH[t] + '</legend><div class="grid2">' + inp(base + '.th', 'ชื่อบท', 'text') + inp(base + '.en', 'ชื่อภาษาอังกฤษ', 'text') + '</div>' +
      inp(base + '.tagline', 'คำอธิบายใต้ชื่อบท', 'text') + inp(base + '.cardText', 'คำอธิบายบนการ์ดบทเรียน', 'text') +
      '<div class="grid2">' + inp(base + '.summary', 'สรุปจำง่าย', 'text') + inp(base + '.usesShort', 'ประโยชน์โดยย่อ', 'text') + '</div>' +
      inp(base + '.cardImage', 'ภาพการ์ดบทเรียน', 'image') + inp(base + '.homeImage', 'ภาพการ์ดหน้าแรก', 'image') + inp(base + '.thumb', 'ภาพหินขนาดเล็ก (วัฏจักรหิน)', 'image') + inp(base + '.banner', 'ภาพแถบด้านบน', 'image') + '</fieldset>';
    var tabs = Object.keys(TABN).map(function (k) {
      var p = base + '.tabs.' + k, tb = getP(W, p) || {};
      var out = '<fieldset><legend>แท็บ “' + TABN[k] + '”</legend>' + inp(p + '.heading', 'หัวข้อ', 'text') + inp(p + '.intro', 'คำอธิบาย', 'textarea', { rows: 3 }) + inp(p + '.image', 'ภาพหลัก', 'image') +
        list(p + '.imageLabels', 'ป้ายบนภาพ (ตำแหน่งเป็นร้อยละของความกว้าง/สูงภาพ)', function (q) { return '<div class="grid2">' + inp(q + '.text', 'ข้อความ', 'text') + inp(q + '.x', 'แนวนอน %', 'number') + inp(q + '.y', 'แนวตั้ง %', 'number') + '</div>'; }, { text: '', x: 50, y: 50 }, { addLabel: 'ป้าย' });
      if (tb.items) out += list(p + '.items', 'รายการเนื้อหา', function (q) { return '<div class="grid2">' + inp(q + '.title', 'หัวข้อย่อย', 'text') + inp(q + '.tag', 'ป้ายกำกับ/ตัวอย่าง', 'text') + '</div>' + inp(q + '.text', 'รายละเอียด', 'textarea', { rows: 2 }); }, { title: '', text: '', tag: '', icon: 'leaf' }, { addLabel: 'รายการ' });
      if (tb.table) out += tableEd(p + '.table');
      if (tb.chips) out += list(p + '.chips', 'ป้ายหมวด', function (q) { return inp(q + '.text', 'ข้อความ', 'text'); }, { text: '', icon: 'leaf' }, { addLabel: 'ป้าย' });
      if (tb.pairs) out += list(p + '.pairs', 'หินเดิม → หินแปร', function (q) { return '<div class="grid2">' + inp(q + '.from', 'หินเดิม', 'text') + inp(q + '.to', 'หินแปร', 'text') + '</div>' + inp(q + '.text', 'คำอธิบาย', 'text') + inp(q + '.fromImage', 'ภาพหินเดิม', 'image') + inp(q + '.toImage', 'ภาพหินแปร', 'image'); }, { from: '', to: '', text: '', fromImage: '', toImage: '' }, { addLabel: 'คู่หิน' });
      if (tb.compare) out += list(p + '.compare', 'เปรียบเทียบ', function (q) { return inp(q + '.title', 'หัวข้อ', 'text') + inp(q + '.text', 'คำอธิบาย', 'text') + inp(q + '.image', 'ภาพ', 'image'); }, { title: '', text: '', image: '' }, { addLabel: 'รายการ' });
      if (tb.note != null) out += inp(p + '.note', 'หมายเหตุ', 'textarea', { rows: 2 });
      out += inp(p + '.observe', 'คำถามชวนสังเกต', 'text');
      return out + '</fieldset>';
    }).join('');
    return '<div class="toolbar"><div class="tabbar" style="width:auto;grid-template-columns:repeat(4,auto)">' + ['igneous', 'sedimentary', 'metamorphic'].map(function (k) { return '<button type="button" data-x="lessonsel" data-v="' + k + '" aria-selected="' + (t === k) + '">' + TYPE_TH[k] + '</button>'; }).join('') + '<button type="button" data-x="lessonsel" data-v="_general" aria-selected="' + (t === '_general') + '">ทั่วไป</button></div><span class="grow"></span><a class="btn ghost sm" href="#/lesson/' + (t === '_general' ? 'igneous' : t) + '/origin" target="_self">' + ic('book') + 'ดูหน้าบทเรียน</a></div>' +
      '<div class="ed">' + (t === '_general' ? '<fieldset><legend>ทั่วไป</legend>' + inp('goal', 'เป้าหมายการเรียนรู้', 'text') + inp('cycle.title', 'หัวข้อวัฏจักรหิน', 'text') + inp('cycle.text', 'คำอธิบายวัฏจักรหิน', 'text') + '</fieldset>' : (L ? head + tabs : '')) + '</div>' + saveBar('lessons', 'เนื้อหาบทเรียนทั้ง 3 บท');
  }

  /* ---------- ใบงานและแบบสอบถาม ---------- */
  function vActivities() {
    var which = filter.act || 'worksheet'; startEdit(which);
    var body;
    if (which === 'worksheet') {
      body = '<fieldset><legend>ใบงาน</legend>' + inp('heading', 'หัวข้อหน้า', 'text') + inp('subheading', 'คำอธิบายหน้า', 'text') + inp('title', 'ชื่อใบงาน', 'text') + inp('intro', 'คำชี้แจง', 'text') + inp('tip', 'ข้อแนะนำ', 'text') + '</fieldset>' +
        list('samples', 'ตัวอย่างหิน', function (p) { return '<div class="grid2">' + inp(p + '.id', 'รหัสตัวอย่าง', 'text') + inp(p + '.answer', 'ประเภทหินที่ถูก (ใช้ตรวจอัตโนมัติ)', 'select', { options: [['', 'ไม่ตรวจอัตโนมัติ'], ['igneous', 'หินอัคนี'], ['sedimentary', 'หินตะกอน'], ['metamorphic', 'หินแปร']] }) + '</div>' + inp(p + '.caption', 'คำชวนสังเกตใต้ภาพ', 'text') + inp(p + '.placeholder', 'ข้อความตัวอย่างในช่องกรอก', 'text') + inp(p + '.image', 'ภาพตัวอย่าง', 'image'); }, { id: '', image: '', caption: '', answer: '', placeholder: '' }, { addLabel: 'ตัวอย่างหิน', label: function (i) { return 'ตัวอย่าง ' + (getP(W, 'samples.' + i + '.id') || i + 1); } }) +
        list('questions', 'คำถามท้ายใบงาน', function (p) { return inp(p + '.text', 'คำถาม', 'text') + inp(p + '.placeholder', 'ข้อความตัวอย่างในช่องตอบ', 'text') + '<div class="grid2">' + inp(p + '.id', 'รหัสคำถาม', 'text') + inp(p + '.required', 'ต้องตอบก่อนส่ง', 'check') + '</div>'; }, { id: 'q' + Date.now().toString(36), text: '', placeholder: '', required: true }, { addLabel: 'คำถาม' }) +
        strList('guide', 'แนวทางทำใบงาน', 'แนวทาง');
    } else {
      body = '<fieldset><legend>แบบสอบถาม</legend>' + inp('title', 'ชื่อแบบสอบถาม', 'text') + inp('subtitle', 'คำอธิบาย', 'text') + inp('note', 'หมายเหตุถึงนักเรียน', 'text') + inp('thanks', 'ข้อความขอบคุณ', 'text') + inp('thanksSub', 'ข้อความขอบคุณบรรทัดสอง', 'text') + '</fieldset>' +
        strList('items', 'รายการประเมิน (มาตราส่วน 5 ระดับ)', 'รายการประเมิน') +
        '<fieldset><legend>ชื่อระดับ (1 ถึง 5)</legend><div class="grid2">' + [0, 1, 2, 3, 4].map(function (i) { return inp('scale.' + i, 'ระดับ ' + (i + 1), 'text'); }).join('') + '</div></fieldset>';
      if (data.students.some(function (s) { return s.survey; })) body = '<div class="status warn">' + ic('bulb') + '<span>มีนักเรียนส่งแบบสอบถามแล้ว การเพิ่ม ลบ หรือสลับลำดับรายการประเมินจะทำให้ผลเดิมจับคู่กับรายการผิด</span></div>' + body;
    }
    return '<div class="toolbar"><div class="tabbar" style="width:auto"><button type="button" data-x="actsel" data-v="worksheet" aria-selected="' + (which === 'worksheet') + '">ใบงาน</button><button type="button" data-x="actsel" data-v="survey" aria-selected="' + (which === 'survey') + '">แบบสอบถาม</button></div></div><div class="ed">' + body + '</div>' + saveBar(which, which === 'worksheet' ? 'ใบงานทบทวนความรู้' : 'แบบสอบถามความพึงพอใจ');
  }

  /* ---------- หินและโมเดล ---------- */
  function vRocks() {
    startEdit('rocks');
    var cfg = window.ROCK_CONFIG || {};
    var sel = filter.rock;
    var rows = W.map(function (r, i) {
      var st = r.model === 'none' ? '<span class="tag bad">ไม่มีโมเดล</span>' : (r.model ? '<span class="tag ok">กำหนดเอง</span>' : '<span class="tag">อัตโนมัติ</span>');
      return '<tr><td>' + CAT_TH[r.cat] + '</td><td><b>' + esc(r.th) + '</b><br><small class="muted">' + esc(r.en) + '</small></td><td>' + st + '</td><td class="tnum">' + (r.hs || []).length + '</td><td><button class="btn ghost sm" type="button" data-x="rocksel" data-v="' + i + '">แก้ไข</button> <a class="btn quiet sm" href="#/ar/' + esc(r.id) + '">เปิดดู</a></td></tr>';
    }).join('');
    var ed = '';
    if (sel !== '' && W[sel]) {
      var p = String(sel), r = W[sel];
      ed = '<div class="ed"><fieldset><legend>' + esc(r.th) + '</legend><div class="grid2">' + inp(p + '.th', 'ชื่อภาษาไทย', 'text') + inp(p + '.en', 'ชื่อภาษาอังกฤษ', 'text') + '</div>' +
        '<div class="grid2">' + inp(p + '.cat', 'ประเภท', 'select', { options: [['ign', 'หินอัคนี'], ['sed', 'หินตะกอน'], ['met', 'หินแปร']] }) + inp(p + '.id', 'รหัส (ชื่อไฟล์โมเดล)', 'text') + '</div>' +
        inp(p + '.model', 'ไฟล์โมเดล 3 มิติ: เว้นว่าง = ใช้ ' + esc((cfg.MODEL_BASE || 'scans/') + r.id + '.' + (cfg.MODEL_EXT || 'glb')) + ' · พิมพ์ none = ยังไม่มีโมเดล · หรือวางลิงก์ไฟล์ .glb', 'text') +
        inp(p + '.image', 'ภาพหินขนาดเล็ก (ไม่บังคับ)', 'image') +
        inp(p + '.tex', 'เนื้อหิน', 'text') + inp(p + '.chip', 'กลุ่ม', 'text') + inp(p + '.minT', 'แร่ประกอบหิน', 'textarea', { rows: 2 }) + inp(p + '.origin', 'การเกิด', 'textarea', { rows: 2 }) + inp(p + '.thai', 'พบในประเทศไทย', 'textarea', { rows: 2 }) + inp(p + '.why', 'ทำไมจึงเป็นเช่นนี้', 'textarea', { rows: 2 }) + inp(p + '.note', 'หมายเหตุ', 'textarea', { rows: 2 }) +
        list(p + '.hs', 'จุดสังเกตบนโมเดล (ตำแหน่งบนโมเดลคงเดิม)', function (q) { return inp(q + '.t', 'ชื่อจุดสังเกต', 'text') + inp(q + '.d', 'คำอธิบาย', 'textarea', { rows: 2 }); }, null, { label: function (i) { return 'จุดที่ ' + (i + 1); } }) +
        '</fieldset></div>';
    }
    return '<p class="muted">โมเดลอ่านจาก ' + esc(cfg.MODEL_BASE || 'scans/') + '&lt;รหัสหิน&gt;.' + esc(cfg.MODEL_EXT || 'glb') + ' โดยอัตโนมัติ เพิ่มไฟล์ .glb ไว้ในที่เดียวกัน หรือกำหนดลิงก์ของแต่ละก้อนได้ หินที่ตั้งเป็น “ไม่มีโมเดล” จะแสดงสถานะให้นักเรียนเห็นชัดเจน</p>' +
      '<div class="rgrid" style="grid-template-columns:minmax(0,1fr) minmax(0,1.2fr)"><div class="tblwrap" style="max-height:70vh;overflow:auto"><table class="atable"><thead><tr><th>ประเภท</th><th>หิน</th><th>โมเดล</th><th>จุดสังเกต</th><th></th></tr></thead><tbody>' + rows + '</tbody></table></div><div>' + (ed || '<div class="card pad muted">เลือก “แก้ไข” ที่หินเพื่อแก้ชื่อ ไฟล์โมเดล ภาพ และคำอธิบาย</div>') + '</div></div>' + saveBar('rocks', 'ข้อมูลหิน ' + W.length + ' ก้อน');
  }

  /* ---------- ตั้งค่า ---------- */
  function vSettings() {
    startEdit('settings');
    return '<div class="ed"><fieldset><legend>ทั่วไป</legend>' + inp('schoolName', 'ชื่อโรงเรียน', 'text') + inp('subject', 'รายวิชา/ระดับชั้น (แสดงบนหน้าแรก)', 'text') + inp('contact', 'ข้อมูลติดต่อครู (แสดงท้ายหน้าแรก)', 'text') + '</fieldset>' +
      '<fieldset><legend>การลงทะเบียนและการเรียน</legend>' + inp('classCode', 'รหัสชั้นเรียนสำหรับลงทะเบียน (เว้นว่าง = ไม่ต้องใช้รหัส)', 'text') +
      inp('requireSequence', 'บังคับเรียนตามลำดับ (ทำแบบทดสอบก่อนเรียนก่อนเข้าบทเรียน · ส่งใบงานก่อนสอบหลังเรียน · สอบหลังเรียนก่อนตอบแบบสอบถาม)', 'check') +
      '<div class="grid2">' + inp('passPercent', 'เกณฑ์ผ่านแบบทดสอบหลังเรียน (ร้อยละ)', 'number') + inp('postMaxAttempts', 'จำนวนครั้งที่สอบหลังเรียนได้', 'number') + inp('maxUploadMB', 'ขนาดไฟล์แนบสูงสุด (MB)', 'number') + '</div>' +
      inp('arNote', 'ข้อความเตือนในห้องสำรวจหิน AR', 'text') + '</fieldset></div>' + saveBar('settings', 'การตั้งค่า') +
      '<section class="card pad" style="display:grid;gap:12px;max-width:640px"><h2 style="font-size:1.3rem">เพิ่มบัญชีครู</h2><div class="form"><div class="row2"><label for="nt-id">ชื่อผู้ใช้<input class="field" id="nt-id"></label><label for="nt-name">ชื่อที่แสดง<input class="field" id="nt-name"></label></div><label for="nt-pw">รหัสผ่าน<input class="field" id="nt-pw" type="password" autocomplete="new-password"></label><button class="btn sm" type="button" data-x="newteacher" style="justify-self:start">' + ic('plus') + 'เพิ่มบัญชีครู</button></div></section>';
  }

  /* ---------- ส่งออกไฟล์ตาราง ---------- */
  function csv(rows) {
    return '﻿' + rows.map(function (r) { return r.map(function (v) { v = v == null ? '' : String(v); return /[",\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(','); }).join('\r\n');
  }
  function stamp() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function exportCsv(kind) {
    var st = students(), rows, name;
    var tp = ['ign', 'sed', 'met'];
    if (kind === 'scores') {
      name = 'ผลคะแนน-ROCK-EXPLORER-' + stamp() + '.csv';
      rows = [['ห้อง', 'เลขที่', 'เลขประจำตัว', 'ชื่อ–นามสกุล', 'ขั้นที่ทำแล้ว (จาก 6)', 'ก่อนเรียน', 'ก่อนเรียน (%)', 'หลังเรียน', 'หลังเรียน (%)', 'พัฒนาการ (คะแนน)', 'จำนวนครั้งสอบหลังเรียน', 'ผ่านเกณฑ์'].concat(tp.map(function (t) { return 'ก่อนเรียน ' + TOPIC_TH[t]; }), tp.map(function (t) { return 'หลังเรียน ' + TOPIC_TH[t]; }), ['ใบงาน', 'คะแนนใบงาน', 'แบบสอบถาม', 'ลงทะเบียน', 'เข้าใช้ล่าสุด'])];
      st.forEach(function (s) {
        rows.push([s.room, s.no, s.id, s.name, s.steps.count, s.pre ? s.pre.score : '', s.pre ? s.pre.percent : '', s.post ? s.post.score : '', s.post ? s.post.percent : '', s.pre && s.post ? s.post.score - s.pre.score : '', s.postAttempts || 0, s.post ? (s.post.percent >= Number(content.settings.passPercent) ? 'ผ่าน' : 'ไม่ผ่าน') : '']
          .concat(tp.map(function (t) { return s.pre && s.pre.byTopic && s.pre.byTopic[t] ? s.pre.byTopic[t].score + '/' + s.pre.byTopic[t].total : ''; }), tp.map(function (t) { return s.post && s.post.byTopic && s.post.byTopic[t] ? s.post.byTopic[t].score + '/' + s.post.byTopic[t].total : ''; }),
            [s.worksheet ? { draft: 'ฉบับร่าง', submitted: 'รอตรวจ', reviewed: 'ตรวจแล้ว', returned: 'ส่งกลับแก้ไข' }[s.worksheet.status] : 'ยังไม่เริ่ม', s.worksheet && s.worksheet.score != null ? s.worksheet.score : '', s.survey ? 'ส่งแล้ว' : '', s.createdAt, s.lastLogin]));
      });
    } else if (kind === 'items') {
      name = 'คำตอบรายข้อ-ROCK-EXPLORER-' + stamp() + '.csv';
      var preQ = content.pretest.questions || [], postQ = content.posttest.questions || [];
      rows = [['ห้อง', 'เลขที่', 'เลขประจำตัว', 'ชื่อ–นามสกุล'].concat(preQ.map(function (_, i) { return 'ก่อน ข้อ ' + (i + 1); }), postQ.map(function (_, i) { return 'หลัง ข้อ ' + (i + 1); }))];
      rows.push(['', '', '', 'เฉลย'].concat(preQ.map(function (q) { return TH[q.answer]; }), postQ.map(function (q) { return TH[q.answer]; })));
      st.forEach(function (s) {
        var a = (s.pre && s.pre.answers) || [], b = (s.post && s.post.answers) || [];
        rows.push([s.room, s.no, s.id, s.name].concat(preQ.map(function (q, i) { return a[i] == null ? '' : (Number(a[i]) === Number(q.answer) ? 1 : 0); }), postQ.map(function (q, i) { return b[i] == null ? '' : (Number(b[i]) === Number(q.answer) ? 1 : 0); })));
      });
      rows.push([]); rows.push(['หมายเหตุ: 1 = ตอบถูก, 0 = ตอบผิด']);
    } else if (kind === 'survey') {
      name = 'แบบสอบถาม-ROCK-EXPLORER-' + stamp() + '.csv';
      var items = content.survey.items || [];
      var sv = st.filter(function (s) { return s.survey; });
      rows = [['ห้อง', 'เลขที่', 'เลขประจำตัว', 'ชื่อ–นามสกุล'].concat(items, ['ข้อเสนอแนะ', 'วันที่ส่ง'])];
      sv.forEach(function (s) { rows.push([s.room, s.no, s.id, s.name].concat(items.map(function (_, i) { return s.survey.ratings[i]; }), [s.survey.comment, s.survey.submittedAt])); });
      rows.push([]);
      rows.push(['', '', '', 'ค่าเฉลี่ย (x̄)'].concat(items.map(function (_, i) { return f1(avg(sv.map(function (s) { return Number(s.survey.ratings[i]); }))); })));
      rows.push(['', '', '', 'ส่วนเบี่ยงเบนมาตรฐาน (S.D.)'].concat(items.map(function (_, i) { return f1(sd(sv.map(function (s) { return Number(s.survey.ratings[i]); }))); })));
      rows.push(['', '', '', 'จำนวนผู้ตอบ', sv.length]);
    } else {
      name = 'ใบงาน-ROCK-EXPLORER-' + stamp() + '.csv';
      var def = content.worksheet, smp = def.samples || [], qs = def.questions || [];
      var h = ['ห้อง', 'เลขที่', 'เลขประจำตัว', 'ชื่อ–นามสกุล', 'สถานะ', 'ส่งเมื่อ'];
      smp.forEach(function (x) { h.push('ตัวอย่าง ' + x.id + ' ลักษณะที่สังเกต', 'ตัวอย่าง ' + x.id + ' ประเภทหิน', 'ตัวอย่าง ' + x.id + ' ตรงเฉลย', 'ตัวอย่าง ' + x.id + ' เหตุผล'); });
      qs.forEach(function (q) { h.push(q.text); });
      h.push('ไฟล์แนบ', 'คะแนน', 'ข้อเสนอแนะจากครู');
      rows = [h];
      st.filter(function (s) { return s.worksheet; }).forEach(function (s) {
        var w = s.worksheet, a = w.answers || { rows: {}, questions: {} };
        var r = [s.room, s.no, s.id, s.name, { draft: 'ฉบับร่าง', submitted: 'รอตรวจ', reviewed: 'ตรวจแล้ว', returned: 'ส่งกลับแก้ไข' }[w.status], w.submittedAt];
        smp.forEach(function (x) { var rr = (a.rows || {})[x.id] || {}; r.push(rr.obs || '', TYPE_TH[rr.type || ''] || '', w.autoCheck && w.autoCheck[x.id] != null ? (w.autoCheck[x.id] ? 'ใช่' : 'ไม่ใช่') : '', rr.reason || ''); });
        qs.forEach(function (q) { r.push((a.questions || {})[q.id] || ''); });
        r.push(/^data:/.test(w.fileUrl || '') ? w.fileName : (w.fileUrl || ''), w.score == null ? '' : w.score, w.feedback || '');
        rows.push(r);
      });
    }
    X.saveFile(name, csv(rows), 'text/csv;charset=utf-8').then(function (ok) { if (ok) X.toast('ส่งออก ' + name + ' แล้ว'); });
  }

  /* ---------- เหตุการณ์ ---------- */
  function rerenderTab() {
    var y = window.scrollY;
    var body = { tests: vTests, lessons: vLessons, activities: vActivities, rocks: vRocks, settings: vSettings }[tab];
    if (body) { $('#atab').innerHTML = body(); window.scrollTo(0, y); } else draw();
  }
  function bind() {
    root.addEventListener('input', onInput);
    root.addEventListener('change', onInput);
    root.addEventListener('click', onClick);
    root.addEventListener('keydown', function (e) { var u = e.target.closest && e.target.closest('[data-up]'); if (u && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); u.click(); } });
  }
  function onInput(e) {
    var el = e.target;
    var f = el.getAttribute && el.getAttribute('data-f');
    if (f) { filter[f] = el.value; if (e.type === 'change' || f !== 'q') draw(); else { clearTimeout(onInput.t); onInput.t = setTimeout(function () { draw(); var q = root.querySelector('#f-q'); if (q) { q.focus(); q.setSelectionRange(q.value.length, q.value.length); } }, 300); } return; }
    var p = el.getAttribute && el.getAttribute('data-p'); if (!p || !W) return;
    if (el.type === 'radio' && !el.checked) return;
    var v = el.getAttribute('data-bool') ? el.checked : el.value;
    if (el.getAttribute('data-num') && v !== '') v = Number(v);
    setP(W, p, v); dirty = true;
  }
  function onClick(e) {
    var t = e.target.closest('[data-at],[data-x],[data-ed],[data-up],[data-file]'); if (!t) return;
    if (t.hasAttribute('data-at')) {
      if (dirty) { X.confirm('ยังไม่ได้บันทึก', 'การแก้ไขในแท็บนี้ยังไม่ได้บันทึก ต้องการออกโดยไม่บันทึกหรือไม่', 'ออกโดยไม่บันทึก').then(function (ok) { if (ok) { W = null; Wkey = null; dirty = false; tab = t.getAttribute('data-at'); try { history.replaceState(null, '', '#/admin/' + tab); } catch (er) { /* ข้าม */ } draw(); } }); return; }
      W = null; Wkey = null; dirty = false; tab = t.getAttribute('data-at');
      try { history.replaceState(null, '', '#/admin/' + tab); } catch (er) { /* ข้าม */ }
      draw(); return;
    }
    if (t.hasAttribute('data-file')) { var u = t.getAttribute('data-file'); fetch(u).then(function (r) { return r.blob(); }).then(function (b) { X.saveFile(t.getAttribute('data-name'), b); }); return; }
    if (t.hasAttribute('data-up')) { upload(t.getAttribute('data-up')); return; }
    if (t.hasAttribute('data-ed')) {
      var path = t.getAttribute('data-path'), i = Number(t.getAttribute('data-i')), arr = getP(W, path);
      var op = t.getAttribute('data-ed');
      if (op === 'add') { var blank = t.getAttribute('data-blank'); if (!arr) { setP(W, path, []); arr = getP(W, path); } arr.push(blank && blank !== 'null' ? JSON.parse(blank) : ''); }
      else if (op === 'del') arr.splice(i, 1);
      else if (op === 'up' && i > 0) { var a = arr[i]; arr[i] = arr[i - 1]; arr[i - 1] = a; }
      else if (op === 'down' && i < arr.length - 1) { var b2 = arr[i]; arr[i] = arr[i + 1]; arr[i + 1] = b2; }
      dirty = true; rerenderTab(); return;
    }
    var x = t.getAttribute('data-x'), id = t.getAttribute('data-id'), v = t.getAttribute('data-v');
    if (/^exp-/.test(x)) { exportCsv(x.slice(4)); return; }
    switch (x) {
      case 'student': openStudent(id); break;
      case 'wsfilter': filter.ws = v; draw(); break;
      case 'wsreview': case 'wsreturn':
        var sc = root.querySelector('#sc-' + CSS.escape(id)).value, fb = root.querySelector('#fb-' + CSS.escape(id)).value;
        X.api.call('reviewWorksheet', { userId: id, score: sc, feedback: fb, status: x === 'wsreturn' ? 'returned' : 'reviewed' }).then(function () {
          X.toast(x === 'wsreturn' ? 'ส่งใบงานกลับให้นักเรียนแก้ไขแล้ว' : 'บันทึกผลตรวจแล้ว'); refreshData().then(draw);
        }, function (er) { X.toast(er.message, true); }); break;
      case 'testkind': if (dirty) { X.toast('บันทึกหรือยกเลิกการแก้ไขก่อนสลับชุดข้อสอบ', true); break; } filter.test = v; W = null; draw(); break;
      case 'lessonsel': filter.lesson = v; rerenderTab(); break;
      case 'actsel': if (dirty) { X.toast('บันทึกหรือยกเลิกการแก้ไขก่อนสลับ', true); break; } filter.act = v; W = null; draw(); break;
      case 'rocksel': filter.rock = Number(v); rerenderTab(); break;
      case 'discard': W = null; dirty = false; draw(); X.toast('ยกเลิกการแก้ไขแล้ว'); break;
      case 'save': save(t.getAttribute('data-key')); break;
      case 'reset':
        X.confirm('คืนค่าเริ่มต้น?', 'เนื้อหาส่วนนี้จะกลับเป็นค่าเริ่มต้นของเว็บไซต์ การแก้ไขที่บันทึกไว้จะหายไป', 'คืนค่าเริ่มต้น').then(function (ok) {
          if (!ok) return; var k = t.getAttribute('data-key');
          X.api.call('resetContent', { key: k }).then(function () { return reloadAll(); }).then(function () { X.toast('คืนค่าเริ่มต้นแล้ว'); }, function (er) { X.toast(er.message, true); });
        }); break;
      case 'newteacher':
        X.api.call('createTeacher', { id: root.querySelector('#nt-id').value, name: root.querySelector('#nt-name').value, password: root.querySelector('#nt-pw').value }).then(function (u) { X.toast('เพิ่มบัญชีครู ' + u.id + ' แล้ว'); ['#nt-id', '#nt-name', '#nt-pw'].forEach(function (s) { root.querySelector(s).value = ''; }); }, function (er) { X.toast(er.message, true); }); break;
    }
  }
  function reloadAll() {
    return Promise.all([X.api.call('adminContent', {}), X.reloadContent()]).then(function (r) { content = r[0]; W = null; Wkey = null; dirty = false; draw(); });
  }
  function save(key) {
    if (!W) return;
    var val = clone(W);
    if (key === 'settings') { ['passPercent', 'postMaxAttempts', 'maxUploadMB'].forEach(function (k) { val[k] = Number(val[k]) || 0; }); if (val.postMaxAttempts < 1) val.postMaxAttempts = 1; }
    X.api.call('saveContent', { key: key, value: val }).then(function () { return reloadAll(); }).then(function () { X.toast('บันทึกแล้ว นักเรียนจะเห็นเนื้อหาใหม่เมื่อเปิดหน้าเว็บครั้งถัดไป'); }, function (er) { X.toast(er.message, true); });
  }
  function upload(path) {
    var f = document.createElement('input'); f.type = 'file'; f.accept = 'image/jpeg,image/png,image/webp,image/gif';
    f.addEventListener('change', function () {
      var file = f.files[0]; if (!file) return;
      var rd = new FileReader();
      rd.onload = function () {
        X.toast('กำลังอัปโหลดรูป…');
        X.api.call('uploadMedia', { name: file.name, mime: file.type, data: String(rd.result).split(',')[1] }).then(function (res) { setP(W, path, res.url); dirty = true; rerenderTab(); X.toast('อัปโหลดรูปแล้ว กดบันทึกเพื่อใช้งาน'); }, function (er) { X.toast(er.message, true); });
      };
      rd.readAsDataURL(file);
    });
    f.click();
  }
  return { mount: mount };
})();
