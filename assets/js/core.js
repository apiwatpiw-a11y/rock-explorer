/*
 * ROCK EXPLORER — แกนระบบ (core)
 * ไฟล์นี้ใช้ร่วมกัน 2 ที่:
 *   1) ในเว็บ (โหมดทดลอง) ทำงานกับข้อมูลในเบราว์เซอร์
 *   2) ใน Google Apps Script (คัดลอกไปเป็นไฟล์ Core.gs) ทำงานกับ Google Sheets
 * ห้ามใช้ import/export หรือ API ของเบราว์เซอร์ในไฟล์นี้ เพื่อให้ใช้ได้ทั้งสองที่
 */
var RockCore = (function () {
  'use strict';

  /* ---------- SHA-256 (ใช้เก็บรหัสผ่านแบบเข้ารหัสทางเดียว) ---------- */
  var K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];
  function sha256(str) {
    var s = unescape(encodeURIComponent(String(str)));
    var bytes = [];
    for (var i = 0; i < s.length; i++) bytes.push(s.charCodeAt(i) & 0xff);
    var bitLen = bytes.length * 8;
    bytes.push(0x80);
    while (bytes.length % 64 !== 56) bytes.push(0);
    var hi = Math.floor(bitLen / 0x100000000), lo = bitLen >>> 0;
    bytes.push((hi >>> 24) & 255, (hi >>> 16) & 255, (hi >>> 8) & 255, hi & 255,
      (lo >>> 24) & 255, (lo >>> 16) & 255, (lo >>> 8) & 255, lo & 255);
    var H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    var W = new Array(64);
    for (var off = 0; off < bytes.length; off += 64) {
      for (var t = 0; t < 16; t++) {
        W[t] = (bytes[off + t * 4] << 24) | (bytes[off + t * 4 + 1] << 16) | (bytes[off + t * 4 + 2] << 8) | bytes[off + t * 4 + 3];
      }
      for (t = 16; t < 64; t++) {
        var x = W[t - 15], y = W[t - 2];
        var s0 = ((x >>> 7) | (x << 25)) ^ ((x >>> 18) | (x << 14)) ^ (x >>> 3);
        var s1 = ((y >>> 17) | (y << 15)) ^ ((y >>> 19) | (y << 13)) ^ (y >>> 10);
        W[t] = (W[t - 16] + s0 + W[t - 7] + s1) | 0;
      }
      var a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
      for (t = 0; t < 64; t++) {
        var S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
        var ch = (e & f) ^ (~e & g);
        var t1 = (h + S1 + ch + K[t] + W[t]) | 0;
        var S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
        var maj = (a & b) ^ (a & c) ^ (b & c);
        var t2 = (S0 + maj) | 0;
        h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
      }
      H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
      H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
    }
    var out = '';
    for (i = 0; i < 8; i++) out += ('00000000' + (H[i] >>> 0).toString(16)).slice(-8);
    return out;
  }

  /* ---------- โครงสร้างตาราง (ชื่อคอลัมน์ใน Google Sheets) ---------- */
  var SCHEMA = {
    users: { key: 'id', cols: ['id', 'role', 'name', 'room', 'no', 'salt', 'hash', 'createdAt', 'lastLogin'], json: [] },
    sessions: { key: 'token', cols: ['token', 'userId', 'expires'], json: [] },
    progress: { key: 'userId', cols: ['userId', 'steps', 'lessons', 'ar', 'drafts', 'lastRoute', 'updatedAt'], json: ['steps', 'lessons', 'ar', 'drafts'] },
    attempts: { key: 'id', cols: ['id', 'userId', 'kind', 'n', 'score', 'total', 'percent', 'byTopic', 'answers', 'submittedAt'], json: ['byTopic', 'answers'] },
    worksheets: { key: 'userId', cols: ['userId', 'status', 'answers', 'autoCheck', 'fileId', 'fileName', 'fileUrl', 'submittedAt', 'updatedAt', 'score', 'feedback', 'reviewedAt'], json: ['answers', 'autoCheck'] },
    surveys: { key: 'userId', cols: ['userId', 'r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7', 'r8', 'ratings', 'comment', 'submittedAt'], json: ['ratings'] },
    content: { key: 'key', cols: ['key', 'value', 'updatedAt'], json: ['value'] }
  };
  var CONTENT_KEYS = ['settings', 'lessons', 'rocks', 'pretest', 'posttest', 'worksheet', 'survey'];
  var STEP_IDS = ['pretest', 'lessons', 'ar', 'worksheet', 'posttest', 'survey'];
  var LESSON_TYPES = ['igneous', 'sedimentary', 'metamorphic'];
  var LESSON_TABS = ['origin', 'texture', 'classify', 'uses'];
  var SESSION_DAYS = 30;

  function fail(msg) { var e = new Error(msg); e.userFacing = true; throw e; }
  function clone(o) { return o == null ? o : JSON.parse(JSON.stringify(o)); }
  function str(v, max) { v = v == null ? '' : String(v).trim(); return max ? v.slice(0, max) : v; }
  function iso(ms) { return new Date(ms).toISOString(); }

  function create(store, env, defaults) {
    defaults = defaults || {};

    function rows(t) { return store.rows(t) || []; }
    function get(t, key) {
      var k = SCHEMA[t].key, all = rows(t);
      for (var i = 0; i < all.length; i++) if (String(all[i][k]) === String(key)) return all[i];
      return null;
    }
    function put(t, row) { store.put(t, row); return row; }
    function del(t, key) { store.del(t, key); }

    /* ---------- เนื้อหา ---------- */
    function content(key) {
      var r = get('content', key);
      if (r && r.value != null && r.value !== '') return r.value;
      return clone(defaults[key]);
    }
    function settings() {
      var s = content('settings') || {};
      var d = defaults.settings || {};
      for (var k in d) if (s[k] === undefined) s[k] = d[k];
      return s;
    }
    function questions(kind) {
      var q = content(kind === 'post' ? 'posttest' : 'pretest');
      return (q && q.questions) || [];
    }
    function sanitizeQuestions(qs) {
      return qs.map(function (q) {
        return { id: q.id, topic: q.topic, q: q.q, choices: q.choices, image: q.image || '' };
      });
    }

    /* ---------- ผู้ใช้และการเข้าสู่ระบบ ---------- */
    function normId(id) { return str(id, 40).toLowerCase().replace(/\s+/g, ''); }
    function hashPw(salt, pw) { return sha256(salt + '|' + pw); }
    function publicUser(u) {
      return { id: u.id, role: u.role, name: u.name, room: u.room, no: u.no };
    }
    function newSession(u) {
      var token = sha256(env.uuid() + env.uuid() + env.now());
      put('sessions', { token: token, userId: u.id, expires: env.now() + SESSION_DAYS * 864e5 });
      u.lastLogin = iso(env.now());
      put('users', u);
      return { token: token, user: publicUser(u) };
    }
    function auth(token, role) {
      if (!token) fail('กรุณาเข้าสู่ระบบ');
      var s = get('sessions', token);
      if (!s || Number(s.expires) < env.now()) fail('หมดเวลาการเข้าสู่ระบบ กรุณาเข้าสู่ระบบอีกครั้ง');
      var u = get('users', s.userId);
      if (!u) fail('ไม่พบบัญชีผู้ใช้');
      if (role && u.role !== role) fail(role === 'teacher' ? 'ส่วนนี้สำหรับครูเท่านั้น' : 'ส่วนนี้สำหรับนักเรียนเท่านั้น');
      return u;
    }
    function createUser(o) {
      var id = normId(o.id);
      if (!/^[a-z0-9._-]{3,40}$/.test(id)) fail('ชื่อผู้ใช้หรือเลขประจำตัวใช้ได้เฉพาะตัวอักษรอังกฤษ ตัวเลข . _ - ยาว 3–40 ตัว');
      if (get('users', id)) fail('มีบัญชีนี้อยู่แล้ว');
      var pw = String(o.password || '');
      if (pw.length < 4) fail('รหัสผ่านต้องยาวอย่างน้อย 4 ตัวอักษร');
      var salt = sha256(env.uuid() + id).slice(0, 16);
      var u = {
        id: id, role: o.role || 'student', name: str(o.name, 80), room: str(o.room, 20), no: str(o.no, 10),
        salt: salt, hash: hashPw(salt, pw), createdAt: iso(env.now()), lastLogin: ''
      };
      return put('users', u);
    }

    /* ---------- ความก้าวหน้า ---------- */
    function progressOf(uid) {
      var p = get('progress', uid);
      if (!p) p = { userId: uid, steps: {}, lessons: {}, ar: {}, drafts: {}, lastRoute: '', updatedAt: '' };
      p.steps = p.steps || {}; p.lessons = p.lessons || {}; p.ar = p.ar || {}; p.drafts = p.drafts || {};
      return p;
    }
    function attemptsOf(uid, kind) {
      return rows('attempts').filter(function (a) { return a.userId === uid && a.kind === kind; })
        .sort(function (a, b) { return Number(a.n) - Number(b.n); });
    }
    function lastAttempt(uid, kind) { var a = attemptsOf(uid, kind); return a.length ? a[a.length - 1] : null; }
    function rockCats() {
      var m = {};
      (content('rocks') || []).forEach(function (r) { m[r.id] = r.cat; });
      return m;
    }
    function computeSteps(uid) {
      var p = progressOf(uid);
      var done = {};
      done.pretest = !!lastAttempt(uid, 'pre');
      done.lessons = LESSON_TYPES.every(function (t) {
        var v = p.lessons[t] || {};
        return LESSON_TABS.every(function (tab) { return !!v[tab]; });
      });
      var cats = rockCats(), seen = {};
      Object.keys(p.ar).forEach(function (id) { if (cats[id]) seen[cats[id]] = true; });
      done.ar = !!(seen.ign && seen.sed && seen.met);
      var ws = get('worksheets', uid);
      done.worksheet = !!(ws && (ws.status === 'submitted' || ws.status === 'reviewed'));
      done.posttest = !!lastAttempt(uid, 'post');
      done.survey = !!get('surveys', uid);
      var current = null;
      for (var i = 0; i < STEP_IDS.length; i++) if (!done[STEP_IDS[i]]) { current = STEP_IDS[i]; break; }
      return { done: done, current: current, count: STEP_IDS.filter(function (s) { return done[s]; }).length };
    }
    function attemptSummary(a, withAnswers) {
      if (!a) return null;
      var o = { n: Number(a.n), score: Number(a.score), total: Number(a.total), percent: Number(a.percent), byTopic: a.byTopic, submittedAt: a.submittedAt };
      if (withAnswers) o.answers = a.answers;
      return o;
    }
    function worksheetSummary(ws, full) {
      if (!ws) return null;
      var o = {
        status: ws.status, fileName: ws.fileName || '', fileUrl: ws.fileUrl || '', submittedAt: ws.submittedAt || '',
        updatedAt: ws.updatedAt || '', score: ws.score === '' || ws.score == null ? null : Number(ws.score),
        feedback: ws.feedback || '', reviewedAt: ws.reviewedAt || ''
      };
      if (full) { o.answers = ws.answers || {}; o.autoCheck = ws.autoCheck || {}; }
      return o;
    }
    function studentState(u) {
      var p = progressOf(u.id);
      var st = settings();
      var posts = attemptsOf(u.id, 'post');
      return {
        user: publicUser(u),
        steps: computeSteps(u.id),
        lessons: p.lessons, ar: p.ar, lastRoute: p.lastRoute,
        pre: attemptSummary(lastAttempt(u.id, 'pre')),
        post: attemptSummary(posts.length ? posts[posts.length - 1] : null),
        postAttempts: posts.length,
        postMaxAttempts: Number(st.postMaxAttempts) || 1,
        worksheet: worksheetSummary(get('worksheets', u.id), true),
        survey: get('surveys', u.id) ? { submittedAt: get('surveys', u.id).submittedAt } : null
      };
    }
    function requireStep(u, step, msg) {
      if (!settings().requireSequence) return;
      if (!computeSteps(u.id).done[step]) fail(msg);
    }

    /* ---------- แบบทดสอบ ---------- */
    function gradeTest(kind, answers) {
      var qs = questions(kind);
      if (!qs.length) fail('ยังไม่มีข้อสอบในระบบ');
      if (!answers || answers.length !== qs.length) fail('กรุณาตอบให้ครบทุกข้อก่อนส่ง');
      var score = 0, byTopic = {}, results = [];
      qs.forEach(function (q, i) {
        var a = answers[i];
        if (a === null || a === undefined || a === '' || isNaN(Number(a))) fail('ยังไม่ได้ตอบข้อ ' + (i + 1));
        a = Number(a);
        var ok = a === Number(q.answer);
        if (ok) score++;
        var t = q.topic || 'other';
        byTopic[t] = byTopic[t] || { score: 0, total: 0 };
        byTopic[t].total++; if (ok) byTopic[t].score++;
        results.push({ id: q.id, chosen: a, answer: Number(q.answer), correct: ok });
      });
      return { score: score, total: qs.length, percent: Math.round(score * 1000 / qs.length) / 10, byTopic: byTopic, results: results };
    }

    /* ---------- ตัวจัดการคำสั่ง ---------- */
    var H = {};

    H.ping = function () { return { ok: true, time: iso(env.now()) }; };

    H.publicContent = function () {
      var st = settings();
      return {
        settings: { schoolName: st.schoolName, subject: st.subject, passPercent: st.passPercent, requireSequence: st.requireSequence, postMaxAttempts: st.postMaxAttempts, needClassCode: !!st.classCode, arNote: st.arNote, contact: st.contact },
        lessons: content('lessons'), rocks: content('rocks'), worksheet: content('worksheet'), survey: content('survey'),
        counts: { pre: questions('pre').length, post: questions('post').length }
      };
    };

    H.register = function (p) {
      var st = settings();
      if (st.classCode && str(p.classCode).toUpperCase() !== String(st.classCode).toUpperCase()) fail('รหัสชั้นเรียนไม่ถูกต้อง สอบถามรหัสจากครู');
      if (!str(p.name)) fail('กรุณากรอกชื่อ–นามสกุล');
      if (!str(p.room)) fail('กรุณากรอกห้อง');
      var u = createUser({ id: p.id, name: p.name, room: p.room, no: p.no, password: p.password, role: 'student' });
      return newSession(u);
    };

    H.login = function (p) {
      var u = get('users', normId(p.id));
      if (!u || hashPw(u.salt, String(p.password || '')) !== u.hash) fail('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      return newSession(u);
    };

    H.logout = function (p, token) { if (token && get('sessions', token)) del('sessions', token); return true; };

    H.me = function (p, token) {
      var u = auth(token);
      return u.role === 'student' ? studentState(u) : { user: publicUser(u) };
    };

    H.changePassword = function (p, token) {
      var u = auth(token);
      if (hashPw(u.salt, String(p.oldPassword || '')) !== u.hash) fail('รหัสผ่านเดิมไม่ถูกต้อง');
      if (String(p.newPassword || '').length < 4) fail('รหัสผ่านใหม่ต้องยาวอย่างน้อย 4 ตัวอักษร');
      u.hash = hashPw(u.salt, String(p.newPassword));
      put('users', u);
      return true;
    };

    H.saveProgress = function (p, token) {
      var u = auth(token, 'student');
      var pr = progressOf(u.id), now = iso(env.now());
      if (p.route) pr.lastRoute = str(p.route, 120);
      if (p.lesson && LESSON_TYPES.indexOf(p.lesson.type) >= 0 && LESSON_TABS.indexOf(p.lesson.tab) >= 0) {
        requireStep(u, 'pretest', 'ทำแบบทดสอบก่อนเรียนให้ครบก่อนเริ่มบทเรียน');
        pr.lessons[p.lesson.type] = pr.lessons[p.lesson.type] || {};
        if (!pr.lessons[p.lesson.type][p.lesson.tab]) pr.lessons[p.lesson.type][p.lesson.tab] = now;
      }
      if (p.ar) {
        var id = str(p.ar, 40);
        if (rockCats()[id] && !pr.ar[id]) pr.ar[id] = now;
      }
      pr.updatedAt = now;
      put('progress', pr);
      return studentState(u);
    };

    H.saveDraft = function (p, token) {
      var u = auth(token, 'student');
      if (['pre', 'post'].indexOf(p.kind) < 0) fail('ชนิดแบบทดสอบไม่ถูกต้อง');
      var pr = progressOf(u.id);
      pr.drafts[p.kind] = { answers: (p.answers || []).slice(0, 200), at: iso(env.now()), index: Number(p.index) || 0 };
      pr.updatedAt = iso(env.now());
      put('progress', pr);
      return true;
    };

    H.getTest = function (p, token) {
      var u = auth(token, 'student');
      var kind = p.kind === 'post' ? 'post' : 'pre';
      var st = settings();
      if (kind === 'post') {
        requireStep(u, 'pretest', 'ทำแบบทดสอบก่อนเรียนก่อน');
        requireStep(u, 'worksheet', 'ส่งใบงานทบทวนความรู้ก่อนทำแบบทดสอบหลังเรียน');
      }
      var att = attemptsOf(u.id, kind);
      var max = kind === 'pre' ? 1 : (Number(st.postMaxAttempts) || 1);
      var pr = progressOf(u.id);
      return {
        kind: kind,
        questions: sanitizeQuestions(questions(kind)),
        draft: pr.drafts[kind] || null,
        attempts: att.length, maxAttempts: max, canSubmit: att.length < max,
        last: attemptSummary(att.length ? att[att.length - 1] : null)
      };
    };

    H.submitTest = function (p, token) {
      var u = auth(token, 'student');
      var kind = p.kind === 'post' ? 'post' : 'pre';
      var st = settings();
      if (kind === 'post') {
        requireStep(u, 'pretest', 'ทำแบบทดสอบก่อนเรียนก่อน');
        requireStep(u, 'worksheet', 'ส่งใบงานทบทวนความรู้ก่อนทำแบบทดสอบหลังเรียน');
      }
      var att = attemptsOf(u.id, kind);
      var max = kind === 'pre' ? 1 : (Number(st.postMaxAttempts) || 1);
      if (att.length >= max) fail(kind === 'pre' ? 'ส่งแบบทดสอบก่อนเรียนไปแล้ว' : 'ทำแบบทดสอบหลังเรียนครบจำนวนครั้งแล้ว');
      var g = gradeTest(kind, p.answers);
      var n = att.length + 1;
      put('attempts', {
        id: u.id + ':' + kind + ':' + n, userId: u.id, kind: kind, n: n, score: g.score, total: g.total, percent: g.percent,
        byTopic: g.byTopic, answers: p.answers.map(Number), submittedAt: iso(env.now())
      });
      var pr = progressOf(u.id);
      delete pr.drafts[kind];
      pr.updatedAt = iso(env.now());
      put('progress', pr);
      var out = { score: g.score, total: g.total, percent: g.percent, byTopic: g.byTopic, passed: g.percent >= Number(st.passPercent || 0), state: studentState(u) };
      return out;
    };

    H.review = function (p, token) {
      var u = auth(token, 'student');
      var kind = p.kind === 'pre' ? 'pre' : 'post';
      var a = lastAttempt(u.id, kind);
      if (!a) fail('ยังไม่ได้ส่งแบบทดสอบ');
      if (kind === 'pre' && !lastAttempt(u.id, 'post')) fail('ดูเฉลยแบบทดสอบก่อนเรียนได้หลังทำแบบทดสอบหลังเรียน');
      var qs = questions(kind);
      return {
        attempt: attemptSummary(a, true),
        items: qs.map(function (q, i) {
          return { id: q.id, topic: q.topic, q: q.q, choices: q.choices, answer: Number(q.answer), chosen: a.answers ? Number(a.answers[i]) : null, explain: q.explain || '', review: q.review || '' };
        })
      };
    };

    /* ---------- ใบงาน ---------- */
    function worksheetDef() { return content('worksheet') || { samples: [] }; }
    function cleanWsAnswers(a) {
      a = a || {};
      var out = { rows: {}, questions: {} };
      worksheetDef().samples.forEach(function (s) {
        var r = (a.rows || {})[s.id] || {};
        out.rows[s.id] = { obs: str(r.obs, 600), type: str(r.type, 20), reason: str(r.reason, 1000) };
      });
      (worksheetDef().questions || []).forEach(function (q) {
        out.questions[q.id] = str((a.questions || {})[q.id], 3000);
      });
      return out;
    }
    H.saveWorksheet = function (p, token) {
      var u = auth(token, 'student');
      var ws = get('worksheets', u.id) || { userId: u.id, status: 'draft', answers: {}, autoCheck: {}, fileId: '', fileName: '', fileUrl: '', submittedAt: '', updatedAt: '', score: '', feedback: '', reviewedAt: '' };
      if (ws.status === 'reviewed') fail('ครูตรวจใบงานแล้ว แก้ไขไม่ได้');
      var ans = cleanWsAnswers(p.answers);
      ws.answers = ans;
      ws.updatedAt = iso(env.now());
      if (p.submit) {
        var def = worksheetDef();
        var missing = def.samples.filter(function (s) { var r = ans.rows[s.id]; return !r.obs || !r.type || !r.reason; });
        if (missing.length) fail('กรอกลักษณะที่สังเกต ประเภทหิน และเหตุผลของตัวอย่าง ' + missing.map(function (s) { return s.id; }).join(', ') + ' ให้ครบก่อนส่ง');
        var reqQ = (def.questions || []).filter(function (q) { return q.required !== false && !ans.questions[q.id]; });
        if (reqQ.length) fail('ตอบคำถามท้ายใบงานให้ครบก่อนส่ง');
        var ac = {};
        def.samples.forEach(function (s) { ac[s.id] = s.answer ? ans.rows[s.id].type === s.answer : null; });
        ws.autoCheck = ac;
        ws.status = 'submitted';
        ws.submittedAt = iso(env.now());
      }
      put('worksheets', ws);
      return studentState(u);
    };
    var FILE_TYPES = { 'application/pdf': 'pdf', 'image/jpeg': 'jpg', 'image/png': 'png' };
    H.uploadWorksheetFile = function (p, token) {
      var u = auth(token, 'student');
      if (!FILE_TYPES[p.mime]) fail('แนบได้เฉพาะไฟล์ PDF, JPG หรือ PNG');
      var b64 = String(p.data || '');
      var bytes = Math.floor(b64.length * 3 / 4);
      var max = (Number(settings().maxUploadMB) || 10) * 1048576;
      if (!bytes) fail('ไฟล์ว่างเปล่า');
      if (bytes > max) fail('ไฟล์ใหญ่เกิน ' + (max / 1048576) + ' MB');
      var ws = get('worksheets', u.id) || { userId: u.id, status: 'draft', answers: {}, autoCheck: {}, fileId: '', fileName: '', fileUrl: '', submittedAt: '', updatedAt: '', score: '', feedback: '', reviewedAt: '' };
      if (ws.status === 'reviewed') fail('ครูตรวจใบงานแล้ว แนบไฟล์เพิ่มไม่ได้');
      var name = str(p.name, 120).replace(/[\\/:*?"<>|]/g, '_') || ('worksheet.' + FILE_TYPES[p.mime]);
      var saved = env.saveFile('worksheet', u.id + '_' + name, p.mime, b64, false);
      if (ws.fileId && env.deleteFile) { try { env.deleteFile(ws.fileId); } catch (e) { /* ไฟล์เดิมอาจถูกลบไปแล้ว */ } }
      ws.fileId = saved.id; ws.fileName = name; ws.fileUrl = saved.url; ws.updatedAt = iso(env.now());
      put('worksheets', ws);
      return studentState(u);
    };

    /* ---------- แบบสอบถาม ---------- */
    H.submitSurvey = function (p, token) {
      var u = auth(token, 'student');
      requireStep(u, 'posttest', 'ทำแบบทดสอบหลังเรียนก่อนตอบแบบสอบถาม');
      if (get('surveys', u.id)) fail('ส่งแบบสอบถามไปแล้ว ขอบคุณครับ');
      var items = (content('survey') || {}).items || [];
      var r = p.ratings || [];
      if (r.length !== items.length) fail('กรุณาประเมินให้ครบทุกข้อ');
      var rr = r.map(function (v, i) { v = Number(v); if (!(v >= 1 && v <= 5)) fail('กรุณาประเมินข้อ ' + (i + 1)); return v; });
      var row = { userId: u.id, ratings: rr, comment: str(p.comment, 3000), submittedAt: iso(env.now()) };
      for (var i = 0; i < 8; i++) row['r' + (i + 1)] = rr[i] == null ? '' : rr[i];
      put('surveys', row);
      return studentState(u);
    };

    /* ---------- ครู ---------- */
    H.adminData = function (p, token) {
      auth(token, 'teacher');
      var users = rows('users').filter(function (u) { return u.role === 'student'; });
      var surveys = rows('surveys');
      var sMap = {}; surveys.forEach(function (s) { sMap[s.userId] = s; });
      var students = users.map(function (u) {
        var posts = attemptsOf(u.id, 'post');
        return {
          id: u.id, name: u.name, room: u.room, no: u.no, createdAt: u.createdAt, lastLogin: u.lastLogin,
          steps: computeSteps(u.id),
          pre: attemptSummary(lastAttempt(u.id, 'pre'), true),
          post: attemptSummary(posts.length ? posts[posts.length - 1] : null, true),
          postAttempts: posts.length,
          worksheet: worksheetSummary(get('worksheets', u.id), true),
          survey: sMap[u.id] ? { ratings: sMap[u.id].ratings, comment: sMap[u.id].comment, submittedAt: sMap[u.id].submittedAt } : null
        };
      });
      students.sort(function (a, b) {
        return String(a.room).localeCompare(String(b.room)) || (Number(a.no) || 0) - (Number(b.no) || 0) || String(a.id).localeCompare(String(b.id));
      });
      return { students: students };
    };

    H.adminContent = function (p, token) {
      auth(token, 'teacher');
      var out = {};
      CONTENT_KEYS.forEach(function (k) { out[k] = content(k); });
      out.custom = {};
      rows('content').forEach(function (r) { out.custom[r.key] = r.updatedAt; });
      return out;
    };

    H.saveContent = function (p, token) {
      auth(token, 'teacher');
      if (CONTENT_KEYS.indexOf(p.key) < 0) fail('ไม่รู้จักส่วนเนื้อหานี้');
      if (p.value == null) fail('ไม่มีข้อมูลที่จะบันทึก');
      if (p.key === 'pretest' || p.key === 'posttest') {
        var qs = (p.value.questions || []);
        if (!qs.length) fail('ต้องมีข้อสอบอย่างน้อย 1 ข้อ');
        qs.forEach(function (q, i) {
          if (!str(q.q)) fail('ข้อ ' + (i + 1) + ' ยังไม่มีคำถาม');
          if (!q.choices || q.choices.length < 2 || q.choices.some(function (c) { return !str(c); })) fail('ข้อ ' + (i + 1) + ' ตัวเลือกไม่ครบ');
          if (!(Number(q.answer) >= 0 && Number(q.answer) < q.choices.length)) fail('ข้อ ' + (i + 1) + ' ยังไม่ได้เลือกเฉลย');
          if (!q.id) q.id = p.key.slice(0, 3) + (i + 1);
        });
      }
      put('content', { key: p.key, value: p.value, updatedAt: iso(env.now()) });
      return content(p.key);
    };

    H.resetContent = function (p, token) {
      auth(token, 'teacher');
      if (CONTENT_KEYS.indexOf(p.key) < 0) fail('ไม่รู้จักส่วนเนื้อหานี้');
      del('content', p.key);
      return content(p.key);
    };

    var MEDIA_TYPES = { 'image/jpeg': 1, 'image/png': 1, 'image/webp': 1, 'image/gif': 1 };
    H.uploadMedia = function (p, token) {
      auth(token, 'teacher');
      if (!MEDIA_TYPES[p.mime]) fail('อัปโหลดได้เฉพาะรูปภาพ JPG, PNG, WEBP หรือ GIF');
      var b64 = String(p.data || '');
      if (Math.floor(b64.length * 3 / 4) > 8 * 1048576) fail('รูปภาพใหญ่เกิน 8 MB');
      var saved = env.saveFile('media', str(p.name, 120) || 'image', p.mime, b64, true);
      return { url: saved.url, id: saved.id };
    };

    H.reviewWorksheet = function (p, token) {
      auth(token, 'teacher');
      var ws = get('worksheets', normId(p.userId));
      if (!ws) fail('ไม่พบใบงานของนักเรียนคนนี้');
      var status = p.status === 'returned' ? 'returned' : 'reviewed';
      ws.status = status;
      ws.feedback = str(p.feedback, 3000);
      ws.score = p.score === '' || p.score == null ? '' : Number(p.score);
      ws.reviewedAt = iso(env.now());
      put('worksheets', ws);
      return worksheetSummary(ws, true);
    };

    H.resetPassword = function (p, token) {
      auth(token, 'teacher');
      var u = get('users', normId(p.userId));
      if (!u) fail('ไม่พบบัญชีนี้');
      if (String(p.password || '').length < 4) fail('รหัสผ่านใหม่ต้องยาวอย่างน้อย 4 ตัวอักษร');
      u.hash = hashPw(u.salt, String(p.password));
      put('users', u);
      rows('sessions').filter(function (s) { return s.userId === u.id; }).forEach(function (s) { del('sessions', s.token); });
      return true;
    };

    H.resetAttempt = function (p, token) {
      auth(token, 'teacher');
      var uid = normId(p.userId), kind = p.kind === 'post' ? 'post' : 'pre';
      attemptsOf(uid, kind).forEach(function (a) { del('attempts', a.id); });
      return true;
    };

    H.deleteStudent = function (p, token) {
      auth(token, 'teacher');
      var uid = normId(p.userId);
      var u = get('users', uid);
      if (!u || u.role !== 'student') fail('ไม่พบบัญชีนักเรียนนี้');
      var ws = get('worksheets', uid);
      if (ws && ws.fileId && env.deleteFile) { try { env.deleteFile(ws.fileId); } catch (e) { /* ข้าม */ } }
      ['progress', 'worksheets', 'surveys'].forEach(function (t) { if (get(t, uid)) del(t, uid); });
      rows('attempts').filter(function (a) { return a.userId === uid; }).forEach(function (a) { del('attempts', a.id); });
      rows('sessions').filter(function (s) { return s.userId === uid; }).forEach(function (s) { del('sessions', s.token); });
      del('users', uid);
      return true;
    };

    H.createTeacher = function (p, token) {
      auth(token, 'teacher');
      var u = createUser({ id: p.id, name: p.name, password: p.password, role: 'teacher' });
      return publicUser(u);
    };

    function handle(action, payload, token) {
      try {
        if (!Object.prototype.hasOwnProperty.call(H, action)) fail('ไม่รู้จักคำสั่ง ' + action);
        return { ok: true, data: H[action](payload || {}, token || '') };
      } catch (e) {
        return { ok: false, error: e && e.userFacing ? e.message : ('เกิดข้อผิดพลาดในระบบ: ' + (e && e.message ? e.message : e)) };
      }
    }

    return {
      handle: handle,
      createUser: createUser,
      computeSteps: computeSteps,
      settings: settings
    };
  }

  return { create: create, sha256: sha256, SCHEMA: SCHEMA, CONTENT_KEYS: CONTENT_KEYS, STEP_IDS: STEP_IDS, LESSON_TYPES: LESSON_TYPES, LESSON_TABS: LESSON_TABS };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = RockCore;
