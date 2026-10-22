/*
 * ROCK EXPLORER — ตัวเชื่อมต่อข้อมูล
 * มีเซิร์ฟเวอร์ (API_URL) → ส่งคำสั่งไป Google Apps Script
 * ไม่มีเซิร์ฟเวอร์ → โหมดทดลอง ใช้ RockCore ตัวเดียวกันกับเซิร์ฟเวอร์ เก็บข้อมูลในเบราว์เซอร์
 */
var RockAPI = (function () {
  'use strict';
  var cfg = window.ROCK_CONFIG || {};
  var REMOTE = !!(cfg.API_URL && /^https:\/\//.test(cfg.API_URL));
  var DEMO_KEY = 'rockexplorer.demo.v1';
  var SESSION_KEY = 'rockexplorer.session.v1';
  var mem = {};

  function lsGet(k) { try { var v = window.localStorage.getItem(k); return v == null ? (mem[k] || null) : v; } catch (e) { return mem[k] || null; } }
  function lsSet(k, v) { mem[k] = v; try { window.localStorage.setItem(k, v); } catch (e) { /* ใช้หน่วยความจำแทน */ } }
  function lsDel(k) { delete mem[k]; try { window.localStorage.removeItem(k); } catch (e) { /* ข้าม */ } }

  /* ---------- ที่เก็บข้อมูลโหมดทดลอง ---------- */
  function LocalStore() {
    var db = {};
    try { db = JSON.parse(lsGet(DEMO_KEY) || '{}') || {}; } catch (e) { db = {}; }
    function save() {
      try { lsSet(DEMO_KEY, JSON.stringify(db)); } catch (e) { /* เต็ม */ }
    }
    return {
      rows: function (t) { return (db[t] || []).map(function (r) { return JSON.parse(JSON.stringify(r)); }); },
      put: function (t, row) {
        var k = RockCore.SCHEMA[t].key; db[t] = db[t] || [];
        var c = JSON.parse(JSON.stringify(row));
        for (var i = 0; i < db[t].length; i++) if (String(db[t][i][k]) === String(row[k])) { db[t][i] = c; save(); return; }
        db[t].push(c); save();
      },
      del: function (t, key) {
        var k = RockCore.SCHEMA[t].key;
        db[t] = (db[t] || []).filter(function (r) { return String(r[k]) !== String(key); }); save();
      },
      empty: function () { return !(db.users && db.users.length); }
    };
  }
  function uuid() {
    try { if (window.crypto && crypto.randomUUID) return crypto.randomUUID(); } catch (e) { /* ข้าม */ }
    return Date.now().toString(36) + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  }
  var core = null;
  function demoCore() {
    if (core) return core;
    var store = LocalStore();
    var env = {
      now: function () { return Date.now(); },
      uuid: uuid,
      saveFile: function (kind, name, mime, b64) {
        if (b64.length > 2.8 * 1048576) throw Object.assign(new Error('โหมดทดลองแนบไฟล์ได้ไม่เกิน 2 MB (ระบบจริงรับได้ถึง 10 MB)'), { userFacing: true });
        return { id: 'local-' + uuid(), url: 'data:' + mime + ';base64,' + b64 };
      }
    };
    core = RockCore.create(store, env, window.ROCK_DEFAULT_CONTENT);
    if (store.empty()) seedDemo(core);
    return core;
  }

  /* ข้อมูลตัวอย่างสำหรับสาธิตหน้าจัดการของครู (เฉพาะโหมดทดลอง) */
  function seedDemo(c) {
    c.createUser({ id: 'teacher', name: 'ครูผู้สอน (บัญชีทดลอง)', password: 'teacher1234', role: 'teacher' });
    var C = window.ROCK_DEFAULT_CONTENT;
    var preKey = C.pretest.questions.map(function (q) { return q.answer; });
    var postKey = C.posttest.questions.map(function (q) { return q.answer; });
    function answers(key, nRight) { return key.map(function (a, i) { return i < nRight ? a : (a + 1) % 4; }); }
    var samples = [
      { id: 'demo01', name: 'นักเรียนตัวอย่าง ก', room: '4/1', no: '1', pre: 8, post: 17, ws: true, survey: [5, 4, 5, 4, 5] },
      { id: 'demo02', name: 'นักเรียนตัวอย่าง ข', room: '4/1', no: '2', pre: 11, post: 13, ws: true, survey: null },
      { id: 'demo03', name: 'นักเรียนตัวอย่าง ค', room: '4/2', no: '1', pre: 6, post: null, ws: false, survey: null }
    ];
    samples.forEach(function (s) {
      var tok = c.handle('register', { id: s.id, name: s.name, room: s.room, no: s.no, password: '1234', classCode: C.settings.classCode }).data.token;
      c.handle('submitTest', { kind: 'pre', answers: answers(preKey, s.pre) }, tok);
      RockCore.LESSON_TYPES.forEach(function (t) { RockCore.LESSON_TABS.forEach(function (tab) { c.handle('saveProgress', { lesson: { type: t, tab: tab } }, tok); }); });
      ['granite', 'sandstone', 'marble'].forEach(function (r) { c.handle('saveProgress', { ar: r }, tok); });
      var ws = { rows: { A: { obs: 'เห็นเม็ดผลึกชัด มีสีชมพู ขาว ดำ', type: 'igneous', reason: 'ผลึกหยาบ แสดงว่าเย็นตัวช้าใต้ผิวโลก' }, B: { obs: 'เป็นชั้น ๆ มีเม็ดทราย', type: 'sedimentary', reason: 'เห็นการเรียงชั้นและเม็ดตะกอน' }, C: { obs: 'มีแถบสีอ่อนสลับเข้ม', type: s.id === 'demo02' ? 'igneous' : 'metamorphic', reason: 'แร่เรียงตัวเป็นแนวขนาน' } }, questions: { q1: 'หินอ่อน เพราะขัดเงาได้สวยและมีลวดลาย' } };
      c.handle('saveWorksheet', { answers: ws, submit: s.ws }, tok);
      if (s.post != null) c.handle('submitTest', { kind: 'post', answers: answers(postKey, s.post) }, tok);
      if (s.survey) c.handle('submitSurvey', { ratings: s.survey, comment: 'ชอบการหมุนดูหิน 3 มิติ' }, tok);
    });
  }

  /* ---------- การเข้าสู่ระบบ ---------- */
  var session = null;
  try { session = JSON.parse(lsGet(SESSION_KEY) || 'null'); } catch (e) { session = null; }
  function setSession(s) { session = s; if (s) lsSet(SESSION_KEY, JSON.stringify(s)); else lsDel(SESSION_KEY); }

  function call(action, payload) {
    var token = session && session.token;
    if (!REMOTE) {
      return new Promise(function (resolve, reject) {
        setTimeout(function () {
          var r;
          try { r = demoCore().handle(action, payload, token); } catch (e) { r = { ok: false, error: e.message }; }
          if (r.ok) resolve(r.data); else reject(new Error(r.error));
        }, 60);
      });
    }
    return fetch(cfg.API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: action, payload: payload || {}, token: token || '' })
    }).then(function (res) {
      if (!res.ok) throw new Error('เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ (' + res.status + ')');
      return res.json();
    }, function () {
      throw new Error('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ ตรวจสอบอินเทอร์เน็ตแล้วลองอีกครั้ง');
    }).then(function (r) {
      if (!r || !r.ok) throw new Error((r && r.error) || 'เซิร์ฟเวอร์ตอบกลับผิดรูปแบบ');
      return r.data;
    });
  }

  return {
    remote: REMOTE,
    call: call,
    session: function () { return session; },
    setSession: setSession,
    demoClassCode: function () { try { return REMOTE ? '' : demoCore().settings().classCode; } catch (e) { return ''; } },
    resetDemo: function () { lsDel(DEMO_KEY); lsDel(SESSION_KEY); session = null; core = null; },
    store: { get: lsGet, set: lsSet, del: lsDel }
  };
})();
